function createId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function tagSuggestion(label, insert, desc, hasClosing, selfClosing = false, type = 'tag') {
  return { label, insert, desc, hasClosing, selfClosing, type };
}

function codeSuggestion(label, insert, desc) {
  return { label, insert, desc, type: 'code' };
}

function getStorageForKey(key) {
  return SESSION_ONLY_STORAGE_KEYS.has(key) ? sessionStorage : localStorage;
}

function loadJSON(key, fallback) {
  try {
    const saved = getStorageForKey(key).getItem(key);
    return saved ? JSON.parse(saved) : clone(fallback);
  } catch (error) {
    console.warn(`Could not load ${key}`, error);
    return clone(fallback);
  }
}

function saveJSON(key, value) {
  try {
    getStorageForKey(key).setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key}`, error);
  }
}

function normalizeAssistanceSettings(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    enabled: source.enabled !== false,
    codeSuggestions: source.codeSuggestions !== false,
    codeHelper: source.codeHelper !== false,
    teacherFeedback: source.teacherFeedback !== false,
    superStudio: source.superStudio === true,
    autoSave: source.autoSave !== false,
    autoRunControl: source.autoRunControl !== false,
    externalLinksSamePreview: source.externalLinksSamePreview !== false,
    collaboration: source.collaboration === true,
    collaborationEdit: source.collaborationEdit !== false,
    collaborationMembers: source.collaborationMembers !== false
  };
}

function isStudentAssistanceFeatureEnabled(feature) {
  const settings = normalizeAssistanceSettings(studentAssistanceSettings);
  if (!settings.enabled) return false;
  return settings[feature] !== false;
}

function getAssistanceSettingsFromControls() {
  return normalizeAssistanceSettings({
    enabled: assistanceMasterToggle?.checked !== false,
    codeSuggestions: codeSuggestionsToggle?.checked !== false,
    codeHelper: codeHelperToggle?.checked !== false,
    teacherFeedback: teacherFeedbackToggle?.checked !== false,
    superStudio: superStudioToggle?.checked === true,
    autoSave: autoSaveControlToggle?.checked !== false,
    autoRunControl: autoRunControlToggle?.checked !== false,
    externalLinksSamePreview: externalLinksSamePreviewToggle?.checked !== false,
    collaboration: collaborationToggle?.checked === true,
    collaborationEdit: collaborationEditToggle?.checked !== false,
    collaborationMembers: collaborationMembersToggle?.checked !== false
  });
}

function setAssistanceSettingsStatus(message, type = '') {
  if (!assistanceSettingsStatus) return;
  const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  assistanceSettingsStatus.textContent = `${message} (${stamp})`;
  assistanceSettingsStatus.classList.remove('success', 'warning', 'error', 'attention');
  if (type) assistanceSettingsStatus.classList.add(type);
  assistanceSettingsStatus.classList.add('attention');
  window.clearTimeout(setAssistanceSettingsStatus.timer);
  setAssistanceSettingsStatus.timer = window.setTimeout(() => {
    assistanceSettingsStatus?.classList.remove('attention');
  }, 1800);
}

function syncAssistanceSettingsControls() {
  const settings = normalizeAssistanceSettings(studentAssistanceSettings);
  if (assistanceMasterToggle) assistanceMasterToggle.checked = settings.enabled;
  if (codeSuggestionsToggle) codeSuggestionsToggle.checked = settings.codeSuggestions;
  if (codeHelperToggle) codeHelperToggle.checked = settings.codeHelper;
  if (teacherFeedbackToggle) teacherFeedbackToggle.checked = settings.teacherFeedback;
  if (superStudioToggle) superStudioToggle.checked = settings.superStudio;
  if (autoSaveControlToggle) autoSaveControlToggle.checked = settings.autoSave;
  if (autoRunControlToggle) autoRunControlToggle.checked = settings.autoRunControl;
  if (externalLinksSamePreviewToggle) externalLinksSamePreviewToggle.checked = settings.externalLinksSamePreview;
  if (collaborationToggle) collaborationToggle.checked = settings.collaboration;
  if (collaborationEditToggle) collaborationEditToggle.checked = settings.collaborationEdit;
  if (collaborationMembersToggle) collaborationMembersToggle.checked = settings.collaborationMembers;
  [collaborationEditToggle, collaborationMembersToggle].forEach(toggle => {
    if (!toggle) return;
    toggle.disabled = !settings.collaboration;
    toggle.closest('.assistance-option')?.classList.toggle('option-disabled', !settings.collaboration);
  });

  studentAssistanceSettingsCard?.classList.toggle('master-disabled', !settings.enabled);
  const effectiveOn = settings.enabled && (settings.codeSuggestions || settings.codeHelper || settings.teacherFeedback || settings.superStudio || settings.autoSave || settings.autoRunControl || settings.collaboration || settings.collaborationEdit || settings.collaborationMembers);
  if (assistanceModeBadge) {
    assistanceModeBadge.textContent = effectiveOn ? 'Assistance ON' : 'Assistance OFF';
    assistanceModeBadge.classList.toggle('off', !effectiveOn);
  }
}

function updateAssistancePublishUI() {
  if (!publishAssistanceBtn) return;
  const canPublish = isTeacherAuthenticated();
  publishAssistanceBtn.textContent = canPublish ? 'Publish to All Students' : 'Login to Publish Globally';
  publishAssistanceBtn.classList.toggle('requires-login', !canPublish);
  publishAssistanceBtn.title = canPublish
    ? 'Save these controls to Firebase so every student device receives them.'
    : 'Local controls already work. Teacher login is required only for all student devices.';
}

function applyStudentAssistanceSettings(nextSettings, options = {}) {
  studentAssistanceSettings = normalizeAssistanceSettings(nextSettings);
  if (options.persist !== false) {
    saveJSON(STORAGE_KEYS.assistanceSettings, studentAssistanceSettings);
  }

  const suggestionsEnabled = isStudentAssistanceFeatureEnabled('codeSuggestions');
  const helperEnabled = isStudentAssistanceFeatureEnabled('codeHelper');
  const feedbackEnabled = isStudentAssistanceFeatureEnabled('teacherFeedback');
  const superStudioEnabled = isStudentAssistanceFeatureEnabled('superStudio');
  const autoRunControlEnabled = isStudentAssistanceFeatureEnabled('autoRunControl');
  const autoSaveEnabled = isStudentAssistanceFeatureEnabled('autoSave');

  document.body.classList.toggle('code-suggestions-disabled', !suggestionsEnabled);
  document.body.classList.toggle('code-helper-disabled', !helperEnabled);
  document.body.classList.toggle('teacher-feedback-disabled', !feedbackEnabled);
  document.body.classList.toggle('super-studio-disabled', !superStudioEnabled);
  document.body.classList.toggle('auto-run-control-disabled', !autoRunControlEnabled);
  document.body.classList.toggle('student-autosave-disabled', !autoSaveEnabled);
  if (!autoRunControlEnabled) {
    window.clearTimeout(autoRunTimer);
    autoRunEnabled = false;
    saveJSON(STORAGE_KEYS.autoRun, false);
  }
  updateAutoRunButtons();
  updateManualSaveControls();
  if (autoSaveEnabled && studentProjectDirty && isStudentProjectActive()) {
    queueStudentProjectSave('autosave-enabled');
  }

  if (!suggestionsEnabled && typeof hideSuggestions === 'function') hideSuggestions();
  if (!helperEnabled && typeof hideSmartInlineHint === 'function') hideSmartInlineHint();

  if (codeHelperFloatingBtn) {
    codeHelperFloatingBtn.classList.toggle('hidden', !helperEnabled);
    codeHelperFloatingBtn.setAttribute('aria-hidden', helperEnabled ? 'false' : 'true');
    codeHelperFloatingBtn.disabled = !helperEnabled;
  }
  if (!helperEnabled && errorCheckerPanel) {
    errorCheckerPanel.classList.add('hidden');
    errorCheckerPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('code-helper-open');
  }

  aiReviewTopBtn?.classList.toggle('hidden', !feedbackEnabled);
  if (runAiReviewBtn) runAiReviewBtn.disabled = !feedbackEnabled;
  aiReviewPanel?.classList.toggle('assistance-feature-hidden', !feedbackEnabled);

  syncAssistanceSettingsControls();
  updateAssistancePublishUI();
  document.dispatchEvent(new CustomEvent('studentAssistanceSettingsChanged', { detail: { settings: studentAssistanceSettings } }));
  if (typeof window.updateCollaborationFeatureVisibility === 'function') window.updateCollaborationFeatureVisibility();
  if (previewFrame && previewFrame.srcdoc && typeof runCode === 'function') {
    window.clearTimeout(applyStudentAssistanceSettings.previewRefreshTimer);
    applyStudentAssistanceSettings.previewRefreshTimer = window.setTimeout(() => runCode(false, { scroll: false, trackRun: false }), 120);
  }
  return studentAssistanceSettings;
}

function applyAssistanceSettingsFromControls(options = {}) {
  const settings = getAssistanceSettingsFromControls();
  applyStudentAssistanceSettings(settings);
  if (!options.silent) {
    const collabText = settings.collaboration ? 'Share button is now visible to students.' : 'Share button is now hidden from students.';
    setAssistanceSettingsStatus(`Applied on this browser. ${collabText}`, 'success');
    setStatus('Student assistance updated');
    if (applyAssistanceLocalBtn) {
      const oldText = applyAssistanceLocalBtn.textContent;
      applyAssistanceLocalBtn.textContent = 'Applied ✓';
      applyAssistanceLocalBtn.classList.add('button-confirmed');
      window.setTimeout(() => {
        applyAssistanceLocalBtn.textContent = oldText;
        applyAssistanceLocalBtn.classList.remove('button-confirmed');
      }, 1400);
    }
  }
  return settings;
}


function getFileExtension(language) {
  if (language === 'html') return '.html';
  if (language === 'css') return '.css';
  return '.js';
}

function getDefaultFileBase(language) {
  if (language === 'html') return 'index';
  if (language === 'css') return 'style';
  return 'script';
}

function cleanCodeFileName(value, language) {
  const extension = getFileExtension(language);
  const defaultBase = getDefaultFileBase(language);
  const defaultName = `${defaultBase}${extension}`;
  let raw = String(value || '').trim();
  if (!raw) return defaultName;

  raw = raw.replace(/[\\/]+/g, '-').replace(/[?#].*$/g, '').trim();
  const extensionPattern = new RegExp(`${extension.replace('.', '\\.')}$`, 'i');
  raw = raw.replace(extensionPattern, '');
  raw = raw
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);

  return raw ? `${raw}${extension}` : defaultName;
}

function normalizeCodeFileNames(raw = {}) {
  return {
    html: cleanCodeFileName(raw.html, 'html'),
    css: cleanCodeFileName(raw.css, 'css'),
    js: cleanCodeFileName(raw.js, 'js')
  };
}

function saveCodeFileNames() {
  codeFileNames = normalizeCodeFileNames(codeFileNames);
  saveJSON(STORAGE_KEYS.fileNames, codeFileNames);
}

function getCodeFileNames() {
  codeFileNames = normalizeCodeFileNames(codeFileNames);
  return codeFileNames;
}


