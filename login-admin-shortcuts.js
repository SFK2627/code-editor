/* G8Code V1.1 Login shortcut badges — RTDB only, teacher-authenticated. */
(()=>{'use strict';
 const root='g8AdminActivityV1/unread';
 const tags=[...document.querySelectorAll('#entryGateTitle [data-g8-login-count]')];
 if(!tags.length)return;
 const hide=()=>{for(const b of tags){b.hidden=true;b.textContent='';}};
 const allowed=new Set((window.MCS_TEACHER_EMAILS||[]).map(email=>String(email).trim().toLowerCase()));
 function keyFor(e){
  if(e.category==='announcements')return [e.category,e.action,e.targetId,['comment_reaction','post_reply'].includes(e.action)?e.contextId||'':''].join(':');
  if(e.category==='messages')return [e.category,e.action,e.actorUid,e.targetId].join(':');
  return [e.category,e.action,e.targetId].join(':');
 }
 function update(rows){
  const grouped={place:new Set(),learn:new Set(),code:new Set(),connect:new Set()};
  for(const e of Object.values(rows||{})){
   if(!e||!e.category||!e.action||!e.targetId)continue;
   const k=keyFor(e);
   grouped.place.add(k);
   if(e.category==='announcements')grouped.learn.add(k);
   if(e.category==='messages')grouped.connect.add(k);
   // Code represents settings, not a fake badge. A badge appears only for actual settings alerts.
   if(e.category==='settings')grouped.code.add(k);
  }
  for(const b of tags){const count=grouped[b.dataset.g8LoginCount]?.size||0;b.hidden=!count;b.textContent=count>99?'99+':String(count);}
 }
 async function start(){
  if(!window.MCS_FIREBASE_CONFIG||!window.MCS_FIREBASE_DATABASE_URL)return hide();
  try{
   const version=window.MCS_FIREBASE_SDK_VERSION||'10.12.5',base=`https://www.gstatic.com/firebasejs/${version}`;
   const [appMod,authMod,dbMod]=await Promise.all([import(`${base}/firebase-app.js`),import(`${base}/firebase-auth.js`),import(`${base}/firebase-database.js`)]);
   const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(window.MCS_FIREBASE_CONFIG);
   const auth=authMod.getAuth(app),db=dbMod.getDatabase(app,window.MCS_FIREBASE_DATABASE_URL);
   let unsubscribe=null;
   authMod.onAuthStateChanged(auth,user=>{
    unsubscribe?.();unsubscribe=null;hide();
    if(!user||!allowed.has(String(user.email||'').toLowerCase()))return;
    unsubscribe=dbMod.onValue(dbMod.ref(db,root),snapshot=>update(snapshot.val()||{}),error=>{hide();console.warn('[G8Code] Login badges unavailable:',error?.code||error?.message)});
   },error=>{hide();console.warn('[G8Code] Teacher auth:',error?.code||error?.message)});
  }catch(error){hide();console.warn('[G8Code] Login shortcuts:',error?.message);}
 }
 hide();start();
})();
