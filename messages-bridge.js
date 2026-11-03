/* G8Code Messages V1.1: click navigation first; optional Firebase unread badges second.
   Classic script supports direct file:// page opening (no local ESM CORS failure).
   Firebase access remains restricted by Authentication and Database rules. */
(function(){
 'use strict';
 const studentBadge=document.getElementById('studentHomeMessagesBadge');
 let detach=()=>{};
 const redirect=from=>`messages.html${from==='admin'?'?from=admin':''}`;
 // The student action is also a real href in index.html, so even if this
 // optional unread-badge script fails, opening Messages must still work.
 document.addEventListener('click',e=>{
  const button=e.target.closest?.('[data-g8-messages-open]');
  if(!button)return;
  e.preventDefault();
  try{window.ICT8AppExitGuard?.allowNextUnload?.();}catch(_){}
  window.location.assign(redirect(button.getAttribute('data-g8-messages-open')));
 });
 function setBadge(n){
  const count=Math.max(0,Math.floor(Number(n)||0));
  [studentBadge,...document.querySelectorAll('#adminOverlay [data-msg-inbox-badge]')]
   .filter(Boolean).forEach(el=>{el.textContent=count>99?'99+':String(count);el.hidden=!count;});
 }
 const cfg=window.MCS_FIREBASE_CONFIG, url=window.MCS_FIREBASE_DATABASE_URL;
 if(!cfg||!url)return;
 (async()=>{
  try{
   const v=window.MCS_FIREBASE_SDK_VERSION||'10.12.5';
   const base=`https://www.gstatic.com/firebasejs/${v}`;
   const [a,au,d]=await Promise.race([
    Promise.all([import(`${base}/firebase-app.js`),import(`${base}/firebase-auth.js`),import(`${base}/firebase-database.js`)]),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('Firebase badge connection timed out')),15000))
   ]);
   const app=a.getApps().length?a.getApp():a.initializeApp(cfg);
   const auth=au.getAuth(app),db=d.getDatabase(app,url);
   au.onAuthStateChanged(auth,user=>{
    detach();detach=()=>{};setBadge(0);
    if(!user)return;
    const teachers=(window.MCS_TEACHER_EMAILS||[]).map(x=>String(x).toLowerCase());
    const isTeacher=teachers.includes(String(user.email||'').toLowerCase());
    const target=isTeacher?'g8MessagesV1/summary':`g8MessagesV1/summary/${user.uid}`;
    detach=d.onValue(d.ref(db,target),snap=>{
     const value=snap.val();
     const unread=isTeacher?
      Object.values(value||{}).reduce((sum,x)=>sum+Math.max(0,Number(x?.unreadTeacher||0)),0):
      Math.max(0,Number(value?.unreadStudent||0));
     setBadge(unread);
    },err=>{console.warn('G8Code Messages badge unavailable:',err);setBadge(0);});
   },err=>console.warn('G8Code Messages authentication unavailable:',err));
  }catch(error){
   // Messages navigation must keep working even when badges cannot connect.
   console.warn('G8Code Messages unread badges unavailable:',error);
  }
 })();
})();
