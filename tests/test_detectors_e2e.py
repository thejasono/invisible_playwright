"""E2E: run the REAL open-source detectors against the patched binary, on CI.

Instead of our own hand-rolled signal checks, this loads the actual detection
libraries and uses their FULL API surface:

  * BotD (@fingerprintjs/botd, MIT) — the client-side bot detector that
    FingerprintJS Pro itself uses. We assert the aggregate verdict
    (``detect().bot == False``) AND every one of its ~18 individual detectors
    (``getDetections()``) returns ``bot == False``. The per-detector view is
    why we could delete our hand-rolled ``test_botd_*`` mirrors — the real
    library now covers each detector, with the same granularity.
  * FingerprintJS open-source (MIT) — ``get()`` must return a ``visitorId``
    that is STABLE across two fresh launches with the same seed (an
    over-randomized spoof drifts), and a RICH component set (the fingerprint
    surface is real, not a stub).

Everything is hermetic: the libraries are vendored (tests/vendor/) and served
from a localhost HTTP server — no external CDN call (Firefox tracking-protection
blocks the CDN anyway) and no IP/network dependency. Runs identically on a dev
box and on a GitHub runner.

NOT covered: FingerprintJS *Pro* (commercial, server-side, IP/residential
analysis) — can't be self-hosted, stays the local realness gate.
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
    const botd = await Botd.load();          // load() collects internally
    const verdict = botd.detect();           // {{bot:false}} | {{bot:true,botKind}}
    const raw = botd.getDetections() || {{}}; // per-detector verdicts
    const detections = {{}};
    for (const k in raw) detections[k] = {{ bot: raw[k].bot, botKind: raw[k].botKind || null }};
    window.__botd = {{ bot: verdict.bot, botKind: verdict.botKind || null, detections }};
  }} catch (e) {{ window.__err += " botd:" + e; }}
  try {{
    const fp = await FingerprintJS.load();
    const r = await fp.get();
    const keys = Object.keys(r.components || {{}});
    const errored = keys.filter(k => r.components[k] && "error" in r.components[k]);
    window.__fp = {{ visitorId: r.visitorId, componentKeys: keys, erroredComponents: errored }};
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
    """Launch the binary, load the page, return (botd, fp, err)."""
    with InvisiblePlaywright(seed=42, binary_path=firefox_binary) as browser:
        page = browser.new_page()
        page.goto(url, wait_until="load", timeout=45000)
        page.wait_for_function(
            "() => document.getElementById('state').textContent === 'done'",
            timeout=45000,
        )
        botd = page.evaluate("() => window.__botd")
        fp = page.evaluate("() => window.__fp")
        err = page.evaluate("() => window.__err")
    return botd, fp, err


@pytest.mark.e2e
def test_botd_no_detector_flags_automation(firefox_binary, detector_site):
    """The real BotD must not flag the build — aggregate AND every one of its
    individual detectors (webDriver/userAgent/appVersion/plugins/process/... ).
    """
    botd, _fp, err = _run_detectors(firefox_binary, detector_site.url)
    assert botd is not None, f"BotD produced no result (err:{err!r})"
    assert botd.get("bot") is False, (
        f"BotD aggregate flagged a bot: botKind={botd.get('botKind')!r}"
    )
    detections = botd.get("detections") or {}
    assert detections, f"BotD getDetections() returned nothing (err:{err!r})"
    flagged = {k: v.get("botKind") for k, v in detections.items() if v.get("bot")}
    assert not flagged, f"BotD individual detectors flagged automation: {flagged}"


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


@pytest.mark.e2e
def test_fingerprintjs_collects_rich_fingerprint(firefox_binary, detector_site):
    """FingerprintJS must collect a RICH component surface (a real browser
    exposes many signals; a stripped/blocked surface is itself suspicious).
    We don't assert zero errored components (some are legitimately unsupported
    per browser), only that the surface is substantial and the id computed."""
    _b, fp, err = _run_detectors(firefox_binary, detector_site.url)
    assert fp and fp.get("visitorId"), f"FingerprintJS produced no id (err:{err!r})"
    keys = fp.get("componentKeys") or []
    assert len(keys) >= 15, (
        f"FingerprintJS collected only {len(keys)} components — surface too thin "
        f"(suppressed signals are themselves a tell): {keys}"
    )
