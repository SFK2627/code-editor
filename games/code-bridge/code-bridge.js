(() => {
  'use strict';

  const GAME_ID = 'code-bridge';
  const MAX_DPR = 2;
  const WORLD_W = 720;
  const WORLD_H = 1080;
  const PLATFORM_Y = 820;
  const PLATFORM_H = 300;
  const LEFT_X = 72;
  const START_WIDTH = 154;
  const STICK_THICKNESS = 12;
  const BYTE_R = 24;
  const MAX_STICK = 470;
  const TOTAL_LINKS = 10;
  const TUTORIAL_KEY = 'ict8.codeBridgeTutorialSeen.v1';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeInCubic = t => Math.pow(clamp(t, 0, 1), 3);
  const easeInOutCubic = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const STEP_BANDS = Object.freeze([
    { gap: [108, 146], width: [150, 182], speed: 238 },
    { gap: [124, 170], width: [142, 174], speed: 242 },
    { gap: [142, 195], width: [134, 164], speed: 246 },
    { gap: [158, 218], width: [126, 154], speed: 250 },
    { gap: [176, 242], width: [118, 148], speed: 254 },
    { gap: [195, 265], width: [110, 138], speed: 258 },
    { gap: [214, 288], width: [102, 130], speed: 262 },
    { gap: [232, 312], width: [94, 122], speed: 266 },
    { gap: [252, 330], width: [88, 114], speed: 270 },
    { gap: [272, 350], width: [82, 106], speed: 274 }
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
    linksEl: null,
    perfectEl: null,
    bestEl: null,
    rewardBadge: null,
    finalScore: null,
    finalStars: null,
    finalPerfects: null,
    finalAccuracy: null,
    finalXp: null,
    rewardNote: null,
    soundBtn: null,
    view: { cssW: WORLD_W, cssH: WORLD_H, dpr: 1, scale: 1, ox: 0, oy: 0 },
    raf: 0,
    lastFrame: 0,
    resizeTimer: 0,
    resizeObserver: null,
    round: null,
    runSpecs: [],
    current: null,
    next: null,
    bridgeStick: null,
    byte: { x: 0, y: 0, vy: 0, bob: 0 },
    step: 0,
    perfects: 0,
    accuracySamples: [],
    stickLengths: [],
    sessionFails: 0,
    bestScore: 0,
    lastRewardDay: '',
    lastRewardXp: 0,
    rewardSubmitting: false,
    pointerId: null,
    growthStartedAt: 0,
    cameraShift: 0,
    shiftStart: 0,
    shiftDuration: .42,
    shiftDistance: 0,
    shiftFromCurrentX: 0,
    movingStatusTimer: 0,
    effects: [],
    soundEnabled: true,
    audioContext: null,
    pausedFromState: '',
    activePlayMs: 0,
    activeSegmentAt: 0,
    runStartedAt: 0,
    waitingToStart: true,
    cleanRun: true,
    failReason: '',
    finalData: null
  };

  function hashSeed(value) {
    const text = String(value || 'code-bridge');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      h = (((h * 31) >>> 0) + text.charCodeAt(i)) >>> 0;
    }
    return h >>> 0;
  }

  function makeRng(seedText) {
    let state = hashSeed(seedText) || 1;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function buildRunSpecs(seedText) {
    const rng = makeRng(seedText);
    return STEP_BANDS.map((band, index) => {
      const gap = randInt(rng, band.gap[0], band.gap[1]);
      const width = randInt(rng, band.width[0], band.width[1]);
      const perfectHalf = Math.max(10, Math.min(16, Math.round(width * .12)));
      return Object.freeze({
        index,
        gap,
        width,
        growSpeed: band.speed,
        perfectHalf
      });
    });
  }

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'codeBridgeOverlay';
    overlay.className = 'xp-games-game-overlay code-bridge-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Bridge mini-game');
    overlay.innerHTML = `
      <section class="code-bridge-shell">
        <canvas class="code-bridge-canvas" tabindex="-1" aria-label="CODE BRIDGE gameplay area"></canvas>

        <header class="code-bridge-topbar">
          <button type="button" data-code-bridge-back aria-label="Back to Mini-Games">←</button>
          <div class="code-bridge-brand">
            <strong>🌉 CODE BRIDGE</strong>
            <small>Reach the Endpoint</small>
          </div>
          <button type="button" data-code-bridge-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-code-bridge-close aria-label="Close Code Bridge">×</button>
        </header>

        <div class="code-bridge-hud">
          <div><small>LINKS</small><strong data-code-bridge-links>0/10</strong></div>
          <div><small>PERFECT</small><strong data-code-bridge-perfect>x0</strong></div>
          <div><small>BEST</small><strong data-code-bridge-best>0</strong></div>
        </div>

        <div class="code-bridge-reward-badge" data-code-bridge-reward-badge>Reward available today</div>
        <div class="code-bridge-status" data-code-bridge-status>Hold to extend · Release to link</div>

        <div class="code-bridge-tutorial" data-code-bridge-tutorial hidden>
          <strong>Hold → extend the DATA LINK</strong>
          <span>Release when the tip will land on the next platform. Center target = PERFECT.</span>
        </div>

        <div class="code-bridge-panel" data-code-bridge-ready>
          <div class="code-bridge-card">
            <span class="code-bridge-hero">🌉</span>
            <p class="code-bridge-kicker">ONE-FINGER LOGIC RUN</p>
            <h2>CODE BRIDGE</h2>
            <p>Build exactly 10 links and reach the ENDPOINT. Too short or too long means disconnect.</p>
            <div class="code-bridge-rule-row"><span>HOLD</span><b>Extend</b><span>RELEASE</span><b>Drop</b></div>
            <button type="button" class="primary" data-code-bridge-play>PLAY</button>
          </div>
        </div>

        <div class="code-bridge-panel" data-code-bridge-fail hidden>
          <div class="code-bridge-card compact">
            <span class="code-bridge-result-icon fail">×</span>
            <p class="code-bridge-kicker danger">CONNECTION LOST</p>
            <h2 data-code-bridge-fail-title>LINK FAILED</h2>
            <p data-code-bridge-fail-copy>The DATA LINK missed the next platform.</p>
            <div class="code-bridge-mini-stats">
              <div><small>Reached</small><strong data-code-bridge-fail-links>0/10</strong></div>
              <div><small>Perfect</small><strong data-code-bridge-fail-perfect>0</strong></div>
            </div>
            <div class="code-bridge-actions">
              <button type="button" class="primary" data-code-bridge-retry>RETRY RUN</button>
              <button type="button" data-code-bridge-fail-hub>MINI-GAMES</button>
            </div>
          </div>
        </div>

        <div class="code-bridge-panel" data-code-bridge-result hidden>
          <div class="code-bridge-card compact">
            <span class="code-bridge-result-icon success">✓</span>
            <p class="code-bridge-kicker success">NETWORK COMPLETE</p>
            <h2>ENDPOINT REACHED</h2>
            <div class="code-bridge-stars" data-code-bridge-stars>★★★</div>
            <div class="code-bridge-stat-grid">
              <div><small>Score</small><strong data-code-bridge-final-score>0</strong></div>
              <div><small>Perfect</small><strong data-code-bridge-final-perfects>0/10</strong></div>
              <div><small>Accuracy</small><strong data-code-bridge-final-accuracy>0%</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-code-bridge-final-xp>+0</strong></div>
            </div>
            <p class="code-bridge-reward-note" data-code-bridge-reward-note>Checking reward…</p>
            <div class="code-bridge-actions">
              <button type="button" class="primary" data-code-bridge-again>PLAY AGAIN</button>
              <button type="button" data-code-bridge-result-hub>MINI-GAMES</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-bridge-shell');
    runtime.canvas = overlay.querySelector('.code-bridge-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false });
    runtime.readyPanel = overlay.querySelector('[data-code-bridge-ready]');
    runtime.failPanel = overlay.querySelector('[data-code-bridge-fail]');
    runtime.resultPanel = overlay.querySelector('[data-code-bridge-result]');
    runtime.tutorial = overlay.querySelector('[data-code-bridge-tutorial]');
    runtime.statusEl = overlay.querySelector('[data-code-bridge-status]');
    runtime.linksEl = overlay.querySelector('[data-code-bridge-links]');
    runtime.perfectEl = overlay.querySelector('[data-code-bridge-perfect]');
    runtime.bestEl = overlay.querySelector('[data-code-bridge-best]');
    runtime.rewardBadge = overlay.querySelector('[data-code-bridge-reward-badge]');
    runtime.finalScore = overlay.querySelector('[data-code-bridge-final-score]');
    runtime.finalStars = overlay.querySelector('[data-code-bridge-stars]');
    runtime.finalPerfects = overlay.querySelector('[data-code-bridge-final-perfects]');
    runtime.finalAccuracy = overlay.querySelector('[data-code-bridge-final-accuracy]');
    runtime.finalXp = overlay.querySelector('[data-code-bridge-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-code-bridge-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-code-bridge-sound]');

    overlay.querySelector('[data-code-bridge-play]').addEventListener('click', startNewSession);
    overlay.querySelector('[data-code-bridge-retry]').addEventListener('click', retrySameSession);
    overlay.querySelector('[data-code-bridge-again]').addEventListener('click', startNewSession);
    overlay.querySelector('[data-code-bridge-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-bridge-fail-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-bridge-result-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-bridge-close]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);

    runtime.canvas.addEventListener('pointerdown', onPointerDown);
    runtime.canvas.addEventListener('pointerup', onPointerUp);
    runtime.canvas.addEventListener('pointercancel', onPointerCancel);
    runtime.canvas.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('keydown', event => {
      if (!runtime.open) return;
      if (event.code === 'Space') {
        if (event.target instanceof HTMLElement && event.target.closest('button,input,textarea,select,a')) return;
        event.preventDefault();
        if (event.type === 'keydown' && !event.repeat && runtime.state === 'ready-link') beginGrowing('keyboard');
      }
    });
    document.addEventListener('keyup', event => {
      if (!runtime.open || event.code !== 'Space') return;
      if (runtime.pointerId === 'keyboard' && runtime.state === 'growing') {
        event.preventDefault();
        releaseStick();
      }
    });

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', () => {
      if (runtime.open && ['ready-link','growing','rotating','walking','shifting','falling'].includes(runtime.state)) pauseForInterruption();
    });
    window.addEventListener('focus', resumeFromInterruption);
    window.addEventListener('resize', queueResize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(queueResize, 120), { passive: true });

    if ('ResizeObserver' in window) {
      runtime.resizeObserver = new ResizeObserver(() => queueResize());
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
      grow: [260, 290, .035, .022],
      drop: [380, 210, .09, .045],
      perfect: [610, 920, .12, .055],
      safe: [430, 660, .08, .04],
      fail: [190, 72, .18, .055],
      win: [520, 1040, .20, .06]
    };
    const [from, to, dur, volume] = table[kind] || table.safe;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = kind === 'fail' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + dur);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + .02);
  }

  function vibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (_) {}
  }

  function queueResize() {
    if (!runtime.open) return;
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = setTimeout(resizeCanvas, 50);
  }

  function resizeCanvas() {
    if (!runtime.open || !runtime.canvas || !runtime.ctx) return;
    const rect = runtime.canvas.getBoundingClientRect();
    const cssW = Math.max(280, rect.width || WORLD_W);
    const cssH = Math.max(420, rect.height || WORLD_H);
    const dpr = clamp(Number(devicePixelRatio || 1), 1, MAX_DPR);
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
      oy: (cssH - WORLD_H * scale) / 2
    };
    requestRender();
  }

  function requestRender() {
    if (!runtime.open || runtime.raf) return;
    runtime.raf = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (!runtime.raf) runtime.raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const dt = clamp((now - (runtime.lastFrame || now)) / 1000, 0, .034);
    runtime.lastFrame = now;
    if (runtime.state !== 'paused') update(dt, now);
    render(now);
    if (needsContinuousLoop()) runtime.raf = requestAnimationFrame(frame);
  }

  function needsContinuousLoop() {
    return ['growing','rotating','walking','shifting','falling','win-celebrate'].includes(runtime.state)
      || runtime.effects.length > 0;
  }

  function markActiveStart() {
    if (!runtime.activeSegmentAt) runtime.activeSegmentAt = performance.now();
  }

  function markActiveStop() {
    if (!runtime.activeSegmentAt) return;
    runtime.activePlayMs += Math.max(0, performance.now() - runtime.activeSegmentAt);
    runtime.activeSegmentAt = 0;
  }

  function getActivePlayMs() {
    return Math.round(runtime.activePlayMs + (runtime.activeSegmentAt ? Math.max(0, performance.now() - runtime.activeSegmentAt) : 0));
  }

  function showTutorialMaybe() {
    let seen = false;
    try { seen = localStorage.getItem(TUTORIAL_KEY) === '1'; } catch (_) {}
    if (seen) return;
    runtime.tutorial.hidden = false;
    window.setTimeout(() => {
      if (!runtime.tutorial) return;
      runtime.tutorial.hidden = true;
      try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch (_) {}
    }, 3200);
  }

  function updateHud() {
    runtime.linksEl.textContent = `${runtime.step}/${TOTAL_LINKS}`;
    runtime.perfectEl.textContent = `x${runtime.perfects}`;
    runtime.bestEl.textContent = String(Math.max(0, Math.floor(runtime.bestScore || 0)));
    const dayKey = runtime.bridge?.getSnapshot?.()?.dayKey || '';
    const claimedToday = dayKey && runtime.lastRewardDay === dayKey ? clamp(Number(runtime.lastRewardXp || 0), 0, 3) : 0;
    runtime.rewardBadge.textContent = claimedToday > 0
      ? `Today’s CODE BRIDGE reward · ${claimedToday}/3 XP`
      : 'Up to 3 XP · finish all 10 links';
    runtime.rewardBadge.classList.toggle('claimed', claimedToday >= 3);
  }

  function setStatus(text, kind = '') {
    runtime.statusEl.textContent = text;
    runtime.statusEl.dataset.kind = kind;
    if (runtime.movingStatusTimer) clearTimeout(runtime.movingStatusTimer);
    if (kind) {
      runtime.movingStatusTimer = window.setTimeout(() => {
        if (!runtime.statusEl || !runtime.open) return;
        if (runtime.state === 'ready-link') runtime.statusEl.textContent = 'Hold to extend · Release to link';
        runtime.statusEl.dataset.kind = '';
      }, 850);
    }
  }

  function startNewSession() {
    if (runtime.rewardSubmitting) return;
    try {
      if (runtime.round?.sessionId) runtime.bridge?.cancelRound?.(runtime.round.sessionId);
    } catch (_) {}
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    runtime.runSpecs = buildRunSpecs(runtime.round?.sessionId || `practice-${Date.now()}`);
    runtime.sessionFails = 0;
    runtime.cleanRun = true;
    runtime.activePlayMs = 0;
    runtime.activeSegmentAt = 0;
    runtime.runStartedAt = performance.now();
    runtime.waitingToStart = false;
    resetRunWorld();
    runtime.readyPanel.hidden = true;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.state = 'ready-link';
    setStatus('Hold to extend · Release to link');
    showTutorialMaybe();
    updateHud();
    markActiveStart();
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
    startLoop();
  }

  function retrySameSession() {
    if (!runtime.round) {
      startNewSession();
      return;
    }
    runtime.sessionFails += 1;
    runtime.cleanRun = false;
    resetRunWorld();
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.state = 'ready-link';
    setStatus('Retry · Hold to extend');
    markActiveStart();
    startLoop();
  }

  function resetRunWorld() {
    runtime.step = 0;
    runtime.perfects = 0;
    runtime.accuracySamples = [];
    runtime.stickLengths = [];
    runtime.effects = [];
    runtime.cameraShift = 0;
    runtime.shiftDistance = 0;
    runtime.current = { x: LEFT_X, y: PLATFORM_Y, w: START_WIDTH, h: PLATFORM_H, label: 'START' };
    runtime.next = createNextPlatform(0);
    runtime.bridgeStick = null;
    runtime.byte = {
      x: runtime.current.x + runtime.current.w - 42,
      y: PLATFORM_Y - BYTE_R - 2,
      vy: 0,
      bob: 0,
      walkPhase: 0,
      targetX: 0,
      walkStartX: 0,
      walkStartAt: 0,
      fallStartY: 0
    };
    updateHud();
  }

  function createNextPlatform(stepIndex) {
    const spec = runtime.runSpecs[stepIndex] || STEP_BANDS[Math.min(stepIndex, STEP_BANDS.length - 1)];
    const right = runtime.current.x + runtime.current.w;
    return {
      x: right + spec.gap,
      y: PLATFORM_Y,
      w: spec.width,
      h: PLATFORM_H,
      label: stepIndex === TOTAL_LINKS - 1 ? 'ENDPOINT' : `NODE ${stepIndex + 1}`,
      spec
    };
  }

  function onPointerDown(event) {
    if (!runtime.open || runtime.state !== 'ready-link' || runtime.pointerId != null) return;
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    runtime.pointerId = event.pointerId;
    try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
    beginGrowing(event.pointerId);
  }

  function beginGrowing(pointerId) {
    if (runtime.state !== 'ready-link') return;
    runtime.pointerId = pointerId;
    runtime.state = 'growing';
    runtime.growthStartedAt = performance.now();
    runtime.bridgeStick = {
      length: 8,
      angle: -Math.PI / 2,
      baseX: runtime.current.x + runtime.current.w,
      baseY: PLATFORM_Y,
      dropProgress: 0,
      valid: false,
      perfect: false,
      tipX: 0
    };
    tone('grow');
    setStatus('Growing DATA LINK…', 'active');
    startLoop();
  }

  function onPointerUp(event) {
    if (!runtime.open || runtime.state !== 'growing') return;
    if (runtime.pointerId !== event.pointerId) return;
    event.preventDefault();
    try { runtime.canvas.releasePointerCapture(event.pointerId); } catch (_) {}
    runtime.pointerId = null;
    releaseStick();
  }

  function onPointerCancel(event) {
    if (!runtime.open || runtime.pointerId !== event.pointerId) return;
    runtime.pointerId = null;
    if (runtime.state === 'growing') releaseStick();
  }

  function releaseStick() {
    if (runtime.state !== 'growing' || !runtime.bridgeStick) return;
    runtime.pointerId = null;
    runtime.state = 'rotating';
    runtime.bridgeStick.dropProgress = 0;
    tone('drop');
    vibrate(8);
    setStatus('LINK DEPLOYED', 'active');
    startLoop();
  }

  function update(dt, now) {
    runtime.byte.bob += dt * 3.5;
    updateEffects(dt);

    if (runtime.state === 'growing' && runtime.bridgeStick) {
      const spec = runtime.next?.spec || STEP_BANDS[Math.min(runtime.step, 9)];
      runtime.bridgeStick.length = Math.min(MAX_STICK, runtime.bridgeStick.length + spec.growSpeed * dt);
      if (runtime.bridgeStick.length >= MAX_STICK - .1) {
        runtime.pointerId = null;
        releaseStick();
      }
      return;
    }

    if (runtime.state === 'rotating' && runtime.bridgeStick) {
      runtime.bridgeStick.dropProgress = Math.min(1, runtime.bridgeStick.dropProgress + dt / .28);
      const eased = easeOutCubic(runtime.bridgeStick.dropProgress);
      runtime.bridgeStick.angle = -Math.PI / 2 + (Math.PI / 2) * eased;
      if (runtime.bridgeStick.dropProgress >= 1) resolveLanding();
      return;
    }

    if (runtime.state === 'walking' && runtime.bridgeStick) {
      const distance = Math.max(1, runtime.byte.targetX - runtime.byte.walkStartX);
      const duration = clamp(distance / 355, .34, 1.45);
      const t = clamp((now - runtime.byte.walkStartAt) / (duration * 1000), 0, 1);
      runtime.byte.x = lerp(runtime.byte.walkStartX, runtime.byte.targetX, easeInOutCubic(t));
      runtime.byte.walkPhase += dt * 14;
      if (t >= 1) {
        if (runtime.bridgeStick.valid) beginShift();
        else beginFall();
      }
      return;
    }

    if (runtime.state === 'falling') {
      runtime.byte.vy += 920 * dt;
      runtime.byte.y += runtime.byte.vy * dt;
      runtime.byte.x += 82 * dt;
      if (runtime.byte.y > WORLD_H + 60) showFailure();
      return;
    }

    if (runtime.state === 'shifting') {
      const t = clamp((now - runtime.shiftStart) / (runtime.shiftDuration * 1000), 0, 1);
      runtime.cameraShift = runtime.shiftDistance * easeInOutCubic(t);
      if (t >= 1) finishShift();
      return;
    }

    if (runtime.state === 'win-celebrate') {
      runtime.winTimer = Math.max(0, Number(runtime.winTimer || 0) - dt);
      if (runtime.winTimer <= 0) finalizeRun();
    }
  }

  function resolveLanding() {
    if (!runtime.bridgeStick || !runtime.next) return;
    const baseX = runtime.bridgeStick.baseX;
    const tipX = baseX + runtime.bridgeStick.length;
    const left = runtime.next.x;
    const right = runtime.next.x + runtime.next.w;
    const center = left + runtime.next.w / 2;
    const perfectHalf = runtime.next.spec?.perfectHalf || 12;
    const valid = tipX >= left && tipX <= right;
    const error = Math.abs(tipX - center);
    const accuracy = valid ? clamp(1 - error / Math.max(1, runtime.next.w / 2), 0, 1) : 0;
    const perfect = valid && error <= perfectHalf;

    runtime.bridgeStick.tipX = tipX;
    runtime.bridgeStick.valid = valid;
    runtime.bridgeStick.perfect = perfect;
    runtime.bridgeStick.accuracy = accuracy;

    if (valid) {
      runtime.stickLengths.push(Math.round(runtime.bridgeStick.length * 10) / 10);
      runtime.accuracySamples.push(accuracy);
      if (perfect) {
        runtime.perfects += 1;
        tone('perfect');
        vibrate([8, 22, 8]);
        setStatus('PERFECT LINK!', 'perfect');
        addEffect('perfect', center, PLATFORM_Y - 18);
      } else {
        tone('safe');
        setStatus(accuracy >= .72 ? 'NICE LINK' : 'LINK ESTABLISHED', 'good');
        addEffect('safe', tipX, PLATFORM_Y - 14);
      }
      runtime.byte.walkStartX = runtime.byte.x;
      // Walk fully onto the destination platform rather than stopping at the
      // stick tip. This makes the crossing read naturally on both small phones
      // and desktop without changing the deterministic landing math.
      runtime.byte.targetX = runtime.next.x + Math.min(36, runtime.next.w * .34);
      runtime.byte.walkStartAt = performance.now();
      runtime.state = 'walking';
    } else {
      runtime.cleanRun = false;
      runtime.failReason = tipX < left ? 'short' : 'long';
      tone('fail');
      setStatus(tipX < left ? 'TOO SHORT' : 'OVERSHOT', 'danger');
      runtime.byte.walkStartX = runtime.byte.x;
      runtime.byte.targetX = tipX + BYTE_R * .34;
      runtime.byte.walkStartAt = performance.now();
      runtime.state = 'walking';
    }
    updateHud();
  }

  function beginFall() {
    runtime.state = 'falling';
    runtime.byte.vy = 70;
    runtime.byte.fallStartY = runtime.byte.y;
    addEffect('fail', runtime.bridgeStick?.tipX || runtime.byte.x, PLATFORM_Y - 6);
    startLoop();
  }

  function beginShift() {
    runtime.step += 1;
    updateHud();
    if (runtime.step >= TOTAL_LINKS) {
      runtime.state = 'win-celebrate';
      runtime.winTimer = .55;
      tone('win');
      vibrate([12, 28, 12]);
      setStatus('ENDPOINT REACHED ✓', 'perfect');
      addEffect('win', runtime.next.x + runtime.next.w / 2, PLATFORM_Y - 75);
      return;
    }

    runtime.state = 'shifting';
    runtime.shiftDistance = runtime.next.x - LEFT_X;
    runtime.shiftStart = performance.now();
    runtime.shiftFromCurrentX = runtime.current.x;
    setStatus(`LINK ${runtime.step}/${TOTAL_LINKS} · NEXT NODE`, 'good');
  }

  function finishShift() {
    const shift = runtime.shiftDistance;
    runtime.current = {
      ...runtime.next,
      x: runtime.next.x - shift,
      label: `NODE ${runtime.step}`
    };
    runtime.byte.x = runtime.current.x + 36;
    runtime.byte.y = PLATFORM_Y - BYTE_R - 2;
    runtime.byte.vy = 0;
    runtime.bridgeStick = null;
    runtime.cameraShift = 0;
    runtime.next = createNextPlatform(runtime.step);
    runtime.state = 'ready-link';
    setStatus('Hold to extend · Release to link');
    updateHud();
  }

  function showFailure() {
    markActiveStop();
    runtime.state = 'failed';
    const title = runtime.overlay.querySelector('[data-code-bridge-fail-title]');
    const copy = runtime.overlay.querySelector('[data-code-bridge-fail-copy]');
    const links = runtime.overlay.querySelector('[data-code-bridge-fail-links]');
    const perfect = runtime.overlay.querySelector('[data-code-bridge-fail-perfect]');
    title.textContent = runtime.failReason === 'short' ? 'LINK TOO SHORT' : 'LINK OVERSHOT';
    copy.textContent = runtime.failReason === 'short'
      ? 'The DATA LINK did not reach the next node.'
      : 'BYTE ran past the target platform.';
    links.textContent = `${runtime.step}/${TOTAL_LINKS}`;
    perfect.textContent = String(runtime.perfects);
    runtime.failPanel.hidden = false;
    runtime.tutorial.hidden = true;
    vibrate(35);
  }

  function scoreRun() {
    const avgAccuracy = runtime.accuracySamples.length
      ? runtime.accuracySamples.reduce((sum, value) => sum + value, 0) / runtime.accuracySamples.length
      : 0;
    const perfectBonus = Math.round((runtime.perfects / TOTAL_LINKS) * 250);
    const accuracyBonus = Math.round(avgAccuracy * 150);
    const cleanBonus = runtime.sessionFails === 0 && runtime.cleanRun ? 100 : 0;
    const score = clamp(500 + perfectBonus + accuracyBonus + cleanBonus, 0, 1000);
    const stars = score >= 850 ? 3 : score >= 650 ? 2 : 1;
    return {
      score,
      stars,
      avgAccuracy,
      accuracyPercent: Math.round(avgAccuracy * 100),
      perfectBonus,
      accuracyBonus,
      cleanBonus
    };
  }

  function rewardTierForRun(summary) {
    const score = Math.max(0, Number(summary && summary.score || 0));
    const accuracy = Math.max(0, Number(summary && summary.accuracyPercent || 0));
    const clean = runtime.sessionFails === 0 && runtime.cleanRun;
    if (score < 650) return 0;
    if (score >= 875 && runtime.perfects >= 6 && accuracy >= 88 && clean) return 3;
    if (score >= 750 && runtime.perfects >= 3) return 2;
    return 1;
  }

  async function finalizeRun() {
    if (runtime.state === 'result' || runtime.rewardSubmitting) return;
    markActiveStop();
    runtime.state = 'result';
    runtime.tutorial.hidden = true;
    const summary = scoreRun();
    runtime.finalData = summary;
    runtime.bestScore = Math.max(runtime.bestScore, summary.score);
    runtime.finalScore.textContent = String(summary.score);
    runtime.finalStars.textContent = `${'★'.repeat(summary.stars)}${'☆'.repeat(3 - summary.stars)}`;
    runtime.finalPerfects.textContent = `${runtime.perfects}/${TOTAL_LINKS}`;
    runtime.finalAccuracy.textContent = `${summary.accuracyPercent}%`;
    runtime.finalXp.textContent = '+0';
    runtime.rewardNote.className = 'code-bridge-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Checking reward…' : 'Practice run — log in to earn account XP.';
    runtime.resultPanel.hidden = false;
    updateHud();

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;

    const snap = runtime.bridge?.getSnapshot?.() || {};
    const claimedTierToday = snap.dayKey && runtime.lastRewardDay === snap.dayKey
      ? clamp(Number(runtime.lastRewardXp || 0), 0, 3)
      : 0;
    const potentialTier = rewardTierForRun(summary);
    if (potentialTier <= claimedTierToday) {
      runtime.rewardNote.className = 'code-bridge-reward-note warn';
      runtime.rewardNote.textContent = claimedTierToday >= 3
        ? 'Master reward already secured today. Replay for your best score.'
        : `Today’s best reward is ${claimedTierToday}/3 XP. Beat it to earn only the difference.`;
      return;
    }

    runtime.rewardSubmitting = true;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: summary.score,
        metrics: {
          completedRun: true,
          runToken: String(runtime.round.sessionId || ''),
          bridges: TOTAL_LINKS,
          perfects: runtime.perfects,
          accuracy: summary.accuracyPercent,
          sessionFails: runtime.sessionFails,
          activeTimeMs: getActivePlayMs(),
          stickLengths: runtime.stickLengths.slice(0, TOTAL_LINKS)
        }
      });
      runtime.round = null;
      const record = result?.gameRecord || result?.gameRecords?.codeBridge || {};
      runtime.bestScore = Math.max(runtime.bestScore, Number(record.bestRunScore || record.bestScore || 0));
      runtime.lastRewardDay = String(record.lastRewardDay || runtime.lastRewardDay || '');
      runtime.lastRewardXp = Math.max(runtime.lastRewardXp, Number(record.lastRewardXp || 0));
      runtime.finalXp.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;
      runtime.bestEl.textContent = String(Math.floor(runtime.bestScore));

      if (result?.loginRequired) {
        runtime.rewardNote.className = 'code-bridge-reward-note warn';
        runtime.rewardNote.textContent = 'Practice mode — log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.className = 'code-bridge-reward-note warn';
        runtime.rewardNote.textContent = 'XP could not sync. No account XP was added.';
      } else if (result?.replayNoXp) {
        runtime.rewardNote.className = 'code-bridge-reward-note warn';
        runtime.rewardNote.textContent = 'No higher CODE BRIDGE reward tier this time. Best score still counts.';
      } else if (result?.capReached && Number(result.awardedXp || 0) === 0) {
        runtime.rewardNote.className = 'code-bridge-reward-note warn';
        runtime.rewardNote.textContent = 'Daily Mini-Game XP limit reached. Keep playing for records.';
      } else if (Number(result?.awardedXp || 0) > 0) {
        runtime.rewardNote.className = 'code-bridge-reward-note success';
        runtime.rewardNote.textContent = `Reward added safely · Today’s Game XP: ${result.todayXp}/${result.dailyCap}`;
      } else {
        runtime.rewardNote.className = 'code-bridge-reward-note';
        runtime.rewardNote.textContent = 'Endpoint reached, but this run did not reach an XP tier.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
      updateHud();
    } catch (_) {
      runtime.rewardNote.className = 'code-bridge-reward-note warn';
      runtime.rewardNote.textContent = 'Reward could not be processed. No XP was added.';
    } finally {
      runtime.rewardSubmitting = false;
    }
  }

  function addEffect(kind, x, y) {
    const count = kind === 'win' ? 16 : kind === 'perfect' ? 8 : 4;
    for (let i = 0; i < count; i += 1) {
      const angle = Math.PI * 2 * (i / count) + Math.random() * .25;
      const speed = kind === 'win' ? 90 + Math.random() * 100 : 45 + Math.random() * 70;
      runtime.effects.push({
        kind,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (kind === 'win' ? 55 : 20),
        age: 0,
        ttl: kind === 'win' ? .72 : .4,
        size: kind === 'win' ? 5 : 3
      });
    }
  }

  function updateEffects(dt) {
    if (!runtime.effects.length) return;
    runtime.effects = runtime.effects.filter(item => {
      item.age += dt;
      item.vy += 160 * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      return item.age < item.ttl;
    });
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
    ctx.fillStyle = '#040713';
    ctx.fillRect(0, 0, runtime.canvas.width / view.dpr, runtime.canvas.height / view.dpr);
    ctx.restore();
    withWorldTransform(worldCtx => drawWorld(worldCtx, now));
  }

  function drawWorld(ctx, now) {
    drawBackground(ctx, now);
    ctx.save();
    ctx.translate(-runtime.cameraShift, 0);
    drawPlatform(ctx, runtime.current, false);
    drawPlatform(ctx, runtime.next, true);
    drawStick(ctx);
    drawByte(ctx, now);
    drawEffects(ctx);
    ctx.restore();
    drawForeground(ctx, now);
  }

  function drawBackground(ctx, now) {
    const gradient = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    gradient.addColorStop(0, '#071a32');
    gradient.addColorStop(.52, '#081225');
    gradient.addColorStop(1, '#040713');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    ctx.save();
    ctx.globalAlpha = .11;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    const grid = 42;
    const offset = -((now * .018) % grid);
    for (let x = offset; x <= WORLD_W + grid; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 120); ctx.lineTo(x, WORLD_H); ctx.stroke();
    }
    for (let y = 130; y < WORLD_H; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_W, y); ctx.stroke();
    }
    ctx.restore();

    const horizon = 640;
    ctx.fillStyle = 'rgba(14,165,233,.045)';
    for (let i = 0; i < 10; i += 1) {
      const w = 28 + (i % 4) * 13;
      const h = 80 + ((i * 57) % 180);
      const x = i * 82 - 28;
      ctx.fillRect(x, horizon - h, w, h);
      ctx.fillStyle = 'rgba(56,189,248,.12)';
      for (let yy = horizon - h + 18; yy < horizon - 10; yy += 24) {
        ctx.fillRect(x + 7, yy, 4, 7);
        if (w > 42) ctx.fillRect(x + 18, yy, 4, 7);
      }
      ctx.fillStyle = 'rgba(14,165,233,.045)';
    }

    ctx.fillStyle = 'rgba(34,211,238,.08)';
    ctx.fillRect(0, PLATFORM_Y + 118, WORLD_W, WORLD_H - PLATFORM_Y - 118);
  }

  function drawPlatform(ctx, platform, target) {
    if (!platform) return;
    const x = platform.x;
    const y = platform.y;
    const w = platform.w;
    const h = platform.h;

    ctx.save();
    const topGrad = ctx.createLinearGradient(x, y, x, y + h);
    topGrad.addColorStop(0, target ? '#0f3d55' : '#113a4b');
    topGrad.addColorStop(1, '#07101b');
    ctx.fillStyle = topGrad;
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = target ? 'rgba(103,232,249,.52)' : 'rgba(125,211,252,.28)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = target ? '#164e63' : '#12384b';
    roundRect(ctx, x, y - 12, w, 18, 8);
    ctx.fill();

    const label = target ? platform.label : (runtime.step === 0 ? 'START' : `NODE ${runtime.step}`);
    ctx.fillStyle = 'rgba(224,242,254,.78)';
    ctx.font = '900 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + w / 2, y + 20);

    ctx.fillStyle = 'rgba(56,189,248,.13)';
    const cols = Math.max(2, Math.floor(w / 34));
    for (let col = 0; col < cols; col += 1) {
      for (let row = 0; row < 5; row += 1) {
        ctx.fillRect(x + 10 + col * 28, y + 56 + row * 34, 8, 5);
      }
    }

    if (target) {
      const center = x + w / 2;
      const half = platform.spec?.perfectHalf || 12;
      ctx.fillStyle = 'rgba(163,230,53,.20)';
      roundRect(ctx, center - half, y - 15, half * 2, 21, 7);
      ctx.fill();
      ctx.strokeStyle = 'rgba(190,242,100,.86)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#d9f99d';
      ctx.font = '900 11px system-ui';
      ctx.textBaseline = 'bottom';
      ctx.fillText('✓', center, y - 17);
    }
    ctx.restore();
  }

  function drawStick(ctx) {
    if (!runtime.bridgeStick) return;
    const stick = runtime.bridgeStick;
    const length = stick.length;
    ctx.save();
    ctx.translate(stick.baseX, stick.baseY);
    ctx.rotate(stick.angle);
    const grad = ctx.createLinearGradient(0, 0, length, 0);
    grad.addColorStop(0, '#22d3ee');
    grad.addColorStop(.72, '#38bdf8');
    grad.addColorStop(1, stick.perfect ? '#bef264' : '#a78bfa');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(34,211,238,.32)';
    ctx.shadowBlur = 10;
    roundRect(ctx, 0, -STICK_THICKNESS / 2, length, STICK_THICKNESS, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.beginPath();
    ctx.arc(Math.max(4, length - 5), 0, 3.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawByte(ctx, now) {
    const x = runtime.byte.x;
    const baseY = runtime.byte.y;
    const walking = runtime.state === 'walking' || runtime.state === 'shifting';
    const falling = runtime.state === 'falling';
    const bob = walking ? Math.sin(runtime.byte.walkPhase) * 3 : Math.sin((now || 0) * .004) * 2;
    const y = baseY + (falling ? 0 : bob);
    ctx.save();
    ctx.translate(x, y);
    if (falling) ctx.rotate(clamp((runtime.byte.y - runtime.byte.fallStartY) / 160, 0, 1) * .6);

    ctx.fillStyle = '#071827';
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 3;
    roundRect(ctx, -22, -23, 44, 42, 11);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(-16, -15, 32, 17);
    ctx.fillStyle = '#062331';
    ctx.beginPath(); ctx.arc(-7, -7, 3, 0, Math.PI * 2); ctx.arc(7, -7, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = falling ? '#fb7185' : '#a3e635';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (falling) {
      ctx.moveTo(-6, 8); ctx.lineTo(0, 4); ctx.lineTo(6, 8);
    } else {
      ctx.arc(0, 4, 8, .15, Math.PI - .15);
    }
    ctx.stroke();

    ctx.fillStyle = '#a3e635';
    ctx.font = '900 9px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BYTE', 0, 15);

    if (walking) {
      const leg = Math.sin(runtime.byte.walkPhase) * 7;
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-8, 18); ctx.lineTo(-8 + leg, 26);
      ctx.moveTo(8, 18); ctx.lineTo(8 - leg, 26);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEffects(ctx) {
    if (!runtime.effects.length) return;
    runtime.effects.forEach(item => {
      const alpha = clamp(1 - item.age / item.ttl, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = item.kind === 'fail' ? '#fb7185' : item.kind === 'perfect' ? '#bef264' : item.kind === 'win' ? '#fbbf24' : '#67e8f9';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.size * (1 + item.age * 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawForeground(ctx, now) {
    if (runtime.state === 'growing' && runtime.bridgeStick) {
      const pct = Math.round(runtime.bridgeStick.length / MAX_STICK * 100);
      ctx.save();
      ctx.fillStyle = 'rgba(2,8,23,.74)';
      roundRect(ctx, 250, 950, 220, 44, 22);
      ctx.fill();
      ctx.fillStyle = '#bae6fd';
      ctx.font = '900 14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`DATA LINK ${pct}%`, 360, 972);
      ctx.restore();
    }

    if (runtime.state === 'win-celebrate') {
      const pulse = .5 + .5 * Math.sin((now || 0) * .02);
      ctx.save();
      ctx.globalAlpha = .75 + pulse * .25;
      ctx.fillStyle = '#d9f99d';
      ctx.font = '950 36px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('NETWORK COMPLETE ✓', WORLD_W / 2, 240);
      ctx.restore();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
    else ctx.rect(x, y, w, h);
  }

  function pauseForInterruption() {
    if (!runtime.open || runtime.state === 'paused') return;
    if (!['ready-link','growing','rotating','walking','shifting','falling'].includes(runtime.state)) return;
    runtime.pausedFromState = runtime.state;
    runtime.state = 'paused';
    markActiveStop();
    setStatus('PAUSED', 'active');
    startLoop();
  }

  function resumeFromInterruption() {
    if (!runtime.open || runtime.state !== 'paused') return;
    runtime.state = runtime.pausedFromState || 'ready-link';
    runtime.pausedFromState = '';
    runtime.lastFrame = performance.now();
    markActiveStart();
    if (runtime.state === 'ready-link') setStatus('Hold to extend · Release to link');
    startLoop();
  }

  function handleVisibility() {
    if (document.hidden) pauseForInterruption();
    else resumeFromInterruption();
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
    markActiveStop();
    try {
      if (runtime.round?.sessionId && !runtime.rewardSubmitting) runtime.bridge?.cancelRound?.(runtime.round.sessionId);
    } catch (_) {}
    runtime.round = null;
    runtime.open = false;
    runtime.state = 'closed';
    runtime.pointerId = null;
    runtime.rewardSubmitting = false;
    runtime.overlay.hidden = true;
    document.body.classList.remove('code-bridge-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    clearTimeout(runtime.resizeTimer);
    clearTimeout(runtime.movingStatusTimer);
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    const record = snap.gameRecords?.codeBridge || {};
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.bestScore = Math.max(0, Number(record.bestRunScore || record.bestScore || 0));
    runtime.lastRewardDay = String(record.lastRewardDay || '');
    runtime.lastRewardXp = Math.max(0, Number(record.lastRewardXp || 0));
    runtime.open = true;
    runtime.state = 'menu';
    runtime.round = null;
    runtime.overlay.hidden = false;
    runtime.readyPanel.hidden = false;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.tutorial.hidden = true;
    document.body.classList.add('code-bridge-active');
    updateHud();
    runtime.lastFrame = performance.now();
    requestAnimationFrame(() => {
      resizeCanvas();
      resetRunWorld();
      render(performance.now());
    });
  }

  window.ICT8CodeBridge = Object.freeze({
    open,
    close: closeInternal,
    isOpen: () => runtime.open
  });
})();
