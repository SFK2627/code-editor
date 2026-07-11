function handleFullscreenRunClick() {
  runCode(true);
}

function handleFullscreenResultClick() {
  if (document.body.classList.contains('editor-fullscreen-active')) {
    exitFullEditor();
    window.setTimeout(showResult, 120);
    return;
  }
  showResult();
}

if (fullEditorBtn) fullEditorBtn.addEventListener('click', enterFullEditor);
if (exitEditorBtn) exitEditorBtn.addEventListener('click', exitFullEditor);
if (exitEditorStickyBtn) exitEditorStickyBtn.addEventListener('click', exitFullEditor);
if (fullscreenRunBtn) fullscreenRunBtn.addEventListener('click', handleFullscreenRunClick);
if (fullscreenResultBtn) fullscreenResultBtn.addEventListener('click', handleFullscreenResultClick);
ensureFullscreenActionBar();

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && fileNameDialogOverlay && !fileNameDialogOverlay.classList.contains('hidden')) {
    event.preventDefault();
    closeFileNameDialog();
    return;
  }

  if (event.key === 'Escape' && errorCheckerPanel && !errorCheckerPanel.classList.contains('hidden')) {
    closeCodeHelperPanel();
    return;
  }

  handleGlobalShortcuts(event);

  if (event.key === 'Escape' && document.body.classList.contains('preview-fullscreen-active')) {
    exitFullPreview({ closeEditorFullscreen: true });
  }

  if (event.key === 'Escape' && document.body.classList.contains('editor-fullscreen-active')) {
    exitFullEditor();
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('editor-fullscreen-active')) {
    if (document.body.classList.contains('preview-inside-editor-fullscreen') || document.body.classList.contains('preview-fullscreen-active')) {
      return;
    }
    exitFullEditor({ fromNative: true });
    return;
  }

  if (document.fullscreenElement === editorPanel && document.body.classList.contains('editor-fullscreen-active')) {
    scheduleFullEditorControlsRestore();
  }

  if (!document.fullscreenElement && document.body.classList.contains('preview-fullscreen-active')) {
    exitFullPreview({ fromNative: true });
  }
});


window.addEventListener('resize', scheduleFullEditorControlsRestore);
document.addEventListener('visibilitychange', scheduleFullEditorControlsRestore);
window.addEventListener('pageshow', scheduleFullEditorControlsRestore);

runBtn.addEventListener('click', () => runCode());
autoRunBtn?.addEventListener('click', toggleAutoRun);
if (fullscreenAutoRunBtn && !fullscreenAutoRunBtn.dataset.fullscreenActionBound) {
  fullscreenAutoRunBtn.addEventListener('click', toggleAutoRun);
  fullscreenAutoRunBtn.dataset.fullscreenActionBound = 'true';
}
updateAutoRunButtons();
resultBtn.addEventListener('click', showResult);
if (aiReviewTopBtn) aiReviewTopBtn.addEventListener('click', requestAIReview);
if (runAiReviewBtn) runAiReviewBtn.addEventListener('click', requestAIReview);
if (saveBtn) saveBtn.addEventListener('click', downloadCodeAsZip);
if (downloadZipBtn) downloadZipBtn.addEventListener('click', downloadCodeAsZip);
codeHelperFloatingBtn?.addEventListener('click', toggleCodeHelperPanel);
closeCodeHelperBtn?.addEventListener('click', closeCodeHelperPanel);
if (refreshErrorCheckerBtn) refreshErrorCheckerBtn.addEventListener('click', () => {
  saveActiveEditor();
  runCode(false, { scroll: false });
  window.setTimeout(renderErrorChecker, 220);
  setStatus('Errors checked');
});
if (advancedErrorCheckBtn) advancedErrorCheckBtn.addEventListener('click', requestAdvancedErrorCheck);
if (previewFrame) previewFrame.addEventListener('load', () => {
  markPreviewReady();
  window.setTimeout(renderErrorChecker, 80);
});
activitySelect.addEventListener('change', event => selectActivity(event.target.value));
resetActivityCodeBtn.addEventListener('click', resetCurrentActivityCode);

themeToggle?.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

entryThemeToggle?.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

resetBtn.addEventListener('click', async () => {
  const resetLabel = activity ? `"${activity.title}"` : 'the editor';
  if (!await appConfirm(`Reset all tabs for ${resetLabel} to the sample code? Your current code in this activity will be replaced.`, { title: 'Reset editor', danger: true, confirmText: 'Reset' })) return;
  codeStore = normalizeCodeStore(starterCode);
  if (activity) {
    codeByActivity[activity.id] = codeStore;
    saveCodeByActivity();
  }
  resetAllLanguageHistoryForCurrentActivity();
  loadActiveEditor();
  resetResultPanel();
  runCode();
  setStatus('Reset complete');
});

clearBtn.addEventListener('click', async () => {
  if (!await appConfirm(`Clear the ${activeLanguage.toUpperCase()} tab? This removes the code in the current tab only.`, { title: 'Clear current tab', danger: true, confirmText: 'Clear' })) return;
  applyProgrammaticEditorChange('', 0, 0);
  hideSuggestions();
  runCode();
  setStatus(`${activeLanguage.toUpperCase()} cleared`);
});

window.addEventListener('resize', fitEditorToContent);

window.addEventListener('click', event => {
  if (!suggestionBox.contains(event.target) && event.target !== editor) {
    hideSuggestions();
  }
});

appDialogOkBtn?.addEventListener('click', () => closeAppDialog(true));
appDialogCancelBtn?.addEventListener('click', () => closeAppDialog(false));
appDialogOverlay?.addEventListener('click', event => {
  if (event.target === appDialogOverlay) closeAppDialog(false);
});
window.addEventListener('keydown', event => {
  if (!appDialogOverlay || appDialogOverlay.classList.contains('hidden')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeAppDialog(false);
  }
});

[assistanceMasterToggle, codeSuggestionsToggle, codeHelperToggle, teacherFeedbackToggle, superStudioToggle, autoSaveControlToggle, autoRunControlToggle, externalLinksSamePreviewToggle, collaborationToggle, collaborationEditToggle, collaborationMembersToggle].forEach(toggle => {
  toggle?.addEventListener('change', () => {
    applyAssistanceSettingsFromControls();
  });
});
applyAssistanceLocalBtn?.addEventListener('click', () => applyAssistanceSettingsFromControls());
publishAssistanceBtn?.addEventListener('click', publishAssistanceSettings);

initAdminTabs();
adminBtn?.addEventListener('click', openAdminPanel);
adminBtn?.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openAdminPanel();
  }
});
closeAdminBtn.addEventListener('click', closeAdminPanel);
unlockAdminBtn?.addEventListener('click', unlockAdmin);
unlockAdminCodeBtn?.addEventListener('click', unlockAdminWithCode);
adminCodeModeBtn?.addEventListener('click', () => setAdminLoginMode('code'));
adminPasswordModeBtn?.addEventListener('click', () => setAdminLoginMode('password'));
if (logoutAdminBtn) logoutAdminBtn.addEventListener('click', logoutTeacher);
[adminEmail, adminPassword].forEach(input => {
  input?.addEventListener('input', () => showTeacherLoginError(''));
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      unlockAdmin();
    }
  });
});
adminQuickCode?.addEventListener('input', () => showTeacherLoginError(''));
adminQuickCode?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    unlockAdminWithCode();
  }
});

adminOverlay.addEventListener('click', event => {
  if (event.target === adminOverlay) {
    closeAdminPanel();
  }
});

adminForm.addEventListener('submit', saveRubric);
adminActivitySelect.addEventListener('change', event => editAdminActivity(event.target.value));
newActivityBtn.addEventListener('click', createNewActivity);
duplicateActivityBtn.addEventListener('click', duplicateActivity);
deleteActivityBtn.addEventListener('click', deleteActivity);
addCriterionBtn.addEventListener('click', addCriterion);
resetRubricBtn.addEventListener('click', restoreDefaultRubric);
if (rubricImageInput) rubricImageInput.addEventListener('change', previewRubricImage);
if (importRubricImageBtn) importRubricImageBtn.addEventListener('click', importRubricImage);
if (clearRubricImageBtn) clearRubricImageBtn.addEventListener('click', clearRubricImageImport);
if (fillRubricTextBtn) fillRubricTextBtn.addEventListener('click', fillRubricTableFromExtractedText);
renameFilesBtn?.addEventListener('click', openFileNameDialog);
closeFileNameDialogBtn?.addEventListener('click', closeFileNameDialog);
cancelFileNameDialogBtn?.addEventListener('click', closeFileNameDialog);
defaultFileNamesBtn?.addEventListener('click', resetFileNameDialogDefaults);
applyFileNamesBtn?.addEventListener('click', applyFileNameDialogValues);
fileNameDialogOverlay?.addEventListener('click', event => {
  if (event.target === fileNameDialogOverlay) closeFileNameDialog();
});
htmlPageSelect?.addEventListener('change', event => switchHTMLPage(event.target.value));
addHtmlPageBtn?.addEventListener('click', () => openPageDialog('add'));
renameHtmlPageBtn?.addEventListener('click', () => openPageDialog('rename'));
deleteHtmlPageBtn?.addEventListener('click', deleteCurrentHTMLPage);
closePageDialogBtn?.addEventListener('click', closePageDialog);
cancelPageDialogBtn?.addEventListener('click', closePageDialog);
applyPageDialogBtn?.addEventListener('click', applyPageDialog);
pageDialogOverlay?.addEventListener('click', event => {
  if (event.target === pageDialogOverlay) closePageDialog();
});
htmlPageNameInput?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    applyPageDialog();
  }
});

document.addEventListener('fullscreenchange', () => {
  if (fileNameDialogOverlay && !fileNameDialogOverlay.classList.contains('hidden')) {
    placeFileNameDialogForCurrentMode();
  }
  if (pageDialogOverlay && !pageDialogOverlay.classList.contains('hidden')) {
    placePageDialogForCurrentMode();
  }
});

document.addEventListener('webkitfullscreenchange', () => {
  if (fileNameDialogOverlay && !fileNameDialogOverlay.classList.contains('hidden')) {
    placeFileNameDialogForCurrentMode();
  }
  if (pageDialogOverlay && !pageDialogOverlay.classList.contains('hidden')) {
    placePageDialogForCurrentMode();
  }
});
[htmlFileNameInput, cssFileNameInput, jsFileNameInput].forEach(input => {
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFileNameDialogValues();
    }
  });
});
if (addManualRubricRowBtn) addManualRubricRowBtn.addEventListener('click', () => addManualRubricInputRow());
if (applyManualRubricBtn) applyManualRubricBtn.addEventListener('click', applyManualRubricTableToActualRubric);
if (clearManualRubricBtn) clearManualRubricBtn.addEventListener('click', clearManualRubricInputTable);
if (manualRubricInputBody) {
  manualRubricInputBody.addEventListener('click', event => {
    const removeButton = event.target.closest('.remove-manual-rubric-row');
    if (!removeButton) return;
    const row = removeButton.closest('.manual-rubric-input-row');
    if (row) row.remove();
    ensureManualRubricRows();
  });
}
criteriaEditor.addEventListener('change', updateCriterionHelp);
criteriaEditor.addEventListener('click', async event => {
  const removeButton = event.target.closest('.remove-criterion');
  if (!removeButton) return;
  event.preventDefault();
  event.stopPropagation();
  const currentCriteria = collectCriteriaFromEditor();
  const card = removeButton.closest('.rubric-table-row') || removeButton.closest('.criterion-card');
  if (!card) return;
  const target = currentCriteria.find(item => item.id === card.dataset.id);
  const name = target?.title || 'this criterion';
  if (!await appConfirm(`Remove “${name}” from the rubric table?`, {
    title: 'Remove criterion',
    danger: true,
    confirmText: 'Remove'
  })) return;
  const filtered = currentCriteria.filter(item => item.id !== card.dataset.id);
  renderCriteriaEditor(filtered);
});

// Welcome, student authentication, password, dashboard, and project actions.
openStudentLoginBtn?.addEventListener('click', openStudentLogin);
continueGuestBtn?.addEventListener('click', continueAsGuest);
resumeStudentBtn?.addEventListener('click', resumeExistingStudentSession);
closeStudentLoginBtn?.addEventListener('click', closeStudentLogin);
studentLoginGuestBtn?.addEventListener('click', continueAsGuest);
guestLoginToSaveBtn?.addEventListener('click', () => {
  showEntryGate();
  openStudentLogin();
});
studentLoginBtn?.addEventListener('click', loginStudent);
toggleStudentPasswordBtn?.addEventListener('click', () => {
  if (!studentLoginPassword) return;
  const show = studentLoginPassword.type === 'password';
  studentLoginPassword.type = show ? 'text' : 'password';
  toggleStudentPasswordBtn.textContent = show ? 'Hide' : 'Show';
});
[studentLoginId, studentLoginPassword].forEach(input => input?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    loginStudent();
  }
}));
studentLoginOverlay?.addEventListener('click', event => {
  if (event.target === studentLoginOverlay) closeStudentLogin();
});
saveNewPasswordBtn?.addEventListener('click', saveStudentNewPassword);
changePasswordLogoutBtn?.addEventListener('click', logoutStudent);
[studentNewPassword, studentConfirmPassword].forEach(input => input?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveStudentNewPassword();
  }
}));
myProjectsBtn?.addEventListener('click', showStudentDashboard);
studentHeaderLogoutBtn?.addEventListener('click', logoutStudent);
saveStudentProjectBtn?.addEventListener('click', saveStudentProjectManually);
studentMenuBtn?.addEventListener('click', event => {
  event.stopPropagation();
  toggleStudentAccountMenu();
});
menuSaveProjectBtn?.addEventListener('click', () => {
  closeStudentAccountMenu();
  saveStudentProjectManually();
});
menuMyProjectsBtn?.addEventListener('click', () => {
  closeStudentAccountMenu();
  showStudentDashboard();
});
menuStudentLogoutBtn?.addEventListener('click', () => {
  closeStudentAccountMenu();
  logoutStudent();
});
document.addEventListener('click', event => {
  if (!studentAccountMenu || studentAccountMenu.classList.contains('hidden')) return;
  if (studentAccountMenu.contains(event.target) || studentMenuBtn?.contains(event.target)) return;
  closeStudentAccountMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeStudentAccountMenu();
});
window.addEventListener('orientationchange', closeStudentAccountMenu);
window.addEventListener('resize', closeStudentAccountMenu);
dashboardLogoutBtn?.addEventListener('click', logoutStudent);
dashboardThemeBtn?.addEventListener('click', () => themeToggle?.click());
newProjectBtn?.addEventListener('click', () => openProjectNameDialog('create'));
projectSearchInput?.addEventListener('input', renderStudentProjects);
projectStatusFilter?.addEventListener('change', renderStudentProjects);
studentProjectsGrid?.addEventListener('click', async event => {
  const actionButton = event.target.closest('[data-project-action]');
  if (!actionButton || actionButton.disabled) return;

  event.preventDefault();
  event.stopPropagation();

  const action = actionButton.dataset.projectAction;
  if (action === 'new') {
    openProjectNameDialog('create');
    return;
  }
  if (action === 'retry-load') {
    await loadStudentProjects();
    return;
  }
  const projectCard = actionButton.closest('[data-project-id]');
  const projectId = projectCard?.dataset.projectId;
  const project = appSession.projects.find(item => item.id === projectId);
  if (!projectId) return;
  if (action === 'open') {
    const oldText = actionButton.textContent;
    actionButton.disabled = true;
    actionButton.textContent = 'Opening...';
    projectCard?.classList.add('project-action-busy');
    try {
      await openStudentProject(projectId);
    } finally {
      actionButton.disabled = false;
      actionButton.textContent = oldText;
      projectCard?.classList.remove('project-action-busy');
    }
    return;
  }
  if (action === 'rename') openProjectNameDialog('rename', project);
  if (action === 'delete') {
    const oldTitle = actionButton.title;
    actionButton.disabled = true;
    actionButton.title = 'Delete in progress';
    try {
      await deleteStudentProject(projectId);
    } finally {
      actionButton.disabled = false;
      actionButton.title = oldTitle;
    }
  }
});
closeProjectNameBtn?.addEventListener('click', closeProjectNameDialog);
cancelProjectNameBtn?.addEventListener('click', closeProjectNameDialog);
saveProjectNameBtn?.addEventListener('click', saveProjectNameDialog);
projectNameInput?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveProjectNameDialog();
  }
});
projectNameOverlay?.addEventListener('click', event => {
  if (event.target === projectNameOverlay) closeProjectNameDialog();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && isStudentProjectActive() && isStudentAutoSaveAllowed()) {
    saveCurrentStudentProject({ immediate: true, reason: 'visibility' });
  }
});

// Teacher student account registration, Excel import, and section tracker.
addStudentAccountBtn?.addEventListener('click', addStudentAccountFromForm);
[adminStudentId, adminStudentName, adminStudentSection].forEach(input => input?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addStudentAccountFromForm();
  }
}));
downloadStudentTemplateBtn?.addEventListener('click', downloadStudentImportTemplate);
chooseStudentImportBtn?.addEventListener('click', () => studentImportInput?.click());
studentImportInput?.addEventListener('change', event => handleStudentImportFile(event.target.files?.[0]));
confirmStudentImportBtn?.addEventListener('click', confirmStudentImport);
cancelStudentImportBtn?.addEventListener('click', cancelStudentImport);
refreshStudentsBtn?.addEventListener('click', loadAdminStudents);
adminStudentSearch?.addEventListener('input', renderAdminStudentTracker);
adminSectionFilter?.addEventListener('change', renderAdminStudentTracker);
adminActivityFilter?.addEventListener('change', renderAdminStudentTracker);
adminStudentsTableBody?.addEventListener('click', event => {
  const button = event.target.closest('.view-student-projects-btn');
  if (!button) return;
  if (button.dataset.studentUid) showAdminStudentProjects(button.dataset.studentUid);
});
closeAdminStudentProjectsBtn?.addEventListener('click', closeAdminStudentProjects);
adminStudentProjectsOverlay?.addEventListener('click', event => {
  if (event.target === adminStudentProjectsOverlay) closeAdminStudentProjects();
});

initManualRubricInputTable();
applyStudentAssistanceSettings(studentAssistanceSettings);
setupPWAInstallPrompt();
registerPWAServiceWorker();
saveActivities({ cloud: false });
saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
saveCodeByActivity();
applyTheme(loadJSON(STORAGE_KEYS.theme, 'light'));
applyEditorZoom(editorFontSize);
renderActivitySummary();
resetResultPanel();
setPreviewLayout(loadJSON(STORAGE_KEYS.layout, 'split'));
loadActiveEditor();
runCode(false);
setAutoRunEnabled(autoRunEnabled, false);
renderErrorChecker();
startFirebaseMode();


// Final mobile desktop monitor sizing.
// The iframe always keeps a real 1366 x 768 CSS viewport, while only its visual
// scale changes. This prevents the monitor from drifting outside its card and
// keeps the whole desktop page visible in phone fullscreen/landscape.
let phonePreviewModeLatched = window.__mcsianPhonePreviewMode === true;

function isLikelyPhoneViewport() {
  const userAgent = navigator.userAgent || '';
  const userAgentDataMobile = navigator.userAgentData?.mobile === true;
  const mobileUserAgent = /Android|iPhone|iPod|Windows Phone|IEMobile|Opera Mini/i.test(userAgent);
  const coarsePointer = Boolean(window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches);
  const touchCapable = Number(navigator.maxTouchPoints || 0) > 0;
  const viewportWidth = Math.min(
    Number(window.innerWidth) || 9999,
    Number(window.visualViewport?.width) || 9999
  );
  const screenWidth = Number(window.screen?.width) || viewportWidth;
  const screenHeight = Number(window.screen?.height) || Number(window.innerHeight) || 9999;
  const shortestScreenSide = Math.min(screenWidth, screenHeight);
  const longestScreenSide = Math.max(screenWidth, screenHeight);
  const phoneSizedScreen = shortestScreenSide <= 760 && longestScreenSide <= 1100;
  const narrowResponsiveViewport = viewportWidth <= 760;
  const strongPhoneSignal = userAgentDataMobile || mobileUserAgent ||
    (phoneSizedScreen && (touchCapable || coarsePointer));

  // Once a phone/narrow mobile layout has been detected, keep it while the
  // device rotates to landscape. This prevents the phone UI from suddenly
  // turning back into desktop controls after rotation.
  if (strongPhoneSignal || narrowResponsiveViewport) {
    phonePreviewModeLatched = true;
    window.__mcsianPhonePreviewMode = true;
  }

  return strongPhoneSignal || phonePreviewModeLatched;
}

function applyPreviewDeviceMode() {
  const isPhone = isLikelyPhoneViewport();
  document.documentElement.dataset.deviceMode = isPhone ? 'phone' : 'desktop';

  // The phone preview always uses the single stacked flow. Split, Stacked,
  // and Big Preview remain desktop-only controls and are never needed here.
  if (isPhone && workspace) {
    workspace.dataset.layout = 'stacked';
  }

  if (!isPhone && previewPanel && previewFrame) {
    const shell = previewPanel.querySelector('.preview-frame-shell');
    previewPanel.classList.remove('mobile-desktop-preview', 'mobile-landscape-desktop-preview');
    desktopPreviewBtn?.classList.remove('active');
    desktopPreviewBtn?.setAttribute('aria-pressed', 'false');
    if (desktopPreviewBtn) {
      desktopPreviewBtn.textContent = 'Desktop View';
      desktopPreviewBtn.title = 'Phone-only desktop monitor preview';
    }
    if (shell) clearDesktopMonitorInlineSizing(shell);
  } else if (isPhone && desktopPreviewBtn) {
    const monitorEnabled = previewPanel?.classList.contains('mobile-desktop-preview');
    const label = monitorEnabled ? 'Phone' : 'Monitor';
    desktopPreviewBtn.classList.toggle('active', Boolean(monitorEnabled));
    desktopPreviewBtn.setAttribute('aria-pressed', String(Boolean(monitorEnabled)));
    desktopPreviewBtn.setAttribute('aria-label', monitorEnabled ? 'Return to phone preview' : 'Open desktop monitor preview');
    desktopPreviewBtn.dataset.mobileLabel = monitorEnabled ? '📱 Phone' : '🖥️ Monitor';
    desktopPreviewBtn.textContent = label;
    desktopPreviewBtn.title = monitorEnabled
      ? 'Return the output to normal phone width'
      : 'See the output as it appears on a desktop monitor';
  }

  return isPhone;
}

function isLandscapePhonePreviewFullscreen() {
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const isLandscape = viewportWidth > viewportHeight && viewportHeight <= 620;
  const isPreviewActive = document.body.classList.contains('preview-fullscreen-active') ||
    document.body.classList.contains('preview-inside-editor-fullscreen') ||
    document.fullscreenElement === previewPanel;
  return Boolean(isLikelyPhoneViewport() && isLandscape && isPreviewActive);
}

function clearDesktopMonitorInlineSizing(shell) {
  [
    'width', 'height', 'max-width', 'max-height', 'margin', 'position',
    'overflow', 'box-sizing', 'flex', 'align-self'
  ].forEach(prop => shell.style.removeProperty(prop));

  [
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'position', 'inset', 'top', 'right', 'bottom', 'left', 'margin',
    'transform', 'transform-origin', 'flex'
  ].forEach(prop => previewFrame.style.removeProperty(prop));
}

function setImportantStyle(element, property, value) {
  element.style.setProperty(property, value, 'important');
}

function updateDesktopMonitorPreviewSizing() {
  if (!previewPanel || !previewFrame) return;
  const shell = previewPanel.querySelector('.preview-frame-shell');
  if (!shell) return;

  // Never apply the phone monitor transform to a real desktop/computer view.
  // This also clears any stale inline scale left after rotating or resizing.
  if (!applyPreviewDeviceMode()) {
    return;
  }

  const forceLandscapeDesktop = isLandscapePhonePreviewFullscreen();
  previewPanel.classList.toggle('mobile-landscape-desktop-preview', forceLandscapeDesktop);
  const enabled = previewPanel.classList.contains('mobile-desktop-preview') || forceLandscapeDesktop;

  if (!enabled) {
    clearDesktopMonitorInlineSizing(shell);
    return;
  }

  const isFullPreview = document.body.classList.contains('preview-fullscreen-active') ||
    document.body.classList.contains('preview-inside-editor-fullscreen') ||
    document.fullscreenElement === previewPanel;

  const viewportWidth = Math.max(240, window.visualViewport?.width || window.innerWidth);
  const viewportHeight = Math.max(240, window.visualViewport?.height || window.innerHeight);
  const isLandscape = viewportWidth > viewportHeight;
  const desktopWidth = 1366;
  const desktopHeight = 768;

  let availableWidth;
  let availableHeight = Number.POSITIVE_INFINITY;

  if (isFullPreview) {
    // Reserve only a slim bottom toolbar. The remaining area is devoted to the
    // complete desktop canvas, centered both horizontally and vertically.
    const toolbarSpace = isLandscape ? 66 : 74;
    availableWidth = Math.max(220, viewportWidth - (isLandscape ? 18 : 20));
    availableHeight = Math.max(150, viewportHeight - toolbarSpace - 8);
  } else {
    const panelStyles = window.getComputedStyle(previewPanel);
    const horizontalPadding =
      (parseFloat(panelStyles.paddingLeft) || 0) +
      (parseFloat(panelStyles.paddingRight) || 0);
    const panelContentWidth = Math.max(220, previewPanel.clientWidth - horizontalPadding);
    availableWidth = Math.max(220, Math.min(panelContentWidth - 32, viewportWidth - 36));
  }

  let scale = isFullPreview
    ? Math.min(availableWidth / desktopWidth, availableHeight / desktopHeight)
    : Math.min(availableWidth / desktopWidth, 1);

  if (!Number.isFinite(scale) || scale <= 0) scale = 0.25;

  const outputWidth = Math.max(1, Math.floor(desktopWidth * scale));
  const outputHeight = Math.max(1, Math.floor(desktopHeight * scale));
  const shellSide = isFullPreview ? 8 : 18;
  const shellTop = isFullPreview ? 8 : 42;
  const shellBottom = isFullPreview ? 8 : 20;
  const frameLeft = Math.floor(shellSide / 2);
  const frameTop = isFullPreview ? 4 : 34;
  const shellWidth = outputWidth + shellSide;
  const shellHeight = outputHeight + shellTop + shellBottom;

  setImportantStyle(shell, 'position', 'relative');
  setImportantStyle(shell, 'box-sizing', 'border-box');
  setImportantStyle(shell, 'overflow', 'hidden');
  setImportantStyle(shell, 'width', `${shellWidth}px`);
  setImportantStyle(shell, 'height', `${shellHeight}px`);
  setImportantStyle(shell, 'max-width', isFullPreview ? 'calc(100dvw - 10px)' : 'calc(100% - 12px)');
  setImportantStyle(shell, 'max-height', isFullPreview ? `calc(100dvh - ${isLandscape ? 66 : 74}px)` : 'none');
  setImportantStyle(shell, 'margin', isFullPreview ? 'auto' : '12px auto');
  setImportantStyle(shell, 'align-self', 'center');
  setImportantStyle(shell, 'flex', '0 0 auto');

  setImportantStyle(previewFrame, 'position', 'absolute');
  setImportantStyle(previewFrame, 'inset', 'auto');
  setImportantStyle(previewFrame, 'top', `${frameTop}px`);
  setImportantStyle(previewFrame, 'left', `${frameLeft}px`);
  setImportantStyle(previewFrame, 'right', 'auto');
  setImportantStyle(previewFrame, 'bottom', 'auto');
  setImportantStyle(previewFrame, 'width', `${desktopWidth}px`);
  setImportantStyle(previewFrame, 'height', `${desktopHeight}px`);
  setImportantStyle(previewFrame, 'min-width', `${desktopWidth}px`);
  setImportantStyle(previewFrame, 'min-height', `${desktopHeight}px`);
  setImportantStyle(previewFrame, 'max-width', 'none');
  setImportantStyle(previewFrame, 'max-height', 'none');
  setImportantStyle(previewFrame, 'margin', '0');
  setImportantStyle(previewFrame, 'flex', 'none');
  setImportantStyle(previewFrame, 'transform', `scale(${scale})`);
  setImportantStyle(previewFrame, 'transform-origin', 'top left');
}

let desktopMonitorResizeFrame = 0;
function scheduleDesktopMonitorPreviewSizing(delay = 0) {
  window.clearTimeout(desktopMonitorResizeFrame);
  desktopMonitorResizeFrame = window.setTimeout(() => {
    window.requestAnimationFrame(updateDesktopMonitorPreviewSizing);
  }, delay);
}

applyPreviewDeviceMode();
if (isLikelyPhoneViewport() && workspace) {
  // Split/Stacked/Big Preview are desktop controls. The phone uses one normal
  // flow plus the dedicated Desktop Monitor button instead.
  workspace.dataset.layout = 'stacked';
}
window.addEventListener('resize', () => scheduleDesktopMonitorPreviewSizing(60));
window.visualViewport?.addEventListener('resize', () => scheduleDesktopMonitorPreviewSizing(60));
window.addEventListener('orientationchange', () => scheduleDesktopMonitorPreviewSizing(180));
window.addEventListener('load', () => {
  applyPreviewDeviceMode();
  scheduleDesktopMonitorPreviewSizing(100);
});
previewFrame?.addEventListener('load', () => scheduleDesktopMonitorPreviewSizing(60));
document.addEventListener('fullscreenchange', () => scheduleDesktopMonitorPreviewSizing(80));
document.addEventListener('webkitfullscreenchange', () => scheduleDesktopMonitorPreviewSizing(80));



