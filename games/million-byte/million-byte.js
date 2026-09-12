(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'million-byte';
  const GLOBAL_NAME = 'ICT8MillionByte';
  // Resolve the question bank relative to this game script itself. This keeps
  // GitHub Pages repo/subpath deployments working even when the app URL changes.
  const GAME_SCRIPT_URL = document.currentScript && document.currentScript.src
    ? new URL(document.currentScript.src, document.baseURI)
    : new URL('games/million-byte/million-byte.js', document.baseURI);
  const GAME_DIR_URL = new URL('./', GAME_SCRIPT_URL);
  const BANK_ASSET_VERSION = '20260913-v4761-million-byte-explanations-v2';
  const BANK_URL = new URL(`million-byte-questions.js?v=${BANK_ASSET_VERSION}`, GAME_DIR_URL).href;
  const BANK_VERSION = 3;
  const EXPLANATION_QUALITY_VERSION = 1;
  const EXPLANATION_MIN_CHARS = 90;
  const EXPLANATION_BANNED_RE = /\bis the correct answer\b|\bcorrect answer\b|\bmatches? the (?:question|clue)\b|\bbased on the clue\b|\bconnect(?:s|ing)? the clue\b|\breview the correct answer\b|\b(?:the|this) question\b|\b(?:the|this) item\b|\bthe choices\b|\banswer list\b|\boption letter\b|\bremember(?:ing)?\b|\bmemor(?:ize|izing|ized)\b|\bmemory (?:link|anchor|cue)\b/i;
  const EXPLANATION_SIGNAL_RE = /because|which|while|unlike|during|after|before|through|allows|helps|makes|causes|requires|measures|represents|includes|consists|defined|process|method|rule|compared|rather|instead|therefore|so that|meaning|known for|refers to|used to|formed by|located in|developed by|created by|serves as|functions as/i;
  const QUESTION_COUNT = 15;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const VALUES = ['100','200','300','500','1K','2K','4K','8K','16K','32K','64K','125K','250K','500K','1M'];
  const TIER_NAMES = ['EASY','MODERATE','CHALLENGING','DIFFICULT','EXPERT'];
  const TIER_COUNTS = [0, 520, 520, 304, 304, 352];
  const QUESTION_SECONDS_BY_TIER = [0,35,40,45,50,55];
  const LOCAL_STATE_KEY = 'ict8.millionByte.globalQuestionCycle.v1';
  const LEGACY_LOCAL_STATE_KEY = 'ict8.millionByte.questionCursor.v3';
  const QUESTION_CYCLE_MODE = 'global-no-repeat-v1';
  const LIFELINE_IDS = ['fifty','double','audience','switch'];
  const LIFELINE_META = {
    fifty: { title: '50:50', detail: 'Remove 2' },
    double: { title: '2X', detail: 'Second Chance' },
    audience: { title: 'AUDIENCE', detail: 'Vote' },
    switch: { title: 'SWITCH', detail: 'New Question' }
  };

  const runtime = {
    built: false,
    open: false,
    state: 'closed',
    bridge: null,
    onBack: null,
    onClose: null,
    onReward: null,
    overlay: null,
    shell: null,
    readyPanel: null,
    readyStatus: null,
    playBtn: null,
    resultPanel: null,
    failPanel: null,
    learnPanel: null,
    learnTitle: null,
    learnQuestion: null,
    learnCorrect: null,
    learnLabel: null,
    learnNote: null,
    pendingFailReason: '',
    loadingPanel: null,
    questionEl: null,
    categoryEl: null,
    tierEl: null,
    valueEl: null,
    answersEl: null,
    answerButtons: [],
    statusEl: null,
    progressBar: null,
    mobileProgress: null,
    ladder: null,
    timerWrap: null,
    timerEl: null,
    lifelineHost: null,
    lifelineButtons: {},
    soundBtn: null,
    resultTitle: null,
    resultCopy: null,
    resultScore: null,
    resultReached: null,
    resultTime: null,
    resultXp: null,
    rewardNote: null,
    round: null,
    bank: null,
    bankPromise: null,
    questionIds: [],
    questions: [],
    answers: [],
    index: 0,
    correctCount: 0,
    fiftyUsed: false,
    doubleUsed: false,
    audienceUsed: false,
    switchUsed: false,
    switchIndex: -1,
    selectedLifelines: [],
    lastExcludedLifeline: '',
    originalQuestionIds: [],
    localSwitchSeed: '',
    doubleActive: false,
    doubleWrongThisQuestion: false,
    rescuedWrong: 0,
    lifelinesUsed: 0,
    startedAt: 0,
    questionStartedAt: 0,
    deadlineAt: 0,
    timerHandle: 0,
    locked: false,
    rewardSubmitting: false,
    rewardEligible: false,
    practiceReason: '',
    lastRewardDay: '',
    lastRewardXp: 0,
    bestScore: 0,
    bestReached: 0,
    soundEnabled: true,
    audioContext: null
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.className = 'xp-games-game-overlay million-byte-overlay';
    overlay.id = 'millionByteOverlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Million Byte Challenge');
    overlay.innerHTML = `
      <section class="million-byte-shell">
        <header class="million-byte-topbar">
          <button type="button" data-mb-back aria-label="Back to Mini-Games">←</button>
          <div class="million-byte-brand"><strong>🧠 MILLION BYTE</strong><small>General Knowledge Challenge</small></div>
          <span class="million-byte-bank">2,000 QUESTION POOL · NO REPEATS UNTIL ALL ARE USED</span>
          <button type="button" data-mb-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-mb-close aria-label="Close">×</button>
        </header>

        <div class="million-byte-stage">
          <main class="million-byte-main">
            <section class="million-byte-card" aria-live="polite">
              <div class="million-byte-progressbar"><i data-mb-progress></i></div>
              <div class="million-byte-mobile-progress" data-mb-mobile-progress></div>
              <div class="million-byte-question-head">
                <div class="million-byte-tier"><span class="million-byte-tier-dot"></span><span data-mb-tier>EASY · Q1/15</span></div>
                <div class="million-byte-value" data-mb-value>100 BYTE</div>
              </div>
              <p class="million-byte-category" data-mb-category>GENERAL</p>
              <div class="million-byte-question" data-mb-question>Ready?</div>
              <div class="million-byte-answer-grid" data-mb-answers>
                ${LETTERS.map((letter, index) => `<button type="button" class="million-byte-answer" data-answer="${index}"><span class="letter">${letter}</span><span data-answer-text>—</span></button>`).join('')}
              </div>
              <div class="million-byte-controls">
                <div class="million-byte-lifelines" data-mb-lifelines></div>
                <div class="million-byte-timer" data-mb-timer-wrap><span>ANSWER TIME</span><strong data-mb-timer>35s</strong></div>
              </div>
              <div class="million-byte-status" data-mb-status>Choose carefully. The questions get harder.</div>
            </section>
          </main>
          <aside class="million-byte-ladder" data-mb-ladder><h3>BYTE LADDER</h3></aside>
        </div>

        <div class="million-byte-panel" data-mb-ready>
          <div class="million-byte-modal">
            <div class="million-byte-logo">🧠</div>
            <p class="million-byte-kicker">15 QUESTIONS · 5 DIFFICULTY TIERS</p>
            <h2>MILLION BYTE</h2>
            <p>Answer 15 general-knowledge questions from Easy to Expert. Questions rotate through the full 2,000-question bank before repeating. Each run gives you 3 random lifelines from a pool of 4.</p>
            <div class="million-byte-rule-row">
              <div><small>QUESTION POOL</small><strong>2,000</strong></div>
              <div><small>LIFELINES</small><strong>Random 3 of 4</strong></div>
              <div><small>XP</small><strong>Perfect 15/15 = 15 XP</strong></div>
            </div>
            <p class="million-byte-ready-status" data-mb-ready-status hidden></p>
            <div class="million-byte-actions"><button type="button" class="million-byte-primary" data-mb-play>START CHALLENGE</button></div>
          </div>
        </div>

        <div class="million-byte-panel" data-mb-loading hidden>
          <div class="million-byte-modal">
            <div class="million-byte-logo">🔐</div>
            <p class="million-byte-kicker">BUILDING A FRESH QUESTION SET</p>
            <h2>NO REPEATS</h2>
            <p data-mb-loading-copy>Reserving unseen questions for this account…</p>
            <span class="million-byte-loading"><i></i><i></i><i></i></span>
          </div>
        </div>

        <div class="million-byte-panel million-byte-learning-panel" data-mb-learn hidden>
          <div class="million-byte-modal million-byte-learning-modal">
            <div class="million-byte-learn-icon">💡</div>
            <p class="million-byte-kicker">LEARN THIS</p>
            <h2 data-mb-learn-title>NOT QUITE</h2>
            <p class="million-byte-learn-question" data-mb-learn-question></p>
            <div class="million-byte-learn-answer">
              <small>CORRECT ANSWER</small>
              <strong data-mb-learn-correct></strong>
            </div>
            <div class="million-byte-learn-note">
              <small data-mb-learn-label>WHY THIS IS CORRECT</small>
              <p data-mb-learn-note></p>
            </div>
            <div class="million-byte-actions"><button type="button" class="million-byte-primary" data-mb-learn-continue>GOT IT</button></div>
          </div>
        </div>

        <div class="million-byte-panel" data-mb-fail hidden>
          <div class="million-byte-modal">
            <div class="million-byte-logo">✕</div>
            <p class="million-byte-kicker">RUN ENDED</p>
            <h2 data-mb-fail-title>NOT THIS TIME</h2>
            <p data-mb-fail-copy>The challenge ended on this question. Your seen questions remain retired from the current bank cycle.</p>
            <div class="million-byte-result-grid">
              <div><small>Reached</small><strong data-mb-fail-reached>Q1</strong></div>
              <div><small>Correct</small><strong data-mb-fail-correct>0/15</strong></div>
            </div>
            <p class="million-byte-reward-note" data-mb-fail-note>No XP — reach the 1M BYTE endpoint first.</p>
            <div class="million-byte-actions"><button type="button" class="million-byte-primary" data-mb-retry>NEW CHALLENGE</button><button type="button" class="million-byte-secondary" data-mb-fail-hub>MINI-GAMES</button></div>
          </div>
        </div>

        <div class="million-byte-panel" data-mb-result hidden>
          <div class="million-byte-modal">
            <div class="million-byte-logo">🏆</div>
            <p class="million-byte-kicker">ENDPOINT REACHED</p>
            <h2 data-mb-result-title>1,000,000 BYTE!</h2>
            <p data-mb-result-copy>You cleared all five difficulty tiers.</p>
            <div class="million-byte-result-grid">
              <div><small>Score</small><strong data-mb-result-score>0</strong></div>
              <div><small>Correct</small><strong data-mb-result-reached>15/15</strong></div>
              <div><small>Time</small><strong data-mb-result-time>0:00</strong></div>
              <div><small>XP Earned</small><strong class="million-byte-xp" data-mb-result-xp>+0</strong></div>
            </div>
            <p class="million-byte-reward-note" data-mb-reward-note>Checking reward…</p>
            <div class="million-byte-actions"><button type="button" class="million-byte-primary" data-mb-again>PLAY AGAIN</button><button type="button" class="million-byte-secondary" data-mb-result-hub>MINI-GAMES</button></div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.million-byte-shell');
    runtime.readyPanel = overlay.querySelector('[data-mb-ready]');
    runtime.readyStatus = overlay.querySelector('[data-mb-ready-status]');
    runtime.playBtn = overlay.querySelector('[data-mb-play]');
    runtime.loadingPanel = overlay.querySelector('[data-mb-loading]');
    runtime.failPanel = overlay.querySelector('[data-mb-fail]');
    runtime.learnPanel = overlay.querySelector('[data-mb-learn]');
    runtime.learnTitle = overlay.querySelector('[data-mb-learn-title]');
    runtime.learnQuestion = overlay.querySelector('[data-mb-learn-question]');
    runtime.learnCorrect = overlay.querySelector('[data-mb-learn-correct]');
    runtime.learnLabel = overlay.querySelector('[data-mb-learn-label]');
    runtime.learnNote = overlay.querySelector('[data-mb-learn-note]');
    runtime.resultPanel = overlay.querySelector('[data-mb-result]');
    runtime.questionEl = overlay.querySelector('[data-mb-question]');
    runtime.categoryEl = overlay.querySelector('[data-mb-category]');
    runtime.tierEl = overlay.querySelector('[data-mb-tier]');
    runtime.valueEl = overlay.querySelector('[data-mb-value]');
    runtime.answersEl = overlay.querySelector('[data-mb-answers]');
    runtime.answerButtons = Array.from(overlay.querySelectorAll('.million-byte-answer'));
    runtime.statusEl = overlay.querySelector('[data-mb-status]');
    runtime.progressBar = overlay.querySelector('[data-mb-progress]');
    runtime.mobileProgress = overlay.querySelector('[data-mb-mobile-progress]');
    runtime.ladder = overlay.querySelector('[data-mb-ladder]');
    runtime.timerWrap = overlay.querySelector('[data-mb-timer-wrap]');
    runtime.timerEl = overlay.querySelector('[data-mb-timer]');
    runtime.lifelineHost = overlay.querySelector('[data-mb-lifelines]');
    runtime.soundBtn = overlay.querySelector('[data-mb-sound]');
    runtime.resultTitle = overlay.querySelector('[data-mb-result-title]');
    runtime.resultCopy = overlay.querySelector('[data-mb-result-copy]');
    runtime.resultScore = overlay.querySelector('[data-mb-result-score]');
    runtime.resultReached = overlay.querySelector('[data-mb-result-reached]');
    runtime.resultTime = overlay.querySelector('[data-mb-result-time]');
    runtime.resultXp = overlay.querySelector('[data-mb-result-xp]');
    runtime.rewardNote = overlay.querySelector('[data-mb-reward-note]');

    overlay.querySelector('[data-mb-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-mb-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-mb-play]').addEventListener('click', startChallenge);
    overlay.querySelector('[data-mb-retry]').addEventListener('click', startChallenge);
    overlay.querySelector('[data-mb-again]').addEventListener('click', startChallenge);
    overlay.querySelector('[data-mb-fail-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-mb-result-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-mb-learn-continue]').addEventListener('click', continueAfterLearning);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.answerButtons.forEach(btn => btn.addEventListener('click', () => chooseAnswer(Number(btn.dataset.answer))));
    document.addEventListener('keydown', onKeyDown);

    buildLadder();
    runtime.built = true;
  }

  function pickLifelinesForRun() {
    const pool = LIFELINE_IDS.slice();
    let excludeChoices = pool.filter(id => id !== runtime.lastExcludedLifeline);
    if (!excludeChoices.length) excludeChoices = pool;
    const excluded = excludeChoices[Math.floor(Math.random() * excludeChoices.length)];
    runtime.lastExcludedLifeline = excluded;
    runtime.selectedLifelines = pool.filter(id => id !== excluded);
  }

  function lifelineIsUsed(id) {
    if (id === 'fifty') return runtime.fiftyUsed;
    if (id === 'double') return runtime.doubleUsed;
    if (id === 'audience') return runtime.audienceUsed;
    if (id === 'switch') return runtime.switchUsed;
    return true;
  }

  function renderLifelines() {
    if (!runtime.lifelineHost) return;
    runtime.lifelineHost.innerHTML = '';
    runtime.lifelineButtons = {};
    runtime.selectedLifelines.forEach(id => {
      const meta = LIFELINE_META[id];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'million-byte-life';
      btn.dataset.mbLifeline = id;
      btn.innerHTML = `<strong>${meta.title}</strong><span>${meta.detail}</span>`;
      btn.disabled = lifelineIsUsed(id);
      if (lifelineIsUsed(id)) btn.classList.add('used');
      if (id === 'double' && runtime.doubleActive) btn.classList.add('active');
      btn.addEventListener('click', () => useLifeline(id));
      runtime.lifelineButtons[id] = btn;
      runtime.lifelineHost.appendChild(btn);
    });
  }

  function useLifeline(id) {
    if (!runtime.selectedLifelines.includes(id)) return;
    if (id === 'fifty') useFifty();
    else if (id === 'double') useDouble();
    else if (id === 'audience') useAudience();
    else if (id === 'switch') useSwitch();
  }

  function buildLadder() {
    const rows = [];
    for (let i = QUESTION_COUNT - 1; i >= 0; i -= 1) {
      const safe = i === 4 || i === 9;
      rows.push(`<div class="million-byte-rung${safe ? ' safe' : ''}" data-rung="${i}"><span>${i + 1}</span><span class="dot"></span><b>${VALUES[i]} BYTE</b></div>`);
    }
    runtime.ladder.insertAdjacentHTML('beforeend', rows.join(''));
    runtime.mobileProgress.innerHTML = Array.from({ length: QUESTION_COUNT }, (_, i) => `<i data-mobile-rung="${i}"></i>`).join('');
  }

  function normalizedExplanation(value = '') {
    return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function explanationSentenceCount(value = '') {
    return String(value || '').split(/[.!?]+/).filter(part => part.trim()).length;
  }

  function verifiedExplanation(q) {
    if (!q || typeof q.explanation !== 'string') return false;
    const text = q.explanation.trim();
    if (text.length < EXPLANATION_MIN_CHARS) return false;
    const sentenceCount = explanationSentenceCount(text);
    if (sentenceCount < 2 && !(text.length >= 130 && EXPLANATION_SIGNAL_RE.test(text))) return false;
    if (EXPLANATION_BANNED_RE.test(text)) return false;
    if (String(q.explanationLabel || '').trim().toUpperCase() !== 'WHY THIS IS CORRECT') return false;
    return true;
  }

  function bankQualityIssues(bank = window.ICT8_MILLION_BYTE_BANK) {
    const issues = [];
    if (!bank || bank.version !== BANK_VERSION) issues.push('bank-version');
    if (!bank || bank.explanationQualityVersion !== EXPLANATION_QUALITY_VERSION) issues.push('explanation-quality-version');
    if (!bank || bank.count !== 2000 || !Array.isArray(bank.questions) || bank.questions.length !== 2000) issues.push('question-count');
    if (!bank?.byId) issues.push('question-index');
    if (!Array.isArray(bank?.questions)) return issues;
    const seenIds = new Set();
    const seenExplanations = new Set();
    for (const q of bank.questions) {
      if (!q?.id || seenIds.has(q.id)) issues.push(`duplicate-or-missing-id:${q?.id || 'unknown'}`);
      else seenIds.add(q.id);
      if (!verifiedExplanation(q)) issues.push(`weak-explanation:${q?.id || 'unknown'}`);
      const key = normalizedExplanation(q?.explanation);
      if (!key) continue;
      if (seenExplanations.has(key)) issues.push(`duplicate-explanation:${q?.id || 'unknown'}`);
      else seenExplanations.add(key);
    }
    return issues;
  }

  function validBank(bank = window.ICT8_MILLION_BYTE_BANK) {
    return bankQualityIssues(bank).length === 0;
  }

  function setReadyStatus(message = '', kind = '') {
    if (!runtime.readyStatus) return;
    const text = String(message || '').trim();
    runtime.readyStatus.hidden = !text;
    runtime.readyStatus.textContent = text;
    runtime.readyStatus.dataset.kind = kind || '';
  }

  function loadBankScript(src) {
    return new Promise((resolve, reject) => {
      document.querySelectorAll('script[data-million-byte-bank]').forEach(node => node.remove());
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.millionByteBank = 'true';
      const timeout = window.setTimeout(() => {
        try { script.remove(); } catch (_) {}
        reject(new Error('Million Byte question bank load timed out.'));
      }, 8000);
      script.onload = () => {
        clearTimeout(timeout);
        if (validBank()) {
          runtime.bank = window.ICT8_MILLION_BYTE_BANK;
          resolve(runtime.bank);
        } else {
          reject(new Error('Million Byte question bank did not initialize.'));
        }
      };
      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Million Byte question bank could not load.'));
      };
      document.body.appendChild(script);
    });
  }

  function ensureBank() {
    if (validBank()) {
      runtime.bank = window.ICT8_MILLION_BYTE_BANK;
      return Promise.resolve(runtime.bank);
    }
    if (runtime.bankPromise) return runtime.bankPromise;
    runtime.bankPromise = (async () => {
      const attempts = [
        BANK_URL,
        new URL(`million-byte-questions.js?v=${Date.now()}`, GAME_DIR_URL).href,
        new URL('million-byte-questions.js', GAME_DIR_URL).href
      ];
      let lastError = null;
      for (const src of attempts) {
        try {
          return await loadBankScript(src);
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError || new Error('Million Byte question bank could not load.');
    })().finally(() => { runtime.bankPromise = null; });
    return runtime.bankPromise;
  }

  function withTimeout(promise, ms, fallbackValue = null) {
    return Promise.race([
      Promise.resolve(promise),
      new Promise(resolve => window.setTimeout(() => resolve(fallbackValue), ms))
    ]);
  }

  function hashSeed(value) {
    const text = String(value || 'million-byte');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function rawPermutation(tier, cycle) {
    let state = hashSeed(`million-byte-local:${tier}:${cycle}`) || 1;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
    const tierCount = TIER_COUNTS[tier] || 0;
    const arr = Array.from({ length: tierCount }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Keep the first questions of a new full-bank cycle away from the tail of the
  // previous cycle. This prevents an ugly immediate duplicate in the one run
  // that crosses the 2,000-question boundary, while preserving a true
  // permutation (nothing is skipped or retired unseen).
  function permutation(tier, cycle) {
    const arr = rawPermutation(tier, cycle);
    if (cycle <= 0 || arr.length < 40) return arr;
    const previous = rawPermutation(tier, cycle - 1);
    const blocked = new Set(previous.slice(-15));
    const head = Math.min(15, arr.length);
    for (let i = 0; i < head; i += 1) {
      if (!blocked.has(arr[i])) continue;
      let swapAt = -1;
      for (let j = head; j < Math.max(head, arr.length - 15); j += 1) {
        if (!blocked.has(arr[j])) { swapAt = j; break; }
      }
      if (swapAt >= 0) [arr[i], arr[swapAt]] = [arr[swapAt], arr[i]];
    }
    return arr;
  }

  function defaultLocalCycleState() {
    return {
      version: BANK_VERSION,
      mode: QUESTION_CYCLE_MODE,
      cycle: 0,
      cursors: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  function readLocalCycleState() {
    let state = defaultLocalCycleState();
    try {
      const parsed = JSON.parse(localStorage.getItem(LOCAL_STATE_KEY) || 'null');
      if (parsed && parsed.version === BANK_VERSION && parsed.mode === QUESTION_CYCLE_MODE) {
        state.cycle = Math.max(0, Number(parsed.cycle || 0) | 0);
        for (let tier = 1; tier <= 5; tier += 1) {
          state.cursors[tier] = Math.max(0, Math.min(TIER_COUNTS[tier] || 0, Number(parsed.cursors?.[tier] || 0) | 0));
        }
        return state;
      }
      // One-time safe migration from the old per-tier cursor format is possible
      // while every tier is still in its first cycle. This preserves already
      // retired questions for normal users instead of restarting their deck.
      const legacy = JSON.parse(localStorage.getItem(LEGACY_LOCAL_STATE_KEY) || 'null');
      if (legacy && legacy.version === BANK_VERSION && legacy.tiers) {
        let migratable = true;
        for (let tier = 1; tier <= 5; tier += 1) {
          if (Number(legacy.tiers[tier]?.cycle || 0) !== 0) migratable = false;
        }
        if (migratable) {
          for (let tier = 1; tier <= 5; tier += 1) {
            state.cursors[tier] = Math.max(0, Math.min(TIER_COUNTS[tier] || 0, Number(legacy.tiers[tier]?.cursor || 0) | 0));
          }
          saveLocalCycleState(state);
        }
      }
    } catch (_) {}
    return state;
  }

  function saveLocalCycleState(state) {
    try { localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function localRemaining(state, tier) {
    return Math.max(0, (TIER_COUNTS[tier] || 0) - Number(state.cursors?.[tier] || 0));
  }

  function totalLocalRemaining(state) {
    let total = 0;
    for (let tier = 1; tier <= 5; tier += 1) total += localRemaining(state, tier);
    return total;
  }

  function resetLocalCycle(state) {
    state.cycle = Math.max(0, Number(state.cycle || 0) | 0) + 1;
    for (let tier = 1; tier <= 5; tier += 1) state.cursors[tier] = 0;
  }

  function allocateTierCounts(remaining, requested) {
    const allocation = [0, 0, 0, 0, 0, 0];
    const total = [1,2,3,4,5].reduce((sum, tier) => sum + Math.max(0, Number(remaining[tier] || 0)), 0);
    let slots = Math.max(0, Math.min(Number(requested || 0) | 0, total));
    const requestedTotal = slots;
    const active = [1,2,3,4,5].filter(tier => Number(remaining[tier] || 0) > 0);
    if (slots >= active.length) {
      active.forEach(tier => { allocation[tier] = 1; slots -= 1; });
    }
    while (slots > 0) {
      let bestTier = 0;
      let bestScore = -Infinity;
      for (let tier = 1; tier <= 5; tier += 1) {
        const available = Math.max(0, Number(remaining[tier] || 0) - allocation[tier]);
        if (!available) continue;
        const ideal = total > 0 ? (Number(remaining[tier] || 0) / total) * requestedTotal : 0;
        const score = (ideal - allocation[tier]) + available * 1e-9;
        if (score > bestScore) { bestScore = score; bestTier = tier; }
      }
      if (!bestTier) break;
      allocation[bestTier] += 1;
      slots -= 1;
    }
    return allocation;
  }

  function drawLocalTier(state, tier, count) {
    const ids = [];
    const perm = permutation(tier, state.cycle);
    for (let i = 0; i < count; i += 1) {
      const cursor = Number(state.cursors[tier] || 0);
      if (cursor >= perm.length) break;
      ids.push(`mb${tier}-${String(perm[cursor]).padStart(3, '0')}`);
      state.cursors[tier] = cursor + 1;
    }
    return ids;
  }

  function localQuestionIds() {
    const state = readLocalCycleState();
    const ids = [];
    while (ids.length < QUESTION_COUNT) {
      let remainingTotal = totalLocalRemaining(state);
      if (remainingTotal <= 0) {
        resetLocalCycle(state);
        remainingTotal = totalLocalRemaining(state);
      }
      const takeNow = Math.min(QUESTION_COUNT - ids.length, remainingTotal);
      const remaining = [0,1,2,3,4,5].map(tier => tier ? localRemaining(state, tier) : 0);
      const allocation = allocateTierCounts(remaining, takeNow);
      for (let tier = 1; tier <= 5; tier += 1) ids.push(...drawLocalTier(state, tier, allocation[tier]));
    }
    saveLocalCycleState(state);
    if (ids.length !== QUESTION_COUNT || new Set(ids).size !== QUESTION_COUNT) {
      throw new Error('Could not build a unique local Million Byte question set.');
    }
    return ids;
  }

  function reserveLocalSwitchQuestion(originalId, excludedIds) {
    const parsed = parseQuestionId(originalId);
    if (!parsed) return '';
    const state = readLocalCycleState();
    if (totalLocalRemaining(state) <= 0) resetLocalCycle(state);
    if (localRemaining(state, parsed.tier) <= 0) return '';
    const perm = permutation(parsed.tier, state.cycle);
    const cursor = Number(state.cursors[parsed.tier] || 0);
    if (cursor >= perm.length) return '';
    const id = `mb${parsed.tier}-${String(perm[cursor]).padStart(3, '0')}`;
    if (new Set(Array.isArray(excludedIds) ? excludedIds : []).has(id)) return '';
    state.cursors[parsed.tier] = cursor + 1;
    saveLocalCycleState(state);
    return id;
  }

  async function startChallenge() {
    if (!runtime.open || runtime.state === 'loading') return;
    stopTimer();
    if (runtime.round?.sessionId && !runtime.rewardSubmitting) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.state = 'loading';
    setReadyStatus('');
    if (runtime.playBtn) runtime.playBtn.disabled = true;
    runtime.readyPanel.hidden = true;
    runtime.failPanel.hidden = true;
    if (runtime.learnPanel) runtime.learnPanel.hidden = true;
    runtime.pendingFailReason = '';
    runtime.resultPanel.hidden = true;
    runtime.loadingPanel.hidden = false;
    runtime.loadingPanel.querySelector('[data-mb-loading-copy]').textContent = 'Preparing the 2,000-question bank…';

    try {
      await ensureBank();
    } catch (error) {
      console.error('[Million Byte] question bank load failed:', error);
      runtime.state = 'ready';
      runtime.loadingPanel.hidden = true;
      runtime.readyPanel.hidden = false;
      if (runtime.playBtn) runtime.playBtn.disabled = false;
      setReadyStatus('Question bank could not load. Please tap START CHALLENGE again or refresh once.', 'bad');
      return;
    }

    try {
      runtime.loadingPanel.querySelector('[data-mb-loading-copy]').textContent = 'Building a fresh 15-question ladder…';
      try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
      runtime.rewardEligible = false;
      runtime.practiceReason = '';
      let ids = [];

      if (runtime.round?.sessionId && runtime.bridge?.prepareMillionByteRound) {
        try {
          const prepared = await withTimeout(
            runtime.bridge.prepareMillionByteRound(runtime.round.sessionId, BANK_VERSION),
            7000,
            null
          );
          if (Array.isArray(prepared?.questionIds) && prepared.questionIds.length === QUESTION_COUNT) {
            ids = prepared.questionIds.slice();
            runtime.rewardEligible = prepared.loginRequired !== true && prepared.practiceOnly !== true;
            runtime.practiceReason = prepared.practiceOnly ? 'Question service unavailable — this run is practice only.' : '';
          } else if (prepared?.loginRequired) {
            runtime.practiceReason = 'Practice run — sign in as a student to earn XP.';
          } else if (!prepared) {
            runtime.practiceReason = 'Question sync took too long — this run is practice only.';
          }
        } catch (error) {
          runtime.practiceReason = 'Question sync unavailable — this run is practice only.';
        }
      } else {
        runtime.practiceReason = 'Practice run — sign in as a student to earn XP.';
      }

      if (!ids.length) ids = localQuestionIds();
      const questions = ids.map(id => runtime.bank?.byId?.[id]).filter(Boolean);
      if (questions.length !== QUESTION_COUNT) {
        throw new Error(`Question ladder incomplete (${questions.length}/${QUESTION_COUNT}).`);
      }

      runtime.questionIds = ids.slice();
      runtime.originalQuestionIds = ids.slice();
      runtime.questions = questions.slice();
      runtime.answers = [];
      runtime.index = 0;
      runtime.correctCount = 0;
      runtime.fiftyUsed = false;
      runtime.doubleUsed = false;
      runtime.audienceUsed = false;
      runtime.switchUsed = false;
      runtime.switchIndex = -1;
      runtime.doubleActive = false;
      runtime.doubleWrongThisQuestion = false;
      runtime.rescuedWrong = 0;
      runtime.lifelinesUsed = 0;
      runtime.startedAt = performance.now();
      runtime.localSwitchSeed = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      runtime.rewardSubmitting = false;
      runtime.locked = false;
      runtime.loadingPanel.hidden = true;
      runtime.state = 'question';
      if (runtime.playBtn) runtime.playBtn.disabled = false;
      pickLifelinesForRun();
      resetLifelines();
      showQuestion();
      tone('start');
    } catch (error) {
      console.error('[Million Byte] start failed:', error);
      if (runtime.round?.sessionId) {
        try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
      }
      runtime.round = null;
      runtime.state = 'ready';
      runtime.loadingPanel.hidden = true;
      runtime.readyPanel.hidden = false;
      if (runtime.playBtn) runtime.playBtn.disabled = false;
      setReadyStatus('Could not start the challenge. Tap START CHALLENGE to retry. Your question bank is safe.', 'bad');
    }
  }

  function resetLifelines() {
    runtime.doubleActive = false;
    runtime.doubleWrongThisQuestion = false;
    renderLifelines();
  }

  function tierForQuestion(question, index = runtime.index) {
    const parsedTier = Number(question?.tier || parseQuestionId(runtime.questionIds?.[index] || '')?.tier || 0);
    return Math.max(1, Math.min(5, parsedTier || Math.floor(index / 3) + 1));
  }

  function showQuestion(options = {}) {
    const q = runtime.questions[runtime.index];
    if (!q) return;
    runtime.locked = false;
    const keepDouble = options.preserveDouble === true && runtime.doubleActive;
    if (!keepDouble) {
      runtime.doubleActive = false;
      runtime.doubleWrongThisQuestion = false;
    }
    runtime.answerButtons.forEach((btn, i) => {
      btn.disabled = false;
      btn.className = 'million-byte-answer';
      btn.querySelector('[data-answer-text]').textContent = q.options[i];
      btn.setAttribute('aria-label', `${LETTERS[i]}. ${q.options[i]}`);
    });
    renderLifelines();
    runtime.categoryEl.textContent = q.category || 'GENERAL';
    const tier = tierForQuestion(q);
    runtime.tierEl.textContent = `${TIER_NAMES[tier - 1]} · Q${runtime.index + 1}/15`;
    runtime.valueEl.textContent = `${VALUES[runtime.index]} BYTE`;
    runtime.questionEl.textContent = q.q;
    runtime.statusEl.dataset.kind = '';
    runtime.statusEl.textContent = options.switched ? 'SWITCH used · New question, same value and difficulty.' : (runtime.practiceReason || 'Lock in one answer. Harder tiers give you more answer time.');
    runtime.progressBar.style.width = `${(runtime.index / QUESTION_COUNT) * 100}%`;
    updateLadder();
    startTimer();
  }

  function updateLadder() {
    runtime.ladder.querySelectorAll('[data-rung]').forEach(row => {
      const idx = Number(row.dataset.rung);
      row.classList.toggle('current', idx === runtime.index && runtime.state === 'question');
      row.classList.toggle('passed', idx < runtime.index || runtime.state === 'won');
    });
    runtime.mobileProgress.querySelectorAll('[data-mobile-rung]').forEach(row => {
      const idx = Number(row.dataset.mobileRung);
      row.classList.toggle('current', idx === runtime.index && runtime.state === 'question');
      row.classList.toggle('passed', idx < runtime.index || runtime.state === 'won');
    });
  }

  function startTimer() {
    stopTimer();
    const seconds = QUESTION_SECONDS_BY_TIER[tierForQuestion(runtime.questions[runtime.index])] || 35;
    runtime.questionStartedAt = performance.now();
    runtime.deadlineAt = runtime.questionStartedAt + seconds * 1000;
    renderTimer();
    runtime.timerHandle = window.setInterval(renderTimer, 100);
  }

  function stopTimer() {
    if (runtime.timerHandle) clearInterval(runtime.timerHandle);
    runtime.timerHandle = 0;
  }

  function renderTimer() {
    if (runtime.state !== 'question') return;
    const left = Math.max(0, runtime.deadlineAt - performance.now());
    const secs = Math.ceil(left / 1000);
    runtime.timerEl.textContent = `${secs}s`;
    runtime.timerWrap.classList.toggle('warn', secs <= 10 && secs > 5);
    runtime.timerWrap.classList.toggle('danger', secs <= 5);
    if (left <= 0 && !runtime.locked) timeoutQuestion();
  }

  function timeoutQuestion() {
    runtime.locked = true;
    stopTimer();
    runtime.answers.push(-1);
    revealCorrect();
    runtime.statusEl.dataset.kind = 'bad';
    runtime.statusEl.textContent = 'TIME OUT · Review the correct answer.';
    tone('wrong');
    showLearningFeedback('TIME OUT');
  }

  function useFifty() {
    if (runtime.state !== 'question' || runtime.locked || runtime.fiftyUsed) return;
    const q = runtime.questions[runtime.index];
    const wrong = [0,1,2,3].filter(i => i !== q.answer && !runtime.answerButtons[i].classList.contains('eliminated'));
    wrong.sort(() => Math.random() - .5).slice(0, 2).forEach(i => {
      runtime.answerButtons[i].classList.add('eliminated');
      runtime.answerButtons[i].disabled = true;
    });
    runtime.fiftyUsed = true;
    runtime.lifelinesUsed += 1;
    renderLifelines();
    runtime.statusEl.dataset.kind = 'gold';
    runtime.statusEl.textContent = '50:50 used · Two incorrect options removed.';
    tone('life');
  }

  function useDouble() {
    if (runtime.state !== 'question' || runtime.locked || runtime.doubleUsed) return;
    runtime.doubleUsed = true;
    runtime.doubleActive = true;
    runtime.lifelinesUsed += 1;
    renderLifelines();
    runtime.statusEl.dataset.kind = 'gold';
    runtime.statusEl.textContent = 'SECOND CHANCE armed · If the first pick is wrong, choose once more.';
    tone('life');
  }

  function buildAudiencePercentages(correctIndex, tier, availableIndices) {
    const available = Array.isArray(availableIndices) && availableIndices.length
      ? availableIndices.slice()
      : [0,1,2,3];
    const correctTopChance = [0, .92, .84, .74, .64, .56][tier] || .7;
    const scores = [0,0,0,0];
    available.forEach(i => { scores[i] = .45 + Math.random() * .85; });
    const correctBoost = [0, 3.6, 3.0, 2.4, 1.9, 1.55][tier] || 2.2;
    if (available.includes(correctIndex)) scores[correctIndex] += correctBoost;
    if (Math.random() > correctTopChance) {
      const wrong = available.filter(i => i !== correctIndex);
      if (wrong.length) {
        const leader = wrong[Math.floor(Math.random() * wrong.length)];
        scores[leader] = Math.max(scores[leader], scores[correctIndex] + .35 + Math.random() * 1.0);
      }
    }
    const total = available.reduce((sum, i) => sum + scores[i], 0) || 1;
    const raw = scores.map((n, i) => available.includes(i) ? (n / total * 100) : 0);
    const pct = raw.map(Math.floor);
    let remaining = 100 - pct.reduce((sum, n) => sum + n, 0);
    const order = available.map(i => ({ i, r: raw[i] - Math.floor(raw[i]) })).sort((a,b) => b.r - a.r);
    for (let i = 0; i < remaining && order.length; i += 1) pct[order[i % order.length].i] += 1;
    return pct;
  }

  function useAudience() {
    if (runtime.state !== 'question' || runtime.locked || runtime.audienceUsed) return;
    const q = runtime.questions[runtime.index];
    if (!q) return;
    const tier = tierForQuestion(q);
    const available = runtime.answerButtons.map((btn, i) => btn.classList.contains('eliminated') ? -1 : i).filter(i => i >= 0);
    const pct = buildAudiencePercentages(q.answer, tier, available);
    runtime.answerButtons.forEach((btn, i) => {
      let badge = btn.querySelector('.audience-pct');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'audience-pct';
        btn.appendChild(badge);
      }
      badge.textContent = `${pct[i]}%`;
      badge.style.setProperty('--audience', `${pct[i]}%`);
      btn.classList.add('audience-shown');
    });
    runtime.audienceUsed = true;
    runtime.lifelinesUsed += 1;
    renderLifelines();
    runtime.statusEl.dataset.kind = 'gold';
    runtime.statusEl.textContent = 'AUDIENCE VOTE · Results are guidance, not a guaranteed answer.';
    tone('life');
  }

  function parseQuestionId(id) {
    const match = /^mb([1-5])-([0-9]{3})$/.exec(String(id || ''));
    if (!match) return null;
    const tier = Number(match[1]);
    const number = Number(match[2]);
    const count = TIER_COUNTS[tier] || 0;
    if (number < 1 || number > count) return null;
    return { tier, number };
  }

  async function useSwitch() {
    if (runtime.state !== 'question' || runtime.locked || runtime.switchUsed) return;
    const originalId = runtime.questionIds[runtime.index];
    if (!originalId) return;
    runtime.locked = true;
    runtime.statusEl.dataset.kind = 'gold';
    runtime.statusEl.textContent = 'SWITCHING · Reserving a fresh unseen question…';
    renderLifelines();

    let replacementId = '';
    try {
      if (runtime.rewardEligible && runtime.round?.sessionId && runtime.bridge?.switchMillionByteQuestion) {
        const response = await withTimeout(runtime.bridge.switchMillionByteQuestion({
          sessionId: runtime.round.sessionId,
          bankVersion: BANK_VERSION,
          questionIndex: runtime.index,
          originalQuestionId: originalId
        }), 7000, null);
        replacementId = String(response?.replacementId || '');
      } else {
        replacementId = reserveLocalSwitchQuestion(originalId, runtime.questionIds);
      }
    } catch (error) {
      console.warn('[Million Byte] switch reservation failed:', error);
    }

    const replacement = replacementId && runtime.bank?.byId?.[replacementId];
    if (!replacement) {
      runtime.locked = false;
      runtime.statusEl.dataset.kind = 'bad';
      runtime.statusEl.textContent = 'No unseen replacement is available in this difficulty right now. Keep this question or use another lifeline.';
      renderLifelines();
      renderTimer();
      return;
    }

    const preserveDouble = runtime.doubleActive === true;
    runtime.questionIds[runtime.index] = replacementId;
    runtime.questions[runtime.index] = replacement;
    runtime.switchUsed = true;
    runtime.switchIndex = runtime.index;
    runtime.lifelinesUsed += 1;
    showQuestion({ switched: true, preserveDouble });
    renderLifelines();
    tone('life');
  }

  function chooseAnswer(index) {
    if (runtime.state !== 'question' || runtime.locked) return;
    const q = runtime.questions[runtime.index];
    const btn = runtime.answerButtons[index];
    if (!q || !btn || btn.disabled || btn.classList.contains('eliminated')) return;

    runtime.locked = true;
    stopTimer();
    btn.classList.add('locked');
    runtime.answerButtons.forEach(b => { if (b !== btn) b.disabled = true; });
    tone('lock');

    setTimeout(() => {
      if (!runtime.open || runtime.state !== 'question') return;
      const correct = index === q.answer;
      if (correct) {
        runtime.answers.push(index);
        runtime.correctCount += 1;
        btn.classList.remove('locked');
        btn.classList.add('correct');
        runtime.statusEl.dataset.kind = 'good';
        runtime.statusEl.textContent = runtime.index === 14 ? 'FINAL ANSWER CORRECT!' : 'CORRECT · Link secured.';
        tone('correct');
        setTimeout(advanceAfterCorrect, runtime.index === 14 ? 1000 : 720);
        return;
      }

      btn.classList.remove('locked');
      btn.classList.add('wrong');
      tone('wrong');
      if (runtime.doubleActive && !runtime.doubleWrongThisQuestion) {
        runtime.doubleWrongThisQuestion = true;
        runtime.rescuedWrong += 1;
        runtime.locked = false;
        btn.disabled = true;
        runtime.answerButtons.forEach((b, i) => {
          if (i !== index && !b.classList.contains('eliminated')) b.disabled = false;
        });
        runtime.statusEl.dataset.kind = 'gold';
        runtime.statusEl.textContent = 'SECOND CHANCE · One final answer.';
        const seconds = Math.max(8, Math.min(15, QUESTION_SECONDS_BY_TIER[tierForQuestion(q)] || 15));
        runtime.deadlineAt = performance.now() + seconds * 1000;
        runtime.timerHandle = window.setInterval(renderTimer, 100);
        renderTimer();
        return;
      }

      runtime.answers.push(index);
      revealCorrect();
      runtime.statusEl.dataset.kind = 'bad';
      runtime.statusEl.textContent = `Incorrect · Correct answer: ${LETTERS[q.answer]}. ${q.options[q.answer]}`;
      showLearningFeedback('INCORRECT ANSWER');
    }, 470);
  }

  // Learning feedback is bank-authored only. Runtime explanation generation is intentionally disabled.

  function buildLearningNote(q) {
    if (!verifiedExplanation(q)) {
      throw new Error(`Million Byte blocked an unverified explanation: ${q?.id || 'unknown-question'}`);
    }
    return q.explanation.trim();
  }

  function learningLabelFor(q) {
    return verifiedExplanation(q) ? 'WHY THIS IS CORRECT' : 'EXPLANATION UNAVAILABLE';
  }

  function showLearningFeedback(reason) {
    const q = runtime.questions[runtime.index];
    if (!q || !runtime.learnPanel) {
      finishFailed(reason || 'INCORRECT ANSWER');
      return;
    }
    runtime.state = 'learning';
    runtime.locked = true;
    runtime.pendingFailReason = reason || 'INCORRECT ANSWER';
    runtime.learnTitle.textContent = reason === 'TIME OUT' ? "TIME'S UP — LEARN THIS" : 'NOT QUITE — LEARN THIS';
    runtime.learnQuestion.textContent = q.q;
    runtime.learnCorrect.textContent = `${LETTERS[q.answer]}. ${q.options[q.answer]}`;
    if (runtime.learnLabel) runtime.learnLabel.textContent = learningLabelFor(q);
    try {
      runtime.learnNote.textContent = buildLearningNote(q);
    } catch (error) {
      console.error('[Million Byte] explanation quality failure:', error);
      finishFailed('QUESTION DATA ERROR');
      return;
    }
    runtime.learnPanel.hidden = false;
  }

  function continueAfterLearning() {
    if (!runtime.open || runtime.state !== 'learning') return;
    const reason = runtime.pendingFailReason || 'INCORRECT ANSWER';
    runtime.pendingFailReason = '';
    if (runtime.learnPanel) runtime.learnPanel.hidden = true;
    finishFailed(reason);
  }

  function revealCorrect() {
    const q = runtime.questions[runtime.index];
    if (!q) return;
    runtime.answerButtons[q.answer]?.classList.add('correct');
    runtime.answerButtons.forEach(btn => { btn.disabled = true; });
  }

  function advanceAfterCorrect() {
    if (!runtime.open) return;
    if (runtime.index >= QUESTION_COUNT - 1) {
      finishWon();
      return;
    }
    const previousTier = tierForQuestion(runtime.questions[runtime.index], runtime.index);
    runtime.index += 1;
    const nextTier = tierForQuestion(runtime.questions[runtime.index], runtime.index);
    showQuestion();
    if (nextTier > previousTier) {
      runtime.statusEl.dataset.kind = 'gold';
      runtime.statusEl.textContent = `NEXT TIER · ${TIER_NAMES[nextTier - 1]}`;
    } else if (nextTier < previousTier) {
      runtime.statusEl.dataset.kind = 'gold';
      runtime.statusEl.textContent = 'FULL 2,000-QUESTION CYCLE COMPLETED · Fresh cycle started.';
    }
  }

  function runDurationMs() {
    return Math.max(0, Math.floor(performance.now() - runtime.startedAt));
  }

  function scoreDetails(completed, durationMs) {
    if (!completed) return { score: 0, tier: 0 };
    const lifelineBonus = runtime.lifelinesUsed === 0 ? 150 : runtime.lifelinesUsed === 1 ? 75 : 0;
    const cleanBonus = runtime.rescuedWrong === 0 ? 100 : 25;
    const sec = durationMs / 1000;
    const speedBonus = sec <= 150 ? 100 : sec <= 240 ? 60 : sec <= 360 ? 30 : 0;
    const score = Math.min(1000, 650 + lifelineBonus + cleanBonus + speedBonus);
    // A true 15/15 clear with no rescued wrong answer earns the special
    // 15 XP Million Byte reward. 50:50, Audience, and Switch are allowed because
    // every locked answer is still correct; a 2X rescue after a wrong pick is not perfect.
    let tier = runtime.correctCount === QUESTION_COUNT && runtime.rescuedWrong === 0 ? 15 : (score >= 650 ? 1 : 0);
    if (tier < 15 && score >= 825 && runtime.lifelinesUsed <= 1 && runtime.rescuedWrong === 0) tier = 2;
    if (tier < 15 && score >= 950 && runtime.lifelinesUsed === 0 && runtime.rescuedWrong === 0 && sec >= 45) tier = 3;
    return { score, tier };
  }

  function metrics(completed, durationMs) {
    return {
      completedRun: completed === true,
      bankVersion: BANK_VERSION,
      questionIds: runtime.questionIds.slice(),
      answers: runtime.answers.slice(0, QUESTION_COUNT),
      correctCount: runtime.correctCount,
      reachedQuestion: Math.min(QUESTION_COUNT, runtime.index + 1),
      lifelinesUsed: runtime.lifelinesUsed,
      fiftyUsed: runtime.fiftyUsed,
      doubleUsed: runtime.doubleUsed,
      audienceUsed: runtime.audienceUsed,
      switchUsed: runtime.switchUsed,
      switchIndex: runtime.switchIndex,
      rescuedWrong: runtime.rescuedWrong,
      activeTimeMs: durationMs,
      durationMs
    };
  }

  async function finishFailed(reason) {
    stopTimer();
    if (runtime.learnPanel) runtime.learnPanel.hidden = true;
    runtime.pendingFailReason = '';
    runtime.state = 'failed';
    runtime.locked = true;
    updateLadder();
    const duration = runDurationMs();
    const failPanel = runtime.failPanel;
    failPanel.querySelector('[data-mb-fail-title]').textContent = reason;
    failPanel.querySelector('[data-mb-fail-reached]').textContent = `Q${Math.min(15, runtime.index + 1)}`;
    failPanel.querySelector('[data-mb-fail-correct]').textContent = `${runtime.correctCount}/15`;
    const note = failPanel.querySelector('[data-mb-fail-note]');
    note.className = 'million-byte-reward-note';
    note.textContent = runtime.rewardEligible ? 'No XP — reach the 1M BYTE endpoint first.' : (runtime.practiceReason || 'Practice run — no account XP.');
    failPanel.hidden = false;

    // The account question cursors were advanced atomically when this ladder
    // was reserved, so a failed run needs no reward/network claim. Cancel the
    // local bridge round and keep gameplay quota-light; the next reservation
    // safely replaces the stale active reservation on the server.
    if (runtime.round?.sessionId) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
  }

  async function finishWon() {
    stopTimer();
    runtime.state = 'won';
    runtime.locked = true;
    runtime.index = 14;
    runtime.progressBar.style.width = '100%';
    updateLadder();
    const duration = runDurationMs();
    const details = scoreDetails(true, duration);
    runtime.resultScore.textContent = String(details.score);
    runtime.resultReached.textContent = '15/15';
    runtime.resultTime.textContent = formatTime(duration);
    runtime.resultXp.textContent = '+0';
    runtime.resultTitle.textContent = '1,000,000 BYTE!';
    runtime.resultCopy.textContent = runtime.lifelinesUsed === 0 ? 'Flawless ladder. No lifelines used.' : `Challenge cleared with ${runtime.lifelinesUsed} lifeline${runtime.lifelinesUsed === 1 ? '' : 's'} used.`;
    runtime.rewardNote.className = 'million-byte-reward-note';
    runtime.rewardNote.textContent = runtime.rewardEligible ? (details.tier === 15 ? 'Perfect 15/15 · verifying 15 XP reward…' : 'Checking secure reward…') : (runtime.practiceReason || 'Practice run — no account XP.');
    runtime.resultPanel.hidden = false;
    tone('win');

    if (!runtime.round?.sessionId || !runtime.rewardEligible || !runtime.bridge?.claimRound) {
      if (runtime.round?.sessionId) try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
      return;
    }

    runtime.rewardSubmitting = true;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, { score: details.score, metrics: metrics(true, duration) });
      const awarded = Math.max(0, Number(result?.awardedXp || 0));
      runtime.resultXp.textContent = `+${awarded}`;
      runtime.lastRewardDay = String(result?.gameRecord?.lastRewardDay || runtime.lastRewardDay || '');
      runtime.lastRewardXp = Math.max(0, Number(result?.gameRecord?.lastRewardXp || runtime.lastRewardXp || 0));
      runtime.bestScore = Math.max(runtime.bestScore, Number(result?.gameRecord?.bestScore || details.score));
      if (result?.loginRequired) {
        runtime.rewardNote.className = 'million-byte-reward-note warn';
        runtime.rewardNote.textContent = 'Practice mode — sign in as a student to earn XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.className = 'million-byte-reward-note warn';
        runtime.rewardNote.textContent = 'XP could not sync. No account XP was added.';
      } else if (result?.reservationMismatch) {
        runtime.rewardNote.className = 'million-byte-reward-note warn';
        runtime.rewardNote.textContent = 'Question set could not be verified, so no XP was added.';
      } else if (result?.capReached && awarded <= 0) {
        runtime.rewardNote.className = 'million-byte-reward-note warn';
        runtime.rewardNote.textContent = 'Daily Mini-Game XP limit reached. Replay for score only.';
      } else if (awarded > 0) {
        runtime.rewardNote.className = 'million-byte-reward-note success';
        runtime.rewardNote.textContent = `Reward added safely · Today’s Game XP: ${result.todayXp}/${result.dailyCap}`;
        try { runtime.onReward?.(result); } catch (_) {}
      } else if (details.tier > 0) {
        runtime.rewardNote.className = 'million-byte-reward-note warn';
        runtime.rewardNote.textContent = 'That reward tier is already secured today. Beat your best for records.';
      } else {
        runtime.rewardNote.textContent = 'Challenge complete, but this run did not reach an XP tier.';
      }
    } catch (_) {
      runtime.rewardNote.className = 'million-byte-reward-note warn';
      runtime.rewardNote.textContent = 'Reward could not be processed. No XP was added.';
    } finally {
      runtime.rewardSubmitting = false;
    }
  }

  function formatTime(ms) {
    const sec = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  }

  function tone(kind) {
    if (!runtime.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!runtime.audioContext) runtime.audioContext = new AudioCtx();
      const ctx = runtime.audioContext;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const notes = kind === 'correct' ? [523,659] : kind === 'wrong' ? [165,123] : kind === 'win' ? [523,659,784,1047] : kind === 'life' ? [660,880] : kind === 'start' ? [330,440,660] : [260];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = kind === 'wrong' ? 'sawtooth' : 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(.0001, now + i * .07);
        gain.gain.exponentialRampToValueAtTime(__ict8SfxGain(.055), now + i * .07 + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, now + i * .07 + .13);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * .07);
        osc.stop(now + i * .07 + .15);
      });
    } catch (_) {}
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    try { runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); } catch (_) {}
    if (runtime.soundEnabled) tone('lock');
  }

  function onKeyDown(event) {
    if (!runtime.open) return;
    if (event.key === 'Escape') { event.preventDefault(); returnToHub(); return; }
    if (runtime.state !== 'question' || runtime.locked) return;
    const key = String(event.key || '').toUpperCase();
    const index = ['A','B','C','D'].indexOf(key);
    const number = ['1','2','3','4'].indexOf(key);
    const pick = index >= 0 ? index : number;
    if (pick >= 0) { event.preventDefault(); chooseAnswer(pick); }
  }

  function pauseForExitGuard() {
    if (!runtime.open || runtime.exitGuardPause) return false;
    if (runtime.state !== 'question' || runtime.locked || !runtime.deadlineAt) return false;
    runtime.exitGuardPause = {
      pausedAt: performance.now(),
      remainingMs: Math.max(0, runtime.deadlineAt - performance.now())
    };
    stopTimer();
    return true;
  }

  function resumeFromExitGuard() {
    const paused = runtime.exitGuardPause;
    if (!runtime.open || !paused) return false;
    runtime.exitGuardPause = null;
    const now = performance.now();
    const pauseDuration = Math.max(0, now - Number(paused.pausedAt || now));
    if (runtime.startedAt) runtime.startedAt += pauseDuration;
    runtime.questionStartedAt = now;
    runtime.deadlineAt = now + Math.max(250, Number(paused.remainingMs || 0));
    stopTimer();
    runtime.timerHandle = window.setInterval(renderTimer, 100);
    renderTimer();
    return true;
  }

  function returnToHub() {
    const cb = runtime.onBack;
    closeInternal();
    try { cb?.(); } catch (_) {}
  }

  function closeAll() {
    const cb = runtime.onClose;
    closeInternal();
    try { cb?.(); } catch (_) {}
  }

  function closeInternal() {
    if (!runtime.open) return;
    stopTimer();
    if (runtime.round?.sessionId && !runtime.rewardSubmitting) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.round = null;
    runtime.open = false;
    runtime.state = 'closed';
    runtime.overlay.hidden = true;
    document.body.classList.remove('million-byte-active');
    runtime.readyPanel.hidden = false;
    runtime.loadingPanel.hidden = true;
    runtime.failPanel.hidden = true;
    if (runtime.learnPanel) runtime.learnPanel.hidden = true;
    runtime.pendingFailReason = '';
    runtime.resultPanel.hidden = true;
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    const record = snap.gameRecords?.millionByte || {};
    runtime.bestScore = Math.max(0, Number(record.bestScore || 0));
    runtime.bestReached = Math.max(0, Number(record.bestReached || 0));
    runtime.lastRewardDay = String(record.lastRewardDay || '');
    runtime.lastRewardXp = Math.max(0, Number(record.lastRewardXp || 0));
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.open = true;
    runtime.state = 'ready';
    runtime.overlay.hidden = false;
    document.body.classList.add('million-byte-active');
    runtime.readyPanel.hidden = false;
    runtime.loadingPanel.hidden = true;
    runtime.failPanel.hidden = true;
    if (runtime.learnPanel) runtime.learnPanel.hidden = true;
    runtime.pendingFailReason = '';
    runtime.resultPanel.hidden = true;
    runtime.statusEl.dataset.kind = '';
    runtime.statusEl.textContent = 'Choose carefully. The questions get harder.';
    setReadyStatus('');
    if (runtime.playBtn) runtime.playBtn.disabled = false;
    runtime.progressBar.style.width = '0%';
    // Warm the large question bank while the intro is visible so START feels instant.
    ensureBank().catch(error => {
      console.warn('[Million Byte] preload failed; START will retry:', error);
    });
    runtime.index = 0;
    updateLadder();
  }

  window[GLOBAL_NAME] = Object.freeze({ open, close: closeInternal, isOpen: () => runtime.open, pauseForExitGuard, resumeFromExitGuard });
})();
