const CACHE_NAME = 'ict8-connect-v653-grade-zero-admin';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './firebase-config.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
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

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(new Request(request, { cache: 'no-store' }));
    if (response && response.ok) cache.put('./index.html', response.clone()).catch(() => undefined);
    return response;
  } catch (_) {
    return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
  }
}


async function networkFirstStatic(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    // Force HTTP revalidation but still permit 304/ETag reuse of large JS/CSS.
    const response = await fetch(new Request(request, { cache: 'no-cache' }));
    if (response && response.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch (_) {
    return (await cache.match(request)) || Response.error();
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch (_) {
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // v652: the app UI code MUST NOT remain cache-first after a deployment.
  // Always try network for the main JS/CSS/config, retain offline fallback.
  // Heavy game content and media stay cache-first to control bandwidth.
  const criticalShellPaths = ['script.js', 'style.css', 'firebase-config.js', 'manifest.webmanifest']
    .map(file => new URL(file, self.registration.scope).pathname);
  if (criticalShellPaths.includes(url.pathname)) {
    event.respondWith(networkFirstStatic(request));
    return;
  }
  const extension = url.pathname.split('.').pop().toLowerCase();
  const cacheable = ['html','js','css','webmanifest','json','csv','png','jpg','jpeg','webp','svg','gif','ico','mp3','wav','ogg','m4a','woff','woff2','ttf'].includes(extension);
  const isVersionedGameCode = url.pathname.includes('/games/') && ['js','css'].includes(extension) && url.searchParams.has('v');
  if (isVersionedGameCode) { event.respondWith(networkFirstStatic(request)); return; }
  if (cacheable) event.respondWith(cacheFirstStatic(request));
});
