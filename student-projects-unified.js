/* G8Code My Projects unified Student Home navigation.
   Routes and actions delegate to existing G8Code handlers; no new storage or Firebase calls. */
(() => {
  'use strict';
  const projects = document.getElementById('studentDashboard');
  const theme = document.getElementById('mpUnifiedThemeBtn');
  const home = document.getElementById('mpUnifiedHomeBtn');
  const logout = document.getElementById('mpUnifiedLogoutBtn');
  const homeTheme = document.getElementById('studentHomeThemeBtn');
  if (!projects) return;
  const isStudent = () => document.body.classList.contains('student-session-active');
  // Preserve the original theme toggle, sign out, and account settings behavior.
  theme?.addEventListener('click', () => {
    if (!isStudent() || homeTheme?.classList.contains('hidden')) return;
    document.getElementById('dashboardThemeBtn')?.click();
  });
  home?.addEventListener('click', () => {
    if (!isStudent()) return;
    // Delegate to the already working My Projects → Student Homepage action.
    document.getElementById('dashboardGoHomeBtn')?.click();
  });
  logout?.addEventListener('click', () => {
    if (isStudent()) document.getElementById('dashboardLogoutBtn')?.click();
  });
  projects.addEventListener('click', event => {
    const button = event.target.closest('button[data-projects-nav]');
    if (!button || !projects.contains(button) || !isStudent()) return;
    event.preventDefault();
    const action = button.dataset.projectsNav;
    if (action === 'projects') return;
    if (['home','lessons','activities','explorer'].includes(action)
        && typeof handleStudentHomeAction === 'function') {
      handleStudentHomeAction(action);
    }
  });
  let wasVisible = false;
  let syncPending = false;
  const sync = () => {
    syncPending = false;
    const student = isStudent();
    const visible = student && !projects.classList.contains('hidden');
    // Same teacher-published appearance setting as Student Home.
    const locked = !!homeTheme && homeTheme.classList.contains('hidden');
    if (theme) {
      theme.classList.toggle('hidden', locked || !student);
      theme.disabled = locked || !student;
      theme.title = locked ? 'Appearance is controlled by your teacher' : 'Switch appearance';
      theme.setAttribute('aria-label', theme.title);
    }
    if (visible && !wasVisible) projects.scrollTop = 0;
    wasVisible = visible;
  };
  const queue = () => {
    if (syncPending) return;
    syncPending = true;
    requestAnimationFrame(sync);
  };
  const observer = new MutationObserver(queue);
  observer.observe(projects,{attributes:true,attributeFilter:['class']});
  observer.observe(document.body,{attributes:true,attributeFilter:['class','data-student-app-theme','data-student-app-appearance','data-student-app-choice']});
  if (homeTheme) observer.observe(homeTheme,{attributes:true,attributeFilter:['class']});
  sync();
})();
