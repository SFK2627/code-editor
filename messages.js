/* G8Code Messages V1: authenticated, student↔teacher only. No grade/submission writes. */
// Classic script entry: works when index.html / admin-v2.html / messages.html
// are opened directly from disk. Do NOT use <script type="module"> for local pages.
// Fetch only the Firebase modules from HTTPS, like the existing G8Code login.
let initializeApp, getApps, getApp, getAuth, onAuthStateChanged, signInWithEmailAndPassword;
let getDatabase, ref, onValue, query, limitToLast, orderByKey, endAt, get, push, set, update, runTransaction, serverTimestamp;
let getFirestore, collection, doc, getDoc, getDocFromServer, getDocs;

async function loadMessagesFirebaseSDK(){
 const v = window.MCS_FIREBASE_SDK_VERSION || '10.12.5';
 const base = `https://www.gstatic.com/firebasejs/${v}`;
 const load = Promise.all([
  import(`${base}/firebase-app.js`),
  import(`${base}/firebase-auth.js`),
  import(`${base}/firebase-database.js`),
  import(`${base}/firebase-firestore.js`)
 ]);
 const timeout = new Promise((_,reject)=>setTimeout(()=>reject(new Error('Firebase libraries did not load. Check internet access or use the deployed G8Code website.')),15000));
 const [a, au, d, f] = await Promise.race([load, timeout]);
 ({initializeApp, getApps, getApp} = a);
 ({getAuth, onAuthStateChanged, signInWithEmailAndPassword} = au);
 ({getDatabase, ref, onValue, query, limitToLast, orderByKey, endAt, get, push, set, update, runTransaction, serverTimestamp} = d);
 ({getFirestore, collection, doc, getDoc, getDocFromServer, getDocs} = f);

}


// Storage may be blocked for file:// pages or privacy-restricted browsers.
const safeGet = key => { try { return window.localStorage.getItem(key); } catch (_) { return null; } };
const safeSet = (key,value) => { try { window.localStorage.setItem(key,value); } catch (_) {} };
const $ = id => document.getElementById(id);
const root = $('g8mApp'), workspace = $('g8mWorkspace'), gate = $('g8mGate');
const BASE = 'g8MessagesV1';
const MAX_FILES = 3, MAX_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const teacherEmails = (window.MCS_TEACHER_EMAILS || []).map(x => String(x).toLowerCase());
let app, auth, rtdb, firestore, user, teacher = false, profile = null;
let sections = [], students = new Map(), summaries = {}, openedUid = '', currentSection = '*';
let filter = 'all', search = '', mobileView = 'sections', activeMessages = [], activeAcks = {}, seenAt = 0;
let activeUnsubs = [], rootUnsubs = [], sending = false, selections = [], reply = null, renderVersion = 0;
let olderMessages=[], hasOlder=false, olderLoading=false;
let imageCache = new Map(), photoQueue = new Map(), lastSnapshotKey = '';
// In-memory only: keep recent chats fast on conversation switching, without writing private text to browser storage.
const conversationMemory = new Map();
let selectedProject = null, savedProjects = [], projectViewerFiles = null, projectModalReturnFocus = null;
let smartBackInstalled = false;
const byId = x => String(x || '').trim();
// Never allow a malformed/legacy RTDB timestamp to clear the entire chat.
const safeStamp = value => { const n=Number(value); return Number.isFinite(n) && n>0 && n<8640000000000000 ? n : Date.now(); };
const dateOf = x => new Date(safeStamp(x));
const formatTime = x => x ? new Intl.DateTimeFormat('en-PH',{hour:'numeric',minute:'2-digit'}).format(dateOf(x)) : '';
const dayLabel = x => new Intl.DateTimeFormat('en-PH',{month:'short',day:'numeric',year:'numeric'}).format(dateOf(x));
const short = (v,n=60) => String(v || '').slice(0,n);
const isTeacher = account => teacherEmails.includes(String(account?.email || '').toLowerCase());
function status(message, error=false){ const el=$('g8mSendStatus'); el.textContent=message; el.classList.toggle('error',error); }
function showGate(title,detail,login=false){gate.hidden=false;workspace.hidden=true;gate.querySelector('h1').textContent=title;$('g8mGateText').textContent=detail;$('g8mQuickLogin').hidden=!login;}
function setConnection(ok,detail){const el=$('g8mConnection'); el.textContent=detail || (ok?'Live':'Offline'); el.classList.toggle('online',Boolean(ok));}
function notice(text){const el=document.createElement('div');el.className='g8m-empty';el.textContent=text;return el;}
function textEl(tag,className,text){const x=document.createElement(tag);if(className)x.className=className;x.textContent=text??'';return x;}
function clearUnsubs(list){while(list.length){try{list.pop()();}catch(_){}}}
const recentMessageQuery = uid => query(ref(rtdb,`${studentPath(uid)}/messages`),orderByKey(),limitToLast(100));
// Push IDs can be out of chronological order when different devices have different clocks.
// Use the server-resolved creation time as the primary conversation order.
function messageTime(message){
 const raw=message?.createdAtMs;
 const numeric=typeof raw==='number'?raw:Number(raw);
 if(Number.isFinite(numeric)&&numeric>0&&numeric<8640000000000000)return numeric;
 if(typeof raw==='string'){const parsed=Date.parse(raw);if(Number.isFinite(parsed))return parsed;}
 return 0;
}
function compareMessages(a,b){
 const ta=messageTime(a),tb=messageTime(b);
 if(ta!==tb)return ta-tb;
 return String(a.id||'').localeCompare(String(b.id||''));
}
function normalizeMessageSnapshot(snapshot){
 const list=[];
 snapshot.forEach(child=>{
  const v=child.val();
  if(!v || typeof v!=='object')return;
  list.push({...v,id:String(child.key)});
 });
 return list.sort(compareMessages);
}
// An actual on-screen visibility check, not just querySelector existence.
function messageNode(id){
 const log=$('g8mMessages');
 return [...log.querySelectorAll('.g8m-message[data-message-id]')]
  .find(el=>el.dataset.messageId===String(id));
}
function messageIsVisible(id){
 const log=$('g8mMessages'),element=messageNode(id);
 if(!element||!log||log.clientHeight<1)return false;
 const bounds=element.getBoundingClientRect(),area=log.getBoundingClientRect();
 const css=getComputedStyle(element);
 return css.display!=='none'&&css.visibility!=='hidden'&&bounds.height>0
   &&bounds.bottom<=area.bottom+2&&bounds.top>=area.top-2;
}
function moveToMessage(id){
 const log=$('g8mMessages'),element=messageNode(id);
 if(!element||!log||!log.clientHeight)return false;
 const area=log.getBoundingClientRect(),rect=element.getBoundingClientRect();
 if(rect.bottom>area.bottom-2)log.scrollTop+=rect.bottom-area.bottom+8;
 if(rect.top<area.top+2)log.scrollTop+=rect.top-area.top-8;
 return messageIsVisible(id);
}
let pinnedMessageId='',pinExpires=0;
function pinMessage(id){
 pinnedMessageId=String(id);pinExpires=Date.now()+2500;
 moveToMessage(pinnedMessageId);
 // Other subscribers can rerender after Seen/summary updates; keep the sent
 // bubble in view through those rerenders, even on short, mobile chat panels.
 setTimeout(()=>{if(Date.now()<pinExpires)moveToMessage(pinnedMessageId);},50);
 setTimeout(()=>{if(Date.now()<pinExpires)moveToMessage(pinnedMessageId);},280);
 setTimeout(()=>{if(Date.now()<pinExpires)moveToMessage(pinnedMessageId);},800);
}

function updateChatFeedState(message,failed=false){
 const el=$('g8mFeedState');if(!el)return;
 el.textContent=message;el.classList.toggle('error',failed);
}
function displayMessagesFromSnapshot(snapshot,uid){
 if(uid!==openedUid)return;
 const incoming=normalizeMessageSnapshot(snapshot);
 // The live query is authoritative. A confirmed local send is merged below so
 // a slow/stale initial listener does not temporarily erase the just-sent bubble.
 const localPending=activeMessages.filter(m=>m.__confirmedLocal && !incoming.some(n=>n.id===m.id));
 activeMessages=[...incoming,...localPending].sort(compareMessages);
 const older=conversationMemory.get(uid)?.older||olderMessages;
 conversationMemory.set(uid,{messages:activeMessages.slice(-120),older:older.slice(-80),acks:{...activeAcks},seenAt,hasOlder});
 if(conversationMemory.size>10)conversationMemory.delete(conversationMemory.keys().next().value);
 hasOlder=hasOlder||incoming.length>=100;
 renderMessages();
 updateChatFeedState(`${activeMessages.length+olderMessages.length} messages loaded · Live chat`);
}
async function refreshConversation(manual=false){
 const uid=openedUid;if(!uid)return;
 if(manual)updateChatFeedState('Refreshing conversation…');
 try{
  const snapshot=await get(recentMessageQuery(uid));
  if(uid!==openedUid)return;
  displayMessagesFromSnapshot(snapshot,uid);
  if(manual)status('Conversation refreshed ✓');
 }catch(error){
  if(uid!==openedUid)return;
  updateChatFeedState('Could not retrieve chat · Tap ↻ to retry',true);
  status(`Messages could not load: ${friendlyError(error)}`,true);
 }
}
$('g8mRefresh').addEventListener('click',()=>refreshConversation(true));

function applyTheme(name){root.dataset.theme=name;safeSet('g8code-message-theme',name);$('g8mTheme').textContent=name==='dark'?'☾':'☼';}
function inheritedTheme(){
 const saved=safeGet('g8code-message-theme');
 const teacherRoute=new URLSearchParams(location.search).get('from')==='admin';
 if(teacherRoute){const a=safeGet('g8code.adminWorkspaceAppearance.v1');if(a==='dark'||a==='light')return a;}
 let settings={};try{settings=JSON.parse(safeGet('studentCodeStudio.loginReminderSettings.v1')||'{}')||{};}catch(_){}
 if(!teacherRoute && settings.applyThemeToEntireApp && !settings.allowStudentAppAppearanceChoice){
  if(['dark','light'].includes(settings.appAppearance))return settings.appAppearance;
 }
 const pref=safeGet('studentCodeStudio.themedStudentAppearance.v1')||safeGet('studentCodeStudio.theme');
 if(pref){try{const x=JSON.parse(pref);if(x==='dark'||x==='light')return x;}catch(_){} }
 return saved || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
}
function syncDesignTheme(){
 let settings={};try{settings=JSON.parse(safeGet('studentCodeStudio.loginReminderSettings.v1')||'{}')||{};}catch(_){}
 root.dataset.designTheme=settings.applyThemeToEntireApp?String(settings.theme||'classic'):'classic';
}
applyTheme(inheritedTheme());syncDesignTheme();
function syncThemeForRole(){
 let settings={};try{settings=JSON.parse(safeGet('studentCodeStudio.loginReminderSettings.v1')||'{}')||{};}catch(_){}
 const locked=!teacher && settings.applyThemeToEntireApp && settings.allowStudentAppAppearanceChoice===false;
 $('g8mTheme').hidden=locked;
 if(locked){applyTheme(settings.appAppearance==='dark'?'dark':settings.appAppearance==='light'?'light':(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));}
 else if(teacher){const a=safeGet('g8code.adminWorkspaceAppearance.v1');if(a==='dark'||a==='light')applyTheme(a);}
}
$('g8mTheme').addEventListener('click',()=>{if(!$('g8mTheme').hidden)applyTheme(root.dataset.theme==='dark'?'light':'dark');});
$('g8mImageClose').addEventListener('click',()=>$('g8mImageViewer').hidden=true);
$('g8mImageViewer').addEventListener('click',e=>{if(e.target===$('g8mImageViewer'))$('g8mImageViewer').hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('g8mImageViewer').hidden)$('g8mImageViewer').hidden=true;});
const studentPath = uid => `${BASE}/chats/${uid}`;
const summaryPath = uid => `${BASE}/summary/${uid}`;
function role(){return teacher?'teacher':'student';}
function roleDestination(){return teacher?'admin-v2.html?g8mBack=overview':'index.html?g8mBack=student';}
function leaveMessages(){
  if(sending){status('Finish sending before leaving Messages.',true);return;}
  window.location.replace(roleDestination());
}
function installSmartBackNavigation(){
  if(smartBackInstalled)return;
  smartBackInstalled=true;
  // Intercept the first browser Back. Do not read the previous (possibly login) URL.
  if(window.history?.pushState){
    try{
      window.history.pushState({g8MessagesRoleBack:true},'',window.location.href);
      window.addEventListener('popstate',()=>leaveMessages());
    }catch(error){console.info('Browser navigation guard unavailable; in-page Back remains available.',error);}
  }
}
$('g8mBack').addEventListener('click',event=>{
  if(!user)return; // Keep ordinary login fallback when nobody is signed in.
  event.preventDefault();leaveMessages();
});

function unread(s){return Math.max(0,Number(s?.[teacher?'unreadTeacher':'unreadStudent']||0));}
function needsChecking(uid){const s = summaries[uid];return Number(s?.needsChecking||0);}
function person(uid){return students.get(uid) || {uid,name:summaries[uid]?.name||'Student',studentId:summaries[uid]?.studentId||'',section:summaries[uid]?.section||'Unassigned'};}
function studentSection(s){return String(s?.section || 'Unassigned').trim()||'Unassigned';}
function iconLetter(s){return String(s?.name || s?.studentName || 'S').trim().charAt(0).toUpperCase();}
async function boot(){
 try{
  if(!window.MCS_FIREBASE_CONFIG || !window.MCS_FIREBASE_DATABASE_URL)throw new Error('Firebase configuration or Realtime Database URL is missing.');
  setConnection(false,'Connecting…');
  await loadMessagesFirebaseSDK();
  app=getApps().length?getApp():initializeApp(window.MCS_FIREBASE_CONFIG);
  auth=getAuth(app);rtdb=getDatabase(app,window.MCS_FIREBASE_DATABASE_URL);firestore=getFirestore(app);
  onAuthStateChanged(auth,async account=>{
   clearUnsubs(rootUnsubs);clearUnsubs(activeUnsubs);conversationMemory.clear();user=account;openedUid='';students.clear();summaries={};
   if(!account){showGate('Sign in to Messages',location.protocol==='file:'?'Local HTML files may not share Firebase login. Sign in here using your existing G8Code account, or use the deployed website.':'Your G8Code account is not signed in on this page. Use the same student or teacher credentials to continue.',true);setConnection(false,'Sign in required');return;}
   $('g8mQuickLogin').hidden=true;
   teacher=isTeacher(account);
   try{
    if(teacher){ profile={uid:account.uid,name:'ICT Teacher'};}
    else{
     const snap=await getDoc(doc(firestore,window.MCS_FIREBASE_COLLECTION||'webCodeEditor',window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1','students',account.uid));
     if(!snap.exists())throw new Error('Your student profile is not active yet. Log in through Student Home first.');
     profile={...snap.data(),uid:account.uid};
     if(profile.authUid && profile.authUid!==account.uid)throw new Error('Account does not match the registered student profile.');
     if(profile.accountStatus==='disabled')throw new Error('This student account is disabled.');
    }
    await initWorkspace();
   }catch(error){console.error('Messages sign-in:',error);showGate('Messages unavailable',friendlyError(error));setConnection(false,'Not available');}
  },error=>{console.error('Messages auth state:',error);showGate('Authentication unavailable',friendlyError(error));setConnection(false,'Authentication error');});
 }catch(error){console.error('G8Code Messages startup:',error);showGate('Messages unavailable',friendlyError(error));setConnection(false,'Connection error');}
}
// Secure local-file fallback. Re-authenticate with Firebase; never trust local
// storage or a student ID alone to grant access to a message thread.
function syncQuickLoginRole(){
 const teacherLogin=$('g8mLoginRole').value==='teacher';
 $('g8mLoginIdentityLabel').textContent=teacherLogin?'Teacher email':'Student ID';
 $('g8mLoginIdentity').placeholder=teacherLogin?'Teacher email':'Enter Student ID';
 $('g8mLoginIdentity').type=teacherLogin?'email':'text';
 $('g8mLoginError').hidden=true;
}
$('g8mLoginRole').value=new URLSearchParams(location.search).get('from')==='admin'?'teacher':'student';
$('g8mLoginRole').addEventListener('change',syncQuickLoginRole);
syncQuickLoginRole();
$('g8mQuickLogin').addEventListener('submit',async event=>{
 event.preventDefault();
 if(!auth||!firestore||!signInWithEmailAndPassword)return;
 const teacherLogin=$('g8mLoginRole').value==='teacher';
 const identity=String($('g8mLoginIdentity').value||'').trim();
 const password=$('g8mLoginPassword').value;
 const feedback=$('g8mLoginError'), button=$('g8mLoginSubmit');
 feedback.hidden=true;
 if(!identity||!password)return;
 button.disabled=true;button.textContent='Signing in…';
 try{
  let email=identity.toLowerCase();
  if(!teacherLogin){
   const key=identity.toUpperCase().replace(/[^A-Z0-9]/g,'').toLowerCase();
   if(!key || key.length>50)throw new Error('Please enter a valid Student ID.');
   email=`sid-${key}@students.mcsian.app`;
   try{
    const snap=await getDoc(doc(firestore,window.MCS_FIREBASE_COLLECTION||'webCodeEditor',window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1','studentLoginRoutes',key));
    if(snap.exists()){
     const route=snap.data()||{};
     if(route.accountStatus==='disabled')throw new Error('This student account is disabled. Contact your teacher.');
     if(typeof route.authEmail==='string' && route.authEmail.includes('@'))email=route.authEmail.trim().toLowerCase();
    }
   }catch(error){
    if(/disabled/i.test(String(error.message)))throw error;
    console.info('Login route unavailable, using Student ID email.',error);
   }
  }
  await signInWithEmailAndPassword(auth,email,password);
  $('g8mLoginPassword').value='';
 }catch(error){
  console.warn('G8Code Messages sign-in failed:',error);
  const code=String(error.code||'');
  feedback.textContent=code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found')?
   'Student ID/email or password is incorrect. Please use your existing G8Code credentials.':friendlyError(error);
  feedback.hidden=false;
 }finally{button.disabled=false;button.textContent='Sign in to Messages';}
});
function friendlyError(error){let e=String(error?.message||error||'Could not connect.');
 if(/permission.denied|permission_denied|permission denied/i.test(e))return 'Firebase permissions do not allow Messages yet. Deploy the supplied Realtime Database rules and check your account.';
 if(/drive|workspace|photo|attachment/i.test(e) && /configure|unavailable|not set/i.test(e))return 'Google Workspace Drive is not configured yet. Set up the private Drive Apps Script bridge before sending photos.';
 if(/network|offline|fetch/i.test(e))return 'Connection failed. Check your internet connection, then reopen Messages.';
 return e;
}
async function initWorkspace(){
 gate.hidden=true;workspace.hidden=false;workspace.classList.toggle('student',!teacher);root.dataset.mode=role();syncThemeForRole();
 $('g8mBack').href=teacher?'admin-v2.html?g8mBack=overview':'index.html?g8mBack=student';
 installSmartBackNavigation();
 $('g8mHeaderNote').textContent=teacher?'Teacher inbox · Private per student':'Official ICT teacher conversation';
 $('g8mComposer').querySelector('textarea').placeholder=teacher?'Write your reply…':'Message your teacher…';
 $('g8mChooseProject').hidden=teacher;
 $('g8mSectionsPane').hidden=!teacher;$('g8mStudentsPane').hidden=!teacher;
 if(teacher){
  $('g8mCurrentSection').textContent='All conversations';
  $('g8mChatName').textContent='Choose a student';
  $('g8mChatMeta').textContent='Private teacher–student messaging';
  $('g8mComposer').hidden=true;
  const requestedUid=new URLSearchParams(location.search).get('student');
  const summaryRef=ref(rtdb,`${BASE}/summary`);
  // Summary stream paints the inbox immediately; the slow roster is independent.
  rootUnsubs.push(onValue(summaryRef,snap=>{
   summaries=snap.val()||{};renderSections();renderStudents();setConnection(true,'Live');
   if(requestedUid&&!openedUid&&(summaries[requestedUid]||students.has(requestedUid)))openChat(requestedUid);
  },err=>{setConnection(false,'Inbox error');status(friendlyError(err),true);}));
  switchMobile('sections');
  void loadStudentDirectory().then(()=>{
   if(requestedUid&&!openedUid&&(students.has(requestedUid)||summaries[requestedUid]))openChat(requestedUid);
  }).catch(error=>console.warn('Directory lookup is delayed:',error));
 }else{
  const uid=user.uid;
  $('g8mChatName').textContent='ICT Teacher';$('g8mChatMeta').textContent='Official private conversation';$('g8mChatAvatar').textContent='T';
  openedUid=uid;
  rootUnsubs.push(onValue(ref(rtdb,summaryPath(uid)),snap=>{summaries[uid]=snap.val()||{};setConnection(true,'Live');},err=>{status(friendlyError(err),true);setConnection(false,'Connection issue');}));
  openChat(uid);
 }
}
async function loadStudentDirectory(){
 const prefix=[window.MCS_FIREBASE_COLLECTION||'webCodeEditor',window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1'];
 let errorMsg='';
 const lookups=['students','studentRoster'];
 const results=await Promise.allSettled(lookups.map(col=>getDocs(collection(firestore,...prefix,col))));
 for(let i=0;i<lookups.length;i++){
  const col=lookups[i],result=results[i];
  if(result.status!=='fulfilled'){errorMsg=friendlyError(result.reason);console.warn('Could not load',col,result.reason);continue;}
  result.value.docs.forEach(item=>{
   const data=item.data()||{};const uid=byId(data.uid || data.authUid || (col==='students'?item.id:''));
   if(!uid||uid.includes('/'))return;
   const existing=students.get(uid)||{};
   students.set(uid,{uid,name:short(data.name||existing.name||'Student',100),studentId:short(data.studentId||existing.studentId||'',50),section:short(data.section||existing.section||'Unassigned',100)});
  });
 }
 if(!students.size && errorMsg)status(`Student list unavailable: ${errorMsg}. Existing conversations may still load.`,true);
 renderSections();renderStudents();
}
function allPeople(){
 const merged=new Map(students);
 Object.keys(summaries).forEach(uid=>{if(!merged.has(uid)){merged.set(uid,person(uid));}});
 return [...merged.values()];
}
function matchesFilter(p){const s=summaries[p.uid]||{};
 if(filter==='unread' && unread(s)===0)return false;
 if(filter==='checking' && needsChecking(p.uid)===0)return false;
 if(search && ![p.name,p.studentId,p.section,s.lastText].join(' ').toLowerCase().includes(search))return false;
 return true;
}
function renderSections(){if(!teacher)return;
 const rootList=$('g8mSectionList');rootList.replaceChildren();const people=allPeople().filter(matchesFilter);
 const counts=new Map();
 for(const p of people){const name=studentSection(p);const obj=counts.get(name)||{name,people:0,unread:0,checking:0};obj.people++;obj.unread+=unread(summaries[p.uid]);obj.checking+=needsChecking(p.uid);counts.set(name,obj);}
 const rows=[{name:'*',label:'All Sections',people:people.length,unread:[...counts.values()].reduce((s,v)=>s+v.unread,0)},...([...counts.values()].sort((a,b)=>b.unread-a.unread || a.name.localeCompare(b.name)).map(r=>({...r,label:r.name})))];
 const tablet=$('g8mTabletSectionSelect');if(tablet){tablet.replaceChildren();rows.forEach(r=>{const o=document.createElement('option');o.value=r.name;o.textContent=r.label;tablet.append(o);});tablet.value=rows.some(r=>r.name===currentSection)?currentSection:'*';}
 const total=Object.values(summaries).reduce((n,s)=>n+unread(s),0);const badge=$('g8mTeacherTotal');badge.textContent=total>99?'99+':String(total);badge.hidden=!total;
 rows.forEach(r=>{
  const button=textEl('button','g8m-section-row'+(currentSection===r.name?' active':''),'');button.type='button';
  button.append(textEl('span','g8m-icon','▤'));
  const copy=textEl('span','g8m-row-copy','');copy.append(textEl('strong','',r.label),textEl('small','',`${r.people} student${r.people===1?'':'s'}`));button.append(copy);
  if(r.unread)button.append(textEl('span','g8m-bubble-count',r.unread>99?'99+':r.unread));
  button.addEventListener('click',()=>{currentSection=r.name;renderSections();renderStudents();switchMobile('students');});
  rootList.append(button);
 });
 if(rows.length===1)rootList.append(notice('No conversations or student records yet.'));
}
function renderStudents(){if(!teacher)return;
 const name=currentSection==='*'?'All Sections':currentSection;
 $('g8mCurrentSection').textContent=name;
 const people=allPeople().filter(p=>matchesFilter(p) && (currentSection==='*'||studentSection(p)===currentSection));
 people.sort((a,b)=> unread(summaries[b.uid])-unread(summaries[a.uid]) || Number(summaries[b.uid]?.lastAtMs||0)-Number(summaries[a.uid]?.lastAtMs||0) || a.name.localeCompare(b.name));
 $('g8mStudentCount').textContent=`${people.length} student${people.length===1?'':'s'}`;
 const list=$('g8mStudentList');list.replaceChildren();
 people.forEach(p=>{
  const row=textEl('button','g8m-student-row'+(p.uid===openedUid?' active':''),'');row.type='button';
  row.append(textEl('span','g8m-student-avatar',iconLetter(p)));
  const copy=textEl('span','g8m-row-copy','');copy.append(textEl('strong','',p.name),textEl('small','',short(summaries[p.uid]?.lastText || p.studentId || 'Start a conversation',42)));row.append(copy);
  const n=unread(summaries[p.uid]);if(n)row.append(textEl('span','g8m-bubble-count',n>99?'99+':n));
  row.addEventListener('click',()=>openChat(p.uid));list.append(row);
 });
 if(!people.length)list.append(notice('No students match this filter. Try All or another section.'));
}
function switchMobile(view){mobileView=view;workspace.dataset.mobileView=view;}
$('g8mSectionBack').addEventListener('click',()=>{if(!sending)switchMobile('sections');});
$('g8mChatBack').addEventListener('click',()=>{if(!sending)switchMobile('students');});
$('g8mSectionSearch').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();renderSections();renderStudents();});
$('g8mTabletSectionSelect').addEventListener('change',e=>{currentSection=e.target.value;renderSections();renderStudents();});
$('g8mGlobalFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;for(const x of $('g8mGlobalFilters').querySelectorAll('button'))x.classList.toggle('active',x===b);renderSections();renderStudents();});
function openChat(uid){
 if(sending){status('Your message is still sending. Finish the upload before switching conversations.',true);return;}
 if(teacher && !students.has(uid) && !summaries[uid])return;
 if(uid===openedUid && activeUnsubs.length){switchMobile('chat');return;}
 if(openedUid && activeMessages.length){
  conversationMemory.delete(openedUid);
  conversationMemory.set(openedUid,{messages:activeMessages.slice(-120),older:olderMessages.slice(-80),acks:{...activeAcks},seenAt,hasOlder});
  if(conversationMemory.size>10)conversationMemory.delete(conversationMemory.keys().next().value);
 }
 clearUnsubs(activeUnsubs);openedUid=uid;lastSnapshotKey='';
 const warm=conversationMemory.get(uid);
 activeMessages=warm?.messages?.slice()||[];olderMessages=warm?.older?.slice()||[];
 hasOlder=warm?.hasOlder||false;olderLoading=false;activeAcks=warm?.acks||{};seenAt=warm?.seenAt||0;reply=null;renderReply();
 if(teacher){const p=person(uid);$('g8mChatName').textContent=p.name;$('g8mChatMeta').textContent=[p.section,p.studentId].filter(Boolean).join(' · ');$('g8mChatAvatar').textContent=iconLetter(p);$('g8mComposer').hidden=false;renderStudents();}
 if(activeMessages.length||olderMessages.length)renderMessages();
 else $('g8mMessages').replaceChildren(notice('Loading messages…'));
 switchMobile('chat');
 updateChatFeedState(warm?'Showing recent messages · Syncing…':'Loading conversation…');
 const messagesRef=recentMessageQuery(uid);
 activeUnsubs.push(onValue(messagesRef,snap=>{
  if(uid!==openedUid)return;
  try{
   displayMessagesFromSnapshot(snap,uid);
   markSeen(uid).catch(err=>console.warn('Seen sync:',err));
  }catch(error){
   console.error('Messages render error:',error);
   updateChatFeedState('Chat display error · Tap ↻ to retry',true);
   status('A chat message could not be displayed. Try Refresh Chat.',true);
  }
 },err=>{
  if(uid!==openedUid)return;
  console.error('Messages listener failed:',err);
  updateChatFeedState('Live listener unavailable · Tap ↻ to retry',true);
  status(`Live messages unavailable: ${friendlyError(err)}`,true);
  // A one-time read can still work when a realtime listener is interrupted.
  refreshConversation(false);
 }));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/acks`),snap=>{if(uid!==openedUid)return;activeAcks=snap.val()||{};renderMessages();},err=>status(friendlyError(err),true)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/seen/${teacher?'student':'teacher'}`),snap=>{seenAt=Number(snap.val()||0);renderMessages();}));
}
async function markSeen(uid){if(uid!==openedUid)return;const path=studentPath(uid);
 const at=Date.now();
 try{
  await set(ref(rtdb,`${path}/seen/${role()}`),serverTimestamp());
  await set(ref(rtdb,`${summaryPath(uid)}/${teacher?'unreadTeacher':'unreadStudent'}`),0);
 }catch(error){console.warn('Read receipt not yet confirmed:',error);}
}
function renderMessages(){
 if(!openedUid)return;
 const log=$('g8mMessages');
 const nearBottom=log.scrollHeight-log.scrollTop-log.clientHeight<150;
 const previousHeight=log.scrollHeight;
 const version=++renderVersion;
 const shown=[...olderMessages,...activeMessages]
  .filter((x,i,arr)=>x&&x.id&&arr.findIndex(y=>y&&y.id===x.id)===i)
  .sort(compareMessages);
 const content=document.createDocumentFragment();
 const photosToLoad=[];
 if(!shown.length){
  log.replaceChildren(notice('Your private conversation starts here. Send a question, a message, or a picture.'));
  return;
 }
 if(hasOlder){
  const load=textEl('button','g8m-load-older',olderLoading?'Loading older messages…':'↑ Load older messages');
  load.disabled=olderLoading;load.type='button';load.addEventListener('click',loadOlder);content.append(load);
 }
 let currentDay='';
 for(const msg of shown){
  try{
   const at=safeStamp(msg.createdAtMs);
   const date=dayLabel(at);
   if(date!==currentDay){currentDay=date;content.append(textEl('div','g8m-date',date));}
   const mine=msg.senderUid===user?.uid;
   const item=textEl('article','g8m-message'+(mine?' own':''),'');
   item.dataset.messageId=String(msg.id);
   if(msg.replyText)item.append(textEl('div','g8m-quoted',short(msg.replyText,180)));
   if(msg.text && msg.type!=='project')item.append(textEl('div','g8m-text',String(msg.text)));
   if(msg.type==='project'){
    if(msg.text && msg.text!=='💻 Shared a G8Code project')item.append(textEl('div','g8m-text',String(msg.text)));
    const card=textEl('button','g8m-project-card','');card.type='button';
    card.append(textEl('span','g8m-project-symbol','⌘'));
    const info=textEl('span','g8m-project-info','');
    info.append(textEl('strong','',short(msg.projectName||'Shared G8Code Project',120)),textEl('small','','Latest saved version · View only'));
    card.append(info,textEl('span','g8m-project-open-label','View →'));
    const targetProject=String(msg.projectId||'');
    if(!/^[A-Za-z0-9_-]{1,128}$/.test(targetProject)){
      card.disabled=true;card.title='The project reference is unavailable';
    }else card.addEventListener('click',()=>openSharedProject(openedUid,targetProject));
    item.append(card);
   }
   const attachments=Array.isArray(msg.attachments)?msg.attachments:Object.values(msg.attachments||{});
   if(attachments.length){
    const photos=textEl('div','g8m-photo-grid','');
    attachments.slice(0,MAX_FILES).forEach(att=>{
     if(!att?.path || typeof att.path!=='string' || !att.path.startsWith(`g8Messages/${openedUid}/${msg.id}/`))return;
     const button=textEl('button','g8m-image-loading','Loading photo…');button.type='button';button.setAttribute('aria-label',`View ${att.name||'image'}`);
     photos.append(button);photosToLoad.push({att:{...att,messageId:msg.id},button});
    });
    item.append(photos);
    const ack=activeAcks[msg.id];
    if(teacher && msg.senderRole==='student'){
     const controls=textEl('div','g8m-ack-actions','');
     for(const st of ['received','checked']){
      const b=textEl('button',ack?.status===st?'selected':'',st==='received'?'✓ Received':'✓✓ Checked');b.type='button';
      b.title=st==='received'?'Acknowledge the attachment was received':'Confirm you reviewed the attachment (not a grade)';
      b.addEventListener('click',()=>acknowledge(msg.id,st));controls.append(b);
     }
     item.append(controls);
    }else if(ack && msg.senderRole==='student')item.append(textEl('span','g8m-ack-chip',ack.status==='checked'?'✓✓ Checked by teacher':'✓ Received by teacher'));
   }
   if(!item.querySelector('.g8m-text')&&!attachments.length&&msg.type!=='project'){
    // Malformed older data must not silently remove a message from chat.
    item.append(textEl('div','g8m-text','Message content unavailable'));
   }
   const meta=textEl('div','g8m-msg-meta','');meta.append(textEl('span','',formatTime(at)));
   if(mine)meta.append(textEl('span','',at<=seenAt?'✓✓ Seen':'✓ Sent'));
   const replyBtn=textEl('button','g8m-reply-btn','↩ Reply');replyBtn.type='button';
   replyBtn.addEventListener('click',()=>{reply={id:msg.id,text:msg.type==='project'?String(msg.projectName||'Shared project'):(msg.text||(attachments.length?'Photo attachment':'Message'))};renderReply();$('g8mTextInput').focus();});
   meta.append(replyBtn);item.append(meta);content.append(item);
  }catch(error){
   console.error('Could not render chat item:',msg?.id,error);
   const fallback=textEl('div','g8m-msg-render-error','A saved message could not be displayed.');
   fallback.dataset.messageId=String(msg?.id||'');content.append(fallback);
  }
 }
 // Commit only after all rows are built. One malformed row cannot blank the chat.
 log.replaceChildren(content);
 for(const {att,button} of photosToLoad)showPhoto(att,button,version);
 if(nearBottom||!lastSnapshotKey)log.scrollTop=log.scrollHeight;
 else log.scrollTop+=log.scrollHeight-previousHeight;
 lastSnapshotKey=shown.map(x=>x.id).join(':');
 if(pinnedMessageId&&Date.now()<pinExpires){
  // A subsequent live/seen/ack snapshot must not push a newly sent reply away.
  moveToMessage(pinnedMessageId);
 }

}

async function loadOlder(){
 if(olderLoading||!hasOlder||!openedUid)return;
 const uid=openedUid, oldest=(olderMessages[0]||activeMessages[0])?.id;
 if(!oldest)return;
 olderLoading=true;renderMessages();
 try{
  const page=query(ref(rtdb,`${studentPath(uid)}/messages`),orderByKey(),endAt(oldest),limitToLast(51));
  const snap=await get(page);if(uid!==openedUid)return;
  const found=[];snap.forEach(x=>found.push({id:x.key,...(x.val()||{})}));
  const existing=new Set([...olderMessages,...activeMessages].map(m=>m.id));
  const additions=found.filter(x=>!existing.has(x.id));
  olderMessages=[...additions,...olderMessages].sort(compareMessages);
  hasOlder=found.length>=51 && additions.length>0;
 }catch(error){status(friendlyError(error),true);}
 finally{olderLoading=false;renderMessages();}
}
async function showPhoto(att,button,version){
 const path=att.path;
 const fail=(message='Photo unavailable · tap to retry')=>{if(!button.isConnected)return;button.classList.remove('g8m-image-loading');button.textContent=message;button.addEventListener('click',()=>showPhoto(att,button,renderVersion),{once:true});};
 if(!button.isConnected)return;
 if(att.provider!=='drive'||!att.driveFileId){fail('Earlier attachment needs re-upload to Drive');return;}
 try{
  let url=imageCache.get(path);
  if(!url){
   let task=photoQueue.get(path);
   if(!task){task=driveRequest('read',{studentUid:openedUid,messageId:att.messageId||path.split('/')[2],driveFileId:att.driveFileId}).then(x=>{
    if(!x?.data||!allowedTypes.has(x.contentType))throw new Error('Invalid Drive photo response');
    const binary=atob(x.data);const data=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)data[i]=binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([data],{type:x.contentType}));
   });photoQueue.set(path,task);}
   url=await task;imageCache.set(path,url);photoQueue.delete(path);
  }
  if(!button.isConnected||!path.startsWith(`g8Messages/${openedUid}/`))return;
  button.replaceChildren();button.classList.remove('g8m-image-loading');const img=document.createElement('img');img.src=url;img.alt='Private Drive attachment';img.loading='lazy';button.append(img);
  button.onclick=()=>{$('g8mImageLarge').src=url;$('g8mImageViewer').hidden=false;};
 }catch(error){photoQueue.delete(path);console.warn('Private Drive photo:',error);fail('Photo access failed · tap to retry');}
}

async function acknowledge(messageId,st){if(!teacher||!openedUid)return;
 const previous=activeAcks[messageId]?.status || '';
 try{
  await set(ref(rtdb,`${studentPath(openedUid)}/acks/${messageId}`),{status:st,atMs:serverTimestamp(),byUid:user.uid});
  status(st==='checked'?'Marked Checked — no grade was changed.':'Marked Received — no grade was changed.');
  if((previous==='checked')!== (st==='checked')){
    try{await runTransaction(ref(rtdb,`${summaryPath(openedUid)}/needsChecking`),n=>Math.max(0,Math.min(9999,Number(n||0)+(st==='checked'?-1:1))));}catch(error){console.warn('Needs Checking sync pending:',error);}
  }
 }catch(error){status(friendlyError(error),true);}
}
async function syncCheckingCount(uid){
 try{
  const snap=await get(ref(rtdb,`${studentPath(uid)}/messages`));const ackSnap=await get(ref(rtdb,`${studentPath(uid)}/acks`));
  const msg=snap.val()||{},acks=ackSnap.val()||{};
  const n=Object.keys(msg).filter(id=>msg[id]?.senderRole==='student' && msg[id]?.attachments && (!acks[id] || acks[id].status!=='checked')).length;
  await set(ref(rtdb,`${summaryPath(uid)}/needsChecking`),n);
 }catch(error){console.warn('Needs Checking count sync:',error);}
}
function renderReply(){const c=$('g8mReply');c.hidden=!reply;if(reply)$('g8mReplyText').textContent=short(reply.text,120);}
$('g8mReplyCancel').addEventListener('click',()=>{reply=null;renderReply();});
$('g8mFileInput').addEventListener('change',e=>{
 if(selectedProject){selectedProject=null;renderProjectSelection();status('Project removed · sending images separately.');}
 for(const f of Array.from(e.target.files||[])){
  if(!allowedTypes.has(f.type)){status('Only JPG, PNG, or WEBP images are allowed.',true);continue;}
  if(f.size>MAX_SIZE){status(`${f.name}: image exceeds 5 MB.`,true);continue;}
  if(selections.length>=MAX_FILES){status('Maximum 3 images per message.',true);break;}
  selections.push({file:f,url:URL.createObjectURL(f)});
 }
 e.target.value='';renderSelections();
});
function renderSelections(){const cont=$('g8mAttachments');cont.hidden=!selections.length;cont.replaceChildren();selections.forEach((s,i)=>{
 const frame=textEl('div','g8m-attachment-preview','');const img=document.createElement('img');img.src=s.url;img.alt=s.file.name;
 const x=textEl('button','','×');x.type='button';x.setAttribute('aria-label','Remove image');x.addEventListener('click',()=>{URL.revokeObjectURL(s.url);selections.splice(i,1);renderSelections();});
 frame.append(img,x);cont.append(frame);
 });setSendEnabled();}
function setSendEnabled(){$('g8mSend').disabled=sending||!openedUid||(!$('g8mTextInput').value.trim()&&!selections.length&&!selectedProject);$('g8mFileInput').disabled=sending;const p=$('g8mAttachMenuToggle');if(p)p.disabled=sending;}
$('g8mTextInput').addEventListener('input',()=>{const t=$('g8mTextInput');t.style.height='38px';t.style.height=Math.min(120,t.scrollHeight)+'px';setSendEnabled();});
$('g8mTextInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(!$('g8mSend').disabled)$('g8mComposer').requestSubmit();}});
function summaryData(uid){const personInfo=teacher?person(uid):profile;
 return {name:short(personInfo?.name||'Student',100),studentId:short(personInfo?.studentId||'',50),section:short(personInfo?.section||'Unassigned',100)};
}
// Workspace Drive bridge uses a normal HTML form in a hidden iframe. This avoids
// the cross-origin fetch/redirect issue with Apps Script web-app endpoints.
// The Apps Script server verifies the Firebase ID token BEFORE touching Drive.
function driveUrl(){return String(window.MCS_G8_MESSAGES_DRIVE_URL||'').trim();}
function driveRequest(action,args){
 return new Promise(async(resolve,reject)=>{
  const endpoint=driveUrl();
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(endpoint)){
   reject(new Error('Google Workspace Drive is not configured. Configure the existing G8Code Apps Script /exec URL in firebase-config.js.'));return;
  }
  if(!user){reject(new Error('Sign in before accessing private Drive attachments.'));return;}
  if(location.protocol==='file:'){reject(new Error('Private Drive attachments need the deployed HTTPS G8Code website (not file://).'));return;}
  let token;
  try{token=await user.getIdToken();}catch(e){reject(e);return;}
  const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);const nonce=[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
  const frame=document.createElement('iframe');frame.name=`g8m_drive_${nonce}`;frame.title='Private Google Drive transfer';frame.hidden=true;frame.style.display='none';
  const form=document.createElement('form');form.method='POST';form.action=endpoint;form.target=frame.name;form.style.display='none';
  const data={g8mBridge:'1',action,nonce,origin:location.origin,idToken:token,...args};
  for(const [key,value] of Object.entries(data)){const field=document.createElement('input');field.type='hidden';field.name=key;field.value=String(value??'');form.append(field);}
  let finished=false;
  const cleanup=()=>{window.removeEventListener('message',receive);clearTimeout(timeout);form.remove();frame.remove();};
  const finish=(err,payload)=>{if(finished)return;finished=true;cleanup();err?reject(err):resolve(payload);};
  const receive=event=>{
   if(!/^https:\/\/(?:[a-z0-9-]+\.)*(?:googleusercontent\.com|script\.google\.com)$/.test(event.origin))return;
   const msg=event.data;if(!msg||msg.g8mDrive!==true||msg.nonce!==nonce)return;
   if(msg.ok)finish(null,msg.data);else finish(new Error(msg.error||'Workspace Drive request failed'));
  };
  window.addEventListener('message',receive);
  const timeout=setTimeout(()=>finish(new Error('Workspace Drive timed out. Confirm the Apps Script deployment and Workspace access.')),90000);
  document.body.append(frame,form);
  try{form.submit();}catch(err){finish(err);}
 });
}
function fileBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=()=>reject(r.error||new Error('Could not read photo'));r.readAsDataURL(file);});}
async function uploadFile(uid,msgKey,file,index){
 if(!allowedTypes.has(file.type)||file.size>MAX_SIZE)throw new Error('Invalid image type or file larger than 5 MB');
 status(`Preparing photo ${index+1} for private Drive…`);
 const data=await fileBase64(file);
 status(`Saving photo ${index+1} to Google Workspace Drive…`);
 const result=await driveRequest('upload',{studentUid:uid,messageId:msgKey,fileName:short(file.name,120),contentType:file.type,fileSize:file.size,fileData:data,section:short(summaryData(uid).section,100)});
 if(!result||!result.driveFileId)throw new Error('Drive did not confirm the photo upload');
 return {path:`g8Messages/${uid}/${msgKey}/${result.driveFileId}`,name:short(file.name,120),size:file.size,contentType:file.type,provider:'drive',driveFileId:result.driveFileId};
}
async function sendMessage(event){event.preventDefault();if(sending||!openedUid||!user)return;
 const uid=openedUid, text=$('g8mTextInput').value.trim(),queued=selections.slice(),currentReply=reply,sharedProject=selectedProject;
 if(!text&&!queued.length&&!sharedProject)return;
 sending=true;setSendEnabled();status('Sending…');
 const key=push(ref(rtdb,`${studentPath(uid)}/messages`)).key;
 try{
  const attachments=[];
  for(let i=0;i<queued.length;i++)attachments.push(await uploadFile(uid,key,queued[i].file,i));
  const senderRole=role();
  if(sharedProject && (teacher||uid!==user.uid||queued.length))throw new Error('Projects can only be shared by the student in their own chat, one project per message.');
  const payload={text:short(text||(sharedProject?'💻 Shared a G8Code project':'📷 Photo attachment'),3000),type:sharedProject?'project':attachments.length?'image':'text',senderUid:user.uid,senderRole,createdAtMs:serverTimestamp(),replyTo:currentReply?.id||'',replyText:short(currentReply?.text||'',180)};
  if(sharedProject){payload.projectId=sharedProject.id;payload.projectName=short(sharedProject.name||'Untitled Project',120);}
  if(attachments.length)payload.attachments=attachments;
  // Critical: save the MESSAGE independently. A denied summary/unread update
  // must never roll back a reply or make messages appear to silently disappear.
  const messageRef=ref(rtdb,`${studentPath(uid)}/messages/${key}`);
  await set(messageRef,payload);
  const confirmed=await get(messageRef);
  if(!confirmed.exists()||confirmed.val()?.senderUid!==user.uid)throw new Error('Message write could not be verified. Please retry.');
  // Render the verified message immediately. The onValue listener will reconcile
  // it with the other participant's updates. This also protects against UI
  // stalls when the live listener is delayed, interrupted, or showing a stale page.
  if(uid===openedUid){
   const local={id:key,...confirmed.val(),__confirmedLocal:true};
   if(!activeMessages.some(m=>m.id===key))activeMessages.push(local);
   activeMessages.sort(compareMessages);
   renderMessages();
   pinMessage(key);
  }
  // Keep the message commit independent of unread and summary writes.
  const data=summaryData(uid);
  const summaryPaths={
   [`${summaryPath(uid)}/name`]:data.name,
   [`${summaryPath(uid)}/studentId`]:data.studentId,
   [`${summaryPath(uid)}/section`]:data.section,
   [`${summaryPath(uid)}/lastText`]:short(text||(sharedProject?`💻 ${sharedProject.name}`:`📷 ${attachments.length} photo${attachments.length===1?'':'s'}`),160),
   [`${summaryPath(uid)}/lastAtMs`]:serverTimestamp(),
   [`${summaryPath(uid)}/lastRole`]:senderRole
  };
  let syncIssue=false;
  try{await update(ref(rtdb),summaryPaths);}catch(error){syncIssue=true;console.warn('Message saved; inbox summary sync failed:',error);}
  const counter=`${summaryPath(uid)}/${teacher?'unreadStudent':'unreadTeacher'}`;
  try{await runTransaction(ref(rtdb,counter),n=>Math.min(9999,Number(n||0)+1));}catch(error){syncIssue=true;console.warn('Message saved; unread badge sync failed:',error);}
  if(teacher){try{await markSeen(uid);}catch(_){} }
  if(!teacher){
   try{await update(ref(rtdb),{
    [`${BASE}/directory/${uid}/name`]:data.name,
    [`${BASE}/directory/${uid}/studentId`]:data.studentId,
    [`${BASE}/directory/${uid}/section`]:data.section
   });}catch(error){syncIssue=true;console.warn('Directory sync pending',error);}
  }
  if(attachments.length&&!teacher){try{await runTransaction(ref(rtdb,`${summaryPath(uid)}/needsChecking`),n=>Math.min(9999,Number(n||0)+1));}catch(error){syncIssue=true;console.warn('Photo saved; Needs Checking badge sync pending',error);}}
  $('g8mTextInput').value='';$('g8mTextInput').style.height='38px';selections.forEach(x=>URL.revokeObjectURL(x.url));selections=[];selectedProject=null;renderSelections();renderProjectSelection();reply=null;renderReply();
  if(uid===openedUid)pinMessage(key);
  // After rendering and layout, confirm that the current message is truly in the
  // visible chat viewport. A hidden DOM node is NOT a successful display.
  await new Promise(resolve=>setTimeout(resolve,65));
  const visible=uid===openedUid && messageIsVisible(key);
  if(visible)status(syncIssue?'Sent ✓ · Chat visible · Inbox badge sync pending.':'Sent ✓ · Visible in chat');
  else status('Message saved in Firebase, but not visible. Use Refresh Chat; do not resend yet.',true);
 }catch(error){console.error('Message send failed:',error);status(`Not confirmed: ${friendlyError(error)}. Your text and files are retained.`,true);}
 finally{sending=false;setSendEnabled();}
}

// === V4.0: Secure, live-reference project sharing (no code snapshots in messages). ===
const projectPicker=$('g8mProjectPicker'),projectViewer=$('g8mProjectViewer');
function closeAttachMenu(){if($('g8mAttachMenu'))$('g8mAttachMenu').hidden=true;}
$('g8mAttachMenuToggle').addEventListener('click',()=>{
 if(sending)return;
 $('g8mAttachMenu').hidden=!$('g8mAttachMenu').hidden;
});
$('g8mChoosePhoto').addEventListener('click',()=>{closeAttachMenu();$('g8mFileInput').click();});
$('g8mChooseProject').addEventListener('click',()=>{closeAttachMenu();if(teacher){status('Only students can share their own saved projects.',true);return;}void showProjectPicker();});
document.addEventListener('click',event=>{
 if(!event.target.closest('.g8m-attach-wrap'))closeAttachMenu();
});
function openModal(modal){modal.hidden=false;projectModalReturnFocus=document.activeElement;const focus=modal.querySelector('button,input,select');focus?.focus();}
function closeModal(modal){modal.hidden=true;projectModalReturnFocus?.focus?.();}
$('g8mPickClose').addEventListener('click',()=>closeModal(projectPicker));
$('g8mViewerClose').addEventListener('click',()=>closeModal(projectViewer));
for(const modal of [projectPicker,projectViewer])modal.addEventListener('click',event=>{if(event.target===modal)closeModal(modal);});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 if(!projectViewer.hidden){event.preventDefault();closeModal(projectViewer);return;}
 if(!projectPicker.hidden){event.preventDefault();closeModal(projectPicker);return;}
 closeAttachMenu();
});
function stampLabel(value){
 const time=value?.toDate?.()?.getTime?.()||Number(value?.seconds||0)*1000||Number(value)||0;
 return time?new Intl.DateTimeFormat('en-PH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(time)):'Not available';
}
async function showProjectPicker(){
 if(teacher||!user||!firestore)return;
 if(selections.length){status('Send your selected photos first, then attach a project separately.',true);return;}
 openModal(projectPicker);
 $('g8mProjectSearch').value='';$('g8mProjectList').replaceChildren(notice('Loading saved projects…'));
 try{
  // Read the student's own Firestore project collection. Never rely on a typed UID.
  const path=[window.MCS_FIREBASE_COLLECTION||'webCodeEditor',window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1','students',user.uid,'projects'];
  const snapshot=await getDocs(collection(firestore,...path));
  if(projectPicker.hidden||teacher)return;
  savedProjects=snapshot.docs.map(s=>({id:s.id,...s.data()})).sort((a,b)=>{
    const time=x=>x?.updatedAt?.toMillis?.()||Number(x?.updatedAt?.seconds||0)*1000||0;
    return time(b)-time(a);
  });
  renderProjectPicker();
 }catch(error){$('g8mProjectList').replaceChildren(notice('Projects could not load: '+friendlyError(error)));}
}
function renderProjectPicker(){
 const target=$('g8mProjectList');target.replaceChildren();
 const q=$('g8mProjectSearch').value.trim().toLowerCase();
 const list=savedProjects.filter(p=>(String(p.name||'')+' '+String(p.activityTitle||'')).toLowerCase().includes(q));
 for(const project of list){
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(String(project.id||'')))continue;
  const button=textEl('button','g8m-project-choice','');button.type='button';
  const icon=textEl('span','g8m-project-symbol',String(project.projectType||'').toLowerCase()==='wireframe'?'▧':'⌘');
  const info=textEl('span','g8m-project-info','');
  info.append(textEl('strong','',short(project.name||'Untitled Project',120)),textEl('small','',`Last saved: ${stampLabel(project.updatedAt)} · ${project.projectType==='wireframe'?'Wireframe':'Code project'}`));
  button.append(icon,info,textEl('span','','Select →'));
  button.addEventListener('click',()=>{
   selectedProject={id:String(project.id),name:short(project.name||'Untitled Project',120)};
   closeModal(projectPicker);renderProjectSelection();setSendEnabled();$('g8mTextInput').focus();
   status('Project attached · Send to share its latest saved version.');
  });
  target.append(button);
 }
 if(!target.children.length)target.append(notice('No matching saved projects. Save a project in My Projects first.'));
}
$('g8mProjectSearch').addEventListener('input',renderProjectPicker);
function renderProjectSelection(){
 const area=$('g8mProjectSelected');area.replaceChildren();area.hidden=!selectedProject;
 if(!selectedProject)return;
 const label=textEl('span','',`⌘ ${selectedProject.name} · latest saved version`);
 const clear=textEl('button','','×');clear.type='button';clear.title='Remove selected project';clear.setAttribute('aria-label','Remove shared project');
 clear.addEventListener('click',()=>{selectedProject=null;renderProjectSelection();setSendEnabled();});
 area.append(label,clear);
}
// Use EXACT authenticated conversation owner as project owner, never message metadata.
// Each view reads from Firestore's server to pick up later student edits.
async function openSharedProject(studentUid,projectId){
 if(!user||!firestore||!studentUid||!projectId)return;
 if(!/^[A-Za-z0-9_-]{1,128}$/.test(projectId)){status('Invalid project reference.',true);return;}
 if(!teacher&&studentUid!==user.uid){status('You can only view your own project.',true);return;}
 const currentUid=openedUid;
 openModal(projectViewer);
 $('g8mViewerTitle').textContent='Opening latest saved project…';
 $('g8mViewerMeta').textContent='Loading directly from G8Code…';
 $('g8mViewerError').hidden=true;
 $('g8mViewerWorkspace').hidden=true;
 $('g8mViewerLoading').hidden=false;
 try{
  const path=[window.MCS_FIREBASE_COLLECTION||'webCodeEditor',window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1','students',studentUid,'projects',projectId];
  const snapshot=await getDocFromServer(doc(firestore,...path));
  if(projectViewer.hidden||openedUid!==currentUid)return;
  if(!snapshot.exists())throw new Error('This saved project was deleted or is no longer available.');
  const project=snapshot.data()||{};
  $('g8mViewerTitle').textContent=short(project.name||'G8Code Project',120);
  $('g8mViewerMeta').textContent=`${teacher?person(studentUid).name:'My Project'} · Last saved ${stampLabel(project.updatedAt)} · Read-only`;
  projectViewerFiles=normalizeViewerProject(project);
  populateViewerPages();populateViewerSource();
  $('g8mViewerWorkspace').hidden=false;
  $('g8mViewerLoading').hidden=true;
  $('g8mViewerWireframeNotice').hidden=true;
  $('g8mViewerDeviceLabel').hidden=true;
  renderViewerPreview();
  requestAnimationFrame(sizeDesktopProjectPreview);
 }catch(error){
  $('g8mViewerLoading').hidden=true;
  $('g8mViewerError').hidden=false;
  $('g8mViewerError').textContent='Could not open the latest saved version: '+friendlyError(error);
 }
}
function projectMap(src,key,extension,legacy){
 const raw=src?.[key];const map={};
 if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
  for(const [name,value] of Object.entries(raw)){
   if(new RegExp('^[a-zA-Z0-9_.-]{1,100}\\.'+extension+'$','i').test(name)&&typeof value==='string')map[name]=value;
  }
 }
 if(!Object.keys(map).length)map[extension==='html'?'index.html':extension==='css'?'style.css':'script.js']=typeof src?.[legacy]==='string'?src[legacy]:'';
 return map;
}
function normalizeViewerProject(project){
 const raw=project.codeByActivity&&typeof project.codeByActivity==='object'?project.codeByActivity:null;
 const stores=raw?Object.entries(raw).filter(([,entry])=>entry&&typeof entry==='object'):[];
 // Prefer the actual selected activity. If that key is absent in an older
 // project, choose the saved code store with real content, not an empty scratch.
 const codeWeight=entry=>{
  if(!entry||typeof entry!=='object')return 0;
  return ['pages','cssFiles','jsFiles'].reduce((sum,key)=>sum+Object.values(entry[key]||{}).reduce((total,code)=>total+(typeof code==='string'?code.trim().length:0),0),0)
    +['html','css','js'].reduce((sum,key)=>sum+(typeof entry[key]==='string'?entry[key].trim().length:0),0);
 };
 const preferred=raw&&project.selectedActivityId&&raw[project.selectedActivityId];
 const chosen=preferred||stores.sort((a,b)=>codeWeight(b[1])-codeWeight(a[1]))[0]?.[1]||project;
 const src=chosen&&typeof chosen==='object'?chosen:project;
 const html=projectMap(src,'pages','html','html');
 const css=projectMap(src,'cssFiles','css','css');
 const javascript=projectMap(src,'jsFiles','js','js');
 const wireframe=String(project.projectType||'').toLowerCase()==='wireframe';
 const wf=project.wireframeData&&typeof project.wireframeData==='object'?project.wireframeData:{};
 const pages=Array.isArray(wf.pages)&&wf.pages.length?wf.pages:[{id:'home',name:'Home',canvasBackground:wf.canvasBackground,elements:wf.elements||[]}];
 return {html,css,js:javascript,wireframe,wireframePages:pages,
  activeCss:css[src.activeCssFile]!==undefined?src.activeCssFile:Object.keys(css)[0],
  activeJs:javascript[src.activeJsFile]!==undefined?src.activeJsFile:Object.keys(javascript)[0],
  selectedHtml:html[src.activeHtmlPage]!==undefined?src.activeHtmlPage:(html['index.html']!==undefined?'index.html':Object.keys(html)[0])};
}
function populateViewerPages(){
 const selector=$('g8mViewerPage');selector.replaceChildren();
 if(projectViewerFiles.wireframe){
  projectViewerFiles.wireframePages.forEach((page,i)=>{const option=document.createElement('option');option.value=String(page.id||i);option.textContent=short(page.name||`Page ${i+1}`,70);selector.append(option);});
  selector.value=String(projectViewerFiles.wireframePages[0]?.id||0);
 }else{
  for(const name of Object.keys(projectViewerFiles.html)){
   const option=document.createElement('option');option.value=name;option.textContent=name;selector.append(option);
  }
  selector.value=projectViewerFiles.selectedHtml;
 }
}
function populateViewerSource(){
 const selector=$('g8mViewerSourceFile');selector.replaceChildren();
 if(projectViewerFiles.wireframe){const item=document.createElement('option');item.value='wireframe';item.textContent='Layout summary';selector.append(item);renderViewerSource();return;}
 for(const [lang,files] of Object.entries({html:projectViewerFiles.html,css:projectViewerFiles.css,js:projectViewerFiles.js})){
  for(const name of Object.keys(files)){
   const option=document.createElement('option');option.value=lang+'|'+name;option.textContent=name;selector.append(option);
  }
 }
 renderViewerSource();
}
function renderViewerSource(){
 if(!projectViewerFiles)return;
 if(projectViewerFiles.wireframe){
  const page=projectViewerFiles.wireframePages.find(p=>String(p.id)===$('g8mViewerPage').value)||projectViewerFiles.wireframePages[0];
  const list=Array.isArray(page?.elements)?page.elements:[];
  $('g8mViewerSource').textContent=[`Page: ${page?.name||'Home'}`,`Elements: ${list.length}`,'',...list.map((e,i)=>`${i+1}. ${String(e.type||'element')} · ${String(e.text||e.name||'').slice(0,120)}`)].join('\n');
  return;
 }
 const value=$('g8mViewerSourceFile').value||'';const boundary=value.indexOf('|');
 const lang=value.slice(0,boundary),name=value.slice(boundary+1);
 $('g8mViewerSource').textContent=projectViewerFiles[lang]?.[name]||'';
}
// Render the same local-file references that the G8Code Editor uses. The old
// renderer injected all styles at </head> and scripts at </body>, but sometimes
// left broken local references and malformed document shells. That could result
// in blank or wrong output, especially with multiple linked CSS/JS files.
function previewIsExternalAsset(address) {
 return /^(?:https?:)?\/\/|^(?:data:|blob:)/i.test(String(address||'').trim());
}
function previewFileName(address) {
 let raw=String(address||'').trim().split(/[?#]/)[0].replace(/\\/g,'/');
 try {raw=decodeURIComponent(raw);} catch (_){}
 return raw.split('/').pop()||'';
}
function findProjectAsset(files,address) {
 const name=previewFileName(address), keys=Object.keys(files||{});
 const target=keys.find(key=>key===name)||keys.find(key=>key.toLowerCase()===name.toLowerCase());
 return target?String(files[target]||''):null;
}
function buildIsolatedPreview(project,pageName){
 const source=String(project.html[pageName]||'');
 // Parse either a full document or a fragment into one valid HTML shell.
 const parsed=new DOMParser().parseFromString(source||'<p>No HTML in this project yet.</p>','text/html');
 parsed.querySelectorAll('base').forEach(el=>el.remove());
 const cssNames=new Set(), jsNames=new Set();
 for(const link of [...parsed.querySelectorAll('link[rel][href]')]){
  if(!String(link.getAttribute('rel')||'').toLowerCase().split(/\s+/).includes('stylesheet'))continue;
  const address=link.getAttribute('href');
  if(previewIsExternalAsset(address))continue;
  const name=previewFileName(address);
  const match=Object.keys(project.css).find(n=>n.toLowerCase()===name.toLowerCase());
  if(match){const style=parsed.createElement('style');style.setAttribute('data-g8m-project-css',match);style.textContent=project.css[match];link.replaceWith(style);cssNames.add(match);}
  else link.remove(); // Never resolve a local file against G8Code's own website.
 }
 for(const original of [...parsed.querySelectorAll('script[src]')]){
  const address=original.getAttribute('src');
  if(previewIsExternalAsset(address))continue;
  const name=previewFileName(address),match=Object.keys(project.js).find(n=>n.toLowerCase()===name.toLowerCase());
  if(match){const script=parsed.createElement('script');script.setAttribute('data-g8m-project-js',match);script.textContent=String(project.js[match]||'').replace(/<\/script/gi,'<\\/script');original.replaceWith(script);jsNames.add(match);}
  else original.remove();
 }
 // G8Code editor falls back to the active style/script when none is linked.
 if(!cssNames.size){
  const active=project.activeCss&&project.css[project.activeCss]!==undefined?project.activeCss:Object.keys(project.css)[0];
  if(active&&project.css[active]){const el=parsed.createElement('style');el.textContent=project.css[active];parsed.head.append(el);}
 }
 if(!jsNames.size){
  const active=project.activeJs&&project.js[project.activeJs]!==undefined?project.activeJs:Object.keys(project.js)[0];
  if(active&&project.js[active]){const el=parsed.createElement('script');el.textContent=String(project.js[active]).replace(/<\/script/gi,'<\\/script');parsed.body.append(el);}
 }
 const meta=parsed.querySelector('meta[name="viewport"]');
 if(!meta){const viewport=parsed.createElement('meta');viewport.name='viewport';viewport.content='width=device-width,initial-scale=1';parsed.head.prepend(viewport);}
 // Internal page navigation stays inside this read-only preview (not G8Code).
 const bridge=parsed.createElement('script');
 bridge.textContent=`document.addEventListener('click',function(event){
   var link=event.target&&event.target.closest?event.target.closest('a[href]'):null;
   if(!link)return;
   var href=link.getAttribute('href')||'';
   if(/^(?:https?:|mailto:|tel:|data:|blob:|\\/\\/|#)/i.test(href))return;
   var page=href.split('#')[0].split('?')[0].replace(/\\\\/g,'/').split('/').pop();
   if(!/\\.html?$/i.test(page))return;
   event.preventDefault();parent.postMessage({type:'g8m-project-preview-nav',page:page},'*');
 },true);`;
 parsed.head.append(bridge);
 return '<!doctype html>\n'+parsed.documentElement.outerHTML;
}
function wireframeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function wireframeColor(value,defaultColor){return typeof value==='string'&&/^(?:#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20}|rgba?\([0-9\s,%.]+\))$/.test(value)?value:defaultColor;}
function buildWireframePreview(project,pageId,device){
 const pages=project.wireframePages;
 const page=pages.find(p=>String(p.id)===pageId)||pages[0]||{};
 const size=device==='phone'?{width:390,height:844}:{width:1280,height:800};
 const elems=(Array.isArray(page.elements)?page.elements:[]).slice(0,150);
 const blocks=elems.filter(e=>e&&!e.hidden).map(e=>{
  const layout=e.layouts?.[device]||e.layouts?.desktop||{x:10,y:10,w:150,h:80};
  const x=Math.min(99,Math.max(0,Number(layout.x)||0)/size.width*100),y=Math.min(99,Math.max(0,Number(layout.y)||0)/size.height*100);
  const w=Math.min(100-x,Math.max(1,Number(layout.w)||90)/size.width*100),h=Math.min(100-y,Math.max(1,Number(layout.h)||40)/size.height*100);
  const st=e.style||{};
  const css=`left:${x}%;top:${y}%;width:${w}%;height:${h}%;z-index:${Math.max(1,Math.min(999,Number(e.z)||1))};background:${wireframeColor(st.background,'transparent')};color:${wireframeColor(st.color,'#202b46')};border:${Math.max(0,Math.min(8,Number(st.borderWidth)||0))}px solid ${wireframeColor(st.borderColor,'#bbc7db')};border-radius:${Math.max(0,Math.min(80,Number(st.radius)||0))}px;text-align:${['left','center','right'].includes(st.textAlign)?st.textAlign:'left'};font-weight:${Math.max(300,Math.min(900,Number(st.fontWeight)||400))}`;
  const src=typeof e.image?.src==='string'&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(e.image.src)?e.image.src:'';
  const content=String(e.type||'')==='image'&&src?`<img alt="Wireframe image" src="${src}" style="width:100%;height:100%;object-fit:cover">`:wireframeHtml(e.text||e.name||'');
  return `<div class="item" style="${css}">${content}</div>`;
 }).join('');
 return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:15px;background:#e9eef8;font-family:Arial,sans-serif;display:flex;justify-content:center}.page{background:${wireframeColor(page.canvasBackground,'#fff')};width:100%;max-width:${size.width}px;aspect-ratio:${size.width}/${size.height};position:relative;box-shadow:0 8px 32px #0002;overflow:hidden}.item{position:absolute;display:flex;align-items:center;justify-content:center;padding:2px;font-size:clamp(7px,1.2vw,18px);overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere}.item img{max-width:100%;max-height:100%}</style></head><body><div class="page">${blocks}</div></body></html>`;
}
// A fixed 1280px layout viewport ensures that phone viewers see the SAME
// desktop layout as the teacher on a laptop. Only the visual scale changes.
const PROJECT_DESKTOP_WIDTH=1280;
let previewResizeObserver=null;
function sizeDesktopProjectPreview(){
 const host=$('g8mViewerPreviewHost'),frame=$('g8mViewerPreview');
 if(!host||!frame||projectViewer.hidden||!projectViewerFiles)return;
 const width=host.clientWidth,height=host.clientHeight;
 if(width<20||height<20)return;
 const scale=Math.min(1,width/PROJECT_DESKTOP_WIDTH);
 frame.style.width=PROJECT_DESKTOP_WIDTH+'px';
 frame.style.height=Math.max(800,Math.ceil(height/scale))+'px';
 frame.style.transformOrigin='top left';
 frame.style.transform='scale('+scale+')';
 host.dataset.scale=Math.round(scale*100)+'%';
 $('g8mViewerViewportNote').textContent='Desktop output · '+Math.round(scale*100)+'% fit · scroll inside the preview';
}
if(typeof ResizeObserver!=='undefined'){
 previewResizeObserver=new ResizeObserver(()=>sizeDesktopProjectPreview());
 previewResizeObserver.observe($('g8mViewerPreviewHost'));
}
window.addEventListener('resize',sizeDesktopProjectPreview);
function renderViewerPreview(){
 if(!projectViewerFiles)return;
 const content=projectViewerFiles.wireframe
  ?buildWireframePreview(projectViewerFiles,$('g8mViewerPage').value,'desktop')
  :buildIsolatedPreview(projectViewerFiles,$('g8mViewerPage').value);
 // Reset page scroll when switching HTML files; the frame itself scrolls for
 // pages longer than the visible region (vertical and horizontal if needed).
 $('g8mViewerPreview').srcdoc=content;
 renderViewerSource();
 sizeDesktopProjectPreview();
 requestAnimationFrame(sizeDesktopProjectPreview);
}
window.addEventListener('message',event=>{
 const frame=$('g8mViewerPreview');
 if(projectViewer.hidden||!frame||event.source!==frame.contentWindow)return;
 const data=event.data;
 if(!data||data.type!=='g8m-project-preview-nav'||typeof data.page!=='string')return;
 const name=previewFileName(data.page);
 if(projectViewerFiles?.html[name]!==undefined){
  $('g8mViewerPage').value=name;renderViewerPreview();
 }
});
$('g8mViewerPage').addEventListener('change',renderViewerPreview);
$('g8mViewerSourceFile').addEventListener('change',renderViewerSource);
// === End Messages V4.0 ===

$('g8mComposer').addEventListener('submit',sendMessage);
window.addEventListener('beforeunload',()=>{clearUnsubs(rootUnsubs);clearUnsubs(activeUnsubs);selections.forEach(s=>URL.revokeObjectURL(s.url));imageCache.forEach(url=>URL.revokeObjectURL(url));});
boot();
