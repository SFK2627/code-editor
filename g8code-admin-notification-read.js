/* G8Code Admin notification-read synchronization.
 * RTDB-only. Never mutates message, announcement, or historical event records.
 * This module removes only the authenticated teacher's matching unread-index entries.
 */
(()=>{'use strict';
  const ROOT='g8AdminActivityV1/unread';
  const safeId=value=>/^[A-Za-z0-9_-]{1,128}$/.test(String(value||''));
  function eligibleIds(rows,filter){
    const match=[];
    const uids=new Set((filter.actorUids||[]).filter(safeId));
    for(const [id,row] of Object.entries(rows||{})){
      if(!safeId(id)||!row||row.category!==filter.category)continue;
      if(filter.category==='messages' && uids.has(row.actorUid))match.push(id);
      else if(filter.category==='announcements'&&safeId(filter.postId)&&row.targetId===filter.postId)match.push(id);
    }
    return match;
  }
  async function clearKnown(sdk,db,rows,filter,stillAllowed=()=>true){
    const ids=eligibleIds(rows,filter);
    if(!ids.length||!stillAllowed())return 0;
    // Multi-path deletion: validation/permissions apply to each individual entry.
    // Reactions/comments/messages stay untouched; only unread pointers disappear.
    let removed=0;
    for(let start=0;start<ids.length;start+=100){
      if(!stillAllowed())break;
      const updates={};for(const id of ids.slice(start,start+100))updates[id]=null;
      await sdk.update(sdk.ref(db,ROOT),updates);
      removed+=Object.keys(updates).length;
    }
    return removed;
  }
  async function markAnnouncement(sdk,db,postId,stillAllowed=()=>true){
    if(!safeId(postId)||!stillAllowed())return 0;
    const snap=await sdk.get(sdk.ref(db,ROOT));
    return clearKnown(sdk,db,snap.val(),{category:'announcements',postId},stillAllowed);
  }
  function watchConversation(sdk,db,getActorUids,canRead){
    let latest=null,working=false,closed=false;
    async function flush(){
      if(closed||working||!canRead())return;
      working=true;
      try{
        while(!closed&&latest!==null&&canRead()){
          const rows=latest;latest=null;
          await clearKnown(sdk,db,rows,{category:'messages',actorUids:getActorUids()},()=>!closed&&canRead());
        }
      }catch(error){console.warn('[G8Code] Admin Messenger notification read-sync:',error?.code||error?.message||error);}
      finally{working=false;}
    }
    const stop=sdk.onValue(sdk.ref(db,ROOT),snap=>{latest=snap.val()||{};void flush();},error=>console.warn('[G8Code] Admin unread notification listener:',error?.code||error?.message||error));
    return {poke:()=>void flush(),dispose:()=>{closed=true;stop();}};
  }
  window.G8CodeAdminNotificationRead=Object.freeze({eligibleIds,markAnnouncement,watchConversation});
})();
