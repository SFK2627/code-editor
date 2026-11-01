/* G8Code Studio — official editor. Shares existing projects and Firebase data with the main app. */
(()=>{'use strict';
const $=id=>document.getElementById(id), qs=(sel,root=document)=>root.querySelector(sel), all=(sel,root=document)=>[...root.querySelectorAll(sel)];
const GROUP={html:'pages',css:'cssFiles',js:'jsFiles'},ACTIVE={html:'activeHtmlPage',css:'activeCssFile',js:'activeJsFile'},DEFAULT={html:'index.html',css:'style.css',js:'script.js'};
const START={pages:{'index.html':'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My First Webpage</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <main>\n    <h1>Hello, G8Code! 👋</h1>\n    <p>Start building something great.</p>\n    <button id="hello">Click me</button>\n  </main>\n  <script src="script.js"><\\/script>\n</body>\n</html>'.replace('<\\/script>','</script>')},cssFiles:{'style.css':'body {\n  font-family: system-ui, sans-serif;\n  margin: 0; padding: 2rem;\n  color: #183451;\n  background: #f6f9ff;\n}\nmain { max-width: 700px; margin: auto; }\nbutton { padding: 10px 16px; background: #2464c4; color: white; border: 0; border-radius: 8px; }'},jsFiles:{'script.js':'document.getElementById("hello")?.addEventListener("click", () => {\n  alert("Your JavaScript works!");\n});'},activeHtmlPage:'index.html',activeCssFile:'style.css',activeJsFile:'script.js'};
const PREF='g8code.studio.v2.pref', DRAFT='g8code.studio.v2.guest.draft';
const STUDIO_ROUTE_KEY='g8code.officialStudio.return.v1';
const STUDIO_PARAMS=new URLSearchParams(location.search);
const STUDIO_FORCE_GUEST=STUDIO_PARAMS.get('mode')==='guest';
const fromJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const prefs=fromJSON(PREF,{});
const state={lang:'html',layout:prefs.layout||'split',mobileTab:'code',device:prefs.device||(matchMedia('(max-width:700px)').matches?'phone':matchMedia('(max-width:920px)').matches?'tablet':'desktop'),appearance:prefs.appearance||'light',autoRun:prefs.autoRun!==false,font:clamp(Number(prefs.font)||13,9,32),previewZoom:'fit',filesOpen:typeof prefs.filesOpen==='boolean'?prefs.filesOpen:matchMedia('(min-width:1200px)').matches,dirty:false,saving:false,guest:true,auth:null,profile:null,root:{},activities:[],given:[],projects:[],project:null,projectId:'',name:'My First Webpage',code:structuredClone(START),previewPage:'index.html',collab:null,collabUnsubs:[],rtcTimer:null,unsavedSince:0};
const frame=$('outputFrame'),input=$('codeInput'),rootPath=()=>{const c=window.MCS_FIREBASE_COLLECTION||'webCodeEditor',d=window.MCS_FIREBASE_DOCUMENT_ID||'grade8-mcsian-blank-v1';return [c,d]};
let db=null,auth=null,autoTimer=null,cloudTimer=null,resizeObserver=null,dialogResolve=null, lastFocused=null;
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function clone(v){return JSON.parse(JSON.stringify(v))}
function toast(message,kind=''){const el=document.createElement('div');el.className='toast '+kind;el.textContent=message;$('toastHost').append(el);setTimeout(()=>el.remove(),3800)}
function status(message){$('saveState').textContent=message;$('connectionStatus').textContent=message}
function title(name){state.name=String(name||'Untitled Project').slice(0,80);$('projectTitle').value=state.name;document.title=state.name+' · G8Code Studio'}
function fileType(name){const ext=name.split('.').pop().toLowerCase();return ext==='html'?'html':ext==='css'?'css':ext==='js'?'js':null}
function fileMap(lang=state.lang){return state.code[GROUP[lang]]}
function fileName(lang=state.lang){return state.code[ACTIVE[lang]]}
function fileContent(lang=state.lang){return fileMap(lang)[fileName(lang)]||''}
function validFileName(value,type){let s=String(value||'').trim().replace(/\\/g,'/'); if(s.includes('/')||s.includes('..')||!s.match(/^[\w-]{1,52}\.(html|css|js)$/i))return null;return fileType(s)===type?s:null}
function normalizeCode(code){const src=code&&typeof code==='object'?code:{}; const out={};for(const lang of ['html','css','js']){const mapKey=GROUP[lang],activeKey=ACTIVE[lang],source=src[mapKey]&&typeof src[mapKey]==='object'&&!Array.isArray(src[mapKey])?src[mapKey]:null; const map={};for(const [name,value] of Object.entries(source||{})){if(validFileName(name,lang)&&typeof value==='string')map[name]=value}if(!Object.keys(map).length && (lang==='html'||!source)){const legacyName=lang==='html'?'index.html':DEFAULT[lang];map[legacyName]=typeof src[lang]==='string'?src[lang]:''}out[mapKey]=map;let active=src[activeKey]||Object.keys(map)[0];if(!(active in map))active=Object.keys(map)[0];out[activeKey]=active}return out}
function normalizeProject(raw){if(raw&&raw.codeByActivity){const key=raw.selectedActivityId&&raw.codeByActivity[raw.selectedActivityId]?raw.selectedActivityId:(raw.codeByActivity.scratch?'scratch':Object.keys(raw.codeByActivity)[0]);return normalizeCode(raw.codeByActivity[key]||{})}return normalizeCode(raw||START)}
function setDirty(){state.dirty=true;state.changeRevision=(state.changeRevision||0)+1;state.unsavedSince=Date.now();status(state.guest?'● Unsaved local draft':'● Unsaved changes');safeLocalDraft();if(state.autoRun)scheduleRun();if(!state.collab&&!state.guest&&state.root?.studentAssistanceSettings?.enabled!==false&&state.root?.studentAssistanceSettings?.autoSave!==false){clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>saveProject({quiet:true}),15000)}}
function safeLocalDraft(){try{const key=state.guest?DRAFT:`${DRAFT}.${state.auth?.uid||'auth'}`;sessionStorage.setItem(key,JSON.stringify({name:state.name,code:state.code,projectId:state.projectId,practiceCheck:state.lastPracticeCheck||null,dirty:state.dirty,updated:Date.now()}))}catch{}}
function switchFile(lang,name){if(!fileMap(lang)?.hasOwnProperty(name))return;state.lang=lang;state.code[ACTIVE[lang]]=name;input.value=fileContent();$('activeFileLabel').textContent=name;all('#languageTabs button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));renderFiles();refreshLineNumbers();refreshCursor();input.focus();renderCollabCursors();scheduleCollabCursor();}
function renderFiles(){
 const groups=[['html','HTML pages','⌘'],['css','Stylesheets','◈'],['js','JavaScript','◇']];
 $('fileExplorer').innerHTML=groups.map(([lang,label,icon])=>{
  const names=Object.keys(fileMap(lang));
  const entries=names.map(name=>`<div class="file-item-row">
    <button type="button" class="file-entry ${state.lang===lang&&fileName(lang)===name?'active':''}" data-file="${escapeHTML(name)}" data-lang="${lang}" title="Open ${escapeHTML(name)}"><i aria-hidden="true">${icon}</i><span>${escapeHTML(name)}</span></button>
    <button type="button" class="file-action file-rename" data-rename="${escapeHTML(name)}" data-lang="${lang}" aria-label="Rename ${escapeHTML(name)}" title="Rename ${escapeHTML(name)}">✎</button>
    <button type="button" class="file-action file-delete" data-delete="${escapeHTML(name)}" data-lang="${lang}" aria-label="Delete ${escapeHTML(name)}" title="Delete ${escapeHTML(name)}">✕</button>
   </div>`).join('');
  return `<div class="file-group"><div class="file-group-title"><span>${label} <small>${names.length}</small></span><button type="button" data-add="${lang}" aria-label="Add ${lang} file">＋</button></div>${entries||`<div class="file-empty">No ${lang.toUpperCase()} files yet. <button type="button" data-add="${lang}">＋ Add one</button></div>`}</div>`;
 }).join('');
 const canDelete=state.lang!=='html'||Object.keys(state.code.pages).length>1;
 $('deleteFile').disabled=!canDelete || !fileName();
 $('deleteFile').title=canDelete?'Delete selected file':'Keep at least one HTML page';
 renderPreviewPages();if(state.collab&&!liveCollab?.canEdit())all('#fileExplorer [data-add],#fileExplorer [data-rename],#fileExplorer [data-delete]').forEach(el=>el.disabled=true);
}
function renderPreviewPages(){const sel=$('previewPage'),pages=Object.keys(state.code.pages);if(!pages.includes(state.previewPage))state.previewPage=pages[0];sel.innerHTML=pages.map(p=>`<option ${p===state.previewPage?'selected':''}>${escapeHTML(p)}</option>`).join('')}
function refreshLineNumbers(){renderHighlight();const count=input.value.split('\n').length;$('lineNumbers').textContent=Array.from({length:count},(_,i)=>i+1).join('\n');$('lineNumbers').scrollTop=input.scrollTop;$('editorStatus').textContent=input.value.length.toLocaleString()+' chars'+(state.lang==='html'&&htmlTagIssues.length?' · '+htmlTagIssues.length+' tag warning'+(htmlTagIssues.length===1?'':'s'):'');$('editorStatus').title=state.lang==='html'&&htmlTagIssues.length?'Red underline: possible missing or unmatched closing tag':''}
// Lightweight HTML editor lexer with paired/unpaired tag diagnostics.
// It highlights attribute names and values separately without touching editable text.
const HTML_VOID_TAGS=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
let htmlTagIssues=[];
function htmlTokens(code){
 const tags=[];const stack=[];const re=/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*?>/g;let m;
 while((m=re.exec(code))){const raw=m[0];if(raw.startsWith('<!--')||raw.startsWith('<!')){tags.push({start:m.index,end:re.lastIndex,raw,comment:true});continue}
  const close=/^<\s*\//.test(raw),nm=raw.match(/^<\s*\/?\s*([A-Za-z][\w:-]*)/);if(!nm)continue;
  const tag={start:m.index,end:re.lastIndex,raw,name:nm[1].toLowerCase(),close,issue:false,matched:false};tags.push(tag);
  if(close){if(HTML_VOID_TAGS.has(tag.name)){tag.issue=true;continue}let idx=stack.length-1;while(idx>=0&&stack[idx].name!==tag.name)idx--;if(idx<0){tag.issue=true;continue}for(let k=stack.length-1;k>idx;k--){stack[k].issue=true}stack.splice(idx+1);const open=stack.pop();open.matched=true;tag.matched=true;open.partner=tag;tag.partner=open}
  else if(!HTML_VOID_TAGS.has(tag.name)&&!raw.endsWith('/>')){stack.push(tag)}
 }
 for(const tag of stack)tag.issue=true;
 return tags;
}
function highlightHtmlTag(tag){const raw=tag.raw;if(tag.comment)return `<span class="syn-comment">${escapeHTML(raw)}</span>`;
 const match=raw.match(/^(<\s*\/?\s*)([A-Za-z][\w:-]*)([\s\S]*)$/);if(!match)return escapeHTML(raw);
 const cls=tag.selected?(tag.issue?' syn-tag-error syn-tag-active':tag.matched?' syn-tag-matched syn-tag-active':''):'';
 let html=`<span class="syn-bracket">${escapeHTML(match[1])}</span><span class="syn-tag${cls}">${escapeHTML(match[2])}</span>`;
 const rest=match[3];const attr=/(\s+)([\w:@.-]+)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s>/'"=]+)?/g;
 let cursor=0,m;while((m=attr.exec(rest))){if(m.index>cursor)html+=escapeHTML(rest.slice(cursor,m.index));
  html+=escapeHTML(m[1]||'')+`<span class="syn-attr">${escapeHTML(m[2])}</span>`;
  if(m[3])html+=`<span class="syn-equals">${escapeHTML(m[3])}</span>`;
  if(m[4])html+=`<span class="syn-string">${escapeHTML(m[4])}</span>`;
  cursor=attr.lastIndex;
 }
 html+=escapeHTML(rest.slice(cursor));return `<span class="syn-tag-group">${html}</span>`;
}
function renderHighlight(){
 const target=$('codeHighlight');if(!target)return;const text=input.value,escape=escapeHTML;
 if(text.length>120000){target.textContent=text;htmlTagIssues=[];return}
 if(state.lang==='html'){
  const tags=htmlTokens(text);let result='',last=0;htmlTagIssues=[];
  // Highlight the paired tag NAMES only when the caret is inside a tag name.
  // A caret in text, a CSS class, an attribute or value never triggers a pair.
  if(input.selectionStart===input.selectionEnd){
    const caret=input.selectionStart;
    const selected=tags.find(tag=>{
      if(tag.comment)return false;
      const lexical=tag.raw.match(/^(<\s*\/?\s*)([A-Za-z][\w:-]*)/);
      if(!lexical)return false;
      const first=tag.start+lexical[1].length;
      return caret>=first && caret<=first+lexical[2].length;
    });
    if(selected){selected.selected=true;if(selected.partner)selected.partner.selected=true;}
  }

  for(const tag of tags){result+=escape(text.slice(last,tag.start));result+=highlightHtmlTag(tag);if(tag.issue)htmlTagIssues.push({name:tag.name,start:tag.start,close:tag.close});last=tag.end}
  result+=escape(text.slice(last));target.innerHTML=result+'\n';
 }else{
  htmlTagIssues=[];
  const re=state.lang==='css'?/\/\*[\s\S]*?\*\/|"[^"\n]*"|'[^'\n]*'|#[0-9a-fA-F]{3,8}\b|\b[a-z-]+(?=\s*:)|\b\d+(?:px|rem|em|%|vh|vw)?\b/g:/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\n])*"|'(?:\\.|[^'\n])*'|`(?:\\.|[^`])*`|\b(?:const|let|var|function|return|if|else|for|while|async|await|class|new|import|export|true|false|null)\b|\b\d+(?:\.\d+)?\b/g;
  let result='',last=0,m;while((m=re.exec(text))){result+=escape(text.slice(last,m.index));const v=m[0];let cls=v.startsWith('/*')||v.startsWith('//')?'comment':v.startsWith('"')||v.startsWith("'")||v.startsWith('`')?'string':/^\d|^#[0-9a-fA-F]{3}/.test(v)?'number':state.lang==='css'?'property':'keyword';result+=`<span class="syn-${cls}">${escape(v)}</span>`;last=re.lastIndex}target.innerHTML=result+escape(text.slice(last))+'\n';
 }
 target.scrollTop=input.scrollTop;target.scrollLeft=input.scrollLeft;
}

function zoomEditorFont(delta){state.font=clamp(state.font+delta,9,32);document.documentElement.style.setProperty('--font-size',state.font+'px');storePrefs();toast('Editor font: '+state.font+'px')};
function refreshCursor(){const pos=input.selectionStart,lines=input.value.slice(0,pos).split('\n');$('cursorStatus').textContent=`Ln ${lines.length}, Col ${lines[lines.length-1].length+1}`}
function changeCode(){if(state.collab&&!liveCollab?.canEdit()){input.value=fileContent();refreshLineNumbers();toast('This project is view-only until the host enables editing.','error');return;}const previous=fileContent(),lang=state.lang,name=fileName();fileMap()[name]=input.value;liveCollab?.localEdit(lang,name,previous,input.value);refreshLineNumbers();refreshCursor();setDirty()}
function renameReferences(oldName,newName){for(const [page,html] of Object.entries(state.code.pages)){state.code.pages[page]=html.replace(/((?:href|src)\s*=\s*["'])[^"']*(["'])/gi,(whole,a,b)=>{const value=whole.slice(a.length,-b.length);return value===oldName?a+newName+b:whole})}}
async function addOrRenameFile(lang,name=''){if(state.collab&&!liveCollab?.canEdit()){toast('View-only session: files cannot be changed.','error');return;}const isRename=Boolean(name);const oldName=name;const result=await promptText(isRename?'Rename file':`Add ${lang.toUpperCase()} file`,isRename?name:lang==='html'?'about.html':lang==='css'?'layout.css':'effects.js','File name');if(result===null)return;const valid=validFileName(result,lang);if(!valid){toast('Use a valid .html, .css, or .js filename without folders.','error');return}if(valid!==oldName && Object.prototype.hasOwnProperty.call(fileMap(lang),valid)){toast('A file with that name already exists.','error');return}if(isRename){const map=fileMap(lang);const data=map[oldName];delete map[oldName];map[valid]=data;renameReferences(oldName,valid);if(state.previewPage===oldName)state.previewPage=valid}else fileMap(lang)[valid]=lang==='html'?'<!DOCTYPE html>\n<html lang="en">\n<head><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Page</title></head>\n<body>\n<h1>New page</h1>\n</body>\n</html>':'';state.code[ACTIVE[lang]]=valid;switchFile(lang,valid);if(matchMedia('(max-width:920px)').matches)toggleFiles(false);setDirty();liveCollab?.structure();toast(isRename?'File renamed':'File created')}
async function deleteFile(lang=state.lang,name=fileName(lang)){if(state.collab&&!liveCollab?.canEdit()){toast('View-only session: files cannot be deleted.','error');return;}
 const map=fileMap(lang);
 if(!map||!Object.prototype.hasOwnProperty.call(map,name))return;
 if(lang==='html'&&Object.keys(map).length<=1){toast('Keep at least one HTML page. Add another page before deleting this one.','error');return}
 const linked=lang!=='html'&&Object.values(state.code.pages).some(html=>lang==='css'
   ? [...new DOMParser().parseFromString(html,'text/html').querySelectorAll('link[rel~="stylesheet"][href]')].some(el=>el.getAttribute('href').split(/[?#]/)[0].replace(/^\.\//,'')===name)
   : [...new DOMParser().parseFromString(html,'text/html').querySelectorAll('script[src]')].some(el=>el.getAttribute('src').split(/[?#]/)[0].replace(/^\.\//,'')===name));
 const warning=linked?' Its HTML stylesheet/script references will also be removed.':lang==='html'?' Links from other pages may need updating.':'';
 if(!await confirmAction(`Permanently delete ${name}?${warning} This cannot be undone after saving.`, 'Delete file','danger'))return;
 // Don't remove another file if a confirmation dialog stayed open while project changed.
 if(!Object.prototype.hasOwnProperty.call(fileMap(lang),name))return;
 delete fileMap(lang)[name];
 if(linked){for(const [page,html] of Object.entries(state.code.pages)){
   const doc=new DOMParser().parseFromString(html,'text/html');let changed=false;
   const selector=lang==='css'?'link[rel~="stylesheet"][href]':'script[src]';
   const attr=lang==='css'?'href':'src';
   for(const el of doc.querySelectorAll(selector)){
    if(el.getAttribute(attr).split(/[?#]/)[0].replace(/^\.\//,'')===name){el.remove();changed=true}
   }
   if(changed)state.code.pages[page]='<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
 }}
 const remaining=Object.keys(fileMap(lang));
 if(fileName(lang)===name)state.code[ACTIVE[lang]]=remaining[0]||'';
 if(lang==='html'&&state.previewPage===name)state.previewPage=state.code.activeHtmlPage;
 const currentActive=state.lang===lang && !remaining.length;
 if(currentActive)switchFile('html',state.code.activeHtmlPage);
 else if(state.lang===lang)switchFile(lang,fileName(lang));
 else renderFiles();
 // Refresh the code textarea if deleting a linked CSS/JS file updated active HTML.
 if(linked&&state.lang==='html'){input.value=fileContent();refreshLineNumbers();refreshCursor()}
 setDirty();liveCollab?.structure();runPreview();
 toast(`${name} deleted. ${remaining.length?`${remaining.length} ${lang.toUpperCase()} file(s) remain.`:'Add a new '+lang.toUpperCase()+' file anytime.'}`);
}
function getProjectFiles(){return Object.assign({},state.code.pages,state.code.cssFiles,state.code.jsFiles)}
function safeInlineScript(js){return String(js).replace(/<\/script/gi,'<\\/script')}
// All modes use ONE persistent iframe: changing layouts must not reset JavaScript
// counters, forms, timers or the page the student navigated to.
let previewRendered=false;
let previewRevision=-1;
let pendingFragment='';
let pendingPageNavigation=false;
function normalizePreviewLink(raw,currentPage=state.previewPage){
 const source=String(raw||'').trim();
 if(!source || source.startsWith('#'))return null; // native in-page anchors
 if(/^(?:javascript:|mailto:|tel:|sms:|data:|blob:)/i.test(source))return null;
 const bare=source.split(/[?#]/)[0];
 if(!bare || bare.startsWith('//') || /^[a-z][\w+.-]*:/i.test(bare))return null;
 let decoded;
 try{decoded=decodeURIComponent(bare)}catch{return null}
 // V2 project file names are flat. Keep absolute paths/parent traversal out.
 const name=decoded.replace(/^\.\//,'');
 if(!Object.prototype.hasOwnProperty.call(state.code.pages,name))return null;
 const hashPos=source.indexOf('#');
 return {page:name,fragment:hashPos>=0?source.slice(hashPos+1):'',query:source.includes('?')?source.slice(source.indexOf('?'),hashPos>=0?hashPos:undefined):''};
}
function previewBridgeScript(){
 // This script belongs only to the opaque-origin, sandboxed output iframe.
 // Never grant the student's code access to the parent G8Code Firebase session.
 return `(()=>{'use strict';
 const PAGE=${JSON.stringify(state.previewPage)};
 const pages=new Set(${JSON.stringify(Object.keys(state.code.pages))});
 const report=(detail)=>parent.postMessage(Object.assign({g8StudioV2:true},detail),'*');
 function internal(raw){
   if(!raw||raw[0]==='#'||/^(?:javascript:|mailto:|tel:|sms:|data:|blob:)/i.test(raw))return null;
   let bare=raw.split(/[?#]/)[0];
   if(!bare||bare.startsWith('//')||/^[a-z][\\w+.-]*:/i.test(bare))return null;
   try{bare=decodeURIComponent(bare)}catch{return null}
   bare=bare.replace(/^\\.\\//,'');
   if(!pages.has(bare))return null;
   return raw;
 }
 // An iframe srcdoc has an opaque document URL. Following href="#section"
 // natively can navigate the sandbox to a BLANK page instead of scrolling.
 // Resolve fragment destinations INSIDE the current student page, without
 // changing the iframe URL or rerunning the student's scripts.
 function scrollToProjectAnchor(rawFragment){
   let fragment=String(rawFragment??'').replace(/^#/, '');
   if(!fragment){
     (document.scrollingElement||document.documentElement).scrollTo({top:0,behavior:'instant'});
     return true;
   }
   try{fragment=decodeURIComponent(fragment)}catch{}
   const target=document.getElementById(fragment)||document.getElementsByName(fragment)[0];
   if(!target)return false;
   // Honor scroll-margin and the student's scroll-behavior CSS. This also
   // supports targets nested inside scrollable sections.
   target.scrollIntoView({block:'start',inline:'nearest'});
   return true;
 }
 function samePageFragment(raw,local){
   if(raw.startsWith('#'))return raw.slice(1);
   if(!local||!local.includes('#'))return null;
   if(local.split(/[?#]/)[0]!==PAGE)return null;
   return local.slice(local.indexOf('#')+1);
 }
 function external(raw){
   if(!raw||raw[0]==='#')return false;
   // Non-project links (including relative resources and external URLs)
   // open in a separate browser tab, never replacing the output iframe.
   if(/^(?:javascript:|mailto:|tel:|sms:|data:|blob:)/i.test(raw))return false;
   return true;
 }
 document.addEventListener('click',e=>{
   const a=e.target.closest?.('a[href],area[href]');
   if(!a)return;
   const raw=(a.getAttribute('href')||'').trim();
   const local=internal(raw);
   if(a.hasAttribute('download'))return;
   const fragment=samePageFragment(raw,local);
   if(fragment!==null){
     e.preventDefault();
     // The listener runs in capture phase; defer scrolling until the student
     // onclick has had a chance to update the DOM (e.g., show a hidden section).
     queueMicrotask(()=>scrollToProjectAnchor(fragment));
     return;
   }
   if(local){
     e.preventDefault();
     // Do not stop propagation: any student's onclick listeners still execute.
     report({navigate:local,from:PAGE});
   }else if(external(raw)){
     a.setAttribute('target','_blank');
     a.setAttribute('rel','noopener noreferrer');
     // Browser handles the click directly with user activation. Parent-side
     // window.open() would be blocked by popup restrictions.
   }
 },true);
 document.addEventListener('submit',e=>{
   const form=e.target;
   if(!(form instanceof HTMLFormElement))return;
   const method=(form.getAttribute('method')||'get').toLowerCase();
   const action=(form.getAttribute('action')||'').trim();
   const local=internal(action) || (method==='get'&&(!action||action[0]==='?'||action[0]==='#') ? PAGE+action : null);
   if(method==='get'&&local){
     e.preventDefault();
     const data=new URLSearchParams(new FormData(form));
     const hash=local.includes('#')?local.slice(local.indexOf('#')):'';
     report({navigate:local.split(/[?#]/)[0]+(data.size?'?'+data.toString():'')+hash,from:PAGE});
   }else if(external(action)){
     form.setAttribute('target','_blank');
   }
 },true);
 window.addEventListener('message',event=>{
   if(event.source!==parent || !event.data?.g8StudioV2Parent)return;
   if(event.data.fragment!==undefined){
     const hash=String(event.data.fragment||'');
     // A linked HTML page may build its destination during DOMContentLoaded;
     // retry after the next layout frame if it is not present on the first pass.
     if(!scrollToProjectAnchor(hash)){
       requestAnimationFrame(()=>requestAnimationFrame(()=>scrollToProjectAnchor(hash)));
     }
   }
 });
 window.addEventListener('error',e=>report({error:String(e.message||'Script error')}));
 window.addEventListener('unhandledrejection',e=>report({error:String(e.reason?.message||e.reason||'Async script error')}));
 })();`;
}
function buildDocument(page=state.previewPage){
 let markup=state.code.pages[page]||'<!DOCTYPE html><html><body></body></html>';
 const parser=new DOMParser(),doc=parser.parseFromString(markup,'text/html');
 // Inline matching files from the virtual project. Other remote styles,
 // scripts and image URLs stay intact for the sandboxed browser to load.
 for(const el of [...doc.querySelectorAll('link[rel~="stylesheet"][href]')]){
   const href=(el.getAttribute('href')||'').split(/[?#]/)[0].replace(/^\.\//,'');
   if(Object.hasOwn(state.code.cssFiles,href)){
     const css=doc.createElement('style');css.textContent=state.code.cssFiles[href];el.replaceWith(css);
   }
 }
 for(const el of [...doc.querySelectorAll('script[src]')]){
   const src=(el.getAttribute('src')||'').split(/[?#]/)[0].replace(/^\.\//,'');
   if(Object.hasOwn(state.code.jsFiles,src)){
     const scr=doc.createElement('script');scr.textContent=safeInlineScript(state.code.jsFiles[src]);el.replaceWith(scr);
   }
 }
 const cssSources=Object.values(state.code.cssFiles);
 if(![...doc.querySelectorAll('style')].some(e=>cssSources.includes(e.textContent))&&cssSources.length){
   const css=doc.createElement('style');css.textContent=cssSources.join('\n');doc.head.append(css);
 }
 const jsSources=Object.values(state.code.jsFiles);
 if(![...doc.querySelectorAll('script:not([src])')].some(e=>jsSources.includes(e.textContent))&&jsSources.length){
   const script=doc.createElement('script');script.textContent=safeInlineScript(jsSources.join('\n'));doc.body.append(script);
 }
 if(!doc.querySelector('meta[name="viewport"]')){
   const meta=doc.createElement('meta');meta.name='viewport';meta.content='width=device-width,initial-scale=1';doc.head.prepend(meta);
 }
 const bridge=doc.createElement('script');bridge.textContent=safeInlineScript(previewBridgeScript());doc.head.prepend(bridge);
 return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
}
function scheduleRun(){clearTimeout(autoTimer);autoTimer=setTimeout(runPreview,450)}
function runPreview(){
 clearTimeout(autoTimer);
 if(fileMap()?.[fileName()]!==undefined&&fileMap()[fileName()]!==input.value)fileMap()[fileName()]=input.value;
 renderPreviewPages();
 previewRendered=true;
 previewRevision=state.changeRevision||0;
 frame.srcdoc=buildDocument();
 $('previewStatus').textContent='Running · '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
 $('resultQuick').textContent=state.project?.lastResult?'Saved rubric result available':'Preview updated';
 state.project&&(state.project.runCount=(state.project.runCount||0)+1);
 updateCanvas();
}
function ensurePreviewRendered(){
 if(!previewRendered || !frame.srcdoc || (state.autoRun && previewRevision!==(state.changeRevision||0))){runPreview();return}
 updateCanvas();
}
frame.addEventListener('load',()=>{
 $('previewStatus').textContent='Output ready · interactive';
 if(document.body.dataset.immersive==='preview')updateCanvas();
 if(pendingPageNavigation){
   const fragment=pendingFragment;pendingFragment='';pendingPageNavigation=false;
   // Wait for the target page scripts to create their elements.
   requestAnimationFrame(()=>frame.contentWindow?.postMessage({g8StudioV2Parent:true,fragment},'*'));
 }
});
window.addEventListener('message',event=>{
 if(event.source!==frame.contentWindow||!event.data?.g8StudioV2)return;
 if(event.data.navigate){
   if(event.data.from && event.data.from!==state.previewPage)return;
   const path=normalizePreviewLink(event.data.navigate);
   if(path){
     state.previewPage=path.page;
     pendingFragment=path.fragment;
     pendingPageNavigation=true;
     $('previewPage').value=path.page;
     runPreview();
   }
 }else if(event.data.error){
   $('previewStatus').textContent='JS error — see browser console';toast(event.data.error,'error');
 }
});
function updateCanvas(){
 const d=state.device,deviceSizes={phone:[390,844],tablet:[768,1024],desktop:[1366,768]},[width,height]=deviceSizes[d];
 const area=$('previewViewport');if(!area)return;
 const canvas=$('deviceCanvas'),surface=$('previewScrollSurface');
 const availableW=Math.max(150,area.clientWidth-35);
 if(document.body.dataset.immersive==='preview'){
  const simulated=matchMedia('(max-width:920px)').matches; // All device options, INCLUDING true 1366px desktop landscape, use a fixed virtual viewport in mobile Full Preview.
  document.body.dataset.previewSim=simulated?'on':'off';
  if(simulated){
   const fitScale=Math.min(1,Math.max(.05,(area.clientWidth-16)/width),Math.max(.05,(area.clientHeight-16)/height));
   const scaledWidth=width*fitScale,scaledHeight=height*fitScale;
   document.body.style.setProperty('--studio-full-scale',String(fitScale));
   document.body.style.setProperty('--studio-full-width',width+'px');
   document.body.style.setProperty('--studio-full-height',height+'px');
   document.body.style.setProperty('--studio-full-left',Math.max(0,(area.clientWidth-scaledWidth)/2)+'px');
   document.body.style.setProperty('--studio-full-top',Math.max(0,(area.clientHeight-scaledHeight)/2)+'px');
  }else{
   canvas.style.left='0';canvas.style.top='0';canvas.style.transform='none';canvas.style.zoom='1';
   canvas.style.width='100%';canvas.style.height='100%';
   surface.style.width='100%';surface.style.height='100%';
   frame.style.width='100%';frame.style.height='100%';
  }
  all('[data-device]').forEach(b=>b.classList.toggle('active',b.dataset.device===d));
  $('deviceLabel').textContent='Full Preview';return;
 }
 document.body.dataset.previewSim='off';
 // Use one persistent iframe across Code, Preview, Stacked, and device modes.
 // Zoom must not trigger a reload. Fit at small phone widths keeps native
 // pointer/hit testing for interactive elements in the output.
 const naturalPhone=d==='phone'&&state.previewZoom==='fit'&&availableW<width;
 const previewWidth=naturalPhone?Math.max(240,Math.floor(availableW)):width;
 const fit=Math.max(.1,Math.min(1,availableW/previewWidth));
 const scale=state.previewZoom==='fit'?fit:clamp(Number(state.previewZoom)||fit,.1,12);
 const scaledWidth=previewWidth*scale;
 const scaledHeight=(height+38)*scale;
 const surfaceWidth=Math.max(area.clientWidth,Math.ceil(scaledWidth+28));
 const surfaceHeight=Math.max(area.clientHeight,Math.ceil(scaledHeight+28));
 surface.style.width=surfaceWidth+'px';surface.style.height=surfaceHeight+'px';
 canvas.style.width=previewWidth+'px';
 // Center whenever the viewport is wide enough; at large zoom start at the
 // reachable scroll origin so the first column is never cut off.
 // CSS zoom also scales absolute offsets; express coordinates in
 // unscaled units so the VISIBLE box is centered at every zoom level.
 const desiredLeft=Math.max(12,(surfaceWidth-scaledWidth)/2);
 canvas.style.left=(desiredLeft/scale)+'px';
 canvas.style.top=(10/scale)+'px';canvas.style.transform='none';canvas.style.zoom=String(scale);
 frame.style.width=previewWidth+'px';frame.style.height=height+'px';
 $('deviceLabel').textContent=d[0].toUpperCase()+d.slice(1)+' · '+previewWidth+'px';
 $('previewMeta').textContent=`${previewWidth} × ${height} · ${Math.round(scale*100)}% ${state.previewZoom==='fit'?'fit':'zoom · scroll to pan'}`;
 all('[data-device]').forEach(b=>b.classList.toggle('active',b.dataset.device===d));
}
function setDevice(value){state.device=value;prefs.device=value;storePrefs();updateCanvas()}
function storePrefs(){try{localStorage.setItem(PREF,JSON.stringify({layout:state.layout,device:state.device,appearance:state.appearance,autoRun:state.autoRun,font:state.font,filesOpen:state.filesOpen,split:parseFloat($('workspace').style.getPropertyValue('--split'))||54,stack:parseFloat($('workspace').style.getPropertyValue('--stack'))||55}))}catch{}}
function setLayout(value){if(!['split','stacked','preview','editor'].includes(value))return;state.layout=value;$('workspace').dataset.layout=value;all('[data-layout]').forEach(b=>b.classList.toggle('active',b.dataset.layout===value));storePrefs();requestAnimationFrame(updateCanvas)}
// Full-viewport (and, where supported, native browser fullscreen) workspace.
// Remember the previous layout/mobile tab: switching Code↔Preview never loses work.
let studioImmersivePrevious=null;
let nativeFullscreenRequested=false;
async function enterStudioFullscreen(kind='code'){
 if(!['code','preview'].includes(kind))return;
 if(!studioImmersivePrevious)studioImmersivePrevious={layout:state.layout,mobileTab:state.mobileTab};
 document.body.dataset.immersive=kind;
 $('focusModeLabel').textContent=kind==='code'?'FULL CODE EDITOR':'FULL OUTPUT PREVIEW';
 $('focusProjectLabel').textContent=state.name;
 $('focusSwitch').textContent='▶ Run in Full Preview';
 $('focusSwitch').setAttribute('aria-label','Switch to full-screen preview');
 $('focusExit').setAttribute('aria-label','Exit fullscreen and return to '+studioImmersivePrevious.layout+' layout');
 // Override any earlier mobile-hidden class without changing the saved tab.
 if(kind==='preview'){
  // Defer the actual iframe navigation until the hidden preview panel has reflowed.
  // Reusing srcdoc while its parent is display:none can paint a blank iframe in browsers.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(document.body.dataset.immersive!=='preview')return;ensurePreviewRendered();}));
 }
 requestAnimationFrame(()=>{updateCanvas();if(kind==='code')input.focus({preventScroll:true})});
 // Full-viewport CSS mode is intentional: real browser fullscreen exits when
 // a student opens an external link in a new tab. Keep Studio's preview open.
 // Do NOT invoke the native Fullscreen API for a student's webpage.
 if(kind==='preview')requestAnimationFrame(()=>requestAnimationFrame(ensurePreviewRendered));
}
function exitStudioFullscreen(){
 if(!document.body.dataset.immersive)return;
 delete document.body.dataset.immersive;
 const previous=studioImmersivePrevious;
 studioImmersivePrevious=null;
 if(previous){setLayout(previous.layout);setMobileTab(previous.mobileTab)}
 requestAnimationFrame(updateCanvas);
 if(document.fullscreenElement&&typeof document.exitFullscreen==='function'){
  document.exitFullscreen().catch(()=>{});
 }
}
function switchStudioFullscreen(){
 const current=document.body.dataset.immersive;
 if(current==='code'){const stale=previewRevision!==(state.changeRevision||0);enterStudioFullscreen('preview');if(stale&&!state.autoRun)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(document.body.dataset.immersive==='preview')runPreview()}));}
}
document.addEventListener('fullscreenchange',()=>{
 // CSS Full Preview must not exit when the browser changes tab/focus.
 requestAnimationFrame(updateCanvas);
});
function setMobileTab(value,options={}){
 state.mobileTab=value;
 all('.mobile-workspace-tabs button[role="tab"]').forEach(b=>{const yes=b.id===(value==='code'?'mobileCode':'mobilePreview');b.classList.toggle('selected',yes);b.setAttribute('aria-selected',String(yes))});
 const mobileFocus=$('mobileFullPreview');
 if(mobileFocus){
  const toPreview=value==='preview';
  mobileFocus.title=toPreview?'Open Full Output Preview':'Open Full Code Editor';
  mobileFocus.setAttribute('aria-label',mobileFocus.title);
  mobileFocus.dataset.target=toPreview?'preview':'code';
 }
 $('codePanel').classList.toggle('mobile-hidden',value!=='code');$('previewPanel').classList.toggle('mobile-hidden',value!=='preview');
 // Hidden iframe content can fail to paint on phones even if srcdoc was set.
 // Render after the target preview pane is actually on-screen; don't change
 // the HTML/CSS/JS project data when switching between tabs.
 if(value==='preview'&&!options.deferRender)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(state.mobileTab==='preview'&&!document.body.dataset.immersive)ensurePreviewRendered()}));
 else requestAnimationFrame(updateCanvas);
}
function setAppearance(value,options={}){
 const settings=state.root?.loginReminderSettings||{};
 const locked=settings.applyThemeToEntireApp===true && settings.allowStudentAppAppearanceChoice!==true;
 if(locked && !options.fromAdmin){
  toast('Appearance is controlled by the Admin theme settings.','error');return;
 }
 state.appearance=value==='dark'?'dark':'light';
 document.body.dataset.appearance=state.appearance;
 $('toggleTheme').textContent=state.appearance==='dark'?'☀':'☾';
 $('toggleTheme').title=locked?'Appearance set by Admin':'Switch to '+(state.appearance==='dark'?'Light':'Dark')+' Mode';
 $('toggleTheme').disabled=locked;
 storePrefs();
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function installResize(){const divider=$('splitHandle');let active=false;divider.addEventListener('pointerdown',e=>{if(matchMedia('(max-width:700px)').matches||['editor','preview'].includes(state.layout))return;active=true;divider.setPointerCapture(e.pointerId);e.preventDefault()});divider.addEventListener('pointermove',e=>{if(!active)return;const el=$('workPanels'),r=el.getBoundingClientRect(),stacked=state.layout==='stacked';const v=stacked?100*(e.clientY-r.top)/r.height:100*(e.clientX-r.left)/r.width;el.parentElement.style.setProperty(stacked?'--stack':'--split',clamp(v,25,75)+'%');updateCanvas()});const stop=()=>{if(active){active=false;storePrefs()}};divider.addEventListener('pointerup',stop);divider.addEventListener('pointercancel',stop);divider.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const stack=state.layout==='stacked',key=stack?'--stack':'--split';const current=parseFloat($('workspace').style.getPropertyValue(key))||(stack?55:54);$('workspace').style.setProperty(key,clamp(current+(e.key==='ArrowRight'||e.key==='ArrowDown'?5:-5),25,75)+'%');storePrefs();updateCanvas()});}
function openDialog(heading,content,buttons=[],kicker='G8CODE STUDIO'){$('dialogTitle').textContent=heading;$('dialogKicker').textContent=kicker;$('dialogContent').replaceChildren();if(typeof content==='string')$('dialogContent').innerHTML=content;else if(content)$('dialogContent').append(content);$('dialogFooter').replaceChildren();for(const b of buttons){const el=document.createElement('button');el.type='button';el.className=b.kind||'secondary';el.textContent=b.label;el.addEventListener('click',b.action);$('dialogFooter').append(el)}$('dialog').classList.remove('hidden');$('scrim').classList.remove('hidden');lastFocused=document.activeElement;setTimeout(()=>$('dialog').querySelector('input,button,select')?.focus(),30)}
function closeDialog(){if(dialogResolve){const cb=dialogResolve;dialogResolve=null;cb(null)}$('dialog').classList.add('hidden');$('scrim').classList.add('hidden');lastFocused?.focus?.()}
function promptText(heading,initial='',label='Name'){return new Promise(resolve=>{openDialog(heading,`<label for="modalText">${escapeHTML(label)}</label><input id="modalText" value="${escapeHTML(initial)}" maxlength="90">`,[{label:'Cancel',action:()=>closeDialog()},{label:'Apply',kind:'primary',action:()=>{const val=$('modalText').value.trim();dialogResolve=null;closeDialog();resolve(val)}}]);dialogResolve=resolve;$('modalText')?.addEventListener('keydown',e=>{if(e.key==='Enter')$('dialogFooter .primary')?.click()})})}
function confirmAction(msg,label='Continue',kind='primary'){return new Promise(resolve=>{openDialog('Please confirm',`<p>${escapeHTML(msg)}</p>`,[{label:'Cancel',action:()=>closeDialog()},{label,kind,action:()=>{dialogResolve=null;closeDialog();resolve(true)}}]);dialogResolve=()=>resolve(false)})}
function requireAccount(thing){if(!state.auth||state.guest){toast(`${thing} requires a logged-in student account. Open G8Code and log in first.`,'error');return false}return true}
function docRef(...segments){return db.collection(rootPath()[0]).doc(rootPath()[1]).collection(segments[0]).doc(segments[1])}
function projectsRef(){return docRef('students',state.auth.uid).collection('projects')}
function profileRef(){return docRef('students',state.auth.uid)}
async function cloudRoot(){if(!db)return;try{const snap=await db.collection(rootPath()[0]).doc(rootPath()[1]).get();state.root=snap.data()||{};state.activities=Array.isArray(state.root.activities)?state.root.activities:[];state.given=Array.isArray(state.root.givenActivities)?state.root.givenActivities:[];applyAdminTheme();refreshSettings();}catch(err){console.warn('Studio settings unavailable:',err);toast('Published activities/settings unavailable. Editor remains usable.')}}
const STUDIO_THEME_ACCENTS={'campus-journal':'#b58a45','mission-control':'#16869e','honors-night':'#b18b39','blueprint-lab':'#3578cc',bauhaus:'#ca5941',minimalism:'#72849f',maximalism:'#a04fd4',futuristic:'#2b85cc','vector-art':'#ed6a4f','collage-art':'#b04d91',retro:'#b67743','synthwave-80s':'#ae58d5',cyberpunk:'#aa4cf4','pop-art':'#e15d37',glassmorphism:'#5186b8','clay-style':'#bf7f78','pixel-art':'#7066c8',editorial:'#8d4e5c',y2k:'#c175a8','swiss-design':'#d94343','surreal-design':'#806ac4',bohemian:'#a57555','victorian-style':'#9a7549',graffiti:'#d96245',aurora:'#398f91',handwritten:'#aa8350',classic:'#2e6bb4',christmas:'#bd454c','spider-comic':'#c43f47',halloween:'#bd6b35',valentine:'#ce5a87',graduation:'#b79545',galaxy:'#6a5bc7','cyber-neon':'#7553df',ocean:'#267a9c',sakura:'#bb729e','retro-arcade':'#a04fd8',birthday:'#d66f6f',fiesta:'#ce733f',forest:'#43875d'};
const STUDIO_THEME_SYMBOLS={christmas:'❄',bauhaus:'◒','blueprint-lab':'⌗',halloween:'✦',valentine:'♥',galaxy:'✧',ocean:'≈',sakura:'✿',forest:'❧','cyber-neon':'⌁','retro-arcade':'▣',birthday:'✶',fiesta:'✹',graduation:'★',classic:'✦'};
function applyAdminTheme(){
 const settings=state.root?.loginReminderSettings||fromJSON('studentCodeStudio.loginReminderSettings.v1',{});
 const enabled=settings.applyThemeToEntireApp===true;
 const theme=enabled?String(settings.theme||'classic'):'classic';
 document.body.dataset.theme=theme;
 const accent=STUDIO_THEME_ACCENTS[theme]||STUDIO_THEME_ACCENTS.classic;
 document.body.style.setProperty('--theme-accent',accent);
 document.body.style.setProperty('--theme-wash',`color-mix(in srgb, ${accent} 12%, transparent)`);
 document.body.style.setProperty('--theme-symbol',`'${STUDIO_THEME_SYMBOLS[theme]||'◆'}'`);
 document.body.style.setProperty('--theme-pattern',/blueprint|mission|cyber|pixel|arcade|futur/i.test(theme)?`linear-gradient(color-mix(in srgb, ${accent} 5%, transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb, ${accent} 5%, transparent) 1px,transparent 1px)`:/christmas|snow|birthday|fiesta|sakura/i.test(theme)?`radial-gradient(circle at 22% 18%,color-mix(in srgb, ${accent} 8%,transparent) 0 2px,transparent 3px)`:'none');
 if(enabled && settings.allowStudentAppAppearanceChoice!==true){
  const adminMode=String(settings.appAppearance||'auto').toLowerCase();
  const target=adminMode==='light'||adminMode==='dark'?adminMode:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  setAppearance(target,{fromAdmin:true});
 }else{
  $('toggleTheme').disabled=false;
  setAppearance(state.appearance,{fromAdmin:true});
 }
}
let studioAdminSettingsUnsub=null;
function watchStudioAdminSettings(){
 if(!db||!state.auth||studioAdminSettingsUnsub)return;
 try{
  const [collection,documentId]=rootPath();
  studioAdminSettingsUnsub=db.collection(collection).doc(documentId).onSnapshot(snapshot=>{
   if(!snapshot.exists)return;
   const data=snapshot.data()||{};
   state.root=data;
   state.activities=Array.isArray(data.activities)?data.activities:[];
   state.given=Array.isArray(data.givenActivities)?data.givenActivities:[];
   applyAdminTheme();refreshSettings();
  },err=>console.warn('Studio admin theme/settings live updates unavailable:',err));
 }catch(err){console.warn('Studio settings watcher:',err)}
}
async function initFirebase(){const firebase=window.firebase;if(!firebase?.initializeApp||!window.MCS_FIREBASE_CONFIG){status('Guest · Firebase SDK unavailable');return}try{const app=firebase.apps.length?firebase.app():firebase.initializeApp(window.MCS_FIREBASE_CONFIG);db=firebase.firestore(app);auth=firebase.auth(app);auth.onAuthStateChanged(async user=>{if(!user&&state.collab)stopCollab();state.auth=user;state.guest=!user||STUDIO_FORCE_GUEST;state.profile=null;$('authPill').textContent=user&&!STUDIO_FORCE_GUEST?'Student connected':'Guest mode';if(user&&!STUDIO_FORCE_GUEST){try{const snap=await profileRef().get();if(snap.exists){state.profile=snap.data()||{};$('authPill').textContent=state.profile.name||state.profile.firstName||'Student connected';status('● Connected to G8Code');}else{status('Signed in · no student profile');toast('Your Firebase account has no student profile. Open G8Code for verification.','error')}}catch(err){status('Signed in · profile unavailable');console.warn(err)}await cloudRoot();watchStudioAdminSettings();const parameter=new URLSearchParams(location.search);if(parameter.get('project'))await loadProject(parameter.get('project'));else restoreStudentRecovery(user.uid);}else{if(studioAdminSettingsUnsub){studioAdminSettingsUnsub();studioAdminSettingsUnsub=null}status('● Guest practice · local only');await cloudRoot();if(STUDIO_PARAMS.get('project')&&!STUDIO_FORCE_GUEST){toast('Sign in to open your saved G8Code project.','error');setTimeout(openAccount,180)}}renderResultQuick();});}catch(err){console.error(err);status('Guest practice · cloud unavailable');toast('Firebase could not connect. Local practice remains available.','error')}}
function openAccount(){if(!auth){toast('Firebase is not ready. Guest editing is still available.','error');return}if(auth.currentUser&&!state.guest){openDialog('Student account',`<p><strong>${escapeHTML(state.profile?.name||auth.currentUser.email||'Student')}</strong></p><p class="subtext">This is the authenticated G8Code session. Saving existing code projects uses the same account and Firestore project collection.</p>`,[{label:'Guest practice',action:()=>{state.guest=true;$('authPill').textContent='Guest practice';closeDialog();toast('Switched to local guest practice')}},{label:'Close',kind:'primary',action:closeDialog}]);return}
openDialog('Sign in to G8Code',`<p class="subtext">For existing students only. Use the Student ID and password from your original G8Code account. New account activation and password recovery remain in the main app.</p><label for="signInStudentId">Student ID</label><input id="signInStudentId" placeholder="e.g. 23-003746" autocomplete="username"><label for="signInPassword">Password</label><input id="signInPassword" type="password" placeholder="Your G8Code password" autocomplete="current-password"><p class="subtext"><a href="index.html">First login or forgot your password? Open the main G8Code page.</a></p><p class="subtext" id="signinMessage" role="status"></p>`,[{label:'Cancel',action:closeDialog},{label:'Sign in',kind:'primary',action:signInStudent}])}
async function signInStudent(){const raw=$('signInStudentId')?.value||'',pass=$('signInPassword')?.value||'',key=raw.toLowerCase().replace(/[^a-z0-9]/g,'');if(!key||!pass){$('signinMessage').textContent='Enter your Student ID and password.';return}if(!auth||!db){$('signinMessage').textContent='Firebase connection unavailable.';return}const btn=$('dialogFooter .primary');btn.disabled=true;$('signinMessage').textContent='Signing in securely…';try{let email=`sid-${key}@students.mcsian.app`;try{const route=await db.collection(rootPath()[0]).doc(rootPath()[1]).collection('studentLoginRoutes').doc(key).get();const mapped=String(route.data()?.authEmail||'').trim().toLowerCase();if(mapped&&mapped.endsWith('@students.mcsian.app'))email=mapped}catch(e){console.warn('Login routing lookup unavailable',e)}await auth.signInWithEmailAndPassword(email,pass);state.guest=false;closeDialog();toast('Student account connected');}catch(e){$('signinMessage').textContent=e.code==='auth/invalid-credential'||e.code==='auth/wrong-password'?'Student ID or password not recognized. Try the main G8Code login if needed.':String(e.message||'Sign in failed')}finally{btn.disabled=false}}
async function listProjects(){if(!requireAccount('Project library'))return;openDialog('My G8Code Projects','<p class="subtext">Loading your saved code projects…</p>',[{label:'Close',action:closeDialog}]);try{const snap=await projectsRef().orderBy('updatedAt','desc').limit(70).get().catch(()=>projectsRef().limit(70).get());state.projects=snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.projectType!=='wireframe');renderProjectsModal()}catch(err){$('dialogContent').innerHTML=`<p>${escapeHTML(err.message)}</p>`}}
function renderProjectsModal(){const rows=state.projects.length?state.projects.map(p=>`<div class="record-row"><div class="record-title"><strong>${escapeHTML(p.name||'Untitled Project')}</strong><small>${escapeHTML(p.activityTitle||p.petaActivityTitle||'HTML · CSS · JS')} · ${p.lastResult?`Rubric score ${p.lastResult.score??'?'} / ${p.lastResult.possible??'?'}`:p.studioPracticeCheck?`Practice ${p.studioPracticeCheck.score??'?'}/${p.studioPracticeCheck.checkedMax??'?'} · not official`:'In progress'}</small></div><button data-project-open="${escapeHTML(p.id)}">Open</button></div>`).join(''):'<p class="subtext">No code projects found. Create your first project in Studio V2.</p>';$('dialogContent').innerHTML=`<div class="record-list">${rows}</div>`;$('dialogFooter').innerHTML='';const cancel=document.createElement('button');cancel.className='secondary';cancel.textContent='Close';cancel.onclick=closeDialog;const create=document.createElement('button');create.className='primary';create.textContent='New project';create.onclick=()=>{closeDialog();newProject()};$('dialogFooter').append(cancel,create)}
async function loadProject(id){if(!requireAccount('Open project'))return;try{status('Loading project…');const doc=await projectsRef().doc(id).get();if(!doc.exists)throw Error('Project does not exist.');const project={id,...doc.data()};if(project.projectType==='wireframe')throw Error('This is a Wireframe project. Open it in the original G8Code app.');if(state.dirty&&!await confirmAction('Unsaved changes will be replaced. Open this project?','Open project'))return;state.project=project;state.projectId=id;state.lastPracticeCheck=project.studioPracticeCheck||null;state.lastAutoResult=null;state.code=normalizeProject(project);state.previewPage=state.code.activeHtmlPage;state.lang='html';title(project.name);switchFile('html',state.code.activeHtmlPage);state.dirty=false;status('● Project loaded');renderResultQuick();closeDialog();runPreview();const linkedPeta=String(STUDIO_PARAMS.get('peta')||project.petaActivityId||'');if(linkedPeta){const activity=state.given.find(a=>String(a.id)===linkedPeta);if(activity)showReferenceDock(activity);}toast('Opened '+state.name)}catch(err){status('Open failed');toast(err.message||'Cannot load project','error')}}
function currentSavePayload(){const current=state.code;const key=state.project?.selectedActivityId||'scratch';const preserve={...((state.project?.codeByActivity)||{})};preserve[key]={...clone(current),html:current.pages[current.activeHtmlPage]||'',css:current.cssFiles[current.activeCssFile]||'',js:current.jsFiles[current.activeJsFile]||''};return {projectType:'code',name:state.name||'Untitled Project',nameLower:(state.name||'Untitled Project').toLowerCase(),status:state.project?.status||'in-progress',codeByActivity:preserve,selectedActivityId:state.project?.selectedActivityId||'',activityTitle:state.project?.activityTitle||'',petaActivityId:state.project?.petaActivityId||'',petaActivityTitle:state.project?.petaActivityTitle||'',isPetaProject:state.project?.isPetaProject===true,fileNames:{html:current.activeHtmlPage,css:current.activeCssFile,js:current.activeJsFile},runCount:state.project?.runCount||0,...(state.lastPracticeCheck?{studioPracticeCheck:clone(state.lastPracticeCheck)}:{}),...(state.lastAutoResult?{lastResult:clone(state.lastAutoResult),status:state.lastAutoResult.passed?'passed':'checked'}:{})}}
// Studio V2 and the original G8Code app intentionally share the same project
// collection AND My Projects index/cache format. Do not create a V2-only library.
const LEGACY_PROJECT_CACHE_TTL_MS=6*60*60*1000;
function originalMyProjectsCacheKey(uid){return `studentCodeStudio.projectCache.v1.${uid}`}
function readOriginalMyProjectsCache(uid){
 try{
  const record=JSON.parse(localStorage.getItem(originalMyProjectsCacheKey(uid))||'null');
  return record&&Array.isArray(record.projects)&&Number.isFinite(Number(record.savedAt))?record:null;
 }catch{return null}
}
function publishOriginalMyProjectsCache(uid,projects){
 // Only publish a COMPLETE list. A one-project cache would hide other projects
 // for up to six hours in the original app's fast-path cache reader.
 if(!Array.isArray(projects))return false;
 try{
  const payload=JSON.stringify({savedAt:Date.now(),projects});
  if(payload.length>4000000)return false;
  localStorage.setItem(originalMyProjectsCacheKey(uid),payload);
  return true;
 }catch{return false}
}
function projectForOriginalMyProjects(project,isoDate){
 return {...project,id:String(project.id||''),updatedAt:isoDate||new Date().toISOString(),
  createdAt:project.createdAt||isoDate||new Date().toISOString()};
}
async function synchronizeOriginalMyProjects(uid, savedProject){
 const previous=readOriginalMyProjectsCache(uid);
 const isFresh=previous&&Date.now()-Number(previous.savedAt||0)<LEGACY_PROJECT_CACHE_TTL_MS;
 let projects;
 if(isFresh){
  projects=previous.projects.map(p=>({...p}));
 }else{
  // No complete trustworthy local list? Read ALL saved projects before
  // populating My Projects cache. Never replace the list with one V2 project.
  try{
   const collection=projectsRef();
   const snapshot=await collection.get({source:'server'});
   projects=(snapshot.docs||[]).map(d=>({id:d.id,...d.data()}));
  }catch(err){
   console.warn('Studio saved project, but full My Projects cache refresh is unavailable:',err);
   return false;
  }
 }
 const index=projects.findIndex(p=>String(p.id)===String(savedProject.id));
 if(index>=0)projects[index]={...projects[index],...savedProject};
 else projects.push(savedProject);
 projects.sort((a,b)=>{
  const time=x=>x?.updatedAt?.toDate?.()?.getTime?.()||Date.parse(x?.updatedAt||'')||0;
  return time(b)-time(a);
 });
 return publishOriginalMyProjectsCache(uid,projects);
}
async function invalidateLegacyProjectIndex(uid, projectId, projectName){
 try{
  // The original app reads projectIndex first when no full-list cache exists.
  // Invalidate that optional shortcut so a new V2 project cannot be omitted.
  // The canonical project document remains the source of truth.
  await profileRef().set({
   projectIndexVersion:0,
   projectIndexInvalidatedAtMs:Date.now(),
   lastProjectId:projectId,
   lastProjectName:projectName,
   lastActivityAt:firebase.firestore.FieldValue.serverTimestamp(),
  },{merge:true});
  return true;
 }catch(err){console.warn('Original My Projects index invalidation unavailable:',err);return false}
}
async function saveProject({quiet=false}={}){
 title($('projectTitle').value.trim()||state.name);
 if(state.guest){
  safeLocalDraft();state.dirty=false;status('● Saved in this tab only');
  if(!quiet)toast('Guest draft saved locally only. Sign in to show it in My Projects.');
  return false;
 }
 if(!state.auth||!state.profile){toast('Student account must be verified before saving to My Projects.','error');return false}
 if(state.saving){if(!quiet)toast('Project save already in progress.');return false}
 state.saving=true;
 status('Saving to G8Code My Projects…');
 const uid=state.auth.uid;
 try{
  if(!state.projectId)state.projectId='studio-'+(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));
  const id=state.projectId, payload=currentSavePayload();
  const savingRevision=state.changeRevision||0;
  const ref=projectsRef().doc(id);
  const existsBefore=Boolean(state.project?.createdAt);
  const write={...payload,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),
   ...(existsBefore?{}:{createdAt:firebase.firestore.FieldValue.serverTimestamp()})};
  await ref.set(write,{mergeFields:Object.keys(write)});
  // A successful cloud write is the only time we report that My Projects owns
  // the project. Guest drafts and failed writes never reach the shared cache.
  const now=new Date().toISOString();
  const savedProject=projectForOriginalMyProjects({...state.project,...payload,id},now);
  state.project=savedProject;
  const newestId=id;
  // Edits made while the network request was pending remain unsaved.
  state.dirty=(state.changeRevision||0)!==savingRevision;
  safeLocalDraft();
  status(state.dirty?'✓ Previous changes saved · new edits pending':'✓ Saved to G8Code My Projects');
  const cacheSync=await synchronizeOriginalMyProjects(uid,savedProject);
  // Keep the authoritative Firestore profile index from serving a stale list
  // on another device. Ordinary Save preserves existing lastResult; explicit
  // Check Result may update lastResult with the requested new auto score.
  const indexSync=await invalidateLegacyProjectIndex(uid,newestId,savedProject.name);
  state.lastAutoResult=null; // Subsequent ordinary saves do not re-grade previous checked code.
  if(!cacheSync){
   status(state.dirty?'✓ Previous changes saved · new edits pending':'✓ Cloud saved · My Projects refresh pending');
   if(!quiet)toast('Project saved in G8Code. Reopen My Projects to refresh its list.');
  }else if(!quiet)toast('Saved! Your project is now in G8Code My Projects.');
  if(!indexSync)console.warn('My Projects index will revalidate on its next cloud refresh.');
  return true;
 }catch(err){
  status('Save failed · local recovery ready');safeLocalDraft();
  toast('Cloud save failed: '+(err?.message||err),'error');
  return false;
 }finally{state.saving=false}
}
let approvedStudioExit=false;
let studioLeaving=false;
function studioTargetLabel(route){return ({home:'Student Homepage',projects:'My Projects',activities:'Activities',lessons:'Lessons',explorer:'Code Explorer',logout:'Logout'})[route]||route}
function clearUnsavedStudioRecovery(){
 try { sessionStorage.removeItem(state.guest?DRAFT:`${DRAFT}.${state.auth?.uid||'auth'}`) } catch {}
}
async function goToStudioDestination(route){
 if(!['home','projects','activities','lessons','explorer','logout'].includes(route)||studioLeaving)return;
 $('navMenu').classList.add('hidden');$('menuBtn').setAttribute('aria-expanded','false');
 const label=studioTargetLabel(route);
 // Preserve the current editor if the user cancels. Confirm even when autosave
 // already completed, as explicitly requested for every Go to Page option.
 openDialog('Save before leaving?', `<p>You are going to <strong>${escapeHTML(label)}</strong>.</p><p class="subtext">Would you like to save your current code first?</p><p id="studioLeaveFeedback" class="subtext" role="status">${state.dirty?'● Unsaved edits detected.':'● Current code has no pending edits.'}</p>`, [
  {label:'Cancel · Stay Here',action:()=>{closeDialog();$('dialog').classList.remove('studio-leave-dialog')}},
  {label:"Don't Save & Continue",action:()=>{closeDialog();$('dialog').classList.remove('studio-leave-dialog');clearUnsavedStudioRecovery();finishStudioNavigation(route)}},
  {label:'Save & Continue',kind:'primary',action:async()=>{
    if(studioLeaving)return;
    const footer=$('dialogFooter');const buttons=[...footer.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
    const feedback=$('studioLeaveFeedback');if(feedback)feedback.textContent='Saving your work…';
    let success=false;
    try{
      if(state.collab&&!liveCollab?.canEdit()){
        // A view-only participant does not own the host document.
        success=true;
      }else if(state.guest){
        safeLocalDraft();state.dirty=false;status('✓ Guest draft saved in this tab');success=true;
      }else if(!state.auth||!state.profile){
        throw Error('Student account is not verified; please sign in or choose Don’t Save.');
      }else{
        // Avoid counting an in-flight autosave as a successful manual save.
        for(let i=0;state.saving&&i<100;i++) await new Promise(r=>setTimeout(r,100));
        if(state.saving)throw Error('The current save is still processing. Please try again.');
        success=(!state.dirty&&!!state.projectId)||await saveProject({quiet:true});
        if(success&&state.dirty)success=await saveProject({quiet:true});
        success=success&&!state.dirty;
      }
      if(!success)throw Error('Could not save all changes. Your work remains in the editor.');
      closeDialog();$('dialog').classList.remove('studio-leave-dialog');
      await finishStudioNavigation(route);
    }catch(err){if(feedback)feedback.textContent=err?.message||'Save failed. Stay in Studio or choose Don’t Save.';toast(err?.message||'Unable to save.','error');}
    finally{if(!studioLeaving)buttons.forEach(b=>b.disabled=false)}
  }}
 ]);
 $('dialog').classList.add('studio-leave-dialog');
}
async function finishStudioNavigation(route){
 if(studioLeaving)return;
 studioLeaving=true;
 try {
   // Don't leave a stale signed-in account displayed after Logout.
   if(route==='logout' && auth?.currentUser){
     await auth.signOut();
     try { localStorage.removeItem('studentCodeStudio.lastStudentSession.v1') } catch {}
   }
   // This is a one-time message consumed by the main SPA after session recovery.
   sessionStorage.setItem(STUDIO_ROUTE_KEY,JSON.stringify({route,uid:route==='logout'?'':state.auth?.uid||'',at:Date.now()}));
   approvedStudioExit=true;
   window.location.assign('index.html');
 }catch(err){studioLeaving=false;approvedStudioExit=false;toast('Navigation could not continue: '+(err?.message||err),'error')}
}
function restoreStudentRecovery(uid){try{const draft=JSON.parse(sessionStorage.getItem(`${DRAFT}.${uid}`)||'null');if(!draft?.dirty||!draft.code||Date.now()-Number(draft.updated||0)>24*60*60*1000)return;state.projectId=draft.projectId||'';state.project=null;state.code=normalizeCode(draft.code);state.lastPracticeCheck=draft.practiceCheck||null;title(draft.name||'Recovered draft');state.previewPage=state.code.activeHtmlPage;switchFile('html',state.code.activeHtmlPage);state.dirty=true;status('● Recovered unsaved work · save to cloud');runPreview();toast('Recovered an unsaved draft from this browser tab. Save it when ready.')}catch(e){console.warn('Recovery skipped',e)}}
function renderResultQuick(){const r=state.project?.lastResult;$('resultQuick').textContent=r?`Score: ${Number(r.score||0)}/${Number(r.possible||0)}`:'No recorded score loaded'}
async function newProject(){if(state.collab){toast('Leave live collaboration before starting another project.','error');return;}if(state.dirty&&!await confirmAction('Create a new project and replace the current unsaved work?','Create new'))return;state.project=null;state.projectId='';state.lastPracticeCheck=null;state.lastAutoResult=null;state.code=clone(START);state.previewPage='index.html';title('Untitled Webpage');state.lang='html';switchFile('html','index.html');state.dirty=false;status('● New draft · not saved');renderResultQuick();runPreview()}
function makeNativeZip(files){const enc=new TextEncoder();const local=[],central=[];let offset=0;const crcTable=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;crcTable[n]=c>>>0}const crc32=bytes=>{let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0};for(const [name,source] of Object.entries(files)){const nb=enc.encode(name),data=enc.encode(String(source)),crc=crc32(data);if(nb.length>65535)throw Error('File name too long');const a=new Uint8Array(30+nb.length),av=new DataView(a.buffer);av.setUint32(0,0x04034b50,true);av.setUint16(4,20,true);av.setUint16(6,0x0800,true);av.setUint16(8,0,true);av.setUint32(14,crc,true);av.setUint32(18,data.length,true);av.setUint32(22,data.length,true);av.setUint16(26,nb.length,true);a.set(nb,30);local.push(a,data);const c=new Uint8Array(46+nb.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(10,0,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,nb.length,true);cv.setUint32(42,offset,true);c.set(nb,46);central.push(c);offset+=a.length+data.length}if(central.length>65535)throw Error('Too many files');const centralSize=central.reduce((s,b)=>s+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,central.length,true);v.setUint16(10,central.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);return new Blob([...local,...central,end],{type:'application/zip'})}
async function exportZip(){const files=getProjectFiles();try{const blob=makeNativeZip(files);downloadBlob(blob,`${state.name.toLowerCase().replace(/[^a-z0-9-]+/g,'-')||'g8code-project'}.zip`);toast('ZIP downloaded · '+Object.keys(files).length+' files')}catch(err){toast('Export failed: '+err.message,'error')}}
function downloadBlob(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function openTools(tab='tools'){const downloadMarkup=Object.entries(getProjectFiles()).map(([n])=>`<button type="button" data-download-file="${escapeHTML(n)}">⬇ ${escapeHTML(n)}</button>`).join('');openDialog('Studio Tools',`<div class="option-grid"><button data-action="zip">⬇ Download ZIP<small>HTML, CSS, JS, and all your pages.</small></button><button data-action="checkResult">▣ Check Current Code<small>Choose rubric and check unsaved work.</small></button><button data-action="focus">⛶ Full editor<small>Fullscreen code with a one-tap switch to full preview and Exit.</small></button><button data-action="fullPreview">▣ Full preview<small>Dedicated fullscreen output and device simulator.</small></button><button data-action="font">A± Font size<small>Current: ${state.font}px</small></button><button data-action="reset">↺ Reset editor<small>Start fresh after confirmation.</small></button><button data-action="clear">⌫ Clear current tab<small>Remove code from current file.</small></button><button data-action="delete">✕ Delete current file<small>Preserves one HTML page; CSS/JS can be deleted.</small></button><button data-action="new">＋ New project<small>Start another HTML/CSS/JS workspace.</small></button><button data-action="appearance">◐ Appearance<small>Switch light/dark mode.</small></button></div><h3>Admin-enabled assistance</h3><div class="option-grid"><button data-action="codeHelper" id="toolCodeHelper">⌕ Code Helper<small>Inspect your current code and get actionable hints.</small></button><button data-action="superStudio" id="toolSuperStudio">✦ Super Studio<small>Auto Format, snapshots, restore, and focused editing tools.</small></button></div><h3>Individual file downloads</h3><div class="option-grid">${downloadMarkup}</div>`,[{label:'Done',action:closeDialog}]);
 $('toolCodeHelper').disabled=!assistantAllowed('codeHelper');
 $('toolSuperStudio').disabled=!assistantAllowed('superStudio');
 $('toolCodeHelper').title=assistantAllowed('codeHelper')?'Code Helper enabled by Admin':'Code Helper disabled by Admin';
 $('toolSuperStudio').title=assistantAllowed('superStudio')?'Super Studio enabled by Admin':'Super Studio disabled by Admin';
}
async function clearTab(){if(state.collab&&!liveCollab?.canEdit()){toast('This session is view-only.','error');return;}if(!await confirmAction(`Clear all code in ${fileName()}?`,'Clear file'))return;input.value='';changeCode();runPreview();toast('File cleared')}
async function openRubrics(){
 const current=state.project&&typeof state.project==='object'?{...state.project,id:state.projectId||state.project.id||'current'}:null;
 const projects=new Map();
 if(current)projects.set(String(current.id),current);
 for(const p of state.projects){if(p?.id&&p.projectType!=='wireframe'&&p.lastResult)projects.set(String(p.id),p)}
 openDialog('Check Current Code · Rubric Results',`<div class="current-score-intro"><strong>Check the code you are editing now</strong><p>Select a published rubric and get an automatic numerical score for every criterion using your current HTML, CSS, and JS. Saving a signed-in result updates the same G8Code project.</p></div><label class="current-rubric-label">Rubric for current code<select id="rubricSelect"><option value="">Select a rubric</option></select></label><button type="button" class="current-check-btn" id="runCurrentRubric">▶ Run & Check Current Code</button><div id="currentRubricResult" role="status"><p class="subtext">Choose a rubric and click Check Current Code. Your present unsaved edits are included.</p>${state.lastPracticeCheck?`<p class="subtext">Last automatic check: ${escapeHTML(state.lastPracticeCheck.rubricTitle||'Selected rubric')} · ${escapeHTML(state.lastPracticeCheck.checkedAt||'')}</p>`:''}</div><details class="recorded-results"><summary>Previously recorded results</summary><label>Saved project result<select id="resultProjectSelect"><option value="">Select a saved project result</option></select></label><div id="officialResult" role="status"></div></details><h3>Selected rubric criteria</h3><div id="rubricDetails"></div>`,[{label:'Close',action:closeDialog}]);
 const resultSelect=$('resultProjectSelect'),rubricSelect=$('rubricSelect'),details=$('rubricDetails'),resultNode=$('officialResult');
 if(!resultSelect||!rubricSelect)return;
 // Activity records can be published by term. Never mutate official rubrics.
 const activeTerm=studioAcademicTerm();
 const section=String(state.profile?.section||state.profile?.gradeSection||'').trim().toLowerCase();
 const options=state.activities.filter(a=>{
  if(!a||!a.id||!Array.isArray(a.criteria)||!a.criteria.length||a.published===false||a.enabled===false||['draft','hidden','unpublished'].includes(String(a.visibility||'').toLowerCase()))return false;
  const value=String(a.term||a.academicTerm||'TERM_1').trim().toLowerCase().replace(/[\s-]+/g,'_');
  const t=/^(term_?1|1|first|first_term|term1)$/.test(value)?'TERM_1':/^(term_?2|2|second|second_term|term2)$/.test(value)?'TERM_2':/^(term_?3|3|third|third_term|term3)$/.test(value)?'TERM_3':null;
  if(t!==activeTerm.term)return false;
  const audience=Array.isArray(a.sections)?a.sections:a.targetSections;
  if(section&&Array.isArray(audience)&&audience.length&&!audience.some(x=>String(x).trim().toLowerCase()===section||String(x).toLowerCase()==='all'))return false;
  return true;
 });
 rubricSelect.innerHTML='<option value="">Select a current-term rubric</option>'+options.map(a=>`<option value="${escapeHTML(a.id)}">${escapeHTML(activeTerm.label)} · ${escapeHTML(a.title||'Untitled rubric')}</option>`).join('');
 let selectedId=current?.lastResult?String(current.id):'';
 function fillProjects(){
  const rows=[...projects.values()].filter(p=>p.lastResult);
  resultSelect.innerHTML='<option value="">Choose recorded score</option>'+rows.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.name||'Untitled Project')} · ${escapeHTML(p.lastResult.score??'—')}/${escapeHTML(p.lastResult.possible??'—')}</option>`).join('');
  if(selectedId&&projects.has(selectedId)&&projects.get(selectedId).lastResult)resultSelect.value=selectedId;
  else if(rows.length){selectedId=String(rows[0].id);resultSelect.value=selectedId}
  else{selectedId='';resultSelect.value=''}
 }
 function render(){
  const p=projects.get(resultSelect.value),r=p?.lastResult||null;
  const rubric=options.find(a=>String(a.id)===rubricSelect.value)||null;
  const recordedActivity=String(r?.activityId||p?.selectedActivityId||'');
  let selectedMatch=Boolean(rubric&&recordedActivity&&String(rubric.id)===recordedActivity);
  let warning='';
  if(rubric&&r&&!selectedMatch){warning=`<p class="score-warning">The selected rubric is different from the activity associated with this saved result. The score below belongs to <strong>${escapeHTML(r.activityTitle||p.activityTitle||recordedActivity||'the recorded activity')}</strong>, not the selected rubric. Choose Run & Check Current Code to calculate a new score.</p>`}
  if(r){
   const max=Number(r.possible),score=Number(r.score),percent=Number(r.percent);
   const cleanScore=Number.isFinite(score)?score:'—',cleanMax=Number.isFinite(max)?max:'—';
   const cleanPercent=Number.isFinite(percent)?percent:max>0?Math.round(score/max*100):'—';
   resultNode.innerHTML=`<div class="score-result-card"><div class="score-caption">RECORDED RESULT · ${escapeHTML(p.name||'Saved project')}</div><div class="score-number">${escapeHTML(cleanScore)} / ${escapeHTML(cleanMax)} <small>· ${escapeHTML(cleanPercent)}%</small></div><div class="score-caption">${escapeHTML(r.activityTitle||p.activityTitle||'Project assessment')} · ${escapeHTML(r.passed===true?'Passed':r.passed===false?'Recorded':'Saved')}</div>${r.feedback?`<p>${escapeHTML(r.feedback)}</p>`:''}${Array.isArray(r.results)&&r.results.length?`<table class="rubric-table"><thead><tr><th>Scored criterion</th><th>Recorded points</th></tr></thead><tbody>${r.results.map(i=>`<tr><td><strong>${escapeHTML(i.title||'Criterion')}</strong><br><small>${escapeHTML(i.levelLabel||i.levelDescription||'')}</small></td><td>${escapeHTML(i.earned??i.score??'—')} / ${escapeHTML(i.points??i.possible??'—')}</td></tr>`).join('')}</tbody></table>`:''}</div>${warning}`;
  }else resultNode.innerHTML='<div class="score-result-card"><strong>No recorded result selected</strong><p class="subtext">A saved project score will appear here once it has been saved. Running code does not grade your project.</p></div>';
  if(rubric){
   details.innerHTML=`<div class="score-result-card"><strong>${escapeHTML(rubric.title||'Teacher rubric')}</strong><p class="subtext">${escapeHTML(rubric.description||'Published assessment criteria')}</p><table class="rubric-table"><thead><tr><th>Criterion / Description</th><th>Max points</th></tr></thead><tbody>${rubric.criteria.map(c=>`<tr><td><strong>${escapeHTML(c.title||c.name||'Criterion')}</strong><br><small>${escapeHTML(c.description||c.levelDescription||'')}</small>${c.levels&&typeof c.levels==='object'?`<div class="rubric-levels">${Object.entries(c.levels).map(([key,value])=>`<div><b>${escapeHTML(value?.label||key.replace(/([A-Z])/g,' $1'))} · ${escapeHTML(value?.points??'—')} pts</b><span>${escapeHTML(value?.description||'')}</span></div>`).join('')}</div>`:''}</td><td>${escapeHTML(c.points??c.maxPoints??0)}</td></tr>`).join('')}</tbody></table></div>`;
  }else if(r&&Array.isArray(r.results)&&r.results.length){
   details.innerHTML='<p class="subtext">Select a published rubric to view its current criteria. The recorded score breakdown is shown above.</p>';
  }else details.innerHTML='<p class="subtext">Choose a published rubric to see its criteria and point values.</p>';
 }
 fillProjects();
 const defaultRubric=String(current?.lastResult?.activityId||current?.selectedActivityId||'');
 if(options.some(a=>String(a.id)===defaultRubric))rubricSelect.value=defaultRubric;
 resultSelect.addEventListener('change',()=>{
   const p=projects.get(resultSelect.value);
   const id=String(p?.lastResult?.activityId||p?.selectedActivityId||'');
   rubricSelect.value=options.some(a=>String(a.id)===id)?id:'';
   render();
  });rubricSelect.addEventListener('change',()=>{$('currentRubricResult').innerHTML='<p class="subtext">Rubric changed. Check Current Code to score your latest edits.</p>';render()});
 $('runCurrentRubric').addEventListener('click',async ()=>{
  const selected=options.find(a=>String(a.id)===rubricSelect.value);
  if(!selected){toast('Select a rubric first.','error');rubricSelect.focus();return;}
  runPreview();
  const assessment=scoreCurrentProjectAgainstRubric(selected);
  $('currentRubricResult').innerHTML=assessment.html;
  state.lastPracticeCheck=assessment.record;
  state.lastAutoResult=assessment.record;
  // Link the selected rubric to the saved code snapshot using the original
  // codeByActivity schema, using the OG lastResult format when the student requests Check Result.
  state.project={...(state.project||{}),selectedActivityId:String(selected.id),activityTitle:String(selected.title||'Rubric'),lastResult:assessment.record,status:assessment.record.passed?'passed':'checked'};
  setDirty();
  if(!state.guest && state.auth && state.profile){
   const saved=await saveProject({quiet:true});
   if(saved){renderResultQuick();toast('Automatic rubric score saved to the same G8Code project and available in My Projects.');}
   else toast('Automatic result is visible locally, but cloud save failed. Save again to sync My Projects.','error');
  }else{safeLocalDraft();toast('Guest result calculated locally. Sign in to save the result to My Projects.');}
 });render();
 if(!state.guest&&state.profile&&db){
  try{
   const snap=await projectsRef().limit(70).get();
   // Dialog might have been closed or replaced while data was loading.
   if($('resultProjectSelect')!==resultSelect)return;
   for(const d of snap.docs){const project={id:d.id,...d.data()};if(project.projectType!=='wireframe'&&project.lastResult)projects.set(String(d.id),project)}
   fillProjects();render();
  }catch(err){if($('resultProjectSelect')===resultSelect)toast('Could not refresh saved scores. Showing available results.','error')}
 }
}

function studioAcademicTerm(){
 const defaults={mode:'automatic',term1Start:'06-01',term2Start:'09-09',term3Start:'01-04',manualTerm:'TERM_1'};
 let local={};try{local=JSON.parse(localStorage.getItem('studentCodeStudio.academicTermSettings.v1')||'{}')}catch{}
 const safe={...defaults,...local,...(state.root.academicTermSettings||{})};
 let active=String(safe.manualTerm||'TERM_1');if(safe.mode!=='manual'){
  const now=new Date();const dates=[];
  for(const [term,key] of [['TERM_1','term1Start'],['TERM_2','term2Start'],['TERM_3','term3Start']]){
   const [mm,dd]=String(safe[key]||defaults[key]).split('-').map(Number);
   for(const yy of [now.getFullYear()-1,now.getFullYear(),now.getFullYear()+1]){const at=new Date(yy,mm-1,dd);if(at<=now)dates.push({term,at})}
  }
  dates.sort((a,b)=>b.at-a.at);active=dates[0]?.term||'TERM_1';
 }
 return {term:active,libraryTerm:active==='TERM_2'?'term2':active==='TERM_3'?'term3':'term1',label:active.replace('_',' ')};
}
function isCurrentPeta(a){
 if(!a||typeof a!=='object'||a.published===false||['draft','hidden'].includes(String(a.visibility||'').toLowerCase()))return false;
 if(!(a.isPeta===true||a.peta===true||String(a.activityType||'').toLowerCase()==='peta')||a.isQuiz===true)return false;
 const expected=studioAcademicTerm();const itemTerm=String(a.term||'term1').toLowerCase().replaceAll('-','_');
 if(itemTerm!==expected.libraryTerm&&itemTerm!==expected.term.toLowerCase())return false;
 const audience=String(a.audienceSection||a.section||'all').trim().toLowerCase();
 return audience==='all'||(!state.guest&&Boolean(state.profile?.section)&&audience===String(state.profile.section).trim().toLowerCase());
}
function studioAttachmentType(file){const kind=String(file.materialType||file.type||'').toLowerCase();if(['image','pdf'].includes(kind))return kind;const check=String(file.fileName||file.previewUrl||file.openUrl||file.url||'').split('?')[0];if(/\.pdf$/i.test(check))return 'pdf';if(/\.(png|jpe?g|gif|webp|bmp)$/i.test(check))return 'image';return 'link'}
function studioPetaAttachments(activity){const raw=Array.isArray(activity.attachments)&&activity.attachments.length?activity.attachments:[activity];return raw.map((file,index)=>{
 const rawLink=String(file.openUrl||file.previewUrl||file.url||'');const fileId=String(file.fileId||rawLink.match(/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1]||rawLink.match(/[?&]id=([\w-]+)/)?.[1]||'').match(/^[\w-]{8,150}$/)?.[0]||'';
 const type=studioAttachmentType(file);
 let url=String(file.previewUrl||file.fileUrl||file.url||file.openUrl||'').trim();
 if(fileId&&(!url||(/drive\.google\.com\/file\/d\//.test(url)&&type==='image'))){url=type==='pdf'?`https://drive.google.com/file/d/${fileId}/preview`:`https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`}
 if(fileId&&type==='pdf'&&/drive\.google\.com\/file\/d\//.test(url)&&!/\/preview/.test(url))url=`https://drive.google.com/file/d/${fileId}/preview`;
 return {index,type,url:/^https:\/\//i.test(url)?url:'',label:String(file.fileName||file.name||`Reference ${index+1}`).slice(0,150)};
 }).filter(v=>Boolean(v.url));}
// Studio V2.18 — pinned references: explicit gestures only, zero idle motion.
// These gestures are local UI only: no Firestore/Realtime Database writes.
const studioPetaViewer={activity:null,attachments:[],index:0,zoom:100,panX:0,panY:0,fit:1,scale:1,width:720,height:900,pdfInteract:false};
let studioPetaCleanup=null;
function renderPinnedPeta(){
 if(studioPetaCleanup){studioPetaCleanup();studioPetaCleanup=null;}
 const viewer=studioPetaViewer,content=$('referenceDockContent'),items=viewer.attachments;
 const a=items[viewer.index]||null;
 const title=a?`${viewer.index+1} / ${items.length} · ${a.label}`:'Instructions';
 const toolbar=`<div class="studio-peta-tools"><button type="button" data-peta-nav="prev" ${viewer.index<=0?'disabled':''} title="Previous reference" aria-label="Previous reference">◀</button><strong title="${escapeHTML(title)}">${escapeHTML(title)}</strong><button type="button" data-peta-nav="next" ${viewer.index>=items.length-1?'disabled':''} title="Next reference" aria-label="Next reference">▶</button></div>`;
 const controls=a?`<div class="studio-peta-zoom" role="toolbar" aria-label="Pinned reference zoom"><button type="button" data-peta-zoom="-" title="Zoom out" aria-label="Zoom out">−</button><input type="range" min="10" max="1000" step="10" value="${viewer.zoom}" id="petaZoomSlider" aria-label="Reference zoom 10 to 1000 percent"><output id="petaZoomValue" for="petaZoomSlider">${viewer.zoom}%</output><button type="button" data-peta-zoom="+" title="Zoom in" aria-label="Zoom in">＋</button><button type="button" data-peta-zoom="fit" title="Fit reference to this window">Fit</button>${a.type==='pdf'?`<button type="button" data-peta-pdf-action="interact" title="Switch between panning and built-in PDF controls" aria-pressed="false">PDF tools</button><a class="studio-peta-open" href="${escapeHTML(a.url)}" target="_blank" rel="noopener noreferrer" title="Open full PDF in new tab" aria-label="Open PDF in new tab">↗</a>`:''}</div>`:'';
 // A transform-based stage stays entirely within this viewport.  Images use
 // their actual natural dimensions, avoiding a fake 720x900 box/cropping.
 const media=a?`<div class="studio-peta-viewer" id="petaMediaViewport" tabindex="0" aria-label="Reference canvas. Drag to move, pinch to zoom, or use arrow keys to pan."><div class="studio-peta-scale-stage" id="petaScaleStage" style="width:${viewer.width}px;height:${viewer.height}px">${a.type==='image'?`<img class="studio-peta-image" id="petaReferenceImage" alt="${escapeHTML(a.label)}" src="${escapeHTML(a.url)}" draggable="false">`:a.type==='pdf'?`<iframe title="${escapeHTML(a.label)}" loading="lazy" referrerpolicy="no-referrer" src="${escapeHTML(a.url)}"></iframe>`:`<div class="studio-peta-unsupported">Open this reference in another tab: <a href="${escapeHTML(a.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(a.label)}</a></div>`}</div></div>`:'';
 content.innerHTML=`${toolbar}${controls}${media}<details class="studio-peta-instructions"><summary>Activity instructions</summary><p>${escapeHTML(getActivityText(viewer.activity||{})).replaceAll('\n','<br>')}</p></details>`;
 content.querySelectorAll('[data-peta-nav]').forEach(btn=>btn.onclick=()=>{viewer.index=clamp(viewer.index+(btn.dataset.petaNav==='next'?1:-1),0,items.length-1);viewer.zoom=100;viewer.pdfInteract=false;renderPinnedPeta()});
 if(!a)return;
 const viewport=content.querySelector('#petaMediaViewport');
 const stage=content.querySelector('#petaScaleStage');
 const range=content.querySelector('#petaZoomSlider');
 const valueLabel=content.querySelector('#petaZoomValue');
 const pdfButton=content.querySelector('[data-peta-pdf-action="interact"]');
 const image=content.querySelector('#petaReferenceImage');
 viewer.width=a.type==='image'?720:720;viewer.height=900;
 viewer.pdfInteract=false;
 let active=true,pinch=null,drag=null;
 let lastViewportWidth=0,lastViewportHeight=0;
 const pointers=new Map();
 const dims=()=>({w:Math.max(1,viewport.clientWidth),h:Math.max(1,viewport.clientHeight)});
 const updateControls=()=>{range.value=String(viewer.zoom);valueLabel.textContent=Math.round(viewer.zoom)+'%';};
 const restrictPan=()=>{
  const {w,h}=dims(),scaledW=viewer.width*viewer.scale,scaledH=viewer.height*viewer.scale;
  const margin=6;
  viewer.panX=scaledW<=w-2*margin?(w-scaledW)/2:clamp(viewer.panX,w-scaledW-margin,margin);
  viewer.panY=scaledH<=h-2*margin?(h-scaledH)/2:clamp(viewer.panY,h-scaledH-margin,margin);
 };
 const paint=()=>{
  if(!active)return;
  restrictPan();
  stage.style.width=viewer.width+'px';stage.style.height=viewer.height+'px';
  stage.style.transform=`translate3d(${viewer.panX}px, ${viewer.panY}px, 0) scale(${viewer.scale})`;
  viewport.classList.toggle('is-zoomed',viewer.zoom>100);
  updateControls();
 };
 const calcFit=()=>{const {w,h}=dims();viewer.fit=Math.max(.01,Math.min((w-12)/viewer.width,(h-12)/viewer.height));};
 const align=(reset=false)=>{
  const prev=viewer.scale||1;
  const {w,h}=dims();
  const centerX=(w/2-viewer.panX)/prev,centerY=(h/2-viewer.panY)/prev;
  calcFit();viewer.scale=viewer.fit*viewer.zoom/100;
  if(reset){viewer.panX=(w-viewer.width*viewer.scale)/2;viewer.panY=(h-viewer.height*viewer.scale)/2;}
  else{viewer.panX=w/2-centerX*viewer.scale;viewer.panY=h/2-centerY*viewer.scale;}
  paint();
 };
 const setZoom=(next,x,y,reset=false)=>{
  const n=clamp(Math.round(Number(next)||100),10,1000);
  if(reset){viewer.zoom=n;align(true);return;}
  const rect=viewport.getBoundingClientRect();
  const ax=Number.isFinite(x)?x-rect.left:viewport.clientWidth/2;
  const ay=Number.isFinite(y)?y-rect.top:viewport.clientHeight/2;
  const oldScale=viewer.scale||1;
  const stageX=(ax-viewer.panX)/oldScale,stageY=(ay-viewer.panY)/oldScale;
  viewer.zoom=n;viewer.scale=viewer.fit*viewer.zoom/100;
  viewer.panX=ax-stageX*viewer.scale;viewer.panY=ay-stageY*viewer.scale;
  paint();
 };
 const imageLoaded=()=>{
  if(!active||!image.naturalWidth||!image.naturalHeight)return;
  viewer.width=image.naturalWidth;viewer.height=image.naturalHeight;
  align(true);
 };
 if(image){image.addEventListener('load',imageLoaded);if(image.complete&&image.naturalWidth)imageLoaded();image.addEventListener('error',()=>{if(!active)return;viewport.classList.add('load-error');});}
 const pdfMode=()=>{
  viewport.classList.toggle('pdf-interact',viewer.pdfInteract);
  if(pdfButton){pdfButton.setAttribute('aria-pressed',String(viewer.pdfInteract));pdfButton.textContent=viewer.pdfInteract?'Pan view':'PDF tools';}
 };
 if(pdfButton)pdfButton.onclick=()=>{viewer.pdfInteract=!viewer.pdfInteract;pdfMode();};
 content.querySelectorAll('[data-peta-zoom]').forEach(btn=>btn.onclick=()=>{
  if(btn.dataset.petaZoom==='fit')setZoom(100,undefined,undefined,true);
  else setZoom(viewer.zoom+(btn.dataset.petaZoom==='+'?25:-25));
 });
 range.oninput=e=>setZoom(e.target.value);
 viewport.addEventListener('wheel',e=>{
  if(viewer.pdfInteract)return;
  e.preventDefault();
  if(e.ctrlKey||e.metaKey){setZoom(viewer.zoom+(e.deltaY<0?25:-25),e.clientX,e.clientY);return;}
  // Wheel navigation still works without ever showing horizontal/vertical bars.
  viewer.panX-=(e.shiftKey?e.deltaY:e.deltaX);viewer.panY-=(e.shiftKey?0:e.deltaY);paint();
 },{passive:false});
 viewport.addEventListener('keydown',e=>{
  if(viewer.pdfInteract)return;
  const step=e.shiftKey?100:36;
  if(e.key==='ArrowLeft')viewer.panX+=step;
  else if(e.key==='ArrowRight')viewer.panX-=step;
  else if(e.key==='ArrowUp')viewer.panY+=step;
  else if(e.key==='ArrowDown')viewer.panY-=step;
  else if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(viewer.zoom+25);return;}
  else if(e.key==='-'){e.preventDefault();setZoom(viewer.zoom-25);return;}
  else if(e.key==='0'){e.preventDefault();setZoom(100,undefined,undefined,true);return;}
  else return;
  e.preventDefault();paint();
 });
 const setPinch=()=>{
  if(pointers.size<2)return;
  const [p1,p2]=[...pointers.values()].slice(0,2),rect=viewport.getBoundingClientRect();
  const x=(p1.x+p2.x)/2-rect.left,y=(p1.y+p2.y)/2-rect.top;
  pinch={zoom:viewer.zoom,dist:Math.max(1,Math.hypot(p1.x-p2.x,p1.y-p2.y)),stageX:(x-viewer.panX)/viewer.scale,stageY:(y-viewer.panY)/viewer.scale};drag=null;
 };
 viewport.addEventListener('pointerdown',e=>{
  if(viewer.pdfInteract || (e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();viewport.focus({preventScroll:true});
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{viewport.setPointerCapture(e.pointerId)}catch{}
  if(pointers.size>=2){setPinch();}
  else{pinch=null;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,panX:viewer.panX,panY:viewer.panY};}
  viewport.classList.add('is-panning');
 });
 viewport.addEventListener('pointermove',e=>{
  if(!active||viewer.pdfInteract||!pointers.has(e.pointerId))return;
  // Only a captured, physically pressed pointer can move the reference.
  // Browsers can miss a release on window switches; ignore those stale moves.
  if(e.pointerType==='mouse'&&e.buttons===0){endPointer(e);return;}
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size>=2){
   if(!pinch)setPinch();
   const [p1,p2]=[...pointers.values()].slice(0,2),rect=viewport.getBoundingClientRect();
   const x=(p1.x+p2.x)/2-rect.left,y=(p1.y+p2.y)/2-rect.top;
   viewer.zoom=clamp(pinch.zoom*Math.hypot(p1.x-p2.x,p1.y-p2.y)/pinch.dist,10,1000);
   viewer.scale=viewer.fit*viewer.zoom/100;
   viewer.panX=x-pinch.stageX*viewer.scale;viewer.panY=y-pinch.stageY*viewer.scale;paint();
  }else if(drag){viewer.panX=drag.panX+e.clientX-drag.startX;viewer.panY=drag.panY+e.clientY-drag.startY;paint();}
  e.preventDefault();
 });
 const endPointer=e=>{
  if(!pointers.has(e.pointerId))return;
  pointers.delete(e.pointerId);
  try{if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId)}catch{}
  if(pointers.size===1){const [id,p]=[...pointers.entries()][0];pinch=null;drag={id,startX:p.x,startY:p.y,panX:viewer.panX,panY:viewer.panY};}
  else if(!pointers.size){drag=null;pinch=null;viewport.classList.remove('is-panning');}
 };
 viewport.addEventListener('pointerup',endPointer);
 viewport.addEventListener('pointercancel',endPointer);
 viewport.addEventListener('lostpointercapture',endPointer);
 // Deliberately NO mouse hover / edge animation / momentum. Idle is motionless.
 // Cancel gestures whenever the document loses focus (including app switches).
 const cancelGestures=()=>{pointers.clear();drag=null;pinch=null;viewport.classList.remove('is-panning');};
 const onVisibility=()=>{if(document.hidden)cancelGestures();};
 window.addEventListener('blur',cancelGestures);
 document.addEventListener('visibilitychange',onVisibility);
 // Only recalculate when the actual viewport size changes. This prevents
 // reflow events from re-centering an otherwise stationary reference.
 const onViewportResize=()=>{
  if(!active)return;
  const {w,h}=dims();
  if(w===lastViewportWidth&&h===lastViewportHeight)return;
  lastViewportWidth=w;lastViewportHeight=h;
  if(pointers.size)return; // No resize-based motion during active gestures.
  align(false);
 };
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(onViewportResize):null;
 if(observer)observer.observe(viewport);
 const windowResize=onViewportResize;
 window.addEventListener('resize',windowResize);
 align(true);pdfMode();
 ({w:lastViewportWidth,h:lastViewportHeight}=dims());
 studioPetaCleanup=()=>{
  active=false;cancelGestures();observer?.disconnect();
  window.removeEventListener('resize',windowResize);
  window.removeEventListener('blur',cancelGestures);
  document.removeEventListener('visibilitychange',onVisibility);
 };
}
function getActivityText(item){return String(item.instructions||item.description||item.content||item.details||'No text instructions available.').slice(0,15000)}
function showReferenceDock(a){
 const dock=$('referenceDock');
 studioPetaViewer.activity=a;studioPetaViewer.attachments=studioPetaAttachments(a);
 studioPetaViewer.index=0;studioPetaViewer.zoom=100;studioPetaViewer.pdfInteract=false;
 $('referenceDockTitle').textContent=a.title||'PETA Instructions';
 dock.classList.remove('hidden','collapsed','dock-large','dock-dragging','dock-resizing');
 dock.style.width='';dock.style.height='';dock.style.removeProperty('left');dock.style.removeProperty('top');
 dock.style.right=matchMedia('(max-width:700px)').matches?'8px':'18px';
 dock.style.bottom=matchMedia('(max-width:700px)').matches?'68px':'60px';
 renderPinnedPeta();
 toast('Pinned! Hold and drag to move the window, or drag/pinch within the reference.');
}
function installReferenceDock(){
 const dock=$('referenceDock'),handle=$('referenceDockHandle'),grip=$('referenceDockResize');
 const mobile=()=>matchMedia('(max-width:700px)').matches;
 const bounds=()=>({w:Math.max(1,innerWidth),h:Math.max(1,innerHeight)});
 const frame=()=>dock.getBoundingClientRect();
 const clampPosition=(left,top,width,height)=>{
  const {w,h}=bounds();
  return {left:clamp(left,4,Math.max(4,w-width-4)),top:clamp(top,4,Math.max(4,h-height-4))};
 };
 // Explicit top/left coordinates defeat older phone CSS right/left rules.
 const place=(left,top,width,height)=>{
  const next=clampPosition(left,top,width,height);
  dock.style.setProperty('left',next.left+'px','important');
  dock.style.setProperty('top',next.top+'px','important');
  dock.style.setProperty('right','auto','important');
  dock.style.setProperty('bottom','auto','important');
 };
 const clearPosition=()=>{
  ['left','top','right','bottom'].forEach(key=>dock.style.removeProperty(key));
  dock.style.right=mobile()?'8px':'18px';
  dock.style.bottom=mobile()?'68px':'60px';
 };
 const minWidth=()=>mobile()?180:230;
 const minHeight=()=>mobile()?170:185;
 // Resize from the TOP-LEFT grip. The opposite (right/bottom) corner
 // remains fixed: on phones the user can enlarge by pulling up and left.
 const resizeTo=(width,height,anchorRight,anchorBottom)=>{
  const {w,h}=bounds();
  const sizedW=clamp(width,minWidth(),Math.max(minWidth(),Math.min(w-8,anchorRight-4)));
  const sizedH=clamp(height,minHeight(),Math.max(minHeight(),Math.min(h-8,anchorBottom-4)));
  dock.style.width=sizedW+'px';dock.style.height=sizedH+'px';
  place(anchorRight-sizedW,anchorBottom-sizedH,sizedW,sizedH);
 };
 $('referenceDockClose').onclick=()=>{
  dock.classList.add('hidden');cancelMove();cancelResize();
  if(studioPetaCleanup){studioPetaCleanup();studioPetaCleanup=null;}
 };
 $('referenceDockMinimize').onclick=()=>{cancelMove();cancelResize();dock.classList.toggle('collapsed');};
 $('referenceDockSize').onclick=()=>{
  cancelMove();cancelResize();dock.classList.toggle('dock-large');
  dock.style.removeProperty('width');dock.style.removeProperty('height');clearPosition();
 };
 // Header: desktop click+hold drag; phone long-press (200 ms) then drag.
 // A plain touch/tap or a hovered mouse cannot reposition the window.
 let move=null;
 const cancelMove=()=>{
  if(move?.timer)clearTimeout(move.timer);
  move=null;dock.classList.remove('dock-dragging');
 };
 handle.addEventListener('pointerdown',e=>{
  if(dock.classList.contains('hidden')||e.target.closest('button')||(e.pointerType==='mouse'&&e.button!==0))return;
  cancelMove();
  const r=frame(),touch=e.pointerType!=='mouse';
  move={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top,width:r.width,height:r.height,ready:!touch,touch,timer:null};
  if(touch){
   move.timer=setTimeout(()=>{if(move&&move.id===e.pointerId){move.ready=true;move.timer=null;dock.classList.add('dock-dragging');}},200);
  }else dock.classList.add('dock-dragging');
  try{handle.setPointerCapture(e.pointerId)}catch{}
 });
 handle.addEventListener('pointermove',e=>{
  if(!move||move.id!==e.pointerId)return;
  if(e.pointerType==='mouse'&&e.buttons===0){cancelMove();return;}
  if(!move.ready){
   // Avoid a mobile accidental swipe from eventually triggering a drag.
   if(Math.hypot(e.clientX-move.x,e.clientY-move.y)>10)cancelMove();
   return;
  }
  place(move.left+e.clientX-move.x,move.top+e.clientY-move.y,move.width,move.height);
  if(e.cancelable)e.preventDefault();
 });
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>handle.addEventListener(type,e=>{if(move?.id===e.pointerId)cancelMove();}));
 // The lower-right grip works on touch and mouse (native CSS resize handles
 // aren't usable on phones). It changes the panel, not the document zoom.
 let resizing=null;
 const cancelResize=()=>{resizing=null;dock.classList.remove('dock-resizing');};
 if(grip){
  grip.addEventListener('pointerdown',e=>{
   if(dock.classList.contains('hidden')||dock.classList.contains('collapsed')||(e.pointerType==='mouse'&&e.button!==0))return;
   cancelMove();cancelResize();
   const r=frame();
   resizing={id:e.pointerId,x:e.clientX,y:e.clientY,width:r.width,height:r.height,right:r.right,bottom:r.bottom};
   dock.classList.add('dock-resizing');
   try{grip.setPointerCapture(e.pointerId)}catch{}
   e.preventDefault();
  });
  grip.addEventListener('pointermove',e=>{
   if(!resizing||resizing.id!==e.pointerId)return;
   if(e.pointerType==='mouse'&&e.buttons===0){cancelResize();return;}
   resizeTo(resizing.width-(e.clientX-resizing.x),resizing.height-(e.clientY-resizing.y),resizing.right,resizing.bottom);
   e.preventDefault();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>grip.addEventListener(type,e=>{if(resizing?.id===e.pointerId)cancelResize();}));
  grip.addEventListener('keydown',e=>{
   if(dock.classList.contains('collapsed'))return;
   const step=e.shiftKey?40:16,r=frame();
   if(e.key==='ArrowLeft')resizeTo(r.width+step,r.height,r.right,r.bottom);
   else if(e.key==='ArrowRight')resizeTo(r.width-step,r.height,r.right,r.bottom);
   else if(e.key==='ArrowUp')resizeTo(r.width,r.height+step,r.right,r.bottom);
   else if(e.key==='ArrowDown')resizeTo(r.width,r.height-step,r.right,r.bottom);
   else return;
   e.preventDefault();
  });
 }
 window.addEventListener('blur',()=>{cancelMove();cancelResize();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelMove();cancelResize();}});
 window.addEventListener('resize',()=>{
  if(dock.classList.contains('hidden'))return;
  cancelMove();cancelResize();
  const r=frame(),{w,h}=bounds();
  if(dock.style.width&&r.width>w-8){dock.style.width=Math.max(minWidth(),w-8)+'px';}
  if(dock.style.height&&r.height>h-8){dock.style.height=Math.max(minHeight(),h-8)+'px';}
  const r2=frame();
  if(dock.style.left||dock.style.top)place(r2.left,r2.top,r2.width,r2.height);
 });
}
function openActivities(){const term=studioAcademicTerm();const tasks=state.given.filter(isCurrentPeta).sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999));openDialog('Current-Term PETAs',`<p class="subtext"><strong>${escapeHTML(term.label)}</strong> · Showing only published, assigned Performance Tasks for the current term. Other terms and non-PETA activities are hidden.</p><div class="record-list">${tasks.length?tasks.map(a=>`<div class="record-row"><div class="record-title"><strong>${escapeHTML(a.title||'PETA Activity')}</strong><small>${escapeHTML(a.term||term.libraryTerm)} · ${studioPetaAttachments(a).length} reference(s)</small></div><button data-activity="${escapeHTML(a.id)}">Open PETA</button></div>`).join(''):'<p class="subtext">No published PETAs found for this term and section. Open the main G8Code app if you expect an activity.</p>'}</div>`,[{label:'Check rubric',action:openRubrics},{label:'Close',action:closeDialog}])}
function openActivity(id){const a=state.given.find(i=>String(i.id)===id&&isCurrentPeta(i));if(!a){toast('This PETA is not available for the current term.','error');return;}const attachments=studioPetaAttachments(a);openDialog(a.title||'PETA instructions',`<div class="instruction-sheet"><p>${escapeHTML(getActivityText(a)).replaceAll('\n','<br>')}</p><p class="subtext">${attachments.length} PDF / image / link reference(s). Pin to view within the editor and zoom from 10% to 1000%.</p></div>`,[{label:'Back to PETAs',action:openActivities},{label:'Pin & View',kind:'primary',action:()=>{showReferenceDock(a);closeDialog()}},{label:'Use for current project',action:()=>{state.project={...(state.project||{}),petaActivityId:String(a.id),petaActivityTitle:a.title||'',isPetaProject:true};setDirty();showReferenceDock(a);closeDialog();toast('Current-term PETA linked to the draft. Save to keep it.')}}],'PETA · '+studioAcademicTerm().label)}
function openPreviewLarge(){enterStudioFullscreen('preview')}
function refreshSettings(){const p=state.root?.studentAssistanceSettings||{};const enabled=p.enabled!==false;
 $('autoRun').disabled=enabled&&p.autoRunControl===false;
 $('openCollab').disabled=!enabled||(p.collaboration!==true&&p.codeTransfer===false);
 $('openCollab').title=!enabled?'Admin assistance settings are not available or are disabled':p.collaboration!==true?'Live collaboration disabled by Admin':'Collaborate';
}
function studentKey(){const raw=String(state.profile?.studentId||state.profile?.studentIdNormalized||'');return raw.toLowerCase().replace(/[^a-z0-9]/g,'')}
function inboxRef(id=studentKey()){return db.collection(rootPath()[0]).doc(rootPath()[1]).collection('codeInboxesByStudentId').doc(id).collection('items')}
function transferRef(id){return db.collection(rootPath()[0]).doc(rootPath()[1]).collection('codeTransfers').doc(id)}
function generateCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>alphabet[b%alphabet.length]).join('')}
// V2.15: OG-compatible WebRTC signaling + direct CRDT content/cursor transport.
// No Firestore/RTDB character updates, cursor updates, or approval queue.
const COLLAB_COLORS=['#2563eb','#e34f67','#148a65','#9454db','#d87517','#0891b2','#bd408b','#5b62d6'];
let collabCursorTimer=null,liveCollab=null;
function collabColor(uid){let h=0;for(const ch of String(uid||'student'))h=(h*31+ch.charCodeAt(0))|0;return COLLAB_COLORS[(h>>>0)%COLLAB_COLORS.length]}
function collabName(){return String(state.profile?.name||[state.profile?.firstName,state.profile?.lastName].filter(Boolean).join(' ')||state.profile?.studentId||'Student').trim().slice(0,64)}
function collabMember(uid,name,role){return {uid,name,role,color:collabColor(uid),studentId:String(state.profile?.studentId||''),online:true,lastSeenAt:Date.now()}}
function collabMembersAllowed(){return state.root?.studentAssistanceSettings?.enabled!==false&&state.root?.studentAssistanceSettings?.collaborationMembers!==false}
function collabAdminCanEdit(){const s=state.root?.studentAssistanceSettings||{};return s.enabled!==false&&s.collaboration!==false&&s.collaborationEdit!==false}
function collabMemberList(){const c=state.collab;if(!c)return [];const list=new Map(),host=c.hostUid||c.sessionData?.hostUid;
  if(host)list.set(host,{uid:host,name:c.sessionData?.hostName||'Host',role:'host',color:collabColor(host),online:true});
  for(const [uid,m] of Object.entries(c.peers||{})){if(m&&m.online!==false)list.set(uid,{...(list.get(uid)||{}),...m,uid,color:collabColor(uid),role:uid===host?'host':'member'})}
  if(state.auth?.uid)list.set(state.auth.uid,{...(list.get(state.auth.uid)||{}),uid:state.auth.uid,name:collabName(),role:c.isHost?'host':'member',online:true,color:collabColor(state.auth.uid)});
  return [...list.values()].filter(x=>x.online!==false)
}
function collabMemberMarkup(){const c=state.collab;if(!c)return '';const members=collabMemberList();return `<div class="studio-collab-summary"><div><span class="studio-collab-live-dot"></span><strong>${escapeHTML(c.isHost?'You are the host':'You joined a project')}</strong><small>${escapeHTML(c.sessionData?.projectName||state.name)} · ${members.length} online</small></div><span class="studio-collab-session-code">${escapeHTML(c.code)}</span></div><div class="studio-collab-access-status"><b>Access:</b> ${escapeHTML(c.access==='view'?'View only':'Can edit together')} · <span>${escapeHTML(c.liveStatus||'Connecting direct peers…')}</span></div><div class="studio-collab-members" aria-label="Connected collaborators">${members.map(m=>{const me=m.uid===state.auth?.uid,cur=m.cursor||{};return `<div class="studio-collab-member" style="--collab-color:${collabColor(m.uid)}"><span class="studio-collab-avatar">${escapeHTML(String(m.name||'?').trim()[0]||'?')}</span><span class="studio-collab-member-text"><strong>${escapeHTML(m.name||'Student')}${me?' <em>(You)</em>':''}</strong><small>${m.role==='host'?'Host':'Member'}${cur.fileName?' · Editing '+escapeHTML(cur.fileName):' · Connected'}</small></span>${c.isHost&&!me&&m.role!=='host'?`<button type="button" class="studio-collab-kick" data-collab-kick="${escapeHTML(m.uid)}" aria-label="Remove ${escapeHTML(m.name||'member')}" title="Remove this member from the live session">Kick</button>`:'<span class="studio-collab-presence-dot" aria-label="Online"></span>'}</div>`}).join('')}</div><p class="studio-collab-hint">Live typing and named cursors use direct WebRTC + CRDT. Firestore is only used to find the room and exchange connection details, not for keystrokes.</p>`}
function renderCollabPresence(){const c=state.collab,show=Boolean(c&&collabMembersAllowed()),count=show?collabMemberList().length:0;for(const id of ['studioCollabPill','focusMembers']){const el=$(id);if(!el)continue;el.classList.toggle('hidden',!show);if(show){el.textContent=`👥 ${count} online`;el.title=`${count} classmates in room ${c.code}`}}const badge=$('studioCollabMobileCount');if(badge){badge.classList.toggle('hidden',!show);badge.textContent=String(count)}const roster=$('studioCollabRoster');if(roster&&show)roster.innerHTML=collabMemberMarkup();renderCollabCursors()}
function collabTextSignature(value){let n=2166136261;for(let i=0;i<value.length;i++){n^=value.charCodeAt(i);n=Math.imul(n,16777619)}return (n>>>0).toString(36)+':'+value.length}
function collabOwnCursor(){return {uid:state.auth?.uid||'',name:collabName(),lang:state.lang,fileName:fileName(),position:input.selectionStart,signature:collabTextSignature(input.value),updatedAtMs:Date.now(),editingAtMs:state.unsavedSince||0}}
function renderCollabCursors(){const layer=$('studioCollabCursorLayer'),c=state.collab;if(!layer)return;layer.replaceChildren();if(!c||!collabMembersAllowed()||document.body.dataset.immersive==='preview')return;const sig=collabTextSignature(input.value),now=Date.now(),ed=$('editorArea'),style=getComputedStyle(input),lh=parseFloat(style.lineHeight)||22,canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;ctx.font=style.font;for(const m of collabMemberList()){if(m.uid===state.auth?.uid)continue;const cur=m.cursor;if(!cur||cur.fileName!==fileName()||(cur.lang||cur.language)!==state.lang||now-Number(cur.updatedAtMs||cur.updatedAt||0)>25000)continue;if(cur.signature&&cur.signature!==sig)continue;const position=Number(cur.position||0),before=input.value.slice(0,Math.max(0,Math.min(input.value.length,position))),lines=before.split('\n'),last=lines.at(-1).replace(/\t/g,'  '),x=input.offsetLeft+parseFloat(style.paddingLeft||0)+ctx.measureText(last).width-input.scrollLeft,y=input.offsetTop+parseFloat(style.paddingTop||0)+(lines.length-1)*lh-input.scrollTop;if(x<input.offsetLeft||x>ed.clientWidth-4||y<0||y>ed.clientHeight-lh)continue;const dot=document.createElement('div');dot.className='studio-collab-remote-caret';dot.style.cssText=`left:${Math.round(x)}px;top:${Math.round(y)}px;height:${Math.ceil(lh)}px;--collab-color:${collabColor(m.uid)}`;const label=document.createElement('span');label.className='studio-collab-remote-name';label.textContent=m.name||'Student';if(y<23)dot.classList.add('label-below');dot.append(label);layer.append(dot)}}
function scheduleCollabCursor(){if(!state.collab||!liveCollab?.connected())return;clearTimeout(collabCursorTimer);collabCursorTimer=setTimeout(()=>liveCollab?.localCursor(),85)}
function sharedDoc(code){return db.collection(rootPath()[0]).doc(rootPath()[1]).collection('sharedSessions').doc(code)}
function ensureLiveEngine(){if(liveCollab)return liveCollab;if(!window.createStudioLiveCollab)throw Error('Live collaboration engine did not load. Refresh the page.');liveCollab=window.createStudioLiveCollab({
  uid:()=>state.auth?.uid||'',name:collabName,studentId:()=>String(state.profile?.studentId||''),color:collabColor,title:()=>state.name,code:()=>clone(state.code),getFile:(lang,name)=>String(state.code[GROUP[lang]]?.[name]||''),adminMayEdit:collabAdminCanEdit,doc:sharedDoc,
  cursorData:collabOwnCursor,
  notice:message=>{if(state.collab){state.collab.liveStatus=message;renderCollabPresence()}status(message)},
  members:(members,channels,access,ready)=>{if(!state.collab)return;state.collab.peers={...members};state.collab.access=access;state.collab.ready=ready;renderCollabPresence()},
  cursor:(uid,c)=>{if(!state.collab)return;const next={...c,lang:c.lang||c.language,updatedAtMs:Date.now()};if(state.collab.peers?.[uid])state.collab.peers[uid].cursor=next;renderCollabCursors()},
  permissions:(allowed,inSession,access,ready)=>{input.readOnly=inSession&&!allowed;$('projectTitle').disabled=inSession&&!allowed;document.body.classList.toggle('studio-collab-readonly',inSession&&!allowed);renderFiles();if(inSession&&!allowed)status(ready?'View only · host controls editing':'Connecting to live host…')},
  initialState:data=>{const blocks=data.codeByActivity||{},key=data.selectedActivityId||state.project?.selectedActivityId||'scratch',store=blocks[key]||blocks.scratch||Object.values(blocks)[0];if(store){state.code=normalizeCode(store);state.previewPage=state.code.activeHtmlPage;state.lang='html';switchFile('html',state.code.activeHtmlPage);runPreview()}},
  structuralState:data=>{const blocks=data.codeByActivity||{},store=blocks[data.selectedActivityId||'scratch']||blocks.scratch||Object.values(blocks)[0];if(store){state.code=normalizeCode(store);switchFile('html',state.code.activeHtmlPage);runPreview()}},
  remoteFile:(lang,name,text,editorName)=>{if(!GROUP[lang]||!validFileName(name,lang))return;const map=state.code[GROUP[lang]];map[name]=text;if(state.lang===lang&&fileName(lang)===name&&input.value!==text){const prior=input.value,at=input.selectionStart,end=input.selectionEnd;let prefix=0;while(prefix<Math.min(prior.length,text.length)&&prior[prefix]===text[prefix])prefix++;const delta=text.length-prior.length;input.value=text;input.setSelectionRange(Math.max(0,Math.min(text.length,at+(at>prefix?delta:0))),Math.max(0,Math.min(text.length,end+(end>prefix?delta:0))));refreshLineNumbers();refreshCursor();}if(state.autoRun)scheduleRun();safeLocalDraft();renderCollabCursors()},
  stopped:message=>{stopCollab();toast(message,'error')}
});return liveCollab}
async function leaveCollabSession(){const c=state.collab;if(!c)return;if(c.isHost)liveCollab?.terminate();const code=c.code;stopCollab();try{if(c.isHost)await sharedDoc(code).set({active:false,status:'closed'},{merge:true});else await sharedDoc(code).collection('peers').doc(state.auth.uid).set({online:false,lastSeenAt:Date.now()},{merge:true});toast(c.isHost?'Live sharing ended':'Left live collaboration')}catch(e){toast('Left locally; session status may take a moment to update.','error')}}
// OG-compatible host removal. A kick ends the CURRENT connection only:
// the classmate may manually rejoin later using the same share code.
async function kickCollabParticipant(uid){
  const session=state.collab;
  if(!session?.isHost||!state.auth?.uid||!uid||uid===state.auth.uid||uid===session.hostUid)return;
  const peer=collabMemberList().find(m=>m.uid===uid&&m.role!=='host');
  if(!peer)return;
  const name=peer.name||'this member';
  if(!await confirmAction(`Remove ${name} from this live project? They may join again later using the same code.`,'Kick Member','danger'))return;
  if(state.collab!==session||!session.isHost)return;
  try{
    await liveCollab.kick(uid);
    toast(`${name} was removed from the live session.`);
    openCollab();
  }catch(err){
    console.error('Studio live collaboration kick',err);
    toast(`Could not remove member: ${err.message||'Try again.'}`,'error');
    if(state.collab===session)openCollab();
  }
}
function stopCollab(){clearTimeout(collabCursorTimer);liveCollab?.stop();state.collab=null;input.readOnly=false;$('projectTitle').disabled=false;document.body.classList.remove('studio-collab-readonly');renderFiles();renderCollabPresence()}
function openCollab(){if(!requireAccount('Collaboration and code transfer'))return;const opts=state.root?.studentAssistanceSettings||{},enabled=opts.enabled!==false,canCollab=enabled&&opts.collaboration===true,canTransfer=enabled&&opts.codeTransfer!==false,s=state.collab;
  const access=state.collabNewAccess||'edit';const select=`<label class="studio-collab-access-label" for="studioCollabAccess"><strong>Access</strong><select id="studioCollabAccess" ${s&&!s.isHost?'disabled':''}><option value="edit" ${(s?.access||access)==='edit'?'selected':''}>Can edit together</option><option value="view" ${(s?.access||access)==='view'?'selected':''}>View only</option></select></label>`;
  const content=`${s?`<div id="studioCollabRoster">${collabMemberMarkup()}</div>${s.isHost?select:''}<div class="studio-collab-buttons"><button data-action="copyCollab">Copy join code</button><button data-action="sessionActions">Session details</button><button data-action="leave" class="secondary">${s.isHost?'Stop sharing':'Leave project'}</button></div>`:`<div class="studio-collab-host-intro"><strong>You are the host.</strong><small>Start a live session, then give the code to classmates.</small></div>${select}`}<div class="option-grid">${canCollab&&!s?'<button data-action="host">♧ Start live session<small>Share a 6-character join code.</small></button><button data-action="join">⇄ Join live project<small>Edit together or view a shared project.</small></button>':!canCollab?'<p class="subtext">Collaboration is disabled by Admin.</p>':''}${canTransfer?'<button data-action="send">➤ Send code<small>Send project files.</small></button><button data-action="inbox">✉ Received codes<small>View transferred files.</small></button>':''}</div>`;
  openDialog('Share, Join & Collaborate',content,[{label:'Close',action:closeDialog}]);}
async function createCollab(){if(!requireAccount('Live collaboration'))return;if(state.collab){toast('Leave current room first.','error');return}if(!window.RTCPeerConnection){toast('This browser cannot use WebRTC live editing.','error');return}const access=$('studioCollabAccess')?.value||state.collabNewAccess||'edit';if(access==='edit'&&!collabAdminCanEdit()){toast('Admin has disabled collaborative editing.','error');return}const code=generateCode(),uid=state.auth.uid,activityId=state.project?.selectedActivityId||'',payload={shareCode:code,active:true,hostUid:uid,hostName:collabName(),hostStudentId:state.profile?.studentId||'',projectName:state.name,access,allowEdit:access==='edit'&&collabAdminCanEdit(),transport:'webrtc-p2p',codeByActivity:{[activityId||'scratch']:clone(state.code)},selectedActivityId:activityId,contentVersion:Date.now(),createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),status:'active',members:{[uid]:collabMember(uid,collabName(),'host')}};
  try{await sharedDoc(code).set(payload);await joinCollabListeners(code,true,payload);toast('Live code ready: '+code);openCollab()}catch(e){toast('Cannot create live session: '+e.message,'error')}}
async function joinCollab(){if(!requireAccount('Live collaboration'))return;if(state.collab){toast('Leave current room first.','error');return}const code=await promptText('Join live project','','6-character join code');if(!code)return;const safe=code.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(safe)){toast('Enter a valid six-character code.','error');return}try{const snap=await sharedDoc(safe).get(),data=snap.data();if(!snap.exists||data?.active===false||data?.status==='closed')throw Error('Session not found or closed.');if(state.dirty&&!await confirmAction('Joining a live project replaces your current working code. Continue?','Join'))return;await joinCollabListeners(safe,data.hostUid===state.auth.uid,data);toast('Connecting to '+(data.hostName||'host'));openCollab()}catch(e){toast('Cannot join: '+e.message,'error')}}
async function joinCollabListeners(code,isHost,data){stopCollab();state.collab={code,isHost,hostUid:data.hostUid,access:data.allowEdit===false?'view':(data.access||'edit'),sessionData:data,peers:{...(data.members||{})},liveStatus:isHost?'Room created':'Connecting to host…',ready:isHost};renderCollabPresence();await ensureLiveEngine().start(code,isHost,data)}
async function publishCollab(){/* No Firestore writes for typing. WebRTC CRDT handles live changes. */}
function openSessionActions(){const s=state.collab;if(!s)return;openDialog('Live collaboration',`<div id="studioCollabRoster">${collabMemberMarkup()}</div>${s.isHost?`<label class="studio-collab-access-label" for="studioCollabAccess"><strong>Access</strong><select id="studioCollabAccess"><option value="edit" ${s.access==='edit'?'selected':''}>Can edit together</option><option value="view" ${s.access==='view'?'selected':''}>View only</option></select></label>`:''}<p class="subtext">Classmates' changes appear live, without a review/approval step. A direct WebRTC connection is required.</p>`,[{label:s.isHost?'Stop sharing':'Leave session',action:async()=>{closeDialog();await leaveCollabSession()}},{label:'Close',action:closeDialog}])}
async function sendCode(){if(!state.projectId){toast('Save or open a cloud project before sending code.','error');return}const id=await promptText('Send Code','','Receiver Student ID');if(!id)return;const key=id.toLowerCase().replace(/[^a-z0-9]/g,'');if(!key||key===studentKey()){toast('Enter another valid Student ID','error');return}const files=Object.entries(getProjectFiles()).slice(0,20).map(([name,content])=>({name,language:fileType(name),content,bytes:new TextEncoder().encode(content).length}));const size=files.reduce((s,f)=>s+f.bytes,0);if(size>850000){toast('Files are too large for code transfer. Download ZIP instead.','error');return}const transferId='v2-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),now=Date.now(),uid=state.auth.uid,from=state.profile||{};const payload={schemaVersion:1,senderUid:uid,senderStudentId:from.studentId||'',senderName:from.name||'Student',senderSection:from.section||'',receiverUid:'',receiverStudentId:id,receiverStudentIdAuthKey:key,projectId:state.projectId,projectName:state.name,activityId:state.project?.selectedActivityId||'',activityTitle:state.project?.activityTitle||'',fileCount:files.length,fileNames:files.map(f=>f.name),totalBytes:size,message:'Sent from G8Code Studio V2',files,createdAt:firebase.firestore.FieldValue.serverTimestamp(),createdAtMs:now};const summary={schemaVersion:1,transferId,senderUid:uid,senderStudentId:payload.senderStudentId,senderName:payload.senderName,senderSection:payload.senderSection,receiverUid:'',receiverStudentId:id,receiverStudentIdAuthKey:key,projectName:state.name,activityTitle:payload.activityTitle,fileCount:files.length,fileNames:payload.fileNames,totalBytes:size,message:payload.message,status:'unread',createdAt:firebase.firestore.FieldValue.serverTimestamp(),createdAtMs:now};try{const batch=db.batch();batch.set(transferRef(transferId),payload);batch.set(inboxRef(key).doc(transferId),summary);await batch.commit();toast('Code sent to Student ID '+id)}catch(err){toast('Code send failed: '+err.message,'error')}}
async function openInbox(){if(!studentKey()){toast('Your Student ID is unavailable. Log in through G8Code first.','error');return}openDialog('Received Code',`<p class="subtext">Loading your G8Code inbox…</p>`,[{label:'Close',action:closeDialog}]);try{const snap=await inboxRef().limit(35).get();$('dialogContent').innerHTML=`<div class="record-list">${snap.docs.length?snap.docs.map(d=>{const t=d.data();return `<div class="record-row"><div class="record-title"><strong>${escapeHTML(t.projectName||'Shared code')}</strong><small>From ${escapeHTML(t.senderName||'Student')} · ${escapeHTML(t.fileCount||0)} files</small></div><button data-inbox="${escapeHTML(d.id)}">Open</button></div>`}).join(''):'<p class="subtext">Your inbox is empty.</p>'}</div>`}catch(err){$('dialogContent').textContent='Inbox unavailable: '+err.message}}
async function viewInbox(id){try{const snap=await transferRef(id).get();if(!snap.exists)throw Error('Transfer was not found.');const transfer=snap.data();const incoming=Array.isArray(transfer.files)?transfer.files:[];openDialog(transfer.projectName||'Shared Code',`<p class="subtext">From: ${escapeHTML(transfer.senderName||'Student')} · ${incoming.length} files. Receiving these files will not overwrite existing files without asking.</p><div class="record-list">${incoming.map(f=>`<div class="record-row"><div class="record-title"><strong>${escapeHTML(f.name)}</strong><small>${escapeHTML(f.language)} · ${escapeHTML(f.bytes||0)} bytes</small></div></div>`).join('')}</div>`,[{label:'Back to inbox',action:openInbox},{label:'Import files',kind:'primary',action:async()=>{if(!await confirmAction('Import these files? Matching filenames will be replaced.','Import'))return;for(const file of incoming){const lang=fileType(file.name);if(lang&&validFileName(file.name,lang))fileMap(lang)[file.name]=String(file.content||'')}renderFiles();switchFile('html',fileName('html'));setDirty();runPreview();toast('Imported '+incoming.length+' shared files');try{await inboxRef().doc(id).set({status:'read'},{merge:true})}catch{}closeDialog()}}])}catch(e){toast(e.message,'error')}}
// V2.7: numeric, four-level, source-based rubric grading follows the original
// G8Code result schema and rubric point levels. Subjective design criteria use
// measurable proxies, so these are automated judgments, not teacher verification.
function scoreCurrentProjectAgainstRubric(rubric){
 const htmlFiles=Object.entries(state.code.pages||{}),cssFiles=Object.entries(state.code.cssFiles||{}),jsFiles=Object.entries(state.code.jsFiles||{});
 const html=htmlFiles.map(x=>x[1]).join('\n'),css=cssFiles.map(x=>x[1]).join('\n'),js=jsFiles.map(x=>x[1]).join('\n');
 const allFiles=[...htmlFiles,...cssFiles,...jsFiles];
 const parsed=htmlFiles.map(([filename,source])=>({filename,doc:new DOMParser().parseFromString(source,'text/html')}));
 const bodyText=parsed.map(p=>p.doc.body?.textContent||'').join(' ').replace(/\s+/g,' ').trim();
 const allText=(html+'\n'+css+'\n'+js).replace(/\s+/g,'');
 const htmlLower=html.toLowerCase(),cssLower=css.toLowerCase(),jsLower=js.toLowerCase(),visibleLower=bodyText.toLowerCase();
 const clamp01=x=>Math.max(0,Math.min(1,Number(x)||0));
 const labelMap={excellent:'Excellent',good:'Good',fair:'Fair',needsImprovement:'Needs Improvement'};
 const locate=(pattern,sourceFiles=allFiles)=>{
  for(const [filename,source] of sourceFiles){const re=pattern instanceof RegExp?new RegExp(pattern.source,pattern.flags.replace('g','')):new RegExp(String(pattern),'i');const match=re.exec(String(source));if(match){const at=match.index||0;const line=String(source).slice(0,at).split('\n').length;return {filename,line,excerpt:(String(source).split('\n')[line-1]||'').trim().slice(0,110)}}}return null;
 };
 const criteria=[];let score=0,possible=0;
 const noCode=!allText.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g,'').trim();
 const allTags=htmlFiles.flatMap(([filename,source])=>htmlTokens(source).filter(t=>!t.comment).map(t=>({...t,filename})));
 const tagErrors=allTags.filter(t=>t.issue);
 const domHas=selector=>parsed.some(p=>{try{return !!p.doc.querySelector(selector)}catch{return false}});
 const cssRules=(css.match(/[^{}]+\{[^{}]*\}/g)||[]).length;
 const cssProps=new Set([...css.matchAll(/(?:^|[;{\s])([a-z][\w-]*)\s*:\s*[^;{}]+/gim)].map(m=>m[1].toLowerCase()));
 const useCss=cssProps.size>0||/<style\b[^>]*>[\s\S]*?:[\s\S]*?<\/style>/i.test(html)||/\bstyle\s*=\s*["'][^"']*:/i.test(html);
 const mark=(checks,label,ok,regex,sourceFiles=allFiles,weight=1)=>checks.push({label,ok:clamp01(ok),loc:regex?locate(regex,sourceFiles):null,weight});
 for(const criterion of rubric.criteria||[]){
  const name=String(criterion.title||criterion.name||'Untitled criterion');
  const rule=String(criterion.rule||'smart_rubric').trim().toLowerCase();
  const target=String(criterion.target||'').trim();
  const levels=criterion.levels&&typeof criterion.levels==='object'?criterion.levels:{};
  const levelPoints=Object.values(levels).map(l=>Number(l?.points)).filter(Number.isFinite);
  const max=Math.max(0,Number(criterion.points)||Number(criterion.maxPoints)||Math.max(0,...levelPoints,1));
  possible+=max;
  const descriptions=Object.values(levels).map(x=>String(x?.description||'')).join(' ');
  const text=[name,criterion.description||'',target,descriptions].join(' ').toLowerCase();
  const checks=[];
  const add=(label,ok,regex,files,weight)=>mark(checks,label,ok,regex,files,weight);
  const exact=(source)=>target?String(source).toLowerCase().includes(target.toLowerCase()):false;
  switch(rule){
   case 'html_contains':add(`Required HTML: ${target||'specified text'}`,exact(html),null,htmlFiles);break;
   case 'css_contains':add(`Required CSS: ${target||'specified style'}`,exact(css),null,cssFiles);break;
   case 'js_contains':add(`Required JS: ${target||'specified code'}`,exact(js),null,jsFiles);break;
   case 'output_contains':add(`Required visible output: ${target}`,exact(bodyText),null,htmlFiles);break;
   case 'full_html_structure':{
    for(const [label,re] of [['DOCTYPE',/<!doctype\s+html/i],['html',/<html\b/i],['head',/<head\b/i],['title',/<title\b/i],['body',/<body\b/i],['closing body',/<\/body\s*>/i],['closing html',/<\/html\s*>/i]])add(label,re.test(html),re,htmlFiles);
    break;
   }
   case 'has_semantic_tags':add('Semantic HTML elements',Math.min(1,(html.match(/<(header|nav|main|section|article|aside|footer|figure)\b/gi)||[]).length/2),/<(?:header|nav|main|section|article|aside|footer|figure)\b/i,htmlFiles);break;
   case 'balanced_html_tags':add('Matching open and close HTML tags',allTags.length?1-tagErrors.length/Math.max(3,allTags.length):0,/<[a-z]/i,htmlFiles);break;
   case 'output_has_visible_text':add('Visible readable output',Math.min(1,bodyText.length/20),/<(?:p|h[1-6]|main|body)\b/i,htmlFiles);break;
   case 'has_heading':add('Heading',domHas('h1,h2,h3,h4,h5,h6'),/<h[1-6]\b/i,htmlFiles);break;
   case 'has_paragraph':add('Paragraph',domHas('p'),/<p\b/i,htmlFiles);break;
   case 'has_button':add('Button',domHas('button'),/<button\b/i,htmlFiles);break;
   case 'has_link':add('Link',domHas('a[href]'),/<a\b/i,htmlFiles);break;
   case 'has_button_or_link':add('Button or link',domHas('button,a[href]'),/<(?:button|a)\b/i,htmlFiles);break;
   case 'has_image':add('Image',domHas('img[src]'),/<img\b/i,htmlFiles);break;
   case 'has_list':add('HTML list',domHas('ul,ol'),/<(?:ul|ol)\b/i,htmlFiles);break;
   case 'uses_css_property':add('CSS properties',target?exact(css):Math.min(1,cssProps.size/3),/[\w-]+\s*:/i,cssFiles);break;
   case 'uses_event_listener':add('JavaScript event listener',/addEventListener\s*\(|\bonclick\s*=/i.test(js+html),/addEventListener\s*\(|\bonclick\s*=/i,[...jsFiles,...htmlFiles]);break;
   case 'js_changes_page':add('JavaScript modifies output',/(textContent|innerHTML|innerText|classList|style\.|appendChild|setAttribute)/i.test(js),/(textContent|innerHTML|classList|style\.)/i,jsFiles);break;
   case 'no_runtime_error':{let ok=1;try{if(js.trim())new Function(js)}catch{ok=0}add('JavaScript syntax',ok,/function|const|let/i,jsFiles);break;}
   case 'minimum_effort':add('Substantial completed code',Math.min(1,allText.length/120),/<html\b|\{/i,allFiles);break;
  }
  if(!checks.length){
   // Smart rubric: inspect actual requirements, rather than assigning the
   // same automatic score to every vague/unrecognized criterion.
   if(/html|structure|doctype|document|proper tags/.test(text)){
    add('HTML document structure',[/<!doctype\s+html/i,/<html\b/i,/<head\b/i,/<body\b/i,/<\/html\s*>/i].filter(re=>re.test(html)).length/5,/<html\b/i,htmlFiles,2);
    add('Matching HTML tags',allTags.length?1-tagErrors.length/Math.max(3,allTags.length):0,/<html\b/i,htmlFiles);
   }
   if(/semantic|header|footer|main|article|nav|section/.test(text))add('Semantic structure',Math.min(1,(html.match(/<(header|footer|main|article|nav|section|aside)\b/gi)||[]).length/3),/<(?:header|footer|main|article|nav|section)\b/i,htmlFiles,2);
   if(/heading|title/.test(text))add('Headings and titles',domHas('h1,h2,h3,h4,h5,h6')||/<title\s*>[^<]+/i.test(html),/<(?:h[1-6]|title)\b/i,htmlFiles);
   if(/paragraph|readable|text|content|complet|detail|information|organiz/.test(text))add('Visible page content',Math.min(1,bodyText.length/100),/<(?:p|h[1-6]|li)\b/i,htmlFiles,2);
   if(/image|picture|photo|gallery|media/.test(text))add('Image with source and alternative text',domHas('img[src][alt]'),/<img\b/i,htmlFiles);
   if(/link|hyperlink|navigation/.test(text))add('Working anchor destinations',domHas('a[href]'),/<a\b/i,htmlFiles);
   if(/list|bullet|number/.test(text))add('HTML lists',domHas('ul,ol'),/<(?:ul|ol)\b/i,htmlFiles);
   if(/table/.test(text))add('HTML table',domHas('table tr td,table tr th'),/<table\b/i,htmlFiles);
   if(/form|input/.test(text))add('Form elements',domHas('form,input,textarea,select'),/<(?:form|input)\b/i,htmlFiles);
   if(/css|design|styl|appearance|visual|font|color|background|margin|padding|border|creativ|neatness/.test(text)){
    add('Styling declarations',Math.min(1,cssProps.size/7),/[a-z-]+\s*:\s*[^;{}]+/i,cssFiles,2);
    add('Layout and visual styling',Math.min(1,([/\b(display|grid|flex|width|max-width|gap|margin|padding)\s*:/i,/\b(color|background|border|box-shadow)\s*:/i,/\b(font-family|font-size|font-weight|line-height|text-align)\s*:/i].filter(re=>re.test(css)).length)/3),/\b(?:display|background|font-size|padding|color)\s*:/i,cssFiles);
    if(/responsive|media quer|mobile/.test(text))add('Responsive styles',/@media\s*\(/i.test(css),/@media\s*\(/i,cssFiles,2);
   }
   if(/javascript|\bjs\b|script|interactiv|function|event/.test(text)){
    add('JavaScript code',Math.min(1,js.replace(/\s/g,'').length/75),/function|const|let|addEventListener/i,jsFiles);
    add('Working interactive behavior',/(addEventListener\s*\(|\bonclick\s*=|textContent|classList|innerHTML)/i.test(js+html),/addEventListener\s*\(|textContent|classList|onclick/i,[...jsFiles,...htmlFiles],2);
   }
   for(const word of ['mission','vision','identity','core values','environment','about','contact'])if(text.includes(word))add(`Required ${word} content`,visibleLower.includes(word),new RegExp(word.replace(/\s+/g,'\s+'),'i'),htmlFiles,2);
   if(!checks.length){
    add('Meaningful HTML content',Math.min(1,bodyText.length/60),/<(?:h[1-6]|p|section|main)\b/i,htmlFiles,2);
    add('Organized HTML elements',Math.min(1,parsed.reduce((n,p)=>n+p.doc.body.querySelectorAll('*').length,0)/8),/<(?:div|section|p|main|h[1-6])\b/i,htmlFiles);
    add('Readable code and structure',allText.length?Math.min(1,(allText.length/200)*(tagErrors.length?0.6:1)):0,/<html\b/i,htmlFiles);
   }
  }
  const totalWeight=checks.reduce((n,c)=>n+c.weight,0)||1;
  const progress=noCode?0:clamp01(checks.reduce((n,c)=>n+c.ok*c.weight,0)/totalWeight);
  const levelKey=progress>=.9?'excellent':progress>=.65?'good':progress>=.35?'fair':'needsImprovement';
  const fallback={excellent:max,good:Math.round(max*.75),fair:Math.round(max*.5),needsImprovement:0};
  const level=levels[levelKey]||{};
  const earned=Math.max(0,Math.min(max,Number.isFinite(Number(level.points))?Number(level.points):fallback[levelKey]));
  score+=earned;
  const successes=checks.filter(c=>c.ok>=.65),missing=checks.filter(c=>c.ok<.65);
  const references=[...new Map(successes.filter(c=>c.loc).map(c=>[c.loc.filename+':'+c.loc.line,c.loc])).values()].slice(0,3);
  const evidence=successes.length?successes.slice(0,4).map(c=>c.label).join('; ')+'.':'No required evidence detected in current project.';
  const improvement=missing.length?'Improve: '+missing.slice(0,4).map(c=>c.label).join(', ')+'.':'Detected requirements satisfied; review your overall visual presentation.';
  criteria.push({...criterion,title:name,earned,points:max,progress,levelKey,levelLabel:level.label||labelMap[levelKey],levelDescription:String(level.description||''),passed:progress>=.65,evidence:references.map(r=>`${r.filename}, line ${r.line}: ${r.excerpt}`).join(' · ')||evidence,improvement,checks:checks.map(c=>({label:c.label,passed:c.ok>=.65,progress:c.ok,filename:c.loc?.filename||'',line:c.loc?.line||0})),file:references[0]?.filename||'',line:references[0]?.line||0});
 }
 score=Math.round(score*100)/100;const percent=possible?Math.round(100*score/possible):0;
 const passingScore=Number(rubric.passingScore)||75;
 const studentName=String(state.profile?.name||state.profile?.fullName||state.profile?.studentName||(state.guest?'Guest / Practice Mode':'Student'));
 const studentId=String(state.profile?.studentId||state.profile?.studentIdNormalized||state.profile?.id||'');
 const section=String(state.profile?.section||state.profile?.gradeSection||'');
 const checkedAt=new Date().toISOString();
 const strengths=criteria.filter(i=>i.passed).slice(0,3).map(i=>i.title);
 const improvements=criteria.filter(i=>!i.passed).slice(0,3).map(i=>i.improvement);
 const feedback=`${percent>=90?'Excellent work!':percent>=75?'Good work!':percent>=60?'Keep improving your work.':'Focus on the missing rubric requirements.'} ${strengths.length?'Strengths: '+strengths.join(', ')+'.':''} ${improvements.join(' ')} Score: ${score}/${possible}.`.trim();
 // Original G8Code gradeActivity/renderResult schema: its My Projects page reads
 // lastResult.score/possible/percent/activityId/results, not V2-only fields.
 const record={score,possible,percent,passed:percent>=passingScore,results:criteria,feedback,activityId:String(rubric.id||''),activityTitle:String(rubric.title||'Selected rubric'),studentId,studentName,section,projectName:state.name,checkedAt,passingScore,recordMeta:{studentId,studentName,section,projectName:state.name,activityId:String(rubric.id||''),activityTitle:String(rubric.title||''),checkedAt},grader:'studio-v2-auto',gradingNote:'Automated source/DOM indicators; visual creativity is estimated from measurable styling. Scores can differ from the original advanced grader.'};
 const headline=`<div class="practice-result-head"><span>RESULT & FEEDBACK · AUTOMATIC RUBRIC SCORE</span><h3>${escapeHTML(studentName)}</h3><p><strong>Activity / Rubric:</strong> ${escapeHTML(record.activityTitle)}</p><p class="practice-result-meta">ID: ${escapeHTML(studentId||'Guest')} · Section: ${escapeHTML(section||'—')} · Project: ${escapeHTML(state.name)} · Checked: ${escapeHTML(checkedAt.slice(0,16).replace('T',' '))}</p></div>`;
 const top=`<div class="practice-score-head"><div><small>RUBRIC SCORE</small><div class="score-number">${escapeHTML(score)} <small>/ ${escapeHTML(possible)}</small></div><p>${escapeHTML(percent)}% · Passing score: ${escapeHTML(passingScore)}%</p></div><span class="practice-badge">${record.passed?'Passed':'Needs Work'}</span></div>`;
 const rows=criteria.map(i=>`<tr><td><strong>${escapeHTML(i.title)}</strong><small>${escapeHTML(i.levelLabel)} · ${escapeHTML(i.evidence)}</small>${i.improvement?`<small>${escapeHTML(i.improvement)}</small>`:''}${i.checks.length?`<details><summary>Code checks (${i.checks.filter(c=>c.passed).length}/${i.checks.length})</summary>${i.checks.map(c=>`<div class="rubric-code-evidence">${c.passed?'✓':'!'} ${escapeHTML(c.label)}${c.filename?` — ${escapeHTML(c.filename)}:${escapeHTML(c.line)}`:''}</div>`).join('')}</details>`:''}</td><td><strong>${escapeHTML(i.earned)} / ${escapeHTML(i.points)}</strong></td></tr>`).join('');
 return {record,html:`<div class="score-result-card practice-result">${headline}${top}<p class="score-caption">Scored against your CURRENT HTML/CSS/JS and the selected teacher rubric. Numerical scores use the rubric's original four-point levels. Visual/creative criteria use automatic styling indicators and may differ from teacher judgment.</p><table class="rubric-table"><thead><tr><th>Rubric criterion, evidence & improvements</th><th>Points</th></tr></thead><tbody>${rows}</tbody></table><p class="subtext">${escapeHTML(feedback)}</p></div>`};
}
function assistantAllowed(key){
 const s=state.root?.studentAssistanceSettings||{};
 // Match the original G8Code defaults: Code Helper is ON unless Admin
 // disables it. Super Studio is OFF until explicitly enabled.
 return s.enabled!==false && (key==='superStudio'?s.superStudio===true:s[key]!==false);
}
function openCodeHelper(){
 if(!assistantAllowed('codeHelper')){toast('Code Helper is not enabled in published Admin settings.','error');return}
 const code=fileContent(),l=state.lang,hints=[];
 if(l==='html'){
  if(!/<html\b/i.test(code))hints.push('Use <html> as the document root.');
  if(!/<head\b/i.test(code))hints.push('Add a <head> element for page metadata.');
  if(!/<body\b/i.test(code))hints.push('Place visible content inside <body>.');
  if(!/<title\b/i.test(code))hints.push('Set a descriptive page <title>.');
  if(/<img\b(?![^>]*\balt=)/i.test(code))hints.push('Add alt text to your images.');
  if(!/(<h[1-6]\b)/i.test(code))hints.push('Try adding a heading.');
 } else if(l==='css'){
  const opens=(code.match(/\{/g)||[]).length,closes=(code.match(/\}/g)||[]).length;
  if(opens!==closes)hints.push(`CSS braces are unbalanced (${opens} opening, ${closes} closing).`);
  if(!code.includes(':')&&code.trim())hints.push('CSS declarations should use property: value; inside a selector.');
 }else{
  try{new Function(code)}catch(err){hints.push('JavaScript syntax: '+String(err.message||err))}
  if(!code.trim())hints.push('Add some JavaScript to begin.');
 }
 openDialog('Code Helper · '+fileName(),`<div class="score-result-card"><strong>${escapeHTML(hints.length?'Suggestions':'No basic issues detected')}</strong><div class="record-list">${hints.length?hints.map(v=>`<p class="helper-hint">${escapeHTML(v)}</p>`).join(''):'<p class="subtext">Basic checks passed. This does not guarantee the code is error-free; use Run to test actual behavior.</p>'}</div></div><p class="subtext">Reads the current ${escapeHTML(l.toUpperCase())} file; controlled by the existing Admin Code Helper switch.</p>`,[{label:'Close',kind:'primary',action:closeDialog}]);
}
const V2_SNAPSHOT_KEY='g8code.studio.v2.snapshots';
// Formatting is deliberately opt-in. Do NOT format on every input event:
// it would move the caret and create noisy edits in live collaboration.
let lastStudioFormat=null;
function studioCanFormat(){
 if(!assistantAllowed('superStudio')){toast('Super Studio is disabled by Admin.','error');return false}
 if(input.readOnly||(state.collab&&!liveCollab?.canEdit())){toast('View-only session: only the host or permitted editors can format code.','error');return false}
 if(!window.G8CodeStudioFormatter?.format){toast('Auto Format is unavailable. Check editor-v2-formatter.js.','error');return false}
 return true;
}
function applyStudioFormatText(next){
 // Use the SAME edit pipeline as typing: sync file state, local recovery,
 // preview, status, and instant P2P collaboration (never Firestore writes).
 const start=input.selectionStart;
 const previous=input.value;
 input.value=next;
 input.setSelectionRange(Math.min(start,next.length),Math.min(start,next.length));
 changeCode();
 renderHighlight();
 renderCollabCursors();
 scheduleCollabCursor();
 return previous;
}
function formatCurrentFile(){
 if(!studioCanFormat())return;
 const lang=state.lang,name=fileName(lang),before=input.value;
 let after;
 try{after=window.G8CodeStudioFormatter.format(lang,before)}
 catch(err){console.error('Studio Auto Format failed:',err);toast('Could not format this file. Code was not changed.','error');return}
 if(typeof after!=='string'){toast('Formatter did not return valid code. Code was not changed.','error');return}
 if(after===before){toast(name+' is already formatted.');return}
 lastStudioFormat={lang,name,before,after,projectId:state.projectId,codeRef:state.code};
 applyStudioFormatText(after);
 closeDialog();
 input.focus({preventScroll:true});
 toast('✓ Formatted '+name+' · Undo available in Super Studio');
}
function undoStudioFormat(){
 if(!studioCanFormat())return;
 const saved=lastStudioFormat;
 if(!saved||saved.codeRef!==state.code||saved.projectId!==state.projectId||saved.lang!==state.lang||saved.name!==fileName()||input.value!==saved.after){
  toast('Undo Format is unavailable: this file has changed since formatting.','error');return;
 }
 applyStudioFormatText(saved.before);
 lastStudioFormat=null;
 closeDialog();
 input.focus({preventScroll:true});
 toast('↶ Reverted the formatting in '+saved.name);
}
function openSuperStudio(){
 if(!assistantAllowed('superStudio')){toast('Super Studio is disabled by Admin.','error');return}
 let snapshots=[];try{snapshots=JSON.parse(sessionStorage.getItem(V2_SNAPSHOT_KEY)||'[]')}catch{}
 const undo=lastStudioFormat&&lastStudioFormat.codeRef===state.code&&lastStudioFormat.projectId===state.projectId&&lastStudioFormat.lang===state.lang&&lastStudioFormat.name===fileName()&&input.value===lastStudioFormat.after;
 openDialog('Super Studio · Coding Tools',`<p class="subtext">One-click Auto Format for the active HTML, CSS or JavaScript file. Snapshots capture your whole project and stay in this browser tab only.</p><div class="option-grid"><button data-action="formatCurrent">✦ Auto Format Current File<small>Clean indentation and layout in ${escapeHTML(fileName())}. Other project files are not changed.</small></button><button data-action="snapshotSave">＋ Save Snapshot<small>Capture all HTML, CSS and JS files before experimenting.</small></button>${undo?'<button data-action="formatUndo">↶ Undo Last Format<small>Restore this file to its exact code before formatting.</small></button>':''}</div><h3>Saved snapshots</h3><div class="record-list">${snapshots.map((v,i)=>`<div class="record-row"><div class="record-title"><strong>${escapeHTML(v.name||'Snapshot')}</strong><small>${escapeHTML(new Date(v.at).toLocaleString())}</small></div><button data-snapshot="${i}">Restore</button></div>`).join('')||'<p class="subtext">No snapshots yet.</p>'}</div>`,[{label:'Close',action:closeDialog}]);
}
function bindEvents(){
$('codeInput').addEventListener('input',e=>{changeCode(e);scheduleCollabCursor()});input.addEventListener('scroll',()=>{$('lineNumbers').scrollTop=input.scrollTop;const hi=$('codeHighlight');hi.scrollTop=input.scrollTop;hi.scrollLeft=input.scrollLeft;renderCollabCursors()});input.addEventListener('click',()=>{refreshCursor();renderHighlight();scheduleCollabCursor()});input.addEventListener('keyup',()=>{refreshCursor();renderHighlight();scheduleCollabCursor()});input.addEventListener('select',()=>{renderHighlight();scheduleCollabCursor()});input.addEventListener('keydown',e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey&&(e.key==='+'||e.key==='='||e.code==='NumpadAdd'||e.key==='-'||e.key==='_'||e.code==='NumpadSubtract')){e.preventDefault();zoomEditorFont(e.key==='-'||e.key==='_'||e.code==='NumpadSubtract'?-1:1);return;}if(e.key==='Tab'){if(input.readOnly){e.preventDefault();return}e.preventDefault();const start=input.selectionStart,end=input.selectionEnd;input.setRangeText('  ',start,end,'end');changeCode()}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveProject()}});document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveProject()}if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.target!==input&&(e.key==='+'||e.key==='='||e.code==='NumpadAdd'||e.key==='-'||e.key==='_'||e.code==='NumpadSubtract')){e.preventDefault();zoomEditorFont(e.key==='-'||e.key==='_'||e.code==='NumpadSubtract'?-1:1)}if(e.key==='Escape'){if(!$('dialog').classList.contains('hidden'))closeDialog();else if($('filesPanel').classList.contains('open'))toggleFiles(false);else if(document.body.dataset.immersive)exitStudioFullscreen();else $('navMenu').classList.add('hidden')}});
$('projectTitle').addEventListener('change',()=>{title($('projectTitle').value);setDirty()});$('saveBtn').onclick=()=>saveProject();$('mobileSaveAction').onclick=()=>saveProject();$('authPill').onclick=openAccount;$('menuBtn').onclick=()=>{const m=$('navMenu');m.classList.toggle('hidden');$('menuBtn').setAttribute('aria-expanded',String(!m.classList.contains('hidden')))};$('navMenu').addEventListener('click',e=>{const button=e.target.closest('[data-studio-route]');if(button)goToStudioDestination(button.dataset.studioRoute)});
$('toggleTheme').onclick=()=>setAppearance(state.appearance==='dark'?'light':'dark');all('.layout-picker button[data-layout]').forEach(b=>b.onclick=()=>{if(b.dataset.layout==='editor'){enterStudioFullscreen('code');return}setLayout(b.dataset.layout);if(matchMedia('(max-width:700px)').matches)setMobileTab(b.dataset.layout==='preview'?'preview':'code')});$('focusSwitch').onclick=switchStudioFullscreen;$('focusExit').onclick=exitStudioFullscreen;$('focusFiles').onclick=()=>toggleFiles(true);$('focusTools').onclick=()=>openTools();$('mobileFullPreview').onclick=()=>enterStudioFullscreen(state.mobileTab==='preview'?'preview':'code');$('filesScrim').onclick=()=>toggleFiles(false);$('resetLayout').onclick=()=>{ $('workspace').style.removeProperty('--split');$('workspace').style.removeProperty('--stack');setLayout('split');toast('Workspace layout reset')};$('focusBtn').onclick=()=>enterStudioFullscreen('code');$('fullscreenPreviewBtn').onclick=()=>enterStudioFullscreen('preview');$('checkCurrentBtn').onclick=openRubrics;$('filesBtn').onclick=()=>toggleFiles(matchMedia('(max-width:920px)').matches?true:document.body.classList.contains('files-closed'));$('closeFiles').onclick=()=>toggleFiles(false);$('mobileFilesAction').onclick=()=>toggleFiles(true);$('mobileResultsAction').onclick=openRubrics;$('mobileActivitiesAction').onclick=openActivities;$('mobileCollabAction').onclick=openCollab;$('studioCollabPill').onclick=openCollab;$('focusMembers').onclick=openCollab;$('fileExplorer').addEventListener('click',async e=>{const add=e.target.closest('[data-add]'),rename=e.target.closest('[data-rename]'),remove=e.target.closest('[data-delete]'),open=e.target.closest('[data-file]');if(add)await addOrRenameFile(add.dataset.add);else if(rename){e.preventDefault();e.stopPropagation();await addOrRenameFile(rename.dataset.lang,rename.dataset.rename)}else if(remove){e.preventDefault();e.stopPropagation();await deleteFile(remove.dataset.lang,remove.dataset.delete)}else if(open){switchFile(open.dataset.lang,open.dataset.file);if(matchMedia('(max-width:920px)').matches)toggleFiles(false)}});$('addFile').onclick=()=>openDialog('Add a project file','<div class="option-grid"><button data-add="html">＋ HTML page</button><button data-add="css">＋ CSS file</button><button data-add="js">＋ JavaScript file</button></div>',[{label:'Cancel',action:closeDialog}]);
all('#languageTabs button').forEach(b=>b.onclick=()=>{const lang=b.dataset.lang;if(!Object.keys(fileMap(lang)).length){addOrRenameFile(lang);return}switchFile(lang,fileName(lang))});$('renameFile').onclick=()=>addOrRenameFile(state.lang,fileName());$('deleteFile').onclick=()=>deleteFile();$('clearTab').onclick=clearTab;$('editorFocus').onclick=()=>enterStudioFullscreen('code');$('previewFocus').onclick=openPreviewLarge;$('openPreviewTab').onclick=openPreviewLarge;$('refreshBtn').onclick=runPreview;$('runBtn').onclick=()=>{runPreview();toast('Preview updated')};$('stackedRunBtn').onclick=()=>{runPreview();$('previewPanel').scrollIntoView({behavior:'smooth',block:'start'});toast('Output updated')};$('fontSmaller').onclick=()=>zoomEditorFont(-1);$('fontLarger').onclick=()=>zoomEditorFont(1);$('mobileRunAction').onclick=()=>{
  // On phones the Preview tab is display:none while Code is visible.
  // Loading srcdoc before showing it can produce a permanently blank iframe.
  // First reveal the output, then render the latest project code once visible.
  if(document.body.dataset.immersive==='code'){
    enterStudioFullscreen('preview');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(document.body.dataset.immersive==='preview')runPreview()}));
    return;
  }
  setMobileTab('preview',{deferRender:true});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(state.mobileTab==='preview'&&!document.body.dataset.immersive){
      updateCanvas();
      runPreview();
    }
  }));
};$('autoRun').onclick=()=>{state.autoRun=!state.autoRun;$('autoRun').classList.toggle('active',state.autoRun);$('autoRun').setAttribute('aria-pressed',String(state.autoRun));storePrefs();toast(state.autoRun?'Auto Run on':'Manual Run on')};$('previewPage').onchange=e=>{state.previewPage=e.target.value;runPreview()};$('previewZoom').onchange=e=>{state.previewZoom=e.target.value;updateCanvas();$('previewViewport').scrollTo(0,0)};all('[data-device]').forEach(b=>b.onclick=()=>setDevice(b.dataset.device));$('mobileCode').onclick=()=>setMobileTab('code');$('mobilePreview').onclick=()=>setMobileTab('preview');$('openMore').onclick=()=>openTools();$('mobileMoreAction').onclick=()=>openTools();$('openProjects').onclick=listProjects;$('openActivities').onclick=openActivities;$('openCollab').onclick=openCollab;$('quickResult').onclick=openRubrics;$('closeDialog').onclick=closeDialog;$('dialogSize').onclick=()=>{const expanded=$('dialog').classList.toggle('expanded');$('dialogSize').textContent=expanded?'↙ Compact':'⤢ Resize'};$('scrim').onclick=closeDialog;$('dialogContent').addEventListener('change',async e=>{if(e.target?.id!=='studioCollabAccess')return;const mode=e.target.value==='view'?'view':'edit';if(state.collab?.isHost){try{await liveCollab?.access(mode);state.collab.access=mode;renderCollabPresence();toast(mode==='view'?'Classmates are now view-only':'Classmates can now edit together')}catch(err){toast('Could not update access: '+err.message,'error')}}else state.collabNewAccess=mode});
$('dialogContent').addEventListener('click',async e=>{const el=e.target.closest('button');if(!el)return;if(el.dataset.collabKick){e.preventDefault();e.stopPropagation();await kickCollabParticipant(el.dataset.collabKick);}else if(el.dataset.projectOpen)loadProject(el.dataset.projectOpen);else if(el.dataset.activity)openActivity(el.dataset.activity);else if(el.dataset.inbox)viewInbox(el.dataset.inbox);else if(el.dataset.add){closeDialog();addOrRenameFile(el.dataset.add)}else if(el.dataset.downloadFile){const name=el.dataset.downloadFile;downloadBlob(new Blob([getProjectFiles()[name]||''],{type:'text/plain'}),name)}else if(el.dataset.snapshot!==undefined){
 if(!assistantAllowed('superStudio'))return;
 const saved=JSON.parse(sessionStorage.getItem(V2_SNAPSHOT_KEY)||'[]'),snap=saved[Number(el.dataset.snapshot)];
 if(!snap)return;
 if(!await confirmAction('Restore this snapshot? This replaces your current unsaved code.','Restore'))return;
 state.code=normalizeCode(snap.code);title(snap.name);state.previewPage=state.code.activeHtmlPage;switchFile('html',state.code.activeHtmlPage);setDirty();runPreview();closeDialog();toast('Snapshot restored');
 }else if(el.dataset.action){const action=el.dataset.action;if(action==='snapshotSave'){
  if(!assistantAllowed('superStudio'))return;
  const snapshots=JSON.parse(sessionStorage.getItem(V2_SNAPSHOT_KEY)||'[]');snapshots.unshift({at:Date.now(),name:state.name,code:clone(state.code)});
  try{sessionStorage.setItem(V2_SNAPSHOT_KEY,JSON.stringify(snapshots.slice(0,8)));toast('Snapshot saved in this tab');openSuperStudio()}catch(e){toast('Snapshot storage full. Download a ZIP instead.','error')}
 }else if(action==='formatCurrent')formatCurrentFile();else if(action==='formatUndo')undoStudioFormat();else if(action==='zip')exportZip();else if(action==='checkResult'){closeDialog();openRubrics()}else if(action==='codeHelper')openCodeHelper();else if(action==='superStudio')openSuperStudio();else if(action==='fullPreview'){closeDialog();enterStudioFullscreen('preview')}else if(action==='font'){zoomEditorFont(1)}else if(action==='focus'){closeDialog();enterStudioFullscreen('code')}else if(action==='reset'){closeDialog();newProject()}else if(action==='clear'){closeDialog();clearTab()}else if(action==='delete'){closeDialog();deleteFile()}else if(action==='new'){closeDialog();newProject()}else if(action==='appearance'){setAppearance(state.appearance==='dark'?'light':'dark');toast('Appearance changed')}else if(action==='host')createCollab();else if(action==='join')joinCollab();else if(action==='members'){renderCollabPresence()}else if(action==='sessionActions')openSessionActions();else if(action==='copyCollab'){navigator.clipboard?.writeText(state.collab?.code||'').then(()=>toast('Join code copied')).catch(()=>toast('Code: '+(state.collab?.code||'')))}else if(action==='send'){closeDialog();sendCode()}else if(action==='inbox')openInbox();else if(action==='leave'){closeDialog();await leaveCollabSession()}}});
const wide=matchMedia('(max-width:920px)');wide.addEventListener?.('change',()=>{toggleFiles(false);if(!wide.matches){$('codePanel').classList.remove('mobile-hidden');$('previewPanel').classList.remove('mobile-hidden')}else setMobileTab(state.mobileTab);updateCanvas()});resizeObserver=new ResizeObserver(()=>{updateCanvas();renderCollabCursors()});resizeObserver.observe($('previewViewport'));installResize();installReferenceDock();window.addEventListener('pagehide',()=>{if(state.collab)liveCollab?.stop()});window.addEventListener('beforeunload',e=>{if(state.dirty&&!approvedStudioExit){e.preventDefault();e.returnValue=''}});
}
function toggleFiles(open){
 state.filesOpen=Boolean(open);
 const drawer=matchMedia('(max-width:920px)').matches || document.body.dataset.immersive==='code';
 if(drawer){
  $('filesPanel').classList.toggle('open',Boolean(open));
  $('filesScrim').classList.toggle('hidden',!open);
  $('filesBtn').setAttribute('aria-expanded',String(Boolean(open)));
  if(open) $('closeFiles').focus({preventScroll:true});
 }else{
  document.body.classList.toggle('files-closed',!open);
  $('filesPanel').classList.remove('open');$('filesScrim').classList.add('hidden');
  $('filesBtn').setAttribute('aria-expanded',String(Boolean(open)));
 }
 storePrefs();
}
async function restoreGuestDraft(){try{const draft=JSON.parse(sessionStorage.getItem(DRAFT)||'null');if(draft?.code){state.code=normalizeCode(draft.code);state.lastPracticeCheck=draft.practiceCheck||null;title(draft.name||state.name);state.dirty=true}}catch{}}
async function boot(){if(STUDIO_FORCE_GUEST||!STUDIO_PARAMS.has('project'))await restoreGuestDraft();setAppearance(state.appearance);document.documentElement.style.setProperty('--font-size',state.font+'px');$('workspace').style.setProperty('--split',(prefs.split||54)+'%');$('workspace').style.setProperty('--stack',(prefs.stack||55)+'%');bindEvents();switchFile('html',state.code.activeHtmlPage);setLayout(state.layout);setDevice(state.device);setMobileTab('code');$('autoRun').classList.toggle('active',state.autoRun);refreshSettings();toggleFiles(!matchMedia('(max-width:920px)').matches&&state.filesOpen);runPreview();initFirebase();}
boot();
})();
