/* G8Code Messages V5.7 (based on V5.6) — authenticated, student↔teacher only. No grade/submission writes. */
// Classic script entry: works when index.html / admin-v2.html / messages.html
// are opened directly from disk. Do NOT use <script type="module"> for local pages.
// Fetch only the Firebase modules from HTTPS, like the existing G8Code login.
let initializeApp, getApps, getApp, getAuth, onAuthStateChanged, signInWithEmailAndPassword;
let getDatabase, ref, onValue, query, limitToLast, orderByKey, endAt, get, push, set, update, remove, runTransaction, serverTimestamp, onDisconnect;
// Firestore is LAZY: normal text/image chat and inbox use RTDB only.
// Firestore SDK loads solely when opening a saved project or exceptional legacy login recovery.
let getFirestore, collection, doc, getDoc, getDocFromServer, getDocs;
let projectFirestorePromise = null;
async function ensureProjectFirestore(){
 if(firestore) return firestore;
 if(!projectFirestorePromise){
  projectFirestorePromise = (async()=>{
   const v = window.MCS_FIREBASE_SDK_VERSION || '10.12.5';
   const f = await import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`);
   // Firestore exports are initialized ONLY when a saved project is requested.
   // Normal Messages startup deliberately never loads the Firestore SDK.
   ({getFirestore, collection, doc, getDoc, getDocFromServer, getDocs} = f);
   firestore=getFirestore(app);
   return firestore;
  })().catch(err=>{projectFirestorePromise=null;throw err;});
 }
 return projectFirestorePromise;
}

async function loadMessagesFirebaseSDK(){
 const v = window.MCS_FIREBASE_SDK_VERSION || '10.12.5';
 const base = `https://www.gstatic.com/firebasejs/${v}`;
 const load = Promise.all([
  import(`${base}/firebase-app.js`),
  import(`${base}/firebase-auth.js`),
  import(`${base}/firebase-database.js`)
 ]);
 const timeout = new Promise((_,reject)=>setTimeout(()=>reject(new Error('Firebase libraries did not load. Check internet access or use the deployed G8Code website.')),15000));
 const [a, au, d] = await Promise.race([load, timeout]);
 ({initializeApp, getApps, getApp} = a);
 ({getAuth, onAuthStateChanged, signInWithEmailAndPassword} = au);
 ({getDatabase, ref, onValue, query, limitToLast, orderByKey, endAt, get, push, set, update, remove, runTransaction, serverTimestamp, onDisconnect} = d);

}


// Storage may be blocked for file:// pages or privacy-restricted browsers.
const safeGet = key => { try { return window.localStorage.getItem(key); } catch (_) { return null; } };
const safeSet = (key,value) => { try { window.localStorage.setItem(key,value); } catch (_) {} };
const $ = id => document.getElementById(id);
const root = $('g8mApp'), workspace = $('g8mWorkspace'), gate = $('g8mGate');
const BASE = 'g8MessagesV1';
// Entry source is explicit, not inferred from history or the signed-in role.
// from=login: learn shortcut (teacher-only). from=admin: Admin V2.
const g8mEntrySource = new URLSearchParams(location.search).get('from');
const g8mTeacherShortcut = g8mEntrySource === 'login';
const g8mTeacherEntry = g8mEntrySource === 'admin' || g8mTeacherShortcut;
// Accept original images up to 30 MB; optimize large photos client-side before
// transport so Apps Script receives a much smaller image and chats load quickly.
const MAX_FILES = 3, MAX_SIZE = 30 * 1024 * 1024;
const DRIVE_UPLOAD_TARGET = 3 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const teacherEmails = (window.MCS_TEACHER_EMAILS || []).map(x => String(x).toLowerCase());
let app, auth, rtdb, firestore, user, teacher = false, profile = null;
let sections = [], students = new Map(), summaries = {}, openedUid = '', currentSection = '*';
let filter = 'all', search = '', mobileView = 'sections', activeMessages = [], activeAcks = {}, seenAt = 0;
let activeUnsubs = [], rootUnsubs = [], sending = false, selections = [], reply = null, renderVersion = 0;
let olderMessages=[], hasOlder=false, olderLoading=false;
let imageCache = new Map(), photoQueue = new Map(), lastSnapshotKey = '';
let photoVisibilityObserver = null;
// V4.7: bounded parallel private reads and a per-session LRU of decoded blob URLs.
// Keep buttons across Seen/ack snapshots: a chat rerender must not cancel a photo.
let photoReadActive = 0;
const photoReadWaiting = [];
const PHOTO_READ_CONCURRENCY = 2;
const PHOTO_CACHE_MAX_ITEMS = 36;

// V5.3: an optimistic photo is LOCAL to the sender until Drive + RTDB confirm.
// Never publish a fake message to the receiver. Keep failed previews for retry.
const pendingPhotoJobs = new Map();
const PHOTO_JOBS_LIMIT = 2;
let photoSendTail = Promise.resolve();
let imagePreparationTail = Promise.resolve();
let driveBridgeCheckPromise = null;

// V4.5: short-lived chat presence/typing, reactions, and independently stored read receipts.
let activeReactions={}, activeReadReceipts={}, peerPresence=null, peerTyping=null;
let ownPresencePath='', presenceHeartbeat=null, ownPresenceConnected=false;
let typingPath='', typingIdleTimer=null, typingLastWrite=0, typingPulseBusy=false;
let seenSyncBusy=false, priorOwnSeenAt=null, receiptCacheReady=false;
let menuMessageId='', menuAnchor=null, detailsMessageId='';
let longPressTimer=null, longPressFired=false, peerTypingExpiryTimer=null;
const REACTION_EMOJIS=['❤️','😂','😮','😢','😡','👍'];

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

function applyTheme(name){
 root.dataset.theme=name;
 safeSet('g8code-message-theme',name);
 const icon=name==='dark'?'☾':'☼';
 const label=name==='dark'?'Switch to light mode':'Switch to dark mode';
 // Keep desktop/top and mobile chat-header controls in sync for both roles.
 for(const id of ['g8mTheme','g8mChatTheme']){
  const button=$(id);
  if(!button)continue;
  button.textContent=icon;
  button.title=label;
  button.setAttribute('aria-label',label);
 }
}
function inheritedTheme(){
 const saved=safeGet('g8code-message-theme');
 const teacherRoute=g8mTeacherEntry;
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
 for(const id of ['g8mTheme','g8mChatTheme'])$(id).hidden=locked;
 if(locked){applyTheme(settings.appAppearance==='dark'?'dark':settings.appAppearance==='light'?'light':(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));}
 else if(teacher){const a=safeGet('g8code.adminWorkspaceAppearance.v1');if(a==='dark'||a==='light')applyTheme(a);}
}
for(const id of ['g8mTheme','g8mChatTheme']){
 $(id).addEventListener('click',()=>{
  if(!$(id).hidden)applyTheme(root.dataset.theme==='dark'?'light':'dark');
 });
}
// G8Code V5.0 photo viewer handlers are installed below.

const studentPath = uid => `${BASE}/chats/${uid}`;
const summaryPath = uid => `${BASE}/summary/${uid}`;
function role(){return teacher?'teacher':'student';}
function roleDestination(){
 if(g8mTeacherShortcut) return 'index.html';
 return teacher?'admin-v2.html?g8mBack=overview':'index.html?g8mBack=student';
}
function leaveMessages(){
  stopTyping();
  if(sending||[...pendingPhotoJobs.values()].some(job=>job.inProgress)){
   status('A photo is still sending. Keep Messages open until it is confirmed.',true);return;
  }
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
  auth=getAuth(app);rtdb=getDatabase(app,window.MCS_FIREBASE_DATABASE_URL);
  onAuthStateChanged(auth,async account=>{
   stopTyping();closeReactionPicker();clearUnsubs(rootUnsubs);clearUnsubs(activeUnsubs);
   if(presenceHeartbeat){clearInterval(presenceHeartbeat);presenceHeartbeat=null;}
   ownPresencePath='';ownPresenceConnected=false;
   conversationMemory.clear();user=account;openedUid='';students.clear();summaries={};
   if(!account){
    if(g8mTeacherShortcut){showGate('Teacher Messages · Admin Code','Enter your existing teacher account password (Admin Code). Your Admin Dashboard will not open.',true);}
    else {showGate('Sign in to Messages',location.protocol==='file:'?'Local HTML files may not share Firebase login. Sign in here using your existing G8Code account, or use the deployed website.':'Your G8Code account is not signed in on this page. Use the same student or teacher credentials to continue.',true);}
    setConnection(false,'Sign in required');return;
   }
   $('g8mQuickLogin').hidden=true;
   teacher=isTeacher(account);
   // The login-page shortcut is teacher-only. A signed-in student cannot
   // open the teacher inbox by choosing this route; require teacher Auth.
   if(g8mTeacherShortcut && !teacher){
    showGate('Teacher Messages · Admin Code','A student session is active. Enter the teacher Admin Code to securely switch to the authorized teacher account.',true);
    setConnection(false,'Teacher sign-in required');return;
   }
   try{
    if(teacher){ profile={uid:account.uid,name:'ICT Teacher'};}
    else{
     // Load ONLY the RTDB Messages directory. Student Home mirrors its already
     // verified profile here, and Admin mirrors the cached tracker without
     // another Firestore scan. Normal Messages sign-in costs 0 Firestore reads.
     const entry=await get(ref(rtdb,`${BASE}/directory/${account.uid}`));
     const row=entry.val()||{};
     const studentEmail=String(account.email||'');
     const sidMatch=studentEmail.match(/^sid-([a-z0-9]+)(?:-r\d+)?@students\.mcsian\.app$/i);
     profile={uid:account.uid,name:short(row.name||account.displayName||'Student',100),
      studentId:short(row.studentId||sidMatch?.[1]||'',50),section:short(row.section||'Unassigned',100)};
     // Identity is still enforced by Firebase Auth + per-UID RTDB rules.
     if(row.accountStatus==='disabled')throw new Error('This student account is disabled.');
    }
    await initWorkspace();
    setupOwnPresence();
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
$('g8mLoginRole').value=g8mTeacherEntry?'teacher':'student';
if(g8mTeacherShortcut){
 // Admin Code mode is the SAME Firebase email/password sign-in used by Admin V2.
 // No code is put in an RTDB path, URL, or client-side comparison.
 $('g8mLoginRole').disabled=true;
 $('g8mLoginRole').hidden=true;
 document.querySelector('label[for="g8mLoginRole"]').hidden=true;
 $('g8mLoginIdentity').required=false;
 $('g8mLoginIdentity').disabled=true;
 $('g8mLoginIdentity').hidden=true;
 $('g8mLoginIdentityLabel').hidden=true;
 document.querySelector('label[for="g8mLoginPassword"]').textContent='Admin Code';
 $('g8mLoginPassword').placeholder='Enter your teacher account password';
 $('g8mLoginSubmit').textContent='Open Teacher Messages';
 root.dataset.entry='teacher-shortcut';
 $('g8mBack').href='index.html';
}
if(!g8mTeacherShortcut)$('g8mLoginRole').addEventListener('change',syncQuickLoginRole);
if(!g8mTeacherShortcut)syncQuickLoginRole();
$('g8mQuickLogin').addEventListener('submit',async event=>{
 event.preventDefault();
 if(!auth||!signInWithEmailAndPassword)return;
 const teacherLogin=g8mTeacherShortcut || $('g8mLoginRole').value==='teacher';
 const identity=g8mTeacherShortcut ? teacherEmails[0] : String($('g8mLoginIdentity').value||'').trim();
 const password=$('g8mLoginPassword').value;
 const feedback=$('g8mLoginError'), button=$('g8mLoginSubmit');
 feedback.hidden=true;
 if(g8mTeacherShortcut && !identity){feedback.textContent='No authorized teacher email is configured in firebase-config.js.';feedback.hidden=false;return;}
 if(!identity||!password){feedback.textContent='Enter your Admin Code.';feedback.hidden=false;return;}
 button.disabled=true;button.textContent=g8mTeacherShortcut?'Verifying Admin Code…':'Signing in…';
 try{
  let email=identity.toLowerCase();
  if(!teacherLogin){
   const key=identity.toUpperCase().replace(/[^A-Z0-9]/g,'').toLowerCase();
   if(!key || key.length>50)throw new Error('Please enter a valid Student ID.');
   email=`sid-${key}@students.mcsian.app`;
  }
  const credential=await signInWithEmailAndPassword(auth,email,password);
  if(g8mTeacherShortcut && !isTeacher(credential.user))throw new Error('This account is not authorized as the G8Code teacher.');
  $('g8mLoginPassword').value='';
 }catch(error){
  const initialCode=String(error.code||'');
  if(!teacherLogin && /invalid-credential|wrong-password|user-not-found/.test(initialCode)){
   const key=identity.toUpperCase().replace(/[^A-Z0-9]/g,'').toLowerCase();
   if(key){
    try{
     await ensureProjectFirestore();
     const snap=await getDoc(doc(firestore,window.MCS_FIREBASE_COLLECTION||'webCodeEditor',window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1','studentLoginRoutes',key));
     const route=snap.exists() ? (snap.data()||{}) : {};
     if(route.accountStatus==='disabled')throw new Error('This student account is disabled. Contact your teacher.');
     if(typeof route.authEmail==='string' && route.authEmail.includes('@') && route.authEmail.toLowerCase()!==`sid-${key}@students.mcsian.app`){
      await signInWithEmailAndPassword(auth,route.authEmail.trim().toLowerCase(),password);
      $('g8mLoginPassword').value='';return;
     }
    }catch(routeError){
     if(/disabled/i.test(String(routeError.message)))error=routeError;
     else console.info('Legacy account route unavailable; default sign-in result retained.',routeError);
    }
   }
  }
  console.warn('G8Code Messages sign-in failed:',error);
  const code=String(error.code||'');
  feedback.textContent=(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found'))?
   (g8mTeacherShortcut?'Invalid Admin Code. Use the existing teacher account password.':'Student ID/email or password is incorrect. Please use your existing G8Code credentials.'):friendlyError(error);
  feedback.hidden=false;
 }finally{button.disabled=false;button.textContent=g8mTeacherShortcut?'Open Teacher Messages':'Sign in to Messages';}
});
function friendlyError(error){let e=String(error?.message||error||'Could not connect.');
 if(/permission.denied|permission_denied|permission denied/i.test(e))return 'Firebase permissions do not allow Messages yet. Deploy the supplied Realtime Database rules and check your account.';
 if(/drive|workspace|photo|attachment/i.test(e) && /configure|unavailable|not set/i.test(e))return 'Google Workspace Drive is not configured yet. Set up the private Drive Apps Script bridge before sending photos.';
 if(/network|offline|fetch/i.test(e))return 'Connection failed. Check your internet connection, then reopen Messages.';
 return e;
}
async function initWorkspace(){
 gate.hidden=true;workspace.hidden=false;workspace.classList.toggle('student',!teacher);root.dataset.mode=role();syncThemeForRole();
 $('g8mBack').href=roleDestination();
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
  // RTDB directory contains all students after Student Home/Admin tracker
  // mirroring. It does NOT initiate a Firestore getDocs() collection scan.
  rootUnsubs.push(onValue(ref(rtdb,`${BASE}/directory`),snap=>{
   const records=snap.val()||{};
   students.clear();
   for(const [uid,record] of Object.entries(records)){
    if(!/^[A-Za-z0-9_-]{5,128}$/.test(uid)||!record||typeof record!=='object')continue;
    students.set(uid,{uid,name:short(record.name||'Student',100),
     studentId:short(record.studentId||'',50),section:short(record.section||'Unassigned',100),accountStatus:String(record.accountStatus||'active')});
   }
   renderSections();renderStudents();
   if(requestedUid&&!openedUid&&(students.has(requestedUid)||summaries[requestedUid]))openChat(requestedUid);
  },error=>{
   console.warn('Messages RTDB directory unavailable:',error);
   status('Student directory temporarily unavailable; existing chats still work.',true);
  }));
 }else{
  const uid=user.uid;
  $('g8mChatName').textContent='ICT Teacher';$('g8mChatMeta').textContent='Official private conversation';$('g8mChatAvatar').textContent='T';
  openedUid=uid;
  rootUnsubs.push(onValue(ref(rtdb,summaryPath(uid)),snap=>{summaries[uid]=snap.val()||{};setConnection(true,'Live');},err=>{status(friendlyError(err),true);setConnection(false,'Connection issue');}));
  openChat(uid);
 }
}
// V4.9: Directory data arrives via the RTDB listener in initWorkspace.
// Keep this alias as a no-op for older integration hooks: no Firestore reads.
async function loadStudentDirectory(){ return [...students.values()]; }
// V5.9: A student is ONE inbox entry, even if old/current Auth UIDs differ.
// Preserve EACH UID conversation and never combine their private messages or
// infer identity from a matching name alone. Student ID is the grouping key.
function normalizedInboxStudentId(raw){
 const id=String(raw||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
 return id.length>=5 && id.length<=50 && !/^(?:0+|UNKNOWN|NONE|NA|STUDENT|TEMP|TEST)$/.test(id)?id:'';
}
function allPeople(){
 const merged=new Map(students);
 Object.keys(summaries).forEach(uid=>{if(!merged.has(uid))merged.set(uid,person(uid));});
 const byIdentity=new Map();
 for(const record of merged.values()){
  const uid=String(record.uid||'');if(!uid)continue;
  const sid=normalizedInboxStudentId(record.studentId||summaries[uid]?.studentId);
  const key=sid?`sid:${sid}`:`uid:${uid}`;
  if(!byIdentity.has(key))byIdentity.set(key,[]);
  byIdentity.get(key).push({...record,uid});
 }
 const result=[];
 for(const [key,linked] of byIdentity){
  // The newest ACTUAL conversation wins for row ordering, but the identity is
  // from a real directory record, not the arbitrary latest chat sender name.
  const ordered=linked.slice().sort((a,b)=>{
   const aActive=students.get(a.uid)?.accountStatus==='disabled'?0:1;
   const bActive=students.get(b.uid)?.accountStatus==='disabled'?0:1;
   return bActive-aActive || Number(summaries[b.uid]?.lastAtMs||0)-Number(summaries[a.uid]?.lastAtMs||0) || a.uid.localeCompare(b.uid);
  });
  const official=ordered.find(x=>students.has(x.uid)&&x.name&&x.name!=='Student')||ordered[0];
  const latest=linked.slice().sort((a,b)=>Number(summaries[b.uid]?.lastAtMs||0)-Number(summaries[a.uid]?.lastAtMs||0))[0];
  const allUids=ordered.map(x=>x.uid);
  let unreadCount=0,checkingCount=0;
  for(const uid of allUids){unreadCount+=unread(summaries[uid]);checkingCount+=needsChecking(uid);}
  const representative=official||ordered[0];
  result.push({
   uid:representative.uid, uids:allUids, identityKey:key,
   name:representative.name||'Student',studentId:representative.studentId||latest.studentId||'',
   section:studentSection(representative.section==='Unassigned' && latest.section ? latest : representative),
   unreadCount, checkingCount,
   lastAtMs:Math.max(0,...allUids.map(uid=>Number(summaries[uid]?.lastAtMs||0))),
   lastText:String(summaries[latest.uid]?.lastText || ''),
  });
 }
 return result;
}
function groupForUid(uid){return allPeople().find(p=>p.uids.includes(uid))||null;}
function selectGroupThread(group){
 // One clean row with no legacy-account selector. Open unread conversation first;
 // otherwise choose the most recently active thread, falling back to the
 // preferred/official UID. Underlying UID histories remain untouched in RTDB.
 const unreadThreads=group.uids.filter(uid=>unread(summaries[uid])>0);
 const candidates=unreadThreads.length?unreadThreads:group.uids.filter(uid=>Number(summaries[uid]?.lastAtMs||0)>0);
 return candidates.slice().sort((a,b)=>Number(summaries[b]?.lastAtMs||0)-Number(summaries[a]?.lastAtMs||0))[0]||group.uid;
}
function matchesFilter(p){
 if(filter==='unread' && !p.unreadCount)return false;
 if(filter==='checking' && !p.checkingCount)return false;
 if(search){
  const fields=[p.name,p.studentId,p.section,p.lastText];
  for(const uid of p.uids)fields.push(summaries[uid]?.lastText,students.get(uid)?.name,students.get(uid)?.studentId);
  if(!fields.join(' ').toLowerCase().includes(search))return false;
 }
 return true;
}
function renderSections(){if(!teacher)return;
 const rootList=$('g8mSectionList');rootList.replaceChildren();const people=allPeople().filter(matchesFilter);
 const counts=new Map();
 for(const p of people){const name=studentSection(p);const obj=counts.get(name)||{name,people:0,unread:0,checking:0};obj.people++;obj.unread+=p.unreadCount;obj.checking+=p.checkingCount;counts.set(name,obj);}
 const rows=[{name:'*',label:'All Sections',people:people.length,unread:[...counts.values()].reduce((s,v)=>s+v.unread,0)},...([...counts.values()].sort((a,b)=>b.unread-a.unread || a.name.localeCompare(b.name)).map(r=>({...r,label:r.name})))];
 const tablet=$('g8mTabletSectionSelect');if(tablet){tablet.replaceChildren();rows.forEach(r=>{const o=document.createElement('option');o.value=r.name;o.textContent=r.label;tablet.append(o);});tablet.value=rows.some(r=>r.name===currentSection)?currentSection:'*';}
 // Unread counts are MESSAGE counts; unlike the student total, they are summed
 // across all linked UID conversations so the teacher doesn't miss older chats.
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
 people.sort((a,b)=> b.unreadCount-a.unreadCount || b.lastAtMs-a.lastAtMs || a.name.localeCompare(b.name));
 $('g8mStudentCount').textContent=`${people.length} student${people.length===1?'':'s'}`;
 const list=$('g8mStudentList');list.replaceChildren();
 people.forEach(p=>{
  const row=textEl('button','g8m-student-row'+(p.uids.includes(openedUid)?' active':''),'');row.type='button';
  row.append(textEl('span','g8m-student-avatar',iconLetter(p)));
  const copy=textEl('span','g8m-row-copy','');copy.append(textEl('strong','',p.name));
  copy.append(textEl('small','',short(p.lastText||p.studentId||'Start a conversation',42)));
  row.append(copy);
  if(p.unreadCount)row.append(textEl('span','g8m-bubble-count',p.unreadCount>99?'99+':p.unreadCount));
  row.addEventListener('click',()=>{
   const currentIsGroup=p.uids.includes(openedUid);
   const otherUnread=p.uids.some(uid=>uid!==openedUid&&unread(summaries[uid])>0);
   const keepCurrent=currentIsGroup&&(!otherUnread||unread(summaries[openedUid])>0);
   openChat(keepCurrent?openedUid:selectGroupThread(p));
  });list.append(row);
 });
 if(!people.length)list.append(notice('No students match this filter. Try All or another section.'));
}
function switchMobile(view){stopLongPressTimer();mobileView=view;workspace.dataset.mobileView=view;root.dataset.mobileChat=(view==='chat'?'true':'false');closeReactionPicker();}
$('g8mSectionBack').addEventListener('click',()=>{if(!sending)switchMobile('sections');});
$('g8mChatBack').addEventListener('click',()=>{if(sending)return;if(teacher)switchMobile('students');else leaveMessages();});
$('g8mSectionSearch').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();renderSections();renderStudents();});
$('g8mTabletSectionSelect').addEventListener('change',e=>{currentSection=e.target.value;renderSections();renderStudents();});
$('g8mGlobalFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;for(const x of $('g8mGlobalFilters').querySelectorAll('button'))x.classList.toggle('active',x===b);renderSections();renderStudents();});
function openChat(uid){
 if(sending){status('Your message is still sending. Finish the upload before switching conversations.',true);return;}
 if(teacher && !students.has(uid) && !summaries[uid])return;
 if(uid===openedUid && activeUnsubs.length){switchMobile('chat');return;}
 stopTyping();closeReactionPicker();
 if(openedUid && activeMessages.length){
  conversationMemory.delete(openedUid);
  conversationMemory.set(openedUid,{messages:activeMessages.slice(-120),older:olderMessages.slice(-80),acks:{...activeAcks},seenAt,hasOlder});
  if(conversationMemory.size>10)conversationMemory.delete(conversationMemory.keys().next().value);
 }
 clearUnsubs(activeUnsubs);openedUid=uid;lastSnapshotKey='';activeReactions={};activeReadReceipts={};peerPresence=null;peerTyping=null;priorOwnSeenAt=null;seenSyncBusy=false;receiptCacheReady=false;updateTypingIndicator();updatePresenceLine();
 const warm=conversationMemory.get(uid);
 activeMessages=warm?.messages?.slice()||[];olderMessages=warm?.older?.slice()||[];
 hasOlder=warm?.hasOlder||false;olderLoading=false;activeAcks=warm?.acks||{};seenAt=warm?.seenAt||0;reply=null;renderReply();
 if(teacher){const p=person(uid),group=groupForUid(uid);$('g8mChatName').textContent=group?.name||p.name;$('g8mChatMeta').textContent=[group?.section||p.section,group?.studentId||p.studentId].filter(Boolean).join(' · ');$('g8mChatAvatar').textContent=iconLetter(group||p);$('g8mComposer').hidden=false;renderStudents();}
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
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/reactions`),snap=>{if(uid!==openedUid)return;activeReactions=snap.val()||{};updateReactionBadges();updateDetails();},err=>console.warn('Reactions listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/readReceipts`),snap=>{if(uid!==openedUid)return;activeReadReceipts=snap.val()||{};receiptCacheReady=true;refreshSeenLabels();updateDetails();},err=>console.warn('Read receipt listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/typing/${teacher?'student':'teacher'}`),snap=>{if(uid!==openedUid)return;peerTyping=snap.val();updateTypingIndicator();},err=>console.warn('Typing listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,teacher?`${BASE}/presence/students/${uid}`:`${BASE}/presence/teacher`),snap=>{if(uid!==openedUid)return;peerPresence=snap.val();updatePresenceLine();},err=>console.warn('Presence listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/acks`),snap=>{if(uid!==openedUid)return;activeAcks=snap.val()||{};renderMessages();},err=>status(friendlyError(err),true)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/seen/${teacher?'student':'teacher'}`),snap=>{seenAt=Number(snap.val()||0);refreshSeenLabels();updateDetails();}));
}
async function markSeen(uid){
 if(uid!==openedUid||document.visibilityState!=='visible'||seenSyncBusy||!user)return;
 seenSyncBusy=true;
 const path=studentPath(uid);
 try{
  // Preserve historical read state: don't invent "first seen" timestamps for old
  // messages whose conversation-level Seen timestamp predates V4.5.
  if(priorOwnSeenAt===null){
   const old=await get(ref(rtdb,`${path}/seen/${role()}`));
   if(uid!==openedUid)return;
   priorOwnSeenAt=Number(old.val()||0);
  }
  // Messages can arrive before the first receipt listener snapshot. Load the
  // receipt set before writing immutable first-seen values, otherwise a delayed
  // listener could cause a rejected batch for an already-read message.
  if(!receiptCacheReady){
   const saved=await get(ref(rtdb,`${path}/readReceipts`));
   if(uid!==openedUid)return;
   activeReadReceipts=saved.val()||{};
   receiptCacheReady=true;
  }
  const unreadItems=activeMessages.filter(msg=>msg.senderUid!==user.uid && messageTime(msg)>priorOwnSeenAt && !activeReadReceipts[msg.id]?.[role()]);
  if(unreadItems.length){
   const patch={};for(const msg of unreadItems.slice(0,120))patch[`${msg.id}/${role()}`]=serverTimestamp();
   try{await update(ref(rtdb,`${path}/readReceipts`),patch);}
   catch(error){console.warn('A per-message first-seen receipt may already exist on another device:',error);}
   // Even when another session recorded the precise receipt first, the
   // conversation-level Seen state must still advance below.
  }
  const at=Date.now();
  await set(ref(rtdb,`${path}/seen/${role()}`),serverTimestamp());
  priorOwnSeenAt=at;
  await set(ref(rtdb,`${summaryPath(uid)}/${teacher?'unreadTeacher':'unreadStudent'}`),0);
 }catch(error){console.warn('Read receipt not yet confirmed:',error);}
 finally{seenSyncBusy=false;}
}
// ——— V4.5 — per-message reactions, first-view receipts, live typing and presence ———
function peerRole(){return teacher?'student':'teacher';}
function messageById(id){return [...activeMessages,...olderMessages].find(msg=>msg.id===String(id));}
function absoluteTime(value){
 const n=Number(value);if(!Number.isFinite(n)||n<=0)return 'Unavailable';
 return new Intl.DateTimeFormat('en-PH',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit',timeZone:'Asia/Manila'}).format(new Date(n));
}
function relativeActivity(value){
 const ms=Date.now()-Number(value||0);
 if(!Number.isFinite(ms)||ms<0||!value)return 'Last active unavailable';
 if(ms<60000)return 'Active just now';
 if(ms<3600000)return `Active ${Math.floor(ms/60000)}m ago`;
 if(ms<86400000)return `Active ${Math.floor(ms/3600000)}h ago`;
 if(ms<172800000)return 'Active yesterday';
 return `Active ${Math.floor(ms/86400000)}d ago`;
}
function updatePresenceLine(){
 const line=$('g8mChatPresence');if(!line)return;
 if(!openedUid){line.textContent='Select a conversation';line.classList.remove('online');return;}
 const seen=Number(peerPresence?.lastAtMs||0);
 const online=peerPresence?.online===true && seen>0 && Date.now()-seen<95000;
 line.textContent=online?'● Active now':(seen?relativeActivity(seen):'Activity status unavailable');
 line.classList.toggle('online',online);
}
function ownPresenceRef(){return teacher?`${BASE}/presence/teacher`:`${BASE}/presence/students/${user.uid}`;}
async function publishPresence(online){
 if(!user||!rtdb)return;
 const path=ownPresenceRef();
 try{
  if(online){
   await onDisconnect(ref(rtdb,path)).set({uid:user.uid,online:false,lastAtMs:serverTimestamp()});
  }
  await set(ref(rtdb,path),{uid:user.uid,online:!!online,lastAtMs:serverTimestamp()});
 }catch(error){console.warn('Presence update:',error);}
}
function setupOwnPresence(){
 if(!user||!rtdb)return;
 ownPresencePath=ownPresenceRef();
 rootUnsubs.push(onValue(ref(rtdb,'.info/connected'),snap=>{
  ownPresenceConnected=snap.val()===true;
  if(ownPresenceConnected && document.visibilityState==='visible')void publishPresence(true);
 }));
 if(presenceHeartbeat)clearInterval(presenceHeartbeat);
 presenceHeartbeat=setInterval(()=>{
  if(ownPresenceConnected&&document.visibilityState==='visible')void publishPresence(true);
  updatePresenceLine();updateTypingIndicator();
 },30000);
}
document.addEventListener('visibilitychange',()=>{
 if(!user||!rtdb)return;
 if(document.visibilityState==='hidden'){stopTyping();void publishPresence(false);}
 else {if(ownPresenceConnected)void publishPresence(true);if(openedUid)void markSeen(openedUid);}
});
function updateTypingIndicator(){
 const area=$('g8mTypingIndicator');if(!area)return;
 if(peerTypingExpiryTimer){clearTimeout(peerTypingExpiryTimer);peerTypingExpiryTimer=null;}
 const expires=Number(peerTyping?.expiresAtMs||0);
 const visible=!!openedUid && !!peerTyping && peerTyping.uid!==user?.uid && expires>Date.now();
 area.hidden=!visible;
 if(visible){
  $('g8mTypingText').textContent=`${teacher?'Student':'Teacher'} is typing…`;
  peerTypingExpiryTimer=setTimeout(updateTypingIndicator,Math.max(40,Math.min(10000,expires-Date.now()+30)));
 }
}
function stopTyping(){
 if(typingIdleTimer){clearTimeout(typingIdleTimer);typingIdleTimer=null;}
 const old=typingPath;typingPath='';typingLastWrite=0;
 if(old&&rtdb){remove(ref(rtdb,old)).catch(error=>console.warn('Typing cleanup:',error));}
}
function pulseTyping(){
 if(!user||!rtdb||!openedUid||document.visibilityState!=='visible'||sending)return;
 if(typingIdleTimer)clearTimeout(typingIdleTimer);
 typingIdleTimer=setTimeout(stopTyping,3200);
 const path=`${studentPath(openedUid)}/typing/${role()}`;
 const t=Date.now();
 if(typingPulseBusy||(typingPath===path&&t-typingLastWrite<1900))return;
 typingPath=path;typingLastWrite=t;typingPulseBusy=true;
 (async()=>{
  try{
   await onDisconnect(ref(rtdb,path)).remove();
   if(typingPath===path)await set(ref(rtdb,path),{uid:user.uid,atMs:serverTimestamp(),expiresAtMs:Date.now()+6500});
  }catch(error){console.warn('Typing indicator:',error);}
  finally{typingPulseBusy=false;}
 })();
}
function seenLabelFor(msg){
 const exact=Number(activeReadReceipts?.[msg.id]?.[peerRole()]||0);
 const fallback=Number(seenAt||0)>=messageTime(msg) && messageTime(msg)>0;
 return exact>0||fallback?'✓✓ Seen':'✓ Sent';
}
function refreshSeenLabels(){
 for(const node of $('g8mMessages')?.querySelectorAll('.g8m-message.own')||[]){
  const m=messageById(node.dataset.messageId);
  const el=node.querySelector('.g8m-seen-label');if(m&&el)el.textContent=seenLabelFor(m);
 }
}
function reactionSummary(id){
 const raw=activeReactions[id]||{};
 const entries=Object.entries(raw).filter(([uid,emoji])=>uid && REACTION_EMOJIS.includes(emoji));
 const emojis=[...new Set(entries.map(([uid,emoji])=>emoji))];
 return {entries,emojis,count:entries.length,own:raw[user?.uid]||''};
}
function updateOneReactionBadge(node,id){
 const badge=node.querySelector('.g8m-reaction-chip');if(!badge)return;
 const r=reactionSummary(id);badge.hidden=!r.count;
 badge.textContent=r.emojis.slice(0,3).join('')+(r.count>1?' '+r.count:'');
 badge.classList.toggle('mine',!!r.own);
 node.classList.toggle('has-reaction',!!r.count);
 badge.title=r.count?`${r.count} reaction${r.count!==1?'s':''}`:'React';
}
function updateReactionBadges(){
 for(const node of $('g8mMessages')?.querySelectorAll('.g8m-message[data-message-id]')||[])updateOneReactionBadge(node,node.dataset.messageId);
}
// V4.8: Old photo-only messages stored an auto-caption in RTDB. Do not
// show that generated label as a chat bubble. Genuine student-written
// captions are preserved, and existing RTDB records remain untouched.
function visibleMessageText(msg){
 const raw=typeof msg?.text==='string'?msg.text:'';
 const legacy=raw.trim();
 if(msg?.type==='image' && (legacy==='📷 Photo attachment' || legacy==='📸 Photo attachment'))return '';
 return raw;
}
function messageReferenceText(msg){
 if(msg?.type==='project')return String(msg.projectName||'Shared project');
 return visibleMessageText(msg)||(msg?.type==='image'?'Photo':'Message');
}
function replyToMessage(id){
 const msg=messageById(id);if(!msg)return;
 reply={id:msg.id,text:messageReferenceText(msg)};
 renderReply();closeReactionPicker();$('g8mTextInput').focus();
}
// V5.6: Start the visible focus pulse AFTER the quoted message reaches
// the chat viewport, not while the browser is still smooth-scrolling there.
// Keep the focus state through transient Seen/typing re-renders.
let quoteJumpToken=0,quoteFocusId='',quoteFocusUntil=0,quoteFocusTimer=null;
function emphasizeOriginalMessage(id,request=quoteJumpToken){
 const feed=$('g8mMessages');
 if(!feed||!messageNode(id))return false;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const centeredDistance=()=>{
  const row=messageNode(id);
  if(!row||!row.isConnected)return null;
  const rect=row.getBoundingClientRect(),bounds=feed.getBoundingClientRect();
  // For tall photos, position the top in view instead of zooming offscreen.
  const top=rect.height>bounds.height*.75?rect.top-bounds.top-18:(rect.top+rect.height/2)-(bounds.top+bounds.height/2);
  return top;
 };
 const initial=centeredDistance();if(initial===null)return false;
 feed.scrollTo({top:feed.scrollTop+initial,behavior:reduced?'auto':'smooth'});
 const started=performance.now();
 let stableFrames=0,previous=Infinity;
 const check=()=>{
  if(request!==quoteJumpToken)return;
  const distance=centeredDistance();if(distance===null)return;
  if(Math.abs(previous-distance)<1.5)stableFrames++;else stableFrames=0;
  previous=distance;
  if(reduced||Math.abs(distance)<22||stableFrames>=5||performance.now()-started>1500){
   const target=messageNode(id);if(!target)return;
   quoteFocusId=id;quoteFocusUntil=Date.now()+1550;
   target.classList.remove('g8m-jump-focus');void target.offsetWidth;
   target.classList.add('g8m-jump-focus');
   clearTimeout(quoteFocusTimer);
   quoteFocusTimer=setTimeout(()=>{
    if(quoteFocusId===id){quoteFocusId='';quoteFocusUntil=0;}
    messageNode(id)?.classList.remove('g8m-jump-focus');
   },1550);
   return;
  }
  requestAnimationFrame(check);
 };
 requestAnimationFrame(check);
 return true;
}
async function jumpToQuotedMessage(id){
 const target=String(id||'').trim(),uid=openedUid;
 if(!uid||!target||!/^[A-Za-z0-9_-]{6,120}$/.test(target)){
  status('Original message is unavailable.',true);return;
 }
 const request=++quoteJumpToken;
 if(messageNode(target)){emphasizeOriginalMessage(target,request);return;}
 status('Finding the original message…');
 try{
  const snapshot=await get(ref(rtdb,`${studentPath(uid)}/messages/${target}`));
  if(request!==quoteJumpToken||uid!==openedUid)return;
  if(!snapshot.exists()){status('Original message is unavailable.',true);return;}
  const found={id:target,...(snapshot.val()||{})};
  if(!messageById(target)){
   olderMessages=[...olderMessages,found].sort(compareMessages);
   if(olderMessages.length>160)olderMessages=[found,...olderMessages.filter(x=>x.id!==target).slice(-159)].sort(compareMessages);
  }
  renderMessages();
  requestAnimationFrame(()=>{if(request===quoteJumpToken)emphasizeOriginalMessage(target,request);});
  status('Jumped to original message.');
 }catch(error){status(`Could not open the original: ${friendlyError(error)}`,true);}
}

// V5.7 — focused message actions. Desktop hover remains unchanged; a
// real long press/right click produces a crisp selected bubble over a blurred
// conversation. The picker is positioned from the actual bubble's DOM bounds,
// never the mobile display:contents action-target (which has a zero-size rect).
const reactionPicker=$('g8mReactionPicker'),detailsOverlay=$('g8mMessageDetails');
const focusOverlay=$('g8mMessageFocus'),focusShell=$('g8mFocusShell');
let focusMessageId='', focusScrollY=0;
function stopLongPressTimer(){if(longPressTimer){clearTimeout(longPressTimer);longPressTimer=null;}}
function clearFocusMode(){
 focusMessageId='';focusOverlay.hidden=true;focusShell.replaceChildren();
 focusShell.removeAttribute('style');
}
function closeReactionPicker(){
 reactionPicker.hidden=true;menuMessageId='';menuAnchor=null;
 clearFocusMode();
}
function actualBubbleAnchor(item){
 if(!item)return null;
 // On mobile the action-target uses display:contents, so its rect is empty.
 // The real text/photo/project element always has meaningful layout bounds.
 return item.querySelector('.g8m-action-target > .g8m-photo-stack') ||
  item.querySelector('.g8m-action-target > .g8m-photo-grid') ||
  item.querySelector('.g8m-action-target > .g8m-project-card') ||
  item.querySelector('.g8m-action-target > .g8m-text') ||
  item.querySelector('.g8m-action-target > .g8m-quoted') ||
  item.querySelector('.g8m-bubble-anchor > .g8m-photo-grid') ||
  item.querySelector('.g8m-bubble-anchor > .g8m-text') ||
  item.querySelector('.g8m-bubble-anchor');
}
function validAnchorRect(anchor){
 const rect=anchor?.getBoundingClientRect();
 return rect && rect.width>=2 && rect.height>=2 ? rect : null;
}
function focusOnMessage(id){
 const item=messageNode(id), visual=actualBubbleAnchor(item);
 const bubble=item?.querySelector('.g8m-bubble-anchor');
 if(!item||!visual||!bubble)return null;
 const visualRect=validAnchorRect(visual), bubbleRect=validAnchorRect(bubble);
 if(!visualRect||!bubbleRect)return null;
 focusOverlay.hidden=false;focusMessageId=id;
 focusShell.replaceChildren();focusShell.className='g8m-message g8m-focus-shell'+(item.classList.contains('own')?' own':'')+(item.classList.contains('has-reaction')?' has-reaction':'');
 const copy=bubble.cloneNode(true);
 // The floating menu owns all interactions, not stale cloned button handlers.
 copy.querySelectorAll('.g8m-hover-actions').forEach(node=>node.remove());
 copy.querySelectorAll('button,a,input').forEach(node=>{node.tabIndex=-1;node.setAttribute('aria-hidden','true');});
 copy.style.width=`${Math.ceil(bubbleRect.width)}px`;
 const originalWidth=getComputedStyle(bubble).getPropertyValue('--g8m-action-width');
 if(originalWidth)copy.style.setProperty('--g8m-action-width',originalWidth);
 focusShell.append(copy);
 // Keep the highlight at the message location where possible, but leave safe
 // room for the context menu, even near a sticky header/composer or a tall photo.
 const vh=window.visualViewport?.height || innerHeight;
 const vw=innerWidth;
 const menuH=Math.max(100,reactionPicker.offsetHeight||111);
 const safe=12;
 const scale=Math.min(1,(vw-safe*2)/bubbleRect.width,(vh-menuH-3*safe)/bubbleRect.height);
 const w=bubbleRect.width*scale,h=bubbleRect.height*scale;
 let x=Math.max(safe,Math.min(vw-w-safe,bubbleRect.left));
 let y=Math.max(safe,Math.min(vh-h-safe,bubbleRect.top));
 // If the bubble plus action menu cannot fit above/below at the original y,
 // reposition *the clone*, never the real message or the conversation scroll.
 if(y-menuH-safe<safe && y+h+menuH+safe>vh-safe){
  y=Math.max(safe,Math.min(vh-h-menuH-2*safe,(vh-h-menuH-safe)/2));
 }
 focusShell.style.left=`${Math.round(x)}px`;
 focusShell.style.top=`${Math.round(y)}px`;
 focusShell.style.width=`${Math.ceil(bubbleRect.width)}px`;
 focusShell.style.transform=`scale(${Math.max(.1,scale)})`;
 focusShell.style.transformOrigin='top left';
 focusScrollY=$('g8mMessages')?.scrollTop||0;
 return {left:x,top:y,right:x+w,bottom:y+h,width:w,height:h};
}
function openReactionPicker(id,anchor,options={}){
 if(!messageById(id))return;
 // Opening a second picker dismisses the previous focus clone cleanly.
 clearFocusMode();
 menuMessageId=id;
 reactionPicker.hidden=false;
 const emoji=activeReactions[id]?.[user?.uid]||'';
 for(const b of reactionPicker.querySelectorAll('[data-g8m-emoji]'))b.classList.toggle('selected',b.dataset.g8mEmoji===emoji);
 const focus=options.focus===true;
 const item=messageNode(id);
 const selected=focus ? focusOnMessage(id) : null;
 const realAnchor=(anchor && validAnchorRect(anchor) ? anchor : actualBubbleAnchor(item));
 menuAnchor=realAnchor;
 const r=selected||validAnchorRect(realAnchor)||{top:110,left:16,width:180,bottom:150,right:196};
 const width=reactionPicker.offsetWidth,height=reactionPicker.offsetHeight;
 const vw=innerWidth,vh=window.visualViewport?.height || innerHeight;
 // Align the picker close to the bubble edge, not the row center or screen top.
 // A phone does not have room for 280px of controls beside a 200px photo, so
 // position immediately above/below that exact photo with 6px separation.
 const isOwn=item?.classList.contains('own');
 let left=isOwn ? r.right-width : r.left;
 left=Math.max(8,Math.min(vw-width-8,left));
 let top=r.top-height-7;
 if(top<8)top=r.bottom+7;
 if(top+height>vh-8)top=Math.max(8,r.top-height-7);
 top=Math.max(8,Math.min(vh-height-8,top));
 reactionPicker.style.left=`${Math.round(left)}px`;
 reactionPicker.style.top=`${Math.round(top)}px`;
 reactionPicker.dataset.focusMode=focus?'true':'false';
}
$('g8mFocusBackdrop').addEventListener('pointerdown',event=>{
 event.preventDefault();event.stopPropagation();closeReactionPicker();
});
async function reactToMessage(id,emoji){
 if(!openedUid||!user||!REACTION_EMOJIS.includes(emoji))return;
 const uid=openedUid, refPath=ref(rtdb,`${studentPath(uid)}/reactions/${id}/${user.uid}`);
 const old=activeReactions[id]?.[user.uid]||'';
 closeReactionPicker();
 try{
  if(old===emoji)await remove(refPath);else await set(refPath,emoji);
 }catch(error){status(`Could not save reaction: ${friendlyError(error)}`,true);}
}
reactionPicker.addEventListener('click',event=>{
 const emojiButton=event.target.closest('[data-g8m-emoji]');
 if(emojiButton&&menuMessageId)void reactToMessage(menuMessageId,emojiButton.dataset.g8mEmoji);
});
$('g8mPickerReply').addEventListener('click',()=>{if(menuMessageId)replyToMessage(menuMessageId);});
$('g8mPickerDetails').addEventListener('click',()=>{if(menuMessageId)openDetailsFor(menuMessageId);});
function openDetailsFor(id){
 if(!messageById(id))return;
 detailsMessageId=id;closeReactionPicker();updateDetails();detailsOverlay.hidden=false;
 $('g8mDetailsClose').focus();
}
function updateDetails(){
 if(!detailsMessageId)return;
 const msg=messageById(detailsMessageId);if(!msg)return;
 const own=msg.senderUid===user?.uid;
 $('g8mDetailsPreview').textContent=short(messageReferenceText(msg),260);
 $('g8mDetailsSent').textContent=absoluteTime(msg.createdAtMs);
 $('g8mDetailsSeenLabel').textContent=own?`Seen by ${teacher?'Student':'Teacher'}`:'Seen by you';
 const exact=Number(activeReadReceipts[detailsMessageId]?.[own?peerRole():role()]||0);
 const oldSeen=own?Number(seenAt||0)>=messageTime(msg)&&messageTime(msg)>0:Number(priorOwnSeenAt||0)>=messageTime(msg)&&messageTime(msg)>0;
 $('g8mDetailsSeen').textContent=exact?absoluteTime(exact):(oldSeen?'Previously seen · exact time not recorded':'Not yet seen');
 const r=reactionSummary(detailsMessageId);
 $('g8mDetailsReactions').textContent=r.count?r.entries.map(([uid,emoji])=>`${emoji} ${uid===user.uid?'You':teacher?'Student':'Teacher'}`).join(' · '):'None';
}
function closeDetails(){detailsOverlay.hidden=true;detailsMessageId='';}
$('g8mDetailsClose').addEventListener('click',closeDetails);
detailsOverlay.addEventListener('click',event=>{if(event.target===detailsOverlay)closeDetails();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeReactionPicker();if(!detailsOverlay.hidden)closeDetails();}});
document.addEventListener('pointerdown',event=>{
 if(!reactionPicker.hidden&&!reactionPicker.contains(event.target)&&!event.target.closest('.g8m-hover-actions,.g8m-reaction-chip,.g8m-focus-shell'))closeReactionPicker();
});
$('g8mMessages').addEventListener('scroll',()=>{if(!reactionPicker.hidden)closeReactionPicker();},{passive:true});
function installLongPress(item,id){
 let x=0,y=0,pressPointer=null;
 const anchor=()=>actualBubbleAnchor(item)||item;
 const endPress=()=>{
  stopLongPressTimer();item.classList.remove('g8m-longpress-armed');pressPointer=null;
  if(longPressFired)setTimeout(()=>{longPressFired=false;},450);
 };
 item.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  if(event.target.closest('.g8m-hover-actions,.g8m-msg-meta,.g8m-reaction-chip'))return;
  x=event.clientX;y=event.clientY;longPressFired=false;pressPointer=event.pointerId;
  stopLongPressTimer();item.classList.add('g8m-longpress-armed');
  longPressTimer=setTimeout(()=>{
   longPressTimer=null;longPressFired=true;item.classList.remove('g8m-longpress-armed');
   openReactionPicker(id,anchor(),{focus:true});
   setTimeout(()=>{longPressFired=false;},650);
   if(navigator.vibrate)try{navigator.vibrate(12);}catch(_){}
  },470);
 });
 item.addEventListener('pointermove',event=>{
  if(pressPointer!==event.pointerId)return;
  if(Math.abs(event.clientX-x)>12||Math.abs(event.clientY-y)>12){
   stopLongPressTimer();item.classList.remove('g8m-longpress-armed');
  }
 });
 for(const evt of ['pointerup','pointercancel','pointerleave'])item.addEventListener(evt,endPress);
 item.addEventListener('contextmenu',event=>{
  if(event.target.closest('.g8m-msg-meta,.g8m-hover-actions'))return;
  event.preventDefault();stopLongPressTimer();item.classList.remove('g8m-longpress-armed');
  longPressFired=true;openReactionPicker(id,anchor(),{focus:true});
  setTimeout(()=>{longPressFired=false;},650);
 });
 item.addEventListener('click',event=>{
  if(longPressFired&&!event.target.closest('.g8m-msg-meta,.g8m-hover-actions,.g8m-reaction-chip')){
   event.preventDefault();event.stopImmediatePropagation();longPressFired=false;
  }
 },true);
}
function syncChatViewport(){
 if(!window.visualViewport)return;
 root.style.setProperty('--g8m-visual-height',`${Math.round(window.visualViewport.height)}px`);
 root.style.setProperty('--g8m-visual-top',`${Math.max(0,Math.round(window.visualViewport.offsetTop||0))}px`);
}
if(window.visualViewport){visualViewport.addEventListener('resize',syncChatViewport);visualViewport.addEventListener('scroll',syncChatViewport);}
window.addEventListener('resize',syncChatViewport);
// A rotated phone/tablet changes the selected bubble coordinates. Dismiss the
// temporary focus rather than leaving actions floating at an old position.
window.addEventListener('resize',()=>{if(focusMessageId)closeReactionPicker();});
syncChatViewport();
$('g8mTextInput').addEventListener('focus',()=>setTimeout(()=>{const feed=$('g8mMessages');if(feed)feed.scrollTop=feed.scrollHeight;},120));

// V5.6: real 2nd/3rd photos peek out behind the main image (not
// blank decorative rectangles). The actual full-sized files are requested
// only when the group is close to the viewport, using the existing cache.
function g8mCreateStackBacks(stack,items,uid,messageId,isLocal=false,backToLoad=null){
 for(let index=Math.min(items.length-1,2);index>=1;index--){
  const entry=items[index];
  const back=textEl('span',`g8m-stack-back g8m-stack-back-${index}`,'');
  back.setAttribute('aria-hidden','true');
  const picture=document.createElement('img');picture.alt='';picture.draggable=false;
  if(isLocal)picture.src=entry.url;
  else{
   const cached=cachedPhotoUrl(entry.path);
   if(cached)picture.src=cached;
   else if(backToLoad)backToLoad.push({att:{...entry,studentUid:uid,messageId},picture,back});
  }
  back.append(picture);stack.append(back);
 }
}
async function g8mFillStackBacks(entries){
 // Decorative layer failures must never prevent opening the main photo.
 await Promise.all(entries.map(async({att,picture,back})=>{
  try{
   const url=await privatePhotoURL(att);
   if(back.isConnected&&picture.isConnected)picture.src=url;
  }catch(error){console.warn('Stacked photo preview unavailable:',error?.message||error);}
 }));
}
function renderMessages(){
 if(!openedUid)return;
 if(photoVisibilityObserver){photoVisibilityObserver.disconnect();photoVisibilityObserver=null;}
 const log=$('g8mMessages');
 const nearBottom=log.scrollHeight-log.scrollTop-log.clientHeight<150;
 const previousHeight=log.scrollHeight;
 // Reuse the original image elements when other chat metadata changes.
 // Otherwise frequent Seen/reaction/ack updates replace loading thumbnails,
 // leaving them blank even when the Drive request later succeeds.
 const previousPhotoButtons=new Map();
 log.querySelectorAll('.g8m-photo-grid button[data-photo-path]').forEach(button=>{
  previousPhotoButtons.set(button.dataset.photoPath,button);
 });
 const version=++renderVersion;
 const optimistic = [...pendingPhotoJobs.values()]
  .filter(job=>job.uid===openedUid)
  .map(job=>({id:job.id,senderUid:job.senderUid,createdAtMs:job.createdAtMs,__photoPending:job}));
 const shown=[...olderMessages,...activeMessages,...optimistic]
  .filter((x,i,arr)=>x&&x.id&&arr.findIndex(y=>y&&y.id===x.id)===i)
  .sort(compareMessages);
 const content=document.createDocumentFragment();
 const photosToLoad=[];
 const stackedPhotosToLoad=[];
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
   if(quoteFocusId===String(msg.id)&&Date.now()<quoteFocusUntil)item.classList.add('g8m-jump-focus');
   if(msg.__photoPending){
    const job=msg.__photoPending;
    item.classList.add('g8m-pending-photo');
    const anchor=textEl('div','g8m-bubble-anchor','');
    if(job.caption)anchor.append(textEl('div','g8m-text',job.caption));
    const photos=textEl('div','g8m-local-photo-grid'+(job.queued.length>1?' is-multiple':''),'');
    const front=job.queued[0];
    const preview=textEl('button','g8m-local-photo-front','');preview.type='button';
    preview.title=job.queued.length>1?'Open selected photos':'View photo';
    const img=document.createElement('img');img.src=front.url;img.alt=front.file.name;
    img.draggable=false;img.loading='eager';preview.append(img);
    // Use the same mobile dimensions for the local Sending bubble and its
    // confirmed Drive photo. A local object URL should never show at its raw
    // camera pixel size in the conversation.
    // Use the same sizing in the immediate Sending bubble and final sent stack.
    const stack=job.queued.length>1?textEl('div','g8m-photo-stack g8m-pending-stack',''):null;
    const applySize=()=>{
     if(!img.naturalWidth||!img.naturalHeight)return;
     const fit=chatPhotoDisplaySize(img.naturalWidth,img.naturalHeight,!!stack);
     front.chatDisplaySize=fit;
     preview.style.setProperty('--g8m-pending-width',fit.width+'px');
     preview.style.setProperty('--g8m-pending-height',fit.height+'px');
     preview.style.setProperty('--g8m-pending-aspect',img.naturalWidth+' / '+img.naturalHeight);
     stack?.style.setProperty('--g8m-stack-width',fit.width+'px');
    };
    if(front.chatDisplaySize){
     preview.style.setProperty('--g8m-pending-width',front.chatDisplaySize.width+'px');
     preview.style.setProperty('--g8m-pending-height',front.chatDisplaySize.height+'px');
     stack?.style.setProperty('--g8m-stack-width',front.chatDisplaySize.width+'px');
    }
    img.addEventListener('load',applySize,{once:true});
    if(img.complete&&img.naturalWidth)applySize();
    if(stack){
     g8mCreateStackBacks(stack,job.queued,job.uid,job.id,true);
     preview.append(textEl('span','g8m-photo-count',`+${job.queued.length-1}`));
     stack.append(preview);
    }
    preview.addEventListener('click',()=>openLocalPhotoGallery(job.queued));
    photos.append(stack||preview);anchor.append(photos);
    const label=textEl('div','g8m-photo-job-status','');
    const copy=job.state==='failed'?`Not sent · ${job.error||'Upload failed'}`:
      job.state==='queued'?'Waiting to send securely…':
      job.state==='preparing'?'Preparing photo securely…':
      job.state==='saving'?'Saving message…':'Sending securely…';
    label.append(textEl('span','g8m-photo-job-status-text',copy));
    if(job.state==='failed'){
     const retry=textEl('button','g8m-photo-retry','Retry');retry.type='button';
     retry.addEventListener('click',()=>queuePhotoJob(job));
     const discard=textEl('button','g8m-photo-discard','Remove');discard.type='button';
     discard.addEventListener('click',()=>discardPhotoJob(job));
     label.append(retry,discard);
    }else label.classList.add('in-progress');
    anchor.append(label);item.append(anchor);
    item.append(textEl('div','g8m-msg-meta',formatTime(job.createdAtMs)));
    content.append(item);
    continue;
   }
   if(msg.replyText){
    const originalId=String(msg.replyTo||'');
    const quote=textEl(originalId?'button':'div','g8m-quoted'+(originalId?' g8m-quote-link':''),short(['📷 Photo attachment','📸 Photo attachment'].includes(String(msg.replyText).trim())?'Photo':msg.replyText,180));
    if(originalId){quote.type='button';quote.title='Jump to original message';quote.setAttribute('aria-label','Jump to original message');quote.addEventListener('click',()=>void jumpToQuotedMessage(originalId));}
    item.append(quote);
   }
   const visibleText=visibleMessageText(msg);
   if(visibleText && msg.type!=='project')item.append(textEl('div','g8m-text',visibleText));
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
    const validPhotos=attachments.slice(0,MAX_FILES).filter(att=>att?.path && typeof att.path==='string' && att.path.startsWith(`g8Messages/${openedUid}/${msg.id}/`));
    if(validPhotos.length){
     const photos=textEl('div','g8m-photo-grid','');
     const att=validPhotos[0],path=att.path;
     const previous=previousPhotoButtons.get(path);
     const button=(previous && previous.dataset.photoFile===String(att.driveFileId||''))
      ? previous : textEl('button','g8m-image-loading','Loading photo…');
     button.type='button';button.dataset.photoPath=path;button.dataset.photoFile=String(att.driveFileId||'');
     button.setAttribute('aria-label',validPhotos.length>1?`View ${validPhotos.length} photos`:`View ${att.name||'image'}`);
     button._g8mGalleryClick=()=>openPhotoGallery(validPhotos,0,openedUid,msg.id);
     if(button.dataset.photoState==='ready')button.onclick=button._g8mGalleryClick;
     photos.append(button);
     const photoVisual=validPhotos.length>1?textEl('div','g8m-photo-stack',''):photos;
     if(validPhotos.length>1){
      g8mCreateStackBacks(photoVisual,validPhotos,openedUid,msg.id,false,stackedPhotosToLoad);
      photoVisual.append(photos);
      const badge=textEl('span','g8m-photo-count',`+${validPhotos.length-1}`);
      badge.setAttribute('aria-hidden','true');photoVisual.append(badge);
     }
     item.append(photoVisual);
     if(!['ready','fetching','failed'].includes(button.dataset.photoState)){
      button.dataset.photoState='waiting';
      photosToLoad.push({att:{...att,messageId:msg.id,studentUid:openedUid},button});
     }
    }
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
   // Anchor the tools and reaction to the rendered bubble/content itself, not
   // the outer message row (which can be wider than a short one-word message).
   const bubbleAnchor=textEl('div','g8m-bubble-anchor','');
   while(item.firstChild)bubbleAnchor.append(item.firstChild);
   item.append(bubbleAnchor);
   const meta=textEl('div','g8m-msg-meta','');meta.append(textEl('span','',formatTime(at)));
   if(mine){const seenLabel=textEl('span','g8m-seen-label',seenLabelFor(msg));meta.append(seenLabel);}
   item.append(meta);
   // The toolbar must follow the actual visible message, never the row or
   // teacher acknowledgement controls. In particular, portrait images can be
   // much narrower than the rest of the message's metadata/actions.
   const actualVisual=bubbleAnchor.querySelector('.g8m-photo-stack')||bubbleAnchor.querySelector('.g8m-photo-grid')||bubbleAnchor.querySelector('.g8m-project-card')||bubbleAnchor.querySelector('.g8m-text')||bubbleAnchor.querySelector('.g8m-quoted');
   const actionTarget=textEl('div','g8m-action-target','');
   if(actualVisual){actualVisual.replaceWith(actionTarget);actionTarget.append(actualVisual);}
   else bubbleAnchor.append(actionTarget);
   // A ready photo button may be reused after a Seen/reaction update. Keep
   // the exact loaded width across that DOM rebuild; no thumbnail jumping.
   if(actualVisual?.classList.contains('g8m-photo-grid')||actualVisual?.classList.contains('g8m-photo-stack')){
    const loadedWidth=parseFloat(actualVisual.querySelector('button')?.style.getPropertyValue('--g8m-photo-width')||'');
    if(Number.isFinite(loadedWidth)&&loadedWidth>=30){
     const px=Math.min(390,Math.round(loadedWidth))+'px';
     actionTarget.style.setProperty('--g8m-action-width',px);
     bubbleAnchor.style.setProperty('--g8m-action-width',px);
     item.style.setProperty('--g8m-action-width',px);
    }
   }
   const actions=textEl('div','g8m-hover-actions','');
   const reactButton=textEl('button','','☺');reactButton.type='button';reactButton.title='React';reactButton.setAttribute('aria-label','React to message');reactButton.addEventListener('click',()=>openReactionPicker(msg.id,actionTarget));
   const quickReply=textEl('button','','↩');quickReply.type='button';quickReply.title='Reply';quickReply.setAttribute('aria-label','Reply to message');quickReply.addEventListener('click',()=>replyToMessage(msg.id));
   const quickMore=textEl('button','','⋯');quickMore.type='button';quickMore.title='More / Message Details';quickMore.setAttribute('aria-label','More message actions');quickMore.addEventListener('click',()=>openDetailsFor(msg.id));
   actions.append(reactButton,quickReply,quickMore);actionTarget.append(actions);
   const reactionChip=textEl('button','g8m-reaction-chip','');reactionChip.type='button';reactionChip.setAttribute('aria-label','View or change reactions');reactionChip.addEventListener('click',()=>openReactionPicker(msg.id,actionTarget));actionTarget.append(reactionChip);
   updateOneReactionBadge(item,msg.id);
   installLongPress(item,msg.id);
   content.append(item);
  }catch(error){
   console.error('Could not render chat item:',msg?.id,error);
   const fallback=textEl('div','g8m-msg-render-error','A saved message could not be displayed.');
   fallback.dataset.messageId=String(msg?.id||'');content.append(fallback);
  }
 }
 // Commit only after all rows are built. One malformed row cannot blank the chat.
 log.replaceChildren(content);
 // Lazy-load private photo bytes only when a message approaches the viewport.
 // This avoids dozens of Drive/RTDB reads on large or older conversations.
 if(typeof IntersectionObserver==='function'){
  const byButton=new Map(photosToLoad.map(x=>[x.button,x.att]));
  const byStack=new Map();
  for(const part of stackedPhotosToLoad){
   const holder=part.back.closest('.g8m-photo-stack');
   if(!holder)continue;
   if(!byStack.has(holder))byStack.set(holder,[]);
   byStack.get(holder).push(part);
  }
  photoVisibilityObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting){
     photoVisibilityObserver?.unobserve(entry.target);
     const att=byButton.get(entry.target);
     if(att)void showPhoto(att,entry.target,version);
     const layers=byStack.get(entry.target);
     if(layers)void g8mFillStackBacks(layers);
    }
   }
  },{root:log,rootMargin:'300px 0px'});
  for(const {button} of photosToLoad)photoVisibilityObserver.observe(button);
  for(const stack of byStack.keys())photoVisibilityObserver.observe(stack);
 }else{
  for(const {att,button} of photosToLoad)void showPhoto(att,button,version);
  void g8mFillStackBacks(stackedPhotosToLoad);
 }
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
// Allow no more than two Drive photo reads at a time. Many simultaneous
// Apps Script executions used to compete for RTDB receipts and timeout.
function withPhotoReadSlot(task){
 return new Promise((resolve,reject)=>{
  const run=async()=>{
   photoReadActive++;
   try{resolve(await task());}catch(error){reject(error);}
   finally{photoReadActive--;const next=photoReadWaiting.shift();if(next)next();}
  };
  if(photoReadActive<PHOTO_READ_CONCURRENCY)run();else photoReadWaiting.push(run);
 });
}
function photoTransient(error){
 const reason=String(error?.message||error||'').toLowerCase();
 return /timeout|no confirmation|network|temporar|unavailable|service|quota|too many|rate limit|connection|fetch|busy|retry|exceeded/i.test(reason)
  && !/permission|denied|not authorized|invalid|not found|missing|different student|access another|sign in|origin|unauthorized/i.test(reason);
}
function cachedPhotoUrl(path){
 if(!imageCache.has(path))return '';
 const url=imageCache.get(path);imageCache.delete(path);imageCache.set(path,url);
 return url;
}
function cachePhotoUrl(path,url){
 if(imageCache.has(path)){
  const old=imageCache.get(path);imageCache.delete(path);
  if(old!==url)URL.revokeObjectURL(old);
 }
 imageCache.set(path,url);
 // Evict only images that are no longer displayed, including the full viewer.
 // Keeping the currently visible object URLs avoids broken thumbnails.
 if(imageCache.size>PHOTO_CACHE_MAX_ITEMS){
  const live=new Set([...document.querySelectorAll('.g8m-image-ready[data-photo-path]')].map(el=>el.dataset.photoPath));
  const displayed=$('g8mImageLarge')?.src||'';
  for(const [key,old] of imageCache){
   if(imageCache.size<=PHOTO_CACHE_MAX_ITEMS)break;
   if(key===path||live.has(key)||old===displayed)continue;
   imageCache.delete(key);URL.revokeObjectURL(old);
  }
 }
}
function deleteCachedPhoto(path){
 const old=imageCache.get(path);
 if(old){imageCache.delete(path);URL.revokeObjectURL(old);}
}
function pausePhotoRetry(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function privatePhotoURL(att){
 const path=att.path;
 const cached=cachedPhotoUrl(path);
 if(cached)return Promise.resolve(cached);
 if(photoQueue.has(path))return photoQueue.get(path);
 const job=withPhotoReadSlot(async()=>{
  const uid=att.studentUid||String(path.split('/')[1]||'');
  const messageId=att.messageId||String(path.split('/')[2]||'');
  for(let attempt=0;attempt<3;attempt++){
   try{
    const result=await driveRequest('read',{studentUid:uid,messageId,driveFileId:att.driveFileId},attempt===0?30000:40000);
    if(!result?.data||!allowedTypes.has(result.contentType))throw new Error('Invalid Drive photo response');
    const binary=atob(result.data),data=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)data[i]=binary.charCodeAt(i);
    const url=URL.createObjectURL(new Blob([data],{type:result.contentType}));
    cachePhotoUrl(path,url);
    return url;
   }catch(error){
    if(attempt>=2||!photoTransient(error))throw error;
    await pausePhotoRetry(800*(attempt+1));
   }
  }
 }).finally(()=>photoQueue.delete(path));
 photoQueue.set(path,job);
 return job;
}
// G8Code Messages V5.0: isolated Fit-to-Screen photo viewer.
// Zoom is relative to the fitted image (100% means the whole photo fits),
// not the original image pixel count. Images are already cached in memory:
// panning/zooming never contacts Drive or Firestore.
// V5.4 grouped gallery: no extra RTDB or Drive reads until a photo is opened.
// A gallery item is either an already-local sender preview or a private Drive attachment.
let photoGallery=[],photoGalleryIndex=0,photoGalleryToken=0;
function galleryControlState(){
 const hasGroup=photoGallery.length>1;
 $('g8mImagePrev').hidden=!hasGroup;
 $('g8mImageNext').hidden=!hasGroup;
 $('g8mImageCounter').hidden=!hasGroup;
 if(hasGroup){
  $('g8mImageCounter').textContent=`${photoGalleryIndex+1} / ${photoGallery.length}`;
  $('g8mImagePrev').disabled=photoGalleryIndex===0;
  $('g8mImageNext').disabled=photoGalleryIndex===photoGallery.length-1;
 }
}
function openPhotoGallery(photos,index,uid,messageId){
 if(!Array.isArray(photos)||!photos.length)return;
 photoGallery=photos.map(att=>({...att,studentUid:uid,messageId}));
 showPhotoGalleryIndex(index);
}
function openLocalPhotoGallery(entries){
 if(!Array.isArray(entries)||!entries.length)return;
 photoGallery=entries.map(entry=>({localUrl:entry.url,name:entry.file?.name||'Photo'}));
 showPhotoGalleryIndex(0);
}
function showPhotoGalleryIndex(index){
 if(!photoGallery.length||index<0||index>=photoGallery.length)return;
 const isOpening=imageViewer.hidden;
 if(isOpening)imageViewerPreviousFocus=document.activeElement;
 photoGalleryIndex=index;
 const load=++photoGalleryToken,att=photoGallery[index];
 imageViewer.hidden=false;
 galleryControlState();
 if(att.localUrl){openFullPhoto(att.localUrl,true);return;}
 const url=cachedPhotoUrl(att.path);
 if(url){openFullPhoto(url,true);return;}
 imageLarge.removeAttribute('src');imageViewerFitW=0;
 imageViewerScale=1;imageViewerPanX=0;imageViewerPanY=0;
 const state=$('g8mImageStageStatus');state.textContent=`Loading photo ${index+1} of ${photoGallery.length}…`;state.hidden=false;
 void privatePhotoURL(att).then(photoUrl=>{
  if(load!==photoGalleryToken||imageViewer.hidden)return;
  openFullPhoto(photoUrl,true);
 }).catch(error=>{
  if(load!==photoGalleryToken||imageViewer.hidden)return;
  state.textContent=`Could not load this photo: ${friendlyError(error)}`;state.hidden=false;
 });
}
function galleryStep(direction){
 if(photoGallery.length<2)return;
 showPhotoGalleryIndex(photoGalleryIndex+direction);
}
const imageViewer = $('g8mImageViewer');
const imageStage = $('g8mImageStage');
const imageLarge = $('g8mImageLarge');
const imageZoomLabel = $('g8mImageZoomLevel');
const imageViewerPointers = new Map();
let imageViewerScale=1,imageViewerPanX=0,imageViewerPanY=0;
let imageViewerFitW=0,imageViewerFitH=0;
let imageViewerLoadToken=0,imageViewerPreviousFocus=null;
let imageViewerGesture=null,imageViewerTap=null,imageViewerMoved=false;
const IMAGE_VIEWER_MIN=1,IMAGE_VIEWER_MAX=6;
function imageViewerClamp(v,min,max){return Math.max(min,Math.min(max,v));}
function imageViewerLimits(){
 return {
  x:Math.max(0,(imageViewerFitW*imageViewerScale-imageStage.clientWidth)/2),
  y:Math.max(0,(imageViewerFitH*imageViewerScale-imageStage.clientHeight)/2)
 };
}
function imageViewerRender(){
 const bounds=imageViewerLimits();
 imageViewerPanX=imageViewerClamp(imageViewerPanX,-bounds.x,bounds.x);
 imageViewerPanY=imageViewerClamp(imageViewerPanY,-bounds.y,bounds.y);
 imageLarge.style.setProperty('--g8m-fit-width',imageViewerFitW+'px');
 imageLarge.style.setProperty('--g8m-fit-height',imageViewerFitH+'px');
 imageLarge.style.setProperty('--g8m-zoom',imageViewerScale);
 imageLarge.style.setProperty('--g8m-pan-x',imageViewerPanX+'px');
 imageLarge.style.setProperty('--g8m-pan-y',imageViewerPanY+'px');
 imageZoomLabel.textContent=(imageViewerScale===1?'Fit · ':'')+Math.round(imageViewerScale*100)+'%';
 $('g8mImageZoomOut').disabled=imageViewerScale<=IMAGE_VIEWER_MIN;
 $('g8mImageZoomIn').disabled=imageViewerScale>=IMAGE_VIEWER_MAX;
 imageStage.classList.toggle('is-zoomed',imageViewerScale>1.001);
}
function imageViewerMeasure(keepView=false){
 if(!imageLarge.naturalWidth||!imageLarge.naturalHeight||imageViewer.hidden)return;
 const safeW=Math.max(1,imageStage.clientWidth-8), safeH=Math.max(1,imageStage.clientHeight-8);
 const factor=Math.min(1,safeW/imageLarge.naturalWidth,safeH/imageLarge.naturalHeight);
 imageViewerFitW=Math.max(1,imageLarge.naturalWidth*factor);
 imageViewerFitH=Math.max(1,imageLarge.naturalHeight*factor);
 if(!keepView){imageViewerScale=1;imageViewerPanX=0;imageViewerPanY=0;}
 imageViewerRender();
}
function imageViewerZoomTo(target,clientX,clientY){
 if(!imageViewerFitW)return;
 const next=imageViewerClamp(target,IMAGE_VIEWER_MIN,IMAGE_VIEWER_MAX);
 if(next===imageViewerScale)return;
 const rect=imageStage.getBoundingClientRect();
 const x=(Number.isFinite(clientX)?clientX:rect.left+rect.width/2)-(rect.left+rect.width/2);
 const y=(Number.isFinite(clientY)?clientY:rect.top+rect.height/2)-(rect.top+rect.height/2);
 const ratio=next/imageViewerScale;
 // Keep the same image pixel under the pointer, rather than jumping to center.
 imageViewerPanX=x-(x-imageViewerPanX)*ratio;
 imageViewerPanY=y-(y-imageViewerPanY)*ratio;
 imageViewerScale=next;
 imageViewerRender();
}
function imageViewerFit(){imageViewerScale=1;imageViewerPanX=0;imageViewerPanY=0;imageViewerRender();}
function closeFullPhoto(){
 if(imageViewer.hidden)return;
 imageViewer.hidden=true;
 imageViewerPointers.clear();imageViewerGesture=null;imageViewerTap=null;
 imageViewerLoadToken++;photoGalleryToken++;photoGallery=[];galleryControlState();
 if(imageViewerPreviousFocus&&imageViewerPreviousFocus.isConnected){
  try{imageViewerPreviousFocus.focus({preventScroll:true});}catch(_){}}
 imageViewerPreviousFocus=null;
}
function openFullPhoto(url,preserveFocus=false){
 const photoUrl=String(url||'');if(!photoUrl)return;
 if(!preserveFocus)imageViewerPreviousFocus=document.activeElement;
 imageViewerPointers.clear();imageViewerGesture=null;imageViewerTap=null;
 imageViewerMoved=false;
 imageViewer.hidden=false;
 imageViewerScale=1;imageViewerPanX=0;imageViewerPanY=0;
 imageViewerFitW=0;imageViewerFitH=0;
 imageLarge.style.removeProperty('--g8m-zoom');
 imageLarge.style.removeProperty('--g8m-pan-x');
 imageLarge.style.removeProperty('--g8m-pan-y');
 $('g8mImageStageStatus').hidden=true;
 const loadToken=++imageViewerLoadToken;
 imageLarge.src=photoUrl;
 const ready=()=>{
  if(imageViewer.hidden||loadToken!==imageViewerLoadToken)return;
  if(!imageLarge.naturalWidth){
   const el=$('g8mImageStageStatus');el.textContent='This photo could not be displayed.';el.hidden=false;
   return;
  }
  requestAnimationFrame(()=>{if(loadToken===imageViewerLoadToken)imageViewerMeasure(false);});
 };
 if(imageLarge.complete)ready();
 else{imageLarge.addEventListener('load',ready,{once:true});imageLarge.addEventListener('error',ready,{once:true});}
 $('g8mImageClose').focus({preventScroll:true});
}
$('g8mImageClose').addEventListener('click',closeFullPhoto);
$('g8mImagePrev').addEventListener('click',()=>galleryStep(-1));
$('g8mImageNext').addEventListener('click',()=>galleryStep(1));
galleryControlState();
$('g8mImageFit').addEventListener('click',imageViewerFit);
$('g8mImageZoomIn').addEventListener('click',()=>imageViewerZoomTo(imageViewerScale+.25));
$('g8mImageZoomOut').addEventListener('click',()=>imageViewerZoomTo(imageViewerScale-.25));
// The viewer consumes wheel gestures. Chat remains at its existing scroll position.
imageStage.addEventListener('wheel',event=>{
 if(imageViewer.hidden)return;
 event.preventDefault();
 const factor=event.deltaY<0?1.12:1/1.12;
 imageViewerZoomTo(imageViewerScale*factor,event.clientX,event.clientY);
},{passive:false});
function imageViewerPair(){
 const points=[...imageViewerPointers.values()];
 if(points.length<2)return null;
 const a=points[0],b=points[1];
 return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};
}
imageStage.addEventListener('pointerdown',event=>{
 if(imageViewer.hidden||!imageViewerFitW)return;
 if(event.pointerType==='mouse'&&event.button!==0)return;
 event.preventDefault();
 imageStage.setPointerCapture?.(event.pointerId);
 imageViewerPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
 imageViewerMoved=false;
 if(imageViewerPointers.size>=2){
  const pair=imageViewerPair();
  imageViewerGesture={pinch:true,distance:pair.distance,zoom:imageViewerScale,
   x:pair.x,y:pair.y,panX:imageViewerPanX,panY:imageViewerPanY};
 }else{
  imageViewerGesture={pinch:false,x:event.clientX,y:event.clientY,
   panX:imageViewerPanX,panY:imageViewerPanY};
 }
});
imageStage.addEventListener('pointermove',event=>{
 if(!imageViewerPointers.has(event.pointerId)||!imageViewerGesture)return;
 event.preventDefault();
 imageViewerPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
 const g=imageViewerGesture;
 if(imageViewerPointers.size>=2){
  if(!g.pinch){
   const start=imageViewerPair();
   imageViewerGesture={pinch:true,distance:start.distance,zoom:imageViewerScale,
     x:start.x,y:start.y,panX:imageViewerPanX,panY:imageViewerPanY};
   return;
  }
  const pair=imageViewerPair();const rect=imageStage.getBoundingClientRect();
  const cX=rect.left+rect.width/2,cY=rect.top+rect.height/2;
  const next=imageViewerClamp(g.zoom*(pair.distance/g.distance),IMAGE_VIEWER_MIN,IMAGE_VIEWER_MAX);
  const factor=next/g.zoom;
  imageViewerScale=next;
  imageViewerPanX=(pair.x-cX)-((g.x-cX)-g.panX)*factor;
  imageViewerPanY=(pair.y-cY)-((g.y-cY)-g.panY)*factor;
  imageViewerMoved=true;imageViewerRender();
 }else if(!g.pinch){
  const dx=event.clientX-g.x,dy=event.clientY-g.y;
  if(Math.hypot(dx,dy)>5)imageViewerMoved=true;
  if(imageViewerScale>1.001){
   imageViewerPanX=g.panX+dx;imageViewerPanY=g.panY+dy;imageViewerRender();
  }
 }
});
function imageViewerEndPointer(event){
 if(!imageViewerPointers.has(event.pointerId))return;
 const gesture=imageViewerGesture;
 const wasMulti=gesture?.pinch;
 const swipeX=!wasMulti&&gesture?event.clientX-gesture.x:0;
 const swipeY=!wasMulti&&gesture?event.clientY-gesture.y:0;
 const navigateSwipe=event.type==='pointerup'&&event.pointerType!=='mouse'&&imageViewerPointers.size===1&&imageViewerScale<=1.01&&photoGallery.length>1&&Math.abs(swipeX)>55&&Math.abs(swipeX)>Math.abs(swipeY)*1.2;
 imageViewerPointers.delete(event.pointerId);
 if(navigateSwipe){imageViewerGesture=null;imageViewerTap=null;galleryStep(swipeX<0?1:-1);return;}
 if(!wasMulti&&!imageViewerMoved&&event.type==='pointerup'&&event.pointerType!=='mouse'){
  const when=performance.now();
  const prev=imageViewerTap;
  if(prev&&when-prev.time<310&&Math.hypot(event.clientX-prev.x,event.clientY-prev.y)<35){
   imageViewerZoomTo(imageViewerScale>1.01?1:2.5,event.clientX,event.clientY);
   imageViewerTap=null;
  }else imageViewerTap={x:event.clientX,y:event.clientY,time:when};
 }else if(wasMulti) imageViewerTap=null;
 if(imageViewerPointers.size===1){
  const p=[...imageViewerPointers.values()][0];
  imageViewerGesture={pinch:false,x:p.x,y:p.y,panX:imageViewerPanX,panY:imageViewerPanY};
 }else imageViewerGesture=null;
}
imageStage.addEventListener('pointerup',imageViewerEndPointer);
imageStage.addEventListener('pointercancel',imageViewerEndPointer);
imageStage.addEventListener('dblclick',event=>{
 if(imageViewer.hidden||!imageViewerFitW)return;
 event.preventDefault();
 imageViewerZoomTo(imageViewerScale>1.01?1:2.5,event.clientX,event.clientY);
});
document.addEventListener('keydown',event=>{
 if(imageViewer.hidden)return;
 if(event.key==='Escape'){event.preventDefault();closeFullPhoto();return;}
 if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
  event.preventDefault();
  if(event.key==='+'||event.key==='=')imageViewerZoomTo(imageViewerScale+.25);
  else if(event.key==='-')imageViewerZoomTo(imageViewerScale-.25);
  else if(event.key==='0')imageViewerFit();
  else if(photoGallery.length>1&&imageViewerScale<=1.01&&(event.key==='ArrowLeft'||event.key==='ArrowRight'))galleryStep(event.key==='ArrowLeft'?-1:1);
  else if(imageViewerScale>1){
   imageViewerPanX+=(event.key==='ArrowLeft'?40:event.key==='ArrowRight'?-40:0);
   imageViewerPanY+=(event.key==='ArrowUp'?40:event.key==='ArrowDown'?-40:0);
   imageViewerRender();
  }
 }
});
if('ResizeObserver' in window){
 new ResizeObserver(()=>{if(!imageViewer.hidden&&imageViewerFitW)imageViewerMeasure(true);}).observe(imageStage);
}else window.addEventListener('resize',()=>imageViewerMeasure(true));
// Shared mobile chat-image sizing: local optimistic previews and confirmed
// Drive thumbnails must use identical bounds so the bubble never jumps from
// a giant portrait to a compact image after upload. Desktop retains V5.4 sizing.
function isCompactPhotoViewport(){return window.matchMedia('(max-width:700px)').matches;}
function chatPhotoDisplaySize(width,height,multiple=false){
 const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
 const compact=isCompactPhotoViewport();
 const maxW=compact?(multiple?Math.min(250,Math.floor(window.innerWidth*.74)):Math.min(270,Math.floor(window.innerWidth*.74))):(multiple?185:390);
 const maxH=compact?(multiple?280:300):(multiple?340:450);
 const scale=Math.min(1,maxW/w,maxH/h);
 return {width:Math.max(20,Math.round(w*scale)),height:Math.max(20,Math.round(h*scale))};
}
async function showPhoto(att,button,version){
 if(!button.isConnected)return;
 const path=att.path;
 if(button.dataset.photoState==='ready'||button.dataset.photoState==='fetching')return;
 button.dataset.photoState='fetching';
 button.classList.remove('g8m-image-error','g8m-image-ready');
 button.classList.add('g8m-image-loading');
 button.textContent='Loading photo…';button.onclick=null;
 const fail=(error)=>{
  if(!button.isConnected||button.dataset.photoPath!==path)return;
  button.dataset.photoState='failed';button.classList.remove('g8m-image-loading','g8m-image-ready');button.classList.add('g8m-image-error');
  const reason=String(error?.message||error||'');
  button.textContent=/permission|denied|unauthorized/i.test(reason)?'Photo access denied · Retry':
   /not found|missing/i.test(reason)?'Photo missing from Drive · Retry':'Could not load photo · Retry';
  button.title=reason||'Retry photo';
  button.onclick=()=>{button.dataset.photoState='waiting';showPhoto(att,button,renderVersion);};
 };
 if(att.provider!=='drive'||!att.driveFileId){fail(new Error('Older attachment needs re-upload to Drive'));return;}
 try{
  const url=await privatePhotoURL(att);
  if(!button.isConnected||button.dataset.photoPath!==path)return;
  const img=document.createElement('img');img.alt=att.name||'Private Drive attachment';img.loading='eager';
  img.src=url;
  try{
   if(typeof img.decode==='function')await img.decode();
   else if(!img.complete)await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});
   if(!img.naturalWidth||!img.naturalHeight)throw new Error('Photo image could not be decoded');
  }catch(error){deleteCachedPhoto(path);throw error;}
  if(!button.isConnected||button.dataset.photoPath!==path)return;
  const width=img.naturalWidth,height=img.naturalHeight;
  // Actual image ratio. A portrait stays portrait, a landscape stays wide.
  // Cap the displayed height without cropping or stretching long screenshots.
  const grouped=!!button.closest('.g8m-photo-stack');
  const single=!grouped;
  const displayWidth=chatPhotoDisplaySize(width,height,grouped).width;
  button.style.setProperty('--g8m-photo-width',displayWidth+'px');
  const stack=button.closest('.g8m-photo-stack');
  if(stack){stack.style.setProperty('--g8m-stack-width',displayWidth+'px');}

  if(single){const target=button.closest('.g8m-action-target');if(target){target.style.setProperty('--g8m-action-width',displayWidth+'px');target.closest('.g8m-bubble-anchor')?.style.setProperty('--g8m-action-width',displayWidth+'px');target.closest('.g8m-message')?.style.setProperty('--g8m-action-width',displayWidth+'px');}}
  button.style.setProperty('--g8m-photo-aspect',width+' / '+height);
  button.classList.remove('g8m-image-loading','g8m-image-error');button.classList.add('g8m-image-ready');
  button.dataset.photoState='ready';button.title='View full photo';
  button.replaceChildren(img);
  button.onclick=()=>button._g8mGalleryClick?button._g8mGalleryClick():openFullPhoto(url);
 }catch(error){console.warn('Private Drive photo:',error);fail(error);}
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
function addPhotoFiles(files){
 if(sending)return;
 const incoming=Array.from(files||[]);
 if(!incoming.length)return;
 if(selectedProject){selectedProject=null;renderProjectSelection();status('Project removed · sending images separately.');}
 let rejected=false;
 for(const file of incoming){
  if(!allowedTypes.has(file.type)){status('Camera/photo must be JPG, PNG, or WEBP. If your camera uses HEIC, change its format to JPEG.',true);rejected=true;continue;}
  if(file.size>MAX_SIZE){status(`${file.name}: image exceeds 30 MB.`,true);rejected=true;continue;}
  if(selections.length>=MAX_FILES){status('Maximum 3 images per message.',true);rejected=true;break;}
  const entry={file,url:URL.createObjectURL(file),prepared:null,preparedPromise:null,preparing:false,prepareError:null};
  selections.push(entry);
  // Preparation starts WHEN selected, not only after the user taps Send.
  void prepareSelectedPhoto(entry);
 
 }
 renderSelections();
 if(!rejected && incoming.length){
  status('Photo ready · tap Send when ready. The chat will show it immediately.');
  // Warm the Drive handshake while the student is reviewing the image.
  if(!driveBridgeReady)void checkDriveBridge().catch(error=>console.warn('Photo bridge precheck:',friendlyError(error)));
 }
}
$('g8mFileInput').addEventListener('change',event=>{addPhotoFiles(event.target.files);event.target.value='';});
$('g8mCameraInput').addEventListener('change',event=>{addPhotoFiles(event.target.files);event.target.value='';});

// Take Photo uses the native device camera on phones, and a controlled
// getUserMedia preview on desktop. Photos go through the existing encrypted
// account/Google Workspace Drive workflow only after Send is pressed.
const cameraOverlay=$('g8mCameraOverlay'),cameraVideo=$('g8mCameraVideo');
let cameraStream=null,cameraRequestId=0,cameraReturnFocus=null;
function stopCameraStream(){
 if(cameraStream){for(const track of cameraStream.getTracks())try{track.stop();}catch(_){}cameraStream=null;}
 cameraVideo.pause();cameraVideo.srcObject=null;
 $('g8mCameraCapture').disabled=true;
}
function closeCamera(){
 cameraRequestId++;
 stopCameraStream();
 cameraOverlay.hidden=true;
 cameraReturnFocus?.focus?.();
}
async function openDesktopCamera(){
 const request=++cameraRequestId;
 cameraReturnFocus=document.activeElement;
 cameraOverlay.dataset.theme=root.dataset.theme||'light';
 cameraOverlay.hidden=false;
 $('g8mCameraStatus').textContent='Requesting camera permission…';
 $('g8mCameraCapture').disabled=true;
 if(!navigator.mediaDevices?.getUserMedia){$('g8mCameraStatus').textContent='Camera preview is unavailable here. Use Upload Photo instead.';return;}
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
  if(request!==cameraRequestId||cameraOverlay.hidden){stream.getTracks().forEach(track=>track.stop());return;}
  cameraStream=stream;cameraVideo.srcObject=stream;
  await cameraVideo.play();
  $('g8mCameraStatus').textContent='Position your camera, then select Capture Photo.';
  $('g8mCameraCapture').disabled=false;
 }catch(error){
  if(request!==cameraRequestId)return;
  stopCameraStream();
  $('g8mCameraStatus').textContent=error?.name==='NotAllowedError'?'Camera permission denied. Allow access in your browser or choose Upload Photo.':'Could not start camera. Check camera availability, then use Upload Photo if necessary.';
 }
}
$('g8mCameraClose').addEventListener('click',closeCamera);
$('g8mCameraCancel').addEventListener('click',closeCamera);
cameraOverlay.addEventListener('click',event=>{if(event.target===cameraOverlay)closeCamera();});
$('g8mCameraCapture').addEventListener('click',()=>{
 if(!cameraStream||cameraVideo.readyState<2){$('g8mCameraStatus').textContent='Camera is not ready yet.';return;}
 const canvas=document.createElement('canvas');canvas.width=cameraVideo.videoWidth;canvas.height=cameraVideo.videoHeight;
 if(!canvas.width||!canvas.height){$('g8mCameraStatus').textContent='Camera did not provide an image. Please try again.';return;}
 canvas.getContext('2d').drawImage(cameraVideo,0,0,canvas.width,canvas.height);
 $('g8mCameraCapture').disabled=true;
 canvas.toBlob(blob=>{
  if(!blob){$('g8mCameraStatus').textContent='Photo capture failed; please try again.';$('g8mCameraCapture').disabled=false;return;}
  const file=new File([blob],`G8Code-Camera-${new Date().toISOString().replace(/[:.]/g,'-')}.jpg`,{type:'image/jpeg',lastModified:Date.now()});
  closeCamera();addPhotoFiles([file]);
 },'image/jpeg',0.9);
});
function renderSelections(){const cont=$('g8mAttachments');cont.hidden=!selections.length;cont.replaceChildren();selections.forEach((s,i)=>{
 const frame=textEl('div','g8m-attachment-preview','');const img=document.createElement('img');img.src=s.url;img.alt=s.file.name;
 const x=textEl('button','','×');x.type='button';x.setAttribute('aria-label','Remove image');x.addEventListener('click',()=>{URL.revokeObjectURL(s.url);selections.splice(i,1);renderSelections();});
 frame.append(img,x);cont.append(frame);
 });setSendEnabled();}
function setSendEnabled(){$('g8mSend').disabled=sending||!openedUid||(!$('g8mTextInput').value.trim()&&!selections.length&&!selectedProject);$('g8mFileInput').disabled=sending;const p=$('g8mAttachMenuToggle');if(p)p.disabled=sending;}
$('g8mTextInput').addEventListener('input',()=>{const t=$('g8mTextInput');t.style.height='38px';t.style.height=Math.min(120,t.scrollHeight)+'px';setSendEnabled();if(t.value.trim())pulseTyping();else stopTyping();});
$('g8mTextInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(!$('g8mSend').disabled)$('g8mComposer').requestSubmit();}});
function summaryData(uid){const personInfo=teacher?person(uid):profile;
 return {name:short(personInfo?.name||'Student',100),studentId:short(personInfo?.studentId||'',50),section:short(personInfo?.section||'Unassigned',100)};
}
// V4.3: Cross-origin Apps Script HTML iframe responses can be blocked by browsers.
// Send a no-CORS POST, but NEVER trust its opaque response. The authenticated
// Apps Script writes a private receipt to RTDB, which is the ONLY success signal.
function driveUrl(){return String(window.MCS_G8_MESSAGES_DRIVE_URL||'').trim();}
let driveBridgeReady = false;
const driveTransferRoot = uid => `${BASE}/driveTransfers/${uid}`;
function driveRequest(action,args={},maxWait=45000){
 return new Promise(async (resolve,reject)=>{
  const endpoint=driveUrl();
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(endpoint)){
   reject(new Error('Missing Apps Script /exec URL. Check firebase-config.js and g8code-messages-drive-config.js.'));return;
  }
  if(!user){reject(new Error('Sign in to G8Code before using private photo attachments.'));return;}
  if(location.protocol!=='https:'){
   reject(new Error('Photos need the deployed HTTPS website. file:// pages do not support private Drive transfers.'));return;
  }
  let token;
  try{token=await user.getIdToken();}catch(error){reject(error);return;}
  const nonce=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
  const receiptRef=ref(rtdb,`${driveTransferRoot(user.uid)}/${nonce}`);
  let finished=false,unsub=()=>{},timeout=null;
  const cleanup=()=>{try{unsub();}catch(_){} if(timeout)clearTimeout(timeout);};
  const finish=(error,data)=>{
   if(finished)return;finished=true;cleanup();
   if(!error){remove(receiptRef).catch(()=>{});resolve(data||{});}
   else{reject(error);}
  };
  const actionLabel=action==='read'?'photo viewing':action==='probe'?'connection check':'photo upload';
  timeout=setTimeout(()=>finish(new Error(`No confirmation from Workspace Drive after ${Math.ceil(maxWait/1000)}s (${actionLabel}). Check Apps Script Executions and the private RTDB transfer rules. Do not retry repeatedly until checking Drive for an existing photo.`)),maxWait);
  try{
   unsub=onValue(receiptRef,snapshot=>{
    if(!snapshot.exists())return;
    const receipt=snapshot.val()||{};
    if(receipt.action!==action)return;
    finish(receipt.ok?null:new Error(receipt.error||'Workspace Drive rejected this request.'),receipt.data);
    if(!receipt.ok)remove(receiptRef).catch(()=>{});
   },error=>{
    finish(new Error(`Cannot receive private Drive confirmation from RTDB: ${error?.message||error}. Add the driveTransfers security rule.`));
   },{onlyOnce:false});
   // Request content is POSTED only; token and photo contents are never in URLs.
   const fields=new URLSearchParams({g8mBridge:'1',action,nonce,origin:location.origin,idToken:token});
   for(const [key,value] of Object.entries(args))fields.append(key,String(value??''));
   fetch(endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body:fields,redirect:'follow',cache:'no-store'})
    .catch(error=>{console.warn('Workspace transfer POST did not return a usable network result; awaiting RTDB receipt:',String(error));});
  }catch(error){finish(error);}
 });
}
async function checkDriveBridge(){
 if(driveBridgeReady)return;
 if(!driveBridgeCheckPromise){
  driveBridgeCheckPromise=(async()=>{
   const res=await driveRequest('probe',{},16000);
   if(!res||res.version!==43)throw new Error('Messages Drive bridge is outdated. Deploy the updated G8CodeMessagesDrive.gs in the existing Apps Script deployment.');
   driveBridgeReady=true;
  })().finally(()=>{driveBridgeCheckPromise=null;});
 }
 return driveBridgeCheckPromise;
}
function canvasBlob(canvas,type,quality){
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image optimization failed.')),type,quality));
}
async function imageBitmapForFile(file){
 if(typeof createImageBitmap==='function')return await createImageBitmap(file);
 return await new Promise((resolve,reject)=>{
  const image=new Image(),url=URL.createObjectURL(file);
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image);};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('The selected picture could not be decoded.'));};
  image.src=url;
 });
}
// 30 MB INPUT limit. For uploads over 3 MB, preserve legibility while sending
// a smaller WebP (where supported) or JPEG. Drive retains the optimized image.
async function prepareImageForUpload(file){
 if(file.size<=DRIVE_UPLOAD_TARGET)return file;
 const bitmap=await imageBitmapForFile(file);
 try{
  const width=bitmap.width||bitmap.naturalWidth,height=bitmap.height||bitmap.naturalHeight;
  if(!width||!height)throw new Error('Image dimensions are unavailable.');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)throw new Error('Your browser cannot optimize this image.');
  let largest=Math.min(3600,Math.max(width,height));
  let result=null;
  for(let round=0;round<8;round++){
   const scale=Math.min(1,largest/Math.max(width,height));
   canvas.width=Math.max(1,Math.round(width*scale));
   canvas.height=Math.max(1,Math.round(height*scale));
   ctx.clearRect(0,0,canvas.width,canvas.height);
   ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   for(const quality of [0.94,0.86,0.77]){
    const blob=await canvasBlob(canvas,'image/webp',quality);
    result=blob.type==='image/webp'?blob:await canvasBlob(canvas,'image/jpeg',quality);
    if(result.size<=DRIVE_UPLOAD_TARGET){
     const type=result.type==='image/webp'?'image/webp':'image/jpeg';
     const ext=type==='image/webp'?'.webp':'.jpg';
     return new File([result],file.name.replace(/\.[^.]+$/, '')+ext,{type,lastModified:Date.now()});
    }
   }
   largest=Math.max(500,Math.floor(largest*.78));
  }
  throw new Error('This image could not be reduced to a safe transfer size. Try another image format.');
 }finally{if(typeof bitmap.close==='function')bitmap.close();}
}
function fileBase64(file){return new Promise((resolve,reject)=>{
 const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');
 r.onerror=()=>reject(r.error||new Error('Could not read the photo'));
 r.readAsDataURL(file);
});}
// Pre-optimization is sequential and cached per selected File to limit phone memory
// spikes with three large (up to 30 MB each) photos.
function prepareSelectedPhoto(entry){
 if(entry.prepared)return Promise.resolve(entry.prepared);
 if(entry.preparedPromise)return entry.preparedPromise;
 entry.preparing=true;
 const task=imagePreparationTail.catch(()=>{}).then(()=>prepareImageForUpload(entry.file));
 imagePreparationTail=task.catch(()=>{});
 entry.preparedPromise=task.then(file=>{
  entry.prepared=file;entry.preparing=false;entry.prepareError=null;
  return file;
 }).catch(error=>{
  entry.preparing=false;entry.preparedPromise=null;entry.prepareError=error;
  throw error;
 });
 // Prevent an unhandled rejection before Send when browser decoding fails.
 entry.preparedPromise.catch(()=>{});
 return entry.preparedPromise;
}
async function uploadFile(uid,msgKey,entry,index){
 const file=entry.file;
 if(!allowedTypes.has(file.type)||file.size>MAX_SIZE||file.size===0)
  throw new Error('Images must be JPG, PNG, or WEBP and 30 MB or smaller.');
 // These operations were already started after selection; await in parallel.
 const [prepared]=await Promise.all([prepareSelectedPhoto(entry),checkDriveBridge()]);
 const encoded=await fileBase64(prepared);
 // Number the uploaded files so two selected photos with the same local name
 // cannot mistakenly share one retry-safe Drive file.
 const result=await driveRequest('upload',{
  studentUid:uid,messageId:msgKey,fileName:short(`${index+1}-${prepared.name}`,120),
  contentType:prepared.type,fileSize:prepared.size,fileData:encoded,
  section:short(summaryData(uid).section,100)
 },70000);
 if(!result?.driveFileId)throw new Error('Workspace Drive returned no verified file ID.');
 return {path:`g8Messages/${uid}/${msgKey}/${result.driveFileId}`,name:short(file.name,120),size:prepared.size,contentType:prepared.type,provider:'drive',driveFileId:result.driveFileId};
}
function refreshPhotoJob(job){if(job.uid===openedUid)renderMessages();}
function discardPhotoJob(job){
 if(job.inProgress)return;
 pendingPhotoJobs.delete(job.id);
 for(const entry of job.queued)URL.revokeObjectURL(entry.url);
 refreshPhotoJob(job);
 status('Unsent photo removed.');
}
// A failed upload keeps its local preview, caption, and the SAME message key.
// A retry can reuse confirmed Drive files without duplicate uploads.
function queuePhotoJob(job){
 if(job.inProgress)return;
 job.state='queued';job.error='';job.inProgress=true;
 refreshPhotoJob(job);
 photoSendTail=photoSendTail.catch(()=>{}).then(()=>processPhotoJob(job));
}
async function updatePhotoInbox(job){
 const uid=job.uid;
 const senderRole=job.senderRole;
 const data=job.summary;
 const summaryPaths={
  [`${summaryPath(uid)}/name`]:data.name,
  [`${summaryPath(uid)}/studentId`]:data.studentId,
  [`${summaryPath(uid)}/section`]:data.section,
  [`${summaryPath(uid)}/lastText`]:short(job.caption||`📷 ${job.queued.length} photo${job.queued.length===1?'':'s'}`,160),
  [`${summaryPath(uid)}/lastAtMs`]:serverTimestamp(),
  [`${summaryPath(uid)}/lastRole`]:senderRole
 };
 try{await update(ref(rtdb),summaryPaths);}catch(error){console.warn('Photo sent; summary update pending:',error);}
 try{await runTransaction(ref(rtdb,`${summaryPath(uid)}/${job.senderRole==='teacher'?'unreadStudent':'unreadTeacher'}`),n=>Math.min(9999,Number(n||0)+1));}
 catch(error){console.warn('Photo sent; unread sync pending:',error);}
 if(job.senderRole==='student'){
  try{await update(ref(rtdb),{
   [`${BASE}/directory/${uid}/name`]:data.name,
   [`${BASE}/directory/${uid}/studentId`]:data.studentId,
   [`${BASE}/directory/${uid}/section`]:data.section
  });}catch(error){console.warn('Photo sent; directory sync pending:',error);}
  try{await runTransaction(ref(rtdb,`${summaryPath(uid)}/needsChecking`),n=>Math.min(9999,Number(n||0)+1));}
  catch(error){console.warn('Photo sent; checking badge sync pending:',error);}
 }
}
async function processPhotoJob(job){
 try{
  job.state='preparing';refreshPhotoJob(job);
  // Decode/compress in advance; if already warmed this is instantaneous.
  await Promise.all(job.queued.map(prepareSelectedPhoto));
  job.state='uploading';refreshPhotoJob(job);
  for(let i=0;i<job.queued.length;i++){
   if(!job.uploaded[i])job.uploaded[i]=await uploadFile(job.uid,job.id,job.queued[i],i);
  }
  job.state='saving';refreshPhotoJob(job);
  const messageRef=ref(rtdb,`${studentPath(job.uid)}/messages/${job.id}`);
  // A previous attempt may have saved successfully just before its
  // confirmation timed out. Never overwrite that message on Retry.
  let confirmed=await get(messageRef);
  if(!confirmed.exists()){
   const payload={
    text:short(job.caption,3000),type:'image',senderUid:job.senderUid,
    senderRole:job.senderRole,createdAtMs:serverTimestamp(),
    replyTo:job.replyTo||'',replyText:short(job.replyText||'',180),
    attachments:job.uploaded
   };
   await set(messageRef,payload);
   confirmed=await get(messageRef);
  }
  if(!confirmed.exists()||confirmed.val()?.senderUid!==job.senderUid)
   throw new Error('Photo reached Drive, but the chat message could not be confirmed. Retry safely.');
  // Reuse the LOCAL preview as a temporary sender-side Drive thumbnail.
  // There is no unnecessary second Drive download after a verified send.
  for(let i=0;i<job.uploaded.length;i++){
   const att=job.uploaded[i],entry=job.queued[i];
   if(att?.path&&entry?.url){
    // Cache the optimized bytes, not a possibly 30 MB camera original.
    // This keeps the sender preview instant without re-reading private Drive.
    const cached=(entry.prepared&&entry.prepared!==entry.file)
     ?URL.createObjectURL(entry.prepared):entry.url;
    cachePhotoUrl(att.path,cached);
    if(cached!==entry.url)URL.revokeObjectURL(entry.url);
   }
  }
  pendingPhotoJobs.delete(job.id);
  if(job.uid===openedUid){
   if(!activeMessages.some(m=>m.id===job.id))activeMessages.push({id:job.id,...confirmed.val(),__confirmedLocal:true});
   activeMessages.sort(compareMessages);
   renderMessages();pinMessage(job.id);
  }
  if(job.uid===openedUid)status('Photo sent ✓ · Confirmed in Workspace Drive and Messages.');
  // A badge failure can never roll back an already-confirmed photo message.
  void updatePhotoInbox(job);
 }catch(error){
  console.error('Photo send could not be confirmed:',error);
  job.state='failed';job.error=friendlyError(error);
  refreshPhotoJob(job);
  if(job.uid===openedUid)status(`Photo not sent: ${job.error}. Tap Retry on the photo bubble.`,true);
 }finally{job.inProgress=false;}
}
async function sendMessage(event){event.preventDefault();if(sending||!openedUid||!user)return;
 const uid=openedUid, text=$('g8mTextInput').value.trim(),queued=selections.slice(),currentReply=reply,sharedProject=selectedProject;
 if(!text&&!queued.length&&!sharedProject)return;
 if(queued.length){
  if(sharedProject){status('Send a saved project separately from photos.',true);return;}
  if(pendingPhotoJobs.size>=PHOTO_JOBS_LIMIT){status('Two photos are already pending. Send again after one finishes.',true);return;}
  const key=push(ref(rtdb,`${studentPath(uid)}/messages`)).key;
  const job={id:key,uid,senderUid:user.uid,senderRole:role(),caption:text,
   createdAtMs:Date.now(),queued,uploaded:[],summary:summaryData(uid),
   replyTo:currentReply?.id||'',replyText:currentReply?.text||'',
   state:'queued',error:'',inProgress:false};
  pendingPhotoJobs.set(key,job);
  // The sender sees the picture instantly; the receiver sees it only AFTER
  // a verified Drive upload and an independently confirmed RTDB write.
  selections=[];reply=null;
  $('g8mTextInput').value='';$('g8mTextInput').style.height='38px';
  renderSelections();renderReply();stopTyping();
  renderMessages();pinMessage(key);setSendEnabled();
  status('Photo added to chat · Sending securely…');
  queuePhotoJob(job);
  return;
 }
 sending=true;stopTyping();setSendEnabled();status('Sending…');
 const key=push(ref(rtdb,`${studentPath(uid)}/messages`)).key;
 try{
  const attachments=[];
  const senderRole=role();
  if(sharedProject && (teacher||uid!==user.uid))throw new Error('Projects can only be shared by the student in their own chat, one project per message.');
  const payload={text:short(text||(sharedProject?'💻 Shared a G8Code project':''),3000),type:sharedProject?'project':'text',senderUid:user.uid,senderRole,createdAtMs:serverTimestamp(),replyTo:currentReply?.id||'',replyText:short(currentReply?.text||'',180)};
  if(sharedProject){payload.projectId=sharedProject.id;payload.projectName=short(sharedProject.name||'Untitled Project',120);}
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
$('g8mTakePhoto').addEventListener('click',()=>{closeAttachMenu();if(sending)return;const isTouch=window.matchMedia('(pointer:coarse)').matches;if(isTouch)$('g8mCameraInput').click();else void openDesktopCamera();});
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
 if(!cameraOverlay.hidden){event.preventDefault();closeCamera();return;}
 if(!projectViewer.hidden){event.preventDefault();closeModal(projectViewer);return;}
 if(!projectPicker.hidden){event.preventDefault();closeModal(projectPicker);return;}
 closeAttachMenu();
});
function stampLabel(value){
 const time=value?.toDate?.()?.getTime?.()||Number(value?.seconds||0)*1000||Number(value)||0;
 return time?new Intl.DateTimeFormat('en-PH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(time)):'Not available';
}
async function showProjectPicker(){
 if(teacher||!user)return;
 if(selections.length){status('Send your selected photos first, then attach a project separately.',true);return;}
 openModal(projectPicker);
 $('g8mProjectSearch').value='';$('g8mProjectList').replaceChildren(notice('Loading saved projects…'));
 try{
  await ensureProjectFirestore();
  // This is an explicit project action, not a normal Messages read.
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
 if(!user||!studentUid||!projectId)return;
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
  await ensureProjectFirestore();
  const path=[window.MCS_FIREBASE_COLLECTION||'webCodeEditor',window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1','students',studentUid,'projects',projectId];
  const snapshot=await getDocFromServer(doc(firestore,...path));
  if(projectViewer.hidden||openedUid!==currentUid)return;
  if(!snapshot.exists())throw new Error('This saved project was deleted or is no longer available.');
  const project=snapshot.data()||{};
  $('g8mViewerTitle').textContent=short(project.name||'G8Code Project',120);
  $('g8mViewerMeta').textContent=`${teacher?person(studentUid).name:'My Project'} · Last saved ${stampLabel(project.updatedAt)} · Read-only`;
  projectViewerFiles=normalizeViewerProject(project);
  viewerHeight=800;viewerZoom='fit';viewerView='output';viewerPreviewReady=false;
  $('g8mViewerZoom').value='fit';setViewerMode(window.matchMedia('(min-width:1050px)').matches?'split':'output');
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
 const chosen=(codeWeight(preferred)>0?preferred:null)||stores.sort((a,b)=>codeWeight(b[1])-codeWeight(a[1]))[0]?.[1]||project;
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
 if(!projectViewerFiles.wireframe){const value='html|'+projectViewerFiles.selectedHtml; if([...selector.options].some(o=>o.value===value))selector.value=value;}
 renderViewerSource();
}
function renderViewerSource(){
 if(!projectViewerFiles)return;
 if(projectViewerFiles.wireframe){
  const page=projectViewerFiles.wireframePages.find(p=>String(p.id)===$('g8mViewerPage').value)||projectViewerFiles.wireframePages[0];
  const list=Array.isArray(page?.elements)?page.elements:[];
  drawViewerCode([`Page: ${page?.name||'Home'}`,`Elements: ${list.length}`,'',...list.map((e,i)=>`${i+1}. ${String(e.type||'element')} · ${String(e.text||e.name||'').slice(0,120)}`)].join('\n'));
  return;
 }
 const value=$('g8mViewerSourceFile').value||'';const boundary=value.indexOf('|');
 const lang=value.slice(0,boundary),name=value.slice(boundary+1);
 drawViewerCode(projectViewerFiles[lang]?.[name]||'');
}
// Render the same local-file references that the G8Code Editor uses. The old
// renderer injected all styles at </head> and scripts at </body>, but sometimes
// left broken local references and malformed document shells. That could result
// in blank or wrong output, especially with multiple linked CSS/JS files.
// V4.2: Adapted from the Code Editor V2 opaque-iframe preview bridge.
// A project is never trusted to access Firebase, student records, or parent DOM.
function previewIsExternalAsset(address) {return /^(?:https?:)?\/\/|^(?:data:|blob:)/i.test(String(address||'').trim());}
function previewFileName(address){let raw=String(address||'').trim().split(/[?#]/)[0].replace(/\\/g,'/');try{raw=decodeURIComponent(raw);}catch(_){}return raw.replace(/^\.\//,'').split('/').pop()||'';}
function viewerSafeScript(value){return String(value||'').replace(/<\/script/gi,'<\\/script');}
function viewerBridgeScript(page,allPages,token){
 return `(()=>{'use strict';
 const PAGE=${JSON.stringify(page)}, TOKEN=${JSON.stringify(token)}, ALL=${JSON.stringify(allPages)};
 const pages=new Set(ALL);let lastHeight=0,queued=false;
 const notify=(data)=>parent.postMessage(Object.assign({g8mProjectBridge:true,token:TOKEN},data),'*');
 function docHeight(){
  const root=document.documentElement,body=document.body;
  let h=Math.max(800,body?.scrollHeight||0,body?.offsetHeight||0,root?.scrollHeight||0);
  // Include tall absolutely positioned blocks that do not influence body height.
  for(const el of document.querySelectorAll('body>*')){const box=el.getBoundingClientRect();h=Math.max(h,Math.ceil(box.bottom+window.scrollY));}
  return Math.min(180000,Math.max(800,Math.ceil(h)));
 }
 function measure(){queued=false;const h=docHeight();if(Math.abs(lastHeight-h)>3){lastHeight=h;notify({height:h});}}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(measure);}}
 const ro=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 function init(){ro?.observe(document.documentElement);if(document.body)ro?.observe(document.body);
  const mo=new MutationObserver(schedule);mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,characterData:true});
  schedule();notify({ready:true,page:PAGE});setTimeout(schedule,180);setTimeout(schedule,900);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 addEventListener('load',schedule);document.addEventListener('transitionend',schedule,true);
 const format=(raw)=>{try{return decodeURIComponent(raw)}catch{return raw}};
 function local(raw){
  let path=raw.split(/[?#]/)[0];if(!path||path[0]==='/'||path.startsWith('//')||/^[a-z][\\w+.-]*:/i.test(path))return '';
  path=format(path).replace(/\\\\/g,'/').replace(/^\\.\\//,'');
  if(pages.has(path))return path;
  const short=path.split('/').pop();return pages.has(short)?short:'';
 }
 function anchorScroll(hash){
  let id=format(String(hash||'').replace(/^#/,''));
  const target=id?(document.getElementById(id)||document.getElementsByName(id)[0]):null;
  if(target){const rect=target.getBoundingClientRect();notify({anchorY:Math.max(0,rect.top+window.scrollY)});return true;}
  if(!id){notify({anchorY:0});return true;}return false;
 }
 document.addEventListener('click',function(e){
  const link=e.target?.closest?.('a[href],area[href]');if(!link)return;
  const raw=(link.getAttribute('href')||'').trim();
  if(!raw||link.hasAttribute('download'))return;
  if(raw.startsWith('#')){e.preventDefault();queueMicrotask(()=>anchorScroll(raw));return;}
  const name=local(raw);
  if(name){e.preventDefault();if(name===PAGE){if(raw.includes('#'))queueMicrotask(()=>anchorScroll(raw.slice(raw.indexOf('#'))));else notify({anchorY:0});}
   else notify({navigate:name,hash:raw.includes('#')?raw.slice(raw.indexOf('#')):''});return;}
  if(raw.startsWith('//')||/^(?:https?:|mailto:|tel:|sms:)/i.test(raw)){link.target='_blank';link.rel='noopener noreferrer';return;}
  // Never allow an unresolved relative href to load the parent G8Code origin.
  if(!/^(?:javascript:|data:|blob:)/i.test(raw)){e.preventDefault();notify({warning:'Missing saved page: '+raw.slice(0,120)});}
 },true);
 document.addEventListener('submit',function(e){
  const form=e.target;if(!(form instanceof HTMLFormElement))return;
  const method=(form.getAttribute('method')||'get').toLowerCase();
  const action=(form.getAttribute('action')||'').trim();
  const page=local(action)||(!action||action[0]==='?'||action[0]==='#'?PAGE:'');
  if(method==='get'&&page){e.preventDefault();const q=new URLSearchParams(new FormData(form));notify({navigate:page,hash:action.includes('#')?action.slice(action.indexOf('#')):'',query:q.toString()});}
 },true);
 // The iframe grows to the entire project document height. In an opaque iframe
 // wheel/touch input does not reliably scroll the embedding container, so relay
 // only gestures that are not consumed by an inner overflow-scrolling element.
 function innerScrollable(target,delta){for(let el=target;el&&el!==document.documentElement;el=el.parentElement){
   const st=getComputedStyle(el);if(!/(auto|scroll)/.test(st.overflowY))continue;
   if(el.scrollHeight>el.clientHeight+2&&((delta>0&&el.scrollTop+el.clientHeight<el.scrollHeight-2)||(delta<0&&el.scrollTop>2)))return true;
 }return false;}
 document.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey||innerScrollable(e.target,e.deltaY))return;
   e.preventDefault();notify({scrollY:e.deltaY,scrollX:e.deltaX});},{passive:false});
 let touch=null;
 document.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null;},{passive:true});
 document.addEventListener('touchmove',e=>{if(!touch||e.touches.length!==1)return;const next={x:e.touches[0].clientX,y:e.touches[0].clientY};const dy=touch.y-next.y,dx=touch.x-next.x;
   touch=next;if(innerScrollable(e.target,dy))return;e.preventDefault();notify({scrollY:dy,scrollX:dx});},{passive:false});
 document.addEventListener('touchend',()=>touch=null,{passive:true});
 addEventListener('error',e=>{if(e.message)notify({warning:'JavaScript: '+String(e.message).slice(0,150)});},true);
 addEventListener('message',e=>{if(e.source!==parent||!e.data?.g8mViewerParent||e.data.token!==TOKEN)return;
  if(e.data.anchor!==undefined){if(!anchorScroll(e.data.anchor))requestAnimationFrame(()=>anchorScroll(e.data.anchor));}},false);
 })();`;
}
function buildIsolatedPreview(project,pageName,token){
 const source=String(project.html[pageName]||'');
 const parsed=new DOMParser().parseFromString(source||'<main style="padding:30px">No HTML saved in this file.</main>','text/html');
 parsed.querySelectorAll('base').forEach(el=>el.remove());
 // Mirrors Editor V2: inline matching virtual-project assets, then fallback to
 // its CSS/JS bundle if there is no matching local source in the document.
 const styleUsed=new Set(),scriptUsed=new Set();
 for(const link of [...parsed.querySelectorAll('link[rel~="stylesheet"][href]')]){
  const href=previewFileName(link.getAttribute('href'));
  const match=Object.keys(project.css).find(n=>n.toLowerCase()===href.toLowerCase());
  if(match){const style=parsed.createElement('style');style.textContent=project.css[match];style.dataset.g8mCss=match;link.replaceWith(style);styleUsed.add(match);}
  else if(!previewIsExternalAsset(link.getAttribute('href')))link.remove();
 }
 for(const el of [...parsed.querySelectorAll('script[src]')]){
  const name=previewFileName(el.getAttribute('src'));
  const match=Object.keys(project.js).find(n=>n.toLowerCase()===name.toLowerCase());
  if(match){const script=parsed.createElement('script');script.textContent=viewerSafeScript(project.js[match]);el.replaceWith(script);scriptUsed.add(match);}
  else if(!previewIsExternalAsset(el.getAttribute('src')))el.remove();
 }
 const cssSources=Object.values(project.css||{}).filter(x=>typeof x==='string'&&x.trim());
 if(!styleUsed.size&&cssSources.length&&!Array.from(parsed.querySelectorAll('style')).some(el=>cssSources.includes(el.textContent))){
  const style=parsed.createElement('style');style.textContent=cssSources.join('\n');parsed.head.append(style);
 }
 const jsSources=Object.values(project.js||{}).filter(x=>typeof x==='string'&&x.trim());
 if(!scriptUsed.size&&jsSources.length&&!Array.from(parsed.querySelectorAll('script:not([src])')).some(el=>jsSources.includes(el.textContent))){
  const script=parsed.createElement('script');script.textContent=viewerSafeScript(jsSources.join('\n'));parsed.body.append(script);
 }
 if(!parsed.querySelector('meta[name="viewport"]')){const meta=parsed.createElement('meta');meta.name='viewport';meta.content='width=device-width,initial-scale=1';parsed.head.prepend(meta);}
 // The only bridge inside the sandbox: reports height/navigation, no Firebase.
 const bridge=parsed.createElement('script');bridge.textContent=viewerSafeScript(viewerBridgeScript(pageName,Object.keys(project.html),token));parsed.head.prepend(bridge);
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
// V4.2: viewport scaling is presentation-only; the scroll surface represents
// the ENTIRE webpage. This avoids clipped bottoms and keeps output interactive.
const PROJECT_DESKTOP_WIDTH=1280;
let previewResizeObserver=null,viewerHeight=800,viewerZoom='fit',viewerView='output';
let viewerPreviewToken=0,viewerPreviewReady=false,viewerAnchorPending='';
function setViewerStatus(message,error=false){const el=$('g8mViewerStatus');if(el){el.textContent=message;el.classList.toggle('error',error);}}
function drawViewerCode(source){
 const code=$('g8mViewerCode');if(!code)return;
 code.replaceChildren();const lines=String(source||'').split(/\r?\n/);
 if(lines.length===1&&!lines[0]){const empty=textEl('span','g8m-source-empty','This saved code file is empty. Select another file or ask the student to save the project first.');code.append(empty);return;}
 // Real line numbers; do not execute, interpret, or modify any student code.
 const fragment=document.createDocumentFragment();
 for(const line of lines){const el=document.createElement('span');el.className='g8m-source-line';el.textContent=line||' ';fragment.append(el);}
 code.append(fragment);
 $('g8mViewerSource').scrollTop=0;
}
function setViewerMode(mode){
 viewerView=['output','source','split'].includes(mode)?mode:'output';
 const panel=$('g8mViewerColumns');panel.dataset.view=viewerView;
 document.querySelectorAll('[data-g8m-view]').forEach(btn=>{const active=btn.dataset.g8mView===viewerView;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
 $('g8mViewerZoom').closest('label').hidden=viewerView==='source';
 $('g8mViewerReload').hidden=viewerView==='source';
 const showSource=viewerView!=='output';
 $('g8mViewerSourceFile').closest('label').hidden=!showSource;
 requestAnimationFrame(sizeDesktopProjectPreview);
}
function sizeDesktopProjectPreview(){
 const host=$('g8mViewerPreviewHost'),frame=$('g8mViewerPreview'),stage=$('g8mViewerPreviewStage');
 if(!host||!frame||!stage||projectViewer.hidden||!projectViewerFiles||viewerView==='source')return;
 const width=host.clientWidth;if(width<20)return;
 const scale=viewerZoom==='fit'?Math.min(1,width/PROJECT_DESKTOP_WIDTH):Number(viewerZoom);
 const previousScale=Number(stage.dataset.scale)||scale;
 // Preserve the student's scroll position when changing zoom.
 const oldX=host.scrollLeft/previousScale,oldY=host.scrollTop/previousScale;
 stage.style.width=Math.ceil(PROJECT_DESKTOP_WIDTH*scale)+'px';
 stage.style.height=Math.ceil(viewerHeight*scale)+'px';
 stage.dataset.scale=String(scale);
 frame.style.width=PROJECT_DESKTOP_WIDTH+'px';frame.style.height=viewerHeight+'px';
 frame.style.transform='scale('+scale+')';
 $('g8mViewerViewportNote').textContent=`Desktop 1280px · ${Math.round(scale*100)}% · scroll ↕ ↔`;
 if(Math.abs(scale-previousScale)>.001){host.scrollLeft=oldX*scale;host.scrollTop=oldY*scale;}
}
function renderViewerPreview(pendingAnchor=''){
 if(!projectViewerFiles)return;
 viewerAnchorPending=pendingAnchor||'';
 viewerHeight=800;viewerPreviewReady=false;viewerPreviewToken+=1;
 const content=projectViewerFiles.wireframe
  ?buildWireframePreview(projectViewerFiles,$('g8mViewerPage').value,'desktop')
  :buildIsolatedPreview(projectViewerFiles,$('g8mViewerPage').value,viewerPreviewToken);
 const host=$('g8mViewerPreviewHost');host.scrollTop=0;host.scrollLeft=0;
 $('g8mViewerPreview').style.height='800px';
 $('g8mViewerPreview').srcdoc=content;
 renderViewerSource();
 setViewerStatus('Rendering saved project…');
 sizeDesktopProjectPreview();requestAnimationFrame(sizeDesktopProjectPreview);
 if(projectViewerFiles.wireframe){setViewerStatus('Wireframe desktop preview · view only');}
}
window.addEventListener('message',event=>{
 const frame=$('g8mViewerPreview');
 if(projectViewer.hidden||!frame||event.source!==frame.contentWindow)return;
 const data=event.data;
 if(!data?.g8mProjectBridge||data.token!==viewerPreviewToken)return;
 const host=$('g8mViewerPreviewHost'),scale=Number($('g8mViewerPreviewStage').dataset.scale)||1;
 if(data.height){const height=Number(data.height);if(Number.isFinite(height)&&height>=800&&height<=180000&&Math.abs(height-viewerHeight)>3){viewerHeight=height;sizeDesktopProjectPreview();}}
 if(data.ready){viewerPreviewReady=true;setViewerStatus('Output ready · interactive · full page scroll available');
  if(viewerAnchorPending){const anchor=viewerAnchorPending;viewerAnchorPending='';frame.contentWindow.postMessage({g8mViewerParent:true,token:viewerPreviewToken,anchor},'*');}}
 if(data.anchorY!==undefined){const n=Number(data.anchorY);if(Number.isFinite(n))host.scrollTop=Math.max(0,n*scale);}
 if(data.scrollY!==undefined){const y=Number(data.scrollY)||0,x=Number(data.scrollX)||0;host.scrollBy(x,y);}
 if(data.navigate){const name=String(data.navigate);if(projectViewerFiles?.html[name]!==undefined){$('g8mViewerPage').value=name;renderViewerPreview(String(data.hash||''));}
  else setViewerStatus('Page not available in saved project: '+name,true);}
 if(data.warning)setViewerStatus(String(data.warning),true);
});
if(typeof ResizeObserver!=='undefined'){
 previewResizeObserver=new ResizeObserver(()=>sizeDesktopProjectPreview());
 previewResizeObserver.observe($('g8mViewerPreviewHost'));
}
window.addEventListener('resize',sizeDesktopProjectPreview);
$('g8mViewerPage').addEventListener('change',()=>renderViewerPreview());
$('g8mViewerSourceFile').addEventListener('change',renderViewerSource);
$('g8mViewerZoom').addEventListener('change',event=>{viewerZoom=event.target.value;sizeDesktopProjectPreview();});
$('g8mViewerReload').addEventListener('click',()=>renderViewerPreview());
document.querySelectorAll('[data-g8m-view]').forEach(btn=>btn.addEventListener('click',()=>setViewerMode(btn.dataset.g8mView)));
$('g8mViewerWrap').addEventListener('click',()=>{
 const pre=$('g8mViewerSource'),btn=$('g8mViewerWrap');const enabled=!pre.classList.contains('g8m-source-wrapped');
 pre.classList.toggle('g8m-source-wrapped',enabled);btn.textContent=enabled?'Wrap: On':'Wrap: Off';btn.setAttribute('aria-pressed',String(enabled));
});
$('g8mViewerCopy').addEventListener('click',async()=>{
 const textValue=$('g8mViewerSource').innerText.split('\n').join('\n');
 const selection=$('g8mViewerSourceFile').value;
 const divider=selection.indexOf('|');const lang=selection.slice(0,divider),name=selection.slice(divider+1);
 const source=projectViewerFiles?.wireframe?textValue:projectViewerFiles?.[lang]?.[name]||'';
 try{await navigator.clipboard.writeText(source);setViewerStatus('Source code copied.');}
 catch(_){setViewerStatus('Clipboard blocked. Select and copy the source manually.',true);}
});
// === End Messages V4.0 ===

$('g8mComposer').addEventListener('submit',sendMessage);
window.addEventListener('beforeunload',event=>{
 if([...pendingPhotoJobs.values()].some(job=>job.inProgress)){
  event.preventDefault();event.returnValue='';
 }
 stopCameraStream();stopTyping();clearUnsubs(rootUnsubs);clearUnsubs(activeUnsubs);
 selections.forEach(s=>URL.revokeObjectURL(s.url));
 for(const job of pendingPhotoJobs.values())job.queued.forEach(entry=>URL.revokeObjectURL(entry.url));
 imageCache.forEach(url=>URL.revokeObjectURL(url));
});
boot();
