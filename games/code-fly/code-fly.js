(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'code-fly';
  const MAX_DPR = 2;

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
    scoreEl: null,
    fxEl: null,
    pausePanel: null,
    gameOverPanel: null,
    gameOverScore: null,
    gameOverBest: null,
    gameOverXp: null,
    rewardNote: null,
    soundBtn: null,
    pauseBtn: null,
    raf: 0,
    lastFrame: 0,
    view: { w: 360, h: 640, dpr: 1 },
    player: { x: 100, y: 300, vy: 0, rot: 0, radius: 14 },
    obstacles: [],
    score: 0,
    elapsed: 0,
    spawnClock: 0,
    firstSpawn: true,
    round: null,
    rewardPromise: null,
    bestBefore: 0,
    bestVisible: 0,
    soundEnabled: true,
    audioContext: null,
    particles: [],
    autoPaused: false,
    resizeTimer: 0
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'codeFlyOverlay';
    overlay.className = 'xp-games-game-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Fly mini-game');
    overlay.innerHTML = `
      <section class="code-fly-shell" aria-label="CODE FLY arcade game">
        <canvas class="code-fly-canvas" aria-label="CODE FLY gameplay area"></canvas>
        <div class="code-fly-topbar">
          <button class="code-fly-back" type="button" data-code-fly-back>← MINI-GAMES</button>
          <button class="code-fly-sound" type="button" data-code-fly-sound aria-label="Toggle game sound">🔊</button>
          <button class="code-fly-pause" type="button" data-code-fly-pause aria-label="Pause game">Ⅱ</button>
          <button class="code-fly-close" type="button" data-code-fly-close aria-label="Close CODE FLY">×</button>
        </div>
        <div class="code-fly-score" aria-live="polite">0</div>
        <div class="code-fly-fx" aria-hidden="true"></div>

        <div class="code-fly-panel" data-code-fly-pause-panel hidden>
          <div class="code-fly-panel-card">
            <h2>PAUSED</h2>
            <p>Your run is safe. Resume when you're ready.</p>
            <div style="height:12px"></div>
            <button class="code-fly-resume" type="button" data-code-fly-resume>RESUME</button>
          </div>
        </div>

        <div class="code-fly-panel" data-code-fly-gameover-panel hidden>
          <div class="code-fly-panel-card">
            <h2>GAME OVER</h2>
            <p data-code-fly-result-caption>Nice run. Try again and beat your best.</p>
            <div class="code-fly-gameover-stats">
              <div><small>Score</small><strong data-code-fly-final-score>0</strong></div>
              <div><small>Best</small><strong data-code-fly-final-best>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-code-fly-final-xp>+0</strong></div>
            </div>
            <p class="code-fly-reward-note" data-code-fly-reward-note>Checking reward…</p>
            <div class="code-fly-actions">
              <button class="primary" type="button" data-code-fly-again>PLAY AGAIN</button>
              <button type="button" data-code-fly-hub>MINI-GAMES</button>
              <button type="button" data-code-fly-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-fly-shell');
    runtime.canvas = overlay.querySelector('.code-fly-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false });
    runtime.scoreEl = overlay.querySelector('.code-fly-score');
    runtime.fxEl = overlay.querySelector('.code-fly-fx');
    runtime.pausePanel = overlay.querySelector('[data-code-fly-pause-panel]');
    runtime.gameOverPanel = overlay.querySelector('[data-code-fly-gameover-panel]');
    runtime.gameOverScore = overlay.querySelector('[data-code-fly-final-score]');
    runtime.gameOverBest = overlay.querySelector('[data-code-fly-final-best]');
    runtime.gameOverXp = overlay.querySelector('[data-code-fly-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-code-fly-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-code-fly-sound]');
    runtime.pauseBtn = overlay.querySelector('[data-code-fly-pause]');

    runtime.canvas.addEventListener('pointerdown', event => {
      if (!runtime.open) return;
      event.preventDefault();
      event.stopPropagation();
      if (runtime.state === 'ready') startRound();
      else if (runtime.state === 'playing') flap();
    });

    overlay.querySelector('[data-code-fly-back]').addEventListener('click', event => {
      event.stopPropagation();
      returnToHub();
    });
    runtime.soundBtn.addEventListener('click', event => {
      event.stopPropagation();
      toggleSound();
    });
    runtime.pauseBtn.addEventListener('click', event => {
      event.stopPropagation();
      if (runtime.state === 'playing') pause(false);
      else if (runtime.state === 'paused') resume();
    });
    overlay.querySelector('[data-code-fly-close]').addEventListener('click', event => {
      event.stopPropagation();
      closeAll();
    });
    overlay.querySelector('[data-code-fly-resume]').addEventListener('click', event => {
      event.stopPropagation();
      resume();
    });
    overlay.querySelector('[data-code-fly-again]').addEventListener('click', event => {
      event.stopPropagation();
      resetRound();
    });
    overlay.querySelector('[data-code-fly-hub]').addEventListener('click', event => {
      event.stopPropagation();
      returnToHub();
    });
    overlay.querySelector('[data-code-fly-close-result]').addEventListener('click', event => {
      event.stopPropagation();
      closeAll();
    });

    overlay.addEventListener('touchmove', event => {
      if (runtime.open) event.preventDefault();
    }, { passive: false });

    document.addEventListener('keydown', event => {
      if (!runtime.open) return;
      if (event.key === 'Tab') {
        const focusable = Array.from(runtime.overlay.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
          .filter(node => !node.hidden && node.getClientRects().length);
        if (focusable.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        return;
      }
      if (event.code !== 'Space') return;
      if (event.target && event.target.closest && event.target.closest('button,input,textarea,select,a')) return;
      event.preventDefault();
      if (runtime.state === 'ready') startRound();
      else if (runtime.state === 'playing') flap();
    });

    document.addEventListener('visibilitychange', () => {
      if (runtime.open && document.hidden && runtime.state === 'playing') pause(true);
    });
    window.addEventListener('blur', () => {
      if (runtime.open && runtime.state === 'playing') pause(true);
    });
    window.addEventListener('resize', queueResize, { passive: true });
    window.addEventListener('orientationchange', () => window.setTimeout(queueResize, 120), { passive: true });

    runtime.built = true;
  }

  function queueResize() {
    if (!runtime.open) return;
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = window.setTimeout(resizeCanvas, 70);
  }

  function resizeCanvas() {
    if (!runtime.canvas || !runtime.ctx || !runtime.open) return;
    const rect = runtime.canvas.getBoundingClientRect();
    const width = Math.max(240, rect.width || 360);
    const height = Math.max(360, rect.height || 640);
    const oldW = runtime.view.w || width;
    const oldH = runtime.view.h || height;
    const dpr = Math.max(1, Math.min(MAX_DPR, Number(window.devicePixelRatio || 1)));
    runtime.canvas.width = Math.max(1, Math.round(width * dpr));
    runtime.canvas.height = Math.max(1, Math.round(height * dpr));
    runtime.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    runtime.view = { w: width, h: height, dpr };

    if (oldW && oldH && (runtime.state === 'playing' || runtime.state === 'paused' || runtime.state === 'gameover')) {
      const sx = width / oldW;
      const sy = height / oldH;
      runtime.player.x *= sx;
      runtime.player.y *= sy;
      runtime.player.radius *= Math.min(sx, sy);
      runtime.obstacles.forEach(obstacle => {
        obstacle.x *= sx;
        obstacle.width *= sx;
        obstacle.gapY *= sy;
        obstacle.gap *= sy;
      });
    } else {
      placeReadyPlayer();
    }
    seedParticles();
  }

  function seedParticles() {
    const { w, h } = runtime.view;
    const count = clamp(Math.round((w * h) / 18000), 18, 42);
    runtime.particles = Array.from({ length: count }, (_, index) => ({
      x: ((index * 83) % 97) / 97 * w,
      y: ((index * 47 + 11) % 101) / 101 * h,
      size: 1 + (index % 3),
      speed: 6 + (index % 5) * 2,
      alpha: .12 + (index % 4) * .04
    }));
  }

  function placeReadyPlayer() {
    const { w, h } = runtime.view;
    runtime.player.x = w * .28;
    runtime.player.y = h * .46;
    runtime.player.vy = 0;
    runtime.player.rot = 0;
    runtime.player.radius = clamp(Math.min(w, h) * .035, 12, 17);
  }

  function syncSoundButton() {
    if (!runtime.soundBtn) return;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.soundBtn.setAttribute('aria-label', runtime.soundEnabled ? 'Turn game sound off' : 'Turn game sound on');
    runtime.soundBtn.setAttribute('aria-pressed', String(runtime.soundEnabled));
  }

  async function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    syncSoundButton();
    try {
      const snapshot = await runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);
      if (snapshot && typeof snapshot.soundEnabled === 'boolean') runtime.soundEnabled = snapshot.soundEnabled;
    } catch (_) {}
    syncSoundButton();
    if (runtime.soundEnabled) tone('score');
  }

  function ensureAudioContext() {
    if (!runtime.soundEnabled) return null;
    if (!runtime.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      try { runtime.audioContext = new AudioContext(); } catch (_) { return null; }
    }
    if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
    return runtime.audioContext;
  }

  function beep(frequency, duration, volume, type = 'sine', offset = 0) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const start = ctx.currentTime + Math.max(0, offset);
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(__ict8SfxGain(Math.max(.002, volume)), start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .025);
  }

  function tone(kind) {
    if (!runtime.soundEnabled) return;
    if (kind === 'flap') beep(430, .065, .055, 'square');
    else if (kind === 'score') beep(760, .085, .05, 'sine');
    else if (kind === 'hit') { beep(160, .16, .07, 'sawtooth'); beep(95, .22, .045, 'triangle', .07); }
    else if (kind === 'gameover') { beep(280, .12, .045, 'triangle'); beep(210, .16, .04, 'triangle', .12); beep(145, .22, .04, 'triangle', .25); }
    else if (kind === 'best') { beep(660, .09, .045, 'sine'); beep(880, .12, .05, 'sine', .10); beep(1040, .15, .045, 'sine', .22); }
  }

  function showFx(text) {
    if (!runtime.fxEl) return;
    runtime.fxEl.textContent = text;
    runtime.fxEl.classList.remove('show');
    void runtime.fxEl.offsetWidth;
    runtime.fxEl.classList.add('show');
  }

  function resetRound() {
    runtime.state = 'ready';
    runtime.score = 0;
    runtime.elapsed = 0;
    runtime.spawnClock = 0;
    runtime.firstSpawn = true;
    runtime.obstacles = [];
    runtime.round = null;
    runtime.rewardPromise = null;
    runtime.autoPaused = false;
    runtime.bestBefore = Math.max(0, Number(runtime.bridge?.getSnapshot?.()?.bestScores?.codeFly || runtime.bestVisible || 0));
    runtime.bestVisible = runtime.bestBefore;
    placeReadyPlayer();
    runtime.scoreEl.textContent = '0';
    runtime.pausePanel.hidden = true;
    runtime.gameOverPanel.hidden = true;
    runtime.pauseBtn.textContent = 'Ⅱ';
    runtime.pauseBtn.disabled = false;
    runtime.pauseBtn.setAttribute('aria-label', 'Pause game');
    runtime.shell.classList.remove('impact');
    runtime.lastFrame = performance.now();
    if (!runtime.raf) runtime.raf = requestAnimationFrame(frame);
  }

  function startRound() {
    if (runtime.state !== 'ready') return;
    try {
      runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null;
    } catch (error) {
      console.warn('CODE FLY round could not be started.', error);
      runtime.round = null;
    }
    runtime.state = 'playing';
    runtime.elapsed = 0;
    runtime.spawnClock = 0;
    runtime.firstSpawn = true;
    runtime.lastFrame = performance.now();
    flap();
  }

  function flap() {
    if (runtime.state !== 'playing') return;
    const { h } = runtime.view;
    runtime.player.vy = -clamp(h * .53, 300, 410);
    runtime.player.rot = -.32;
    tone('flap');
  }

  function pause(auto = false) {
    if (runtime.state !== 'playing') return;
    runtime.state = 'paused';
    runtime.autoPaused = Boolean(auto);
    runtime.pausePanel.hidden = false;
    runtime.pauseBtn.textContent = '▶';
    runtime.pauseBtn.setAttribute('aria-label', 'Resume game');
  }

  function resume() {
    if (runtime.state !== 'paused') return;
    runtime.state = 'playing';
    runtime.autoPaused = false;
    runtime.pausePanel.hidden = true;
    runtime.pauseBtn.textContent = 'Ⅱ';
    runtime.pauseBtn.setAttribute('aria-label', 'Pause game');
    runtime.lastFrame = performance.now();
  }

  function floorHeight() {
    return clamp(runtime.view.h * .055, 30, 44);
  }

  function obstacleParams() {
    const { w, h } = runtime.view;
    const score = runtime.score;
    const width = clamp(w * .155, 48, 66);
    const baseGap = clamp(h * .275, 156, 205);
    const minGap = clamp(h * .205, 128, 160);
    const gap = Math.max(minGap, baseGap - Math.min(baseGap - minGap, score * .72));
    const speed = clamp(Math.max(105, w * .31) + Math.min(74, score * 1.15), 105, 190);
    const spawnInterval = clamp(1.62 - score * .004, 1.28, 1.62);
    return { width, gap, speed, spawnInterval };
  }

  function spawnObstacle() {
    const { w, h } = runtime.view;
    const params = obstacleParams();
    const floor = floorHeight();
    const topSafe = clamp(h * .15, 72, 112);
    const bottomSafe = floor + clamp(h * .11, 52, 82);
    const minCenter = topSafe + params.gap / 2;
    const maxCenter = Math.max(minCenter + 4, h - bottomSafe - params.gap / 2);
    const phase = Math.sin((runtime.score + runtime.obstacles.length * 2.1) * 1.73) * .5 + .5;
    const randomBlend = Math.random() * .58 + phase * .42;
    const gapY = minCenter + (maxCenter - minCenter) * randomBlend;
    runtime.obstacles.push({
      x: w + params.width + 10,
      width: params.width,
      gap: params.gap,
      gapY,
      passed: false
    });
  }

  function circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
    const nearestX = clamp(cx, rx, rx + rw);
    const nearestY = clamp(cy, ry, ry + rh);
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function update(dt) {
    if (runtime.state !== 'playing') return;
    const { h } = runtime.view;
    const floor = floorHeight();
    const params = obstacleParams();
    runtime.elapsed += dt;
    runtime.spawnClock += dt;

    const gravity = clamp(h * 1.58, 900, 1220);
    runtime.player.vy += gravity * dt;
    runtime.player.y += runtime.player.vy * dt;
    runtime.player.rot = clamp(runtime.player.rot + dt * 1.45, -.35, 1.18);

    const firstDelay = 1.12;
    if ((runtime.firstSpawn && runtime.spawnClock >= firstDelay) || (!runtime.firstSpawn && runtime.spawnClock >= params.spawnInterval)) {
      spawnObstacle();
      runtime.spawnClock = 0;
      runtime.firstSpawn = false;
    }

    for (const obstacle of runtime.obstacles) {
      obstacle.x -= params.speed * dt;
      if (!obstacle.passed && obstacle.x + obstacle.width < runtime.player.x) {
        obstacle.passed = true;
        runtime.score += 1;
        runtime.scoreEl.textContent = String(runtime.score);
        showFx(runtime.score % 5 === 0 ? `🔥 STREAK ${runtime.score}` : '+1');
        tone('score');
      }
    }
    runtime.obstacles = runtime.obstacles.filter(obstacle => obstacle.x + obstacle.width > -20);

    const radius = runtime.player.radius * .86;
    if (runtime.player.y - radius <= 0 || runtime.player.y + radius >= h - floor) {
      gameOver();
      return;
    }

    for (const obstacle of runtime.obstacles) {
      const topHeight = obstacle.gapY - obstacle.gap / 2;
      const bottomY = obstacle.gapY + obstacle.gap / 2;
      if (
        circleRectCollision(runtime.player.x, runtime.player.y, radius, obstacle.x, 0, obstacle.width, topHeight) ||
        circleRectCollision(runtime.player.x, runtime.player.y, radius, obstacle.x, bottomY, obstacle.width, h - floor - bottomY)
      ) {
        gameOver();
        return;
      }
    }
  }

  function gameOver() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'gameover';
    runtime.pauseBtn.disabled = true;
    runtime.shell.classList.remove('impact');
    void runtime.shell.offsetWidth;
    runtime.shell.classList.add('impact');
    tone('hit');
    window.setTimeout(() => tone('gameover'), 90);

    const isNewBest = runtime.score > runtime.bestBefore;
    runtime.bestVisible = Math.max(runtime.bestBefore, runtime.score);
    runtime.gameOverScore.textContent = String(runtime.score);
    runtime.gameOverBest.textContent = String(runtime.bestVisible);
    runtime.gameOverXp.textContent = '+0';
    runtime.rewardNote.className = 'code-fly-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Checking XP reward…' : 'Score saved locally. XP sync is unavailable.';
    const caption = runtime.overlay.querySelector('[data-code-fly-result-caption]');
    if (caption) caption.textContent = isNewBest ? '🏆 NEW HIGH SCORE!' : 'Nice run. Try again and beat your best.';
    runtime.gameOverPanel.hidden = false;
    if (isNewBest) {
      showFx('🏆 NEW HIGH SCORE!');
      tone('best');
    }

    if (!runtime.round || !runtime.bridge?.claimRound) return;
    const claim = runtime.bridge.claimRound(runtime.round.sessionId, runtime.score);
    runtime.rewardPromise = Promise.resolve(claim).then(result => {
      if (!runtime.open) return result;
      const awarded = Math.max(0, Number(result?.awardedXp || 0));
      const best = Math.max(runtime.bestVisible, Number(result?.bestScore || result?.bestScores?.codeFly || 0));
      runtime.bestVisible = best;
      runtime.gameOverBest.textContent = String(best);
      runtime.gameOverXp.textContent = `+${awarded}`;

      runtime.rewardNote.className = 'code-fly-reward-note';
      if (result?.loginRequired) {
        runtime.rewardNote.classList.add('warn');
        runtime.rewardNote.textContent = 'Log in to earn bonus XP. You can still play for a high score.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.classList.add('warn');
        runtime.rewardNote.textContent = 'XP could not sync. Check your connection; no XP was added.';
      } else if (result?.capReached && awarded <= 0) {
        runtime.rewardNote.classList.add('success');
        runtime.rewardNote.textContent = 'Daily XP limit reached — keep playing for your high score!';
      } else if (awarded > 0) {
        runtime.rewardNote.classList.add('success');
        runtime.rewardNote.textContent = `⭐ +${awarded} XP added · Today ${result.todayXp}/${result.dailyCap}`;
      } else {
        runtime.rewardNote.textContent = 'Score below the XP reward tier — beat 5 to earn +1 XP.';
      }

      try { runtime.onReward?.(result); } catch (_) {}
      return result;
    }).catch(error => {
      if (!runtime.open) return null;
      runtime.rewardNote.className = 'code-fly-reward-note warn';
      runtime.rewardNote.textContent = 'XP could not sync. No XP was added.';
      console.warn('CODE FLY reward display failed.', error);
      return null;
    });
  }

  function updateReadyAnimation(time) {
    if (runtime.state !== 'ready') return;
    const { h } = runtime.view;
    runtime.player.y = h * .46 + Math.sin(time / 420) * clamp(h * .012, 5, 9);
    runtime.player.rot = Math.sin(time / 700) * .05;
  }

  function drawBackground(time) {
    const ctx = runtime.ctx;
    const { w, h } = runtime.view;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#0c2144');
    gradient.addColorStop(.55, '#0b3150');
    gradient.addColorStop(1, '#092335');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const horizon = h * .68;
    ctx.save();
    ctx.globalAlpha = .16;
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    const grid = clamp(w / 9, 34, 52);
    const offset = (time * .018) % grid;
    for (let x = -grid + offset; x < w + grid; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, horizon);
      ctx.lineTo((x - w / 2) * 1.9 + w / 2, h);
      ctx.stroke();
    }
    for (let y = horizon; y < h; y += clamp((y - horizon) * .18 + 18, 18, 48)) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    runtime.particles.forEach((particle, index) => {
      const y = (particle.y + time * particle.speed * .001) % h;
      const x = (particle.x - time * (2 + (index % 3)) * .001 + w) % w;
      ctx.fillStyle = `rgba(147,197,253,${particle.alpha})`;
      ctx.fillRect(x, y, particle.size, particle.size);
    });

    ctx.save();
    ctx.globalAlpha = .15;
    ctx.fillStyle = '#93c5fd';
    for (let x = 0; x < w; x += 52) {
      const height = 38 + ((x / 52) % 4) * 17;
      ctx.fillRect(x + 3, horizon - height, 34, height);
    }
    ctx.restore();
  }

  function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawServerTower(obstacle) {
    const ctx = runtime.ctx;
    const { h } = runtime.view;
    const floor = floorHeight();
    const topH = obstacle.gapY - obstacle.gap / 2;
    const bottomY = obstacle.gapY + obstacle.gap / 2;
    const towerW = obstacle.width;

    const drawTower = (x, y, width, height, capAtBottom) => {
      if (height <= 0) return;
      const grad = ctx.createLinearGradient(x, y, x + width, y);
      grad.addColorStop(0, '#1d4ed8');
      grad.addColorStop(.55, '#2563eb');
      grad.addColorStop(1, '#1e40af');
      ctx.fillStyle = grad;
      roundedRect(ctx, x, y, width, height, 7);
      ctx.fill();
      ctx.strokeStyle = 'rgba(191,219,254,.34)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(5,15,35,.43)';
      for (let row = y + 14; row < y + height - 8; row += 22) {
        roundedRect(ctx, x + 8, row, width - 16, 11, 4);
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.fillRect(x + 13, row + 4, 4, 3);
        ctx.fillStyle = 'rgba(5,15,35,.43)';
      }

      const capY = capAtBottom ? y + height - 11 : y;
      ctx.fillStyle = '#60a5fa';
      roundedRect(ctx, x - 5, capY, width + 10, 12, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.fillRect(x + 5, y + 4, 3, Math.max(0, height - 8));
    };

    drawTower(obstacle.x, 0, towerW, topH, true);
    drawTower(obstacle.x, bottomY, towerW, h - floor - bottomY, false);
  }

  function drawPlayer() {
    const ctx = runtime.ctx;
    const p = runtime.player;
    const size = p.radius * 2;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    // Original tiny computer mascot: screen body + circuit wings.
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.moveTo(-size * .48, -size * .12);
    ctx.lineTo(-size * .92, -size * .45);
    ctx.lineTo(-size * .78, size * .16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.moveTo(size * .48, -size * .1);
    ctx.lineTo(size * .88, -size * .34);
    ctx.lineTo(size * .72, size * .2);
    ctx.closePath();
    ctx.fill();

    const bodyW = size * 1.18;
    const bodyH = size * .9;
    ctx.fillStyle = '#dbeafe';
    roundedRect(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH, size * .18);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#102a43';
    roundedRect(ctx, -bodyW * .36, -bodyH * .28, bodyW * .72, bodyH * .47, size * .08);
    ctx.fill();
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(-bodyW * .20, -bodyH * .10, bodyW * .11, bodyH * .08);
    ctx.fillRect(bodyW * .08, -bodyH * .10, bodyW * .11, bodyH * .08);
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, bodyH * .02, bodyW * .12, .15, Math.PI - .15);
    ctx.stroke();

    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bodyW * .28, bodyH * .52);
    ctx.lineTo(-bodyW * .18, bodyH * .72);
    ctx.moveTo(bodyW * .28, bodyH * .52);
    ctx.lineTo(bodyW * .18, bodyH * .72);
    ctx.stroke();
    ctx.restore();
  }

  function drawFloor(time) {
    const ctx = runtime.ctx;
    const { w, h } = runtime.view;
    const floor = floorHeight();
    ctx.fillStyle = '#07192c';
    ctx.fillRect(0, h - floor, w, floor);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, h - floor, w, 3);
    ctx.fillStyle = 'rgba(96,165,250,.28)';
    const step = 26;
    const offset = -(time * .04) % step;
    for (let x = offset; x < w + step; x += step) ctx.fillRect(x, h - floor + 13, 12, 2);
  }

  function drawReady() {
    if (runtime.state !== 'ready') return;
    const ctx = runtime.ctx;
    const { w, h } = runtime.view;
    ctx.save();
    ctx.fillStyle = 'rgba(3,10,24,.28)';
    roundedRect(ctx, w * .10, h * .63, w * .80, clamp(h * .18, 98, 130), 18);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${clamp(w * .075, 24, 34)}px system-ui, sans-serif`;
    ctx.fillText('CODE FLY', w / 2, h * .69);
    ctx.fillStyle = '#c7d9ee';
    ctx.font = `800 ${clamp(w * .034, 12, 15)}px system-ui, sans-serif`;
    ctx.fillText('Tap / Click / Space to Start', w / 2, h * .735);
    ctx.fillStyle = '#fcd34d';
    ctx.font = `800 ${clamp(w * .03, 11, 14)}px system-ui, sans-serif`;
    ctx.fillText(`Best Score: ${runtime.bestVisible}`, w / 2, h * .775);
    ctx.restore();
  }

  function render(time) {
    drawBackground(time);
    runtime.obstacles.forEach(drawServerTower);
    drawFloor(time);
    drawPlayer();
    drawReady();
  }

  function frame(time) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const dt = clamp((time - (runtime.lastFrame || time)) / 1000, 0, .034);
    runtime.lastFrame = time;
    if (runtime.state === 'playing') update(dt);
    else if (runtime.state === 'ready') updateReadyAnimation(time);
    render(time);
    runtime.raf = requestAnimationFrame(frame);
  }

  function returnToHub() {
    const callback = runtime.onBack;
    closeInternal();
    try { callback?.(); } catch (_) {}
  }

  function closeAll() {
    const callback = runtime.onClose;
    closeInternal();
    try { callback?.(); } catch (_) {}
  }

  function closeInternal() {
    if (!runtime.open) return;
    runtime.open = false;
    runtime.overlay.hidden = true;
    document.body.classList.remove('code-fly-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    runtime.state = 'ready';
    runtime.round = null;
    runtime.obstacles = [];
    runtime.pausePanel.hidden = true;
    runtime.gameOverPanel.hidden = true;
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snapshot = runtime.bridge?.getSnapshot?.() || {};
    runtime.soundEnabled = snapshot.soundEnabled !== false;
    runtime.bestVisible = Math.max(0, Number(snapshot.bestScores?.codeFly || 0));
    runtime.bestBefore = runtime.bestVisible;
    syncSoundButton();
    runtime.open = true;
    runtime.overlay.hidden = false;
    document.body.classList.add('code-fly-active');
    window.requestAnimationFrame(() => {
      resizeCanvas();
      resetRound();
      try { runtime.canvas.focus?.({ preventScroll: true }); } catch (_) {}
    });
  }

  window.ICT8CodeFly = Object.freeze({
    open,
    close: closeInternal,
    isOpen: () => runtime.open
  });
})();
