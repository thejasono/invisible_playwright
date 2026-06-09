"""E2E: run the REAL open-source detectors against the patched binary, on CI.

Instead of our own hand-rolled signal checks, this loads the actual detection
libraries and asserts the stealth build isn't flagged:

  * BotD (@fingerprintjs/botd, MIT) — the client-side bot detector that
    FingerprintJS Pro itself uses. `detect()` must return ``bot == False``
    (no automation/headless tell).
  * FingerprintJS open-source (MIT) — `get().visitorId` must be present and
    STABLE across two fresh launches with the same seed (an over-randomized
    spoof would drift; a real browser is stable).

Everything is hermetic: the libraries are vendored (tests/vendor/) and served
from a localhost HTTP server, so there is no external CDN call (Firefox
tracking-protection blocks the CDN anyway) and no IP/network dependency. It runs
identically on a dev box and on a GitHub runner.

NOT covered here: FingerprintJS *Pro* (commercial, server-side, IP/residential
analysis) — that can't be self-hosted and stays the local/self-hosted realness
gate. CreepJS's full trust score needs its closed backend; only its client-side
signals are reachable offline.
"""
from __future__ import annotations

import http.server
import socketserver
import threading
from pathlib import Path

import pytest

from invisible_playwright import InvisiblePlaywright

_VENDOR = Path(__file__).parent / "vendor"
_BOTD = "botd-2.0.0.esm.js"
_FPJS = "fingerprintjs-5.2.0.umd.min.js"

_PAGE = f"""<!doctype html><html><head><meta charset="utf-8">
<title>detectors</title>
<script src="/{_FPJS}"></script>
</head><body><h1 id="state">loading</h1>
<script type="module">
window.__botd = null; window.__fp = null; window.__err = "";
(async () => {{
  try {{
    const Botd = await import("/{_BOTD}");
    const botd = await Botd.load();
    window.__botd = botd.detect();                 // {{bot:false}} | {{bot:true,botKind}}
  }} catch (e) {{ window.__err += " botd:" + e; }}
  try {{
    const fp = await FingerprintJS.load();
    const r = await fp.get();
    window.__fp = {{ visitorId: r.visitorId }};
  }} catch (e) {{ window.__err += " fp:" + e; }}
  document.getElementById("state").textContent = "done";
}})();
</script></body></html>"""


class _DetectorSite:
    """Localhost server: `/` → the page; `/<lib>` → the vendored bundle."""

    def __init__(self):
        page = _PAGE.encode()
        vendor = _VENDOR

        class H(http.server.BaseHTTPRequestHandler):
            def do_GET(self):  # noqa: N802
                if self.path == "/" or self.path.startswith("/?"):
                    body, ctype = page, "text/html; charset=utf-8"
                else:
                    f = vendor / Path(self.path.lstrip("/")).name
                    if not f.is_file():
                        self.send_error(404); return
                    body = f.read_bytes()
                    ctype = "text/javascript; charset=utf-8"
                self.send_response(200)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *a):
                pass

        self._srv = socketserver.TCPServer(("127.0.0.1", 0), H)
        self.port = self._srv.server_address[1]
        threading.Thread(target=self._srv.serve_forever, daemon=True).start()

    @property
    def url(self):
        return f"http://127.0.0.1:{self.port}/"

    def close(self):
        self._srv.shutdown()


@pytest.fixture(scope="module")
def detector_site():
    s = _DetectorSite()
    yield s
    s.close()


def _run_detectors(firefox_binary, url):
    """Launch the binary, load the page, return (botd_result, fp_result, err)."""
    with InvisiblePlaywright(seed=42, binary_path=firefox_binary) as browser:
        page = browser.new_page()
        page.goto(url, wait_until="load", timeout=45000)
        # The detectors run async; wait until both finished (or errored).
        page.wait_for_function(
            "() => document.getElementById('state').textContent === 'done'",
            timeout=45000,
        )
        botd = page.evaluate("() => window.__botd")
        fp = page.evaluate("() => window.__fp")
        err = page.evaluate("() => window.__err")
    return botd, fp, err


@pytest.mark.e2e
def test_botd_does_not_flag_automation(firefox_binary, detector_site):
    """The real BotD detector must NOT flag the stealth build as a bot."""
    botd, _fp, err = _run_detectors(firefox_binary, detector_site.url)
    assert botd is not None, f"BotD did not produce a result (err:{err!r})"
    assert botd.get("bot") is False, (
        f"BotD flagged the build as a bot: {botd!r} "
        f"(botKind={botd.get('botKind')!r})"
    )


@pytest.mark.e2e
def test_fingerprintjs_visitorid_stable_across_launches(firefox_binary, detector_site):
    """FingerprintJS visitorId must be present and identical across two fresh
    launches with the same seed — a real browser is stable; an over-randomized
    spoof drifts (and a drifting fingerprint is itself a bot tell)."""
    _b1, fp1, err1 = _run_detectors(firefox_binary, detector_site.url)
    _b2, fp2, err2 = _run_detectors(firefox_binary, detector_site.url)
    assert fp1 and fp1.get("visitorId"), f"no visitorId on run 1 (err:{err1!r})"
    assert fp2 and fp2.get("visitorId"), f"no visitorId on run 2 (err:{err2!r})"
    assert fp1["visitorId"] == fp2["visitorId"], (
        f"FingerprintJS visitorId drifted across launches: "
        f"{fp1['visitorId']!r} != {fp2['visitorId']!r} (per-session entropy = bot tell)"
    )
