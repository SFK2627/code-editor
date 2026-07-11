/* Quality gate v100: runtime health, storage pressure, and recoverability diagnostics. */
(function installQualityGateDiagnostics() {
  const RELEASE_ID = '20260711-overall-100-readiness';
  const REQUIRED_IDS = [
    'entryGate', 'openStudentLoginBtn', 'continueGuestBtn', 'studentLoginOverlay',
    'studentDashboard', 'newProjectBtn', 'projectNameOverlay', 'runBtn',
    'resultBtn', 'codeEditor', 'previewFrame', 'workspace', 'adminOverlay',
    'activitySelect', 'activityCard', 'statusBadge'
  ];

  function safeCall(fn, fallback) {
    try { return fn(); } catch (error) { return fallback; }
  }

  function setHealthDataset(status) {
    const root = document.documentElement;
    if (!root) return;
    root.dataset.appRelease = RELEASE_ID;
    root.dataset.appHealth = status;
  }

  function runHealthCheck() {
    const missingIds = REQUIRED_IDS.filter(id => !document.getElementById(id));
    const duplicateIds = safeCall(() => {
      const seen = new Set();
      const duplicates = new Set();
      document.querySelectorAll('[id]').forEach(el => {
        if (seen.has(el.id)) duplicates.add(el.id);
        seen.add(el.id);
      });
      return Array.from(duplicates);
    }, []);
    const health = {
      release: RELEASE_ID,
      checkedAt: new Date().toISOString(),
      ok: missingIds.length === 0 && duplicateIds.length === 0,
      missingIds,
      duplicateIds,
      firebaseConfigured: Boolean(window.MCS_FIREBASE_CONFIG && window.MCS_FIREBASE_CONFIG.projectId),
      serviceWorkerSupported: 'serviceWorker' in navigator,
      installedMode: typeof isAppInstalledMode === 'function' ? isAppInstalledMode() : false,
      online: navigator.onLine !== false,
      deviceMode: document.documentElement?.dataset?.deviceMode || ''
    };
    window.MCS_APP_RELEASE = RELEASE_ID;
    window.MCS_APP_HEALTH = health;
    setHealthDataset(health.ok ? 'ok' : 'warning');
    if (!health.ok) console.warn('Sir JR Coding App health warning:', health);
    return health;
  }

  async function checkStoragePressure() {
    if (!navigator.storage || typeof navigator.storage.estimate !== 'function') return null;
    try {
      const estimate = await navigator.storage.estimate();
      const quota = Number(estimate.quota || 0);
      const usage = Number(estimate.usage || 0);
      if (!quota) return estimate;
      const ratio = usage / quota;
      window.MCS_STORAGE_HEALTH = { usage, quota, ratio };
      if (ratio >= 0.9 && typeof setStatus === 'function') {
        setStatus('Device storage almost full. Save or export your project soon.');
      }
      return estimate;
    } catch (error) {
      console.warn('Storage health check skipped.', error);
      return null;
    }
  }

  window.MCS_RUN_HEALTH_CHECK = runHealthCheck;
  window.addEventListener('load', () => {
    window.setTimeout(runHealthCheck, 600);
    window.setTimeout(checkStoragePressure, 1600);
  }, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      window.setTimeout(runHealthCheck, 250);
      window.setTimeout(checkStoragePressure, 800);
    }
  });
})();
