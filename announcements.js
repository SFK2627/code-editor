/* G8Code Announcements V1. RTDB-only posts, feeds, reactions, replies and reads.
 * Private Workspace Drive transfer uses the existing Apps Script deployment.
 * No Firestore import, read, or write occurs in this file. */
(()=>{'use strict';
const $=id=>document.getElementById(id), BASE='g8AnnouncementsV1', MAX_IMAGES=10, MAX_PDFS=10, MAX_IMAGE_INPUT=30*1024*1024, MAX_PDF=3*1024*1024;
const SRC=new URLSearchParams(location.search).get('from');
const teacherShortcut=SRC==='login'; // Matches the verified Teacher Messages Admin Code entry.
const teachers=new Set((window.MCS_TEACHER_EMAILS||[]).map(x=>String(x).toLowerCase()));
const state={sdk:null,auth:null,db:null,user:null,teacher:false,profile:null,posts:{},seen:{},directory:{},reactions:{},comments:{},unsubs:[],postUnsubs:[],filter:'all',search:'',editingId:'',editingBase:null,files:[],selectedSections:new Set(),selectedStudents:new Set(),composerBusy:false,transferBusy:false,imageUrls:new Map(),viewerUrl:'',viewerFile:null,blobOwner:'',markObserver:null,displayedIds:[],commentOpen:new Set(),replyTargets:{},catalog:{},pickerType:'lesson',backGuardInstalled:false};
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x;}
function stamp(ms){return ms?new Intl.DateTimeFormat('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(ms)):'';}
function txt(v,n=200){return String(v??'').trim().slice(0,n);}
function isTeacher(u){return teachers.has(String(u?.email||'').toLowerCase());}
function alertStatus(message,bad=false){$('gaComposeStatus').textContent=message;$('gaComposeStatus').classList.toggle('error',bad);}
let toastTimer;function toast(message,bad=false){const t=$('gaToast');t.textContent=message;t.classList.toggle('error',bad);t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,5500);}
function gate(title,message,login=true){$('gaGateTitle').textContent=title;$('gaGateText').textContent=message;$('gaGate').hidden=false;$('gaWorkspace').hidden=true;$('gaLogin').hidden=!login;}
function setLive(label){$('gaConnection').textContent=label;}
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
function cleanup(){while(state.unsubs.length){try{state.unsubs.pop()();}catch{}}while(state.postUnsubs.length){try{state.postUnsubs.pop()();}catch{}}state.markObserver?.disconnect();state.markObserver=null;for(const u of state.imageUrls.values())URL.revokeObjectURL(u);state.imageUrls.clear();closeViewer();}
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
function accountReset(account){cleanup();state.user=account;state.teacher=isTeacher(account);state.posts={};state.seen={};state.directory={};state.catalog={};state.reactions={};state.comments={};state.displayedIds=[];state.restoredPosition=false;$('gaFeed').replaceChildren();state.blobOwner=account?.uid||'';}
async function boot(){try{if(!window.MCS_FIREBASE_CONFIG||!window.MCS_FIREBASE_DATABASE_URL)throw Error('Missing G8Code Firebase configuration.');await sdk();state.sdk.onAuthStateChanged(state.auth,async account=>{accountReset(account);if(!account){setLive('Sign in required');if(teacherShortcut)gate('Teacher Announcements · Admin Code','Enter your existing teacher account password (Admin Code) to open the announcement creator.',true);else gate('Sign in to Announcements','Use your existing G8Code account to continue.',true);return;}if(teacherShortcut&&!state.teacher){setLive('Teacher sign-in required');gate('Teacher Announcements · Admin Code','A student session is active. Enter your teacher Admin Code to switch securely to the authorized admin account.',true);return;}state.profile={uid:account.uid,name:account.displayName||'Student',section:'Unassigned',studentId:''};if(!state.teacher){try{const row=(await state.sdk.get(state.sdk.ref(state.db,'g8MessagesV1/directory/'+account.uid))).val()||{};if(row.accountStatus==='disabled')throw Error('This student account is disabled.');state.profile={...state.profile,name:row.name||account.displayName||'Student',section:row.section||'Unassigned',studentId:row.studentId||''};}catch(err){if(/disabled/.test(err.message)){gate('Account disabled',err.message,false);return;}console.info('Profile not yet synced:',err.message);}}
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
$('gaLogin').addEventListener('submit',async e=>{e.preventDefault();const button=$('gaLoginButton');button.disabled=true;$('gaLoginError').hidden=true;try{const teacher=teacherShortcut||$('gaLoginRole').value==='teacher';let id=teacherShortcut?[...teachers][0]||'':txt($('gaLoginIdentity').value,110);if(!id)throw Error(teacherShortcut?'Authorized teacher account is not configured.':'Enter your existing G8Code account identity.');if(!teacher)id='sid-'+id.toLowerCase().replace(/[^a-z0-9]/g,'')+'@students.mcsian.app';const c=await state.sdk.signInWithEmailAndPassword(state.auth,id,$('gaLoginPassword').value);if(teacher&&!isTeacher(c.user))throw Error('Only the authorized teacher can access the Admin announcement creator.');$('gaLoginPassword').value='';}catch(err){$('gaLoginError').textContent=err.message||'Sign-in failed';$('gaLoginError').hidden=false;}finally{button.disabled=false;}});
function loadStudent(){on(`feeds/${state.user.uid}`,data=>{state.posts=data;render();restoreAnnouncementPosition();});on(`seen/${state.user.uid}`,data=>{state.seen=data;renderBadges();if(state.filter==='unread')render();else renderReadFlags();});}
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
function loadTeacher(){on('posts',data=>{state.posts=data;render();}); // No Firestore use.
 // Existing Messages directory is an RTDB mirror; select only synchronized active accounts.
 state.unsubs.push(state.sdk.onValue(state.sdk.ref(state.db,'g8MessagesV1/directory'),s=>{state.directory=s.val()||{};renderAudience();},err=>{toast('Student directory unavailable in RTDB: '+err.message,true);$('gaAudienceCount').textContent='Cannot publish until the RTDB directory is available.';}));}
// A person can have a historic and a current Firebase UID. Count them ONCE by
// verified Student ID (the same identity grouping used by G8Code Messages V5.9).
// Without a valid Student ID, use the UID: names alone are never safe identity keys.
function normalizedStudentId(raw){
 const id=txt(raw,50).toUpperCase().replace(/[^A-Z0-9]/g,'');
 return id.length>=5&&id.length<=50&&!/^(?:0+|UNKNOWN|NONE|NA|STUDENT|TEMP|TEST)$/.test(id)?id:'';
}
function normalizedSection(raw){
 return txt(raw,100).replace(/[–—]/g,'-').replace(/\s+/g,' ').trim()
  .replace(/^Grade\s*8\s*(?:[-:|•]\s*)?/i,'')
  .replace(/^G(?:rade)?\s*8\s*(?:[-:|•]\s*)?/i,'')
  .replace(/^8\s*(?:[-:|•]\s*)?/i,'')
  .replace(/\bSt\.?\s*Faustina\s+(?:of\s+)?Kowalska\b/gi,'St. Faustina Kowalska')
  .replace(/\bSt\.?\s*Camillus\s+(?:(?:de|of)\s+)?Lel(?:l)?is\b/gi,'St. Camillus de Lellis');
}
function activePeople(){
 const grouped=new Map();
 for(const [uid,raw] of Object.entries(state.directory||{})){
  if(!/^[A-Za-z0-9_-]{5,128}$/.test(uid)||!raw||typeof raw!=='object'||
      String(raw.accountStatus||'active').toLowerCase()==='disabled')continue;
  const section=normalizedSection(raw.section);
  if(!section||/^unassigned$/i.test(section))continue;
  const studentId=txt(raw.studentId,50),normalized=normalizedStudentId(studentId);
  const identityKey=normalized?'sid:'+normalized:'uid:'+uid;
  if(!grouped.has(identityKey))grouped.set(identityKey,[]);
  grouped.get(identityKey).push({uid,name:txt(raw.name||'Student',100),section,studentId,
   preferred:raw.announcementsPrimary===true});
 }
 return [...grouped.entries()].map(([identityKey,rows])=>{
  // The preferred flag is only a hint, never an invitation to merge names.
  const priority=rows.slice().sort((a,b)=>Number(b.preferred)-Number(a.preferred)||
   Number(b.name!=='Student')-Number(a.name!=='Student')||a.uid.localeCompare(b.uid));
  const lead=priority[0];
  return {...lead,identityKey,uids:[...new Set(rows.map(row=>row.uid))]};
 }).sort((a,b)=>a.section.localeCompare(b.section)||a.name.localeCompare(b.name));
}
function determineRecipients(audience){
 const people=activePeople();if(audience.type==='all')return people;
 const selected=new Set((audience.sections||[]).map(normalizedSection));
 const ids=new Set(audience.students||[]);
 return people.filter(p=>audience.type==='sections'?selected.has(p.section):
  p.uids.some(uid=>ids.has(uid))||ids.has(p.uid)||ids.has(p.identityKey));
}
// Deliver a SINGLE post per signed-in UID; all linked legacy accounts remain
// eligible until the official roster retires them. Count unique PEOPLE above.
function recipientAccountUids(audience){return [...new Set(determineRecipients(audience).flatMap(p=>p.uids))];}
function normalizePost(raw,id){return {id,title:txt(raw.title||'Untitled announcement',140),bodyHtml:sanitizeHtml(raw.bodyHtml||''),background:['plain','blue','lavender','yellow','mint','rose','navy','gradient','custom'].includes(raw.background)?raw.background:'plain',font:['Arial','Georgia','Verdana','Trebuchet MS','Times New Roman','Courier New'].includes(raw.font)?raw.font:'Arial',bgColor:/^#[0-9a-f]{6}$/i.test(raw.bgColor||'')?raw.bgColor:'#e8f0ff',status:raw.status||'draft',pinned:!!raw.pinned,allowReplies:raw.allowReplies!==false,attachments:(Array.isArray(raw.attachments)?raw.attachments:Object.values(raw.attachments||{})).slice(0,40),createdAtMs:Number(raw.createdAtMs||0),publishedAtMs:Number(raw.publishedAtMs||0),updatedAtMs:Number(raw.updatedAtMs||0),audience:raw.audience||{type:'all'}};}
function published(p){return p.status==='published';}
function allIds(){const rows=Object.entries(state.posts).map(([id,p])=>normalizePost(p,id));const filter=state.filter;return rows.filter(p=>state.teacher?filter==='drafts'?p.status==='draft':filter==='archived'?p.status==='archived':filter==='all'?p.status!=='archived':published(p):published(p)).filter(p=>filter!=='unread'||state.teacher||!state.seen[p.id]).filter(p=>filter!=='pinned'||p.pinned).filter(p=>!state.search||[p.title,plainHtml(p.bodyHtml)].join(' ').toLowerCase().includes(state.search)).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(b.publishedAtMs||b.createdAtMs)-Number(a.publishedAtMs||a.createdAtMs)).slice(0,80);}
function renderBadges(){if(state.teacher){$('gaAllCount').textContent=Object.values(state.posts).filter(p=>p.status==='published').length;return;}const posts=Object.entries(state.posts).filter(([,p])=>published(p));const newCount=posts.filter(([id])=>!state.seen[id]).length;$('gaAllCount').textContent=posts.length;$('gaUnreadCount').textContent=newCount;document.title=newCount?`(${newCount}) Announcements · G8Code`:'Announcements · G8Code';}
function renderReadFlags(){document.querySelectorAll('[data-ga-post-new]').forEach(el=>{el.hidden=!!state.seen[el.dataset.gaPostNew];});}
function render(){renderBadges();while(state.postUnsubs.length){try{state.postUnsubs.pop()();}catch{}}state.markObserver?.disconnect();const feed=$('gaFeed');feed.replaceChildren();const rows=allIds();state.displayedIds=rows.map(r=>r.id);$('gaFeedStatus').textContent=`${rows.length} post${rows.length===1?'':'s'}`;if(!rows.length){const empty=node('div','ga-empty');empty.append(node('strong','',state.filter==='unread'?'All caught up!':'No announcements here yet.'),node('span','',state.teacher?'Create a post to share a class update.':'Your teacher’s announcements will appear here.'));feed.append(empty);return;}for(const p of rows)feed.append(renderCard(p));if(!state.teacher){state.markObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const id=entry.target.dataset.gaPost;setTimeout(()=>{if(!state.user||!entry.target.isConnected||!state.markObserver)return;const r=entry.target.getBoundingClientRect();if(r.top<innerHeight*.8&&r.bottom>innerHeight*.25&&!state.seen[id])state.sdk.set(path(`seen/${state.user.uid}/${id}`),{atMs:Date.now(),publishedAtMs:Number(state.posts[id]?.publishedAtMs||0)}).catch(e=>console.warn('Mark read:',e.message));},900);state.markObserver.unobserve(entry.target);}}},{threshold:.55});for(const card of feed.querySelectorAll('[data-ga-post]'))state.markObserver.observe(card);}}
function postBody(p){const b=node('section','ga-post-body');b.dataset.bg=p.background;b.style.fontFamily=p.font+',sans-serif';if(p.background==='custom'){const hex=/^#[0-9a-f]{6}$/i.test(p.bgColor||'')?p.bgColor:'#e8f0ff';b.style.backgroundColor=hex;const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));b.style.color=(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2])<145?'#fff':'#172b4d';}b.append(node('h2','',p.title));const rich=node('div','ga-post-rich');rich.innerHTML=sanitizeHtml(p.bodyHtml||'');b.append(rich);return b;}
function renderCard(p){const card=node('article','ga-card');card.dataset.gaPost=p.id;const h=node('div','ga-post-head');h.append(node('span','ga-avatar','📣'));const author=node('div','ga-post-author');author.append(node('strong','',state.teacher?'ICT Teacher · Admin':'ICT Teacher'),node('small','',`${stamp(p.publishedAtMs||p.createdAtMs)}${p.pinned?' · 📌 Pinned':''}${state.teacher?' · '+p.status:''}`));h.append(author);if(!state.teacher){const n=node('span','ga-post-tag ga-post-new','New');n.dataset.gaPostNew=p.id;n.hidden=!!state.seen[p.id];h.append(n);}else{h.append(node('span','ga-post-tag',p.audience.type==='all'?'All students':p.audience.type==='sections'?'Sections':'Selected students'));}card.append(h,postBody(p));renderFiles(p,card);
 if(published(p)){const footer=node('div','ga-post-footer');const totals=node('div','ga-post-totals','Loading reactions and replies…');const action=node('div','ga-post-actions');for(const [emoji,label] of [['👍','Like'],['❤️','Heart'],['🤗','Care']]){const b=node('button','',emoji+' '+label);b.type='button';b.dataset.gaReaction=emoji;b.addEventListener('click',()=>react(p.id,emoji));action.append(b);}const cbtn=node('button','','↩ Replies');cbtn.type='button';cbtn.addEventListener('click',()=>{state.commentOpen.has(p.id)?state.commentOpen.delete(p.id):state.commentOpen.add(p.id);drawComments(p.id,card,p);});action.append(cbtn);footer.append(totals,action);card.append(footer);const comm=node('div','ga-comments');comm.hidden=true;card.append(comm);const rpath=`reactions/${p.id}`,cpath=`replies/${p.id}`;on(rpath,data=>{state.reactions[p.id]=data;const counts={};Object.values(data).forEach(x=>{counts[x]=(counts[x]||0)+1;});totals.textContent=`${Object.values(counts).reduce((a,b)=>a+b,0)} reactions · ${Object.keys(state.comments[p.id]||{}).length} replies`;for(const b of action.querySelectorAll('[data-ga-reaction]'))b.classList.toggle('active',data[state.user.uid]===b.dataset.gaReaction);},state.postUnsubs);on(cpath,data=>{state.comments[p.id]=data;totals.textContent=`${Object.keys(data).length} replies · ${Object.keys(state.reactions[p.id]||{}).length} reactions`;drawComments(p.id,card,p);},state.postUnsubs);if(state.commentOpen.has(p.id))drawComments(p.id,card,p);}
 if(state.teacher){const menu=node('div','ga-teacher-menu');for(const [label,action] of [['Edit',()=>openComposer(p)],['Duplicate',()=>openComposer(p,true)],[p.status==='published'?'Archive':'Publish',()=>p.status==='published'?archivePost(p):publishExisting(p)],['Delete',()=>deletePost(p)]]){const b=node('button',label==='Delete'?'danger':'',label);b.type='button';b.addEventListener('click',action);menu.append(b);}card.append(menu);}return card;}
let gaPreviewActive=0;const gaPreviewWaiting=[];function withPreviewTurn(fn){return new Promise((resolve,reject)=>{gaPreviewWaiting.push({fn,resolve,reject});pumpPreview();});}function pumpPreview(){while(gaPreviewActive<2&&gaPreviewWaiting.length){const task=gaPreviewWaiting.shift();gaPreviewActive++;Promise.resolve().then(task.fn).then(task.resolve,task.reject).finally(()=>{gaPreviewActive--;pumpPreview();});}}
function renderFiles(p,card){const files=p.attachments||[];if(!files.length)return;const host=node('div','ga-card-files');const images=files.filter(x=>x.type==='image');if(images.length){const gallery=node('div','ga-images');images.forEach((file,i)=>{const btn=node('button','ga-image');btn.type='button';btn.setAttribute('aria-label','View image '+(i+1));const img=node('img');img.alt=txt(file.name||`Image ${i+1}`,120);img.loading='lazy';btn.append(img);btn.addEventListener('click',()=>openFile(p,file));gallery.append(btn);const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();loadImage(p,file,img);}}, {rootMargin:'500px'});observer.observe(btn);});host.append(gallery);}
 files.filter(x=>x.type!=='image').forEach(file=>{if(file.type==='youtube'){const v=node('iframe','ga-video');v.src='https://www.youtube-nocookie.com/embed/'+file.videoId;v.loading='lazy';v.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';v.referrerPolicy='strict-origin-when-cross-origin';v.title=txt(file.name||'YouTube video');host.append(v);return;}let b;if(file.type==='link'){b=node('a','ga-link-card');b.href=cleanLink(file.url)||'#';b.target='_blank';b.rel='noopener noreferrer';}else{b=node('button','ga-link-card');b.type='button';b.addEventListener('click',()=>{if(file.type==='pdf')openFile(p,file);else if(file.type==='lesson'||file.type==='activity')openCourseItem(file,p.id);});}b.append(node('span','',file.type==='pdf'?'📄':file.type==='lesson'?'📘':file.type==='activity'?'📝':'🔗'),node('b','',txt(file.name||file.title||'Attachment',150)),node('small','',file.type==='pdf'?'Preview / Download':file.type==='lesson'?'Open exact lesson':file.type==='activity'?'Open exact activity':'Open ↗'));host.append(b);});card.append(host);}
async function react(id,emoji){try{currentUser();const was=state.reactions[id]?.[state.user.uid]===emoji;const r=path(`reactions/${id}/${state.user.uid}`);if(was)await state.sdk.remove(r);else await state.sdk.set(r,emoji);}catch(e){toast('Could not save reaction: '+e.message,true);}}
function drawComments(id,card,p){const host=card.querySelector('.ga-comments');if(!host)return;host.hidden=!state.commentOpen.has(id);if(host.hidden)return;host.replaceChildren();const data=state.comments[id]||{},items=Object.entries(data).sort(([,a],[,b])=>Number(a.createdAtMs)-Number(b.createdAtMs)).slice(-120);for(const [rid,c] of items){const row=node('div','ga-comment');const av=node('div','ga-comment-avatar',txt(c.name||'S',1).toUpperCase());const body=node('div','ga-comment-bubble');body.append(node('strong','',txt(c.name||'Student',80)));if(c.replyTo)body.append(node('small','',' · Reply'));body.append(node('p','',txt(c.text,1200)),node('small','',stamp(c.createdAtMs)));const tools=node('div','ga-comment-tools');const reply=node('button','','↩ Reply');reply.type='button';reply.addEventListener('click',()=>{state.replyTargets[id]={id:rid,name:c.name};const ta=host.querySelector('textarea');if(ta){ta.placeholder=`Replying to ${txt(c.name,60)}…`;ta.focus();}});tools.append(reply);if(state.teacher||c.uid===state.user.uid){const del=node('button','','Remove');del.addEventListener('click',async()=>{if(!confirm('Remove this reply?'))return;try{await state.sdk.remove(path(`replies/${id}/${rid}`));}catch(e){toast(e.message,true);}});tools.append(del);}body.append(tools);row.append(av,body);host.append(row);}if(!p.allowReplies&&!state.teacher){host.append(node('p','ga-smallprint','Replies are turned off for this post.'));return;}const form=node('form','ga-reply-form');const ta=node('textarea');ta.maxLength=1200;ta.rows=1;ta.placeholder='Write a reply…';const send=node('button','','Send');send.type='submit';form.append(ta,send);form.addEventListener('submit',async e=>{e.preventDefault();const value=txt(ta.value,1200);if(!value)return;send.disabled=true;try{const key=state.sdk.push(path(`replies/${id}`)).key;const c={uid:state.user.uid,name:txt(state.teacher?'ICT Teacher':state.profile.name,80),text:value,createdAtMs:Date.now()};if(state.replyTargets[id]?.id)c.replyTo=state.replyTargets[id].id;await state.sdk.set(path(`replies/${id}/${key}`),c);ta.value='';state.replyTargets[id]=null;}catch(err){toast('Reply not saved: '+err.message,true);}finally{send.disabled=false;}});host.append(form);}
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
function openComposer(p=null,duplicate=false){if(!state.teacher)return;state.editingId=p&&!duplicate?p.id:'';state.editingBase=p&&!duplicate?p:null;state.files=p?JSON.parse(JSON.stringify(p.attachments||[])).map(f=>(duplicate && ['image','pdf'].includes(f.type))?{...f,sourcePostId:f.sourcePostId||p.id}:f):[];state.selectedSections=new Set(p?.audience?.sections||[]);state.selectedStudents=new Set(p?.audience?.students||[]);$('gaComposeTitle').textContent=p?(duplicate?'Duplicate announcement':'Edit announcement'):'Create announcement';$('gaPostTitle').value=p?.title||'';$('gaRichText').innerHTML=p?.bodyHtml||'';$('gaBackground').value=p?.background||'plain';$('gaCustomBackground').value=p?.bgColor||'#e8f0ff';$('gaCustomBackgroundWrap').hidden=$('gaBackground').value!=='custom';$('gaFont').value=p?.font||'Arial';document.querySelector(`input[name="gaAudience"][value="${p?.audience?.type||'all'}"]`).checked=true;$('gaAllowReplies').checked=p?.allowReplies!==false;$('gaPinned').checked=!!p?.pinned;$('gaComposerModal').hidden=false;document.body.style.overflow='hidden';$('gaComposeStatus').textContent='Compose your announcement. Attachments upload to private Drive before publishing.';renderAudience();renderAttachments();drawPreview();$('gaPostTitle').focus();}
function closeComposer(){if(state.transferBusy||state.composerBusy){toast('An upload or save is still in progress. Wait for its verified result.',true);return;}$('gaComposerModal').hidden=true;document.body.style.overflow='';}
$('gaComposeClose').addEventListener('click',closeComposer);document.querySelectorAll('[data-ga-close="composer"]').forEach(el=>el.addEventListener('click',closeComposer));
function selectedAudience(){const type=document.querySelector('input[name="gaAudience"]:checked')?.value||'all';return {type,sections:type==='sections'?[...state.selectedSections]:[],students:type==='students'?[...state.selectedStudents]:[]};}
function renderAudience(){const audience=selectedAudience(),people=activePeople(),picker=$('gaAudiencePicker'),container=$('gaAudienceList');picker.hidden=audience.type==='all';container.replaceChildren();if(audience.type!=='all'){const q=txt($('gaAudienceSearch').value,100).toLowerCase();const items=audience.type==='sections'?[...new Set(people.map(p=>p.section))].sort().map(section=>({id:section,label:section,detail:`${people.filter(p=>p.section===section).length} students`})):
 people.slice().sort((a,b)=>a.section.localeCompare(b.section)||a.name.localeCompare(b.name)).map(p=>({id:p.uid,label:p.name,detail:p.section+' · '+p.studentId}));for(const item of items.filter(x=>(x.label+' '+x.detail).toLowerCase().includes(q)).slice(0,500)){const label=node('label','ga-audience-item');const input=node('input');input.type='checkbox';const set=audience.type==='sections'?state.selectedSections:state.selectedStudents;input.checked=set.has(item.id)||(audience.type==='students'&&people.some(p=>p.uid===item.id&&p.uids.some(uid=>set.has(uid))));input.addEventListener('change',()=>{
 if(audience.type==='students'){
  // Old posts may store a historic UID. Clear ALL linked UIDs on deselect,
  // otherwise the check appears off while that student still receives posts.
  const student=people.find(p=>p.uid===item.id);
  for(const uid of student?.uids||[item.id])set.delete(uid);
  if(input.checked)set.add(item.id);
 }else{input.checked?set.add(item.id):set.delete(item.id);}
 renderAudienceCount();
});label.append(input,node('span','',item.label+' · '+item.detail));container.append(label);}}
 renderAudienceCount();}
function renderAudienceCount(){const a=selectedAudience(),n=determineRecipients(a).length;$('gaAudienceCount').textContent=`${n} unique student${n===1?'':'s'} selected. Legacy/current account links count as one person.`;}
document.querySelectorAll('input[name="gaAudience"]').forEach(el=>el.addEventListener('change',renderAudience));$('gaAudienceSearch').addEventListener('input',renderAudience);
function drawPreview(){const x=$('gaComposePreview');x.replaceChildren(node('strong','','LIVE POST PREVIEW'));const p={title:$('gaPostTitle').value||'Announcement title',bodyHtml:sanitizeHtml($('gaRichText').innerHTML),background:$('gaBackground').value,bgColor:$('gaCustomBackground').value,font:$('gaFont').value};x.append(postBody(p));}
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
  blank.append(node('span','',all.length?'Try a different title or term.':'Open the existing '+(type==='lesson'?'Lesson Library':'Activities Given')+' in Admin once to synchronize its saved list. This uses the existing Admin data, not new Firestore reads from Announcements.'));
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
function renderAttachments(){const host=$('gaAttachmentList');host.replaceChildren();state.files.forEach((f,i)=>{const row=node('div','ga-attachment-item');row.append(node('span','',f.type==='image'?'🖼':f.type==='pdf'?'📄':f.type==='lesson'?'📘':f.type==='activity'?'📝':f.type==='youtube'?'▶':'🔗'),node('strong','',f.name),node('small','',f.type.toUpperCase()));for(const [mark,delta] of [['↑',-1],['↓',1]]){const b=node('button','',mark);b.type='button';b.title='Reorder';b.disabled=i+delta<0||i+delta>=state.files.length;b.addEventListener('click',()=>{const tmp=state.files[i];state.files[i]=state.files[i+delta];state.files[i+delta]=tmp;renderAttachments();});row.append(b);}const x=node('button','','×');x.type='button';x.title='Remove attachment';x.addEventListener('click',()=>{state.files.splice(i,1);renderAttachments();});row.append(x);host.append(row);});}
function postFromEditor(id,status){const old=state.editingBase;const title=txt($('gaPostTitle').value,140);const bodyHtml=sanitizeHtml($('gaRichText').innerHTML);if(!title&&!plainHtml(bodyHtml)&&!state.files.length)throw Error('Write a title, message, or include an attachment.');return {id,title:title||'Class announcement',bodyHtml,background:$('gaBackground').value,bgColor:$('gaCustomBackground').value,font:$('gaFont').value,status,allowReplies:$('gaAllowReplies').checked,pinned:$('gaPinned').checked,audience:selectedAudience(),attachments:state.files.map(f=>({...f})),createdAtMs:old?.createdAtMs||Date.now(),updatedAtMs:Date.now(),publishedAtMs:status==='published'?(old?.publishedAtMs||Date.now()):0};}
function feedCopy(p){return {id:p.id,title:p.title,bodyHtml:p.bodyHtml,background:p.background,bgColor:p.bgColor,font:p.font,status:p.status,allowReplies:p.allowReplies,pinned:p.pinned,attachments:p.attachments||[],createdAtMs:p.createdAtMs,publishedAtMs:p.publishedAtMs,updatedAtMs:p.updatedAtMs};}
async function persistPost(p){const old=state.posts[p.id]||{};const oldList=Object.keys(old.recipients||{});const newList=p.status==='published'?recipientAccountUids(p.audience):[];p.recipients=Object.fromEntries(newList.map(uid=>[uid,true]));if(p.status==='published'&&!newList.length)throw Error('No recipients found. Open the RTDB Messages directory and confirm your students and their sections are synchronized.');if(newList.length>2500)throw Error('Unusually large audience. Review your RTDB roster before publishing.');const updates={[`posts/${p.id}`]:p};const oldSet=new Set(oldList),newSet=new Set(newList);for(const uid of oldSet)if(!newSet.has(uid))updates[`feeds/${uid}/${p.id}`]=null;for(const uid of newSet)updates[`feeds/${uid}/${p.id}`]=feedCopy(p);await state.sdk.update(state.sdk.ref(state.db,BASE),updates);}
async function saveCurrent(status){if(state.composerBusy||state.transferBusy)return;state.composerBusy=true;const buttons=[$('gaSaveDraft'),$('gaPublish')];buttons.forEach(b=>b.disabled=true);alertStatus(status==='published'?'Publishing to selected students…':'Saving draft…');try{const id=state.editingId||state.sdk.push(path('posts')).key;const p=postFromEditor(id,status);await persistPost(p);toast(status==='published'?`Published to ${determineRecipients(p.audience).length} students.`:'Draft saved successfully.');state.composerBusy=false;closeComposer();}catch(e){alertStatus('Save failed: '+e.message,true);toast(e.message,true);}finally{state.composerBusy=false;buttons.forEach(b=>b.disabled=false);}}
$('gaSaveDraft').addEventListener('click',()=>saveCurrent('draft'));$('gaPublish').addEventListener('click',()=>saveCurrent('published'));
async function archivePost(p){if(!confirm('Archive this post and remove it from student feeds?'))return;try{const updated={...state.posts[p.id],status:'archived',updatedAtMs:Date.now()};await persistPost(updated);toast('Announcement archived.');}catch(e){toast(e.message,true);}}
async function publishExisting(p){try{const updated={...state.posts[p.id],status:'published',publishedAtMs:Date.now(),updatedAtMs:Date.now()};await persistPost(updated);toast('Announcement published.');}catch(e){toast(e.message,true);}}
async function deletePost(p){if(!confirm(`Permanently delete “${p.title}” for everyone? Attached Drive files will remain in private Drive until cleaned up.`))return;try{const old=state.posts[p.id];const recipients=Object.keys(old.recipients||{}).map(uid=>({uid}));const updates={[`posts/${p.id}`]:null,[`reactions/${p.id}`]:null,[`replies/${p.id}`]:null};for(const r of recipients)updates[`feeds/${r.uid}/${p.id}`]=null;await state.sdk.update(state.sdk.ref(state.db,BASE),updates);toast('Post deleted.');}catch(e){toast('Delete failed: '+e.message,true);}}
// Workspace Drive: receipt-based request (no CORS response is ever treated as success).
function driveEndpoint(){return String(window.MCS_G8_MESSAGES_DRIVE_URL||window.MCS_APPS_SCRIPT_URL||'').trim();}
async function driveRequest(action,data={},maxWait=70000){currentUser();if(location.protocol!=='https:')throw Error('Private Drive transfers require your deployed HTTPS G8Code site.');const endpoint=driveEndpoint();if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec(?:\?.*)?$/.test(endpoint))throw Error('Apps Script /exec URL is missing.');const token=await state.user.getIdToken();const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');const inbox=path(`transfers/${state.user.uid}/${nonce}`);return new Promise((resolve,reject)=>{let done=false,off=()=>{};let timer;const finish=(err,receipt)=>{if(done)return;done=true;clearTimeout(timer);off();if(receipt)state.sdk.remove(inbox).catch(()=>{});if(err)reject(err);else resolve(receipt?.data||{});};timer=setTimeout(()=>finish(Error(`Workspace Drive gave no verified receipt for ${action}. Check the updated Apps Script deployment, RTDB rules, and Drive files before retrying.`)),maxWait);off=state.sdk.onValue(inbox,s=>{if(!s.exists())return;const r=s.val();if(r.action!==action)return;finish(r.ok?null:Error(r.error||'Drive request denied'),r);},e=>finish(Error('Cannot read Drive confirmation: '+e.message)));const body=new URLSearchParams({g8aBridge:'1',nonce,action,idToken:token,origin:location.origin,...Object.fromEntries(Object.entries(data).map(([k,v])=>[k,String(v??'')]))});fetch(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body,cache:'no-store'}).catch(e=>console.warn('No-CORS POST error (receipt still authoritative):',e));});}
function base64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=()=>reject(Error('Cannot read selected file.'));r.readAsDataURL(file);});}
async function optimize(file){if(file.size<=2.5*1024*1024)return file;const bmp=await createImageBitmap(file);try{let size=Math.min(Math.max(bmp.width,bmp.height),3300);for(let pass=0;pass<9;pass++){const w=Math.max(1,Math.round(bmp.width*size/Math.max(bmp.width,bmp.height))),h=Math.max(1,Math.round(bmp.height*size/Math.max(bmp.width,bmp.height)));const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(bmp,0,0,w,h);for(const quality of [.9,.8,.7]){const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',quality));if(blob&&blob.size<=2.6*1024*1024)return new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});}size=Math.floor(size*.78);}throw Error('Image could not be optimized to a safe Drive transfer size.');}finally{bmp.close?.();}}
async function ensureUploadDraft(){if(state.editingId)return state.editingId;const id=state.sdk.push(path('posts')).key;const p={id,title:txt($('gaPostTitle').value,140)||'Untitled announcement',bodyHtml:sanitizeHtml($('gaRichText').innerHTML),background:$('gaBackground').value,bgColor:$('gaCustomBackground').value,font:$('gaFont').value,status:'draft',allowReplies:true,pinned:false,audience:selectedAudience(),attachments:[],recipients:{},createdAtMs:Date.now(),updatedAtMs:Date.now(),publishedAtMs:0};await state.sdk.set(path(`posts/${id}`),p);state.editingId=id;state.editingBase=p;alertStatus('Private draft created for attachment upload.');return id;}
async function uploadBatch(files,type){if(!state.teacher)return;const count=state.files.filter(x=>x.type===type).length;if(count+files.length>(type==='image'?MAX_IMAGES:MAX_PDFS)){toast(`Maximum ${type==='image'?MAX_IMAGES:MAX_PDFS} ${type} files per announcement.`,true);return;}state.transferBusy=true;[$('gaPublish'),$('gaSaveDraft')].forEach(b=>b.disabled=true);try{const id=await ensureUploadDraft();for(let i=0;i<files.length;i++){let file=files[i];if(type==='image'){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>MAX_IMAGE_INPUT)throw Error('Images must be JPG/PNG/WEBP and up to 30 MB selected size.');file=await optimize(file);}else{if(file.size>MAX_PDF||!(file.type==='application/pdf'||/\.pdf$/i.test(file.name)))throw Error('PDF must be at most 3 MB for the secure Workspace Drive bridge.');}
 alertStatus(`Uploading ${i+1}/${files.length} ${type} to Workspace Drive…`);const raw=await base64(file);const result=await driveRequest('upload',{postId:id,fileName:file.name,contentType:file.type||'application/pdf',fileData:raw},90000);if(!/^[\w-]{15,150}$/.test(result.driveFileId||''))throw Error('Drive did not return a verified file ID.');state.files.push({type,name:file.name,driveFileId:result.driveFileId,size:file.size,contentType:file.type});renderAttachments();const draft=postFromEditor(id,'draft');await state.sdk.set(path(`posts/${id}`),draft);state.editingBase=draft;alertStatus(`✓ Uploaded ${i+1}/${files.length} to private Drive. Draft saved.`);}}
 catch(e){alertStatus('Upload failed: '+e.message,true);toast(e.message,true);}finally{state.transferBusy=false;[$('gaPublish'),$('gaSaveDraft')].forEach(b=>b.disabled=false);$('gaImageFiles').value='';$('gaPdfFiles').value='';}}
$('gaImageFiles').addEventListener('change',e=>uploadBatch([...e.target.files].slice(0,MAX_IMAGES),'image'));$('gaPdfFiles').addEventListener('change',e=>uploadBatch([...e.target.files].slice(0,MAX_PDFS),'pdf'));
async function getFileData(p,f){if(state.imageUrls.has(f.driveFileId))return state.imageUrls.get(f.driveFileId);const res=await driveRequest('read',{postId:p.id,driveFileId:f.driveFileId},70000);if(!res.data||!res.contentType)throw Error('Drive did not return the file.');const bytes=Uint8Array.from(atob(res.data),c=>c.charCodeAt(0));const blob=new Blob([bytes],{type:res.contentType});const url=URL.createObjectURL(blob);state.imageUrls.set(f.driveFileId,url);return url;}
async function loadImage(p,f,img){try{const url=await withPreviewTurn(()=>getFileData(p,f));if(img.isConnected)img.src=url;}catch(e){img.alt='Image unavailable: '+e.message;img.style.objectFit='contain';}}
function closeViewer(){state.viewerFile=null;if(state.viewerUrl){URL.revokeObjectURL(state.viewerUrl);state.viewerUrl='';}$('gaViewerBody').replaceChildren();$('gaViewerModal').hidden=true;}
$('gaViewerClose').addEventListener('click',closeViewer);document.querySelectorAll('[data-ga-close="viewer"]').forEach(el=>el.addEventListener('click',closeViewer));
async function openFile(p,f){$('gaViewerModal').hidden=false;$('gaViewerTitle').textContent=f.name;$('gaViewerError').textContent='Loading private Drive attachment…';$('gaViewerBody').replaceChildren();$('gaViewerDownload').disabled=true;try{const cached=await getFileData(p,f);const url=cached;if(f.type==='image'){const img=node('img');img.alt=f.name;img.src=url;$('gaViewerBody').append(img);}else{const frame=node('iframe');frame.src=url;frame.title=f.name;$('gaViewerBody').append(frame);}$('gaViewerError').textContent='';$('gaViewerDownload').disabled=false;state.viewerFile={url,name:f.name};}catch(e){$('gaViewerError').textContent='File unavailable: '+e.message;}}
$('gaViewerDownload').addEventListener('click',()=>{if(!state.viewerFile)return;const a=node('a');a.href=state.viewerFile.url;a.download=state.viewerFile.name;a.click();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('gaViewerModal').hidden)closeViewer();else if(!$('gaResourcePicker').hidden)closeResourcePicker();else if(!$('gaComposerModal').hidden)closeComposer();}});
void boot();
})();
