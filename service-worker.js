const CACHE_NAME = 'ict8-connect-v760-push-status-queue';
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
    'g8code-push.js', 'g8code-push-config.js', 'g8code-learning-badges.js',
    'messages.js', 'messages-chat-styles.js', 'announcements.js',
    'admin-notifications.js', 'admin-notifications-badge.js'
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
  const writing=writeUid!==undefined;
  const tx=db.transaction('prefs',writing?'readwrite':'readonly');
  const request=writing?tx.objectStore('prefs').put(String(writeUid||''),'activeUid'):
   tx.objectStore('prefs').get('activeUid');
  let value='';
  request.onsuccess=()=>{if(!writing)value=request.result||'';};
  // Only acknowledge AFTER the identity transaction commits, not merely
  // after its put() request resolves. This avoids false readiness on phones.
  tx.oncomplete=()=>resolve(writing?true:value);
  tx.onabort=()=>reject(tx.error||Error('Worker identity transaction aborted'));
  tx.onerror=()=>reject(tx.error||Error('Worker identity transaction failed'));
 });}finally{db.close();}
}
async function writePushAudit(status,receiptMs){
 try{
  const db=await openPushIdb();
  try{
   await new Promise((resolve,reject)=>{
    const tx=db.transaction('prefs','readwrite');
    const now=Date.now();
    const label=String(status||'unknown').slice(0,40);
    const key=label.startsWith('local-')?'lastLocalTest':'lastPush';
    tx.objectStore('prefs').put({atMs:now,receivedAtMs:Number(receiptMs||now),status:label},key);
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
   });
  }finally{db.close();}
 }catch(_){}
}
async function readPushAudit(key='lastPush'){
 try{
  const db=await openPushIdb();
  try{return await new Promise((resolve,reject)=>{
   const tx=db.transaction('prefs','readonly'),req=tx.objectStore('prefs').get(key);
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
 }else if(request.type==='G8PUSH_FOREGROUND_ALERT'){
  // FCM onMessage() handoff: same identity check, exact same server-sourced
  // titles and deep links as the background notification handler.
  event.waitUntil(handleG8PushPayload(request.payload||{},Date.now()));
 }else if(request.type==='G8PUSH_LOCAL_TEST'){
  event.waitUntil((async()=>{
   const expectedUid=String(request.uid||'');
   const uid=await pushIdentity().catch(()=>null);
   let ok=false,reason='wrong-account';
   if(uid&&expectedUid===uid){
    try{
     await self.registration.showNotification('G8Code · Local panel test',{
      body:'Local browser test only. It does not confirm FCM delivery or Android notification visibility.',
      icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',
      tag:'g8code-local-notification-check',silent:false,
      data:{targetUid:uid,destination:'./index.html'}
     });
     // getNotifications confirms the browser retained the notification,
     // NOT that Android's system channel actually displayed a banner.
     const found=typeof self.registration.getNotifications==='function'
      ?await self.registration.getNotifications({tag:'g8code-local-notification-check'}) :null;
     ok=true;reason=found?(found.length?'browser-record-present':'browser-record-missing'):'browser-api-accepted';
     await writePushAudit('local-'+reason,Date.now());
    }catch(_){reason='notification-api-error';await writePushAudit('local-'+reason,Date.now());}
   }
   try{event.ports?.[0]?.postMessage({ok,status:reason});}catch(_){}
  })());
 }else if(request.type==='G8PUSH_INSPECT'){
  event.waitUntil((async()=>{
   const uid=await pushIdentity().catch(()=>null);
   const lastPush=await readPushAudit();
   const lastLocalTest=await readPushAudit('lastLocalTest');
   // No sensitive identifiers or registration tokens returned to UI.
   const expectedUid=String(request.uid||'');
   try{event.ports?.[0]?.postMessage({ok:true,hasIdentity:Boolean(uid),identityMatchesUid:Boolean(uid&&expectedUid===uid),lastPush,lastLocalTest});}catch(_){}
  })());
 }
});
const pushLabels={messages:'You have a new private message.',announcements:'A new announcement is available.',lessons:'A new lesson is available.',activities:'A new activity is available.',system:'Notification delivery test.'};
// One FCM delivery can be observed through both an SDK foreground callback
// and the native push event. Keep a short per-worker dedupe keyed by recipient.
const shownG8PushEvents=new Map();
function g8PushClaimOnce(uid,eventId){
 const key=uid+'|'+eventId,now=Date.now();
 for(const [id,stamp] of shownG8PushEvents)if(now-stamp>180000)shownG8PushEvents.delete(id);
 if(shownG8PushEvents.has(key))return false;
 shownG8PushEvents.set(key,now);return true;
}
async function handleG8PushPayload(raw,receivedAtMs=Date.now()){
  const data=raw?.data||raw?.message?.data||raw;
  const type=String(data.type||'').toLowerCase();
  const targetUid=String(data.targetUid||'');
  if(type==='system'&&String(data.testNotice||'')!=='1'){
   await writePushAudit('invalid-test',receivedAtMs);return;
  }
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
  if(recipientRole==='teacher' && !(type==='system'||type==='announcements'||(type==='messages'&&/^[A-Za-z0-9_-]{1,128}$/.test(chatUid)))){
   await writePushAudit('unknown-chat',receivedAtMs);return;
  }
  // Requested: keep OS notification visible even while G8Code is open.
  // A message reaction or reply still arrives as a distinct Android notification.
  const itemId=String(data.itemId||'');
  const validItem=/^[A-Za-z0-9_-]{1,128}$/.test(itemId);
  // Older sender versions sometimes omitted acknowledgment metadata. Its fixed
  // ack_<sha256> event ID is still distinct from an ordinary new message.
  const legacyAck=/^ack_[a-f0-9]{64}$/.test(String(data.eventId||''));
  const eventKind=String(data.notificationKind||'')||(legacyAck?'ack':'');
  const reactionEmojis={heart:'❤️',laugh:'😂',wow:'😮',sad:'😢',angry:'😡',like:'👍'};
  const reactionEmoji=eventKind==='reaction'?reactionEmojis[String(data.reactionCode||'')]||'':'';
  const replyObject=['message','photo','project'].includes(String(data.replyObject||''))?String(data.replyObject):'message';
  const reactedObject=['message','photo','project'].includes(String(data.reactedObject||''))?String(data.reactedObject):'message';
  const kindObject=kind=>kind==='photo'?'photo':kind==='project'?'shared project':'message';
  const focusId=String(data.focusMessageId||'');
  const focusQuery=/^[A-Za-z0-9_-]{6,120}$/.test(focusId)?`&g8mFocus=${encodeURIComponent(focusId)}`:'';
  const engagementType=String(data.engagementType||'');
  const postCommentId=/^[A-Za-z0-9_-]{1,128}$/.test(String(data.commentId||''))?String(data.commentId):'';
  const commentQuery=postCommentId?'&gaComment='+encodeURIComponent(postCommentId):'';
  const destination=type==='system'?(recipientRole==='teacher'?'./admin-notifications.html?from=admin':'./index.html')
    :recipientRole==='teacher'&&type==='announcements'?`./announcements.html?from=admin&gaPost=${encodeURIComponent(itemId)}&gaEngagement=${['comment','comment_reply','comment_reaction'].includes(engagementType)?'comment':'reaction'}${commentQuery}`
    :recipientRole==='teacher'?`./messages.html?from=admin&student=${encodeURIComponent(chatUid)}${focusQuery}`
    :type==='messages'?`./messages.html?from=student${focusQuery}`
    :type==='announcements'?`./announcements.html?from=student&gaPost=${encodeURIComponent(itemId)}`
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
  const announcementTitle=String(data.announcementTitle||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
   .replace(/\s+/g,' ').trim().slice(0,75);
  const announcementRef=announcementTitle?' “'+announcementTitle+'”':'';
  const reactionCode=String(data.reactionCode||'');
  const announcementBody=engagementType==='comment_reaction'
   ?'❤️ Reacted to a comment on your announcement'+announcementRef+'.'
   :engagementType==='comment_reply'?'💬 Replied to a comment on your announcement'+announcementRef+'.'
   :engagementType==='comment'
   ?'💬 Commented on your announcement'+announcementRef+'.'
   :reactionCode==='love'?'❤️ Loved your announcement'+announcementRef+'.'
   :reactionCode==='care'?'🤗 Reacted with care to your announcement'+announcementRef+'.'
   :'👍 Liked your announcement'+announcementRef+'.';
  const adviserBody=eventKind==='reaction'
   ?(reactionEmoji?`Reacted ${reactionEmoji} to your ${kindObject(reactedObject)}.`
     :`Reacted to your ${kindObject(reactedObject)}.`)
   :eventKind==='reply'?`Replied to your ${kindObject(replyObject)}.`
   :adviserKind==='project'?'Shared a project with you.'
   :adviserKind==='photo'?(photoCount>1?`Sent you ${photoCount} photos.`:'Sent you a photo.')
   :'Sent you a message.';
  // Lesson/activity titles are supplied by server-verified teacher-only metadata.
  const learningTitle=recipientRole==='student'&&['lessons','activities'].includes(type)
   ?String(data.learningTitle||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
     .replace(/\s+/g,' ').trim().slice(0,160):'';
  const learningAlert=recipientRole==='student'&&['lessons','activities'].includes(type);
  // If a previous Apps Script deployment omits the title, do NOT show an
  // unhelpful generic 'A new activity is available' notification. Record it
  // for Check Background Alerts. The administrator can inspect FCM diagnostics.
  if(learningAlert&&!learningTitle){
   await writePushAudit('learning-title-missing',receivedAtMs);
   return;
  }
  // Every student-facing caption below is derived from server-verified saved
  // messages, acknowledgments, or published announcement records.
  const ackStatus=eventKind==='ack'&&['received','checked'].includes(String(data.ackStatus||''))
   ?String(data.ackStatus):'';
  const studentKind=['message','photo','project'].includes(String(data.messageKind||''))?String(data.messageKind):'message';
  const projectName=String(data.projectName||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
   .replace(/\s+/g,' ').trim().slice(0,100);
  const studentPhotoCount=Math.max(1,Math.min(10,Number.parseInt(data.photoCount,10)||1));
  const studentAnnouncementTitle=recipientRole==='student'&&type==='announcements'
   ?String(data.announcementTitle||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
    .replace(/\s+/g,' ').trim().slice(0,140):'';
  const studentMessageBody=studentKind==='photo'
   ?(studentPhotoCount>1?`Your teacher sent you ${studentPhotoCount} photos.`:'Your teacher sent you a photo.')
   :studentKind==='project'?'Your teacher shared a project with you.':pushLabels.messages;
  const ackObject=studentKind==='project'?(projectName?`Your activity “${projectName}”`:'Your shared activity')
   :(studentPhotoCount>1?`Your ${studentPhotoCount} photos`:'Your photo');
  // V4.5: reject a malformed/legacy ACK instead of ever showing generic
  // 'Submission Updated' or mistaking it for a newly sent photo/project.
  if(recipientRole==='student'&&type==='messages'&&eventKind==='ack'&&
     (!ackStatus||!['photo','project'].includes(studentKind)||
      (studentKind==='project'&&!projectName))){
   await writePushAudit('ack-context-missing',receivedAtMs);
   return;
  }
  const checked=ackStatus==='checked';
  const ackTitle=studentKind==='project'?`${projectName} — ${checked?'Checked':'Received'}`
   :`Photo${studentPhotoCount>1?'s':''} ${checked?'Checked':'Received'}`;
  const studentAckBody=studentKind==='project'
   ?`Your activity “${projectName}” was marked ${checked?'Checked':'Received'}${checked?'. Check Messenger for your teacher’s feedback or score.':' by your teacher.'}`
   :`${ackObject} ${studentPhotoCount>1?'were':'was'} marked ${checked?'Checked':'Received'}${checked?'. Check Messenger for your teacher’s feedback or score.':' by your teacher.'}`;
  // Prefer the GAS-supplied, source-verified text when present. For older
  // versions with all verified fields, compute the same specific text locally.
  const verifiedAckTitle=String(data.ackNoticeTitle||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
   .replace(/\s+/g,' ').trim().slice(0,140);
  const verifiedAckBody=String(data.ackNoticeBody||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ')
   .replace(/\s+/g,' ').trim().slice(0,300);
  const reactedProject=String(data.reactedProjectName||'').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').replace(/\s+/g,' ').trim().slice(0,100);
  const reactedLabel=reactedObject==='project'&&reactedProject?`project “${reactedProject}”`:kindObject(reactedObject);
  const studentEventBody=eventKind==='reaction'
   ?(reactionEmoji?`Your teacher reacted ${reactionEmoji} to your ${reactedLabel}.`
     :`Your teacher reacted to your ${reactedLabel}.`)
   :eventKind==='reply'?`Your teacher replied to your ${kindObject(replyObject)}.`
   :studentMessageBody;
  const noticeTitle=type==='system'?'G8Code · Phone notifications working':recipientRole==='teacher'?adviserTitle:
   learningAlert?(type==='lessons'?'New Lesson Available!':'New Activity Posted!'):
   type==='announcements'?'New Announcement Posted!':eventKind==='ack'?(verifiedAckTitle||ackTitle):
   eventKind==='reaction'?`Teacher reacted ${reactionEmoji||'💬'}`:
   eventKind==='reply'?'Teacher replied to you':
   studentKind==='photo'?'Photo from your teacher':studentKind==='project'?'Project shared by your teacher':'New message from your teacher';
  const noticeBody=type==='system'?'This phone received a test from the G8Code push sender.':recipientRole==='teacher'?(type==='announcements'?announcementBody:adviserBody):
   learningAlert?learningTitle:
   type==='announcements'?(studentAnnouncementTitle||pushLabels.announcements):
   eventKind==='ack'?(verifiedAckBody||studentAckBody):studentEventBody;
  // The event ID comes from a server-sent FCM payload, not a chat message.
  if(!g8PushClaimOnce(targetUid,eventId)){
   await writePushAudit('duplicate-suppressed',receivedAtMs);return;
  }
  try{
  await self.registration.showNotification(noticeTitle,{
   body:noticeBody,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',
   tag:`g8code-${recipientRole}-${type}-${eventId}`,renotify:false,
   data:{destination,type,targetUid},silent:false
  });
   await writePushAudit('notification-shown',receivedAtMs);
  }catch(_){shownG8PushEvents.delete(targetUid+'|'+eventId);await writePushAudit('notification-error',receivedAtMs);}
}
self.addEventListener('push',event=>{
 event.waitUntil((async()=>{
  const received=Date.now();
  try{
   if(!event.data){await writePushAudit('empty-push',received);return;}
   let raw={};try{raw=event.data.json()||{};}
   catch(_){await writePushAudit('invalid-json-push',received);return;}
   await handleG8PushPayload(raw,received);
  }catch(_){await writePushAudit('worker-processing-error',received);}
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
