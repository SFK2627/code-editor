/* G8Code Announcements V2.1: immersive photo gallery + friendly loading, persistent image cache; RTDB-only posts, feeds, reactions, replies and reads.
 * Private Workspace Drive transfer uses the existing Apps Script deployment.
 * No Firestore import, read, or write occurs in this file. */
(()=>{'use strict';
const $=id=>document.getElementById(id), BASE='g8AnnouncementsV1', MAX_IMAGES=10, MAX_PDFS=10, MAX_IMAGE_INPUT=30*1024*1024, MAX_PDF=3*1024*1024;
const gaPhotos=window.G8AnnouncementsPhotoCache;
const SRC=new URLSearchParams(location.search).get('from');
const teacherShortcut=SRC==='login'; // Matches the verified Teacher Messages Admin Code entry.
const teachers=new Set((window.MCS_TEACHER_EMAILS||[]).map(x=>String(x).toLowerCase()));
const state={sdk:null,auth:null,db:null,user:null,teacher:false,profile:null,posts:{},seen:{},directory:{},messageSummaries:{},directoryLoaded:false,summaryLoaded:false,audienceLoadError:false,audienceDiagnostics:null,reactions:{},comments:{},unsubs:[],postUnsubs:[],filter:'all',search:'',audienceFilter:'all',reactorsPostId:'',reactorsFilter:'all',reactorsSearch:'',peopleCache:null,editingId:'',editingBase:null,files:[],selectedSections:new Set(),selectedStudents:new Set(),composerBusy:false,transferBusy:false,viewerUrl:'',viewerFile:null,viewerGallery:[],viewerIndex:0,viewerPost:null,viewerRequest:0,blobOwner:'',commentExpanded:new Set(),commentDrafts:{},commentSending:{},commentJustPosted:{},markObserver:null,displayedIds:[],commentOpen:new Set(),replyTargets:{},detailPostId:"",detailMode:"post",detailViewScroll:{post:0,comments:0},detailScrollY:0,detailTrigger:null,detailPreviousOverflow:"",detailUnsubs:[],catalog:{},pickerType:'lesson',backGuardInstalled:false};
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x;}
function stamp(ms){return ms?new Intl.DateTimeFormat('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(ms)):'';}
function txt(v,n=200){return String(v??'').trim().slice(0,n);}
function isTeacher(u){return teachers.has(String(u?.email||'').toLowerCase());}
function gaFriendlyNotice(message){
 const raw=String(message??'').trim();
 if(!/(?:firebase|firestore|\brtdb\b|realtime\s+database|\bdatabase\s+rules?\b|\brules?\s+deployment\b|\bapps\s+script\b|\bsdk\b|\bbackend\b|permission[- ]denied|insufficient\s+permissions|\bdriveTransfers\b|firebase-config\.js)/i.test(raw))return raw;
 const lower=raw.toLowerCase();
 if(/(?:upload|photo|image|pdf|file|drive)/.test(lower))return 'Could not complete the attachment request. Check your connection and try again.';
 if(/(?:audience|student|directory|summary|identity|recipients|roster)/.test(lower))return 'Student information is temporarily unavailable. Refresh and try again.';
 if(/(?:permission|denied|rules|access)/.test(lower))return 'You do not have access to complete this action. Sign in again or contact your teacher.';
 if(/(?:save|publish|draft|post|comment|reply|delete|update|remove)/.test(lower))return 'Could not save your changes. Please try again.';
 if(/(?:configuration|login|sign.?in|auth)/.test(lower))return 'Sign-in is temporarily unavailable. Please try again.';
 return 'Could not connect right now. Check your connection and try again.';
}
function alertStatus(message,bad=false){$('gaComposeStatus').textContent=gaFriendlyNotice(message);$('gaComposeStatus').classList.toggle('error',bad);}
let toastTimer;function toast(message,bad=false){const t=$('gaToast');t.textContent=gaFriendlyNotice(message);t.classList.toggle('error',bad);t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,5500);}
function gate(title,message,login=true){$('gaGateTitle').textContent=title;$('gaGateText').textContent=gaFriendlyNotice(message);$('gaGate').hidden=false;$('gaWorkspace').hidden=true;$('gaLogin').hidden=!login;}
function setLive(label){$('gaConnection').textContent=gaFriendlyNotice(label);}
function currentUser(){if(!state.user)throw Error('Please sign in to G8Code first.');return state.user;}
function cleanLink(raw){try{const u=new URL(raw,location.href);return /^https?:$/.test(u.protocol)?u.href:'';}catch{return '';}}
function youtubeId(raw){try{const u=new URL(raw);if(u.hostname==='youtu.be')return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):'';if(/(^|\.)youtube\.com$/.test(u.hostname)||u.hostname==='www.youtube-nocookie.com'){const id=u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).at(-1);return /^[\w-]{11}$/.test(id)?id:'';}}catch{}return '';}
// Sanitize both pasted HTML and Firebase content. Never trust HTML in RTDB.
function sanitizeHtml(html){const parsed=new DOMParser().parseFromString('<main>'+String(html||'').slice(0,30000)+'</main>','text/html');const allowed=new Set(['P','DIV','BR','B','STRONG','I','EM','U','S','STRIKE','SPAN','FONT','UL','OL','LI','H2','H3','BLOCKQUOTE','A']);const discard=new Set(['SCRIPT','STYLE','SVG','MATH','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','IMG','VIDEO','AUDIO','LINK','META']);const output=document.createElement('div');
 function walk(source,target,depth){if(depth>25)return;for(const child of source.childNodes){if(child.nodeType===3){target.appendChild(document.createTextNode(child.textContent.slice(0,30000)));continue;}if(child.nodeType!==1||discard.has(child.tagName))continue;const approved=allowed.has(child.tagName);const holder=approved?document.createElement(child.tagName.toLowerCase()):target;
 if(approved){if(child.tagName==='A'){const href=cleanLink(child.getAttribute('href'));if(href){holder.setAttribute('href',href);holder.setAttribute('target','_blank');holder.setAttribute('rel','noopener noreferrer');}}if(child.tagName==='FONT'){const color=child.getAttribute('color')||'';const face=child.getAttribute('face')||'';const size=child.getAttribute('size')||'';if(/^#[0-9a-f]{3,8}$/i.test(color)||/^[a-z]+$/i.test(color))holder.setAttribute('color',color.slice(0,24));if(/^(Arial|Georgia|Verdana|Trebuchet MS|Times New Roman|Courier New)$/i.test(face))holder.setAttribute('face',face);if(/^[1-6]$/.test(size))holder.setAttribute('size',size);}const styles=[];const s=child.style;if(/^(left|center|right|justify)$/.test(s.textAlign))styles.push('text-align:'+s.textAlign);if(/^#[\da-f]{3,8}$/i.test(s.color)||/^rgb\(\d{1,3}, ?\d{1,3}, ?\d{1,3}\)$/i.test(s.color))styles.push('color:'+s.color);if(/^(Arial|Georgia|Verdana|Trebuchet MS|Times New Roman|Courier New)(, ?sans-serif|, ?serif|, ?monospace)?$/i.test(s.fontFamily))styles.push('font-family:'+s.fontFamily);if(/^(\d{1,2}(px|pt)|\d{1,2}(\.\d+)?em)$/.test(s.fontSize))styles.push('font-size:'+s.fontSize);if(styles.length)holder.setAttribute('style',styles.join(';'));target.appendChild(holder);}
 walk(child,holder,depth+1);}}
 walk(parsed.body.querySelector('main'),output,0);return output.innerHTML.slice(0,16000);
}
function plainHtml(html){const x=node('div');x.innerHTML=sanitizeHtml(html);return txt(x.textContent,2000);}
function cleanup(){closePostDialog(true);while(state.unsubs.length){try{state.unsubs.pop()();}catch{}}while(state.postUnsubs.length){try{state.postUnsubs.pop()();}catch{}}state.markObserver?.disconnect();state.markObserver=null;closeViewer();gaPhotos.clearMemory();}
async function sdk(){if(state.sdk)return state.sdk;const base=`https://www.gstatic.com/firebasejs/${window.MCS_FIREBASE_SDK_VERSION||'10.12.5'}`;const [a,au,d]=await Promise.all([import(base+'/firebase-app.js'),import(base+'/firebase-auth.js'),import(base+'/firebase-database.js')]);const app=a.getApps().length?a.getApp():a.initializeApp(window.MCS_FIREBASE_CONFIG);state.auth=au.getAuth(app);state.db=d.getDatabase(app,window.MCS_FIREBASE_DATABASE_URL);state.sdk={...d,...au};return state.sdk;}
function path(p){return state.sdk.ref(state.db,BASE+'/'+p);}
function on(p,callback,bag=state.unsubs){bag.push(state.sdk.onValue(path(p),s=>callback(s.val()||{}),err=>{console.error('Announcements RTDB:',err);toast(`Announcements permission/connection issue: ${err.message}`,true);setLive('RTDB error');}));}
function theme(){const dark=document.body.classList.toggle('ga-dark');try{localStorage.setItem('g8-announcements-theme',dark?'dark':'light');}catch{}$('gaTheme').textContent=dark?'☀':'◐';}
$('gaTheme').addEventListener('click',theme);try{if(localStorage.getItem('g8-announcements-theme')==='dark')theme();}catch{}
function backDestination(){
 if(!state.user)return 'index.html';
 if(!state.teacher)return 'index.html?g8mBack=student'; // Existing verified Student Homepage resume.
 return SRC==='login'?'index.html':'admin-v2.html?g8mBack=overview';
}
function goBack(){cleanup();location.replace(backDestination());}
// Protect native Android/iOS/browser Back from exiting the whole G8Code app
// when the student is browsing a post. Every modal view gets a SAME-document
// history entry. No Firebase reads or full-page reloads are involved.
const GA_NAV_KEY='g8AnnouncementsV38',GA_NAV_OWNER=Date.now().toString(36)+Math.random().toString(36).slice(2);
let gaNavChangeCount=0,gaSwipeFallbackTimer=null;
function cancelSwipeFallback(){if(gaSwipeFallbackTimer!==null){clearTimeout(gaSwipeFallbackTimer);gaSwipeFallbackTimer=null;}}
function gaNavState(view,postId=''){return {...history.state,[GA_NAV_KEY]:{owner:GA_NAV_OWNER,view,postId}};}
function gaPushView(view,postId=''){
 if(!state.backGuardInstalled)return false;
 try{history.pushState(gaNavState(view,postId),'',location.href);return true;}
 catch(err){console.info('Announcements view history:',err);return false;}
}
function handleAnnouncementPop(event){
 gaNavChangeCount++;cancelSwipeFallback();
 const route=event.state?.[GA_NAV_KEY];
 if(route?.owner!==GA_NAV_OWNER||route.view==='root'){goBack();return;}
 if(route.view==='feed'){
  if(!$('gaViewerModal').hidden)closeViewer();
  closePostDialog();return;
 }
 if((route.view==='post'||route.view==='comments')&&route.postId){
  if(!$('gaViewerModal').hidden)closeViewer();
  openPostDialog(route.postId,false,null,true,route.view);
  return;
 }
 goBack();
}
function installSmartBack(){
 if(state.backGuardInstalled)return;
 try{
  history.replaceState(gaNavState('root'),'',location.href);
  history.pushState(gaNavState('feed'),'',location.href);
  state.backGuardInstalled=true;
  window.addEventListener('popstate',handleAnnouncementPop);
 }catch(error){console.info('Announcements browser Back guard:',error);}
}
$('gaBack').addEventListener('click',e=>{e.preventDefault();goBack();});
function accountReset(account){cleanup();state.user=account;state.teacher=isTeacher(account);state.posts={};state.seen={};state.directory={};state.messageSummaries={};state.directoryLoaded=false;state.summaryLoaded=false;state.audienceLoadError=false;state.audienceDiagnostics=null;state.peopleCache=null;state.audienceFilter='all';state.reactorsPostId='';state.reactorsFilter='all';state.reactorsSearch='';$('gaReactorsModal').hidden=true;state.catalog={};state.reactions={};state.comments={};state.commentDrafts={};state.commentSending={};state.commentJustPosted={};state.commentExpanded.clear();state.commentOpen.clear();state.replyTargets={};state.displayedIds=[];state.restoredPosition=false;$('gaFeed').replaceChildren();state.blobOwner=account?.uid||'';gaPhotos.setOwner(state.blobOwner);}
async function boot(){try{if(!window.MCS_FIREBASE_CONFIG||!window.MCS_FIREBASE_DATABASE_URL)throw Error('Announcements are temporarily unavailable. Please try again later.');await sdk();state.sdk.onAuthStateChanged(state.auth,async account=>{accountReset(account);if(!account){setLive('Sign in required');if(teacherShortcut)gate('Teacher Announcements · Admin Code','Enter your existing teacher account password (Admin Code) to open the announcement creator.',true);else gate('Sign in to Announcements','Use your existing G8Code account to continue.',true);return;}if(teacherShortcut&&!state.teacher){setLive('Teacher sign-in required');gate('Teacher Announcements · Admin Code','A student session is active. Enter your teacher Admin Code to switch securely to the authorized admin account.',true);return;}state.profile={uid:account.uid,name:account.displayName||'Student',section:'Unassigned',studentId:''};if(!state.teacher){try{const row=(await state.sdk.get(state.sdk.ref(state.db,'g8MessagesV1/directory/'+account.uid))).val()||{};if(row.accountStatus==='disabled')throw Error('This student account is disabled.');state.profile={...state.profile,name:row.name||account.displayName||'Student',section:row.section||'Unassigned',studentId:row.studentId||''};}catch(err){if(/disabled/.test(err.message)){gate('Account disabled',err.message,false);return;}console.info('Profile not yet synced:',err.message);}}
 $('gaGate').hidden=true;$('gaWorkspace').hidden=false;installSmartBack();document.querySelectorAll('.ga-teacher-only').forEach(x=>x.hidden=!state.teacher);$('gaHeaderSubtitle').textContent=state.teacher?'Teacher publishing studio':'Your official classroom updates';$('gaGreeting').textContent=state.teacher?'TEACHER COMMUNICATION CENTER':txt(state.profile.section,70).toUpperCase();$('gaTitle').textContent=state.teacher?'Manage announcements':'Class announcements';$('gaSubtitle').textContent=state.teacher?'Create, edit, and target announcements by recipient.':'Only updates intended for your account appear here.';setLive('Live');
 if(state.teacher){loadTeacher();loadCatalog();
  try{const raw=sessionStorage.getItem('g8announcementPendingAttach');if(raw){const item=JSON.parse(raw);if(Date.now()-Number(item.atMs||0)<5*60*1000&&['lesson','activity'].includes(item.type)&&/^[\w-]{1,128}$/.test(item.itemId)){sessionStorage.removeItem('g8announcementPendingAttach');openComposer();state.files.push({type:item.type,itemId:item.itemId,name:txt(item.name,140)});renderAttachments();drawPreview();toast('Existing '+item.type+' attached. Add your announcement message and choose recipients.');}}}catch(error){console.info('Pending attachment:',error.message);}
 }else loadStudent();
 },error=>gate('Authentication error',error.message,true));}catch(err){gate('Announcements unavailable',err.message,false);setLive('Unavailable');}}
function toggleLoginRole(){const teacher=$('gaLoginRole').value==='teacher';$('gaIdentityLabel').textContent=teacher?'Teacher email':'Student ID';$('gaLoginIdentity').type=teacher?'email':'text';$('gaLoginIdentity').placeholder=teacher?'Teacher email':'Student ID';}
if(teacherShortcut){
 $('gaLoginRole').value='teacher';$('gaLoginRole').hidden=true;
 document.querySelector('label[for="gaLoginRole"]').hidden=true;
 $('gaLoginIdentity').required=false;$('gaLoginIdentity').disabled=true;$('gaLoginIdentity').hidden=true;
 $('gaIdentityLabel').hidden=true;
 document.querySelector('label[for="gaLoginPassword"]').textContent='Admin Code';
 $('gaLoginPassword').placeholder='Enter your teacher account password';
 $('gaLoginButton').textContent='Open Teacher Announcements';
 $('gaBack').href='index.html';
}else{
 $('gaLoginRole').addEventListener('change',toggleLoginRole);
 if(SRC==='admin')$('gaLoginRole').value='teacher';toggleLoginRole();
}
$('gaLogin').addEventListener('submit',async e=>{e.preventDefault();const button=$('gaLoginButton');button.disabled=true;$('gaLoginError').hidden=true;try{const teacher=teacherShortcut||$('gaLoginRole').value==='teacher';let id=teacherShortcut?[...teachers][0]||'':txt($('gaLoginIdentity').value,110);if(!id)throw Error(teacherShortcut?'Authorized teacher account is not configured.':'Enter your existing G8Code account identity.');if(!teacher)id='sid-'+id.toLowerCase().replace(/[^a-z0-9]/g,'')+'@students.mcsian.app';const c=await state.sdk.signInWithEmailAndPassword(state.auth,id,$('gaLoginPassword').value);if(teacher&&!isTeacher(c.user))throw Error('Only the authorized teacher can access the Admin announcement creator.');$('gaLoginPassword').value='';}catch(err){$('gaLoginError').textContent=gaFriendlyNotice(err.message||'Sign-in failed');$('gaLoginError').hidden=false;}finally{button.disabled=false;}});
function loadStudent(){on(`feeds/${state.user.uid}`,data=>{acceptPosts(data);restoreAnnouncementPosition();});on(`seen/${state.user.uid}`,data=>{state.seen=data;renderBadges();if(state.filter==='unread')render();else renderReadFlags();});}
// Cache lifetime is bounded by live announcement access, not by browser history.
// RTDB remains the authority: deleted/removed/replaced attachments are evicted.
function acceptPosts(next){
 const previous=state.posts||{};state.posts=next||{};
 if(state.viewerFile && state.viewerPost){
  const live=state.posts[state.viewerPost.id];
  const gallery=live&&(Array.isArray(live.attachments)?live.attachments:Object.values(live.attachments||{}));
  if(!gallery||!gallery.some(f=>f.type==='image'&&f.driveFileId===state.viewerGallery[state.viewerIndex]?.driveFileId))closeViewer();
 }
 updateAudienceFilterOptions();render();gaPhotos.scheduleReconcile(state.posts);
 for(const [postId,raw] of Object.entries(previous)){
  const before=Array.isArray(raw?.attachments)?raw.attachments:Object.values(raw?.attachments||{});
  const updated=state.posts[postId];
  const after=updated?(Array.isArray(updated.attachments)?updated.attachments:Object.values(updated.attachments||{})):[];
  for(const f of before){
   if(f?.type!=='image'||!f.driveFileId)continue;
   const same=after.some(a=>a?.type==='image'&&a.driveFileId===f.driveFileId&&
    String(a.version||a.fileVersion||a.modifiedAtMs||'')===String(f.version||f.fileVersion||f.modifiedAtMs||''));
   if(!same)void gaPhotos.deleteFile({id:postId},f);
  }
 }
}
function attachmentAccessible(p,f){
 if(!state.user||!p?.id||!f?.driveFileId)return false;
 const raw=state.posts[p.id];if(!raw)return false;
 const list=Array.isArray(raw.attachments)?raw.attachments:Object.values(raw.attachments||{});
 return list.some(a=>a?.driveFileId===f.driveFileId&&a.type===f.type&&
  String(a.version||a.fileVersion||a.modifiedAtMs||'')===String(f.version||f.fileVersion||f.modifiedAtMs||''));
}
function restoreAnnouncementPosition(){
 if(state.restoredPosition||new URLSearchParams(location.search).get('return')!=='attached')return;
 state.restoredPosition=true;
 try{
  const raw=JSON.parse(sessionStorage.getItem('g8code.announcements.return.v1')||'null');
  if(!raw||raw.uid!==state.user?.uid||Date.now()-Number(raw.at||0)>30*60*1000)return;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const card=[...document.querySelectorAll('[data-ga-post]')].find(x=>x.dataset.gaPost===raw.postId);
   if(card)card.scrollIntoView({block:'center',behavior:'instant'});
   else window.scrollTo({top:Math.max(0,Number(raw.scrollY||0)),behavior:'instant'});
  }));
 }catch(_){}
}
function loadTeacher(){on('posts',data=>acceptPosts(data)); // RTDB only.
 // The Messages inbox resolves old/current UIDs using BOTH of these RTDB
 // sources. Reading directory alone inflated Announcements' audience picker.
 const base='g8MessagesV1/';
 state.unsubs.push(state.sdk.onValue(state.sdk.ref(state.db,base+'directory'),snap=>{
  state.directory=snap.val()||{};state.directoryLoaded=true;state.peopleCache=null;if(state.summaryLoaded)renderAudience();refreshIdentityDisplays();
 },err=>{state.audienceLoadError=true;toast('Student list could not be loaded. Please refresh and try again.',true);
  $('gaAudienceCount').textContent='Cannot publish until the student directory is available.';}));
 state.unsubs.push(state.sdk.onValue(state.sdk.ref(state.db,base+'summary'),snap=>{
  state.messageSummaries=snap.val()||{};state.summaryLoaded=true;state.peopleCache=null;if(state.directoryLoaded)renderAudience();refreshIdentityDisplays();
 },err=>{state.audienceLoadError=true;console.warn('Messages identity summaries unavailable:',err.message);
  toast('Some historical student identities could not be matched; refresh after checking Messages access.',true);}));
}
// Mirrors Messages V5.9's real Student ID grouping and its summary-ID fallback.
// An exact full name AND section can safely link an ID-less legacy UID to the
// single matching verified person. Never coalesce DIFFERENT verified IDs merely
// because names match: two real classmates can have the same full name.
function normalizedStudentId(raw){
 const id=txt(raw,50).toUpperCase().replace(/[^A-Z0-9]/g,'');
 return id.length>=5&&id.length<=50&&!/^(?:0+|UNKNOWN|NONE|NA|STUDENT|TEMP|TEST)$/.test(id)?id:'';
}
function normalizedSection(raw){
 return txt(raw,100).replace(/[–—]/g,'-').replace(/\s+/g,' ').trim()
  .replace(/^(?:Grade\s*8|G8|8)\s*(?:[-:|•]\s*)?/i,'')
  .replace(/\bSaint\s+/gi,'St. ')
  .replace(/\bSt\s*\.\s*/gi,'St. ')
  .replace(/\bSt\.?\s*Faustina\s+(?:of\s+)?Kowalska\b/gi,'St. Faustina Kowalska')
  .replace(/\bSt\.?\s*Camillus\s+(?:(?:de|of)\s+)?Lel(?:l)?is\b/gi,'St. Camillus de Lellis');
}
function sectionKey(raw){return normalizedSection(raw).toUpperCase().replace(/[^A-Z0-9]/g,'');}
function personNameKey(raw){
 let value=txt(raw,140).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 if(/^[^,]+,[^,]+$/.test(value)){
  const names=value.split(',');value=names[1]+' '+names[0];
 }
 const key=value.replace(/[^A-Z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 return key==='STUDENT'||key==='UNKNOWN'||key==='UNNAMED STUDENT'||key==='N A'?'':key;
}
function activePeople(){
 if(state.peopleCache?.directory===state.directory&&state.peopleCache?.summaries===state.messageSummaries)return state.peopleCache.people;
 const directory=state.directory||{},summaries=state.messageSummaries||{};
 const rows=[];const byUid=new Map();
 // The active directory remains the source of enrollment. Summaries supply
 // missing verified IDs/aliases but cannot independently enroll old chat UIDs.
 for(const [uid,raw] of Object.entries(directory)){
  if(!/^[A-Za-z0-9_-]{5,128}$/.test(uid)||!raw||typeof raw!=='object'||
     String(raw.accountStatus||'active').toLowerCase()==='disabled')continue;
  const summary=summaries[uid]&&typeof summaries[uid]==='object'?summaries[uid]:{};
  const section=normalizedSection(raw.section&&!/^unassigned$/i.test(raw.section)?raw.section:summary.section);
  if(!section||sectionKey(section)==='UNASSIGNED')continue;
  const ids=[normalizedStudentId(raw.studentId),normalizedStudentId(summary.studentId)].filter(Boolean);
  const name=txt(personNameKey(raw.name)?raw.name:summary.name||raw.name||'Student',100);
  // A blank-ID, unnamed or placeholder RTDB entry isn't an enrolled pupil.
  if(!ids.length&&!personNameKey(name))continue;
  const row={uid,name,section,studentId:txt(raw.studentId||summary.studentId,50),
   ids:[...new Set(ids)],nameKey:personNameKey(name),sectionKey:sectionKey(section),
   preferred:raw.announcementsPrimary===true,activity:Number(summary.lastAtMs||0),fromDirectory:true};
  rows.push(row);byUid.set(uid,row);
 }
 // Historical Messages summaries supplement existing directory records only.
 // They do NOT add an unlisted UID to a private announcement's recipients.
 const parents=rows.map((_,i)=>i);
 function root(i){while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;}
 function link(a,b){a=root(a);b=root(b);if(a!==b)parents[b]=a;}
 const sidGroups=new Map();
 rows.forEach((row,i)=>row.ids.forEach(id=>{
  if(sidGroups.has(id))link(i,sidGroups.get(id));else sidGroups.set(id,i);
 }));
 // Fallback for duplicate old accounts with missing Student IDs. If a name
 // maps to MULTIPLE verified IDs, leave those distinct rather than guessing.
 const names=new Map();
 rows.forEach((row,i)=>{
  if(!row.nameKey||!row.sectionKey)return;
  const k=row.nameKey+'|'+row.sectionKey;
  if(!names.has(k))names.set(k,[]);names.get(k).push(i);
 });
 let conflictingNames=0;
 for(const indexes of names.values()){
  const knownIds=new Set(indexes.flatMap(i=>rows[i].ids));
  // Two IDs may be aliases of the SAME already-linked UID.
  const knownRoots=new Set(indexes.filter(i=>rows[i].ids.length).map(root));
  if(knownRoots.size>1){conflictingNames++;continue;}
  for(const i of indexes.slice(1))link(indexes[0],i);
 }
 const groups=new Map();
 rows.forEach((row,i)=>{const k=root(i);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(row);});
 const people=[];
 for(const linked of groups.values()){
  if(!linked.some(row=>row.fromDirectory))continue; // not enrolled
  const ordered=linked.slice().sort((a,b)=>
   Number(b.preferred)-Number(a.preferred)||Number(b.fromDirectory)-Number(a.fromDirectory)||
   Number(!!b.ids.length)-Number(!!a.ids.length)||b.activity-a.activity||
   Number(b.nameKey.length)-Number(a.nameKey.length)||a.uid.localeCompare(b.uid));
  const lead=ordered[0];
  const allIds=[...new Set(linked.flatMap(row=>row.ids))].sort();
  const actualId=ordered.find(row=>row.ids.length)?.studentId||lead.studentId;
  const uids=[...new Set(ordered.map(row=>row.uid))];
  // Link old/current accounts for private delivery only with a matching
  // nonempty Student ID. Name-only matches are for one-row UI counting, not
  // proof that an old account may read another learner's private post.
  const deliveryUids=allIds.length
   ? ordered.filter(row=>row.ids.some(id=>allIds.includes(id))).map(row=>row.uid)
   : [lead.uid];
  const identityKey=allIds.length?'sid:'+allIds[0]:
   'person:'+lead.sectionKey+':'+lead.nameKey;
  people.push({...lead,studentId:actualId,identityKey,uids,deliveryUids});
 }
 // Expose diagnostic information for the teacher without changing RTDB records.
 state.audienceDiagnostics={accountRecords:rows.filter(row=>row.fromDirectory).length,
  uniqueStudents:people.length,linkedAccounts:rows.length-people.length,conflictingNames};
 const result=people.sort((a,b)=>a.section.localeCompare(b.section)||a.name.localeCompare(b.name));
 state.peopleCache={directory:state.directory,summaries:state.messageSummaries,people:result,byUid:new Map(result.flatMap(p=>p.uids.map(uid=>[uid,p])))};
 return result;
}
function directoryPerson(uid){
 if(!state.teacher||!uid)return null;
 activePeople();return state.peopleCache?.byUid.get(uid)||null;
}
function commentDisplayIdentity(comment){
 if(state.teacher&&comment.uid===state.user?.uid)return {name:'ICT Teacher',section:''};
 const verified=directoryPerson(comment.uid);
 return {name:txt(verified?.name||comment.name||'Student',100),section:txt(verified?.section||comment.section||'',100)};
}
function reactionPeople(postId){
 const rows=Object.entries(state.reactions[postId]||{}).filter(([,value])=>['👍','❤️','🤗'].includes(value));
 if(!state.teacher)return rows.map(([uid,emoji])=>({uid,emoji}));
 const byPerson=new Map();
 for(const [uid,emoji] of rows){
  const p=directoryPerson(uid),key=p?.identityKey||'uid:'+uid;
  const prior=byPerson.get(key);
  // An active account takes precedence if linked historic accounts both reacted.
  if(!prior||uid===p?.uid){byPerson.set(key,{uid,emoji,name:p?.name||txt(state.directory[uid]?.name||state.messageSummaries[uid]?.name||'Student',100),section:p?.section||txt(state.directory[uid]?.section||state.messageSummaries[uid]?.section||'',100)});}
 }
 return [...byPerson.values()].sort((a,b)=>a.section.localeCompare(b.section)||a.name.localeCompare(b.name));
}
function refreshIdentityDisplays(){
 updateAudienceFilterOptions();
 document.querySelectorAll('[data-ga-post]').forEach(card=>{
  card.__gaRefreshReactions?.();
  if(!card.querySelector('.ga-comments')?.hidden){const p=state.posts[card.dataset.gaPost];if(p)drawComments(p.id,card,normalizePost(p,p.id));}
 });
 renderReactorDialog();
}
function determineRecipients(audience){
 const people=activePeople();if(audience.type==='all')return people;
 const selected=new Set((audience.sections||[]).map(sectionKey));
 const ids=new Set(audience.students||[]);
 return people.filter(p=>audience.type==='sections'?selected.has(p.sectionKey):
  p.uids.some(uid=>ids.has(uid))||ids.has(p.uid)||ids.has(p.identityKey));
}
// A single PERSON is counted in the picker. Historical accounts with matching
// Student IDs can receive a feed. Name-only matches never grant private access.
function recipientAccountUids(audience){return [...new Set(determineRecipients(audience).flatMap(p=>p.deliveryUids))];}
function normalizePost(raw,id){return {id,title:txt(raw.title||'Untitled announcement',140),bodyHtml:sanitizeHtml(raw.bodyHtml||''),background:['plain','blue','lavender','yellow','mint','rose','navy','gradient','custom'].includes(raw.background)?raw.background:'plain',font:['Arial','Georgia','Verdana','Trebuchet MS','Times New Roman','Courier New'].includes(raw.font)?raw.font:'Arial',bgColor:/^#[0-9a-f]{6}$/i.test(raw.bgColor||'')?raw.bgColor:'#e8f0ff',status:raw.status||'draft',pinned:!!raw.pinned,allowReplies:raw.allowReplies!==false,attachments:(Array.isArray(raw.attachments)?raw.attachments:Object.values(raw.attachments||{})).slice(0,40),createdAtMs:Number(raw.createdAtMs||0),publishedAtMs:Number(raw.publishedAtMs||0),scheduledForMs:Number(raw.scheduledForMs||0),createdByUid:raw.createdByUid||'',updatedAtMs:Number(raw.updatedAtMs||0),audience:raw.audience||{type:'all'}};}
function published(p){return p.status==='published';}
function allIds(){
 const filter=state.filter;
 const rows=Object.entries(state.posts).map(([id,p])=>normalizePost(p,id));
 return rows.filter(p=>state.teacher?filter==='drafts'?p.status==='draft':filter==='archived'?p.status==='archived':filter==='scheduled'?p.status==='scheduled':filter==='all'?(state.audienceFilter==='all'||p.status!=='archived'):published(p):published(p))
 .filter(p=>filter!=='unread'||state.teacher||!state.seen[p.id])
 .filter(p=>filter!=='pinned'||p.pinned)
 .filter(p=>!state.teacher||matchesAudienceFilter(p,state.audienceFilter))
 .filter(p=>!state.search||[p.title,plainHtml(p.bodyHtml)].join(' ').toLowerCase().includes(state.search))
 .sort((a,b)=>{
  // Always show the most recently PUBLISHED announcement first, for both roles.
  // Drafts and posts that have never been published fall back to creation time.
  // Editing an old post and pinning it must never move it ahead of newer posts.
  const dateA=Number(a.publishedAtMs||a.createdAtMs||0);
  const dateB=Number(b.publishedAtMs||b.createdAtMs||0);
  return dateB-dateA||String(b.id).localeCompare(String(a.id));
 })
 .slice(0,80);
}
// An audience filter describes what a section can SEE, not merely the post's
// original targeting label. A school-wide post belongs in EVERY section view.
// Individually targeted posts remain in the separate Selected Students view.
function matchesAudienceFilter(post,selection){
 const audience=post.audience||{};
 if(selection==='all')return true;
 if(selection==='everyone')return audience.type==='all';
 if(selection==='students')return audience.type==='students';
 if(selection.startsWith('section:')){
  const key=selection.slice('section:'.length);
  return audience.type==='all'||(audience.type==='sections'&&
   (audience.sections||[]).some(section=>sectionKey(section)===key));
 }
 return false;
}
function updateAudienceFilterOptions(){
 const select=$('gaAudienceTypeFilter');if(!select||!state.teacher)return;
 const current=state.audienceFilter;
 const sections=new Map();
 // Include sections found on older posts, even if the students no longer appear
 // in the currently loaded directory. No extra database reads are required.
 for(const p of Object.values(state.posts))if(p?.audience?.type==='sections')for(const s of p.audience.sections||[]){
  const key=sectionKey(s);if(key)sections.set(key,txt(s,100));
 }
 if(state.directoryLoaded||state.summaryLoaded)for(const person of activePeople()){
  if(person.sectionKey)sections.set(person.sectionKey,txt(person.section,100));
 }
 const options=[{value:'all',label:'All Announcements'},
  {value:'everyone',label:'For All Sections'},
  ...[...sections].sort((a,b)=>a[1].localeCompare(b[1])).map(([key,label])=>({value:'section:'+key,label})),
  {value:'students',label:'Selected Students Only'}];
 select.replaceChildren();
 for(const entry of options){const option=node('option','',entry.label);option.value=entry.value;select.append(option);}
 if(options.some(option=>option.value===current)){select.value=current;}
 else{state.audienceFilter='all';select.value='all';}
 const hint=$('gaAudienceFilterHint');
 if(hint)hint.textContent=state.audienceFilter==='all'
  ?'All posts across all audiences, including published, scheduled, drafts, and archived.'
  :state.audienceFilter==='everyone'
  ?'Only school-wide announcements. Choose a section to include school-wide posts and posts for that section.'
  :state.audienceFilter==='students'
   ?'Only announcements sent to individually selected students.'
   :'Includes school-wide announcements and announcements targeted to this section.';
}

function renderBadges(){if(state.teacher){const visible=Object.entries(state.posts).map(([id,p])=>normalizePost(p,id)).filter(p=>matchesAudienceFilter(p,state.audienceFilter));$('gaAllCount').textContent=visible.filter(p=>state.audienceFilter==='all'||p.status!=='archived').length;$('gaScheduledCount').textContent=visible.filter(p=>p.status==='scheduled').length;return;}const posts=Object.entries(state.posts).filter(([,p])=>published(p));const newCount=posts.filter(([id])=>!state.seen[id]).length;$('gaAllCount').textContent=posts.length;$('gaUnreadCount').textContent=newCount;document.title=newCount?`(${newCount}) Announcements · G8Code`:'Announcements · G8Code';}
function renderReadFlags(){document.querySelectorAll('[data-ga-post-new]').forEach(el=>{el.hidden=!!state.seen[el.dataset.gaPostNew];});}
// A push notification can open the exact announcement and its comments.
const gaLink=new URLSearchParams(location.search);
const gaTarget=/^[A-Za-z0-9_-]{1,128}$/.test(gaLink.get('gaPost')||'')?gaLink.get('gaPost'):'';
let gaFocused=false;
function focusPushPost(){
 if(gaFocused||!state.teacher||!gaTarget)return;
 const card=[...document.querySelectorAll('[data-ga-post]')].find(el=>el.dataset.gaPost===gaTarget);
 if(!card)return;
 gaFocused=true;
 requestAnimationFrame(()=>{
  if(gaLink.get('gaEngagement')==='comment'&&!state.commentExpanded.has(gaTarget))
   card.querySelector('.ga-reply-total')?.click();
  card.scrollIntoView({block:'center',behavior:'smooth'});
  card.style.outline='3px solid #4c89ec';card.style.outlineOffset='5px';
  setTimeout(()=>{if(card.isConnected){card.style.outline='';card.style.outlineOffset='';}},3500);
 });
}

// A tapped adviser push may link to a section-specific or student-only post.
// Switch the Admin audience view automatically so the existing deep link can
// focus the real post instead of silently displaying an unrelated filtered feed.
function ensurePushPostVisible(){
 if(!state.teacher||gaFocused||!gaTarget||!state.posts[gaTarget])return;
 const post=normalizePost(state.posts[gaTarget],gaTarget);
 if(matchesAudienceFilter(post,state.audienceFilter))return;
 if(post.audience.type==='students')state.audienceFilter='students';
 else if(post.audience.type==='sections'){
  const key=(post.audience.sections||[]).map(sectionKey).find(Boolean);
  if(!key)return;
  state.audienceFilter='section:'+key;
 }else if(post.audience.type==='all')state.audienceFilter='everyone';
 updateAudienceFilterOptions();
}
function render(){ensurePushPostVisible();renderBadges();while(state.postUnsubs.length){try{state.postUnsubs.pop()();}catch{}}state.markObserver?.disconnect();const feed=$('gaFeed');feed.replaceChildren();const rows=allIds();state.displayedIds=rows.map(r=>r.id);$('gaFeedStatus').textContent=`${rows.length} post${rows.length===1?'':'s'}`;if(!rows.length){if(state.detailPostId){refreshPostDialog();ensureDetailSubscriptions(false);}const empty=node('div','ga-empty');empty.append(node('strong','',state.filter==='unread'?'All caught up!':'No announcements here yet.'),node('span','',state.teacher?'No posts match this view. Try another section or audience.':'Your teacher’s announcements will appear here.'));feed.append(empty);return;}for(const p of rows)feed.append(renderCard(p));if(state.detailPostId){refreshPostDialog();ensureDetailSubscriptions(rows.some(r=>r.id===state.detailPostId));}focusPushPost();if(!state.teacher){state.markObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const id=entry.target.dataset.gaPost;setTimeout(()=>{if(!state.user||!entry.target.isConnected||!state.markObserver)return;const r=entry.target.getBoundingClientRect();if(r.top<innerHeight*.8&&r.bottom>innerHeight*.25&&!state.seen[id])state.sdk.set(path(`seen/${state.user.uid}/${id}`),{atMs:Date.now(),publishedAtMs:Number(state.posts[id]?.publishedAtMs||0)}).catch(e=>console.warn('Mark read:',e.message));},900);state.markObserver.unobserve(entry.target);}}},{threshold:.55});for(const card of feed.querySelectorAll('[data-ga-post]'))state.markObserver.observe(card);}}
// Text-only announcements can use a design background. Any attachment switches
// the post to Facebook-style text + media layout without losing saved design.
function postBody(p){
 const hasMedia=Array.isArray(p.attachments)&&p.attachments.length>0;
 const b=node('section','ga-post-body'+(hasMedia?' ga-post-body--media':' ga-post-body--text'));
 b.dataset.bg=hasMedia?'plain':p.background;
 b.style.fontFamily=p.font+',sans-serif';
 if(!hasMedia&&p.background==='custom'){
  const hex=/^#[0-9a-f]{6}$/i.test(p.bgColor||'')?p.bgColor:'#e8f0ff';
  b.style.backgroundColor=hex;
  const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  b.style.color=(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2])<145?'#fff':'#172b4d';
 }
 b.append(node('h2','',p.title));
 const rich=node('div','ga-post-rich');rich.innerHTML=sanitizeHtml(p.bodyHtml||'');b.append(rich);
 return b;
}
function reactionLabel(emoji){return emoji==='❤️'?'Love':emoji==='🤗'?'Care':'Like';}
function openReactorDialog(postId,filter='all'){
 if(!state.teacher||!state.posts[postId])return;
 state.reactorsPostId=postId;state.reactorsFilter=filter;state.reactorsSearch='';
 $('gaReactorsSearch').value='';$('gaReactorsModal').hidden=false;
 renderReactorDialog();$('gaReactorsClose').focus({preventScroll:true});
}
function closeReactorDialog(){state.reactorsPostId='';$('gaReactorsModal').hidden=true;}
function renderReactorDialog(){
 const postId=state.reactorsPostId;if(!state.teacher||!postId||$('gaReactorsModal').hidden)return;
 const p=state.posts[postId];if(!p){closeReactorDialog();return;}
 const everyone=reactionPeople(postId),tabs=$('gaReactorsTabs'),list=$('gaReactorsList');
 $('gaReactorsPostTitle').textContent=txt(p.title||'Announcement',120);
 tabs.replaceChildren();
 for(const [code,label] of [['all','All'],['👍','👍 Like'],['❤️','❤️ Love'],['🤗','🤗 Care']]){
  const n=code==='all'?everyone.length:everyone.filter(x=>x.emoji===code).length;
  const b=node('button','ga-reactors-tab'+(code===state.reactorsFilter?' active':''),`${label} · ${n}`);b.type='button';b.setAttribute('aria-pressed',String(code===state.reactorsFilter));
  b.addEventListener('click',()=>{state.reactorsFilter=code;renderReactorDialog();});tabs.append(b);
 }
 const q=state.reactorsSearch.toLocaleLowerCase();
 const filtered=everyone.filter(x=>(state.reactorsFilter==='all'||x.emoji===state.reactorsFilter)&&(!q||`${x.name} ${x.section}`.toLocaleLowerCase().includes(q)));
 list.replaceChildren();
 if(!filtered.length)list.append(node('p','ga-reactors-empty',everyone.length?'No matching students.':'No student reactions yet.'));
 for(const person of filtered){
  const row=node('div','ga-reactor-person');const av=node('span','ga-reactor-avatar',txt(person.name||'S',1).toUpperCase());
  const identity=node('div','ga-reactor-identity');identity.append(node('strong','',txt(person.name||'Student',100)),node('small','',txt(person.section||'Section unavailable',100)));
  row.append(av,identity,node('span','ga-reactor-emoji',person.emoji));list.append(row);
 }
 $('gaReactorsSummary').textContent=`${filtered.length} student${filtered.length===1?'':'s'} shown · ${everyone.length} total`;
}
$('gaReactorsClose').addEventListener('click',closeReactorDialog);
document.querySelectorAll('[data-ga-close="reactors"]').forEach(b=>b.addEventListener('click',closeReactorDialog));
$('gaReactorsSearch').addEventListener('input',e=>{state.reactorsSearch=e.target.value.trim();renderReactorDialog();});

// Facebook-style full announcement view for students. This reuses the SAME
// content, reaction and reply handlers as the feed; no duplicate RTDB listeners.
function isMobilePostView(){return window.matchMedia('(max-width:690px)').matches;}
// The iOS virtual keyboard may shrink visualViewport without resizing 100dvh.
// Keep the fixed comment dock inside the truly visible height on both iOS/Android.
function syncMobilePostViewport(){
 const modal=$('gaPostModal'),viewport=window.visualViewport;
 if(!state.detailPostId||!isMobilePostView()||!viewport){
  modal.style.removeProperty('--ga-visual-height');
  modal.style.removeProperty('--ga-visual-top');
  return;
 }
 modal.style.setProperty('--ga-visual-height',Math.max(250,Math.round(viewport.height))+'px');
 modal.style.setProperty('--ga-visual-top',Math.round(viewport.offsetTop)+'px');
}
window.visualViewport?.addEventListener('resize',syncMobilePostViewport,{passive:true});
window.visualViewport?.addEventListener('scroll',syncMobilePostViewport,{passive:true});
function setPostDialogMode(mode,resetScroll=true){
 const modal=$('gaPostModal');
 if(!modal||modal.hidden)return;
 const scroll=$('gaPostDialogScroll');
 if(state.detailMode!==mode){
  state.detailViewScroll[state.detailMode]=scroll.scrollTop;
  state.detailMode=mode;
 }
 syncMobilePostViewport();
 const commentsOnly=mode==='comments'&&isMobilePostView();
 modal.classList.toggle('ga-mobile-comments-view',commentsOnly);
 modal.classList.toggle('ga-mobile-post-view',!commentsOnly);
 $('gaPostBack').hidden=!isMobilePostView();
 $('gaMobileReactionBar').hidden=!commentsOnly;
 $('gaPostModalTitle').textContent=commentsOnly?'Comments':'ICT Teacher’s post';
 refreshPostDialog(resetScroll);
 // Use header button rather than auto-focusing the textarea on mobile.
 if(isMobilePostView())$('gaPostBack').focus({preventScroll:true});
}
function openPostDialog(id,focusComposer=false,trigger=null,fromHistory=false,requestedMode=null){
 if(state.teacher||!state.user||!state.posts[id])return;
 const p=normalizePost(state.posts[id],id);
 if(!published(p))return;
 const mode=requestedMode||(isMobilePostView()?'comments':'post');
 const wasSame=state.detailPostId===id;
 if(state.detailPostId&&state.detailPostId!==id)closePostDialog(true);
 if(!state.detailPostId){
  state.detailScrollY=window.scrollY;
  state.detailTrigger=trigger||document.activeElement;
  state.detailPreviousOverflow=document.body.style.overflow;
  state.detailViewScroll={post:0,comments:0};
  document.body.style.overflow='hidden';
  document.documentElement.classList.add('ga-post-modal-open');
 }
 if(!fromHistory){
  // Mobile opens on Comments. The intermediate 'post' history entry means
  // hardware Back / gesture Back goes Comments -> Full Post -> Feed.
  if(mode==='comments')gaPushView('post',id);
  gaPushView(mode,id);
 }
 state.detailPostId=id;
 state.commentOpen.add(id);state.commentExpanded.add(id);
 $('gaPostModal').hidden=false;
 if(wasSame&&state.detailMode===mode){
  // Preserve scroll, draft and focus on duplicate native history events.
  return;
 }
 setPostDialogMode(mode,true);
 if(!isMobilePostView()&&focusComposer){
  $('gaPostCommentDock').querySelector('textarea')?.focus({preventScroll:true});
 }else if(!isMobilePostView())$('gaPostClose').focus({preventScroll:true});
}
function goToMobileComments(){
 if(!state.detailPostId||!isMobilePostView()||state.detailMode==='comments')return;
 gaPushView('comments',state.detailPostId);
 setPostDialogMode('comments');
}
function requestPostBack(){
 cancelSwipeFallback();
 if(!state.detailPostId)return;
 if(!state.backGuardInstalled){
  if(isMobilePostView()&&state.detailMode==='comments')setPostDialogMode('post');
  else closePostDialog();
  return;
 }
 history.back();
}
function requestPostClose(){
 cancelSwipeFallback();
 if(!state.detailPostId)return;
 if(!state.backGuardInstalled){closePostDialog();return;}
 // Close X skips the post view when opened directly in mobile Comments.
 history.go(isMobilePostView()&&state.detailMode==='comments'?-2:-1);
}
function closePostDialog(silent=false){
 const id=state.detailPostId;
 if(!id)return;
 state.detailPostId='';state.detailMode='post';state.detailViewScroll={post:0,comments:0};
 while(state.detailUnsubs.length){try{state.detailUnsubs.pop()();}catch(_){} }
 state.commentOpen.delete(id);state.commentExpanded.delete(id);state.replyTargets[id]=null;
 const typing=$('gaPostCommentDock').querySelector('textarea');
 if(typing)state.commentDrafts[id]=typing.value;
 $('gaPostModal').hidden=true;
 $('gaPostModal').classList.remove('ga-mobile-comments-view','ga-mobile-post-view');
 syncMobilePostViewport();
 $('gaPostDialogBody').replaceChildren();$('gaPostCommentDock').replaceChildren();
 document.documentElement.classList.remove('ga-post-modal-open');
 document.body.style.overflow=state.detailPreviousOverflow;
 if(!silent){
  window.scrollTo(0,state.detailScrollY);
  const target=state.detailTrigger?.isConnected?state.detailTrigger
   :[...document.querySelectorAll('[data-ga-post]')].find(el=>el.dataset.gaPost===id)?.querySelector('.ga-comment-main');
  target?.focus?.({preventScroll:true});
 }
 state.detailTrigger=null;
}
function updateMobileReactionBar(id){
 if(!id||!state.user)return;
 const reactions=state.reactions[id]||{},comments=state.comments[id]||{};
 const counts={'👍':0,'❤️':0,'🤗':0};
 Object.values(reactions).forEach(emoji=>{if(Object.hasOwn(counts,emoji))counts[emoji]++;});
 const selected=reactions[state.user.uid]||'';
 for(const button of $('gaMobileReactionChoices').querySelectorAll('[data-ga-mobile-reaction]')){
  const emoji=button.dataset.gaMobileReaction;
  button.classList.toggle('active',selected===emoji);
  button.setAttribute('aria-pressed',String(selected===emoji));
  button.querySelector('.ga-mobile-reaction-count').textContent=counts[emoji]||'';
 }
 const count=Object.keys(comments).length;
 $('gaMobileCommentCount').textContent=count+' comment'+(count===1?'':'s');
}
function renderCommentOnlyCard(p){
 // Do NOT load attachments or the announcement body when the student only
 // wants to see comments. Reuses the same RTDB subscriptions and composer.
 const card=node('article','ga-card ga-detail-card ga-comments-only');card.dataset.gaPost=p.id;
 const comments=node('div','ga-comments');comments.id='ga-comments-'+p.id;
 card.append(comments);
 card.__gaRefreshReactions=()=>updateMobileReactionBar(p.id);
 drawComments(p.id,card,p);
 return card;
}
function refreshPostDialog(resetScroll=false){
 const id=state.detailPostId;if(!id)return;
 const raw=state.posts[id];
 if(!raw||!published(raw)){requestPostClose();return;}
 const p=normalizePost(raw,id);
 const scroll=$('gaPostDialogScroll');
 const pos=resetScroll?(state.detailViewScroll[state.detailMode]||0):scroll.scrollTop;
 const typing=$('gaPostCommentDock').querySelector('textarea');
 const refocus=!resetScroll&&!!typing&&document.activeElement===typing;
 const caret=refocus?{start:typing.selectionStart,end:typing.selectionEnd}:null;
 if(typing)state.commentDrafts[id]=typing.value;
 const commentsOnly=state.detailMode==='comments'&&isMobilePostView();
 $('gaPostModalTitle').textContent=commentsOnly?'Comments':'ICT Teacher’s post';
 $('gaPostDialogBody').replaceChildren(commentsOnly?renderCommentOnlyCard(p):renderCard(p,true));
 updateMobileReactionBar(id);
 scroll.scrollTop=pos;
 if(refocus){const next=$('gaPostCommentDock').querySelector('textarea');next?.focus({preventScroll:true});if(next&&caret)try{next.setSelectionRange(caret.start,caret.end);}catch(_){} }
}
function ensureDetailSubscriptions(isShownInFeed){
 if(!state.detailPostId||isShownInFeed){
  while(state.detailUnsubs.length){try{state.detailUnsubs.pop()();}catch(_){}}
  return;
 }
 if(state.detailUnsubs.length)return;
 const id=state.detailPostId;
 on(`reactions/${id}`,data=>{state.reactions[id]=data;syncPostDialogEngagement(id);},state.detailUnsubs);
 on(`replies/${id}`,data=>{state.comments[id]=data;syncPostDialogEngagement(id);},state.detailUnsubs);
}
function syncPostDialogEngagement(id){
 if(id!==state.detailPostId)return;
 const card=$('gaPostDialogBody').querySelector('.ga-detail-card');
 if(!card)return;
 card.__gaRefreshReactions?.();
 const raw=state.posts[id];if(raw)drawComments(id,card,normalizePost(raw,id));
 updateMobileReactionBar(id);
}
$('gaPostClose').addEventListener('click',requestPostClose);
$('gaPostBack').addEventListener('click',requestPostBack);
document.querySelectorAll('[data-ga-close="post"]').forEach(el=>el.addEventListener('click',requestPostClose));
$('gaMobileReactionChoices').addEventListener('click',event=>{
 const choice=event.target.closest('[data-ga-mobile-reaction]');
 if(choice&&state.detailPostId)react(state.detailPostId,choice.dataset.gaMobileReaction);
});
// The phone/browser owns edge Back gestures. Avoid firing our own history.back()
// at the same moment: that used to pop TWO entries (Comments -> Post -> Feed
// or straight into the G8Code Exit confirmation) for a single swipe.
// A delayed fallback handles embedded webviews without native swipe navigation.
let gaBackSwipe=null;
$('gaPostModal').addEventListener('touchstart',event=>{
 if(!isMobilePostView()||!state.detailPostId||event.touches.length!==1||!$('gaViewerModal').hidden)return;
 const touch=event.touches[0];
 gaBackSwipe=touch.clientX<=56&&!event.target.closest('textarea,input,button,a')
  ? {x:touch.clientX,y:touch.clientY,at:Date.now(),postId:state.detailPostId,view:state.detailMode,nav:gaNavChangeCount}
  : null;
},{passive:true});
$('gaPostModal').addEventListener('touchend',event=>{
 const swipe=gaBackSwipe;gaBackSwipe=null;
 if(!swipe||event.changedTouches.length!==1)return;
 const touch=event.changedTouches[0],dx=touch.clientX-swipe.x,dy=touch.clientY-swipe.y;
 if(dx<=85||Math.abs(dy)>=Math.abs(dx)*.65||Date.now()-swipe.at>=1200)return;
 // Native gesture navigation normally reports popstate immediately after touchend.
 // If it does, the handler cancels this fallback; one swipe = one Back.
 cancelSwipeFallback();
 gaSwipeFallbackTimer=setTimeout(()=>{
  gaSwipeFallbackTimer=null;
  if(gaNavChangeCount!==swipe.nav||state.detailPostId!==swipe.postId||state.detailMode!==swipe.view||$('gaPostModal').hidden)return;
  requestPostBack();
 },500);
},{passive:true});
$('gaPostModal').addEventListener('touchcancel',()=>{gaBackSwipe=null;cancelSwipeFallback();},{passive:true});

function renderCard(p,inPostModal=false){
 const card=node('article','ga-card'+(inPostModal?' ga-detail-card':''));card.dataset.gaPost=p.id;
 const h=node('div','ga-post-head');h.append(node('span','ga-avatar','📣'));
 const author=node('div','ga-post-author');
 author.append(node('strong','',state.teacher?'ICT Teacher · Admin':'ICT Teacher'),node('small','',`${p.status==='scheduled'?'🗓 Scheduled: '+scheduledLabel(p.scheduledForMs):stamp(p.publishedAtMs||p.createdAtMs)}${p.pinned?' · 📌 Pinned':''}${state.teacher?' · '+p.status:''}`));
 h.append(author);
 if(!state.teacher){const n=node('span','ga-post-tag ga-post-new','New');n.dataset.gaPostNew=p.id;n.hidden=!!state.seen[p.id];h.append(n);}
 else{const scope=p.audience.type==='all'?'All sections':p.audience.type==='sections'?`${(p.audience.sections||[]).length} section${(p.audience.sections||[]).length===1?'':'s'}`:'Selected students';const label=node('span','ga-post-tag',scope);label.title=p.audience.type==='sections'?(p.audience.sections||[]).join(', '):scope;h.append(label);}
 card.append(h,postBody(p));renderFiles(p,card,inPostModal);
 if(published(p)){
  const footer=node('div','ga-post-footer'),totals=node('div','ga-post-totals'),action=node('div','ga-post-actions');
  const reactWrap=node('div','ga-react-wrap');
  const reactButton=node('button','ga-react-main');reactButton.type='button';reactButton.setAttribute('aria-label','Like post, or hold to choose reaction');
  reactButton.textContent='👍 Like';
  const popup=node('div','ga-reaction-picker');popup.setAttribute('role','group');popup.setAttribute('aria-label','Choose reaction');
  popup.hidden=true;
  let holdTimer=0,longPressed=false,pointerStart=null;
  const showPicker=()=>{popup.hidden=false;reactWrap.classList.add('ga-reactions-open');};
  const hidePicker=()=>{popup.hidden=true;reactWrap.classList.remove('ga-reactions-open');};
  const cancelHold=()=>{if(holdTimer){clearTimeout(holdTimer);holdTimer=0;}};
  for(const [emoji,label] of [['👍','Like'],['❤️','Love'],['🤗','Care']]){
   const choice=node('button','ga-reaction-choice');choice.type='button';choice.dataset.gaChoice=emoji;
   choice.title=label;choice.setAttribute('aria-label',label);choice.append(node('span','',emoji),node('small','',label));
   choice.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();cancelHold();hidePicker();react(p.id,emoji);});
   popup.append(choice);
  }
  reactButton.addEventListener('click',e=>{
   if(longPressed){e.preventDefault();longPressed=false;return;}
   if(!popup.hidden){hidePicker();return;}
   react(p.id,'👍');
  });
  if(window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
   reactWrap.addEventListener('mouseenter',showPicker);
   reactWrap.addEventListener('mouseleave',hidePicker);
  }
  reactButton.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse')return;
   longPressed=false;pointerStart={x:e.clientX,y:e.clientY};cancelHold();
   holdTimer=setTimeout(()=>{holdTimer=0;longPressed=true;showPicker();},480);
  });
  reactButton.addEventListener('pointermove',e=>{
   if(pointerStart&&(Math.abs(e.clientX-pointerStart.x)>14||Math.abs(e.clientY-pointerStart.y)>14))cancelHold();
  });
  reactButton.addEventListener('pointerup',cancelHold);
  reactButton.addEventListener('pointercancel',()=>{cancelHold();pointerStart=null;});
  reactButton.addEventListener('contextmenu',e=>{e.preventDefault();showPicker();});
  reactButton.addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key===' '&&e.shiftKey){e.preventDefault();showPicker();popup.querySelector('button')?.focus();}});
  reactWrap.append(reactButton,popup);
  const cbtn=node('button','ga-comment-main','💬 Comment');cbtn.type='button';
  cbtn.addEventListener('click',()=>{
   if(!state.teacher&&!inPostModal){openPostDialog(p.id,true,cbtn);return;}
   if(inPostModal&&isMobilePostView()&&state.detailMode==='post'){goToMobileComments();return;}
   state.commentOpen.add(p.id);state.commentExpanded.add(p.id);
   drawComments(p.id,card,p);
   const ta=inPostModal?$('gaPostCommentDock').querySelector('textarea'):card.querySelector('.ga-reply-form textarea');
   if(ta){ta.focus({preventScroll:true});}
   else card.querySelector('.ga-comments')?.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  action.append(reactWrap,cbtn);footer.append(totals,action);card.append(footer);
  const comments=node('div','ga-comments');comments.id='ga-comments-'+p.id;comments.hidden=true;card.append(comments);
  function updateTotals(){
   const reactions=state.reactions[p.id]||{},comments=state.comments[p.id]||{};
   const counted=state.teacher?reactionPeople(p.id):Object.entries(reactions).filter(([,emoji])=>['👍','❤️','🤗'].includes(emoji)).map(([,emoji])=>({emoji}));
   const count={};counted.forEach(({emoji})=>{count[emoji]=(count[emoji]||0)+1;});
   totals.replaceChildren();
   const emojis=node('span','ga-reaction-totals'+(state.teacher?' ga-reaction-totals-admin':''));
   if(state.teacher&&counted.length){
    const all=node('button','ga-react-total-pill',`All · ${counted.length}`);all.type='button';all.title='View all students who reacted';all.addEventListener('click',()=>openReactorDialog(p.id,'all'));emojis.append(all);
   }
   for(const emoji of ['❤️','🤗','👍']){
    if(!count[emoji])continue;
    if(state.teacher){const pill=node('button','ga-react-total-pill',emoji+' '+count[emoji]);pill.type='button';pill.title='View '+reactionLabel(emoji)+' reactions';pill.addEventListener('click',()=>openReactorDialog(p.id,emoji));emojis.append(pill);}
    else emojis.append(node('span','',emoji+' '+count[emoji]));
   }
   if(!emojis.children.length)emojis.append(node('span','ga-no-reactions','Be the first to react'));
   const commentCount=Object.keys(comments).length;
   const countButton=node('button','ga-reply-total',commentCount+' comment'+(commentCount===1?'':'s'));
   countButton.type='button';countButton.setAttribute('aria-controls',(!state.teacher&&!inPostModal)?'gaPostModal':comments.id);if(!state.teacher&&!inPostModal)countButton.setAttribute('aria-haspopup','dialog');
   countButton.setAttribute('aria-expanded',String(state.commentExpanded.has(p.id)));
   countButton.setAttribute('aria-label',commentCount+' comment'+(commentCount===1?'':'s')+', '+(state.commentExpanded.has(p.id)?'hide':'view')+' comments');
   countButton.addEventListener('click',()=>{
    if(!state.teacher&&!inPostModal){openPostDialog(p.id,false,countButton);return;}
    if(inPostModal){
     if(isMobilePostView()&&state.detailMode==='post'){goToMobileComments();return;}
     $('gaPostDialogScroll').scrollTo({top:$('gaPostDialogScroll').scrollHeight,behavior:'smooth'});
     return;
    }
    const willShow=!state.commentExpanded.has(p.id);
    if(willShow){state.commentExpanded.add(p.id);state.commentOpen.add(p.id);}
    else{state.commentExpanded.delete(p.id);state.commentOpen.delete(p.id);state.replyTargets[p.id]=null;}
    drawComments(p.id,card,p);updateTotals();
    if(willShow)card.querySelector('.ga-comments')?.scrollIntoView({block:'nearest',behavior:'smooth'});
   });
   totals.append(emojis,countButton);
   const selected=reactions[state.user.uid]||'';
   reactButton.textContent=selected?selected+' '+reactionLabel(selected):'👍 Like';
   reactButton.classList.toggle('active',!!selected);
   popup.querySelectorAll('[data-ga-choice]').forEach(btn=>btn.classList.toggle('active',btn.dataset.gaChoice===selected));
  }
  card.__gaRefreshReactions=updateTotals;updateTotals();drawComments(p.id,card,p);
  if(!inPostModal){
   on(`reactions/${p.id}`,data=>{state.reactions[p.id]=data;updateTotals();syncPostDialogEngagement(p.id);if(state.reactorsPostId===p.id)renderReactorDialog();},state.postUnsubs);
   on(`replies/${p.id}`,data=>{state.comments[p.id]=data;updateTotals();drawComments(p.id,card,p);syncPostDialogEngagement(p.id);},state.postUnsubs);
  }
 }
 if(state.teacher){const menu=node('div','ga-teacher-menu');for(const [label,action] of [['Edit',()=>openComposer(p)],['Duplicate',()=>openComposer(p,true)],[p.status==='published'?'Archive':p.status==='scheduled'?'Publish Now':'Publish',()=>p.status==='published'?archivePost(p):publishExisting(p)],['Delete',()=>deletePost(p)]]){const b=node('button',label==='Delete'?'danger':'',label);b.type='button';b.addEventListener('click',action);menu.append(b);}card.append(menu);}
 return card;
}
let gaPreviewActive=0;const gaPreviewWaiting=[];function withPreviewTurn(fn){return new Promise((resolve,reject)=>{gaPreviewWaiting.push({fn,resolve,reject});pumpPreview();});}function pumpPreview(){while(gaPreviewActive<2&&gaPreviewWaiting.length){const task=gaPreviewWaiting.shift();gaPreviewActive++;Promise.resolve().then(task.fn).then(task.resolve,task.reject).finally(()=>{gaPreviewActive--;pumpPreview();});}}
function renderFiles(p,card,inPostModal=false){
 const files=p.attachments||[];if(!files.length)return;
 const host=node('div','ga-card-files');
 const images=files.filter(x=>x.type==='image');
 if(images.length){
  const preview=inPostModal?images:images.slice(0,5),n=inPostModal?'detail':preview.length;
  const gallery=node('div','ga-images ga-images--'+n);gallery.setAttribute('aria-label',`${images.length} announcement photo${images.length===1?'':'s'}`);
  preview.forEach((file,i)=>{
   const btn=node('button','ga-image');btn.type='button';btn.setAttribute('aria-label',`Open photo ${i+1} of ${images.length}`);
   const img=node('img','ga-feed-photo');img.alt='';img.loading='lazy';img.decoding='async';
   const pending=node('span','ga-image-placeholder');pending.setAttribute('aria-hidden','true');
   pending.append(node('span','ga-image-placeholder-icon','▧'),node('span','ga-image-placeholder-caption','Loading photo…'));
   const retry=node('span','ga-image-retry');retry.hidden=true;retry.setAttribute('role','button');retry.setAttribute('tabindex','0');retry.textContent='↻ Retry photo';
   btn.append(img,pending,retry);
   if(!inPostModal&&i===4&&images.length>5)btn.append(node('span','ga-more-images','+'+(images.length-5)));
   img.__gaRetry=()=>loadImage(p,file,img);
   btn.addEventListener('click',()=>openFile(p,file));gallery.append(btn);
   const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();loadImage(p,file,img);}}, {rootMargin:'500px'});observer.observe(btn);
  });host.append(gallery);
 }
 files.filter(x=>x.type!=='image').forEach(file=>{
  if(file.type==='youtube'){
   const v=node('iframe','ga-video');v.src='https://www.youtube-nocookie.com/embed/'+file.videoId;v.loading='lazy';v.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';v.referrerPolicy='strict-origin-when-cross-origin';v.title=txt(file.name||'YouTube video');host.append(v);return;
  }
  let b;
  if(file.type==='link'){b=node('a','ga-link-card');b.href=cleanLink(file.url)||'#';b.target='_blank';b.rel='noopener noreferrer';}
  else{b=node('button','ga-link-card');b.type='button';b.addEventListener('click',()=>{if(file.type==='pdf')openFile(p,file);else if(file.type==='lesson'||file.type==='activity')openCourseItem(file,p.id);});}
  const badge=node('span','ga-attach-icon',file.type==='pdf'?'📄':file.type==='lesson'?'📘':file.type==='activity'?'📝':'🔗');
  const copy=node('span','ga-attach-copy');copy.append(node('b','',txt(file.name||file.title||'Attachment',150)),node('small','',file.type==='pdf'?'PDF · Preview / Download':file.type==='lesson'?'Lesson · Open directly':file.type==='activity'?'Activity · Open directly':'Open website'));
  b.append(badge,copy,node('span','ga-attach-arrow','↗'));host.append(b);
 });card.append(host);
}
async function react(id,emoji){try{currentUser();const was=state.reactions[id]?.[state.user.uid]===emoji;const r=path(`reactions/${id}/${state.user.uid}`);if(was)await state.sdk.remove(r);else{await state.sdk.set(r,emoji);if(!state.teacher){const reactionCode=emoji==='❤️'?'love':emoji==='🤗'?'care':'like';void window.G8CodePush?.queueAnnouncementEngagement?.({postId:id,kind:'reaction',reactionCode});}}}catch(e){toast('Could not save reaction: '+e.message,true);}}
// After a successful comment write, move keyboard/scroll focus to the actual
// new comment, not back to the composer. Works inside the fixed desktop/mobile
// post dialog and in the teacher's inline comment list.
function revealNewComment(id,commentId,card){
 const inDialog=state.detailPostId===id&&!$('gaPostModal').hidden;
 const activeCard=inDialog?$('gaPostDialogBody').querySelector('.ga-detail-card'):card;
 if(!activeCard?.isConnected)return;
 const row=[...activeCard.querySelectorAll('.ga-comment[data-ga-comment-id]')].find(el=>el.dataset.gaCommentId===commentId);
 if(!row)return;
 document.activeElement?.matches?.('textarea')&&document.activeElement.blur();
 row.tabIndex=-1;
 row.focus({preventScroll:true});
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 // Two frames allow the phone viewport to settle after the software keyboard
 // closes. Scroll ONLY the dialog's scrollable content, not the page behind it.
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(!row.isConnected)return;
  if(inDialog){
   const scroller=$('gaPostDialogScroll');
   const y=scroller.scrollTop+row.getBoundingClientRect().top-scroller.getBoundingClientRect().top-16;
   scroller.scrollTo({top:Math.max(0,y),behavior:reduced?'auto':'smooth'});
  }else row.scrollIntoView({block:'center',behavior:reduced?'auto':'smooth'});
 }));
}
function drawComments(id,card,p){
 const host=card.querySelector('.ga-comments');if(!host)return;
 const inPostModal=card.classList.contains('ga-detail-card');
 const dock=$('gaPostCommentDock');
 const current=host.querySelector('.ga-reply-form textarea')||(inPostModal?dock.querySelector('textarea'):null);
 const wasTyping=current===document.activeElement;
 const previouslyFocusedComment=host.contains(document.activeElement)?document.activeElement.closest('.ga-comment')?.dataset.gaCommentId:null;
 const cursor=wasTyping?{start:current.selectionStart,end:current.selectionEnd}:null;
 if(current)state.commentDrafts[id]=current.value;
 host.replaceChildren();
 const expanded=inPostModal||state.commentExpanded.has(id);
 const composerOpen=inPostModal||state.commentOpen.has(id)||expanded;
 if(!state.teacher&&!inPostModal){host.hidden=true;return;}
 // No text box, names, or comment previews appear until the user chooses to
 // read or write comments. The count on the card remains visible and clickable.
 host.hidden=!composerOpen;
 if(!composerOpen)return;
 const data=state.comments[id]||{};
 const all=expanded?Object.entries(data)
  .sort(([keyA,a],[keyB,b])=>Number(b.createdAtMs||0)-Number(a.createdAtMs||0)||keyB.localeCompare(keyA))
  .slice(0,120):[];
 if(expanded){
  if(!inPostModal){
   const hide=node('button','ga-more-comments ga-hide-comments','Hide comments');hide.type='button';
   hide.addEventListener('click',()=>{card.querySelector('.ga-reply-total')?.click();});
   host.append(hide);
  }
  if(!all.length)host.append(node('p','ga-empty-comments','No comments yet. Start the conversation.'));
  for(const [rid,c] of all){
   const row=node('div','ga-comment');row.dataset.gaCommentId=rid;
   if(state.commentJustPosted[id]?.key===rid&&Date.now()<state.commentJustPosted[id].until){
    row.classList.add('ga-comment--just-posted');row.tabIndex=-1;row.setAttribute('aria-label','Your newly posted comment');
   }
   const av=node('div','ga-comment-avatar',txt(c.name||'S',1).toUpperCase());
   const content=node('div','ga-comment-content'),bubble=node('div','ga-comment-bubble');
   const who=commentDisplayIdentity(c);const identityLine=node('div','ga-comment-identity');identityLine.append(node('strong','',who.name));
   if(who.section)identityLine.append(node('small','ga-comment-section',who.section));else if(c.uid!==state.user?.uid)identityLine.append(node('small','ga-comment-section ga-comment-section--unknown','Section not recorded'));
   bubble.append(identityLine);
   if(c.replyTo&&data[c.replyTo])bubble.append(node('span','ga-comment-inreply','↳ '+txt(data[c.replyTo].name||'Reply',50)));
   bubble.append(node('p','',txt(c.text,1200)));content.append(bubble);
   const tools=node('div','ga-comment-tools');tools.append(node('small','',stamp(c.createdAtMs)));
   if(p.allowReplies||state.teacher){
    const reply=node('button','','Reply');reply.type='button';
    reply.addEventListener('click',()=>{state.replyTargets[id]={id:rid,name:c.name};state.commentOpen.add(id);drawComments(id,card,p);(inPostModal?dock:host).querySelector('textarea')?.focus({preventScroll:true});});tools.append(reply);
   }
   if(state.teacher||c.uid===state.user.uid){const del=node('button','','Remove');del.type='button';del.addEventListener('click',async()=>{if(!confirm('Remove this comment?'))return;try{await state.sdk.remove(path(`replies/${id}/${rid}`));}catch(e){toast(e.message,true);}});tools.append(del);}
   content.append(tools);row.append(av,content);host.append(row);
  }
 }
 if(!p.allowReplies&&!state.teacher){host.append(node('p','ga-smallprint','Comments are turned off for this post.'));return;}
 const form=node('form','ga-reply-form');
 const av=node('span','ga-comment-avatar ga-current-avatar',state.teacher?'T':txt(state.profile?.name||'S',1).toUpperCase());
 const composer=node('div','ga-comment-composer');
 if(state.replyTargets[id]?.id){
  const line=node('div','ga-replying-to','Replying to '+txt(state.replyTargets[id].name||'comment',60));
  const cancel=node('button','','×');cancel.type='button';cancel.title='Cancel reply';cancel.setAttribute('aria-label','Cancel reply');cancel.addEventListener('click',()=>{state.replyTargets[id]=null;drawComments(id,card,p);});
  line.append(cancel);composer.append(line);
 }
 const entry=node('div','ga-comment-entry'),ta=node('textarea');ta.maxLength=1200;ta.rows=1;ta.placeholder=state.replyTargets[id]?.id?'Write a reply…':'Write a comment…';ta.value=state.commentDrafts[id]||'';
 ta.addEventListener('input',()=>{state.commentDrafts[id]=ta.value;});
 const send=node('button','','➤');send.type='submit';send.setAttribute('aria-label','Post comment');
 send.disabled=!!state.commentSending[id];ta.readOnly=!!state.commentSending[id];
 entry.append(ta,send);composer.append(entry);form.append(av,composer);
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  const value=txt(ta.value,1200);if(!value||state.commentSending[id])return;
  // The live RTDB listener can redraw the composer before set() resolves.
  // Guard the post across those redraws to prevent accidental double-send.
  state.commentSending[id]=true;send.disabled=true;ta.readOnly=true;
  try{
   const key=state.sdk.push(path(`replies/${id}`)).key;
   const comment={uid:state.user.uid,name:txt(state.teacher?'ICT Teacher':state.profile?.name||'Student',80),text:value,createdAtMs:Date.now()};
   if(!state.teacher)comment.section=txt(state.profile?.section||'',100);
   if(state.replyTargets[id]?.id)comment.replyTo=state.replyTargets[id].id;
   await state.sdk.set(path(`replies/${id}/${key}`),comment);
   if(!state.teacher)void window.G8CodePush?.queueAnnouncementEngagement?.({postId:id,kind:'comment',commentId:key});
   if(!state.comments[id])state.comments[id]={};
   state.comments[id][key]=comment;
   state.commentSending[id]=false;
   // IMPORTANT: clear the CURRENT live textarea, not just `ta` from the
   // original submit closure (which may already be detached after RTDB sync).
   const liveCard=inPostModal?$('gaPostDialogBody').querySelector('.ga-detail-card'):
    ([...$('gaFeed').querySelectorAll('[data-ga-post]')].find(el=>el.dataset.gaPost===id)||card);
   const liveInput=(inPostModal?dock:liveCard?.querySelector('.ga-comments'))?.querySelector('.ga-reply-form textarea');
   if(liveInput){liveInput.value='';liveInput.blur();}
   ta.value='';state.commentDrafts[id]='';state.replyTargets[id]=null;
   state.commentOpen.add(id);state.commentExpanded.add(id);
   state.commentJustPosted[id]={key,until:Date.now()+3500};
   if(liveCard?.isConnected){drawComments(id,liveCard,p);liveCard.__gaRefreshReactions?.();}
   if(inPostModal){const feedCard=[...$('gaFeed').querySelectorAll('[data-ga-post]')].find(el=>el.dataset.gaPost===id);feedCard?.__gaRefreshReactions?.();}
   else syncPostDialogEngagement(id);
   const countButton=liveCard?.querySelector('.ga-reply-total');
   if(countButton)countButton.setAttribute('aria-expanded','true');
   requestAnimationFrame(()=>revealNewComment(id,key,liveCard));
  }catch(err){
   state.commentSending[id]=false;
   const liveCard=inPostModal?$('gaPostDialogBody').querySelector('.ga-detail-card'):card;
   if(liveCard?.isConnected)drawComments(id,liveCard,p);
   toast('Comment not saved: '+err.message,true);
  }finally{
   state.commentSending[id]=false;
   const activeForm=(inPostModal?dock:card.querySelector('.ga-comments'))?.querySelector('.ga-reply-form');
   if(activeForm){const activeSend=activeForm.querySelector('button[type="submit"]');const activeInput=activeForm.querySelector('textarea');if(activeSend)activeSend.disabled=false;if(activeInput)activeInput.readOnly=false;}
  }
 });if(inPostModal)dock.replaceChildren(form);else host.append(form);
 if(wasTyping){ta.focus({preventScroll:true});if(cursor)try{ta.setSelectionRange(cursor.start,cursor.end);}catch(_){}}
 if(previouslyFocusedComment){
  const same=[...host.querySelectorAll('.ga-comment[data-ga-comment-id]')].find(el=>el.dataset.gaCommentId===previouslyFocusedComment);
  same?.focus({preventScroll:true});
 }
}

function openCourseItem(file,postId){
 const kind=file.type==='lesson'?'lesson':'activity';
 if(!/^[\w-]{1,128}$/.test(String(file.itemId||''))){toast('The attached item ID is invalid.',true);return;}
 if(state.teacher){toast('Open attached lessons and activities from a student account to see the student viewer.');return;}
 if(!state.user){toast('Your student session has expired. Please sign in again.',true);return;}
 // UI-only return position; never used as authentication or audience permission.
 try{sessionStorage.setItem('g8code.announcements.return.v1',JSON.stringify({
  uid:state.user.uid,postId:txt(postId,128),scrollY:window.scrollY,at:Date.now()
 }));}catch(_){}
 // One protected handoff to the ORIGINAL, logged-in G8Code reader. Index does
 // not paint its login gate/splash while the Firebase session is being verified.
 location.assign(`index.html?g8mBack=student&gaOpen=${encodeURIComponent(kind)}&gaItem=${encodeURIComponent(file.itemId)}`);
}
function applyFilter(filter){state.filter=filter;document.querySelectorAll('[data-ga-filter]').forEach(b=>b.classList.toggle('active',b.dataset.gaFilter===filter));render();}
document.querySelectorAll('[data-ga-filter]').forEach(b=>b.addEventListener('click',()=>applyFilter(b.dataset.gaFilter)));
$('gaAudienceTypeFilter').addEventListener('change',e=>{state.audienceFilter=e.target.value;updateAudienceFilterOptions();render();});

$('gaSearch').addEventListener('input',e=>{state.search=e.target.value.toLowerCase().trim();render();});$('gaRefresh').addEventListener('click',()=>render());$('gaNew').addEventListener('click',()=>openComposer());
// Date/time is explicitly Philippine Time (UTC+08). No browser locale/DST guesses.
function phInput(ms){if(!ms)return '';const date=new Date(ms+8*3600000);return date.toISOString().slice(0,16);}
function phMillis(value){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value||''))return NaN;const n=Date.parse(value+':00+08:00');return Number.isFinite(n)&&phInput(n)===value?n:NaN;}
function scheduledLabel(ms){return ms?new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',dateStyle:'medium',timeStyle:'short'}).format(new Date(ms))+' PHT':'Not set';}
function syncPublishTiming(){const scheduled=document.querySelector('input[name="gaPublishTiming"]:checked')?.value==='schedule';$('gaScheduleFields').hidden=!scheduled;$('gaScheduleDate').required=scheduled;$('gaPublish').textContent=scheduled?'🗓 Schedule Announcement':'⚡ Publish Now';}
document.querySelectorAll('input[name="gaPublishTiming"]').forEach(el=>el.addEventListener('change',syncPublishTiming));
// Composer supports multiple attachment types in the SAME published post.
function openComposer(p=null,duplicate=false){if(!state.teacher)return;state.editingId=p&&!duplicate?p.id:'';state.editingBase=p&&!duplicate?p:null;state.files=p?JSON.parse(JSON.stringify(p.attachments||[])).map(f=>(duplicate && ['image','pdf'].includes(f.type))?{...f,sourcePostId:f.sourcePostId||p.id}:f):[];state.selectedSections=new Set(p?.audience?.sections||[]);state.selectedStudents=new Set(p?.audience?.students||[]);$('gaComposeTitle').textContent=p?(duplicate?'Duplicate announcement':'Edit announcement'):'Create announcement';$('gaPostTitle').value=p?.title||'';$('gaRichText').innerHTML=p?.bodyHtml||'';$('gaBackground').value=p?.background||'plain';$('gaCustomBackground').value=p?.bgColor||'#e8f0ff';$('gaCustomBackgroundWrap').hidden=$('gaBackground').value!=='custom';$('gaFont').value=p?.font||'Arial';document.querySelector(`input[name="gaAudience"][value="${p?.audience?.type||'all'}"]`).checked=true;$('gaAllowReplies').checked=p?.allowReplies!==false;$('gaPinned').checked=!!p?.pinned;const existingSchedule=!!(p&&!duplicate&&p.status==='scheduled');document.querySelector('input[name="gaPublishTiming"][value="'+(existingSchedule?'schedule':'now')+'"]').checked=true;$('gaScheduleDate').value=existingSchedule?phInput(p.scheduledForMs):phInput(Date.now()+10*60000);syncPublishTiming();$('gaComposerModal').hidden=false;document.body.style.overflow='hidden';$('gaComposeStatus').textContent='Compose your announcement. Attachments are saved before publishing.';renderAudience();renderAttachments();drawPreview();$('gaPostTitle').focus();}
function closeComposer(){if(state.transferBusy||state.composerBusy){toast('An upload or save is still in progress. Wait for its verified result.',true);return;}$('gaComposerModal').hidden=true;document.body.style.overflow='';}
$('gaComposeClose').addEventListener('click',closeComposer);document.querySelectorAll('[data-ga-close="composer"]').forEach(el=>el.addEventListener('click',closeComposer));
function selectedAudience(){const type=document.querySelector('input[name="gaAudience"]:checked')?.value||'all';return {type,sections:type==='sections'?[...state.selectedSections]:[],students:type==='students'?[...state.selectedStudents]:[]};}
function renderAudience(){if(!state.directoryLoaded||!state.summaryLoaded){$('gaAudienceList').replaceChildren();$('gaAudienceCount').textContent=state.audienceLoadError?'Student list could not be verified. Refresh and try again.':'Verifying student IDs and linked accounts…';return;}const audience=selectedAudience(),people=activePeople(),picker=$('gaAudiencePicker'),container=$('gaAudienceList');picker.hidden=audience.type==='all';container.replaceChildren();if(audience.type!=='all'){const q=txt($('gaAudienceSearch').value,100).toLowerCase();const items=audience.type==='sections'?[...new Map(people.map(p=>[p.sectionKey,p.section])).values()].sort().map(section=>({id:section,label:section,detail:`${people.filter(p=>p.sectionKey===sectionKey(section)).length} students`})):
 people.slice().sort((a,b)=>a.section.localeCompare(b.section)||a.name.localeCompare(b.name)).map(p=>({id:p.identityKey,label:p.name,detail:p.section+' · '+p.studentId}));for(const item of items.filter(x=>(x.label+' '+x.detail).toLowerCase().includes(q)).slice(0,500)){const label=node('label','ga-audience-item');const input=node('input');input.type='checkbox';const set=audience.type==='sections'?state.selectedSections:state.selectedStudents;input.checked=(audience.type==='sections'?[...set].some(value=>sectionKey(value)===sectionKey(item.id)):set.has(item.id))||(audience.type==='students'&&people.some(p=>p.identityKey===item.id&&p.uids.some(uid=>set.has(uid))));input.addEventListener('change',()=>{
 if(audience.type==='students'){
  // Old posts may store a historic UID. Clear ALL linked UIDs on deselect,
  // otherwise the check appears off while that student still receives posts.
  const student=people.find(p=>p.identityKey===item.id);
  for(const uid of student?.uids||[])set.delete(uid);set.delete(item.id);
  if(input.checked)set.add(item.id);
 }else{for(const previous of [...set])if(sectionKey(previous)===sectionKey(item.id))set.delete(previous);if(input.checked)set.add(item.id);}
 renderAudienceCount();
});label.append(input,node('span','',item.label+' · '+item.detail));container.append(label);}}
 renderAudienceCount();}
function renderAudienceCount(){const a=selectedAudience(),n=determineRecipients(a).length;const conflicts=state.audienceDiagnostics?.conflictingNames||0;$('gaAudienceCount').textContent=`${n} unique student${n===1?'':'s'} selected. Linked accounts count as one person.`+(conflicts?` ${conflicts} same-name records have conflicting Student IDs; verify those in the directory.`:'');}
document.querySelectorAll('input[name="gaAudience"]').forEach(el=>el.addEventListener('change',renderAudience));$('gaAudienceSearch').addEventListener('input',renderAudience);
function drawPreview(){const x=$('gaComposePreview');x.replaceChildren(node('strong','','LIVE POST PREVIEW'));const p={title:$('gaPostTitle').value||'Announcement title',bodyHtml:sanitizeHtml($('gaRichText').innerHTML),background:$('gaBackground').value,bgColor:$('gaCustomBackground').value,font:$('gaFont').value,attachments:state.files};x.append(postBody(p));const hint=$('gaMediaBackgroundHint');if(hint)hint.hidden=!state.files.length;}
['gaPostTitle','gaBackground','gaCustomBackground','gaFont','gaRichText'].forEach(id=>$(id).addEventListener(id==='gaRichText'||id==='gaCustomBackground'?'input':'change',drawPreview));$('gaBackground').addEventListener('change',()=>$('gaCustomBackgroundWrap').hidden=$('gaBackground').value!=='custom');$('gaPostTitle').addEventListener('input',drawPreview);
// Prevent browser-pasted scripts, embedded images, arbitrary CSS and tracking elements.
$('gaRichText').addEventListener('paste',e=>{const html=e.clipboardData?.getData('text/html');if(html){e.preventDefault();document.execCommand('insertHTML',false,sanitizeHtml(html));}});
function doCmd(cmd,value){$('gaRichText').focus();document.execCommand(cmd,false,value||null);drawPreview();}
for(const b of document.querySelectorAll('[data-ga-cmd]'))b.addEventListener('click',()=>doCmd(b.dataset.gaCmd));$('gaTextSize').addEventListener('change',e=>doCmd('fontSize',e.target.value));$('gaTextColor').addEventListener('input',e=>doCmd('foreColor',e.target.value));$('gaFont').addEventListener('change',e=>doCmd('fontName',e.target.value));$('gaInsertLink').addEventListener('click',()=>{const u=cleanLink(prompt('Paste HTTPS link:')||'');if(!u)return;doCmd('createLink',u);});
function cachedCatalog(type){
 // Existing lesson/activity page already maintains these metadata caches. Reading
 // them here consumes no Firestore or RTDB reads/writes.
 const key=type==='lesson'?'studentCodeStudio.lessonLibrary.v1':'studentCodeStudio.givenActivities.v1';
 try{
  const data=JSON.parse(localStorage.getItem(key)||'null')||{};
  const rows=type==='lesson'?data.lessons:data.items;
  return Array.isArray(rows)?rows:[];
 }catch{return [];}
}
function catalogItems(type){
 const local=cachedCatalog(type),entry=state.catalog?.[type==='lesson'?'lessons':'activities'];
 const remote=entry?.items||{};const rows=new Map();
 // Once the verified admin mirror exists it is authoritative; older browser
 // caches must not resurrect a deleted/unpublished resource.
 if(!entry){for(const r of local){if(r&&/^[\w-]{1,128}$/.test(String(r.id||'')))rows.set(r.id,r);}}
 for(const r of Object.values(remote)){if(r&&/^[\w-]{1,128}$/.test(String(r.id||'')))rows.set(r.id,r);}
 return [...rows.values()].filter(r=>type==='lesson'||r.published===true||r.visibility==='published').sort((a,b)=>{
  const term=a.term===b.term?0:(String(a.term||'').localeCompare(String(b.term||'')));
  return term||Number(a.order||0)-Number(b.order||0)||String(a.title||'').localeCompare(String(b.title||''));
 });
}
function loadCatalog(){
 // The catalog is a teacher-only RTDB metadata mirror, synchronized from the
 // *already loaded* Admin V2 lists. No separate academic Firestore query.
 on('catalog',data=>{state.catalog=data||{};if(!$('gaResourcePicker').hidden)renderResourcePicker();});
}
function closeResourcePicker(){
 $('gaResourcePicker').hidden=true;
 if(!$('gaComposerModal').hidden){document.body.style.overflow='hidden';$('gaAdd'+(state.pickerType==='lesson'?'Lesson':'Activity')).focus({preventScroll:true});}
 else document.body.style.overflow='';
}
function openResourcePicker(type){
 if(!state.teacher)return;
 state.pickerType=type;
 $('gaPickerTitle').textContent=type==='lesson'?'Choose a Lesson':'Choose an Activity';
 $('gaPickerDescription').textContent=type==='lesson'?'Select a lesson from your existing G8Code Lesson Library.':'Select a published activity from your existing Activities Given.';
 $('gaPickerSearch').value='';$('gaPickerTerm').value='all';
 $('gaResourcePicker').hidden=false;document.body.style.overflow='hidden';
 renderResourcePicker();$('gaPickerSearch').focus({preventScroll:true});
}
function renderResourcePicker(){
 if($('gaResourcePicker').hidden)return;
 const type=state.pickerType,all=catalogItems(type),term=$('gaPickerTerm').value,
 q=txt($('gaPickerSearch').value,120).toLowerCase(),host=$('gaPickerList');
 const matching=all.filter(r=>(term==='all'||r.term===term)&&(!q||(`${r.title||''} ${r.description||''} ${r.term||''}`).toLowerCase().includes(q)));
 host.replaceChildren();
 for(const r of matching.slice(0,300)){
  const selected=state.files.some(f=>f.type===type&&f.itemId===r.id);
  const button=node('button','ga-picker-choice');button.type='button';button.dataset.selected=String(selected);
  const ico=node('span','ga-picker-icon',type==='lesson'?'📘':r.isQuiz?'🛡️':r.isPeta?'📋':'📝');
  const info=node('span','ga-picker-info');info.append(node('strong','',txt(r.title,140)||'Untitled resource'));
  const detail=[r.term==='term1'?'Term 1':r.term==='term2'?'Term 2':r.term==='term3'?'Term 3':'',
   type==='activity'?(r.audienceSection&&r.audienceSection!=='all'?r.audienceSection:'All sections'):(r.description||'PDF Lesson')].filter(Boolean).join(' · ');
  info.append(node('small','',txt(detail,155)));
  button.append(ico,info,node('span','ga-picker-choice-indicator',selected?'✓ Attached':'Attach +'));
  button.addEventListener('click',()=>{
   if(selected){toast('This '+type+' is already attached.');closeResourcePicker();return;}
   state.files.push({type,itemId:r.id,name:txt(r.title,140)||type});
   renderAttachments();drawPreview();closeResourcePicker();toast((type==='lesson'?'Lesson':'Activity')+' attached. Add more resources or publish your post.');
  });
  host.append(button);
 }
 if(!matching.length){
  const blank=node('div','ga-picker-message');
  blank.append(node('strong','',all.length?'No matching resources':'No '+(type==='lesson'?'lessons':'published activities')+' available yet'));
  blank.append(node('span','',all.length?'Try a different title or term.':'Open the existing '+(type==='lesson'?'Lesson Library':'Activities Given')+' in Admin once to refresh the list.'));
  host.append(blank);
 }
 $('gaPickerCount').textContent=`${matching.length} available · ${state.files.filter(f=>f.type===type).length} attached`;
}
$('gaPickerClose').addEventListener('click',closeResourcePicker);
$('gaPickerDone').addEventListener('click',closeResourcePicker);
document.querySelectorAll('[data-ga-close="resource"]').forEach(el=>el.addEventListener('click',closeResourcePicker));
$('gaPickerSearch').addEventListener('input',renderResourcePicker);
$('gaPickerTerm').addEventListener('change',renderResourcePicker);
function addLink(type){
 let a;
 if(type==='link'){
  const url=cleanLink(prompt('Paste a web link (https://...)')||'');if(!url)return;
  const name=txt(prompt('Link display title:',url)||url,140);a={type:'link',url,name};
 }else if(type==='youtube'){
  const videoId=youtubeId(prompt('Paste the YouTube video URL:')||'');if(!videoId){toast('Use a valid YouTube URL.',true);return;}
  a={type:'youtube',videoId,name:txt(prompt('Video title:','YouTube video')||'YouTube video',140)};
 }else return;
 state.files.push(a);renderAttachments();
}
$('gaAddLink').addEventListener('click',()=>addLink('link'));
$('gaAddYoutube').addEventListener('click',()=>addLink('youtube'));
$('gaAddLesson').addEventListener('click',()=>openResourcePicker('lesson'));
$('gaAddActivity').addEventListener('click',()=>openResourcePicker('activity'));
$('gaAddImages').addEventListener('click',()=>$('gaImageFiles').click());
$('gaAddPdf').addEventListener('click',()=>$('gaPdfFiles').click());
function renderAttachments(){const host=$('gaAttachmentList');host.replaceChildren();state.files.forEach((f,i)=>{const row=node('div','ga-attachment-item');row.append(node('span','',f.type==='image'?'🖼':f.type==='pdf'?'📄':f.type==='lesson'?'📘':f.type==='activity'?'📝':f.type==='youtube'?'▶':'🔗'),node('strong','',f.name),node('small','',f.type.toUpperCase()));for(const [mark,delta] of [['↑',-1],['↓',1]]){const b=node('button','',mark);b.type='button';b.title='Reorder';b.disabled=i+delta<0||i+delta>=state.files.length;b.addEventListener('click',()=>{const tmp=state.files[i];state.files[i]=state.files[i+delta];state.files[i+delta]=tmp;renderAttachments();});row.append(b);}const x=node('button','','×');x.type='button';x.title='Remove attachment';x.addEventListener('click',()=>{state.files.splice(i,1);renderAttachments();});row.append(x);host.append(row);});drawPreview();}
function postFromEditor(id,status){
 const old=state.editingBase,title=txt($('gaPostTitle').value,140),bodyHtml=sanitizeHtml($('gaRichText').innerHTML);
 if(!title&&!plainHtml(bodyHtml)&&!state.files.length)throw Error('Write a title, message, or include an attachment.');
 const scheduledForMs=status==='scheduled'?phMillis($('gaScheduleDate').value):0;
 if(status==='scheduled'){
  if(!Number.isFinite(scheduledForMs))throw Error('Select a valid Philippine date and time.');
  if(scheduledForMs<Date.now()+90000)throw Error('Schedule at least 2 minutes in the future to allow server processing.');
  if(scheduledForMs>Date.now()+366*86400000)throw Error('Schedule within the next 12 months.');
 }
 // A previously published post preserves its first publication date when edited.
 const publishedAtMs=status==='published'?(old?.status==='published'&&old?.publishedAtMs||Date.now()):0;
 return {id,title:title||'Class announcement',bodyHtml,background:$('gaBackground').value,bgColor:$('gaCustomBackground').value,font:$('gaFont').value,status,allowReplies:$('gaAllowReplies').checked,pinned:$('gaPinned').checked,audience:selectedAudience(),attachments:state.files.map(f=>({...f})),createdByUid:old?.createdByUid||state.user.uid,createdAtMs:old?.createdAtMs||Date.now(),updatedAtMs:Date.now(),publishedAtMs,scheduledForMs};
}
function feedCopy(p){return {id:p.id,title:p.title,bodyHtml:p.bodyHtml,background:p.background,bgColor:p.bgColor,font:p.font,status:p.status,allowReplies:p.allowReplies,pinned:p.pinned,attachments:p.attachments||[],createdAtMs:p.createdAtMs,publishedAtMs:p.publishedAtMs,updatedAtMs:p.updatedAtMs};}
async function persistPost(p){
 if(['published','scheduled'].includes(p.status)&&(!state.directoryLoaded||!state.summaryLoaded))throw Error('Student information is still loading. Please try again shortly.');
 const old=state.posts[p.id]||{};
 const oldList=Object.keys(old.recipients||{});
 const targetList=['published','scheduled'].includes(p.status)?recipientAccountUids(p.audience):[];
 p.recipients=Object.fromEntries(targetList.map(uid=>[uid,true]));
 if(['published','scheduled'].includes(p.status)&&!targetList.length)throw Error('No students found for this audience. Check your student list and try again.');
 if(targetList.length>2500)throw Error('Unusually large audience. Review the selected students before publishing.');
 const updates={[`posts/${p.id}`]:p,
  // Private admin-only queue; no student feed exists until actual publication.
  [`scheduleQueue/${p.id}`]:p.status==='scheduled'?{postId:p.id,scheduledForMs:p.scheduledForMs,updatedAtMs:p.updatedAtMs}:null};
 const newList=p.status==='published'?targetList:[];
 const oldSet=new Set(oldList),newSet=new Set(newList);
 // Remove any previously published student feed when moving to scheduled/draft.
 for(const uid of oldSet)if(!newSet.has(uid))updates[`feeds/${uid}/${p.id}`]=null;
 for(const uid of newSet)updates[`feeds/${uid}/${p.id}`]=feedCopy(p);
 await state.sdk.update(state.sdk.ref(state.db,BASE),updates);
}
async function saveCurrent(status){
 if(state.composerBusy||state.transferBusy)return;
 if(status!=='draft')status=document.querySelector('input[name="gaPublishTiming"]:checked')?.value==='schedule'?'scheduled':'published';
 state.composerBusy=true;
 const buttons=[$('gaSaveDraft'),$('gaPublish')];buttons.forEach(b=>b.disabled=true);
 alertStatus(status==='published'?'Publishing to selected students…':status==='scheduled'?'Scheduling automatic publication…':'Saving draft…');
 try{
  const id=state.editingId||state.sdk.push(path('posts')).key;
  const p=postFromEditor(id,status);await persistPost(p);
  if(status==='published')void window.G8CodePush?.queueTeacherEvent?.({type:'announcements',itemId:p.id,recipientUids:Object.keys(p.recipients||{})});
  toast(status==='published'?`Published to ${determineRecipients(p.audience).length} students.`:status==='scheduled'?`Scheduled for ${scheduledLabel(p.scheduledForMs)}. Students cannot see it yet.`:'Draft saved successfully.');
  state.composerBusy=false;closeComposer();
 }catch(e){alertStatus('Save failed: '+e.message,true);toast(e.message,true);}
 finally{state.composerBusy=false;buttons.forEach(b=>b.disabled=false);}
}
$('gaSaveDraft').addEventListener('click',()=>saveCurrent('draft'));
$('gaPublish').addEventListener('click',()=>saveCurrent('publish'));
async function archivePost(p){if(!confirm('Archive this post and remove it from student feeds?'))return;try{const updated={...state.posts[p.id],status:'archived',updatedAtMs:Date.now()};await persistPost(updated);toast('Announcement archived.');}catch(e){toast(e.message,true);}}
async function publishExisting(p){try{const updated={...state.posts[p.id],status:'published',publishedAtMs:p.status==='published'&&p.publishedAtMs||Date.now(),scheduledForMs:0,updatedAtMs:Date.now()};await persistPost(updated);void window.G8CodePush?.queueTeacherEvent?.({type:'announcements',itemId:updated.id,recipientUids:Object.keys(updated.recipients||{})});toast('Announcement published.');}catch(e){toast(e.message,true);}}
async function deletePost(p){if(!confirm(`Permanently delete “${p.title}” for everyone? Attached Drive files will remain in private Drive until cleaned up.`))return;try{const old=state.posts[p.id];const recipients=Object.keys(old.recipients||{}).map(uid=>({uid}));const updates={[`posts/${p.id}`]:null,[`scheduleQueue/${p.id}`]:null,[`reactions/${p.id}`]:null,[`replies/${p.id}`]:null};for(const r of recipients)updates[`feeds/${r.uid}/${p.id}`]=null;await state.sdk.update(state.sdk.ref(state.db,BASE),updates);toast('Post deleted.');}catch(e){toast('Delete failed: '+e.message,true);}}
// Workspace Drive: receipt-based request (no CORS response is ever treated as success).
function driveEndpoint(){return String(window.MCS_G8_MESSAGES_DRIVE_URL||window.MCS_APPS_SCRIPT_URL||'').trim();}
async function driveRequest(action,data={},maxWait=70000){currentUser();if(location.protocol!=='https:')throw Error('Private Drive transfers require your deployed HTTPS G8Code site.');const endpoint=driveEndpoint();if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec(?:\?.*)?$/.test(endpoint))throw Error('Apps Script /exec URL is missing.');const token=await state.user.getIdToken();const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');const inbox=path(`transfers/${state.user.uid}/${nonce}`);return new Promise((resolve,reject)=>{let done=false,off=()=>{};let timer;const finish=(err,receipt)=>{if(done)return;done=true;clearTimeout(timer);off();if(receipt)state.sdk.remove(inbox).catch(()=>{});if(err)reject(err);else resolve(receipt?.data||{});};timer=setTimeout(()=>finish(Error('The file request could not be confirmed. Please try again.')),maxWait);off=state.sdk.onValue(inbox,s=>{if(!s.exists())return;const r=s.val();if(r.action!==action)return;finish(r.ok?null:Error(r.error||'Drive request denied'),r);},e=>finish(Error('Cannot read Drive confirmation: '+e.message)));const body=new URLSearchParams({g8aBridge:'1',nonce,action,idToken:token,origin:location.origin,...Object.fromEntries(Object.entries(data).map(([k,v])=>[k,String(v??'')]))});fetch(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body,cache:'no-store'}).catch(e=>console.warn('No-CORS POST error (receipt still authoritative):',e));});}
function base64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=()=>reject(Error('Cannot read selected file.'));r.readAsDataURL(file);});}
async function optimize(file){if(file.size<=2.5*1024*1024)return file;const bmp=await createImageBitmap(file);try{let size=Math.min(Math.max(bmp.width,bmp.height),3300);for(let pass=0;pass<9;pass++){const w=Math.max(1,Math.round(bmp.width*size/Math.max(bmp.width,bmp.height))),h=Math.max(1,Math.round(bmp.height*size/Math.max(bmp.width,bmp.height)));const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(bmp,0,0,w,h);for(const quality of [.9,.8,.7]){const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',quality));if(blob&&blob.size<=2.6*1024*1024)return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});}size=Math.floor(size*.78);}throw Error('Image could not be optimized to a safe Drive transfer size.');}finally{bmp.close?.();}}
async function ensureUploadDraft(){if(state.editingId)return state.editingId;const id=state.sdk.push(path('posts')).key;const p={id,title:txt($('gaPostTitle').value,140)||'Untitled announcement',bodyHtml:sanitizeHtml($('gaRichText').innerHTML),background:$('gaBackground').value,bgColor:$('gaCustomBackground').value,font:$('gaFont').value,status:'draft',allowReplies:true,pinned:false,audience:selectedAudience(),attachments:[],recipients:{},createdAtMs:Date.now(),updatedAtMs:Date.now(),publishedAtMs:0};await state.sdk.set(path(`posts/${id}`),p);state.editingId=id;state.editingBase=p;alertStatus('Private draft created for attachment upload.');return id;}
async function uploadBatch(files,type){if(!state.teacher)return;const count=state.files.filter(x=>x.type===type).length;if(count+files.length>(type==='image'?MAX_IMAGES:MAX_PDFS)){toast(`Maximum ${type==='image'?MAX_IMAGES:MAX_PDFS} ${type} files per announcement.`,true);return;}state.transferBusy=true;[$('gaPublish'),$('gaSaveDraft')].forEach(b=>b.disabled=true);try{const id=await ensureUploadDraft();for(let i=0;i<files.length;i++){let file=files[i];if(type==='image'){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>MAX_IMAGE_INPUT)throw Error('Images must be JPG/PNG/WEBP and up to 30 MB selected size.');file=await optimize(file);}else{if(file.size>MAX_PDF||!(file.type==='application/pdf'||/\.pdf$/i.test(file.name)))throw Error('PDF must be at most 3 MB.');}
 alertStatus(`Uploading ${i+1}/${files.length} ${type}…`);const raw=await base64(file);const result=await driveRequest('upload',{postId:id,fileName:file.name,contentType:file.type||'application/pdf',fileData:raw},90000);if(!/^[\w-]{15,150}$/.test(result.driveFileId||''))throw Error('File upload could not be confirmed.');state.files.push({type,name:file.name,driveFileId:result.driveFileId,size:file.size,contentType:file.type});renderAttachments();const draft=postFromEditor(id,'draft');await state.sdk.set(path(`posts/${id}`),draft);state.editingBase=draft;if(type==='image')void gaPhotos.seed({id},state.files[state.files.length-1],file);alertStatus(`✓ Uploaded ${i+1}/${files.length}. Draft saved.`);}}
 catch(e){alertStatus('Upload failed: '+e.message,true);toast(e.message,true);}finally{state.transferBusy=false;[$('gaPublish'),$('gaSaveDraft')].forEach(b=>b.disabled=false);$('gaImageFiles').value='';$('gaPdfFiles').value='';}}
$('gaImageFiles').addEventListener('change',e=>uploadBatch([...e.target.files].slice(0,MAX_IMAGES),'image'));$('gaPdfFiles').addEventListener('change',e=>uploadBatch([...e.target.files].slice(0,MAX_PDFS),'pdf'));
async function getFileData(p,f,variant='full'){
 return gaPhotos.get(p,f,variant,async()=>{
  const res=await driveRequest('read',{postId:p.id,driveFileId:f.driveFileId},70000);
  if(!res.data||!res.contentType)throw Error('The attached file could not be opened.');
  const bytes=Uint8Array.from(atob(res.data),c=>c.charCodeAt(0));
  return new Blob([bytes],{type:res.contentType});
 },()=>attachmentAccessible(p,f));
}
async function loadImage(p,f,img){
 const btn=img.closest('.ga-image');if(!btn)return;
 const retry=btn.querySelector('.ga-image-retry');
 if(btn.dataset.gaLoading==='true')return;
 btn.dataset.gaLoading='true';btn.classList.remove('ga-image-failed','ga-image-ready');retry.hidden=true;
 const token=String(Number(btn.dataset.gaImageToken||0)+1);btn.dataset.gaImageToken=token;
 try{
  const url=await withPreviewTurn(()=>img.isConnected?getFileData(p,f,'thumb'):'');
  if(!url||!img.isConnected||btn.dataset.gaImageToken!==token||!attachmentAccessible(p,f))return;
  await new Promise((resolve,reject)=>{
   img.onload=resolve;img.onerror=()=>reject(Error('Could not display photo'));
   img.src=url;
   if(img.complete){if(img.naturalWidth>0)resolve();else reject(Error('Could not display photo'));}
  });
  if(btn.dataset.gaImageToken===token)btn.classList.add('ga-image-ready');
 }catch(_){if(img.isConnected&&btn.dataset.gaImageToken===token)btn.classList.add('ga-image-failed');}
 finally{if(btn.dataset.gaImageToken===token)btn.dataset.gaLoading='false';}
}
// Keep the post tappable while a photo downloads, but show a friendly retry
// after a *real* failure. Never expose Drive filenames or raw transport errors.
document.addEventListener('click',event=>{
 const retry=event.target.closest('.ga-image-retry');if(!retry)return;
 event.stopPropagation();event.preventDefault();
 const img=retry.closest('.ga-image')?.querySelector('.ga-feed-photo');
 if(img&&typeof img.__gaRetry==='function')img.__gaRetry();
},true);
document.addEventListener('keydown',event=>{
 if((event.key==='Enter'||event.key===' ')&&event.target.closest('.ga-image-retry')){
  event.preventDefault();event.target.click();
 }
});

// Three real photo panels ensure the next picture follows the finger instead
// of replacing an <img> abruptly. IndexedDB remains the image byte source.
let gaGalleryUI=null,gaGalleryGesture=null,gaGalleryAnimating=false;
let gaGalleryTimer=0,gaGalleryEndHandler=null;
const GA_SLIDE_MS=310;
function gaReducedMotion(){return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;}
function gaViewerActive(){return !$('gaViewerModal').hidden&&!!state.viewerPost&&state.viewerGallery.length>0;}
function gaGalleryMeasure(){
 if(!gaGalleryUI)return;
 gaGalleryUI.stage.style.setProperty('--ga-gallery-stage-width',Math.max(1,gaGalleryUI.stage.clientWidth)+'px');
}
function gaGalleryStep(){
 if(!gaGalleryUI)return 1;
 const frame=gaGalleryUI.frames[1].el;
 return Math.max(1,frame.getBoundingClientRect().width+(parseFloat(getComputedStyle(gaGalleryUI.track).columnGap)||0));
}
function gaGalleryOffset(px,animate=false){
 if(!gaGalleryUI)return;
 const track=gaGalleryUI.track;
 track.style.transition=animate&&!gaReducedMotion()?`transform ${GA_SLIDE_MS}ms cubic-bezier(.2,.82,.24,1)`:'none';
 track.style.setProperty('--ga-gallery-shift',Math.round(px)+'px');
}
function gaGalleryCancelAnimation(){
 clearTimeout(gaGalleryTimer);gaGalleryTimer=0;
 if(gaGalleryEndHandler&&gaGalleryUI)gaGalleryUI.track.removeEventListener('transitionend',gaGalleryEndHandler);
 gaGalleryEndHandler=null;gaGalleryAnimating=false;gaGalleryGesture=null;gaGalleryOffset(0,false);
}
function gaGalleryFrame(){
 const frame=node('div','ga-photo-frame');
 const img=node('img','ga-photo-full');img.alt='';img.draggable=false;img.decoding='async';
 const loading=node('div','ga-photo-loading');loading.setAttribute('aria-live','off');
 const icon=node('div','ga-photo-loading-icon','▧');icon.setAttribute('aria-hidden','true');
 const spin=node('span','ga-photo-spinner');spin.setAttribute('aria-hidden','true');
 const message=node('span','ga-photo-loading-message','Loading photo…');
 const retry=node('button','ga-photo-try-again','↻ Try again');retry.type='button';retry.hidden=true;
 loading.append(icon,spin,message,retry);frame.append(img,loading);
 return {el:frame,img,loading,message,spin,retry};
}
function gaGalleryBuild(){
 const body=$('gaViewerBody');body.replaceChildren();
 const stage=node('div','ga-photo-stage');stage.setAttribute('aria-label','Announcement photo gallery');
 const track=node('div','ga-photo-track');
 const frames=[gaGalleryFrame(),gaGalleryFrame(),gaGalleryFrame()];
 frames.forEach(f=>track.append(f.el));stage.append(track);
 const count=node('span','ga-photo-counter');count.setAttribute('aria-live','polite');
 const prev=node('button','ga-photo-arrow ga-photo-prev','‹');const next=node('button','ga-photo-arrow ga-photo-next','›');
 for(const [b,label] of [[prev,'Previous photo'],[next,'Next photo']]){
  b.type='button';b.setAttribute('aria-label',label);
 }
 prev.addEventListener('click',()=>changeGallery(-1));next.addEventListener('click',()=>changeGallery(1));
 stage.append(prev,next,count);body.append(stage);
 gaGalleryUI={stage,track,frames,count,prev,next};
 gaGalleryMeasure();
 stage.addEventListener('pointerdown',gaGalleryPointerDown);
 stage.addEventListener('pointermove',gaGalleryPointerMove);
 stage.addEventListener('pointerup',gaGalleryPointerUp);
 stage.addEventListener('pointercancel',gaGalleryPointerCancel);
 stage.addEventListener('lostpointercapture',gaGalleryPointerCancel);
 return gaGalleryUI;
}
function gaGalleryControls(){
 if(!gaGalleryUI)return;
 const n=state.viewerGallery.length,i=state.viewerIndex;
 gaGalleryUI.stage.classList.toggle('has-gallery',n>1);
 gaGalleryUI.count.textContent=`${i+1} / ${n}`;
 gaGalleryUI.count.hidden=n<2;
 gaGalleryUI.prev.hidden=gaGalleryUI.next.hidden=n<2;
 gaGalleryUI.prev.disabled=i===0;
 gaGalleryUI.next.disabled=i===n-1;
 // Photo viewer header contains a friendly label, not the raw filename.
 $('gaViewerTitle').textContent=n>1?`Photo ${i+1} of ${n}`:'Photo';
 $('gaViewerError').textContent='';
}
function gaPhotoApplyImage(frame,url,token){
 if(!url||frame.el.dataset.gaToken!==String(token))return Promise.resolve(false);
 // Decode into a detached Image first. If the frame already displays a cached
 // thumbnail, retain it visibly until the sharper file is fully ready.
 return new Promise(resolve=>{
  const test=new Image();test.decoding='async';
  let done=false;
  const finish=ok=>{
   if(done)return;done=true;test.onload=null;test.onerror=null;
   if(frame.el.dataset.gaToken!==String(token)){resolve(false);return;}
   if(ok){frame.img.src=url;frame.el.classList.add('is-ready');frame.el.classList.remove('is-error');frame.retry.hidden=true;}
   resolve(ok);
  };
  test.onload=()=>{if(test.decode)test.decode().then(()=>finish(true),()=>finish(test.naturalWidth>0));else finish(true);};
  test.onerror=()=>finish(false);
  test.src=url;
  if(test.complete){if(test.naturalWidth>0)test.onload();else finish(false);}
 });
}
function gaPhotoError(frame,retryAction,token){
 if(frame.el.dataset.gaToken!==String(token))return;
 frame.el.classList.add('is-error');frame.el.classList.remove('is-ready');
 frame.message.textContent="Couldn't load photo";
 frame.spin.hidden=true;frame.retry.hidden=false;
 frame.retry.onclick=event=>{event.stopPropagation();retryAction();};
}
async function gaGalleryLoadFrame(slot,index,token,preview=''){
 const ui=gaGalleryUI;if(!ui)return;
 const frame=ui.frames[slot];const p=state.viewerPost,f=state.viewerGallery[index];
 frame.el.dataset.gaToken=String(token);
 frame.el.classList.remove('is-ready','is-error','is-empty');
 frame.img.removeAttribute('src');frame.message.textContent='Loading photo…';frame.spin.hidden=false;frame.retry.hidden=true;
 frame.retry.onclick=null;
 if(!f){frame.el.classList.add('is-empty');frame.loading.hidden=true;return;}
 frame.loading.hidden=false;
 const relevant=()=>gaViewerActive()&&gaGalleryUI===ui&&frame.el.dataset.gaToken===String(token)&&state.viewerPost===p;
 if(preview&&slot===1){
  // The arriving neighbor was already decoded on screen. Reuse its URL
  // synchronously as the newly centered image so the recenter cannot paint
  // a blank frame before the full-quality replacement finishes loading.
  frame.img.src=preview;
  frame.el.classList.add('is-ready');
 }else if(preview){void gaPhotoApplyImage(frame,preview,token);}
 try{
  // Center receives full-resolution; side panels use locally optimized thumbs.
  const url=slot===1?await getFileData(p,f,'full'):await withPreviewTurn(()=>getFileData(p,f,'thumb'));
  if(!relevant())return;
  const good=await gaPhotoApplyImage(frame,url,token);
  if(!relevant())return;
  if(!good)throw Error('Image decode failed');
  if(slot===1){
   state.viewerFile={url,name:f.name||`Photo ${index+1}.jpg`};
   $('gaViewerDownload').disabled=false;
  }
 }catch(_){
  if(relevant()&&!frame.el.classList.contains('is-ready'))gaPhotoError(frame,()=>gaGalleryLoadFrame(slot,index,Number(frame.el.dataset.gaToken)+1),token);
  // If a preview is already showing, keep it instead of flashing an error.
 }
}
function gaGalleryRender(preview=''){
 if(!gaViewerActive())return;
 if(!gaGalleryUI)gaGalleryBuild();
 const ui=gaGalleryUI,index=state.viewerIndex,n=state.viewerGallery.length;
 gaGalleryControls();gaGalleryMeasure();gaGalleryOffset(0,false);
 state.viewerFile=null;$('gaViewerDownload').disabled=true;
 const token=++state.viewerRequest;
 const indexes=[index-1,index,index+1];
 indexes.forEach((value,slot)=>{
  // No wrap-around: reaching the first/last photo gives a gentle edge resistance.
  gaGalleryLoadFrame(slot,value<0||value>=n?-1:value,token,slot===1?preview:'');
 });
}
function closeViewer(){
 state.viewerRequest++;gaGalleryCancelAnimation();gaGalleryUI=null;
 state.viewerGallery=[];state.viewerPost=null;state.viewerIndex=0;state.viewerFile=null;
 if(state.viewerUrl){URL.revokeObjectURL(state.viewerUrl);state.viewerUrl='';}
 $('gaViewerBody').replaceChildren();$('gaViewerModal').hidden=true;
}
$('gaViewerClose').addEventListener('click',closeViewer);
document.querySelectorAll('[data-ga-close="viewer"]').forEach(el=>el.addEventListener('click',closeViewer));
function gaGallerySlideTo(next){
 if(!gaViewerActive()||!gaGalleryUI||gaGalleryAnimating)return;
 const delta=next-state.viewerIndex;
 if(Math.abs(delta)!==1||next<0||next>=state.viewerGallery.length){gaGalleryOffset(0,true);return;}
 const ui=gaGalleryUI;gaGalleryAnimating=true;
 const landing=ui.frames[delta>0?2:0].img;
 const preview=landing.complete&&landing.naturalWidth>0?landing.src:'';
 const finish=()=>{
  if(!gaGalleryAnimating||gaGalleryUI!==ui)return;
  clearTimeout(gaGalleryTimer);gaGalleryTimer=0;
  if(gaGalleryEndHandler)ui.track.removeEventListener('transitionend',gaGalleryEndHandler);
  gaGalleryEndHandler=null;gaGalleryAnimating=false;
  state.viewerIndex=next;
  // Recenter only after the incoming panel has fully arrived.
  gaGalleryOffset(0,false);gaGalleryRender(preview);
 };
 gaGalleryEndHandler=e=>{if(e.target===ui.track&&e.propertyName==='transform')finish();};
 ui.track.addEventListener('transitionend',gaGalleryEndHandler);
 // Commit the live drag position before the remaining slide animates.
 void ui.track.getBoundingClientRect().left;
 gaGalleryOffset(-delta*gaGalleryStep(),true);
 gaGalleryTimer=setTimeout(finish,(gaReducedMotion()?0:GA_SLIDE_MS)+80);
}
function changeGallery(delta){
 if(!gaViewerActive()||state.viewerGallery.length<2||gaGalleryAnimating)return;
 gaGallerySlideTo(state.viewerIndex+delta);
}
function gaGalleryPointerDown(event){
 if(!gaViewerActive()||gaGalleryAnimating||state.viewerGallery.length<2||event.button!==0||event.target.closest('button'))return;
 if(gaGalleryGesture)return; // Multi-touch must not accidentally change the gallery.
 gaGalleryGesture={pointer:event.pointerId,x:event.clientX,y:event.clientY,dx:0,axis:'',at:performance.now()};
 try{gaGalleryUI.stage.setPointerCapture(event.pointerId);}catch(_){ }
}
function gaGalleryPointerMove(event){
 const g=gaGalleryGesture;if(!g||g.pointer!==event.pointerId||!gaGalleryUI||gaGalleryAnimating)return;
 const dx=event.clientX-g.x,dy=event.clientY-g.y;
 if(!g.axis&&Math.max(Math.abs(dx),Math.abs(dy))>9)g.axis=Math.abs(dx)>Math.abs(dy)*1.05?'x':'y';
 if(g.axis!=='x')return;
 g.dx=dx;
 const blocked=dx>0?state.viewerIndex===0:state.viewerIndex===state.viewerGallery.length-1;
 gaGalleryOffset(blocked?dx*.22:dx,false);
}
function gaGalleryPointerUp(event){
 const g=gaGalleryGesture;if(!g||g.pointer!==event.pointerId)return;
 gaGalleryGesture=null;
 if(!gaGalleryUI||gaGalleryAnimating)return;
 const dx=event.clientX-g.x,dy=event.clientY-g.y;
 if(g.axis==='x'&&Math.abs(dx)>Math.abs(dy)*1.05){
  const elapsed=Math.max(1,performance.now()-g.at);
  const delta=dx<0?1:-1;
  const canMove=delta>0?state.viewerIndex<state.viewerGallery.length-1:state.viewerIndex>0;
  if(canMove&&(Math.abs(dx)>Math.min(75,gaGalleryStep()*.21)||(Math.abs(dx)>28&&Math.abs(dx)/elapsed>.48))){
   gaGallerySlideTo(state.viewerIndex+delta);return;
  }
 }
 gaGalleryOffset(0,true);
}
function gaGalleryPointerCancel(event){
 if(!gaGalleryGesture||gaGalleryGesture.pointer!==event.pointerId)return;
 gaGalleryGesture=null;if(!gaGalleryAnimating)gaGalleryOffset(0,true);
}
async function openFile(p,f){
 $('gaViewerModal').hidden=false;state.viewerRequest++;
 $('gaViewerError').textContent='';$('gaViewerDownload').disabled=true;state.viewerFile=null;
 if(f.type==='image'){
  gaGalleryCancelAnimation();gaGalleryUI=null;
  state.viewerPost=p;state.viewerGallery=(p.attachments||[]).filter(x=>x.type==='image');
  state.viewerIndex=Math.max(0,state.viewerGallery.findIndex(x=>x.driveFileId===f.driveFileId));
  gaGalleryBuild();gaGalleryRender();return;
 }
 gaGalleryCancelAnimation();gaGalleryUI=null;state.viewerGallery=[];state.viewerPost=null;
 $('gaViewerTitle').textContent=txt(f.name||'Attachment',120);
 const body=$('gaViewerBody');body.replaceChildren();
 const request=++state.viewerRequest;
 const status=node('div','ga-file-loading');
 const spinner=node('span','ga-photo-spinner');spinner.setAttribute('aria-hidden','true');
 status.append(spinner,node('span','', 'Opening attachment…'));body.append(status);
 try{
  const url=await getFileData(p,f);
  if(request!==state.viewerRequest||$('gaViewerModal').hidden)return;
  const frame=node('iframe');frame.src=url;frame.title=txt(f.name||'Attachment');body.replaceChildren(frame);
  $('gaViewerError').textContent='';$('gaViewerDownload').disabled=false;state.viewerFile={url,name:f.name};
 }catch(_){if(request===state.viewerRequest){status.replaceChildren(node('span','','Could not open attachment. Please try again.'));}}
}
window.addEventListener('resize',()=>{
 if(gaGalleryUI){gaGalleryMeasure();if(!gaGalleryAnimating)gaGalleryOffset(0,false);}
 if(state.detailPostId){
  syncMobilePostViewport();
  const commentsOnly=state.detailMode==='comments'&&isMobilePostView();
  if($('gaPostModal').classList.contains('ga-mobile-comments-view')!==commentsOnly){
   $('gaPostModal').classList.toggle('ga-mobile-comments-view',commentsOnly);
   $('gaPostModal').classList.toggle('ga-mobile-post-view',!commentsOnly);
   $('gaMobileReactionBar').hidden=!commentsOnly;
   $('gaPostBack').hidden=!isMobilePostView();
   refreshPostDialog(true);
  }
 }
});
$('gaViewerDownload').addEventListener('click',()=>{if(!state.viewerFile)return;const a=node('a');a.href=state.viewerFile.url;a.download=state.viewerFile.name;a.click();});
document.addEventListener('keydown',e=>{
 if(e.key==='Tab'&&!$('gaPostModal').hidden&&$('gaViewerModal').hidden){
  const buttons=[...$('gaPostModal').querySelectorAll('button:not([disabled]),a[href],textarea:not([disabled]),input:not([disabled])')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
  if(buttons.length){const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 }
 if(e.key==='Escape'){if(!$('gaReactorsModal').hidden)closeReactorDialog();else if(!$('gaViewerModal').hidden)closeViewer();else if(!$('gaResourcePicker').hidden)closeResourcePicker();else if(!$('gaComposerModal').hidden)closeComposer();else if(!$('gaPostModal').hidden)requestPostBack();}else if(!$('gaViewerModal').hidden&&state.viewerGallery.length>1){if(e.key==='ArrowRight')changeGallery(1);else if(e.key==='ArrowLeft')changeGallery(-1);}});
void boot();
})();
