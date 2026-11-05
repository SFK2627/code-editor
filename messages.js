/* G8Code Messages V4C-21A — teacher-only screenshot policy with larger watermark-only student view; all V4C-20 project fixes retained. */
// Classic script entry: works when index.html / admin-v2.html / messages.html
// are opened directly from disk. Do NOT use <script type="module"> for local pages.
// Fetch only the Firebase modules from HTTPS, like the existing G8Code login.
let initializeApp, getApps, getApp, getAuth, onAuthStateChanged, signInWithEmailAndPassword;
let getDatabase, ref, onValue, query, limitToLast, orderByChild, orderByKey, endBefore, get, push, set, update, remove, runTransaction, serverTimestamp, onDisconnect;
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
 ({getDatabase, ref, onValue, query, limitToLast, orderByChild, orderByKey, endBefore, get, push, set, update, remove, runTransaction, serverTimestamp, onDisconnect} = d);

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
// ImageKit Fast Send: pass substantially fewer bytes through Apps Script and
// mobile data. Preserve more pixels for screenshots where small text matters.
const IMAGEKIT_PHOTO_TARGET = 650 * 1024;
const IMAGEKIT_SCREEN_TARGET = 1100 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const teacherEmails = (window.MCS_TEACHER_EMAILS || []).map(x => String(x).toLowerCase());
let app, auth, rtdb, firestore, user, teacher = false, profile = null;
let sections = [], students = new Map(), summaries = {}, openedUid = '', currentSection = '*';
let filter = 'all', search = '', mobileView = 'sections', activeMessages = [], activeAcks = {}, seenAt = 0;
let g8mScreenshotPolicy={uid:'',allowed:false,ready:false,error:'',saving:false};
let activeUnsubs = [], rootUnsubs = [], sending = false, selections = [], reply = null, renderVersion = 0;
let olderMessages=[], hasOlder=false, olderLoading=false, historyExhausted=false;
let g8mAdminFocusedMessages=[]; // Ephemeral jump context, never changes the history pagination cursor.
let g8mEarlierLoadError=''; // Do not disguise history-query failures as an empty history.
let g8mHistoryCheckRunning=false;
const G8M_HISTORY_RECONCILE_LIMIT=250; // Only inspect a bounded tail; never download an unlimited chat.
// V4C-11: Admin-only unified timeline for prior account UIDs verified by the
// existing student-ID inbox grouping. Original messages stay at their RTDB
// paths; their snapshots are merged only for display and chronological paging.
const g8mLinkedHistories=new Map();
function g8mClearLinkedHistories(){
 for(const entry of g8mLinkedHistories.values())clearUnsubs(entry.unsubs||[]);
 g8mLinkedHistories.clear();
}
function g8mHistoricMessages(){
 const items=[];
 for(const entry of g8mLinkedHistories.values())items.push(...entry.older,...entry.recent);
 return items;
}
function g8mHasMoreHistory(){return hasOlder||[...g8mLinkedHistories.values()].some(entry=>entry.hasOlder);}
function g8mHistoryMessageCount(){
 const keys=new Set([...activeMessages,...olderMessages,...g8mHistoricMessages()].map(msg=>`${msg.__threadUid||openedUid}/${msg.id}`));
 return keys.size;
}
function g8mUpdateLoadedStatus(){
 if(!openedUid)return;
 // Keep the complete V4C-15 reconciliation and earlier-message paging,
 // but do not expose implementation counts, thread IDs, or audit text in chat.
 const failed=[...g8mLinkedHistories.values()].some(entry=>entry.error);
 if(failed||g8mEarlierLoadError){
  updateChatFeedState('Couldn’t load older messages. Tap refresh to try again.',true);
 }else updateChatFeedState('');
}

let imageCache = new Map(), imageCacheFileIds = new Map(), photoQueue = new Map(), lastSnapshotKey = '';
// V5.12: Keep authenticated private Drive photos in bounded IndexedDB storage
// across reloads. Never expose an old account's images after an account change.
const PHOTO_DB_NAME = 'g8code-private-messages-photos-v1';
const PHOTO_DB_STORE = 'photos';
const PHOTO_DISK_MAX_ITEMS = 120;
const PHOTO_DISK_MAX_BYTES = 96 * 1024 * 1024;
const PHOTO_DISK_SINGLE_MAX = 5 * 1024 * 1024;
const PHOTO_DISK_TTL = 21 * 24 * 60 * 60 * 1000;
let photoDbPromise = null, photoCacheOwnerUid = '', photoAuthEpoch = 0;
let photoCacheOwnerInitialized = false, photoDiskWriteCount = 0;
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
let imageKitBridgeCheckPromise=null, imageKitBridgeReady=false;
// Five-minute signed links are kept ONLY in memory and scoped to the current login.
const g8mIkSignedLinks=new Map();
// V4C8: coalesce authorization of nearby PRIVATE ImageKit photos into one
// existing ikSign bridge request. Each image is still verified individually
// against its actual RTDB message before Apps Script releases a signed link.
const G8M_IK_THUMB_SUFFIX='::g8m-thumb';
const G8M_IK_MAX_SIGN_BATCH=6;
const g8mIkSignPending=[];
let g8mIkSignBatchActive=false,g8mIkSignBatchTimer=null;
// In some browser/CDN combinations private <img> works but cross-origin fetch
// cannot read bytes. Avoid retrying a blocked Blob fetch for every photo.
let g8mIkCorsBlobAllowed=null;

// ImageKit is the default for NEW Messenger photos from signed-in teachers
// AND students. Each message records its actual provider, so existing Drive
// attachments continue using their original authenticated read path.
// One explicit switch in g8code-messages-drive-config.js provides a safe
// rollback for future uploads; never switch providers halfway through a job.
const g8mUseImageKit=()=>Boolean(user) &&
 window.MCS_G8_MESSAGES_IMAGEKIT_UPLOAD_ENABLED===true;

// V4.5: short-lived chat presence/typing, reactions, and independently stored read receipts.
let activeReactions={}, activeReadReceipts={}, peerPresence=null, peerTyping=null;
let deletedMessageIndex={}, hiddenMessageIds={}, deleteMessageTarget=null, deleteMessageBusy=false;
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
const localDayKey = ms => { const d=dateOf(ms); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
function chatDayDividerLabel(firstMessageTime){
 const today=new Date(), yesterday=new Date(today);
 yesterday.setDate(yesterday.getDate()-1); // Calendar day, never a rolling 24-hour window.
 const key=localDayKey(firstMessageTime);
 const prefix=key===localDayKey(today.getTime())?'Today · ':
  key===localDayKey(yesterday.getTime())?'Yesterday · ':'';
 return `${prefix}${dayLabel(firstMessageTime)} · ${formatTime(firstMessageTime)}`;
}
// V5.13: only plain text messages reveal their metadata by tapping on phones.
// Keep the chosen ID in memory across Seen/reaction rerenders; never store in RTDB.
let selectedMobileMetaMessageId='';
const mobileChatSize = () => window.matchMedia('(max-width:700px)').matches;
function toggleTextMessageMeta(item,id){
 if(!mobileChatSize())return;
 const same=selectedMobileMetaMessageId===String(id);
 for(const node of $('g8mMessages')?.querySelectorAll('.g8m-text-only')||[]){
  node.classList.remove('g8m-meta-revealed');
  const meta=node.querySelector(':scope > .g8m-msg-meta');
  if(meta)meta.hidden=true;
  const text=node.querySelector('.g8m-text.g8m-text-tap');
  if(text)text.setAttribute('aria-expanded','false');
 }
 selectedMobileMetaMessageId=same?'':String(id);
 if(!same){
  item.classList.add('g8m-meta-revealed');
  const meta=item.querySelector(':scope > .g8m-msg-meta');
  if(meta)meta.hidden=false;
  item.querySelector('.g8m-text.g8m-text-tap')?.setAttribute('aria-expanded','true');
 }
}


// Keep hidden-state correct on rotation, tablet/Desktop resizing and chat rerenders.
function syncMobileMessageMetaVisibility(){
 const mobile=mobileChatSize();
 for(const item of $('g8mMessages')?.querySelectorAll('.g8m-message.g8m-text-only')||[]){
  const meta=item.querySelector(':scope > .g8m-msg-meta');
  if(meta)meta.hidden=mobile&&!item.classList.contains('g8m-meta-revealed');
 }
}

const short = (v,n=60) => String(v || '').slice(0,n);
const isTeacher = account => teacherEmails.includes(String(account?.email || '').toLowerCase());
function status(message, error=false){ const el=$('g8mSendStatus'); el.textContent=message; el.classList.toggle('error',error); }
function showGate(title,detail,login=false){gate.hidden=false;workspace.hidden=true;gate.querySelector('h1').textContent=title;$('g8mGateText').textContent=detail;$('g8mQuickLogin').hidden=!login;}
function setConnection(ok,detail){const el=$('g8mConnection'); el.textContent=detail || (ok?'Live':'Offline'); el.classList.toggle('online',Boolean(ok));}
function notice(text){const el=document.createElement('div');el.className='g8m-empty';el.textContent=text;return el;}
function textEl(tag,className,text){const x=document.createElement(tag);if(className)x.className=className;x.textContent=text??'';return x;}
function clearUnsubs(list){while(list.length){try{list.pop()();}catch(_){}}}
// The existing RTDB rules index createdAtMs under chats/$studentUid/messages.
// Keep the live window and the older-page cursor on the SAME ordering field.
const G8M_RECENT_MESSAGES=100, G8M_HISTORY_PAGE_SIZE=50, G8M_WARM_OLDER_MAX=350;
// Audit a bounded tail after a pagination cursor reports the end. This repairs
// legacy timestamp/order gaps without copying or modifying RTDB records.
const g8mReconcileQuery = uid => query(ref(rtdb,`${studentPath(uid)}/messages`),orderByChild('createdAtMs'),limitToLast(G8M_HISTORY_RECONCILE_LIMIT));
const recentMessageQuery = uid => query(ref(rtdb,`${studentPath(uid)}/messages`),orderByChild('createdAtMs'),limitToLast(G8M_RECENT_MESSAGES));
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
 // Match RTDB's lexicographic key tie-breaker (localeCompare can reorder keys).
 const ka=String(a.id||''),kb=String(b.id||'');
 return ka<kb?-1:ka>kb?1:0;
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
 pinnedMessageId=String(id);pinExpires=Date.now()+900;
 if(g8mFollowLatest)g8mScheduleBottomIfFollowing();
 // Do not run delayed moveToMessage calls after the user starts backreading.
}

function updateChatFeedState(message,failed=false){
 const el=$('g8mFeedState');if(!el)return;
 el.textContent=message;el.hidden=!String(message||'').trim();el.classList.toggle('error',failed);
}
function rememberConversation(uid){
 const trimmed=olderMessages.length>G8M_WARM_OLDER_MAX;
 conversationMemory.delete(uid);
 conversationMemory.set(uid,{
  messages:activeMessages.slice(-120),older:olderMessages.slice(-G8M_WARM_OLDER_MAX),
  acks:{...activeAcks},seenAt,hasOlder:hasOlder||trimmed,
  historyExhausted:historyExhausted&&!trimmed
 });
 if(conversationMemory.size>10)conversationMemory.delete(conversationMemory.keys().next().value);
}
function displayMessagesFromSnapshot(snapshot,uid){
 if(uid!==openedUid)return;
 const hadPreviousLiveSnapshot=g8mHadLiveSnapshot;
 const incoming=normalizeMessageSnapshot(snapshot);
 // Only an actual new peer message arriving WHILE backreading increases the
 // small badge on the centered arrow. Never count the initial history load,
 // other students' messages, local optimistic sends or Seen/reaction updates.
 if(g8mHadLiveSnapshot && !g8mFollowLatest){
  const before=new Set([...activeMessages,...olderMessages].map(message=>String(message.id)));
  const fresh=incoming.filter(message=>!before.has(String(message.id)) &&
   message.senderUid!==user?.uid && !isDeletedMessage(message));
  if(fresh.length)g8mNewIncomingWhileAway=Math.min(99,g8mNewIncomingWhileAway+fresh.length);
 }
 g8mHadLiveSnapshot=true;
 for(const fresh of incoming){
  if(!isDeletedMessage(fresh))continue;
  const old=[...activeMessages,...olderMessages].find(x=>x.id===fresh.id&&!isDeletedMessage(x));
  if(old)g8mRemoveDeletedPhotoCache(old);
 }
 // The realtime window contains only the last 100 records. A new arrival can
 // push the former oldest record out of the query even though it still exists.
 // Keep that rollover in the older page cache so previously visible messages
 // do not disappear from the chat merely because more messages arrived.
 if(hadPreviousLiveSnapshot && incoming.length>=G8M_RECENT_MESSAGES){
  const freshIds=new Set(incoming.map(m=>m.id));
  const oldIds=new Set(olderMessages.map(m=>m.id));
  const rolledOut=activeMessages.filter(m=>!m.__confirmedLocal&&!freshIds.has(m.id)&&!oldIds.has(m.id));
  if(rolledOut.length)olderMessages=[...olderMessages,...rolledOut].sort(compareMessages);
 }
 // The live query is authoritative. A confirmed local send is merged below so
 // a slow/stale initial listener does not temporarily erase the just-sent bubble.
 const localPending=activeMessages.filter(m=>m.__confirmedLocal && !incoming.some(n=>n.id===m.id));
 activeMessages=[...incoming,...localPending].sort(compareMessages);
 // Preserve already-fetched older pages. The old memory snapshot could be stale
 // and silently discarded history after a Seen/reaction or new-message update.
 hasOlder=!historyExhausted&&(hasOlder||incoming.length>=G8M_RECENT_MESSAGES);
 rememberConversation(uid);
 renderMessages();
 // On first server snapshot, the chat finally has real content/height. The
 // initial bottom jump may have run while the mobile pane was still empty.
 if(g8mAwaitingFirstSnapshotUid===uid){
  g8mAwaitingFirstSnapshotUid='';
  if(g8mFollowLatest)g8mJumpLatest({settle:true});
 }
 g8mUpdateLoadedStatus();
}
async function refreshConversation(manual=false){
 const uid=openedUid;if(!uid)return;
 if(manual){
  updateChatFeedState('Refreshing conversation…');
  if(teacher){
   for(const [id,entry] of [...g8mLinkedHistories])if(entry.error){
    clearUnsubs(entry.unsubs);g8mLinkedHistories.delete(id);
   }
   showRelatedAccountThreads(uid);
  }
 }
 try{
  const snapshot=await get(recentMessageQuery(uid));
  if(uid!==openedUid)return;
  displayMessagesFromSnapshot(snapshot,uid);
  if(manual)status('Conversation refreshed ✓');
 }catch(error){
  if(uid!==openedUid)return;
  updateChatFeedState('Couldn’t open this conversation. Tap refresh to try again.',true);
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
// Intentionally kept OUTSIDE chats/$uid, to avoid inheriting broad message-write
// permissions. Deploy the accompanying RTDB rule fragment as part of your
// current deployed rule tree (never replace the existing rules with it).
const g8mScreenshotPolicyPath=uid=>`${BASE}/screenshotPolicies/${uid}`;
function g8mResetScreenshotPolicy(uid=''){
 g8mScreenshotPolicy={uid,allowed:false,ready:false,error:'',saving:false};
 g8mPaintScreenshotPolicy();
}
function g8mPaintScreenshotPolicy(){
 const studentRestricted=!teacher&&Boolean(openedUid)&&!g8mScreenshotPolicy.allowed;
 for(const id of ['g8mChatScreenshotWatermark','g8mImageScreenshotWatermark']){
  const el=$(id);if(el)el.hidden=!studentRestricted;
 }
 const toggle=$('g8mAdminScreenshotToggle'),description=$('g8mAdminScreenshotDescription'),feedback=$('g8mAdminScreenshotFeedback');
 if(!toggle||!description||!feedback)return;
 const valid=teacher&&Boolean(openedUid)&&g8mScreenshotPolicy.uid===openedUid;
 toggle.checked=valid&&g8mScreenshotPolicy.allowed;
 toggle.disabled=!valid||!g8mScreenshotPolicy.ready||g8mScreenshotPolicy.saving;
 description.textContent=!valid?'Choose a student conversation first.':
  !g8mScreenshotPolicy.ready?'Loading permission…':
  g8mScreenshotPolicy.allowed?'Teacher permits student screenshots.':'Teacher does not permit student screenshots.';
 feedback.classList.toggle('is-error',Boolean(g8mScreenshotPolicy.error));
 feedback.textContent=g8mScreenshotPolicy.error?g8mScreenshotPolicy.error:
  g8mScreenshotPolicy.saving?'Saving setting…':
  !g8mScreenshotPolicy.ready?'Reading live setting…':
  `Student permission: ${g8mScreenshotPolicy.allowed?'Allowed':'Not permitted'}. When off, student view shows a prominent watermark. Teacher screenshots: Always permitted.`;
}
async function g8mSaveScreenshotPolicy(allowed){
 const uid=openedUid,owner=user?.uid;
 if(!teacher||!uid||!owner||g8mScreenshotPolicy.uid!==uid||!g8mScreenshotPolicy.ready||g8mScreenshotPolicy.saving)return;
 const previousAllowed=g8mScreenshotPolicy.allowed;
 g8mScreenshotPolicy.error='';
 g8mScreenshotPolicy.saving=true;g8mPaintScreenshotPolicy();
 try{
  // Never claim success before Firebase confirms the teacher-only write.
  await set(ref(rtdb,g8mScreenshotPolicyPath(uid)),{
   allowStudentScreenshots:allowed,updatedAtMs:serverTimestamp(),updatedByUid:owner
  });
  if(uid!==openedUid||owner!==user?.uid)return;
  g8mScreenshotPolicy.allowed=allowed;
  g8mScreenshotPolicy.error='';
 }catch(error){
  if(uid===openedUid&&owner===user?.uid){
   g8mScreenshotPolicy.allowed=previousAllowed;
   g8mScreenshotPolicy.error='Could not save permission. Check screenshot-policy RTDB rules, then try again.';
   console.warn('Teacher screenshot setting not saved:',error);
  }
 }finally{
  if(uid===openedUid&&owner===user?.uid){g8mScreenshotPolicy.saving=false;g8mPaintScreenshotPolicy();}
 }
}
$('g8mAdminScreenshotToggle')?.addEventListener('change',e=>{void g8mSaveScreenshotPolicy(Boolean(e.target.checked));});
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
   stopTyping();closeReactionPicker();clearUnsubs(rootUnsubs);clearUnsubs(activeUnsubs);g8mClearLinkedHistories();
   if(presenceHeartbeat){clearInterval(presenceHeartbeat);presenceHeartbeat=null;}
   ownPresencePath='';ownPresenceConnected=false;
   // Clear previous account's in-memory object URLs immediately. Purge stale
   // browser disk cache in the background; cache lookups also enforce owner UID.
   const nextPhotoOwner=String(account?.uid||'');
   if(!photoCacheOwnerInitialized || photoCacheOwnerUid!==nextPhotoOwner){
    photoCacheOwnerInitialized=true;
    photoCacheOwnerUid=nextPhotoOwner;
    photoAuthEpoch++;
    clearMemoryPhotoCache();
    g8mIkCorsBlobAllowed=null;
    void prunePhotoDiskCache(nextPhotoOwner);
   }
   g8mAdminReset();conversationMemory.clear();user=account;openedUid='';students.clear();summaries={};g8mResetScreenshotPolicy();
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
 $('g8mAdminToolsOpen').hidden=!teacher;
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
   summaries=snap.val()||{};renderSections();renderStudents();if(openedUid)showRelatedAccountThreads(openedUid);setConnection(true,'Live');
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
   renderSections();renderStudents();if(openedUid)showRelatedAccountThreads(openedUid);
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
   // Preview's sender must belong to the SAME latest summary/UID as lastText.
   lastRole:String(summaries[latest.uid]?.lastRole || ''),
  });
 }
 return result;
}
function groupForUid(uid){return allPeople().find(p=>p.uids.includes(uid))||null;}
function selectGroupThread(group){
 // Always send to the best available CURRENT student account. Unread messages
 // from a retired UID remain visible in the combined teacher timeline; they
 // must never redirect a new message into an obsolete account.
 const active=group.uids.filter(uid=>students.has(uid)&&students.get(uid)?.accountStatus!=='disabled');
 if(active.includes(group.uid))return group.uid;
 if(active.length)return active.sort((a,b)=>Number(summaries[b]?.lastAtMs||0)-Number(summaries[a]?.lastAtMs||0))[0];
 return group.uid;
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
// Admin inbox: identify the LAST sender without extra message reads.
// Most school directory names are "Surname, Given Name(s)"; a compact given
// name keeps the actual message visible in narrow phone/tablet inboxes.
function inboxPreviewSender(p){
 if(p.lastRole==='teacher')return 'You';
 if(p.lastRole!=='student')return '';
 const full=String(p.name||'').trim();
 const given=(full.includes(',')?full.substring(full.indexOf(',')+1):full).trim();
 return short(given.split(/\s+/).filter(Boolean).slice(0,2).join(' ')||'Student',24);
}
function createInboxPreview(p){
 const message=String(p.lastText||'').trim();
 const el=textEl('small','g8m-last-message','');
 const sender=message?inboxPreviewSender(p):'';
 if(sender){
  // Use DOM textContent instead of HTML to keep names/messages safe.
  el.append(textEl('b','',`${sender}: `),document.createTextNode(message));
  el.title=`${p.lastRole==='teacher'?'You':p.name}: ${message}`;
 }else{
  // Historic summaries may not have lastRole; never guess the sender.
  el.textContent=message||p.studentId||'Start a conversation';
  el.title=el.textContent;
 }
 return el;
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
  copy.append(createInboxPreview(p));
  row.append(copy);
  if(p.unreadCount)row.append(textEl('span','g8m-bubble-count',p.unreadCount>99?'99+':p.unreadCount));
  row.addEventListener('click',()=>{
   const currentIsGroup=p.uids.includes(openedUid);
   openChat(currentIsGroup?openedUid:selectGroupThread(p));
  });list.append(row);
 });
 if(!people.length)list.append(notice('No students match this filter. Try All or another section.'));
}
// A teacher sees ONE continuous timeline even when a student has had separate
// Firebase Auth accounts. Never copy/migrate a historic message to the new UID:
// this is view-only aggregation using each thread's existing teacher read access.
// Students themselves still see ONLY their own UID's private messages.
function showRelatedAccountThreads(uid){
 const oldPicker=$('g8mAccountThreads');if(oldPicker)oldPicker.remove();
 if(!teacher||uid!==openedUid)return;
 const group=groupForUid(uid);
 const linked=new Set((group?.uids||[]).filter(id=>id!==uid && (students.has(id)||summaries[id])));
 let changed=false;
 for(const [id,entry] of [...g8mLinkedHistories]){
  if(linked.has(id))continue;
  clearUnsubs(entry.unsubs);g8mLinkedHistories.delete(id);changed=true;
 }
 for(const id of linked){
  if(g8mLinkedHistories.has(id))continue;
  const entry={uid:id,recent:[],older:[],hasOlder:false,loading:false,
   exhausted:false,ready:false,error:false,hidden:{},unsubs:[]};
  g8mLinkedHistories.set(id,entry);changed=true;
  const stillHere=()=>teacher&&uid===openedUid&&g8mLinkedHistories.get(id)===entry;
  // The existing indexed recent query is real-time; older pages load only as
  // the user backreads. This avoids fetching an entire long chat at startup.
  entry.unsubs.push(onValue(recentMessageQuery(id),snap=>{
   if(!stillHere())return;
   const nextRecent=normalizeMessageSnapshot(snap).map(msg=>({...msg,__threadUid:id,__historical:true}));
   for(const incoming of nextRecent){
    if(!isDeletedMessage(incoming))continue;
    const previous=[...entry.recent,...entry.older].find(msg=>msg.id===incoming.id&&!isDeletedMessage(msg));
    if(previous)g8mRemoveDeletedPhotoCache(previous);
   }
   entry.recent=nextRecent;
   g8mPurgeHiddenPhotoCache(id,entry.hidden,entry);
   entry.ready=true;entry.error=false;
   if(!entry.exhausted && entry.recent.length>=G8M_RECENT_MESSAGES)entry.hasOlder=true;
   renderMessages();g8mUpdateLoadedStatus();
   if(g8mFollowLatest)g8mScheduleBottomIfFollowing();
   // Mark a previously unread old-account chat as seen once it is displayed,
   // without altering any message or accidentally creating a new chat.
   if(unread(summaries[id])>0&&document.visibilityState==='visible'){
    void Promise.all([
     set(ref(rtdb,`${studentPath(id)}/seen/teacher`),serverTimestamp()),
     set(ref(rtdb,`${summaryPath(id)}/unreadTeacher`),0)
    ]).catch(error=>console.warn('Prior conversation seen status:',error));
   }
  },error=>{
   if(!stillHere())return;
   entry.error=true;entry.ready=true;
   console.error('Prior account messages unavailable:',id,error);
   g8mUpdateLoadedStatus();
  }));
  // Honor teacher's per-thread "Delete for Me" preferences in historic chats.
  entry.unsubs.push(onValue(ref(rtdb,`${BASE}/hiddenFor/${user.uid}/${id}`),snap=>{
   if(!stillHere())return;
   entry.hidden=snap.val()||{};
   g8mPurgeHiddenPhotoCache(id,entry.hidden,entry);renderMessages();
  },error=>console.warn('Prior account hidden messages:',error)));
 }
 if(changed){renderMessages();g8mUpdateLoadedStatus();}
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
 // Deep links, inbox clicks and reopens must all route new outgoing messages
 // to the active student account even if they referenced a prior Auth UID.
 if(teacher){const group=groupForUid(uid);if(group)uid=selectGroupThread(group);}
 if(uid===openedUid && activeUnsubs.length){switchMobile('chat');g8mJumpLatest({settle:true});return;}
 g8mAdminReset();
 stopTyping();closeReactionPicker();
 if(openedUid && activeMessages.length){
  rememberConversation(openedUid);
 }
 selectedMobileMetaMessageId='';
 g8mHadLiveSnapshot=false;g8mNewIncomingWhileAway=0;g8mHistoryGesture=false;g8mEarlierLoadError='';g8mHistoryCheckRunning=false;
 g8mAwaitingFirstSnapshotUid=uid;
 g8mFollowLatest=true;g8mSmoothLatest=false;++g8mOpenScrollToken;
 clearUnsubs(activeUnsubs);g8mClearLinkedHistories();openedUid=uid;g8mResetScreenshotPolicy(uid);lastSnapshotKey='';activeReactions={};activeReadReceipts={};deletedMessageIndex={};hiddenMessageIds={};peerPresence=null;peerTyping=null;priorOwnSeenAt=null;seenSyncBusy=false;receiptCacheReady=false;updateTypingIndicator();updatePresenceLine();
 const warm=conversationMemory.get(uid);
 activeMessages=warm?.messages?.slice()||[];olderMessages=warm?.older?.slice()||[];
 hasOlder=warm?.hasOlder||false;historyExhausted=warm?.historyExhausted===true;olderLoading=false;activeAcks=warm?.acks||{};seenAt=warm?.seenAt||0;reply=null;renderReply();
 if(teacher){const p=person(uid),group=groupForUid(uid);$('g8mChatName').textContent=group?.name||p.name;$('g8mChatMeta').textContent=[group?.section||p.section,group?.studentId||p.studentId].filter(Boolean).join(' · ');$('g8mChatAvatar').textContent=iconLetter(group||p);$('g8mComposer').hidden=false;renderStudents();showRelatedAccountThreads(uid);}
 if(activeMessages.length||olderMessages.length)renderMessages();
 else $('g8mMessages').replaceChildren(notice('Loading messages…'));
 switchMobile('chat');
 g8mJumpLatest({settle:true});
 status('');
 updateChatFeedState(warm?'Showing recent messages · Syncing…':'Loading conversation…');
 // A single per-conversation listener is enough for instant student updates.
 // The toggle is never cached in localStorage, and students cannot write this
 // node when the documented RTDB rules are deployed.
 activeUnsubs.push(onValue(ref(rtdb,g8mScreenshotPolicyPath(uid)),snap=>{
  if(uid!==openedUid)return;
  const policy=snap.val();
  g8mScreenshotPolicy={uid,allowed:policy?.allowStudentScreenshots===true,ready:true,error:'',saving:g8mScreenshotPolicy.saving};
  g8mPaintScreenshotPolicy();
 },error=>{
  if(uid!==openedUid)return;
  console.warn('Screenshot policy cannot be read:',error);
  g8mScreenshotPolicy={uid,allowed:false,ready:false,error:'Permission unavailable. Screenshot settings need RTDB rules.',saving:false};
  g8mPaintScreenshotPolicy();
 }));
 const messagesRef=recentMessageQuery(uid);
 activeUnsubs.push(onValue(messagesRef,snap=>{
  if(uid!==openedUid)return;
  try{
   displayMessagesFromSnapshot(snap,uid);
   markSeen(uid).catch(err=>console.warn('Seen sync:',err));
  }catch(error){
   console.error('Messages render error:',error);
   updateChatFeedState('Couldn’t show these messages. Tap refresh to try again.',true);
   status('A chat message could not be displayed. Try Refresh Chat.',true);
  }
 },err=>{
  if(uid!==openedUid)return;
  console.error('Messages listener failed:',err);
  updateChatFeedState('Messages aren’t loading. Tap refresh to try again.',true);
  status(`Live messages unavailable: ${friendlyError(err)}`,true);
  // A one-time read can still work when a realtime listener is interrupted.
  refreshConversation(false);
 }));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/deleted`),snap=>{
  if(uid!==openedUid)return;
  deletedMessageIndex=snap.val()||{};if(reply&&isDeletedReference(reply.id)){reply.text='Message deleted';renderReply();}renderMessages();
 },err=>console.warn('Deleted index listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,`${BASE}/hiddenFor/${user.uid}/${uid}`),snap=>{
  if(uid!==openedUid)return;
  hiddenMessageIds=snap.val()||{};
  g8mPurgeHiddenPhotoCache(uid,hiddenMessageIds);renderMessages();
 },err=>console.warn('Hidden message listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/reactions`),snap=>{if(uid!==openedUid)return;activeReactions=snap.val()||{};updateReactionBadges();updateDetails();},err=>console.warn('Reactions listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/readReceipts`),snap=>{if(uid!==openedUid)return;activeReadReceipts=snap.val()||{};receiptCacheReady=true;refreshSeenLabels();updateDetails();},err=>console.warn('Read receipt listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/typing/${teacher?'student':'teacher'}`),snap=>{if(uid!==openedUid)return;peerTyping=snap.val();updateTypingIndicator();},err=>console.warn('Typing listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,teacher?`${BASE}/presence/students/${uid}`:`${BASE}/presence/teacher`),snap=>{if(uid!==openedUid)return;peerPresence=snap.val();updatePresenceLine();},err=>console.warn('Presence listener:',err)));
 activeUnsubs.push(onValue(ref(rtdb,`${studentPath(uid)}/acks`),snap=>{if(uid!==openedUid)return;const next=snap.val()||{};if(JSON.stringify(next)!==JSON.stringify(activeAcks)){activeAcks=next;renderMessages();}},err=>status(friendlyError(err),true)));
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
function messageById(id){return [...activeMessages,...olderMessages,...g8mHistoricMessages()].find(msg=>msg.id===String(id));}
const isDeletedMessage=msg=>!!(msg&&Number(msg.deletedAtMs)>0);
// One message-level acknowledgment for each genuine student submission.
// Shared projects are references, not photo attachments; both use /acks/{messageId}.
// No Firestore request is needed to determine whether a submission can be checked.
function isReviewableStudentSubmission(msg){
 if(!msg || isDeletedMessage(msg) || msg.senderRole!=='student')return false;
 if(msg.type==='project')return !!String(msg.projectId||'').trim();
 const attachments=Array.isArray(msg.attachments)?msg.attachments:Object.values(msg.attachments||{});
 return attachments.length>0;
}
const isDeletedReference=id=>!!deletedMessageIndex[String(id)]||isDeletedMessage(messageById(id));
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
 const raw=messageById(id)?.__historical?{}:(activeReactions[id]||{});
 const entries=Object.entries(raw).filter(([uid,emoji])=>uid && REACTION_EMOJIS.includes(emoji));
 const emojis=[...new Set(entries.map(([uid,emoji])=>emoji))];
 return {entries,emojis,count:entries.length,own:raw[user?.uid]||''};
}
function updateOneReactionBadge(node,id){
 const badge=node.querySelector('.g8m-reaction-chip');if(!badge)return;
 const r=reactionSummary(id);badge.hidden=isDeletedMessage(messageById(id))||!r.count;
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
 if(isDeletedMessage(msg))return '';
 const raw=typeof msg?.text==='string'?msg.text:'';
 const legacy=raw.trim();
 if(msg?.type==='image' && (legacy==='📷 Photo attachment' || legacy==='📸 Photo attachment'))return '';
 return raw;
}
function messageReferenceText(msg){
 if(isDeletedMessage(msg))return 'Message deleted';
 if(msg?.type==='project')return String(msg.projectName||'Shared project');
 return visibleMessageText(msg)||(msg?.type==='image'?'Photo':'Message');
}
function replyToMessage(id){
 const msg=messageById(id);if(!msg||isDeletedMessage(msg))return;
 if(msg.__historical){status('Previous-account messages are shown as history. New replies go to the current student account.');return;}
 reply={id:msg.id,text:messageReferenceText(msg)};
 renderReply();closeReactionPicker();$('g8mTextInput').focus();
}
// V5.15: One scroll owner. User gestures always cancel pending auto-scroll.
// No MutationObserver or scroll-event bounce-to-bottom: both caused the V5.14 flicker.
const G8M_LATEST_THRESHOLD = 48;
let g8mFollowLatest=true,g8mSmoothLatest=false,g8mBottomFrame=0,g8mOpenScrollToken=0;
let g8mHadLiveSnapshot=false,g8mNewIncomingWhileAway=0;
// One guarded post-render landing per frame, never a scroll-event feedback loop.
let g8mAwaitingFirstSnapshotUid='',g8mLayoutFollowLock=0,g8mLayoutFollowSequence=0;
let g8mHistoryGesture=false;
let g8mTouchStartY=0,g8mTouchStartX=0;
function g8mBottomGap(){
 const feed=$('g8mMessages');
 return feed&&feed.clientHeight>0 ? Math.max(0,feed.scrollHeight-feed.clientHeight-feed.scrollTop) : 0;
}
function g8mUpdateScrollLatest(){
 const button=$('g8mScrollLatest'),feed=$('g8mMessages');
 if(!button||!feed)return;
 const away=openedUid&&feed.clientHeight>0&&g8mBottomGap()>G8M_LATEST_THRESHOLD&&!(g8mLayoutFollowLock&&g8mFollowLatest);
 button.hidden=!away;
 const count=$('g8mNewMessageCount');
 if(count){
  count.hidden=!(away&&g8mNewIncomingWhileAway);
  count.textContent=g8mNewIncomingWhileAway>9?'9+':String(g8mNewIncomingWhileAway||'');
 }
 const label=g8mNewIncomingWhileAway?`Jump to latest message · ${g8mNewIncomingWhileAway} new`:'Jump to latest message';
 button.title=label;button.setAttribute('aria-label',label);
}
function g8mCancelAutoScroll(){
 // Touchmove/wheel fire repeatedly during a real gesture. Never call scrollTo
 // on every touchmove: that would recreate the very same scroll flicker.
 if(!g8mFollowLatest&&!g8mSmoothLatest)return;
 const wasSmooth=g8mSmoothLatest;
 g8mFollowLatest=false;g8mSmoothLatest=false;++g8mOpenScrollToken;
 g8mAwaitingFirstSnapshotUid='';g8mLayoutFollowLock=0;++g8mLayoutFollowSequence;
 if(g8mBottomFrame){cancelAnimationFrame(g8mBottomFrame);g8mBottomFrame=0;}
 if(wasSmooth){
  const feed=$('g8mMessages');if(feed)feed.scrollTo({top:feed.scrollTop,behavior:'instant'});
 }
 g8mUpdateScrollLatest();
}
function g8mJumpLatest({smooth=false,settle=false}={}){
 const feed=$('g8mMessages');if(!feed)return;
 const token=++g8mOpenScrollToken,uid=openedUid;
 g8mFollowLatest=true;
 g8mNewIncomingWhileAway=0;g8mHistoryGesture=false;
 // Retain follow-latest across the two layout frames of this explicit jump.
 const landingSequence=++g8mLayoutFollowSequence;
 g8mLayoutFollowLock=landingSequence;
 g8mSmoothLatest=!!smooth&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const atBottom=()=>Math.max(0,feed.scrollHeight-feed.clientHeight);
 feed.scrollTo({top:atBottom(),behavior:g8mSmoothLatest?'smooth':'instant'});
 if(settle){
  // Layout may appear a frame after switching mobile panes; never use timers
  // that can snap an active backreader several hundred milliseconds later.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(token===g8mOpenScrollToken&&uid===openedUid&&g8mFollowLatest&&!g8mSmoothLatest){
    feed.scrollTop=atBottom();g8mUpdateScrollLatest();
   }
   if(g8mLayoutFollowLock===landingSequence)g8mLayoutFollowLock=0;
  }));
 }else if(g8mSmoothLatest){
  if(g8mLayoutFollowLock===landingSequence)g8mLayoutFollowLock=0;
 }else{
  requestAnimationFrame(()=>{
   if(g8mLayoutFollowLock===landingSequence)g8mLayoutFollowLock=0;
  });
 }
 if(g8mSmoothLatest){
  // Observe, do not force a hard snap at the end of the animation.
  const started=performance.now();
  const finish=()=>{
   if(token!==g8mOpenScrollToken||uid!==openedUid||!g8mSmoothLatest)return;
   if(g8mBottomGap()<=G8M_LATEST_THRESHOLD||performance.now()-started>1400){
    g8mSmoothLatest=false;
    // If a user interrupted this scroll, their input handler revoked our token.
    g8mFollowLatest=g8mBottomGap()<=G8M_LATEST_THRESHOLD;
    g8mUpdateScrollLatest();return;
   }
   requestAnimationFrame(finish);
  };
  requestAnimationFrame(finish);
 }
 g8mUpdateScrollLatest();
}
function g8mLandAtBottomAfterRender(){
 if(!g8mFollowLatest||!openedUid)return;
 const feed=$('g8mMessages'),uid=openedUid;
 if(!feed)return;
 const sequence=++g8mLayoutFollowSequence;
 g8mLayoutFollowLock=sequence;
 const land=()=>{
  if(sequence!==g8mLayoutFollowSequence||uid!==openedUid||!g8mFollowLatest)return false;
  feed.scrollTop=Math.max(0,feed.scrollHeight-feed.clientHeight);
  return true;
 };
 // A single immediate alignment plus two layout frames handles the mobile
 // panel reveal / late intrinsic image sizes, without a timer or scroll loop.
 land();
 requestAnimationFrame(()=>{
  if(!land())return;
  requestAnimationFrame(()=>{
   if(land()&&g8mLayoutFollowLock===sequence){g8mLayoutFollowLock=0;g8mUpdateScrollLatest();}
  });
 });
}
function g8mScheduleBottomIfFollowing(){
 // Called after a new message or an image RESIZES, not by scroll or mutation
 // events. One frame maximum; never trigger recursively from the scroll event.
 if(!g8mFollowLatest||g8mSmoothLatest||g8mBottomFrame)return;
 const token=g8mOpenScrollToken,uid=openedUid;
 g8mBottomFrame=requestAnimationFrame(()=>{
  g8mBottomFrame=0;
  if(token===g8mOpenScrollToken&&uid===openedUid&&g8mFollowLatest&&!g8mSmoothLatest){
   const feed=$('g8mMessages');
   if(feed)feed.scrollTop=Math.max(0,feed.scrollHeight-feed.clientHeight);
  }
  g8mUpdateScrollLatest();
 });
}
const g8mScrollFeed=$('g8mMessages');
$('g8mScrollLatest').addEventListener('click',()=>g8mJumpLatest({smooth:true}));
// History is deliberately not downloaded in bulk on open: a conversation can
// contain thousands of messages and photos. Fetch one indexed page whenever the
// reader reaches the top, regardless of whether they used a wheel, trackpad,
// scrollbar thumb, keyboard, touchscreen, or an accessibility scroll action.
// The FOLLOW-LATEST flag prevents eager loading on initial opening at scrollTop=0.
let g8mOlderAutoloadQueued=false;
let g8mAdjustingScroll=false;
function g8mSetPreservedScroll(feed,next){
 if(!feed || !Number.isFinite(next))return;
 const position=Math.max(0,Math.min(next,Math.max(0,feed.scrollHeight-feed.clientHeight)));
 if(Math.abs(feed.scrollTop-position)<0.75)return;
 g8mAdjustingScroll=true;
 feed.scrollTop=position;
 // A browser scroll event may run in another task after a programmatic correction.
 requestAnimationFrame(()=>{g8mAdjustingScroll=false;});
}
// Track only actual *photo-driven* changes above the viewport. If a thumbnail
// changes intrinsic aspect ratio, preserve the message at the reader's position.
const g8mImageRowHeights=new WeakMap();
const g8mObservedPhotoRows=new Set();
let g8mPhotoSizeObserver=null;
function g8mWatchPhotoRows(){
 if(typeof ResizeObserver!=='function')return;
 if(!g8mPhotoSizeObserver){
  g8mPhotoSizeObserver=new ResizeObserver(entries=>{
   if(!openedUid)return;
   const feed=$('g8mMessages'),bounds=feed.getBoundingClientRect();
   const preserve=!g8mFollowLatest&&!olderLoading&&!g8mAdjustingScroll;
   let delta=0;
   for(const entry of entries){
    const el=entry.target;
    const current=el.getBoundingClientRect().height;
    const previous=g8mImageRowHeights.get(el);
    // Always update the baseline, even during our own scroll correction.
    // Otherwise one skipped ResizeObserver delivery can be counted twice.
    g8mImageRowHeights.set(el,current);
    if(preserve && previous!==undefined && el.isConnected && el.getBoundingClientRect().bottom<=bounds.top+3){
     delta+=current-previous;
    }
   }
   if(Math.abs(delta)>0.75)g8mSetPreservedScroll(feed,feed.scrollTop+delta);
  });
 }
 // Keep subscriptions stable across ordinary metadata changes. Re-observing
 // every photo on every ack used to trigger needless layout measurements.
 for(const row of [...g8mObservedPhotoRows]){
  if(row.isConnected)continue;
  g8mPhotoSizeObserver.unobserve(row);g8mObservedPhotoRows.delete(row);
 }
 for(const row of $('g8mMessages').querySelectorAll('.g8m-message:has(.g8m-photo-grid,.g8m-local-photo-grid)')){
  if(g8mObservedPhotoRows.has(row))continue;
  g8mImageRowHeights.set(row,row.getBoundingClientRect().height);
  g8mObservedPhotoRows.add(row);g8mPhotoSizeObserver.observe(row);
 }
}

function g8mMaybeAutoloadOlder(){
 if(g8mOlderAutoloadQueued||!openedUid||!g8mHadLiveSnapshot||g8mFollowLatest||olderLoading||!g8mHasMoreHistory())return;
 if(g8mEarlierLoadError || g8mScrollFeed.scrollTop>140 || g8mScrollFeed.clientHeight<1 || g8mAdjustingScroll)return;
 const uid=openedUid;
 g8mOlderAutoloadQueued=true;
 queueMicrotask(()=>{
  g8mOlderAutoloadQueued=false;
  if(uid===openedUid&&g8mHadLiveSnapshot&&!g8mFollowLatest&&!olderLoading&&!g8mAdjustingScroll&&g8mHasMoreHistory()&&g8mScrollFeed.scrollTop<=140){
   void loadOlder();
  }
 });
}
g8mScrollFeed.addEventListener('scroll',()=>{
 // A programmatic scroll can move upward during smooth scrolling. Never fight it.
 // A DOM replacement can temporarily change scrollHeight and emit a scroll
 // event before the new layout lands. Do not treat it as user backreading.
 if(!g8mSmoothLatest&&!g8mLayoutFollowLock){
  // A lazy image or flex layout update can fire a scroll event with a large
  // temporary bottom gap. Only explicit wheel/touch/keyboard/pointer gestures
  // may turn follow-latest OFF; this event may turn it back ON at the bottom.
  // Programmatic position changes must never switch the reader back to
  // follow-latest while they are browsing old messages.
  if(g8mFollowLatest&&g8mBottomGap()<=G8M_LATEST_THRESHOLD)g8mNewIncomingWhileAway=0;
 }
 // Older history is not limited to 100/150 messages; keep paging as the
 // reader backscrolls. No gesture-only gate that fails on scrollbar dragging.
 g8mMaybeAutoloadOlder();
 g8mUpdateScrollLatest();
},{passive:true});
g8mScrollFeed.addEventListener('wheel',event=>{
 if(Math.abs(event.deltaY)>0){g8mHistoryGesture=event.deltaY<0;g8mCancelAutoScroll();if(event.deltaY<0)g8mMaybeAutoloadOlder();}
},{passive:true});
g8mScrollFeed.addEventListener('touchstart',event=>{
 const t=event.touches?.[0];if(t){g8mTouchStartY=t.clientY;g8mTouchStartX=t.clientX;}
},{passive:true});
g8mScrollFeed.addEventListener('touchmove',event=>{
 const t=event.touches?.[0];if(!t)return;
 const dy=t.clientY-g8mTouchStartY,dx=t.clientX-g8mTouchStartX;
 if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){g8mHistoryGesture=dy>0;g8mCancelAutoScroll();if(dy>0)g8mMaybeAutoloadOlder();}
},{passive:true});
g8mScrollFeed.addEventListener('keydown',event=>{
 if(['PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' '].includes(event.key)){
  g8mHistoryGesture=['PageUp','Home','ArrowUp'].includes(event.key);g8mCancelAutoScroll();if(g8mHistoryGesture)g8mMaybeAutoloadOlder();
 }
});
g8mScrollFeed.addEventListener('pointerdown',event=>{
 if(event.pointerType==='mouse' && event.target===g8mScrollFeed){g8mCancelAutoScroll();g8mMaybeAutoloadOlder();}
},{passive:true});
if(typeof ResizeObserver==='function'){
 const feedSizeObserver=new ResizeObserver(()=>{
  if(openedUid&&g8mFollowLatest&&!g8mSmoothLatest)g8mScheduleBottomIfFollowing();
 });
 feedSizeObserver.observe(g8mScrollFeed);
}
window.addEventListener('resize',()=>{
 syncMobileMessageMetaVisibility();
 if(g8mFollowLatest)g8mScheduleBottomIfFollowing();else g8mUpdateScrollLatest();
});

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
 g8mFollowLatest=false;g8mSmoothLatest=false;
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
 if(!messageById(id)||messageById(id).__historical)return;
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
 const tombstone=isDeletedMessage(messageById(id));
 $('g8mReactionOptions').hidden=tombstone;
 $('g8mPickerReply').hidden=tombstone;
 $('g8mPickerDelete').hidden=!messageById(id);
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
 if(!openedUid||!user||!REACTION_EMOJIS.includes(emoji)||messageById(id)?.__historical||isDeletedMessage(messageById(id)))return;
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
 if(!messageById(id)||messageById(id).__historical)return;
 detailsMessageId=id;closeReactionPicker();updateDetails();detailsOverlay.hidden=false;
 $('g8mDetailsClose').focus();
}
function updateDetails(){
 if(!detailsMessageId)return;
 const msg=messageById(detailsMessageId);if(!msg)return;
 const own=msg.senderUid===user?.uid;
 $('g8mDetailsPreview').textContent=short(messageReferenceText(msg),260);
 const deleted=isDeletedMessage(msg),bySelf=msg.deletedByUid===user?.uid;
 $('g8mDetailsDeleted').hidden=!deleted;
 $('g8mDetailsDeletedBy').textContent=deleted?(bySelf?'You':(msg.senderRole==='teacher'?'Teacher':'Student')):'—';
 $('g8mDetailsDeletedAt').textContent=deleted?absoluteTime(msg.deletedAtMs):'—';
 $('g8mDetailsSeenRow').hidden=deleted;
 $('g8mDetailsReactionsRow').hidden=deleted;
 $('g8mDetailsDelete').hidden=deleted;
 $('g8mDetailsDelete').disabled=deleteMessageBusy;
 $('g8mDetailsSent').textContent=absoluteTime(msg.createdAtMs);
 $('g8mDetailsSeenLabel').textContent=own?`Seen by ${teacher?'Student':'Teacher'}`:'Seen by you';
 const exact=Number(activeReadReceipts[detailsMessageId]?.[own?peerRole():role()]||0);
 const oldSeen=own?Number(seenAt||0)>=messageTime(msg)&&messageTime(msg)>0:Number(priorOwnSeenAt||0)>=messageTime(msg)&&messageTime(msg)>0;
 $('g8mDetailsSeen').textContent=exact?absoluteTime(exact):(oldSeen?'Previously seen · exact time not recorded':'Not yet seen');
 const r=reactionSummary(detailsMessageId);
 $('g8mDetailsReactions').textContent=r.count?r.entries.map(([uid,emoji])=>`${emoji} ${uid===user.uid?'You':teacher?'Student':'Teacher'}`).join(' · '):'None';
}
// V5.15: Delete for You (private RTDB preference) or Unsend for Everyone
// (sender-only atomic tombstone replacement + deleted-id index).
const deleteOverlay=$('g8mDeleteOverlay');
function openDeleteDialog(id){
 const msg=messageById(id);
 if(!msg||msg.__historical||!user||deleteMessageBusy)return;
 deleteMessageTarget={id:String(id),uid:openedUid,by:user.uid};
 closeDetails();closeReactionPicker();
 const own=msg.senderUid===user.uid;
 $('g8mDeleteForEveryone').hidden=!own||isDeletedMessage(msg);
 $('g8mDeleteText').textContent=isDeletedMessage(msg)
  ?'Hide the deleted-message notice from your view?'
  :own?'Choose what happens to this message.':'This message will disappear from your chat only.';
 deleteOverlay.hidden=false;$('g8mDeleteClose').focus();
}
function closeDeleteDialog(){if(deleteMessageBusy)return;deleteOverlay.hidden=true;deleteMessageTarget=null;}
function g8mPurgeHiddenPhotoCache(threadUid,hidden,historyEntry=null){
 // A remote Delete-for-Me must also evict already cached private bytes.
 // Previous account messages are never moved from their original RTDB path.
 if(!hidden||typeof hidden!=='object')return;
 const messages=historyEntry?[...historyEntry.recent,...historyEntry.older]:[...activeMessages,...olderMessages];
 for(const msg of messages){
  if(!hidden[msg.id]||(msg.__threadUid||openedUid)!==threadUid)continue;
  const atts=Array.isArray(msg.attachments)?msg.attachments:Object.values(msg.attachments||{});
  for(const att of atts)if(att?.path)deleteCachedPhoto(att.path,att.driveFileId||att.imagekitFileId);
 }
}
function g8mRemoveDeletedPhotoCache(previous){
 const attachments=Array.isArray(previous?.attachments)?previous.attachments:Object.values(previous?.attachments||{});
 for(const att of attachments)if(att?.path)deleteCachedPhoto(att.path,att.driveFileId||att.imagekitFileId);
 // The fullscreen viewer must never keep showing a photo after it was unsent.
 if(!imageViewer.hidden&&photoGallery.some(att=>att.messageId===previous?.id)){
  $('g8mImageClose').click();
 }
}
async function deleteMessageForMe(){
 if(deleteMessageBusy)return;
 const target=deleteMessageTarget;if(!target||!user||target.by!==user.uid)return;
 deleteMessageBusy=true;
 try{
  // Save per-account hidden markers in RTDB (across devices). This does NOT
  // change what the other participant can see.
  await set(ref(rtdb,`${BASE}/hiddenFor/${target.by}/${target.uid}/${target.id}`),true);
  if(target.uid===openedUid){
   hiddenMessageIds[target.id]=true;
   const hiddenMsg=[...activeMessages,...olderMessages].find(m=>m.id===target.id);
   if(hiddenMsg)g8mRemoveDeletedPhotoCache(hiddenMsg);
   renderMessages();
  }
  status('Message removed from your view ✓');
  deleteOverlay.hidden=true;deleteMessageTarget=null;
 }catch(error){status(`Delete for you failed: ${friendlyError(error)}`,true);}
 finally{deleteMessageBusy=false;}
}
async function unsendMessageForEveryone(){
 if(deleteMessageBusy)return;
 const target=deleteMessageTarget,msg=target&&messageById(target.id);
 if(!target||!msg||!user||msg.senderUid!==user.uid||target.uid!==openedUid||isDeletedMessage(msg))return;
 deleteMessageBusy=true;
 try{
  // Replace original text/attachments/project reference, not merely hide them
  // with CSS. Atomic multi-location update also records the deletion index,
  // so older quoted replies never expose the old replyText snippet.
  const deletedAt=serverTimestamp(),path=studentPath(target.uid);
  const tombstone={text:'',type:'text',senderUid:msg.senderUid,senderRole:msg.senderRole,
   createdAtMs:msg.createdAtMs,deletedByUid:user.uid,deletedAtMs:deletedAt};
  await update(ref(rtdb),{
   [`${path}/messages/${target.id}`]:tombstone,
   [`${path}/deleted/${target.id}`]:{byUid:user.uid,atMs:serverTimestamp()}
  });
  g8mRemoveDeletedPhotoCache(msg);
  // Message content removed from RTDB; do not keep an old local copy cached.
  if(target.uid===openedUid){
   deletedMessageIndex[target.id]={byUid:user.uid,atMs:Date.now()};
   for(const item of [...activeMessages,...olderMessages]){
    if(item.id===target.id){
     Object.keys(item).forEach(k=>{if(!['id','senderUid','senderRole','createdAtMs'].includes(k))delete item[k];});
     Object.assign(item,{text:'',type:'text',deletedByUid:user.uid,deletedAtMs:Date.now()});
    }
   }
   renderMessages();
  }
  // Avoid leaking the removed text in the student-list preview when it was
  // the latest message. A one-time RTDB read happens ONLY upon unsending.
  try{
   const summaryRef=ref(rtdb,summaryPath(target.uid));
   const snapshot=await get(summaryRef);
   const value=snapshot.val()||{};
   if(Math.abs(Number(value.lastAtMs||0)-Number(msg.createdAtMs||0))<10000){
    await set(ref(rtdb,`${summaryPath(target.uid)}/lastText`),'Message deleted');
   }
  }catch(error){console.warn('Inbox preview update pending:',error);}
  deleteOverlay.hidden=true;deleteMessageTarget=null;
  status('Message unsent ✓ · The conversation now shows a deletion notice.');
 }catch(error){status(`Could not unsend message: ${friendlyError(error)}. Check RTDB rules deployment.`,true);}
 finally{deleteMessageBusy=false;}
}
$('g8mDeleteCancel').addEventListener('click',closeDeleteDialog);
$('g8mDeleteClose').addEventListener('click',closeDeleteDialog);
$('g8mDeleteForMe').addEventListener('click',()=>void deleteMessageForMe());
$('g8mDeleteForEveryone').addEventListener('click',()=>void unsendMessageForEveryone());
deleteOverlay.addEventListener('click',event=>{if(event.target===deleteOverlay)closeDeleteDialog();});
$('g8mDetailsDelete').addEventListener('click',()=>{if(detailsMessageId)openDeleteDialog(detailsMessageId);});
$('g8mPickerDelete').addEventListener('click',()=>{if(menuMessageId)openDeleteDialog(menuMessageId);});

function closeDetails(){detailsOverlay.hidden=true;detailsMessageId='';}
$('g8mDetailsClose').addEventListener('click',closeDetails);
detailsOverlay.addEventListener('click',event=>{if(event.target===detailsOverlay)closeDetails();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeReactionPicker();if(!detailsOverlay.hidden)closeDetails();if(!deleteOverlay.hidden)closeDeleteDialog();}});
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
$('g8mTextInput').addEventListener('focus',()=>setTimeout(()=>{if(g8mFollowLatest)g8mJumpLatest();else g8mUpdateScrollLatest();},120));

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
   const cached=cachedPhotoUrl(entry.path,entry.driveFileId||entry.imagekitFileId,entry.provider==='imagekit'?'thumb':'full');
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
   const url=await privatePhotoURL(att,1,att.provider==='imagekit'?'thumb':'full'); // Decorative layers are lower priority.
   if(back.isConnected&&picture.isConnected)picture.src=url;
  }catch(error){console.warn('Stacked photo preview unavailable:',error?.message||error);}
 }));
}
// V5.18: Messenger-style display groups. Each message keeps its own RTDB ID,
// status and actions; only consecutive messages from the SAME sender with a
// real timestamp gap of <= 60 seconds share one visual group.
const G8M_GROUP_WINDOW_MS = 60_000;
function g8mSameVisualGroup(first, second){
 if(!first||!second||!first.senderUid||first.senderUid!==second.senderUid)return false;
 const a=Number(first.createdAtMs),b=Number(second.createdAtMs);
 return Number.isFinite(a)&&Number.isFinite(b)&&a>0&&b>=a&&b-a<=G8M_GROUP_WINDOW_MS&&localDayKey(a)===localDayKey(b);
}
function g8mPeerInitial(msg){
 if(!teacher)return 'T'; // The student's incoming peer is the ICT Teacher.
 return iconLetter(person(String(msg.senderUid||'')))||'S';
}
function g8mAddGroupAvatar(anchor,msg){
 const circle=textEl('span','g8m-thread-avatar'+(!teacher?' is-teacher':''),g8mPeerInitial(msg));
 circle.setAttribute('aria-label',teacher?'Student profile initial':'Teacher profile initial');
 circle.setAttribute('role','img');
 anchor.append(circle);
}
// Explicit SELF-send intent: render the bubble WITHOUT the automatic
// initial-bottom snap, then animate the same way as the centered down arrow.
function g8mScrollAfterOwnSend(render){
 const wasFollowing=g8mFollowLatest;
 g8mFollowLatest=false;
 render(); // preserves an existing reading anchor even when far up the feed
 const feed=$('g8mMessages');
 // Disable interpolation only if already right at bottom, or OS requests it.
 g8mJumpLatest({smooth:!!feed&&g8mBottomGap()>8,settle:false});
 // Reflow after the send must not forcibly reset an ongoing smooth animation.
 if(!wasFollowing)g8mUpdateScrollLatest();
}
// Stable DOM update: keep unchanged bubbles and decoded images connected to the
// real scroll container. A full replaceChildren() used to reset scroll state,
// layout, and image loading even for a trivial Seen/ack change.
function g8mReconcileChatRows(feed,fragment){
 const existing=new Map();
 for(const node of feed.children)if(node.dataset?.chatKey)existing.set(node.dataset.chatKey,node);
 const desired=[];
 for(const candidate of [...fragment.children]){
  if(candidate.classList.contains('g8m-reuse-marker')){
   const stable=existing.get(candidate.dataset.chatKey);
   if(stable){desired.push(stable);continue;}
  }
  if(candidate.dataset?.chatKey){
   const stable=existing.get(candidate.dataset.chatKey);
   if(stable?.dataset?.renderRevision===candidate.dataset.renderRevision){desired.push(stable);continue;}
  }
  desired.push(candidate);
 }
 const keep=new Set(desired);
 for(const child of [...feed.children])if(!keep.has(child))child.remove();
 let next=null;
 for(let i=desired.length-1;i>=0;i--){
  const item=desired[i];
  if(item.parentNode!==feed || item.nextSibling!==next)feed.insertBefore(item,next);
  next=item;
 }
}
function g8mRowRevision(msg,group){
 const uid=msg.__threadUid||openedUid;
 const deleted=isDeletedMessage(msg);
 // Include only fields which can change the shape of the bubble. Seen/reactions
 // are updated in place by existing handlers; do not rebuild photo rows for them.
 return JSON.stringify([uid,msg.id,msg.senderUid,msg.senderRole,msg.type,msg.text,
  msg.createdAtMs,msg.replyTo,msg.replyText,msg.projectId,msg.projectName,
  msg.deletedAtMs,msg.deletedByUid,deleted,msg.__photoPending?.state,msg.__photoPending?.error,
  msg.__photoPending?.caption, activeAcks[msg.id]?.status||'',
  msg.attachments,group.joined,group.hasNext,group.last,
  selectedMobileMetaMessageId===String(msg.id),
  quoteFocusId===String(msg.id)&&Date.now()<quoteFocusUntil]);
}
// A reused bubble may still contain a photo waiting to enter the viewport.
// A new IntersectionObserver must re-register it when a Seen/ack snapshot
// replaces the prior observer. Otherwise older images can remain blank forever.
function g8mCollectWaitingPhotos(row,msg,uid,photosToLoad,stackedPhotosToLoad){
 const attachments=Array.isArray(msg.attachments)?msg.attachments:Object.values(msg.attachments||{});
 if(!attachments.length)return;
 for(const button of row.querySelectorAll('.g8m-photo-grid button[data-photo-path]')){
  if(['ready','fetching','failed'].includes(button.dataset.photoState))continue;
  const att=attachments.find(a=>a?.path===button.dataset.photoPath);
  if(att&&att.path.startsWith(`g8Messages/${uid}/${msg.id}/`)){
   photosToLoad.push({att:{...att,studentUid:uid,messageId:msg.id},button});
  }
 }
 for(const back of row.querySelectorAll('.g8m-stack-back')){
  const picture=back.querySelector('img');
  if(!picture || picture.getAttribute('src'))continue;
  const n=back.className.match(/g8m-stack-back-(\d+)/),index=n?Number(n[1]):-1;
  const att=attachments[index];
  if(att?.path?.startsWith(`g8Messages/${uid}/${msg.id}/`)){
   stackedPhotosToLoad.push({att:{...att,studentUid:uid,messageId:msg.id},picture,back});
  }
 }
}
function renderMessages(){
 if(!openedUid)return;
 if(photoVisibilityObserver){photoVisibilityObserver.disconnect();photoVisibilityObserver=null;}
 const log=$('g8mMessages');
 const previousHeight=log.scrollHeight;
 const previousScrollTop=log.scrollTop;
 // Preserve what the user was actually reading, not the scrollHeight delta.
 // A new message appended at the bottom must NOT move an older message.
 const readingAnchor=!g8mFollowLatest?[...log.querySelectorAll('.g8m-message[data-message-id]')].find(node=>{
  const box=node.getBoundingClientRect(),viewport=log.getBoundingClientRect();
  return box.bottom>viewport.top+3&&box.top<viewport.bottom-3;
 }):null;
 const readingAnchorKey=readingAnchor?.dataset.chatKey||'';
 const readingAnchorTop=readingAnchor?.getBoundingClientRect().top||0;
 // Reuse the original image elements when other chat metadata changes.
 // Otherwise frequent Seen/reaction/ack updates replace loading thumbnails,
 // leaving them blank even when the Drive request later succeeds.
 const g8mExistingRows=new Map([...log.querySelectorAll('.g8m-message[data-chat-key]')].map(row=>[row.dataset.chatKey,row]));
 const previousPhotoButtons=new Map();
 log.querySelectorAll('.g8m-photo-grid button[data-photo-path]').forEach(button=>{
  previousPhotoButtons.set(button.dataset.photoPath,button);
 });
 const version=++renderVersion;
 const optimistic = [...pendingPhotoJobs.values()]
  .filter(job=>job.uid===openedUid)
  .map(job=>({id:job.id,senderUid:job.senderUid,createdAtMs:job.createdAtMs,__photoPending:job}));
 const seenMessageKeys=new Set();
 const shown=[...g8mHistoricMessages(),...olderMessages,...activeMessages,...g8mAdminFocusedMessages,...optimistic]
  .filter(x=>{
   if(!x?.id||(x.__historical?g8mLinkedHistories.get(x.__threadUid)?.hidden[x.id]:hiddenMessageIds[x.id]))return false;
   const key=`${x.__threadUid||openedUid}/${x.id}`;
   if(seenMessageKeys.has(key))return false;
   seenMessageKeys.add(key);return true;
  }).sort(compareMessages);
 const content=document.createDocumentFragment();
 // Compute group neighbors from the exact rendered order (including local
 // Sending photos), respecting deleted/hidden messages and date boundaries.
 const g8mGrouping=new Map();
 shown.forEach((msg,index)=>{
  const joined=g8mSameVisualGroup(shown[index-1],msg);
  const hasNext=g8mSameVisualGroup(msg,shown[index+1]);
  g8mGrouping.set(`${msg.__threadUid||openedUid}/${msg.id}`,{joined,hasNext,last:!hasNext});
 });
 const photosToLoad=[];
 const stackedPhotosToLoad=[];
 if(!shown.length){
  log.replaceChildren(notice('Your private conversation starts here. Send a question, a message, or a picture.'));
  g8mUpdateScrollLatest();return;
 }
 if(g8mHasMoreHistory()){
  const load=textEl('button','g8m-load-older',olderLoading?'Loading earlier messages…':'↑ Load earlier messages (keep scrolling for more)');
  load.disabled=olderLoading;load.type='button';load.dataset.chatKey='older-loader';load.dataset.renderRevision=String(olderLoading);load.addEventListener('click',loadOlder);content.append(load);
 }
 let currentDay='';
 for(const msg of shown){
  try{
   const at=safeStamp(msg.createdAtMs);
   const date=localDayKey(at);
   if(date!==currentDay){
    currentDay=date;
    const divider=textEl('div','g8m-date','');
    divider.setAttribute('role','separator');
    divider.setAttribute('aria-label',chatDayDividerLabel(at));
    divider.append(textEl('span','g8m-date-label',chatDayDividerLabel(at)));divider.dataset.chatKey='day:'+date;divider.dataset.renderRevision=chatDayDividerLabel(at);
    content.append(divider);
   }
   const mine=msg.senderUid===user?.uid;
   const messageUid=msg.__threadUid||openedUid;
   const historic=!!msg.__historical;
   const group=g8mGrouping.get(`${messageUid}/${msg.id}`)||{joined:false,hasNext:false,last:true};
   const rowKey=`message:${messageUid}:${msg.id}`;
   const rowRevision=g8mRowRevision(msg,group);
   const priorRow=g8mExistingRows.get(rowKey);
   if(priorRow?.dataset.renderRevision===rowRevision){
    // Keep the existing loaded image and its click listener. Re-arm any
    // not-yet-visible images after rebuilding the shared lazy-load observer.
    g8mCollectWaitingPhotos(priorRow,msg,messageUid,photosToLoad,stackedPhotosToLoad);
    const marker=textEl('span','g8m-reuse-marker','');marker.dataset.chatKey=rowKey;content.append(marker);continue;
   }
   const item=textEl('article','g8m-message'+(mine?' own':'')+
    (group.joined?' g8m-group-joined':'')+
    (group.hasNext?' g8m-group-has-next':'')+
    (group.last?' g8m-group-last':'') ,'');
   item.dataset.messageId=String(msg.id);item.dataset.chatKey=rowKey;item.dataset.renderRevision=rowRevision;
   if(historic)item.dataset.historical='true';
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
    anchor.append(label);
    if(!mine&&group.last)g8mAddGroupAvatar(anchor,msg);
    item.append(anchor);
    item.append(textEl('div','g8m-msg-meta',formatTime(job.createdAtMs)));
    content.append(item);
    continue;
   }
   if(isDeletedMessage(msg)){
    item.classList.add('g8m-deleted-message');
    const marker=textEl('div','g8m-deleted-bubble','⊘  '+(msg.senderUid===user?.uid?'You deleted a message':'Message deleted'));
    item.append(marker);
   }
   if(!isDeletedMessage(msg) && msg.replyText){
    const originalId=String(msg.replyTo||'');
    const quote=textEl(originalId&&!historic?'button':'div','g8m-quoted'+(originalId&&!historic?' g8m-quote-link':''),short((!historic&&isDeletedReference(originalId))?'Message deleted':(['📷 Photo attachment','📸 Photo attachment'].includes(String(msg.replyText).trim())?'Photo':msg.replyText),180));
    if(originalId&&!historic){quote.type='button';quote.title='Jump to original message';quote.setAttribute('aria-label','Jump to original message');quote.addEventListener('click',()=>void jumpToQuotedMessage(originalId));}
    item.append(quote);
   }
   const visibleText=visibleMessageText(msg);
   if(!isDeletedMessage(msg) && visibleText && msg.type!=='project')item.append(textEl('div','g8m-text',visibleText));
   if(!isDeletedMessage(msg)&&msg.type==='project'){
    if(msg.text && msg.text!=='💻 Shared a G8Code project')item.append(textEl('div','g8m-text',String(msg.text)));
    const card=textEl('button','g8m-project-card','');card.type='button';
    card.append(textEl('span','g8m-project-symbol','⌘'));
    const info=textEl('span','g8m-project-info','');
    info.append(textEl('strong','',short(msg.projectName||'Shared G8Code Project',120)),textEl('small','','Latest saved version · View only'));
    card.append(info,textEl('span','g8m-project-open-label','View →'));
    const targetProject=String(msg.projectId||'');
    if(!/^[A-Za-z0-9_-]{1,128}$/.test(targetProject)){
      card.disabled=true;card.title='The project reference is unavailable';
    }else card.addEventListener('click',()=>openSharedProject(messageUid,targetProject));
    item.append(card);
   }
   const attachments=Array.isArray(msg.attachments)?msg.attachments:Object.values(msg.attachments||{});
   if(!isDeletedMessage(msg)&&attachments.length){
    const validPhotos=attachments.slice(0,MAX_FILES).filter(att=>att?.path && typeof att.path==='string' && att.path.startsWith(`g8Messages/${messageUid}/${msg.id}/`));
    if(validPhotos.length){
     const photos=textEl('div','g8m-photo-grid','');
     const att=validPhotos[0],path=att.path;
     const previous=previousPhotoButtons.get(path);
     const button=(previous && previous.dataset.photoFile===String(att.driveFileId||att.imagekitFileId||''))
      ? previous : textEl('button','g8m-image-loading','Loading photo…');
     button.type='button';button.dataset.photoPath=path;button.dataset.photoFile=String(att.driveFileId||att.imagekitFileId||'');
     button.setAttribute('aria-label',validPhotos.length>1?`View ${validPhotos.length} photos`:`View ${att.name||'image'}`);
     button._g8mGalleryClick=()=>openPhotoGallery(validPhotos,0,messageUid,msg.id);
     if(button.dataset.photoState==='ready')button.onclick=button._g8mGalleryClick;
     photos.append(button);
     const photoVisual=validPhotos.length>1?textEl('div','g8m-photo-stack',''):photos;
     if(validPhotos.length>1){
      g8mCreateStackBacks(photoVisual,validPhotos,messageUid,msg.id,false,stackedPhotosToLoad);
      photoVisual.append(photos);
      const badge=textEl('span','g8m-photo-count',`+${validPhotos.length-1}`);
      badge.setAttribute('aria-hidden','true');photoVisual.append(badge);
     }
     item.append(photoVisual);
     if(!['ready','fetching','failed'].includes(button.dataset.photoState)){
      button.dataset.photoState='waiting';
      photosToLoad.push({att:{...att,messageId:msg.id,studentUid:messageUid},button});
     }
    }
   }
   // V5.19 — photos AND saved-project shares use the SAME teacher-only RTDB
   // acknowledgment. This is the message's Received/Checked state, not a
   // grade or a claim that subsequent edits to the project were reviewed.
   const isSharedProject=msg.type==='project' && !!msg.projectId;
   const acknowledgeable=!historic&&isReviewableStudentSubmission(msg);
   if(acknowledgeable){
    const ack=activeAcks[msg.id];
    if(teacher){
     const controls=textEl('div','g8m-ack-actions'+(isSharedProject?' g8m-project-ack-actions':''),'');
     controls.setAttribute('role','group');
     controls.setAttribute('aria-label',isSharedProject?'Saved project acknowledgment':'Photo acknowledgment');
     for(const st of ['received','checked']){
      const b=textEl('button',ack?.status===st?'selected':'',st==='received'?'✓ Received':'✓✓ Checked');
      b.type='button';
      b.setAttribute('aria-pressed',ack?.status===st?'true':'false');
      b.title=st==='received'?'Confirm that the shared item was received':'Confirm that the shared item was reviewed (not a grade)';
      b.addEventListener('click',()=>acknowledge(msg.id,st));controls.append(b);
     }
     item.append(controls);
    }else if(ack){
     // Existing photo acknowledgment visibility is retained on mobile.
     item.append(textEl('span','g8m-ack-chip'+(isSharedProject?' g8m-project-ack-chip':''),
      ack.status==='checked'?'✓✓ Checked by teacher':'✓ Received by teacher'));
    }else if(isSharedProject){
     // A project share makes sense to a student even before the teacher acts.
     item.append(textEl('span','g8m-ack-chip g8m-project-ack-chip is-pending','○ Awaiting teacher acknowledgment'));
    }
   }
   if(!isDeletedMessage(msg)&&!item.querySelector('.g8m-text')&&!attachments.length&&msg.type!=='project'){
    // Malformed older data must not silently remove a message from chat.
    item.append(textEl('div','g8m-text','Message content unavailable'));
   }
   // Anchor the tools and reaction to the rendered bubble/content itself, not
   // the outer message row (which can be wider than a short one-word message).
   const bubbleAnchor=textEl('div','g8m-bubble-anchor','');
   while(item.firstChild)bubbleAnchor.append(item.firstChild);
   if(!mine&&group.last)g8mAddGroupAvatar(bubbleAnchor,msg);
   item.append(bubbleAnchor);
   const isTextOnly = !isDeletedMessage(msg) && !attachments.length && msg.type!=='image' && msg.type!=='project' && !!bubbleAnchor.querySelector('.g8m-text');
   if(isTextOnly){
    item.classList.add('g8m-text-only');
    if(selectedMobileMetaMessageId===String(msg.id))item.classList.add('g8m-meta-revealed');
    // The bubble, never an image or project link, is the tap target.
    const textBubble=bubbleAnchor.querySelector('.g8m-text');
    textBubble.classList.add('g8m-text-tap');
    textBubble.setAttribute('role','button');
    textBubble.setAttribute('tabindex','0');
    textBubble.setAttribute('aria-label','Show or hide message time and Seen status');
    textBubble.setAttribute('aria-expanded',item.classList.contains('g8m-meta-revealed')?'true':'false');
    textBubble.addEventListener('click',()=>toggleTextMessageMeta(item,msg.id));
    textBubble.addEventListener('keydown',event=>{
     if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleTextMessageMeta(item,msg.id);}
    });
   }
   const meta=textEl('div','g8m-msg-meta','');meta.append(textEl('span','',formatTime(at)));
   if(mine){const seenLabel=textEl('span','g8m-seen-label',historic?'✓ Sent':seenLabelFor(msg));meta.append(seenLabel);}
   // Independent of CSS: mobile plain-text metadata must start hidden.
   if(isTextOnly && mobileChatSize() && !item.classList.contains('g8m-meta-revealed'))meta.hidden=true;
   item.append(meta);
   // The toolbar must follow the actual visible message, never the row or
   // teacher acknowledgement controls. In particular, portrait images can be
   // much narrower than the rest of the message's metadata/actions.
   const actualVisual=bubbleAnchor.querySelector('.g8m-photo-stack')||bubbleAnchor.querySelector('.g8m-photo-grid')||bubbleAnchor.querySelector('.g8m-project-card')||bubbleAnchor.querySelector('.g8m-text')||bubbleAnchor.querySelector('.g8m-deleted-bubble')||bubbleAnchor.querySelector('.g8m-quoted');
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
   // A previous UID's chat is readable in-line, including private photos,
   // but actions must not accidentally write into this CURRENT UID's RTDB path.
   if(!historic){
    const actions=textEl('div','g8m-hover-actions','');
    const reactButton=textEl('button','','☺');reactButton.type='button';reactButton.title='React';reactButton.setAttribute('aria-label','React to message');reactButton.addEventListener('click',()=>openReactionPicker(msg.id,actionTarget));
    const quickReply=textEl('button','','↩');quickReply.type='button';quickReply.title='Reply';quickReply.setAttribute('aria-label','Reply to message');quickReply.addEventListener('click',()=>replyToMessage(msg.id));
    const quickMore=textEl('button','','⋯');quickMore.type='button';quickMore.title='More / Message Details';quickMore.setAttribute('aria-label','More message actions');quickMore.addEventListener('click',()=>openDetailsFor(msg.id));
    reactButton.hidden=isDeletedMessage(msg);quickReply.hidden=isDeletedMessage(msg);
    actions.append(reactButton,quickReply,quickMore);actionTarget.append(actions);
    const reactionChip=textEl('button','g8m-reaction-chip','');reactionChip.type='button';reactionChip.setAttribute('aria-label','View or change reactions');reactionChip.addEventListener('click',()=>openReactionPicker(msg.id,actionTarget));actionTarget.append(reactionChip);
    if(!isDeletedMessage(msg))updateOneReactionBadge(item,msg.id);
    installLongPress(item,msg.id);
   }
   content.append(item);
  }catch(error){
   console.error('Could not render chat item:',msg?.id,error);
   const fallback=textEl('div','g8m-msg-render-error','A saved message could not be displayed.');
   fallback.dataset.messageId=String(msg?.id||'');content.append(fallback);
  }
 }
 // Commit only after all rows are built. One malformed row cannot blank the chat.
 g8mReconcileChatRows(log,content);
 g8mWatchPhotoRows();
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
  for(const {button} of photosToLoad)if(button.isConnected)photoVisibilityObserver.observe(button);
  for(const stack of byStack.keys())if(stack.isConnected)photoVisibilityObserver.observe(stack);
 }else{
  for(const {att,button} of photosToLoad)if(button.isConnected)void showPhoto(att,button,version);
  void g8mFillStackBacks(stackedPhotosToLoad);
 }
 if(!olderLoading && g8mFollowLatest && !g8mSmoothLatest)g8mLandAtBottomAfterRender();
 else if(readingAnchorKey){
  // A previous UID can legitimately have the same Firebase push ID as the
  // current UID. Anchor by thread+message, never message ID alone.
  const sameMessage=[...log.children].find(el=>el.dataset?.chatKey===readingAnchorKey);
  if(sameMessage)g8mSetPreservedScroll(log,log.scrollTop+sameMessage.getBoundingClientRect().top-readingAnchorTop);
  else g8mSetPreservedScroll(log,previousScrollTop);
 }else if(olderLoading)g8mSetPreservedScroll(log,previousScrollTop+log.scrollHeight-previousHeight);
 else if(!g8mSmoothLatest)g8mSetPreservedScroll(log,previousScrollTop);
 g8mUpdateScrollLatest();
 syncMobileMessageMetaVisibility();
 lastSnapshotKey=shown.map(x=>x.id).join(':');
 if(pinnedMessageId&&Date.now()<pinExpires&&g8mFollowLatest)g8mScheduleBottomIfFollowing();

}

// A short cursor page is not sufficient proof that all older messages were
// loaded. For small/medium threads re-read a bounded tail and merge by RTDB
// key. The audit reported 169 records while the UI claimed completion at 149;
// this independent read finds records skipped by a legacy pagination cursor.
async function g8mVerifyFinishedHistory(uid){
 if(uid!==openedUid)return;
 const targets=[];
 if(!hasOlder && !g8mEarlierLoadError && [...activeMessages,...olderMessages].length<G8M_HISTORY_RECONCILE_LIMIT){
  targets.push({threadUid:uid,entry:null});
 }
 for(const [threadUid,entry] of g8mLinkedHistories){
  if(entry.ready && !entry.error && !entry.hasOlder && [...entry.recent,...entry.older].length<G8M_HISTORY_RECONCILE_LIMIT){
   targets.push({threadUid,entry});
  }
 }
 if(!targets.length)return;
 g8mHistoryCheckRunning=true;g8mUpdateLoadedStatus();
 try{
  const checks=await Promise.allSettled(targets.map(async ({threadUid,entry})=>{
   const snap=await get(g8mReconcileQuery(threadUid));
   if(uid!==openedUid || (entry && g8mLinkedHistories.get(threadUid)!==entry))return;
   const found=normalizeMessageSnapshot(snap).map(msg=>entry?({...msg,__threadUid:threadUid,__historical:true}):msg);
   if(entry){
    const seen=new Set(entry.recent.map(msg=>msg.id));
    entry.older=[...new Map([...entry.older,...found.filter(msg=>!seen.has(msg.id))].map(msg=>[msg.id,msg])).values()].sort(compareMessages);
    // A full bounded tail cannot prove there are no earlier records.
    if(found.length===G8M_HISTORY_RECONCILE_LIMIT){entry.hasOlder=true;entry.exhausted=false;}
   }else{
    const seen=new Set(activeMessages.map(msg=>msg.id));
    olderMessages=[...new Map([...olderMessages,...found.filter(msg=>!seen.has(msg.id))].map(msg=>[msg.id,msg])).values()].sort(compareMessages);
    if(found.length===G8M_HISTORY_RECONCILE_LIMIT){hasOlder=true;historyExhausted=false;}
    rememberConversation(uid);
   }
  }));
  const failure=checks.find(result=>result.status==='rejected');
  if(failure && uid===openedUid){
   g8mEarlierLoadError=friendlyError(failure.reason);
   status(`History verification failed: ${g8mEarlierLoadError}. Refresh Chat to retry.`,true);
  }
 }finally{
  if(uid===openedUid){g8mHistoryCheckRunning=false;renderMessages();g8mUpdateLoadedStatus();}
 }
}

// Chronological pagination for CURRENT + previous student accounts. Each UID
// has its own Firebase cursor; page them together and merge by createdAtMs.
// This prevents skipped pages when old/new account timelines overlap.
async function loadOlder(){
 if(olderLoading||!g8mHasMoreHistory()||!openedUid)return;
 g8mHistoryGesture=false;g8mCancelAutoScroll();
 const uid=openedUid;
 olderLoading=true;
 const loader=$('g8mMessages').querySelector('.g8m-load-older');
 if(loader){loader.disabled=true;loader.textContent='Loading earlier messages…';loader.dataset.renderRevision='true';}
 g8mUpdateLoadedStatus();
 const fetches=[];
 if(hasOlder){
  const oldest=[...olderMessages,...activeMessages].sort(compareMessages)[0];
  if(oldest)fetches.push((async()=>{
   const cursor=oldest.createdAtMs??null;
   const page=query(ref(rtdb,`${studentPath(uid)}/messages`),orderByChild('createdAtMs'),endBefore(cursor,oldest.id),limitToLast(G8M_HISTORY_PAGE_SIZE));
   const snap=await get(page);if(uid!==openedUid)return;
   const found=normalizeMessageSnapshot(snap),existing=new Set([...olderMessages,...activeMessages].map(m=>m.id));
   const additions=found.filter(m=>!existing.has(m.id));
   if(additions.length)olderMessages=[...additions,...olderMessages].sort(compareMessages);
   historyExhausted=found.length<G8M_HISTORY_PAGE_SIZE;
   hasOlder=!historyExhausted;
   rememberConversation(uid);
  })());
 }
 for(const [threadUid,entry] of g8mLinkedHistories){
  if(!entry.ready||!entry.hasOlder||entry.loading)continue;
  const oldest=[...entry.older,...entry.recent].sort(compareMessages)[0];
  if(!oldest)continue;
  entry.loading=true;
  fetches.push((async()=>{
   try{
    const cursor=oldest.createdAtMs??null;
    const page=query(ref(rtdb,`${studentPath(threadUid)}/messages`),orderByChild('createdAtMs'),endBefore(cursor,oldest.id),limitToLast(G8M_HISTORY_PAGE_SIZE));
    const snap=await get(page);
    if(uid!==openedUid||g8mLinkedHistories.get(threadUid)!==entry)return;
    const found=normalizeMessageSnapshot(snap).map(msg=>({...msg,__threadUid:threadUid,__historical:true}));
    const existing=new Set([...entry.older,...entry.recent].map(m=>m.id));
    const additions=found.filter(m=>!existing.has(m.id));
    if(additions.length)entry.older=[...additions,...entry.older].sort(compareMessages);
    entry.exhausted=found.length<G8M_HISTORY_PAGE_SIZE;
    entry.hasOlder=!entry.exhausted;
   }finally{entry.loading=false;}
  })());
 }
 try{
  const results=await Promise.allSettled(fetches);
  const failed=results.filter(result=>result.status==='rejected');
  if(uid===openedUid){
   g8mEarlierLoadError=failed.length?friendlyError(failed[0].reason):'';
   if(failed.length)status(`Earlier messages could not load: ${g8mEarlierLoadError}. Tap Load earlier messages to retry.`,true);
   else await g8mVerifyFinishedHistory(uid);
  }
 }finally{
  if(uid===openedUid){olderLoading=false;renderMessages();g8mUpdateLoadedStatus();}
 }
}
// Allow no more than two Drive photo reads at a time. Many simultaneous
// Apps Script executions used to compete for RTDB receipts and timeout.
// Main/visible photos must get the scarce private Drive read slots before
// decorative stack backs. The gallery's opened photo has highest priority.
function withPhotoReadSlot(task,priority=10){
 return new Promise((resolve,reject)=>{
  const run=async()=>{
   photoReadActive++;
   try{resolve(await task());}catch(error){reject(error);}
   finally{
    photoReadActive--;
    const next=photoReadWaiting.shift();if(next)next.run();
   }
  };
  if(photoReadActive<PHOTO_READ_CONCURRENCY)run();
  else{
   photoReadWaiting.push({run,priority});
   photoReadWaiting.sort((a,b)=>b.priority-a.priority);
  }
 });
}
function photoTransient(error){
 const reason=String(error?.message||error||'').toLowerCase();
 return /timeout|no confirmation|network|temporar|unavailable|service|quota|too many|rate limit|connection|fetch|busy|retry|exceeded/i.test(reason)
  && !/permission|denied|not authorized|invalid|not found|missing|different student|access another|sign in|origin|unauthorized/i.test(reason);
}
function g8mCachedUrlExact(path,driveFileId=''){
 if(!imageCache.has(path)){
  const signed=g8mIkSignedLinks.get(path);
  if(signed && signed.expiresAt>Date.now()+20000)return signed.url;
  if(signed)g8mIkSignedLinks.delete(path);
  return '';
 }
 if(driveFileId && imageCacheFileIds.get(path)!==String(driveFileId))return '';
 const url=imageCache.get(path);imageCache.delete(path);imageCache.set(path,url);
 return url;
}
function g8mCachedFullLocalBlob(path,fileId){
 if(!imageCache.has(path)||imageCacheFileIds.get(path)!==String(fileId||''))return '';
 const url=g8mCachedUrlExact(path,fileId);
 return url.startsWith('blob:')?url:'';
}
function cachedPhotoUrl(path,driveFileId='',variant='full'){
 if(variant!=='thumb')return g8mCachedUrlExact(path,driveFileId);
 // An already-local FULL sender copy is best. A merely signed FULL CDN URL
 // must NOT outrank a smaller ImageKit thumbnail (even if gallery pre-signs it).
 const hasLocalFull=imageCache.has(path) && (!driveFileId||imageCacheFileIds.get(path)===String(driveFileId));
 if(hasLocalFull)return g8mCachedUrlExact(path,driveFileId);
 return g8mCachedUrlExact(path+G8M_IK_THUMB_SUFFIX,driveFileId)||g8mCachedUrlExact(path,driveFileId);
}
function cachePhotoUrl(path,url,driveFileId=''){
 if(imageCache.has(path)){
  const old=imageCache.get(path);imageCache.delete(path);
  if(old!==url)URL.revokeObjectURL(old);
 }
 imageCache.set(path,url);
 imageCacheFileIds.set(path,String(driveFileId||''));
 // Do not revoke a blob URL while it is still displayed in a chat or viewer.
 if(imageCache.size>PHOTO_CACHE_MAX_ITEMS){
  const live=new Set([...document.querySelectorAll('.g8m-image-ready[data-photo-path]')].map(el=>el.dataset.photoPath));
  const displayed=$('g8mImageLarge')?.src||'';
  const galleryURLs=new Set(['g8mImagePreviousPreview','g8mImageNextPreview'].map(id=>$(id)?.src).filter(Boolean));
  for(const [key,old] of imageCache){
   if(imageCache.size<=PHOTO_CACHE_MAX_ITEMS)break;
   if(key===path||live.has(key)||
      (key.endsWith(G8M_IK_THUMB_SUFFIX)&&live.has(key.slice(0,-G8M_IK_THUMB_SUFFIX.length)))||old===displayed||galleryURLs.has(old))continue;
   imageCache.delete(key);imageCacheFileIds.delete(key);URL.revokeObjectURL(old);
  }
 }
}
function clearMemoryPhotoCache(){
 // Called on Auth identity change, including sign-out and teacher/student swap.
 for(const url of imageCache.values())URL.revokeObjectURL(url);
 imageCache.clear();imageCacheFileIds.clear();photoQueue.clear();g8mIkSignedLinks.clear();
 if(g8mIkSignBatchTimer!==null){clearTimeout(g8mIkSignBatchTimer);g8mIkSignBatchTimer=null;}
 for(const pending of g8mIkSignPending.splice(0))pending.reject(new Error('Photo access changed. Sign in again.'));
}
function deleteCachedPhoto(path,driveFileId=''){
 for(const cachePath of [path,path+G8M_IK_THUMB_SUFFIX]){
  g8mIkSignedLinks.delete(cachePath);
  const old=imageCache.get(cachePath);
  if(old){imageCache.delete(cachePath);imageCacheFileIds.delete(cachePath);if(old.startsWith('blob:'))URL.revokeObjectURL(old);}
  if(driveFileId && photoCacheOwnerUid)void deletePhotoFromDisk({path:cachePath,driveFileId},photoCacheOwnerUid);
 }
}
function photoDiskKey(att,owner){
 // Keep the existing Drive cache keys unchanged; also allow ImageKit IDs.
 return JSON.stringify([String(owner),String(att.path||''),String(att.driveFileId||att.imagekitFileId||'')]);
}
function photoOwnerStillValid(owner,epoch){
 return !!owner && photoCacheOwnerUid===owner && photoAuthEpoch===epoch && user?.uid===owner;
}
function openPhotoDisk(){
 if(photoDbPromise)return photoDbPromise;
 if(!('indexedDB' in window) || !(['https:','http:'].includes(location.protocol)))return Promise.resolve(null);
 photoDbPromise=new Promise(resolve=>{
  let settled=false;
  const finish=db=>{if(settled){if(db)db.close();return;}settled=true;resolve(db);};
  try{
   const request=indexedDB.open(PHOTO_DB_NAME,1);
   request.onupgradeneeded=()=>{
    const db=request.result;
    if(!db.objectStoreNames.contains(PHOTO_DB_STORE))db.createObjectStore(PHOTO_DB_STORE,{keyPath:'key'});
   };
   request.onsuccess=()=>{
    const db=request.result;
    db.onversionchange=()=>{db.close();photoDbPromise=null;};
    finish(db);
   };
   request.onerror=()=>finish(null);
   request.onblocked=()=>finish(null);
  }catch(_){finish(null);}
 });
 return photoDbPromise;
}
async function readPhotoFromDisk(att,owner,epoch){
 const db=await openPhotoDisk();
 if(!db||!photoOwnerStillValid(owner,epoch))return null;
 return new Promise(resolve=>{
  try{
   const tx=db.transaction(PHOTO_DB_STORE,'readonly');
   const request=tx.objectStore(PHOTO_DB_STORE).get(photoDiskKey(att,owner));
   request.onsuccess=()=>{
    const row=request.result;
    if(!photoOwnerStillValid(owner,epoch)||!row||row.owner!==owner||row.expiresAt<=Date.now()||
       !(row.blob instanceof Blob)||!allowedTypes.has(row.blob.type)||
       row.blob.size<=0||row.blob.size>PHOTO_DISK_SINGLE_MAX){resolve(null);return;}
    // The stored Blob is local only, not a public URL or a database read.
    resolve(row.blob);
    // Avoid rewriting a multi-MB Blob on every view. Maintenance handles LRU.
    if(Date.now()-Number(row.lastUsed||0)>12*60*60*1000)
     void touchPhotoDisk(att,owner,epoch);
   };
   request.onerror=()=>resolve(null);
   tx.onabort=()=>resolve(null);
  }catch(_){resolve(null);}
 });
}
async function touchPhotoDisk(att,owner,epoch){
 const db=await openPhotoDisk();if(!db||!photoOwnerStillValid(owner,epoch))return;
 try{
  const tx=db.transaction(PHOTO_DB_STORE,'readwrite');
  const store=tx.objectStore(PHOTO_DB_STORE),req=store.get(photoDiskKey(att,owner));
  req.onsuccess=()=>{const row=req.result;if(row&&photoOwnerStillValid(owner,epoch)){
   row.lastUsed=Date.now();store.put(row);
  }};
 }catch(_){}
}
async function savePhotoToDisk(att,owner,epoch,blob){
 if(!blob||!(blob instanceof Blob)||blob.size<=0||blob.size>PHOTO_DISK_SINGLE_MAX||
    !allowedTypes.has(blob.type)||!photoOwnerStillValid(owner,epoch))return;
 const db=await openPhotoDisk();if(!db||!photoOwnerStillValid(owner,epoch))return;
 try{
  await new Promise(resolve=>{
   try{
    const tx=db.transaction(PHOTO_DB_STORE,'readwrite');
    tx.objectStore(PHOTO_DB_STORE).put({
     key:photoDiskKey(att,owner),owner,path:att.path,driveFileId:String(att.driveFileId||att.imagekitFileId||''),
     blob,byteLength:blob.size,lastUsed:Date.now(),expiresAt:Date.now()+PHOTO_DISK_TTL
    });
    tx.oncomplete=resolve;tx.onerror=resolve;tx.onabort=resolve;
   }catch(_){resolve();}
  });
  if(++photoDiskWriteCount%4===0)void prunePhotoDiskCache(owner);
 }catch(_){} // Private browsing / quota-denied: keep the in-memory fallback.
}
async function deletePhotoFromDisk(att,owner){
 const db=await openPhotoDisk();if(!db)return;
 try{db.transaction(PHOTO_DB_STORE,'readwrite').objectStore(PHOTO_DB_STORE).delete(photoDiskKey(att,owner));}catch(_){}
}
async function prunePhotoDiskCache(owner){
 // A delayed cleanup from an earlier account must never delete the new
 // account's photos after an Auth switch.
 const startEpoch=photoAuthEpoch;
 if(owner!==photoCacheOwnerUid)return;
 const db=await openPhotoDisk();
 if(!db||owner!==photoCacheOwnerUid||startEpoch!==photoAuthEpoch)return;
 // On sign-out, clear ALL cached photo bytes. When switching identities,
 // remove everything except the currently authenticated user's entries.
 try{
  const tx=db.transaction(PHOTO_DB_STORE,'readwrite'),store=tx.objectStore(PHOTO_DB_STORE);
  if(!owner){store.clear();return;}
  const kept=[];
  const request=store.openCursor();
  request.onsuccess=()=>{
   const cursor=request.result;
   if(!cursor){
    kept.sort((a,b)=>b.lastUsed-a.lastUsed);
    let bytes=0,count=0;
    for(const row of kept){
     if(count>=PHOTO_DISK_MAX_ITEMS||bytes+row.size>PHOTO_DISK_MAX_BYTES)store.delete(row.key);
     else{bytes+=row.size;count++;}
    }
    return;
   }
   const row=cursor.value;
   if(row?.owner!==owner||row.expiresAt<=Date.now()||!Number.isFinite(row.byteLength)||
     row.byteLength<=0||row.byteLength>PHOTO_DISK_SINGLE_MAX)cursor.delete();
   else kept.push({key:cursor.key,size:row.byteLength,lastUsed:Number(row.lastUsed)||0});
   cursor.continue();
  };
 }catch(_){}
}
function pausePhotoRetry(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function privatePhotoURL(att,priority=10,variant='full'){
 if(att?.provider==='imagekit')return imageKitPrivatePhotoURL(att,priority,variant);
 const path=String(att?.path||'');
 const owner=photoCacheOwnerUid,epoch=photoAuthEpoch;
 if(!photoOwnerStillValid(owner,epoch))return Promise.reject(new Error('Sign in again before opening private photos.'));
 if(!path||!att?.driveFileId)return Promise.reject(new Error('Private photo attachment is incomplete.'));
 const cached=cachedPhotoUrl(path,att.driveFileId);
 if(cached)return Promise.resolve(cached);
 const key=photoDiskKey(att,owner);
 if(photoQueue.has(key))return photoQueue.get(key);
 // Disk lookups do not consume Drive slots: cached pictures render as quickly
 // as local browser storage allows, and share one lookup per attachment.
 const job=(async()=>{
  const savedBlob=await readPhotoFromDisk(att,owner,epoch);
  if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
  if(savedBlob){
   const cachedNow=cachedPhotoUrl(path,att.driveFileId);
   if(cachedNow)return cachedNow;
   const url=URL.createObjectURL(savedBlob);
   cachePhotoUrl(path,url,att.driveFileId);
   return url;
  }
  return withPhotoReadSlot(async()=>{
   if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
   const cachedNow=cachedPhotoUrl(path,att.driveFileId);
   if(cachedNow)return cachedNow;
   const uid=att.studentUid||String(path.split('/')[1]||'');
   const messageId=att.messageId||String(path.split('/')[2]||'');
   for(let attempt=0;attempt<3;attempt++){
    try{
     const result=await driveRequest('read',{studentUid:uid,messageId,driveFileId:att.driveFileId},attempt===0?30000:40000);
     if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
     if(!result?.data||!allowedTypes.has(result.contentType))throw new Error('Invalid Drive photo response');
     const binary=atob(result.data),data=new Uint8Array(binary.length);
     for(let i=0;i<binary.length;i++)data[i]=binary.charCodeAt(i);
     const blob=new Blob([data],{type:result.contentType});
     const url=URL.createObjectURL(blob);
     cachePhotoUrl(path,url,att.driveFileId);
     // Persist asynchronously; never delay showing a freshly fetched photo.
     void savePhotoToDisk(att,owner,epoch,blob);
     return url;
    }catch(error){
     if(attempt>=2||!photoTransient(error)||!photoOwnerStillValid(owner,epoch))throw error;
     await pausePhotoRetry(800*(attempt+1));
    }
   }
  },priority);
 })().finally(()=>photoQueue.delete(key));
 photoQueue.set(key,job);
 return job;
}
// ImageKit V4C8: one authenticated Apps Script receipt can sign several
// near-viewport thumbnails. The backend checks EACH message against RTDB and
// verifies its PRIVATE ImageKit path. No unsigned or public photo URL is used.
function g8mQueueImageKitSignature(uid,messageId,fileId,variant,owner,epoch,priority){
 return new Promise((resolve,reject)=>{
  if(!photoOwnerStillValid(owner,epoch)){reject(new Error('Photo access changed. Sign in again.'));return;}
  g8mIkSignPending.push({uid,messageId,fileId,variant,owner,epoch,priority,resolve,reject});
  g8mIkSignPending.sort((a,b)=>b.priority-a.priority);
  if(g8mIkSignBatchTimer===null && !g8mIkSignBatchActive){
   g8mIkSignBatchTimer=setTimeout(()=>{
    g8mIkSignBatchTimer=null;void g8mFlushImageKitSignatures();
   },priority>=20?0:24);
  }
 });
}
function g8mCheckImageKitSignedResult(item){
 const valid=(url,expiry)=>{
  const link=String(url||''),expiresAt=Number(expiry||0);
  const expected='https://ik.imagekit.io/86vf9fevzo/';
  if(!link.startsWith(expected) || !/[?&]ik-s=[0-9a-f]{40}(?:&|$)/.test(link) ||
     !/[?&]ik-t=\d+(?:&|$)/.test(link) || expiresAt<Date.now()+20000 ||
     expiresAt>Date.now()+10*60*1000)
   throw new Error('The private photo link could not be verified.');
  return {url:link,expiresAt};
 };
 const primary=valid(item?.url,item?.expiresAt);
 if(item?.fullUrl)primary.full=valid(item.fullUrl,item.fullExpiresAt);
 return primary;
}
async function g8mFlushImageKitSignatures(){
 if(g8mIkSignBatchActive)return;
 g8mIkSignBatchActive=true;
 try{
  while(g8mIkSignPending.length){
   const first=g8mIkSignPending.shift();
   if(!photoOwnerStillValid(first.owner,first.epoch)){
    first.reject(new Error('Photo access changed. Sign in again.'));continue;
   }
   const batch=[first];
   // Visible images get a SMALL batch for better time-to-first-photo;
   // near-viewport prefetch may coalesce up to six to save bridge overhead.
   const limit=first.priority>=20?2:G8M_IK_MAX_SIGN_BATCH;
   for(let i=0;i<g8mIkSignPending.length && batch.length<limit;){
    const candidate=g8mIkSignPending[i];
    if(candidate.uid===first.uid && candidate.owner===first.owner && candidate.epoch===first.epoch &&
       (first.priority<20 || candidate.priority>=20)){
     batch.push(g8mIkSignPending.splice(i,1)[0]);
    }else i++;
   }
   try{
    const items=batch.map(entry=>({messageId:entry.messageId,imagekitFileId:entry.fileId,variant:entry.variant}));
    // Keep using the EXISTING ikSign route, so G8CodeMessagesDrive.gs,
    // Firebase Rules, and the already-deployed bridge require no edits.
    const data=await driveRequest('ikSign',{
     studentUid:first.uid,messageId:first.messageId,items:JSON.stringify(items)
    },45000);
    if(!Array.isArray(data?.results) || data.results.length!==batch.length)
     throw new Error('The photo service needs the updated ImageKit script deployment.');
    batch.forEach((entry,i)=>{
     if(!photoOwnerStillValid(entry.owner,entry.epoch)){
      entry.reject(new Error('Photo access changed. Sign in again.'));return;
     }
     const result=data.results[i];
     if(result?.error){entry.reject(new Error(String(result.error)));return;}
     try{entry.resolve(g8mCheckImageKitSignedResult(result));}
     catch(error){entry.reject(error);}
    });
   }catch(error){batch.forEach(entry=>entry.reject(error));}
  }
 }finally{
  g8mIkSignBatchActive=false;
  if(g8mIkSignPending.length && g8mIkSignBatchTimer===null){
   g8mIkSignBatchTimer=setTimeout(()=>{g8mIkSignBatchTimer=null;void g8mFlushImageKitSignatures();},0);
  }
 }
}
async function g8mFetchSmallPrivateThumbnail(url,att,cachePath,owner,epoch){
 // A browser-local, account-scoped cache removes repeated Apps Script and CDN
 // requests after refresh. If ImageKit CORS is disabled, use the normal <img>
 // signed URL; photos never become public and loading still works.
 try{
  const response=await fetch(url,{method:'GET',mode:'cors',credentials:'omit',cache:'default'});
  if(!response.ok)throw new Error('Private thumbnail could not be loaded ('+response.status+').');
  const blob=await response.blob();
  if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
  if(!allowedTypes.has(blob.type) || blob.size<1 || blob.size>PHOTO_DISK_SINGLE_MAX)return url;
  g8mIkCorsBlobAllowed=true;
  const existing=g8mCachedUrlExact(cachePath,att.imagekitFileId);
  if(existing && existing.startsWith('blob:'))return existing;
  const local=URL.createObjectURL(blob);
  cachePhotoUrl(cachePath,local,att.imagekitFileId);
  void savePhotoToDisk({...att,path:cachePath},owner,epoch,blob);
  return local;
 }catch(error){
  if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
  if(error instanceof TypeError && navigator.onLine!==false)g8mIkCorsBlobAllowed=false;
  // CORS/network hiccups should not break a valid private signed <img> URL.
  return url;
 }
}
async function g8mFetchPrivateFullForCache(signedUrl,att,cachePath,owner,epoch,priority){
 // ImageKit full photos are already compressed on upload. Download ONCE,
 // retain a bounded local Blob, and never persist expiring signed URLs.
 if(g8mIkCorsBlobAllowed===false)return signedUrl;
 try{
  const blob=await withPhotoReadSlot(async()=>{
   const response=await fetch(signedUrl,{
    method:'GET',mode:'cors',credentials:'omit',cache:'default'
   });
   if(!response.ok)throw new Error('Full photo CDN returned '+response.status);
   const contentLength=Number(response.headers.get('content-length')||0);
   if(contentLength>PHOTO_DISK_SINGLE_MAX)return null;
   return response.blob();
  },priority);
  if(!blob)return signedUrl;
  if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
  if(!allowedTypes.has(blob.type)||blob.size<1||blob.size>PHOTO_DISK_SINGLE_MAX)return signedUrl;
  g8mIkCorsBlobAllowed=true;
  const existing=g8mCachedFullLocalBlob(cachePath,att.imagekitFileId);
  if(existing)return existing;
  const local=URL.createObjectURL(blob);
  cachePhotoUrl(cachePath,local,att.imagekitFileId);
  // Browser quota can reject this, but the in-memory Blob still works.
  void savePhotoToDisk(att,owner,epoch,blob);
  return local;
 }catch(error){
  if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
  if(error instanceof TypeError && navigator.onLine!==false)g8mIkCorsBlobAllowed=false;
  // A valid private signed URL still displays via <img> when CORS is blocked.
  // Do not store signed URLs as permanent browser cache entries.
  return signedUrl;
 }
}
function imageKitPrivatePhotoURL(att,priority=10,variant='full'){
 const path=String(att?.path||''),fid=String(att?.imagekitFileId||'');
 const owner=photoCacheOwnerUid,epoch=photoAuthEpoch;
 if(!photoOwnerStillValid(owner,epoch))return Promise.reject(new Error('Sign in again to view this photo.'));
 if(!/^g8Messages\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(path) || !/^[A-Za-z0-9_-]{12,128}$/.test(fid))
  return Promise.reject(new Error('Private photo information is incomplete.'));
 const isThumb=variant==='thumb',cachePath=isThumb?path+G8M_IK_THUMB_SUFFIX:path;
 // A temporary signed FULL URL is not a reusable local copy.
 // Always consult IndexedDB before returning that link to the viewer.
 const cached=isThumb?cachedPhotoUrl(path,fid,variant):g8mCachedFullLocalBlob(path,fid);
 if(cached)return Promise.resolve(cached);
 const item={...att,path:cachePath};
 const key=photoDiskKey(item,owner);
 if(photoQueue.has(key))return photoQueue.get(key);
 const job=(async()=>{
  // Local sender copies (full) and downloaded receiver thumbnails (thumb)
  // are reused only for the SAME signed-in Firebase account.
  const savedBlob=await readPhotoFromDisk(item,owner,epoch);
  if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
  if(savedBlob){
   const nowCached=cachedPhotoUrl(path,fid,variant);
   if(nowCached)return nowCached;
   const local=URL.createObjectURL(savedBlob);
   cachePhotoUrl(cachePath,local,fid);
   return local;
  }
  const nowCached=isThumb?cachedPhotoUrl(path,fid,variant):g8mCachedFullLocalBlob(path,fid);
  if(nowCached)return nowCached;
  const uid=att.studentUid||path.split('/')[1],messageId=att.messageId||path.split('/')[2];
  // The thumbnail signer also returns an independently signed full URL.
  // Reuse it if still valid: no second Apps Script authorization roundtrip.
  const signedMemory=g8mIkSignedLinks.get(cachePath);
  const signed=(signedMemory && signedMemory.expiresAt>Date.now()+20000)
   ?signedMemory
   :await g8mQueueImageKitSignature(uid,messageId,fid,isThumb?'thumb':'full',owner,epoch,priority);
  if(!photoOwnerStillValid(owner,epoch))throw new Error('Photo access changed. Sign in again.');
  g8mIkSignedLinks.set(cachePath,{url:signed.url,expiresAt:signed.expiresAt});
  if(isThumb && signed.full)g8mIkSignedLinks.set(path,signed.full);
  if(!isThumb)return g8mFetchPrivateFullForCache(signed.url,att,cachePath,owner,epoch,priority);
  return g8mFetchSmallPrivateThumbnail(signed.url,att,cachePath,owner,epoch);
 })().finally(()=>photoQueue.delete(key));
 photoQueue.set(key,job);
 return job;
}
// G8Code Messages V5.0: isolated Fit-to-Screen photo viewer.
// Zoom is relative to the fitted image (100% means the whole photo fits),
// not the original image pixel count. Images are already cached in memory:
// panning/zooming never contacts Drive or Firestore.
// V5.4 grouped gallery: no extra RTDB or Drive reads until a photo is opened.
// A gallery item is either an already-local sender preview or a private Drive attachment.
let photoGallery=[],photoGalleryIndex=0,photoGalleryToken=0;
let g8mGallerySliding=false,g8mGallerySlideTimer=0,g8mGallerySlideListener=null;
const G8M_GALLERY_SLIDE_MS=310;
// The cross-message Admin gallery gets a slightly gentler slide.
function g8mGalleryDuration(){return g8mAdminGalleryViewer?350:G8M_GALLERY_SLIDE_MS;}
const g8mCarouselRail=$('g8mImageTrack');
const g8mGalleryCenterPanel=$('g8mImageCurrentFrame');
function g8mGalleryStepSize(){
 const width=g8mGalleryCenterPanel.getBoundingClientRect().width;
 const gap=Number.parseFloat(getComputedStyle(g8mCarouselRail).columnGap)||0;
 return Math.max(1,width+gap);
}
function g8mSetGalleryOffset(px,animate=false){
 g8mCarouselRail.style.transition=animate && !matchMedia('(prefers-reduced-motion: reduce)').matches
  ?`transform ${g8mGalleryDuration()}ms cubic-bezier(.22,.8,.23,1)`:'none';
 g8mCarouselRail.style.setProperty('--g8m-gallery-shift',`${Math.round(px)}px`);
}
function g8mMeasureGalleryLayout(){
 const width=Math.max(1,imageStage.clientWidth);
 imageStage.style.setProperty('--g8m-gallery-stage-width',width+'px');
}
function g8mCancelGalleryAnimation(){
 if(typeof g8mGalleryCommitCleanup==='function')g8mGalleryCommitCleanup();
 clearTimeout(g8mGallerySlideTimer);g8mGallerySlideTimer=0;
 if(g8mGallerySlideListener){g8mCarouselRail.removeEventListener('transitionend',g8mGallerySlideListener);g8mGallerySlideListener=null;}
 g8mGallerySliding=false;g8mSetGalleryOffset(0,false);
}
function galleryControlState(){
 const hasGroup=photoGallery.length>1;
 $('g8mImageFindMessage').hidden=!(teacher&&g8mAdminGalleryViewer&&photoGallery[photoGalleryIndex]?.messageId);
 $('g8mImagePrev').hidden=!hasGroup;
 $('g8mImageNext').hidden=!hasGroup;
 $('g8mImageCounter').hidden=!hasGroup;
 imageStage.classList.toggle('has-gallery',hasGroup);
 if(hasGroup){
  $('g8mImageCounter').textContent=`${photoGalleryIndex+1} / ${photoGallery.length}`;
  $('g8mImagePrev').disabled=photoGalleryIndex===0;
  $('g8mImageNext').disabled=photoGalleryIndex===photoGallery.length-1;
 }
}
function g8mPrepareGalleryNeighbor(offset,previewId,frameId,token){
 const index=photoGalleryIndex+offset,photo=photoGallery[index];
 const preview=$(previewId),frame=$(frameId);
 frame.classList.toggle('is-empty',!photo);
 frame.classList.toggle('is-loading',!!photo);
 preview.onload=()=>{if(preview.getAttribute('src'))frame.classList.remove('is-loading');};
 preview.onerror=()=>frame.classList.remove('is-loading');
 preview.removeAttribute('src');
 if(!photo)return;
 // Only fetch direct neighbors. Previously viewed photos resolve from the
 // private in-memory/IndexedDB cache; signed URLs are never persisted here.
 const fileId=photo.driveFileId||photo.imagekitFileId;
 const variant=photo.provider==='imagekit'?'thumb':'full';
 const cached=photo.localUrl||cachedPhotoUrl(photo.path,fileId,variant);
 if(cached){preview.src=cached;return;}
 if(!photo.path)return;
 void privatePhotoURL(photo,2,variant).then(url=>{
  if(imageViewer.hidden||token!==photoGalleryToken||photoGallery[photoGalleryIndex+offset]!==photo)return;
  preview.src=url;
 }).catch(()=>{}); // A failed neighbor should not interrupt the current image.
}
function g8mPrepareGalleryNeighbors(token){
 g8mMeasureGalleryLayout();
 g8mPrepareGalleryNeighbor(-1,'g8mImagePreviousPreview','g8mImagePreviousFrame',token);
 g8mPrepareGalleryNeighbor(1,'g8mImageNextPreview','g8mImageNextFrame',token);
}
let g8mAdminGalleryViewer=false;
function openPhotoGallery(photos,index,uid,messageId,fromAdminGallery=false){
 if(!Array.isArray(photos)||!photos.length)return;
 g8mCancelGalleryAnimation();
 g8mAdminGalleryViewer=Boolean(teacher&&fromAdminGallery);
 photoGallery=photos.map(att=>({...att,studentUid:att.studentUid||uid,messageId:att.messageId||messageId}));
 showPhotoGalleryIndex(index);
}
function openLocalPhotoGallery(entries){
 if(!Array.isArray(entries)||!entries.length)return;
 g8mCancelGalleryAnimation();
 g8mAdminGalleryViewer=false;
 photoGallery=entries.map(entry=>({localUrl:entry.url,name:entry.file?.name||'Photo'}));
 showPhotoGalleryIndex(0);
}
function showPhotoGalleryIndex(index,landingPreview='',deferNeighbors=false){
 if(!photoGallery.length||index<0||index>=photoGallery.length)return;
 const isOpening=imageViewer.hidden;
 if(isOpening)imageViewerPreviousFocus=document.activeElement;
 photoGalleryIndex=index;
 const load=++photoGalleryToken,att=photoGallery[index];
 imageViewer.hidden=false;
 galleryControlState();
 if(!deferNeighbors)g8mPrepareGalleryNeighbors(load);
 if(att.localUrl){openFullPhoto(att.localUrl,true);return;}
 const fid=att.driveFileId||att.imagekitFileId;
 const localFull=att.provider==='imagekit'?g8mCachedFullLocalBlob(att.path,fid):cachedPhotoUrl(att.path,fid);
 if(localFull){openFullPhoto(localFull,true);return;}
 // Show a locally cached thumbnail or the already visible landing slide
 // immediately, then replace it with the decoded full-resolution image.
 const preview=landingPreview||cachedPhotoUrl(att.path,fid,att.provider==='imagekit'?'thumb':'full');
 const state=$('g8mImageStageStatus');
 if(preview){
  openFullPhoto(preview,true);
  state.textContent='Loading full quality…';state.classList.add('is-refining');state.hidden=false;
 }else{
  imageLarge.removeAttribute('src');imageViewerFitW=0;
  imageViewerScale=1;imageViewerPanX=0;imageViewerPanY=0;
  state.classList.remove('is-refining');
  state.textContent='Loading photo…';state.hidden=false;
 }
 void privatePhotoURL(att,20).then(photoUrl=>{
  if(load!==photoGalleryToken||imageViewer.hidden)return;
  if(preview)g8mUpgradeFullPhoto(photoUrl);
  else {state.hidden=true;state.classList.remove('is-refining');openFullPhoto(photoUrl,true);}
 }).catch(error=>{
  if(load!==photoGalleryToken||imageViewer.hidden)return;
  state.classList.toggle('is-refining',!!preview);
  state.textContent=preview?'Full quality unavailable · Showing preview':`Could not load this photo: ${friendlyError(error)}`;
  state.hidden=false;
 });
}
// V4C-19: Keep the ARRIVING slide visible until the center has a decoded
// image. The old implementation recentered first, then replaced its src:
// browsers briefly showed the old photo / black frame during that handoff.
let g8mGalleryCommitTimer=0,g8mGalleryCommitCleanup=null;
function g8mGallerySlideTo(nextIndex){
 if(imageViewer.hidden||g8mGallerySliding||nextIndex<0||nextIndex>=photoGallery.length){
  g8mSetGalleryOffset(0,true);return;
 }
 const direction=Math.sign(nextIndex-photoGalleryIndex);
 if(Math.abs(nextIndex-photoGalleryIndex)!==1)return;
 const previewEl=$(direction>0?'g8mImageNextPreview':'g8mImagePreviousPreview');
 const preview=previewEl.getAttribute('src')||'';
 g8mGallerySliding=true;
 const cleanTransition=()=>{
  clearTimeout(g8mGallerySlideTimer);g8mGallerySlideTimer=0;
  if(g8mGallerySlideListener){g8mCarouselRail.removeEventListener('transitionend',g8mGallerySlideListener);g8mGallerySlideListener=null;}
 };
 const settled=()=>{
  cleanTransition();
  if(!g8mGallerySliding||imageViewer.hidden)return;
  // Do not replace the neighbor currently on-screen until the destination
  // image is already painted in the hidden center frame.
  showPhotoGalleryIndex(nextIndex,preview,true);
  const token=photoGalleryToken;
  let done=false;
  const finish=()=>{
   if(done)return;done=true;
   clearTimeout(g8mGalleryCommitTimer);g8mGalleryCommitTimer=0;
   imageLarge.removeEventListener('load',ready);
   imageLarge.removeEventListener('error',ready);
   g8mGalleryCommitCleanup=null;
   if(!g8mGallerySliding||imageViewer.hidden||token!==photoGalleryToken)return;
   // A decoded center and the arriving neighbor now share the same frame
   // geometry. Reset them in one paint without changing the visible image.
   if(imageLarge.naturalWidth)imageViewerMeasure(true);
   g8mSetGalleryOffset(0,false);
   g8mGallerySliding=false;
   g8mPrepareGalleryNeighbors(token);
  };
  const ready=()=>requestAnimationFrame(()=>requestAnimationFrame(finish));
  g8mGalleryCommitCleanup=()=>{
   done=true;clearTimeout(g8mGalleryCommitTimer);g8mGalleryCommitTimer=0;
   imageLarge.removeEventListener('load',ready);imageLarge.removeEventListener('error',ready);
   g8mGalleryCommitCleanup=null;
  };
  imageLarge.addEventListener('load',ready);
  imageLarge.addEventListener('error',ready);
  // A genuinely unavailable neighbor must not trap gestures indefinitely.
  // Its own loading indicator will remain after this bounded fallback.
  g8mGalleryCommitTimer=setTimeout(finish,1350);
  if(imageLarge.complete&&imageLarge.naturalWidth)ready();
 };
 g8mGallerySlideListener=event=>{
  if(event.target===g8mCarouselRail&&event.propertyName==='transform')settled();
 };
 g8mCarouselRail.addEventListener('transitionend',g8mGallerySlideListener);
 // Preserve the physical drag position when starting the CSS settle.
 void g8mCarouselRail.getBoundingClientRect().left;
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:g8mGalleryDuration();
 g8mSetGalleryOffset(-direction*g8mGalleryStepSize(),true);
 g8mGallerySlideTimer=setTimeout(settled,duration+65);
}
function galleryStep(direction){
 if(photoGallery.length<2||g8mGallerySliding)return;
 g8mGallerySlideTo(photoGalleryIndex+direction);
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
  x:Math.max(0,(imageViewerFitW*imageViewerScale-g8mGalleryCenterPanel.clientWidth)/2),
  y:Math.max(0,(imageViewerFitH*imageViewerScale-g8mGalleryCenterPanel.clientHeight)/2)
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
 const safeW=Math.max(1,g8mGalleryCenterPanel.clientWidth-8), safeH=Math.max(1,g8mGalleryCenterPanel.clientHeight-8);
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
 g8mCancelGalleryAnimation();
 $('g8mImageStageStatus').classList.remove('is-refining');
 imageViewerLoadToken++;photoGalleryToken++;photoGallery=[];galleryControlState();
 if(imageViewerPreviousFocus&&imageViewerPreviousFocus.isConnected){
  try{imageViewerPreviousFocus.focus({preventScroll:true});}catch(_){}}
 imageViewerPreviousFocus=null;
}
function g8mUpgradeFullPhoto(url){
 const photoUrl=String(url||'');if(!photoUrl||imageViewer.hidden)return;
 const loadToken=++imageViewerLoadToken;
 // Preload/decode off-screen. Keep the cached thumbnail onscreen the entire
 // time, including when the CDN permits <img> but disallows CORS fetch().
 const incoming=new Image();incoming.decoding='async';
 const showDecoded=()=>{
  if(imageViewer.hidden||loadToken!==imageViewerLoadToken)return;
  const state=$('g8mImageStageStatus');
  if(!incoming.naturalWidth){
   state.textContent='Full image could not be displayed · Showing preview';
   state.hidden=false;return;
  }
  imageLarge.src=photoUrl;
  state.hidden=true;state.classList.remove('is-refining');
  const measure=()=>requestAnimationFrame(()=>{
   if(loadToken===imageViewerLoadToken&&!imageViewer.hidden)imageViewerMeasure(true);
  });
  if(imageLarge.complete&&imageLarge.naturalWidth)measure();
  else imageLarge.addEventListener('load',measure,{once:true});
 };
 incoming.onload=showDecoded;
 incoming.onerror=()=>{
  if(imageViewer.hidden||loadToken!==imageViewerLoadToken)return;
  const state=$('g8mImageStageStatus');
  state.textContent='Full quality unavailable · Showing preview';state.hidden=false;
 };
 incoming.src=photoUrl;
 if(incoming.complete&&incoming.naturalWidth)showDecoded();
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
 $('g8mImageStageStatus').classList.remove('is-refining');
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
 if(imageViewer.hidden||(!imageViewerFitW&&photoGallery.length<2)||g8mGallerySliding)return;
 if(event.pointerType==='mouse'&&event.button!==0)return;
 event.preventDefault();
 imageStage.setPointerCapture?.(event.pointerId);
 imageViewerPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
 imageViewerMoved=false;
 if(imageViewerPointers.size>=2){
  g8mSetGalleryOffset(0,false);
  const pair=imageViewerPair();
  imageViewerGesture={pinch:true,distance:pair.distance,zoom:imageViewerScale,
   x:pair.x,y:pair.y,panX:imageViewerPanX,panY:imageViewerPanY};
 }else{
  imageViewerGesture={pinch:false,x:event.clientX,y:event.clientY,
   startedAt:performance.now(),panX:imageViewerPanX,panY:imageViewerPanY};
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
  }else if(photoGallery.length>1 && Math.abs(dx)>6 && Math.abs(dx)>Math.abs(dy)*1.08){
   const canMove=dx<0?photoGalleryIndex<photoGallery.length-1:photoGalleryIndex>0;
   // Rubber-band at first/last photo; let the carousel follow the finger.
   g8mSetGalleryOffset(canMove?dx:dx*.2,false);
  }
 }
});
function imageViewerEndPointer(event){
 if(!imageViewerPointers.has(event.pointerId))return;
 const gesture=imageViewerGesture;
 const wasMulti=gesture?.pinch;
 const swipeX=!wasMulti&&gesture?event.clientX-gesture.x:0;
 const swipeY=!wasMulti&&gesture?event.clientY-gesture.y:0;
 const canSwipe=event.type==='pointerup'&&
  imageViewerPointers.size===1&&imageViewerScale<=1.01&&photoGallery.length>1&&!wasMulti;
 imageViewerPointers.delete(event.pointerId);
 if(event.type==='pointercancel'&&imageViewerScale<=1.01){g8mSetGalleryOffset(0,true);}
 if(canSwipe){
  const elapsed=Math.max(1,performance.now()-(gesture.startedAt||performance.now()));
  const velocity=Math.abs(swipeX)/elapsed;
  const threshold=Math.min(75,g8mGalleryStepSize()*.20);
  const horizontal=Math.abs(swipeX)>Math.abs(swipeY)*1.12;
  const direction=swipeX<0?1:-1;
  const isAllowed=direction>0?photoGalleryIndex<photoGallery.length-1:photoGalleryIndex>0;
  if(horizontal&&isAllowed&&(Math.abs(swipeX)>threshold||(Math.abs(swipeX)>24&&velocity>.47))){
   imageViewerGesture=null;imageViewerTap=null;
   g8mGallerySlideTo(photoGalleryIndex+direction);return;
  }
  // Small gestures settle back smoothly rather than snapping suddenly.
  g8mSetGalleryOffset(0,true);
 }
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
  imageViewerGesture={pinch:false,x:p.x,y:p.y,startedAt:performance.now(),panX:imageViewerPanX,panY:imageViewerPanY};
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
 new ResizeObserver(()=>{if(!imageViewer.hidden){g8mMeasureGalleryLayout();if(imageViewerFitW)imageViewerMeasure(true);}}).observe(imageStage);
}else window.addEventListener('resize',()=>{g8mMeasureGalleryLayout();imageViewerMeasure(true);});
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
   /not found|missing/i.test(reason)?'Photo unavailable · Retry':'Could not load photo · Retry';
  button.title=reason||'Retry photo';
  button.onclick=()=>{button.dataset.photoState='waiting';showPhoto(att,button,renderVersion);};
 };
 if(!((att.provider==='drive'&&att.driveFileId)||(att.provider==='imagekit'&&att.imagekitFileId))){fail(new Error('Photo attachment is unavailable'));return;}
 try{
  const feed=$('g8mMessages'),rectangle=button.getBoundingClientRect(),frame=feed.getBoundingClientRect();
  const priority=rectangle.bottom>=frame.top && rectangle.top<=frame.bottom ? 20 : 10;
  const url=await privatePhotoURL(att,priority,att.provider==='imagekit'?'thumb':'full');
  if(!button.isConnected||button.dataset.photoPath!==path)return;
  const img=document.createElement('img');img.alt=att.name||'Private photo attachment';img.loading='eager';
  img.src=url;
  try{
   if(typeof img.decode==='function')await img.decode();
   else if(!img.complete)await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});
   if(!img.naturalWidth||!img.naturalHeight)throw new Error('Photo image could not be decoded');
  }catch(error){
   // If this ImageKit account restricts unnamed transformations, show the
   // original signed private photo instead of leaving the chat bubble blank.
   const full=att.provider==='imagekit'?g8mCachedUrlExact(path,att.imagekitFileId):'';
   if(!full || full===url){deleteCachedPhoto(path,att.driveFileId||att.imagekitFileId);throw error;}
   img.src=full;
   try{if(typeof img.decode==='function')await img.decode();
    else if(!img.complete)await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});
    if(!img.naturalWidth)throw new Error('Original photo did not decode');
   }catch(fallbackError){deleteCachedPhoto(path,att.imagekitFileId);throw fallbackError;}
  }
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
  if(g8mFollowLatest)g8mScheduleBottomIfFollowing();
  else g8mUpdateScrollLatest();
 }catch(error){console.warn('Private photo:',error);fail(error);}
}

async function acknowledge(messageId,st){
 if(!teacher || !openedUid || !user || !['received','checked'].includes(st))return;
 const msg=[...activeMessages,...olderMessages].find(m=>String(m.id)===String(messageId));
 if(!isReviewableStudentSubmission(msg))return;
 const uid=openedUid; // Keep this write tied to the chosen student's chat.
 const previous=activeAcks[messageId]?.status || '';
 if(previous===st)return;
 try{
  await set(ref(rtdb,`${studentPath(uid)}/acks/${messageId}`),{status:st,atMs:serverTimestamp(),byUid:user.uid});
  if(uid===openedUid)status(st==='checked'?'Marked Checked — no grade was changed.':'Marked Received — no grade was changed.');
  if((previous==='checked') !== (st==='checked')){
   try{await runTransaction(ref(rtdb,`${summaryPath(uid)}/needsChecking`),n=>Math.max(0,Math.min(9999,Number(n||0)+(st==='checked'?-1:1))));}
   catch(error){console.warn('Needs Checking sync pending:',error);}
  }
 }catch(error){if(uid===openedUid)status(friendlyError(error),true);}
}
async function syncCheckingCount(uid){
 try{
  const snap=await get(ref(rtdb,`${studentPath(uid)}/messages`));const ackSnap=await get(ref(rtdb,`${studentPath(uid)}/acks`));
  const msg=snap.val()||{},acks=ackSnap.val()||{};
  const n=Object.keys(msg).filter(id=>isReviewableStudentSubmission(msg[id]) && (!acks[id] || acks[id].status!=='checked')).length;
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
  // ImageKit upload itself is the readiness check. An extra ikProbe would
  // spend an Apps Script execution + RTDB receipt before EVERY fresh session.
  if(!g8mUseImageKit() && !driveBridgeReady)
   void checkDriveBridge().catch(error=>console.warn('Photo bridge precheck:',friendlyError(error)));
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
   reject(new Error('Private photo service is not configured.'));return;
  }
  if(!user){reject(new Error('Sign in to G8Code before using private photo attachments.'));return;}
  if(location.protocol!=='https:'){
   reject(new Error('Photos require the deployed HTTPS website.'));return;
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
  const actionLabel=(action==='read'||action==='ikSign')?'photo viewing':(action==='probe'||action==='ikProbe')?'connection check':'photo upload';
  timeout=setTimeout(()=>finish(new Error(`Photo service did not confirm ${actionLabel} within ${Math.ceil(maxWait/1000)} seconds. Check your connection and try again only after confirming the previous transfer.`)),maxWait);
  try{
   unsub=onValue(receiptRef,snapshot=>{
    if(!snapshot.exists())return;
    const receipt=snapshot.val()||{};
    if(receipt.action!==action)return;
    finish(receipt.ok?null:new Error(receipt.error||'The photo request could not be completed.'),receipt.data);
    if(!receipt.ok)remove(receiptRef).catch(()=>{});
   },error=>{
    finish(new Error('Photo transfer confirmation is unavailable. Please try again.'));
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
async function checkImageKitBridge(){
 if(imageKitBridgeReady)return;
 if(!imageKitBridgeCheckPromise){
  imageKitBridgeCheckPromise=(async()=>{
   const data=await driveRequest('ikProbe',{},16000);
   if(!data||data.version!==1||data.ready!==true)throw new Error('Messenger image service is not ready. Check the new Apps Script deployment.');
   imageKitBridgeReady=true;
  })().finally(()=>{imageKitBridgeCheckPromise=null;});
 }
 return imageKitBridgeCheckPromise;
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
// 30 MB INPUT stays unchanged. Even a 1-3 MB mobile image previously passed
// through Apps Script without compression. For ImageKit, shrink most photos
// near 650 KB (screenshots near 1.1 MB) *before Send* when the file is chosen.
// Drive fallback deliberately preserves its original <= 3 MB behavior.
async function prepareImageForUpload(file,useImageKit=g8mUseImageKit()){
 const screenshot=useImageKit&&(file.type==='image/png'||/screenshot|screen.?shot|screen.?capture|scan|worksheet|document/i.test(file.name));
 const target=useImageKit?(screenshot?IMAGEKIT_SCREEN_TARGET:IMAGEKIT_PHOTO_TARGET):DRIVE_UPLOAD_TARGET;
 if(file.size<=target)return file;
 const bitmap=await imageBitmapForFile(file);
 try{
  const width=bitmap.width||bitmap.naturalWidth,height=bitmap.height||bitmap.naturalHeight;
  if(!width||!height)throw new Error('Image dimensions are unavailable.');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)throw new Error('Your browser cannot optimize this image.');
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  const maxEdge=Math.max(width,height);
  let largest=Math.min(useImageKit?(screenshot?2560:1920):3600,maxEdge);
  const qualitySet=useImageKit?(screenshot?[.89,.82,.74,.66]:[.83,.76,.68,.60]):[.94,.86,.77];
  let best=null;
  for(let round=0;round<7;round++){
   const scale=Math.min(1,largest/maxEdge);
   canvas.width=Math.max(1,Math.round(width*scale));
   canvas.height=Math.max(1,Math.round(height*scale));
   ctx.clearRect(0,0,canvas.width,canvas.height);
   ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   for(const quality of qualitySet){
    let blob=await canvasBlob(canvas,'image/webp',quality);
    if(blob.type!=='image/webp'){
     // Old Safari fallback: JPG. Most chat photos/screenshots are opaque.
     blob=await canvasBlob(canvas,'image/jpeg',quality);
    }
    if(!best||blob.size<best.size)best=blob;
    if(blob.size<=target){
     const ext=blob.type==='image/webp'?'.webp':'.jpg';
     return new File([blob],file.name.replace(/\.[^.]+$/, '')+ext,{type:blob.type,lastModified:Date.now()});
    }
   }
   largest=Math.max(screenshot?900:500,Math.floor(largest*.8));
  }
  // Preserve readability if an unusually detailed screenshot cannot reach
  // the fast target; never exceed the existing server's transfer ceiling.
  if(best && best.size<=DRIVE_UPLOAD_TARGET && best.size<file.size){
   const ext=best.type==='image/webp'?'.webp':'.jpg';
   return new File([best],file.name.replace(/\.[^.]+$/, '')+ext,{type:best.type,lastModified:Date.now()});
  }
  if(file.size<=DRIVE_UPLOAD_TARGET)return file;
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
async function uploadFile(uid,msgKey,entry,index,useImageKit){
 const file=entry.file;
 if(!allowedTypes.has(file.type)||file.size>MAX_SIZE||file.size===0)
  throw new Error('Images must be JPG, PNG, or WEBP and 30 MB or smaller.');
 // These operations were already started after selection; await in parallel.
 // For ImageKit, skip a redundant ikProbe round trip. The real upload
 // confirms configuration and returns a verified private file ID.
 const prepared=await prepareSelectedPhoto(entry);
 if(!useImageKit)await checkDriveBridge();
 const encoded=entry.encoded||(entry.encoded=await fileBase64(prepared));
 // Distinct, stable attachment file names for manual retry.
 const args={
  studentUid:uid,messageId:msgKey,fileName:short(`${index+1}-${prepared.name}`,120),
  contentType:prepared.type,fileSize:prepared.size,fileData:encoded,
  section:short(summaryData(uid).section,100)
 };
 if(useImageKit){
  const res=await driveRequest('ikUpload',args,70000);
  if(!/^[A-Za-z0-9_-]{12,128}$/.test(String(res?.imagekitFileId||'')))
   throw new Error('Photo upload could not be verified.');
  return {path:`g8Messages/${uid}/${msgKey}/${res.imagekitFileId}`,name:short(file.name,120),size:prepared.size,contentType:prepared.type,provider:'imagekit',imagekitFileId:res.imagekitFileId};
 }
 const result=await driveRequest('upload',args,70000);
 if(!result?.driveFileId)throw new Error('Private photo upload could not be verified.');
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
  if(job.uid===openedUid){
   const bytes=job.queued.reduce((sum,entry)=>sum+(entry.prepared?.size||entry.file.size),0);
   status(`Uploading optimized photo${job.queued.length>1?'s':''} (${Math.round(bytes/1024)} KB)…`);
  }
  for(let i=0;i<job.queued.length;i++){
   if(!job.uploaded[i])job.uploaded[i]=await uploadFile(job.uid,job.id,job.queued[i],i,job.useImageKit);
  }
  job.state='saving';refreshPhotoJob(job);
  const messageRef=ref(rtdb,`${studentPath(job.uid)}/messages/${job.id}`);
  // A previous attempt may have saved successfully just before its
  // confirmation timed out. Never overwrite that message on Retry.
  let confirmed=await get(messageRef);
  let photoMessageWasJustCreated=false;
  if(!confirmed.exists()){
   const payload={
    text:short(job.caption,3000),type:'image',senderUid:job.senderUid,
    senderRole:job.senderRole,createdAtMs:serverTimestamp(),
    replyTo:job.replyTo||'',replyText:short(job.replyText||'',180),
    attachments:job.uploaded
   };
   await set(messageRef,payload);
   photoMessageWasJustCreated=true;
   confirmed=await get(messageRef);
  }
  if(!confirmed.exists()||confirmed.val()?.senderUid!==job.senderUid)
   throw new Error('Photo uploaded, but the chat message could not be confirmed. Retry safely.');
  if(photoMessageWasJustCreated){
   if(job.senderRole==='teacher')void window.G8CodePush?.queueTeacherEvent?.({type:'messages',itemId:job.id,targetUid:job.uid});
   else void window.G8CodePush?.queueStudentMessage?.({itemId:job.id,chatUid:job.uid});
  }
  // Reuse the LOCAL preview as a temporary sender-side Drive thumbnail.
  // There is no unnecessary second Drive download after a verified send.
  for(let i=0;i<job.uploaded.length;i++){
   const att=job.uploaded[i],entry=job.queued[i];
   if(att?.path&&entry?.url){
    // Cache the optimized bytes, not a possibly 30 MB camera original.
    // This keeps the sender preview instant without re-reading private Drive.
    const cached=(entry.prepared&&entry.prepared!==entry.file)
     ?URL.createObjectURL(entry.prepared):entry.url;
    cachePhotoUrl(att.path,cached,att.driveFileId||att.imagekitFileId);
    // The successful sender's already-optimized photo also becomes a reusable
    // local cache entry, so refreshing does not trigger a Drive round-trip.
    const confirmedBlob=entry.prepared||entry.file;
    if(confirmedBlob && (att.provider==='drive'||att.provider==='imagekit'))
     void savePhotoToDisk(att,photoCacheOwnerUid,photoAuthEpoch,confirmedBlob);
    if(cached!==entry.url)URL.revokeObjectURL(entry.url);
   }
  }
  pendingPhotoJobs.delete(job.id);
  if(job.uid===openedUid){
   if(!activeMessages.some(m=>m.id===job.id))activeMessages.push({id:job.id,...confirmed.val(),__confirmedLocal:true});
   activeMessages.sort(compareMessages);
   renderMessages();pinMessage(job.id);
  }
  if(job.uid===openedUid)status(`Photo sent ✓ · Saved and confirmed in ${((performance.now()-job.startedAtMs)/1000).toFixed(1)}s.`);
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
  const job={id:key,uid,senderUid:user.uid,senderRole:role(),useImageKit:g8mUseImageKit(),startedAtMs:performance.now(),caption:text,
   createdAtMs:Date.now(),queued,uploaded:[],summary:summaryData(uid),
   replyTo:currentReply?.id||'',replyText:currentReply?.text||'',
   state:'queued',error:'',inProgress:false};
  pendingPhotoJobs.set(key,job);
  // The sender sees the picture instantly; the receiver sees it only AFTER
  // a verified Drive upload and an independently confirmed RTDB write.
  selections=[];reply=null;
  $('g8mTextInput').value='';$('g8mTextInput').style.height='38px';
  renderSelections();renderReply();stopTyping();
  g8mScrollAfterOwnSend(renderMessages);
  pinMessage(key);setSendEnabled();
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
  if(senderRole==='teacher')void window.G8CodePush?.queueTeacherEvent?.({type:'messages',itemId:key,targetUid:uid});
  else void window.G8CodePush?.queueStudentMessage?.({itemId:key,chatUid:uid});
  // Render the verified message immediately. The onValue listener will reconcile
  // it with the other participant's updates. This also protects against UI
  // stalls when the live listener is delayed, interrupted, or showing a stale page.
  if(uid===openedUid){
   const local={id:key,...confirmed.val(),__confirmedLocal:true};
   if(!activeMessages.some(m=>m.id===key))activeMessages.push(local);
   activeMessages.sort(compareMessages);
   // A verified self-send always animates to the newly sent message, even
   // after long backreading; user gestures still cancel that animation.
   g8mScrollAfterOwnSend(renderMessages);
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
  if(!teacher && (attachments.length || sharedProject)){try{await runTransaction(ref(rtdb,`${summaryPath(uid)}/needsChecking`),n=>Math.min(9999,Number(n||0)+1));}catch(error){syncIssue=true;console.warn('Shared item saved; Needs Checking badge sync pending',error);}}
 $('g8mTextInput').value='';$('g8mTextInput').style.height='38px';selections.forEach(x=>URL.revokeObjectURL(x.url));selections=[];selectedProject=null;renderSelections();renderProjectSelection();reply=null;renderReply();
  if(uid===openedUid)pinMessage(key);
  // Firebase verified the write. Viewport visibility is NOT delivery status:
  // a user may have been reading old messages, or the chat may be animating.
  status(syncIssue?'Sent ✓ · Inbox badge sync pending.':'Sent ✓');
 }catch(error){console.error('Message send failed:',error);status(`Not confirmed: ${friendlyError(error)}. Your text and files are retained.`,true);}
 finally{sending=false;setSendEnabled();}
}

// === V4.0: Secure, live-reference project sharing (no code snapshots in messages). ===
const projectPicker=$('g8mProjectPicker'),projectViewer=$('g8mProjectViewer');
let g8mAdminProjectSource=null,g8mProjectOpenVersion=0;
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
$('g8mViewerClose').addEventListener('click',g8mCloseSharedProject);
for(const modal of [projectPicker,projectViewer])modal.addEventListener('click',event=>{if(event.target===modal){if(modal===projectViewer)g8mCloseSharedProject();else closeModal(modal);}});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 if(!cameraOverlay.hidden){event.preventDefault();closeCamera();return;}
 if(!projectViewer.hidden){event.preventDefault();g8mCloseSharedProject();return;}
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
// The teacher's gallery uses the same isolated, read-only real project
// renderer as project cards in chat. Do not replace it with a metadata card.
function g8mCloseSharedProject(reopenGallery=true){
 const fromGallery=Boolean(g8mAdminProjectSource);
 g8mProjectOpenVersion++; // Ignore late Firestore responses after closing.
 g8mAdminProjectSource=null;
 $('g8mViewerFindMessage').hidden=true;
 closeModal(projectViewer);
 if(fromGallery&&reopenGallery&&g8mAdminAllowed())g8mAdminOpen('projects');
}
$('g8mViewerFindMessage').addEventListener('click',()=>{
 const msg=g8mAdminProjectSource;
 if(!msg||!g8mAdminAllowed())return;
 g8mCloseSharedProject(false);
 g8mAdminJumpToMessage(msg);
});
// Use the authenticated conversation and verified SAME-student UID group only.
// For historical shares, the student's project may have moved to a newer UID;
// never search a different student's Firestore path or copy any stored data.
async function openSharedProject(studentUid,projectId,options={}){
 if(!user||!studentUid||!projectId)return;
 if(!/^[A-Za-z0-9_-]{1,128}$/.test(projectId)){status('Invalid project reference.',true);return;}
 if(!teacher&&studentUid!==user.uid){status('You can only view your own project.',true);return;}
 const message=teacher&&options.fromAdminGallery&&g8mAdminAllowed()?options.message:null;
 const currentUid=openedUid,openVersion=++g8mProjectOpenVersion;
 if(message)g8mAdminClose(false);
 g8mAdminProjectSource=message||null;
 openModal(projectViewer);
 if(message)projectModalReturnFocus=g8mAdminUI.button;
 $('g8mViewerFindMessage').hidden=!message;
 $('g8mViewerTitle').textContent='Opening latest saved project…';
 $('g8mViewerMeta').textContent='Loading the actual project output…';
 $('g8mViewerError').hidden=true;
 $('g8mViewerWorkspace').hidden=true;
 $('g8mViewerLoading').hidden=false;
 const valid=()=>openVersion===g8mProjectOpenVersion&&!projectViewer.hidden&&openedUid===currentUid;
 try{
  await ensureProjectFirestore();
  if(!valid())return;
  const verified=message?g8mAdminVerifiedUids(currentUid):[];
  const candidateUids=message?[...new Set([studentUid,...verified])].slice(0,8):[studentUid];
  let snapshot=null,actualUid=studentUid,lastError=null;
  for(const candidate of candidateUids){
   if(!valid())return;
   if(message&&!verified.includes(candidate)&&candidate!==studentUid)continue;
   try{
    const path=[window.MCS_FIREBASE_COLLECTION||'webCodeEditor',window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1','students',candidate,'projects',projectId];
    const result=await getDocFromServer(doc(firestore,...path));
    if(!valid())return;
    if(result.exists()){snapshot=result;actualUid=candidate;break;}
   }catch(error){lastError=error;}
  }
  if(!snapshot)throw lastError||new Error('This saved project was deleted or is no longer available.');
  const project=snapshot.data()||{};
  $('g8mViewerTitle').textContent=short(project.name||message?.projectName||'G8Code Project',120);
  $('g8mViewerMeta').textContent=`${teacher?person(actualUid).name:'My Project'} · Last saved ${stampLabel(project.updatedAt)} · Read-only`;
  projectViewerFiles=normalizeViewerProject(project);
  viewerHeight=800;viewerZoom='fit';viewerView='output';viewerPreviewReady=false;
  $('g8mViewerZoom').value='fit';
  // V4C-20: Gallery and Chat MUST invoke the same preview layout and
  // rendering path. Gallery used to force Output while Chat used Split on
  // desktop, changing the Fit scale and making identical sites look different.
  // Both entry points show the actual output immediately, using identical
  // toolbar, canvas width, and source panel (desktop only).
  setViewerMode(window.matchMedia('(min-width:1050px)').matches?'split':'output');
  populateViewerPages();populateViewerSource();
  $('g8mViewerWorkspace').hidden=false;
  $('g8mViewerLoading').hidden=true;
  $('g8mViewerWireframeNotice').hidden=true;
  $('g8mViewerDeviceLabel').hidden=true;
  renderViewerPreview();
  requestAnimationFrame(sizeDesktopProjectPreview);
 }catch(error){
  if(!valid())return;
  $('g8mViewerLoading').hidden=true;
  $('g8mViewerError').hidden=false;
  $('g8mViewerError').textContent='Could not open this saved project: '+friendlyError(error);
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
 function axisCanScroll(el,axis,delta){
  if(!delta)return false;
  const st=getComputedStyle(el),isX=axis==='x';
  const overflow=isX?st.overflowX:st.overflowY;
  if(!/(auto|scroll)/.test(overflow))return false;
  const pos=isX?el.scrollLeft:el.scrollTop;
  const distance=(isX?el.scrollWidth-el.clientWidth:el.scrollHeight-el.clientHeight);
  return distance>2&&((delta>0&&pos<distance-2)||(delta<0&&pos>2));
 }
 function innerScrollable(target,dx,dy){
  for(let el=target;el&&el!==document.documentElement;el=el.parentElement){
   if(axisCanScroll(el,'x',dx)||axisCanScroll(el,'y',dy))return true;
  }
  return false;
 }
 document.addEventListener('wheel',e=>{
  if(e.ctrlKey||e.metaKey||innerScrollable(e.target,e.deltaX,e.deltaY))return;
  e.preventDefault();notify({scrollY:e.deltaY,scrollX:e.deltaX,scrollSource:'wheel',deltaMode:e.deltaMode});
 },{passive:false});
 let touch=null;
 document.addEventListener('touchstart',e=>{
  if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null;
 },{passive:true});
 document.addEventListener('touchmove',e=>{
  if(!touch||e.touches.length!==1)return;
  const next={x:e.touches[0].clientX,y:e.touches[0].clientY};
  const dy=touch.y-next.y,dx=touch.x-next.x;
  touch=next;
  if(innerScrollable(e.target,dx,dy))return;
  e.preventDefault();notify({scrollY:dy,scrollX:dx,scrollSource:'touch'});
 },{passive:false});
 document.addEventListener('touchend',()=>touch=null,{passive:true});
 document.addEventListener('touchcancel',()=>touch=null,{passive:true});
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
 const specified=viewerZoom==='fit'?Math.min(1,width/PROJECT_DESKTOP_WIDTH):Number(viewerZoom);
 const scale=Number.isFinite(specified)&&specified>=.1&&specified<=1.5?specified:1;
 const previousScale=Number(stage.dataset.scale)||scale;
 // Represent the transformed iframe's FULL width and document height in the
 // host scroll size; a CSS transform alone leaves clipped/unreachable edges.
 const previousX=host.scrollLeft/previousScale,previousY=host.scrollTop/previousScale;
 stage.style.width=Math.ceil(PROJECT_DESKTOP_WIDTH*scale)+'px';
 stage.style.height=Math.ceil(Math.max(800,viewerHeight)*scale)+'px';
 stage.dataset.scale=String(scale);
 frame.style.width=PROJECT_DESKTOP_WIDTH+'px';
 frame.style.height=Math.max(800,viewerHeight)+'px';
 frame.style.transform='scale('+scale+')';
 $('g8mViewerViewportNote').textContent=`Desktop 1280px · ${Math.round(scale*100)}% · scroll ↕ ↔`;
 if(Math.abs(scale-previousScale)>.001){
  host.scrollLeft=Math.max(0,previousX*scale);
  host.scrollTop=Math.max(0,previousY*scale);
 }
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
 if(data.scrollY!==undefined||data.scrollX!==undefined){
  // Transform scale changes the physical drag distance. Wheel deltas already
  // describe screen pixels; line/page-mode wheels need pixel conversion.
  const mode=data.scrollSource==='wheel'?Number(data.deltaMode)||0:0;
  const multiplier= data.scrollSource==='touch'?scale:(mode===1?16:mode===2?host.clientHeight:1);
  const dx=(Number(data.scrollX)||0)*multiplier,dy=(Number(data.scrollY)||0)*multiplier;
  if(Number.isFinite(dx)&&Number.isFinite(dy))host.scrollBy({left:dx,top:dy,behavior:'instant'});
 }
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
 // Revoke transient object URLs; persistent cache is managed by auth/TTL.
 imageCache.forEach(url=>URL.revokeObjectURL(url));
});


// === V4C-18: Admin-only Search / Shared Photos / Shared Projects ==============
// All reads are on demand; each student's already verified UID group is used.
// orderByKey pages prevent legacy missing/incorrect createdAtMs values from
// hiding records from the index. No messages or media are copied to RTDB.
const g8mAdminUI={button:$('g8mAdminToolsOpen'),panel:$('g8mAdminTools'),backdrop:$('g8mAdminToolsBackdrop'),tabs:$('g8mAdminToolsTabs'),results:$('g8mAdminToolsResults'),status:$('g8mAdminToolsStatus'),count:$('g8mAdminToolsCount'),input:$('g8mAdminSearchText'),filter:$('g8mAdminSearchFilter'),retry:$('g8mAdminToolsRetry')};
let g8mAdminContext=0,g8mAdminScan=null,g8mAdminTab='search',g8mAdminKind='all',g8mAdminMediaObserver=null,g8mAdminResultsTimer=null,g8mAdminLastFocus=null;
const G8M_ADMIN_SCAN_PAGE=120;
function g8mAdminAllowed(){return Boolean(teacher&&user&&openedUid&&g8mAdminUI.button&&!g8mAdminUI.button.hidden);}
function g8mAdminReset(){
 g8mAdminContext++;
 clearTimeout(g8mAdminResultsTimer);g8mAdminResultsTimer=null;
 if(g8mAdminMediaObserver){g8mAdminMediaObserver.disconnect();g8mAdminMediaObserver=null;}
 g8mAdminScan=null;g8mAdminFocusedMessages=[];g8mAdminGalleryViewer=false;
 if(g8mAdminUI.panel){g8mAdminUI.panel.hidden=true;g8mAdminUI.backdrop.hidden=true;}
 if(g8mAdminUI.button)g8mAdminUI.button.setAttribute('aria-expanded','false');
 if(g8mAdminUI.results)g8mAdminUI.results.replaceChildren();
}
function g8mAdminPhotoList(msg){
 const uid=String(msg.__threadUid||openedUid),id=String(msg.id||'');
 const attachments=Array.isArray(msg.attachments)?msg.attachments:Object.values(msg.attachments||{});
 return attachments.slice(0,MAX_FILES).filter(att=>att&&typeof att.path==='string'&&att.path.startsWith(`g8Messages/${uid}/${id}/`)&&/^[A-Za-z0-9_-]+$/.test(att.path.split('/').pop())).map(att=>({...att,studentUid:uid,messageId:id,at:messageTime(msg)}));
}
function g8mAdminVisible(msg){
 if(!msg||isDeletedMessage(msg))return false;
 const uid=String(msg.__threadUid||openedUid);
 if(uid===openedUid)return !hiddenMessageIds[msg.id]&&!deletedMessageIndex[msg.id];
 const entry=g8mLinkedHistories.get(uid);
 return Boolean(entry&&!entry.hidden?.[msg.id]);
}
function g8mAdminSorted(){
 const index=new Map(g8mAdminScan?.records||[]);
 // Overlay realtime snapshots, so newly delivered and deleted messages are current.
 for(const m of [...g8mHistoricMessages(),...olderMessages,...activeMessages]){
  if(m?.id)index.set(`${m.__threadUid||openedUid}/${m.id}`,m);
 }
 return [...index.values()].filter(g8mAdminVisible).sort((a,b)=>compareMessages(b,a));
}
function g8mAdminPhotoItems(){
 return g8mAdminSorted().flatMap(msg=>g8mAdminPhotoList(msg));
}
function g8mAdminProjectItems(){
 return g8mAdminSorted().filter(msg=>msg.type==='project'&&/^[A-Za-z0-9_-]{1,128}$/.test(String(msg.projectId||'')));
}
function g8mAdminText(msg){
 return [visibleMessageText(msg),msg.type==='project'?msg.projectName:'',msg.replyText||''].filter(Boolean).join(' ');
}
function g8mAdminStatus(message){g8mAdminUI.status.textContent=message;g8mAdminUI.status.hidden=!message;}
function g8mAdminScheduleRender(){
 if(g8mAdminUI.panel.hidden)return;
 clearTimeout(g8mAdminResultsTimer);
 g8mAdminResultsTimer=setTimeout(g8mAdminRender,125);
}
function g8mAdminVerifiedUids(primary){
 // Do not trust arbitrary uid from search parameters. Same verified group
 // used by showRelatedAccountThreads / the existing admin inbox.
 const group=groupForUid(primary),linked=(group?.uids||[]).filter(uid=>students.has(uid)||Boolean(summaries[uid]));
 return [...new Set([primary,...linked])].filter(uid=>/^[A-Za-z0-9_-]{5,128}$/.test(uid));
}
async function g8mAdminIndexConversation(){
 if(!g8mAdminAllowed()||g8mAdminUI.panel.hidden||g8mAdminTab==='settings')return;
 const primary=openedUid,owner=user.uid,context=g8mAdminContext;
 if(g8mAdminScan?.uid===primary){if(!g8mAdminScan.loading){g8mAdminScheduleRender();}return;}
 const scan={uid:primary,owner,records:new Map(),loading:true,finished:false,error:null,threads:g8mAdminVerifiedUids(primary),done:0};
 g8mAdminScan=scan;
 g8mAdminStatus('Finding shared conversation history…');
 g8mAdminScheduleRender();
 const valid=()=>context===g8mAdminContext&&teacher&&user?.uid===owner&&openedUid===primary&&g8mAdminScan===scan;
 // Parallel per UID; sequential bounded pages within a thread. Never fetch
 // photo bytes or Firestore project documents to build the index.
 const results=await Promise.allSettled(scan.threads.map(async uid=>{
  let cursor=null;
  while(valid()){
   const baseRef=ref(rtdb,`${studentPath(uid)}/messages`);
   const args=[orderByKey()];
   if(cursor!==null)args.push(endBefore(cursor));
   args.push(limitToLast(G8M_ADMIN_SCAN_PAGE));
   const snap=await get(query(baseRef,...args));
   if(!valid())return;
   const page=[];
   snap.forEach(child=>{
    const v=child.val();if(v&&typeof v==='object'&&child.key)page.push({id:String(child.key),...v,__threadUid:uid,__historical:uid!==primary});
   });
   for(const msg of page)scan.records.set(`${uid}/${msg.id}`,msg);
   g8mAdminScheduleRender();
   if(page.length<G8M_ADMIN_SCAN_PAGE)break;
   const oldest=page[0]?.id;
   if(!oldest||oldest===cursor)break;
   cursor=oldest;
  }
  if(valid()){scan.done++;g8mAdminScheduleRender();}
 }));
 if(!valid())return;
 const failed=results.filter(result=>result.status==='rejected');
 scan.loading=false;scan.finished=!failed.length;scan.error=failed.length?'Some older messages could not be loaded. Try again to search the complete conversation.':null;
 g8mAdminUI.retry.hidden=!failed.length;
 if(failed.length)console.warn('Admin conversation history search incomplete:',failed.map(x=>x.reason));
 g8mAdminRender();
}
function g8mAdminOpen(tab='search'){
 if(!g8mAdminAllowed())return;
 g8mAdminLastFocus=document.activeElement;
 g8mAdminUI.panel.hidden=false;g8mAdminUI.backdrop.hidden=false;
 g8mAdminUI.button.setAttribute('aria-expanded','true');
 $('g8mAdminToolsPerson').textContent=$('g8mChatName').textContent;
 g8mAdminSetTab(tab);
 if(tab!=='settings'&&(!g8mAdminScan||g8mAdminScan.uid!==openedUid))void g8mAdminIndexConversation();
 if(tab==='search')g8mAdminUI.input.focus();else $('g8mAdminToolsClose').focus();
}
function g8mAdminClose(restoreFocus=true){
 g8mAdminUI.panel.hidden=true;g8mAdminUI.backdrop.hidden=true;
 g8mAdminUI.button.setAttribute('aria-expanded','false');
 if(g8mAdminMediaObserver){g8mAdminMediaObserver.disconnect();g8mAdminMediaObserver=null;}
 if(restoreFocus)g8mAdminLastFocus?.focus?.();
}
function g8mAdminSetTab(tab){
 if(!['search','photos','projects','settings'].includes(tab))return;
 g8mAdminTab=tab;
 for(const b of g8mAdminUI.tabs.querySelectorAll('button[data-g8m-admin-tab]')){
  const active=b.dataset.g8mAdminTab===tab;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));
 }
 $('g8mAdminSearchControls').hidden=tab!=='search';
 $('g8mAdminScreenshotSettings').hidden=tab!=='settings';
 g8mAdminUI.results.hidden=tab==='settings';
 g8mAdminUI.status.hidden=tab==='settings';
 g8mAdminUI.count.closest('.g8m-admin-tools-footer').hidden=tab==='settings';
 if(tab==='settings'){g8mPaintScreenshotPolicy();return;}
 g8mAdminRender();
 if(!g8mAdminScan||g8mAdminScan.uid!==openedUid)void g8mAdminIndexConversation();
}
function g8mAdminMakeItem(tag,cls,text){return textEl(tag,cls,text);}
function g8mAdminStamp(msg){return absoluteTime(messageTime(msg)).replace(/:\d{2}(\s*[AP]M)/i,'$1');}
function g8mAdminResultButton(msg,description,icon){
 const b=g8mAdminMakeItem('button','g8m-admin-result','');b.type='button';
 const glyph=g8mAdminMakeItem('span','g8m-admin-result-icon',icon);
 const body=g8mAdminMakeItem('span','g8m-admin-result-body','');
 body.append(g8mAdminMakeItem('strong','',description||'Message'),g8mAdminMakeItem('small','',`${msg.senderRole==='teacher'?'Teacher':'Student'} · ${g8mAdminStamp(msg)}`));
 b.append(glyph,body,g8mAdminMakeItem('span','g8m-admin-result-go','›'));
 return b;
}
function g8mAdminRender(){
 if(!g8mAdminAllowed()||g8mAdminUI.panel.hidden||g8mAdminTab==='settings')return;
 const target=g8mAdminUI.results;
 const scan=g8mAdminScan;
 if(g8mAdminMediaObserver){g8mAdminMediaObserver.disconnect();g8mAdminMediaObserver=null;}
 target.replaceChildren();
 const loading=Boolean(scan?.loading);
 const ready=scan&&scan.uid===openedUid;
 if(!ready){g8mAdminStatus('Preparing conversation history…');return;}
 if(scan.error)g8mAdminStatus(scan.error);
 else if(loading)g8mAdminStatus(`Finding messages in this conversation… ${scan.done} of ${scan.threads.length} threads checked`);
 else g8mAdminStatus('');
 g8mAdminUI.retry.hidden=!scan.error;
 if(g8mAdminTab==='photos'){
  const photos=g8mAdminPhotoItems();
  g8mAdminUI.count.textContent=`${photos.length} photo${photos.length===1?'':'s'}${loading?' found so far':''}`;
  if(!photos.length){target.append(notice(loading?'Looking for photos…':'No shared photos in this conversation.'));return;}
  const grid=g8mAdminMakeItem('div','g8m-admin-photo-gallery','');
  const renderThumb=(item,att,token)=>{
   if(item.dataset.photoLoading==='1')return;
   item.dataset.photoLoading='1';
   const fileId=att.driveFileId||att.imagekitFileId;
   const variant=att.provider==='imagekit'?'thumb':'full';
   const cached=cachedPhotoUrl(att.path,fileId,variant);
   const finish=url=>{
    if(g8mAdminContext!==token||!item.isConnected||!g8mAdminAllowed())return;
    const picture=document.createElement('img');picture.alt='Shared photo';picture.loading='lazy';picture.decoding='async';picture.src=url;
    item.replaceChildren(picture);item.classList.add('is-ready');
   };
   if(cached){finish(cached);return;}
   void privatePhotoURL(att,3,variant).then(finish).catch(()=>{
    if(g8mAdminContext!==token||!item.isConnected)return;
    item.dataset.photoLoading='';
    item.classList.add('is-error');item.replaceChildren(g8mAdminMakeItem('span','','Tap to retry'));
   });
  };
  const context=g8mAdminContext;
  if(typeof IntersectionObserver==='function'){
   g8mAdminMediaObserver=new IntersectionObserver(entries=>{
    for(const e of entries)if(e.isIntersecting){g8mAdminMediaObserver?.unobserve(e.target);renderThumb(e.target,e.target._g8mPhoto,context);}
   },{root:target,rootMargin:'220px'});
  }
  photos.forEach((att,i)=>{
   const b=g8mAdminMakeItem('button','g8m-admin-photo-tile','');b.type='button';
   b.title='Open photo · '+g8mAdminStamp({createdAtMs:att.at});b.setAttribute('aria-label',`Open photo ${i+1} of ${photos.length}`);
   b._g8mPhoto=att;
   b.addEventListener('click',()=>{
    if(b.classList.contains('is-error')){b.classList.remove('is-error');renderThumb(b,att,context);return;}
    if(!g8mAdminAllowed())return;
    // Reuse *exactly* the corrected V4C-17 full-slide drag/pinch viewer.
    // Each attachment keeps its own UID/message id while navigating all photos.
    openPhotoGallery(photos,i,null,null,true);
   });
   grid.append(b);
   if(g8mAdminMediaObserver)g8mAdminMediaObserver.observe(b);else if(i<18)renderThumb(b,att,context);
  });
  target.append(grid);
 }else if(g8mAdminTab==='projects'){
  const projects=g8mAdminProjectItems();
  g8mAdminUI.count.textContent=`${projects.length} shared project${projects.length===1?'':'s'}${loading?' found so far':''}`;
  if(!projects.length){target.append(notice(loading?'Looking for shared projects…':'No projects have been shared in this conversation.'));return;}
  for(const msg of projects){
   const b=g8mAdminResultButton(msg,short(msg.projectName||'G8Code Project',120),'⌘');
   b.title='Open actual project output';
   b.setAttribute('aria-label',`Open read-only output: ${short(msg.projectName||'G8Code Project',120)}`);
   b.addEventListener('click',()=>{if(g8mAdminAllowed())void openSharedProject(msg.__threadUid||openedUid,String(msg.projectId),{fromAdminGallery:true,message:msg});});
   const jump=g8mAdminMakeItem('button','g8m-admin-inline-jump','View in Chat');jump.type='button';
   jump.addEventListener('click',()=>g8mAdminJumpToMessage(msg));
   const line=g8mAdminMakeItem('div','g8m-admin-project-row','');line.append(b,jump);target.append(line);
  }
 }else{
  const q=g8mAdminUI.input.value.trim().toLocaleLowerCase();
  const all=g8mAdminSorted();
  const matches=q?all.filter(msg=>{
   const text=g8mAdminText(msg).toLocaleLowerCase();
   if(!text.includes(q))return false;
   if(g8mAdminKind==='text')return !!visibleMessageText(msg);
   if(g8mAdminKind==='photo')return g8mAdminPhotoList(msg).length>0;
   if(g8mAdminKind==='project')return msg.type==='project';
   return true;
  }):[];
  g8mAdminUI.count.textContent=q?`${matches.length} match${matches.length===1?'':'es'}${loading?' so far':''}`:'Search by word, phrase, or project name';
  if(!q){target.append(notice('Search messages and shared project titles from this student’s conversation.'));return;}
  if(!matches.length){target.append(notice(loading?'Searching older messages…':'No matching messages found.'));return;}
  // Bounded rendering for large searches: all matches are indexed, but
  // only the first 120 cards enter the DOM at once to avoid mobile freezes.
  const PAGE=120;let displayed=0;
  const highlight=(target,value,term)=>{
   target.replaceChildren();
   const low=value.toLocaleLowerCase(),needle=term.toLocaleLowerCase();
   let start=0,position=low.indexOf(needle,start),parts=0;
   while(position>=0 && parts++<24){
    target.append(document.createTextNode(value.slice(start,position)));
    const mark=document.createElement('mark');mark.className='g8m-admin-highlight';mark.textContent=value.slice(position,position+term.length);target.append(mark);
    start=position+term.length;position=low.indexOf(needle,start);
   }
   target.append(document.createTextNode(value.slice(start)));
  };
  const appendPage=()=>{
   const next=matches.slice(displayed,displayed+PAGE);displayed+=next.length;
   for(const msg of next){
    const value=short(g8mAdminText(msg).replace(/\s+/g,' ').trim(),210)||'Shared message';
    const b=g8mAdminResultButton(msg,value,msg.type==='project'?'⌘':g8mAdminPhotoList(msg).length?'▧':'✉');
    highlight(b.querySelector('strong'),value,q);
    b.addEventListener('click',()=>g8mAdminJumpToMessage(msg));target.append(b);
   }
   const more=target.querySelector('.g8m-admin-more');if(more)more.remove();
   if(displayed<matches.length){
    const b=g8mAdminMakeItem('button','g8m-admin-more',`Show more (${matches.length-displayed} remaining)`);b.type='button';b.addEventListener('click',appendPage);target.append(b);
   }
  };
  appendPage();
 }
}
function g8mAdminJumpToMessage(msg){
 if(!g8mAdminAllowed()||!msg?.id)return;
 const uid=String(msg.__threadUid||openedUid),key=`message:${uid}:${msg.id}`;
 if(!g8mAdminVisible(msg))return;
 // Search may find a record older than the live/history windows. Add only a
 // temporary surrounding context: do NOT alter olderMessages pagination cursor.
 const existing=new Set([...g8mHistoricMessages(),...activeMessages,...olderMessages].map(m=>`${m.__threadUid||openedUid}/${m.id}`));
 if(!existing.has(`${uid}/${msg.id}`)){
  const sorted=g8mAdminSorted().slice().reverse();const at=sorted.findIndex(m=>m.id===msg.id&&(m.__threadUid||openedUid)===uid);
  const windowRecords=sorted.slice(Math.max(0,at-9),at+10).filter(m=>!existing.has(`${m.__threadUid||openedUid}/${m.id}`));
  const focused=new Map(g8mAdminFocusedMessages.map(m=>[`${m.__threadUid||openedUid}/${m.id}`,m]));
  for(const m of windowRecords)focused.set(`${m.__threadUid||openedUid}/${m.id}`,m);
  g8mAdminFocusedMessages=[...focused.values()].slice(-70);
 }
 g8mAdminClose(false);switchMobile('chat');g8mFollowLatest=false;g8mSmoothLatest=false;
 renderMessages();
 const focus=()=>{
  const feed=$('g8mMessages');const row=[...feed.querySelectorAll('.g8m-message[data-chat-key]')].find(el=>el.dataset.chatKey===key);
  if(!row)return;
  const feedRect=feed.getBoundingClientRect(),rect=row.getBoundingClientRect();
  const shift=rect.top-feedRect.top-(feed.clientHeight-rect.height)*.36;
  feed.scrollTo({top:feed.scrollTop+shift,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  row.classList.remove('g8m-jump-focus');void row.offsetWidth;row.classList.add('g8m-jump-focus');
  setTimeout(()=>row.classList.remove('g8m-jump-focus'),1800);
 };
 requestAnimationFrame(()=>requestAnimationFrame(focus));
}
g8mAdminUI.button?.addEventListener('click',()=>g8mAdminOpen('search'));
$('g8mAdminToolsClose')?.addEventListener('click',()=>g8mAdminClose());
g8mAdminUI.backdrop?.addEventListener('click',()=>g8mAdminClose());
g8mAdminUI.tabs?.addEventListener('click',event=>{const b=event.target.closest('button[data-g8m-admin-tab]');if(b)g8mAdminSetTab(b.dataset.g8mAdminTab);});
g8mAdminUI.filter?.addEventListener('click',event=>{
 const b=event.target.closest('button[data-g8m-search-kind]');if(!b)return;
 g8mAdminKind=b.dataset.g8mSearchKind;
 g8mAdminUI.filter.querySelectorAll('button').forEach(btn=>{const selected=btn===b;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected));});
 g8mAdminScheduleRender();
});
g8mAdminUI.input?.addEventListener('input',g8mAdminScheduleRender);
g8mAdminUI.retry?.addEventListener('click',()=>{g8mAdminScan=null;void g8mAdminIndexConversation();});
$('g8mImageFindMessage')?.addEventListener('click',()=>{
 if(!g8mAdminAllowed()||!g8mAdminGalleryViewer)return;
 const photo=photoGallery[photoGalleryIndex];if(!photo?.messageId)return;
 const uid=photo.studentUid||openedUid;
 const msg=g8mAdminSorted().find(m=>m.id===photo.messageId&&(m.__threadUid||openedUid)===uid);
 $('g8mImageClose').click();
 if(msg)g8mAdminJumpToMessage(msg);
});
document.addEventListener('keydown',event=>{
 if(!g8mAdminUI.panel.hidden && event.key==='Escape' && imageViewer.hidden && projectViewer.hidden){event.preventDefault();g8mAdminClose();}
});
// === End V4C-18 ==============================================================


boot();
