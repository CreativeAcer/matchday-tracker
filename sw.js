/* Matchday Tracker service worker.
   Goal: the app must open with no signal at the pitch, while still picking up
   new versions when there IS signal. Bump CACHE_VERSION on every deploy. */

var CACHE_VERSION = "matchday-v39";

// Without this the app cannot open at the pitch at all, so a failure here has
// to fail the whole install. A half-cached new version that replaces a working
// old one is the one outcome an offline-first app must never allow.
var CRITICAL = ["./index.html"];

// Worth having offline, but not worth blocking an update for. "./" sits here
// rather than above because not every host serves the bare directory, and the
// fetch handler already falls back to ./index.html for navigations.
var OPTIONAL = [
  "./",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

// True only when every critical file really is in the given cache.
function shellComplete(cache) {
  return Promise.all(CRITICAL.map(function (url) { return cache.match(url); }))
    .then(function (hits) {
      return hits.every(function (h) { return !!h; });
    });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      // addAll is all-or-nothing on purpose: if the app shell cannot be stored,
      // the install fails, this worker never activates, and the previous
      // version keeps serving the coach a working offline app.
      return cache.addAll(CRITICAL).then(function () {
        return Promise.all(
          OPTIONAL.map(function (url) {
            return cache.add(url).catch(function () { return null; });
          })
        );
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(shellComplete).then(function (complete) {
      // Second line of defence: the old caches are only thrown away once the
      // new one demonstrably holds the app. If it does not, the old version
      // stays on disk and the fetch handler can still find it.
      if (!complete) return null;
      return caches.keys().then(function (keys) {
        return Promise.all(
          keys.filter(function (k) { return k !== CACHE_VERSION; })
              .map(function (k) { return caches.delete(k); })
        );
      });
    }).then(function () { return self.clients.claim(); })
  );
});

// Only the app's own page may become the offline copy. Every successful
// navigation inside the folder used to be stored as ./index.html, so opening
// a shared team file (.json) or an image there replaced the app, and the next
// offline open at the pitch showed raw JSON instead of the app.
function isAppPage(req, res) {
  var type = (res && res.headers && res.headers.get("content-type")) || "";
  if (!res || !res.ok || type.indexOf("text/html") === -1) return false;
  var path = new URL(req.url).pathname;
  return /\/$/.test(path) || /\/(index|soccer-tracker)\.html$/.test(path);
}

function cachedShell() {
  return caches.match("./index.html").then(function (hit) {
    return hit || caches.match("./");
  });
}

// A line that connects but never answers — one bar of signal at the pitch —
// used to leave the app loading indefinitely. After a few seconds the saved
// copy is shown instead; if the network does answer later, that answer still
// refreshes the saved copy for next time.
var NAVIGATE_TIMEOUT_MS = 3000;

function navigate(req) {
  var network = fetch(req).then(function (res) {
    if (isAppPage(req, res)) {
      var copy = res.clone();
      caches.open(CACHE_VERSION).then(function (c) { c.put("./index.html", copy); });
    }
    return res;
  });
  var fallback = new Promise(function (resolve) {
    setTimeout(function () {
      cachedShell().then(function (hit) { if (hit) resolve(hit); });
    }, NAVIGATE_TIMEOUT_MS);
  });
  return Promise.race([
    network.catch(function () { return cachedShell(); }),
    fallback
  ]);
}

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);

  // Google Fonts: cache-first, so the app looks right offline after one online load.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
          return res;
        }).catch(function () { return hit; });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Navigations: network-first so a new deploy is picked up, cache as offline
  // fallback. A successful navigation also repairs the cached app shell, so a
  // cache that somehow lost it heals on the next online open.
  if (req.mode === "navigate") {
    event.respondWith(navigate(req));
    return;
  }

  // Everything else same-origin: cache-first with background refresh.
  event.respondWith(
    caches.match(req).then(function (hit) {
      var network = fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return hit; });
      return hit || network;
    })
  );
});
