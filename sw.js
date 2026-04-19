const CACHE_NAME = 'ops-hub-v70';

// INSTALL: Force the new worker to take over immediately (No waiting!)
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
});

// ACTIVATE: Wipe out all old versions of the cache permanently
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of all open tabs/apps instantly
});

// FETCH: Network-First Strategy (Always get the newest code if online)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If the internet works, save a fresh copy to the cache
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If offline (no service), pull from the cache
                return caches.match(event.request);
            })
    );
});
