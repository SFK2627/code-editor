function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function applyEditorZoom(value) {
  editorFontSize = clamp(Number(value) || BASE_EDITOR_FONT_SIZE, MIN_EDITOR_FONT_SIZE, MAX_EDITOR_FONT_SIZE);
  document.documentElement.style.setProperty('--editor-font-size', `${editorFontSize}px`);
  if (zoomLevel) {
    zoomLevel.textContent = `${Math.round((editorFontSize / BASE_EDITOR_FONT_SIZE) * 100)}%`;
  }
  saveJSON(STORAGE_KEYS.editorZoom, editorFontSize);
  fitEditorToContent();
  syncEditorScroll();
}

function changeEditorZoom(delta) {
  applyEditorZoom(editorFontSize + delta);
  setStatus(`Editor zoom ${Math.round((editorFontSize / BASE_EDITOR_FONT_SIZE) * 100)}%`);
}

function resetEditorZoom() {
  applyEditorZoom(BASE_EDITOR_FONT_SIZE);
  setStatus('Editor zoom reset');
}

function syncEditorScroll() {
  lineNumbers.scrollTop = editor.scrollTop;
  if (codeMatchLayer) {
    codeMatchLayer.scrollTop = editor.scrollTop;
    codeMatchLayer.scrollLeft = editor.scrollLeft;
  }
}

function fitEditorToContent() {
  if (!editor || !lineNumbers) return;

  // In full editor mode, CSS controls the editor height so the full screen stays stable.
  if (document.body.classList.contains('editor-fullscreen-active')) {
    editor.style.height = '';
    lineNumbers.style.height = '';
    if (codeMatchLayer) codeMatchLayer.style.height = '';
    if (editorStack) editorStack.style.height = '';
    return;
  }

  const minHeight = Math.max(560, Math.round(window.innerHeight * 0.72));
  editor.style.height = 'auto';
  const targetHeight = Math.max(minHeight, editor.scrollHeight + 4);
  const finalHeight = `${targetHeight}px`;

  editor.style.height = finalHeight;
  lineNumbers.style.height = finalHeight;
  if (codeMatchLayer) codeMatchLayer.style.height = finalHeight;
  if (editorStack) editorStack.style.height = finalHeight;
  if (editorWrap) editorWrap.style.minHeight = finalHeight;

  syncEditorScroll();
}

function getLineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}


function preserveNewLinesAsSpaces(value) {
  return String(value || '').replace(/[^\n\r]/g, ' ');
}

function maskIgnoredHTMLSections(text) {
  let output = String(text || '');
  output = output.replace(/<!--[\s\S]*?-->/g, match => preserveNewLinesAsSpaces(match));

  const rawTextPattern = /<(script|style|textarea|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
  output = output.replace(rawTextPattern, full => {
    const open = full.match(/^<(script|style|textarea|template)\b[^>]*>/i)?.[0] || '';
    const closeMatch = full.match(/<\/(script|style|textarea|template)\s*>\s*$/i);
    const close = closeMatch ? closeMatch[0] : '';
    const middleStart = open.length;
    const middleEnd = full.length - close.length;
    return open + preserveNewLinesAsSpaces(full.slice(middleStart, middleEnd)) + close;
  });

  return output;
}

function parseHTMLTagToken(text, start) {
  let index = start + 1;
  let quote = '';

  while (index < text.length) {
    const char = text[index];
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      const raw = text.slice(start, index + 1);
      if (/^<!--/.test(raw) || /^<!DOCTYPE\s+html\s*>/i.test(raw)) {
        return { raw, end: index + 1, skip: true };
      }
      const nameMatch = raw.match(/^<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)\b/);
      if (!nameMatch) return { raw, end: index + 1, skip: true };
      const name = nameMatch[1].toLowerCase();
      const closing = /^<\s*\//.test(raw);
      const explicitSelfClosing = /\/\s*>$/.test(raw);
      const selfClosing = explicitSelfClosing || selfClosingTagNames.has(name);
      return { raw, end: index + 1, name, closing, selfClosing, skip: false };
    }
    index += 1;
  }

  return null;
}

function parseHtmlTags(text) {
  const original = String(text || '');
  const safeText = maskIgnoredHTMLSections(original);
  const tags = [];

  for (let index = 0; index < safeText.length; index += 1) {
    if (safeText[index] !== '<') continue;
    const token = parseHTMLTagToken(safeText, index);
    if (!token) continue;
    if (!token.skip && token.name) {
      tags.push({
        name: token.name,
        raw: original.slice(index, token.end),
        start: index,
        end: token.end,
        closing: token.closing,
        selfClosing: token.selfClosing,
        pairIndex: null,
        unmatchedReason: ''
      });
    }
    index = Math.max(index, token.end - 1);
  }

  const stack = [];
  tags.forEach((tag, index) => {
    if (tag.selfClosing) return;

    if (!tag.closing) {
      stack.push(index);
      return;
    }

    let matchedStackIndex = -1;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      if (tags[stack[i]].name === tag.name) {
        matchedStackIndex = i;
        break;
      }
    }

    if (matchedStackIndex === -1) {
      tag.unmatchedReason = 'missing-opening';
      return;
    }

    const openingIndex = stack[matchedStackIndex];
    tags[openingIndex].pairIndex = index;
    tag.pairIndex = openingIndex;

    for (let i = stack.length - 1; i > matchedStackIndex; i -= 1) {
      const interrupted = tags[stack[i]];
      if (!interrupted.unmatchedReason) interrupted.unmatchedReason = 'possible-missing-closing';
    }
    stack.splice(matchedStackIndex, stack.length - matchedStackIndex);
  });

  stack.forEach(openingIndex => {
    if (!tags[openingIndex].unmatchedReason) tags[openingIndex].unmatchedReason = 'missing-closing';
  });

  return tags;
}

function getTagAtCursor(tags, cursor) {
  return tags.find(tag => cursor >= tag.start && cursor <= tag.end)
    || tags.find(tag => cursor > tag.start - 2 && cursor < tag.end + 2)
    || null;
}

function createSyntaxToken(start, end, className, priority = 1) {
  return Number.isFinite(start) && Number.isFinite(end) && end > start
    ? { start, end, className, priority }
    : null;
}

function addSyntaxToken(tokens, start, end, className, priority = 1) {
  const token = createSyntaxToken(start, end, className, priority);
  if (token) tokens.push(token);
}

function getHTMLSyntaxTokens(text) {
  const tokens = [];
  const tagPattern = /<!--([\s\S]*?)-->|<!DOCTYPE\s+html\s*>|<\/?[A-Za-z][A-Za-z0-9:-]*(?:\s[^<>]*?)?>/gi;
  let match;

  while ((match = tagPattern.exec(text)) !== null) {
    const full = match[0];
    const offset = match.index;

    if (full.startsWith('<!--')) {
      addSyntaxToken(tokens, offset, offset + full.length, 'syn-comment', 8);
      continue;
    }

    if (/^<!DOCTYPE/i.test(full)) {
      addSyntaxToken(tokens, offset, offset + full.length, 'syn-doctype', 8);
      continue;
    }

    addSyntaxToken(tokens, offset, offset + 1, 'syn-html-bracket', 7);
    if (full.endsWith('>')) addSyntaxToken(tokens, offset + full.length - 1, offset + full.length, 'syn-html-bracket', 7);

    const nameMatch = full.match(/^<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)/);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const nameStartLocal = full.indexOf(name);
    const nameEndLocal = nameStartLocal + name.length;
    addSyntaxToken(tokens, offset + nameStartLocal, offset + nameEndLocal, 'syn-html-tag', 9);

    if (/^<\s*\//.test(full)) {
      const slashLocal = full.indexOf('/');
      if (slashLocal >= 0) addSyntaxToken(tokens, offset + slashLocal, offset + slashLocal + 1, 'syn-html-bracket', 7);
      continue;
    }

    const attrPartStart = nameEndLocal;
    const attrPartEnd = Math.max(attrPartStart, full.length - (full.endsWith('/>') ? 2 : 1));
    const attrText = full.slice(attrPartStart, attrPartEnd);
    const attrPattern = /([A-Za-z_:][A-Za-z0-9_:.-]*)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s"'=<>`]+)?/g;
    let attrMatch;

    while ((attrMatch = attrPattern.exec(attrText)) !== null) {
      const attrName = attrMatch[1];
      if (!attrName || attrName === name) continue;
      const attrNameStart = offset + attrPartStart + attrMatch.index;
      addSyntaxToken(tokens, attrNameStart, attrNameStart + attrName.length, 'syn-html-attr', 9);

      if (attrMatch[2]) {
        const equalsStart = attrNameStart + attrName.length;
        addSyntaxToken(tokens, equalsStart, equalsStart + attrMatch[2].length, 'syn-html-equals', 6);
      }

      if (attrMatch[3]) {
        const valueStart = attrNameStart + attrName.length + (attrMatch[2]?.length || 0);
        addSyntaxToken(tokens, valueStart, valueStart + attrMatch[3].length, 'syn-string', 10);
      }
    }
  }

  return tokens;
}

function getCSSSyntaxTokens(text) {
  const tokens = [];

  for (const match of text.matchAll(/\/\*[\s\S]*?\*\//g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-comment', 10);
  }

  for (const match of text.matchAll(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-string', 10);
  }

  for (const match of text.matchAll(/(^|[{};\n])\s*([^{};:\n][^{};\n]*?)\s*(?=\{)/g)) {
    const selector = match[2];
    const selectorStart = match.index + match[0].indexOf(selector);
    addSyntaxToken(tokens, selectorStart, selectorStart + selector.length, 'syn-css-selector', 6);
  }

  for (const match of text.matchAll(/([a-zA-Z-]+)(\s*:)/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[1].length, 'syn-css-property', 8);
    addSyntaxToken(tokens, match.index + match[1].length, match.index + match[0].length, 'syn-punctuation', 5);
  }

  for (const match of text.matchAll(/#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-number', 7);
  }

  for (const match of text.matchAll(/[{}();,]/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-punctuation', 4);
  }

  return tokens;
}

function getJSSyntaxTokens(text) {
  const tokens = [];
  const keywordPattern = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|new|this|try|catch|finally|throw|true|false|null|undefined|document|window)\b/g;

  for (const match of text.matchAll(/\/\/[^\r\n]*|\/\*[\s\S]*?\*\//g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-comment', 10);
  }

  for (const match of text.matchAll(/`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-string', 10);
  }

  for (const match of text.matchAll(keywordPattern)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-js-keyword', 7);
  }

  for (const match of text.matchAll(/\b\d+(?:\.\d+)?\b/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-number', 6);
  }

  for (const match of text.matchAll(/\b([A-Za-z_$][\w$]*)(\s*)(?=\()/g)) {
    const name = match[1];
    if (!['if', 'for', 'while', 'switch', 'catch', 'function'].includes(name)) {
      addSyntaxToken(tokens, match.index, match.index + name.length, 'syn-js-function', 8);
    }
  }

  for (const match of text.matchAll(/[{}()[\].,;:+\-*/%=<>!&|?]/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-punctuation', 3);
  }

  return tokens;
}

function getSyntaxTokens(text) {
  if (activeLanguage === 'html') return getHTMLSyntaxTokens(text);
  if (activeLanguage === 'css') return getCSSSyntaxTokens(text);
  if (activeLanguage === 'js') return getJSSyntaxTokens(text);
  return [];
}

function getBestTokenForSegment(tokens, start, end) {
  return tokens
    .filter(token => start >= token.start && end <= token.end)
    .sort((a, b) => b.priority - a.priority)[0] || null;
}

function getMatchClassForSegment(spans, start, end) {
  const match = spans.find(span => start >= span.start && end <= span.end);
  return match ? `tag-match ${match.className}` : '';
}

function renderCodeMatchLayer(spans = []) {
  if (!codeMatchLayer) return;

  const text = editor.value || '';
  const syntaxTokens = getSyntaxTokens(text);
  const sortedMatches = spans
    .filter(span => Number.isFinite(span.start) && Number.isFinite(span.end) && span.end > span.start)
    .sort((a, b) => a.start - b.start);

  const boundaries = new Set([0, text.length]);
  syntaxTokens.forEach(token => {
    boundaries.add(token.start);
    boundaries.add(token.end);
  });
  sortedMatches.forEach(span => {
    boundaries.add(span.start);
    boundaries.add(span.end);
  });

  const points = [...boundaries]
    .filter(value => value >= 0 && value <= text.length)
    .sort((a, b) => a - b);

  let output = '';
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    if (end <= start) continue;

    const chunk = text.slice(start, end);
    const token = getBestTokenForSegment(syntaxTokens, start, end);
    const matchClass = getMatchClassForSegment(sortedMatches, start, end);
    const className = [token?.className || '', matchClass].filter(Boolean).join(' ');

    output += className
      ? `<span class="${escapeAttribute(className)}">${escapeHTML(chunk)}</span>`
      : escapeHTML(chunk);
  }

  codeMatchLayer.innerHTML = (output || '&nbsp;') + '\n';
  syncEditorScroll();
}

function resetTagMatchInfo() {
  if (!tagMatchInfo) return;
  tagMatchInfo.className = 'tag-match-info';
  tagMatchInfo.textContent = '';
}

function updateTagMatching() {
  if (!tagMatchInfo || !codeMatchLayer) return;

  if (activeLanguage !== 'html') {
    activeTagMatches = [];
    renderCodeMatchLayer([]);
    resetTagMatchInfo();
    return;
  }

  const text = editor.value;
  const tags = parseHtmlTags(text);
  const selectedTag = getTagAtCursor(tags, editor.selectionStart);

  if (!selectedTag) {
    activeTagMatches = [];
    renderCodeMatchLayer([]);
    resetTagMatchInfo();
    return;
  }

  if (selectedTag.selfClosing) {
    activeTagMatches = [{ start: selectedTag.start, end: selectedTag.end, className: 'tag-match-self' }];
    renderCodeMatchLayer(activeTagMatches);
    tagMatchInfo.className = 'tag-match-info good';
    tagMatchInfo.textContent = `Self-closing tag: <${selectedTag.name}> does not need a closing tag.`;
    return;
  }

  if (selectedTag.pairIndex !== null && tags[selectedTag.pairIndex]) {
    const pair = tags[selectedTag.pairIndex];
    activeTagMatches = [selectedTag, pair]
      .sort((a, b) => a.start - b.start)
      .map(tag => ({ start: tag.start, end: tag.end, className: 'tag-match-pair' }));
    renderCodeMatchLayer(activeTagMatches);
    tagMatchInfo.className = 'tag-match-info good';
    const openTag = selectedTag.closing ? pair : selectedTag;
    const closeTag = selectedTag.closing ? selectedTag : pair;
    tagMatchInfo.textContent = `Matched: <${selectedTag.name}> opens on line ${getLineNumberAt(text, openTag.start)} and closes on line ${getLineNumberAt(text, closeTag.start)}.`;
    return;
  }

  activeTagMatches = [{ start: selectedTag.start, end: selectedTag.end, className: 'tag-match-missing' }];
  renderCodeMatchLayer(activeTagMatches);
  tagMatchInfo.className = 'tag-match-info error';
  tagMatchInfo.textContent = selectedTag.closing
    ? `This </${selectedTag.name}> closing tag has no matching opening tag.`
    : `This <${selectedTag.name}> opening tag needs a matching </${selectedTag.name}> closing tag.`;
}

function applyTheme(theme) {
  const safeTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = safeTheme;
  if (themeToggle) themeToggle.textContent = safeTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
  if (entryThemeToggle) {
    entryThemeToggle.classList.toggle('is-dark', safeTheme === 'dark');
    entryThemeToggle.setAttribute('aria-pressed', String(safeTheme === 'dark'));
  }
  if (entryThemeLabel) entryThemeLabel.textContent = safeTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
  saveJSON(STORAGE_KEYS.theme, safeTheme);
}


function getEditorHistoryKey(language = activeLanguage) {
  const filePart = ['html', 'css', 'js'].includes(language) ? `:${getActiveLanguageFileName(language)}` : '';
  return `${activity?.id || 'no-activity'}:${language}${filePart}`;
}

function createEditorState(value = editor.value, start = editor.selectionStart || 0, end = editor.selectionEnd || start) {
  return { value, start, end };
}

function statesHaveSameText(a, b) {
  return Boolean(a && b && a.value === b.value);
}

function ensureEditorHistory(language = activeLanguage, value = codeStore[language] || '') {
  const key = getEditorHistoryKey(language);
  if (!editorHistoryByKey[key]) {
    editorHistoryByKey[key] = {
      undo: [{ value, start: 0, end: 0 }],
      redo: []
    };
  }
  return editorHistoryByKey[key];
}

function resetEditorHistory(language = activeLanguage, value = codeStore[language] || '') {
  const key = getEditorHistoryKey(language);
  editorHistoryByKey[key] = {
    undo: [{ value, start: 0, end: 0 }],
    redo: []
  };
}

function resetAllLanguageHistoryForCurrentActivity() {
  ['html', 'css', 'js'].forEach(language => resetEditorHistory(language, codeStore[language] || ''));
}

function commitEditorHistory() {
  if (isRestoringEditorHistory) return;
  const history = ensureEditorHistory();
  const state = createEditorState();
  const last = history.undo[history.undo.length - 1];

  if (!statesHaveSameText(last, state)) {
    history.undo.push(state);
    if (history.undo.length > EDITOR_HISTORY_LIMIT) history.undo.shift();
    history.redo = [];
  } else if (last) {
    last.start = state.start;
    last.end = state.end;
  }
}

function restoreEditorState(state, statusText = '') {
  if (!state) return;
  isRestoringEditorHistory = true;
  editor.value = state.value;
  const safeStart = Math.min(state.start ?? state.value.length, state.value.length);
  const safeEnd = Math.min(state.end ?? safeStart, state.value.length);
  editor.setSelectionRange(safeStart, safeEnd);
  saveActiveEditor();
  updateLineNumbers();
  hideSuggestions();
  updateTagMatching();
  syncEditorScroll();
  isRestoringEditorHistory = false;
  if (statusText) setStatus(statusText);
}

function customUndo() {
  const history = ensureEditorHistory();
  const current = createEditorState();
  const last = history.undo[history.undo.length - 1];

  if (!statesHaveSameText(last, current)) {
    history.undo.push(current);
  }

  if (history.undo.length <= 1) {
    setStatus('Nothing to undo');
    return;
  }

  const popped = history.undo.pop();
  history.redo.push(popped);
  restoreEditorState(history.undo[history.undo.length - 1], 'Undo');
}

function customRedo() {
  const history = ensureEditorHistory();
  if (!history.redo.length) {
    setStatus('Nothing to redo');
    return;
  }

  const next = history.redo.pop();
  history.undo.push(next);
  restoreEditorState(next, 'Redo');
}

function applyProgrammaticEditorChange(nextValue, cursorStart = 0, cursorEnd = cursorStart, statusText = '') {
  editor.value = nextValue;
  editor.focus();
  const safeStart = Math.min(cursorStart, nextValue.length);
  const safeEnd = Math.min(cursorEnd, nextValue.length);
  editor.setSelectionRange(safeStart, safeEnd);
  saveActiveEditor();
  updateLineNumbers();
  updateTagMatching();
  commitEditorHistory();
  if (statusText) setStatus(statusText);
}


function loadActiveEditor() {
  syncActiveLanguageFileFromStore(activeLanguage);
  editor.value = getLanguageFileContent(activeLanguage, getActiveLanguageFileName(activeLanguage));
  ensureEditorHistory(activeLanguage, editor.value);
  editorInfo.textContent = activeLanguage === 'html'
    ? `HTML page: ${getActiveHtmlPageName()}. Add more pages for website activities, then connect them using links like <a href="about.html">.`
    : activeLanguage === 'css'
      ? `CSS file: ${getActiveLanguageFileName('css')}. You can add more CSS files if an activity needs a larger website.`
      : `JavaScript file: ${getActiveLanguageFileName('js')}. You can add more JS files if an activity needs separate scripts.`;
  renderHTMLPageManager();
  updateLineNumbers();
  hideSuggestions();
  renderStructureAlert();
  fitEditorToContent();
  updateTagMatching();
}

function saveActiveEditor() {
  setLanguageFileContent(activeLanguage, getActiveLanguageFileName(activeLanguage), editor.value);
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();

  renderHTMLPageManager();
  renderStructureAlert();
  fitEditorToContent();
  updateTagMatching();
  renderErrorChecker();
}

function updateLineNumbers() {
  const lines = editor.value.split('\n').length || 1;
  lineNumbers.textContent = Array.from({ length: lines }, (_, index) => index + 1).join('\n');
  fitEditorToContent();
}


function cssValueSuggestion(label, insert, desc) {
  return { label, insert, desc, type: 'code' };
}

function getCSSValueSuggestionsForProperty(propertyName = '') {
  const property = String(propertyName || '').trim().toLowerCase();
  const commonColors = [
    cssValueSuggestion('blue', '#2563eb;', 'Common blue color.'),
    cssValueSuggestion('light blue', '#dbeafe;', 'Light blue background.'),
    cssValueSuggestion('red', '#dc2626;', 'Common red color.'),
    cssValueSuggestion('green', '#16a34a;', 'Common green color.'),
    cssValueSuggestion('yellow', '#facc15;', 'Common yellow color.'),
    cssValueSuggestion('orange', '#f97316;', 'Common orange color.'),
    cssValueSuggestion('purple', '#7c3aed;', 'Common purple color.'),
    cssValueSuggestion('black', '#000000;', 'Black.'),
    cssValueSuggestion('white', '#ffffff;', 'White.'),
    cssValueSuggestion('gray', '#64748b;', 'Slate gray.'),
    cssValueSuggestion('transparent', 'transparent;', 'Transparent color.'),
    cssValueSuggestion('primary variable', 'var(--primary);', 'Use a CSS variable color.'),
    cssValueSuggestion('rgb color', 'rgb(37, 99, 235);', 'RGB color format.'),
    cssValueSuggestion('rgba color', 'rgba(37, 99, 235, 0.25);', 'RGBA with opacity.'),
    cssValueSuggestion('linear gradient', 'linear-gradient(135deg, #2563eb, #06b6d4);', 'Gradient background.')
  ];

  const valueMap = {
    color: commonColors,
    'background-color': commonColors,
    background: commonColors,
    border: [
      cssValueSuggestion('thin gray border', '1px solid #d1d5db;', 'Thin gray border.'),
      cssValueSuggestion('blue border', '2px solid #2563eb;', 'Blue border.'),
      cssValueSuggestion('no border', 'none;', 'Remove border.')
    ],
    'border-color': commonColors,
    'border-radius': [
      cssValueSuggestion('small radius', '8px;', 'Slightly rounded.'),
      cssValueSuggestion('medium radius', '16px;', 'Rounded corners.'),
      cssValueSuggestion('large radius', '24px;', 'Very rounded corners.'),
      cssValueSuggestion('circle pill', '999px;', 'Pill/circle corners.'),
      cssValueSuggestion('none', '0;', 'No rounded corners.')
    ],
    display: [
      cssValueSuggestion('block', 'block;', 'Start on a new line.'),
      cssValueSuggestion('inline block', 'inline-block;', 'Inline but with width/height.'),
      cssValueSuggestion('flex', 'flex;', 'Use flexbox layout.'),
      cssValueSuggestion('grid', 'grid;', 'Use grid layout.'),
      cssValueSuggestion('none', 'none;', 'Hide element.')
    ],
    position: [
      cssValueSuggestion('relative', 'relative;', 'Position relative to itself.'),
      cssValueSuggestion('absolute', 'absolute;', 'Position inside nearest positioned parent.'),
      cssValueSuggestion('fixed', 'fixed;', 'Stay fixed on the screen.'),
      cssValueSuggestion('sticky', 'sticky;', 'Stick while scrolling.'),
      cssValueSuggestion('static', 'static;', 'Default position.')
    ],
    'justify-content': [
      cssValueSuggestion('center', 'center;', 'Center horizontally.'),
      cssValueSuggestion('space between', 'space-between;', 'Space items apart.'),
      cssValueSuggestion('space around', 'space-around;', 'Space around each item.'),
      cssValueSuggestion('flex start', 'flex-start;', 'Align at start.'),
      cssValueSuggestion('flex end', 'flex-end;', 'Align at end.')
    ],
    'align-items': [
      cssValueSuggestion('center', 'center;', 'Center vertically.'),
      cssValueSuggestion('stretch', 'stretch;', 'Stretch items.'),
      cssValueSuggestion('flex start', 'flex-start;', 'Align at start.'),
      cssValueSuggestion('flex end', 'flex-end;', 'Align at end.'),
      cssValueSuggestion('baseline', 'baseline;', 'Align text baselines.')
    ],
    'text-align': [
      cssValueSuggestion('left', 'left;', 'Align text left.'),
      cssValueSuggestion('center', 'center;', 'Center text.'),
      cssValueSuggestion('right', 'right;', 'Align text right.'),
      cssValueSuggestion('justify', 'justify;', 'Stretch text lines.')
    ],
    'font-weight': [
      cssValueSuggestion('normal', '400;', 'Normal weight.'),
      cssValueSuggestion('medium', '500;', 'Medium weight.'),
      cssValueSuggestion('semibold', '600;', 'Semi-bold weight.'),
      cssValueSuggestion('bold', '700;', 'Bold weight.'),
      cssValueSuggestion('extra bold', '900;', 'Very thick text.')
    ],
    'font-family': [
      cssValueSuggestion('Arial', 'Arial, sans-serif;', 'Simple clean font.'),
      cssValueSuggestion('Verdana', 'Verdana, sans-serif;', 'Readable screen font.'),
      cssValueSuggestion('Georgia', 'Georgia, serif;', 'Classic serif font.'),
      cssValueSuggestion('system font', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;', 'Modern system font stack.'),
      cssValueSuggestion('monospace', 'Consolas, Monaco, monospace;', 'Code-like font.')
    ],
    'font-size': [
      cssValueSuggestion('small', '14px;', 'Small text.'),
      cssValueSuggestion('normal', '16px;', 'Normal text.'),
      cssValueSuggestion('large', '24px;', 'Large text.'),
      cssValueSuggestion('responsive', 'clamp(1.5rem, 4vw, 3rem);', 'Responsive heading size.'),
      cssValueSuggestion('one rem', '1rem;', 'Relative font size.')
    ],
    margin: [
      cssValueSuggestion('none', '0;', 'No outside spacing.'),
      cssValueSuggestion('small', '8px;', 'Small margin.'),
      cssValueSuggestion('medium', '16px;', 'Medium margin.'),
      cssValueSuggestion('large', '32px;', 'Large margin.'),
      cssValueSuggestion('center block', '0 auto;', 'Center block horizontally.')
    ],
    padding: [
      cssValueSuggestion('none', '0;', 'No inside spacing.'),
      cssValueSuggestion('small', '8px;', 'Small padding.'),
      cssValueSuggestion('medium', '16px;', 'Medium padding.'),
      cssValueSuggestion('large', '32px;', 'Large padding.'),
      cssValueSuggestion('button padding', '12px 18px;', 'Good button spacing.')
    ],
    width: [
      cssValueSuggestion('full width', '100%;', 'Fill parent width.'),
      cssValueSuggestion('half width', '50%;', 'Half width.'),
      cssValueSuggestion('auto', 'auto;', 'Automatic width.'),
      cssValueSuggestion('responsive container', 'min(100% - 32px, 1000px);', 'Responsive max width.'),
      cssValueSuggestion('fit content', 'fit-content;', 'Fit content width.')
    ],
    height: [
      cssValueSuggestion('auto', 'auto;', 'Automatic height.'),
      cssValueSuggestion('full viewport', '100vh;', 'Full screen height.'),
      cssValueSuggestion('fixed 200px', '200px;', 'Fixed height.'),
      cssValueSuggestion('full parent', '100%;', 'Fill parent height.')
    ],
    'min-height': [
      cssValueSuggestion('full viewport', '100vh;', 'At least full screen height.'),
      cssValueSuggestion('half viewport', '50vh;', 'At least half screen height.'),
      cssValueSuggestion('300px', '300px;', 'At least 300px tall.')
    ],
    gap: [
      cssValueSuggestion('small', '8px;', 'Small gap.'),
      cssValueSuggestion('medium', '16px;', 'Medium gap.'),
      cssValueSuggestion('large', '24px;', 'Large gap.'),
      cssValueSuggestion('responsive', 'clamp(12px, 2vw, 24px);', 'Responsive gap.')
    ],
    'grid-template-columns': [
      cssValueSuggestion('two equal columns', 'repeat(2, 1fr);', 'Two equal columns.'),
      cssValueSuggestion('three equal columns', 'repeat(3, 1fr);', 'Three equal columns.'),
      cssValueSuggestion('responsive cards', 'repeat(auto-fit, minmax(220px, 1fr));', 'Responsive card columns.'),
      cssValueSuggestion('sidebar layout', '250px 1fr;', 'Sidebar plus content.')
    ],
    transition: [
      cssValueSuggestion('quick smooth', 'all 0.2s ease;', 'Quick smooth transition.'),
      cssValueSuggestion('transform only', 'transform 0.2s ease;', 'Animate transform only.'),
      cssValueSuggestion('color background', 'color 0.2s ease, background 0.2s ease;', 'Animate colors.'),
      cssValueSuggestion('slow smooth', 'all 0.4s ease;', 'Slower transition.')
    ],
    transform: [
      cssValueSuggestion('move up', 'translateY(-2px);', 'Move upward.'),
      cssValueSuggestion('scale up', 'scale(1.05);', 'Slightly bigger.'),
      cssValueSuggestion('rotate', 'rotate(3deg);', 'Slight rotation.'),
      cssValueSuggestion('none', 'none;', 'No transform.')
    ],
    cursor: [
      cssValueSuggestion('pointer', 'pointer;', 'Clickable cursor.'),
      cssValueSuggestion('default', 'default;', 'Normal cursor.'),
      cssValueSuggestion('not allowed', 'not-allowed;', 'Disabled cursor.'),
      cssValueSuggestion('text', 'text;', 'Text cursor.')
    ],
    overflow: [
      cssValueSuggestion('hidden', 'hidden;', 'Hide overflow.'),
      cssValueSuggestion('auto', 'auto;', 'Scroll only when needed.'),
      cssValueSuggestion('scroll', 'scroll;', 'Always scroll.'),
      cssValueSuggestion('visible', 'visible;', 'Show overflow.')
    ],
    'object-fit': [
      cssValueSuggestion('cover', 'cover;', 'Fill box and crop.'),
      cssValueSuggestion('contain', 'contain;', 'Fit whole image.'),
      cssValueSuggestion('fill', 'fill;', 'Stretch to fill.'),
      cssValueSuggestion('none', 'none;', 'No fitting.')
    ],
    opacity: [
      cssValueSuggestion('fully visible', '1;', 'Full opacity.'),
      cssValueSuggestion('semi transparent', '0.5;', 'Half visible.'),
      cssValueSuggestion('hidden transparent', '0;', 'Invisible but still in layout.')
    ],
    'box-shadow': [
      cssValueSuggestion('soft shadow', '0 10px 25px rgba(0, 0, 0, 0.15);', 'Soft modern shadow.'),
      cssValueSuggestion('large shadow', '0 20px 50px rgba(15, 23, 42, 0.25);', 'Large shadow.'),
      cssValueSuggestion('none', 'none;', 'Remove shadow.')
    ]
  };

  return valueMap[property] || [
    ...commonColors,
    cssValueSuggestion('auto', 'auto;', 'Automatic value.'),
    cssValueSuggestion('none', 'none;', 'No style/effect.'),
    cssValueSuggestion('inherit', 'inherit;', 'Use parent value.'),
    cssValueSuggestion('initial', 'initial;', 'Use default initial value.'),
    cssValueSuggestion('unset', 'unset;', 'Unset inherited or initial value.')
  ];
}

function getSuggestionContext() {
  const cursor = editor.selectionStart;
  const textBeforeCursor = editor.value.slice(0, cursor);

  if (activeLanguage === 'html') {
    const tagMatch = textBeforeCursor.match(/<([A-Za-z0-9!\- ]*)$/);
    if (tagMatch) {
      return {
        word: tagMatch[1].trimStart(),
        start: cursor - tagMatch[0].length,
        mode: 'html-tag'
      };
    }
  }

  if (activeLanguage === 'css') {
    const currentLine = textBeforeCursor.split(/\r?\n/).pop() || '';
    const valueMatch = currentLine.match(/([a-z-]+)\s*:\s*([^;{}]*)$/i);
    if (valueMatch) {
      const rawValue = valueMatch[2] || '';
      const typedValueMatch = rawValue.match(/[^\s]*$/);
      const typedValue = typedValueMatch ? typedValueMatch[0] : '';
      return {
        word: typedValue,
        start: cursor - typedValue.length,
        mode: 'css-value',
        property: valueMatch[1].toLowerCase()
      };
    }
  }

  const wordMatch = textBeforeCursor.match(/[A-Za-z0-9_.:-]+$/);
  if (wordMatch) {
    return {
      word: wordMatch[0],
      start: cursor - wordMatch[0].length,
      mode: 'word'
    };
  }

  return { word: '', start: cursor, mode: 'word' };
}

function scheduleSuggestionHide(delay = 4200) {
  window.clearTimeout(suggestionHideTimer);
  suggestionHideTimer = window.setTimeout(() => {
    hideSuggestions();
  }, delay);
}

function showSuggestions(event) {
  if (!isStudentAssistanceFeatureEnabled('codeSuggestions')) {
    hideSuggestions();
    return;
  }

  const isRealTyping = !event || event.inputType?.startsWith('insert') || event.inputType === 'historyUndo' || event.inputType === 'historyRedo';

  if (!isRealTyping || editor.selectionStart !== editor.selectionEnd) {
    hideSuggestions();
    return;
  }

  const context = getSuggestionContext();
  currentWord = context.word.trim();
  currentSuggestionStart = context.start;

  // Do not open the menu just because the cursor is inside the editor.
  // The student must type at least one useful character first.
  if (currentWord.length < 1) {
    hideSuggestions();
    return;
  }

  // For HTML tags, avoid showing the list after typing only "<".
  // It appears when the student starts typing the tag name, like <h or <bo.
  if (context.mode === 'html-tag' && !/[A-Za-z!]/.test(currentWord)) {
    hideSuggestions();
    return;
  }

  lastSuggestionInputAt = Date.now();

  const activeSuggestions = (context.mode === 'css-value'
    ? getCSSValueSuggestionsForProperty(context.property)
    : suggestionsByLanguage[activeLanguage]
  ).map(item => ({
    ...item,
    languageType: context.mode === 'css-value' ? 'VALUE' : activeLanguage.toUpperCase()
  }));

  const query = currentWord.toLowerCase();
  currentMatches = activeSuggestions
    .filter(item => {
      const label = item.label.toLowerCase();
      const insertText = String(item.insert || '').toLowerCase();
      return label.startsWith(query) || label.includes(query) || insertText.includes(query);
    })
    .slice(0, context.mode === 'css-value' ? 8 : 6);

  if (!currentMatches.length) {
    hideSuggestions();
    return;
  }

  activeSuggestionIndex = 0;
  suggestionBox.innerHTML = `
    <div class="suggestion-mini-header">
      <span>Suggestions</span>
      <button class="suggestion-close" type="button" aria-label="Hide suggestions">×</button>
    </div>
    ${currentMatches.map((item, index) => {
      const chip = getSuggestionChip(item);
      return `
        <div class="suggestion-item ${index === 0 ? 'active' : ''} ${item.hasClosing ? 'has-closing' : ''}" data-index="${index}" role="option">
          <div>
            <div class="suggestion-label">${escapeHTML(item.label)}</div>
            <div class="suggestion-desc">${escapeHTML(item.desc)}</div>
          </div>
          <span class="suggestion-type ${chip.className}">${escapeHTML(chip.text)}</span>
        </div>
      `;
    }).join('')}
  `;

  suggestionBox.classList.remove('hidden');
  document.body.classList.add('suggestions-open');
  scheduleSuggestionHide();
}

function getSuggestionChip(item) {
  if (item.hasClosing) return { text: 'closing', className: 'closing' };
  if (item.selfClosing) return { text: 'self', className: 'self-closing' };
  if (item.type === 'template') return { text: 'template', className: 'template' };
  return { text: item.languageType || activeLanguage.toUpperCase(), className: '' };
}

function hideSuggestions() {
  window.clearTimeout(suggestionHideTimer);
  suggestionBox.classList.add('hidden');
  document.body.classList.remove('suggestions-open');
  suggestionBox.innerHTML = '';
  currentMatches = [];
}

function moveActiveSuggestion(direction) {
  if (!currentMatches.length) return;
  activeSuggestionIndex = (activeSuggestionIndex + direction + currentMatches.length) % currentMatches.length;
  [...suggestionBox.querySelectorAll('.suggestion-item')].forEach((item, index) => {
    item.classList.toggle('active', index === activeSuggestionIndex);
  });
}

function applySuggestion(index = activeSuggestionIndex) {
  const selected = currentMatches[index];
  if (!selected) return;

  const cursor = editor.selectionStart;
  const before = editor.value.slice(0, currentSuggestionStart);
  const after = editor.value.slice(cursor);
  const rawInsert = selected.insert;
  const markerIndex = rawInsert.indexOf('|');
  const insertText = rawInsert.replace('|', '');

  const nextValue = before + insertText + after;
  const newCursorPosition = markerIndex >= 0
    ? before.length + markerIndex
    : before.length + insertText.length;

  applyProgrammaticEditorChange(
    nextValue,
    newCursorPosition,
    newCursorPosition,
    selected.hasClosing ? `Inserted ${selected.label} with closing tag` : `Inserted ${selected.label}`
  );
  hideSuggestions();
}

