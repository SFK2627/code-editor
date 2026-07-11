const CACHE_NAME = 'mcs-coding-app-20260711-overall-100-readiness';
const CRITICAL_ASSETS = new Set(['./index.html', './style.css', './script.js']);
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './script.js',
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
  const failedCritical = [];
  results.forEach((result, index) => {
    if (result.status !== 'rejected') return;
    const asset = APP_SHELL[index];
    if (CRITICAL_ASSETS.has(asset)) failedCritical.push(asset);
    else console.warn('[SW] Optional cache item skipped:', asset, result.reason);
  });

  if (failedCritical.length) {
    throw new Error(`Critical app files could not be cached: ${failedCritical.join(', ')}`);
  }
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

  if (cached) {
    // Refresh in the background without delaying the cached response.
    update.catch(() => null);
    return cached;
  }

  return (await update) || Response.error();
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
