/* One-time route handoff from official Studio to the existing Student SPA. */
(()=>{'use strict';
 const KEY='g8code.officialStudio.return.v1';
 let pending;
 try{pending=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{}
 if(!pending||!['home','projects','activities','lessons','explorer','logout'].includes(pending.route))return;
 sessionStorage.removeItem(KEY);
 if(Date.now()-Number(pending.at||0)>3*60*1000)return;
 if(pending.route==='logout')return; // Firebase signout happens before leaving Studio.
 if(!pending.uid){
   try{sessionStorage.setItem('g8code.officialStudio.guestHomeOnce','1')}catch{}
   // Wait until app code is ready, and avoid re-routing to Studio.
   if(typeof continueAsGuest==='function'){
     continueAsGuest();
     if(pending.route==='home'&&typeof showGuestHome==='function')showGuestHome();
     else if(pending.route==='projects'&&typeof openStudentLogin==='function')openStudentLogin();
     else if(pending.route==='lessons'&&typeof openLessonLibrary==='function')openLessonLibrary('home');
     else if(pending.route==='activities'&&typeof openGivenActivitiesLibrary==='function')openGivenActivitiesLibrary('home');
     else if(pending.route==='explorer'&&typeof window.openCodeExplorer==='function')window.openCodeExplorer().catch?.(()=>{});
   }
   return;
 }
 let done=false;
 const tryRoute=()=>{
   if(done)return;
   const isStudent=document.body.classList.contains('student-session-active');
   if(!isStudent)return;
   if(typeof appSession==='undefined'||!appSession.student)return;
   if(String(appSession.student.uid||'')!==String(pending.uid))return;
   done=true;obs.disconnect();
   if(typeof handleStudentHomeAction==='function')handleStudentHomeAction(pending.route);
 };
 const obs=new MutationObserver(tryRoute);
 obs.observe(document.body,{attributes:true,attributeFilter:['class']});
 tryRoute();
 // If the main app shows its login screen first, route after login.
 // Stop watching if no matching session is recovered within three minutes.
 setTimeout(()=>obs.disconnect(),180000);
})();
