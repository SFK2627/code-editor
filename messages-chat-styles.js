/* G8Code Student Messenger V5.0: presentation-only Chat Style selector.
   Does not subscribe to Firebase, mutate message rows, or change send handlers. */
(()=>{
 'use strict';
 const root=document.getElementById('g8mApp');
 const feed=document.getElementById('g8mMessages');
 const toggle=document.getElementById('g8mChatStyleToggle');
 const mask=document.getElementById('g8mChatStyleMask');
 const sheet=document.getElementById('g8mChatStyleSheet');
 const dismiss=document.getElementById('g8mChatStyleClose');
 if(!root||!feed||!toggle||!mask||!sheet||!dismiss)return;
 const options=[...sheet.querySelectorAll('button[data-style]')];
 const styles=new Set(['default','messenger','instagram','tiktok','discord']);
 let owner='';
 let opened=false;
 let historyArmed=false;
 let closingBack=false;
 const storePrefix='g8code:student-chat-style:v1:';
 const safeRead=key=>{try{return localStorage.getItem(key)}catch{return null}};
 const safeWrite=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 const isStudent=()=>root.dataset.mode==='student'&&!!root.dataset.chatStyleOwner;
 function updateChecks(style){
  for(const option of options){
   const active=option.dataset.style===style;
   option.setAttribute('aria-checked',String(active));
  }
  toggle.setAttribute('aria-label','Chat style: '+(style==='default'?'Default':style)+'. Choose chat layout');
  toggle.title='Chat Style · '+style.charAt(0).toUpperCase()+style.slice(1);
 }
 // Layout-only change: preserve the actual textarea, reply state, image nodes,
 // and scroll anchor rather than rerendering the RTDB conversation.
 function apply(style,persist){
  if(!styles.has(style))style='default';
  const atBottom=feed.scrollHeight-feed.scrollTop-feed.clientHeight<=65;
  const viewport=feed.getBoundingClientRect();
  const anchor=[...feed.querySelectorAll('.g8m-message[data-chat-key]')]
   .find(row=>{const r=row.getBoundingClientRect();return r.bottom>=viewport.top+2&&r.top<=viewport.bottom-2});
  const key=anchor?.dataset.chatKey;
  const anchorOffset=anchor?anchor.getBoundingClientRect().top-viewport.top:0;
  const previousTop=feed.scrollTop;
  root.dataset.chatStyle=style;
  updateChecks(style);
  if(persist&&owner)safeWrite(storePrefix+owner,style);
  requestAnimationFrame(()=>{
   if(atBottom){feed.scrollTop=feed.scrollHeight-feed.clientHeight;return}
   const row=[...feed.querySelectorAll('.g8m-message[data-chat-key]')].find(x=>x.dataset.chatKey===key);
   if(row){feed.scrollTop+=row.getBoundingClientRect().top-feed.getBoundingClientRect().top-anchorOffset}
   else feed.scrollTop=Math.min(previousTop,Math.max(0,feed.scrollHeight-feed.clientHeight));
  });
 }
 function hardClose(){
  opened=false;
  sheet.hidden=true;mask.hidden=true;
  toggle.setAttribute('aria-expanded','false');
 }
 function close(viaPopstate=false){
  if(!opened&&!historyArmed)return;
  hardClose();
  if(viaPopstate){historyArmed=false;closingBack=false;return}
  if(historyArmed&&!closingBack){
   closingBack=true;
   try{history.back()}catch{historyArmed=false;closingBack=false}
  }
 }
 function open(){
  if(opened||closingBack||!isStudent())return;
  sheet.dataset.theme=root.dataset.theme||'light';
  opened=true;sheet.hidden=false;mask.hidden=false;
  toggle.setAttribute('aria-expanded','true');
  dismiss.focus({preventScroll:true});
  try{history.pushState({g8mChatStyleMenu:true},'',location.href);historyArmed=true}
  catch{historyArmed=false}
 }
 function sync(){
  const uid=isStudent()?root.dataset.chatStyleOwner:'';
  if(!uid){
   if(opened){hardClose()}
   owner='';root.dataset.chatStyle='default';updateChecks('default');
   return;
  }
  if(uid===owner)return;
  owner=uid;
  const saved=safeRead(storePrefix+owner);
  apply(styles.has(saved)?saved:'default',false);
 }
 toggle.addEventListener('click',()=>opened?close():open());
 dismiss.addEventListener('click',()=>{close();toggle.focus({preventScroll:true})});
 mask.addEventListener('click',()=>close());
 sheet.addEventListener('click',e=>{
  const option=e.target.closest('button[data-style]');
  if(!option||!isStudent())return;
  apply(option.dataset.style,true);close();
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&opened){e.preventDefault();e.stopPropagation();close()}
 });
 // Called from the existing message-page browser Back handler before it exits.
 // Its history guard must remain single-owner: no additional popstate listeners.
 window.G8MChatStyles={
  handlePopState(){
   if(opened||historyArmed||closingBack){close(true);return true}
   return false;
  },
  sync
 };
 const observer=new MutationObserver(sync);
 observer.observe(root,{attributes:true,attributeFilter:['data-mode','data-chat-style-owner']});
 sync();
})();
