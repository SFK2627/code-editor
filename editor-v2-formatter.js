/* G8Code Studio V2 — offline, dependency-free one-click code formatter.
 * Formatting is intentionally conservative around embedded code, strings and
 * comments to avoid changing the behavior of a student's project. */
(function (host) {
  'use strict';
  const NL = '\n';
  const SPACE = '  ';
  const BLOCK = new Set('html head body main header footer nav section article aside div p h1 h2 h3 h4 h5 h6 ul ol li table thead tbody tfoot tr th td form fieldset legend figure figcaption details summary pre blockquote address video audio canvas textarea select option button script style'.split(' '));
  const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
  const RAW = new Set(['script','style','pre','textarea','code']);
  function normalize(src) { return String(src ?? '').replace(/\r\n?/g,'\n'); }
  function finalText(s) { return s.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').replace(/^\s*\n/,'').replace(/\s*$/,'') + '\n'; }
  function htmlTokens(source) {
    const tokens=[];let i=0;
    while(i<source.length){
      if(source[i]!=='<'){const j=source.indexOf('<',i);tokens.push({tag:false,text:source.slice(i,j<0?source.length:j)});i=j<0?source.length:j;continue;}
      if(source.startsWith('<!--',i)){const j=source.indexOf('-->',i+4);const end=j<0?source.length:j+3;tokens.push({tag:true,text:source.slice(i,end)});i=end;continue;}
      if(source.startsWith('<![CDATA[',i)){const j=source.indexOf(']]>',i+9);const end=j<0?source.length:j+3;tokens.push({tag:true,text:source.slice(i,end)});i=end;continue;}
      let j=i+1,quote='';
      while(j<source.length){const c=source[j];if(quote){if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='>'){j++;break;}j++;}
      const t=source.slice(i,j);const match=t.match(/^<\s*(\/?)\s*([a-z][\w:-]*)/i);
      if(!match){tokens.push({tag:false,text:t});i=j;continue;}
      const name=match[2].toLowerCase();tokens.push({tag:true,text:t,name,closing:!!match[1],void:VOID.has(name)||/\/\s*>$/.test(t)});i=j;
      // Never parse HTML-like content inside scripts, CSS, preformatted blocks, etc.
      if(!match[1]&&RAW.has(name)&&!VOID.has(name)&&!/\/\s*>$/.test(t)){
        const tail=source.slice(i),re=new RegExp('</\\s*'+name+'\\s*>','i'),m=re.exec(tail);
        const end=m?i+m.index:i+tail.length;
        if(end>i)tokens.push({tag:false,text:source.slice(i,end),raw:true});
        i=end;
      }
    }
    return tokens;
  }
  function formatHTML(src){
    const source=normalize(src);
    if(!source.trim())return source;
    const tokens=htmlTokens(source);let out='',depth=0,previous=null;
    const newline=()=>{out=out.replace(/[ \t]+$/,'');if(out&&!out.endsWith(NL))out+=NL;};
    const emit=(text)=>{if(out.endsWith(NL)||!out)out+=SPACE.repeat(Math.min(depth,80));out+=text;};
    for(let k=0;k<tokens.length;k++){
      const token=tokens[k],next=tokens[k+1];
      if(!token.tag){
        if(token.raw){out+=token.text;previous=token;continue;}
        if(!token.text.trim()){
          // Whitespace between inline tags may create a visible space. Keep it.
          if(previous?.tag&&next?.tag&&(!BLOCK.has(previous.name)||!BLOCK.has(next.name)))out+=token.text.replace(/\s+/g,' ');
          // In text nodes whitespace is content, preserve it.
          else if(!previous?.tag||!next?.tag)out+=token.text;
        }else{
          // Preserve text exactly, including whitespace around inline elements.
          emit(token.text.replace(/^\n[ \t]*/,''));
        }
        previous=token;continue;
      }
      if(!token.name){newline();emit(token.text.trim());newline();previous=token;continue;}
      const block=BLOCK.has(token.name),closing=token.closing;
      if(closing&&block){
        depth=Math.max(0,depth-1);
        // Keep <p>text</p> together; put </div> on a separate line.
        const onSameLine=out.slice(out.lastIndexOf(NL)+1).includes('<'+token.name);
        if(!onSameLine)newline();
      }else if(block){
        // Never inject linebreaks in the middle of an inline text run.
        if(!previous||previous.tag&&(!previous.name||BLOCK.has(previous.name))||out.endsWith('>'))newline();
      }
      emit(token.text);
      if(!closing&&block&&!token.void){depth++;if(next?.tag&&BLOCK.has(next.name)&&!next.closing)newline();}
      if(closing&&block&&next?.tag&&BLOCK.has(next.name))newline();
      if(token.void&&block&&next?.tag&&BLOCK.has(next.name))newline();
      previous=token;
    }
    // Never normalize whole-document whitespace here: inside <pre>,
    // <textarea>, <script>, and <style> whitespace can be meaningful.
    return out.replace(/^[ \t]*\n/,'').replace(/[\n\t ]*$/,'')+'\n';
  }
  // Split CSS at delimiters only when not inside quoted values, comments,
  // parentheses or attribute selectors. URLs and data URIs are kept intact.
  function formatCSS(src){
    const source=normalize(src);if(!source.trim())return source;
    const parts=[];let buf='',quote='',comment=false,escaped=false,parens=0,brackets=0;
    for(let i=0;i<source.length;i++){
      const c=source[i],n=source[i+1]||'';
      if(comment){buf+=c;if(c==='*'&&n==='/'){buf+='/';i++;comment=false;}continue;}
      if(quote){buf+=c;if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote='';continue;}
      if(c==='/'&&n==='*'){buf+='/*';i++;comment=true;continue;}
      if(c==='"'||c==="'"){buf+=c;quote=c;continue;}
      if(c==='(')parens++;else if(c===')')parens=Math.max(0,parens-1);
      if(c==='[')brackets++;else if(c===']')brackets=Math.max(0,brackets-1);
      if(parens===0&&brackets===0&&(c==='{'||c==='}'||c===';')){
        if(c==='}'){
          if(buf.trim())parts.push(buf);
          parts.push('}');buf='';
        } else {
          buf+=c;parts.push(buf);buf='';
        }
        continue;
      }
      buf+=c;
    }
    if(buf)parts.push(buf);
    let depth=0,output=[];
    for(const part of parts){
      let text=part.trim();if(!text)continue;
      if(text==='}')depth=Math.max(0,depth-1);
      if(text.endsWith('{'))text=text.slice(0,-1).trimEnd()+' {';
      text=text.split('\n').map((s,i)=>i?s.trimEnd():s).join('\n');
      output.push(SPACE.repeat(Math.min(depth,80))+text);
      if(text.endsWith('{'))depth++;
    }
    return finalText(output.join(NL));
  }
  function jsLines(source){
    let output='',line='',quote='',escaped=false,lineComment=false,blockComment=false,template=false,templateDepth=0,regex=false,charClass=false,paren=0,bracket=0;
    let lastToken='';
    const flush=()=>{output+=line+NL;line='';};
    const likelyRegex=()=> !lastToken||/[=(,:!&|?;{}\[+*%^~<>-]/.test(lastToken);
    for(let i=0;i<source.length;i++){
      const c=source[i],n=source[i+1]||'';
      if(lineComment){if(c==='\n'){lineComment=false;flush();}else line+=c;continue;}
      if(blockComment){line+=c;if(c==='*'&&n==='/'){line+='/';i++;blockComment=false;}continue;}
      if(quote){line+=c;if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote){quote='';if(template)template=false;}continue;}
      if(regex){line+=c;if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='[')charClass=true;else if(c===']')charClass=false;else if(c==='/'&&!charClass){regex=false;lastToken='/';}continue;}
      if(c==='/'&&n==='/'){line+='//';i++;lineComment=true;continue;}
      if(c==='/'&&n==='*'){line+='/*';i++;blockComment=true;continue;}
      if(c==='/'&&likelyRegex()){regex=true;line+='/';continue;}
      if(c==='"'||c==="'"||c==='`'){quote=c;template=c==='`';line+=c;continue;}
      if(c==='(')paren++;else if(c===')')paren=Math.max(0,paren-1);
      if(c==='[')bracket++;else if(c===']')bracket=Math.max(0,bracket-1);
      if(c===';'){line+=';';lastToken=';';if(!paren&&!bracket&&source.slice(i+1).trim()&& !/^\s*\n/.test(source.slice(i+1))){flush();}continue;}
      if(c==='\n'){flush();continue;}
      line+=c;
      if(!/\s/.test(c))lastToken=c;
    }
    if(line)output+=line;
    return output;
  }
  function formatJS(src){
    const source=normalize(src);if(!source.trim())return source;
    const split=jsLines(source);
    let depth=0,blockComment=false,quote='',escaped=false,regexp=false,charClass=false;
    const lines=[];
    for(const raw of split.split('\n')){
      const startProtected=!!quote || blockComment;
      const line=raw.trim();
      if(!line){
        if(startProtected)lines.push(raw); // Protect blank lines inside templates.
        else if(lines.length&&lines[lines.length-1]!=='')lines.push('');
      }else{
        const closeFirst=!startProtected && /^[}\]]/.test(line);
        const initial=Math.max(0,depth-(closeFirst?1:0));
        lines.push(startProtected?raw:SPACE.repeat(Math.min(initial,80))+line);
      }
      let lineComment=false,lastToken='';
      for(let i=0;i<raw.length;i++){
        const c=raw[i],n=raw[i+1]||'';
        if(lineComment)break;
        if(blockComment){if(c==='*'&&n==='/'){i++;blockComment=false;}continue;}
        if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote='';continue;}
        if(regexp){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='[')charClass=true;else if(c===']')charClass=false;else if(c==='/'&&!charClass)regexp=false;continue;}
        if(c==='/'&&n==='/'){lineComment=true;continue;}
        if(c==='/'&&n==='*'){i++;blockComment=true;continue;}
        if(c==='/'&&(!lastToken||/[=(,:!&|?;{}\[+*%^~<>-]/.test(lastToken))){regexp=true;continue;}
        if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
        if(c==='{')depth++;
        else if(c==='}')depth=Math.max(0,depth-1);
        if(!/\s/.test(c))lastToken=c;
      }
    }
    // Don't use a global .trim()/.replace() that could modify multiline string
    // literals or comments: only remove trailing empty formatter-created lines.
    while(lines.length&&lines[lines.length-1]==='')lines.pop();
    return lines.join('\n')+'\n';
  }
  const format=(lang,code)=>{
    const language=String(lang||'').toLowerCase();
    if(language==='html')return formatHTML(code);
    if(language==='css')return formatCSS(code);
    if(language==='js'||language==='javascript')return formatJS(code);
    return String(code ?? '');
  };
  const api=Object.freeze({format,formatHTML,formatCSS,formatJS});
  host.G8CodeStudioFormatter=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
