function getLanguageFileMeta(language = activeLanguage) {
  const lang = ['html', 'css', 'js'].includes(language) ? language : 'html';
  const defaults = DEFAULT_CODE_FILE_NAMES;
  return {
    html: {
      language: 'html',
      label: 'HTML page',
      pluralLabel: 'HTML pages',
      extension: 'html',
      mapKey: 'pages',
      activeKey: 'activeHtmlPage',
      codeKey: 'html',
      defaultName: defaults.html,
      addTitle: 'Add HTML Page',
      renameTitle: 'Rename HTML Page',
      addText: 'Create another HTML page for a multi-page website.',
      renameText: 'Rename this HTML page. Links must match the new file name.',
      note: 'Use simple names like about.html, gallery.html, or contact.html.'
    },
    css: {
      language: 'css',
      label: 'CSS file',
      pluralLabel: 'CSS files',
      extension: 'css',
      mapKey: 'cssFiles',
      activeKey: 'activeCssFile',
      codeKey: 'css',
      defaultName: defaults.css,
      addTitle: 'Add CSS File',
      renameTitle: 'Rename CSS File',
      addText: 'Create another CSS file for a larger website.',
      renameText: 'Rename this CSS file. HTML <link> href values must match the new file name.',
      note: 'Use simple names like style.css, layout.css, colors.css, or responsive.css.'
    },
    js: {
      language: 'js',
      label: 'JavaScript file',
      pluralLabel: 'JavaScript files',
      extension: 'js',
      mapKey: 'jsFiles',
      activeKey: 'activeJsFile',
      codeKey: 'js',
      defaultName: defaults.js,
      addTitle: 'Add JavaScript File',
      renameTitle: 'Rename JavaScript File',
      addText: 'Create another JavaScript file for a larger website.',
      renameText: 'Rename this JavaScript file. HTML <script src> values must match the new file name.',
      note: 'Use simple names like script.js, app.js, menu.js, or gallery.js.'
    }
  }[lang];
}

function cleanLanguageFileName(value, language = activeLanguage) {
  const meta = getLanguageFileMeta(language);
  return cleanCodeFileName(value || meta.defaultName, meta.extension);
}

function createStarterForLanguageFile(language, fileName) {
  const meta = getLanguageFileMeta(language);
  const base = String(fileName || meta.defaultName).replace(new RegExp(`\\.${meta.extension}$`, 'i'), '');
  if (language === 'html') {
    return `<!DOCTYPE html>
<html>
  <head>
    <title>${base}</title>
  </head>
  <body>

    <h1>${base}</h1>
    <p>This is ${fileName}.</p>

  </body>
</html>`;
  }
  if (language === 'css') {
    return `/* ${fileName} */

`;
  }
  return `// ${fileName}

`;
}

function normalizeLanguageFileMap(rawMap, language, fallbackContent = '') {
  const meta = getLanguageFileMeta(language);
  const files = {};
  if (rawMap && typeof rawMap === 'object' && !Array.isArray(rawMap)) {
    Object.entries(rawMap).forEach(([name, content]) => {
      const cleanName = cleanLanguageFileName(name, language);
      if (!cleanName) return;
      files[cleanName] = typeof content === 'string' ? content : '';
    });
  }

  if (!Object.keys(files).length) {
    files[meta.defaultName] = typeof fallbackContent === 'string' ? fallbackContent : '';
  }

  if (!files[meta.defaultName]) {
    const firstKey = Object.keys(files)[0];
    if (firstKey && firstKey !== meta.defaultName && !files[meta.defaultName]) {
      files[meta.defaultName] = files[firstKey] || '';
    }
  }

  return files;
}

function getLanguageFileMap(language = activeLanguage, store = codeStore) {
  const meta = getLanguageFileMeta(language);
  if (language === 'html') {
    if (!store.pages || typeof store.pages !== 'object' || Array.isArray(store.pages)) {
      store.pages = normalizeHTMLPagesFromCodeStore(store);
    }
    return store.pages;
  }

  if (!store[meta.mapKey] || typeof store[meta.mapKey] !== 'object' || Array.isArray(store[meta.mapKey])) {
    store[meta.mapKey] = normalizeLanguageFileMap(store[meta.mapKey], language, typeof store[meta.codeKey] === 'string' ? store[meta.codeKey] : starterCode[meta.codeKey]);
  }
  return store[meta.mapKey];
}

function getLanguageFileNames(language = activeLanguage, store = codeStore) {
  const meta = getLanguageFileMeta(language);
  const files = getLanguageFileMap(language, store);
  const names = Object.keys(files).sort((a, b) => {
    if (a === meta.defaultName) return -1;
    if (b === meta.defaultName) return 1;
    return a.localeCompare(b);
  });
  return names.length ? names : [meta.defaultName];
}

function getActiveLanguageFileName(language = activeLanguage, store = codeStore) {
  const meta = getLanguageFileMeta(language);
  const files = getLanguageFileMap(language, store);
  let active = cleanLanguageFileName(store[meta.activeKey] || codeFileNames?.[language] || meta.defaultName, language);
  if (!files[active]) active = files[meta.defaultName] ? meta.defaultName : Object.keys(files)[0] || meta.defaultName;
  store[meta.activeKey] = active;
  return active;
}

function getLanguageFileContent(language = activeLanguage, fileName = getActiveLanguageFileName(language)) {
  const files = getLanguageFileMap(language);
  const safeName = cleanLanguageFileName(fileName, language);
  return typeof files[safeName] === 'string' ? files[safeName] : '';
}

function setLanguageFileContent(language = activeLanguage, fileName = getActiveLanguageFileName(language), content = '') {
  const meta = getLanguageFileMeta(language);
  const files = getLanguageFileMap(language);
  const safeName = cleanLanguageFileName(fileName, language);
  files[safeName] = String(content ?? '');
  codeStore[meta.activeKey] = safeName;
  codeStore[meta.codeKey] = files[safeName];
  codeFileNames[language] = safeName;
}

function syncActiveLanguageFileFromStore(language = activeLanguage) {
  const meta = getLanguageFileMeta(language);
  const active = getActiveLanguageFileName(language);
  const files = getLanguageFileMap(language);
  codeStore[meta.codeKey] = typeof files[active] === 'string' ? files[active] : starterCode[meta.codeKey];
  codeFileNames[language] = active;
  return active;
}

// Backward-compatible HTML page helpers used by the existing app/checker.
function getHTMLPages(store = codeStore) { return getLanguageFileMap('html', store); }
function getHTMLPageNames(store = codeStore) { return getLanguageFileNames('html', store); }
function getActiveHtmlPageName(store = codeStore) { return getActiveLanguageFileName('html', store); }
function getHTMLPageContent(pageName = getActiveHtmlPageName()) { return getLanguageFileContent('html', pageName); }
function setHTMLPageContent(pageName, content) { setLanguageFileContent('html', pageName, content); }
function syncActiveHTMLPageFromStore() { return syncActiveLanguageFileFromStore('html'); }

function isExternalHref(value = '') {
  return /^(https?:|mailto:|tel:|javascript:|data:|blob:|#)/i.test(String(value || '').trim());
}

function normalizeInternalHtmlReference(value = '') {
  const clean = String(value || '').trim().replace(/[?#].*$/, '');
  if (!clean || isExternalHref(clean)) return '';
  const base = clean.split('/').pop();
  if (!/\.html?$/i.test(base)) return '';
  return cleanLanguageFileName(base, 'html');
}

function getInternalHTMLPageReferences(html) {
  const refs = [];
  const pattern = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi;
  let match;
  while ((match = pattern.exec(String(html || ''))) !== null) {
    const clean = normalizeInternalHtmlReference(match[2]);
    if (clean) refs.push(clean);
  }
  return refs;
}

function getMissingInternalPageReferences() {
  const pages = getHTMLPages();
  const existing = new Set(Object.keys(pages).map(name => name.toLowerCase()));
  const missing = [];
  Object.entries(pages).forEach(([pageName, html]) => {
    getInternalHTMLPageReferences(html).forEach(ref => {
      if (!existing.has(ref.toLowerCase())) {
        missing.push({ from: pageName, to: ref });
      }
    });
  });
  return missing;
}

function getPageStructureProblems() {
  const currentActive = getActiveHtmlPageName();
  const pages = getHTMLPages();
  const problems = [];
  Object.entries(pages).forEach(([pageName, html]) => {
    const previous = codeStore.html;
    codeStore.html = html;
    const report = getHTMLStructureReport();
    codeStore.html = previous;
    if (!report.passed) {
      problems.push({ pageName, missing: report.missing.map(item => item.label) });
    }
  });
  codeStore.activeHtmlPage = currentActive;
  syncActiveHTMLPageFromStore();
  return problems;
}

function updateCodeFileManagerLabels() {
  const meta = getLanguageFileMeta(activeLanguage);
  const activeName = getActiveLanguageFileName(activeLanguage);
  const names = getLanguageFileNames(activeLanguage);
  if (htmlPageManager) htmlPageManager.dataset.language = activeLanguage;
  const label = htmlPageManager?.querySelector('.page-manager-label');
  if (label) label.textContent = 'Tabs/Pages';
  if (addHtmlPageBtn) addHtmlPageBtn.textContent = activeLanguage === 'html' ? '+ Page' : '+ File';
  if (renameHtmlPageBtn) renameHtmlPageBtn.textContent = 'Rename';
  if (deleteHtmlPageBtn) {
    deleteHtmlPageBtn.textContent = 'Delete';
    deleteHtmlPageBtn.disabled = names.length <= 1 || (activeLanguage === 'html' && activeName === 'index.html');
    deleteHtmlPageBtn.title = deleteHtmlPageBtn.disabled
      ? activeLanguage === 'html' && activeName === 'index.html'
        ? 'index.html must stay as the homepage.'
        : `Keep at least one ${meta.label}.`
      : `Delete ${activeName}`;
  }
}

function renderHTMLPageManager() {
  if (!htmlPageManager || !htmlPageSelect) return;
  if (!['html', 'css', 'js'].includes(activeLanguage)) {
    htmlPageManager.classList.add('hidden');
    htmlPageManager.setAttribute('aria-hidden', 'true');
    return;
  }

  htmlPageManager.classList.remove('hidden');
  htmlPageManager.setAttribute('aria-hidden', 'false');
  const active = getActiveLanguageFileName(activeLanguage);
  const names = getLanguageFileNames(activeLanguage);
  htmlPageSelect.innerHTML = names.map(name => `<option value="${escapeAttribute(name)}" ${name === active ? 'selected' : ''}>${escapeHTML(name)}</option>`).join('');
  htmlPageSelect.value = active;
  htmlPageSelect.setAttribute('aria-label', activeLanguage === 'html' ? 'Choose HTML page' : activeLanguage === 'css' ? 'Choose CSS file' : 'Choose JavaScript file');
  updateCodeFileManagerLabels();
}

function saveCodeStoreForCurrentActivity() {
  const codeKey = activity?.id || selectedActivityId || 'scratch';
  codeByActivity[codeKey] = normalizeCodeStore(codeStore);
  saveCodeByActivity();
  queueStudentProjectSave('edit');
}

function switchHTMLPage(fileName) {
  if (['html', 'css', 'js'].includes(activeLanguage)) saveActiveEditor();
  const safeName = cleanLanguageFileName(fileName, activeLanguage);
  const files = getLanguageFileMap(activeLanguage);
  if (!files[safeName]) return;
  codeStore[getLanguageFileMeta(activeLanguage).activeKey] = safeName;
  syncActiveLanguageFileFromStore(activeLanguage);
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();
  tabButtons.forEach(tab => tab.classList.toggle('active', tab.dataset.language === activeLanguage));
  loadActiveEditor();
  runCode(false, { scroll: false, pageName: getActiveHtmlPageName() });
  setStatus(`${getLanguageFileMeta(activeLanguage).label}: ${safeName}`);
}

function shouldPlacePageDialogInsideEditor() {
  return Boolean(
    editorPanel &&
    (
      document.fullscreenElement === editorPanel ||
      document.webkitFullscreenElement === editorPanel ||
      document.body.classList.contains('editor-fullscreen-active')
    )
  );
}

function placePageDialogForCurrentMode() {
  if (!pageDialogOverlay) return;
  const target = shouldPlacePageDialogInsideEditor() ? editorPanel : document.body;
  if (target && pageDialogOverlay.parentElement !== target) target.appendChild(pageDialogOverlay);
  pageDialogOverlay.classList.toggle('inside-editor-fullscreen', target === editorPanel);
}

function restorePageDialogToBody() {
  if (!pageDialogOverlay) return;
  pageDialogOverlay.classList.remove('inside-editor-fullscreen');
  if (pageDialogOverlay.parentElement !== document.body) document.body.appendChild(pageDialogOverlay);
}

let pageDialogMode = 'add';
let pageDialogOriginalName = '';
let pageDialogLanguage = 'html';

function openPageDialog(mode = 'add') {
  if (!pageDialogOverlay) return;
  if (['html', 'css', 'js'].includes(activeLanguage)) saveActiveEditor();
  pageDialogMode = mode;
  pageDialogLanguage = activeLanguage;
  const meta = getLanguageFileMeta(pageDialogLanguage);
  pageDialogOriginalName = getActiveLanguageFileName(pageDialogLanguage);
  const isRename = mode === 'rename';
  if (pageDialogTitle) pageDialogTitle.textContent = isRename ? meta.renameTitle : meta.addTitle;
  if (pageDialogText) pageDialogText.textContent = isRename ? meta.renameText : meta.addText;
  if (htmlPageNameInput) htmlPageNameInput.value = isRename ? pageDialogOriginalName : '';
  if (pageDialogNote) pageDialogNote.textContent = meta.note;
  placePageDialogForCurrentMode();
  pageDialogOverlay.classList.remove('hidden');
  document.body.classList.add('dialog-open');
  window.setTimeout(() => htmlPageNameInput?.focus({ preventScroll: true }), 0);
}

function closePageDialog() {
  if (!pageDialogOverlay) return;
  pageDialogOverlay.classList.add('hidden');
  document.body.classList.remove('dialog-open');
  restorePageDialogToBody();
  addHtmlPageBtn?.focus({ preventScroll: true });
}

function replaceHtmlFileReferences(oldName, newName, language) {
  const pages = getHTMLPages();
  const escaped = escapeRegExp(oldName);
  Object.keys(pages).forEach(page => {
    if (language === 'html') {
      pages[page] = String(pages[page]).replace(new RegExp(`(href\\s*=\\s*["'])${escaped}(["'])`, 'gi'), `$1${newName}$2`);
    } else if (language === 'css') {
      pages[page] = String(pages[page]).replace(new RegExp(`(href\\s*=\\s*["'])${escaped}(["'])`, 'gi'), `$1${newName}$2`);
    } else if (language === 'js') {
      pages[page] = String(pages[page]).replace(new RegExp(`(src\\s*=\\s*["'])${escaped}(["'])`, 'gi'), `$1${newName}$2`);
    }
  });
}

async function applyPageDialog() {
  const meta = getLanguageFileMeta(pageDialogLanguage);
  const newName = cleanLanguageFileName(htmlPageNameInput?.value || '', pageDialogLanguage);
  if (!newName) {
    if (pageDialogNote) pageDialogNote.textContent = `Please type a valid .${meta.extension} file name.`;
    return;
  }

  const files = getLanguageFileMap(pageDialogLanguage);
  const exists = Object.prototype.hasOwnProperty.call(files, newName);
  if (pageDialogMode === 'add') {
    if (exists) {
      if (pageDialogNote) pageDialogNote.textContent = `${newName} already exists.`;
      return;
    }
    files[newName] = createStarterForLanguageFile(pageDialogLanguage, newName);
    codeStore[meta.activeKey] = newName;
  } else {
    if (pageDialogLanguage === 'html' && pageDialogOriginalName === 'index.html' && newName !== 'index.html') {
      if (!await appConfirm('index.html is the homepage. Rename it anyway?', { title: 'Rename homepage' })) return;
    }
    if (newName !== pageDialogOriginalName && exists) {
      if (pageDialogNote) pageDialogNote.textContent = `${newName} already exists.`;
      return;
    }
    if (newName !== pageDialogOriginalName) {
      files[newName] = files[pageDialogOriginalName] || '';
      delete files[pageDialogOriginalName];
      replaceHtmlFileReferences(pageDialogOriginalName, newName, pageDialogLanguage);
      if (codeFileNames[pageDialogLanguage] === pageDialogOriginalName) {
        codeFileNames[pageDialogLanguage] = newName;
        saveCodeFileNames();
      }
    }
    codeStore[meta.activeKey] = newName;
  }

  syncActiveLanguageFileFromStore(pageDialogLanguage);
  if (pageDialogLanguage === 'html') syncActiveHTMLPageFromStore();
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();
  renderHTMLPageManager();
  if (activeLanguage === pageDialogLanguage) loadActiveEditor();
  runCode(false, { scroll: false });
  closePageDialog();
  setStatus(pageDialogMode === 'add' ? 'File added' : 'File renamed');
}

async function deleteCurrentHTMLPage() {
  if (['html', 'css', 'js'].includes(activeLanguage)) saveActiveEditor();
  const meta = getLanguageFileMeta(activeLanguage);
  const files = getLanguageFileMap(activeLanguage);
  const active = getActiveLanguageFileName(activeLanguage);
  const names = getLanguageFileNames(activeLanguage);
  if (names.length <= 1 || (activeLanguage === 'html' && active === 'index.html')) {
    await appAlert(activeLanguage === 'html' && active === 'index.html'
      ? 'index.html must stay as the main homepage. Add another page first before deleting pages.'
      : `Keep at least one ${meta.label}.`, { title: 'Cannot delete file' });
    return;
  }
  if (!await appConfirm(`Delete ${active}?`, { title: 'Delete file', danger: true })) return;
  delete files[active];
  codeStore[meta.activeKey] = files[meta.defaultName] ? meta.defaultName : Object.keys(files)[0] || meta.defaultName;
  syncActiveLanguageFileFromStore(activeLanguage);
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();
  renderHTMLPageManager();
  loadActiveEditor();
  runCode(false, { scroll: false });
  setStatus('File deleted');
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getBaseFileNameFromReference(value) {
  const clean = String(value || '').trim().replace(/[?#].*$/, '');
  return clean.split('/').pop().toLowerCase();
}

function getExternalCSSReferences(html) {
  const refs = [];
  const pattern = /<link\b[^>]*>/gi;
  const hrefPattern = /href\s*=\s*(["'])(.*?)\1/i;
  let match;
  while ((match = pattern.exec(String(html || ''))) !== null) {
    const tag = match[0];
    if (!/rel\s*=\s*(["'])[^"']*stylesheet[^"']*\1/i.test(tag)) continue;
    const hrefMatch = tag.match(hrefPattern);
    if (hrefMatch && hrefMatch[2]) refs.push(hrefMatch[2]);
  }
  return refs;
}

function getExternalJSReferences(html) {
  const refs = [];
  const pattern = /<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>\s*<\/script>/gi;
  let match;
  while ((match = pattern.exec(String(html || ''))) !== null) {
    if (match[2]) refs.push(match[2]);
  }
  return refs;
}

function hasMatchingExternalReference(references, filename) {
  const expected = String(filename || '').toLowerCase();
  return references.some(ref => getBaseFileNameFromReference(ref) === expected);
}

function normalizeHtmlPageName(value, fallback = 'index.html') {
  const cleaned = cleanCodeFileName(value || fallback, 'html');
  return cleaned || fallback;
}

function normalizeHTMLPagesFromCodeStore(rawCode = {}) {
  const safeCode = rawCode && typeof rawCode === 'object' ? rawCode : {};
  const sourcePages = safeCode.pages && typeof safeCode.pages === 'object' && !Array.isArray(safeCode.pages)
    ? safeCode.pages
    : null;
  const pages = {};

  if (sourcePages) {
    Object.entries(sourcePages).forEach(([name, content]) => {
      const cleanName = normalizeHtmlPageName(name);
      if (!cleanName) return;
      pages[cleanName] = typeof content === 'string' ? content : '';
    });
  }

  if (!Object.keys(pages).length) {
    const firstName = normalizeHtmlPageName(safeCode.activeHtmlPage || safeCode.htmlFileName || 'index.html');
    pages[firstName] = typeof safeCode.html === 'string' ? safeCode.html : starterCode.html;
  }

  if (!pages['index.html']) {
    const firstKey = Object.keys(pages)[0];
    if (firstKey) pages['index.html'] = pages[firstKey];
  }

  return pages;
}


function normalizeCodeStore(rawCode) {
  const safeCode = rawCode && typeof rawCode === 'object' ? rawCode : {};
  const pages = normalizeHTMLPagesFromCodeStore(safeCode);
  let activeHtmlPage = cleanLanguageFileName(safeCode.activeHtmlPage || safeCode.currentHtmlPage || safeCode.htmlFileName || DEFAULT_CODE_FILE_NAMES.html, 'html');
  if (!pages[activeHtmlPage]) activeHtmlPage = pages['index.html'] ? 'index.html' : Object.keys(pages)[0] || 'index.html';

  const cssFiles = normalizeLanguageFileMap(safeCode.cssFiles, 'css', typeof safeCode.css === 'string' ? safeCode.css : starterCode.css);
  let activeCssFile = cleanLanguageFileName(safeCode.activeCssFile || safeCode.cssFileName || DEFAULT_CODE_FILE_NAMES.css, 'css');
  if (!cssFiles[activeCssFile]) activeCssFile = cssFiles[DEFAULT_CODE_FILE_NAMES.css] ? DEFAULT_CODE_FILE_NAMES.css : Object.keys(cssFiles)[0] || DEFAULT_CODE_FILE_NAMES.css;

  const jsFiles = normalizeLanguageFileMap(safeCode.jsFiles, 'js', typeof safeCode.js === 'string' ? safeCode.js : starterCode.js);
  let activeJsFile = cleanLanguageFileName(safeCode.activeJsFile || safeCode.jsFileName || DEFAULT_CODE_FILE_NAMES.js, 'js');
  if (!jsFiles[activeJsFile]) activeJsFile = jsFiles[DEFAULT_CODE_FILE_NAMES.js] ? DEFAULT_CODE_FILE_NAMES.js : Object.keys(jsFiles)[0] || DEFAULT_CODE_FILE_NAMES.js;

  return {
    html: typeof pages[activeHtmlPage] === 'string' ? pages[activeHtmlPage] : starterCode.html,
    css: typeof cssFiles[activeCssFile] === 'string' ? cssFiles[activeCssFile] : starterCode.css,
    js: typeof jsFiles[activeJsFile] === 'string' ? jsFiles[activeJsFile] : starterCode.js,
    pages,
    cssFiles,
    jsFiles,
    activeHtmlPage,
    activeCssFile,
    activeJsFile
  };
}

function defaultLevelPoints(maxPoints) {
  const full = Math.max(0, Number(maxPoints) || 0);
  return {
    excellent: full,
    good: Math.max(0, Math.round(full * 0.75)),
    fair: Math.max(0, Math.round(full * 0.5)),
    needsImprovement: 0
  };
}

function normalizeLevels(rawLevels, maxPoints) {
  const pointDefaults = defaultLevelPoints(maxPoints);
  const safeLevels = rawLevels && typeof rawLevels === 'object' ? rawLevels : {};
  return rubricLevels.reduce((levels, level) => {
    const rawLevel = safeLevels[level.key] && typeof safeLevels[level.key] === 'object' ? safeLevels[level.key] : {};
    levels[level.key] = {
      label: level.label,
      points: Number.isFinite(Number(rawLevel.points)) ? Number(rawLevel.points) : pointDefaults[level.key],
      description: String(rawLevel.description || defaultLevelDescriptions[level.key] || '').trim()
    };
    return levels;
  }, {});
}

function getMaxPointsFromCriterion(criterion) {
  const directPoints = Number(criterion?.points);
  if (Number.isFinite(directPoints) && directPoints > 0) return directPoints;

  const levels = criterion?.levels && typeof criterion.levels === 'object' ? criterion.levels : {};
  const levelPoints = rubricLevels
    .map(level => Number(levels[level.key]?.points))
    .filter(value => Number.isFinite(value));

  return levelPoints.length ? Math.max(...levelPoints, 1) : 1;
}

function normalizeCriterion(criterion) {
  const safeCriterion = criterion && typeof criterion === 'object' ? criterion : {};
  const points = getMaxPointsFromCriterion(safeCriterion);
  return {
    id: safeCriterion.id || createId(),
    title: safeCriterion.title || 'Untitled criterion',
    points,
    rule: safeCriterion.rule || 'smart_rubric',
    target: safeCriterion.target || '',
    levels: normalizeLevels(safeCriterion.levels, points)
  };
}

function getCriterionLevel(criterion, levelKey) {
  const levels = normalizeLevels(criterion?.levels, criterion?.points || 1);
  return levels[levelKey] || levels.needsImprovement;
}

function getCriterionPossiblePoints(criterion) {
  const normalized = normalizeCriterion(criterion);
  const levelPoints = rubricLevels.map(item => Number(normalized.levels[item.key]?.points) || 0);
  return Math.max(...levelPoints, Number(normalized.points) || 0, 0);
}

function getSortedLevelKeysByScore(criterion) {
  const levels = normalizeLevels(criterion?.levels, criterion?.points || 1);
  return [...rubricLevels]
    .map(level => ({ key: level.key, points: Number(levels[level.key]?.points) || 0 }))
    .sort((a, b) => b.points - a.points)
    .map(item => item.key);
}

function normalizeActivity(rawActivity) {
  const safeActivity = rawActivity && typeof rawActivity === 'object' ? rawActivity : clone(defaultActivity);
  const criteria = Array.isArray(safeActivity.criteria) ? safeActivity.criteria : [];

  return {
    id: safeActivity.id || createId(),
    title: safeActivity.title || defaultActivity.title,
    description: safeActivity.description || defaultActivity.description,
    passingScore: Number(safeActivity.passingScore) || 75,
    criteria: criteria.map(normalizeCriterion)
  };
}

function normalizeActivities(rawActivities) {
  const source = Array.isArray(rawActivities) ? rawActivities : [];
  return source.map(item => normalizeActivity(item));
}

function getInitialActivities() {
  const savedActivities = loadJSON(STORAGE_KEYS.activities, null);
  if (Array.isArray(savedActivities)) {
    return normalizeActivities(savedActivities);
  }

  // Fresh blank version: do not auto-create Activity 1 and do not import legacy activities.
  return [];
}

function getInitialSelectedActivityId() {
  return '';
}

function getInitialCodeByActivity() {
  const saved = loadJSON(STORAGE_KEYS.codeByActivity, null);
  const fallbackActivityId = activity?.id || selectedActivityId || activities[0]?.id || 'scratch';

  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    if ('html' in saved || 'css' in saved || 'js' in saved) {
      return { [fallbackActivityId]: normalizeCodeStore(saved) };
    }

    return Object.fromEntries(
      Object.entries(saved).map(([activityId, code]) => [activityId, normalizeCodeStore(code)])
    );
  }

  return {};
}

function getActivityById(activityId) {
  return activities.find(item => item.id === activityId) || null;
}

function saveActivities(options = {}) {
  saveJSON(STORAGE_KEYS.activities, activities);
  if (options.cloud !== false) {
    queueCloudActivitiesSave();
  }
}

function saveCodeByActivity() {
  saveJSON(STORAGE_KEYS.codeByActivity, codeByActivity);
}

function getCodeStoreForActivity(activityId) {
  if (!codeByActivity[activityId]) {
    codeByActivity[activityId] = normalizeCodeStore(starterCode);
    saveCodeByActivity();
  }

  return codeByActivity[activityId];
}



