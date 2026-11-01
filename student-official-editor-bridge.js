/* G8Code Studio -> main SPA: verified, one-time deep navigation.
   A Firebase user alone is not enough: we validate the matching student profile
   before activating the Student session. Never silently sign in another account. */
(() => {
  'use strict';
  const KEY = 'g8code.officialStudio.return.v1';
  const ROUTES = new Set(['home', 'projects', 'activities', 'lessons', 'explorer', 'logout', 'admin']);
  const loadingClass = 'studio-return-pending';
  const stopLoading = () => document.documentElement.classList.remove(loadingClass, 'studio-admin-return-pending');
  let pending;
  try { pending = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (_) { pending = null; }
  if (!pending || !ROUTES.has(pending.route) ||
      Date.now() - Number(pending.at || 0) > 3 * 60 * 1000 ||
      Number(pending.at || 0) > Date.now() + 10000) {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
    stopLoading();
    return;
  }
  const finish = () => {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
    stopLoading();
  };
  const fail = message => {
    console.warn('[Studio navigation] ' + message);
    finish();
    // The app's ordinary login screen is a safe fallback if the signed-in
    // identity has expired, changed, or cannot be verified.
    if (typeof showEntryGate === 'function' &&
        !document.body.classList.contains('student-session-active')) showEntryGate();
  };

  // A Studio admin shortcut opens the *existing protected Admin modal*, not
  // the student entry/login gate. The guest and signed-in routes intentionally
  // behave identically here: teacher authentication is still required.
  if (pending.route === 'admin') {
    try {
      if (typeof openAdminPanel !== 'function' || !document.getElementById('adminOverlay')) {
        throw new Error('Admin workspace is not ready');
      }
      // The entry gate is z-index:12000 while the Admin overlay is z-index:9000.
      // Leaving it visible used to cover the modal and look like a login redirect.
      // Also dismiss any student-only screens/overlays before opening Admin.
      if (typeof hideAllStudentScreens === 'function') hideAllStudentScreens();
      if (typeof hideEntryGate === 'function') hideEntryGate();
      const loadingAdmin = openAdminPanel();
      const overlay = document.getElementById('adminOverlay');
      if (overlay.classList.contains('hidden') || !document.body.classList.contains('admin-open')) {
        throw new Error('Admin workspace did not open');
      }
      // Make the PIN / teacher sign-in visible immediately. The asynchronous
      // Firebase initialization inside openAdminPanel may finish afterwards.
      // Record the exact Studio origin only AFTER the protected Admin overlay
      // is actually open. Closing it can then return to Studio V2 reliably.
      try {
        sessionStorage.setItem('g8code.studio.adminReturn.v1', JSON.stringify({
          at: Date.now(), uid: String(pending.uid || ''),
          guest: pending.guest === true || !pending.uid,
          projectId: String(pending.projectId || '').slice(0, 200)
        }));
      } catch (_) {}
      finish();
      Promise.resolve(loadingAdmin).catch(error => {
        console.error('[Studio Admin shortcut] Failed to initialize Admin', error);
        if (typeof showTeacherLoginError === 'function') {
          showTeacherLoginError('Admin services could not initialize. Please retry or check your connection.');
        }
      });
    } catch (error) {
      fail(error?.message || 'Could not open protected Admin access');
    }
    return;
  }
  // Studio already signed out before navigating to the main app.
  if (pending.route === 'logout') { finish(); return; }

  const openGuestDestination = async () => {
    // Returning to Guest Home must NOT bounce back into Studio V2.
    try { sessionStorage.setItem('g8code.officialStudio.guestHomeOnce', '1'); } catch (_) {}
    if (typeof continueAsGuest !== 'function') throw new Error('Guest mode is not ready');
    continueAsGuest();
    switch (pending.route) {
      case 'home': showGuestHome(); break;
      case 'projects': openStudentLogin(); break; // My Projects requires an account.
      case 'activities': await openGivenActivitiesLibrary('home'); break;
      case 'lessons': await openLessonLibrary('home'); break;
      case 'explorer':
        if (typeof window.openCodeExplorer === 'function') await window.openCodeExplorer();
        else showGuestHome();
        break;
    }
  };

  const getRestoredUser = async () => {
    if (typeof initFirebaseSync !== 'function' || !await initFirebaseSync()) {
      throw new Error('Firebase authentication is unavailable');
    }
    const authInstance = firebaseSync?.auth;
    const observeAuth = firebaseSync?.authModule?.onAuthStateChanged;
    if (!authInstance || typeof observeAuth !== 'function') throw new Error('Auth is not ready');
    // currentUser is often null before Firebase has restored its persisted
    // identity. Wait for the FIRST authoritative auth-state notification.
    return await new Promise((resolve, reject) => {
      let ended = false, unsubscribe = null, timeout;
      const done = (error, user) => {
        if (ended) return;
        ended = true;
        clearTimeout(timeout);
        try { unsubscribe?.(); } catch (_) {}
        if (error) reject(error); else resolve(user || null);
      };
      timeout = setTimeout(() => done(new Error('Auth restoration timed out')), 16000);
      try {
        unsubscribe = observeAuth(authInstance, user => done(null, user), error => done(error));
        if (ended) unsubscribe?.(); // handles synchronous observer implementations
      } catch (error) { done(error); }
    });
  };

  const openStudentDestination = async () => {
    const expectedUid = String(pending.uid || '');
    const user = await getRestoredUser();
    if (!user?.uid || user.uid !== expectedUid ||
        (typeof isTeacherUser === 'function' && isTeacherUser(user))) {
      throw new Error('Saved student session is missing or belongs to another user');
    }
    const profile = await loadStudentProfile(user.uid);
    if (!profile || profile.accountStatus === 'disabled' ||
        getFirebaseActiveUser()?.uid !== user.uid) {
      throw new Error('Saved student profile could not be verified');
    }
    // Re-establish the actual SPA session silently, without the login gate,
    // Continue button, post-login reminder, or unnecessary Home detour.
    // Mandatory password-change policy remains enforced by the original app.
    if (typeof activateStudentSession !== 'function') throw new Error('Student session activation unavailable');
    await activateStudentSession(profile, {
      showDashboard: false,
      suppressStatusReminder: true,
      resumeSession: true
    });
    if (profile.mustChangePassword !== false) {
      // The original app has opened the required password-change screen.
      return;
    }
    if (getFirebaseActiveUser()?.uid !== user.uid || appSession.mode !== 'student') {
      throw new Error('Student session changed during return navigation');
    }
    switch (pending.route) {
      case 'home': await showStudentHome({ suppressStatusReminder: true, deferRefresh: true }); break;
      case 'projects': await showStudentDashboard({ suppressStatusReminder: true, deferRefresh: true }); break;
      case 'activities': await openGivenActivitiesLibrary('home'); break;
      case 'lessons': await openLessonLibrary('home'); break;
      case 'explorer':
        if (typeof window.openCodeExplorer !== 'function') throw new Error('Code Explorer is not ready');
        await window.openCodeExplorer();
        break;
    }
  };

  (async () => {
    try {
      if (!pending.uid) await openGuestDestination();
      else await openStudentDestination();
      finish();
    } catch (error) {
      fail(error?.message || String(error));
    }
  })();
})();
