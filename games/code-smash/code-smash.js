(() => {
  'use strict';

  const GAME_ID = 'code-smash';
  const PREFIX = 'CSM1';
  const GLOBAL_NAME = 'ICT8CodeSmash';
  const WORLD_W = 900;
  const WORLD_H = 1100;
  const GRAVITY = 5.25;
  const TABLE_HALF_X = 0.92;
  const TABLE_HALF_Y = 1.04;
  const NET_H = 0.22;
  const PADDLE_RADIUS_X = 0.275;
  const PADDLE_RADIUS_Y = 0.225;
  const PADDLE_NEAR_MIN_Y = 0.52;
  const PADDLE_NEAR_MAX_Y = 1.17;
  const BALL_MISS_Y = 1.38;
  const SNAPSHOT_MS = 48;
  const INPUT_SEND_MS = 38;
  const SHOT_INTENT_HOLD_MS = 300;
  const SHOT_TARGET_X = .82;

  const AI_LEVELS = Object.freeze({
    easy: Object.freeze({ label: 'EASY', maxSpeed: 1.18, depthSpeed: .72, reaction: .25, jitter: .18, shotBoost: .94, missChance: .15, copy: 'Slower reactions, wider positioning errors, and occasional misses.' }),
    normal: Object.freeze({ label: 'NORMAL', maxSpeed: 1.72, depthSpeed: .92, reaction: .14, jitter: .08, shotBoost: 1.00, missChance: .055, copy: 'Balanced tracking, realistic recovery, and fair shot speed.' }),
    hard: Object.freeze({ label: 'HARD', maxSpeed: 2.22, depthSpeed: 1.15, reaction: .075, jitter: .025, shotBoost: 1.06, missChance: .015, copy: 'Fast recovery and tighter prediction without reading your input.' })
  });
  const MATCH_TYPES = Object.freeze({
    7: Object.freeze({ label: 'QUICK 7', copy: 'First to 7 points, win by 2.' }),
    11: Object.freeze({ label: 'CLASSIC 11', copy: 'First to 11 points, win by 2.' })
  });

  const P = () => window.ICT8ZeroDbP2P;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
  const lerp = (a, b, t) => a + (b - a) * t;
  const otherSide = side => side === 'h' ? 'g' : 'h';

  const r = {
    built: false, open: false, overlay: null, panels: {}, state: 'home', bridge: null, music: null,
    onBack: null, onClose: null, session: null, invites: null, scannerStop: null,
    role: '', localName: 'PLAYER 1', remoteName: 'PLAYER 2', hostCode: '', answerCode: '', seed: 1,
    config: { target: 7 }, configReceived: false, localReady: false, remoteReady: false,
    localNextReady: false, remoteNextReady: false, paused: false, remotePaused: false, exitPaused: false,
    pauseStartedAt: 0, game: null, raf: 0, lastFrameAt: 0, lastSnapshotAt: 0, lastInputSentAt: 0,
    localInput: { x: 0, y: .90, vx: 0, vy: 0, pointerDown: false, lastX: 0, lastY: .90, lastAt: 0, shotAim: 0, shotPower: .42, shotStyle: 'DRIVE', intentAt: 0 }, keys: { left: false, right: false, up: false, down: false },
    netTarget: null, netReceivedAt: 0, aiDifficulty: 'normal', aiTargetX: 0, aiThinkAt: 0,
    audio: null, soundEnabled: true, resultShown: false, ballTrail: [], trailStamp: 0, effects: [],
    resizeObserver: null, canvasRect: null, reducedMotion: false, countdownActive: false
  };

  const $ = selector => r.overlay?.querySelector(selector) || null;
  const $$ = selector => Array.from(r.overlay?.querySelectorAll(selector) || []);
  const localSide = () => r.role === 'guest' ? 'g' : 'h';
  const remoteSide = () => otherSide(localSide());
  const isSolo = () => r.role === 'solo';
  const isAuthority = () => r.role === 'host' || r.role === 'solo';

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function build() {
    if (r.built) return;
    const overlay = document.createElement('div');
    overlay.className = 'p2p0-overlay smash-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Smash solo or live two-player table tennis game');
    overlay.innerHTML = `
      <section class="p2p0-shell smash-shell">
        <header class="p2p0-top">
          <button type="button" data-back>← MINI-GAMES</button>
          <div class="p2p0-brand"><span>🏓</span><div><small>SOLO / 1V1 · NO XP</small><strong>CODE SMASH</strong></div></div>
          <div class="p2p0-top-actions"><button type="button" data-sound aria-label="Toggle game sound">🔊</button><button type="button" data-close aria-label="Close Code Smash">×</button></div>
        </header>
        <main class="p2p0-main smash-main">
          <section class="p2p0-panel active" data-panel="home">
            <div class="p2p0-card p2p0-home-card smash-home-card">
              <div class="smash-hero" aria-hidden="true"><span>🏓</span><i></i></div>
              <h1>CODE SMASH</h1>
              <p>Real table-tennis logic with legal serves, one-bounce returns, a movable 2D paddle, clear return guides, satisfying smashes, and direct live 1v1.</p>
              <div class="p2p0-badges"><span>🤖 SOLO</span><span>👥 LIVE 1V1</span><span>🎯 LANDING GUIDE</span><span>0 XP</span></div>
              <div class="smash-choice-grid">
                <button class="smash-choice primary" type="button" data-solo><span>🤖</span><div><strong>PLAY SOLO</strong><small>Face the Code Bot. Easy, Normal, or Hard.</small></div></button>
                <button class="smash-choice" type="button" data-multiplayer><span>⚔️</span><div><strong>1V1 MULTIPLAYER</strong><small>Use the same Create / Join pairing flow as the other 2P games.</small></div></button>
              </div>
              <small class="p2p0-note">Drag anywhere on your half to move the paddle left/right and closer/farther. Let the ball bounce once, then meet it with the racket.</small>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="solo">
            <div class="p2p0-card p2p0-pair-card smash-setup-card">
              <div class="p2p0-step-head"><span>SOLO</span><strong>Play against the Code Bot</strong></div>
              <div class="smash-settings">
                <label><span>AI DIFFICULTY</span><select data-ai-difficulty><option value="easy">Easy</option><option value="normal" selected>Normal</option><option value="hard">Hard</option></select></label>
                <div class="smash-ai-copy" data-ai-copy></div>
                <label><span>MATCH TYPE</span><select data-solo-target><option value="7">Quick 7</option><option value="11">Classic 11</option></select></label>
              </div>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME</span><input data-solo-name maxlength="20" autocomplete="nickname" value="PLAYER 1"></label>
              <button class="p2p0-btn primary" type="button" data-start-solo>START SOLO MATCH</button>
              <div class="p2p0-status">The bot and ball physics run locally. No room or second device required.</div>
              <button class="p2p0-btn smash-cancel" type="button" data-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="multi">
            <div class="p2p0-card p2p0-home-card smash-multi-card">
              <span class="smash-lobby-icon">🏓</span><h2>1V1 MULTIPLAYER</h2>
              <p>Same existing G8Code 2P pairing: Player 1 creates/invites, Player 2 joins/scans, then gameplay runs on the direct WebRTC channel.</p>
              <div class="p2p0-actions p2p0-home-actions"><button class="p2p0-btn primary" type="button" data-host>CREATE / INVITE</button><button class="p2p0-btn" type="button" data-join>JOIN / SCAN QR</button></div>
              <small class="p2p0-note">Student ID invite · QR/share fallback · direct gameplay · 0 XP.</small>
              <button class="p2p0-btn smash-cancel" type="button" data-pair-cancel>BACK</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="host">
            <div class="p2p0-card p2p0-pair-card">
              <div class="p2p0-step-head"><span>HOST</span><strong>Create a direct match</strong></div>
              <div class="smash-settings compact"><label><span>MATCH TYPE</span><select data-host-target><option value="7">Quick 7</option><option value="11">Classic 11</option></select></label><div class="smash-match-help" data-host-match-help></div></div>
              <label class="p2p0-field"><span>Your display name</span><input data-host-name maxlength="20" autocomplete="nickname" value="PLAYER 1"></label>
              <div class="p2p0-method-card"><span class="p2p0-method-icon">📷</span><div><strong>QR / SHARE PAIRING</strong><small>Scan or share with Player 2</small></div></div>
              <button class="p2p0-btn" data-make-offer>CREATE HOST QR</button>
              <div class="p2p0-qr-block" data-host-qr-wrap hidden><img data-host-qr alt="CODE SMASH Host QR Code"><strong>PLAYER 2: SCAN THIS QR</strong><small>Then scan Player 2's response QR.</small><div class="p2p0-inline-actions"><button class="p2p0-btn" data-share-offer>SHARE INVITE</button><button class="p2p0-btn" data-copy-offer>COPY CODE</button></div><button class="p2p0-btn primary" data-scan-answer>SCAN RESPONSE QR</button><details class="p2p0-advanced"><summary>Manual paste fallback</summary><label class="p2p0-field"><span>Player 2 Response Code</span><textarea spellcheck="false" data-answer-input placeholder="Paste the RESPONSE CODE here"></textarea></label><button class="p2p0-btn" data-apply-answer>CONNECT PLAYER 2</button></details></div>
              <div class="p2p0-status" data-host-status>Choose Student ID invite or QR pairing.</div>
              <button class="p2p0-btn ghost smash-cancel" type="button" data-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="guest">
            <div class="p2p0-card p2p0-pair-card">
              <div class="p2p0-step-head"><span>PLAYER 2</span><strong>Join the Host match</strong></div>
              <label class="p2p0-field"><span>Your display name</span><input data-guest-name maxlength="20" autocomplete="nickname" value="PLAYER 2"></label>
              <div class="p2p0-method-card primary-method"><span class="p2p0-method-icon">📷</span><div><strong>SCAN HOST QR</strong><small>Fastest direct pairing</small></div></div>
              <button class="p2p0-btn primary" data-scan-offer>SCAN HOST QR</button>
              <div class="p2p0-or"><span>OR PASTE</span></div>
              <details class="p2p0-advanced" open><summary>Manual invite code</summary><label class="p2p0-field"><span>Host Invite Code</span><textarea spellcheck="false" data-offer-input placeholder="Paste the HOST CODE here"></textarea></label><button class="p2p0-btn" data-make-answer>CREATE RESPONSE QR</button></details>
              <div class="p2p0-qr-block" data-guest-qr-wrap hidden><img data-guest-qr alt="CODE SMASH Response QR Code"><strong>HOST: SCAN THIS RESPONSE</strong><small>Once Host scans, both devices connect directly.</small><div class="p2p0-inline-actions"><button class="p2p0-btn" data-share-answer>SHARE RESPONSE</button><button class="p2p0-btn" data-copy-answer>COPY RESPONSE</button></div></div>
              <div class="p2p0-status" data-guest-status>Accept a Student ID invite, scan the Host QR, or paste the Host code.</div>
              <button class="p2p0-btn ghost smash-cancel" type="button" data-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="lobby">
            <div class="p2p0-card smash-lobby-card">
              <span class="smash-lobby-icon">🏓</span><h2>MATCH CONNECTED</h2>
              <div class="smash-config-summary" data-config-summary></div>
              <div class="p2p0-lobby-grid"><div class="p2p0-player" data-local-player><small>YOU</small><strong data-local-name>PLAYER</strong></div><div class="p2p0-player" data-remote-player><small>OPPONENT</small><strong data-remote-name>OPPONENT</strong></div></div>
              <button class="p2p0-btn primary" type="button" data-ready>I'M READY</button><div class="p2p0-status" data-lobby-status>Waiting for both players.</div>
            </div>
          </section>

          <section class="p2p0-panel smash-game-panel" data-panel="game">
            <div class="smash-game">
              <div class="smash-hud">
                <div class="smash-player remote"><small>OPPONENT</small><strong data-remote-hud-name>PLAYER 2</strong><b data-remote-score>0</b></div>
                <div class="smash-center-hud"><span data-match-chip>QUICK 7</span><strong data-rally-label>GET READY</strong><small data-serve-label>FIRST TO 7 · WIN BY 2</small></div>
                <div class="smash-player local"><small>YOU</small><strong data-local-hud-name>PLAYER 1</strong><b data-local-score>0</b></div>
              </div>
              <div class="smash-stage">
                <div class="smash-canvas-wrap"><canvas class="smash-canvas" width="900" height="1100" data-canvas aria-label="Code Smash table tennis arena"></canvas><div class="smash-float-callout" data-callout hidden>HIT!</div></div>
              </div>
              <div class="smash-control-strip"><div class="smash-control-copy"><strong data-control-title>DRAG TO MOVE</strong><span data-control-copy>Yellow = bounce. Cyan = contact. At contact: flick left/right to place, push toward the net for power, or pull back gently for a soft drop.</span></div><div class="smash-shot-readout"><b data-shot-direction>↥ CENTER</b><em data-shot-style>DRIVE</em></div><div class="smash-power-wrap"><small data-power-label>NORMAL</small><div class="smash-power"><i data-power-bar></i></div></div></div>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="result">
            <div class="p2p0-card smash-result-card">
              <span class="smash-result-icon" data-result-icon>🏆</span><small>MATCH COMPLETE · 0 XP</small><h2 data-result-title>YOU WIN!</h2><p data-result-sub>Great table control.</p>
              <div class="smash-result-score"><div><small>YOU</small><strong data-result-local>0</strong></div><span>—</span><div><small>OPPONENT</small><strong data-result-remote>0</strong></div></div>
              <div class="smash-result-stats"><span><small>LONGEST RALLY</small><b data-result-rally>0</b></span><span><small>MATCH</small><b data-result-match>QUICK 7</b></span></div>
              <button class="p2p0-btn primary" type="button" data-rematch>REMATCH</button><div class="p2p0-status" data-result-status>Ready for another match.</div><button class="p2p0-btn smash-result-hub" type="button" data-result-hub>MINI-GAMES</button>
            </div>
          </section>

          <div class="p2p0-countdown" data-countdown hidden><strong data-countdown-value>3</strong></div>
          <div class="p2p0-pause" data-pause hidden><div><h2 data-pause-title>MATCH PAUSED</h2><p data-pause-text>Waiting…</p><button class="p2p0-btn primary" type="button" data-resume hidden>CONTINUE</button><div class="p2p0-disconnect-actions" data-disconnect-actions hidden><button class="p2p0-btn primary" type="button" data-disconnect-exit>EXIT MATCH</button><button class="p2p0-btn ghost" type="button" data-disconnect-close>CLOSE GAME</button></div></div></div>
          <div class="p2p0-scanner" data-scanner hidden><div class="p2p0-scanner-card"><div class="p2p0-scan-head"><strong data-scan-title>SCAN QR</strong><button type="button" data-scan-close>×</button></div><div class="p2p0-camera"><video data-scan-video playsinline muted></video></div><p class="p2p0-scan-status" data-scan-status>Point camera at QR.</p></div></div>
        </main>
      </section>`;
    document.body.appendChild(overlay);
    r.overlay = overlay;
    $$('[data-panel]').forEach(panel => { r.panels[panel.dataset.panel] = panel; });

    $('[data-back]').onclick = returnHub;
    $('[data-close]').onclick = () => close(true);
    $('[data-sound]').onclick = toggleSound;
    $('[data-solo]').onclick = () => { show('solo'); renderAiCopy(); };
    $('[data-multiplayer]').onclick = () => show('multi');
    $('[data-host]').onclick = () => show('host');
    $('[data-join]').onclick = () => show('guest');
    $$('[data-pair-cancel]').forEach(button => { button.onclick = cancelPairing; });
    $('[data-start-solo]').onclick = startSoloMatch;
    $('[data-ai-difficulty]').onchange = renderAiCopy;
    $('[data-host-target]').onchange = renderHostMatchHelp;
    $('[data-make-offer]').onclick = createOffer;
    $('[data-make-answer]').onclick = () => createAnswer($('[data-offer-input]')?.value || '');
    $('[data-apply-answer]').onclick = () => applyAnswer($('[data-answer-input]')?.value || '');
    $('[data-scan-offer]').onclick = () => scan('offer');
    $('[data-scan-answer]').onclick = () => scan('answer');
    $('[data-scan-close]').onclick = closeScanner;
    $('[data-copy-offer]').onclick = () => copy(r.hostCode, 'Host invite copied.');
    $('[data-share-offer]').onclick = () => share(r.hostCode, 'Code Smash Host Invite');
    $('[data-copy-answer]').onclick = () => copy(r.answerCode, 'Response copied.');
    $('[data-share-answer]').onclick = () => share(r.answerCode, 'Code Smash Response');
    $('[data-ready]').onclick = toggleReady;
    $('[data-rematch]').onclick = rematchReady;
    $('[data-result-hub]').onclick = returnHub;
    $('[data-resume]').onclick = resumeLocal;
    $('[data-disconnect-exit]').onclick = exitDisconnectedMatch;
    $('[data-disconnect-close]').onclick = () => close(true);

    const canvas = $('[data-canvas]');
    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', onPointerUp, { passive: false });
    canvas.addEventListener('contextmenu', event => event.preventDefault());
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    document.addEventListener('visibilitychange', visibilityChanged);
    r.resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { r.canvasRect = null; }) : null;
    r.resizeObserver?.observe(canvas);
    r.reducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
    renderAiCopy(); renderHostMatchHelp();
    r.built = true;
  }

  function show(name) {
    Object.entries(r.panels).forEach(([key, panel]) => panel.classList.toggle('active', key === name));
    r.state = name;
    const panel = r.panels[name]; if (panel) panel.scrollTop = 0;
  }

  function status(selector, text, error = false, ok = false) {
    const el = $(selector); if (!el) return;
    el.textContent = String(text || '');
    el.classList.toggle('error', !!error); el.classList.toggle('ok', !!ok);
  }

  function renderAiCopy() {
    const key = String($('[data-ai-difficulty]')?.value || r.aiDifficulty || 'normal');
    const cfg = AI_LEVELS[key] || AI_LEVELS.normal;
    const el = $('[data-ai-copy]'); if (el) el.innerHTML = `<strong>${cfg.label}</strong><span>${escapeHtml(cfg.copy)}</span>`;
  }

  function readTarget(selector, fallback = 7) {
    const value = Number($(selector)?.value || fallback);
    return value === 11 ? 11 : 7;
  }

  function renderHostMatchHelp() {
    const target = readTarget('[data-host-target]');
    const meta = MATCH_TYPES[target];
    const el = $('[data-host-match-help]'); if (el) el.textContent = meta.copy;
  }

  function renderConfigSummary() {
    const target = Number(r.config?.target || 7) === 11 ? 11 : 7;
    const meta = MATCH_TYPES[target];
    const el = $('[data-config-summary]');
    if (el) el.innerHTML = `<div><small>MATCH</small><strong>${meta.label}</strong></div><div><small>RULE</small><strong>WIN BY 2</strong></div><p>${meta.copy} Both players see themselves at the near side of the table.</p>`;
  }

  function syncNames() {
    const pairs = [
      ['[data-local-name]', r.localName], ['[data-remote-name]', r.remoteName],
      ['[data-local-hud-name]', r.localName], ['[data-remote-hud-name]', r.remoteName]
    ];
    pairs.forEach(([selector, value]) => { const el = $(selector); if (el) el.textContent = value; });
  }

  function initSession() {
    try { r.session?.close?.(); } catch (_) {}
    r.session = P().createSession({
      gameId: GAME_ID, prefix: PREFIX, timeoutMs: 90000, channelLabel: 'smash',
      onMessage: handleMessage, onConnected: onConnected,
      onRemoteName: name => { r.remoteName = name; syncNames(); },
      onDisconnected: () => { if (r.open && ['game', 'lobby', 'result'].includes(r.state)) showDisconnectedNotice('Opponent connection lost. The match is frozen safely.'); },
      onState: state => {
        const target = r.role === 'host' ? '[data-host-status]' : '[data-guest-status]';
        if (state === 'ice-checking') status(target, 'Checking the direct device-to-device route…');
        if (state === 'ice-failed' || state === 'failed') status(target, 'Direct connection failed. Send a fresh invite or try the same Wi-Fi / QR pairing.', true);
        if (state === 'timeout') status(target, 'Connection timed out. Send a fresh invite or try the same Wi-Fi / QR pairing.', true);
      }
    });
  }

  function readHostConfig() { return { target: readTarget('[data-host-target]') }; }

  async function prepareStudentHostOffer() {
    r.config = readHostConfig(); initSession(); r.role = 'host'; r.configReceived = true;
    const identity = r.bridge?.getPlayerIdentity?.();
    const input = $('[data-host-name]');
    if (identity?.loggedIn && identity.name && input) input.value = identity.name;
    r.localName = P().cleanName(input?.value || identity?.name, 'PLAYER 1');
    r.hostCode = await r.session.createOffer(r.localName); r.seed = r.session.seed; return r.hostCode;
  }

  async function prepareStudentGuestAnswer(code) {
    initSession(); r.role = 'guest'; r.configReceived = false;
    const identity = r.bridge?.getPlayerIdentity?.();
    const input = $('[data-guest-name]');
    if (identity?.loggedIn && identity.name && input) input.value = identity.name;
    r.localName = P().cleanName(input?.value || identity?.name, 'PLAYER 2');
    r.answerCode = await r.session.createAnswer(code, r.localName); r.seed = r.session.seed; r.remoteName = r.session.remoteName; return r.answerCode;
  }

  async function applyStudentHostAnswer(code) { await r.session.applyAnswer(code); r.remoteName = r.session.remoteName; }

  function ensureStudentInvites() {
    if (r.invites || !P()?.createStudentInviteController) return;
    r.invites = P().createStudentInviteController({
      overlay: r.overlay, gameId: GAME_ID, gameName: 'CODE SMASH', getBridge: () => r.bridge,
      getState: () => r.state, isConnected: () => !!r.session?.connected, getLocalName: () => r.localName,
      showHost: () => show('host'), showGuest: () => show('guest'),
      createHostOffer: prepareStudentHostOffer, createGuestAnswer: prepareStudentGuestAnswer, applyHostAnswer: applyStudentHostAnswer,
      setGuestStatus: (text, err = false, ok = false) => status('[data-guest-status]', text, err, ok)
    });
  }

  async function createOffer() {
    try {
      r.config = readHostConfig(); initSession(); r.role = 'host'; r.configReceived = true;
      r.localName = P().cleanName($('[data-host-name]')?.value, 'PLAYER 1');
      r.hostCode = await r.session.createOffer(r.localName); r.seed = r.session.seed;
      const src = r.bridge?.createQrDataUrl?.(r.hostCode, 360) || '';
      if (src) { $('[data-host-qr]').src = src; $('[data-host-qr-wrap]').hidden = false; }
      status('[data-host-status]', 'Host QR ready. Player 2 scans it, then scan their response.', false, true); sfx('ready');
    } catch (error) { status('[data-host-status]', error?.message || 'Could not create match.', true); }
  }

  async function createAnswer(code) {
    try {
      initSession(); r.role = 'guest'; r.configReceived = false;
      r.localName = P().cleanName($('[data-guest-name]')?.value, 'PLAYER 2');
      r.answerCode = await r.session.createAnswer(code, r.localName); r.seed = r.session.seed; r.remoteName = r.session.remoteName;
      const src = r.bridge?.createQrDataUrl?.(r.answerCode, 360) || '';
      if (src) { $('[data-guest-qr]').src = src; $('[data-guest-qr-wrap]').hidden = false; }
      status('[data-guest-status]', 'Response ready. Host scans this QR.', false, true); sfx('ready');
    } catch (error) { status('[data-guest-status]', error?.message || 'Invalid Host QR.', true); }
  }

  async function applyAnswer(code) {
    try { await r.session.applyAnswer(code); r.remoteName = r.session.remoteName; status('[data-host-status]', 'Connecting directly…', false, true); }
    catch (error) { status('[data-host-status]', error?.message || 'Could not connect.', true); }
  }

  async function scan(kind) {
    closeScanner();
    const scanner = $('[data-scanner]'), video = $('[data-scan-video]');
    scanner.hidden = false; $('[data-scan-title]').textContent = kind === 'offer' ? 'SCAN HOST QR' : 'SCAN RESPONSE QR';
    try {
      r.scannerStop = await P().openScanner({
        video, acceptPrefix: `${PREFIX}.`, onCode: async code => {
          scanner.hidden = true; r.scannerStop = null;
          if (kind === 'offer') { show('guest'); $('[data-offer-input]').value = code; await createAnswer(code); }
          else { $('[data-answer-input]').value = code; await applyAnswer(code); }
        }
      });
      $('[data-scan-status]').textContent = 'Point the camera at the QR code on the other device.';
    } catch (error) { $('[data-scan-status]').textContent = error?.message || 'Scanner unavailable.'; }
  }

  function closeScanner() { try { r.scannerStop?.(); } catch (_) {} r.scannerStop = null; const scanner = $('[data-scanner]'); if (scanner) scanner.hidden = true; }
  async function copy(text, messageText) { const ok = await P().copyText(text); status(r.role === 'host' ? '[data-host-status]' : '[data-guest-status]', ok ? messageText : 'Copy failed.', !ok, ok); }
  async function share(text, title) { await P().shareText(text, title); }

  function cancelPairing() {
    closeScanner(); try { r.invites?.cancelHostInvite?.(); } catch (_) {} try { r.session?.close?.(); } catch (_) {}
    r.session = null; r.role = ''; r.hostCode = r.answerCode = ''; show('home');
  }

  function onConnected() {
    r.invites?.onConnected?.(); r.remoteName = r.session.remoteName; r.seed = r.session.seed;
    r.localReady = r.remoteReady = false; r.localNextReady = r.remoteNextReady = false; syncNames();
    if (r.role === 'host') { r.config = readHostConfig(); r.configReceived = true; r.session.send({ t: 'config', config: r.config }); }
    renderConfigSummary(); show('lobby'); updateReadyUi(); sfx('connect');
  }

  function toggleReady() {
    if (r.role === 'guest' && !r.configReceived) { status('[data-lobby-status]', 'Waiting for Host match settings…'); return; }
    r.localReady = !r.localReady; r.session?.send({ t: 'ready', v: r.localReady }); updateReadyUi();
    if (r.role === 'host' && r.localReady && r.remoteReady) beginCountdown(false);
  }

  function updateReadyUi() {
    $('[data-local-player]')?.classList.toggle('ready', r.localReady); $('[data-remote-player]')?.classList.toggle('ready', r.remoteReady);
    const button = $('[data-ready]'); if (button) { button.disabled = r.role === 'guest' && !r.configReceived; button.textContent = r.localReady ? 'READY ✓' : "I'M READY"; }
    status('[data-lobby-status]', r.localReady && r.remoteReady ? 'Both ready — starting…' : r.localReady ? 'Waiting for opponent…' : r.remoteReady ? 'Opponent is ready.' : (r.role === 'guest' && !r.configReceived ? 'Receiving Host match settings…' : 'Waiting for both players.'), false, r.localReady && r.remoteReady);
  }

  function beginCountdown(rematch = false) {
    if (!isAuthority() || r.countdownActive) return;
    if (r.role === 'host') r.session?.send({ t: 'countdown', rematch: !!rematch });
    countdown(() => startMatch());
  }

  function countdown(done) {
    if (r.countdownActive) return;
    r.countdownActive = true;
    const box = $('[data-countdown]'), value = $('[data-countdown-value]'); if (!box || !value) { r.countdownActive = false; done?.(); return; }
    box.hidden = false; let n = 3; value.textContent = n; sfx('count');
    const timer = setInterval(() => {
      n -= 1;
      if (n > 0) { value.textContent = n; sfx('count'); return; }
      clearInterval(timer); value.textContent = 'GO!'; sfx('go');
      setTimeout(() => { box.hidden = true; r.countdownActive = false; done?.(); }, 400);
    }, 620);
  }

  function startSoloMatch() {
    try { r.session?.close?.(); } catch (_) {} r.session = null; r.role = 'solo'; r.configReceived = true;
    const identity = r.bridge?.getPlayerIdentity?.(); const input = $('[data-solo-name]');
    if (identity?.loggedIn && identity.name && input && (!input.value || input.value === 'PLAYER 1')) input.value = identity.name;
    r.localName = P()?.cleanName ? P().cleanName(input?.value || identity?.name, 'PLAYER 1') : String(input?.value || identity?.name || 'PLAYER 1').slice(0, 20);
    r.aiDifficulty = AI_LEVELS[String($('[data-ai-difficulty]')?.value || '')] ? String($('[data-ai-difficulty]').value) : 'normal';
    r.remoteName = `CODE BOT · ${AI_LEVELS[r.aiDifficulty].label}`; r.config = { target: readTarget('[data-solo-target]') };
    r.seed = (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0; syncNames(); countdown(startMatch);
  }

  function makeGame() {
    return {
      score: { h: 0, g: 0 }, target: Number(r.config.target || 7) === 11 ? 11 : 7,
      phase: 'serve', server: 'h', serveAt: performance.now() + 1050, phaseUntil: 0,
      ball: {
        x: 0, y: .91, z: .22, vx: 0, vy: 0, vz: 0,
        bounces: 0, lastHitter: 'h', firstBounceSide: '', returnableSide: '',
        isServe: true, serveStage: 0, netTouched: false
      },
      paddles: {
        h: { x: 0, y: .90, vx: 0, vy: 0, swing: 0, swingDir: 0, intentAim: 0, intentPower: .42, intentStyle: 'DRIVE', intentTtl: 0 },
        g: { x: 0, y: -.90, vx: 0, vy: 0, swing: 0, swingDir: 0, intentAim: 0, intentPower: .42, intentStyle: 'DRIVE', intentTtl: 0 }
      },
      rally: 0, longestRally: 0,
      pointWinner: '', message: 'Get ready.', winner: '', matchOver: false, seq: 0,
      letCount: 0
    };
  }

  function startMatch() {
    r.game = makeGame(); r.resultShown = false; r.localNextReady = r.remoteNextReady = false;
    r.ballTrail.length = 0; r.effects.length = 0; r.localInput.x = 0; r.localInput.y = .90; r.localInput.vx = 0; r.localInput.vy = 0; r.localInput.shotAim = 0; r.localInput.shotPower = .42; r.localInput.shotStyle = 'DRIVE'; r.localInput.intentAt = 0; r.aiTargetX = 0; r.aiThinkAt = 0;
    show('game'); syncNames(); updateHud(); updateControlUi();
    r.lastFrameAt = performance.now(); r.lastSnapshotAt = 0;
    if (isAuthority()) { attachServeBall(); broadcastState(true); }
    ensureLoop();
  }

  function ensureLoop() { if (r.raf) return; r.raf = requestAnimationFrame(frame); }

  function frame(now) {
    r.raf = 0;
    if (!r.open) return;
    const dt = Math.min(.033, Math.max(0, (now - (r.lastFrameAt || now)) / 1000)); r.lastFrameAt = now;
    if (r.state === 'game' && !r.paused && !r.remotePaused) {
      updateKeyboard(dt);
      if (isAuthority()) updateAuthority(dt, now);
      renderGame(now);
    } else if (r.state === 'game') renderGame(now);
    if (r.state === 'game' || r.state === 'result') ensureLoop();
  }

  function updateKeyboard(dt) {
    const dx = (r.keys.right ? 1 : 0) - (r.keys.left ? 1 : 0);
    const dy = (r.keys.down ? 1 : 0) - (r.keys.up ? 1 : 0);
    if (!dx && !dy) return;
    const beforeX = r.localInput.x, beforeY = r.localInput.y;
    r.localInput.x = clamp(beforeX + dx * 1.68 * dt, -.82, .82);
    r.localInput.y = clamp(beforeY + dy * .92 * dt, PADDLE_NEAR_MIN_Y, PADDLE_NEAR_MAX_Y);
    r.localInput.vx = dt > 0 ? (r.localInput.x - beforeX) / dt : 0;
    r.localInput.vy = dt > 0 ? (r.localInput.y - beforeY) / dt : 0;
    captureShotIntent(r.localInput.vx, r.localInput.vy, performance.now());
    applyLocalInput(true);
  }

  function applyLocalInput(forceSend = false) {
    if (!r.game || r.state !== 'game') return;
    const fresh = performance.now() - Number(r.localInput.intentAt || 0) <= SHOT_INTENT_HOLD_MS;
    if (isAuthority()) {
      const p = r.game.paddles.h;
      p.x = r.localInput.x; p.y = r.localInput.y; p.vx = r.localInput.vx; p.vy = r.localInput.vy;
      if (fresh) {
        p.intentAim = r.localInput.shotAim; p.intentPower = r.localInput.shotPower; p.intentStyle = r.localInput.shotStyle; p.intentTtl = SHOT_INTENT_HOLD_MS / 1000;
      }
    } else if (r.role === 'guest') {
      const now = performance.now();
      if (forceSend || now - r.lastInputSentAt >= INPUT_SEND_MS) {
        r.lastInputSentAt = now;
        r.session?.send({ t: 'input', x: r.localInput.x, y: r.localInput.y, vx: r.localInput.vx, vy: r.localInput.vy, aim: r.localInput.shotAim, power: r.localInput.shotPower, style: r.localInput.shotStyle, intent: fresh });
      }
    }
    updatePowerUi();
  }

  function updateAuthority(dt, now) {
    const g = r.game; if (!g) return;
    if (isSolo()) updateAi(dt, now);
    Object.values(g.paddles).forEach(paddle => {
      paddle.vx *= Math.pow(.12, dt);
      paddle.vy *= Math.pow(.12, dt);
      paddle.swing = Math.max(0, Number(paddle.swing || 0) - dt * 6.5);
      paddle.intentTtl = Math.max(0, Number(paddle.intentTtl || 0) - dt);
    });

    if (g.phase === 'serve') {
      attachServeBall(now);
      if (now >= g.serveAt) launchServe(g.server);
    } else if (g.phase === 'rally') {
      updateBallPhysics(dt, now);
    } else if (g.phase === 'point') {
      if (now >= g.phaseUntil) prepareNextServe(now);
    } else if (g.phase === 'over' && !r.resultShown && now >= g.phaseUntil) {
      r.resultShown = true; if (r.role === 'host') r.session?.send({ t: 'result', game: snapshotGame() }); showResult();
    }
    if (r.role === 'host' && now - r.lastSnapshotAt >= SNAPSHOT_MS) broadcastState(false);
    updateHud(); updateControlUi();
  }

  function predictIncomingContact(ball, side) {
    if (!ball) return null;
    const sign = side === 'h' ? 1 : -1;
    if (Math.sign(ball.vy || 0) !== sign) return null;
    const targetY = sign * .84;
    const t = (targetY - ball.y) / Math.max(.001, ball.vy);
    if (!Number.isFinite(t) || t < 0 || t > 1.2) return null;
    return { x: ball.x + ball.vx * t, y: targetY, t };
  }

  function updateAi(dt, now) {
    const g = r.game; if (!g) return;
    const cfg = AI_LEVELS[r.aiDifficulty] || AI_LEVELS.normal;
    if (now >= r.aiThinkAt) {
      r.aiThinkAt = now + cfg.reaction * 1000;
      let targetX = 0, targetY = -.88;
      const incoming = g.phase === 'rally' && g.ball.vy < 0 && (g.ball.returnableSide === 'g' || g.ball.bounces >= 1);
      if (incoming) {
        const prediction = predictIncomingContact(g.ball, 'g');
        targetX = prediction?.x ?? g.ball.x;
        targetY = clamp(g.ball.y - .08, -PADDLE_NEAR_MAX_Y, -PADDLE_NEAR_MIN_Y);
        const noise = (Math.sin((now + r.seed) * .0081) + Math.sin((now + r.seed * .7) * .0047)) * .5;
        targetX += noise * cfg.jitter;
        if (Math.abs(noise) > .76 && Math.random() < cfg.missChance) targetX += Math.sign(noise) * .26;
      } else if (g.phase === 'serve' && g.server === 'g') {
        targetX = Math.sin(now * .002) * .18;
        targetY = -.91;
      }
      r.aiTargetX = clamp(targetX, -.82, .82);
      r.aiTargetY = clamp(targetY, -PADDLE_NEAR_MAX_Y, -PADDLE_NEAR_MIN_Y);
    }
    const paddle = g.paddles.g;
    const dx = r.aiTargetX - paddle.x, dy = (Number(r.aiTargetY) || -.88) - paddle.y;
    const moveX = clamp(dx, -cfg.maxSpeed * dt, cfg.maxSpeed * dt);
    const moveY = clamp(dy, -cfg.depthSpeed * dt, cfg.depthSpeed * dt);
    paddle.x += moveX; paddle.y += moveY;
    paddle.vx = dt > 0 ? moveX / dt : 0; paddle.vy = dt > 0 ? moveY / dt : 0;
    const canShapeShot = g.phase === 'rally' && g.ball.returnableSide === 'g' && g.ball.bounces >= 1 && g.ball.vy < 0;
    if (canShapeShot) {
      const playerX = Number(g.paddles.h?.x || 0);
      const tacticalAim = playerX > .16 ? -.86 : playerX < -.16 ? .86 : (Math.sin((now + r.seed) * .004) > 0 ? .68 : -.68);
      const difficultyPower = r.aiDifficulty === 'hard' ? .82 : r.aiDifficulty === 'easy' ? .46 : .64;
      const attackPulse = r.aiDifficulty === 'hard' && Math.sin((now + r.seed) * .0063) > .66 ? .96 : difficultyPower;
      paddle.intentAim = clamp(tacticalAim + Math.sin(now * .007) * cfg.jitter, -1, 1);
      paddle.intentPower = clamp(attackPulse, .25, .98);
      paddle.intentStyle = paddle.intentPower > .88 ? 'SMASH' : paddle.intentPower > .68 ? 'POWER' : paddle.intentPower < .34 ? 'SOFT' : 'DRIVE';
      paddle.intentTtl = .32;
    }
  }

  function attachServeBall(now = performance.now()) {
    const g = r.game; if (!g) return;
    const p = g.paddles[g.server]; const sign = g.server === 'h' ? 1 : -1;
    const remaining = Math.max(0, g.serveAt - now);
    const tossProgress = clamp(1 - remaining / 1050, 0, 1);
    const toss = Math.sin(Math.PI * tossProgress) * .28;
    g.ball.x = p.x;
    g.ball.y = sign * Math.max(.91, Math.abs(p.y));
    g.ball.z = .22 + toss;
    g.ball.vx = 0; g.ball.vy = 0; g.ball.vz = 0;
    g.ball.bounces = 0; g.ball.lastHitter = g.server; g.ball.firstBounceSide = '';
    g.ball.returnableSide = ''; g.ball.isServe = true; g.ball.serveStage = 0; g.ball.netTouched = false;
  }

  function launchServe(side) {
    const g = r.game; if (!g || g.phase !== 'serve') return;
    const p = g.paddles[side], sign = side === 'h' ? 1 : -1, dir = -sign;
    const aiBoost = side === 'g' && isSolo() ? (AI_LEVELS[r.aiDifficulty]?.shotBoost || 1) : 1;
    g.ball.x = p.x;
    g.ball.y = sign * .94;
    g.ball.z = .22;
    g.ball.vx = clamp(p.vx * .11 + Math.sin((performance.now() + r.seed) * .006) * .08, -.55, .55);
    g.ball.vy = dir * 1.23 * aiBoost;
    g.ball.vz = .64;
    g.ball.bounces = 0; g.ball.lastHitter = side; g.ball.firstBounceSide = '';
    g.ball.returnableSide = ''; g.ball.isServe = true; g.ball.serveStage = 0; g.ball.netTouched = false;
    g.phase = 'rally'; g.rally = 0;
    g.message = side === localSide() ? 'Legal serve: your side first, then opponent side.' : 'Serve incoming: it must bounce twice before your return.';
    r.ballTrail.length = 0; emitFx('serve', side, 'SERVE'); sfx('serve'); broadcastState(true);
  }

  function ballSide(y) { return y >= 0 ? 'h' : 'g'; }
  function movingTowardSide(ball, side) { return side === 'h' ? ball.vy > 0 : ball.vy < 0; }

  function resetServeAsLet(now, side) {
    const g = r.game; if (!g) return;
    g.phase = 'serve'; g.server = side; g.serveAt = now + 900; g.message = 'LET — the serve touched the net. Serve again.';
    g.letCount = Math.min(9, Number(g.letCount || 0) + 1); attachServeBall(now); r.ballTrail.length = 0;
    sfx('net'); emitFx('net', side, 'LET'); broadcastState(true);
  }

  function updateBallPhysics(dt, now) {
    const g = r.game, b = g.ball; if (!g || g.phase !== 'rally') return;
    const prev = { x: b.x, y: b.y, z: b.z };
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.vz -= GRAVITY * dt;

    const crossedNet = (prev.y < 0 && b.y >= 0) || (prev.y > 0 && b.y <= 0);
    if (crossedNet) {
      const crossing = Math.abs(prev.y) / Math.max(.0001, Math.abs(prev.y) + Math.abs(b.y));
      const zAtNet = prev.z + (b.z - prev.z) * crossing;
      if (b.isServe && b.serveStage === 1 && zAtNet <= NET_H + .018) {
        resetServeAsLet(now, b.lastHitter); return;
      }
      if (!b.isServe && zAtNet < NET_H - .018) {
        sfx('net'); emitFx('net', b.lastHitter, 'NET');
        awardPoint(otherSide(b.lastHitter), 'NET — the return did not clear the net.'); return;
      }
      if (zAtNet <= NET_H + .035) {
        b.netTouched = true; b.vx *= .88; b.vy *= .83; b.vz *= .82; sfx('net'); emitFx('net', b.lastHitter, 'NET CORD');
      }
    }

    if (b.z <= 0) {
      const onTable = Math.abs(b.x) <= TABLE_HALF_X && Math.abs(b.y) <= TABLE_HALF_Y;
      if (!onTable) {
        awardPoint(otherSide(b.lastHitter), 'OUT — the shot missed the table.'); return;
      }
      const landedSide = ballSide(b.y);
      b.z = .002;
      sfx('bounce'); emitFx('bounce', landedSide, 'BOUNCE');

      if (b.isServe) {
        if (b.serveStage === 0) {
          if (landedSide !== b.lastHitter) { awardPoint(otherSide(b.lastHitter), 'SERVICE FAULT — first bounce must be on the server side.'); return; }
          b.serveStage = 1; b.firstBounceSide = landedSide; b.vz = Math.max(1.68, Math.abs(b.vz) * 1.00);
        } else if (b.serveStage === 1) {
          const receiver = otherSide(b.lastHitter);
          if (landedSide !== receiver) { awardPoint(receiver, 'SERVICE FAULT — second bounce must reach the receiver side.'); return; }
          b.serveStage = 2; b.isServe = false; b.bounces = 1; b.returnableSide = receiver;
          b.vz = Math.max(.96, Math.abs(b.vz) * .72);
          g.message = receiver === localSide() ? 'BOUNCE ✓ Move your racket to the ball now.' : 'Legal serve. Opponent can return now.';
        }
      } else if (b.bounces === 0) {
        const receiver = otherSide(b.lastHitter);
        if (landedSide !== receiver) { awardPoint(receiver, 'FAULT — the return bounced on the hitter side.'); return; }
        b.bounces = 1; b.returnableSide = receiver;
        b.vz = Math.max(.86, Math.abs(b.vz) * .62);
        g.message = receiver === localSide() ? 'ONE BOUNCE ✓ Meet the ball with your racket.' : 'Opponent return window is open.';
      } else {
        awardPoint(b.lastHitter, 'DOUBLE BOUNCE — the receiver did not return the ball.'); return;
      }
    }

    if (b.bounces >= 1 && b.returnableSide && movingTowardSide(b, b.returnableSide)) {
      attemptPaddleHit(b.returnableSide, now, prev);
      if (g.phase !== 'rally') return;
    }

    if (b.bounces >= 1 && b.returnableSide) {
      const sign = b.returnableSide === 'h' ? 1 : -1;
      if (sign * b.y > BALL_MISS_Y) {
        awardPoint(b.lastHitter, 'MISSED RETURN — the ball passed the racket.'); return;
      }
    }
  }

  function solvePlacedShot(ball, side, aim, power) {
    const dir = side === 'h' ? -1 : 1;
    const safePower = clamp(power, .14, 1);
    const targetDepth = lerp(.38, .94, safePower);
    const targetX = clamp(aim * SHOT_TARGET_X, -.84, .84);
    const targetY = dir * targetDepth;
    let flight = lerp(.76, .46, safePower);
    if (safePower > .90) flight = .44;
    let vx = 0, vy = 0, vz = 0;
    for (let tries = 0; tries < 8; tries += 1) {
      vx = (targetX - ball.x) / flight;
      vy = (targetY - ball.y) / flight;
      vz = (.5 * GRAVITY * flight * flight - Math.max(.05, ball.z)) / flight;
      const tNet = Math.abs(vy) > .001 ? (0 - ball.y) / vy : -1;
      const zNet = tNet > 0 && tNet < flight ? ball.z + vz * tNet - .5 * GRAVITY * tNet * tNet : 1;
      if (zNet >= NET_H + .025) break;
      flight += .028;
    }
    return { vx: clamp(vx, -4.8, 4.8), vy: clamp(vy, -4.9, 4.9), vz: clamp(vz, .54, 2.05), targetX, targetY, flight };
  }

  function shotDirectionLabel(aim) {
    return aim < -.28 ? 'LEFT' : aim > .28 ? 'RIGHT' : 'CENTER';
  }

  function attemptPaddleHit(side, now = performance.now(), prevBall = null) {
    const g = r.game, b = g.ball, p = g.paddles[side]; if (!g || g.phase !== 'rally' || !p) return false;
    if (b.returnableSide !== side || b.bounces < 1 || !movingTowardSide(b, side)) return false;
    const dx = b.x - p.x, dy = b.y - p.y;
    const nx = dx / PADDLE_RADIUS_X, ny = dy / PADDLE_RADIUS_Y;
    const planar = nx * nx + ny * ny;
    const heightOk = b.z >= .025 && b.z <= .62;
    if (planar > 1 || !heightOk) return false;

    const centered = Math.sqrt(Math.max(0, planar));
    const freshIntent = Number(p.intentTtl || 0) > 0;
    const fallbackAim = clamp(p.vx * .28 + (b.x - p.x) * .9, -1, 1);
    const aim = freshIntent ? clamp(Number(p.intentAim || 0), -1, 1) : fallbackAim;
    let power = freshIntent ? clamp(Number(p.intentPower || .42), .14, 1) : clamp(.38 + Math.max(0, side === 'h' ? -p.vy : p.vy) * .12, .24, .66);
    let style = freshIntent ? String(p.intentStyle || 'DRIVE').toUpperCase() : 'DRIVE';
    if (centered > .72) power *= .82;
    const smash = power >= .84 && centered < .62;
    if (smash) { style = 'SMASH'; power = Math.max(power, .90); }
    else if (power < .30) style = 'SOFT';
    else if (power >= .69) style = 'POWER';
    else style = 'DRIVE';

    let quality = centered < .25 ? 'PERFECT' : centered < .56 ? 'GREAT' : 'GOOD';
    const placed = solvePlacedShot(b, side, aim, power);
    b.x = clamp(b.x, -1.05, 1.05);
    b.y = p.y - (side === 'h' ? .018 : -.018);
    b.z = clamp(b.z, .10, .42);
    b.vx = placed.vx; b.vy = placed.vy; b.vz = placed.vz;
    b.bounces = 0; b.returnableSide = ''; b.firstBounceSide = ''; b.isServe = false; b.serveStage = 0; b.netTouched = false;
    b.lastHitter = side; g.rally += 1; g.longestRally = Math.max(g.longestRally, g.rally);
    p.swing = 1; p.swingDir = clamp(aim * .72 + (side === 'h' ? -1 : 1) * power * .24, -1, 1);
    p.intentTtl = 0;
    const dirLabel = shotDirectionLabel(side === localSide() ? aim : -aim);
    g.message = `${style} · ${dirLabel} — ${quality} contact.`;
    sfx(style === 'SMASH' ? 'smash' : quality === 'PERFECT' ? 'perfect' : 'hit'); emitFx('hit', side, style === 'SMASH' ? 'SMASH' : quality);
    if ((style === 'SMASH' || quality === 'PERFECT') && side === localSide()) vibrate(style === 'SMASH' ? 22 : 10);
    broadcastState(true);
    return true;
  }

  function awardPoint(winner, reason) {
    const g = r.game; if (!g || !['rally', 'serve'].includes(g.phase)) return;
    g.score[winner] += 1; g.pointWinner = winner; g.message = reason; g.phase = 'point'; g.phaseUntil = performance.now() + 980;
    g.ball.vx = g.ball.vy = g.ball.vz = 0; g.seq += 1; sfx(winner === localSide() ? 'point' : 'pointLost'); emitFx('point', winner, 'POINT');
    const a = g.score.h, b = g.score.g, target = g.target;
    if ((a >= target || b >= target) && Math.abs(a - b) >= 2) {
      g.matchOver = true; g.winner = a > b ? 'h' : 'g'; g.phase = 'over'; g.phaseUntil = performance.now() + 760;
      sfx(g.winner === localSide() ? 'win' : 'lose');
    }
    broadcastState(true); updateHud();
  }

  function prepareNextServe(now) {
    const g = r.game; if (!g || g.matchOver) return;
    g.server = serverForScore(g.score.h, g.score.g, g.target); g.phase = 'serve'; g.serveAt = now + 1050; g.pointWinner = ''; g.message = g.server === localSide() ? 'YOUR SERVE — legal serve bounces on your side first.' : 'OPPONENT SERVES — wait for the second serve bounce.'; attachServeBall(); r.ballTrail.length = 0; broadcastState(true);
  }

  function serverForScore(h, g, target) {
    const total = h + g; const deuce = h >= target - 1 && g >= target - 1;
    return (deuce ? total % 2 : Math.floor(total / 2) % 2) === 0 ? 'h' : 'g';
  }

  function snapshotGame() {
    const g = r.game; if (!g) return null;
    return {
      score: { h: g.score.h, g: g.score.g }, target: g.target, phase: g.phase, server: g.server,
      ball: { x: round4(g.ball.x), y: round4(g.ball.y), z: round4(g.ball.z), vx: round4(g.ball.vx), vy: round4(g.ball.vy), vz: round4(g.ball.vz), bounces: g.ball.bounces, lastHitter: g.ball.lastHitter, firstBounceSide: g.ball.firstBounceSide, returnableSide: g.ball.returnableSide, isServe: !!g.ball.isServe, serveStage: g.ball.serveStage, netTouched: !!g.ball.netTouched },
      paddles: { h: { x: round4(g.paddles.h.x), y: round4(g.paddles.h.y), vx: round4(g.paddles.h.vx), vy: round4(g.paddles.h.vy), swing: round4(g.paddles.h.swing || 0), swingDir: round4(g.paddles.h.swingDir || 0), intentAim: round4(g.paddles.h.intentAim || 0), intentPower: round4(g.paddles.h.intentPower || .42), intentStyle: g.paddles.h.intentStyle || 'DRIVE' }, g: { x: round4(g.paddles.g.x), y: round4(g.paddles.g.y), vx: round4(g.paddles.g.vx), vy: round4(g.paddles.g.vy), swing: round4(g.paddles.g.swing || 0), swingDir: round4(g.paddles.g.swingDir || 0), intentAim: round4(g.paddles.g.intentAim || 0), intentPower: round4(g.paddles.g.intentPower || .42), intentStyle: g.paddles.g.intentStyle || 'DRIVE' } },
      rally: g.rally, longestRally: g.longestRally, pointWinner: g.pointWinner, message: g.message, winner: g.winner, matchOver: g.matchOver, seq: g.seq, letCount: g.letCount || 0
    };
  }
  function round4(v) { return Math.round(Number(v || 0) * 10000) / 10000; }

  function broadcastState(force = false) {
    if (r.role !== 'host' || !r.session?.connected || !r.game) return;
    const now = performance.now(); if (!force && now - r.lastSnapshotAt < SNAPSHOT_MS) return; r.lastSnapshotAt = now;
    r.session.send({ t: 'state', game: snapshotGame(), at: Date.now() });
  }

  function handleMessage(message) {
    switch (message?.t) {
      case 'config':
        if (r.role === 'guest') { r.config = { target: Number(message.config?.target) === 11 ? 11 : 7 }; r.configReceived = true; renderConfigSummary(); updateReadyUi(); }
        break;
      case 'ready':
        r.remoteReady = !!message.v; updateReadyUi(); if (r.role === 'host' && r.localReady && r.remoteReady) beginCountdown(false); break;
      case 'countdown':
        if (r.role === 'guest') countdown(() => {}); break;
      case 'input':
        if (r.role === 'host' && r.game) {
          const p = r.game.paddles.g;
          p.x = clamp(-Number(message.x || 0), -.82, .82);
          p.y = clamp(-Number(message.y || .90), -PADDLE_NEAR_MAX_Y, -PADDLE_NEAR_MIN_Y);
          p.vx = clamp(-Number(message.vx || 0), -4.5, 4.5);
          p.vy = clamp(-Number(message.vy || 0), -3.5, 3.5);
          if (message.intent === true) {
            p.intentAim = clamp(-Number(message.aim || 0), -1, 1);
            p.intentPower = clamp(Number(message.power || .42), .14, 1);
            p.intentStyle = ['SOFT','DRIVE','POWER','SMASH'].includes(String(message.style || '').toUpperCase()) ? String(message.style).toUpperCase() : 'DRIVE';
            p.intentTtl = SHOT_INTENT_HOLD_MS / 1000;
          }
        }
        break;
      case 'state':
        if (r.role === 'guest' && message.game) { r.netTarget = sanitizeSnapshot(message.game); r.netReceivedAt = performance.now(); if (r.state !== 'game' && !r.netTarget.matchOver) show('game'); updateHud(r.netTarget); updateControlUi(r.netTarget); ensureLoop(); }
        break;
      case 'fx':
        if (r.role === 'guest') {
          spawnEffect(message.kind, message.side, message.quality, message.ball);
          if (message.kind === 'hit') {
            sfx(message.quality === 'SMASH' ? 'smash' : message.quality === 'PERFECT' ? 'perfect' : 'hit');
            if (message.side === localSide() && (message.quality === 'SMASH' || message.quality === 'PERFECT')) vibrate(message.quality === 'SMASH' ? 22 : 10);
          } else if (message.kind === 'bounce') sfx('bounce');
          else if (message.kind === 'net') sfx('net');
          else if (message.kind === 'point') sfx(message.side === localSide() ? 'point' : 'pointLost');
        }
        break;
      case 'result':
        if (r.role === 'guest' && message.game) { r.netTarget = sanitizeSnapshot(message.game); sfx(r.netTarget.winner === localSide() ? 'win' : 'lose'); showResult(r.netTarget); }
        break;
      case 'nextReady':
        r.remoteNextReady = !!message.v; updateResultReady(); if (r.role === 'host' && r.localNextReady && r.remoteNextReady) beginCountdown(true); break;
      case 'pause': r.remotePaused = true; pauseGame('Opponent paused the match.'); break;
      case 'resume': r.remotePaused = false; if (!r.exitPaused) resumeGame(); break;
      default: break;
    }
  }

  function sanitizeSnapshot(source) {
    const safe = source && typeof source === 'object' ? source : {};
    return {
      score: { h: Math.max(0, Math.floor(Number(safe.score?.h || 0))), g: Math.max(0, Math.floor(Number(safe.score?.g || 0))) },
      target: Number(safe.target) === 11 ? 11 : 7, phase: ['serve', 'rally', 'point', 'over'].includes(safe.phase) ? safe.phase : 'serve', server: safe.server === 'g' ? 'g' : 'h',
      ball: { x: clamp(safe.ball?.x, -2, 2), y: clamp(safe.ball?.y, -2, 2), z: clamp(safe.ball?.z, 0, 2), vx: clamp(safe.ball?.vx, -4, 4), vy: clamp(safe.ball?.vy, -4, 4), vz: clamp(safe.ball?.vz, -5, 5), bounces: clamp(safe.ball?.bounces, 0, 3), lastHitter: safe.ball?.lastHitter === 'g' ? 'g' : 'h', firstBounceSide: safe.ball?.firstBounceSide === 'g' ? 'g' : safe.ball?.firstBounceSide === 'h' ? 'h' : '', returnableSide: safe.ball?.returnableSide === 'g' ? 'g' : safe.ball?.returnableSide === 'h' ? 'h' : '', isServe: safe.ball?.isServe === true, serveStage: clamp(safe.ball?.serveStage, 0, 2), netTouched: safe.ball?.netTouched === true },
      paddles: { h: { x: clamp(safe.paddles?.h?.x, -.9, .9), y: clamp(safe.paddles?.h?.y ?? .90, PADDLE_NEAR_MIN_Y, PADDLE_NEAR_MAX_Y), vx: clamp(safe.paddles?.h?.vx, -5, 5), vy: clamp(safe.paddles?.h?.vy, -4, 4), swing: clamp(safe.paddles?.h?.swing, 0, 1), swingDir: clamp(safe.paddles?.h?.swingDir, -1, 1), intentAim: clamp(safe.paddles?.h?.intentAim, -1, 1), intentPower: clamp(safe.paddles?.h?.intentPower || .42, .14, 1), intentStyle: String(safe.paddles?.h?.intentStyle || 'DRIVE') }, g: { x: clamp(safe.paddles?.g?.x, -.9, .9), y: clamp(safe.paddles?.g?.y ?? -.90, -PADDLE_NEAR_MAX_Y, -PADDLE_NEAR_MIN_Y), vx: clamp(safe.paddles?.g?.vx, -5, 5), vy: clamp(safe.paddles?.g?.vy, -4, 4), swing: clamp(safe.paddles?.g?.swing, 0, 1), swingDir: clamp(safe.paddles?.g?.swingDir, -1, 1), intentAim: clamp(safe.paddles?.g?.intentAim, -1, 1), intentPower: clamp(safe.paddles?.g?.intentPower || .42, .14, 1), intentStyle: String(safe.paddles?.g?.intentStyle || 'DRIVE') } },
      rally: Math.max(0, Math.floor(Number(safe.rally || 0))), longestRally: Math.max(0, Math.floor(Number(safe.longestRally || 0))), pointWinner: safe.pointWinner === 'g' ? 'g' : safe.pointWinner === 'h' ? 'h' : '',
      message: String(safe.message || '').slice(0, 140), winner: safe.winner === 'g' ? 'g' : safe.winner === 'h' ? 'h' : '', matchOver: safe.matchOver === true, seq: Math.max(0, Math.floor(Number(safe.seq || 0))), letCount: Math.max(0, Math.min(9, Math.floor(Number(safe.letCount || 0))))
    };
  }

  function emitFx(kind, side, quality) {
    const ball = r.game?.ball ? { x: r.game.ball.x, y: r.game.ball.y, z: r.game.ball.z } : null;
    spawnEffect(kind, side, quality, ball);
    if (r.role === 'host') r.session?.send({ t: 'fx', kind, side, quality, ball });
  }

  function spawnEffect(kind, side, quality, ball) {
    const point = ball || r.game?.ball || r.netTarget?.ball || { x: 0, y: 0, z: 0 };
    r.effects.push({ kind, side, quality, x: Number(point.x || 0), y: Number(point.y || 0), z: Number(point.z || 0), born: performance.now(), ttl: kind === 'point' ? 700 : 430 });
    if (r.effects.length > 14) r.effects.splice(0, r.effects.length - 14);
  }

  function getRenderState(now = performance.now()) {
    if (isAuthority()) return r.game;
    const base = r.netTarget; if (!base) return null;
    const g = sanitizeSnapshot(base); const elapsed = Math.min(.075, Math.max(0, (now - r.netReceivedAt) / 1000));
    if (g.phase === 'rally') { g.ball.x += g.ball.vx * elapsed; g.ball.y += g.ball.vy * elapsed; g.ball.z = Math.max(0, g.ball.z + g.ball.vz * elapsed - .5 * GRAVITY * elapsed * elapsed); g.ball.vz -= GRAVITY * elapsed; }
    if (r.role === 'guest') { g.paddles.g.x = -r.localInput.x; g.paddles.g.y = -r.localInput.y; g.paddles.g.vx = -r.localInput.vx; g.paddles.g.vy = -r.localInput.vy; g.paddles.g.intentAim = -r.localInput.shotAim; g.paddles.g.intentPower = r.localInput.shotPower; g.paddles.g.intentStyle = r.localInput.shotStyle; }
    return g;
  }

  function viewCoords(x, y) { return r.role === 'guest' ? { x: -x, y: -y } : { x, y }; }

  function projectWorld(x, y, z = 0) {
    const local = viewCoords(x, y); const t = clamp((local.y + 1.08) / 2.16, 0, 1);
    const groundY = lerp(218, 948, t); const halfW = lerp(238, 398, t); const scale = lerp(.64, 1.2, t);
    return { x: WORLD_W / 2 + (local.x / TABLE_HALF_X) * halfW, y: groundY - z * 258 * scale, groundY, halfW, scale, t, localX: local.x, localY: local.y };
  }

  function renderGame(now) {
    const canvas = $('[data-canvas]'), ctx = canvas?.getContext('2d'); const g = getRenderState(now); if (!ctx || !g) return;
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);
    drawArena(ctx, g, now); drawIndicators(ctx, g, now); drawAimArrow(ctx, g); drawPaddles(ctx, g, now); drawBall(ctx, g, now); drawEffects(ctx, now); drawPointFeedback(ctx, g, now);
    updateHud(g); updateControlUi(g); updateTrail(g, now);
  }

  function drawArena(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, WORLD_H); sky.addColorStop(0, '#071126'); sky.addColorStop(.55, '#0b1e33'); sky.addColorStop(1, '#06101c'); ctx.fillStyle = sky; ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.save(); ctx.globalAlpha = .45;
    for (let i = 0; i < 24; i += 1) { const x = 24 + (i * 137) % 850, y = 70 + ((i * 83) % 120); ctx.fillStyle = i % 3 === 0 ? '#67e8f9' : i % 3 === 1 ? '#a78bfa' : '#f8fafc'; ctx.beginPath(); ctx.arc(x, y, i % 4 === 0 ? 3.2 : 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(450, 970, 375, 72, 0, 0, Math.PI * 2); ctx.fill();
    const fl = projectWorld(-TABLE_HALF_X, -TABLE_HALF_Y, 0), fr = projectWorld(TABLE_HALF_X, -TABLE_HALF_Y, 0), nr = projectWorld(TABLE_HALF_X, TABLE_HALF_Y, 0), nl = projectWorld(-TABLE_HALF_X, TABLE_HALF_Y, 0);
    const tableGrad = ctx.createLinearGradient(0, fl.groundY, 0, nl.groundY); tableGrad.addColorStop(0, '#0e7490'); tableGrad.addColorStop(.52, '#0891b2'); tableGrad.addColorStop(1, '#0b7285');
    ctx.beginPath(); ctx.moveTo(fl.x, fl.groundY); ctx.lineTo(fr.x, fr.groundY); ctx.lineTo(nr.x, nr.groundY); ctx.lineTo(nl.x, nl.groundY); ctx.closePath(); ctx.fillStyle = tableGrad; ctx.fill(); ctx.strokeStyle = 'rgba(224,242,254,.95)'; ctx.lineWidth = 5; ctx.stroke();
    const centerFar = projectWorld(0, -TABLE_HALF_Y, 0), centerNear = projectWorld(0, TABLE_HALF_Y, 0); ctx.beginPath(); ctx.moveTo(centerFar.x, centerFar.groundY); ctx.lineTo(centerNear.x, centerNear.groundY); ctx.strokeStyle = 'rgba(224,242,254,.55)'; ctx.lineWidth = 3; ctx.stroke();
    const netL = projectWorld(-TABLE_HALF_X, 0, 0), netR = projectWorld(TABLE_HALF_X, 0, 0), netTopL = projectWorld(-TABLE_HALF_X, 0, NET_H), netTopR = projectWorld(TABLE_HALF_X, 0, NET_H);
    ctx.fillStyle = 'rgba(5,15,28,.70)'; ctx.beginPath(); ctx.moveTo(netL.x, netL.y); ctx.lineTo(netR.x, netR.y); ctx.lineTo(netTopR.x, netTopR.y); ctx.lineTo(netTopL.x, netTopL.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(netTopL.x, netTopL.y); ctx.lineTo(netTopR.x, netTopR.y); ctx.stroke();
    for (let i = 1; i < 11; i += 1) { const x = lerp(netTopL.x, netTopR.x, i / 11); ctx.strokeStyle = 'rgba(226,232,240,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, netTopL.y); ctx.lineTo(x, netL.y); ctx.stroke(); }

    // Faint playable paddle area on the local half. This teaches that the racket
    // can move toward/away from the table, not just left/right.
    const localSign = localSide() === 'h' ? 1 : -1;
    const z1 = projectWorld(-.80, localSign * PADDLE_NEAR_MIN_Y, .012), z2 = projectWorld(.80, localSign * PADDLE_NEAR_MIN_Y, .012);
    const z3 = projectWorld(.80, localSign * Math.min(TABLE_HALF_Y, PADDLE_NEAR_MAX_Y), .012), z4 = projectWorld(-.80, localSign * Math.min(TABLE_HALF_Y, PADDLE_NEAR_MAX_Y), .012);
    ctx.save(); ctx.beginPath(); ctx.moveTo(z1.x,z1.groundY); ctx.lineTo(z2.x,z2.groundY); ctx.lineTo(z3.x,z3.groundY); ctx.lineTo(z4.x,z4.groundY); ctx.closePath();
    ctx.fillStyle='rgba(34,211,238,.035)'; ctx.fill(); ctx.strokeStyle='rgba(103,232,249,.16)'; ctx.lineWidth=2; ctx.setLineDash([10,12]); ctx.stroke(); ctx.restore();
  }

  function drawAimArrow(ctx, g) {
    if (!g || g.phase !== 'rally') return;
    const lb = localBall(g);
    const returnOpen = lb.vy > 0 && lb.bounces >= 1 && lb.returnableSide === 'h';
    if (!returnOpen) return;
    const fresh = performance.now() - Number(r.localInput.intentAt || 0) <= SHOT_INTENT_HOLD_MS;
    const aim = fresh ? clamp(r.localInput.shotAim, -1, 1) : 0;
    const power = fresh ? clamp(r.localInput.shotPower, .14, 1) : .42;
    const me = localSide();
    const paddle = r.role === 'guest' ? { x: r.localInput.x, y: r.localInput.y } : g.paddles[me];
    if (!paddle) return;
    const startLocal = { x: paddle.x, y: paddle.y };
    const targetLocal = { x: aim * SHOT_TARGET_X, y: -lerp(.38, .94, power) };
    const startCanonical = r.role === 'guest' ? { x: -startLocal.x, y: -startLocal.y } : startLocal;
    const targetCanonical = r.role === 'guest' ? { x: -targetLocal.x, y: -targetLocal.y } : targetLocal;
    const a = projectWorld(startCanonical.x, startCanonical.y, .13);
    const t = projectWorld(targetCanonical.x, targetCanonical.y, .02);
    const style = fresh ? r.localInput.shotStyle : 'DRIVE';
    const color = style === 'SMASH' ? '#fbbf24' : style === 'POWER' ? '#fb7185' : style === 'SOFT' ? '#86efac' : '#67e8f9';
    ctx.save(); ctx.globalAlpha = fresh ? .82 : .36; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = fresh ? 5 : 3; ctx.setLineDash(fresh ? [12,8] : [7,10]);
    ctx.beginPath(); ctx.moveTo(a.x, a.y - 40); ctx.quadraticCurveTo((a.x+t.x)/2, Math.min(a.y,t.groundY)-90, t.x, t.groundY); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.ellipse(t.x, t.groundY, 34 * t.scale, 15 * t.scale, 0, 0, Math.PI*2); ctx.stroke();
    ctx.font='900 17px system-ui'; ctx.textAlign='center'; ctx.fillText(`${shotDirectionLabel(aim)} · ${style}`, t.x, t.groundY - 28); ctx.restore();
  }

  function drawPaddles(ctx, g, now) {
    const me = localSide();
    drawPaddle(ctx, g, g.paddles[remoteSide()], remoteSide(), false, now);
    drawPaddle(ctx, g, g.paddles[me], me, true, now);
  }

  function drawPaddle(ctx, g, paddle, side, local, now) {
    if (!paddle) return;
    const incoming = g.phase === 'rally' && g.ball.returnableSide === side && g.ball.bounces >= 1 && movingTowardSide(g.ball, side);
    const proximity = incoming ? clamp(1 - Math.hypot((g.ball.x - paddle.x) / .55, (g.ball.y - paddle.y) / .50), 0, 1) : 0;
    const lift = .10 + proximity * .13;
    const p = projectWorld(paddle.x, paddle.y, lift);
    const radius = (local ? 45 : 31) * p.scale;
    const motionTilt = clamp(paddle.vx * .13, -.28, .28);
    const swing = clamp(Number(paddle.swing || 0), 0, 1);
    const swingTilt = swing * (.42 + Math.abs(paddle.swingDir || 0) * .20) * (side === 'h' ? -1 : 1);
    const angle = (local ? -.10 : .10) + motionTilt + swingTilt;
    const faceSquash = 1 - swing * .13;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
    ctx.strokeStyle = local ? '#67e8f9' : '#fb7185'; ctx.lineWidth = local ? 12 : 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(radius * .28, radius * .48); ctx.lineTo(radius * .68, radius * 1.32); ctx.stroke();
    const grad = ctx.createRadialGradient(-radius * .26, -radius * .34, radius * .05, 0, 0, radius); grad.addColorStop(0, local ? '#ecfeff' : '#fff1f2'); grad.addColorStop(.20, local ? '#22d3ee' : '#fb7185'); grad.addColorStop(1, local ? '#075985' : '#9f1239');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(0, 0, radius * .88, radius * faceSquash, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = local ? 4 : 3; ctx.stroke();
    ctx.globalAlpha = .32; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-radius * .10, -radius * .10, radius * .48, Math.PI * 1.08, Math.PI * 1.72); ctx.stroke(); ctx.globalAlpha = 1;
    if (incoming && local) { ctx.strokeStyle = `rgba(103,232,249,${.42 + .28 * Math.sin(now * .012)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.18, radius * 1.18, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }

  function updateTrail(g, now) {
    if (g.phase !== 'rally') { if (g.phase === 'serve') r.ballTrail.length = 0; return; }
    if (now - r.trailStamp < 30) return; r.trailStamp = now;
    r.ballTrail.push({ x: g.ball.x, y: g.ball.y, z: g.ball.z, at: now });
    if (r.ballTrail.length > 9) r.ballTrail.shift();
  }

  function drawBall(ctx, g, now) {
    r.ballTrail.forEach((row, index) => { const p = projectWorld(row.x, row.y, row.z); const alpha = (index + 1) / r.ballTrail.length * .16; ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.beginPath(); ctx.arc(p.x, p.y, 4 + index * .35, 0, Math.PI * 2); ctx.fill(); });
    const shadow = projectWorld(g.ball.x, g.ball.y, 0), ball = projectWorld(g.ball.x, g.ball.y, g.ball.z); const radius = lerp(7, 13, ball.t);
    ctx.fillStyle = `rgba(0,0,0,${clamp(.28 - g.ball.z * .13, .08, .28)})`; ctx.beginPath(); ctx.ellipse(shadow.x, shadow.groundY, radius * 1.35, radius * .55, 0, 0, Math.PI * 2); ctx.fill();
    const glow = ctx.createRadialGradient(ball.x - radius * .3, ball.y - radius * .3, 1, ball.x, ball.y, radius * 1.2); glow.addColorStop(0, '#ffffff'); glow.addColorStop(.55, '#f8fafc'); glow.addColorStop(1, '#dbeafe'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(14,116,144,.42)'; ctx.lineWidth = 2; ctx.stroke();
  }

  function nextBounce(g) {
    if (!g || g.phase !== 'rally') return null;
    const b = g.ball; const disc = b.vz * b.vz + 2 * GRAVITY * Math.max(.001, b.z);
    const t = (b.vz + Math.sqrt(Math.max(0, disc))) / GRAVITY;
    if (!Number.isFinite(t) || t <= 0 || t > 2.4) return null;
    return { x: b.x + b.vx * t, y: b.y + b.vy * t, t };
  }

  function localBall(g) { const b = g.ball; return r.role === 'guest' ? { ...b, x: -b.x, y: -b.y, vx: -b.vx, vy: -b.vy, lastHitter: otherSide(b.lastHitter), returnableSide: b.returnableSide ? otherSide(b.returnableSide) : '' } : { ...b }; }
  function isBallApproachingLocal(g) { if (!g || g.phase !== 'rally') return false; return localBall(g).vy > 0; }

  function drawTargetLabel(ctx, x, y, text, color) {
    ctx.save(); ctx.font = '900 21px system-ui'; ctx.textAlign = 'center'; const w = ctx.measureText(text).width + 24; ctx.fillStyle = 'rgba(2,12,24,.78)'; ctx.fillRect(x - w / 2, y - 18, w, 30); ctx.fillStyle = color; ctx.fillText(text, x, y + 4); ctx.restore();
  }

  function drawIndicators(ctx, g, now) {
    if (g.phase !== 'rally') return;
    const lb = localBall(g); if (lb.vy <= 0) return;
    const me = localSide();
    const localPaddle = r.role === 'guest' ? { x: r.localInput.x, y: r.localInput.y } : { x: g.paddles[me]?.x || 0, y: g.paddles[me]?.y || .9 };
    const bounce = nextBounce(g);
    if (bounce && lb.bounces === 0) {
      const localBounce = r.role === 'guest' ? { x: -bounce.x, y: -bounce.y } : bounce;
      if (localBounce.y > 0 && Math.abs(localBounce.x) <= 1.05) {
        const canonical = r.role === 'guest' ? { x: -localBounce.x, y: -localBounce.y } : localBounce;
        const p = projectWorld(canonical.x, canonical.y, 0); const pulse = 1 + .08 * Math.sin(now * .012);
        ctx.save(); ctx.strokeStyle = 'rgba(250,204,21,.92)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(p.x, p.groundY, 38 * p.scale * pulse, 17 * p.scale * pulse, 0, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = 'rgba(250,204,21,.22)'; ctx.lineWidth = 16; ctx.stroke(); ctx.restore();
        drawTargetLabel(ctx, p.x, p.groundY - 38, lb.isServe && lb.serveStage < 2 ? 'SERVE BOUNCE' : '1st BOUNCE', '#fde047');
      }
    }
    if (lb.bounces >= 1 && lb.returnableSide === 'h') {
      const look = clamp(.10 + (lb.y < .72 ? .07 : 0), .08, .18);
      const tx = clamp(lb.x + lb.vx * look, -.86, .86), ty = clamp(lb.y + lb.vy * look, PADDLE_NEAR_MIN_Y, PADDLE_NEAR_MAX_Y);
      const canonical = r.role === 'guest' ? { x: -tx, y: -ty } : { x: tx, y: ty };
      const p = projectWorld(canonical.x, canonical.y, .04);
      const aligned = Math.hypot((tx - localPaddle.x) / PADDLE_RADIUS_X, (ty - localPaddle.y) / PADDLE_RADIUS_Y) < 1.12;
      ctx.save(); ctx.strokeStyle = aligned ? 'rgba(74,222,128,.92)' : 'rgba(103,232,249,.84)'; ctx.lineWidth = aligned ? 7 : 5; ctx.setLineDash(aligned ? [] : [10, 9]); ctx.beginPath(); ctx.ellipse(p.x, p.groundY, 50 * p.scale, 22 * p.scale, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      drawTargetLabel(ctx, p.x, p.groundY - 42, aligned ? 'READY' : 'MOVE RACKET HERE', aligned ? '#86efac' : '#67e8f9');
      const ppCanonical = r.role === 'guest' ? { x: -localPaddle.x, y: -localPaddle.y } : localPaddle;
      const pp = projectWorld(ppCanonical.x, ppCanonical.y, .08);
      ctx.save(); ctx.strokeStyle = aligned ? 'rgba(74,222,128,.35)' : 'rgba(103,232,249,.28)'; ctx.lineWidth = 3; ctx.setLineDash([8,10]); ctx.beginPath(); ctx.moveTo(pp.x, pp.y); ctx.lineTo(p.x, p.groundY); ctx.stroke(); ctx.restore();
    }
  }

  function drawEffects(ctx, now) {
    r.effects = r.effects.filter(fx => now - fx.born < fx.ttl);
    r.effects.forEach(fx => {
      const t = clamp((now - fx.born) / fx.ttl, 0, 1); const p = projectWorld(fx.x, fx.y, fx.z);
      ctx.save(); ctx.globalAlpha = 1 - t; ctx.textAlign = 'center'; ctx.font = `900 ${Math.round(28 + 18 * (1 - t))}px system-ui`; ctx.fillStyle = fx.quality === 'SMASH' ? '#fbbf24' : fx.quality === 'PERFECT' ? '#67e8f9' : fx.kind === 'point' ? '#f8fafc' : '#dbeafe';
      if (fx.kind === 'hit') ctx.fillText(fx.quality || 'HIT', p.x, p.y - 52 - t * 35);
      else if (fx.kind === 'net') ctx.fillText('NET!', WORLD_W / 2, 500 - t * 25);
      else if (fx.kind === 'point') ctx.fillText(fx.side === localSide() ? 'YOUR POINT!' : 'OPPONENT POINT', WORLD_W / 2, 410 - t * 30);
      if (fx.kind === 'hit' || fx.kind === 'bounce') { ctx.strokeStyle = fx.kind === 'hit' ? '#67e8f9' : '#fff'; ctx.lineWidth = 5 * (1 - t); ctx.beginPath(); ctx.arc(p.x, fx.kind === 'bounce' ? p.groundY : p.y, 20 + t * 45, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
    });
  }


  function drawPointFeedback(ctx, g) {
    if (!g || g.phase !== 'point') return;
    const mine = g.pointWinner === localSide();
    ctx.save();
    ctx.fillStyle = 'rgba(2,12,24,.84)';
    ctx.fillRect(128, 350, WORLD_W - 256, 132);
    ctx.strokeStyle = mine ? 'rgba(74,222,128,.75)' : 'rgba(251,113,133,.72)'; ctx.lineWidth = 4; ctx.strokeRect(128,350,WORLD_W-256,132);
    ctx.textAlign='center'; ctx.fillStyle = mine ? '#86efac' : '#fda4af'; ctx.font='1000 34px system-ui'; ctx.fillText(mine ? 'YOU SCORE!' : 'OPPONENT SCORES', WORLD_W/2, 398);
    ctx.fillStyle='#e2e8f0'; ctx.font='800 18px system-ui'; const reason=String(g.message||'').slice(0,72); ctx.fillText(reason, WORLD_W/2, 438);
    ctx.restore();
  }

  function updateHud(game = null) {
    const g = game || getRenderState(); if (!g) return; const me = localSide(), them = remoteSide();
    $('[data-local-score]').textContent = g.score[me]; $('[data-remote-score]').textContent = g.score[them];
    const meta = MATCH_TYPES[g.target] || MATCH_TYPES[7]; $('[data-match-chip]').textContent = meta.label; $('[data-serve-label]').textContent = `FIRST TO ${g.target} · WIN BY 2`;
    let rally = 'GET READY'; if (g.phase === 'rally') rally = g.rally > 0 ? `RALLY ${g.rally}` : 'RETURN THE BALL'; else if (g.phase === 'serve') rally = g.server === me ? 'YOUR SERVE' : 'OPPONENT SERVE'; else if (g.phase === 'point') rally = g.pointWinner === me ? 'YOUR POINT!' : 'OPPONENT POINT';
    $('[data-rally-label]').textContent = rally;
  }

  function updateControlUi(game = null) {
    const g = game || getRenderState(); if (!g) return;
    const me = localSide(), approaching = isBallApproachingLocal(g), lb = localBall(g);
    const callout = $('[data-callout]');
    const localP = r.role === 'guest' ? { x: r.localInput.x, y: r.localInput.y } : { x: g.paddles[me]?.x || 0, y: g.paddles[me]?.y || .9 };
    const returnOpen = g.phase === 'rally' && approaching && lb.bounces >= 1 && lb.returnableSide === 'h';
    const aligned = returnOpen && Math.hypot((lb.x - localP.x) / .34, (lb.y - localP.y) / .30) < 1.35;
    const fresh = performance.now() - Number(r.localInput.intentAt || 0) <= SHOT_INTENT_HOLD_MS;
    const style = fresh ? r.localInput.shotStyle : 'DRIVE';
    if (callout) {
      const imminent = returnOpen && lb.y > localP.y - .24 && lb.y < localP.y + .16;
      callout.hidden = !imminent;
      if (imminent) callout.textContent = aligned ? `${style}!` : 'MOVE TO BALL!';
    }
    const title = $('[data-control-title]'), copy = $('[data-control-copy]');
    if (g.phase === 'serve') {
      if (title) title.textContent = g.server === me ? 'YOUR SERVE' : 'OPPONENT SERVE';
      if (copy) copy.textContent = g.server === me ? 'Position the racket. After the serve, use your swing gesture to choose placement and power.' : 'Watch the serve: it must bounce on both sides before you return.';
    } else if (g.phase === 'point') {
      if (title) title.textContent = g.pointWinner === me ? 'YOU SCORE!' : 'OPPONENT SCORES';
      if (copy) copy.textContent = g.message || 'Preparing the next serve.';
    } else if (returnOpen) {
      if (title) title.textContent = aligned ? `READY · ${style}` : 'MOVE RACKET TO CYAN GUIDE';
      if (copy) copy.textContent = aligned ? 'At contact: flick LEFT/RIGHT to place · push toward NET harder for POWER/SMASH · pull gently BACK for a SOFT drop.' : 'First get behind the ball. Then shape the shot with your final flick near contact.';
    } else if (approaching) {
      if (title) title.textContent = 'WATCH THE YELLOW BOUNCE';
      if (copy) copy.textContent = 'Let it bounce once. Move into position first; your final flick near contact controls the shot.';
    } else {
      if (title) title.textContent = 'RECOVER TO CENTER';
      if (copy) copy.textContent = 'Return to center. Next shot: ←/→ placement · toward net = more power · gentle pullback = soft drop.';
    }
    updatePowerUi();
  }

  function updatePowerUi() {
    const bar = $('[data-power-bar]'), label = $('[data-power-label]'), direction = $('[data-shot-direction]'), styleEl = $('[data-shot-style]');
    const fresh = performance.now() - Number(r.localInput.intentAt || 0) <= SHOT_INTENT_HOLD_MS;
    const power = fresh ? clamp(r.localInput.shotPower, .14, 1) : .42;
    const aim = fresh ? clamp(r.localInput.shotAim, -1, 1) : 0;
    const style = fresh ? r.localInput.shotStyle : 'DRIVE';
    if (bar) bar.style.width = `${Math.round(power * 100)}%`;
    if (label) label.textContent = style === 'SOFT' ? 'SOFT / DROP' : style === 'SMASH' ? 'MAX POWER' : style === 'POWER' ? 'POWER' : 'NORMAL';
    if (direction) direction.textContent = aim < -.28 ? '↖ LEFT' : aim > .28 ? 'RIGHT ↗' : '↑ CENTER';
    if (styleEl) styleEl.textContent = style;
  }

  function captureShotIntent(rawVx, rawVy, now = performance.now()) {
    const g = getRenderState(now); if (!g || g.phase !== 'rally') return;
    const lb = localBall(g); if (!(lb.vy > 0 && lb.bounces >= 1 && lb.returnableSide === 'h')) return;
    const paddleY = r.localInput.y;
    if (lb.y < paddleY - .58 || lb.y > paddleY + .30) return;
    const forward = Math.max(0, -rawVy);
    const pullback = Math.max(0, rawVy);
    const lateral = clamp(rawVx / 2.15, -1, 1);
    const deliberate = Math.hypot(rawVx, rawVy) > .22;
    if (!deliberate) return;
    let power = clamp(.30 + forward * .25 + Math.abs(rawVx) * .035 - pullback * .10, .16, 1);
    let style = 'DRIVE';
    if (pullback > .72 && forward < .18) { power = clamp(.18 + Math.abs(rawVx) * .025, .16, .30); style = 'SOFT'; }
    else if (forward > 2.05 && Math.hypot(rawVx, rawVy) > 2.25) { power = clamp(.88 + (forward - 2.05) * .08, .88, 1); style = 'SMASH'; }
    else if (forward > 1.08) { power = clamp(.66 + (forward - 1.08) * .11, .66, .86); style = 'POWER'; }
    else if (power < .30) style = 'SOFT';
    r.localInput.shotAim = Math.abs(lateral) > .10 ? lateral : clamp(r.localInput.shotAim * .72, -.32, .32);
    r.localInput.shotPower = power; r.localInput.shotStyle = style; r.localInput.intentAt = now;
  }

  function canvasLocalPoint(event) {
    const canvas = $('[data-canvas]'); if (!canvas) return { x: 0, y: .9 };
    const rect = r.canvasRect || canvas.getBoundingClientRect(); r.canvasRect = rect;
    const px = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1) * WORLD_W;
    const py = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1) * WORLD_H;
    const t = clamp((py - 218) / (948 - 218), 0, 1);
    const halfW = lerp(238, 398, t);
    const x = clamp(((px - WORLD_W / 2) / Math.max(1, halfW)) * TABLE_HALF_X, -.82, .82);
    const y = clamp(lerp(-1.08, 1.08, t) - .06, PADDLE_NEAR_MIN_Y, PADDLE_NEAR_MAX_Y);
    return { x, y };
  }

  function onPointerDown(event) {
    if (!r.open || r.state !== 'game' || r.paused) return;
    event.preventDefault(); const canvas = $('[data-canvas]'); try { canvas?.setPointerCapture?.(event.pointerId); } catch (_) {}
    const point = canvasLocalPoint(event); r.localInput.pointerDown = true; r.localInput.lastX = point.x; r.localInput.lastY = point.y; r.localInput.lastAt = performance.now();
    r.localInput.x = point.x; r.localInput.y = point.y; r.localInput.vx = 0; r.localInput.vy = 0; applyLocalInput(true);
  }

  function onPointerMove(event) {
    if (!r.localInput.pointerDown || r.state !== 'game' || r.paused) return;
    event.preventDefault(); const now = performance.now(), point = canvasLocalPoint(event), dt = Math.max(.012, (now - (r.localInput.lastAt || now)) / 1000);
    const rawVx = (point.x - r.localInput.lastX) / dt, rawVy = (point.y - r.localInput.lastY) / dt;
    r.localInput.vx = clamp(r.localInput.vx * .26 + rawVx * .74, -4.2, 4.2);
    r.localInput.vy = clamp(r.localInput.vy * .26 + rawVy * .74, -3.2, 3.2);
    r.localInput.x = point.x; r.localInput.y = point.y; r.localInput.lastX = point.x; r.localInput.lastY = point.y; r.localInput.lastAt = now;
    captureShotIntent(rawVx, rawVy, now); applyLocalInput(false);
  }

  function onPointerUp(event) {
    if (!r.localInput.pointerDown) return;
    event.preventDefault(); r.localInput.pointerDown = false; r.localInput.vx *= .45; r.localInput.vy *= .45; applyLocalInput(true); try { $('[data-canvas]')?.releasePointerCapture?.(event.pointerId); } catch (_) {}
  }

  function onKeyDown(event) {
    if (!r.open || r.state !== 'game' || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
    if (['ArrowLeft', 'a', 'A'].includes(event.key)) { r.keys.left = true; event.preventDefault(); }
    if (['ArrowRight', 'd', 'D'].includes(event.key)) { r.keys.right = true; event.preventDefault(); }
    if (['ArrowUp', 'w', 'W'].includes(event.key)) { r.keys.up = true; event.preventDefault(); }
    if (['ArrowDown', 's', 'S'].includes(event.key)) { r.keys.down = true; event.preventDefault(); }
  }
  function onKeyUp(event) {
    if (['ArrowLeft', 'a', 'A'].includes(event.key)) r.keys.left = false;
    if (['ArrowRight', 'd', 'D'].includes(event.key)) r.keys.right = false;
    if (['ArrowUp', 'w', 'W'].includes(event.key)) r.keys.up = false;
    if (['ArrowDown', 's', 'S'].includes(event.key)) r.keys.down = false;
  }

  function rematchReady() {
    if (isSolo()) { countdown(startMatch); return; }
    r.localNextReady = !r.localNextReady; r.session?.send({ t: 'nextReady', v: r.localNextReady }); updateResultReady();
    if (r.role === 'host' && r.localNextReady && r.remoteNextReady) beginCountdown(true);
  }

  function updateResultReady() {
    const button = $('[data-rematch]');
    if (isSolo()) { if (button) button.textContent = 'REMATCH BOT'; status('[data-result-status]', `Solo · ${AI_LEVELS[r.aiDifficulty]?.label || 'NORMAL'} Code Bot`, false, true); return; }
    if (button) button.textContent = r.localNextReady ? 'READY ✓' : 'REMATCH';
    status('[data-result-status]', r.localNextReady && r.remoteNextReady ? 'Both ready — starting…' : r.localNextReady ? 'Waiting for opponent…' : r.remoteNextReady ? 'Opponent is ready.' : 'Both players press REMATCH when ready.', false, r.localNextReady && r.remoteNextReady);
  }

  function showResult(game = null) {
    const g = game || r.game || r.netTarget; if (!g) return; r.resultShown = true; show('result'); const me = localSide(), them = remoteSide(), won = g.winner === me;
    $('[data-result-icon]').textContent = won ? '🏆' : '🏁'; $('[data-result-title]').textContent = won ? 'YOU WIN!' : (isSolo() ? 'CODE BOT WINS' : 'OPPONENT WINS');
    $('[data-result-sub]').textContent = won ? 'Sharp placement and clean returns.' : 'Good rally. Reposition earlier and use the landing guide.';
    $('[data-result-local]').textContent = g.score[me]; $('[data-result-remote]').textContent = g.score[them]; $('[data-result-rally]').textContent = g.longestRally; $('[data-result-match]').textContent = MATCH_TYPES[g.target]?.label || 'QUICK 7';
    r.localNextReady = r.remoteNextReady = false; updateResultReady();
  }

  function pauseGame(text) { r.paused = true; r.pauseStartedAt = performance.now(); const panel = $('[data-pause]'); if (panel) panel.hidden = false; $('[data-pause-text]').textContent = text || 'Paused.'; r.music?.pause?.(); }
  function resumeGame() {
    if (isAuthority() && r.game && r.pauseStartedAt) { const delta = performance.now() - r.pauseStartedAt; if (r.game.serveAt) r.game.serveAt += delta; if (r.game.phaseUntil) r.game.phaseUntil += delta; }
    r.pauseStartedAt = 0; r.paused = false; const panel = $('[data-pause]'); if (panel) panel.hidden = true; r.lastFrameAt = performance.now(); if (r.bridge?.getSnapshot?.()?.soundEnabled !== false) r.music?.resume?.(); ensureLoop();
  }
  function pauseLocal(reason = 'pause') { if (r.state !== 'game' || r.paused) return false; r.exitPaused = true; pauseGame(reason === 'hidden' ? 'Match paused while the app is in the background.' : 'Match paused safely.'); r.session?.send({ t: 'pause' }); $('[data-resume]').hidden = false; return true; }
  function resumeLocal() { if (!r.exitPaused) return false; r.exitPaused = false; $('[data-resume]').hidden = true; if (!r.remotePaused) resumeGame(); r.session?.send({ t: 'resume' }); return true; }
  function visibilityChanged() { if (!r.open || r.state !== 'game') return; if (document.hidden) pauseLocal('hidden'); else if (r.exitPaused) resumeLocal(); }

  function showDisconnectedNotice(text) {
    if (!r.open || !['game', 'lobby', 'result'].includes(r.state)) return; r.remotePaused = true; pauseGame(text || 'Opponent left the match.');
    $('[data-pause-title]').textContent = 'CONNECTION LOST'; $('[data-resume]').hidden = true; $('[data-disconnect-actions]').hidden = false;
  }
  function clearDisconnectNotice() { const actions = $('[data-disconnect-actions]'); if (actions) actions.hidden = true; const title = $('[data-pause-title]'); if (title) title.textContent = 'MATCH PAUSED'; }
  function exitDisconnectedMatch() { clearDisconnectNotice(); resetGameRuntime(); show('home'); if (r.bridge?.getSnapshot?.()?.soundEnabled !== false) r.music?.resume?.(); }

  function toggleSound() {
    const next = !(r.bridge?.getSnapshot?.()?.soundEnabled !== false); r.bridge?.setSoundEnabled?.(next); r.soundEnabled = next; $('[data-sound]').textContent = next ? '🔊' : '🔇'; if (next && !r.paused) r.music?.resume?.(); else r.music?.pause?.();
  }

  function ensureAudio() { if (r.audio) return r.audio; try { r.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {} return r.audio; }
  function sfx(kind) {
    if (r.bridge?.getSnapshot?.()?.soundEnabled === false) return; const a = ensureAudio(); if (!a) return;
    const table = {
      ready: [520, 700, .07, 'triangle', .11], connect: [620, 900, .08, 'sine', .14], count: [370, 390, .07, 'triangle', .10], go: [760, 1050, .10, 'triangle', .16],
      serve: [300, 520, .08, 'triangle', .10], hit: [220, 430, .10, 'triangle', .08], perfect: [430, 820, .13, 'sine', .12], smash: [150, 620, .17, 'square', .14],
      bounce: [180, 240, .055, 'sine', .06], net: [125, 90, .08, 'square', .12], point: [620, 980, .12, 'triangle', .16], pointLost: [220, 150, .09, 'sawtooth', .13], win: [620, 1180, .14, 'sine', .24], lose: [240, 120, .10, 'sawtooth', .18]
    };
    const row = table[kind] || table.hit; const now = a.currentTime;
    try { if (a.state === 'suspended') a.resume(); const osc = a.createOscillator(), gain = a.createGain(); osc.type = row[3]; osc.frequency.setValueAtTime(row[0], now); osc.frequency.exponentialRampToValueAtTime(Math.max(45, row[1]), now + row[4]); gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(row[2], now + .006); gain.gain.exponentialRampToValueAtTime(.0001, now + row[4] + .06); osc.connect(gain).connect(a.destination); osc.start(now); osc.stop(now + row[4] + .08); } catch (_) {}
  }
  function vibrate(ms) { try { navigator?.vibrate?.(ms); } catch (_) {} }

  function resetGameRuntime() {
    cancelAnimationFrame(r.raf); r.raf = 0; closeScanner(); try { r.session?.close?.(); } catch (_) {} r.session = null;
    r.role = ''; r.game = null; r.netTarget = null; r.localReady = r.remoteReady = false; r.localNextReady = r.remoteNextReady = false; r.configReceived = false; r.paused = r.remotePaused = r.exitPaused = false; r.pauseStartedAt = 0; r.hostCode = r.answerCode = ''; r.countdownActive = false; r.ballTrail.length = 0; r.effects.length = 0; r.keys.left = r.keys.right = r.keys.up = r.keys.down = false; clearDisconnectNotice(); const pause = $('[data-pause]'); if (pause) pause.hidden = true;
  }

  function reset() { resetGameRuntime(); show('home'); }
  function returnHub() { const callback = r.onBack; close(false); callback?.(); }
  function close(callOnClose = true) { if (!r.open) return; r.invites?.stop?.({ cleanup: true }); resetGameRuntime(); r.open = false; r.overlay.hidden = true; document.body.classList.remove('p2p0-active'); if (callOnClose) r.onClose?.(); }

  function open(options = {}) {
    build(); r.bridge = options.bridge || null; r.music = options.music || null; r.onBack = options.onBack || null; r.onClose = options.onClose || null;
    r.open = true; r.overlay.hidden = false; document.body.classList.add('p2p0-active'); reset(); ensureStudentInvites(); r.invites?.start?.();
    const identity = r.bridge?.getPlayerIdentity?.(); if (identity?.name && $('[data-solo-name]')) $('[data-solo-name]').value = identity.name;
    r.soundEnabled = r.bridge?.getSnapshot?.()?.soundEnabled !== false; $('[data-sound]').textContent = r.soundEnabled ? '🔊' : '🔇'; ensureLoop();
  }

  window[GLOBAL_NAME] = Object.freeze({ open, close: () => close(true), isOpen: () => r.open, pauseForExitGuard: () => pauseLocal('Match paused safely.'), resumeFromExitGuard: resumeLocal });
})();
