/* SUPER STUDIO UPGRADE: classroom coding platform tools beyond a plain code editor. */
(function initSuperStudioUpgrade() {
  if (window.__MCS_SUPER_STUDIO_READY__) return;
  window.__MCS_SUPER_STUDIO_READY__ = true;
  if (!editor || !editorPanel || !previewPanel) return;

  const STUDIO_STORAGE = {
    snapshots: 'studentCodeStudio.superStudio.snapshots.v1',
    panelOpen: 'studentCodeStudio.superStudio.panelOpen.v1',
    device: 'studentCodeStudio.superStudio.device.v1'
  };
  const STUDIO_SNAPSHOT_LIMIT = 24;
  let studioCoachTimer = null;
  let studioLastRunAt = '';
  let studioCommandIndex = 0;
  let studioDrawerOpen = false;

  function studioReadJSON(key, fallback) {
    try {
      if (typeof loadJSON === 'function') return loadJSON(key, fallback);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function studioSaveJSON(key, value) {
    try {
      if (typeof saveJSON === 'function') saveJSON(key, value);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Super Studio could not save local data.', error);
    }
  }

  function studioEscape(value) {
    return typeof escapeHTML === 'function'
      ? escapeHTML(value)
      : String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function studioButton(id, text, title, className = 'ghost-btn studio-btn') {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.title = title;
    return button;
  }

  function isSuperStudioEnabled() {
    return typeof isStudentAssistanceFeatureEnabled === 'function'
      ? isStudentAssistanceFeatureEnabled('superStudio')
      : false;
  }


  function renderStudioLauncherState() {
    const launcher = document.getElementById('superStudioLauncher');
    if (!launcher) return;
    const enabled = isSuperStudioEnabled();
    const isOpen = enabled && studioDrawerOpen;
    launcher.classList.toggle('is-active', isOpen);
    launcher.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
    launcher.title = isOpen ? 'Hide Super Studio tools' : 'Open optional Super Studio tools';
    launcher.innerHTML = isOpen
      ? '<span>✖</span><strong>Hide Studio</strong>'
      : '<span>🚀</span><strong>Studio</strong>';
  }

  function getStudioOverlayHost() {
    const inEditorFullscreen = document.fullscreenElement === editorPanel || document.body.classList.contains('editor-fullscreen-active');
    return inEditorFullscreen ? editorPanel : document.body;
  }

  function placeStudioOverlay(overlay) {
    if (!overlay) return;
    const host = getStudioOverlayHost();
    if (overlay.parentElement !== host) host.appendChild(overlay);
    overlay.classList.toggle('inside-editor-fullscreen', host === editorPanel);
  }

  function placeAllStudioOverlays() {
    placeStudioOverlay(document.getElementById('studioCommandOverlay'));
    placeStudioOverlay(document.getElementById('studioSnapshotsOverlay'));
  }

  function isDesktopEditorFullscreen() {
    const inEditorFullscreen = document.fullscreenElement === editorPanel || document.body.classList.contains('editor-fullscreen-active');
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    return inEditorFullscreen && !mobile;
  }

  function ensureFullscreenBottomToolDock() {
    let dock = document.getElementById('fullscreenBottomTools');
    if (dock) return dock;
    dock = document.createElement('div');
    dock.id = 'fullscreenBottomTools';
    dock.className = 'fullscreen-bottom-tools hidden';
    dock.setAttribute('role', 'toolbar');
    dock.setAttribute('aria-label', 'Fullscreen quick tools');
    editorPanel.appendChild(dock);
    return dock;
  }

  function syncFullscreenBottomToolDock() {
    const dock = ensureFullscreenBottomToolDock();
    const launcher = document.getElementById('superStudioLauncher');
    const helperBtn = codeHelperFloatingBtn;
    if (!dock || !launcher || !helperBtn) return;

    const useDock = isDesktopEditorFullscreen();
    dock.classList.toggle('hidden', !useDock);
    launcher.classList.toggle('studio-launcher-docked', useDock);
    helperBtn.classList.toggle('code-helper-docked', useDock);

    if (useDock) {
      if (launcher.parentElement !== dock) dock.appendChild(launcher);
      if (helperBtn.parentElement !== dock) dock.appendChild(helperBtn);
      return;
    }

    if (helperBtn.parentElement === dock) editorPanel.appendChild(helperBtn);
  }

  function placeStudioLauncher() {
    const launcher = document.getElementById('superStudioLauncher');
    const languageTabs = editorPanel.querySelector('.language-tabs');
    const pageActions = document.querySelector('.page-manager-actions');
    if (!launcher || !languageTabs) return;

    if (isDesktopEditorFullscreen()) {
      languageTabs.classList.remove('has-studio-launcher');
      pageActions?.classList.remove('has-studio-launcher');
      launcher.classList.add('studio-launcher-desktop');
      launcher.classList.remove('studio-launcher-mobile');
      syncFullscreenBottomToolDock();
      return;
    }

    const mobile = window.matchMedia('(max-width: 760px)').matches;
    languageTabs.classList.toggle('has-studio-launcher', !mobile);
    pageActions?.classList.toggle('has-studio-launcher', mobile);

    if (mobile && pageActions) {
      launcher.classList.add('studio-launcher-mobile');
      launcher.classList.remove('studio-launcher-desktop');
      const renamePageButton = document.getElementById('renameHtmlPageBtn');
      if (renamePageButton && renamePageButton.parentElement === pageActions) {
        renamePageButton.insertAdjacentElement('afterend', launcher);
      } else if (launcher.parentElement !== pageActions) {
        pageActions.appendChild(launcher);
      }
      syncFullscreenBottomToolDock();
      return;
    }

    launcher.classList.add('studio-launcher-desktop');
    launcher.classList.remove('studio-launcher-mobile');
    pageActions?.classList.remove('has-studio-launcher');
    const renameFilesButton = document.getElementById('renameFilesBtn');
    if (renameFilesButton && renameFilesButton.parentElement === languageTabs) {
      renameFilesButton.insertAdjacentElement('afterend', launcher);
    } else if (launcher.parentElement !== languageTabs) {
      languageTabs.appendChild(launcher);
    }
    syncFullscreenBottomToolDock();
  }

  function ensureStudioToolbar() {
    if (document.getElementById('superStudioToolbar')) return;
    const languageTabs = editorPanel.querySelector('.language-tabs');
    if (!languageTabs) return;

    const launcher = document.createElement('button');
    launcher.id = 'superStudioLauncher';
    launcher.type = 'button';
    launcher.className = 'ghost-btn studio-launcher studio-launcher-desktop';
    launcher.setAttribute('aria-pressed', 'false');
    languageTabs.appendChild(launcher);
    renderStudioLauncherState();
    placeStudioLauncher();

    const toolbar = document.createElement('div');
    toolbar.id = 'superStudioToolbar';
    toolbar.className = 'super-studio-toolbar studio-hidden';
    toolbar.innerHTML = `
      <div class="studio-toolbar-left">
        <span class="studio-badge studio-badge-hot">Super Studio</span>
        <span id="studioQualityChip" class="studio-quality-chip">Code Health --</span>
        <span id="studioLinesChip" class="studio-mini-chip">0 lines</span>
        <span id="studioRunChip" class="studio-mini-chip">Not run yet</span>
      </div>
      <div class="studio-toolbar-actions">
        <button id="studioToggleCoachBtn" class="ghost-btn studio-btn" type="button">Coach</button>
        <button id="studioFormatBtn" class="ghost-btn studio-btn" type="button" title="Format current tab">Format</button>
        <button id="studioSnapshotBtn" class="ghost-btn studio-btn" type="button" title="Save a restorable code checkpoint">Snapshot</button>
        <button id="studioRestoreBtn" class="ghost-btn studio-btn" type="button" title="Restore or delete snapshots">Restore</button>
        <button id="studioCommandBtn" class="ghost-btn studio-btn strong" type="button" title="Open command palette: Ctrl+K">Commands</button>
      </div>
    `;
    languageTabs.insertAdjacentElement('afterend', toolbar);

    const coach = document.createElement('section');
    coach.id = 'superStudioPanel';
    coach.className = 'super-studio-panel collapsed studio-hidden';
    coach.setAttribute('aria-label', 'Super Studio live coach');
    coach.innerHTML = `
      <div class="studio-score-card">
        <div class="studio-score-ring" title="Code Health is a quick coach check, not the final grade."><span id="studioQualityValue">--</span><small>%</small></div>
        <div>
          <p class="section-kicker">Live Coach</p>
          <h2 id="studioCoachTitle">Ready to guide the student</h2>
          <p id="studioCoachMessage">Start typing, then the coach will show the next best fix.</p>
        </div>
      </div>
      <div class="studio-progress-track" aria-hidden="true"><span id="studioProgressFill"></span></div>
      <div id="studioCoachIssues" class="studio-coach-issues"></div>
    `;
    const insertAfter = document.getElementById('structureAlert') || toolbar;
    insertAfter.insertAdjacentElement('afterend', coach);

    document.getElementById('studioToggleCoachBtn')?.setAttribute('aria-pressed', 'false');
    setStudioDrawerOpen(false, { silent: true });
  }

  function setStudioDrawerOpen(open, options = {}) {
    const enabled = isSuperStudioEnabled();
    studioDrawerOpen = Boolean(open) && enabled;
    const launcher = document.getElementById('superStudioLauncher');
    const toolbar = document.getElementById('superStudioToolbar');
    const coach = document.getElementById('superStudioPanel');

    placeStudioLauncher();
    // Keep the launcher visible even while Studio is open, especially on phones.
    // The same button becomes "Hide Studio" so students always have a way to close it.
    launcher?.classList.toggle('studio-hidden', !enabled);
    launcher?.classList.toggle('hidden', !enabled);
    toolbar?.classList.toggle('studio-hidden', !enabled || !studioDrawerOpen);
    coach?.classList.toggle('studio-hidden', !enabled || !studioDrawerOpen);

    document.querySelectorAll('.super-studio-only').forEach(item => item.classList.toggle('hidden', !enabled || !studioDrawerOpen));
    document.body.classList.toggle('super-studio-open', enabled && studioDrawerOpen);
    renderStudioLauncherState();
    if (!enabled || !studioDrawerOpen) {
      coach?.classList.add('collapsed');
      document.getElementById('studioToggleCoachBtn')?.setAttribute('aria-pressed', 'false');
    }
    if (!options.silent) setStatus(studioDrawerOpen ? 'Super Studio opened' : 'Super Studio hidden');
  }

  function ensureStudioModals() {
    if (!document.getElementById('studioCommandOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'studioCommandOverlay';
      overlay.className = 'studio-command-overlay hidden';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'studioCommandTitle');
      overlay.innerHTML = `
        <div class="studio-command-card">
          <div class="studio-command-head">
            <div>
              <p class="section-kicker">Super Studio</p>
              <h2 id="studioCommandTitle">Command Palette</h2>
            </div>
            <button id="studioCloseCommandBtn" class="icon-btn" type="button" aria-label="Close command palette">x</button>
          </div>
          <input id="studioCommandInput" class="studio-command-input" type="search" placeholder="Search action... Example: format, run, snapshot" autocomplete="off" />
          <div id="studioCommandList" class="studio-command-list" role="listbox" aria-label="Available Super Studio commands"></div>
          <p class="studio-command-note">Tip: Press Ctrl+K anytime. Use Enter to run the selected action.</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    if (!document.getElementById('studioSnapshotsOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'studioSnapshotsOverlay';
      overlay.className = 'studio-command-overlay hidden';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'studioSnapshotsTitle');
      overlay.innerHTML = `
        <div class="studio-command-card studio-snapshot-card">
          <div class="studio-command-head">
            <div>
              <p class="section-kicker">Super Studio</p>
              <h2 id="studioSnapshotsTitle">Code Snapshots</h2>
            </div>
            <button id="studioCloseSnapshotsBtn" class="icon-btn" type="button" aria-label="Close snapshots">x</button>
          </div>
          <div id="studioSnapshotsList" class="studio-snapshots-list"></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  }

  function getStudioSnapshots() {
    const snapshots = studioReadJSON(STUDIO_STORAGE.snapshots, []);
    return Array.isArray(snapshots) ? snapshots.filter(Boolean) : [];
  }

  function saveStudioSnapshots(snapshots) {
    studioSaveJSON(STUDIO_STORAGE.snapshots, snapshots.slice(0, STUDIO_SNAPSHOT_LIMIT));
  }

  function getStudioSnapshotTitle() {
    const projectName = appSession?.currentProject?.name || '';
    const activityName = activity?.title || '';
    const pageName = typeof getActiveLanguageFileName === 'function' ? getActiveLanguageFileName(activeLanguage) : activeLanguage;
    return [projectName, activityName, `${String(activeLanguage || 'code').toUpperCase()} ${pageName}`].filter(Boolean).join(' - ') || 'Code checkpoint';
  }

  function saveStudioSnapshot(showToast = true) {
    saveActiveEditor();
    const snapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: getStudioSnapshotTitle(),
      createdAt: new Date().toISOString(),
      projectId: appSession?.currentProjectId || '',
      activityId: activity?.id || selectedActivityId || 'scratch',
      activeLanguage,
      activeFileName: typeof getActiveLanguageFileName === 'function' ? getActiveLanguageFileName(activeLanguage) : '',
      fileNames: typeof getCodeFileNames === 'function' ? getCodeFileNames() : codeFileNames,
      codeStore: JSON.parse(JSON.stringify(normalizeCodeStore(codeStore)))
    };
    const snapshots = [snapshot, ...getStudioSnapshots()].slice(0, STUDIO_SNAPSHOT_LIMIT);
    saveStudioSnapshots(snapshots);
    renderStudioSnapshotsButtonState();
    if (showToast) setStatus('Snapshot saved');
    scheduleStudioCoachUpdate(60);
    return snapshot;
  }

  async function restoreStudioSnapshot(snapshotId) {
    const snapshot = getStudioSnapshots().find(item => item.id === snapshotId);
    if (!snapshot) {
      setStatus('Snapshot not found');
      return;
    }
    if (!await appConfirm(`Restore “${snapshot.title || 'this snapshot'}”? Your current editor content will be replaced.`, {
      title: 'Restore snapshot',
      confirmText: 'Restore',
      danger: true
    })) return;
    saveActiveEditor();
    codeStore = normalizeCodeStore(snapshot.codeStore || {});
    codeFileNames = normalizeCodeFileNames(snapshot.fileNames || codeFileNames || DEFAULT_CODE_FILE_NAMES);
    activeLanguage = ['html', 'css', 'js'].includes(snapshot.activeLanguage) ? snapshot.activeLanguage : activeLanguage;
    const key = activity?.id || selectedActivityId || 'scratch';
    codeByActivity[key] = normalizeCodeStore(codeStore);
    saveCodeFileNames();
    saveCodeByActivity();
    saveCodeStoreForCurrentActivity();
    tabButtons.forEach(tab => tab.classList.toggle('active', tab.dataset.language === activeLanguage));
    loadActiveEditor();
    runCode(false, { scroll: false, trackRun: false, source: 'snapshot' });
    closeStudioSnapshots();
    setStatus('Snapshot restored');
    scheduleStudioCoachUpdate(80);
  }

  async function deleteStudioSnapshot(snapshotId) {
    const snapshot = getStudioSnapshots().find(item => item.id === snapshotId);
    if (!snapshot) return;
    if (!await appConfirm(`Delete “${snapshot.title || 'this snapshot'}”? This checkpoint cannot be recovered.`, {
      title: 'Delete snapshot',
      confirmText: 'Delete',
      danger: true
    })) return;
    saveStudioSnapshots(getStudioSnapshots().filter(item => item.id !== snapshotId));
    renderStudioSnapshots();
    renderStudioSnapshotsButtonState();
    setStatus('Snapshot deleted');
  }

  function renderStudioSnapshotsButtonState() {
    const count = getStudioSnapshots().length;
    const restoreBtn = document.getElementById('studioRestoreBtn');
    if (restoreBtn) restoreBtn.textContent = count ? `Restore (${count})` : 'Restore';
  }

  function formatDateShort(value) {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function renderStudioSnapshots() {
    const list = document.getElementById('studioSnapshotsList');
    if (!list) return;
    const snapshots = getStudioSnapshots();
    if (!snapshots.length) {
      list.innerHTML = '<div class="studio-empty-box"><strong>No snapshots yet.</strong><p>Click Snapshot before big edits so students can roll back safely.</p></div>';
      return;
    }
    list.innerHTML = snapshots.map(item => `
      <article class="studio-snapshot-item" data-snapshot-id="${studioEscape(item.id)}">
        <div>
          <strong>${studioEscape(item.title || 'Code checkpoint')}</strong>
          <small>${studioEscape(formatDateShort(item.createdAt))} - ${studioEscape(String(item.activeLanguage || 'code').toUpperCase())}</small>
        </div>
        <div class="studio-snapshot-actions">
          <button class="primary-btn" type="button" data-snapshot-action="restore">Restore</button>
          <button class="ghost-btn danger" type="button" data-snapshot-action="delete">Delete</button>
        </div>
      </article>
    `).join('');
  }

  function openStudioSnapshots() {
    ensureStudioModals();
    const overlay = document.getElementById('studioSnapshotsOverlay');
    placeStudioOverlay(overlay);
    renderStudioSnapshots();
    overlay?.classList.remove('hidden');
    window.setTimeout(() => overlay?.querySelector('button')?.focus(), 20);
  }

  function closeStudioSnapshots() {
    document.getElementById('studioSnapshotsOverlay')?.classList.add('hidden');
  }

  function cleanTrailingSpaces(value) {
    return String(value || '').split('\n').map(line => line.replace(/[ \t]+$/g, '')).join('\n').trim() + '\n';
  }

  function formatHTMLCode(value) {
    const voidTags = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
    const raw = cleanTrailingSpaces(value)
      .replace(/>\s+</g, '>\n<')
      .replace(/\n{3,}/g, '\n\n');
    const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
    let indent = 0;
    const output = [];
    lines.forEach(line => {
      const closing = /^<\//.test(line);
      const tagMatch = line.match(/^<\s*([a-zA-Z0-9-]+)/);
      const tagName = tagMatch ? tagMatch[1] : '';
      const selfClosing = /^<!|^<\?|\/\s*>$/.test(line) || voidTags.test(tagName);
      const opens = /^<[^!/][^>]*>/.test(line) && !selfClosing && !new RegExp(`</${tagName}\\s*>$`, 'i').test(line);
      if (closing) indent = Math.max(0, indent - 1);
      output.push(`${'  '.repeat(indent)}${line}`);
      if (opens) indent += 1;
    });
    return output.join('\n') + '\n';
  }

  function formatCSSCode(value) {
    const source = cleanTrailingSpaces(value)
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\n{3,}/g, '\n\n');
    let indent = 0;
    return source.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      if (line.startsWith('}')) indent = Math.max(0, indent - 1);
      const out = `${'  '.repeat(indent)}${line}`;
      if (line.endsWith('{')) indent += 1;
      return out;
    }).join('\n') + '\n';
  }

  function formatJSCode(value) {
    const source = cleanTrailingSpaces(value);
    let output = '';
    let indent = 0;
    let quote = '';
    let escaped = false;
    let parenDepth = 0;
    let inLineComment = false;
    let inBlockComment = false;
    const pushNewline = () => {
      output = output.replace(/[ \t]+$/g, '');
      if (!output.endsWith('\n')) output += '\n';
      output += '  '.repeat(Math.max(0, indent));
    };
    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      const next = source[i + 1] || '';
      if (inLineComment) {
        output += char;
        if (char === '\n') {
          inLineComment = false;
          output += '  '.repeat(Math.max(0, indent));
        }
        continue;
      }
      if (inBlockComment) {
        output += char;
        if (char === '*' && next === '/') {
          output += next;
          i += 1;
          inBlockComment = false;
        }
        continue;
      }
      if (quote) {
        output += char;
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '/' && next === '/') {
        inLineComment = true;
        output += char + next;
        i += 1;
        continue;
      }
      if (char === '/' && next === '*') {
        inBlockComment = true;
        output += char + next;
        i += 1;
        continue;
      }
      if (char === '"' || char === "'" || char === '`') {
        quote = char;
        output += char;
        continue;
      }
      if (char === '(' || char === '[') parenDepth += 1;
      if (char === ')' || char === ']') parenDepth = Math.max(0, parenDepth - 1);
      if (char === '{') {
        output = output.replace(/[ \t]+$/g, '') + ' {';
        indent += 1;
        pushNewline();
        continue;
      }
      if (char === '}') {
        indent = Math.max(0, indent - 1);
        output = output.replace(/[ \t]+$/g, '');
        if (!output.endsWith('\n')) output += '\n';
        output += `${'  '.repeat(indent)}}`;
        if (next && next !== ';' && next !== ',' && next !== ')' && next !== ']') pushNewline();
        continue;
      }
      if (char === ';' && parenDepth === 0) {
        output += ';';
        pushNewline();
        continue;
      }
      if (char === '\n') {
        if (!output.endsWith('\n')) pushNewline();
        continue;
      }
      output += char;
    }
    return output.split('\n').map(line => line.replace(/[ \t]+$/g, '')).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  function formatActiveCode() {
    if (!editor) return;
    saveActiveEditor();
    const before = editor.value;
    const formatter = activeLanguage === 'html' ? formatHTMLCode : activeLanguage === 'css' ? formatCSSCode : formatJSCode;
    const after = formatter(before);
    if (after === before) {
      setStatus('Already formatted');
      return;
    }
    applyProgrammaticEditorChange(after, Math.min(editor.selectionStart, after.length), Math.min(editor.selectionStart, after.length), 'Code formatted');
    scheduleAutoRun({ delay: 180, reason: 'format' });
    scheduleStudioCoachUpdate(80);
  }

  function getStudioQuality() {
    if (editor && typeof setLanguageFileContent === 'function' && typeof getActiveLanguageFileName === 'function') {
      setLanguageFileContent(activeLanguage, getActiveLanguageFileName(activeLanguage), editor.value);
    }
    const items = typeof getErrorCheckerItems === 'function' ? getErrorCheckerItems() : [];
    const counts = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    const combined = [codeStore.html, codeStore.css, codeStore.js].join('\n');
    const lineCount = combined.split('\n').filter(line => line.trim()).length;
    const errorPenalty = (counts.error || 0) * 22;
    const warningPenalty = (counts.warning || 0) * 10;
    const tipPenalty = Math.min(8, (counts.tip || 0) * 2);
    const effortBonus = Math.min(12, Math.floor(lineCount / 8));
    const pageBonus = Math.min(6, Math.max(0, (getHTMLPageNames?.().length || 1) - 1) * 3);
    const score = Math.max(0, Math.min(100, 78 + effortBonus + pageBonus - errorPenalty - warningPenalty - tipPenalty));
    return { score, items, counts, lineCount };
  }

  function renderStudioCoach() {
    const quality = getStudioQuality();
    const scoreText = Number.isFinite(quality.score) ? String(quality.score) : '--';
    const qualityValue = document.getElementById('studioQualityValue');
    const qualityChip = document.getElementById('studioQualityChip');
    const linesChip = document.getElementById('studioLinesChip');
    const runChip = document.getElementById('studioRunChip');
    const progressFill = document.getElementById('studioProgressFill');
    const coachTitle = document.getElementById('studioCoachTitle');
    const coachMessage = document.getElementById('studioCoachMessage');
    const issuesBox = document.getElementById('studioCoachIssues');
    if (!qualityValue || !issuesBox) return;

    const blockers = quality.items.filter(item => item.type === 'error' || item.type === 'warning');
    const first = blockers[0];
    qualityValue.textContent = scoreText;
    if (qualityChip) qualityChip.textContent = `Code Health ${scoreText}%`;
    if (linesChip) linesChip.textContent = `${quality.lineCount} code line${quality.lineCount === 1 ? '' : 's'}`;
    if (runChip) runChip.textContent = studioLastRunAt ? `Last run ${studioLastRunAt}` : 'Not run yet';
    if (progressFill) progressFill.style.width = `${Math.max(5, quality.score)}%`;

    if (!blockers.length) {
      if (coachTitle) coachTitle.textContent = 'Looks ready for checking';
      if (coachMessage) coachMessage.textContent = 'This is only a quick code health check, not your grade. Click Result for the official rubric score.';
      issuesBox.innerHTML = '<div class="studio-issue-item pass"><strong>Code health looks good</strong><span>No major local issues found. The real score still comes from Result/Rubric.</span></div>'; 
      return;
    }

    if (coachTitle) coachTitle.textContent = first.type === 'error' ? 'Fix this first' : 'Almost there';
    if (coachMessage) coachMessage.textContent = first.fix || first.detail || 'Review the highlighted item before checking the result.';
    issuesBox.innerHTML = blockers.slice(0, 3).map(item => `
      <div class="studio-issue-item ${studioEscape(item.type)}">
        <strong>${studioEscape(item.title)}</strong>
        <span>${studioEscape(item.fix || item.detail || '')}</span>
      </div>
    `).join('');
  }

  function scheduleStudioCoachUpdate(delay = 220) {
    window.clearTimeout(studioCoachTimer);
    studioCoachTimer = window.setTimeout(renderStudioCoach, delay);
  }

  function toggleStudioCoach() {
    const coach = document.getElementById('superStudioPanel');
    if (!coach) return;
    const willOpen = coach.classList.contains('collapsed');
    coach.classList.toggle('collapsed', !willOpen);
    document.getElementById('studioToggleCoachBtn')?.setAttribute('aria-pressed', String(willOpen));
    studioSaveJSON(STUDIO_STORAGE.panelOpen, willOpen);
    setStatus(willOpen ? 'Coach shown' : 'Coach hidden');
  }

  function getStudioActions() {
    return [
      { label: 'Run preview', keywords: 'run preview output ctrl enter', hint: 'Ctrl+Enter', run: () => runCode(true) },
      { label: 'Format current tab', keywords: 'format beautify clean code', hint: 'Format', run: formatActiveCode },
      { label: 'Save snapshot', keywords: 'snapshot checkpoint backup save restore', hint: 'Rollback point', run: () => saveStudioSnapshot(true) },
      { label: 'Open snapshots', keywords: 'restore rollback checkpoints snapshots', hint: 'Restore', run: openStudioSnapshots },
      ...(isAutoRunControlAllowed() ? [{ label: 'Toggle Auto Run', keywords: 'auto run live preview toggle', hint: autoRunEnabled ? 'Currently on' : 'Currently off', run: toggleAutoRun }] : []),
      { label: 'Open Full Editor', keywords: 'full editor focus fullscreen zen', hint: 'Ctrl+Shift+F', run: () => fullEditorBtn?.click() },
      { label: 'Open Full Preview', keywords: 'fullscreen output preview result', hint: 'Preview', run: () => fullPreviewBtn?.click() },
      { label: 'Check Result', keywords: 'rubric score result feedback', hint: 'Rubric', run: () => showResult?.() },
      { label: 'Download ZIP', keywords: 'download zip export files', hint: 'Export', run: () => downloadZipBtn?.click() },
      { label: 'Switch to HTML', keywords: 'html tab', hint: 'Ctrl+1', run: () => switchLanguageByIndex?.(0) },
      { label: 'Switch to CSS', keywords: 'css tab style', hint: 'Ctrl+2', run: () => switchLanguageByIndex?.(1) },
      { label: 'Switch to JavaScript', keywords: 'js javascript tab', hint: 'Ctrl+3', run: () => switchLanguageByIndex?.(2) }
    ];
  }

  function getFilteredStudioActions() {
    const input = document.getElementById('studioCommandInput');
    const query = String(input?.value || '').trim().toLowerCase();
    const actions = getStudioActions();
    return query
      ? actions.filter(action => `${action.label} ${action.keywords || ''} ${action.hint || ''}`.toLowerCase().includes(query))
      : actions;
  }

  function renderStudioCommandList() {
    const list = document.getElementById('studioCommandList');
    if (!list) return;
    const actions = getFilteredStudioActions();
    studioCommandIndex = Math.max(0, Math.min(studioCommandIndex, actions.length - 1));
    if (!actions.length) {
      list.innerHTML = '<div class="studio-empty-box"><strong>No action found.</strong><p>Try run, format, snapshot, or result.</p></div>';
      return;
    }
    list.innerHTML = actions.map((action, index) => `
      <button class="studio-command-item ${index === studioCommandIndex ? 'active' : ''}" type="button" data-command-index="${index}">
        <span>${studioEscape(action.label)}</span>
        <small>${studioEscape(action.hint || '')}</small>
      </button>
    `).join('');
  }

  function runStudioCommand(index = studioCommandIndex) {
    const actions = getFilteredStudioActions();
    const action = actions[index];
    if (!action) return;
    closeStudioCommandPalette();
    window.setTimeout(() => action.run(), 20);
  }

  function openStudioCommandPalette() {
    ensureStudioModals();
    const overlay = document.getElementById('studioCommandOverlay');
    const input = document.getElementById('studioCommandInput');
    placeStudioOverlay(overlay);
    studioCommandIndex = 0;
    if (input) input.value = '';
    renderStudioCommandList();
    overlay?.classList.remove('hidden');
    window.setTimeout(() => input?.focus(), 20);
  }

  function closeStudioCommandPalette() {
    document.getElementById('studioCommandOverlay')?.classList.add('hidden');
  }

  function wireStudioEvents() {
    document.getElementById('superStudioLauncher')?.addEventListener('click', () => {
      if (!isSuperStudioEnabled()) return;
      setStudioDrawerOpen(!studioDrawerOpen);
    });
    window.addEventListener('resize', () => {
      placeStudioLauncher();
      placeAllStudioOverlays();
      setStudioDrawerOpen(studioDrawerOpen, { silent: true });
    });
    document.addEventListener('fullscreenchange', () => {
      placeStudioLauncher();
      placeAllStudioOverlays();
      setStudioDrawerOpen(studioDrawerOpen, { silent: true });
    });
    document.addEventListener('studentAssistanceSettingsChanged', () => {
      placeStudioLauncher();
      setStudioDrawerOpen(false, { silent: true });
    });
    document.getElementById('studioToggleCoachBtn')?.addEventListener('click', toggleStudioCoach);
    document.getElementById('studioFormatBtn')?.addEventListener('click', formatActiveCode);
    document.getElementById('studioSnapshotBtn')?.addEventListener('click', () => saveStudioSnapshot(true));
    document.getElementById('studioRestoreBtn')?.addEventListener('click', openStudioSnapshots);
    document.getElementById('studioCommandBtn')?.addEventListener('click', () => { if (isSuperStudioEnabled()) openStudioCommandPalette(); });

    // Full Editor already has Format and Snapshot inside the Super Studio drawer.
    // Keep the top full-editor bar focused on Run, Auto, Result, and Exit only
    // so buttons do not repeat when Studio is opened.
    document.getElementById('fullscreenFormatBtn')?.remove();
    document.getElementById('fullscreenSnapshotBtn')?.remove();

    document.getElementById('studioCloseCommandBtn')?.addEventListener('click', closeStudioCommandPalette);
    document.getElementById('studioCommandOverlay')?.addEventListener('click', event => {
      if (event.target.id === 'studioCommandOverlay') closeStudioCommandPalette();
      const item = event.target.closest('.studio-command-item');
      if (item) runStudioCommand(Number(item.dataset.commandIndex || 0));
    });
    document.getElementById('studioCommandInput')?.addEventListener('input', () => {
      studioCommandIndex = 0;
      renderStudioCommandList();
    });
    document.getElementById('studioCommandInput')?.addEventListener('keydown', event => {
      const actions = getFilteredStudioActions();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        studioCommandIndex = Math.min(actions.length - 1, studioCommandIndex + 1);
        renderStudioCommandList();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        studioCommandIndex = Math.max(0, studioCommandIndex - 1);
        renderStudioCommandList();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        runStudioCommand(studioCommandIndex);
      } else if (event.key === 'Escape') {
        closeStudioCommandPalette();
      }
    });

    document.getElementById('studioCloseSnapshotsBtn')?.addEventListener('click', closeStudioSnapshots);
    document.getElementById('studioSnapshotsOverlay')?.addEventListener('click', event => {
      if (event.target.id === 'studioSnapshotsOverlay') closeStudioSnapshots();
      const item = event.target.closest('[data-snapshot-id]');
      const action = event.target.closest('[data-snapshot-action]');
      if (!item || !action) return;
      const snapshotId = item.dataset.snapshotId || '';
      if (action.dataset.snapshotAction === 'restore') restoreStudioSnapshot(snapshotId);
      if (action.dataset.snapshotAction === 'delete') deleteStudioSnapshot(snapshotId);
    });

    editor.addEventListener('input', () => scheduleStudioCoachUpdate(260));
    tabButtons.forEach(button => button.addEventListener('click', () => scheduleStudioCoachUpdate(120)));
    previewFrame?.addEventListener('load', () => scheduleStudioCoachUpdate(180));

    document.addEventListener('keydown', event => {
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      if (isCtrlOrMeta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isSuperStudioEnabled()) {
          setStudioDrawerOpen(true, { silent: true });
          openStudioCommandPalette();
        }
      }
      if (event.key === 'Escape') {
        closeStudioCommandPalette();
        closeStudioSnapshots();
      }
    });
  }

  function wrapStudioRunCode() {
    if (window.__MCS_SUPER_STUDIO_RUN_WRAPPED__) return;
    window.__MCS_SUPER_STUDIO_RUN_WRAPPED__ = true;
    window.__MCS_SUPER_STUDIO_AFTER_RUN__ = () => {
      const now = new Date();
      studioLastRunAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      scheduleStudioCoachUpdate(220);
    };
  }

  ensureStudioToolbar();
  ensureStudioModals();
  wireStudioEvents();
  wrapStudioRunCode();
  renderStudioSnapshotsButtonState();
  setStudioDrawerOpen(false, { silent: true });
  placeStudioLauncher();
  syncFullscreenBottomToolDock();
  window.addEventListener('resize', () => {
    placeStudioLauncher();
    syncFullscreenBottomToolDock();
  });
  document.addEventListener('fullscreenchange', () => {
    placeAllStudioOverlays();
    placeStudioLauncher();
    syncFullscreenBottomToolDock();
  });
  new MutationObserver(() => {
    placeStudioLauncher();
    syncFullscreenBottomToolDock();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (isSuperStudioEnabled()) scheduleStudioCoachUpdate(120);
})();


