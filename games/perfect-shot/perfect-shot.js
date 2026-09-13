(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'perfect-shot';
  const ROUND_MS = 30000;
  const MAX_DPR = 2;
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
    timeEl: null,
    comboEl: null,
    accuracyEl: null,
    finalScore: null,
    finalBest: null,
    finalAccuracy: null,
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
    roundStartedAt: 0,
    pausedAt: 0,
    pausedTotal: 0,
    score: 0,
    hits: 0,
    attempts: 0,
    perfects: 0,
    combo: 0,
    bestCombo: 0,
    bestVisible: 0,
    target: null,
    nextTargetAt: 0,
    round: null,
    soundEnabled: true,
    audioContext: null
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'perfectShotOverlay';
    overlay.className = 'xp-games-game-overlay perfect-shot-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Perfect Shot mini-game');
    overlay.innerHTML = `
      <section class="perfect-shot-shell">
        <canvas class="perfect-shot-canvas" tabindex="-1" aria-label="PERFECT SHOT gameplay area"></canvas>
        <div class="perfect-shot-topbar">
          <button type="button" data-perfect-shot-back>&larr; MINI-GAMES</button>
          <button type="button" data-perfect-shot-sound aria-label="Toggle sound">&#128266;</button>
          <button type="button" data-perfect-shot-pause-button aria-label="Pause PERFECT SHOT">II</button>
          <button type="button" data-perfect-shot-close aria-label="Close PERFECT SHOT">&times;</button>
        </div>
        <div class="perfect-shot-hud">
          <div><small>SCORE</small><strong data-perfect-shot-score>0</strong></div>
          <div><small>TIME</small><strong data-perfect-shot-time>30.0</strong></div>
          <div><small>COMBO</small><strong data-perfect-shot-combo>x0</strong></div>
          <div><small>ACCURACY</small><strong data-perfect-shot-accuracy>0%</strong></div>
        </div>
        <div class="perfect-shot-fx" data-perfect-shot-fx></div>

        <div class="perfect-shot-panel" data-perfect-shot-ready>
          <div class="perfect-shot-panel-card">
            <span class="perfect-shot-hero">&#127919;</span>
            <h2>PERFECT SHOT</h2>
            <p>Time your shot as the moving target crosses the center bullseye.</p>
            <div class="perfect-shot-help">Tap / Click when the target reaches the center</div>
            <button class="primary" type="button" data-perfect-shot-start>START</button>
          </div>
        </div>

        <div class="perfect-shot-panel" data-perfect-shot-pause-panel hidden>
          <div class="perfect-shot-panel-card">
            <h2>PAUSED</h2>
            <p>Your timer is frozen.</p>
            <button class="primary" type="button" data-perfect-shot-resume>RESUME</button>
          </div>
        </div>

        <div class="perfect-shot-panel" data-perfect-shot-over hidden>
          <div class="perfect-shot-panel-card">
            <h2>GAME OVER</h2>
            <div class="perfect-shot-stats">
              <div><small>Score</small><strong data-perfect-shot-final-score>0</strong></div>
              <div><small>Best</small><strong data-perfect-shot-final-best>0</strong></div>
              <div><small>Accuracy</small><strong data-perfect-shot-final-accuracy>0%</strong></div>
              <div><small>Best Combo</small><strong data-perfect-shot-final-combo>x0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-perfect-shot-final-xp>+0</strong></div>
            </div>
            <p class="perfect-shot-reward-note" data-perfect-shot-reward-note>Securing reward...</p>
            <div class="perfect-shot-actions">
              <button class="primary" type="button" data-perfect-shot-again>PLAY AGAIN</button>
              <button type="button" data-perfect-shot-hub>MINI-GAMES</button>
              <button type="button" data-perfect-shot-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.perfect-shot-shell');
    runtime.canvas = overlay.querySelector('.perfect-shot-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false });
    runtime.readyPanel = overlay.querySelector('[data-perfect-shot-ready]');
    runtime.pausePanel = overlay.querySelector('[data-perfect-shot-pause-panel]');
    runtime.overPanel = overlay.querySelector('[data-perfect-shot-over]');
    runtime.scoreEl = overlay.querySelector('[data-perfect-shot-score]');
    runtime.timeEl = overlay.querySelector('[data-perfect-shot-time]');
    runtime.comboEl = overlay.querySelector('[data-perfect-shot-combo]');
    runtime.accuracyEl = overlay.querySelector('[data-perfect-shot-accuracy]');
    runtime.finalScore = overlay.querySelector('[data-perfect-shot-final-score]');
    runtime.finalBest = overlay.querySelector('[data-perfect-shot-final-best]');
    runtime.finalAccuracy = overlay.querySelector('[data-perfect-shot-final-accuracy]');
    runtime.finalCombo = overlay.querySelector('[data-perfect-shot-final-combo]');
    runtime.finalXp = overlay.querySelector('[data-perfect-shot-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-perfect-shot-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-perfect-shot-sound]');
    runtime.pauseBtn = overlay.querySelector('[data-perfect-shot-pause-button]');
    runtime.fxEl = overlay.querySelector('[data-perfect-shot-fx]');

    overlay.querySelector('[data-perfect-shot-start]').addEventListener('click', startRound);
    overlay.querySelector('[data-perfect-shot-resume]').addEventListener('click', resume);
    overlay.querySelector('[data-perfect-shot-again]').addEventListener('click', resetReady);
    overlay.querySelector('[data-perfect-shot-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-perfect-shot-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-perfect-shot-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-perfect-shot-close-result]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.pauseBtn.addEventListener('click', () => runtime.state === 'playing' ? pause() : resume());
    runtime.canvas.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (runtime.state === 'playing') fireShot();
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
      perfect: [660, 1120, 0.08, 0.06],
      good: [440, 660, 0.07, 0.05],
      hit: [320, 440, 0.06, 0.045],
      miss: [180, 100, 0.12, 0.05],
      over: [160, 70, 0.22, 0.06]
    };
    const item = table[kind] || table.hit;
    osc.type = kind === 'miss' || kind === 'over' ? 'sawtooth' : 'sine';
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
  }

  function resetReady() {
    runtime.state = 'ready';
    runtime.score = 0;
    runtime.hits = 0;
    runtime.attempts = 0;
    runtime.perfects = 0;
    runtime.combo = 0;
    runtime.bestCombo = 0;
    runtime.target = null;
    runtime.round = null;
    runtime.roundStartedAt = 0;
    runtime.pausedAt = 0;
    runtime.pausedTotal = 0;
    runtime.readyPanel.hidden = false;
    runtime.pausePanel.hidden = true;
    runtime.overPanel.hidden = true;
    runtime.pauseBtn.textContent = 'II';
    updateHud(ROUND_MS);
  }

  function startRound() {
    if (!runtime.open) return;
    runtime.score = 0;
    runtime.hits = 0;
    runtime.attempts = 0;
    runtime.perfects = 0;
    runtime.combo = 0;
    runtime.bestCombo = 0;
    runtime.roundStartedAt = performance.now();
    runtime.pausedAt = 0;
    runtime.pausedTotal = 0;
    runtime.target = null;
    runtime.nextTargetAt = runtime.roundStartedAt;
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
    updateHud(ROUND_MS);
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
  }

  function activeElapsed(now = performance.now()) {
    if (!runtime.roundStartedAt) return 0;
    const pausedExtra = runtime.state === 'paused' && runtime.pausedAt ? now - runtime.pausedAt : 0;
    return Math.max(0, now - runtime.roundStartedAt - runtime.pausedTotal - pausedExtra);
  }

  function remainingMs(now = performance.now()) {
    return Math.max(0, ROUND_MS - activeElapsed(now));
  }

  function updateHud(remaining = remainingMs()) {
    runtime.scoreEl.textContent = String(runtime.score);
    runtime.timeEl.textContent = (remaining / 1000).toFixed(1);
    runtime.comboEl.textContent = `x${runtime.combo}`;
    const accuracy = runtime.attempts > 0 ? runtime.hits / runtime.attempts * 100 : 0;
    runtime.accuracyEl.textContent = `${Math.round(accuracy)}%`;
  }

  function targetDuration() {
    const progress = clamp(activeElapsed() / ROUND_MS, 0, 1);
    return clamp(1280 - progress * 430 - runtime.score * 2.1, 650, 1280);
  }

  function spawnTarget(now) {
    const angleChoices = [-0.78, -0.43, 0, 0.43, 0.78, 1.13, -1.13];
    const angle = angleChoices[Math.floor(Math.random() * angleChoices.length)];
    const minSpan = Math.max(runtime.view.w, runtime.view.h) * 0.62;
    const span = clamp(minSpan, 260, 480);
    const radius = clamp(31 - runtime.score * 0.045, 20, 31);
    const wobble = clamp(70 + Math.random() * 60, 60, runtime.view.w * 0.22);
    runtime.target = {
      bornAt: now,
      duration: targetDuration(),
      angle,
      span,
      radius,
      wobble,
      phase: Math.random() * Math.PI * 2,
      x: runtime.view.w / 2,
      y: runtime.view.h / 2
    };
  }

  function targetPosition(target, now) {
    const t = clamp((now - target.bornAt) / target.duration, 0, 1);
    const cx = runtime.view.w / 2;
    const cy = runtime.view.h * 0.53;
    const dx = Math.cos(target.angle);
    const dy = Math.sin(target.angle);
    const px = -dy;
    const py = dx;
    const along = (t - 0.5) * target.span * 2;
    const wobble = Math.sin(Math.PI * t) * Math.sin(target.phase + t * Math.PI * 2) * target.wobble * 0.22;
    const x = cx + dx * along + px * wobble;
    const y = cy + dy * along + py * wobble;
    return { x, y, t };
  }

  function showFx(text, level = '') {
    runtime.fxEl.textContent = text;
    runtime.fxEl.className = `perfect-shot-fx ${level}`.trim();
    void runtime.fxEl.offsetWidth;
    runtime.fxEl.classList.add('show');
  }

  function fireShot() {
    if (runtime.state !== 'playing' || !runtime.target) return;
    const now = performance.now();
    const pos = targetPosition(runtime.target, now);
    const cx = runtime.view.w / 2;
    const cy = runtime.view.h * 0.53;
    const distance = Math.hypot(pos.x - cx, pos.y - cy);
    const perfectRadius = clamp(runtime.view.w * 0.035, 16, 24);
    const goodRadius = perfectRadius * 2.1;
    const hitRadius = perfectRadius * 3.25;
    runtime.attempts += 1;

    if (distance <= perfectRadius) {
      runtime.score += 3;
      runtime.hits += 1;
      runtime.perfects += 1;
      runtime.combo += 1;
      runtime.bestCombo = Math.max(runtime.bestCombo, runtime.combo);
      tone('perfect');
      if (runtime.combo >= 10) showFx(`PERFECT x${runtime.combo}`, 'hot');
      else if (runtime.combo >= 5) showFx(`PERFECT x${runtime.combo}`, 'perfect');
      else if (runtime.combo >= 3) showFx(`PERFECT x${runtime.combo}`, 'perfect');
      else showFx('PERFECT! +3', 'perfect');
    } else if (distance <= goodRadius) {
      runtime.score += 2;
      runtime.hits += 1;
      runtime.combo = 0;
      tone('good');
      showFx('GOOD SHOT +2', 'good');
    } else if (distance <= hitRadius) {
      runtime.score += 1;
      runtime.hits += 1;
      runtime.combo = 0;
      tone('hit');
      showFx('HIT +1', 'good');
    } else {
      runtime.combo = 0;
      tone('miss');
      showFx('MISS', 'miss');
    }

    runtime.target = null;
    runtime.nextTargetAt = now + 180;
    updateHud();
  }

  function missExpiredTarget(now) {
    if (!runtime.target) return;
    const elapsed = now - runtime.target.bornAt;
    if (elapsed < runtime.target.duration) return;
    runtime.attempts += 1;
    runtime.combo = 0;
    runtime.target = null;
    runtime.nextTargetAt = now + 120;
    tone('miss');
    showFx('TOO LATE', 'miss');
  }

  function pause() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'paused';
    runtime.pausedAt = performance.now();
    runtime.pausePanel.hidden = false;
    runtime.pauseBtn.textContent = '>'; 
  }

  function resume() {
    if (runtime.state !== 'paused') return;
    const now = performance.now();
    const delta = runtime.pausedAt ? now - runtime.pausedAt : 0;
    runtime.pausedTotal += delta;
    if (runtime.target) runtime.target.bornAt += delta;
    runtime.nextTargetAt += delta;
    runtime.pausedAt = 0;
    runtime.state = 'playing';
    runtime.pausePanel.hidden = true;
    runtime.pauseBtn.textContent = 'II';
    runtime.lastFrame = now;
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
  }

  function drawBackground(time) {
    const ctx = runtime.ctx;
    const w = runtime.view.w;
    const h = runtime.view.h;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#071827');
    gradient.addColorStop(1, '#080b18');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(56,189,248,.07)';
    ctx.lineWidth = 1;
    const grid = 38;
    const shift = (time * 0.018) % grid;
    for (let x = -grid + shift; x < w + grid; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = -grid + shift; y < h + grid; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawCrosshair() {
    const ctx = runtime.ctx;
    const cx = runtime.view.w / 2;
    const cy = runtime.view.h * 0.53;
    const perfectRadius = clamp(runtime.view.w * 0.035, 16, 24);
    ctx.save();
    ctx.strokeStyle = 'rgba(250,204,21,.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, perfectRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(125,211,252,.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, perfectRadius * 2.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - perfectRadius * 3, cy);
    ctx.lineTo(cx + perfectRadius * 3, cy);
    ctx.moveTo(cx, cy - perfectRadius * 3);
    ctx.lineTo(cx, cy + perfectRadius * 3);
    ctx.stroke();
    ctx.restore();
  }

  function drawTarget(now) {
    if (!runtime.target) return;
    const ctx = runtime.ctx;
    const pos = targetPosition(runtime.target, now);
    runtime.target.x = pos.x;
    runtime.target.y = pos.y;
    const r = runtime.target.radius;
    ctx.save();
    ctx.shadowColor = 'rgba(244,63,94,.42)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r * 0.66, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function render(now) {
    drawBackground(now);
    drawCrosshair();
    drawTarget(now);
    if (runtime.state === 'ready') {
      const ctx = runtime.ctx;
      ctx.fillStyle = 'rgba(226,232,240,.55)';
      ctx.font = '800 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET + TIMING', runtime.view.w / 2, runtime.view.h * 0.80);
    }
  }

  function update(now) {
    if (runtime.state !== 'playing') return;
    const remaining = remainingMs(now);
    if (remaining <= 0) {
      finishRound();
      return;
    }
    if (!runtime.target && now >= runtime.nextTargetAt) spawnTarget(now);
    missExpiredTarget(now);
    updateHud(remaining);
  }

  function frame(now) {
    runtime.raf = 0;
    if (!runtime.open) return;
    runtime.lastFrame = now;
    update(now);
    render(now);
    runtime.raf = requestAnimationFrame(frame);
  }

  async function finishRound() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'gameover';
    runtime.target = null;
    tone('over');
    const accuracy = runtime.attempts > 0 ? runtime.hits / runtime.attempts * 100 : 0;
    runtime.finalScore.textContent = String(runtime.score);
    runtime.finalBest.textContent = String(Math.max(runtime.bestVisible, runtime.score));
    runtime.finalAccuracy.textContent = `${Math.round(accuracy)}%`;
    runtime.finalCombo.textContent = `x${runtime.bestCombo}`;
    runtime.finalXp.textContent = '+0';
    runtime.rewardNote.className = 'perfect-shot-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Securing reward...' : 'Practice run - account reward unavailable.';
    runtime.overPanel.hidden = false;

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: runtime.score,
        metrics: {
          hits: runtime.hits,
          attempts: runtime.attempts,
          perfects: runtime.perfects,
          accuracy,
          bestCombo: runtime.bestCombo,
          durationMs: ROUND_MS
        }
      });
      const rec = result?.gameRecord || result?.gameRecords?.perfectShot || {};
      runtime.bestVisible = Math.max(runtime.bestVisible, Number(rec.bestScore || 0), Number(result?.bestScore || 0));
      runtime.finalBest.textContent = String(runtime.bestVisible);
      runtime.finalXp.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;
      if (result?.loginRequired) {
        runtime.rewardNote.className = 'perfect-shot-reward-note warn';
        runtime.rewardNote.textContent = 'Practice mode - log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.className = 'perfect-shot-reward-note warn';
        runtime.rewardNote.textContent = 'Reward saved for sync. XP will update automatically once confirmed.';
      } else if (result?.capReached && Number(result.awardedXp || 0) === 0) {
        runtime.rewardNote.className = 'perfect-shot-reward-note warn';
        runtime.rewardNote.textContent = 'Daily Mini-Game XP limit reached. Keep shooting for records!';
      } else {
        runtime.rewardNote.className = 'perfect-shot-reward-note success';
        runtime.rewardNote.textContent = Number(result?.awardedXp || 0) > 0
          ? `Reward added safely - Today's Game XP: ${result.todayXp}/${result.dailyCap}`
          : 'No XP tier reached this round yet.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.rewardNote.className = 'perfect-shot-reward-note warn';
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
    document.body.classList.remove('perfect-shot-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    runtime.state = 'ready';
    runtime.round = null;
    runtime.target = null;
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
    runtime.bestVisible = Math.max(0, Number(snap.gameRecords?.perfectShot?.bestScore || snap.bestScores?.perfectShot || 0));
    runtime.open = true;
    runtime.overlay.hidden = false;
    document.body.classList.add('perfect-shot-active');
    requestAnimationFrame(() => {
      resizeCanvas();
      resetReady();
      if (!runtime.raf) runtime.raf = requestAnimationFrame(frame);
    });
  }

  window.ICT8PerfectShot = Object.freeze({
    open,
    close: closeInternal,
    isOpen: () => runtime.open
  });
})();
