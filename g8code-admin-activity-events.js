/* G8Code Admin Notification Center — append-only student event bridge.
   RTDB only. Never store whole private messages, screenshots, code, or photos. */
(function(){'use strict';
 const ROOT='g8AdminActivityV1/events', UNREAD='g8AdminActivityV1/unread';
 const CATEGORIES=new Set(['messages','announcements','lessons','activities','projects']);
 const ACTIONS=new Set(['message','message_reply','message_reaction','photo','project_share','post_reaction','post_comment','post_reply','comment_reaction','post_view','lesson_view','lesson_complete','activity_view','activity_read','activity_complete','project_create']);
 const limit=(v,n)=>String(v??'').trim().slice(0,n);
 const safeKey=v=>limit(v,160).replace(/[^a-zA-Z0-9_-]/g,'_');
 function make(details={}){
  const uid=limit(details.actorUid,128),category=limit(details.category,30),action=limit(details.action,40),targetId=limit(details.targetId,128);
  if(!/^[a-zA-Z0-9_-]{5,128}$/.test(uid)||!CATEGORIES.has(category)||!ACTIONS.has(action)||!targetId)return null;
  const atMs=Date.now();
  const event={actorUid:uid,actorName:limit(details.actorName||'Student',100),section:limit(details.section||'Unassigned',100),studentId:limit(details.studentId,65),category,action,targetId,contextId:limit(details.contextId,128),title:limit(details.title,160),preview:limit(details.preview,200),emoji:limit(details.emoji,16),atMs};
  const fixed=details.sourceId?safeKey([category,uid,details.sourceId].join('_')):'';
  return {event,key:fixed};
 }
 async function emitSDK(details,{db,ref,push,set}={}){
  const row=make(details);if(!row||!db||!ref||!push||!set)return false;
  const key=row.key||push(ref(db,ROOT)).key;
  try{await set(ref(db,`${ROOT}/${key}`),row.event);await set(ref(db,`${UNREAD}/${key}`),{actorUid:row.event.actorUid,category:row.event.category,action:row.event.action,targetId:row.event.targetId,contextId:row.event.contextId,section:row.event.section,atMs:row.event.atMs});return true;}
  catch(error){console.warn('[G8Code activity] Event not recorded:',error?.code||error?.message);return false;}
 }
 async function emitRest(details,write){
  const row=make(details);if(!row||typeof write!=='function')return false;
  const key=row.key||(safeKey(`evt_${row.event.actorUid}_${row.event.atMs}_${Math.random().toString(36).slice(2,12)}`));
  try{await write(`${ROOT}/${key}`,row.event);await write(`${UNREAD}/${key}`,{actorUid:row.event.actorUid,category:row.event.category,action:row.event.action,targetId:row.event.targetId,contextId:row.event.contextId,section:row.event.section,atMs:row.event.atMs});return true;}
  catch(error){console.warn('[G8Code activity] Event not recorded:',error?.message);return false;}
 }
 // Opening the same lesson repeatedly in one short session must not flood the inbox.
 function shouldLogView(category,uid,targetId,minutes=30){
  const key=`g8Activity.once.${safeKey(category)}.${safeKey(uid)}.${safeKey(targetId)}`;
  try{const last=Number(sessionStorage.getItem(key)||0);if(Date.now()-last<minutes*60000)return false;sessionStorage.setItem(key,String(Date.now()));}catch(_){}
  return true;
 }
 window.G8CodeAdminActivity=Object.freeze({make,emitSDK,emitRest,shouldLogView});
})();
