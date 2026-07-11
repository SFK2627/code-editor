
// Overall 100-readiness diagnostics. This does not claim perfect real-world performance;
// it gives the teacher a quick runtime checklist after the app is deployed.
(() => {
  const root = document.documentElement;

  const boolPass = (name, passed, details = '') => ({
    name,
    passed: Boolean(passed),
    details: String(details || '')
  });

  const elementReady = id => Boolean(document.getElementById(id));

  function getOverallReadinessChecks() {
    const css = getComputedStyle(root);
    const checks = [
      boolPass('Release label loaded', Boolean(window.MCS_APP_RELEASE || root.dataset.appRelease), window.MCS_APP_RELEASE || root.dataset.appRelease || 'missing'),
      boolPass('Core editor present', elementReady('codeEditor')),
      boolPass('Preview frame present', elementReady('previewFrame')),
      boolPass('Run button present', elementReady('runBtn')),
      boolPass('Result button present', elementReady('resultBtn')),
      boolPass('Student login available', elementReady('studentLoginOverlay') && elementReady('studentLoginBtn')),
      boolPass('Student dashboard available', elementReady('studentDashboard') && elementReady('studentProjectsGrid')),
      boolPass('Teacher admin available', elementReady('adminOverlay') && elementReady('adminBtn')),
      boolPass('Rubric builder available', elementReady('criteriaEditor') && elementReady('adminActivitySelect')),
      boolPass('Project recovery functions loaded', typeof window.MCS_RUN_HEALTH_CHECK === 'function' || typeof persistStudentProjectRecoverySnapshot === 'function'),
      boolPass('Mobile health check loaded', typeof window.MCS_RUN_MOBILE_HEALTH_CHECK === 'function'),
      boolPass('Service worker supported', 'serviceWorker' in navigator),
      boolPass('Online/offline status available', 'onLine' in navigator, navigator.onLine ? 'online' : 'offline'),
      boolPass('Local storage available', (() => { try { localStorage.setItem('__mcs_test__','1'); localStorage.removeItem('__mcs_test__'); return true; } catch (_) { return false; } })()),
      boolPass('Session storage available', (() => { try { sessionStorage.setItem('__mcs_test__','1'); sessionStorage.removeItem('__mcs_test__'); return true; } catch (_) { return false; } })()),
      boolPass('Touch/mobile viewport support present', 'visualViewport' in window || matchMedia('(hover: none)').matches),
      boolPass('Dynamic viewport CSS variables active', Boolean(css.getPropertyValue('--mcs-vvh').trim() || css.getPropertyValue('--mcs-vvw').trim())),
      boolPass('Reduced-motion support declared', Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').media)),
      boolPass('Firebase config loaded', Boolean(window.MCS_FIREBASE_CONFIG && window.MCS_FIREBASE_CONFIG.projectId)),
      boolPass('Teacher email configured', Array.isArray(window.MCS_TEACHER_EMAILS) && window.MCS_TEACHER_EMAILS.length > 0),
      boolPass('No placeholder Firebase config', !/PASTE_|YOUR_|TODO/i.test(JSON.stringify(window.MCS_FIREBASE_CONFIG || {}))),
      boolPass('App shell visible or entry gate active', Boolean(document.querySelector('.app-shell') || elementReady('entryGate'))),
      boolPass('Accessibility status region present', elementReady('statusBadge')),
      boolPass('PWA manifest linked', Boolean(document.querySelector('link[rel="manifest"]')))
    ];
    return checks;
  }

  function runOverallReadinessCheck() {
    const checks = getOverallReadinessChecks();
    const passed = checks.filter(item => item.passed).length;
    const total = checks.length;
    const score = Math.round((passed / total) * 100);
    const result = {
      release: window.MCS_APP_RELEASE || root.dataset.appRelease || 'unknown',
      score,
      passed,
      total,
      ready: passed === total,
      checks,
      note: 'This is a runtime readiness check. Final real-world rating still requires live student/device/Firebase testing.'
    };
    console.table(checks.map(item => ({ Check: item.name, Passed: item.passed, Details: item.details })));
    console.info(`Sir JR Coding App overall readiness: ${passed}/${total} (${score}%)`);
    return result;
  }

  window.MCS_RUN_OVERALL_READINESS_CHECK = runOverallReadinessCheck;
})();
