/*
  Tally Landing Page — Service Worker
  ============================================================
  This page has no live data and nothing meaningful to run offline — it's
  a marketing page, not the app itself. This service worker exists for one
  reason: Chrome's installability criteria require a registered service
  worker with a fetch handler before it will offer a real "Install" /
  "Add to Home Screen" prompt with the actual app icon, rather than a
  generic bookmark.

  It caches the page shell as a light bonus (so it still opens if the
  network blips), but that's incidental — the real job is just existing.
*/

const CACHE_NAME = 'tally-landing-shell-v1';
const SHELL_ASSETS = [
  './index.html',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only ever touch same-origin requests — never intercept the link out to
  // the live app, fonts, or anything else off this origin.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
