/* G8Code Studio V2.43 — literal file search and guided learning explanations.
   Pure utilities. Does not read cloud data, alter source code, or run student code. */
(function (host) {
  'use strict';
  const GROUP = {html:'pages', css:'cssFiles', js:'jsFiles'};
  function scan(files, term, options = {}) {
    const query = String(term || '');
    if (!query) return {matches:[], truncated:false};
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matcher = new RegExp(safe, options.caseSensitive ? 'g' : 'gi');
    const matches = [], limit = 2000;
    for (const [lang, name, raw] of files) {
      const text = String(raw || '');
      matcher.lastIndex = 0;
      let found;
      while ((found = matcher.exec(text))) {
        const at = found.index;
        if (matches.length >= limit) return {matches, truncated:true};
        const start = Math.max(0, at - 42), end = Math.min(text.length, at + query.length + 52);
        matches.push({lang, name, at, end:at+found[0].length, line:text.slice(0,at).split('\n').length,
          context:text.slice(start,end).replace(/\s+/g,' ').slice(0,120)});
        if(matcher.lastIndex === at)matcher.lastIndex++;
      }
    }
    return {matches, truncated:false};
  }
  function plan(files, matches, replacement) {
    const grouped = new Map();
    for (const m of matches) {
      const key=m.lang+'\u0000'+m.name;
      if (!grouped.has(key)) grouped.set(key, {lang:m.lang,name:m.name,positions:[]});
      grouped.get(key).positions.push(m);
    }
    const result=[];
    for (const group of grouped.values()) {
      const entry=files.find(x=>x[0]===group.lang&&x[1]===group.name);
      if (!entry) return null;
      const before=String(entry[2]||'');let out='',cursor=0;
      for (const m of group.positions) {
        if (m.at<cursor) return null;
        out+=before.slice(cursor,m.at)+replacement;cursor=m.end;
      }
      out+=before.slice(cursor);
      result.push({lang:group.lang,name:group.name,before,after:out,count:group.positions.length});
    }
    return result;
  }
  function explanation(issue) {
    const message=String(issue?.message||'').slice(0,500), level=issue?.level==='error'?'error':'warning';
    let why='This message points to something worth checking in your code.', example='Look at the line shown in the console.', question='Which part of the line would you check first?';
    const rule=(pattern,a,b,c)=>{if(pattern.test(message)){why=a;example=b;question=c;return true}return false};
    if (rule(/duplicate id=/i,'An HTML id should normally be unique within one page.','<div id="card"> ... </div>','Can you find the second element using the same id?')) {}
    else if (rule(/missing alt/i,'Images need an alt attribute for accessible descriptions. Decorative images can use an empty alt.','<img src="photo.png" alt="...">','What information does this image communicate?')) {}
    else if (rule(/unclosed|no matching opening tag/i,'Opening and closing HTML tags should be properly paired.','<section> ... </section>','Which opening or closing tag might be missing?')) {}
    else if (rule(/closing \}|missing closing \}/i,'CSS blocks use matching curly braces.','h1 { color: blue; }','Can you count the opening and closing braces in this rule?')) {}
    else if (rule(/malformed CSS|^Check [\w-]+:/i,'The browser may not recognize a CSS property or value. This can also be a browser-support warning.','p { color: blue; }','Is the property spelled correctly, and is its value valid?')) {}
    else if (rule(/ReferenceError|is not defined/i,'JavaScript cannot find a variable or function with that name. Names are case-sensitive.','const score = 5;','Where was the name declared, and does its spelling match?')) {}
    else if (rule(/SyntaxError|Unexpected token|Unexpected end/i,'JavaScript could not understand part of the code structure.','if (ready) { /* action */ }','Can you check the brackets, quotes, and punctuation near the reported line?')) {}
    else if (rule(/TypeError|Cannot read properties|is not a function/i,'Your code may be trying to use a value that does not exist or does not support that operation.','const button = document.querySelector("button");','Is the element or value available at the moment you use it?')) {}
    else if (rule(/Failed to fetch|network|CORS/i,'A web resource or network request could not be accessed. It is not necessarily a code syntax mistake.','fetch("https://example.com/data")','Is the URL correct and is access allowed?')) {}
    else if (rule(/console\.warn|warning/i,'This is a warning rather than proof of a broken program.','console.warn("Check this value");','Is the message from your code or from the browser?')) {}
    return {level,message,why,example,question,notice:'Learning hint only — this does not change your code or official rubric score.'};
  }
  host.G8StudioFindLearn={scan,plan,explanation,GROUP};
})(typeof window==='object'?window:globalThis);
