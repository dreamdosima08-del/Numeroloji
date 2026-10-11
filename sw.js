/* Numerolojim service worker v2
   Önce ağ: sayfalar her zaman sunucudan güncel gelir, bağlantı yoksa çevrimdışı sayfası gösterilir.
   v1'in önbelleğe aldığı eski sayfalar etkinleştirme sırasında silinir. */
const CACHE = 'numerolojim-v3';
const OFFLINE = '/offline.html';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([OFFLINE, '/assets/site.css?v=3', '/assets/site.js?v=3'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match(OFFLINE)));
  }
});
