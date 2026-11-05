const CACHE_NAME = 'ict8-connect-v677-learning-badges-push-ready';
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


/* Phone push receiver foundation (inactive until a secured sender/subscription
 * has been configured). Incoming payloads are untrusted: never place chat
 * message text or student names into lock-screen previews by default. */
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() || {}; } catch (_) { data = {}; }
  const type = String(data.data?.type || data.type || '').toLowerCase();
  const allowed = ['messages','announcements','lessons','activities'];
  if (!allowed.includes(type)) return;
  const title = 'G8Code';
  const labels = {messages:'You have a new private message.',announcements:'A new announcement is available.',lessons:'A new lesson is available.',activities:'A new activity is available.'};
  const itemId=String(data.data?.itemId||data.itemId||'');
  const validItem=/^[A-Za-z0-9_-]{1,128}$/.test(itemId);
  const destination = type === 'messages' ? './messages.html?from=student'
    : type === 'announcements' ? './announcements.html?from=student'
    : validItem ? `./index.html?gaOpen=${type==='lessons'?'lesson':'activity'}&gaItem=${encodeURIComponent(itemId)}`
    : './index.html';
  event.waitUntil(self.registration.showNotification(title,{
    body: labels[type], icon:'./icons/icon-192.png', badge:'./icons/icon-192.png',
    tag:`g8code-${type}-${String(data.data?.eventId||data.eventId||'latest').slice(0,64)}`,
    renotify:false, data:{destination,type}
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const data=event.notification.data||{};
    const url=new URL(data.destination||'./index.html',self.registration.scope);
    if(url.origin!==self.location.origin)return;
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const match=windows.find(client=>{try{return new URL(client.url).pathname===url.pathname;}catch(_){return false;}});
    if(match){await match.focus(); if(match.url!==url.href) await match.navigate(url.href);return;}
    await self.clients.openWindow(url.href);
  })());
});
