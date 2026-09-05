const CACHE_NAME = 'ict8-connect-v303-image-fit-zoom-download';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const extension = url.pathname.split('.').pop().toLowerCase();
  const isAppCode = request.mode === 'navigate'
    || ['html', 'js', 'css', 'webmanifest', 'json', 'csv'].includes(extension);

  if (!isAppCode) return;

  event.respondWith(
    fetch(new Request(request, { cache: 'no-store' })).catch(() => Response.error())
  );
});
