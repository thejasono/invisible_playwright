# invisible_playwright

[![tests](https://github.com/feder-cr/invisible_playwright/actions/workflows/tests.yml/badge.svg)](https://github.com/feder-cr/invisible_playwright/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Firefox 150.0.1](https://img.shields.io/badge/firefox-150.0.1-orange.svg)](https://www.mozilla.org/firefox/)
[![GitHub release](https://img.shields.io/github/v/release/feder-cr/invisible_playwright.svg)](https://github.com/feder-cr/invisible_playwright/releases)
[![GitHub stars](https://img.shields.io/github/stars/feder-cr/invisible_playwright.svg?style=social)](https://github.com/feder-cr/invisible_playwright/stargazers)
[![browser launches](https://img.shields.io/github/downloads/feder-cr/invisible_firefox/usage-counter/total?label=browser%20launches&color=blue)](https://github.com/feder-cr/invisible_firefox/releases/tag/usage-counter)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Federico%20Elia-0A66C2?logo=linkedin&logoColor=white)](https://it.linkedin.com/in/federico-elia-5199951b6)

**Stealth Firefox that passes every bot detection test. Drop-in Playwright replacement, fingerprint patched at the C++ level, not a JavaScript shim.**

![invisible_playwright - 5/5 detection suites passed](docs/screenshots/hero.gif)


## How it works


**Most other anti-detect browsers patch Chromium at the JavaScript level** - they override `navigator`, `WebGLRenderingContext.getParameter`, canvas APIs, and so on via injected scripts. This has two fatal problems:

1. **JS patches are detectable.** Anti-bots enumerate native function `.toString()`, check descriptor configurability, compare property enumeration order, watch for prototype mutations. Every patch leaves a fingerprint of its own. CreepJS has an entire battery of "lies detectors" built around this.
2. **Chromium itself is now suspect.** Forks can’t fully match Chrome: it ships closed-source components (Widevine, proprietary codecs, Safe Browsing) that flip detectable JS flags and network signals, and forks lag Chrome’s release cadence, leaving version-specific tells detectors lock onto.

**invisible_playwright patches Firefox at the C++ level.** The spoofed values come back through normal Gecko paths - no JS shim, no override, no `Object.defineProperty`. From the page's point of view, the browser is just telling the truth. It spoofs all the layers that matter: Navigator, screen, GPU/WebGL, Canvas, fonts, audio, WebRTC, timezone, DevTools, SOCKS5. See [feder-cr/invisible_firefox](https://github.com/feder-cr/invisible_firefox) for the full per-layer breakdown.

**The one thing the browser can't fix: the IP you come from.** A C++-perfect fingerprint still looks wrong behind a burned proxy, and around 99% of proxies out there are public and widely shared, so the strictest anti-bot setups flag those IPs on sight. The browser side is solved here; for the other 1%, clean residential IPs that aren't already burned, we partner with [sx.org](https://sx.org/?c=invisible_playwright).


---

## How it compares

| | invisible_playwright | Camoufox | CloakBrowser | Multilogin |
|---|---|---|---|---|
| Engine | Firefox 150 | Firefox (~1 year old base) | Chromium | Chromium fork | 
| Patch depth | C++ source | C++ source | C++ source  | JS overrides | 
| Maintenance | Active | Gap (~1 year) | Active | Active SaaS | 
| Open source | ✅ MIT | ✅ MPL | ❌ Closed source | ❌ Closed source | 
| `.toString()` clean | ✅ | ✅ | ✅ | ❌ Detectable shims | 
| Canvas / WebGL / Audio | ✅ C++ | ⚠️ Drift vs current FF | ✅ C++ | ⚠️ JS override |
| SOCKS5 auth | ✅ Patched | ❌ | ⚠️ Playwright proxy | ⚠️ Varies | 
| **reCAPTCHA v3 score** | **0.90** | ~0.3-0.5 | ~0.3-0.5 | ~0.3-0.6 | 
| FP Pro - bot detected | ✅ Not detected | ❌ Detected | ❌ Detected | ❌ Detected | 
| CreepJS lies | ✅ 0 | ❌ Multiple | ✅ 0 | ❌ Multiple | 
| Cost | Free | Free | Free | From $99/mo | 

---

## Install

```bash
pip install git+https://github.com/feder-cr/invisible_playwright.git
python -m invisible_playwright fetch      # one-time ~100 MB download, SHA256-verified
```

Supported platforms: **Windows x86_64**, **Linux x86_64 / arm64**, **macOS arm64 / x86_64**. On macOS the app is ad-hoc signed (not notarized): if Gatekeeper complains, clear the quarantine flag once with `xattr -dr com.apple.quarantine` on the cached `Firefox.app`.

---

## Usage
### Random fingerprint per session
**100% Playwright-compatible** - sync and async, all methods, zero API changes. If you already use Playwright, switching is two lines:

```diff
- from playwright.sync_api import sync_playwright
- with sync_playwright() as p:
-     browser = p.firefox.launch()
+ from invisible_playwright import InvisiblePlaywright
+ with InvisiblePlaywright() as browser:
```

Every session gets a distinct fingerprint (GPU, audio, fonts, screen, ~400 fields) and Bezier-curve mouse motion.

**Sync**
```python
from invisible_playwright import InvisiblePlaywright

with InvisiblePlaywright(proxy={"server": "socks5://...", "username": "u", "password": "p"}) as browser:
    page = browser.new_page()
    page.goto("https://example.com")
    page.click("#submit")   # mouse arcs to the button on a Bezier curve
```

**Async**
```python
from invisible_playwright.async_api import InvisiblePlaywright

async with InvisiblePlaywright(proxy={"server": "socks5://...", "username": "u", "password": "p"}) as browser:
    page = await browser.new_page()
    await page.goto("https://example.com")
    await page.click("#submit")
```

The `browser` object is a `playwright.sync_api.Browser` / `playwright.async_api.Browser` - every Playwright method works as-is.

Log the seed to replay a run:

```python
sf = InvisiblePlaywright()
with sf as browser:
    print("seed =", sf.seed)
    # ...
```

### Reproducible fingerprint

```python
with InvisiblePlaywright(seed=42) as browser:
    ...   # same GPU, same canvas hash, same audio context, every run
```

### Proxies

```python
proxy = {
    "server": "socks5://gate.example.com:1080",
    "username": "user",
    "password": "pass",
}
with InvisiblePlaywright(proxy=proxy) as browser:
    ...
```

Schemes supported: `socks5`, `socks4`, `http`, `https`. DNS is routed through the proxy by default, no local leak.

For a clean residential pool that isn't already flagged, we use our partner [sx.org](https://sx.org/?c=invisible_playwright).

### Timezone

The browser timezone follows `timezone=`:

```python
# default: timezone is auto-derived from the egress IP (proxy egress if a
# proxy is set, otherwise the host's own public IP)
with InvisiblePlaywright(proxy=proxy) as browser:
    ...

# explicit IANA zone always wins, the only way to force a specific zone
with InvisiblePlaywright(proxy=proxy, timezone="America/New_York") as browser:
    ...
```

### Pinning specific fingerprint fields

By default everything comes from `seed`. To force specific values while the rest stays seed-derived:

```python
with InvisiblePlaywright(
    seed=42,
    pin={
        "gpu.renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11)",
        "gpu.vendor":   "Google Inc. (NVIDIA)",
        "screen.width":  2560,
        "screen.height": 1440,
        "hardware.concurrency": 16,
    },
) as browser:
    ...
```

Full list of pinnable keys, how pinning interacts with the Bayesian sampler, and common patterns are in **[docs/pinning.md](docs/pinning.md)**.

---

## CLI

```bash
invisible_playwright fetch          # download the binary if missing
invisible_playwright fetch --force  # re-download even if cached
invisible_playwright path           # print the absolute path to the cached binary
invisible_playwright version        # wrapper and binary versions
invisible_playwright clear-cache    # remove all cached binaries
```

## Related projects

Related projects that cover similar ground:

- **[arkenfox/user.js](https://github.com/arkenfox/user.js)** - Firefox privacy hardening via prefs. invisible_playwright patches C++ where prefs are insufficient.
- **[LibreWolf](https://librewolf.net)** - Firefox fork with privacy defaults. LibreWolf ships a configured binary; invisible_playwright ships source patches + automation wrapper.
- **[Camoufox](https://github.com/daijro/camoufox)** - open-source anti-detect Firefox. Patches a wider surface and ships its own fingerprint database; invisible_playwright uses a Bayesian sampler.

---

## License

MIT - see [LICENSE](LICENSE). The patched Firefox binary is distributed under the MPL-2.0 (Firefox upstream license). The C++ patches against mozilla-central that produce that binary are at [feder-cr/invisible_firefox](https://github.com/feder-cr/invisible_firefox).

---

## Disclaimer

This project is for educational purposes only. It is provided as-is, with no warranties. I take no responsibility for how it is used. Use it at your own risk and in compliance with the laws of your jurisdiction.
