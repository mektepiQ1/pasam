// File: notification-sw.js
// Bildirimler için özel Service Worker

// Service Worker kurulumu
self.addEventListener('install', function(event) {
    console.log('Bildirim Service Worker kuruldu');
    self.skipWaiting(); // Hemen aktif ol
});

// Service Worker aktif olunca
self.addEventListener('activate', function(event) {
    console.log('Bildirim Service Worker aktif');
    return self.clients.claim(); // Tüm istemcileri kontrol et
});

// Push bildirimlerini yakala
self.addEventListener('push', function(event) {
    console.log('Push bildirimi alındı:', event);
    
    let data = {
        title: 'Paşam Döner',
        body: 'Yeni bir bildirim var!',
        icon: 'sari.jpg',
        badge: 'sari.jpg',
        tag: 'pasam-notification'
    };
    
    // Eğer event.data varsa, özelleştirilmiş verileri kullan
    if (event.data) {
        try {
            data = Object.assign(data, event.data.json());
        } catch (e) {
            console.log('Bildirim verisi okunamadı:', e);
        }
    }
    
    // Bildirimi göster
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag,
            vibrate: [200, 100, 200, 100, 200],
            data: {
                url: data.url || '/'
            },
            actions: [
                {
                    action: 'open',
                    title: 'Aç'
                },
                {
                    action: 'dismiss',
                    title: 'Kapat'
                }
            ]
        })
    );
});

// Bildirim tıklamalarını yakala
self.addEventListener('notificationclick', function(event) {
    console.log('Bildirime tıklandı:', event.notification.tag);
    event.notification.close();
    
    const urlToOpen = event.notification.data.url || '/';
    
    // Kullanıcı "Aç" butonuna tıkladıysa
    if (event.action === 'open') {
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
    }
    // Diğer tıklamalarda da sayfayı aç
    else {
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    }
    
    // Ana sayfaya bildirim tıklandığını bildir
    event.waitUntil(
        self.clients.matchAll().then(function(clients) {
            clients.forEach(function(client) {
                client.postMessage({
                    action: 'notificationclick',
                    tag: event.notification.tag
                });
            });
        })
    );
});

// Bildirim kapatmalarını yakala
self.addEventListener('notificationclose', function(event) {
    console.log('Bildirim kapatıldı:', event.notification.tag);
});
