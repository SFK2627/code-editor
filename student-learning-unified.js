/* G8Code Student Learning UI: reuse the existing Home router, published-theme
   permissions, and modal lifecycle. No new cloud reads/writes or route storage. */
(() => {
  'use strict';
  const lessons = document.getElementById('lessonViewerScreen');
  const activities = document.getElementById('givenActivitiesScreen');
  if (!lessons || !activities) return;
  const routes = [lessons, activities];
  const lessonModal = document.getElementById('lessonPdfOverlay');
  const activityModal = document.getElementById('givenActivityViewerOverlay');
  const isStudent = () => Boolean(document.body.classList.contains('student-session-active'));
  let previousLessonVisible = false;
  let previousActivitiesVisible = false;

  function syncLearningUI() {
    const student = isStudent();
    for (const screen of routes) {
      screen.classList.toggle('is-learning-student', student);
    }
    lessons.classList.toggle('learning-modal-open', !!lessonModal && !lessonModal.classList.contains('hidden'));
    activities.classList.toggle('learning-modal-open', !!activityModal && !activityModal.classList.contains('hidden'));
    // Respect the EXISTING admin switch that hides the Home appearance toggle.
    const homeTheme = document.getElementById('studentHomeThemeBtn');
    const themeLocked = student && !!homeTheme && homeTheme.classList.contains('hidden');
    for (const id of ['lessonLibraryThemeBtn','givenActivitiesThemeBtn']) {
      const button = document.getElementById(id);
      if (!button) continue;
      if (student && themeLocked) button.classList.add('hidden');
      // Public lessons own a separate reader preference; do not let the
      // signed-in student theme lock hide the guest switch. The original
      // Lessons handler supplies the correct current Light/Dark label.
      if (!student && id === 'lessonLibraryThemeBtn') {
        button.classList.remove('hidden');
        button.setAttribute('aria-hidden', 'false');
        continue;
      }
      button.title = themeLocked ? 'Appearance is controlled by your teacher' : 'Switch appearance';
      button.setAttribute('aria-label', button.title);
    }
    // V2.39: Older Admin themes apply !important styling to individual Term
    // buttons. Set only these compact contrast-critical controls directly so
    // the visible label and count always contrast with the current surface.
    // This runs on theme/state changes, never on every scroll or animation.
    if (!lessons.classList.contains('hidden')) {
      const appearance = student
        ? (document.body.dataset.studentAppAppearance || document.documentElement.dataset.theme || 'light')
        : (lessons.dataset.lessonAppearance || document.documentElement.dataset.theme || 'light');
      const dark = appearance === 'dark';
      for (const tab of lessons.querySelectorAll('.lesson-term-tab')) {
        const active = tab.classList.contains('active');
        const tabBg = active ? '#1769cb' : dark ? '#263b56' : '#e8eff8';
        const tabInk = active ? '#ffffff' : dark ? '#edf4ff' : '#344a67';
        tab.style.setProperty('background', tabBg, 'important');
        tab.style.setProperty('background-image', 'none', 'important');
        tab.style.setProperty('border-color', active ? '#1769cb' : dark ? '#4c6481' : '#bfcedf', 'important');
        tab.style.setProperty('color', tabInk, 'important');
        tab.style.setProperty('-webkit-text-fill-color', tabInk, 'important');
        const count = tab.querySelector('span');
        if (count) {
          count.style.setProperty('background', active ? 'rgba(1,27,67,.28)' : dark ? '#35516f' : '#d3deec', 'important');
          count.style.setProperty('color', tabInk, 'important');
          count.style.setProperty('-webkit-text-fill-color', tabInk, 'important');
        }
      }
    }
    const term = document.querySelector('#lessonTermTabs [data-lesson-term].active');
    const termLabel = document.getElementById('lessonLibraryCurrentTermPill');
    if (term && termLabel) termLabel.textContent = (term.textContent || 'Current Term').trim().replace(/\s*\d+$/, '') || 'Current Term';
    const lessonVisible = !lessons.classList.contains('hidden');
    const activityVisible = !activities.classList.contains('hidden');
    if (lessonVisible && !previousLessonVisible) lessons.scrollTop = 0;
    if (activityVisible && !previousActivitiesVisible) {
      const main = activities.querySelector('.given-activities-main');
      if (main) main.scrollTop = 0;
    }
    previousLessonVisible = lessonVisible;
    previousActivitiesVisible = activityVisible;
  }

  // The original Home action handler remains the single source of truth for
  // Home, Projects, Lessons, Activities, Explore, account and sign-out.
  function route(action, from) {
    if (!isStudent() || typeof handleStudentHomeAction !== 'function') return;
    if (['home','projects','lessons','activities','explorer'].includes(action)) {
      if (action !== 'lessons' && from === lessons) {
        if (lessonModal && !lessonModal.classList.contains('hidden')) return;
        lessons.classList.add('hidden');
        document.body.classList.remove('lesson-viewer-active');
      }
      if (action !== 'activities' && from === activities) {
        if (activityModal && !activityModal.classList.contains('hidden')) return;
        activities.classList.add('hidden');
        document.body.classList.remove('given-activities-active');
      }
    }
    handleStudentHomeAction(action);
    syncLearningUI();
  }

  for (const screen of routes) {
    screen.addEventListener('click', event => {
      const button = event.target.closest('button[data-learning-action]');
      if (!button || !screen.contains(button)) return;
      event.preventDefault();
      event.stopPropagation();
      const action = button.dataset.learningAction;
      if (!action) return;
      route(action, screen);
    });
  }

  // Reset the screen displayed behind a newly opened page when switching
  // directly between Lessons and Activities. Original back buttons remain.
  const observer = new MutationObserver(syncLearningUI);
  observer.observe(document.body, {attributes:true,attributeFilter:['class','data-student-app-theme','data-student-app-appearance','data-student-app-choice']});
  for (const screen of routes) observer.observe(screen, {attributes:true,attributeFilter:['class','data-lesson-appearance']});
  for (const modal of [lessonModal,activityModal]) {
    if (modal) observer.observe(modal,{attributes:true,attributeFilter:['class']});
  }
  const tabs = document.getElementById('lessonTermTabs');
  if (tabs) observer.observe(tabs,{subtree:true,attributes:true,attributeFilter:['class','aria-selected']});
  const homeTheme = document.getElementById('studentHomeThemeBtn');
  if (homeTheme) observer.observe(homeTheme,{attributes:true,attributeFilter:['class']});
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  syncLearningUI();
})();
