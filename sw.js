// service worker version
const version = "1.1"; // Don't forget to surround with quotes to make sure the version is a string.

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

// static cache strategy = cache-first then fetch from network as the fallback option
const staticCache = (req, cachename = `static-${version}`) => {
  return caches.match(req).then((cachedRes) => {
    // return cached response if found
    if (cachedRes) return cachedRes;

    // fallback to network
    return fetch(req).then((networkRes) => {
      // update cache with the new response
      caches.open(cachename).then((cache) => cache.put(req, networkRes));

      // return clone of network response
      return networkRes.clone();
    });
  });
};

// dynamice cache strategy = network-first then cache as the fallback option
const fallbackCache = (req) => {
  // try network first
  return (
    fetch(req)
      .then((networkRes) => {
        // check res OK, else go to cache
        if (!networkRes.ok) throw "Fetch error";

        // update cache
        caches
          .open(`static-${version}`)
          .then((cache) => cache.put(req, networkRes));

        // return clone of network response
        return networkRes.clone();
      })

      // if fetch fails, update with cache
      .catch((err) => caches.match(req))
  );
};

// service worker fetch
self.addEventListener("fetch", (e) => {
  // app shell
  if (e.request.url.match(location.origin)) {
    e.respondWith(staticCache(e.request));

    // giphy API
  } else if (e.request.url.match("api.giphy.com/v1/gifs/trending")) {
    e.respondWith(fallbackCache(e.request));

    // giphy media
  } else if (e.request.url.match("giphy.com/media")) {
    e.respondWith(staticCache(e.request, "giphy"));
  }
});
