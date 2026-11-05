/* G8Code Announcements Photo Cache V1: private account-scoped, cache-first
 * thumbnails + full Drive images. No new server, paid storage, or public URLs.
 * IndexedDB is best-effort: private browsing/quota failures use RAM only. */
(()=>{'use strict';
const DB_NAME='g8code-announcements-private-images-v1', STORE='images';
const MAX_ENTRIES=140, MAX_BYTES=96*1024*1024, MAX_FILE_BYTES=5*1024*1024;
const TTL=30*24*60*60*1000, MAX_MEMORY_URLS=48;
const IMAGE_TYPES=new Set(['image/jpeg','image/png','image/webp']);
class AnnouncementPhotoCache{
 constructor(){this.owner='';this.epoch=0;this.dbPromise=null;this.urls=new Map();this.pending=new Map();this.thumbTasks=new Set();this.thumbQueue=[];this.thumbBusy=false;this.writes=0;this.reconcileTimer=null;}
 identity(p,f,kind='full',owner=this.owner){
  const version=String(f?.version||f?.fileVersion||f?.modifiedAtMs||'');
  return JSON.stringify([owner,String(p?.id||''),String(f?.driveFileId||''),version,kind]);
 }
 valid(owner,epoch){return !!owner&&this.owner===owner&&this.epoch===epoch;}
 setOwner(uid){
  const next=String(uid||'');if(this.owner===next)return;
  const previous=this.owner;this.owner=next;this.epoch++;
  this.clearMemory();this.thumbQueue.length=0;this.thumbTasks.clear();clearTimeout(this.reconcileTimer);this.reconcileTimer=null;
  if(previous&&previous!==next)void this.purgeOwner(previous);
  if(next)void this.prune(next,this.epoch);
 }
 clearMemory(){for(const url of this.urls.values())URL.revokeObjectURL(url);this.urls.clear();this.pending.clear();}
 memory(key){const url=this.urls.get(key);if(!url)return '';this.urls.delete(key);this.urls.set(key,url);return url;}
 remember(key,blob){
  const existing=this.memory(key);if(existing)return existing;
  const url=URL.createObjectURL(blob);this.urls.set(key,url);this.trimMemory();return url;
 }
 trimMemory(){
  if(this.urls.size<=MAX_MEMORY_URLS)return;
  // Never revoke a URL that is displayed, including the open viewer.
  const showing=new Set([...document.querySelectorAll('img[src^="blob:"],iframe[src^="blob:"]')].map(el=>el.src));
  for(const [key,url] of this.urls){
   if(this.urls.size<=MAX_MEMORY_URLS)break;
   if(showing.has(url))continue;
   this.urls.delete(key);URL.revokeObjectURL(url);
  }
 }
 async open(){
  if(this.dbPromise)return this.dbPromise;
  if(!('indexedDB' in window)||!/^https?:$/.test(location.protocol))return null;
  this.dbPromise=new Promise(resolve=>{
   let done=false;const finish=db=>{if(done){db?.close();return;}done=true;resolve(db);};
   try{const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:'key'});};
    request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();this.dbPromise=null;};finish(db);};
    request.onerror=()=>finish(null);request.onblocked=()=>finish(null);
   }catch(_){finish(null);}
  });
  return this.dbPromise;
 }
 async diskRead(key,owner,epoch){
  const db=await this.open();if(!db||!this.valid(owner,epoch))return null;
  return new Promise(resolve=>{
   try{const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(key);
    req.onsuccess=()=>{const row=req.result;
     if(!this.valid(owner,epoch)||!row||row.owner!==owner||row.expiresAt<=Date.now()||
        !(row.blob instanceof Blob)||!IMAGE_TYPES.has(row.blob.type)||
        row.blob.size<1||row.blob.size>MAX_FILE_BYTES){resolve(null);return;}
     resolve(row.blob);
     if(Date.now()-Number(row.lastUsed||0)>12*60*60*1000)void this.touch(key,owner,epoch);
    };
    req.onerror=()=>resolve(null);tx.onabort=()=>resolve(null);
   }catch(_){resolve(null);}
  });
 }
 async touch(key,owner,epoch){
  const db=await this.open();if(!db||!this.valid(owner,epoch))return;
  try{const store=db.transaction(STORE,'readwrite').objectStore(STORE),req=store.get(key);
   req.onsuccess=()=>{if(!this.valid(owner,epoch))return;const row=req.result;if(row){row.lastUsed=Date.now();store.put(row);}};
  }catch(_){}
 }
 async diskSave(key,p,f,variant,blob,owner,epoch){
  if(!this.valid(owner,epoch)||!IMAGE_TYPES.has(blob?.type)||blob.size<1||blob.size>MAX_FILE_BYTES)return;
  const db=await this.open();if(!db||!this.valid(owner,epoch))return;
  try{await new Promise(resolve=>{
   try{const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put({key,owner,postId:String(p.id),fileId:String(f.driveFileId),variant,
     blob,byteLength:blob.size,lastUsed:Date.now(),expiresAt:Date.now()+TTL});
    tx.oncomplete=resolve;tx.onerror=resolve;tx.onabort=resolve;
   }catch(_){resolve();}
  });if(++this.writes%8===0)void this.prune(owner,epoch);
  }catch(_){} // Storage pressure should never block announcement viewing.
 }
 async deleteFile(p,f){
  const owner=this.owner;if(!owner)return;
  const keys=['full','thumb'].map(k=>this.identity(p,f,k,owner));
  for(const key of keys){const url=this.urls.get(key);if(url){this.urls.delete(key);URL.revokeObjectURL(url);}this.pending.delete(key);}
  const db=await this.open();if(!db)return;
  try{const store=db.transaction(STORE,'readwrite').objectStore(STORE);for(const key of keys)store.delete(key);}catch(_){}
 }
 scheduleReconcile(posts){
  const owner=this.owner,epoch=this.epoch;if(!this.valid(owner,epoch))return;
  const authorized=new Set();
  for(const [postId,post] of Object.entries(posts||{})){
   if(!post||typeof post!=='object')continue;
   const files=Array.isArray(post.attachments)?post.attachments:Object.values(post.attachments||{});
   for(const f of files){if(f?.type!=='image'||!f.driveFileId)continue;
    authorized.add(this.identity({id:postId},f,'full',owner));
    authorized.add(this.identity({id:postId},f,'thumb',owner));
   }
  }
  clearTimeout(this.reconcileTimer);
  this.reconcileTimer=setTimeout(()=>void this.reconcile(authorized,owner,epoch),650);
 }
 async reconcile(authorized,owner,epoch){
  if(!this.valid(owner,epoch))return;
  const db=await this.open();if(!db||!this.valid(owner,epoch))return;
  try{const store=db.transaction(STORE,'readwrite').objectStore(STORE),req=store.openCursor();
   req.onsuccess=()=>{const cursor=req.result;if(!cursor)return;
    if(this.valid(owner,epoch)&&cursor.value?.owner===owner&&!authorized.has(cursor.key))cursor.delete();
    cursor.continue();
   };
  }catch(_){}
 }
 async purgeOwner(owner){
  const db=await this.open();if(!db||this.owner===owner)return;
  try{const store=db.transaction(STORE,'readwrite').objectStore(STORE),req=store.openCursor();
   req.onsuccess=()=>{const cursor=req.result;if(!cursor)return;
    // A very fast re-login should not delete its newly restored private cache.
    if(this.owner!==owner&&cursor.value?.owner===owner)cursor.delete();
    cursor.continue();
   };
  }catch(_){}
 }
 async prune(owner,epoch){
  if(!this.valid(owner,epoch))return;
  const db=await this.open();if(!db||!this.valid(owner,epoch))return;
  try{const store=db.transaction(STORE,'readwrite').objectStore(STORE),keep=[],req=store.openCursor();
   req.onsuccess=()=>{const cursor=req.result;if(!cursor){
     keep.sort((a,b)=>b.lastUsed-a.lastUsed);let count=0,bytes=0;
     for(const row of keep){if(count>=MAX_ENTRIES||bytes+row.bytes>MAX_BYTES)store.delete(row.key);
      else{count++;bytes+=row.bytes;}}
     return;
    }
    if(!this.valid(owner,epoch)){cursor.continue();return;}
    const row=cursor.value;
    if(row?.owner!==owner||row.expiresAt<=Date.now()||
       !Number.isFinite(row.byteLength)||row.byteLength<1||row.byteLength>MAX_FILE_BYTES)
      cursor.delete();
    else keep.push({key:cursor.key,bytes:row.byteLength,lastUsed:Number(row.lastUsed)||0});
    cursor.continue();
   };
  }catch(_){}
 }
 async get(p,f,kind,fetchBlob,allowed){
  const owner=this.owner,epoch=this.epoch;
  if(!this.valid(owner,epoch)||!allowed())throw Error('This attachment is no longer available.');
  const isImage=f.type==='image',variant=isImage&&kind==='thumb'?'thumb':'full';
  const key=this.identity(p,f,variant,owner),existing=this.memory(key);
  if(existing)return existing;
  const ongoing=this.pending.get(key);if(ongoing)return ongoing;
  const promise=(async()=>{
   if(isImage){const blob=await this.diskRead(key,owner,epoch);
    if(blob){if(!this.valid(owner,epoch)||!allowed())throw Error('This attachment is no longer available.');
     if(variant==='full')this.scheduleThumbnail(p,f,blob,owner,epoch);
     return this.remember(key,blob);
    }
    // A thumbnail miss can reuse a saved full image; no second Drive read.
    if(variant==='thumb')return this.get(p,f,'full',fetchBlob,allowed);
   }
   if(!this.valid(owner,epoch)||!allowed())throw Error('This attachment is no longer available.');
   const blob=await fetchBlob();
   if(!this.valid(owner,epoch)||!allowed())throw Error('This attachment is no longer available.');
   if(!(blob instanceof Blob)||!blob.size)throw Error('The attachment could not be opened.');
   if(isImage&&!IMAGE_TYPES.has(blob.type))throw Error('Unsupported announcement image format.');
   const url=this.remember(key,blob);
   if(isImage){void this.diskSave(key,p,f,'full',blob,owner,epoch);
    this.scheduleThumbnail(p,f,blob,owner,epoch);
   }
   return url;
  })().finally(()=>{if(this.pending.get(key)===promise)this.pending.delete(key);});
  this.pending.set(key,promise);return promise;
 }
 async seed(p,f,blob){
  // A teacher has just uploaded this exact file: cache its own verified bytes.
  const owner=this.owner,epoch=this.epoch;
  if(!this.valid(owner,epoch)||f.type!=='image'||!IMAGE_TYPES.has(blob?.type)||!blob.size)return;
  const key=this.identity(p,f,'full',owner);this.remember(key,blob);
  void this.diskSave(key,p,f,'full',blob,owner,epoch);
  this.scheduleThumbnail(p,f,blob,owner,epoch);
 }
 scheduleThumbnail(p,f,blob,owner,epoch){
  const key=this.identity(p,f,'thumb',owner);
  if(this.thumbTasks.has(key)||this.urls.has(key)||!this.valid(owner,epoch))return;
  this.thumbTasks.add(key);this.thumbQueue.push({p,f,blob,owner,epoch,key});this.pumpThumbnails();
 }
 pumpThumbnails(){
  if(this.thumbBusy||!this.thumbQueue.length)return;this.thumbBusy=true;
  const schedule=window.requestIdleCallback
   ?fn=>window.requestIdleCallback(fn,{timeout:1600})
   :fn=>setTimeout(fn,90);
  schedule(async()=>{
   const task=this.thumbQueue.shift();if(!task){this.thumbBusy=false;return;}
   const {p,f,blob,owner,epoch,key}=task;
   try{if(this.valid(owner,epoch)&&!await this.diskRead(key,owner,epoch)){
     const thumb=await this.makeThumbnail(blob);
     if(thumb&&this.valid(owner,epoch)){
      await this.diskSave(key,p,f,'thumb',thumb,owner,epoch);
      // Store disk bytes only. Rendering uses memory URL when requested.
     }
    }}catch(_){}finally{this.thumbTasks.delete(key);this.thumbBusy=false;this.pumpThumbnails();}
  });
 }
 async makeThumbnail(blob){
  if(typeof createImageBitmap!=='function')return null;
  const bmp=await createImageBitmap(blob);
  try{const scale=Math.min(1,800/Math.max(bmp.width,bmp.height));
   if(scale>=1&&blob.size<=140*1024)return blob;
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bmp.width*scale));canvas.height=Math.max(1,Math.round(bmp.height*scale));
   const context=canvas.getContext('2d');if(!context)return null;context.drawImage(bmp,0,0,canvas.width,canvas.height);
   const thumb=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.78));
   return thumb&&IMAGE_TYPES.has(thumb.type)&&thumb.size>0&&thumb.size<blob.size?thumb:null;
  }finally{bmp.close?.();}
 }
}
window.G8AnnouncementsPhotoCache=new AnnouncementPhotoCache();
})();
