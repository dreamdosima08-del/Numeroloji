/* ═══════════════════════════════════════════
   NUMEROLOJİM SERVICE WORKER v1.0
   numerolojim.com.tr
═══════════════════════════════════════════ */

const CACHE_NAME = 'numerolojim-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_CACHE = [
  '/',
  '/index.html',
  '/rapor.html',
  '/blog.html',
  '/harf-a.html',
  '/harf-b.html',
  '/harf-c.html',
  '/harf-d.html',
  '/harf-e.html',
  '/harf-f.html',
  '/harf-g.html',
  '/harf-h.html',
  '/harf-i.html',
  '/manifest.json',
  '/offline.html',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Montserrat:wght@300;400;500;600&display=swap'
];

/* ── INSTALL ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('api.anthropic.com')) return;
  if (event.request.url.includes('analytics')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const clone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));
            return response;
          })
          .catch(() => {
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

/* ── PUSH BİLDİRİMLER (ileride) ── */
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Numerolojim', {
      body: data.body || 'Bugünün enerjisini keşfet!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
