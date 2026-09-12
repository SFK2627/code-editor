(() => {
  'use strict';

  const GAME_ID = 'million-byte';
  const GLOBAL_NAME = 'ICT8MillionByte';
  const BANK_URL = 'games/million-byte/million-byte-questions.js?v=20260911-v476-million-byte-1700';
  const BANK_VERSION = 2;
  const QUESTION_COUNT = 15;
  const LETTERS = ['A', 'B', 'C', 'D'];
  const VALUES = ['100','200','300','500','1K','2K','4K','8K','16K','32K','64K','125K','250K','500K','1M'];
  const TIER_NAMES = ['EASY','MODERATE','CHALLENGING','DIFFICULT','EXPERT'];
  const TIER_COUNTS = [0, 460, 460, 244, 244, 292];
  const QUESTION_SECONDS = [35,35,35,40,40,40,45,45,45,50,50,50,55,55,55];
  const LOCAL_STATE_KEY = 'ict8.millionByte.questionCursor.v2';

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
    resultPanel: null,
    failPanel: null,
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
    fiftyBtn: null,
    doubleBtn: null,
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
          <span class="million-byte-bank">1,700 QUESTION POOL · NO REPEATS UNTIL ALL ARE USED</span>
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
                <button type="button" class="million-byte-life" data-mb-fifty><strong>50:50</strong> · Remove 2</button>
                <button type="button" class="million-byte-life" data-mb-double><strong>2X</strong> · Second Chance</button>
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
            <p>Answer 15 general-knowledge questions from Easy to Expert. One wrong answer ends the run unless you activated Second Chance.</p>
            <div class="million-byte-rule-row">
              <div><small>QUESTION POOL</small><strong>1,700</strong></div>
              <div><small>LIFELINES</small><strong>50:50 + 2X</strong></div>
              <div><small>XP</small><strong>Perfect 15/15 = 15 XP</strong></div>
            </div>
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
    runtime.loadingPanel = overlay.querySelector('[data-mb-loading]');
    runtime.failPanel = overlay.querySelector('[data-mb-fail]');
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
    runtime.fiftyBtn = overlay.querySelector('[data-mb-fifty]');
    runtime.doubleBtn = overlay.querySelector('[data-mb-double]');
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
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.fiftyBtn.addEventListener('click', useFifty);
    runtime.doubleBtn.addEventListener('click', useDouble);
    runtime.answerButtons.forEach(btn => btn.addEventListener('click', () => chooseAnswer(Number(btn.dataset.answer))));
    document.addEventListener('keydown', onKeyDown);

    buildLadder();
    runtime.built = true;
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

  function ensureBank() {
    if (window.ICT8_MILLION_BYTE_BANK?.version === BANK_VERSION && window.ICT8_MILLION_BYTE_BANK?.count >= 1700) {
      runtime.bank = window.ICT8_MILLION_BYTE_BANK;
      return Promise.resolve(runtime.bank);
    }
    if (runtime.bankPromise) return runtime.bankPromise;
    runtime.bankPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-million-byte-bank]');
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.src = BANK_URL;
      script.defer = true;
      script.dataset.millionByteBank = 'true';
      script.onload = () => {
        if (window.ICT8_MILLION_BYTE_BANK?.version === BANK_VERSION && window.ICT8_MILLION_BYTE_BANK?.count >= 1700) {
          runtime.bank = window.ICT8_MILLION_BYTE_BANK;
          resolve(runtime.bank);
        } else reject(new Error('Million Byte question bank did not initialize.'));
      };
      script.onerror = () => reject(new Error('Million Byte question bank could not load.'));
      document.body.appendChild(script);
    }).finally(() => { runtime.bankPromise = null; });
    return runtime.bankPromise;
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
    runtime.readyPanel.hidden = true;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.loadingPanel.hidden = false;
    runtime.loadingPanel.querySelector('[data-mb-loading-copy]').textContent = 'Preparing a fresh 15-question ladder…';

    try {
      await ensureBank();
    } catch (error) {
      runtime.state = 'ready';
      runtime.loadingPanel.hidden = true;
      runtime.readyPanel.hidden = false;
      runtime.statusEl.textContent = 'Question bank failed to load. Refresh and try again.';
      return;
    }

    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    runtime.rewardEligible = false;
    runtime.practiceReason = '';
    let ids = [];
    if (runtime.round?.sessionId && runtime.bridge?.prepareMillionByteRound) {
      try {
        const prepared = await runtime.bridge.prepareMillionByteRound(runtime.round.sessionId, BANK_VERSION);
        if (Array.isArray(prepared?.questionIds) && prepared.questionIds.length === QUESTION_COUNT) {
          ids = prepared.questionIds.slice();
          runtime.rewardEligible = prepared.loginRequired !== true && prepared.practiceOnly !== true;
          runtime.practiceReason = prepared.practiceOnly ? 'Question service unavailable — this run is practice only.' : '';
        } else if (prepared?.loginRequired) {
          runtime.practiceReason = 'Practice run — sign in as a student to earn XP.';
        }
      } catch (error) {
        runtime.practiceReason = 'Question sync unavailable — this run is practice only.';
      }
    } else {
      runtime.practiceReason = 'Practice run — sign in as a student to earn XP.';
    }
    if (!ids.length) ids = localQuestionIds();

    const questions = ids.map(id => runtime.bank.byId[id]).filter(Boolean);
    if (questions.length !== QUESTION_COUNT) {
      if (runtime.round?.sessionId) try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
      runtime.round = null;
      runtime.state = 'ready';
      runtime.loadingPanel.hidden = true;
      runtime.readyPanel.hidden = false;
      runtime.statusEl.textContent = 'Could not build the question ladder. Refresh and try again.';
      return;
    }

    runtime.questionIds = ids;
    runtime.questions = questions;
    runtime.answers = [];
    runtime.index = 0;
    runtime.correctCount = 0;
    runtime.fiftyUsed = false;
    runtime.doubleUsed = false;
    runtime.doubleActive = false;
    runtime.doubleWrongThisQuestion = false;
    runtime.rescuedWrong = 0;
    runtime.lifelinesUsed = 0;
    runtime.startedAt = performance.now();
    runtime.rewardSubmitting = false;
    runtime.locked = false;
    runtime.loadingPanel.hidden = true;
    runtime.state = 'question';
    resetLifelines();
    showQuestion();
    tone('start');
  }

  function resetLifelines() {
    runtime.fiftyBtn.classList.remove('used','active');
    runtime.doubleBtn.classList.remove('used','active');
    runtime.fiftyBtn.disabled = false;
    runtime.doubleBtn.disabled = false;
  }

  function tierForIndex(index) { return Math.min(5, Math.floor(index / 3) + 1); }

  function showQuestion() {
    const q = runtime.questions[runtime.index];
    if (!q) return;
    runtime.locked = false;
    runtime.doubleActive = false;
    runtime.doubleWrongThisQuestion = false;
    runtime.answerButtons.forEach((btn, i) => {
      btn.disabled = false;
      btn.className = 'million-byte-answer';
      btn.querySelector('[data-answer-text]').textContent = q.options[i];
      btn.setAttribute('aria-label', `${LETTERS[i]}. ${q.options[i]}`);
    });
    runtime.doubleBtn.classList.remove('active');
    runtime.categoryEl.textContent = q.category || 'GENERAL';
    const tier = tierForIndex(runtime.index);
    runtime.tierEl.textContent = `${TIER_NAMES[tier - 1]} · Q${runtime.index + 1}/15`;
    runtime.valueEl.textContent = `${VALUES[runtime.index]} BYTE`;
    runtime.questionEl.textContent = q.q;
    runtime.statusEl.dataset.kind = '';
    runtime.statusEl.textContent = runtime.practiceReason || 'Lock in one answer. Harder tiers give you more answer time.';
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
    runtime.statusEl.textContent = 'TIME OUT · Run ended.';
    tone('wrong');
    setTimeout(() => finishFailed('TIME OUT'), 900);
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
    runtime.fiftyBtn.classList.add('used');
    runtime.fiftyBtn.disabled = true;
    runtime.statusEl.dataset.kind = 'gold';
    runtime.statusEl.textContent = '50:50 used · Two incorrect options removed.';
    tone('life');
  }

  function useDouble() {
    if (runtime.state !== 'question' || runtime.locked || runtime.doubleUsed) return;
    runtime.doubleUsed = true;
    runtime.doubleActive = true;
    runtime.lifelinesUsed += 1;
    runtime.doubleBtn.classList.add('used','active');
    runtime.doubleBtn.disabled = true;
    runtime.statusEl.dataset.kind = 'gold';
    runtime.statusEl.textContent = 'SECOND CHANCE armed · If the first pick is wrong, choose once more.';
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
      runtime.statusEl.textContent = `Incorrect · Correct answer: ${LETTERS[q.answer]}`;
      setTimeout(() => finishFailed('INCORRECT ANSWER'), 950);
    }, 470);
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
    // 15 XP Million Byte reward. 50:50 is still allowed because every locked
    // answer was correct; Second Chance after a wrong first pick is not perfect.
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
      rescuedWrong: runtime.rescuedWrong,
      activeTimeMs: durationMs,
      durationMs
    };
  }

  async function finishFailed(reason) {
    stopTimer();
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
        gain.gain.exponentialRampToValueAtTime(.055, now + i * .07 + .012);
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
    runtime.resultPanel.hidden = true;
    runtime.statusEl.dataset.kind = '';
    runtime.statusEl.textContent = 'Choose carefully. The questions get harder.';
    runtime.progressBar.style.width = '0%';
    runtime.index = 0;
    updateLadder();
  }

  window[GLOBAL_NAME] = Object.freeze({ open, close: closeInternal, isOpen: () => runtime.open, pauseForExitGuard, resumeFromExitGuard });
})();
