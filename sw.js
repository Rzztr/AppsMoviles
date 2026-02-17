// sw.js - Service Worker para Ghost prISM PWA
// Versión: actualiza este número cada vez que cambies archivos importantes
const VERSION = 'v1.0.2-2026';
const CACHE_NAME = `ghost-prism-${VERSION}`;

// Archivos que se cachean al instalar (estáticos esenciales)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/auth.js',
  '/js/api.js',
  '/js/dashboard.js',
  '/js/map.js',
  '/js/control.js',
  '/assets/logo.png',                // agrega tus imágenes reales
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Instalar → cachear archivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Instalando y cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())   // Activar inmediatamente
  );
});

// Activar → limpiar cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())   // Tomar control de las páginas abiertas
  );
});

// Interceptar peticiones (estrategia Cache First → Network)
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no son GET o que van a APIs externas (como tu FastAPI)
  if (event.request.method !== 'GET' ||
      event.request.url.includes('/api/') ||   // ← no cachear llamadas a backend
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Devolver del caché si existe
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no → ir a la red y cachear la respuesta si es exitosa
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clonar la respuesta porque se consume una sola vez
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        }).catch(() => {
          // Offline fallback (puedes mostrar una página personalizada)
          return caches.match('/index.html');
        });
      })
  );
});

// Opcional: mensaje de actualización disponible (puedes mostrar notificación)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});