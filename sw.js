const CACHE_NAME = 'socan-v2';
const urlsToCache = [
    '/socan-tom/',
    '/socan-tom/index.html',
    '/socan-tom/manifest.json',
    '/socan-tom/icon-192.png'
];

self.addEventListener('install', event => {
    // Kích hoạt bản Service Worker mới ngay, không chờ user đóng hết các tab đang mở
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache thành công!');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('❌ Lỗi cache:', err))
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
        }).then(() => self.clients.claim()) // Chiếm quyền điều khiển các tab đang mở ngay lập tức
    );
});

// NETWORK-FIRST: luôn cố lấy bản mới nhất từ mạng trước.
// Chỉ dùng bản cache khi không có mạng (offline) -> đảm bảo mỗi lần sửa file
// và deploy lên GitHub, người dùng mở app sẽ thấy bản mới ngay, không bị kẹt cache cũ.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then(cached => {
                    return cached || caches.match('/socan-tom/index.html');
                });
            })
    );
});
