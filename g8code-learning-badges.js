/* G8Code Learning Notifications V1 — tiny RTDB publish index, account-scoped unread state.
 * Reuses the existing Firebase app, auth, and Lessons/Activities source of truth.
 * Never reads full Firestore student records in a repeating poll.
 * Student cannot publish; admin can only publish after Firestore save succeeds.
 */
(()=>{'use strict';
 const BASE='g8NotificationsV1';
 const TYPES=['lessons','activities'];
 const TEACHER_EMAILS=()=>new Set((window.MCS_TEACHER_EMAILS||['sirjr.mcsian@gmail.com']).map(e=>String(e).toLowerCase()));
 const $=id=>document.getElementById(id);
 const state={uid:'',isTeacher:false,section:'',catalog:{lessons:{},activities:{}},seen:{lessons:{},activities:{}},ready:{lessons:false,activities:false,seen:false},dirty:false,teardown:[],sdk:null,db:null,auth:null};
 const safeId=value=>/^[A-Za-z0-9_-]{1,128}$/.test(String(value||''))?String(value):'';
 const safeSection=value=>String(value||'').trim().toLowerCase();
 const stamp=()=>Date.now();
 let renderQueued=false;
 function studentProfile(){
  try{if(typeof appSession==='undefined'||appSession.mode!=='student'||!appSession.student)return null;
   if(appSession.student.uid!==state.uid)return null;
   return appSession.student;
  }catch(_){return null;}
 }
 function reset(){state.catalog={lessons:{},activities:{}};state.seen={lessons:{},activities:{}};state.ready={lessons:false,activities:false,seen:false};state.section='';state.teardown.splice(0).forEach(fn=>{try{fn();}catch(_){}});scheduleRender();}
 function isRelevant(type,item){
  if(!item||item.active!==true||!(Number(item.version)>0))return false;
  if(type==='lessons')return true;
  const section=safeSection(studentProfile()?.section);
  const audience=safeSection(item.audienceSection||'all');
  return audience==='all'||(section&&audience===section);
 }
 function unread(type,id,item){return isRelevant(type,item)&&Number(state.seen?.[type]?.[id]||0)!==Number(item.version||0);}
 function getCount(type){
  if(!studentProfile()||!state.ready[type]||!state.ready.seen)return 0;
  return Object.entries(state.catalog[type]||{}).reduce((total,[id,item])=>total+(unread(type,id,item)?1:0),0);
 }
 function makeBadge(container,position){
  let badge=container.querySelector(':scope > .g8n-badge');
  if(!badge){badge=document.createElement('span');badge.className='g8n-badge';badge.setAttribute('aria-hidden','true');container.appendChild(badge);}
  if(position)badge.dataset.position=position;
  return badge;
 }
 function paintCount(type,count){
  const selector=[`#studentHomeScreen [data-home-action="${type}"]`, `[data-learning-action="${type}"]`].join(',');
  document.querySelectorAll(selector).forEach(el=>{
   const badge=makeBadge(el);
   badge.hidden=count===0;badge.textContent=count>99?'99+':String(count);
   const simple=type==='lessons'?'lesson':'activity';
   const text=count?`${count} new ${simple}${count===1?'':'s'}`:'';
   el.dataset.g8nTitle=text;
  });
 }
 function paintCards(type){
  const grid=$(type==='lessons'?'lessonLibraryGrid':'givenActivitiesGrid');
  if(!grid)return;
  const selector=type==='lessons'?'[data-lesson-id]':'[data-given-activity-id]';
  grid.querySelectorAll(selector).forEach(card=>{
   const id=safeId(card.dataset[type==='lessons'?'lessonId':'givenActivityId']);
   const item=state.catalog[type]?.[id];
   const newFlag=Boolean(id&&state.ready.seen&&state.ready[type]&&unread(type,id,item)&&studentProfile());
   let pill=card.querySelector(':scope > .g8n-card-new');
   if(newFlag&&!pill){pill=document.createElement('span');pill.className='g8n-card-new';pill.textContent='NEW';pill.setAttribute('aria-label','Newly posted');card.appendChild(pill);}
   if(pill)pill.hidden=!newFlag;
  });
 }
 function render(){
  renderQueued=false;
  if(!studentProfile()){TYPES.forEach(type=>paintCount(type,0));return;}
  TYPES.forEach(type=>{paintCount(type,getCount(type));paintCards(type);});
 }
 function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(render);}
 function markViewed(type,itemId){
  const id=safeId(itemId),profile=studentProfile(),item=state.catalog?.[type]?.[id];
  if(!TYPES.includes(type)||!id||!profile||!item||!unread(type,id,item))return;
  const version=Number(item.version);
  if(!version)return;
  if(!state.seen[type])state.seen[type]={};
  state.seen[type][id]=version;scheduleRender();
  try{localStorage.setItem(`g8code.read.${profile.uid}.${type}.${id}`,String(version));}catch(_){ }
  const sdk=state.sdk,db=state.db,uid=state.uid;
  if(sdk&&db){sdk.set(sdk.ref(db,`${BASE}/seen/${uid}/${type}/${id}`),version).catch(err=>console.warn('Read badge sync unavailable:',err.message));}
 }
 function localHydrate(){
  // Cached per-account seen flags make badges stable while the live listener starts.
  if(!state.uid)return;
  for(const type of TYPES){for(const [id,item] of Object.entries(state.catalog[type]||{})){
   try{const n=Number(localStorage.getItem(`g8code.read.${state.uid}.${type}.${id}`)||0);if(n===Number(item?.version))state.seen[type][id]=n;}catch(_){ }
  }}
 }
 function bindStudent(uid){
  const {sdk,db}=state;if(!sdk||!db)return;
  const subscribe=(path,fn)=>sdk.onValue(sdk.ref(db,path),snap=>{if(state.uid!==uid)return;fn(snap.val()||{});scheduleRender();},err=>{console.warn('Learning badge subscription:',err.message);});
  for(const type of TYPES){state.teardown.push(subscribe(`${BASE}/catalog/${type}`,val=>{state.catalog[type]=val;state.ready[type]=true;localHydrate();}));}
  state.teardown.push(subscribe(`${BASE}/seen/${uid}`,val=>{
   for(const type of TYPES){const incoming=val?.[type]||{};for(const [id,version] of Object.entries(incoming)){const n=Number(version)||0;if(n>Number(state.seen[type]?.[id]||0))state.seen[type][id]=n;}}state.ready.seen=true;localHydrate();
  }));
 }
 async function publish(type,record){
  if(!TYPES.includes(type)||!record||!state.sdk||!state.db)return {ok:false,error:'Notification connection unavailable'};
  const user=state.auth?.currentUser;
  if(!user||!TEACHER_EMAILS().has(String(user.email||'').toLowerCase()))return {ok:false,error:'Teacher authentication required'};
  const id=safeId(record.id);if(!id)return {ok:false,error:'Invalid item ID'};
  const path=state.sdk.ref(state.db,`${BASE}/catalog/${type}/${id}`);
  try{
   if(type==='activities'&&record.published!==true){await state.sdk.remove(path);return {ok:true};}
   await state.sdk.set(path,{active:true,version:stamp(),term:String(record.term||'term1').slice(0,20),audienceSection:type==='lessons'?'all':String(record.audienceSection||'all').slice(0,100)});
   // Only after confirmed class publish. No notification failure can roll back Firestore.
   void window.G8CodePush?.queueTeacherEvent?.({type,itemId:id,audienceSection:type==='lessons'?'all':String(record.audienceSection||'all')});
   return {ok:true};
  }catch(err){return {ok:false,error:err?.message||'RTDB notification write failed'};}
 }
 async function remove(type,itemId){
  const id=safeId(itemId),user=state.auth?.currentUser;
  if(!TYPES.includes(type)||!id||!state.db||!state.sdk||!user||!TEACHER_EMAILS().has(String(user.email||'').toLowerCase()))return {ok:false};
  try{await state.sdk.remove(state.sdk.ref(state.db,`${BASE}/catalog/${type}/${id}`));return {ok:true};}catch(err){console.warn('Notification removal:',err.message);return {ok:false};}
 }
 window.G8CodeLearningBadges=Object.freeze({publish,remove,markViewed,refresh:scheduleRender,getCount});
 // Handle lesson/activity rerender without observing subtree changes caused by our own badges.
 const grids=['lessonLibraryGrid','givenActivitiesGrid'];
 function observeCards(){for(const id of grids){const el=$(id);if(el)new MutationObserver(mutations=>{
  if(mutations.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&(n.matches?.('.lesson-library-card,.given-activity-card')||n.querySelector?.('.lesson-library-card,.given-activity-card')))))scheduleRender();
 }).observe(el,{childList:true});}}
 async function init(){
  observeCards();
  const config=window.MCS_FIREBASE_CONFIG,url=window.MCS_FIREBASE_DATABASE_URL;
  if(!config||!url)return;
  try{
   const base=`https://www.gstatic.com/firebasejs/${window.MCS_FIREBASE_SDK_VERSION||'10.12.5'}`;
   const [appSdk,authSdk,dbSdk]=await Promise.all([import(base+'/firebase-app.js'),import(base+'/firebase-auth.js'),import(base+'/firebase-database.js')]);
   const app=appSdk.getApps().length?appSdk.getApp():appSdk.initializeApp(config);
   state.sdk=dbSdk;state.auth=authSdk.getAuth(app);state.db=dbSdk.getDatabase(app,url);
   authSdk.onAuthStateChanged(state.auth,user=>{
    if(state.uid===user?.uid&&state.isTeacher===TEACHER_EMAILS().has(String(user?.email||'').toLowerCase())){scheduleRender();return;}
    reset();state.uid=user?.uid||'';state.isTeacher=Boolean(user&&TEACHER_EMAILS().has(String(user.email||'').toLowerCase()));
    if(user&&!state.isTeacher)bindStudent(user.uid);
   });
   // When the app switches to a signed-in student view after Firebase auth fires,
   // refresh badge visibility without incurring database reads or writes.
   const home=$('studentHomeScreen');if(home)new MutationObserver(scheduleRender).observe(home,{attributes:true,attributeFilter:['class']});
   document.addEventListener('click',event=>{if(event.target.closest?.('[data-home-action="lessons"],[data-home-action="activities"],[data-learning-action="lessons"],[data-learning-action="activities"]'))scheduleRender();});
  }catch(error){console.warn('G8Code learning badges unavailable:',error);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else void init();
})();
