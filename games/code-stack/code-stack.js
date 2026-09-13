(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'code-stack';
  const MAX_DPR = 2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const runtime = {
    built: false, open: false, state: 'ready', bridge: null, onBack: null, onClose: null, onReward: null,
    overlay: null, shell: null, canvas: null, ctx: null, scoreEl: null, towerEl: null, comboEl: null,
    readyPanel: null, pausePanel: null, overPanel: null, finalScore: null, finalBest: null, finalTower: null,
    finalXp: null, rewardNote: null, soundBtn: null, pauseBtn: null, fxEl: null,
    view: { w: 620, h: 680, dpr: 1 }, raf: 0, lastFrame: 0, resizeTimer: 0,
    blocks: [], moving: null, direction: 1, score: 0, placements: 0, perfects: 0, combo: 0, bestCombo: 0,
    bestVisible: 0, towerVisible: 0, round: null, soundEnabled: true, audioContext: null,
    fragments: [], sliceEffects: [], stackParticles: [], landingFx: null, impactShake: 0, impactStrength: 0,
    cameraScale: 1, cameraOffsetY: 0
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'codeStackOverlay';
    overlay.className = 'xp-games-game-overlay code-stack-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Stack mini-game');
    overlay.innerHTML = `
      <section class="code-stack-shell">
        <canvas class="code-stack-canvas" tabindex="-1" aria-label="CODE STACK gameplay area"></canvas>
        <div class="code-stack-topbar">
          <button type="button" data-code-stack-back>← MINI-GAMES</button>
          <button type="button" data-code-stack-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-code-stack-pause aria-label="Pause CODE STACK">Ⅱ</button>
          <button type="button" data-code-stack-close aria-label="Close CODE STACK">×</button>
        </div>
        <div class="code-stack-hud">
          <div><small>SCORE</small><strong data-code-stack-score>0</strong></div>
          <div><small>TOWER</small><strong data-code-stack-tower>0</strong></div>
          <div><small>COMBO</small><strong data-code-stack-combo>x0</strong></div>
        </div>
        <div class="code-stack-fx" data-code-stack-fx></div>

        <div class="code-stack-panel" data-code-stack-ready>
          <div class="code-stack-panel-card">
            <span class="code-stack-hero">🧱</span>
            <h2>CODE STACK</h2>
            <p>Drop moving code blocks, line them up, and build the highest tower you can.</p>
            <div class="code-stack-help">Tap / Click / Space to drop</div>
            <button class="primary" type="button" data-code-stack-start>START</button>
          </div>
        </div>

        <div class="code-stack-panel" data-code-stack-pause hidden>
          <div class="code-stack-panel-card">
            <h2>PAUSED</h2>
            <p>Your tower is waiting.</p>
            <button class="primary" type="button" data-code-stack-resume>RESUME</button>
          </div>
        </div>

        <div class="code-stack-panel" data-code-stack-over hidden>
          <div class="code-stack-panel-card">
            <h2>GAME OVER</h2>
            <div class="code-stack-stats">
              <div><small>Score</small><strong data-code-stack-final-score>0</strong></div>
              <div><small>Best</small><strong data-code-stack-final-best>0</strong></div>
              <div><small>Tower</small><strong data-code-stack-final-tower>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-code-stack-final-xp>+0</strong></div>
            </div>
            <p class="code-stack-reward-note" data-code-stack-reward-note>Securing reward…</p>
            <div class="code-stack-actions">
              <button class="primary" type="button" data-code-stack-again>PLAY AGAIN</button>
              <button type="button" data-code-stack-hub>MINI-GAMES</button>
              <button type="button" data-code-stack-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-stack-shell');
    runtime.canvas = overlay.querySelector('.code-stack-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false });
    runtime.scoreEl = overlay.querySelector('[data-code-stack-score]');
    runtime.towerEl = overlay.querySelector('[data-code-stack-tower]');
    runtime.comboEl = overlay.querySelector('[data-code-stack-combo]');
    runtime.readyPanel = overlay.querySelector('[data-code-stack-ready]');
    runtime.pausePanel = overlay.querySelector('[data-code-stack-pause]');
    runtime.overPanel = overlay.querySelector('[data-code-stack-over]');
    runtime.finalScore = overlay.querySelector('[data-code-stack-final-score]');
    runtime.finalBest = overlay.querySelector('[data-code-stack-final-best]');
    runtime.finalTower = overlay.querySelector('[data-code-stack-final-tower]');
    runtime.finalXp = overlay.querySelector('[data-code-stack-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-code-stack-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-code-stack-sound]');
    runtime.pauseBtn = overlay.querySelector('[data-code-stack-pause]');
    runtime.fxEl = overlay.querySelector('[data-code-stack-fx]');

    overlay.querySelector('[data-code-stack-start]').addEventListener('click', startRound);
    overlay.querySelector('[data-code-stack-resume]').addEventListener('click', resume);
    overlay.querySelector('[data-code-stack-again]').addEventListener('click', resetReady);
    overlay.querySelector('[data-code-stack-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-stack-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-stack-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-code-stack-close-result]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.pauseBtn.addEventListener('click', () => runtime.state === 'playing' ? pause() : resume());
    runtime.canvas.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (runtime.state === 'playing') placeBlock();
    });
    overlay.addEventListener('touchmove', event => { if (runtime.open) event.preventDefault(); }, { passive: false });
    document.addEventListener('keydown', event => {
      if (!runtime.open || event.code !== 'Space') return;
      if (event.target instanceof HTMLElement && event.target.closest('button,input,textarea,select,a')) return;
      event.preventDefault();
      if (runtime.state === 'playing') placeBlock();
    });
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
    } catch (_) { return null; }
  }

  function tone(kind) {
    const ctx = getAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const table = {
      drop: [300, 420, .055, .045], perfect: [520, 980, .10, .06], miss: [180, 70, .18, .07], over: [160, 65, .24, .07]
    };
    const [from, to, dur, volume] = table[kind] || table.drop;
    osc.type = kind === 'miss' || kind === 'over' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + dur);
    gain.gain.setValueAtTime(__ict8SfxGain(volume), now);
    gain.gain.exponentialRampToValueAtTime(.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + dur + .02);
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
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
    const oldW = runtime.view.w || rect.width || 620;
    const w = Math.max(280, rect.width || 620);
    const h = Math.max(400, rect.height || 680);
    const ratio = oldW > 0 ? w / oldW : 1;
    if (runtime.blocks.length && Math.abs(ratio - 1) > .001) {
      runtime.blocks.forEach(block => { block.x *= ratio; block.w *= ratio; });
      if (runtime.moving) { runtime.moving.x *= ratio; runtime.moving.w *= ratio; }
      runtime.fragments.forEach(piece => { piece.x *= ratio; piece.w *= ratio; piece.vx *= ratio; });
      runtime.sliceEffects.forEach(fx => { fx.x *= ratio; fx.len *= ratio; });
    }
    const dpr = Math.max(1, Math.min(MAX_DPR, Number(devicePixelRatio || 1)));
    runtime.canvas.width = Math.round(w * dpr);
    runtime.canvas.height = Math.round(h * dpr);
    runtime.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    runtime.view = { w, h, dpr };
    if (!runtime.blocks.length) { runtime.cameraScale = 1; runtime.cameraOffsetY = 0; }
    if (runtime.state === 'ready' && !runtime.blocks.length) seedBase();
  }

  function blockHeight() { return clamp(runtime.view.h * .047, 20, 28); }
  function seedBase() {
    const w = clamp(runtime.view.w * .38, 130, 220);
    runtime.blocks = [{ x: (runtime.view.w - w) / 2, w }];
  }

  function resetEffects() {
    runtime.fragments = [];
    runtime.sliceEffects = [];
    runtime.stackParticles = [];
    runtime.landingFx = null;
    runtime.cameraScale = 1;
    runtime.cameraOffsetY = 0;
    runtime.impactShake = 0;
    runtime.impactStrength = 0;
  }

  function resetReady() {
    runtime.state = 'ready';
    runtime.score = 0; runtime.placements = 0; runtime.perfects = 0; runtime.combo = 0; runtime.bestCombo = 0;
    runtime.round = null; runtime.direction = 1; runtime.moving = null;
    seedBase();
    resetEffects();
    updateHud();
    runtime.readyPanel.hidden = false;
    runtime.pausePanel.hidden = true;
    runtime.overPanel.hidden = true;
    runtime.pauseBtn.textContent = 'Ⅱ';
    runtime.lastFrame = performance.now();
  }

  function startRound() {
    if (runtime.state !== 'ready') return;
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    runtime.score = 0; runtime.placements = 0; runtime.perfects = 0; runtime.combo = 0; runtime.bestCombo = 0;
    seedBase();
    resetEffects();
    runtime.readyPanel.hidden = true;
    runtime.overPanel.hidden = true;
    runtime.state = 'playing';
    runtime.lastFrame = performance.now();
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
    spawnMoving();
    updateHud();
  }

  function spawnMoving() {
    const top = runtime.blocks[runtime.blocks.length - 1];
    const w = top.w;
    runtime.direction = runtime.placements % 2 === 0 ? 1 : -1;
    runtime.moving = { x: runtime.direction > 0 ? 8 : runtime.view.w - w - 8, w };
  }

  function moveSpeed() {
    const screenStableFactor = 1 / Math.max(.74, runtime.cameraScale || 1);
    return clamp((runtime.view.w * .42 + runtime.placements * 9) * screenStableFactor, 145, 610);
  }

  function updateHud() {
    runtime.scoreEl.textContent = String(runtime.score);
    runtime.towerEl.textContent = String(runtime.placements);
    runtime.comboEl.textContent = `x${runtime.combo}`;
  }

  function showFx(text, perfect = false) {
    runtime.fxEl.textContent = text;
    runtime.fxEl.classList.toggle('perfect', perfect);
    runtime.fxEl.classList.remove('show');
    void runtime.fxEl.offsetWidth;
    runtime.fxEl.classList.add('show');
  }

  function triggerImpact(strength = .5) {
    runtime.impactShake = clamp(runtime.impactShake + .18 + strength * .28, 0, .52);
    runtime.impactStrength = Math.max(runtime.impactStrength, strength);
  }

  function cameraTarget() {
    const count = Math.max(1, runtime.blocks.length + (runtime.moving ? 1 : 0));
    const targetScale = clamp(1 - Math.max(0, count - 10) * 0.018, 0.74, 1);
    const topIndex = Math.max(0, runtime.blocks.length - 1);
    const rawTop = blockY(topIndex);
    const safeTop = Math.max(155, runtime.view.h * 0.23);
    const movingClearance = blockHeight() + 12;
    const topWithMoving = rawTop - movingClearance;
    const scaledTop = topWithMoving * targetScale;
    const targetOffsetY = scaledTop < safeTop ? safeTop - scaledTop : 0;
    return { scale: targetScale, y: targetOffsetY };
  }

  function updateCamera(dt) {
    const target = cameraTarget();
    const follow = 1 - Math.exp(-7.2 * dt);
    runtime.cameraScale = lerp(runtime.cameraScale, target.scale, follow);
    runtime.cameraOffsetY = lerp(runtime.cameraOffsetY, target.y, follow);
  }

  function spawnLandingFx(block, index, perfect, points) {
    const bh = blockHeight();
    const y = blockY(index);
    runtime.landingFx = {
      index, x: block.x, y, w: block.w, h: bh - 3,
      age: 0, ttl: perfect ? 0.62 : 0.38, perfect, points
    };
    const count = perfect ? 18 : points === 2 ? 9 : 6;
    const color = perfect ? '#fde68a' : getBlockColor(index, false);
    for (let i = 0; i < count; i += 1) {
      const spread = (i / Math.max(1, count - 1)) - 0.5;
      runtime.stackParticles.push({
        x: block.x + block.w * (0.5 + spread * 0.88),
        y: y + bh * 0.38,
        vx: spread * (perfect ? 125 : 70) + (Math.random() - 0.5) * 24,
        vy: -(perfect ? 62 : 36) - Math.random() * (perfect ? 65 : 36),
        gravity: 250,
        radius: perfect ? 2.4 + Math.random() * 2.8 : 1.8 + Math.random() * 2,
        age: 0,
        ttl: perfect ? 0.58 + Math.random() * 0.18 : 0.34 + Math.random() * 0.12,
        color
      });
    }
  }

  function getDrawYForIndex(index) {
    return blockY(index);
  }

  function getMovingY() {
    const bh = blockHeight();
    return blockY(runtime.blocks.length - 1) - bh - 9;
  }

  function getBlockColor(index, moving = false) {
    if (moving) return '#22d3ee';
    const hue = (190 + index * 17) % 360;
    return `hsl(${hue} 72% 50%)`;
  }

  function getBlockShadow(index, moving = false) {
    if (moving) return 'rgba(34,211,238,.28)';
    const hue = (190 + index * 17) % 360;
    return `hsla(${hue},90%,60%,.28)`;
  }

  function getBlockLabel(index) {
    const labels = ['HTML', 'CSS', 'JS', '{}', '</>', '01'];
    return labels[index % labels.length];
  }

  function spawnSliceEffect(piece, label, stackIndex, side) {
    const bh = blockHeight();
    const edgeX = side === 'left' ? piece.x + piece.w : piece.x;
    runtime.sliceEffects.push({
      x: edgeX,
      y: piece.y + (bh - 3) / 2,
      len: clamp(piece.w * .5, 16, 48),
      age: 0,
      ttl: .2,
      side,
      color: getBlockColor(stackIndex, false)
    });

    runtime.fragments.push({
      x: piece.x,
      y: piece.y,
      w: piece.w,
      h: bh - 3,
      vx: (side === 'left' ? -1 : 1) * clamp(70 + piece.w * 1.25, 95, 215),
      vy: -clamp(48 + piece.w * .16, 52, 92),
      gravity: clamp(runtime.view.h * 2.3, 860, 1450),
      rotation: 0,
      vr: (side === 'left' ? -1 : 1) * clamp(.9 + piece.w * .012, 1.1, 2.45),
      age: 0,
      ttl: 1.1,
      color: getBlockColor(stackIndex, false),
      shadow: getBlockShadow(stackIndex, false),
      label: piece.w > 44 ? label : '',
      stackIndex
    });
  }

  function placeBlock() {
    if (runtime.state !== 'playing' || !runtime.moving) return;
    const top = runtime.blocks[runtime.blocks.length - 1];
    const movingX = runtime.moving.x;
    const movingW = runtime.moving.w;
    const movingY = getMovingY();
    let left = Math.max(movingX, top.x);
    let right = Math.min(movingX + movingW, top.x + top.w);
    let overlap = right - left;
    if (overlap <= 0) {
      triggerImpact(.8);
      tone('miss');
      finishRound();
      return;
    }

    const centerDiff = Math.abs((movingX + movingW / 2) - (top.x + top.w / 2));
    const perfect = centerDiff <= Math.max(4, top.w * .045);
    let points = 1;
    if (perfect) {
      left = top.x; overlap = top.w; points = 3; runtime.combo += 1; runtime.perfects += 1;
      runtime.bestCombo = Math.max(runtime.bestCombo, runtime.combo);
      triggerImpact(.28);
      tone('perfect');
      const milestone = runtime.combo >= 10 ? `🔥 PERFECT x${runtime.combo}` : runtime.combo >= 3 ? `PERFECT x${runtime.combo}` : 'PERFECT! +3';
      showFx(milestone, true);
    } else {
      const ratio = overlap / Math.max(1, top.w);
      points = ratio >= .76 ? 2 : 1;
      runtime.combo = 0;
      tone('drop');
      showFx(points === 2 ? 'GOOD! +2' : '+1');

      if (movingX < left) {
        spawnSliceEffect({ x: movingX, y: movingY, w: left - movingX }, getBlockLabel(runtime.blocks.length), runtime.blocks.length, 'left');
      } else if (movingX + movingW > right) {
        spawnSliceEffect({ x: right, y: movingY, w: movingX + movingW - right }, getBlockLabel(runtime.blocks.length), runtime.blocks.length, 'right');
      }
      const cutRatio = 1 - ratio;
      triggerImpact(clamp(.24 + cutRatio * .7, .24, .92));
    }

    runtime.blocks.push({ x: left, w: overlap });
    spawnLandingFx(runtime.blocks[runtime.blocks.length - 1], runtime.blocks.length - 1, perfect, points);
    runtime.moving = null;
    runtime.placements += 1;
    runtime.score += points;
    updateHud();

    if (overlap < Math.max(14, runtime.view.w * .026)) {
      finishRound();
      return;
    }
    spawnMoving();
  }

  function pause() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'paused';
    runtime.pausePanel.hidden = false;
    runtime.pauseBtn.textContent = '▶';
  }

  function resume() {
    if (runtime.state !== 'paused') return;
    runtime.state = 'playing';
    runtime.pausePanel.hidden = true;
    runtime.pauseBtn.textContent = 'Ⅱ';
    runtime.lastFrame = performance.now();
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
  }

  function update(dt) {
    updateCamera(dt);

    if (runtime.landingFx) {
      runtime.landingFx.age += dt;
      if (runtime.landingFx.age >= runtime.landingFx.ttl) runtime.landingFx = null;
    }

    if (runtime.stackParticles.length) {
      runtime.stackParticles = runtime.stackParticles.filter(particle => {
        particle.age += dt;
        particle.vy += particle.gravity * dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        return particle.age < particle.ttl;
      });
    }

    if (runtime.state === 'playing' && runtime.moving) {
      const speed = moveSpeed();
      runtime.moving.x += runtime.direction * speed * dt;
      if (runtime.moving.x <= 8) { runtime.moving.x = 8; runtime.direction = 1; }
      const maxX = runtime.view.w - runtime.moving.w - 8;
      if (runtime.moving.x >= maxX) { runtime.moving.x = maxX; runtime.direction = -1; }
    }

    if (runtime.impactShake > 0) {
      runtime.impactShake = Math.max(0, runtime.impactShake - dt * 2.25);
      runtime.impactStrength = Math.max(0, runtime.impactStrength - dt * 1.8);
    }

    if (runtime.fragments.length) {
      runtime.fragments = runtime.fragments.filter(piece => {
        piece.age += dt;
        piece.vy += piece.gravity * dt;
        piece.x += piece.vx * dt;
        piece.y += piece.vy * dt;
        piece.rotation += piece.vr * dt;
        return piece.age < piece.ttl && piece.y < runtime.view.h + piece.h + 60;
      });
    }

    if (runtime.sliceEffects.length) {
      runtime.sliceEffects = runtime.sliceEffects.filter(fx => {
        fx.age += dt;
        return fx.age < fx.ttl;
      });
    }
  }

  function rounded(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(r, h / 2, w / 2)); else ctx.rect(x, y, w, h);
  }

  function drawBackground(time) {
    const { ctx } = runtime; const { w, h } = runtime.view;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#07182e'); gradient.addColorStop(1, '#090b1a');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(34,211,238,.075)'; ctx.lineWidth = 1;
    const step = 38, offset = -((time * .025) % step);
    for (let x = offset; x < w + step; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }

  function blockY(index) {
    const bh = blockHeight();
    // Keep a stable world stack and let the smooth camera handle tall towers.
    // This avoids the old sudden scroll/crowding near the fixed scoreboard.
    return runtime.view.h * .88 - (index + 1) * bh;
  }

  function drawBlock(block, index, moving = false) {
    const { ctx } = runtime;
    const bh = blockHeight();
    const h = bh - 3;
    const y = moving ? getMovingY() : getDrawYForIndex(index);
    const landing = !moving && runtime.landingFx?.index === index ? runtime.landingFx : null;
    let sx = 1;
    let sy = 1;
    let lift = 0;
    let glowBoost = 0;
    if (landing) {
      const t = clamp(landing.age / landing.ttl, 0, 1);
      const pulse = Math.sin(Math.PI * clamp(t * 1.18, 0, 1));
      sx = 1 + pulse * (landing.perfect ? 0.055 : 0.025);
      sy = 1 - pulse * (landing.perfect ? 0.10 : 0.055);
      lift = -Math.sin(Math.PI * t) * (landing.perfect ? 3.4 : 1.7);
      glowBoost = (1 - t) * (landing.perfect ? 16 : 7);
    }

    ctx.save();
    ctx.translate(block.x + block.w / 2, y + h / 2 + lift);
    ctx.scale(sx, sy);
    ctx.shadowColor = landing?.perfect ? 'rgba(253,230,138,.72)' : getBlockShadow(index, moving);
    ctx.shadowBlur = (moving ? 16 : 8) + glowBoost;
    ctx.fillStyle = getBlockColor(index, moving);
    rounded(ctx, -block.w / 2, -h / 2, block.w, h, 7);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (landing?.perfect) {
      const t = clamp(landing.age / landing.ttl, 0, 1);
      ctx.globalAlpha = Math.max(0, 0.72 * (1 - t));
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.2;
      rounded(ctx, -block.w / 2 - 4 - t * 8, -h / 2 - 4 - t * 4, block.w + 8 + t * 16, h + 8 + t * 8, 10);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (block.w > 54) {
      ctx.fillStyle = moving ? '#042f3e' : 'rgba(255,255,255,.9)';
      ctx.font = `900 ${clamp(bh * .39, 9, 12)}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(getBlockLabel(index), 0, 0);
    }
    ctx.restore();
  }

  function drawFragments() {
    if (!runtime.fragments.length) return;
    const { ctx } = runtime;
    runtime.fragments.forEach(piece => {
      const fade = 1 - (piece.age / piece.ttl);
      if (fade <= 0) return;
      ctx.save();
      ctx.translate(piece.x + piece.w / 2, piece.y + piece.h / 2);
      ctx.rotate(piece.rotation);
      ctx.globalAlpha = clamp(fade, 0, 1);
      ctx.shadowColor = piece.shadow;
      ctx.shadowBlur = 12;
      ctx.fillStyle = piece.color;
      rounded(ctx, -piece.w / 2, -piece.h / 2, piece.w, piece.h, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (piece.label) {
        ctx.fillStyle = 'rgba(255,255,255,.82)';
        ctx.font = `900 ${clamp(piece.h * .39, 9, 12)}px system-ui`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(piece.label, 0, 0);
      }
      ctx.restore();
    });
  }

  function drawStackParticles() {
    if (!runtime.stackParticles.length) return;
    const { ctx } = runtime;
    runtime.stackParticles.forEach(particle => {
      const alpha = clamp(1 - particle.age / particle.ttl, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawSliceEffects() {
    if (!runtime.sliceEffects.length) return;
    const { ctx } = runtime;
    runtime.sliceEffects.forEach(fx => {
      const t = fx.age / fx.ttl;
      const alpha = 1 - t;
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = 'rgba(255,255,255,.85)';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = 'rgba(186,230,253,.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y - 10 - t * 6);
      ctx.lineTo(fx.x, fx.y + 10 + t * 6);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = fx.color;
      const dir = fx.side === 'left' ? -1 : 1;
      for (let i = 0; i < 3; i += 1) {
        const px = fx.x + dir * (6 + i * 6 + t * 10);
        const py = fx.y + (i - 1) * 6 + t * 4;
        ctx.globalAlpha = alpha * .85;
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
      ctx.restore();
    });
  }

  function getShakeOffset() {
    if (runtime.impactShake <= 0) return { x: 0, y: 0 };
    const mag = clamp(runtime.impactShake * 7 * (0.65 + runtime.impactStrength), 0, 6.8);
    return {
      x: (Math.random() - .5) * mag,
      y: (Math.random() - .5) * mag * .55
    };
  }

  function render(time) {
    const { ctx } = runtime;
    const shake = getShakeOffset();
    drawBackground(time);

    ctx.save();
    const scale = runtime.cameraScale || 1;
    ctx.translate(runtime.view.w / 2, runtime.cameraOffsetY);
    ctx.scale(scale, scale);
    ctx.translate(-runtime.view.w / 2 + shake.x / scale, shake.y / scale);
    runtime.blocks.forEach((block, index) => drawBlock(block, index, false));
    drawStackParticles();
    drawFragments();
    drawSliceEffects();
    if (runtime.moving && (runtime.state === 'playing' || runtime.state === 'paused')) drawBlock(runtime.moving, runtime.blocks.length, true);
    ctx.restore();
  }

  function frame(time) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const dt = clamp((time - (runtime.lastFrame || time)) / 1000, 0, .034);
    runtime.lastFrame = time;
    update(dt); render(time);
    runtime.raf = requestAnimationFrame(frame);
  }

  async function finishRound() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'gameover';
    triggerImpact(.9);
    tone('over');
    const tower = runtime.placements;
    runtime.finalScore.textContent = String(runtime.score);
    runtime.finalBest.textContent = String(Math.max(runtime.bestVisible, runtime.score));
    runtime.finalTower.textContent = String(tower);
    runtime.finalXp.textContent = '+0';
    runtime.rewardNote.className = 'code-stack-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Securing reward…' : 'Practice run — account reward unavailable.';
    runtime.overPanel.hidden = false;
    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: runtime.score,
        metrics: { placements: runtime.placements, perfects: runtime.perfects, bestCombo: runtime.bestCombo, highestTower: tower }
      });
      const rec = result?.gameRecord || result?.gameRecords?.codeStack || {};
      runtime.bestVisible = Math.max(runtime.bestVisible, Number(rec.bestScore || 0), Number(result?.bestScore || 0));
      runtime.towerVisible = Math.max(runtime.towerVisible, Number(rec.highestTower || 0), tower);
      runtime.finalBest.textContent = String(runtime.bestVisible);
      runtime.finalXp.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;
      if (result?.loginRequired) {
        runtime.rewardNote.className = 'code-stack-reward-note warn'; runtime.rewardNote.textContent = 'Practice mode — log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.className = 'code-stack-reward-note warn'; runtime.rewardNote.textContent = 'Reward saved for sync. XP will update automatically once confirmed.';
      } else if (result?.capReached && Number(result.awardedXp || 0) === 0) {
        runtime.rewardNote.className = 'code-stack-reward-note warn'; runtime.rewardNote.textContent = 'Daily Mini-Game XP limit reached. Keep stacking for records!';
      } else {
        runtime.rewardNote.className = 'code-stack-reward-note success';
        runtime.rewardNote.textContent = Number(result?.awardedXp || 0) > 0
          ? `Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`
          : 'No XP tier reached this tower yet.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.rewardNote.className = 'code-stack-reward-note warn';
      runtime.rewardNote.textContent = 'Reward could not be processed. No XP was added.';
    }
  }

  function returnToHub() { const cb = runtime.onBack; closeInternal(); try { cb?.(); } catch (_) {} }
  function closeAll() { const cb = runtime.onClose; closeInternal(); try { cb?.(); } catch (_) {} }
  function closeInternal() {
    if (!runtime.open) return;
    runtime.open = false; runtime.overlay.hidden = true; document.body.classList.remove('code-stack-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf); runtime.raf = 0;
    runtime.state = 'ready'; runtime.round = null; runtime.pausePanel.hidden = true; runtime.overPanel.hidden = true;
    resetEffects();
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.bestVisible = Math.max(0, Number(snap.gameRecords?.codeStack?.bestScore || snap.bestScores?.codeStack || 0));
    runtime.towerVisible = Math.max(0, Number(snap.gameRecords?.codeStack?.highestTower || 0));
    runtime.open = true; runtime.overlay.hidden = false; document.body.classList.add('code-stack-active');
    requestAnimationFrame(() => { resizeCanvas(); resetReady(); if (!runtime.raf) runtime.raf = requestAnimationFrame(frame); });
  }

  window.ICT8CodeStack = Object.freeze({ open, close: closeInternal, isOpen: () => runtime.open });
})();
