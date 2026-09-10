(() => {
  'use strict';

  const GAME_ID = 'code-slice';
  const GLOBAL_NAME = 'ICT8CodeSlice';
  const WORLD_W = 720;
  const WORLD_H = 1080;
  const MAX_DPR = 2;
  const TOTAL_WAVES = 5;
  const START_INTEGRITY = 3;
  const TARGETS_PER_WAVE = Object.freeze([8, 10, 12, 14, 16]);
  const BOMBS_PER_WAVE = Object.freeze([0, 1, 1, 2, 3]);
  const WAVE_DURATIONS = Object.freeze([8.2, 8.8, 9.2, 9.7, 10.2]);
  const TOTAL_TARGETS = TARGETS_PER_WAVE.reduce((sum, n) => sum + n, 0);
  const TUTORIAL_KEY = 'ict8.codeSliceTutorialSeen.v1';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  const TOKEN_TYPES = Object.freeze([
    Object.freeze({ key: 'html', label: '</>', sub: 'HTML', hue: 194, points: 10 }),
    Object.freeze({ key: 'css', label: '#', sub: 'CSS', hue: 272, points: 10 }),
    Object.freeze({ key: 'js', label: 'JS', sub: 'SCRIPT', hue: 46, points: 10 }),
    Object.freeze({ key: 'data', label: '01', sub: 'DATA', hue: 161, points: 10 }),
    Object.freeze({ key: 'bug', label: '!', sub: 'BUG', hue: 112, points: 20 })
  ]);

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
    canvas: null,
    ctx: null,
    readyPanel: null,
    failPanel: null,
    resultPanel: null,
    tutorial: null,
    statusEl: null,
    waveEl: null,
    scoreEl: null,
    comboEl: null,
    integrityEl: null,
    progressEl: null,
    finalScore: null,
    finalStars: null,
    finalAccuracy: null,
    finalCombo: null,
    finalIntegrity: null,
    finalXp: null,
    rewardNote: null,
    failTitle: null,
    failCopy: null,
    failScore: null,
    failWave: null,
    soundBtn: null,
    view: { cssW: WORLD_W, cssH: WORLD_H, dpr: 1, scale: 1, ox: 0, oy: 0, rect: null },
    raf: 0,
    lastFrame: 0,
    resizeTimer: 0,
    resizeObserver: null,
    round: null,
    seedText: '',
    rng: null,
    objects: [],
    objectPool: [],
    debris: [],
    slashTrail: [],
    sparks: [],
    pointerId: null,
    pointerLast: null,
    pointerRect: null,
    slicing: false,
    waveIndex: 0,
    waveElapsed: 0,
    waveSpawnIndex: 0,
    waveSchedule: [],
    clearingFinal: false,
    scoreRaw: 0,
    slicedTargets: 0,
    missedTargets: 0,
    combo: 0,
    maxCombo: 0,
    multiSlices: 0,
    integrity: START_INTEGRITY,
    crashHit: false,
    activePlayMs: 0,
    activeSegmentAt: 0,
    pausedFromState: '',
    finalData: null,
    rewardSubmitting: false,
    bestScore: 0,
    lastRewardDay: '',
    lastRewardXp: 0,
    soundEnabled: true,
    audioContext: null,
    statusUntil: 0,
    statusKind: '',
    statusText: '',
    screenShake: 0,
    waveIntroUntil: 0
  };

  function hashSeed(value) {
    const text = String(value || 'code-slice');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function makeRng(seedText) {
    let state = hashSeed(seedText) || 1;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function randomRange(min, max) {
    return min + (max - min) * runtime.rng();
  }

  function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
  }

  function build() {
    if (runtime.built) return;

    const overlay = document.createElement('div');
    overlay.id = 'codeSliceOverlay';
    overlay.className = 'xp-games-game-overlay code-slice-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Slice mini-game');
    overlay.innerHTML = `
      <section class="code-slice-shell">
        <canvas class="code-slice-canvas" tabindex="-1" aria-label="CODE SLICE gameplay area"></canvas>

        <header class="code-slice-topbar">
          <button type="button" data-code-slice-back aria-label="Back to Mini-Games">←</button>
          <div class="code-slice-brand">
            <strong>⚔️ CODE SLICE</strong>
            <small>Clean the Stream</small>
          </div>
          <button type="button" data-code-slice-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-code-slice-close aria-label="Close Code Slice">×</button>
        </header>

        <div class="code-slice-hud">
          <div><small>WAVE</small><strong data-code-slice-wave>1/5</strong></div>
          <div><small>SCORE</small><strong data-code-slice-score>0</strong></div>
          <div><small>COMBO</small><strong data-code-slice-combo>x0</strong></div>
          <div><small>INTEGRITY</small><strong data-code-slice-integrity>♥♥♥</strong></div>
        </div>
        <div class="code-slice-progress"><i data-code-slice-progress></i></div>
        <div class="code-slice-status" data-code-slice-status>Swipe through code tokens · avoid CRASH CORE</div>

        <div class="code-slice-tutorial" data-code-slice-tutorial hidden>
          <strong>Swipe through CODE TOKENS.</strong>
          <span>Avoid the red CRASH CORE. Miss 3 normal tokens and the stream fails.</span>
        </div>

        <div class="code-slice-panel" data-code-slice-ready>
          <div class="code-slice-card">
            <span class="code-slice-hero">⚔️</span>
            <p class="code-slice-kicker">ONE-FINGER ARCADE RUN</p>
            <h2>CODE SLICE</h2>
            <p>Clean five waves of flying code. Build combos, protect system integrity, and never slice a CRASH CORE.</p>
            <div class="code-slice-rule-row"><span>SWIPE</span><b>Slice</b><span>AVOID</span><b>💣 Crash Core</b></div>
            <button type="button" class="primary" data-code-slice-play>PLAY</button>
          </div>
        </div>

        <div class="code-slice-panel" data-code-slice-fail hidden>
          <div class="code-slice-card compact">
            <span class="code-slice-result-icon fail">×</span>
            <p class="code-slice-kicker danger">STREAM INTERRUPTED</p>
            <h2 data-code-slice-fail-title>SYSTEM FAILED</h2>
            <p data-code-slice-fail-copy>The data stream lost integrity.</p>
            <div class="code-slice-mini-stats">
              <div><small>Score</small><strong data-code-slice-fail-score>0</strong></div>
              <div><small>Wave</small><strong data-code-slice-fail-wave>1/5</strong></div>
            </div>
            <div class="code-slice-actions">
              <button type="button" class="primary" data-code-slice-retry>RETRY</button>
              <button type="button" data-code-slice-fail-hub>MINI-GAMES</button>
            </div>
          </div>
        </div>

        <div class="code-slice-panel" data-code-slice-result hidden>
          <div class="code-slice-card compact">
            <span class="code-slice-result-icon success">✓</span>
            <p class="code-slice-kicker success">STREAM CLEAN ✓</p>
            <h2>RUN COMPLETE</h2>
            <div class="code-slice-stars" data-code-slice-final-stars>★★★</div>
            <div class="code-slice-stat-grid">
              <div><small>Score</small><strong data-code-slice-final-score>0</strong></div>
              <div><small>Accuracy</small><strong data-code-slice-final-accuracy>0%</strong></div>
              <div><small>Best Combo</small><strong data-code-slice-final-combo>x0</strong></div>
              <div><small>Integrity</small><strong data-code-slice-final-integrity>0/3</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-code-slice-final-xp>+0</strong></div>
            </div>
            <p class="code-slice-reward-note" data-code-slice-reward-note>Checking reward…</p>
            <div class="code-slice-actions">
              <button type="button" class="primary" data-code-slice-again>PLAY AGAIN</button>
              <button type="button" data-code-slice-result-hub>MINI-GAMES</button>
            </div>
          </div>
        </div>
      </section>`;

    document.body.appendChild(overlay);
    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-slice-shell');
    runtime.canvas = overlay.querySelector('.code-slice-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false });
    runtime.readyPanel = overlay.querySelector('[data-code-slice-ready]');
    runtime.failPanel = overlay.querySelector('[data-code-slice-fail]');
    runtime.resultPanel = overlay.querySelector('[data-code-slice-result]');
    runtime.tutorial = overlay.querySelector('[data-code-slice-tutorial]');
    runtime.statusEl = overlay.querySelector('[data-code-slice-status]');
    runtime.waveEl = overlay.querySelector('[data-code-slice-wave]');
    runtime.scoreEl = overlay.querySelector('[data-code-slice-score]');
    runtime.comboEl = overlay.querySelector('[data-code-slice-combo]');
    runtime.integrityEl = overlay.querySelector('[data-code-slice-integrity]');
    runtime.progressEl = overlay.querySelector('[data-code-slice-progress]');
    runtime.finalScore = overlay.querySelector('[data-code-slice-final-score]');
    runtime.finalStars = overlay.querySelector('[data-code-slice-final-stars]');
    runtime.finalAccuracy = overlay.querySelector('[data-code-slice-final-accuracy]');
    runtime.finalCombo = overlay.querySelector('[data-code-slice-final-combo]');
    runtime.finalIntegrity = overlay.querySelector('[data-code-slice-final-integrity]');
    runtime.finalXp = overlay.querySelector('[data-code-slice-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-code-slice-reward-note]');
    runtime.failTitle = overlay.querySelector('[data-code-slice-fail-title]');
    runtime.failCopy = overlay.querySelector('[data-code-slice-fail-copy]');
    runtime.failScore = overlay.querySelector('[data-code-slice-fail-score]');
    runtime.failWave = overlay.querySelector('[data-code-slice-fail-wave]');
    runtime.soundBtn = overlay.querySelector('[data-code-slice-sound]');

    overlay.querySelector('[data-code-slice-play]').addEventListener('click', startRun);
    overlay.querySelector('[data-code-slice-retry]').addEventListener('click', startRun);
    overlay.querySelector('[data-code-slice-again]').addEventListener('click', startRun);
    overlay.querySelector('[data-code-slice-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-slice-fail-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-slice-result-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-slice-close]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);

    runtime.canvas.addEventListener('pointerdown', onPointerDown);
    runtime.canvas.addEventListener('pointermove', onPointerMove);
    runtime.canvas.addEventListener('pointerup', onPointerUp);
    runtime.canvas.addEventListener('pointercancel', onPointerCancel);
    runtime.canvas.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('visibilitychange', () => {
      if (!runtime.open) return;
      if (document.hidden) pauseForInterruption();
      else resumeFromInterruption();
    });
    window.addEventListener('blur', () => {
      if (runtime.open) pauseForInterruption();
    });
    window.addEventListener('focus', () => {
      if (runtime.open && !document.hidden) resumeFromInterruption();
    });
    window.addEventListener('resize', queueResize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(queueResize, 100), { passive: true });
    if ('ResizeObserver' in window) {
      runtime.resizeObserver = new ResizeObserver(queueResize);
      runtime.resizeObserver.observe(runtime.shell);
    }

    runtime.built = true;
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    try { runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); } catch (_) {}
  }

  function audio() {
    if (!runtime.soundEnabled) return null;
    try {
      if (!runtime.audioContext) runtime.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
      return runtime.audioContext;
    } catch (_) { return null; }
  }

  function tone(kind) {
    const ctx = audio();
    if (!ctx) return;
    const table = {
      slice: [720, 1180, .05, .035],
      combo: [520, 920, .07, .04],
      miss: [210, 120, .10, .035],
      crash: [150, 52, .22, .055],
      wave: [420, 690, .08, .035],
      win: [540, 1080, .18, .055]
    };
    const spec = table[kind] || table.slice;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = kind === 'crash' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(spec[0], now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, spec[1]), now + spec[2]);
    gain.gain.setValueAtTime(spec[3], now);
    gain.gain.exponentialRampToValueAtTime(.001, now + spec[2]);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + spec[2] + .02);
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
  }

  function queueResize() {
    if (!runtime.open) return;
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = setTimeout(resizeCanvas, 60);
  }

  function resizeCanvas() {
    if (!runtime.open || !runtime.ctx) return;
    const rect = runtime.canvas.getBoundingClientRect();
    const cssW = Math.max(280, rect.width || WORLD_W);
    const cssH = Math.max(420, rect.height || WORLD_H);
    const dpr = clamp(Number(window.devicePixelRatio || 1), 1, MAX_DPR);
    runtime.canvas.width = Math.round(cssW * dpr);
    runtime.canvas.height = Math.round(cssH * dpr);
    runtime.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.min(cssW / WORLD_W, cssH / WORLD_H);
    runtime.view = {
      cssW,
      cssH,
      dpr,
      scale,
      ox: (cssW - WORLD_W * scale) / 2,
      oy: (cssH - WORLD_H * scale) / 2,
      rect
    };
    if (!runtime.raf && runtime.open && runtime.state !== 'playing' && runtime.state !== 'clearing') {
      requestAnimationFrame(now => render(now));
    }
  }

  function screenToWorld(clientX, clientY) {
    const rect = runtime.pointerRect || runtime.view.rect || runtime.canvas.getBoundingClientRect();
    const x = (clientX - rect.left - runtime.view.ox) / Math.max(.001, runtime.view.scale);
    const y = (clientY - rect.top - runtime.view.oy) / Math.max(.001, runtime.view.scale);
    return { x: clamp(x, -70, WORLD_W + 70), y: clamp(y, -70, WORLD_H + 70) };
  }

  function setStatus(text, kind = '', ms = 900) {
    runtime.statusText = String(text || '');
    runtime.statusKind = kind;
    runtime.statusUntil = performance.now() + Math.max(0, ms);
    renderStatus();
  }

  function renderStatus() {
    if (!runtime.statusEl) return;
    runtime.statusEl.textContent = runtime.statusText || 'Swipe through code tokens · avoid CRASH CORE';
    runtime.statusEl.dataset.kind = runtime.statusKind || '';
  }

  function updateHud() {
    runtime.waveEl.textContent = `${Math.min(TOTAL_WAVES, runtime.waveIndex + 1)}/${TOTAL_WAVES}`;
    runtime.scoreEl.textContent = String(runtime.scoreRaw);
    runtime.comboEl.textContent = `x${runtime.combo}`;
    runtime.integrityEl.textContent = `${'♥'.repeat(runtime.integrity)}${'♡'.repeat(Math.max(0, START_INTEGRITY - runtime.integrity))}`;
    const totalBefore = WAVE_DURATIONS.slice(0, runtime.waveIndex).reduce((sum, n) => sum + n, 0);
    const totalDuration = WAVE_DURATIONS.reduce((sum, n) => sum + n, 0);
    const elapsed = totalBefore + clamp(runtime.waveElapsed, 0, WAVE_DURATIONS[runtime.waveIndex] || 0);
    runtime.progressEl.style.transform = `scaleX(${clamp(elapsed / totalDuration, 0, 1)})`;
  }

  function buildWaveSchedule(index) {
    const targetCount = TARGETS_PER_WAVE[index];
    const bombCount = BOMBS_PER_WAVE[index];
    const duration = WAVE_DURATIONS[index];
    const total = targetCount + bombCount;
    const events = [];
    let goodMade = 0;
    let bombsMade = 0;

    for (let i = 0; i < total; i += 1) {
      const progress = (i + .55) / total;
      const jitter = randomRange(-.12, .12) * (duration / total);
      const time = clamp(.55 + progress * (duration - 1.3) + jitter, .4, duration - .55);
      const remainingSlots = total - i;
      const remainingBombs = bombCount - bombsMade;
      let bomb = false;
      if (remainingBombs > 0) {
        const mustBomb = remainingBombs >= remainingSlots;
        const chance = remainingBombs / remainingSlots;
        bomb = mustBomb || (runtime.rng() < chance && i > 1);
      }
      if (bomb) bombsMade += 1;
      else goodMade += 1;
      events.push({ time, bomb, ordinal: i });
    }

    while (goodMade < targetCount) {
      const replace = events.findIndex(event => event.bomb);
      if (replace < 0) break;
      events[replace].bomb = false;
      goodMade += 1;
      bombsMade -= 1;
    }
    while (bombsMade < bombCount) {
      const replace = events.findIndex((event, i) => !event.bomb && i > 1);
      if (replace < 0) break;
      events[replace].bomb = true;
      bombsMade += 1;
      goodMade -= 1;
    }
    events.sort((a, b) => a.time - b.time);
    return events;
  }

  function resetTransient() {
    runtime.objects.forEach(recycleObject);
    runtime.objects.length = 0;
    runtime.debris.length = 0;
    runtime.slashTrail.length = 0;
    runtime.sparks.length = 0;
    runtime.pointerId = null;
    runtime.pointerLast = null;
    runtime.pointerRect = null;
    runtime.slicing = false;
    runtime.screenShake = 0;
  }

  function startRun() {
    if (!runtime.open) return;
    if (runtime.round?.sessionId && !runtime.rewardSubmitting) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }

    resetTransient();
    runtime.scoreRaw = 0;
    runtime.slicedTargets = 0;
    runtime.missedTargets = 0;
    runtime.combo = 0;
    runtime.maxCombo = 0;
    runtime.multiSlices = 0;
    runtime.integrity = START_INTEGRITY;
    runtime.crashHit = false;
    runtime.waveIndex = 0;
    runtime.waveElapsed = 0;
    runtime.waveSpawnIndex = 0;
    runtime.clearingFinal = false;
    runtime.finalData = null;
    runtime.rewardSubmitting = false;
    runtime.activePlayMs = 0;
    runtime.activeSegmentAt = performance.now();
    runtime.pausedFromState = '';

    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    runtime.seedText = String(runtime.round?.sessionId || `code-slice-${Date.now()}-${Math.random()}`);
    runtime.rng = makeRng(runtime.seedText);
    runtime.waveSchedule = buildWaveSchedule(0);
    runtime.state = 'playing';
    runtime.readyPanel.hidden = true;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.tutorial.hidden = true;
    runtime.waveIntroUntil = performance.now() + 900;
    setStatus('WAVE 1 · CLEAN THE STREAM', 'active', 950);
    updateHud();
    tone('wave');
    startLoop();
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}

    let seen = false;
    try { seen = localStorage.getItem(TUTORIAL_KEY) === '1'; } catch (_) {}
    if (!seen) {
      runtime.tutorial.hidden = false;
      setTimeout(() => {
        if (!runtime.open) return;
        runtime.tutorial.hidden = true;
        try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch (_) {}
      }, 3200);
    }
  }

  function markActiveSegment(dt) {
    if (runtime.state === 'playing' || runtime.state === 'clearing') {
      runtime.activePlayMs += dt * 1000;
    }
  }

  function startLoop() {
    if (runtime.raf) return;
    runtime.lastFrame = performance.now();
    runtime.raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const dt = clamp((now - (runtime.lastFrame || now)) / 1000, 0, .034);
    runtime.lastFrame = now;
    update(dt, now);
    render(now);
    if (runtime.open && (runtime.state === 'playing' || runtime.state === 'clearing')) {
      runtime.raf = requestAnimationFrame(frame);
    }
  }

  function update(dt, now) {
    if (runtime.state === 'playing' || runtime.state === 'clearing') {
      markActiveSegment(dt);
      updateGame(dt, now);
    }
    updateVisualEffects(dt);
    if (runtime.statusUntil && now >= runtime.statusUntil && runtime.state !== 'failed' && runtime.state !== 'result') {
      runtime.statusUntil = 0;
      runtime.statusText = runtime.state === 'clearing' ? 'CLEARING LAST PACKETS…' : 'Swipe through code tokens · avoid CRASH CORE';
      runtime.statusKind = '';
      renderStatus();
    }
    runtime.screenShake = Math.max(0, runtime.screenShake - dt * 4.5);
  }

  function updateGame(dt) {
    if (runtime.state === 'playing') {
      runtime.waveElapsed += dt;
      const schedule = runtime.waveSchedule;
      while (runtime.waveSpawnIndex < schedule.length && schedule[runtime.waveSpawnIndex].time <= runtime.waveElapsed) {
        spawnFromEvent(schedule[runtime.waveSpawnIndex]);
        runtime.waveSpawnIndex += 1;
      }

      if (runtime.waveElapsed >= WAVE_DURATIONS[runtime.waveIndex]) {
        if (runtime.waveIndex < TOTAL_WAVES - 1) nextWave();
        else {
          runtime.state = 'clearing';
          runtime.clearingFinal = true;
          setStatus('FINAL WAVE · CLEARING LAST PACKETS…', 'active', 1400);
        }
      }
    }

    updateObjects(dt);
    if (runtime.state === 'clearing' && runtime.objects.length === 0) completeRun();
    updateHud();
  }

  function nextWave() {
    runtime.waveIndex += 1;
    runtime.waveElapsed = 0;
    runtime.waveSpawnIndex = 0;
    runtime.waveSchedule = buildWaveSchedule(runtime.waveIndex);
    runtime.waveIntroUntil = performance.now() + 760;
    setStatus(`WAVE ${runtime.waveIndex + 1} · SPEED UP`, 'active', 850);
    tone('wave');
  }

  function takeObject() {
    return runtime.objectPool.pop() || {};
  }

  function recycleObject(obj) {
    if (!obj) return;
    obj.active = false;
    if (runtime.objectPool.length < 24) runtime.objectPool.push(obj);
  }

  function spawnFromEvent(event) {
    const wave = runtime.waveIndex;
    const obj = takeObject();
    const bomb = event.bomb === true;
    const token = bomb ? null : TOKEN_TYPES[randomInt(0, TOKEN_TYPES.length - 1)];
    const startX = randomRange(80, WORLD_W - 80);
    const centerBias = (WORLD_W / 2 - startX) * randomRange(.10, .28);
    const baseSpeed = 850 + wave * 30;
    const arcBoost = randomRange(-65, 75);
    const vx = clamp(centerBias + randomRange(-135, 135), -210, 210);
    const radius = bomb ? 30 : randomRange(26, 31);

    Object.assign(obj, {
      active: true,
      bomb,
      token,
      x: startX,
      y: WORLD_H + radius + 10,
      vx,
      vy: -(baseSpeed + arcBoost),
      gravity: 610 + wave * 9,
      r: radius,
      rot: randomRange(-.45, .45),
      vr: randomRange(-1.8, 1.8),
      entered: false,
      sliced: false,
      missed: false,
      bornWave: wave,
      age: 0,
      pulse: bomb ? randomRange(0, Math.PI * 2) : 0
    });
    runtime.objects.push(obj);
  }

  function updateObjects(dt) {
    for (let i = runtime.objects.length - 1; i >= 0; i -= 1) {
      const obj = runtime.objects[i];
      obj.age += dt;
      obj.vy += obj.gravity * dt;
      obj.x += obj.vx * dt;
      obj.y += obj.vy * dt;
      obj.rot += obj.vr * dt;
      obj.pulse += dt * 4;

      if (obj.x < obj.r + 6 && obj.vx < 0) {
        obj.x = obj.r + 6;
        obj.vx *= -.78;
      } else if (obj.x > WORLD_W - obj.r - 6 && obj.vx > 0) {
        obj.x = WORLD_W - obj.r - 6;
        obj.vx *= -.78;
      }
      if (obj.y < WORLD_H - 30) obj.entered = true;

      if (obj.entered && obj.y > WORLD_H + obj.r + 35 && obj.vy > 0) {
        runtime.objects.splice(i, 1);
        if (!obj.bomb && !obj.sliced) registerMiss();
        recycleObject(obj);
      }
    }
  }

  function registerMiss() {
    if (runtime.state !== 'playing' && runtime.state !== 'clearing') return;
    runtime.missedTargets += 1;
    runtime.combo = 0;
    runtime.integrity = Math.max(0, runtime.integrity - 1);
    runtime.screenShake = Math.max(runtime.screenShake, .18);
    tone('miss');
    vibrate(18);
    setStatus('PACKET MISSED · INTEGRITY -1', 'danger', 720);
    if (runtime.integrity <= 0) failRun('integrity');
  }

  function onPointerDown(event) {
    if (!runtime.open || (runtime.state !== 'playing' && runtime.state !== 'clearing')) return;
    if (runtime.pointerId != null) return;
    runtime.pointerId = event.pointerId;
    runtime.pointerRect = runtime.canvas.getBoundingClientRect();
    runtime.pointerLast = screenToWorld(event.clientX, event.clientY);
    runtime.slicing = true;
    try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!runtime.open || runtime.pointerId !== event.pointerId || !runtime.slicing) return;
    event.preventDefault();
    const coalesced = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : null;
    const samples = coalesced && coalesced.length ? coalesced : [event];
    let from = runtime.pointerLast;
    let slicedThisMove = 0;

    for (const sample of samples) {
      const to = screenToWorld(sample.clientX, sample.clientY);
      if (!from) { from = to; continue; }
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      if (distance < 1.2) continue;
      addSlashSegment(from, to);
      const hits = sliceAlongSegment(from, to);
      slicedThisMove += hits;
      from = to;
      if (runtime.state === 'failed') break;
    }
    runtime.pointerLast = from;
    if (slicedThisMove >= 2) runtime.multiSlices += 1;
  }

  function onPointerUp(event) {
    if (runtime.pointerId !== event.pointerId) return;
    event.preventDefault();
    try { runtime.canvas.releasePointerCapture(event.pointerId); } catch (_) {}
    runtime.pointerId = null;
    runtime.pointerLast = null;
    runtime.pointerRect = null;
    runtime.slicing = false;
  }

  function onPointerCancel(event) {
    if (runtime.pointerId !== event.pointerId) return;
    runtime.pointerId = null;
    runtime.pointerLast = null;
    runtime.pointerRect = null;
    runtime.slicing = false;
  }

  function addSlashSegment(a, b) {
    runtime.slashTrail.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, age: 0, ttl: .18 });
    if (runtime.slashTrail.length > 18) runtime.slashTrail.splice(0, runtime.slashTrail.length - 18);
  }

  function pointSegmentDistance(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const len2 = abx * abx + aby * aby;
    if (len2 <= .0001) return Math.hypot(px - ax, py - ay);
    const t = clamp(((px - ax) * abx + (py - ay) * aby) / len2, 0, 1);
    const x = ax + abx * t;
    const y = ay + aby * t;
    return Math.hypot(px - x, py - y);
  }

  function sliceAlongSegment(a, b) {
    let hits = 0;
    for (let i = runtime.objects.length - 1; i >= 0; i -= 1) {
      const obj = runtime.objects[i];
      if (!obj.active || obj.sliced || !obj.entered) continue;
      if (pointSegmentDistance(obj.x, obj.y, a.x, a.y, b.x, b.y) > obj.r + 8) continue;
      obj.sliced = true;
      if (obj.bomb) {
        runtime.crashHit = true;
        addCrashBurst(obj.x, obj.y);
        failRun('crash');
        hits += 1;
        break;
      }
      runtime.objects.splice(i, 1);
      registerSlice(obj);
      recycleObject(obj);
      hits += 1;
    }
    return hits;
  }

  function registerSlice(obj) {
    const base = Number(obj.token?.points || 10);
    runtime.slicedTargets += 1;
    runtime.combo += 1;
    runtime.maxCombo = Math.max(runtime.maxCombo, runtime.combo);
    const comboBonus = Math.min(18, Math.floor(runtime.combo / 5) * 2);
    runtime.scoreRaw += base + comboBonus;
    addSplitDebris(obj);
    addSparks(obj.x, obj.y, obj.token?.hue || 190, 5);
    tone(runtime.combo > 0 && runtime.combo % 10 === 0 ? 'combo' : 'slice');
    if (runtime.combo > 0 && runtime.combo % 10 === 0) {
      setStatus(`COMBO x${runtime.combo}!`, 'good', 650);
      vibrate([6, 18, 6]);
    } else {
      vibrate(5);
    }
  }

  function addSplitDebris(obj) {
    const hue = obj.token?.hue || 190;
    for (let side = -1; side <= 1; side += 2) {
      runtime.debris.push({
        x: obj.x + side * 3,
        y: obj.y,
        vx: obj.vx * .45 + side * randomRange(75, 135),
        vy: obj.vy * .22 - randomRange(25, 80),
        gravity: 720,
        rot: obj.rot,
        vr: side * randomRange(3, 6),
        r: obj.r,
        side,
        hue,
        label: obj.token?.label || '',
        age: 0,
        ttl: .62
      });
    }
    if (runtime.debris.length > 32) runtime.debris.splice(0, runtime.debris.length - 32);
  }

  function addSparks(x, y, hue, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(55, 150);
      runtime.sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        hue,
        age: 0,
        ttl: randomRange(.2, .38),
        size: randomRange(2, 4)
      });
    }
    if (runtime.sparks.length > 45) runtime.sparks.splice(0, runtime.sparks.length - 45);
  }

  function addCrashBurst(x, y) {
    runtime.screenShake = .8;
    addSparks(x, y, 0, 22);
  }

  function updateVisualEffects(dt) {
    runtime.slashTrail = runtime.slashTrail.filter(line => (line.age += dt) < line.ttl);
    runtime.debris = runtime.debris.filter(item => {
      item.age += dt;
      item.vy += item.gravity * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.rot += item.vr * dt;
      return item.age < item.ttl;
    });
    runtime.sparks = runtime.sparks.filter(item => {
      item.age += dt;
      item.vy += 190 * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      return item.age < item.ttl;
    });
  }

  function pauseForInterruption() {
    if (!runtime.open) return;
    if (runtime.state !== 'playing' && runtime.state !== 'clearing') return;
    runtime.pausedFromState = runtime.state;
    runtime.state = 'paused';
    runtime.pointerId = null;
    runtime.pointerLast = null;
    runtime.slicing = false;
    setStatus('PAUSED', 'active', 0);
  }

  function resumeFromInterruption() {
    if (!runtime.open || runtime.state !== 'paused') return;
    runtime.state = runtime.pausedFromState || 'playing';
    runtime.pausedFromState = '';
    runtime.lastFrame = performance.now();
    setStatus('STREAM RESUMED', 'good', 650);
    startLoop();
  }

  function failRun(reason) {
    if (runtime.state === 'failed' || runtime.state === 'result') return;
    runtime.state = 'failed';
    runtime.crashHit = reason === 'crash' || runtime.crashHit;
    runtime.pointerId = null;
    runtime.pointerLast = null;
    runtime.slicing = false;
    runtime.tutorial.hidden = true;
    if (runtime.round?.sessionId && !runtime.rewardSubmitting) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.round = null;
    tone(reason === 'crash' ? 'crash' : 'miss');
    vibrate(reason === 'crash' ? [55, 35, 70] : 45);

    runtime.failTitle.textContent = reason === 'crash' ? 'CRASH CORE SLICED!' : 'SYSTEM INTEGRITY LOST';
    runtime.failCopy.textContent = reason === 'crash'
      ? 'The red CRASH CORE was hit. Keep your swipe controlled.'
      : 'Three code packets escaped the stream.';
    runtime.failScore.textContent = String(runtime.scoreRaw);
    runtime.failWave.textContent = `${Math.min(TOTAL_WAVES, runtime.waveIndex + 1)}/${TOTAL_WAVES}`;
    runtime.failPanel.hidden = false;
    setStatus(reason === 'crash' ? 'SYSTEM CRASH!' : 'STREAM FAILED', 'danger', 0);
  }

  function scoreRun() {
    const accuracy = TOTAL_TARGETS > 0 ? clamp(runtime.slicedTargets / TOTAL_TARGETS, 0, 1) : 0;
    const accuracyBonus = Math.round(accuracy * 260);
    const comboBonus = Math.round(clamp(runtime.maxCombo / 35, 0, 1) * 220);
    const integrityBonus = Math.round(clamp(runtime.integrity / START_INTEGRITY, 0, 1) * 120);
    const score = clamp(400 + accuracyBonus + comboBonus + integrityBonus, 0, 1000);
    const stars = score >= 900 ? 3 : score >= 760 ? 2 : 1;
    return {
      score,
      stars,
      accuracy,
      accuracyPercent: Math.round(accuracy * 1000) / 10,
      accuracyBonus,
      comboBonus,
      integrityBonus
    };
  }

  function rewardTier(summary) {
    if (!summary || runtime.crashHit || runtime.integrity <= 0) return 0;
    if (summary.score >= 950 && summary.accuracyPercent >= 99.5 && runtime.maxCombo >= 35 && runtime.integrity === 3 && runtime.multiSlices >= 2) return 3;
    if (summary.score >= 870 && summary.accuracyPercent >= 98 && runtime.maxCombo >= 20) return 2;
    if (summary.score >= 700) return 1;
    return 0;
  }

  async function completeRun() {
    if (runtime.state === 'result' || runtime.rewardSubmitting || runtime.integrity <= 0) return;
    runtime.state = 'result';
    runtime.tutorial.hidden = true;
    tone('win');
    vibrate([12, 30, 16]);
    const summary = scoreRun();
    runtime.finalData = summary;
    runtime.bestScore = Math.max(runtime.bestScore, summary.score);
    runtime.finalScore.textContent = String(summary.score);
    runtime.finalStars.textContent = `${'★'.repeat(summary.stars)}${'☆'.repeat(3 - summary.stars)}`;
    runtime.finalAccuracy.textContent = `${summary.accuracyPercent}%`;
    runtime.finalCombo.textContent = `x${runtime.maxCombo}`;
    runtime.finalIntegrity.textContent = `${runtime.integrity}/${START_INTEGRITY}`;
    runtime.finalXp.textContent = '+0';
    runtime.rewardNote.className = 'code-slice-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Checking reward…' : 'Practice run — log in to earn account XP.';
    runtime.resultPanel.hidden = false;
    setStatus('STREAM CLEAN ✓', 'good', 0);

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;

    const snap = runtime.bridge?.getSnapshot?.() || {};
    const claimedTierToday = snap.dayKey && runtime.lastRewardDay === snap.dayKey
      ? clamp(Number(runtime.lastRewardXp || 0), 0, 3)
      : 0;
    const potential = rewardTier(summary);
    if (potential <= claimedTierToday) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
      runtime.round = null;
      runtime.rewardNote.className = 'code-slice-reward-note warn';
      runtime.rewardNote.textContent = claimedTierToday >= 3
        ? 'Master slice reward already secured today. Replay for your best score.'
        : `Today’s reward tier is ${claimedTierToday}/3 XP. Beat it to earn only the difference.`;
      return;
    }

    runtime.rewardSubmitting = true;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: summary.score,
        metrics: {
          completedRun: true,
          wavesCompleted: TOTAL_WAVES,
          totalTargets: TOTAL_TARGETS,
          slicedTargets: runtime.slicedTargets,
          missedTargets: runtime.missedTargets,
          maxCombo: runtime.maxCombo,
          multiSlices: runtime.multiSlices,
          integrityRemaining: runtime.integrity,
          crashHit: runtime.crashHit,
          activeTimeMs: Math.round(runtime.activePlayMs)
        }
      });
      runtime.round = null;
      const record = result?.gameRecord || result?.gameRecords?.codeSlice || {};
      runtime.bestScore = Math.max(runtime.bestScore, Number(record.bestRunScore || record.bestScore || 0));
      runtime.lastRewardDay = String(record.lastRewardDay || runtime.lastRewardDay || '');
      runtime.lastRewardXp = Math.max(runtime.lastRewardXp, Number(record.lastRewardXp || 0));
      runtime.finalScore.textContent = String(Math.max(summary.score, Number(result?.verifiedScore || 0)));
      runtime.finalXp.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;

      if (result?.loginRequired) {
        runtime.rewardNote.className = 'code-slice-reward-note warn';
        runtime.rewardNote.textContent = 'Practice mode — log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.className = 'code-slice-reward-note warn';
        runtime.rewardNote.textContent = 'XP could not sync. No account XP was added.';
      } else if (result?.replayNoXp) {
        runtime.rewardNote.className = 'code-slice-reward-note warn';
        runtime.rewardNote.textContent = 'No higher CODE SLICE reward tier this time. Best score still counts.';
      } else if (result?.capReached && Number(result?.awardedXp || 0) === 0) {
        runtime.rewardNote.className = 'code-slice-reward-note warn';
        runtime.rewardNote.textContent = 'Daily Mini-Game XP limit reached. Replay for records only.';
      } else if (Number(result?.awardedXp || 0) > 0) {
        runtime.rewardNote.className = 'code-slice-reward-note success';
        runtime.rewardNote.textContent = `Reward added safely · Today’s Game XP: ${result.todayXp}/${result.dailyCap}`;
      } else {
        runtime.rewardNote.className = 'code-slice-reward-note';
        runtime.rewardNote.textContent = 'Run complete, but this score did not reach an XP tier.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.rewardNote.className = 'code-slice-reward-note warn';
      runtime.rewardNote.textContent = 'Reward could not be processed. No XP was added.';
    } finally {
      runtime.rewardSubmitting = false;
    }
  }

  function withWorldTransform(drawFn) {
    const { ctx, view } = runtime;
    ctx.save();
    ctx.translate(view.ox, view.oy);
    ctx.scale(view.scale, view.scale);
    drawFn(ctx);
    ctx.restore();
  }

  function render(now) {
    if (!runtime.ctx) return;
    const { ctx, view } = runtime;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, runtime.canvas.width / view.dpr, runtime.canvas.height / view.dpr);
    ctx.restore();
    withWorldTransform(worldCtx => drawWorld(worldCtx, now));
  }

  function drawWorld(ctx, now) {
    const shake = runtime.screenShake > 0 ? runtime.screenShake * 7 : 0;
    ctx.save();
    if (shake > .1) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake * .6);
    drawBackground(ctx, now);
    drawObjects(ctx, now);
    drawDebris(ctx);
    drawSparks(ctx);
    drawSlashTrail(ctx);
    if (runtime.waveIntroUntil > now && (runtime.state === 'playing' || runtime.state === 'clearing')) drawWaveIntro(ctx, now);
    ctx.restore();
  }

  function drawBackground(ctx, now) {
    const gradient = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    gradient.addColorStop(0, '#06162d');
    gradient.addColorStop(.56, '#071021');
    gradient.addColorStop(1, '#020611');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    ctx.save();
    ctx.globalAlpha = .11;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    const step = 46;
    const yOffset = (now * .018) % step;
    for (let x = 0; x <= WORLD_W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x, WORLD_H); ctx.stroke();
    }
    for (let y = -step + yOffset; y <= WORLD_H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_W, y); ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(14,165,233,.035)';
    for (let i = 0; i < 9; i += 1) {
      const w = 46 + (i % 3) * 16;
      const h = 70 + ((i * 41) % 130);
      const x = i * 88 - 18;
      const y = WORLD_H - h - 52;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(56,189,248,.11)';
      for (let yy = y + 17; yy < WORLD_H - 66; yy += 25) {
        ctx.fillRect(x + 9, yy, 5, 7);
        if (w > 58) ctx.fillRect(x + 25, yy, 5, 7);
      }
      ctx.fillStyle = 'rgba(14,165,233,.035)';
    }

    const scanY = ((now * .12) % (WORLD_H + 180)) - 90;
    const scan = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
    scan.addColorStop(0, 'rgba(34,211,238,0)');
    scan.addColorStop(.5, 'rgba(34,211,238,.035)');
    scan.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.fillStyle = scan;
    ctx.fillRect(0, scanY - 50, WORLD_W, 100);
  }

  function drawObjects(ctx, now) {
    runtime.objects.forEach(obj => {
      if (obj.bomb) drawCrashCore(ctx, obj, now);
      else drawToken(ctx, obj);
    });
  }

  function drawToken(ctx, obj) {
    const hue = obj.token?.hue || 190;
    const r = obj.r;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rot);
    ctx.shadowColor = `hsla(${hue},90%,62%,.34)`;
    ctx.shadowBlur = 14;
    const grad = ctx.createRadialGradient(-r * .32, -r * .38, 3, 0, 0, r);
    grad.addColorStop(0, `hsl(${hue} 92% 66%)`);
    grad.addColorStop(.72, `hsl(${hue} 72% 43%)`);
    grad.addColorStop(1, `hsl(${hue} 68% 30%)`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.28)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = `950 ${obj.token?.key === 'html' ? 17 : 19}px system-ui`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(obj.token?.label || '01', 0, -2);
    ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.font = '850 7px system-ui';
    ctx.fillText(obj.token?.sub || 'CODE', 0, r * .48);
    ctx.restore();
  }

  function drawCrashCore(ctx, obj, now) {
    const r = obj.r;
    const pulse = .5 + .5 * Math.sin(obj.pulse + now * .008);
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rot);
    ctx.shadowColor = `rgba(248,113,113,${.24 + pulse * .18})`;
    ctx.shadowBlur = 12 + pulse * 5;
    const grad = ctx.createRadialGradient(-8, -10, 2, 0, 0, r);
    grad.addColorStop(0, '#fb7185');
    grad.addColorStop(.5, '#b91c1c');
    grad.addColorStop(1, '#450a0a');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(254,202,202,.52)';
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, r - 3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fff1f2';
    ctx.font = '950 18px system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, -3);
    ctx.font = '900 7px system-ui';
    ctx.fillStyle = '#fecdd3';
    ctx.fillText('CRASH', 0, 13);
    ctx.restore();
  }

  function drawDebris(ctx) {
    runtime.debris.forEach(item => {
      const alpha = 1 - item.age / item.ttl;
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);
      ctx.beginPath();
      if (item.side < 0) ctx.arc(0, 0, item.r, Math.PI / 2, Math.PI * 1.5);
      else ctx.arc(0, 0, item.r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = `hsl(${item.hue} 75% 48%)`;
      ctx.fill();
      ctx.restore();
    });
  }

  function drawSparks(ctx) {
    runtime.sparks.forEach(item => {
      const alpha = 1 - item.age / item.ttl;
      if (alpha <= 0) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `hsl(${item.hue} 95% 70%)`;
      ctx.fillRect(item.x - item.size / 2, item.y - item.size / 2, item.size, item.size);
    });
    ctx.globalAlpha = 1;
  }

  function drawSlashTrail(ctx) {
    if (!runtime.slashTrail.length) return;
    ctx.save();
    ctx.lineCap = 'round';
    runtime.slashTrail.forEach((line, index) => {
      const life = 1 - line.age / line.ttl;
      const alpha = clamp(life, 0, 1);
      ctx.strokeStyle = `rgba(165,243,252,${alpha * .82})`;
      ctx.lineWidth = 5 + alpha * 3;
      ctx.shadowColor = 'rgba(34,211,238,.7)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(line.ax, line.ay);
      ctx.lineTo(line.bx, line.by);
      ctx.stroke();
      if (index === runtime.slashTrail.length - 1) {
        ctx.fillStyle = `rgba(240,253,250,${alpha})`;
        ctx.beginPath(); ctx.arc(line.bx, line.by, 4.5, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.restore();
  }

  function drawWaveIntro(ctx, now) {
    const remaining = clamp((runtime.waveIntroUntil - now) / 760, 0, 1);
    const alpha = Math.sin((1 - remaining) * Math.PI) * .9;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '950 38px system-ui';
    ctx.fillText(`WAVE ${runtime.waveIndex + 1}`, WORLD_W / 2, 365);
    ctx.fillStyle = '#67e8f9';
    ctx.font = '900 14px system-ui';
    const labels = ['WARM UP', 'STAY SHARP', 'FASTER STREAM', 'DANGER MIX', 'FINAL WAVE'];
    ctx.fillText(labels[runtime.waveIndex] || 'CLEAN IT', WORLD_W / 2, 394);
    ctx.restore();
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
    document.body.classList.remove('code-slice-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    clearTimeout(runtime.resizeTimer);
    resetTransient();
    runtime.readyPanel.hidden = false;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.tutorial.hidden = true;
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    const record = snap.gameRecords?.codeSlice || {};
    runtime.bestScore = Math.max(0, Number(record.bestRunScore || record.bestScore || 0));
    runtime.lastRewardDay = String(record.lastRewardDay || '');
    runtime.lastRewardXp = clamp(Number(record.lastRewardXp || 0), 0, 3);
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.open = true;
    runtime.state = 'ready';
    runtime.overlay.hidden = false;
    document.body.classList.add('code-slice-active');
    runtime.readyPanel.hidden = false;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.tutorial.hidden = true;
    runtime.statusText = 'Swipe through code tokens · avoid CRASH CORE';
    runtime.statusKind = '';
    renderStatus();
    requestAnimationFrame(now => {
      resizeCanvas();
      updateHud();
      render(now);
    });
  }

  window[GLOBAL_NAME] = Object.freeze({
    open,
    close: closeInternal,
    isOpen: () => runtime.open
  });
})();
