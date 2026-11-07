/* G8Code Admin Notification Center — RTDB only, no Firestore SDK or queries. */
(()=>{'use strict';
 const ROOT='g8AdminActivityV1',CHUNK=180,TEACHER=new Set((window.MCS_TEACHER_EMAILS||[]).map(e=>String(e).toLowerCase()));
 const $=id=>document.getElementById(id),n=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};
 const CATS=['all','messages','announcements','lessons','activities','projects'];
 const ICONS={message:'✉',message_reply:'↳',message_reaction:'♥',photo:'▧',project_share:'⌘',post_reaction:'♥',post_comment:'▤',post_reply:'↳',comment_reaction:'♥',post_view:'◉',lesson_view:'▣',lesson_complete:'✓',activity_view:'▣',activity_read:'✓',activity_complete:'✓',project_create:'⌘'};
 const ACTIONS={message:'sent you a message',message_reply:'replied in Messenger',message_reaction:'reacted to a message',photo:'sent you a photo',project_share:'shared a project',post_reaction:'reacted to your announcement',post_comment:'commented on your announcement',post_reply:'replied to a comment',comment_reaction:'reacted to a comment',post_view:'viewed your announcement',lesson_view:'opened a lesson',lesson_complete:'completed a lesson',activity_view:'opened an activity',activity_read:'marked an activity as read',activity_complete:'completed an activity',project_create:'created a project'};
 let sdk,app,auth,db,events=new Map(),unread={},category='all',olderAvailable=false,busy=false,firstLive=true,loadedLimit=CHUNK,activeDetail=null;
 const storedTheme=(()=>{try{return localStorage.getItem('g8code.adminWorkspaceAppearance.v1')||'';}catch{return '';}})();
 document.body.classList.toggle('nc-dark',storedTheme==='dark'||(!storedTheme&&matchMedia('(prefers-color-scheme:dark)').matches));
 $('ncTheme').addEventListener('click',()=>{document.body.classList.toggle('nc-dark');try{localStorage.setItem('g8code.adminWorkspaceAppearance.v1',document.body.classList.contains('nc-dark')?'dark':'light');}catch{}});
 const stamp=ms=>new Intl.DateTimeFormat('en-PH',{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'Asia/Manila'}).format(new Date(Number(ms||Date.now())));
 const relative=ms=>{const mins=Math.max(0,Math.round((Date.now()-Number(ms||0))/60000));if(mins<1)return 'Just now';if(mins<60)return `${mins}m ago`;if(mins<1440)return `${Math.floor(mins/60)}h ago`;return stamp(ms);};
 const dayKey=ms=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));
 const isValid=s=>/^[\w-]{1,128}$/.test(String(s||''));
 const fromLogin=new URLSearchParams(window.location.search).get('from')==='login';
 if(fromLogin){const back=$('ncBack');back.href='index.html';back.setAttribute('aria-label','Back to G8Code Login');back.querySelector('span').textContent='Login';try{sessionStorage.setItem('g8code.adminShortcutReturn.v1',String(Date.now()));}catch{}}
 let filterOpen=false;
 function setFilterOpen(open,{fromHistory=false}={}){
  filterOpen=Boolean(open);document.body.classList.toggle('nc-filter-open',filterOpen);
  $('ncMobileFilterToggle').setAttribute('aria-expanded',String(filterOpen));
  $('ncFilterScrim').hidden=!filterOpen;
  if(filterOpen&&!fromHistory){history.pushState({...history.state,g8NcFilter:true},'');}
  if(!filterOpen&&!fromHistory&&history.state?.g8NcFilter)history.back();
 }
 $('ncMobileFilterToggle').addEventListener('click',()=>setFilterOpen(!filterOpen));
 $('ncFilterScrim').addEventListener('click',()=>setFilterOpen(false));
 $('ncFilterApply').addEventListener('click',()=>setFilterOpen(false));
 window.addEventListener('popstate',()=>{if(filterOpen)setFilterOpen(false,{fromHistory:true});});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&filterOpen)setFilterOpen(false);});

 const groupKey=e=>{
  if(e.category==='announcements'&&['post_reaction','post_comment','post_reply','comment_reaction','post_view'].includes(e.action)){
   return [e.category,e.action,e.targetId,e.action==='comment_reaction'||e.action==='post_reply'?e.contextId:''].join(':');
  }
  if(e.category==='messages')return `${e.category}:${e.action}:${e.actorUid}:${e.targetId}`; // individual messages remain accessible
  return [e.category,e.action,e.targetId].join(':');
 };
 const groupRows=rows=>{
  const map=new Map();
  for(const e of rows){const key=groupKey(e);if(!map.has(key))map.set(key,{key,items:[]});map.get(key).items.push(e);}
  return [...map.values()].map(g=>({...g,items:g.items.sort((a,b)=>b.atMs-a.atMs),latest:Math.max(...g.items.map(e=>e.atMs))}));
 };
 const allEvents=()=>[...events.values()].sort((a,b)=>b.atMs-a.atMs);
 const isUnread=e=>Object.prototype.hasOwnProperty.call(unread,e.id);
 const groupedUnread=(section='all')=>groupRows(Object.entries(unread).map(([id,v])=>({id,...v})).filter(e=>e.action&&e.targetId&&(section==='all'||e.section===section)));
 function updateBadges(){
  const allGroups=groupedUnread();
  const selectedSection=$('ncSection').value||'all';
  const groups=groupedUnread(selectedSection);
  for(const cat of CATS){const amount=cat==='all'?groups.length:groups.filter(g=>g.items[0]?.category===cat).length;
   const badge=document.querySelector(`[data-badge="${cat}"]`);if(badge){badge.hidden=amount<=0;badge.textContent=amount>99?'99+':String(amount);} }
  const total=allGroups.length;
  $('ncSideBadge').hidden=!total;$('ncSideBadge').textContent=total>99?'99+':total;
  $('ncCountAll').textContent=String(total);$('ncMarkAll').disabled=!total;$('ncMobileMarkAll').disabled=!total;
  const now=dayKey(Date.now());$('ncCountToday').textContent=String(allEvents().filter(e=>dayKey(e.atMs)===now).length);
  $('ncCountLoaded').textContent=String(events.size);
 }
 function updateSections(){const selected=$('ncSection').value;const names=[...new Set([...events.values(),...Object.values(unread)].map(x=>x?.section).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  $('ncSection').replaceChildren(n('option','', 'All sections'));$('ncSection').firstChild.value='all';
  for(const name of names){const opt=n('option','',name);opt.value=name;$('ncSection').append(opt);}
  $('ncSection').value=names.includes(selected)?selected:'all';
 }
 function filtered(){
  let rows=allEvents(),q=$('ncSearch').value.trim().toLocaleLowerCase(),s=$('ncSection').value,status=$('ncStatus').value,date=$('ncDate').value;
  if(category!=='all')rows=rows.filter(e=>e.category===category);
  if(s!=='all')rows=rows.filter(e=>e.section===s);
  if(date==='today')rows=rows.filter(e=>dayKey(e.atMs)===dayKey(Date.now()));
  if(date==='week')rows=rows.filter(e=>e.atMs>=Date.now()-7*86400000);
  if(date==='month')rows=rows.filter(e=>e.atMs>=Date.now()-30*86400000);
  if(status!=='all')rows=rows.filter(e=>isUnread(e)===(status==='unread'));
  if(q)rows=rows.filter(e=>[e.actorName,e.studentId,e.section,e.title,e.preview,ACTIONS[e.action],e.emoji].some(s=>String(s||'').toLocaleLowerCase().includes(q)));
  const groups=groupRows(rows),sort=$('ncSort').value;
  if(sort==='newest')groups.sort((a,b)=>b.latest-a.latest);
  else if(sort==='oldest')groups.sort((a,b)=>a.latest-b.latest);
  else if(sort==='student')groups.sort((a,b)=>a.items[0].actorName.localeCompare(b.items[0].actorName));
  else if(sort==='section')groups.sort((a,b)=>a.items[0].section.localeCompare(b.items[0].section));
  return groups;
 }
 function textSentence(group){
  const distinct=new Map();for(const e of group.items)if(!distinct.has(e.actorUid))distinct.set(e.actorUid,e);
  const first=group.items[0],names=[...distinct.values()],who=names[0]?.actorName||first.actorName||'Student';
  const prefix=names.length>1?`${who} and ${names.length-1} other${names.length-1===1?'':'s'}`:who;
  const verb=ACTIONS[first.action]||'interacted with your content';
  return {prefix,verb,uniqueCount:names.length};
 }
 function navigateTo(g){
  const e=g.items[0];if(!e)return;
  const q=new URLSearchParams();let page='admin-v2.html';
  if(e.category==='messages'){
   page='messages.html';q.set('from','notifications');q.set('student',e.actorUid);
   q.set('message',e.targetId);
  }else if(e.category==='announcements'){
   page='announcements.html';q.set('from','notifications');q.set('gaPost',e.targetId);
   if(['post_comment','post_reply','comment_reaction'].includes(e.action)){
    q.set('gaEngagement','comment');q.set('gaComment',e.action==='post_reply'?e.contextId:e.action==='comment_reaction'?e.contextId:e.items[0].contextId);
   }
  }else{
   q.set('g8Notify',e.category);q.set('g8NotifyId',e.targetId);q.set('g8NotifyStudent',e.actorUid);q.set('from','notifications');
  }
  return `${page}?${q.toString()}`;
 }
 async function markRead(g){
  // Include unread events outside the most-recent page: a grouped read clears
  // the entire category+action+target group, not only the loaded rows.
  const allIds=new Set(g.items.map(e=>e.id));
  for(const [id,event] of Object.entries(unread))if(event&&groupKey(event)===g.key)allIds.add(id);
  const ids=[...allIds].filter(id=>unread[id]&&isValid(id));if(!ids.length)return;
  const patch={};for(const id of ids)patch[`${ROOT}/unread/${id}`]=null;
  try{await sdk.update(sdk.ref(db),patch);for(const id of ids)delete unread[id];updateBadges();render();}
  catch(error){$('ncGate').textContent='Could not mark the notification as read. Check your connection and retry.';$('ncGate').hidden=false;console.warn('[Notification Center] Mark read:',error);}
 }
 function detail(g){activeDetail=g;const e=g.items[0];$('ncDetailSubtitle').textContent=`${ACTIONS[e.action]||'Student event'} · ${e.title||'G8Code'}`;$('ncDetailItems').replaceChildren();
  for(const item of g.items){const row=n('div','nc-person');row.append(n('div','nc-person-icon',(item.actorName||'S').slice(0,1).toUpperCase()));const info=n('div','nc-person-main');info.append(n('strong','',item.actorName||'Student'),n('small','',[item.section,item.studentId].filter(Boolean).join(' · ')),n('small','',[item.emoji,item.preview].filter(Boolean).join(' ')),n('small','',stamp(item.atMs)));row.append(info);$('ncDetailItems').append(row);}
  $('ncDetailBackdrop').hidden=false;void markRead(g);
 }
 function render(){
  updateSections();updateBadges();
  const groups=filtered();$('ncResultCount').textContent=`${groups.length} notification group${groups.length===1?'':'s'}`;
  for(const b of document.querySelectorAll('[data-nc-quick]')){const active=b.dataset.ncQuick===$('ncStatus').value;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));}
  const host=$('ncFeed');host.replaceChildren();host.hidden=false;
  if(!groups.length){host.append(n('div','nc-empty',events.size?'No notifications match these filters.':'No recorded events yet. New student actions will appear here after deployment.'));return;}
  for(const g of groups){
   const e=g.items[0],copy=textSentence(g),unreadGroup=g.items.some(isUnread);
   const card=n('article',`nc-entry${unreadGroup?' unread':''}`),main=n('button','nc-entry-main');main.type='button';main.title='Open exact source item';main.setAttribute('aria-label',`${copy.prefix} ${copy.verb}. Open related item`);
   const avatar=n('span','nc-avatar');const words=String(e.actorName||'Student').trim().split(/\s+/);const initials=(words.length>1?words[0][0]+words[words.length-1][0]:words[0].slice(0,2)).toUpperCase();avatar.append(n('span','nc-avatar-initials',initials),n('span','nc-emoji',ICONS[e.action]||'♧'));main.append(avatar);
   const body=n('span','nc-entry-copy'),sentence=n('span','nc-entry-description');sentence.append(n('strong','',copy.prefix),document.createTextNode(' '+copy.verb));if(e.emoji)sentence.append(document.createTextNode(' '+e.emoji));sentence.append(document.createTextNode('.'));if(unreadGroup)sentence.append(n('span','nc-dot'));
   body.append(sentence,n('span','nc-entry-title',e.title||e.preview||''));
   const meta=n('span','nc-entry-meta');meta.append(n('span','nc-section-meta',e.section||'Section not recorded'),n('span','nc-time-full',stamp(g.latest)),n('span','nc-time-short',relative(g.latest)));if(g.items.length>1)meta.append(n('span','',`${g.items.length} events · ${copy.uniqueCount} students`));body.append(meta);main.append(body);
   main.addEventListener('click',async()=>{await markRead(g);window.location.href=navigateTo(g);});card.append(main);
   const actions=n('div','nc-entry-actions'),view=n('button','','Details');view.type='button';view.addEventListener('click',()=>detail(g));actions.append(view);
   if(unreadGroup){const clear=n('button','','✓ Read');clear.type='button';clear.addEventListener('click',()=>void markRead(g));actions.append(clear);}
   card.append(actions);host.append(card);
  }
 }
 async function more(){if(busy||!olderAvailable)return;const earliest=allEvents().at(-1);if(!earliest)return;busy=true;$('ncLoadMore').disabled=true;$('ncLoadMore').textContent='Loading…';
  try{const q=sdk.query(sdk.ref(db,`${ROOT}/events`),sdk.orderByChild('atMs'),sdk.endBefore(earliest.atMs,earliest.id),sdk.limitToLast(CHUNK));const snap=await sdk.get(q),rows=snap.val()||{};
   for(const [id,row] of Object.entries(rows))if(row&&row.actorUid)events.set(id,{id,...row});olderAvailable=Object.keys(rows).length===CHUNK;render();}
  catch(error){console.warn('[Notification Center] Older events:',error);$('ncGate').textContent='Older events could not load. Try again.';$('ncGate').hidden=false;}
  finally{busy=false;$('ncLoadMore').hidden=!olderAvailable;$('ncLoadMore').disabled=false;$('ncLoadMore').textContent='Load older events';}
 }
 async function markAll(){const ids=Object.keys(unread).filter(isValid);if(!ids.length)return;
  const btn=$('ncMarkAll');btn.disabled=true;try{for(let i=0;i<ids.length;i+=150){const patch={};for(const id of ids.slice(i,i+150))patch[`${ROOT}/unread/${id}`]=null;await sdk.update(sdk.ref(db),patch);}unread={};render();}
  catch(error){console.warn('[Notification Center] Mark all:',error);$('ncGate').textContent='Could not mark all read. Retry.';$('ncGate').hidden=false;}
  finally{btn.disabled=Object.keys(unread).length===0;}
 }
 $('ncCategories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;for(const child of $('ncCategories').querySelectorAll('button'))child.classList.toggle('selected',child===b);render();});
 for(const id of ['ncSection','ncStatus','ncDate','ncSort'])$(id).addEventListener('change',render);
 $('ncSearch').addEventListener('input',render);$('ncMarkAll').addEventListener('click',markAll);$('ncMobileMarkAll').addEventListener('click',markAll);$('ncLoadMore').addEventListener('click',more);
 document.querySelector('.nc-mobile-quick').addEventListener('click',e=>{const b=e.target.closest('[data-nc-quick]');if(!b)return;$('ncStatus').value=b.dataset.ncQuick;render();});
 function closeDetail(){$('ncDetailBackdrop').hidden=true;activeDetail=null;}
 $('ncDetailClose').addEventListener('click',closeDetail);$('ncDetailBackdrop').addEventListener('click',e=>{if(e.target===$('ncDetailBackdrop'))closeDetail();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDetail();});
 $('ncDetailGo').addEventListener('click',()=>{if(!activeDetail)return;window.location.href=navigateTo(activeDetail);});
 async function boot(){
  try{
   if(!window.MCS_FIREBASE_CONFIG||!window.MCS_FIREBASE_DATABASE_URL)throw Error('Firebase configuration is missing.');
   const ver=window.MCS_FIREBASE_SDK_VERSION||'10.12.5',base=`https://www.gstatic.com/firebasejs/${ver}`;
   const [a,b,d]=await Promise.all([import(`${base}/firebase-app.js`),import(`${base}/firebase-auth.js`),import(`${base}/firebase-database.js`)]);
   sdk=d;app=a.getApps().length?a.getApp():a.initializeApp(window.MCS_FIREBASE_CONFIG);auth=b.getAuth(app);db=d.getDatabase(app,window.MCS_FIREBASE_DATABASE_URL);
   b.onAuthStateChanged(auth,user=>{
    if(!user||!TEACHER.has(String(user.email||'').toLowerCase())){
     $('ncGate').textContent='Teacher sign-in required. Open Admin Overview and sign in with your authorized teacher account.';
     $('ncFeed').hidden=true;$('ncMarkAll').disabled=true;return;
    }
    $('ncGate').hidden=true;
    d.onValue(d.query(d.ref(db,`${ROOT}/events`),d.orderByChild('atMs'),d.limitToLast(CHUNK)),snap=>{
      const data=snap.val()||{};for(const [id,event] of Object.entries(data))if(event&&event.actorUid)events.set(id,{id,...event});
      if(firstLive){olderAvailable=Object.keys(data).length===CHUNK;firstLive=false;}
      $('ncLoadMore').hidden=!olderAvailable;render();
     },error=>{console.error('[Notification Center] Events:',error);$('ncGate').textContent='Unable to load activity events. Publish the supplied RTDB rules, then refresh.';$('ncGate').hidden=false;});
    d.onValue(d.ref(db,`${ROOT}/unread`),snap=>{unread=snap.val()||{};render();},error=>console.warn('[Notification Center] Unread index:',error));
   });
  }catch(error){console.error('[Notification Center] Startup:',error);$('ncGate').textContent='Notification Center is unavailable. Verify your connection and Firebase configuration.';}
 }
 boot();
})();
