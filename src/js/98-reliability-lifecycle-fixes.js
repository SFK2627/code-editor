(function installPhoneLayoutReconciler() {
  let scheduled = false;

  function isPhoneMode() {
    return document.documentElement?.dataset?.deviceMode === 'phone' || window.matchMedia('(max-width: 820px)').matches;
  }

  function isVisible(element) {
    if (!element || element.classList.contains('hidden') || element.classList.contains('collapsed-card')) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && rect.width > 0 && rect.height > 0;
  }

  function normalizePhoneLabels() {
    if (!isPhoneMode()) return;
    const monitorBtn = document.getElementById('desktopPreviewBtn');
    const fullBtn = document.getElementById('fullPreviewBtn');
    const previewResultBtn = document.getElementById('resultFromPreviewBtn');
    if (monitorBtn) monitorBtn.textContent = monitorBtn.classList.contains('active') ? '📱 Phone' : '🖥️ Monitor';
    if (fullBtn) {
      fullBtn.textContent = '⛶ Full';
      fullBtn.style.color = '#07111f';
      fullBtn.style.webkitTextFillColor = '#07111f';
    }
    if (previewResultBtn) {
      previewResultBtn.textContent = '✓ Result';
      previewResultBtn.style.color = '#ffffff';
      previewResultBtn.style.webkitTextFillColor = '#ffffff';
      previewResultBtn.style.opacity = '1';
    }
  }

  function reconcile() {
    scheduled = false;
    if (!isPhoneMode()) return;
    normalizePhoneLabels();

    const body = document.body;
    const editorVisible = isVisible(document.getElementById('editorPanel')) && isVisible(document.querySelector('.app-shell'));
    const realFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    const activityOpen = isVisible(document.getElementById('activityCard'));
    const entryOpen = isVisible(document.getElementById('entryGate'));
    const studentAuthOpen = isVisible(document.getElementById('studentLoginOverlay')) || isVisible(document.getElementById('changePasswordOverlay')) || isVisible(document.getElementById('projectNameOverlay'));
    const dashboardOpen = isVisible(document.getElementById('studentDashboard')) || isVisible(document.getElementById('studentDashboardScreen'));
    const adminOpen = isVisible(document.getElementById('adminOverlay'));
    const blockingOverlayOpen = entryOpen || studentAuthOpen || dashboardOpen || adminOpen || activityOpen;

    body.classList.toggle('entry-gate-active', entryOpen);
    body.classList.toggle('student-auth-open', studentAuthOpen);
    body.classList.toggle('student-dashboard-active', dashboardOpen);
    body.classList.toggle('admin-open', adminOpen);
    body.classList.toggle('activity-popup-open', activityOpen);

    const normalEditor = editorVisible && !realFullscreen && !blockingOverlayOpen;
    body.classList.toggle('mobile-editor-normal', normalEditor);
    body.classList.toggle('editor-scroll-unlocked', normalEditor);

    if (normalEditor) {
      body.classList.remove('student-route-lock', 'preview-fullscreen-active', 'preview-has-back-editor', 'editor-fullscreen-active', 'preview-inside-editor-fullscreen');
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowY = '';
      document.documentElement.style.height = '';
      body.style.overflow = '';
      body.style.overflowY = '';
      body.style.position = '';
      body.style.height = '';
      body.style.maxHeight = '';
      body.style.touchAction = 'pan-y';
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(reconcile);
  }

  ['load', 'resize', 'orientationchange', 'fullscreenchange', 'webkitfullscreenchange', 'online', 'offline'].forEach(name => {
    window.addEventListener(name, schedule, true);
  });
  ['click', 'touchend', 'pointerup', 'input', 'change'].forEach(name => {
    document.addEventListener(name, schedule, true);
  });
  new MutationObserver(schedule).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'hidden', 'aria-hidden']
  });
  schedule();
})();

/* Network, recovery, and page-lifecycle reliability. */
(function installAppReliabilityLifecycle() {
  const onReconnect = () => {
    updateConnectionStatusUI();
    if (studentProjectDirty && isStudentProjectActive()) {
      window.clearTimeout(studentProjectRetryTimer);
      window.setTimeout(() => flushStudentProjectSave('reconnect'), 500);
    }
    if (appSession.mode === 'student' && !document.body.classList.contains('student-dashboard-active')) setStatus('Back online');
  };

  window.addEventListener('online', onReconnect);
  window.addEventListener('offline', () => {
    updateConnectionStatusUI();
    if (studentProjectDirty) persistStudentProjectRecoverySnapshot('offline');
    setStatus('Offline · edits protected locally');
  });
  window.addEventListener('load', updateConnectionStatusUI);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && studentProjectDirty && isStudentProjectActive()) {
      persistStudentProjectRecoverySnapshot('visibility');
      if (navigator.onLine !== false) saveCurrentStudentProject({ immediate: true, reason: 'visibility' });
    }
  });
  window.addEventListener('pagehide', () => {
    if (studentProjectDirty && isStudentProjectActive()) persistStudentProjectRecoverySnapshot('pagehide');
  });
  window.addEventListener('beforeunload', event => {
    if (!studentProjectDirty && !studentProjectSaveInFlight) return;
    persistStudentProjectRecoverySnapshot('beforeunload');
    event.preventDefault();
    event.returnValue = '';
  });
  window.addEventListener('error', event => {
    if (!event?.message) return;
    console.error('App runtime error:', event.message, event.error || '');
  });
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled app promise:', event.reason || event);
  });
  updateConnectionStatusUI();
})();

/* Desktop/mobile safety: Practice Without Login must always open the editor. */
(function installPracticeWithoutLoginHardClickFix() {
  function handlePracticeClick(event) {
    const button = event.target && event.target.closest && event.target.closest('#continueGuestBtn, #studentLoginGuestBtn');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    continueAsGuest();
  }
  document.addEventListener('click', handlePracticeClick, true);
})();

