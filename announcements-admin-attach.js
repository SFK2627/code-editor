/* V1 direct Attach to Announcement integration in existing Admin V2 lesson/activity lists.
 * Reads currently rendered DOM only; no additional Firestore or RTDB request. */
(()=>{'use strict';
const KEY='g8announcementPendingAttach';
function install(){
 const sel='.lesson-admin-row[data-admin-lesson-id],.given-activity-admin-row[data-given-admin-id]';
 for(const row of document.querySelectorAll(sel)){
  if(row.querySelector('[data-announcement-attach]'))continue;
  const isLesson=row.matches('.lesson-admin-row');
  const type=isLesson?'lesson':'activity';
  const itemId=row.getAttribute(isLesson?'data-admin-lesson-id':'data-given-admin-id');
  const title=(row.querySelector(isLesson?'.lesson-admin-row-title strong':'.given-activity-admin-title-line strong')?.textContent||'').trim();
  const actions=row.querySelector(isLesson?'.lesson-admin-row-actions':'.given-activity-admin-actions');
  if(!actions||!itemId)return;
  const b=document.createElement('button');b.type='button';b.className='ghost-btn mini g8-announcement-attach-btn';b.setAttribute('data-announcement-attach',type);b.title='Create an announcement with this resource attached';b.textContent='📣 Announce';
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();try{sessionStorage.setItem(KEY,JSON.stringify({type,itemId,name:title||type,atMs:Date.now()}));}catch{}location.assign('announcements.html?from=admin&add=1');});
  actions.append(b);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();new MutationObserver(()=>install()).observe(document.body,{childList:true,subtree:true});},{once:true});
else{install();new MutationObserver(()=>install()).observe(document.body,{childList:true,subtree:true});}
})();
