const CACHE_NAME = 'mcs-coding-app-20260713-step103-editor-typing-stability';
const APP_SHELL = [
  './',
  './index.html',
  './index.html?v=20260713-step103-editor-typing-stability',
  './index.html?fresh=step99',
  './style.css',
  './style.css?v=20260713-step103-editor-typing-stability',
  './style.css?v=20260713-step103-editor-typing-stability',
  './script.js',
  './script.js?v=20260713-step103-editor-typing-stability',
  './script.js?v=20260713-step103-editor-typing-stability',
  './firebase-config.js',
  './manifest.webmanifest',
  './favicon.png',
  './STUDENT_IMPORT_TEMPLATE.csv',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png'
];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const results = await Promise.allSettled(
    APP_SHELL.map(async asset => {
      const request = new Request(asset, { cache: 'reload' });
      const response = await fetch(request);
      if (!response.ok) throw new Error(`Could not cache ${asset}: ${response.status}`);
      await cache.put(request, response);
    })
  );

  // A missing optional asset must not prevent the entire app from installing.
  results.forEach((result, index) => {
    if (result.status === 'rejected') console.warn('[SW] Optional cache item skipped:', APP_SHELL[index], result.reason);
  });
}

self.addEventListener('install', event => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirst(request, fallbackUrl = '') {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl, { ignoreSearch: true });
      if (fallback) return fallback;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  const update = fetch(request)
    .then(response => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || update || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  const extension = url.pathname.split('.').pop().toLowerCase();
  const networkFirstTypes = new Set(['html', 'js', 'css', 'webmanifest', 'json', 'csv']);
  event.respondWith(
    networkFirstTypes.has(extension)
      ? networkFirst(request)
      : staleWhileRevalidate(request)
  );
});
