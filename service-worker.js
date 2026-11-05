const CACHE_NAME = 'ict8-connect-v714-adviser-message-types';
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
  const criticalShellPaths = [
    'script.js', 'style.css', 'firebase-config.js', 'manifest.webmanifest',
    'g8code-push.js', 'g8code-push-config.js', 'g8code-learning-badges.js'
  ]
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


/* G8Code Push V3.5 — privacy-safe two-way background push + verified adviser sender and message type.
 * Account UID lives in worker IndexedDB to survive device restart.
 * Any push targeted at a previous account on a shared device is discarded.
 * Data-only server sends; no private message text in lock-screen notifications.
 */
const PUSH_IDB='g8code-push-identity-v2';
function openPushIdb(){return new Promise((resolve,reject)=>{
 const req=indexedDB.open(PUSH_IDB,1);
 req.onupgradeneeded=()=>req.result.createObjectStore('prefs');
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
});}
async function pushIdentity(writeUid){
 const db=await openPushIdb();
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction('prefs',writeUid===undefined?'readonly':'readwrite');
  const request=writeUid===undefined?tx.objectStore('prefs').get('activeUid'):
    tx.objectStore('prefs').put(String(writeUid||''),'activeUid');
  request.onsuccess=()=>resolve(writeUid===undefined?request.result||'':true);
  request.onerror=()=>reject(request.error);
 });}finally{db.close();}
}
async function writePushAudit(status,receiptMs){
 try{
  const db=await openPushIdb();
  try{
   await new Promise((resolve,reject)=>{
    const tx=db.transaction('prefs','readwrite');
    const now=Date.now();
    tx.objectStore('prefs').put({atMs:now,receivedAtMs:Number(receiptMs||now),status:String(status||'unknown').slice(0,40)},'lastPush');
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
   });
  }finally{db.close();}
 }catch(_){}
}
async function readPushAudit(){
 try{
  const db=await openPushIdb();
  try{return await new Promise((resolve,reject)=>{
   const tx=db.transaction('prefs','readonly'),req=tx.objectStore('prefs').get('lastPush');
   req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  });}finally{db.close();}
 }catch(_){return null;}
}
// Use a message-channel acknowledgement, so registration is never marked
// ready before active-account identity has been persisted in IndexedDB.
self.addEventListener('message',event=>{
 const request=event.data||{};
 if(request.type==='G8PUSH_SET_ACTIVE_USER'){
  const uid=String(request.uid||'');
  if(uid&&!/^[A-Za-z0-9_-]{1,128}$/.test(uid))return;
  event.waitUntil((async()=>{
   let ok=false;
   try{await pushIdentity(uid);ok=true;}catch(_){}
   try{event.ports?.[0]?.postMessage({ok});}catch(_){}
  })());
 }else if(request.type==='G8PUSH_INSPECT'){
  event.waitUntil((async()=>{
   const uid=await pushIdentity().catch(()=>null);
   const lastPush=await readPushAudit();
   // No sensitive identifiers or registration tokens returned to UI.
   const expectedUid=String(request.uid||'');
   try{event.ports?.[0]?.postMessage({ok:true,hasIdentity:Boolean(uid),identityMatchesUid:Boolean(uid&&expectedUid===uid),lastPush});}catch(_){}
  })());
 }
});
const pushLabels={messages:'You have a new private message.',announcements:'A new announcement is available.',lessons:'A new lesson is available.',activities:'A new activity is available.'};
self.addEventListener('push',event=>{
 event.waitUntil((async()=>{
  // Audit whether the browser woke this worker at all (even with a closed tab).
  const receivedAtMs=Date.now();
  // Do not delay user-visible notification display on a diagnostic IDB write.
  // Failure paths still write an audit; successful delivery audits after show.
  let raw={};try{raw=event.data?.json()||{};}catch(_){await writePushAudit('invalid-payload',receivedAtMs);return;}
  const data=raw.data||raw.message?.data||raw;
  const type=String(data.type||'').toLowerCase();
  const targetUid=String(data.targetUid||'');
  if(!pushLabels[type]||!/^[A-Za-z0-9_-]{1,128}$/.test(targetUid)){await writePushAudit('unknown-payload',receivedAtMs);return;}
  let activeUid='';try{activeUid=await pushIdentity();}catch(_){await writePushAudit('identity-read-error',receivedAtMs);return;}
  if(!activeUid||activeUid!==targetUid){await writePushAudit('account-mismatch',receivedAtMs);return;}
  // Validate role BEFORE using it in the foreground check. V3.1 referenced
  // recipientRole in the temporal dead zone when a focused tab was present.
  const recipientRole=String(data.recipientRole||'student');
  const chatUid=String(data.chatUid||'');
  if(!['teacher','student'].includes(recipientRole)){
   await writePushAudit('unknown-role',receivedAtMs);return;
  }
  if(recipientRole==='teacher' && (type!=='messages'||!/^[A-Za-z0-9_-]{1,128}$/.test(chatUid))){
   await writePushAudit('unknown-chat',receivedAtMs);return;
  }
  // Messenger itself already shows the incoming message live. Do not send a
  // redundant OS alert when the focused tab is the current conversation.
  // The Admin Dashboard (including while open) should show OS notifications.
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  if(windows.some(c=>c.visibilityState==='visible'&&c.focused&&
    (recipientRole==='student'||/\/messages\.html(?:[?#]|$)/.test(c.url)))){
   await writePushAudit('in-app-foreground',receivedAtMs);return;
  }
  const itemId=String(data.itemId||'');
  const validItem=/^[A-Za-z0-9_-]{1,128}$/.test(itemId);
  const destination=recipientRole==='teacher'?`./messages.html?from=admin&student=${encodeURIComponent(chatUid)}`
    :type==='messages'?'./messages.html?from=student'
    :type==='announcements'?'./announcements.html?from=student'
    :validItem?`./index.html?g8mBack=student&gaOpen=${type==='lessons'?'lesson':'activity'}&gaItem=${encodeURIComponent(itemId)}`
    :'./index.html';
  const eventId=String(data.eventId||'latest').slice(0,80).replace(/[^A-Za-z0-9_-]/g,'');
  // Server-sourced directory name; never display student-supplied message text.
  // Strip control chars/newlines so an unexpected value cannot distort alerts.
  const studentName=recipientRole==='teacher'
   ?String(data.studentName||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
     .replace(/\s+/g,' ').trim().slice(0,72):'';
  const studentSection=recipientRole==='teacher'
   ?String(data.studentSection||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
     .replace(/\s+/g,' ').trim().slice(0,100):'';
  // Only controlled message categories from the server are displayed. The
  // message text, attachment names, and project source are never sent to FCM.
  const adviserKind=['message','photo','project'].includes(String(data.messageKind||''))
   ?String(data.messageKind):'message';
  const photoCount=Math.max(1,Math.min(10,Number.parseInt(data.photoCount,10)||1));
  const adviserTitle=studentName
   ?`${studentName}${studentSection?' ('+studentSection+')':''}`
   :studentSection?`Student (${studentSection})`:'G8Code Messages';
  const adviserBody=adviserKind==='project'?'Shared a project with you.'
   :adviserKind==='photo'?(photoCount>1?`Sent you ${photoCount} photos.`:'Sent you a photo.')
   :'Sent you a message.';
  try{
  await self.registration.showNotification(recipientRole==='teacher'?adviserTitle:'G8Code',{
   body:recipientRole==='teacher'?adviserBody:pushLabels[type],icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',
   tag:`g8code-${type}-${eventId}`,renotify:false,
   data:{destination,type,targetUid},silent:false
  });
   await writePushAudit('notification-shown',receivedAtMs);
  }catch(_){await writePushAudit('notification-error',receivedAtMs);}
 })());
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const data=event.notification.data||{};
  const activeUid=await pushIdentity().catch(()=>null);
  if(!activeUid||activeUid!==data.targetUid)return;
  const url=new URL(data.destination||'./index.html',self.registration.scope);
  if(url.origin!==self.location.origin)return;
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const match=windows.find(client=>{try{return new URL(client.url).pathname===url.pathname;}catch(_){return false;}});
  if(match){await match.focus();if(match.url!==url.href)await match.navigate(url.href);return;}
  await self.clients.openWindow(url.href);
 })());
});
