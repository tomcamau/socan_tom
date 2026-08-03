const CACHE_NAME = 'socan-v1';
const urlsToCache = [
    '/socan-tom/',
    '/socan-tom/index.html',
    '/socan-tom/manifest.json',
    '/socan-tom/icon-192.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache thành công!');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('❌ Lỗi cache:', err))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
            .catch(() => {
                return caches.match('/socan-tom/index.html');
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
