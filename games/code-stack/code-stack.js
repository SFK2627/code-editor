(() => {
  'use strict';

  const GAME_ID = 'code-stack';
  const MAX_DPR = 2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const runtime = {
    built: false, open: false, state: 'ready', bridge: null, onBack: null, onClose: null, onReward: null,
    overlay: null, shell: null, canvas: null, ctx: null, scoreEl: null, towerEl: null, comboEl: null,
    readyPanel: null, pausePanel: null, overPanel: null, finalScore: null, finalBest: null, finalTower: null,
    finalXp: null, rewardNote: null, soundBtn: null, pauseBtn: null, fxEl: null,
    view: { w: 620, h: 680, dpr: 1 }, raf: 0, lastFrame: 0, resizeTimer: 0,
    blocks: [], moving: null, direction: 1, score: 0, placements: 0, perfects: 0, combo: 0, bestCombo: 0,
    bestVisible: 0, towerVisible: 0, round: null, soundEnabled: true, audioContext: null
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
            <p class="code-stack-reward-note" data-code-stack-reward-note>Checking reward…</p>
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
    gain.gain.setValueAtTime(volume, now);
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
    }
    const dpr = Math.max(1, Math.min(MAX_DPR, Number(devicePixelRatio || 1)));
    runtime.canvas.width = Math.round(w * dpr);
    runtime.canvas.height = Math.round(h * dpr);
    runtime.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    runtime.view = { w, h, dpr };
    if (runtime.state === 'ready' && !runtime.blocks.length) seedBase();
  }

  function blockHeight() { return clamp(runtime.view.h * .047, 20, 28); }
  function seedBase() {
    const w = clamp(runtime.view.w * .38, 130, 220);
    runtime.blocks = [{ x: (runtime.view.w - w) / 2, w }];
  }

  function resetReady() {
    runtime.state = 'ready';
    runtime.score = 0; runtime.placements = 0; runtime.perfects = 0; runtime.combo = 0; runtime.bestCombo = 0;
    runtime.round = null; runtime.direction = 1; runtime.moving = null;
    seedBase();
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
    return clamp(runtime.view.w * .42 + runtime.placements * 9, 145, 470);
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

  function placeBlock() {
    if (runtime.state !== 'playing' || !runtime.moving) return;
    const top = runtime.blocks[runtime.blocks.length - 1];
    let left = Math.max(runtime.moving.x, top.x);
    let right = Math.min(runtime.moving.x + runtime.moving.w, top.x + top.w);
    let overlap = right - left;
    if (overlap <= 0) {
      tone('miss');
      finishRound();
      return;
    }

    const centerDiff = Math.abs((runtime.moving.x + runtime.moving.w / 2) - (top.x + top.w / 2));
    const perfect = centerDiff <= Math.max(4, top.w * .045);
    let points = 1;
    if (perfect) {
      left = top.x; overlap = top.w; points = 3; runtime.combo += 1; runtime.perfects += 1;
      runtime.bestCombo = Math.max(runtime.bestCombo, runtime.combo);
      tone('perfect');
      const milestone = runtime.combo >= 10 ? `🔥 PERFECT x${runtime.combo}` : runtime.combo >= 3 ? `PERFECT x${runtime.combo}` : 'PERFECT! +3';
      showFx(milestone, true);
    } else {
      const ratio = overlap / Math.max(1, top.w);
      points = ratio >= .76 ? 2 : 1;
      runtime.combo = 0;
      tone('drop');
      showFx(points === 2 ? 'GOOD! +2' : '+1');
    }

    runtime.blocks.push({ x: left, w: overlap });
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
    if (runtime.state !== 'playing' || !runtime.moving) return;
    const speed = moveSpeed();
    runtime.moving.x += runtime.direction * speed * dt;
    if (runtime.moving.x <= 8) { runtime.moving.x = 8; runtime.direction = 1; }
    const maxX = runtime.view.w - runtime.moving.w - 8;
    if (runtime.moving.x >= maxX) { runtime.moving.x = maxX; runtime.direction = -1; }
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
    const visible = Math.max(9, Math.floor((runtime.view.h * .64) / bh));
    const extra = Math.max(0, runtime.blocks.length - 1 - visible);
    return runtime.view.h * .88 - (index - extra + 1) * bh;
  }

  function drawBlock(block, index, moving = false) {
    const { ctx } = runtime; const bh = blockHeight();
    const y = moving ? blockY(runtime.blocks.length - 1) - bh - 9 : blockY(index);
    const hue = (190 + index * 17) % 360;
    ctx.save();
    ctx.shadowColor = `hsla(${hue},90%,60%,.28)`; ctx.shadowBlur = moving ? 16 : 8;
    ctx.fillStyle = moving ? '#22d3ee' : `hsl(${hue} 72% 50%)`;
    rounded(ctx, block.x, y, block.w, bh - 3, 7); ctx.fill();
    ctx.shadowBlur = 0;
    if (block.w > 54) {
      ctx.fillStyle = moving ? '#042f3e' : 'rgba(255,255,255,.9)';
      ctx.font = `900 ${clamp(bh * .39, 9, 12)}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const labels = ['HTML', 'CSS', 'JS', '{}', '</>', '01'];
      ctx.fillText(labels[index % labels.length], block.x + block.w / 2, y + (bh - 3) / 2);
    }
    ctx.restore();
  }

  function render(time) {
    drawBackground(time);
    runtime.blocks.forEach((block, index) => drawBlock(block, index, false));
    if (runtime.moving && (runtime.state === 'playing' || runtime.state === 'paused')) drawBlock(runtime.moving, runtime.blocks.length, true);
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
    tone('over');
    const tower = runtime.placements;
    runtime.finalScore.textContent = String(runtime.score);
    runtime.finalBest.textContent = String(Math.max(runtime.bestVisible, runtime.score));
    runtime.finalTower.textContent = String(tower);
    runtime.finalXp.textContent = '+0';
    runtime.rewardNote.className = 'code-stack-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Checking reward…' : 'Practice run — account reward unavailable.';
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
        runtime.rewardNote.className = 'code-stack-reward-note warn'; runtime.rewardNote.textContent = 'XP could not sync. No account XP was added.';
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
