function ie() {
  return navigator.webdriver;
}
function ae() {
  return navigator.userAgent;
}
function oe() {
  return navigator.platform;
}
const l = "ERROR", r = "INIT", s = "NA", v = "SKIPPED", h = "high", S = "low", se = "medium";
function f(t) {
  let e = 0;
  for (let n = 0, i = t.length; n < i; n++) {
    let a = t.charCodeAt(n);
    e = (e << 5) - e + a, e |= 0;
  }
  return e.toString(16).padStart(8, "0");
}
function d(t, e) {
  for (const n in t)
    t[n] = e;
}
function ce() {
  return navigator.buildID === "20181001000000";
}
function le() {
  try {
    let t = !1;
    const e = Error.prepareStackTrace;
    Error.prepareStackTrace = function() {
      return t = !0, e;
    };
    const n = new Error("");
    return console.log(n), t;
  } catch {
    return l;
  }
}
function ue() {
  const t = {
    vendor: r,
    renderer: r
  };
  if (ce())
    return d(t, s), t;
  try {
    var e = document.createElement("canvas"), n = e.getContext("webgl") || e.getContext("experimental-webgl");
    n.getSupportedExtensions().indexOf("WEBGL_debug_renderer_info") >= 0 ? (t.vendor = n.getParameter(n.getExtension("WEBGL_debug_renderer_info").UNMASKED_VENDOR_WEBGL), t.renderer = n.getParameter(n.getExtension("WEBGL_debug_renderer_info").UNMASKED_RENDERER_WEBGL)) : d(t, s);
  } catch {
    d(t, l);
  }
  return t;
}
function de() {
  return "__pwInitScripts" in window || "__playwright__binding__" in window;
}
function ge() {
  return navigator.hardwareConcurrency || s;
}
function he() {
  const t = [], e = 0.123456789;
  return ["E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2"].forEach(function(a) {
    try {
      t.push(Math[a]);
    } catch {
      t.push(-1);
    }
  }), ["tan", "sin", "exp", "atan", "acosh", "asinh", "atanh", "expm1", "log1p", "sinh"].forEach(function(a) {
    try {
      t.push(Math[a](e));
    } catch {
      t.push(-1);
    }
  }), "sumPrecise" in Math ? t.push(Math.sumPrecise([1e20, 0.1, -1e20])) : t.push(-1), f(t.map(String).join(","));
}
function me() {
  return navigator.deviceMemory || s;
}
function pe() {
  return eval.toString().length;
}
function fe() {
  const t = {
    timezone: r,
    localeLanguage: r
  };
  try {
    if (typeof Intl < "u" && typeof Intl.DateTimeFormat < "u") {
      const e = Intl.DateTimeFormat().resolvedOptions();
      t.timezone = e.timeZone, t.localeLanguage = e.locale;
    } else
      t.timezone = s, t.localeLanguage = s;
  } catch {
    t.timezone = l, t.localeLanguage = l;
  }
  return t;
}
function ve() {
  return {
    width: window.screen.width,
    height: window.screen.height,
    pixelDepth: window.screen.pixelDepth,
    colorDepth: window.screen.colorDepth,
    availableWidth: window.screen.availWidth,
    availableHeight: window.screen.availHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    hasMultipleDisplays: typeof screen.isExtended < "u" ? screen.isExtended : s
  };
}
function ye() {
  return {
    languages: navigator.languages,
    language: navigator.language
  };
}
async function we() {
  const t = {
    vendor: r,
    architecture: r,
    device: r,
    description: r
  };
  if ("gpu" in navigator)
    try {
      const e = await navigator.gpu.requestAdapter();
      e && (t.vendor = e.info.vendor, t.architecture = e.info.architecture, t.device = e.info.device, t.description = e.info.description);
    } catch {
      d(t, l);
    }
  else
    d(t, s);
  return t;
}
function be() {
  const t = [
    "__driver_evaluate",
    "__webdriver_evaluate",
    "__selenium_evaluate",
    "__fxdriver_evaluate",
    "__driver_unwrapped",
    "__webdriver_unwrapped",
    "__selenium_unwrapped",
    "__fxdriver_unwrapped",
    "_Selenium_IDE_Recorder",
    "_selenium",
    "calledSelenium",
    "$cdc_asdjflasutopfhvcZLmcfl_",
    "$chrome_asyncScriptInfo",
    "__$webdriverAsyncExecutor",
    "webdriver",
    "__webdriverFunc",
    "domAutomation",
    "domAutomationController",
    "__lastWatirAlert",
    "__lastWatirConfirm",
    "__lastWatirPrompt",
    "__webdriver_script_fn",
    "_WEBDRIVER_ELEM_CACHE"
  ];
  let e = !1;
  for (let n = 0; n < t.length; n++)
    if (t[n] in window) {
      e = !0;
      break;
    }
  return e = e || !!document.__webdriver_script_fn || !!window.domAutomation || !!window.domAutomationController, e;
}
function Se() {
  try {
    const t = "webdriver", e = window.navigator;
    if (!e[t] && !e.hasOwnProperty(t)) {
      e[t] = 1;
      const n = e[t] === 1;
      return delete e[t], n;
    }
    return !0;
  } catch {
    return !1;
  }
}
async function Ce() {
  const t = window.navigator, e = {
    architecture: r,
    bitness: r,
    brands: r,
    mobile: r,
    model: r,
    platform: r,
    platformVersion: r,
    uaFullVersion: r
  };
  if ("userAgentData" in t)
    try {
      const n = await t.userAgentData.getHighEntropyValues([
        "architecture",
        "bitness",
        "brands",
        "mobile",
        "model",
        "platform",
        "platformVersion",
        "uaFullVersion"
      ]);
      e.architecture = n.architecture, e.bitness = n.bitness, e.brands = n.brands, e.mobile = n.mobile, e.model = n.model, e.platform = n.platform, e.platformVersion = n.platformVersion, e.uaFullVersion = n.uaFullVersion;
    } catch {
      d(e, l);
    }
  else
    d(e, s);
  return e;
}
function Ae() {
  if (!navigator.plugins) return !1;
  const t = typeof navigator.plugins.toString == "function" ? navigator.plugins.toString() : navigator.plugins.constructor && typeof navigator.plugins.constructor.toString == "function" ? navigator.plugins.constructor.toString() : typeof navigator.plugins;
  return t === "[object PluginArray]" || t === "[object MSPluginsCollection]" || t === "[object HTMLPluginsCollection]";
}
function Pe() {
  if (!navigator.plugins) return s;
  const t = [];
  for (let e = 0; e < navigator.plugins.length; e++)
    t.push(navigator.plugins[e].name);
  return f(t.join(","));
}
function ke() {
  return navigator.plugins ? navigator.plugins.length : s;
}
function Me() {
  if (!navigator.plugins) return s;
  try {
    return navigator.plugins[0] === navigator.plugins[0][0].enabledPlugin;
  } catch {
    return l;
  }
}
function xe() {
  if (!navigator.plugins) return s;
  try {
    return navigator.plugins.item(4294967296) !== navigator.plugins[0];
  } catch {
    return l;
  }
}
function We() {
  const t = {
    isValidPluginArray: r,
    pluginCount: r,
    pluginNamesHash: r,
    pluginConsistency1: r,
    pluginOverflow: r
  };
  try {
    t.isValidPluginArray = Ae(), t.pluginCount = ke(), t.pluginNamesHash = Pe(), t.pluginConsistency1 = Me(), t.pluginOverflow = xe();
  } catch {
    d(t, l);
  }
  return t;
}
async function Ee() {
  return new Promise(async function(t) {
    var e = {
      audiooutput: 0,
      audioinput: 0,
      videoinput: 0
    };
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const a = await navigator.mediaDevices.enumerateDevices();
      if (typeof a < "u") {
        for (var n = 0; n < a.length; n++) {
          var i = a[n].kind;
          e[i] = e[i] + 1;
        }
        return t({
          speakers: e.audiooutput,
          microphones: e.audioinput,
          webcams: e.videoinput
        });
      } else
        return d(e, s), t(e);
    } else
      return d(e, s), t(e);
  });
}
function De() {
  const t = {
    webdriver: r,
    userAgent: r,
    platform: r,
    memory: r,
    cpuCount: r,
    language: r
  }, e = document.createElement("iframe");
  let n = !1;
  try {
    e.style.display = "none", e.src = "about:blank", document.body.appendChild(e), n = !0;
    const i = e.contentWindow?.navigator;
    t.webdriver = i.webdriver ?? !1, t.userAgent = i.userAgent ?? s, t.platform = i.platform ?? s, t.memory = i.deviceMemory ?? s, t.cpuCount = i.hardwareConcurrency ?? s, t.language = i.language ?? s;
  } catch {
    d(t, l);
  } finally {
    if (n)
      try {
        document.body.removeChild(e);
      } catch {
      }
  }
  return t;
}
async function _e() {
  return new Promise((t) => {
    const e = {
      vendor: r,
      renderer: r,
      userAgent: r,
      language: r,
      platform: r,
      memory: r,
      cpuCount: r
    };
    let n = null, i = null, a = null;
    const g = () => {
      a && clearTimeout(a), n && n.terminate(), i && URL.revokeObjectURL(i);
    };
    try {
      const p = `var fingerprintWorker = {
                userAgent: 'NA',
                language: 'NA',
                cpuCount: 'NA',
                platform: 'NA',
                memory: 'NA',
                vendor: 'NA',
                renderer: 'NA'
            };
            try {
                fingerprintWorker.userAgent = navigator.userAgent;
                fingerprintWorker.language = navigator.language;
                fingerprintWorker.cpuCount = navigator.hardwareConcurrency;
                fingerprintWorker.platform = navigator.platform;
                if (typeof navigator.deviceMemory !== 'undefined') {
                    fingerprintWorker.memory = navigator.deviceMemory;
                }

                try {
                    if (typeof OffscreenCanvas === 'undefined') {
                        fingerprintWorker.vendor = 'NA';
                        fingerprintWorker.renderer = 'NA';
                    } else {
                        var canvas = new OffscreenCanvas(1, 1);
                        var gl = canvas.getContext('webgl');
                        var isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
                        if (gl && !isFirefox) {
                            var glExt = gl.getExtension('WEBGL_debug_renderer_info');
                            if (glExt) {
                                fingerprintWorker.vendor = gl.getParameter(glExt.UNMASKED_VENDOR_WEBGL);
                                fingerprintWorker.renderer = gl.getParameter(glExt.UNMASKED_RENDERER_WEBGL);
                            } else {
                                fingerprintWorker.vendor = 'NA';
                                fingerprintWorker.renderer = 'NA';
                            }
                        } else {
                            fingerprintWorker.vendor = 'NA';
                            fingerprintWorker.renderer = 'NA';
                        }
                    }
                } catch (_) {
                    fingerprintWorker.vendor = 'ERROR';
                    fingerprintWorker.renderer = 'ERROR';
                }
                self.postMessage(fingerprintWorker);
            } catch (e) {
                self.postMessage(fingerprintWorker);
            }`, y = new Blob([p], { type: "application/javascript" });
      i = URL.createObjectURL(y), n = new Worker(i), a = window.setTimeout(() => {
        g(), d(e, l), t(e);
      }, 2e3), n.onmessage = function(o) {
        try {
          const m = (w) => typeof w > "u" ? s : w;
          e.vendor = m(o.data.vendor), e.renderer = m(o.data.renderer), e.userAgent = m(o.data.userAgent), e.language = m(o.data.language), e.platform = m(o.data.platform), e.memory = m(o.data.memory), e.cpuCount = m(o.data.cpuCount);
        } catch {
          d(e, l);
        } finally {
          g(), t(e);
        }
      }, n.onerror = function() {
        g(), d(e, l), t(e);
      };
    } catch {
      g(), d(e, l), t(e);
    }
  });
}
function Re() {
  const t = {
    toSourceError: r,
    hasToSource: !1
  };
  try {
    null.usdfsh;
  } catch (e) {
    t.toSourceError = e.toString();
  }
  try {
    throw "xyz";
  } catch (e) {
    try {
      e.toSource(), t.hasToSource = !0;
    } catch {
      t.hasToSource = !1;
    }
  }
  return t;
}
const C = [
  'audio/mp4; codecs="mp4a.40.2"',
  "audio/mpeg;",
  'audio/webm; codecs="vorbis"',
  'audio/ogg; codecs="vorbis"',
  'audio/wav; codecs="1"',
  'audio/ogg; codecs="speex"',
  'audio/ogg; codecs="flac"',
  'audio/3gpp; codecs="samr"'
], A = [
  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
  'video/mp4; codecs="avc1.42E01E"',
  'video/mp4; codecs="avc1.58A01E"',
  'video/mp4; codecs="avc1.4D401E"',
  'video/mp4; codecs="avc1.64001E"',
  'video/mp4; codecs="mp4v.20.8"',
  'video/mp4; codecs="mp4v.20.240"',
  'video/webm; codecs="vp8"',
  'video/ogg; codecs="theora"',
  'video/ogg; codecs="dirac"',
  'video/3gpp; codecs="mp4v.20.8"',
  'video/x-matroska; codecs="theora"'
];
function P(t, e) {
  const n = {};
  try {
    const i = document.createElement(e);
    for (const a of t)
      try {
        n[a] = i.canPlayType(a) || null;
      } catch {
        n[a] = null;
      }
  } catch {
    for (const i of t)
      n[i] = null;
  }
  return n;
}
function k(t) {
  const e = {}, n = window.MediaSource;
  if (!n || typeof n.isTypeSupported != "function") {
    for (const i of t)
      e[i] = null;
    return e;
  }
  for (const i of t)
    try {
      e[i] = n.isTypeSupported(i);
    } catch {
      e[i] = null;
    }
  return e;
}
function M(t) {
  try {
    const e = window.RTCRtpReceiver;
    if (e && typeof e.getCapabilities == "function") {
      const n = e.getCapabilities(t);
      return f(JSON.stringify(n));
    }
    return s;
  } catch {
    return l;
  }
}
function Ie() {
  const t = {
    audioCanPlayTypeHash: s,
    videoCanPlayTypeHash: s,
    audioMediaSourceHash: s,
    videoMediaSourceHash: s,
    rtcAudioCapabilitiesHash: s,
    rtcVideoCapabilitiesHash: s,
    hasMediaSource: !1
  };
  try {
    t.hasMediaSource = !!window.MediaSource;
    const e = P(C, "audio"), n = P(A, "video");
    t.audioCanPlayTypeHash = f(JSON.stringify(e)), t.videoCanPlayTypeHash = f(JSON.stringify(n));
    const i = k(C), a = k(A);
    t.audioMediaSourceHash = f(JSON.stringify(i)), t.videoMediaSourceHash = f(JSON.stringify(a)), t.rtcAudioCapabilitiesHash = M("audio"), t.rtcVideoCapabilitiesHash = M("video");
  } catch {
    d(t, l);
  }
  return t;
}
async function Le() {
  return new Promise((t) => {
    try {
      const e = new Image(), n = document.createElement("canvas").getContext("2d");
      e.onload = () => {
        n.drawImage(e, 0, 0), t(n.getImageData(0, 0, 1, 1).data.filter((i) => i === 0).length != 4);
      }, e.onerror = () => {
        t(l);
      }, e.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=";
    } catch {
      t(l);
    }
  });
}
function Te() {
  var t = document.createElement("canvas");
  t.width = 400, t.height = 200, t.style.display = "inline";
  var e = t.getContext("2d");
  try {
    return e.rect(0, 0, 10, 10), e.rect(2, 2, 6, 6), e.textBaseline = "alphabetic", e.fillStyle = "#f60", e.fillRect(125, 1, 62, 20), e.fillStyle = "#069", e.font = "11pt no-real-font-123", e.fillText("Cwm fjordbank glyphs vext quiz, 😃", 2, 15), e.fillStyle = "rgba(102, 204, 0, 0.2)", e.font = "18pt Arial", e.fillText("Cwm fjordbank glyphs vext quiz, 😃", 4, 45), e.globalCompositeOperation = "multiply", e.fillStyle = "rgb(255,0,255)", e.beginPath(), e.arc(50, 50, 50, 0, 2 * Math.PI, !0), e.closePath(), e.fill(), e.fillStyle = "rgb(0,255,255)", e.beginPath(), e.arc(100, 50, 50, 0, 2 * Math.PI, !0), e.closePath(), e.fill(), e.fillStyle = "rgb(255,255,0)", e.beginPath(), e.arc(75, 100, 50, 0, 2 * Math.PI, !0), e.closePath(), e.fill(), e.fillStyle = "rgb(255,0,255)", e.arc(75, 75, 75, 0, 2 * Math.PI, !0), e.arc(75, 75, 25, 0, 2 * Math.PI, !0), e.fill("evenodd"), f(t.toDataURL());
  } catch {
    return l;
  }
}
async function Oe() {
  const t = {
    hasModifiedCanvas: r,
    canvasFingerprint: r
  };
  return t.hasModifiedCanvas = await Le(), t.canvasFingerprint = Te(), t;
}
function He() {
  const t = ["deviceMemory", "hardwareConcurrency", "language", "languages", "platform"], e = [];
  for (const n of t) {
    const i = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(navigator), n);
    i && i.value ? e.push("1") : e.push("0");
  }
  return e.join("");
}
function ze() {
  return Math.random().toString(36).substring(2, 15);
}
function Ue() {
  return (/* @__PURE__ */ new Date()).getTime();
}
function Ne() {
  return window.location.href;
}
function x(t, e) {
  const n = t.signals;
  return e === "iframe" ? n.contexts.iframe.webdriver !== n.automation.webdriver || n.contexts.iframe.userAgent !== n.browser.userAgent || n.contexts.iframe.platform !== n.device.platform || n.contexts.iframe.memory !== n.device.memory || n.contexts.iframe.cpuCount !== n.device.cpuCount : n.contexts.webWorker.webdriver !== n.automation.webdriver || n.contexts.webWorker.userAgent !== n.browser.userAgent || n.contexts.webWorker.platform !== n.device.platform || n.contexts.webWorker.memory !== n.device.memory || n.contexts.webWorker.cpuCount !== n.device.cpuCount;
}
function Fe() {
  const t = {
    bitmask: r,
    extensions: []
  }, e = document.body.hasAttribute("data-gr-ext-installed"), n = typeof window.ethereum < "u", i = document.getElementById("coupon-birds-drop-div") !== null, a = document.querySelector("deepl-input-controller") !== null, g = document.getElementById("monica-content-root") !== null, p = document.querySelector("chatgpt-sidebar") !== null, y = typeof window.__REQUESTLY__ < "u", o = Array.from(document.querySelectorAll("*")).filter((m) => m.tagName.toLowerCase().startsWith("veepn-")).length > 0;
  return t.bitmask = [
    e ? "1" : "0",
    n ? "1" : "0",
    i ? "1" : "0",
    a ? "1" : "0",
    g ? "1" : "0",
    p ? "1" : "0",
    y ? "1" : "0",
    o ? "1" : "0"
  ].join(""), e && t.extensions.push("grammarly"), n && t.extensions.push("metamask"), i && t.extensions.push("coupon-birds"), a && t.extensions.push("deepl"), g && t.extensions.push("monica-ai"), p && t.extensions.push("sider-ai"), y && t.extensions.push("requestly"), o && t.extensions.push("veepn"), t;
}
function c(t) {
  try {
    return t();
  } catch {
    return !1;
  }
}
function Ge() {
  const t = {
    bitmask: r,
    chrome: c(() => "chrome" in window),
    brave: c(() => "brave" in navigator),
    applePaySupport: c(() => "ApplePaySetup" in window),
    opera: c(() => typeof window.opr < "u" || typeof window.onoperadetachedviewchange == "object"),
    serial: c(() => window.navigator.serial !== void 0),
    attachShadow: c(() => !!Element.prototype.attachShadow),
    caches: c(() => !!window.caches),
    webAssembly: c(() => !!window.WebAssembly && !!window.WebAssembly.instantiate),
    buffer: c(() => "Buffer" in window),
    showModalDialog: c(() => "showModalDialog" in window),
    safari: c(() => "safari" in window),
    webkitPrefixedFunction: c(() => "webkitCancelAnimationFrame" in window),
    mozPrefixedFunction: c(() => "mozGetUserMedia" in navigator),
    usb: c(() => typeof window.USB == "function"),
    browserCapture: c(() => typeof window.BrowserCaptureMediaStreamTrack == "function"),
    paymentRequestUpdateEvent: c(() => typeof window.PaymentRequestUpdateEvent == "function"),
    pressureObserver: c(() => typeof window.PressureObserver == "function"),
    audioSession: c(() => "audioSession" in navigator),
    selectAudioOutput: c(() => typeof navigator < "u" && typeof navigator.mediaDevices < "u" && typeof navigator.mediaDevices.selectAudioOutput == "function"),
    barcodeDetector: c(() => "BarcodeDetector" in window),
    battery: c(() => "getBattery" in navigator),
    devicePosture: c(() => "DevicePosture" in window),
    documentPictureInPicture: c(() => "documentPictureInPicture" in window),
    eyeDropper: c(() => "EyeDropper" in window),
    editContext: c(() => "EditContext" in window),
    fencedFrame: c(() => "FencedFrameConfig" in window),
    sanitizer: c(() => "Sanitizer" in window),
    otpCredential: c(() => "OTPCredential" in window),
    sumPrecise: c(() => "sumPrecise" in Math)
  }, e = Object.keys(t).filter((n) => n !== "bitmask").map((n) => t[n] ? "1" : "0").join("");
  return t.bitmask = e, t;
}
function Ve() {
  const t = {
    prefersColorScheme: r,
    prefersReducedMotion: r,
    prefersReducedTransparency: r,
    colorGamut: r,
    pointer: r,
    anyPointer: r,
    hover: r,
    anyHover: r,
    colorDepth: r
  };
  try {
    window.matchMedia("(prefers-color-scheme: dark)").matches ? t.prefersColorScheme = "dark" : window.matchMedia("(prefers-color-scheme: light)").matches ? t.prefersColorScheme = "light" : t.prefersColorScheme = null, t.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches, t.prefersReducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches, window.matchMedia("(color-gamut: rec2020)").matches ? t.colorGamut = "rec2020" : window.matchMedia("(color-gamut: p3)").matches ? t.colorGamut = "p3" : window.matchMedia("(color-gamut: srgb)").matches ? t.colorGamut = "srgb" : t.colorGamut = null, window.matchMedia("(pointer: fine)").matches ? t.pointer = "fine" : window.matchMedia("(pointer: coarse)").matches ? t.pointer = "coarse" : window.matchMedia("(pointer: none)").matches ? t.pointer = "none" : t.pointer = null, window.matchMedia("(any-pointer: fine)").matches ? t.anyPointer = "fine" : window.matchMedia("(any-pointer: coarse)").matches ? t.anyPointer = "coarse" : window.matchMedia("(any-pointer: none)").matches ? t.anyPointer = "none" : t.anyPointer = null, t.hover = window.matchMedia("(hover: hover)").matches, t.anyHover = window.matchMedia("(any-hover: hover)").matches;
    let e = 0;
    for (let n = 0; n <= 16; n++)
      window.matchMedia(`(color: ${n})`).matches && (e = n);
    t.colorDepth = e;
  } catch {
    d(t, l);
  }
  return t;
}
async function Be() {
  const t = {
    layout: r,
    layoutSize: r
  };
  if ("keyboard" in navigator && typeof navigator.keyboard.getLayoutMap < "u")
    try {
      const e = await navigator.keyboard.getLayoutMap();
      t.layout = Array.from(
        e.entries()
      ).map(([n, i]) => `${n},${i}`).join(" "), t.layoutSize = e.size;
    } catch {
      d(t, l);
    }
  else
    d(t, s);
  return t;
}
async function je() {
  const t = {
    summarizerAvailability: r,
    summarizerLanguageAvailability: r
  };
  if ("Summarizer" in window)
    try {
      t.summarizerAvailability = await window.Summarizer.availability(), t.summarizerLanguageAvailability = await window.Summarizer.availability({
        expectedInputLanguages: [navigator.language]
      });
    } catch {
      d(t, l);
    }
  else
    d(t, s);
  return t;
}
function $e(t) {
  const e = t.signals.device.screenResolution;
  return e.width === 800 && e.height === 600 || e.availableWidth === 800 && e.availableHeight === 600 || e.innerWidth === 800 && e.innerHeight === 600;
}
function Qe(t) {
  return t.signals.automation.webdriver === !0;
}
function qe(t) {
  return !!t.signals.automation.selenium;
}
function Ke(t) {
  return t.signals.automation.cdp === !0;
}
function Je(t) {
  return t.signals.automation.playwright === !0;
}
function Ye(t) {
  return typeof t.signals.device.memory != "number" ? !1 : t.signals.device.memory > 32 || t.signals.device.memory < 0.25;
}
function Ze(t) {
  return typeof t.signals.device.cpuCount != "number" ? !1 : t.signals.device.cpuCount > 70;
}
function Xe(t) {
  return t.includes("Android") || t.includes("iPhone") || t.includes("iPod") || t.includes("iPad");
}
function et(t) {
  const e = t.signals.browser.userAgent;
  return typeof e != "string" || !e.includes("Chrome") || Xe(e) ? !1 : t.signals.browser.features.chrome === !1;
}
function tt(t) {
  return t.signals.contexts.iframe.webdriver === !0;
}
function rt(t) {
  return t.signals.contexts.webWorker.webdriver === !0;
}
function b(t) {
  return typeof t != "string" || t.length === 0 ? !0 : t === s || t === l || t === v || t === r;
}
function nt(t) {
  const e = t.signals.contexts.webWorker, n = t.signals.graphics.webGL;
  return b(n.vendor) || b(n.renderer) || b(e.vendor) || b(e.renderer) ? !1 : e.vendor !== n.vendor || e.renderer !== n.renderer;
}
function it(t, e) {
  const n = t.includes("iPad"), i = e.includes("iPad");
  if (n === i)
    return !1;
  const a = (g) => g === "MacIntel" || g === "MacPPC";
  return a(t) || a(e);
}
function at(t) {
  if (t.signals.contexts.webWorker.platform === s || t.signals.contexts.webWorker.platform === l || t.signals.contexts.webWorker.platform === v)
    return !1;
  const e = t.signals.device.platform, n = t.signals.contexts.webWorker.platform;
  return !(e === n || it(e, n));
}
function ot(t) {
  return t.signals.contexts.iframe.platform === s || t.signals.contexts.iframe.platform === l ? !1 : t.signals.device.platform !== t.signals.contexts.iframe.platform;
}
function st(t) {
  return t.signals.automation.webdriverWritable === !0;
}
function ct(t) {
  return t.signals.graphics.webGL.renderer.includes("SwiftShader");
}
function lt(t) {
  return t.signals.locale.internationalization.timezone === "UTC";
}
function ut(t) {
  const e = t.signals.locale.languages.languages, n = t.signals.locale.languages.language;
  return n && e && Array.isArray(e) && e.length > 0 ? e[0] !== n : !1;
}
function dt(t) {
  return !!(t.signals.browser.features.chrome && t.signals.browser.etsl !== 33 || t.signals.browser.features.safari && t.signals.browser.etsl !== 37 || t.signals.browser.userAgent.includes("Firefox") && t.signals.browser.etsl !== 37);
}
function gt(t) {
  return [
    t.signals.browser.userAgent,
    t.signals.contexts.iframe.userAgent,
    t.signals.contexts.webWorker.userAgent
  ].some((n) => /bot|headless/i.test(n.toLowerCase()));
}
function ht(t) {
  const e = t.signals.graphics.webgpu, n = t.signals.graphics.webGL, i = t.signals.browser.userAgent;
  return !!((n.vendor.includes("Apple") || n.renderer.includes("Apple")) && !i.includes("Mac") || e.vendor.includes("apple") && !i.includes("Mac") || e.vendor.includes("apple") && !n.renderer.includes("Apple"));
}
function mt(t) {
  const e = t.signals.device.platform, n = t.signals.browser.userAgent, i = t.signals.browser.highEntropyValues.platform;
  return !!(n.includes("Mac") && (e.includes("Win") || e.includes("Linux")) || n.includes("Windows") && (e.includes("Mac") || e.includes("Linux")) || n.includes("Linux") && (e.includes("Mac") || e.includes("Win")) || i !== l && i !== s && (i.includes("Mac") && (e.includes("Win") || e.includes("Linux")) || i.includes("Windows") && (e.includes("Mac") || e.includes("Linux")) || i.includes("Linux") && (e.includes("Mac") || e.includes("Win"))));
}
async function pt(t, e) {
  const n = new TextEncoder().encode(e), i = new TextEncoder().encode(t), a = new Uint8Array(i.length);
  for (let p = 0; p < i.length; p++)
    a[p] = i[p] ^ n[p % n.length];
  const g = String.fromCharCode(...a);
  return btoa(g);
}
class vt {
  constructor() {
    this.fingerprint = {
      signals: {
        // Automation/Bot detection signals
        automation: {
          webdriver: r,
          webdriverWritable: r,
          selenium: r,
          cdp: r,
          playwright: r,
          navigatorPropertyDescriptors: r
        },
        // Device hardware characteristics
        device: {
          cpuCount: r,
          memory: r,
          platform: r,
          screenResolution: {
            width: r,
            height: r,
            pixelDepth: r,
            colorDepth: r,
            availableWidth: r,
            availableHeight: r,
            innerWidth: r,
            innerHeight: r,
            hasMultipleDisplays: r
          },
          multimediaDevices: {
            speakers: r,
            microphones: r,
            webcams: r
          },
          mediaQueries: {
            prefersColorScheme: r,
            prefersReducedMotion: r,
            prefersReducedTransparency: r,
            colorGamut: r,
            pointer: r,
            anyPointer: r,
            hover: r,
            anyHover: r,
            colorDepth: r
          },
          keyboard: {
            layout: r,
            layoutSize: r
          }
        },
        // Browser identity & features
        browser: {
          userAgent: r,
          features: {
            bitmask: r,
            chrome: r,
            brave: r,
            applePaySupport: r,
            opera: r,
            serial: r,
            attachShadow: r,
            caches: r,
            webAssembly: r,
            buffer: r,
            showModalDialog: r,
            safari: r,
            webkitPrefixedFunction: r,
            mozPrefixedFunction: r,
            usb: r,
            browserCapture: r,
            paymentRequestUpdateEvent: r,
            pressureObserver: r,
            audioSession: r,
            selectAudioOutput: r,
            barcodeDetector: r,
            battery: r,
            devicePosture: r,
            documentPictureInPicture: r,
            eyeDropper: r,
            editContext: r,
            fencedFrame: r,
            sanitizer: r,
            otpCredential: r
          },
          plugins: {
            isValidPluginArray: r,
            pluginCount: r,
            pluginNamesHash: r,
            pluginConsistency1: r,
            pluginOverflow: r
          },
          extensions: {
            bitmask: r,
            extensions: r
          },
          highEntropyValues: {
            architecture: r,
            bitness: r,
            brands: r,
            mobile: r,
            model: r,
            platform: r,
            platformVersion: r,
            uaFullVersion: r
          },
          etsl: r,
          maths: r,
          toSourceError: {
            toSourceError: r,
            hasToSource: r
          },
          ai: {
            summarizerAvailability: r,
            summarizerLanguageAvailability: r
          }
        },
        // Graphics & rendering
        graphics: {
          webGL: {
            vendor: r,
            renderer: r
          },
          webgpu: {
            vendor: r,
            architecture: r,
            device: r,
            description: r
          },
          canvas: {
            hasModifiedCanvas: r,
            canvasFingerprint: r
          }
        },
        // Media codecs (at root level)
        codecs: {
          audioCanPlayTypeHash: r,
          videoCanPlayTypeHash: r,
          audioMediaSourceHash: r,
          videoMediaSourceHash: r,
          rtcAudioCapabilitiesHash: r,
          rtcVideoCapabilitiesHash: r,
          hasMediaSource: r
        },
        // Locale & internationalization
        locale: {
          internationalization: {
            timezone: r,
            localeLanguage: r
          },
          languages: {
            languages: r,
            language: r
          }
        },
        // Isolated execution contexts
        contexts: {
          iframe: {
            webdriver: r,
            userAgent: r,
            platform: r,
            memory: r,
            cpuCount: r,
            language: r
          },
          webWorker: {
            webdriver: r,
            userAgent: r,
            platform: r,
            memory: r,
            cpuCount: r,
            language: r,
            vendor: r,
            renderer: r
          }
        }
      },
      fsid: r,
      nonce: r,
      time: r,
      url: r,
      fastBotDetection: !1,
      fastBotDetectionDetails: {
        headlessChromeScreenResolution: { detected: !1, severity: "high" },
        hasWebdriver: { detected: !1, severity: "high" },
        hasWebdriverWritable: { detected: !1, severity: "high" },
        hasSeleniumProperty: { detected: !1, severity: "high" },
        hasCDP: { detected: !1, severity: "high" },
        hasPlaywright: { detected: !1, severity: "high" },
        hasImpossibleDeviceMemory: { detected: !1, severity: "high" },
        hasHighCPUCount: { detected: !1, severity: "high" },
        hasMissingChromeObject: { detected: !1, severity: "high" },
        hasWebdriverIframe: { detected: !1, severity: "high" },
        hasWebdriverWorker: { detected: !1, severity: "high" },
        hasMismatchWebGLInWorker: { detected: !1, severity: "high" },
        hasMismatchPlatformIframe: { detected: !1, severity: "high" },
        hasMismatchPlatformWorker: { detected: !1, severity: "high" },
        hasSwiftshaderRenderer: { detected: !1, severity: "low" },
        hasUTCTimezone: { detected: !1, severity: "medium" },
        hasMismatchLanguages: { detected: !1, severity: "low" },
        hasInconsistentEtsl: { detected: !1, severity: "high" },
        hasBotUserAgent: { detected: !1, severity: "high" },
        hasGPUMismatch: { detected: !1, severity: "high" },
        hasPlatformMismatch: { detected: !1, severity: "high" }
      }
    };
  }
  async collectSignal(e) {
    try {
      return await e();
    } catch {
      return l;
    }
  }
  /**
   * Generate a JA4-inspired fingerprint scanner ID
   * Format: FS1_<det>_<auto>_<dev>_<brw>_<gfx>_<cod>_<loc>_<ctx>
   * 
   * Each section is delimited by '_', allowing partial matching.
   * Sections use the pattern: <bitmask>h<hash> where applicable.
   * Bitmasks are extensible - new boolean fields are appended without breaking existing positions.
   * 
   * Sections:
   * - det:  fastBotDetectionDetails bitmask (21 bits: headlessChromeScreenResolution, hasWebdriver, 
   *         hasWebdriverWritable, hasSeleniumProperty, hasCDP, hasPlaywright, hasImpossibleDeviceMemory,
   *         hasHighCPUCount, hasMissingChromeObject, hasWebdriverIframe, hasWebdriverWorker,
   *         hasMismatchWebGLInWorker, hasMismatchPlatformIframe, hasMismatchPlatformWorker,
   *         hasMismatchLanguages, hasInconsistentEtsl, hasBotUserAgent, hasGPUMismatch, hasPlatformMismatch)
   * - auto: automation bitmask (5 bits: webdriver, webdriverWritable, selenium, cdp, playwright) + hash
   * - dev:  WIDTHxHEIGHT + cpu + mem + device bitmask + hash of all device signals
   * - brw:  features.bitmask + extensions.bitmask + plugins bitmask (3 bits) + hash of browser signals
   * - gfx:  canvas bitmask (1 bit: hasModifiedCanvas) + hash of all graphics signals
   * - cod:  codecs bitmask (1 bit: hasMediaSource) + hash of all codec hashes
   * - loc:  language code (2 chars) + language count + hash of locale signals
   * - ctx:  context mismatch bitmask (2 bits: iframe, worker) + hash of all context signals
   */
  generateFingerprintScannerId() {
    try {
      const e = this.fingerprint.signals, n = this.fingerprint.fastBotDetectionDetails, i = "FS1", g = [
        n.headlessChromeScreenResolution.detected,
        n.hasWebdriver.detected,
        n.hasWebdriverWritable.detected,
        n.hasSeleniumProperty.detected,
        n.hasCDP.detected,
        n.hasPlaywright.detected,
        n.hasImpossibleDeviceMemory.detected,
        n.hasHighCPUCount.detected,
        n.hasMissingChromeObject.detected,
        n.hasWebdriverIframe.detected,
        n.hasWebdriverWorker.detected,
        n.hasMismatchWebGLInWorker.detected,
        n.hasMismatchPlatformIframe.detected,
        n.hasMismatchPlatformWorker.detected,
        n.hasSwiftshaderRenderer.detected,
        n.hasUTCTimezone.detected,
        n.hasMismatchLanguages.detected,
        n.hasInconsistentEtsl.detected,
        n.hasBotUserAgent.detected,
        n.hasGPUMismatch.detected,
        n.hasPlatformMismatch.detected
        // Add other detection rules output here
      ].map((u) => u ? "1" : "0").join(""), p = [
        e.automation.webdriver === !0,
        e.automation.webdriverWritable === !0,
        e.automation.selenium === !0,
        e.automation.cdp === !0,
        e.automation.playwright === !0
      ].map((u) => u ? "1" : "0").join(""), y = f(String(e.automation.navigatorPropertyDescriptors)).slice(0, 4), o = `${p}h${y}`, m = typeof e.device.screenResolution.width == "number" ? e.device.screenResolution.width : 0, w = typeof e.device.screenResolution.height == "number" ? e.device.screenResolution.height : 0, W = typeof e.device.cpuCount == "number" ? String(e.device.cpuCount).padStart(2, "0") : "00", E = typeof e.device.memory == "number" ? String(Math.round(e.device.memory)).padStart(2, "0") : "00", D = [
        e.device.screenResolution.hasMultipleDisplays === !0,
        e.device.mediaQueries.prefersReducedMotion === !0,
        e.device.mediaQueries.prefersReducedTransparency === !0,
        e.device.mediaQueries.hover === !0,
        e.device.mediaQueries.anyHover === !0
      ].map((u) => u ? "1" : "0").join(""), _ = [
        e.device.platform,
        e.device.screenResolution.pixelDepth,
        e.device.screenResolution.colorDepth,
        e.device.multimediaDevices.speakers,
        e.device.multimediaDevices.microphones,
        e.device.multimediaDevices.webcams,
        e.device.mediaQueries.prefersColorScheme,
        e.device.mediaQueries.colorGamut,
        e.device.mediaQueries.pointer,
        e.device.mediaQueries.anyPointer,
        e.device.mediaQueries.colorDepth,
        e.device.keyboard.layout,
        e.device.keyboard.layoutSize
      ].map((u) => String(u)).join("|"), R = f(_).slice(0, 6), I = `${m}x${w}c${W}m${E}b${D}h${R}`, L = typeof e.browser.features.bitmask == "string" ? e.browser.features.bitmask : "0".repeat(29), T = typeof e.browser.extensions.bitmask == "string" ? e.browser.extensions.bitmask : "0".repeat(8), O = [
        e.browser.plugins.isValidPluginArray === !0,
        e.browser.plugins.pluginConsistency1 === !0,
        e.browser.plugins.pluginOverflow === !0,
        e.browser.toSourceError.hasToSource === !0
      ].map((u) => u ? "1" : "0").join(""), H = [
        e.browser.userAgent,
        e.browser.etsl,
        e.browser.maths,
        e.browser.plugins.pluginCount,
        e.browser.plugins.pluginNamesHash,
        e.browser.toSourceError.toSourceError,
        e.browser.highEntropyValues.architecture,
        e.browser.highEntropyValues.bitness,
        e.browser.highEntropyValues.platform,
        e.browser.highEntropyValues.platformVersion,
        e.browser.highEntropyValues.uaFullVersion,
        e.browser.highEntropyValues.mobile,
        e.browser.ai.summarizerAvailability,
        e.browser.ai.summarizerLanguageAvailability
      ].map((u) => String(u)).join("|"), z = f(H).slice(0, 6), U = `f${L}e${T}p${O}h${z}`, N = [
        e.graphics.canvas.hasModifiedCanvas === !0
      ].map((u) => u ? "1" : "0").join(""), F = [
        e.graphics.webGL.vendor,
        e.graphics.webGL.renderer,
        e.graphics.webgpu.vendor,
        e.graphics.webgpu.architecture,
        e.graphics.webgpu.device,
        e.graphics.webgpu.description,
        e.graphics.canvas.canvasFingerprint
      ].map((u) => String(u)).join("|"), G = f(F).slice(0, 6), V = `${N}h${G}`, B = [
        e.codecs.hasMediaSource === !0
      ].map((u) => u ? "1" : "0").join(""), j = [
        e.codecs.audioCanPlayTypeHash,
        e.codecs.videoCanPlayTypeHash,
        e.codecs.audioMediaSourceHash,
        e.codecs.videoMediaSourceHash,
        e.codecs.rtcAudioCapabilitiesHash,
        e.codecs.rtcVideoCapabilitiesHash
      ].map((u) => String(u)).join("|"), $ = f(j).slice(0, 6), Q = `${B}h${$}`, q = typeof e.locale.languages.language == "string" ? e.locale.languages.language.slice(0, 2).toLowerCase() : "xx", K = Array.isArray(e.locale.languages.languages) ? e.locale.languages.languages.length : 0, J = (typeof e.locale.internationalization.timezone == "string" ? e.locale.internationalization.timezone : "unknown").replace(/[\/\s]/g, "-"), Y = [
        e.locale.internationalization.timezone,
        e.locale.internationalization.localeLanguage,
        Array.isArray(e.locale.languages.languages) ? e.locale.languages.languages.join(",") : e.locale.languages.languages,
        e.locale.languages.language
      ].map((u) => String(u)).join("|"), Z = f(Y).slice(0, 4), X = `${q}${K}t${J}_h${Z}`, ee = [
        x(this.fingerprint, "iframe"),
        x(this.fingerprint, "worker"),
        e.contexts.iframe.webdriver === !0,
        e.contexts.webWorker.webdriver === !0
      ].map((u) => u ? "1" : "0").join(""), te = [
        e.contexts.iframe.userAgent,
        e.contexts.iframe.platform,
        e.contexts.iframe.memory,
        e.contexts.iframe.cpuCount,
        e.contexts.iframe.language,
        e.contexts.webWorker.userAgent,
        e.contexts.webWorker.platform,
        e.contexts.webWorker.memory,
        e.contexts.webWorker.cpuCount,
        e.contexts.webWorker.language,
        e.contexts.webWorker.vendor,
        e.contexts.webWorker.renderer
      ].map((u) => String(u)).join("|"), re = f(te).slice(0, 6), ne = `${ee}h${re}`;
      return [
        i,
        g,
        o,
        I,
        U,
        V,
        Q,
        X,
        ne
      ].join("_");
    } catch (e) {
      return console.error("Error generating fingerprint scanner id", e), l;
    }
  }
  async encryptFingerprint(e) {
    const n = "__DEFAULT_FPSCANNER_KEY__";
    return n.length > 20 && n.indexOf("DEFAULT") > 0 && n.indexOf("FPSCANNER") > 0 && console.warn(
      '[fpscanner] WARNING: Using default encryption key! Run "npx fpscanner build --key=your-secret-key" to inject your own key. See: https://github.com/antoinevastel/fpscanner#advanced-custom-builds'
    ), await pt(JSON.stringify(e), n);
  }
  /**
   * Detection rules with name and severity.
  */
  getDetectionRules() {
    return [
      { name: "headlessChromeScreenResolution", severity: h, test: $e },
      { name: "hasWebdriver", severity: h, test: Qe },
      { name: "hasWebdriverWritable", severity: h, test: st },
      { name: "hasSeleniumProperty", severity: h, test: qe },
      { name: "hasCDP", severity: h, test: Ke },
      { name: "hasPlaywright", severity: h, test: Je },
      { name: "hasImpossibleDeviceMemory", severity: h, test: Ye },
      { name: "hasHighCPUCount", severity: h, test: Ze },
      { name: "hasMissingChromeObject", severity: h, test: et },
      { name: "hasWebdriverIframe", severity: h, test: tt },
      { name: "hasWebdriverWorker", severity: h, test: rt },
      { name: "hasMismatchWebGLInWorker", severity: h, test: nt },
      { name: "hasMismatchPlatformIframe", severity: h, test: ot },
      { name: "hasMismatchPlatformWorker", severity: h, test: at },
      { name: "hasSwiftshaderRenderer", severity: S, test: ct },
      { name: "hasUTCTimezone", severity: se, test: lt },
      { name: "hasMismatchLanguages", severity: S, test: ut },
      { name: "hasInconsistentEtsl", severity: h, test: dt },
      { name: "hasBotUserAgent", severity: h, test: gt },
      { name: "hasGPUMismatch", severity: h, test: ht },
      { name: "hasPlatformMismatch", severity: h, test: mt }
    ];
  }
  runDetectionRules() {
    const e = this.getDetectionRules(), n = {
      headlessChromeScreenResolution: { detected: !1, severity: "high" },
      hasWebdriver: { detected: !1, severity: "high" },
      hasWebdriverWritable: { detected: !1, severity: "high" },
      hasSeleniumProperty: { detected: !1, severity: "high" },
      hasCDP: { detected: !1, severity: "high" },
      hasPlaywright: { detected: !1, severity: "high" },
      hasImpossibleDeviceMemory: { detected: !1, severity: "high" },
      hasHighCPUCount: { detected: !1, severity: "high" },
      hasMissingChromeObject: { detected: !1, severity: "high" },
      hasWebdriverIframe: { detected: !1, severity: "high" },
      hasWebdriverWorker: { detected: !1, severity: "high" },
      hasMismatchWebGLInWorker: { detected: !1, severity: "high" },
      hasMismatchPlatformIframe: { detected: !1, severity: "high" },
      hasMismatchPlatformWorker: { detected: !1, severity: "high" },
      hasSwiftshaderRenderer: { detected: !1, severity: "low" },
      hasUTCTimezone: { detected: !1, severity: "medium" },
      hasMismatchLanguages: { detected: !1, severity: "low" },
      hasInconsistentEtsl: { detected: !1, severity: "high" },
      hasBotUserAgent: { detected: !1, severity: "high" },
      hasGPUMismatch: { detected: !1, severity: "high" },
      hasPlatformMismatch: { detected: !1, severity: "high" }
    };
    for (const i of e)
      try {
        const a = i.test(this.fingerprint);
        n[i.name] = { detected: a, severity: i.severity };
      } catch {
        n[i.name] = { detected: !1, severity: i.severity };
      }
    return n;
  }
  async collectFingerprint(e = { encrypt: !0 }) {
    const { encrypt: n = !0, skipWorker: i = !1 } = e, a = this.fingerprint.signals, g = {
      // Automation signals
      webdriver: this.collectSignal(ie),
      webdriverWritable: this.collectSignal(Se),
      selenium: this.collectSignal(be),
      cdp: this.collectSignal(le),
      playwright: this.collectSignal(de),
      navigatorPropertyDescriptors: this.collectSignal(He),
      // Device signals
      cpuCount: this.collectSignal(ge),
      memory: this.collectSignal(me),
      platform: this.collectSignal(oe),
      screenResolution: this.collectSignal(ve),
      multimediaDevices: this.collectSignal(Ee),
      mediaQueries: this.collectSignal(Ve),
      keyboard: this.collectSignal(Be),
      // Browser signals
      userAgent: this.collectSignal(ae),
      browserFeatures: this.collectSignal(Ge),
      plugins: this.collectSignal(We),
      browserExtensions: this.collectSignal(Fe),
      highEntropyValues: this.collectSignal(Ce),
      etsl: this.collectSignal(pe),
      maths: this.collectSignal(he),
      toSourceError: this.collectSignal(Re),
      ai: this.collectSignal(je),
      // Graphics signals
      webGL: this.collectSignal(ue),
      webgpu: this.collectSignal(we),
      canvas: this.collectSignal(Oe),
      // Codecs
      mediaCodecs: this.collectSignal(Ie),
      // Locale signals
      internationalization: this.collectSignal(fe),
      languages: this.collectSignal(ye),
      // Context signals
      iframe: this.collectSignal(De),
      webWorker: i ? Promise.resolve({
        webdriver: v,
        userAgent: v,
        platform: v,
        memory: v,
        cpuCount: v,
        language: v,
        vendor: v,
        renderer: v
      }) : this.collectSignal(_e),
      // Meta signals
      nonce: this.collectSignal(ze),
      time: this.collectSignal(Ue),
      url: this.collectSignal(Ne)
    }, p = Object.keys(g), y = await Promise.all(Object.values(g)), o = Object.fromEntries(p.map((m, w) => [m, y[w]]));
    return a.automation.webdriver = o.webdriver, a.automation.webdriverWritable = o.webdriverWritable, a.automation.selenium = o.selenium, a.automation.cdp = o.cdp, a.automation.playwright = o.playwright, a.automation.navigatorPropertyDescriptors = o.navigatorPropertyDescriptors, a.device.cpuCount = o.cpuCount, a.device.memory = o.memory, a.device.platform = o.platform, a.device.screenResolution = o.screenResolution, a.device.multimediaDevices = o.multimediaDevices, a.device.mediaQueries = o.mediaQueries, a.device.keyboard = o.keyboard, a.browser.userAgent = o.userAgent, a.browser.features = o.browserFeatures, a.browser.plugins = o.plugins, a.browser.extensions = o.browserExtensions, a.browser.highEntropyValues = o.highEntropyValues, a.browser.etsl = o.etsl, a.browser.maths = o.maths, a.browser.toSourceError = o.toSourceError, a.browser.ai = o.ai, a.graphics.webGL = o.webGL, a.graphics.webgpu = o.webgpu, a.graphics.canvas = o.canvas, a.codecs = o.mediaCodecs, a.locale.internationalization = o.internationalization, a.locale.languages = o.languages, a.contexts.iframe = o.iframe, a.contexts.webWorker = o.webWorker, this.fingerprint.nonce = o.nonce, this.fingerprint.time = o.time, this.fingerprint.url = o.url, this.fingerprint.fastBotDetectionDetails = this.runDetectionRules(), this.fingerprint.fastBotDetection = Object.values(this.fingerprint.fastBotDetectionDetails).some((m) => m.detected), this.fingerprint.fsid = this.generateFingerprintScannerId(), n ? await this.encryptFingerprint(JSON.stringify(this.fingerprint)) : this.fingerprint;
  }
}
export {
  vt as default
};
