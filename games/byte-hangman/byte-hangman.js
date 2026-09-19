(() => {
  'use strict';

  const GAME_ID = 'byte-hangman';
  const STORAGE_PREFIX = 'ict8.bytehangman.v1';
  const RECENT_LIMIT = 36;
  const REWARD_HISTORY_DAYS = 7;
  const ALPHABET_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  const BANK = () => window.ICT8_BYTE_HANGMAN_BANK || { entries: [], categories: ['Random Mix'] };
  const DIFFICULTIES = Object.freeze({
    easy: Object.freeze({ label: 'EASY', xp: 5, mistakes: 7, rank: 1, multiplier: 1 }),
    medium: Object.freeze({ label: 'MEDIUM', xp: 10, mistakes: 6, rank: 2, multiplier: 1.25 }),
    hard: Object.freeze({ label: 'HARD', xp: 15, mistakes: 6, rank: 3, multiplier: 1.55 }),
    difficult: Object.freeze({ label: 'DIFFICULT', xp: 20, mistakes: 5, rank: 4, multiplier: 1.9 })
  });
  const MODES = Object.freeze({
    classic: { label: 'CLASSIC', sub: 'One puzzle. Restore the Byte Core before stability reaches 0%.' },
    time: { label: 'TIME ATTACK', sub: '90 seconds. Decode as many words as possible.' },
    survival: { label: 'SURVIVAL', sub: 'One shared stability pool. Keep the system alive.' },
    daily: { label: 'DAILY WORD', sub: 'One deterministic daily challenge with controlled XP.' },
    endless: { label: 'ENDLESS', sub: 'Build a long streak. Perfect decodes restore some stability.' }
  });

  const r = {
    built: false,
    open: false,
    overlay: null,
    bridge: null,
    music: null,
    onBack: null,
    onClose: null,
    onReward: null,
    soundEnabled: true,
    audioCtx: null,
    mode: 'classic',
    difficulty: 'medium',
    category: 'Random Mix',
    phase: 'SETUP',
    current: null,
    guessed: new Set(),
    disabled: new Set(),
    mistakes: 0,
    maxMistakes: 6,
    stability: 100,
    score: 0,
    wordScore: 0,
    letterStreak: 0,
    bestLetterStreak: 0,
    wordStreak: 0,
    bestWordStreak: 0,
    hintsUsed: 0,
    wordsSolved: 0,
    wordsAttempted: 0,
    round: null,
    rewardClaimed: false,
    wordXpEligible: false,
    runRewardClaimed: false,
    runStartedAt: 0,
    wordStartedAt: 0,
    runDeadline: 0,
    pausedAt: 0,
    pausedTotalMs: 0,
    raf: 0,
    lastTickPaint: 0,
    recent: [],
    stats: null,
    lastResult: null,
    processingTimer: 0,
    nextTimer: 0,
    feedbackTimer: 0,
    solveOpen: false,
    clueExpanded: false
  };

  const $ = (sel, root = r.overlay) => root?.querySelector?.(sel) || null;
  const $$ = (sel, root = r.overlay) => Array.from(root?.querySelectorAll?.(sel) || []);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
  const now = () => Date.now();
  const cleanText = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const normalizeAnswer = value => cleanText(value).toUpperCase().replace(/[’‘]/g, "'").replace(/\s*[-–—]\s*/g, '-');
  const lettersOnly = value => normalizeAnswer(value).replace(/[^A-Z]/g, '');
  const safeJson = (value, fallback) => { try { return JSON.parse(value); } catch (_) { return fallback; } };
  const dayKey = (stamp = now()) => {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(new Date(stamp)).reduce((m, p) => { if (p.type !== 'literal') m[p.type] = p.value; return m; }, {});
      return `${parts.year}-${parts.month}-${parts.day}`;
    } catch (_) { return new Date(stamp).toISOString().slice(0, 10); }
  };

  function loadLocal(key, fallback) {
    try { return safeJson(localStorage.getItem(`${STORAGE_PREFIX}.${key}`), fallback); } catch (_) { return fallback; }
  }
  function saveLocal(key, value) {
    try { localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(value)); } catch (_) {}
  }
  function defaultStats() {
    return {
      gamesPlayed: 0, wordsSolved: 0, perfectSolves: 0, longestWordStreak: 0, bestLetterStreak: 0,
      highestClassicScore: 0, bestTimeAttackScore: 0, bestSurvivalRun: 0, bestEndlessRun: 0,
      hardWordsSolved: 0, difficultWordsSolved: 0, categoriesSolved: {}, firstDecodeAt: ''
    };
  }
  function normalizeStats(input = {}) {
    const base = defaultStats();
    const source = input && typeof input === 'object' ? input : {};
    Object.keys(base).forEach(k => {
      if (k === 'categoriesSolved') base[k] = source[k] && typeof source[k] === 'object' ? source[k] : {};
      else if (k === 'firstDecodeAt') base[k] = String(source[k] || '');
      else base[k] = Math.max(0, Math.floor(Number(source[k] || 0)));
    });
    return base;
  }
  function loadState() {
    r.stats = normalizeStats(loadLocal('stats', {}));
    const recent = loadLocal('recent', []);
    r.recent = Array.isArray(recent) ? recent.map(String).slice(-RECENT_LIMIT) : [];
  }
  function persistStats() { saveLocal('stats', r.stats); }
  function pushRecent(id) {
    if (!id) return;
    r.recent = r.recent.filter(x => x !== id);
    r.recent.push(id);
    if (r.recent.length > RECENT_LIMIT) r.recent.splice(0, r.recent.length - RECENT_LIMIT);
    saveLocal('recent', r.recent);
  }

  function rewardLedger() {
    const ledger = loadLocal('rewarded', []);
    return Array.isArray(ledger) ? ledger.filter(row => row && row.id && row.day).slice(-160) : [];
  }
  function wasRecentlyRewarded(wordId) {
    const today = dayKey();
    const t = new Date(`${today}T00:00:00+08:00`).getTime();
    return rewardLedger().some(row => {
      if (String(row.id) !== String(wordId)) return false;
      const d = new Date(`${row.day}T00:00:00+08:00`).getTime();
      return Number.isFinite(d) && t - d < REWARD_HISTORY_DAYS * 86400000;
    });
  }
  function dailyAlreadyRewarded() {
    return rewardLedger().some(row => row.mode === 'daily' && row.day === dayKey());
  }
  function rememberRewardAttempt(entry, mode) {
    if (!entry?.id) return;
    const ledger = rewardLedger().filter(row => !(row.id === entry.id && row.day === dayKey()));
    ledger.push({ id: entry.id, day: dayKey(), mode: String(mode || r.mode) });
    saveLocal('rewarded', ledger.slice(-160));
  }

  function difficultyConfig() { return DIFFICULTIES[r.difficulty] || DIFFICULTIES.medium; }
  function xpForDifficulty() { return difficultyConfig().xp; }

  function createCoreMarkup(prefix = 'game') {
    return `<div class="bh-core" data-bh-core="${prefix}" aria-label="Byte Bot System Core">
      <div class="bh-core-grid"></div>
      <div class="bh-circuit c1"></div><div class="bh-circuit c2"></div><div class="bh-circuit c3"></div><div class="bh-circuit c4"></div>
      <div class="bh-ring ring-a"></div><div class="bh-ring ring-b"></div><div class="bh-ring ring-c"></div>
      <div class="bh-reactor"><div class="bh-reactor-glow"></div><div class="bh-bot-face"><i class="eye left"></i><i class="eye right"></i><i class="mouth"></i></div></div>
      <div class="bh-core-spark s1"></div><div class="bh-core-spark s2"></div><div class="bh-core-spark s3"></div>
      <span class="bh-core-tag">BYTE CORE</span>
    </div>`;
  }

  function build() {
    if (r.built) return;
    loadState();
    const overlay = document.createElement('div');
    overlay.className = 'bh-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Byte Hangman');
    overlay.innerHTML = `<section class="bh-shell">
      <header class="bh-topbar">
        <button type="button" class="bh-topbtn" data-bh-back aria-label="Back to Mini-Games">← MINI-GAMES</button>
        <div class="bh-brand"><span>G8CODE SOLO ARCADE</span><strong>BYTE HANGMAN</strong><small>DECODE THE WORD BEFORE THE SYSTEM CRASHES</small></div>
        <div class="bh-top-actions"><button type="button" class="bh-iconbtn" data-bh-sound aria-label="Toggle sound">🔊</button><button type="button" class="bh-iconbtn" data-bh-close aria-label="Close">×</button></div>
      </header>
      <main class="bh-main">
        <section class="bh-panel active" data-bh-panel="setup">
          <div class="bh-setup-wrap">
            <article class="bh-hero-card">
              <div class="bh-hero-copy"><span class="bh-kicker">SYSTEM WORD DEFENSE</span><h1>BYTE HANGMAN</h1><p>Decode the hidden word before the Byte Core loses all stability. No gallows — just a digital system fighting to stay online.</p>
                <div class="bh-hero-badges"><span>SOLO XP</span><span>810-WORD BANK</span><span>PHONE + DESKTOP</span><span>EDUCATIONAL</span></div>
              </div>
              ${createCoreMarkup('setup')}
            </article>
            <div class="bh-setup-grid">
              <section class="bh-config-card"><div class="bh-section-head"><span>01</span><div><strong>CHOOSE MODE</strong><small>Different ways to decode.</small></div></div><div class="bh-mode-grid" data-bh-modes></div></section>
              <section class="bh-config-card"><div class="bh-section-head"><span>02</span><div><strong>DIFFICULTY</strong><small>Higher difficulty = higher eligible XP.</small></div></div><div class="bh-difficulty-grid" data-bh-difficulties></div></section>
              <section class="bh-config-card"><div class="bh-section-head"><span>03</span><div><strong>TOPIC</strong><small>Not coding-only. Mix school, science, culture, sports, web, and more.</small></div></div><label class="bh-select-wrap"><span>CATEGORY</span><select data-bh-category></select></label></section>
              <section class="bh-config-card bh-stats-card"><div class="bh-section-head"><span>04</span><div><strong>YOUR DECODER STATS</strong><small>Stored lightly on this device; permanent XP uses the existing secure G8Code system.</small></div></div><div class="bh-stat-grid" data-bh-setup-stats></div></section>
            </div>
            <section class="bh-how-card"><div><strong>HOW TO PLAY</strong><p>Guess letters → protect System Stability → use hints carefully → decode the word before the core reaches 0%.</p></div><button type="button" class="bh-primary" data-bh-start>START DECODING</button></section>
          </div>
        </section>

        <section class="bh-panel" data-bh-panel="game">
          <div class="bh-game" data-bh-game>
            <div class="bh-hud">
              <div><small>MODE</small><strong data-bh-mode-label>CLASSIC</strong></div>
              <div><small>CATEGORY</small><strong data-bh-category-label>SCIENCE</strong></div>
              <div><small>DIFFICULTY</small><strong data-bh-difficulty-label>MEDIUM</strong></div>
              <div class="xp"><small>ROUND XP</small><strong data-bh-xp>+10 XP</strong></div>
              <div><small>WORD</small><strong data-bh-word-index>1</strong></div>
              <div><small>STREAK</small><strong data-bh-word-streak>×0</strong></div>
            </div>
            <div class="bh-game-layout">
              <aside class="bh-core-panel">
                <div class="bh-core-title"><span>SYSTEM STABILITY</span><strong data-bh-stability>100%</strong></div>
                ${createCoreMarkup('game')}
                <div class="bh-stability-track"><i data-bh-stability-bar></i></div>
                <div class="bh-stability-state" data-bh-stability-state>STABLE</div>
                <div class="bh-error-row"><span>ERRORS</span><strong data-bh-errors>0 / 6</strong></div>
                <div class="bh-run-mini"><div><small>SCORE</small><b data-bh-score>0</b></div><div><small>LETTER STREAK</small><b data-bh-letter-streak>×0</b></div><div><small data-bh-timer-label>TIME</small><b data-bh-time>0:00</b></div></div>
              </aside>
              <section class="bh-puzzle-panel">
                <div class="bh-xp-status eligible" data-bh-xp-status><span></span><strong>XP ELIGIBLE</strong><small>New rotated puzzle</small></div>
                <div class="bh-word-display" data-bh-word aria-live="polite"></div>
                <div class="bh-feedback" data-bh-feedback aria-live="polite"><strong>TAP A LETTER TO BEGIN</strong><span>Protect the core and decode the word.</span></div>
                <div class="bh-clue"><div class="bh-clue-head"><span>HINT / DEFINITION</span><button type="button" data-bh-clue-toggle>DETAILS</button></div><p data-bh-hint></p></div>
                <div class="bh-tools"><button type="button" data-bh-reveal><strong>REVEAL LETTER</strong><small>Score penalty · breaks perfect</small></button><button type="button" data-bh-remove><strong>REMOVE LETTERS</strong><small>Disable 3 wrong keys</small></button><button type="button" data-bh-solve-toggle><strong>SOLVE WORD</strong><small>Risk 2 errors if wrong</small></button><button type="button" data-bh-pause><strong>PAUSE</strong><small>Timed modes only</small></button></div>
                <form class="bh-solve-form" data-bh-solve-form hidden><label><span>FULL ANSWER</span><input data-bh-solve-input maxlength="80" autocomplete="off" spellcheck="false" placeholder="Type the complete word or phrase"></label><button type="submit">DECODE</button><button type="button" class="ghost" data-bh-solve-cancel>CANCEL</button></form>
              </section>
            </div>
            <section class="bh-keyboard-card"><div class="bh-keyboard-head"><span>BYTE KEYBOARD</span><small>Tap or use A–Z on a physical keyboard</small></div><div class="bh-keyboard" data-bh-keyboard></div></section>
          </div>
        </section>

        <section class="bh-panel" data-bh-panel="result">
          <div class="bh-result-wrap"><article class="bh-result-card" data-bh-result-card>
            <div class="bh-result-beam"></div><span class="bh-result-kicker" data-bh-result-kicker>SYSTEM RESTORED</span><h2 data-bh-result-title>PHOTOSYNTHESIS</h2><p class="bh-result-summary" data-bh-result-summary></p>
            <div class="bh-result-grid"><div><small>DIFFICULTY</small><strong data-bh-result-difficulty>HARD</strong></div><div><small>TIME</small><strong data-bh-result-time>31.4 SEC</strong></div><div><small>MISTAKES</small><strong data-bh-result-mistakes>0</strong></div><div><small>HINTS USED</small><strong data-bh-result-hints>0</strong></div><div><small>BEST LETTER STREAK</small><strong data-bh-result-streak>0</strong></div><div><small>SCORE</small><strong data-bh-result-score>0</strong></div><div class="xp"><small>XP</small><strong data-bh-result-xp>+0 XP</strong></div><div><small>WORDS SOLVED</small><strong data-bh-result-words>1</strong></div></div>
            <div class="bh-learn"><span>LEARN SOMETHING</span><p data-bh-result-explanation></p></div><div class="bh-result-note" data-bh-result-note></div>
            <div class="bh-result-actions"><button type="button" class="bh-primary" data-bh-next>NEXT WORD</button><button type="button" data-bh-change>CHANGE MODE</button><button type="button" data-bh-exit>EXIT</button></div>
          </article></div>
        </section>
      </main>
      <div class="bh-pause-layer" data-bh-pause-layer hidden><div class="bh-modal"><span>SYSTEM PAUSED</span><h2>BYTE CORE ON HOLD</h2><p>The timer is paused only because you chose Pause. Resume when ready.</p><button type="button" class="bh-primary" data-bh-resume>RESUME</button><button type="button" data-bh-pause-exit>EXIT RUN</button></div></div>
      <div class="bh-confirm-layer" data-bh-confirm hidden><div class="bh-modal"><span>LEAVE CURRENT RUN?</span><h2>Progress for this active run will be lost.</h2><p>No XP is awarded for unfinished puzzles.</p><button type="button" class="bh-danger" data-bh-confirm-exit>LEAVE RUN</button><button type="button" data-bh-confirm-stay>KEEP PLAYING</button></div></div>
      <div class="bh-toast" data-bh-toast hidden></div>
    </section>`;
    document.body.appendChild(overlay);
    r.overlay = overlay;
    r.built = true;
    wireUi();
    renderSetup();
  }

  function wireUi() {
    $('[data-bh-back]').addEventListener('click', requestBack);
    $('[data-bh-close]').addEventListener('click', requestClose);
    $('[data-bh-sound]').addEventListener('click', toggleSound);
    $('[data-bh-start]').addEventListener('click', startRun);
    $('[data-bh-category]').addEventListener('change', e => { r.category = e.target.value || 'Random Mix'; });
    $('[data-bh-reveal]').addEventListener('click', revealLetterHint);
    $('[data-bh-remove]').addEventListener('click', removeLettersHint);
    $('[data-bh-solve-toggle]').addEventListener('click', () => toggleSolve(true));
    $('[data-bh-solve-cancel]').addEventListener('click', () => toggleSolve(false));
    $('[data-bh-solve-form]').addEventListener('submit', submitSolve);
    $('[data-bh-clue-toggle]').addEventListener('click', toggleClueDetail);
    $('[data-bh-pause]').addEventListener('click', pauseGame);
    $('[data-bh-resume]').addEventListener('click', resumeGame);
    $('[data-bh-pause-exit]').addEventListener('click', () => { $('[data-bh-pause-layer]').hidden = true; exitRunToSetup(); });
    $('[data-bh-confirm-exit]').addEventListener('click', () => { $('[data-bh-confirm]').hidden = true; exitRunToHub(); });
    $('[data-bh-confirm-stay]').addEventListener('click', () => { $('[data-bh-confirm]').hidden = true; });
    $('[data-bh-next]').addEventListener('click', nextFromResult);
    $('[data-bh-change]').addEventListener('click', exitRunToSetup);
    $('[data-bh-exit]').addEventListener('click', exitRunToHub);
    document.addEventListener('keydown', onPhysicalKey);
  }

  function renderSetup() {
    const modes = $('[data-bh-modes]');
    modes.innerHTML = Object.entries(MODES).map(([key, spec]) => `<button type="button" class="bh-mode-btn${r.mode === key ? ' selected' : ''}" data-mode="${key}"><span>${modeGlyph(key)}</span><strong>${spec.label}</strong><small>${spec.sub}</small></button>`).join('');
    $$('[data-mode]', modes).forEach(btn => btn.addEventListener('click', () => { r.mode = btn.dataset.mode; renderSetup(); }));

    const diffs = $('[data-bh-difficulties]');
    diffs.innerHTML = Object.entries(DIFFICULTIES).map(([key, spec]) => `<button type="button" class="bh-diff-btn ${key}${r.difficulty === key ? ' selected' : ''}" data-diff="${key}"><strong>${spec.label}</strong><span>+${spec.xp} XP</span><small>${spec.mistakes} errors max</small></button>`).join('');
    $$('[data-diff]', diffs).forEach(btn => btn.addEventListener('click', () => { r.difficulty = btn.dataset.diff; renderSetup(); }));

    const select = $('[data-bh-category]');
    if (!select.options.length) select.innerHTML = BANK().categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
    if (![...select.options].some(o => o.value === r.category)) r.category = 'Random Mix';
    select.value = r.category;

    renderSetupStats();
    updateSoundButton();
  }
  function modeGlyph(key) { return ({ classic: '◇', time: '⌁', survival: '⬡', daily: '◈', endless: '∞' })[key] || '◇'; }
  function renderSetupStats() {
    const s = r.stats || defaultStats();
    $('[data-bh-setup-stats]').innerHTML = [
      ['WORDS SOLVED', s.wordsSolved], ['PERFECT', s.perfectSolves], ['LONGEST STREAK', s.longestWordStreak], ['BEST LETTER STREAK', s.bestLetterStreak],
      ['TIME ATTACK', s.bestTimeAttackScore], ['SURVIVAL RUN', s.bestSurvivalRun]
    ].map(([label, value]) => `<div><small>${label}</small><strong>${Number(value || 0).toLocaleString()}</strong></div>`).join('');
  }

  function showPanel(name) {
    $$('[data-bh-panel]').forEach(p => p.classList.toggle('active', p.dataset.bhPanel === name));
    r.overlay.dataset.panel = name;
    if (name === 'setup') renderSetup();
  }

  function entryPool() {
    const entries = Array.isArray(BANK().entries) ? BANK().entries : [];
    let pool = entries.filter(e => e && e.difficulty === r.difficulty);
    if (r.category !== 'Random Mix') pool = pool.filter(e => e.category === r.category);
    if (!pool.length && r.category !== 'Random Mix') pool = entries.filter(e => e.category === r.category);
    if (!pool.length) pool = entries.filter(e => e.difficulty === r.difficulty);
    return pool.length ? pool : entries;
  }
  function hashString(value) {
    let h = 2166136261 >>> 0;
    for (const ch of String(value)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function chooseDailyEntry() {
    const pool = entryPool();
    if (!pool.length) return null;
    const seed = hashString(`${dayKey()}|${r.difficulty}|${r.category}`);
    return pool[seed % pool.length];
  }
  function chooseRandomEntry() {
    const pool = entryPool();
    if (!pool.length) return null;
    const recent = new Set(r.recent.slice(-Math.min(RECENT_LIMIT, Math.max(8, Math.floor(pool.length * .35)))));
    const fresh = pool.filter(e => !recent.has(e.id));
    const source = fresh.length ? fresh : pool;
    return source[Math.floor(Math.random() * source.length)] || source[0] || null;
  }

  function startRun() {
    if (!BANK().entries?.length) { toast('Word bank is unavailable. Reload the app and try again.', 'warn'); return; }
    stopTimers();
    r.phase = 'LOADING';
    r.score = 0;
    r.wordScore = 0;
    r.wordsSolved = 0;
    r.wordsAttempted = 0;
    r.wordStreak = 0;
    r.bestWordStreak = 0;
    r.bestLetterStreak = 0;
    r.runRewardClaimed = false;
    r.runStartedAt = now();
    r.runDeadline = r.mode === 'time' ? r.runStartedAt + 90000 : 0;
    r.pausedAt = 0;
    r.pausedTotalMs = 0;
    r.stability = 100;
    r.stats.gamesPlayed += 1;
    persistStats();
    showPanel('game');
    loadNextWord({ first: true });
    startTicker();
  }

  function loadNextWord({ first = false } = {}) {
    clearTimeout(r.nextTimer);
    r.phase = 'LOADING';
    r.solveOpen = false;
    toggleSolve(false);
    const entry = r.mode === 'daily' ? chooseDailyEntry() : chooseRandomEntry();
    if (!entry) { toast('No valid word found for this setup.', 'warn'); exitRunToSetup(); return; }
    r.current = entry;
    pushRecent(entry.id);
    r.guessed = new Set();
    r.disabled = new Set();
    r.mistakes = 0;
    r.maxMistakes = difficultyConfig().mistakes;
    if (r.mode === 'classic' || r.mode === 'time' || r.mode === 'daily') r.stability = 100;
    if (first && (r.mode === 'survival' || r.mode === 'endless')) r.stability = 100;
    r.wordScore = 0;
    r.letterStreak = 0;
    r.hintsUsed = 0;
    r.clueExpanded = false;
    r.rewardClaimed = false;
    r.wordStartedAt = now();
    r.wordsAttempted += 1;
    r.wordXpEligible = computeXpEligibility(entry);
    try { r.round = r.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { r.round = null; }
    r.phase = 'READY';
    renderAll();
    feedback('TAP A LETTER TO BEGIN', 'Protect the core and decode the word.', 'neutral');
    announceFirstTime();
  }

  function computeXpEligibility(entry) {
    if (!entry) return false;
    if (r.mode === 'daily') return !dailyAlreadyRewarded();
    if (wasRecentlyRewarded(entry.id)) return false;
    if (['time', 'survival', 'endless'].includes(r.mode) && r.runRewardClaimed) return false;
    return true;
  }

  function renderAll() {
    renderHud();
    renderCore();
    renderWord();
    renderHint();
    renderKeyboard();
    renderTools();
    renderTimer();
  }
  function renderHud() {
    const d = difficultyConfig();
    $('[data-bh-mode-label]').textContent = MODES[r.mode]?.label || 'CLASSIC';
    $('[data-bh-category-label]').textContent = r.current?.category || r.category;
    $('[data-bh-difficulty-label]').textContent = d.label;
    $('[data-bh-xp]').textContent = r.wordXpEligible ? `+${d.xp} XP` : 'PRACTICE';
    $('[data-bh-word-index]').textContent = String(Math.max(1, r.wordsAttempted));
    $('[data-bh-word-streak]').textContent = `×${r.wordStreak}`;
    $('[data-bh-score]').textContent = Math.floor(r.score).toLocaleString();
    $('[data-bh-letter-streak]').textContent = `×${r.letterStreak}`;
    const xp = $('[data-bh-xp-status]');
    xp.className = `bh-xp-status ${r.wordXpEligible ? 'eligible' : 'practice'}`;
    xp.querySelector('strong').textContent = r.wordXpEligible ? 'XP ELIGIBLE' : 'PRACTICE ROUND';
    xp.querySelector('small').textContent = r.wordXpEligible ? `Successful ${d.label} decode can earn +${d.xp} XP` : (r.mode === 'daily' ? 'Daily XP already claimed today' : 'Recent/repeat puzzle or run reward already used');
  }
  function stabilityStatus(value = r.stability) {
    const v = clamp(value, 0, 100);
    if (v <= 0) return ['SYSTEM FAILURE', 'failure'];
    if (v <= 17) return ['EMERGENCY', 'emergency'];
    if (v <= 33) return ['CRITICAL', 'critical'];
    if (v <= 50) return ['SYSTEM DAMAGE', 'damage'];
    if (v <= 67) return ['WARNING', 'warning'];
    if (v <= 83) return ['MINOR ERROR', 'minor'];
    return ['STABLE', 'stable'];
  }
  function renderCore() {
    const v = Math.round(clamp(r.stability, 0, 100));
    const [label, state] = stabilityStatus(v);
    const game = $('[data-bh-game]');
    game.dataset.coreState = state;
    $('[data-bh-stability]').textContent = `${v}%`;
    $('[data-bh-stability-state]').textContent = label;
    $('[data-bh-stability-bar]').style.width = `${v}%`;
    $('[data-bh-errors]').textContent = `${r.mistakes} / ${r.maxMistakes}`;
    const core = $('[data-bh-core="game"]');
    if (core) core.dataset.state = state;
  }
  function answerChars() { return [...normalizeAnswer(r.current?.word || '')]; }
  function renderWord() {
    const wrap = $('[data-bh-word]');
    const chars = answerChars();
    const totalLetters = chars.filter(ch => /[A-Z]/.test(ch)).length;
    wrap.dataset.length = totalLetters > 20 ? 'long' : totalLetters > 12 ? 'medium' : 'short';
    const groups = [];
    let current = [];
    chars.forEach((ch, idx) => {
      if (ch === ' ') { if (current.length) groups.push(current); current = []; groups.push([{ ch: ' ', idx }]); }
      else current.push({ ch, idx });
    });
    if (current.length) groups.push(current);
    wrap.innerHTML = groups.map(group => {
      if (group.length === 1 && group[0].ch === ' ') return '<span class="bh-word-space" aria-hidden="true"></span>';
      return `<span class="bh-word-group">${group.map(({ ch, idx }) => {
        if (!/[A-Z]/.test(ch)) return `<span class="bh-char punctuation">${escapeHtml(ch)}</span>`;
        const revealed = r.guessed.has(ch) || r.phase === 'ROUND_COMPLETE' || r.phase === 'ROUND_FAILED';
        return `<span class="bh-char ${revealed ? 'revealed' : 'hidden'}" data-letter="${ch}" style="--reveal-index:${idx}"><b>${revealed ? ch : ''}</b></span>`;
      }).join('')}</span>`;
    }).join('');
  }
  function renderHint() {
    $('[data-bh-hint]').textContent = r.current?.hint || 'Use the category and letter pattern to decode the answer.';
    $('[data-bh-clue-toggle]').textContent = r.clueExpanded ? 'HIDE FACT' : 'DETAILS';
    let existing = $('.bh-clue-extra');
    if (r.clueExpanded) {
      if (!existing) { existing = document.createElement('p'); existing.className = 'bh-clue-extra'; $('[data-bh-hint]').after(existing); }
      existing.textContent = r.current?.explanation || '';
    } else existing?.remove();
  }
  function renderKeyboard() {
    const wrap = $('[data-bh-keyboard]');
    wrap.innerHTML = ALPHABET_ROWS.map(row => `<div class="bh-key-row">${[...row].map(letter => {
      const used = r.guessed.has(letter);
      const correct = used && normalizeAnswer(r.current?.word || '').includes(letter);
      const wrong = used && !correct;
      const removed = r.disabled.has(letter);
      const disabled = used || removed || r.phase !== 'READY';
      const cls = correct ? 'correct' : wrong ? 'wrong' : removed ? 'removed' : '';
      return `<button type="button" class="bh-key ${cls}" data-bh-key="${letter}" ${disabled ? 'disabled' : ''} aria-label="Letter ${letter}${correct ? ', correct' : wrong ? ', incorrect' : removed ? ', removed' : ''}">${letter}</button>`;
    }).join('')}</div>`).join('');
    $$('[data-bh-key]', wrap).forEach(btn => btn.addEventListener('pointerdown', e => { e.preventDefault(); processGuess(btn.dataset.bhKey); }, { passive: false }));
  }
  function renderTools() {
    const disabled = r.phase !== 'READY';
    $('[data-bh-reveal]').disabled = disabled || availableUnrevealedLetters().length === 0;
    $('[data-bh-remove]').disabled = disabled || removableLetters().length === 0;
    $('[data-bh-solve-toggle]').disabled = disabled;
    const pause = $('[data-bh-pause]');
    pause.disabled = !['time', 'survival', 'endless'].includes(r.mode) || r.phase !== 'READY';
  }
  function renderTimer() {
    const el = $('[data-bh-time]');
    const label = $('[data-bh-timer-label]');
    if (!el || !label) return;
    if (r.mode === 'time') {
      const remaining = Math.max(0, r.runDeadline - now());
      label.textContent = 'TIME LEFT'; el.textContent = formatClock(remaining);
    } else {
      const elapsed = Math.max(0, now() - r.wordStartedAt);
      label.textContent = 'WORD TIME'; el.textContent = formatClock(elapsed);
    }
  }
  function formatClock(ms) {
    const sec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function processGuess(rawLetter) {
    const letter = String(rawLetter || '').toUpperCase();
    if (!/^[A-Z]$/.test(letter) || r.phase !== 'READY' || r.guessed.has(letter) || r.disabled.has(letter)) return;
    r.phase = 'PROCESSING_GUESS';
    r.guessed.add(letter);
    const answer = normalizeAnswer(r.current?.word || '');
    const occurrences = [...answer].filter(ch => ch === letter).length;
    tapSound();
    if (occurrences > 0) {
      r.letterStreak += 1;
      r.bestLetterStreak = Math.max(r.bestLetterStreak, r.letterStreak);
      const gain = Math.round((100 * occurrences + Math.min(200, r.letterStreak * 18)) * difficultyConfig().multiplier);
      r.score += gain; r.wordScore += gain;
      sfx('correct'); haptic(12);
      feedback(r.letterStreak >= 7 ? 'PERFECT STREAK!' : r.letterStreak >= 5 ? 'GREAT!' : r.letterStreak >= 3 ? 'GOOD!' : 'CORRECT!', `+${gain.toLocaleString()} SCORE · ${occurrences > 1 ? `${occurrences} letters revealed` : 'Letter decoded'}`, 'good');
    } else {
      r.letterStreak = 0;
      applyMistakeUnits(1);
      sfx('wrong'); haptic([26, 30, 26]);
      feedback('WRONG LETTER', `${Math.max(0, r.maxMistakes - r.mistakes)} error${Math.max(0, r.maxMistakes - r.mistakes) === 1 ? '' : 's'} remaining`, 'bad');
    }
    renderAll();
    if (r.stability <= 0) { r.phase = 'ROUND_FAILED'; renderAll(); scheduleRoundFailure(); return; }
    if (isSolved()) { r.phase = 'ROUND_COMPLETE'; renderAll(); scheduleRoundComplete(); return; }
    clearTimeout(r.processingTimer);
    r.processingTimer = setTimeout(() => { if (r.phase === 'PROCESSING_GUESS') { r.phase = 'READY'; renderKeyboard(); renderTools(); } }, 135);
  }

  function applyMistakeUnits(units) {
    const count = Math.max(1, Math.floor(Number(units || 1)));
    r.mistakes = Math.min(r.maxMistakes, r.mistakes + count);
    const damage = 100 / r.maxMistakes * count;
    r.stability = Math.max(0, r.stability - damage);
  }
  function isSolved() {
    const needed = new Set(answerChars().filter(ch => /[A-Z]/.test(ch)));
    return [...needed].every(ch => r.guessed.has(ch));
  }
  function availableUnrevealedLetters() {
    const needed = [...new Set(answerChars().filter(ch => /[A-Z]/.test(ch)))];
    return needed.filter(ch => !r.guessed.has(ch));
  }
  function removableLetters() {
    const answerSet = new Set(answerChars().filter(ch => /[A-Z]/.test(ch)));
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(ch => !answerSet.has(ch) && !r.guessed.has(ch) && !r.disabled.has(ch));
  }

  function revealLetterHint() {
    if (r.phase !== 'READY') return;
    const pool = availableUnrevealedLetters();
    if (!pool.length) return;
    const letter = pool[Math.floor(Math.random() * pool.length)];
    r.hintsUsed += 1;
    r.letterStreak = 0;
    r.guessed.add(letter);
    r.score = Math.max(0, r.score - 160); r.wordScore = Math.max(0, r.wordScore - 160);
    sfx('hint');
    feedback('BYTE HINT USED', `${letter} revealed · score bonus reduced`, 'hint');
    renderAll();
    if (isSolved()) { r.phase = 'ROUND_COMPLETE'; renderAll(); scheduleRoundComplete(); }
  }
  function removeLettersHint() {
    if (r.phase !== 'READY') return;
    const pool = removableLetters().sort(() => Math.random() - .5).slice(0, 3);
    if (!pool.length) return;
    pool.forEach(ch => r.disabled.add(ch));
    r.hintsUsed += 1;
    r.score = Math.max(0, r.score - 100); r.wordScore = Math.max(0, r.wordScore - 100);
    sfx('hint');
    feedback('DECOY KEYS REMOVED', `${pool.join(' · ')} disabled · score bonus reduced`, 'hint');
    renderKeyboard(); renderTools(); renderHud();
  }
  function toggleClueDetail() {
    r.clueExpanded = !r.clueExpanded;
    renderHint();
  }
  function toggleSolve(open) {
    r.solveOpen = Boolean(open);
    const form = $('[data-bh-solve-form]');
    if (!form) return;
    form.hidden = !r.solveOpen;
    if (r.solveOpen) setTimeout(() => $('[data-bh-solve-input]')?.focus(), 0);
    else if ($('[data-bh-solve-input]')) $('[data-bh-solve-input]').value = '';
  }
  function submitSolve(event) {
    event.preventDefault();
    if (r.phase !== 'READY') return;
    const input = $('[data-bh-solve-input]');
    const attempt = normalizeAnswer(input?.value || '');
    if (!attempt) return;
    const targets = [normalizeAnswer(r.current?.word || ''), ...(Array.isArray(r.current?.aliases) ? r.current.aliases.map(normalizeAnswer) : [])];
    toggleSolve(false);
    if (targets.includes(attempt)) {
      const unrevealed = availableUnrevealedLetters();
      unrevealed.forEach(ch => r.guessed.add(ch));
      const bonus = Math.round((450 + Math.max(0, unrevealed.length - 1) * 60) * difficultyConfig().multiplier);
      r.score += bonus; r.wordScore += bonus;
      sfx('solve'); haptic([12, 35, 12]);
      feedback('FULL DECODE!', `+${bonus.toLocaleString()} SCORE · answer accepted`, 'good');
      r.phase = 'ROUND_COMPLETE'; renderAll(); scheduleRoundComplete();
    } else {
      r.letterStreak = 0;
      applyMistakeUnits(2);
      sfx('wrong'); haptic([35, 35, 35]);
      feedback('DECODE FAILED', 'Full-word attempt cost 2 error units.', 'bad');
      renderAll();
      if (r.stability <= 0) { r.phase = 'ROUND_FAILED'; renderAll(); scheduleRoundFailure(); }
    }
  }

  function scheduleRoundComplete() {
    clearTimeout(r.nextTimer);
    r.nextTimer = setTimeout(completeWord, 260);
  }
  async function completeWord() {
    if (!r.current || r.phase !== 'ROUND_COMPLETE') return;
    const perfect = r.mistakes === 0 && r.hintsUsed === 0;
    const elapsed = Math.max(0, now() - r.wordStartedAt);
    const completionBonus = Math.round((500 + r.stability * 3 + (perfect ? 500 : 0) + Math.max(0, 7000 - elapsed) / 20) * difficultyConfig().multiplier);
    r.score += completionBonus; r.wordScore += completionBonus;
    r.wordsSolved += 1;
    r.wordStreak += 1;
    r.bestWordStreak = Math.max(r.bestWordStreak, r.wordStreak);
    if (r.mode === 'survival') r.stability = Math.min(100, r.stability + (perfect ? 10 : 5));
    if (r.mode === 'endless') r.stability = Math.min(100, r.stability + (perfect ? 18 : 9));
    updateStatsAfterSuccess(perfect);
    sfx(perfect ? 'perfect' : 'win');
    if (perfect) haptic([14, 25, 14, 25, 14]);

    const resultInfo = await claimXpIfEligible(perfect, elapsed);
    r.lastResult = { success: true, perfect, elapsed, resultInfo, entry: r.current, mistakes: r.mistakes, hintsUsed: r.hintsUsed, wordScore: r.wordScore };

    if (r.mode === 'time') {
      feedback(perfect ? 'PERFECT DECODE!' : 'SYSTEM RESTORED', `${r.current.displayWord} · loading next word…`, 'good');
      r.nextTimer = setTimeout(() => { if (r.mode === 'time' && Math.max(0, r.runDeadline - now()) > 0) loadNextWord(); else endContinuousRun('time'); }, 520);
      return;
    }
    if (r.mode === 'survival' || r.mode === 'endless') {
      feedback(perfect ? 'PERFECT DECODE!' : 'SYSTEM RESTORED', `${r.current.displayWord} · streak ×${r.wordStreak}`, 'good');
      r.nextTimer = setTimeout(() => loadNextWord(), 620);
      return;
    }
    showRoundResult();
  }

  function scheduleRoundFailure() {
    clearTimeout(r.nextTimer);
    r.nextTimer = setTimeout(failWord, 360);
  }
  function failWord() {
    if (!r.current || r.phase !== 'ROUND_FAILED') return;
    const elapsed = Math.max(0, now() - r.wordStartedAt);
    r.wordStreak = 0;
    updateStatsAfterFailure();
    sfx('failure');
    r.lastResult = { success: false, perfect: false, elapsed, resultInfo: null, entry: r.current, mistakes: r.mistakes, hintsUsed: r.hintsUsed, wordScore: r.wordScore };
    if (r.mode === 'time') {
      feedback('SYSTEM FAILURE', `${r.current.displayWord} · next puzzle incoming…`, 'bad');
      r.nextTimer = setTimeout(() => { if (Math.max(0, r.runDeadline - now()) > 0) loadNextWord(); else endContinuousRun('time'); }, 700);
      return;
    }
    if (r.mode === 'survival' || r.mode === 'endless') { endContinuousRun(r.mode); return; }
    showRoundResult();
  }

  async function claimXpIfEligible(perfect, elapsed) {
    if (!r.wordXpEligible || r.rewardClaimed || !r.round?.sessionId || !r.bridge?.claimRound) return { awardedXp: 0, practiceOnly: true };
    r.rewardClaimed = true;
    if (['time', 'survival', 'endless'].includes(r.mode)) r.runRewardClaimed = true;
    const entry = r.current;
    rememberRewardAttempt(entry, r.mode);
    const metrics = {
      completed: true,
      wordId: entry.id,
      wordHash: hashString(entry.word).toString(36),
      mode: r.mode,
      difficulty: r.difficulty,
      difficultyRank: difficultyConfig().rank,
      mistakes: r.mistakes,
      hintsUsed: r.hintsUsed,
      perfect,
      stabilityRemaining: Math.round(r.stability),
      bestLetterStreak: r.bestLetterStreak,
      wordLength: lettersOnly(entry.word).length,
      activeTimeMs: Math.max(0, elapsed),
      xpEligible: true
    };
    try {
      const result = await r.bridge.claimRound(r.round.sessionId, { score: Math.max(1, Math.floor(r.wordScore)), metrics });
      try { r.onReward?.(result); } catch (_) {}
      return result || { awardedXp: 0 };
    } catch (error) {
      console.warn('Byte Hangman reward could not be processed.', error);
      return { awardedXp: 0, syncFailed: true, error: String(error?.message || 'Reward sync unavailable') };
    }
  }

  function updateStatsAfterSuccess(perfect) {
    const s = r.stats;
    s.wordsSolved += 1;
    if (perfect) s.perfectSolves += 1;
    s.longestWordStreak = Math.max(s.longestWordStreak, r.wordStreak);
    s.bestLetterStreak = Math.max(s.bestLetterStreak, r.bestLetterStreak);
    if (r.difficulty === 'hard') s.hardWordsSolved += 1;
    if (r.difficulty === 'difficult') s.difficultWordsSolved += 1;
    if (!s.firstDecodeAt) s.firstDecodeAt = new Date().toISOString();
    s.categoriesSolved[r.current.category] = Math.max(0, Number(s.categoriesSolved[r.current.category] || 0)) + 1;
    if (r.mode === 'classic') s.highestClassicScore = Math.max(s.highestClassicScore, Math.floor(r.score));
    if (r.mode === 'time') s.bestTimeAttackScore = Math.max(s.bestTimeAttackScore, Math.floor(r.score));
    if (r.mode === 'survival') s.bestSurvivalRun = Math.max(s.bestSurvivalRun, r.wordsSolved);
    if (r.mode === 'endless') s.bestEndlessRun = Math.max(s.bestEndlessRun, r.wordsSolved);
    persistStats();
  }
  function updateStatsAfterFailure() {
    if (r.mode === 'time') r.stats.bestTimeAttackScore = Math.max(r.stats.bestTimeAttackScore, Math.floor(r.score));
    if (r.mode === 'survival') r.stats.bestSurvivalRun = Math.max(r.stats.bestSurvivalRun, r.wordsSolved);
    if (r.mode === 'endless') r.stats.bestEndlessRun = Math.max(r.stats.bestEndlessRun, r.wordsSolved);
    persistStats();
  }

  function showRoundResult() {
    stopTickerOnly();
    const result = r.lastResult;
    if (!result) return;
    showPanel('result');
    const awarded = Math.max(0, Number(result.resultInfo?.awardedXp || 0));
    const entry = result.entry;
    $('[data-bh-result-card]').classList.toggle('failed', !result.success);
    $('[data-bh-result-kicker]').textContent = result.success ? (result.perfect ? 'PERFECT DECODE!' : 'SYSTEM RESTORED') : 'SYSTEM FAILURE';
    $('[data-bh-result-title]').textContent = entry?.displayWord || entry?.word || 'UNKNOWN';
    $('[data-bh-result-summary]').textContent = result.success
      ? (result.perfect ? 'No system errors. Clean decode confirmed.' : 'The Byte Core is stable and the word is restored.')
      : 'The core shut down before the word was decoded. Study the answer and try another puzzle.';
    $('[data-bh-result-difficulty]').textContent = difficultyConfig().label;
    $('[data-bh-result-time]').textContent = `${(result.elapsed / 1000).toFixed(1)} SEC`;
    $('[data-bh-result-mistakes]').textContent = String(result.mistakes);
    $('[data-bh-result-hints]').textContent = String(result.hintsUsed);
    $('[data-bh-result-streak]').textContent = String(r.bestLetterStreak);
    $('[data-bh-result-score]').textContent = Math.floor(r.score).toLocaleString();
    $('[data-bh-result-xp]').textContent = result.success ? `+${awarded} XP` : '+0 XP';
    $('[data-bh-result-words]').textContent = String(r.wordsSolved);
    $('[data-bh-result-explanation]').textContent = entry?.explanation || entry?.hint || '';
    const note = $('[data-bh-result-note]');
    if (!result.success) { note.className = 'bh-result-note warn'; note.textContent = 'No completion XP is awarded for a failed puzzle.'; }
    else if (result.resultInfo?.loginRequired) { note.className = 'bh-result-note warn'; note.textContent = 'Practice mode — sign in as a student to earn permanent XP.'; }
    else if (result.resultInfo?.syncFailed) { note.className = 'bh-result-note warn'; note.textContent = 'Reward saved for secure sync. XP will update automatically once confirmed.'; }
    else if (result.resultInfo?.replayNoXp) { note.className = 'bh-result-note practice'; note.textContent = 'Practice round — this word was recently rewarded on your account, so permanent XP is locked for this repeat.'; }
    else if (!r.wordXpEligible || result.resultInfo?.practiceOnly) { note.className = 'bh-result-note practice'; note.textContent = 'Practice round — this puzzle was recently rewarded or the run already used its XP reward.'; }
    else if (result.resultInfo?.capReached && awarded === 0) { note.className = 'bh-result-note warn'; note.textContent = 'Daily Mini-Game XP cap reached. You can keep decoding for score and records.'; }
    else { note.className = 'bh-result-note success'; note.textContent = awarded > 0 ? `Secure reward added: +${awarded} XP.` : 'Puzzle completed. No permanent XP was awarded for this run.'; }
    $('[data-bh-next]').textContent = r.mode === 'daily' ? 'NEW PRACTICE WORD' : 'NEXT WORD';
  }

  function nextFromResult() {
    if (r.mode === 'daily') r.mode = 'classic';
    showPanel('game');
    if (!r.runStartedAt) r.runStartedAt = now();
    loadNextWord();
    startTicker();
  }

  function endContinuousRun(mode) {
    stopTickerOnly();
    updateStatsAfterFailure();
    const entry = r.current || {};
    r.lastResult = r.lastResult || { success: false, perfect: false, elapsed: now() - r.wordStartedAt, resultInfo: null, entry, mistakes: r.mistakes, hintsUsed: r.hintsUsed, wordScore: r.wordScore };
    showPanel('result');
    const result = r.lastResult;
    $('[data-bh-result-card]').classList.toggle('failed', mode !== 'time' && r.stability <= 0);
    $('[data-bh-result-kicker]').textContent = mode === 'time' ? 'TIME ATTACK COMPLETE' : 'RUN COMPLETE';
    $('[data-bh-result-title]').textContent = `${r.wordsSolved} WORD${r.wordsSolved === 1 ? '' : 'S'} DECODED`;
    $('[data-bh-result-summary]').textContent = mode === 'time' ? '90-second decoding run complete.' : `Best run streak: ×${r.bestWordStreak}.`;
    $('[data-bh-result-difficulty]').textContent = difficultyConfig().label;
    $('[data-bh-result-time]').textContent = mode === 'time' ? '90.0 SEC' : `${((now() - r.runStartedAt) / 1000).toFixed(1)} SEC`;
    $('[data-bh-result-mistakes]').textContent = String(r.mistakes);
    $('[data-bh-result-hints]').textContent = String(r.hintsUsed);
    $('[data-bh-result-streak]').textContent = String(r.bestLetterStreak);
    $('[data-bh-result-score]').textContent = Math.floor(r.score).toLocaleString();
    $('[data-bh-result-xp]').textContent = 'RUN SAFE';
    $('[data-bh-result-words]').textContent = String(r.wordsSolved);
    $('[data-bh-result-explanation]').textContent = entry?.explanation || 'Keep building vocabulary and try to beat your run score.';
    const note = $('[data-bh-result-note]'); note.className = 'bh-result-note practice'; note.textContent = 'Continuous modes remain replayable, but permanent XP is intentionally limited to one eligible rotated puzzle per run.';
    $('[data-bh-next]').textContent = 'NEW RUN';
  }

  function startTicker() {
    stopTickerOnly();
    const tick = timestamp => {
      if (!r.open || r.phase === 'PAUSED') { r.raf = requestAnimationFrame(tick); return; }
      if (timestamp - r.lastTickPaint > 100) {
        r.lastTickPaint = timestamp;
        renderTimer();
        if (r.mode === 'time' && r.runDeadline && now() >= r.runDeadline && !['ROUND_COMPLETE','ROUND_FAILED'].includes(r.phase)) {
          r.phase = 'ROUND_FAILED';
          endContinuousRun('time');
          return;
        }
      }
      r.raf = requestAnimationFrame(tick);
    };
    r.raf = requestAnimationFrame(tick);
  }
  function stopTickerOnly() { if (r.raf) cancelAnimationFrame(r.raf); r.raf = 0; }
  function stopTimers() {
    stopTickerOnly();
    clearTimeout(r.processingTimer); clearTimeout(r.nextTimer); clearTimeout(r.feedbackTimer);
    r.processingTimer = r.nextTimer = r.feedbackTimer = 0;
  }

  function pauseGame() {
    if (!['time','survival','endless'].includes(r.mode) || r.phase !== 'READY') return;
    r.phase = 'PAUSED'; r.pausedAt = now();
    $('[data-bh-pause-layer]').hidden = false;
    try { r.music?.pause?.(); } catch (_) {}
  }
  function resumeGame() {
    if (r.phase !== 'PAUSED') return;
    const duration = Math.max(0, now() - r.pausedAt);
    r.pausedTotalMs += duration;
    if (r.mode === 'time' && r.runDeadline) r.runDeadline += duration;
    r.wordStartedAt += duration;
    r.pausedAt = 0; r.phase = 'READY';
    $('[data-bh-pause-layer]').hidden = true;
    try { r.music?.resume?.(); } catch (_) {}
    renderAll();
  }

  function feedback(title, sub, type = 'neutral') {
    const el = $('[data-bh-feedback]');
    if (!el) return;
    el.className = `bh-feedback ${type}`;
    el.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(sub)}</span>`;
  }
  function toast(message, type = 'normal') {
    const el = $('[data-bh-toast]'); if (!el) return;
    el.textContent = message; el.className = `bh-toast ${type}`; el.hidden = false;
    clearTimeout(r.feedbackTimer); r.feedbackTimer = setTimeout(() => { el.hidden = true; }, 2200);
  }
  function announceFirstTime() {
    const seen = loadLocal('onboarded', false);
    if (seen) return;
    saveLocal('onboarded', true);
    toast('Tap a letter to begin. Wrong guesses reduce System Stability.', 'tip');
  }

  function toggleSound() {
    r.soundEnabled = !r.soundEnabled;
    try { r.bridge?.setSoundEnabled?.(r.soundEnabled); } catch (_) {}
    try { r.music?.setEnabled?.(r.soundEnabled); } catch (_) {}
    updateSoundButton();
    if (r.soundEnabled) sfx('tap');
  }
  function updateSoundButton() { const b = $('[data-bh-sound]'); if (b) b.textContent = r.soundEnabled ? '🔊' : '🔇'; }
  function ensureAudio() {
    if (!r.soundEnabled) return null;
    if (!r.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try { r.audioCtx = new Ctx(); } catch (_) { return null; }
    }
    try { if (r.audioCtx.state === 'suspended') r.audioCtx.resume(); } catch (_) {}
    return r.audioCtx;
  }
  function tone(freq, duration = .08, gain = .035, type = 'sine', slide = 0) {
    const ctx = ensureAudio(); if (!ctx) return;
    try {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + duration);
      g.gain.setValueAtTime(.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + .012); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
      osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration + .02);
    } catch (_) {}
  }
  function duck() { try { r.music?.duck?.(.48, 150); } catch (_) {} }
  function tapSound() { if (!r.soundEnabled) return; duck(); tone(520, .035, .016, 'square', 40); }
  function sfx(kind) {
    if (!r.soundEnabled) return; duck();
    if (kind === 'correct') { tone(620,.08,.035,'triangle',180); setTimeout(() => tone(820,.1,.026,'sine',160),55); }
    else if (kind === 'wrong') { tone(180,.15,.045,'sawtooth',-60); }
    else if (kind === 'hint') { tone(430,.07,.025,'triangle',130); setTimeout(() => tone(610,.08,.022,'sine',70),60); }
    else if (kind === 'solve') { tone(520,.08,.035,'triangle',180); setTimeout(() => tone(760,.12,.032,'triangle',180),70); }
    else if (kind === 'perfect') { [523,659,784,1047].forEach((f,i) => setTimeout(() => tone(f,.15,.035,'triangle',90),i*75)); }
    else if (kind === 'win') { [440,554,659].forEach((f,i) => setTimeout(() => tone(f,.14,.03,'triangle',80),i*80)); }
    else if (kind === 'failure') { tone(210,.28,.045,'sawtooth',-120); setTimeout(() => tone(110,.32,.036,'square',-50),150); }
    else tone(500,.05,.02,'sine',40);
  }
  function haptic(pattern) { if (!r.soundEnabled) return; try { navigator.vibrate?.(pattern); } catch (_) {} }

  function onPhysicalKey(event) {
    if (!r.open || r.overlay?.dataset.panel !== 'game' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    const key = String(event.key || '').toUpperCase();
    if (/^[A-Z]$/.test(key)) { event.preventDefault(); processGuess(key); }
  }

  function requestBack() {
    if (r.overlay?.dataset.panel === 'setup' || r.overlay?.dataset.panel === 'result') { exitRunToHub(); return; }
    if (['READY','PROCESSING_GUESS','PAUSED'].includes(r.phase)) { $('[data-bh-confirm]').hidden = false; return; }
    exitRunToHub();
  }
  function requestClose() {
    if (['READY','PROCESSING_GUESS','PAUSED'].includes(r.phase) && r.overlay?.dataset.panel === 'game') { $('[data-bh-confirm]').hidden = false; return; }
    close(true);
  }
  function exitRunToSetup() {
    stopTimers();
    $('[data-bh-pause-layer]').hidden = true; $('[data-bh-confirm]').hidden = true;
    r.phase = 'SETUP'; r.current = null; r.round = null; r.runStartedAt = 0;
    showPanel('setup');
  }
  function exitRunToHub() {
    stopTimers();
    $('[data-bh-pause-layer]').hidden = true; $('[data-bh-confirm]').hidden = true;
    r.phase = 'SETUP'; r.current = null; r.round = null; r.runStartedAt = 0;
    r.overlay.hidden = true; r.open = false;
    try { r.onBack?.(); } catch (_) {}
  }

  function open(options = {}) {
    build();
    r.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    r.music = options.music || null;
    r.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    r.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    r.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    r.soundEnabled = r.bridge?.getSnapshot?.()?.soundEnabled !== false;
    r.open = true; r.overlay.hidden = false;
    r.phase = 'SETUP';
    showPanel('setup');
    updateSoundButton();
  }
  function close(fromTop = false) {
    if (!r.built) return;
    stopTimers();
    r.phase = 'SETUP'; r.open = false; r.overlay.hidden = true;
    $('[data-bh-pause-layer]').hidden = true; $('[data-bh-confirm]').hidden = true;
    try { if (fromTop) r.onClose?.(); else r.onBack?.(); } catch (_) {}
  }
  function isOpen() { return Boolean(r.open && r.overlay && !r.overlay.hidden); }
  function pauseForExitGuard() {
    if (!isOpen()) return false;
    if (r.overlay?.dataset.panel === 'game' && ['READY','PROCESSING_GUESS'].includes(r.phase)) { $('[data-bh-confirm]').hidden = false; return true; }
    return false;
  }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

  window.ICT8ByteHangman = Object.freeze({ open, close, isOpen, pauseForExitGuard });
})();
