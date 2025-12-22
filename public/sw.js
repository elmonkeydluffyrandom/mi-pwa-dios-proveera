// Define el nombre del caché y los archivos a cachear
const CACHE_NAME = 'dios-proveera-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  // Realiza la instalación y cachea los archivos principales
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta las peticiones de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Intenta buscar el recurso en el caché primero
    caches.match(event.request)
      .then((response) => {
        // Si se encuentra en caché, lo devuelve
        if (response) {
          return response;
        }
        // Si no, lo busca en la red
        return fetch(event.request);
      })
  );
});

// Activación del Service Worker y limpieza de cachés antiguos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Borra los cachés que no están en la lista blanca
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
