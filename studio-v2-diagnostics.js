/* G8Code Studio V2.8 — structured, local-only diagnostics for HTML5, CSS and JS.
 * Runs in the student's browser, with no execution of student code and no
 * network, Firebase, grade or save operations. Requires local Acorn bundle.
 * Never claims that a syntactically valid program must work correctly.
 */
(function (host) {
  'use strict';
  const assist = host.G8StudioEditAssist;
  if (!assist) return;
  const TAGS = new Set(`html head title body base meta link style script noscript template slot main section article header footer nav aside div span p br hr a img picture source figure figcaption audio video track canvas svg math iframe embed object param form input button label select option optgroup textarea fieldset legend datalist output progress meter table caption thead tbody tfoot tr td th col colgroup ul ol li dl dt dd h1 h2 h3 h4 h5 h6 strong em b i u s small mark code pre samp kbd var blockquote q cite abbr address time data details summary dialog ruby rt rp sup sub ins del wbr map area bdi bdo search hgroup menu portal`.split(' '));
  const ATTRS = new Set(`id class style title lang dir hidden tabindex role href src alt target rel type name value placeholder disabled checked selected required readonly multiple for action method enctype autocomplete autofocus accept min max step minlength maxlength width height loading decoding sizes srcset media charset content http-equiv viewbox colspan rowspan scope headers download async defer crossorigin referrerpolicy integrity fetchpriority sandbox allow allowfullscreen poster controls autoplay loop muted playsinline preload draggable contenteditable spellcheck translate inputmode pattern form list open reversed start cite datetime maxLength usemap shape coords kind srclang label high low optimum wrap rows cols rowspan abbr summary nonce slot part popover popovertarget itemprop itemscope itemtype itemid aria-label data-state xmlns`.toLowerCase().split(' '));
  const VOIDS = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
  const OPTIONAL = new Set('html head body li dt dd p rt rp optgroup option colgroup thead tbody tfoot tr td th'.split(' '));
  const OPTIONAL_BY_OPEN = {li:['li'],dt:['dt','dd'],dd:['dt','dd'],p:['address','article','aside','blockquote','div','dl','fieldset','footer','form','h1','h2','h3','h4','h5','h6','header','hgroup','hr','main','menu','nav','ol','p','pre','section','table','ul'],option:['option','optgroup'],optgroup:['optgroup'],tr:['tr','tbody','tfoot','thead'],td:['td','th','tr'],th:['td','th','tr']};
  const INLINE_BODY = new Set(['script','style','textarea','title']);
  const COMMON_PROPS = new Set(`color background background-color background-image background-size background-position background-repeat background-attachment border border-color border-width border-style border-radius border-top border-bottom border-left border-right box-shadow box-sizing margin margin-top margin-bottom margin-left margin-right padding padding-top padding-bottom padding-left padding-right display position top bottom left right inset width min-width max-width height min-height max-height font font-size font-family font-weight font-style line-height letter-spacing text-align text-decoration text-transform text-shadow white-space overflow overflow-x overflow-y opacity visibility z-index cursor flex flex-direction flex-wrap flex-grow flex-shrink flex-basis gap row-gap column-gap align-items align-content align-self justify-content justify-items justify-self order grid grid-template-columns grid-template-rows grid-column grid-row grid-area place-items transform transition transition-duration transition-property animation animation-name animation-duration animation-delay content float clear object-fit object-position filter clip-path aspect-ratio user-select pointer-events list-style list-style-type outline outline-offset vertical-align text-overflow word-break overflow-wrap border-collapse border-spacing background-clip scroll-behavior`.split(' '));
  const AT_RULES = new Set('media supports keyframes font-face import charset namespace page layer container property scope starting-style counter-style font-feature-values document'.split(' '));
  const MAX_PER_FILE = 650;
  const MAX_FILE_LENGTH = 1200000;
  const cache = new Map();
  function lineStarts(src) { const a=[0]; for(let i=0;i<src.length;i++) if(src.charCodeAt(i)===10)a.push(i+1); return a; }
  function place(starts, at) { let lo=0,hi=starts.length-1; const p=Math.max(0,at|0); while(lo<hi){let mid=Math.ceil((lo+hi)/2);if(starts[mid]<=p)lo=mid;else hi=mid-1;}return {line:lo+1,column:p-starts[lo]+1}; }
  function collector(language,file,source,base=0,sourceLang=language) {
    const starts=lineStarts(source),out=[],seen=new Set();
    function add(level,message,tip,at=0,lang=language){
      if(out.length>=MAX_PER_FILE)return;
      const absolute=base+Math.max(0,at),key=[lang,level,message,absolute].join('|');
      if(seen.has(key))return;seen.add(key);
      // All diagnostics navigating to embedded JS/CSS use the enclosing HTML file.
      out.push({language:lang,sourceLang, file,level,message,tip,line:place(starts,absolute).line,column:place(starts,absolute).column,at:absolute});
    }
    return {out,add};
  }
  function closeEnough(a,b){if(Math.abs(a.length-b.length)>2)return 99;let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=row;}return prev[b.length];}
  function suggestion(word, set){if(word.length<3)return '';let result='',dist=99;for(const w of set){const d=closeEnough(word,w);if(d<dist){dist=d;result=w;}}return dist<= (word.length>=4?2:1)?result:'';}
  function isNameStart(ch){return Boolean(ch&&/[A-Za-z]/.test(ch));}
  function isNameChar(ch){return Boolean(ch&&/[A-Za-z0-9:_-]/.test(ch));}
  function isSpace(ch){return Boolean(ch&&/\s/.test(ch));}
  function htmlDiagnostics(source,file){
    const src=String(source||''), c=collector('html',file,src),{add}=c, stack=[],ids=new Map();
    const embeds=[],srcLines=lineStarts(src);let mainCount=0;if(!src.trim())return [];
    if(src.length>MAX_FILE_LENGTH)return [{language:'html',sourceLang:'html',file,level:'info',message:'File too large for live checking',tip:'Use Check All Issues on smaller files for responsive editing.',line:1,column:1}];
    const lower=src.toLowerCase();let i=0,hasDoc=false,hasDoctype=false;
    while(i<src.length){
      if(src[i]!=='<'){i++;continue;}
      const at=i;
      if(src.startsWith('<!--',i)){
        const end=src.indexOf('-->',i+4); if(end<0){add('error','Unclosed HTML comment','Finish the comment with -->.',i);break;}i=end+3;continue;
      }
      if(lower.startsWith('<!doctype',i)){
        const end=src.indexOf('>',i+9);if(end<0){add('error','DOCTYPE is missing >','Complete <!DOCTYPE html>.',i);break;}hasDoctype=true;i=end+1;continue;
      }
      if(src.startsWith('<!',i)||src.startsWith('<?',i)){
        const end=src.indexOf('>',i+2);if(end<0){add('error','Unclosed HTML declaration','Add the missing >.',i);break;}i=end+1;continue;
      }
      const closing=src[i+1]==='/';
      let k=i+(closing?2:1);
      while(isSpace(src[k]))k++;
      if(!isNameStart(src[k])){i++;continue;}
      const startName=k;while(isNameChar(src[k]))k++;
      const name=src.slice(startName,k).toLowerCase();
      if(name==='html'||name==='head'||name==='body')hasDoc=true;
      if(!TAGS.has(name)&&!name.includes('-')&&!name.includes(':')){
        const maybe=suggestion(name,TAGS);
        add('warn',`Unknown HTML element <${name}>`,maybe?`Did you mean <${maybe}>? Custom elements must use a hyphen.`:'Check spelling; custom HTML elements normally include a hyphen.',startName);
      }
      const attrs=new Set();let selfClosing=false,complete=false;
      while(k<src.length){
        while(isSpace(src[k]))k++;
        if(src[k]==='>'){complete=true;k++;break;}
        if(src[k]==='/'&&src[k+1]==='>'){selfClosing=true;complete=true;k+=2;break;}
        if(src[k]==='<'){add('error',`Tag <${name}> is missing >`,`Close the tag before starting another element.`,at);break;}
        if(k>=src.length)break;
        const attrStart=k;
        if(closing){ // Closing tags cannot have attributes.
          if(src[k]!=='>'&&src[k]!=='/')add('warn',`Unexpected text in closing </${name}>`,'A closing tag should contain only its element name.',k);
          while(k<src.length&&src[k]!=='>'&&src[k]!=='<')k++;
          continue;
        }
        while(k<src.length&&!isSpace(src[k])&&src[k]!=='='&&src[k]!=='>'&&src[k]!=='/'&&src[k]!=='<')k++;
        if(k===attrStart){add('warn',`Unexpected character in <${name}>`,'Check the syntax of this attribute.',k);k++;continue;}
        const attr=src.slice(attrStart,k).toLowerCase();
        if(attrs.has(attr))add('warn',`Duplicate attribute "${attr}"`,'Keep each attribute only once per opening tag.',attrStart);
        attrs.add(attr);
        if(!ATTRS.has(attr)&&!attr.startsWith('data-')&&!attr.startsWith('aria-')&&!attr.startsWith('on')&&!attr.includes(':')&&!attr.includes('-')&&!attr.startsWith('x-')){
          const maybe=suggestion(attr,ATTRS);
          if(maybe)add('warn',`Possible misspelled HTML attribute "${attr}"`,`Did you mean "${maybe}"?`,attrStart);
        }
        while(isSpace(src[k]))k++;
        if(src[k]!=='=')continue;
        k++;while(isSpace(src[k]))k++;
        const valueStart=k;let value='';
        if(src[k]==='"'||src[k]==="'"){
          const quote=src[k++],begin=k;
          while(k<src.length&&src[k]!==quote){if(src[k]==='<')break;k++;}
          value=src.slice(begin,k);
          if(src[k]!==quote)add('error',`Unclosed quote for attribute "${attr}"`,`Add the matching ${quote} after this attribute's value.`,valueStart);
          else k++;
        }else{
          const begin=k;while(k<src.length&&!isSpace(src[k])&&src[k]!=='>'&&src[k]!=='<')k++;
          value=src.slice(begin,k);
          if(!value)add('error',`Missing value for attribute "${attr}"`,'Provide an attribute value after =.',valueStart);
        }
        if(attr==='id'&&value){if(ids.has(value))add('warn',`Duplicate id="${value}"`,`An ID should be unique; first used on line ${ids.get(value)}.`,attrStart);else ids.set(value,place(srcLines,attrStart).line);}
      }
      if(!complete){if(k>=src.length)add('error',`Unfinished <${name}> tag`,'Add > to finish the tag.',at);i=Math.max(k,at+1);continue;}
      i=k;
      if(closing){
        if(VOIDS.has(name)){add('warn',`Void HTML element </${name}> should not have a closing tag`,`Remove </${name}>.`,at);continue;}
        const found=stack.map(x=>x.name).lastIndexOf(name);
        if(found<0){if(!OPTIONAL.has(name))add('error',`Closing </${name}> has no matching opening tag`,`Check whether you meant to add <${name}> or remove </${name}>.`,at);continue;}
        for(let j=stack.length-1;j>found;j--){
          const missing=stack.pop();
          if(!OPTIONAL.has(missing.name))add('error',`Missing closing </${missing.name}> before </${name}>`,`You opened <${missing.name}> on line ${place(srcLines,missing.at).line}; close it before </${name}>.`,missing.at);
          else if(missing.name==='p')add('warn','HTML5 implicitly closes <p> here','For learning, consider adding an explicit </p>.',missing.at);
        }
        stack.pop();continue;
      }
      if(name==='img'&&!attrs.has('alt'))add('warn','Image missing alt attribute','Add meaningful alt="...", or alt="" for decorative images.',at);
      if(name==='img'&&!attrs.has('src')&&!attrs.has('srcset'))add('warn','Image has no src or srcset','Provide an image URL or source set.',at);
      if(name==='main'&&++mainCount>1)add('warn','Multiple <main> landmarks on the page','Normally there should be only one visible main landmark.',at);
      if((name==='ul'||name==='ol')&&stack.some(x=>x.name==='p'))add('warn',`<${name}> is inside a paragraph`,'Close </p> before starting a list.',at);
      if(['form','button','a'].includes(name)&&stack.some(x=>x.name===name))add('error',`Nested <${name}> elements are not valid HTML`, `Close the earlier <${name}> before starting another one.`,at);
      if((name==='td'||name==='th')&&!stack.some(x=>x.name==='tr'))add('warn',`<${name}> is outside a table row`,'Place table cells inside a <tr> element.',at);
      if(name==='li'&&!stack.some(x=>x.name==='ul'||x.name==='ol'||x.name==='menu'))add('warn','<li> is outside a list','Put <li> inside <ul>, <ol>, or <menu>.',at);

      if(name==='a'&&!attrs.has('href'))add('info','Link has no href attribute','Add href when this is meant to navigate somewhere.',at);
      if(VOIDS.has(name))continue;
      if(selfClosing && !name.includes('-') && name!=='svg' && name!=='math')add('warn',`Self-closing <${name}/> does not close a normal HTML element`,`Write <${name}></${name}> instead.`,at);
      while(stack.length){
        const top=stack[stack.length-1].name;
        const implied=OPTIONAL_BY_OPEN[top]?.includes(name);
        if(implied){stack.pop();if(top==='p'&&name!=='p')add('warn',`HTML5 implicitly closed <p> before <${name}>`,'For readability, add an explicit </p> before the new block.',at);}else break;
      }
      stack.push({name,at});
      if(INLINE_BODY.has(name)){
        const closeIndex=lower.indexOf('</'+name, i);
        const innerEnd=closeIndex<0?src.length:closeIndex;
        if(name==='style')embeds.push({language:'css',code:src.slice(i,innerEnd),offset:i});
        if(name==='script'){
          // TypeScript, JSON-LD, import maps etc. are not JavaScript scripts.
          const head=src.slice(at,i),typed=/(?:^|\s)type\s*=\s*(?:["']([^"']+)["']|([^\s>]+))/i.exec(head);
          const type=(typed?.[1]||typed?.[2]||'').toLowerCase();
          if(!type||type==='module'||/^(?:application|text)\/(?:javascript|ecmascript)$/.test(type))embeds.push({language:'js',code:src.slice(i,innerEnd),offset:i,module:type==='module'});
        }
        if(closeIndex<0){
          if(!OPTIONAL.has(name))add('error',`Missing closing </${name}> tag`,`Close this element with </${name}>.`,at);
          stack.pop();break;
        }
        i=closeIndex;
      }
    }
    for(const open of stack){
      if(!OPTIONAL.has(open.name))add('error',`Unclosed <${open.name}> tag`,`Add a matching </${open.name}>. Opening tag is on line ${place(srcLines,open.at).line}.`,open.at);
    }
    if(hasDoc&&!hasDoctype)add('warn','Missing HTML5 doctype','Start a full HTML document with <!DOCTYPE html>.',0);
    // Inline CSS/JS diagnostics are classified by their actual language while
    // the navigation opens their containing HTML file.
    let out=c.out;
    for(const e of embeds){
      const embedded=e.language==='css'?cssDiagnostics(e.code,file):jsDiagnostics(e.code,file,e.module);
      for(const d of embedded){
        if(d.language!=='css'&&d.language!=='js')continue;
        const p=place(srcLines,e.offset+(d.at||0));
        out.push({...d,sourceLang:'html',file,line:p.line,column:p.column,at:e.offset+(d.at||0)});
      }
    }
    return out;
  }
  // CSS scanner uses a tokenizer-like state machine: comments, strings,
  // parentheses, brackets and nested blocks are processed structurally.
  // Avoids regex splitting on semicolons inside values such as url() and strings.
  function cssDiagnostics(source,file){
    const css=String(source||''),c=collector('css',file,css),{add}=c;
    if(!css.trim())return [];
    if(css.length>MAX_FILE_LENGTH){add('info','File too large for live checking','Split very large stylesheets into smaller files.');return c.out;}
    const n=css.length,cssLines=lineStarts(css);
    function scan(start){
      let i=start,round=0,square=0,quote='',comment=false;
      while(i<n){const ch=css[i],nx=css[i+1];
        if(comment){if(ch==='*'&&nx==='/'){comment=false;i+=2;continue;}i++;continue;}
        if(quote){if(ch==='\\'){i+=2;continue;}if(ch===quote)quote='';i++;continue;}
        if(ch==='/'&&nx==='*'){comment=true;i+=2;continue;}
        if(ch==='"'||ch==="'"){quote=ch;i++;continue;}
        if(ch==='(')round++;else if(ch===')'){if(!round)add('error','Unexpected ) in CSS','Remove it or add the matching opening (.',i);else round--;}
        else if(ch==='[')square++;else if(ch===']'){if(!square)add('error','Unexpected ] in CSS','Remove it or add the matching opening [.',i);else square--;}
        if(round===0&&square===0&&('{;}'.includes(ch)))return {end:i,delimiter:ch};
        i++;
      }
      if(comment)add('error','Unclosed CSS comment','Finish the comment with */.',n-1);
      if(quote)add('error','Unclosed CSS string','Add the matching quote.',n-1);
      if(round)add('error','Unclosed CSS parenthesis','Add the missing ).',start);
      if(square)add('error','Unclosed CSS attribute selector bracket','Add the missing ].',start);
      return {end:n,delimiter:''};
    }
    function checkDecl(piece,offset,kind){
      // Skip CSS comments without consuming real declarations. Preserve the
      // original offset so clicking the issue still goes to the right line.
      const cleaned=piece.replace(/\/\*[\s\S]*?\*\//g, m=>' '.repeat(m.length));
      const trim=cleaned.trim();if(!trim)return;
      const at=offset+cleaned.indexOf(trim);
      if(trim.startsWith('@')){const name=/^@([\w-]+)/.exec(trim)?.[1]||'';if(!AT_RULES.has(name)&&name){const maybe=suggestion(name,AT_RULES);add('warn',`Unknown CSS @${name} rule`,maybe?`Did you mean @${maybe}?`:'Check the name of this at-rule.',at);}return;}
      const colon=trim.indexOf(':');
      if(colon<0){
        if(kind==='rules' || trim.startsWith('/*'))return;
        add('error',`CSS declaration is missing a colon: ${trim.slice(0,60)}`,'Write property: value; (for example, color: red;).',at);return;
      }
      if(kind==='rules'){
        // Bare declaration at the top level is suspicious and won't style an element.
        if(!trim.startsWith('@'))add('warn','CSS declaration appears outside a selector block','Put the declaration inside selector { ... }.',at);
        return;
      }
      const property=trim.slice(0,colon).trim(),value=trim.slice(colon+1).trim();
      if(!/^--[\w-]+$/.test(property)&& !/^-?[a-zA-Z][\w-]*$/.test(property)){
        add('error',`Invalid CSS property name: ${property.slice(0,60)}`,'Check the property spelling and remove extra punctuation.',at);return;
      }
      if(!value){add('error',`Missing value for ${property}`,'Add a value after the colon.',at);return;}
      // Catch a second declaration after an omitted semicolon; preserve the
      // precise position in the source instead of splitting a CSS value.
      const second=/\n\s*([\w-]+)\s*:/.exec(value);
      if(second){const candidate=second[1];if(COMMON_PROPS.has(candidate)||candidate.startsWith('--'))add('error',`Possible missing semicolon before ${candidate}`,'Add ; between the two CSS property declarations.',at+trim.indexOf(value)+second.index);}
      if(property.startsWith('--')||property.startsWith('-'))return;
      const prop=property.toLowerCase();
      const cssApi=host.CSS;
      let known=COMMON_PROPS.has(prop);
      if(cssApi?.supports){try{known=known||cssApi.supports(prop,'initial')||cssApi.supports(prop,'inherit');}catch{}}
      if(!known){const maybe=suggestion(prop,COMMON_PROPS);add('warn',`Unrecognized CSS property "${property}"`,maybe?`Did you mean "${maybe}"?`:'Check spelling and whether your browser supports this property.',at);return;}
      if(cssApi?.supports && !/\b(?:var|env|attr)\s*\(/i.test(value) && !/\b(?:revert-layer|inherit|initial|unset|revert)\b/i.test(value)){
        try{if(!cssApi.supports(prop,value))add('warn',`Check CSS value for ${property}: ${value.slice(0,70)}`,'The current browser does not recognize this property/value combination; check spelling and browser support.',at+trim.indexOf(value));}catch{}
      }
    }
    // kind='rules' for stylesheet, 'decl' for declarations inside a rule.
    function parseBlock(start,kind,openedAt=0,depth=0){
      if(depth>60){add('error','CSS nesting is too deep','Check missing closing braces and reduce excessive nesting.',start);return n;}
      let i=start;
      while(i<n){
        const token=scan(i),part=css.slice(i,token.end),trim=part.trim(),at=i+Math.max(0,part.search(/\S/));
        if(token.delimiter===';'){checkDecl(part,i,kind);i=token.end+1;continue;}
        if(token.delimiter==='{'){
          if(!trim){add('error','CSS block has no selector or at-rule','Add a selector before {.',token.end);}
          else if(trim.startsWith('@')){const name=/^@([\w-]+)/.exec(trim)?.[1]||'';if(!AT_RULES.has(name)){const maybe=suggestion(name,AT_RULES);add('warn',`Unknown CSS @${name} rule`,maybe?`Did you mean @${maybe}?`:'Check this at-rule name.',at);}}
          else if(kind==='rules' && /^[-\w]+\s*:\s*[^{}]+$/.test(trim))add('warn','CSS property used where a selector is expected','Wrap properties inside a selector block.',at);
          const ruleName=/^@([\w-]+)/.exec(trim)?.[1]||'';
          const innerKind=(!ruleName||['font-face','property','page','counter-style'].includes(ruleName))?'decl':'rules';
          i=parseBlock(token.end+1,innerKind,token.end,depth+1);continue;
        }
        if(token.delimiter==='}'){
          if(trim)checkDecl(part,i,kind);
          if(depth===0){add('error','Unexpected closing }','Remove this } or add a matching opening {.',token.end);i=token.end+1;continue;}
          return token.end+1;
        }
        if(trim){
          if(kind==='decl')checkDecl(part,i,kind);
          else if(trim.startsWith('@'))checkDecl(part,i,kind);
          else add('warn','CSS rule is missing an opening {','Write selector { property: value; }.',at);
        }
        if(depth>0)add('error','Missing closing } in CSS',`Add } to close the block opened on line ${place(cssLines,openedAt).line}.`,openedAt);
        return n;
      }
      if(depth>0)add('error','Missing closing } in CSS',`Add } to close the block opened on line ${place(cssLines,openedAt).line}.`,openedAt);
      return n;
    }
    parseBlock(0,'rules');return c.out;
  }
  function jsDiagnostics(source,file,module=false){
    const js=String(source||''),c=collector('js',file,js),{add}=c;
    if(!js.trim())return [];
    if(js.length>MAX_FILE_LENGTH){add('info','File too large for live checking','Split large scripts into smaller files.');return c.out;}
    const parser=host.acorn;
    if(typeof parser?.parse!=='function'){
      add('info','JavaScript parser is unavailable','Refresh G8Code and confirm studio-v2-acorn.js was uploaded.',0);return c.out;
    }
    const opts={ecmaVersion:'latest',locations:true,allowHashBang:true,sourceType:module?'module':'script'};
    let ast;
    try{ast=parser.parse(js,opts)}catch(scriptError){
      if(!module){try{ast=parser.parse(js,{...opts,sourceType:'module'});}catch{}}
      if(!ast){const at=Number.isInteger(scriptError.pos)?scriptError.pos:0;add('error',`JavaScript syntax: ${String(scriptError.message||'Invalid syntax').replace(/\s*\(\d+:\d+\)$/, '')}`,'Check the code at this line/column; match quotes, braces and parentheses. Module imports need module syntax.',at);return c.out;}
    }
    // AST checks are supplementary warnings, never guesses about the student's
    // intended program logic. Traversal is bounded by node count for mobile.
    let nodes=0;
    function visit(node,parent){
      if(!node||typeof node!=='object'||!node.type||++nodes>25000)return;
      if(node.type==='IfStatement'||node.type==='WhileStatement'||node.type==='DoWhileStatement'){
        if(node.test?.type==='AssignmentExpression')add('warn','Assignment used as a condition','Did you mean a comparison (===) instead of =?',node.test.start);
      }
      if(node.type==='BinaryExpression'&&['==','!='].includes(node.operator))add('info',`Consider strict comparison (${node.operator==='=='?'===':'!=='})`,'Strict comparison avoids unexpected type conversion.',node.start);
      if(node.type==='CallExpression'&&node.callee?.type==='MemberExpression'&&node.callee.object?.name==='document'&&node.callee.property?.name==='querySelector'&&node.arguments?.length===0)add('warn','querySelector is missing its selector argument','Example: document.querySelector("#myId")',node.start);
      if(node.type==='VariableDeclaration'&&node.kind==='const'&&node.declarations?.some(d=>!d.init))add('error','A const declaration requires an initial value','Example: const total = 0;',node.start);
      for(const key of Object.keys(node)){
        if(key==='parent'||key==='loc'||key==='start'||key==='end')continue;
        const val=node[key];
        if(Array.isArray(val)){for(const child of val){if(child&&typeof child.type==='string')visit(child,node);}}
        else if(val&&typeof val.type==='string')visit(val,node);
      }
    }
    visit(ast,null);return c.out;
  }
  function run(language,source,file){
    const text=String(source||''),key=language+'|'+file,entry=cache.get(key);
    if(entry&&entry.text===text)return entry.result.map(x=>({...x}));
    const result=language==='html'?htmlDiagnostics(text,file):language==='css'?cssDiagnostics(text,file):jsDiagnostics(text,file);
    // Cache only the most recent revision for each file; bounded number of file entries.
    cache.delete(key);cache.set(key,{text,result});
    if(cache.size>75)cache.delete(cache.keys().next().value);
    return result.map(x=>({...x}));
  }
  assist.diagnoseHTML=(source,file='index.html')=>run('html',source,file);
  assist.diagnoseCSS=(source,file='style.css')=>run('css',source,file);
  assist.diagnoseJS=(source,file='script.js')=>run('js',source,file);
  assist.diagnosticsVersion='2.8';
  host.G8StudioAdvancedDiagnostics={diagnoseHTML:assist.diagnoseHTML,diagnoseCSS:assist.diagnoseCSS,diagnoseJS:assist.diagnoseJS,version:'2.8'};
})(typeof window==='object'?window:globalThis);
