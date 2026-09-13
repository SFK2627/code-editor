(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'bug-smash';
  const ROUND_SECONDS = 30;
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
    timerEl: null,
    scoreEl: null,
    comboEl: null,
    readyPanel: null,
    pausePanel: null,
    overPanel: null,
    finalScore: null,
    finalBest: null,
    finalAccuracy: null,
    finalXp: null,
    rewardNote: null,
    soundBtn: null,
    raf: 0,
    lastFrame: 0,
    view: { w: 700, h: 520, dpr: 1 },
    elapsed: 0,
    countdown: 0,
    spawnClock: 0,
    targets: [],
    score: 0,
    hits: 0,
    attempts: 0,
    combo: 0,
    bestCombo: 0,
    bestVisible: 0,
    round: null,
    rewardPromise: null,
    soundEnabled: true,
    audioContext: null,
    fx: [],
    resizeTimer: 0
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.className = 'xp-games-game-overlay bug-smash-overlay';
    overlay.id = 'bugSmashOverlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Bug Smash mini-game');
    overlay.innerHTML = `
      <section class="bug-smash-shell">
        <canvas class="bug-smash-canvas" aria-label="BUG SMASH gameplay area"></canvas>
        <div class="bug-smash-topbar">
          <button type="button" data-bug-smash-back>← MINI-GAMES</button>
          <button type="button" data-bug-smash-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-bug-smash-close aria-label="Close BUG SMASH">×</button>
        </div>
        <div class="bug-smash-hud">
          <div><small>TIME</small><strong data-bug-smash-time>30.0</strong></div>
          <div><small>SCORE</small><strong data-bug-smash-score>0</strong></div>
          <div><small>COMBO</small><strong data-bug-smash-combo>x0</strong></div>
        </div>

        <div class="bug-smash-panel" data-bug-smash-ready>
          <div class="bug-smash-panel-card">
            <span class="bug-smash-hero">🐛</span>
            <h2>BUG SMASH</h2>
            <p>Smash the bugs before they disappear!</p>
            <strong class="bug-smash-round-label">30 SECONDS</strong>
            <button class="primary" type="button" data-bug-smash-start>START</button>
          </div>
        </div>

        <div class="bug-smash-panel" data-bug-smash-pause hidden>
          <div class="bug-smash-panel-card">
            <h2>PAUSED</h2>
            <p>Your timer is frozen.</p>
            <button class="primary" type="button" data-bug-smash-resume>RESUME</button>
          </div>
        </div>

        <div class="bug-smash-panel" data-bug-smash-over hidden>
          <div class="bug-smash-panel-card">
            <h2>GAME OVER</h2>
            <div class="bug-smash-stats">
              <div><small>Score</small><strong data-bug-smash-final-score>0</strong></div>
              <div><small>Best</small><strong data-bug-smash-final-best>0</strong></div>
              <div><small>Accuracy</small><strong data-bug-smash-final-accuracy>0%</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-bug-smash-final-xp>+0</strong></div>
            </div>
            <p class="bug-smash-reward-note" data-bug-smash-reward-note>Securing reward…</p>
            <div class="bug-smash-actions">
              <button class="primary" type="button" data-bug-smash-again>PLAY AGAIN</button>
              <button type="button" data-bug-smash-hub>MINI-GAMES</button>
              <button type="button" data-bug-smash-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.bug-smash-shell');
    runtime.canvas = overlay.querySelector('.bug-smash-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false });
    runtime.timerEl = overlay.querySelector('[data-bug-smash-time]');
    runtime.scoreEl = overlay.querySelector('[data-bug-smash-score]');
    runtime.comboEl = overlay.querySelector('[data-bug-smash-combo]');
    runtime.readyPanel = overlay.querySelector('[data-bug-smash-ready]');
    runtime.pausePanel = overlay.querySelector('[data-bug-smash-pause]');
    runtime.overPanel = overlay.querySelector('[data-bug-smash-over]');
    runtime.finalScore = overlay.querySelector('[data-bug-smash-final-score]');
    runtime.finalBest = overlay.querySelector('[data-bug-smash-final-best]');
    runtime.finalAccuracy = overlay.querySelector('[data-bug-smash-final-accuracy]');
    runtime.finalXp = overlay.querySelector('[data-bug-smash-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-bug-smash-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-bug-smash-sound]');

    overlay.querySelector('[data-bug-smash-start]').addEventListener('click', startCountdown);
    overlay.querySelector('[data-bug-smash-resume]').addEventListener('click', resume);
    overlay.querySelector('[data-bug-smash-again]').addEventListener('click', resetReady);
    overlay.querySelector('[data-bug-smash-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-bug-smash-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-bug-smash-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-bug-smash-close-result]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);

    runtime.canvas.addEventListener('pointerdown', hitTarget);
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

  function queueResize() {
    if (!runtime.open) return;
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = setTimeout(resizeCanvas, 70);
  }

  function resizeCanvas() {
    if (!runtime.open || !runtime.ctx) return;
    const rect = runtime.canvas.getBoundingClientRect();
    const w = Math.max(280, rect.width || 700);
    const h = Math.max(360, rect.height || 520);
    const dpr = Math.max(1, Math.min(MAX_DPR, Number(devicePixelRatio || 1)));
    runtime.canvas.width = Math.round(w * dpr);
    runtime.canvas.height = Math.round(h * dpr);
    runtime.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    runtime.view = { w, h, dpr };
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
      hit: [520, 760, .055, .05],
      fast: [620, 980, .07, .06],
      bonus: [720, 1260, .10, .075],
      wrong: [170, 105, .09, .06],
      over: [240, 95, .22, .08]
    };
    const [from, to, dur, volume] = table[kind] || table.hit;
    osc.type = kind === 'wrong' || kind === 'over' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + dur);
    gain.gain.setValueAtTime(__ict8SfxGain(volume), now);
    gain.gain.exponentialRampToValueAtTime(.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + .02);
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);
  }

  function resetReady() {
    runtime.state = 'ready';
    runtime.elapsed = 0;
    runtime.countdown = 0;
    runtime.spawnClock = 0;
    runtime.targets = [];
    runtime.fx = [];
    runtime.score = 0;
    runtime.hits = 0;
    runtime.attempts = 0;
    runtime.combo = 0;
    runtime.bestCombo = 0;
    runtime.round = null;
    runtime.rewardPromise = null;
    runtime.readyPanel.hidden = false;
    runtime.pausePanel.hidden = true;
    runtime.overPanel.hidden = true;
    runtime.timerEl.textContent = ROUND_SECONDS.toFixed(1);
    runtime.scoreEl.textContent = '0';
    runtime.comboEl.textContent = 'x0';
    runtime.lastFrame = performance.now();
  }

  function startCountdown() {
    if (runtime.state !== 'ready') return;
    runtime.readyPanel.hidden = true;
    runtime.state = 'countdown';
    runtime.countdown = 3.1;
    runtime.lastFrame = performance.now();
  }

  function beginRound() {
    runtime.state = 'playing';
    runtime.elapsed = 0;
    runtime.spawnClock = .35;
    runtime.targets = [];
    runtime.score = 0;
    runtime.hits = 0;
    runtime.attempts = 0;
    runtime.combo = 0;
    runtime.bestCombo = 0;
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; }
    catch (_) { runtime.round = null; }
  }

  function pause() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'paused';
    runtime.pausePanel.hidden = false;
  }

  function resume() {
    if (runtime.state !== 'paused') return;
    runtime.pausePanel.hidden = true;
    runtime.state = 'playing';
    runtime.lastFrame = performance.now();
  }

  function targetParams() {
    const progress = clamp(runtime.elapsed / ROUND_SECONDS, 0, 1);
    return {
      spawnEvery: 0.9 - progress * 0.43,
      life: 1.75 - progress * .65,
      radius: clamp(Math.min(runtime.view.w, runtime.view.h) * (.055 - progress * .008), 23, 34),
      maxTargets: progress < .35 ? 2 : progress < .72 ? 3 : 4
    };
  }

  function spawnTarget() {
    const params = targetParams();
    if (runtime.targets.length >= params.maxTargets) return;
    const roll = Math.random();
    let type = 'normal';
    let points = 1;
    let life = params.life;
    let label = '🐛';
    let safe = false;
    if (roll < .08) {
      type = 'bonus'; points = 3; life *= .78; label = '★';
    } else if (roll < .30) {
      type = 'fast'; points = 2; life *= .60; label = Math.random() < .5 ? '!' : '404';
    } else if (roll > .92) {
      type = 'safe'; points = -1; life *= .92; label = '</>'; safe = true;
    } else if (roll < .56) label = Math.random() < .5 ? '❌' : '⚠';
    else label = Math.random() < .5 ? '🐛' : '🦠';

    const r = params.radius * (type === 'bonus' ? .96 : type === 'fast' ? .90 : 1);
    const topPad = 105;
    const x = r + 16 + Math.random() * Math.max(1, runtime.view.w - r * 2 - 32);
    const y = topPad + r + Math.random() * Math.max(1, runtime.view.h - topPad - r * 2 - 28);
    runtime.targets.push({
      id: `${Date.now()}-${Math.random()}`,
      x, y, r, type, points, label, safe,
      age: 0, life, pop: 0
    });
  }

  function pushFx(x, y, text, good = true) {
    runtime.fx.push({ x, y, text, good, age: 0, life: .72 });
  }

  function hitTarget(event) {
    if (runtime.state !== 'playing') return;
    event.preventDefault();
    event.stopPropagation();
    const rect = runtime.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    runtime.attempts += 1;
    let hitIndex = -1;
    for (let i = runtime.targets.length - 1; i >= 0; i -= 1) {
      const t = runtime.targets[i];
      const dx = x - t.x;
      const dy = y - t.y;
      if (dx * dx + dy * dy <= t.r * t.r * 1.12) { hitIndex = i; break; }
    }
    if (hitIndex < 0) {
      runtime.combo = 0;
      pushFx(x, y, 'MISS', false);
      tone('wrong');
      updateHud();
      return;
    }
    const target = runtime.targets.splice(hitIndex, 1)[0];
    if (target.safe) {
      runtime.score = Math.max(0, runtime.score - 1);
      runtime.combo = 0;
      pushFx(target.x, target.y, '-1 SAFE CODE', false);
      tone('wrong');
    } else {
      runtime.score += target.points;
      runtime.hits += 1;
      runtime.combo += 1;
      runtime.bestCombo = Math.max(runtime.bestCombo, runtime.combo);
      const comboText = runtime.combo >= 10 ? `🔥 BUG DESTROYER x${runtime.combo}` : runtime.combo >= 5 ? `🔥 COMBO x${runtime.combo}` : runtime.combo >= 3 ? `COMBO x${runtime.combo}` : `+${target.points}`;
      pushFx(target.x, target.y, comboText, true);
      tone(target.type === 'bonus' ? 'bonus' : target.type === 'fast' ? 'fast' : 'hit');
    }
    updateHud();
  }

  function updateHud() {
    runtime.scoreEl.textContent = String(runtime.score);
    runtime.comboEl.textContent = `x${runtime.combo}`;
  }

  function update(dt) {
    if (runtime.state === 'countdown') {
      runtime.countdown -= dt;
      if (runtime.countdown <= 0) beginRound();
      return;
    }
    if (runtime.state !== 'playing') return;
    runtime.elapsed += dt;
    runtime.timerEl.textContent = Math.max(0, ROUND_SECONDS - runtime.elapsed).toFixed(1);
    runtime.spawnClock -= dt;
    if (runtime.spawnClock <= 0) {
      spawnTarget();
      runtime.spawnClock = targetParams().spawnEvery * (.88 + Math.random() * .25);
    }

    runtime.targets.forEach(target => {
      target.age += dt;
      target.pop = Math.min(1, target.pop + dt * 8);
    });
    const expired = runtime.targets.filter(target => target.age >= target.life && !target.safe).length;
    if (expired > 0) runtime.combo = 0;
    runtime.targets = runtime.targets.filter(target => target.age < target.life);
    runtime.fx.forEach(item => item.age += dt);
    runtime.fx = runtime.fx.filter(item => item.age < item.life);
    updateHud();
    if (runtime.elapsed >= ROUND_SECONDS) finishRound();
  }

  async function finishRound() {
    if (runtime.state !== 'playing') return;
    runtime.state = 'gameover';
    runtime.targets = [];
    tone('over');
    const accuracy = runtime.attempts > 0 ? Math.round(runtime.hits / runtime.attempts * 100) : 0;
    runtime.finalScore.textContent = String(runtime.score);
    runtime.finalBest.textContent = String(Math.max(runtime.bestVisible, runtime.score));
    runtime.finalAccuracy.textContent = `${accuracy}%`;
    runtime.finalXp.textContent = '+0';
    runtime.rewardNote.className = 'bug-smash-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Securing reward…' : 'Practice run — account reward unavailable.';
    runtime.overPanel.hidden = false;

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    const payload = {
      score: runtime.score,
      metrics: {
        hits: runtime.hits,
        attempts: runtime.attempts,
        accuracy,
        bestCombo: runtime.bestCombo
      }
    };
    runtime.rewardPromise = runtime.bridge.claimRound(runtime.round.sessionId, payload);
    try {
      const result = await runtime.rewardPromise;
      const record = result?.gameRecord || result?.gameRecords?.bugSmash || {};
      runtime.bestVisible = Math.max(runtime.bestVisible, Number(record.bestScore || 0), Number(result?.bestScore || 0));
      runtime.finalBest.textContent = String(runtime.bestVisible);
      runtime.finalXp.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;
      if (result?.loginRequired) {
        runtime.rewardNote.className = 'bug-smash-reward-note warn';
        runtime.rewardNote.textContent = 'Practice mode — log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.className = 'bug-smash-reward-note warn';
        runtime.rewardNote.textContent = 'Score saved locally, but Reward saved for sync. XP will update automatically once confirmed.';
      } else if (result?.duplicate) {
        runtime.rewardNote.className = 'bug-smash-reward-note';
        runtime.rewardNote.textContent = 'This round was already processed. No duplicate XP added.';
      } else if (result?.capReached && Number(result.awardedXp || 0) === 0) {
        runtime.rewardNote.className = 'bug-smash-reward-note warn';
        runtime.rewardNote.textContent = 'Daily Mini-Game XP limit reached. Keep playing for high scores!';
      } else {
        runtime.rewardNote.className = 'bug-smash-reward-note success';
        runtime.rewardNote.textContent = Number(result?.awardedXp || 0) > 0
          ? `Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`
          : 'No XP tier reached this round. Try for a higher score!';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.rewardNote.className = 'bug-smash-reward-note warn';
      runtime.rewardNote.textContent = 'XP reward could not be processed. No XP was added.';
    }
  }

  function drawBackground(time) {
    const ctx = runtime.ctx;
    const { w, h } = runtime.view;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#071a2e');
    g.addColorStop(1, '#0a1020');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(56,189,248,.08)';
    ctx.lineWidth = 1;
    const grid = 34;
    const drift = (time * .012) % grid;
    for (let x = -grid + drift; x < w + grid; x += grid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += grid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  function targetColors(type) {
    if (type === 'bonus') return ['#fbbf24', '#f59e0b', '#fff7cc'];
    if (type === 'fast') return ['#fb7185', '#e11d48', '#fff1f2'];
    if (type === 'safe') return ['#34d399', '#059669', '#ecfdf5'];
    return ['#60a5fa', '#2563eb', '#eff6ff'];
  }

  function drawTarget(target) {
    const ctx = runtime.ctx;
    const lifeLeft = clamp(1 - target.age / target.life, 0, 1);
    const scale = Math.min(1, target.pop) * (lifeLeft < .2 ? .86 + lifeLeft * .7 : 1);
    const r = target.r * scale;
    const [outer, inner, text] = targetColors(target.type);
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.shadowColor = outer;
    ctx.shadowBlur = 18;
    ctx.fillStyle = inner;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = outer;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, r * .86, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const isText = target.label.length > 2;
    ctx.font = `900 ${isText ? Math.max(12, r * .5) : Math.max(18, r * .8)}px system-ui, sans-serif`;
    ctx.fillText(target.label, 0, 1);
    ctx.strokeStyle = 'rgba(255,255,255,.32)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lifeLeft);
    ctx.stroke();
    ctx.restore();
  }

  function drawFx() {
    const ctx = runtime.ctx;
    runtime.fx.forEach(item => {
      const t = clamp(item.age / item.life, 0, 1);
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = item.good ? '#fde68a' : '#fecaca';
      ctx.textAlign = 'center';
      ctx.font = '900 14px system-ui, sans-serif';
      ctx.fillText(item.text, item.x, item.y - t * 46);
      ctx.restore();
    });
  }

  function drawCountdown() {
    if (runtime.state !== 'countdown') return;
    const ctx = runtime.ctx;
    const { w, h } = runtime.view;
    const n = runtime.countdown > 0.5 ? Math.ceil(runtime.countdown) : 'GO!';
    ctx.save();
    ctx.fillStyle = 'rgba(2,6,23,.42)';
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = `950 ${clamp(Math.min(w, h) * .15, 48, 84)}px system-ui, sans-serif`;
    ctx.fillText(String(n), w / 2, h / 2);
    ctx.restore();
  }

  function render(time) {
    drawBackground(time);
    runtime.targets.forEach(drawTarget);
    drawFx();
    drawCountdown();
  }

  function frame(time) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const dt = clamp((time - (runtime.lastFrame || time)) / 1000, 0, .05);
    runtime.lastFrame = time;
    update(dt);
    render(time);
    runtime.raf = requestAnimationFrame(frame);
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
    document.body.classList.remove('bug-smash-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    runtime.targets = [];
    runtime.fx = [];
    runtime.state = 'ready';
    runtime.round = null;
    runtime.pausePanel.hidden = true;
    runtime.overPanel.hidden = true;
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snapshot = runtime.bridge?.getSnapshot?.() || {};
    runtime.soundEnabled = snapshot.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.bestVisible = Math.max(0, Number(snapshot.gameRecords?.bugSmash?.bestScore || snapshot.bestScores?.bugSmash || 0));
    runtime.open = true;
    runtime.overlay.hidden = false;
    document.body.classList.add('bug-smash-active');
    requestAnimationFrame(() => {
      resizeCanvas();
      resetReady();
      if (!runtime.raf) runtime.raf = requestAnimationFrame(frame);
    });
  }

  window.ICT8BugSmash = Object.freeze({
    open,
    close: closeInternal,
    isOpen: () => runtime.open
  });
})();
