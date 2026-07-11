function normalizeStudentId(value) {
  return String(value || '').trim().replace(/\s+/g, '').toUpperCase();
}

function studentIdToAuthEmail(value) {
  const normalized = normalizeStudentId(value).toLowerCase();
  const safe = normalized.replace(/[^a-z0-9]/g, '');
  return safe ? `sid-${safe}@${STUDENT_EMAIL_DOMAIN}` : '';
}

function getStudentFirstName(name) {
  const cleaned = String(name || 'Student').trim().replace(/\s+/g, ' ');
  if (!cleaned) return 'Student';

  const suffixes = new Set(['JR', 'JR.', 'SR', 'SR.', 'II', 'III', 'IV', 'V']);
  const safeSecondGivenNames = new Set([
    'AIRA', 'AIRAH', 'AIZA', 'ALEX', 'ALEXA', 'ALEXANDRA', 'ALIYAH', 'ALLYSA', 'ALYSSA', 'ANGEL', 'ANGELA', 'ANGELICA', 'ANGELIKA', 'ANGELINE', 'ANNE', 'ANN', 'ARA', 'ARIEL',
    'BEA', 'BELLE', 'BIANCA', 'CAMILLE', 'CARL', 'CARLA', 'CARLO', 'CHRISTIAN', 'CHRISTINE', 'CLAIRE', 'CRIS', 'DANIEL', 'DANIELLE', 'DENISE', 'ELLA', 'ELLE', 'FAITH',
    'GABRIEL', 'GABRIELLE', 'GRACE', 'GWEN', 'HANNAH', 'JAMES', 'JANE', 'JANELLE', 'JASMINE', 'JAY', 'JAYR', 'JEAN', 'JEN', 'JENNY', 'JOHN', 'JOSE', 'JOSEPH',
    'JOY', 'JOYCE', 'JULIA', 'JUSTINE', 'KATE', 'KAYE', 'KAYLA', 'KAYE', 'KIM', 'KYLE', 'KYLA', 'LEA', 'LEAH', 'LOUIE', 'LOUISE', 'LYN', 'LYNN', 'MAE', 'MAI',
    'MARIA', 'MARIE', 'MARK', 'MARY', 'MAY', 'MICA', 'MICAH', 'MICHELLE', 'MIKA', 'NICOLE', 'PAUL', 'PAULA', 'PRINCESS', 'QUEEN', 'REI', 'REY', 'ROSE', 'SAM',
    'SAMANTHA', 'SHAINE', 'SHANE', 'SOFIA', 'SOPHIA', 'TRISHA', 'VAN', 'VANESSA', 'VIA', 'VINCENT', 'YNA'
  ]);
  const familyConnectors = new Set(['DE', 'DEL', 'DELA', 'DELOS', 'LAS', 'LOS', 'SAN', 'SANTA', 'SANTO']);

  const cleanToken = token => String(token || '')
    .replace(/^[^A-Za-zÀ-ž0-9]+|[^A-Za-zÀ-ž0-9.\-']+$/g, '')
    .trim();
  const normalizeToken = token => cleanToken(token).replace(/\.+$/g, '').toUpperCase();
  const isInitial = token => /^[A-Za-zÀ-ž]\.?$/.test(cleanToken(token));
  const isSuffix = token => suffixes.has(cleanToken(token).toUpperCase());
  const isSafeSecondName = token => {
    const raw = cleanToken(token);
    const normalized = normalizeToken(raw);
    return Boolean(raw)
      && !isInitial(raw)
      && !isSuffix(raw)
      && !familyConnectors.has(normalized)
      && (raw.includes('-') || safeSecondGivenNames.has(normalized));
  };

  // Student names are often encoded as: SURNAME, First Second Middle.
  // Show the first given name and only one safe second given name.
  // This avoids middle initials like "M." and family-name connectors like "Dela".
  const usablePart = cleaned.includes(',')
    ? cleaned.split(',').slice(1).join(',').trim()
    : cleaned;
  const tokens = usablePart.split(/\s+/).map(cleanToken).filter(Boolean).filter(token => !isSuffix(token));
  const first = tokens[0] || 'Student';
  const second = tokens[1] || '';
  const displayName = isSafeSecondName(second) ? `${first} ${second}` : first;
  return displayName.replace(/[,.]+$/g, '') || 'Student';
}

function timestampToDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value === 'number' || typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function formatStudentDate(value, fallback = 'No activity yet') {
  const date = timestampToDate(value);
  if (!date) return fallback;
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function isTodayTimestamp(value) {
  const date = timestampToDate(value);
  if (!date) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function getStudentsCollectionRef() {
  const { collection } = firebaseSync.modules;
  return collection(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId, 'students');
}

function getStudentRosterCollectionRef() {
  const { collection } = firebaseSync.modules;
  return collection(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId, 'studentRoster');
}

function getStudentRosterDocRef(studentId) {
  const { doc } = firebaseSync.modules;
  return doc(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId, 'studentRoster', normalizeStudentId(studentId));
}

function getStudentDocRef(uid) {
  const { doc } = firebaseSync.modules;
  return doc(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId, 'students', uid);
}

function getStudentProjectsCollectionRef(uid) {
  const { collection } = firebaseSync.modules;
  return collection(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId, 'students', uid, 'projects');
}

function getStudentProjectDocRef(uid, projectId) {
  const { doc } = firebaseSync.modules;
  return doc(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId, 'students', uid, 'projects', projectId);
}

function snapshotExists(snapshot) {
  if (!snapshot) return false;
  return typeof snapshot.exists === 'function' ? snapshot.exists() : Boolean(snapshot.exists);
}

function snapshotData(snapshot) {
  return snapshot && typeof snapshot.data === 'function' ? (snapshot.data() || {}) : {};
}

async function loadStudentProfile(uid) {
  const ready = await initFirebaseSync();
  if (!ready || !uid) return null;
  const { getDoc } = firebaseSync.modules;
  const snapshot = await getDoc(getStudentDocRef(uid));
  return snapshotExists(snapshot) ? { uid, ...snapshotData(snapshot) } : null;
}

async function loadStudentRosterRecord(studentId) {
  const ready = await initFirebaseSync();
  if (!ready || !studentId) return null;
  const { getDoc } = firebaseSync.modules;
  const snapshot = await getDoc(getStudentRosterDocRef(studentId));
  return snapshotExists(snapshot) ? { id: snapshot.id, ...snapshotData(snapshot) } : null;
}

function setStudentLoginError(message = '') {
  if (!studentLoginError) return;
  studentLoginError.textContent = message;
  studentLoginError.classList.toggle('hidden', !message);
}

function setChangePasswordError(message = '') {
  if (!changePasswordError) return;
  changePasswordError.textContent = message;
  changePasswordError.classList.toggle('hidden', !message);
}

function setProjectNameError(message = '') {
  if (!projectNameError) return;
  projectNameError.textContent = message;
  projectNameError.classList.toggle('hidden', !message);
}

function setStudentSaveState(text, state = '') {
  [studentSaveState, menuStudentSaveState].forEach(saveEl => {
    if (!saveEl) return;
    saveEl.textContent = text;
    saveEl.classList.remove('saving', 'error', 'unsaved');
    if (state) saveEl.classList.add(state);
    saveEl.setAttribute('aria-busy', state === 'saving' ? 'true' : 'false');
  });
  updateManualSaveControls();
}


const PROJECT_RECOVERY_VERSION = 1;
const PROJECT_CACHE_VERSION = 1;
const MAX_PROJECT_CACHE_BYTES = 4_000_000;

function getStudentProjectCacheKey(uid = appSession.student?.uid) {
  return uid ? `studentCodeStudio.projectCache.v${PROJECT_CACHE_VERSION}.${uid}` : '';
}

function getStudentProjectRecoveryKey(projectId = appSession.currentProjectId, uid = appSession.student?.uid) {
  return uid && projectId ? `studentCodeStudio.projectRecovery.v${PROJECT_RECOVERY_VERSION}.${uid}.${projectId}` : '';
}

function persistStudentProjectsCache() {
  const key = getStudentProjectCacheKey();
  if (!key) return;
  try {
    const payload = JSON.stringify({ savedAt: Date.now(), projects: appSession.projects || [] });
    if (payload.length <= MAX_PROJECT_CACHE_BYTES) localStorage.setItem(key, payload);
  } catch (error) {
    console.warn('Could not cache the project list locally.', error);
  }
}

function loadStudentProjectsCache() {
  const key = getStudentProjectCacheKey();
  if (!key) return [];
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    return Array.isArray(cached?.projects) ? cached.projects : [];
  } catch (error) {
    console.warn('Could not read the local project cache.', error);
    return [];
  }
}

function clearStudentProjectRecovery(projectId = appSession.currentProjectId) {
  const key = getStudentProjectRecoveryKey(projectId);
  if (!key) return;
  try { localStorage.removeItem(key); } catch (error) { console.warn('Could not clear the recovery copy.', error); }
}

function persistStudentProjectRecoverySnapshot(reason = 'edit') {
  if (!isStudentProjectActive()) return;
  window.clearTimeout(studentProjectRecoveryTimer);

  const writeRecovery = () => {
    const key = getStudentProjectRecoveryKey();
    if (!key) return;
    try {
      const payload = buildProjectSavePayload();
      localStorage.setItem(key, JSON.stringify({
        version: PROJECT_RECOVERY_VERSION,
        savedAt: Date.now(),
        reason,
        revision: studentProjectRevision,
        projectId: appSession.currentProjectId,
        payload
      }));
    } catch (error) {
      console.warn('Could not create a local recovery copy.', error);
    }
  };

  const urgent = /^(offline|visibility|pagehide|beforeunload|save-failed)$/i.test(reason);
  if (urgent) writeRecovery();
  else studentProjectRecoveryTimer = window.setTimeout(writeRecovery, 220);
}

function getStudentProjectRecovery(projectId = appSession.currentProjectId) {
  const key = getStudentProjectRecoveryKey(projectId);
  if (!key) return null;
  try {
    const recovery = JSON.parse(localStorage.getItem(key) || 'null');
    return recovery?.payload ? recovery : null;
  } catch (error) {
    console.warn('Could not read the recovery copy.', error);
    return null;
  }
}

function getProjectUpdatedAtMs(project) {
  const date = timestampToDate(project?.updatedAt);
  return date?.getTime?.() || 0;
}

async function offerStudentProjectRecovery(project) {
  const recovery = getStudentProjectRecovery(project?.id);
  if (!recovery?.payload) return false;
  const cloudTime = getProjectUpdatedAtMs(project);
  if (Number(recovery.savedAt || 0) <= cloudTime + 1000) {
    clearStudentProjectRecovery(project.id);
    return false;
  }
  const restore = await appConfirm(
    'A newer recovery copy was found on this device. Restore the unsaved work?',
    { title: 'Recover unsaved work', confirmText: 'Restore Work', icon: '↻' }
  );
  if (!restore) {
    clearStudentProjectRecovery(project.id);
    return false;
  }
  const payload = recovery.payload;
  appSession.currentProject = { ...(appSession.currentProject || project), ...payload, id: project.id };
  codeByActivity = normalizeProjectCodeByActivity(payload.codeByActivity);
  selectedActivityId = activities.some(item => item.id === payload.selectedActivityId) ? payload.selectedActivityId : '';
  activity = selectedActivityId ? getActivityById(selectedActivityId) : null;
  const codeKey = selectedActivityId || 'scratch';
  codeStore = codeByActivity[codeKey] ? normalizeCodeStore(codeByActivity[codeKey]) : normalizeCodeStore(starterCode);
  codeByActivity[codeKey] = normalizeCodeStore(codeStore);
  codeFileNames = normalizeCodeFileNames(payload.fileNames || DEFAULT_CODE_FILE_NAMES);
  lastRubricResult = payload.lastResult || null;
  studentProjectRevision = Math.max(studentProjectRevision + 1, Number(recovery.revision || 0));
  studentProjectDirty = true;
  return true;
}

function ensureConnectionStatusBanner() {
  let banner = document.getElementById('connectionStatusBanner');
  if (banner) return banner;
  banner = document.createElement('div');
  banner.id = 'connectionStatusBanner';
  banner.className = 'connection-status-banner hidden';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  document.body.appendChild(banner);
  return banner;
}

function updateConnectionStatusUI() {
  const online = navigator.onLine !== false;
  const banner = ensureConnectionStatusBanner();
  document.body.classList.toggle('app-offline', !online);
  banner.classList.toggle('hidden', online);
  banner.textContent = online ? '' : 'Offline — your latest edits are protected on this device and will sync after reconnecting.';
  if (!online && isStudentProjectActive() && studentProjectDirty) setStudentSaveState('Offline · pending', 'unsaved');
  return online;
}

async function flushStudentProjectSave(reason = 'manual') {
  window.clearTimeout(studentProjectSaveTimer);
  window.clearTimeout(studentProjectRetryTimer);
  if (!isStudentProjectActive() || !studentProjectDirty) return true;
  if (navigator.onLine === false) {
    persistStudentProjectRecoverySnapshot('offline');
    setStudentSaveState('Offline · pending', 'unsaved');
    return false;
  }
  let attempts = 0;
  while (studentProjectDirty && attempts < 3) {
    attempts += 1;
    await saveCurrentStudentProject({ immediate: true, reason });
    if (studentProjectSaveInFlight) await studentProjectSavePromise;
    if (studentProjectDirty && attempts < 3) await new Promise(resolve => window.setTimeout(resolve, 120 * attempts));
  }
  return !studentProjectDirty;
}

function updateManualSaveControls() {
  const showManualSave = Boolean(appSession.mode === 'student' && appSession.currentProjectId && !isStudentAutoSaveAllowed());
  document.body.classList.toggle('student-manual-save-mode', showManualSave);
  [saveStudentProjectBtn, menuSaveProjectBtn].forEach(button => {
    if (!button) return;
    button.classList.toggle('hidden', !showManualSave);
    button.setAttribute('aria-hidden', showManualSave ? 'false' : 'true');
    button.disabled = !showManualSave || !studentProjectDirty || studentProjectSaveInFlight;
    button.textContent = studentProjectSaveInFlight ? 'Saving...' : '💾 Save';
    button.title = studentProjectDirty ? 'Save current project: Ctrl + S' : 'No unsaved changes';
  });
}

async function saveStudentProjectManually() {
  if (!isStudentProjectActive()) {
    saveActiveEditor();
    setStatus('Saved locally');
    return false;
  }
  saveActiveEditor();
  clearTimeout(studentProjectSaveTimer);
  const saved = await flushStudentProjectSave('manual');
  setStatus(saved ? 'Project saved' : (navigator.onLine === false ? 'Offline · saved on this device' : 'Save failed'));
  return saved;
}

function closeStudentAccountMenu() {
  studentAccountMenu?.classList.add('hidden');
  studentMenuBtn?.setAttribute('aria-expanded', 'false');
}

function toggleStudentAccountMenu() {
  if (!studentAccountMenu || !studentMenuBtn) return;
  const willOpen = studentAccountMenu.classList.contains('hidden');
  studentAccountMenu.classList.toggle('hidden', !willOpen);
  studentMenuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function updateAppHeaderForSession() {
  const isStudent = appSession.mode === 'student' && appSession.student;
  const isGuest = appSession.mode === 'guest';

  document.body.classList.toggle('student-session-active', isStudent);
  document.body.classList.toggle('guest-session-active', isGuest);
  studentAccountStrip?.classList.toggle('hidden', !isStudent);
  guestAccountStrip?.classList.toggle('hidden', !isGuest);
  studentMenuBtn?.classList.toggle('hidden', !isStudent);
  if (!isStudent) closeStudentAccountMenu();

  if (isStudent) {
    const firstName = getStudentFirstName(appSession.student.name);
    if (appTitleText) {
      const nameHighlight = document.createElement('span');
      nameHighlight.className = 'header-student-name-highlight';
      nameHighlight.textContent = firstName;
      appTitleText.replaceChildren(
        document.createTextNode('A tool for '),
        nameHighlight,
        document.createTextNode(", Let's Code!")
      );
    }
    if (appSubtitleText) appSubtitleText.textContent = 'Developed by Sir JR';
    if (headerStudentGreeting) headerStudentGreeting.textContent = `Hi, ${firstName}!`;
    if (menuStudentGreeting) menuStudentGreeting.textContent = `Hi, ${firstName}!`;
    if (!appSession.currentProjectId) studentProjectDirty = false;
    setStudentSaveState(appSession.currentProjectId ? (studentProjectDirty ? 'Unsaved' : 'Saved') : 'Choose a project', studentProjectDirty ? 'unsaved' : '');
  } else {
    if (appTitleText) appTitleText.textContent = 'A tool for every Grade 8 MCSian.';
    if (appSubtitleText) appSubtitleText.textContent = 'Developed by Sir JR';
  }
}

function hideAllStudentScreens() {
  studentLoginOverlay?.classList.add('hidden');
  changePasswordOverlay?.classList.add('hidden');
  projectNameOverlay?.classList.add('hidden');
  studentDashboard?.classList.add('hidden');
  document.body.classList.remove('student-auth-open', 'student-dashboard-active');
}

function showEntryGate() {
  hideAllStudentScreens();
  entryGate?.classList.remove('hidden');
  document.body.classList.add('entry-gate-active');
  updateAppHeaderForSession();
}

function hideEntryGate() {
  entryGate?.classList.add('hidden');
  document.body.classList.remove('entry-gate-active');
}

function openStudentLogin() {
  setStudentLoginError('');
  studentLoginOverlay?.classList.remove('hidden');
  document.body.classList.add('student-auth-open');
  window.setTimeout(() => studentLoginId?.focus(), 40);
}

function closeStudentLogin() {
  studentLoginOverlay?.classList.add('hidden');
  document.body.classList.remove('student-auth-open');
}

function showPasswordChange() {
  hideEntryGate();
  studentLoginOverlay?.classList.add('hidden');
  studentDashboard?.classList.add('hidden');
  changePasswordOverlay?.classList.remove('hidden');
  document.body.classList.add('student-auth-open');
  setChangePasswordError('');
  if (studentNewPassword) studentNewPassword.value = '';
  if (studentConfirmPassword) studentConfirmPassword.value = '';
  window.setTimeout(() => studentNewPassword?.focus(), 40);
}

function normalizeProjectCodeByActivity(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { scratch: normalizeCodeStore(starterCode) };
  }
  if ('html' in raw || 'css' in raw || 'js' in raw || 'files' in raw) {
    return { scratch: normalizeCodeStore(raw) };
  }
  const entries = Object.entries(raw)
    .filter(([, value]) => value && typeof value === 'object')
    .map(([key, value]) => [key || 'scratch', normalizeCodeStore(value)]);
  return entries.length ? Object.fromEntries(entries) : { scratch: normalizeCodeStore(starterCode) };
}

function resetWorkspaceState({ blank = false } = {}) {
  codeByActivity = {};
  selectedActivityId = '';
  activity = null;
  const baseCode = blank ? { html: '', css: '', js: '' } : starterCode;
  codeStore = normalizeCodeStore(baseCode);
  codeByActivity.scratch = normalizeCodeStore(codeStore);
  codeFileNames = normalizeCodeFileNames(DEFAULT_CODE_FILE_NAMES);
  activeLanguage = 'html';
  lastRubricResult = null;
  saveJSON(STORAGE_KEYS.selectedActivityId, '');
  saveCodeByActivity();
  saveCodeFileNames();
  renderActivitySummary();
  renderActivitySelector();
  resetResultPanel();
  loadActiveEditor();
  runCode(false, { scroll: false });
}

function continueAsGuest() {
  appSession.mode = 'guest';
  appSession.student = null;
  appSession.currentProjectId = '';
  appSession.currentProject = null;
  appSession.projects = [];

  // Important: hide the welcome gate before any editor reset work.
  // If reset/render code ever throws, Practice Without Login must still open the editor.
  hideEntryGate();
  hideAllStudentScreens();
  document.body.classList.remove('entry-gate-active', 'student-auth-open', 'student-dashboard-active', 'student-route-lock');
  updateAppHeaderForSession();
  setStatus('Practice mode');

  try {
    resetWorkspaceState();
  } catch (error) {
    console.error('Could not fully reset guest workspace, but practice mode was opened.', error);
    try {
      loadActiveEditor();
      runCode(false, { scroll: false });
    } catch (fallbackError) {
      console.error('Guest fallback render failed.', fallbackError);
    }
  }

  requestAnimationFrame(() => {
    entryGate?.classList.add('hidden');
    document.body.classList.remove('entry-gate-active', 'student-auth-open', 'student-dashboard-active', 'student-route-lock');
  });
}

async function recordStudentLogin() {
  const user = firebaseSync.auth?.currentUser || firebaseSync.currentUser;
  const student = appSession.student;
  if (!user || !student || user.uid !== student.uid) return;
  const sessionKey = `mcsian.student.loginRecorded.${user.uid}`;
  if (sessionStorage.getItem(sessionKey) === '1') return;
  try {
    const { setDoc, serverTimestamp, increment } = firebaseSync.modules;
    await setDoc(getStudentDocRef(user.uid), {
      lastLoginAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
      loginCount: increment(1),
      updatedAt: serverTimestamp()
    }, { merge: true });
    sessionStorage.setItem(sessionKey, '1');
    appSession.student.loginCount = Number(appSession.student.loginCount || 0) + 1;
    appSession.student.lastLoginAt = new Date();
    appSession.student.lastActivityAt = new Date();
  } catch (error) {
    console.warn('Could not update student login tracker.', error);
  }
}

async function activateStudentSession(profile, { showDashboard = true } = {}) {
  if (!profile) return;

  // Keep the editor hidden while login is being promoted to the correct
  // student route. Previously, the app removed the login/gate first and
  // then waited for Firebase login tracking, so the editor could flash for
  // a moment before the Projects page appeared.
  document.body.classList.add('student-route-lock');

  appSession.mode = 'student';
  appSession.student = profile;
  appSession.existingStudentUser = firebaseSync.auth?.currentUser || firebaseSync.currentUser;
  updateAppHeaderForSession();

  const loginTracker = recordStudentLogin().catch(error => {
    console.warn('Could not record student login before showing the dashboard.', error);
  });

  try {
    if (profile.mustChangePassword !== false) {
      showPasswordChange();
      await loginTracker;
      return;
    }

    if (showDashboard) {
      await showStudentDashboard();
    } else {
      hideEntryGate();
      closeStudentLogin();
    }
    await loginTracker;
  } finally {
    document.body.classList.remove('student-route-lock');
  }
}

async function deleteCurrentAuthUserQuietly(user) {
  if (!user) return;
  try {
    const deleteUser = firebaseSync.authModule?.deleteUser;
    if (deleteUser) {
      await deleteUser(user);
      return;
    }
    if (typeof user.delete === 'function') await user.delete();
  } catch (error) {
    console.warn('Could not remove an unused student Authentication account.', error);
  }
}

async function createStudentAccountFromRoster(studentId, password) {
  const authEmail = studentIdToAuthEmail(studentId);
  if (password !== DEFAULT_STUDENT_PASSWORD) {
    throw new Error('This Student ID is registered, but the account is not activated yet. Use the default password 123456 first.');
  }
  if (!firebaseSync.authModule?.createUserWithEmailAndPassword) {
    throw new Error('Student account activation is not available yet. Refresh the page and try again.');
  }

  const credential = await firebaseSync.authModule.createUserWithEmailAndPassword(firebaseSync.auth, authEmail, DEFAULT_STUDENT_PASSWORD);
  firebaseSync.currentUser = credential.user;
  let roster = null;
  try {
    roster = await loadStudentRosterRecord(studentId);
    if (!roster || normalizeStudentId(roster.studentId || roster.studentIdNormalized || roster.id) !== studentId) {
      await deleteCurrentAuthUserQuietly(credential.user);
      throw new Error('This Student ID is not registered in the class list. Ask your teacher to import or add it first.');
    }
    if (roster.accountStatus === 'disabled') {
      await deleteCurrentAuthUserQuietly(credential.user);
      throw new Error('This student account is disabled. Ask your teacher for help.');
    }

    const { setDoc, serverTimestamp } = firebaseSync.modules;
    const profile = {
      studentId: studentId,
      studentIdNormalized: studentId,
      authEmail,
      name: roster.name || 'Student',
      nameLower: String(roster.name || 'Student').toLowerCase(),
      gender: roster.gender || '',
      section: roster.section || '',
      sectionLower: String(roster.section || '').toLowerCase(),
      accountStatus: roster.accountStatus || 'active',
      mustChangePassword: true,
      loginCount: 0,
      projectCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rosterActivatedAt: serverTimestamp(),
      createdBy: 'student-first-login'
    };
    await setDoc(getStudentDocRef(credential.user.uid), profile);
    try {
      await setDoc(getStudentRosterDocRef(studentId), {
        authUid: credential.user.uid,
        authCreatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (rosterUpdateError) {
      console.warn('Student roster activation marker was not updated.', rosterUpdateError);
    }
    return { uid: credential.user.uid, ...profile, createdAt: new Date(), updatedAt: new Date() };
  } catch (error) {
    if (firebaseSync.auth?.currentUser?.uid === credential.user?.uid) {
      try { await firebaseSync.authModule.signOut(firebaseSync.auth); } catch (_) {}
    }
    throw error;
  }
}

function getStudentAuthErrorMessage(error) {
  const code = String(error?.code || '');
  if (code.includes('email-already-in-use')) return 'This Student ID already has an activated account. Log in using the new password you created.';
  if (code.includes('weak-password')) return 'The password must contain at least 6 characters.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Student ID or password is incorrect. New accounts use 123456 as the default password.';
  }
  if (code.includes('too-many-requests')) return 'Too many login attempts. Wait a few minutes and try again.';
  if (code.includes('network-request-failed')) return 'Internet connection problem. Please reconnect and try again.';
  if (code.includes('operation-not-allowed')) return 'Student login is not enabled yet. The teacher must enable Email/Password in Firebase Authentication.';
  if (code.includes('unauthorized-domain')) return 'This website domain must be added to Firebase Authentication authorized domains.';
  return error?.message || 'Login failed. Check your Student ID and password.';
}

async function loginStudent() {
  setStudentLoginError('');
  const studentId = normalizeStudentId(studentLoginId?.value);
  const password = String(studentLoginPassword?.value || '');
  const authEmail = studentIdToAuthEmail(studentId);
  if (!studentId || !password) {
    setStudentLoginError('Enter your Student ID and password.');
    return;
  }
  if (!authEmail) {
    setStudentLoginError('Student ID is invalid.');
    return;
  }
  const ready = await initFirebaseSync();
  if (!ready || !firebaseSync.authModule) {
    setStudentLoginError('Firebase is not ready. Check the internet connection and try again.');
    return;
  }
  try {
    if (studentLoginBtn) {
      studentLoginBtn.disabled = true;
      studentLoginBtn.textContent = 'Logging in...';
    }
    let credential = null;
    let profile = null;
    try {
      credential = await firebaseSync.authModule.signInWithEmailAndPassword(firebaseSync.auth, authEmail, password);
      firebaseSync.currentUser = credential.user;
      profile = await loadStudentProfile(credential.user.uid);
    } catch (signInError) {
      const signInCode = String(signInError?.code || signInError?.message || '').toLowerCase();
      const shouldActivateFromRoster = signInCode.includes('user-not-found')
        || signInCode.includes('invalid-credential')
        || signInCode.includes('email_not_found');
      if (!shouldActivateFromRoster) throw signInError;
      profile = await createStudentAccountFromRoster(studentId, password);
    }
    if (!profile || normalizeStudentId(profile.studentId) !== studentId) {
      await firebaseSync.authModule.signOut(firebaseSync.auth);
      throw new Error('This login has no registered student profile. Ask your teacher to register the Student ID again.');
    }
    if (profile.accountStatus === 'disabled') {
      await firebaseSync.authModule.signOut(firebaseSync.auth);
      throw new Error('This student account is disabled. Ask your teacher for help.');
    }
    if (studentLoginPassword) studentLoginPassword.value = '';
    await activateStudentSession(profile);
  } catch (error) {
    console.error('Student login failed', error);
    setStudentLoginError(getStudentAuthErrorMessage(error));
  } finally {
    if (studentLoginBtn) {
      studentLoginBtn.disabled = false;
      studentLoginBtn.textContent = 'Log In';
    }
  }
}

async function saveStudentNewPassword() {
  setChangePasswordError('');
  const newPassword = String(studentNewPassword?.value || '');
  const confirmPassword = String(studentConfirmPassword?.value || '');
  if (newPassword.length < 6) {
    setChangePasswordError('Password must contain at least 6 characters.');
    return;
  }
  if (newPassword === DEFAULT_STUDENT_PASSWORD) {
    setChangePasswordError('Choose a password different from the default 123456.');
    return;
  }
  if (newPassword !== confirmPassword) {
    setChangePasswordError('The two passwords do not match.');
    return;
  }
  const user = firebaseSync.auth?.currentUser || firebaseSync.currentUser;
  if (!user || !appSession.student) {
    setChangePasswordError('Your login session expired. Log in again.');
    return;
  }
  try {
    saveNewPasswordBtn.disabled = true;
    saveNewPasswordBtn.textContent = 'Saving...';
    await firebaseSync.authModule.updatePassword(user, newPassword);
    const { setDoc, serverTimestamp } = firebaseSync.modules;
    await setDoc(getStudentDocRef(user.uid), {
      mustChangePassword: false,
      passwordChangedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    appSession.student.mustChangePassword = false;
    changePasswordOverlay?.classList.add('hidden');
    document.body.classList.remove('student-auth-open');
    await showStudentDashboard();
  } catch (error) {
    console.error('Could not update student password', error);
    setChangePasswordError(error?.code === 'auth/requires-recent-login'
      ? 'Please log out and log in again before changing the password.'
      : (error?.message || 'Could not change the password. Try again.'));
  } finally {
    saveNewPasswordBtn.disabled = false;
    saveNewPasswordBtn.textContent = 'Save New Password';
  }
}

async function handleStudentAuthObserver(user) {
  appSession.authReady = true;
  if (!user || isAllowedTeacherEmail(user.email)) {
    appSession.existingStudentUser = null;
    resumeStudentBtn?.classList.add('hidden');
    if (!user && appSession.mode === 'student') {
      appSession.mode = 'pending';
      appSession.student = null;
      appSession.currentProjectId = '';
      appSession.currentProject = null;
      showEntryGate();
    }
    return;
  }
  try {
    const profile = await loadStudentProfile(user.uid);
    if (!profile) {
      resumeStudentBtn?.classList.add('hidden');
      return;
    }
    appSession.existingStudentUser = user;
    if (appSession.mode !== 'student') appSession.student = profile;
    if (resumeStudentText) resumeStudentText.textContent = `Continue as ${getStudentFirstName(profile.name)}`;
    resumeStudentBtn?.classList.remove('hidden');
  } catch (error) {
    console.warn('Could not prepare saved student session.', error);
  }
}

async function resumeExistingStudentSession() {
  const user = firebaseSync.auth?.currentUser || firebaseSync.currentUser || appSession.existingStudentUser;
  if (!user) {
    openStudentLogin();
    return;
  }
  const profile = await loadStudentProfile(user.uid);
  if (!profile) {
    openStudentLogin();
    return;
  }
  await activateStudentSession(profile);
}

async function logoutStudent() {
  const hasPendingSave = Boolean(studentProjectDirty || studentProjectSaveTimer || studentProjectSaveInFlight || studentProjectSaveQueued);
  if (hasPendingSave && appSession.mode === 'student' && appSession.currentProjectId) {
    const shouldContinue = await appConfirm('Some recent changes may still be saving. Save now and log out?', {
      title: 'Log out safely',
      confirmText: 'Save & Log Out'
    });
    if (!shouldContinue) return;
  }
  try {
    clearTimeout(studentProjectSaveTimer);
    if (appSession.mode === 'student' && appSession.currentProjectId) {
      const saved = await flushStudentProjectSave('logout');
      if (!saved && navigator.onLine !== false) {
        const leaveAnyway = await appConfirm('The cloud save did not finish. A recovery copy is safe on this device. Log out anyway?', {
          title: 'Cloud save incomplete',
          confirmText: 'Log Out Anyway',
          danger: true
        });
        if (!leaveAnyway) return;
      }
    }
  } catch (error) {
    console.warn('Final student save skipped.', error);
  }
  try {
    if (firebaseSync.auth && firebaseSync.authModule) await firebaseSync.authModule.signOut(firebaseSync.auth);
  } catch (error) {
    console.warn('Student logout failed.', error);
  }
  appSession.mode = 'pending';
  appSession.student = null;
  appSession.existingStudentUser = null;
  appSession.currentProjectId = '';
  appSession.currentProject = null;
  appSession.projects = [];
  resumeStudentBtn?.classList.add('hidden');
  updateAppHeaderForSession();
  showEntryGate();
}

async function showStudentDashboard() {
  if (!appSession.student) {
    openStudentLogin();
    return;
  }
  hideEntryGate();
  studentLoginOverlay?.classList.add('hidden');
  changePasswordOverlay?.classList.add('hidden');
  projectNameOverlay?.classList.add('hidden');
  document.body.classList.remove('student-auth-open');
  studentDashboard?.classList.remove('hidden');
  document.body.classList.add('student-dashboard-active');
  const firstName = getStudentFirstName(appSession.student.name);
  if (dashboardGreeting) dashboardGreeting.textContent = `Hi, ${firstName}! Your saved work is ready.`;
  await loadStudentProjects();
}

function closeStudentDashboard() {
  studentDashboard?.classList.add('hidden');
  document.body.classList.remove('student-dashboard-active');
}

async function loadStudentProjects() {
  const student = appSession.student;
  if (!student) return [];
  const ready = await initFirebaseSync();
  if (!ready) {
    if (projectDashboardStatus) projectDashboardStatus.textContent = 'Could not connect to saved projects.';
    return [];
  }
  try {
    if (projectDashboardStatus) projectDashboardStatus.textContent = 'Loading projects...';
    const { getDocs } = firebaseSync.modules;
    const snapshot = await withTimeout(
      getDocs(getStudentProjectsCollectionRef(student.uid)),
      APP_NETWORK_TIMEOUT_MS,
      'Loading projects is taking too long. Please check the internet connection, then try again.'
    );
    appSession.projects = (snapshot.docs || []).map(docSnapshot => ({
      id: docSnapshot.id,
      ...snapshotData(docSnapshot)
    })).sort((a, b) => {
      const aTime = timestampToDate(a.updatedAt)?.getTime() || 0;
      const bTime = timestampToDate(b.updatedAt)?.getTime() || 0;
      return bTime - aTime;
    });
    persistStudentProjectsCache();
    renderStudentProjects();
    return appSession.projects;
  } catch (error) {
    console.error('Could not load projects', error);
    const cachedProjects = loadStudentProjectsCache();
    if (cachedProjects.length) {
      appSession.projects = cachedProjects;
      renderStudentProjects();
      if (projectDashboardStatus) projectDashboardStatus.textContent = `Offline copy · ${cachedProjects.length} project${cachedProjects.length === 1 ? '' : 's'}`;
      setStatus('Showing saved offline copy');
      return cachedProjects;
    }
    if (projectDashboardStatus) projectDashboardStatus.textContent = error?.message || 'Could not load projects. Check the internet connection.';
    studentProjectsGrid.innerHTML = `<div class="empty-projects-card"><h3>Projects unavailable</h3><p>${escapeHTML(error?.message || 'Please reconnect and refresh.')}</p><button class="primary-btn" type="button" data-project-action="retry-load">Try Again</button></div>`;
    return [];
  }
}

function getProjectStatus(project) {
  if (project?.lastResult?.passed === true || project?.status === 'passed') return 'passed';
  if (project?.lastResult || project?.status === 'checked') return 'checked';
  return 'in-progress';
}

function getProjectStatusLabel(status) {
  if (status === 'passed') return 'Passed';
  if (status === 'checked') return 'Checked';
  return 'In Progress';
}

function renderStudentProjects() {
  if (!studentProjectsGrid) return;
  const search = String(projectSearchInput?.value || '').trim().toLowerCase();
  const statusFilter = projectStatusFilter?.value || 'all';
  const projects = appSession.projects.filter(project => {
    const matchesSearch = !search || String(project.name || '').toLowerCase().includes(search);
    const status = getProjectStatus(project);
    return matchesSearch && (statusFilter === 'all' || statusFilter === status);
  });

  if (projectDashboardStatus) {
    const total = appSession.projects.length;
    projectDashboardStatus.textContent = total
      ? `${projects.length} of ${total} project${total === 1 ? '' : 's'} shown`
      : 'No saved projects yet.';
  }

  if (!projects.length) {
    studentProjectsGrid.innerHTML = `
      <div class="empty-projects-card">
        <div class="student-auth-icon">💻</div>
        <h3>${appSession.projects.length ? 'No matching project' : 'Create your first coding project'}</h3>
        <p>${appSession.projects.length ? 'Try a different search or filter.' : 'Your HTML, CSS, JavaScript, activity, and score will be saved here.'}</p>
        ${appSession.projects.length ? '' : '<button class="primary-btn" type="button" data-project-action="new">+ New Project</button>'}
      </div>`;
    return;
  }

  studentProjectsGrid.innerHTML = projects.map(project => {
    const status = getProjectStatus(project);
    const result = project.lastResult || null;
    const scoreText = result
      ? `${formatPoints(result.score || 0)}/${formatPoints(result.possible || 0)} (${Number(result.percent || 0)}%)`
      : 'Not scored';
    return `
      <article class="student-project-card" data-project-id="${escapeAttribute(project.id)}">
        <div class="project-card-top">
          <span class="project-card-icon">&lt;/&gt;</span>
          <span class="project-status-pill ${escapeAttribute(status)}">${getProjectStatusLabel(status)}</span>
        </div>
        <h3>${escapeHTML(project.name || 'Untitled Project')}</h3>
        <p class="project-card-activity">${escapeHTML(project.activityTitle || 'Practice project')}</p>
        <p class="project-card-meta">Last edited: ${escapeHTML(formatStudentDate(project.updatedAt, 'Not edited yet'))}</p>
        <p class="project-card-meta">Run attempts: ${Number(project.runCount || 0)}</p>
        <div class="project-score-row"><span>Score</span><span class="project-score-value">${escapeHTML(scoreText)}</span></div>
        <div class="project-card-actions">
          <button class="primary-btn" type="button" data-project-action="open">Open Project</button>
          <button class="ghost-btn" type="button" data-project-action="rename" title="Rename project">✏️</button>
          <button class="ghost-btn danger" type="button" data-project-action="delete" title="Delete project">🗑</button>
        </div>
      </article>`;
  }).join('');
}

function openProjectNameDialog(mode = 'create', project = null) {
  appSession.projectDialogMode = mode;
  appSession.renameProjectId = project?.id || '';
  if (projectNameKicker) projectNameKicker.textContent = mode === 'rename' ? 'Rename Project' : 'New Project';
  if (projectNameTitle) projectNameTitle.textContent = mode === 'rename' ? 'Change Project Name' : 'Name Your Project';
  if (saveProjectNameBtn) saveProjectNameBtn.textContent = mode === 'rename' ? 'Save Name' : 'Create Project';
  if (projectNameInput) projectNameInput.value = mode === 'rename' ? String(project?.name || '') : '';
  setProjectNameError('');
  projectNameOverlay?.classList.remove('hidden');
  document.body.classList.add('student-auth-open');
  window.setTimeout(() => {
    projectNameInput?.focus();
    projectNameInput?.select();
  }, 40);
}

function closeProjectNameDialog() {
  projectNameOverlay?.classList.add('hidden');
  document.body.classList.remove('student-auth-open');
  setProjectNameError('');
}

function buildNewProjectData(name) {
  return {
    name,
    nameLower: name.toLowerCase(),
    status: 'in-progress',
    codeByActivity: { scratch: normalizeCodeStore(starterCode) },
    selectedActivityId: '',
    activityTitle: '',
    fileNames: normalizeCodeFileNames(DEFAULT_CODE_FILE_NAMES),
    runCount: 0,
    lastResult: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function saveProjectNameDialog() {
  const name = String(projectNameInput?.value || '').trim();
  if (name.length < 2) {
    setProjectNameError('Enter a project name with at least 2 characters.');
    return;
  }
  if (!appSession.student) {
    setProjectNameError('Log in first to save a project.');
    return;
  }
  try {
    saveProjectNameBtn.disabled = true;
    if (appSession.projectDialogMode === 'rename') {
      await renameStudentProject(appSession.renameProjectId, name);
      closeProjectNameDialog();
      return;
    }
    saveProjectNameBtn.textContent = 'Creating...';
    const projectId = createId().replace(/[^a-zA-Z0-9_-]/g, '-');
    const data = buildNewProjectData(name);
    const { setDoc, serverTimestamp, increment } = firebaseSync.modules;
    await setDoc(getStudentProjectDocRef(appSession.student.uid, projectId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await setDoc(getStudentDocRef(appSession.student.uid), {
      projectCount: increment(1),
      lastProjectId: projectId,
      lastProjectName: name,
      lastActivityAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    appSession.projects.unshift({ id: projectId, ...data });
    appSession.student.projectCount = Number(appSession.student.projectCount || 0) + 1;
    persistStudentProjectsCache();
    closeProjectNameDialog();
    await openStudentProject(projectId);
  } catch (error) {
    console.error('Could not create project', error);
    setProjectNameError(error?.message || 'Could not create the project. Try again.');
  } finally {
    saveProjectNameBtn.disabled = false;
    saveProjectNameBtn.textContent = appSession.projectDialogMode === 'rename' ? 'Save Name' : 'Create Project';
  }
}

async function getStudentProject(projectId) {
  const cached = appSession.projects.find(project => project.id === projectId);
  if (cached?.codeByActivity) return cached;
  const { getDoc } = firebaseSync.modules;
  const snapshot = await withTimeout(
    getDoc(getStudentProjectDocRef(appSession.student.uid, projectId)),
    APP_NETWORK_TIMEOUT_MS,
    'Opening project is taking too long. Please check the internet connection, then try again.'
  );
  return snapshotExists(snapshot) ? { id: projectId, ...snapshotData(snapshot) } : null;
}

async function openStudentProject(projectId) {
  if (!appSession.student || !projectId) return;
  try {
    if (projectDashboardStatus) projectDashboardStatus.textContent = 'Opening project...';
    const project = await getStudentProject(projectId);
    if (!project) throw new Error('Project not found.');
    appSession.currentProjectId = projectId;
    appSession.currentProject = project;
    studentProjectRevision = 0;
    studentProjectLastSavedRevision = 0;
    const recovered = await offerStudentProjectRecovery(project);
    const projectToOpen = recovered ? appSession.currentProject : project;
    codeByActivity = normalizeProjectCodeByActivity(projectToOpen.codeByActivity);
    selectedActivityId = activities.some(item => item.id === projectToOpen.selectedActivityId) ? projectToOpen.selectedActivityId : '';
    activity = selectedActivityId ? getActivityById(selectedActivityId) : null;
    const codeKey = selectedActivityId || 'scratch';
    codeStore = codeByActivity[codeKey]
      ? normalizeCodeStore(codeByActivity[codeKey])
      : normalizeCodeStore(starterCode);
    codeByActivity[codeKey] = normalizeCodeStore(codeStore);
    codeFileNames = normalizeCodeFileNames(projectToOpen.fileNames || DEFAULT_CODE_FILE_NAMES);
    activeLanguage = 'html';
    lastRubricResult = projectToOpen.lastResult || null;
    saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
    saveCodeByActivity();
    saveCodeFileNames();
    renderActivitySummary();
    renderActivitySelector();
    loadActiveEditor();
    if (projectToOpen.lastResult && activity) renderResult(projectToOpen.lastResult);
    else resetResultPanel();
    runCode(false, { scroll: false });
    closeStudentDashboard();
    updateAppHeaderForSession();
    studentProjectDirty = recovered;
    if (recovered) {
      setStudentSaveState('Recovered · unsaved', 'unsaved');
      queueStudentProjectSave('recovery');
      setStatus(`Recovered unsaved work: ${project.name}`);
    } else {
      setStudentSaveState('Saved');
      setStatus(`Project: ${project.name}`);
    }
  } catch (error) {
    console.error('Could not open project', error);
    await appAlert(error?.message || 'Could not open the project.', { title: 'Project unavailable', danger: true });
    await loadStudentProjects();
  }
}

async function renameStudentProject(projectId, name) {
  if (!appSession.student || !projectId) return;
  const { setDoc, serverTimestamp } = firebaseSync.modules;
  await setDoc(getStudentProjectDocRef(appSession.student.uid, projectId), {
    name,
    nameLower: name.toLowerCase(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  const cached = appSession.projects.find(project => project.id === projectId);
  if (cached) {
    cached.name = name;
    cached.nameLower = name.toLowerCase();
    cached.updatedAt = new Date();
  }
  if (appSession.currentProjectId === projectId && appSession.currentProject) {
    appSession.currentProject.name = name;
  }
  persistStudentProjectsCache();
  renderStudentProjects();
  setStatus('Project renamed');
}

async function deleteStudentProject(projectId) {
  if (!appSession.student || !projectId) return;
  const project = appSession.projects.find(item => item.id === projectId);
  const confirmed = await appConfirm(`Delete “${project?.name || 'this project'}”? This cannot be undone.`, {
    title: 'Delete project',
    confirmText: 'Delete',
    danger: true,
    icon: '🗑'
  });
  if (!confirmed) return;
  try {
    const { deleteDoc, setDoc, serverTimestamp, increment } = firebaseSync.modules;
    await withTimeout(
      deleteDoc(getStudentProjectDocRef(appSession.student.uid, projectId)),
      APP_NETWORK_TIMEOUT_MS,
      'Deleting project is taking too long. Please check the internet connection, then try again.'
    );
    await setDoc(getStudentDocRef(appSession.student.uid), {
      projectCount: increment(-1),
      lastActivityAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    appSession.projects = appSession.projects.filter(item => item.id !== projectId);
    clearStudentProjectRecovery(projectId);
    persistStudentProjectsCache();
    if (appSession.currentProjectId === projectId) {
      appSession.currentProjectId = '';
      appSession.currentProject = null;
    }
    renderStudentProjects();
    setStatus('Project deleted');
  } catch (error) {
    console.error('Could not delete project', error);
    await appAlert('Could not delete the project. Try again.', { title: 'Delete failed', danger: true });
  }
}

function isStudentProjectActive() {
  const currentUser = firebaseSync.auth?.currentUser || firebaseSync.currentUser;
  return Boolean(
    appSession.mode === 'student'
    && appSession.student
    && appSession.currentProjectId
    && currentUser
    && currentUser.uid === appSession.student.uid
  );
}

function buildProjectSavePayload(result = null) {
  const currentResult = result || lastRubricResult || appSession.currentProject?.lastResult || null;
  const currentActivity = activity || null;
  return {
    name: appSession.currentProject?.name || 'Untitled Project',
    nameLower: String(appSession.currentProject?.name || 'Untitled Project').toLowerCase(),
    status: currentResult?.passed ? 'passed' : currentResult ? 'checked' : 'in-progress',
    codeByActivity: Object.fromEntries(Object.entries(codeByActivity).map(([key, value]) => [key, normalizeCodeStore(value)])),
    selectedActivityId: selectedActivityId || '',
    activityTitle: currentActivity?.title || '',
    fileNames: normalizeCodeFileNames(codeFileNames),
    runCount: Number(appSession.currentProject?.runCount || 0),
    lastResult: currentResult ? {
      score: Number(currentResult.score || 0),
      possible: Number(currentResult.possible || 0),
      percent: Number(currentResult.percent || 0),
      passed: Boolean(currentResult.passed),
      feedback: String(currentResult.feedback || ''),
      results: Array.isArray(currentResult.results) ? currentResult.results.map(item => ({
        title: item.title || '',
        levelKey: item.levelKey || '',
        levelLabel: item.levelLabel || '',
        levelDescription: item.levelDescription || '',
        earned: Number(item.earned || 0),
        points: Number(item.points || 0),
        passed: Boolean(item.passed),
        rule: item.rule || '',
        target: item.target || ''
      })) : []
    } : null
  };
}

function queueStudentProjectSave(reason = 'edit') {
  if (!isStudentProjectActive()) return;
  studentProjectRevision += 1;
  studentProjectDirty = true;
  persistStudentProjectRecoverySnapshot(reason);
  updateManualSaveControls();
  window.clearTimeout(studentProjectSaveTimer);
  window.clearTimeout(studentProjectRetryTimer);
  if (!isStudentAutoSaveAllowed()) {
    setStudentSaveState('Unsaved', 'unsaved');
    return;
  }
  if (navigator.onLine === false) {
    setStudentSaveState('Offline · pending', 'unsaved');
    updateConnectionStatusUI();
    return;
  }
  setStudentSaveState('Saving...', 'saving');
  studentProjectSaveTimer = window.setTimeout(() => {
    saveCurrentStudentProject({ reason }).catch(error => console.warn('Autosave failed', error));
  }, STUDENT_AUTOSAVE_DELAY);
}

async function saveCurrentStudentProject({ result = null, immediate = false, reason = 'edit' } = {}) {
  if (!isStudentProjectActive()) return false;
  const manualReason = reason === 'manual' || reason === 'logout' || reason === 'reconnect' || reason === 'visibility';
  if (!isStudentAutoSaveAllowed() && !manualReason) {
    studentProjectDirty = true;
    window.clearTimeout(studentProjectSaveTimer);
    persistStudentProjectRecoverySnapshot(reason);
    setStudentSaveState('Unsaved', 'unsaved');
    return false;
  }
  if (navigator.onLine === false) {
    studentProjectDirty = true;
    persistStudentProjectRecoverySnapshot('offline');
    setStudentSaveState('Offline · pending', 'unsaved');
    updateConnectionStatusUI();
    return false;
  }
  if (immediate) window.clearTimeout(studentProjectSaveTimer);
  if (studentProjectSaveInFlight) {
    studentProjectSaveQueued = true;
    return studentProjectSavePromise;
  }

  const revisionBeingSaved = studentProjectRevision;
  const projectIdBeingSaved = appSession.currentProjectId;
  const studentUidBeingSaved = appSession.student?.uid || '';
  studentProjectSaveInFlight = true;
  setStudentSaveState('Saving...', 'saving');

  studentProjectSavePromise = (async () => {
    try {
      const { setDoc, serverTimestamp } = firebaseSync.modules;
      const payload = buildProjectSavePayload(result);
      await withTimeout(
        setDoc(getStudentProjectDocRef(studentUidBeingSaved, projectIdBeingSaved), {
          ...payload,
          updatedAt: serverTimestamp()
        }, { merge: true }),
        APP_NETWORK_TIMEOUT_MS,
        'Saving is taking too long. Your recovery copy is safe on this device.'
      );

      // Do not overwrite state if the student switched projects while this request was running.
      if (appSession.currentProjectId === projectIdBeingSaved && appSession.student?.uid === studentUidBeingSaved) {
        appSession.currentProject = {
          ...(appSession.currentProject || {}),
          ...payload,
          id: projectIdBeingSaved,
          updatedAt: new Date()
        };
        const index = appSession.projects.findIndex(project => project.id === projectIdBeingSaved);
        if (index >= 0) appSession.projects[index] = { ...appSession.projects[index], ...appSession.currentProject };
        else appSession.projects.unshift(appSession.currentProject);
        studentProjectLastSavedRevision = Math.max(studentProjectLastSavedRevision, revisionBeingSaved);
        studentProjectDirty = studentProjectRevision > revisionBeingSaved;
        studentProjectRetryCount = 0;
        persistStudentProjectsCache();
        if (!studentProjectDirty) {
          clearStudentProjectRecovery(projectIdBeingSaved);
          setStudentSaveState('Saved');
        } else {
          setStudentSaveState('Saving...', 'saving');
          studentProjectSaveQueued = true;
        }
      }

      const now = Date.now();
      if (reason !== 'edit' || now - lastProfileActivityWriteAt >= PROFILE_ACTIVITY_WRITE_INTERVAL) {
        lastProfileActivityWriteAt = now;
        await withTimeout(
          setDoc(getStudentDocRef(studentUidBeingSaved), {
            lastActivityAt: serverTimestamp(),
            lastProjectId: projectIdBeingSaved,
            lastProjectName: payload.name,
            updatedAt: serverTimestamp()
          }, { merge: true }),
          APP_NETWORK_TIMEOUT_MS,
          'Project saved, but activity tracking is taking longer than expected.'
        ).catch(error => console.warn('Project saved; profile activity update skipped.', error));
      }
      return true;
    } catch (error) {
      console.error('Could not save current student project.', error);
      studentProjectDirty = true;
      persistStudentProjectRecoverySnapshot('save-failed');
      setStudentSaveState(navigator.onLine === false ? 'Offline · pending' : 'Save failed · retrying', 'error');
      if (isStudentAutoSaveAllowed() && navigator.onLine !== false && studentProjectRetryCount < 3) {
        studentProjectRetryCount += 1;
        const retryDelay = [1800, 5000, 12000][studentProjectRetryCount - 1] || 12000;
        window.clearTimeout(studentProjectRetryTimer);
        studentProjectRetryTimer = window.setTimeout(() => saveCurrentStudentProject({ reason: 'retry' }), retryDelay);
      }
      return false;
    } finally {
      studentProjectSaveInFlight = false;
      updateManualSaveControls();
      if (studentProjectSaveQueued && isStudentProjectActive()) {
        studentProjectSaveQueued = false;
        window.setTimeout(() => saveCurrentStudentProject({ reason: 'queued' }), 80);
      }
    }
  })();

  return studentProjectSavePromise;
}

function markStudentProjectRun() {
  if (!isStudentProjectActive()) return;
  appSession.currentProject = appSession.currentProject || {};
  appSession.currentProject.runCount = Number(appSession.currentProject.runCount || 0) + 1;
  saveCurrentStudentProject({ immediate: true, reason: 'run' });
}

/* ---------------- Teacher student registration and tracker ---------------- */
function setStudentAdminStatus(message, state = '') {
  if (!studentAccountAdminStatus) return;
  studentAccountAdminStatus.textContent = message;
  studentAccountAdminStatus.dataset.state = state;
}

function normalizeStudentRecord(record = {}) {
  const studentId = normalizeStudentId(record.studentId || record.id || record.idNumber || record.lrn || '');
  const name = String(record.name || record.fullName || '').trim().replace(/\s+/g, ' ');
  const gender = String(record.gender || record.sex || '').trim();
  const section = String(record.section || '').trim().replace(/\s+/g, ' ');
  const errors = [];
  if (!studentId) errors.push('Missing Student ID');
  if (!name) errors.push('Missing name');
  if (!section) errors.push('Missing section');
  return {
    studentId,
    studentIdNormalized: studentId,
    authEmail: studentIdToAuthEmail(studentId),
    name,
    nameLower: name.toLowerCase(),
    gender,
    section,
    sectionLower: section.toLowerCase(),
    errors
  };
}

function getRosterRegistrationErrorMessage(error) {
  const code = String(error?.code || error?.message || '');
  if (code.includes('permission-denied')) return 'Teacher login is required, or firestore.rules was not published yet.';
  if (code.includes('unavailable')) return 'Firebase is temporarily unavailable. Try again in a moment.';
  if (code.includes('network')) return 'Network problem while saving the student record.';
  return error?.message || 'Could not save the student record.';
}

async function registerStudentRosterRecord(rawRecord) {
  if (!isTeacherAuthenticated()) throw new Error('Teacher login is required.');
  const record = normalizeStudentRecord(rawRecord);
  if (record.errors.length) throw new Error(record.errors.join(', '));
  const duplicate = adminStudentsCache.find(student =>
    normalizeStudentId(student.studentId) === record.studentId
    || String(student.authEmail || '').toLowerCase() === record.authEmail.toLowerCase()
  );
  if (duplicate) throw new Error('Student ID already exists in the tracker.');

  const { getDoc, setDoc, serverTimestamp } = firebaseSync.modules;
  const existingRoster = await getDoc(getStudentRosterDocRef(record.studentId));
  if (snapshotExists(existingRoster)) throw new Error('Student ID already exists in the roster.');

  const rosterRecord = {
    studentId: record.studentId,
    studentIdNormalized: record.studentId,
    authEmail: record.authEmail,
    name: record.name,
    nameLower: record.nameLower,
    gender: record.gender,
    section: record.section,
    sectionLower: record.sectionLower,
    accountStatus: 'active',
    authUid: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: firebaseSync.auth?.currentUser?.email || firebaseSync.currentUser?.email || 'teacher'
  };
  await setDoc(getStudentRosterDocRef(record.studentId), rosterRecord, { merge: false });
  const localRecord = {
    uid: '',
    rosterId: record.studentId,
    isRosterOnly: true,
    mustChangePassword: true,
    loginCount: 0,
    projectCount: 0,
    ...rosterRecord,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  adminStudentsCache.push(localRecord);
  return localRecord;
}


async function addStudentAccountFromForm() {
  const record = {
    studentId: adminStudentId?.value,
    name: adminStudentName?.value,
    gender: adminStudentGender?.value,
    section: adminStudentSection?.value
  };
  try {
    addStudentAccountBtn.disabled = true;
    addStudentAccountBtn.textContent = 'Saving Student...';
    setStudentAdminStatus('Saving student record. The Firebase Auth account will activate on first student login...');
    const student = await registerStudentRosterRecord(record);
    if (adminStudentId) adminStudentId.value = '';
    if (adminStudentName) adminStudentName.value = '';
    if (adminStudentGender) adminStudentGender.value = '';
    setStudentAdminStatus(`${student.name} was added. Student ID: ${student.studentId} · First login password: 123456`, 'success');
    renderAdminStudentTracker();
  } catch (error) {
    console.error('Student record creation failed', error);
    setStudentAdminStatus(getRosterRegistrationErrorMessage(error), 'error');
  } finally {
    addStudentAccountBtn.disabled = false;
    addStudentAccountBtn.textContent = '+ Add Student Record';
  }
}

async function loadAdminStudents() {
  if (!isTeacherAuthenticated()) return [];
  try {
    setStudentAdminStatus('Loading student tracker...');
    const { getDocs } = firebaseSync.modules;
    const [studentSnapshot, rosterSnapshot] = await Promise.all([
      getDocs(getStudentsCollectionRef()),
      getDocs(getStudentRosterCollectionRef()).catch(() => ({ docs: [] }))
    ]);
    const activeProfiles = (studentSnapshot.docs || []).map(docSnapshot => ({
      uid: docSnapshot.id,
      isRosterOnly: false,
      ...snapshotData(docSnapshot)
    }));
    const byStudentId = new Map(activeProfiles.map(student => [normalizeStudentId(student.studentId), student]));
    const rosterProfiles = (rosterSnapshot.docs || []).map(docSnapshot => {
      const data = snapshotData(docSnapshot);
      const studentId = normalizeStudentId(data.studentId || docSnapshot.id);
      const activeMatch = byStudentId.get(studentId);
      if (activeMatch) return null;
      return {
        uid: data.authUid || '',
        rosterId: studentId,
        isRosterOnly: true,
        mustChangePassword: true,
        loginCount: 0,
        projectCount: 0,
        ...data,
        studentId
      };
    }).filter(Boolean);
    adminStudentsCache = [...activeProfiles, ...rosterProfiles]
      .sort((a, b) => String(a.section || '').localeCompare(String(b.section || '')) || String(a.name || '').localeCompare(String(b.name || '')));
    populateAdminSectionFilter();
    renderAdminStudentTracker();
    setStudentAdminStatus(`${adminStudentsCache.length} student record${adminStudentsCache.length === 1 ? '' : 's'} loaded.`, 'success');
    return adminStudentsCache;
  } catch (error) {
    console.error('Could not load student tracker', error);
    setStudentAdminStatus(error?.message || 'Could not load student tracker.', 'error');
    return [];
  }
}

function populateAdminSectionFilter() {
  if (!adminSectionFilter) return;
  const current = adminSectionFilter.value || 'all';
  const sections = [...new Set(adminStudentsCache.map(student => String(student.section || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  adminSectionFilter.innerHTML = '<option value="all">All Sections</option>' + sections
    .map(section => `<option value="${escapeAttribute(section)}">${escapeHTML(section)}</option>`).join('');
  adminSectionFilter.value = sections.includes(current) ? current : 'all';
}

function getFilteredAdminStudents() {
  const search = String(adminStudentSearch?.value || '').trim().toLowerCase();
  const section = adminSectionFilter?.value || 'all';
  const activityFilter = adminActivityFilter?.value || 'all';
  return adminStudentsCache.filter(student => {
    const matchesSearch = !search
      || String(student.name || '').toLowerCase().includes(search)
      || String(student.studentId || '').toLowerCase().includes(search);
    const matchesSection = section === 'all' || student.section === section;
    const loggedIn = Boolean(student.lastLoginAt || Number(student.loginCount || 0) > 0);
    const hasProjects = Number(student.projectCount || 0) > 0;
    const activeToday = isTodayTimestamp(student.lastActivityAt);
    let matchesActivity = true;
    if (activityFilter === 'logged-in') matchesActivity = loggedIn;
    else if (activityFilter === 'never-logged-in') matchesActivity = !loggedIn;
    else if (activityFilter === 'with-projects') matchesActivity = hasProjects;
    else if (activityFilter === 'without-projects') matchesActivity = !hasProjects;
    else if (activityFilter === 'active-today') matchesActivity = activeToday;
    return matchesSearch && matchesSection && matchesActivity;
  });
}

function renderAdminStudentTracker() {
  if (!adminStudentsTableBody) return;
  const filtered = getFilteredAdminStudents();
  const loggedInCount = adminStudentsCache.filter(student => student.lastLoginAt || Number(student.loginCount || 0) > 0).length;
  const totalProjects = adminStudentsCache.reduce((sum, student) => sum + Math.max(0, Number(student.projectCount || 0)), 0);
  const activeToday = adminStudentsCache.filter(student => isTodayTimestamp(student.lastActivityAt)).length;
  if (adminStudentCount) adminStudentCount.textContent = String(adminStudentsCache.length);
  if (adminLoggedInCount) adminLoggedInCount.textContent = String(loggedInCount);
  if (adminProjectCount) adminProjectCount.textContent = String(totalProjects);
  if (adminActiveTodayCount) adminActiveTodayCount.textContent = String(activeToday);

  if (!filtered.length) {
    adminStudentsTableBody.innerHTML = '<tr><td colspan="6"><div class="empty-projects-card"><strong>No matching students.</strong><p>Register a student or change the filters.</p></div></td></tr>';
    return;
  }

  adminStudentsTableBody.innerHTML = filtered.map(student => {
    const loggedIn = Boolean(student.lastLoginAt || Number(student.loginCount || 0) > 0);
    const rosterOnly = Boolean(student.isRosterOnly && !student.uid);
    const accountLabel = rosterOnly ? 'Ready for First Login' : (student.mustChangePassword === false ? 'Active' : 'Password Change Needed');
    const pillClass = rosterOnly ? '' : (student.mustChangePassword === false ? 'active' : '');
    return `
      <tr data-student-uid="${escapeAttribute(student.uid || '')}">
        <td><span class="student-cell-name">${escapeHTML(student.name || 'Unnamed Student')}</span><span class="student-cell-id">ID: ${escapeHTML(student.studentId || '')} · ${escapeHTML(student.gender || 'Gender not set')}</span></td>
        <td>${escapeHTML(student.section || 'No section')}</td>
        <td><span class="student-account-pill ${pillClass}">${accountLabel}</span><span class="student-cell-sub">${loggedIn ? `${Number(student.loginCount || 0)} login${Number(student.loginCount || 0) === 1 ? '' : 's'}` : 'Never logged in'}</span></td>
        <td><strong>${Math.max(0, Number(student.projectCount || 0))}</strong><span class="student-cell-sub">${escapeHTML(student.lastProjectName || 'No project yet')}</span></td>
        <td>${escapeHTML(formatStudentDate(student.lastActivityAt))}</td>
        <td>${rosterOnly ? '<span class="student-cell-sub">No projects yet</span>' : `<button class="ghost-btn view-student-projects-btn" type="button" data-student-uid="${escapeAttribute(student.uid)}">View Projects</button>`}</td>
      </tr>`;
  }).join('');
}

function normalizeImportHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function readImportValue(row, aliases) {
  const normalized = Object.fromEntries(Object.entries(row || {}).map(([key, value]) => [normalizeImportHeader(key), value]));
  for (const alias of aliases) {
    const key = normalizeImportHeader(alias);
    if (key in normalized && String(normalized[key] ?? '').trim() !== '') return normalized[key];
  }
  return '';
}

async function parseStudentImportFile(file) {
  const extension = String(file?.name || '').split('.').pop().toLowerCase();
  let rows = [];
  if (extension === 'csv' && !window.XLSX) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const headers = (lines.shift() || '').split(',').map(value => value.trim().replace(/^"|"$/g, ''));
    rows = lines.map(line => {
      const values = line.match(/("(?:[^"]|"")*"|[^,]*)(?:,|$)/g)?.map(value => value.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
      return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    });
  } else {
    if (!window.XLSX) throw new Error('Excel reader did not load. Check the internet connection, or upload a CSV file.');
    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = window.XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: false });
  }
  return rows.map((row, index) => {
    const record = normalizeStudentRecord({
      studentId: readImportValue(row, ['Student ID', 'StudentID', 'ID Number', 'ID', 'Learner ID', 'LRN']),
      name: readImportValue(row, ['Name', 'Full Name', 'Student Name', 'Learner Name']),
      gender: readImportValue(row, ['Gender', 'Sex']),
      section: readImportValue(row, ['Section', 'Class Section', 'Class'])
    });
    const duplicateInFile = rows.slice(0, index).some(previous => {
      const previousId = normalizeStudentId(readImportValue(previous, ['Student ID', 'StudentID', 'ID Number', 'ID', 'Learner ID', 'LRN']));
      return Boolean(record.studentId) && (
        previousId === record.studentId
        || studentIdToAuthEmail(previousId) === record.authEmail
      );
    });
    const duplicateExisting = adminStudentsCache.some(student => Boolean(record.studentId) && (
      normalizeStudentId(student.studentId) === record.studentId
      || String(student.authEmail || studentIdToAuthEmail(student.studentId)).toLowerCase() === record.authEmail.toLowerCase()
    ));
    if (duplicateInFile) record.errors.push('Duplicate in file');
    if (duplicateExisting) record.errors.push('Already registered');
    return { rowNumber: index + 2, ...record };
  });
}

function renderStudentImportPreview() {
  if (!studentImportPreview || !studentImportPreviewBody) return;
  const validCount = pendingStudentImportRows.filter(row => !row.errors.length).length;
  const invalidCount = pendingStudentImportRows.length - validCount;
  studentImportSummary.textContent = `${validCount} valid · ${invalidCount} needs attention · ${pendingStudentImportRows.length} total`;
  studentImportPreviewBody.innerHTML = pendingStudentImportRows.slice(0, 150).map(row => `
    <tr>
      <td>${row.rowNumber}</td>
      <td>${escapeHTML(row.studentId || '—')}</td>
      <td>${escapeHTML(row.name || '—')}</td>
      <td>${escapeHTML(row.gender || '—')}</td>
      <td>${escapeHTML(row.section || '—')}</td>
      <td class="${row.errors.length ? 'import-row-error' : 'import-row-valid'}">${row.errors.length ? escapeHTML(row.errors.join(', ')) : 'Ready'}</td>
    </tr>`).join('');
  studentImportPreview.classList.remove('hidden');
  confirmStudentImportBtn.disabled = !validCount;
  confirmStudentImportBtn.textContent = `Import ${validCount} Valid Student Record${validCount === 1 ? '' : 's'}`;
}

async function handleStudentImportFile(file) {
  if (!file) return;
  try {
    setStudentAdminStatus(`Reading ${file.name}...`);
    pendingStudentImportRows = await parseStudentImportFile(file);
    if (!pendingStudentImportRows.length) throw new Error('No student rows were found in the file.');
    renderStudentImportPreview();
    setStudentAdminStatus('Import preview ready. Check the rows, then import valid student records.', 'success');
  } catch (error) {
    console.error('Could not read student import', error);
    setStudentAdminStatus(error?.message || 'Could not read the Excel file.', 'error');
  } finally {
    if (studentImportInput) studentImportInput.value = '';
  }
}

function cancelStudentImport() {
  pendingStudentImportRows = [];
  studentImportPreview?.classList.add('hidden');
  if (studentImportPreviewBody) studentImportPreviewBody.innerHTML = '';
  setStudentAdminStatus('Import cancelled.');
}

function wait(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

async function confirmStudentImport() {
  if (studentImportRunning) return;
  const validRows = pendingStudentImportRows.filter(row => !row.errors.length);
  if (!validRows.length) return;
  studentImportRunning = true;
  confirmStudentImportBtn.disabled = true;
  let created = 0;
  const failures = [];
  try {
    for (let index = 0; index < validRows.length; index += 1) {
      const row = validRows[index];
      confirmStudentImportBtn.textContent = `Saving ${index + 1} of ${validRows.length}...`;
      setStudentAdminStatus(`Saving student record ${index + 1} of ${validRows.length}: ${row.name}`);
      try {
        await registerStudentRosterRecord(row);
        created += 1;
      } catch (error) {
        failures.push(`${row.studentId}: ${getRosterRegistrationErrorMessage(error)}`);
      }
      await wait(40);
    }
    pendingStudentImportRows = [];
    studentImportPreview.classList.add('hidden');
    populateAdminSectionFilter();
    renderAdminStudentTracker();
    setStudentAdminStatus(`${created} student record${created === 1 ? '' : 's'} imported. Students will activate their Auth account on first login with 123456.${failures.length ? ` ${failures.length} failed: ${failures.slice(0, 3).join(' | ')}` : ''}`, failures.length ? 'error' : 'success');
  } finally {
    studentImportRunning = false;
    confirmStudentImportBtn.disabled = false;
    confirmStudentImportBtn.textContent = 'Import Valid Student Records';
  }
}

function downloadStudentImportTemplate() {
  const rows = [
    { 'Student ID': '2026-001', 'Name': 'Juan Dela Cruz', 'Gender': 'Male', 'Section': 'Grade 8 - Rizal' },
    { 'Student ID': '2026-002', 'Name': 'Maria Santos', 'Gender': 'Female', 'Section': 'Grade 8 - Rizal' }
  ];
  if (window.XLSX) {
    const workbook = window.XLSX.utils.book_new();
    const worksheet = window.XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 18 }, { wch: 28 }, { wch: 14 }, { wch: 22 }];
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    window.XLSX.writeFile(workbook, 'Sir-JR-Student-Import-Template.xlsx');
    return;
  }
  const csv = 'Student ID,Name,Gender,Section\n2026-001,Juan Dela Cruz,Male,Grade 8 - Rizal\n2026-002,Maria Santos,Female,Grade 8 - Rizal\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Sir-JR-Student-Import-Template.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function showAdminStudentProjects(uid) {
  const student = adminStudentsCache.find(item => item.uid === uid);
  if (!student) return;
  adminStudentProjectsTitle.textContent = `${student.name}'s Projects`;
  adminStudentProjectsSubtitle.textContent = `${student.studentId} · ${student.section}`;
  adminStudentProjectsList.innerHTML = '<div class="dashboard-status">Loading projects...</div>';
  adminStudentProjectsOverlay.classList.remove('hidden');
  document.body.classList.add('student-auth-open');
  try {
    const { getDocs } = firebaseSync.modules;
    const snapshot = await getDocs(getStudentProjectsCollectionRef(uid));
    const projects = (snapshot.docs || []).map(docSnapshot => ({ id: docSnapshot.id, ...snapshotData(docSnapshot) }))
      .sort((a, b) => (timestampToDate(b.updatedAt)?.getTime() || 0) - (timestampToDate(a.updatedAt)?.getTime() || 0));
    if (!projects.length) {
      adminStudentProjectsList.innerHTML = '<div class="empty-projects-card"><h3>No projects yet</h3><p>This student has logged in but has not created a project.</p></div>';
      return;
    }
    adminStudentProjectsList.innerHTML = projects.map(project => {
      const result = project.lastResult;
      return `
        <article class="admin-project-row">
          <div><strong>${escapeHTML(project.name || 'Untitled Project')}</strong><small>${escapeHTML(project.activityTitle || 'Practice project')} · Updated ${escapeHTML(formatStudentDate(project.updatedAt))}</small></div>
          <span>${getProjectStatusLabel(getProjectStatus(project))}</span>
          <span>${Number(project.runCount || 0)} run${Number(project.runCount || 0) === 1 ? '' : 's'}</span>
          <strong>${result ? `${formatPoints(result.score || 0)}/${formatPoints(result.possible || 0)} · ${Number(result.percent || 0)}%` : 'Not scored'}</strong>
        </article>`;
    }).join('');
  } catch (error) {
    console.error('Could not load student projects for admin', error);
    adminStudentProjectsList.innerHTML = '<div class="empty-projects-card"><h3>Could not load projects</h3><p>Check the internet connection and Firestore rules.</p></div>';
  }
}

function closeAdminStudentProjects() {
  adminStudentProjectsOverlay?.classList.add('hidden');
  document.body.classList.remove('student-auth-open');
}

const selfClosingTagNames = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr'
]);

