/* G8Code Learning Notifications V2 — confirmed RTDB publication + account-scoped NEW badges.
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
 const safeSection=value=>String(value||'').normalize('NFKC').trim().toLowerCase().replace(/[‐‑‒–—]/g,'-').replace(/\s+/g,' ');
 const stamp=()=>Date.now();
 let renderQueued=false, initPromise=null;
 const errorName=error=>String(error?.code||error?.message||error||'unknown').slice(0,240);
 const configUrl=()=>String(window.G8CODE_PUSH_IMMEDIATE_URL||'').trim();
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
  const subscribe=(path,fn)=>sdk.onValue(sdk.ref(db,path),snap=>{if(state.uid!==uid)return;fn(snap.val()||{});scheduleRender();},err=>{console.warn('Learning badge subscription',path+':',errorName(err));});
  for(const type of TYPES){state.teardown.push(subscribe(`${BASE}/catalog/${type}`,val=>{state.catalog[type]=val;state.ready[type]=true;localHydrate();}));}
  state.teardown.push(subscribe(`${BASE}/seen/${uid}`,val=>{
   for(const type of TYPES){const incoming=val?.[type]||{};for(const [id,version] of Object.entries(incoming)){const n=Number(version)||0;if(n>Number(state.seen[type]?.[id]||0))state.seen[type][id]=n;}}state.ready.seen=true;localHydrate();
  }));
 }
 async function verifiedServerPublish(type,record,id,originalError){
  // This optional fallback uses ONLY the existing verified teacher Apps Script.
  // An opaque cross-origin response cannot be treated as delivery confirmation.
  const endpoint=configUrl();
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?[^#]*)?$/.test(endpoint))
   return {ok:false,published:Boolean(record?.published),error:'RTDB badge publish failed ('+errorName(originalError)+'). Check g8NotificationsV1 catalog Rules; verified push publisher URL is not configured.'};
  const authUser=state.auth?.currentUser;
  if(!authUser||!TEACHER_EMAILS().has(String(authUser.email||'').toLowerCase()))
   return {ok:false,error:'Teacher Firebase sign-in is required.'};
  try{
   const token=await authUser.getIdToken();
   const args=new URLSearchParams({action:'learningCatalog',idToken:token,type,itemId:id,
    title:String(record?.title||'Untitled').trim().slice(0,160),term:String(record?.term||'term1').slice(0,20),
    audienceSection:type==='lessons'?'all':String(record?.audienceSection||'all').slice(0,100),
    published:String(record?.published===true||type==='lessons'),queueMissing:'true'});
   await fetch(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body:args,redirect:'follow',cache:'no-store'});
   // Do not say that RTDB is saved or phone was notified. Server verification is pending.
   return {ok:true,pending:true,published:true,metadataSaved:null,pushQueued:false};
  }catch(error){
   return {ok:false,published:true,error:'RTDB publish: '+errorName(originalError)+'; secure publisher: '+errorName(error)};
  }
 }
 async function publish(type,record){
  if(!TYPES.includes(type)||!record)return {ok:false,error:'Invalid learning item'};
  try{await (initPromise||init());}catch(error){return {ok:false,error:'Notification service startup: '+errorName(error)};}
  if(!state.sdk||!state.db||!state.auth)return {ok:false,error:'Notification RTDB connection unavailable. Verify firebase-config.js and g8code-learning-badges.js.'};
  try{if(typeof state.auth.authStateReady==='function')await state.auth.authStateReady();}catch(_){}
  const user=state.auth.currentUser;
  if(!user||!TEACHER_EMAILS().has(String(user.email||'').toLowerCase()))return {ok:false,error:'Teacher Firebase authentication is not ready. Sign in again as the teacher.'};
  const id=safeId(record.id);if(!id)return {ok:false,error:'Invalid item ID'};
  const sdk=state.sdk, db=state.db;
  const path=sdk.ref(db,`${BASE}/catalog/${type}/${id}`);
  const published=type==='lessons'||record.published===true;
  const audience=type==='lessons'?'all':String(record.audienceSection||'all').trim().slice(0,100)||'all';
  const title=String(record.title||'Untitled').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').replace(/\s+/g,' ').trim().slice(0,160);
  const term=String(record.term||'term1').slice(0,20);
  if(!published){
   try{
    await sdk.remove(path);
    try{await sdk.remove(sdk.ref(db,`g8PushV1/learningMeta/${type}/${id}`));}catch(error){console.warn('Learning metadata unpublish cleanup:',errorName(error));}
    return {ok:true,published:false,metadataSaved:true,pushQueued:false};
   }catch(error){return {ok:false,error:'Could not remove unpublished badge: '+errorName(error)};}
  }
  let prior=null;
  try{
   const snap=await sdk.get(path);prior=snap.val();
   const fresh=prior?.active!==true||!(Number(prior.version)>0);
   // Editing an existing published item must NEVER reset every student's read badge.
   const version=fresh?stamp():Number(prior.version);
   await sdk.set(path,{active:true,version,term,audienceSection:audience});
   // Confirm the saved catalog directly. Badges do NOT depend on FCM deliveries.
   const confirmation=(await sdk.get(path)).val();
   if(!confirmation||confirmation.active!==true||Number(confirmation.version)!==version)
    return {ok:false,error:'RTDB catalog could not be verified after writing; check database access.'};
   let metadataSaved=true;
   try{
    await sdk.set(sdk.ref(db,`g8PushV1/learningMeta/${type}/${id}`),{title,version,term,audienceSection:audience,updatedAtMs:stamp()});
   }catch(error){metadataSaved=false;console.warn('Teacher-only learning title metadata:',errorName(error));}
   let pushQueued=false;
   if(fresh&&typeof window.G8CodePush?.queueTeacherEvent==='function'){
    try{
     pushQueued=Boolean(await window.G8CodePush.queueTeacherEvent({type,itemId:id,audienceSection:audience,learningTitle:title,catalogVersion:version}));
    }catch(error){console.warn('Learning phone push queue unavailable:',errorName(error));}
   }
   return {ok:true,published:true,newPublication:fresh,metadataSaved,pushQueued,version};
  }catch(error){
   console.warn('Direct NEW badge catalog publish denied or unavailable:',errorName(error));
   // Only use fallback if direct catalog publication failed, never for a phone-only failure.
   return verifiedServerPublish(type,record,id,error);
  }
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
  if(initPromise)return initPromise;
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
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initPromise=init();},{once:true});else initPromise=init();
})();
