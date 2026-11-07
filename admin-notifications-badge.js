/* Compact teacher badge, RTDB-only; no Firestore SDK or account scans. */
(()=>{'use strict';
 const TEACHER=new Set((window.MCS_TEACHER_EMAILS||[]).map(e=>String(e).toLowerCase()));
 async function boot(){
  try{
   if(!window.MCS_FIREBASE_CONFIG||!window.MCS_FIREBASE_DATABASE_URL)return;
   const v=window.MCS_FIREBASE_SDK_VERSION||'10.12.5',base=`https://www.gstatic.com/firebasejs/${v}`;
   const [app,auth,db]=await Promise.all([import(`${base}/firebase-app.js`),import(`${base}/firebase-auth.js`),import(`${base}/firebase-database.js`)]);
   const instance=app.getApps().length?app.getApp():app.initializeApp(window.MCS_FIREBASE_CONFIG);
   const firebaseAuth=auth.getAuth(instance),database=db.getDatabase(instance,window.MCS_FIREBASE_DATABASE_URL);
   let stop=()=>{};
   auth.onAuthStateChanged(firebaseAuth,user=>{
    stop();stop=()=>{};
    if(!user||!TEACHER.has(String(user.email||'').toLowerCase()))return;
    stop=db.onValue(db.ref(database,'g8AdminActivityV1/unread'),snapshot=>{
     const values=Object.values(snapshot.val()||{}),groups=new Set();
     for(const e of values){if(!e||!e.category||!e.action)continue;
      const key=e.category==='announcements'?`${e.category}:${e.action}:${e.targetId}:${['comment_reaction','post_reply'].includes(e.action)?e.contextId||'':''}`:
       e.category==='messages'?`${e.category}:${e.action}:${e.actorUid}:${e.targetId}`:`${e.category}:${e.action}:${e.targetId}`;
      groups.add(key);
     }
     const count=groups.size;
     document.querySelectorAll('[data-admin-activity-badge]').forEach(b=>{b.hidden=count===0;b.textContent=count>99?'99+':String(count);});
    },err=>console.warn('[G8Code] Notification badge:',err));
   });
  }catch(err){console.warn('[G8Code] Notification badge unavailable:',err);}
 }
 boot();
})();
