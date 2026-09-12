(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'byte-sling';
  // V469B: stable pre-impact structures + oriented rigid-body collisions.
  const MAX_DPR = 2;
  const WORLD_W = 1000;
  const WORLD_H = 640;
  const GROUND_Y = 560;
  const LAUNCH_X = 145;
  const LAUNCH_Y = 500;
  const PROJECTILE_R = 19;
  const MAX_PULL = 165;
  const GRAVITY = 820;
  const FIXED_STEP = 1 / 120;
  const MAX_RUN = 4;
  const TUTORIAL_KEY = 'ict8.byteSlingTutorialSeen.v1';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const PACKETS = Object.freeze({
    html: { id: 'html', label: 'HTML', symbol: '<>', fill: '#22d3ee', mass: 1.35, power: 1.12, special: '' },
    css: { id: 'css', label: 'CSS', symbol: '#', fill: '#f472b6', mass: 1.00, power: 1.00, special: 'IMPACT PULSE' },
    js: { id: 'js', label: 'JS', symbol: 'JS', fill: '#fbbf24', mass: 0.95, power: 1.02, special: 'TAP BOOST' },
    debug: { id: 'debug', label: 'DEBUG', symbol: '✓', fill: '#a3e635', mass: 1.15, power: 1.06, special: 'DEBUG BURST' }
  });

  const MATERIALS = Object.freeze({
    panel: { label: 'DATA', fill: '#0ea5e9', hp: 1, mass: 0.95, restitution: 0.18 },
    server: { label: 'SERVER', fill: '#4f46e5', hp: 2.4, mass: 2.2, restitution: 0.10 },
    power: { label: 'POWER', fill: '#f59e0b', hp: 1.25, mass: 1.3, restitution: 0.16, explosive: true },
    firewall: { label: 'FIREWALL', fill: '#ef4444', hp: 999, mass: 999, restitution: 0.08, static: true }
  });

  // V469B: all layouts use exact non-overlapping supports. Structures stay
  // asleep until the first real impact, then the rigid-body solver takes over.
  const LEVELS = Object.freeze([
    {
      id: 1, name: 'FIRST DEBUG', difficulty: 'Easy', shots: ['html', 'html', 'css'], bugs: [{ x: 810, y: 542 }],
      blocks: [
        { x: 760, y: 510, w: 34, h: 100, m: 'panel' }, { x: 860, y: 510, w: 34, h: 100, m: 'panel' },
        { x: 810, y: 445, w: 150, h: 30, m: 'panel' }
      ]
    },
    {
      id: 2, name: 'STACK TRACE', difficulty: 'Easy', shots: ['html', 'css', 'html'], bugs: [{ x: 785, y: 542 }, { x: 920, y: 542 }],
      blocks: [
        { x: 740, y: 515, w: 34, h: 90, m: 'panel' }, { x: 830, y: 515, w: 34, h: 90, m: 'panel' },
        { x: 785, y: 455, w: 140, h: 30, m: 'panel' },
        { x: 885, y: 520, w: 34, h: 80, m: 'panel' }, { x: 955, y: 520, w: 34, h: 80, m: 'panel' },
        { x: 920, y: 465, w: 120, h: 30, m: 'panel' }
      ]
    },
    {
      id: 3, name: 'CACHE DROP', difficulty: 'Easy', shots: ['css', 'html', 'html'], bugs: [{ x: 805, y: 542 }, { x: 940, y: 542 }],
      blocks: [
        { x: 770, y: 520, w: 42, h: 80, m: 'power' }, { x: 840, y: 520, w: 34, h: 80, m: 'panel' },
        { x: 805, y: 465, w: 150, h: 30, m: 'server' },
        { x: 910, y: 510, w: 34, h: 100, m: 'panel' }, { x: 970, y: 510, w: 34, h: 100, m: 'panel' },
        { x: 940, y: 445, w: 100, h: 30, m: 'panel' }
      ]
    },
    {
      id: 4, name: 'STYLE BREAK', difficulty: 'Medium', shots: ['css', 'html', 'js'], bugs: [{ x: 780, y: 542 }, { x: 930, y: 542 }],
      blocks: [
        { x: 730, y: 500, w: 38, h: 120, m: 'server' }, { x: 830, y: 500, w: 38, h: 120, m: 'server' },
        { x: 780, y: 425, w: 150, h: 30, m: 'panel' },
        { x: 895, y: 515, w: 34, h: 90, m: 'panel' }, { x: 965, y: 515, w: 34, h: 90, m: 'panel' },
        { x: 930, y: 455, w: 120, h: 30, m: 'server' }
      ]
    },
    {
      id: 5, name: 'SCRIPT BOOST', difficulty: 'Medium', shots: ['js', 'html', 'css'], bugs: [{ x: 820, y: 412 }, { x: 950, y: 432 }],
      blocks: [
        { x: 770, y: 510, w: 38, h: 100, m: 'server' }, { x: 870, y: 510, w: 38, h: 100, m: 'panel' },
        { x: 820, y: 445, w: 150, h: 30, m: 'server' },
        { x: 950, y: 520, w: 40, h: 80, m: 'power' }, { x: 950, y: 465, w: 90, h: 30, m: 'panel' }
      ]
    },
    {
      id: 6, name: 'POWER CHAIN', difficulty: 'Medium', shots: ['css', 'debug', 'html'], bugs: [{ x: 752, y: 542 }, { x: 850, y: 542 }, { x: 948, y: 542 }],
      blocks: [
        { x: 720, y: 515, w: 34, h: 90, m: 'panel' }, { x: 785, y: 515, w: 38, h: 90, m: 'power' },
        { x: 850, y: 515, w: 34, h: 90, m: 'panel' }, { x: 915, y: 515, w: 38, h: 90, m: 'power' },
        { x: 980, y: 515, w: 34, h: 90, m: 'panel' }, { x: 850, y: 455, w: 290, h: 30, m: 'server' }
      ]
    },
    {
      id: 7, name: 'SERVER GATE', difficulty: 'Hard', shots: ['html', 'js', 'debug', 'css'], bugs: [{ x: 810, y: 542 }, { x: 945, y: 412 }],
      blocks: [
        { x: 690, y: 500, w: 28, h: 120, m: 'firewall' },
        { x: 760, y: 500, w: 40, h: 120, m: 'server' }, { x: 860, y: 500, w: 40, h: 120, m: 'server' },
        { x: 810, y: 425, w: 150, h: 30, m: 'server' },
        { x: 945, y: 510, w: 40, h: 100, m: 'power' }, { x: 945, y: 445, w: 90, h: 30, m: 'panel' }
      ]
    },
    {
      id: 8, name: 'GLITCH BRIDGE', difficulty: 'Hard', shots: ['js', 'css', 'html', 'debug'], bugs: [{ x: 790, y: 314 }, { x: 930, y: 542 }],
      blocks: [
        { x: 740, y: 510, w: 38, h: 100, m: 'server' }, { x: 840, y: 510, w: 38, h: 100, m: 'server' },
        { x: 790, y: 445, w: 150, h: 30, m: 'panel' },
        { x: 765, y: 395, w: 34, h: 70, m: 'panel' }, { x: 815, y: 395, w: 34, h: 70, m: 'panel' },
        { x: 790, y: 346, w: 105, h: 28, m: 'panel' },
        { x: 900, y: 510, w: 34, h: 100, m: 'panel' }, { x: 960, y: 510, w: 34, h: 100, m: 'panel' },
        { x: 930, y: 445, w: 110, h: 30, m: 'power' }
      ]
    },
    {
      id: 9, name: 'DEBUG CORE', difficulty: 'Hard', shots: ['debug', 'html', 'css', 'js'], bugs: [{ x: 780, y: 542 }, { x: 925, y: 542 }],
      blocks: [
        { x: 735, y: 505, w: 38, h: 110, m: 'server' }, { x: 825, y: 505, w: 38, h: 110, m: 'power' },
        { x: 780, y: 435, w: 140, h: 30, m: 'panel' },
        { x: 885, y: 510, w: 38, h: 100, m: 'server' }, { x: 965, y: 510, w: 34, h: 100, m: 'panel' },
        { x: 925, y: 445, w: 130, h: 30, m: 'server' }
      ]
    },
    {
      id: 10, name: 'FIREWALL GAP', difficulty: 'Expert', shots: ['js', 'debug', 'css', 'html'], bugs: [{ x: 805, y: 542 }, { x: 940, y: 542 }],
      blocks: [
        { x: 680, y: 500, w: 28, h: 120, m: 'firewall' },
        { x: 755, y: 500, w: 40, h: 120, m: 'server' }, { x: 855, y: 500, w: 40, h: 120, m: 'power' },
        { x: 805, y: 425, w: 150, h: 30, m: 'server' },
        { x: 910, y: 515, w: 34, h: 90, m: 'panel' }, { x: 970, y: 515, w: 34, h: 90, m: 'panel' },
        { x: 940, y: 455, w: 110, h: 30, m: 'server' }
      ]
    },
    {
      id: 11, name: 'DATA CASCADE', difficulty: 'Expert', shots: ['css', 'js', 'debug', 'html'], bugs: [{ x: 755, y: 324 }, { x: 925, y: 542 }],
      blocks: [
        { x: 720, y: 515, w: 34, h: 90, m: 'server' }, { x: 790, y: 515, w: 34, h: 90, m: 'panel' },
        { x: 755, y: 455, w: 120, h: 30, m: 'panel' },
        { x: 735, y: 405, w: 32, h: 70, m: 'panel' }, { x: 775, y: 405, w: 32, h: 70, m: 'power' },
        { x: 755, y: 356, w: 90, h: 28, m: 'panel' },
        { x: 885, y: 505, w: 38, h: 110, m: 'server' }, { x: 965, y: 505, w: 38, h: 110, m: 'server' },
        { x: 925, y: 435, w: 130, h: 30, m: 'power' }
      ]
    },
    {
      id: 12, name: 'CRITICAL PATCH', difficulty: 'Expert', shots: ['debug', 'js', 'css', 'html'], bugs: [{ x: 740, y: 542 }, { x: 865, y: 314 }, { x: 962, y: 542 }],
      blocks: [
        { x: 700, y: 505, w: 38, h: 110, m: 'server' }, { x: 780, y: 505, w: 38, h: 110, m: 'power' },
        { x: 740, y: 435, w: 130, h: 30, m: 'panel' },
        { x: 830, y: 510, w: 34, h: 100, m: 'panel' }, { x: 900, y: 510, w: 34, h: 100, m: 'server' },
        { x: 865, y: 445, w: 120, h: 30, m: 'server' },
        { x: 845, y: 395, w: 32, h: 70, m: 'panel' }, { x: 885, y: 395, w: 32, h: 70, m: 'panel' },
        { x: 865, y: 346, w: 90, h: 28, m: 'power' },
        { x: 940, y: 515, w: 30, h: 90, m: 'panel' }, { x: 985, y: 515, w: 30, h: 90, m: 'panel' },
        { x: 962.5, y: 455, w: 75, h: 30, m: 'panel' }
      ]
    }
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
    levelResultPanel: null,
    runResultPanel: null,
    tutorial: null,
    statusEl: null,
    runEl: null,
    levelEl: null,
    scoreEl: null,
    shotsEl: null,
    bugsEl: null,
    packetEl: null,
    packetHintEl: null,
    soundBtn: null,
    view: { cssW: 1000, cssH: 640, dpr: 1, scale: 1, ox: 0, oy: 0 },
    resizeObserver: null,
    resizeTimer: 0,
    raf: 0,
    lastFrame: 0,
    accumulator: 0,
    needsRender: true,
    runIndex: 1,
    runLevels: [],
    runPosition: 0,
    runResults: [],
    runRetries: 0,
    round: null,
    rewardSubmitting: false,
    level: null,
    blocks: [],
    bugs: [],
    projectile: null,
    shotIndex: 0,
    shotsUsed: 0,
    directHits: 0,
    chainKills: 0,
    totalDestroyedBlocks: 0,
    levelStartedAt: 0,
    activePlayMs: 0,
    activeSegmentAt: 0,
    pausedAt: 0,
    aiming: false,
    pointerId: null,
    dragPoint: { x: LAUNCH_X, y: LAUNCH_Y },
    launchedAt: 0,
    settledAt: 0,
    jsBoostAvailable: false,
    impactSpecialUsed: false,
    particles: [],
    levelResult: null,
    soundEnabled: true,
    audioContext: null,
    statusTimer: 0,
    finishTimer: 0,
    runBest: 0,
    highestRunIndex: 0,
    rewardedRuns: {},
    structureAwake: false,
    firstImpactAt: 0
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'byteSlingOverlay';
    overlay.className = 'xp-games-game-overlay byte-sling-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Byte Sling mini-game');
    overlay.innerHTML = `
      <section class="byte-sling-shell">
        <header class="byte-sling-topbar">
          <button type="button" data-byte-sling-back aria-label="Back to Mini-Games">←</button>
          <div class="byte-sling-brand"><strong>🚀 BYTE SLING</strong><small>Debug the System</small></div>
          <button type="button" data-byte-sling-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-byte-sling-close aria-label="Close Byte Sling">×</button>
        </header>

        <div class="byte-sling-hud">
          <div><small>RUN</small><strong data-byte-sling-run>1</strong></div>
          <div><small>LEVEL</small><strong data-byte-sling-level>1/3</strong></div>
          <div><small>SCORE</small><strong data-byte-sling-score>0</strong></div>
          <div><small>SHOTS</small><strong data-byte-sling-shots>3</strong></div>
          <div><small>BUGS</small><strong data-byte-sling-bugs>1</strong></div>
        </div>

        <main class="byte-sling-stage">
          <canvas class="byte-sling-canvas" data-byte-sling-canvas aria-label="Byte Sling game canvas"></canvas>
          <div class="byte-sling-status" data-byte-sling-status>Pull the packet, aim, release.</div>
          <div class="byte-sling-packet-chip"><span data-byte-sling-packet>HTML &lt;&gt;</span><small data-byte-sling-packet-hint>Aim for a weak point</small></div>
        </main>

        <div class="byte-sling-ready" data-byte-sling-ready>
          <div class="byte-sling-card">
            <span class="byte-sling-hero">🚀</span>
            <h2>BYTE SLING</h2>
            <p>Debug the System</p>
            <strong data-byte-sling-ready-run>Run 1 · Levels 1–3</strong>
            <small>Pull • Aim • Release</small>
            <button class="primary" type="button" data-byte-sling-play>PLAY</button>
          </div>
        </div>

        <div class="byte-sling-tutorial" data-byte-sling-tutorial hidden>
          <strong>Pull the CODE PACKET backward.</strong>
          <span>Release to launch. Destroy every BUG.</span>
        </div>

        <div class="byte-sling-result" data-byte-sling-level-result hidden>
          <div class="byte-sling-card">
            <div class="byte-sling-result-icon" data-byte-sling-level-icon>✓</div>
            <p class="byte-sling-kicker" data-byte-sling-level-kicker>SYSTEM CLEAN</p>
            <h2 data-byte-sling-level-title>Level Complete</h2>
            <div class="byte-sling-stars" data-byte-sling-level-stars>★★★</div>
            <div class="byte-sling-stat-grid">
              <div><small>Score</small><strong data-byte-sling-level-score>0</strong></div>
              <div><small>Shots</small><strong data-byte-sling-level-shots>0/0</strong></div>
              <div><small>Direct Hits</small><strong data-byte-sling-level-hits>0</strong></div>
              <div><small>Retries</small><strong data-byte-sling-level-retries>0</strong></div>
            </div>
            <div class="byte-sling-actions">
              <button class="primary" type="button" data-byte-sling-next>NEXT LEVEL</button>
              <button type="button" data-byte-sling-retry>RETRY</button>
              <button type="button" data-byte-sling-skip>SKIP</button>
            </div>
          </div>
        </div>

        <div class="byte-sling-result" data-byte-sling-run-result hidden>
          <div class="byte-sling-card">
            <div class="byte-sling-result-icon">🛡️</div>
            <p class="byte-sling-kicker">RUN COMPLETE</p>
            <h2 data-byte-sling-run-title>Run 1 Complete</h2>
            <div class="byte-sling-stars" data-byte-sling-run-stars>★★★★★★★★★</div>
            <div class="byte-sling-stat-grid">
              <div><small>Cleared</small><strong data-byte-sling-run-cleared>0/3</strong></div>
              <div><small>Run Score</small><strong data-byte-sling-run-score>0</strong></div>
              <div><small>Shots</small><strong data-byte-sling-run-shots>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-byte-sling-run-xp>+0 XP</strong></div>
            </div>
            <p class="byte-sling-reward-note" data-byte-sling-run-note>Checking reward…</p>
            <div class="byte-sling-actions">
              <button class="primary" type="button" data-byte-sling-next-run>NEXT RUN</button>
              <button type="button" data-byte-sling-replay-run>REPLAY RUN</button>
              <button type="button" data-byte-sling-hub>MINI-GAMES</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.byte-sling-shell');
    runtime.canvas = overlay.querySelector('[data-byte-sling-canvas]');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false, desynchronized: true });
    runtime.readyPanel = overlay.querySelector('[data-byte-sling-ready]');
    runtime.levelResultPanel = overlay.querySelector('[data-byte-sling-level-result]');
    runtime.runResultPanel = overlay.querySelector('[data-byte-sling-run-result]');
    runtime.tutorial = overlay.querySelector('[data-byte-sling-tutorial]');
    runtime.statusEl = overlay.querySelector('[data-byte-sling-status]');
    runtime.runEl = overlay.querySelector('[data-byte-sling-run]');
    runtime.levelEl = overlay.querySelector('[data-byte-sling-level]');
    runtime.scoreEl = overlay.querySelector('[data-byte-sling-score]');
    runtime.shotsEl = overlay.querySelector('[data-byte-sling-shots]');
    runtime.bugsEl = overlay.querySelector('[data-byte-sling-bugs]');
    runtime.packetEl = overlay.querySelector('[data-byte-sling-packet]');
    runtime.packetHintEl = overlay.querySelector('[data-byte-sling-packet-hint]');
    runtime.soundBtn = overlay.querySelector('[data-byte-sling-sound]');

    overlay.querySelector('[data-byte-sling-play]').addEventListener('click', startRun);
    overlay.querySelector('[data-byte-sling-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-byte-sling-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-byte-sling-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-byte-sling-next]').addEventListener('click', nextLevelFromResult);
    overlay.querySelector('[data-byte-sling-retry]').addEventListener('click', retryCurrentLevel);
    overlay.querySelector('[data-byte-sling-skip]').addEventListener('click', skipCurrentLevel);
    overlay.querySelector('[data-byte-sling-next-run]').addEventListener('click', startNextRun);
    overlay.querySelector('[data-byte-sling-replay-run]').addEventListener('click', replayRun);
    runtime.soundBtn.addEventListener('click', toggleSound);

    runtime.canvas.addEventListener('pointerdown', onPointerDown);
    runtime.canvas.addEventListener('pointermove', onPointerMove);
    runtime.canvas.addEventListener('pointerup', onPointerUp);
    runtime.canvas.addEventListener('pointercancel', onPointerCancel);
    runtime.canvas.addEventListener('contextmenu', event => event.preventDefault());
    runtime.canvas.addEventListener('dblclick', event => event.preventDefault());

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', queueResize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(queueResize, 100), { passive: true });

    if (typeof ResizeObserver === 'function') {
      runtime.resizeObserver = new ResizeObserver(queueResize);
      runtime.resizeObserver.observe(runtime.shell);
    }
    runtime.built = true;
  }

  function currentRunLevels(index = runtime.runIndex) {
    const safe = clamp(Math.floor(Number(index || 1)), 1, MAX_RUN);
    const start = (safe - 1) * 3 + 1;
    return LEVELS.filter(level => level.id >= start && level.id < start + 3);
  }

  function runLabel(index = runtime.runIndex) {
    const levels = currentRunLevels(index);
    return `Run ${index} · Levels ${levels[0]?.id || 1}–${levels[levels.length - 1]?.id || 3}`;
  }

  function queueResize() {
    if (!runtime.open) return;
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = setTimeout(resizeCanvas, 55);
  }

  function resizeCanvas() {
    if (!runtime.open || !runtime.canvas || !runtime.ctx) return;
    const rect = runtime.canvas.getBoundingClientRect();
    const cssW = Math.max(280, rect.width || 900);
    const cssH = Math.max(300, rect.height || 560);
    const dpr = clamp(Number(devicePixelRatio || 1), 1, MAX_DPR);
    runtime.canvas.width = Math.round(cssW * dpr);
    runtime.canvas.height = Math.round(cssH * dpr);
    runtime.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.min(cssW / WORLD_W, cssH / WORLD_H);
    runtime.view = { cssW, cssH, dpr, scale, ox: (cssW - WORLD_W * scale) / 2, oy: (cssH - WORLD_H * scale) / 2 };
    requestRender();
  }

  function toWorld(clientX, clientY) {
    const rect = runtime.canvas.getBoundingClientRect();
    const x = (clientX - rect.left - runtime.view.ox) / runtime.view.scale;
    const y = (clientY - rect.top - runtime.view.oy) / runtime.view.scale;
    return { x: clamp(x, -60, WORLD_W + 60), y: clamp(y, -60, WORLD_H + 60) };
  }

  function getAudio() {
    if (!runtime.soundEnabled) return null;
    try {
      if (!runtime.audioContext) runtime.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
      return runtime.audioContext;
    } catch (_) { return null; }
  }

  function tone(kind) {
    const ctx = getAudio();
    if (!ctx) return;
    const table = {
      pull: [240, 310, .05, .028], launch: [180, 620, .10, .05], hit: [240, 130, .06, .035],
      bug: [620, 980, .08, .04], boom: [120, 65, .18, .055], win: [520, 1040, .16, .05], lose: [180, 80, .18, .05], boost: [350, 850, .09, .04]
    };
    const [from, to, dur, volume] = table[kind] || table.hit;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = kind === 'boom' || kind === 'lose' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(45, to), now + dur);
    gain.gain.setValueAtTime(__ict8SfxGain(volume), now);
    gain.gain.exponentialRampToValueAtTime(.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + dur + .02);
  }

  function haptic(pattern) {
    if (!runtime.soundEnabled || !navigator.vibrate) return;
    try { navigator.vibrate(pattern); } catch (_) {}
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    try { runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); } catch (_) {}
  }

  function showStatus(text, kind = '') {
    runtime.statusEl.textContent = text;
    runtime.statusEl.dataset.kind = kind;
    clearTimeout(runtime.statusTimer);
    runtime.statusTimer = setTimeout(() => {
      if (!runtime.open) return;
      runtime.statusEl.textContent = runtime.state === 'aiming' ? 'Pull, aim, release.' : runtime.state === 'flying' ? 'DEBUGGING…' : 'Pull the packet, aim, release.';
      runtime.statusEl.dataset.kind = '';
    }, 1100);
  }

  function packetForShot(index = runtime.shotIndex) {
    const id = runtime.level?.shots?.[index] || 'html';
    return PACKETS[id] || PACKETS.html;
  }

  function createBlock(spec, index) {
    const mat = MATERIALS[spec.m] || MATERIALS.panel;
    const areaScale = Math.max(.7, (Number(spec.w || 1) * Number(spec.h || 1)) / 3400);
    const mass = mat.static ? Infinity : Math.max(.8, mat.mass * areaScale);
    const inertia = mat.static ? Infinity : mass * (spec.w * spec.w + spec.h * spec.h) / 12;
    return {
      id: `b${index}`, x: spec.x, y: spec.y, w: spec.w, h: spec.h,
      vx: 0, vy: 0, angle: 0, av: 0,
      material: spec.m, mass, invMass: mat.static ? 0 : 1 / mass,
      inertia, invInertia: mat.static ? 0 : 1 / inertia,
      hp: mat.hp, maxHp: mat.hp, static: Boolean(mat.static), alive: true,
      lastImpact: 0, contactFrames: 0
    };
  }


  function createBug(spec, index) {
    const mass = .95;
    const r = 18;
    return {
      id: `g${index}`, x: spec.x, y: spec.y, r, vx: 0, vy: 0,
      angle: 0, av: 0, mass, invMass: 1 / mass,
      inertia: .5 * mass * r * r, invInertia: 1 / (.5 * mass * r * r),
      alive: true, wobble: index * .8
    };
  }


  function createProjectile(packet) {
    const mass = Math.max(1.1, Number(packet.mass || 1) * 1.55);
    const r = PROJECTILE_R;
    const inertia = .5 * mass * r * r;
    return {
      x: LAUNCH_X, y: LAUNCH_Y, r, vx: 0, vy: 0, angle: 0, av: 0,
      mass, invMass: 1 / mass, inertia, invInertia: 1 / inertia,
      packet, loaded: true, launched: false, alive: true,
      impactCount: 0, specialUsed: false
    };
  }


  function snapBugInitialToSupport(bug) {
    // V469B levels already store exact stable coordinates. Keep this helper as
    // a small safety clamp only; never move a target onto an unrelated surface.
    bug.x = clamp(bug.x, bug.r, WORLD_W - bug.r);
    bug.y = Math.min(bug.y, GROUND_Y - bug.r);
  }


  function loadLevel(level) {
    clearTimeout(runtime.finishTimer);
    runtime.level = level;
    runtime.blocks = level.blocks.map(createBlock);
    runtime.bugs = level.bugs.map(createBug);
    runtime.bugs.forEach(snapBugInitialToSupport);
    runtime.shotIndex = 0;
    runtime.shotsUsed = 0;
    runtime.directHits = 0;
    runtime.chainKills = 0;
    runtime.totalDestroyedBlocks = 0;
    runtime.levelStartedAt = performance.now();
    runtime.activePlayMs = 0;
    runtime.activeSegmentAt = performance.now();
    runtime.projectile = createProjectile(packetForShot(0));
    runtime.aiming = false;
    runtime.pointerId = null;
    runtime.dragPoint = { x: LAUNCH_X, y: LAUNCH_Y };
    runtime.launchedAt = 0;
    runtime.settledAt = 0;
    runtime.jsBoostAvailable = runtime.projectile.packet.id === 'js';
    runtime.impactSpecialUsed = false;
    runtime.structureAwake = false;
    runtime.firstImpactAt = 0;
    runtime.particles.length = 0;
    runtime.levelResult = null;
    runtime.state = 'ready-shot';
    runtime.levelResultPanel.hidden = true;
    runtime.runResultPanel.hidden = true;
    updateHud();
    showStatus('Pull down-left, line up the dots, release.');
    requestRender();
  }


  function updateHud() {
    const levelScore = runtime.levelResult?.score || 0;
    const runScore = runtime.runResults.reduce((sum, row) => sum + Number(row?.score || 0), 0) + levelScore;
    runtime.runEl.textContent = String(runtime.runIndex);
    runtime.levelEl.textContent = `${runtime.runPosition + 1}/3`;
    runtime.scoreEl.textContent = String(runScore);
    runtime.shotsEl.textContent = String(Math.max(0, (runtime.level?.shots?.length || 0) - runtime.shotsUsed));
    runtime.bugsEl.textContent = String(runtime.bugs.filter(bug => bug.alive).length);
    const packet = runtime.projectile?.packet || packetForShot(runtime.shotIndex);
    runtime.packetEl.textContent = `${packet.label} ${packet.symbol}`;
    runtime.packetEl.style.setProperty('--packet-color', packet.fill);
    runtime.packetHintEl.textContent = packet.id === 'js' ? 'Tap mid-air once to BOOST' : packet.id === 'css' ? 'Impact creates a push pulse' : packet.id === 'debug' ? 'Impact sends a debug burst' : 'Strong direct impact';
  }

  function resetRunState() {
    runtime.runLevels = currentRunLevels(runtime.runIndex);
    runtime.runPosition = 0;
    runtime.runResults = [];
    runtime.runRetries = 0;
    runtime.rewardSubmitting = false;
    runtime.round = null;
    runtime.levelResult = null;
  }

  function startRun() {
    if (!runtime.open) return;
    resetRunState();
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    runtime.readyPanel.hidden = true;
    runtime.levelResultPanel.hidden = true;
    runtime.runResultPanel.hidden = true;
    loadLevel(runtime.runLevels[0]);
    maybeShowTutorial();
  }

  function maybeShowTutorial() {
    let seen = false;
    try { seen = localStorage.getItem(TUTORIAL_KEY) === '1'; } catch (_) {}
    if (seen) return;
    runtime.tutorial.hidden = false;
    const strong = runtime.tutorial.querySelector('strong');
    const span = runtime.tutorial.querySelector('span');
    if (strong) strong.textContent = 'Pull the packet down-left.';
    if (span) span.textContent = 'Line up the dotted arc with the structure, then release.';
    try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch (_) {}
    setTimeout(() => { if (runtime.tutorial) runtime.tutorial.hidden = true; }, 3600);
  }


  function onPointerDown(event) {
    if (!runtime.open || runtime.levelResultPanel.hidden === false || runtime.runResultPanel.hidden === false) return;
    const p = toWorld(event.clientX, event.clientY);

    if (runtime.state === 'flying' && runtime.projectile?.packet?.id === 'js' && runtime.jsBoostAvailable) {
      event.preventDefault();
      applyJsBoost();
      return;
    }

    if (runtime.state !== 'ready-shot' || !runtime.projectile?.loaded) return;
    const dx = p.x - runtime.projectile.x;
    const dy = p.y - runtime.projectile.y;
    if (dx * dx + dy * dy > 72 * 72) return;
    event.preventDefault();
    try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
    runtime.pointerId = event.pointerId;
    runtime.aiming = true;
    runtime.state = 'aiming';
    updateAim(p);
    tone('pull');
    requestRender();
  }

  function onPointerMove(event) {
    if (!runtime.aiming || runtime.pointerId !== event.pointerId) return;
    event.preventDefault();
    const events = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [event];
    const last = events[events.length - 1] || event;
    updateAim(toWorld(last.clientX, last.clientY));
    requestRender();
  }

  function onPointerUp(event) {
    if (!runtime.aiming || runtime.pointerId !== event.pointerId) return;
    event.preventDefault();
    try { runtime.canvas.releasePointerCapture(event.pointerId); } catch (_) {}
    runtime.pointerId = null;
    runtime.aiming = false;
    launchProjectile();
  }

  function onPointerCancel(event) {
    if (runtime.pointerId !== event.pointerId) return;
    runtime.pointerId = null;
    runtime.aiming = false;
    runtime.state = 'ready-shot';
    runtime.dragPoint = { x: LAUNCH_X, y: LAUNCH_Y };
    if (runtime.projectile) { runtime.projectile.x = LAUNCH_X; runtime.projectile.y = LAUNCH_Y; }
    requestRender();
  }


  function updateAim(point) {
    let dx = point.x - LAUNCH_X;
    let dy = point.y - LAUNCH_Y;
    // A slingshot only pulls behind the anchor. A small right-side allowance
    // keeps finger acquisition forgiving without creating reverse launches.
    dx = Math.min(12, dx);
    const len = Math.hypot(dx, dy) || 1;
    if (len > MAX_PULL) {
      dx = dx / len * MAX_PULL;
      dy = dy / len * MAX_PULL;
    }
    runtime.dragPoint = { x: LAUNCH_X + dx, y: LAUNCH_Y + dy };
    runtime.projectile.x = runtime.dragPoint.x;
    runtime.projectile.y = runtime.dragPoint.y;
  }


  function launchProjectile() {
    const projectile = runtime.projectile;
    if (!projectile) return;
    const dx = LAUNCH_X - projectile.x;
    const dy = LAUNCH_Y - projectile.y;
    const pull = Math.hypot(dx, dy);
    if (pull < 18) {
      projectile.x = LAUNCH_X;
      projectile.y = LAUNCH_Y;
      runtime.state = 'ready-shot';
      requestRender();
      return;
    }
    const speed = pull * 5.65 * projectile.packet.power;
    const nx = dx / pull;
    const ny = dy / pull;
    projectile.vx = nx * speed;
    projectile.vy = ny * speed;
    projectile.loaded = false;
    projectile.launched = true;
    projectile.av = projectile.vx * 0.0021;
    runtime.shotsUsed += 1;
    runtime.shotIndex += 1;
    runtime.launchedAt = performance.now();
    runtime.settledAt = 0;
    runtime.state = 'flying';
    runtime.jsBoostAvailable = projectile.packet.id === 'js';
    tone('launch');
    haptic(12);
    updateHud();
    ensureLoop();
  }


  function applyJsBoost() {
    const p = runtime.projectile;
    if (!p || !p.launched || !runtime.jsBoostAvailable) return;
    const speed = Math.hypot(p.vx, p.vy);
    if (speed < 20) return;
    p.vx *= 1.32;
    p.vy = p.vy * 1.20 - 70;
    runtime.jsBoostAvailable = false;
    p.specialUsed = true;
    spawnBurst(p.x, p.y, PACKETS.js.fill, 8);
    tone('boost'); haptic(8);
    showStatus('JS BOOST!', 'good');
  }

  function onVisibilityChange() {
    if (!runtime.open) return;
    if (document.hidden) {
      if (runtime.activeSegmentAt) {
        runtime.activePlayMs += Math.max(0, performance.now() - runtime.activeSegmentAt);
        runtime.activeSegmentAt = 0;
      }
      runtime.pausedAt = performance.now();
      if (runtime.raf) cancelAnimationFrame(runtime.raf);
      runtime.raf = 0;
    } else {
      runtime.activeSegmentAt = performance.now();
      runtime.lastFrame = performance.now();
      runtime.accumulator = 0;
      requestRender();
      if (runtime.state === 'flying') ensureLoop();
    }
  }

  function requestRender() {
    runtime.needsRender = true;
    ensureLoop();
  }

  function ensureLoop() {
    if (!runtime.open || runtime.raf || document.hidden) return;
    runtime.raf = requestAnimationFrame(frame);
  }

  function frame(time) {
    runtime.raf = 0;
    if (!runtime.open || document.hidden) return;
    const delta = clamp((time - (runtime.lastFrame || time)) / 1000, 0, 0.05);
    runtime.lastFrame = time;

    if (runtime.state === 'flying') {
      runtime.accumulator = Math.min(0.12, runtime.accumulator + delta);
      const step = FIXED_STEP;
      let loops = 0;
      while (runtime.accumulator >= step && loops < 10) {
        physicsStep(step);
        runtime.accumulator -= step;
        loops += 1;
      }
      updateFlightEnd(time);
      runtime.needsRender = true;
    }

    if (runtime.particles.length) {
      updateParticles(delta);
      runtime.needsRender = true;
    }

    if (runtime.needsRender) {
      render(time);
      runtime.needsRender = false;
    }

    if (runtime.state === 'flying' || runtime.particles.length || runtime.aiming) ensureLoop();
  }

  function vecDot(a, b) { return a.x * b.x + a.y * b.y; }
  function vecCross(a, b) { return a.x * b.y - a.y * b.x; }
  function crossSV(s, v) { return { x: -s * v.y, y: s * v.x }; }
  function bodyVelocityAt(body, point) {
    const r = { x: point.x - body.x, y: point.y - body.y };
    const spin = crossSV(body.av || 0, r);
    return { x: body.vx + spin.x, y: body.vy + spin.y };
  }

  function rectAxes(body) {
    const c = Math.cos(body.angle || 0);
    const s = Math.sin(body.angle || 0);
    return { ux: { x: c, y: s }, uy: { x: -s, y: c } };
  }

  function rectVertices(body) {
    const axes = rectAxes(body);
    const hx = body.w / 2, hy = body.h / 2;
    return [
      { x: body.x - axes.ux.x * hx - axes.uy.x * hy, y: body.y - axes.ux.y * hx - axes.uy.y * hy },
      { x: body.x + axes.ux.x * hx - axes.uy.x * hy, y: body.y + axes.ux.y * hx - axes.uy.y * hy },
      { x: body.x + axes.ux.x * hx + axes.uy.x * hy, y: body.y + axes.ux.y * hx + axes.uy.y * hy },
      { x: body.x - axes.ux.x * hx + axes.uy.x * hy, y: body.y - axes.ux.y * hx + axes.uy.y * hy }
    ];
  }

  function rectSupport(body, dir) {
    const axes = rectAxes(body);
    const hx = body.w / 2, hy = body.h / 2;
    const sx = vecDot(dir, axes.ux) >= 0 ? hx : -hx;
    const sy = vecDot(dir, axes.uy) >= 0 ? hy : -hy;
    return {
      x: body.x + axes.ux.x * sx + axes.uy.x * sy,
      y: body.y + axes.ux.y * sx + axes.uy.y * sy
    };
  }

  function resolveContact(a, b, normal, penetration, contact, restitution, friction) {
    const invA = a && Number(a.invMass || 0);
    const invB = b && Number(b.invMass || 0);
    const invIA = a && Number(a.invInertia || 0);
    const invIB = b && Number(b.invInertia || 0);
    const invSum = invA + invB;
    if (invSum <= 0) return 0;

    const ra = { x: contact.x - a.x, y: contact.y - a.y };
    const rb = { x: contact.x - b.x, y: contact.y - b.y };
    const va = bodyVelocityAt(a, contact);
    const vb = bodyVelocityAt(b, contact);
    let rv = { x: vb.x - va.x, y: vb.y - va.y };
    const velAlongNormal = vecDot(rv, normal);
    const closingSpeed = Math.max(0, -velAlongNormal);

    if (velAlongNormal < 0) {
      const raCrossN = vecCross(ra, normal);
      const rbCrossN = vecCross(rb, normal);
      const denom = invA + invB + raCrossN * raCrossN * invIA + rbCrossN * rbCrossN * invIB;
      if (denom > 0) {
        const j = -(1 + restitution) * velAlongNormal / denom;
        const ix = normal.x * j, iy = normal.y * j;
        if (invA > 0) {
          a.vx -= ix * invA; a.vy -= iy * invA;
          a.av -= vecCross(ra, { x: ix, y: iy }) * invIA;
        }
        if (invB > 0) {
          b.vx += ix * invB; b.vy += iy * invB;
          b.av += vecCross(rb, { x: ix, y: iy }) * invIB;
        }

        const va2 = bodyVelocityAt(a, contact);
        const vb2 = bodyVelocityAt(b, contact);
        rv = { x: vb2.x - va2.x, y: vb2.y - va2.y };
        const normalPart = vecDot(rv, normal);
        let tx = rv.x - normal.x * normalPart;
        let ty = rv.y - normal.y * normalPart;
        const tl = Math.hypot(tx, ty);
        if (tl > .0001) {
          tx /= tl; ty /= tl;
          const raCrossT = ra.x * ty - ra.y * tx;
          const rbCrossT = rb.x * ty - rb.y * tx;
          const tDenom = invA + invB + raCrossT * raCrossT * invIA + rbCrossT * rbCrossT * invIB;
          if (tDenom > 0) {
            let jt = -vecDot(rv, { x: tx, y: ty }) / tDenom;
            const maxFriction = Math.abs(j) * friction;
            jt = clamp(jt, -maxFriction, maxFriction);
            const fix = tx * jt, fiy = ty * jt;
            if (invA > 0) {
              a.vx -= fix * invA; a.vy -= fiy * invA;
              a.av -= vecCross(ra, { x: fix, y: fiy }) * invIA;
            }
            if (invB > 0) {
              b.vx += fix * invB; b.vy += fiy * invB;
              b.av += vecCross(rb, { x: fix, y: fiy }) * invIB;
            }
          }
        }
      }
    }

    const slop = .08;
    const percent = .72;
    const correction = Math.max(0, penetration - slop) * percent / invSum;
    if (correction > 0) {
      if (invA > 0) {
        a.x -= normal.x * correction * invA;
        a.y -= normal.y * correction * invA;
      }
      if (invB > 0) {
        b.x += normal.x * correction * invB;
        b.y += normal.y * correction * invB;
      }
    }
    return closingSpeed;
  }

  function circleRectContact(circle, rect) {
    const axes = rectAxes(rect);
    const rel = { x: circle.x - rect.x, y: circle.y - rect.y };
    const lx = vecDot(rel, axes.ux);
    const ly = vecDot(rel, axes.uy);
    const hx = rect.w / 2, hy = rect.h / 2;
    const qx = clamp(lx, -hx, hx);
    const qy = clamp(ly, -hy, hy);
    let dx = lx - qx, dy = ly - qy;
    let dist2 = dx * dx + dy * dy;
    let localNx, localNy, penetration;

    if (dist2 > .000001) {
      const dist = Math.sqrt(dist2);
      if (dist >= circle.r) return null;
      // Local normal from circle (A) toward rectangle (B).
      localNx = -dx / dist;
      localNy = -dy / dist;
      penetration = circle.r - dist;
    } else {
      const gapX = hx - Math.abs(lx);
      const gapY = hy - Math.abs(ly);
      if (gapX < gapY) {
        localNx = lx >= 0 ? -1 : 1;
        localNy = 0;
        penetration = circle.r + gapX;
      } else {
        localNx = 0;
        localNy = ly >= 0 ? -1 : 1;
        penetration = circle.r + gapY;
      }
    }

    const normal = {
      x: axes.ux.x * localNx + axes.uy.x * localNy,
      y: axes.ux.y * localNx + axes.uy.y * localNy
    };
    const contact = {
      x: rect.x + axes.ux.x * qx + axes.uy.x * qy,
      y: rect.y + axes.ux.y * qx + axes.uy.y * qy
    };
    return { normal, penetration, contact };
  }

  function pointInRect(point, body) {
    const axes = rectAxes(body);
    const rel = { x: point.x - body.x, y: point.y - body.y };
    return Math.abs(vecDot(rel, axes.ux)) <= body.w / 2 + .02
      && Math.abs(vecDot(rel, axes.uy)) <= body.h / 2 + .02;
  }

  function segmentIntersection(a1, a2, b1, b2) {
    const r = { x: a2.x - a1.x, y: a2.y - a1.y };
    const s = { x: b2.x - b1.x, y: b2.y - b1.y };
    const denom = vecCross(r, s);
    if (Math.abs(denom) < 1e-8) return null;
    const qp = { x: b1.x - a1.x, y: b1.y - a1.y };
    const t = vecCross(qp, s) / denom;
    const u = vecCross(qp, r) / denom;
    if (t < -.001 || t > 1.001 || u < -.001 || u > 1.001) return null;
    return { x: a1.x + r.x * t, y: a1.y + r.y * t };
  }

  function rectIntersectionCenter(a, b, fallback) {
    const av = rectVertices(a), bv = rectVertices(b);
    const points = [];
    for (const p of av) if (pointInRect(p, b)) points.push(p);
    for (const p of bv) if (pointInRect(p, a)) points.push(p);
    for (let i = 0; i < 4; i += 1) {
      const a1 = av[i], a2 = av[(i + 1) % 4];
      for (let j = 0; j < 4; j += 1) {
        const hit = segmentIntersection(a1, a2, bv[j], bv[(j + 1) % 4]);
        if (hit) points.push(hit);
      }
    }
    if (!points.length) return fallback;
    let x = 0, y = 0;
    for (const p of points) { x += p.x; y += p.y; }
    return { x: x / points.length, y: y / points.length };
  }

  function rectRectContact(a, b) {
    const aa = rectAxes(a), ba = rectAxes(b);
    const axes = [aa.ux, aa.uy, ba.ux, ba.uy];
    const delta = { x: b.x - a.x, y: b.y - a.y };
    let bestAxis = null;
    let bestOverlap = Infinity;

    for (const axis of axes) {
      const ra = a.w / 2 * Math.abs(vecDot(axis, aa.ux)) + a.h / 2 * Math.abs(vecDot(axis, aa.uy));
      const rb = b.w / 2 * Math.abs(vecDot(axis, ba.ux)) + b.h / 2 * Math.abs(vecDot(axis, ba.uy));
      const distance = Math.abs(vecDot(delta, axis));
      const overlap = ra + rb - distance;
      if (overlap <= 0) return null;
      if (overlap < bestOverlap) {
        const sign = vecDot(delta, axis) >= 0 ? 1 : -1;
        bestOverlap = overlap;
        bestAxis = { x: axis.x * sign, y: axis.y * sign };
      }
    }

    const sa = rectSupport(a, bestAxis);
    const sb = rectSupport(b, { x: -bestAxis.x, y: -bestAxis.y });
    const fallback = { x: (sa.x + sb.x) / 2, y: (sa.y + sb.y) / 2 };
    return {
      normal: bestAxis,
      penetration: bestOverlap,
      contact: rectIntersectionCenter(a, b, fallback)
    };
  }

  function resolveCircleGround(circle, bounce, friction) {
    const penetration = circle.y + circle.r - GROUND_Y;
    if (penetration <= 0) return 0;
    const ground = { x: circle.x, y: GROUND_Y, vx: 0, vy: 0, av: 0, invMass: 0, invInertia: 0 };
    return resolveContact(circle, ground, { x: 0, y: 1 }, penetration,
      { x: circle.x, y: GROUND_Y }, bounce, friction);
  }

  function resolveRectGround(block) {
    const vertices = rectVertices(block);
    let deepest = null;
    let penetration = 0;
    for (const v of vertices) {
      const p = v.y - GROUND_Y;
      if (p > penetration) { penetration = p; deepest = v; }
    }
    if (!deepest) return 0;
    const ground = { x: deepest.x, y: GROUND_Y, vx: 0, vy: 0, av: 0, invMass: 0, invInertia: 0 };
    return resolveContact(block, ground, { x: 0, y: 1 }, penetration,
      { x: deepest.x, y: GROUND_Y }, .03, .72);
  }

  function keepRectInWorld(block) {
    const vertices = rectVertices(block);
    let minX = Infinity, maxX = -Infinity;
    for (const v of vertices) { minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x); }
    if (minX < 0) {
      block.x += -minX;
      if (block.vx < 0) block.vx *= -.18;
      block.av *= .72;
    }
    if (maxX > WORLD_W) {
      block.x -= maxX - WORLD_W;
      if (block.vx > 0) block.vx *= -.18;
      block.av *= .72;
    }
  }

  function keepCircleInWorld(body) {
    if (body.x - body.r < 0) { body.x = body.r; if (body.vx < 0) body.vx *= -.2; }
    if (body.x + body.r > WORLD_W) { body.x = WORLD_W - body.r; if (body.vx > 0) body.vx *= -.2; }
  }

  function wakeStructure() {
    if (runtime.structureAwake) return;
    runtime.structureAwake = true;
    runtime.firstImpactAt = performance.now();
  }

  function physicsStep(dt) {
    const p = runtime.projectile;
    if (p?.alive && p.launched) {
      p.vy += GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.av * dt;
      p.vx *= .9994;
      p.vy *= .9997;
      p.av *= .998;
      keepCircleInWorld(p);
      resolveCircleGround(p, .28, .36);
    }

    if (runtime.structureAwake) {
      for (const block of runtime.blocks) {
        if (!block.alive || block.static) continue;
        block.vy += GRAVITY * dt;
        block.x += block.vx * dt;
        block.y += block.vy * dt;
        block.angle += block.av * dt;
        block.vx *= .9991;
        block.vy *= .9995;
        block.av *= .9965;
      }
      for (const bug of runtime.bugs) {
        if (!bug.alive) continue;
        bug.vy += GRAVITY * dt;
        bug.x += bug.vx * dt;
        bug.y += bug.vy * dt;
        bug.vx *= .998;
        bug.vy *= .999;
      }
    }

    // Four light solver passes are enough for the small body counts in this game.
    for (let iter = 0; iter < 4; iter += 1) {
      if (p?.alive && p.launched) {
        resolveCircleGround(p, .22, .34);
        keepCircleInWorld(p);
        for (const block of runtime.blocks) {
          if (!block.alive) continue;
          const hit = circleRectContact(p, block);
          if (!hit) continue;
          const before = Math.max(0, -(bodyVelocityAt(block, hit.contact).x - bodyVelocityAt(p, hit.contact).x) * hit.normal.x
            -(bodyVelocityAt(block, hit.contact).y - bodyVelocityAt(p, hit.contact).y) * hit.normal.y);
          wakeStructure();
          const impact = resolveContact(p, block, hit.normal, hit.penetration, hit.contact,
            MATERIALS[block.material]?.restitution ?? .08, .42);
          const realImpact = Math.max(before, impact);
          if (iter === 0 && realImpact > 35) {
            const now = performance.now();
            if (now - Number(block.lastImpact || 0) > 75) {
              block.lastImpact = now;
              damageBlock(block, realImpact * p.packet.power, hit.contact.x, hit.contact.y);
              p.impactCount += 1;
              if (!p.specialUsed) applyPacketImpactSpecial(p, hit.contact.x, hit.contact.y);
              tone('hit');
              spawnBurst(hit.contact.x, hit.contact.y, p.packet.fill, 5);
            }
          }
        }

        for (const bug of runtime.bugs) {
          if (!bug.alive) continue;
          const dx = bug.x - p.x, dy = bug.y - p.y;
          const rr = bug.r + p.r;
          const dist2 = dx * dx + dy * dy;
          if (dist2 >= rr * rr) continue;
          const d = Math.sqrt(Math.max(.0001, dist2));
          const normal = { x: dx / d, y: dy / d };
          const contact = { x: p.x + normal.x * p.r, y: p.y + normal.y * p.r };
          wakeStructure();
          const impact = resolveContact(p, bug, normal, rr - d, contact, .14, .35);
          if (impact > 45) {
            runtime.directHits += 1;
            killBug(bug, 'direct', bug.x, bug.y);
            showStatus('BUG DEBUGGED!', 'good');
          }
        }
      }

      if (!runtime.structureAwake) continue;

      for (const block of runtime.blocks) {
        if (!block.alive || block.static) continue;
        const groundImpact = resolveRectGround(block);
        keepRectInWorld(block);
        if (groundImpact > 420) damageBlock(block, groundImpact * .26, block.x, GROUND_Y);
      }

      const liveBlocks = runtime.blocks.filter(block => block.alive);
      for (let i = 0; i < liveBlocks.length; i += 1) {
        const a = liveBlocks[i];
        for (let j = i + 1; j < liveBlocks.length; j += 1) {
          const b = liveBlocks[j];
          if (a.static && b.static) continue;
          const hit = rectRectContact(a, b);
          if (!hit) continue;
          const impact = resolveContact(a, b, hit.normal, hit.penetration, hit.contact, .025, .62);
          if (iter === 0 && impact > 330) {
            if (!a.static) damageBlock(a, impact * .18, hit.contact.x, hit.contact.y);
            if (!b.static) damageBlock(b, impact * .18, hit.contact.x, hit.contact.y);
          }
        }
      }

      for (const bug of runtime.bugs) {
        if (!bug.alive) continue;
        resolveCircleGround(bug, .02, .56);
        keepCircleInWorld(bug);
        for (const block of runtime.blocks) {
          if (!block.alive) continue;
          const hit = circleRectContact(bug, block);
          if (!hit) continue;
          const impact = resolveContact(bug, block, hit.normal, hit.penetration, hit.contact, .02, .50);
          const blockSpeed = Math.hypot(block.vx, block.vy) + Math.abs(block.av) * Math.max(block.w, block.h) * .28;
          if (!block.static && (impact > 72 || blockSpeed > 120)) {
            runtime.chainKills += 1;
            killBug(bug, 'crush', bug.x, bug.y);
            break;
          }
        }
      }

      const liveBugs = runtime.bugs.filter(bug => bug.alive);
      for (let i = 0; i < liveBugs.length; i += 1) {
        for (let j = i + 1; j < liveBugs.length; j += 1) {
          const a = liveBugs[i], b = liveBugs[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const rr = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= rr * rr) continue;
          const d = Math.sqrt(Math.max(.0001, d2));
          const normal = { x: dx / d, y: dy / d };
          resolveContact(a, b, normal, rr - d,
            { x: a.x + normal.x * a.r, y: a.y + normal.y * a.r }, .02, .35);
        }
      }
    }

    cleanupDeadBodies();
  }

  function applyPacketImpactSpecial(p, x, y) {
    if (p.packet.id === 'css') {
      p.specialUsed = true;
      wakeStructure();
      shockwave(x, y, 145, 310, false);
      showStatus('CSS IMPACT PULSE!', 'good');
      spawnBurst(x, y, PACKETS.css.fill, 10);
      haptic(8);
    } else if (p.packet.id === 'debug') {
      p.specialUsed = true;
      wakeStructure();
      shockwave(x, y, 118, 235, true);
      showStatus('DEBUG BURST!', 'good');
      spawnBurst(x, y, PACKETS.debug.fill, 10);
      haptic([8, 20, 8]);
    }
  }

  function shockwave(x, y, radius, strength, debugKills) {
    wakeStructure();
    for (const block of runtime.blocks) {
      if (!block.alive || block.static) continue;
      const dx = block.x - x, dy = block.y - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > radius) continue;
      const power = (1 - d / radius) * strength;
      block.vx += dx / d * power * block.invMass;
      block.vy += dy / d * power * block.invMass - 18;
      block.av += (Math.random() - .5) * .7;
    }
    for (const bug of runtime.bugs) {
      if (!bug.alive) continue;
      const dx = bug.x - x, dy = bug.y - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > radius) continue;
      if (debugKills && d < radius * .52) {
        killBug(bug, 'debug', x, y);
      } else {
        const power = (1 - d / radius) * strength * .62;
        bug.vx += dx / d * power;
        bug.vy += dy / d * power - 22;
      }
    }
  }

  function damageBlock(block, impact, x, y) {
    if (!block.alive || block.static) return;
    const material = MATERIALS[block.material] || MATERIALS.panel;
    const divisor = block.material === 'server' ? 520 : block.material === 'power' ? 340 : 300;
    const damage = Math.max(0, impact) / divisor;
    if (damage < .12) return;
    block.hp -= damage;
    if (block.hp > 0) return;
    block.alive = false;
    runtime.totalDestroyedBlocks += 1;
    spawnBurst(block.x, block.y, material.fill, 9);
    if (material.explosive) {
      tone('boom');
      shockwave(block.x, block.y, 165, 380, false);
      spawnBurst(block.x, block.y, '#fbbf24', 14);
    }
  }

  function killBug(bug, reason, x, y) {
    if (!bug.alive) return;
    bug.alive = false;
    bug.vx = 0; bug.vy = 0;
    spawnBurst(x, y, '#fb7185', 8);
    tone('bug'); haptic(7);
    updateHud();
    if (!runtime.bugs.some(item => item.alive)) {
      clearTimeout(runtime.finishTimer);
      runtime.finishTimer = setTimeout(() => completeLevel(true), 220);
    }
  }

  function cleanupDeadBodies() {
    // Arrays stay stable for the entire level to avoid allocation churn.
  }

  function movingEnergy() {
    let energy = 0;
    if (runtime.structureAwake) {
      for (const block of runtime.blocks) {
        if (block.alive && !block.static) energy += Math.abs(block.vx) + Math.abs(block.vy) + Math.abs(block.av) * 24;
      }
      for (const bug of runtime.bugs) if (bug.alive) energy += (Math.abs(bug.vx) + Math.abs(bug.vy)) * .25;
    }
    const p = runtime.projectile;
    if (p?.alive && p.launched) energy += Math.abs(p.vx) + Math.abs(p.vy);
    return energy;
  }

  function updateFlightEnd(now) {
    if (!runtime.projectile?.launched) return;
    if (!runtime.bugs.some(bug => bug.alive)) return;
    const p = runtime.projectile;
    const out = p.x < -120 || p.x > WORLD_W + 120 || p.y > WORLD_H + 140;
    const projectileSlow = Math.hypot(p.vx, p.vy) < 28;
    const sceneSlow = movingEnergy() < 125;
    const tooLong = now - runtime.launchedAt > 7600;
    if ((projectileSlow && sceneSlow) || out || tooLong) {
      if (!runtime.settledAt) runtime.settledAt = now;
      if (now - runtime.settledAt < 520) return;
      p.alive = false;
      const totalShots = runtime.level?.shots?.length || 0;
      if (runtime.shotsUsed >= totalShots) completeLevel(false);
      else loadNextProjectile();
    } else {
      runtime.settledAt = 0;
    }
  }

  function loadNextProjectile() {
    const packet = packetForShot(runtime.shotIndex);
    runtime.projectile = createProjectile(packet);
    runtime.dragPoint = { x: LAUNCH_X, y: LAUNCH_Y };
    runtime.state = 'ready-shot';
    runtime.jsBoostAvailable = packet.id === 'js';
    runtime.settledAt = 0;
    updateHud();
    showStatus('Next packet ready. Pull down-left and aim with the dots.');
    requestRender();
  }

  function levelScore(cleared) {
    const maxShots = Math.max(1, runtime.level?.shots?.length || 1);
    const used = clamp(runtime.shotsUsed, 0, maxShots);
    const remaining = Math.max(0, maxShots - used);
    const shotBonus = cleared ? Math.round(250 * (remaining / maxShots)) : 0;
    const precision = used > 0 ? clamp(runtime.directHits / used, 0, 1) : 0;
    const accuracyBonus = cleared ? Math.round(100 * precision) : 0;
    const totalBugs = Math.max(1, runtime.level?.bugs?.length || 1);
    const chainRatio = clamp(runtime.chainKills / totalBugs, 0, 1);
    const bugPerShot = used > 0 ? totalBugs / used : 0;
    const strategyBonus = cleared ? clamp(Math.round(bugPerShot * 62 + chainRatio * 78), 0, 150) : 0;
    return clamp((cleared ? 500 : 0) + shotBonus + accuracyBonus + strategyBonus, 0, 1000);
  }

  function starsForScore(score) {
    if (score >= 850) return 3;
    if (score >= 650) return 2;
    if (score >= 500) return 1;
    return 0;
  }

  function completeLevel(cleared) {
    if (!runtime.open || runtime.levelResult || runtime.state === 'level-result' || runtime.state === 'run-result') return;
    if (runtime.activeSegmentAt) {
      runtime.activePlayMs += Math.max(0, performance.now() - runtime.activeSegmentAt);
      runtime.activeSegmentAt = performance.now();
    }
    runtime.state = 'level-result';
    const score = levelScore(cleared);
    const stars = starsForScore(score);
    const result = {
      levelId: runtime.level.id,
      cleared: Boolean(cleared),
      score,
      stars,
      shotsUsed: runtime.shotsUsed,
      maxShots: runtime.level.shots.length,
      directHits: runtime.directHits,
      chainKills: runtime.chainKills,
      bugsDestroyed: runtime.level.bugs.length - runtime.bugs.filter(bug => bug.alive).length,
      totalBugs: runtime.level.bugs.length,
      retries: 0,
      activeTimeMs: Math.max(0, Math.round(runtime.activePlayMs))
    };
    runtime.levelResult = result;
    renderLevelResult(result);
    cleared ? tone('win') : tone('lose');
    haptic(cleared ? [10, 22, 10] : 28);
    spawnBurst(820, 260, cleared ? '#a3e635' : '#fb7185', 14);
    requestRender();
  }

  function renderLevelResult(result) {
    const panel = runtime.levelResultPanel;
    panel.hidden = false;
    panel.querySelector('[data-byte-sling-level-icon]').textContent = result.cleared ? '✓' : '!';
    panel.querySelector('[data-byte-sling-level-kicker]').textContent = result.cleared ? 'SYSTEM CLEAN' : 'DEBUG FAILED';
    panel.querySelector('[data-byte-sling-level-title]').textContent = result.cleared ? `Level ${result.levelId} Clear` : `Level ${result.levelId} Failed`;
    panel.querySelector('[data-byte-sling-level-stars]').textContent = result.cleared ? `${'★'.repeat(result.stars)}${'☆'.repeat(3 - result.stars)}` : '☆☆☆';
    panel.querySelector('[data-byte-sling-level-score]').textContent = String(result.score);
    panel.querySelector('[data-byte-sling-level-shots]').textContent = `${result.shotsUsed}/${result.maxShots}`;
    panel.querySelector('[data-byte-sling-level-hits]').textContent = String(result.directHits);
    panel.querySelector('[data-byte-sling-level-retries]').textContent = String(runtime.runRetries);
    const next = panel.querySelector('[data-byte-sling-next]');
    const retry = panel.querySelector('[data-byte-sling-retry]');
    const skip = panel.querySelector('[data-byte-sling-skip]');
    next.hidden = !result.cleared;
    retry.hidden = false;
    skip.hidden = result.cleared;
  }

  function retryCurrentLevel() {
    if (!runtime.level) return;
    runtime.runRetries += 1;
    runtime.levelResultPanel.hidden = true;
    loadLevel(runtime.level);
  }

  function skipCurrentLevel() {
    if (!runtime.levelResult || runtime.levelResult.cleared) return;
    commitCurrentLevelResult();
  }

  function nextLevelFromResult() {
    if (!runtime.levelResult?.cleared) return;
    commitCurrentLevelResult();
  }

  function commitCurrentLevelResult() {
    if (!runtime.levelResult) return;
    runtime.runResults.push({ ...runtime.levelResult, retries: runtime.runRetries });
    runtime.levelResult = null;
    runtime.levelResultPanel.hidden = true;
    runtime.runPosition += 1;
    if (runtime.runPosition >= runtime.runLevels.length) {
      finishRun();
      return;
    }
    loadLevel(runtime.runLevels[runtime.runPosition]);
  }

  function buildRunMetrics() {
    const rows = runtime.runResults.slice(0, 3);
    const cleared = rows.filter(row => row.cleared).length;
    const score = rows.reduce((sum, row) => sum + Number(row.score || 0), 0);
    const stars = rows.reduce((sum, row) => sum + Number(row.stars || 0), 0);
    const shots = rows.reduce((sum, row) => sum + Number(row.shotsUsed || 0), 0);
    const maxShots = rows.reduce((sum, row) => sum + Number(row.maxShots || 0), 0);
    const directHits = rows.reduce((sum, row) => sum + Number(row.directHits || 0), 0);
    const chainKills = rows.reduce((sum, row) => sum + Number(row.chainKills || 0), 0);
    const activeTimeMs = rows.reduce((sum, row) => sum + Number(row.activeTimeMs || 0), 0);
    return {
      runId: `bs-run-${String(runtime.runIndex).padStart(2, '0')}`,
      runIndex: runtime.runIndex,
      levelIds: rows.map(row => row.levelId),
      levelsCleared: cleared,
      totalScore: score,
      totalStars: stars,
      totalShots: shots,
      maxShots,
      directHits,
      chainKills,
      totalRetries: runtime.runRetries,
      activeTimeMs,
      completedRun: rows.length === 3,
      levelResults: rows.map(row => ({
        levelId: row.levelId,
        cleared: row.cleared,
        score: row.score,
        stars: row.stars,
        shotsUsed: row.shotsUsed,
        maxShots: row.maxShots,
        directHits: row.directHits,
        chainKills: row.chainKills,
        bugsDestroyed: row.bugsDestroyed,
        totalBugs: row.totalBugs,
        activeTimeMs: row.activeTimeMs
      }))
    };
  }

  async function finishRun() {
    if (runtime.rewardSubmitting || runtime.state === 'run-result') return;
    runtime.state = 'run-result';
    runtime.rewardSubmitting = true;
    const metrics = buildRunMetrics();
    runtime.runResultPanel.hidden = false;
    runtime.runResultPanel.querySelector('[data-byte-sling-run-title]').textContent = `Run ${runtime.runIndex} Complete`;
    runtime.runResultPanel.querySelector('[data-byte-sling-run-cleared]').textContent = `${metrics.levelsCleared}/3`;
    runtime.runResultPanel.querySelector('[data-byte-sling-run-score]').textContent = String(metrics.totalScore);
    runtime.runResultPanel.querySelector('[data-byte-sling-run-shots]').textContent = String(metrics.totalShots);
    runtime.runResultPanel.querySelector('[data-byte-sling-run-stars]').textContent = `${'★'.repeat(Math.min(9, metrics.totalStars))}${'☆'.repeat(Math.max(0, 9 - metrics.totalStars))}`;
    runtime.runResultPanel.querySelector('[data-byte-sling-run-xp]').textContent = '+0 XP';
    const note = runtime.runResultPanel.querySelector('[data-byte-sling-run-note]');
    note.className = 'byte-sling-reward-note';
    note.textContent = runtime.round ? 'Checking secured run reward…' : 'Practice run — account XP unavailable.';
    updateRunButtons(metrics);

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) {
      runtime.rewardSubmitting = false;
      return;
    }

    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, { score: metrics.totalScore, metrics });
      const awarded = Math.max(0, Number(result?.awardedXp || 0));
      runtime.runResultPanel.querySelector('[data-byte-sling-run-xp]').textContent = `+${awarded} XP`;
      const record = result?.gameRecord || result?.gameRecords?.byteSling || {};
      runtime.runBest = Math.max(runtime.runBest, Number(record.bestRunScore || record.bestScore || 0), Number(result?.bestScore || 0));
      runtime.highestRunIndex = Math.max(runtime.highestRunIndex, Number(record.highestRunIndex || 0));
      runtime.rewardedRuns = record.rewardedRuns && typeof record.rewardedRuns === 'object' ? { ...record.rewardedRuns } : runtime.rewardedRuns;
      if (result?.loginRequired) {
        note.className = 'byte-sling-reward-note warn';
        note.textContent = 'Practice mode — log in as a student to earn XP.';
      } else if (result?.syncFailed) {
        note.className = 'byte-sling-reward-note warn';
        note.textContent = 'XP could not sync. No account XP was added.';
      } else if (result?.replayNoXp) {
        note.className = 'byte-sling-reward-note warn';
        note.textContent = 'This run already earned XP. Replay is for score/stars only.';
      } else if (result?.progressionBlocked) {
        note.className = 'byte-sling-reward-note warn';
        note.textContent = 'Run progression was not eligible for XP.';
      } else if (result?.capReached && awarded === 0) {
        note.className = 'byte-sling-reward-note warn';
        note.textContent = 'Daily Mini-Game XP cap reached. Keep playing for records.';
      } else if (awarded > 0) {
        note.className = 'byte-sling-reward-note success';
        note.textContent = `Secured reward added · Today's Game XP: ${result.todayXp}/${result.dailyCap}`;
      } else {
        note.className = 'byte-sling-reward-note';
        note.textContent = metrics.levelsCleared < 3 ? 'Clear all 3 levels in the run to become XP-eligible.' : 'Run score was below the next XP tier.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      note.className = 'byte-sling-reward-note warn';
      note.textContent = 'Reward could not be processed. No XP was added.';
    } finally {
      runtime.rewardSubmitting = false;
      updateRunButtons(metrics);
    }
  }

  function updateRunButtons(metrics) {
    const next = runtime.runResultPanel.querySelector('[data-byte-sling-next-run]');
    const replay = runtime.runResultPanel.querySelector('[data-byte-sling-replay-run]');
    const hub = runtime.runResultPanel.querySelector('[data-byte-sling-hub]');
    const canAdvance = metrics.levelsCleared === 3 && runtime.runIndex < MAX_RUN;
    next.hidden = !canAdvance;
    next.textContent = runtime.runIndex >= MAX_RUN ? 'RUNS COMPLETE' : 'NEXT RUN';
    next.disabled = runtime.rewardSubmitting;
    replay.disabled = runtime.rewardSubmitting;
    hub.disabled = runtime.rewardSubmitting;
  }

  function startNextRun() {
    if (runtime.rewardSubmitting || runtime.runIndex >= MAX_RUN) return;
    runtime.runIndex += 1;
    runtime.runResultPanel.hidden = true;
    startRun();
  }

  function replayRun() {
    if (runtime.rewardSubmitting) return;
    runtime.runResultPanel.hidden = true;
    startRun();
  }

  function updateParticles(dt) {
    runtime.particles = runtime.particles.filter(p => {
      p.age += dt;
      p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.age < p.ttl;
    });
  }

  function spawnBurst(x, y, color, count) {
    const available = Math.max(0, 42 - runtime.particles.length);
    const n = Math.min(available, Math.max(0, count));
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const speed = 45 + Math.random() * 130;
      runtime.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30, age: 0, ttl: .35 + Math.random() * .35, color, size: 2 + Math.random() * 3 });
    }
    ensureLoop();
  }

  function render(time) {
    const ctx = runtime.ctx;
    const { cssW, cssH, scale, ox, oy } = runtime.view;
    ctx.save();
    ctx.setTransform(runtime.view.dpr, 0, 0, runtime.view.dpr, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, cssH);
    bg.addColorStop(0, '#071426'); bg.addColorStop(1, '#050816');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, cssW, cssH);
    ctx.translate(ox, oy); ctx.scale(scale, scale);
    drawWorld(ctx, time);
    ctx.restore();
  }

  function drawWorld(ctx, time) {
    // Subtle digital grid.
    ctx.strokeStyle = 'rgba(56,189,248,.055)'; ctx.lineWidth = 1 / runtime.view.scale;
    for (let x = 0; x <= WORLD_W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GROUND_Y); ctx.stroke(); }
    for (let y = 0; y <= GROUND_Y; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_W, y); ctx.stroke(); }

    ctx.fillStyle = '#0b2035'; ctx.fillRect(0, GROUND_Y, WORLD_W, WORLD_H - GROUND_Y);
    ctx.fillStyle = 'rgba(34,211,238,.18)'; ctx.fillRect(0, GROUND_Y, WORLD_W, 4);

    drawLauncher(ctx);
    runtime.blocks.forEach(block => { if (block.alive) drawBlock(ctx, block); });
    runtime.bugs.forEach(bug => { if (bug.alive) drawBug(ctx, bug, time); });
    if (runtime.aiming && runtime.projectile) drawTrajectory(ctx, runtime.projectile);
    if (runtime.projectile?.alive) drawProjectile(ctx, runtime.projectile);
    runtime.particles.forEach(particle => drawParticle(ctx, particle));
  }

  function drawLauncher(ctx) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(LAUNCH_X - 30, 545);
    ctx.lineTo(LAUNCH_X - 12, 475);
    ctx.lineTo(LAUNCH_X, LAUNCH_Y);
    ctx.lineTo(LAUNCH_X + 12, 475);
    ctx.lineTo(LAUNCH_X + 30, 545);
    ctx.stroke();
    if (runtime.aiming && runtime.projectile) {
      ctx.strokeStyle = 'rgba(251,191,36,.82)'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(LAUNCH_X - 12, 475);
      ctx.lineTo(runtime.projectile.x, runtime.projectile.y);
      ctx.lineTo(LAUNCH_X + 12, 475);
      ctx.stroke();

      const pull = Math.hypot(LAUNCH_X - runtime.projectile.x, LAUNCH_Y - runtime.projectile.y);
      const ratio = clamp(pull / MAX_PULL, 0, 1);
      ctx.fillStyle = 'rgba(3,18,32,.82)';
      roundRect(ctx, 72, 575, 150, 22, 10); ctx.fill();
      ctx.fillStyle = ratio > .78 ? '#fbbf24' : '#38bdf8';
      roundRect(ctx, 77, 580, 140 * ratio, 12, 6); ctx.fill();
      ctx.fillStyle = '#e0f2fe'; ctx.font = '800 11px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`POWER ${Math.round(ratio * 100)}%`, 147, 612);
    }
    ctx.restore();
  }


  function drawTrajectory(ctx, p) {
    const dx = LAUNCH_X - p.x, dy = LAUNCH_Y - p.y;
    const pull = Math.hypot(dx, dy);
    if (pull < 1) return;
    const speed = pull * 5.65 * p.packet.power;
    const vx = dx / pull * speed;
    const vy = dy / pull * speed;
    ctx.save();
    for (let i = 1; i <= 22; i += 1) {
      const t = i * .09;
      const x = LAUNCH_X + vx * t;
      const y = LAUNCH_Y + vy * t + .5 * GRAVITY * t * t;
      if (x > WORLD_W + 20 || y > GROUND_Y + 8 || x < 0) break;
      ctx.globalAlpha = clamp(1 - i / 26, .16, .82);
      ctx.fillStyle = i < 7 ? '#f8fafc' : '#bae6fd';
      ctx.beginPath(); ctx.arc(x, y, i < 7 ? 4.3 : 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }


  function drawProjectile(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.angle);
    ctx.shadowColor = p.packet.fill; ctx.shadowBlur = 15;
    ctx.fillStyle = p.packet.fill;
    ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#04121f';
    ctx.font = '900 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.packet.symbol, 0, 1);
    ctx.restore();
  }

  function drawBlock(ctx, block) {
    const mat = MATERIALS[block.material] || MATERIALS.panel;
    ctx.save();
    ctx.translate(block.x, block.y); ctx.rotate(block.angle);
    ctx.fillStyle = mat.fill;
    ctx.globalAlpha = block.static ? .78 : 1;
    roundRect(ctx, -block.w / 2, -block.h / 2, block.w, block.h, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
    ctx.stroke();
    if (block.w > 56 && block.h > 22) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = `800 ${clamp(Math.min(block.h, 26) * .36, 8, 11)}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(mat.label, 0, 0);
    }
    ctx.restore();
  }

  function drawBug(ctx, bug, time) {
    ctx.save();
    const bob = Math.sin(time * .004 + bug.wobble) * 1.5;
    ctx.translate(bug.x, bug.y + bob);
    ctx.fillStyle = '#fb7185'; ctx.shadowColor = '#fb7185'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(0, 0, bug.r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#2a0a18';
    ctx.fillRect(-8, -4, 5, 5); ctx.fillRect(3, -4, 5, 5);
    ctx.strokeStyle = '#2a0a18'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, 7); ctx.lineTo(0, 11); ctx.lineTo(8, 7); ctx.stroke();
    ctx.fillStyle = '#fee2e2'; ctx.font = '900 8px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('BUG', 0, -23);
    ctx.restore();
  }

  function drawParticle(ctx, p) {
    const alpha = clamp(1 - p.age / p.ttl, 0, 1);
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
    else ctx.rect(x, y, w, h);
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

  function pauseForExitGuard() {
    if (!runtime.open || runtime.exitGuardPaused) return false;
    runtime.exitGuardPaused = true;
    if (runtime.activeSegmentAt) {
      runtime.activePlayMs += Math.max(0, performance.now() - runtime.activeSegmentAt);
      runtime.activeSegmentAt = 0;
    }
    runtime.pausedAt = performance.now();
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    return true;
  }

  function resumeFromExitGuard() {
    if (!runtime.open || !runtime.exitGuardPaused) return false;
    runtime.exitGuardPaused = false;
    runtime.activeSegmentAt = performance.now();
    runtime.lastFrame = performance.now();
    runtime.accumulator = 0;
    requestRender();
    if (runtime.state === 'flying') ensureLoop();
    return true;
  }

  function closeInternal() {
    if (!runtime.open) return;
    runtime.open = false;
    runtime.state = 'closed';
    runtime.overlay.hidden = true;
    document.body.classList.remove('byte-sling-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    clearTimeout(runtime.resizeTimer);
    clearTimeout(runtime.statusTimer);
    clearTimeout(runtime.finishTimer);
    if (runtime.activeSegmentAt) runtime.activePlayMs += Math.max(0, performance.now() - runtime.activeSegmentAt);
    runtime.activeSegmentAt = 0;
    runtime.pointerId = null;
    runtime.aiming = false;
    runtime.particles.length = 0;
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snapshot = runtime.bridge?.getSnapshot?.() || {};
    const record = snapshot.gameRecords?.byteSling || {};
    runtime.soundEnabled = snapshot.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.runBest = Math.max(0, Number(record.bestRunScore || record.bestScore || 0));
    runtime.highestRunIndex = Math.max(0, Number(record.highestRunIndex || 0));
    runtime.rewardedRuns = record.rewardedRuns && typeof record.rewardedRuns === 'object' ? { ...record.rewardedRuns } : {};
    runtime.runIndex = clamp(runtime.highestRunIndex + 1, 1, MAX_RUN);
    if (runtime.highestRunIndex >= MAX_RUN) runtime.runIndex = MAX_RUN;
    runtime.open = true;
    runtime.state = 'ready';
    runtime.overlay.hidden = false;
    document.body.classList.add('byte-sling-active');
    runtime.readyPanel.hidden = false;
    runtime.levelResultPanel.hidden = true;
    runtime.runResultPanel.hidden = true;
    runtime.overlay.querySelector('[data-byte-sling-ready-run]').textContent = runLabel(runtime.runIndex);
    requestAnimationFrame(() => { resizeCanvas(); render(performance.now()); });
  }

  window.ICT8ByteSling = Object.freeze({ open, close: closeInternal, isOpen: () => runtime.open, pauseForExitGuard, resumeFromExitGuard });
})();
