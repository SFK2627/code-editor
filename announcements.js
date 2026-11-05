/* G8Code Announcements V1.1. Private persistent image cache; RTDB-only posts, feeds, reactions, replies and reads.
 * Private Workspace Drive transfer uses the existing Apps Script deployment.
 * No Firestore import, read, or write occurs in this file. */
(()=>{'use strict';
const $=id=>document.getElementById(id), BASE='g8AnnouncementsV1', MAX_IMAGES=10, MAX_PDFS=10, MAX_IMAGE_INPUT=30*1024*1024, MAX_PDF=3*1024*1024;
const gaPhotos=window.G8AnnouncementsPhotoCache;
const SRC=new URLSearchParams(location.search).get('from');
const teacherShortcut=SRC==='login'; // Matches the verified Teacher Messages Admin Code entry.
const teachers=new Set((window.MCS_TEACHER_EMAILS||[]).map(x=>String(x).toLowerCase()));
const state={sdk:null,auth:null,db:null,user:null,teacher:false,profile:null,posts:{},seen:{},directory:{},messageSummaries:{},directoryLoaded:false,summaryLoaded:false,audienceLoadError:false,audienceDiagnostics:null,reactions:{},comments:{},unsubs:[],postUnsubs:[],filter:'all',search:'',editingId:'',editingBase:null,files:[],selectedSections:new Set(),selectedStudents:new Set(),composerBusy:false,transferBusy:false,viewerUrl:'',viewerFile:null,viewerGallery:[],viewerIndex:0,viewerPost:null,viewerRequest:0,blobOwner:'',commentExpanded:new Set(),commentDrafts:{},markObserver:null,displayedIds:[],commentOpen:new Set(),replyTargets:{},catalog:{},pickerType:'lesson',backGuardInstalled:false};
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
function cleanup(){while(state.unsubs.length){try{state.unsubs.pop()();}catch{}}while(state.postUnsubs.length){try{state.postUnsubs.pop()();}catch{}}state.markObserver?.disconnect();state.markObserver=null;closeViewer();gaPhotos.clearMemory();}
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
function installSmartBack(){
 if(state.backGuardInstalled)return;state.backGuardInstalled=true;
 try{history.pushState({g8AnnouncementsRoleBack:true},'',location.href);window.addEventListener('popstate',goBack);}catch(error){console.info('Announcements browser Back guard:',error);}
}
$('gaBack').addEventListener('click',e=>{e.preventDefault();goBack();});
function accountReset(account){cleanup();state.user=account;state.teacher=isTeacher(account);state.posts={};state.seen={};state.directory={};state.messageSummaries={};state.directoryLoaded=false;state.summaryLoaded=false;state.audienceLoadError=false;state.audienceDiagnostics=null;state.catalog={};state.reactions={};state.comments={};state.commentDrafts={};state.commentExpanded.clear();state.commentOpen.clear();state.replyTargets={};state.displayedIds=[];state.restoredPosition=false;$('gaFeed').replaceChildren();state.blobOwner=account?.uid||'';gaPhotos.setOwner(state.blobOwner);}
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
 render();gaPhotos.scheduleReconcile(state.posts);
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
  state.directory=snap.val()||{};state.directoryLoaded=true;if(state.summaryLoaded)renderAudience();
 },err=>{state.audienceLoadError=true;toast('Student list could not be loaded. Please refresh and try again.',true);
  $('gaAudienceCount').textContent='Cannot publish until the student directory is available.';}));
 state.unsubs.push(state.sdk.onValue(state.sdk.ref(state.db,base+'summary'),snap=>{
  state.messageSummaries=snap.val()||{};state.summaryLoaded=true;if(state.directoryLoaded)renderAudience();
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
 return people.sort((a,b)=>a.section.localeCompare(b.section)||a.name.localeCompare(b.name));
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
function normalizePost(raw,id){return {id,title:txt(raw.title||'Untitled announcement',140),bodyHtml:sanitizeHtml(raw.bodyHtml||''),background:['plain','blue','lavender','yellow','mint','rose','navy','gradient','custom'].includes(raw.background)?raw.background:'plain',font:['Arial','Georgia','Verdana','Trebuchet MS','Times New Roman','Courier New'].includes(raw.font)?raw.font:'Arial',bgColor:/^#[0-9a-f]{6}$/i.test(raw.bgColor||'')?raw.bgColor:'#e8f0ff',status:raw.status||'draft',pinned:!!raw.pinned,allowReplies:raw.allowReplies!==false,attachments:(Array.isArray(raw.attachments)?raw.attachments:Object.values(raw.attachments||{})).slice(0,40),createdAtMs:Number(raw.createdAtMs||0),publishedAtMs:Number(raw.publishedAtMs||0),updatedAtMs:Number(raw.updatedAtMs||0),audience:raw.audience||{type:'all'}};}
function published(p){return p.status==='published';}
function allIds(){const rows=Object.entries(state.posts).map(([id,p])=>normalizePost(p,id));const filter=state.filter;return rows.filter(p=>state.teacher?filter==='drafts'?p.status==='draft':filter==='archived'?p.status==='archived':filter==='all'?p.status!=='archived':published(p):published(p)).filter(p=>filter!=='unread'||state.teacher||!state.seen[p.id]).filter(p=>filter!=='pinned'||p.pinned).filter(p=>!state.search||[p.title,plainHtml(p.bodyHtml)].join(' ').toLowerCase().includes(state.search)).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(b.publishedAtMs||b.createdAtMs)-Number(a.publishedAtMs||a.createdAtMs)).slice(0,80);}
function renderBadges(){if(state.teacher){$('gaAllCount').textContent=Object.values(state.posts).filter(p=>p.status==='published').length;return;}const posts=Object.entries(state.posts).filter(([,p])=>published(p));const newCount=posts.filter(([id])=>!state.seen[id]).length;$('gaAllCount').textContent=posts.length;$('gaUnreadCount').textContent=newCount;document.title=newCount?`(${newCount}) Announcements · G8Code`:'Announcements · G8Code';}
function renderReadFlags(){document.querySelectorAll('[data-ga-post-new]').forEach(el=>{el.hidden=!!state.seen[el.dataset.gaPostNew];});}
function render(){renderBadges();while(state.postUnsubs.length){try{state.postUnsubs.pop()();}catch{}}state.markObserver?.disconnect();const feed=$('gaFeed');feed.replaceChildren();const rows=allIds();state.displayedIds=rows.map(r=>r.id);$('gaFeedStatus').textContent=`${rows.length} post${rows.length===1?'':'s'}`;if(!rows.length){const empty=node('div','ga-empty');empty.append(node('strong','',state.filter==='unread'?'All caught up!':'No announcements here yet.'),node('span','',state.teacher?'Create a post to share a class update.':'Your teacher’s announcements will appear here.'));feed.append(empty);return;}for(const p of rows)feed.append(renderCard(p));if(!state.teacher){state.markObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const id=entry.target.dataset.gaPost;setTimeout(()=>{if(!state.user||!entry.target.isConnected||!state.markObserver)return;const r=entry.target.getBoundingClientRect();if(r.top<innerHeight*.8&&r.bottom>innerHeight*.25&&!state.seen[id])state.sdk.set(path(`seen/${state.user.uid}/${id}`),{atMs:Date.now(),publishedAtMs:Number(state.posts[id]?.publishedAtMs||0)}).catch(e=>console.warn('Mark read:',e.message));},900);state.markObserver.unobserve(entry.target);}}},{threshold:.55});for(const card of feed.querySelectorAll('[data-ga-post]'))state.markObserver.observe(card);}}
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
function renderCard(p){
 const card=node('article','ga-card');card.dataset.gaPost=p.id;
 const h=node('div','ga-post-head');h.append(node('span','ga-avatar','📣'));
 const author=node('div','ga-post-author');
 author.append(node('strong','',state.teacher?'ICT Teacher · Admin':'ICT Teacher'),node('small','',`${stamp(p.publishedAtMs||p.createdAtMs)}${p.pinned?' · 📌 Pinned':''}${state.teacher?' · '+p.status:''}`));
 h.append(author);
 if(!state.teacher){const n=node('span','ga-post-tag ga-post-new','New');n.dataset.gaPostNew=p.id;n.hidden=!!state.seen[p.id];h.append(n);}
 else h.append(node('span','ga-post-tag',p.audience.type==='all'?'All students':p.audience.type==='sections'?'Sections':'Selected students'));
 card.append(h,postBody(p));renderFiles(p,card);
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
  // Comment opens only the composer. Existing comments stay hidden until the
  // comment count is tapped or the new comment has been posted successfully.
  cbtn.addEventListener('click',()=>{
   state.commentOpen.add(p.id);
   drawComments(p.id,card,p);
   const ta=card.querySelector('.ga-reply-form textarea');
   if(ta){ta.scrollIntoView({block:'nearest',behavior:'smooth'});ta.focus({preventScroll:true});}
   else card.querySelector('.ga-comments')?.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  action.append(reactWrap,cbtn);footer.append(totals,action);card.append(footer);
  const comments=node('div','ga-comments');comments.id='ga-comments-'+p.id;comments.hidden=true;card.append(comments);
  function updateTotals(){
   const reactions=state.reactions[p.id]||{},comments=state.comments[p.id]||{};
   const count={};Object.values(reactions).forEach(emoji=>{if(['👍','❤️','🤗'].includes(emoji))count[emoji]=(count[emoji]||0)+1;});
   totals.replaceChildren();
   const emojis=node('span','ga-reaction-totals');
   for(const emoji of ['❤️','🤗','👍']){if(count[emoji])emojis.append(node('span','',emoji+' '+count[emoji]));}
   if(!emojis.children.length)emojis.append(node('span','ga-no-reactions','Be the first to react'));
   const commentCount=Object.keys(comments).length;
   const countButton=node('button','ga-reply-total',commentCount+' comment'+(commentCount===1?'':'s'));
   countButton.type='button';countButton.setAttribute('aria-controls',comments.id);
   countButton.setAttribute('aria-expanded',String(state.commentExpanded.has(p.id)));
   countButton.setAttribute('aria-label',commentCount+' comment'+(commentCount===1?'':'s')+', '+(state.commentExpanded.has(p.id)?'hide':'view')+' comments');
   countButton.addEventListener('click',()=>{
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
  updateTotals();drawComments(p.id,card,p);
  on(`reactions/${p.id}`,data=>{state.reactions[p.id]=data;updateTotals();},state.postUnsubs);
  on(`replies/${p.id}`,data=>{state.comments[p.id]=data;updateTotals();drawComments(p.id,card,p);},state.postUnsubs);
 }
 if(state.teacher){const menu=node('div','ga-teacher-menu');for(const [label,action] of [['Edit',()=>openComposer(p)],['Duplicate',()=>openComposer(p,true)],[p.status==='published'?'Archive':'Publish',()=>p.status==='published'?archivePost(p):publishExisting(p)],['Delete',()=>deletePost(p)]]){const b=node('button',label==='Delete'?'danger':'',label);b.type='button';b.addEventListener('click',action);menu.append(b);}card.append(menu);}
 return card;
}
let gaPreviewActive=0;const gaPreviewWaiting=[];function withPreviewTurn(fn){return new Promise((resolve,reject)=>{gaPreviewWaiting.push({fn,resolve,reject});pumpPreview();});}function pumpPreview(){while(gaPreviewActive<2&&gaPreviewWaiting.length){const task=gaPreviewWaiting.shift();gaPreviewActive++;Promise.resolve().then(task.fn).then(task.resolve,task.reject).finally(()=>{gaPreviewActive--;pumpPreview();});}}
function renderFiles(p,card){
 const files=p.attachments||[];if(!files.length)return;
 const host=node('div','ga-card-files');
 const images=files.filter(x=>x.type==='image');
 if(images.length){
  const preview=images.slice(0,5),n=preview.length;
  const gallery=node('div','ga-images ga-images--'+n);gallery.setAttribute('aria-label',`${images.length} announcement photo${images.length===1?'':'s'}`);
  preview.forEach((file,i)=>{
   const btn=node('button','ga-image');btn.type='button';btn.setAttribute('aria-label',`Open photo ${i+1} of ${images.length}`);
   const img=node('img');img.alt=txt(file.name||`Image ${i+1}`,120);img.loading='lazy';btn.append(img);
   if(i===4&&images.length>5)btn.append(node('span','ga-more-images','+'+(images.length-5)));
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
async function react(id,emoji){try{currentUser();const was=state.reactions[id]?.[state.user.uid]===emoji;const r=path(`reactions/${id}/${state.user.uid}`);if(was)await state.sdk.remove(r);else await state.sdk.set(r,emoji);}catch(e){toast('Could not save reaction: '+e.message,true);}}
function drawComments(id,card,p){
 const host=card.querySelector('.ga-comments');if(!host)return;
 const current=host.querySelector('.ga-reply-form textarea');
 const wasTyping=current===document.activeElement;
 const cursor=wasTyping?{start:current.selectionStart,end:current.selectionEnd}:null;
 if(current)state.commentDrafts[id]=current.value;
 host.replaceChildren();
 const expanded=state.commentExpanded.has(id);
 const composerOpen=state.commentOpen.has(id)||expanded;
 // No text box, names, or comment previews appear until the user chooses to
 // read or write comments. The count on the card remains visible and clickable.
 host.hidden=!composerOpen;
 if(!composerOpen)return;
 const data=state.comments[id]||{};
 const all=expanded?Object.entries(data)
  .sort(([keyA,a],[keyB,b])=>Number(b.createdAtMs||0)-Number(a.createdAtMs||0)||keyB.localeCompare(keyA))
  .slice(0,120):[];
 if(expanded){
  const hide=node('button','ga-more-comments ga-hide-comments','Hide comments');hide.type='button';
  hide.addEventListener('click',()=>{card.querySelector('.ga-reply-total')?.click();});
  host.append(hide);
  for(const [rid,c] of all){
   const row=node('div','ga-comment');const av=node('div','ga-comment-avatar',txt(c.name||'S',1).toUpperCase());
   const content=node('div','ga-comment-content'),bubble=node('div','ga-comment-bubble');
   bubble.append(node('strong','',txt(c.name||'Student',80)));
   if(c.replyTo&&data[c.replyTo])bubble.append(node('span','ga-comment-inreply','↳ '+txt(data[c.replyTo].name||'Reply',50)));
   bubble.append(node('p','',txt(c.text,1200)));content.append(bubble);
   const tools=node('div','ga-comment-tools');tools.append(node('small','',stamp(c.createdAtMs)));
   if(p.allowReplies||state.teacher){
    const reply=node('button','','Reply');reply.type='button';
    reply.addEventListener('click',()=>{state.replyTargets[id]={id:rid,name:c.name};state.commentOpen.add(id);drawComments(id,card,p);host.querySelector('textarea')?.focus({preventScroll:true});});tools.append(reply);
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
 const send=node('button','','➤');send.type='submit';send.setAttribute('aria-label','Post comment');entry.append(ta,send);composer.append(entry);form.append(av,composer);
 form.addEventListener('submit',async e=>{
  e.preventDefault();const value=txt(ta.value,1200);if(!value)return;send.disabled=true;
  try{
   const key=state.sdk.push(path(`replies/${id}`)).key;
   const comment={uid:state.user.uid,name:txt(state.teacher?'ICT Teacher':state.profile?.name||'Student',80),text:value,createdAtMs:Date.now()};
   if(state.replyTargets[id]?.id)comment.replyTo=state.replyTargets[id].id;
   await state.sdk.set(path(`replies/${id}/${key}`),comment);
   // Show the newly saved comment immediately, even if the realtime callback
   // arrives after the write acknowledgement. Never prepend on a failed save.
   if(!state.comments[id])state.comments[id]={};
   state.comments[id][key]=comment;
   state.commentDrafts[id]='';ta.value='';state.replyTargets[id]=null;
   state.commentOpen.add(id);state.commentExpanded.add(id);
   drawComments(id,card,p);
   const countButton=card.querySelector('.ga-reply-total');
   if(countButton)countButton.setAttribute('aria-expanded','true');
  }catch(err){toast('Comment not saved: '+err.message,true);}finally{send.disabled=false;}
 });host.append(form);
 if(wasTyping){ta.focus({preventScroll:true});if(cursor)try{ta.setSelectionRange(cursor.start,cursor.end);}catch(_){}}
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
document.querySelectorAll('[data-ga-filter]').forEach(b=>b.addEventListener('click',()=>applyFilter(b.dataset.gaFilter)));$('gaSearch').addEventListener('input',e=>{state.search=e.target.value.toLowerCase().trim();render();});$('gaRefresh').addEventListener('click',()=>render());$('gaNew').addEventListener('click',()=>openComposer());
// Composer supports multiple attachment types in the SAME published post.
function openComposer(p=null,duplicate=false){if(!state.teacher)return;state.editingId=p&&!duplicate?p.id:'';state.editingBase=p&&!duplicate?p:null;state.files=p?JSON.parse(JSON.stringify(p.attachments||[])).map(f=>(duplicate && ['image','pdf'].includes(f.type))?{...f,sourcePostId:f.sourcePostId||p.id}:f):[];state.selectedSections=new Set(p?.audience?.sections||[]);state.selectedStudents=new Set(p?.audience?.students||[]);$('gaComposeTitle').textContent=p?(duplicate?'Duplicate announcement':'Edit announcement'):'Create announcement';$('gaPostTitle').value=p?.title||'';$('gaRichText').innerHTML=p?.bodyHtml||'';$('gaBackground').value=p?.background||'plain';$('gaCustomBackground').value=p?.bgColor||'#e8f0ff';$('gaCustomBackgroundWrap').hidden=$('gaBackground').value!=='custom';$('gaFont').value=p?.font||'Arial';document.querySelector(`input[name="gaAudience"][value="${p?.audience?.type||'all'}"]`).checked=true;$('gaAllowReplies').checked=p?.allowReplies!==false;$('gaPinned').checked=!!p?.pinned;$('gaComposerModal').hidden=false;document.body.style.overflow='hidden';$('gaComposeStatus').textContent='Compose your announcement. Attachments are saved before publishing.';renderAudience();renderAttachments();drawPreview();$('gaPostTitle').focus();}
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
function postFromEditor(id,status){const old=state.editingBase;const title=txt($('gaPostTitle').value,140);const bodyHtml=sanitizeHtml($('gaRichText').innerHTML);if(!title&&!plainHtml(bodyHtml)&&!state.files.length)throw Error('Write a title, message, or include an attachment.');return {id,title:title||'Class announcement',bodyHtml,background:$('gaBackground').value,bgColor:$('gaCustomBackground').value,font:$('gaFont').value,status,allowReplies:$('gaAllowReplies').checked,pinned:$('gaPinned').checked,audience:selectedAudience(),attachments:state.files.map(f=>({...f})),createdAtMs:old?.createdAtMs||Date.now(),updatedAtMs:Date.now(),publishedAtMs:status==='published'?(old?.publishedAtMs||Date.now()):0};}
function feedCopy(p){return {id:p.id,title:p.title,bodyHtml:p.bodyHtml,background:p.background,bgColor:p.bgColor,font:p.font,status:p.status,allowReplies:p.allowReplies,pinned:p.pinned,attachments:p.attachments||[],createdAtMs:p.createdAtMs,publishedAtMs:p.publishedAtMs,updatedAtMs:p.updatedAtMs};}
async function persistPost(p){if(p.status==='published'&&(!state.directoryLoaded||!state.summaryLoaded))throw Error('Student information is still loading. Please try again shortly.');const old=state.posts[p.id]||{};const oldList=Object.keys(old.recipients||{});const newList=p.status==='published'?recipientAccountUids(p.audience):[];p.recipients=Object.fromEntries(newList.map(uid=>[uid,true]));if(p.status==='published'&&!newList.length)throw Error('No students found for this audience. Check your student list and try again.');if(newList.length>2500)throw Error('Unusually large audience. Review the selected students before publishing.');const updates={[`posts/${p.id}`]:p};const oldSet=new Set(oldList),newSet=new Set(newList);for(const uid of oldSet)if(!newSet.has(uid))updates[`feeds/${uid}/${p.id}`]=null;for(const uid of newSet)updates[`feeds/${uid}/${p.id}`]=feedCopy(p);await state.sdk.update(state.sdk.ref(state.db,BASE),updates);}
async function saveCurrent(status){if(state.composerBusy||state.transferBusy)return;state.composerBusy=true;const buttons=[$('gaSaveDraft'),$('gaPublish')];buttons.forEach(b=>b.disabled=true);alertStatus(status==='published'?'Publishing to selected students…':'Saving draft…');try{const id=state.editingId||state.sdk.push(path('posts')).key;const p=postFromEditor(id,status);await persistPost(p);toast(status==='published'?`Published to ${determineRecipients(p.audience).length} students.`:'Draft saved successfully.');state.composerBusy=false;closeComposer();}catch(e){alertStatus('Save failed: '+e.message,true);toast(e.message,true);}finally{state.composerBusy=false;buttons.forEach(b=>b.disabled=false);}}
$('gaSaveDraft').addEventListener('click',()=>saveCurrent('draft'));$('gaPublish').addEventListener('click',()=>saveCurrent('published'));
async function archivePost(p){if(!confirm('Archive this post and remove it from student feeds?'))return;try{const updated={...state.posts[p.id],status:'archived',updatedAtMs:Date.now()};await persistPost(updated);toast('Announcement archived.');}catch(e){toast(e.message,true);}}
async function publishExisting(p){try{const updated={...state.posts[p.id],status:'published',publishedAtMs:Date.now(),updatedAtMs:Date.now()};await persistPost(updated);toast('Announcement published.');}catch(e){toast(e.message,true);}}
async function deletePost(p){if(!confirm(`Permanently delete “${p.title}” for everyone? Attached Drive files will remain in private Drive until cleaned up.`))return;try{const old=state.posts[p.id];const recipients=Object.keys(old.recipients||{}).map(uid=>({uid}));const updates={[`posts/${p.id}`]:null,[`reactions/${p.id}`]:null,[`replies/${p.id}`]:null};for(const r of recipients)updates[`feeds/${r.uid}/${p.id}`]=null;await state.sdk.update(state.sdk.ref(state.db,BASE),updates);toast('Post deleted.');}catch(e){toast('Delete failed: '+e.message,true);}}
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
 try{const url=await withPreviewTurn(()=>{if(!img.isConnected)return '';return getFileData(p,f,'thumb');});
  if(img.isConnected&&attachmentAccessible(p,f)){img.loading='eager';img.decoding='async';img.src=url;}
 }catch(e){if(img.isConnected){img.alt='Image unavailable: '+e.message;img.style.objectFit='contain';}}
}
function closeViewer(){
 state.viewerRequest++;state.viewerGallery=[];state.viewerPost=null;state.viewerIndex=0;state.viewerFile=null;
 if(state.viewerUrl){URL.revokeObjectURL(state.viewerUrl);state.viewerUrl='';}
 $('gaViewerBody').replaceChildren();$('gaViewerModal').hidden=true;
}
$('gaViewerClose').addEventListener('click',closeViewer);
document.querySelectorAll('[data-ga-close="viewer"]').forEach(el=>el.addEventListener('click',closeViewer));
async function displayGalleryImage(direction=0){
 const files=state.viewerGallery,p=state.viewerPost;
 if(!files.length||!p)return;
 const current=state.viewerIndex,file=files[current],request=++state.viewerRequest;
 $('gaViewerTitle').textContent=txt(file.name||`Photo ${current+1}`,140);
 $('gaViewerError').textContent='Loading photo…';$('gaViewerDownload').disabled=true;
 const body=$('gaViewerBody');body.replaceChildren();
 const stage=node('div','ga-photo-stage');stage.setAttribute('aria-label',`Photo ${current+1} of ${files.length}`);
 const image=node('img','ga-photo-full');image.alt=txt(file.name||`Photo ${current+1}`,140);
 if(direction)image.dataset.direction=direction>0?'next':'previous';
 const counter=node('span','ga-photo-counter',`${current+1} / ${files.length}`);
 stage.append(image,counter);
 if(files.length>1){
  const prev=node('button','ga-photo-arrow ga-photo-prev','‹'),next=node('button','ga-photo-arrow ga-photo-next','›');
  prev.type=next.type='button';prev.title='Previous photo';next.title='Next photo';
  prev.setAttribute('aria-label','Previous photo');next.setAttribute('aria-label','Next photo');
  prev.addEventListener('click',()=>changeGallery(-1));next.addEventListener('click',()=>changeGallery(1));
  stage.append(prev,next);
 }
 body.append(stage);
 try{
  const url=await getFileData(p,file);
  if(request!==state.viewerRequest||$('gaViewerModal').hidden)return;
  image.src=url;state.viewerFile={url,name:file.name};$('gaViewerDownload').disabled=false;
  $('gaViewerError').textContent='';
  // Warm one neighboring photo for faster Next/Swipe, without downloading the full gallery.
  if(files.length>1){const next=files[(current+1)%files.length];if(next?.driveFileId)withPreviewTurn(()=>getFileData(p,next)).catch(()=>{});}
 }catch(e){if(request===state.viewerRequest)$('gaViewerError').textContent='Photo unavailable: '+e.message;}
}
function changeGallery(delta){
 if($('gaViewerModal').hidden||state.viewerGallery.length<2)return;
 state.viewerIndex=(state.viewerIndex+delta+state.viewerGallery.length)%state.viewerGallery.length;
 displayGalleryImage(delta);
}
async function openFile(p,f){
 $('gaViewerModal').hidden=false;state.viewerRequest++;
 $('gaViewerTitle').textContent=f.name;$('gaViewerError').textContent='Loading private Drive attachment…';
 $('gaViewerBody').replaceChildren();$('gaViewerDownload').disabled=true;state.viewerFile=null;
 if(f.type==='image'){
  state.viewerPost=p;state.viewerGallery=(p.attachments||[]).filter(x=>x.type==='image');
  state.viewerIndex=Math.max(0,state.viewerGallery.findIndex(x=>x.driveFileId===f.driveFileId));
  await displayGalleryImage();return;
 }
 state.viewerGallery=[];state.viewerPost=null;
 const request=++state.viewerRequest;
 try{
  const url=await getFileData(p,f);
  if(request!==state.viewerRequest||$('gaViewerModal').hidden)return;
  const frame=node('iframe');frame.src=url;frame.title=f.name;$('gaViewerBody').append(frame);
  $('gaViewerError').textContent='';$('gaViewerDownload').disabled=false;state.viewerFile={url,name:f.name};
 }catch(e){if(request===state.viewerRequest)$('gaViewerError').textContent='File unavailable: '+e.message;}
}
// Swipe only on horizontal gestures so vertical movement stays natural on phones.
let gaTouchStart=null;
$('gaViewerBody').addEventListener('touchstart',e=>{if(!state.viewerGallery.length||e.touches.length!==1)return;gaTouchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
$('gaViewerBody').addEventListener('touchend',e=>{
 if(!gaTouchStart||!state.viewerGallery.length||e.changedTouches.length!==1)return;
 const dx=e.changedTouches[0].clientX-gaTouchStart.x,dy=e.changedTouches[0].clientY-gaTouchStart.y;gaTouchStart=null;
 if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.35)changeGallery(dx<0?1:-1);
},{passive:true});
$('gaViewerBody').addEventListener('touchcancel',()=>{gaTouchStart=null;},{passive:true});
$('gaViewerDownload').addEventListener('click',()=>{if(!state.viewerFile)return;const a=node('a');a.href=state.viewerFile.url;a.download=state.viewerFile.name;a.click();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('gaViewerModal').hidden)closeViewer();else if(!$('gaResourcePicker').hidden)closeResourcePicker();else if(!$('gaComposerModal').hidden)closeComposer();}else if(!$('gaViewerModal').hidden&&state.viewerGallery.length>1){if(e.key==='ArrowRight')changeGallery(1);else if(e.key==='ArrowLeft')changeGallery(-1);}});
void boot();
})();
