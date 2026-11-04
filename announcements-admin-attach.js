/* G8Code V5.21 — Admin resource-to-Announcement shortcuts and catalog mirror.
 * Uses the already-loaded Lessons / Activities Given or their existing local
 * caches. No academic Firestore queries are performed by this module.
 * Only compact resource labels / IDs are mirrored to teacher-only RTDB.
 */
(()=>{'use strict';
const KEY='g8announcementPendingAttach',ROOT='g8AnnouncementsV1/catalog';
const EMAILS=new Set((window.MCS_TEACHER_EMAILS||[]).map(x=>String(x).toLowerCase()));
const localKeys={lessons:'studentCodeStudio.lessonLibrary.v1',activities:'studentCodeStudio.givenActivities.v1'};
let dbSdk=null,db=null,authUser=null,checkQueued=false;
const lastHashes={lessons:'',activities:''};
function cached(type){
 try{const data=JSON.parse(localStorage.getItem(localKeys[type])||'null')||{};return type==='lessons'?data.lessons:data.items;}
 catch{return null;}
}
function currentRows(type){
 try{
  if(type==='lessons'&&typeof lessonLibraryState!=='undefined'&&lessonLibraryState.loaded)return lessonLibraryState.lessons;
  if(type==='activities'&&typeof givenActivityState!=='undefined'&&givenActivityState.loaded)return givenActivityState.items;
 }catch{}
 return cached(type);
}
function catalogSnapshot(type){
 const rows=currentRows(type);
 if(!Array.isArray(rows))return null;
 const items={};
 rows.slice(0,500).forEach(raw=>{
  const id=String(raw?.id||'').trim();if(!/^[\w-]{1,128}$/.test(id))return;
  items[id]={
   id,title:String(raw.title||'Untitled').slice(0,140),
   description:String(raw.description||'').slice(0,160),
   term:['term1','term2','term3'].includes(raw.term)?raw.term:'term1',
   order:Math.max(1,Math.min(999,Number(raw.order||1))),
   published:type==='lessons'?true:(raw.published===true||raw.visibility==='published'),
   audienceSection:type==='lessons'?'all':String(raw.audienceSection||'all').slice(0,100),
   isQuiz:type==='activities'&&raw.isQuiz===true,
   isPeta:type==='activities'&&raw.isPeta===true
  };
 });
 return items;
}
async function syncCatalog(){
 if(!dbSdk||!db||!authUser||!EMAILS.has(String(authUser.email||'').toLowerCase()))return;
 for(const type of ['lessons','activities']){
  const items=catalogSnapshot(type);if(items===null)continue;
  const hash=JSON.stringify(items);if(lastHashes[type]===hash)continue;
  // Update only teacher-private RTDB metadata; no Firestore operations.
  try{await dbSdk.set(dbSdk.ref(db,ROOT+'/'+type),{updatedAtMs:Date.now(),items});lastHashes[type]=hash;}
  catch(error){console.warn('Announcement '+type+' catalog sync:',error?.message||error);}
 }
}
function install(){
 const sel='.lesson-admin-row[data-admin-lesson-id],.given-activity-admin-row[data-given-admin-id]';
 for(const row of document.querySelectorAll(sel)){
  if(row.querySelector('[data-announcement-attach]'))continue;
  const isLesson=row.matches('.lesson-admin-row');
  const type=isLesson?'lesson':'activity';
  const itemId=row.getAttribute(isLesson?'data-admin-lesson-id':'data-given-admin-id');
  const title=(row.querySelector(isLesson?'.lesson-admin-row-title strong':'.given-activity-admin-title-line strong')?.textContent||'').trim();
  const actions=row.querySelector(isLesson?'.lesson-admin-row-actions':'.given-activity-admin-actions');
  if(!actions||!itemId)continue;
  const b=document.createElement('button');b.type='button';b.className='ghost-btn mini g8-announcement-attach-btn';b.setAttribute('data-announcement-attach',type);
  b.title='Create an announcement with this resource attached';b.textContent='📣 Announce';
  b.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   try{sessionStorage.setItem(KEY,JSON.stringify({type,itemId,name:title||type,atMs:Date.now()}));}catch{}
   location.assign('announcements.html?from=admin&add=1');
  });
  actions.append(b);
 }
}
function queueCheck(){
 if(checkQueued)return;checkQueued=true;
 requestAnimationFrame(()=>{checkQueued=false;install();void syncCatalog();});
}
async function connectCatalog(){
 if(!window.MCS_FIREBASE_CONFIG||!window.MCS_FIREBASE_DATABASE_URL)return;
 try{
  const base=`https://www.gstatic.com/firebasejs/${window.MCS_FIREBASE_SDK_VERSION||'10.12.5'}`;
  const [appSdk,authSdk,databaseSdk]=await Promise.all([import(base+'/firebase-app.js'),import(base+'/firebase-auth.js'),import(base+'/firebase-database.js')]);
  const app=appSdk.getApps().length?appSdk.getApp():appSdk.initializeApp(window.MCS_FIREBASE_CONFIG);
  dbSdk=databaseSdk;db=databaseSdk.getDatabase(app,window.MCS_FIREBASE_DATABASE_URL);
  authSdk.onAuthStateChanged(authSdk.getAuth(app),user=>{
   authUser=user;
   if(user&&EMAILS.has(String(user.email||'').toLowerCase()))queueCheck();
  });
 }catch(error){console.warn('Announcement catalog initialization:',error?.message||error);}
}
function init(){
 install();
 for(const id of ['lessonAdminList','givenActivityAdminList']){
  const host=document.getElementById(id);
  if(host)new MutationObserver(queueCheck).observe(host,{childList:true,subtree:true});
 }
 // Existing session caches are mirrored when the admin signs in; future list
 // render updates refresh the metadata, without forcing any academic reads.
 void connectCatalog();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
