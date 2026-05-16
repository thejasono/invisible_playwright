"""configure_proxy behaviour — SOCKS goes into prefs, HTTP into Playwright kwargs."""
import pytest

from invisible_playwright._proxy import configure_proxy


def test_none_proxy_returns_none_and_leaves_prefs():
    prefs = {}
    assert configure_proxy(None, prefs) is None
    assert prefs == {}


def test_empty_dict_returns_none():
    prefs = {}
    assert configure_proxy({}, prefs) is None
    assert prefs == {}


def test_direct_scheme_returns_none():
    prefs = {}
    out = configure_proxy({"server": "direct://"}, prefs)
    assert out is None
    assert prefs == {}


def test_socks5_writes_prefs_and_returns_none():
    prefs = {}
    out = configure_proxy(
        {"server": "socks5://gw.example.com:1080", "username": "u", "password": "p"},
        prefs,
    )
    assert out is None
    assert prefs["network.proxy.type"] == 1
    assert prefs["network.proxy.socks"] == "gw.example.com"
    assert prefs["network.proxy.socks_port"] == 1080
    assert prefs["network.proxy.socks_version"] == 5
    assert prefs["network.proxy.socks_username"] == "u"
    assert prefs["network.proxy.socks_password"] == "p"
    assert prefs["network.proxy.socks_remote_dns"] is True


def test_socks4_sets_version_4():
    prefs = {}
    configure_proxy({"server": "socks4://gw:1080"}, prefs)
    assert prefs["network.proxy.socks_version"] == 4


def test_socks_without_auth_uses_empty_strings():
    prefs = {}
    configure_proxy({"server": "socks5://gw:1080"}, prefs)
    assert prefs["network.proxy.socks_username"] == ""
    assert prefs["network.proxy.socks_password"] == ""


def test_http_proxy_passes_through_to_playwright():
    prefs = {}
    proxy = {"server": "http://gw.example.com:8080", "username": "u", "password": "p"}
    out = configure_proxy(proxy, prefs)
    assert out is proxy
    assert prefs == {}


def test_https_proxy_passes_through():
    prefs = {}
    out = configure_proxy({"server": "https://gw:8443"}, prefs)
    assert out is not None
    assert prefs == {}


def test_malformed_socks_url_drops_silently():
    prefs = {}
    out = configure_proxy({"server": "socks5://no-port-here"}, prefs)
    assert out is None
    assert prefs == {}


@pytest.mark.parametrize("scheme", ["socks5://", "SOCKS5://", "Socks5://"])
def test_socks_scheme_is_case_insensitive(scheme):
    prefs = {}
    configure_proxy({"server": f"{scheme}gw:1080"}, prefs)
    assert prefs["network.proxy.socks"] == "gw"
