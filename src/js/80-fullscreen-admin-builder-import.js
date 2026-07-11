function ensureFullscreenActionBar() {
  if (!editorPanel) return null;
  let actions = document.getElementById('fullscreenEditorActions');
  if (!actions) {
    actions = document.createElement('div');
    actions.id = 'fullscreenEditorActions';
    actions.className = 'fullscreen-editor-actions hidden';
    actions.setAttribute('aria-label', 'Full editor actions');
    editorPanel.insertBefore(actions, editorPanel.firstChild);
  }

  const buttonSpecs = [
    {
      id: 'fullscreenRunBtn',
      className: 'primary-btn fullscreen-run-btn',
      text: '▶ Run',
      title: 'Run: Ctrl + Enter',
      onClick: handleFullscreenRunClick
    },
    {
      id: 'fullscreenAutoRunBtn',
      className: 'ghost-btn fullscreen-auto-run-btn',
      text: autoRunEnabled ? '⚡ Auto On' : '⚡ Auto Off',
      title: 'Auto update preview after typing',
      onClick: toggleAutoRun
    },
    {
      id: 'fullscreenResultBtn',
      className: 'success-btn fullscreen-result-btn',
      text: '✓ Result',
      title: 'Check result: Ctrl + Shift + Enter',
      onClick: handleFullscreenResultClick
    },
    {
      id: 'exitEditorStickyBtn',
      className: 'fullscreen-exit-btn',
      text: 'Exit Full',
      title: 'Exit full editor: Esc',
      onClick: exitFullEditor
    }
  ];

  buttonSpecs.forEach(spec => {
    let button = document.getElementById(spec.id);
    if (!button) {
      button = document.createElement('button');
      button.id = spec.id;
      button.type = 'button';
      actions.appendChild(button);
    }
    if (button.parentElement !== actions) actions.appendChild(button);
    button.className = spec.className;
    button.textContent = spec.text;
    button.title = spec.title;
    button.classList.remove('hidden');
    if (!button.dataset.fullscreenActionBound) {
      button.addEventListener('click', spec.onClick);
      button.dataset.fullscreenActionBound = 'true';
    }
  });

  updateAutoRunButtons();
  return actions;
}

function forceFullEditorControlsVisible() {
  const previewActive = document.body.classList.contains('preview-fullscreen-active') ||
    document.body.classList.contains('preview-inside-editor-fullscreen') ||
    previewMovedIntoEditor;

  if (!document.body.classList.contains('editor-fullscreen-active') || previewActive) {
    return;
  }

  const actions = ensureFullscreenActionBar();
  if (actions) {
    actions.classList.remove('hidden');
    actions.removeAttribute('aria-hidden');
  }

  [
    document.getElementById('fullscreenRunBtn'),
    document.getElementById('fullscreenResultBtn'),
    document.getElementById('exitEditorStickyBtn')
  ].forEach(button => {
    if (!button) return;
    button.classList.remove('hidden');
    button.removeAttribute('aria-hidden');
    button.disabled = false;
  });

  if (codeHelperFloatingBtn) {
    codeHelperFloatingBtn.classList.remove('hidden');
    codeHelperFloatingBtn.removeAttribute('aria-hidden');
    codeHelperFloatingBtn.disabled = false;
  }

  if (fullEditorBtn) fullEditorBtn.classList.add('hidden');
  if (exitEditorBtn) exitEditorBtn.classList.add('hidden');
}

function restoreEditorFullscreenAfterPreview() {
  window.clearTimeout(previewCloseToEditorTimer);
  document.body.classList.remove(
    'preview-fullscreen-active',
    'preview-has-back-editor',
    'preview-inside-editor-fullscreen',
    'preview-closing-to-editor'
  );

  if (previewMovedIntoEditor) {
    restorePreviewPanelFromEditorFullscreen();
  }

  document.body.classList.add('editor-fullscreen-active');
  returnToFullEditorAfterPreview = false;
  fullPreviewBtn?.classList.remove('hidden');
  exitPreviewBtn?.classList.add('hidden');
  ensureBackToEditorPreviewBtn()?.classList.add('hidden');
  ensurePreviewResultBtn()?.classList.add('hidden');
  ensurePreviewControlsToggle()?.classList.add('hidden');
  setPreviewControlsMenu(false);
  forceFullEditorControlsVisible();
  fitEditorToContent();
}

function scheduleFullEditorControlsRestore() {
  [0, 60, 180, 420].forEach(delay => {
    window.setTimeout(forceFullEditorControlsVisible, delay);
  });
}


function enterFullEditor() {
  if (document.body.classList.contains('preview-fullscreen-active')) {
    exitFullPreview();
  }

  document.body.classList.add('editor-fullscreen-active');
  syncSmartInlineHintHost();
  fullEditorBtn?.classList.add('hidden');
  exitEditorBtn?.classList.remove('hidden');
  const fullscreenActions = ensureFullscreenActionBar();
  fullscreenActions?.classList.remove('hidden');
  document.getElementById('exitEditorStickyBtn')?.classList.remove('hidden');
  document.getElementById('fullscreenRunBtn')?.classList.remove('hidden');
  document.getElementById('fullscreenResultBtn')?.classList.remove('hidden');
  ensurePreviewResultBtn()?.classList.add('hidden');
  hideSuggestions();

  const isSmallScreen = window.matchMedia('(max-width: 820px)').matches;
  if (!isSmallScreen && editorPanel?.requestFullscreen && !document.fullscreenElement) {
    editorPanel.requestFullscreen().catch(() => {
      // Browser may block fullscreen from some shortcuts; CSS fullscreen still works.
    });
  }

  forceFullEditorControlsVisible();
  scheduleFullEditorControlsRestore();
  setStatus('Full editor mode');
  fitEditorToContent();
  window.setTimeout(() => editor.focus(), 80);
}

function exitFullEditor(options = {}) {
  if (previewMovedIntoEditor || document.body.classList.contains('preview-inside-editor-fullscreen')) {
    exitFullPreview({ silent: true, keepNative: true });
  }
  document.body.classList.remove('editor-fullscreen-active');
  syncSmartInlineHintHost();
  fullEditorBtn?.classList.remove('hidden');
  exitEditorBtn?.classList.add('hidden');
  document.getElementById('fullscreenEditorActions')?.classList.add('hidden');
  document.getElementById('exitEditorStickyBtn')?.classList.add('hidden');
  document.getElementById('fullscreenRunBtn')?.classList.add('hidden');
  document.getElementById('fullscreenResultBtn')?.classList.add('hidden');
  if (!document.body.classList.contains('preview-fullscreen-active')) ensurePreviewResultBtn()?.classList.remove('hidden');
  hideSuggestions();

  if (!options.fromNative && document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }

  if (!options.silent) {
    setStatus('Editor restored');
  }
  fitEditorToContent();
  if (!options.skipFocus) {
    window.setTimeout(() => editor.focus(), 80);
  }
}

function getStoredAdminTab() {
  return localStorage.getItem(ADMIN_TAB_STORAGE_KEY) || 'students';
}

function setAdminTab(tabName = 'students') {
  const allowed = new Set(['students', 'assistance', 'activities']);
  const nextTab = allowed.has(tabName) ? tabName : 'students';
  localStorage.setItem(ADMIN_TAB_STORAGE_KEY, nextTab);

  adminTabButtons.forEach(button => {
    const isActive = button.dataset.adminTab === nextTab;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  adminTabPanels.forEach(panel => {
    const isActive = panel.dataset.adminPanel === nextTab;
    panel.classList.toggle('active', isActive);
  });
}

function initAdminTabs() {
  adminTabButtons.forEach(button => {
    if (button.dataset.adminTabBound === '1') return;
    button.dataset.adminTabBound = '1';
    button.addEventListener('click', () => setAdminTab(button.dataset.adminTab || 'students'));
  });
  setAdminTab(getStoredAdminTab());
}

async function openAdminPanel() {
  document.body.classList.add('admin-open');
  adminOverlay.classList.remove('hidden');
  initAdminTabs();
  syncAssistanceSettingsControls();
  updateAssistancePublishUI();
  setAssistanceSettingsStatus(isTeacherAuthenticated()
    ? 'Change the switches, then publish to update every student device.'
    : 'These switches can be used now on this browser. Login is only needed to publish globally.');
  const adminFirebaseReady = await initFirebaseSync();
  if (!adminFirebaseReady) {
    showTeacherLoginError(`Firebase is not ready. ${firebaseSync.lastError || 'Firebase SDK did not load. Check internet connection, CDN access, and make sure all updated files were uploaded.'}`);
  }
  updateTeacherLoginUI(firebaseSync.auth?.currentUser || firebaseSync.currentUser);

  if (isAdminPanelUnlocked()) {
    showAdminForm();
  } else {
    pinScreen.classList.remove('hidden');
    adminForm.classList.add('hidden');
    adminForm.classList.remove('visible');
    if (adminPassword) adminPassword.value = '';
    setAdminLoginMode('code');
    setTimeout(() => adminQuickCode?.focus(), 50);
  }
}

function closeAdminPanel() {
  adminOverlay.classList.add('hidden');
  setAdminTab(getStoredAdminTab());
  document.body.classList.remove('admin-open');
}

function showAdminForm(activityId = adminEditingActivityId) {
  if (!isAdminPanelUnlocked()) {
    adminUnlocked = false;
    pinScreen.classList.remove('hidden');
    adminForm.classList.add('hidden');
    adminForm.classList.remove('visible');
    return;
  }

  adminUnlocked = true;
  pinScreen.classList.add('hidden');
  adminForm.classList.remove('hidden');
  adminForm.classList.add('visible');
  initAdminTabs();
  if (adminStudentsCache.length) renderAdminStudentTracker();
  else loadAdminStudents().catch(error => console.warn('Student tracker load failed.', error));
  const editActivity = getActivityById(activityId) || activity || activities[0] || null;

  if (!editActivity) {
    adminEditingActivityId = '';
    renderAdminActivitySelect();
    adminActivityTitle.value = '';
    adminActivityDescription.value = '';
    adminPassingScore.value = 75;
    renderCriteriaEditor([]);
    if (typeof initManualRubricInputTable === 'function') initManualRubricInputTable();
    setStatus('No saved activities yet');
    return;
  }

  adminEditingActivityId = editActivity.id;
  renderAdminActivitySelect();
  adminActivityTitle.value = editActivity.title;
  adminActivityDescription.value = editActivity.description;
  adminPassingScore.value = editActivity.passingScore;
  renderCriteriaEditor(editActivity.criteria);
}

function editAdminActivity(activityId) {
  const editActivity = getActivityById(activityId);
  if (!editActivity) return;
  adminEditingActivityId = editActivity.id;
  showAdminForm(editActivity.id);
}

async function loginTeacher() {
  showTeacherLoginError('');
  const ready = await initFirebaseSync();
  if (!ready || !firebaseSync.auth || !firebaseSync.authModule) {
    showTeacherLoginError(`Firebase is not ready. ${firebaseSync.lastError || 'Firebase SDK did not load. Check internet connection, CDN access, and make sure all updated files were uploaded.'}`);
    return;
  }

  const fallbackTeacherEmail = getDefaultTeacherEmail();
  const email = (adminEmail.value.trim() || fallbackTeacherEmail).trim();
  const password = adminPassword.value;
  if (adminEmail && !adminEmail.value.trim() && fallbackTeacherEmail) adminEmail.value = fallbackTeacherEmail;

  if (!email || !password) {
    showTeacherLoginError('Please enter teacher email and password.');
    return;
  }

  try {
    setTeacherLoginLoading(true);
    const { signInWithEmailAndPassword, signOut } = firebaseSync.authModule;
    const credential = await signInWithEmailAndPassword(firebaseSync.auth, email, password);
    firebaseSync.currentUser = credential.user;

    if (!isAllowedTeacherEmail(credential.user.email)) {
      await signOut(firebaseSync.auth);
      adminUnlocked = false;
      showTeacherLoginError(`This account is signed in but not allowed to manage rubrics. Allowed teacher: ${getTeacherEmailText()}.`);
      return;
    }

    adminUnlocked = true;
    updateTeacherLoginUI(credential.user);
    showAdminForm();
    setStatus('Teacher logged in');
  } catch (error) {
    console.error('Teacher login failed', error);
    showTeacherLoginError(getFirebaseLoginErrorMessage(error));
  } finally {
    setTeacherLoginLoading(false);
  }
}

async function logoutTeacher() {
  setAdminQuickUnlocked(false);
  const ready = await initFirebaseSync();

  try {
    if (ready && firebaseSync.auth && firebaseSync.authModule && (firebaseSync.auth.currentUser || firebaseSync.currentUser)) {
      const { signOut } = firebaseSync.authModule;
      await signOut(firebaseSync.auth);
    }
    firebaseSync.currentUser = null;
    adminUnlocked = false;
    adminForm.classList.add('hidden');
    adminForm.classList.remove('visible');
    pinScreen.classList.remove('hidden');
    if (adminPassword) adminPassword.value = '';
    if (adminQuickCode) adminQuickCode.value = '';
    updateTeacherLoginUI(null);
    setAdminLoginMode('code');
    setStatus('Admin locked');
  } catch (error) {
    console.error('Teacher logout failed', error);
    await appAlert('Logout failed. Please try again.', { title: 'Logout failed', danger: true });
  }
}

async function unlockAdminWithCode() {
  showTeacherLoginError('');
  const ready = await initFirebaseSync();
  if (!ready || !firebaseSync.auth || !firebaseSync.authModule) {
    showTeacherLoginError(`Firebase is not ready. ${firebaseSync.lastError || 'Firebase SDK did not load. Check internet connection, CDN access, and make sure all updated files were uploaded.'}`);
    return;
  }

  const email = getDefaultTeacherEmail();
  const passwordCode = String(adminQuickCode?.value || '').trim();
  if (!email) {
    showTeacherLoginError('No teacher email is set in firebase-config.js. Add your teacher email to MCS_TEACHER_EMAILS or use Password mode.');
    return;
  }
  if (!passwordCode) {
    showTeacherLoginError('Enter the teacher account password as your Admin Code, or switch to Password mode.');
    return;
  }

  try {
    setTeacherLoginLoading(true, 'code');
    const { signInWithEmailAndPassword, signOut } = firebaseSync.authModule;
    const credential = await signInWithEmailAndPassword(firebaseSync.auth, email, passwordCode);
    firebaseSync.currentUser = credential.user;

    if (!isAllowedTeacherEmail(credential.user.email)) {
      await signOut(firebaseSync.auth);
      adminUnlocked = false;
      showTeacherLoginError(`This account is signed in but not allowed to manage rubrics. Allowed teacher: ${getTeacherEmailText()}.`);
      return;
    }

    adminUnlocked = true;
    if (adminEmail) adminEmail.value = credential.user.email || email;
    updateTeacherLoginUI(credential.user);
    showAdminForm();
    setStatus('Teacher logged in');
  } catch (error) {
    console.error('Teacher code login failed', error);
    showTeacherLoginError(getFirebaseLoginErrorMessage(error));
  } finally {
    setTeacherLoginLoading(false, 'code');
  }
}

function unlockAdmin() {
  loginTeacher();
}

function renderScaleLevelCells(criterion) {
  const normalized = normalizeCriterion(criterion);
  return rubricLevels.map(level => {
    const levelData = normalized.levels[level.key] || {};
    return `
      <td class="rubric-level-cell level-${escapeAttribute(level.key)}" data-level="${escapeAttribute(level.key)}" data-label="${escapeAttribute(level.label)}">
        <label class="rubric-score-label">
          <span>Score</span>
          <input class="level-points" type="number" min="0" step="0.5" value="${escapeAttribute(formatPoints(levelData.points))}" aria-label="${escapeAttribute(level.label)} score" />
        </label>
        <textarea class="level-description" rows="4" placeholder="Describe ${escapeAttribute(level.label)} performance...">${escapeHTML(levelData.description || '')}</textarea>
      </td>
    `;
  }).join('');
}

function renderCriteriaEditor(criteria) {
  const rows = criteria.map((criterion, index) => {
    const normalized = normalizeCriterion(criterion);
    return `
      <tr class="rubric-table-row" data-id="${escapeHTML(normalized.id || createId())}">
        <td class="rubric-criterion-cell" data-label="Criterion">
          <div class="criterion-title-row">
            <span class="criterion-number">${index + 1}</span>
            <input class="criterion-title criterion-title-big" type="text" value="${escapeAttribute(normalized.title)}" placeholder="Example: Content and HTML Structure" />
          </div>

          <div class="criterion-mini-grid">
            <label>
              Max
              <input class="criterion-points" type="number" min="0" step="0.5" value="${escapeAttribute(formatPoints(normalized.points))}" />
            </label>
            <label>
              Auto Check
              <select class="criterion-rule">
                ${ruleOptions.map(option => `
                  <option value="${option.value}" ${option.value === normalized.rule ? 'selected' : ''}>${escapeHTML(option.label)}</option>
                `).join('')}
              </select>
            </label>
            <label>
              Target / Keyword
              <input class="criterion-target" type="text" value="${escapeAttribute(normalized.target || '')}" placeholder="Optional: class=\"card\"" />
            </label>
          </div>

          <p class="helper-note criterion-help">${escapeHTML(ruleHelp[normalized.rule] || '')}</p>
          <button class="ghost-btn danger remove-criterion" type="button" aria-label="Remove criterion ${index + 1}">Remove row</button>
        </td>
        ${renderScaleLevelCells(normalized)}
      </tr>
    `;
  }).join('');

  criteriaEditor.innerHTML = `
    <div class="rubric-table-note">
      <strong>Table input:</strong> Row = criterion. Columns = performance levels. Put the score and description for each level.
    </div>
    <div class="rubric-table-scroll">
      <table class="teacher-rubric-table" aria-label="Teacher rubric table input">
        <thead>
          <tr>
            <th>Criteria</th>
            ${rubricLevels.map(level => `<th>${escapeHTML(level.label)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function collectLevelsFromCard(card, maxPoints) {
  const levels = {};
  card.querySelectorAll('.rubric-level-cell').forEach(cell => {
    const levelKey = cell.dataset.level;
    const pointsInput = cell.querySelector('.level-points');
    const descriptionInput = cell.querySelector('.level-description');
    const fallback = normalizeLevels(null, maxPoints)[levelKey];
    levels[levelKey] = {
      label: rubricLevels.find(item => item.key === levelKey)?.label || levelKey,
      points: Number(pointsInput?.value) || 0,
      description: descriptionInput?.value.trim() || fallback.description
    };
  });
  return levels;
}

function collectCriteriaFromEditor() {
  return [...criteriaEditor.querySelectorAll('.rubric-table-row')].map(row => {
    const maxPoints = Number(row.querySelector('.criterion-points').value) || 0;
    return normalizeCriterion({
      id: row.dataset.id || createId(),
      title: row.querySelector('.criterion-title').value.trim() || 'Untitled criterion',
      points: maxPoints,
      rule: row.querySelector('.criterion-rule').value,
      target: row.querySelector('.criterion-target').value.trim(),
      levels: collectLevelsFromCard(row, maxPoints)
    });
  }).filter(item => item.points > 0);
}

function addCriterion() {
  const currentCriteria = collectCriteriaFromEditor();
  currentCriteria.push(normalizeCriterion({
    id: createId(),
    title: 'New criterion / row',
    points: 4,
    rule: 'html_contains',
    target: ''
  }));
  renderCriteriaEditor(currentCriteria);
}

async function saveRubric(event) {
  event.preventDefault();

  if (!isAdminPanelUnlocked()) {
    showAdminForm();
    showTeacherLoginError('Please unlock Admin using Code or Password before saving rubric changes.');
    return;
  }

  const criteria = collectCriteriaFromEditor();

  if (!criteria.length) {
    await appAlert('Please add at least one rubric criterion.', { title: 'Rubric needed' });
    return;
  }

  const savedActivity = normalizeActivity({
    id: adminEditingActivityId || createId(),
    title: adminActivityTitle.value.trim() || `Activity ${activities.length + 1}`,
    description: adminActivityDescription.value.trim() || 'Complete the activity based on the teacher rubric.',
    passingScore: Number(adminPassingScore.value) || 75,
    criteria
  });

  const existingIndex = activities.findIndex(item => item.id === savedActivity.id);
  if (existingIndex >= 0) {
    activities[existingIndex] = savedActivity;
  } else {
    activities.push(savedActivity);
  }

  initManualRubricInputTable();
  saveActivities({ cloud: false });

  if (isTeacherAuthenticated()) {
    const cloudSaved = await saveActivitiesToCloud();
    if (!cloudSaved && hasFirebaseConfig()) {
      await appAlert('Saved locally, but Firebase rejected the online save. Check if you are logged in and if Firestore Rules were published.', { title: 'Firebase save issue', danger: true });
      return;
    }
  } else if (adminQuickUnlocked) {
    setStatus('Activity saved locally');
  }

  selectActivity(savedActivity.id, { keepLanguage: true });
  closeAdminPanel();
  setStatus(isTeacherAuthenticated() ? 'Activity saved' : 'Activity saved locally');
}

function createNewActivity() {
  adminEditingActivityId = createId();
  renderAdminActivitySelect();
  adminActivityTitle.value = '';
  adminActivityDescription.value = '';
  adminPassingScore.value = 75;
  renderCriteriaEditor([]);
  if (typeof initManualRubricInputTable === 'function') initManualRubricInputTable();
  setStatus('Blank activity form ready');
}

function duplicateActivity() {
  const source = getActivityById(adminEditingActivityId) || activity;
  if (!source) {
    appAlert('No saved activity to duplicate yet.', { title: 'Nothing to duplicate' });
    return;
  }
  const copy = normalizeActivity({
    ...clone(source),
    id: createId(),
    title: `${source.title} (Copy)`,
    criteria: source.criteria.map(criterion => normalizeCriterion({ ...criterion, id: createId() }))
  });

  activities.push(copy);
  saveActivities();
  codeByActivity[copy.id] = normalizeCodeStore(codeByActivity[source.id] || starterCode);
  saveCodeByActivity();
  selectActivity(copy.id, { skipSave: true });
  showAdminForm(copy.id);
  setStatus('Activity duplicated');
}

async function deleteActivity() {
  const activityToDelete = getActivityById(adminEditingActivityId);
  if (!activityToDelete) {
    appAlert('No saved activity selected.', { title: 'No activity selected' });
    return;
  }
  if (!await appConfirm(`Delete "${activityToDelete.title}"? Students will no longer see this activity.`, { title: 'Delete activity', danger: true, confirmText: 'Delete' })) return;

  activities = activities.filter(item => item.id !== activityToDelete.id);
  delete codeByActivity[activityToDelete.id];
  saveActivities();
  saveCodeByActivity();

  if (selectedActivityId === activityToDelete.id) {
    selectActivity('', { skipSave: true });
  }

  const nextActivity = activities[0] || null;
  showAdminForm(nextActivity?.id || '');
  setStatus('Activity deleted');
}

async function restoreDefaultRubric() {
  const existing = getActivityById(adminEditingActivityId) || activity;
  if (!existing) {
    appAlert('No saved activity selected yet. Click + New Activity or save a rubric first.', { title: 'No saved activity' });
    return;
  }
  if (!await appConfirm('Restore the default rubric for this activity?', { title: 'Restore default rubric', danger: true })) return;
  const restored = normalizeActivity({
    ...clone(defaultActivity),
    id: existing.id,
    title: existing.title || defaultActivity.title
  });

  const existingIndex = activities.findIndex(item => item.id === restored.id);
  activities[existingIndex] = restored;
  saveActivities();
  selectActivity(restored.id, { keepLanguage: true });
  showAdminForm(restored.id);
  setStatus('Default rubric restored');
}

function getRubricImageEndpoint() {
  return String(window.MCS_RUBRIC_IMAGE_ENDPOINT || '').trim();
}

function isRubricImageImportEnabled() {
  return window.MCS_RUBRIC_IMAGE_IMPORT_ENABLED !== false;
}

function setRubricImportStatus(message, type = '') {
  if (!rubricImageStatus) return;
  rubricImageStatus.textContent = message || '';
  rubricImageStatus.className = `helper-note rubric-import-status ${type}`.trim();
}

function getSelectedRubricImageFile() {
  return rubricImageInput?.files?.[0] || null;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

function clearRubricImageImport() {
  if (rubricImageInput) rubricImageInput.value = '';
  if (rubricImagePreview) rubricImagePreview.removeAttribute('src');
  if (rubricExtractedText) rubricExtractedText.value = '';
  rubricImagePreviewWrap?.classList.add('hidden');
  setRubricImportStatus('No image selected yet.');
}

async function previewRubricImage() {
  const file = getSelectedRubricImageFile();
  if (!file) {
    clearRubricImageImport();
    return;
  }

  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
    setRubricImportStatus('Please select a PNG, JPG, or WEBP image.', 'error');
    return;
  }

  if (file.size > 6 * 1024 * 1024) {
    setRubricImportStatus('Image is too large. Please use an image below 6 MB.', 'error');
    return;
  }

  const dataUrl = await readFileAsDataURL(file);
  if (rubricImagePreview) rubricImagePreview.src = dataUrl;
  rubricImagePreviewWrap?.classList.remove('hidden');
  setRubricImportStatus(`Selected: ${file.name}. Click Read Image & Fill Table.`, 'ready');
}

function normalizeImportedActivity(rawActivity) {
  const safe = rawActivity && typeof rawActivity === 'object' ? rawActivity : {};
  const rawCriteria = Array.isArray(safe.criteria) ? safe.criteria : [];
  const criteria = rawCriteria.map((criterion, index) => {
    const points = getMaxPointsFromCriterion(criterion) || Number(criterion.points) || 4;
    const levels = criterion.levels && typeof criterion.levels === 'object'
      ? criterion.levels
      : rubricLevels.reduce((acc, level) => {
          const levelText = criterion[level.key] || criterion[level.label] || '';
          acc[level.key] = {
            label: level.label,
            points: defaultLevelPoints(points)[level.key],
            description: String(levelText || defaultLevelDescriptions[level.key] || '').trim()
          };
          return acc;
        }, {});

    return normalizeCriterion({
      id: createId(),
      title: criterion.title || criterion.criterion || criterion.name || `Criterion ${index + 1}`,
      points,
      rule: criterion.rule || 'smart_rubric',
      target: criterion.target || '',
      levels
    });
  });

  return normalizeActivity({
    id: adminEditingActivityId || createId(),
    title: safe.title || safe.activityTitle || 'Imported Rubric Activity',
    description: safe.description || safe.instructions || 'Complete the activity based on the imported rubric. Review the rubric table before saving.',
    passingScore: Number(safe.passingScore) || 75,
    criteria: criteria.length ? criteria : clone(defaultActivity.criteria).map(item => normalizeCriterion({ ...item, id: createId() }))
  });
}

function applyImportedActivityToAdminForm(importedActivity) {
  const normalized = normalizeImportedActivity(importedActivity);
  adminActivityTitle.value = normalized.title;
  adminActivityDescription.value = normalized.description;
  adminPassingScore.value = normalized.passingScore;
  renderCriteriaEditor(normalized.criteria);
  setRubricImportStatus('Rubric imported. Please review the table, then click Save Activity.', 'success');
  setStatus('Rubric imported');
}

function getFallbackRubricImportMessage() {
  return 'No online rubric reader is connected, so this app will use the built-in browser image reader. Clear screenshots work best.';
}

function loadRubricOCRLibrary() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (window.__rubricOCRPromise) return window.__rubricOCRPromise;

  window.__rubricOCRPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-mcs-rubric-ocr]');
    const script = existing || document.createElement('script');
    const timeoutId = window.setTimeout(() => {
      reject(new Error('The rubric image reader took too long to load. Check the connection and try again.'));
    }, 15000);

    const finish = (error = null) => {
      window.clearTimeout(timeoutId);
      if (error) reject(error);
      else if (window.Tesseract) resolve(window.Tesseract);
      else reject(new Error('The rubric image reader loaded incorrectly. Please try again.'));
    };

    script.addEventListener('load', () => finish(), { once: true });
    script.addEventListener('error', () => finish(new Error('Could not load the rubric image reader. Check the internet connection.')), { once: true });

    if (!existing) {
      script.dataset.mcsRubricOcr = 'true';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      document.head.appendChild(script);
    }
  }).catch(error => {
    window.__rubricOCRPromise = null;
    document.querySelector('script[data-mcs-rubric-ocr]')?.remove();
    throw error;
  });

  return window.__rubricOCRPromise;
}

function normalizeOCRText(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .replace(/[|¦]/g, ' | ')
    .replace(/[•●▪■]/g, '\n- ')
    .replace(/\t+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeRubricLevelKey(label) {
  const value = String(label || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (value.includes('excellent')) return 'excellent';
  if (value.includes('good')) return 'good';
  if (value.includes('fair')) return 'fair';
  if (value.includes('need') && value.includes('improvement')) return 'needsImprovement';
  if (value.includes('poor') || value.includes('beginning')) return 'needsImprovement';
  return '';
}

function countRubricLevelMarkers(text) {
  return [...String(text || '').matchAll(/excellent|good|fair|needs\s*improvement/gi)].length;
}

function cleanCriterionTitle(rawTitle) {
  return String(rawTitle || '')
    .replace(/^\s*(criteria?|criterion)\s*[:\-]?\s*/i, '')
    .replace(/^\s*[-•*]?\s*\d+[.)-]?\s*/, '')
    .replace(/\(?\b\d+(?:\.\d+)?\s*(?:pts?|points?)\)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractScoreValue(text, fallback = null) {
  const source = String(text || '');
  const rangeMatch = source.match(/(\d+(?:\.\d+)?)\s*[-–/]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) return Math.max(Number(rangeMatch[1]), Number(rangeMatch[2]));
  const pointMatch = source.match(/(?:^|\b)(\d+(?:\.\d+)?)(?:\s*(?:pts?|points?|\/\s*\d+))?/i);
  if (pointMatch) return Number(pointMatch[1]);
  return fallback;
}

function stripLeadingScoreText(text) {
  return String(text || '')
    .replace(/^\s*[(:-]*\s*(?:\d+(?:\.\d+)?\s*[-–/]\s*)?\d+(?:\.\d+)?\s*(?:pts?|points?)?\s*[):.-]*\s*/i, '')
    .replace(/^\s*[:\-–|]+\s*/, '')
    .trim();
}

function extractGlobalLevelPoints(text) {
  const defaults = {};
  rubricLevels.forEach(level => {
    const labelPattern = level.label.replace(/\s+/g, '\\s*');
    const regex = new RegExp(labelPattern + '\\s*[:\-–]?\\s*(\\d+(?:\\.\\d+)?)(?:\\s*[-–/]\\s*(\\d+(?:\\.\\d+)?))?', 'i');
    const match = String(text || '').match(regex);
    if (match) {
      const points = Math.max(Number(match[1] || 0), Number(match[2] || 0));
      if (Number.isFinite(points) && points >= 0) defaults[level.key] = points;
    }
  });
  return defaults;
}

function getGenericRubricDescription(levelKey, criterionTitle) {
  const title = criterionTitle || 'this criterion';
  if (levelKey === 'excellent') return `Excellent performance in ${title}.`;
  if (levelKey === 'good') return `Good performance in ${title}.`;
  if (levelKey === 'fair') return `Fair performance in ${title}.`;
  return `Needs improvement in ${title}.`;
}

function splitLineByRubricLevels(text) {
  const source = String(text || '');
  const regex = /(Excellent|Good|Fair|Needs\s*Improvement)/gi;
  const matches = [...source.matchAll(regex)];
  if (matches.length < 2) return null;
  const title = cleanCriterionTitle(source.slice(0, matches[0].index));
  const sections = {};
  matches.forEach((match, index) => {
    const key = normalizeRubricLevelKey(match[0]);
    if (!key) return;
    const start = match.index + match[0].length;
    const end = index < matches.length - 1 ? matches[index + 1].index : source.length;
    sections[key] = source.slice(start, end).trim(' :-|');
  });
  return { title, sections };
}

function isLikelyHeaderLine(line) {
  const text = String(line || '').toLowerCase();
  if (!text) return true;
  return (text.includes('criteria') && countRubricLevelMarkers(text) >= 2)
    || /^activity\s*title/i.test(text)
    || /^passing\s*score/i.test(text)
    || /^teacher/i.test(text)
    || /^upload\s+rubric/i.test(text);
}

function isPotentialCriterionTitle(line) {
  const text = cleanCriterionTitle(line);
  if (!text || text.length < 4) return false;
  if (isLikelyHeaderLine(text)) return false;
  if (countRubricLevelMarkers(text) >= 2) return false;
  if (/^(excellent|good|fair|needs\s*improvement)\b/i.test(text)) return false;
  return true;
}

function guessCriterionRule(criterionTitle, descriptionText = '') {
  const combinedText = `${criterionTitle} ${descriptionText}`;
  const source = combinedText.toLowerCase();
  let target = '';

  const quoted = combinedText.match(/["“”']([^"“”']{2,40})["“”']/);
  if (quoted) target = quoted[1].trim();

  const tagTarget = combinedText.match(/<([a-z0-9-]+)>/i);
  if (tagTarget) target = `<${tagTarget[1].toLowerCase()}`;

  const classOrIdTarget = combinedText.match(/(?:class|id)\s*=\s*["“”']?([a-z0-9_-]{2,40})/i);
  if (!target && classOrIdTarget) target = classOrIdTarget[1].trim();

  const cssPropertyMatch = source.match(/\b(background-color|border-radius|font-family|font-size|text-align|box-shadow|grid-template-columns|justify-content|align-items|background|padding|margin|border|display|color|width|height|gap)\b/);
  const jsKeywordMatch = source.match(/\b(addEventListener|onclick|textContent|innerHTML|classList|querySelector|getElementById|function|alert|console\.log)\b/i);

  // HTML structure and semantic tags
  if (/semantic\s+tags?|semantic\s+html|header|footer|nav|main|section|article|aside/.test(source)) {
    return { rule: 'has_semantic_tags', target: '' };
  }
  if (/(complete|full|basic|required|proper).*(html|document|structure)|doctype|<html|<head|<title|<body/.test(source)) {
    return { rule: 'full_html_structure', target: '' };
  }
  if (/closing tag|closed tag|properly closed|balance[ds]? tag|well[-\s]?organized\s+structure|correct\s+structure/.test(source)) {
    return { rule: 'balanced_html_tags', target: '' };
  }

  // Specific HTML elements
  if (/button or link|link or button|clickable/.test(source)) return { rule: 'has_button_or_link', target: '' };
  if (/heading|header\s+text|title\s+heading|\bh1\b|\bh2\b|\bh3\b/.test(source)) return { rule: 'has_heading', target };
  if (/paragraph|\bp\s*tag|\bp\b/.test(source)) return { rule: 'has_paragraph', target };
  if (/button/.test(source)) return { rule: 'has_button', target };
  if (/hyperlink|anchor|\blink\b|\ba\s*tag/.test(source)) return { rule: 'has_link', target };
  if (/image|picture|photo|\bimg\b/.test(source)) return { rule: 'has_image', target };
  if (/list|bullet|numbered|\bul\b|\bol\b|\bli\b/.test(source)) return { rule: 'has_list', target };

  // CSS/design criteria
  if (/css|style|styling|technical application|visual appeal|design|presentation|layout|aesthetic|consistent design|readability|creative|polish|color|background|font|spacing|border/.test(source)) {
    return { rule: 'uses_css_property', target: cssPropertyMatch ? cssPropertyMatch[1].toLowerCase() : '' };
  }

  // JavaScript criteria
  if (/event listener|onclick|interaction|interactive|click event|button action/.test(source)) return { rule: 'uses_event_listener', target: '' };
  if (/change(s|d)? .*page|dom|innerhtml|textcontent|classlist|style\.|setattribute|appendchild|createelement/.test(source)) return { rule: 'js_changes_page', target: '' };
  if (/javascript|script|function|variable|condition|loop/.test(source)) {
    return { rule: 'js_contains', target: jsKeywordMatch ? jsKeywordMatch[1] : target };
  }
  if (/runtime error|no error|error-free|without errors|working code/.test(source)) return { rule: 'no_runtime_error', target: '' };

  // Output/content criteria
  if (/visible text|readable content|content shown|output text|informative page|difficult to read|easy to read/.test(source)) return { rule: 'output_has_visible_text', target: '' };
  if (/output|preview|display|shows?/.test(source)) return { rule: 'output_contains', target };

  // General instructions / requirements are hard to judge automatically, so use minimum effort.
  if (/following instructions|requirements?|completed|accurately|met|expectations|incomplete|missing|effort/.test(source)) {
    return { rule: 'smart_rubric', target: '' };
  }

  if (/html|tag|element|class|id|structure/.test(source)) return { rule: 'html_contains', target };
  return { rule: 'minimum_effort', target: '' };
}

function buildCriterionFromParsedParts(title, sections, globalPoints = {}) {
  const cleanTitle = cleanCriterionTitle(title) || 'Untitled criterion';
  const explicitMax = extractScoreValue(title, null);
  const sectionScores = {};
  const descriptions = {};

  rubricLevels.forEach(level => {
    const rawText = sections[level.key] || '';
    const score = extractScoreValue(rawText, globalPoints[level.key] ?? null);
    if (Number.isFinite(score)) sectionScores[level.key] = score;
    descriptions[level.key] = stripLeadingScoreText(rawText) || getGenericRubricDescription(level.key, cleanTitle);
  });

  const maxPoints = explicitMax || Math.max(...Object.values(sectionScores).filter(Number.isFinite), 4);
  const defaults = defaultLevelPoints(maxPoints);
  const levels = rubricLevels.reduce((acc, level) => {
    acc[level.key] = {
      label: level.label,
      points: Number.isFinite(sectionScores[level.key]) ? sectionScores[level.key] : (globalPoints[level.key] ?? defaults[level.key]),
      description: descriptions[level.key]
    };
    return acc;
  }, {});

  const ruleInfo = guessCriterionRule(cleanTitle, Object.values(descriptions).join(' '));
  return normalizeCriterion({
    id: createId(),
    title: cleanTitle,
    points: maxPoints,
    rule: ruleInfo.rule,
    target: ruleInfo.target,
    levels
  });
}

function parseCriteriaFromRubricTextGeneral(text) {
  const normalizedText = normalizeOCRText(text);
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  const globalPoints = extractGlobalLevelPoints(normalizedText);
  const criteria = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || isLikelyHeaderLine(line)) continue;

    const inlineSplit = splitLineByRubricLevels(line);
    if (inlineSplit && inlineSplit.title) {
      criteria.push(buildCriterionFromParsedParts(inlineSplit.title, inlineSplit.sections, globalPoints));
      continue;
    }

    if (isPotentialCriterionTitle(line)) {
      const sectionLines = {};
      let used = 0;
      let j = i + 1;
      while (j < lines.length && used < 8) {
        const nextLine = lines[j];
        if (!nextLine) break;
        if (isPotentialCriterionTitle(nextLine) && !/^(excellent|good|fair|needs\s*improvement)\b/i.test(nextLine)) break;
        const levelMatch = nextLine.match(/^(Excellent|Good|Fair|Needs\s*Improvement)\b\s*[:\-–|]?\s*(.*)$/i);
        if (levelMatch) {
          const key = normalizeRubricLevelKey(levelMatch[1]);
          sectionLines[key] = levelMatch[2].trim();
          used += 1;
          j += 1;
          continue;
        }
        if (countRubricLevelMarkers(nextLine) >= 2) {
          const parsed = splitLineByRubricLevels(nextLine);
          if (parsed) {
            Object.assign(sectionLines, parsed.sections);
            used += 1;
            j += 1;
            break;
          }
        }
        if (Object.keys(sectionLines).length) {
          const lastKey = Object.keys(sectionLines)[Object.keys(sectionLines).length - 1];
          sectionLines[lastKey] = `${sectionLines[lastKey]} ${nextLine}`.trim();
          used += 1;
          j += 1;
          continue;
        }
        break;
      }

      if (Object.keys(sectionLines).length >= 2) {
        criteria.push(buildCriterionFromParsedParts(line, sectionLines, globalPoints));
        i = j - 1;
      }
    }
  }

  if (criteria.length) return criteria;

  const fallbackLines = lines.filter(line => isPotentialCriterionTitle(line)).slice(0, 8);
  return fallbackLines.map((line, index) => {
    const title = cleanCriterionTitle(line) || `Criterion ${index + 1}`;
    const ruleInfo = guessCriterionRule(title, '');
    return normalizeCriterion({
      id: createId(),
      title,
      points: 4,
      rule: ruleInfo.rule,
      target: ruleInfo.target,
      levels: normalizeLevels(null, 4)
    });
  });
}

function guessImportedActivityTitle(lines) {
  const candidates = lines.filter(line => {
    const lower = line.toLowerCase();
    return line.length > 4
      && line.length < 100
      && !isLikelyHeaderLine(line)
      && !/^(excellent|good|fair|needs\s*improvement)\b/i.test(lower)
      && !/^\d+(?:\.\d+)?\s*(pts?|points?)?$/i.test(lower);
  });
  const explicit = candidates.find(line => /activity|performance task|project|rubric/i.test(line));
  return explicit || candidates[0] || 'Imported Rubric Activity';
}

function guessImportedActivityDescription(lines, title) {
  const titleIndex = lines.findIndex(line => line === title);
  const from = titleIndex >= 0 ? titleIndex + 1 : 1;
  const descriptionLines = lines.slice(from, Math.min(from + 4, lines.length))
    .filter(line => !isLikelyHeaderLine(line) && countRubricLevelMarkers(line) < 2 && line.length > 12);
  if (descriptionLines.length) return descriptionLines.join(' ');
  return 'Complete the activity based on the uploaded rubric. Review the imported rows before saving.';
}

function parseImportedActivityFromText(text) {
  const normalizedText = normalizeOCRText(text);
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  const title = guessImportedActivityTitle(lines);
  const description = guessImportedActivityDescription(lines, title);
  const passingMatch = normalizedText.match(/passing\s*score\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
  const passingScore = passingMatch ? Number(passingMatch[1]) : 75;
  const criteria = parseCriteriaFromRubricText(normalizedText);
  return normalizeImportedActivity({ title, description, passingScore, criteria });
}

function fillRubricTableFromExtractedText() {
  const text = rubricExtractedText?.value?.trim() || '';
  if (!text) {
    setRubricImportStatus('No extracted text yet. Upload an image first or paste rubric text into the box.', 'error');
    return;
  }
  const imported = parseImportedActivityFromText(text);
  applyImportedActivityToAdminForm(imported);
}


/* Fixed 5-column rubric reader for Sir JR's rubric image format.
   Expected columns:
   1) Criteria
   2) Excellent
   3) Good
   4) Fair
   5) Needs Improvement
*/

function safeRubricWordText(word) {
  return String(word?.text || word?.symbols?.map(symbol => symbol.text).join('') || '').trim();
}

function getRubricWordBox(word) {
  const box = word?.bbox || word?.boundingBox || {};
  const x0 = Number(box.x0 ?? box.left ?? box.x ?? 0);
  const y0 = Number(box.y0 ?? box.top ?? box.y ?? 0);
  const x1 = Number(box.x1 ?? (Number.isFinite(Number(box.width)) ? x0 + Number(box.width) : x0));
  const y1 = Number(box.y1 ?? (Number.isFinite(Number(box.height)) ? y0 + Number(box.height) : y0));
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, h: Math.max(1, y1 - y0) };
}

function normalizeRubricOCRWords(words) {
  return (Array.isArray(words) ? words : [])
    .map(word => {
      const text = safeRubricWordText(word);
      const box = getRubricWordBox(word);
      return text ? { text, ...box } : null;
    })
    .filter(Boolean)
    .filter(word => Number.isFinite(word.cx) && Number.isFinite(word.cy));
}

function groupRubricWordsIntoLines(words) {
  const cleanWords = normalizeRubricOCRWords(words).sort((a, b) => a.cy - b.cy || a.x0 - b.x0);
  const lines = [];

  cleanWords.forEach(word => {
    const tolerance = Math.max(8, word.h * 0.65);
    let line = lines.find(item => Math.abs(item.cy - word.cy) <= tolerance);
    if (!line) {
      line = { cy: word.cy, words: [] };
      lines.push(line);
    }
    line.words.push(word);
    line.cy = line.words.reduce((sum, item) => sum + item.cy, 0) / line.words.length;
  });

  return lines
    .map(line => ({
      cy: line.cy,
      words: line.words.sort((a, b) => a.x0 - b.x0),
      text: line.words.sort((a, b) => a.x0 - b.x0).map(word => word.text).join(' ')
    }))
    .sort((a, b) => a.cy - b.cy);
}

function detectFiveRubricColumnCenters(words) {
  const cleanWords = normalizeRubricOCRWords(words);
  if (!cleanWords.length) return null;

  const byText = cleanWords.map(word => ({ ...word, lower: word.text.toLowerCase().replace(/[^a-z]/g, '') }));
  const findCenter = patterns => {
    const matches = byText.filter(word => patterns.some(pattern => pattern.test(word.lower)));
    if (!matches.length) return null;
    return matches.reduce((sum, word) => sum + word.cx, 0) / matches.length;
  };

  const criteriaX = findCenter([/^criteria?$/, /^criterion$/]);
  const excellentX = findCenter([/^excellent$/, /^advanced$/, /^outstanding$/]);
  const goodX = findCenter([/^good$/, /^proficient$/]);
  const fairX = findCenter([/^fair$/, /^developing$/, /^satisfactory$/]);

  const needsWords = byText.filter(word => /^needs?$/.test(word.lower));
  const improvementWords = byText.filter(word => /^improvements?$/.test(word.lower));
  let needsX = null;
  if (needsWords.length && improvementWords.length) {
    const pairs = [];
    needsWords.forEach(needs => {
      improvementWords.forEach(improvement => {
        const distance = Math.abs(needs.cy - improvement.cy) + Math.abs(needs.cx - improvement.cx) * 0.15;
        pairs.push({ needs, improvement, distance });
      });
    });
    pairs.sort((a, b) => a.distance - b.distance);
    const best = pairs[0];
    needsX = best ? (best.needs.cx + best.improvement.cx) / 2 : null;
  } else {
    needsX = findCenter([/^needsimprovement$/, /^poor$/, /^beginning$/]);
  }

  let centers = [criteriaX, excellentX, goodX, fairX, needsX];
  const validCenters = centers.filter(value => Number.isFinite(value));

  if (validCenters.length >= 4) {
    const minX = Math.min(...validCenters);
    const maxX = Math.max(...validCenters);
    const width = Math.max(1, maxX - minX);
    centers = centers.map((value, index) => Number.isFinite(value) ? value : minX + (width * index / 4));
    return centers.sort((a, b) => a - b);
  }

  const minX = Math.min(...cleanWords.map(word => word.x0));
  const maxX = Math.max(...cleanWords.map(word => word.x1));
  const width = Math.max(1, maxX - minX);
  return [0.1, 0.32, 0.52, 0.7, 0.88].map(ratio => minX + width * ratio);
}

function getColumnIndexFromCenters(x, centers) {
  if (!Array.isArray(centers) || centers.length !== 5) return 0;
  const boundaries = [
    -Infinity,
    (centers[0] + centers[1]) / 2,
    (centers[1] + centers[2]) / 2,
    (centers[2] + centers[3]) / 2,
    (centers[3] + centers[4]) / 2,
    Infinity
  ];
  for (let i = 0; i < 5; i += 1) {
    if (x >= boundaries[i] && x < boundaries[i + 1]) return i;
  }
  return 0;
}

function lineWordsToFiveCells(line, centers) {
  const cells = ['', '', '', '', ''];
  (line?.words || []).forEach(word => {
    const index = getColumnIndexFromCenters(word.cx, centers);
    cells[index] = `${cells[index]} ${word.text}`.trim();
  });
  return cells.map(cell => cell.trim());
}

function isFiveColumnHeaderCells(cells) {
  const joined = cells.join(' ').toLowerCase();
  return /criteria?|criterion/.test(joined)
    && /excellent/.test(joined)
    && /\bgood\b/.test(joined)
    && /\bfair\b/.test(joined)
    && /needs?\s*improvement/.test(joined);
}

function normalizeFiveColumnCellsToCriterion(cells, globalPoints = {}) {
  const title = cleanCriterionTitle(cells[0]);
  if (!title || title.length < 3) return null;

  const sections = {
    excellent: cells[1] || '',
    good: cells[2] || '',
    fair: cells[3] || '',
    needsImprovement: cells[4] || ''
  };

  const hasUsefulLevelText = Object.values(sections).some(value => String(value || '').trim().length > 4);
  if (!hasUsefulLevelText) return null;

  return buildCriterionFromParsedParts(title, sections, globalPoints);
}

function parseFiveColumnRubricFromOCRResult(ocrResult) {
  const words = ocrResult?.data?.words || ocrResult?.words || [];
  const cleanWords = normalizeRubricOCRWords(words);
  if (cleanWords.length < 10) return [];

  const centers = detectFiveRubricColumnCenters(cleanWords);
  if (!centers) return [];

  const lines = groupRubricWordsIntoLines(cleanWords);
  const globalPoints = extractGlobalLevelPoints(ocrResult?.data?.text || ocrResult?.text || '');
  const rows = [];
  let current = null;

  lines.forEach(line => {
    const cells = lineWordsToFiveCells(line, centers);
    const rowText = cells.join(' ').trim();
    if (!rowText || isFiveColumnHeaderCells(cells) || isLikelyHeaderLine(rowText)) return;

    const hasCriteriaText = cells[0].trim().length > 0;
    const hasLevelText = cells.slice(1).some(cell => cell.trim().length > 0);

    if (hasCriteriaText && hasLevelText) {
      current = cells;
      rows.push(current);
      return;
    }

    if (current && hasLevelText) {
      for (let i = 1; i < 5; i += 1) {
        if (cells[i]) current[i] = `${current[i]} ${cells[i]}`.trim();
      }
      return;
    }

    if (current && hasCriteriaText && !hasLevelText) {
      current[0] = `${current[0]} ${cells[0]}`.trim();
    }
  });

  return rows
    .map(cells => normalizeFiveColumnCellsToCriterion(cells, globalPoints))
    .filter(Boolean);
}

function splitFixedRubricLineIntoFiveCells(line) {
  const source = String(line || '').trim();
  if (!source) return null;

  if (source.includes('|')) {
    const parts = source.split('|').map(part => part.trim()).filter(Boolean);
    if (parts.length >= 5) return [parts[0], parts[1], parts[2], parts[3], parts.slice(4).join(' ')];
  }

  if (/\t/.test(source)) {
    const parts = source.split(/\t+/).map(part => part.trim()).filter(Boolean);
    if (parts.length >= 5) return [parts[0], parts[1], parts[2], parts[3], parts.slice(4).join(' ')];
  }

  const spaced = source.split(/\s{3,}/).map(part => part.trim()).filter(Boolean);
  if (spaced.length >= 5) return [spaced[0], spaced[1], spaced[2], spaced[3], spaced.slice(4).join(' ')];

  const levelSplit = splitLineByRubricLevels(source);
  if (levelSplit && levelSplit.title) {
    return [
      levelSplit.title,
      levelSplit.sections.excellent || '',
      levelSplit.sections.good || '',
      levelSplit.sections.fair || '',
      levelSplit.sections.needsImprovement || ''
    ];
  }

  return null;
}

function parseFiveColumnRubricFromText(text) {
  const normalizedText = normalizeOCRText(text);
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  const globalPoints = extractGlobalLevelPoints(normalizedText);
  const rows = [];
  let current = null;
  let headerSeen = false;

  lines.forEach(line => {
    const cells = splitFixedRubricLineIntoFiveCells(line);

    if (cells) {
      if (isFiveColumnHeaderCells(cells)) {
        headerSeen = true;
        return;
      }

      const candidate = normalizeFiveColumnCellsToCriterion(cells, globalPoints);
      if (candidate) {
        rows.push(candidate);
        current = rows[rows.length - 1];
      }
      return;
    }

    if (!headerSeen && isLikelyHeaderLine(line)) return;

    const levelMatch = line.match(/^(Excellent|Good|Fair|Needs\s*Improvement)\b\s*[:\-–|]?\s*(.*)$/i);
    if (current && levelMatch) {
      const key = normalizeRubricLevelKey(levelMatch[1]);
      const rawText = levelMatch[2].trim();
      const oldLevels = normalizeLevels(current.levels, current.points);
      oldLevels[key] = {
        ...oldLevels[key],
        description: `${oldLevels[key]?.description || ''} ${stripLeadingScoreText(rawText)}`.trim(),
        points: extractScoreValue(rawText, oldLevels[key]?.points)
      };
      current.levels = oldLevels;
    }
  });

  return rows;
}

// Override the earlier general parser: try the expected 5-column table first.
function parseCriteriaFromRubricText(text) {
  const fixedTableCriteria = parseFiveColumnRubricFromText(text);
  if (fixedTableCriteria.length) return fixedTableCriteria;
  return parseCriteriaFromRubricTextGeneral(text);
}

// Override local OCR: use word positions so the app knows the left column is Criteria and columns 2-5 are levels.
async function runLocalRubricOCR(file) {
  const Tesseract = await loadRubricOCRLibrary();
  const result = await Tesseract.recognize(file, 'eng', {
    logger: message => {
      if (message?.status === 'recognizing text' && Number.isFinite(message.progress)) {
        setRubricImportStatus(`Reading image table... ${Math.round(message.progress * 100)}%`, 'loading');
      }
    }
  });

  const extractedText = normalizeOCRText(result?.data?.text || '');
  const criteriaFromLayout = parseFiveColumnRubricFromOCRResult(result);
  window.__lastRubricOCRActivity = criteriaFromLayout.length
    ? normalizeImportedActivity({
        title: 'Imported Rubric Activity',
        description: 'Complete the activity based on the uploaded 5-column rubric. Review the imported rows before saving.',
        passingScore: 75,
        criteria: criteriaFromLayout
      })
    : null;

  return extractedText;
}


async function importRubricImage() {
  if (!isRubricImageImportEnabled()) {
    setRubricImportStatus('Rubric image import is disabled in firebase-config.js.', 'error');
    return;
  }

  const file = getSelectedRubricImageFile();
  if (!file) {
    setRubricImportStatus('Choose a rubric image first.', 'error');
    return;
  }

  const endpoint = getRubricImageEndpoint();

  try {
    importRubricImageBtn.disabled = true;
    importRubricImageBtn.textContent = 'Reading image...';
    setRubricImportStatus(endpoint ? 'Reading rubric image. Please wait...' : 'No online reader detected. Using built-in browser image reader...', 'loading');

    let importedActivity = null;

    if (endpoint) {
      const imageDataUrl = await readFileAsDataURL(file);
      const currentUser = firebaseSync.auth?.currentUser || firebaseSync.currentUser;
      let idToken = '';
      if (currentUser && typeof currentUser.getIdToken === 'function') {
        idToken = await currentUser.getIdToken();
      }

      const headers = { 'Content-Type': 'application/json' };
      if (idToken) headers.Authorization = `Bearer ${idToken}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageDataUrl,
          filename: file.name,
          mimeType: file.type,
          currentActivityTitle: adminActivityTitle?.value || '',
          expectedLevels: rubricLevels.map(item => item.label)
        })
      });

      if (!response.ok) throw new Error(`Image import endpoint returned ${response.status}`);
      const data = await response.json();
      importedActivity = data.activity || data.rubric || data;
      if (rubricExtractedText && data.extractedText) rubricExtractedText.value = normalizeOCRText(data.extractedText);
    } else {
      const extractedText = await runLocalRubricOCR(file);
      if (rubricExtractedText) rubricExtractedText.value = extractedText;
      importedActivity = window.__lastRubricOCRActivity || parseImportedActivityFromText(extractedText);
    }

    applyImportedActivityToAdminForm(importedActivity);
  } catch (error) {
    console.warn('Rubric image import failed', error);
    setRubricImportStatus('Could not read the rubric image. Try a clearer screenshot, then review/edit the extracted text.', 'error');
  } finally {
    importRubricImageBtn.disabled = false;
    importRubricImageBtn.textContent = 'Read Image & Fill Table';
  }
}


function setManualRubricStatus(message, type = '') {
  if (!manualRubricStatus) return;
  manualRubricStatus.textContent = message || '';
  manualRubricStatus.className = `helper-note manual-rubric-status ${type}`.trim();
}

function getManualRubricScore(input, fallback) {
  const value = Number(input?.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function getManualRubricScoreMap() {
  return {
    excellent: getManualRubricScore(manualExcellentScore, 10),
    good: getManualRubricScore(manualGoodScore, 8),
    fair: getManualRubricScore(manualFairScore, 6),
    needsImprovement: getManualRubricScore(manualNeedsScore, 4)
  };
}

function createManualRubricTextarea(className, placeholder, value = '') {
  const textarea = document.createElement('textarea');
  textarea.className = className;
  textarea.rows = className.includes('manual-criteria-input') ? 3 : 4;
  textarea.placeholder = placeholder;
  textarea.value = value || '';
  return textarea;
}

function addManualRubricInputRow(data = {}) {
  if (!manualRubricInputBody) return;

  const row = document.createElement('tr');
  row.className = 'manual-rubric-input-row';

  const cells = [
    { key: 'criteria', className: 'manual-criteria-input', placeholder: 'Example: HTML Structure & Semantic Tags' },
    { key: 'excellent', className: 'manual-level-input', placeholder: 'All requirements completed accurately; exceeded expectations' },
    { key: 'good', className: 'manual-level-input', placeholder: 'Most requirements completed properly' },
    { key: 'fair', className: 'manual-level-input', placeholder: 'Some requirements missing or inaccurate' },
    { key: 'needsImprovement', className: 'manual-level-input', placeholder: 'Few requirements met; needs improvement' }
  ];

  const cellLabels = {
    criteria: 'Criteria',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Satisfactory / Fair',
    needsImprovement: 'Needs Improvement'
  };

  cells.forEach(cellInfo => {
    const cell = document.createElement('td');
    cell.dataset.label = cellLabels[cellInfo.key] || cellInfo.key;
    cell.appendChild(createManualRubricTextarea(cellInfo.className, cellInfo.placeholder, data[cellInfo.key] || ''));
    row.appendChild(cell);
  });

  const actionCell = document.createElement('td');
  actionCell.dataset.label = 'Action';
  actionCell.className = 'manual-rubric-row-action';
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'ghost-btn danger remove-manual-rubric-row';
  removeButton.textContent = 'Remove';
  actionCell.appendChild(removeButton);
  row.appendChild(actionCell);

  manualRubricInputBody.appendChild(row);
}

function ensureManualRubricRows() {
  if (!manualRubricInputBody) return;
  if (manualRubricInputBody.children.length) return;
  for (let index = 0; index < 4; index += 1) {
    addManualRubricInputRow();
  }
}

function clearManualRubricInputTable() {
  if (!manualRubricInputBody) return;
  manualRubricInputBody.innerHTML = '';
  ensureManualRubricRows();
  setManualRubricStatus('Input table cleared. Type your rubric again, then click Apply + Smart Rubric Checker.');
}

function collectManualRubricInputCriteria() {
  if (!manualRubricInputBody) return [];
  const scores = getManualRubricScoreMap();
  const rows = [...manualRubricInputBody.querySelectorAll('.manual-rubric-input-row')];

  return rows.map((row, index) => {
    const criterionTitle = row.querySelector('.manual-criteria-input')?.value.trim() || '';
    const excellent = row.querySelector('td[data-label="excellent"] textarea')?.value.trim() || '';
    const good = row.querySelector('td[data-label="good"] textarea')?.value.trim() || '';
    const fair = row.querySelector('td[data-label="fair"] textarea')?.value.trim() || '';
    const needsImprovement = row.querySelector('td[data-label="needsImprovement"] textarea')?.value.trim() || '';
    const hasAnyText = [criterionTitle, excellent, good, fair, needsImprovement].some(Boolean);
    if (!hasAnyText) return null;

    const cleanTitle = criterionTitle || `Criterion ${index + 1}`;
    return buildCriterionFromParsedParts(cleanTitle, {
      excellent,
      good,
      fair,
      needsImprovement
    }, scores);
  }).filter(Boolean);
}

function applyManualRubricTableToActualRubric() {
  const criteria = collectManualRubricInputCriteria();
  if (!criteria.length) {
    setManualRubricStatus('Please type at least one criterion and description before applying.', 'error');
    return;
  }

  const imported = normalizeImportedActivity({
    id: adminEditingActivityId || createId(),
    title: adminActivityTitle?.value?.trim() || 'Manual Rubric Activity',
    description: adminActivityDescription?.value?.trim() || 'Complete the activity based on the teacher rubric.',
    passingScore: Number(adminPassingScore?.value) || 75,
    criteria
  });

  applyImportedActivityToAdminForm(imported);
  setManualRubricStatus(`Applied ${criteria.length} row${criteria.length === 1 ? '' : 's'} and generated smart rubric checks. Review them, then click Save Activity.`, 'success');
}

function initManualRubricInputTable() {
  ensureManualRubricRows();
  setManualRubricStatus('Type your rubric here, then click Apply + Smart Rubric Checker.');
}

function updateCriterionHelp(event) {
  const select = event.target.closest('.criterion-rule');
  if (!select) return;
  const card = select.closest('.rubric-table-row') || select.closest('.criterion-card');
  if (!card) return;
  const help = card.querySelector('.criterion-help');
  if (!help) return;
  help.textContent = ruleHelp[select.value] || '';
}


function renderFileNameInputs() {
  const names = getCodeFileNames();
  if (htmlFileNameInput) htmlFileNameInput.value = getActiveHtmlPageName();
  if (cssFileNameInput) cssFileNameInput.value = names.css;
  if (jsFileNameInput) jsFileNameInput.value = names.js;
  if (fileNameDialogNote) {
    const pages = getHTMLPageNames();
    const cssFiles = getLanguageFileNames('css');
    const jsFiles = getLanguageFileNames('js');
    fileNameDialogNote.textContent = `Current files: ${pages.join(', ')} | CSS: ${cssFiles.join(', ')} | JS: ${jsFiles.join(', ')}`;
  }
}

function shouldPlaceFileNameDialogInsideEditor() {
  return Boolean(
    editorPanel &&
    (
      document.fullscreenElement === editorPanel ||
      document.webkitFullscreenElement === editorPanel ||
      document.body.classList.contains('editor-fullscreen-active')
    )
  );
}

function placeFileNameDialogForCurrentMode() {
  if (!fileNameDialogOverlay) return;
  const target = shouldPlaceFileNameDialogInsideEditor() ? editorPanel : document.body;
  if (target && fileNameDialogOverlay.parentElement !== target) {
    target.appendChild(fileNameDialogOverlay);
  }
  fileNameDialogOverlay.classList.toggle('inside-editor-fullscreen', target === editorPanel);
}

function restoreFileNameDialogToBody() {
  if (!fileNameDialogOverlay) return;
  fileNameDialogOverlay.classList.remove('inside-editor-fullscreen');
  if (fileNameDialogOverlay.parentElement !== document.body) {
    document.body.appendChild(fileNameDialogOverlay);
  }
}

function openFileNameDialog() {
  if (!fileNameDialogOverlay) return;
  renderFileNameInputs();
  placeFileNameDialogForCurrentMode();
  fileNameDialogOverlay.classList.remove('hidden');
  document.body.classList.add('dialog-open');
  window.setTimeout(() => htmlFileNameInput?.focus({ preventScroll: true }), 0);
}

function closeFileNameDialog() {
  if (!fileNameDialogOverlay) return;
  fileNameDialogOverlay.classList.add('hidden');
  document.body.classList.remove('dialog-open');
  restoreFileNameDialogToBody();
  renameFilesBtn?.focus({ preventScroll: true });
}


function applyFileNameDialogValues() {
  const previousActivePage = getActiveHtmlPageName();
  const previousCssFile = getActiveLanguageFileName('css');
  const previousJsFile = getActiveLanguageFileName('js');
  const nextNames = normalizeCodeFileNames({
    html: htmlFileNameInput?.value || DEFAULT_CODE_FILE_NAMES.html,
    css: cssFileNameInput?.value || DEFAULT_CODE_FILE_NAMES.css,
    js: jsFileNameInput?.value || DEFAULT_CODE_FILE_NAMES.js
  });

  const pages = getHTMLPages();
  if (nextNames.html !== previousActivePage) {
    if (!pages[nextNames.html]) {
      pages[nextNames.html] = pages[previousActivePage] || codeStore.html || '';
      delete pages[previousActivePage];
      replaceHtmlFileReferences(previousActivePage, nextNames.html, 'html');
    }
    codeStore.activeHtmlPage = nextNames.html;
  }

  const cssFiles = getLanguageFileMap('css');
  if (nextNames.css !== previousCssFile) {
    if (!cssFiles[nextNames.css]) {
      cssFiles[nextNames.css] = cssFiles[previousCssFile] || codeStore.css || '';
      delete cssFiles[previousCssFile];
      replaceHtmlFileReferences(previousCssFile, nextNames.css, 'css');
    }
    codeStore.activeCssFile = nextNames.css;
  }

  const jsFiles = getLanguageFileMap('js');
  if (nextNames.js !== previousJsFile) {
    if (!jsFiles[nextNames.js]) {
      jsFiles[nextNames.js] = jsFiles[previousJsFile] || codeStore.js || '';
      delete jsFiles[previousJsFile];
      replaceHtmlFileReferences(previousJsFile, nextNames.js, 'js');
    }
    codeStore.activeJsFile = nextNames.js;
  }

  codeFileNames = nextNames;
  syncActiveLanguageFileFromStore('html');
  syncActiveLanguageFileFromStore('css');
  syncActiveLanguageFileFromStore('js');
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();
  renderHTMLPageManager();
  renderErrorChecker();
  loadActiveEditor();
  runCode(false, { scroll: false });
  closeFileNameDialog();
  setStatus('File names updated');
}

