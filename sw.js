// service worker version
const version = "1.0";

// static cache - app shell
const appAssets = [
  "index.html",
  "main.js",
  "images/flame.png",
  "images/logo.png",
  "images/sync.png",
  "vendor/bootstrap.min.css",
  "vendor/jquery.min.js",
];

// service worker install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(`static-${version}`).then((cache) => cache.addAll(appAssets))
  );
});

// service worker activate
self.addEventListener("activate", (e) => {
  // clean static cache
  let cleaned = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== `static-${version}` && key.match(`static-`)) {
        return caches.delete(key);
      }
    });
  });
  e.waitUntil(cleaned);
});
