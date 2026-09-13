(() => {
  'use strict';

  const GAME_ID = 'code-tiles';
  const GLOBAL_NAME = 'ICT8CodeTiles';
  const WORLD_W = 600;
  const WORLD_H = 1040;
  const BOARD_TOP = 76;
  const BOARD_BOTTOM = 1040;
  const LANE_W = WORLD_W / 4;
  // v485 game-feel tune: taller Piano-Tiles proportions, tighter flow, clearer first note.
  const SHORT_H = 270;
  const SHORT_GAP = 6;
  // Give the player breathing room after a long tile instead of placing the
  // next note almost directly on top of it.
  const HOLD_EXIT_GAP = 120;
  const LONG_H_SMALL = 540;
  const LONG_H_LARGE = 690;
  const FIRST_HEAD_Y = 1010;
  const TOTAL_NOTES = 127;
  const HOLD_COUNT = 9;
  const HOLD_INDICES = Object.freeze([10, 23, 38, 52, 67, 82, 96, 111, 122]);
  const PHASE_ENDS = Object.freeze([25, 51, 76, 102, 127]);
  // The old 330→390 range looked like a slow conveyor in the reference comparison.
  // This starts lively, then ramps smoothly to a high-intensity finish.
  const LEVELS = Object.freeze([
    Object.freeze({ id: 1, name: 'CLASSIC', speedStart: 610, speedEnd: 980, holdScale: 1.00 }),
    Object.freeze({ id: 2, name: 'FLOW',    speedStart: 680, speedEnd: 1080, holdScale: 0.97 }),
    Object.freeze({ id: 3, name: 'RUSH',    speedStart: 760, speedEnd: 1200, holdScale: 0.94 }),
    Object.freeze({ id: 4, name: 'TURBO',   speedStart: 850, speedEnd: 1330, holdScale: 0.91 }),
    Object.freeze({ id: 5, name: 'MASTER',  speedStart: 950, speedEnd: 1480, holdScale: 0.88 })
  ]);
  const LEVEL_COUNT = LEVELS.length;
  const MISS_Y = BOARD_BOTTOM + 12;
  // Long-note fill is intentionally time-based instead of waiting for the
  // entire long tile to travel to the bottom. This keeps one-finger play
  // responsive and much closer to the reference game's quick hold cadence.
  const HOLD_FILL_MS_SMALL = 620;
  const HOLD_FILL_MS_LARGE = 780;
  const HOLD_SPEED_SCALE_MIN = 0.74;
  // A long tile is already a successful note once its head is pressed.
  // Holding to 100% is now optional mastery/bonus, not a survival requirement.
  const HIT_SLOP_Y = 16;
  const FAILURE_ANIM_MS = 680;
  const COUNTDOWN_MS = 1350;
  const MAX_DPR_DESKTOP = 1.4;
  const MAX_DPR_PHONE = 1.15;
  const MELODY = Object.freeze([0,2,4,5,7,9,7,5,4,2,0,2,5,7,9,12,9,7,5,4,2,4,7,11,9,7,4,2,0,4,5,7]);
  const SCALE = Object.freeze([261.63,293.66,329.63,349.23,392,440,493.88,523.25,587.33,659.25,698.46,783.99,880]);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  };

  const runtime = {
    built: false,
    open: false,
    state: 'closed',
    overlay: null,
    shell: null,
    canvas: null,
    ctx: null,
    readyPanel: null,
    pausePanel: null,
    failPanel: null,
    resultPanel: null,
    pauseBtn: null,
    soundBtn: null,
    scoreEl: null,
    progressEl: null,
    checkpointEls: [],
    bestEl: null,
    failTitleEl: null,
    failCopyEl: null,
    failScoreEl: null,
    finalScoreEl: null,
    finalAccuracyEl: null,
    finalHoldsEl: null,
    finalStreakEl: null,
    finalXpEl: null,
    rewardNoteEl: null,
    levelNameEl: null,
    levelButtons: [],
    startBtn: null,
    resultTitleEl: null,
    nextLevelBtn: null,
    replayLevelBtn: null,
    level: 1,
    bridge: null,
    onBack: null,
    onClose: null,
    onReward: null,
    round: null,
    rewardSubmitting: false,
    soundEnabled: true,
    audioContext: null,
    masterGain: null,
    voices: new Map(),
    raf: 0,
    resizeObserver: null,
    resizeTimer: 0,
    view: { cssW: WORLD_W, cssH: WORLD_H, dpr: 1, scaleX: 1, scaleY: 1, rect: null },
    chart: [],
    nextIndex: 0,
    scroll: 0,
    trackLength: 1,
    motionStarted: false,
    startCountdownAt: 0,
    lastFrameNow: 0,
    activeTimeMs: 0,
    pausedAt: 0,
    score: 0,
    maxStreak: 0,
    streak: 0,
    perfect: 0,
    great: 0,
    good: 0,
    misses: 0,
    badTaps: 0,
    holdsCompleted: 0,
    holdBonus: 0,
    activeHolds: new Map(),
    pointerOwners: new Map(),
    keyboardOwners: new Map(),
    effects: [],
    bestScore: 0,
    bestAccuracy: 0,
    lastRewardDay: '',
    lastRewardXp: 0,
    failedReason: '',
    failureFx: null,
    lowPower: false,
    reducedMotion: false,
    testSpeed: 1
  };

  function hashSeed(value) {
    const text = String(value || 'code-tiles');
    let hash = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  function makeRng(seedText) {
    let state = hashSeed(seedText) || 1;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'codeTilesOverlay';
    overlay.className = 'xp-games-game-overlay code-tiles-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Tiles Piano Tiles-style mini-game');
    overlay.innerHTML = `
      <section class="code-tiles-shell">
        <canvas class="code-tiles-canvas" tabindex="0" aria-label="Four-lane Code Tiles board"></canvas>
        <header class="code-tiles-topbar">
          <button class="code-tiles-round-btn" type="button" data-code-tiles-pause aria-label="Pause">Ⅱ</button>
          <div class="code-tiles-progress-track" aria-label="Track progress"><i data-code-tiles-progress></i><span data-code-tiles-cp="1"></span><span data-code-tiles-cp="2"></span><span data-code-tiles-cp="3"></span><span data-code-tiles-cp="4"></span></div>
          <div class="code-tiles-top-actions">
            <button class="code-tiles-round-btn" type="button" data-code-tiles-sound aria-label="Toggle sound">♪</button>
            <button class="code-tiles-round-btn" type="button" data-code-tiles-close aria-label="Close">×</button>
          </div>
        </header>
        <div class="code-tiles-score-float"><strong data-code-tiles-score>0</strong></div>

        <div class="code-tiles-panel" data-code-tiles-ready>
          <div class="code-tiles-card ready-card">
            <p class="code-tiles-kicker">ALL 5 LEVELS OPEN</p>
            <h2>CODE TILES</h2>
            <p class="code-tiles-subtitle">Tap the lowest next black tile. Do not touch the empty lanes.</p>
            <div class="code-tiles-demo" aria-hidden="true"><span></span><span class="black long"></span><span></span><span class="black"></span></div>
            <div class="code-tiles-mode-row"><div><small>SELECTED LEVEL</small><strong data-code-tiles-level-name>1 · CLASSIC</strong></div><div><small>BEST</small><strong data-code-tiles-best>0</strong></div></div>
            <div class="code-tiles-level-picker" role="group" aria-label="Choose Code Tiles level">
              <button type="button" data-code-tiles-level="1"><b>1</b><small>Classic</small></button>
              <button type="button" data-code-tiles-level="2"><b>2</b><small>Flow</small></button>
              <button type="button" data-code-tiles-level="3"><b>3</b><small>Rush</small></button>
              <button type="button" data-code-tiles-level="4"><b>4</b><small>Turbo</small></button>
              <button type="button" data-code-tiles-level="5"><b>5</b><small>Master</small></button>
            </div>
            <div class="code-tiles-how">
              <span><b>TAP</b><small>Tap the next black tile itself before it passes the bottom.</small></span>
              <span><b>HOLD</b><small>Tap long tiles to clear them. Keep holding to fill farther and earn the hold bonus.</small></span>
            </div>
            <div class="code-tiles-keys"><span>D</span><span>F</span><span>J</span><span>K</span></div>
            <button class="code-tiles-primary" type="button" data-code-tiles-play>START LEVEL 1</button>
            <small class="code-tiles-tip">Phone: tap the tiles. Desktop: D / F / J / K. A clean full run can earn up to 3 XP.</small>
          </div>
        </div>

        <div class="code-tiles-panel" data-code-tiles-pause-panel hidden>
          <div class="code-tiles-card compact"><p class="code-tiles-kicker">PAUSED</p><h2>TAKE YOUR TIME</h2><p>The tile stream is frozen.</p><div class="code-tiles-actions"><button class="code-tiles-primary" type="button" data-code-tiles-resume>RESUME</button><button type="button" data-code-tiles-pause-hub>MINI-GAMES</button></div></div>
        </div>

        <div class="code-tiles-panel" data-code-tiles-fail hidden>
          <div class="code-tiles-card compact"><div class="code-tiles-result-icon fail">×</div><p class="code-tiles-kicker danger">RUN ENDED</p><h2 data-code-tiles-fail-title>MISSED TILE</h2><p data-code-tiles-fail-copy>The next black tile was missed.</p><div class="code-tiles-fail-score"><small>SCORE</small><strong data-code-tiles-fail-score>0</strong></div><div class="code-tiles-actions"><button class="code-tiles-primary" type="button" data-code-tiles-retry>RETRY</button><button type="button" data-code-tiles-fail-hub>MINI-GAMES</button></div></div>
        </div>

        <div class="code-tiles-panel" data-code-tiles-result hidden>
          <div class="code-tiles-card compact result-card"><div class="code-tiles-result-icon success">✓</div><p class="code-tiles-kicker success">LEVEL COMPLETE</p><h2 data-code-tiles-result-title>LEVEL 1 CLEAR</h2><div class="code-tiles-result-grid"><div><small>Score</small><strong data-code-tiles-final-score>0</strong></div><div><small>Accuracy</small><strong data-code-tiles-final-accuracy>100%</strong></div><div><small>Long Holds</small><strong data-code-tiles-final-holds>0/9</strong></div><div><small>Best Streak</small><strong data-code-tiles-final-streak>0</strong></div><div class="xp"><small>XP Earned</small><strong data-code-tiles-final-xp>+0</strong></div></div><p class="code-tiles-reward-note" data-code-tiles-reward-note>Securing reward…</p><div class="code-tiles-actions code-tiles-result-actions"><button class="code-tiles-primary" type="button" data-code-tiles-next-level>NEXT LEVEL</button><button type="button" data-code-tiles-replay-level>REPLAY LEVEL</button><button type="button" data-code-tiles-result-hub>MINI-GAMES</button></div></div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-tiles-shell');
    runtime.canvas = overlay.querySelector('.code-tiles-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false, desynchronized: true });
    runtime.readyPanel = overlay.querySelector('[data-code-tiles-ready]');
    runtime.pausePanel = overlay.querySelector('[data-code-tiles-pause-panel]');
    runtime.failPanel = overlay.querySelector('[data-code-tiles-fail]');
    runtime.resultPanel = overlay.querySelector('[data-code-tiles-result]');
    runtime.pauseBtn = overlay.querySelector('[data-code-tiles-pause]');
    runtime.soundBtn = overlay.querySelector('[data-code-tiles-sound]');
    runtime.scoreEl = overlay.querySelector('[data-code-tiles-score]');
    runtime.progressEl = overlay.querySelector('[data-code-tiles-progress]');
    runtime.checkpointEls = Array.from(overlay.querySelectorAll('[data-code-tiles-cp]'));
    runtime.bestEl = overlay.querySelector('[data-code-tiles-best]');
    runtime.failTitleEl = overlay.querySelector('[data-code-tiles-fail-title]');
    runtime.failCopyEl = overlay.querySelector('[data-code-tiles-fail-copy]');
    runtime.failScoreEl = overlay.querySelector('[data-code-tiles-fail-score]');
    runtime.finalScoreEl = overlay.querySelector('[data-code-tiles-final-score]');
    runtime.finalAccuracyEl = overlay.querySelector('[data-code-tiles-final-accuracy]');
    runtime.finalHoldsEl = overlay.querySelector('[data-code-tiles-final-holds]');
    runtime.finalStreakEl = overlay.querySelector('[data-code-tiles-final-streak]');
    runtime.finalXpEl = overlay.querySelector('[data-code-tiles-final-xp]');
    runtime.rewardNoteEl = overlay.querySelector('[data-code-tiles-reward-note]');
    runtime.levelNameEl = overlay.querySelector('[data-code-tiles-level-name]');
    runtime.levelButtons = Array.from(overlay.querySelectorAll('[data-code-tiles-level]'));
    runtime.startBtn = overlay.querySelector('[data-code-tiles-play]');
    runtime.resultTitleEl = overlay.querySelector('[data-code-tiles-result-title]');
    runtime.nextLevelBtn = overlay.querySelector('[data-code-tiles-next-level]');
    runtime.replayLevelBtn = overlay.querySelector('[data-code-tiles-replay-level]');

    runtime.startBtn?.addEventListener('click', startRun);
    overlay.querySelector('[data-code-tiles-retry]')?.addEventListener('click', startRun);
    runtime.replayLevelBtn?.addEventListener('click', startRun);
    runtime.nextLevelBtn?.addEventListener('click', startNextLevel);
    runtime.levelButtons.forEach(button => button.addEventListener('click', () => selectLevel(Number(button.dataset.codeTilesLevel || 1))));
    overlay.querySelector('[data-code-tiles-resume]')?.addEventListener('click', resumeRun);
    overlay.querySelector('[data-code-tiles-pause-hub]')?.addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-tiles-fail-hub]')?.addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-tiles-result-hub]')?.addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-tiles-close]')?.addEventListener('click', closeAll);
    runtime.pauseBtn?.addEventListener('click', togglePause);
    runtime.soundBtn?.addEventListener('click', toggleSound);

    runtime.canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    runtime.canvas.addEventListener('pointerup', onPointerUp, { passive: false });
    runtime.canvas.addEventListener('pointercancel', onPointerUp, { passive: false });
    runtime.canvas.addEventListener('contextmenu', event => event.preventDefault());
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);

    runtime.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(queueResize) : null;
    runtime.resizeObserver?.observe(runtime.shell);
    window.addEventListener('resize', queueResize, { passive: true });
    runtime.reducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    runtime.built = true;
  }

  function isPhone() {
    return Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 720 || window.matchMedia?.('(pointer: coarse)')?.matches;
  }

  function queueResize() {
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = setTimeout(resizeCanvas, 35);
  }

  function resizeCanvas() {
    if (!runtime.canvas || !runtime.shell) return;
    const rect = runtime.shell.getBoundingClientRect();
    const cssW = Math.max(1, rect.width || window.innerWidth || WORLD_W);
    const cssH = Math.max(1, rect.height || window.innerHeight || WORLD_H);
    const dpr = Math.min(window.devicePixelRatio || 1, isPhone() ? MAX_DPR_PHONE : MAX_DPR_DESKTOP);
    runtime.lowPower = isPhone() || dpr <= 1.15;
    runtime.canvas.width = Math.max(1, Math.round(cssW * dpr));
    runtime.canvas.height = Math.max(1, Math.round(cssH * dpr));
    runtime.canvas.style.width = `${cssW}px`;
    runtime.canvas.style.height = `${cssH}px`;
    runtime.view = { cssW, cssH, dpr, scaleX: cssW / WORLD_W, scaleY: cssH / WORLD_H, rect: runtime.canvas.getBoundingClientRect() };
    render(performance.now());
  }

  function canvasPoint(event) {
    // Reuse the rect cached by resizeCanvas so taps do not force a layout read.
    const rect = runtime.view.rect || runtime.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * WORLD_W / Math.max(1, rect.width),
      y: (event.clientY - rect.top) * WORLD_H / Math.max(1, rect.height)
    };
  }

  function levelConfig(level = runtime.level) {
    const id = clamp(Math.floor(Number(level || 1)), 1, LEVEL_COUNT);
    return LEVELS[id - 1] || LEVELS[0];
  }

  function updateLevelUi() {
    const config = levelConfig();
    if (runtime.levelNameEl) runtime.levelNameEl.textContent = `${config.id} · ${config.name}`;
    if (runtime.startBtn) runtime.startBtn.textContent = `START LEVEL ${config.id}`;
    runtime.levelButtons.forEach(button => {
      const selected = Number(button.dataset.codeTilesLevel || 0) === config.id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function selectLevel(level) {
    if (runtime.state !== 'ready') return;
    runtime.level = clamp(Math.floor(Number(level || 1)), 1, LEVEL_COUNT);
    updateLevelUi();
    buildChart(`preview-level-${runtime.level}`);
    runtime.nextIndex = 0;
    runtime.scroll = 0;
    runtime.score = 0;
    updateHud();
    render(performance.now());
  }

  function showLevelSelect() {
    runtime.state = 'ready';
    runtime.resultPanel.hidden = true;
    runtime.failPanel.hidden = true;
    runtime.pausePanel.hidden = true;
    runtime.readyPanel.hidden = false;
    updateLevelUi();
    buildChart(`preview-level-${runtime.level}`);
    runtime.nextIndex = 0;
    runtime.scroll = 0;
    runtime.score = 0;
    updateHud();
    render(performance.now());
  }

  function startNextLevel() {
    if (runtime.rewardSubmitting) return;
    if (runtime.level >= LEVEL_COUNT) {
      showLevelSelect();
      return;
    }
    runtime.level += 1;
    updateLevelUi();
    startRun();
  }

  function buildChart(seed) {
    const rng = makeRng(seed);
    const holds = new Set(HOLD_INDICES);
    const chart = [];
    let cumulative = 0;
    let prevLane = -1;
    for (let i = 0; i < TOTAL_NOTES; i += 1) {
      let lane = Math.floor(rng() * 4);
      // Avoid immediate same-lane stacking such as one normal tile sitting
      // directly on top of the previous one. The next note should visibly move
      // to another lane instead of forming a vertical "double block" column.
      if (lane === prevLane) lane = (lane + 1 + Math.floor(rng() * 3)) % 4;
      prevLane = lane;
      const isHold = holds.has(i);
      const longH = isHold ? (i % 2 ? LONG_H_LARGE : LONG_H_SMALL) : SHORT_H;
      const bonusTicks = isHold ? (longH >= LONG_H_LARGE ? 4 : 3) : 0;
      const note = {
        id: i,
        lane,
        isHold,
        height: longH,
        bonusTicks,
        baseHeadY: FIRST_HEAD_Y - cumulative,
        state: 'pending',
        pointerId: null,
        holdProgress: 0,
        holdAwarded: 0,
        holdStartActiveMs: 0,
        holdDurationMs: 0,
        holdReleasedEarly: false,
        holdVisualProgress: 0,
        freq: SCALE[MELODY[i % MELODY.length] % SCALE.length]
      };
      chart.push(note);
      cumulative += isHold ? longH + HOLD_EXIT_GAP : SHORT_H + SHORT_GAP;
    }
    runtime.chart = chart;
    runtime.trackLength = Math.max(1, cumulative - FIRST_HEAD_Y + 720);
  }

  function tileHeadY(tile) {
    return tile.baseHeadY + runtime.scroll;
  }

  function tileRect(tile) {
    const head = tileHeadY(tile);
    return { left: tile.lane * LANE_W, right: (tile.lane + 1) * LANE_W, top: head - tile.height, bottom: head, head };
  }

  function tileVisible(tile) {
    const r = tileRect(tile);
    return r.bottom >= BOARD_TOP - 8 && r.top <= BOARD_BOTTOM + 8;
  }

  function currentTile() {
    return runtime.chart[runtime.nextIndex] || null;
  }

  function currentPhaseCount() {
    let count = 0;
    for (const end of PHASE_ENDS) if (runtime.nextIndex >= end) count += 1;
    return count;
  }

  function speedNow() {
    const config = levelConfig();
    const p = clamp(runtime.scroll / Math.max(1, runtime.trackLength), 0, 1);
    return lerp(config.speedStart, config.speedEnd, ease(p));
  }

  function startRun() {
    if (!runtime.open || runtime.rewardSubmitting) return;
    if (runtime.round?.sessionId) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    const runSeed = runtime.round?.sessionId || `${Date.now()}-${Math.random()}`;
    buildChart(`${runSeed}-level-${runtime.level}`);
    runtime.nextIndex = 0;
    runtime.scroll = 0;
    runtime.motionStarted = false;
    runtime.activeTimeMs = 0;
    runtime.score = 0;
    runtime.streak = 0;
    runtime.maxStreak = 0;
    runtime.perfect = 0;
    runtime.great = 0;
    runtime.good = 0;
    runtime.misses = 0;
    runtime.badTaps = 0;
    runtime.holdsCompleted = 0;
    runtime.holdBonus = 0;
    runtime.activeHolds.clear();
    runtime.pointerOwners.clear();
    runtime.keyboardOwners.clear();
    runtime.failureFx = null;
    runtime.effects.length = 0;
    runtime.failedReason = '';
    runtime.state = 'countdown';
    runtime.startCountdownAt = performance.now();
    runtime.lastFrameNow = 0;
    runtime.readyPanel.hidden = true;
    runtime.pausePanel.hidden = true;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.scoreEl.textContent = '0';
    runtime.progressEl.style.transform = 'scaleX(0)';
    runtime.checkpointEls.forEach(el => el.classList.remove('reached'));
    ensureAudio();
    playUiTone('start');
    if (!runtime.raf) runtime.raf = requestAnimationFrame(loop);
  }

  function beginPlay() {
    runtime.state = 'playing';
    runtime.lastFrameNow = performance.now();
  }

  function loop(now) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const prev = runtime.lastFrameNow || now;
    const dtMs = clamp(now - prev, 0, 34);
    runtime.lastFrameNow = now;
    if (runtime.state === 'countdown') {
      if (now - runtime.startCountdownAt >= COUNTDOWN_MS) beginPlay();
    } else if (runtime.state === 'playing') {
      update(dtMs, now);
    } else if (runtime.state === 'failing') {
      const fx = runtime.failureFx;
      if (fx && now - fx.born >= FAILURE_ANIM_MS) completeFailureAnimation();
    }
    updateEffects(now);
    render(now);
    if (runtime.open && ['countdown', 'playing', 'paused', 'failing'].includes(runtime.state)) runtime.raf = requestAnimationFrame(loop);
  }

  function update(dtMs, now) {
    const logicalDtMs = dtMs * Math.max(1, Number(runtime.testSpeed || 1));
    if (runtime.motionStarted) {
      runtime.activeTimeMs += logicalDtMs;
      runtime.scroll += speedNow() * logicalDtMs / 1000;
    }

    for (const tile of runtime.activeHolds.values()) {
      // Fill by ACTIVE hold time, not by how far the whole tile has travelled.
      // Pausing does not advance activeTimeMs, so holds also freeze correctly.
      const holdStartMs = Number(tile.holdStartActiveMs ?? runtime.activeTimeMs);
      const holdDurationMs = Math.max(1, Number(tile.holdDurationMs || HOLD_FILL_MS_SMALL));
      tile.holdProgress = clamp((runtime.activeTimeMs - holdStartMs) / holdDurationMs, 0, 1);
      tile.holdVisualProgress = tile.holdProgress;
      const earned = Math.min(tile.bonusTicks, Math.floor(tile.holdProgress * tile.bonusTicks + 0.0001));
      if (earned > tile.holdAwarded) {
        const delta = earned - tile.holdAwarded;
        tile.holdAwarded = earned;
        runtime.holdBonus += delta;
        runtime.score += delta;
        updateHud();
      }
      if (tile.holdProgress >= 1) completeHold(tile, now);
    }

    const next = currentTile();
    if (next && next.state === 'pending') {
      const r = tileRect(next);
      if (runtime.motionStarted && r.head > MISS_Y) {
        runtime.misses += 1;
        failRun('The next black tile passed the bottom.', { kind: 'miss', tileId: next.id });
        return;
      }
    }

    if (runtime.nextIndex >= runtime.chart.length && runtime.activeHolds.size === 0 && runtime.state === 'playing') finishRun();
  }

  function hitCurrent(sourceId, point, laneOnly = null) {
    if (runtime.state !== 'playing') return false;
    const tile = currentTile();
    if (!tile) return false;
    const r = tileRect(tile);
    const lane = laneOnly == null ? Math.floor(clamp(point.x, 0, WORLD_W - .001) / LANE_W) : laneOnly;
    // Small vertical forgiveness keeps fast taps fair without allowing lane-wide blind tapping.
    const withinY = point.y >= r.top - HIT_SLOP_Y && point.y <= r.bottom + HIT_SLOP_Y;
    const inside = lane === tile.lane && (laneOnly != null || withinY);
    const visible = r.bottom > BOARD_TOP + 8 && r.top < BOARD_BOTTOM + 4;
    if (!inside || !visible) {
      runtime.badTaps += 1;
      runtime.streak = 0;
      failRun('Wrong tile. Tap only the next black tile.', {
        kind: 'wrong',
        tileId: tile.id,
        lane,
        point: { x: Number(point.x), y: Number(point.y) }
      });
      return false;
    }

    if (!runtime.motionStarted) runtime.motionStarted = true;
    tile.state = tile.isHold ? 'holding' : 'hit';
    tile.hitAtY = r.head;
    tile.hitAt = performance.now();
    runtime.nextIndex += 1;
    runtime.streak += 1;
    runtime.maxStreak = Math.max(runtime.maxStreak, runtime.streak);
    runtime.perfect += 1;
    runtime.score += 1;
    spawnTapEffect(tile, point);
    playTileTone(tile, tile.isHold);

    if (tile.isHold) {
      tile.pointerId = sourceId;
      tile.holdProgress = 0;
      tile.holdVisualProgress = 0;
      tile.holdReleasedEarly = false;
      tile.holdAwarded = 0;
      tile.holdStartActiveMs = runtime.activeTimeMs;
      const baseHoldMs = tile.height >= LONG_H_LARGE ? HOLD_FILL_MS_LARGE : HOLD_FILL_MS_SMALL;
      // Higher levels shorten the optional hold slightly, but keep it close to
      // the OG cadence instead of making the fill race with the scroll speed.
      tile.holdDurationMs = Math.round(baseHoldMs * levelConfig().holdScale);
      runtime.activeHolds.set(tile.id, tile);
    }
    updateHud();
    return true;
  }

  function completeHold(tile, now = performance.now()) {
    if (!tile || tile.state !== 'holding') return;
    tile.state = 'hit';
    tile.holdProgress = 1;
    tile.holdVisualProgress = 1;
    tile.holdReleasedEarly = false;
    if (tile.holdAwarded < tile.bonusTicks) {
      const delta = tile.bonusTicks - tile.holdAwarded;
      tile.holdAwarded = tile.bonusTicks;
      runtime.holdBonus += delta;
      runtime.score += delta;
    }
    runtime.holdsCompleted += 1;
    runtime.activeHolds.delete(tile.id);
    stopVoice(tile.id, true);
    runtime.pointerOwners.forEach((tileId, pointerId) => { if (tileId === tile.id) runtime.pointerOwners.delete(pointerId); });
    runtime.keyboardOwners.forEach((tileId, key) => { if (tileId === tile.id) runtime.keyboardOwners.delete(key); });
    runtime.effects.push({ type: 'bonus', lane: tile.lane, value: tile.bonusTicks, born: now, ttl: 720 });
    updateHud();
  }

  function releaseOwner(ownerId, isKeyboard = false) {
    const owners = isKeyboard ? runtime.keyboardOwners : runtime.pointerOwners;
    const tileId = owners.get(ownerId);
    owners.delete(ownerId);
    if (tileId == null) return;
    const tile = runtime.chart[tileId];
    if (!tile || tile.state !== 'holding') return;

    // FAIR-HOLD RULE: pressing the long tile already clears the note.
    // Keeping it held only earns the remaining hold bonus / completed-hold stat.
    // Early release therefore never kills the run.
    if (tile.holdProgress >= 1) {
      completeHold(tile, performance.now());
      return;
    }

    // Preserve exactly how far the player actually filled the long tile.
    // The tap already cleared the note, but an early release must NOT visually
    // pretend that the remaining portion was filled.
    tile.holdVisualProgress = clamp(tile.holdProgress, 0, 1);
    tile.holdReleasedEarly = tile.holdVisualProgress < 1;
    tile.state = 'hit';
    runtime.activeHolds.delete(tile.id);
    stopVoice(tile.id, true);
    runtime.effects.push({
      type: 'holdRelease',
      lane: tile.lane,
      value: tile.holdAwarded,
      born: performance.now(),
      ttl: 360
    });
    updateHud();
  }

  function onPointerDown(event) {
    if (!runtime.open || runtime.state !== 'playing') return;
    event.preventDefault();
    const point = canvasPoint(event);
    const tile = currentTile();
    if (!tile) return;
    try { runtime.canvas.setPointerCapture?.(event.pointerId); } catch (_) {}
    if (hitCurrent(`p:${event.pointerId}`, point)) {
      const justHit = runtime.chart[runtime.nextIndex - 1];
      if (justHit?.isHold) runtime.pointerOwners.set(event.pointerId, justHit.id);
    }
  }

  function onPointerUp(event) {
    if (!runtime.open) return;
    event.preventDefault();
    releaseOwner(event.pointerId, false);
    try { runtime.canvas.releasePointerCapture?.(event.pointerId); } catch (_) {}
  }

  function keyLane(key) {
    return ({ d:0, f:1, j:2, k:3 })[String(key || '').toLowerCase()];
  }

  function onKeyDown(event) {
    if (!runtime.open || runtime.state !== 'playing') return;
    if (event.repeat) return;
    const lane = keyLane(event.key);
    if (lane == null) return;
    if (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    event.preventDefault();
    const tile = currentTile();
    if (!tile) return;
    const r = tileRect(tile);
    const point = { x: lane * LANE_W + LANE_W / 2, y: clamp((r.top + r.bottom) / 2, BOARD_TOP + 1, BOARD_BOTTOM - 1) };
    if (hitCurrent(`k:${event.key.toLowerCase()}`, point, lane)) {
      const justHit = runtime.chart[runtime.nextIndex - 1];
      if (justHit?.isHold) runtime.keyboardOwners.set(event.key.toLowerCase(), justHit.id);
    }
  }

  function onKeyUp(event) {
    if (!runtime.open) return;
    const lane = keyLane(event.key);
    if (lane == null) return;
    releaseOwner(event.key.toLowerCase(), true);
  }

  function togglePause() {
    if (!runtime.open) return;
    if (runtime.state === 'playing') {
      if (runtime.activeHolds.size) {
        runtime.effects.push({ type: 'message', text: 'FINISH THE HOLD FIRST', born: performance.now(), ttl: 700 });
        return;
      }
      runtime.state = 'paused';
      runtime.pausePanel.hidden = false;
      runtime.pausedAt = performance.now();
      if (runtime.raf) cancelAnimationFrame(runtime.raf);
      runtime.raf = requestAnimationFrame(loop);
      suspendAudio();
    } else if (runtime.state === 'paused') resumeRun();
  }

  function resumeRun() {
    if (runtime.state !== 'paused') return;
    runtime.state = 'playing';
    runtime.pausePanel.hidden = true;
    runtime.lastFrameNow = performance.now();
    resumeAudio();
    if (!runtime.raf) runtime.raf = requestAnimationFrame(loop);
  }

  function updateHud() {
    if (runtime.scoreEl) runtime.scoreEl.textContent = String(runtime.score);
    const progress = clamp(runtime.nextIndex / TOTAL_NOTES, 0, 1);
    if (runtime.progressEl) runtime.progressEl.style.transform = `scaleX(${progress})`;
    runtime.checkpointEls.forEach((el, i) => el.classList.toggle('reached', progress >= (i + 1) / 5));
  }

  function accuracyPercent() {
    const counted = runtime.perfect + runtime.great + runtime.good;
    if (!counted) return 0;
    const weighted = runtime.perfect * 100 + runtime.great * 85 + runtime.good * 65;
    return clamp(weighted / TOTAL_NOTES, 0, 100);
  }

  async function finishRun() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'result';
    stopAllVoices(true);
    runtime.motionStarted = false;
    const accuracy = accuracyPercent();
    const displayScore = runtime.score;
    runtime.bestScore = Math.max(runtime.bestScore, displayScore);
    runtime.bestAccuracy = Math.max(runtime.bestAccuracy, accuracy);
    runtime.finalScoreEl.textContent = String(displayScore);
    runtime.finalAccuracyEl.textContent = `${accuracy.toFixed(1)}%`;
    runtime.finalHoldsEl.textContent = `${runtime.holdsCompleted}/${HOLD_COUNT}`;
    runtime.finalStreakEl.textContent = String(runtime.maxStreak);
    runtime.finalXpEl.textContent = '+0';
    const clearedLevel = levelConfig();
    if (runtime.resultTitleEl) runtime.resultTitleEl.textContent = `LEVEL ${clearedLevel.id} · ${clearedLevel.name} CLEAR`;
    if (runtime.nextLevelBtn) runtime.nextLevelBtn.textContent = clearedLevel.id < LEVEL_COUNT ? `NEXT LEVEL · ${clearedLevel.id + 1}` : 'LEVEL SELECT';
    if (runtime.replayLevelBtn) runtime.replayLevelBtn.textContent = `REPLAY LEVEL ${clearedLevel.id}`;
    runtime.rewardNoteEl.className = 'code-tiles-reward-note';
    runtime.rewardNoteEl.textContent = runtime.round ? 'Securing reward…' : 'Practice run — log in to earn account XP.';
    runtime.resultPanel.hidden = false;
    playUiTone('win');

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    runtime.rewardSubmitting = true;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: displayScore,
        metrics: {
          completedRun: true,
          phasesCompleted: 5,
          totalNotes: TOTAL_NOTES,
          perfect: runtime.perfect,
          great: runtime.great,
          good: runtime.good,
          misses: runtime.misses,
          badTaps: runtime.badTaps,
          maxCombo: runtime.maxStreak,
          holdsCompleted: runtime.holdsCompleted,
          holdsTotal: HOLD_COUNT,
          accuracy: Math.round(accuracy * 10) / 10,
          syncRemaining: 100,
          activeTimeMs: Math.round(runtime.activeTimeMs),
          level: runtime.level,
          levelName: levelConfig().name
        }
      });
      runtime.round = null;
      const record = result?.gameRecord || result?.gameRecords?.codeTiles || {};
      runtime.lastRewardDay = String(record.lastRewardDay || runtime.lastRewardDay || '');
      runtime.lastRewardXp = Math.max(runtime.lastRewardXp, Number(record.lastRewardXp || 0));
      runtime.bestAccuracy = Math.max(runtime.bestAccuracy, Number(record.bestAccuracy || 0));
      runtime.finalXpEl.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;
      if (result?.loginRequired) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'Practice mode — log in as a student to earn account XP.';
      } else if (result?.syncPending) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'Reward saved for sync. XP will update automatically once confirmed.';
      } else if (result?.replayNoXp) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'Today’s Code Tiles XP tier is already secured. Replay for a better score.';
      } else if (result?.capReached && Number(result?.awardedXp || 0) === 0) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'Daily Mini-Game XP cap reached. Your best run still counts.';
      } else if (Number(result?.awardedXp || 0) > 0) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note success';
        runtime.rewardNoteEl.textContent = `Reward added safely · Today’s Game XP: ${result.todayXp}/${result.dailyCap}`;
      } else {
        runtime.rewardNoteEl.textContent = 'Track complete. Best score saved.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
      runtime.rewardNoteEl.textContent = 'Reward saved for sync. XP will update automatically once confirmed.';
    } finally {
      runtime.rewardSubmitting = false;
    }
  }

  function failRun(copy, detail = {}) {
    if (!['playing', 'countdown'].includes(runtime.state)) return;
    const now = performance.now();
    const kind = detail.kind === 'wrong' ? 'wrong' : 'miss';
    runtime.state = 'failing';
    runtime.motionStarted = false;
    runtime.failedReason = String(copy || 'The run ended.');
    runtime.failureFx = {
      kind,
      tileId: Number.isInteger(detail.tileId) ? detail.tileId : runtime.nextIndex,
      lane: Number.isFinite(detail.lane) ? detail.lane : null,
      point: detail.point ? { x: Number(detail.point.x), y: Number(detail.point.y) } : null,
      born: now
    };

    // Keep the board visible for the impact animation. The result panel is
    // deliberately delayed so the player can SEE what caused the failure.
    runtime.failPanel.hidden = true;
    stopAllVoices(false);
    runtime.activeHolds.clear();
    runtime.pointerOwners.clear();
    runtime.keyboardOwners.clear();

    if (kind === 'wrong' && runtime.failureFx.point) {
      runtime.effects.push({
        type: 'wrongTap',
        lane: runtime.failureFx.lane,
        x: runtime.failureFx.point.x,
        y: runtime.failureFx.point.y,
        born: now,
        ttl: FAILURE_ANIM_MS
      });
    } else {
      const tile = runtime.chart[runtime.failureFx.tileId];
      runtime.effects.push({
        type: 'crash',
        lane: tile?.lane ?? runtime.failureFx.lane ?? 0,
        born: now,
        ttl: FAILURE_ANIM_MS
      });
    }

    playFailureTone(kind);
    if (!runtime.raf) runtime.raf = requestAnimationFrame(loop);
  }

  function completeFailureAnimation() {
    if (runtime.state !== 'failing') return;
    const kind = runtime.failureFx?.kind || 'miss';
    runtime.state = 'failed';
    if (runtime.round?.sessionId) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.round = null;
    if (runtime.failTitleEl) runtime.failTitleEl.textContent = kind === 'wrong' ? 'WRONG TAP' : 'MISSED TILE';
    runtime.failCopyEl.textContent = runtime.failedReason;
    runtime.failScoreEl.textContent = String(runtime.score);
    runtime.failPanel.hidden = false;
  }

  function spawnTapEffect(tile, point) {
    runtime.effects.push({ type: 'tap', lane: tile.lane, y: Number(point?.y || tileHeadY(tile) - 28), born: performance.now(), ttl: runtime.lowPower ? 180 : 260 });
    if (runtime.effects.length > 18) runtime.effects.splice(0, runtime.effects.length - 18);
  }

  function updateEffects(now) {
    runtime.effects = runtime.effects.filter(effect => now - effect.born < effect.ttl);
  }

  function render(now) {
    const ctx = runtime.ctx;
    if (!ctx || !runtime.canvas) return;
    const { dpr, scaleX, scaleY } = runtime.view;
    ctx.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0);
    drawBackground(ctx);
    drawTiles(ctx, now);
    drawEffects(ctx, now);
    if (runtime.state === 'countdown') drawCountdown(ctx, now);
    if (runtime.state === 'playing' && !runtime.motionStarted) drawStartHint(ctx);
  }

  function drawBackground(ctx) {
    const grad = ctx.createLinearGradient(0, BOARD_TOP, 0, WORLD_H);
    grad.addColorStop(0, '#a8ddf4');
    grad.addColorStop(.45, '#9bd7ef');
    grad.addColorStop(1, '#7fb8f4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    if (!runtime.lowPower) {
      const glow = ctx.createRadialGradient(300, 510, 40, 300, 510, 560);
      glow.addColorStop(0, 'rgba(255,255,255,.24)');
      glow.addColorStop(1, 'rgba(115,93,255,.08)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    }
    for (let lane = 0; lane < 4; lane += 1) {
      ctx.fillStyle = lane % 2 ? 'rgba(255,255,255,.035)' : 'rgba(80,120,255,.035)';
      ctx.fillRect(lane * LANE_W, BOARD_TOP, LANE_W, BOARD_BOTTOM - BOARD_TOP);
      if (lane) {
        ctx.fillStyle = 'rgba(255,255,255,.40)';
        ctx.fillRect(lane * LANE_W - .7, BOARD_TOP, 1.4, BOARD_BOTTOM - BOARD_TOP);
      }
    }
  }

  function drawTiles(ctx, now) {
    const start = Math.max(0, runtime.nextIndex - 10);
    const end = Math.min(runtime.chart.length, runtime.nextIndex + 18);
    for (let i = start; i < end; i += 1) {
      const tile = runtime.chart[i];
      if (!tileVisible(tile)) continue;
      drawTile(ctx, tile, now);
    }
  }

  function drawTile(ctx, tile, now) {
    const r = tileRect(tile);
    const x = tile.lane * LANE_W + 1;
    const w = LANE_W - 2;
    const h = tile.height;
    const isDone = tile.state === 'hit';
    const holding = tile.state === 'holding';
    const isCurrent = tile.state === 'pending' && tile.id === runtime.nextIndex;
    const alpha = r.top > BOARD_BOTTOM ? 0 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;

    const failFx = runtime.failureFx;
    const isCrashTile = runtime.state === 'failing' && failFx?.kind === 'miss' && failFx.tileId === tile.id;
    if (isCrashTile) {
      const ft = clamp((now - failFx.born) / FAILURE_ANIM_MS, 0, 1);
      // Quick downward impact + small recoil gives a physical "hit the floor" feel.
      const impactY = ft < .28 ? 18 * ease(ft / .28) : 18 * (1 - ease((ft - .28) / .72));
      const shakeX = Math.sin(ft * Math.PI * 10) * (1 - ft) * 5;
      ctx.translate(shakeX, impactY);
    }

    const partialReleasedHold = isDone && tile.isHold && tile.holdReleasedEarly;
    if (isDone && !partialReleasedHold) {
      const blue = ctx.createLinearGradient(0, r.top, 0, r.bottom);
      blue.addColorStop(0, '#0c79d5');
      blue.addColorStop(.58, '#25a8ef');
      blue.addColorStop(1, '#59c6ff');
      ctx.fillStyle = blue;
      ctx.fillRect(x, r.top, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      ctx.fillRect(x + 4, r.top + 2, w - 8, 2);
    } else {
      ctx.fillStyle = '#050505';
      ctx.fillRect(x, r.top, w, h);
      if (!runtime.lowPower) {
        ctx.fillStyle = 'rgba(255,255,255,.025)';
        ctx.fillRect(x + 4, r.top + 4, w - 8, Math.min(12, h * .08));
      }
      // A very small leading-edge cue makes the required lowest tile obvious
      // without adding arrows or changing the classic four-lane look.
      if (isCurrent) {
        const pulse = .28 + .12 * Math.sin(now * .012);
        ctx.fillStyle = `rgba(88,220,255,${pulse})`;
        ctx.fillRect(x + 4, r.bottom - 4, w - 8, 4);
      }
    }

    // If a long tile was released early, keep only the amount that was actually
    // filled blue. The untouched remainder stays black as visual proof of how
    // far the player really held it.
    if (partialReleasedHold) {
      const p = clamp(tile.holdVisualProgress, 0, 1);
      if (p > 0) {
        const fillH = h * p;
        const fillY = r.bottom - fillH;
        const partialFill = ctx.createLinearGradient(0, fillY, 0, r.bottom);
        partialFill.addColorStop(0, '#0a7fd9');
        partialFill.addColorStop(.62, '#18a9ef');
        partialFill.addColorStop(1, '#5bd6ff');
        ctx.fillStyle = partialFill;
        ctx.fillRect(x, fillY, w, fillH);
        ctx.fillStyle = 'rgba(255,255,255,.10)';
        ctx.fillRect(x + 4, fillY + 2, w - 8, 2);
      }
    }

    // Instant contact flash: visual response happens on the same pointerdown frame.
    if (isDone && tile.hitAt) {
      const hitAge = now - tile.hitAt;
      if (hitAge >= 0 && hitAge < 120) {
        const flash = (1 - hitAge / 120) * .30;
        ctx.fillStyle = `rgba(255,255,255,${flash})`;
        ctx.fillRect(x, r.top, w, h);
      }
    }

    if (isCrashTile) {
      const ft = clamp((now - failFx.born) / FAILURE_ANIM_MS, 0, 1);
      ctx.fillStyle = `rgba(239,35,60,${0.88 - 0.18 * ft})`;
      ctx.fillRect(x, r.top, w, h);
      ctx.strokeStyle = `rgba(255,235,235,${0.95 - .45 * ft})`;
      ctx.lineWidth = 5;
      ctx.strokeRect(x + 2.5, r.top + 2.5, w - 5, h - 5);
    }

    if (holding) {
      const p = clamp(tile.holdProgress, 0, 1);
      const fillH = Math.max(8, h * p);
      const fillY = r.bottom - fillH;
      const fill = ctx.createLinearGradient(0, fillY, 0, r.bottom);
      fill.addColorStop(0, '#0a7fd9');
      fill.addColorStop(.62, '#18a9ef');
      fill.addColorStop(1, '#5bd6ff');
      ctx.fillStyle = fill;
      ctx.fillRect(x, fillY, w, fillH);
      const ringY = clamp(fillY, r.top + 14, r.bottom - 14);
      ctx.strokeStyle = '#21e6ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w / 2, ringY, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(33,230,255,.16)';
      ctx.beginPath();
      ctx.arc(x + w / 2, ringY, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawEffects(ctx, now) {
    for (const fx of runtime.effects) {
      const t = clamp((now - fx.born) / fx.ttl, 0, 1);
      if (fx.type === 'tap') {
        const x = fx.lane * LANE_W + LANE_W / 2;
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = '#35e6ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, fx.y, 10 + 28 * t, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (fx.type === 'wrongTap') {
        const lane = Number.isFinite(fx.lane) ? fx.lane : Math.floor(clamp(fx.x || 0, 0, WORLD_W - .001) / LANE_W);
        const laneX = lane * LANE_W;
        const pulse = 1 - t;
        const redH = SHORT_H;
        const boxY = clamp(fx.y - redH * 0.56, BOARD_TOP, BOARD_BOTTOM - redH);
        ctx.save();
        ctx.globalAlpha = Math.max(.12, pulse);
        ctx.fillStyle = `rgba(239,35,60,${.22 + .46 * pulse})`;
        ctx.fillRect(laneX + 2, boxY, LANE_W - 4, redH);
        ctx.strokeStyle = `rgba(255,235,235,${.92 - .38 * t})`;
        ctx.lineWidth = 4;
        ctx.strokeRect(laneX + 4, boxY + 4, LANE_W - 8, redH - 8);
        ctx.strokeStyle = '#ff304f';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, 18 + 48 * t, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,45,70,${.30 * pulse})`;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, 34 + 38 * t, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (fx.type === 'crash') {
        const x = fx.lane * LANE_W + LANE_W / 2;
        const pulse = 1 - t;
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#ff304f';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x - 62 - 24 * t, BOARD_BOTTOM - 5);
        ctx.lineTo(x + 62 + 24 * t, BOARD_BOTTOM - 5);
        ctx.stroke();
        for (let i = 0; i < 6; i += 1) {
          const a = (-Math.PI * .85) + i * (Math.PI * .7 / 5);
          const d = 18 + 58 * t;
          ctx.beginPath();
          ctx.moveTo(x, BOARD_BOTTOM - 6);
          ctx.lineTo(x + Math.cos(a) * d, BOARD_BOTTOM - 6 + Math.sin(a) * d);
          ctx.stroke();
        }
        ctx.restore();
      } else if (fx.type === 'holdRelease') {
        if (fx.value > 0) {
          ctx.save();
          ctx.globalAlpha = 1 - t;
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 18px system-ui';
          ctx.fillText(`+${fx.value} HOLD`, fx.lane * LANE_W + LANE_W / 2, 760 - 30 * t);
          ctx.restore();
        }
      } else if (fx.type === 'bonus') {
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0284c7';
        ctx.font = '900 28px system-ui';
        ctx.fillText(`+${fx.value}`, fx.lane * LANE_W + LANE_W / 2, 680 - 60 * t);
        ctx.restore();
      } else if (fx.type === 'message') {
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px system-ui';
        ctx.fillText(fx.text, WORLD_W / 2, 560);
        ctx.restore();
      }
    }
  }

  function drawCountdown(ctx, now) {
    const elapsed = now - runtime.startCountdownAt;
    const value = elapsed < 340 ? '3' : elapsed < 680 ? '2' : elapsed < 1020 ? '1' : 'GO';
    ctx.save();
    ctx.fillStyle = 'rgba(15,40,82,.18)';
    ctx.fillRect(0, BOARD_TOP, WORLD_W, BOARD_BOTTOM - BOARD_TOP);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '1000 88px system-ui';
    ctx.fillText(value, WORLD_W / 2, 520);
    ctx.restore();
  }

  function drawStartHint(ctx) {
    const tile = currentTile();
    if (!tile) return;
    const r = tileRect(tile);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(10,54,96,.84)';
    ctx.font = '850 18px system-ui';
    ctx.fillText('TAP THE FIRST BLACK TILE', WORLD_W / 2, Math.min(720, r.top - 24));
    ctx.restore();
  }

  function ensureAudio() {
    if (runtime.audioContext) {
      resumeAudio();
      return runtime.audioContext;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      const context = new AudioCtx();
      const master = context.createGain();
      master.gain.value = .28;
      master.connect(context.destination);
      runtime.audioContext = context;
      runtime.masterGain = master;
      return context;
    } catch (_) {
      return null;
    }
  }

  function resumeAudio() {
    try { runtime.audioContext?.resume?.(); } catch (_) {}
  }

  function suspendAudio() {
    try { runtime.audioContext?.suspend?.(); } catch (_) {}
  }

  function playTileTone(tile, sustain = false) {
    if (!runtime.soundEnabled) return;
    const context = ensureAudio();
    if (!context || !runtime.masterGain) return;
    resumeAudio();
    const now = context.currentTime;
    try {
      const osc = context.createOscillator();
      const overtone = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      osc.type = 'triangle';
      overtone.type = 'sine';
      osc.frequency.setValueAtTime(tile.freq, now);
      overtone.frequency.setValueAtTime(tile.freq * 2, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.19, now + .012);
      osc.connect(filter); overtone.connect(filter); filter.connect(gain); gain.connect(runtime.masterGain);
      osc.start(now); overtone.start(now);
      if (sustain) {
        gain.gain.exponentialRampToValueAtTime(.11, now + .18);
        runtime.voices.set(tile.id, { osc, overtone, gain });
      } else {
        gain.gain.exponentialRampToValueAtTime(.0001, now + .34);
        osc.stop(now + .38); overtone.stop(now + .38);
      }
    } catch (_) {}
  }

  function stopVoice(tileId, soft = true) {
    const voice = runtime.voices.get(tileId);
    if (!voice || !runtime.audioContext) return;
    runtime.voices.delete(tileId);
    const now = runtime.audioContext.currentTime;
    try {
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(.0001, now, soft ? .06 : .018);
      voice.osc.stop(now + (soft ? .28 : .1));
      voice.overtone.stop(now + (soft ? .28 : .1));
    } catch (_) {}
  }

  function stopAllVoices(soft = false) {
    Array.from(runtime.voices.keys()).forEach(id => stopVoice(id, soft));
  }

  function playFailureTone(kind) {
    if (!runtime.soundEnabled) return;
    const context = ensureAudio();
    if (!context || !runtime.masterGain) return;
    resumeAudio();
    const now = context.currentTime;
    const isWrong = kind === 'wrong';
    const freqs = isWrong ? [261.63, 277.18, 369.99] : [146.83, 110.00, 82.41];
    try {
      const bus = context.createGain();
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isWrong ? 1900 : 1200, now);
      bus.gain.setValueAtTime(.0001, now);
      bus.gain.exponentialRampToValueAtTime(isWrong ? .18 : .22, now + .008);
      bus.gain.exponentialRampToValueAtTime(.0001, now + (isWrong ? .34 : .48));
      filter.connect(bus); bus.connect(runtime.masterGain);
      freqs.forEach((freq, index) => {
        const osc = context.createOscillator();
        osc.type = index === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(45, freq * (isWrong ? .84 : .58)), now + (isWrong ? .26 : .42));
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + (isWrong ? .38 : .52));
      });
    } catch (_) {}
  }

  function playUiTone(kind) {
    if (!runtime.soundEnabled) return;
    const context = ensureAudio();
    if (!context || !runtime.masterGain) return;
    const now = context.currentTime;
    const freq = kind === 'win' ? 740 : kind === 'fail' ? 150 : 520;
    try {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = kind === 'fail' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(kind === 'fail' ? .11 : .09, now + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, now + (kind === 'win' ? .45 : .18));
      osc.connect(gain); gain.connect(runtime.masterGain); osc.start(now); osc.stop(now + .5);
    } catch (_) {}
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '♪' : '×♪';
    if (!runtime.soundEnabled) stopAllVoices(false);
    try { runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); } catch (_) {}
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
    if (runtime.round?.sessionId && !runtime.rewardSubmitting) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.round = null;
    runtime.open = false;
    runtime.state = 'closed';
    runtime.overlay.hidden = true;
    document.body.classList.remove('code-tiles-active');
    runtime.pointerOwners.clear();
    runtime.keyboardOwners.clear();
    runtime.activeHolds.clear();
    runtime.failureFx = null;
    stopAllVoices(false);
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    clearTimeout(runtime.resizeTimer);
    suspendAudio();
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    const record = snap.gameRecords?.codeTiles || {};
    runtime.bestScore = Math.max(0, Number(record.bestRunScore || record.bestScore || 0));
    runtime.bestAccuracy = Math.max(0, Number(record.bestAccuracy || 0));
    runtime.lastRewardDay = String(record.lastRewardDay || '');
    runtime.lastRewardXp = clamp(Number(record.lastRewardXp || 0), 0, 3);
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '♪' : '×♪';
    runtime.bestEl.textContent = runtime.bestScore ? String(runtime.bestScore) : '0';
    runtime.level = 1;
    updateLevelUi();
    runtime.open = true;
    runtime.state = 'ready';
    runtime.overlay.hidden = false;
    document.body.classList.add('code-tiles-active');
    runtime.readyPanel.hidden = false;
    runtime.pausePanel.hidden = true;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    buildChart(`preview-level-${runtime.level}`);
    runtime.nextIndex = 0;
    runtime.scroll = 0;
    runtime.score = 0;
    updateHud();
    requestAnimationFrame(() => { resizeCanvas(); render(performance.now()); });
  }

  const publicApi = { open, close: closeInternal, isOpen: () => runtime.open };
  if (window.__CODE_TILES_TEST__ === true) {
    publicApi.__debug = Object.freeze({
      snapshot: () => ({
        state: runtime.state,
        level: runtime.level,
        levelName: levelConfig().name,
        nextIndex: runtime.nextIndex,
        score: runtime.score,
        scroll: runtime.scroll,
        activeTimeMs: runtime.activeTimeMs,
        holdsCompleted: runtime.holdsCompleted,
        activeHolds: runtime.activeHolds.size,
        current: currentTile() ? { id: currentTile().id, lane: currentTile().lane, isHold: currentTile().isHold, rect: tileRect(currentTile()) } : null
      }),
      tapNext: () => {
        const tile = currentTile();
        if (!tile || runtime.state !== 'playing') return false;
        const r = tileRect(tile);
        const point = { x: tile.lane * LANE_W + LANE_W / 2, y: clamp((r.top + r.bottom) / 2, BOARD_TOP + 1, BOARD_BOTTOM - 1) };
        return hitCurrent(`test:${tile.id}`, point, tile.lane);
      },
      metrics: () => ({ perfect: runtime.perfect, great: runtime.great, good: runtime.good, misses: runtime.misses, badTaps: runtime.badTaps, maxCombo: runtime.maxStreak, holdsCompleted: runtime.holdsCompleted, activeTimeMs: runtime.activeTimeMs }),
      setSpeed: value => { runtime.testSpeed = clamp(Number(value || 1), 1, 20); return runtime.testSpeed; }
    });
  }
  window[GLOBAL_NAME] = Object.freeze(publicApi);
})();
