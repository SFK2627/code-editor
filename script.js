const editor = document.getElementById('codeEditor');
const previewFrame = document.getElementById('previewFrame');
const runBtn = document.getElementById('runBtn');
const resultBtn = document.getElementById('resultBtn');
const saveBtn = document.getElementById('saveBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const resetBtn = document.getElementById('resetBtn');
const clearBtn = document.getElementById('clearBtn');
const themeToggle = document.getElementById('themeToggle');
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
const statusBadge = document.getElementById('statusBadge');
const editorInfo = document.getElementById('editorInfo');
const structureAlert = document.getElementById('structureAlert');
const tabButtons = document.querySelectorAll('.tab-btn');
const resultContent = document.getElementById('resultContent');
const activityTitle = document.getElementById('activityTitle');
const activityDescription = document.getElementById('activityDescription');
const activitySelect = document.getElementById('activitySelect');
const resetActivityCodeBtn = document.getElementById('resetActivityCodeBtn');
const activityCard = document.getElementById('activityCard');
const activityWarning = document.getElementById('activityWarning');
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
const exitPreviewBtn = document.getElementById('exitPreviewBtn');
const adminOverlay = document.getElementById('adminOverlay');
const closeAdminBtn = document.getElementById('closeAdminBtn');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const logoutAdminBtn = document.getElementById('logoutAdminBtn');
const unlockAdminBtn = document.getElementById('unlockAdminBtn');
const pinScreen = document.getElementById('pinScreen');
const adminForm = document.getElementById('adminForm');
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
const rubricImagePreview = document.getElementById('rubricImagePreview');
const rubricImageEmpty = document.getElementById('rubricImageEmpty');
const readRubricImageBtn = document.getElementById('readRubricImageBtn');
const clearRubricImageBtn = document.getElementById('clearRubricImageBtn');
const rubricImageStatus = document.getElementById('rubricImageStatus');

const STORAGE_KEYS = {
  codeByActivity: 'studentCodeStudio.codeByActivity.htmlOnlyDefault.v2',
  activities: 'studentCodeStudio.activities.v3',
  selectedActivityId: 'studentCodeStudio.selectedActivityId.htmlOnlyDefault.v2',
  legacyCode: 'studentCodeStudio.codeStore.v2',
  legacyActivity: 'studentCodeStudio.activity.v2',
  theme: 'studentCodeStudio.theme',
  layout: 'studentCodeStudio.previewLayout',
  editorZoom: 'studentCodeStudio.editorZoom.v1'
};


const STARTER_CODE_VERSION_KEY = 'studentCodeStudio.starterCodeVersion';
const CURRENT_STARTER_CODE_VERSION = 'html-only-default-2026-07-09-v2';

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

const defaultActivities = [
  defaultActivity,
  {
    id: 'activity-profile-card',
    title: 'Activity 2: Student Profile Card',
    description: 'Create a complete HTML document that shows a student profile card. Include a heading, short paragraph, image placeholder or icon, and a button or link. CSS is encouraged for card design.',
    passingScore: 75,
    criteria: [
      { id: createId(), title: 'Uses complete HTML document structure', points: 4, rule: 'full_html_structure', target: '' },
      { id: createId(), title: 'Creates a main profile heading', points: 2, rule: 'has_heading', target: '' },
      { id: createId(), title: 'Adds a short profile paragraph', points: 2, rule: 'has_paragraph', target: '' },
      { id: createId(), title: 'Uses a profile card container', points: 2, rule: 'html_contains', target: 'class="card"' },
      { id: createId(), title: 'Adds an image or visual element', points: 2, rule: 'has_image', target: '' },
      { id: createId(), title: 'Uses CSS to design the card', points: 3, rule: 'uses_css_property', target: '' },
      { id: createId(), title: 'Output shows readable content', points: 2, rule: 'output_has_visible_text', target: '' }
    ]
  },
  {
    id: 'activity-interactive-button',
    title: 'Activity 3: Interactive Button',
    description: 'Create a complete HTML document with a button. Use JavaScript so that clicking the button changes a message, color, class, or content on the page.',
    passingScore: 75,
    criteria: [
      { id: createId(), title: 'Uses complete HTML document structure', points: 4, rule: 'full_html_structure', target: '' },
      { id: createId(), title: 'Includes a button', points: 2, rule: 'has_button', target: '' },
      { id: createId(), title: 'Uses JavaScript event listener or onclick', points: 4, rule: 'uses_event_listener', target: '' },
      { id: createId(), title: 'JavaScript changes something on the page', points: 4, rule: 'js_changes_page', target: '' },
      { id: createId(), title: 'Output has no JavaScript error', points: 2, rule: 'no_runtime_error', target: '' },
      { id: createId(), title: 'Output shows readable content', points: 2, rule: 'output_has_visible_text', target: '' }
    ]
  }
];

const ruleOptions = [
  { value: 'html_contains', label: 'HTML contains target' },
  { value: 'css_contains', label: 'CSS contains target' },
  { value: 'js_contains', label: 'JavaScript contains target' },
  { value: 'output_contains', label: 'Output contains target text' },
  { value: 'full_html_structure', label: 'Complete HTML structure' },
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
  html_contains: 'Checks if the HTML code includes the target keyword, tag, class, or ID.',
  css_contains: 'Checks if the CSS code includes the target property, value, selector, or keyword.',
  js_contains: 'Checks if the JavaScript code includes the target keyword or method.',
  output_contains: 'Checks if the preview output displays the target text.',
  full_html_structure: 'Checks for <!DOCTYPE html>, html, head, title, and body tags. Best for activities that require complete HTML structure.',
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

let activities = getInitialActivities();
let selectedActivityId = getInitialSelectedActivityId();
let activity = getActivityById(selectedActivityId);
let codeByActivity = getInitialCodeByActivity();
let codeStore = activity ? getCodeStoreForActivity(activity.id) : normalizeCodeStore(starterCode);
let activeLanguage = 'html';
let activeSuggestionIndex = 0;
let currentMatches = [];
let currentWord = '';
let currentSuggestionStart = 0;
let suggestionHideTimer = null;
let lastSuggestionInputAt = 0;
let adminUnlocked = false;
let firebaseState = { app: null, auth: null, db: null, ready: false, starting: null };
let adminEditingActivityId = activity?.id || activities[0]?.id || '';
let selectedRubricImageDataUrl = '';
const BASE_EDITOR_FONT_SIZE = 15;
const MIN_EDITOR_FONT_SIZE = 12;
const MAX_EDITOR_FONT_SIZE = 26;
let editorFontSize = Number(loadJSON(STORAGE_KEYS.editorZoom, BASE_EDITOR_FONT_SIZE)) || BASE_EDITOR_FONT_SIZE;
let activeTagMatches = [];
const EDITOR_HISTORY_LIMIT = 250;
let editorHistoryByKey = {};
let isRestoringEditorHistory = false;

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
    codeSuggestion('body', 'body {\n  font-family: Arial, sans-serif;\n  background: #f0f7ff;\n  color: #17324d;\n  padding: 40px;\n}', 'Style the whole page.'),
    codeSuggestion('color', 'color: #2563eb;', 'Text color.'),
    codeSuggestion('background', 'background: #f0f7ff;', 'Background color.'),
    codeSuggestion('font-size', 'font-size: 24px;', 'Text size.'),
    codeSuggestion('font-family', 'font-family: Arial, sans-serif;', 'Font style.'),
    codeSuggestion('font-weight', 'font-weight: bold;', 'Text thickness.'),
    codeSuggestion('text-align', 'text-align: center;', 'Text alignment.'),
    codeSuggestion('width', 'width: 100%;', 'Element width.'),
    codeSuggestion('max-width', 'max-width: 600px;', 'Maximum width.'),
    codeSuggestion('height', 'height: 200px;', 'Element height.'),
    codeSuggestion('border', 'border: 1px solid #d7e3f3;', 'Element border.'),
    codeSuggestion('border-radius', 'border-radius: 16px;', 'Rounded corners.'),
    codeSuggestion('padding', 'padding: 20px;', 'Inside spacing.'),
    codeSuggestion('margin', 'margin: 20px;', 'Outside spacing.'),
    codeSuggestion('margin auto', 'margin: 0 auto;', 'Center a block.'),
    codeSuggestion('display flex', 'display: flex;', 'Flexible layout.'),
    codeSuggestion('display grid', 'display: grid;', 'Grid layout.'),
    codeSuggestion('justify-content', 'justify-content: center;', 'Horizontal alignment.'),
    codeSuggestion('align-items', 'align-items: center;', 'Vertical alignment.'),
    codeSuggestion('gap', 'gap: 12px;', 'Space between items.'),
    codeSuggestion('box-shadow', 'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);', 'Shadow effect.'),
    codeSuggestion('hover', 'button:hover {\n  transform: scale(1.03);\n}', 'Hover effect.'),
    codeSuggestion('grid-template-columns', 'grid-template-columns: repeat(3, 1fr);', 'Grid columns.'),
    codeSuggestion('media query', '@media (max-width: 600px) {\n  body {\n    padding: 20px;\n  }\n}', 'Responsive design.')
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

function loadJSON(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : clone(fallback);
  } catch (error) {
    console.warn(`Could not load ${key}`, error);
    return clone(fallback);
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeCodeStore(rawCode) {
  const safeCode = rawCode && typeof rawCode === 'object' ? rawCode : {};
  return {
    html: typeof safeCode.html === 'string' ? safeCode.html : starterCode.html,
    css: typeof safeCode.css === 'string' ? safeCode.css : starterCode.css,
    js: typeof safeCode.js === 'string' ? safeCode.js : starterCode.js
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
    rule: safeCriterion.rule || 'html_contains',
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
    criteria: criteria.length ? criteria.map(normalizeCriterion) : clone(defaultActivity.criteria).map(criterion => normalizeCriterion({ ...criterion, id: createId() }))
  };
}

function normalizeActivities(rawActivities) {
  const source = Array.isArray(rawActivities) && rawActivities.length ? rawActivities : clone(defaultActivities);
  return source.map(item => normalizeActivity(item));
}

function getInitialActivities() {
  const savedActivities = loadJSON(STORAGE_KEYS.activities, null);
  if (Array.isArray(savedActivities) && savedActivities.length) {
    return normalizeActivities(savedActivities);
  }

  const legacyActivity = loadJSON(STORAGE_KEYS.legacyActivity, null);
  if (legacyActivity && typeof legacyActivity === 'object' && legacyActivity.title) {
    return [normalizeActivity({ ...legacyActivity, id: legacyActivity.id || 'activity-imported-rubric' })];
  }

  return normalizeActivities(defaultActivities);
}

function getInitialSelectedActivityId() {
  const savedId = loadJSON(STORAGE_KEYS.selectedActivityId, '');
  return activities.some(item => item.id === savedId) ? savedId : '';
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
  if (options.cloud === true) {
    saveActivitiesToCloud();
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
  const config = window.MCS_FIREBASE_CONFIG || {};
  return Boolean(
    window.MCS_FIREBASE_ENABLED === true &&
    window.firebase &&
    config.apiKey &&
    config.projectId &&
    !String(config.apiKey).includes('PASTE_') &&
    !String(config.projectId).includes('PASTE_')
  );
}

async function initFirebase() {
  if (!hasFirebaseConfig()) {
    setStatus('Local mode');
    return false;
  }

  if (firebaseState.ready) return true;
  if (firebaseState.starting) return firebaseState.starting;

  firebaseState.starting = Promise.resolve().then(() => {
    try {
      if (!firebase.apps.length) {
        firebaseState.app = firebase.initializeApp(window.MCS_FIREBASE_CONFIG);
      } else {
        firebaseState.app = firebase.app();
      }

      firebaseState.auth = firebase.auth();
      firebaseState.db = firebase.firestore();
      firebaseState.ready = true;
      watchTeacherAuth();
      setStatus('Firebase connected');
      return true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      setLoginError('Firebase is not ready. Check firebase-config.js and internet connection.');
      setStatus('Firebase error');
      return false;
    }
  });

  return firebaseState.starting;
}

function getCloudActivitiesRef() {
  const collectionName = window.MCS_FIREBASE_COLLECTION || 'webCodeEditor';
  const docId = window.MCS_FIREBASE_DOCUMENT_ID || 'grade8-mcsian';
  return firebaseState.db.collection(collectionName).doc(docId);
}

async function loadActivitiesFromCloud() {
  const ready = await initFirebase();
  if (!ready) return false;

  try {
    const snap = await getCloudActivitiesRef().get();
    if (!snap.exists) {
      setStatus('Ready');
      return false;
    }

    const data = snap.data() || {};
    if (!Array.isArray(data.activities) || !data.activities.length) return false;

    activities = normalizeActivities(data.activities);
    saveActivities({ cloud: false });

    if (!activities.some(item => item.id === selectedActivityId)) {
      selectedActivityId = activities[0]?.id || '';
      saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
    }

    activity = getActivityById(selectedActivityId);
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
    console.error('Cloud load failed:', error);
    setStatus('Cloud load failed');
    return false;
  }
}

async function saveActivitiesToCloud() {
  const ready = await initFirebase();
  if (!ready) {
    setLoginError('Firebase is not ready. Check firebase-config.js, internet connection, and Firebase project setup.');
    return false;
  }

  if (!firebaseState.auth.currentUser) {
    setLoginError('Please login as teacher before saving activities/rubrics.');
    return false;
  }

  try {
    await getCloudActivitiesRef().set({
      title: 'Grade 8 MCSian Web Code Editor',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: firebaseState.auth.currentUser.email || '',
      activities: activities.map(item => normalizeActivity(item))
    }, { merge: true });
    setStatus('Saved to Firebase');
    return true;
  } catch (error) {
    console.error('Cloud save failed:', error);
    setLoginError(getFriendlyAuthError(error));
    setStatus('Firebase save failed');
    return false;
  }
}

function setLoginError(message = '') {
  if (!loginError) return;
  loginError.textContent = message;
  loginError.classList.toggle('hidden', !message);
}

function getFriendlyAuthError(error) {
  const code = error?.code || '';
  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) return 'Login failed. Check the teacher email and password.';
  if (code.includes('auth/user-not-found')) return 'No teacher account was found with that email. Add it in Firebase Authentication > Users.';
  if (code.includes('auth/unauthorized-domain')) return 'This domain is not authorized. Add sfk2627.github.io in Firebase Authentication > Settings > Authorized domains.';
  if (code.includes('auth/operation-not-allowed')) return 'Email/Password login is not enabled in Firebase Authentication.';
  if (code.includes('permission-denied')) return 'Login is okay, but Firestore Rules blocked saving. Publish the updated firestore.rules.';
  return error?.message || 'Something went wrong. Please try again.';
}

async function loginTeacher() {
  setLoginError('');
  const ready = await initFirebase();
  if (!ready || !firebaseState.auth) {
    setLoginError('Firebase is not ready. Check firebase-config.js, internet connection, and Firebase project setup.');
    return;
  }

  const email = adminEmail?.value.trim() || '';
  const password = adminPassword?.value || '';

  if (!email || !password) {
    setLoginError('Please enter teacher email and password.');
    return;
  }

  unlockAdminBtn.disabled = true;
  const oldText = unlockAdminBtn.textContent;
  unlockAdminBtn.textContent = 'Logging in...';

  try {
    await firebaseState.auth.signInWithEmailAndPassword(email, password);
    adminUnlocked = true;
    showAdminForm();
    setStatus('Teacher logged in');
  } catch (error) {
    console.error('Teacher login failed:', error);
    setLoginError(getFriendlyAuthError(error));
  } finally {
    unlockAdminBtn.disabled = false;
    unlockAdminBtn.textContent = oldText;
  }
}

async function logoutTeacher() {
  if (!firebaseState.auth) return;
  await firebaseState.auth.signOut();
  adminUnlocked = false;
  adminForm.classList.add('hidden');
  pinScreen.classList.remove('hidden');
  logoutAdminBtn?.classList.add('hidden');
  if (adminPassword) adminPassword.value = '';
  setStatus('Teacher logged out');
}

function watchTeacherAuth() {
  if (!firebaseState.auth || watchTeacherAuth.started) return;
  watchTeacherAuth.started = true;
  firebaseState.auth.onAuthStateChanged(user => {
    adminUnlocked = Boolean(user);
    logoutAdminBtn?.classList.toggle('hidden', !user);
    if (user) {
      setLoginError('');
    }
  });
}


function setRubricImageStatus(message = '', type = '') {
  if (!rubricImageStatus) return;
  rubricImageStatus.textContent = message;
  rubricImageStatus.className = `rubric-image-status ${type || ''}`.trim();
  rubricImageStatus.classList.toggle('hidden', !message);
}

function clearRubricImageSelection() {
  selectedRubricImageDataUrl = '';
  if (rubricImageInput) rubricImageInput.value = '';
  rubricImagePreview?.classList.add('hidden');
  if (rubricImagePreview) rubricImagePreview.removeAttribute('src');
  rubricImageEmpty?.classList.remove('hidden');
  setRubricImageStatus('');
}

function handleRubricImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    clearRubricImageSelection();
    return;
  }

  if (!file.type.startsWith('image/')) {
    clearRubricImageSelection();
    setRubricImageStatus('Please choose a valid image file.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    selectedRubricImageDataUrl = String(reader.result || '');
    if (rubricImagePreview) {
      rubricImagePreview.src = selectedRubricImageDataUrl;
      rubricImagePreview.classList.remove('hidden');
    }
    rubricImageEmpty?.classList.add('hidden');
    setRubricImageStatus('Image ready. Click Read Image & Fill Table.', 'success');
  };
  reader.onerror = () => setRubricImageStatus('Could not read the image. Please try another file.', 'error');
  reader.readAsDataURL(file);
}

function getRubricImageEndpoint() {
  return String(window.MCS_RUBRIC_IMAGE_ENDPOINT || '').trim();
}

async function getTeacherIdTokenForImport() {
  const ready = await initFirebase();
  if (!ready || !firebaseState.auth?.currentUser) {
    throw new Error('Please login as teacher before importing a rubric image.');
  }
  return firebaseState.auth.currentUser.getIdToken();
}

function inferAutoCheckRuleFromText(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('complete html') || text.includes('html structure') || text.includes('doctype')) return { rule: 'full_html_structure', target: '' };
  if (text.includes('properly closed') || text.includes('closing tag') || text.includes('balanced tag')) return { rule: 'balanced_html_tags', target: '' };
  if (text.includes('heading') || text.includes('h1') || text.includes('title heading')) return { rule: 'has_heading', target: '' };
  if (text.includes('paragraph') || text.includes('content') || text.includes('description')) return { rule: 'has_paragraph', target: '' };
  if (text.includes('button')) return { rule: 'has_button', target: '' };
  if (text.includes('link') || text.includes('hyperlink')) return { rule: 'has_link', target: '' };
  if (text.includes('image') || text.includes('picture') || text.includes('img')) return { rule: 'has_image', target: '' };
  if (text.includes('list') || text.includes('bullet')) return { rule: 'has_list', target: '' };
  if (text.includes('css') || text.includes('style') || text.includes('design') || text.includes('color') || text.includes('layout')) return { rule: 'uses_css_property', target: '' };
  if (text.includes('javascript') || text.includes('script') || text.includes('click') || text.includes('interactive')) return { rule: 'uses_event_listener', target: '' };
  if (text.includes('output') || text.includes('visible')) return { rule: 'output_has_visible_text', target: '' };
  return { rule: 'minimum_effort', target: '' };
}

function getImportedLevel(importedCriterion, levelKey, maxPoints) {
  const level = importedCriterion?.levels?.[levelKey] || {};
  const defaults = normalizeLevels(null, maxPoints)[levelKey];
  return {
    label: rubricLevels.find(item => item.key === levelKey)?.label || levelKey,
    points: Number.isFinite(Number(level.points)) ? Number(level.points) : defaults.points,
    description: String(level.description || defaults.description || '').trim()
  };
}

function normalizeImportedRubricPayload(payload) {
  const source = payload?.activity || payload || {};
  const rawCriteria = Array.isArray(source.criteria) ? source.criteria : [];
  const criteria = rawCriteria.map((item, index) => {
    const title = String(item.title || item.criterion || `Criterion ${index + 1}`).trim();
    const descriptions = rubricLevels.map(level => item.levels?.[level.key]?.description || '').join(' ');
    const inferred = inferAutoCheckRuleFromText(title, `${item.description || ''} ${descriptions}`);
    const maxFromLevels = Math.max(
      ...rubricLevels.map(level => Number(item.levels?.[level.key]?.points)).filter(Number.isFinite),
      Number(item.points) || 0,
      4
    );
    return normalizeCriterion({
      id: createId(),
      title,
      points: maxFromLevels,
      rule: item.rule || inferred.rule,
      target: item.target || inferred.target,
      levels: rubricLevels.reduce((levels, level) => {
        levels[level.key] = getImportedLevel(item, level.key, maxFromLevels);
        return levels;
      }, {})
    });
  }).filter(item => item.title && item.points > 0);

  if (!criteria.length) {
    throw new Error('No rubric criteria were detected from the image. Try a clearer photo/screenshot.');
  }

  return {
    title: String(source.title || source.activityTitle || adminActivityTitle?.value || 'Imported Rubric Activity').trim(),
    description: String(source.description || source.instructions || adminActivityDescription?.value || 'Complete the activity based on the imported rubric.').trim(),
    passingScore: Number(source.passingScore) || Number(adminPassingScore?.value) || 75,
    criteria
  };
}

function applyImportedRubricToForm(imported) {
  const normalized = normalizeImportedRubricPayload(imported);
  adminActivityTitle.value = normalized.title;
  adminActivityDescription.value = normalized.description;
  adminPassingScore.value = normalized.passingScore;
  renderCriteriaEditor(normalized.criteria);
  setRubricImageStatus('Rubric table filled. Review it, then click Save Activity.', 'success');
  setStatus('Rubric imported');
}

async function readRubricImageAndFillTable() {
  if (!selectedRubricImageDataUrl) {
    setRubricImageStatus('Choose a rubric image first.', 'error');
    return;
  }

  const endpoint = getRubricImageEndpoint();
  if (!endpoint) {
    setRubricImageStatus('Rubric image reading is not connected yet. Deploy the rubricImageImport Firebase Function, then paste its URL in firebase-config.js as MCS_RUBRIC_IMAGE_ENDPOINT.', 'error');
    return;
  }

  readRubricImageBtn.disabled = true;
  const oldText = readRubricImageBtn.textContent;
  readRubricImageBtn.textContent = 'Reading image...';
  setRubricImageStatus('Reading rubric image and preparing the table...', 'working');

  try {
    const idToken = await getTeacherIdTokenForImport();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        imageDataUrl: selectedRubricImageDataUrl,
        currentTitle: adminActivityTitle.value,
        currentInstructions: adminActivityDescription.value,
        levels: rubricLevels.map(level => level.label),
        ruleOptions: ruleOptions.map(option => ({ value: option.value, label: option.label }))
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Rubric import failed (${response.status}).`);
    }

    applyImportedRubricToForm(data);
  } catch (error) {
    console.error('Rubric image import failed:', error);
    setRubricImageStatus(error.message || 'Could not read the rubric image. Please try again.', 'error');
  } finally {
    readRubricImageBtn.disabled = false;
    readRubricImageBtn.textContent = oldText;
  }
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

function parseHtmlTags(text) {
  const tags = [];
  const pattern = /<!--([\s\S]*?)-->|<\/?([A-Za-z][A-Za-z0-9:-]*)(?:\s[^<>]*?)?>|<!DOCTYPE\s+html\s*>/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const full = match[0];
    if (full.startsWith('<!--') || /^<!DOCTYPE/i.test(full)) continue;

    const name = (match[2] || '').toLowerCase();
    if (!name) continue;

    const closing = /^<\s*\//.test(full);
    const explicitSelfClosing = /\/\s*>$/.test(full);
    const selfClosing = explicitSelfClosing || selfClosingTagNames.has(name);

    tags.push({
      name,
      raw: full,
      start: match.index,
      end: match.index + full.length,
      closing,
      selfClosing,
      pairIndex: null
    });
  }

  const stack = [];
  tags.forEach((tag, index) => {
    if (tag.selfClosing) return;

    if (!tag.closing) {
      stack.push(index);
      return;
    }

    for (let i = stack.length - 1; i >= 0; i--) {
      const openingIndex = stack[i];
      if (tags[openingIndex].name === tag.name) {
        tags[openingIndex].pairIndex = index;
        tag.pairIndex = openingIndex;
        stack.splice(i, 1);
        break;
      }
    }
  });

  return tags;
}

function getTagAtCursor(tags, cursor) {
  return tags.find(tag => cursor >= tag.start && cursor <= tag.end)
    || tags.find(tag => cursor > tag.start - 2 && cursor < tag.end + 2)
    || null;
}

function renderCodeMatchLayer(spans = []) {
  if (!codeMatchLayer) return;

  const text = editor.value;
  if (activeLanguage !== 'html') {
    codeMatchLayer.innerHTML = '';
    return;
  }

  const sorted = spans
    .filter(span => Number.isFinite(span.start) && Number.isFinite(span.end) && span.end > span.start)
    .sort((a, b) => a.start - b.start);

  let output = '';
  let cursor = 0;

  sorted.forEach(span => {
    if (span.start < cursor) return;
    output += escapeHTML(text.slice(cursor, span.start));
    output += `<span class="tag-match ${span.className}">${escapeHTML(text.slice(span.start, span.end))}</span>`;
    cursor = span.end;
  });

  output += escapeHTML(text.slice(cursor));
  codeMatchLayer.innerHTML = output + '\n';
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
  themeToggle.textContent = safeTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
  saveJSON(STORAGE_KEYS.theme, safeTheme);
}


function getEditorHistoryKey(language = activeLanguage) {
  return `${activity?.id || 'no-activity'}:${language}`;
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
  editor.value = codeStore[activeLanguage] || '';
  ensureEditorHistory(activeLanguage, editor.value);
  editorInfo.textContent = languageInfo[activeLanguage];
  updateLineNumbers();
  hideSuggestions();
  renderStructureAlert();
  fitEditorToContent();
  updateTagMatching();
}

function saveActiveEditor() {
  codeStore[activeLanguage] = editor.value;

  if (activity) {
    codeByActivity[activity.id] = normalizeCodeStore(codeStore);
    saveCodeByActivity();
  }

  renderStructureAlert();
  fitEditorToContent();
  updateTagMatching();
}

function updateLineNumbers() {
  const lines = editor.value.split('\n').length || 1;
  lineNumbers.textContent = Array.from({ length: lines }, (_, index) => index + 1).join('\n');
  fitEditorToContent();
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

  const activeSuggestions = suggestionsByLanguage[activeLanguage].map(item => ({
    ...item,
    languageType: activeLanguage.toUpperCase()
  }));

  const query = currentWord.toLowerCase();
  currentMatches = activeSuggestions
    .filter(item => {
      const label = item.label.toLowerCase();
      return label.startsWith(query) || label.includes(query);
    })
    .slice(0, 6);

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
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);
  const stack = [];
  const tagRegex = /<\/?\s*([a-zA-Z][a-zA-Z0-9-]*|!DOCTYPE)\b[^>]*>/g;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    if (voidTags.has(tagName) || fullTag.endsWith('/>') || fullTag.startsWith('<!--')) continue;

    if (/^<\//.test(fullTag)) {
      if (!stack.length || stack.pop() !== tagName) return false;
    } else {
      stack.push(tagName);
    }
  }

  return stack.length === 0;
}

function createStyleBlock() {
  const css = (codeStore.css || '').trim();
  if (!css) return '';
  const safeCSS = css.replace(/<\/style>/gi, '');
  return `<style>\n${safeCSS}\n</style>`;
}

function createScriptBlock() {
  const js = (codeStore.js || '').trim();
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
  }

  try {
    new Function(${safeJS})();
  } catch (error) {
    showStudentError(error);
  }
})();
<\/script>`;
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

function buildFullCode() {
  const html = codeStore.html || '';
  const styleBlock = createStyleBlock();
  const scriptBlock = createScriptBlock();
  const looksLikeFullDocument = /<!doctype/i.test(html) || /<html(\s|>)/i.test(html) || /<head(\s|>)/i.test(html) || /<body(\s|>)/i.test(html);

  if (looksLikeFullDocument) {
    return injectAssetsIntoHTML(html, styleBlock, scriptBlock);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${styleBlock}
</head>
<body>
${html}
${scriptBlock}
</body>
</html>`;
}

function scrollToOutput() {
  if (!previewPanel) return;
  window.setTimeout(() => {
    previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

function runCode(showMessage = true, options = {}) {
  saveActiveEditor();
  previewFrame.srcdoc = buildFullCode();

  if (showMessage) {
    setStatus('Output updated');
  }

  if (options.scroll !== false && showMessage) {
    if (document.body.classList.contains('editor-fullscreen-active')) {
      exitFullEditor();
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
      const usefulProperties = /(color|background|padding|margin|border|border-radius|font-size|display|box-shadow|text-align)\s*:/i;
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

function getCriterionProgress(criterion) {
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
    renderResult(result);
    setStatus(`Score ${formatPoints(result.score)}/${formatPoints(result.possible)}`);
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 350);
}

function getRuleLabel(rule) {
  return ruleOptions.find(option => option.value === rule)?.label || rule;
}

function resetResultPanel() {
  resultContent.classList.add('empty-state');
  resultContent.innerHTML = `
    <div class="empty-icon">✓</div>
    <h3>No result yet</h3>
    <p>Click <strong>See Result</strong> when you are done with your selected activity.</p>
  `;
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
  adminActivitySelect.innerHTML = activities.map((item, index) => `
    <option value="${escapeAttribute(item.id)}" ${item.id === adminEditingActivityId ? 'selected' : ''}>${index + 1}. ${escapeHTML(item.title)}</option>
  `).join('');
}

function renderActivitySummary() {
  if (!activity) {
    activityTitle.textContent = 'No activity selected yet';
    activityDescription.textContent = 'Click Step 1 and choose an activity. Run Code still works, but score and feedback need a selected activity/rubric.';
    totalPoints.textContent = '0';
    criteriaCount.textContent = '0';
    renderActivitySelector();
    return;
  }

  const possible = activity.criteria.reduce((sum, criterion) => sum + getCriterionPossiblePoints(criterion), 0);
  activityTitle.textContent = activity.title;
  activityDescription.textContent = activity.description;
  totalPoints.textContent = formatPoints(possible);
  criteriaCount.textContent = activity.criteria.length;
  renderActivitySelector();
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

function resetCurrentActivityCode() {
  if (!activity) {
    showActivityRequiredWarning();
    return;
  }

  if (!confirm(`Reset your code for "${activity.title}"?`)) return;
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

function enterFullPreview() {
  document.body.classList.add('preview-fullscreen-active');
  fullPreviewBtn.classList.add('hidden');
  exitPreviewBtn.classList.remove('hidden');
  setStatus('Full preview');
}

function exitFullPreview() {
  document.body.classList.remove('preview-fullscreen-active');
  fullPreviewBtn.classList.remove('hidden');
  exitPreviewBtn.classList.add('hidden');
  setStatus('Preview restored');
}

function enterFullEditor() {
  if (document.body.classList.contains('preview-fullscreen-active')) {
    exitFullPreview();
  }

  document.body.classList.add('editor-fullscreen-active');
  fullEditorBtn?.classList.add('hidden');
  exitEditorBtn?.classList.remove('hidden');
  exitEditorStickyBtn?.classList.remove('hidden');
  hideSuggestions();

  if (editorPanel?.requestFullscreen && !document.fullscreenElement) {
    editorPanel.requestFullscreen().catch(() => {
      // Browser may block fullscreen from some shortcuts; CSS fullscreen still works.
    });
  }

  setStatus('Full editor mode');
  fitEditorToContent();
  window.setTimeout(() => editor.focus(), 80);
}

function exitFullEditor(options = {}) {
  document.body.classList.remove('editor-fullscreen-active');
  fullEditorBtn?.classList.remove('hidden');
  exitEditorBtn?.classList.add('hidden');
  exitEditorStickyBtn?.classList.add('hidden');
  hideSuggestions();

  if (!options.fromNative && document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }

  setStatus('Editor restored');
  fitEditorToContent();
  window.setTimeout(() => editor.focus(), 80);
}

function openAdminPanel() {
  document.body.classList.add('admin-open');
  adminOverlay.classList.remove('hidden');
  setLoginError('');
  if (adminUnlocked && firebaseState.auth?.currentUser) {
    showAdminForm();
  } else {
    pinScreen.classList.remove('hidden');
    adminForm.classList.add('hidden');
    if (adminPassword) adminPassword.value = '';
    setTimeout(() => adminEmail?.focus(), 50);
  }
}

function closeAdminPanel() {
  adminOverlay.classList.add('hidden');
  document.body.classList.remove('admin-open');
}

function showAdminForm(activityId = adminEditingActivityId) {
  adminUnlocked = true;
  pinScreen.classList.add('hidden');
  adminForm.classList.remove('hidden');
  const editActivity = getActivityById(activityId) || activity || activities[0];
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
  const criteria = collectCriteriaFromEditor();

  if (!criteria.length) {
    alert('Please add at least one rubric criterion.');
    return;
  }

  const savedActivity = normalizeActivity({
    id: adminEditingActivityId || createId(),
    title: adminActivityTitle.value.trim() || defaultActivity.title,
    description: adminActivityDescription.value.trim() || defaultActivity.description,
    passingScore: Number(adminPassingScore.value) || 75,
    criteria
  });

  const existingIndex = activities.findIndex(item => item.id === savedActivity.id);
  if (existingIndex >= 0) {
    activities[existingIndex] = savedActivity;
  } else {
    activities.push(savedActivity);
  }

  saveActivities({ cloud: false });
  selectActivity(savedActivity.id, { keepLanguage: true });
  const savedOnline = await saveActivitiesToCloud();
  if (savedOnline) {
    closeAdminPanel();
    setStatus('Activity saved');
  }
}

function createNewActivity() {
  const newActivity = normalizeActivity({
    ...clone(defaultActivity),
    id: createId(),
    title: `Activity ${activities.length + 1}: New Web Activity`,
    description: 'Write the student instructions for this activity. Add rubric criteria below so the app can score the student output automatically.',
    criteria: clone(defaultActivity.criteria).map(criterion => normalizeCriterion({ ...criterion, id: createId() }))
  });

  activities.push(newActivity);
  saveActivities({ cloud: false });
  saveActivitiesToCloud();
  codeByActivity[newActivity.id] = normalizeCodeStore(starterCode);
  saveCodeByActivity();
  selectActivity(newActivity.id, { skipSave: true });
  showAdminForm(newActivity.id);
  setStatus('New activity created');
}

function duplicateActivity() {
  const source = getActivityById(adminEditingActivityId) || activity;
  const copy = normalizeActivity({
    ...clone(source),
    id: createId(),
    title: `${source.title} (Copy)`,
    criteria: source.criteria.map(criterion => normalizeCriterion({ ...criterion, id: createId() }))
  });

  activities.push(copy);
  saveActivities({ cloud: false });
  saveActivitiesToCloud();
  codeByActivity[copy.id] = normalizeCodeStore(codeByActivity[source.id] || starterCode);
  saveCodeByActivity();
  selectActivity(copy.id, { skipSave: true });
  showAdminForm(copy.id);
  setStatus('Activity duplicated');
}

function deleteActivity() {
  if (activities.length <= 1) {
    alert('At least one activity is required.');
    return;
  }

  const activityToDelete = getActivityById(adminEditingActivityId);
  if (!activityToDelete) return;
  if (!confirm(`Delete "${activityToDelete.title}"? Students will no longer see this activity on this browser.`)) return;

  const deletedIndex = activities.findIndex(item => item.id === activityToDelete.id);
  activities = activities.filter(item => item.id !== activityToDelete.id);
  delete codeByActivity[activityToDelete.id];
  saveActivities({ cloud: false });
  saveActivitiesToCloud();
  saveCodeByActivity();

  const nextActivity = activities[Math.max(0, deletedIndex - 1)] || activities[0];
  selectActivity(nextActivity.id, { skipSave: true });
  showAdminForm(nextActivity.id);
  setStatus('Activity deleted');
}

function restoreDefaultRubric() {
  if (!confirm('Restore the default rubric for this activity?')) return;
  const existing = getActivityById(adminEditingActivityId) || activity;
  const restored = normalizeActivity({
    ...clone(defaultActivity),
    id: existing.id,
    title: existing.title || defaultActivity.title
  });

  const existingIndex = activities.findIndex(item => item.id === restored.id);
  activities[existingIndex] = restored;
  saveActivities({ cloud: false });
  saveActivitiesToCloud();
  selectActivity(restored.id, { keepLanguage: true });
  showAdminForm(restored.id);
  setStatus('Default rubric restored');
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

function setStatus(text) {
  statusBadge.textContent = text;
  clearTimeout(setStatus.timer);
  setStatus.timer = setTimeout(() => {
    statusBadge.textContent = 'Ready';
  }, 1800);
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

function ensureDownloadIndexHTML(html, hasCSS, hasJS) {
  let output = html || '';
  const cssLink = '  <link rel="stylesheet" href="style.css">';
  const jsScript = '  <script src="script.js"><\/script>';
  const looksLikeFullDocument = /<!doctype/i.test(output) || /<html(\s|>)/i.test(output) || /<head(\s|>)/i.test(output) || /<body(\s|>)/i.test(output);

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

  if (hasCSS && !/href=["']style\.css["']/i.test(output)) {
    if (/<\/head\s*>/i.test(output)) {
      output = output.replace(/<\/head\s*>/i, `${cssLink}\n</head>`);
    } else if (/<body(\s|>)/i.test(output)) {
      output = output.replace(/<body(\s|>)/i, `${cssLink}\n$&`);
    } else {
      output = `${cssLink}\n${output}`;
    }
  }

  if (hasJS && !/src=["']script\.js["']/i.test(output)) {
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
  return [
    'Student Code Studio - Saved Code',
    '================================',
    '',
    `Activity: ${title}`,
    `Saved: ${new Date().toLocaleString()}`,
    '',
    'Files included:',
    '- index.html',
    '- style.css',
    '- script.js',
    '',
    'How to open:',
    '1. Extract this ZIP file.',
    '2. Open index.html in a browser.',
    '',
    'Activity instructions:',
    instructions,
    '',
    'Note:',
    'The downloaded index.html links to style.css and script.js when those tabs contain code.'
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
  const html = codeStore.html || '';
  const css = codeStore.css || '';
  const js = codeStore.js || '';
  const files = [
    { name: 'index.html', content: ensureDownloadIndexHTML(html, css.trim().length > 0, js.trim().length > 0) },
    { name: 'style.css', content: css },
    { name: 'script.js', content: js },
    { name: 'README.txt', content: makeReadmeFile() }
  ];
  const filename = `${sanitizeFilename(activity?.title || 'student-code')}-${getCurrentDateStamp()}.zip`;
  const blob = createZipBlob(files);
  downloadBlob(blob, filename);
  setStatus('ZIP downloaded');
}

function saveNow() {
  saveActiveEditor();
  setStatus('Saved locally');
}

function setActivityCardOpen(isOpen) {
  if (!activityCard || !stepActivityBtn) return;
  activityCard.classList.toggle('collapsed-card', !isOpen);
  stepActivityBtn.setAttribute('aria-expanded', String(isOpen));
}

function toggleActivityCard() {
  const isHidden = activityCard?.classList.contains('collapsed-card');
  setActivityCardOpen(Boolean(isHidden));
  if (isHidden) {
    activityCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function clearActivityRequiredWarning() {
  stepActivityBtn?.classList.remove('needs-attention');
  activityCard?.classList.remove('needs-attention');
  activityWarning?.classList.add('hidden');
}

function showActivityRequiredWarning() {
  setActivityCardOpen(true);
  stepActivityBtn?.classList.add('needs-attention');
  activityCard?.classList.add('needs-attention');
  activityWarning?.classList.remove('hidden');
  activityCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function focusEditorStep() {
  if (!activity) {
    showActivityRequiredWarning();
  } else {
    clearActivityRequiredWarning();
  }

  editorPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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


function getLineBeforeCursor() {
  const before = editor.value.slice(0, editor.selectionStart);
  const lines = before.split('\n');
  return lines[lines.length - 1] || '';
}

function handleSmartEnter(event) {
  if (event.key !== 'Enter' || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return false;
  if (!suggestionBox.classList.contains('hidden')) return false;

  event.preventDefault();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const value = editor.value;
  const currentLine = getLineBeforeCursor();
  const baseIndent = (currentLine.match(/^\s*/) || [''])[0];
  let extraIndent = '';

  if (activeLanguage === 'html' && /<([a-zA-Z][\w:-]*)(?:\s[^<>]*)?>\s*$/.test(currentLine) && !/<\/(script|style)>\s*$/.test(currentLine)) {
    extraIndent = '  ';
  }

  if ((activeLanguage === 'css' || activeLanguage === 'js') && /\{\s*$/.test(currentLine)) {
    extraIndent = '  ';
  }

  const afterCursor = value.slice(end);
  const nextText = '\n' + baseIndent + extraIndent;
  const nextValue = value.slice(0, start) + nextText + afterCursor;
  const nextCursor = start + nextText.length;
  applyProgrammaticEditorChange(nextValue, nextCursor, nextCursor);
  return true;
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

editor.addEventListener('input', event => {
  saveActiveEditor();
  updateLineNumbers();
  commitEditorHistory();
  showSuggestions(event);
  updateTagMatching();
});

editor.addEventListener('scroll', () => {
  syncEditorScroll();
  hideSuggestions();
});

editor.addEventListener('keydown', event => {
  const isCtrlOrMeta = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (handleSmartEnter(event)) return;

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
if (stepCodeBtn) stepCodeBtn.addEventListener('click', focusEditorStep);
if (stepRunBtn) stepRunBtn.addEventListener('click', () => runCode());
if (stepResultBtn) stepResultBtn.addEventListener('click', showResult);

layoutButtons.forEach(button => {
  button.addEventListener('click', () => setPreviewLayout(button.dataset.layout));
});

fullPreviewBtn.addEventListener('click', enterFullPreview);
exitPreviewBtn.addEventListener('click', exitFullPreview);
if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => changeEditorZoom(-1));
if (zoomInBtn) zoomInBtn.addEventListener('click', () => changeEditorZoom(1));
if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetEditorZoom);
if (fullEditorBtn) fullEditorBtn.addEventListener('click', enterFullEditor);
if (exitEditorBtn) exitEditorBtn.addEventListener('click', exitFullEditor);
if (exitEditorStickyBtn) exitEditorStickyBtn.addEventListener('click', exitFullEditor);

document.addEventListener('keydown', event => {
  handleGlobalShortcuts(event);

  if (event.key === 'Escape' && document.body.classList.contains('preview-fullscreen-active')) {
    exitFullPreview();
  }

  if (event.key === 'Escape' && document.body.classList.contains('editor-fullscreen-active')) {
    exitFullEditor();
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('editor-fullscreen-active')) {
    exitFullEditor({ fromNative: true });
  }
});

runBtn.addEventListener('click', () => runCode());
resultBtn.addEventListener('click', showResult);
if (saveBtn) saveBtn.addEventListener('click', downloadCodeAsZip);
if (downloadZipBtn) downloadZipBtn.addEventListener('click', downloadCodeAsZip);
activitySelect.addEventListener('change', event => selectActivity(event.target.value));
resetActivityCodeBtn.addEventListener('click', resetCurrentActivityCode);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

resetBtn.addEventListener('click', () => {
  const resetLabel = activity ? `"${activity.title}"` : 'the editor';
  if (confirm(`Reset all tabs for ${resetLabel} to the sample code?`)) {
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
  }
});

clearBtn.addEventListener('click', () => {
  if (confirm(`Clear the ${activeLanguage.toUpperCase()} tab?`)) {
    applyProgrammaticEditorChange('', 0, 0);
    hideSuggestions();
    runCode();
    setStatus(`${activeLanguage.toUpperCase()} cleared`);
  }
});

window.addEventListener('resize', fitEditorToContent);

window.addEventListener('click', event => {
  if (!suggestionBox.contains(event.target) && event.target !== editor) {
    hideSuggestions();
  }
});

adminBtn.addEventListener('click', openAdminPanel);
closeAdminBtn.addEventListener('click', closeAdminPanel);
unlockAdminBtn.addEventListener('click', unlockAdmin);
logoutAdminBtn?.addEventListener('click', logoutTeacher);
[adminEmail, adminPassword].forEach(input => {
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      unlockAdmin();
    }
  });
});

adminOverlay.addEventListener('click', event => {
  if (event.target === adminOverlay) {
    closeAdminPanel();
  }
});

rubricImageInput?.addEventListener('change', handleRubricImageChange);
clearRubricImageBtn?.addEventListener('click', clearRubricImageSelection);
readRubricImageBtn?.addEventListener('click', readRubricImageAndFillTable);
adminForm.addEventListener('submit', saveRubric);
adminActivitySelect.addEventListener('change', event => editAdminActivity(event.target.value));
newActivityBtn.addEventListener('click', createNewActivity);
duplicateActivityBtn.addEventListener('click', duplicateActivity);
deleteActivityBtn.addEventListener('click', deleteActivity);
addCriterionBtn.addEventListener('click', addCriterion);
resetRubricBtn.addEventListener('click', restoreDefaultRubric);
criteriaEditor.addEventListener('change', updateCriterionHelp);
criteriaEditor.addEventListener('click', event => {
  const removeButton = event.target.closest('.remove-criterion');
  if (!removeButton) return;
  const currentCriteria = collectCriteriaFromEditor();
  const card = removeButton.closest('.rubric-table-row') || removeButton.closest('.criterion-card');
  if (!card) return;
  const filtered = currentCriteria.filter(item => item.id !== card.dataset.id);
  renderCriteriaEditor(filtered);
});

saveActivities();
saveJSON(STORAGE_KEYS.selectedActivityId, selectedActivityId);
saveCodeByActivity();
applyTheme(loadJSON(STORAGE_KEYS.theme, 'light'));
applyEditorZoom(editorFontSize);
renderActivitySummary();
resetResultPanel();
setPreviewLayout(loadJSON(STORAGE_KEYS.layout, 'split'));
loadActiveEditor();
runCode(false);
loadActivitiesFromCloud();
