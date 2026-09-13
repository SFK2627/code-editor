(() => {
  'use strict';


  const GAME_ID = 'code-tiles';
  const GLOBAL_NAME = 'ICT8CodeTiles';
  const WORLD_W = 600;
  const WORLD_H = 1040;
  const MAX_DPR = 1.35;
  const TARGET_Y = 850;
  const BOARD_TOP = 154;
  const TILE_H = 144;
  const ENTRY_Y = BOARD_TOP - TILE_H * 0.95;
  const BOARD_BOTTOM = 980;
  const BOARD_X = 20;
  const BOARD_W = 560;
  const LANE_W = BOARD_W / 4;
  const HIT_WINDOWS = Object.freeze({ perfect: 72, great: 132, good: 200 });
  // v6.0 — 15-PHASE OVERDRIVE. The stream stays strictly sequential: no
  // simultaneous/chord tile heads, so even the fastest phases keep one clear
  // NEXT tile. Higher phases use more bars and more notes, creating longer,
  // faster endurance sections instead of a single chaotic final burst.
  const PHASES = Object.freeze([
    Object.freeze({ bpm: 75,  bars: 5,  events: 18, holds: 1, holdMs: Object.freeze([900]), travelMs: 2250, label: 'WARM UP' }),
    Object.freeze({ bpm: 90,  bars: 5,  events: 20, holds: 1, holdMs: Object.freeze([1000]), travelMs: 2150, label: 'FIND THE BEAT' }),
    Object.freeze({ bpm: 105, bars: 6,  events: 22, holds: 2, holdMs: Object.freeze([800, 1150]), travelMs: 2050, label: 'LOCK IN' }),
    Object.freeze({ bpm: 120, bars: 6,  events: 24, holds: 2, holdMs: Object.freeze([900, 1250]), travelMs: 1950, label: 'STEADY FLOW' }),
    Object.freeze({ bpm: 140, bars: 7,  events: 26, holds: 3, holdMs: Object.freeze([750, 1050, 1350]), travelMs: 1850, label: 'FAST LANE' }),
    Object.freeze({ bpm: 150, bars: 7,  events: 28, holds: 2, holdMs: Object.freeze([850, 1200]), travelMs: 1750, label: 'BUILD SPEED' }),
    Object.freeze({ bpm: 160, bars: 8,  events: 30, holds: 3, holdMs: Object.freeze([700, 950, 1300]), travelMs: 1650, label: 'QUICK STEP' }),
    Object.freeze({ bpm: 170, bars: 8,  events: 32, holds: 3, holdMs: Object.freeze([800, 1100, 1450]), travelMs: 1570, label: 'BYTE RUSH' }),
    Object.freeze({ bpm: 180, bars: 9,  events: 34, holds: 3, holdMs: Object.freeze([650, 900, 1250]), travelMs: 1500, label: 'TURBO FLOW' }),
    Object.freeze({ bpm: 190, bars: 9,  events: 36, holds: 3, holdMs: Object.freeze([700, 1000, 1400]), travelMs: 1430, label: 'OVERCLOCK' }),
    Object.freeze({ bpm: 200, bars: 10, events: 40, holds: 4, holdMs: Object.freeze([650, 850, 1100, 1500]), travelMs: 1360, label: 'HYPER SYNC' }),
    Object.freeze({ bpm: 210, bars: 10, events: 44, holds: 4, holdMs: Object.freeze([700, 950, 1250, 1600]), travelMs: 1300, label: 'RAPID FIRE' }),
    Object.freeze({ bpm: 220, bars: 11, events: 48, holds: 4, holdMs: Object.freeze([600, 800, 1050, 1400]), travelMs: 1240, label: 'REDLINE' }),
    Object.freeze({ bpm: 230, bars: 11, events: 52, holds: 4, holdMs: Object.freeze([650, 900, 1200, 1550]), travelMs: 1180, label: 'MAX DRIVE' }),
    Object.freeze({ bpm: 240, bars: 12, events: 58, holds: 5, holdMs: Object.freeze([600, 800, 1000, 1250, 1650]), travelMs: 1120, label: 'FINAL OVERDRIVE' })
  ]);
  const BACKDROP_GLOWS = Object.freeze([
    Object.freeze([58, 130, 112, 'rgba(255,255,255,.055)']),
    Object.freeze([470, 170, 128, 'rgba(255,255,255,.045)']),
    Object.freeze([524, 680, 132, 'rgba(56,189,248,.055)']),
    Object.freeze([150, 900, 84, 'rgba(255,255,255,.035)'])
  ]);
  const BACKDROP_STARS = Object.freeze([
    Object.freeze([410, 88, 9]), Object.freeze([145, 693, 6]), Object.freeze([381, 767, 7]),
    Object.freeze([72, 595, 5]), Object.freeze([322, 920, 5])
  ]);
  const LANE_FILLS = Object.freeze(['rgba(255,255,255,.18)', 'rgba(255,255,255,.12)', 'rgba(255,255,255,.16)', 'rgba(82,183,255,.28)']);
  const SYNC_ACCENTS = Object.freeze([.33, .5, .79]);

  const LANE_META = Object.freeze([
    Object.freeze({ key: 'D', label: 'HTML', glyph: '</>', hue: 190, freq: 261.63 }),
    Object.freeze({ key: 'F', label: 'CSS', glyph: '#', hue: 267, freq: 329.63 }),
    Object.freeze({ key: 'J', label: 'JS', glyph: 'JS', hue: 45, freq: 392.00 }),
    Object.freeze({ key: 'K', label: 'DATA', glyph: '01', hue: 153, freq: 523.25 })
  ]);

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

  const runtime = {
    built: false,
    open: false,
    state: 'closed',
    overlay: null,
    shell: null,
    canvas: null,
    ctx: null,
    readyPanel: null,
    failPanel: null,
    resultPanel: null,
    phaseEl: null,
    bpmEl: null,
    comboEl: null,
    syncEl: null,
    scoreEl: null,
    progressEl: null,
    judgementEl: null,
    finalScoreEl: null,
    finalAccuracyEl: null,
    finalComboEl: null,
    finalMissesEl: null,
    finalXpEl: null,
    rewardNoteEl: null,
    failCopyEl: null,
    soundBtn: null,
    bridge: null,
    onBack: null,
    onClose: null,
    onReward: null,
    round: null,
    rewardSubmitting: false,
    soundEnabled: true,
    audioContext: null,
    masterGain: null,
    compressor: null,
    backdropGradient: null,
    staticScene: null,
    staticSceneReady: false,
    laneTonePool: [null, null, null, null],
    uiVoice: null,
    inputGroupScratch: [],
    lastHudUpdateAt: 0,
    lastJudgeAt: 0,
    lastJudgeText: '',
    updateCursor: 0,
    hudCache: Object.create(null),
    lowPower: false,
    pausedHoldLanes: new Set(),
    view: { cssW: WORLD_W, cssH: WORLD_H, dpr: 1, scale: 1, scaleX: 1, scaleY: 1, ox: 0, oy: 0, rect: null },
    raf: 0,
    lastFrameNow: 0,
    lastUpdateNow: 0,
    lastRenderNow: 0,
    runStartNow: 0,
    pauseStartedNow: 0,
    pausedAccumMs: 0,
    phaseStarts: [],
    totalTrackMs: 0,
    chart: [],
    notesByLane: [[], [], [], []],
    currentPhase: 0,
    currentBeatIndex: -1,
    score: 0,
    sync: 100,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    great: 0,
    good: 0,
    misses: 0,
    badTaps: 0,
    holdsCompleted: 0,
    holdsTotal: 0,
    totalNotes: 0,
    judgedNotes: 0,
    laneSources: [new Set(), new Set(), new Set(), new Set()],
    activeHoldByLane: [null, null, null, null],
    pointers: new Map(),
    keyboardDown: new Set(),
    particles: [],
    hitEffects: [],
    laneFlashes: [0, 0, 0, 0],
    targetPulse: 0,
    phaseBanner: null,
    finalData: null,
    bestScore: 0,
    bestAccuracy: 0,
    lastRewardDay: '',
    lastRewardXp: 0,
    resizeTimer: 0,
    resizeObserver: null,
    startCountdownAt: 0,
    startCountdownValue: 0,
    failedReason: ''
  };

  function hashSeed(value) {
    const text = String(value || 'code-tiles');
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

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'codeTilesOverlay';
    overlay.className = 'xp-games-game-overlay code-tiles-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Tiles mini-game');
    overlay.innerHTML = `
      <section class="code-tiles-shell">
        <canvas class="code-tiles-canvas" tabindex="0" aria-label="CODE TILES four-lane rhythm board"></canvas>

        <header class="code-tiles-topbar">
          <button type="button" data-code-tiles-back aria-label="Back to Mini-Games">←</button>
          <div class="code-tiles-brand"><strong>🎹 CODE TILES</strong><small>15-Phase Overdrive</small></div>
          <button type="button" data-code-tiles-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-code-tiles-close aria-label="Close Code Tiles">×</button>
        </header>

        <div class="code-tiles-hud">
          <div><small>PHASE</small><strong data-code-tiles-phase>1/15</strong></div>
          <div><small>BPM</small><strong data-code-tiles-bpm>75</strong></div>
          <div><small>COMBO</small><strong data-code-tiles-combo>x0</strong></div>
          <div><small>SYNC</small><strong data-code-tiles-sync>100%</strong></div>
          <div><small>SCORE</small><strong data-code-tiles-score>0</strong></div>
        </div>
        <div class="code-tiles-progress"><i data-code-tiles-progress></i></div>
        <div class="code-tiles-judge" data-code-tiles-judge aria-live="polite"></div>

        <div class="code-tiles-panel" data-code-tiles-ready>
          <div class="code-tiles-card">
            <div class="code-tiles-hero" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            <p class="code-tiles-kicker">15-PHASE RHYTHM RUN</p>
            <h2>CODE TILES</h2>
            <p>Clear all 15 phases. The track gets longer and faster until the 240 BPM FINAL OVERDRIVE. Tap only the NEXT black tile; hold long tiles until their color fill reaches the tail.</p>
            <div class="code-tiles-how">
              <span><i class="short"></i><b>SHORT TILE</b><small>Tap the next tile once it appears. Only the earliest tile(s) count.</small></span>
              <span><i class="long"></i><b>LONG TILE</b><small>Press and keep holding. Do not release until the long tail reaches the line.</small></span>
            </div>
            <div class="code-tiles-key-row"><span><b>D</b> HTML</span><span><b>F</b> CSS</span><span><b>J</b> JS</span><span><b>K</b> 01</span></div>
            <div class="code-tiles-phase-strip"><span>75</span><span>140</span><span>180</span><span>220</span><span>240 BPM</span></div>
            <button type="button" class="primary" data-code-tiles-play>PLAY TRACK</button>
            <small class="code-tiles-tip">🏆 Perfect 15-phase clear = 20 XP · 🔊 Sound recommended · Phone: tap/hold lanes</small>
          </div>
        </div>

        <div class="code-tiles-panel" data-code-tiles-fail hidden>
          <div class="code-tiles-card compact">
            <div class="code-tiles-result-icon fail">×</div>
            <p class="code-tiles-kicker danger">SYNC LOST</p>
            <h2>TRACK FAILED</h2>
            <p data-code-tiles-fail-copy>Your rhythm link dropped before the final phase.</p>
            <div class="code-tiles-actions"><button type="button" class="primary" data-code-tiles-retry>RETRY</button><button type="button" data-code-tiles-fail-hub>MINI-GAMES</button></div>
          </div>
        </div>

        <div class="code-tiles-panel" data-code-tiles-result hidden>
          <div class="code-tiles-card compact result-card">
            <div class="code-tiles-result-icon success">✓</div>
            <p class="code-tiles-kicker success">TRACK COMPLETE</p>
            <h2>FINAL SYNC</h2>
            <div class="code-tiles-grade" data-code-tiles-grade>GREAT</div>
            <div class="code-tiles-result-grid">
              <div><small>Score</small><strong data-code-tiles-final-score>0</strong></div>
              <div><small>Accuracy</small><strong data-code-tiles-final-accuracy>0%</strong></div>
              <div><small>Best Combo</small><strong data-code-tiles-final-combo>x0</strong></div>
              <div><small>Misses</small><strong data-code-tiles-final-misses>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-code-tiles-final-xp>+0</strong></div>
            </div>
            <p class="code-tiles-reward-note" data-code-tiles-reward-note>Securing reward…</p>
            <div class="code-tiles-actions"><button type="button" class="primary" data-code-tiles-again>PLAY AGAIN</button><button type="button" data-code-tiles-result-hub>MINI-GAMES</button></div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-tiles-shell');
    runtime.canvas = overlay.querySelector('.code-tiles-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false, desynchronized: true });
    runtime.readyPanel = overlay.querySelector('[data-code-tiles-ready]');
    runtime.failPanel = overlay.querySelector('[data-code-tiles-fail]');
    runtime.resultPanel = overlay.querySelector('[data-code-tiles-result]');
    runtime.phaseEl = overlay.querySelector('[data-code-tiles-phase]');
    runtime.bpmEl = overlay.querySelector('[data-code-tiles-bpm]');
    runtime.comboEl = overlay.querySelector('[data-code-tiles-combo]');
    runtime.syncEl = overlay.querySelector('[data-code-tiles-sync]');
    runtime.scoreEl = overlay.querySelector('[data-code-tiles-score]');
    runtime.progressEl = overlay.querySelector('[data-code-tiles-progress]');
    runtime.judgementEl = overlay.querySelector('[data-code-tiles-judge]');
    runtime.finalScoreEl = overlay.querySelector('[data-code-tiles-final-score]');
    runtime.finalAccuracyEl = overlay.querySelector('[data-code-tiles-final-accuracy]');
    runtime.finalComboEl = overlay.querySelector('[data-code-tiles-final-combo]');
    runtime.finalMissesEl = overlay.querySelector('[data-code-tiles-final-misses]');
    runtime.finalXpEl = overlay.querySelector('[data-code-tiles-final-xp]');
    runtime.rewardNoteEl = overlay.querySelector('[data-code-tiles-reward-note]');
    runtime.failCopyEl = overlay.querySelector('[data-code-tiles-fail-copy]');
    runtime.gradeEl = overlay.querySelector('[data-code-tiles-grade]');
    runtime.soundBtn = overlay.querySelector('[data-code-tiles-sound]');

    overlay.querySelector('[data-code-tiles-play]').addEventListener('click', startRun);
    overlay.querySelector('[data-code-tiles-retry]').addEventListener('click', startRun);
    overlay.querySelector('[data-code-tiles-again]').addEventListener('click', startRun);
    overlay.querySelector('[data-code-tiles-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-tiles-fail-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-tiles-result-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-tiles-close]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);

    runtime.canvas.addEventListener('pointerdown', onPointerDown);
    runtime.canvas.addEventListener('pointerup', onPointerUp);
    runtime.canvas.addEventListener('pointercancel', onPointerUp);
    runtime.canvas.addEventListener('lostpointercapture', onPointerUp);
    runtime.canvas.addEventListener('contextmenu', event => event.preventDefault());
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp, { passive: false });
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', () => pauseRun('blur'));
    window.addEventListener('focus', () => resumeRun('focus'));
    window.addEventListener('resize', queueResize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(queueResize, 80), { passive: true });
    if ('ResizeObserver' in window) {
      runtime.resizeObserver = new ResizeObserver(queueResize);
      runtime.resizeObserver.observe(runtime.shell);
    }
    runtime.built = true;
  }

  function buildPhaseStarts() {
    let cursor = 0;
    runtime.phaseStarts = PHASES.map(phase => {
      const start = cursor;
      const beatMs = 60000 / phase.bpm;
      cursor += beatMs * 4 * phase.bars;
      return start;
    });
    runtime.totalTrackMs = cursor;
  }

  function generateNoteTimes(phase, phaseStart) {
    const beatMs = 60000 / phase.bpm;
    const phaseDuration = beatMs * 4 * phase.bars;
    const noteCount = phase.events + Number(phase.extraNotes || 0);
    const startPad = Math.max(beatMs * .62, 260);
    const endPad = Math.max(beatMs * .62, 260);
    const usable = Math.max(beatMs * 2, phaseDuration - startPad - endPad);
    const spacing = noteCount > 1 ? usable / (noteCount - 1) : usable;
    const times = [];

    // Keep a steady Piano-Tiles stream instead of injecting 90-130ms bursts.
    // A tiny deterministic swing prevents the chart from feeling mechanical,
    // while the clamp below guarantees generous phone-tap spacing.
    const minGap = phase.bpm >= 235 ? 165 : phase.bpm >= 225 ? 175 : phase.bpm >= 215 ? 185 : phase.bpm >= 205 ? 195 : phase.bpm >= 195 ? 205 : phase.bpm >= 185 ? 215 : phase.bpm >= 175 ? 225 : phase.bpm >= 165 ? 235 : phase.bpm >= 155 ? 245 : phase.bpm >= 145 ? 255 : phase.bpm >= 130 ? 270 : phase.bpm >= 115 ? 290 : phase.bpm >= 100 ? 315 : phase.bpm >= 90 ? 340 : 380;
    const swing = Math.min(18, spacing * .055);
    for (let i = 0; i < noteCount; i += 1) {
      const pattern = i % 4 === 1 ? swing : i % 4 === 3 ? -swing : 0;
      let time = phaseStart + startPad + i * spacing + pattern;
      if (times.length) time = Math.max(time, times[times.length - 1] + minGap);
      times.push(time);
    }

    // If a minimum-gap correction pushed the tail too far, compress the whole
    // sequence evenly back inside the phase while still keeping it sequential.
    const latestAllowed = phaseStart + phaseDuration - endPad;
    if (times.length > 1 && times[times.length - 1] > latestAllowed) {
      const first = times[0];
      const correctedSpacing = (latestAllowed - first) / (times.length - 1);
      for (let i = 1; i < times.length; i += 1) times[i] = first + correctedSpacing * i;
    }
    return times;
  }

  function generateHoldIndices(noteCount, holdCount) {
    if (!holdCount) return [];
    const result = [];
    // Evenly spread long holds through the middle ~70% of each phase so the
    // player never gets a cluster of long tiles near the intro or phase exit.
    const first = .16;
    const last = .84;
    for (let slot = 0; slot < holdCount; slot += 1) {
      const fraction = holdCount === 1 ? .52 : first + (last - first) * (slot / (holdCount - 1));
      let index = clamp(Math.round((noteCount - 1) * fraction), 2, noteCount - 3);
      while (result.includes(index) && index < noteCount - 3) index += 1;
      while (result.includes(index) && index > 2) index -= 1;
      result.push(index);
    }
    return result.sort((a, b) => a - b);
  }

  function buildChart(roundToken) {
    buildPhaseStarts();
    const rng = makeRng(`${roundToken || 'practice'}:code-tiles:v2-readable`);
    const chart = [];
    const laneBlockedUntil = [0, 0, 0, 0];
    let id = 0;

    PHASES.forEach((phase, phaseIndex) => {
      const beatMs = 60000 / phase.bpm;
      const phaseStart = runtime.phaseStarts[phaseIndex];
      const phaseEnd = phaseStart + beatMs * 4 * phase.bars;
      const noteTimes = generateNoteTimes(phase, phaseStart);
      const holdIndices = generateHoldIndices(noteTimes.length, phase.holds);
      let previousLane = -1;
      let sameLaneRun = 0;
      let previousEventLane = -1;
      let previousHoldEnd = -Infinity;

      noteTimes.forEach((targetTime, noteIndex) => {
        const holdSlot = holdIndices.indexOf(noteIndex);
        const isHold = holdSlot >= 0;
        const requestedHold = isHold ? Number(phase.holdMs?.[holdSlot] || phase.holdMs?.[0] || 900) : 0;
        // Long notes are deliberately non-overlapping. A later long tile can
        // never begin while the previous one is still being held.
        const canStartHold = !isHold || targetTime >= previousHoldEnd + 180;
        const holdDuration = isHold && canStartHold
          ? Math.max(520, Math.min(requestedHold, phaseEnd - targetTime - 220))
          : 0;

        const available = [0, 1, 2, 3].filter(lane => laneBlockedUntil[lane] <= targetTime - HIT_WINDOWS.good - 40);
        const pool = available.length ? available : [0, 1, 2, 3];
        const freshPool = pool.filter(lane => lane !== previousEventLane);
        const firstPool = freshPool.length ? freshPool : pool;
        let lane = firstPool[Math.floor(rng() * firstPool.length)] ?? (noteIndex % 4);
        if (lane === previousLane && sameLaneRun >= 1) {
          const alternate = firstPool.find(candidate => candidate !== previousLane) ?? pool.find(candidate => candidate !== previousLane);
          if (alternate != null) lane = alternate;
        }

        const pxPerMs = (TARGET_Y - ENTRY_Y) / phase.travelMs;
        const nextTime = noteTimes[noteIndex + 1];
        const prevTime = noteTimes[noteIndex - 1];
        const localGapMs = nextTime != null ? nextTime - targetTime : prevTime != null ? targetTime - prevTime : beatMs;
        const eventSpacingPx = Math.max(1, localGapMs) * pxPerMs;
        const shortMinH = phase.bpm >= 205 ? 104 : phase.bpm >= 175 ? 108 : 112;
        const visualHeight = holdDuration > 0 ? TILE_H : clamp(eventSpacingPx * .80, shortMinH, 136);

        chart.push({
          id: `ct-${String(++id).padStart(3, '0')}`,
          phaseIndex,
          lane,
          targetTime,
          travelMs: phase.travelMs,
          holdDuration,
          visualHeight,
          state: 'pending',
          judgement: '',
          errorMs: 0,
          headHitAt: 0,
          holdReleasedEarly: false,
          holdVoice: null,
          resumeGraceUntil: 0,
          spawnedBurst: false
        });

        if (holdDuration > 0) {
          laneBlockedUntil[lane] = targetTime + holdDuration + HIT_WINDOWS.good + 70;
          previousHoldEnd = targetTime + holdDuration;
        }
        if (lane === previousLane) sameLaneRun += 1;
        else sameLaneRun = 1;
        previousLane = lane;
        previousEventLane = lane;
      });
    });

    chart.sort((a, b) => a.targetTime - b.targetTime || a.lane - b.lane);
    runtime.chart = chart;
    runtime.notesByLane = [[], [], [], []];
    chart.forEach(note => runtime.notesByLane[note.lane].push(note));
    runtime.totalNotes = chart.length;
    runtime.holdsTotal = chart.filter(note => note.holdDuration > 0).length;
  }

  function resizeCanvas() {
    if (!runtime.open || !runtime.canvas || !runtime.shell) return;
    const rect = runtime.shell.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;
    const memory = Number(navigator.deviceMemory || 0);
    const cores = Number(navigator.hardwareConcurrency || 0);
    runtime.lowPower = rect.width <= 900 || (memory > 0 && memory <= 6) || (cores > 0 && cores <= 6);
    const dprCap = runtime.lowPower ? 1.0 : MAX_DPR;
    const dpr = clamp(window.devicePixelRatio || 1, 1, dprCap);
    runtime.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    runtime.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    runtime.canvas.style.width = `${rect.width}px`;
    runtime.canvas.style.height = `${rect.height}px`;
    const portrait = rect.height > rect.width * 1.12;
    let scaleX;
    let scaleY;
    let ox;
    let oy;
    if (portrait) {
      // Use the phone's vertical space instead of letterboxing the whole 600x1040 world.
      // X and Y scales are independent visually; hit timing remains time-based and lane
      // input uses scaleX, so gameplay rules are unchanged.
      scaleX = rect.width / WORLD_W;
      scaleY = Math.min(rect.height / WORLD_H, scaleX * 1.45);
      const desiredBoardTopPx = rect.width <= 700 ? 82 : 96;
      ox = (rect.width - WORLD_W * scaleX) / 2;
      oy = desiredBoardTopPx - BOARD_TOP * scaleY;
    } else {
      scaleY = Math.min(rect.width / WORLD_W, rect.height / WORLD_H);
      const wideBoost = rect.width > rect.height ? 1.32 : 1;
      scaleX = Math.min(rect.width / WORLD_W, scaleY * wideBoost);
      ox = (rect.width - WORLD_W * scaleX) / 2;
      oy = (rect.height - WORLD_H * scaleY) / 2;
    }
    runtime.view = {
      cssW: rect.width,
      cssH: rect.height,
      dpr,
      scale: scaleY,
      scaleX,
      scaleY,
      ox,
      oy,
      rect: runtime.canvas.getBoundingClientRect()
    };
    const g = runtime.ctx.createLinearGradient(0, 0, 0, WORLD_H);
    g.addColorStop(0, '#efd7f2');
    g.addColorStop(.52, '#d9dbf8');
    g.addColorStop(1, '#92bcff');
    runtime.backdropGradient = g;
    buildStaticScene();
  }

  function buildStaticScene() {
    try {
      const canvas = runtime.staticScene || document.createElement('canvas');
      canvas.width = WORLD_W;
      canvas.height = WORLD_H;
      const sctx = canvas.getContext('2d', { alpha: false });
      if (!sctx) return;

      const bg = sctx.createLinearGradient(0, 0, 0, WORLD_H);
      bg.addColorStop(0, '#efd7f2');
      bg.addColorStop(.52, '#d9dbf8');
      bg.addColorStop(1, '#92bcff');
      sctx.fillStyle = bg;
      sctx.fillRect(0, 0, WORLD_W, WORLD_H);

      // Static glow spots: same pastel identity, zero per-frame animation cost.
      for (let i = 0; i < BACKDROP_GLOWS.length; i += 1) {
        const [x, y, r, color] = BACKDROP_GLOWS[i];
        sctx.fillStyle = color;
        sctx.beginPath();
        sctx.arc(x, y, r, 0, Math.PI * 2);
        sctx.fill();
      }
      if (!runtime.lowPower) {
        sctx.save();
        sctx.globalAlpha = .66;
        sctx.fillStyle = 'rgba(255,255,255,.72)';
        for (let i = 0; i < BACKDROP_STARS.length; i += 1) {
          const [x, y, s] = BACKDROP_STARS[i];
          sctx.beginPath();
          sctx.moveTo(x, y - s); sctx.lineTo(x + s*.34, y - s*.34); sctx.lineTo(x + s, y); sctx.lineTo(x + s*.34, y + s*.34);
          sctx.lineTo(x, y + s); sctx.lineTo(x - s*.34, y + s*.34); sctx.lineTo(x - s, y); sctx.lineTo(x - s*.34, y - s*.34);
          sctx.closePath();
          sctx.fill();
        }
        sctx.restore();
      }

      sctx.save();
      roundRect(sctx, BOARD_X, BOARD_TOP, BOARD_W, BOARD_BOTTOM - BOARD_TOP, 16);
      sctx.clip();
      for (let lane = 0; lane < 4; lane += 1) {
        const x = BOARD_X + lane * LANE_W;
        sctx.fillStyle = LANE_FILLS[lane];
        sctx.fillRect(x, BOARD_TOP, LANE_W, BOARD_BOTTOM - BOARD_TOP);
        if (lane > 0) {
          sctx.strokeStyle = 'rgba(255,255,255,.30)';
          sctx.lineWidth = 1;
          sctx.beginPath();
          sctx.moveTo(x, BOARD_TOP);
          sctx.lineTo(x, BOARD_BOTTOM);
          sctx.stroke();
        }
      }
      if (!isPhoneLayout()) {
        for (let lane = 0; lane < 4; lane += 1) drawLaneLabel(sctx, lane);
      }
      sctx.restore();
      sctx.save();
      roundRect(sctx, BOARD_X, BOARD_TOP, BOARD_W, BOARD_BOTTOM - BOARD_TOP, 16);
      sctx.strokeStyle = 'rgba(255,255,255,.22)';
      sctx.lineWidth = 1.5;
      sctx.stroke();
      sctx.restore();

      runtime.staticScene = canvas;
      runtime.staticSceneReady = true;
    } catch (_) {
      runtime.staticSceneReady = false;
    }
  }

  function queueResize() {
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = setTimeout(() => {
      resizeCanvas();
      if (runtime.open && runtime.state !== 'playing') renderFrame(performance.now());
    }, 40);
  }

  function nowInTrack(now = performance.now()) {
    if (!runtime.runStartNow) return 0;
    return Math.max(0, now - runtime.runStartNow - runtime.pausedAccumMs);
  }

  function phaseAt(trackMs) {
    let index = PHASES.length - 1;
    for (let i = 0; i < PHASES.length; i += 1) {
      const start = runtime.phaseStarts[i];
      const end = i + 1 < PHASES.length ? runtime.phaseStarts[i + 1] : runtime.totalTrackMs;
      if (trackMs >= start && trackMs < end) return i;
    }
    return index;
  }

  function updateHud(trackMs = 0) {
    const phase = PHASES[runtime.currentPhase] || PHASES[0];
    const values = {
      phase: `${runtime.currentPhase + 1}/${PHASES.length}`,
      bpm: String(phase.bpm),
      combo: `x${runtime.combo}`,
      sync: `${Math.round(runtime.sync)}%`,
      score: String(Math.round(runtime.score))
    };
    if (runtime.hudCache.phase !== values.phase) { runtime.hudCache.phase = values.phase; runtime.phaseEl.textContent = values.phase; }
    if (runtime.hudCache.bpm !== values.bpm) { runtime.hudCache.bpm = values.bpm; runtime.bpmEl.textContent = values.bpm; }
    if (runtime.hudCache.combo !== values.combo) { runtime.hudCache.combo = values.combo; runtime.comboEl.textContent = values.combo; }
    if (runtime.hudCache.sync !== values.sync) { runtime.hudCache.sync = values.sync; runtime.syncEl.textContent = values.sync; }
    if (runtime.hudCache.score !== values.score) { runtime.hudCache.score = values.score; runtime.scoreEl.textContent = values.score; }
    const low = runtime.sync < 35 ? '1' : '';
    if (runtime.hudCache.low !== low) { runtime.hudCache.low = low; runtime.syncEl.dataset.low = low; }
    const progress = clamp(trackMs / Math.max(1, runtime.totalTrackMs), 0, 1);
    const progressStep = Math.round(progress * 400) / 400;
    if (runtime.hudCache.progress !== progressStep) {
      runtime.hudCache.progress = progressStep;
      runtime.progressEl.style.transform = `scaleX(${progressStep})`;
    }
  }

  function startRun() {
    if (!runtime.open || runtime.rewardSubmitting) return;
    if (runtime.round?.sessionId) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    buildChart(runtime.round?.sessionId || `${Date.now()}-${Math.random()}`);
    runtime.chart.forEach(note => {
      note.state = 'pending'; note.judgement = ''; note.errorMs = 0; note.headHitAt = 0; note.holdReleasedEarly = false; note.spawnedBurst = false;
    });
    runtime.state = 'countdown';
    runtime.score = 0;
    runtime.sync = 100;
    runtime.combo = 0;
    runtime.maxCombo = 0;
    runtime.perfect = 0;
    runtime.great = 0;
    runtime.good = 0;
    runtime.misses = 0;
    runtime.badTaps = 0;
    runtime.holdsCompleted = 0;
    runtime.judgedNotes = 0;
    runtime.updateCursor = 0;
    runtime.hudCache = Object.create(null);
    stopAllHoldVoices();
    runtime.particles.length = 0;
    runtime.hitEffects.length = 0;
    runtime.laneFlashes.fill(0);
    runtime.laneSources.forEach(set => set.clear());
    runtime.activeHoldByLane.fill(null);
    runtime.pointers.clear();
    runtime.keyboardDown.clear();
    runtime.currentPhase = 0;
    runtime.currentBeatIndex = -1;
    runtime.lastUpdateNow = 0;
    runtime.lastRenderNow = 0;
    runtime.lastHudUpdateAt = 0;
    runtime.lastJudgeAt = 0;
    runtime.lastJudgeText = '';
    runtime.targetPulse = 0;
    runtime.phaseBanner = { index: 0, startedAt: performance.now() + 300 };
    runtime.finalData = null;
    runtime.failedReason = '';
    runtime.rewardSubmitting = false;
    runtime.readyPanel.hidden = true;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.judgementEl.textContent = '';
    runtime.judgementEl.dataset.kind = '';
    runtime.startCountdownAt = performance.now();
    runtime.runStartNow = 0;
    runtime.pausedAccumMs = 0;
    runtime.pauseStartedNow = 0;
    ensureAudio();
    playUiTone('start');
    if (!runtime.raf) runtime.raf = requestAnimationFrame(loop);
  }

  function beginTrack(now) {
    runtime.state = 'playing';
    runtime.runStartNow = now;
    runtime.pausedAccumMs = 0;
    runtime.currentBeatIndex = -1;
    runtime.phaseBanner = { index: 0, startedAt: now };
    updateHud(0);
  }

  function loop(now) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const previous = runtime.lastFrameNow || now;
    const dtMs = clamp(now - previous, 0, 50);
    runtime.lastFrameNow = now;

    if (runtime.state === 'countdown') {
      const elapsed = now - runtime.startCountdownAt;
      runtime.startCountdownValue = elapsed < 700 ? 3 : elapsed < 1400 ? 2 : elapsed < 2100 ? 1 : 0;
      if (elapsed >= 2500) beginTrack(now);
    } else if (runtime.state === 'playing') {
      updateGame(now, dtMs);
    }

    updateHitEffects(now);
    if (!runtime.lowPower) updateParticles(now);
    renderFrame(now);
    runtime.lastRenderNow = now;

    if (runtime.open && ['countdown', 'playing', 'paused'].includes(runtime.state)) {
      runtime.raf = requestAnimationFrame(loop);
    }
  }

  function updateGame(now, dtMs = 16.67) {
    const trackMs = nowInTrack(now);
    const nextPhase = phaseAt(trackMs);
    if (nextPhase !== runtime.currentPhase) {
      runtime.currentPhase = nextPhase;
      runtime.phaseBanner = { index: nextPhase, startedAt: now };
      playUiTone('phase');
    }
    if (!runtime.lowPower) playBeatIfNeeded(trackMs);

    const chart = runtime.chart;
    const scanStart = runtime.updateCursor;
    for (let i = scanStart; i < chart.length; i += 1) {
      const note = chart[i];
      if (note.state === 'pending' && note.targetTime > trackMs + HIT_WINDOWS.good) break;
      if (note.state === 'pending' && trackMs - note.targetTime > HIT_WINDOWS.good) registerMiss(note, 'MISS');
      if (note.state === 'holding') {
        const laneHeld = runtime.laneSources[note.lane].size > 0;
        const tailTime = note.targetTime + note.holdDuration;
        const grace = Number(note.resumeGraceUntil || 0);
        if (!laneHeld && trackMs < tailTime - 105 && trackMs >= grace) {
          note.holdReleasedEarly = true;
          registerHoldBreak(note);
        } else if (trackMs >= tailTime - 28 && laneHeld) {
          completeHold(note);
        } else if (trackMs > tailTime + 115 && !laneHeld) {
          registerHoldBreak(note);
        }
      }
    }
    let cursor = runtime.updateCursor;
    while (cursor < chart.length) {
      const note = chart[cursor];
      const endTime = note.targetTime + note.holdDuration;
      if (note.state === 'hit') {
        // Successful notes disappear immediately after input/completion.
        cursor += 1;
        continue;
      }
      if (note.state === 'miss' && trackMs > endTime + 520) {
        // Misses are the only notes allowed to visibly travel below the line.
        cursor += 1;
        continue;
      }
      break;
    }
    runtime.updateCursor = cursor;

    const fadeStep = dtMs * (runtime.lowPower ? .0058 : .0032);
    for (let i = 0; i < runtime.laneFlashes.length; i += 1) runtime.laneFlashes[i] = Math.max(0, runtime.laneFlashes[i] - fadeStep);
    runtime.targetPulse = Math.max(0, runtime.targetPulse - dtMs * (runtime.lowPower ? .0048 : .0028));
    if (!runtime.lastHudUpdateAt || now - runtime.lastHudUpdateAt >= 100) {
      updateHud(trackMs);
      runtime.lastHudUpdateAt = now;
    }

    if (runtime.sync <= 0) {
      failRun('SYNC meter reached zero. Keep a steadier beat and avoid empty-lane taps.');
      return;
    }
    if (trackMs >= runtime.totalTrackMs + 520 && runtime.state === 'playing') finishRun();
  }

  function playBeatIfNeeded(trackMs) {
    const phase = PHASES[runtime.currentPhase];
    const phaseStart = runtime.phaseStarts[runtime.currentPhase];
    const beatMs = 60000 / phase.bpm;
    const localBeat = Math.floor(Math.max(0, trackMs - phaseStart) / beatMs);
    const key = runtime.currentPhase * 1000 + localBeat;
    if (key === runtime.currentBeatIndex) return;
    runtime.currentBeatIndex = key;
    playBeat(localBeat % 4 === 0, localBeat, runtime.currentPhase);
  }

  function noteHeadVisible(note, trackMs) {
    if (!note || note.state !== 'pending') return false;
    const y = noteY(note, trackMs);
    const h = Number(note.visualHeight || TILE_H);
    return y + h * .5 >= BOARD_TOP + 2 && y - h * .5 <= TARGET_Y + h * .68;
  }

  function currentInputGroup(trackMs) {
    const chart = runtime.chart;
    const group = runtime.inputGroupScratch;
    group.length = 0;
    let earliest = null;
    let anyVisible = false;
    for (let i = runtime.updateCursor; i < chart.length; i += 1) {
      const note = chart[i];
      if (note.state !== 'pending') continue;
      if (earliest == null) earliest = note.targetTime;
      if (Math.abs(note.targetTime - earliest) > 1) break;
      if (noteHeadVisible(note, trackMs)) {
        group.push(note);
        anyVisible = true;
      }
    }
    if (!anyVisible) group.length = 0;
    return group;
  }

  function nextPendingTargetTime() {
    const chart = runtime.chart;
    for (let i = runtime.updateCursor; i < chart.length; i += 1) {
      if (chart[i].state === 'pending') return chart[i].targetTime;
    }
    return null;
  }

  function judgementForEarlyTap(note, trackMs) {
    const y = noteY(note, trackMs);
    const progress = clamp((y - BOARD_TOP) / Math.max(1, TARGET_Y - BOARD_TOP), 0, 1.2);
    if (progress >= .58) return 'PERFECT';
    if (progress >= .18) return 'GREAT';
    return 'GOOD';
  }

  function pressLane(lane, sourceId) {
    if (lane < 0 || lane > 3) return;
    runtime.laneSources[lane].add(sourceId);
    runtime.laneFlashes[lane] = 1;
    if (runtime.state !== 'playing') return;

    const trackMs = nowInTrack(performance.now());
    const group = currentInputGroup(trackMs);
    if (!group.length) {
      // The next note has not entered the board yet. Do not punish a light
      // exploratory touch as harshly as a wrong Piano-Tiles choice.
      runtime.badTaps += 1;
      runtime.sync = Math.max(0, runtime.sync - .6);
      showJudgement('WAIT FOR NEXT TILE', 'bad');
      playUiTone('bad');
      return;
    }

    const note = group.find(item => item.lane === lane);
    if (!note) {
      // Strict Piano Tiles order: only the earliest visible note/chord is valid.
      runtime.badTaps += 1;
      runtime.sync = Math.max(0, runtime.sync - 4.0);
      runtime.combo = 0;
      showJudgement('WRONG TILE', 'bad');
      playUiTone('bad');
      return;
    }

    const judgement = judgementForEarlyTap(note, trackMs);
    const error = trackMs - note.targetTime;
    registerHit(note, judgement, error);
  }

  function releaseLane(lane, sourceId) {
    if (lane < 0 || lane > 3) return;
    runtime.laneSources[lane].delete(sourceId);
    if (runtime.state !== 'playing') return;
    const trackMs = nowInTrack(performance.now());
    const notes = runtime.notesByLane[lane];
    for (let i = 0; i < notes.length; i += 1) {
      const note = notes[i];
      if (note.state !== 'holding') continue;
      const tailTime = note.targetTime + note.holdDuration;
      if (runtime.laneSources[lane].size > 0) continue;
      if (trackMs >= tailTime - 105) completeHold(note);
      else if (trackMs >= Number(note.resumeGraceUntil || 0)) {
        note.holdReleasedEarly = true;
        registerHoldBreak(note);
      }
    }
  }

  function spawnTapEffect(note, judgement, y) {
    const now = performance.now();
    const maxFx = runtime.lowPower ? 5 : 10;
    if (runtime.hitEffects.length >= maxFx) runtime.hitEffects.shift();
    runtime.hitEffects.push({
      lane: note.lane,
      y,
      height: Number(note.visualHeight || TILE_H),
      hue: LANE_META[note.lane]?.hue || 190,
      judgement,
      born: now,
      duration: runtime.lowPower ? 170 : 185
    });
  }

  function registerHit(note, judgement, errorMs) {
    if (note.state !== 'pending') return;
    note.judgement = judgement;
    note.errorMs = Math.round(errorMs);
    note.headHitAt = nowInTrack(performance.now());
    note.holdStartedAt = note.headHitAt;
    note.visualHitAt = note.headHitAt;
    note.pressFxAt = note.headHitAt;
    note.state = note.holdDuration > 0 ? 'holding' : 'hit';
    runtime.judgedNotes += note.holdDuration > 0 ? 0 : 1;
    runtime.combo += 1;
    runtime.maxCombo = Math.max(runtime.maxCombo, runtime.combo);
    if (judgement === 'PERFECT') { runtime.perfect += 1; runtime.score += 10; runtime.sync = Math.min(100, runtime.sync + 1.4); }
    else if (judgement === 'GREAT') { runtime.great += 1; runtime.score += 8; runtime.sync = Math.min(100, runtime.sync + .9); }
    else { runtime.good += 1; runtime.score += 6; runtime.sync = Math.min(100, runtime.sync + .4); }
    runtime.score += Math.min(5, Math.floor(runtime.combo / 12));
    runtime.targetPulse = 1;
    const hitY = clamp(noteY(note, note.headHitAt), BOARD_TOP + 8, BOARD_BOTTOM - 8);
    if (note.holdDuration <= 0) spawnTapEffect(note, judgement, hitY);
    if (!runtime.lowPower) spawnHitBurst(note.lane, judgement, hitY);
    showJudgement(note.holdDuration > 0 ? `${judgement} · HOLD` : judgement, judgement.toLowerCase());
    playLaneTone(note.lane, judgement === 'PERFECT' ? 1 : judgement === 'GREAT' ? .88 : .76);
    if (note.holdDuration > 0) {
      runtime.activeHoldByLane[note.lane] = note;
      startHoldVoice(note);
    }
    updateHud(note.headHitAt);
    runtime.lastHudUpdateAt = performance.now();
  }

  function completeHold(note) {
    if (note.state !== 'holding') return;
    note.state = 'hit';
    note.holdCompleteAt = nowInTrack(performance.now());
    stopHoldVoice(note, true);
    if (runtime.activeHoldByLane[note.lane] === note) runtime.activeHoldByLane[note.lane] = null;
    runtime.judgedNotes += 1;
    runtime.holdsCompleted += 1;
    runtime.score += 12;
    runtime.sync = Math.min(100, runtime.sync + 1.5);
    showJudgement('HOLD ✓', 'perfect');
    spawnTapEffect(note, 'PERFECT', TARGET_Y);
    if (!runtime.lowPower) spawnHitBurst(note.lane, 'HOLD');
    playLaneTone(note.lane, 1.12);
  }

  function registerHoldBreak(note) {
    if (note.state !== 'holding') return;
    note.state = 'miss';
    note.missAt = nowInTrack(performance.now());
    // A hold is one scored note. If the head was hit but the tail was released
    // early, convert that head judgement into a MISS instead of double-counting.
    if (note.judgement === 'PERFECT') runtime.perfect = Math.max(0, runtime.perfect - 1);
    else if (note.judgement === 'GREAT') runtime.great = Math.max(0, runtime.great - 1);
    else if (note.judgement === 'GOOD') runtime.good = Math.max(0, runtime.good - 1);
    runtime.judgedNotes += 1;
    runtime.misses += 1;
    runtime.combo = 0;
    stopHoldVoice(note, false);
    if (runtime.activeHoldByLane[note.lane] === note) runtime.activeHoldByLane[note.lane] = null;
    runtime.sync = Math.max(0, runtime.sync - 9);
    showJudgement('HOLD LOST', 'miss');
    playUiTone('miss');
  }

  function registerMiss(note, label) {
    if (note.state !== 'pending') return;
    note.state = 'miss';
    note.missAt = nowInTrack(performance.now());
    note.judgement = 'MISS';
    runtime.judgedNotes += 1;
    runtime.misses += 1;
    runtime.combo = 0;
    runtime.sync = Math.max(0, runtime.sync - 9);
    showJudgement(label || 'MISS', 'miss');
    playUiTone('miss');
  }

  function accuracyPercent() {
    const weighted = runtime.perfect * 100 + runtime.great * 85 + runtime.good * 65;
    return runtime.totalNotes > 0 ? clamp(weighted / runtime.totalNotes, 0, 100) : 0;
  }

  function scoreSummary() {
    const accuracy = accuracyPercent();
    const comboBonus = Math.round(clamp(runtime.maxCombo / 180, 0, 1) * 120);
    const syncBonus = Math.round(clamp(runtime.sync / 100, 0, 1) * 80);
    const finalScore = Math.round(clamp(500 + accuracy * 3 + comboBonus + syncBonus, 0, 1000));
    const truePerfect = runtime.totalNotes > 0
      && runtime.perfect === runtime.totalNotes
      && runtime.great === 0
      && runtime.good === 0
      && runtime.misses === 0
      && runtime.badTaps === 0
      && runtime.maxCombo === runtime.totalNotes
      && runtime.holdsCompleted === runtime.holdsTotal;
    let tier = 0;
    if (accuracy >= 80) tier = 5;
    if (accuracy >= 90 && runtime.maxCombo >= 120) tier = 10;
    if (accuracy >= 96 && runtime.maxCombo >= 230 && runtime.misses <= 5 && runtime.holdsCompleted >= runtime.holdsTotal) tier = 15;
    if (truePerfect) tier = 20;
    let grade = 'CLEAR';
    if (truePerfect) grade = 'PERFECT OVERDRIVE';
    else if (accuracy >= 97) grade = 'MASTER SYNC';
    else if (accuracy >= 92) grade = 'EXCELLENT';
    else if (accuracy >= 85) grade = 'GREAT';
    else if (accuracy >= 80) grade = 'GOOD';
    return { score: finalScore, accuracy: Math.round(accuracy * 10) / 10, tier, grade, truePerfect };
  }

  async function finishRun() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'result';
    stopAllHoldVoices();
    runtime.chart.forEach(note => {
      if (note.state === 'pending') registerMiss(note, 'MISS');
      if (note.state === 'holding') completeHold(note);
    });
    const summary = scoreSummary();
    runtime.finalData = summary;
    runtime.bestScore = Math.max(runtime.bestScore, summary.score);
    runtime.bestAccuracy = Math.max(runtime.bestAccuracy, summary.accuracy);
    runtime.finalScoreEl.textContent = String(summary.score);
    runtime.finalAccuracyEl.textContent = `${summary.accuracy.toFixed(1)}%`;
    runtime.finalComboEl.textContent = `x${runtime.maxCombo}`;
    runtime.finalMissesEl.textContent = String(runtime.misses);
    runtime.finalXpEl.textContent = '+0';
    runtime.gradeEl.textContent = summary.grade;
    runtime.rewardNoteEl.className = 'code-tiles-reward-note';
    runtime.rewardNoteEl.textContent = runtime.round ? 'Securing reward…' : 'Practice run — log in to earn account XP.';
    runtime.resultPanel.hidden = false;
    playUiTone('win');
    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    const claimedTierToday = snap.dayKey && runtime.lastRewardDay === snap.dayKey
      ? clamp(Number(runtime.lastRewardXp || 0), 0, 20)
      : 0;
    if (summary.tier <= claimedTierToday) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
      runtime.round = null;
      runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
      runtime.rewardNoteEl.textContent = claimedTierToday >= 20
        ? 'Perfect 20 XP CODE TILES reward already secured today. Replay for score and accuracy.'
        : `Today’s CODE TILES reward is ${claimedTierToday}/20 XP. Beat it to earn only the difference.`;
      return;
    }

    runtime.rewardSubmitting = true;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: summary.score,
        metrics: {
          completedRun: true,
          phasesCompleted: 15,
          totalNotes: runtime.totalNotes,
          perfect: runtime.perfect,
          great: runtime.great,
          good: runtime.good,
          misses: runtime.misses,
          badTaps: runtime.badTaps,
          maxCombo: runtime.maxCombo,
          holdsCompleted: runtime.holdsCompleted,
          holdsTotal: runtime.holdsTotal,
          accuracy: summary.accuracy,
          syncRemaining: Math.round(runtime.sync * 10) / 10,
          activeTimeMs: Math.round(runtime.totalTrackMs)
        }
      });
      runtime.round = null;
      const record = result?.gameRecord || result?.gameRecords?.codeTiles || {};
      runtime.bestScore = Math.max(runtime.bestScore, Number(record.bestRunScore || record.bestScore || 0));
      runtime.bestAccuracy = Math.max(runtime.bestAccuracy, Number(record.bestAccuracy || 0));
      runtime.lastRewardDay = String(record.lastRewardDay || runtime.lastRewardDay || '');
      runtime.lastRewardXp = Math.max(runtime.lastRewardXp, Number(record.lastRewardXp || 0));
      runtime.finalXpEl.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;
      if (result?.loginRequired) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'Practice mode — log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'Reward saved for sync. XP will update automatically once confirmed.';
      } else if (result?.replayNoXp) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'No higher CODE TILES XP tier this run. Best record still counts.';
      } else if (result?.capReached && Number(result?.awardedXp || 0) === 0) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'Daily Mini-Game XP cap reached. You can still improve your rhythm record.';
      } else if (Number(result?.awardedXp || 0) > 0) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note success';
        runtime.rewardNoteEl.textContent = `Reward added safely · Today’s Game XP: ${result.todayXp}/${result.dailyCap}`;
      } else {
        runtime.rewardNoteEl.textContent = 'Track complete, but this performance did not reach an XP tier.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (error) {
      runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
      runtime.rewardNoteEl.textContent = 'Reward saved for sync. XP will update automatically once confirmed.';
    } finally {
      runtime.rewardSubmitting = false;
    }
  }

  function failRun(copy) {
    if (runtime.state !== 'playing' && runtime.state !== 'countdown') return;
    runtime.state = 'failed';
    stopAllHoldVoices();
    runtime.failedReason = String(copy || 'The rhythm link was interrupted.');
    if (runtime.round?.sessionId) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.round = null;
    runtime.failCopyEl.textContent = runtime.failedReason;
    runtime.failPanel.hidden = false;
    playUiTone('fail');
  }

  function showJudgement(text, kind) {
    const now = performance.now();
    if (runtime.lowPower && runtime.lastJudgeText === text && now - runtime.lastJudgeAt < 70) return;
    runtime.lastJudgeText = text;
    runtime.lastJudgeAt = now;
    runtime.judgementEl.textContent = text;
    runtime.judgementEl.dataset.kind = kind || '';
    if (runtime.lowPower) return;
    if (runtime.judgementEl.animate && !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      try { runtime.judgementEl.getAnimations?.().forEach(animation => animation.cancel()); } catch (_) {}
      runtime.judgementEl.animate([
        { opacity: 0, transform: 'translateX(-50%) translateY(7px) scale(.86)' },
        { opacity: 1, transform: 'translateX(-50%) translateY(0) scale(1.06)', offset: .48 },
        { opacity: .9, transform: 'translateX(-50%) scale(1)' }
      ], { duration: 210, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }

  function spawnHitBurst(lane, kind, y = TARGET_Y) {
    if (runtime.lowPower) return;
    const x = BOARD_X + lane * LANE_W + LANE_W / 2;
    const hue = LANE_META[lane].hue;
    const maxParticles = runtime.lowPower ? 8 : 28;
    const wanted = kind === 'PERFECT' ? (runtime.lowPower ? 2 : 6) : (runtime.lowPower ? 1 : 4);
    const count = Math.max(0, Math.min(wanted, maxParticles - runtime.particles.length));
    const now = performance.now();
    for (let i = 0; i < count; i += 1) {
      const angle = Math.PI * (1.1 + Math.random() * .8);
      const speed = 42 + Math.random() * 82;
      runtime.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        born: now, lastUpdate: now, ttl: 300 + Math.random() * 180, size: 2 + Math.random() * 3, hue
      });
    }
  }

  function updateParticles(now) {
    for (let i = runtime.particles.length - 1; i >= 0; i -= 1) {
      const p = runtime.particles[i];
      const age = now - p.born;
      if (age >= p.ttl) {
        const last = runtime.particles.pop();
        if (i < runtime.particles.length && last) runtime.particles[i] = last;
        continue;
      }
      const previous = Number.isFinite(p.lastUpdate) ? p.lastUpdate : p.born;
      const dt = clamp((now - previous) / 1000, 0, .04);
      p.lastUpdate = now;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 145 * dt;
      p.vx *= Math.pow(.98, dt * 60);
    }
  }

  function updateHitEffects(now) {
    for (let i = runtime.hitEffects.length - 1; i >= 0; i -= 1) {
      const fx = runtime.hitEffects[i];
      if (now - fx.born >= fx.duration) {
        runtime.hitEffects.splice(i, 1);
      }
    }
  }

  function laneFromClientX(clientX) {
    const rect = runtime.view.rect || runtime.canvas.getBoundingClientRect();
    const worldX = (clientX - rect.left - runtime.view.ox) / Math.max(.001, runtime.view.scaleX || runtime.view.scale);
    if (worldX < BOARD_X || worldX > BOARD_X + BOARD_W) return -1;
    return clamp(Math.floor((worldX - BOARD_X) / LANE_W), 0, 3);
  }

  function isPhoneLayout() {
    return runtime.view.cssW <= 700;
  }

  // Pointer interactions are intentionally visual/audio only: no vibration or haptic API.
  function onPointerDown(event) {
    if (!runtime.open) return;
    if (runtime.state !== 'playing') return;
    event.preventDefault();
    try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
    const lane = laneFromClientX(event.clientX);
    if (lane < 0) return;
    const sourceId = `p${event.pointerId}`;
    runtime.pointers.set(event.pointerId, lane);
    pressLane(lane, sourceId);
  }

  function onPointerUp(event) {
    const lane = runtime.pointers.get(event.pointerId);
    if (lane == null) return;
    event.preventDefault();
    runtime.pointers.delete(event.pointerId);
    releaseLane(lane, `p${event.pointerId}`);
    try { runtime.canvas.releasePointerCapture(event.pointerId); } catch (_) {}
  }

  function keyLane(event) {
    const key = String(event.key || '').toLowerCase();
    return key === 'd' ? 0 : key === 'f' ? 1 : key === 'j' ? 2 : key === 'k' ? 3 : -1;
  }

  function onKeyDown(event) {
    if (!runtime.open || runtime.state !== 'playing') return;
    const lane = keyLane(event);
    if (lane < 0) return;
    event.preventDefault();
    const key = String(event.key || '').toLowerCase();
    if (runtime.keyboardDown.has(key)) return;
    runtime.keyboardDown.add(key);
    pressLane(lane, `k${key}`);
  }

  function onKeyUp(event) {
    if (!runtime.open) return;
    const lane = keyLane(event);
    if (lane < 0) return;
    event.preventDefault();
    const key = String(event.key || '').toLowerCase();
    runtime.keyboardDown.delete(key);
    releaseLane(lane, `k${key}`);
  }

  function onVisibilityChange() {
    if (document.hidden) pauseRun('hidden');
    else resumeRun('visible');
  }

  function pauseRun() {
    if (!runtime.open || !['playing', 'countdown'].includes(runtime.state)) return;
    runtime.pausedFrom = runtime.state;
    runtime.state = 'paused';
    runtime.pauseStartedNow = performance.now();
    runtime.pausedHoldLanes.clear();
    runtime.chart.forEach(note => { if (note.state === 'holding') runtime.pausedHoldLanes.add(note.lane); });
    runtime.laneSources.forEach(set => set.clear());
    runtime.pointers.clear();
    runtime.keyboardDown.clear();
    try { runtime.audioContext?.suspend?.(); } catch (_) {}
  }

  function resumeRun() {
    if (!runtime.open || runtime.state !== 'paused' || document.hidden) return;
    const now = performance.now();
    const pausedFor = Math.max(0, now - runtime.pauseStartedNow);
    if (runtime.pausedFrom === 'countdown') runtime.startCountdownAt += pausedFor;
    else runtime.pausedAccumMs += pausedFor;
    runtime.state = runtime.pausedFrom || 'playing';
    runtime.pauseStartedNow = 0;
    const trackMs = nowInTrack(now);
    runtime.chart.forEach(note => {
      if (note.state === 'holding') note.resumeGraceUntil = trackMs + 520;
    });
    runtime.pausedHoldLanes.clear();
    try { runtime.audioContext?.resume?.(); } catch (_) {}
  }

  function ensureAudio() {
    if (!runtime.soundEnabled) return null;
    try {
      if (!runtime.audioContext) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        runtime.audioContext = new AC({ latencyHint: 'interactive' });
        runtime.masterGain = runtime.audioContext.createGain();
        runtime.compressor = runtime.audioContext.createDynamicsCompressor();
        runtime.compressor.threshold.value = -14;
        runtime.compressor.knee.value = 10;
        runtime.compressor.ratio.value = 5;
        runtime.compressor.attack.value = .004;
        runtime.compressor.release.value = .12;
        runtime.masterGain.gain.value = .57;
        runtime.masterGain.connect(runtime.compressor);
        runtime.compressor.connect(runtime.audioContext.destination);
      }
      if (runtime.lowPower && runtime.audioContext && runtime.masterGain) ensurePooledAudioVoices();
      if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
      return runtime.audioContext;
    } catch (_) { return null; }
  }

  function ensurePooledAudioVoices() {
    const ctx = runtime.audioContext;
    if (!ctx || !runtime.masterGain) return;
    for (let lane = 0; lane < 4; lane += 1) {
      if (runtime.laneTonePool[lane]) continue;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = LANE_META[lane]?.freq || 330;
        gain.gain.value = .0001;
        osc.connect(gain);
        gain.connect(runtime.masterGain);
        osc.start();
        runtime.laneTonePool[lane] = { osc, gain };
      } catch (_) {}
    }
    if (!runtime.uiVoice) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 220;
        gain.gain.value = .0001;
        osc.connect(gain);
        gain.connect(runtime.masterGain);
        osc.start();
        runtime.uiVoice = { osc, gain };
      } catch (_) {}
    }
  }

  function triggerPooledVoice(voice, freq, volume = .10, duration = .085) {
    if (!voice || !runtime.audioContext) return false;
    try {
      const ctx = runtime.audioContext;
      const now = ctx.currentTime;
      voice.osc.frequency.cancelScheduledValues(now);
      voice.osc.frequency.setValueAtTime(Math.max(30, freq), now);
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(.0001, now);
      voice.gain.gain.linearRampToValueAtTime(Math.max(.001, volume), now + .004);
      voice.gain.gain.exponentialRampToValueAtTime(.0001, now + Math.max(.035, duration));
      return true;
    } catch (_) { return false; }
  }

  function synth(freq, duration = .09, volume = .09, type = 'sine', slideTo = 0, delay = 0) {
    if (!runtime.soundEnabled) return;
    const ctx = ensureAudio();
    if (!ctx || !runtime.masterGain) return;
    const start = ctx.currentTime + Math.max(0, Number(delay || 0));
    const end = start + Math.max(.02, duration);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freq), start);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), end);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.001, volume), start + Math.min(.012, duration * .2));
    gain.gain.exponentialRampToValueAtTime(.0001, end);
    osc.connect(gain); gain.connect(runtime.masterGain);
    osc.start(start); osc.stop(end + .025);
  }

  function playLaneTone(lane, strength = 1) {
    const freq = LANE_META[lane]?.freq || 330;
    if (runtime.lowPower) {
      ensurePooledAudioVoices();
      if (triggerPooledVoice(runtime.laneTonePool[lane], freq, .105 * strength, .080)) return;
      synth(freq, .075, .09 * strength, 'triangle');
      return;
    }
    synth(freq, .12, .13 * strength, 'triangle', freq * 1.015);
    synth(freq * 2, .07, .034 * strength, 'sine');
    synth(freq * 3, .026, .016 * strength, 'square');
  }

  function playBeat(accent, beatIndex = 0, phaseIndex = 0) {
    if (!runtime.soundEnabled) return;
    if (runtime.lowPower) return;
    synth(accent ? 88 : 66, accent ? .095 : .055, accent ? .065 : .030, 'sine', 44);
    synth(accent ? 980 : 1320, .025, accent ? .024 : .015, 'square');
    if (beatIndex % 2 === 0) {
      const roots = [130.81, 146.83, 164.81, 196.0, 174.61];
      const root = roots[phaseIndex % roots.length];
      synth(root * 2, .075, .020, 'triangle');
    }
  }

  function startHoldVoice(note) {
    if (!runtime.soundEnabled || !note || note.holdVoice) return;
    const ctx = ensureAudio();
    if (!ctx || !runtime.masterGain) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = LANE_META[note.lane]?.freq || 330;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.052, ctx.currentTime + .025);
      osc.connect(gain); gain.connect(runtime.masterGain);
      osc.start();
      note.holdVoice = { osc, gain };
    } catch (_) { note.holdVoice = null; }
  }

  function stopHoldVoice(note, success = false) {
    const voice = note?.holdVoice;
    if (!voice || !runtime.audioContext) return;
    note.holdVoice = null;
    try {
      const now = runtime.audioContext.currentTime;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(Math.max(.0001, voice.gain.gain.value || .03), now);
      voice.gain.gain.exponentialRampToValueAtTime(.0001, now + .045);
      voice.osc.stop(now + .06);
    } catch (_) {}
    if (success) playLaneTone(note.lane, 1.05);
  }

  function stopAllHoldVoices() {
    runtime.chart.forEach(note => stopHoldVoice(note, false));
  }

  function playUiTone(kind) {
    if (!runtime.soundEnabled) return;
    if (kind === 'start') { synth(330, .08, .09, 'triangle'); synth(440, .09, .09, 'triangle', 0, .085); synth(554, .10, .075, 'triangle', 0, .17); }
    else if (kind === 'phase') { synth(523, .08, .075, 'triangle'); synth(659, .09, .07, 'triangle', 0, .07); }
    else if (kind === 'miss' || kind === 'bad') {
      if (runtime.lowPower) {
        ensurePooledAudioVoices();
        if (!triggerPooledVoice(runtime.uiVoice, 138, .055, .085)) synth(138, .08, .05, 'sine');
      } else synth(138, .12, .07, 'sawtooth', 92);
    }
    else if (kind === 'win') { synth(523, .12, .09, 'triangle'); synth(659, .12, .085, 'triangle', 0, .095); synth(784, .17, .09, 'triangle', 0, .19); }
    else if (kind === 'fail') synth(190, .24, .085, 'sawtooth', 78);
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    try { runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); } catch (_) {}
    if (runtime.soundEnabled) {
      ensureAudio();
      playUiTone('start');
      runtime.chart.forEach(note => { if (note.state === 'holding') startHoldVoice(note); });
    } else stopAllHoldVoices();
  }

  function renderFrame(now) {
    const ctx = runtime.ctx;
    if (!ctx || !runtime.canvas) return;
    const { dpr, scale, scaleX, scaleY, ox, oy, cssW, cssH } = runtime.view;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#a9c8fb';
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scaleX || scale, scaleY || scale);
    if (runtime.staticSceneReady && runtime.staticScene) ctx.drawImage(runtime.staticScene, 0, 0);
    else drawBackdrop(ctx, now);
    drawBoard(ctx, now);
    if (runtime.state === 'countdown') drawCountdown(ctx, now);
    if (runtime.state === 'paused') drawPause(ctx);
    if (runtime.phaseBanner && ['playing', 'countdown'].includes(runtime.state)) drawPhaseBanner(ctx, now);
    if (!runtime.lowPower) drawParticles(ctx, now);
    ctx.restore();
  }

  function drawBackdrop(ctx, now) {
    ctx.fillStyle = runtime.backdropGradient || '#d9dbf8';
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    if (!runtime.lowPower) {
      BACKDROP_GLOWS.forEach(([x, y, r, color], idx) => {
        const drift = Math.sin(now * 0.00055 + idx) * 5;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y + drift, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (!runtime.lowPower) {
      ctx.save();
      ctx.globalAlpha = 0.76;
      ctx.fillStyle = 'rgba(255,255,255,.78)';
      for (let i = 0; i < BACKDROP_STARS.length; i += 1) {
        const [x, y, s] = BACKDROP_STARS[i];
        ctx.beginPath();
        ctx.moveTo(x, y - s); ctx.lineTo(x + s * .34, y - s * .34); ctx.lineTo(x + s, y); ctx.lineTo(x + s * .34, y + s * .34);
        ctx.lineTo(x, y + s); ctx.lineTo(x - s * .34, y + s * .34); ctx.lineTo(x - s, y); ctx.lineTo(x - s * .34, y - s * .34);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawBoard(ctx, now) {
    ctx.save();
    roundRect(ctx, BOARD_X, BOARD_TOP, BOARD_W, BOARD_BOTTOM - BOARD_TOP, 16);
    ctx.clip();

    if (!runtime.staticSceneReady) {
      for (let lane = 0; lane < 4; lane += 1) {
        const x = BOARD_X + lane * LANE_W;
        ctx.fillStyle = LANE_FILLS[lane];
        ctx.fillRect(x, BOARD_TOP, LANE_W, BOARD_BOTTOM - BOARD_TOP);
        if (lane > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,.34)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, BOARD_TOP);
          ctx.lineTo(x, BOARD_BOTTOM);
          ctx.stroke();
        }
      }
      if (!isPhoneLayout()) for (let lane = 0; lane < 4; lane += 1) drawLaneLabel(ctx, lane);
    }

    const targetAlpha = .88 + runtime.targetPulse * .12;
    ctx.strokeStyle = `rgba(244,147,38,${targetAlpha})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(BOARD_X + 4, TARGET_Y);
    ctx.lineTo(BOARD_X + BOARD_W - 4, TARGET_Y);
    ctx.stroke();
    if (!runtime.lowPower) SYNC_ACCENTS.forEach((ratio, i) => {
      const cx = BOARD_X + BOARD_W * ratio;
      const size = i === 2 ? 9 : 11;
      ctx.fillStyle = i === 2 ? 'rgba(30,64,175,.95)' : 'rgba(250,204,21,.96)';
      ctx.beginPath();
      ctx.moveTo(cx, TARGET_Y - size); ctx.lineTo(cx + size, TARGET_Y); ctx.lineTo(cx, TARGET_Y + size); ctx.lineTo(cx - size, TARGET_Y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.58)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    const trackMs = ['playing', 'result', 'failed', 'paused'].includes(runtime.state) ? nowInTrack(now) : 0;
    const chart = runtime.chart;
    const start = runtime.updateCursor;
    const nextTime = runtime.lowPower ? null : nextPendingTargetTime();
    for (let i = start; i < chart.length; i += 1) {
      const note = chart[i];
      if (note.targetTime - note.travelMs > trackMs + (runtime.lowPower ? 80 : 180)) break;
      if (note.targetTime + note.holdDuration < trackMs - 520 && (note.state === 'hit' || note.state === 'miss')) continue;
      drawNote(ctx, note, trackMs, now, nextTime != null && Math.abs(note.targetTime - nextTime) <= 1);
    }
    drawHitEffects(ctx, now);

    if (!isPhoneLayout()) drawLanePads(ctx, trackMs);

    ctx.restore();
    if (!runtime.staticSceneReady) {
      ctx.save();
      roundRect(ctx, BOARD_X, BOARD_TOP, BOARD_W, BOARD_BOTTOM - BOARD_TOP, 16);
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawLaneLabel(ctx, lane) {
    if (isPhoneLayout()) return;
    const x = BOARD_X + lane * LANE_W + LANE_W / 2;
    const meta = LANE_META[lane];
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(31,41,55,.62)';
    ctx.font = '900 10px system-ui';
    ctx.fillText(meta.label, x, BOARD_TOP + 20);
  }

  function noteY(note, trackMs) {
    const delta = note.targetTime - trackMs;
    const pixelsPerMs = (TARGET_Y - ENTRY_Y) / note.travelMs;
    return TARGET_Y - delta * pixelsPerMs;
  }

  function drawNote(ctx, note, trackMs, now, isNext = false) {
    const shortHit = note.state === 'hit' && note.holdDuration <= 0;
    const shortMiss = note.state === 'miss' && note.holdDuration <= 0;
    const completedHold = note.state === 'hit' && note.holdDuration > 0;
    const brokenHold = note.state === 'miss' && note.holdDuration > 0;

    // A correct tap/hold is consumed immediately, Piano-Tiles style.
    // Only missed notes continue travelling below the deadline line.
    if (shortHit || completedHold) return;

    if (shortMiss) {
      const y = noteY(note, trackMs);
      if (y < BOARD_TOP - 90 || y > BOARD_BOTTOM + 150) return;
      const x = BOARD_X + note.lane * LANE_W + 2;
      const w = LANE_W - 4;
      const shortH = Number(note.visualHeight || TILE_H);
      const travel = clamp((y - TARGET_Y) / Math.max(1, BOARD_BOTTOM - TARGET_Y + 80), 0, 1);
      const alpha = travel <= .72 ? 1 : clamp(1 - (travel - .72) / .28, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(127,29,29,.92)';
      ctx.fillRect(x + 1, y - shortH * .5, w - 2, shortH);
      ctx.restore();
      return;
    }

    if (brokenHold) {
      const doneAt = Number(note.missAt) || trackMs;
      const elapsed = Math.max(0, trackMs - doneAt);
      const exitDuration = 430;
      if (elapsed > exitDuration) return;
      const t = clamp(elapsed / exitDuration, 0, 1);
      const x = BOARD_X + note.lane * LANE_W + 2;
      const w = LANE_W - 4;
      const y = TARGET_Y + 34 + t * 150;
      const h = Math.max(32, 138 * (1 - t * .42));
      ctx.save();
      ctx.globalAlpha = t < .48 ? 1 : clamp(1 - (t - .48) / .52, 0, 1);
      ctx.fillStyle = 'rgba(127,29,29,.92)';
      ctx.fillRect(x + 1, y - h * .5, w - 2, h);
      ctx.restore();
      return;
    }

    const headY = note.state === 'holding' ? TARGET_Y : noteY(note, trackMs);
    const x = BOARD_X + note.lane * LANE_W + 2;
    const w = LANE_W - 4;
    const meta = LANE_META[note.lane];
    const held = note.state === 'holding';

    if (note.holdDuration > 0 && (note.state === 'pending' || held)) {
      const tailTime = note.targetTime + note.holdDuration;
      const pxPerMs = (TARGET_Y - ENTRY_Y) / note.travelMs;
      const tailY = TARGET_Y - (tailTime - trackMs) * pxPerMs;
      const rawTop = Math.min(tailY, headY - 62);
      const rawBottom = headY + 68;
      if (rawBottom < BOARD_TOP || rawTop > BOARD_BOTTOM + 20) return;
      const top = Math.max(BOARD_TOP, rawTop);
      const bottom = Math.min(BOARD_BOTTOM, rawBottom);
      const drawBottom = Math.min(BOARD_BOTTOM, Math.max(bottom, top + TILE_H));
      const h = Math.max(1, drawBottom - top);

      ctx.save();
      ctx.fillStyle = '#050505';
      ctx.fillRect(x + 1, top, w - 2, h);
      if (held) {
        const holdStart = Number(note.holdStartedAt ?? note.headHitAt ?? note.targetTime);
        const holdEnd = note.targetTime + note.holdDuration;
        const progress = clamp((trackMs - holdStart) / Math.max(1, holdEnd - holdStart), 0, 1);
        const visibleProgress = Math.max(.055, progress); // color appears on the very first press frame
        const fillH = Math.max(4, h * visibleProgress);
        const fillY = drawBottom - fillH;
        ctx.fillStyle = `hsla(${meta.hue}, 78%, 52%, .78)`;
        ctx.fillRect(x + 2, fillY, w - 4, fillH);
        ctx.fillStyle = `hsla(${meta.hue}, 98%, 82%, .92)`;
        ctx.fillRect(x + 2, Math.max(top, fillY - 4), w - 4, 4);
        ctx.strokeStyle = `hsla(${meta.hue}, 96%, 76%, .90)`;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x + 2.5, top + 1.5, w - 5, Math.max(1, h - 3));
      } else if (isNext) {
        ctx.strokeStyle = 'rgba(255,255,255,.78)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, top + 2, w - 6, Math.max(1, h - 4));
      }
      // Tail cap makes the end of a long note easy to read while it approaches.
      ctx.fillStyle = held ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.20)';
      ctx.fillRect(x + 8, top + 2, w - 16, 4);
      ctx.restore();
      return;
    }

    const shortH = Number(note.visualHeight || TILE_H);
    if (headY + shortH * .5 < BOARD_TOP || headY - shortH * .5 > BOARD_BOTTOM + 12) return;
    ctx.save();
    ctx.fillStyle = '#050505';
    ctx.fillRect(x + 1, headY - shortH * .5, w - 2, shortH);
    if (isNext) {
      ctx.strokeStyle = 'rgba(255,255,255,.74)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, headY - shortH * .5 + 1, w - 4, shortH - 2);
    }
    if (!runtime.lowPower) {
      ctx.fillStyle = 'rgba(255,255,255,.03)';
      ctx.fillRect(x + 8, headY - shortH * .5 + 4, w - 16, Math.min(12, shortH * .12));
    }
    ctx.restore();
  }

  function drawHitEffects(ctx, now) {
    for (let i = 0; i < runtime.hitEffects.length; i += 1) {
      const fx = runtime.hitEffects[i];
      const t = clamp((now - fx.born) / fx.duration, 0, 1);
      const x = BOARD_X + fx.lane * LANE_W + 2;
      const w = LANE_W - 4;
      const press = t < .30 ? t / .30 : 1;
      const fade = t < .62 ? 1 : clamp(1 - (t - .62) / .38, 0, 1);
      const scaleY = t < .30 ? lerp(1, .91, press) : lerp(.91, .72, (t - .30) / .70);
      const h = Math.max(22, fx.height * scaleY);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.fillStyle = `hsla(${fx.hue}, 84%, ${fx.judgement === 'PERFECT' ? 62 : 56}%, .96)`;
      ctx.fillRect(x + 2, fx.y - h * .5, w - 4, h);
      if (!runtime.lowPower) {
        ctx.strokeStyle = 'rgba(255,255,255,.88)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, fx.y - h * .5 + 1, w - 6, Math.max(1, h - 2));
        const sweep = w * clamp(t / .45, 0, 1);
        ctx.fillStyle = 'rgba(255,255,255,.25)';
        ctx.fillRect(x + 4, fx.y - 2, Math.max(0, sweep - 8), 4);
      }
      ctx.restore();
    }
  }

  function drawLanePads(ctx, trackMs) {
    for (let lane = 0; lane < 4; lane += 1) {
      const x = BOARD_X + lane * LANE_W + 14;
      const meta = LANE_META[lane];
      const active = runtime.laneSources[lane].size > 0;
      const hold = runtime.activeHoldByLane[lane];
      const holding = Boolean(hold && hold.state === 'holding');
      roundRect(ctx, x, TARGET_Y + 36, LANE_W - 28, 52, 12);
      ctx.fillStyle = holding ? 'rgba(37,99,235,.35)' : active ? 'rgba(17,24,39,.54)' : 'rgba(255,255,255,.12)';
      ctx.fill();
      ctx.strokeStyle = active || holding ? 'rgba(255,255,255,.56)' : 'rgba(255,255,255,.20)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(17,24,39,.88)';
      ctx.font = '900 17px system-ui';
      ctx.fillText(meta.key, x + (LANE_W - 28) / 2, TARGET_Y + 60);
      if (holding) {
        const holdStart = Number(hold.holdStartedAt ?? hold.headHitAt ?? hold.targetTime);
        const progress = clamp((trackMs - holdStart) / Math.max(1, (hold.targetTime + hold.holdDuration) - holdStart), 0, 1);
        ctx.font = '900 9px system-ui';
        ctx.fillText(`HOLD ${Math.round(progress * 100)}%`, x + (LANE_W - 28) / 2, TARGET_Y + 78);
      }
    }
  }

  function drawParticles(ctx, now) {
    runtime.particles.forEach(p => {
      const life = clamp(1 - (now - p.born) / p.ttl, 0, 1);
      ctx.globalAlpha = life;
      ctx.fillStyle = `hsl(${p.hue} 95% 70%)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * life + .8, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawCountdown(ctx) {
    const value = runtime.startCountdownValue;
    ctx.save();
    ctx.fillStyle = 'rgba(2,6,23,.52)'; ctx.fillRect(BOARD_X, BOARD_TOP, BOARD_W, BOARD_BOTTOM - BOARD_TOP);
    ctx.textAlign = 'center'; ctx.fillStyle = '#f8fafc'; ctx.font = '1000 90px system-ui';
    ctx.shadowColor = 'rgba(34,211,238,.72)'; ctx.shadowBlur = 28;
    ctx.fillText(value > 0 ? String(value) : 'GO!', WORLD_W / 2, 525);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#67e8f9'; ctx.font = '900 16px system-ui'; ctx.fillText('READY YOUR RHYTHM', WORLD_W / 2, 566);
    ctx.restore();
  }

  function drawPause(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(2,6,23,.72)'; ctx.fillRect(BOARD_X, BOARD_TOP, BOARD_W, BOARD_BOTTOM - BOARD_TOP);
    ctx.textAlign = 'center'; ctx.fillStyle = '#f8fafc'; ctx.font = '950 44px system-ui'; ctx.fillText('PAUSED', WORLD_W / 2, 510);
    ctx.fillStyle = '#94a3b8'; ctx.font = '800 14px system-ui'; ctx.fillText('Return to the game to continue.', WORLD_W / 2, 544);
    ctx.restore();
  }

  function drawPhaseBanner(ctx, now) {
    if (!runtime.phaseBanner) return;
    if (runtime.lowPower) return;
    const age = now - runtime.phaseBanner.startedAt;
    if (age < 0 || age > 1150) return;
    const t = clamp(age / 1150, 0, 1);
    const alpha = Math.sin(Math.PI * t);
    const phase = PHASES[runtime.phaseBanner.index] || PHASES[0];
    ctx.save(); ctx.globalAlpha = alpha * (isPhoneLayout() ? .72 : 1);
    ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = isPhoneLayout() ? '950 22px system-ui' : '950 30px system-ui';
    ctx.fillText(`PHASE ${runtime.phaseBanner.index + 1}`, WORLD_W / 2, isPhoneLayout() ? 310 : 350);
    ctx.fillStyle = '#67e8f9'; ctx.font = isPhoneLayout() ? '900 11px system-ui' : '900 14px system-ui'; ctx.fillText(`${phase.label} · ${phase.bpm} BPM`, WORLD_W / 2, isPhoneLayout() ? 336 : 380);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
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
    stopAllHoldVoices();
    runtime.round = null;
    runtime.open = false;
    runtime.state = 'closed';
    runtime.overlay.hidden = true;
    document.body.classList.remove('code-tiles-active');
    runtime.laneSources.forEach(set => set.clear());
    runtime.pointers.clear();
    runtime.keyboardDown.clear();
    runtime.readyPanel.hidden = false;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    clearTimeout(runtime.resizeTimer);
    try { runtime.audioContext?.suspend?.(); } catch (_) {}
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
    runtime.lastRewardXp = clamp(Number(record.lastRewardXp || 0), 0, 20);
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.open = true;
    runtime.state = 'ready';
    runtime.updateCursor = 0;
    runtime.hudCache = Object.create(null);
    runtime.overlay.hidden = false;
    document.body.classList.add('code-tiles-active');
    runtime.readyPanel.hidden = false;
    runtime.failPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    buildPhaseStarts();
    buildChart('preview');
    updateHud(0);
    requestAnimationFrame(() => {
      resizeCanvas();
      requestAnimationFrame(() => {
        resizeCanvas();
        renderFrame(performance.now());
      });
    });
    if (!runtime.raf) runtime.raf = requestAnimationFrame(loop);
  }

  window[GLOBAL_NAME] = Object.freeze({ open, close: closeInternal, isOpen: () => runtime.open });
})();
