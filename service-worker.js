// File: service-worker.js
// Güncellenmiş Service Worker

const CACHE_NAME = 'pasam-doner-v2';
const urlsToCache = [
  'index.html',
  'admin.html',
  'p15.html',
  'manifest.json',
  'sari.jpg',
  'notification-sw.js'
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
  self.skipWaiting();
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
  self.clients.claim();
});

// Push bildirim desteği (isteğe bağlı)
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  // Basit bir bildirim göster
  const title = 'Paşam Döner';
  const options = {
    body: 'Lezzetin Paşasından haberler var!',
    icon: 'sari.jpg',
    badge: 'sari.jpg',
    vibrate: [200, 100, 200],
    data: {
      url: 'https://falanfilan.ct.ws/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Bildirim tıklamalarını yakala
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  
  event.notification.close();
  
  // Bildirimdeki URL'yi aç veya varsayılan URL'yi kullan
  const urlToOpen = event.notification.data.url || 'https://falanfilan.ct.ws/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Aynı URL'yi açmış bir pencere varsa ona odaklan
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Yoksa yeni pencere aç
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
