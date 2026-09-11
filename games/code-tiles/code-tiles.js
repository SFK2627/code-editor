(() => {
  'use strict';

  const GAME_ID = 'code-tiles';
  const GLOBAL_NAME = 'ICT8CodeTiles';
  const WORLD_W = 720;
  const WORLD_H = 1040;
  const MAX_DPR = 2;
  const TARGET_Y = 850;
  const BOARD_TOP = 154;
  const BOARD_BOTTOM = 980;
  const BOARD_X = 48;
  const BOARD_W = 624;
  const LANE_W = BOARD_W / 4;
  const HIT_WINDOWS = Object.freeze({ perfect: 60, great: 115, good: 180 });
  const PHASES = Object.freeze([
    Object.freeze({ bpm: 75, bars: 5, events: 18, doubles: 0, holds: 0, travelMs: 2250, label: 'WARM UP' }),
    Object.freeze({ bpm: 90, bars: 5, events: 21, doubles: 0, holds: 0, travelMs: 2050, label: 'LOCK IN' }),
    Object.freeze({ bpm: 105, bars: 5, events: 23, doubles: 2, holds: 2, travelMs: 1840, label: 'BUILD FLOW' }),
    Object.freeze({ bpm: 120, bars: 5, events: 26, doubles: 3, holds: 3, travelMs: 1650, label: 'FAST LANE' }),
    Object.freeze({ bpm: 140, bars: 5, events: 30, doubles: 4, holds: 4, travelMs: 1460, label: 'FINAL SYNC' })
  ]);
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
    view: { cssW: WORLD_W, cssH: WORLD_H, dpr: 1, scale: 1, ox: 0, oy: 0, rect: null },
    raf: 0,
    lastFrameNow: 0,
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
    pointers: new Map(),
    keyboardDown: new Set(),
    particles: [],
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
          <div class="code-tiles-brand"><strong>🎹 CODE TILES</strong><small>Keep the Beat</small></div>
          <button type="button" data-code-tiles-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-code-tiles-close aria-label="Close Code Tiles">×</button>
        </header>

        <div class="code-tiles-hud">
          <div><small>PHASE</small><strong data-code-tiles-phase>1/5</strong></div>
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
            <p class="code-tiles-kicker">60-SECOND RHYTHM RUN</p>
            <h2>CODE TILES</h2>
            <p>Tap each code tile as it reaches the SYNC LINE. Later phases add double notes and hold tiles — speed rises gradually, never all at once.</p>
            <div class="code-tiles-key-row"><span><b>D</b> HTML</span><span><b>F</b> CSS</span><span><b>J</b> JS</span><span><b>K</b> 01</span></div>
            <div class="code-tiles-phase-strip"><span>75</span><span>90</span><span>105</span><span>120</span><span>140 BPM</span></div>
            <button type="button" class="primary" data-code-tiles-play>PLAY TRACK</button>
            <small class="code-tiles-tip">Phone: tap the lanes · Desktop: mouse or D F J K</small>
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
            <p class="code-tiles-reward-note" data-code-tiles-reward-note>Checking reward…</p>
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

  function generateEventSteps(eventCount) {
    const maxStep = 39;
    const result = [];
    for (let i = 0; i < eventCount; i += 1) {
      let step = 1 + Math.round(i * (maxStep - 2) / Math.max(1, eventCount - 1));
      while (result.includes(step) && step < maxStep) step += 1;
      while (result.includes(step) && step > 1) step -= 1;
      result.push(step);
    }
    return result.sort((a, b) => a - b);
  }

  function buildChart(roundToken) {
    buildPhaseStarts();
    const rng = makeRng(`${roundToken || 'practice'}:code-tiles:v1`);
    const chart = [];
    const laneBlockedUntil = [0, 0, 0, 0];
    let id = 0;

    PHASES.forEach((phase, phaseIndex) => {
      const beatMs = 60000 / phase.bpm;
      const halfBeat = beatMs / 2;
      const phaseStart = runtime.phaseStarts[phaseIndex];
      const steps = generateEventSteps(phase.events);
      const doubleIndices = new Set();
      const holdIndices = new Set();
      for (let d = 0; d < phase.doubles; d += 1) {
        doubleIndices.add(Math.min(phase.events - 2, Math.max(3, Math.round((d + 1) * phase.events / (phase.doubles + 1)))));
      }
      for (let h = 0; h < phase.holds; h += 1) {
        let candidate = Math.min(phase.events - 3, Math.max(2, Math.round((h + .65) * phase.events / (phase.holds + .4))));
        while (doubleIndices.has(candidate) && candidate < phase.events - 3) candidate += 1;
        holdIndices.add(candidate);
      }

      let previousLane = -1;
      let sameLaneRun = 0;
      steps.forEach((step, eventIndex) => {
        const targetTime = phaseStart + step * halfBeat;
        const needed = doubleIndices.has(eventIndex) ? 2 : 1;
        const available = [0, 1, 2, 3].filter(lane => laneBlockedUntil[lane] <= targetTime - HIT_WINDOWS.good - 40);
        const pool = available.length >= needed ? available : [0, 1, 2, 3];
        let firstLane = pool[Math.floor(rng() * pool.length)] ?? (eventIndex % 4);
        if (firstLane === previousLane && sameLaneRun >= 1) {
          const alternate = pool.find(lane => lane !== previousLane);
          if (alternate != null) firstLane = alternate;
        }
        const lanes = [firstLane];
        if (needed === 2) {
          const secondCandidates = pool.filter(lane => lane !== firstLane);
          let secondLane = secondCandidates.find(lane => Math.abs(lane - firstLane) >= 2);
          if (secondLane == null) secondLane = secondCandidates[Math.floor(rng() * Math.max(1, secondCandidates.length))] ?? ((firstLane + 2) % 4);
          lanes.push(secondLane);
        }

        lanes.forEach((lane, chordIndex) => {
          const isHold = chordIndex === 0 && holdIndices.has(eventIndex);
          const holdDuration = isHold ? halfBeat * (phaseIndex >= 4 && rng() > .5 ? 3 : 2) : 0;
          chart.push({
            id: `ct-${String(++id).padStart(3, '0')}`,
            phaseIndex,
            lane,
            targetTime,
            travelMs: phase.travelMs,
            holdDuration,
            state: 'pending',
            judgement: '',
            errorMs: 0,
            headHitAt: 0,
            holdReleasedEarly: false,
            spawnedBurst: false
          });
          if (holdDuration > 0) laneBlockedUntil[lane] = targetTime + holdDuration + HIT_WINDOWS.good + 70;
        });
        if (firstLane === previousLane) sameLaneRun += 1;
        else sameLaneRun = 1;
        previousLane = firstLane;
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
    const dpr = clamp(window.devicePixelRatio || 1, 1, MAX_DPR);
    runtime.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    runtime.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    runtime.canvas.style.width = `${rect.width}px`;
    runtime.canvas.style.height = `${rect.height}px`;
    const scale = Math.min(rect.width / WORLD_W, rect.height / WORLD_H);
    runtime.view = {
      cssW: rect.width,
      cssH: rect.height,
      dpr,
      scale,
      ox: (rect.width - WORLD_W * scale) / 2,
      oy: (rect.height - WORLD_H * scale) / 2,
      rect: runtime.canvas.getBoundingClientRect()
    };
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
    runtime.phaseEl.textContent = `${runtime.currentPhase + 1}/${PHASES.length}`;
    runtime.bpmEl.textContent = String(phase.bpm);
    runtime.comboEl.textContent = `x${runtime.combo}`;
    runtime.syncEl.textContent = `${Math.round(runtime.sync)}%`;
    runtime.syncEl.dataset.low = runtime.sync < 35 ? '1' : '';
    runtime.scoreEl.textContent = String(Math.round(runtime.score));
    runtime.progressEl.style.transform = `scaleX(${clamp(trackMs / Math.max(1, runtime.totalTrackMs), 0, 1)})`;
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
    runtime.particles.length = 0;
    runtime.laneFlashes.fill(0);
    runtime.laneSources.forEach(set => set.clear());
    runtime.pointers.clear();
    runtime.keyboardDown.clear();
    runtime.currentPhase = 0;
    runtime.currentBeatIndex = -1;
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
    runtime.lastFrameNow = now;
    if (runtime.state === 'countdown') {
      const elapsed = now - runtime.startCountdownAt;
      runtime.startCountdownValue = elapsed < 700 ? 3 : elapsed < 1400 ? 2 : elapsed < 2100 ? 1 : 0;
      if (elapsed >= 2500) beginTrack(now);
    } else if (runtime.state === 'playing') {
      updateGame(now);
    }
    updateParticles(now);
    renderFrame(now);
    if (runtime.open && ['countdown', 'playing', 'paused', 'ready', 'result', 'failed'].includes(runtime.state)) {
      runtime.raf = requestAnimationFrame(loop);
    }
  }

  function updateGame(now) {
    const trackMs = nowInTrack(now);
    const nextPhase = phaseAt(trackMs);
    if (nextPhase !== runtime.currentPhase) {
      runtime.currentPhase = nextPhase;
      runtime.phaseBanner = { index: nextPhase, startedAt: now };
      playUiTone('phase');
      vibrate(10);
    }
    playBeatIfNeeded(trackMs);

    runtime.chart.forEach(note => {
      if (note.state === 'pending' && trackMs - note.targetTime > HIT_WINDOWS.good) registerMiss(note, 'MISS');
      if (note.state === 'holding') {
        const laneHeld = runtime.laneSources[note.lane].size > 0;
        const tailTime = note.targetTime + note.holdDuration;
        if (!laneHeld && trackMs < tailTime - 120) {
          note.holdReleasedEarly = true;
          registerHoldBreak(note);
        } else if (trackMs >= tailTime - 35) {
          if (laneHeld || trackMs >= tailTime + 80) completeHold(note);
        }
      }
    });

    runtime.laneFlashes = runtime.laneFlashes.map(value => Math.max(0, value - 0.045));
    runtime.targetPulse = Math.max(0, runtime.targetPulse - 0.035);
    updateHud(trackMs);

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
    playBeat(localBeat % 4 === 0);
  }

  function noteForLane(lane, trackMs) {
    const notes = runtime.notesByLane[lane] || [];
    let best = null;
    let bestAbs = Infinity;
    for (const note of notes) {
      if (note.state !== 'pending') continue;
      const error = trackMs - note.targetTime;
      const abs = Math.abs(error);
      if (abs <= HIT_WINDOWS.good && abs < bestAbs) {
        best = note;
        bestAbs = abs;
      }
      if (note.targetTime > trackMs + HIT_WINDOWS.good) break;
    }
    return best;
  }

  function pressLane(lane, sourceId) {
    if (lane < 0 || lane > 3) return;
    runtime.laneSources[lane].add(sourceId);
    runtime.laneFlashes[lane] = 1;
    if (runtime.state !== 'playing') return;
    const trackMs = nowInTrack(performance.now());
    const note = noteForLane(lane, trackMs);
    if (!note) {
      runtime.badTaps += 1;
      runtime.sync = Math.max(0, runtime.sync - 3.5);
      runtime.combo = 0;
      showJudgement('EMPTY', 'bad');
      playUiTone('bad');
      return;
    }
    const error = trackMs - note.targetTime;
    const abs = Math.abs(error);
    let judgement = 'GOOD';
    if (abs <= HIT_WINDOWS.perfect) judgement = 'PERFECT';
    else if (abs <= HIT_WINDOWS.great) judgement = 'GREAT';
    registerHit(note, judgement, error);
  }

  function releaseLane(lane, sourceId) {
    if (lane < 0 || lane > 3) return;
    runtime.laneSources[lane].delete(sourceId);
    if (runtime.state !== 'playing') return;
    const trackMs = nowInTrack(performance.now());
    runtime.notesByLane[lane].forEach(note => {
      if (note.state !== 'holding') return;
      const tailTime = note.targetTime + note.holdDuration;
      if (trackMs < tailTime - 120 && runtime.laneSources[lane].size === 0) {
        note.holdReleasedEarly = true;
        registerHoldBreak(note);
      }
    });
  }

  function registerHit(note, judgement, errorMs) {
    if (note.state !== 'pending') return;
    note.judgement = judgement;
    note.errorMs = Math.round(errorMs);
    note.headHitAt = nowInTrack(performance.now());
    note.state = note.holdDuration > 0 ? 'holding' : 'hit';
    runtime.judgedNotes += note.holdDuration > 0 ? 0 : 1;
    runtime.combo += 1;
    runtime.maxCombo = Math.max(runtime.maxCombo, runtime.combo);
    if (judgement === 'PERFECT') { runtime.perfect += 1; runtime.score += 10; runtime.sync = Math.min(100, runtime.sync + 1.4); }
    else if (judgement === 'GREAT') { runtime.great += 1; runtime.score += 8; runtime.sync = Math.min(100, runtime.sync + .9); }
    else { runtime.good += 1; runtime.score += 6; runtime.sync = Math.min(100, runtime.sync + .4); }
    runtime.score += Math.min(5, Math.floor(runtime.combo / 12));
    runtime.targetPulse = 1;
    spawnHitBurst(note.lane, judgement);
    showJudgement(judgement, judgement.toLowerCase());
    playLaneTone(note.lane, judgement === 'PERFECT' ? 1 : judgement === 'GREAT' ? .86 : .72);
    vibrate(judgement === 'PERFECT' ? 10 : 6);
  }

  function completeHold(note) {
    if (note.state !== 'holding') return;
    note.state = 'hit';
    runtime.judgedNotes += 1;
    runtime.holdsCompleted += 1;
    runtime.score += 12;
    runtime.sync = Math.min(100, runtime.sync + 1.5);
    showJudgement('HOLD ✓', 'perfect');
    spawnHitBurst(note.lane, 'HOLD');
    playLaneTone(note.lane, 1.12);
  }

  function registerHoldBreak(note) {
    if (note.state !== 'holding') return;
    note.state = 'miss';
    // A hold is one scored note. If the head was hit but the tail was released
    // early, convert that head judgement into a MISS instead of double-counting.
    if (note.judgement === 'PERFECT') runtime.perfect = Math.max(0, runtime.perfect - 1);
    else if (note.judgement === 'GREAT') runtime.great = Math.max(0, runtime.great - 1);
    else if (note.judgement === 'GOOD') runtime.good = Math.max(0, runtime.good - 1);
    runtime.judgedNotes += 1;
    runtime.misses += 1;
    runtime.combo = 0;
    runtime.sync = Math.max(0, runtime.sync - 12);
    showJudgement('HOLD LOST', 'miss');
    playUiTone('miss');
  }

  function registerMiss(note, label) {
    if (note.state !== 'pending') return;
    note.state = 'miss';
    note.judgement = 'MISS';
    runtime.judgedNotes += 1;
    runtime.misses += 1;
    runtime.combo = 0;
    runtime.sync = Math.max(0, runtime.sync - 12);
    showJudgement(label || 'MISS', 'miss');
    playUiTone('miss');
  }

  function accuracyPercent() {
    const weighted = runtime.perfect * 100 + runtime.great * 85 + runtime.good * 65;
    return runtime.totalNotes > 0 ? clamp(weighted / runtime.totalNotes, 0, 100) : 0;
  }

  function scoreSummary() {
    const accuracy = accuracyPercent();
    const comboBonus = Math.round(clamp(runtime.maxCombo / 70, 0, 1) * 120);
    const syncBonus = Math.round(clamp(runtime.sync / 100, 0, 1) * 80);
    const finalScore = Math.round(clamp(500 + accuracy * 3 + comboBonus + syncBonus, 0, 1000));
    let tier = 0;
    if (accuracy >= 80) tier = 1;
    if (accuracy >= 90 && runtime.maxCombo >= 35) tier = 2;
    if (accuracy >= 96 && runtime.maxCombo >= 60 && runtime.misses <= 3 && runtime.holdsCompleted >= runtime.holdsTotal) tier = 3;
    let grade = 'CLEAR';
    if (accuracy >= 96) grade = 'MASTER SYNC';
    else if (accuracy >= 90) grade = 'EXCELLENT';
    else if (accuracy >= 80) grade = 'GREAT';
    else if (accuracy >= 70) grade = 'GOOD';
    return { score: finalScore, accuracy: Math.round(accuracy * 10) / 10, tier, grade };
  }

  async function finishRun() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'result';
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
    runtime.rewardNoteEl.textContent = runtime.round ? 'Checking secure reward…' : 'Practice run — log in to earn account XP.';
    runtime.resultPanel.hidden = false;
    playUiTone('win');
    vibrate([14, 35, 18]);

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    const claimedTierToday = snap.dayKey && runtime.lastRewardDay === snap.dayKey
      ? clamp(Number(runtime.lastRewardXp || 0), 0, 3)
      : 0;
    if (summary.tier <= claimedTierToday) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
      runtime.round = null;
      runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
      runtime.rewardNoteEl.textContent = claimedTierToday >= 3
        ? 'Master reward already secured today. Replay for a higher score and accuracy.'
        : `Today’s CODE TILES tier is ${claimedTierToday}/3. Beat it to earn only the difference.`;
      return;
    }

    runtime.rewardSubmitting = true;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: summary.score,
        metrics: {
          completedRun: true,
          phasesCompleted: 5,
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
        runtime.rewardNoteEl.textContent = 'XP could not sync. No account XP was added.';
      } else if (result?.replayNoXp) {
        runtime.rewardNoteEl.className = 'code-tiles-reward-note warn';
        runtime.rewardNoteEl.textContent = 'No higher CODE TILES reward tier this run. Best record still counts.';
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
      runtime.rewardNoteEl.textContent = 'XP could not sync. No account XP was added.';
    } finally {
      runtime.rewardSubmitting = false;
    }
  }

  function failRun(copy) {
    if (runtime.state !== 'playing' && runtime.state !== 'countdown') return;
    runtime.state = 'failed';
    runtime.failedReason = String(copy || 'The rhythm link was interrupted.');
    if (runtime.round?.sessionId) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.round = null;
    runtime.failCopyEl.textContent = runtime.failedReason;
    runtime.failPanel.hidden = false;
    playUiTone('fail');
    vibrate([20, 30, 25]);
  }

  function showJudgement(text, kind) {
    runtime.judgementEl.textContent = text;
    runtime.judgementEl.dataset.kind = kind || '';
    runtime.judgementEl.classList.remove('pop');
    void runtime.judgementEl.offsetWidth;
    runtime.judgementEl.classList.add('pop');
  }

  function spawnHitBurst(lane, kind) {
    const x = BOARD_X + lane * LANE_W + LANE_W / 2;
    const hue = LANE_META[lane].hue;
    const count = kind === 'PERFECT' ? 14 : 9;
    const now = performance.now();
    for (let i = 0; i < count; i += 1) {
      const angle = Math.PI * (1.1 + Math.random() * .8);
      const speed = 45 + Math.random() * 95;
      runtime.particles.push({
        x, y: TARGET_Y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        born: now, lastUpdate: now, ttl: 360 + Math.random() * 220, size: 2 + Math.random() * 4, hue
      });
    }
  }

  function updateParticles(now) {
    runtime.particles = runtime.particles.filter(p => {
      const age = now - p.born;
      if (age >= p.ttl) return false;
      const previous = Number.isFinite(p.lastUpdate) ? p.lastUpdate : p.born;
      const dt = clamp((now - previous) / 1000, 0, .04);
      p.lastUpdate = now;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 150 * dt;
      p.vx *= Math.pow(.98, dt * 60);
      return true;
    });
  }

  function laneFromClientX(clientX) {
    const rect = runtime.view.rect || runtime.canvas.getBoundingClientRect();
    const worldX = (clientX - rect.left - runtime.view.ox) / Math.max(.001, runtime.view.scale);
    if (worldX < BOARD_X || worldX > BOARD_X + BOARD_W) return -1;
    return clamp(Math.floor((worldX - BOARD_X) / LANE_W), 0, 3);
  }

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
        runtime.masterGain.gain.value = .22;
        runtime.masterGain.connect(runtime.audioContext.destination);
      }
      if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
      return runtime.audioContext;
    } catch (_) { return null; }
  }

  function synth(freq, duration = .09, volume = .09, type = 'sine', slideTo = 0) {
    if (!runtime.soundEnabled) return;
    const ctx = ensureAudio();
    if (!ctx || !runtime.masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.001, volume), now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain); gain.connect(runtime.masterGain);
    osc.start(now); osc.stop(now + duration + .02);
  }

  function playLaneTone(lane, strength = 1) {
    const freq = LANE_META[lane]?.freq || 330;
    synth(freq, .11, .10 * strength, 'triangle', freq * 1.02);
    synth(freq * 2, .06, .028 * strength, 'sine');
  }

  function playBeat(accent) {
    if (!runtime.soundEnabled) return;
    synth(accent ? 82 : 62, accent ? .09 : .055, accent ? .06 : .025, 'sine', 45);
  }

  function playUiTone(kind) {
    if (!runtime.soundEnabled) return;
    if (kind === 'start') { synth(330, .08, .07, 'triangle'); setTimeout(() => synth(440, .09, .07, 'triangle'), 90); }
    else if (kind === 'phase') { synth(523, .08, .06, 'triangle'); setTimeout(() => synth(659, .09, .06, 'triangle'), 70); }
    else if (kind === 'miss' || kind === 'bad') synth(130, .10, .05, 'sawtooth', 95);
    else if (kind === 'win') { synth(523, .12, .08, 'triangle'); setTimeout(() => synth(659, .12, .08, 'triangle'), 100); setTimeout(() => synth(784, .16, .08, 'triangle'), 200); }
    else if (kind === 'fail') synth(180, .22, .07, 'sawtooth', 80);
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    try { runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); } catch (_) {}
    if (runtime.soundEnabled) { ensureAudio(); playUiTone('start'); }
  }

  function renderFrame(now) {
    const ctx = runtime.ctx;
    if (!ctx || !runtime.canvas) return;
    const { dpr, scale, ox, oy, cssW, cssH } = runtime.view;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#050713';
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    drawBackdrop(ctx, now);
    drawBoard(ctx, now);
    if (runtime.state === 'countdown') drawCountdown(ctx, now);
    if (runtime.state === 'paused') drawPause(ctx);
    if (runtime.phaseBanner && ['playing', 'countdown'].includes(runtime.state)) drawPhaseBanner(ctx, now);
    drawParticles(ctx, now);
    ctx.restore();
  }

  function drawBackdrop(ctx, now) {
    const g = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    g.addColorStop(0, '#070b1d'); g.addColorStop(.55, '#090d22'); g.addColorStop(1, '#040611');
    ctx.fillStyle = g; ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.save();
    ctx.globalAlpha = .12;
    ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 1;
    const drift = (now * .015) % 40;
    for (let y = BOARD_TOP + drift; y < BOARD_BOTTOM; y += 40) { ctx.beginPath(); ctx.moveTo(BOARD_X, y); ctx.lineTo(BOARD_X + BOARD_W, y); ctx.stroke(); }
    ctx.globalAlpha = .08;
    for (let x = BOARD_X; x <= BOARD_X + BOARD_W; x += 52) { ctx.beginPath(); ctx.moveTo(x, BOARD_TOP); ctx.lineTo(x, BOARD_BOTTOM); ctx.stroke(); }
    ctx.restore();
  }

  function drawBoard(ctx, now) {
    ctx.save();
    roundRect(ctx, BOARD_X, BOARD_TOP, BOARD_W, BOARD_BOTTOM - BOARD_TOP, 28);
    ctx.fillStyle = 'rgba(7,11,29,.82)'; ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,.18)'; ctx.lineWidth = 2; ctx.stroke();

    for (let lane = 0; lane < 4; lane += 1) {
      const x = BOARD_X + lane * LANE_W;
      const meta = LANE_META[lane];
      const flash = clamp(runtime.laneFlashes[lane], 0, 1);
      ctx.fillStyle = `hsla(${meta.hue}, 82%, 58%, ${.035 + flash * .11})`;
      ctx.fillRect(x + 2, BOARD_TOP + 2, LANE_W - 4, BOARD_BOTTOM - BOARD_TOP - 4);
      if (lane > 0) { ctx.strokeStyle = 'rgba(148,163,184,.16)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, BOARD_TOP + 8); ctx.lineTo(x, BOARD_BOTTOM - 8); ctx.stroke(); }
      drawLaneLabel(ctx, lane);
    }

    const targetAlpha = .72 + runtime.targetPulse * .28;
    ctx.shadowColor = 'rgba(34,211,238,.55)'; ctx.shadowBlur = 12 + runtime.targetPulse * 12;
    ctx.strokeStyle = `rgba(103,232,249,${targetAlpha})`; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(BOARD_X + 8, TARGET_Y); ctx.lineTo(BOARD_X + BOARD_W - 8, TARGET_Y); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(207,250,254,.8)'; ctx.font = '900 12px system-ui'; ctx.textAlign = 'left'; ctx.fillText('SYNC LINE', BOARD_X + 14, TARGET_Y + 27);

    const trackMs = ['playing','result','failed','paused'].includes(runtime.state) ? nowInTrack(now) : 0;
    runtime.chart.forEach(note => drawNote(ctx, note, trackMs, now));
    drawLanePads(ctx);
    ctx.restore();
  }

  function drawLaneLabel(ctx, lane) {
    const x = BOARD_X + lane * LANE_W + LANE_W / 2;
    const meta = LANE_META[lane];
    ctx.textAlign = 'center';
    ctx.fillStyle = `hsla(${meta.hue}, 90%, 75%, .95)`;
    ctx.font = '950 17px system-ui'; ctx.fillText(meta.glyph, x, BOARD_TOP + 31);
    ctx.fillStyle = 'rgba(226,232,240,.7)'; ctx.font = '800 10px system-ui'; ctx.fillText(meta.label, x, BOARD_TOP + 50);
  }

  function noteY(note, trackMs) {
    const delta = note.targetTime - trackMs;
    const pixelsPerMs = (TARGET_Y - (BOARD_TOP + 76)) / note.travelMs;
    return TARGET_Y - delta * pixelsPerMs;
  }

  function drawNote(ctx, note, trackMs, now) {
    if (note.state === 'miss') return;
    if (note.state === 'hit' && note.holdDuration <= 0) return;
    const headY = note.state === 'holding' ? TARGET_Y : noteY(note, trackMs);
    if (headY < BOARD_TOP + 52 || headY > BOARD_BOTTOM + 90) return;
    const x = BOARD_X + note.lane * LANE_W + 14;
    const w = LANE_W - 28;
    const meta = LANE_META[note.lane];
    const held = note.state === 'holding';

    if (note.holdDuration > 0 && (note.state === 'pending' || held)) {
      const tailTime = note.targetTime + note.holdDuration;
      const tailY = TARGET_Y - (tailTime - trackMs) * ((TARGET_Y - (BOARD_TOP + 76)) / note.travelMs);
      const top = clamp(Math.min(tailY, headY), BOARD_TOP + 58, TARGET_Y);
      const bottom = clamp(Math.max(tailY, headY), BOARD_TOP + 58, TARGET_Y);
      ctx.fillStyle = `hsla(${meta.hue}, 88%, 54%, ${held ? .34 : .22})`;
      roundRect(ctx, x + w * .32, top, w * .36, Math.max(20, bottom - top), 16); ctx.fill();
      ctx.strokeStyle = `hsla(${meta.hue}, 92%, 72%, .55)`; ctx.lineWidth = 2; ctx.stroke();
    }

    const pulse = .5 + .5 * Math.sin(now * .008 + note.lane);
    ctx.save();
    ctx.shadowColor = `hsla(${meta.hue}, 90%, 58%, .55)`;
    ctx.shadowBlur = held ? 20 : 10 + pulse * 4;
    roundRect(ctx, x, headY - 31, w, 62, 17);
    const grad = ctx.createLinearGradient(x, headY - 31, x + w, headY + 31);
    grad.addColorStop(0, `hsla(${meta.hue}, 88%, 58%, .92)`);
    grad.addColorStop(1, `hsla(${meta.hue}, 80%, 38%, .94)`);
    ctx.fillStyle = grad; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.34)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#f8fafc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '950 22px system-ui'; ctx.fillText(meta.glyph, x + w / 2, headY - 4);
    ctx.font = '850 9px system-ui'; ctx.fillStyle = 'rgba(248,250,252,.82)'; ctx.fillText(note.holdDuration > 0 ? 'HOLD' : meta.label, x + w / 2, headY + 18);
    ctx.restore();
  }

  function drawLanePads(ctx) {
    for (let lane = 0; lane < 4; lane += 1) {
      const x = BOARD_X + lane * LANE_W + 10;
      const meta = LANE_META[lane];
      const active = runtime.laneSources[lane].size > 0;
      roundRect(ctx, x, TARGET_Y + 47, LANE_W - 20, 72, 17);
      ctx.fillStyle = active ? `hsla(${meta.hue}, 86%, 55%, .34)` : 'rgba(15,23,42,.8)'; ctx.fill();
      ctx.strokeStyle = active ? `hsla(${meta.hue}, 95%, 72%, .8)` : 'rgba(148,163,184,.22)'; ctx.lineWidth = active ? 3 : 2; ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = active ? '#f8fafc' : 'rgba(226,232,240,.82)'; ctx.font = '950 18px system-ui';
      ctx.fillText(LANE_META[lane].key, x + (LANE_W - 20) / 2, TARGET_Y + 77);
      ctx.font = '800 9px system-ui'; ctx.fillText(LANE_META[lane].label, x + (LANE_W - 20) / 2, TARGET_Y + 99);
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
    const age = now - runtime.phaseBanner.startedAt;
    if (age < 0 || age > 1150) return;
    const t = clamp(age / 1150, 0, 1);
    const alpha = Math.sin(Math.PI * t);
    const phase = PHASES[runtime.phaseBanner.index] || PHASES[0];
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.textAlign = 'center'; ctx.fillStyle = '#f8fafc'; ctx.font = '950 30px system-ui';
    ctx.fillText(`PHASE ${runtime.phaseBanner.index + 1}`, WORLD_W / 2, 350);
    ctx.fillStyle = '#67e8f9'; ctx.font = '900 14px system-ui'; ctx.fillText(`${phase.label} · ${phase.bpm} BPM`, WORLD_W / 2, 380);
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
    runtime.lastRewardXp = clamp(Number(record.lastRewardXp || 0), 0, 3);
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.open = true;
    runtime.state = 'ready';
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
