/* Simple QR Tools Service Worker (public) */
const CACHE_VERSION = 'v2';
const CACHE_NAME = `simple-qr-tools-${CACHE_VERSION}`;
const APP_SHELL = [
    '/',
    '/index.html',
    '/src/css/styles.css',
    '/src/js/app.js',
    '/libs/jsQR.js',
    '/libs/qrcode.min.js',
    '/manifest.webmanifest',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg',
    '/icons/icon-maskable.svg'
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
    if (request.method === 'GET' && new URL(request.url).origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    const respClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone)).catch(() => { });
                    return response;
                }).catch(() => {
                    if (request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
        );
    }
});
