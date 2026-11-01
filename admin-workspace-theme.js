/* G8Code Admin Workspace Appearance — UI only; does not write Firebase settings. */
(() => {
  'use strict';
  const select = document.getElementById('adminAppearanceSelect');
  const root = document.getElementById('adminOverlay');
  if (!select || !root) return;
  const storageKey = 'g8code.adminWorkspaceAppearance.v1';
  const linkedOverlays = [
    'adminComplianceDetailOverlay', 'sperfRosterOverlay', 'codeExplorerAdminDetailOverlay',
    'adminStudentProjectsOverlay', 'adminProjectViewerOverlay',
    'adminWireframeViewerOverlay', 'adminProjectFullscreenOverlay',
    'engagementAnalyticsOverlay'
  ].map(id => document.getElementById(id)).filter(Boolean);
  let preference = 'auto';
  try {
    const existing = localStorage.getItem(storageKey);
    if (['auto', 'light', 'dark'].includes(existing)) preference = existing;
  } catch (_) { /* Local storage may be disabled in private browsing. */ }
  select.value = preference;

  function update() {
    const parentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const appearance = preference === 'auto' ? parentTheme : preference;
    [root, ...linkedOverlays].forEach(overlay => {
      overlay.dataset.adminAppearance = appearance;
      overlay.style.colorScheme = appearance;
    });
    select.setAttribute('title', preference === 'auto'
      ? `Following app appearance (${appearance}). Student theme settings are unchanged.`
      : `Admin-only ${appearance} appearance. Student theme settings are unchanged.`);
  }

  select.addEventListener('change', () => {
    preference = ['auto', 'light', 'dark'].includes(select.value) ? select.value : 'auto';
    try { localStorage.setItem(storageKey, preference); } catch (_) {}
    update();
  });

  // Follow-App mode must react to the EXISTING light/dark app control immediately.
  new MutationObserver(update).observe(document.documentElement, {attributes:true,attributeFilter:['data-theme']});
  // If a published theme is loaded after Firebase initialization, its accent
  // variables update automatically via CSS; no custom Firestore writes needed.
  update();
})();
