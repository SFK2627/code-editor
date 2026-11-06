/* G8Code Studio V2.44 — safe HTML selection -> empty CSS selector.
   Pure parser/selector helpers. No Firebase calls, no writes, no styling generation. */
(function(host){'use strict';
 const VOIDS = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
 const IDENT = /^(?:-?(?:[_a-zA-Z\u00a0-\uffff])(?:[\w\-\u00a0-\uffff])*)$/u;
 function tokenize(source){
  const code=String(source||''), tags=[], stack=[];let index=0;
  while(index<code.length){
   const start=code.indexOf('<',index);if(start<0)break;
   if(code.startsWith('<!--',start)){const end=code.indexOf('-->',start+4);index=end<0?code.length:end+3;continue;}
   if(code.startsWith('<!',start)||code.startsWith('<?',start)){const end=code.indexOf('>',start+2);index=end<0?code.length:end+1;continue;}
   const match=/^<\s*(\/?)\s*([A-Za-z][\w:-]*)/.exec(code.slice(start,start+90));
   if(!match){index=start+1;continue}
   let end=start+match[0].length,quote='';
   for(;end<code.length;end++){const c=code[end];if(quote){if(c===quote)quote='';}else if(c==='"'||c==="'"){quote=c;}else if(c==='>'){end++;break;}}
   if(end>code.length||code[end-1]!=='>'){index=start+1;continue}
   const name=match[2].toLowerCase(),closing=Boolean(match[1]),raw=code.slice(start,end);
   const item={start,end,name,nameStart:start+match[0].lastIndexOf(match[2]),nameEnd:start+match[0].length,closing,void:VOIDS.has(name)||/\/\s*>$/.test(raw),raw,partner:null};
   tags.push(item);index=end;
   if(closing){
    const previous=stack[stack.length-1];
    if(previous&&previous.name===name){previous.partner=item;item.partner=previous;stack.pop();}
    else if(stack.some(t=>t.name===name)){// Misnested tags are not reliable sources for Auto CSS.
      const matchIndex=stack.map(t=>t.name).lastIndexOf(name);stack.splice(matchIndex);
    }
   }else if(!item.void){stack.push(item);}
   // Script/style text is not HTML markup; skip it until the closing tag.
   if(!closing&&(name==='script'||name==='style')){
    const closeAt=code.toLowerCase().indexOf('</'+name,index);
    if(closeAt>=0)index=closeAt;
   }
  }
  return tags;
 }
 function escapeIdent(value){
  if(IDENT.test(value))return value;
  if(typeof host.CSS?.escape==='function')return host.CSS.escape(value);
  return null;
 }
 function attributeChoice(code,tags,start,end){
  const selected=code.slice(start,end).trim();
  const match=/^(id|class)\s*=\s*(["'])(.*?)\2$/is.exec(selected);
  if(!match)return {error:'Highlight the complete id="..." or class="..." attribute.'};
  const tag=tags.find(t=>!t.closing&&start>=t.nameEnd&&end<=t.end);
  if(!tag)return {error:'Select an id/class attribute inside an opening HTML tag.'};
  // Verify that the selected attribute actually begins on an attribute boundary,
  // not as literal text inside another quoted HTML attribute.
  const attributeRegion=code.slice(tag.nameEnd,tag.end-1);
  const attrRe=/(?:^|\s)(id|class)\s*=\s*(["'])(.*?)\2/gi;let found=false,m;
  while((m=attrRe.exec(attributeRegion))){
   const token=m[0].trim();const at=tag.nameEnd+m.index+m[0].indexOf(m[1]);
   if(at===start+code.slice(start,end).indexOf(match[1])&&token===selected){found=true;break;}
  }
  if(!found)return {error:'Select the complete id or class attribute, including its quotes.'};
  const value=match[3].trim();
  if(!value)return {error:'This '+match[1].toLowerCase()+' has no value. Add a name first.'};
  if(match[1].toLowerCase()==='id'){
   if(/\s/.test(value))return {error:'An HTML id cannot contain spaces.'};
   const safe=escapeIdent(value);return safe?{selectors:['#'+safe],source:'id'}:{error:'This ID cannot be used as a CSS selector.'};
  }
  const values=[...new Set(value.split(/\s+/).filter(Boolean))];
  const selectors=values.map(s=>escapeIdent(s)).filter(Boolean).map(s=>'.'+s);
  return selectors.length?{selectors,source:'class'}:{error:'No valid class name was found.'};
 }
 function resolve(source,start,end){
  const code=String(source||'');if(code.length>500000)return {error:'This HTML file is too large to inspect automatically.'};
  if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<start||end>code.length)return {error:'Select an HTML tag or an id/class attribute first.'};
  const tags=tokenize(code);
  if(end>start)return attributeChoice(code,tags,start,end);
  const tag=tags.find(t=>start>=t.start&&start<t.end && (start<=t.nameEnd || t.closing && start<=t.nameEnd));
  if(!tag)return {error:'Tap the HTML tag name (for example h1) or highlight a complete id="..." / class="...".'};
  if(tag.void&&tag.closing)return {error:'This HTML void tag does not use a closing tag.'};
  // The selector belongs to the tag name regardless of whether its matching
  // closing tag has been typed yet. Do not block legitimate in-progress HTML.
  // Opening and closing tags both resolve on the first tap.
  return {selectors:[tag.name],source:'tag',tag:tag.name};
 }
 function findExisting(css,selector){
  const text=String(css||'');
  // Strip comments and strings without changing offsets.
  const clean=text.replace(/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,m=>' '.repeat(m.length));
  const pattern=/([^{}]+)\{/g;let m;
  while((m=pattern.exec(clean))){
   const prefix=m[1];const part=prefix.slice(Math.max(prefix.lastIndexOf('}'),prefix.lastIndexOf(';'))+1).trim();
   if(part.startsWith('@'))continue;
   if(part.split(',').some(s=>s.trim()===selector))return Math.max(0,m.index+m[1].indexOf(selector));
  }
  return -1;
 }
 function block(selector){return selector+' {\n  \n}';}
 host.G8CodeStudioAutoCSS={resolve,findExisting,block,tokenize};
})(typeof window==='object'?window:globalThis);
