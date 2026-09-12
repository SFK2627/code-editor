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
  const BANK_ASSET_VERSION = '20260912-v4761-million-byte-v53-github-safe';
  const BANK_URL = new URL(`million-byte-questions.js?v=${BANK_ASSET_VERSION}`, GAME_DIR_URL).href;
  const BANK_VERSION = 3;
  const QUESTION_COUNT = 15;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const VALUES = ['100','200','300','500','1K','2K','4K','8K','16K','32K','64K','125K','250K','500K','1M'];
  const TIER_NAMES = ['EASY','MODERATE','CHALLENGING','DIFFICULT','EXPERT'];
  const TIER_COUNTS = [0, 520, 520, 304, 304, 352];
  const QUESTION_SECONDS = [35,35,35,40,40,40,45,45,45,50,50,50,55,55,55];
  const LOCAL_STATE_KEY = 'ict8.millionByte.questionCursor.v3';
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
            <p>Answer 15 general-knowledge questions from Easy to Expert. Each run gives you 3 random lifelines from a pool of 4.</p>
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
              <small>WHY THIS IS CORRECT</small>
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

  function validBank(bank = window.ICT8_MILLION_BYTE_BANK) {
    return !!(bank && bank.version === BANK_VERSION && bank.count >= 2000 && bank.byId);
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

  function permutation(tier, cycle) {
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

  function localQuestionIds() {
    let state = { version: BANK_VERSION, tiers: {} };
    try {
      const parsed = JSON.parse(localStorage.getItem(LOCAL_STATE_KEY) || 'null');
      if (parsed && parsed.version === BANK_VERSION && parsed.tiers) state = parsed;
    } catch (_) {}
    const ids = [];
    const selected = new Set();
    for (let tier = 1; tier <= 5; tier += 1) {
      let row = state.tiers[tier] || { cycle: 0, cursor: 0 };
      const tierCount = TIER_COUNTS[tier] || 0;
      let cycle = Math.max(0, Number(row.cycle || 0) | 0);
      let cursor = Math.max(0, Math.min(tierCount, Number(row.cursor || 0) | 0));
      for (let take = 0; take < 3; take += 1) {
        let id = '';
        let guard = 0;
        while (guard < tierCount + 2) {
          if (cursor >= tierCount) { cycle += 1; cursor = 0; }
          const perm = permutation(tier, cycle);
          const n = perm[cursor++];
          id = `mb${tier}-${String(n).padStart(3, '0')}`;
          guard += 1;
          if (!selected.has(id)) break;
        }
        if (!id || selected.has(id)) throw new Error('Could not build a unique local Million Byte question set.');
        selected.add(id);
        ids.push(id);
      }
      state.tiers[tier] = { cycle, cursor };
    }
    try { localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state)); } catch (_) {}
    return ids;
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

  function tierForIndex(index) { return Math.min(5, Math.floor(index / 3) + 1); }

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
    const tier = tierForIndex(runtime.index);
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
    const seconds = QUESTION_SECONDS[runtime.index] || 25;
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
    const tier = tierForIndex(runtime.index);
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

  function deterministicSwitchQuestionId(roundId, originalId, excludedIds) {
    const parsed = parseQuestionId(originalId);
    if (!parsed) return '';
    const count = TIER_COUNTS[parsed.tier] || 0;
    const excluded = new Set(Array.isArray(excludedIds) ? excludedIds : []);
    excluded.add(originalId);
    let state = hashSeed(`${String(roundId || '')}:million-byte-switch:${originalId}`) || 1;
    for (let guard = 0; guard < count + 4; guard += 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const n = (state % count) + 1;
      const id = `mb${parsed.tier}-${String(n).padStart(3, '0')}`;
      if (!excluded.has(id)) return id;
    }
    for (let n = 1; n <= count; n += 1) {
      const id = `mb${parsed.tier}-${String(n).padStart(3, '0')}`;
      if (!excluded.has(id)) return id;
    }
    return '';
  }

  function useSwitch() {
    if (runtime.state !== 'question' || runtime.locked || runtime.switchUsed) return;
    const originalId = runtime.questionIds[runtime.index];
    const seed = runtime.round?.sessionId || runtime.localSwitchSeed;
    const replacementId = deterministicSwitchQuestionId(seed, originalId, runtime.originalQuestionIds);
    const replacement = replacementId && runtime.bank?.byId?.[replacementId];
    if (!replacement) {
      runtime.statusEl.dataset.kind = 'bad';
      runtime.statusEl.textContent = 'Could not switch this question. Try another lifeline.';
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
        const seconds = Math.max(8, Math.min(15, QUESTION_SECONDS[runtime.index] || 15));
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

  function sentenceCase(value) {
    const text = String(value || '').trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  function lowerFirst(value) {
    const text = String(value || '').trim();
    return text ? text.charAt(0).toLowerCase() + text.slice(1) : '';
  }

  const LEARNING_BY_ID = Object.freeze({
    'mb2-105': 'The Pact of Biak-na-Bato was an 1897 truce between Spanish colonial authorities and Emilio Aguinaldo’s revolutionary government. The agreement temporarily stopped fighting and was followed by Aguinaldo’s exile to Hong Kong.',
    'mb2-165': 'A solvent is the substance that dissolves a solute to form a solution. For example, in salt water, water is the solvent and salt is the solute.',
    'mb1-177': 'Earth is the third planet from the Sun: Mercury is first, Venus is second, and Earth comes next.',
    'mb2-222': 'When Mia is 12, her brother is twice her age, so he is 24. Three years later Mia is 15, and her brother is 27.',
    'mb3-149': 'Because every label is wrong, the box labeled MIXED cannot actually be mixed. Draw from that box first; the fruit you get tells you which pure-fruit box it really is, and the other two labels can then be deduced.',
    'mb3-153': 'The order information gives E before A, A before B, and B before C. Therefore E must finish before A, B, and C.',
    'mb4-151': 'Turn one bulb on for a while, then switch it off; turn a second bulb on and enter the room. The lit bulb belongs to the second switch, the warm-but-off bulb to the first, and the cold bulb to the remaining switch.',
    'mb1-250': 'The prefix “un-” commonly means “not” or the opposite of a condition. So “unhappy” means not happy.',
    'mb1-260': '“At” is a pangatnig because it joins the two names Ana and Ben in the sentence.',
    'mb1-261': '“Sa” functions as a pang-ukol because it links the action “pumunta” to the place “paaralan.”',
    'mb2-251': '“Nang” is used here because “mabilis” describes how the action “tumakbo” was done. It functions adverbially: “Tumakbo siya nang mabilis.”',
    'mb2-252': '“Rin” is normally used after a word ending in a vowel, w, or y, while “din” is generally used after other consonants. “Ako” ends in a vowel, so “rin” is appropriate.',
    'mb2-253': '“Raw” is normally used after a word ending in a vowel, w, or y, while “daw” is generally used after other consonants. “Siya” ends in a vowel, so “raw” is appropriate.',
    'mb2-254': '“May” expresses possession or existence. A more natural full phrasing is “May dala akong payong,” meaning “I have an umbrella with me.”',
    'mb2-259': '“Kabilaan” means a word receives both a prefix and a suffix. In “kabutihan,” “ka-” appears before the root and “-han” after it.',
    'mb2-260': '“Bahay-kubo” is tambalan because it combines two root words—“bahay” and “kubo”—to form one compound word.',
    'mb2-261': '“Araw-araw” is inuulit because the root word “araw” is repeated.',
    'mb2-262': '“Bukas” answers the question “kailan?” or when the action will happen, so it is a pang-abay na pamanahon.',
    'mb2-263': '“Doon” answers the question “saan?” or where the action will happen, so it is a pang-abay na panlunan.',
    'mb2-265': '“Dahil” connects a cause to a result. In the sentence, the rain is the reason for going home, so “dahil” acts as a conjunction expressing cause.',
    'mb4-164': '“Bahay” contains the diphthong “ay,” where a vowel and a glide are pronounced together within the same syllabic unit.',
    'mb3-167': 'Ibarra’s full name in “Noli Me Tangere” is Juan Crisóstomo Ibarra. “Ibarra” is the surname commonly used to refer to the character.',
    'mb3-168': 'Simoun is the disguised identity of Crisóstomo Ibarra in “El Filibusterismo.” He returns under this new identity after the events of “Noli Me Tangere.”',
    'mb1-298': 'Anna and Elsa are the royal sisters at the center of Disney’s “Frozen”: Elsa has ice powers, while Anna sets out to bring her sister home.',
    'mb1-300': 'Hogwarts School of Witchcraft and Wizardry is the school Harry Potter attends to study magic.',
    'mb1-314': 'In “Encantadia,” Sang’gre is the title used for the royal warrior princesses of Lireo.',
    'mb2-326': 'Link is the usual playable hero of “The Legend of Zelda” series. Zelda is typically the princess, not the player character’s name.',
    'mb2-327': 'The classic Pac-Man enemies are the ghosts that chase Pac-Man through the maze while he collects pellets.',
    'mb2-344': 'The football penalty mark is 12 yards, or about 11 meters, from the goal line.',
    'mb2-346': 'A standard round in men’s professional championship boxing normally lasts three minutes, followed by a rest period.',
    'mb3-199': 'A player cannot be offside while entirely in their own half of the field. Offside position is judged only once the player is in the opponents’ half, along with the other offside conditions.',
    'mb3-205': 'JavaScript’s === operator checks strict equality: the values must be equal and their types must also match. It does not perform type coercion like == can.',
    'mb5-240': 'A Content Security Policy can reduce cross-site scripting risk by restricting which scripts, frames, and other resources a page is allowed to load or execute.',
    'mb1-383': 'The volt is named after Alessandro Volta, whose voltaic pile was one of the earliest practical batteries capable of producing a continuous electric current.',
    'mb2-377': 'Ernest Rutherford’s gold-foil experiment showed that most alpha particles passed through while a few were strongly deflected. This led to the model of an atom with a tiny, dense, positively charged nucleus.',
    'mb2-384': 'The Bessemer process made large-scale steel production cheaper by blowing air through molten pig iron to remove impurities.',
    'mb4-214': 'The maser—Microwave Amplification by Stimulated Emission of Radiation—used the same stimulated-emission principle that was later applied to visible light in lasers.',
    'mb5-252': 'Efficient blue LEDs were crucial because blue light can excite phosphors to create bright white light. This breakthrough made modern energy-efficient white LED lighting practical.',
    'mb1-397': 'The Filipino gesture “mano” traditionally shows respect to elders by bringing an elder’s hand toward one’s forehead.',
    'mb5-260': 'T’boli t’nalak weavers are sometimes called Dreamweavers because traditional designs are culturally associated with patterns revealed or inspired through dreams.',
    'mb1-422': 'The stage is the main performance area in a theater where actors, dancers, or other performers appear before the audience.',
    'mb1-423': 'In the traditional RYB subtractive paint model, red, yellow, and blue are taught as primary colors because they are used to mix many other paint colors.',
    'mb2-437': 'In Greek mythology, Prometheus defied Zeus by giving fire to humanity, an act often associated with knowledge and civilization.',
    'mb4-236': 'In Norse mythology, Hel is a child of Loki and the giantess Angrboda. She rules a realm that receives many of the dead.',
    'mb3-241': 'Ralph Plaisted’s 1968 snowmobile expedition is widely credited as the first undisputed surface expedition to reach the North Pole because its position was independently verified.',
    'mb5-286': 'Reinhold Messner and Peter Habeler became the first climbers to summit Mount Everest without supplemental oxygen in 1978.',
    'mb1-479': 'A fair coin has two equally likely outcomes, heads and tails. Therefore the probability of heads on one toss is 1 out of 2, or 1/2.',
    'mb1-517': 'Checkmate occurs when the king is in check and there is no legal move that can remove the threat. The game ends immediately.',
    'mb2-476': 'From 3x + 5 = 20, subtract 5 from both sides to get 3x = 15. Dividing by 3 gives x = 5.',
    'mb2-477': 'From 5x - 7 = 18, add 7 to both sides to get 5x = 25. Dividing by 5 gives x = 5.',
    'mb2-483': 'Ten days is one full week plus three more days. Monday + 7 days is Monday again, then three more days gives Thursday.',
    'mb2-516': 'In tennis, 40-40 is called deuce. From deuce, a player normally needs to win two consecutive points to win the game.',
    'mb3-261': 'When multiplying powers with the same base, add the exponents: 2³ × 2⁴ = 2^(3+4) = 2⁷.',
    'mb3-276': 'Correlation means two variables change together, but it does not prove that one caused the other. A third factor or coincidence may explain the relationship.',
    'mb4-263': 'Conditional probability uses P(A|B) = P(A∩B) / P(B). Here, 0.2 / 0.4 = 0.5.',
    'mb4-265': 'The empirical 68–95–99.7 rule says about 68% of observations in an approximately normal distribution lie within one standard deviation of the mean.',
    'mb5-301': 'Special relativity predicts time dilation: from an inertial observer’s frame, a moving clock runs slower than a clock at rest in that frame.',
    'mb5-311': 'Bayes’ theorem combines the prior probability of disease with a test’s sensitivity and specificity to calculate the probability of disease after a positive result.',
    'mb5-312': 'A 95% confidence-interval procedure has 95% long-run coverage: if the same method were repeated many times, about 95% of the intervals would contain the true parameter.',
    'mb1-190': 'A star produces its own energy and light through processes in its interior, while a planet does not produce starlight and is seen mainly by reflected light.',
    'mb2-310': 'The Academy Awards are popularly called the Oscars. “Oscar” is the widely used nickname for both the awards ceremony and the statuettes.',
    'mb1-338': 'In “Doctor Who,” the Doctor’s time-and-space machine is called the TARDIS, short for Time And Relative Dimension In Space.',
    'mb5-232': 'James Naismith published 13 original rules when he created basketball in 1891.',
    'mb3-268': 'Ad hominem is a fallacy in which someone attacks the person making an argument instead of addressing the argument itself.'
  });

  const LEARNING_FACTS = Object.freeze({
    'ssd': 'SSDs store data in flash-memory chips instead of spinning magnetic platters. Because there is no motorized platter or moving read/write head, an SSD has no moving mechanical parts.',
    'gpu': 'A GPU, or Graphics Processing Unit, is built to perform many calculations in parallel. That makes it especially effective for rendering graphics and other highly parallel workloads.',
    'router': 'A router examines network addresses and forwards data packets between different networks, helping devices reach destinations outside their local network.',
    'modulator and demodulator': 'The word modem comes from modulator-demodulator. Traditional modems modulated digital data onto a carrier signal and demodulated incoming signals back into digital data.',
    'short-range wireless device communication': 'Bluetooth is designed for short-range wireless communication between nearby devices such as phones, earbuds, keyboards, and controllers.',
    'quick response': 'QR stands for Quick Response. QR codes were designed to be scanned quickly while storing more data than a traditional one-dimensional barcode.',
    'a deceptive attempt to steal information by impersonating a trusted source': 'Phishing uses fake messages, websites, or identities to trick people into revealing passwords, payment details, or other sensitive information.',
    'store and generate account credentials securely': 'A password manager stores credentials in an encrypted vault and can generate strong, unique passwords so users do not have to reuse the same password across accounts.',
    'small data stored by a website in the browser': 'A browser cookie is a small piece of data a website asks the browser to store. Cookies can remember sessions, preferences, and other site-specific state.',
    'covalent bond': 'A covalent bond forms when atoms share one or more pairs of electrons. Sharing helps the atoms reach more stable electron arrangements.',
    'proton': 'An element’s atomic number equals the number of protons in its nucleus. Changing the proton count changes which element the atom is.',
    'kirchhoff’s current law': 'Kirchhoff’s current law follows conservation of electric charge: the total current entering a junction must equal the total current leaving it.',
    'amylase': 'Salivary amylase begins carbohydrate digestion in the mouth by breaking starch into smaller sugar molecules.',
    'insulin': 'Insulin lowers blood glucose by helping cells take up glucose and by promoting its storage, especially after a meal.',
    'helicase': 'Helicase unwinds the DNA double helix by separating the two strands so each can be copied during DNA replication.',
    'faraday’s law': 'Faraday’s law states that a changing magnetic flux induces an electromotive force. The faster the flux changes, the larger the induced voltage can be.',
    'pharaoh': 'Pharaoh was the title used for the rulers of ancient Egypt, who held both political and religious authority.',
    'silk road': 'The Silk Road was a network of overland and maritime trade routes linking East Asia with Central Asia, the Middle East, and the Mediterranean world.',
    'zeus': 'In Greek mythology, Zeus is king of the Olympian gods and is associated with the sky, thunder, and lightning.',
    'poseidon': 'In Greek mythology, Poseidon is the god of the sea and is commonly shown carrying a trident.',
    'hades': 'In Greek mythology, Hades rules the underworld, the realm of the dead.',
    'queue': 'A queue follows FIFO—First In, First Out. The item added earliest is the first one removed, like people lining up for service.',
    'stack': 'A stack follows LIFO—Last In, First Out. The most recently added item is removed first, like plates stacked on top of one another.',
    'bubble sort': 'Bubble sort repeatedly compares adjacent items and swaps pairs that are out of order. Repeating the passes gradually moves larger values toward the end.',
    'greedy algorithm': 'A greedy algorithm chooses the best-looking local option at each step. This is fast and useful for some problems, but it does not guarantee a global optimum for every problem.',
    'breadth-first search': 'Breadth-first search visits graph nodes level by level, exploring all immediate neighbors before moving deeper. A queue is typically used to manage the frontier.',
    'constantinople': 'Constantinople served as the capital of the Byzantine Empire for most of its history and occupied the strategic city now known as Istanbul.',
    'ming dynasty': 'Much of the Great Wall that survives today was built or rebuilt during the Ming dynasty to strengthen China’s northern defenses.',
    'nabataeans': 'The Nabataeans built Petra, a major ancient trading city carved into rock in what is now Jordan.',
    'treaty of tordesillas': 'The 1494 Treaty of Tordesillas divided newly claimed lands outside Europe between Spain and Portugal along an agreed meridian.',
    'khmer empire': 'Angkor Wat was built by the Khmer Empire in present-day Cambodia, originally as a Hindu temple and later becoming an important Buddhist site.',
    'hard disk drive': 'A hard disk drive stores data on spinning magnetic platters and uses a moving read/write head, so it does contain mechanical moving parts.',
    'central processing unit': 'The CPU is the computer’s main instruction-processing component. It executes program instructions and coordinates much of the work performed by the rest of the system.',
    'cpu': 'The CPU executes program instructions and performs the core calculations that keep programs running.',
    'ram': 'RAM is fast working memory used for data and programs that are currently active. Its contents are normally lost when power is removed.',
    'url': 'A URL is the address used to locate a resource on the web, such as a page, image, or file.',
    'mouse': 'A mouse is a pointing input device: its movement and clicks are translated into cursor movement and actions on the screen.',
    'enter': 'The Enter key commonly confirms input or inserts a new line, depending on the program being used.',
    'cors': 'CORS stands for Cross-Origin Resource Sharing. Browsers use CORS rules and server response headers to decide whether a page from one origin may access resources from another origin.',
    'a function together with access to variables from its lexical scope': 'That is a closure: a function keeps access to variables from the scope where it was created, even after that outer scope has finished executing.',
    'zero-day vulnerability': 'A zero-day is a vulnerability that is unknown to, or not yet patched by, the defender or vendor. Attackers may exploit it before a fix is available.',
    'p-hacking': 'P-hacking means trying many analyses, variables, or stopping rules until a statistically significant result appears. This can create misleading findings by inflating the chance of a false positive.',
    'philippine peso': 'The Philippine peso is the official currency of the Philippines and is commonly written with the symbol ₱.',
    'manila': 'Manila is the capital city of the Philippines and one of the cities that make up Metro Manila.',
    'pacific ocean': 'The Pacific is Earth’s largest ocean basin, covering more area than any other ocean.',
    'mars': 'Mars looks reddish because iron-bearing minerals in its surface material have oxidized, producing rust-like iron oxides.',
    'water': 'Water is H₂O: each molecule contains two hydrogen atoms bonded to one oxygen atom.',
    'oxygen': 'Humans use oxygen in cellular respiration, a process cells use to release usable energy from food.',
    'heart': 'The heart is a muscular pump. Repeated contractions push blood through the lungs and the rest of the circulatory system.',
    'the moon': 'The Moon is gravitationally bound to Earth and orbits it, which makes it Earth’s natural satellite.',
    'the sun': 'The Sun is the star at the center of our solar system. Its gravity keeps the planets, including Earth, in orbit.',
    '0°c': 'At standard atmospheric pressure, 0°C is the freezing point of pure water, where liquid water changes into ice.',
    '100°c': 'At standard atmospheric pressure, pure water boils at about 100°C, when its vapor pressure reaches the surrounding air pressure.',
    'mercury': 'Mercury has the smallest average orbital distance from the Sun, so it is the closest planet to the Sun.',
    'roots': 'Roots absorb water and dissolved minerals from soil. Tiny root hairs greatly increase the surface area available for absorption.',
    'photosynthesis': 'In photosynthesis, plants use light energy to make glucose from carbon dioxide and water, releasing oxygen as a by-product.',
    'nectar': 'Bees collect sugary nectar from flowers and process it in the hive to produce honey.',
    'blue whale': 'The blue whale is the largest known living animal and therefore the largest living mammal.',
    'square': 'A square has four equal sides and four right angles. Those two properties together distinguish it from other quadrilaterals.',
    'piano': 'A piano has a keyboard made of repeating groups of white and black keys, each controlling a different pitch.',
    'leonardo da vinci': 'Leonardo da Vinci painted the Mona Lisa during the Renaissance; the portrait is now housed in the Louvre Museum.',
    'basketball': 'Basketball is played by shooting a ball through an elevated hoop while teams defend their own basket.',
    'badminton': 'Badminton uses rackets to hit a shuttlecock across a net rather than using a ball.',
    'mitochondrion': 'Mitochondria carry out major stages of cellular respiration and generate much of a cell’s ATP, which is why they are often called the cell’s powerhouses.',
    'carbon dioxide': 'Carbon dioxide contains one carbon atom and two oxygen atoms. Plants use it as a raw material in photosynthesis.',
    'condensation': 'Condensation occurs when a gas loses enough energy to become a liquid, such as water vapor forming droplets on a cool surface.',
    'ampere': 'The ampere, or amp, is the SI unit of electric current—the rate at which electric charge flows.',
    'diamond': 'Diamond is a crystalline form of carbon in which each carbon atom is strongly bonded in a rigid three-dimensional network.',
    'igneous rock': 'Igneous rock forms when molten rock—magma or lava—cools and solidifies.',
    'arteries': 'Arteries carry blood away from the heart. Most carry oxygen-rich blood, with the pulmonary arteries being a major exception.',
    'simile': 'A simile makes an explicit comparison, commonly using words such as “like” or “as.”',
    'sargasso sea': 'The Sargasso Sea is unusual because it has no land coastline; its boundaries are formed by major North Atlantic ocean currents.',
    'invariant': 'An invariant is a property that remains unchanged while allowed operations are performed. In puzzles and proofs, invariants can show which states are possible or impossible to reach.',
    'at least one box contains at least two objects': 'This follows from the pigeonhole principle: when there are more objects than boxes, at least one box must receive more than one object.',
    'price': 'Price elasticity of demand compares the percentage change in quantity demanded with the percentage change in price, showing how strongly buyers respond to a price change.',
    'opportunity cost': 'Comparative advantage depends on opportunity cost: the producer that gives up less of other goods to make something has the comparative advantage.',
    'money available today has a time value and can earn a return': 'A future payment is discounted because money available today can be invested or used now. Therefore the same nominal amount received later is worth less in present-value terms.',
    'zone of peace, freedom and neutrality': 'ZOPFAN stands for Zone of Peace, Freedom and Neutrality, an ASEAN declaration aimed at reducing great-power interference and promoting regional autonomy.',
    'bildingsroman': 'A Bildungsroman is a coming-of-age novel that follows a character’s psychological, moral, or social development toward adulthood.',
    'bildungsroman': 'A Bildungsroman is a coming-of-age novel that follows a character’s psychological, moral, or social development toward adulthood.',
    'caesura': 'A caesura is a noticeable pause within a line of poetry, often signaled by punctuation or a natural break in speech.',
    'unreliable narrator': 'An unreliable narrator gives an account the reader has reason not to fully trust, because of bias, limited knowledge, deception, or instability.',
    'arnold schoenberg': 'Arnold Schoenberg developed the twelve-tone method, which organizes all twelve chromatic pitches into a tone row before they are repeated.',
    'sfumato': 'Sfumato is Leonardo da Vinci’s technique of blending tones and edges so softly that transitions appear smoky rather than sharply outlined.',
    'igor stravinsky': 'Igor Stravinsky composed The Rite of Spring, whose 1913 premiere became famous for its radical rhythms, harmony, and choreography.',
    'the entire body': 'In épée fencing, the entire body is a valid target area. This differs from foil and sabre, which restrict valid target zones.',
    'a pawn move or a capture': 'The chess fifty-move rule can allow a draw claim after fifty moves by each player without a pawn move or capture, because those moves reset the count.',
    'pangngalan': 'Ang pangngalan ay salitang ginagamit sa ngalan ng tao, hayop, bagay, lugar, pangyayari, o ideya.',
    'pandiwa': 'Ang pandiwa ay salitang nagsasaad ng kilos, galaw, o kalagayan.',
    'pang-uri': 'Ang pang-uri ay naglalarawan o nagbibigay-turing sa pangngalan o panghalip.',
    'pang-abay': 'Ang pang-abay ay karaniwang naglalarawan sa pandiwa, pang-uri, o kapwa pang-abay at maaaring magsabi ng paraan, panahon, o lugar.',
    'panghalip': 'Ang panghalip ay humahalili sa pangngalan upang maiwasan ang paulit-ulit na pagbanggit nito.',
    'tandang pananong': 'Ang tandang pananong (?) ay ginagamit sa hulihan ng tuwirang tanong.',
    'pagtutulad': 'Ang pagtutulad ay paghahambing na gumagamit ng mga salitang gaya ng “parang,” “tulad,” “gaya,” o “tila.”',
    'pagwawangis': 'Ang pagwawangis ay tuwirang paghahambing na hindi gumagamit ng “parang” o “tulad.”',
    'paghihimig': 'Ang paghihimig o onomatopeya ay gumagamit ng salitang ginagaya ang tunay na tunog, gaya ng “tik-tak” o “kalabog.”',
    'pagpapalit-saklaw': 'Ang pagpapalit-saklaw o synecdoche ay gumagamit ng bahagi upang kumatawan sa kabuuan, o kabuuan upang kumatawan sa bahagi.',
    'anapora': 'Sa kohesyon, anapora ang pagtukoy ng panghalip o ibang salita pabalik sa nauna nang nabanggit na pangngalan o ideya.',
    'pasukdol': 'Ang pasukdol ang pinakamataas na antas ng pang-uri, tulad ng “pinakamaganda” o “napakaganda.”',
    'asimilasyon': 'Ang asimilasyon ay pagbabagong ponolohikal kung saan ang isang tunog ay nagiging mas katulad ng katabing tunog para mas madaling bigkasin.',
    'asimilasyong ganap': 'Sa asimilasyong ganap, ang tunog ng panlapi ay ganap na umaayon sa kasunod na tunog, gaya ng pang + bansa → pambansa.',
    'klaster': 'Ang klaster ay magkasunod na katinig sa loob ng isang pantig, gaya ng “pr” sa “prutas.”',
    'pokus sa tagaganap': 'Pokus sa tagaganap kapag ang simuno ang gumagawa ng kilos, gaya ng “Nagluto si Maria.”',
    'pokus sa layon': 'Pokus sa layon kapag ang layon o bagay na ginawan ng kilos ang binibigyang-diin, gaya ng “Niluto ni Maria ang hapunan.”',
    'panao': 'Ang panghalip panao ay tumutukoy sa taong nagsasalita, kinakausap, o pinag-uusapan, gaya ng ako, ikaw, at siya.'
  });

  function learningFactFor(q, answer) {
    const text = String(q?.q || '').toLowerCase();
    const key = String(answer || '').trim().toLowerCase();

    if (text.includes('no moving mechanical parts') && key === 'ssd') return LEARNING_FACTS.ssd;
    if (text.includes('salt') && text.includes('hash') && text.includes('password')) {
      return 'A password salt is random data added before hashing. Two users with the same password then get different stored hashes, which makes precomputed rainbow-table attacks much less useful.';
    }
    if (text.includes('forward secrecy')) {
      return 'Forward secrecy uses temporary session keys so that stealing a server’s long-term key later does not automatically reveal the contents of old encrypted sessions.';
    }
    if (text.includes('layout recalculation') || text.includes('reflow')) {
      return 'Changing an element’s dimensions can alter the position or size of other elements in the document flow, so the browser may need to recalculate layout. That recalculation is commonly called reflow.';
    }
    if (text.includes('deepfake')) {
      return 'A suspected deepfake is best checked against authenticated originals and independent reliable reporting. Popularity, captions, or screenshots alone do not prove that media is genuine.';
    }
    if (text.includes('provenance')) {
      return 'Provenance is the documented origin and history of a piece of media. Knowing where a file came from and how it was handled helps investigators judge authenticity and detect manipulation.';
    }
    if (text.includes('pigeonhole principle')) {
      return 'The pigeonhole principle says that if more objects are placed into fewer boxes, at least one box must contain more than one object. With 13 objects and 12 boxes, a shared box is unavoidable.';
    }
    if (text.includes('closure') && key.includes('function')) {
      return 'A JavaScript closure exists when a function retains access to variables from its lexical environment. That access can remain even after the outer function has already returned.';
    }
    if (text.includes('cors')) return LEARNING_FACTS.cors;
    if (text.includes('typical spider') && key === '8') {
      return 'Spiders are arachnids, and arachnids normally have four pairs of walking legs. Four pairs means eight legs in total.';
    }
    if (text.includes('standard basketball') && text.includes('on the court') && key === '5') {
      return 'A standard basketball team fields five players on the court at one time. Additional teammates remain on the bench and may substitute during play.';
    }
    if (text.includes('half of 20') && key === '10') {
      return 'Half means divide into two equal parts. Dividing 20 by 2 gives 10, so 10 is half of 20.';
    }
    if (text.includes('right angle') && key === '90°') {
      return 'A right angle is defined as an angle measuring exactly 90 degrees, which is one quarter of a full 360-degree turn.';
    }
    if (text.includes('100 centimeters') && key === '1 meter') {
      return 'The metric system defines 1 meter as 100 centimeters, so 100 cm and 1 m are exactly the same length.';
    }
    if (text.includes('fraction is equal to one half') && key === '2/4') {
      return 'The fraction 2/4 simplifies to 1/2 because dividing both the numerator and denominator by 2 gives 1/2.';
    }
    if (text.includes('roman numeral for 5') && key === 'v') {
      return 'In Roman numerals, the symbol V represents the number 5.';
    }
    if (text.includes('mixing blue and yellow paint') && key === 'green') {
      return 'With traditional paint pigments, blue and yellow combine to produce green because the mixed pigments reflect mainly green wavelengths to our eyes.';
    }
    if (text.includes('continent contains the philippines') && key === 'asia') {
      return 'The Philippines is an archipelago in Southeast Asia, so the continent that contains it is Asia.';
    }
    if (text.includes('direction is opposite east') && key === 'west') {
      return 'On a compass, west lies directly opposite east. If you face north, west is to your left and east is to your right.';
    }
    if (text.includes('first month of the year') && key === 'january') {
      return 'January is the first month of the Gregorian calendar and begins the standard civil year.';
    }
    if (text.includes('hours are in one day') && key === '24') {
      return 'A standard civil day is divided into 24 hours, with each hour containing 60 minutes.';
    }
    if (text.includes('ana is taller than bea') && key === 'ana') return 'Ana is taller than Bea, and Bea is taller than Cara. By transitivity, Ana is taller than both of them, so Ana is tallest.';
    if (text.includes('liza is before ben') && key === 'dana') return 'The order is Liza → Ben → Carlo → Dana, so Dana must be last.';
    if (text.includes('march 3 is a monday') && key === 'monday') return 'March 10 is exactly seven days after March 3. Days of the week repeat every seven days, so it is also Monday.';
    if (text.includes('move 2 steps east then 3 steps north') && key === 'northeast') return 'Moving east and then north leaves you both east and north of the starting point, which is the northeast direction.';
    if (text.includes('three independent switches') && key === '8') return 'Each switch has 2 possible states, ON or OFF. With 3 independent switches, 2 × 2 × 2 = 2³ = 8 possible settings.';
    if (text.includes('black and white socks') && key === '3') return 'With only two colors, the worst case is drawing one black and one white sock first. The third sock must match one of them, guaranteeing a same-color pair.';
    if (text.includes('socks of three colors') && key === '7') return 'With three colors, you could draw two of each color in the first six socks. The seventh sock must make at least one color reach three, by the pigeonhole principle.';
    if (text.includes('100 hours after 3:00') && key === '7:00') return 'A 12-hour clock repeats every 12 hours. 100 mod 12 = 4, so four hours after 3:00 is 7:00.';

    return LEARNING_FACTS[key] || '';
  }

  function declarativeAnswer(q, answer) {
    const question = String(q?.q || '').trim().replace(/[?]+\s*$/, '');
    let m;

    // Arithmetic questions: show the actual operation instead of only repeating the answer.
    m = question.match(/^What is\s+(-?\d+(?:\.\d+)?)\^(\d+)$/i);
    if (m) return `${m[1]}^${m[2]} means multiply ${m[1]} by itself ${m[2]} times, which gives ${answer}.`;

    m = question.match(/^What is\s+(-?\d+(?:\.\d+)?)\s*([+−\-×x÷/])\s*(-?\d+(?:\.\d+)?)$/i);
    if (m) {
      const op = m[2].toLowerCase() === 'x' ? '×' : m[2];
      return `${m[1]} ${op} ${m[3]} = ${answer}.`;
    }

    m = question.match(/^What is (\d+(?:\.\d+)?)% of (\d+(?:\.\d+)?)$/i);
    if (m) {
      const decimal = Number(m[1]) / 100;
      return `${m[1]}% means ${decimal}. Multiplying ${m[2]} by ${decimal} gives ${answer}.`;
    }

    m = question.match(/^A rectangle is (\d+(?:\.\d+)?) units long and (\d+(?:\.\d+)?) units wide\. What is its perimeter$/i);
    if (m) return `A rectangle’s perimeter is 2 × (length + width). Here, 2 × (${m[1]} + ${m[2]}) = ${answer}.`;

    m = question.match(/^Using π ≈ ([0-9.]+), what is the area of a circle with radius ([0-9.]+)$/i);
    if (m) return `The area of a circle is A = πr². Using π ≈ ${m[1]} and r = ${m[2]}, the area is about ${answer} square units.`;

    m = question.match(/^A bag contains (\d+) red and (\d+) blue marbles\. Without replacement, what is the probability that the first two draws are both red$/i);
    if (m) {
      const r = Number(m[1]), b = Number(m[2]), total = r + b;
      return `Without replacement, the first red has probability ${r}/${total}, then ${r - 1}/${total - 1}. Multiplying them gives ${answer}.`;
    }

    m = question.match(/^At simple interest, how much interest is earned on ₱([0-9,]+) at ([0-9.]+)% per year for ([0-9.]+) years$/i);
    if (m) return `Simple interest uses I = Prt. Here P = ₱${m[1]}, r = ${m[2]}%, and t = ${m[3]}, which gives ${answer}.`;

    m = question.match(/^Solve the inequality\s+(-?\d+)x\s*([+\-])\s*(\d+)\s*<\s*(-?\d+)\.$/i);
    if (m) {
      const a=Number(m[1]), b=Number(m[3]), c=Number(m[4]);
      const rhs=m[2]==='+'?c-b:c+b;
      return `Move the constant term first: ${a}x < ${rhs}. Dividing by ${a} gives ${answer}.`;
    }

    m = question.match(/^A regular polygon has an exterior angle of ([0-9.]+)°\. How many sides does it have$/i);
    if (m) return `The exterior angles of a regular polygon total 360°. Dividing 360° by ${m[1]}° gives ${answer} sides.`;

    if (/^Two fair coins are tossed\. What is the probability of getting at least one head$/i.test(question)) {
      return `The only outcome with no heads is TT, which has probability 1/4. Therefore P(at least one head) = 1 - 1/4 = ${answer}.`;
    }

    m = question.match(/^What comes next(?: in the sequence)?:\s*(.+?),\s*\.\.\.$/i);
    if (m) {
      const nums = m[1].split(',').map(v => Number(v.trim()));
      if (nums.length >= 4 && nums.every(Number.isFinite)) {
        const diffs = nums.slice(1).map((v, i) => v - nums[i]);
        const ratios = nums.slice(1).map((v, i) => nums[i] !== 0 ? v / nums[i] : NaN);
        const nearly = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-9;
        if (diffs.every(d => nearly(d, diffs[0]))) return `The pattern adds ${diffs[0]} each time, so the next term is ${answer}.`;
        if (ratios.every(r => nearly(r, ratios[0]))) {
          const r = ratios[0];
          const wording = nearly(r, 2) ? 'doubles' : nearly(r, .5) ? 'halves' : `multiplies by ${r}`;
          return `Each term ${wording}, so the next term is ${answer}.`;
        }
        let fib = true;
        for (let i = 2; i < nums.length; i++) if (!nearly(nums[i], nums[i - 1] + nums[i - 2])) fib = false;
        if (fib) return `Each term is the sum of the previous two, so the next term is ${answer}.`;
        if (diffs.length >= 3) {
          const dd = diffs.slice(1).map((v, i) => v - diffs[i]);
          if (dd.every(d => nearly(d, dd[0]))) return `The gaps are ${diffs.join(', ')} and increase by ${dd[0]} each time. Extending that pattern gives ${answer}.`;
          const dr = diffs.slice(1).map((v, i) => diffs[i] !== 0 ? v / diffs[i] : NaN);
          if (dr.every(r => nearly(r, dr[0]))) return `The differences are ${diffs.join(', ')} and follow a multiplying pattern. The next term is ${answer}.`;
        }
      }
    }

    m = question.match(/^What does (.+?) stand for$/i);
    if (m) return `${m[1]} stands for ${answer}.`;

    m = question.match(/^(.+?) stands for what$/i);
    if (m) return `${m[1]} stands for ${answer}.`;

    m = question.match(/^What does (.+?) do$/i);
    if (m) return `${sentenceCase(m[1])} ${lowerFirst(answer)}.`;

    m = question.match(/^What does (.+?) ((?:primarily |mainly |commonly |usually )?)(identify|provide|control|mean|measure|store|represent|indicate|protect|use|produce|allow|connect|carry|describe)(.*)$/i);
    if (m) {
      const thirdPerson = { identify:'identifies', provide:'provides', control:'controls', mean:'means', measure:'measures', store:'stores', represent:'represents', indicate:'indicates', protect:'protects', use:'uses', produce:'produces', allow:'allows', connect:'connects', carry:'carries', describe:'describes' };
      const adv = m[2] || '';
      const verb = thirdPerson[m[3].toLowerCase()] || m[3];
      return `${sentenceCase(m[1])} ${adv}${verb} ${lowerFirst(answer)}${m[4] || ''}.`;
    }

    m = question.match(/^What (unit|device|organ|process|method|term|word|symbol|force|material|planet|country|city|language|instrument|sport|shape) is (.+)$/i);
    if (m) return `${answer} is the ${m[1].toLowerCase()} ${m[2]}.`;

    m = question.match(/^On what date is (.+)$/i);
    if (m) return `${sentenceCase(m[1])} on ${answer}.`;

    m = question.match(/^If\s+(-?\d+)x\s*([+\-])\s*(\d+)\s*=\s*(-?\d+),\s*what is x$/i);
    if (m) {
      const a = Number(m[1]);
      const op = m[2];
      const b = Number(m[3]);
      const c = Number(m[4]);
      const intermediate = op === '+' ? c - b : c + b;
      const action = op === '+' ? `subtract ${b} from both sides` : `add ${b} to both sides`;
      return `First ${action}, giving ${a}x = ${intermediate}. Then divide by ${a}, so x = ${answer}.`;
    }

    m = question.match(/^(.+?), what does (.+?) ((?:usually |commonly |mainly |primarily |generally )?)(indicate|mean|describe|represent|control|measure)(.*)$/i);
    if (m) {
      const verbs = { indicate:'indicates', mean:'means', describe:'describes', represent:'represents', control:'controls', measure:'measures' };
      return `${sentenceCase(m[1])}, ${m[2]} ${m[3]}${verbs[m[4].toLowerCase()] || m[4]} ${lowerFirst(answer)}${m[5] || ''}.`;
    }

    m = question.match(/^What does (.+?) stand for (.+)$/i);
    if (m) return `${m[1]} stands for ${answer} ${m[2]}.`;

    m = question.match(/^What does (.+?) do (.+)$/i);
    if (m) return `${sentenceCase(m[1])} ${lowerFirst(answer)} ${m[2]}.`;

    m = question.match(/^What is (.+?) called$/i);
    if (m) return `${answer} is the name for ${lowerFirst(m[1])}.`;

    m = question.match(/^What term describes (.+)$/i);
    if (m) return `${answer} is the term used to describe ${lowerFirst(m[1])}.`;

    m = question.match(/^What (?:word|term|concept|process|method|law|principle) (?:means|describes|refers to) (.+)$/i);
    if (m) return `${answer} is the term for ${lowerFirst(m[1])}.`;

    m = question.match(/^Who (was|is|became|served as|led|directed|wrote|composed|painted|invented|discovered|founded|developed|created|designed|proposed|introduced|won|played|portrayed) (.+)$/i);
    if (m) return `${answer} ${m[1].toLowerCase()} ${m[2]}.`;

    m = question.match(/^Which ((?:is|are|was|were|has|have|uses|use|contains|contain|causes|cause|controls|control|separates|separate|connects|connect|measures|measure|stores|store|allows|allow|provides|provide|produces|produce|forms|form|carries|carry|orbits|orbit|lies|lie|flows|flow|feeds|feed|pulls|pull|moves|move|indicates|indicate|divides|divide|removes|remove|completed|completes|complete|painted|paint|wrote|writes|write|includes|include|takes|take|absorbs|absorb|reflects|reflect|releases|release|transports|transport|protects|protect|represents|represent|supports|support|requires|require|governs|govern|won|wins|win|hosts|host|means|mean|describes|describe|refers|refer|became|becomes|become|served|serves|serve|led|leads|lead|created|creates|create|invented|invents|invent|discovered|discovers|discover|developed|develops|develop|directed|directs|direct|composed|composes|compose|involves|involve|determines|determine|states|state|begins|begin|lowers|lower|unwinds|unwind|relates|relate|rules|rule|premiered|premieres|premiere|portrayed|portrays|portray|draws|draw|belongs|belong|airs|air|features|feature|centers|center|classifies|classify|lays|lay|mixes|mix|combines|combine|gives|give|runs|run|crossed|crosses|cross|ruled|rules|rule|fought|fights|fight|ended|ends|end|performed|performs|perform|continued|continues|continue|refers|refer|celebrates|celebrate|associated|associates|associate|uses|use|indicates|indicate|describes|describe|develops|develop|requires|require|consists|consist|covers|cover|determines|determine|revolves|revolve|rotates|rotate|changes|change|converts|convert|binds|bind|regulates|regulate|proclaimed|proclaim|joins|join|works|work|combines|combine|built|build|limits|limit|gives|give|landed|lands|land|passes|pass|acts|act|dissolves|dissolve|describes|describe|distinguishes|distinguish|adjusts|adjust|keeps|keep|shows|show|produced|produce|opposes|oppose|unlocks|unlock)) (.+)$/i);
    if (m) return `${answer} ${m[1].toLowerCase()} ${m[2]}.`;

    m = question.match(/^Which (.+?) ((?:usually |commonly |typically |mainly |primarily |especially |directly )?(?:is|are|was|were|has|have|uses|use|contains|contain|causes|cause|controls|control|separates|separate|connects|connect|measures|measure|stores|store|allows|allow|provides|provide|produces|produce|forms|form|carries|carry|orbits|orbit|lies|lie|flows|flow|feeds|feed|pulls|pull|moves|move|indicates|indicate|divides|divide|removes|remove|completed|completes|complete|painted|paint|wrote|writes|write|includes|include|takes|take|absorbs|absorb|reflects|reflect|releases|release|transports|transport|protects|protect|represents|represent|supports|support|requires|require|governs|govern|won|wins|win|hosts|host|means|mean|describes|describe|refers|refer|became|becomes|become|served|serves|serve|led|leads|lead|created|creates|create|invented|invents|invent|discovered|discovers|discover|developed|develops|develop|directed|directs|direct|composed|composes|compose|involves|involve|determines|determine|states|state|begins|begin|lowers|lower|unwinds|unwind|relates|relate|rules|rule|premiered|premieres|premiere|portrayed|portrays|portray|draws|draw|belongs|belong|airs|air|features|feature|centers|center|classifies|classify|lays|lay|mixes|mix|combines|combine|gives|give|runs|run|crossed|crosses|cross|ruled|rules|rule|fought|fights|fight|ended|ends|end|performed|performs|perform|continued|continues|continue|refers|refer|celebrates|celebrate|associated|associates|associate|uses|use|indicates|indicate|describes|describe|develops|develop|requires|require|consists|consist|covers|cover|determines|determine|revolves|revolve|rotates|rotate|changes|change|converts|convert|binds|bind|regulates|regulate|proclaimed|proclaim|joins|join|works|work|combines|combine|built|build|limits|limit|gives|give|landed|lands|land|passes|pass|acts|act|dissolves|dissolve|describes|describe|distinguishes|distinguish|adjusts|adjust|keeps|keep|shows|show|produced|produce|opposes|oppose|unlocks|unlock)) (.+)$/i);
    if (m) return `${answer} ${m[2].toLowerCase()} ${m[3]}.`;

    m = question.match(/^Which (.+?) ((?:can|cannot|may|must|should|would|will) [a-z]+) (.+)$/i);
    if (m) return `${answer} ${m[2].toLowerCase()} ${m[3]}.`;

    m = question.match(/^Which (.+?) ([A-Za-z]+(?:ed|s|t)) (.+)$/i);
    if (m) return `${answer} ${m[2].toLowerCase()} ${m[3]}.`;

    m = question.match(/^Which of (?:these|the following) (.+)$/i);
    if (m) {
      const tail = m[1];
      if (/^(is|are|was|were|has|have|uses|contains|can|best|most|least)\b/i.test(tail)) return `${answer} ${tail}.`;
      return `${answer} is the choice that ${lowerFirst(tail)}.`;
    }

    m = question.match(/^What is (.+?) commonly called$/i);
    if (m) return `${m[1]} is commonly called ${answer}.`;

    m = question.match(/^What is the (.+)$/i);
    if (m) return `${answer} is the ${m[1]}.`;

    m = question.match(/^What was the (.+)$/i);
    if (m) return `${answer} was the ${m[1]}.`;

    m = question.match(/^What are the (.+)$/i);
    if (m) return `${answer} are the ${m[1]}.`;

    m = question.match(/^What comes next (.+)$/i);
    if (m) return `${answer} comes next ${m[1]}.`;

    m = question.match(/^Where is (.+?) located$/i);
    if (m) return `${m[1]} is located in ${answer}.`;

    m = question.match(/^Where (?:is|are|was|were) (.+)$/i);
    if (m) return `${sentenceCase(m[1])} — ${answer}.`;

    m = question.match(/^(?:In )?what year (.+)$/i) || question.match(/^Which year (.+)$/i);
    if (m) return `${answer} is the year associated with ${lowerFirst(m[1])}.`;

    m = question.match(/^In which year (.+)$/i);
    if (m) return `${sentenceCase(m[1])} happened in ${answer}.`;

    m = question.match(/^How many (.+?) did (.+?) ([A-Za-z]+) (.+)$/i);
    if (m) return `${sentenceCase(m[2])} ${m[3].toLowerCase()} ${answer} ${m[1]} ${m[4]}.`;

    m = question.match(/^How many (.+?) does (.+?) have$/i);
    if (m) return `${sentenceCase(m[2])} has ${answer} ${m[1]}.`;

    m = question.match(/^How many (.+?) are in (.+)$/i);
    if (m) return `There are ${answer} ${m[1]} in ${m[2]}.`;

    m = question.match(/^How many (.+)$/i);
    if (m) return `The quantity asked for is ${answer}: ${lowerFirst(m[1])}.`;

    m = question.match(/^At (.+?), (.+?) at what (.+)$/i);
    if (m) return `At ${m[1]}, ${m[2]} at ${answer}.`;

    m = question.match(/^How long is (.+)$/i);
    if (m) return `${sentenceCase(m[1])} is ${answer}.`;

    m = question.match(/^(.+?), how long is (.+)$/i);
    if (m) return `${sentenceCase(m[2])} is ${answer} ${m[1]}.`;

    m = question.match(/^(.+?) is approximately how (?:fast|long)$/i);
    if (m) return `${sentenceCase(m[1])} is approximately ${answer}.`;

    m = question.match(/^(.+?) (?:has|have|keeps|contains) how many (.+)$/i);
    if (m) return `${sentenceCase(m[1])} has ${answer} ${m[2]}.`;

    m = question.match(/^(.+?), how many (.+)$/i);
    if (m) return `${sentenceCase(m[1])}: ${answer} ${m[2]}.`;

    m = question.match(/^In which (.+?) (.+)$/i);
    if (m) return `${sentenceCase(m[2])} — ${answer} (${m[1]}).`;

    m = question.match(/^At which (.+?) (.+)$/i);
    if (m) return `${sentenceCase(m[2])} — ${answer}.`;

    if (/\bby whom$/i.test(question)) {
      const stem = question.replace(/\bby whom$/i, '').trim();
      return `${sentenceCase(stem)} by ${answer}.`;
    }

    if (/\band whom$/i.test(question)) {
      const stem = question.replace(/\band whom$/i, `and ${answer}`);
      return `${sentenceCase(stem)}.`;
    }

    // Filipino/Tagalog question forms used in the bank.
    m = question.match(/^Ano ang tawag sa (.+)$/i);
    if (m) return `${answer} ang tawag sa ${m[1]}.`;

    m = question.match(/^Ano ang (.+)$/i);
    if (m) return `${answer} ang tamang ${lowerFirst(m[1])}.`;

    m = question.match(/^Alin sa (.+)$/i);
    if (m) return `${answer} ang sagot para sa ${lowerFirst(m[1])}.`;

    if (/called what$|known as what$|referred to as what$/i.test(question)) {
      const stem = question.replace(/(?:called|known as|referred to as) what$/i, '').trim();
      return `${answer} is the standard name for ${lowerFirst(stem)}.`;
    }

    if (/^Why\b/i.test(question)) return `${answer} is the reason described by the question.`;

    m = question.match(/^Who (.+)$/i);
    if (m) return `${answer} ${lowerFirst(m[1])}.`;

    m = question.match(/^What (.+?) (is|was|are|were) (.+)$/i);
    if (m) return `${answer} ${m[2].toLowerCase()} the ${lowerFirst(m[1])} ${m[3]}.`;

    m = question.match(/^What (.+?) ((?:commonly |primarily |mainly |usually |especially )?[a-z]+s) (.+)$/i);
    if (m) return `${answer} is the ${lowerFirst(m[1])} that ${m[2].toLowerCase()} ${m[3]}.`;

    m = question.match(/^What name is given to (.+)$/i);
    if (m) return `${answer} is the name given to ${lowerFirst(m[1])}.`;

    m = question.match(/^What (.+?) is designed to do$/i);
    if (m) return `${sentenceCase(m[1])} is designed to ${lowerFirst(answer)}.`;

    m = question.match(/^(.+?), what is (.+?) called$/i);
    if (m) return `${sentenceCase(m[2])} is called ${answer} ${m[1]}.`;

    m = question.match(/^(.+?) (?:is|are) popularly known by what nickname$/i);
    if (m) return `${sentenceCase(m[1])} is popularly known as ${answer}.`;

    m = question.match(/^What is (.+)$/i);
    if (m) return `${sentenceCase(m[1])} is ${lowerFirst(answer)}.`;

    m = question.match(/^What (.+?) (comes|belongs|means|describes|indicates|represents|measures|controls|uses|requires|contains|causes|produces|forms|carries|allows|provides) (.+)$/i);
    if (m) return `${answer} ${m[2].toLowerCase()} ${m[3]}.`;

    // Some questions place the interrogative phrase in the middle of an otherwise complete sentence.
    m = question.match(/^(.+?), which (.+?) ((?:uses|combines|gives|passes|lies|joins|works|lists|provides|wears|targets|injects|relates|founded|revoked|signed|built|developed|introduced|established|transferred|commemorates|resulted|issued|met|flows|travels|cannot travel)) (.+)$/i);
    if (m) return `${sentenceCase(m[1])}, ${answer} ${m[3].toLowerCase()} ${m[4]}.`;

    m = question.match(/^(.+?) and which (.+?) before (.+)$/i);
    if (m) return `${sentenceCase(m[1])} and ${answer} before ${m[3]}.`;

    m = question.match(/^(.+?) show what (.+?) (.+)$/i);
    if (m) return `${sentenceCase(m[1])} show ${answer} ${m[3]}.`;

    m = question.match(/^(.+?) is approximately how many (.+)$/i);
    if (m) {
      const unit = /[A-Za-z]/.test(String(answer)) ? '' : ` ${m[2]}`;
      return `${sentenceCase(m[1])} is approximately ${answer}${unit}.`;
    }

    m = question.match(/^(.+?) has a present-day temperature of roughly how many (.+)$/i);
    if (m) return `${sentenceCase(m[1])} has a present-day temperature of roughly ${answer}.`;

    m = question.match(/^(.+?) is approximately how many (.+?) for (.+)$/i);
    if (m) return `${sentenceCase(m[1])} is approximately ${answer} for ${m[3]}.`;

    m = question.match(/^(.+?) normally keeps how many (.+)$/i);
    if (m) return `${sentenceCase(m[1])} normally keeps ${answer} ${m[2]}.`;

    m = question.match(/^(.+?) found where$/i);
    if (m) return `${sentenceCase(m[1])} found in ${answer}.`;

    m = question.match(/^(.+?) how many (.+)$/i);
    if (m && !/^(Which|What|How)\b/i.test(m[1])) {
      const unit = /[A-Za-z]/.test(String(answer)) ? '' : ` ${m[2]}`;
      return `${sentenceCase(m[1])} ${answer}${unit}.`;
    }

    m = question.match(/^(.+?) Who is (.+)$/i);
    if (m) return `${answer} is ${lowerFirst(m[2])} in the situation described.`;

    m = question.match(/^(.+?) When does it end$/i);
    if (m) return `${sentenceCase(m[1])} It ends at ${answer}.`;

    m = question.match(/^(.+?) Where must it be$/i);
    if (m) return `${sentenceCase(m[1])} Therefore it must be in ${answer}.`;

    const midReplacements = [
      /\bwhat word\b/i, /\bwhat term\b/i, /\bwhat date\b/i, /\bwhat number\b/i,
      /\bwhich country\b/i, /\bwhich city\b/i, /\bwhich region\b/i, /\bwhich island\b/i,
      /\bwhich element\b/i, /\bwhich planet\b/i, /\bwhich organ\b/i, /\bwhich process\b/i
    ];
    for (const re of midReplacements) {
      if (re.test(question)) {
        const statement = question.replace(re, answer);
        if (!/^(Which|What|Who|Where|When|How)\b/i.test(statement)) return `${sentenceCase(statement)}.`;
      }
    }

    // Many advanced trivia questions are written as statements ending in an interrogative phrase.
    // Replacing that final phrase with the verified answer produces a direct factual explanation.
    const tailPatterns = [
      /\bwhich two powers$/i,
      /\bwhich (?:country|city|continent|ocean|sea|river|island|province|region|empire|kingdom|dynasty|language|group|person|composer|artist|author|scientist|law|treaty|act|year|century|period|element|planet|organ|process|method|principle|theory|unit|instrument|sport|team|term|word)$/i,
      /\bwhat (?:country|city|continent|ocean|sea|river|island|province|region|empire|kingdom|dynasty|language|group|person|composer|artist|author|scientist|law|treaty|act|year|century|period|element|planet|organ|process|method|principle|theory|unit|instrument|sport|team|term|word|number|value|quantity|area)$/i,
      /\bwhat$/i
    ];
    for (const re of tailPatterns) {
      if (re.test(question)) {
        const statement = question.replace(re, answer);
        return `${sentenceCase(statement)}.`;
      }
    }

    const genericTail = /\b(?:which|what)\s+(?:[A-Za-zÀ-ÖØ-öø-ÿ0-9’'–-]+\s*){1,6}$/i;
    if (genericTail.test(question)) {
      const statement = question.replace(genericTail, answer);
      return `${sentenceCase(statement)}.`;
    }

    if (/^(A|An|The)\s+/i.test(answer) && answer.split(/\s+/).length >= 5) return `${answer.replace(/[.!?]+$/, '')}.`;
    return `${answer} is the correct answer.`;
  }

  function categoryContext(q, answer) {
    const category = String(q?.category || '').toLowerCase();
    const question = String(q?.q || '').toLowerCase();

    if (/mathematics|statistics|logic/.test(category)) {
      if (/even/.test(question)) return `${answer} satisfies the definition of an even number because it is divisible by 2 with no remainder.`;
      if (/prime/.test(question)) return `${answer} satisfies the definition of a prime number because it has exactly two positive divisors: 1 and itself.`;
      return 'For math and logic questions, the important step is to apply the definition or rule named in the question rather than choosing by familiarity.';
    }

    if (/technology|programming|cybersecurity|digital/.test(category)) {
      return 'In computing questions, focus on the actual function of the technology—what it stores, processes, protects, or controls—rather than only memorizing its name.';
    }

    if (/science|biology|chemistry|physics|earth|environment|space|animals/.test(category)) {
      return 'The answer follows from the scientific property or process described in the question; remembering that mechanism is more useful than memorizing the option letter.';
    }

    if (/history|civics/.test(category)) {
      return 'For history questions, connect the answer with the event, person, place, or date in the question so the fact has context instead of being an isolated name.';
    }

    if (/geography|asean/.test(category)) {
      return 'For geography, tie the answer to its physical location or regional relationship; that makes nearby places easier to distinguish later.';
    }

    if (/language|literature/.test(category)) {
      return 'The key is the definition or language feature described in the item; use that feature to distinguish the term from similar choices.';
    }

    if (/sports|games/.test(category)) {
      return 'This comes from the standard rule or defining feature of the sport, which is more reliable to remember than the answer letter.';
    }

    if (/economics|financial/.test(category)) {
      return 'The answer follows from the economic relationship described in the question—identify what changes, what is given up, or what is being compared.';
    }

    return 'Remember the fact together with its meaning or context, not just the letter of the correct choice.';
  }

  function buildLearningNote(q) {
    if (!q) return 'Review the idea behind the correct answer before trying a new challenge.';
    if (typeof q.info === 'string' && q.info.trim()) return q.info.trim();
    if (typeof q.explanation === 'string' && q.explanation.trim()) return q.explanation.trim();
    if (q.id && LEARNING_BY_ID[q.id]) return LEARNING_BY_ID[q.id];

    const answer = String(q.options?.[q.answer] ?? '').trim();
    const specific = learningFactFor(q, answer);
    if (specific) return specific;

    const relation = declarativeAnswer(q, answer);
    if (!/ is the correct answer\.$/i.test(relation)) return relation;
    return `${relation} ${categoryContext(q, answer)}`;
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
    runtime.learnNote.textContent = buildLearningNote(q);
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
    runtime.index += 1;
    if (runtime.index === 5 || runtime.index === 10) {
      runtime.statusEl.dataset.kind = 'gold';
      runtime.statusEl.textContent = 'SAFE NODE REACHED · Next difficulty tier unlocked.';
    }
    showQuestion();
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
