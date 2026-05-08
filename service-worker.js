const CACHE_NAME = 'rmcs-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './client.js',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg'
];

// Install: cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: network-first for HTML/JS/CSS, cache fallback for offline
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip Firebase and external requests - always go to network
    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Update cache with fresh response
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Network failed, serve from cache
                return caches.match(event.request).then((cached) => {
                    return cached || new Response('Offline - please reconnect to play.', {
                        status: 503,
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
            })
    );
});
