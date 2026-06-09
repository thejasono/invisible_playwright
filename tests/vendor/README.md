# Vendored detection libraries (test-only)

These are upstream, unmodified, MIT-licensed browser-fingerprinting / bot-detection
libraries, vendored so the detector e2e tests run **hermetically and identically**
on a dev box and on a GitHub runner (no external CDN at test time — Firefox
tracking-protection blocks the openfpcdn.io CDN anyway, and we want CI offline).

They are served from a localhost HTTP server and loaded into the patched Firefox;
the tests assert the REAL detectors don't flag the stealth build (BotD: `bot===false`)
and that the fingerprint is stable (FingerprintJS: same `visitorId` across launches).

| File | Package | Version | Source | License |
|---|---|---|---|---|
| `botd-2.0.0.esm.js` | `@fingerprintjs/botd` | 2.0.0 | https://cdn.jsdelivr.net/npm/@fingerprintjs/botd@2.0.0/dist/botd.esm.js | MIT |
| `fingerprintjs-5.2.0.umd.min.js` | `@fingerprintjs/fingerprintjs` | 5.2.0 | https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@5.2.0/dist/fp.umd.min.js | MIT |

Both are MIT (Copyright © FingerprintJS, Inc.). To update: download the pinned
dist from jsdelivr, drop it here, and bump the version in the filename + this table.
