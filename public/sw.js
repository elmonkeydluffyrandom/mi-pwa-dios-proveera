const CACHE_NAME = 'tienda-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Agrega aquí otros recursos estáticos que quieras cachear
  // '/styles/main.css',
  // '/script/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en el caché, la devolvemos
        if (response) {
          return response;
        }

        // Si no, intentamos obtenerla de la red
        return fetch(event.request).then(
          (response) => {
            // Si la respuesta es inválida, simplemente la devolvemos
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonamos la respuesta. Una respuesta es un stream y solo se puede consumir una vez.
            // Necesitamos una para el navegador y otra para el caché.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
