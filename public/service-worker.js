const CACHE_NAME = "mini-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Instalace service workeru a cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

// Fetch – nejdřív cache, pak síť
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

// Aktivace a čištění starých cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
});
