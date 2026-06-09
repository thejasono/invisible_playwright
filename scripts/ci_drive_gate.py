#!/usr/bin/env python3
"""CI drive gate — the firefox-N catcher.

A raw `firefox --screenshot` proves nothing about automation: a juggler-less
binary renders a screenshot just fine and ships broken (firefox-8 did exactly
that). This DRIVES the binary the way users will — Playwright launches it over
the juggler pipe and exercises the input/DOM paths real callers depend on.

It deliberately covers the failure modes that HISTORICALLY shipped green:
  - juggler missing entirely      → TargetClosedError on launch (firefox-8)
  - mouse/keyboard input broken   → click/move/type assertions (firefox-2 #9:
                                     jugglerSendMouseEvent / synthesizeMouseEvent)
  - canvas non-deterministic      → identical draw → identical dataURL (stealth
                                     seed must be per-session, not per-readback)
  - headless navigator tells      → navigator.webdriver falsy, languages
                                     non-empty, plugins is a real PluginArray

All of this is headless, NO screenshot → GPU-free (can't false-fail on the
GPU-less hosted runners), and fully offline → safe in public CI. WebGL
determinism is intentionally NOT checked here (it needs SWGL and can false-fail
headless); it lives in the local proxy realness gate.

NOT covered here on purpose:
  - Cross-origin iframe (issue #20): a same-origin srcdoc/data iframe is a weak
    proxy for it AND races Juggler's frame tracking (the frame re-navigates, its
    id changes → "Frame was detached" ~1-in-8). The faithful #20 sentinel is
    `tests/test_cross_origin_iframe.py` (e2e, two localhost origins); wire that
    as its own gate job rather than a fragile in-gate check.

Robustness (learned the hard way): the page is a SIMPLE
`goto("data:text/html,...")` with NO subframe. `set_content` throws "The
operation is insecure" on this build (its document.write is rejected), and a
nested `data:`/srcdoc iframe races the evaluates → intermittent "execution
context destroyed by navigation" / "Frame was detached".

Usage:  python ci_drive_gate.py /path/to/firefox[.exe | .app/Contents/MacOS/firefox]
Exit 0 + "DRIVE GATE OK ..." on success; non-zero with a reason on failure.
"""
from __future__ import annotations

import sys

from playwright.sync_api import sync_playwright

# Simple, subframe-free data: URL — proven stable across runners.
PAGE = (
    "data:text/html,"
    "<title>dt</title>"
    "<h1 id=x>hello-drive</h1>"
    "<button id=b onclick=\"window.__clicked=1\">go</button>"
    "<input id=inp>"
)

# Identical 2D draw, evaluated twice in one session. The stealth canvas spoof is
# seeded per-session (see fingerprint-consistency rule), so two identical draws
# MUST produce byte-identical output. Per-readback noise → instant bot flag.
CANVAS_DRAW = (
    "() => {const c=document.createElement('canvas');c.width=c.height=16;"
    "const g=c.getContext('2d');g.fillStyle='#08f';g.fillRect(0,0,16,16);"
    "g.fillStyle='#f40';g.fillText('s',2,12);return c.toDataURL();}"
)


def main(exe: str) -> int:
    with sync_playwright() as p:
        browser = p.firefox.launch(executable_path=exe, headless=True)
        page = browser.new_page()
        page.goto(PAGE)  # default wait_until="load"; no subframe → settles cleanly
        # Attach the mousemove counter explicitly (don't depend on inline-script timing).
        page.evaluate("window.__moves = 0; window.addEventListener('mousemove', () => { window.__moves++; })")

        ua = page.evaluate("navigator.userAgent")
        webdriver = page.evaluate("navigator.webdriver")
        text = page.evaluate("() => document.getElementById('x').textContent")

        # firefox-2 / issue-#9 catcher: real mouse + keyboard over juggler.
        page.wait_for_selector("#b")
        page.mouse.move(20, 20)
        page.mouse.move(120, 90)          # exercises synthesizeMouseEvent path
        page.click("#b")                  # mousedown/up/click → onclick fires
        page.click("#inp")
        page.keyboard.type("ok")
        clicked = page.evaluate("window.__clicked")
        moves = page.evaluate("window.__moves")
        typed = page.evaluate("() => document.getElementById('inp').value")

        # stealth-determinism catcher: identical draw → identical dataURL.
        canvas_a = page.evaluate(CANVAS_DRAW)
        canvas_b = page.evaluate(CANVAS_DRAW)

        # BotD navigator-surface tells (proxy-free subset).
        langs = page.evaluate("navigator.languages.length")
        plugins = page.evaluate("navigator.plugins instanceof PluginArray")

        browser.close()

    assert "Firefox" in ua, f"unexpected UA (binary not driving correctly): {ua!r}"
    assert text == "hello-drive", f"DOM/JS roundtrip failed: {text!r}"
    assert not webdriver, f"navigator.webdriver leaked True (stealth regression): {webdriver!r}"
    assert clicked == 1, "page.click() did not fire onclick — mouse-event synthesis broken (firefox-2 class)"
    assert moves >= 1, "page.mouse.move() produced no mousemove — jugglerSendMouseEvent regression"
    assert typed == "ok", f"page.keyboard.type() failed: {typed!r}"
    assert canvas_a == canvas_b, "canvas non-deterministic across identical draws (stealth seed broken → bot tell)"
    assert langs and langs > 0, "navigator.languages empty (headless tell)"
    assert plugins, "navigator.plugins is not a PluginArray (headless tell)"

    print(
        f"DRIVE GATE OK | UA={ua} | webdriver={webdriver} | "
        f"click+mousemove+keyboard+canvas-determinism+navsurface=ok"
    )
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: ci_drive_gate.py <path-to-firefox-binary>", file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
