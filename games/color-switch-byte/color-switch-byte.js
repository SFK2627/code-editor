(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'color-switch-byte';
  const MAX_DPR = 2;
  const COLOR_META = Object.freeze([
    Object.freeze({ name: 'CYAN', hex: '#22d3ee' }),
    Object.freeze({ name: 'CORAL', hex: '#fb7185' }),
    Object.freeze({ name: 'GOLD', hex: '#facc15' }),
    Object.freeze({ name: 'VIOLET', hex: '#a78bfa' }),
    Object.freeze({ name: 'LIME', hex: '#4ade80' }),
    Object.freeze({ name: 'ORANGE', hex: '#fb923c' }),
    Object.freeze({ name: 'BLUE', hex: '#60a5fa' }),
    Object.freeze({ name: 'PINK', hex: '#f472b6' })
  ]);
  const COLORS = Object.freeze(COLOR_META.map(item => item.hex));
  const SIMILAR_COLOR_MAP = Object.freeze({
    0: Object.freeze([6]),       // CYAN / BLUE
    1: Object.freeze([5, 7]),    // CORAL / ORANGE / PINK
    2: Object.freeze([4, 5]),    // GOLD / LIME / ORANGE
    3: Object.freeze([6, 7]),    // VIOLET / BLUE / PINK
    4: Object.freeze([0, 2]),    // LIME / CYAN / GOLD
    5: Object.freeze([1, 2]),    // ORANGE / CORAL / GOLD
    6: Object.freeze([0, 3]),    // BLUE / CYAN / VIOLET
    7: Object.freeze([1, 3])     // PINK / CORAL / VIOLET
  });
  const DIFFICULTY_STAGES = Object.freeze([
    Object.freeze({ name: 'EASY',   minScore: 0,  speedMin: 0.46, speedMax: 0.60, clearTravel: 140, gravity: 910 }),
    Object.freeze({ name: 'MEDIUM', minScore: 5,  speedMin: 0.56, speedMax: 0.72, clearTravel: 130, gravity: 922 }),
    Object.freeze({ name: 'HARD',   minScore: 10, speedMin: 0.67, speedMax: 0.85, clearTravel: 119, gravity: 934 }),
    Object.freeze({ name: 'EXPERT', minScore: 15, speedMin: 0.78, speedMax: 0.98, clearTravel: 109, gravity: 946 }),
    Object.freeze({ name: 'INSANE', minScore: 20, speedMin: 0.90, speedMax: 1.10, clearTravel: 101, gravity: 958 })
  ]);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const runtime = {
    built: false,
    open: false,
    state: 'ready',
    bridge: null,
    onBack: null,
    onClose: null,
    onReward: null,
    overlay: null,
    shell: null,
    canvas: null,
    ctx: null,
    readyPanel: null,
    pausePanel: null,
    overPanel: null,
    scoreEl: null,
    comboEl: null,
    colorEl: null,
    finalScore: null,
    finalBest: null,
    finalCombo: null,
    finalXp: null,
    rewardNote: null,
    soundBtn: null,
    pauseBtn: null,
    fxEl: null,
    view: { w: 620, h: 680, dpr: 1 },
    raf: 0,
    lastFrame: 0,
    resizeTimer: 0,
    ball: { x: 0, worldY: 0, vy: 0, radius: 15, colorIndex: 0 },
    cameraY: 0,
    rings: [],
    ringSequence: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    bestVisible: 0,
    colorPlanHistory: [],
    lastOtherColor: -1,
    lastRoundStartColor: -1,
    round: null,
    soundEnabled: true,
    audioContext: null,
    startedAt: 0,
    deathParticles: [],
    deathRing: null,
    deathTimer: 0,
    deathFinalizing: false,
    input: {
      pressed: false,
      pointerId: null,
      pressStartedAt: 0,
      holdSeconds: 0,
      power: 0,
      hasStartedMotion: false,
      keyboardHeld: false,
      lastLiftAt: 0
    }
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'colorSwitchByteOverlay';
    overlay.className = 'xp-games-game-overlay color-switch-byte-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Color Switch Byte mini-game');
    overlay.innerHTML = `
      <section class="color-switch-byte-shell">
        <canvas class="color-switch-byte-canvas" tabindex="-1" aria-label="COLOR SWITCH BYTE gameplay area"></canvas>
        <div class="color-switch-byte-topbar">
          <button type="button" data-color-switch-byte-back>&larr; MINI-GAMES</button>
          <button type="button" data-color-switch-byte-sound aria-label="Toggle sound">&#128266;</button>
          <button type="button" data-color-switch-byte-pause-button aria-label="Pause COLOR SWITCH BYTE">II</button>
          <button type="button" data-color-switch-byte-close aria-label="Close COLOR SWITCH BYTE">&times;</button>
        </div>
        <div class="color-switch-byte-hud">
          <div><small>SCORE</small><strong data-color-switch-byte-score>0</strong></div>
          <div><small>COMBO</small><strong data-color-switch-byte-combo>x0</strong></div>
          <div><small>BYTE COLOR</small><strong data-color-switch-byte-color>CYAN</strong></div>
        </div>
        <div class="color-switch-byte-fx" data-color-switch-byte-fx></div>

        <div class="color-switch-byte-panel" data-color-switch-byte-ready>
          <div class="color-switch-byte-panel-card">
            <span class="color-switch-byte-hero">&#128993;</span>
            <h2>COLOR SWITCH BYTE</h2>
            <p>Control the lift: quick tap for a small hop, hold briefly for a stronger boost. Pass only through your matching color.</p>
            <div class="color-switch-byte-help">8 COLORS &middot; 5 DIFFICULTY STAGES &middot; CONTRAST RINGS &middot; Tap = HOP &middot; Hold = BOOST</div>
            <button class="primary" type="button" data-color-switch-byte-start>START</button>
          </div>
        </div>

        <div class="color-switch-byte-panel" data-color-switch-byte-pause-panel hidden>
          <div class="color-switch-byte-panel-card">
            <h2>PAUSED</h2>
            <p>Your byte is frozen safely.</p>
            <button class="primary" type="button" data-color-switch-byte-resume>RESUME</button>
          </div>
        </div>

        <div class="color-switch-byte-panel" data-color-switch-byte-over hidden>
          <div class="color-switch-byte-panel-card">
            <h2>GAME OVER</h2>
            <div class="color-switch-byte-stats">
              <div><small>Score</small><strong data-color-switch-byte-final-score>0</strong></div>
              <div><small>Best</small><strong data-color-switch-byte-final-best>0</strong></div>
              <div><small>Highest Combo</small><strong data-color-switch-byte-final-combo>x0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-color-switch-byte-final-xp>+0</strong></div>
            </div>
            <p class="color-switch-byte-reward-note" data-color-switch-byte-reward-note>Checking reward...</p>
            <div class="color-switch-byte-actions">
              <button class="primary" type="button" data-color-switch-byte-again>PLAY AGAIN</button>
              <button type="button" data-color-switch-byte-hub>MINI-GAMES</button>
              <button type="button" data-color-switch-byte-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.color-switch-byte-shell');
    runtime.canvas = overlay.querySelector('.color-switch-byte-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false });
    runtime.readyPanel = overlay.querySelector('[data-color-switch-byte-ready]');
    runtime.pausePanel = overlay.querySelector('[data-color-switch-byte-pause-panel]');
    runtime.overPanel = overlay.querySelector('[data-color-switch-byte-over]');
    runtime.scoreEl = overlay.querySelector('[data-color-switch-byte-score]');
    runtime.comboEl = overlay.querySelector('[data-color-switch-byte-combo]');
    runtime.colorEl = overlay.querySelector('[data-color-switch-byte-color]');
    runtime.finalScore = overlay.querySelector('[data-color-switch-byte-final-score]');
    runtime.finalBest = overlay.querySelector('[data-color-switch-byte-final-best]');
    runtime.finalCombo = overlay.querySelector('[data-color-switch-byte-final-combo]');
    runtime.finalXp = overlay.querySelector('[data-color-switch-byte-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-color-switch-byte-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-color-switch-byte-sound]');
    runtime.pauseBtn = overlay.querySelector('[data-color-switch-byte-pause-button]');
    runtime.fxEl = overlay.querySelector('[data-color-switch-byte-fx]');

    overlay.querySelector('[data-color-switch-byte-start]').addEventListener('click', startRound);
    overlay.querySelector('[data-color-switch-byte-resume]').addEventListener('click', resume);
    overlay.querySelector('[data-color-switch-byte-again]').addEventListener('click', resetReady);
    overlay.querySelector('[data-color-switch-byte-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-color-switch-byte-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-color-switch-byte-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-color-switch-byte-close-result]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.pauseBtn.addEventListener('click', () => runtime.state === 'playing' ? pause() : resume());
    runtime.canvas.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (runtime.state !== 'playing') return;
      try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
      beginLift(event.pointerId);
    });
    runtime.canvas.addEventListener('pointerup', event => {
      event.preventDefault();
      endLift(event.pointerId);
    });
    runtime.canvas.addEventListener('pointercancel', event => {
      event.preventDefault();
      endLift(event.pointerId, true);
    });
    runtime.canvas.addEventListener('lostpointercapture', event => {
      endLift(event.pointerId, true);
    });
    document.addEventListener('keydown', event => {
      if (!runtime.open || runtime.state !== 'playing' || event.code !== 'Space' || event.repeat) return;
      if (event.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(event.target.tagName || '')) return;
      event.preventDefault();
      runtime.input.keyboardHeld = true;
      beginLift('keyboard');
    });
    document.addEventListener('keyup', event => {
      if (!runtime.open || event.code !== 'Space' || !runtime.input.keyboardHeld) return;
      event.preventDefault();
      runtime.input.keyboardHeld = false;
      endLift('keyboard');
    });
    overlay.addEventListener('touchmove', event => {
      if (runtime.open) event.preventDefault();
    }, { passive: false });
    document.addEventListener('visibilitychange', () => {
      if (runtime.open && document.hidden && runtime.state === 'playing') pause();
    });
    window.addEventListener('blur', () => {
      if (runtime.open && runtime.state === 'playing') pause();
    });
    window.addEventListener('resize', queueResize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(queueResize, 100), { passive: true });
    runtime.built = true;
  }

  function getAudio() {
    if (!runtime.soundEnabled) return null;
    try {
      if (!runtime.audioContext) runtime.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
      return runtime.audioContext;
    } catch (_) {
      return null;
    }
  }

  function tone(kind) {
    const ctx = getAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const table = {
      flap: [380, 560, 0.055, 0.035],
      switch: [520, 820, 0.075, 0.045],
      pass: [660, 940, 0.075, 0.05],
      over: [180, 65, 0.22, 0.06]
    };
    const item = table[kind] || table.flap;
    osc.type = kind === 'over' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(item[0], now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, item[1]), now + item[2]);
    gain.gain.setValueAtTime(__ict8SfxGain(item[3]), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + item[2]);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + item[2] + 0.02);
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.innerHTML = runtime.soundEnabled ? '&#128266;' : '&#128263;';
    runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);
  }

  function queueResize() {
    if (!runtime.open) return;
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = setTimeout(resizeCanvas, 70);
  }

  function resizeCanvas() {
    if (!runtime.open || !runtime.ctx) return;
    const rect = runtime.canvas.getBoundingClientRect();
    const w = Math.max(280, rect.width || 620);
    const h = Math.max(400, rect.height || 680);
    const dpr = Math.max(1, Math.min(MAX_DPR, Number(devicePixelRatio || 1)));
    runtime.canvas.width = Math.round(w * dpr);
    runtime.canvas.height = Math.round(h * dpr);
    runtime.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    runtime.view = { w, h, dpr };
    runtime.ball.x = w / 2;
    // Keep the playable byte smaller than before so the ring timing reads more
    // clearly on phones. The color-switch orb remains larger and easy to see.
    runtime.ball.radius = clamp(w * 0.0265, 11.5, 16);
    // Keep obstacle geometry readable after a phone/desktop resize.
    for (const ring of runtime.rings) {
      ring.radius = ringRadiusForView();
      ring.width = ringWidthForView();
      ring.switchGap = ringSwitchGapForView();
    }
  }

  function colorName(index) {
    const safeIndex = ((Number(index) || 0) % COLOR_META.length + COLOR_META.length) % COLOR_META.length;
    return COLOR_META[safeIndex].name;
  }

  function chooseRoundStartColor() {
    const candidates = COLOR_META.map((_, index) => index).filter(index => index !== runtime.lastRoundStartColor);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
    runtime.lastRoundStartColor = chosen;
    return chosen;
  }

  function chooseNextRequiredColor() {
    // Avoid the current color and the previous two planned colors. This blocks
    // immediate repeats and short A-B-A / A-B-A-B loops while keeping variety.
    const recent = runtime.colorPlanHistory.slice(-3);
    let candidates = COLOR_META.map((_, index) => index).filter(index => !recent.includes(index));
    if (!candidates.length) {
      const current = recent[recent.length - 1] ?? runtime.ball.colorIndex;
      candidates = COLOR_META.map((_, index) => index).filter(index => index !== current);
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
    runtime.colorPlanHistory.push(chosen);
    if (runtime.colorPlanHistory.length > 6) runtime.colorPlanHistory.splice(0, runtime.colorPlanHistory.length - 6);
    return chosen;
  }

  function colorsLookSimilar(a, b) {
    return a === b || Boolean(SIMILAR_COLOR_MAP[a]?.includes(b)) || Boolean(SIMILAR_COLOR_MAP[b]?.includes(a));
  }

  function chooseRingOtherColor(required) {
    const previousRequired = runtime.colorPlanHistory[runtime.colorPlanHistory.length - 2];
    let candidates = COLOR_META.map((_, index) => index).filter(index => (
      index !== required &&
      index !== runtime.lastOtherColor &&
      index !== previousRequired &&
      !colorsLookSimilar(required, index)
    ));

    // If history restrictions leave no option, keep the contrast rule first.
    if (!candidates.length) {
      candidates = COLOR_META.map((_, index) => index).filter(index => (
        index !== required && !colorsLookSimilar(required, index)
      ));
    }
    if (!candidates.length) candidates = COLOR_META.map((_, index) => index).filter(index => index !== required);

    const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? ((required + 1) % COLORS.length);
    runtime.lastOtherColor = chosen;
    return chosen;
  }

  function difficultyForScore(score = runtime.score) {
    const safeScore = Math.max(0, Number(score) || 0);
    let stage = DIFFICULTY_STAGES[0];
    for (const candidate of DIFFICULTY_STAGES) {
      if (safeScore >= candidate.minScore) stage = candidate;
      else break;
    }
    return stage;
  }

  function difficultyIndexForScore(score = runtime.score) {
    const safeScore = Math.max(0, Number(score) || 0);
    return clamp(Math.floor(safeScore / 5), 0, DIFFICULTY_STAGES.length - 1);
  }

  function updateHud() {
    runtime.scoreEl.textContent = String(runtime.score);
    runtime.comboEl.textContent = `x${runtime.combo}`;
    runtime.colorEl.textContent = colorName(runtime.ball.colorIndex);
    runtime.colorEl.style.color = COLORS[runtime.ball.colorIndex];
  }

  function resetReady() {
    runtime.state = 'ready';
    runtime.score = 0;
    runtime.combo = 0;
    runtime.bestCombo = 0;
    runtime.rings = [];
    runtime.ringSequence = 0;
    runtime.ball.worldY = 0;
    runtime.ball.vy = 0;
    runtime.ball.colorIndex = 0;
    runtime.colorPlanHistory = [runtime.ball.colorIndex];
    runtime.lastOtherColor = -1;
    runtime.cameraY = 0;
    runtime.round = null;
    runtime.startedAt = 0;
    clearDeathFx();
    resetLiftInput();
    runtime.readyPanel.hidden = false;
    runtime.pausePanel.hidden = true;
    runtime.overPanel.hidden = true;
    runtime.pauseBtn.textContent = 'II';
    seedRings();
    updateHud();
  }

  function startRound() {
    if (!runtime.open) return;
    runtime.score = 0;
    runtime.combo = 0;
    runtime.bestCombo = 0;
    runtime.ball.worldY = 0;
    runtime.ball.vy = 0;
    runtime.ball.colorIndex = chooseRoundStartColor();
    runtime.colorPlanHistory = [runtime.ball.colorIndex];
    runtime.lastOtherColor = -1;
    runtime.cameraY = 0;
    runtime.rings = [];
    runtime.ringSequence = 0;
    runtime.startedAt = performance.now();
    clearDeathFx();
    resetLiftInput();
    seedRings();
    runtime.round = null;
    try {
      runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null;
    } catch (_) {
      runtime.round = null;
    }
    runtime.state = 'playing';
    runtime.readyPanel.hidden = true;
    runtime.pausePanel.hidden = true;
    runtime.overPanel.hidden = true;
    runtime.pauseBtn.textContent = 'II';
    updateHud();
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
  }

  function ringRadiusForView() {
    return clamp(runtime.view.w * 0.14, 58, 86);
  }

  function ringWidthForView() {
    return clamp(runtime.view.w * 0.031, 14, 20);
  }

  function ringSwitchGapForView() {
    // Distance from the bottom edge of a ring to its color-switch orb.
    return clamp(runtime.view.w * 0.15, 72, 88);
  }

  function switchOrbRadiusForView() {
    // Slightly larger than the old fixed 9px orb so the upcoming color change
    // is easier to read on phones without making the obstacle feel oversized.
    return clamp(runtime.view.w * 0.022, 10.5, 13);
  }

  function ringClearTravelForScore(score = runtime.score) {
    // Five explicit difficulty bands: obstacle spacing tightens in controlled
    // steps instead of endlessly accelerating into an unfair wall.
    return difficultyForScore(score).clearTravel;
  }

  function ringCenterSpacingForScore(score = runtime.score) {
    const radius = ringRadiusForView();
    return radius * 2 + ringSwitchGapForView() + ringClearTravelForScore(score);
  }

  function firstRingWorldY() {
    const radius = ringRadiusForView();
    const approach = clamp(runtime.view.h * 0.13, 94, 118);
    return radius + ringSwitchGapForView() + approach;
  }

  function seedRings() {
    let y = firstRingWorldY();
    for (let i = 0; i < 4; i += 1) {
      const ordinal = runtime.ringSequence++;
      runtime.rings.push(makeRing(y, ordinal));
      y += ringCenterSpacingForScore(ordinal);
    }
  }

  function makeRing(worldY, indexSeed = 0) {
    const required = chooseNextRequiredColor();
    const other = chooseRingOtherColor(required);
    // indexSeed maps to the score the player will have before reaching this
    // ring, so the five bands activate exactly after 5/10/15/20 successful rings
    // even though several future obstacles are pre-generated off-screen.
    const projectedScore = Math.max(runtime.score, indexSeed);
    const difficulty = difficultyForScore(projectedScore);
    const difficultyIndex = difficultyIndexForScore(projectedScore);

    // Easy/Medium stay forgiving and varied. From Hard onward, alternating
    // directions make the next ring demand fresh timing instead of letting the
    // player settle into one repeated rotation rhythm.
    let direction;
    if (difficultyIndex >= 2) {
      const patternOffset = difficultyIndex >= 4 ? Math.floor(indexSeed / 3) : 0;
      direction = ((indexSeed + patternOffset) % 2 === 0) ? 1 : -1;
    } else {
      direction = Math.random() < 0.5 ? -1 : 1;
    }

    const speedRange = difficulty.speedMax - difficulty.speedMin;
    const speed = difficulty.speedMin + Math.random() * speedRange;
    return {
      worldY,
      radius: ringRadiusForView(),
      width: ringWidthForView(),
      switchGap: ringSwitchGapForView(),
      rotation: Math.random() * Math.PI * 2,
      speed: direction * speed,
      difficultyIndex,
      required,
      other,
      switched: false,
      entered: false,
      safe: false,
      passed: false
    };
  }

  function ensureRingsAhead() {
    const highest = runtime.rings.reduce((max, ring) => Math.max(max, ring.worldY), 0);
    let next = highest || firstRingWorldY();
    const lookAhead = Math.max(1260, runtime.view.h * 1.65);
    while (next < runtime.ball.worldY + lookAhead) {
      const ordinal = runtime.ringSequence++;
      next += ringCenterSpacingForScore(ordinal);
      runtime.rings.push(makeRing(next, ordinal));
    }
    runtime.rings = runtime.rings.filter(ring => ring.worldY > runtime.cameraY - 320);
  }

  function resetLiftInput() {
    runtime.input.pressed = false;
    runtime.input.pointerId = null;
    runtime.input.pressStartedAt = 0;
    runtime.input.holdSeconds = 0;
    runtime.input.power = 0;
    runtime.input.hasStartedMotion = false;
    runtime.input.keyboardHeld = false;
    runtime.input.lastLiftAt = 0;
  }

  // Balanced lift: every press gives a predictable impulse, but repeated taps
  // cannot stack unlimited upward velocity. A short hold adds only a controlled
  // amount of extra lift so phone taps feel responsive without instant deaths.
  function beginLift(pointerId) {
    if (runtime.state !== 'playing') return;
    if (runtime.input.pressed) return;
    const now = performance.now();
    if (runtime.input.lastLiftAt && now - runtime.input.lastLiftAt < 52) return;
    runtime.input.lastLiftAt = now;
    runtime.input.pressed = true;
    runtime.input.pointerId = pointerId;
    runtime.input.pressStartedAt = now;
    runtime.input.holdSeconds = 0;
    runtime.input.power = 0.18;
    runtime.input.hasStartedMotion = true;

    const vy = runtime.ball.vy;
    let nextVy;
    if (vy < -150) nextVy = 305;          // recover cleanly from a real fall
    else if (vy < 90) nextVy = 285;       // normal hop
    else nextVy = vy + 64;                // repeat tap, but still bounded
    runtime.ball.vy = clamp(nextVy, 265, 355);
    tone('flap');
  }

  function endLift(pointerId, cancelled = false) {
    if (!runtime.input.pressed) return;
    if (runtime.input.pointerId !== pointerId && pointerId !== 'keyboard') return;
    const held = runtime.input.holdSeconds;
    runtime.input.pressed = false;
    runtime.input.pointerId = null;

    if (!cancelled && runtime.state === 'playing' && runtime.ball.vy > 0) {
      let releaseFactor = 1;
      if (held < 0.065) releaseFactor = 0.82;
      else if (held < 0.125) releaseFactor = 0.91;
      else if (held < 0.19) releaseFactor = 0.97;
      runtime.ball.vy *= releaseFactor;
    }
    runtime.input.power = 0;
  }

  function updateLift(dt) {
    if (!runtime.input.pressed || runtime.state !== 'playing') return;
    const MAX_HOLD = 0.19;
    runtime.input.holdSeconds += dt;
    const activeHold = Math.min(runtime.input.holdSeconds, MAX_HOLD);
    runtime.input.power = clamp(activeHold / MAX_HOLD, 0.18, 1);

    if (runtime.input.holdSeconds <= MAX_HOLD) {
      const liftAcceleration = 340;
      runtime.ball.vy = Math.min(390, runtime.ball.vy + liftAcceleration * dt);
    }
  }

  function pause() {
    if (runtime.state !== 'playing') return;
    endLift(runtime.input.pointerId, true);
    runtime.state = 'paused';
    runtime.pausePanel.hidden = false;
    runtime.pauseBtn.textContent = '>';
  }

  function resume() {
    if (runtime.state !== 'paused') return;
    runtime.state = 'playing';
    runtime.pausePanel.hidden = true;
    runtime.pauseBtn.textContent = 'II';
    runtime.lastFrame = performance.now();
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
  }

  function showFx(text, level = '') {
    runtime.fxEl.textContent = text;
    runtime.fxEl.className = `color-switch-byte-fx ${level}`.trim();
    void runtime.fxEl.offsetWidth;
    runtime.fxEl.classList.add('show');
  }

  function ringSegmentColor(ring, angle) {
    const quarter = Math.PI / 2;
    let normalized = angle - ring.rotation;
    normalized %= Math.PI * 2;
    if (normalized < 0) normalized += Math.PI * 2;
    const segment = Math.floor(normalized / quarter) % 4;
    return segment % 2 === 0 ? ring.required : ring.other;
  }

  // Return the real arc of the ring currently occupied by the byte.
  // The old implementation checked only once, on first contact, so a rotating
  // wrong-color segment could move into the byte afterwards without killing it.
  function getRingContact(ring, dy) {
    const radialDistance = Math.abs(dy);
    const ringMidRadius = ring.radius;
    // Treat the ring stroke as physical thickness and give ~1px forgiveness so
    // a barely-visible anti-aliased touch does not feel unfair on phones.
    const effectiveReach = Math.max(1, runtime.ball.radius * 0.82 + ring.width * 0.5 - 2.2);
    const penetration = effectiveReach - Math.abs(radialDistance - ringMidRadius);
    if (penetration <= 0 || radialDistance <= 0.001) {
      return { touching: false, unsafe: false, penetration: 0 };
    }

    // Canvas angles: +PI/2 is the bottom of the ring, -PI/2 is the top.
    // World Y grows upward, so a byte below the ring touches its bottom edge.
    const contactAngle = dy < 0 ? Math.PI / 2 : -Math.PI / 2;
    const denom = 2 * ringMidRadius * radialDistance;
    let halfSpan = 0;
    if (denom > 0.0001) {
      const cosine = clamp(
        (ringMidRadius * ringMidRadius + radialDistance * radialDistance - effectiveReach * effectiveReach) / denom,
        -1,
        1
      );
      halfSpan = Math.acos(cosine);
    }

    // Ignore the outermost few degrees of contact. This preserves strict color
    // collision while preventing deaths from a 1px segment-boundary graze.
    const fairHalfSpan = Math.max(0, halfSpan - 0.028);
    const samples = fairHalfSpan > 0.015
      ? [-0.82, -0.48, 0, 0.48, 0.82].map(factor => contactAngle + fairHalfSpan * factor)
      : [contactAngle];

    const wrongSamples = samples.reduce((count, angle) => (
      count + (ringSegmentColor(ring, angle) === runtime.ball.colorIndex ? 0 : 1)
    ), 0);
    const centerWrong = ringSegmentColor(ring, contactAngle) !== runtime.ball.colorIndex;

    // A meaningful collision with a wrong center OR a clearly overlapping wrong
    // arc is fatal. Re-evaluated every frame so rotating colors cannot ghost through.
    const meaningfulContact = penetration > 1.6;
    const deepContact = penetration > 2.35;
    const unsafe = meaningfulContact && ((deepContact && centerWrong && wrongSamples >= 2) || wrongSamples >= 4);
    return { touching: true, unsafe, penetration };
  }

  function updateRings(dt) {
    for (const ring of runtime.rings) {
      ring.rotation += ring.speed * dt;
      const switchY = ring.worldY - ring.radius - ring.switchGap;
      if (!ring.switched && runtime.ball.worldY >= switchY) {
        ring.switched = true;
        runtime.ball.colorIndex = ring.required;
        tone('switch');
        showFx(`COLOR: ${colorName(ring.required)}`, 'switch');
        updateHud();
      }

      const dy = runtime.ball.worldY - ring.worldY;
      const contact = getRingContact(ring, dy);

      // IMPORTANT: validate throughout the ENTIRE contact, not only the frame
      // where the byte first enters the ring stroke. The ring keeps rotating.
      if (contact.touching) {
        ring.entered = true;
        ring.safe = !contact.unsafe;
        if (contact.unsafe) {
          runtime.combo = 0;
          updateHud();
          showFx('WRONG COLOR!', 'hot');
          startDeath('wrong-color');
          return;
        }
      } else if (ring.entered) {
        ring.entered = false;
        ring.safe = false;
      }

      if (!ring.passed && runtime.ball.worldY > ring.worldY + ring.radius + runtime.ball.radius + 10) {
        ring.passed = true;
        const previousDifficultyIndex = difficultyIndexForScore(runtime.score);
        runtime.score += 1;
        runtime.combo += 1;
        runtime.bestCombo = Math.max(runtime.bestCombo, runtime.combo);
        tone('pass');
        const nextDifficultyIndex = difficultyIndexForScore(runtime.score);
        if (nextDifficultyIndex > previousDifficultyIndex) {
          showFx(`${DIFFICULTY_STAGES[nextDifficultyIndex].name} MODE`, 'hot');
        } else if (runtime.combo % 10 === 0) showFx(`BYTE COMBO x${runtime.combo}`, 'hot');
        else if (runtime.combo % 5 === 0) showFx(`COMBO x${runtime.combo}`, 'pass');
        else showFx('+1', 'pass');
        updateHud();
      }
    }
  }

  function update(dt) {
    if (runtime.state === 'dying') {
      updateDeathFx(dt);
      return;
    }
    if (runtime.state !== 'playing') return;

    if (!runtime.input.hasStartedMotion) return;

    updateLift(dt);
    // Difficulty rises through both obstacle timing and a modest vertical pace
    // increase, while staying capped so late-game runs remain skill-based.
    const difficulty = difficultyForScore(runtime.score);
    const gravity = difficulty.gravity;
    runtime.ball.vy -= gravity * dt;
    runtime.ball.worldY += runtime.ball.vy * dt;

    const cameraTarget = runtime.ball.worldY - runtime.view.h * 0.30;
    if (cameraTarget > runtime.cameraY) runtime.cameraY += (cameraTarget - runtime.cameraY) * clamp(dt * 5.2, 0, 1);

    ensureRingsAhead();
    updateRings(dt);
    if (runtime.state !== 'playing') return;

    if (runtime.ball.worldY < runtime.cameraY - runtime.view.h * 0.32) {
      startDeath('fall');
    }
  }

  function clearDeathFx() {
    runtime.deathParticles = [];
    runtime.deathRing = null;
    runtime.deathTimer = 0;
    runtime.deathFinalizing = false;
  }

  function startDeath(reason = 'hit') {
    if (runtime.state !== 'playing') return;
    endLift(runtime.input.pointerId, true);
    runtime.state = 'dying';
    runtime.deathTimer = 0;
    runtime.deathFinalizing = false;
    const x = runtime.view.w / 2;
    const y = clamp(screenY(runtime.ball.worldY), 44, runtime.view.h - 44);
    const color = COLORS[runtime.ball.colorIndex];
    runtime.deathRing = { x, y, age: 0, ttl: 0.46, color };
    runtime.deathParticles = [];
    const count = 30;
    for (let i = 0; i < count; i += 1) {
      const angle = Math.PI * 2 * (i / count) + (Math.random() - 0.5) * 0.26;
      const speed = 85 + Math.random() * 175;
      runtime.deathParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 22,
        radius: 2.2 + Math.random() * 3.8,
        age: 0,
        ttl: 0.34 + Math.random() * 0.24,
        color: Math.random() < 0.76 ? color : COLORS[(runtime.ball.colorIndex + 1 + (i % 3)) % COLORS.length]
      });
    }
    tone('over');
    try { if (navigator.vibrate) navigator.vibrate([18, 24, 28]); } catch (_) {}
    if (reason === 'fall') showFx('BYTE LOST!', 'hot');
  }

  function updateDeathFx(dt) {
    runtime.deathTimer += dt;
    if (runtime.deathRing) runtime.deathRing.age += dt;
    runtime.deathParticles = runtime.deathParticles.filter(particle => {
      particle.age += dt;
      particle.vy += 520 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      return particle.age < particle.ttl;
    });
    if (runtime.deathTimer >= 0.48 && !runtime.deathFinalizing) {
      runtime.deathFinalizing = true;
      finishRound(true);
    }
  }

  function screenY(worldY) {
    return runtime.view.h * 0.74 - (worldY - runtime.cameraY);
  }

  function drawBackground(time) {
    const ctx = runtime.ctx;
    const w = runtime.view.w;
    const h = runtime.view.h;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#09172b');
    gradient.addColorStop(1, '#060817');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(167,139,250,.06)';
    ctx.lineWidth = 1;
    const gap = 42;
    const shift = (time * 0.02) % gap;
    for (let y = -gap + shift; y < h + gap; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawRing(ring) {
    const ctx = runtime.ctx;
    const x = runtime.view.w / 2;
    const y = screenY(ring.worldY);
    if (y < -ring.radius - 40 || y > runtime.view.h + ring.radius + 40) return;
    const quarter = Math.PI / 2;
    ctx.save();
    ctx.lineCap = 'butt';
    ctx.lineWidth = ring.width;
    ctx.shadowBlur = 8;
    for (let i = 0; i < 4; i += 1) {
      const colorIndex = i % 2 === 0 ? ring.required : ring.other;
      ctx.strokeStyle = COLORS[colorIndex];
      ctx.shadowColor = COLORS[colorIndex];
      ctx.beginPath();
      ctx.arc(x, y, ring.radius, ring.rotation + i * quarter + 0.02, ring.rotation + (i + 1) * quarter - 0.02);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(226,232,240,.72)';
    ctx.font = '900 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MATCH', x, y + 3);
    ctx.restore();

    const switchY = screenY(ring.worldY - ring.radius - ring.switchGap);
    if (!ring.switched && switchY > -30 && switchY < runtime.view.h + 30) {
      ctx.save();
      ctx.fillStyle = COLORS[ring.required];
      ctx.shadowColor = COLORS[ring.required];
      ctx.shadowBlur = 12;
      const orbRadius = switchOrbRadiusForView();
      ctx.beginPath();
      ctx.arc(x, switchY, orbRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawLiftMeter() {
    if (runtime.state !== 'playing') return;
    const ctx = runtime.ctx;
    const w = runtime.view.w;
    const h = runtime.view.h;
    const meterW = clamp(w * 0.28, 92, 142);
    const meterH = 7;
    const x = (w - meterW) / 2;
    const y = h - 34;
    const power = runtime.input.pressed ? runtime.input.power : 0;

    ctx.save();
    ctx.fillStyle = 'rgba(2,6,23,.62)';
    ctx.beginPath();
    ctx.roundRect(x - 8, y - 17, meterW + 16, 31, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(226,232,240,.78)';
    ctx.font = '800 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(runtime.input.pressed ? (power < 0.38 ? 'HOP' : power < 0.72 ? 'LIFT' : 'BOOST') : 'TAP / HOLD', w / 2, y - 6);
    ctx.fillStyle = 'rgba(148,163,184,.24)';
    ctx.beginPath();
    ctx.roundRect(x, y, meterW, meterH, 4);
    ctx.fill();
    if (power > 0) {
      const grad = ctx.createLinearGradient(x, 0, x + meterW, 0);
      grad.addColorStop(0, '#22d3ee');
      grad.addColorStop(0.58, '#facc15');
      grad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, meterW * power, meterH, 4);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawDeathFx() {
    const ctx = runtime.ctx;
    if (runtime.deathRing) {
      const ring = runtime.deathRing;
      const t = clamp(ring.age / ring.ttl, 0, 1);
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 3 * (1 - t * 0.45);
      ctx.shadowColor = ring.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, 12 + t * 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    runtime.deathParticles.forEach(particle => {
      const alpha = clamp(1 - particle.age / particle.ttl, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * (0.7 + alpha * 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawBall() {
    const ctx = runtime.ctx;
    const x = runtime.view.w / 2;
    const y = screenY(runtime.ball.worldY);
    const r = runtime.ball.radius;
    ctx.save();
    ctx.fillStyle = COLORS[runtime.ball.colorIndex];
    ctx.shadowColor = COLORS[runtime.ball.colorIndex];
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.font = `900 ${Math.max(8, r * 0.8)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('01', x, y + 0.5);
    ctx.restore();
  }

  function render(now) {
    drawBackground(now);
    runtime.rings.forEach(drawRing);
    if (runtime.state !== 'dying') drawBall();
    drawDeathFx();
    drawLiftMeter();
  }

  function frame(now) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const dt = clamp((now - (runtime.lastFrame || now)) / 1000, 0, 0.034);
    runtime.lastFrame = now;
    update(dt);
    render(now);
    runtime.raf = requestAnimationFrame(frame);
  }

  async function finishRound(fromDeath = false) {
    if (runtime.state !== 'playing' && runtime.state !== 'dying') return;
    endLift(runtime.input.pointerId, true);
    runtime.state = 'gameover';
    if (!fromDeath) tone('over');
    runtime.finalScore.textContent = String(runtime.score);
    runtime.finalBest.textContent = String(Math.max(runtime.bestVisible, runtime.score));
    runtime.finalCombo.textContent = `x${runtime.bestCombo}`;
    runtime.finalXp.textContent = '+0';
    runtime.rewardNote.className = 'color-switch-byte-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Checking reward...' : 'Practice run - account reward unavailable.';
    runtime.overPanel.hidden = false;

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: runtime.score,
        metrics: {
          passes: runtime.score,
          bestCombo: runtime.bestCombo,
          durationMs: Math.max(0, performance.now() - runtime.startedAt)
        }
      });
      const rec = result?.gameRecord || result?.gameRecords?.colorSwitchByte || {};
      runtime.bestVisible = Math.max(runtime.bestVisible, Number(rec.bestScore || 0), Number(result?.bestScore || 0));
      runtime.finalBest.textContent = String(runtime.bestVisible);
      runtime.finalXp.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;
      if (result?.loginRequired) {
        runtime.rewardNote.className = 'color-switch-byte-reward-note warn';
        runtime.rewardNote.textContent = 'Practice mode - log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.className = 'color-switch-byte-reward-note warn';
        runtime.rewardNote.textContent = 'XP could not sync. No account XP was added.';
      } else if (result?.capReached && Number(result.awardedXp || 0) === 0) {
        runtime.rewardNote.className = 'color-switch-byte-reward-note warn';
        runtime.rewardNote.textContent = 'Daily Mini-Game XP limit reached. Keep switching for records!';
      } else {
        runtime.rewardNote.className = 'color-switch-byte-reward-note success';
        runtime.rewardNote.textContent = Number(result?.awardedXp || 0) > 0
          ? `Reward added safely - Today's Game XP: ${result.todayXp}/${result.dailyCap}`
          : 'No XP tier reached this run yet.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.rewardNote.className = 'color-switch-byte-reward-note warn';
      runtime.rewardNote.textContent = 'Reward could not be processed. No XP was added.';
    }
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
    runtime.open = false;
    runtime.overlay.hidden = true;
    document.body.classList.remove('color-switch-byte-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    runtime.state = 'ready';
    runtime.round = null;
    clearDeathFx();
    resetLiftInput();
    runtime.pausePanel.hidden = true;
    runtime.overPanel.hidden = true;
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.soundBtn.innerHTML = runtime.soundEnabled ? '&#128266;' : '&#128263;';
    runtime.bestVisible = Math.max(0, Number(snap.gameRecords?.colorSwitchByte?.bestScore || snap.bestScores?.colorSwitchByte || 0));
    runtime.open = true;
    runtime.overlay.hidden = false;
    document.body.classList.add('color-switch-byte-active');
    requestAnimationFrame(() => {
      resizeCanvas();
      resetReady();
      if (!runtime.raf) runtime.raf = requestAnimationFrame(frame);
    });
  }

  window.ICT8ColorSwitchByte = Object.freeze({
    open,
    close: closeInternal,
    isOpen: () => runtime.open
  });
})();
