function getHTMLStructureReport() {
  const html = codeStore.html || '';
  const checks = [
    { key: 'doctype', label: '<!DOCTYPE html>', passed: /<!doctype\s+html\s*>/i.test(html) },
    { key: 'htmlOpen', label: '<html>', passed: /<html(\s|>)/i.test(html) },
    { key: 'htmlClose', label: '</html>', passed: /<\/html\s*>/i.test(html) },
    { key: 'headOpen', label: '<head>', passed: /<head(\s|>)/i.test(html) },
    { key: 'headClose', label: '</head>', passed: /<\/head\s*>/i.test(html) },
    { key: 'title', label: '<title>', passed: /<title(\s|>)[\s\S]*?<\/title\s*>/i.test(html) },
    { key: 'bodyOpen', label: '<body>', passed: /<body(\s|>)/i.test(html) },
    { key: 'bodyClose', label: '</body>', passed: /<\/body\s*>/i.test(html) }
  ];

  return {
    checks,
    passed: checks.every(item => item.passed),
    missing: checks.filter(item => !item.passed)
  };
}

function renderStructureAlert() {
  if (!structureAlert) return;

  if (activeLanguage !== 'html') {
    structureAlert.classList.add('hidden');
    return;
  }

  const report = getHTMLStructureReport();
  structureAlert.classList.remove('hidden', 'good', 'warning');
  structureAlert.classList.add(report.passed ? 'good' : 'warning');

  const message = report.passed
    ? 'Complete HTML structure detected. Good job!'
    : 'Whole HTML structure required. Add the missing parts below.';

  structureAlert.innerHTML = `
    <div class="structure-message">
      <strong>${message}</strong>
      <span>HTML-only output still works after clicking Run Code.</span>
    </div>
    <div class="structure-list">
      ${report.checks.map(item => `
        <span class="structure-chip ${item.passed ? 'pass' : 'missing'}">${item.passed ? '✓' : '!'} ${escapeHTML(item.label)}</span>
      `).join('')}
    </div>
  `;
}

function isCompleteHTMLStructure() {
  return getHTMLStructureReport().passed;
}


function hasBalancedHTMLTags(html) {
  const issues = getDetailedHTMLTagIssues(html || '');
  return !issues.some(issue => issue.severity === 'error');
}


function createStyleBlock(cssText = '') {
  const css = String(cssText || '').trim();
  if (!css) return '';
  const safeCSS = css.replace(/<\/style>/gi, '');
  return `<style>\n${safeCSS}\n</style>`;
}

function createScriptBlock(jsText = '') {
  const js = String(jsText || '').trim();
  if (!js) return '';
  const safeJS = JSON.stringify(js).replace(/<\//g, '<\\/');

  return `<script>
(function () {
  function showStudentError(error) {
    document.body.dataset.runtimeError = error.message || String(error);
    var pre = document.createElement('pre');
    pre.textContent = 'JavaScript Error: ' + (error.message || String(error));
    pre.style.background = '#fee2e2';
    pre.style.color = '#991b1b';
    pre.style.padding = '16px';
    pre.style.borderRadius = '12px';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.fontFamily = 'Consolas, Monaco, monospace';
    document.body.appendChild(pre);
    try {
      parent.postMessage({ type: 'mcs-preview-runtime', level: 'error', message: error.message || String(error) }, '*');
    } catch (postError) {}
  }

  try {
    new Function(${safeJS})();
  } catch (error) {
    showStudentError(error);
  }
})();
<\/script>`;
}

function getReferencedCodeFiles(html, language) {
  const refs = language === 'css' ? getExternalCSSReferences(html) : getExternalJSReferences(html);
  const files = getLanguageFileMap(language);
  const matches = [];
  refs.forEach(ref => {
    const base = cleanLanguageFileName(getBaseFileNameFromReference(ref), language);
    if (base && Object.prototype.hasOwnProperty.call(files, base)) {
      matches.push({ name: base, content: files[base] || '' });
    }
  });
  return matches;
}

function getCSSBlocksForPreview(html) {
  const refs = getExternalCSSReferences(html);
  const matched = getReferencedCodeFiles(html, 'css').filter(item => String(item.content || '').trim());
  if (refs.length) return matched.map(item => createStyleBlock(item.content)).join('\n');
  const activeCss = getLanguageFileContent('css', getActiveLanguageFileName('css'));
  return activeCss.trim() ? createStyleBlock(activeCss) : '';
}

function getJSBlocksForPreview(html) {
  const refs = getExternalJSReferences(html);
  const matched = getReferencedCodeFiles(html, 'js').filter(item => String(item.content || '').trim());
  if (refs.length) return matched.map(item => createScriptBlock(item.content)).join('\n');
  const activeJs = getLanguageFileContent('js', getActiveLanguageFileName('js'));
  return activeJs.trim() ? createScriptBlock(activeJs) : '';
}

function shouldApplyCSSForPreview(html) {
  return Boolean(getCSSBlocksForPreview(html));
}

function shouldApplyJSForPreview(html) {
  return Boolean(getJSBlocksForPreview(html));
}

function injectAssetsIntoHTML(html, styleBlock, scriptBlock) {
  let output = html || '';

  if (styleBlock) {
    if (/<\/head\s*>/i.test(output)) {
      output = output.replace(/<\/head\s*>/i, `${styleBlock}\n</head>`);
    } else {
      output = `${styleBlock}\n${output}`;
    }
  }

  if (scriptBlock) {
    if (/<\/body\s*>/i.test(output)) {
      output = output.replace(/<\/body\s*>/i, `${scriptBlock}\n</body>`);
    } else {
      output = `${output}\n${scriptBlock}`;
    }
  }

  return output;
}


function shouldOpenExternalLinksInsidePreview() {
  const settings = normalizeAssistanceSettings(studentAssistanceSettings);
  return settings.externalLinksSamePreview !== false;
}

function createPreviewNavigationBlock(currentPageName = getActiveHtmlPageName()) {
  const safePage = JSON.stringify(currentPageName);
  const externalLinksInsidePreview = shouldOpenExternalLinksInsidePreview();
  const safeExternalLinksInsidePreview = JSON.stringify(externalLinksInsidePreview);
  return `<script>
(function () {
  var currentPage = ${safePage};
  var externalLinksInsidePreview = ${safeExternalLinksInsidePreview};

  function isExternalWebLink(href) {
    return /^https?:\/\//i.test(String(href || '').trim());
  }

  function isInternalPage(href) {
    if (!href || /^(https?:|mailto:|tel:|javascript:|data:|blob:|#)/i.test(href)) return false;
    var clean = href.split('#')[0].split('?')[0];
    var name = clean.split('/').pop();
    return /\.html?$/i.test(name);
  }

  function prepareExternalLinks(root) {
    var links = (root || document).querySelectorAll ? (root || document).querySelectorAll('a[href]') : [];
    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href') || '';
      if (!isExternalWebLink(href)) return;
      if (externalLinksInsidePreview) {
        link.setAttribute('target', '_self');
        link.removeAttribute('rel');
        return;
      }
      link.setAttribute('target', '_blank');
      var rel = (link.getAttribute('rel') || '').toLowerCase();
      if (rel.indexOf('noopener') === -1 || rel.indexOf('noreferrer') === -1) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  prepareExternalLinks(document);

  try {
    var observer = new MutationObserver(function () { prepareExternalLinks(document); });
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  } catch (error) {}

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';

    if (isExternalWebLink(href)) {
      if (externalLinksInsidePreview) {
        event.preventDefault();
        try { window.location.href = href; } catch (error) { link.setAttribute('target', '_self'); }
        return;
      }
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      return;
    }

    if (!isInternalPage(href)) return;
    event.preventDefault();
    parent.postMessage({ type: 'mcs-preview-navigate', href: href, from: currentPage }, '*');
  }, true);
})();
<\/script>`;
}


function createPreviewRuntimeReporterBlock() {
  return `<script>
(function () {
  function send(level, message) {
    try {
      var clean = String(message || '').replace(/\s+/g, ' ').slice(0, 500);
      if (!clean) return;
      if (document.body && level !== 'log') document.body.dataset.runtimeError = clean;
      parent.postMessage({ type: 'mcs-preview-runtime', level: level, message: clean }, '*');
    } catch (error) {}
  }
  window.addEventListener('error', function (event) {
    send('error', event.message || (event.error && event.error.message) || 'JavaScript error');
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    send('unhandledrejection', reason && reason.message ? reason.message : reason);
  });
  ['error', 'warn'].forEach(function (method) {
    var original = console[method];
    console[method] = function () {
      var message = Array.prototype.slice.call(arguments).map(function (item) {
        if (item && item.message) return item.message;
        if (typeof item === 'object') {
          try { return JSON.stringify(item); } catch (error) { return String(item); }
        }
        return String(item);
      }).join(' ');
      send(method === 'error' ? 'error' : 'warning', message);
      if (original) original.apply(console, arguments);
    };
  });
})();
<\/script>`;
}


function injectRuntimeReporterEarly(html, reporterBlock) {
  let output = html || '';
  if (!reporterBlock) return output;
  if (/<head\b[^>]*>/i.test(output)) {
    return output.replace(/<head\b[^>]*>/i, match => `${match}\n${reporterBlock}`);
  }
  if (/<html\b[^>]*>/i.test(output)) {
    return output.replace(/<html\b[^>]*>/i, match => `${match}\n${reporterBlock}`);
  }
  if (/<!doctype\s+html\s*>/i.test(output)) {
    return output.replace(/<!doctype\s+html\s*>/i, match => `${match}\n${reporterBlock}`);
  }
  return `${reporterBlock}\n${output}`;
}

function buildFullCode(pageName = getActiveHtmlPageName()) {
  const safePageName = normalizeHtmlPageName(pageName);
  const html = getHTMLPageContent(safePageName) || '';
  const styleBlock = getCSSBlocksForPreview(html);
  const scriptBlock = getJSBlocksForPreview(html);
  const navigationBlock = createPreviewNavigationBlock(safePageName);
  const runtimeReporterBlock = createPreviewRuntimeReporterBlock();
  const bodyScriptBlock = [scriptBlock, navigationBlock].filter(Boolean).join('\n');
  const looksLikeFullDocument = /<!doctype/i.test(html) || /<html(\s|>)/i.test(html) || /<head(\s|>)/i.test(html) || /<body(\s|>)/i.test(html);

  if (looksLikeFullDocument) {
    return injectAssetsIntoHTML(injectRuntimeReporterEarly(html, runtimeReporterBlock), styleBlock, bodyScriptBlock);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${runtimeReporterBlock}
  ${styleBlock}
</head>
<body>
${html}
${bodyScriptBlock}
</body>
</html>`;
}

function getCollapsedTopbarHeight(topbar) {
  if (!topbar) return 0;
  const brandHeight = topbar.querySelector('.brand-block')?.getBoundingClientRect().height || 0;
  const actionsHeight = topbar.querySelector('.top-actions')?.getBoundingClientRect().height || 0;
  const styles = window.getComputedStyle(topbar);
  const paddingY = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
  const borderY = (parseFloat(styles.borderTopWidth) || 0) + (parseFloat(styles.borderBottomWidth) || 0);
  return Math.ceil(Math.max(brandHeight, actionsHeight, 42) + paddingY + borderY);
}

function getTopbarSafeOffset(options = {}) {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return options.tight ? 8 : 14;

  const isPhone = document.documentElement.dataset.deviceMode === 'phone' || window.innerWidth <= 760;
  if (isPhone) {
    const rect = topbar.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;
    return Math.ceil((visible ? Math.max(0, rect.bottom) : 0) + (options.tight ? 6 : 10));
  }

  let topbarHeight = topbar.getBoundingClientRect().height || 0;
  const isDesktop = window.matchMedia?.('(min-width: 821px)').matches ?? window.innerWidth >= 821;
  const accountStripCanSlide = isDesktop && (
    document.body.classList.contains('student-session-active') ||
    document.body.classList.contains('guest-session-active')
  );

  // The account strip is hidden until hover on desktop. Do not include its
  // expanded height while aligning Output Preview; otherwise Run stops too low.
  if (options.preferCollapsedHeader && accountStripCanSlide) {
    const collapsedHeight = getCollapsedTopbarHeight(topbar);
    if (collapsedHeight > 0) topbarHeight = Math.min(topbarHeight, collapsedHeight);
  }

  return Math.ceil(topbarHeight + (options.tight ? 6 : 12));
}

function getViewportSafeTop(options = {}) {
  if (options.outputTopLock) return 0;
  const topbar = document.querySelector('.topbar');
  const margin = options.tight ? 6 : 10;
  if (!topbar) return margin;

  const isPhone = document.documentElement.dataset.deviceMode === 'phone' || window.innerWidth <= 760;
  const rect = topbar.getBoundingClientRect();
  const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
  if (!isVisible) return margin;

  if (isPhone) return Math.ceil(Math.max(0, rect.bottom) + margin);

  const isDesktop = window.matchMedia?.('(min-width: 821px)').matches ?? window.innerWidth >= 821;
  const accountStripCanSlide = isDesktop && (
    document.body.classList.contains('student-session-active') ||
    document.body.classList.contains('guest-session-active')
  );

  if (options.preferCollapsedHeader && accountStripCanSlide) {
    return Math.ceil(Math.max(0, rect.top) + getCollapsedTopbarHeight(topbar) + margin);
  }

  return Math.ceil(Math.max(0, rect.bottom) + margin);
}

let outputPreviewScrollTimer = 0;
let outputPreviewScrollRaf = 0;
let outputPreviewAnimationFrame = 0;
let outputPreviewLastTarget = -1;

function getElementDocumentTop(element) {
  const rect = element.getBoundingClientRect();
  return Math.max(0, window.scrollY + rect.top);
}

function getMaxWindowScrollTop() {
  const doc = document.documentElement;
  const body = document.body;
  return Math.max(0, Math.max(
    doc?.scrollHeight || 0,
    body?.scrollHeight || 0
  ) - window.innerHeight);
}

function getOutputPreviewTargetScrollTop(element, options = {}) {
  const safeTop = getViewportSafeTop(options);
  const rawTarget = Math.round(getElementDocumentTop(element) - safeTop);
  return Math.max(0, Math.min(getMaxWindowScrollTop(), rawTarget));
}

function cancelOutputPreviewScroll() {
  window.clearTimeout(outputPreviewScrollTimer);
  if (outputPreviewScrollRaf) window.cancelAnimationFrame(outputPreviewScrollRaf);
  if (outputPreviewAnimationFrame) window.cancelAnimationFrame(outputPreviewAnimationFrame);
  outputPreviewScrollTimer = 0;
  outputPreviewScrollRaf = 0;
  outputPreviewAnimationFrame = 0;
}

function animateWindowScrollTo(targetTop, options = {}) {
  const startTop = Math.round(window.scrollY || document.documentElement.scrollTop || 0);
  const distance = targetTop - startTop;
  const prefersReducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const duration = prefersReducedMotion || options.instant ? 0 : Number(options.duration || 220);

  if (Math.abs(distance) < 3 || duration <= 0) {
    window.scrollTo(0, targetTop);
    return;
  }

  const start = performance.now();
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const step = now => {
    const progress = Math.min(1, (now - start) / duration);
    const nextTop = Math.round(startTop + (distance * easeOutCubic(progress)));
    window.scrollTo(0, nextTop);
    if (progress < 1) {
      outputPreviewAnimationFrame = window.requestAnimationFrame(step);
    } else {
      outputPreviewAnimationFrame = 0;
      window.scrollTo(0, targetTop);
    }
  };
  outputPreviewAnimationFrame = window.requestAnimationFrame(step);
}

function alignElementToViewportTop(element, options = {}) {
  if (!element) return;
  const targetTop = getOutputPreviewTargetScrollTop(element, options);
  const currentTop = Math.round(window.scrollY || document.documentElement.scrollTop || 0);
  if (Math.abs(targetTop - currentTop) < 3) return;
  outputPreviewLastTarget = targetTop;
  animateWindowScrollTo(targetTop, options);
}

function scrollElementIntoSafeView(element, delay = 0, options = {}) {
  if (!element) return;
  cancelOutputPreviewScroll();

  const runScroll = () => {
    outputPreviewScrollRaf = window.requestAnimationFrame(() => {
      outputPreviewScrollRaf = 0;
      alignElementToViewportTop(element, options);
    });
  };

  if (delay > 0) outputPreviewScrollTimer = window.setTimeout(runScroll, delay);
  else runScroll();
}

function scrollToOutput() {
  // Fast premium-feel scroll: one short custom animation, exact top alignment,
  // no repeated correction timers that make phones feel laggy.
  scrollElementIntoSafeView(previewPanel, 0, {
    tight: true,
    preferCollapsedHeader: true,
    outputTopLock: true,
    duration: 220
  });
}

function playBookPageTransition(direction = 'to-preview') {
  window.clearTimeout(bookTransitionTimer);
  document.body.classList.remove(
    'book-page-transitioning',
    'book-to-preview',
    'book-to-editor',
    'book-preview-revealing',
    'book-preview-leaving',
    'book-editor-revealing'
  );

  // Force a reflow so the animation always restarts, even after repeated Run/Back clicks.
  void document.body.offsetWidth;
  document.body.classList.add(
    'book-page-transitioning',
    direction === 'to-editor' ? 'book-to-editor' : 'book-to-preview'
  );

  bookTransitionTimer = window.setTimeout(() => {
    document.body.classList.remove(
      'book-page-transitioning',
      'book-to-preview',
      'book-to-editor',
      'book-preview-revealing',
      'book-preview-leaving',
      'book-editor-revealing'
    );
    fullscreenPageTransitionBusy = false;
  }, FULLSCREEN_PAGE_TRANSITION_MS + 180);
}


function removeFullscreenBookTransitionLayer() {
  const layer = document.getElementById('fullscreenBookTransitionLayer');
  if (layer) layer.remove();
}

function ensureFullscreenBookTransitionLayer(direction = 'to-preview', label = '') {
  if (!editorPanel) return null;
  removeFullscreenBookTransitionLayer();
  const layer = document.createElement('div');
  layer.id = 'fullscreenBookTransitionLayer';
  layer.className = `fullscreen-book-transition-layer ${direction === 'to-editor' ? 'to-editor' : 'to-preview'}`;
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <div class="fullscreen-book-vignette"></div>
    <div class="fullscreen-book-stage">
      <div class="fullscreen-book-fixed-page"></div>
      <div class="fullscreen-book-turn-page">
        <span class="fullscreen-book-spine"></span>
        <span class="fullscreen-book-highlight"></span>
      </div>
      <div class="fullscreen-book-edge"></div>
    </div>
    <div class="fullscreen-book-caption">${escapeHTML(label)}</div>
  `;
  editorPanel.appendChild(layer);
  return layer;
}

function clearFullscreenBookStateClasses() {
  document.body.classList.remove(
    'book-page-transitioning',
    'book-to-preview',
    'book-to-editor',
    'book-preview-revealing',
    'book-preview-leaving',
    'book-editor-revealing'
  );
}

function runSmoothFullscreenBookTransition({ direction = 'to-preview', label = '', onSwap = null, onDone = null } = {}) {
  window.clearTimeout(bookTransitionTimer);
  window.clearTimeout(previewCloseToEditorTimer);
  clearFullscreenBookStateClasses();

  const layer = ensureFullscreenBookTransitionLayer(direction, label);
  if (!layer) {
    if (typeof onSwap === 'function') onSwap();
    if (typeof onDone === 'function') onDone();
    fullscreenPageTransitionBusy = false;
    return;
  }

  // Force layout once so the animation starts cleanly every time.
  void layer.offsetWidth;
  document.body.classList.add('fullscreen-book-transition-active');
  layer.classList.add('is-running');

  const swapDelay = direction === 'to-editor' ? 560 : 540;
  const doneDelay = 1240;

  const swapTimer = window.setTimeout(() => {
    layer.classList.add('has-swapped');
    try {
      if (typeof onSwap === 'function') onSwap();
    } catch (error) {
      console.error('Book transition swap failed', error);
    }
  }, swapDelay);

  bookTransitionTimer = window.setTimeout(() => {
    window.clearTimeout(swapTimer);
    layer.classList.add('is-done');
    window.setTimeout(() => {
      removeFullscreenBookTransitionLayer();
      document.body.classList.remove('fullscreen-book-transition-active');
      clearFullscreenBookStateClasses();
      try {
        if (typeof onDone === 'function') onDone();
      } catch (error) {
        console.error('Book transition completion failed', error);
      }
      fullscreenPageTransitionBusy = false;
    }, 90);
  }, doneDelay);
}

function movePreviewPanelIntoEditorFullscreen() {
  if (!previewPanel || !editorPanel) return false;

  if (!previewMovedIntoEditor) {
    previewOriginalParent = previewPanel.parentElement;
    previewOriginalNextSibling = previewPanel.nextSibling;
    editorPanel.appendChild(previewPanel);
    previewMovedIntoEditor = true;
  }

  document.body.classList.add('preview-inside-editor-fullscreen');
  return true;
}

function restorePreviewPanelFromEditorFullscreen() {
  if (previewMovedIntoEditor && previewOriginalParent) {
    if (previewOriginalNextSibling && previewOriginalNextSibling.parentElement === previewOriginalParent) {
      previewOriginalParent.insertBefore(previewPanel, previewOriginalNextSibling);
    } else {
      previewOriginalParent.appendChild(previewPanel);
    }
  }

  previewMovedIntoEditor = false;
  previewOriginalParent = null;
  previewOriginalNextSibling = null;
  document.body.classList.remove('preview-inside-editor-fullscreen', 'preview-closing-to-editor');
}

function openOutputPreviewAfterFullEditor() {
  if (fullscreenPageTransitionBusy) return;
  fullscreenPageTransitionBusy = true;
  returnToFullEditorAfterPreview = true;
  hideSuggestions();
  closeCodeHelperPanel();

  runSmoothFullscreenBookTransition({
    direction: 'to-preview',
    label: 'Opening Output Preview',
    onSwap: () => {
      movePreviewPanelIntoEditorFullscreen();
      enterFullPreview({ fromFullEditor: true, nativeFullscreen: false, keepEditorFullscreen: true });
      document.body.classList.add('book-preview-revealing');
    },
    onDone: () => {
      document.body.classList.remove('book-preview-revealing');
      ensureBackToEditorPreviewBtn()?.focus({ preventScroll: true });
    }
  });
}

function runCode(showMessage = true, options = {}) {
  const wasFullEditor = document.body.classList.contains('editor-fullscreen-active');
  saveActiveEditor();
  const pageName = normalizeHtmlPageName(options.pageName || getActiveHtmlPageName());
  latestPreviewRuntimeError = '';
  latestPreviewConsoleMessage = '';
  previewRenderToken += 1;
  setPreviewLoading(true, { token: previewRenderToken, pageName });
  previewFrame.srcdoc = buildFullCode(pageName);
  previewFrame.dataset.currentPage = pageName;
  window.setTimeout(renderErrorChecker, 180);

  if (showMessage) {
    setStatus(wasFullEditor ? 'Output full preview' : `Output: ${pageName}`);
    if (options.trackRun !== false) markStudentProjectRun();
  }

  if (typeof window.__MCS_SUPER_STUDIO_AFTER_RUN__ === 'function') {
    try {
      window.__MCS_SUPER_STUDIO_AFTER_RUN__({ pageName, showMessage, options });
    } catch (error) {
      console.warn('Super Studio run hook skipped.', error);
    }
  }

  if (options.scroll !== false && showMessage) {
    if (wasFullEditor) {
      openOutputPreviewAfterFullEditor();
      return;
    }
    scrollToOutput();
  }
}

function getPreviewDocument() {
  try {
    return previewFrame.contentDocument || previewFrame.contentWindow.document;
  } catch (error) {
    return null;
  }
}

function getOutputText() {
  const doc = getPreviewDocument();
  return (doc?.body?.innerText || doc?.body?.textContent || '').toLowerCase();
}

function queryPreview(selector) {
  const doc = getPreviewDocument();
  try {
    return doc ? doc.querySelector(selector) : null;
  } catch (error) {
    return null;
  }
}

function navigatePreviewToPage(rawHref) {
  const target = normalizeInternalHtmlReference(rawHref);
  if (!target) return false;
  const pages = getHTMLPages();
  if (!pages[target]) {
    renderErrorChecker();
    setStatus('Missing page');
    appAlert(`${target} does not exist yet. Add this page in Pages, or change the link href.`, { title: 'Missing linked page' });
    return false;
  }
  latestPreviewRuntimeError = '';
  latestPreviewConsoleMessage = '';
  previewRenderToken += 1;
  setPreviewLoading(true, { token: previewRenderToken, pageName: target });
  previewFrame.srcdoc = buildFullCode(target);
  previewFrame.dataset.currentPage = target;
  setStatus(`Preview: ${target}`);
  return true;
}

window.addEventListener('message', event => {
  const data = event.data || {};
  if (!data) return;
  if (data.type === 'mcs-preview-navigate') {
    navigatePreviewToPage(data.href);
    return;
  }
  if (data.type === 'mcs-preview-runtime') {
    handlePreviewRuntimeIssue(data);
  }
});

function getBodyInnerHTML(html) {
  const match = String(html || '').match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
  return match ? match[1] : String(html || '');
}

function stripHTMLTags(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


function getDetailedHTMLTagIssues(html) {
  const source = String(html || '');
  const tags = parseHtmlTags(source);
  const structureReport = getHTMLStructureReport();
  const structureIsComplete = structureReport.passed;
  const protectedStructureTags = new Set(['html', 'head', 'body', 'title']);
  const optionalEndTags = new Set(['li', 'p', 'dt', 'dd', 'option', 'optgroup', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'colgroup']);

  return tags
    .filter(tag => !tag.selfClosing && tag.pairIndex === null)
    .filter(tag => !(structureIsComplete && protectedStructureTags.has(tag.name)))
    .slice(0, 8)
    .map(tag => {
      const optional = optionalEndTags.has(tag.name);
      const reason = tag.unmatchedReason || (tag.closing ? 'missing-opening' : 'missing-closing');
      return {
        name: tag.name,
        line: getLineNumberAt(source, tag.start),
        closing: tag.closing,
        reason,
        severity: optional ? 'warning' : 'warning',
        confidence: optional ? 'low' : 'medium'
      };
    });
}

function hasBalancedCurlyBraces(value) {
  const text = String(value || '').replace(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g, '');
  let count = 0;
  for (const char of text) {
    if (char === '{') count += 1;
    if (char === '}') count -= 1;
    if (count < 0) return false;
  }
  return count === 0;
}

function getJavaScriptSyntaxError(js) {
  const code = String(js || '').trim();
  if (!code) return '';
  try {
    new Function(code);
    return '';
  } catch (error) {
    return error.message || String(error);
  }
}

function getRuntimeErrorMessage() {
  const doc = getPreviewDocument();
  return latestPreviewRuntimeError || doc?.body?.dataset?.runtimeError || '';
}

function createCheckerItem(type, title, detail, fix = '') {
  return { type, title, detail, fix };
}



function getFilenameReferenceCheckerItems() {
  const html = codeStore.html || '';
  const cssFiles = getLanguageFileMap('css');
  const jsFiles = getLanguageFileMap('js');
  const cssNames = Object.keys(cssFiles);
  const jsNames = Object.keys(jsFiles);
  const items = [];
  const cssReferences = getExternalCSSReferences(html);
  const jsReferences = getExternalJSReferences(html);
  const cssMissing = cssReferences
    .map(ref => cleanLanguageFileName(getBaseFileNameFromReference(ref), 'css'))
    .filter(name => name && !Object.prototype.hasOwnProperty.call(cssFiles, name));
  const jsMissing = jsReferences
    .map(ref => cleanLanguageFileName(getBaseFileNameFromReference(ref), 'js'))
    .filter(name => name && !Object.prototype.hasOwnProperty.call(jsFiles, name));
  const cssMatched = cssReferences
    .map(ref => cleanLanguageFileName(getBaseFileNameFromReference(ref), 'css'))
    .filter(name => name && Object.prototype.hasOwnProperty.call(cssFiles, name));
  const jsMatched = jsReferences
    .map(ref => cleanLanguageFileName(getBaseFileNameFromReference(ref), 'js'))
    .filter(name => name && Object.prototype.hasOwnProperty.call(jsFiles, name));

  if (cssReferences.length && cssMissing.length) {
    items.push(createCheckerItem(
      'error',
      'CSS file link mismatch',
      `HTML links to missing CSS file${cssMissing.length === 1 ? '' : 's'}: ${cssMissing.join(', ')}. Existing CSS files: ${cssNames.join(', ') || 'none'}.`,
      'Add that CSS file in Tabs/Pages, rename your CSS file, or change the HTML href.'
    ));
  } else if (cssMatched.length) {
    items.push(createCheckerItem('pass', 'CSS file link matches', `HTML correctly links to ${[...new Set(cssMatched)].join(', ')}.`));
  }

  if (jsReferences.length && jsMissing.length) {
    items.push(createCheckerItem(
      'error',
      'JavaScript file link mismatch',
      `HTML links to missing JavaScript file${jsMissing.length === 1 ? '' : 's'}: ${jsMissing.join(', ')}. Existing JS files: ${jsNames.join(', ') || 'none'}.`,
      'Add that JS file in Tabs/Pages, rename your JS file, or change the HTML src.'
    ));
  } else if (jsMatched.length) {
    items.push(createCheckerItem('pass', 'JavaScript file link matches', `HTML correctly links to ${[...new Set(jsMatched)].join(', ')}.`));
  }

  if (cssReferences.length && cssMatched.some(name => !String(cssFiles[name] || '').trim())) {
    items.push(createCheckerItem('warning', 'Linked CSS file is blank', 'One linked CSS file exists but has no CSS code yet.', 'Open that CSS file in Tabs/Pages and add CSS code.'));
  }

  if (jsReferences.length && jsMatched.some(name => !String(jsFiles[name] || '').trim())) {
    items.push(createCheckerItem('warning', 'Linked JavaScript file is blank', 'One linked JavaScript file exists but has no JavaScript code yet.', 'Open that JS file in Tabs/Pages and add JavaScript code.'));
  }

  return items;
}

function getErrorCheckerItems() {
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const items = [];
  const structureReport = getHTMLStructureReport();
  const bodyInner = getBodyInnerHTML(html);
  const bodyText = stripHTMLTags(bodyInner);
  const tagIssues = getDetailedHTMLTagIssues(html);
  const jsSyntaxError = getJavaScriptSyntaxError(js);
  const runtimeError = getRuntimeErrorMessage();

  if (structureReport.passed) {
    items.push(createCheckerItem('pass', 'Complete HTML structure', 'DOCTYPE, html, head, title, and body are detected.'));
  } else {
    items.push(createCheckerItem(
      'error',
      'Missing HTML structure',
      `Missing: ${structureReport.missing.map(item => item.label).join(', ') || 'required structure'}.`,
      'Use the complete HTML starter structure before adding content.'
    ));
  }

  if (/<title\b[^>]*>\s*<\/title\s*>/i.test(html)) {
    items.push(createCheckerItem('warning', 'Empty title tag', 'Your <title> exists but has no title text.', 'Type a short page title inside <title>.'));
  } else if (/<title\b[^>]*>[\s\S]+?<\/title\s*>/i.test(html)) {
    items.push(createCheckerItem('pass', 'Title tag has content', 'The browser tab title is not empty.'));
  }

  if (bodyText.length >= 3) {
    items.push(createCheckerItem('pass', 'Body has visible content', 'Your webpage has readable text/content inside the body.'));
  } else {
    items.push(createCheckerItem('warning', 'Body looks empty', 'The body section has little or no visible text.', 'Add a heading, paragraph, image, button, or other visible content inside <body>.'));
  }

  if (!tagIssues.length) {
    items.push(createCheckerItem('pass', 'HTML tags look balanced', 'No confirmed missing opening/closing tag was detected.'));
  } else {
    const details = tagIssues.map(issue => {
      return issue.closing
        ? `Possible issue: </${issue.name}> on line ${issue.line} may not have a matching opening tag`
        : `Possible issue: <${issue.name}> on line ${issue.line} may need </${issue.name}>`;
    }).join('; ');
    items.push(createCheckerItem(
      'warning',
      'Possible tag closing issue',
      details,
      'Review the highlighted line, but do not worry if the page output is correct. This checker now treats uncertain tag matches as warnings, not automatic errors.'
    ));
  }

  if (css.trim()) {
    if (hasBalancedCurlyBraces(css)) {
      items.push(createCheckerItem('pass', 'CSS braces look okay', 'Opening and closing curly braces are balanced.'));
    } else {
      items.push(createCheckerItem('error', 'CSS brace problem', 'One or more CSS { } braces are missing or extra.', 'Check each selector and make sure every { has a matching }.'));
    }

    if (!/[a-z-]+\s*:\s*[^;{}]+;?/i.test(css)) {
      items.push(createCheckerItem('warning', 'CSS may be incomplete', 'CSS has text but no clear property/value pair was detected.', 'Example: color: blue; or background: lightyellow;'));
    }
  } else {
    items.push(createCheckerItem('tip', 'CSS is blank', 'This is okay if the activity does not require design.'));
  }

  if (js.trim()) {
    if (jsSyntaxError) {
      items.push(createCheckerItem('error', 'JavaScript syntax error', jsSyntaxError, 'Check missing parentheses, quotes, braces, or semicolons.'));
    } else {
      items.push(createCheckerItem('pass', 'JavaScript syntax looks okay', 'No basic JavaScript syntax error was detected.'));
    }

    if (runtimeError) {
      items.push(createCheckerItem('error', 'JavaScript runtime error', runtimeError, 'Run again after checking element IDs, variable names, and event code.'));
    }
  } else {
    items.push(createCheckerItem('tip', 'JavaScript is blank', 'This is okay if the activity does not require interactivity.'));
  }

  items.push(...getFilenameReferenceCheckerItems());

  const pageNames = getHTMLPageNames();
  if (pageNames.length > 1) {
    items.push(createCheckerItem('pass', 'Multi-page website mode', `${pageNames.length} HTML pages found: ${pageNames.join(', ')}.`));
  }

  const missingPageLinks = getMissingInternalPageReferences();
  if (missingPageLinks.length) {
    const details = missingPageLinks.slice(0, 6).map(item => `${item.from} links to missing ${item.to}`).join('; ');
    items.push(createCheckerItem('error', 'Broken page links', details, 'Add the missing page in Pages or change the href to an existing .html file.'));
  } else if (pageNames.length > 1) {
    items.push(createCheckerItem('pass', 'Page links look valid', 'Internal .html links point to existing pages.'));
  }

  const pageStructureProblems = getPageStructureProblems();
  if (pageStructureProblems.length) {
    const details = pageStructureProblems.slice(0, 5).map(item => `${item.pageName} missing ${item.missing.join(', ')}`).join('; ');
    items.push(createCheckerItem('warning', 'Some pages need complete HTML structure', details, 'Open each page from Pages and complete its HTML structure.'));
  }

  return items;
}


function getAICodeCheckerEndpoint() {
  return String(window.MCS_AI_CHECKER_ENDPOINT || window.MCS_AI_CODE_CHECK_ENDPOINT || '').trim();
}

function isAICodeCheckerEnabled() {
  return window.MCS_AI_CHECKER_ENABLED !== false;
}

function buildAICodeCheckerPayload(items = getErrorCheckerItems()) {
  return {
    app: 'Grade 8 MCSian Web Code Editor',
    task: 'code-error-check',
    checkerItems: items.map(item => ({
      type: item.type,
      title: item.title,
      detail: item.detail,
      fix: item.fix || ''
    })),
    outputText: getOutputText().slice(0, 4000),
    code: {
      html: getShortCodeSample(codeStore.html, 6000),
      css: getShortCodeSample(codeStore.css, 5000),
      js: getShortCodeSample(codeStore.js, 5000)
    },
    instruction: 'Check if the local error checker is correct. Return JSON only with keys: summary, confirmedErrors, falsePositiveWarnings, suggestions. confirmedErrors and falsePositiveWarnings must be arrays of short beginner-friendly strings. Do not provide a full replacement code answer.'
  };
}

function normalizeAICodeCheckResponse(data) {
  const source = data?.check || data?.review || data || {};
  return {
    summary: String(source.summary || source.message || 'Advanced check completed.'),
    confirmedErrors: Array.isArray(source.confirmedErrors) ? source.confirmedErrors : [],
    falsePositiveWarnings: Array.isArray(source.falsePositiveWarnings) ? source.falsePositiveWarnings : [],
    suggestions: Array.isArray(source.suggestions) ? source.suggestions : []
  };
}

function getLocalSmartCheckerReview(items = getErrorCheckerItems()) {
  const errors = items.filter(item => item.type === 'error');
  const warnings = items.filter(item => item.type === 'warning');
  const possibleTagWarnings = warnings.filter(item => /tag/i.test(item.title));

  return {
    summary: errors.length
      ? `${errors.length} confirmed issue${errors.length === 1 ? '' : 's'} found. Possible tag issues are only warnings now.`
      : warnings.length
        ? `No confirmed errors found. ${warnings.length} warning${warnings.length === 1 ? '' : 's'} may still need review.`
        : 'No confirmed errors found. The code looks okay based on the local checker.',
    confirmedErrors: errors.map(item => `${item.title}: ${item.detail}`).slice(0, 5),
    falsePositiveWarnings: possibleTagWarnings.map(item => `${item.title}: ${item.detail}`).slice(0, 4),
    suggestions: warnings
      .filter(item => !/tag/i.test(item.title))
      .map(item => item.fix || item.detail)
      .filter(Boolean)
      .slice(0, 5)
  };
}

function renderAdvancedCheckerReview(review, options = {}) {
  if (!errorCheckerContent) return;
  const safe = normalizeAICodeCheckResponse(review);
  const existing = errorCheckerContent.querySelector('.advanced-checker-card');
  if (existing) existing.remove();

  const card = document.createElement('div');
  card.className = `advanced-checker-card ${options.loading ? 'loading' : ''}`;
  card.innerHTML = options.loading ? `
    <div class="advanced-checker-head">
      <strong>Smart verification is checking...</strong>
      <span>Reviewing code, output, and local checker results.</span>
    </div>
  ` : `
    <div class="advanced-checker-head">
      <strong>${escapeHTML(options.remote ? 'Advanced verification' : 'Smart local verification')}</strong>
      <span>${escapeHTML(safe.summary)}</span>
    </div>
    ${safe.confirmedErrors.length ? `
      <div class="advanced-checker-block error">
        <h4>Confirmed issues</h4>
        <ul>${safe.confirmedErrors.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
    ${safe.falsePositiveWarnings.length ? `
      <div class="advanced-checker-block warning">
        <h4>Possible false alarms / review only</h4>
        <ul>${safe.falsePositiveWarnings.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
    ${safe.suggestions.length ? `
      <div class="advanced-checker-block tip">
        <h4>Suggestions</h4>
        <ul>${safe.suggestions.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
  `;

  errorCheckerContent.prepend(card);
}

async function requestAdvancedErrorCheck() {
  saveActiveEditor();
  runCode(false, { scroll: false });
  const items = getErrorCheckerItems();
  renderErrorChecker();

  if (!isAICodeCheckerEnabled()) {
    renderAdvancedCheckerReview(getLocalSmartCheckerReview(items));
    setStatus('Smart checked');
    return;
  }

  const endpoint = getAICodeCheckerEndpoint();
  if (!endpoint) {
    renderAdvancedCheckerReview(getLocalSmartCheckerReview(items));
    setStatus('Smart checked');
    return;
  }

  renderAdvancedCheckerReview(getLocalSmartCheckerReview(items), { loading: true, remote: true });
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAICodeCheckerPayload(items))
    });
    if (!response.ok) throw new Error(`Checker endpoint returned ${response.status}`);
    const data = await response.json();
    renderAdvancedCheckerReview(normalizeAICodeCheckResponse(data), { remote: true });
    setStatus('Advanced checked');
  } catch (error) {
    console.warn('Advanced checker failed; using smart local review.', error);
    const fallback = getLocalSmartCheckerReview(items);
    fallback.summary = `${fallback.summary} Advanced verification was unavailable, so the smart local checker was used.`;
    renderAdvancedCheckerReview(fallback);
    setStatus('Smart checked');
  }
}

function renderErrorChecker() {
  if (!errorCheckerContent) return;
  const items = getErrorCheckerItems();
  const errorCount = items.filter(item => item.type === 'error').length;
  const warningCount = items.filter(item => item.type === 'warning').length;
  const passCount = items.filter(item => item.type === 'pass').length;

  const summaryClass = errorCount ? 'error' : warningCount ? 'warning' : 'pass';
  const summaryText = errorCount
    ? `${errorCount} error${errorCount > 1 ? 's' : ''} found`
    : warningCount
      ? `${warningCount} warning${warningCount > 1 ? 's' : ''} found`
      : 'No major errors found';

  errorCheckerContent.innerHTML = `
    <div class="checker-summary ${summaryClass}">
      <div>
        <strong>${escapeHTML(summaryText)}</strong>
        <span>${passCount} passed checks · ${warningCount} warning${warningCount === 1 ? '' : 's'} · ${errorCount} error${errorCount === 1 ? '' : 's'}</span>
      </div>
    </div>
    <div class="checker-list">
      ${items.map(item => `
        <article class="checker-item ${escapeAttribute(item.type)}">
          <span class="checker-icon">${item.type === 'pass' ? '✓' : item.type === 'error' ? '!' : item.type === 'warning' ? '⚠' : 'i'}</span>
          <div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.detail)}</p>
            ${item.fix ? `<small>Fix: ${escapeHTML(item.fix)}</small>` : ''}
          </div>
        </article>
      `).join('')}
    </div>
  `;
}



function openCodeHelperPanel() {
  if (!errorCheckerPanel) return;
  if (!isStudentAssistanceFeatureEnabled('codeHelper')) {
    setStatus('Code Helper is disabled by the teacher');
    return;
  }
  saveActiveEditor();
  renderErrorChecker();
  errorCheckerPanel.classList.remove('hidden');
  errorCheckerPanel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('code-helper-open');
  setStatus('Code Helper opened');
  window.setTimeout(() => refreshErrorCheckerBtn?.focus({ preventScroll: true }), 0);
}

function closeCodeHelperPanel() {
  if (!errorCheckerPanel) return;
  errorCheckerPanel.classList.add('hidden');
  errorCheckerPanel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('code-helper-open');
  codeHelperFloatingBtn?.focus({ preventScroll: true });
}

function toggleCodeHelperPanel() {
  if (!errorCheckerPanel) return;
  if (!isStudentAssistanceFeatureEnabled('codeHelper')) {
    setStatus('Code Helper is disabled by the teacher');
    return;
  }
  if (errorCheckerPanel.classList.contains('hidden')) {
    openCodeHelperPanel();
  } else {
    closeCodeHelperPanel();
  }
}


let deferredInstallPrompt = null;

function isAppInstalledMode() {
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;
}

function updateInstallButtonVisibility() {
  if (!installAppBtn) return;
  const shouldShow = !isAppInstalledMode();
  installAppBtn.classList.toggle('hidden', !shouldShow);
}

function registerPWAServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      if (typeof registration.update === 'function') {
        window.setTimeout(() => registration.update().catch(() => null), 1200);
      }

      let updateNoticeShown = false;
      const showUpdateNotice = () => {
        if (updateNoticeShown) return;
        updateNoticeShown = true;
        const message = studentProjectDirty
          ? 'App update ready. Save your project, then refresh.'
          : 'App update ready. Refresh when convenient.';
        if (typeof setStatus === 'function') setStatus(message);
      };

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotice();
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (studentProjectDirty || studentProjectSaveInFlight) {
          showUpdateNotice();
          return;
        }
        // Keep control with the fresh worker without forcing a disruptive reload.
        window.MCS_SERVICE_WORKER_UPDATED = true;
      });
    } catch (error) {
      console.warn('Service worker registration failed', error);
    }
  });
}

async function handleInstallAppClick() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch (error) {
      console.warn('Install prompt closed', error);
    }
    deferredInstallPrompt = null;
    updateInstallButtonVisibility();
    return;
  }

  const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
  const message = isiOS
    ? 'To install on iPhone/iPad: tap Share, then choose Add to Home Screen.'
    : 'To install on Android/Chrome: open the browser menu, then choose Install app or Add to Home screen.';
  appAlert(message, { title: 'Install on phone' });
}

function setupPWAInstallPrompt() {
  updateInstallButtonVisibility();

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButtonVisibility();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updateInstallButtonVisibility();
    setStatus('Installed');
  });

  installAppBtn?.addEventListener('click', handleInstallAppClick);
}

