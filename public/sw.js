const CACHE_NAME = 'thetoysvirago-v7';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/products.html',
  '/manifest.webmanifest',
  '/assets/logo.webp',
  '/assets/hero-collection.webp',
  '/assets/hero-device.webp',
  '/assets/product-rose.webp',
  '/assets/rose-pair-duo.webp',
  '/assets/product-wand.webp',
  '/assets/product-serum.webp',
  '/assets/african-brute.webp',
  '/assets/category-games.webp',
  '/assets/thrusting-dildo-duo.webp',
  '/assets/thrusting-dildo-black.webp',
  '/assets/thrusting-dildo-brown.webp',
  '/assets/thrusting-dildo-tan.webp',
  '/assets/sucking-rabbit.webp',
  '/assets/sucking-rabbit-box.webp',
  '/assets/plugs-vault-chest.webp',
  '/assets/plugs-lineup-all.webp',
  '/assets/plug-size-small.webp',
  '/assets/plug-size-medium.webp',
  '/assets/plug-size-large.webp',
  '/assets/rabbit-cock-ring.webp',
  '/assets/rabbit-cock-ring-gold.webp'
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
