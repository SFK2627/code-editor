/* G8Code Push V5.2 — two-way opt-in Web Push, authenticated student + teacher devices.
 * Zero credentials are embedded: PUBLIC VAPID key is loaded from g8code-push-config.js.
 * The private server credential belongs exclusively in Google Apps Script Properties.
 */
(()=>{'use strict';
const ROOT='g8PushV1';
const TYPES=new Set(['messages','announcements','lessons','activities']);
const $=id=>document.getElementById(id);
const teacherEmails=()=>new Set((window.MCS_TEACHER_EMAILS||[]).map(v=>String(v).toLowerCase()));
const state={uid:'',user:null,teacher:false,auth:null,db:null,database:null,messaging:null,reg:null,ready:null,registering:false,registered:false,section:'',deviceId:'',lastError:'',module:null,authModule:null,sdkLoaded:false};
const publicKey=()=>String(window.G8CODE_PUSH_VAPID_PUBLIC_KEY||'').trim();
// The PUBLIC Apps Script /exec URL contains NO credentials. Keep the actual
// service-account credential only in Apps Script Script Properties.
const immediateUrl=()=>{
 const v=String(window.G8CODE_PUSH_IMMEDIATE_URL||'').trim();
 return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?[^#]*)?$/.test(v)?v:'';
};
// Best-effort immediate wake-up of the trusted sender, AFTER the event is saved.
// Apps Script ContentService responses redirect cross-origin. In no-cors mode
// the response is opaque, so never treat fetch resolving as confirmed delivery.
// The scheduled worker safely retries any event still marked pending.
async function nudgeImmediateSender(account,eventId){
 const endpoint=immediateUrl();
 if(!endpoint||!validId(eventId)||!account)return;
 try{
  const idToken=await account.getIdToken();
  if(!idToken||account.uid!==state.auth?.currentUser?.uid)return;
  const body=new URLSearchParams({eventId,idToken});
  await fetch(endpoint,{
   method:'POST',mode:'no-cors',credentials:'omit',redirect:'follow',
   body,cache:'no-store',keepalive:true
  });
 }catch(error){
  // No untrusted error status is a success signal. Let the timer retry.
  console.info('Immediate phone push could not be confirmed; scheduled fallback remains active.');
 }
}

const validId=v=>/^[A-Za-z0-9_-]{1,128}$/.test(String(v||''));
const safeSection=v=>String(v||'').trim().slice(0,100);
const safeGet=k=>{try{return localStorage.getItem(k);}catch(_){return null;}};
const safePut=(k,v)=>{try{localStorage.setItem(k,v);}catch(_){}};
const safeRemove=k=>{try{localStorage.removeItem(k);}catch(_){}};
const optKey=(uid,teacher=state.teacher)=>(teacher?'g8push.teacher.optin.':'g8push.student.optin.')+uid;
function getDeviceId(){
 let key=safeGet('g8push.device.id.v2');
 if(!key||!/^[a-f0-9]{32}$/.test(key)){
  if(!window.crypto?.getRandomValues)return '';
  const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
  key=Array.from(bytes,v=>v.toString(16).padStart(2,'0')).join('');safePut('g8push.device.id.v2',key);
 }
 return key;
}
function support(){
 if(location.protocol!=='https:'&&location.hostname!=='localhost')return 'Push alerts require an HTTPS deployment.';
 if(!('serviceWorker'in navigator)||!('Notification'in window)||!('PushManager'in window))return 'This browser does not support web push alerts.';
 if(!publicKey()||!/^[A-Za-z0-9_-]{40,220}$/.test(publicKey()))return 'Phone notifications are not yet configured by the teacher.';
 return '';
}
function render(){
 const opted=Boolean(state.uid&&safeGet(optKey(state.uid))==='yes');
 const problem=support();
 const labels={student:'Phone Notifications',teacher:'Admin Phone Alerts'};
 for(const [buttonId,statusId,role] of [['g8pushToggle','g8pushStatus','student'],['g8pushAdminToggle','g8pushAdminStatus','teacher']]){
  const button=$(buttonId),output=$(statusId);if(!button&&!output)continue;
  const matches=!!state.uid && (state.teacher===(role==='teacher'));
  const active=matches&&opted;
  if(button){button.disabled=!matches||state.registering||(!active&&!!problem);button.textContent=state.registering&&matches?'Setting up…':active?'Disable '+labels[role]:'Enable '+labels[role];}
  if(output){output.textContent=state.lastError||(!matches?(role==='teacher'?'Sign in with the authorized teacher account.':'Sign in as a student.'):
   problem|| (active?(state.registered?'On · This phone is registered to your '+role+' account.':'Checking this phone registration…'):
    'Enable once on this phone to get messages, replies, reactions and other classroom alerts.'));}
 }
}
// Persist the active account BEFORE relying on closed-tab push delivery.
// An acknowledgement ensures that a new worker has finished writing IndexedDB.
async function workerRequest(message, timeoutMs=3000){
 if(!('serviceWorker' in navigator))throw Error('Service Worker unavailable');
 const reg=state.reg || await navigator.serviceWorker.getRegistration('./') || await navigator.serviceWorker.ready;
 const worker=reg?.active || navigator.serviceWorker.controller;
 if(!worker)throw Error('Background worker has not activated');
 return await new Promise((resolve,reject)=>{
  const channel=new MessageChannel();let finished=false;
  const finish=(error,data)=>{if(finished)return;finished=true;clearTimeout(timeout);channel.port1.close();if(error)reject(error);else resolve(data);};
  const timeout=setTimeout(()=>finish(Error('Background worker did not respond')),timeoutMs);
  channel.port1.onmessage=e=>finish(null,e.data||{});
  worker.postMessage(message,[channel.port2]);
 });
}
async function identityToWorker(uid){
 const safeUid=validId(uid)?uid:'';
 // Return the result; caller may retry if an update is activating.
 for(let attempt=0;attempt<2;attempt++){
  try{
   const result=await workerRequest({type:'G8PUSH_SET_ACTIVE_USER',uid:safeUid});
   if(result?.ok)return true;
  }catch(_){}
  if(attempt===0)await new Promise(resolve=>setTimeout(resolve,350));
 }
 return false;
}
function readablePushTime(ms){
 if(!Number.isFinite(ms)||ms<=0)return 'Never';
 try{return new Date(ms).toLocaleString();}catch(_){return 'Unknown';}
}
async function checkBackground(){
 const el=$('g8pushCheckResult')||$('g8pushAdminCheckResult');
 if(!el)return;
 el.textContent='Checking background notification readiness…';
 try{
  const reg=await navigator.serviceWorker.getRegistration('./');
  if(!reg?.active)throw Error('No active Service Worker. Reload G8Code once.');
  const result=await workerRequest({type:'G8PUSH_INSPECT',uid:state.uid});
  const subscription=await reg.pushManager.getSubscription();
  const allowed=window.Notification?.permission==='granted';
  const sameAccount=Boolean(state.uid&&safeGet(optKey(state.uid))==='yes'&&result?.hasIdentity&&result?.identityMatchesUid===true);
  const last=result?.lastPush;
  if(!subscription||!allowed||!sameAccount){
   el.textContent='Background status: Not ready. '+(!allowed?'Allow browser notifications. ':!subscription?'Enable Phone Notifications again. ':'Reopen Account Settings and re-enable Phone Notifications to sync this account. ');
   return;
  }
  const lastText=last?.atMs?` Last push event: ${readablePushTime(last.receivedAtMs||last.atMs)}. Result: ${last.status||'received'}.`:' No background push event recorded on this browser yet.';
  el.textContent='Background status: Registered and linked to this account.'+lastText;
 }catch(err){el.textContent='Background check unavailable: '+(err?.message||err);}
}

async function loadSection(uid){
 try{
  const ownSection=(()=>{try{return typeof appSession!=='undefined'&&appSession?.student?.uid===uid?appSession.student.section:'';}catch(_){return '';}})();
  if(ownSection)return safeSection(ownSection);
  const snap=await state.database.get(state.database.ref(state.db,'g8MessagesV1/directory/'+uid));
  return safeSection(snap.val()?.section);
 }catch(_){return '';}
}
async function sdk(){
 if(state.sdkLoaded)return state.module;
 const v=window.MCS_FIREBASE_SDK_VERSION||'10.12.5';
 const base='https://www.gstatic.com/firebasejs/'+v;
 const [a,u,d]=await Promise.all([import(base+'/firebase-app.js'),import(base+'/firebase-auth.js'),import(base+'/firebase-database.js')]);
 const app=a.getApps().length?a.getApp():a.initializeApp(window.MCS_FIREBASE_CONFIG);
 state.auth=u.getAuth(app);state.db=d.getDatabase(app,window.MCS_FIREBASE_DATABASE_URL);
 state.database=d;state.authModule=u;state.sdkLoaded=true;
 return null;
}
async function saveInstallation(installationId){
 const uid=state.uid,deviceId=state.deviceId;
 if(!uid||safeGet(optKey(uid))!=='yes'||!validId(installationId)||!deviceId)return;
 const role=state.teacher?'teacher':'student';
 const section=state.teacher?'':await loadSection(uid);
 if(uid!==state.uid||safeGet(optKey(uid))!=='yes')return;
 await state.database.set(state.database.ref(state.db,`${ROOT}/${role==='teacher'?'teacherDevices':'devices'}/${uid}/${deviceId}`),{
  installationId,deviceId,section,enabled:true,updatedAtMs:Date.now()
 });
 state.registered=true;state.lastError='';render();
}
async function registerDevice(uid){
 if(!uid||state.registering||state.registered)return;
 const problem=support();if(problem){state.lastError=problem;render();return;}
 state.registering=true;state.lastError='';render();
 try{
  await sdk();
  // FID-based FCM registration requires the current SDK. Keep it in a
  // separate named Firebase app so G8Code's existing 10.12.5 auth/RTDB is untouched.
  const currentBase='https://www.gstatic.com/firebasejs/13.2.0';
  const [pushAppSdk,m]=await Promise.all([
   import(currentBase+'/firebase-app.js'),
   import(currentBase+'/firebase-messaging.js')
  ]);
  const pushApp=pushAppSdk.getApps().find(app=>app.name==='g8code-push-fcm')||pushAppSdk.initializeApp(window.MCS_FIREBASE_CONFIG,'g8code-push-fcm');
  state.module=m;
  if(!await m.isSupported())throw Error('Web Push is unavailable on this browser.');
  // Reuse the SINGLE app Service Worker registration. Registering a different
  // script URL for the same scope can trigger a controllerchange/reload loop.
  let reg=await navigator.serviceWorker.getRegistration('./');
  if(!reg)reg=await navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'});
  else try{await reg.update();}catch(error){console.info('Background worker refresh will retry:',error?.message||error);}
  state.reg=reg;await navigator.serviceWorker.ready;
  if(!await identityToWorker(uid))throw Error('Background worker could not save the active account. Please retry.');
  state.deviceId=getDeviceId();if(!state.deviceId)throw Error('Secure device registration is unavailable.');
  const messaging=m.getMessaging(pushApp);state.messaging=messaging;
  // Current FCM API: FID, not the deprecated getToken flow.
  if(!state.registeredHook){
   state.registeredHook=m.onRegistered(messaging,fid=>{void saveInstallation(fid).catch(err=>{state.lastError='Could not save phone registration: '+err.message;render();});});
   state.unregisteredHook=m.onUnregistered(messaging,()=>{state.registered=false;render();});
   // Some FCM implementations route foreground data messages to the page,
   // instead of dispatching a second background push event. The worker is
   // responsible for rendering BOTH with the exact same account check.
   state.foregroundHook=m.onMessage(messaging,payload=>{
    if(!payload?.data||!state.uid||safeGet(optKey(state.uid))!=='yes')return;
    try{const worker=state.reg?.active||navigator.serviceWorker?.controller;
     worker?.postMessage({type:'G8PUSH_FOREGROUND_ALERT',payload:{data:payload.data}});
    }catch(error){console.warn('Foreground alert handoff:',error?.message||error);}
   });
  }
  await m.register(messaging,{vapidKey:publicKey(),serviceWorkerRegistration:reg});
  // The FCM registration may update the worker asynchronously. Sync again.
  if(uid===state.uid&&!await identityToWorker(uid))throw Error('Could not confirm background notification registration. Try again.');
  if(uid!==state.uid){await identityToWorker(state.uid);return;}
  state.lastError='';
 }catch(err){state.lastError='Phone notification setup failed: '+(err?.message||err);state.registered=false;}
 finally{state.registering=false;render();}
}
async function enable(){
 if(!state.uid)return;
 state.lastError='';const problem=support();if(problem){state.lastError=problem;render();return;}
 try{
  const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
  if(permission!=='granted'){state.lastError='Notifications are blocked. Allow them in your browser or phone settings.';render();return;}
  safePut(optKey(state.uid),'yes');state.registered=false;await registerDevice(state.uid);
 }catch(err){state.lastError=String(err?.message||err);render();}
}
async function disable(){
 if(!state.uid)return;
 const uid=state.uid,deviceId=state.deviceId||getDeviceId();
 safeRemove(optKey(uid));state.registered=false;state.lastError='';state.registering=true;render();
 // Deactivate the local privacy gate immediately, before any cloud operation.
 await identityToWorker('');
 try{
  if(state.database&&state.db&&deviceId)await state.database.remove(state.database.ref(state.db,`${ROOT}/${state.teacher?'teacherDevices':'devices'}/${uid}/${deviceId}`));
  if(state.module&&state.messaging)await state.module.unregister(state.messaging);
 }catch(err){state.lastError='Local alerts disabled; remote cleanup may need retry: '+(err.message||err);}
 finally{state.registering=false;render();}
}
async function queueTeacherEvent(event){
 try{
  await (state.ready||init());
  const account=state.auth?.currentUser;
  if(!account||!teacherEmails().has(String(account.email||'').toLowerCase()))return false;
  if(!publicKey())return false; // Don't accumulate undeliverable events pre-setup.
  const type=String(event?.type||''),itemId=String(event?.itemId||'');
  if(!TYPES.has(type)||!validId(itemId))return false;
  let audience='all',targetUid='',audienceSection='',recipientUids=null;
  if(event.targetUid){if(!validId(event.targetUid))return false;audience='uid';targetUid=event.targetUid;}
  else if(event.recipientUids){
   const ids=Array.isArray(event.recipientUids)?event.recipientUids:Object.keys(event.recipientUids);
   const filtered=Array.from(new Set(ids.filter(validId))).slice(0,2500);
   if(!filtered.length)return false;
   audience='uids';recipientUids=Object.fromEntries(filtered.map(uid=>[uid,true]));
  }else if(event.audienceSection&&String(event.audienceSection).toLowerCase()!=='all'){
   audience='section';audienceSection=safeSection(event.audienceSection);
  }
  const record={type,itemId,createdByUid:account.uid,createdAtMs:Date.now(),audience,status:'pending'};
  if(targetUid)record.targetUid=targetUid;
  if(audienceSection)record.audienceSection=audienceSection;
  if(recipientUids)record.recipientUids=recipientUids;
  if(type==='messages'&&event?.notificationKind==='reaction'&&['heart','laugh','wow','sad','angry','like'].includes(event.reactionCode)){
   record.notificationKind='reaction';record.reactionCode=event.reactionCode;
  }
  if(type==='messages'&&event?.notificationKind==='ack'&&['received','checked'].includes(event.ackStatus)){
   record.notificationKind='ack';record.ackStatus=event.ackStatus;
  }
  const newRef=state.database.push(state.database.ref(state.db,`${ROOT}/outbox`));
  await state.database.set(newRef,record);
  // Do not hold the chat/lesson publish flow open for a cross-origin GAS call.
  // If the endpoint is unavailable or still being configured, the existing
  // 1-minute worker processes this same pending event without duplication.
  void nudgeImmediateSender(account,newRef.key);
  return true;
 }catch(err){console.warn('Phone alert could not be queued (main content was saved):',err?.message||err);return false;}
}

// Student-to-teacher events use deterministic IDs verified against saved RTDB records.
// A denied notification write never rolls back the original message/comment/reaction.
const EMOJI_CODES={'❤️':'heart','😂':'laugh','😮':'wow','😢':'sad','😡':'angry','👍':'like'};
async function queueVerified(eventId,record,needsTeacher){
 try{
  await (state.ready||init());
  const account=state.auth?.currentUser;
  if(!account||!validId(eventId)||record.createdByUid!==account.uid)return false;
  const teacher=teacherEmails().has(String(account.email||'').toLowerCase());
  if(teacher!==Boolean(needsTeacher))return false;
  const p=state.database.ref(state.db,`${ROOT}/outbox/${eventId}`);
  await state.database.set(p,{...record,createdAtMs:Date.now(),status:'pending'});
  void nudgeImmediateSender(account,eventId);
  return true;
 }catch(error){console.warn('Background alert not queued (content is saved):',error?.code||error?.message||error);return false;}
}
async function queueStudentMessage({messageId}={}){
 await (state.ready||init());const uid=state.auth?.currentUser?.uid;
 if(!validId(uid)||!validId(messageId))return false;
 return queueVerified(`s2t_${uid}_${messageId}`,{type:'messages',itemId:messageId,chatUid:uid,audience:'teacher',createdByUid:uid},false);
}
async function queueMessageReaction({messageId,chatUid,emoji}={}){
 await (state.ready||init());const account=state.auth?.currentUser;
 const code=EMOJI_CODES[emoji];if(!account||!code||!validId(messageId)||!validId(chatUid))return false;
 const teacher=teacherEmails().has(String(account.email||'').toLowerCase());
 // Student may react only to their teacher's message in their own chat.
 if(!teacher&&account.uid!==chatUid)return false;
 const eventId=(teacher?'rt_':'rs_')+chatUid+'_'+messageId+'_'+code;
 const record={type:'messages',itemId:messageId,createdByUid:account.uid,
  audience:teacher?'uid':'teacher',notificationKind:'reaction',reactionCode:code};
 if(teacher)record.targetUid=chatUid;else record.chatUid=chatUid;
 return queueVerified(eventId,record,teacher);
}
async function queueAnnouncementEngagement({postId,kind,reactionCode,commentId}={}){
 await (state.ready||init());const uid=state.auth?.currentUser?.uid;
 if(!validId(uid)||!validId(postId))return false;
 const record={type:'announcements',itemId:postId,createdByUid:uid,audience:'teacher'};
 let eventId='';
 if(kind==='reaction'&&['like','love','care'].includes(reactionCode)){
  record.engagementType='reaction';record.reactionCode=reactionCode;
  eventId=`aR_${uid}_${postId}_${reactionCode}`;
 }else if(kind==='comment'&&validId(commentId)){
  record.engagementType='comment';record.commentId=commentId;
  eventId=`aC_${uid}_${postId}_${commentId}`;
 }else if(kind==='comment_reaction'&&validId(commentId)){
  record.engagementType='comment_reaction';record.commentId=commentId;
  eventId=`aCR_${uid}_${postId}_${commentId}`;
 }
 return eventId?queueVerified(eventId,record,false):false;
}
async function queueTeacherAck({messageId,chatUid,status:ackStatus}={}){
 await (state.ready||init());
 const account=state.auth?.currentUser;
 if(!account||!validId(messageId)||!validId(chatUid)||!['received','checked'].includes(ackStatus))return false;
 // Server validates original saved photo/project AND exact ACK status.
 const eventId=`ack_${chatUid}_${messageId}_${ackStatus}`;
 return queueVerified(eventId,{type:'messages',itemId:messageId,createdByUid:account.uid,
  audience:'uid',targetUid:chatUid,notificationKind:'ack',ackStatus},true);
}

async function init(){
 if(state.ready)return state.ready;
 state.ready=(async()=>{
  if(!window.MCS_FIREBASE_CONFIG||!window.MCS_FIREBASE_DATABASE_URL)return;
  await sdk();
  state.deviceId=getDeviceId();
  state.authModule.onAuthStateChanged(state.auth,async account=>{
   const uid=account?.uid||'',teacher=Boolean(account&&teacherEmails().has(String(account.email||'').toLowerCase()));
   if(uid===state.uid&&teacher===state.teacher){render();return;}
   state.uid=uid;state.user=account;state.teacher=teacher;state.registered=false;state.lastError='';
   if('serviceWorker'in navigator&&location.protocol==='https:'){
    // Never display notifications for a previous account after account switch/logout.
    void identityToWorker(uid&&safeGet(optKey(uid,teacher))==='yes'?uid:'');
   }
   render();
   if(uid&&safeGet(optKey(uid,teacher))==='yes'&&window.Notification?.permission==='granted')void registerDevice(uid);
  });
  if('serviceWorker'in navigator){
   navigator.serviceWorker.addEventListener('controllerchange',()=>{
    const active=state.uid&&safeGet(optKey(state.uid))==='yes'?state.uid:'';
    void identityToWorker(active);
   });
  }
  // Delegation also works if Admin V2 creates its sidebar AFTER DOMContentLoaded.
  document.addEventListener('click',event=>{
   const btn=event.target.closest?.('#g8pushToggle,#g8pushAdminToggle');
   if(btn){event.preventDefault();if(btn.disabled)return;void (safeGet(optKey(state.uid))==='yes'?disable():enable());return;}
   if(event.target.closest?.('#g8pushCheck,#g8pushAdminCheck')){event.preventDefault();void checkBackground();}
  });
  window.addEventListener('focus',render,{passive:true});
  render();
 })().catch(err=>{state.lastError=err?.message||'Push setup unavailable';render();});
 return state.ready;
}
window.G8CodePush=Object.freeze({enable,disable,queueTeacherEvent,queueStudentMessage,queueMessageReaction,queueAnnouncementEngagement,queueTeacherAck,checkBackground,refresh:render});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void init();},{once:true});else void init();
})();
