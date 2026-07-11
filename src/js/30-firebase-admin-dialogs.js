function hasFirebaseConfig() {
  ensureFirebaseFrontendConfig();
  const config = window.MCS_FIREBASE_CONFIG || {};
  const hasConfig = Boolean(
    window.MCS_FIREBASE_ENABLED === true &&
    config.apiKey &&
    config.projectId &&
    !String(config.apiKey).includes('PASTE_') &&
    !String(config.projectId).includes('PASTE_')
  );

  if (!hasConfig) {
    firebaseSync.lastError = 'Firebase config is missing or disabled. Upload firebase-config.js, or use the updated script.js with built-in config.';
  }

  return hasConfig;
}

function getAllowedTeacherEmails() {
  const source = Array.isArray(window.MCS_TEACHER_EMAILS) ? window.MCS_TEACHER_EMAILS : [];
  return source
    .map(email => String(email || '').trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedTeacherEmail(email) {
  const allowed = getAllowedTeacherEmails();
  if (!allowed.length) return Boolean(email);
  return allowed.includes(String(email || '').trim().toLowerCase());
}

function isTeacherAuthenticated() {
  const user = firebaseSync.auth?.currentUser || firebaseSync.currentUser;
  return Boolean(user && user.email && isAllowedTeacherEmail(user.email));
}

function getTeacherEmailText() {
  const allowed = getAllowedTeacherEmails();
  return allowed.length ? allowed.join(', ') : 'any authenticated Firebase user';
}

function getDefaultTeacherEmail() {
  return getAllowedTeacherEmails()[0] || '';
}

function setAdminQuickUnlocked(value) {
  // Kept for older event paths, but quick local unlock is intentionally disabled.
  adminQuickUnlocked = false;
  try {
    sessionStorage.removeItem(ADMIN_QUICK_UNLOCK_KEY);
  } catch (error) {
    // Session storage can be blocked in some browsers; Firebase auth remains the source of truth.
  }
  adminUnlocked = isTeacherAuthenticated();
  updateAssistancePublishUI?.();
}

function isAdminPanelUnlocked() {
  return isTeacherAuthenticated();
}

function setAdminLoginMode(mode = 'code') {
  const usePassword = mode === 'password';
  adminCodeModeBtn?.classList.toggle('active', !usePassword);
  adminPasswordModeBtn?.classList.toggle('active', usePassword);
  adminCodeModeBtn?.setAttribute('aria-selected', String(!usePassword));
  adminPasswordModeBtn?.setAttribute('aria-selected', String(usePassword));
  adminCodeLoginPanel?.classList.toggle('hidden', usePassword);
  adminCodeLoginPanel?.classList.toggle('active', !usePassword);
  teacherPasswordLoginPanel?.classList.toggle('hidden', !usePassword);
  teacherPasswordLoginPanel?.classList.toggle('active', usePassword);
  showTeacherLoginError('');
  window.setTimeout(() => (usePassword ? adminPassword : adminQuickCode)?.focus({ preventScroll: true }), 60);
}


let appDialogResolve = null;
let lastDialogFocus = null;

function closeAppDialog(result = false) {
  if (!appDialogOverlay) return;
  appDialogOverlay.classList.add('hidden');
  document.body.classList.remove('dialog-open');
  appDialogOverlay.classList.remove('inside-editor-fullscreen');
  if (appDialogOverlay.parentElement !== document.body) document.body.appendChild(appDialogOverlay);
  if (lastDialogFocus && typeof lastDialogFocus.focus === 'function') {
    lastDialogFocus.focus({ preventScroll: true });
  }
  const resolver = appDialogResolve;
  appDialogResolve = null;
  if (resolver) resolver(Boolean(result));
}

function placeAppDialogForFullscreen() {
  if (!appDialogOverlay) return;
  const fullscreenEditor = document.getElementById('editorPanel');
  const useEditorHost = Boolean(
    fullscreenEditor &&
    (
      document.fullscreenElement === fullscreenEditor ||
      document.webkitFullscreenElement === fullscreenEditor ||
      document.body.classList.contains('editor-fullscreen-active')
    )
  );
  const target = useEditorHost ? fullscreenEditor : document.body;
  if (target && appDialogOverlay.parentElement !== target) target.appendChild(appDialogOverlay);
  appDialogOverlay.classList.toggle('inside-editor-fullscreen', useEditorHost);
}

function showAppDialog({
  title = 'Notice',
  message = '',
  mode = 'alert',
  confirmText = 'OK',
  cancelText = 'Cancel',
  kicker = 'App message',
  danger = false,
  icon = '!'
} = {}) {
  if (!appDialogOverlay || !appDialogCard) {
    console.warn('App dialog unavailable:', message);
    return Promise.resolve(true);
  }

  placeAppDialogForFullscreen();
  if (appDialogResolve) closeAppDialog(false);
  lastDialogFocus = document.activeElement;

  appDialogCard.className = `app-dialog-card ${mode === 'confirm' ? 'confirm' : 'alert'} ${danger ? 'danger' : ''}`.trim();
  if (appDialogIcon) appDialogIcon.textContent = icon;
  if (appDialogKicker) appDialogKicker.textContent = kicker;
  if (appDialogTitle) appDialogTitle.textContent = title;
  if (appDialogMessage) appDialogMessage.textContent = message;
  if (appDialogOkBtn) appDialogOkBtn.textContent = confirmText;
  if (appDialogCancelBtn) appDialogCancelBtn.textContent = cancelText;

  appDialogOverlay.classList.remove('hidden');
  document.body.classList.add('dialog-open');
  setTimeout(() => appDialogOkBtn?.focus({ preventScroll: true }), 0);

  return new Promise(resolve => {
    appDialogResolve = resolve;
  });
}

function appAlert(message, options = {}) {
  return showAppDialog({
    title: options.title || 'Notice',
    message,
    mode: 'alert',
    confirmText: options.confirmText || 'OK',
    kicker: options.kicker || 'Editor message',
    icon: options.icon || 'i',
    danger: Boolean(options.danger)
  });
}

function appConfirm(message, options = {}) {
  return showAppDialog({
    title: options.title || 'Confirm action',
    message,
    mode: 'confirm',
    confirmText: options.confirmText || 'OK',
    cancelText: options.cancelText || 'Cancel',
    kicker: options.kicker || 'Please confirm',
    icon: options.icon || '?',
    danger: Boolean(options.danger)
  });
}

function showTeacherLoginError(message) {
  const errorBox = document.getElementById('teacherLoginError');
  if (!errorBox) {
    if (message) appAlert(message, { title: 'Teacher Login' });
    return;
  }

  if (!message) {
    errorBox.textContent = '';
    errorBox.classList.add('hidden');
    return;
  }

  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function getFirebaseLoginErrorMessage(error) {
  const code = error?.code || '';

  if (code === 'auth/operation-not-allowed') {
    return 'Email/Password login is not enabled yet. Go to Firebase Console > Authentication > Sign-in method > Email/Password > Enable.';
  }

  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Login failed. Make sure you created this teacher account in Firebase Authentication > Users and entered the correct password.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'This website domain is not authorized. In Firebase Console, go to Authentication > Settings > Authorized domains and add sfk2627.github.io.';
  }

  if (code === 'auth/invalid-email') {
    return 'Please enter a valid teacher email address.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many login attempts. Wait a few minutes, then try again.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network error. Check your internet connection and try again.';
  }

  return error?.message || 'Login failed. Check your Firebase Authentication setup.';
}

function setTeacherLoginLoading(isLoading, mode = 'password') {
  if (unlockAdminBtn) {
    unlockAdminBtn.disabled = Boolean(isLoading);
    unlockAdminBtn.textContent = isLoading && mode === 'password' ? 'Logging in...' : 'Login with Password';
  }
  if (unlockAdminCodeBtn) {
    unlockAdminCodeBtn.disabled = Boolean(isLoading);
    unlockAdminCodeBtn.textContent = isLoading && mode === 'code' ? 'Checking code...' : 'Unlock with Code';
  }
  if (adminQuickCode) adminQuickCode.disabled = Boolean(isLoading);
  if (adminEmail) adminEmail.disabled = Boolean(isLoading);
  if (adminPassword) adminPassword.disabled = Boolean(isLoading);
}



function initFirebaseWithCompatSDK() {
  const firebase = window.firebase;
  if (!firebase || typeof firebase.initializeApp !== 'function' || typeof firebase.auth !== 'function' || typeof firebase.firestore !== 'function') {
    return false;
  }

  try {
    const config = window.MCS_FIREBASE_CONFIG || MCS_DEFAULT_FIREBASE_CONFIG;
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(config);
    }

    const db = firebase.firestore();
    const auth = firebase.auth();

    const compatDoc = (database, ...segments) => {
      let ref = database.collection(segments[0]).doc(segments[1]);
      for (let index = 2; index < segments.length; index += 2) {
        ref = ref.collection(segments[index]).doc(segments[index + 1]);
      }
      return ref;
    };
    const compatCollection = (database, ...segments) => {
      let ref = database.collection(segments[0]);
      for (let index = 1; index < segments.length; index += 2) {
        ref = ref.doc(segments[index]).collection(segments[index + 1]);
      }
      return ref;
    };
    const applyCompatQuery = (reference, ...constraints) => constraints.reduce((queryRef, constraint) => {
      if (!constraint) return queryRef;
      if (constraint.type === 'where') return queryRef.where(constraint.field, constraint.operator, constraint.value);
      if (constraint.type === 'orderBy') return queryRef.orderBy(constraint.field, constraint.direction);
      if (constraint.type === 'limit') return queryRef.limit(constraint.count);
      return queryRef;
    }, reference);

    firebaseSync.db = db;
    firebaseSync.auth = auth;
    firebaseSync.modules = {
      doc: compatDoc,
      collection: compatCollection,
      getDoc: async ref => {
        const snap = await ref.get();
        return { id: snap.id, exists: () => snap.exists, data: () => snap.data() || {}, ref: snap.ref };
      },
      getDocs: ref => ref.get(),
      setDoc: (ref, data, options = {}) => ref.set(data, options),
      updateDoc: (ref, data) => ref.update(data),
      deleteDoc: ref => ref.delete(),
      addDoc: (collectionRef, data) => collectionRef.add(data),
      onSnapshot: (ref, callback, errorCallback) => ref.onSnapshot(snap => callback({
        id: snap.id,
        exists: () => snap.exists,
        data: () => snap.data() || {},
        ref: snap.ref
      }), errorCallback),
      query: applyCompatQuery,
      where: (field, operator, value) => ({ type: 'where', field, operator, value }),
      orderBy: (field, direction = 'asc') => ({ type: 'orderBy', field, direction }),
      limit: count => ({ type: 'limit', count }),
      serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
      increment: amount => firebase.firestore.FieldValue.increment(amount)
    };
    firebaseSync.authModule = {
      onAuthStateChanged: (authInstance, callback) => authInstance.onAuthStateChanged(callback),
      signInWithEmailAndPassword: (authInstance, email, password) => authInstance.signInWithEmailAndPassword(email, password),
      createUserWithEmailAndPassword: (authInstance, email, password) => authInstance.createUserWithEmailAndPassword(email, password),
      updatePassword: (user, password) => user.updatePassword(password),
      deleteUser: user => (typeof user.delete === 'function' ? user.delete() : Promise.reject(new Error('Delete user is not available.'))),
      signOut: authInstance => authInstance.signOut()
    };
    firebaseSync.enabled = true;
    firebaseSync.initialized = true;
    firebaseSync.lastError = '';
    setStatus('Firebase connected');
    return true;
  } catch (error) {
    console.warn('Firebase compat SDK initialization failed.', error);
    firebaseSync.lastError = error?.message || String(error);
    return false;
  }
}

async function initFirebaseSync() {
  ensureFirebaseFrontendConfig();
  firebaseSync.lastError = '';
  if (!hasFirebaseConfig()) {
    firebaseSync.enabled = false;
    firebaseSync.initialized = false;
    return false;
  }

  if (firebaseSync.initialized) return true;
  if (firebaseSync.initializing) return firebaseSync.initializing;
  if (navigator.onLine === false) {
    firebaseSync.enabled = false;
    firebaseSync.initialized = false;
    firebaseSync.lastError = 'You are offline. Reconnect, then try again.';
    return false;
  }

  firebaseSync.initializing = (async () => {
    // Use an already-loaded compat SDK when a deployment provides one.
    if (initFirebaseWithCompatSDK()) return true;

    // Standard free-only build: load Firebase ESM modules directly from the
    // official CDN. Parallel loading plus a timeout avoids an endless login
    // spinner on weak or interrupted school Wi-Fi.
    try {
      const version = firebaseSync.sdkVersion;
      const [appModule, firestoreModule, authModule] = await withTimeout(
        Promise.all([
          import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
          import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`),
          import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`)
        ]),
        15000,
        'Firebase took too long to load. Check the connection and try again.'
      );

      const app = appModule.getApps && appModule.getApps().length
        ? appModule.getApp()
        : appModule.initializeApp(window.MCS_FIREBASE_CONFIG);
      firebaseSync.db = firestoreModule.getFirestore(app);
      firebaseSync.auth = authModule.getAuth(app);
      firebaseSync.modules = firestoreModule;
      firebaseSync.authModule = authModule;
      firebaseSync.enabled = true;
      firebaseSync.initialized = true;
      firebaseSync.lastError = '';
      setStatus('Firebase connected');
      return true;
    } catch (error) {
      console.warn('Firebase connection failed. Guest/local mode will continue.', error);
      firebaseSync.lastError = error?.message || String(error);
      firebaseSync.enabled = false;
      firebaseSync.initialized = false;
      setStatus(navigator.onLine === false ? 'Offline mode' : 'Local mode');
      return false;
    }
  })();

  try {
    return await firebaseSync.initializing;
  } finally {
    // A failed first attempt must not permanently block a later retry after the
    // connection returns. Successful calls are still short-circuited by
    // firebaseSync.initialized above.
    firebaseSync.initializing = null;
  }
}

function getCloudActivitiesDocRef() {
  const { doc } = firebaseSync.modules;
  return doc(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId);
}

async function loadActivitiesFromCloud() {
  const ready = await initFirebaseSync();
  if (!ready) return false;

  try {
    const { getDoc } = firebaseSync.modules;
    const snap = await getDoc(getCloudActivitiesDocRef());
    if (!snap.exists()) {
      if (isTeacherAuthenticated()) {
        await saveActivitiesToCloud();
      }
      return false;
    }

    const data = snap.data() || {};
    let loadedCloudSettings = false;
    if (data.studentAssistanceSettings && typeof data.studentAssistanceSettings === 'object') {
      applyStudentAssistanceSettings(data.studentAssistanceSettings);
      setAssistanceSettingsStatus('Global student assistance settings loaded from Firebase.', 'success');
      loadedCloudSettings = true;
    }

    if (!Array.isArray(data.activities) || !data.activities.length) return loadedCloudSettings;

    activities = normalizeActivities(data.activities);
    initManualRubricInputTable();
saveActivities({ cloud: false });

    if (!activities.some(item => item.id === selectedActivityId)) {
      selectedActivityId = '';
      saveJSON(STORAGE_KEYS.selectedActivityId, '');
    }

    activity = selectedActivityId ? getActivityById(selectedActivityId) : null;
    codeStore = activity ? getCodeStoreForActivity(activity.id) : normalizeCodeStore(starterCode);
    adminEditingActivityId = activity?.id || activities[0]?.id || '';

    renderActivitySummary();
    renderAdminActivitySelect();
    loadActiveEditor();
    resetResultPanel();
    runCode(false, { scroll: false });
    setStatus('Cloud activities loaded');
    return true;
  } catch (error) {
    console.warn('Could not load cloud activities.', error);
    setStatus('Cloud load failed');
    return false;
  }
}

async function saveActivitiesToCloud() {
  const ready = await initFirebaseSync();
  if (!ready) return false;

  if (!isTeacherAuthenticated()) {
    setStatus('Teacher login required');
    return false;
  }

  try {
    const { setDoc, serverTimestamp } = firebaseSync.modules;
    await setDoc(getCloudActivitiesDocRef(), {
      title: 'Grade 8 MCSian Web Code Editor',
      updatedAt: serverTimestamp(),
      activities: activities.map(item => normalizeActivity(item)),
      studentAssistanceSettings: normalizeAssistanceSettings(studentAssistanceSettings)
    }, { merge: true });
    setStatus('Saved to Firebase');
    return true;
  } catch (error) {
    console.warn('Could not save activities to Firebase.', error);
    setStatus('Firebase save failed');
    return false;
  }
}

async function saveStudentAssistanceSettingsToCloud(settings = studentAssistanceSettings) {
  const ready = await initFirebaseSync();
  if (!ready) {
    setAssistanceSettingsStatus(`Firebase is not ready. ${firebaseSync.lastError || 'Check the connection and uploaded files.'}`, 'error');
    return false;
  }

  if (!isTeacherAuthenticated()) {
    setAssistanceSettingsStatus('Applied on this device. Login below to publish these controls to every student device.', 'warning');
    updateAssistancePublishUI();
    return false;
  }

  try {
    const { setDoc, serverTimestamp } = firebaseSync.modules;
    await setDoc(getCloudActivitiesDocRef(), {
      studentAssistanceSettings: normalizeAssistanceSettings(settings),
      studentAssistanceUpdatedAt: serverTimestamp()
    }, { merge: true });
    setAssistanceSettingsStatus('Published to all students. Open student pages will update automatically.', 'success');
    setStatus('Student assistance published');
    return true;
  } catch (error) {
    console.warn('Could not publish student assistance settings.', error);
    setAssistanceSettingsStatus('Firebase rejected the settings update. Check teacher login and Firestore Rules.', 'error');
    return false;
  }
}

async function publishAssistanceSettings() {
  const settings = applyAssistanceSettingsFromControls({ silent: true });
  if (!isTeacherAuthenticated()) {
    setAssistanceSettingsStatus('Applied here. Login below, then press Publish again to update all student devices.', 'warning');
    pinScreen?.classList.remove('hidden');
    window.setTimeout(() => adminEmail?.focus({ preventScroll: true }), 80);
    return;
  }
  publishAssistanceBtn.disabled = true;
  const previousText = publishAssistanceBtn.textContent;
  publishAssistanceBtn.textContent = 'Publishing...';
  try {
    await saveStudentAssistanceSettingsToCloud(settings);
  } finally {
    publishAssistanceBtn.disabled = false;
    publishAssistanceBtn.textContent = previousText;
    updateAssistancePublishUI();
  }
}

async function watchStudentAssistanceSettings() {
  const ready = await initFirebaseSync();
  if (!ready || !firebaseSync.modules?.onSnapshot) return false;

  if (typeof unsubscribeCloudAssistanceSettings === 'function') {
    unsubscribeCloudAssistanceSettings();
  }

  try {
    unsubscribeCloudAssistanceSettings = firebaseSync.modules.onSnapshot(
      getCloudActivitiesDocRef(),
      snap => {
        if (!snap.exists()) return;
        const data = snap.data() || {};
        if (!data.studentAssistanceSettings) return;
        applyStudentAssistanceSettings(data.studentAssistanceSettings);
        if (adminOverlay && !adminOverlay.classList.contains('hidden')) {
          setAssistanceSettingsStatus('Live global settings synced from Firebase.', 'success');
        }
      },
      error => console.warn('Student assistance live sync failed.', error)
    );
    return true;
  } catch (error) {
    console.warn('Could not start student assistance live sync.', error);
    return false;
  }
}

function queueCloudActivitiesSave() {
  if (!hasFirebaseConfig()) return;
  window.clearTimeout(queueCloudActivitiesSave.timer);
  queueCloudActivitiesSave.timer = window.setTimeout(() => {
    saveActivitiesToCloud();
  }, 450);
}

async function saveSubmissionToCloud(result) {
  // Guest practice never creates a cloud record. Logged-in project results are
  // saved both in the project and in the teacher submission history.
  if (!isStudentProjectActive()) return false;
  const ready = await initFirebaseSync();
  if (!ready || !activity || !result) return false;

  try {
    const { collection, addDoc, serverTimestamp } = firebaseSync.modules;
    const submissionRef = collection(firebaseSync.db, firebaseSync.collectionName, firebaseSync.documentId, 'submissions');
    await addDoc(submissionRef, {
      studentUid: appSession.student.uid,
      studentId: appSession.student.studentId,
      studentName: appSession.student.name,
      section: appSession.student.section,
      projectId: appSession.currentProjectId,
      projectName: appSession.currentProject?.name || 'Untitled Project',
      activityId: activity.id,
      activityTitle: activity.title,
      submittedAt: serverTimestamp(),
      score: result.score,
      possible: result.possible,
      percent: result.percent,
      passed: result.passed,
      feedback: result.feedback,
      code: normalizeCodeStore(codeStore),
      results: result.results.map(item => ({
        title: item.title,
        levelKey: item.levelKey,
        levelLabel: item.levelLabel,
        earned: item.earned,
        points: item.points,
        rule: item.rule,
        target: item.target || ''
      }))
    });
    setStatus('Result saved to project');
    return true;
  } catch (error) {
    console.warn('Could not save submission to Firebase.', error);
    setStatus('Project saved; submission history failed');
    return false;
  }
}

function updateTeacherLoginUI(user = firebaseSync.currentUser) {
  const isTeacher = Boolean(user && user.email && isAllowedTeacherEmail(user.email));
  adminQuickUnlocked = false;
  adminUnlocked = isTeacher;

  if (logoutAdminBtn) {
    logoutAdminBtn.classList.toggle('hidden', !user);
  }

  if (adminEmail && user?.email) {
    adminEmail.value = user.email;
  }

  const note = document.getElementById('teacherLoginNote');
  if (note) {
    note.textContent = isTeacher
      ? `Signed in as ${user.email}. You have full admin access.`
      : user
        ? `Signed in as ${user.email}, but this account is not allowed to manage rubrics.`
        : `Code uses the saved teacher email (${getDefaultTeacherEmail() || 'not set'}) with the teacher account password. Password mode lets you type the email manually.`;
  }

  if (isTeacher) {
    showTeacherLoginError('');
  }

  updateAssistancePublishUI();
}

async function watchTeacherAuth() {
  const ready = await initFirebaseSync();
  if (!ready || !firebaseSync.auth || !firebaseSync.authModule) return;

  const { onAuthStateChanged } = firebaseSync.authModule;
  onAuthStateChanged(firebaseSync.auth, user => {
    firebaseSync.currentUser = user;
    updateTeacherLoginUI(user);
    handleStudentAuthObserver(user).catch(error => console.warn('Student auth observer failed.', error));

    if (!adminOverlay.classList.contains('hidden')) {
      if (isAdminPanelUnlocked()) {
        showAdminForm();
      } else {
        pinScreen.classList.remove('hidden');
        adminForm.classList.add('hidden');
        adminForm.classList.remove('visible');
      }
    }
  });
}

async function startFirebaseMode() {
  if (!hasFirebaseConfig()) {
    setStatus('Local mode');
    return;
  }
  await initFirebaseSync();
  await loadActivitiesFromCloud();
  await watchStudentAssistanceSettings();
  await watchTeacherAuth();
}

/* =========================================================
   FREE STUDENT ACCOUNTS + CLOUD PROJECTS
   Uses only Firebase Authentication and Cloud Firestore.
   No Cloud Functions, Storage, or paid backend is required.
   ========================================================= */
