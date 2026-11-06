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
 const safeSection=value=>String(value||'').trim().toLowerCase().replace(/^(?:grade\s*8|g8|8)\s*(?:[-:|]\s*)?/,'').replace(/saint\b/g,'st').replace(/[^a-z0-9]/g,'');
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
  const rawAudience=String(item.audienceSection||'all').trim().toLowerCase();
  const audience=safeSection(rawAudience);
  return rawAudience==='all'||Boolean(section&&audience===section);
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
   badge.hidden=count===0;badge.textContent=el.classList.contains('sh-quick-card')?`${Math.min(count,99)}${count>99?'+':''} NEW`:(count>99?'99+':String(count));
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
  const subscribe=(path,fn)=>sdk.onValue(sdk.ref(db,path),snap=>{if(state.uid!==uid)return;fn(snap.val()||{});scheduleRender();},err=>{console.warn('Learning badge subscription denied at '+path+':',err.message);state.subscriptionError={path,message:err.message};scheduleRender();});
  for(const type of TYPES){state.teardown.push(subscribe(`${BASE}/catalog/${type}`,val=>{state.catalog[type]=val;state.ready[type]=true;localHydrate();}));}
  state.teardown.push(subscribe(`${BASE}/seen/${uid}`,val=>{
   for(const type of TYPES){const incoming=val?.[type]||{};for(const [id,version] of Object.entries(incoming)){const n=Number(version)||0;if(n>Number(state.seen[type]?.[id]||0))state.seen[type][id]=n;}}state.ready.seen=true;localHydrate();
  }));
 }
 async function publishViaVerifiedSender(type,record){
  if(!window.G8CodePush?.publishLearningThroughSender)return {ok:false,error:'Secure notification sender is unavailable. Verify deployment and teacher login.'};
  const requested=await window.G8CodePush.publishLearningThroughSender({type,
   itemId:record.id,title:record.title,term:record.term||'term1',
   audienceSection:type==='lessons'?'all':record.audienceSection||'all',
   published:type==='lessons'||record.published===true,queueMissing:record.queueMissing===true});
  // Cross-origin Apps Script replies are opaque. A request is NOT proof that
  // the catalog or push was saved; report pending explicitly.
  return requested?{ok:true,pending:true,published:record.published===true||type==='lessons',pushQueued:false,
   metadataSaved:false}:{ok:false,error:'Learning badge RTDB write was denied and secure sender request was unavailable.'};
 }
 async function publish(type,record){
  if(!TYPES.includes(type)||!record)return {ok:false,error:'Invalid Lesson or Activity'};
  // If RTDB initialization is blocked or delayed, the verified teacher-only
  // immediate endpoint can still create the badge and queued notification.
  if(!state.sdk||!state.db)return publishViaVerifiedSender(type,record);
  const user=state.auth?.currentUser;
  if(!user||!TEACHER_EMAILS().has(String(user.email||'').toLowerCase()))return {ok:false,error:'Teacher authentication required'};
  const id=safeId(record.id);if(!id)return {ok:false,error:'Invalid item ID'};
  const path=state.sdk.ref(state.db,`${BASE}/catalog/${type}/${id}`);
  try{
   const dbRoot=state.sdk.ref(state.db);
   const metadataPath=`g8PushV1/learningMeta/${type}/${id}`;
   if(type==='activities'&&record.published!==true){
    try{await state.sdk.remove(path);}
    catch(error){console.warn('Learning draft cleanup needs verified sender:',error?.message||error);return publishViaVerifiedSender(type,record);}
    try{await state.sdk.remove(state.sdk.ref(state.db,metadataPath));}
    catch(metaError){console.warn('Old learning title cleanup pending:',metaError?.message||metaError);}
    return {ok:true,published:false};
   }
   // A published record already in this catalog is an EDIT, not a new post.
   // Preserve its version (and students' seen badges); do NOT re-notify.
   let prior;
   try{prior=(await state.sdk.get(path)).val();}
   catch(error){
    console.warn('Learning catalog read denied; using verified teacher sender:',error?.message||error);
    return publishViaVerifiedSender(type,record);
   }
   const newlyPublished=!prior||prior.active!==true;
   const version=newlyPublished?stamp():Number(prior.version||stamp());
   const audienceSection=type==='lessons'?'all':String(record.audienceSection||'all').trim().slice(0,100)||'all';
   const term=String(record.term||'term1').slice(0,20);
   const title=String(record.title|| (type==='lessons'?'Lesson':'Activity'))
    .replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').replace(/\s+/g,' ').trim().slice(0,160);
   if(!title)return {ok:false,error:'Learning notification title missing'};
   // Save the student-readable badge catalog FIRST. If private learningMeta
   // rules were not deployed, badge visibility must not fail with the title.
   try{await state.sdk.set(path,{active:true,version,term,audienceSection});}
   catch(error){
    console.warn('Learning catalog write denied; using verified teacher sender:',error?.message||error);
    return publishViaVerifiedSender(type,record);
   }
   let metadataSaved=true;
   try{
    await state.sdk.set(state.sdk.ref(state.db,metadataPath),
      {title,version,term,audienceSection,updatedAtMs:stamp()});
   }catch(metaError){
    metadataSaved=false;
    console.warn('Lesson/activity title metadata not saved; install the V3.7 learningMeta RTDB rule:',metaError?.message||metaError);
   }
   // Only after the main item and badge catalog are saved.
   if(newlyPublished){
    // The actual title must be saved BEFORE FCM sends the alert. When title
    // metadata is denied, let the verified server repair it and queue the push
    // together; otherwise the phone would display a misleading generic title.
    if(!metadataSaved){
     const server=await publishViaVerifiedSender(type,{...record,queueMissing:true});
     if(server.ok)return {...server,metadataSaved:false};
     console.warn('Named alert repair not confirmed:',server.error);
    }
    let queued=false;
    try{queued=Boolean(await window.G8CodePush?.queueTeacherEvent?.({type,itemId:id,audienceSection,catalogVersion:version}));}
    catch(pushError){console.warn('Learning push queue error:',pushError);}
    if(!queued){
     const server=await publishViaVerifiedSender(type,{...record,queueMissing:true});
     if(server.ok)return {...server,metadataSaved};
     console.warn('Learning badge indexed; notification queue not confirmed:',server.error);
    }
    return {ok:true,published:true,pushQueued:queued,metadataSaved};
   }
   return {ok:true,published:false,pushQueued:false,metadataSaved};
  }catch(err){return {ok:false,error:err?.message||'RTDB notification write failed'};}
 }
 async function remove(type,itemId){
  const id=safeId(itemId),user=state.auth?.currentUser;
  if(!TYPES.includes(type)||!id||!state.db||!state.sdk||!user||!TEACHER_EMAILS().has(String(user.email||'').toLowerCase()))return {ok:false};
  try{
   await state.sdk.remove(state.sdk.ref(state.db,`${BASE}/catalog/${type}/${id}`));
   try{await state.sdk.remove(state.sdk.ref(state.db,`g8PushV1/learningMeta/${type}/${id}`));}
   catch(metaError){console.warn('Old title metadata cleanup pending:',metaError?.message||metaError);}
   return {ok:true};
  }catch(err){
   console.warn('Notification removal needs verified teacher sender:',err.message);
   return publishViaVerifiedSender(type,{id,title:type==='lessons'?'Lesson':'Activity',published:false});
  }
 }
 window.G8CodeLearningBadges=Object.freeze({publish,remove,markViewed,refresh:scheduleRender,getCount,diagnostics:()=>({connected:Boolean(state.sdk&&state.db),uidPresent:Boolean(state.uid),teacher:state.isTeacher,ready:{...state.ready},subscriptionError:state.subscriptionError||null,counts:{lessons:getCount('lessons'),activities:getCount('activities')}})});
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
