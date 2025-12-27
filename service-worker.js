// Basit bir Service Worker
const CACHE_NAME = 'pasam-doner-v1';
const urlsToCache = [
  'p15.html',
  'manifest.json',
  'sari.jpg'
];

// Kurulum
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      console.log('Cache açıldı');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch isteklerini yakala
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      // Cache'de varsa cache'den döndür
      if (response) {
        return response;
      }
      // Yoksa network'ten al
      return fetch(event.request);
    })
  );
});

// Eski cache'leri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});