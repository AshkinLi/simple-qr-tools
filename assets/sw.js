/* Simple QR Tools Service Worker */
const CACHE_VERSION = 'v1';
const CACHE_NAME = `simple-qr-tools-${CACHE_VERSION}`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/assets/app.js',
  '/libs/jsQR.js',
  '/libs/qrcode.min.js',
  '/manifest.webmanifest',
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg',
  '/assets/icons/icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Prefer cache-first for same-origin GET requests
  if (request.method === 'GET' && new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone)).catch(() => {});
          return response;
        }).catch(() => {
          // Optionally return fallback
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
    );
  }
});
