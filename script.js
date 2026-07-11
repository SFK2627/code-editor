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
const externalLinksSamePreviewToggle = document.getElementById('externalLinksSamePreviewToggle');
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
const studentMenuBtn = document.getElementById('studentMenuBtn');
const studentAccountMenu = document.getElementById('studentAccountMenu');
const menuStudentGreeting = document.getElementById('menuStudentGreeting');
const menuStudentSaveState = document.getElementById('menuStudentSaveState');
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
  superStudio: false
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

function updateAutoRunButtons() {
  const buttons = [autoRunBtn, document.getElementById('fullscreenAutoRunBtn')].filter(Boolean);
  buttons.forEach(button => {
    button.classList.toggle('active', autoRunEnabled);
    button.setAttribute('aria-pressed', String(autoRunEnabled));
    button.textContent = autoRunEnabled ? '⚡ Auto On' : '⚡ Auto Off';
    button.title = autoRunEnabled
      ? 'Auto Run is on. Preview updates after you stop typing.'
      : 'Auto Run is off. Click Run to update the preview.';
  });
}

function setAutoRunEnabled(enabled, showMessage = true) {
  autoRunEnabled = Boolean(enabled);
  saveJSON(STORAGE_KEYS.autoRun, autoRunEnabled);
  if (!autoRunEnabled) window.clearTimeout(autoRunTimer);
  updateAutoRunButtons();
  if (showMessage) setStatus(autoRunEnabled ? 'Auto Run on' : 'Auto Run off');
  if (autoRunEnabled) scheduleAutoRun({ delay: 120, reason: 'toggle' });
}

function toggleAutoRun() {
  setAutoRunEnabled(!autoRunEnabled);
}

function scheduleAutoRun(options = {}) {
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

function createId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function tagSuggestion(label, insert, desc, hasClosing, selfClosing = false, type = 'tag') {
  return { label, insert, desc, hasClosing, selfClosing, type };
}

function codeSuggestion(label, insert, desc) {
  return { label, insert, desc, type: 'code' };
}

function getStorageForKey(key) {
  return SESSION_ONLY_STORAGE_KEYS.has(key) ? sessionStorage : localStorage;
}

function loadJSON(key, fallback) {
  try {
    const saved = getStorageForKey(key).getItem(key);
    return saved ? JSON.parse(saved) : clone(fallback);
  } catch (error) {
    console.warn(`Could not load ${key}`, error);
    return clone(fallback);
  }
}

function saveJSON(key, value) {
  try {
    getStorageForKey(key).setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key}`, error);
  }
}

function normalizeAssistanceSettings(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    enabled: source.enabled !== false,
    codeSuggestions: source.codeSuggestions !== false,
    codeHelper: source.codeHelper !== false,
    teacherFeedback: source.teacherFeedback !== false,
    superStudio: source.superStudio === true,
    externalLinksSamePreview: source.externalLinksSamePreview !== false
  };
}

function isStudentAssistanceFeatureEnabled(feature) {
  const settings = normalizeAssistanceSettings(studentAssistanceSettings);
  if (!settings.enabled) return false;
  return settings[feature] !== false;
}

function getAssistanceSettingsFromControls() {
  return normalizeAssistanceSettings({
    enabled: assistanceMasterToggle?.checked !== false,
    codeSuggestions: codeSuggestionsToggle?.checked !== false,
    codeHelper: codeHelperToggle?.checked !== false,
    teacherFeedback: teacherFeedbackToggle?.checked !== false,
    superStudio: superStudioToggle?.checked === true,
    externalLinksSamePreview: externalLinksSamePreviewToggle?.checked !== false
  });
}

function setAssistanceSettingsStatus(message, type = '') {
  if (!assistanceSettingsStatus) return;
  assistanceSettingsStatus.textContent = message;
  assistanceSettingsStatus.classList.remove('success', 'warning', 'error');
  if (type) assistanceSettingsStatus.classList.add(type);
}

function syncAssistanceSettingsControls() {
  const settings = normalizeAssistanceSettings(studentAssistanceSettings);
  if (assistanceMasterToggle) assistanceMasterToggle.checked = settings.enabled;
  if (codeSuggestionsToggle) codeSuggestionsToggle.checked = settings.codeSuggestions;
  if (codeHelperToggle) codeHelperToggle.checked = settings.codeHelper;
  if (teacherFeedbackToggle) teacherFeedbackToggle.checked = settings.teacherFeedback;
  if (superStudioToggle) superStudioToggle.checked = settings.superStudio;
  if (externalLinksSamePreviewToggle) externalLinksSamePreviewToggle.checked = settings.externalLinksSamePreview;

  studentAssistanceSettingsCard?.classList.toggle('master-disabled', !settings.enabled);
  const effectiveOn = settings.enabled && (settings.codeSuggestions || settings.codeHelper || settings.teacherFeedback || settings.superStudio);
  if (assistanceModeBadge) {
    assistanceModeBadge.textContent = effectiveOn ? 'Assistance ON' : 'Assistance OFF';
    assistanceModeBadge.classList.toggle('off', !effectiveOn);
  }
}

function updateAssistancePublishUI() {
  if (!publishAssistanceBtn) return;
  const canPublish = isTeacherAuthenticated();
  publishAssistanceBtn.textContent = canPublish ? 'Publish to All Students' : 'Login to Publish Globally';
  publishAssistanceBtn.classList.toggle('requires-login', !canPublish);
  publishAssistanceBtn.title = canPublish
    ? 'Save these controls to Firebase so every student device receives them.'
    : 'Local controls already work. Teacher login is required only for all student devices.';
}

function applyStudentAssistanceSettings(nextSettings, options = {}) {
  studentAssistanceSettings = normalizeAssistanceSettings(nextSettings);
  if (options.persist !== false) {
    saveJSON(STORAGE_KEYS.assistanceSettings, studentAssistanceSettings);
  }

  const suggestionsEnabled = isStudentAssistanceFeatureEnabled('codeSuggestions');
  const helperEnabled = isStudentAssistanceFeatureEnabled('codeHelper');
  const feedbackEnabled = isStudentAssistanceFeatureEnabled('teacherFeedback');
  const superStudioEnabled = isStudentAssistanceFeatureEnabled('superStudio');

  document.body.classList.toggle('code-suggestions-disabled', !suggestionsEnabled);
  document.body.classList.toggle('code-helper-disabled', !helperEnabled);
  document.body.classList.toggle('teacher-feedback-disabled', !feedbackEnabled);
  document.body.classList.toggle('super-studio-disabled', !superStudioEnabled);

  if (!suggestionsEnabled && typeof hideSuggestions === 'function') hideSuggestions();
  if (!helperEnabled && typeof hideSmartInlineHint === 'function') hideSmartInlineHint();

  if (codeHelperFloatingBtn) {
    codeHelperFloatingBtn.classList.toggle('hidden', !helperEnabled);
    codeHelperFloatingBtn.setAttribute('aria-hidden', helperEnabled ? 'false' : 'true');
    codeHelperFloatingBtn.disabled = !helperEnabled;
  }
  if (!helperEnabled && errorCheckerPanel) {
    errorCheckerPanel.classList.add('hidden');
    errorCheckerPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('code-helper-open');
  }

  aiReviewTopBtn?.classList.toggle('hidden', !feedbackEnabled);
  if (runAiReviewBtn) runAiReviewBtn.disabled = !feedbackEnabled;
  aiReviewPanel?.classList.toggle('assistance-feature-hidden', !feedbackEnabled);

  syncAssistanceSettingsControls();
  updateAssistancePublishUI();
  document.dispatchEvent(new CustomEvent('studentAssistanceSettingsChanged', { detail: { settings: studentAssistanceSettings } }));
  if (previewFrame && previewFrame.srcdoc && typeof runCode === 'function') {
    window.clearTimeout(applyStudentAssistanceSettings.previewRefreshTimer);
    applyStudentAssistanceSettings.previewRefreshTimer = window.setTimeout(() => runCode(false, { scroll: false, trackRun: false }), 120);
  }
  return studentAssistanceSettings;
}

function applyAssistanceSettingsFromControls(options = {}) {
  const settings = getAssistanceSettingsFromControls();
  applyStudentAssistanceSettings(settings);
  if (!options.silent) {
    setAssistanceSettingsStatus('Applied on this browser. Students using other devices are unchanged until you publish globally.', 'success');
    setStatus('Student assistance updated');
  }
  return settings;
}


function getFileExtension(language) {
  if (language === 'html') return '.html';
  if (language === 'css') return '.css';
  return '.js';
}

function getDefaultFileBase(language) {
  if (language === 'html') return 'index';
  if (language === 'css') return 'style';
  return 'script';
}

function cleanCodeFileName(value, language) {
  const extension = getFileExtension(language);
  const defaultBase = getDefaultFileBase(language);
  const defaultName = `${defaultBase}${extension}`;
  let raw = String(value || '').trim();
  if (!raw) return defaultName;

  raw = raw.replace(/[\\/]+/g, '-').replace(/[?#].*$/g, '').trim();
  const extensionPattern = new RegExp(`${extension.replace('.', '\\.')}$`, 'i');
  raw = raw.replace(extensionPattern, '');
  raw = raw
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);

  return raw ? `${raw}${extension}` : defaultName;
}

function normalizeCodeFileNames(raw = {}) {
  return {
    html: cleanCodeFileName(raw.html, 'html'),
    css: cleanCodeFileName(raw.css, 'css'),
    js: cleanCodeFileName(raw.js, 'js')
  };
}

function saveCodeFileNames() {
  codeFileNames = normalizeCodeFileNames(codeFileNames);
  saveJSON(STORAGE_KEYS.fileNames, codeFileNames);
}

function getCodeFileNames() {
  codeFileNames = normalizeCodeFileNames(codeFileNames);
  return codeFileNames;
}


function getLanguageFileMeta(language = activeLanguage) {
  const lang = ['html', 'css', 'js'].includes(language) ? language : 'html';
  const defaults = DEFAULT_CODE_FILE_NAMES;
  return {
    html: {
      language: 'html',
      label: 'HTML page',
      pluralLabel: 'HTML pages',
      extension: 'html',
      mapKey: 'pages',
      activeKey: 'activeHtmlPage',
      codeKey: 'html',
      defaultName: defaults.html,
      addTitle: 'Add HTML Page',
      renameTitle: 'Rename HTML Page',
      addText: 'Create another HTML page for a multi-page website.',
      renameText: 'Rename this HTML page. Links must match the new file name.',
      note: 'Use simple names like about.html, gallery.html, or contact.html.'
    },
    css: {
      language: 'css',
      label: 'CSS file',
      pluralLabel: 'CSS files',
      extension: 'css',
      mapKey: 'cssFiles',
      activeKey: 'activeCssFile',
      codeKey: 'css',
      defaultName: defaults.css,
      addTitle: 'Add CSS File',
      renameTitle: 'Rename CSS File',
      addText: 'Create another CSS file for a larger website.',
      renameText: 'Rename this CSS file. HTML <link> href values must match the new file name.',
      note: 'Use simple names like style.css, layout.css, colors.css, or responsive.css.'
    },
    js: {
      language: 'js',
      label: 'JavaScript file',
      pluralLabel: 'JavaScript files',
      extension: 'js',
      mapKey: 'jsFiles',
      activeKey: 'activeJsFile',
      codeKey: 'js',
      defaultName: defaults.js,
      addTitle: 'Add JavaScript File',
      renameTitle: 'Rename JavaScript File',
      addText: 'Create another JavaScript file for a larger website.',
      renameText: 'Rename this JavaScript file. HTML <script src> values must match the new file name.',
      note: 'Use simple names like script.js, app.js, menu.js, or gallery.js.'
    }
  }[lang];
}

function cleanLanguageFileName(value, language = activeLanguage) {
  const meta = getLanguageFileMeta(language);
  return cleanCodeFileName(value || meta.defaultName, meta.extension);
}

function createStarterForLanguageFile(language, fileName) {
  const meta = getLanguageFileMeta(language);
  const base = String(fileName || meta.defaultName).replace(new RegExp(`\\.${meta.extension}$`, 'i'), '');
  if (language === 'html') {
    return `<!DOCTYPE html>
<html>
  <head>
    <title>${base}</title>
  </head>
  <body>

    <h1>${base}</h1>
    <p>This is ${fileName}.</p>

  </body>
</html>`;
  }
  if (language === 'css') {
    return `/* ${fileName} */

`;
  }
  return `// ${fileName}

`;
}

function normalizeLanguageFileMap(rawMap, language, fallbackContent = '') {
  const meta = getLanguageFileMeta(language);
  const files = {};
  if (rawMap && typeof rawMap === 'object' && !Array.isArray(rawMap)) {
    Object.entries(rawMap).forEach(([name, content]) => {
      const cleanName = cleanLanguageFileName(name, language);
      if (!cleanName) return;
      files[cleanName] = typeof content === 'string' ? content : '';
    });
  }

  if (!Object.keys(files).length) {
    files[meta.defaultName] = typeof fallbackContent === 'string' ? fallbackContent : '';
  }

  if (!files[meta.defaultName]) {
    const firstKey = Object.keys(files)[0];
    if (firstKey && firstKey !== meta.defaultName && !files[meta.defaultName]) {
      files[meta.defaultName] = files[firstKey] || '';
    }
  }

  return files;
}

function normalizeHTMLPagesFromCodeStore(rawCode = {}) {
  const safeCode = rawCode && typeof rawCode === 'object' ? rawCode : {};
  const sourcePages = safeCode.pages && typeof safeCode.pages === 'object' && !Array.isArray(safeCode.pages)
    ? safeCode.pages
    : null;
  const pages = normalizeLanguageFileMap(sourcePages, 'html', typeof safeCode.html === 'string' ? safeCode.html : starterCode.html);
  if (!pages['index.html']) {
    const firstKey = Object.keys(pages)[0];
    if (firstKey) pages['index.html'] = pages[firstKey] || starterCode.html;
  }
  return pages;
}

function getLanguageFileMap(language = activeLanguage, store = codeStore) {
  const meta = getLanguageFileMeta(language);
  if (language === 'html') {
    if (!store.pages || typeof store.pages !== 'object' || Array.isArray(store.pages)) {
      store.pages = normalizeHTMLPagesFromCodeStore(store);
    }
    return store.pages;
  }

  if (!store[meta.mapKey] || typeof store[meta.mapKey] !== 'object' || Array.isArray(store[meta.mapKey])) {
    store[meta.mapKey] = normalizeLanguageFileMap(store[meta.mapKey], language, typeof store[meta.codeKey] === 'string' ? store[meta.codeKey] : starterCode[meta.codeKey]);
  }
  return store[meta.mapKey];
}

function getLanguageFileNames(language = activeLanguage, store = codeStore) {
  const meta = getLanguageFileMeta(language);
  const files = getLanguageFileMap(language, store);
  const names = Object.keys(files).sort((a, b) => {
    if (a === meta.defaultName) return -1;
    if (b === meta.defaultName) return 1;
    return a.localeCompare(b);
  });
  return names.length ? names : [meta.defaultName];
}

function getActiveLanguageFileName(language = activeLanguage, store = codeStore) {
  const meta = getLanguageFileMeta(language);
  const files = getLanguageFileMap(language, store);
  let active = cleanLanguageFileName(store[meta.activeKey] || codeFileNames?.[language] || meta.defaultName, language);
  if (!files[active]) active = files[meta.defaultName] ? meta.defaultName : Object.keys(files)[0] || meta.defaultName;
  store[meta.activeKey] = active;
  return active;
}

function getLanguageFileContent(language = activeLanguage, fileName = getActiveLanguageFileName(language)) {
  const files = getLanguageFileMap(language);
  const safeName = cleanLanguageFileName(fileName, language);
  return typeof files[safeName] === 'string' ? files[safeName] : '';
}

function setLanguageFileContent(language = activeLanguage, fileName = getActiveLanguageFileName(language), content = '') {
  const meta = getLanguageFileMeta(language);
  const files = getLanguageFileMap(language);
  const safeName = cleanLanguageFileName(fileName, language);
  files[safeName] = String(content ?? '');
  codeStore[meta.activeKey] = safeName;
  codeStore[meta.codeKey] = files[safeName];
  codeFileNames[language] = safeName;
}

function syncActiveLanguageFileFromStore(language = activeLanguage) {
  const meta = getLanguageFileMeta(language);
  const active = getActiveLanguageFileName(language);
  const files = getLanguageFileMap(language);
  codeStore[meta.codeKey] = typeof files[active] === 'string' ? files[active] : starterCode[meta.codeKey];
  codeFileNames[language] = active;
  return active;
}

// Backward-compatible HTML page helpers used by the existing app/checker.
function getHTMLPages(store = codeStore) { return getLanguageFileMap('html', store); }
function getHTMLPageNames(store = codeStore) { return getLanguageFileNames('html', store); }
function getActiveHtmlPageName(store = codeStore) { return getActiveLanguageFileName('html', store); }
function getHTMLPageContent(pageName = getActiveHtmlPageName()) { return getLanguageFileContent('html', pageName); }
function setHTMLPageContent(pageName, content) { setLanguageFileContent('html', pageName, content); }
function syncActiveHTMLPageFromStore() { return syncActiveLanguageFileFromStore('html'); }

function isExternalHref(value = '') {
  return /^(https?:|mailto:|tel:|javascript:|data:|blob:|#)/i.test(String(value || '').trim());
}

function normalizeInternalHtmlReference(value = '') {
  const clean = String(value || '').trim().replace(/[?#].*$/, '');
  if (!clean || isExternalHref(clean)) return '';
  const base = clean.split('/').pop();
  if (!/\.html?$/i.test(base)) return '';
  return cleanLanguageFileName(base, 'html');
}

function getInternalHTMLPageReferences(html) {
  const refs = [];
  const pattern = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi;
  let match;
  while ((match = pattern.exec(String(html || ''))) !== null) {
    const clean = normalizeInternalHtmlReference(match[2]);
    if (clean) refs.push(clean);
  }
  return refs;
}

function getMissingInternalPageReferences() {
  const pages = getHTMLPages();
  const existing = new Set(Object.keys(pages).map(name => name.toLowerCase()));
  const missing = [];
  Object.entries(pages).forEach(([pageName, html]) => {
    getInternalHTMLPageReferences(html).forEach(ref => {
      if (!existing.has(ref.toLowerCase())) {
        missing.push({ from: pageName, to: ref });
      }
    });
  });
  return missing;
}

function getPageStructureProblems() {
  const currentActive = getActiveHtmlPageName();
  const pages = getHTMLPages();
  const problems = [];
  Object.entries(pages).forEach(([pageName, html]) => {
    const previous = codeStore.html;
    codeStore.html = html;
    const report = getHTMLStructureReport();
    codeStore.html = previous;
    if (!report.passed) {
      problems.push({ pageName, missing: report.missing.map(item => item.label) });
    }
  });
  codeStore.activeHtmlPage = currentActive;
  syncActiveHTMLPageFromStore();
  return problems;
}

function updateCodeFileManagerLabels() {
  const meta = getLanguageFileMeta(activeLanguage);
  const activeName = getActiveLanguageFileName(activeLanguage);
  const names = getLanguageFileNames(activeLanguage);
  if (htmlPageManager) htmlPageManager.dataset.language = activeLanguage;
  const label = htmlPageManager?.querySelector('.page-manager-label');
  if (label) label.textContent = 'Tabs/Pages';
  if (addHtmlPageBtn) addHtmlPageBtn.textContent = activeLanguage === 'html' ? '+ Page' : '+ File';
  if (renameHtmlPageBtn) renameHtmlPageBtn.textContent = 'Rename';
  if (deleteHtmlPageBtn) {
    deleteHtmlPageBtn.textContent = 'Delete';
    deleteHtmlPageBtn.disabled = names.length <= 1 || (activeLanguage === 'html' && activeName === 'index.html');
    deleteHtmlPageBtn.title = deleteHtmlPageBtn.disabled
      ? activeLanguage === 'html' && activeName === 'index.html'
        ? 'index.html must stay as the homepage.'
        : `Keep at least one ${meta.label}.`
      : `Delete ${activeName}`;
  }
}

function renderHTMLPageManager() {
  if (!htmlPageManager || !htmlPageSelect) return;
  if (!['html', 'css', 'js'].includes(activeLanguage)) {
    htmlPageManager.classList.add('hidden');
    htmlPageManager.setAttribute('aria-hidden', 'true');
    return;
  }

  htmlPageManager.classList.remove('hidden');
  htmlPageManager.setAttribute('aria-hidden', 'false');
  const active = getActiveLanguageFileName(activeLanguage);
  const names = getLanguageFileNames(activeLanguage);
  htmlPageSelect.innerHTML = names.map(name => `<option value="${escapeAttribute(name)}" ${name === active ? 'selected' : ''}>${escapeHTML(name)}</option>`).join('');
  htmlPageSelect.value = active;
  htmlPageSelect.setAttribute('aria-label', activeLanguage === 'html' ? 'Choose HTML page' : activeLanguage === 'css' ? 'Choose CSS file' : 'Choose JavaScript file');
  updateCodeFileManagerLabels();
}

function saveCodeStoreForCurrentActivity() {
  const codeKey = activity?.id || selectedActivityId || 'scratch';
  codeByActivity[codeKey] = normalizeCodeStore(codeStore);
  saveCodeByActivity();
  queueStudentProjectSave('edit');
}

function switchHTMLPage(fileName) {
  if (['html', 'css', 'js'].includes(activeLanguage)) saveActiveEditor();
  const safeName = cleanLanguageFileName(fileName, activeLanguage);
  const files = getLanguageFileMap(activeLanguage);
  if (!files[safeName]) return;
  codeStore[getLanguageFileMeta(activeLanguage).activeKey] = safeName;
  syncActiveLanguageFileFromStore(activeLanguage);
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();
  tabButtons.forEach(tab => tab.classList.toggle('active', tab.dataset.language === activeLanguage));
  loadActiveEditor();
  runCode(false, { scroll: false, pageName: getActiveHtmlPageName() });
  setStatus(`${getLanguageFileMeta(activeLanguage).label}: ${safeName}`);
}

function shouldPlacePageDialogInsideEditor() {
  return Boolean(
    editorPanel &&
    (
      document.fullscreenElement === editorPanel ||
      document.webkitFullscreenElement === editorPanel ||
      document.body.classList.contains('editor-fullscreen-active')
    )
  );
}

function placePageDialogForCurrentMode() {
  if (!pageDialogOverlay) return;
  const target = shouldPlacePageDialogInsideEditor() ? editorPanel : document.body;
  if (target && pageDialogOverlay.parentElement !== target) target.appendChild(pageDialogOverlay);
  pageDialogOverlay.classList.toggle('inside-editor-fullscreen', target === editorPanel);
}

function restorePageDialogToBody() {
  if (!pageDialogOverlay) return;
  pageDialogOverlay.classList.remove('inside-editor-fullscreen');
  if (pageDialogOverlay.parentElement !== document.body) document.body.appendChild(pageDialogOverlay);
}

let pageDialogMode = 'add';
let pageDialogOriginalName = '';
let pageDialogLanguage = 'html';

function openPageDialog(mode = 'add') {
  if (!pageDialogOverlay) return;
  if (['html', 'css', 'js'].includes(activeLanguage)) saveActiveEditor();
  pageDialogMode = mode;
  pageDialogLanguage = activeLanguage;
  const meta = getLanguageFileMeta(pageDialogLanguage);
  pageDialogOriginalName = getActiveLanguageFileName(pageDialogLanguage);
  const isRename = mode === 'rename';
  if (pageDialogTitle) pageDialogTitle.textContent = isRename ? meta.renameTitle : meta.addTitle;
  if (pageDialogText) pageDialogText.textContent = isRename ? meta.renameText : meta.addText;
  if (htmlPageNameInput) htmlPageNameInput.value = isRename ? pageDialogOriginalName : '';
  if (pageDialogNote) pageDialogNote.textContent = meta.note;
  placePageDialogForCurrentMode();
  pageDialogOverlay.classList.remove('hidden');
  document.body.classList.add('dialog-open');
  window.setTimeout(() => htmlPageNameInput?.focus({ preventScroll: true }), 0);
}

function closePageDialog() {
  if (!pageDialogOverlay) return;
  pageDialogOverlay.classList.add('hidden');
  document.body.classList.remove('dialog-open');
  restorePageDialogToBody();
  addHtmlPageBtn?.focus({ preventScroll: true });
}

function replaceHtmlFileReferences(oldName, newName, language) {
  const pages = getHTMLPages();
  const escaped = escapeRegExp(oldName);
  Object.keys(pages).forEach(page => {
    if (language === 'html') {
      pages[page] = String(pages[page]).replace(new RegExp(`(href\\s*=\\s*["'])${escaped}(["'])`, 'gi'), `$1${newName}$2`);
    } else if (language === 'css') {
      pages[page] = String(pages[page]).replace(new RegExp(`(href\\s*=\\s*["'])${escaped}(["'])`, 'gi'), `$1${newName}$2`);
    } else if (language === 'js') {
      pages[page] = String(pages[page]).replace(new RegExp(`(src\\s*=\\s*["'])${escaped}(["'])`, 'gi'), `$1${newName}$2`);
    }
  });
}

async function applyPageDialog() {
  const meta = getLanguageFileMeta(pageDialogLanguage);
  const newName = cleanLanguageFileName(htmlPageNameInput?.value || '', pageDialogLanguage);
  if (!newName) {
    if (pageDialogNote) pageDialogNote.textContent = `Please type a valid .${meta.extension} file name.`;
    return;
  }

  const files = getLanguageFileMap(pageDialogLanguage);
  const exists = Object.prototype.hasOwnProperty.call(files, newName);
  if (pageDialogMode === 'add') {
    if (exists) {
      if (pageDialogNote) pageDialogNote.textContent = `${newName} already exists.`;
      return;
    }
    files[newName] = createStarterForLanguageFile(pageDialogLanguage, newName);
    codeStore[meta.activeKey] = newName;
  } else {
    if (pageDialogLanguage === 'html' && pageDialogOriginalName === 'index.html' && newName !== 'index.html') {
      if (!await appConfirm('index.html is the homepage. Rename it anyway?', { title: 'Rename homepage' })) return;
    }
    if (newName !== pageDialogOriginalName && exists) {
      if (pageDialogNote) pageDialogNote.textContent = `${newName} already exists.`;
      return;
    }
    if (newName !== pageDialogOriginalName) {
      files[newName] = files[pageDialogOriginalName] || '';
      delete files[pageDialogOriginalName];
      replaceHtmlFileReferences(pageDialogOriginalName, newName, pageDialogLanguage);
      if (codeFileNames[pageDialogLanguage] === pageDialogOriginalName) {
        codeFileNames[pageDialogLanguage] = newName;
        saveCodeFileNames();
      }
    }
    codeStore[meta.activeKey] = newName;
  }

  syncActiveLanguageFileFromStore(pageDialogLanguage);
  if (pageDialogLanguage === 'html') syncActiveHTMLPageFromStore();
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();
  renderHTMLPageManager();
  if (activeLanguage === pageDialogLanguage) loadActiveEditor();
  runCode(false, { scroll: false });
  closePageDialog();
  setStatus(pageDialogMode === 'add' ? 'File added' : 'File renamed');
}

async function deleteCurrentHTMLPage() {
  if (['html', 'css', 'js'].includes(activeLanguage)) saveActiveEditor();
  const meta = getLanguageFileMeta(activeLanguage);
  const files = getLanguageFileMap(activeLanguage);
  const active = getActiveLanguageFileName(activeLanguage);
  const names = getLanguageFileNames(activeLanguage);
  if (names.length <= 1 || (activeLanguage === 'html' && active === 'index.html')) {
    await appAlert(activeLanguage === 'html' && active === 'index.html'
      ? 'index.html must stay as the main homepage. Add another page first before deleting pages.'
      : `Keep at least one ${meta.label}.`, { title: 'Cannot delete file' });
    return;
  }
  if (!await appConfirm(`Delete ${active}?`, { title: 'Delete file', danger: true })) return;
  delete files[active];
  codeStore[meta.activeKey] = files[meta.defaultName] ? meta.defaultName : Object.keys(files)[0] || meta.defaultName;
  syncActiveLanguageFileFromStore(activeLanguage);
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();
  renderHTMLPageManager();
  loadActiveEditor();
  runCode(false, { scroll: false });
  setStatus('File deleted');
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getBaseFileNameFromReference(value) {
  const clean = String(value || '').trim().replace(/[?#].*$/, '');
  return clean.split('/').pop().toLowerCase();
}

function getExternalCSSReferences(html) {
  const refs = [];
  const pattern = /<link\b[^>]*>/gi;
  const hrefPattern = /href\s*=\s*(["'])(.*?)\1/i;
  let match;
  while ((match = pattern.exec(String(html || ''))) !== null) {
    const tag = match[0];
    if (!/rel\s*=\s*(["'])[^"']*stylesheet[^"']*\1/i.test(tag)) continue;
    const hrefMatch = tag.match(hrefPattern);
    if (hrefMatch && hrefMatch[2]) refs.push(hrefMatch[2]);
  }
  return refs;
}

function getExternalJSReferences(html) {
  const refs = [];
  const pattern = /<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>\s*<\/script>/gi;
  let match;
  while ((match = pattern.exec(String(html || ''))) !== null) {
    if (match[2]) refs.push(match[2]);
  }
  return refs;
}

function hasMatchingExternalReference(references, filename) {
  const expected = String(filename || '').toLowerCase();
  return references.some(ref => getBaseFileNameFromReference(ref) === expected);
}

function shouldApplyCSSForPreview(html) {
  const css = (codeStore.css || '').trim();
  if (!css) return false;
  const fileNames = getCodeFileNames();
  const references = getExternalCSSReferences(html);
  return !references.length || hasMatchingExternalReference(references, fileNames.css);
}

function shouldApplyJSForPreview(html) {
  const js = (codeStore.js || '').trim();
  if (!js) return false;
  const fileNames = getCodeFileNames();
  const references = getExternalJSReferences(html);
  return !references.length || hasMatchingExternalReference(references, fileNames.js);
}

function normalizeHtmlPageName(value, fallback = 'index.html') {
  const cleaned = cleanCodeFileName(value || fallback, 'html');
  return cleaned || fallback;
}

function normalizeHTMLPagesFromCodeStore(rawCode = {}) {
  const safeCode = rawCode && typeof rawCode === 'object' ? rawCode : {};
  const sourcePages = safeCode.pages && typeof safeCode.pages === 'object' && !Array.isArray(safeCode.pages)
    ? safeCode.pages
    : null;
  const pages = {};

  if (sourcePages) {
    Object.entries(sourcePages).forEach(([name, content]) => {
      const cleanName = normalizeHtmlPageName(name);
      if (!cleanName) return;
      pages[cleanName] = typeof content === 'string' ? content : '';
    });
  }

  if (!Object.keys(pages).length) {
    const firstName = normalizeHtmlPageName(safeCode.activeHtmlPage || safeCode.htmlFileName || 'index.html');
    pages[firstName] = typeof safeCode.html === 'string' ? safeCode.html : starterCode.html;
  }

  if (!pages['index.html']) {
    const firstKey = Object.keys(pages)[0];
    if (firstKey) pages['index.html'] = pages[firstKey];
  }

  return pages;
}


function normalizeCodeStore(rawCode) {
  const safeCode = rawCode && typeof rawCode === 'object' ? rawCode : {};
  const pages = normalizeHTMLPagesFromCodeStore(safeCode);
  let activeHtmlPage = cleanLanguageFileName(safeCode.activeHtmlPage || safeCode.currentHtmlPage || safeCode.htmlFileName || DEFAULT_CODE_FILE_NAMES.html, 'html');
  if (!pages[activeHtmlPage]) activeHtmlPage = pages['index.html'] ? 'index.html' : Object.keys(pages)[0] || 'index.html';

  const cssFiles = normalizeLanguageFileMap(safeCode.cssFiles, 'css', typeof safeCode.css === 'string' ? safeCode.css : starterCode.css);
  let activeCssFile = cleanLanguageFileName(safeCode.activeCssFile || safeCode.cssFileName || DEFAULT_CODE_FILE_NAMES.css, 'css');
  if (!cssFiles[activeCssFile]) activeCssFile = cssFiles[DEFAULT_CODE_FILE_NAMES.css] ? DEFAULT_CODE_FILE_NAMES.css : Object.keys(cssFiles)[0] || DEFAULT_CODE_FILE_NAMES.css;

  const jsFiles = normalizeLanguageFileMap(safeCode.jsFiles, 'js', typeof safeCode.js === 'string' ? safeCode.js : starterCode.js);
  let activeJsFile = cleanLanguageFileName(safeCode.activeJsFile || safeCode.jsFileName || DEFAULT_CODE_FILE_NAMES.js, 'js');
  if (!jsFiles[activeJsFile]) activeJsFile = jsFiles[DEFAULT_CODE_FILE_NAMES.js] ? DEFAULT_CODE_FILE_NAMES.js : Object.keys(jsFiles)[0] || DEFAULT_CODE_FILE_NAMES.js;

  return {
    html: typeof pages[activeHtmlPage] === 'string' ? pages[activeHtmlPage] : starterCode.html,
    css: typeof cssFiles[activeCssFile] === 'string' ? cssFiles[activeCssFile] : starterCode.css,
    js: typeof jsFiles[activeJsFile] === 'string' ? jsFiles[activeJsFile] : starterCode.js,
    pages,
    cssFiles,
    jsFiles,
    activeHtmlPage,
    activeCssFile,
    activeJsFile
  };
}

function defaultLevelPoints(maxPoints) {
  const full = Math.max(0, Number(maxPoints) || 0);
  return {
    excellent: full,
    good: Math.max(0, Math.round(full * 0.75)),
    fair: Math.max(0, Math.round(full * 0.5)),
    needsImprovement: 0
  };
}

function normalizeLevels(rawLevels, maxPoints) {
  const pointDefaults = defaultLevelPoints(maxPoints);
  const safeLevels = rawLevels && typeof rawLevels === 'object' ? rawLevels : {};
  return rubricLevels.reduce((levels, level) => {
    const rawLevel = safeLevels[level.key] && typeof safeLevels[level.key] === 'object' ? safeLevels[level.key] : {};
    levels[level.key] = {
      label: level.label,
      points: Number.isFinite(Number(rawLevel.points)) ? Number(rawLevel.points) : pointDefaults[level.key],
      description: String(rawLevel.description || defaultLevelDescriptions[level.key] || '').trim()
    };
    return levels;
  }, {});
}

function getMaxPointsFromCriterion(criterion) {
  const directPoints = Number(criterion?.points);
  if (Number.isFinite(directPoints) && directPoints > 0) return directPoints;

  const levels = criterion?.levels && typeof criterion.levels === 'object' ? criterion.levels : {};
  const levelPoints = rubricLevels
    .map(level => Number(levels[level.key]?.points))
    .filter(value => Number.isFinite(value));

  return levelPoints.length ? Math.max(...levelPoints, 1) : 1;
}

function normalizeCriterion(criterion) {
  const safeCriterion = criterion && typeof criterion === 'object' ? criterion : {};
  const points = getMaxPointsFromCriterion(safeCriterion);
  return {
    id: safeCriterion.id || createId(),
    title: safeCriterion.title || 'Untitled criterion',
    points,
    rule: safeCriterion.rule || 'smart_rubric',
    target: safeCriterion.target || '',
    levels: normalizeLevels(safeCriterion.levels, points)
  };
}

function getCriterionLevel(criterion, levelKey) {
  const levels = normalizeLevels(criterion?.levels, criterion?.points || 1);
  return levels[levelKey] || levels.needsImprovement;
}

function getCriterionPossiblePoints(criterion) {
  const normalized = normalizeCriterion(criterion);
  const levelPoints = rubricLevels.map(item => Number(normalized.levels[item.key]?.points) || 0);
  return Math.max(...levelPoints, Number(normalized.points) || 0, 0);
}

function getSortedLevelKeysByScore(criterion) {
  const levels = normalizeLevels(criterion?.levels, criterion?.points || 1);
  return [...rubricLevels]
    .map(level => ({ key: level.key, points: Number(levels[level.key]?.points) || 0 }))
    .sort((a, b) => b.points - a.points)
    .map(item => item.key);
}

function normalizeActivity(rawActivity) {
  const safeActivity = rawActivity && typeof rawActivity === 'object' ? rawActivity : clone(defaultActivity);
  const criteria = Array.isArray(safeActivity.criteria) ? safeActivity.criteria : [];

  return {
    id: safeActivity.id || createId(),
    title: safeActivity.title || defaultActivity.title,
    description: safeActivity.description || defaultActivity.description,
    passingScore: Number(safeActivity.passingScore) || 75,
    criteria: criteria.map(normalizeCriterion)
  };
}

function normalizeActivities(rawActivities) {
  const source = Array.isArray(rawActivities) ? rawActivities : [];
  return source.map(item => normalizeActivity(item));
}

function getInitialActivities() {
  const savedActivities = loadJSON(STORAGE_KEYS.activities, null);
  if (Array.isArray(savedActivities)) {
    return normalizeActivities(savedActivities);
  }

  // Fresh blank version: do not auto-create Activity 1 and do not import legacy activities.
  return [];
}

function getInitialSelectedActivityId() {
  return '';
}

function getInitialCodeByActivity() {
  const saved = loadJSON(STORAGE_KEYS.codeByActivity, null);
  const fallbackActivityId = activity?.id || selectedActivityId || activities[0]?.id || 'scratch';

  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    if ('html' in saved || 'css' in saved || 'js' in saved) {
      return { [fallbackActivityId]: normalizeCodeStore(saved) };
    }

    return Object.fromEntries(
      Object.entries(saved).map(([activityId, code]) => [activityId, normalizeCodeStore(code)])
    );
  }

  return {};
}

function getActivityById(activityId) {
  return activities.find(item => item.id === activityId) || null;
}

function saveActivities(options = {}) {
  saveJSON(STORAGE_KEYS.activities, activities);
  if (options.cloud !== false) {
    queueCloudActivitiesSave();
  }
}

function saveCodeByActivity() {
  saveJSON(STORAGE_KEYS.codeByActivity, codeByActivity);
}

function getCodeStoreForActivity(activityId) {
  if (!codeByActivity[activityId]) {
    codeByActivity[activityId] = normalizeCodeStore(starterCode);
    saveCodeByActivity();
  }

  return codeByActivity[activityId];
}



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
  if (lastDialogFocus && typeof lastDialogFocus.focus === 'function') {
    lastDialogFocus.focus({ preventScroll: true });
  }
  const resolver = appDialogResolve;
  appDialogResolve = null;
  if (resolver) resolver(Boolean(result));
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
    return false;
  }

  if (firebaseSync.initialized) return true;
  if (firebaseSync.initializing) return firebaseSync.initializing;

  firebaseSync.initializing = (async () => {
    // First use the compat SDK loaded by index.html. This is the most reliable
    // path on GitHub Pages because it does not depend on dynamic module imports.
    if (initFirebaseWithCompatSDK()) {
      return true;
    }

    // Fallback: try Firebase's ESM CDN if the compat SDK did not load.
    try {
      const version = firebaseSync.sdkVersion;
      const appModule = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`);
      const firestoreModule = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`);
      const authModule = await import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`);

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
      console.warn('Firebase connection failed. Local mode will continue.', error);
      firebaseSync.lastError = error?.message || String(error);
      firebaseSync.enabled = false;
      setStatus('Local mode');
      return false;
    }
  })();

  return firebaseSync.initializing;
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
    setAssistanceSettingsStatus('Published successfully. Open student pages will update automatically.', 'success');
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
    saveEl.classList.remove('saving', 'error');
    if (state) saveEl.classList.add(state);
  });
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
    if (appTitleText) appTitleText.textContent = `A tool for ${firstName}, Let's Code!`;
    if (appSubtitleText) appSubtitleText.textContent = 'Developed by Sir JR';
    if (headerStudentGreeting) headerStudentGreeting.textContent = `Hi, ${firstName}!`;
    if (menuStudentGreeting) menuStudentGreeting.textContent = `Hi, ${firstName}!`;
    setStudentSaveState(appSession.currentProjectId ? 'Saved' : 'Choose a project');
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
  const hasPendingSave = Boolean(studentProjectSaveTimer || studentProjectSaveInFlight || studentProjectSaveQueued);
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
      await saveCurrentStudentProject({ immediate: true, reason: 'logout' });
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
    renderStudentProjects();
    return appSession.projects;
  } catch (error) {
    console.error('Could not load projects', error);
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
    codeByActivity = normalizeProjectCodeByActivity(project.codeByActivity);
    selectedActivityId = activities.some(item => item.id === project.selectedActivityId) ? project.selectedActivityId : '';
    activity = selectedActivityId ? getActivityById(selectedActivityId) : null;
    const codeKey = selectedActivityId || 'scratch';
    codeStore = codeByActivity[codeKey]
      ? normalizeCodeStore(codeByActivity[codeKey])
      : normalizeCodeStore(starterCode);
    codeByActivity[codeKey] = normalizeCodeStore(codeStore);
    codeFileNames = normalizeCodeFileNames(project.fileNames || DEFAULT_CODE_FILE_NAMES);
    activeLanguage = 'html';
    lastRubricResult = project.lastResult || null;
    saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
    saveCodeByActivity();
    saveCodeFileNames();
    renderActivitySummary();
    renderActivitySelector();
    loadActiveEditor();
    if (project.lastResult && activity) renderResult(project.lastResult);
    else resetResultPanel();
    runCode(false, { scroll: false });
    closeStudentDashboard();
    updateAppHeaderForSession();
    setStudentSaveState('Saved');
    setStatus(`Project: ${project.name}`);
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
  setStudentSaveState('Saving...', 'saving');
  clearTimeout(studentProjectSaveTimer);
  studentProjectSaveTimer = window.setTimeout(() => {
    saveCurrentStudentProject({ reason }).catch(error => console.warn('Autosave failed', error));
  }, STUDENT_AUTOSAVE_DELAY);
}

async function saveCurrentStudentProject({ result = null, immediate = false, reason = 'edit' } = {}) {
  if (!isStudentProjectActive()) return false;
  if (immediate) clearTimeout(studentProjectSaveTimer);
  if (studentProjectSaveInFlight) {
    studentProjectSaveQueued = true;
    return false;
  }
  studentProjectSaveInFlight = true;
  setStudentSaveState('Saving...', 'saving');
  try {
    const { setDoc, serverTimestamp } = firebaseSync.modules;
    const payload = buildProjectSavePayload(result);
    await setDoc(getStudentProjectDocRef(appSession.student.uid, appSession.currentProjectId), {
      ...payload,
      updatedAt: serverTimestamp()
    }, { merge: true });
    appSession.currentProject = {
      ...(appSession.currentProject || {}),
      ...payload,
      id: appSession.currentProjectId,
      updatedAt: new Date()
    };
    const index = appSession.projects.findIndex(project => project.id === appSession.currentProjectId);
    if (index >= 0) appSession.projects[index] = { ...appSession.projects[index], ...appSession.currentProject };
    else appSession.projects.unshift(appSession.currentProject);
    setStudentSaveState('Saved');

    const now = Date.now();
    if (reason !== 'edit' || now - lastProfileActivityWriteAt >= PROFILE_ACTIVITY_WRITE_INTERVAL) {
      lastProfileActivityWriteAt = now;
      await setDoc(getStudentDocRef(appSession.student.uid), {
        lastActivityAt: serverTimestamp(),
        lastProjectId: appSession.currentProjectId,
        lastProjectName: payload.name,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Could not save current student project.', error);
    setStudentSaveState('Save failed', 'error');
    return false;
  } finally {
    studentProjectSaveInFlight = false;
    if (studentProjectSaveQueued) {
      studentProjectSaveQueued = false;
      window.setTimeout(() => saveCurrentStudentProject({ reason: 'queued' }), 80);
    }
  }
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function applyEditorZoom(value) {
  editorFontSize = clamp(Number(value) || BASE_EDITOR_FONT_SIZE, MIN_EDITOR_FONT_SIZE, MAX_EDITOR_FONT_SIZE);
  document.documentElement.style.setProperty('--editor-font-size', `${editorFontSize}px`);
  if (zoomLevel) {
    zoomLevel.textContent = `${Math.round((editorFontSize / BASE_EDITOR_FONT_SIZE) * 100)}%`;
  }
  saveJSON(STORAGE_KEYS.editorZoom, editorFontSize);
  fitEditorToContent();
  syncEditorScroll();
}

function changeEditorZoom(delta) {
  applyEditorZoom(editorFontSize + delta);
  setStatus(`Editor zoom ${Math.round((editorFontSize / BASE_EDITOR_FONT_SIZE) * 100)}%`);
}

function resetEditorZoom() {
  applyEditorZoom(BASE_EDITOR_FONT_SIZE);
  setStatus('Editor zoom reset');
}

function syncEditorScroll() {
  lineNumbers.scrollTop = editor.scrollTop;
  if (codeMatchLayer) {
    codeMatchLayer.scrollTop = editor.scrollTop;
    codeMatchLayer.scrollLeft = editor.scrollLeft;
  }
}

function fitEditorToContent() {
  if (!editor || !lineNumbers) return;

  // In full editor mode, CSS controls the editor height so the full screen stays stable.
  if (document.body.classList.contains('editor-fullscreen-active')) {
    editor.style.height = '';
    lineNumbers.style.height = '';
    if (codeMatchLayer) codeMatchLayer.style.height = '';
    if (editorStack) editorStack.style.height = '';
    return;
  }

  const minHeight = Math.max(560, Math.round(window.innerHeight * 0.72));
  editor.style.height = 'auto';
  const targetHeight = Math.max(minHeight, editor.scrollHeight + 4);
  const finalHeight = `${targetHeight}px`;

  editor.style.height = finalHeight;
  lineNumbers.style.height = finalHeight;
  if (codeMatchLayer) codeMatchLayer.style.height = finalHeight;
  if (editorStack) editorStack.style.height = finalHeight;
  if (editorWrap) editorWrap.style.minHeight = finalHeight;

  syncEditorScroll();
}

function getLineNumberAt(text, index) {
  return text.slice(0, index).split('\n').length;
}


function preserveNewLinesAsSpaces(value) {
  return String(value || '').replace(/[^\n\r]/g, ' ');
}

function maskIgnoredHTMLSections(text) {
  let output = String(text || '');
  output = output.replace(/<!--[\s\S]*?-->/g, match => preserveNewLinesAsSpaces(match));

  const rawTextPattern = /<(script|style|textarea|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
  output = output.replace(rawTextPattern, full => {
    const open = full.match(/^<(script|style|textarea|template)\b[^>]*>/i)?.[0] || '';
    const closeMatch = full.match(/<\/(script|style|textarea|template)\s*>\s*$/i);
    const close = closeMatch ? closeMatch[0] : '';
    const middleStart = open.length;
    const middleEnd = full.length - close.length;
    return open + preserveNewLinesAsSpaces(full.slice(middleStart, middleEnd)) + close;
  });

  return output;
}

function parseHTMLTagToken(text, start) {
  let index = start + 1;
  let quote = '';

  while (index < text.length) {
    const char = text[index];
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      const raw = text.slice(start, index + 1);
      if (/^<!--/.test(raw) || /^<!DOCTYPE\s+html\s*>/i.test(raw)) {
        return { raw, end: index + 1, skip: true };
      }
      const nameMatch = raw.match(/^<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)\b/);
      if (!nameMatch) return { raw, end: index + 1, skip: true };
      const name = nameMatch[1].toLowerCase();
      const closing = /^<\s*\//.test(raw);
      const explicitSelfClosing = /\/\s*>$/.test(raw);
      const selfClosing = explicitSelfClosing || selfClosingTagNames.has(name);
      return { raw, end: index + 1, name, closing, selfClosing, skip: false };
    }
    index += 1;
  }

  return null;
}

function parseHtmlTags(text) {
  const original = String(text || '');
  const safeText = maskIgnoredHTMLSections(original);
  const tags = [];

  for (let index = 0; index < safeText.length; index += 1) {
    if (safeText[index] !== '<') continue;
    const token = parseHTMLTagToken(safeText, index);
    if (!token) continue;
    if (!token.skip && token.name) {
      tags.push({
        name: token.name,
        raw: original.slice(index, token.end),
        start: index,
        end: token.end,
        closing: token.closing,
        selfClosing: token.selfClosing,
        pairIndex: null,
        unmatchedReason: ''
      });
    }
    index = Math.max(index, token.end - 1);
  }

  const stack = [];
  tags.forEach((tag, index) => {
    if (tag.selfClosing) return;

    if (!tag.closing) {
      stack.push(index);
      return;
    }

    let matchedStackIndex = -1;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      if (tags[stack[i]].name === tag.name) {
        matchedStackIndex = i;
        break;
      }
    }

    if (matchedStackIndex === -1) {
      tag.unmatchedReason = 'missing-opening';
      return;
    }

    const openingIndex = stack[matchedStackIndex];
    tags[openingIndex].pairIndex = index;
    tag.pairIndex = openingIndex;

    for (let i = stack.length - 1; i > matchedStackIndex; i -= 1) {
      const interrupted = tags[stack[i]];
      if (!interrupted.unmatchedReason) interrupted.unmatchedReason = 'possible-missing-closing';
    }
    stack.splice(matchedStackIndex, stack.length - matchedStackIndex);
  });

  stack.forEach(openingIndex => {
    if (!tags[openingIndex].unmatchedReason) tags[openingIndex].unmatchedReason = 'missing-closing';
  });

  return tags;
}

function getTagAtCursor(tags, cursor) {
  return tags.find(tag => cursor >= tag.start && cursor <= tag.end)
    || tags.find(tag => cursor > tag.start - 2 && cursor < tag.end + 2)
    || null;
}

function createSyntaxToken(start, end, className, priority = 1) {
  return Number.isFinite(start) && Number.isFinite(end) && end > start
    ? { start, end, className, priority }
    : null;
}

function addSyntaxToken(tokens, start, end, className, priority = 1) {
  const token = createSyntaxToken(start, end, className, priority);
  if (token) tokens.push(token);
}

function getHTMLSyntaxTokens(text) {
  const tokens = [];
  const tagPattern = /<!--([\s\S]*?)-->|<!DOCTYPE\s+html\s*>|<\/?[A-Za-z][A-Za-z0-9:-]*(?:\s[^<>]*?)?>/gi;
  let match;

  while ((match = tagPattern.exec(text)) !== null) {
    const full = match[0];
    const offset = match.index;

    if (full.startsWith('<!--')) {
      addSyntaxToken(tokens, offset, offset + full.length, 'syn-comment', 8);
      continue;
    }

    if (/^<!DOCTYPE/i.test(full)) {
      addSyntaxToken(tokens, offset, offset + full.length, 'syn-doctype', 8);
      continue;
    }

    addSyntaxToken(tokens, offset, offset + 1, 'syn-html-bracket', 7);
    if (full.endsWith('>')) addSyntaxToken(tokens, offset + full.length - 1, offset + full.length, 'syn-html-bracket', 7);

    const nameMatch = full.match(/^<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)/);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const nameStartLocal = full.indexOf(name);
    const nameEndLocal = nameStartLocal + name.length;
    addSyntaxToken(tokens, offset + nameStartLocal, offset + nameEndLocal, 'syn-html-tag', 9);

    if (/^<\s*\//.test(full)) {
      const slashLocal = full.indexOf('/');
      if (slashLocal >= 0) addSyntaxToken(tokens, offset + slashLocal, offset + slashLocal + 1, 'syn-html-bracket', 7);
      continue;
    }

    const attrPartStart = nameEndLocal;
    const attrPartEnd = Math.max(attrPartStart, full.length - (full.endsWith('/>') ? 2 : 1));
    const attrText = full.slice(attrPartStart, attrPartEnd);
    const attrPattern = /([A-Za-z_:][A-Za-z0-9_:.-]*)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s"'=<>`]+)?/g;
    let attrMatch;

    while ((attrMatch = attrPattern.exec(attrText)) !== null) {
      const attrName = attrMatch[1];
      if (!attrName || attrName === name) continue;
      const attrNameStart = offset + attrPartStart + attrMatch.index;
      addSyntaxToken(tokens, attrNameStart, attrNameStart + attrName.length, 'syn-html-attr', 9);

      if (attrMatch[2]) {
        const equalsStart = attrNameStart + attrName.length;
        addSyntaxToken(tokens, equalsStart, equalsStart + attrMatch[2].length, 'syn-html-equals', 6);
      }

      if (attrMatch[3]) {
        const valueStart = attrNameStart + attrName.length + (attrMatch[2]?.length || 0);
        addSyntaxToken(tokens, valueStart, valueStart + attrMatch[3].length, 'syn-string', 10);
      }
    }
  }

  return tokens;
}

function getCSSSyntaxTokens(text) {
  const tokens = [];

  for (const match of text.matchAll(/\/\*[\s\S]*?\*\//g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-comment', 10);
  }

  for (const match of text.matchAll(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-string', 10);
  }

  for (const match of text.matchAll(/(^|[{};\n])\s*([^{};:\n][^{};\n]*?)\s*(?=\{)/g)) {
    const selector = match[2];
    const selectorStart = match.index + match[0].indexOf(selector);
    addSyntaxToken(tokens, selectorStart, selectorStart + selector.length, 'syn-css-selector', 6);
  }

  for (const match of text.matchAll(/([a-zA-Z-]+)(\s*:)/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[1].length, 'syn-css-property', 8);
    addSyntaxToken(tokens, match.index + match[1].length, match.index + match[0].length, 'syn-punctuation', 5);
  }

  for (const match of text.matchAll(/#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-number', 7);
  }

  for (const match of text.matchAll(/[{}();,]/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-punctuation', 4);
  }

  return tokens;
}

function getJSSyntaxTokens(text) {
  const tokens = [];
  const keywordPattern = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|new|this|try|catch|finally|throw|true|false|null|undefined|document|window)\b/g;

  for (const match of text.matchAll(/\/\/[^\r\n]*|\/\*[\s\S]*?\*\//g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-comment', 10);
  }

  for (const match of text.matchAll(/`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-string', 10);
  }

  for (const match of text.matchAll(keywordPattern)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-js-keyword', 7);
  }

  for (const match of text.matchAll(/\b\d+(?:\.\d+)?\b/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-number', 6);
  }

  for (const match of text.matchAll(/\b([A-Za-z_$][\w$]*)(\s*)(?=\()/g)) {
    const name = match[1];
    if (!['if', 'for', 'while', 'switch', 'catch', 'function'].includes(name)) {
      addSyntaxToken(tokens, match.index, match.index + name.length, 'syn-js-function', 8);
    }
  }

  for (const match of text.matchAll(/[{}()[\].,;:+\-*/%=<>!&|?]/g)) {
    addSyntaxToken(tokens, match.index, match.index + match[0].length, 'syn-punctuation', 3);
  }

  return tokens;
}

function getSyntaxTokens(text) {
  if (activeLanguage === 'html') return getHTMLSyntaxTokens(text);
  if (activeLanguage === 'css') return getCSSSyntaxTokens(text);
  if (activeLanguage === 'js') return getJSSyntaxTokens(text);
  return [];
}

function getBestTokenForSegment(tokens, start, end) {
  return tokens
    .filter(token => start >= token.start && end <= token.end)
    .sort((a, b) => b.priority - a.priority)[0] || null;
}

function getMatchClassForSegment(spans, start, end) {
  const match = spans.find(span => start >= span.start && end <= span.end);
  return match ? `tag-match ${match.className}` : '';
}

function renderCodeMatchLayer(spans = []) {
  if (!codeMatchLayer) return;

  const text = editor.value || '';
  const syntaxTokens = getSyntaxTokens(text);
  const sortedMatches = spans
    .filter(span => Number.isFinite(span.start) && Number.isFinite(span.end) && span.end > span.start)
    .sort((a, b) => a.start - b.start);

  const boundaries = new Set([0, text.length]);
  syntaxTokens.forEach(token => {
    boundaries.add(token.start);
    boundaries.add(token.end);
  });
  sortedMatches.forEach(span => {
    boundaries.add(span.start);
    boundaries.add(span.end);
  });

  const points = [...boundaries]
    .filter(value => value >= 0 && value <= text.length)
    .sort((a, b) => a - b);

  let output = '';
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    if (end <= start) continue;

    const chunk = text.slice(start, end);
    const token = getBestTokenForSegment(syntaxTokens, start, end);
    const matchClass = getMatchClassForSegment(sortedMatches, start, end);
    const className = [token?.className || '', matchClass].filter(Boolean).join(' ');

    output += className
      ? `<span class="${escapeAttribute(className)}">${escapeHTML(chunk)}</span>`
      : escapeHTML(chunk);
  }

  codeMatchLayer.innerHTML = (output || '&nbsp;') + '\n';
  syncEditorScroll();
}

function resetTagMatchInfo() {
  if (!tagMatchInfo) return;
  tagMatchInfo.className = 'tag-match-info';
  tagMatchInfo.textContent = '';
}

function updateTagMatching() {
  if (!tagMatchInfo || !codeMatchLayer) return;

  if (activeLanguage !== 'html') {
    activeTagMatches = [];
    renderCodeMatchLayer([]);
    resetTagMatchInfo();
    return;
  }

  const text = editor.value;
  const tags = parseHtmlTags(text);
  const selectedTag = getTagAtCursor(tags, editor.selectionStart);

  if (!selectedTag) {
    activeTagMatches = [];
    renderCodeMatchLayer([]);
    resetTagMatchInfo();
    return;
  }

  if (selectedTag.selfClosing) {
    activeTagMatches = [{ start: selectedTag.start, end: selectedTag.end, className: 'tag-match-self' }];
    renderCodeMatchLayer(activeTagMatches);
    tagMatchInfo.className = 'tag-match-info good';
    tagMatchInfo.textContent = `Self-closing tag: <${selectedTag.name}> does not need a closing tag.`;
    return;
  }

  if (selectedTag.pairIndex !== null && tags[selectedTag.pairIndex]) {
    const pair = tags[selectedTag.pairIndex];
    activeTagMatches = [selectedTag, pair]
      .sort((a, b) => a.start - b.start)
      .map(tag => ({ start: tag.start, end: tag.end, className: 'tag-match-pair' }));
    renderCodeMatchLayer(activeTagMatches);
    tagMatchInfo.className = 'tag-match-info good';
    const openTag = selectedTag.closing ? pair : selectedTag;
    const closeTag = selectedTag.closing ? selectedTag : pair;
    tagMatchInfo.textContent = `Matched: <${selectedTag.name}> opens on line ${getLineNumberAt(text, openTag.start)} and closes on line ${getLineNumberAt(text, closeTag.start)}.`;
    return;
  }

  activeTagMatches = [{ start: selectedTag.start, end: selectedTag.end, className: 'tag-match-missing' }];
  renderCodeMatchLayer(activeTagMatches);
  tagMatchInfo.className = 'tag-match-info error';
  tagMatchInfo.textContent = selectedTag.closing
    ? `This </${selectedTag.name}> closing tag has no matching opening tag.`
    : `This <${selectedTag.name}> opening tag needs a matching </${selectedTag.name}> closing tag.`;
}

function applyTheme(theme) {
  const safeTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = safeTheme;
  if (themeToggle) themeToggle.textContent = safeTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
  if (entryThemeToggle) {
    entryThemeToggle.classList.toggle('is-dark', safeTheme === 'dark');
    entryThemeToggle.setAttribute('aria-pressed', String(safeTheme === 'dark'));
  }
  if (entryThemeLabel) entryThemeLabel.textContent = safeTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
  saveJSON(STORAGE_KEYS.theme, safeTheme);
}


function getEditorHistoryKey(language = activeLanguage) {
  const filePart = ['html', 'css', 'js'].includes(language) ? `:${getActiveLanguageFileName(language)}` : '';
  return `${activity?.id || 'no-activity'}:${language}${filePart}`;
}

function createEditorState(value = editor.value, start = editor.selectionStart || 0, end = editor.selectionEnd || start) {
  return { value, start, end };
}

function statesHaveSameText(a, b) {
  return Boolean(a && b && a.value === b.value);
}

function ensureEditorHistory(language = activeLanguage, value = codeStore[language] || '') {
  const key = getEditorHistoryKey(language);
  if (!editorHistoryByKey[key]) {
    editorHistoryByKey[key] = {
      undo: [{ value, start: 0, end: 0 }],
      redo: []
    };
  }
  return editorHistoryByKey[key];
}

function resetEditorHistory(language = activeLanguage, value = codeStore[language] || '') {
  const key = getEditorHistoryKey(language);
  editorHistoryByKey[key] = {
    undo: [{ value, start: 0, end: 0 }],
    redo: []
  };
}

function resetAllLanguageHistoryForCurrentActivity() {
  ['html', 'css', 'js'].forEach(language => resetEditorHistory(language, codeStore[language] || ''));
}

function commitEditorHistory() {
  if (isRestoringEditorHistory) return;
  const history = ensureEditorHistory();
  const state = createEditorState();
  const last = history.undo[history.undo.length - 1];

  if (!statesHaveSameText(last, state)) {
    history.undo.push(state);
    if (history.undo.length > EDITOR_HISTORY_LIMIT) history.undo.shift();
    history.redo = [];
  } else if (last) {
    last.start = state.start;
    last.end = state.end;
  }
}

function restoreEditorState(state, statusText = '') {
  if (!state) return;
  isRestoringEditorHistory = true;
  editor.value = state.value;
  const safeStart = Math.min(state.start ?? state.value.length, state.value.length);
  const safeEnd = Math.min(state.end ?? safeStart, state.value.length);
  editor.setSelectionRange(safeStart, safeEnd);
  saveActiveEditor();
  updateLineNumbers();
  hideSuggestions();
  updateTagMatching();
  syncEditorScroll();
  isRestoringEditorHistory = false;
  if (statusText) setStatus(statusText);
}

function customUndo() {
  const history = ensureEditorHistory();
  const current = createEditorState();
  const last = history.undo[history.undo.length - 1];

  if (!statesHaveSameText(last, current)) {
    history.undo.push(current);
  }

  if (history.undo.length <= 1) {
    setStatus('Nothing to undo');
    return;
  }

  const popped = history.undo.pop();
  history.redo.push(popped);
  restoreEditorState(history.undo[history.undo.length - 1], 'Undo');
}

function customRedo() {
  const history = ensureEditorHistory();
  if (!history.redo.length) {
    setStatus('Nothing to redo');
    return;
  }

  const next = history.redo.pop();
  history.undo.push(next);
  restoreEditorState(next, 'Redo');
}

function applyProgrammaticEditorChange(nextValue, cursorStart = 0, cursorEnd = cursorStart, statusText = '') {
  editor.value = nextValue;
  editor.focus();
  const safeStart = Math.min(cursorStart, nextValue.length);
  const safeEnd = Math.min(cursorEnd, nextValue.length);
  editor.setSelectionRange(safeStart, safeEnd);
  saveActiveEditor();
  updateLineNumbers();
  updateTagMatching();
  commitEditorHistory();
  if (statusText) setStatus(statusText);
}


function loadActiveEditor() {
  syncActiveLanguageFileFromStore(activeLanguage);
  editor.value = getLanguageFileContent(activeLanguage, getActiveLanguageFileName(activeLanguage));
  ensureEditorHistory(activeLanguage, editor.value);
  editorInfo.textContent = activeLanguage === 'html'
    ? `HTML page: ${getActiveHtmlPageName()}. Add more pages for website activities, then connect them using links like <a href="about.html">.`
    : activeLanguage === 'css'
      ? `CSS file: ${getActiveLanguageFileName('css')}. You can add more CSS files if an activity needs a larger website.`
      : `JavaScript file: ${getActiveLanguageFileName('js')}. You can add more JS files if an activity needs separate scripts.`;
  renderHTMLPageManager();
  updateLineNumbers();
  hideSuggestions();
  renderStructureAlert();
  fitEditorToContent();
  updateTagMatching();
}

function saveActiveEditor() {
  setLanguageFileContent(activeLanguage, getActiveLanguageFileName(activeLanguage), editor.value);
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();

  renderHTMLPageManager();
  renderStructureAlert();
  fitEditorToContent();
  updateTagMatching();
  renderErrorChecker();
}

function updateLineNumbers() {
  const lines = editor.value.split('\n').length || 1;
  lineNumbers.textContent = Array.from({ length: lines }, (_, index) => index + 1).join('\n');
  fitEditorToContent();
}


function cssValueSuggestion(label, insert, desc) {
  return { label, insert, desc, type: 'code' };
}

function getCSSValueSuggestionsForProperty(propertyName = '') {
  const property = String(propertyName || '').trim().toLowerCase();
  const commonColors = [
    cssValueSuggestion('blue', '#2563eb;', 'Common blue color.'),
    cssValueSuggestion('light blue', '#dbeafe;', 'Light blue background.'),
    cssValueSuggestion('red', '#dc2626;', 'Common red color.'),
    cssValueSuggestion('green', '#16a34a;', 'Common green color.'),
    cssValueSuggestion('yellow', '#facc15;', 'Common yellow color.'),
    cssValueSuggestion('orange', '#f97316;', 'Common orange color.'),
    cssValueSuggestion('purple', '#7c3aed;', 'Common purple color.'),
    cssValueSuggestion('black', '#000000;', 'Black.'),
    cssValueSuggestion('white', '#ffffff;', 'White.'),
    cssValueSuggestion('gray', '#64748b;', 'Slate gray.'),
    cssValueSuggestion('transparent', 'transparent;', 'Transparent color.'),
    cssValueSuggestion('primary variable', 'var(--primary);', 'Use a CSS variable color.'),
    cssValueSuggestion('rgb color', 'rgb(37, 99, 235);', 'RGB color format.'),
    cssValueSuggestion('rgba color', 'rgba(37, 99, 235, 0.25);', 'RGBA with opacity.'),
    cssValueSuggestion('linear gradient', 'linear-gradient(135deg, #2563eb, #06b6d4);', 'Gradient background.')
  ];

  const valueMap = {
    color: commonColors,
    'background-color': commonColors,
    background: commonColors,
    border: [
      cssValueSuggestion('thin gray border', '1px solid #d1d5db;', 'Thin gray border.'),
      cssValueSuggestion('blue border', '2px solid #2563eb;', 'Blue border.'),
      cssValueSuggestion('no border', 'none;', 'Remove border.')
    ],
    'border-color': commonColors,
    'border-radius': [
      cssValueSuggestion('small radius', '8px;', 'Slightly rounded.'),
      cssValueSuggestion('medium radius', '16px;', 'Rounded corners.'),
      cssValueSuggestion('large radius', '24px;', 'Very rounded corners.'),
      cssValueSuggestion('circle pill', '999px;', 'Pill/circle corners.'),
      cssValueSuggestion('none', '0;', 'No rounded corners.')
    ],
    display: [
      cssValueSuggestion('block', 'block;', 'Start on a new line.'),
      cssValueSuggestion('inline block', 'inline-block;', 'Inline but with width/height.'),
      cssValueSuggestion('flex', 'flex;', 'Use flexbox layout.'),
      cssValueSuggestion('grid', 'grid;', 'Use grid layout.'),
      cssValueSuggestion('none', 'none;', 'Hide element.')
    ],
    position: [
      cssValueSuggestion('relative', 'relative;', 'Position relative to itself.'),
      cssValueSuggestion('absolute', 'absolute;', 'Position inside nearest positioned parent.'),
      cssValueSuggestion('fixed', 'fixed;', 'Stay fixed on the screen.'),
      cssValueSuggestion('sticky', 'sticky;', 'Stick while scrolling.'),
      cssValueSuggestion('static', 'static;', 'Default position.')
    ],
    'justify-content': [
      cssValueSuggestion('center', 'center;', 'Center horizontally.'),
      cssValueSuggestion('space between', 'space-between;', 'Space items apart.'),
      cssValueSuggestion('space around', 'space-around;', 'Space around each item.'),
      cssValueSuggestion('flex start', 'flex-start;', 'Align at start.'),
      cssValueSuggestion('flex end', 'flex-end;', 'Align at end.')
    ],
    'align-items': [
      cssValueSuggestion('center', 'center;', 'Center vertically.'),
      cssValueSuggestion('stretch', 'stretch;', 'Stretch items.'),
      cssValueSuggestion('flex start', 'flex-start;', 'Align at start.'),
      cssValueSuggestion('flex end', 'flex-end;', 'Align at end.'),
      cssValueSuggestion('baseline', 'baseline;', 'Align text baselines.')
    ],
    'text-align': [
      cssValueSuggestion('left', 'left;', 'Align text left.'),
      cssValueSuggestion('center', 'center;', 'Center text.'),
      cssValueSuggestion('right', 'right;', 'Align text right.'),
      cssValueSuggestion('justify', 'justify;', 'Stretch text lines.')
    ],
    'font-weight': [
      cssValueSuggestion('normal', '400;', 'Normal weight.'),
      cssValueSuggestion('medium', '500;', 'Medium weight.'),
      cssValueSuggestion('semibold', '600;', 'Semi-bold weight.'),
      cssValueSuggestion('bold', '700;', 'Bold weight.'),
      cssValueSuggestion('extra bold', '900;', 'Very thick text.')
    ],
    'font-family': [
      cssValueSuggestion('Arial', 'Arial, sans-serif;', 'Simple clean font.'),
      cssValueSuggestion('Verdana', 'Verdana, sans-serif;', 'Readable screen font.'),
      cssValueSuggestion('Georgia', 'Georgia, serif;', 'Classic serif font.'),
      cssValueSuggestion('system font', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;', 'Modern system font stack.'),
      cssValueSuggestion('monospace', 'Consolas, Monaco, monospace;', 'Code-like font.')
    ],
    'font-size': [
      cssValueSuggestion('small', '14px;', 'Small text.'),
      cssValueSuggestion('normal', '16px;', 'Normal text.'),
      cssValueSuggestion('large', '24px;', 'Large text.'),
      cssValueSuggestion('responsive', 'clamp(1.5rem, 4vw, 3rem);', 'Responsive heading size.'),
      cssValueSuggestion('one rem', '1rem;', 'Relative font size.')
    ],
    margin: [
      cssValueSuggestion('none', '0;', 'No outside spacing.'),
      cssValueSuggestion('small', '8px;', 'Small margin.'),
      cssValueSuggestion('medium', '16px;', 'Medium margin.'),
      cssValueSuggestion('large', '32px;', 'Large margin.'),
      cssValueSuggestion('center block', '0 auto;', 'Center block horizontally.')
    ],
    padding: [
      cssValueSuggestion('none', '0;', 'No inside spacing.'),
      cssValueSuggestion('small', '8px;', 'Small padding.'),
      cssValueSuggestion('medium', '16px;', 'Medium padding.'),
      cssValueSuggestion('large', '32px;', 'Large padding.'),
      cssValueSuggestion('button padding', '12px 18px;', 'Good button spacing.')
    ],
    width: [
      cssValueSuggestion('full width', '100%;', 'Fill parent width.'),
      cssValueSuggestion('half width', '50%;', 'Half width.'),
      cssValueSuggestion('auto', 'auto;', 'Automatic width.'),
      cssValueSuggestion('responsive container', 'min(100% - 32px, 1000px);', 'Responsive max width.'),
      cssValueSuggestion('fit content', 'fit-content;', 'Fit content width.')
    ],
    height: [
      cssValueSuggestion('auto', 'auto;', 'Automatic height.'),
      cssValueSuggestion('full viewport', '100vh;', 'Full screen height.'),
      cssValueSuggestion('fixed 200px', '200px;', 'Fixed height.'),
      cssValueSuggestion('full parent', '100%;', 'Fill parent height.')
    ],
    'min-height': [
      cssValueSuggestion('full viewport', '100vh;', 'At least full screen height.'),
      cssValueSuggestion('half viewport', '50vh;', 'At least half screen height.'),
      cssValueSuggestion('300px', '300px;', 'At least 300px tall.')
    ],
    gap: [
      cssValueSuggestion('small', '8px;', 'Small gap.'),
      cssValueSuggestion('medium', '16px;', 'Medium gap.'),
      cssValueSuggestion('large', '24px;', 'Large gap.'),
      cssValueSuggestion('responsive', 'clamp(12px, 2vw, 24px);', 'Responsive gap.')
    ],
    'grid-template-columns': [
      cssValueSuggestion('two equal columns', 'repeat(2, 1fr);', 'Two equal columns.'),
      cssValueSuggestion('three equal columns', 'repeat(3, 1fr);', 'Three equal columns.'),
      cssValueSuggestion('responsive cards', 'repeat(auto-fit, minmax(220px, 1fr));', 'Responsive card columns.'),
      cssValueSuggestion('sidebar layout', '250px 1fr;', 'Sidebar plus content.')
    ],
    transition: [
      cssValueSuggestion('quick smooth', 'all 0.2s ease;', 'Quick smooth transition.'),
      cssValueSuggestion('transform only', 'transform 0.2s ease;', 'Animate transform only.'),
      cssValueSuggestion('color background', 'color 0.2s ease, background 0.2s ease;', 'Animate colors.'),
      cssValueSuggestion('slow smooth', 'all 0.4s ease;', 'Slower transition.')
    ],
    transform: [
      cssValueSuggestion('move up', 'translateY(-2px);', 'Move upward.'),
      cssValueSuggestion('scale up', 'scale(1.05);', 'Slightly bigger.'),
      cssValueSuggestion('rotate', 'rotate(3deg);', 'Slight rotation.'),
      cssValueSuggestion('none', 'none;', 'No transform.')
    ],
    cursor: [
      cssValueSuggestion('pointer', 'pointer;', 'Clickable cursor.'),
      cssValueSuggestion('default', 'default;', 'Normal cursor.'),
      cssValueSuggestion('not allowed', 'not-allowed;', 'Disabled cursor.'),
      cssValueSuggestion('text', 'text;', 'Text cursor.')
    ],
    overflow: [
      cssValueSuggestion('hidden', 'hidden;', 'Hide overflow.'),
      cssValueSuggestion('auto', 'auto;', 'Scroll only when needed.'),
      cssValueSuggestion('scroll', 'scroll;', 'Always scroll.'),
      cssValueSuggestion('visible', 'visible;', 'Show overflow.')
    ],
    'object-fit': [
      cssValueSuggestion('cover', 'cover;', 'Fill box and crop.'),
      cssValueSuggestion('contain', 'contain;', 'Fit whole image.'),
      cssValueSuggestion('fill', 'fill;', 'Stretch to fill.'),
      cssValueSuggestion('none', 'none;', 'No fitting.')
    ],
    opacity: [
      cssValueSuggestion('fully visible', '1;', 'Full opacity.'),
      cssValueSuggestion('semi transparent', '0.5;', 'Half visible.'),
      cssValueSuggestion('hidden transparent', '0;', 'Invisible but still in layout.')
    ],
    'box-shadow': [
      cssValueSuggestion('soft shadow', '0 10px 25px rgba(0, 0, 0, 0.15);', 'Soft modern shadow.'),
      cssValueSuggestion('large shadow', '0 20px 50px rgba(15, 23, 42, 0.25);', 'Large shadow.'),
      cssValueSuggestion('none', 'none;', 'Remove shadow.')
    ]
  };

  return valueMap[property] || [
    ...commonColors,
    cssValueSuggestion('auto', 'auto;', 'Automatic value.'),
    cssValueSuggestion('none', 'none;', 'No style/effect.'),
    cssValueSuggestion('inherit', 'inherit;', 'Use parent value.'),
    cssValueSuggestion('initial', 'initial;', 'Use default initial value.'),
    cssValueSuggestion('unset', 'unset;', 'Unset inherited or initial value.')
  ];
}

function getSuggestionContext() {
  const cursor = editor.selectionStart;
  const textBeforeCursor = editor.value.slice(0, cursor);

  if (activeLanguage === 'html') {
    const tagMatch = textBeforeCursor.match(/<([A-Za-z0-9!\- ]*)$/);
    if (tagMatch) {
      return {
        word: tagMatch[1].trimStart(),
        start: cursor - tagMatch[0].length,
        mode: 'html-tag'
      };
    }
  }

  if (activeLanguage === 'css') {
    const currentLine = textBeforeCursor.split(/\r?\n/).pop() || '';
    const valueMatch = currentLine.match(/([a-z-]+)\s*:\s*([^;{}]*)$/i);
    if (valueMatch) {
      const rawValue = valueMatch[2] || '';
      const typedValueMatch = rawValue.match(/[^\s]*$/);
      const typedValue = typedValueMatch ? typedValueMatch[0] : '';
      return {
        word: typedValue,
        start: cursor - typedValue.length,
        mode: 'css-value',
        property: valueMatch[1].toLowerCase()
      };
    }
  }

  const wordMatch = textBeforeCursor.match(/[A-Za-z0-9_.:-]+$/);
  if (wordMatch) {
    return {
      word: wordMatch[0],
      start: cursor - wordMatch[0].length,
      mode: 'word'
    };
  }

  return { word: '', start: cursor, mode: 'word' };
}

function scheduleSuggestionHide(delay = 4200) {
  window.clearTimeout(suggestionHideTimer);
  suggestionHideTimer = window.setTimeout(() => {
    hideSuggestions();
  }, delay);
}

function showSuggestions(event) {
  if (!isStudentAssistanceFeatureEnabled('codeSuggestions')) {
    hideSuggestions();
    return;
  }

  const isRealTyping = !event || event.inputType?.startsWith('insert') || event.inputType === 'historyUndo' || event.inputType === 'historyRedo';

  if (!isRealTyping || editor.selectionStart !== editor.selectionEnd) {
    hideSuggestions();
    return;
  }

  const context = getSuggestionContext();
  currentWord = context.word.trim();
  currentSuggestionStart = context.start;

  // Do not open the menu just because the cursor is inside the editor.
  // The student must type at least one useful character first.
  if (currentWord.length < 1) {
    hideSuggestions();
    return;
  }

  // For HTML tags, avoid showing the list after typing only "<".
  // It appears when the student starts typing the tag name, like <h or <bo.
  if (context.mode === 'html-tag' && !/[A-Za-z!]/.test(currentWord)) {
    hideSuggestions();
    return;
  }

  lastSuggestionInputAt = Date.now();

  const activeSuggestions = (context.mode === 'css-value'
    ? getCSSValueSuggestionsForProperty(context.property)
    : suggestionsByLanguage[activeLanguage]
  ).map(item => ({
    ...item,
    languageType: context.mode === 'css-value' ? 'VALUE' : activeLanguage.toUpperCase()
  }));

  const query = currentWord.toLowerCase();
  currentMatches = activeSuggestions
    .filter(item => {
      const label = item.label.toLowerCase();
      const insertText = String(item.insert || '').toLowerCase();
      return label.startsWith(query) || label.includes(query) || insertText.includes(query);
    })
    .slice(0, context.mode === 'css-value' ? 8 : 6);

  if (!currentMatches.length) {
    hideSuggestions();
    return;
  }

  activeSuggestionIndex = 0;
  suggestionBox.innerHTML = `
    <div class="suggestion-mini-header">
      <span>Suggestions</span>
      <button class="suggestion-close" type="button" aria-label="Hide suggestions">×</button>
    </div>
    ${currentMatches.map((item, index) => {
      const chip = getSuggestionChip(item);
      return `
        <div class="suggestion-item ${index === 0 ? 'active' : ''} ${item.hasClosing ? 'has-closing' : ''}" data-index="${index}" role="option">
          <div>
            <div class="suggestion-label">${escapeHTML(item.label)}</div>
            <div class="suggestion-desc">${escapeHTML(item.desc)}</div>
          </div>
          <span class="suggestion-type ${chip.className}">${escapeHTML(chip.text)}</span>
        </div>
      `;
    }).join('')}
  `;

  suggestionBox.classList.remove('hidden');
  document.body.classList.add('suggestions-open');
  scheduleSuggestionHide();
}

function getSuggestionChip(item) {
  if (item.hasClosing) return { text: 'closing', className: 'closing' };
  if (item.selfClosing) return { text: 'self', className: 'self-closing' };
  if (item.type === 'template') return { text: 'template', className: 'template' };
  return { text: item.languageType || activeLanguage.toUpperCase(), className: '' };
}

function hideSuggestions() {
  window.clearTimeout(suggestionHideTimer);
  suggestionBox.classList.add('hidden');
  document.body.classList.remove('suggestions-open');
  suggestionBox.innerHTML = '';
  currentMatches = [];
}

function moveActiveSuggestion(direction) {
  if (!currentMatches.length) return;
  activeSuggestionIndex = (activeSuggestionIndex + direction + currentMatches.length) % currentMatches.length;
  [...suggestionBox.querySelectorAll('.suggestion-item')].forEach((item, index) => {
    item.classList.toggle('active', index === activeSuggestionIndex);
  });
}

function applySuggestion(index = activeSuggestionIndex) {
  const selected = currentMatches[index];
  if (!selected) return;

  const cursor = editor.selectionStart;
  const before = editor.value.slice(0, currentSuggestionStart);
  const after = editor.value.slice(cursor);
  const rawInsert = selected.insert;
  const markerIndex = rawInsert.indexOf('|');
  const insertText = rawInsert.replace('|', '');

  const nextValue = before + insertText + after;
  const newCursorPosition = markerIndex >= 0
    ? before.length + markerIndex
    : before.length + insertText.length;

  applyProgrammaticEditorChange(
    nextValue,
    newCursorPosition,
    newCursorPosition,
    selected.hasClosing ? `Inserted ${selected.label} with closing tag` : `Inserted ${selected.label}`
  );
  hideSuggestions();
}

function getHTMLStructureReport() {
  const html = codeStore.html || '';
  const checks = [
    { key: 'doctype', label: '<!DOCTYPE html>', passed: /<!doctype\s+html\s*>/i.test(html) },
    { key: 'htmlOpen', label: '<html>', passed: /<html(\s|>)/i.test(html) },
    { key: 'htmlClose', label: '</html>', passed: /<\/html\s*>/i.test(html) },
    { key: 'headOpen', label: '<head>', passed: /<head(\s|>)/i.test(html) },
    { key: 'headClose', label: '</head>', passed: /<\/head\s*>/i.test(html) },
    { key: 'title', label: '<title>', passed: /<title(\s|>)[\s\S]*?<\/title\s*>/i.test(html) },
    { key: 'bodyOpen', label: '<body>', passed: /<body(\s|>)/i.test(html) },
    { key: 'bodyClose', label: '</body>', passed: /<\/body\s*>/i.test(html) }
  ];

  return {
    checks,
    passed: checks.every(item => item.passed),
    missing: checks.filter(item => !item.passed)
  };
}

function renderStructureAlert() {
  if (!structureAlert) return;

  if (activeLanguage !== 'html') {
    structureAlert.classList.add('hidden');
    return;
  }

  const report = getHTMLStructureReport();
  structureAlert.classList.remove('hidden', 'good', 'warning');
  structureAlert.classList.add(report.passed ? 'good' : 'warning');

  const message = report.passed
    ? 'Complete HTML structure detected. Good job!'
    : 'Whole HTML structure required. Add the missing parts below.';

  structureAlert.innerHTML = `
    <div class="structure-message">
      <strong>${message}</strong>
      <span>HTML-only output still works after clicking Run Code.</span>
    </div>
    <div class="structure-list">
      ${report.checks.map(item => `
        <span class="structure-chip ${item.passed ? 'pass' : 'missing'}">${item.passed ? '✓' : '!'} ${escapeHTML(item.label)}</span>
      `).join('')}
    </div>
  `;
}

function isCompleteHTMLStructure() {
  return getHTMLStructureReport().passed;
}


function hasBalancedHTMLTags(html) {
  const issues = getDetailedHTMLTagIssues(html || '');
  return !issues.some(issue => issue.severity === 'error');
}


function createStyleBlock(cssText = '') {
  const css = String(cssText || '').trim();
  if (!css) return '';
  const safeCSS = css.replace(/<\/style>/gi, '');
  return `<style>\n${safeCSS}\n</style>`;
}

function createScriptBlock(jsText = '') {
  const js = String(jsText || '').trim();
  if (!js) return '';
  const safeJS = JSON.stringify(js).replace(/<\//g, '<\\/');

  return `<script>
(function () {
  function showStudentError(error) {
    document.body.dataset.runtimeError = error.message || String(error);
    var pre = document.createElement('pre');
    pre.textContent = 'JavaScript Error: ' + (error.message || String(error));
    pre.style.background = '#fee2e2';
    pre.style.color = '#991b1b';
    pre.style.padding = '16px';
    pre.style.borderRadius = '12px';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.fontFamily = 'Consolas, Monaco, monospace';
    document.body.appendChild(pre);
    try {
      parent.postMessage({ type: 'mcs-preview-runtime', level: 'error', message: error.message || String(error) }, '*');
    } catch (postError) {}
  }

  try {
    new Function(${safeJS})();
  } catch (error) {
    showStudentError(error);
  }
})();
<\/script>`;
}

function getReferencedCodeFiles(html, language) {
  const refs = language === 'css' ? getExternalCSSReferences(html) : getExternalJSReferences(html);
  const files = getLanguageFileMap(language);
  const matches = [];
  refs.forEach(ref => {
    const base = cleanLanguageFileName(getBaseFileNameFromReference(ref), language);
    if (base && Object.prototype.hasOwnProperty.call(files, base)) {
      matches.push({ name: base, content: files[base] || '' });
    }
  });
  return matches;
}

function getCSSBlocksForPreview(html) {
  const refs = getExternalCSSReferences(html);
  const matched = getReferencedCodeFiles(html, 'css').filter(item => String(item.content || '').trim());
  if (refs.length) return matched.map(item => createStyleBlock(item.content)).join('\n');
  const activeCss = getLanguageFileContent('css', getActiveLanguageFileName('css'));
  return activeCss.trim() ? createStyleBlock(activeCss) : '';
}

function getJSBlocksForPreview(html) {
  const refs = getExternalJSReferences(html);
  const matched = getReferencedCodeFiles(html, 'js').filter(item => String(item.content || '').trim());
  if (refs.length) return matched.map(item => createScriptBlock(item.content)).join('\n');
  const activeJs = getLanguageFileContent('js', getActiveLanguageFileName('js'));
  return activeJs.trim() ? createScriptBlock(activeJs) : '';
}

function shouldApplyCSSForPreview(html) {
  return Boolean(getCSSBlocksForPreview(html));
}

function shouldApplyJSForPreview(html) {
  return Boolean(getJSBlocksForPreview(html));
}

function injectAssetsIntoHTML(html, styleBlock, scriptBlock) {
  let output = html || '';

  if (styleBlock) {
    if (/<\/head\s*>/i.test(output)) {
      output = output.replace(/<\/head\s*>/i, `${styleBlock}\n</head>`);
    } else {
      output = `${styleBlock}\n${output}`;
    }
  }

  if (scriptBlock) {
    if (/<\/body\s*>/i.test(output)) {
      output = output.replace(/<\/body\s*>/i, `${scriptBlock}\n</body>`);
    } else {
      output = `${output}\n${scriptBlock}`;
    }
  }

  return output;
}


function shouldOpenExternalLinksInsidePreview() {
  const settings = normalizeAssistanceSettings(studentAssistanceSettings);
  return settings.externalLinksSamePreview !== false;
}

function createPreviewNavigationBlock(currentPageName = getActiveHtmlPageName()) {
  const safePage = JSON.stringify(currentPageName);
  const externalLinksInsidePreview = shouldOpenExternalLinksInsidePreview();
  const safeExternalLinksInsidePreview = JSON.stringify(externalLinksInsidePreview);
  return `<script>
(function () {
  var currentPage = ${safePage};
  var externalLinksInsidePreview = ${safeExternalLinksInsidePreview};

  function isExternalWebLink(href) {
    return /^https?:\/\//i.test(String(href || '').trim());
  }

  function isInternalPage(href) {
    if (!href || /^(https?:|mailto:|tel:|javascript:|data:|blob:|#)/i.test(href)) return false;
    var clean = href.split('#')[0].split('?')[0];
    var name = clean.split('/').pop();
    return /\.html?$/i.test(name);
  }

  function prepareExternalLinks(root) {
    var links = (root || document).querySelectorAll ? (root || document).querySelectorAll('a[href]') : [];
    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href') || '';
      if (!isExternalWebLink(href)) return;
      if (externalLinksInsidePreview) {
        link.setAttribute('target', '_self');
        link.removeAttribute('rel');
        return;
      }
      link.setAttribute('target', '_blank');
      var rel = (link.getAttribute('rel') || '').toLowerCase();
      if (rel.indexOf('noopener') === -1 || rel.indexOf('noreferrer') === -1) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  prepareExternalLinks(document);

  try {
    var observer = new MutationObserver(function () { prepareExternalLinks(document); });
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  } catch (error) {}

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    var href = link.getAttribute('href') || '';

    if (isExternalWebLink(href)) {
      if (externalLinksInsidePreview) {
        event.preventDefault();
        try { window.location.href = href; } catch (error) { link.setAttribute('target', '_self'); }
        return;
      }
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      return;
    }

    if (!isInternalPage(href)) return;
    event.preventDefault();
    parent.postMessage({ type: 'mcs-preview-navigate', href: href, from: currentPage }, '*');
  }, true);
})();
<\/script>`;
}


function createPreviewRuntimeReporterBlock() {
  return `<script>
(function () {
  function send(level, message) {
    try {
      var clean = String(message || '').replace(/\s+/g, ' ').slice(0, 500);
      if (!clean) return;
      if (document.body && level !== 'log') document.body.dataset.runtimeError = clean;
      parent.postMessage({ type: 'mcs-preview-runtime', level: level, message: clean }, '*');
    } catch (error) {}
  }
  window.addEventListener('error', function (event) {
    send('error', event.message || (event.error && event.error.message) || 'JavaScript error');
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    send('unhandledrejection', reason && reason.message ? reason.message : reason);
  });
  ['error', 'warn'].forEach(function (method) {
    var original = console[method];
    console[method] = function () {
      var message = Array.prototype.slice.call(arguments).map(function (item) {
        if (item && item.message) return item.message;
        if (typeof item === 'object') {
          try { return JSON.stringify(item); } catch (error) { return String(item); }
        }
        return String(item);
      }).join(' ');
      send(method === 'error' ? 'error' : 'warning', message);
      if (original) original.apply(console, arguments);
    };
  });
})();
<\/script>`;
}


function injectRuntimeReporterEarly(html, reporterBlock) {
  let output = html || '';
  if (!reporterBlock) return output;
  if (/<head\b[^>]*>/i.test(output)) {
    return output.replace(/<head\b[^>]*>/i, match => `${match}\n${reporterBlock}`);
  }
  if (/<html\b[^>]*>/i.test(output)) {
    return output.replace(/<html\b[^>]*>/i, match => `${match}\n${reporterBlock}`);
  }
  if (/<!doctype\s+html\s*>/i.test(output)) {
    return output.replace(/<!doctype\s+html\s*>/i, match => `${match}\n${reporterBlock}`);
  }
  return `${reporterBlock}\n${output}`;
}

function buildFullCode(pageName = getActiveHtmlPageName()) {
  const safePageName = normalizeHtmlPageName(pageName);
  const html = getHTMLPageContent(safePageName) || '';
  const styleBlock = getCSSBlocksForPreview(html);
  const scriptBlock = getJSBlocksForPreview(html);
  const navigationBlock = createPreviewNavigationBlock(safePageName);
  const runtimeReporterBlock = createPreviewRuntimeReporterBlock();
  const bodyScriptBlock = [scriptBlock, navigationBlock].filter(Boolean).join('\n');
  const looksLikeFullDocument = /<!doctype/i.test(html) || /<html(\s|>)/i.test(html) || /<head(\s|>)/i.test(html) || /<body(\s|>)/i.test(html);

  if (looksLikeFullDocument) {
    return injectAssetsIntoHTML(injectRuntimeReporterEarly(html, runtimeReporterBlock), styleBlock, bodyScriptBlock);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${runtimeReporterBlock}
  ${styleBlock}
</head>
<body>
${html}
${bodyScriptBlock}
</body>
</html>`;
}

function getCollapsedTopbarHeight(topbar) {
  if (!topbar) return 0;
  const brandHeight = topbar.querySelector('.brand-block')?.getBoundingClientRect().height || 0;
  const actionsHeight = topbar.querySelector('.top-actions')?.getBoundingClientRect().height || 0;
  const styles = window.getComputedStyle(topbar);
  const paddingY = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
  const borderY = (parseFloat(styles.borderTopWidth) || 0) + (parseFloat(styles.borderBottomWidth) || 0);
  return Math.ceil(Math.max(brandHeight, actionsHeight, 42) + paddingY + borderY);
}

function getTopbarSafeOffset(options = {}) {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return options.tight ? 8 : 14;

  const isPhone = document.documentElement.dataset.deviceMode === 'phone' || window.innerWidth <= 760;
  if (isPhone) {
    const rect = topbar.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < window.innerHeight;
    return Math.ceil((visible ? Math.max(0, rect.bottom) : 0) + (options.tight ? 6 : 10));
  }

  let topbarHeight = topbar.getBoundingClientRect().height || 0;
  const isDesktop = window.matchMedia?.('(min-width: 821px)').matches ?? window.innerWidth >= 821;
  const accountStripCanSlide = isDesktop && (
    document.body.classList.contains('student-session-active') ||
    document.body.classList.contains('guest-session-active')
  );

  // The account strip is hidden until hover on desktop. Do not include its
  // expanded height while aligning Output Preview; otherwise Run stops too low.
  if (options.preferCollapsedHeader && accountStripCanSlide) {
    const collapsedHeight = getCollapsedTopbarHeight(topbar);
    if (collapsedHeight > 0) topbarHeight = Math.min(topbarHeight, collapsedHeight);
  }

  return Math.ceil(topbarHeight + (options.tight ? 6 : 12));
}

function getViewportSafeTop(options = {}) {
  if (options.outputTopLock) return 0;
  const topbar = document.querySelector('.topbar');
  const margin = options.tight ? 6 : 10;
  if (!topbar) return margin;

  const isPhone = document.documentElement.dataset.deviceMode === 'phone' || window.innerWidth <= 760;
  const rect = topbar.getBoundingClientRect();
  const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
  if (!isVisible) return margin;

  if (isPhone) return Math.ceil(Math.max(0, rect.bottom) + margin);

  const isDesktop = window.matchMedia?.('(min-width: 821px)').matches ?? window.innerWidth >= 821;
  const accountStripCanSlide = isDesktop && (
    document.body.classList.contains('student-session-active') ||
    document.body.classList.contains('guest-session-active')
  );

  if (options.preferCollapsedHeader && accountStripCanSlide) {
    return Math.ceil(Math.max(0, rect.top) + getCollapsedTopbarHeight(topbar) + margin);
  }

  return Math.ceil(Math.max(0, rect.bottom) + margin);
}

let outputPreviewScrollTimer = 0;
let outputPreviewScrollRaf = 0;
let outputPreviewAnimationFrame = 0;
let outputPreviewLastTarget = -1;

function getElementDocumentTop(element) {
  const rect = element.getBoundingClientRect();
  return Math.max(0, window.scrollY + rect.top);
}

function getMaxWindowScrollTop() {
  const doc = document.documentElement;
  const body = document.body;
  return Math.max(0, Math.max(
    doc?.scrollHeight || 0,
    body?.scrollHeight || 0
  ) - window.innerHeight);
}

function getOutputPreviewTargetScrollTop(element, options = {}) {
  const safeTop = getViewportSafeTop(options);
  const rawTarget = Math.round(getElementDocumentTop(element) - safeTop);
  return Math.max(0, Math.min(getMaxWindowScrollTop(), rawTarget));
}

function cancelOutputPreviewScroll() {
  window.clearTimeout(outputPreviewScrollTimer);
  if (outputPreviewScrollRaf) window.cancelAnimationFrame(outputPreviewScrollRaf);
  if (outputPreviewAnimationFrame) window.cancelAnimationFrame(outputPreviewAnimationFrame);
  outputPreviewScrollTimer = 0;
  outputPreviewScrollRaf = 0;
  outputPreviewAnimationFrame = 0;
}

function animateWindowScrollTo(targetTop, options = {}) {
  const startTop = Math.round(window.scrollY || document.documentElement.scrollTop || 0);
  const distance = targetTop - startTop;
  const prefersReducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const duration = prefersReducedMotion || options.instant ? 0 : Number(options.duration || 220);

  if (Math.abs(distance) < 3 || duration <= 0) {
    window.scrollTo(0, targetTop);
    return;
  }

  const start = performance.now();
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const step = now => {
    const progress = Math.min(1, (now - start) / duration);
    const nextTop = Math.round(startTop + (distance * easeOutCubic(progress)));
    window.scrollTo(0, nextTop);
    if (progress < 1) {
      outputPreviewAnimationFrame = window.requestAnimationFrame(step);
    } else {
      outputPreviewAnimationFrame = 0;
      window.scrollTo(0, targetTop);
    }
  };
  outputPreviewAnimationFrame = window.requestAnimationFrame(step);
}

function alignElementToViewportTop(element, options = {}) {
  if (!element) return;
  const targetTop = getOutputPreviewTargetScrollTop(element, options);
  const currentTop = Math.round(window.scrollY || document.documentElement.scrollTop || 0);
  if (Math.abs(targetTop - currentTop) < 3) return;
  outputPreviewLastTarget = targetTop;
  animateWindowScrollTo(targetTop, options);
}

function scrollElementIntoSafeView(element, delay = 0, options = {}) {
  if (!element) return;
  cancelOutputPreviewScroll();

  const runScroll = () => {
    outputPreviewScrollRaf = window.requestAnimationFrame(() => {
      outputPreviewScrollRaf = 0;
      alignElementToViewportTop(element, options);
    });
  };

  if (delay > 0) outputPreviewScrollTimer = window.setTimeout(runScroll, delay);
  else runScroll();
}

function scrollToOutput() {
  // Fast premium-feel scroll: one short custom animation, exact top alignment,
  // no repeated correction timers that make phones feel laggy.
  scrollElementIntoSafeView(previewPanel, 0, {
    tight: true,
    preferCollapsedHeader: true,
    outputTopLock: true,
    duration: 220
  });
}

function playBookPageTransition(direction = 'to-preview') {
  window.clearTimeout(bookTransitionTimer);
  document.body.classList.remove(
    'book-page-transitioning',
    'book-to-preview',
    'book-to-editor',
    'book-preview-revealing',
    'book-preview-leaving',
    'book-editor-revealing'
  );

  // Force a reflow so the animation always restarts, even after repeated Run/Back clicks.
  void document.body.offsetWidth;
  document.body.classList.add(
    'book-page-transitioning',
    direction === 'to-editor' ? 'book-to-editor' : 'book-to-preview'
  );

  bookTransitionTimer = window.setTimeout(() => {
    document.body.classList.remove(
      'book-page-transitioning',
      'book-to-preview',
      'book-to-editor',
      'book-preview-revealing',
      'book-preview-leaving',
      'book-editor-revealing'
    );
    fullscreenPageTransitionBusy = false;
  }, FULLSCREEN_PAGE_TRANSITION_MS + 180);
}


function removeFullscreenBookTransitionLayer() {
  const layer = document.getElementById('fullscreenBookTransitionLayer');
  if (layer) layer.remove();
}

function ensureFullscreenBookTransitionLayer(direction = 'to-preview', label = '') {
  if (!editorPanel) return null;
  removeFullscreenBookTransitionLayer();
  const layer = document.createElement('div');
  layer.id = 'fullscreenBookTransitionLayer';
  layer.className = `fullscreen-book-transition-layer ${direction === 'to-editor' ? 'to-editor' : 'to-preview'}`;
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <div class="fullscreen-book-vignette"></div>
    <div class="fullscreen-book-stage">
      <div class="fullscreen-book-fixed-page"></div>
      <div class="fullscreen-book-turn-page">
        <span class="fullscreen-book-spine"></span>
        <span class="fullscreen-book-highlight"></span>
      </div>
      <div class="fullscreen-book-edge"></div>
    </div>
    <div class="fullscreen-book-caption">${escapeHTML(label)}</div>
  `;
  editorPanel.appendChild(layer);
  return layer;
}

function clearFullscreenBookStateClasses() {
  document.body.classList.remove(
    'book-page-transitioning',
    'book-to-preview',
    'book-to-editor',
    'book-preview-revealing',
    'book-preview-leaving',
    'book-editor-revealing'
  );
}

function runSmoothFullscreenBookTransition({ direction = 'to-preview', label = '', onSwap = null, onDone = null } = {}) {
  window.clearTimeout(bookTransitionTimer);
  window.clearTimeout(previewCloseToEditorTimer);
  clearFullscreenBookStateClasses();

  const layer = ensureFullscreenBookTransitionLayer(direction, label);
  if (!layer) {
    if (typeof onSwap === 'function') onSwap();
    if (typeof onDone === 'function') onDone();
    fullscreenPageTransitionBusy = false;
    return;
  }

  // Force layout once so the animation starts cleanly every time.
  void layer.offsetWidth;
  document.body.classList.add('fullscreen-book-transition-active');
  layer.classList.add('is-running');

  const swapDelay = direction === 'to-editor' ? 560 : 540;
  const doneDelay = 1240;

  const swapTimer = window.setTimeout(() => {
    layer.classList.add('has-swapped');
    try {
      if (typeof onSwap === 'function') onSwap();
    } catch (error) {
      console.error('Book transition swap failed', error);
    }
  }, swapDelay);

  bookTransitionTimer = window.setTimeout(() => {
    window.clearTimeout(swapTimer);
    layer.classList.add('is-done');
    window.setTimeout(() => {
      removeFullscreenBookTransitionLayer();
      document.body.classList.remove('fullscreen-book-transition-active');
      clearFullscreenBookStateClasses();
      try {
        if (typeof onDone === 'function') onDone();
      } catch (error) {
        console.error('Book transition completion failed', error);
      }
      fullscreenPageTransitionBusy = false;
    }, 90);
  }, doneDelay);
}

function movePreviewPanelIntoEditorFullscreen() {
  if (!previewPanel || !editorPanel) return false;

  if (!previewMovedIntoEditor) {
    previewOriginalParent = previewPanel.parentElement;
    previewOriginalNextSibling = previewPanel.nextSibling;
    editorPanel.appendChild(previewPanel);
    previewMovedIntoEditor = true;
  }

  document.body.classList.add('preview-inside-editor-fullscreen');
  return true;
}

function restorePreviewPanelFromEditorFullscreen() {
  if (previewMovedIntoEditor && previewOriginalParent) {
    if (previewOriginalNextSibling && previewOriginalNextSibling.parentElement === previewOriginalParent) {
      previewOriginalParent.insertBefore(previewPanel, previewOriginalNextSibling);
    } else {
      previewOriginalParent.appendChild(previewPanel);
    }
  }

  previewMovedIntoEditor = false;
  previewOriginalParent = null;
  previewOriginalNextSibling = null;
  document.body.classList.remove('preview-inside-editor-fullscreen', 'preview-closing-to-editor');
}

function openOutputPreviewAfterFullEditor() {
  if (fullscreenPageTransitionBusy) return;
  fullscreenPageTransitionBusy = true;
  returnToFullEditorAfterPreview = true;
  hideSuggestions();
  closeCodeHelperPanel();

  runSmoothFullscreenBookTransition({
    direction: 'to-preview',
    label: 'Opening Output Preview',
    onSwap: () => {
      movePreviewPanelIntoEditorFullscreen();
      enterFullPreview({ fromFullEditor: true, nativeFullscreen: false, keepEditorFullscreen: true });
      document.body.classList.add('book-preview-revealing');
    },
    onDone: () => {
      document.body.classList.remove('book-preview-revealing');
      ensureBackToEditorPreviewBtn()?.focus({ preventScroll: true });
    }
  });
}

function runCode(showMessage = true, options = {}) {
  const wasFullEditor = document.body.classList.contains('editor-fullscreen-active');
  saveActiveEditor();
  const pageName = normalizeHtmlPageName(options.pageName || getActiveHtmlPageName());
  latestPreviewRuntimeError = '';
  latestPreviewConsoleMessage = '';
  previewRenderToken += 1;
  setPreviewLoading(true, { token: previewRenderToken, pageName });
  previewFrame.srcdoc = buildFullCode(pageName);
  previewFrame.dataset.currentPage = pageName;
  window.setTimeout(renderErrorChecker, 180);

  if (showMessage) {
    setStatus(wasFullEditor ? 'Output full preview' : `Output: ${pageName}`);
    if (options.trackRun !== false) markStudentProjectRun();
  }

  if (options.scroll !== false && showMessage) {
    if (wasFullEditor) {
      openOutputPreviewAfterFullEditor();
      return;
    }
    scrollToOutput();
  }
}

function getPreviewDocument() {
  try {
    return previewFrame.contentDocument || previewFrame.contentWindow.document;
  } catch (error) {
    return null;
  }
}

function getOutputText() {
  const doc = getPreviewDocument();
  return (doc?.body?.innerText || doc?.body?.textContent || '').toLowerCase();
}

function queryPreview(selector) {
  const doc = getPreviewDocument();
  try {
    return doc ? doc.querySelector(selector) : null;
  } catch (error) {
    return null;
  }
}

function navigatePreviewToPage(rawHref) {
  const target = normalizeInternalHtmlReference(rawHref);
  if (!target) return false;
  const pages = getHTMLPages();
  if (!pages[target]) {
    renderErrorChecker();
    setStatus('Missing page');
    appAlert(`${target} does not exist yet. Add this page in Pages, or change the link href.`, { title: 'Missing linked page' });
    return false;
  }
  latestPreviewRuntimeError = '';
  latestPreviewConsoleMessage = '';
  previewRenderToken += 1;
  setPreviewLoading(true, { token: previewRenderToken, pageName: target });
  previewFrame.srcdoc = buildFullCode(target);
  previewFrame.dataset.currentPage = target;
  setStatus(`Preview: ${target}`);
  return true;
}

window.addEventListener('message', event => {
  const data = event.data || {};
  if (!data) return;
  if (data.type === 'mcs-preview-navigate') {
    navigatePreviewToPage(data.href);
    return;
  }
  if (data.type === 'mcs-preview-runtime') {
    handlePreviewRuntimeIssue(data);
  }
});

function getBodyInnerHTML(html) {
  const match = String(html || '').match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
  return match ? match[1] : String(html || '');
}

function stripHTMLTags(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


function getDetailedHTMLTagIssues(html) {
  const source = String(html || '');
  const tags = parseHtmlTags(source);
  const structureReport = getHTMLStructureReport();
  const structureIsComplete = structureReport.passed;
  const protectedStructureTags = new Set(['html', 'head', 'body', 'title']);
  const optionalEndTags = new Set(['li', 'p', 'dt', 'dd', 'option', 'optgroup', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'colgroup']);

  return tags
    .filter(tag => !tag.selfClosing && tag.pairIndex === null)
    .filter(tag => !(structureIsComplete && protectedStructureTags.has(tag.name)))
    .slice(0, 8)
    .map(tag => {
      const optional = optionalEndTags.has(tag.name);
      const reason = tag.unmatchedReason || (tag.closing ? 'missing-opening' : 'missing-closing');
      return {
        name: tag.name,
        line: getLineNumberAt(source, tag.start),
        closing: tag.closing,
        reason,
        severity: optional ? 'warning' : 'warning',
        confidence: optional ? 'low' : 'medium'
      };
    });
}

function hasBalancedCurlyBraces(value) {
  const text = String(value || '').replace(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g, '');
  let count = 0;
  for (const char of text) {
    if (char === '{') count += 1;
    if (char === '}') count -= 1;
    if (count < 0) return false;
  }
  return count === 0;
}

function getJavaScriptSyntaxError(js) {
  const code = String(js || '').trim();
  if (!code) return '';
  try {
    new Function(code);
    return '';
  } catch (error) {
    return error.message || String(error);
  }
}

function getRuntimeErrorMessage() {
  const doc = getPreviewDocument();
  return latestPreviewRuntimeError || doc?.body?.dataset?.runtimeError || '';
}

function createCheckerItem(type, title, detail, fix = '') {
  return { type, title, detail, fix };
}



function getFilenameReferenceCheckerItems() {
  const html = codeStore.html || '';
  const cssFiles = getLanguageFileMap('css');
  const jsFiles = getLanguageFileMap('js');
  const cssNames = Object.keys(cssFiles);
  const jsNames = Object.keys(jsFiles);
  const items = [];
  const cssReferences = getExternalCSSReferences(html);
  const jsReferences = getExternalJSReferences(html);
  const cssMissing = cssReferences
    .map(ref => cleanLanguageFileName(getBaseFileNameFromReference(ref), 'css'))
    .filter(name => name && !Object.prototype.hasOwnProperty.call(cssFiles, name));
  const jsMissing = jsReferences
    .map(ref => cleanLanguageFileName(getBaseFileNameFromReference(ref), 'js'))
    .filter(name => name && !Object.prototype.hasOwnProperty.call(jsFiles, name));
  const cssMatched = cssReferences
    .map(ref => cleanLanguageFileName(getBaseFileNameFromReference(ref), 'css'))
    .filter(name => name && Object.prototype.hasOwnProperty.call(cssFiles, name));
  const jsMatched = jsReferences
    .map(ref => cleanLanguageFileName(getBaseFileNameFromReference(ref), 'js'))
    .filter(name => name && Object.prototype.hasOwnProperty.call(jsFiles, name));

  if (cssReferences.length && cssMissing.length) {
    items.push(createCheckerItem(
      'error',
      'CSS file link mismatch',
      `HTML links to missing CSS file${cssMissing.length === 1 ? '' : 's'}: ${cssMissing.join(', ')}. Existing CSS files: ${cssNames.join(', ') || 'none'}.`,
      'Add that CSS file in Tabs/Pages, rename your CSS file, or change the HTML href.'
    ));
  } else if (cssMatched.length) {
    items.push(createCheckerItem('pass', 'CSS file link matches', `HTML correctly links to ${[...new Set(cssMatched)].join(', ')}.`));
  }

  if (jsReferences.length && jsMissing.length) {
    items.push(createCheckerItem(
      'error',
      'JavaScript file link mismatch',
      `HTML links to missing JavaScript file${jsMissing.length === 1 ? '' : 's'}: ${jsMissing.join(', ')}. Existing JS files: ${jsNames.join(', ') || 'none'}.`,
      'Add that JS file in Tabs/Pages, rename your JS file, or change the HTML src.'
    ));
  } else if (jsMatched.length) {
    items.push(createCheckerItem('pass', 'JavaScript file link matches', `HTML correctly links to ${[...new Set(jsMatched)].join(', ')}.`));
  }

  if (cssReferences.length && cssMatched.some(name => !String(cssFiles[name] || '').trim())) {
    items.push(createCheckerItem('warning', 'Linked CSS file is blank', 'One linked CSS file exists but has no CSS code yet.', 'Open that CSS file in Tabs/Pages and add CSS code.'));
  }

  if (jsReferences.length && jsMatched.some(name => !String(jsFiles[name] || '').trim())) {
    items.push(createCheckerItem('warning', 'Linked JavaScript file is blank', 'One linked JavaScript file exists but has no JavaScript code yet.', 'Open that JS file in Tabs/Pages and add JavaScript code.'));
  }

  return items;
}

function getErrorCheckerItems() {
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const items = [];
  const structureReport = getHTMLStructureReport();
  const bodyInner = getBodyInnerHTML(html);
  const bodyText = stripHTMLTags(bodyInner);
  const tagIssues = getDetailedHTMLTagIssues(html);
  const jsSyntaxError = getJavaScriptSyntaxError(js);
  const runtimeError = getRuntimeErrorMessage();

  if (structureReport.passed) {
    items.push(createCheckerItem('pass', 'Complete HTML structure', 'DOCTYPE, html, head, title, and body are detected.'));
  } else {
    items.push(createCheckerItem(
      'error',
      'Missing HTML structure',
      `Missing: ${structureReport.missing.map(item => item.label).join(', ') || 'required structure'}.`,
      'Use the complete HTML starter structure before adding content.'
    ));
  }

  if (/<title\b[^>]*>\s*<\/title\s*>/i.test(html)) {
    items.push(createCheckerItem('warning', 'Empty title tag', 'Your <title> exists but has no title text.', 'Type a short page title inside <title>.'));
  } else if (/<title\b[^>]*>[\s\S]+?<\/title\s*>/i.test(html)) {
    items.push(createCheckerItem('pass', 'Title tag has content', 'The browser tab title is not empty.'));
  }

  if (bodyText.length >= 3) {
    items.push(createCheckerItem('pass', 'Body has visible content', 'Your webpage has readable text/content inside the body.'));
  } else {
    items.push(createCheckerItem('warning', 'Body looks empty', 'The body section has little or no visible text.', 'Add a heading, paragraph, image, button, or other visible content inside <body>.'));
  }

  if (!tagIssues.length) {
    items.push(createCheckerItem('pass', 'HTML tags look balanced', 'No confirmed missing opening/closing tag was detected.'));
  } else {
    const details = tagIssues.map(issue => {
      return issue.closing
        ? `Possible issue: </${issue.name}> on line ${issue.line} may not have a matching opening tag`
        : `Possible issue: <${issue.name}> on line ${issue.line} may need </${issue.name}>`;
    }).join('; ');
    items.push(createCheckerItem(
      'warning',
      'Possible tag closing issue',
      details,
      'Review the highlighted line, but do not worry if the page output is correct. This checker now treats uncertain tag matches as warnings, not automatic errors.'
    ));
  }

  if (css.trim()) {
    if (hasBalancedCurlyBraces(css)) {
      items.push(createCheckerItem('pass', 'CSS braces look okay', 'Opening and closing curly braces are balanced.'));
    } else {
      items.push(createCheckerItem('error', 'CSS brace problem', 'One or more CSS { } braces are missing or extra.', 'Check each selector and make sure every { has a matching }.'));
    }

    if (!/[a-z-]+\s*:\s*[^;{}]+;?/i.test(css)) {
      items.push(createCheckerItem('warning', 'CSS may be incomplete', 'CSS has text but no clear property/value pair was detected.', 'Example: color: blue; or background: lightyellow;'));
    }
  } else {
    items.push(createCheckerItem('tip', 'CSS is blank', 'This is okay if the activity does not require design.'));
  }

  if (js.trim()) {
    if (jsSyntaxError) {
      items.push(createCheckerItem('error', 'JavaScript syntax error', jsSyntaxError, 'Check missing parentheses, quotes, braces, or semicolons.'));
    } else {
      items.push(createCheckerItem('pass', 'JavaScript syntax looks okay', 'No basic JavaScript syntax error was detected.'));
    }

    if (runtimeError) {
      items.push(createCheckerItem('error', 'JavaScript runtime error', runtimeError, 'Run again after checking element IDs, variable names, and event code.'));
    }
  } else {
    items.push(createCheckerItem('tip', 'JavaScript is blank', 'This is okay if the activity does not require interactivity.'));
  }

  items.push(...getFilenameReferenceCheckerItems());

  const pageNames = getHTMLPageNames();
  if (pageNames.length > 1) {
    items.push(createCheckerItem('pass', 'Multi-page website mode', `${pageNames.length} HTML pages found: ${pageNames.join(', ')}.`));
  }

  const missingPageLinks = getMissingInternalPageReferences();
  if (missingPageLinks.length) {
    const details = missingPageLinks.slice(0, 6).map(item => `${item.from} links to missing ${item.to}`).join('; ');
    items.push(createCheckerItem('error', 'Broken page links', details, 'Add the missing page in Pages or change the href to an existing .html file.'));
  } else if (pageNames.length > 1) {
    items.push(createCheckerItem('pass', 'Page links look valid', 'Internal .html links point to existing pages.'));
  }

  const pageStructureProblems = getPageStructureProblems();
  if (pageStructureProblems.length) {
    const details = pageStructureProblems.slice(0, 5).map(item => `${item.pageName} missing ${item.missing.join(', ')}`).join('; ');
    items.push(createCheckerItem('warning', 'Some pages need complete HTML structure', details, 'Open each page from Pages and complete its HTML structure.'));
  }

  return items;
}


function getAICodeCheckerEndpoint() {
  return String(window.MCS_AI_CHECKER_ENDPOINT || window.MCS_AI_CODE_CHECK_ENDPOINT || '').trim();
}

function isAICodeCheckerEnabled() {
  return window.MCS_AI_CHECKER_ENABLED !== false;
}

function buildAICodeCheckerPayload(items = getErrorCheckerItems()) {
  return {
    app: 'Grade 8 MCSian Web Code Editor',
    task: 'code-error-check',
    checkerItems: items.map(item => ({
      type: item.type,
      title: item.title,
      detail: item.detail,
      fix: item.fix || ''
    })),
    outputText: getOutputText().slice(0, 4000),
    code: {
      html: getShortCodeSample(codeStore.html, 6000),
      css: getShortCodeSample(codeStore.css, 5000),
      js: getShortCodeSample(codeStore.js, 5000)
    },
    instruction: 'Check if the local error checker is correct. Return JSON only with keys: summary, confirmedErrors, falsePositiveWarnings, suggestions. confirmedErrors and falsePositiveWarnings must be arrays of short beginner-friendly strings. Do not provide a full replacement code answer.'
  };
}

function normalizeAICodeCheckResponse(data) {
  const source = data?.check || data?.review || data || {};
  return {
    summary: String(source.summary || source.message || 'Advanced check completed.'),
    confirmedErrors: Array.isArray(source.confirmedErrors) ? source.confirmedErrors : [],
    falsePositiveWarnings: Array.isArray(source.falsePositiveWarnings) ? source.falsePositiveWarnings : [],
    suggestions: Array.isArray(source.suggestions) ? source.suggestions : []
  };
}

function getLocalSmartCheckerReview(items = getErrorCheckerItems()) {
  const errors = items.filter(item => item.type === 'error');
  const warnings = items.filter(item => item.type === 'warning');
  const possibleTagWarnings = warnings.filter(item => /tag/i.test(item.title));

  return {
    summary: errors.length
      ? `${errors.length} confirmed issue${errors.length === 1 ? '' : 's'} found. Possible tag issues are only warnings now.`
      : warnings.length
        ? `No confirmed errors found. ${warnings.length} warning${warnings.length === 1 ? '' : 's'} may still need review.`
        : 'No confirmed errors found. The code looks okay based on the local checker.',
    confirmedErrors: errors.map(item => `${item.title}: ${item.detail}`).slice(0, 5),
    falsePositiveWarnings: possibleTagWarnings.map(item => `${item.title}: ${item.detail}`).slice(0, 4),
    suggestions: warnings
      .filter(item => !/tag/i.test(item.title))
      .map(item => item.fix || item.detail)
      .filter(Boolean)
      .slice(0, 5)
  };
}

function renderAdvancedCheckerReview(review, options = {}) {
  if (!errorCheckerContent) return;
  const safe = normalizeAICodeCheckResponse(review);
  const existing = errorCheckerContent.querySelector('.advanced-checker-card');
  if (existing) existing.remove();

  const card = document.createElement('div');
  card.className = `advanced-checker-card ${options.loading ? 'loading' : ''}`;
  card.innerHTML = options.loading ? `
    <div class="advanced-checker-head">
      <strong>Smart verification is checking...</strong>
      <span>Reviewing code, output, and local checker results.</span>
    </div>
  ` : `
    <div class="advanced-checker-head">
      <strong>${escapeHTML(options.remote ? 'Advanced verification' : 'Smart local verification')}</strong>
      <span>${escapeHTML(safe.summary)}</span>
    </div>
    ${safe.confirmedErrors.length ? `
      <div class="advanced-checker-block error">
        <h4>Confirmed issues</h4>
        <ul>${safe.confirmedErrors.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
    ${safe.falsePositiveWarnings.length ? `
      <div class="advanced-checker-block warning">
        <h4>Possible false alarms / review only</h4>
        <ul>${safe.falsePositiveWarnings.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
    ${safe.suggestions.length ? `
      <div class="advanced-checker-block tip">
        <h4>Suggestions</h4>
        <ul>${safe.suggestions.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
  `;

  errorCheckerContent.prepend(card);
}

async function requestAdvancedErrorCheck() {
  saveActiveEditor();
  runCode(false, { scroll: false });
  const items = getErrorCheckerItems();
  renderErrorChecker();

  if (!isAICodeCheckerEnabled()) {
    renderAdvancedCheckerReview(getLocalSmartCheckerReview(items));
    setStatus('Smart checked');
    return;
  }

  const endpoint = getAICodeCheckerEndpoint();
  if (!endpoint) {
    renderAdvancedCheckerReview(getLocalSmartCheckerReview(items));
    setStatus('Smart checked');
    return;
  }

  renderAdvancedCheckerReview(getLocalSmartCheckerReview(items), { loading: true, remote: true });
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAICodeCheckerPayload(items))
    });
    if (!response.ok) throw new Error(`Checker endpoint returned ${response.status}`);
    const data = await response.json();
    renderAdvancedCheckerReview(normalizeAICodeCheckResponse(data), { remote: true });
    setStatus('Advanced checked');
  } catch (error) {
    console.warn('Advanced checker failed; using smart local review.', error);
    const fallback = getLocalSmartCheckerReview(items);
    fallback.summary = `${fallback.summary} Advanced verification was unavailable, so the smart local checker was used.`;
    renderAdvancedCheckerReview(fallback);
    setStatus('Smart checked');
  }
}

function renderErrorChecker() {
  if (!errorCheckerContent) return;
  const items = getErrorCheckerItems();
  const errorCount = items.filter(item => item.type === 'error').length;
  const warningCount = items.filter(item => item.type === 'warning').length;
  const passCount = items.filter(item => item.type === 'pass').length;

  const summaryClass = errorCount ? 'error' : warningCount ? 'warning' : 'pass';
  const summaryText = errorCount
    ? `${errorCount} error${errorCount > 1 ? 's' : ''} found`
    : warningCount
      ? `${warningCount} warning${warningCount > 1 ? 's' : ''} found`
      : 'No major errors found';

  errorCheckerContent.innerHTML = `
    <div class="checker-summary ${summaryClass}">
      <div>
        <strong>${escapeHTML(summaryText)}</strong>
        <span>${passCount} passed checks · ${warningCount} warning${warningCount === 1 ? '' : 's'} · ${errorCount} error${errorCount === 1 ? '' : 's'}</span>
      </div>
    </div>
    <div class="checker-list">
      ${items.map(item => `
        <article class="checker-item ${escapeAttribute(item.type)}">
          <span class="checker-icon">${item.type === 'pass' ? '✓' : item.type === 'error' ? '!' : item.type === 'warning' ? '⚠' : 'i'}</span>
          <div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.detail)}</p>
            ${item.fix ? `<small>Fix: ${escapeHTML(item.fix)}</small>` : ''}
          </div>
        </article>
      `).join('')}
    </div>
  `;
}



function openCodeHelperPanel() {
  if (!errorCheckerPanel) return;
  if (!isStudentAssistanceFeatureEnabled('codeHelper')) {
    setStatus('Code Helper is disabled by the teacher');
    return;
  }
  saveActiveEditor();
  renderErrorChecker();
  errorCheckerPanel.classList.remove('hidden');
  errorCheckerPanel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('code-helper-open');
  setStatus('Code Helper opened');
  window.setTimeout(() => refreshErrorCheckerBtn?.focus({ preventScroll: true }), 0);
}

function closeCodeHelperPanel() {
  if (!errorCheckerPanel) return;
  errorCheckerPanel.classList.add('hidden');
  errorCheckerPanel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('code-helper-open');
  codeHelperFloatingBtn?.focus({ preventScroll: true });
}

function toggleCodeHelperPanel() {
  if (!errorCheckerPanel) return;
  if (!isStudentAssistanceFeatureEnabled('codeHelper')) {
    setStatus('Code Helper is disabled by the teacher');
    return;
  }
  if (errorCheckerPanel.classList.contains('hidden')) {
    openCodeHelperPanel();
  } else {
    closeCodeHelperPanel();
  }
}


let deferredInstallPrompt = null;

function isAppInstalledMode() {
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;
}

function updateInstallButtonVisibility() {
  if (!installAppBtn) return;
  const shouldShow = !isAppInstalledMode();
  installAppBtn.classList.toggle('hidden', !shouldShow);
}

function registerPWAServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(error => {
      console.warn('Service worker registration failed', error);
    });
  });
}

async function handleInstallAppClick() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch (error) {
      console.warn('Install prompt closed', error);
    }
    deferredInstallPrompt = null;
    updateInstallButtonVisibility();
    return;
  }

  const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
  const message = isiOS
    ? 'To install on iPhone/iPad: tap Share, then choose Add to Home Screen.'
    : 'To install on Android/Chrome: open the browser menu, then choose Install app or Add to Home screen.';
  appAlert(message, { title: 'Install on phone' });
}

function setupPWAInstallPrompt() {
  updateInstallButtonVisibility();

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButtonVisibility();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updateInstallButtonVisibility();
    setStatus('Installed');
  });

  installAppBtn?.addEventListener('click', handleInstallAppClick);
}

function countSemanticHTMLTags(html) {
  const matches = String(html || '').match(/<(header|nav|main|section|article|aside|footer)\b/gi) || [];
  return new Set(matches.map(item => item.replace(/[<\s]/g, '').toLowerCase())).size;
}

function hasSemanticHTMLTags(html) {
  return countSemanticHTMLTags(html) >= 2;
}

function getSemanticTagProgress(html) {
  return Math.min(1, countSemanticHTMLTags(html) / 2);
}

function checkCriterion(criterion) {
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const htmlLower = html.toLowerCase();
  const cssLower = css.toLowerCase();
  const jsLower = js.toLowerCase();
  const outputLower = getOutputText();
  const target = (criterion.target || '').trim().toLowerCase();
  const combinedLength = [html, css, js].join('').replace(/\s/g, '').length;
  const previewDoc = getPreviewDocument();
  const hasRuntimeError = Boolean(previewDoc?.body?.dataset?.runtimeError);

  switch (criterion.rule) {
    case 'smart_rubric':
      return getSmartCriterionProgress(criterion) >= 0.65;
    case 'html_contains':
      return target ? htmlLower.includes(target) : false;
    case 'css_contains':
      return target ? cssLower.includes(target) : false;
    case 'js_contains':
      return target ? jsLower.includes(target) : false;
    case 'output_contains':
      return target ? outputLower.includes(target) : false;
    case 'full_html_structure':
      return isCompleteHTMLStructure();
    case 'has_semantic_tags':
      return hasSemanticHTMLTags(html);
    case 'balanced_html_tags':
      return hasBalancedHTMLTags(html);
    case 'output_has_visible_text':
      return outputLower.trim().length >= 3;
    case 'has_heading':
      return /<h[1-6](\s|>|\/)/i.test(html) || Boolean(queryPreview('h1, h2, h3, h4, h5, h6'));
    case 'has_paragraph':
      return /<p(\s|>|\/)/i.test(html) || Boolean(queryPreview('p'));
    case 'has_button':
      return /<button(\s|>|\/)/i.test(html) || Boolean(queryPreview('button'));
    case 'has_link':
      return /<a(\s|>|\/)/i.test(html) || Boolean(queryPreview('a'));
    case 'has_button_or_link':
      return /<(button|a)(\s|>|\/)/i.test(html) || Boolean(queryPreview('button, a'));
    case 'has_image':
      return /<img(\s|>|\/)/i.test(html) || Boolean(queryPreview('img'));
    case 'has_list':
      return /<(ul|ol)(\s|>|\/)/i.test(html) || Boolean(queryPreview('ul, ol'));
    case 'uses_css_property': {
      if (target) return cssLower.includes(target);
      const usefulProperties = /(color|background|background-color|padding|margin|border|border-radius|font-size|font-family|font-weight|line-height|display|box-shadow|text-align|width|max-width|min-height|height|gap|grid-template-columns|justify-content|align-items|position|transition|transform|opacity|object-fit|overflow)\s*:/i;
      return usefulProperties.test(css);
    }
    case 'uses_event_listener':
      return /addEventListener\s*\(/i.test(js) || /onclick\s*=/i.test(html);
    case 'js_changes_page':
      return /(textContent|innerHTML|innerText|classList|style\.|setAttribute|appendChild|createElement)/i.test(js);
    case 'no_runtime_error':
      return !hasRuntimeError;
    case 'minimum_effort':
      return combinedLength >= 120;
    default:
      return false;
  }
}

function getHTMLStructureProgress() {
  const report = getHTMLStructureReport();
  return report.checks.length ? report.checks.filter(item => item.passed).length / report.checks.length : 0;
}

function getBalancedTagProgress(html) {
  if (hasBalancedHTMLTags(html)) return 1;
  const tags = (html.match(/<\/?\s*([a-zA-Z][a-zA-Z0-9-]*|!DOCTYPE)\b[^>]*>/g) || []).length;
  if (tags <= 2) return 0.15;

  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);
  const openTags = {};
  const closeTags = {};
  const tagRegex = /<\/?\s*([a-zA-Z][a-zA-Z0-9-]*|!DOCTYPE)\b[^>]*>/g;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    if (voidTags.has(tagName) || fullTag.endsWith('/>') || fullTag.startsWith('<!--')) continue;
    if (/^<\//.test(fullTag)) {
      closeTags[tagName] = (closeTags[tagName] || 0) + 1;
    } else {
      openTags[tagName] = (openTags[tagName] || 0) + 1;
    }
  }

  const names = new Set([...Object.keys(openTags), ...Object.keys(closeTags)]);
  if (!names.size) return 0;
  let matched = 0;
  let total = 0;
  names.forEach(name => {
    matched += Math.min(openTags[name] || 0, closeTags[name] || 0);
    total += Math.max(openTags[name] || 0, closeTags[name] || 0);
  });
  return total ? Math.max(0.1, matched / total) : 0;
}


function clamp01(value) {
  if (!Number.isFinite(Number(value))) return 0;
  return Math.max(0, Math.min(1, Number(value)));
}

function averageProgress(values) {
  const clean = values.filter(value => Number.isFinite(Number(value)));
  if (!clean.length) return 0;
  return clamp01(clean.reduce((sum, value) => sum + Number(value), 0) / clean.length);
}

function weightedProgress(items) {
  const clean = items.filter(item => Number.isFinite(Number(item.value)) && Number(item.weight) > 0);
  const totalWeight = clean.reduce((sum, item) => sum + Number(item.weight), 0);
  if (!totalWeight) return 0;
  return clamp01(clean.reduce((sum, item) => sum + Number(item.value) * Number(item.weight), 0) / totalWeight);
}

function getCriterionRubricText(criterion) {
  const normalized = normalizeCriterion(criterion);
  const descriptions = rubricLevels
    .map(level => normalized.levels?.[level.key]?.description || '')
    .join(' ');
  return `${normalized.title || ''} ${descriptions || ''}`.trim();
}

function includesAnyText(text, patterns) {
  return patterns.some(pattern => typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text));
}

function countMatches(text, pattern) {
  return (String(text || '').match(pattern) || []).length;
}

function getCodeBasicsProgress() {
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const combinedLength = [html, css, js].join('').replace(/\s/g, '').length;
  const previewDoc = getPreviewDocument();
  const hasRuntimeError = Boolean(previewDoc?.body?.dataset?.runtimeError);
  const bodyTextLength = getOutputText().trim().length;

  return {
    htmlStructure: getHTMLStructureProgress(),
    balancedTags: getBalancedTagProgress(html),
    semanticTags: getSemanticTagProgress(html),
    visibleText: bodyTextLength >= 80 ? 1 : bodyTextLength >= 40 ? 0.85 : bodyTextLength >= 15 ? 0.6 : bodyTextLength >= 3 ? 0.35 : 0,
    effort: Math.min(1, combinedLength / 180),
    noRuntimeError: hasRuntimeError ? 0 : 1
  };
}

function getHTMLContentSmartProgress(text) {
  const html = codeStore.html || '';
  const outputText = getOutputText();
  const elementChecks = [];

  if (includesAnyText(text, [/heading|title heading|\bh[1-6]\b/])) elementChecks.push(/<h[1-6](\s|>|\/)/i.test(html) || Boolean(queryPreview('h1, h2, h3, h4, h5, h6')) ? 1 : 0);
  if (includesAnyText(text, [/paragraph|\bp\s*tag|\bp\b/])) elementChecks.push(/<p(\s|>|\/)/i.test(html) || Boolean(queryPreview('p')) ? 1 : 0);
  if (includesAnyText(text, [/image|picture|photo|\bimg\b/])) elementChecks.push(/<img(\s|>|\/)/i.test(html) || Boolean(queryPreview('img')) ? 1 : 0);
  if (includesAnyText(text, [/link|anchor|hyperlink|\ba\s*tag/])) elementChecks.push(/<a(\s|>|\/)/i.test(html) || Boolean(queryPreview('a')) ? 1 : 0);
  if (includesAnyText(text, [/button|clickable/])) elementChecks.push(/<button(\s|>|\/)/i.test(html) || Boolean(queryPreview('button')) ? 1 : 0);
  if (includesAnyText(text, [/list|bullet|numbered|\bul\b|\bol\b|\bli\b/])) elementChecks.push(/<(ul|ol)(\s|>|\/)/i.test(html) || Boolean(queryPreview('ul, ol')) ? 1 : 0);

  if (!elementChecks.length) {
    elementChecks.push(outputText.trim().length >= 15 ? 1 : outputText.trim().length >= 3 ? 0.5 : 0);
  }

  return averageProgress(elementChecks);
}

function getCSSSmartProgress(text) {
  const css = codeStore.css || '';
  const cssTrimmed = css.trim();
  if (!cssTrimmed) return 0;

  const propertyCount = countMatches(css, /[a-z-]+\s*:/gi);
  const visualCount = countMatches(css, /\b(color|background|font-size|font-family|font-weight|text-align|border|border-radius|box-shadow)\s*:/gi);
  const spacingCount = countMatches(css, /\b(padding|margin|gap|line-height)\s*:/gi);
  const layoutCount = countMatches(css, /\b(display|grid-template-columns|justify-content|align-items|flex|width|max-width|height)\s*:/gi);

  const hasSelector = /[.#]?[a-zA-Z][\w-]*\s*\{[^}]+\}/.test(css);
  const hasRequiredProperty = (() => {
    const propertyMatch = text.match(/\b(background-color|border-radius|font-family|font-size|text-align|box-shadow|grid-template-columns|justify-content|align-items|background|padding|margin|border|display|color|width|height|gap)\b/);
    return propertyMatch ? new RegExp(`\\b${propertyMatch[1]}\\s*:`, 'i').test(css) : 1;
  })();

  return weightedProgress([
    { value: hasSelector ? 1 : 0.4, weight: 1 },
    { value: Math.min(1, propertyCount / 6), weight: 2 },
    { value: Math.min(1, visualCount / 3), weight: 1.5 },
    { value: Math.min(1, spacingCount / 2), weight: 1 },
    { value: Math.min(1, layoutCount / 2), weight: includesAnyText(text, [/layout|organized|presentation|design/]) ? 1.2 : 0.5 },
    { value: hasRequiredProperty ? 1 : 0, weight: 1 }
  ]);
}

function getDesignPresentationSmartProgress(text) {
  const basics = getCodeBasicsProgress();
  return weightedProgress([
    { value: getCSSSmartProgress(text), weight: 3 },
    { value: basics.visibleText, weight: 1.5 },
    { value: getHTMLContentSmartProgress(text), weight: 1 },
    { value: basics.balancedTags, weight: 0.7 }
  ]);
}

function getJavaScriptSmartProgress(text) {
  const js = codeStore.js || '';
  const html = codeStore.html || '';
  if (!js.trim() && !/onclick\s*=/i.test(html)) return 0;

  const hasEvent = /addEventListener\s*\(/i.test(js) || /onclick\s*=/i.test(html);
  const changesPage = /(textContent|innerHTML|innerText|classList|style\.|setAttribute|appendChild|createElement)/i.test(js);
  const hasFunction = /function\s+|=>/.test(js);
  const noError = getCodeBasicsProgress().noRuntimeError;

  if (includesAnyText(text, [/event listener|onclick|interaction|interactive|click event|button action/])) {
    return weightedProgress([
      { value: hasEvent ? 1 : 0, weight: 2 },
      { value: changesPage ? 1 : 0.5, weight: 1 },
      { value: noError, weight: 1 }
    ]);
  }

  return weightedProgress([
    { value: hasFunction ? 1 : 0.5, weight: 1 },
    { value: hasEvent ? 1 : 0, weight: 1 },
    { value: changesPage ? 1 : 0, weight: 1 },
    { value: noError, weight: 1 }
  ]);
}

function getInstructionSmartProgress(text) {
  const basics = getCodeBasicsProgress();
  const wantsCss = includesAnyText(text, [/css|style|design|presentation|layout|visual|aesthetic|readability/]);
  const wantsJs = includesAnyText(text, [/javascript|script|event|interactive|button action|onclick/]);
  const wantsSemantic = includesAnyText(text, [/semantic|header|nav|main|section|article|aside|footer/]);

  const items = [
    { value: basics.htmlStructure, weight: 2 },
    { value: basics.balancedTags, weight: 1.5 },
    { value: basics.visibleText, weight: 1.5 },
    { value: basics.effort, weight: 1 },
    { value: basics.noRuntimeError, weight: 1 }
  ];

  if (wantsCss) items.push({ value: getCSSSmartProgress(text), weight: 1.5 });
  if (wantsJs) items.push({ value: getJavaScriptSmartProgress(text), weight: 1.5 });
  if (wantsSemantic) items.push({ value: basics.semanticTags, weight: 1.5 });

  return weightedProgress(items);
}

function getSmartCriterionProgress(criterion) {
  const rubricText = getCriterionRubricText(criterion);
  const text = rubricText.toLowerCase();
  if (!text.trim()) return null;

  const basics = getCodeBasicsProgress();
  const wantsFollowing = includesAnyText(text, [/following instructions|requirements?|completed accurately|met expectations|instructions not followed|exceeded expectations/]);
  const wantsSemantic = includesAnyText(text, [/semantic\s+tags?|semantic\s+html|\bheader\b|\bfooter\b|\bnav\b|\bmain\b|\bsection\b|\barticle\b|\baside\b/]);
  const wantsCompleteStructure = includesAnyText(text, [/(complete|full|proper|correct|basic).*html.*structure/, /doctype|<html|<head|<title|<body/, /well[-\s]?organized structure|correct structure/]);
  const wantsBalanced = includesAnyText(text, [/closing tag|closed tag|properly closed|balanced? tag|incomplete or inconsistent|missing many tags|disorganized/]);
  const wantsCSS = includesAnyText(text, [/css|style|styling|technical application|visual appeal|design|presentation|layout|aesthetic|consistent design|readability|creative|polish|color|background|font|spacing|border|broken layout/]);
  const wantsJS = includesAnyText(text, [/javascript|script|event listener|onclick|interaction|interactive|click event|button action|function|dom|textcontent|innerhtml|classlist/]);
  const wantsOutput = includesAnyText(text, [/visible text|readable content|content shown|output text|informative page|difficult to read|easy to read|webpage|page/]);

  // Specific requirements first.
  if (wantsSemantic && wantsCompleteStructure) {
    return weightedProgress([
      { value: basics.htmlStructure, weight: 2 },
      { value: basics.semanticTags, weight: 2 },
      { value: basics.balancedTags, weight: 1 },
      { value: basics.visibleText, weight: 0.7 }
    ]);
  }

  if (wantsSemantic) {
    return weightedProgress([
      { value: basics.semanticTags, weight: 2 },
      { value: basics.htmlStructure, weight: 1 },
      { value: basics.balancedTags, weight: 1 }
    ]);
  }

  if (wantsCompleteStructure) {
    return weightedProgress([
      { value: basics.htmlStructure, weight: 3 },
      { value: basics.balancedTags, weight: 1 },
      { value: basics.visibleText, weight: 0.5 }
    ]);
  }

  if (wantsBalanced) {
    return weightedProgress([
      { value: basics.balancedTags, weight: 2 },
      { value: basics.htmlStructure, weight: 1 },
      { value: basics.visibleText, weight: 0.5 }
    ]);
  }

  if (wantsJS) return getJavaScriptSmartProgress(text);

  if (wantsCSS && includesAnyText(text, [/design|presentation|visual|aesthetic|creative|readability|layout|polish|sloppy|unfinished/])) {
    return getDesignPresentationSmartProgress(text);
  }

  if (wantsCSS) return getCSSSmartProgress(text);

  if (wantsFollowing) return getInstructionSmartProgress(text);

  if (wantsOutput) {
    return weightedProgress([
      { value: basics.visibleText, weight: 2 },
      { value: getHTMLContentSmartProgress(text), weight: 1 },
      { value: basics.balancedTags, weight: 0.5 }
    ]);
  }

  // For broad/unrecognized rubric rows, judge the overall output instead of relying on a random dropdown.
  if (criterion.rule === 'smart_rubric') return getInstructionSmartProgress(text);

  return null;
}

function getCriterionProgress(criterion) {
  const smartProgress = getSmartCriterionProgress(criterion);
  if (smartProgress !== null) return clamp01(smartProgress);

  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const htmlLower = html.toLowerCase();
  const cssLower = css.toLowerCase();
  const jsLower = js.toLowerCase();
  const outputLower = getOutputText();
  const target = (criterion.target || '').trim().toLowerCase();
  const combinedLength = [html, css, js].join('').replace(/\s/g, '').length;

  if (checkCriterion(criterion)) return 1;

  switch (criterion.rule) {
    case 'full_html_structure':
      return getHTMLStructureProgress();
    case 'has_semantic_tags':
      return getSemanticTagProgress(html);
    case 'balanced_html_tags':
      return getBalancedTagProgress(html);
    case 'output_has_visible_text': {
      const length = outputLower.trim().length;
      if (length >= 20) return 1;
      if (length >= 10) return 0.75;
      if (length >= 3) return 0.5;
      return 0;
    }
    case 'minimum_effort':
      return Math.min(1, combinedLength / 120);
    case 'uses_css_property': {
      if (!css.trim()) return 0;
      const properties = (css.match(/[a-z-]+\s*:/gi) || []).length;
      return Math.min(0.85, properties / 4);
    }
    case 'uses_event_listener':
      return js.trim() || /<button(\s|>|\/)/i.test(html) ? 0.5 : 0;
    case 'js_changes_page':
      return js.trim() ? 0.5 : 0;
    case 'html_contains':
      return target && htmlLower.includes(target.split(/\s+/)[0] || target) ? 0.5 : 0;
    case 'css_contains':
      return target && cssLower.includes(target.split(/\s+/)[0] || target) ? 0.5 : 0;
    case 'js_contains':
      return target && jsLower.includes(target.split(/\s+/)[0] || target) ? 0.5 : 0;
    case 'output_contains':
      return target && outputLower.includes(target.split(/\s+/)[0] || target) ? 0.5 : 0;
    case 'no_runtime_error':
      return 0;
    default:
      return 0;
  }
}

function progressToLevelKey(progress) {
  if (progress >= 0.9) return 'excellent';
  if (progress >= 0.65) return 'good';
  if (progress >= 0.35) return 'fair';
  return 'needsImprovement';
}

function gradeCriterion(criterion) {
  const normalizedCriterion = normalizeCriterion(criterion);
  const progress = getCriterionProgress(normalizedCriterion);
  const levelKey = progressToLevelKey(progress);
  const level = getCriterionLevel(normalizedCriterion, levelKey);
  const possible = getCriterionPossiblePoints(normalizedCriterion);

  return {
    ...normalizedCriterion,
    progress,
    levelKey,
    levelLabel: level.label || rubricLevels.find(item => item.key === levelKey)?.label || levelKey,
    levelDescription: level.description || '',
    passed: levelKey === 'excellent' || levelKey === 'good',
    earned: Math.max(0, Number(level.points) || 0),
    points: possible
  };
}

function gradeActivity() {
  if (!activity) return null;
  saveActiveEditor();
  const results = activity.criteria.map(gradeCriterion);

  const score = results.reduce((sum, item) => sum + item.earned, 0);
  const possible = results.reduce((sum, item) => sum + item.points, 0);
  const percent = possible > 0 ? Math.round((score / possible) * 100) : 0;

  return {
    score,
    possible,
    percent,
    passed: percent >= activity.passingScore,
    results,
    feedback: generateFeedback(score, possible, percent, results)
  };
}

function formatPoints(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, '');
}

function generateFeedback(score, possible, percent, results) {
  const missing = results.filter(item => item.levelKey === 'needsImprovement' || item.levelKey === 'fair').map(item => `${item.title} (${item.levelLabel})`);
  const achieved = results.filter(item => item.levelKey === 'excellent' || item.levelKey === 'good').map(item => `${item.title} (${item.levelLabel})`);

  let opening = '';
  if (percent >= 90) {
    opening = 'Excellent work! Your webpage meets almost all rubric requirements and shows strong beginner coding skills.';
  } else if (percent >= 75) {
    opening = 'Good job! Your output is on the right track. A few improvements can make it stronger.';
  } else if (percent >= 60) {
    opening = 'You are getting there. Review the missing criteria and improve your code before submitting.';
  } else {
    opening = 'Keep practicing. Start by completing the full HTML structure, then add clear visible content inside the body.';
  }

  const strengths = achieved.length
    ? `You successfully completed: ${achieved.slice(0, 3).join(', ')}${achieved.length > 3 ? ', and more' : ''}.`
    : 'No rubric item was completed yet, so begin with the activity instructions.';

  const nextSteps = missing.length
    ? `Next, improve: ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ', and other missing items' : ''}.`
    : 'No missing requirement was detected. You may polish the design, spacing, colors, and readability.';

  return `${opening} ${strengths} ${nextSteps} Score: ${formatPoints(score)}/${formatPoints(possible)}.`;
}


function getAIReviewEndpoint() {
  return String(window.MCS_AI_FEEDBACK_ENDPOINT || '').trim();
}

function isAIReviewEnabled() {
  return window.MCS_AI_FEEDBACK_ENABLED !== false;
}

function getAIReviewTimeoutMs() {
  const value = Number(window.MCS_AI_FEEDBACK_TIMEOUT_MS);
  return Number.isFinite(value) && value > 3000 ? value : 25000;
}

function getShortCodeSample(value, maxLength = 6000) {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n/* ...code shortened for rubric review... */` : text;
}

function buildAIReviewPayload(result) {
  const currentResult = result || lastRubricResult || gradeActivity();
  const checkerItems = getErrorCheckerItems().map(item => ({
    type: item.type,
    title: item.title,
    detail: item.detail,
    fix: item.fix || ''
  }));

  return {
    app: 'Grade 8 MCSian Web Code Editor',
    activity: activity ? {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      passingScore: activity.passingScore,
      criteria: activity.criteria.map(item => ({
        title: item.title,
        points: getCriterionPossiblePoints(item),
        rule: item.rule,
        target: item.target || '',
        levels: item.levels || {}
      }))
    } : null,
    rubricResult: currentResult ? {
      score: currentResult.score,
      possible: currentResult.possible,
      percent: currentResult.percent,
      passed: currentResult.passed,
      feedback: currentResult.feedback,
      criteria: currentResult.results.map(item => ({
        title: item.title,
        levelKey: item.levelKey,
        levelLabel: item.levelLabel,
        earned: item.earned,
        points: item.points,
        rule: item.rule,
        target: item.target || '',
        progress: item.progress
      }))
    } : null,
    checkerItems,
    outputText: getOutputText().slice(0, 4000),
    code: {
      html: getShortCodeSample(codeStore.html),
      css: getShortCodeSample(codeStore.css),
      js: getShortCodeSample(codeStore.js)
    },
    instruction: 'Act as a Grade 8 ICT teacher. Use the teacher rubric as the main basis for scoring. Interpret the rubric level descriptions, inspect the code and output, then provide fair beginner-friendly scoring feedback. Do not mention AI. Do not give a complete replacement answer or full code. Return strengths, improvements, next steps, and an adjusted score only when the rubric result clearly mismatches the submitted work.'
  };
}

function getCheckerProblemsForAI() {
  return getErrorCheckerItems().filter(item => item.type === 'error' || item.type === 'warning');
}

function generateLocalAIReview(result) {
  const safeResult = result || lastRubricResult || gradeActivity();
  const problems = getCheckerProblemsForAI();
  const missingCriteria = safeResult?.results?.filter(item => item.levelKey === 'needsImprovement' || item.levelKey === 'fair') || [];
  const strongCriteria = safeResult?.results?.filter(item => item.levelKey === 'excellent' || item.levelKey === 'good') || [];
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const suggestions = [];

  if (!isCompleteHTMLStructure()) suggestions.push('Complete the full HTML structure first: doctype, html, head, title, and body.');
  if (!/<body[\s\S]*?>[\s\S]*?<\/body>/i.test(html)) suggestions.push('Put visible content inside the body section.');
  if (css.trim() && !/(color|background|padding|margin|font-size|display|border|border-radius)\s*:/i.test(css)) suggestions.push('Use simple CSS properties such as color, background, padding, margin, or font-size to improve design.');
  if (js.trim() && !/(addEventListener|onclick|textContent|innerHTML|classList|style\.)/i.test(js)) suggestions.push('For JavaScript activities, make sure your script changes something visible on the page.');

  problems.slice(0, 3).forEach(item => suggestions.push(`${item.title}: ${item.fix || item.detail}`));
  missingCriteria.slice(0, 3).forEach(item => suggestions.push(`Improve rubric item: ${item.title}. Current level: ${item.levelLabel}.`));

  const strengths = strongCriteria.length
    ? strongCriteria.slice(0, 3).map(item => item.title)
    : ['You started the page and can improve it step by step.'];

  const scoreLine = safeResult
    ? `${formatPoints(safeResult.score)}/${formatPoints(safeResult.possible)} (${safeResult.percent}%)`
    : 'No rubric result yet';

  return {
    mode: 'Rubric Review',
    officialScore: scoreLine,
    suggestedScore: safeResult ? safeResult.score : null,
    summary: safeResult
      ? safeResult.percent >= 90
        ? 'Strong work. The project meets most requirements and is ready for polishing.'
        : safeResult.percent >= 75
          ? 'Good work. The page is working, but a few details can still be improved.'
          : safeResult.percent >= 60
            ? 'Almost there. Focus on the missing rubric items and the error checker hints.'
            : 'Needs more improvement. Start with the basic HTML structure and visible page content.'
      : 'Click Result first so the app can compare your work with the selected rubric.',
    strengths,
    improvements: suggestions.length ? suggestions.slice(0, 6) : ['No major issue was detected. Improve design, spacing, readability, and creativity.'],
    nextSteps: [
      'Run the code again after every fix.',
      'Check the Error Checker before clicking Result.',
      'Make small improvements instead of changing everything at once.'
    ],
    teacherNote: ''
  };
}

function normalizeAIReviewResponse(data, fallbackResult) {
  if (!data) return generateLocalAIReview(fallbackResult);
  if (typeof data === 'string') {
    return {
      mode: 'Rubric Review',
      officialScore: fallbackResult ? `${formatPoints(fallbackResult.score)}/${formatPoints(fallbackResult.possible)} (${fallbackResult.percent}%)` : 'No rubric result yet',
      summary: data,
      strengths: [],
      improvements: [],
      nextSteps: [],
      teacherNote: ''
    };
  }

  return {
    mode: data.mode || data.source || 'Rubric Review',
    officialScore: data.officialScore || (fallbackResult ? `${formatPoints(fallbackResult.score)}/${formatPoints(fallbackResult.possible)} (${fallbackResult.percent}%)` : 'No rubric result yet'),
    suggestedScore: data.suggestedScore ?? data.score ?? null,
    summary: data.summary || data.feedback || data.message || 'Review completed.',
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    improvements: Array.isArray(data.improvements) ? data.improvements : Array.isArray(data.nextFixes) ? data.nextFixes : [],
    nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
    teacherNote: data.teacherNote || data.note || ''
  };
}

function renderAIReview(review, options = {}) {
  if (!aiReviewContent) return;
  const safeReview = normalizeAIReviewResponse(review, lastRubricResult);
  const isLoading = options.loading === true;

  aiReviewContent.classList.remove('empty-ai-review');
  aiReviewContent.innerHTML = isLoading ? `
    <div class="ai-loading-box">
      <div class="ai-spinner" aria-hidden="true"></div>
      <div>
        <h3>Reviewing your work...</h3>
        <p>Please wait. The app is checking the rubric, code, output, and error checker hints.</p>
      </div>
    </div>
  ` : `
    <div class="ai-review-card">
      <div class="ai-review-main">
        <div>
          <p class="section-kicker">${escapeHTML(safeReview.mode || 'Rubric Review')}</p>
          <h3>${escapeHTML(safeReview.summary || 'Review completed.')}</h3>
          <p class="muted-text">Rubric score: <strong>${escapeHTML(safeReview.officialScore || 'Not available')}</strong>${safeReview.suggestedScore !== null && safeReview.suggestedScore !== undefined ? ` · Suggested score: <strong>${escapeHTML(formatPoints(safeReview.suggestedScore))}</strong>` : ''}</p>
        </div>
        <span class="ai-badge">Rubric</span>
      </div>

      <div class="ai-review-grid">
        <div class="ai-review-block good">
          <h4>Strengths</h4>
          <ul>${(safeReview.strengths?.length ? safeReview.strengths : ['Your work has been checked against the activity rubric.']).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
        </div>
        <div class="ai-review-block improve">
          <h4>Improve Next</h4>
          <ul>${(safeReview.improvements?.length ? safeReview.improvements : ['Polish spacing, readability, color, and content clarity.']).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
        </div>
        <div class="ai-review-block steps">
          <h4>Next Steps</h4>
          <ul>${(safeReview.nextSteps?.length ? safeReview.nextSteps : ['Fix one issue, run again, then check the result.']).map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
        </div>
      </div>

      ${safeReview.teacherNote ? `<div class="ai-note"><strong>Note:</strong> ${escapeHTML(safeReview.teacherNote)}</div>` : ''}
    </div>
  `;
}

function resetAIReviewPanel() {
  if (!aiReviewContent) return;
  aiReviewContent.classList.add('empty-ai-review');
  aiReviewContent.innerHTML = `
    <div class="ai-empty-icon">✨</div>
    <h3>No detailed feedback yet</h3>
    <p>Click <strong>Result</strong> first, then use <strong>Review Feedback</strong> for clearer rubric notes.</p>
    <p class="ai-small-note">This feedback follows the teacher rubric and checker results.</p>
  `;
}

async function requestAIReview(options = {}) {
  if (!isStudentAssistanceFeatureEnabled('teacherFeedback')) {
    await appAlert('Detailed rubric feedback is currently disabled by the teacher.', { title: 'Feedback disabled' });
    return;
  }

  if (!isAIReviewEnabled()) {
    await appAlert('Detailed feedback is disabled in firebase-config.js.', { title: 'Feedback unavailable' });
    return;
  }

  if (!activity) {
    showActivityRequiredWarning();
    renderNoActivityResult();
    setStatus('Choose activity first');
    return;
  }

  runCode(false, { scroll: false });
  const result = lastRubricResult || gradeActivity();
  lastRubricResult = result;
  if (!result) return;

  const endpoint = getAIReviewEndpoint();
  renderAIReview(generateLocalAIReview(result), { loading: Boolean(endpoint) });
  setStatus(endpoint ? 'Review running...' : 'Feedback ready');

  if (!endpoint) {
    renderAIReview(generateLocalAIReview(result));
    if (options.scroll !== false) scrollElementIntoSafeView(document.getElementById('aiReviewPanel'));
    return;
  }

  try {
    if (aiReviewController) aiReviewController.abort();
    aiReviewController = new AbortController();
    const timeout = window.setTimeout(() => aiReviewController.abort(), getAIReviewTimeoutMs());

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAIReviewPayload(result)),
      signal: aiReviewController.signal
    });
    window.clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Feedback endpoint returned ${response.status}`);
    }

    const data = await response.json();
    const review = normalizeAIReviewResponse(data.review || data, result);
    renderAIReview(review);
    setStatus('Feedback ready');
  } catch (error) {
    console.warn('Feedback review failed; using local smart review.', error);
    const fallback = generateLocalAIReview(result);
    fallback.teacherNote = '';
    renderAIReview(fallback);
    setStatus('Feedback ready');
  }

  if (options.scroll !== false) scrollElementIntoSafeView(document.getElementById('aiReviewPanel'));
}

function renderResult(result) {
  const pillClass = result.percent >= activity.passingScore
    ? ''
    : result.percent >= 60
      ? 'almost'
      : 'needs-work';
  const pillText = result.percent >= activity.passingScore ? 'Passed' : result.percent >= 60 ? 'Almost' : 'Needs Work';

  resultContent.classList.remove('empty-state');
  resultContent.innerHTML = `
    <div class="score-card">
      <div class="score-main">
        <div>
          <p class="section-kicker">Automatic Score</p>
          <div class="score-number">${formatPoints(result.score)}<small> / ${formatPoints(result.possible)}</small></div>
          <p class="muted-text">${result.percent}% · Passing score: ${activity.passingScore}%</p>
        </div>
        <span class="score-pill ${pillClass}">${pillText}</span>
      </div>

      <div class="feedback-box">
        <strong>Feedback:</strong> ${escapeHTML(result.feedback)}
      </div>

      <ul class="rubric-list" aria-label="Rubric breakdown">
        ${result.results.map(item => `
          <li class="rubric-item scale-result-item ${escapeAttribute(item.levelKey)}">
            <span class="rubric-check ${item.passed ? '' : 'fail'}">${item.passed ? '✓' : '!'}</span>
            <div>
              <p class="rubric-title">${escapeHTML(item.title)}</p>
              <div class="rubric-rule"><strong>${escapeHTML(item.levelLabel)}</strong> · ${escapeHTML(item.levelDescription || 'No level description set.')}<br><span>${escapeHTML(getRuleLabel(item.rule))}${item.target ? ` · Target: ${escapeHTML(item.target)}` : ''}</span></div>
            </div>
            <span class="rubric-points">${formatPoints(item.earned)}/${formatPoints(item.points)}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function renderNoActivityResult() {
  lastRubricResult = null;
  resetAIReviewPanel();
  resultContent.classList.add('empty-state');
  resultContent.innerHTML = `
    <div class="empty-icon">!</div>
    <h3>No activity selected yet</h3>
    <p>Please choose an activity first before checking the result. Run Code still works, but scoring needs a selected rubric.</p>
  `;
  scrollElementIntoSafeView(resultPanel);
}

function showResult() {
  if (!activity) {
    showActivityRequiredWarning();
    setStatus('Choose activity first');
    return;
  }

  runCode(false, { scroll: false });
  setStatus('Checking rubric...');

  window.setTimeout(() => {
    const result = gradeActivity();
    if (!result) return;
    lastRubricResult = result;
    renderResult(result);
    renderAIReview(generateLocalAIReview(result));
    if (getAIReviewEndpoint()) {
      requestAIReview({ scroll: false });
    }
    saveCurrentStudentProject({ result, immediate: true, reason: 'result' });
    saveSubmissionToCloud(result);
    setStatus(`Score ${formatPoints(result.score)}/${formatPoints(result.possible)}`);
    scrollElementIntoSafeView(resultPanel);
  }, 350);
}

function getRuleLabel(rule) {
  return ruleOptions.find(option => option.value === rule)?.label || rule;
}

function resetResultPanel() {
  lastRubricResult = null;
  resetAIReviewPanel();
  resultContent.classList.add('empty-state');
  resultContent.innerHTML = `
    <div class="empty-icon">✓</div>
    <h3>No result yet</h3>
    <p>Click <strong>See Result</strong> when you are done with your selected activity.</p>
  `;
}


function updateActivityButtonState() {
  if (!stepActivityBtn) return;
  const hasActivity = Boolean(activity);
  stepActivityBtn.classList.toggle('activity-selected', hasActivity);
  stepActivityBtn.classList.toggle('activity-empty', !hasActivity);
  if (!stepActivityBtn.classList.contains('needs-attention')) {
    stepActivityBtn.classList.toggle('needs-attention', !hasActivity && activityWarning && !activityWarning.classList.contains('hidden'));
  }
  stepActivityBtn.innerHTML = hasActivity ? '✅ Activity Set' : '📌 Choose Activity';
  stepActivityBtn.title = hasActivity ? `Selected activity: ${activity.title}` : 'Choose an activity before checking Result';
  stepActivityBtn.setAttribute('aria-label', hasActivity ? `Activity selected: ${activity.title}` : 'Choose activity');
}

function getActivityRubricHTML(sourceActivity) {
  if (!sourceActivity || !Array.isArray(sourceActivity.criteria) || !sourceActivity.criteria.length) {
    return '<div class="empty-projects-card"><h3>No rubric yet</h3><p>Your teacher has not added rubric criteria for this activity.</p></div>';
  }
  const rows = sourceActivity.criteria.map((criterion, index) => {
    const normalized = normalizeCriterion(criterion);
    const levelCells = rubricLevels.map(level => {
      const levelData = getCriterionLevel(normalized, level.key);
      const description = levelData.description || defaultLevelDescriptions[level.key] || 'No description set.';
      const points = Number(levelData.points);
      return `
        <td>
          <strong>${Number.isFinite(points) ? `${formatPoints(points)} pts` : '—'}</strong>
          <span>${escapeHTML(description)}</span>
        </td>
      `;
    }).join('');
    return `
      <tr>
        <th scope="row"><span>${index + 1}</span>${escapeHTML(normalized.title)}</th>
        ${levelCells}
      </tr>
    `;
  }).join('');
  return `
    <table class="student-rubric-table">
      <thead>
        <tr>
          <th>Criteria</th>
          ${rubricLevels.map(level => `<th>${escapeHTML(level.label)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function openActivityRubricModal() {
  if (!activity) {
    showActivityRequiredWarning();
    return;
  }
  if (!activityRubricOverlay || !activityRubricTable) return;
  const possible = activity.criteria.reduce((sum, criterion) => sum + getCriterionPossiblePoints(criterion), 0);
  if (activityRubricTitle) activityRubricTitle.textContent = activity.title || 'Activity Rubric';
  if (activityRubricMeta) activityRubricMeta.textContent = `${formatPoints(possible)} total points • ${activity.criteria.length} rubric item${activity.criteria.length === 1 ? '' : 's'} • This is the full teacher rubric.`;
  activityRubricTable.innerHTML = getActivityRubricHTML(activity);
  activityRubricOverlay.classList.remove('hidden');
  document.body.classList.add('activity-rubric-open');
  window.setTimeout(() => closeActivityRubricBtn?.focus(), 30);
}

function closeActivityRubricModal() {
  activityRubricOverlay?.classList.add('hidden');
  document.body.classList.remove('activity-rubric-open');
}

function renderActivitySelector() {
  if (!activitySelect) return;
  const placeholder = `<option value="" ${activity ? '' : 'selected'}>Select an activity first...</option>`;
  const options = activities.map((item, index) => `
    <option value="${escapeAttribute(item.id)}" ${activity && item.id === activity.id ? 'selected' : ''}>${index + 1}. ${escapeHTML(item.title)}</option>
  `).join('');
  activitySelect.innerHTML = placeholder + options;
}

function renderAdminActivitySelect() {
  if (!adminActivitySelect) return;

  if (!activities.length) {
    adminActivitySelect.innerHTML = '<option value="">No saved activities yet</option>';
    adminActivitySelect.value = '';
    return;
  }

  adminActivitySelect.innerHTML = activities.map((item, index) => `
    <option value="${escapeAttribute(item.id)}" ${item.id === adminEditingActivityId ? 'selected' : ''}>${index + 1}. ${escapeHTML(item.title)}</option>
  `).join('');
}

function renderActivitySummary() {
  if (!activity) {
    activityTitle.textContent = 'No activity selected yet';
    activityDescription.textContent = 'Choose an activity first. Run Code still works, but score and feedback need a selected activity/rubric.';
    totalPoints.textContent = '0';
    criteriaCount.textContent = '0';
    activityCriteriaStat?.classList.add('disabled');
    renderActivitySelector();
    updateActivityButtonState();
    return;
  }

  const possible = activity.criteria.reduce((sum, criterion) => sum + getCriterionPossiblePoints(criterion), 0);
  activityTitle.textContent = activity.title;
  activityDescription.textContent = activity.description;
  totalPoints.textContent = formatPoints(possible);
  criteriaCount.textContent = activity.criteria.length;
  activityCriteriaStat?.classList.remove('disabled');
  renderActivitySelector();
  updateActivityButtonState();
  clearActivityRequiredWarning();
}

function selectActivity(activityId, options = {}) {
  if (!activityId) {
    if (!options.skipSave) saveActiveEditor();
    activity = null;
    selectedActivityId = '';
    saveJSON(STORAGE_KEYS.selectedActivityId, '');
    codeStore = normalizeCodeStore(starterCode);
    renderActivitySummary();
    loadActiveEditor();
    resetResultPanel();
    runCode(false, { scroll: false });
    return;
  }

  const nextActivity = getActivityById(activityId);
  if (!nextActivity) return;

  if (!options.skipSave) {
    saveActiveEditor();
  }

  activity = nextActivity;
  selectedActivityId = nextActivity.id;
  adminEditingActivityId = nextActivity.id;
  saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
  codeStore = getCodeStoreForActivity(nextActivity.id);

  if (!options.keepLanguage) {
    activeLanguage = 'html';
    tabButtons.forEach(tab => tab.classList.toggle('active', tab.dataset.language === activeLanguage));
  }

  renderActivitySummary();
  loadActiveEditor();
  resetResultPanel();
  runCode(false, { scroll: false });
  setStatus(`Loaded: ${nextActivity.title}`);
}

async function resetCurrentActivityCode() {
  if (!activity) {
    showActivityRequiredWarning();
    return;
  }

  if (!await appConfirm(`Reset your code for "${activity.title}"?`, { title: 'Reset activity code', danger: true })) return;
  codeStore = normalizeCodeStore(starterCode);
  codeByActivity[activity.id] = codeStore;
  saveCodeByActivity();
  resetAllLanguageHistoryForCurrentActivity();
  loadActiveEditor();
  resetResultPanel();
  runCode();
  setStatus('Activity code reset');
}

function setPreviewLayout(layout) {
  const safeLayout = ['split', 'stacked', 'preview-focus'].includes(layout) ? layout : 'split';
  workspace.dataset.layout = safeLayout;
  layoutButtons.forEach(button => button.classList.toggle('active', button.dataset.layout === safeLayout));
  saveJSON(STORAGE_KEYS.layout, safeLayout);
  setStatus(safeLayout === 'preview-focus' ? 'Big preview layout' : `${safeLayout[0].toUpperCase()}${safeLayout.slice(1)} layout`);
}

function setDesktopPreviewMode(enabled) {
  // The monitor simulation is intentionally available on phones only.
  if (!isLikelyPhoneViewport()) {
    applyPreviewDeviceMode();
    return;
  }

  const isEnabled = Boolean(enabled);
  previewPanel?.classList.toggle('mobile-desktop-preview', isEnabled);
  if (desktopPreviewBtn) {
    desktopPreviewBtn.classList.toggle('active', isEnabled);
    desktopPreviewBtn.setAttribute('aria-pressed', String(isEnabled));
    const isPhoneView = document.documentElement.dataset.deviceMode === 'phone' || window.innerWidth <= 760;
    desktopPreviewBtn.textContent = isPhoneView ? (isEnabled ? 'Phone' : 'Monitor') : (isEnabled ? 'Phone View' : 'Desktop Monitor');
    desktopPreviewBtn.dataset.mobileLabel = isEnabled ? '📱 Phone' : '🖥️ Monitor';
    desktopPreviewBtn.setAttribute('aria-label', isEnabled ? 'Return to phone preview' : 'Open desktop monitor preview');
    desktopPreviewBtn.title = isEnabled
      ? 'Return the preview to normal phone width'
      : 'Show the output inside a scaled desktop monitor view';
  }
  window.setTimeout(updateDesktopMonitorPreviewSizing, 0);
  setStatus(isEnabled ? 'Desktop monitor preview' : 'Phone preview');
}

function toggleDesktopPreviewMode() {
  setDesktopPreviewMode(!previewPanel?.classList.contains('mobile-desktop-preview'));
}

function ensureBackToEditorPreviewBtn() {
  let button = document.getElementById('backToEditorPreviewBtn');
  if (!button) {
    button = document.createElement('button');
    button.id = 'backToEditorPreviewBtn';
    button.type = 'button';
    button.className = 'layout-btn strong back-editor-preview-btn hidden';
    button.textContent = '↩ Back to Editor';
    button.title = 'Return to Full Editor';
    const actions = previewPanel?.querySelector('.preview-actions');
    if (actions && exitPreviewBtn) {
      actions.insertBefore(button, exitPreviewBtn);
    } else if (actions) {
      actions.appendChild(button);
    }
    button.addEventListener('click', backToEditorFromPreview);
  }
  return button;
}

function ensurePreviewResultBtn() {
  let button = document.getElementById('resultFromPreviewBtn');
  if (!button) {
    button = document.createElement('button');
    button.id = 'resultFromPreviewBtn';
    button.type = 'button';
    button.className = 'layout-btn strong preview-result-btn';
    button.textContent = '✓ Result';
    button.title = 'Check result from Output Preview';
    const actions = previewPanel?.querySelector('.preview-actions');
    const backButton = document.getElementById('backToEditorPreviewBtn');
    if (actions && exitPreviewBtn) {
      actions.insertBefore(button, exitPreviewBtn);
    } else if (actions && backButton?.nextSibling) {
      actions.insertBefore(button, backButton.nextSibling);
    } else if (actions) {
      actions.appendChild(button);
    }
    button.addEventListener('click', showResultFromPreview);
  }
  return button;
}

function ensurePreviewControlsToggle() {
  let button = document.getElementById('previewControlsToggle');
  const actions = previewPanel?.querySelector('.preview-actions');
  if (!button) {
    button = document.createElement('button');
    button.id = 'previewControlsToggle';
    button.type = 'button';
    button.className = 'layout-btn preview-controls-toggle hidden';
    button.textContent = '🖥️';
    button.title = 'Show output controls';
    button.setAttribute('aria-label', 'Show output controls');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const controls = previewPanel?.querySelector('.preview-actions');
      const isOpen = controls?.classList.toggle('output-menu-open');
      button.setAttribute('aria-expanded', String(Boolean(isOpen)));
      button.title = isOpen ? 'Hide output controls' : 'Show output controls';
      button.setAttribute('aria-label', isOpen ? 'Hide output controls' : 'Show output controls');
    });
  }
  if (actions && button.parentElement !== actions) {
    actions.insertBefore(button, actions.firstChild);
  }
  return button;
}

function setPreviewControlsMenu(open) {
  const actions = previewPanel?.querySelector('.preview-actions');
  const toggle = document.getElementById('previewControlsToggle');
  actions?.classList.toggle('output-menu-open', Boolean(open));
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(Boolean(open)));
    toggle.title = open ? 'Hide output controls' : 'Show output controls';
    toggle.setAttribute('aria-label', open ? 'Hide output controls' : 'Show output controls');
  }
}

function showResultFromPreview() {
  hideSuggestions();
  const wasPreviewFullscreen = document.body.classList.contains('preview-fullscreen-active');
  const wasInsideFullEditor = previewMovedIntoEditor ||
    document.body.classList.contains('preview-inside-editor-fullscreen') ||
    document.body.classList.contains('editor-fullscreen-active');

  if (wasPreviewFullscreen) {
    exitFullPreview({ keepReturnFlag: false, silent: true, keepNative: true });
    if (wasInsideFullEditor || document.body.classList.contains('editor-fullscreen-active')) {
      exitFullEditor({ silent: true, skipFocus: true });
    }
    window.setTimeout(() => {
      showResult();
    }, 180);
    return;
  }

  showResult();
}


function setPreviewTransitionClass() {
  window.clearTimeout(previewTransitionTimer);
  document.body.classList.add('preview-transitioning');
  previewTransitionTimer = window.setTimeout(() => {
    document.body.classList.remove('preview-transitioning');
  }, 360);
}

function enterFullPreview(options = {}) {
  const fromFullEditor = Boolean(options.fromFullEditor || returnToFullEditorAfterPreview);
  const insideEditorFullscreen = Boolean(
    fromFullEditor &&
    options.keepEditorFullscreen !== false &&
    document.body.classList.contains('editor-fullscreen-active') &&
    movePreviewPanelIntoEditorFullscreen()
  );
  const wantsNativeFullscreen = options.nativeFullscreen !== false && !insideEditorFullscreen;

  returnToFullEditorAfterPreview = fromFullEditor;
  const backButton = ensureBackToEditorPreviewBtn();
  const previewResultButton = ensurePreviewResultBtn();
  const previewControlsToggle = ensurePreviewControlsToggle();
  backButton?.classList.toggle('hidden', !fromFullEditor);
  previewResultButton?.classList.toggle('hidden', !fromFullEditor);
  previewControlsToggle?.classList.toggle('hidden', !fromFullEditor);
  setPreviewControlsMenu(false);

  document.body.classList.add('preview-fullscreen-active');
  document.body.classList.toggle('preview-has-back-editor', fromFullEditor);
  document.body.classList.toggle('preview-inside-editor-fullscreen', insideEditorFullscreen);
  document.body.classList.remove('preview-closing-to-editor');

  // When the preview is shown inside the full editor, hide editor-only floating controls.
  // The preview must show only its own Back/Exit controls so it does not look like
  // the editor buttons are part of the student's output.
  if (insideEditorFullscreen) {
    hideSuggestions();
    closeCodeHelperPanel();
    ensureFullscreenActionBar()?.classList.add('hidden');
  }

  if (!insideEditorFullscreen) {
    setPreviewTransitionClass();
  }

  fullPreviewBtn?.classList.add('hidden');
  exitPreviewBtn?.classList.remove('hidden');
  window.setTimeout(updateDesktopMonitorPreviewSizing, 0);

  if (wantsNativeFullscreen && previewPanel?.requestFullscreen && document.fullscreenElement !== previewPanel) {
    previewPanel.requestFullscreen().catch(() => {
      // If the browser blocks native fullscreen, the CSS fullscreen fallback remains active.
    });
  }

  setStatus(fromFullEditor ? 'Output preview' : 'Full preview');
}

function exitFullPreview(options = {}) {
  // The Exit button in a preview that came from Full Editor must close the whole
  // fullscreen flow, not return to the editor fullscreen. Back to Editor already
  // handles that separate behavior.
  const safeOptions = options && typeof options === 'object' && !('target' in options) ? options : {};
  const isInsideEditorFullscreen = previewMovedIntoEditor || document.body.classList.contains('preview-inside-editor-fullscreen');
  const shouldCloseEditorFullscreen = Boolean(safeOptions.closeEditorFullscreen && isInsideEditorFullscreen);
  const shouldExitNativePreview = document.fullscreenElement === previewPanel &&
    !safeOptions.keepNative &&
    !safeOptions.fromNative &&
    document.exitFullscreen;
  const shouldExitNativeEditor = shouldCloseEditorFullscreen &&
    document.fullscreenElement === editorPanel &&
    !safeOptions.keepNative &&
    !safeOptions.fromNative &&
    document.exitFullscreen;

  document.body.classList.remove(
    'preview-fullscreen-active',
    'preview-has-back-editor',
    'preview-closing-to-editor',
    'preview-inside-editor-fullscreen',
    'book-preview-revealing',
    'book-preview-leaving'
  );

  if (!isInsideEditorFullscreen) {
    setPreviewTransitionClass();
  }

  fullPreviewBtn?.classList.remove('hidden');
  exitPreviewBtn?.classList.add('hidden');
  ensureBackToEditorPreviewBtn()?.classList.add('hidden');
  if (isInsideEditorFullscreen) ensurePreviewResultBtn()?.classList.add('hidden');
  else ensurePreviewResultBtn()?.classList.remove('hidden');
  ensurePreviewControlsToggle()?.classList.add('hidden');
  setPreviewControlsMenu(false);

  if (isInsideEditorFullscreen) {
    restorePreviewPanelFromEditorFullscreen();
  }

  if (shouldCloseEditorFullscreen) {
    document.body.classList.remove('editor-fullscreen-active');
    document.getElementById('fullscreenEditorActions')?.classList.add('hidden');
    document.getElementById('exitEditorStickyBtn')?.classList.add('hidden');
    document.getElementById('fullscreenRunBtn')?.classList.add('hidden');
    document.getElementById('fullscreenResultBtn')?.classList.add('hidden');
    fullEditorBtn?.classList.remove('hidden');
    exitEditorBtn?.classList.add('hidden');
    hideSuggestions();
    closeCodeHelperPanel();
  }

  if (shouldExitNativePreview || shouldExitNativeEditor) {
    document.exitFullscreen().catch(() => {});
  }

  if (!safeOptions.keepReturnFlag) {
    returnToFullEditorAfterPreview = false;
  }
  if (!safeOptions.silent) {
    setStatus(shouldCloseEditorFullscreen ? 'Fullscreen closed' : 'Preview restored');
  }

  window.setTimeout(updateDesktopMonitorPreviewSizing, 0);
  fitEditorToContent();
}

function backToEditorFromPreview() {
  if (fullscreenPageTransitionBusy) return;
  const isInsideEditorFullscreen = previewMovedIntoEditor || document.body.classList.contains('preview-inside-editor-fullscreen');

  if (isInsideEditorFullscreen) {
    fullscreenPageTransitionBusy = true;
    hideSuggestions();
    closeCodeHelperPanel();
    document.body.classList.add('preview-closing-to-editor');

    runSmoothFullscreenBookTransition({
      direction: 'to-editor',
      label: 'Back to Editor',
      onSwap: () => {
        restoreEditorFullscreenAfterPreview();
        document.body.classList.add('book-editor-revealing');
        scheduleFullEditorControlsRestore();
        setStatus('Back to editor');
      },
      onDone: () => {
        document.body.classList.remove('book-editor-revealing', 'preview-closing-to-editor');
        editor?.focus({ preventScroll: true });
      }
    });
    return;
  }

  // Normal native-preview fallback: switch it back to the editor while this click has user activation.
  if (document.fullscreenElement === previewPanel && editorPanel?.requestFullscreen) {
    editorPanel.requestFullscreen().catch(() => {});
  }

  exitFullPreview({ keepReturnFlag: true, silent: true, keepNative: true });
  window.setTimeout(() => {
    enterFullEditor();
    restoreEditorFullscreenAfterPreview();
    scheduleFullEditorControlsRestore();
    returnToFullEditorAfterPreview = false;
    fullscreenPageTransitionBusy = false;
    setStatus('Back to editor');
  }, 180);
}


function ensureFullscreenActionBar() {
  if (!editorPanel) return null;
  let actions = document.getElementById('fullscreenEditorActions');
  if (!actions) {
    actions = document.createElement('div');
    actions.id = 'fullscreenEditorActions';
    actions.className = 'fullscreen-editor-actions hidden';
    actions.setAttribute('aria-label', 'Full editor actions');
    editorPanel.insertBefore(actions, editorPanel.firstChild);
  }

  const buttonSpecs = [
    {
      id: 'fullscreenRunBtn',
      className: 'primary-btn fullscreen-run-btn',
      text: '▶ Run',
      title: 'Run: Ctrl + Enter',
      onClick: handleFullscreenRunClick
    },
    {
      id: 'fullscreenAutoRunBtn',
      className: 'ghost-btn fullscreen-auto-run-btn',
      text: autoRunEnabled ? '⚡ Auto On' : '⚡ Auto Off',
      title: 'Auto update preview after typing',
      onClick: toggleAutoRun
    },
    {
      id: 'fullscreenResultBtn',
      className: 'success-btn fullscreen-result-btn',
      text: '✓ Result',
      title: 'Check result: Ctrl + Shift + Enter',
      onClick: handleFullscreenResultClick
    },
    {
      id: 'exitEditorStickyBtn',
      className: 'fullscreen-exit-btn',
      text: 'Exit Full',
      title: 'Exit full editor: Esc',
      onClick: exitFullEditor
    }
  ];

  buttonSpecs.forEach(spec => {
    let button = document.getElementById(spec.id);
    if (!button) {
      button = document.createElement('button');
      button.id = spec.id;
      button.type = 'button';
      actions.appendChild(button);
    }
    if (button.parentElement !== actions) actions.appendChild(button);
    button.className = spec.className;
    button.textContent = spec.text;
    button.title = spec.title;
    button.classList.remove('hidden');
    if (!button.dataset.fullscreenActionBound) {
      button.addEventListener('click', spec.onClick);
      button.dataset.fullscreenActionBound = 'true';
    }
  });

  updateAutoRunButtons();
  return actions;
}

function forceFullEditorControlsVisible() {
  const previewActive = document.body.classList.contains('preview-fullscreen-active') ||
    document.body.classList.contains('preview-inside-editor-fullscreen') ||
    previewMovedIntoEditor;

  if (!document.body.classList.contains('editor-fullscreen-active') || previewActive) {
    return;
  }

  const actions = ensureFullscreenActionBar();
  if (actions) {
    actions.classList.remove('hidden');
    actions.removeAttribute('aria-hidden');
  }

  [
    document.getElementById('fullscreenRunBtn'),
    document.getElementById('fullscreenResultBtn'),
    document.getElementById('exitEditorStickyBtn')
  ].forEach(button => {
    if (!button) return;
    button.classList.remove('hidden');
    button.removeAttribute('aria-hidden');
    button.disabled = false;
  });

  if (codeHelperFloatingBtn) {
    codeHelperFloatingBtn.classList.remove('hidden');
    codeHelperFloatingBtn.removeAttribute('aria-hidden');
    codeHelperFloatingBtn.disabled = false;
  }

  if (fullEditorBtn) fullEditorBtn.classList.add('hidden');
  if (exitEditorBtn) exitEditorBtn.classList.add('hidden');
}

function restoreEditorFullscreenAfterPreview() {
  window.clearTimeout(previewCloseToEditorTimer);
  document.body.classList.remove(
    'preview-fullscreen-active',
    'preview-has-back-editor',
    'preview-inside-editor-fullscreen',
    'preview-closing-to-editor'
  );

  if (previewMovedIntoEditor) {
    restorePreviewPanelFromEditorFullscreen();
  }

  document.body.classList.add('editor-fullscreen-active');
  returnToFullEditorAfterPreview = false;
  fullPreviewBtn?.classList.remove('hidden');
  exitPreviewBtn?.classList.add('hidden');
  ensureBackToEditorPreviewBtn()?.classList.add('hidden');
  ensurePreviewResultBtn()?.classList.add('hidden');
  ensurePreviewControlsToggle()?.classList.add('hidden');
  setPreviewControlsMenu(false);
  forceFullEditorControlsVisible();
  fitEditorToContent();
}

function scheduleFullEditorControlsRestore() {
  [0, 60, 180, 420].forEach(delay => {
    window.setTimeout(forceFullEditorControlsVisible, delay);
  });
}


function enterFullEditor() {
  if (document.body.classList.contains('preview-fullscreen-active')) {
    exitFullPreview();
  }

  document.body.classList.add('editor-fullscreen-active');
  syncSmartInlineHintHost();
  fullEditorBtn?.classList.add('hidden');
  exitEditorBtn?.classList.remove('hidden');
  const fullscreenActions = ensureFullscreenActionBar();
  fullscreenActions?.classList.remove('hidden');
  document.getElementById('exitEditorStickyBtn')?.classList.remove('hidden');
  document.getElementById('fullscreenRunBtn')?.classList.remove('hidden');
  document.getElementById('fullscreenResultBtn')?.classList.remove('hidden');
  ensurePreviewResultBtn()?.classList.add('hidden');
  hideSuggestions();

  const isSmallScreen = window.matchMedia('(max-width: 820px)').matches;
  if (!isSmallScreen && editorPanel?.requestFullscreen && !document.fullscreenElement) {
    editorPanel.requestFullscreen().catch(() => {
      // Browser may block fullscreen from some shortcuts; CSS fullscreen still works.
    });
  }

  forceFullEditorControlsVisible();
  scheduleFullEditorControlsRestore();
  setStatus('Full editor mode');
  fitEditorToContent();
  window.setTimeout(() => editor.focus(), 80);
}

function exitFullEditor(options = {}) {
  if (previewMovedIntoEditor || document.body.classList.contains('preview-inside-editor-fullscreen')) {
    exitFullPreview({ silent: true, keepNative: true });
  }
  document.body.classList.remove('editor-fullscreen-active');
  syncSmartInlineHintHost();
  fullEditorBtn?.classList.remove('hidden');
  exitEditorBtn?.classList.add('hidden');
  document.getElementById('fullscreenEditorActions')?.classList.add('hidden');
  document.getElementById('exitEditorStickyBtn')?.classList.add('hidden');
  document.getElementById('fullscreenRunBtn')?.classList.add('hidden');
  document.getElementById('fullscreenResultBtn')?.classList.add('hidden');
  if (!document.body.classList.contains('preview-fullscreen-active')) ensurePreviewResultBtn()?.classList.remove('hidden');
  hideSuggestions();

  if (!options.fromNative && document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }

  if (!options.silent) {
    setStatus('Editor restored');
  }
  fitEditorToContent();
  if (!options.skipFocus) {
    window.setTimeout(() => editor.focus(), 80);
  }
}

function getStoredAdminTab() {
  return localStorage.getItem(ADMIN_TAB_STORAGE_KEY) || 'students';
}

function setAdminTab(tabName = 'students') {
  const allowed = new Set(['students', 'assistance', 'activities']);
  const nextTab = allowed.has(tabName) ? tabName : 'students';
  localStorage.setItem(ADMIN_TAB_STORAGE_KEY, nextTab);

  adminTabButtons.forEach(button => {
    const isActive = button.dataset.adminTab === nextTab;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  adminTabPanels.forEach(panel => {
    const isActive = panel.dataset.adminPanel === nextTab;
    panel.classList.toggle('active', isActive);
  });
}

function initAdminTabs() {
  adminTabButtons.forEach(button => {
    if (button.dataset.adminTabBound === '1') return;
    button.dataset.adminTabBound = '1';
    button.addEventListener('click', () => setAdminTab(button.dataset.adminTab || 'students'));
  });
  setAdminTab(getStoredAdminTab());
}

async function openAdminPanel() {
  document.body.classList.add('admin-open');
  adminOverlay.classList.remove('hidden');
  initAdminTabs();
  syncAssistanceSettingsControls();
  updateAssistancePublishUI();
  setAssistanceSettingsStatus(isTeacherAuthenticated()
    ? 'Change the switches, then publish to update every student device.'
    : 'These switches can be used now on this browser. Login is only needed to publish globally.');
  const adminFirebaseReady = await initFirebaseSync();
  if (!adminFirebaseReady) {
    showTeacherLoginError(`Firebase is not ready. ${firebaseSync.lastError || 'Firebase SDK did not load. Check internet connection, CDN access, and make sure all updated files were uploaded.'}`);
  }
  updateTeacherLoginUI(firebaseSync.auth?.currentUser || firebaseSync.currentUser);

  if (isAdminPanelUnlocked()) {
    showAdminForm();
  } else {
    pinScreen.classList.remove('hidden');
    adminForm.classList.add('hidden');
    adminForm.classList.remove('visible');
    if (adminPassword) adminPassword.value = '';
    setAdminLoginMode('code');
    setTimeout(() => adminQuickCode?.focus(), 50);
  }
}

function closeAdminPanel() {
  adminOverlay.classList.add('hidden');
  setAdminTab(getStoredAdminTab());
  document.body.classList.remove('admin-open');
}

function showAdminForm(activityId = adminEditingActivityId) {
  if (!isAdminPanelUnlocked()) {
    adminUnlocked = false;
    pinScreen.classList.remove('hidden');
    adminForm.classList.add('hidden');
    adminForm.classList.remove('visible');
    return;
  }

  adminUnlocked = true;
  pinScreen.classList.add('hidden');
  adminForm.classList.remove('hidden');
  adminForm.classList.add('visible');
  initAdminTabs();
  if (adminStudentsCache.length) renderAdminStudentTracker();
  else loadAdminStudents().catch(error => console.warn('Student tracker load failed.', error));
  const editActivity = getActivityById(activityId) || activity || activities[0] || null;

  if (!editActivity) {
    adminEditingActivityId = '';
    renderAdminActivitySelect();
    adminActivityTitle.value = '';
    adminActivityDescription.value = '';
    adminPassingScore.value = 75;
    renderCriteriaEditor([]);
    if (typeof initManualRubricInputTable === 'function') initManualRubricInputTable();
    setStatus('No saved activities yet');
    return;
  }

  adminEditingActivityId = editActivity.id;
  renderAdminActivitySelect();
  adminActivityTitle.value = editActivity.title;
  adminActivityDescription.value = editActivity.description;
  adminPassingScore.value = editActivity.passingScore;
  renderCriteriaEditor(editActivity.criteria);
}

function editAdminActivity(activityId) {
  const editActivity = getActivityById(activityId);
  if (!editActivity) return;
  adminEditingActivityId = editActivity.id;
  showAdminForm(editActivity.id);
}

async function loginTeacher() {
  showTeacherLoginError('');
  const ready = await initFirebaseSync();
  if (!ready || !firebaseSync.auth || !firebaseSync.authModule) {
    showTeacherLoginError(`Firebase is not ready. ${firebaseSync.lastError || 'Firebase SDK did not load. Check internet connection, CDN access, and make sure all updated files were uploaded.'}`);
    return;
  }

  const fallbackTeacherEmail = getDefaultTeacherEmail();
  const email = (adminEmail.value.trim() || fallbackTeacherEmail).trim();
  const password = adminPassword.value;
  if (adminEmail && !adminEmail.value.trim() && fallbackTeacherEmail) adminEmail.value = fallbackTeacherEmail;

  if (!email || !password) {
    showTeacherLoginError('Please enter teacher email and password.');
    return;
  }

  try {
    setTeacherLoginLoading(true);
    const { signInWithEmailAndPassword, signOut } = firebaseSync.authModule;
    const credential = await signInWithEmailAndPassword(firebaseSync.auth, email, password);
    firebaseSync.currentUser = credential.user;

    if (!isAllowedTeacherEmail(credential.user.email)) {
      await signOut(firebaseSync.auth);
      adminUnlocked = false;
      showTeacherLoginError(`This account is signed in but not allowed to manage rubrics. Allowed teacher: ${getTeacherEmailText()}.`);
      return;
    }

    adminUnlocked = true;
    updateTeacherLoginUI(credential.user);
    showAdminForm();
    setStatus('Teacher logged in');
  } catch (error) {
    console.error('Teacher login failed', error);
    showTeacherLoginError(getFirebaseLoginErrorMessage(error));
  } finally {
    setTeacherLoginLoading(false);
  }
}

async function logoutTeacher() {
  setAdminQuickUnlocked(false);
  const ready = await initFirebaseSync();

  try {
    if (ready && firebaseSync.auth && firebaseSync.authModule && (firebaseSync.auth.currentUser || firebaseSync.currentUser)) {
      const { signOut } = firebaseSync.authModule;
      await signOut(firebaseSync.auth);
    }
    firebaseSync.currentUser = null;
    adminUnlocked = false;
    adminForm.classList.add('hidden');
    adminForm.classList.remove('visible');
    pinScreen.classList.remove('hidden');
    if (adminPassword) adminPassword.value = '';
    if (adminQuickCode) adminQuickCode.value = '';
    updateTeacherLoginUI(null);
    setAdminLoginMode('code');
    setStatus('Admin locked');
  } catch (error) {
    console.error('Teacher logout failed', error);
    await appAlert('Logout failed. Please try again.', { title: 'Logout failed', danger: true });
  }
}

async function unlockAdminWithCode() {
  showTeacherLoginError('');
  const ready = await initFirebaseSync();
  if (!ready || !firebaseSync.auth || !firebaseSync.authModule) {
    showTeacherLoginError(`Firebase is not ready. ${firebaseSync.lastError || 'Firebase SDK did not load. Check internet connection, CDN access, and make sure all updated files were uploaded.'}`);
    return;
  }

  const email = getDefaultTeacherEmail();
  const passwordCode = String(adminQuickCode?.value || '').trim();
  if (!email) {
    showTeacherLoginError('No teacher email is set in firebase-config.js. Add your teacher email to MCS_TEACHER_EMAILS or use Password mode.');
    return;
  }
  if (!passwordCode) {
    showTeacherLoginError('Enter the teacher account password as your Admin Code, or switch to Password mode.');
    return;
  }

  try {
    setTeacherLoginLoading(true, 'code');
    const { signInWithEmailAndPassword, signOut } = firebaseSync.authModule;
    const credential = await signInWithEmailAndPassword(firebaseSync.auth, email, passwordCode);
    firebaseSync.currentUser = credential.user;

    if (!isAllowedTeacherEmail(credential.user.email)) {
      await signOut(firebaseSync.auth);
      adminUnlocked = false;
      showTeacherLoginError(`This account is signed in but not allowed to manage rubrics. Allowed teacher: ${getTeacherEmailText()}.`);
      return;
    }

    adminUnlocked = true;
    if (adminEmail) adminEmail.value = credential.user.email || email;
    updateTeacherLoginUI(credential.user);
    showAdminForm();
    setStatus('Teacher logged in');
  } catch (error) {
    console.error('Teacher code login failed', error);
    showTeacherLoginError(getFirebaseLoginErrorMessage(error));
  } finally {
    setTeacherLoginLoading(false, 'code');
  }
}

function unlockAdmin() {
  loginTeacher();
}

function renderScaleLevelCells(criterion) {
  const normalized = normalizeCriterion(criterion);
  return rubricLevels.map(level => {
    const levelData = normalized.levels[level.key] || {};
    return `
      <td class="rubric-level-cell level-${escapeAttribute(level.key)}" data-level="${escapeAttribute(level.key)}" data-label="${escapeAttribute(level.label)}">
        <label class="rubric-score-label">
          <span>Score</span>
          <input class="level-points" type="number" min="0" step="0.5" value="${escapeAttribute(formatPoints(levelData.points))}" aria-label="${escapeAttribute(level.label)} score" />
        </label>
        <textarea class="level-description" rows="4" placeholder="Describe ${escapeAttribute(level.label)} performance...">${escapeHTML(levelData.description || '')}</textarea>
      </td>
    `;
  }).join('');
}

function renderCriteriaEditor(criteria) {
  const rows = criteria.map((criterion, index) => {
    const normalized = normalizeCriterion(criterion);
    return `
      <tr class="rubric-table-row" data-id="${escapeHTML(normalized.id || createId())}">
        <td class="rubric-criterion-cell" data-label="Criterion">
          <div class="criterion-title-row">
            <span class="criterion-number">${index + 1}</span>
            <input class="criterion-title criterion-title-big" type="text" value="${escapeAttribute(normalized.title)}" placeholder="Example: Content and HTML Structure" />
          </div>

          <div class="criterion-mini-grid">
            <label>
              Max
              <input class="criterion-points" type="number" min="0" step="0.5" value="${escapeAttribute(formatPoints(normalized.points))}" />
            </label>
            <label>
              Auto Check
              <select class="criterion-rule">
                ${ruleOptions.map(option => `
                  <option value="${option.value}" ${option.value === normalized.rule ? 'selected' : ''}>${escapeHTML(option.label)}</option>
                `).join('')}
              </select>
            </label>
            <label>
              Target / Keyword
              <input class="criterion-target" type="text" value="${escapeAttribute(normalized.target || '')}" placeholder="Optional: class=\"card\"" />
            </label>
          </div>

          <p class="helper-note criterion-help">${escapeHTML(ruleHelp[normalized.rule] || '')}</p>
          <button class="ghost-btn danger remove-criterion" type="button" aria-label="Remove criterion ${index + 1}">Remove row</button>
        </td>
        ${renderScaleLevelCells(normalized)}
      </tr>
    `;
  }).join('');

  criteriaEditor.innerHTML = `
    <div class="rubric-table-note">
      <strong>Table input:</strong> Row = criterion. Columns = performance levels. Put the score and description for each level.
    </div>
    <div class="rubric-table-scroll">
      <table class="teacher-rubric-table" aria-label="Teacher rubric table input">
        <thead>
          <tr>
            <th>Criteria</th>
            ${rubricLevels.map(level => `<th>${escapeHTML(level.label)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function collectLevelsFromCard(card, maxPoints) {
  const levels = {};
  card.querySelectorAll('.rubric-level-cell').forEach(cell => {
    const levelKey = cell.dataset.level;
    const pointsInput = cell.querySelector('.level-points');
    const descriptionInput = cell.querySelector('.level-description');
    const fallback = normalizeLevels(null, maxPoints)[levelKey];
    levels[levelKey] = {
      label: rubricLevels.find(item => item.key === levelKey)?.label || levelKey,
      points: Number(pointsInput?.value) || 0,
      description: descriptionInput?.value.trim() || fallback.description
    };
  });
  return levels;
}

function collectCriteriaFromEditor() {
  return [...criteriaEditor.querySelectorAll('.rubric-table-row')].map(row => {
    const maxPoints = Number(row.querySelector('.criterion-points').value) || 0;
    return normalizeCriterion({
      id: row.dataset.id || createId(),
      title: row.querySelector('.criterion-title').value.trim() || 'Untitled criterion',
      points: maxPoints,
      rule: row.querySelector('.criterion-rule').value,
      target: row.querySelector('.criterion-target').value.trim(),
      levels: collectLevelsFromCard(row, maxPoints)
    });
  }).filter(item => item.points > 0);
}

function addCriterion() {
  const currentCriteria = collectCriteriaFromEditor();
  currentCriteria.push(normalizeCriterion({
    id: createId(),
    title: 'New criterion / row',
    points: 4,
    rule: 'html_contains',
    target: ''
  }));
  renderCriteriaEditor(currentCriteria);
}

async function saveRubric(event) {
  event.preventDefault();

  if (!isAdminPanelUnlocked()) {
    showAdminForm();
    showTeacherLoginError('Please unlock Admin using Code or Password before saving rubric changes.');
    return;
  }

  const criteria = collectCriteriaFromEditor();

  if (!criteria.length) {
    await appAlert('Please add at least one rubric criterion.', { title: 'Rubric needed' });
    return;
  }

  const savedActivity = normalizeActivity({
    id: adminEditingActivityId || createId(),
    title: adminActivityTitle.value.trim() || `Activity ${activities.length + 1}`,
    description: adminActivityDescription.value.trim() || 'Complete the activity based on the teacher rubric.',
    passingScore: Number(adminPassingScore.value) || 75,
    criteria
  });

  const existingIndex = activities.findIndex(item => item.id === savedActivity.id);
  if (existingIndex >= 0) {
    activities[existingIndex] = savedActivity;
  } else {
    activities.push(savedActivity);
  }

  initManualRubricInputTable();
  saveActivities({ cloud: false });

  if (isTeacherAuthenticated()) {
    const cloudSaved = await saveActivitiesToCloud();
    if (!cloudSaved && hasFirebaseConfig()) {
      await appAlert('Saved locally, but Firebase rejected the online save. Check if you are logged in and if Firestore Rules were published.', { title: 'Firebase save issue', danger: true });
      return;
    }
  } else if (adminQuickUnlocked) {
    setStatus('Activity saved locally');
  }

  selectActivity(savedActivity.id, { keepLanguage: true });
  closeAdminPanel();
  setStatus(isTeacherAuthenticated() ? 'Activity saved' : 'Activity saved locally');
}

function createNewActivity() {
  adminEditingActivityId = createId();
  renderAdminActivitySelect();
  adminActivityTitle.value = '';
  adminActivityDescription.value = '';
  adminPassingScore.value = 75;
  renderCriteriaEditor([]);
  if (typeof initManualRubricInputTable === 'function') initManualRubricInputTable();
  setStatus('Blank activity form ready');
}

function duplicateActivity() {
  const source = getActivityById(adminEditingActivityId) || activity;
  if (!source) {
    appAlert('No saved activity to duplicate yet.', { title: 'Nothing to duplicate' });
    return;
  }
  const copy = normalizeActivity({
    ...clone(source),
    id: createId(),
    title: `${source.title} (Copy)`,
    criteria: source.criteria.map(criterion => normalizeCriterion({ ...criterion, id: createId() }))
  });

  activities.push(copy);
  saveActivities();
  codeByActivity[copy.id] = normalizeCodeStore(codeByActivity[source.id] || starterCode);
  saveCodeByActivity();
  selectActivity(copy.id, { skipSave: true });
  showAdminForm(copy.id);
  setStatus('Activity duplicated');
}

async function deleteActivity() {
  const activityToDelete = getActivityById(adminEditingActivityId);
  if (!activityToDelete) {
    appAlert('No saved activity selected.', { title: 'No activity selected' });
    return;
  }
  if (!await appConfirm(`Delete "${activityToDelete.title}"? Students will no longer see this activity.`, { title: 'Delete activity', danger: true, confirmText: 'Delete' })) return;

  activities = activities.filter(item => item.id !== activityToDelete.id);
  delete codeByActivity[activityToDelete.id];
  saveActivities();
  saveCodeByActivity();

  if (selectedActivityId === activityToDelete.id) {
    selectActivity('', { skipSave: true });
  }

  const nextActivity = activities[0] || null;
  showAdminForm(nextActivity?.id || '');
  setStatus('Activity deleted');
}

async function restoreDefaultRubric() {
  const existing = getActivityById(adminEditingActivityId) || activity;
  if (!existing) {
    appAlert('No saved activity selected yet. Click + New Activity or save a rubric first.', { title: 'No saved activity' });
    return;
  }
  if (!await appConfirm('Restore the default rubric for this activity?', { title: 'Restore default rubric', danger: true })) return;
  const restored = normalizeActivity({
    ...clone(defaultActivity),
    id: existing.id,
    title: existing.title || defaultActivity.title
  });

  const existingIndex = activities.findIndex(item => item.id === restored.id);
  activities[existingIndex] = restored;
  saveActivities();
  selectActivity(restored.id, { keepLanguage: true });
  showAdminForm(restored.id);
  setStatus('Default rubric restored');
}

function getRubricImageEndpoint() {
  return String(window.MCS_RUBRIC_IMAGE_ENDPOINT || '').trim();
}

function isRubricImageImportEnabled() {
  return window.MCS_RUBRIC_IMAGE_IMPORT_ENABLED !== false;
}

function setRubricImportStatus(message, type = '') {
  if (!rubricImageStatus) return;
  rubricImageStatus.textContent = message || '';
  rubricImageStatus.className = `helper-note rubric-import-status ${type}`.trim();
}

function getSelectedRubricImageFile() {
  return rubricImageInput?.files?.[0] || null;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

function clearRubricImageImport() {
  if (rubricImageInput) rubricImageInput.value = '';
  if (rubricImagePreview) rubricImagePreview.removeAttribute('src');
  if (rubricExtractedText) rubricExtractedText.value = '';
  rubricImagePreviewWrap?.classList.add('hidden');
  setRubricImportStatus('No image selected yet.');
}

async function previewRubricImage() {
  const file = getSelectedRubricImageFile();
  if (!file) {
    clearRubricImageImport();
    return;
  }

  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
    setRubricImportStatus('Please select a PNG, JPG, or WEBP image.', 'error');
    return;
  }

  if (file.size > 6 * 1024 * 1024) {
    setRubricImportStatus('Image is too large. Please use an image below 6 MB.', 'error');
    return;
  }

  const dataUrl = await readFileAsDataURL(file);
  if (rubricImagePreview) rubricImagePreview.src = dataUrl;
  rubricImagePreviewWrap?.classList.remove('hidden');
  setRubricImportStatus(`Selected: ${file.name}. Click Read Image & Fill Table.`, 'ready');
}

function normalizeImportedActivity(rawActivity) {
  const safe = rawActivity && typeof rawActivity === 'object' ? rawActivity : {};
  const rawCriteria = Array.isArray(safe.criteria) ? safe.criteria : [];
  const criteria = rawCriteria.map((criterion, index) => {
    const points = getMaxPointsFromCriterion(criterion) || Number(criterion.points) || 4;
    const levels = criterion.levels && typeof criterion.levels === 'object'
      ? criterion.levels
      : rubricLevels.reduce((acc, level) => {
          const levelText = criterion[level.key] || criterion[level.label] || '';
          acc[level.key] = {
            label: level.label,
            points: defaultLevelPoints(points)[level.key],
            description: String(levelText || defaultLevelDescriptions[level.key] || '').trim()
          };
          return acc;
        }, {});

    return normalizeCriterion({
      id: createId(),
      title: criterion.title || criterion.criterion || criterion.name || `Criterion ${index + 1}`,
      points,
      rule: criterion.rule || 'smart_rubric',
      target: criterion.target || '',
      levels
    });
  });

  return normalizeActivity({
    id: adminEditingActivityId || createId(),
    title: safe.title || safe.activityTitle || 'Imported Rubric Activity',
    description: safe.description || safe.instructions || 'Complete the activity based on the imported rubric. Review the rubric table before saving.',
    passingScore: Number(safe.passingScore) || 75,
    criteria: criteria.length ? criteria : clone(defaultActivity.criteria).map(item => normalizeCriterion({ ...item, id: createId() }))
  });
}

function applyImportedActivityToAdminForm(importedActivity) {
  const normalized = normalizeImportedActivity(importedActivity);
  adminActivityTitle.value = normalized.title;
  adminActivityDescription.value = normalized.description;
  adminPassingScore.value = normalized.passingScore;
  renderCriteriaEditor(normalized.criteria);
  setRubricImportStatus('Rubric imported. Please review the table, then click Save Activity.', 'success');
  setStatus('Rubric imported');
}

function getFallbackRubricImportMessage() {
  return 'No online rubric reader is connected, so this app will use the built-in browser image reader. Clear screenshots work best.';
}

function loadRubricOCRLibrary() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (window.__rubricOCRPromise) return window.__rubricOCRPromise;

  window.__rubricOCRPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error('Could not load OCR library.'));
    document.head.appendChild(script);
  });

  return window.__rubricOCRPromise;
}

function normalizeOCRText(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .replace(/[|¦]/g, ' | ')
    .replace(/[•●▪■]/g, '\n- ')
    .replace(/\t+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeRubricLevelKey(label) {
  const value = String(label || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (value.includes('excellent')) return 'excellent';
  if (value.includes('good')) return 'good';
  if (value.includes('fair')) return 'fair';
  if (value.includes('need') && value.includes('improvement')) return 'needsImprovement';
  if (value.includes('poor') || value.includes('beginning')) return 'needsImprovement';
  return '';
}

function countRubricLevelMarkers(text) {
  return [...String(text || '').matchAll(/excellent|good|fair|needs\s*improvement/gi)].length;
}

function cleanCriterionTitle(rawTitle) {
  return String(rawTitle || '')
    .replace(/^\s*(criteria?|criterion)\s*[:\-]?\s*/i, '')
    .replace(/^\s*[-•*]?\s*\d+[.)-]?\s*/, '')
    .replace(/\(?\b\d+(?:\.\d+)?\s*(?:pts?|points?)\)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractScoreValue(text, fallback = null) {
  const source = String(text || '');
  const rangeMatch = source.match(/(\d+(?:\.\d+)?)\s*[-–/]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) return Math.max(Number(rangeMatch[1]), Number(rangeMatch[2]));
  const pointMatch = source.match(/(?:^|\b)(\d+(?:\.\d+)?)(?:\s*(?:pts?|points?|\/\s*\d+))?/i);
  if (pointMatch) return Number(pointMatch[1]);
  return fallback;
}

function stripLeadingScoreText(text) {
  return String(text || '')
    .replace(/^\s*[(:-]*\s*(?:\d+(?:\.\d+)?\s*[-–/]\s*)?\d+(?:\.\d+)?\s*(?:pts?|points?)?\s*[):.-]*\s*/i, '')
    .replace(/^\s*[:\-–|]+\s*/, '')
    .trim();
}

function extractGlobalLevelPoints(text) {
  const defaults = {};
  rubricLevels.forEach(level => {
    const labelPattern = level.label.replace(/\s+/g, '\\s*');
    const regex = new RegExp(labelPattern + '\\s*[:\-–]?\\s*(\\d+(?:\\.\\d+)?)(?:\\s*[-–/]\\s*(\\d+(?:\\.\\d+)?))?', 'i');
    const match = String(text || '').match(regex);
    if (match) {
      const points = Math.max(Number(match[1] || 0), Number(match[2] || 0));
      if (Number.isFinite(points) && points >= 0) defaults[level.key] = points;
    }
  });
  return defaults;
}

function getGenericRubricDescription(levelKey, criterionTitle) {
  const title = criterionTitle || 'this criterion';
  if (levelKey === 'excellent') return `Excellent performance in ${title}.`;
  if (levelKey === 'good') return `Good performance in ${title}.`;
  if (levelKey === 'fair') return `Fair performance in ${title}.`;
  return `Needs improvement in ${title}.`;
}

function splitLineByRubricLevels(text) {
  const source = String(text || '');
  const regex = /(Excellent|Good|Fair|Needs\s*Improvement)/gi;
  const matches = [...source.matchAll(regex)];
  if (matches.length < 2) return null;
  const title = cleanCriterionTitle(source.slice(0, matches[0].index));
  const sections = {};
  matches.forEach((match, index) => {
    const key = normalizeRubricLevelKey(match[0]);
    if (!key) return;
    const start = match.index + match[0].length;
    const end = index < matches.length - 1 ? matches[index + 1].index : source.length;
    sections[key] = source.slice(start, end).trim(' :-|');
  });
  return { title, sections };
}

function isLikelyHeaderLine(line) {
  const text = String(line || '').toLowerCase();
  if (!text) return true;
  return (text.includes('criteria') && countRubricLevelMarkers(text) >= 2)
    || /^activity\s*title/i.test(text)
    || /^passing\s*score/i.test(text)
    || /^teacher/i.test(text)
    || /^upload\s+rubric/i.test(text);
}

function isPotentialCriterionTitle(line) {
  const text = cleanCriterionTitle(line);
  if (!text || text.length < 4) return false;
  if (isLikelyHeaderLine(text)) return false;
  if (countRubricLevelMarkers(text) >= 2) return false;
  if (/^(excellent|good|fair|needs\s*improvement)\b/i.test(text)) return false;
  return true;
}

function guessCriterionRule(criterionTitle, descriptionText = '') {
  const combinedText = `${criterionTitle} ${descriptionText}`;
  const source = combinedText.toLowerCase();
  let target = '';

  const quoted = combinedText.match(/["“”']([^"“”']{2,40})["“”']/);
  if (quoted) target = quoted[1].trim();

  const tagTarget = combinedText.match(/<([a-z0-9-]+)>/i);
  if (tagTarget) target = `<${tagTarget[1].toLowerCase()}`;

  const classOrIdTarget = combinedText.match(/(?:class|id)\s*=\s*["“”']?([a-z0-9_-]{2,40})/i);
  if (!target && classOrIdTarget) target = classOrIdTarget[1].trim();

  const cssPropertyMatch = source.match(/\b(background-color|border-radius|font-family|font-size|text-align|box-shadow|grid-template-columns|justify-content|align-items|background|padding|margin|border|display|color|width|height|gap)\b/);
  const jsKeywordMatch = source.match(/\b(addEventListener|onclick|textContent|innerHTML|classList|querySelector|getElementById|function|alert|console\.log)\b/i);

  // HTML structure and semantic tags
  if (/semantic\s+tags?|semantic\s+html|header|footer|nav|main|section|article|aside/.test(source)) {
    return { rule: 'has_semantic_tags', target: '' };
  }
  if (/(complete|full|basic|required|proper).*(html|document|structure)|doctype|<html|<head|<title|<body/.test(source)) {
    return { rule: 'full_html_structure', target: '' };
  }
  if (/closing tag|closed tag|properly closed|balance[ds]? tag|well[-\s]?organized\s+structure|correct\s+structure/.test(source)) {
    return { rule: 'balanced_html_tags', target: '' };
  }

  // Specific HTML elements
  if (/button or link|link or button|clickable/.test(source)) return { rule: 'has_button_or_link', target: '' };
  if (/heading|header\s+text|title\s+heading|\bh1\b|\bh2\b|\bh3\b/.test(source)) return { rule: 'has_heading', target };
  if (/paragraph|\bp\s*tag|\bp\b/.test(source)) return { rule: 'has_paragraph', target };
  if (/button/.test(source)) return { rule: 'has_button', target };
  if (/hyperlink|anchor|\blink\b|\ba\s*tag/.test(source)) return { rule: 'has_link', target };
  if (/image|picture|photo|\bimg\b/.test(source)) return { rule: 'has_image', target };
  if (/list|bullet|numbered|\bul\b|\bol\b|\bli\b/.test(source)) return { rule: 'has_list', target };

  // CSS/design criteria
  if (/css|style|styling|technical application|visual appeal|design|presentation|layout|aesthetic|consistent design|readability|creative|polish|color|background|font|spacing|border/.test(source)) {
    return { rule: 'uses_css_property', target: cssPropertyMatch ? cssPropertyMatch[1].toLowerCase() : '' };
  }

  // JavaScript criteria
  if (/event listener|onclick|interaction|interactive|click event|button action/.test(source)) return { rule: 'uses_event_listener', target: '' };
  if (/change(s|d)? .*page|dom|innerhtml|textcontent|classlist|style\.|setattribute|appendchild|createelement/.test(source)) return { rule: 'js_changes_page', target: '' };
  if (/javascript|script|function|variable|condition|loop/.test(source)) {
    return { rule: 'js_contains', target: jsKeywordMatch ? jsKeywordMatch[1] : target };
  }
  if (/runtime error|no error|error-free|without errors|working code/.test(source)) return { rule: 'no_runtime_error', target: '' };

  // Output/content criteria
  if (/visible text|readable content|content shown|output text|informative page|difficult to read|easy to read/.test(source)) return { rule: 'output_has_visible_text', target: '' };
  if (/output|preview|display|shows?/.test(source)) return { rule: 'output_contains', target };

  // General instructions / requirements are hard to judge automatically, so use minimum effort.
  if (/following instructions|requirements?|completed|accurately|met|expectations|incomplete|missing|effort/.test(source)) {
    return { rule: 'smart_rubric', target: '' };
  }

  if (/html|tag|element|class|id|structure/.test(source)) return { rule: 'html_contains', target };
  return { rule: 'minimum_effort', target: '' };
}

function buildCriterionFromParsedParts(title, sections, globalPoints = {}) {
  const cleanTitle = cleanCriterionTitle(title) || 'Untitled criterion';
  const explicitMax = extractScoreValue(title, null);
  const sectionScores = {};
  const descriptions = {};

  rubricLevels.forEach(level => {
    const rawText = sections[level.key] || '';
    const score = extractScoreValue(rawText, globalPoints[level.key] ?? null);
    if (Number.isFinite(score)) sectionScores[level.key] = score;
    descriptions[level.key] = stripLeadingScoreText(rawText) || getGenericRubricDescription(level.key, cleanTitle);
  });

  const maxPoints = explicitMax || Math.max(...Object.values(sectionScores).filter(Number.isFinite), 4);
  const defaults = defaultLevelPoints(maxPoints);
  const levels = rubricLevels.reduce((acc, level) => {
    acc[level.key] = {
      label: level.label,
      points: Number.isFinite(sectionScores[level.key]) ? sectionScores[level.key] : (globalPoints[level.key] ?? defaults[level.key]),
      description: descriptions[level.key]
    };
    return acc;
  }, {});

  const ruleInfo = guessCriterionRule(cleanTitle, Object.values(descriptions).join(' '));
  return normalizeCriterion({
    id: createId(),
    title: cleanTitle,
    points: maxPoints,
    rule: ruleInfo.rule,
    target: ruleInfo.target,
    levels
  });
}

function parseCriteriaFromRubricText(text) {
  const normalizedText = normalizeOCRText(text);
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  const globalPoints = extractGlobalLevelPoints(normalizedText);
  const criteria = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || isLikelyHeaderLine(line)) continue;

    const inlineSplit = splitLineByRubricLevels(line);
    if (inlineSplit && inlineSplit.title) {
      criteria.push(buildCriterionFromParsedParts(inlineSplit.title, inlineSplit.sections, globalPoints));
      continue;
    }

    if (isPotentialCriterionTitle(line)) {
      const sectionLines = {};
      let used = 0;
      let j = i + 1;
      while (j < lines.length && used < 8) {
        const nextLine = lines[j];
        if (!nextLine) break;
        if (isPotentialCriterionTitle(nextLine) && !/^(excellent|good|fair|needs\s*improvement)\b/i.test(nextLine)) break;
        const levelMatch = nextLine.match(/^(Excellent|Good|Fair|Needs\s*Improvement)\b\s*[:\-–|]?\s*(.*)$/i);
        if (levelMatch) {
          const key = normalizeRubricLevelKey(levelMatch[1]);
          sectionLines[key] = levelMatch[2].trim();
          used += 1;
          j += 1;
          continue;
        }
        if (countRubricLevelMarkers(nextLine) >= 2) {
          const parsed = splitLineByRubricLevels(nextLine);
          if (parsed) {
            Object.assign(sectionLines, parsed.sections);
            used += 1;
            j += 1;
            break;
          }
        }
        if (Object.keys(sectionLines).length) {
          const lastKey = Object.keys(sectionLines)[Object.keys(sectionLines).length - 1];
          sectionLines[lastKey] = `${sectionLines[lastKey]} ${nextLine}`.trim();
          used += 1;
          j += 1;
          continue;
        }
        break;
      }

      if (Object.keys(sectionLines).length >= 2) {
        criteria.push(buildCriterionFromParsedParts(line, sectionLines, globalPoints));
        i = j - 1;
      }
    }
  }

  if (criteria.length) return criteria;

  const fallbackLines = lines.filter(line => isPotentialCriterionTitle(line)).slice(0, 8);
  return fallbackLines.map((line, index) => {
    const title = cleanCriterionTitle(line) || `Criterion ${index + 1}`;
    const ruleInfo = guessCriterionRule(title, '');
    return normalizeCriterion({
      id: createId(),
      title,
      points: 4,
      rule: ruleInfo.rule,
      target: ruleInfo.target,
      levels: normalizeLevels(null, 4)
    });
  });
}

function guessImportedActivityTitle(lines) {
  const candidates = lines.filter(line => {
    const lower = line.toLowerCase();
    return line.length > 4
      && line.length < 100
      && !isLikelyHeaderLine(line)
      && !/^(excellent|good|fair|needs\s*improvement)\b/i.test(lower)
      && !/^\d+(?:\.\d+)?\s*(pts?|points?)?$/i.test(lower);
  });
  const explicit = candidates.find(line => /activity|performance task|project|rubric/i.test(line));
  return explicit || candidates[0] || 'Imported Rubric Activity';
}

function guessImportedActivityDescription(lines, title) {
  const titleIndex = lines.findIndex(line => line === title);
  const from = titleIndex >= 0 ? titleIndex + 1 : 1;
  const descriptionLines = lines.slice(from, Math.min(from + 4, lines.length))
    .filter(line => !isLikelyHeaderLine(line) && countRubricLevelMarkers(line) < 2 && line.length > 12);
  if (descriptionLines.length) return descriptionLines.join(' ');
  return 'Complete the activity based on the uploaded rubric. Review the imported rows before saving.';
}

function parseImportedActivityFromText(text) {
  const normalizedText = normalizeOCRText(text);
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  const title = guessImportedActivityTitle(lines);
  const description = guessImportedActivityDescription(lines, title);
  const passingMatch = normalizedText.match(/passing\s*score\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
  const passingScore = passingMatch ? Number(passingMatch[1]) : 75;
  const criteria = parseCriteriaFromRubricText(normalizedText);
  return normalizeImportedActivity({ title, description, passingScore, criteria });
}

function fillRubricTableFromExtractedText() {
  const text = rubricExtractedText?.value?.trim() || '';
  if (!text) {
    setRubricImportStatus('No extracted text yet. Upload an image first or paste rubric text into the box.', 'error');
    return;
  }
  const imported = parseImportedActivityFromText(text);
  applyImportedActivityToAdminForm(imported);
}

async function runLocalRubricOCR(file) {
  const Tesseract = await loadRubricOCRLibrary();
  const result = await Tesseract.recognize(file, 'eng', {
    logger: message => {
      if (message?.status === 'recognizing text' && Number.isFinite(message.progress)) {
        setRubricImportStatus(`Reading image... ${Math.round(message.progress * 100)}%`, 'loading');
      }
    }
  });
  return normalizeOCRText(result?.data?.text || '');
}



/* Fixed 5-column rubric reader for Sir JR's rubric image format.
   Expected columns:
   1) Criteria
   2) Excellent
   3) Good
   4) Fair
   5) Needs Improvement
*/

function safeRubricWordText(word) {
  return String(word?.text || word?.symbols?.map(symbol => symbol.text).join('') || '').trim();
}

function getRubricWordBox(word) {
  const box = word?.bbox || word?.boundingBox || {};
  const x0 = Number(box.x0 ?? box.left ?? box.x ?? 0);
  const y0 = Number(box.y0 ?? box.top ?? box.y ?? 0);
  const x1 = Number(box.x1 ?? (Number.isFinite(Number(box.width)) ? x0 + Number(box.width) : x0));
  const y1 = Number(box.y1 ?? (Number.isFinite(Number(box.height)) ? y0 + Number(box.height) : y0));
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, h: Math.max(1, y1 - y0) };
}

function normalizeRubricOCRWords(words) {
  return (Array.isArray(words) ? words : [])
    .map(word => {
      const text = safeRubricWordText(word);
      const box = getRubricWordBox(word);
      return text ? { text, ...box } : null;
    })
    .filter(Boolean)
    .filter(word => Number.isFinite(word.cx) && Number.isFinite(word.cy));
}

function groupRubricWordsIntoLines(words) {
  const cleanWords = normalizeRubricOCRWords(words).sort((a, b) => a.cy - b.cy || a.x0 - b.x0);
  const lines = [];

  cleanWords.forEach(word => {
    const tolerance = Math.max(8, word.h * 0.65);
    let line = lines.find(item => Math.abs(item.cy - word.cy) <= tolerance);
    if (!line) {
      line = { cy: word.cy, words: [] };
      lines.push(line);
    }
    line.words.push(word);
    line.cy = line.words.reduce((sum, item) => sum + item.cy, 0) / line.words.length;
  });

  return lines
    .map(line => ({
      cy: line.cy,
      words: line.words.sort((a, b) => a.x0 - b.x0),
      text: line.words.sort((a, b) => a.x0 - b.x0).map(word => word.text).join(' ')
    }))
    .sort((a, b) => a.cy - b.cy);
}

function detectFiveRubricColumnCenters(words) {
  const cleanWords = normalizeRubricOCRWords(words);
  if (!cleanWords.length) return null;

  const byText = cleanWords.map(word => ({ ...word, lower: word.text.toLowerCase().replace(/[^a-z]/g, '') }));
  const findCenter = patterns => {
    const matches = byText.filter(word => patterns.some(pattern => pattern.test(word.lower)));
    if (!matches.length) return null;
    return matches.reduce((sum, word) => sum + word.cx, 0) / matches.length;
  };

  const criteriaX = findCenter([/^criteria?$/, /^criterion$/]);
  const excellentX = findCenter([/^excellent$/, /^advanced$/, /^outstanding$/]);
  const goodX = findCenter([/^good$/, /^proficient$/]);
  const fairX = findCenter([/^fair$/, /^developing$/, /^satisfactory$/]);

  const needsWords = byText.filter(word => /^needs?$/.test(word.lower));
  const improvementWords = byText.filter(word => /^improvements?$/.test(word.lower));
  let needsX = null;
  if (needsWords.length && improvementWords.length) {
    const pairs = [];
    needsWords.forEach(needs => {
      improvementWords.forEach(improvement => {
        const distance = Math.abs(needs.cy - improvement.cy) + Math.abs(needs.cx - improvement.cx) * 0.15;
        pairs.push({ needs, improvement, distance });
      });
    });
    pairs.sort((a, b) => a.distance - b.distance);
    const best = pairs[0];
    needsX = best ? (best.needs.cx + best.improvement.cx) / 2 : null;
  } else {
    needsX = findCenter([/^needsimprovement$/, /^poor$/, /^beginning$/]);
  }

  let centers = [criteriaX, excellentX, goodX, fairX, needsX];
  const validCenters = centers.filter(value => Number.isFinite(value));

  if (validCenters.length >= 4) {
    const minX = Math.min(...validCenters);
    const maxX = Math.max(...validCenters);
    const width = Math.max(1, maxX - minX);
    centers = centers.map((value, index) => Number.isFinite(value) ? value : minX + (width * index / 4));
    return centers.sort((a, b) => a - b);
  }

  const minX = Math.min(...cleanWords.map(word => word.x0));
  const maxX = Math.max(...cleanWords.map(word => word.x1));
  const width = Math.max(1, maxX - minX);
  return [0.1, 0.32, 0.52, 0.7, 0.88].map(ratio => minX + width * ratio);
}

function getColumnIndexFromCenters(x, centers) {
  if (!Array.isArray(centers) || centers.length !== 5) return 0;
  const boundaries = [
    -Infinity,
    (centers[0] + centers[1]) / 2,
    (centers[1] + centers[2]) / 2,
    (centers[2] + centers[3]) / 2,
    (centers[3] + centers[4]) / 2,
    Infinity
  ];
  for (let i = 0; i < 5; i += 1) {
    if (x >= boundaries[i] && x < boundaries[i + 1]) return i;
  }
  return 0;
}

function lineWordsToFiveCells(line, centers) {
  const cells = ['', '', '', '', ''];
  (line?.words || []).forEach(word => {
    const index = getColumnIndexFromCenters(word.cx, centers);
    cells[index] = `${cells[index]} ${word.text}`.trim();
  });
  return cells.map(cell => cell.trim());
}

function isFiveColumnHeaderCells(cells) {
  const joined = cells.join(' ').toLowerCase();
  return /criteria?|criterion/.test(joined)
    && /excellent/.test(joined)
    && /\bgood\b/.test(joined)
    && /\bfair\b/.test(joined)
    && /needs?\s*improvement/.test(joined);
}

function normalizeFiveColumnCellsToCriterion(cells, globalPoints = {}) {
  const title = cleanCriterionTitle(cells[0]);
  if (!title || title.length < 3) return null;

  const sections = {
    excellent: cells[1] || '',
    good: cells[2] || '',
    fair: cells[3] || '',
    needsImprovement: cells[4] || ''
  };

  const hasUsefulLevelText = Object.values(sections).some(value => String(value || '').trim().length > 4);
  if (!hasUsefulLevelText) return null;

  return buildCriterionFromParsedParts(title, sections, globalPoints);
}

function parseFiveColumnRubricFromOCRResult(ocrResult) {
  const words = ocrResult?.data?.words || ocrResult?.words || [];
  const cleanWords = normalizeRubricOCRWords(words);
  if (cleanWords.length < 10) return [];

  const centers = detectFiveRubricColumnCenters(cleanWords);
  if (!centers) return [];

  const lines = groupRubricWordsIntoLines(cleanWords);
  const globalPoints = extractGlobalLevelPoints(ocrResult?.data?.text || ocrResult?.text || '');
  const rows = [];
  let current = null;

  lines.forEach(line => {
    const cells = lineWordsToFiveCells(line, centers);
    const rowText = cells.join(' ').trim();
    if (!rowText || isFiveColumnHeaderCells(cells) || isLikelyHeaderLine(rowText)) return;

    const hasCriteriaText = cells[0].trim().length > 0;
    const hasLevelText = cells.slice(1).some(cell => cell.trim().length > 0);

    if (hasCriteriaText && hasLevelText) {
      current = cells;
      rows.push(current);
      return;
    }

    if (current && hasLevelText) {
      for (let i = 1; i < 5; i += 1) {
        if (cells[i]) current[i] = `${current[i]} ${cells[i]}`.trim();
      }
      return;
    }

    if (current && hasCriteriaText && !hasLevelText) {
      current[0] = `${current[0]} ${cells[0]}`.trim();
    }
  });

  return rows
    .map(cells => normalizeFiveColumnCellsToCriterion(cells, globalPoints))
    .filter(Boolean);
}

function splitFixedRubricLineIntoFiveCells(line) {
  const source = String(line || '').trim();
  if (!source) return null;

  if (source.includes('|')) {
    const parts = source.split('|').map(part => part.trim()).filter(Boolean);
    if (parts.length >= 5) return [parts[0], parts[1], parts[2], parts[3], parts.slice(4).join(' ')];
  }

  if (/\t/.test(source)) {
    const parts = source.split(/\t+/).map(part => part.trim()).filter(Boolean);
    if (parts.length >= 5) return [parts[0], parts[1], parts[2], parts[3], parts.slice(4).join(' ')];
  }

  const spaced = source.split(/\s{3,}/).map(part => part.trim()).filter(Boolean);
  if (spaced.length >= 5) return [spaced[0], spaced[1], spaced[2], spaced[3], spaced.slice(4).join(' ')];

  const levelSplit = splitLineByRubricLevels(source);
  if (levelSplit && levelSplit.title) {
    return [
      levelSplit.title,
      levelSplit.sections.excellent || '',
      levelSplit.sections.good || '',
      levelSplit.sections.fair || '',
      levelSplit.sections.needsImprovement || ''
    ];
  }

  return null;
}

function parseFiveColumnRubricFromText(text) {
  const normalizedText = normalizeOCRText(text);
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  const globalPoints = extractGlobalLevelPoints(normalizedText);
  const rows = [];
  let current = null;
  let headerSeen = false;

  lines.forEach(line => {
    const cells = splitFixedRubricLineIntoFiveCells(line);

    if (cells) {
      if (isFiveColumnHeaderCells(cells)) {
        headerSeen = true;
        return;
      }

      const candidate = normalizeFiveColumnCellsToCriterion(cells, globalPoints);
      if (candidate) {
        rows.push(candidate);
        current = rows[rows.length - 1];
      }
      return;
    }

    if (!headerSeen && isLikelyHeaderLine(line)) return;

    const levelMatch = line.match(/^(Excellent|Good|Fair|Needs\s*Improvement)\b\s*[:\-–|]?\s*(.*)$/i);
    if (current && levelMatch) {
      const key = normalizeRubricLevelKey(levelMatch[1]);
      const rawText = levelMatch[2].trim();
      const oldLevels = normalizeLevels(current.levels, current.points);
      oldLevels[key] = {
        ...oldLevels[key],
        description: `${oldLevels[key]?.description || ''} ${stripLeadingScoreText(rawText)}`.trim(),
        points: extractScoreValue(rawText, oldLevels[key]?.points)
      };
      current.levels = oldLevels;
    }
  });

  return rows;
}

// Override the earlier general parser: try the expected 5-column table first.
const parseCriteriaFromRubricTextGeneral = parseCriteriaFromRubricText;
function parseCriteriaFromRubricText(text) {
  const fixedTableCriteria = parseFiveColumnRubricFromText(text);
  if (fixedTableCriteria.length) return fixedTableCriteria;
  return parseCriteriaFromRubricTextGeneral(text);
}

// Override local OCR: use word positions so the app knows the left column is Criteria and columns 2-5 are levels.
async function runLocalRubricOCR(file) {
  const Tesseract = await loadRubricOCRLibrary();
  const result = await Tesseract.recognize(file, 'eng', {
    logger: message => {
      if (message?.status === 'recognizing text' && Number.isFinite(message.progress)) {
        setRubricImportStatus(`Reading image table... ${Math.round(message.progress * 100)}%`, 'loading');
      }
    }
  });

  const extractedText = normalizeOCRText(result?.data?.text || '');
  const criteriaFromLayout = parseFiveColumnRubricFromOCRResult(result);
  window.__lastRubricOCRActivity = criteriaFromLayout.length
    ? normalizeImportedActivity({
        title: 'Imported Rubric Activity',
        description: 'Complete the activity based on the uploaded 5-column rubric. Review the imported rows before saving.',
        passingScore: 75,
        criteria: criteriaFromLayout
      })
    : null;

  return extractedText;
}


async function importRubricImage() {
  if (!isRubricImageImportEnabled()) {
    setRubricImportStatus('Rubric image import is disabled in firebase-config.js.', 'error');
    return;
  }

  const file = getSelectedRubricImageFile();
  if (!file) {
    setRubricImportStatus('Choose a rubric image first.', 'error');
    return;
  }

  const endpoint = getRubricImageEndpoint();

  try {
    importRubricImageBtn.disabled = true;
    importRubricImageBtn.textContent = 'Reading image...';
    setRubricImportStatus(endpoint ? 'Reading rubric image. Please wait...' : 'No online reader detected. Using built-in browser image reader...', 'loading');

    let importedActivity = null;

    if (endpoint) {
      const imageDataUrl = await readFileAsDataURL(file);
      const currentUser = firebaseSync.auth?.currentUser || firebaseSync.currentUser;
      let idToken = '';
      if (currentUser && typeof currentUser.getIdToken === 'function') {
        idToken = await currentUser.getIdToken();
      }

      const headers = { 'Content-Type': 'application/json' };
      if (idToken) headers.Authorization = `Bearer ${idToken}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageDataUrl,
          filename: file.name,
          mimeType: file.type,
          currentActivityTitle: adminActivityTitle?.value || '',
          expectedLevels: rubricLevels.map(item => item.label)
        })
      });

      if (!response.ok) throw new Error(`Image import endpoint returned ${response.status}`);
      const data = await response.json();
      importedActivity = data.activity || data.rubric || data;
      if (rubricExtractedText && data.extractedText) rubricExtractedText.value = normalizeOCRText(data.extractedText);
    } else {
      const extractedText = await runLocalRubricOCR(file);
      if (rubricExtractedText) rubricExtractedText.value = extractedText;
      importedActivity = window.__lastRubricOCRActivity || parseImportedActivityFromText(extractedText);
    }

    applyImportedActivityToAdminForm(importedActivity);
  } catch (error) {
    console.warn('Rubric image import failed', error);
    setRubricImportStatus('Could not read the rubric image. Try a clearer screenshot, then review/edit the extracted text.', 'error');
  } finally {
    importRubricImageBtn.disabled = false;
    importRubricImageBtn.textContent = 'Read Image & Fill Table';
  }
}


function setManualRubricStatus(message, type = '') {
  if (!manualRubricStatus) return;
  manualRubricStatus.textContent = message || '';
  manualRubricStatus.className = `helper-note manual-rubric-status ${type}`.trim();
}

function getManualRubricScore(input, fallback) {
  const value = Number(input?.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function getManualRubricScoreMap() {
  return {
    excellent: getManualRubricScore(manualExcellentScore, 10),
    good: getManualRubricScore(manualGoodScore, 8),
    fair: getManualRubricScore(manualFairScore, 6),
    needsImprovement: getManualRubricScore(manualNeedsScore, 4)
  };
}

function createManualRubricTextarea(className, placeholder, value = '') {
  const textarea = document.createElement('textarea');
  textarea.className = className;
  textarea.rows = className.includes('manual-criteria-input') ? 3 : 4;
  textarea.placeholder = placeholder;
  textarea.value = value || '';
  return textarea;
}

function addManualRubricInputRow(data = {}) {
  if (!manualRubricInputBody) return;

  const row = document.createElement('tr');
  row.className = 'manual-rubric-input-row';

  const cells = [
    { key: 'criteria', className: 'manual-criteria-input', placeholder: 'Example: HTML Structure & Semantic Tags' },
    { key: 'excellent', className: 'manual-level-input', placeholder: 'All requirements completed accurately; exceeded expectations' },
    { key: 'good', className: 'manual-level-input', placeholder: 'Most requirements completed properly' },
    { key: 'fair', className: 'manual-level-input', placeholder: 'Some requirements missing or inaccurate' },
    { key: 'needsImprovement', className: 'manual-level-input', placeholder: 'Few requirements met; needs improvement' }
  ];

  const cellLabels = {
    criteria: 'Criteria',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Satisfactory / Fair',
    needsImprovement: 'Needs Improvement'
  };

  cells.forEach(cellInfo => {
    const cell = document.createElement('td');
    cell.dataset.label = cellLabels[cellInfo.key] || cellInfo.key;
    cell.appendChild(createManualRubricTextarea(cellInfo.className, cellInfo.placeholder, data[cellInfo.key] || ''));
    row.appendChild(cell);
  });

  const actionCell = document.createElement('td');
  actionCell.dataset.label = 'Action';
  actionCell.className = 'manual-rubric-row-action';
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'ghost-btn danger remove-manual-rubric-row';
  removeButton.textContent = 'Remove';
  actionCell.appendChild(removeButton);
  row.appendChild(actionCell);

  manualRubricInputBody.appendChild(row);
}

function ensureManualRubricRows() {
  if (!manualRubricInputBody) return;
  if (manualRubricInputBody.children.length) return;
  for (let index = 0; index < 4; index += 1) {
    addManualRubricInputRow();
  }
}

function clearManualRubricInputTable() {
  if (!manualRubricInputBody) return;
  manualRubricInputBody.innerHTML = '';
  ensureManualRubricRows();
  setManualRubricStatus('Input table cleared. Type your rubric again, then click Apply + Smart Rubric Checker.');
}

function collectManualRubricInputCriteria() {
  if (!manualRubricInputBody) return [];
  const scores = getManualRubricScoreMap();
  const rows = [...manualRubricInputBody.querySelectorAll('.manual-rubric-input-row')];

  return rows.map((row, index) => {
    const criterionTitle = row.querySelector('.manual-criteria-input')?.value.trim() || '';
    const excellent = row.querySelector('td[data-label="excellent"] textarea')?.value.trim() || '';
    const good = row.querySelector('td[data-label="good"] textarea')?.value.trim() || '';
    const fair = row.querySelector('td[data-label="fair"] textarea')?.value.trim() || '';
    const needsImprovement = row.querySelector('td[data-label="needsImprovement"] textarea')?.value.trim() || '';
    const hasAnyText = [criterionTitle, excellent, good, fair, needsImprovement].some(Boolean);
    if (!hasAnyText) return null;

    const cleanTitle = criterionTitle || `Criterion ${index + 1}`;
    return buildCriterionFromParsedParts(cleanTitle, {
      excellent,
      good,
      fair,
      needsImprovement
    }, scores);
  }).filter(Boolean);
}

function applyManualRubricTableToActualRubric() {
  const criteria = collectManualRubricInputCriteria();
  if (!criteria.length) {
    setManualRubricStatus('Please type at least one criterion and description before applying.', 'error');
    return;
  }

  const imported = normalizeImportedActivity({
    id: adminEditingActivityId || createId(),
    title: adminActivityTitle?.value?.trim() || 'Manual Rubric Activity',
    description: adminActivityDescription?.value?.trim() || 'Complete the activity based on the teacher rubric.',
    passingScore: Number(adminPassingScore?.value) || 75,
    criteria
  });

  applyImportedActivityToAdminForm(imported);
  setManualRubricStatus(`Applied ${criteria.length} row${criteria.length === 1 ? '' : 's'} and generated smart rubric checks. Review them, then click Save Activity.`, 'success');
}

function initManualRubricInputTable() {
  ensureManualRubricRows();
  setManualRubricStatus('Type your rubric here, then click Apply + Smart Rubric Checker.');
}

function updateCriterionHelp(event) {
  const select = event.target.closest('.criterion-rule');
  if (!select) return;
  const card = select.closest('.rubric-table-row') || select.closest('.criterion-card');
  if (!card) return;
  const help = card.querySelector('.criterion-help');
  if (!help) return;
  help.textContent = ruleHelp[select.value] || '';
}


function renderFileNameInputs() {
  const names = getCodeFileNames();
  if (htmlFileNameInput) htmlFileNameInput.value = getActiveHtmlPageName();
  if (cssFileNameInput) cssFileNameInput.value = names.css;
  if (jsFileNameInput) jsFileNameInput.value = names.js;
  if (fileNameDialogNote) {
    const pages = getHTMLPageNames();
    const cssFiles = getLanguageFileNames('css');
    const jsFiles = getLanguageFileNames('js');
    fileNameDialogNote.textContent = `Current files: ${pages.join(', ')} | CSS: ${cssFiles.join(', ')} | JS: ${jsFiles.join(', ')}`;
  }
}

function shouldPlaceFileNameDialogInsideEditor() {
  return Boolean(
    editorPanel &&
    (
      document.fullscreenElement === editorPanel ||
      document.webkitFullscreenElement === editorPanel ||
      document.body.classList.contains('editor-fullscreen-active')
    )
  );
}

function placeFileNameDialogForCurrentMode() {
  if (!fileNameDialogOverlay) return;
  const target = shouldPlaceFileNameDialogInsideEditor() ? editorPanel : document.body;
  if (target && fileNameDialogOverlay.parentElement !== target) {
    target.appendChild(fileNameDialogOverlay);
  }
  fileNameDialogOverlay.classList.toggle('inside-editor-fullscreen', target === editorPanel);
}

function restoreFileNameDialogToBody() {
  if (!fileNameDialogOverlay) return;
  fileNameDialogOverlay.classList.remove('inside-editor-fullscreen');
  if (fileNameDialogOverlay.parentElement !== document.body) {
    document.body.appendChild(fileNameDialogOverlay);
  }
}

function openFileNameDialog() {
  if (!fileNameDialogOverlay) return;
  renderFileNameInputs();
  placeFileNameDialogForCurrentMode();
  fileNameDialogOverlay.classList.remove('hidden');
  document.body.classList.add('dialog-open');
  window.setTimeout(() => htmlFileNameInput?.focus({ preventScroll: true }), 0);
}

function closeFileNameDialog() {
  if (!fileNameDialogOverlay) return;
  fileNameDialogOverlay.classList.add('hidden');
  document.body.classList.remove('dialog-open');
  restoreFileNameDialogToBody();
  renameFilesBtn?.focus({ preventScroll: true });
}


function applyFileNameDialogValues() {
  const previousActivePage = getActiveHtmlPageName();
  const previousCssFile = getActiveLanguageFileName('css');
  const previousJsFile = getActiveLanguageFileName('js');
  const nextNames = normalizeCodeFileNames({
    html: htmlFileNameInput?.value || DEFAULT_CODE_FILE_NAMES.html,
    css: cssFileNameInput?.value || DEFAULT_CODE_FILE_NAMES.css,
    js: jsFileNameInput?.value || DEFAULT_CODE_FILE_NAMES.js
  });

  const pages = getHTMLPages();
  if (nextNames.html !== previousActivePage) {
    if (!pages[nextNames.html]) {
      pages[nextNames.html] = pages[previousActivePage] || codeStore.html || '';
      delete pages[previousActivePage];
      replaceHtmlFileReferences(previousActivePage, nextNames.html, 'html');
    }
    codeStore.activeHtmlPage = nextNames.html;
  }

  const cssFiles = getLanguageFileMap('css');
  if (nextNames.css !== previousCssFile) {
    if (!cssFiles[nextNames.css]) {
      cssFiles[nextNames.css] = cssFiles[previousCssFile] || codeStore.css || '';
      delete cssFiles[previousCssFile];
      replaceHtmlFileReferences(previousCssFile, nextNames.css, 'css');
    }
    codeStore.activeCssFile = nextNames.css;
  }

  const jsFiles = getLanguageFileMap('js');
  if (nextNames.js !== previousJsFile) {
    if (!jsFiles[nextNames.js]) {
      jsFiles[nextNames.js] = jsFiles[previousJsFile] || codeStore.js || '';
      delete jsFiles[previousJsFile];
      replaceHtmlFileReferences(previousJsFile, nextNames.js, 'js');
    }
    codeStore.activeJsFile = nextNames.js;
  }

  codeFileNames = nextNames;
  syncActiveLanguageFileFromStore('html');
  syncActiveLanguageFileFromStore('css');
  syncActiveLanguageFileFromStore('js');
  saveCodeFileNames();
  saveCodeStoreForCurrentActivity();
  renderHTMLPageManager();
  renderErrorChecker();
  loadActiveEditor();
  runCode(false, { scroll: false });
  closeFileNameDialog();
  setStatus('File names updated');
}

function resetFileNameDialogDefaults() {
  if (htmlFileNameInput) htmlFileNameInput.value = DEFAULT_CODE_FILE_NAMES.html;
  if (cssFileNameInput) cssFileNameInput.value = DEFAULT_CODE_FILE_NAMES.css;
  if (jsFileNameInput) jsFileNameInput.value = DEFAULT_CODE_FILE_NAMES.js;
  if (fileNameDialogNote) fileNameDialogNote.textContent = 'Defaults restored. Click Apply Names to save.';
}

function getCompactStatusLabel(text) {
  const value = String(text || '').toLowerCase();
  if (!value || value === 'ready') return 'Ready';
  if (value.includes('fail') || value.includes('error') || value.includes('required') || value.includes('choose activity')) return 'Notice';
  if (value.includes('save') || value.includes('saved') || value.includes('download')) return 'Saved';
  if (value.includes('check') || value.includes('score') || value.includes('rubric') || value.includes('result')) return 'Checked';
  if (value.includes('feedback') || value.includes('review')) return 'Feedback';
  if (value.includes('run') || value.includes('output')) return 'Run';
  if (value.includes('editor') || value.includes('tab') || value.includes('zoom')) return 'Editor';
  if (value.includes('firebase') || value.includes('cloud') || value.includes('local')) return 'Ready';
  if (value.includes('login') || value.includes('teacher')) return 'Admin';
  return 'Ready';
}

function setStatus(text) {
  const fullText = String(text || 'Ready');
  statusBadge.textContent = getCompactStatusLabel(fullText);
  statusBadge.title = fullText;
  clearTimeout(setStatus.timer);
  setStatus.timer = setTimeout(() => {
    statusBadge.textContent = 'Ready';
    statusBadge.title = 'Ready';
  }, 1400);
}


function sanitizeFilename(value) {
  const cleaned = String(value || 'student-code')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'student-code';
}

function getCurrentDateStamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ensureDownloadIndexHTML(html, hasCSS, hasJS, fileNames = getCodeFileNames()) {
  let output = html || '';
  const names = normalizeCodeFileNames(fileNames);
  const cssLink = `  <link rel="stylesheet" href="${names.css}">`;
  const jsScript = `  <script src="${names.js}"><\/script>`;
  const looksLikeFullDocument = /<!doctype/i.test(output) || /<html(\s|>)/i.test(output) || /<head(\s|>)/i.test(output) || /<body(\s|>)/i.test(output);
  const cssReferences = getExternalCSSReferences(output);
  const jsReferences = getExternalJSReferences(output);

  if (!looksLikeFullDocument) {
    return `<!DOCTYPE html>
<html>
  <head>
    <title>Student Output</title>${hasCSS ? `\n${cssLink}` : ''}
  </head>
  <body>
${output}
${hasJS ? `\n${jsScript}` : ''}
  </body>
</html>`;
  }

  // If the student already added an external link/script, preserve it.
  // This allows wrong filenames to behave like real web files: mismatched names will not work.
  if (hasCSS && !cssReferences.length) {
    if (/<\/head\s*>/i.test(output)) {
      output = output.replace(/<\/head\s*>/i, `${cssLink}\n</head>`);
    } else if (/<body(\s|>)/i.test(output)) {
      output = output.replace(/<body(\s|>)/i, `${cssLink}\n$&`);
    } else {
      output = `${cssLink}\n${output}`;
    }
  }

  if (hasJS && !jsReferences.length) {
    if (/<\/body\s*>/i.test(output)) {
      output = output.replace(/<\/body\s*>/i, `${jsScript}\n</body>`);
    } else {
      output = `${output}\n${jsScript}`;
    }
  }

  return output;
}


function makeReadmeFile() {
  const title = activity?.title || 'No selected activity';
  const instructions = activity?.description || 'No selected activity instructions.';
  const pageNames = getHTMLPageNames();
  const cssNames = getLanguageFileNames('css');
  const jsNames = getLanguageFileNames('js');
  return [
    'Grade 8 MCSian Web Code Editor - Saved Code',
    '================================',
    '',
    `Activity: ${title}`,
    `Saved: ${new Date().toLocaleString()}`,
    '',
    'HTML pages included:',
    ...pageNames.map(name => `- ${name}`),
    '',
    'CSS files included:',
    ...cssNames.map(name => `- ${name}`),
    '',
    'JavaScript files included:',
    ...jsNames.map(name => `- ${name}`),
    '',
    'How to open:',
    '1. Extract this ZIP file.',
    `2. Open ${pageNames.includes('index.html') ? 'index.html' : pageNames[0]} in a browser.`,
    '3. Use the page links to move between pages.',
    '',
    'Activity instructions:',
    instructions,
    '',
    'Note:',
    'If HTML uses external CSS/JS links, the href/src names must match included CSS and JS files.',
    'For multi-page websites, links like href="about.html" must match an included page file.'
  ].join('\n');
}

function makeCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crc32Table = makeCRC32Table();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crc32Table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function littleEndian16(value) {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function littleEndian32(value) {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  ]);
}

function concatUint8Arrays(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach(part => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function getZipDateTime() {
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  return { time, date };
}

function createZipBlob(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, date } = getZipDateTime();

  files.forEach(file => {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content || '');
    const checksum = crc32(contentBytes);
    const size = contentBytes.length;

    const localHeader = concatUint8Arrays([
      littleEndian32(0x04034b50),
      littleEndian16(20),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(time),
      littleEndian16(date),
      littleEndian32(checksum),
      littleEndian32(size),
      littleEndian32(size),
      littleEndian16(nameBytes.length),
      littleEndian16(0),
      nameBytes
    ]);

    localParts.push(localHeader, contentBytes);

    const centralHeader = concatUint8Arrays([
      littleEndian32(0x02014b50),
      littleEndian16(20),
      littleEndian16(20),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(time),
      littleEndian16(date),
      littleEndian32(checksum),
      littleEndian32(size),
      littleEndian32(size),
      littleEndian16(nameBytes.length),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian16(0),
      littleEndian32(0),
      littleEndian32(offset),
      nameBytes
    ]);

    centralParts.push(centralHeader);
    offset += localHeader.length + contentBytes.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = concatUint8Arrays([
    littleEndian32(0x06054b50),
    littleEndian16(0),
    littleEndian16(0),
    littleEndian16(files.length),
    littleEndian16(files.length),
    littleEndian32(centralDirectory.length),
    littleEndian32(offset),
    littleEndian16(0)
  ]);

  return new Blob([concatUint8Arrays([...localParts, centralDirectory, endRecord])], { type: 'application/zip' });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}


function downloadCodeAsZip() {
  saveActiveEditor();
  const pages = getHTMLPages();
  const cssFiles = getLanguageFileMap('css');
  const jsFiles = getLanguageFileMap('js');
  const pageFiles = getHTMLPageNames().map(pageName => ({
    name: pageName,
    content: ensureDownloadIndexHTML(
      pages[pageName] || '',
      Object.values(cssFiles).some(value => String(value || '').trim()),
      Object.values(jsFiles).some(value => String(value || '').trim()),
      getCodeFileNames()
    )
  }));
  const cssZipFiles = getLanguageFileNames('css').map(name => ({ name, content: cssFiles[name] || '' }));
  const jsZipFiles = getLanguageFileNames('js').map(name => ({ name, content: jsFiles[name] || '' }));
  const files = [
    ...pageFiles,
    ...cssZipFiles,
    ...jsZipFiles,
    { name: 'README.txt', content: makeReadmeFile() }
  ];
  const filename = `${sanitizeFilename(activity?.title || 'student-code')}-${getCurrentDateStamp()}.zip`;
  const blob = createZipBlob(files);
  downloadBlob(blob, filename);
  setStatus(pageFiles.length > 1 ? 'Website ZIP downloaded' : 'ZIP downloaded');
}

function saveNow() {
  saveActiveEditor();
  setStatus('Saved locally');
}

function setActivityCardOpen(isOpen) {
  if (!activityCard || !stepActivityBtn) return;
  activityCard.classList.toggle('collapsed-card', !isOpen);
  document.body.classList.toggle('activity-popup-open', Boolean(isOpen));
  stepActivityBtn.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    window.setTimeout(() => activitySelect?.focus(), 40);
  }
}

function toggleActivityCard() {
  const isHidden = activityCard?.classList.contains('collapsed-card');
  setActivityCardOpen(Boolean(isHidden));
}

function closeActivityCard() {
  setActivityCardOpen(false);
}

function clearActivityRequiredWarning() {
  stepActivityBtn?.classList.remove('needs-attention');
  activityCard?.classList.remove('needs-attention');
  activityWarning?.classList.add('hidden');
  updateActivityButtonState();
}

function showActivityRequiredWarning() {
  setActivityCardOpen(true);
  stepActivityBtn?.classList.add('needs-attention');
  activityCard?.classList.add('needs-attention');
  activityWarning?.classList.remove('hidden');
  updateActivityButtonState();
}

function focusEditorStep() {
  if (!activity) {
    showActivityRequiredWarning();
  } else {
    clearActivityRequiredWarning();
  }

  scrollElementIntoSafeView(editorPanel);
  window.setTimeout(() => editor.focus(), 250);
}

function switchLanguageByIndex(index) {
  const languages = ['html', 'css', 'js'];
  const nextLanguage = languages[index];
  if (!nextLanguage || nextLanguage === activeLanguage) return;

  const targetButton = [...tabButtons].find(button => button.dataset.language === nextLanguage);
  if (!targetButton) return;

  saveActiveEditor();
  activeLanguage = nextLanguage;
  tabButtons.forEach(tab => tab.classList.toggle('active', tab === targetButton));
  loadActiveEditor();
  setStatus(`${nextLanguage.toUpperCase()} tab`);
}

function getLineIndentBeforeCursor(text, cursor) {
  const lineStart = text.lastIndexOf('\n', Math.max(0, cursor - 1)) + 1;
  const currentLineBeforeCursor = text.slice(lineStart, cursor);
  const indentMatch = currentLineBeforeCursor.match(/^\s*/);
  return {
    lineStart,
    lineBeforeCursor: currentLineBeforeCursor,
    indent: indentMatch ? indentMatch[0] : ''
  };
}

function getHTMLIndentInsert(text, start, end, baseIndent) {
  const beforeOnLine = text.slice(text.lastIndexOf('\n', Math.max(0, start - 1)) + 1, start);
  const afterSelection = text.slice(end);
  const openTagMatch = beforeOnLine.match(/<([A-Za-z][A-Za-z0-9:-]*)(?:\s[^<>]*?)?>\s*$/);
  const closingTagMatch = afterSelection.match(/^\s*<\/([A-Za-z][A-Za-z0-9:-]*)\s*>/);

  if (!openTagMatch) return `\n${baseIndent}`;

  const tagName = openTagMatch[1].toLowerCase();
  const fullOpenTag = openTagMatch[0];
  const isSelfClosing = /\/\s*>\s*$/.test(fullOpenTag) || selfClosingTagNames.has(tagName);

  if (isSelfClosing) return `\n${baseIndent}`;

  const innerIndent = `${baseIndent}  `;

  if (closingTagMatch && closingTagMatch[1].toLowerCase() === tagName) {
    return `\n${innerIndent}\n${baseIndent}`;
  }

  return `\n${innerIndent}`;
}

function getCodeIndentInsert(text, start, end, baseIndent) {
  const beforeOnLine = text.slice(text.lastIndexOf('\n', Math.max(0, start - 1)) + 1, start);
  const afterSelection = text.slice(end);
  const trimmedBefore = beforeOnLine.trimEnd();
  const nextNonSpace = afterSelection.match(/^\s*([}\])])/);

  if (/[{[(]$/.test(trimmedBefore)) {
    const innerIndent = `${baseIndent}  `;
    if (nextNonSpace) return `\n${innerIndent}\n${baseIndent}`;
    return `\n${innerIndent}`;
  }

  return `\n${baseIndent}`;
}

function smartEnterIndent() {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;
  const { indent } = getLineIndentBeforeCursor(text, start);
  const insertText = activeLanguage === 'html'
    ? getHTMLIndentInsert(text, start, end, indent)
    : getCodeIndentInsert(text, start, end, indent);

  const before = text.slice(0, start);
  const after = text.slice(end);
  const nextValue = before + insertText + after;

  let cursorPosition = start + insertText.length;
  const splitInsert = insertText.split('\n');
  if (splitInsert.length >= 3) {
    cursorPosition = start + splitInsert[0].length + 1 + splitInsert[1].length;
  }

  applyProgrammaticEditorChange(nextValue, cursorPosition, cursorPosition);
}

function isTypingInAdminForm() {
  return !adminOverlay.classList.contains('hidden') && adminOverlay.contains(document.activeElement);
}

function handleGlobalShortcuts(event) {
  if (event.defaultPrevented) return;
  const key = event.key.toLowerCase();
  const isCtrlOrMeta = event.ctrlKey || event.metaKey;

  // Keep native editor behavior for Undo and Redo.
  if (isCtrlOrMeta && (key === 'z' || key === 'y')) {
    return;
  }

  if (!isCtrlOrMeta) return;

  if (key === 's') {
    event.preventDefault();
    if (!adminForm.classList.contains('hidden') && adminOverlay.contains(document.activeElement)) {
      adminForm.requestSubmit();
      setStatus('Activity saved');
    } else {
      saveNow();
    }
    return;
  }

  if (isTypingInAdminForm()) return;

  if (event.shiftKey && key === 'f') {
    event.preventDefault();
    if (document.body.classList.contains('editor-fullscreen-active')) {
      exitFullEditor();
    } else {
      enterFullEditor();
    }
    return;
  }

  if (key === '=' || key === '+') {
    event.preventDefault();
    changeEditorZoom(1);
    return;
  }

  if (key === '-') {
    event.preventDefault();
    changeEditorZoom(-1);
    return;
  }

  if (key === '0') {
    event.preventDefault();
    resetEditorZoom();
    return;
  }

  if (key === 'enter' && event.shiftKey) {
    event.preventDefault();
    showResult();
    return;
  }

  if (key === 'enter') {
    event.preventDefault();
    runCode();
    return;
  }

  if (['1', '2', '3'].includes(key)) {
    event.preventDefault();
    switchLanguageByIndex(Number(key) - 1);
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll('`', '&#096;');
}


/* =========================================================
   SMART INLINE HINTS
   Shows beginner-friendly help directly from the editor.
   Desktop: hover a suspicious line. Phone/tablet: tap the line.
   This follows Admin > Assistance > Code Helper & Error Hints.
   ========================================================= */
const SMART_INLINE_HTML_TAG_FIXES = {
  hmtl: 'html', htm: 'html', hmt: 'html', haed: 'head', hed: 'head', titel: 'title', tittle: 'title',
  boddy: 'body', bdy: 'body', paragrap: 'p', paragraph: 'p', pragraph: 'p', divv: 'div', spn: 'span',
  sytle: 'style', stlye: 'style', scipt: 'script', scrpt: 'script', imge: 'img', iamge: 'img', imgg: 'img',
  buton: 'button', botton: 'button', lable: 'label', tabel: 'table', teh: 'thead', tboddy: 'tbody'
};

const SMART_INLINE_COMMON_HTML_TAGS = new Set([
  'html', 'head', 'title', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'section', 'article',
  'main', 'header', 'footer', 'nav', 'ul', 'ol', 'li', 'a', 'img', 'button', 'label', 'input', 'form', 'table',
  'tr', 'td', 'th', 'thead', 'tbody', 'style', 'script', 'strong', 'em', 'br', 'hr'
]);

const SMART_INLINE_VOID_HTML_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const SMART_INLINE_CSS_PROPERTIES = new Set([
  'color', 'background', 'background-color', 'font-size', 'font-family', 'font-weight', 'text-align', 'margin', 'padding',
  'width', 'height', 'border', 'border-radius', 'display', 'justify-content', 'align-items', 'gap', 'flex-direction',
  'grid-template-columns', 'position', 'top', 'right', 'bottom', 'left', 'opacity', 'box-shadow', 'line-height'
]);

const smartInlineHintState = {
  element: null,
  hint: null,
  hoverTimer: null,
  lastLineIndex: -1
};

function isSmartInlineHintsEnabled() {
  return Boolean(editor) && isStudentAssistanceFeatureEnabled('codeHelper') && !document.body.classList.contains('entry-gate-active');
}

function getSmartInlineHintHost() {
  const editorIsFullscreen = Boolean(
    editorPanel && (
      document.body.classList.contains('editor-fullscreen-active') ||
      document.fullscreenElement === editorPanel ||
      document.webkitFullscreenElement === editorPanel
    )
  );
  return editorIsFullscreen ? editorPanel : document.body;
}

function syncSmartInlineHintHost() {
  const host = getSmartInlineHintHost();
  const element = smartInlineHintState.element;
  if (element && host && element.parentElement !== host) {
    host.appendChild(element);
  }
  return host;
}

function createSmartInlineHintElement() {
  if (smartInlineHintState.element) {
    syncSmartInlineHintHost();
    return smartInlineHintState.element;
  }
  const hint = document.createElement('div');
  hint.id = 'smartInlineHint';
  hint.className = 'smart-inline-hint hidden';
  hint.setAttribute('role', 'dialog');
  hint.setAttribute('aria-live', 'polite');
  (getSmartInlineHintHost() || document.body).appendChild(hint);
  smartInlineHintState.element = hint;
  return hint;
}

function getLineContextByIndex(lineIndex) {
  const value = editor.value || '';
  const lines = value.split('\n');
  const safeIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));
  let start = 0;
  for (let index = 0; index < safeIndex; index += 1) start += lines[index].length + 1;
  const text = lines[safeIndex] || '';
  return {
    value,
    lines,
    lineIndex: safeIndex,
    lineNumber: safeIndex + 1,
    lineText: text,
    lineStart: start,
    lineEnd: start + text.length
  };
}

function getEditorLineIndexFromPointer(event) {
  if (!editor) return 0;
  const rect = editor.getBoundingClientRect();
  const style = window.getComputedStyle(editor);
  const fontSize = parseFloat(style.fontSize) || 16;
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.55;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const y = event.clientY - rect.top + editor.scrollTop - paddingTop;
  const rawLine = Math.floor(Math.max(0, y) / lineHeight);
  const totalLines = Math.max(1, editor.value.split('\n').length);
  return Math.max(0, Math.min(rawLine, totalLines - 1));
}

function getEditorLineIndexFromCursor() {
  const position = typeof editor.selectionStart === 'number' ? editor.selectionStart : 0;
  return editor.value.slice(0, position).split('\n').length - 1;
}

function makeSmartHint(context, data) {
  return {
    language: activeLanguage,
    lineNumber: context.lineNumber,
    lineIndex: context.lineIndex,
    issue: data.issue,
    suggestion: data.suggestion,
    start: context.lineStart + (data.localStart || 0),
    end: context.lineStart + (data.localEnd ?? context.lineText.length),
    replacement: data.replacement || '',
    fixLabel: data.fixLabel || 'Fix it',
    canFix: Boolean(data.canFix && typeof data.replacement === 'string')
  };
}

function detectSmartInlineHtmlHint(context) {
  const line = context.lineText;
  if (!line.trim()) return null;

  const wrongClose = line.match(/(<\s*(h[1-6]|p|div|span|section|article|main|header|footer|nav|ul|ol|li|button|label|strong|em|title)\b[^>]*>)([\s\S]*?)(<\s*\2\s*>)/i);
  if (wrongClose) {
    const wrongStart = wrongClose.index + wrongClose[1].length + wrongClose[3].length;
    const wrongEnd = wrongStart + wrongClose[4].length;
    const fixedClose = `</${wrongClose[2].toLowerCase()}>`;
    return makeSmartHint(context, {
      issue: `The second <${wrongClose[2]}> looks like a closing tag but it is missing a slash.`,
      suggestion: `Use ${fixedClose} to close the ${wrongClose[2].toLowerCase()} element.`,
      localStart: wrongStart,
      localEnd: wrongEnd,
      replacement: fixedClose,
      canFix: true
    });
  }

  const attrMatch = line.match(/\s(src|href|class|id|alt|title|rel|type|name|value|placeholder)=([^"'\s<>][^\s<>]*)/i);
  if (attrMatch) {
    const attrStart = attrMatch.index;
    const attrEnd = attrStart + attrMatch[0].length;
    const before = attrMatch[0].slice(0, attrMatch[0].indexOf('=') + 1);
    const fixed = `${before}"${attrMatch[2]}"`;
    return makeSmartHint(context, {
      issue: `The ${attrMatch[1]} value should be inside quotation marks.`,
      suggestion: `Write it as ${attrMatch[1]}="${attrMatch[2]}".`,
      localStart: attrStart,
      localEnd: attrEnd,
      replacement: fixed,
      canFix: true
    });
  }

  const tagMatch = line.match(/<\/?\s*([a-zA-Z][\w:-]*)/);
  if (tagMatch) {
    const typedTag = tagMatch[1].toLowerCase();
    const fixedTag = SMART_INLINE_HTML_TAG_FIXES[typedTag];
    if (fixedTag) {
      const localStart = tagMatch.index + tagMatch[0].lastIndexOf(tagMatch[1]);
      return makeSmartHint(context, {
        issue: `<${typedTag}> does not look like a valid/common HTML tag.`,
        suggestion: `Did you mean <${fixedTag}>?`,
        localStart,
        localEnd: localStart + tagMatch[1].length,
        replacement: fixedTag,
        canFix: true
      });
    }
    if (!SMART_INLINE_COMMON_HTML_TAGS.has(typedTag) && !typedTag.includes('-')) {
      return makeSmartHint(context, {
        issue: `<${typedTag}> is not a common beginner HTML tag.`,
        suggestion: 'Check the spelling of the tag. Common tags include h1, p, div, img, a, ul, li, and button.',
        canFix: false
      });
    }
  }

  const unclosed = line.match(/<\s*(h[1-6]|p|li|span|strong|em|button|label|title)\b[^>]*>(?!.*<\/\s*\1\s*>)([^<]+)$/i);
  if (unclosed && !SMART_INLINE_VOID_HTML_TAGS.has(unclosed[1].toLowerCase())) {
    const tag = unclosed[1].toLowerCase();
    return makeSmartHint(context, {
      issue: `This <${tag}> tag does not appear to be closed on this line.`,
      suggestion: `Add </${tag}> after the text.`,
      localStart: line.length,
      localEnd: line.length,
      replacement: `</${tag}>`,
      canFix: true
    });
  }

  return null;
}

function detectSmartInlineCssHint(context) {
  const line = context.lineText;
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('/*')) return null;

  const missingColon = line.match(/^(\s*)([a-z-]+)\s+([^:;{}]+;\s*)$/i);
  if (missingColon && SMART_INLINE_CSS_PROPERTIES.has(missingColon[2].toLowerCase())) {
    const fixedLine = `${missingColon[1]}${missingColon[2]}: ${missingColon[3]}`;
    return makeSmartHint(context, {
      issue: `CSS property "${missingColon[2]}" needs a colon before its value.`,
      suggestion: `Use ${missingColon[2]}: value;`,
      localStart: 0,
      localEnd: line.length,
      replacement: fixedLine,
      canFix: true
    });
  }

  const missingSemicolon = line.match(/^(\s*)([a-z-]+)\s*:\s*([^;{}]+)$/i);
  if (missingSemicolon && SMART_INLINE_CSS_PROPERTIES.has(missingSemicolon[2].toLowerCase())) {
    return makeSmartHint(context, {
      issue: `This CSS declaration is missing a semicolon.`,
      suggestion: `Add ; after the value so the next style is read correctly.`,
      localStart: line.length,
      localEnd: line.length,
      replacement: ';',
      canFix: true
    });
  }

  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  if (openBraces > closeBraces && !line.includes('}')) {
    return makeSmartHint(context, {
      issue: 'This CSS block has an opening brace {.',
      suggestion: 'Make sure you add a matching } after all styles for this selector.',
      canFix: false
    });
  }

  return null;
}

function detectSmartInlineJsHint(context) {
  const line = context.lineText;
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//')) return null;

  const openParen = (line.match(/\(/g) || []).length;
  const closeParen = (line.match(/\)/g) || []).length;
  if (openParen > closeParen) {
    const semi = line.lastIndexOf(';');
    const insertAt = semi >= 0 ? semi : line.length;
    return makeSmartHint(context, {
      issue: 'This JavaScript line has an opening parenthesis without a matching closing parenthesis.',
      suggestion: 'Add ) before the end of the statement.',
      localStart: insertAt,
      localEnd: insertAt,
      replacement: ')',
      canFix: true
    });
  }

  const doubleQuotes = (line.match(/"/g) || []).length;
  const singleQuotes = (line.match(/'/g) || []).length;
  if (doubleQuotes % 2 === 1 || singleQuotes % 2 === 1) {
    return makeSmartHint(context, {
      issue: 'This line may have an unclosed string quotation mark.',
      suggestion: 'Check if every opening quote has a matching closing quote.',
      canFix: false
    });
  }

  const openBrace = (line.match(/\{/g) || []).length;
  const closeBrace = (line.match(/\}/g) || []).length;
  if (openBrace > closeBrace) {
    return makeSmartHint(context, {
      issue: 'This line opens a code block with {.',
      suggestion: 'Make sure the block is closed later with }.',
      canFix: false
    });
  }

  return null;
}

function detectSmartInlineHint(context) {
  if (!context || !context.lineText) return null;
  if (activeLanguage === 'html') return detectSmartInlineHtmlHint(context);
  if (activeLanguage === 'css') return detectSmartInlineCssHint(context);
  if (activeLanguage === 'js') return detectSmartInlineJsHint(context);
  return null;
}

function hideSmartInlineHint() {
  window.clearTimeout(smartInlineHintState.hoverTimer);
  smartInlineHintState.hint = null;
  smartInlineHintState.lastLineIndex = -1;
  smartInlineHintState.element?.classList.add('hidden');
}

function applySmartInlineFix() {
  const hint = smartInlineHintState.hint;
  if (!hint || !hint.canFix) return;
  const value = editor.value || '';
  const start = Math.max(0, Math.min(hint.start, value.length));
  const end = Math.max(start, Math.min(hint.end, value.length));
  const nextValue = `${value.slice(0, start)}${hint.replacement}${value.slice(end)}`;
  const nextCursor = start + hint.replacement.length;
  applyProgrammaticEditorChange(nextValue, nextCursor, nextCursor, 'Smart hint applied');
  hideSmartInlineHint();
}

function renderSmartInlineHint(hint, event) {
  if (!hint || !event) return;
  const element = createSmartInlineHintElement();
  syncSmartInlineHintHost();
  smartInlineHintState.hint = hint;
  element.innerHTML = `
    <button class="smart-inline-close" type="button" aria-label="Close smart hint">×</button>
    <p class="smart-inline-kicker">Smart Hint · Line ${hint.lineNumber}</p>
    <strong>${escapeHTML(hint.issue)}</strong>
    <span>${escapeHTML(hint.suggestion)}</span>
    ${hint.canFix ? `<button class="smart-inline-fix" type="button">${escapeHTML(hint.fixLabel)}</button>` : ''}
  `;
  element.querySelector('.smart-inline-close')?.addEventListener('click', hideSmartInlineHint);
  element.querySelector('.smart-inline-fix')?.addEventListener('click', applySmartInlineFix);
  element.classList.remove('hidden');

  const margin = 10;
  const width = Math.min(320, window.innerWidth - margin * 2);
  element.style.maxWidth = `${width}px`;
  element.style.left = '0px';
  element.style.top = '0px';
  const rect = element.getBoundingClientRect();
  const left = Math.max(margin, Math.min(event.clientX + 14, window.innerWidth - rect.width - margin));
  const top = Math.max(margin, Math.min(event.clientY + 16, window.innerHeight - rect.height - margin));
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

function showSmartInlineHintForLine(lineIndex, event) {
  if (!isSmartInlineHintsEnabled()) {
    hideSmartInlineHint();
    return;
  }
  const context = getLineContextByIndex(lineIndex);
  const hint = detectSmartInlineHint(context);
  if (!hint) {
    hideSmartInlineHint();
    return;
  }
  smartInlineHintState.lastLineIndex = context.lineIndex;
  renderSmartInlineHint(hint, event);
}

function handleSmartInlinePointer(event, options = {}) {
  if (!isSmartInlineHintsEnabled()) return;
  const lineIndex = options.fromCursor ? getEditorLineIndexFromCursor() : getEditorLineIndexFromPointer(event);
  if (!options.force && smartInlineHintState.lastLineIndex === lineIndex && !smartInlineHintState.element?.classList.contains('hidden')) return;
  window.clearTimeout(smartInlineHintState.hoverTimer);
  smartInlineHintState.hoverTimer = window.setTimeout(() => showSmartInlineHintForLine(lineIndex, event), options.delay ?? 90);
}

editor.addEventListener('input', event => {
  saveActiveEditor();
  updateLineNumbers();
  commitEditorHistory();
  showSuggestions(event);
  updateTagMatching();
  scheduleAutoRun({ reason: 'edit' });
});

editor.addEventListener('input', () => hideSmartInlineHint());

editor.addEventListener('mousemove', event => handleSmartInlinePointer(event));

editor.addEventListener('click', event => handleSmartInlinePointer(event, { fromCursor: true, force: true, delay: 0 }));

editor.addEventListener('touchend', event => {
  const touch = event.changedTouches?.[0];
  if (!touch) return;
  handleSmartInlinePointer(touch, { fromCursor: true, force: true, delay: 0 });
}, { passive: true });

editor.addEventListener('mouseleave', () => {
  window.clearTimeout(smartInlineHintState.hoverTimer);
});

document.addEventListener('click', event => {
  const hintEl = smartInlineHintState.element;
  if (!hintEl || hintEl.classList.contains('hidden')) return;
  if (hintEl.contains(event.target) || editor.contains(event.target)) return;
  hideSmartInlineHint();
});

editor.addEventListener('scroll', () => {
  syncEditorScroll();
  hideSuggestions();
});

editor.addEventListener('keydown', event => {
  const isCtrlOrMeta = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (isCtrlOrMeta && key === 'z') {
    event.preventDefault();
    if (event.shiftKey) customRedo();
    else customUndo();
    return;
  }

  if (isCtrlOrMeta && key === 'y') {
    event.preventDefault();
    customRedo();
    return;
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const nextValue = editor.value.slice(0, start) + '  ' + editor.value.slice(end);
    applyProgrammaticEditorChange(nextValue, start + 2, start + 2);
  }

  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    runCode();
    return;
  }

  if (event.key === 'Enter' && !isCtrlOrMeta && !event.shiftKey && !event.altKey && suggestionBox.classList.contains('hidden')) {
    event.preventDefault();
    smartEnterIndent();
    return;
  }

  if (!suggestionBox.classList.contains('hidden')) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActiveSuggestion(1);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveSuggestion(-1);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      applySuggestion();
    }

    if (event.key === 'Escape') {
      hideSuggestions();
    }
  }
});

editor.addEventListener('click', () => {
  hideSuggestions();
  updateTagMatching();
});
editor.addEventListener('keyup', event => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
    updateTagMatching();
  }
});
editor.addEventListener('select', updateTagMatching);

suggestionBox.addEventListener('mousedown', event => {
  event.preventDefault();
  if (event.target.closest('.suggestion-close')) {
    hideSuggestions();
    editor.focus();
    return;
  }

  const item = event.target.closest('.suggestion-item');
  if (!item) return;
  applySuggestion(Number(item.dataset.index));
});

suggestionBox.addEventListener('mouseenter', () => window.clearTimeout(suggestionHideTimer));
suggestionBox.addEventListener('mouseleave', () => scheduleSuggestionHide(1200));

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    saveActiveEditor();
    activeLanguage = button.dataset.language;
    tabButtons.forEach(tab => tab.classList.toggle('active', tab === button));
    loadActiveEditor();
    setStatus(`${activeLanguage.toUpperCase()} tab`);
  });
});

if (stepActivityBtn) stepActivityBtn.addEventListener('click', toggleActivityCard);
closeActivityCardBtn?.addEventListener('click', closeActivityCard);
activityCard?.addEventListener('click', event => {
  if (event.target === activityCard) closeActivityCard();
});
activityCriteriaStat?.addEventListener('click', openActivityRubricModal);
activityRubricOverlay?.addEventListener('click', event => {
  if (event.target === activityRubricOverlay) closeActivityRubricModal();
});
closeActivityRubricBtn?.addEventListener('click', closeActivityRubricModal);
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (activityRubricOverlay && !activityRubricOverlay.classList.contains('hidden')) {
    closeActivityRubricModal();
    return;
  }
  if (activityCard && !activityCard.classList.contains('collapsed-card')) closeActivityCard();
});
if (stepCodeBtn) stepCodeBtn.addEventListener('click', focusEditorStep);
if (stepRunBtn) stepRunBtn.addEventListener('click', () => runCode());
if (stepResultBtn) stepResultBtn.addEventListener('click', showResult);

layoutButtons.forEach(button => {
  button.addEventListener('click', () => setPreviewLayout(button.dataset.layout));
});

desktopPreviewBtn?.addEventListener('click', toggleDesktopPreviewMode);
fullPreviewBtn.addEventListener('click', enterFullPreview);
exitPreviewBtn.addEventListener('click', () => exitFullPreview({ closeEditorFullscreen: true }));
ensureBackToEditorPreviewBtn();
ensurePreviewResultBtn()?.classList.remove('hidden');
if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => changeEditorZoom(-1));
if (zoomInBtn) zoomInBtn.addEventListener('click', () => changeEditorZoom(1));
if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetEditorZoom);
function handleFullscreenRunClick() {
  runCode(true);
}

function handleFullscreenResultClick() {
  if (document.body.classList.contains('editor-fullscreen-active')) {
    exitFullEditor();
    window.setTimeout(showResult, 120);
    return;
  }
  showResult();
}

if (fullEditorBtn) fullEditorBtn.addEventListener('click', enterFullEditor);
if (exitEditorBtn) exitEditorBtn.addEventListener('click', exitFullEditor);
if (exitEditorStickyBtn) exitEditorStickyBtn.addEventListener('click', exitFullEditor);
if (fullscreenRunBtn) fullscreenRunBtn.addEventListener('click', handleFullscreenRunClick);
if (fullscreenResultBtn) fullscreenResultBtn.addEventListener('click', handleFullscreenResultClick);
ensureFullscreenActionBar();

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && fileNameDialogOverlay && !fileNameDialogOverlay.classList.contains('hidden')) {
    event.preventDefault();
    closeFileNameDialog();
    return;
  }

  if (event.key === 'Escape' && errorCheckerPanel && !errorCheckerPanel.classList.contains('hidden')) {
    closeCodeHelperPanel();
    return;
  }

  handleGlobalShortcuts(event);

  if (event.key === 'Escape' && document.body.classList.contains('preview-fullscreen-active')) {
    exitFullPreview({ closeEditorFullscreen: true });
  }

  if (event.key === 'Escape' && document.body.classList.contains('editor-fullscreen-active')) {
    exitFullEditor();
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('editor-fullscreen-active')) {
    if (document.body.classList.contains('preview-inside-editor-fullscreen') || document.body.classList.contains('preview-fullscreen-active')) {
      return;
    }
    exitFullEditor({ fromNative: true });
    return;
  }

  if (document.fullscreenElement === editorPanel && document.body.classList.contains('editor-fullscreen-active')) {
    scheduleFullEditorControlsRestore();
  }

  if (!document.fullscreenElement && document.body.classList.contains('preview-fullscreen-active')) {
    exitFullPreview({ fromNative: true });
  }
});


window.addEventListener('resize', scheduleFullEditorControlsRestore);
document.addEventListener('visibilitychange', scheduleFullEditorControlsRestore);
window.addEventListener('pageshow', scheduleFullEditorControlsRestore);

runBtn.addEventListener('click', () => runCode());
autoRunBtn?.addEventListener('click', toggleAutoRun);
if (fullscreenAutoRunBtn && !fullscreenAutoRunBtn.dataset.fullscreenActionBound) {
  fullscreenAutoRunBtn.addEventListener('click', toggleAutoRun);
  fullscreenAutoRunBtn.dataset.fullscreenActionBound = 'true';
}
updateAutoRunButtons();
resultBtn.addEventListener('click', showResult);
if (aiReviewTopBtn) aiReviewTopBtn.addEventListener('click', requestAIReview);
if (runAiReviewBtn) runAiReviewBtn.addEventListener('click', requestAIReview);
if (saveBtn) saveBtn.addEventListener('click', downloadCodeAsZip);
if (downloadZipBtn) downloadZipBtn.addEventListener('click', downloadCodeAsZip);
codeHelperFloatingBtn?.addEventListener('click', toggleCodeHelperPanel);
closeCodeHelperBtn?.addEventListener('click', closeCodeHelperPanel);
if (refreshErrorCheckerBtn) refreshErrorCheckerBtn.addEventListener('click', () => {
  saveActiveEditor();
  runCode(false, { scroll: false });
  window.setTimeout(renderErrorChecker, 220);
  setStatus('Errors checked');
});
if (advancedErrorCheckBtn) advancedErrorCheckBtn.addEventListener('click', requestAdvancedErrorCheck);
if (previewFrame) previewFrame.addEventListener('load', () => {
  markPreviewReady();
  window.setTimeout(renderErrorChecker, 80);
});
activitySelect.addEventListener('change', event => selectActivity(event.target.value));
resetActivityCodeBtn.addEventListener('click', resetCurrentActivityCode);

themeToggle?.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

entryThemeToggle?.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

resetBtn.addEventListener('click', async () => {
  const resetLabel = activity ? `"${activity.title}"` : 'the editor';
  if (!await appConfirm(`Reset all tabs for ${resetLabel} to the sample code? Your current code in this activity will be replaced.`, { title: 'Reset editor', danger: true, confirmText: 'Reset' })) return;
  codeStore = normalizeCodeStore(starterCode);
  if (activity) {
    codeByActivity[activity.id] = codeStore;
    saveCodeByActivity();
  }
  resetAllLanguageHistoryForCurrentActivity();
  loadActiveEditor();
  resetResultPanel();
  runCode();
  setStatus('Reset complete');
});

clearBtn.addEventListener('click', async () => {
  if (!await appConfirm(`Clear the ${activeLanguage.toUpperCase()} tab? This removes the code in the current tab only.`, { title: 'Clear current tab', danger: true, confirmText: 'Clear' })) return;
  applyProgrammaticEditorChange('', 0, 0);
  hideSuggestions();
  runCode();
  setStatus(`${activeLanguage.toUpperCase()} cleared`);
});

window.addEventListener('resize', fitEditorToContent);

window.addEventListener('click', event => {
  if (!suggestionBox.contains(event.target) && event.target !== editor) {
    hideSuggestions();
  }
});

appDialogOkBtn?.addEventListener('click', () => closeAppDialog(true));
appDialogCancelBtn?.addEventListener('click', () => closeAppDialog(false));
appDialogOverlay?.addEventListener('click', event => {
  if (event.target === appDialogOverlay) closeAppDialog(false);
});
window.addEventListener('keydown', event => {
  if (!appDialogOverlay || appDialogOverlay.classList.contains('hidden')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeAppDialog(false);
  }
});

[assistanceMasterToggle, codeSuggestionsToggle, codeHelperToggle, teacherFeedbackToggle, superStudioToggle, externalLinksSamePreviewToggle].forEach(toggle => {
  toggle?.addEventListener('change', () => {
    applyAssistanceSettingsFromControls();
  });
});
applyAssistanceLocalBtn?.addEventListener('click', () => applyAssistanceSettingsFromControls());
publishAssistanceBtn?.addEventListener('click', publishAssistanceSettings);

initAdminTabs();
adminBtn?.addEventListener('click', openAdminPanel);
adminBtn?.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openAdminPanel();
  }
});
closeAdminBtn.addEventListener('click', closeAdminPanel);
unlockAdminBtn?.addEventListener('click', unlockAdmin);
unlockAdminCodeBtn?.addEventListener('click', unlockAdminWithCode);
adminCodeModeBtn?.addEventListener('click', () => setAdminLoginMode('code'));
adminPasswordModeBtn?.addEventListener('click', () => setAdminLoginMode('password'));
if (logoutAdminBtn) logoutAdminBtn.addEventListener('click', logoutTeacher);
[adminEmail, adminPassword].forEach(input => {
  input?.addEventListener('input', () => showTeacherLoginError(''));
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      unlockAdmin();
    }
  });
});
adminQuickCode?.addEventListener('input', () => showTeacherLoginError(''));
adminQuickCode?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    unlockAdminWithCode();
  }
});

adminOverlay.addEventListener('click', event => {
  if (event.target === adminOverlay) {
    closeAdminPanel();
  }
});

adminForm.addEventListener('submit', saveRubric);
adminActivitySelect.addEventListener('change', event => editAdminActivity(event.target.value));
newActivityBtn.addEventListener('click', createNewActivity);
duplicateActivityBtn.addEventListener('click', duplicateActivity);
deleteActivityBtn.addEventListener('click', deleteActivity);
addCriterionBtn.addEventListener('click', addCriterion);
resetRubricBtn.addEventListener('click', restoreDefaultRubric);
if (rubricImageInput) rubricImageInput.addEventListener('change', previewRubricImage);
if (importRubricImageBtn) importRubricImageBtn.addEventListener('click', importRubricImage);
if (clearRubricImageBtn) clearRubricImageBtn.addEventListener('click', clearRubricImageImport);
if (fillRubricTextBtn) fillRubricTextBtn.addEventListener('click', fillRubricTableFromExtractedText);
renameFilesBtn?.addEventListener('click', openFileNameDialog);
closeFileNameDialogBtn?.addEventListener('click', closeFileNameDialog);
cancelFileNameDialogBtn?.addEventListener('click', closeFileNameDialog);
defaultFileNamesBtn?.addEventListener('click', resetFileNameDialogDefaults);
applyFileNamesBtn?.addEventListener('click', applyFileNameDialogValues);
fileNameDialogOverlay?.addEventListener('click', event => {
  if (event.target === fileNameDialogOverlay) closeFileNameDialog();
});
htmlPageSelect?.addEventListener('change', event => switchHTMLPage(event.target.value));
addHtmlPageBtn?.addEventListener('click', () => openPageDialog('add'));
renameHtmlPageBtn?.addEventListener('click', () => openPageDialog('rename'));
deleteHtmlPageBtn?.addEventListener('click', deleteCurrentHTMLPage);
closePageDialogBtn?.addEventListener('click', closePageDialog);
cancelPageDialogBtn?.addEventListener('click', closePageDialog);
applyPageDialogBtn?.addEventListener('click', applyPageDialog);
pageDialogOverlay?.addEventListener('click', event => {
  if (event.target === pageDialogOverlay) closePageDialog();
});
htmlPageNameInput?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    applyPageDialog();
  }
});

document.addEventListener('fullscreenchange', () => {
  if (fileNameDialogOverlay && !fileNameDialogOverlay.classList.contains('hidden')) {
    placeFileNameDialogForCurrentMode();
  }
  if (pageDialogOverlay && !pageDialogOverlay.classList.contains('hidden')) {
    placePageDialogForCurrentMode();
  }
});

document.addEventListener('webkitfullscreenchange', () => {
  if (fileNameDialogOverlay && !fileNameDialogOverlay.classList.contains('hidden')) {
    placeFileNameDialogForCurrentMode();
  }
  if (pageDialogOverlay && !pageDialogOverlay.classList.contains('hidden')) {
    placePageDialogForCurrentMode();
  }
});
[htmlFileNameInput, cssFileNameInput, jsFileNameInput].forEach(input => {
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyFileNameDialogValues();
    }
  });
});
if (addManualRubricRowBtn) addManualRubricRowBtn.addEventListener('click', () => addManualRubricInputRow());
if (applyManualRubricBtn) applyManualRubricBtn.addEventListener('click', applyManualRubricTableToActualRubric);
if (clearManualRubricBtn) clearManualRubricBtn.addEventListener('click', clearManualRubricInputTable);
if (manualRubricInputBody) {
  manualRubricInputBody.addEventListener('click', event => {
    const removeButton = event.target.closest('.remove-manual-rubric-row');
    if (!removeButton) return;
    const row = removeButton.closest('.manual-rubric-input-row');
    if (row) row.remove();
    ensureManualRubricRows();
  });
}
criteriaEditor.addEventListener('change', updateCriterionHelp);
criteriaEditor.addEventListener('click', async event => {
  const removeButton = event.target.closest('.remove-criterion');
  if (!removeButton) return;
  event.preventDefault();
  event.stopPropagation();
  const currentCriteria = collectCriteriaFromEditor();
  const card = removeButton.closest('.rubric-table-row') || removeButton.closest('.criterion-card');
  if (!card) return;
  const target = currentCriteria.find(item => item.id === card.dataset.id);
  const name = target?.title || 'this criterion';
  if (!await appConfirm(`Remove “${name}” from the rubric table?`, {
    title: 'Remove criterion',
    danger: true,
    confirmText: 'Remove'
  })) return;
  const filtered = currentCriteria.filter(item => item.id !== card.dataset.id);
  renderCriteriaEditor(filtered);
});

// Welcome, student authentication, password, dashboard, and project actions.
openStudentLoginBtn?.addEventListener('click', openStudentLogin);
continueGuestBtn?.addEventListener('click', continueAsGuest);
resumeStudentBtn?.addEventListener('click', resumeExistingStudentSession);
closeStudentLoginBtn?.addEventListener('click', closeStudentLogin);
studentLoginGuestBtn?.addEventListener('click', continueAsGuest);
guestLoginToSaveBtn?.addEventListener('click', () => {
  showEntryGate();
  openStudentLogin();
});
studentLoginBtn?.addEventListener('click', loginStudent);
toggleStudentPasswordBtn?.addEventListener('click', () => {
  if (!studentLoginPassword) return;
  const show = studentLoginPassword.type === 'password';
  studentLoginPassword.type = show ? 'text' : 'password';
  toggleStudentPasswordBtn.textContent = show ? 'Hide' : 'Show';
});
[studentLoginId, studentLoginPassword].forEach(input => input?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    loginStudent();
  }
}));
studentLoginOverlay?.addEventListener('click', event => {
  if (event.target === studentLoginOverlay) closeStudentLogin();
});
saveNewPasswordBtn?.addEventListener('click', saveStudentNewPassword);
changePasswordLogoutBtn?.addEventListener('click', logoutStudent);
[studentNewPassword, studentConfirmPassword].forEach(input => input?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveStudentNewPassword();
  }
}));
myProjectsBtn?.addEventListener('click', showStudentDashboard);
studentHeaderLogoutBtn?.addEventListener('click', logoutStudent);
studentMenuBtn?.addEventListener('click', event => {
  event.stopPropagation();
  toggleStudentAccountMenu();
});
menuMyProjectsBtn?.addEventListener('click', () => {
  closeStudentAccountMenu();
  showStudentDashboard();
});
menuStudentLogoutBtn?.addEventListener('click', () => {
  closeStudentAccountMenu();
  logoutStudent();
});
document.addEventListener('click', event => {
  if (!studentAccountMenu || studentAccountMenu.classList.contains('hidden')) return;
  if (studentAccountMenu.contains(event.target) || studentMenuBtn?.contains(event.target)) return;
  closeStudentAccountMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeStudentAccountMenu();
});
window.addEventListener('orientationchange', closeStudentAccountMenu);
window.addEventListener('resize', closeStudentAccountMenu);
dashboardLogoutBtn?.addEventListener('click', logoutStudent);
dashboardThemeBtn?.addEventListener('click', () => themeToggle?.click());
newProjectBtn?.addEventListener('click', () => openProjectNameDialog('create'));
projectSearchInput?.addEventListener('input', renderStudentProjects);
projectStatusFilter?.addEventListener('change', renderStudentProjects);
studentProjectsGrid?.addEventListener('click', async event => {
  const actionButton = event.target.closest('[data-project-action]');
  if (!actionButton || actionButton.disabled) return;

  event.preventDefault();
  event.stopPropagation();

  const action = actionButton.dataset.projectAction;
  if (action === 'new') {
    openProjectNameDialog('create');
    return;
  }
  if (action === 'retry-load') {
    await loadStudentProjects();
    return;
  }
  const projectCard = actionButton.closest('[data-project-id]');
  const projectId = projectCard?.dataset.projectId;
  const project = appSession.projects.find(item => item.id === projectId);
  if (!projectId) return;
  if (action === 'open') {
    const oldText = actionButton.textContent;
    actionButton.disabled = true;
    actionButton.textContent = 'Opening...';
    projectCard?.classList.add('project-action-busy');
    try {
      await openStudentProject(projectId);
    } finally {
      actionButton.disabled = false;
      actionButton.textContent = oldText;
      projectCard?.classList.remove('project-action-busy');
    }
    return;
  }
  if (action === 'rename') openProjectNameDialog('rename', project);
  if (action === 'delete') {
    const oldTitle = actionButton.title;
    actionButton.disabled = true;
    actionButton.title = 'Delete in progress';
    try {
      await deleteStudentProject(projectId);
    } finally {
      actionButton.disabled = false;
      actionButton.title = oldTitle;
    }
  }
});
closeProjectNameBtn?.addEventListener('click', closeProjectNameDialog);
cancelProjectNameBtn?.addEventListener('click', closeProjectNameDialog);
saveProjectNameBtn?.addEventListener('click', saveProjectNameDialog);
projectNameInput?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveProjectNameDialog();
  }
});
projectNameOverlay?.addEventListener('click', event => {
  if (event.target === projectNameOverlay) closeProjectNameDialog();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && isStudentProjectActive()) {
    saveCurrentStudentProject({ immediate: true, reason: 'visibility' });
  }
});

// Teacher student account registration, Excel import, and section tracker.
addStudentAccountBtn?.addEventListener('click', addStudentAccountFromForm);
[adminStudentId, adminStudentName, adminStudentSection].forEach(input => input?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addStudentAccountFromForm();
  }
}));
downloadStudentTemplateBtn?.addEventListener('click', downloadStudentImportTemplate);
chooseStudentImportBtn?.addEventListener('click', () => studentImportInput?.click());
studentImportInput?.addEventListener('change', event => handleStudentImportFile(event.target.files?.[0]));
confirmStudentImportBtn?.addEventListener('click', confirmStudentImport);
cancelStudentImportBtn?.addEventListener('click', cancelStudentImport);
refreshStudentsBtn?.addEventListener('click', loadAdminStudents);
adminStudentSearch?.addEventListener('input', renderAdminStudentTracker);
adminSectionFilter?.addEventListener('change', renderAdminStudentTracker);
adminActivityFilter?.addEventListener('change', renderAdminStudentTracker);
adminStudentsTableBody?.addEventListener('click', event => {
  const button = event.target.closest('.view-student-projects-btn');
  if (!button) return;
  if (button.dataset.studentUid) showAdminStudentProjects(button.dataset.studentUid);
});
closeAdminStudentProjectsBtn?.addEventListener('click', closeAdminStudentProjects);
adminStudentProjectsOverlay?.addEventListener('click', event => {
  if (event.target === adminStudentProjectsOverlay) closeAdminStudentProjects();
});

initManualRubricInputTable();
applyStudentAssistanceSettings(studentAssistanceSettings);
setupPWAInstallPrompt();
registerPWAServiceWorker();
saveActivities({ cloud: false });
saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
saveCodeByActivity();
applyTheme(loadJSON(STORAGE_KEYS.theme, 'light'));
applyEditorZoom(editorFontSize);
renderActivitySummary();
resetResultPanel();
setPreviewLayout(loadJSON(STORAGE_KEYS.layout, 'split'));
loadActiveEditor();
runCode(false);
setAutoRunEnabled(autoRunEnabled, false);
renderErrorChecker();
startFirebaseMode();


// Final mobile desktop monitor sizing.
// The iframe always keeps a real 1366 x 768 CSS viewport, while only its visual
// scale changes. This prevents the monitor from drifting outside its card and
// keeps the whole desktop page visible in phone fullscreen/landscape.
let phonePreviewModeLatched = window.__mcsianPhonePreviewMode === true;

function isLikelyPhoneViewport() {
  const userAgent = navigator.userAgent || '';
  const userAgentDataMobile = navigator.userAgentData?.mobile === true;
  const mobileUserAgent = /Android|iPhone|iPod|Windows Phone|IEMobile|Opera Mini/i.test(userAgent);
  const coarsePointer = Boolean(window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches);
  const touchCapable = Number(navigator.maxTouchPoints || 0) > 0;
  const viewportWidth = Math.min(
    Number(window.innerWidth) || 9999,
    Number(window.visualViewport?.width) || 9999
  );
  const screenWidth = Number(window.screen?.width) || viewportWidth;
  const screenHeight = Number(window.screen?.height) || Number(window.innerHeight) || 9999;
  const shortestScreenSide = Math.min(screenWidth, screenHeight);
  const longestScreenSide = Math.max(screenWidth, screenHeight);
  const phoneSizedScreen = shortestScreenSide <= 760 && longestScreenSide <= 1100;
  const narrowResponsiveViewport = viewportWidth <= 760;
  const strongPhoneSignal = userAgentDataMobile || mobileUserAgent ||
    (phoneSizedScreen && (touchCapable || coarsePointer));

  // Once a phone/narrow mobile layout has been detected, keep it while the
  // device rotates to landscape. This prevents the phone UI from suddenly
  // turning back into desktop controls after rotation.
  if (strongPhoneSignal || narrowResponsiveViewport) {
    phonePreviewModeLatched = true;
    window.__mcsianPhonePreviewMode = true;
  }

  return strongPhoneSignal || phonePreviewModeLatched;
}

function applyPreviewDeviceMode() {
  const isPhone = isLikelyPhoneViewport();
  document.documentElement.dataset.deviceMode = isPhone ? 'phone' : 'desktop';

  // The phone preview always uses the single stacked flow. Split, Stacked,
  // and Big Preview remain desktop-only controls and are never needed here.
  if (isPhone && workspace) {
    workspace.dataset.layout = 'stacked';
  }

  if (!isPhone && previewPanel && previewFrame) {
    const shell = previewPanel.querySelector('.preview-frame-shell');
    previewPanel.classList.remove('mobile-desktop-preview', 'mobile-landscape-desktop-preview');
    desktopPreviewBtn?.classList.remove('active');
    desktopPreviewBtn?.setAttribute('aria-pressed', 'false');
    if (desktopPreviewBtn) {
      desktopPreviewBtn.textContent = 'Desktop View';
      desktopPreviewBtn.title = 'Phone-only desktop monitor preview';
    }
    if (shell) clearDesktopMonitorInlineSizing(shell);
  } else if (isPhone && desktopPreviewBtn) {
    const monitorEnabled = previewPanel?.classList.contains('mobile-desktop-preview');
    const label = monitorEnabled ? 'Phone' : 'Monitor';
    desktopPreviewBtn.classList.toggle('active', Boolean(monitorEnabled));
    desktopPreviewBtn.setAttribute('aria-pressed', String(Boolean(monitorEnabled)));
    desktopPreviewBtn.setAttribute('aria-label', monitorEnabled ? 'Return to phone preview' : 'Open desktop monitor preview');
    desktopPreviewBtn.dataset.mobileLabel = monitorEnabled ? '📱 Phone' : '🖥️ Monitor';
    desktopPreviewBtn.textContent = label;
    desktopPreviewBtn.title = monitorEnabled
      ? 'Return the output to normal phone width'
      : 'See the output as it appears on a desktop monitor';
  }

  return isPhone;
}

function isLandscapePhonePreviewFullscreen() {
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const isLandscape = viewportWidth > viewportHeight && viewportHeight <= 620;
  const isPreviewActive = document.body.classList.contains('preview-fullscreen-active') ||
    document.body.classList.contains('preview-inside-editor-fullscreen') ||
    document.fullscreenElement === previewPanel;
  return Boolean(isLikelyPhoneViewport() && isLandscape && isPreviewActive);
}

function clearDesktopMonitorInlineSizing(shell) {
  [
    'width', 'height', 'max-width', 'max-height', 'margin', 'position',
    'overflow', 'box-sizing', 'flex', 'align-self'
  ].forEach(prop => shell.style.removeProperty(prop));

  [
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'position', 'inset', 'top', 'right', 'bottom', 'left', 'margin',
    'transform', 'transform-origin', 'flex'
  ].forEach(prop => previewFrame.style.removeProperty(prop));
}

function setImportantStyle(element, property, value) {
  element.style.setProperty(property, value, 'important');
}

function updateDesktopMonitorPreviewSizing() {
  if (!previewPanel || !previewFrame) return;
  const shell = previewPanel.querySelector('.preview-frame-shell');
  if (!shell) return;

  // Never apply the phone monitor transform to a real desktop/computer view.
  // This also clears any stale inline scale left after rotating or resizing.
  if (!applyPreviewDeviceMode()) {
    return;
  }

  const forceLandscapeDesktop = isLandscapePhonePreviewFullscreen();
  previewPanel.classList.toggle('mobile-landscape-desktop-preview', forceLandscapeDesktop);
  const enabled = previewPanel.classList.contains('mobile-desktop-preview') || forceLandscapeDesktop;

  if (!enabled) {
    clearDesktopMonitorInlineSizing(shell);
    return;
  }

  const isFullPreview = document.body.classList.contains('preview-fullscreen-active') ||
    document.body.classList.contains('preview-inside-editor-fullscreen') ||
    document.fullscreenElement === previewPanel;

  const viewportWidth = Math.max(240, window.visualViewport?.width || window.innerWidth);
  const viewportHeight = Math.max(240, window.visualViewport?.height || window.innerHeight);
  const isLandscape = viewportWidth > viewportHeight;
  const desktopWidth = 1366;
  const desktopHeight = 768;

  let availableWidth;
  let availableHeight = Number.POSITIVE_INFINITY;

  if (isFullPreview) {
    // Reserve only a slim bottom toolbar. The remaining area is devoted to the
    // complete desktop canvas, centered both horizontally and vertically.
    const toolbarSpace = isLandscape ? 66 : 74;
    availableWidth = Math.max(220, viewportWidth - (isLandscape ? 18 : 20));
    availableHeight = Math.max(150, viewportHeight - toolbarSpace - 8);
  } else {
    const panelStyles = window.getComputedStyle(previewPanel);
    const horizontalPadding =
      (parseFloat(panelStyles.paddingLeft) || 0) +
      (parseFloat(panelStyles.paddingRight) || 0);
    const panelContentWidth = Math.max(220, previewPanel.clientWidth - horizontalPadding);
    availableWidth = Math.max(220, Math.min(panelContentWidth - 32, viewportWidth - 36));
  }

  let scale = isFullPreview
    ? Math.min(availableWidth / desktopWidth, availableHeight / desktopHeight)
    : Math.min(availableWidth / desktopWidth, 1);

  if (!Number.isFinite(scale) || scale <= 0) scale = 0.25;

  const outputWidth = Math.max(1, Math.floor(desktopWidth * scale));
  const outputHeight = Math.max(1, Math.floor(desktopHeight * scale));
  const shellSide = isFullPreview ? 8 : 18;
  const shellTop = isFullPreview ? 8 : 42;
  const shellBottom = isFullPreview ? 8 : 20;
  const frameLeft = Math.floor(shellSide / 2);
  const frameTop = isFullPreview ? 4 : 34;
  const shellWidth = outputWidth + shellSide;
  const shellHeight = outputHeight + shellTop + shellBottom;

  setImportantStyle(shell, 'position', 'relative');
  setImportantStyle(shell, 'box-sizing', 'border-box');
  setImportantStyle(shell, 'overflow', 'hidden');
  setImportantStyle(shell, 'width', `${shellWidth}px`);
  setImportantStyle(shell, 'height', `${shellHeight}px`);
  setImportantStyle(shell, 'max-width', isFullPreview ? 'calc(100dvw - 10px)' : 'calc(100% - 12px)');
  setImportantStyle(shell, 'max-height', isFullPreview ? `calc(100dvh - ${isLandscape ? 66 : 74}px)` : 'none');
  setImportantStyle(shell, 'margin', isFullPreview ? 'auto' : '12px auto');
  setImportantStyle(shell, 'align-self', 'center');
  setImportantStyle(shell, 'flex', '0 0 auto');

  setImportantStyle(previewFrame, 'position', 'absolute');
  setImportantStyle(previewFrame, 'inset', 'auto');
  setImportantStyle(previewFrame, 'top', `${frameTop}px`);
  setImportantStyle(previewFrame, 'left', `${frameLeft}px`);
  setImportantStyle(previewFrame, 'right', 'auto');
  setImportantStyle(previewFrame, 'bottom', 'auto');
  setImportantStyle(previewFrame, 'width', `${desktopWidth}px`);
  setImportantStyle(previewFrame, 'height', `${desktopHeight}px`);
  setImportantStyle(previewFrame, 'min-width', `${desktopWidth}px`);
  setImportantStyle(previewFrame, 'min-height', `${desktopHeight}px`);
  setImportantStyle(previewFrame, 'max-width', 'none');
  setImportantStyle(previewFrame, 'max-height', 'none');
  setImportantStyle(previewFrame, 'margin', '0');
  setImportantStyle(previewFrame, 'flex', 'none');
  setImportantStyle(previewFrame, 'transform', `scale(${scale})`);
  setImportantStyle(previewFrame, 'transform-origin', 'top left');
}

let desktopMonitorResizeFrame = 0;
function scheduleDesktopMonitorPreviewSizing(delay = 0) {
  window.clearTimeout(desktopMonitorResizeFrame);
  desktopMonitorResizeFrame = window.setTimeout(() => {
    window.requestAnimationFrame(updateDesktopMonitorPreviewSizing);
  }, delay);
}

applyPreviewDeviceMode();
if (isLikelyPhoneViewport() && workspace) {
  // Split/Stacked/Big Preview are desktop controls. The phone uses one normal
  // flow plus the dedicated Desktop Monitor button instead.
  workspace.dataset.layout = 'stacked';
}
window.addEventListener('resize', () => scheduleDesktopMonitorPreviewSizing(60));
window.visualViewport?.addEventListener('resize', () => scheduleDesktopMonitorPreviewSizing(60));
window.addEventListener('orientationchange', () => scheduleDesktopMonitorPreviewSizing(180));
window.addEventListener('load', () => {
  applyPreviewDeviceMode();
  scheduleDesktopMonitorPreviewSizing(100);
});
previewFrame?.addEventListener('load', () => scheduleDesktopMonitorPreviewSizing(60));
document.addEventListener('fullscreenchange', () => scheduleDesktopMonitorPreviewSizing(80));
document.addEventListener('webkitfullscreenchange', () => scheduleDesktopMonitorPreviewSizing(80));



/* SUPER STUDIO UPGRADE: classroom coding platform tools beyond a plain code editor. */
(function initSuperStudioUpgrade() {
  if (window.__MCS_SUPER_STUDIO_READY__) return;
  window.__MCS_SUPER_STUDIO_READY__ = true;
  if (!editor || !editorPanel || !previewPanel) return;

  const STUDIO_STORAGE = {
    snapshots: 'studentCodeStudio.superStudio.snapshots.v1',
    panelOpen: 'studentCodeStudio.superStudio.panelOpen.v1',
    device: 'studentCodeStudio.superStudio.device.v1'
  };
  const STUDIO_SNAPSHOT_LIMIT = 24;
  let studioCoachTimer = null;
  let studioLastRunAt = '';
  let studioCommandIndex = 0;
  let studioDrawerOpen = false;

  function studioReadJSON(key, fallback) {
    try {
      if (typeof loadJSON === 'function') return loadJSON(key, fallback);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function studioSaveJSON(key, value) {
    try {
      if (typeof saveJSON === 'function') saveJSON(key, value);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Super Studio could not save local data.', error);
    }
  }

  function studioEscape(value) {
    return typeof escapeHTML === 'function'
      ? escapeHTML(value)
      : String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function studioButton(id, text, title, className = 'ghost-btn studio-btn') {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.title = title;
    return button;
  }

  function isSuperStudioEnabled() {
    return typeof isStudentAssistanceFeatureEnabled === 'function'
      ? isStudentAssistanceFeatureEnabled('superStudio')
      : false;
  }


  function renderStudioLauncherState() {
    const launcher = document.getElementById('superStudioLauncher');
    if (!launcher) return;
    const enabled = isSuperStudioEnabled();
    const isOpen = enabled && studioDrawerOpen;
    launcher.classList.toggle('is-active', isOpen);
    launcher.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
    launcher.title = isOpen ? 'Hide Super Studio tools' : 'Open optional Super Studio tools';
    launcher.innerHTML = isOpen
      ? '<span>✖</span><strong>Hide Studio</strong>'
      : '<span>🚀</span><strong>Studio</strong>';
  }

  function getStudioOverlayHost() {
    const inEditorFullscreen = document.fullscreenElement === editorPanel || document.body.classList.contains('editor-fullscreen-active');
    return inEditorFullscreen ? editorPanel : document.body;
  }

  function placeStudioOverlay(overlay) {
    if (!overlay) return;
    const host = getStudioOverlayHost();
    if (overlay.parentElement !== host) host.appendChild(overlay);
    overlay.classList.toggle('inside-editor-fullscreen', host === editorPanel);
  }

  function placeAllStudioOverlays() {
    placeStudioOverlay(document.getElementById('studioCommandOverlay'));
    placeStudioOverlay(document.getElementById('studioSnapshotsOverlay'));
  }

  function isDesktopEditorFullscreen() {
    const inEditorFullscreen = document.fullscreenElement === editorPanel || document.body.classList.contains('editor-fullscreen-active');
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    return inEditorFullscreen && !mobile;
  }

  function ensureFullscreenBottomToolDock() {
    let dock = document.getElementById('fullscreenBottomTools');
    if (dock) return dock;
    dock = document.createElement('div');
    dock.id = 'fullscreenBottomTools';
    dock.className = 'fullscreen-bottom-tools hidden';
    dock.setAttribute('aria-label', 'Fullscreen quick tools');
    editorPanel.appendChild(dock);
    return dock;
  }

  function syncFullscreenBottomToolDock() {
    const dock = ensureFullscreenBottomToolDock();
    const launcher = document.getElementById('superStudioLauncher');
    const helperBtn = codeHelperFloatingBtn;
    if (!dock || !launcher || !helperBtn) return;

    const useDock = isDesktopEditorFullscreen();
    dock.classList.toggle('hidden', !useDock);
    launcher.classList.toggle('studio-launcher-docked', useDock);
    helperBtn.classList.toggle('code-helper-docked', useDock);

    if (useDock) {
      if (launcher.parentElement !== dock) dock.appendChild(launcher);
      if (helperBtn.parentElement !== dock) dock.appendChild(helperBtn);
      return;
    }

    if (helperBtn.parentElement === dock) editorPanel.appendChild(helperBtn);
  }

  function placeStudioLauncher() {
    const launcher = document.getElementById('superStudioLauncher');
    const languageTabs = editorPanel.querySelector('.language-tabs');
    const pageActions = document.querySelector('.page-manager-actions');
    if (!launcher || !languageTabs) return;

    if (isDesktopEditorFullscreen()) {
      languageTabs.classList.remove('has-studio-launcher');
      pageActions?.classList.remove('has-studio-launcher');
      launcher.classList.add('studio-launcher-desktop');
      launcher.classList.remove('studio-launcher-mobile');
      syncFullscreenBottomToolDock();
      return;
    }

    const mobile = window.matchMedia('(max-width: 760px)').matches;
    languageTabs.classList.toggle('has-studio-launcher', !mobile);
    pageActions?.classList.toggle('has-studio-launcher', mobile);

    if (mobile && pageActions) {
      launcher.classList.add('studio-launcher-mobile');
      launcher.classList.remove('studio-launcher-desktop');
      const renamePageButton = document.getElementById('renameHtmlPageBtn');
      if (renamePageButton && renamePageButton.parentElement === pageActions) {
        renamePageButton.insertAdjacentElement('afterend', launcher);
      } else if (launcher.parentElement !== pageActions) {
        pageActions.appendChild(launcher);
      }
      syncFullscreenBottomToolDock();
      return;
    }

    launcher.classList.add('studio-launcher-desktop');
    launcher.classList.remove('studio-launcher-mobile');
    pageActions?.classList.remove('has-studio-launcher');
    const renameFilesButton = document.getElementById('renameFilesBtn');
    if (renameFilesButton && renameFilesButton.parentElement === languageTabs) {
      renameFilesButton.insertAdjacentElement('afterend', launcher);
    } else if (launcher.parentElement !== languageTabs) {
      languageTabs.appendChild(launcher);
    }
    syncFullscreenBottomToolDock();
  }

  function ensureStudioToolbar() {
    if (document.getElementById('superStudioToolbar')) return;
    const languageTabs = editorPanel.querySelector('.language-tabs');
    if (!languageTabs) return;

    const launcher = document.createElement('button');
    launcher.id = 'superStudioLauncher';
    launcher.type = 'button';
    launcher.className = 'ghost-btn studio-launcher studio-launcher-desktop';
    launcher.setAttribute('aria-pressed', 'false');
    languageTabs.appendChild(launcher);
    renderStudioLauncherState();
    placeStudioLauncher();

    const toolbar = document.createElement('div');
    toolbar.id = 'superStudioToolbar';
    toolbar.className = 'super-studio-toolbar studio-hidden';
    toolbar.innerHTML = `
      <div class="studio-toolbar-left">
        <span class="studio-badge studio-badge-hot">Super Studio</span>
        <span id="studioQualityChip" class="studio-quality-chip">Code Health --</span>
        <span id="studioLinesChip" class="studio-mini-chip">0 lines</span>
        <span id="studioRunChip" class="studio-mini-chip">Not run yet</span>
      </div>
      <div class="studio-toolbar-actions">
        <button id="studioToggleCoachBtn" class="ghost-btn studio-btn" type="button">Coach</button>
        <button id="studioFormatBtn" class="ghost-btn studio-btn" type="button" title="Format current tab">Format</button>
        <button id="studioSnapshotBtn" class="ghost-btn studio-btn" type="button" title="Save a restorable code checkpoint">Snapshot</button>
        <button id="studioRestoreBtn" class="ghost-btn studio-btn" type="button" title="Restore or delete snapshots">Restore</button>
        <button id="studioCommandBtn" class="ghost-btn studio-btn strong" type="button" title="Open command palette: Ctrl+K">Commands</button>
      </div>
    `;
    languageTabs.insertAdjacentElement('afterend', toolbar);

    const coach = document.createElement('section');
    coach.id = 'superStudioPanel';
    coach.className = 'super-studio-panel collapsed studio-hidden';
    coach.setAttribute('aria-label', 'Super Studio live coach');
    coach.innerHTML = `
      <div class="studio-score-card">
        <div class="studio-score-ring" title="Code Health is a quick coach check, not the final grade."><span id="studioQualityValue">--</span><small>%</small></div>
        <div>
          <p class="section-kicker">Live Coach</p>
          <h3 id="studioCoachTitle">Ready to guide the student</h3>
          <p id="studioCoachMessage">Start typing, then the coach will show the next best fix.</p>
        </div>
      </div>
      <div class="studio-progress-track" aria-hidden="true"><span id="studioProgressFill"></span></div>
      <div id="studioCoachIssues" class="studio-coach-issues"></div>
    `;
    const insertAfter = document.getElementById('structureAlert') || toolbar;
    insertAfter.insertAdjacentElement('afterend', coach);

    document.getElementById('studioToggleCoachBtn')?.setAttribute('aria-pressed', 'false');
    setStudioDrawerOpen(false, { silent: true });
  }

  function setStudioDrawerOpen(open, options = {}) {
    const enabled = isSuperStudioEnabled();
    studioDrawerOpen = Boolean(open) && enabled;
    const launcher = document.getElementById('superStudioLauncher');
    const toolbar = document.getElementById('superStudioToolbar');
    const coach = document.getElementById('superStudioPanel');

    placeStudioLauncher();
    // Keep the launcher visible even while Studio is open, especially on phones.
    // The same button becomes "Hide Studio" so students always have a way to close it.
    launcher?.classList.toggle('studio-hidden', !enabled);
    launcher?.classList.toggle('hidden', !enabled);
    toolbar?.classList.toggle('studio-hidden', !enabled || !studioDrawerOpen);
    coach?.classList.toggle('studio-hidden', !enabled || !studioDrawerOpen);

    document.querySelectorAll('.super-studio-only').forEach(item => item.classList.toggle('hidden', !enabled || !studioDrawerOpen));
    document.body.classList.toggle('super-studio-open', enabled && studioDrawerOpen);
    renderStudioLauncherState();
    if (!enabled || !studioDrawerOpen) {
      coach?.classList.add('collapsed');
      document.getElementById('studioToggleCoachBtn')?.setAttribute('aria-pressed', 'false');
    }
    if (!options.silent) setStatus(studioDrawerOpen ? 'Super Studio opened' : 'Super Studio hidden');
  }

  function ensureStudioModals() {
    if (!document.getElementById('studioCommandOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'studioCommandOverlay';
      overlay.className = 'studio-command-overlay hidden';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'studioCommandTitle');
      overlay.innerHTML = `
        <div class="studio-command-card">
          <div class="studio-command-head">
            <div>
              <p class="section-kicker">Super Studio</p>
              <h2 id="studioCommandTitle">Command Palette</h2>
            </div>
            <button id="studioCloseCommandBtn" class="icon-btn" type="button" aria-label="Close command palette">x</button>
          </div>
          <input id="studioCommandInput" class="studio-command-input" type="search" placeholder="Search action... Example: format, run, snapshot" autocomplete="off" />
          <div id="studioCommandList" class="studio-command-list" role="listbox"></div>
          <p class="studio-command-note">Tip: Press Ctrl+K anytime. Use Enter to run the selected action.</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    if (!document.getElementById('studioSnapshotsOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'studioSnapshotsOverlay';
      overlay.className = 'studio-command-overlay hidden';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'studioSnapshotsTitle');
      overlay.innerHTML = `
        <div class="studio-command-card studio-snapshot-card">
          <div class="studio-command-head">
            <div>
              <p class="section-kicker">Super Studio</p>
              <h2 id="studioSnapshotsTitle">Code Snapshots</h2>
            </div>
            <button id="studioCloseSnapshotsBtn" class="icon-btn" type="button" aria-label="Close snapshots">x</button>
          </div>
          <div id="studioSnapshotsList" class="studio-snapshots-list"></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  }

  function getStudioSnapshots() {
    const snapshots = studioReadJSON(STUDIO_STORAGE.snapshots, []);
    return Array.isArray(snapshots) ? snapshots.filter(Boolean) : [];
  }

  function saveStudioSnapshots(snapshots) {
    studioSaveJSON(STUDIO_STORAGE.snapshots, snapshots.slice(0, STUDIO_SNAPSHOT_LIMIT));
  }

  function getStudioSnapshotTitle() {
    const projectName = appSession?.currentProject?.name || '';
    const activityName = activity?.title || '';
    const pageName = typeof getActiveLanguageFileName === 'function' ? getActiveLanguageFileName(activeLanguage) : activeLanguage;
    return [projectName, activityName, `${String(activeLanguage || 'code').toUpperCase()} ${pageName}`].filter(Boolean).join(' - ') || 'Code checkpoint';
  }

  function saveStudioSnapshot(showToast = true) {
    saveActiveEditor();
    const snapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: getStudioSnapshotTitle(),
      createdAt: new Date().toISOString(),
      projectId: appSession?.currentProjectId || '',
      activityId: activity?.id || selectedActivityId || 'scratch',
      activeLanguage,
      activeFileName: typeof getActiveLanguageFileName === 'function' ? getActiveLanguageFileName(activeLanguage) : '',
      fileNames: typeof getCodeFileNames === 'function' ? getCodeFileNames() : codeFileNames,
      codeStore: JSON.parse(JSON.stringify(normalizeCodeStore(codeStore)))
    };
    const snapshots = [snapshot, ...getStudioSnapshots()].slice(0, STUDIO_SNAPSHOT_LIMIT);
    saveStudioSnapshots(snapshots);
    renderStudioSnapshotsButtonState();
    if (showToast) setStatus('Snapshot saved');
    scheduleStudioCoachUpdate(60);
    return snapshot;
  }

  async function restoreStudioSnapshot(snapshotId) {
    const snapshot = getStudioSnapshots().find(item => item.id === snapshotId);
    if (!snapshot) {
      setStatus('Snapshot not found');
      return;
    }
    if (!await appConfirm(`Restore “${snapshot.title || 'this snapshot'}”? Your current editor content will be replaced.`, {
      title: 'Restore snapshot',
      confirmText: 'Restore',
      danger: true
    })) return;
    saveActiveEditor();
    codeStore = normalizeCodeStore(snapshot.codeStore || {});
    codeFileNames = normalizeCodeFileNames(snapshot.fileNames || codeFileNames || DEFAULT_CODE_FILE_NAMES);
    activeLanguage = ['html', 'css', 'js'].includes(snapshot.activeLanguage) ? snapshot.activeLanguage : activeLanguage;
    const key = activity?.id || selectedActivityId || 'scratch';
    codeByActivity[key] = normalizeCodeStore(codeStore);
    saveCodeFileNames();
    saveCodeByActivity();
    saveCodeStoreForCurrentActivity();
    tabButtons.forEach(tab => tab.classList.toggle('active', tab.dataset.language === activeLanguage));
    loadActiveEditor();
    runCode(false, { scroll: false, trackRun: false, source: 'snapshot' });
    closeStudioSnapshots();
    setStatus('Snapshot restored');
    scheduleStudioCoachUpdate(80);
  }

  async function deleteStudioSnapshot(snapshotId) {
    const snapshot = getStudioSnapshots().find(item => item.id === snapshotId);
    if (!snapshot) return;
    if (!await appConfirm(`Delete “${snapshot.title || 'this snapshot'}”? This checkpoint cannot be recovered.`, {
      title: 'Delete snapshot',
      confirmText: 'Delete',
      danger: true
    })) return;
    saveStudioSnapshots(getStudioSnapshots().filter(item => item.id !== snapshotId));
    renderStudioSnapshots();
    renderStudioSnapshotsButtonState();
    setStatus('Snapshot deleted');
  }

  function renderStudioSnapshotsButtonState() {
    const count = getStudioSnapshots().length;
    const restoreBtn = document.getElementById('studioRestoreBtn');
    if (restoreBtn) restoreBtn.textContent = count ? `Restore (${count})` : 'Restore';
  }

  function formatDateShort(value) {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function renderStudioSnapshots() {
    const list = document.getElementById('studioSnapshotsList');
    if (!list) return;
    const snapshots = getStudioSnapshots();
    if (!snapshots.length) {
      list.innerHTML = '<div class="studio-empty-box"><strong>No snapshots yet.</strong><p>Click Snapshot before big edits so students can roll back safely.</p></div>';
      return;
    }
    list.innerHTML = snapshots.map(item => `
      <article class="studio-snapshot-item" data-snapshot-id="${studioEscape(item.id)}">
        <div>
          <strong>${studioEscape(item.title || 'Code checkpoint')}</strong>
          <small>${studioEscape(formatDateShort(item.createdAt))} - ${studioEscape(String(item.activeLanguage || 'code').toUpperCase())}</small>
        </div>
        <div class="studio-snapshot-actions">
          <button class="primary-btn" type="button" data-snapshot-action="restore">Restore</button>
          <button class="ghost-btn danger" type="button" data-snapshot-action="delete">Delete</button>
        </div>
      </article>
    `).join('');
  }

  function openStudioSnapshots() {
    ensureStudioModals();
    const overlay = document.getElementById('studioSnapshotsOverlay');
    placeStudioOverlay(overlay);
    renderStudioSnapshots();
    overlay?.classList.remove('hidden');
    window.setTimeout(() => overlay?.querySelector('button')?.focus(), 20);
  }

  function closeStudioSnapshots() {
    document.getElementById('studioSnapshotsOverlay')?.classList.add('hidden');
  }

  function cleanTrailingSpaces(value) {
    return String(value || '').split('\n').map(line => line.replace(/[ \t]+$/g, '')).join('\n').trim() + '\n';
  }

  function formatHTMLCode(value) {
    const voidTags = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
    const raw = cleanTrailingSpaces(value)
      .replace(/>\s+</g, '>\n<')
      .replace(/\n{3,}/g, '\n\n');
    const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
    let indent = 0;
    const output = [];
    lines.forEach(line => {
      const closing = /^<\//.test(line);
      const tagMatch = line.match(/^<\s*([a-zA-Z0-9-]+)/);
      const tagName = tagMatch ? tagMatch[1] : '';
      const selfClosing = /^<!|^<\?|\/\s*>$/.test(line) || voidTags.test(tagName);
      const opens = /^<[^!/][^>]*>/.test(line) && !selfClosing && !new RegExp(`</${tagName}\\s*>$`, 'i').test(line);
      if (closing) indent = Math.max(0, indent - 1);
      output.push(`${'  '.repeat(indent)}${line}`);
      if (opens) indent += 1;
    });
    return output.join('\n') + '\n';
  }

  function formatCSSCode(value) {
    const source = cleanTrailingSpaces(value)
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\n{3,}/g, '\n\n');
    let indent = 0;
    return source.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      if (line.startsWith('}')) indent = Math.max(0, indent - 1);
      const out = `${'  '.repeat(indent)}${line}`;
      if (line.endsWith('{')) indent += 1;
      return out;
    }).join('\n') + '\n';
  }

  function formatJSCode(value) {
    const source = cleanTrailingSpaces(value);
    let output = '';
    let indent = 0;
    let quote = '';
    let escaped = false;
    let parenDepth = 0;
    let inLineComment = false;
    let inBlockComment = false;
    const pushNewline = () => {
      output = output.replace(/[ \t]+$/g, '');
      if (!output.endsWith('\n')) output += '\n';
      output += '  '.repeat(Math.max(0, indent));
    };
    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      const next = source[i + 1] || '';
      if (inLineComment) {
        output += char;
        if (char === '\n') {
          inLineComment = false;
          output += '  '.repeat(Math.max(0, indent));
        }
        continue;
      }
      if (inBlockComment) {
        output += char;
        if (char === '*' && next === '/') {
          output += next;
          i += 1;
          inBlockComment = false;
        }
        continue;
      }
      if (quote) {
        output += char;
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === quote) quote = '';
        continue;
      }
      if (char === '/' && next === '/') {
        inLineComment = true;
        output += char + next;
        i += 1;
        continue;
      }
      if (char === '/' && next === '*') {
        inBlockComment = true;
        output += char + next;
        i += 1;
        continue;
      }
      if (char === '"' || char === "'" || char === '`') {
        quote = char;
        output += char;
        continue;
      }
      if (char === '(' || char === '[') parenDepth += 1;
      if (char === ')' || char === ']') parenDepth = Math.max(0, parenDepth - 1);
      if (char === '{') {
        output = output.replace(/[ \t]+$/g, '') + ' {';
        indent += 1;
        pushNewline();
        continue;
      }
      if (char === '}') {
        indent = Math.max(0, indent - 1);
        output = output.replace(/[ \t]+$/g, '');
        if (!output.endsWith('\n')) output += '\n';
        output += `${'  '.repeat(indent)}}`;
        if (next && next !== ';' && next !== ',' && next !== ')' && next !== ']') pushNewline();
        continue;
      }
      if (char === ';' && parenDepth === 0) {
        output += ';';
        pushNewline();
        continue;
      }
      if (char === '\n') {
        if (!output.endsWith('\n')) pushNewline();
        continue;
      }
      output += char;
    }
    return output.split('\n').map(line => line.replace(/[ \t]+$/g, '')).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  function formatActiveCode() {
    if (!editor) return;
    saveActiveEditor();
    const before = editor.value;
    const formatter = activeLanguage === 'html' ? formatHTMLCode : activeLanguage === 'css' ? formatCSSCode : formatJSCode;
    const after = formatter(before);
    if (after === before) {
      setStatus('Already formatted');
      return;
    }
    applyProgrammaticEditorChange(after, Math.min(editor.selectionStart, after.length), Math.min(editor.selectionStart, after.length), 'Code formatted');
    scheduleAutoRun({ delay: 180, reason: 'format' });
    scheduleStudioCoachUpdate(80);
  }

  function getStudioQuality() {
    if (editor && typeof setLanguageFileContent === 'function' && typeof getActiveLanguageFileName === 'function') {
      setLanguageFileContent(activeLanguage, getActiveLanguageFileName(activeLanguage), editor.value);
    }
    const items = typeof getErrorCheckerItems === 'function' ? getErrorCheckerItems() : [];
    const counts = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    const combined = [codeStore.html, codeStore.css, codeStore.js].join('\n');
    const lineCount = combined.split('\n').filter(line => line.trim()).length;
    const errorPenalty = (counts.error || 0) * 22;
    const warningPenalty = (counts.warning || 0) * 10;
    const tipPenalty = Math.min(8, (counts.tip || 0) * 2);
    const effortBonus = Math.min(12, Math.floor(lineCount / 8));
    const pageBonus = Math.min(6, Math.max(0, (getHTMLPageNames?.().length || 1) - 1) * 3);
    const score = Math.max(0, Math.min(100, 78 + effortBonus + pageBonus - errorPenalty - warningPenalty - tipPenalty));
    return { score, items, counts, lineCount };
  }

  function renderStudioCoach() {
    const quality = getStudioQuality();
    const scoreText = Number.isFinite(quality.score) ? String(quality.score) : '--';
    const qualityValue = document.getElementById('studioQualityValue');
    const qualityChip = document.getElementById('studioQualityChip');
    const linesChip = document.getElementById('studioLinesChip');
    const runChip = document.getElementById('studioRunChip');
    const progressFill = document.getElementById('studioProgressFill');
    const coachTitle = document.getElementById('studioCoachTitle');
    const coachMessage = document.getElementById('studioCoachMessage');
    const issuesBox = document.getElementById('studioCoachIssues');
    if (!qualityValue || !issuesBox) return;

    const blockers = quality.items.filter(item => item.type === 'error' || item.type === 'warning');
    const first = blockers[0];
    qualityValue.textContent = scoreText;
    if (qualityChip) qualityChip.textContent = `Code Health ${scoreText}%`;
    if (linesChip) linesChip.textContent = `${quality.lineCount} code line${quality.lineCount === 1 ? '' : 's'}`;
    if (runChip) runChip.textContent = studioLastRunAt ? `Last run ${studioLastRunAt}` : 'Not run yet';
    if (progressFill) progressFill.style.width = `${Math.max(5, quality.score)}%`;

    if (!blockers.length) {
      if (coachTitle) coachTitle.textContent = 'Looks ready for checking';
      if (coachMessage) coachMessage.textContent = 'This is only a quick code health check, not your grade. Click Result for the official rubric score.';
      issuesBox.innerHTML = '<div class="studio-issue-item pass"><strong>Code health looks good</strong><span>No major local issues found. The real score still comes from Result/Rubric.</span></div>'; 
      return;
    }

    if (coachTitle) coachTitle.textContent = first.type === 'error' ? 'Fix this first' : 'Almost there';
    if (coachMessage) coachMessage.textContent = first.fix || first.detail || 'Review the highlighted item before checking the result.';
    issuesBox.innerHTML = blockers.slice(0, 3).map(item => `
      <div class="studio-issue-item ${studioEscape(item.type)}">
        <strong>${studioEscape(item.title)}</strong>
        <span>${studioEscape(item.fix || item.detail || '')}</span>
      </div>
    `).join('');
  }

  function scheduleStudioCoachUpdate(delay = 220) {
    window.clearTimeout(studioCoachTimer);
    studioCoachTimer = window.setTimeout(renderStudioCoach, delay);
  }

  function toggleStudioCoach() {
    const coach = document.getElementById('superStudioPanel');
    if (!coach) return;
    const willOpen = coach.classList.contains('collapsed');
    coach.classList.toggle('collapsed', !willOpen);
    document.getElementById('studioToggleCoachBtn')?.setAttribute('aria-pressed', String(willOpen));
    studioSaveJSON(STUDIO_STORAGE.panelOpen, willOpen);
    setStatus(willOpen ? 'Coach shown' : 'Coach hidden');
  }

  function getStudioActions() {
    return [
      { label: 'Run preview', keywords: 'run preview output ctrl enter', hint: 'Ctrl+Enter', run: () => runCode(true) },
      { label: 'Format current tab', keywords: 'format beautify clean code', hint: 'Format', run: formatActiveCode },
      { label: 'Save snapshot', keywords: 'snapshot checkpoint backup save restore', hint: 'Rollback point', run: () => saveStudioSnapshot(true) },
      { label: 'Open snapshots', keywords: 'restore rollback checkpoints snapshots', hint: 'Restore', run: openStudioSnapshots },
      { label: 'Toggle Auto Run', keywords: 'auto run live preview toggle', hint: autoRunEnabled ? 'Currently on' : 'Currently off', run: toggleAutoRun },
      { label: 'Open Full Editor', keywords: 'full editor focus fullscreen zen', hint: 'Ctrl+Shift+F', run: () => fullEditorBtn?.click() },
      { label: 'Open Full Preview', keywords: 'fullscreen output preview result', hint: 'Preview', run: () => fullPreviewBtn?.click() },
      { label: 'Check Result', keywords: 'rubric score result feedback', hint: 'Rubric', run: () => showResult?.() },
      { label: 'Download ZIP', keywords: 'download zip export files', hint: 'Export', run: () => downloadZipBtn?.click() },
      { label: 'Switch to HTML', keywords: 'html tab', hint: 'Ctrl+1', run: () => switchLanguageByIndex?.(0) },
      { label: 'Switch to CSS', keywords: 'css tab style', hint: 'Ctrl+2', run: () => switchLanguageByIndex?.(1) },
      { label: 'Switch to JavaScript', keywords: 'js javascript tab', hint: 'Ctrl+3', run: () => switchLanguageByIndex?.(2) }
    ];
  }

  function getFilteredStudioActions() {
    const input = document.getElementById('studioCommandInput');
    const query = String(input?.value || '').trim().toLowerCase();
    const actions = getStudioActions();
    return query
      ? actions.filter(action => `${action.label} ${action.keywords || ''} ${action.hint || ''}`.toLowerCase().includes(query))
      : actions;
  }

  function renderStudioCommandList() {
    const list = document.getElementById('studioCommandList');
    if (!list) return;
    const actions = getFilteredStudioActions();
    studioCommandIndex = Math.max(0, Math.min(studioCommandIndex, actions.length - 1));
    if (!actions.length) {
      list.innerHTML = '<div class="studio-empty-box"><strong>No action found.</strong><p>Try run, format, snapshot, or result.</p></div>';
      return;
    }
    list.innerHTML = actions.map((action, index) => `
      <button class="studio-command-item ${index === studioCommandIndex ? 'active' : ''}" type="button" data-command-index="${index}">
        <span>${studioEscape(action.label)}</span>
        <small>${studioEscape(action.hint || '')}</small>
      </button>
    `).join('');
  }

  function runStudioCommand(index = studioCommandIndex) {
    const actions = getFilteredStudioActions();
    const action = actions[index];
    if (!action) return;
    closeStudioCommandPalette();
    window.setTimeout(() => action.run(), 20);
  }

  function openStudioCommandPalette() {
    ensureStudioModals();
    const overlay = document.getElementById('studioCommandOverlay');
    const input = document.getElementById('studioCommandInput');
    placeStudioOverlay(overlay);
    studioCommandIndex = 0;
    if (input) input.value = '';
    renderStudioCommandList();
    overlay?.classList.remove('hidden');
    window.setTimeout(() => input?.focus(), 20);
  }

  function closeStudioCommandPalette() {
    document.getElementById('studioCommandOverlay')?.classList.add('hidden');
  }

  function wireStudioEvents() {
    document.getElementById('superStudioLauncher')?.addEventListener('click', () => {
      if (!isSuperStudioEnabled()) return;
      setStudioDrawerOpen(!studioDrawerOpen);
    });
    window.addEventListener('resize', () => {
      placeStudioLauncher();
      placeAllStudioOverlays();
      setStudioDrawerOpen(studioDrawerOpen, { silent: true });
    });
    document.addEventListener('fullscreenchange', () => {
      placeStudioLauncher();
      placeAllStudioOverlays();
      setStudioDrawerOpen(studioDrawerOpen, { silent: true });
    });
    document.addEventListener('studentAssistanceSettingsChanged', () => {
      placeStudioLauncher();
      setStudioDrawerOpen(false, { silent: true });
    });
    document.getElementById('studioToggleCoachBtn')?.addEventListener('click', toggleStudioCoach);
    document.getElementById('studioFormatBtn')?.addEventListener('click', formatActiveCode);
    document.getElementById('studioSnapshotBtn')?.addEventListener('click', () => saveStudioSnapshot(true));
    document.getElementById('studioRestoreBtn')?.addEventListener('click', openStudioSnapshots);
    document.getElementById('studioCommandBtn')?.addEventListener('click', () => { if (isSuperStudioEnabled()) openStudioCommandPalette(); });

    // Full Editor already has Format and Snapshot inside the Super Studio drawer.
    // Keep the top full-editor bar focused on Run, Auto, Result, and Exit only
    // so buttons do not repeat when Studio is opened.
    document.getElementById('fullscreenFormatBtn')?.remove();
    document.getElementById('fullscreenSnapshotBtn')?.remove();

    document.getElementById('studioCloseCommandBtn')?.addEventListener('click', closeStudioCommandPalette);
    document.getElementById('studioCommandOverlay')?.addEventListener('click', event => {
      if (event.target.id === 'studioCommandOverlay') closeStudioCommandPalette();
      const item = event.target.closest('.studio-command-item');
      if (item) runStudioCommand(Number(item.dataset.commandIndex || 0));
    });
    document.getElementById('studioCommandInput')?.addEventListener('input', () => {
      studioCommandIndex = 0;
      renderStudioCommandList();
    });
    document.getElementById('studioCommandInput')?.addEventListener('keydown', event => {
      const actions = getFilteredStudioActions();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        studioCommandIndex = Math.min(actions.length - 1, studioCommandIndex + 1);
        renderStudioCommandList();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        studioCommandIndex = Math.max(0, studioCommandIndex - 1);
        renderStudioCommandList();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        runStudioCommand(studioCommandIndex);
      } else if (event.key === 'Escape') {
        closeStudioCommandPalette();
      }
    });

    document.getElementById('studioCloseSnapshotsBtn')?.addEventListener('click', closeStudioSnapshots);
    document.getElementById('studioSnapshotsOverlay')?.addEventListener('click', event => {
      if (event.target.id === 'studioSnapshotsOverlay') closeStudioSnapshots();
      const item = event.target.closest('[data-snapshot-id]');
      const action = event.target.closest('[data-snapshot-action]');
      if (!item || !action) return;
      const snapshotId = item.dataset.snapshotId || '';
      if (action.dataset.snapshotAction === 'restore') restoreStudioSnapshot(snapshotId);
      if (action.dataset.snapshotAction === 'delete') deleteStudioSnapshot(snapshotId);
    });

    editor.addEventListener('input', () => scheduleStudioCoachUpdate(260));
    tabButtons.forEach(button => button.addEventListener('click', () => scheduleStudioCoachUpdate(120)));
    previewFrame?.addEventListener('load', () => scheduleStudioCoachUpdate(180));

    document.addEventListener('keydown', event => {
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      if (isCtrlOrMeta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isSuperStudioEnabled()) {
          setStudioDrawerOpen(true, { silent: true });
          openStudioCommandPalette();
        }
      }
      if (event.key === 'Escape') {
        closeStudioCommandPalette();
        closeStudioSnapshots();
      }
    });
  }

  function wrapStudioRunCode() {
    if (window.__MCS_SUPER_STUDIO_RUN_WRAPPED__) return;
    window.__MCS_SUPER_STUDIO_RUN_WRAPPED__ = true;
    if (typeof runCode !== 'function') return;
    const originalRunCode = runCode;
    runCode = function superStudioRunCodeWrapper(showMessage = true, options = {}) {
      const result = originalRunCode.apply(this, arguments);
      const now = new Date();
      studioLastRunAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      scheduleStudioCoachUpdate(220);
      return result;
    };
  }

  ensureStudioToolbar();
  ensureStudioModals();
  wireStudioEvents();
  wrapStudioRunCode();
  renderStudioSnapshotsButtonState();
  setStudioDrawerOpen(false, { silent: true });
  placeStudioLauncher();
  syncFullscreenBottomToolDock();
  window.addEventListener('resize', () => {
    placeStudioLauncher();
    syncFullscreenBottomToolDock();
  });
  document.addEventListener('fullscreenchange', () => {
    placeAllStudioOverlays();
    placeStudioLauncher();
    syncFullscreenBottomToolDock();
  });
  new MutationObserver(() => {
    placeStudioLauncher();
    syncFullscreenBottomToolDock();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (isSuperStudioEnabled()) scheduleStudioCoachUpdate(120);
})();


/* Final mobile scroll guard: remove stale scroll-lock classes when their overlay is already closed. */
(function installMobileScrollRecovery() {
  function isPhoneMode() {
    return document.documentElement?.dataset?.deviceMode === 'phone' || window.matchMedia('(max-width: 760px)').matches;
  }

  function isVisibleOverlay(element) {
    if (!element) return false;
    if (element.classList.contains('hidden') || element.classList.contains('collapsed-card')) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function syncScrollLocks() {
    if (!isPhoneMode()) return;
    const body = document.body;
    const activityOpen = isVisibleOverlay(document.getElementById('activityCard'));
    const studentLoginOpen = isVisibleOverlay(document.getElementById('studentLoginOverlay')) || isVisibleOverlay(document.getElementById('changePasswordOverlay')) || isVisibleOverlay(document.getElementById('projectNameOverlay'));
    const dashboardOpen = isVisibleOverlay(document.getElementById('studentDashboardScreen'));
    const entryOpen = isVisibleOverlay(document.getElementById('entryGate'));
    const adminOpen = isVisibleOverlay(document.getElementById('adminOverlay'));
    const realPreviewFullscreen = Boolean(document.fullscreenElement === document.getElementById('previewPanel') || document.webkitFullscreenElement === document.getElementById('previewPanel'));
    const realEditorFullscreen = Boolean(document.fullscreenElement === document.getElementById('editorPanel') || document.webkitFullscreenElement === document.getElementById('editorPanel'));

    if (!activityOpen) body.classList.remove('activity-popup-open');
    if (!studentLoginOpen) body.classList.remove('student-auth-open');
    if (!dashboardOpen) body.classList.remove('student-dashboard-active');
    if (!entryOpen) body.classList.remove('entry-gate-active');
    if (!adminOpen) body.classList.remove('admin-open');
    if (!realPreviewFullscreen && body.classList.contains('preview-fullscreen-active') && !body.classList.contains('preview-inside-editor-fullscreen')) {
      body.classList.remove('preview-fullscreen-active', 'preview-has-back-editor');
    }
    if (!realEditorFullscreen && body.classList.contains('editor-fullscreen-active')) {
      body.classList.remove('editor-fullscreen-active', 'preview-inside-editor-fullscreen');
    }

    const hasLock = body.classList.contains('entry-gate-active') || body.classList.contains('student-dashboard-active') || body.classList.contains('student-auth-open') || body.classList.contains('student-route-lock') || body.classList.contains('admin-open') || body.classList.contains('activity-popup-open') || body.classList.contains('preview-fullscreen-active') || body.classList.contains('editor-fullscreen-active');
    if (!hasLock) {
      body.style.overflow = '';
      body.style.overflowY = '';
      body.style.position = '';
      body.style.height = '';
      document.documentElement.style.overflowY = '';
    }
  }

  window.addEventListener('load', () => window.setTimeout(syncScrollLocks, 80));
  window.addEventListener('resize', () => window.setTimeout(syncScrollLocks, 80));
  document.addEventListener('fullscreenchange', () => window.setTimeout(syncScrollLocks, 120));
  document.addEventListener('webkitfullscreenchange', () => window.setTimeout(syncScrollLocks, 120));
  document.addEventListener('click', () => window.setTimeout(syncScrollLocks, 60), true);
  document.addEventListener('touchend', () => window.setTimeout(syncScrollLocks, 60), true);
})();


/* HARD FINAL PHONE SCROLL RECOVERY
   If the normal editor workspace is visible on phone, remove stale scroll locks. */
(function installHardPhoneEditorScrollFix() {
  function isPhone() {
    return document.documentElement?.dataset?.deviceMode === 'phone' || window.matchMedia('(max-width: 820px)').matches;
  }

  function isVisible(el) {
    if (!el || el.classList.contains('hidden')) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function unlockEditorScrollWhenSafe() {
    if (!isPhone()) return;
    const body = document.body;
    const editorVisible = isVisible(document.getElementById('editorPanel')) && isVisible(document.querySelector('.app-shell'));
    const realFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    const blockingOverlayVisible = isVisible(document.getElementById('entryGate')) ||
      isVisible(document.getElementById('studentLoginOverlay')) ||
      isVisible(document.getElementById('changePasswordOverlay')) ||
      isVisible(document.getElementById('projectNameOverlay')) ||
      isVisible(document.getElementById('adminOverlay')) ||
      isVisible(document.getElementById('studentDashboardScreen'));

    if (editorVisible && !realFullscreen && !blockingOverlayVisible) {
      body.classList.add('editor-scroll-unlocked');
      body.classList.remove(
        'entry-gate-active',
        'student-dashboard-active',
        'student-auth-open',
        'student-route-lock',
        'admin-open',
        'activity-popup-open',
        'preview-fullscreen-active',
        'editor-fullscreen-active',
        'preview-inside-editor-fullscreen'
      );
      body.style.overflow = 'auto';
      body.style.overflowY = 'auto';
      body.style.position = 'static';
      body.style.height = 'auto';
      document.documentElement.style.overflowY = 'auto';
    } else {
      body.classList.remove('editor-scroll-unlocked');
    }

    const fullBtn = document.getElementById('fullPreviewBtn');
    if (fullBtn && isPhone() && document.documentElement.dataset.theme === 'dark') {
      fullBtn.style.color = '#07111f';
      fullBtn.style.webkitTextFillColor = '#07111f';
    }
  }

  ['load', 'resize', 'orientationchange', 'fullscreenchange', 'webkitfullscreenchange'].forEach(name => {
    window.addEventListener(name, () => setTimeout(unlockEditorScrollWhenSafe, 60), true);
  });
  ['click', 'touchstart', 'touchend', 'pointerup', 'scroll'].forEach(name => {
    document.addEventListener(name, () => setTimeout(unlockEditorScrollWhenSafe, 30), true);
  });
  setInterval(unlockEditorScrollWhenSafe, 700);
  unlockEditorScrollWhenSafe();
})();


/* Emergency final mobile fix: prevent duplicated Full text and restore normal page scroll. */
(function installEmergencyPhonePreviewAndScrollFix() {
  function isPhone() {
    return document.documentElement?.dataset?.deviceMode === 'phone' || window.matchMedia('(max-width: 820px)').matches;
  }

  function isVisible(el) {
    if (!el || el.classList.contains('hidden')) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && rect.width > 0 && rect.height > 0;
  }

  function normalizePreviewButtonLabels() {
    if (!isPhone()) return;
    const monitorBtn = document.getElementById('desktopPreviewBtn');
    const fullBtn = document.getElementById('fullPreviewBtn');
    const resultBtn = document.getElementById('resultFromPreviewBtn');
    if (monitorBtn) monitorBtn.textContent = monitorBtn.classList.contains('active') ? '📱 Phone' : '🖥️ Monitor';
    if (fullBtn) {
      fullBtn.textContent = '⛶ Full';
      fullBtn.style.color = '#07111f';
      fullBtn.style.webkitTextFillColor = '#07111f';
    }
    if (resultBtn) resultBtn.textContent = '✓ Result';
  }

  function restoreNormalEditorScroll() {
    if (!isPhone()) return;
    const body = document.body;
    const editorVisible = isVisible(document.getElementById('editorPanel')) && isVisible(document.querySelector('.app-shell'));
    const realFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    const blockingOverlayVisible = isVisible(document.getElementById('entryGate')) ||
      isVisible(document.getElementById('studentLoginOverlay')) ||
      isVisible(document.getElementById('changePasswordOverlay')) ||
      isVisible(document.getElementById('projectNameOverlay')) ||
      isVisible(document.getElementById('studentDashboardScreen')) ||
      isVisible(document.getElementById('adminOverlay'));

    normalizePreviewButtonLabels();

    if (editorVisible && !realFullscreen && !blockingOverlayVisible) {
      body.classList.add('mobile-editor-normal', 'editor-scroll-unlocked');
      body.classList.remove(
        'entry-gate-active',
        'student-dashboard-active',
        'student-auth-open',
        'student-route-lock',
        'admin-open',
        'activity-popup-open',
        'preview-fullscreen-active',
        'preview-has-back-editor',
        'editor-fullscreen-active',
        'preview-inside-editor-fullscreen'
      );
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
      body.style.overflow = 'auto';
      body.style.overflowY = 'auto';
      body.style.position = 'static';
      body.style.height = 'auto';
      body.style.maxHeight = 'none';
      body.style.touchAction = 'pan-y';
    } else {
      body.classList.remove('mobile-editor-normal');
    }
  }

  ['load', 'resize', 'orientationchange', 'fullscreenchange', 'webkitfullscreenchange'].forEach(eventName => {
    window.addEventListener(eventName, () => window.setTimeout(restoreNormalEditorScroll, 50), true);
  });
  ['click', 'touchstart', 'touchend', 'pointerup', 'input', 'change'].forEach(eventName => {
    document.addEventListener(eventName, () => window.setTimeout(restoreNormalEditorScroll, 20), true);
  });
  window.setInterval(restoreNormalEditorScroll, 500);
  restoreNormalEditorScroll();
})();


/* Final guard: phone preview Result button must always have readable text. */
(function keepPhonePreviewResultButtonReadable() {
  function isPhoneMode() {
    return document.documentElement?.dataset?.deviceMode === 'phone' || window.matchMedia('(max-width: 820px)').matches;
  }
  function fix() {
    if (!isPhoneMode()) return;
    const btn = document.getElementById('resultFromPreviewBtn');
    if (!btn) return;
    btn.textContent = '✓ Result';
    btn.style.color = '#ffffff';
    btn.style.webkitTextFillColor = '#ffffff';
    btn.style.fontSize = '0.76rem';
    btn.style.fontWeight = '1000';
    btn.style.opacity = '1';
  }
  ['load', 'resize', 'orientationchange'].forEach(name => window.addEventListener(name, () => setTimeout(fix, 30), true));
  ['click', 'touchend', 'pointerup'].forEach(name => document.addEventListener(name, () => setTimeout(fix, 30), true));
  setInterval(fix, 800);
  fix();
})();


/* Desktop/mobile safety: Practice Without Login must always open the editor. */
(function installPracticeWithoutLoginHardClickFix() {
  function handlePracticeClick(event) {
    const button = event.target && event.target.closest && event.target.closest('#continueGuestBtn, #studentLoginGuestBtn');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    continueAsGuest();
  }
  document.addEventListener('click', handlePracticeClick, true);
})();
