/* Studio V2.15 — direct WebRTC / CRDT live collaboration.
 * Firestore is used only for discovery, SDP/ICE signaling, access, and close events;
 * NOT for typing, remote cursor changes or periodic heartbeat writes.
 * Compatible signaling and message envelopes with OG G8Code Step 282.
 */
window.createStudioLiveCollab = function createStudioLiveCollab(adapter) {
  'use strict';
  const ROOT='__ROOT__';
  const ICE=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}];
  let room=null;
  const id0=(scope,i)=>`0000000000:init:${btoa(unescape(encodeURIComponent(scope))).replace(/[^A-Za-z0-9]/g,'').slice(0,18)}:${String(i).padStart(8,'0')}`;
  function docEmpty(scope){return {scopeKey:scope,nodes:Object.create(null),children:{[ROOT]:[]}}}
  function child(doc,parent,id){const key=parent||ROOT;const a=doc.children[key]||(doc.children[key]=[]);if(!a.includes(id)){a.push(id);a.sort((a,b)=>String(b).localeCompare(String(a)))}}
  function fromText(scope,text){const d=docEmpty(scope);let after=ROOT;for(let i=0;i<String(text).length;i++){const id=id0(scope,i);d.nodes[id]={id,afterId:after,ch:text[i],deleted:false};child(d,after,id);after=id;}return d}
  function fromSnapshot(raw){if(!raw?.scopeKey||!Array.isArray(raw.nodes))return null;const d=docEmpty(raw.scopeKey);for(const row of raw.nodes){if(!Array.isArray(row)||!row[0])continue;const [id,afterId,ch,del]=row;d.nodes[id]={id,afterId:afterId||ROOT,ch:String(ch??''),deleted:!!del}}
    for(const node of Object.values(d.nodes))child(d,node.afterId,node.id);return d}
  function snapshot(doc){return {scopeKey:doc.scopeKey,nodes:Object.values(doc.nodes).map(n=>[n.id,n.afterId,n.ch,n.deleted?1:0])}}
  function visibleIds(doc){const out=[],pending=[...(doc.children[ROOT]||[])].reverse();let guard=0;while(pending.length&&guard++<350000){const id=pending.pop(),node=doc.nodes[id];if(!node)continue;if(!node.deleted)out.push(id);const next=doc.children[id]||[];for(let i=next.length-1;i>=0;i--)pending.push(next[i]);}return out}
  function value(doc){return visibleIds(doc).map(id=>doc.nodes[id].ch).join('')}
  function apply(doc,ops){if(!doc)return;for(const op of ops||[]){if(op.type==='insert')for(const row of op.nodes||[]){if(!row?.id)continue;if(!doc.nodes[row.id]){doc.nodes[row.id]={id:row.id,afterId:row.afterId||ROOT,ch:String(row.ch??''),deleted:false};child(doc,row.afterId,row.id)}}else if(op.type==='delete')for(const id of op.ids||[])if(doc.nodes[id])doc.nodes[id].deleted=true}}
  function textDiff(a,b){let s=0;while(s<Math.min(a.length,b.length)&&a.charCodeAt(s)===b.charCodeAt(s))s++;let e=0;while(e<a.length-s&&e<b.length-s&&a.charCodeAt(a.length-1-e)===b.charCodeAt(b.length-1-e))e++;return {start:s,deleteCount:a.length-s-e,insertText:b.slice(s,b.length-e)}}
  function applyLocal(doc,oldText,newText){const before=value(doc);const diff=textDiff(before,newText);if(before===newText)return [];const ids=visibleIds(doc),ops=[];const deleted=ids.slice(diff.start,diff.start+diff.deleteCount);if(deleted.length)ops.push({type:'delete',ids:deleted});let parent=diff.start?ids[diff.start-1]:ROOT;const nodes=[];for(const ch of diff.insertText){const id=`${Date.now().toString(36).padStart(10,'0')}:${String(adapter.uid()).replace(/[^A-Za-z0-9_-]/g,'')}:${String(++room.seq).padStart(8,'0')}`;nodes.push({id,afterId:parent,ch});parent=id}if(nodes.length)ops.push({type:'insert',nodes});apply(doc,ops);return ops}
  function scope(lang,name){return `${room?.activityId||'scratch'}::${lang}::${name}`}
  function ensure(lang,name,text){const k=scope(lang,name);if(!room.docs[k])room.docs[k]=fromText(k,text||'');return room.docs[k]}
  function initDocs(){room.docs={};for(const [lang,key] of [['html','pages'],['css','cssFiles'],['js','jsFiles']])for(const [name,text] of Object.entries(adapter.code()[key]||{}))ensure(lang,name,text)}
  function exportDocs(){const out={};for(const [key,doc] of Object.entries(room.docs))out[key]=snapshot(doc);return out}
  function initFromSnapshots(raw){room.docs={};for(const [scope,doc] of Object.entries(raw||{})){const data=fromSnapshot(doc);if(data)room.docs[scope]=data}for(const [lang,key] of [['html','pages'],['css','cssFiles'],['js','jsFiles']])for(const [name,text] of Object.entries(adapter.code()[key]||{}))ensure(lang,name,text)}
  function canEdit(){return !!room&&(room.isHost||(!room.viewOnly&&room.ready&&adapter.adminMayEdit()))}
  function updatePermissions(){adapter.permissions(canEdit(),!!room,room?.access||'edit',!!room?.ready)}
  function member(uid,role){return {uid,name:adapter.name(),role,color:adapter.color(uid),studentId:adapter.studentId(),online:true,lastSeenAt:Date.now()}}
  function packet(type,fields={}){return {type,room:room.code,senderUid:adapter.uid(),senderName:adapter.name(),sentAt:Date.now(),...fields}}
  function send(uid,message){const ch=room?.channels.get(uid);if(!ch||ch.readyState!=='open')return false;const raw=JSON.stringify(message),step=31000;if(raw.length<=step){ch.send(raw);return true}const id=`${adapter.uid()}-${Date.now()}-${Math.random().toString(36).slice(2)}`,total=Math.ceil(raw.length/step);for(let i=0;i<total;i++)ch.send(JSON.stringify({__mcsCollabChunk:true,id,index:i,total,data:raw.slice(i*step,(i+1)*step)}));return true}
  function broadcast(msg,except=''){for(const uid of room?.channels.keys()||[])if(uid!==except)send(uid,msg)}
  function decode(raw,uid){let msg;try{msg=JSON.parse(raw)}catch{return null}if(!msg.__mcsCollabChunk)return msg;const key=uid+':'+msg.id,entry=room.chunks.get(key)||{parts:Array(Number(msg.total)).fill(null),time:Date.now()};if(msg.index<0||msg.index>=entry.parts.length)return null;entry.parts[msg.index]=msg.data;room.chunks.set(key,entry);if(entry.parts.some(x=>typeof x!=='string'))return null;room.chunks.delete(key);try{return JSON.parse(entry.parts.join(''))}catch{return null}}
  function syncMembers(){adapter.members(room?.members||{},room?.channels||new Map(),room?.access||'edit',!!room?.ready)}
  function deliverInitial(uid){send(uid,packet('state',{data:{
    shareCode:room.code,active:true,hostUid:room.hostUid,hostName:room.session.hostName||adapter.name(),
    projectName:room.session.projectName||adapter.title(),access:room.access,allowEdit:room.access==='edit'&&adapter.adminMayEdit(),
    selectedActivityId:room.activityId,codeByActivity:{[room.activityId||'scratch']:adapter.code()},
    crdtSnapshots:exportDocs(),members:room.members,cursors:{}
  }}))}
  function updateRemoteFile(data){const lang=data.language||data.lang,filename=data.fileName;if(!['html','css','js'].includes(lang)||!filename)return;const doc=ensure(lang,filename,adapter.getFile(lang,filename));apply(doc,data.ops||[]);adapter.remoteFile(lang,filename,value(doc),data.lastEditorName||'Classmate',doc)}
  function handle(uid,msg){if(!room||msg?.room!==room.code)return;
    // Removed peers must not contribute code, cursor events, or re-enable
    // themselves during the brief WebRTC channel-close window.
    if(room.isHost&&room.members[uid]?.kicked){
      if(msg.type!=='hello'||room.channels.get(uid)?.readyState!=='open')return;
      // A truly fresh join will be accepted only once the peer doc has been
      // re-offered and the host created a new connection for that UID.
      if(!room.rejoining?.has(uid))return;
    }
    if(msg.type==='hello'&&room.isHost){room.rejoining?.delete(uid);room.members[uid]={...member(uid,'member'),...(msg.member||{}),uid,online:true};syncMembers();deliverInitial(uid);broadcast(packet('members',{members:room.members}));return}
    if(msg.type==='request-state'&&room.isHost){deliverInitial(uid);return}
    if(msg.type==='state'&&!room.isHost&&msg.data){room.session={...room.session,...msg.data};room.hostUid=msg.data.hostUid||room.hostUid;room.activityId=msg.data.selectedActivityId||room.activityId||'';room.access=msg.data.allowEdit===false?'view':(msg.data.access||'edit');room.viewOnly=room.access==='view';if(!room.ready){adapter.initialState(msg.data);initFromSnapshots(msg.data.crdtSnapshots);room.ready=true}else if(msg.data.crdtSnapshots){for(const [k,raw] of Object.entries(msg.data.crdtSnapshots)){const incoming=fromSnapshot(raw);if(!incoming)continue;const local=room.docs[k];if(!local){room.docs[k]=incoming;continue}for(const node of Object.values(incoming.nodes)){if(!local.nodes[node.id]){local.nodes[node.id]={...node};child(local,node.afterId,node.id)}else if(node.deleted)local.nodes[node.id].deleted=true}}}for(const [k,d] of Object.entries(room.docs)){const parts=k.split('::');adapter.remoteFile(parts[1],parts.slice(2).join('::'),value(d),'Host',d)}
      room.members={...(msg.data.members||{}),[adapter.uid()]:member(adapter.uid(),'member')};updatePermissions();syncMembers();adapter.notice(room.viewOnly?'Connected · View only':'Live typing connected');return}
    if(msg.type==='members'){
      if(!room.isHost&&uid===room.hostUid){
        room.members={...(msg.members||{}),[adapter.uid()]:member(adapter.uid(),'member')};
        syncMembers();
      }
      return;
    }
    if(msg.type==='content'&&msg.data){if(room.isHost&&room.access!=='edit')return;const data=msg.data;
      if(data.patchMode==='crdtOps'){
        const origin=data.lastEditorUid||msg.senderUid||uid;if(origin!==adapter.uid())updateRemoteFile(data);
        if(room.isHost){const forwarded={...data,lastEditorUid:origin,contentVersion:Date.now()*100};broadcast(packet('content',{data:forwarded}));if(msg.batchId)send(uid,packet('ack',{batchId:msg.batchId}))}return;
      }
      // OG structural snapshots. Not used for normal keystrokes.
      if(data.crdtSnapshots){if(!room.isHost){for(const [k,raw] of Object.entries(data.crdtSnapshots)){const parsed=fromSnapshot(raw);if(parsed)room.docs[k]=parsed}}}
      if(data.codeByActivity){adapter.structuralState(data);initDocs();if(room.isHost)broadcast(packet('content',{data:{...data,crdtSnapshots:exportDocs()}}))}
      return}
    if(msg.type==='cursor'&&msg.cursor){const c=msg.cursor,who=c.uid||uid;room.members[who]={...(room.members[who]||member(who,'member')),cursor:{...c,lang:c.lang||c.language,fileName:c.fileName,updatedAtMs:Date.now(),signature:c.signature}};adapter.cursor(who,c);if(room.isHost)broadcast(msg,uid);syncMembers();return}
    if(msg.type==='ping'){room.members[uid]={...(room.members[uid]||{}),...(msg.member||{}),uid,online:true};if(room.isHost)broadcast(packet('members',{members:room.members}));else send(uid,packet('pong',{member:member(adapter.uid(),'member')}));syncMembers();return}
    if(msg.type==='leave'){room.members[uid]={...(room.members[uid]||{}),online:false};closePeer(uid);syncMembers();if(room.isHost)broadcast(packet('members',{members:room.members}));return}
    if(msg.type==='stop'||msg.type==='kick'){
      // Only the known host can end a joiner's session, never another participant.
      if(!room.isHost&&uid===room.hostUid&&msg.senderUid===room.hostUid&&(msg.type==='stop'||msg.targetUid===adapter.uid())){
        adapter.stopped(msg.type==='stop'?'The host ended this session.':'You were removed by the host. You can rejoin with the share code later.');
      }
      return;
    }
    if(msg.type==='access'&&!room.isHost){room.access=msg.access==='view'?'view':'edit';room.viewOnly=room.access==='view';updatePermissions();syncMembers()}
  }
  function channel(uid,ch){room.channels.set(uid,ch);ch.onopen=()=>{if(!(room.isHost&&room.members[uid]?.kicked))room.members[uid]={...(room.members[uid]||{}),uid,online:true};syncMembers();if(!room.isHost)send(uid,packet('hello',{member:member(adapter.uid(),'member')}));else broadcast(packet('members',{members:room.members}));adapter.notice('Direct live connection established')};ch.onmessage=e=>{const m=decode(e.data,uid);if(m)handle(uid,m)};ch.onclose=()=>{room.channels.delete(uid);room.members[uid]={...(room.members[uid]||{}),online:false};if(!room.isHost){room.ready=false;updatePermissions();adapter.notice('Live connection lost · reconnect to continue editing');scheduleReconnect()}syncMembers()};ch.onerror=e=>console.warn('WebRTC data channel',e)}
  function closePeer(uid){const ch=room.channels.get(uid),pc=room.pcs.get(uid);if(ch)ch.onclose=null;try{ch?.close()}catch{}try{pc?.close()}catch{}room.channels.delete(uid);room.pcs.delete(uid)}
  function peer(uid,isHost){closePeer(uid);const pc=new RTCPeerConnection({iceServers:ICE});room.pcs.set(uid,pc);pc.candidates=[];pc.onicecandidate=e=>{if(e.candidate)pc.candidates.push(e.candidate.toJSON?.()||e.candidate)};if(isHost)pc.ondatachannel=e=>channel(uid,e.channel);pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'&&!room.isHost)scheduleReconnect()};return pc}
  function iceDone(pc){if(pc.iceGatheringState==='complete')return Promise.resolve();return new Promise(ok=>{let finished=false;const fin=()=>{if(finished)return;finished=true;pc.removeEventListener('icegatheringstatechange',check);ok()},check=()=>{if(pc.iceGatheringState==='complete')fin()};pc.addEventListener('icegatheringstatechange',check);setTimeout(fin,4500)})}
  async function receiveOffer(snap){if(!room?.isHost)return;const d=snap.data()||{},uid=d.uid||snap.id;if(d.state==='kicked'||d.state==='left'||uid===adapter.uid()||!d.offer?.sdp)return;const nonce=d.offerNonce||d.offer.sdp;if(room.nonces.get(uid)===nonce)return;room.nonces.set(uid,nonce);if(room.members[uid]?.kicked)room.rejoining.add(uid);try{const pc=peer(uid,true);await pc.setRemoteDescription(d.offer);for(const candidate of d.memberCandidates||[])try{await pc.addIceCandidate(candidate)}catch{}const ans=await pc.createAnswer();await pc.setLocalDescription(ans);await iceDone(pc);await snap.ref.set({uid,hostUid:adapter.uid(),answer:{type:pc.localDescription.type,sdp:pc.localDescription.sdp},hostCandidates:pc.candidates,answerNonce:`${Date.now()}-${Math.random().toString(36).slice(2)}`,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});room.members[uid]={...(room.members[uid]||member(uid,'member')),name:d.name||'Classmate',online:true};syncMembers()}catch(e){room.nonces.delete(uid);console.warn('WebRTC host offer',e);adapter.notice('Could not connect to a classmate; retry Join')}}
  async function createOffer(){if(!room||room.isHost)return;const uid=room.hostUid;try{room.ready=false;updatePermissions();const pc=peer(uid,false),ch=pc.createDataChannel('mcs-live-collab',{ordered:true});channel(uid,ch);const offer=await pc.createOffer();await pc.setLocalDescription(offer);await iceDone(pc);if(!room)return;const ref=adapter.doc(room.code).collection('peers').doc(adapter.uid());await ref.set({uid:adapter.uid(),hostUid:uid,name:adapter.name(),studentId:adapter.studentId(),offer:{type:pc.localDescription.type,sdp:pc.localDescription.sdp},memberCandidates:pc.candidates,offerNonce:`${Date.now()}-${Math.random().toString(36).slice(2)}`,state:'offered',createdAtMs:Date.now(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:false});
      room.unsubs.push(ref.onSnapshot(async snap=>{
        if(!room||room.isHost||room.hostUid!==uid)return;
        if(!snap.exists)return;
        const data=snap.data()||{};
        if(data.state==='kicked'&&data.kickedByUid===room.hostUid){
          adapter.stopped('You were removed by the host. You can rejoin with the same code later.');
          return;
        }
        if(!data.answer?.sdp||pc.remoteDescription)return;
        try{await pc.setRemoteDescription(data.answer);for(const ice of data.hostCandidates||[])try{await pc.addIceCandidate(ice)}catch{}}catch(err){console.warn(err)}}));adapter.notice('Connecting directly to the host…')
    }catch(err){console.warn('Could not start direct connection',err);adapter.notice('Direct connection unavailable · check WebRTC access');scheduleReconnect()}}
  function scheduleReconnect(){if(!room||room.isHost||room.reconnectTimer)return;room.reconnectTimer=setTimeout(()=>{if(!room)return;room.reconnectTimer=null;createOffer()},Math.min(12000,1500*(++room.attempts)))}
  function hostSignals(){room.unsubs.push(adapter.doc(room.code).collection('peers').onSnapshot(snap=>{for(const d of snap.docs)receiveOffer(d)},err=>{console.warn(err);adapter.notice('Peer signaling unavailable')}))}
  function roomControl(){room.unsubs.push(adapter.doc(room.code).onSnapshot(snap=>{if(!room)return;const d=snap.data();if(!snap.exists||d.active===false||d.status==='closed'){adapter.stopped('Host stopped sharing');return}room.session={...room.session,...d};if(!room.isHost){const next=d.allowEdit===false?'view':(d.access==='view'?'view':'edit');if(next!==room.access){room.access=next;room.viewOnly=next==='view';updatePermissions();syncMembers()}}},err=>{console.warn(err);adapter.notice('Session control temporarily unavailable')}))}
  async function start(code,isHost,session){stop();room={code,isHost,hostUid:session.hostUid||adapter.uid(),access:session.allowEdit===false?'view':(session.access==='view'?'view':'edit'),viewOnly:!isHost,ready:!!isHost,session,activityId:session.selectedActivityId||'',docs:{},pcs:new Map(),channels:new Map(),chunks:new Map(),nonces:new Map(),members:{...(session.members||{}),[adapter.uid()]:member(adapter.uid(),isHost?'host':'member')},rejoining:new Set(),unsubs:[],reconnectTimer:null,attempts:0,seq:0};if(isHost)initDocs();roomControl();if(isHost)hostSignals();else await createOffer();updatePermissions();syncMembers();adapter.notice(isHost?'Live room ready · waiting for classmates':'Connecting directly to host…')}
  async function stop(){if(!room)return;const old=room;room=null;clearTimeout(old.reconnectTimer);for(const f of old.unsubs)try{f()}catch{}for(const uid of [...old.pcs.keys()]){try{old.channels.get(uid)?.close()}catch{}try{old.pcs.get(uid)?.close()}catch{}}adapter.permissions(true,false,'edit',false)}
  function localEdit(lang,filename,oldText,newText){if(!room)return;if(!canEdit())return;const doc=ensure(lang,filename,oldText),ops=applyLocal(doc,oldText,newText);if(!ops.length)return;const data={patchMode:'crdtOps',selectedActivityId:room.activityId,language:lang,fileName:filename,scopeKey:scope(lang,filename),ops,lastEditorUid:adapter.uid(),lastEditorName:adapter.name(),lastEditorLanguage:lang,lastEditorFile:filename};const msg=packet('content',{batchId:`${adapter.uid()}:${Date.now()}:${room.seq}`,data});if(room.isHost)broadcast(msg);else send(room.hostUid,msg)}
  function localCursor(){if(!room||!room.ready)return;const c=adapter.cursorData(),doc=ensure(c.lang,c.fileName,adapter.getFile(c.lang,c.fileName)),ids=visibleIds(doc);const index=Math.max(0,Math.min(ids.length,c.position||0));const anchor={beforeId:index?ids[index-1]:'',afterId:index<ids.length?ids[index]:'',fallback:index};const cursor={...c,language:c.lang,scopeKey:scope(c.lang,c.fileName),startAnchor:anchor,endAnchor:anchor,uid:adapter.uid(),name:adapter.name(),color:adapter.color(adapter.uid()),updatedAt:Date.now()};const msg=packet('cursor',{cursor});if(room.isHost)broadcast(msg);else send(room.hostUid,msg)}
  async function access(next){if(!room?.isHost)return;const mode=next==='view'?'view':'edit';const old=room.access;room.access=mode;room.viewOnly=false;try{await adapter.doc(room.code).set({access:mode,allowEdit:mode==='edit'&&adapter.adminMayEdit(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(err){room.access=old;syncMembers();throw err}broadcast(packet('access',{access:mode,allowEdit:mode==='edit'&&adapter.adminMayEdit()}));syncMembers()}
  async function structure(){if(!room||!canEdit())return;initDocs();const payload={patchMode:'snapshot',...{codeByActivity:{[room.activityId||'scratch']:adapter.code()},selectedActivityId:room.activityId,crdtSnapshots:exportDocs()}};const msg=packet('content',{data:payload});if(room.isHost)broadcast(msg);else send(room.hostUid,msg)}
  function terminate(){if(!room)return;broadcast(packet('stop'))}
  async function kick(uid){
    const active=room;
    if(!active?.isHost||!uid||uid===adapter.uid()||uid===active.hostUid)throw Error('Only the host can remove a joined member.');
    const memberRow=active.members[uid];
    if(!memberRow||memberRow.online===false)throw Error('That member is no longer connected.');
    // A reliable, targeted, host-authorized signal on the existing peer document.
    // This is one Firestore control write PER KICK, never per keystroke.
    // Keeping the kicked state until a manual rejoin avoids losing the event when
    // WebRTC closes before its last packet is delivered.
    await adapter.doc(active.code).collection('peers').doc(uid).set({
      uid,hostUid:adapter.uid(),state:'kicked',kickedByUid:adapter.uid(),
      kickedAtMs:Date.now(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
    if(room!==active)return;
    send(uid,packet('kick',{targetUid:uid}));
    active.members[uid]={...memberRow,online:false,kicked:true,cursor:null};
    active.nonces.delete(uid);
    // Let the browser queue the final P2P notification before closing.
    const kickedPeer=active.pcs.get(uid);
    setTimeout(()=>{if(room===active&&active.pcs.get(uid)===kickedPeer)closePeer(uid)},150);
    syncMembers();
    broadcast(packet('members',{members:active.members}),uid);
  }
  return {start,stop,localEdit,localCursor,access,structure,terminate,kick,canEdit,connected:()=>!!room?.ready,session:()=>room,exportDocs, // only for debug/tests
   _test:{fromText,apply,visibleIds,value,snapshot,fromSnapshot,applyLocal}}
};
