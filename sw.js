const CACHE = 'asistente-cache-v1';
const ASSETS = ['./'];

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// No cachear nada - siempre sirve la versión más reciente
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cs => {
    if(cs.length) return cs[0].focus();
    return clients.openWindow('./');
  }));
});
