const editor = document.getElementById('codeEditor');
const previewFrame = document.getElementById('previewFrame');
const runBtn = document.getElementById('runBtn');
const autoRunBtn = document.getElementById('autoRunBtn');
const resultBtn = document.getElementById('resultBtn');
const aiReviewTopBtn = document.getElementById('aiReviewTopBtn');
const saveBtn = document.getElementById('saveBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const resetBtn = document.getElementById('resetBtn');
const clearBtn = document.getElementById('clearBtn');
const themeToggle = document.getElementById('themeToggle');
const entryThemeToggle = document.getElementById('entryThemeToggle');
const entryThemeLabel = document.getElementById('entryThemeLabel');
const installAppBtn = document.getElementById('installAppBtn');
const adminBtn = document.getElementById('adminBtn');
const lineNumbers = document.getElementById('lineNumbers');
const suggestionBox = document.getElementById('suggestionBox');
const codeMatchLayer = document.getElementById('codeMatchLayer');
const editorWrap = document.querySelector('.editor-wrap');
const editorStack = document.querySelector('.editor-stack');
const tagMatchInfo = document.getElementById('tagMatchInfo');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const zoomLevel = document.getElementById('zoomLevel');
const fullEditorBtn = document.getElementById('fullEditorBtn');
const exitEditorBtn = document.getElementById('exitEditorBtn');
const exitEditorStickyBtn = document.getElementById('exitEditorStickyBtn');
const fullscreenEditorActions = document.getElementById('fullscreenEditorActions');
const fullscreenRunBtn = document.getElementById('fullscreenRunBtn');
const fullscreenAutoRunBtn = document.getElementById('fullscreenAutoRunBtn');
const fullscreenResultBtn = document.getElementById('fullscreenResultBtn');
const statusBadge = document.getElementById('statusBadge');
const editorInfo = document.getElementById('editorInfo');
const structureAlert = document.getElementById('structureAlert');
const tabButtons = document.querySelectorAll('.tab-btn');

function syncLanguageToolbarAccessibility() {
  tabButtons.forEach(tab => {
    const active = tab.classList.contains('active');
    tab.setAttribute('aria-pressed', String(active));
    if (!tab.getAttribute('aria-label')) {
      tab.setAttribute('aria-label', `${tab.textContent.trim()} code editor`);
    }
  });
}

tabButtons.forEach(tab => {
  new MutationObserver(syncLanguageToolbarAccessibility).observe(tab, {
    attributes: true,
    attributeFilter: ['class']
  });
});
syncLanguageToolbarAccessibility();
const resultContent = document.getElementById('resultContent');
const errorCheckerPanel = document.getElementById('errorCheckerPanel');
const errorCheckerContent = document.getElementById('errorCheckerContent');
const refreshErrorCheckerBtn = document.getElementById('refreshErrorCheckerBtn');
const advancedErrorCheckBtn = document.getElementById('advancedErrorCheckBtn');
const codeHelperFloatingBtn = document.getElementById('codeHelperFloatingBtn');
const closeCodeHelperBtn = document.getElementById('closeCodeHelperBtn');
const aiReviewContent = document.getElementById('aiReviewContent');
const runAiReviewBtn = document.getElementById('runAiReviewBtn');
const activityTitle = document.getElementById('activityTitle');
const activityDescription = document.getElementById('activityDescription');
const activitySelect = document.getElementById('activitySelect');
const resetActivityCodeBtn = document.getElementById('resetActivityCodeBtn');
const activityCard = document.getElementById('activityCard');
const closeActivityCardBtn = document.getElementById('closeActivityCardBtn');
const activityWarning = document.getElementById('activityWarning');
const activityCriteriaStat = document.getElementById('activityCriteriaStat');
const activityRubricOverlay = document.getElementById('activityRubricOverlay');
const activityRubricTitle = document.getElementById('activityRubricTitle');
const activityRubricMeta = document.getElementById('activityRubricMeta');
const activityRubricTable = document.getElementById('activityRubricTable');
const closeActivityRubricBtn = document.getElementById('closeActivityRubricBtn');

// Keep activity dialogs attached to <body> so fixed overlays center to the real viewport,
// not to the app shell/header layout.
[activityCard, activityRubricOverlay].forEach(dialog => {
  if (dialog && dialog.parentElement !== document.body) document.body.appendChild(dialog);
});
const stepActivityBtn = document.getElementById('stepActivityBtn');
const stepCodeBtn = document.getElementById('stepCodeBtn');
const stepRunBtn = document.getElementById('stepRunBtn');
const stepResultBtn = document.getElementById('stepResultBtn');
const editorPanel = document.getElementById('editorPanel');
const previewPanel = document.getElementById('previewPanel');
const resultPanel = document.getElementById('resultPanel');
const totalPoints = document.getElementById('totalPoints');
const criteriaCount = document.getElementById('criteriaCount');
const workspace = document.getElementById('workspace');
const layoutButtons = document.querySelectorAll('.layout-btn[data-layout]');
const fullPreviewBtn = document.getElementById('fullPreviewBtn');
const desktopPreviewBtn = document.getElementById('desktopPreviewBtn');
const exitPreviewBtn = document.getElementById('exitPreviewBtn');
const adminOverlay = document.getElementById('adminOverlay');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const adminQuickCode = document.getElementById('adminQuickCode');
const adminCodeModeBtn = document.getElementById('adminCodeModeBtn');
const adminPasswordModeBtn = document.getElementById('adminPasswordModeBtn');
const adminCodeLoginPanel = document.getElementById('adminCodeLoginPanel');
const teacherPasswordLoginPanel = document.getElementById('teacherPasswordLoginPanel');
const unlockAdminCodeBtn = document.getElementById('unlockAdminCodeBtn');
const unlockAdminBtn = document.getElementById('unlockAdminBtn');
const logoutAdminBtn = document.getElementById('logoutAdminBtn');
const pinScreen = document.getElementById('pinScreen');
const adminForm = document.getElementById('adminForm');
const adminTabButtons = Array.from(document.querySelectorAll('[data-admin-tab]'));
const adminTabPanels = Array.from(document.querySelectorAll('[data-admin-panel]'));
const ADMIN_TAB_STORAGE_KEY = 'mcsian.admin.activeTab';
const adminActivityTitle = document.getElementById('adminActivityTitle');
const adminActivityDescription = document.getElementById('adminActivityDescription');
const adminPassingScore = document.getElementById('adminPassingScore');
const adminActivitySelect = document.getElementById('adminActivitySelect');
const newActivityBtn = document.getElementById('newActivityBtn');
const duplicateActivityBtn = document.getElementById('duplicateActivityBtn');
const deleteActivityBtn = document.getElementById('deleteActivityBtn');
const criteriaEditor = document.getElementById('criteriaEditor');
const addCriterionBtn = document.getElementById('addCriterionBtn');
const resetRubricBtn = document.getElementById('resetRubricBtn');
const rubricImageInput = document.getElementById('rubricImageInput');
const importRubricImageBtn = document.getElementById('importRubricImageBtn');
const clearRubricImageBtn = document.getElementById('clearRubricImageBtn');
const rubricImageStatus = document.getElementById('rubricImageStatus');
const rubricImagePreviewWrap = document.getElementById('rubricImagePreviewWrap');
const rubricImagePreview = document.getElementById('rubricImagePreview');
const appDialogOverlay = document.getElementById('appDialogOverlay');
const appDialogCard = appDialogOverlay?.querySelector('.app-dialog-card');
const appDialogIcon = document.getElementById('appDialogIcon');
const appDialogKicker = document.getElementById('appDialogKicker');
const appDialogTitle = document.getElementById('appDialogTitle');
const appDialogMessage = document.getElementById('appDialogMessage');
const appDialogOkBtn = document.getElementById('appDialogOkBtn');
const appDialogCancelBtn = document.getElementById('appDialogCancelBtn');
const rubricExtractedText = document.getElementById('rubricExtractedText');
const fillRubricTextBtn = document.getElementById('fillRubricTextBtn');
const manualRubricInputBody = document.getElementById('manualRubricInputBody');
const manualExcellentScore = document.getElementById('manualExcellentScore');
const manualGoodScore = document.getElementById('manualGoodScore');
const manualFairScore = document.getElementById('manualFairScore');
const manualNeedsScore = document.getElementById('manualNeedsScore');
const addManualRubricRowBtn = document.getElementById('addManualRubricRowBtn');
const applyManualRubricBtn = document.getElementById('applyManualRubricBtn');
const clearManualRubricBtn = document.getElementById('clearManualRubricBtn');
const manualRubricStatus = document.getElementById('manualRubricStatus');
const renameFilesBtn = document.getElementById('renameFilesBtn');
const fileNameDialogOverlay = document.getElementById('fileNameDialogOverlay');
const closeFileNameDialogBtn = document.getElementById('closeFileNameDialogBtn');
const cancelFileNameDialogBtn = document.getElementById('cancelFileNameDialogBtn');
const applyFileNamesBtn = document.getElementById('applyFileNamesBtn');
const defaultFileNamesBtn = document.getElementById('defaultFileNamesBtn');
const htmlFileNameInput = document.getElementById('htmlFileNameInput');
const cssFileNameInput = document.getElementById('cssFileNameInput');
const jsFileNameInput = document.getElementById('jsFileNameInput');
const fileNameDialogNote = document.getElementById('fileNameDialogNote');
const htmlPageManager = document.getElementById('htmlPageManager');
const htmlPageSelect = document.getElementById('htmlPageSelect');
const addHtmlPageBtn = document.getElementById('addHtmlPageBtn');
const renameHtmlPageBtn = document.getElementById('renameHtmlPageBtn');
const deleteHtmlPageBtn = document.getElementById('deleteHtmlPageBtn');
const pageDialogOverlay = document.getElementById('pageDialogOverlay');
const pageDialogTitle = document.getElementById('pageDialogTitle');
const pageDialogText = document.getElementById('pageDialogText');
const htmlPageNameInput = document.getElementById('htmlPageNameInput');
const pageDialogNote = document.getElementById('pageDialogNote');
const closePageDialogBtn = document.getElementById('closePageDialogBtn');
const cancelPageDialogBtn = document.getElementById('cancelPageDialogBtn');
const applyPageDialogBtn = document.getElementById('applyPageDialogBtn');
const studentAssistanceSettingsCard = document.getElementById('studentAssistanceSettings');
const assistanceMasterToggle = document.getElementById('assistanceMasterToggle');
const codeSuggestionsToggle = document.getElementById('codeSuggestionsToggle');
const codeHelperToggle = document.getElementById('codeHelperToggle');
const teacherFeedbackToggle = document.getElementById('teacherFeedbackToggle');
const superStudioToggle = document.getElementById('superStudioToggle');
const autoRunControlToggle = document.getElementById('autoRunControlToggle');
const autoSaveControlToggle = document.getElementById('autoSaveControlToggle');
const externalLinksSamePreviewToggle = document.getElementById('externalLinksSamePreviewToggle');
const collaborationToggle = document.getElementById('collaborationToggle');
const collaborationEditToggle = document.getElementById('collaborationEditToggle');
const collaborationMembersToggle = document.getElementById('collaborationMembersToggle');
const applyAssistanceLocalBtn = document.getElementById('applyAssistanceLocalBtn');
const publishAssistanceBtn = document.getElementById('publishAssistanceBtn');
const assistanceSettingsStatus = document.getElementById('assistanceSettingsStatus');
const assistanceModeBadge = document.getElementById('assistanceModeBadge');
const aiReviewPanel = document.getElementById('aiReviewPanel');

// Student entry, account, dashboard, project, and admin tracker elements.
const entryGate = document.getElementById('entryGate');
const resumeStudentBtn = document.getElementById('resumeStudentBtn');
const resumeStudentText = document.getElementById('resumeStudentText');
const openStudentLoginBtn = document.getElementById('openStudentLoginBtn');
const continueGuestBtn = document.getElementById('continueGuestBtn');
const studentLoginOverlay = document.getElementById('studentLoginOverlay');
const closeStudentLoginBtn = document.getElementById('closeStudentLoginBtn');
const studentLoginId = document.getElementById('studentLoginId');
const studentLoginPassword = document.getElementById('studentLoginPassword');
const toggleStudentPasswordBtn = document.getElementById('toggleStudentPasswordBtn');
const studentLoginError = document.getElementById('studentLoginError');
const studentLoginBtn = document.getElementById('studentLoginBtn');
const studentLoginGuestBtn = document.getElementById('studentLoginGuestBtn');
const changePasswordOverlay = document.getElementById('changePasswordOverlay');
const studentNewPassword = document.getElementById('studentNewPassword');
const studentConfirmPassword = document.getElementById('studentConfirmPassword');
const changePasswordError = document.getElementById('changePasswordError');
const saveNewPasswordBtn = document.getElementById('saveNewPasswordBtn');
const changePasswordLogoutBtn = document.getElementById('changePasswordLogoutBtn');
const studentDashboard = document.getElementById('studentDashboard');
const dashboardGreeting = document.getElementById('dashboardGreeting');
const dashboardThemeBtn = document.getElementById('dashboardThemeBtn');
const dashboardLogoutBtn = document.getElementById('dashboardLogoutBtn');
const newProjectBtn = document.getElementById('newProjectBtn');
const projectSearchInput = document.getElementById('projectSearchInput');
const projectStatusFilter = document.getElementById('projectStatusFilter');
const projectDashboardStatus = document.getElementById('projectDashboardStatus');
const studentProjectsGrid = document.getElementById('studentProjectsGrid');
const projectNameOverlay = document.getElementById('projectNameOverlay');
const closeProjectNameBtn = document.getElementById('closeProjectNameBtn');
const projectNameKicker = document.getElementById('projectNameKicker');
const projectNameTitle = document.getElementById('projectNameTitle');
const projectNameInput = document.getElementById('projectNameInput');
const projectNameError = document.getElementById('projectNameError');
const saveProjectNameBtn = document.getElementById('saveProjectNameBtn');
const cancelProjectNameBtn = document.getElementById('cancelProjectNameBtn');
const appTitleText = document.getElementById('appTitleText');
const appSubtitleText = document.getElementById('appSubtitleText');
const studentAccountStrip = document.getElementById('studentAccountStrip');
const headerStudentGreeting = document.getElementById('headerStudentGreeting');
const studentSaveState = document.getElementById('studentSaveState');
const saveStudentProjectBtn = document.getElementById('saveStudentProjectBtn');
const studentMenuBtn = document.getElementById('studentMenuBtn');
const studentAccountMenu = document.getElementById('studentAccountMenu');
const menuStudentGreeting = document.getElementById('menuStudentGreeting');
const menuStudentSaveState = document.getElementById('menuStudentSaveState');
const menuSaveProjectBtn = document.getElementById('menuSaveProjectBtn');
const menuMyProjectsBtn = document.getElementById('menuMyProjectsBtn');
const menuStudentLogoutBtn = document.getElementById('menuStudentLogoutBtn');
const myProjectsBtn = document.getElementById('myProjectsBtn');
const studentHeaderLogoutBtn = document.getElementById('studentHeaderLogoutBtn');
const guestAccountStrip = document.getElementById('guestAccountStrip');
const guestLoginToSaveBtn = document.getElementById('guestLoginToSaveBtn');
const adminStudentId = document.getElementById('adminStudentId');
const adminStudentName = document.getElementById('adminStudentName');
const adminStudentGender = document.getElementById('adminStudentGender');
const adminStudentSection = document.getElementById('adminStudentSection');
const addStudentAccountBtn = document.getElementById('addStudentAccountBtn');
const downloadStudentTemplateBtn = document.getElementById('downloadStudentTemplateBtn');
const chooseStudentImportBtn = document.getElementById('chooseStudentImportBtn');
const studentImportInput = document.getElementById('studentImportInput');
const studentAccountAdminStatus = document.getElementById('studentAccountAdminStatus');
const studentImportPreview = document.getElementById('studentImportPreview');
const studentImportSummary = document.getElementById('studentImportSummary');
const studentImportPreviewBody = document.getElementById('studentImportPreviewBody');
const confirmStudentImportBtn = document.getElementById('confirmStudentImportBtn');
const cancelStudentImportBtn = document.getElementById('cancelStudentImportBtn');
const refreshStudentsBtn = document.getElementById('refreshStudentsBtn');
const adminStudentSearch = document.getElementById('adminStudentSearch');
const adminSectionFilter = document.getElementById('adminSectionFilter');
const adminActivityFilter = document.getElementById('adminActivityFilter');
const adminStudentsTableBody = document.getElementById('adminStudentsTableBody');
const adminStudentCount = document.getElementById('adminStudentCount');
const adminLoggedInCount = document.getElementById('adminLoggedInCount');
const adminProjectCount = document.getElementById('adminProjectCount');
const adminActiveTodayCount = document.getElementById('adminActiveTodayCount');
const adminStudentProjectsOverlay = document.getElementById('adminStudentProjectsOverlay');
const adminStudentProjectsTitle = document.getElementById('adminStudentProjectsTitle');
const adminStudentProjectsSubtitle = document.getElementById('adminStudentProjectsSubtitle');
const adminStudentProjectsList = document.getElementById('adminStudentProjectsList');
const closeAdminStudentProjectsBtn = document.getElementById('closeAdminStudentProjectsBtn');


// Built-in Firebase fallback config.
// This prevents the Teacher/Admin login from failing with "Firebase is not ready"
// when firebase-config.js is not uploaded, cached incorrectly, or loaded late.
const MCS_DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDuqBnvcIGbbUexKASjrWdinOqAQjnEQV0',
  authDomain: 'code-editor-f0f9d.firebaseapp.com',
  projectId: 'code-editor-f0f9d',
  storageBucket: 'code-editor-f0f9d.firebasestorage.app',
  messagingSenderId: '119616488399',
  appId: '1:119616488399:web:453b411fbf93a3b71e08ba'
};

function ensureFirebaseFrontendConfig() {
  const currentConfig = window.MCS_FIREBASE_CONFIG || {};
  const needsDefaultConfig = !currentConfig.apiKey || !currentConfig.projectId ||
    String(currentConfig.apiKey).includes('PASTE_') || String(currentConfig.projectId).includes('PASTE_');

  if (needsDefaultConfig) {
    window.MCS_FIREBASE_CONFIG = { ...MCS_DEFAULT_FIREBASE_CONFIG };
  }

  if (typeof window.MCS_FIREBASE_ENABLED === 'undefined') window.MCS_FIREBASE_ENABLED = true;
  if (!window.MCS_FIREBASE_COLLECTION) window.MCS_FIREBASE_COLLECTION = 'webCodeEditor';
  if (!window.MCS_FIREBASE_DOCUMENT_ID) window.MCS_FIREBASE_DOCUMENT_ID = 'grade8-mcsian';
  if (!window.MCS_FIREBASE_SDK_VERSION) window.MCS_FIREBASE_SDK_VERSION = '10.12.5';
  if (!Array.isArray(window.MCS_TEACHER_EMAILS) || !window.MCS_TEACHER_EMAILS.length) window.MCS_TEACHER_EMAILS = ['sirjr.mcsian@gmail.com'];
  if (typeof window.MCS_RUBRIC_IMAGE_IMPORT_ENABLED === 'undefined') window.MCS_RUBRIC_IMAGE_IMPORT_ENABLED = true;
  if (typeof window.MCS_RUBRIC_IMAGE_ENDPOINT === 'undefined') window.MCS_RUBRIC_IMAGE_ENDPOINT = '';
  if (typeof window.MCS_AI_CHECKER_ENDPOINT === 'undefined') window.MCS_AI_CHECKER_ENDPOINT = '';
  if (typeof window.MCS_AI_CHECKER_ENABLED === 'undefined') window.MCS_AI_CHECKER_ENABLED = true;
}

ensureFirebaseFrontendConfig();

const STORAGE_KEYS = {
  codeByActivity: 'studentCodeStudio.codeByActivity.blankFresh.v1',
  activities: 'studentCodeStudio.activities.blankFresh.v1',
  selectedActivityId: 'studentCodeStudio.selectedActivityId.blankFresh.v1',
  legacyCode: 'studentCodeStudio.codeStore.v2',
  legacyActivity: 'studentCodeStudio.activity.v2',
  theme: 'studentCodeStudio.theme',
  layout: 'studentCodeStudio.previewLayout',
  autoRun: 'studentCodeStudio.autoRun.v1',
  editorZoom: 'studentCodeStudio.editorZoom.v1',
  fileNames: 'studentCodeStudio.fileNames.v1',
  assistanceSettings: 'studentCodeStudio.assistanceSettings.v1'
};


// Code progress is intentionally kept out of permanent browser storage.
// Guest work disappears after the browser session, while logged-in projects
// are restored from Firestore. This prevents guest practice from looking like
// an account save.
const SESSION_ONLY_STORAGE_KEYS = new Set([
  STORAGE_KEYS.codeByActivity,
  STORAGE_KEYS.selectedActivityId,
  STORAGE_KEYS.fileNames
]);

try {
  SESSION_ONLY_STORAGE_KEYS.forEach(key => sessionStorage.removeItem(key));
} catch (error) {
  console.warn('Could not reset temporary editor session.', error);
}


const firebaseSync = {
  enabled: false,
  initialized: false,
  initializing: null,
  db: null,
  modules: null,
  auth: null,
  authModule: null,
  currentUser: null,
  lastError: '',
  collectionName: window.MCS_FIREBASE_COLLECTION || 'webCodeEditor',
  documentId: window.MCS_FIREBASE_DOCUMENT_ID || 'grade8-mcsian',
  sdkVersion: window.MCS_FIREBASE_SDK_VERSION || '10.12.5'
};

const DEFAULT_ASSISTANCE_SETTINGS = Object.freeze({
  enabled: true,
  codeSuggestions: true,
  codeHelper: true,
  teacherFeedback: true,
  superStudio: false,
  autoSave: true,
  autoRunControl: true,
  externalLinksSamePreview: true,
  collaboration: false,
  collaborationEdit: true,
  collaborationMembers: true
});

let studentAssistanceSettings = normalizeAssistanceSettings(
  loadJSON(STORAGE_KEYS.assistanceSettings, DEFAULT_ASSISTANCE_SETTINGS)
);
let unsubscribeCloudAssistanceSettings = null;

const DEFAULT_STUDENT_PASSWORD = '123456';
const STUDENT_EMAIL_DOMAIN = 'students.mcsian.app';
const STUDENT_AUTOSAVE_DELAY = 1400;
const PROFILE_ACTIVITY_WRITE_INTERVAL = 5 * 60 * 1000;
const AUTO_RUN_DELAY = 850;
const PREVIEW_LOAD_TIMEOUT = 3200;
const APP_NETWORK_TIMEOUT_MS = 12000;

const appSession = {
  mode: 'pending', // pending | guest | student
  student: null,
  currentProjectId: '',
  currentProject: null,
  projects: [],
  projectDialogMode: 'create',
  renameProjectId: '',
  authReady: false,
  existingStudentUser: null
};

let studentProjectSaveTimer = null;
let studentProjectSaveInFlight = false;
let studentProjectSaveQueued = false;
let studentProjectDirty = false;
let studentProjectRevision = 0;
let studentProjectLastSavedRevision = 0;
let studentProjectSavePromise = Promise.resolve(false);
let studentProjectRetryCount = 0;
let studentProjectRetryTimer = null;
let studentProjectRecoveryTimer = null;
let lastProfileActivityWriteAt = 0;
let adminStudentsCache = [];
let pendingStudentImportRows = [];
let studentImportRunning = false;
let autoRunEnabled = loadJSON(STORAGE_KEYS.autoRun, true) !== false;
let autoRunTimer = null;
let previewLoadingTimer = null;
let previewRenderToken = 0;
let latestPreviewRuntimeError = '';
let latestPreviewConsoleMessage = '';


const STARTER_CODE_VERSION_KEY = 'studentCodeStudio.starterCodeVersion';
const CURRENT_STARTER_CODE_VERSION = 'clean-uploaded-base-2026-07-09-v2';

function withTimeout(promise, timeoutMs = APP_NETWORK_TIMEOUT_MS, message = 'This is taking too long. Please check the connection and try again.') {
  let timeoutId = null;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

function isAutoRunControlAllowed() {
  return isStudentAssistanceFeatureEnabled('autoRunControl');
}

function isStudentAutoSaveAllowed() {
  return isStudentAssistanceFeatureEnabled('autoSave');
}

function updateAutoRunButtons() {
  const allowed = isAutoRunControlAllowed();
  document.body.classList.toggle('auto-run-control-disabled', !allowed);
  const buttons = [autoRunBtn, document.getElementById('fullscreenAutoRunBtn')].filter(Boolean);
  buttons.forEach(button => {
    button.classList.toggle('hidden', !allowed);
    button.setAttribute('aria-hidden', allowed ? 'false' : 'true');
    button.disabled = !allowed;
    button.classList.toggle('active', allowed && autoRunEnabled);
    button.setAttribute('aria-pressed', String(allowed && autoRunEnabled));
    button.textContent = autoRunEnabled ? '⚡ Auto On' : '⚡ Auto Off';
    button.title = allowed
      ? (autoRunEnabled
        ? 'Auto Run is on. Preview updates after you stop typing.'
        : 'Auto Run is off. Click Run to update the preview.')
      : 'Auto Run is disabled by the teacher.';
  });
}

function setAutoRunEnabled(enabled, showMessage = true) {
  const allowed = isAutoRunControlAllowed();
  autoRunEnabled = allowed && Boolean(enabled);
  saveJSON(STORAGE_KEYS.autoRun, autoRunEnabled);
  if (!autoRunEnabled) window.clearTimeout(autoRunTimer);
  updateAutoRunButtons();
  if (showMessage) setStatus(autoRunEnabled ? 'Auto Run on' : 'Auto Run off');
  if (autoRunEnabled) scheduleAutoRun({ delay: 120, reason: 'toggle' });
}

function toggleAutoRun() {
  if (!isAutoRunControlAllowed()) {
    setAutoRunEnabled(false, false);
    setStatus('Auto Run is disabled by the teacher');
    return;
  }
  setAutoRunEnabled(!autoRunEnabled);
}

function scheduleAutoRun(options = {}) {
  if (!isAutoRunControlAllowed()) {
    window.clearTimeout(autoRunTimer);
    return;
  }
  if (!autoRunEnabled || !previewFrame) return;
  const delay = Number.isFinite(options.delay) ? options.delay : AUTO_RUN_DELAY;
  window.clearTimeout(autoRunTimer);
  autoRunTimer = window.setTimeout(() => {
    runCode(false, { scroll: false, trackRun: false, source: 'auto' });
  }, Math.max(80, delay));
}

function setPreviewLoading(isLoading, options = {}) {
  if (!previewPanel) return;
  window.clearTimeout(previewLoadingTimer);
  previewPanel.classList.toggle('preview-loading', Boolean(isLoading));
  previewPanel.classList.remove('preview-waiting', 'preview-runtime-warning');
  if (!isLoading) return;
  const token = options.token || previewRenderToken;
  previewPanel.dataset.previewPage = options.pageName || getActiveHtmlPageName();
  previewLoadingTimer = window.setTimeout(() => {
    if (token !== previewRenderToken) return;
    previewPanel.classList.add('preview-waiting');
    setStatus('Preview still loading');
  }, PREVIEW_LOAD_TIMEOUT);
}

function markPreviewReady() {
  window.clearTimeout(previewLoadingTimer);
  previewPanel?.classList.remove('preview-loading', 'preview-waiting');
}

function handlePreviewRuntimeIssue(data = {}) {
  const rawMessage = String(data.message || data.reason || 'Runtime issue detected.').replace(/\s+/g, ' ').trim();
  const message = rawMessage.slice(0, 220);
  if (!message) return;
  if (data.level === 'error' || data.level === 'unhandledrejection') {
    latestPreviewRuntimeError = message;
    previewPanel?.classList.add('preview-runtime-warning');
    setStatus('Preview error');
  } else {
    latestPreviewConsoleMessage = message;
  }
  window.setTimeout(renderErrorChecker, 80);
}

function applyStarterCodeMigration() {
  try {
    if (localStorage.getItem(STARTER_CODE_VERSION_KEY) === CURRENT_STARTER_CODE_VERSION) return;

    // Clear only old saved student code, not teacher/admin activities or rubrics.
    // This prevents old CSS/JS starter data or test text from reappearing.
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('studentCodeStudio.codeByActivity') ||
        key.startsWith('studentCodeStudio.codeStore') ||
        key.startsWith('studentCodeStudio.selectedActivityId')
      ) {
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem(STARTER_CODE_VERSION_KEY, CURRENT_STARTER_CODE_VERSION);
  } catch (error) {
    console.warn('Starter code migration skipped', error);
  }
}

applyStarterCodeMigration();

// Default starter: HTML only. CSS and JavaScript tabs must start blank.
const starterCode = {
  html: `<!DOCTYPE html>
<html>
  <head>
    <title>Page Title</title>
  </head>
  <body>

    <h1>My First Heading</h1>
    <p>My first paragraph.</p>

  </body>
</html>`,
  css: '',
  js: ''
};


const rubricLevels = [
  { key: 'excellent', label: 'Excellent', shortLabel: 'Excellent' },
  { key: 'good', label: 'Good', shortLabel: 'Good' },
  { key: 'fair', label: 'Fair', shortLabel: 'Fair' },
  { key: 'needsImprovement', label: 'Needs Improvement', shortLabel: 'Needs Improvement' }
];

const defaultLevelDescriptions = {
  excellent: 'Complete, correct, and well-organized work.',
  good: 'Mostly complete with minor mistakes or missing details.',
  fair: 'Partially complete but needs more improvement.',
  needsImprovement: 'Incomplete or does not meet the requirement yet.'
};

const defaultActivity = {
  id: 'activity-complete-html-webpage',
  title: 'Activity 1: Complete HTML Webpage',
  description: 'Create a webpage using the complete HTML structure. CSS and JavaScript are optional unless your teacher adds them in the rubric. Click Run Code to preview, then See Result when done.',
  passingScore: 75,
  criteria: [
    { id: createId(), title: 'Uses complete HTML document structure', points: 4, rule: 'full_html_structure', target: '' },
    { id: createId(), title: 'HTML tags are properly closed', points: 3, rule: 'balanced_html_tags', target: '' },
    { id: createId(), title: 'Uses a clear heading', points: 2, rule: 'has_heading', target: '' },
    { id: createId(), title: 'Adds a paragraph or readable content', points: 2, rule: 'has_paragraph', target: '' },
    { id: createId(), title: 'Creates a button or clickable link', points: 2, rule: 'has_button_or_link', target: '' },
    { id: createId(), title: 'Output shows visible content', points: 2, rule: 'output_has_visible_text', target: '' },
    { id: createId(), title: 'Uses CSS design properties', points: 3, rule: 'uses_css_property', target: '' },
    { id: createId(), title: 'Output has no JavaScript error', points: 2, rule: 'no_runtime_error', target: '' }
  ]
};

const defaultActivities = [];

const ruleOptions = [
  { value: 'smart_rubric', label: 'Smart rubric understanding' },
  { value: 'html_contains', label: 'HTML contains target' },
  { value: 'css_contains', label: 'CSS contains target' },
  { value: 'js_contains', label: 'JavaScript contains target' },
  { value: 'output_contains', label: 'Output contains target text' },
  { value: 'full_html_structure', label: 'Complete HTML structure' },
  { value: 'has_semantic_tags', label: 'Has semantic HTML tags' },
  { value: 'balanced_html_tags', label: 'HTML tags are properly closed' },
  { value: 'output_has_visible_text', label: 'Output has visible text' },
  { value: 'has_heading', label: 'Has heading' },
  { value: 'has_paragraph', label: 'Has paragraph' },
  { value: 'has_button', label: 'Has button' },
  { value: 'has_link', label: 'Has link' },
  { value: 'has_button_or_link', label: 'Has button or link' },
  { value: 'has_image', label: 'Has image' },
  { value: 'has_list', label: 'Has list' },
  { value: 'uses_css_property', label: 'Uses CSS property' },
  { value: 'uses_event_listener', label: 'Uses event listener' },
  { value: 'js_changes_page', label: 'JS changes page' },
  { value: 'no_runtime_error', label: 'No JS runtime error' },
  { value: 'minimum_effort', label: 'Minimum code effort' }
];

const ruleHelp = {
  smart_rubric: 'Uses the criterion title and rubric descriptions to choose the best code/output checks automatically. Best for broad rubric items like design, following instructions, or overall quality.',
  html_contains: 'Checks if the HTML code includes the target keyword, tag, class, or ID.',
  css_contains: 'Checks if the CSS code includes the target property, value, selector, or keyword.',
  js_contains: 'Checks if the JavaScript code includes the target keyword or method.',
  output_contains: 'Checks if the preview output displays the target text.',
  full_html_structure: 'Checks for <!DOCTYPE html>, html, head, title, and body tags. Best for activities that require complete HTML structure.',
  has_semantic_tags: 'Checks if the webpage uses semantic tags like header, nav, main, section, article, aside, or footer.',
  balanced_html_tags: 'Checks if common opening tags have matching closing tags, excluding self-closing tags like img, br, input, meta, and link.',
  output_has_visible_text: 'Checks if the preview has readable visible text in the body.',
  has_heading: 'Checks if the project has h1, h2, h3, h4, h5, or h6.',
  has_paragraph: 'Checks if the project has a paragraph tag.',
  has_button: 'Checks if the project has a button.',
  has_link: 'Checks if the project has a hyperlink.',
  has_button_or_link: 'Checks if the project has a button or a hyperlink.',
  has_image: 'Checks if the project has an image.',
  has_list: 'Checks if the project has a bullet or numbered list.',
  uses_css_property: 'Checks if the CSS uses design properties like color, background, padding, margin, display, or border-radius. If target is filled, it checks that property.',
  uses_event_listener: 'Checks if JavaScript uses addEventListener or an onclick action.',
  js_changes_page: 'Checks if JavaScript changes text, HTML, style, or class.',
  no_runtime_error: 'Checks if the output did not report a JavaScript error. Empty JavaScript also passes.',
  minimum_effort: 'Checks if the combined code has enough content for a beginner activity.'
};

const DEFAULT_CODE_FILE_NAMES = {
  html: 'index.html',
  css: 'style.css',
  js: 'script.js'
};

let activities = getInitialActivities();
let selectedActivityId = getInitialSelectedActivityId();
let activity = getActivityById(selectedActivityId);
let codeByActivity = getInitialCodeByActivity();
let codeStore = activity ? getCodeStoreForActivity(activity.id) : normalizeCodeStore(starterCode);
let codeFileNames = normalizeCodeFileNames(loadJSON(STORAGE_KEYS.fileNames, DEFAULT_CODE_FILE_NAMES));
let activeLanguage = 'html';
let activeSuggestionIndex = 0;
let currentMatches = [];
let currentWord = '';
let currentSuggestionStart = 0;
let suggestionHideTimer = null;
let lastSuggestionInputAt = 0;
let adminUnlocked = false;
const ADMIN_QUICK_UNLOCK_KEY = 'mcsian.admin.quickUnlocked.session';
// Legacy quick-local unlock is disabled. Code login now signs in to Firebase with the teacher account password.
let adminQuickUnlocked = false;
try {
  sessionStorage.removeItem(ADMIN_QUICK_UNLOCK_KEY);
} catch (error) {
  adminQuickUnlocked = false;
}
let adminEditingActivityId = activity?.id || activities[0]?.id || '';
const BASE_EDITOR_FONT_SIZE = 15;
const MIN_EDITOR_FONT_SIZE = 12;
const MAX_EDITOR_FONT_SIZE = 26;
let editorFontSize = Number(loadJSON(STORAGE_KEYS.editorZoom, BASE_EDITOR_FONT_SIZE)) || BASE_EDITOR_FONT_SIZE;
let activeTagMatches = [];
const EDITOR_HISTORY_LIMIT = 250;
let editorHistoryByKey = {};
let lastRubricResult = null;
let aiReviewController = null;
let isRestoringEditorHistory = false;
let returnToFullEditorAfterPreview = false;
let previewTransitionTimer = null;
let bookTransitionTimer = null;
let previewOriginalParent = null;
let previewOriginalNextSibling = null;
let previewMovedIntoEditor = false;
let previewCloseToEditorTimer = null;
const FULLSCREEN_PAGE_TRANSITION_MS = 1240;
const FULLSCREEN_PAGE_SWAP_MS = 450;
let fullscreenPageTransitionBusy = false;

const languageInfo = {
  html: 'HTML builds the webpage structure. For this app, students should type a complete document: doctype, html, head, title, and body.',
  css: 'CSS is optional unless required by your teacher. Use it to improve colors, spacing, fonts, and layout.',
  js: 'JavaScript is optional unless required by your teacher. Use it to add actions like clicks and text changes.'
};

const htmlSuggestions = [
  tagSuggestion('!DOCTYPE', '<!DOCTYPE html>', 'Tells the browser this is an HTML5 document.', false, false, 'doctype'),
  tagSuggestion('html', '<html lang="en">\n  |\n</html>', 'Root tag of the webpage.', true),
  tagSuggestion('head', '<head>\n  |\n</head>', 'Contains title, meta, CSS links, and page settings.', true),
  tagSuggestion('meta charset', '<meta charset="UTF-8">', 'Sets character encoding.', false, true),
  tagSuggestion('meta viewport', '<meta name="viewport" content="width=device-width, initial-scale=1.0">', 'Makes the page mobile-friendly.', false, true),
  tagSuggestion('title', '<title>|</title>', 'Title shown on the browser tab.', true),
  tagSuggestion('body', '<body>\n  |\n</body>', 'Visible content goes here.', true),
  tagSuggestion('header', '<header>\n  |\n</header>', 'Top section of a page.', true),
  tagSuggestion('nav', '<nav>\n  |\n</nav>', 'Navigation links.', true),
  tagSuggestion('main', '<main>\n  |\n</main>', 'Main content area.', true),
  tagSuggestion('section', '<section>\n  |\n</section>', 'Content section.', true),
  tagSuggestion('article', '<article>\n  |\n</article>', 'Independent content block.', true),
  tagSuggestion('aside', '<aside>\n  |\n</aside>', 'Side content.', true),
  tagSuggestion('footer', '<footer>\n  |\n</footer>', 'Bottom section of a page.', true),
  tagSuggestion('div', '<div class="box">\n  |\n</div>', 'General container.', true),
  tagSuggestion('span', '<span>|</span>', 'Small inline container.', true),
  tagSuggestion('h1', '<h1>|</h1>', 'Main heading.', true),
  tagSuggestion('h2', '<h2>|</h2>', 'Section heading.', true),
  tagSuggestion('h3', '<h3>|</h3>', 'Smaller heading.', true),
  tagSuggestion('p', '<p>|</p>', 'Paragraph text.', true),
  tagSuggestion('strong', '<strong>|</strong>', 'Important bold text.', true),
  tagSuggestion('em', '<em>|</em>', 'Emphasized italic text.', true),
  tagSuggestion('a', '<a href="https://example.com">|</a>', 'Clickable link.', true),
  tagSuggestion('img', '<img src="image.jpg" alt="Description">', 'Image element.', false, true),
  tagSuggestion('br', '<br>', 'Line break.', false, true),
  tagSuggestion('hr', '<hr>', 'Horizontal line.', false, true),
  tagSuggestion('button', '<button id="myButton">|</button>', 'Clickable button.', true),
  tagSuggestion('label', '<label for="name">|</label>', 'Form label.', true),
  tagSuggestion('input', '<input type="text" id="name" placeholder="Type here">', 'Form input.', false, true),
  tagSuggestion('textarea', '<textarea id="message" placeholder="Type message"></textarea>', 'Multi-line input.', true),
  tagSuggestion('select', '<select id="choice">\n  <option>Option 1</option>\n  <option>Option 2</option>\n</select>', 'Dropdown menu.', true),
  tagSuggestion('option', '<option>|</option>', 'Dropdown choice.', true),
  tagSuggestion('form', '<form>\n  |\n  <button type="submit">Submit</button>\n</form>', 'Form container.', true),
  tagSuggestion('ul', '<ul>\n  <li>|</li>\n  <li>Item 2</li>\n</ul>', 'Bullet list.', true),
  tagSuggestion('ol', '<ol>\n  <li>|</li>\n  <li>Item 2</li>\n</ol>', 'Numbered list.', true),
  tagSuggestion('li', '<li>|</li>', 'List item.', true),
  tagSuggestion('table', '<table>\n  <tr>\n    <th>|</th>\n    <th>Header 2</th>\n  </tr>\n  <tr>\n    <td>Data 1</td>\n    <td>Data 2</td>\n  </tr>\n</table>', 'Table.', true),
  tagSuggestion('tr', '<tr>\n  |\n</tr>', 'Table row.', true),
  tagSuggestion('th', '<th>|</th>', 'Table header cell.', true),
  tagSuggestion('td', '<td>|</td>', 'Table data cell.', true),
  tagSuggestion('style', '<style>\n  |\n</style>', 'CSS inside HTML.', true),
  tagSuggestion('script', '<script>\n  |\n<\/script>', 'JavaScript inside HTML.', true),
  tagSuggestion('link css', '<link rel="stylesheet" href="style.css">', 'Connect an external CSS file.', false, true),
  tagSuggestion('complete html', '<!DOCTYPE html>\n<html>\n  <head>\n    <title>|</title>\n  </head>\n  <body>\n\n    <h1>My First Heading</h1>\n    <p>My first paragraph.</p>\n\n  </body>\n</html>', 'Full beginner HTML document.', true, false, 'template')
];

const suggestionsByLanguage = {
  html: htmlSuggestions,
  css: [
    codeSuggestion('body reset', '*, *::before, *::after {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  font-family: Arial, sans-serif;\n  background: #f8fafc;\n  color: #0f172a;\n  line-height: 1.6;\n}', 'Clean starter style for the whole page.'),
    codeSuggestion('body', 'body {\n  font-family: Arial, sans-serif;\n  background: #f0f7ff;\n  color: #17324d;\n  padding: 40px;\n}', 'Style the whole page.'),
    codeSuggestion('container', '.container {\n  width: min(100% - 32px, 1000px);\n  margin: 0 auto;\n  padding: 24px;\n}', 'Centered responsive page container.'),
    codeSuggestion('card', '.card {\n  background: #ffffff;\n  border: 1px solid #dbeafe;\n  border-radius: 20px;\n  padding: 24px;\n  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);\n}', 'Clean card style.'),
    codeSuggestion('button style', 'button {\n  border: none;\n  border-radius: 999px;\n  padding: 12px 18px;\n  color: white;\n  background: #2563eb;\n  font-weight: bold;\n  cursor: pointer;\n  transition: transform 0.2s ease, background 0.2s ease;\n}\n\nbutton:hover {\n  background: #1d4ed8;\n  transform: translateY(-2px);\n}', 'Modern button with hover effect.'),
    codeSuggestion('input style', 'input, textarea, select {\n  width: 100%;\n  border: 1px solid #cbd5e1;\n  border-radius: 12px;\n  padding: 12px 14px;\n  font: inherit;\n}\n\ninput:focus, textarea:focus, select:focus {\n  outline: 3px solid #bfdbfe;\n  border-color: #2563eb;\n}', 'Form input style with focus state.'),
    codeSuggestion('navbar', '.navbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 16px;\n  padding: 16px 24px;\n  background: #ffffff;\n  border-bottom: 1px solid #e2e8f0;\n}', 'Simple navigation/header layout.'),
    codeSuggestion('flex center', '.center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}', 'Center content horizontally and vertically.'),
    codeSuggestion('flex row', '.row {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}', 'Horizontal layout with spacing.'),
    codeSuggestion('flex column', '.column {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}', 'Vertical layout with spacing.'),
    codeSuggestion('grid cards', '.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 20px;\n}', 'Responsive card grid.'),
    codeSuggestion('hero section', '.hero {\n  min-height: 70vh;\n  display: grid;\n  place-items: center;\n  text-align: center;\n  padding: 48px 20px;\n  background: linear-gradient(135deg, #dbeafe, #f0fdf4);\n}', 'Large landing/header section.'),
    codeSuggestion('image responsive', 'img {\n  max-width: 100%;\n  height: auto;\n  display: block;\n  border-radius: 16px;\n}', 'Responsive image style.'),
    codeSuggestion('media query', '@media (max-width: 600px) {\n  body {\n    padding: 20px;\n  }\n\n  .container {\n    padding: 16px;\n  }\n}', 'Responsive design for phone screens.'),
    codeSuggestion('dark section', '.dark-section {\n  background: #0f172a;\n  color: #f8fafc;\n  padding: 40px;\n  border-radius: 20px;\n}', 'Dark themed section.'),
    codeSuggestion('color palette blue', ':root {\n  --primary: #2563eb;\n  --primary-dark: #1d4ed8;\n  --primary-soft: #dbeafe;\n  --text: #0f172a;\n  --muted: #64748b;\n}', 'Reusable blue color variables.'),
    codeSuggestion('color palette green', ':root {\n  --primary: #16a34a;\n  --primary-dark: #15803d;\n  --primary-soft: #dcfce7;\n  --text: #14532d;\n  --muted: #64748b;\n}', 'Reusable green color variables.'),
    codeSuggestion('color', 'color: #2563eb;', 'Text color. Common values: red, blue, black, white, #2563eb, rgb(...), var(--primary).'),
    codeSuggestion('background-color', 'background-color: #dbeafe;', 'Solid background color.'),
    codeSuggestion('background', 'background: linear-gradient(135deg, #2563eb, #06b6d4);', 'Background color, image, or gradient.'),
    codeSuggestion('font-family', 'font-family: Arial, sans-serif;', 'Font style. Common: Arial, Georgia, Verdana, sans-serif.'),
    codeSuggestion('font-size', 'font-size: 24px;', 'Text size. Common: 16px, 1rem, 1.5rem, clamp(...).'),
    codeSuggestion('font-weight', 'font-weight: 700;', 'Text thickness. Common: normal, bold, 400, 600, 700, 900.'),
    codeSuggestion('text-align', 'text-align: center;', 'Text alignment: left, center, right, justify.'),
    codeSuggestion('line-height', 'line-height: 1.6;', 'Spacing between text lines.'),
    codeSuggestion('letter-spacing', 'letter-spacing: 0.05em;', 'Space between letters.'),
    codeSuggestion('text-decoration', 'text-decoration: none;', 'Underline or remove decoration.'),
    codeSuggestion('width', 'width: 100%;', 'Element width.'),
    codeSuggestion('max-width', 'max-width: 600px;', 'Maximum width.'),
    codeSuggestion('min-height', 'min-height: 100vh;', 'Minimum height.'),
    codeSuggestion('height', 'height: 200px;', 'Element height.'),
    codeSuggestion('margin', 'margin: 20px;', 'Outside spacing.'),
    codeSuggestion('margin auto', 'margin: 0 auto;', 'Center a block element.'),
    codeSuggestion('padding', 'padding: 20px;', 'Inside spacing.'),
    codeSuggestion('border', 'border: 1px solid #d7e3f3;', 'Border line.'),
    codeSuggestion('border-radius', 'border-radius: 16px;', 'Rounded corners.'),
    codeSuggestion('box-shadow', 'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);', 'Shadow effect.'),
    codeSuggestion('display flex', 'display: flex;', 'Flexible layout.'),
    codeSuggestion('display grid', 'display: grid;', 'Grid layout.'),
    codeSuggestion('display none', 'display: none;', 'Hide an element.'),
    codeSuggestion('justify-content', 'justify-content: center;', 'Horizontal alignment in flex/grid.'),
    codeSuggestion('align-items', 'align-items: center;', 'Vertical alignment in flex/grid.'),
    codeSuggestion('place-items', 'place-items: center;', 'Center items in grid.'),
    codeSuggestion('gap', 'gap: 12px;', 'Space between flex/grid items.'),
    codeSuggestion('flex-direction', 'flex-direction: column;', 'Flex direction: row or column.'),
    codeSuggestion('flex-wrap', 'flex-wrap: wrap;', 'Allow flex items to wrap.'),
    codeSuggestion('grid-template-columns', 'grid-template-columns: repeat(3, 1fr);', 'Grid columns.'),
    codeSuggestion('position relative', 'position: relative;', 'Position relative to itself.'),
    codeSuggestion('position absolute', 'position: absolute;', 'Position inside nearest positioned parent.'),
    codeSuggestion('position fixed', 'position: fixed;', 'Stay fixed on the screen.'),
    codeSuggestion('top right', 'top: 16px;\nright: 16px;', 'Common position offsets.'),
    codeSuggestion('z-index', 'z-index: 10;', 'Layer order for positioned elements.'),
    codeSuggestion('overflow', 'overflow: hidden;', 'Control overflow: hidden, auto, scroll, visible.'),
    codeSuggestion('object-fit', 'object-fit: cover;', 'Fit images/videos inside a box.'),
    codeSuggestion('cursor', 'cursor: pointer;', 'Pointer cursor for clickable items.'),
    codeSuggestion('transition', 'transition: all 0.2s ease;', 'Smooth change/animation.'),
    codeSuggestion('transform', 'transform: scale(1.05);', 'Move, scale, rotate, or skew.'),
    codeSuggestion('opacity', 'opacity: 0.8;', 'Transparency from 0 to 1.'),
    codeSuggestion('hover', '.button:hover {\n  background: #1d4ed8;\n  transform: translateY(-2px);\n}', 'Hover state for interactive elements.'),
    codeSuggestion('active state', '.button:active {\n  transform: scale(0.98);\n}', 'Click/press effect.'),
    codeSuggestion('focus visible', '.button:focus-visible {\n  outline: 3px solid #bfdbfe;\n  outline-offset: 3px;\n}', 'Keyboard accessibility focus style.'),
    codeSuggestion('list-style', 'list-style: none;', 'Remove bullet/number markers.'),
    codeSuggestion('box-sizing', 'box-sizing: border-box;', 'Include padding and border in element size.'),
    codeSuggestion('clamp font', 'font-size: clamp(1.5rem, 4vw, 3rem);', 'Responsive text size.'),
    codeSuggestion('glass effect', '.glass {\n  background: rgba(255, 255, 255, 0.75);\n  backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.4);\n}', 'Frosted glass style.'),
    codeSuggestion('badge', '.badge {\n  display: inline-block;\n  border-radius: 999px;\n  padding: 6px 12px;\n  background: #dbeafe;\n  color: #1d4ed8;\n  font-weight: bold;\n}', 'Small pill label.'),
    codeSuggestion('animation fade in', '@keyframes fadeIn {\n  from {\n    opacity: 0;\n    transform: translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n.fade-in {\n  animation: fadeIn 0.4s ease both;\n}', 'Simple fade-in animation.'),
    codeSuggestion('mobile responsive card', '@media (max-width: 600px) {\n  .card {\n    padding: 16px;\n    border-radius: 14px;\n  }\n\n  h1 {\n    font-size: 2rem;\n  }\n}', 'Phone-friendly card and heading.'),
    codeSuggestion('print safe', '@media print {\n  button {\n    display: none;\n  }\n\n  body {\n    background: white;\n    color: black;\n  }\n}', 'Basic print-friendly CSS.')
  ],
  js: [
    codeSuggestion('function', 'function myFunction() {\n  |\n}', 'Reusable action.'),
    codeSuggestion('const', 'const element = document.getElementById("idName");', 'Fixed variable.'),
    codeSuggestion('let', 'let count = 0;', 'Changeable variable.'),
    codeSuggestion('document', 'document.getElementById("idName")', 'Select by ID.'),
    codeSuggestion('querySelector', 'document.querySelector(".className")', 'Select using CSS selector.'),
    codeSuggestion('addEventListener', 'element.addEventListener("click", function () {\n  |\n});', 'Run code on event.'),
    codeSuggestion('textContent', 'element.textContent = "New text";', 'Change text.'),
    codeSuggestion('innerHTML', 'element.innerHTML = "<strong>Hello</strong>";', 'Change HTML content.'),
    codeSuggestion('classList', 'element.classList.toggle("active");', 'Change classes.'),
    codeSuggestion('style', 'element.style.background = "#dbeafe";', 'Change CSS using JS.'),
    codeSuggestion('console.log', 'console.log("Hello world!");', 'Print in console.'),
    codeSuggestion('if', 'if (condition) {\n  |\n}', 'Conditional statement.'),
    codeSuggestion('for', 'for (let i = 0; i < 5; i++) {\n  |\n}', 'Repeat code.'),
    codeSuggestion('alert', 'alert("Hello!");', 'Show pop-up message.')
  ]
};

