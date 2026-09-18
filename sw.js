/**
 * Rheingrün Festival - Service Worker for Offline PWA Support
 * Cache-First Strategy with Network Fallback
 */

const CACHE_NAME = "rheingruen-timetable-v32";

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./favicon.ico",
  "./robots.txt",
  "./css/style.css",
  "./js/schedule-data.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./fonts/barlow-latin-400.woff2",
  "./fonts/barlow-latin-500.woff2",
  "./fonts/barlow-latin-600.woff2",
  "./fonts/barlow-latin-700.woff2",
  "./fonts/barlow-latin-800.woff2",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/favicon-32x32.png",
  "./icons/favicon-16x16.png",
  "./icons/apple-touch-icon.png"
];

// Install: Precache all essential assets (waits for client confirmation to activate)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Message: Allow clients to prompt skipWaiting when user clicks "Neu laden"
self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

// Activate: Clean up old caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: Cache-first for cached assets, fallback to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Handle same-origin requests
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cache, optionally revalidate in background
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {
              // Ignore background fetch error when offline
            });
          return cachedResponse;
        }

        // Not in cache: fetch from network and cache
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            // Offline fallback for navigation requests
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      })
    );
  }
});
