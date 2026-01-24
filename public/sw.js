// Service Worker para 12Vai PWA
const CACHE_NAME = '12vai-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.ico'
];

// Instalar Service Worker e fazer cache dos recursos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
    // Ativar imediatamente
    self.skipWaiting();
});

// Ativar Service Worker e limpar caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Tomar controle imediatamente
    return self.clients.claim();
});

// Interceptar requisições e servir do cache quando possível
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - retornar resposta do cache
                if (response) {
                    return response;
                }

                // Clonar a requisição
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Verificar se recebemos uma resposta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clonar a resposta
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});
