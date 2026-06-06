"""Unit tests for `invisible_playwright._geo` (timezone="auto" resolution).

Covers: the precedence policy (resolve_session_timezone), proxy→requests
translation, egress IP discovery (mocked HTTP), and IP→IANA mapping (mocked
mmdb). No real network or mmdb is touched.
"""
import sys
import types

import pytest

from invisible_playwright import _geo
from invisible_playwright._geo import (
    GeoTimezoneError,
    _proxies_for_requests,
    _proxy_is_set,
    discover_egress_ip,
    ip_to_timezone,
    resolve_session_timezone,
)

SOCKS = {"server": "socks5://gw.example:1080", "username": "u", "password": "p"}
HTTP = {"server": "http://gw.example:8080", "username": "u", "password": "p"}


# ──────────────────────────────────────────────────────────────────────
#  _proxy_is_set
# ──────────────────────────────────────────────────────────────────────
@pytest.mark.unit
@pytest.mark.parametrize(
    "proxy,expected",
    [
        (None, False),
        ({}, False),
        ({"server": ""}, False),
        ({"server": "   "}, False),
        ({"server": "direct://"}, False),
        ({"server": "DIRECT://"}, False),
        ({"server": "socks5://h:1"}, True),
        ({"server": "http://h:8080"}, True),
    ],
)
def test_proxy_is_set(proxy, expected):
    assert _proxy_is_set(proxy) is expected


# ──────────────────────────────────────────────────────────────────────
#  _proxies_for_requests — scheme + credential translation
# ──────────────────────────────────────────────────────────────────────
@pytest.mark.unit
def test_proxies_socks5_uses_socks5h_remote_dns():
    out = _proxies_for_requests(SOCKS)
    assert out["http"] == "socks5h://u:p@gw.example:1080"
    assert out["https"] == out["http"]


@pytest.mark.unit
def test_proxies_socks4_scheme():
    out = _proxies_for_requests({"server": "socks4://gw:1080"})
    assert out["http"] == "socks4://gw:1080"


@pytest.mark.unit
def test_proxies_http_and_https_schemes():
    assert _proxies_for_requests(HTTP)["http"] == "http://u:p@gw.example:8080"
    out = _proxies_for_requests({"server": "https://gw:8443"})
    assert out["https"] == "https://gw:8443"


@pytest.mark.unit
def test_proxies_no_scheme_defaults_to_http():
    out = _proxies_for_requests({"server": "gw.example:3128"})
    assert out["http"] == "http://gw.example:3128"


@pytest.mark.unit
def test_proxies_credentials_are_url_encoded():
    out = _proxies_for_requests(
        {"server": "socks5://gw:1080", "username": "user@x", "password": "p:w/d"}
    )
    # '@', ':' and '/' in creds must be percent-encoded so they don't break
    # the proxy URL parsing.
    assert "user%40x:p%3Aw%2Fd@gw:1080" in out["http"]


@pytest.mark.unit
def test_proxies_no_credentials_has_no_auth_prefix():
    out = _proxies_for_requests({"server": "socks5://gw:1080"})
    assert out["http"] == "socks5h://gw:1080"


# ──────────────────────────────────────────────────────────────────────
#  discover_egress_ip — mocked requests
# ──────────────────────────────────────────────────────────────────────
class _FakeResp:
    def __init__(self, text, status=200):
        self.text = text
        self._status = status

    def raise_for_status(self):
        if self._status >= 400:
            raise RuntimeError(f"HTTP {self._status}")


@pytest.mark.unit
def test_discover_egress_ip_first_endpoint_wins(monkeypatch):
    calls = []

    def fake_get(url, **kw):
        calls.append(url)
        return _FakeResp("203.0.113.7\n")

    monkeypatch.setattr(_geo.requests, "get", fake_get)
    assert discover_egress_ip(SOCKS) == "203.0.113.7"
    assert len(calls) == 1  # stopped at the first success


@pytest.mark.unit
def test_discover_egress_ip_falls_through_to_next_on_error(monkeypatch):
    seq = iter([_FakeResp("junk-not-an-ip"), _FakeResp("198.51.100.42")])

    def fake_get(url, **kw):
        return next(seq)

    monkeypatch.setattr(_geo.requests, "get", fake_get)
    assert discover_egress_ip(HTTP) == "198.51.100.42"


@pytest.mark.unit
def test_discover_egress_ip_all_fail_raises(monkeypatch):
    def fake_get(url, **kw):
        raise OSError("connection refused")

    monkeypatch.setattr(_geo.requests, "get", fake_get)
    with pytest.raises(GeoTimezoneError):
        discover_egress_ip(SOCKS)


# ──────────────────────────────────────────────────────────────────────
#  ip_to_timezone — mocked mmdb reader
# ──────────────────────────────────────────────────────────────────────
class _FakeReader:
    def __init__(self, record):
        self._record = record

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False

    def get(self, ip):
        return self._record


def _install_fake_maxminddb(monkeypatch, record):
    mod = types.ModuleType("maxminddb")
    mod.open_database = lambda path: _FakeReader(record)
    monkeypatch.setitem(sys.modules, "maxminddb", mod)


@pytest.mark.unit
def test_ip_to_timezone_reads_location_time_zone(monkeypatch):
    _install_fake_maxminddb(monkeypatch, {"location": {"time_zone": "Europe/Rome"}})
    assert ip_to_timezone("1.2.3.4", "x.mmdb") == "Europe/Rome"


@pytest.mark.unit
def test_ip_to_timezone_ip_absent_raises(monkeypatch):
    _install_fake_maxminddb(monkeypatch, None)
    with pytest.raises(GeoTimezoneError):
        ip_to_timezone("1.2.3.4", "x.mmdb")


@pytest.mark.unit
def test_ip_to_timezone_missing_zone_raises(monkeypatch):
    _install_fake_maxminddb(monkeypatch, {"location": {}})
    with pytest.raises(GeoTimezoneError):
        ip_to_timezone("1.2.3.4", "x.mmdb")


@pytest.mark.unit
def test_ip_to_timezone_invalid_iana_raises(monkeypatch):
    _install_fake_maxminddb(monkeypatch, {"location": {"time_zone": "Not/AZone"}})
    with pytest.raises(GeoTimezoneError):
        ip_to_timezone("1.2.3.4", "x.mmdb")


# ──────────────────────────────────────────────────────────────────────
#  resolve_session_timezone — the precedence policy
# ──────────────────────────────────────────────────────────────────────
@pytest.fixture
def stub_egress(monkeypatch):
    """Make egress resolution deterministic + offline; record if it ran."""
    state = {"called": False}

    def fake_discover(proxy, **kw):
        state["called"] = True
        return "203.0.113.7"

    monkeypatch.setattr(_geo, "discover_egress_ip", fake_discover)
    monkeypatch.setattr(_geo, "ip_to_timezone", lambda ip, mmdb: "America/New_York")
    # ensure_geoip_mmdb is imported from .download at call time
    import invisible_playwright.download as dl

    monkeypatch.setattr(dl, "ensure_geoip_mmdb", lambda *a, **k: "fake.mmdb")
    return state


@pytest.mark.unit
@pytest.mark.parametrize("sentinel", ["host", "local", "HOST", "Local"])
def test_resolve_host_sentinel_forces_host_tz(sentinel, stub_egress):
    # Even with a proxy set, "host"/"local" force the host TZ and never resolve.
    assert resolve_session_timezone(sentinel, SOCKS) == ""
    assert stub_egress["called"] is False


@pytest.mark.unit
def test_resolve_explicit_iana_wins_over_proxy(stub_egress):
    assert resolve_session_timezone("Asia/Tokyo", SOCKS) == "Asia/Tokyo"
    assert stub_egress["called"] is False  # no resolution when explicit


@pytest.mark.unit
def test_resolve_empty_no_proxy_is_host(stub_egress):
    assert resolve_session_timezone("", None) == ""
    assert stub_egress["called"] is False


@pytest.mark.unit
def test_resolve_auto_no_proxy_is_host(stub_egress):
    assert resolve_session_timezone("auto", None) == ""
    assert stub_egress["called"] is False


@pytest.mark.unit
def test_resolve_empty_with_proxy_defaults_to_auto(stub_egress):
    # NEW default: a proxy with no timezone auto-resolves from the egress.
    assert resolve_session_timezone("", SOCKS) == "America/New_York"
    assert stub_egress["called"] is True


@pytest.mark.unit
def test_resolve_auto_with_proxy_resolves(stub_egress):
    assert resolve_session_timezone("auto", HTTP) == "America/New_York"
    assert stub_egress["called"] is True


@pytest.mark.unit
def test_resolve_direct_proxy_treated_as_no_proxy(stub_egress):
    assert resolve_session_timezone("auto", {"server": "direct://"}) == ""
    assert stub_egress["called"] is False


@pytest.mark.unit
def test_resolve_fail_early_propagates(monkeypatch):
    # With a proxy set, a discovery failure must raise — never silent host TZ.
    def boom(proxy, **kw):
        raise GeoTimezoneError("no egress")

    monkeypatch.setattr(_geo, "discover_egress_ip", boom)
    with pytest.raises(GeoTimezoneError):
        resolve_session_timezone("auto", SOCKS)
