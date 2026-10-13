// Offline support. Strategy: network first, cache as fallback.
// Online users always get the latest deploy; offline users get the last copy
// they loaded, so a dad on a factory floor with no signal can still log a mission.

const CACHE = 'heroes-v3';

const PRECACHE = [
    './',
    'index.html',
    'manifest.webmanifest',
    'css/style.css',
    'icons/icon.svg',
    'icons/icon-192.png',
    'js/main.js',
    'js/core/domain.js',
    'js/core/html.js',
    'js/core/i18n.js',
    'js/core/recommend.js',
    'js/core/shuffle.js',
    'js/core/store.js',
    'js/data/missions.js',
    'js/data/phrases.js',
    'js/data/seed.js',
    'js/data/locales/ko.js',
    'js/data/locales/en.js',
    'js/data/locales/vi.js',
    'js/data/locales/zh.js',
    'js/ui/icons.js',
    'js/ui/pages.js',
    'js/ui/photo.js',
    'js/ui/sheets.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(request, { cache: 'no-cache' })
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE).then((cache) => cache.put(request, copy));
                }
                return response;
            })
            .catch(() => caches.match(request, { ignoreSearch: true }).then((cached) => cached ?? Response.error()))
    );
});
