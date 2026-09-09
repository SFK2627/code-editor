(() => {
  'use strict';

  const GAME_ID = 'color-switch-byte';
  const MAX_DPR = 2;
  const COLORS = ['#22d3ee', '#f43f5e', '#facc15', '#a78bfa'];
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
    comboEl: null,
    colorEl: null,
    finalScore: null,
    finalBest: null,
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
    ball: { x: 0, worldY: 0, vy: 0, radius: 11, colorIndex: 0 },
    cameraY: 0,
    rings: [],
    score: 0,
    combo: 0,
    bestCombo: 0,
    bestVisible: 0,
    round: null,
    soundEnabled: true,
    audioContext: null,
    startedAt: 0,
    input: {
      pressed: false,
      pointerId: null,
      pressStartedAt: 0,
      holdSeconds: 0,
      power: 0,
      hasStartedMotion: false,
      keyboardHeld: false
    }
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'colorSwitchByteOverlay';
    overlay.className = 'xp-games-game-overlay color-switch-byte-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Color Switch Byte mini-game');
    overlay.innerHTML = `
      <section class="color-switch-byte-shell">
        <canvas class="color-switch-byte-canvas" tabindex="-1" aria-label="COLOR SWITCH BYTE gameplay area"></canvas>
        <div class="color-switch-byte-topbar">
          <button type="button" data-color-switch-byte-back>&larr; MINI-GAMES</button>
          <button type="button" data-color-switch-byte-sound aria-label="Toggle sound">&#128266;</button>
          <button type="button" data-color-switch-byte-pause-button aria-label="Pause COLOR SWITCH BYTE">II</button>
          <button type="button" data-color-switch-byte-close aria-label="Close COLOR SWITCH BYTE">&times;</button>
        </div>
        <div class="color-switch-byte-hud">
          <div><small>SCORE</small><strong data-color-switch-byte-score>0</strong></div>
          <div><small>COMBO</small><strong data-color-switch-byte-combo>x0</strong></div>
          <div><small>BYTE COLOR</small><strong data-color-switch-byte-color>CYAN</strong></div>
        </div>
        <div class="color-switch-byte-fx" data-color-switch-byte-fx></div>

        <div class="color-switch-byte-panel" data-color-switch-byte-ready>
          <div class="color-switch-byte-panel-card">
            <span class="color-switch-byte-hero">&#128993;</span>
            <h2>COLOR SWITCH BYTE</h2>
            <p>Control the lift: quick tap for a small hop, hold briefly for a stronger boost. Pass only through your matching color.</p>
            <div class="color-switch-byte-help">Quick Tap = HOP &middot; Hold = BOOST</div>
            <button class="primary" type="button" data-color-switch-byte-start>START</button>
          </div>
        </div>

        <div class="color-switch-byte-panel" data-color-switch-byte-pause-panel hidden>
          <div class="color-switch-byte-panel-card">
            <h2>PAUSED</h2>
            <p>Your byte is frozen safely.</p>
            <button class="primary" type="button" data-color-switch-byte-resume>RESUME</button>
          </div>
        </div>

        <div class="color-switch-byte-panel" data-color-switch-byte-over hidden>
          <div class="color-switch-byte-panel-card">
            <h2>GAME OVER</h2>
            <div class="color-switch-byte-stats">
              <div><small>Score</small><strong data-color-switch-byte-final-score>0</strong></div>
              <div><small>Best</small><strong data-color-switch-byte-final-best>0</strong></div>
              <div><small>Highest Combo</small><strong data-color-switch-byte-final-combo>x0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-color-switch-byte-final-xp>+0</strong></div>
            </div>
            <p class="color-switch-byte-reward-note" data-color-switch-byte-reward-note>Checking reward...</p>
            <div class="color-switch-byte-actions">
              <button class="primary" type="button" data-color-switch-byte-again>PLAY AGAIN</button>
              <button type="button" data-color-switch-byte-hub>MINI-GAMES</button>
              <button type="button" data-color-switch-byte-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.color-switch-byte-shell');
    runtime.canvas = overlay.querySelector('.color-switch-byte-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false });
    runtime.readyPanel = overlay.querySelector('[data-color-switch-byte-ready]');
    runtime.pausePanel = overlay.querySelector('[data-color-switch-byte-pause-panel]');
    runtime.overPanel = overlay.querySelector('[data-color-switch-byte-over]');
    runtime.scoreEl = overlay.querySelector('[data-color-switch-byte-score]');
    runtime.comboEl = overlay.querySelector('[data-color-switch-byte-combo]');
    runtime.colorEl = overlay.querySelector('[data-color-switch-byte-color]');
    runtime.finalScore = overlay.querySelector('[data-color-switch-byte-final-score]');
    runtime.finalBest = overlay.querySelector('[data-color-switch-byte-final-best]');
    runtime.finalCombo = overlay.querySelector('[data-color-switch-byte-final-combo]');
    runtime.finalXp = overlay.querySelector('[data-color-switch-byte-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-color-switch-byte-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-color-switch-byte-sound]');
    runtime.pauseBtn = overlay.querySelector('[data-color-switch-byte-pause-button]');
    runtime.fxEl = overlay.querySelector('[data-color-switch-byte-fx]');

    overlay.querySelector('[data-color-switch-byte-start]').addEventListener('click', startRound);
    overlay.querySelector('[data-color-switch-byte-resume]').addEventListener('click', resume);
    overlay.querySelector('[data-color-switch-byte-again]').addEventListener('click', resetReady);
    overlay.querySelector('[data-color-switch-byte-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-color-switch-byte-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-color-switch-byte-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-color-switch-byte-close-result]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.pauseBtn.addEventListener('click', () => runtime.state === 'playing' ? pause() : resume());
    runtime.canvas.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (runtime.state !== 'playing') return;
      try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
      beginLift(event.pointerId);
    });
    runtime.canvas.addEventListener('pointerup', event => {
      event.preventDefault();
      endLift(event.pointerId);
    });
    runtime.canvas.addEventListener('pointercancel', event => {
      event.preventDefault();
      endLift(event.pointerId, true);
    });
    runtime.canvas.addEventListener('lostpointercapture', event => {
      endLift(event.pointerId, true);
    });
    document.addEventListener('keydown', event => {
      if (!runtime.open || runtime.state !== 'playing' || event.code !== 'Space' || event.repeat) return;
      if (event.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(event.target.tagName || '')) return;
      event.preventDefault();
      runtime.input.keyboardHeld = true;
      beginLift('keyboard');
    });
    document.addEventListener('keyup', event => {
      if (!runtime.open || event.code !== 'Space' || !runtime.input.keyboardHeld) return;
      event.preventDefault();
      runtime.input.keyboardHeld = false;
      endLift('keyboard');
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
      flap: [380, 560, 0.055, 0.035],
      switch: [520, 820, 0.075, 0.045],
      pass: [660, 940, 0.075, 0.05],
      over: [180, 65, 0.22, 0.06]
    };
    const item = table[kind] || table.flap;
    osc.type = kind === 'over' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(item[0], now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, item[1]), now + item[2]);
    gain.gain.setValueAtTime(item[3], now);
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
    runtime.ball.x = w / 2;
    runtime.ball.radius = clamp(w * 0.022, 9, 12);
  }

  function colorName(index) {
    return ['CYAN', 'RED', 'YELLOW', 'VIOLET'][index % COLORS.length];
  }

  function updateHud() {
    runtime.scoreEl.textContent = String(runtime.score);
    runtime.comboEl.textContent = `x${runtime.combo}`;
    runtime.colorEl.textContent = colorName(runtime.ball.colorIndex);
    runtime.colorEl.style.color = COLORS[runtime.ball.colorIndex];
  }

  function resetReady() {
    runtime.state = 'ready';
    runtime.score = 0;
    runtime.combo = 0;
    runtime.bestCombo = 0;
    runtime.rings = [];
    runtime.ball.worldY = 0;
    runtime.ball.vy = 0;
    runtime.ball.colorIndex = 0;
    runtime.cameraY = 0;
    runtime.round = null;
    runtime.startedAt = 0;
    resetLiftInput();
    runtime.readyPanel.hidden = false;
    runtime.pausePanel.hidden = true;
    runtime.overPanel.hidden = true;
    runtime.pauseBtn.textContent = 'II';
    seedRings();
    updateHud();
  }

  function startRound() {
    if (!runtime.open) return;
    runtime.score = 0;
    runtime.combo = 0;
    runtime.bestCombo = 0;
    runtime.ball.worldY = 0;
    runtime.ball.vy = 0;
    runtime.ball.colorIndex = Math.floor(Math.random() * COLORS.length);
    runtime.cameraY = 0;
    runtime.rings = [];
    runtime.startedAt = performance.now();
    resetLiftInput();
    seedRings();
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
    updateHud();
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
  }

  function seedRings() {
    let y = 235;
    for (let i = 0; i < 4; i += 1) {
      runtime.rings.push(makeRing(y, i));
      y += 255;
    }
  }

  function makeRing(worldY, indexSeed = 0) {
    const required = (runtime.ball.colorIndex + indexSeed + 1 + Math.floor(Math.random() * 3)) % COLORS.length;
    let other = Math.floor(Math.random() * COLORS.length);
    if (other === required) other = (other + 1) % COLORS.length;
    const direction = Math.random() < 0.5 ? -1 : 1;
    const scoreFactor = Math.min(1.3, runtime.score * 0.018);
    return {
      worldY,
      radius: clamp(runtime.view.w * 0.105, 42, 62),
      width: clamp(runtime.view.w * 0.026, 12, 17),
      rotation: Math.random() * Math.PI * 2,
      speed: direction * (0.62 + scoreFactor + Math.random() * 0.28),
      required,
      other,
      switched: false,
      entered: false,
      safe: false,
      passed: false
    };
  }

  function ensureRingsAhead() {
    const highest = runtime.rings.reduce((max, ring) => Math.max(max, ring.worldY), 0);
    let next = highest || 235;
    while (next < runtime.ball.worldY + 1050) {
      next += clamp(255 - runtime.score * 1.5, 205, 255);
      runtime.rings.push(makeRing(next, runtime.rings.length));
    }
    runtime.rings = runtime.rings.filter(ring => ring.worldY > runtime.cameraY - 260);
  }

  function resetLiftInput() {
    runtime.input.pressed = false;
    runtime.input.pointerId = null;
    runtime.input.pressStartedAt = 0;
    runtime.input.holdSeconds = 0;
    runtime.input.power = 0;
    runtime.input.hasStartedMotion = false;
    runtime.input.keyboardHeld = false;
  }

  // Variable-height lift: a quick tap makes a small, precise hop while a
  // short hold sustains upward momentum. This is duration-based rather than
  // device pressure because touch-pressure data is not reliable across phones.
  function beginLift(pointerId) {
    if (runtime.state !== 'playing') return;
    if (runtime.input.pressed) return;
    runtime.input.pressed = true;
    runtime.input.pointerId = pointerId;
    runtime.input.pressStartedAt = performance.now();
    runtime.input.holdSeconds = 0;
    runtime.input.power = 0.16;
    runtime.input.hasStartedMotion = true;

    // Immediate response, but deliberately much softer than the old fixed 440+.
    // If already moving upward, do not stack an absurd amount of velocity.
    runtime.ball.vy = Math.max(runtime.ball.vy, 320);
    tone('flap');
  }

  function endLift(pointerId, cancelled = false) {
    if (!runtime.input.pressed) return;
    if (runtime.input.pointerId !== pointerId && pointerId !== 'keyboard') return;
    const held = runtime.input.holdSeconds;
    runtime.input.pressed = false;
    runtime.input.pointerId = null;

    if (!cancelled && runtime.state === 'playing' && runtime.ball.vy > 0) {
      // Classic variable-jump "cut": releasing early removes more upward
      // momentum; a longer hold preserves it. This creates HOP/LIFT/BOOST.
      let releaseFactor = 1;
      if (held < 0.07) releaseFactor = 0.65;
      else if (held < 0.14) releaseFactor = 0.82;
      else if (held < 0.22) releaseFactor = 0.94;
      runtime.ball.vy *= releaseFactor;
    }
    runtime.input.power = 0;
  }

  function updateLift(dt) {
    if (!runtime.input.pressed || runtime.state !== 'playing') return;
    const MAX_HOLD = 0.23;
    runtime.input.holdSeconds += dt;
    const activeHold = Math.min(runtime.input.holdSeconds, MAX_HOLD);
    runtime.input.power = clamp(activeHold / MAX_HOLD, 0.16, 1);

    // Sustained lift only during the first ~230ms. Holding forever cannot float.
    if (runtime.input.holdSeconds <= MAX_HOLD) {
      const liftAcceleration = 620;
      runtime.ball.vy = Math.min(470, runtime.ball.vy + liftAcceleration * dt);
    }
  }

  function pause() {
    if (runtime.state !== 'playing') return;
    endLift(runtime.input.pointerId, true);
    runtime.state = 'paused';
    runtime.pausePanel.hidden = false;
    runtime.pauseBtn.textContent = '>';
  }

  function resume() {
    if (runtime.state !== 'paused') return;
    runtime.state = 'playing';
    runtime.pausePanel.hidden = true;
    runtime.pauseBtn.textContent = 'II';
    runtime.lastFrame = performance.now();
    try { runtime.canvas.focus({ preventScroll: true }); } catch (_) {}
  }

  function showFx(text, level = '') {
    runtime.fxEl.textContent = text;
    runtime.fxEl.className = `color-switch-byte-fx ${level}`.trim();
    void runtime.fxEl.offsetWidth;
    runtime.fxEl.classList.add('show');
  }

  function ringSegmentColor(ring, angle) {
    const quarter = Math.PI / 2;
    let normalized = angle - ring.rotation;
    normalized %= Math.PI * 2;
    if (normalized < 0) normalized += Math.PI * 2;
    const segment = Math.floor(normalized / quarter) % 4;
    return segment % 2 === 0 ? ring.required : ring.other;
  }

  // Return the real arc of the ring currently occupied by the byte.
  // The old implementation checked only once, on first contact, so a rotating
  // wrong-color segment could move into the byte afterwards without killing it.
  function getRingContact(ring, dy) {
    const radialDistance = Math.abs(dy);
    const ringMidRadius = ring.radius;
    // Treat the ring stroke as physical thickness and give ~1px forgiveness so
    // a barely-visible anti-aliased touch does not feel unfair on phones.
    const effectiveReach = Math.max(1, runtime.ball.radius + ring.width * 0.5 - 1.15);
    const penetration = effectiveReach - Math.abs(radialDistance - ringMidRadius);
    if (penetration <= 0 || radialDistance <= 0.001) {
      return { touching: false, unsafe: false, penetration: 0 };
    }

    // Canvas angles: +PI/2 is the bottom of the ring, -PI/2 is the top.
    // World Y grows upward, so a byte below the ring touches its bottom edge.
    const contactAngle = dy < 0 ? Math.PI / 2 : -Math.PI / 2;
    const denom = 2 * ringMidRadius * radialDistance;
    let halfSpan = 0;
    if (denom > 0.0001) {
      const cosine = clamp(
        (ringMidRadius * ringMidRadius + radialDistance * radialDistance - effectiveReach * effectiveReach) / denom,
        -1,
        1
      );
      halfSpan = Math.acos(cosine);
    }

    // Ignore the outermost few degrees of contact. This preserves strict color
    // collision while preventing deaths from a 1px segment-boundary graze.
    const fairHalfSpan = Math.max(0, halfSpan - 0.028);
    const samples = fairHalfSpan > 0.015
      ? [-0.82, -0.48, 0, 0.48, 0.82].map(factor => contactAngle + fairHalfSpan * factor)
      : [contactAngle];

    const wrongSamples = samples.reduce((count, angle) => (
      count + (ringSegmentColor(ring, angle) === runtime.ball.colorIndex ? 0 : 1)
    ), 0);
    const centerWrong = ringSegmentColor(ring, contactAngle) !== runtime.ball.colorIndex;

    // A meaningful collision with a wrong center OR a clearly overlapping wrong
    // arc is fatal. Re-evaluated every frame so rotating colors cannot ghost through.
    const meaningfulContact = penetration > 0.9;
    const unsafe = meaningfulContact && (centerWrong || wrongSamples >= 2);
    return { touching: true, unsafe, penetration };
  }

  function updateRings(dt) {
    for (const ring of runtime.rings) {
      ring.rotation += ring.speed * dt;
      const switchY = ring.worldY - ring.radius - 78;
      if (!ring.switched && runtime.ball.worldY >= switchY) {
        ring.switched = true;
        runtime.ball.colorIndex = ring.required;
        tone('switch');
        showFx(`COLOR: ${colorName(ring.required)}`, 'switch');
        updateHud();
      }

      const dy = runtime.ball.worldY - ring.worldY;
      const contact = getRingContact(ring, dy);

      // IMPORTANT: validate throughout the ENTIRE contact, not only the frame
      // where the byte first enters the ring stroke. The ring keeps rotating.
      if (contact.touching) {
        ring.entered = true;
        ring.safe = !contact.unsafe;
        if (contact.unsafe) {
          runtime.combo = 0;
          updateHud();
          showFx('WRONG COLOR!', 'hot');
          finishRound();
          return;
        }
      } else if (ring.entered) {
        ring.entered = false;
        ring.safe = false;
      }

      if (!ring.passed && runtime.ball.worldY > ring.worldY + ring.radius + runtime.ball.radius + 10) {
        ring.passed = true;
        runtime.score += 1;
        runtime.combo += 1;
        runtime.bestCombo = Math.max(runtime.bestCombo, runtime.combo);
        tone('pass');
        if (runtime.combo % 10 === 0) showFx(`BYTE COMBO x${runtime.combo}`, 'hot');
        else if (runtime.combo % 5 === 0) showFx(`COMBO x${runtime.combo}`, 'pass');
        else showFx('+1', 'pass');
        updateHud();
      }
    }
  }

  function update(dt) {
    if (runtime.state !== 'playing') return;

    // Do not auto-launch or auto-drop before the player's first press. The old
    // version started with vy=390, which made every round feel overpowered.
    if (!runtime.input.hasStartedMotion) return;

    updateLift(dt);
    // Keep the core feel consistent as score rises; difficulty should come
    // mostly from faster rings / tighter spacing, not wildly changing gravity.
    const gravity = clamp(960 + runtime.score * 0.6, 960, 1020);
    runtime.ball.vy -= gravity * dt;
    runtime.ball.worldY += runtime.ball.vy * dt;

    const cameraTarget = runtime.ball.worldY - runtime.view.h * 0.30;
    if (cameraTarget > runtime.cameraY) runtime.cameraY += (cameraTarget - runtime.cameraY) * clamp(dt * 5.5, 0, 1);

    ensureRingsAhead();
    updateRings(dt);
    if (runtime.state !== 'playing') return;

    if (runtime.ball.worldY < runtime.cameraY - runtime.view.h * 0.32) {
      finishRound();
    }
  }

  function screenY(worldY) {
    return runtime.view.h * 0.74 - (worldY - runtime.cameraY);
  }

  function drawBackground(time) {
    const ctx = runtime.ctx;
    const w = runtime.view.w;
    const h = runtime.view.h;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#09172b');
    gradient.addColorStop(1, '#060817');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(167,139,250,.06)';
    ctx.lineWidth = 1;
    const gap = 42;
    const shift = (time * 0.02) % gap;
    for (let y = -gap + shift; y < h + gap; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawRing(ring) {
    const ctx = runtime.ctx;
    const x = runtime.view.w / 2;
    const y = screenY(ring.worldY);
    if (y < -ring.radius - 40 || y > runtime.view.h + ring.radius + 40) return;
    const quarter = Math.PI / 2;
    ctx.save();
    ctx.lineCap = 'butt';
    ctx.lineWidth = ring.width;
    ctx.shadowBlur = 8;
    for (let i = 0; i < 4; i += 1) {
      const colorIndex = i % 2 === 0 ? ring.required : ring.other;
      ctx.strokeStyle = COLORS[colorIndex];
      ctx.shadowColor = COLORS[colorIndex];
      ctx.beginPath();
      ctx.arc(x, y, ring.radius, ring.rotation + i * quarter + 0.02, ring.rotation + (i + 1) * quarter - 0.02);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(226,232,240,.72)';
    ctx.font = '900 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MATCH', x, y + 3);
    ctx.restore();

    const switchY = screenY(ring.worldY - ring.radius - 78);
    if (!ring.switched && switchY > -30 && switchY < runtime.view.h + 30) {
      ctx.save();
      ctx.fillStyle = COLORS[ring.required];
      ctx.shadowColor = COLORS[ring.required];
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, switchY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawLiftMeter() {
    if (runtime.state !== 'playing') return;
    const ctx = runtime.ctx;
    const w = runtime.view.w;
    const h = runtime.view.h;
    const meterW = clamp(w * 0.28, 92, 142);
    const meterH = 7;
    const x = (w - meterW) / 2;
    const y = h - 34;
    const power = runtime.input.pressed ? runtime.input.power : 0;

    ctx.save();
    ctx.fillStyle = 'rgba(2,6,23,.62)';
    ctx.beginPath();
    ctx.roundRect(x - 8, y - 17, meterW + 16, 31, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(226,232,240,.78)';
    ctx.font = '800 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(runtime.input.pressed ? (power < 0.38 ? 'HOP' : power < 0.72 ? 'LIFT' : 'BOOST') : 'TAP / HOLD', w / 2, y - 6);
    ctx.fillStyle = 'rgba(148,163,184,.24)';
    ctx.beginPath();
    ctx.roundRect(x, y, meterW, meterH, 4);
    ctx.fill();
    if (power > 0) {
      const grad = ctx.createLinearGradient(x, 0, x + meterW, 0);
      grad.addColorStop(0, '#22d3ee');
      grad.addColorStop(0.58, '#facc15');
      grad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, meterW * power, meterH, 4);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBall() {
    const ctx = runtime.ctx;
    const x = runtime.view.w / 2;
    const y = screenY(runtime.ball.worldY);
    const r = runtime.ball.radius;
    ctx.save();
    ctx.fillStyle = COLORS[runtime.ball.colorIndex];
    ctx.shadowColor = COLORS[runtime.ball.colorIndex];
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.font = `900 ${Math.max(8, r * 0.8)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('01', x, y + 0.5);
    ctx.restore();
  }

  function render(now) {
    drawBackground(now);
    runtime.rings.forEach(drawRing);
    drawBall();
    drawLiftMeter();
  }

  function frame(now) {
    runtime.raf = 0;
    if (!runtime.open) return;
    const dt = clamp((now - (runtime.lastFrame || now)) / 1000, 0, 0.034);
    runtime.lastFrame = now;
    update(dt);
    render(now);
    runtime.raf = requestAnimationFrame(frame);
  }

  async function finishRound() {
    if (runtime.state !== 'playing') return;
    endLift(runtime.input.pointerId, true);
    runtime.state = 'gameover';
    tone('over');
    runtime.finalScore.textContent = String(runtime.score);
    runtime.finalBest.textContent = String(Math.max(runtime.bestVisible, runtime.score));
    runtime.finalCombo.textContent = `x${runtime.bestCombo}`;
    runtime.finalXp.textContent = '+0';
    runtime.rewardNote.className = 'color-switch-byte-reward-note';
    runtime.rewardNote.textContent = runtime.round ? 'Checking reward...' : 'Practice run - account reward unavailable.';
    runtime.overPanel.hidden = false;

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, {
        score: runtime.score,
        metrics: {
          passes: runtime.score,
          bestCombo: runtime.bestCombo,
          durationMs: Math.max(0, performance.now() - runtime.startedAt)
        }
      });
      const rec = result?.gameRecord || result?.gameRecords?.colorSwitchByte || {};
      runtime.bestVisible = Math.max(runtime.bestVisible, Number(rec.bestScore || 0), Number(result?.bestScore || 0));
      runtime.finalBest.textContent = String(runtime.bestVisible);
      runtime.finalXp.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))}`;
      if (result?.loginRequired) {
        runtime.rewardNote.className = 'color-switch-byte-reward-note warn';
        runtime.rewardNote.textContent = 'Practice mode - log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.rewardNote.className = 'color-switch-byte-reward-note warn';
        runtime.rewardNote.textContent = 'XP could not sync. No account XP was added.';
      } else if (result?.capReached && Number(result.awardedXp || 0) === 0) {
        runtime.rewardNote.className = 'color-switch-byte-reward-note warn';
        runtime.rewardNote.textContent = 'Daily Mini-Game XP limit reached. Keep switching for records!';
      } else {
        runtime.rewardNote.className = 'color-switch-byte-reward-note success';
        runtime.rewardNote.textContent = Number(result?.awardedXp || 0) > 0
          ? `Reward added safely - Today's Game XP: ${result.todayXp}/${result.dailyCap}`
          : 'No XP tier reached this run yet.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.rewardNote.className = 'color-switch-byte-reward-note warn';
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
    document.body.classList.remove('color-switch-byte-active');
    if (runtime.raf) cancelAnimationFrame(runtime.raf);
    runtime.raf = 0;
    runtime.state = 'ready';
    runtime.round = null;
    resetLiftInput();
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
    runtime.bestVisible = Math.max(0, Number(snap.gameRecords?.colorSwitchByte?.bestScore || snap.bestScores?.colorSwitchByte || 0));
    runtime.open = true;
    runtime.overlay.hidden = false;
    document.body.classList.add('color-switch-byte-active');
    requestAnimationFrame(() => {
      resizeCanvas();
      resetReady();
      if (!runtime.raf) runtime.raf = requestAnimationFrame(frame);
    });
  }

  window.ICT8ColorSwitchByte = Object.freeze({
    open,
    close: closeInternal,
    isOpen: () => runtime.open
  });
})();
