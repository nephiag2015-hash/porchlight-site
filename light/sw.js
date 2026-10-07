/* Porch Light — service worker for the public light page (/light/).
   Its only job is web push: show the "light is on" notification and open the
   live page when it's tapped. No caching, no offline. */

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = {}; }
  var url = d.url || '/light/';
  e.waitUntil(self.registration.showNotification(d.title || 'Porch Light', {
    body: d.body || '',
    icon: '/porch-light-icon.png',
    badge: '/porch-light-icon.png',
    tag: 'porchlight-' + (d.code || 'light'),   // one notification per light, newest wins
    renotify: true,
    data: { url: url }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/light/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url.indexOf(url) === 0 && 'focus' in list[i]) return list[i].focus();
    }
    return self.clients.openWindow(url);
  }));
});
