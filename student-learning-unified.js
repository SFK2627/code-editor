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
      button.title = themeLocked ? 'Appearance is controlled by your teacher' : 'Switch appearance';
      button.setAttribute('aria-label', button.title);
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
  for (const screen of routes) observer.observe(screen, {attributes:true,attributeFilter:['class']});
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
