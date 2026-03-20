/* ════════════════════════════════════════
   sw.js — Service Worker (PWA)
   ════════════════════════════════════════ */

const CACHE_NAME = 'prodflow-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/login.css',
  '/css/app.css',
  '/css/components.css',
  '/js/store.js',
  '/js/api.js',
  '/js/timer.js',
  '/js/stats.js',
  '/js/tasks.js',
  '/js/session.js',
  '/js/chat.js',
  '/js/ui.js',
  '/js/auth.js',
  '/js/main.js',
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache first, network fallback
self.addEventListener('fetch', e => {
  // Skip non-GET and external requests (API calls etc.)
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        // Cache new assets on the fly
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      });
    })
  );
});
