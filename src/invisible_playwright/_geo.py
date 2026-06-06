"""Resolve the session timezone from the proxy egress IP (``timezone="auto"``).

Approach B: discover the egress IP with one HTTP request routed *through the
configured proxy*, then map IP → IANA timezone with an offline mmdb
(``daijro/geoip-all-in-one``, downloaded + cached by ``download.py``).

Precedence (see ``resolve_session_timezone``):

    "host" / "local"   → ""        force host TZ (escape hatch)
    explicit IANA      → unchanged  explicit always wins
    "" + no proxy      → ""        host TZ (default, unchanged behaviour)
    "" + proxy         → egress    NEW default: a proxy with no timezone is
                                   exactly the timezone_mismatch trap, so we
                                   auto-resolve it.
    "auto" + no proxy  → ""        nothing to resolve, fall back to host TZ
    "auto" + proxy     → egress

When a proxy IS set we fail loudly rather than silently fall back to the host
TZ — a foreign proxy paired with the host timezone is the precise signal
detectors flag as ``timezone_mismatch``.
"""
from __future__ import annotations

import ipaddress
from typing import Any, Dict, Optional
from urllib.parse import quote

import requests


class GeoTimezoneError(RuntimeError):
    """Raised when ``timezone="auto"`` cannot resolve a valid IANA zone."""


# Plain-text IP echo endpoints (each returns just the caller's public IP).
_IP_ECHO_ENDPOINTS = (
    "https://api.ipify.org",
    "https://icanhazip.com",
    "https://checkip.amazonaws.com",
)

_SOCKS_SCHEMES = ("socks5://", "socks4://", "socks://")


def _proxy_is_set(proxy: Optional[Dict[str, str]]) -> bool:
    if not proxy:
        return False
    server = (proxy.get("server") or "").strip()
    return bool(server) and server.lower() != "direct://"


def _proxies_for_requests(proxy: Dict[str, str]) -> Dict[str, str]:
    """Translate our proxy dict into a ``requests`` proxies mapping.

    SOCKS5 uses the ``socks5h`` scheme so DNS is resolved proxy-side (matches
    ``network.proxy.socks_remote_dns=True`` in the Firefox path). HTTP/HTTPS
    pass through unchanged. Credentials are URL-encoded.
    """
    server = (proxy.get("server") or "").strip()
    low = server.lower()
    if low.startswith("socks5://") or low.startswith("socks://"):
        scheme = "socks5h"
    elif low.startswith("socks4://"):
        scheme = "socks4"
    elif low.startswith("https://"):
        scheme = "https"
    else:
        scheme = "http"

    host_port = server.split("://", 1)[1] if "://" in server else server
    user = proxy.get("username") or ""
    pwd = proxy.get("password") or ""
    if user:
        auth = f"{quote(user, safe='')}:{quote(pwd, safe='')}@"
    else:
        auth = ""
    url = f"{scheme}://{auth}{host_port}"
    return {"http": url, "https": url}


def discover_egress_ip(
    proxy: Dict[str, str], *, timeout: float = 10.0
) -> str:
    """Return the public IP seen when routing through ``proxy``.

    Tries each echo endpoint in turn; raises :class:`GeoTimezoneError` if none
    return a valid IP (SOCKS support requires ``requests[socks]`` / PySocks).
    """
    proxies = _proxies_for_requests(proxy)
    last_err: Optional[Exception] = None
    for url in _IP_ECHO_ENDPOINTS:
        try:
            resp = requests.get(url, proxies=proxies, timeout=timeout)
            resp.raise_for_status()
            ip = resp.text.strip()
            ipaddress.ip_address(ip)  # validate (raises ValueError if not an IP)
            return ip
        except Exception as exc:  # noqa: BLE001 - try the next endpoint
            last_err = exc
            continue
    raise GeoTimezoneError(
        f"could not discover the proxy egress IP via {len(_IP_ECHO_ENDPOINTS)} "
        f"endpoints (last error: {last_err!r}). For SOCKS proxies make sure "
        f"requests[socks] / PySocks is installed."
    )


def ip_to_timezone(ip: str, mmdb_path: Any) -> str:
    """Map ``ip`` to its IANA timezone using the offline mmdb.

    Reads the standard MaxMind ``location.time_zone`` field and validates it
    against the system tz database. Raises :class:`GeoTimezoneError` if the IP
    is absent from the DB or the zone is missing / not a valid IANA name.
    """
    import maxminddb

    with maxminddb.open_database(str(mmdb_path)) as reader:
        record = reader.get(ip)
    if not record:
        raise GeoTimezoneError(f"egress IP {ip} not present in the geoip database")
    tz = ((record.get("location") or {}) if isinstance(record, dict) else {}).get(
        "time_zone"
    )
    if not tz:
        raise GeoTimezoneError(f"no timezone for egress IP {ip} in the geoip database")
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

    try:
        ZoneInfo(tz)
    except (ZoneInfoNotFoundError, ValueError) as exc:
        raise GeoTimezoneError(
            f"geoip returned an invalid IANA zone {tz!r} for {ip}: {exc}"
        ) from exc
    return tz


def resolve_session_timezone(
    timezone: str, proxy: Optional[Dict[str, str]]
) -> str:
    """Map the user's ``timezone`` setting to a concrete IANA zone (or ``""``).

    See the module docstring for the full precedence table. Raises
    :class:`GeoTimezoneError` when a proxy is set but the egress timezone
    cannot be resolved (fail-early — never silently use the host TZ behind a
    foreign proxy).
    """
    tz = (timezone or "").strip()
    if tz.lower() in ("host", "local"):
        return ""
    if tz and tz.lower() != "auto":
        return tz  # explicit IANA wins
    if not _proxy_is_set(proxy):
        return ""  # "" / "auto" without a proxy → host TZ
    # proxy set, tz is "" (new default) or "auto" → resolve from egress.
    assert proxy is not None
    from .download import ensure_geoip_mmdb

    ip = discover_egress_ip(proxy)
    mmdb = ensure_geoip_mmdb()
    return ip_to_timezone(ip, mmdb)
