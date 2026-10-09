const CACHE_NAME = 'thetoysvirago-v7';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/products.html',
  '/manifest.webmanifest',
  '/assets/logo.jpg',
  '/assets/hero-collection.jpg',
  '/assets/hero-device.jpg',
  '/assets/product-rose.jpg',
  '/assets/rose-pair-duo.jpg',
  '/assets/product-wand.jpg',
  '/assets/product-serum.jpg',
  '/assets/african-brute.jpg',
  '/assets/category-games.jpg',
  '/assets/thrusting-dildo-duo.jpg',
  '/assets/thrusting-dildo-black.jpg',
  '/assets/thrusting-dildo-brown.jpg',
  '/assets/thrusting-dildo-tan.jpg',
  '/assets/sucking-rabbit.jpg',
  '/assets/sucking-rabbit-box.jpg',
  '/assets/plugs-vault-chest.jpg',
  '/assets/plugs-lineup-all.jpg',
  '/assets/plug-size-small.jpg',
  '/assets/plug-size-medium.jpg',
  '/assets/plug-size-large.jpg',
  '/assets/rabbit-cock-ring.jpg',
  '/assets/rabbit-cock-ring-gold.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('Cache prefill notice:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network first, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
