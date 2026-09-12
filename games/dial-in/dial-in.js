(() => {
  'use strict';

  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }

  const GAME_ID = 'dial-in';
  const GLOBAL_NAME = 'ICT8DialIn';
  const MODES = Object.freeze({
    color: { icon: '🎨', label: 'COLOR', short: 'Match what you saw.', tutorial: 'Memorize the color. Recreate it after it disappears.' },
    sound: { icon: '🔊', label: 'SOUND', short: 'Match what you heard.', tutorial: 'Remember the tone. Match its pitch.' },
    time:  { icon: '⏱', label: 'TIME',  short: 'Hold to match the timing.', tutorial: 'Watch the timing. Then press and hold to match it as closely as you can.' }
  });
  const ROUND_COUNT = 5;
  const COLOR_VIEW_MS = [4000, 3500, 3000, 2500, 2000];
  const SOUND_DURATION_MS = [1600, 1500, 1450, 1375, 1300];
  const SOUND_MAX_HZ = [640, 720, 820, 920, 1000];
  const SOUND_MIN_HZ = 220;
  const TUTORIAL_KEY_PREFIX = 'ict8_dial_in_tutorial_v1_';

  const runtime = {
    built: false,
    open: false,
    bridge: null,
    music: null,
    onBack: null,
    onClose: null,
    onReward: null,
    overlay: null,
    main: null,
    soundBtn: null,
    mode: '',
    stage: 'home',
    roundIndex: 0,
    roundResults: [],
    round: null,
    challenges: [],
    sessionStartedAt: 0,
    sessionXp: 0,
    latestScore: 0,
    latestMode: '',
    gameRecord: {},
    soundEnabled: true,
    colorGuess: { h: 180, s: 60, l: 50 },
    soundSlider: 500,
    soundReplayUsed: false,
    timeStartedAt: 0,
    timePausedMs: 0,
    timePauseStartedAt: 0,
    timeRaf: 0,
    timeHoldPointerId: null,
    timeKeyboardHolding: false,
    paused: false,
    visibilityPaused: false,
    pauseReason: '',
    taskSeq: 0,
    tasks: new Map(),
    audioCtx: null,
    activeAudioNodes: new Set(),
    previewCooldownUntil: 0,
    liveToneOsc: null,
    liveToneGain: null,
    liveToneActive: false,
    soundTargetToken: 0,
    autoAdvanceTask: null,
    dragKind: '',
    dragKey: '',
    dragPointerId: null,
    confettiTimer: 0,
    unsub: null
  };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function round1(value) { return Math.round((Number(value) || 0) * 10) / 10; }
  function pct(value) { return `${round1(value).toFixed(1)}%`; }
  function modeMeta(mode = runtime.mode) { return MODES[mode] || MODES.color; }
  function currentChallenge() { return runtime.challenges[runtime.roundIndex] || null; }
  function soundOn() { return runtime.bridge?.getSnapshot?.()?.soundEnabled !== false && runtime.soundEnabled !== false; }

  function hash32(value = '') {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < String(value).length; i += 1) {
      h ^= String(value).charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function seededUnit(seed = '') {
    let x = hash32(seed) || 0x9e3779b9;
    x += 0x6D2B79F5;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }

  function makeChallenges(mode, sessionId) {
    return Array.from({ length: ROUND_COUNT }, (_, index) => {
      const a = seededUnit(`${sessionId}:${mode}:${index}:a`);
      const b = seededUnit(`${sessionId}:${mode}:${index}:b`);
      const c = seededUnit(`${sessionId}:${mode}:${index}:c`);
      if (mode === 'color') {
        return {
          h: Math.round(a * 359),
          s: Math.round(46 + b * 46),
          l: Math.round(30 + c * 40),
          viewMs: COLOR_VIEW_MS[index]
        };
      }
      if (mode === 'sound') {
        const maxHz = SOUND_MAX_HZ[index];
        const ratio = maxHz / SOUND_MIN_HZ;
        return {
          hz: Math.round(SOUND_MIN_HZ * Math.pow(ratio, a)),
          minHz: SOUND_MIN_HZ,
          maxHz,
          durationMs: SOUND_DURATION_MS[index],
          replayAllowed: index === 0
        };
      }
      const ranges = [[2800, 3400], [3800, 4600], [4800, 5800], [6500, 8000], [8500, 10500]];
      const range = ranges[index];
      const raw = range[0] + a * (range[1] - range[0]);
      return { targetMs: Math.round(raw / 50) * 50 };
    });
  }

  function clearTask(task) {
    if (!task) return;
    if (task.timer) clearTimeout(task.timer);
    task.timer = 0;
    runtime.tasks.delete(task.id);
  }

  function clearTasks() {
    runtime.tasks.forEach(task => { if (task.timer) clearTimeout(task.timer); });
    runtime.tasks.clear();
    runtime.autoAdvanceTask = null;
  }

  function armTask(task) {
    if (!task || runtime.paused || runtime.visibilityPaused) return;
    task.startedAt = performance.now();
    task.timer = setTimeout(() => {
      task.timer = 0;
      runtime.tasks.delete(task.id);
      if (runtime.paused || runtime.visibilityPaused) {
        task.remaining = Math.max(0, task.remaining);
        runtime.tasks.set(task.id, task);
        return;
      }
      try { task.fn(); } catch (error) { console.warn('DIAL IN task failed.', error); }
    }, Math.max(0, task.remaining));
  }

  function schedule(fn, ms) {
    const task = { id: ++runtime.taskSeq, fn, remaining: Math.max(0, Number(ms) || 0), startedAt: performance.now(), timer: 0 };
    runtime.tasks.set(task.id, task);
    armTask(task);
    return task;
  }

  function pauseTasks() {
    const now = performance.now();
    runtime.tasks.forEach(task => {
      if (!task.timer) return;
      clearTimeout(task.timer);
      task.timer = 0;
      task.remaining = Math.max(0, task.remaining - (now - task.startedAt));
    });
  }

  function resumeTasks() {
    runtime.tasks.forEach(task => { if (!task.timer) armTask(task); });
  }

  function ensureAudio() {
    if (!soundOn()) return null;
    if (!runtime.audioCtx) {
      try { runtime.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { runtime.audioCtx = null; }
    }
    if (runtime.audioCtx?.state === 'suspended') runtime.audioCtx.resume().catch(() => {});
    return runtime.audioCtx;
  }

  function rememberNode(node) {
    runtime.activeAudioNodes.add(node);
    try { node.addEventListener?.('ended', () => runtime.activeAudioNodes.delete(node), { once: true }); } catch (_) {}
    return node;
  }

  function stopTransientAudio() {
    stopLiveTone(true);
    runtime.activeAudioNodes.forEach(node => {
      try { node.stop?.(); } catch (_) {}
      try { node.disconnect?.(); } catch (_) {}
    });
    runtime.activeAudioNodes.clear();
  }

  function tone(freq = 440, duration = .12, volume = .08, type = 'sine', endFreq = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = rememberNode(ctx.createOscillator());
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(40, freq), now);
    if (endFreq > 0) osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + Math.max(.03, duration));
    const peak = __ict8SfxGain(volume);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + Math.max(.04, duration));
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + Math.max(.06, duration) + .025);
  }

  function sfx(kind) {
    if (!soundOn()) return;
    const table = {
      mode: [510, .09, .08, 'triangle', 720],
      round: [420, .08, .065, 'sine', 610],
      vanish: [660, .10, .055, 'triangle', 390],
      lock: [540, .09, .085, 'triangle', 820],
      high: [760, .18, .11, 'sine', 1180],
      average: [470, .13, .085, 'triangle', 610],
      best: [690, .24, .11, 'sine', 1320],
      xp: [820, .24, .12, 'triangle', 1480],
      start: [380, .08, .08, 'triangle', 590],
      stop: [620, .10, .10, 'square', 410],
      tick: [380, .035, .025, 'sine', 0]
    };
    const spec = table[kind] || table.mode;
    tone(...spec);
    if (kind === 'best' || kind === 'xp') schedule(() => tone(kind === 'xp' ? 1040 : 900, .18, .09, 'sine', 1500), 75);
  }

  function playToneFrequency(freq, durationMs, volume = .09) {
    const ctx = ensureAudio();
    if (!ctx) return Promise.resolve(false);
    const now = ctx.currentTime;
    const osc = rememberNode(ctx.createOscillator());
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(clamp(freq, 100, 1600), now);
    const duration = Math.max(.12, Number(durationMs || 1000) / 1000);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.linearRampToValueAtTime(__ict8SfxGain(volume), now + .025);
    gain.gain.setValueAtTime(__ict8SfxGain(volume), now + Math.max(.03, duration - .045));
    gain.gain.linearRampToValueAtTime(.0001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + .02);
    return new Promise(resolve => schedule(() => resolve(true), duration * 1000 + 30));
  }

  function stopLiveTone(immediate = false) {
    const osc = runtime.liveToneOsc;
    const gain = runtime.liveToneGain;
    runtime.liveToneOsc = null;
    runtime.liveToneGain = null;
    runtime.liveToneActive = false;
    if (!osc) return;
    try {
      const ctx = runtime.audioCtx;
      const now = ctx?.currentTime || 0;
      if (gain && ctx && !immediate) {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(.0001, gain.gain.value || .0001), now);
        gain.gain.exponentialRampToValueAtTime(.0001, now + .035);
        osc.stop(now + .045);
      } else {
        osc.stop();
      }
    } catch (_) {
      try { osc.stop(); } catch (_) {}
    }
    try { osc.disconnect?.(); } catch (_) {}
    try { gain?.disconnect?.(); } catch (_) {}
  }

  function startLiveTone() {
    if (!soundOn() || runtime.stage !== 'sound-guess') return false;
    const ctx = ensureAudio();
    if (!ctx) return false;
    stopLiveTone(true);
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(clamp(selectedFrequency(), 100, 1600), now);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, __ict8SfxGain(.055)), now + .018);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    runtime.liveToneOsc = osc;
    runtime.liveToneGain = gain;
    runtime.liveToneActive = true;
    return true;
  }

  function updateLiveTone() {
    if (!runtime.liveToneActive || !runtime.liveToneOsc || !runtime.audioCtx) return;
    try {
      const now = runtime.audioCtx.currentTime;
      const hz = clamp(selectedFrequency(), 100, 1600);
      runtime.liveToneOsc.frequency.cancelScheduledValues(now);
      runtime.liveToneOsc.frequency.setTargetAtTime(hz, now, .018);
    } catch (_) {}
  }


  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
  }

  function formatBest(value) {
    const n = Number(value || 0);
    return n > 0 ? `${n.toFixed(1)}%` : '—';
  }

  function snapshotRecord() {
    const snap = runtime.bridge?.getSnapshot?.() || {};
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.gameRecord = snap.gameRecords?.dialIn || runtime.gameRecord || {};
    if (!runtime.latestScore && runtime.gameRecord.latestAccuracy > 0) {
      runtime.latestScore = Number(runtime.gameRecord.latestAccuracy || 0);
      runtime.latestMode = String(runtime.gameRecord.latestMode || '');
    }
    updateSoundButton();
    return runtime.gameRecord;
  }

  function updateSoundButton() {
    if (!runtime.soundBtn) return;
    const enabled = soundOn();
    runtime.soundBtn.textContent = enabled ? '🔊' : '🔇';
    runtime.soundBtn.setAttribute('aria-label', enabled ? 'Mute game sound' : 'Turn on game sound');
  }

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.className = 'dial-in-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="dial-in-shell">
        <div class="dial-in-utility-bar">
          <button type="button" class="dial-in-icon-btn" data-dial-back aria-label="Back">←</button>
          <button type="button" class="dial-in-icon-btn" data-dial-sound aria-label="Toggle sound">🔊</button>
          <button type="button" class="dial-in-icon-btn" data-dial-close aria-label="Close">×</button>
        </div>
        <main class="dial-in-main" data-dial-main></main>
        <div class="dial-in-pause" data-dial-pause hidden>
          <div><span>⏸</span><strong>PAUSED</strong><p>Your current round is safe.</p><button type="button" data-dial-resume>CONTINUE</button></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    runtime.overlay = overlay;
    runtime.main = overlay.querySelector('[data-dial-main]');
    runtime.soundBtn = overlay.querySelector('[data-dial-sound]');

    overlay.addEventListener('click', handleClick);
    overlay.addEventListener('input', handleInput);
    overlay.addEventListener('change', handleChange);
    overlay.addEventListener('pointerdown', handlePointerDown);
    overlay.addEventListener('pointermove', handlePointerMove);
    overlay.addEventListener('pointerup', handlePointerUp);
    overlay.addEventListener('pointercancel', handlePointerUp);
    overlay.addEventListener('keydown', handleKeyDown);
    overlay.addEventListener('keyup', handleKeyUp);
    overlay.addEventListener('wheel', handleWheel, { passive: false });
    overlay.addEventListener('contextmenu', event => {
      if (event.target.closest('[data-dial-color-control],[data-dial-sound-pad],[data-dial-time-hold]')) event.preventDefault();
    });
    runtime.built = true;
  }


  function uiStageMeta(mode = runtime.mode, caption = '') {
    const roundText = runtime.mode ? `${runtime.roundIndex + 1} / ${ROUND_COUNT}` : 'DIAL IN';
    return `<div class="dial-in-stage-meta"><span class="dial-in-stage-step">${roundText}</span>${caption ? `<small class="dial-in-stage-caption-top">${caption}</small>` : ''}</div>`;
  }

  function homeHtml() {
    const record = snapshotRecord();
    const latest = runtime.latestScore || Number(record.latestAccuracy || 0);
    const latestMode = runtime.latestMode || String(record.latestMode || '');
    const overall = Math.max(Number(record.bestColorAccuracy || 0), Number(record.bestSoundAccuracy || 0), Number(record.bestTimeAccuracy || 0));
    return `
      <section class="dial-in-home dial-in-home-card dial-in-screen-enter">
        <div class="dial-in-home-hero">
          <p class="dial-in-kicker">PRECISION ARCADE</p>
          <h1>DIAL IN</h1>
          <p>Pick a mode. Lock in. Chase a sharper average.</p>
        </div>
        <div class="dial-in-home-stats">
          <div><small>BEST</small><strong>${formatBest(overall)}</strong></div>
          <div><small>LATEST ${latestMode ? `· ${String(latestMode).toUpperCase()}` : ''}</small><strong>${formatBest(latest)}</strong></div>
          <div><small>SESSION XP</small><strong>+${Math.max(0, runtime.sessionXp)}</strong></div>
        </div>
        <div class="dial-in-mode-grid">
          ${Object.entries(MODES).map(([id, meta]) => {
            const key = id === 'color' ? 'bestColorAccuracy' : id === 'sound' ? 'bestSoundAccuracy' : 'bestTimeAccuracy';
            return `<button type="button" class="dial-in-mode-card dial-in-mode-${id}" data-dial-mode="${id}">
              <span class="dial-in-mode-icon">${meta.icon}</span>
              <span class="dial-in-mode-copy"><strong>${meta.label}</strong><small>${meta.short}</small></span>
              <span class="dial-in-mode-best">BEST ${formatBest(Number(record[key] || 0))}</span>
            </button>`;
          }).join('')}
        </div>
      </section>`;
  }

  function tutorialHtml(mode) {
    const meta = modeMeta(mode);
    const copy = mode === 'color'
      ? 'Memorize the color, then drag the three vertical dials to rebuild it.'
      : mode === 'sound'
        ? 'Listen once, then drag up or down on the waveform to tune your pitch.'
        : 'Remember the target time. Start, trust your internal clock, then stop.';
    return `<section class="dial-in-tutorial dial-in-card dial-in-screen-enter dial-in-card-${mode}">
      ${uiStageMeta(mode, `${meta.label} MODE`)}
      <div class="dial-in-tutorial-body">
        <div class="dial-in-tutorial-icon">${meta.icon}</div>
        <h2>${meta.tutorial}</h2>
        <p>${copy}</p>
        <div class="dial-in-actions"><button type="button" class="dial-in-primary" data-dial-tutorial-start>START</button><button type="button" class="dial-in-secondary" data-dial-tutorial-skip>SKIP</button></div>
      </div>
    </section>`;
  }

  function transitionHtml() {
    const meta = modeMeta();
    return `<section class="dial-in-round-transition dial-in-card dial-in-screen-enter dial-in-card-${runtime.mode}">
      ${uiStageMeta(runtime.mode, `${meta.label} MODE`)}
      <div class="dial-in-transition-center"><span>${meta.icon}</span><strong>ROUND ${runtime.roundIndex + 1}</strong><small>Get ready.</small></div>
    </section>`;
  }

  function colorTargetHtml(challenge) {
    return `<section class="dial-in-play dial-in-card dial-in-screen-enter dial-in-card-color-target">
      ${uiStageMeta('color')}
      <div class="dial-in-color-full" style="background:hsl(${challenge.h} ${challenge.s}% ${challenge.l}%);"><p>remember the color</p></div>
      <div class="dial-in-memory-bar"><i style="--memory-ms:${challenge.viewMs}ms"></i></div>
    </section>`;
  }

  function colorPercent(key, value) {
    const max = key === 'h' ? 360 : 100;
    return clamp(Number(value || 0) / max, 0, 1) * 100;
  }

  function colorControlHtml(label, key, value, trackStyle) {
    const max = key === 'h' ? 360 : 100;
    const p = colorPercent(key, value);
    return `<div class="dial-in-color-control" data-dial-color-control="${key}" data-min="0" data-max="${max}" role="slider" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${Math.round(value)}">
      <div class="dial-in-color-track" data-dial-color-track="${key}" style="${trackStyle}"><i class="dial-in-color-thumb" style="bottom:${p}%"></i></div>
      <small>${label}</small>
    </div>`;
  }

  function colorTrackStyles(g = runtime.colorGuess) {
    return {
      h: 'background:linear-gradient(to top,#ff2d55 0%,#ff9500 16%,#ffe600 28%,#25d366 44%,#00d9ff 59%,#3157ff 73%,#9b32ff 86%,#ff2d8d 100%)',
      s: `background:linear-gradient(to top,hsl(${g.h} 0% ${g.l}%),hsl(${g.h} 100% ${g.l}%))`,
      l: `background:linear-gradient(to top,#050505 0%,hsl(${g.h} ${g.s}% 50%) 50%,#ffffff 100%)`
    };
  }

  function colorGuessHtml() {
    const g = runtime.colorGuess;
    const tracks = colorTrackStyles(g);
    return `<section class="dial-in-play dial-in-card dial-in-screen-enter dial-in-card-color-guess">
      ${uiStageMeta('color')}
      <div class="dial-in-color-layout">
        <div class="dial-in-color-controls">
          ${colorControlHtml('HUE', 'h', g.h, tracks.h)}
          ${colorControlHtml('SAT', 's', g.s, tracks.s)}
          ${colorControlHtml('LIGHT', 'l', g.l, tracks.l)}
        </div>
        <div class="dial-in-color-field" data-dial-color-preview style="background:hsl(${g.h} ${g.s}% ${g.l}%);"></div>
      </div>
      <div class="dial-in-color-values">H${Math.round(g.h)} S${Math.round(g.s)} L${Math.round(g.l)}</div>
      <button type="button" class="dial-in-fab" data-dial-lock aria-label="Lock in">→</button>
    </section>`;
  }

  function soundLevelForHz(hz, challenge = currentChallenge()) {
    if (!challenge) return .5;
    const minHz = Math.max(1, Number(challenge.minHz || SOUND_MIN_HZ));
    const maxHz = Math.max(minHz + 1, Number(challenge.maxHz || 1000));
    return clamp(Math.log(Math.max(minHz, Number(hz || minHz)) / minHz) / Math.log(maxHz / minHz), 0, 1);
  }

  function makeWavePath(level, band = 0) {
    const points = 48;
    const cycles = 1.25 + level * 4.4;
    const amp = 3.1 + band * 2.15;
    const phase = band * .37;
    const out = [];
    for (let i = 0; i <= points; i += 1) {
      const t = i / points;
      const envelope = .18 + .82 * Math.pow(Math.sin(Math.PI * t), .72);
      const wobble = Math.sin(t * Math.PI * 2 * cycles + phase) + .28 * Math.sin(t * Math.PI * 2 * (cycles * .48) - phase * .7);
      const x = 50 + wobble * amp * envelope;
      const y = t * 100;
      out.push(`${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return out.join(' ');
  }

  function soundWaveHtml(level, state = 'guess') {
    const paths = Array.from({ length: 11 }, (_, index) => `<path data-dial-wave="${index}" d="${makeWavePath(level, index)}" style="--i:${index}"></path>`).join('');
    return `<div class="dial-in-sound-visual ${state}" data-dial-sound-visual style="--tone:${level.toFixed(3)}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${paths}</svg><i class="dial-in-sound-spine"></i></div>`;
  }

  function soundTargetHtml(challenge) {
    const level = soundLevelForHz(challenge.hz, challenge);
    return `<section class="dial-in-play dial-in-card dial-in-screen-enter dial-in-card-sound">
      ${uiStageMeta('sound')}
      <div class="dial-in-sound-pad is-listening" data-dial-sound-pad style="--dial-y:${(100 - level * 70 - 15).toFixed(1)}%">
        ${soundWaveHtml(level, 'listening')}
        <div class="dial-in-sound-listen-copy"><strong>LISTEN</strong><p>${soundOn() ? 'remember the tone' : 'turn on sound to play'}</p></div>
      </div>
    </section>`;
  }

  function selectedFrequency() {
    const challenge = currentChallenge();
    if (!challenge) return 440;
    const t = clamp(runtime.soundSlider, 0, 1000) / 1000;
    return challenge.minHz * Math.pow(challenge.maxHz / challenge.minHz, t);
  }

  function selectedFrequencyLabel() {
    return `${selectedFrequency().toFixed(2)}<span>Hz</span>`;
  }

  function soundGuessHtml() {
    const ch = currentChallenge();
    const level = clamp(runtime.soundSlider / 1000, 0, 1);
    return `<section class="dial-in-play dial-in-card dial-in-screen-enter dial-in-card-sound">
      ${uiStageMeta('sound')}
      <div class="dial-in-sound-pad is-guessing" data-dial-sound-pad style="--dial-y:${(100 - level * 70 - 15).toFixed(1)}%">
        ${soundWaveHtml(level, 'guess')}
        <div class="dial-in-sound-drag-guide"><span>HIGH</span><i></i><span>LOW</span></div>
        <div class="dial-in-sound-bottom">
          <div class="dial-in-sound-number" data-dial-frequency-number>${selectedFrequencyLabel()}</div>
          <small class="dial-in-sound-instruction">Drag up/down to tune · sound plays live</small>
          <div class="dial-in-sound-pills"><button type="button" data-dial-preview>▶ PREVIEW</button>${ch?.replayAllowed && !runtime.soundReplayUsed ? '<button type="button" data-dial-replay>↻ TARGET · 1</button>' : ''}</div>
        </div>
      </div>
      <button type="button" class="dial-in-fab" data-dial-lock aria-label="Lock in">→</button>
    </section>`;
  }

  function flavorForAccuracy(accuracy) {
    const a = Number(accuracy || 0);
    if (a >= 98) return 'That was disturbingly accurate.';
    if (a >= 95) return 'Nearly unfair.';
    if (a >= 90) return 'Locked in like a machine.';
    if (a >= 80) return 'Sharp memory. Nice dial-in.';
    if (a >= 70) return 'Pretty close.';
    if (a >= 60) return 'Not bad, not brilliant.';
    if (a >= 45) return 'Right in the middle.';
    return 'A beautiful miss. Try again.';
  }

  function scoreDisplay(value) { return round1(value).toFixed(1); }

  function resultShellHtml(result, inner, extraClass = '') {
    return `<section class="dial-in-result dial-in-card dial-in-screen-enter dial-in-card-result ${extraClass}">
      ${inner}
      <div class="dial-in-result-overlay">${uiStageMeta(runtime.mode)}<div class="dial-in-result-scorebox"><strong>${scoreDisplay(result.accuracy)}</strong><small>Accuracy</small><p>${flavorForAccuracy(result.accuracy)}</p></div></div>
      <button type="button" class="dial-in-fab" data-dial-next aria-label="${runtime.roundIndex >= 4 ? 'See results' : 'Next round'}">→</button>
    </section>`;
  }

  function colorResultHtml(result) {
    return resultShellHtml(result, `<div class="dial-in-color-result-split"><div class="dial-in-color-result-pane guess" style="background:hsl(${result.guess.h} ${result.guess.s}% ${result.guess.l}%);"><div><small>Your selection</small><strong>H${result.guess.h} S${result.guess.s} L${result.guess.l}</strong></div></div><div class="dial-in-color-result-pane target" style="background:hsl(${result.target.h} ${result.target.s}% ${result.target.l}%);"><div><small>Original</small><strong>H${result.target.h} S${result.target.s} L${result.target.l}</strong></div></div></div>`, 'dial-in-color-result-card');
  }

  function soundResultHtml(result) {
    return resultShellHtml(result, `<div class="dial-in-metric-stage dial-in-metric-stage-sound">${soundWaveHtml(soundLevelForHz(result.targetHz), 'result')}<div class="dial-in-metric-compare sound-grid"><div><small>TARGET</small><strong>${Math.round(result.targetHz)} Hz</strong></div><div><small>YOUR GUESS</small><strong>${Math.round(result.guessHz)} Hz</strong></div><div><small>DIFFERENCE</small><strong>${Math.round(result.diffHz)} Hz</strong></div></div></div>`);
  }

  function makeTimeRingPath(radius, index) {
    const cx = 300;
    const cy = 300;
    const phase = index * 0.57;
    const pts = [];
    for (let deg = 0; deg <= 360; deg += 4) {
      const a = deg * Math.PI / 180;
      const wobble = 1
        + 0.052 * Math.sin(a * 2 + phase)
        + 0.032 * Math.sin(a * 4 - phase * .8)
        + 0.018 * Math.cos(a * 6 + phase * 1.3);
      const skewX = 1 + 0.065 * Math.sin(a + phase);
      const skewY = 1 - 0.052 * Math.cos(a - phase * .7);
      const x = cx + Math.cos(a) * radius * wobble * skewX;
      const y = cy + Math.sin(a) * radius * wobble * skewY;
      pts.push(`${deg === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return `${pts.join(' ')} Z`;
  }

  function timeRingsHtml(state = 'preview') {
    const rings = Array.from({ length: 11 }, (_, index) => {
      const radius = 24 + index * 23.2;
      return `<path class="dial-in-time-ring ring-${index + 1}" d="${makeTimeRingPath(radius, index)}" style="--ring:${index};--ring-delay:${(-index * .16).toFixed(2)}s"></path>`;
    }).join('');
    return `<div class="dial-in-time-rings is-${state}" data-dial-time-rings aria-hidden="true"><svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="dialTimeGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#77c7ff"></stop><stop offset=".48" stop-color="#89a8ff"></stop><stop offset="1" stop-color="#d394ff"></stop></linearGradient></defs><g>${rings}</g></svg></div>`;
  }

  function timeReadyHtml(challenge) {
    const showNumber = runtime.roundIndex <= 1;
    return `<section class="dial-in-play dial-in-card dial-in-screen-enter dial-in-card-time-preview">
      ${uiStageMeta('time')}
      ${timeRingsHtml('preview')}
      <div class="dial-in-time-preview-copy">
        ${showNumber ? `<strong>${(challenge.targetMs / 1000).toFixed(2)}<span>s</span></strong>` : '<strong class="text-only">remember the timing</strong>'}
        ${showNumber ? '<small>remember this duration</small>' : '<small>watch how long the rings stay alive</small>'}
      </div>
    </section>`;
  }

  function timeWaitingHtml() {
    return `<section class="dial-in-play dial-in-card dial-in-screen-enter dial-in-card-time-waiting" data-dial-time-hold tabindex="0" role="button" aria-label="Press and hold to match the timing">
      ${uiStageMeta('time')}
      <div class="dial-in-time-wait-copy"><strong>your turn</strong><small>press & hold to match</small></div>
      <div class="dial-in-time-hold-hint"><i></i><span>HOLD ANYWHERE</span></div>
    </section>`;
  }

  function timeRunningHtml() {
    return `<section class="dial-in-play dial-in-card dial-in-screen-enter dial-in-card-time-holding" data-dial-time-hold tabindex="0" role="button" aria-label="Release to stop">
      ${uiStageMeta('time')}
      ${timeRingsHtml('holding')}
      <div class="dial-in-time-holding-copy"><strong data-dial-time-number>0.00<span>s</span></strong><small>release when it feels right</small></div>
    </section>`;
  }

  function timeResultFlavor(diffMs) {
    const d = Math.abs(Number(diffMs || 0));
    if (d <= 50) return 'Basically psychic.';
    if (d <= 120) return 'Your internal clock is scary good.';
    if (d <= 250) return 'That was seriously close.';
    if (d <= 500) return 'Pretty close.';
    if (d <= 1000) return 'Close enough to make it interesting.';
    if (d <= 2000) return 'Your internal clock took the scenic route.';
    return 'Your internal clock filed a missing persons report.';
  }

  function timeResultHtml(result) {
    const sign = result.deltaMs >= 0 ? '+' : '−';
    const off = Math.abs(result.deltaMs) / 1000;
    return `<section class="dial-in-result dial-in-card dial-in-screen-enter dial-in-time-result-card">
      ${uiStageMeta('time')}
      ${timeRingsHtml('result')}
      <div class="dial-in-time-result-score"><strong>${off.toFixed(2)}<span>s</span></strong><p>${timeResultFlavor(result.deltaMs)}</p></div>
      <div class="dial-in-time-result-values"><div><small>TARGET</small><strong>${(result.targetMs / 1000).toFixed(2)}<span> sec</span></strong></div><div><small>YOU</small><strong>${(result.actualMs / 1000).toFixed(2)}<span> sec</span></strong></div><div><small>OFF BY</small><strong>${sign}${off.toFixed(2)}<span> sec</span></strong></div></div>
      <button type="button" class="dial-in-fab" data-dial-next aria-label="${runtime.roundIndex >= 4 ? 'See results' : 'Next round'}">→</button>
    </section>`;
  }

  function finalHtml() {
    const values = runtime.roundResults.map(r => Number(r.accuracy || 0));
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const best = values.length ? Math.max(...values) : 0;
    const meta = modeMeta();
    return `<section class="dial-in-final dial-in-card dial-in-screen-enter dial-in-card-final dial-in-card-${runtime.mode}">
      ${uiStageMeta(runtime.mode, `${meta.label} COMPLETE`)}
      <div class="dial-in-final-center"><p class="dial-in-kicker">AVERAGE ACCURACY</p><strong class="dial-in-final-score">${scoreDisplay(avg)}</strong><p class="dial-in-final-line">${flavorForAccuracy(avg)}</p></div>
      <div class="dial-in-final-stats"><div><small>BEST ROUND</small><strong>${scoreDisplay(best)}</strong></div><div><small>ROUNDS</small><strong>${runtime.roundResults.length}/${ROUND_COUNT}</strong></div><div><small>XP</small><strong data-dial-final-xp>…</strong></div></div>
      <p class="dial-in-reward-note" data-dial-reward-note>Submitting this completed 5-round session…</p>
      <div class="dial-in-final-actions"><button type="button" class="dial-in-primary" data-dial-play-again>PLAY AGAIN</button><button type="button" class="dial-in-secondary" data-dial-change-mode>CHANGE MODE</button><button type="button" class="dial-in-secondary" data-dial-hub>BACK TO ARCADE</button></div>
    </section>`;
  }

  function render() {
    if (!runtime.main) return;
    let html = '';
    if (runtime.stage === 'home') html = homeHtml();
    else if (runtime.stage === 'tutorial') html = tutorialHtml(runtime.mode);
    else if (runtime.stage === 'transition') html = transitionHtml();
    else if (runtime.stage === 'color-target') html = colorTargetHtml(currentChallenge());
    else if (runtime.stage === 'color-guess') html = colorGuessHtml();
    else if (runtime.stage === 'color-result') html = colorResultHtml(runtime.roundResults[runtime.roundResults.length - 1]);
    else if (runtime.stage === 'sound-target') html = soundTargetHtml(currentChallenge());
    else if (runtime.stage === 'sound-guess') html = soundGuessHtml();
    else if (runtime.stage === 'sound-result') html = soundResultHtml(runtime.roundResults[runtime.roundResults.length - 1]);
    else if (runtime.stage === 'time-ready') html = timeReadyHtml(currentChallenge());
    else if (runtime.stage === 'time-waiting') html = timeWaitingHtml();
    else if (runtime.stage === 'time-running') html = timeRunningHtml();
    else if (runtime.stage === 'time-result') html = timeResultHtml(runtime.roundResults[runtime.roundResults.length - 1]);
    else if (runtime.stage === 'final') html = finalHtml();
    runtime.main.innerHTML = html;
    runtime.main.dataset.stage = runtime.stage;
    runtime.main.dataset.mode = runtime.mode || '';
    if (runtime.overlay) {
      runtime.overlay.dataset.stage = runtime.stage;
      runtime.overlay.dataset.mode = runtime.mode || '';
      runtime.overlay.dataset.view = /^(home|tutorial)$/.test(runtime.stage) ? 'menu' : 'immersive';
    }
    if (runtime.stage === 'time-running') startTimeRaf();
  }

  function ratingFor(accuracy) {
    const a = Number(accuracy || 0);
    if (a >= 98) return 'EXCEPTIONAL';
    if (a >= 95) return 'EXCELLENT';
    if (a >= 90) return 'GREAT';
    if (a >= 80) return 'GOOD';
    if (a >= 70) return 'CLOSE';
    return 'KEEP DIALING';
  }

  function tutorialSeen(mode) {
    try { return localStorage.getItem(`${TUTORIAL_KEY_PREFIX}${mode}`) === '1'; } catch (_) { return false; }
  }
  function markTutorialSeen(mode) {
    try { localStorage.setItem(`${TUTORIAL_KEY_PREFIX}${mode}`, '1'); } catch (_) {}
  }

  function showHome() {
    abandonSession();
    runtime.stage = 'home';
    runtime.mode = '';
    snapshotRecord();
    render();
  }

  function selectMode(mode) {
    if (!MODES[mode]) return;
    if (mode === 'sound' && !soundOn()) {
      runtime.mode = mode;
      runtime.stage = 'tutorial';
      render();
      const h = runtime.main.querySelector('h2');
      if (h) h.insertAdjacentHTML('afterend', '<p class="dial-in-audio-warning">Sound is muted. Tap 🔇 in the header before starting SOUND mode.</p>');
      sfx('mode');
      return;
    }
    runtime.mode = mode;
    sfx('mode');
    if (!tutorialSeen(mode)) {
      runtime.stage = 'tutorial';
      render();
    } else {
      startSession(mode);
    }
  }

  function startSession(mode) {
    if (!MODES[mode]) return;
    if (mode === 'sound' && !soundOn()) {
      runtime.mode = mode;
      runtime.stage = 'tutorial';
      render();
      const h = runtime.main.querySelector('h2');
      if (h) h.insertAdjacentHTML('afterend', '<p class="dial-in-audio-warning">Turn sound on with the 🔇 button to play this mode.</p>');
      return;
    }
    abandonSession();
    runtime.mode = mode;
    runtime.roundIndex = 0;
    runtime.roundResults = [];
    runtime.soundReplayUsed = false;
    runtime.colorGuess = { h: 180, s: 60, l: 50 };
    runtime.soundSlider = 500;
    runtime.sessionStartedAt = performance.now();
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    const seed = runtime.round?.sessionId || `${Date.now()}-${Math.random()}`;
    runtime.challenges = makeChallenges(mode, seed);
    transitionToRound();
  }

  function abandonSession() {
    clearTasks();
    stopTimeRaf();
    stopTransientAudio();
    if (runtime.round?.sessionId) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.round = null;
    runtime.challenges = [];
    runtime.roundResults = [];
    runtime.roundIndex = 0;
    runtime.timeStartedAt = 0;
    runtime.timePausedMs = 0;
    runtime.dragKind = '';
    runtime.dragKey = '';
    runtime.dragPointerId = null;
    runtime.paused = false;
    hidePause();
  }

  function transitionToRound() {
    clearTasks();
    runtime.stage = 'transition';
    runtime.soundReplayUsed = false;
    if (runtime.mode === 'color') runtime.colorGuess = { h: 180, s: 60, l: 50 };
    if (runtime.mode === 'sound') runtime.soundSlider = 500;
    render();
    sfx('round');
    schedule(beginCurrentRound, 720);
  }

  function beginCurrentRound() {
    const ch = currentChallenge();
    if (!ch) return finishSession();
    if (runtime.mode === 'color') {
      runtime.stage = 'color-target';
      render();
      schedule(() => {
        runtime.stage = 'color-guess';
        render();
        sfx('vanish');
      }, ch.viewMs);
      return;
    }
    if (runtime.mode === 'sound') {
      runtime.stage = 'sound-target';
      render();
      playSoundTarget();
      return;
    }
    runtime.stage = 'time-ready';
    render();
    schedule(() => {
      if (!runtime.open || runtime.paused || runtime.visibilityPaused || runtime.stage !== 'time-ready') return;
      runtime.stage = 'time-waiting';
      render();
      sfx('vanish');
    }, ch.targetMs);
  }

  function playSoundTarget() {
    const ch = currentChallenge();
    if (!ch || runtime.stage !== 'sound-target') return;
    if (!soundOn()) {
      schedule(() => { runtime.stage = 'sound-guess'; render(); }, 600);
      return;
    }
    stopTransientAudio();
    playToneFrequency(ch.hz, ch.durationMs, .11).catch?.(() => {});
    schedule(() => {
      if (!runtime.open || runtime.paused || runtime.visibilityPaused || runtime.stage !== 'sound-target') return;
      runtime.stage = 'sound-guess';
      render();
    }, ch.durationMs + 230);
  }

  function hslToRgb(h, s, l) {
    h = ((Number(h) % 360) + 360) % 360 / 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    if (s === 0) return [l, l, l];
    const q = l < .5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue = t => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
  }

  function rgbToLab(rgb) {
    let [r, g, b] = rgb.map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
    let x = (r * .4124 + g * .3576 + b * .1805) / .95047;
    let y = (r * .2126 + g * .7152 + b * .0722) / 1.00000;
    let z = (r * .0193 + g * .1192 + b * .9505) / 1.08883;
    const f = v => v > .008856 ? Math.cbrt(v) : (7.787 * v) + (16 / 116);
    x = f(x); y = f(y); z = f(z);
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
  }

  function colorAccuracy(target, guess) {
    const a = rgbToLab(hslToRgb(target.h, target.s, target.l));
    const b = rgbToLab(hslToRgb(guess.h, guess.s, guess.l));
    const delta = Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
    return clamp(100 * Math.exp(-delta / 90), 0, 100);
  }

  function soundAccuracy(targetHz, guessHz) {
    const cents = Math.abs(1200 * Math.log2(Math.max(1, guessHz) / Math.max(1, targetHz)));
    return clamp(100 * Math.exp(-cents / 600), 0, 100);
  }

  function timeAccuracy(targetMs, actualMs) {
    const scale = clamp(.78 + (targetMs / 20000), .90, 1.28);
    const e = Math.abs(actualMs - targetMs) / scale;
    if (e <= 50) return 100 - (e / 50) * 1.5;
    if (e <= 100) return 98.5 - ((e - 50) / 50) * 2;
    if (e <= 200) return 96.5 - ((e - 100) / 100) * 4.5;
    if (e <= 400) return 92 - ((e - 200) / 200) * 8;
    return clamp(84 * Math.exp(-(e - 400) / 1800), 0, 84);
  }

  function lockCurrentGuess() {
    const ch = currentChallenge();
    if (!ch) return;
    vibrate(18);
    sfx('lock');
    let result;
    if (runtime.mode === 'color') {
      const guess = { ...runtime.colorGuess };
      result = { mode: 'color', target: { h: ch.h, s: ch.s, l: ch.l }, guess, accuracy: colorAccuracy(ch, guess) };
      runtime.stage = 'color-result';
    } else if (runtime.mode === 'sound') {
      const guessHz = selectedFrequency();
      result = { mode: 'sound', targetHz: ch.hz, guessHz, diffHz: Math.abs(ch.hz - guessHz), accuracy: soundAccuracy(ch.hz, guessHz) };
      runtime.stage = 'sound-result';
    } else return;
    completeRound(result);
  }

  function completeRound(result) {
    result.accuracy = round1(result.accuracy);
    runtime.roundResults.push(result);
    if (result.accuracy >= 95) { sfx('high'); vibrate([20, 28, 20]); }
    else sfx('average');
    render();
    runtime.autoAdvanceTask = schedule(nextRoundOrFinish, 2100);
  }

  function nextRoundOrFinish() {
    if (runtime.autoAdvanceTask) clearTask(runtime.autoAdvanceTask);
    runtime.autoAdvanceTask = null;
    if (runtime.roundIndex >= ROUND_COUNT - 1) return finishSession();
    runtime.roundIndex += 1;
    transitionToRound();
  }

  function startTimeRound(pointerId = null) {
    if (runtime.stage !== 'time-waiting' || runtime.paused || runtime.visibilityPaused) return false;
    clearTasks();
    runtime.stage = 'time-running';
    runtime.timeStartedAt = performance.now();
    runtime.timePausedMs = 0;
    runtime.timePauseStartedAt = 0;
    runtime.timeHoldPointerId = pointerId;
    render();
    sfx('start');
    vibrate(12);
    return true;
  }

  function currentTimeElapsed() {
    if (!runtime.timeStartedAt) return 0;
    const now = performance.now();
    const pendingPause = runtime.timePauseStartedAt > 0 ? now - runtime.timePauseStartedAt : 0;
    return Math.max(0, now - runtime.timeStartedAt - runtime.timePausedMs - pendingPause);
  }

  function startTimeRaf() {
    stopTimeRaf();
    const loop = () => {
      if (!runtime.open || runtime.stage !== 'time-running') { runtime.timeRaf = 0; return; }
      if (!runtime.paused && !runtime.visibilityPaused) {
        const elapsed = currentTimeElapsed();
        const number = runtime.overlay?.querySelector('[data-dial-time-number]');
        if (number) number.innerHTML = `${(elapsed / 1000).toFixed(2)}<span>s</span>`;
      }
      runtime.timeRaf = requestAnimationFrame(loop);
    };
    runtime.timeRaf = requestAnimationFrame(loop);
  }

  function stopTimeRaf() {
    if (runtime.timeRaf) cancelAnimationFrame(runtime.timeRaf);
    runtime.timeRaf = 0;
  }

  function stopTimeRound() {
    if (runtime.stage !== 'time-running' || runtime.paused || runtime.visibilityPaused) return false;
    const ch = currentChallenge();
    const actualMs = currentTimeElapsed();
    stopTimeRaf();
    runtime.timeStartedAt = 0;
    runtime.timeHoldPointerId = null;
    runtime.timeKeyboardHolding = false;
    sfx('stop');
    vibrate(18);
    const result = { mode: 'time', targetMs: ch.targetMs, actualMs, deltaMs: actualMs - ch.targetMs, accuracy: round1(timeAccuracy(ch.targetMs, actualMs)) };
    runtime.stage = 'time-result';
    completeRound(result);
    return true;
  }

  function expectedXpForAverage(avg) {
    if (avg >= 98.5) return 5;
    if (avg >= 96) return 4;
    if (avg >= 92) return 3;
    if (avg >= 85) return 2;
    if (avg >= 75) return 1;
    return 0;
  }

  function finishSession() {
    clearTasks();
    stopTimeRaf();
    runtime.stage = 'final';
    const values = runtime.roundResults.map(r => Number(r.accuracy || 0)).slice(0, 5);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const priorBest = runtime.mode === 'color' ? Number(runtime.gameRecord.bestColorAccuracy || 0)
      : runtime.mode === 'sound' ? Number(runtime.gameRecord.bestSoundAccuracy || 0)
      : Number(runtime.gameRecord.bestTimeAccuracy || 0);
    const isNewBest = avg > priorBest + .04;
    runtime.latestScore = round1(avg);
    runtime.latestMode = runtime.mode;
    render();
    if (avg >= 98.5) spawnConfetti();
    if (isNewBest) { sfx('best'); vibrate([25, 35, 25, 35, 40]); }
    submitReward(avg, isNewBest);
  }

  async function submitReward(avg, isNewBest) {
    const xpEl = runtime.overlay.querySelector('[data-dial-final-xp]');
    const note = runtime.overlay.querySelector('[data-dial-reward-note]');
    const round = runtime.round;
    runtime.round = null;
    if (!round?.sessionId || !runtime.bridge?.claimRound) {
      if (xpEl) xpEl.textContent = '+0 XP';
      if (note) note.textContent = 'Practice mode — account XP is unavailable.';
      return;
    }
    const activeTimeMs = Math.max(0, Math.round(performance.now() - runtime.sessionStartedAt));
    const bestRoundAccuracy = Math.max(0, ...runtime.roundResults.map(r => Number(r.accuracy || 0)));
    const metrics = {
      completedRun: runtime.roundResults.length === ROUND_COUNT,
      mode: runtime.mode,
      roundsCompleted: runtime.roundResults.length,
      roundAccuracies: runtime.roundResults.map(r => round1(r.accuracy)),
      averageAccuracy: round1(avg),
      bestRoundAccuracy: round1(bestRoundAccuracy),
      activeTimeMs
    };
    try {
      const result = await runtime.bridge.claimRound(round.sessionId, { score: Math.round(avg * 10), metrics });
      const awarded = Math.max(0, Number(result?.awardedXp || 0));
      runtime.sessionXp += awarded;
      if (xpEl) xpEl.textContent = `+${awarded} XP`;
      if (result?.loginRequired) {
        if (note) note.textContent = 'Practice mode — log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        if (note) note.textContent = 'Score saved locally. XP could not sync right now.';
      } else if (result?.capReached && awarded === 0) {
        if (note) note.textContent = 'Daily Mini-Game XP limit reached. Your score still counts for your personal best.';
      } else {
        const expected = expectedXpForAverage(avg);
        if (note) note.textContent = isNewBest
          ? `New ${modeMeta().label} best · ${pct(avg)}${awarded > 0 ? ` · +${awarded} XP safely added` : ''}`
          : `${pct(avg)} average${awarded > 0 ? ` · +${awarded} XP safely added` : expected > 0 ? ' · no XP available for this run' : ' · keep pushing for an XP tier'}`;
      }
      if (result?.gameRecord) runtime.gameRecord = result.gameRecord;
      else snapshotRecord();
      if (awarded > 0) { sfx('xp'); runtime.onReward?.(result); }
    } catch (error) {
      console.warn('DIAL IN reward failed.', error);
      if (xpEl) xpEl.textContent = '+0 XP';
      if (note) note.textContent = 'Score saved locally. Reward could not be processed.';
    }
  }

  function spawnConfetti() {
    const host = runtime.overlay.querySelector('.dial-in-final');
    if (!host) return;
    const wrap = document.createElement('div');
    wrap.className = 'dial-in-confetti';
    for (let i = 0; i < 12; i += 1) {
      const bit = document.createElement('i');
      bit.style.setProperty('--x', `${8 + seededUnit(`${Date.now()}:${i}`) * 84}%`);
      bit.style.setProperty('--d', `${.55 + seededUnit(`d:${Date.now()}:${i}`) * .6}s`);
      bit.style.setProperty('--r', `${Math.round(seededUnit(`r:${i}`) * 220 - 110)}deg`);
      wrap.appendChild(bit);
    }
    host.appendChild(wrap);
    clearTimeout(runtime.confettiTimer);
    runtime.confettiTimer = setTimeout(() => wrap.remove(), 1600);
  }

  function updateColorUi() {
    const g = runtime.colorGuess;
    const preview = runtime.overlay?.querySelector('[data-dial-color-preview]');
    if (preview) preview.style.background = `hsl(${g.h} ${g.s}% ${g.l}%)`;
    const values = runtime.overlay?.querySelector('.dial-in-color-values');
    if (values) values.textContent = `H${Math.round(g.h)} S${Math.round(g.s)} L${Math.round(g.l)}`;
    const tracks = colorTrackStyles(g);
    ['h','s','l'].forEach(key => {
      const control = runtime.overlay?.querySelector(`[data-dial-color-control="${key}"]`);
      const track = runtime.overlay?.querySelector(`[data-dial-color-track="${key}"]`);
      const thumb = control?.querySelector('.dial-in-color-thumb');
      if (thumb) thumb.style.bottom = `${colorPercent(key, g[key])}%`;
      if (track) track.setAttribute('style', tracks[key]);
      if (control) control.setAttribute('aria-valuenow', String(Math.round(g[key])));
    });
  }

  function updateColorFromPointer(control, clientY) {
    if (!control) return;
    const key = String(control.dataset.dialColorControl || '');
    if (!['h','s','l'].includes(key)) return;
    const track = control.querySelector('.dial-in-color-track');
    const rect = track?.getBoundingClientRect();
    if (!rect || rect.height <= 1) return;
    const min = Number(control.dataset.min || 0);
    const max = Number(control.dataset.max || (key === 'h' ? 360 : 100));
    const p = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    runtime.colorGuess[key] = Math.round(min + p * (max - min));
    updateColorUi();
  }

  function updateSoundWaveUi() {
    const level = clamp(runtime.soundSlider / 1000, 0, 1);
    runtime.overlay?.querySelectorAll('[data-dial-wave]').forEach(path => {
      const band = Number(path.dataset.dialWave || 0);
      path.setAttribute('d', makeWavePath(level, band));
    });
    const visual = runtime.overlay?.querySelector('[data-dial-sound-visual]');
    if (visual) visual.style.setProperty('--tone', level.toFixed(3));
    const pad = runtime.overlay?.querySelector('[data-dial-sound-pad]');
    if (pad) pad.style.setProperty('--dial-y', `${(100 - level * 70 - 15).toFixed(1)}%`);
    const label = runtime.overlay?.querySelector('[data-dial-frequency-number]');
    if (label) label.innerHTML = selectedFrequencyLabel();
  }

  function updateSoundFromPointer(pad, clientY) {
    const rect = pad?.getBoundingClientRect();
    if (!rect || rect.height <= 1) return;
    const top = rect.top + Math.min(78, rect.height * .13);
    const bottom = rect.bottom - Math.min(145, rect.height * .24);
    const p = 1 - clamp((clientY - top) / Math.max(40, bottom - top), 0, 1);
    runtime.soundSlider = Math.round(p * 1000);
    updateSoundWaveUi();
    updateLiveTone();
  }

  function handlePointerDown(event) {
    if (event.button != null && event.button !== 0) return;
    const timeHold = event.target.closest('[data-dial-time-hold]');
    if (timeHold && runtime.stage === 'time-waiting' && !event.target.closest('button')) {
      event.preventDefault();
      runtime.dragKind = 'time';
      runtime.dragKey = '';
      runtime.dragPointerId = event.pointerId;
      try { runtime.overlay?.setPointerCapture(event.pointerId); } catch (_) {}
      return startTimeRound(event.pointerId);
    }
    const color = event.target.closest('[data-dial-color-control]');
    if (color && runtime.stage === 'color-guess') {
      event.preventDefault();
      runtime.dragKind = 'color';
      runtime.dragKey = String(color.dataset.dialColorControl || '');
      runtime.dragPointerId = event.pointerId;
      try { color.setPointerCapture(event.pointerId); } catch (_) {}
      updateColorFromPointer(color, event.clientY);
      return;
    }
    const pad = event.target.closest('[data-dial-sound-pad]');
    if (pad && runtime.stage === 'sound-guess' && !event.target.closest('button')) {
      event.preventDefault();
      runtime.dragKind = 'sound';
      runtime.dragKey = '';
      runtime.dragPointerId = event.pointerId;
      try { pad.setPointerCapture(event.pointerId); } catch (_) {}
      pad.classList.add('is-dragging');
      updateSoundFromPointer(pad, event.clientY);
      startLiveTone();
      updateLiveTone();
    }
  }

  function handlePointerMove(event) {
    if (runtime.dragPointerId == null || event.pointerId !== runtime.dragPointerId) return;
    if (runtime.dragKind === 'color') {
      const control = runtime.overlay?.querySelector(`[data-dial-color-control="${runtime.dragKey}"]`);
      if (control) { event.preventDefault(); updateColorFromPointer(control, event.clientY); }
    } else if (runtime.dragKind === 'sound') {
      const pad = runtime.overlay?.querySelector('[data-dial-sound-pad]');
      if (pad) { event.preventDefault(); updateSoundFromPointer(pad, event.clientY); }
    }
  }

  function handlePointerUp(event) {
    if (runtime.dragPointerId == null || event.pointerId !== runtime.dragPointerId) return;
    if (runtime.dragKind === 'time') {
      event.preventDefault();
      runtime.dragKind = '';
      runtime.dragKey = '';
      runtime.dragPointerId = null;
      runtime.timeHoldPointerId = null;
      try { runtime.overlay?.releasePointerCapture(event.pointerId); } catch (_) {}
      stopTimeRound();
      return;
    }
    const pad = runtime.overlay?.querySelector('[data-dial-sound-pad]');
    if (pad) pad.classList.remove('is-dragging');
    if (runtime.dragKind === 'sound') stopLiveTone(false);
    runtime.dragKind = '';
    runtime.dragKey = '';
    runtime.dragPointerId = null;
    sfx('tick');
  }

  function handleKeyDown(event) {
    if (event.repeat) return;
    if (runtime.stage !== 'time-waiting') return;
    if (event.key !== ' ' && event.key !== 'Enter') return;
    const hold = event.target.closest?.('[data-dial-time-hold]') || runtime.overlay?.querySelector('[data-dial-time-hold]');
    if (!hold) return;
    event.preventDefault();
    runtime.timeKeyboardHolding = true;
    runtime.dragKind = 'time-key';
    startTimeRound(null);
  }

  function handleKeyUp(event) {
    if (!runtime.timeKeyboardHolding || runtime.stage !== 'time-running') return;
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    runtime.timeKeyboardHolding = false;
    runtime.dragKind = '';
    stopTimeRound();
  }

  function handleWheel(event) {
    if (runtime.stage !== 'sound-guess' || !event.target.closest('[data-dial-sound-pad]')) return;
    event.preventDefault();
    const delta = event.deltaY < 0 ? 28 : -28;
    runtime.soundSlider = clamp(runtime.soundSlider + delta, 0, 1000);
    updateSoundWaveUi();
  }

  function handleInput(event) {
    const freq = event.target.closest('[data-dial-frequency]');
    if (freq) {
      runtime.soundSlider = Number(freq.value || 0);
      updateSoundWaveUi();
    }
  }

  function handleChange(event) {
    if (event.target.closest('[data-dial-frequency]')) sfx('tick');
  }

  function handleClick(event) {
    const mode = event.target.closest('[data-dial-mode]');
    if (mode) return selectMode(mode.dataset.dialMode);
    if (event.target.closest('[data-dial-tutorial-start],[data-dial-tutorial-skip]')) {
      markTutorialSeen(runtime.mode);
      return startSession(runtime.mode);
    }
    if (event.target.closest('[data-dial-lock]')) return lockCurrentGuess();
    if (event.target.closest('[data-dial-next]')) return nextRoundOrFinish();
    if (event.target.closest('[data-dial-preview]')) {
      const now = performance.now();
      if (now < runtime.previewCooldownUntil) return;
      runtime.previewCooldownUntil = now + 700;
      stopLiveTone(true);
      const pad = runtime.overlay?.querySelector('[data-dial-sound-pad]');
      if (pad) pad.classList.add('is-previewing');
      schedule(() => pad?.classList.remove('is-previewing'), 680);
      return playToneFrequency(selectedFrequency(), 650, .095);
    }
    if (event.target.closest('[data-dial-replay]')) {
      if (runtime.roundIndex !== 0 || runtime.soundReplayUsed) return;
      runtime.soundReplayUsed = true;
      stopLiveTone(true);
      render();
      return playToneFrequency(currentChallenge().hz, currentChallenge().durationMs, .11);
    }
    if (event.target.closest('[data-dial-play-again]')) return startSession(runtime.mode);
    if (event.target.closest('[data-dial-change-mode]')) return showHome();
    if (event.target.closest('[data-dial-hub],[data-dial-back]')) {
      if (runtime.stage !== 'home') return showHome();
      return returnToHub();
    }
    if (event.target.closest('[data-dial-close]')) return close(true);
    if (event.target.closest('[data-dial-sound]')) return toggleSound();
    if (event.target.closest('[data-dial-resume]')) return resumeFromExitGuard();
  }

  function toggleSound() {
    const next = !soundOn();
    runtime.soundEnabled = next;
    runtime.bridge?.setSoundEnabled?.(next);
    updateSoundButton();
    if (next) {
      try { runtime.music?.resume?.(); } catch (_) {}
      ensureAudio();
      sfx('mode');
    } else {
      stopTransientAudio();
      try { runtime.music?.pause?.(); } catch (_) {}
    }
  }

  function showPause() {
    const panel = runtime.overlay?.querySelector('[data-dial-pause]');
    if (panel) panel.hidden = false;
  }
  function hidePause() {
    const panel = runtime.overlay?.querySelector('[data-dial-pause]');
    if (panel) panel.hidden = true;
  }

  function pauseCore(reason, show = true) {
    if (!runtime.open || runtime.paused) return false;
    runtime.paused = true;
    runtime.pauseReason = reason || 'pause';
    pauseTasks();
    if (runtime.stage === 'time-running' && !runtime.timePauseStartedAt) runtime.timePauseStartedAt = performance.now();
    stopTransientAudio();
    if (show) showPause();
    return true;
  }

  function resumeCore() {
    if (!runtime.open || !runtime.paused) return false;
    if (runtime.stage === 'time-running' && runtime.timePauseStartedAt) {
      runtime.timePausedMs += performance.now() - runtime.timePauseStartedAt;
      runtime.timePauseStartedAt = 0;
    }
    runtime.paused = false;
    runtime.pauseReason = '';
    hidePause();
    resumeTasks();
    if (runtime.stage === 'sound-target') playSoundTarget();
    return true;
  }

  function pauseForExitGuard() { return pauseCore('exit-guard', true); }
  function resumeFromExitGuard() { return resumeCore(); }

  function visibilityChanged() {
    if (!runtime.open) return;
    if (document.hidden) {
      runtime.visibilityPaused = true;
      pauseTasks();
      if (runtime.stage === 'time-running' && !runtime.timePauseStartedAt) runtime.timePauseStartedAt = performance.now();
      stopTransientAudio();
    } else if (runtime.visibilityPaused) {
      runtime.visibilityPaused = false;
      if (runtime.stage === 'time-running' && runtime.timePauseStartedAt) {
        runtime.timePausedMs += performance.now() - runtime.timePauseStartedAt;
        runtime.timePauseStartedAt = 0;
      }
      if (!runtime.paused) resumeTasks();
      if (!runtime.paused && runtime.stage === 'sound-target') playSoundTarget();
    }
  }

  function returnToHub() {
    const cb = runtime.onBack;
    close(false);
    try { cb?.(); } catch (_) {}
  }

  function close(callOnClose = true) {
    if (!runtime.open) return;
    abandonSession();
    runtime.open = false;
    runtime.overlay.hidden = true;
    document.body.classList.remove('dial-in-active');
    stopTransientAudio();
    try { runtime.audioCtx?.suspend?.(); } catch (_) {}
    if (callOnClose) {
      try { runtime.onClose?.(); } catch (_) {}
    }
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.music = options.music || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    runtime.open = true;
    runtime.overlay.hidden = false;
    runtime.sessionXp = 0;
    runtime.latestScore = 0;
    runtime.latestMode = '';
    runtime.stage = 'home';
    runtime.mode = '';
    runtime.paused = false;
    runtime.visibilityPaused = false;
    document.body.classList.add('dial-in-active');
    snapshotRecord();
    render();
    ensureAudio();
  }

  document.addEventListener('visibilitychange', visibilityChanged);

  window[GLOBAL_NAME] = Object.freeze({
    open,
    close,
    isOpen: () => runtime.open,
    pauseForExitGuard,
    resumeFromExitGuard
  });
})();
