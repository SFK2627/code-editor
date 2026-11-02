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
  host.G8StudioEditAssist = { LocalHistory, diagnoseHTML, diagnoseCSS };
})(typeof window === 'object' ? window : globalThis);
