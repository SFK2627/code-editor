/* G8Code Studio V2.42 — per-file local undo and conservative HTML/CSS diagnostics.
   No Firebase writes, no code execution, no impact on official rubric scores. */
(function (host) {
  'use strict';
  class LocalHistory {
    constructor(max = 80) { this.max = max; this.items = new Map(); }
    key(lang, file) { return lang + ':' + file; }
    item(lang, file) {
      const key = this.key(lang, file);
      if (!this.items.has(key)) this.items.set(key, { undo: [], redo: [] });
      return this.items.get(key);
    }
    record(lang, file, before, after, selection, stamp = Date.now(), inputType = '') {
      if (before === after) return;
      const h = this.item(lang, file), last = h.undo[h.undo.length - 1];
      // Coalesce consecutive typing only. Do NOT coalesce paste, formatting or
      // delete operations, so each can be independently undone.
      const typing = inputType === 'insertText' || inputType === 'deleteContentBackward';
      if (typing && last && last.typing && last.type === inputType && stamp - last.stamp < 550 && last.after === before) {
        last.after = after;
        last.afterCaret = selection;
        last.stamp = stamp;
      } else {
        h.undo.push({ before, after, beforeCaret: selection, afterCaret: selection, stamp, type: inputType, typing });
        if (h.undo.length > this.max) h.undo.shift();
      }
      h.redo.length = 0;
    }
    can(lang, file, direction, current) {
      const h = this.item(lang, file), list = direction === 'undo' ? h.undo : h.redo;
      const top = list[list.length - 1];
      return Boolean(top && current === (direction === 'undo' ? top.after : top.before));
    }
    step(lang, file, direction, current) {
      const h = this.item(lang, file);
      if (!this.can(lang, file, direction, current)) return null;
      if (direction === 'undo') {
        const step = h.undo.pop(); h.redo.push(step);
        return { text: step.before, caret: Math.min(step.before.length, step.beforeCaret) };
      }
      const step = h.redo.pop(); h.undo.push(step);
      return { text: step.after, caret: Math.min(step.after.length, step.afterCaret) };
    }
    // Crucial safety property: remote collaboration updates invalidate the
    // local undo stack for THAT file. Never restore a stale full text snapshot.
    invalidate(lang, file) { this.items.delete(this.key(lang, file)); }
    reset() { this.items.clear(); }
  }
  const lineAt = (text, at) => text.slice(0, Math.max(0, at)).split('\n').length;
  const issue = (language, file, level, message, tip, text, at) => ({ language, file, level, message, tip, line: lineAt(text, at) });

  function diagnoseHTML(source, file = 'index.html') {
    const out = [], html = String(source || '');
    if (html.length > 150000 || !html.trim()) return out;
    // Ignore script/style/comment text when searching for literal markup.
    const masked = html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, m => ' '.repeat(m.length));
    const ids = new Map();
    const tag = /<([A-Za-z][\w:-]*)\b([^<>]*?)\s*\/?>/g;
    for (const match of masked.matchAll(tag)) {
      const name = match[1].toLowerCase(), attr = match[2], pos = match.index;
      const id = attr.match(/(?:^|\s)id\s*=\s*(["'])(.*?)\1/i);
      if (id) {
        const value = id[2].trim();
        if (value && ids.has(value)) out.push(issue('html',file,'warn',`Duplicate id="${value}"`,`An id should identify only one element on a page.`,html,pos));
        else if (value) ids.set(value, pos);
      }
      if (name === 'img' && !/(?:^|\s)alt\s*=/i.test(attr))
        out.push(issue('html',file,'warn','Image is missing alt text','Add alt="..." to describe this image, or alt="" if purely decorative.',html,pos));
      if (out.length >= 16) break;
    }
    // High-confidence unclosed pairs only; HTML can auto-close p, li, td etc.
    // When writing a fragment, warn (rather than calling it a definite error).
    const required = new Set(['div','span','section','article','main','nav','header','footer','form','button','table','ul','ol','textarea','h1','h2','h3','h4','h5','h6']);
    const open = [], tags = /<\/?\s*([A-Za-z][\w:-]*)\b[^>]*>/g;
    for (const m of masked.matchAll(tags)) {
      const name = m[1].toLowerCase();
      if (!required.has(name)) continue;
      if (m[0].startsWith('</')) {
        if (open.length && open[open.length - 1].name === name) open.pop();
        else if (!open.some(t => t.name === name)) out.push(issue('html',file,'warn',`Closing </${name}> has no matching opening tag`,`Check the opening <${name}> tag.`,html,m.index));
        // Complex nested markup can auto-recover; avoid guessing about other tags.
      } else if (!/\/\s*>$/.test(m[0])) open.push({ name, at: m.index });
      if (out.length >= 16) break;
    }
    for (const item of open.slice(0, Math.max(0, 16 - out.length)))
      out.push(issue('html',file,'warn',`Possible unclosed <${item.name}> tag`,`Check whether <${item.name}> needs a closing </${item.name}>.`,html,item.at));
    return out.slice(0, 16);
  }

  function diagnoseCSS(source, file = 'style.css') {
    const css = String(source || ''), out = [];
    if (css.length > 150000 || !css.trim()) return out;
    // Strip comments and string contents but preserve character offsets.
    const clean = css.replace(/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, m => m.replace(/[^\n]/g, ' '));
    const stack = []; let parens = 0;
    for (let i = 0; i < clean.length; i++) {
      const c = clean[i];
      if (c === '(') parens++;
      else if (c === ')') parens = Math.max(0, parens - 1);
      else if (parens === 0 && c === '{') stack.push(i);
      else if (parens === 0 && c === '}') {
        if (!stack.length) out.push(issue('css',file,'error','Unexpected closing }','Remove the extra brace or add the missing opening {.',css,i));
        else stack.pop();
      }
      if (out.length >= 12) break;
    }
    for (const at of stack.slice(-Math.max(0, 12 - out.length))) out.push(issue('css',file,'warn','Possible missing closing }','Check that your CSS rule has a matching closing brace.',css,at));
    // The browser CSS.supports API gives substantially safer property/value
    // validation than hand-written lists of CSS syntax. Avoid custom props,
    // interpolations, vendor extensions, and nested/at-rule expressions.
    if (typeof host.CSS?.supports === 'function') {
      const rule = /(?:^|[;}])\s*([^{}]+?)\{([^{}]*)\}/g;
      for (const m of clean.matchAll(rule)) {
        const prelude = m[1].trim();
        if (!prelude || prelude.startsWith('@')) continue;
        let offset = m.index + m[0].indexOf('{') + 1;
        for (const declaration of m[2].split(';')) {
          const item = declaration.trim(); const at = css.indexOf(item, offset);
          offset += declaration.length + 1;
          if (!item || item.startsWith('@')) continue;
          const match = item.match(/^([\w-]+)\s*:\s*([\s\S]+)$/);
          if (!match) {
            if (item.includes(':')) out.push(issue('css',file,'warn','Possible malformed CSS declaration','Check the property and value syntax.',css,at >= 0 ? at : m.index));
            continue;
          }
          const property = match[1].toLowerCase(), value = match[2].trim();
          if (!value || property.startsWith('--') || property.startsWith('-') || /\b(?:var|env)\s*\(/i.test(value)) continue;
          try {
            if (!host.CSS.supports(property, value))
              out.push(issue('css',file,'warn',`Check ${property}: ${value.slice(0,65)}`,`The browser does not recognize this property/value combination. Check spelling or browser support.`,css,at >= 0 ? at : m.index));
          } catch {}
          if (out.length >= 16) break;
        }
        if (out.length >= 16) break;
      }
    }
    return out.slice(0, 16);
  }
  // Advisory spellcheck for familiar HTML5 names; custom elements (with a dash)
  // and SVG/XML names are deliberately excluded.
  const knownTags = new Set(('html head title body meta link base style script noscript template slot main section article header footer nav aside div span p br hr a img picture source figure figcaption audio video track canvas svg iframe embed object param form input button label select option optgroup textarea fieldset legend datalist output progress meter table caption thead tbody tfoot tr td th col colgroup ul ol li dl dt dd h1 h2 h3 h4 h5 h6 strong em b i u s small mark code pre samp kbd var blockquote q cite abbr address time data details summary dialog ruby rt rp sup sub ins del wbr map area').split(' '));
  const knownAttrs = new Set(('id class style title lang dir hidden tabindex role href src alt target rel type name value placeholder disabled checked selected required readonly multiple for action method enctype autocomplete autofocus accept min max step minlength maxlength width height loading decoding sizes srcset media charset content http-equiv viewbox aria-label').split(' '));
  const optionalTags = new Set(('li dt dd p rt rp optgroup option colgroup thead tbody tfoot tr td th html head body').split(' '));
  const lev=(a,b)=>{ if(Math.abs(a.length-b.length)>2)return 9;let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]!==b[j-1]));prev=next;}return prev[b.length];};
  const suggestion=(word,choices)=>{let best='',d=9;for(const candidate of choices){const n=lev(word,candidate);if(n<d){best=candidate;d=n;}}return d<=(word.length>=3?2:1)?best:'';};
  const previousHTML = diagnoseHTML;
  diagnoseHTML = function(source,file='index.html'){
    const html=String(source||''),found=previousHTML(source,file);
    if(!html.trim()||html.length>150000)return found;
    const stripped=html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,m=>' '.repeat(m.length));
    const tags=/<\/?\s*([A-Za-z][\w:-]*)\b([^<>]*?)>/g;let m;
    while((m=tags.exec(stripped))&&found.length<25){
      const name=m[1].toLowerCase(),pos=m.index;
      if(!knownTags.has(name)&&!name.includes('-')&&!name.includes(':')){
        const maybe=suggestion(name,knownTags);if(maybe)found.push(issue('html',file,'warn',`Unknown HTML5 tag <${name}>`,`Did you mean <${maybe}>? Custom elements should contain a hyphen.`,html,pos));
      }
      if(m[0].startsWith('</'))continue;
      const attrs=m[2].replace(/"[^"]*"|'[^']*'/g,'""');
      for(const a of attrs.matchAll(/(?:^|\s)([A-Za-z][\w:-]*)(?=\s*(?:=|\s|$))/g)){
        const key=a[1].toLowerCase();if(knownAttrs.has(key)||key.startsWith('data-')||key.startsWith('aria-')||key.startsWith('on')||key.includes(':')||key.startsWith('x-'))continue;
        const maybe=suggestion(key,knownAttrs);if(maybe)found.push(issue('html',file,'warn',`Unrecognized attribute "${key}"`,`Did you mean "${maybe}"?`,html,pos));
        if(found.length>=25)break;
      }
      // A stray opening tag syntax (missing >) is reported separately below.
    }
    const stray=/<[A-Za-z][^<>\n]*$/gm;while((m=stray.exec(stripped))&&found.length<25){found.push(issue('html',file,'warn','Possible missing > in HTML tag','Complete the opening tag with >.',html,m.index));}
    return found.slice(0,25);
  };
  const previousCSS = diagnoseCSS;
  diagnoseCSS=function(source,file='style.css'){
    const css=String(source||''),found=previousCSS(source,file);if(!css.trim()||css.length>150000)return found;
    if((css.match(/\/\*/g)||[]).length>(css.match(/\*\//g)||[]).length)found.push(issue('css',file,'warn','Unclosed CSS comment','Finish the comment with */.',css,css.lastIndexOf('/*')));
    // A conservative scan of simple declaration blocks only, respecting strings.
    const simple=/([^{}]+)\{([^{}]*)\}/g;let block;
    while((block=simple.exec(css))&&found.length<25){
      const selector=block[1].trim();if(selector.startsWith('@')||selector.includes('/*'))continue;
      const body=block[2],bodyStart=block.index+block[0].indexOf('{')+1;
      const masked=body.replace(/"[^"]*"|'[^']*'/g,m=>' '.repeat(m.length));
      const lines=masked.split(/;(?![^()]*\))/);
      for(let k=0;k<lines.length;k++){
        const decl=lines[k].trim();if(!decl||decl.startsWith('/*'))continue;
        const at=bodyStart+masked.indexOf(lines[k]);
        // A newline followed by another property: suggests a missing semicolon.
        const next=/\n\s*[\w-]+\s*:/.exec(decl);
        if(next&&decl.includes(':'))found.push(issue('css',file,'warn','Possible missing semicolon between CSS declarations','Separate property declarations with ;.',css,at+next.index));
        if(!decl.includes(':')&&/^[a-z-]+\s+[\w#.(]/i.test(decl))found.push(issue('css',file,'warn','CSS declaration may be missing a colon','Use property: value;.',css,at));
        if(found.length>=25)break;
      }
    }
    return found.slice(0,25);
  };
  function diagnoseJS(source,file='script.js'){
    const js=String(source||'');if(!js.trim()||js.length>150000)return [];
    // Compile only; NEVER execute student code. CSP can prohibit dynamic
    // compilation, in which case silently defer to the sandbox preview.
    if(/(^|\n)\s*(?:import|export)\s/m.test(js))return [];
    try{new Function(js);return [];}catch(err){
      if(err&&err.name==='EvalError')return [];
      const message=String(err?.message||'JavaScript syntax issue');
      if(/unsafe-eval|content security policy|refused to evaluate|CSP/i.test(message))return [];
      return [issue('js',file,'error','JavaScript syntax: '+message.slice(0,150),'Check braces, quotes, parentheses, and punctuation. Runtime problems appear when you run the preview.',js,0)];
    }
  }
  host.G8StudioEditAssist = { LocalHistory, diagnoseHTML, diagnoseCSS, diagnoseJS };
})(typeof window === 'object' ? window : globalThis);
