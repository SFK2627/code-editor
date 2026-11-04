/* G8Code Announcements V1 — student navigation, per-account RTDB badge, deep links.
 * No Firestore import/query/write. Existing academic pages retain their own storage. */
(()=>{'use strict';
const BASE='g8AnnouncementsV1';
let feed={},seen={},currentUid='',stopFeed=null,stopSeen=null;
const homeMessage=document.getElementById('studentHomeMsgBtn');
const badges=[];
function mountStudentShortcut(){
 if(!homeMessage||document.getElementById('studentHomeAnnouncementsBtn'))return;
 const button=document.createElement('a');button.href='announcements.html?from=student';button.id='studentHomeAnnouncementsBtn';button.className='g8-home-messages g8-home-announcements';button.setAttribute('aria-label','Open class announcements');
 button.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4l8 3V7l-8 3Z"/><path d="M11 7 20 3v18l-9-4"/><path d="m6 16 2 5"/><path d="M20 9a4 4 0 0 1 0 6"/></svg><span>Announcements</span><b id="studentHomeAnnouncementsBadge" class="g8-home-msg-badge" hidden>0</b>';
 homeMessage.insertAdjacentElement('afterend',button);badges.push(button.querySelector('b'));
}
function updateBadge(){let count=0;for(const [id,p] of Object.entries(feed||{}))if(p?.status==='published'&&!seen?.[id])count++;for(const b of badges){if(!b)continue;b.textContent=count>99?'99+':String(count);b.hidden=count===0;}const btn=document.getElementById('studentHomeAnnouncementsBtn');if(btn)btn.title=count?`${count} unread announcement${count===1?'':'s'}`:'Announcements';}
async function startBadge(){
 if(!homeMessage||!window.MCS_FIREBASE_CONFIG||!window.MCS_FIREBASE_DATABASE_URL)return;
 try{
 const base=`https://www.gstatic.com/firebasejs/${window.MCS_FIREBASE_SDK_VERSION||'10.12.5'}`;
 const [appSdk,authSdk,dbSdk]=await Promise.all([import(base+'/firebase-app.js'),import(base+'/firebase-auth.js'),import(base+'/firebase-database.js')]);
 const app=appSdk.getApps().length?appSdk.getApp():appSdk.initializeApp(window.MCS_FIREBASE_CONFIG);
 const auth=authSdk.getAuth(app),db=dbSdk.getDatabase(app,window.MCS_FIREBASE_DATABASE_URL);
 authSdk.onAuthStateChanged(auth,user=>{
 stopFeed?.();stopSeen?.();stopFeed=stopSeen=null;feed={};seen={};currentUid='';updateBadge();
 if(!user|| (window.MCS_TEACHER_EMAILS||[]).some(email=>String(email).toLowerCase()===String(user.email||'').toLowerCase()))return;
 currentUid=user.uid;
 stopFeed=dbSdk.onValue(dbSdk.ref(db,BASE+'/feeds/'+user.uid),snapshot=>{if(currentUid!==user.uid)return;feed=snapshot.val()||{};updateBadge();},error=>console.info('Announcements badge feed:',error.message));
 stopSeen=dbSdk.onValue(dbSdk.ref(db,BASE+'/seen/'+user.uid),snapshot=>{if(currentUid!==user.uid)return;seen=snapshot.val()||{};updateBadge();},error=>console.info('Announcements badge read status:',error.message));
 });
 }catch(error){console.warn('Announcements badge unavailable:',error.message);}
}
// Deep links are handoffs to the actual G8Code lesson/activity viewers. Never clone
// or fetch the existing academic records here; honor their published/audience gates.
async function routeAttachedResource(){
 const query=new URLSearchParams(location.search),type=query.get('gaOpen'),itemId=query.get('gaItem');
 if(!['lesson','activity'].includes(type)||!itemId||!/^[A-Za-z0-9_-]{1,128}$/.test(itemId))return;
 let working=false,done=false;
 const route=async()=>{
  if(done||working)return;
  if(typeof appSession==='undefined'||!appSession?.student||typeof openLessonLibrary!=='function'||typeof openGivenActivitiesLibrary!=='function')return;
  working=true;
  try{
   if(typeof closeLoginLackingReminder==='function')closeLoginLackingReminder({stopMusicOnClose:true});
   if(type==='lesson'){
    await openLessonLibrary('home');
    const lesson=typeof lessonLibraryState==='undefined'?null:lessonLibraryState.lessons?.find(x=>x.id===itemId);
    if(!lesson){window.alert('The requested lesson is no longer available.');done=true;return;}
    if(lessonLibrarySearch)lessonLibrarySearch.value='';
    if(typeof openLessonPdfViewer==='function')openLessonPdfViewer(itemId);
   }else{
    await openGivenActivitiesLibrary('home');
    const activity=typeof givenActivityState==='undefined'?null:givenActivityState.items?.find(x=>x.id===itemId&&x.published&&givenActivityMatchesAudience(x));
    if(!activity){window.alert('This activity is not published or available to your section.');done=true;return;}
    if(typeof openGivenActivityEntry==='function')openGivenActivityEntry(itemId);
   }
   done=true;
  }catch(error){console.error('Announcement attachment navigation failed:',error);window.alert('Could not open this lesson or activity. Please try the normal Lessons or Activities page.');done=true;}
  finally{working=false;if(done){clearInterval(interval);query.delete('gaOpen');query.delete('gaItem');try{history.replaceState(history.state,'',location.pathname+(query.size?'?'+query:'')+location.hash);}catch{}}}
 };
 const interval=setInterval(route,550);
 void route();
 // Retain links for a normal sign-in flow; no background Firebase operations.
 setTimeout(()=>{if(!done)clearInterval(interval);},180000);
}
function init(){mountStudentShortcut();void startBadge();void routeAttachedResource();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
