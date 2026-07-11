function resetFileNameDialogDefaults() {
  if (htmlFileNameInput) htmlFileNameInput.value = DEFAULT_CODE_FILE_NAMES.html;
  if (cssFileNameInput) cssFileNameInput.value = DEFAULT_CODE_FILE_NAMES.css;
  if (jsFileNameInput) jsFileNameInput.value = DEFAULT_CODE_FILE_NAMES.js;
  if (fileNameDialogNote) fileNameDialogNote.textContent = 'Defaults restored. Click Apply Names to save.';
}

function getCompactStatusLabel(text) {
  const value = String(text || '').toLowerCase();
  if (!value || value === 'ready') return 'Ready';
  if (value.includes('fail') || value.includes('error') || value.includes('required') || value.includes('choose activity')) return 'Notice';
  if (value.includes('save') || value.includes('saved') || value.includes('download')) return 'Saved';
  if (value.includes('check') || value.includes('score') || value.includes('rubric') || value.includes('result')) return 'Checked';
  if (value.includes('feedback') || value.includes('review')) return 'Feedback';
  if (value.includes('run') || value.includes('output')) return 'Run';
  if (value.includes('editor') || value.includes('tab') || value.includes('zoom')) return 'Editor';
  if (value.includes('firebase') || value.includes('cloud') || value.includes('local')) return 'Ready';
  if (value.includes('login') || value.includes('teacher')) return 'Admin';
  return 'Ready';
}

function setStatus(text) {
  const fullText = String(text || 'Ready');
  statusBadge.textContent = getCompactStatusLabel(fullText);
  statusBadge.title = fullText;
  clearTimeout(setStatus.timer);
  setStatus.timer = setTimeout(() => {
    statusBadge.textContent = 'Ready';
    statusBadge.title = 'Ready';
  }, 1400);
}


function sanitizeFilename(value) {
  const cleaned = String(value || 'student-code')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'student-code';
}

function getCurrentDateStamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ensureDownloadIndexHTML(html, hasCSS, hasJS, fileNames = getCodeFileNames()) {
  let output = html || '';
  const names = normalizeCodeFileNames(fileNames);
  const cssLink = `  <link rel="stylesheet" href="${names.css}">`;
  const jsScript = `  <script src="${names.js}"><\/script>`;
  const looksLikeFullDocument = /<!doctype/i.test(output) || /<html(\s|>)/i.test(output) || /<head(\s|>)/i.test(output) || /<body(\s|>)/i.test(output);
  const cssReferences = getExternalCSSReferences(output);
  const jsReferences = getExternalJSReferences(output);

  if (!looksLikeFullDocument) {
    return `<!DOCTYPE html>
<html>
  <head>
    <title>Student Output</title>${hasCSS ? `\n${cssLink}` : ''}
  </head>
  <body>
${output}
${hasJS ? `\n${jsScript}` : ''}
  </body>
</html>`;
  }

  // If the student already added an external link/script, preserve it.
  // This allows wrong filenames to behave like real web files: mismatched names will not work.
  if (hasCSS && !cssReferences.length) {
    if (/<\/head\s*>/i.test(output)) {
      output = output.replace(/<\/head\s*>/i, `${cssLink}\n</head>`);
    } else if (/<body(\s|>)/i.test(output)) {
      output = output.replace(/<body(\s|>)/i, `${cssLink}\n$&`);
    } else {
      output = `${cssLink}\n${output}`;
    }
  }

  if (hasJS && !jsReferences.length) {
    if (/<\/body\s*>/i.test(output)) {
      output = output.replace(/<\/body\s*>/i, `${jsScript}\n</body>`);
    } else {
      output = `${output}\n${jsScript}`;
    }
  }

  return output;
}


function makeReadmeFile() {
  const title = activity?.title || 'No selected activity';
  const instructions = activity?.description || 'No selected activity instructions.';
  const pageNames = getHTMLPageNames();
  const cssNames = getLanguageFileNames('css');
  const jsNames = getLanguageFileNames('js');
  return [
    'Grade 8 MCSian Web Code Editor - Saved Code',
    '================================',
    '',
    `Activity: ${title}`,
    `Saved: ${new Date().toLocaleString()}`,
    '',
    'HTML pages included:',
    ...pageNames.map(name => `- ${name}`),
    '',
    'CSS files included:',
    ...cssNames.map(name => `- ${name}`),
    '',
    'JavaScript files included:',
    ...jsNames.map(name => `- ${name}`),
    '',
    'How to open:',
    '1. Extract this ZIP file.',
    `2. Open ${pageNames.includes('index.html') ? 'index.html' : pageNames[0]} in a browser.`,
    '3. Use the page links to move between pages.',
    '',
    'Activity instructions:',
    instructions,
    '',
    'Note:',
    'If HTML uses external CSS/JS links, the href/src names must match included CSS and JS files.',
    'For multi-page websites, links like href="about.html" must match an included page file.'
  ].join('\n');
}

function makeCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crc32Table = makeCRC32Table();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crc32Table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function littleEndian16(value) {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function littleEndian32(value) {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  ]);
}

function concatUint8Arrays(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach(part => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function getZipDateTime() {
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  return { time, date };
}

function createZipBlob(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, date } = getZipDateTime();

  files.forEach(file => {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content || '');
    const checksum = crc32(contentBytes);
    const size = contentBytes.length;

    const localHeader = concatUint8Arrays([
      littleEndian32(0x04034b50),
      littleEndian16(20),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(time),
      littleEndian16(date),
      littleEndian32(checksum),
      littleEndian32(size),
      littleEndian32(size),
      littleEndian16(nameBytes.length),
      littleEndian16(0),
      nameBytes
    ]);

    localParts.push(localHeader, contentBytes);

    const centralHeader = concatUint8Arrays([
      littleEndian32(0x02014b50),
      littleEndian16(20),
      littleEndian16(20),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(time),
      littleEndian16(date),
      littleEndian32(checksum),
      littleEndian32(size),
      littleEndian32(size),
      littleEndian16(nameBytes.length),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian32(0),
      littleEndian32(offset),
      nameBytes
    ]);

    centralParts.push(centralHeader);
    offset += localHeader.length + contentBytes.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = concatUint8Arrays([
    littleEndian32(0x06054b50),
    littleEndian16(0),
    littleEndian16(0),
    littleEndian16(files.length),
    littleEndian16(files.length),
    littleEndian32(centralDirectory.length),
    littleEndian32(offset),
    littleEndian16(0)
  ]);

  return new Blob([concatUint8Arrays([...localParts, centralDirectory, endRecord])], { type: 'application/zip' });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}


function downloadCodeAsZip() {
  saveActiveEditor();
  const pages = getHTMLPages();
  const cssFiles = getLanguageFileMap('css');
  const jsFiles = getLanguageFileMap('js');
  const pageFiles = getHTMLPageNames().map(pageName => ({
    name: pageName,
    content: ensureDownloadIndexHTML(
      pages[pageName] || '',
      Object.values(cssFiles).some(value => String(value || '').trim()),
      Object.values(jsFiles).some(value => String(value || '').trim()),
      getCodeFileNames()
    )
  }));
  const cssZipFiles = getLanguageFileNames('css').map(name => ({ name, content: cssFiles[name] || '' }));
  const jsZipFiles = getLanguageFileNames('js').map(name => ({ name, content: jsFiles[name] || '' }));
  const files = [
    ...pageFiles,
    ...cssZipFiles,
    ...jsZipFiles,
    { name: 'README.txt', content: makeReadmeFile() }
  ];
  const filename = `${sanitizeFilename(activity?.title || 'student-code')}-${getCurrentDateStamp()}.zip`;
  const blob = createZipBlob(files);
  downloadBlob(blob, filename);
  setStatus(pageFiles.length > 1 ? 'Website ZIP downloaded' : 'ZIP downloaded');
}

function saveNow() {
  if (isStudentProjectActive()) {
    saveStudentProjectManually();
    return;
  }
  saveActiveEditor();
  setStatus('Saved locally');
}

function setActivityCardOpen(isOpen) {
  if (!activityCard || !stepActivityBtn) return;
  activityCard.classList.toggle('collapsed-card', !isOpen);
  document.body.classList.toggle('activity-popup-open', Boolean(isOpen));
  stepActivityBtn.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    window.setTimeout(() => activitySelect?.focus(), 40);
  }
}

function toggleActivityCard() {
  const isHidden = activityCard?.classList.contains('collapsed-card');
  setActivityCardOpen(Boolean(isHidden));
}

function closeActivityCard() {
  setActivityCardOpen(false);
}

function clearActivityRequiredWarning() {
  stepActivityBtn?.classList.remove('needs-attention');
  activityCard?.classList.remove('needs-attention');
  activityWarning?.classList.add('hidden');
  updateActivityButtonState();
}

function showActivityRequiredWarning() {
  setActivityCardOpen(true);
  stepActivityBtn?.classList.add('needs-attention');
  activityCard?.classList.add('needs-attention');
  activityWarning?.classList.remove('hidden');
  updateActivityButtonState();
}

function focusEditorStep() {
  if (!activity) {
    showActivityRequiredWarning();
  } else {
    clearActivityRequiredWarning();
  }

  scrollElementIntoSafeView(editorPanel);
  window.setTimeout(() => editor.focus(), 250);
}

function switchLanguageByIndex(index) {
  const languages = ['html', 'css', 'js'];
  const nextLanguage = languages[index];
  if (!nextLanguage || nextLanguage === activeLanguage) return;

  const targetButton = [...tabButtons].find(button => button.dataset.language === nextLanguage);
  if (!targetButton) return;

  saveActiveEditor();
  activeLanguage = nextLanguage;
  tabButtons.forEach(tab => tab.classList.toggle('active', tab === targetButton));
  loadActiveEditor();
  setStatus(`${nextLanguage.toUpperCase()} tab`);
}

function getLineIndentBeforeCursor(text, cursor) {
  const lineStart = text.lastIndexOf('\n', Math.max(0, cursor - 1)) + 1;
  const currentLineBeforeCursor = text.slice(lineStart, cursor);
  const indentMatch = currentLineBeforeCursor.match(/^\s*/);
  return {
    lineStart,
    lineBeforeCursor: currentLineBeforeCursor,
    indent: indentMatch ? indentMatch[0] : ''
  };
}

function getHTMLIndentInsert(text, start, end, baseIndent) {
  const beforeOnLine = text.slice(text.lastIndexOf('\n', Math.max(0, start - 1)) + 1, start);
  const afterSelection = text.slice(end);
  const openTagMatch = beforeOnLine.match(/<([A-Za-z][A-Za-z0-9:-]*)(?:\s[^<>]*?)?>\s*$/);
  const closingTagMatch = afterSelection.match(/^\s*<\/([A-Za-z][A-Za-z0-9:-]*)\s*>/);

  if (!openTagMatch) return `\n${baseIndent}`;

  const tagName = openTagMatch[1].toLowerCase();
  const fullOpenTag = openTagMatch[0];
  const isSelfClosing = /\/\s*>\s*$/.test(fullOpenTag) || selfClosingTagNames.has(tagName);

  if (isSelfClosing) return `\n${baseIndent}`;

  const innerIndent = `${baseIndent}  `;

  if (closingTagMatch && closingTagMatch[1].toLowerCase() === tagName) {
    return `\n${innerIndent}\n${baseIndent}`;
  }

  return `\n${innerIndent}`;
}

function getCodeIndentInsert(text, start, end, baseIndent) {
  const beforeOnLine = text.slice(text.lastIndexOf('\n', Math.max(0, start - 1)) + 1, start);
  const afterSelection = text.slice(end);
  const trimmedBefore = beforeOnLine.trimEnd();
  const nextNonSpace = afterSelection.match(/^\s*([}\])])/);

  if (/[{[(]$/.test(trimmedBefore)) {
    const innerIndent = `${baseIndent}  `;
    if (nextNonSpace) return `\n${innerIndent}\n${baseIndent}`;
    return `\n${innerIndent}`;
  }

  return `\n${baseIndent}`;
}

function smartEnterIndent() {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;
  const { indent } = getLineIndentBeforeCursor(text, start);
  const insertText = activeLanguage === 'html'
    ? getHTMLIndentInsert(text, start, end, indent)
    : getCodeIndentInsert(text, start, end, indent);

  const before = text.slice(0, start);
  const after = text.slice(end);
  const nextValue = before + insertText + after;

  let cursorPosition = start + insertText.length;
  const splitInsert = insertText.split('\n');
  if (splitInsert.length >= 3) {
    cursorPosition = start + splitInsert[0].length + 1 + splitInsert[1].length;
  }

  applyProgrammaticEditorChange(nextValue, cursorPosition, cursorPosition);
}

function isTypingInAdminForm() {
  return !adminOverlay.classList.contains('hidden') && adminOverlay.contains(document.activeElement);
}

function handleGlobalShortcuts(event) {
  if (event.defaultPrevented) return;
  const key = event.key.toLowerCase();
  const isCtrlOrMeta = event.ctrlKey || event.metaKey;

  // Keep native editor behavior for Undo and Redo.
  if (isCtrlOrMeta && (key === 'z' || key === 'y')) {
    return;
  }

  if (!isCtrlOrMeta) return;

  if (key === 's') {
    event.preventDefault();
    if (!adminForm.classList.contains('hidden') && adminOverlay.contains(document.activeElement)) {
      adminForm.requestSubmit();
      setStatus('Activity saved');
    } else {
      saveNow();
    }
    return;
  }

  if (isTypingInAdminForm()) return;

  if (event.shiftKey && key === 'f') {
    event.preventDefault();
    if (document.body.classList.contains('editor-fullscreen-active')) {
      exitFullEditor();
    } else {
      enterFullEditor();
    }
    return;
  }

  if (key === '=' || key === '+') {
    event.preventDefault();
    changeEditorZoom(1);
    return;
  }

  if (key === '-') {
    event.preventDefault();
    changeEditorZoom(-1);
    return;
  }

  if (key === '0') {
    event.preventDefault();
    resetEditorZoom();
    return;
  }

  if (key === 'enter' && event.shiftKey) {
    event.preventDefault();
    showResult();
    return;
  }

  if (key === 'enter') {
    event.preventDefault();
    runCode();
    return;
  }

  if (['1', '2', '3'].includes(key)) {
    event.preventDefault();
    switchLanguageByIndex(Number(key) - 1);
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll('`', '&#096;');
}


/* =========================================================
   SMART INLINE HINTS
   Shows beginner-friendly help directly from the editor.
   Desktop: hover a suspicious line. Phone/tablet: tap the line.
   This follows Admin > Assistance > Code Helper & Error Hints.
   ========================================================= */
const SMART_INLINE_HTML_TAG_FIXES = {
  hmtl: 'html', htm: 'html', hmt: 'html', haed: 'head', hed: 'head', titel: 'title', tittle: 'title',
  boddy: 'body', bdy: 'body', paragrap: 'p', paragraph: 'p', pragraph: 'p', divv: 'div', spn: 'span',
  sytle: 'style', stlye: 'style', scipt: 'script', scrpt: 'script', imge: 'img', iamge: 'img', imgg: 'img',
  buton: 'button', botton: 'button', lable: 'label', tabel: 'table', teh: 'thead', tboddy: 'tbody'
};

const SMART_INLINE_COMMON_HTML_TAGS = new Set([
  'html', 'head', 'title', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'section', 'article',
  'main', 'header', 'footer', 'nav', 'ul', 'ol', 'li', 'a', 'img', 'button', 'label', 'input', 'form', 'table',
  'tr', 'td', 'th', 'thead', 'tbody', 'style', 'script', 'strong', 'em', 'br', 'hr'
]);

const SMART_INLINE_VOID_HTML_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const SMART_INLINE_CSS_PROPERTIES = new Set([
  'color', 'background', 'background-color', 'font-size', 'font-family', 'font-weight', 'text-align', 'margin', 'padding',
  'width', 'height', 'border', 'border-radius', 'display', 'justify-content', 'align-items', 'gap', 'flex-direction',
  'grid-template-columns', 'position', 'top', 'right', 'bottom', 'left', 'opacity', 'box-shadow', 'line-height'
]);

const smartInlineHintState = {
  element: null,
  hint: null,
  hoverTimer: null,
  lastLineIndex: -1
};

function isSmartInlineHintsEnabled() {
  return Boolean(editor) && isStudentAssistanceFeatureEnabled('codeHelper') && !document.body.classList.contains('entry-gate-active');
}

function getSmartInlineHintHost() {
  const editorIsFullscreen = Boolean(
    editorPanel && (
      document.body.classList.contains('editor-fullscreen-active') ||
      document.fullscreenElement === editorPanel ||
      document.webkitFullscreenElement === editorPanel
    )
  );
  return editorIsFullscreen ? editorPanel : document.body;
}

function syncSmartInlineHintHost() {
  const host = getSmartInlineHintHost();
  const element = smartInlineHintState.element;
  if (element && host && element.parentElement !== host) {
    host.appendChild(element);
  }
  return host;
}

function createSmartInlineHintElement() {
  if (smartInlineHintState.element) {
    syncSmartInlineHintHost();
    return smartInlineHintState.element;
  }
  const hint = document.createElement('div');
  hint.id = 'smartInlineHint';
  hint.className = 'smart-inline-hint hidden';
  hint.setAttribute('role', 'dialog');
  hint.setAttribute('aria-live', 'polite');
  (getSmartInlineHintHost() || document.body).appendChild(hint);
  smartInlineHintState.element = hint;
  return hint;
}

function getLineContextByIndex(lineIndex) {
  const value = editor.value || '';
  const lines = value.split('\n');
  const safeIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));
  let start = 0;
  for (let index = 0; index < safeIndex; index += 1) start += lines[index].length + 1;
  const text = lines[safeIndex] || '';
  return {
    value,
    lines,
    lineIndex: safeIndex,
    lineNumber: safeIndex + 1,
    lineText: text,
    lineStart: start,
    lineEnd: start + text.length
  };
}

function getEditorLineIndexFromPointer(event) {
  if (!editor) return 0;
  const rect = editor.getBoundingClientRect();
  const style = window.getComputedStyle(editor);
  const fontSize = parseFloat(style.fontSize) || 16;
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.55;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const y = event.clientY - rect.top + editor.scrollTop - paddingTop;
  const rawLine = Math.floor(Math.max(0, y) / lineHeight);
  const totalLines = Math.max(1, editor.value.split('\n').length);
  return Math.max(0, Math.min(rawLine, totalLines - 1));
}

function getEditorLineIndexFromCursor() {
  const position = typeof editor.selectionStart === 'number' ? editor.selectionStart : 0;
  return editor.value.slice(0, position).split('\n').length - 1;
}

function makeSmartHint(context, data) {
  return {
    language: activeLanguage,
    lineNumber: context.lineNumber,
    lineIndex: context.lineIndex,
    issue: data.issue,
    suggestion: data.suggestion,
    start: context.lineStart + (data.localStart || 0),
    end: context.lineStart + (data.localEnd ?? context.lineText.length),
    replacement: data.replacement || '',
    fixLabel: data.fixLabel || 'Fix it',
    canFix: Boolean(data.canFix && typeof data.replacement === 'string')
  };
}

function detectSmartInlineHtmlHint(context) {
  const line = context.lineText;
  if (!line.trim()) return null;

  const wrongClose = line.match(/(<\s*(h[1-6]|p|div|span|section|article|main|header|footer|nav|ul|ol|li|button|label|strong|em|title)\b[^>]*>)([\s\S]*?)(<\s*\2\s*>)/i);
  if (wrongClose) {
    const wrongStart = wrongClose.index + wrongClose[1].length + wrongClose[3].length;
    const wrongEnd = wrongStart + wrongClose[4].length;
    const fixedClose = `</${wrongClose[2].toLowerCase()}>`;
    return makeSmartHint(context, {
      issue: `The second <${wrongClose[2]}> looks like a closing tag but it is missing a slash.`,
      suggestion: `Use ${fixedClose} to close the ${wrongClose[2].toLowerCase()} element.`,
      localStart: wrongStart,
      localEnd: wrongEnd,
      replacement: fixedClose,
      canFix: true
    });
  }

  const attrMatch = line.match(/\s(src|href|class|id|alt|title|rel|type|name|value|placeholder)=([^"'\s<>][^\s<>]*)/i);
  if (attrMatch) {
    const attrStart = attrMatch.index;
    const attrEnd = attrStart + attrMatch[0].length;
    const before = attrMatch[0].slice(0, attrMatch[0].indexOf('=') + 1);
    const fixed = `${before}"${attrMatch[2]}"`;
    return makeSmartHint(context, {
      issue: `The ${attrMatch[1]} value should be inside quotation marks.`,
      suggestion: `Write it as ${attrMatch[1]}="${attrMatch[2]}".`,
      localStart: attrStart,
      localEnd: attrEnd,
      replacement: fixed,
      canFix: true
    });
  }

  const tagMatch = line.match(/<\/?\s*([a-zA-Z][\w:-]*)/);
  if (tagMatch) {
    const typedTag = tagMatch[1].toLowerCase();
    const fixedTag = SMART_INLINE_HTML_TAG_FIXES[typedTag];
    if (fixedTag) {
      const localStart = tagMatch.index + tagMatch[0].lastIndexOf(tagMatch[1]);
      return makeSmartHint(context, {
        issue: `<${typedTag}> does not look like a valid/common HTML tag.`,
        suggestion: `Did you mean <${fixedTag}>?`,
        localStart,
        localEnd: localStart + tagMatch[1].length,
        replacement: fixedTag,
        canFix: true
      });
    }
    if (!SMART_INLINE_COMMON_HTML_TAGS.has(typedTag) && !typedTag.includes('-')) {
      return makeSmartHint(context, {
        issue: `<${typedTag}> is not a common beginner HTML tag.`,
        suggestion: 'Check the spelling of the tag. Common tags include h1, p, div, img, a, ul, li, and button.',
        canFix: false
      });
    }
  }

  const unclosed = line.match(/<\s*(h[1-6]|p|li|span|strong|em|button|label|title)\b[^>]*>(?!.*<\/\s*\1\s*>)([^<]+)$/i);
  if (unclosed && !SMART_INLINE_VOID_HTML_TAGS.has(unclosed[1].toLowerCase())) {
    const tag = unclosed[1].toLowerCase();
    return makeSmartHint(context, {
      issue: `This <${tag}> tag does not appear to be closed on this line.`,
      suggestion: `Add </${tag}> after the text.`,
      localStart: line.length,
      localEnd: line.length,
      replacement: `</${tag}>`,
      canFix: true
    });
  }

  return null;
}

function detectSmartInlineCssHint(context) {
  const line = context.lineText;
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('/*')) return null;

  const missingColon = line.match(/^(\s*)([a-z-]+)\s+([^:;{}]+;\s*)$/i);
  if (missingColon && SMART_INLINE_CSS_PROPERTIES.has(missingColon[2].toLowerCase())) {
    const fixedLine = `${missingColon[1]}${missingColon[2]}: ${missingColon[3]}`;
    return makeSmartHint(context, {
      issue: `CSS property "${missingColon[2]}" needs a colon before its value.`,
      suggestion: `Use ${missingColon[2]}: value;`,
      localStart: 0,
      localEnd: line.length,
      replacement: fixedLine,
      canFix: true
    });
  }

  const missingSemicolon = line.match(/^(\s*)([a-z-]+)\s*:\s*([^;{}]+)$/i);
  if (missingSemicolon && SMART_INLINE_CSS_PROPERTIES.has(missingSemicolon[2].toLowerCase())) {
    return makeSmartHint(context, {
      issue: `This CSS declaration is missing a semicolon.`,
      suggestion: `Add ; after the value so the next style is read correctly.`,
      localStart: line.length,
      localEnd: line.length,
      replacement: ';',
      canFix: true
    });
  }

  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  if (openBraces > closeBraces && !line.includes('}')) {
    return makeSmartHint(context, {
      issue: 'This CSS block has an opening brace {.',
      suggestion: 'Make sure you add a matching } after all styles for this selector.',
      canFix: false
    });
  }

  return null;
}

function detectSmartInlineJsHint(context) {
  const line = context.lineText;
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//')) return null;

  const openParen = (line.match(/\(/g) || []).length;
  const closeParen = (line.match(/\)/g) || []).length;
  if (openParen > closeParen) {
    const semi = line.lastIndexOf(';');
    const insertAt = semi >= 0 ? semi : line.length;
    return makeSmartHint(context, {
      issue: 'This JavaScript line has an opening parenthesis without a matching closing parenthesis.',
      suggestion: 'Add ) before the end of the statement.',
      localStart: insertAt,
      localEnd: insertAt,
      replacement: ')',
      canFix: true
    });
  }

  const doubleQuotes = (line.match(/"/g) || []).length;
  const singleQuotes = (line.match(/'/g) || []).length;
  if (doubleQuotes % 2 === 1 || singleQuotes % 2 === 1) {
    return makeSmartHint(context, {
      issue: 'This line may have an unclosed string quotation mark.',
      suggestion: 'Check if every opening quote has a matching closing quote.',
      canFix: false
    });
  }

  const openBrace = (line.match(/\{/g) || []).length;
  const closeBrace = (line.match(/\}/g) || []).length;
  if (openBrace > closeBrace) {
    return makeSmartHint(context, {
      issue: 'This line opens a code block with {.',
      suggestion: 'Make sure the block is closed later with }.',
      canFix: false
    });
  }

  return null;
}

function detectSmartInlineHint(context) {
  if (!context || !context.lineText) return null;
  if (activeLanguage === 'html') return detectSmartInlineHtmlHint(context);
  if (activeLanguage === 'css') return detectSmartInlineCssHint(context);
  if (activeLanguage === 'js') return detectSmartInlineJsHint(context);
  return null;
}

function hideSmartInlineHint() {
  window.clearTimeout(smartInlineHintState.hoverTimer);
  smartInlineHintState.hint = null;
  smartInlineHintState.lastLineIndex = -1;
  smartInlineHintState.element?.classList.add('hidden');
}

function applySmartInlineFix() {
  const hint = smartInlineHintState.hint;
  if (!hint || !hint.canFix) return;
  const value = editor.value || '';
  const start = Math.max(0, Math.min(hint.start, value.length));
  const end = Math.max(start, Math.min(hint.end, value.length));
  const nextValue = `${value.slice(0, start)}${hint.replacement}${value.slice(end)}`;
  const nextCursor = start + hint.replacement.length;
  applyProgrammaticEditorChange(nextValue, nextCursor, nextCursor, 'Smart hint applied');
  hideSmartInlineHint();
}

function renderSmartInlineHint(hint, event) {
  if (!hint || !event) return;
  const element = createSmartInlineHintElement();
  syncSmartInlineHintHost();
  smartInlineHintState.hint = hint;
  element.innerHTML = `
    <button class="smart-inline-close" type="button" aria-label="Close smart hint">×</button>
    <p class="smart-inline-kicker">Smart Hint · Line ${hint.lineNumber}</p>
    <strong>${escapeHTML(hint.issue)}</strong>
    <span>${escapeHTML(hint.suggestion)}</span>
    ${hint.canFix ? `<button class="smart-inline-fix" type="button">${escapeHTML(hint.fixLabel)}</button>` : ''}
  `;
  element.querySelector('.smart-inline-close')?.addEventListener('click', hideSmartInlineHint);
  element.querySelector('.smart-inline-fix')?.addEventListener('click', applySmartInlineFix);
  element.classList.remove('hidden');

  const margin = 10;
  const width = Math.min(320, window.innerWidth - margin * 2);
  element.style.maxWidth = `${width}px`;
  element.style.left = '0px';
  element.style.top = '0px';
  const rect = element.getBoundingClientRect();
  const left = Math.max(margin, Math.min(event.clientX + 14, window.innerWidth - rect.width - margin));
  const top = Math.max(margin, Math.min(event.clientY + 16, window.innerHeight - rect.height - margin));
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

function showSmartInlineHintForLine(lineIndex, event) {
  if (!isSmartInlineHintsEnabled()) {
    hideSmartInlineHint();
    return;
  }
  const context = getLineContextByIndex(lineIndex);
  const hint = detectSmartInlineHint(context);
  if (!hint) {
    hideSmartInlineHint();
    return;
  }
  smartInlineHintState.lastLineIndex = context.lineIndex;
  renderSmartInlineHint(hint, event);
}

function handleSmartInlinePointer(event, options = {}) {
  if (!isSmartInlineHintsEnabled()) return;
  const lineIndex = options.fromCursor ? getEditorLineIndexFromCursor() : getEditorLineIndexFromPointer(event);
  if (!options.force && smartInlineHintState.lastLineIndex === lineIndex && !smartInlineHintState.element?.classList.contains('hidden')) return;
  window.clearTimeout(smartInlineHintState.hoverTimer);
  smartInlineHintState.hoverTimer = window.setTimeout(() => showSmartInlineHintForLine(lineIndex, event), options.delay ?? 90);
}

editor.addEventListener('input', event => {
  saveActiveEditor();
  updateLineNumbers();
  commitEditorHistory();
  showSuggestions(event);
  updateTagMatching();
  scheduleAutoRun({ reason: 'edit' });
});

editor.addEventListener('input', () => hideSmartInlineHint());

editor.addEventListener('mousemove', event => handleSmartInlinePointer(event));

editor.addEventListener('click', event => handleSmartInlinePointer(event, { fromCursor: true, force: true, delay: 0 }));

editor.addEventListener('touchend', event => {
  const touch = event.changedTouches?.[0];
  if (!touch) return;
  handleSmartInlinePointer(touch, { fromCursor: true, force: true, delay: 0 });
}, { passive: true });

editor.addEventListener('mouseleave', () => {
  window.clearTimeout(smartInlineHintState.hoverTimer);
});

document.addEventListener('click', event => {
  const hintEl = smartInlineHintState.element;
  if (!hintEl || hintEl.classList.contains('hidden')) return;
  if (hintEl.contains(event.target) || editor.contains(event.target)) return;
  hideSmartInlineHint();
});

editor.addEventListener('scroll', () => {
  syncEditorScroll();
  hideSuggestions();
});

editor.addEventListener('keydown', event => {
  const isCtrlOrMeta = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (isCtrlOrMeta && key === 'z') {
    event.preventDefault();
    if (event.shiftKey) customRedo();
    else customUndo();
    return;
  }

  if (isCtrlOrMeta && key === 'y') {
    event.preventDefault();
    customRedo();
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const nextValue = editor.value.slice(0, start) + '  ' + editor.value.slice(end);
    applyProgrammaticEditorChange(nextValue, start + 2, start + 2);
  }

  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    runCode();
    return;
  }

  if (event.key === 'Enter' && !isCtrlOrMeta && !event.shiftKey && !event.altKey && suggestionBox.classList.contains('hidden')) {
    event.preventDefault();
    smartEnterIndent();
    return;
  }

  if (!suggestionBox.classList.contains('hidden')) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActiveSuggestion(1);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveSuggestion(-1);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      applySuggestion();
    }

    if (event.key === 'Escape') {
      hideSuggestions();
    }
  }
});

editor.addEventListener('click', () => {
  hideSuggestions();
  updateTagMatching();
});
editor.addEventListener('keyup', event => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
    updateTagMatching();
  }
});
editor.addEventListener('select', updateTagMatching);

suggestionBox.addEventListener('mousedown', event => {
  event.preventDefault();
  if (event.target.closest('.suggestion-close')) {
    hideSuggestions();
    editor.focus();
    return;
  }

  const item = event.target.closest('.suggestion-item');
  if (!item) return;
  applySuggestion(Number(item.dataset.index));
});

suggestionBox.addEventListener('mouseenter', () => window.clearTimeout(suggestionHideTimer));
suggestionBox.addEventListener('mouseleave', () => scheduleSuggestionHide(1200));

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    saveActiveEditor();
    activeLanguage = button.dataset.language;
    tabButtons.forEach(tab => tab.classList.toggle('active', tab === button));
    loadActiveEditor();
    setStatus(`${activeLanguage.toUpperCase()} tab`);
  });
});

if (stepActivityBtn) stepActivityBtn.addEventListener('click', toggleActivityCard);
closeActivityCardBtn?.addEventListener('click', closeActivityCard);
activityCard?.addEventListener('click', event => {
  if (event.target === activityCard) closeActivityCard();
});
activityCriteriaStat?.addEventListener('click', openActivityRubricModal);
activityRubricOverlay?.addEventListener('click', event => {
  if (event.target === activityRubricOverlay) closeActivityRubricModal();
});
closeActivityRubricBtn?.addEventListener('click', closeActivityRubricModal);
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (activityRubricOverlay && !activityRubricOverlay.classList.contains('hidden')) {
    closeActivityRubricModal();
    return;
  }
  if (activityCard && !activityCard.classList.contains('collapsed-card')) closeActivityCard();
});
if (stepCodeBtn) stepCodeBtn.addEventListener('click', focusEditorStep);
if (stepRunBtn) stepRunBtn.addEventListener('click', () => runCode());
if (stepResultBtn) stepResultBtn.addEventListener('click', showResult);

layoutButtons.forEach(button => {
  button.addEventListener('click', () => setPreviewLayout(button.dataset.layout));
});

desktopPreviewBtn?.addEventListener('click', toggleDesktopPreviewMode);
fullPreviewBtn.addEventListener('click', enterFullPreview);
exitPreviewBtn.addEventListener('click', () => exitFullPreview({ closeEditorFullscreen: true }));
ensureBackToEditorPreviewBtn();
ensurePreviewResultBtn()?.classList.remove('hidden');
if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => changeEditorZoom(-1));
if (zoomInBtn) zoomInBtn.addEventListener('click', () => changeEditorZoom(1));
if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetEditorZoom);
