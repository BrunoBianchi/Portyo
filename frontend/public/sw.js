// Service Worker para Portyo - Estratégia de cache híbrida
// Workbox Runtime CDN (não precisa buildar)

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

workbox.setConfig({
  debug: false,
});

// Nome do cache
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `portyo-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `portyo-images-${CACHE_VERSION}`;
const API_CACHE = `portyo-api-${CACHE_VERSION}`;

// Pré-cache de assets críticos
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/en', revision: '1' },
  { url: '/manifest.json', revision: '1' },
]);

// Estratégia para CSS/JS: Cache First, fallback para network
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.CacheFirst({
    cacheName: STATIC_CACHE,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Estratégia para imagens: Stale While Revalidate
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: IMAGE_CACHE,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 dias
      }),
    ],
  })
);

// Estratégia para fontes: Cache First
workbox.routing.registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new workbox.strategies.CacheFirst({
    cacheName: `portyo-fonts-${CACHE_VERSION}`,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
      }),
    ],
  })
);

// Estratégia para API: Network First com timeout
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: API_CACHE,
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  })
);

// Estratégia para páginas HTML: Network First
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: `portyo-pages-${CACHE_VERSION}`,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Background sync para formulários
workbox.routing.registerRoute(
  ({ url }) => url.pathname.includes('/api/forms/'),
  new workbox.strategies.NetworkOnly({
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin('form-submissions', {
        maxRetentionTime: 24 * 60, // 24 horas
      }),
    ],
  }),
  'POST'
);

// Evento de instalação
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// Evento de ativação
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('portyo-') && !cacheName.includes(CACHE_VERSION))
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Push notifications (preparado para futuro)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicons/192x192.png',
      badge: '/favicons/48x48.png',
      data: data.url,
    })
  );
});

// Click na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
