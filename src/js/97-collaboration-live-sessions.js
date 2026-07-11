/* STUDENT COLLABORATION: Admin-controlled Share / Join live project sessions. */
(function initStudentCollaborationFeature() {
  if (window.__MCS_COLLAB_FEATURE_READY__) return;
  window.__MCS_COLLAB_FEATURE_READY__ = true;
  if (!editor || !editorPanel) return;

  const COLLAB_PUSH_DELAY = 60;
  const COLLAB_HEARTBEAT_MS = 12000;
  const collabState = {
    active: false,
    role: '',
    code: '',
    sessionRef: null,
    unsubscribe: null,
    heartbeatTimer: null,
    pushTimer: null,
    applyingRemote: false,
    canEdit: false,
    lastContentVersion: 0,
    lastLocalVersion: 0,
    lastPushedSignature: '',
    pushInFlight: false,
    queuedPush: false,
    latestSession: null,
    lastIndicatorText: '',
    localBeforeJoin: null,
    joinSource: '',
    returnToDashboardAfterLeave: false,
    cursorTimer: null,
    lastCursorPosition: -1,
    memberColorCache: {}
  };

  function isCollaborationEnabled() {
    return typeof isStudentAssistanceFeatureEnabled === 'function'
      ? isStudentAssistanceFeatureEnabled('collaboration')
      : false;
  }

  function isCollaborationEditAllowed() {
    return isCollaborationEnabled() && (typeof isStudentAssistanceFeatureEnabled !== 'function' || isStudentAssistanceFeatureEnabled('collaborationEdit'));
  }

  function isCollaborationMembersVisible() {
    return isCollaborationEnabled() && (typeof isStudentAssistanceFeatureEnabled !== 'function' || isStudentAssistanceFeatureEnabled('collaborationMembers'));
  }

  function getCollabStudent() {
    return appSession?.mode === 'student' && appSession.student ? appSession.student : null;
  }

  function getCollabName() {
    const student = getCollabStudent();
    return student?.name || student?.studentId || 'Student';
  }

  function getCollabUid() {
    return getCollabStudent()?.uid || firebaseSync.currentUser?.uid || '';
  }
  function collabEscape(value) {
    return typeof escapeHTML === 'function'
      ? escapeHTML(value)
      : String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function getCollabMemberColor(uid = getCollabUid(), fallback = '') {
    if (fallback) return fallback;
    const key = String(uid || getCollabName() || 'student');
    if (collabState.memberColorCache[key]) return collabState.memberColorCache[key];
    const palette = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be123c', '#4f46e5', '#65a30d', '#c026d3'];
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    const color = palette[Math.abs(hash) % palette.length];
    collabState.memberColorCache[key] = color;
    return color;
  }

  function getCollabCursorLayer() {
    let layer = document.getElementById('collabCursorLayer');
    if (layer) return layer;
    const stack = document.querySelector('.editor-stack') || editor?.parentElement;
    if (!stack) return null;
    layer = document.createElement('div');
    layer.id = 'collabCursorLayer';
    layer.className = 'collab-cursor-layer';
    layer.setAttribute('aria-hidden', 'true');
    stack.appendChild(layer);
    return layer;
  }

  function getCaretCoordinatesForCollab(textarea, position) {
    if (!textarea) return null;
    const style = window.getComputedStyle(textarea);
    const mirror = document.createElement('div');
    const props = [
      'boxSizing','width','height','fontFamily','fontSize','fontWeight','fontStyle','letterSpacing','textTransform',
      'wordSpacing','lineHeight','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth',
      'borderBottomWidth','borderLeftWidth','whiteSpace','wordBreak','overflowWrap','tabSize'
    ];
    props.forEach(prop => { mirror.style[prop] = style[prop]; });
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.pointerEvents = 'none';
    mirror.style.left = '-9999px';
    mirror.style.top = '0';
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.height = 'auto';
    mirror.style.minHeight = '0';
    mirror.style.overflow = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.overflowWrap = 'break-word';
    const before = textarea.value.slice(0, Math.max(0, position));
    mirror.textContent = before;
    const marker = document.createElement('span');
    marker.textContent = textarea.value.slice(position, position + 1) || '.';
    mirror.appendChild(marker);
    document.body.appendChild(mirror);
    const markerRect = marker.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.35 || 18;
    const coords = {
      left: markerRect.left - mirrorRect.left - textarea.scrollLeft,
      top: markerRect.top - mirrorRect.top - textarea.scrollTop,
      height: lineHeight
    };
    mirror.remove();
    return coords;
  }

  function renderCollabCursors(data = collabState.latestSession) {
    const layer = getCollabCursorLayer();
    if (!layer) return;
    const cursors = data?.cursors && typeof data.cursors === 'object' ? Object.values(data.cursors) : [];
    const members = data?.members || {};
    const now = Date.now();
    const ownUid = getCollabUid();
    const visible = collabState.active && isCollaborationEnabled();
    if (!visible) {
      layer.innerHTML = '';
      layer.classList.add('hidden');
      return;
    }
    const remote = cursors.filter(cursor => cursor && cursor.uid && cursor.uid !== ownUid && cursor.language === activeLanguage && Number(cursor.updatedAt || 0) > now - 12000);
    layer.classList.toggle('hidden', remote.length === 0);
    layer.innerHTML = remote.map(cursor => {
      const member = members[cursor.uid] || {};
      const coords = getCaretCoordinatesForCollab(editor, Number(cursor.position || 0));
      if (!coords) return '';
      const color = getCollabMemberColor(cursor.uid, cursor.color || member.color || '');
      const name = collabEscape(cursor.name || member.name || 'Classmate');
      const left = Math.max(0, coords.left);
      const top = Math.max(0, coords.top);
      const height = Math.max(16, coords.height || 18);
      return `<div class="collab-remote-cursor" style="left:${left}px;top:${top}px;height:${height}px;--cursor-color:${color}"><span>${name}</span></div>`;
    }).join('');
  }

  function scheduleCollabCursorPush() {
    if (!collabState.active || !collabState.sessionRef || collabState.applyingRemote || !getCollabUid()) return;
    window.clearTimeout(collabState.cursorTimer);
    collabState.cursorTimer = window.setTimeout(pushCollabCursor, 90);
  }

  async function pushCollabCursor() {
    if (!collabState.active || !collabState.sessionRef || !getCollabUid()) return;
    const position = Number(editor?.selectionStart || 0);
    const uid = getCollabUid();
    try {
      const { setDoc, serverTimestamp } = firebaseSync.modules;
      await setDoc(collabState.sessionRef, {
        cursors: {
          [uid]: {
            uid,
            name: getCollabName(),
            color: getCollabMemberColor(uid),
            language: activeLanguage,
            position,
            updatedAt: Date.now()
          }
        },
        members: { [uid]: { ...buildCollabMember(collabState.role || 'member'), color: getCollabMemberColor(uid) } },
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.warn('Could not update live cursor.', error);
    }
  }


  function generateShareCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  }

  function getSharedSessionDocRef(code) {
    const { doc } = firebaseSync.modules;
    return doc(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId, 'sharedSessions', String(code || '').trim().toUpperCase());
  }

  function getCollabContentPayload() {
    saveActiveEditor();
    return {
      codeByActivity: Object.fromEntries(Object.entries(codeByActivity).map(([key, value]) => [key, normalizeCodeStore(value)])),
      selectedActivityId: selectedActivityId || '',
      fileNames: normalizeCodeFileNames(codeFileNames)
    };
  }

  function getCollabPayloadSignature(payload) {
    try {
      return JSON.stringify({
        codeByActivity: payload?.codeByActivity || {},
        selectedActivityId: payload?.selectedActivityId || '',
        fileNames: payload?.fileNames || {},
        activeLanguage,
        activeFile: getActiveLanguageFileName(activeLanguage),
        editorValue: editor?.value || ''
      });
    } catch {
      return `${Date.now()}:${editor?.value?.length || 0}`;
    }
  }

  function markCollabRemoteVersion(version = 0) {
    collabState.lastContentVersion = Number(version || 0);
    collabState.lastPushedSignature = '';
  }

  function captureCollabLocalSnapshot() {
    const payload = getCollabContentPayload();
    return {
      ...payload,
      activeLanguage,
      htmlPageName: typeof getActiveHtmlPageName === 'function' ? getActiveHtmlPageName() : '',
      projectId: appSession.currentProjectId || '',
      projectName: appSession.currentProject?.name || '',
      lastResult: lastRubricResult || appSession.currentProject?.lastResult || null,
      studentProjectDirty: Boolean(studentProjectDirty),
      capturedAt: Date.now()
    };
  }

  function restoreCollabLocalSnapshot(snapshot) {
    if (!snapshot || !snapshot.codeByActivity) return;
    collabState.applyingRemote = true;
    try {
      const ownProjectId = snapshot.projectId || appSession.currentProjectId || '';
      if (ownProjectId) {
        appSession.currentProjectId = ownProjectId;
        const cachedProject = appSession.projects?.find?.(project => project.id === ownProjectId);
        appSession.currentProject = cachedProject || appSession.currentProject || { id: ownProjectId, name: snapshot.projectName || 'My Project' };
        if (snapshot.projectName && appSession.currentProject) appSession.currentProject.name = snapshot.projectName;
      }
      codeByActivity = normalizeProjectCodeByActivity(snapshot.codeByActivity);
      selectedActivityId = activities.some(item => item.id === snapshot.selectedActivityId) ? snapshot.selectedActivityId : '';
      activity = selectedActivityId ? getActivityById(selectedActivityId) : null;
      const codeKey = selectedActivityId || 'scratch';
      codeStore = codeByActivity[codeKey] ? normalizeCodeStore(codeByActivity[codeKey]) : normalizeCodeStore(starterCode);
      codeByActivity[codeKey] = normalizeCodeStore(codeStore);
      codeFileNames = normalizeCodeFileNames(snapshot.fileNames || DEFAULT_CODE_FILE_NAMES);
      if (snapshot.activeLanguage && ['html', 'css', 'js'].includes(snapshot.activeLanguage)) activeLanguage = snapshot.activeLanguage;
      lastRubricResult = snapshot.lastResult || null;
      saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
      saveCodeByActivity();
      saveCodeFileNames();
      renderActivitySummary();
      renderActivitySelector();
      renderHTMLPageManager?.();
      loadActiveEditor();
      if (lastRubricResult && activity) renderResult(lastRubricResult);
      else resetResultPanel();
      runCode(false, { scroll: false, source: 'collab-restore-own-project' });
      if (typeof updateAppHeaderForSession === 'function') updateAppHeaderForSession();
      studentProjectDirty = Boolean(snapshot.studentProjectDirty);
      if (typeof setStudentSaveState === 'function') {
        setStudentSaveState(appSession.currentProjectId ? (studentProjectDirty ? 'Unsaved' : 'Saved') : 'Choose a project', studentProjectDirty ? 'unsaved' : '');
      }
    } finally {
      window.setTimeout(() => { collabState.applyingRemote = false; }, 80);
    }
  }

  function isCollabInFullEditor() {
    return Boolean(editorPanel && (
      document.fullscreenElement === editorPanel ||
      document.webkitFullscreenElement === editorPanel ||
      document.body.classList.contains('editor-fullscreen-active')
    ));
  }

  function getCollabOverlayHost() {
    return isCollabInFullEditor() ? editorPanel : document.body;
  }

  function placeCollabOverlay(overlay) {
    if (!overlay) return;
    const host = getCollabOverlayHost();
    if (host && overlay.parentElement !== host) host.appendChild(overlay);
    overlay.classList.toggle('inside-editor-fullscreen', host === editorPanel);
  }

  function placeAllCollabOverlays() {
    placeCollabOverlay(document.getElementById('collabOverlay'));
    placeCollabOverlay(document.getElementById('collabMembersOverlay'));
  }

  function ensureCollabOverlay() {
    let overlay = document.getElementById('collabOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'collabOverlay';
    overlay.className = 'collab-overlay hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'collabTitle');
    overlay.innerHTML = `
      <div class="collab-card">
        <button id="collabCloseBtn" class="icon-btn collab-close-btn" type="button" aria-label="Close Share Project">×</button>
        <div class="collab-card-head">
          <span class="collab-icon">🤝</span>
          <div>
            <p class="section-kicker">Live Group Project</p>
            <h2 id="collabTitle">Share or Join</h2>
            <p class="muted-text">Use a short code so students can view or edit one project together.</p>
          </div>
        </div>
        <div class="collab-tabs" role="tablist" aria-label="Share or join project">
          <button id="collabShareTab" class="collab-tab active" type="button" role="tab" aria-selected="true" aria-controls="collabSharePanel" tabindex="0">Share</button>
          <button id="collabJoinTab" class="collab-tab" type="button" role="tab" aria-selected="false" aria-controls="collabJoinPanel" tabindex="-1">Join</button>
        </div>
        <section id="collabSharePanel" class="collab-panel active" role="tabpanel" aria-labelledby="collabShareTab">
          <div class="collab-info-box">
            <strong>You are the host.</strong>
            <span>Start a live session, then give the code to classmates.</span>
          </div>
          <label>
            Access
            <select id="collabAccessSelect">
              <option value="edit">Can edit together</option>
              <option value="view">View only</option>
            </select>
          </label>
          <div class="collab-code-box">
            <span>Share code</span>
            <strong id="collabShareCode">------</strong>
          </div>
          <div class="collab-actions">
            <button id="collabStartBtn" class="primary-btn" type="button">Start Live Session</button>
            <button id="collabCopyBtn" class="ghost-btn" type="button">Copy Code</button>
            <button id="collabLeaveBtn" class="ghost-btn warning hidden" type="button">Leave Live Project</button>
            <button id="collabStopBtn" class="ghost-btn danger hidden" type="button">Stop Sharing</button>
          </div>
        </section>
        <section id="collabJoinPanel" class="collab-panel" role="tabpanel" aria-labelledby="collabJoinTab" hidden>
          <div class="collab-info-box">
            <strong>Join a classmate's project.</strong>
            <span>Enter the code from the host. Editing depends on teacher/host permission.</span>
          </div>
          <label>
            Project Code
            <input id="collabJoinCodeInput" type="text" inputmode="text" autocomplete="off" placeholder="Example: A8K2Q9" maxlength="12" />
          </label>
          <button id="collabJoinBtn" class="primary-btn wide-btn" type="button">Join Project</button>
        </section>
        <p id="collabStatus" class="helper-note collab-status" role="status"></p>
      </div>
    `;
    document.body.appendChild(overlay);
    placeCollabOverlay(overlay);
    overlay.querySelector('#collabCloseBtn')?.addEventListener('click', closeCollabOverlay);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeCollabOverlay(); });
    overlay.querySelector('#collabShareTab')?.addEventListener('click', () => setCollabTab('share'));
    overlay.querySelector('#collabJoinTab')?.addEventListener('click', () => setCollabTab('join'));
    overlay.querySelector('.collab-tabs')?.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const targetTab = event.key === 'ArrowLeft' || event.key === 'Home' ? 'share' : 'join';
      setCollabTab(targetTab);
      overlay.querySelector(targetTab === 'share' ? '#collabShareTab' : '#collabJoinTab')?.focus();
    });
    overlay.querySelector('#collabStartBtn')?.addEventListener('click', startCollaborationHostSession);
    overlay.querySelector('#collabCopyBtn')?.addEventListener('click', copyCollabCode);
    overlay.querySelector('#collabLeaveBtn')?.addEventListener('click', leaveCurrentCollaborationFromButton);
    overlay.querySelector('#collabStopBtn')?.addEventListener('click', stopCollaborationSession);
    overlay.querySelector('#collabJoinBtn')?.addEventListener('click', joinCollaborationFromOverlay);
    overlay.querySelector('#collabJoinCodeInput')?.addEventListener('keydown', event => {
      if (event.key === 'Enter') joinCollaborationFromOverlay();
    });
    placeCollabOverlay(overlay);
    return overlay;
  }

  function ensureCollabDock() {
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

  function ensureMobileCollabToolsBar() {
    let bar = document.getElementById('mobileCollabTools');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'mobileCollabTools';
    bar.className = 'mobile-collab-tools hidden';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Mobile live project tools');
    const pageManager = document.getElementById('htmlPageManager');
    if (pageManager?.parentElement) {
      pageManager.insertAdjacentElement('afterend', bar);
    } else {
      editorPanel.appendChild(bar);
    }
    return bar;
  }

  function syncMobileCollabToolsBar() {
    const bar = document.getElementById('mobileCollabTools');
    if (!bar) return;
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const hasVisibleTool = Boolean(bar.querySelector('.collab-share-btn:not(.hidden), .collab-members-pill:not(.hidden)'));
    bar.classList.toggle('hidden', !mobile || !hasVisibleTool || !isCollaborationEnabled());
  }

  function ensureCollabControls() {
    let button = document.getElementById('collabShareBtn');
    if (!button) {
      button = document.createElement('button');
      button.id = 'collabShareBtn';
      button.type = 'button';
      button.className = 'ghost-btn collab-share-btn hidden';
      button.title = 'Share or join this project';
      button.addEventListener('click', openCollabOverlay);
    }

    let indicator = document.getElementById('collabLiveIndicator');
    if (!indicator) {
      indicator = document.createElement('button');
      indicator.id = 'collabLiveIndicator';
      indicator.type = 'button';
      indicator.className = 'collab-live-indicator hidden';
      indicator.setAttribute('aria-label', 'Open live project members');
      indicator.addEventListener('click', showCollabMembersList);
    }

    let pill = document.getElementById('collabMembersPill');
    if (!pill) {
      pill = document.createElement('button');
      pill.id = 'collabMembersPill';
      pill.type = 'button';
      pill.className = 'collab-members-pill hidden';
      pill.textContent = '👥 0 online';
      pill.addEventListener('click', showCollabMembersList);
    }

    const dashboardJoinButton = document.getElementById('dashboardJoinProjectBtn');
    if (dashboardJoinButton && !dashboardJoinButton.dataset.collabBound) {
      dashboardJoinButton.dataset.collabBound = 'true';
      dashboardJoinButton.addEventListener('click', () => openCollabOverlay({ tab: 'join', source: 'dashboard' }));
    }

    renderCollabShareButton();

    const languageTabs = editorPanel.querySelector('.language-tabs');
    const renameFilesButton = document.getElementById('renameFilesBtn');
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const inFullEditor = document.body.classList.contains('editor-fullscreen-active') || document.fullscreenElement === editorPanel;

    if (mobile) {
      const mobileBar = ensureMobileCollabToolsBar();
      if (button.parentElement !== mobileBar) mobileBar.appendChild(button);
      if (pill.parentElement !== mobileBar) mobileBar.appendChild(pill);
    } else if (inFullEditor) {
      const dock = ensureCollabDock();
      const studio = document.getElementById('superStudioLauncher');
      const helper = document.getElementById('codeHelperFloatingBtn');
      dock.classList.remove('hidden');
      if (studio?.parentElement === dock) {
        studio.insertAdjacentElement('afterend', button);
      } else if (helper?.parentElement === dock) {
        dock.insertBefore(button, helper);
      } else if (button.parentElement !== dock) {
        dock.appendChild(button);
      }
      if (languageTabs && pill.parentElement !== languageTabs) languageTabs.appendChild(pill);
    } else if (renameFilesButton?.parentElement === languageTabs) {
      if (button.parentElement !== languageTabs) renameFilesButton.insertAdjacentElement('afterend', button);
      if (languageTabs && pill.parentElement !== languageTabs) languageTabs.appendChild(pill);
    } else if (languageTabs) {
      if (button.parentElement !== languageTabs) languageTabs.appendChild(button);
      if (pill.parentElement !== languageTabs) languageTabs.appendChild(pill);
    }

    if (languageTabs || mobile) {
      // Keep only one compact online-project pill. On phones it lives in a
      // dedicated mobile bar below Tabs/Pages so it cannot cover the dropdown.
      if (indicator.parentElement !== editorPanel) editorPanel.appendChild(indicator);
      indicator.classList.add('hidden');
      indicator.classList.remove('inside-editor-fullscreen');
      pill.classList.remove('inside-editor-fullscreen');
    }
    renderCollabLiveIndicator(collabState.latestSession);
    syncMobileCollabToolsBar();
  }

  function getCollabProjectName(data = collabState.latestSession) {
    return data?.projectName || appSession.currentProject?.name || 'Shared Project';
  }

  function getCollabHostName(data = collabState.latestSession) {
    return data?.hostName || 'Host';
  }

  function renderCollabShareButton() {
    const button = document.getElementById('collabShareBtn');
    if (!button) return;
    const count = getOnlineMembers(collabState.latestSession).length || (collabState.active ? 1 : 0);
    button.classList.toggle('is-hosting', collabState.active && collabState.role === 'host');
    button.classList.toggle('is-joined', collabState.active && collabState.role !== 'host');
    if (collabState.active && collabState.role === 'host') {
      button.innerHTML = `<span>🟢</span><strong>Hosting Live</strong><em>👥 ${count}</em>`;
      button.title = `You are hosting ${getCollabProjectName()} · Code ${collabState.code}. Click to manage sharing.`;
    } else if (collabState.active) {
      button.innerHTML = `<span>🟣</span><strong>Joined Live</strong><em>👥 ${count}</em>`;
      button.title = `Joined ${getCollabProjectName()} by ${getCollabHostName()}. Click to view/leave.`;
    } else {
      button.innerHTML = '<span>🤝</span><strong>Share/Join This Project</strong>';
      button.title = 'Share or join this project';
    }
  }

  function renderCollabLiveIndicator(data = collabState.latestSession) {
    const indicator = document.getElementById('collabLiveIndicator');
    if (!indicator) return;
    // The separate live status card was removed because it duplicated the online pill
    // and consumed too much editor space. Status now lives in the Share/Join button
    // plus the compact online-project pill.
    indicator.classList.add('hidden');
    indicator.classList.remove('is-hosting', 'is-joined', 'inside-editor-fullscreen');
    indicator.textContent = '';
    renderCollabShareButton();
  }

  function setCollabStatus(message = '', type = '') {
    const status = document.getElementById('collabStatus');
    if (!status) return;
    status.textContent = message;
    status.className = `helper-note collab-status ${type || ''}`.trim();
  }

  function setCollabTab(tab = 'share') {
    const overlay = ensureCollabOverlay();
    const share = tab !== 'join';
    const shareTab = overlay.querySelector('#collabShareTab');
    const joinTab = overlay.querySelector('#collabJoinTab');
    const sharePanel = overlay.querySelector('#collabSharePanel');
    const joinPanel = overlay.querySelector('#collabJoinPanel');

    shareTab?.classList.toggle('active', share);
    joinTab?.classList.toggle('active', !share);
    shareTab?.setAttribute('aria-selected', String(share));
    joinTab?.setAttribute('aria-selected', String(!share));
    shareTab?.setAttribute('tabindex', share ? '0' : '-1');
    joinTab?.setAttribute('tabindex', share ? '-1' : '0');

    sharePanel?.classList.toggle('active', share);
    joinPanel?.classList.toggle('active', !share);
    if (sharePanel) sharePanel.hidden = !share;
    if (joinPanel) joinPanel.hidden = share;
  }

  function openCollabOverlay(options = {}) {
    if (!isCollaborationEnabled()) {
      setStatus('Project sharing is disabled by the teacher');
      return;
    }
    if (!getCollabStudent()) {
      openStudentLogin?.();
      setStatus('Log in as student to use Share or Join');
      return;
    }
    const overlay = ensureCollabOverlay();
    placeCollabOverlay(overlay);
    const dashboardJoinMode = options.source === 'dashboard' && !collabState.active;
    overlay.classList.toggle('collab-dashboard-join-mode', dashboardJoinMode);
    overlay.dataset.collabSource = dashboardJoinMode ? 'dashboard' : '';
    overlay.classList.remove('hidden');
    document.body.classList.add('collab-overlay-open');
    if (collabState.active) {
      document.getElementById('collabShareCode').textContent = collabState.code || '------';
      document.getElementById('collabStopBtn')?.classList.toggle('hidden', collabState.role !== 'host');
      document.getElementById('collabLeaveBtn')?.classList.toggle('hidden', collabState.role === 'host');
      document.getElementById('collabStartBtn')?.classList.toggle('hidden', true);
      document.getElementById('collabCopyBtn')?.classList.toggle('hidden', false);
      setCollabTab(options.tab === 'join' && collabState.role !== 'host' ? 'join' : 'share');
      setCollabStatus(collabState.role === 'host'
        ? `You are hosting ${getCollabProjectName()} with code ${collabState.code}.`
        : `You joined ${getCollabProjectName()} by ${getCollabHostName()}.`, 'success');
    } else {
      document.getElementById('collabShareCode').textContent = '------';
      document.getElementById('collabStopBtn')?.classList.add('hidden');
      document.getElementById('collabLeaveBtn')?.classList.add('hidden');
      document.getElementById('collabStartBtn')?.classList.remove('hidden');
      document.getElementById('collabCopyBtn')?.classList.add('hidden');
      setCollabTab(options.tab === 'join' || dashboardJoinMode ? 'join' : 'share');
      setCollabStatus(dashboardJoinMode
        ? 'Enter a live project code to join. To host/share, open one of your projects first.'
        : 'Ready to share or join.', dashboardJoinMode ? 'warning' : '');
      const input = document.getElementById('collabJoinCodeInput');
      if (dashboardJoinMode && input) window.setTimeout(() => input.focus({ preventScroll: true }), 80);
    }
  }

  function closeCollabOverlay() {
    document.getElementById('collabOverlay')?.classList.add('hidden');
    document.body.classList.remove('collab-overlay-open');
  }

  function resetCollabOverlayToInactive(message = '') {
    const overlay = document.getElementById('collabOverlay');
    if (!overlay) return;
    const codeBox = overlay.querySelector('#collabShareCode');
    if (codeBox) codeBox.textContent = '------';
    overlay.querySelector('#collabStopBtn')?.classList.add('hidden');
    overlay.querySelector('#collabLeaveBtn')?.classList.add('hidden');
    overlay.querySelector('#collabStartBtn')?.classList.remove('hidden');
    overlay.querySelector('#collabCopyBtn')?.classList.add('hidden');
    overlay.classList.remove('collab-dashboard-join-mode');
    setCollabTab('share');
    if (message) setCollabStatus(message, 'success');
  }

  function enterCollabWorkspaceFromDashboard(data = {}) {
    // Joining from My Projects must actually move the student into the editor workspace.
    // The live project is not the student's saved project, so we do not create/change
    // currentProjectId here; we only close the dashboard and show the live editor view.
    collabState.joinSource = 'dashboard';
    collabState.returnToDashboardAfterLeave = true;
    try { sessionStorage.setItem('studentCodeStudio.collab.joinSource', 'dashboard'); } catch {}
    closeStudentDashboard?.();
    hideEntryGate?.();
    studentLoginOverlay?.classList.add('hidden');
    projectNameOverlay?.classList.add('hidden');
    changePasswordOverlay?.classList.add('hidden');
    document.body.classList.remove('student-dashboard-active', 'student-auth-open', 'entry-gate-active', 'student-route-lock');
    updateAppHeaderForSession?.();
    const projectName = data?.projectName || getCollabProjectName(data);
    const hostName = data?.hostName || getCollabHostName(data);
    if (typeof setStudentSaveState === 'function') setStudentSaveState(`Live: ${projectName}`, 'saved');
    setStatus(`Joined live project: ${projectName} by ${hostName}`);
    window.setTimeout(() => {
      try { editor?.focus({ preventScroll: true }); } catch {}
      try { runCode(false, { scroll: false, source: 'collab-dashboard-join' }); } catch {}
    }, 80);
  }

  function shouldReturnToDashboardAfterCollab(options = {}) {
    if (options.returnToDashboard === true) return true;
    if (collabState.returnToDashboardAfterLeave || collabState.joinSource === 'dashboard') return true;
    try {
      return sessionStorage.getItem('studentCodeStudio.collab.joinSource') === 'dashboard';
    } catch {
      return false;
    }
  }

  function returnToDashboardAfterCollab(message = '') {
    closeCollabOverlay?.();
    closeCollabMembersOverlay?.();
    renderCollabMembers(null);
    renderCollabLiveIndicator(null);
    renderCollabCursors(null);
    editor.readOnly = false;
    document.body.classList.remove('collab-active', 'collab-view-only');
    collabState.localBeforeJoin = null;
    collabState.joinSource = '';
    collabState.returnToDashboardAfterLeave = false;
    try {
      sessionStorage.removeItem('studentCodeStudio.collab.localBeforeJoin');
      sessionStorage.removeItem('studentCodeStudio.collab.joinSource');
    } catch {}
    if (typeof setStudentSaveState === 'function') setStudentSaveState('Choose a project', '');
    window.setTimeout(() => {
      showStudentDashboard?.();
      if (message) setStatus(message);
    }, 60);
  }

  async function startCollaborationHostSession() {
    if (!isCollaborationEnabled()) return;
    const student = getCollabStudent();
    if (!student || !appSession.currentProjectId) {
      setCollabStatus('Open or create a saved student project first before sharing.', 'error');
      return;
    }
    const ready = await initFirebaseSync();
    if (!ready) {
      setCollabStatus(`Firebase is not ready. ${firebaseSync.lastError || 'Check connection.'}`, 'error');
      return;
    }
    try {
      setCollabStatus('Starting live session...', 'warning');
      await saveStudentProjectManually?.();
      const code = generateShareCode();
      const access = document.getElementById('collabAccessSelect')?.value === 'view' ? 'view' : 'edit';
      const allowEdit = access === 'edit' && isCollaborationEditAllowed();
      const sessionRef = getSharedSessionDocRef(code);
      const { setDoc, serverTimestamp } = firebaseSync.modules;
      const payload = getCollabContentPayload();
      const uid = getCollabUid();
      await setDoc(sessionRef, {
        shareCode: code,
        active: true,
        hostUid: uid,
        hostName: student.name || student.studentId || 'Host',
        hostStudentId: student.studentId || '',
        projectId: appSession.currentProjectId,
        projectName: appSession.currentProject?.name || 'Shared Project',
        access,
        allowEdit,
        ...payload,
        lastEditorUid: uid,
        lastEditorName: student.name || student.studentId || 'Host',
        contentVersion: Date.now(),
        members: { [uid]: buildCollabMember('host') },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      document.getElementById('collabShareCode').textContent = code;
      document.getElementById('collabStopBtn')?.classList.remove('hidden');
      document.getElementById('collabLeaveBtn')?.classList.add('hidden');
      document.getElementById('collabStartBtn')?.classList.add('hidden');
      document.getElementById('collabCopyBtn')?.classList.remove('hidden');
      await joinCollaborationSession(code, { role: 'host', silent: true, keepOverlayOpen: true, noRestore: true });
      setCollabTab('share');
      document.getElementById('collabShareCode').textContent = code;
      document.getElementById('collabStopBtn')?.classList.remove('hidden');
      document.getElementById('collabStartBtn')?.classList.add('hidden');
      document.getElementById('collabCopyBtn')?.classList.remove('hidden');
      setCollabStatus(`Live code ready: ${code}. Copy this code and give it to classmates.`, 'success');
      setStatus(`Share code: ${code}`);
    } catch (error) {
      console.error('Could not start collaboration.', error);
      setCollabStatus(error?.message || 'Could not start live session.', 'error');
    }
  }

  function buildCollabMember(role = 'member') {
    const student = getCollabStudent() || {};
    return {
      uid: getCollabUid(),
      role,
      name: student.name || student.studentId || 'Student',
      studentId: student.studentId || '',
      color: getCollabMemberColor(getCollabUid()),
      online: true,
      lastSeenAt: Date.now()
    };
  }

  async function joinCollaborationFromOverlay() {
    const input = document.getElementById('collabJoinCodeInput');
    const code = String(input?.value || '').trim().toUpperCase();
    if (!code) {
      setCollabStatus('Type the share code first.', 'error');
      return;
    }
    const overlay = document.getElementById('collabOverlay');
    const fromDashboard = overlay?.dataset?.collabSource === 'dashboard' || overlay?.classList.contains('collab-dashboard-join-mode');
    await joinCollaborationSession(code, { role: 'member', source: fromDashboard ? 'dashboard' : '' });
  }

  async function joinCollaborationSession(code, options = {}) {
    if (!isCollaborationEnabled()) {
      setCollabStatus('Project sharing is disabled by the teacher.', 'error');
      return false;
    }
    const student = getCollabStudent();
    if (!student) {
      setCollabStatus('Log in as student first.', 'error');
      openStudentLogin?.();
      return false;
    }
    const ready = await initFirebaseSync();
    if (!ready) {
      setCollabStatus(`Firebase is not ready. ${firebaseSync.lastError || 'Check connection.'}`, 'error');
      return false;
    }
    try {
      const normalizedCode = String(code || '').trim().toUpperCase();
      const sessionRef = getSharedSessionDocRef(normalizedCode);
      const { getDoc, setDoc, serverTimestamp } = firebaseSync.modules;
      const snap = await getDoc(sessionRef);
      if (!snapshotExists(snap)) throw new Error('Share code not found.');
      const data = snapshotData(snap);
      if (data.active === false) throw new Error('This share code is already stopped.');
      const uid = getCollabUid();
      const role = options.role === 'host' || data.hostUid === uid ? 'host' : 'member';
      if (role !== 'host' && !options.noRestore) {
        const fromDashboard = options.source === 'dashboard';
        collabState.joinSource = fromDashboard ? 'dashboard' : 'editor';
        collabState.returnToDashboardAfterLeave = fromDashboard;
        try { sessionStorage.setItem('studentCodeStudio.collab.joinSource', collabState.joinSource); } catch {}
        collabState.localBeforeJoin = fromDashboard ? null : captureCollabLocalSnapshot();
        try {
          if (collabState.localBeforeJoin) sessionStorage.setItem('studentCodeStudio.collab.localBeforeJoin', JSON.stringify(collabState.localBeforeJoin));
          else sessionStorage.removeItem('studentCodeStudio.collab.localBeforeJoin');
        } catch {}
      }
      await setDoc(sessionRef, {
        members: { [uid]: buildCollabMember(role) },
        updatedAt: serverTimestamp()
      }, { merge: true });
      startCollaborationListener(normalizedCode, sessionRef, role, data);
      if (data.codeByActivity) applyCollaborationContent(data, { force: true });
      if (options.source === 'dashboard' && role !== 'host') enterCollabWorkspaceFromDashboard(data);
      if (!options.silent) setCollabStatus(`Joined ${data.projectName || 'shared project'} by ${data.hostName || 'host'}.`, 'success');
      setStatus(role === 'host' ? `Hosting live project: ${normalizedCode}` : `Joined ${data.projectName || 'live project'} by ${data.hostName || 'host'}`);
      if (!options.keepOverlayOpen) closeCollabOverlay();
      return true;
    } catch (error) {
      console.error('Could not join collaboration.', error);
      setCollabStatus(error?.message || 'Could not join project.', 'error');
      return false;
    }
  }

  function startCollaborationListener(code, sessionRef, role, initialData = {}) {
    // When a student joins, localBeforeJoin was captured just before this call.
    // Do not clear it during the silent cleanup below; it is needed to restore
    // the student's own project immediately after Leave / Kick / Stop Sharing.
    leaveCollaborationSession({ silent: true, keepDocActive: true, noRestore: true, keepLocalSnapshot: true });
    collabState.active = true;
    collabState.role = role;
    collabState.code = code;
    collabState.sessionRef = sessionRef;
    collabState.canEdit = role === 'host' || (initialData.allowEdit !== false && isCollaborationEditAllowed());
    collabState.lastContentVersion = Number(initialData.contentVersion || 0);
    editor.readOnly = !collabState.canEdit;
    document.body.classList.toggle('collab-active', true);
    document.body.classList.toggle('collab-view-only', !collabState.canEdit);
    ensureCollabControls();
    const { onSnapshot } = firebaseSync.modules;
    collabState.unsubscribe = onSnapshot(sessionRef, snapshot => {
      if (!snapshotExists(snapshot)) {
        leaveCollaborationSession({ silent: false, message: 'Live session ended.' });
        return;
      }
      const data = snapshotData(snapshot);
      collabState.latestSession = data;
      const ownMember = data.members?.[getCollabUid()];
      if (collabState.role !== 'host' && ownMember?.kicked === true) {
        leaveCollaborationSession({ silent: false, message: 'You were removed from the live project by the host.' });
        closeCollabOverlay();
        return;
      }
      if (data.active === false) {
        leaveCollaborationSession({ silent: false, message: 'Host stopped sharing.' });
        return;
      }
      collabState.canEdit = collabState.role === 'host' || (data.allowEdit !== false && isCollaborationEditAllowed());
      editor.readOnly = !collabState.canEdit;
      document.body.classList.toggle('collab-view-only', !collabState.canEdit);
      renderCollabMembers(data);
      renderCollabLiveIndicator(data);
      renderCollabCursors(data);
      applyCollaborationContent(data);
    }, error => {
      console.warn('Collaboration listener failed.', error);
      setStatus('Live project sync disconnected');
    });
    window.clearInterval(collabState.heartbeatTimer);
    collabState.heartbeatTimer = window.setInterval(updateCollabHeartbeat, COLLAB_HEARTBEAT_MS);
    updateCollabHeartbeat();
    scheduleCollabCursorPush();
    updateCollaborationFeatureVisibility();
    renderCollabLiveIndicator(initialData);
    renderCollabCursors(initialData);
  }

  async function updateCollabHeartbeat() {
    if (!collabState.active || !collabState.sessionRef || !getCollabUid()) return;
    try {
      const { setDoc, serverTimestamp } = firebaseSync.modules;
      await setDoc(collabState.sessionRef, {
        members: { [getCollabUid()]: buildCollabMember(collabState.role || 'member') },
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.warn('Could not update collaboration heartbeat.', error);
    }
  }

  function applyCollaborationContent(data = {}, options = {}) {
    const version = Number(data.contentVersion || 0);
    const sameEditor = data.lastEditorUid && data.lastEditorUid === getCollabUid();
    if (!options.force && (sameEditor || !version || version <= collabState.lastContentVersion)) return;
    collabState.applyingRemote = true;
    try {
      codeByActivity = normalizeProjectCodeByActivity(data.codeByActivity);
      selectedActivityId = activities.some(item => item.id === data.selectedActivityId) ? data.selectedActivityId : '';
      activity = selectedActivityId ? getActivityById(selectedActivityId) : null;
      const codeKey = selectedActivityId || 'scratch';
      codeStore = codeByActivity[codeKey] ? normalizeCodeStore(codeByActivity[codeKey]) : normalizeCodeStore(starterCode);
      codeByActivity[codeKey] = normalizeCodeStore(codeStore);
      codeFileNames = normalizeCodeFileNames(data.fileNames || DEFAULT_CODE_FILE_NAMES);
      saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
      saveCodeByActivity();
      saveCodeFileNames();
      renderActivitySummary();
      renderActivitySelector();
      loadActiveEditor();
      resetResultPanel();
      runCode(false, { scroll: false, source: 'collab' });
      markCollabRemoteVersion(version);
      setStatus(`${data.lastEditorName || 'Classmate'} updated the shared project`);
      window.setTimeout(() => renderCollabCursors(data), 30);
    } finally {
      window.setTimeout(() => { collabState.applyingRemote = false; }, 80);
    }
  }

  function scheduleCollaborationPush(reason = 'edit', options = {}) {
    if (!collabState.active || !collabState.sessionRef || collabState.applyingRemote) return;
    if (!collabState.canEdit) {
      setStatus('This shared project is view-only');
      return;
    }
    const delay = Number.isFinite(options.delay) ? Math.max(0, options.delay) : COLLAB_PUSH_DELAY;
    window.clearTimeout(collabState.pushTimer);
    collabState.pushTimer = window.setTimeout(() => pushCollaborationUpdate(reason), delay);
  }

  function scheduleCollaborationPushAfterDom(reason = 'edit', delay = 0) {
    window.setTimeout(() => scheduleCollaborationPush(reason, { delay }), 0);
  }

  async function pushCollaborationUpdate(reason = 'edit') {
    if (!collabState.active || !collabState.sessionRef || !collabState.canEdit || collabState.applyingRemote) return;
    if (collabState.pushInFlight) {
      collabState.queuedPush = true;
      return;
    }
    let payload;
    let signature;
    try {
      payload = getCollabContentPayload();
      signature = getCollabPayloadSignature(payload);
      if (reason !== 'silent' && signature && signature === collabState.lastPushedSignature) return;
    } catch (error) {
      console.warn('Could not prepare live project payload.', error);
      return;
    }
    collabState.pushInFlight = true;
    collabState.queuedPush = false;
    try {
      const { setDoc, serverTimestamp } = firebaseSync.modules;
      const version = Date.now();
      collabState.lastLocalVersion = version;
      await setDoc(collabState.sessionRef, {
        ...payload,
        lastEditorUid: getCollabUid(),
        lastEditorName: getCollabName(),
        lastEditorLanguage: activeLanguage,
        lastEditorFile: getActiveLanguageFileName(activeLanguage),
        contentVersion: version,
        members: { [getCollabUid()]: buildCollabMember(collabState.role || 'member') },
        updatedAt: serverTimestamp()
      }, { merge: true });
      collabState.lastContentVersion = version;
      collabState.lastPushedSignature = signature;
      if (reason !== 'silent') setStatus('Live project synced');
    } catch (error) {
      console.warn('Could not sync collaboration update.', error);
      setStatus('Live project sync failed');
    } finally {
      collabState.pushInFlight = false;
      if (collabState.queuedPush && collabState.active && collabState.canEdit) {
        collabState.queuedPush = false;
        scheduleCollaborationPush('queued', { delay: 20 });
      }
    }
  }

  async function stopCollaborationSession() {
    if (!collabState.active || collabState.role !== 'host' || !collabState.sessionRef) return;
    const confirmed = await appConfirm('Stop this live sharing session? Classmates will no longer be able to edit or view using this code.', { title: 'Stop sharing', danger: true, confirmText: 'Stop Sharing' });
    if (!confirmed) return;
    try {
      const { setDoc, serverTimestamp } = firebaseSync.modules;
      await setDoc(collabState.sessionRef, { active: false, stoppedAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
      leaveCollaborationSession({ message: 'Sharing stopped.', closeOverlay: true });
      closeCollabMembersOverlay?.();
      closeCollabOverlay?.();
      resetCollabOverlayToInactive('Sharing stopped. You can start a new live session anytime.');
    } catch (error) {
      setCollabStatus(error?.message || 'Could not stop sharing.', 'error');
    }
  }

  function leaveCollaborationSession(options = {}) {
    const wasJoinedStudent = collabState.active && collabState.role !== 'host';
    let backupSnapshot = collabState.localBeforeJoin;
    if (wasJoinedStudent && !backupSnapshot && !options.noRestore) {
      try { backupSnapshot = JSON.parse(sessionStorage.getItem('studentCodeStudio.collab.localBeforeJoin') || 'null'); } catch { backupSnapshot = null; }
    }
    const returnToDashboard = wasJoinedStudent && !options.noRestore && shouldReturnToDashboardAfterCollab(options);
    const localSnapshot = wasJoinedStudent && !returnToDashboard && !options.noRestore && backupSnapshot ? backupSnapshot : null;
    window.clearTimeout(collabState.pushTimer);
    window.clearTimeout(collabState.cursorTimer);
    window.clearInterval(collabState.heartbeatTimer);
    if (typeof collabState.unsubscribe === 'function') collabState.unsubscribe();
    collabState.active = false;
    collabState.role = '';
    collabState.code = '';
    collabState.sessionRef = null;
    collabState.unsubscribe = null;
    collabState.heartbeatTimer = null;
    collabState.pushTimer = null;
    collabState.cursorTimer = null;
    collabState.canEdit = false;
    collabState.latestSession = null;
    collabState.lastIndicatorText = '';
    editor.readOnly = false;
    document.body.classList.remove('collab-active', 'collab-view-only');
    closeCollabMembersOverlay?.();
    if (returnToDashboard) {
      collabState.localBeforeJoin = null;
      try { sessionStorage.removeItem('studentCodeStudio.collab.localBeforeJoin'); } catch {}
    } else if (localSnapshot) {
      closeCollabOverlay?.();
      restoreCollabLocalSnapshot(localSnapshot);
      collabState.localBeforeJoin = null;
      try { sessionStorage.removeItem('studentCodeStudio.collab.localBeforeJoin'); } catch {}
    } else if (!options.keepLocalSnapshot) {
      collabState.localBeforeJoin = null;
      try { sessionStorage.removeItem('studentCodeStudio.collab.localBeforeJoin'); } catch {}
    }
    renderCollabMembers(null);
    renderCollabLiveIndicator(null);
    renderCollabCursors(null);
    renderCollabShareButton();
    if (!options.keepDocActive) {
      resetCollabOverlayToInactive(options.message || 'Live session ended.');
      if (options.closeOverlay) closeCollabOverlay?.();
    }
    updateCollaborationFeatureVisibility();
    if (returnToDashboard) {
      returnToDashboardAfterCollab(options.message || 'You left the live project.');
      return;
    }
    if (!options.silent && options.message) setStatus(localSnapshot ? `${options.message || 'Left live project'} Your own project is back.` : options.message);
  }

  async function leaveCurrentCollaborationFromButton() {
    if (!collabState.active || !collabState.sessionRef) return;
    if (collabState.role === 'host') {
      await stopCollaborationSession();
      return;
    }
    const confirmed = await appConfirm('Leave this live project? You will stop seeing the host project updates.', { title: 'Leave live project', confirmText: 'Leave Project' });
    if (!confirmed) return;
    try {
      const { setDoc, serverTimestamp } = firebaseSync.modules;
      const uid = getCollabUid();
      await setDoc(collabState.sessionRef, {
        members: {
          [uid]: {
            ...buildCollabMember(collabState.role || 'member'),
            online: false,
            left: true,
            leftAt: Date.now()
          }
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.warn('Could not mark member as left.', error);
    }
    closeCollabMembersOverlay();
    closeCollabOverlay();
    leaveCollaborationSession({ message: 'You left the live project.' });
  }

  async function kickCollabMember(uid, displayName = 'this member') {
    if (!collabState.active || collabState.role !== 'host' || !collabState.sessionRef || !uid || uid === getCollabUid()) return;
    const confirmed = await appConfirm(`Remove ${displayName} from this live project?`, { title: 'Remove member', danger: true, confirmText: 'Kick Member' });
    if (!confirmed) return;
    try {
      const { setDoc, serverTimestamp } = firebaseSync.modules;
      const existing = collabState.latestSession?.members?.[uid] || {};
      await setDoc(collabState.sessionRef, {
        members: {
          [uid]: {
            ...existing,
            uid,
            online: false,
            kicked: true,
            kickedBy: getCollabUid(),
            kickedByName: getCollabName(),
            kickedAt: Date.now(),
            lastSeenAt: Date.now()
          }
        },
        updatedAt: serverTimestamp()
      }, { merge: true });
      setStatus(`${displayName} was removed from the live project.`);
      renderCollabMembers(collabState.latestSession);
      showCollabMembersList();
    } catch (error) {
      console.error('Could not kick collaboration member.', error);
      setStatus(error?.message || 'Could not remove member.');
    }
  }

  function ensureCollabMembersOverlay() {
    let overlay = document.getElementById('collabMembersOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'collabMembersOverlay';
    overlay.className = 'collab-members-overlay hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'collabMembersTitle');
    overlay.innerHTML = `
      <div class="collab-members-card">
        <button id="collabMembersCloseBtn" class="icon-btn collab-close-btn" type="button" aria-label="Close members list">×</button>
        <div class="collab-members-head">
          <p class="section-kicker">Live Members</p>
          <h2 id="collabMembersTitle">Live Project</h2>
          <p id="collabMembersSubtitle" class="muted-text"></p>
        </div>
        <div id="collabMembersList" class="collab-members-list"></div>
        <div class="collab-members-footer">
          <button id="collabMembersLeaveBtn" class="ghost-btn warning hidden" type="button">Leave Live Project</button>
          <button id="collabMembersStopBtn" class="ghost-btn danger hidden" type="button">Stop Sharing</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    placeCollabOverlay(overlay);
    overlay.querySelector('#collabMembersCloseBtn')?.addEventListener('click', closeCollabMembersOverlay);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeCollabMembersOverlay(); });
    overlay.querySelector('#collabMembersLeaveBtn')?.addEventListener('click', leaveCurrentCollaborationFromButton);
    overlay.querySelector('#collabMembersStopBtn')?.addEventListener('click', stopCollaborationSession);
    placeCollabOverlay(overlay);
    return overlay;
  }

  function closeCollabMembersOverlay() {
    document.getElementById('collabMembersOverlay')?.classList.add('hidden');
  }

  async function copyCollabCode() {
    const code = document.getElementById('collabShareCode')?.textContent?.trim();
    if (!code || code === '------') {
      setCollabStatus('Start a session first.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCollabStatus('Code copied.', 'success');
    } catch {
      setCollabStatus(`Code: ${code}`, 'success');
    }
  }

  function getOnlineMembers(data = collabState.latestSession) {
    const members = data?.members && typeof data.members === 'object' ? Object.values(data.members) : [];
    const cutoff = Date.now() - (COLLAB_HEARTBEAT_MS * 3.5);
    return members.filter(member => member && member.online !== false && Number(member.lastSeenAt || 0) >= cutoff);
  }

  function renderCollabMembers(data) {
    const pill = document.getElementById('collabMembersPill');
    if (!pill) return;
    const members = getOnlineMembers(data);
    const visible = collabState.active && isCollaborationMembersVisible();
    const count = members.length || (collabState.active ? 1 : 0);
    const projectName = getCollabProjectName(data);
    const safeName = projectName.length > 22 ? `${projectName.slice(0, 21)}…` : projectName;
    pill.classList.toggle('hidden', !visible);
    pill.textContent = `👥 ${count} online · ${safeName}`;
    pill.title = `${count} online in ${projectName}. Click to show live project members.`;
    renderCollabLiveIndicator(data);
    renderCollabCursors(data);
    syncMobileCollabToolsBar();
  }

  function showCollabMembersList() {
    if (!collabState.active || !isCollaborationMembersVisible()) return;
    const overlay = ensureCollabMembersOverlay();
    placeCollabOverlay(overlay);
    const members = getOnlineMembers();
    const projectName = getCollabProjectName();
    const hostName = getCollabHostName();
    const title = overlay.querySelector('#collabMembersTitle');
    const subtitle = overlay.querySelector('#collabMembersSubtitle');
    const list = overlay.querySelector('#collabMembersList');
    const leaveBtn = overlay.querySelector('#collabMembersLeaveBtn');
    const stopBtn = overlay.querySelector('#collabMembersStopBtn');

    if (title) title.textContent = collabState.role === 'host' ? 'You are hosting live' : 'You joined a live project';
    if (subtitle) {
      subtitle.textContent = collabState.role === 'host'
        ? `${projectName} · Code ${collabState.code}`
        : `${projectName} · Host: ${hostName}`;
    }
    if (leaveBtn) leaveBtn.classList.toggle('hidden', collabState.role === 'host');
    if (stopBtn) stopBtn.classList.toggle('hidden', collabState.role !== 'host');

    if (list) {
      list.innerHTML = members.length ? members.map(member => {
        const name = collabEscape(member.name || member.studentId || 'Student');
        const isHost = member.role === 'host';
        const isMe = member.uid === getCollabUid();
        const color = getCollabMemberColor(member.uid, member.color || '');
        const meta = isHost ? 'Host' : (isMe ? 'You' : 'Member');
        const kick = collabState.role === 'host' && !isHost && !isMe
          ? `<button class="ghost-btn danger collab-kick-member-btn" type="button" data-uid="${collabEscape(member.uid || '')}" data-name="${name}">Kick</button>`
          : '';
        return `<div class="collab-member-row" style="--member-color:${color}">
          <div class="collab-member-avatar"><span class="collab-color-dot"></span>${isHost ? '👑' : '👤'}</div>
          <div class="collab-member-main"><strong>${name}</strong><span>${meta}${member.studentId ? ` · ${collabEscape(member.studentId)}` : ''} · cursor color</span></div>
          ${kick}
        </div>`;
      }).join('') : '<div class="collab-empty-members">No active members detected yet.</div>';
      list.querySelectorAll('.collab-kick-member-btn').forEach(btn => {
        btn.addEventListener('click', () => kickCollabMember(btn.dataset.uid, btn.dataset.name || 'this member'));
      });
    }
    overlay.classList.remove('hidden');
  }

  function updateCollaborationFeatureVisibility() {
    ensureCollabControls();
    const enabled = isCollaborationEnabled();
    const button = document.getElementById('collabShareBtn');
    const dashboardJoinButton = document.getElementById('dashboardJoinProjectBtn');
    button?.classList.toggle('hidden', !enabled);
    if (button) {
      button.disabled = !enabled;
      button.setAttribute('aria-hidden', enabled ? 'false' : 'true');
      button.title = enabled
        ? 'Share or join a live project'
        : 'Share & Join is disabled by the teacher';
    }
    if (dashboardJoinButton) {
      dashboardJoinButton.classList.toggle('hidden', !enabled);
      dashboardJoinButton.disabled = !enabled;
      dashboardJoinButton.setAttribute('aria-hidden', enabled ? 'false' : 'true');
      dashboardJoinButton.title = enabled
        ? 'Join a live project using a share code'
        : 'Share & Join is disabled by the teacher';
    }
    document.body.classList.toggle('student-collaboration-disabled', !enabled);
    document.body.classList.toggle('collab-hosting-active', enabled && collabState.active && collabState.role === 'host');
    document.body.classList.toggle('collab-joined-active', enabled && collabState.active && collabState.role !== 'host');
    renderCollabShareButton();
    if (!enabled && collabState.active) leaveCollaborationSession({ message: 'Project sharing was disabled by the teacher.' });
    renderCollabMembers(collabState.latestSession);
    renderCollabLiveIndicator(collabState.latestSession);
    syncMobileCollabToolsBar();
  }

  window.updateCollaborationFeatureVisibility = updateCollaborationFeatureVisibility;

  editor.addEventListener('beforeinput', event => {
    if (!collabState.active || collabState.applyingRemote) return;
    const inputType = String(event.inputType || '');
    const fast = /insertLineBreak|insertParagraph|delete|insertFromPaste|insertFromDrop|historyUndo|historyRedo/i.test(inputType);
    scheduleCollaborationPushAfterDom(fast ? inputType : 'beforeinput', fast ? 10 : COLLAB_PUSH_DELAY);
  });
  editor.addEventListener('input', () => {
    scheduleCollaborationPush('edit', { delay: 35 });
    scheduleCollabCursorPush();
  });
  editor.addEventListener('keydown', event => {
    if (['Enter', 'Backspace', 'Delete'].includes(event.key) || (event.ctrlKey && ['z', 'y', 'v', 'x'].includes(String(event.key).toLowerCase()))) {
      scheduleCollaborationPushAfterDom(`key:${event.key}`, 10);
    }
  });
  editor.addEventListener('paste', () => scheduleCollaborationPushAfterDom('paste', 10));
  editor.addEventListener('cut', () => scheduleCollaborationPushAfterDom('cut', 10));
  editor.addEventListener('drop', () => scheduleCollaborationPushAfterDom('drop', 10));
  editor.addEventListener('keyup', scheduleCollabCursorPush);
  editor.addEventListener('click', scheduleCollabCursorPush);
  editor.addEventListener('mouseup', scheduleCollabCursorPush);
  editor.addEventListener('scroll', () => renderCollabCursors(collabState.latestSession));
  document.addEventListener('selectionchange', () => {
    if (document.activeElement === editor) scheduleCollabCursorPush();
  });
  document.addEventListener('change', event => {
    if (['activitySelect', 'htmlPageSelect'].includes(event.target?.id)) scheduleCollaborationPush('change', { delay: 20 });
  });
  document.addEventListener('click', event => {
    if (event.target?.closest?.('#addHtmlPageBtn, #renameHtmlPageBtn, #deleteHtmlPageBtn, #applyPageDialogBtn, #renameFilesBtn')) {
      window.setTimeout(() => scheduleCollaborationPush('page', { delay: 20 }), 80);
    }
  });
  document.addEventListener('studentAssistanceSettingsChanged', updateCollaborationFeatureVisibility);
  document.addEventListener('fullscreenchange', () => window.setTimeout(() => { ensureCollabControls(); placeAllCollabOverlays(); renderCollabCursors(collabState.latestSession); }, 60));
  document.addEventListener('webkitfullscreenchange', () => window.setTimeout(() => { ensureCollabControls(); placeAllCollabOverlays(); renderCollabCursors(collabState.latestSession); }, 60));
  window.addEventListener('resize', () => window.setTimeout(() => { ensureCollabControls(); placeAllCollabOverlays(); renderCollabCursors(collabState.latestSession); }, 60));
  window.addEventListener('beforeunload', () => { if (collabState.active && collabState.canEdit) pushCollaborationUpdate('silent'); });
  new MutationObserver(() => updateCollaborationFeatureVisibility()).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  ensureCollabOverlay();
  ensureCollabMembersOverlay();
  ensureCollabControls();
  placeAllCollabOverlays();
})();


/* Stability pass: one event-driven phone layout reconciler replaces several polling loops. */
