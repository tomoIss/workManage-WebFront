const CACHE_PREFIX = 'kadai-kanri-'; 
const CACHE_NAME = CACHE_PREFIX + 'v1.2';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/api.js',
  './js/ui.js',
  './icon/icon-192.jpg',
  './icon/icon-512.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if(event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));          
        }
        return response;
      }).catch(() => {
        // 修正箇所：カッコの閉じ忘れ `});` を修正
        return caches.open(CACHE_NAME).then(cache => {
          return cache.match(event.request);
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 修正箇所：運用版の削除条件を厳密にする
          // 自分のPREFIXで始まり、かつ開発版(-dev-)ではなく、今の名前でもない場合のみ消す
          if (cacheName.startsWith(CACHE_PREFIX) && 
              !cacheName.includes('-dev-') && 
              cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
