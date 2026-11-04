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
 // Moving from the verified Student Homepage to another G8Code page is internal
 // navigation, not an Exit App. Bypass the broad app exit guard ONLY when no
 // editor, wireframe, live game, or project save is at risk. Browser close/reload
 // and all unsaved-work warnings remain protected by script.js.
 button.addEventListener('click',event=>{
  if(event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
  const homeVisible=typeof studentHomeScreen!=='undefined' && studentHomeScreen && !studentHomeScreen.classList.contains('hidden');
  const signedIn=typeof appSession!=='undefined' && appSession.mode==='student' && Boolean(appSession.student);
  const projectBusy=(typeof studentProjectDirty!=='undefined' && studentProjectDirty) ||
   (typeof studentProjectSaveInFlight!=='undefined' && studentProjectSaveInFlight);
  const wireframeBusy=typeof wireframeMakerState!=='undefined' && Boolean(wireframeMakerState?.dirty);
  let gameBusy=false;
  try{gameBusy=Boolean(window.ICT8XpMiniGames?.isGameOpen?.());}catch(_){gameBusy=true;}
  if(homeVisible && signedIn && !projectBusy && !wireframeBusy && !gameBusy){
   window.ICT8AppExitGuard?.allowNextUnload?.();
  }
 });
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
// Announcements -> native G8Code reader handoff.
// Wait for the verified resume route to finish. The Firebase auth observer may
// populate appSession.student BEFORE appSession.mode becomes "student"; opening
// viewers at that intermediate point previously produced a broken guest/pending
// layout, hidden menu, and incorrect theme on both desktop and mobile.
function routeAttachedResource(){
 const params=new URLSearchParams(location.search);
 const type=params.get('gaOpen'),itemId=params.get('gaItem');
 if(!['lesson','activity'].includes(type)||!/^[A-Za-z0-9_-]{1,128}$/.test(itemId||''))return;
 let opening=false,finished=false;
 const expiresAt=Date.now()+180000;
 let timer=null,observer=null;
 function stop(){if(timer)clearInterval(timer);timer=null;observer?.disconnect();observer=null;}
 function clearHandoff(){
  const url=new URL(location.href);
  url.searchParams.delete('gaOpen');url.searchParams.delete('gaItem');
  url.searchParams.delete('g8mBack');
  try{history.replaceState(history.state,'',url.pathname+url.search+url.hash);}catch(_){}
 }
 function verifiedReady(){
  if(typeof appSession==='undefined' || appSession.mode!=='student' || !appSession.student?.uid)return false;
  if(typeof getFirebaseActiveUser!=='function' || getFirebaseActiveUser()?.uid!==appSession.student.uid)return false;
  // activateStudentSession sets route-lock before awaiting the Student Home.
  // Requiring the unlocked, visible native Home avoids competing with setup.
  if(document.body.classList.contains('student-route-lock'))return false;
  const home=document.getElementById('studentHomeScreen');
  return document.body.classList.contains('student-home-active') && home && !home.classList.contains('hidden');
 }
 async function displayError(message){
  if(typeof appAlert==='function'){
   try{await appAlert(message,{title:'Attachment unavailable',icon:'📎'});return;}catch(_){}
  }
  window.alert(message);
 }
 async function attempt(){
  if(opening||finished)return;
  if(Date.now()>expiresAt){stop();return;} // Keep URL for verified sign-in after a slow connection.
  if(!verifiedReady())return;
  opening=true;
  try{
   if(typeof closeLoginLackingReminder==='function')closeLoginLackingReminder({stopMusicOnClose:true});
   if(type==='lesson'){
    if(typeof openLessonLibrary!=='function')throw Error('Lessons is not ready.');
    await openLessonLibrary('home');
    const item=(typeof lessonLibraryState!=='undefined'?lessonLibraryState.lessons:[])?.find(row=>row.id===itemId);
    if(!item){finished=true;clearHandoff();await displayError('This Lesson is no longer available. Please check the Lessons page.');return;}
    // The linked item may belong to a different term than the current one.
    lessonLibraryState.activeTerm=item.term;
    if(typeof renderStudentLessonLibrary==='function')renderStudentLessonLibrary();
    if(typeof openLessonPdfViewer==='function')openLessonPdfViewer(item.id);
   }else{
    if(typeof openGivenActivitiesLibrary!=='function')throw Error('Activities is not ready.');
    await openGivenActivitiesLibrary('home');
    const items=typeof givenActivityState!=='undefined'?givenActivityState.items:[];
    const item=items.find(row=>row.id===itemId && row.published &&
      typeof givenActivityMatchesAudience==='function' && givenActivityMatchesAudience(row));
    if(!item){finished=true;clearHandoff();await displayError('This Activity is not published or available to your section.');return;}
    givenActivityState.activeTerm=item.term;
    if(typeof renderStudentGivenActivities==='function')renderStudentGivenActivities();
    if(typeof openGivenActivityEntry==='function')openGivenActivityEntry(item.id);
   }
   finished=true;clearHandoff();
  }catch(error){
   console.error('G8Code announcement attachment handoff:',error);
   // Do not falsely mark this link consumed on a transient failure. The student
   // remains on the native reader and can retry via Announcements.
   finished=true;
   await displayError('Could not open the attached '+type+'. Please open it through the normal '+(type==='lesson'?'Lessons':'Activities')+' page.');
  }finally{opening=false;stop();}
 }
 // Detect when the existing authenticated student resume finishes. Poll only
 // while a valid deep link is pending, as a fallback for older browsers.
 observer=new MutationObserver(()=>{void attempt();});
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 timer=setInterval(()=>{void attempt();},400);
 void attempt();
}

function init(){mountStudentShortcut();void startBadge();void routeAttachedResource();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
