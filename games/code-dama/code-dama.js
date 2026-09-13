(() => {
  'use strict';

  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }

  const GAME_ID = 'code-dama';
  const PREFIX = 'CDM1';
  const GLOBAL_NAME = 'ICT8CodeDama';
  const BOARD_SIZE = 8;
  const SPEED_TURN_MS = 30000;
  const BLITZ_CLOCK_MS = 180000;
  const KING_RUSH_TARGET = 3;
  const POWER_KEYS = Object.freeze(['freeze', 'extra', 'bomb', 'shield']);
  const POWER_META = Object.freeze({
    freeze: { icon: '🧊', name: 'Freeze', hint: 'Freeze one enemy piece for its next turn.' },
    extra: { icon: '⚡', name: 'Extra Move', hint: 'Move twice after a normal non-capture.' },
    bomb: { icon: '💣', name: 'Bomb', hint: 'Remove one adjacent enemy normal piece. Ends your turn.' },
    shield: { icon: '🛡️', name: 'Shield', hint: 'Protect one piece from one capture attempt.' }
  });
  const MODES = Object.freeze({
    classic: { label: 'CLASSIC DAMA', short: 'Standard mandatory-capture Dama.' },
    speed: { label: 'SPEED DAMA', short: '30 seconds per turn.', turnMs: SPEED_TURN_MS },
    blitz: { label: 'BLITZ', short: '3-minute total clock per player.', blitzMs: BLITZ_CLOCK_MS },
    king: { label: 'KING RUSH', short: `First to ${KING_RUSH_TARGET} Kings wins.`, kingTarget: KING_RUSH_TARGET },
    power: { label: 'POWER DAMA', short: 'Dama with Freeze, Extra Move, Bomb, and Shield.', powers: true }
  });

  const AI_LEVELS = Object.freeze({
    'very-easy': { label: 'VERY EASY', short: 'Relaxed bot. Mostly random legal moves.', depth: 0, budgetMs: 0, thinkMin: 420, thinkMax: 650, randomChance: 1, topChoices: 99, powerChance: .10 },
    easy: { label: 'EASY', short: 'Notices captures and simple promotions, but still makes mistakes.', depth: 1, budgetMs: 55, thinkMin: 480, thinkMax: 720, randomChance: .42, topChoices: 3, powerChance: .30 },
    medium: { label: 'MEDIUM', short: 'Balanced tactical play with short look-ahead.', depth: 2, budgetMs: 140, thinkMin: 520, thinkMax: 760, randomChance: .14, topChoices: 2, powerChance: .55 },
    hard: { label: 'HARD', short: 'Stronger board evaluation and deeper tactical search.', depth: 4, budgetMs: 280, thinkMin: 560, thinkMax: 820, randomChance: .035, topChoices: 1, powerChance: .76 },
    'very-hard': { label: 'VERY HARD', short: 'Deepest search, strongest evaluation, almost no intentional mistakes.', depth: 6, budgetMs: 430, thinkMin: 600, thinkMax: 880, randomChance: 0, topChoices: 1, powerChance: .92 }
  });

  const P = () => window.ICT8ZeroDbP2P;
  const r = {
    built: false, open: false, bridge: null, music: null, onBack: null, onClose: null,
    overlay: null, panels: {}, session: null, invites: null, scannerStop: null,
    role: '', localName: 'PLAYER 1', remoteName: 'PLAYER 2', seed: 1,
    hostCode: '', answerCode: '', state: 'home', config: { mode: 'classic', series: 1 }, configReceived: false,
    localReady: false, remoteReady: false, localNextReady: false, remoteNextReady: false,
    game: null, selected: -1, selectedPower: '', actionPending: false,
    paused: false, remotePaused: false, exitPaused: false,
    timerId: 0, lastClockAt: 0, lastTimerBroadcast: 0,
    audio: null, powerToastTimer: 0,
    aiDifficulty: 'medium', aiTimer: 0, aiThinking: false
  };

  const $ = sel => r.overlay?.querySelector(sel) || null;
  const $$ = sel => Array.from(r.overlay?.querySelectorAll(sel) || []);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const sideOther = side => side === 'h' ? 'g' : 'h';
  const localSide = () => r.role === 'guest' ? 'g' : 'h';
  const remoteSide = () => sideOther(localSide());
  const isSolo = () => r.role === 'solo';
  const isAuthority = () => r.role === 'host' || r.role === 'solo';
  const aiLevel = () => AI_LEVELS[r.aiDifficulty] || AI_LEVELS.medium;
  const idx = (row, col) => row * BOARD_SIZE + col;
  const rowOf = index => Math.floor(index / BOARD_SIZE);
  const colOf = index => index % BOARD_SIZE;
  const inside = (row, col) => row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  const deepClone = value => JSON.parse(JSON.stringify(value));

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function hash32(value = '') {
    let h = 2166136261 >>> 0;
    for (const ch of String(value)) {
      h ^= ch.charCodeAt(0);
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

  function build() {
    if (r.built) return;
    const o = document.createElement('div');
    o.className = 'p2p0-overlay dama-overlay';
    o.hidden = true;
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-label', 'Code Dama solo or live two-player game');
    o.innerHTML = `
      <section class="p2p0-shell">
        <header class="p2p0-top">
          <button type="button" data-back>← MINI-GAMES</button>
          <div class="p2p0-brand"><span>♟️</span><div><small>SOLO / 1V1 · NO XP</small><strong>CODE DAMA</strong></div></div>
          <div class="p2p0-top-actions"><button type="button" data-sound aria-label="Toggle game sound">🔊</button><button type="button" data-close aria-label="Close Code Dama">×</button></div>
        </header>
        <main class="p2p0-main dama-main">
          <section class="p2p0-panel active" data-panel="home">
            <div class="p2p0-card p2p0-home-card dama-home">
              <span class="dama-hero">♟️</span>
              <h1>CODE DAMA</h1>
              <p>Play against the Code Bot on one device, or challenge a classmate in a direct 1v1 match.</p>
              <div class="p2p0-badges"><span>🤖 SOLO</span><span>👥 1V1</span><span>♛ KINGS</span><span>0 XP</span></div>
              <div class="dama-play-choice"><button class="dama-choice primary" type="button" data-solo><span>🤖</span><div><strong>PLAY SOLO</strong><small>Choose AI level from Very Easy to Very Hard.</small></div></button><button class="dama-choice" type="button" data-multiplayer><span>⚔️</span><div><strong>1V1 MULTIPLAYER</strong><small>Create an invite or join another player.</small></div></button></div>
              <small class="p2p0-note">Mandatory captures · multi-capture chains · Kings · direct WebRTC for 1v1.</small>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="solo">
            <div class="p2p0-card p2p0-pair-card dama-solo-card">
              <div class="p2p0-step-head"><span>SOLO</span><strong>Play against the Code Bot</strong></div>
              <div class="dama-match-settings">
                <div class="dama-settings-title"><span>🤖</span><div><strong>BOT CHALLENGE</strong><small>Choose the difficulty and Dama rules before starting.</small></div></div>
                <label class="dama-select-field"><span>AI DIFFICULTY</span><select data-ai-difficulty>
                  <option value="very-easy">Very Easy</option><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option><option value="very-hard">Very Hard</option>
                </select></label>
                <div class="dama-ai-help" data-ai-help></div>
                <label class="dama-select-field"><span>GAME MODE</span><select data-solo-mode-select>
                  <option value="classic">Classic Dama</option><option value="speed">Speed Dama · 30s / turn</option><option value="blitz">Blitz · 3:00 each</option><option value="king">King Rush · first to 3 Kings</option><option value="power">Power Dama</option>
                </select></label>
                <label class="dama-select-field"><span>MATCH SERIES</span><select data-solo-series-select><option value="1">Single Game</option><option value="3">Best of 3</option><option value="5">Best of 5</option></select></label>
              </div>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME</span><input data-solo-name maxlength="20" value="PLAYER 1"></label>
              <button class="p2p0-btn primary" type="button" data-start-solo>START SOLO MATCH</button>
              <div class="p2p0-status dama-solo-note">The bot runs locally on this device. No room, QR, or second player is required.</div>
              <button class="p2p0-btn dama-cancel" type="button" data-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="multi">
            <div class="p2p0-card p2p0-home-card dama-multi-card">
              <span class="dama-lobby-icon">⚔️</span><h2>1V1 MULTIPLAYER</h2>
              <p>One player creates the match; the other joins by QR, share code, or Student ID invite.</p>
              <div class="p2p0-actions p2p0-home-actions"><button class="p2p0-btn primary" type="button" data-host>CREATE / INVITE</button><button class="p2p0-btn" type="button" data-join>JOIN / SCAN QR</button></div>
              <small class="p2p0-note">Direct WebRTC gameplay · same existing 1v1 flow.</small>
              <button class="p2p0-btn dama-cancel" type="button" data-pair-cancel>BACK</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="host">
            <div class="p2p0-card p2p0-pair-card">
              <div class="p2p0-step-head"><span>HOST</span><strong>Create a direct match</strong></div>
              <div class="dama-match-settings">
                <div class="dama-settings-title"><span>⚙️</span><div><strong>MATCH RULES</strong><small>Player 2 receives these rules after connecting.</small></div></div>
                <label class="dama-select-field"><span>GAME MODE</span><select data-mode-select>
                  <option value="classic">Classic Dama</option><option value="speed">Speed Dama · 30s / turn</option><option value="blitz">Blitz · 3:00 each</option><option value="king">King Rush · first to 3 Kings</option><option value="power">Power Dama</option>
                </select></label>
                <label class="dama-select-field"><span>MATCH SERIES</span><select data-series-select><option value="1">Single Game</option><option value="3">Best of 3</option><option value="5">Best of 5</option></select></label>
                <div class="dama-mode-help" data-mode-help></div>
              </div>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME</span><input data-host-name maxlength="20" value="PLAYER 1"></label>
              <div class="p2p0-method-card"><span class="p2p0-method-icon">📷</span><div><strong>QR / SHARE PAIRING</strong><small>Scan or share with Player 2</small></div></div>
              <button class="p2p0-btn primary" type="button" data-make-offer>CREATE HOST QR</button>
              <div class="p2p0-qr" data-host-qr-wrap hidden><img data-host-qr alt="Code Dama Host pairing QR"><strong>PLAYER 2: SCAN THIS QR</strong><small>Then scan their response to complete the direct connection.</small></div>
              <div class="p2p0-mini-actions"><button class="p2p0-btn" type="button" data-copy-offer>COPY INVITE</button><button class="p2p0-btn" type="button" data-share-offer>SHARE INVITE</button><button class="p2p0-btn primary" type="button" data-scan-answer>SCAN RESPONSE</button></div>
              <details class="p2p0-advanced"><summary>Advanced / manual fallback</summary><label class="p2p0-field"><span>PLAYER 2 RESPONSE</span><textarea data-answer-input></textarea></label><button class="p2p0-btn" type="button" data-apply-answer>CONNECT PLAYER 2</button></details>
              <div class="p2p0-status" data-host-status>Choose Student ID invite or QR pairing.</div>
              <button class="p2p0-btn dama-cancel" type="button" data-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="guest">
            <div class="p2p0-card p2p0-pair-card">
              <div class="p2p0-step-head"><span>GUEST</span><strong>Join a direct match</strong></div>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME</span><input data-guest-name maxlength="20" value="PLAYER 2"></label>
              <div class="p2p0-method-card primary-method"><span class="p2p0-method-icon">📷</span><div><strong>QR / SCAN PAIRING</strong><small>Scan the Host QR or paste the invite below</small></div></div>
              <button class="p2p0-btn primary" type="button" data-scan-offer>SCAN HOST QR</button>
              <div class="p2p0-or">OR</div>
              <label class="p2p0-field"><span>HOST INVITE</span><textarea data-offer-input></textarea></label>
              <button class="p2p0-btn" type="button" data-make-answer>CREATE RESPONSE</button>
              <div class="p2p0-qr" data-guest-qr-wrap hidden><img data-guest-qr alt="Code Dama response QR"><strong>HOST: SCAN THIS RESPONSE</strong><small>Share or copy the response if scanning is unavailable.</small></div>
              <div class="p2p0-mini-actions"><button class="p2p0-btn" type="button" data-copy-answer>COPY RESPONSE</button><button class="p2p0-btn" type="button" data-share-answer>SHARE RESPONSE</button></div>
              <div class="p2p0-status" data-guest-status>Scan Host QR, paste an invite, or accept a Student ID invite from the home screen.</div>
              <button class="p2p0-btn dama-cancel" type="button" data-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="lobby">
            <div class="p2p0-card dama-lobby-card">
              <span class="dama-lobby-icon">♟️</span><h2>MATCH CONNECTED</h2>
              <div class="dama-config-summary" data-config-summary></div>
              <div class="p2p0-lobby-grid"><div class="p2p0-player" data-local-player><small>YOU</small><strong data-local-name>PLAYER</strong></div><div class="p2p0-player" data-remote-player><small>OPPONENT</small><strong data-remote-name>OPPONENT</strong></div></div>
              <button class="p2p0-btn primary" type="button" data-ready>I'M READY</button><div class="p2p0-status" data-lobby-status>Waiting for both players.</div>
            </div>
          </section>

          <section class="p2p0-panel dama-game-panel" data-panel="game">
            <div class="dama-game">
              <div class="dama-match-hud">
                <div class="dama-player-hud remote"><small data-remote-hud-label>OPPONENT</small><strong data-remote-hud-name>PLAYER 2</strong><span data-remote-piece-count>12 pieces</span><b data-remote-clock></b></div>
                <div class="dama-center-hud"><span data-mode-chip>CLASSIC DAMA</span><strong data-turn-label>YOUR TURN</strong><small data-series-label>GAME 1</small></div>
                <div class="dama-player-hud local"><small>YOU</small><strong data-local-hud-name>PLAYER 1</strong><span data-local-piece-count>12 pieces</span><b data-local-clock></b></div>
              </div>
              <div class="dama-play-layout">
                <div class="dama-board-column">
                  <div class="dama-board" data-board role="grid" aria-label="Code Dama board"></div>
                  <div class="dama-game-status" data-game-status>Select a piece to move.</div>
                </div>
                <aside class="dama-side-panel">
                  <div class="dama-score-card"><small>SERIES</small><div><strong data-series-local>0</strong><span>—</span><strong data-series-remote>0</strong></div><p data-round-label>Round 1</p></div>
                  <div class="dama-rule-card"><small>RULE</small><strong data-rule-title>MANDATORY CAPTURE</strong><p data-rule-copy>If a capture is available, you must take it.</p></div>
                  <div class="dama-power-panel" data-power-panel hidden><div class="dama-power-head"><small>POWER HAND</small><span>Max 3</span></div><div class="dama-power-list" data-power-list></div><p class="dama-power-help" data-power-help>Tap a power, then choose its target.</p></div>
                </aside>
              </div>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="result">
            <div class="p2p0-card dama-result-card">
              <span class="dama-result-icon" data-result-icon>🏆</span><small data-result-kicker>ROUND COMPLETE</small><h2 data-result-title>YOU WIN!</h2><p data-result-sub>Strong board control.</p>
              <div class="dama-result-grid"><div><small>YOU</small><strong data-result-local-series>0</strong></div><div><small>OPPONENT</small><strong data-result-remote-series>0</strong></div><div><small>MODE</small><strong data-result-mode>CLASSIC</strong></div><div><small>REWARD</small><strong>0 XP</strong></div></div>
              <button class="p2p0-btn primary" type="button" data-next-round>NEXT ROUND</button><div class="p2p0-status" data-result-status>Waiting for both players.</div><button class="p2p0-btn dama-result-hub" type="button" data-result-hub>MINI-GAMES</button>
            </div>
          </section>

          <div class="p2p0-countdown" data-countdown hidden><strong data-countdown-value>3</strong></div>
          <div class="p2p0-pause" data-pause hidden><div><h2 data-pause-title>MATCH PAUSED</h2><p data-pause-text>Waiting…</p><button class="p2p0-btn primary" type="button" data-resume hidden>CONTINUE</button><div class="p2p0-disconnect-actions" data-disconnect-actions hidden><button class="p2p0-btn primary" type="button" data-disconnect-exit>EXIT MATCH</button><button class="p2p0-btn ghost" type="button" data-disconnect-close>CLOSE GAME</button></div></div></div>
          <div class="p2p0-scanner" data-scanner hidden><div class="p2p0-scanner-card"><div class="p2p0-scan-head"><strong data-scan-title>SCAN QR</strong><button type="button" data-scan-close>×</button></div><div class="p2p0-camera"><video data-scan-video playsinline muted></video></div><p class="p2p0-scan-status" data-scan-status>Point camera at QR.</p></div></div>
          <div class="dama-toast" data-toast hidden></div>
        </main>
      </section>`;
    document.body.appendChild(o);
    r.overlay = o;
    $$('[data-panel]').forEach(panel => { r.panels[panel.dataset.panel] = panel; });

    $('[data-back]').onclick = returnHub;
    $('[data-close]').onclick = () => close(true);
    $$('[data-pair-cancel]').forEach(button => { button.onclick = cancelPairing; });
    $('[data-solo]').onclick = () => { show('solo'); renderSoloDifficultyHelp(); };
    $('[data-multiplayer]').onclick = () => show('multi');
    $('[data-host]').onclick = () => show('host');
    $('[data-join]').onclick = () => show('guest');
    $('[data-start-solo]').onclick = startSoloMatch;
    $('[data-ai-difficulty]').onchange = renderSoloDifficultyHelp;
    $('[data-sound]').onclick = toggleSound;
    $('[data-mode-select]').onchange = () => { r.config = readHostConfig(); renderModeHelp(); };
    $('[data-series-select]').onchange = () => { r.config = readHostConfig(); };
    $('[data-make-offer]').onclick = createOffer;
    $('[data-make-answer]').onclick = () => createAnswer($('[data-offer-input]').value);
    $('[data-apply-answer]').onclick = () => applyAnswer($('[data-answer-input]').value);
    $('[data-scan-offer]').onclick = () => scan('offer');
    $('[data-scan-answer]').onclick = () => scan('answer');
    $('[data-scan-close]').onclick = closeScanner;
    $('[data-copy-offer]').onclick = () => copy(r.hostCode, 'Host invite copied.');
    $('[data-share-offer]').onclick = () => share(r.hostCode, 'Code Dama Host Invite');
    $('[data-copy-answer]').onclick = () => copy(r.answerCode, 'Response copied.');
    $('[data-share-answer]').onclick = () => share(r.answerCode, 'Code Dama Response');
    $('[data-ready]').onclick = ready;
    $('[data-board]').addEventListener('click', handleBoardClick);
    $('[data-power-list]').addEventListener('click', handlePowerClick);
    $('[data-next-round]').onclick = nextRoundReady;
    $('[data-result-hub]').onclick = returnHub;
    $('[data-resume]').onclick = resumeLocal;
    $('[data-disconnect-exit]').onclick = exitDisconnectedMatch;
    $('[data-disconnect-close]').onclick = closeDisconnectedGame;
    document.addEventListener('visibilitychange', visibilityChanged);
    renderModeHelp();
    renderSoloDifficultyHelp();
    r.built = true;
  }

  function show(name) {
    Object.entries(r.panels).forEach(([key, panel]) => panel.classList.toggle('active', key === name));
    r.state = name;
    const panel = r.panels[name];
    if (panel) panel.scrollTop = 0;
  }

  function status(selector, text, error = false, ok = false) {
    const el = $(selector);
    if (!el) return;
    el.textContent = String(text || '');
    el.classList.toggle('error', !!error);
    el.classList.toggle('ok', !!ok);
  }

  function toast(text, kind = '') {
    const el = $('[data-toast]');
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
    el.className = `dama-toast ${kind}`.trim();
    clearTimeout(r.powerToastTimer);
    r.powerToastTimer = setTimeout(() => { if (el) el.hidden = true; }, 1300);
  }

  function readHostConfig() {
    const mode = String($('[data-mode-select]')?.value || 'classic');
    const seriesRaw = Number($('[data-series-select]')?.value || 1);
    return { mode: MODES[mode] ? mode : 'classic', series: [1, 3, 5].includes(seriesRaw) ? seriesRaw : 1 };
  }

  function renderModeHelp() {
    const config = readHostConfig();
    const mode = MODES[config.mode];
    const el = $('[data-mode-help]');
    if (!el) return;
    const extras = config.mode === 'power'
      ? '<div class="dama-power-preview"><span>🧊 Freeze</span><span>⚡ Extra Move</span><span>💣 Bomb</span><span>🛡️ Shield</span></div>'
      : '';
    el.innerHTML = `<strong>${escapeHtml(mode.label)}</strong><p>${escapeHtml(mode.short)}</p>${extras}`;
  }

  function renderSoloDifficultyHelp() {
    const key = String($('[data-ai-difficulty]')?.value || r.aiDifficulty || 'medium');
    const level = AI_LEVELS[key] || AI_LEVELS.medium;
    const el = $('[data-ai-help]');
    if (!el) return;
    el.innerHTML = `<strong>${escapeHtml(level.label)}</strong><p>${escapeHtml(level.short)}</p>`;
  }

  function readSoloConfig() {
    const mode = String($('[data-solo-mode-select]')?.value || 'classic');
    const seriesRaw = Number($('[data-solo-series-select]')?.value || 1);
    return { mode: MODES[mode] ? mode : 'classic', series: [1, 3, 5].includes(seriesRaw) ? seriesRaw : 1 };
  }

  function startSoloMatch() {
    clearTimeout(r.aiTimer); r.aiTimer = 0; r.aiThinking = false;
    try { r.session?.close?.(); } catch (_) {}
    r.session = null; r.role = 'solo'; r.configReceived = true;
    const identity = r.bridge?.getPlayerIdentity?.();
    const input = $('[data-solo-name]');
    if (identity?.loggedIn && identity.name && input && (!input.value || input.value === 'PLAYER 1')) input.value = identity.name;
    r.localName = P()?.cleanName ? P().cleanName(input?.value || identity?.name, 'PLAYER 1') : String(input?.value || identity?.name || 'PLAYER 1').slice(0, 20);
    r.aiDifficulty = AI_LEVELS[String($('[data-ai-difficulty]')?.value || '')] ? String($('[data-ai-difficulty]').value) : 'medium';
    r.remoteName = `CODE BOT · ${aiLevel().label}`;
    r.config = readSoloConfig();
    const randomSeed = Math.floor(Math.random() * 0x7fffffff);
    r.seed = (Date.now() ^ randomSeed) >>> 0;
    r.localReady = r.remoteReady = true; r.localNextReady = r.remoteNextReady = false;
    syncNames();
    countdown(() => startNewSeries());
  }

  function renderConfigSummary() {
    const el = $('[data-config-summary]');
    if (!el) return;
    const mode = MODES[r.config.mode] || MODES.classic;
    const seriesLabel = r.config.series === 1 ? 'SINGLE GAME' : `BEST OF ${r.config.series}`;
    el.innerHTML = `<div><small>MODE</small><strong>${escapeHtml(mode.label)}</strong></div><div><small>SERIES</small><strong>${seriesLabel}</strong></div><p>${escapeHtml(mode.short)}</p>`;
  }

  function initSession() {
    r.session?.close?.();
    r.session = P().createSession({
      gameId: GAME_ID, prefix: PREFIX, timeoutMs: 90000, channelLabel: 'dama',
      onMessage: message,
      onConnected: connected,
      onRemoteName: name => { r.remoteName = name; syncNames(); },
      onDisconnected: () => { if (r.open && ['game', 'lobby', 'result'].includes(r.state)) showDisconnectedNotice('Opponent left the match.'); },
      onState: state => {
        const target = r.role === 'host' ? '[data-host-status]' : '[data-guest-status]';
        if (state === 'ice-checking') status(target, 'Checking the direct device-to-device route…');
        if (state === 'ice-failed' || state === 'failed') status(target, 'Direct connection failed. Send a fresh invite or try the same Wi-Fi / QR pairing.', true);
        if (state === 'timeout') status(target, 'Connection timed out. Send a fresh invite or try the same Wi-Fi / QR pairing.', true);
      }
    });
  }

  function applySideThemeClasses() {
    const me = localSide(), them = remoteSide();
    const localHud = $('.dama-player-hud.local'), remoteHud = $('.dama-player-hud.remote');
    const localLobby = $('[data-local-player]'), remoteLobby = $('[data-remote-player]');
    const centerHud = $('.dama-center-hud');
    const setSide = (el, side) => {
      if (!el) return;
      el.classList.toggle('team-blue', side === 'h');
      el.classList.toggle('team-red', side === 'g');
    };
    setSide(localHud, me); setSide(remoteHud, them); setSide(localLobby, me); setSide(remoteLobby, them);
    const turn = r.game?.turn || '';
    [localHud, remoteHud].forEach(el => el?.classList.remove('is-turn'));
    localHud?.classList.toggle('is-turn', !!turn && turn === me && !r.game?.roundOver);
    remoteHud?.classList.toggle('is-turn', !!turn && turn === them && !r.game?.roundOver);
    if (centerHud) {
      centerHud.classList.toggle('turn-blue', !!turn && turn === 'h' && !r.game?.roundOver);
      centerHud.classList.toggle('turn-red', !!turn && turn === 'g' && !r.game?.roundOver);
    }
  }

  function syncNames() {
    const pairs = [
      ['[data-local-name]', r.localName], ['[data-remote-name]', r.remoteName],
      ['[data-local-hud-name]', r.localName], ['[data-remote-hud-name]', r.remoteName]
    ];
    pairs.forEach(([selector, value]) => { const el = $(selector); if (el) el.textContent = value; });
    applySideThemeClasses();
  }

  async function prepareStudentHostOffer() {
    r.config = readHostConfig();
    initSession();
    r.role = 'host'; r.configReceived = true;
    const identity = r.bridge?.getPlayerIdentity?.();
    const input = $('[data-host-name]');
    if (identity?.loggedIn && identity.name && input) input.value = identity.name;
    r.localName = P().cleanName(input?.value || identity?.name, 'PLAYER 1');
    r.hostCode = await r.session.createOffer(r.localName);
    r.seed = r.session.seed;
    return r.hostCode;
  }

  async function prepareStudentGuestAnswer(code) {
    initSession();
    r.role = 'guest'; r.configReceived = false;
    const identity = r.bridge?.getPlayerIdentity?.();
    const input = $('[data-guest-name]');
    if (identity?.loggedIn && identity.name && input) input.value = identity.name;
    r.localName = P().cleanName(input?.value || identity?.name, 'PLAYER 2');
    r.answerCode = await r.session.createAnswer(code, r.localName);
    r.seed = r.session.seed; r.remoteName = r.session.remoteName;
    return r.answerCode;
  }

  async function applyStudentHostAnswer(code) {
    await r.session.applyAnswer(code);
    r.remoteName = r.session.remoteName;
  }

  function ensureStudentInvites() {
    if (r.invites || !P()?.createStudentInviteController) return;
    r.invites = P().createStudentInviteController({
      overlay: r.overlay, gameId: GAME_ID, gameName: 'CODE DAMA', getBridge: () => r.bridge,
      getState: () => r.state, isConnected: () => !!r.session?.connected, getLocalName: () => r.localName,
      showHost: () => show('host'), showGuest: () => show('guest'),
      createHostOffer: prepareStudentHostOffer, createGuestAnswer: prepareStudentGuestAnswer, applyHostAnswer: applyStudentHostAnswer,
      setGuestStatus: (text, err = false, ok = false) => status('[data-guest-status]', text, err, ok)
    });
  }

  async function createOffer() {
    try {
      r.config = readHostConfig();
      initSession(); r.role = 'host'; r.configReceived = true;
      r.localName = P().cleanName($('[data-host-name]').value, 'PLAYER 1');
      r.hostCode = await r.session.createOffer(r.localName); r.seed = r.session.seed;
      const src = r.bridge?.createQrDataUrl?.(r.hostCode, 360) || '';
      if (src) { $('[data-host-qr]').src = src; $('[data-host-qr-wrap]').hidden = false; }
      status('[data-host-status]', 'Host QR ready. Player 2 scans it, then scan their response.', false, true); sfx('ready');
    } catch (error) { status('[data-host-status]', error?.message || 'Could not create match.', true); }
  }

  async function createAnswer(code) {
    try {
      initSession(); r.role = 'guest'; r.configReceived = false;
      r.localName = P().cleanName($('[data-guest-name]').value, 'PLAYER 2');
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

  function connected() {
    r.invites?.onConnected?.();
    r.remoteName = r.session.remoteName; r.seed = r.session.seed;
    r.localReady = r.remoteReady = false; r.localNextReady = r.remoteNextReady = false;
    syncNames();
    if (r.role === 'host') {
      r.config = readHostConfig(); r.configReceived = true;
      r.session.send({ t: 'config', config: r.config });
    }
    renderConfigSummary(); show('lobby'); updateReady(); sfx('connect');
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

  function closeScanner() {
    try { r.scannerStop?.(); } catch (_) {}
    r.scannerStop = null;
    const scanner = $('[data-scanner]'); if (scanner) scanner.hidden = true;
  }

  async function copy(text, messageText) {
    const ok = await P().copyText(text);
    status(r.role === 'host' ? '[data-host-status]' : '[data-guest-status]', ok ? messageText : 'Copy failed.', !ok, ok);
  }
  async function share(text, title) { await P().shareText(text, title); }

  function cancelPairing() {
    closeScanner();
    try { r.invites?.cancelHostInvite?.(); } catch (_) {}
    try { r.session?.close?.(); } catch (_) {}
    r.session = null; r.role = ''; r.hostCode = r.answerCode = ''; show('home');
  }

  function ready() {
    if (r.role === 'guest' && !r.configReceived) { status('[data-lobby-status]', 'Waiting for Host match rules…'); return; }
    r.localReady = !r.localReady;
    r.session?.send({ t: 'ready', v: r.localReady }); updateReady();
    if (r.role === 'host' && r.localReady && r.remoteReady) beginCountdown(false);
  }

  function updateReady() {
    $('[data-local-player]')?.classList.toggle('ready', r.localReady);
    $('[data-remote-player]')?.classList.toggle('ready', r.remoteReady);
    const button = $('[data-ready]');
    if (button) { button.disabled = r.role === 'guest' && !r.configReceived; button.textContent = r.localReady ? 'READY ✓' : 'I\'M READY'; }
    renderConfigSummary();
    status('[data-lobby-status]', r.localReady && r.remoteReady ? 'Both ready — starting…' : r.localReady ? 'Waiting for opponent…' : r.remoteReady ? 'Opponent is ready.' : (r.role === 'guest' && !r.configReceived ? 'Receiving Host match rules…' : 'Waiting for both players.'), false, r.localReady && r.remoteReady);
  }

  function beginCountdown(nextRound) {
    if (!isAuthority()) return;
    if (r.role === 'host') r.session?.send({ t: 'countdown', nextRound: !!nextRound });
    countdown(() => {
      if (nextRound) startNextRound(); else startNewSeries();
    });
  }

  function countdown(done) {
    const box = $('[data-countdown]'), value = $('[data-countdown-value]');
    if (!box || !value) { done?.(); return; }
    box.hidden = false; let n = 3; value.textContent = n; sfx('count');
    const timer = setInterval(() => {
      n -= 1;
      if (n > 0) { value.textContent = n; sfx('count'); return; }
      clearInterval(timer); value.textContent = 'GO'; sfx('go');
      setTimeout(() => { box.hidden = true; done?.(); }, 420);
    }, 650);
  }

  function makeInitialBoard() {
    const board = Array(64).fill(null); let h = 0, g = 0;
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 8; col += 1) if ((row + col) % 2 === 1) board[idx(row, col)] = { id: `g${g++}`, side: 'g', king: false, shield: false, frozen: false };
    }
    for (let row = 5; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) if ((row + col) % 2 === 1) board[idx(row, col)] = { id: `h${h++}`, side: 'h', king: false, shield: false, frozen: false };
    }
    return board;
  }

  function baseState({ roundNo = 1, seriesScore = { h: 0, g: 0 } } = {}) {
    const startingTurn = ((r.seed + roundNo) & 1) ? 'h' : 'g';
    const state = {
      version: 1, seed: r.seed, mode: r.config.mode, seriesLength: r.config.series, roundNo,
      seriesScore: { h: Number(seriesScore.h || 0), g: Number(seriesScore.g || 0) },
      board: makeInitialBoard(), turn: startingTurn, turnNo: 1, mustContinueFrom: -1,
      powerHands: { h: [], g: [] }, powerDraws: { h: 0, g: 0 }, captureMeter: { h: 0, g: 0 },
      bombUsed: { h: false, g: false }, lastFreezeKing: { h: '', g: '' }, powerUsedThisTurn: false,
      extraMoveArmed: false, bonusMove: false,
      turnRemainingMs: SPEED_TURN_MS, blitz: { h: BLITZ_CLOCK_MS, g: BLITZ_CLOCK_MS },
      roundOver: false, roundWinner: '', winReason: '', seriesComplete: false,
      lastAction: 'Match started.', actionSeq: 0
    };
    if (state.mode === 'power') {
      for (const side of ['h', 'g']) { drawPower(state, side, true); drawPower(state, side, true); }
    }
    return state;
  }

  function drawPower(state, side, avoidDuplicate = false) {
    if (!state || state.mode !== 'power' || state.powerHands[side].length >= 3) return '';
    let options = POWER_KEYS.filter(key => key !== 'bomb' || (!state.bombUsed[side] && !state.powerHands[side].includes('bomb')));
    if (avoidDuplicate) {
      const unique = options.filter(key => !state.powerHands[side].includes(key));
      if (unique.length) options = unique;
    }
    if (!options.length) return '';
    const draw = state.powerDraws[side]++;
    const pick = options[Math.floor(seededUnit(`${state.seed}:${state.roundNo}:${side}:power:${draw}`) * options.length) % options.length];
    state.powerHands[side].push(pick);
    return pick;
  }

  function directions(piece, capture = false) {
    if (piece?.king || capture) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return piece?.side === 'h' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  }

  function capturesFrom(state, from, ignoreFreeze = false) {
    const piece = state.board[from]; if (!piece || (!ignoreFreeze && piece.frozen)) return [];
    const row = rowOf(from), col = colOf(from), out = [];
    for (const [dr, dc] of directions(piece, true)) {
      const mr = row + dr, mc = col + dc, tr = row + dr * 2, tc = col + dc * 2;
      if (!inside(tr, tc) || !inside(mr, mc)) continue;
      const middleIndex = idx(mr, mc), to = idx(tr, tc), middle = state.board[middleIndex];
      if (middle && middle.side !== piece.side && !state.board[to]) out.push({ from, to, capture: middleIndex, shieldBlock: !!middle.shield });
    }
    return out;
  }

  function quietMovesFrom(state, from, ignoreFreeze = false) {
    const piece = state.board[from]; if (!piece || (!ignoreFreeze && piece.frozen)) return [];
    const row = rowOf(from), col = colOf(from), out = [];
    for (const [dr, dc] of directions(piece, false)) {
      const rr = row + dr, cc = col + dc;
      if (inside(rr, cc) && !state.board[idx(rr, cc)]) out.push({ from, to: idx(rr, cc), capture: -1, shieldBlock: false });
    }
    return out;
  }

  function legalMovesForSide(state, side, ignoreFreeze = false) {
    if (!state || state.roundOver) return [];
    if (state.mustContinueFrom >= 0) return capturesFrom(state, state.mustContinueFrom, ignoreFreeze).filter(move => state.board[move.from]?.side === side);
    const captures = [];
    for (let i = 0; i < 64; i += 1) if (state.board[i]?.side === side) captures.push(...capturesFrom(state, i, ignoreFreeze));
    if (captures.length) return captures;
    const quiet = [];
    for (let i = 0; i < 64; i += 1) if (state.board[i]?.side === side) quiet.push(...quietMovesFrom(state, i, ignoreFreeze));
    return quiet;
  }

  function legalMovesFrom(state, from, side) {
    return legalMovesForSide(state, side).filter(move => move.from === from);
  }

  function countPieces(state, side) { return state.board.reduce((n, piece) => n + (piece?.side === side ? 1 : 0), 0); }
  function countKings(state, side) { return state.board.reduce((n, piece) => n + (piece?.side === side && piece.king ? 1 : 0), 0); }

  function promoteIfNeeded(state, index) {
    const piece = state.board[index]; if (!piece || piece.king) return false;
    const row = rowOf(index);
    if ((piece.side === 'h' && row === 0) || (piece.side === 'g' && row === 7)) { piece.king = true; return true; }
    return false;
  }

  function clearFreezeForSide(state, side) {
    state.board.forEach(piece => { if (piece?.side === side) piece.frozen = false; });
  }

  function finishRound(state, winner, reason) {
    if (state.roundOver) return;
    state.roundOver = true; state.roundWinner = winner; state.winReason = reason || 'Round complete.';
    if (winner === 'h' || winner === 'g') state.seriesScore[winner] += 1;
    const needed = Math.ceil(state.seriesLength / 2);
    state.seriesComplete = winner === 'h' || winner === 'g' ? state.seriesScore[winner] >= needed : false;
    state.lastAction = state.winReason;
  }

  function checkWinAfterAction(state, actingSide) {
    if (state.mode === 'king' && countKings(state, actingSide) >= KING_RUSH_TARGET) {
      finishRound(state, actingSide, `${KING_RUSH_TARGET} Kings reached.`); return true;
    }
    const enemy = sideOther(actingSide);
    if (countPieces(state, enemy) <= 0) { finishRound(state, actingSide, 'All opponent pieces captured.'); return true; }
    return false;
  }

  function resetTurnTimer(state) { if (state.mode === 'speed') state.turnRemainingMs = SPEED_TURN_MS; }

  function switchTurn(state, fromSide, message = '') {
    clearFreezeForSide(state, fromSide);
    state.turn = sideOther(fromSide); state.turnNo += 1; state.mustContinueFrom = -1;
    state.powerUsedThisTurn = false; state.extraMoveArmed = false; state.bonusMove = false;
    resetTurnTimer(state);
    state.lastAction = message || `${state.turn === 'h' ? 'Host' : 'Guest'} to move.`;

    let legal = legalMovesForSide(state, state.turn);
    if (!legal.length) {
      const ignoringFreeze = legalMovesForSide(state, state.turn, true);
      if (ignoringFreeze.length) {
        const skipped = state.turn;
        clearFreezeForSide(state, skipped);
        state.turn = sideOther(skipped); state.turnNo += 1; state.powerUsedThisTurn = false; state.extraMoveArmed = false; state.bonusMove = false; resetTurnTimer(state);
        state.lastAction = '🧊 Freeze forced a pass.';
        legal = legalMovesForSide(state, state.turn);
      }
    }
    if (!legal.length && !state.roundOver) {
      const enemy = sideOther(state.turn);
      finishRound(state, enemy, 'Opponent has no legal moves.');
    }
  }

  function awardCapturePower(state, side) {
    if (state.mode !== 'power') return '';
    state.captureMeter[side] += 1;
    if (state.captureMeter[side] >= 2 && state.powerHands[side].length < 3) {
      state.captureMeter[side] -= 2;
      return drawPower(state, side, false);
    }
    return '';
  }

  function applyMove(state, side, from, to) {
    if (state.roundOver || state.turn !== side) return { ok: false, error: 'Not your turn.' };
    const legal = legalMovesFrom(state, from, side);
    const move = legal.find(item => item.to === to);
    if (!move) return { ok: false, error: 'That move is not legal.' };
    const piece = state.board[from]; if (!piece || piece.side !== side) return { ok: false, error: 'Choose your own piece.' };

    if (move.capture >= 0 && state.board[move.capture]?.shield) {
      state.board[move.capture].shield = false;
      state.mustContinueFrom = -1; state.actionSeq += 1;
      switchTurn(state, side, '🛡️ Shield blocked the capture.');
      return { ok: true, event: 'shield-block' };
    }

    state.board[to] = piece; state.board[from] = null;
    let captured = false, crowned = false, earnedPower = '';
    if (move.capture >= 0) {
      state.board[move.capture] = null; captured = true; earnedPower = awardCapturePower(state, side);
    }
    crowned = promoteIfNeeded(state, to);
    state.actionSeq += 1;

    if (checkWinAfterAction(state, side)) return { ok: true, event: crowned ? 'king-win' : 'capture-win', crowned, captured, earnedPower };

    if (captured) {
      const more = capturesFrom(state, to);
      if (more.length) {
        state.mustContinueFrom = to;
        state.lastAction = 'CAPTURE AGAIN — same piece must continue.';
        return { ok: true, event: 'capture-chain', crowned, captured, earnedPower };
      }
    }

    if (!captured && state.extraMoveArmed && !state.bonusMove) {
      state.extraMoveArmed = false; state.bonusMove = true; state.mustContinueFrom = -1;
      state.lastAction = '⚡ EXTRA MOVE — move once more.';
      return { ok: true, event: 'extra-move', crowned, captured, earnedPower };
    }

    switchTurn(state, side, crowned ? '👑 A new King is crowned.' : captured ? 'Capture complete.' : 'Move complete.');
    return { ok: true, event: crowned ? 'king' : captured ? 'capture' : 'move', crowned, captured, earnedPower };
  }

  function removePowerFromHand(state, side, key) {
    const index = state.powerHands[side].indexOf(key);
    if (index < 0) return false;
    state.powerHands[side].splice(index, 1); return true;
  }

  function adjacentEnemyBombTargets(state, side) {
    const targets = new Set();
    for (let i = 0; i < 64; i += 1) {
      const piece = state.board[i]; if (!piece || piece.side !== side) continue;
      const row = rowOf(i), col = colOf(i);
      for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
        if (!dr && !dc) continue;
        const rr = row + dr, cc = col + dc; if (!inside(rr, cc)) continue;
        const targetIndex = idx(rr, cc), target = state.board[targetIndex];
        if (target && target.side !== side && !target.king) targets.add(targetIndex);
      }
    }
    return Array.from(targets);
  }

  function powerTargets(state, side, key) {
    if (!state || state.turn !== side || state.mode !== 'power' || state.roundOver || state.bonusMove) return [];
    if (key === 'freeze') return state.board.map((piece, index) => piece && piece.side !== side && !piece.frozen && !(piece.king && state.lastFreezeKing[side] === piece.id) ? index : -1).filter(index => index >= 0);
    if (key === 'shield') return state.board.map((piece, index) => piece && piece.side === side && !piece.shield ? index : -1).filter(index => index >= 0);
    if (key === 'bomb') return adjacentEnemyBombTargets(state, side);
    return [];
  }

  function applyPower(state, side, key, targetIndex = -1) {
    if (!state || state.roundOver || state.turn !== side) return { ok: false, error: 'Not your turn.' };
    if (state.mode !== 'power') return { ok: false, error: 'Power-ups are only available in Power Dama.' };
    if (state.bonusMove) return { ok: false, error: 'No power-ups during an Extra Move bonus.' };
    if (state.powerUsedThisTurn) return { ok: false, error: 'Only one power-up can be used per turn.' };
    if (!state.powerHands[side].includes(key)) return { ok: false, error: 'That power is not in your hand.' };

    if (key === 'extra') {
      if (legalMovesForSide(state, side).some(move => move.capture >= 0)) return { ok: false, error: 'Extra Move cannot bypass a mandatory capture.' };
      removePowerFromHand(state, side, key); state.extraMoveArmed = true; state.powerUsedThisTurn = true; state.actionSeq += 1; state.lastAction = '⚡ Extra Move armed. Make a normal move.';
      return { ok: true, event: 'extra' };
    }

    const targets = powerTargets(state, side, key);
    if (!targets.includes(targetIndex)) return { ok: false, error: 'Choose a highlighted power target.' };
    const target = state.board[targetIndex];
    removePowerFromHand(state, side, key); state.powerUsedThisTurn = true; state.actionSeq += 1;

    if (key === 'freeze') {
      target.frozen = true; state.lastFreezeKing[side] = target.king ? target.id : '';
      state.lastAction = '🧊 Enemy piece frozen for its next turn.';
      return { ok: true, event: 'freeze' };
    }
    if (key === 'shield') {
      target.shield = true; state.lastAction = '🛡️ Shield attached. It blocks one capture attempt.';
      return { ok: true, event: 'shield' };
    }
    if (key === 'bomb') {
      state.board[targetIndex] = null; state.bombUsed[side] = true;
      if (checkWinAfterAction(state, side)) return { ok: true, event: 'bomb-win' };
      switchTurn(state, side, '💣 Bomb removed an adjacent normal piece.');
      return { ok: true, event: 'bomb' };
    }
    return { ok: false, error: 'Unknown power.' };
  }

  function pieceStrategicValue(piece, index) {
    if (!piece) return 0;
    const row = rowOf(index), col = colOf(index);
    const base = piece.king ? 188 : 100;
    const advance = piece.king ? 0 : (piece.side === 'g' ? row : 7 - row) * 5.5;
    const center = (3.5 - Math.abs(3.5 - col)) * 3 + (3.5 - Math.abs(3.5 - row)) * 1.4;
    const edge = (col === 0 || col === 7) ? 5 : 0;
    const shield = piece.shield ? 16 : 0;
    const frozen = piece.frozen ? -13 : 0;
    return base + advance + center + edge + shield + frozen;
  }

  function evaluateAiState(state, aiSide = 'g') {
    if (!state) return 0;
    if (state.roundOver) {
      if (state.roundWinner === aiSide) return 100000 + countPieces(state, aiSide) * 250;
      if (state.roundWinner === sideOther(aiSide)) return -100000 - countPieces(state, sideOther(aiSide)) * 250;
      return 0;
    }
    let score = 0;
    for (let i = 0; i < 64; i += 1) {
      const piece = state.board[i]; if (!piece) continue;
      const value = pieceStrategicValue(piece, i);
      score += piece.side === aiSide ? value : -value;
    }
    if (state.mode === 'king') score += (countKings(state, aiSide) - countKings(state, sideOther(aiSide))) * 92;
    if (state.mode === 'power') {
      score += ((state.powerHands[aiSide]?.length || 0) - (state.powerHands[sideOther(aiSide)]?.length || 0)) * 11;
      score += ((state.captureMeter[aiSide] || 0) - (state.captureMeter[sideOther(aiSide)] || 0)) * 5;
    }
    if (state.mustContinueFrom < 0) {
      const mine = legalMovesForSide(state, aiSide).length;
      const theirs = legalMovesForSide(state, sideOther(aiSide)).length;
      score += (mine - theirs) * 2.2;
    }
    score += state.turn === aiSide ? 4 : -4;
    return score;
  }

  function moveOrderScore(state, move, side) {
    let score = 0;
    const moving = state.board[move.from];
    if (move.capture >= 0) {
      const captured = state.board[move.capture];
      score += 520 + (captured?.king ? 230 : 0) + (captured?.shield ? 35 : 0);
    }
    const toRow = rowOf(move.to), toCol = colOf(move.to);
    if (moving && !moving.king && ((side === 'g' && toRow === 7) || (side === 'h' && toRow === 0))) score += 340;
    score += (3.5 - Math.abs(3.5 - toCol)) * 7;
    if (moving?.king) score += 22;
    return score;
  }

  function orderedMovesForSearch(state, side) {
    return legalMovesForSide(state, side).slice().sort((a, b) => moveOrderScore(state, b, side) - moveOrderScore(state, a, side));
  }

  const AI_SEARCH_TIMEOUT = Object.freeze({ timeout: true });

  function alphaBetaAi(state, depth, alpha, beta, aiSide, deadline) {
    if (performance.now() >= deadline) throw AI_SEARCH_TIMEOUT;
    if (state.roundOver || depth <= 0) return evaluateAiState(state, aiSide);
    const side = state.turn;
    const moves = orderedMovesForSearch(state, side);
    if (!moves.length) return evaluateAiState(state, aiSide);
    const maximizing = side === aiSide;
    let best = maximizing ? -Infinity : Infinity;
    for (const move of moves) {
      if (performance.now() >= deadline) throw AI_SEARCH_TIMEOUT;
      const child = deepClone(state);
      const result = applyMove(child, side, move.from, move.to);
      if (!result.ok) continue;
      const sameSideContinues = !child.roundOver && child.turn === side;
      const nextDepth = sameSideContinues ? depth : depth - 1;
      const value = alphaBetaAi(child, nextDepth, alpha, beta, aiSide, deadline);
      if (maximizing) {
        if (value > best) best = value;
        if (best > alpha) alpha = best;
      } else {
        if (value < best) best = value;
        if (best < beta) beta = best;
      }
      if (beta <= alpha) break;
    }
    return Number.isFinite(best) ? best : evaluateAiState(state, aiSide);
  }

  function scoreAiRootMove(state, move, depth, deadline) {
    const child = deepClone(state);
    const result = applyMove(child, 'g', move.from, move.to);
    if (!result.ok) return -Infinity;
    const sameSideContinues = !child.roundOver && child.turn === 'g';
    const nextDepth = sameSideContinues ? depth : Math.max(0, depth - 1);
    return alphaBetaAi(child, nextDepth, -Infinity, Infinity, 'g', deadline);
  }

  function chooseAiMove() {
    const moves = orderedMovesForSearch(r.game, 'g');
    if (!moves.length) return null;
    const level = aiLevel();
    if (level.depth <= 0) return moves[Math.floor(Math.random() * moves.length)] || moves[0];

    const deadline = performance.now() + Math.max(20, level.budgetMs);
    let ranking = moves.map(move => ({ move, score: moveOrderScore(r.game, move, 'g') }));
    for (let depth = 1; depth <= level.depth; depth += 1) {
      const iteration = [];
      try {
        for (const move of moves) iteration.push({ move, score: scoreAiRootMove(r.game, move, depth, deadline) });
      } catch (error) {
        if (error !== AI_SEARCH_TIMEOUT) throw error;
        break;
      }
      if (iteration.length === moves.length) ranking = iteration.sort((a, b) => b.score - a.score || moveOrderScore(r.game, b.move, 'g') - moveOrderScore(r.game, a.move, 'g'));
      if (performance.now() >= deadline) break;
    }

    if (level.randomChance > 0 && Math.random() < level.randomChance) {
      const pool = ranking.slice(0, Math.min(ranking.length, Math.max(1, level.topChoices)));
      return pool[Math.floor(Math.random() * pool.length)]?.move || ranking[0].move;
    }
    return ranking[0]?.move || moves[0];
  }

  function botPowerTargetWeight(state, key, index) {
    const target = state.board[index];
    if (!target) return -9999;
    let score = pieceStrategicValue(target, index);
    if (key === 'freeze') {
      if (target.king) score += 85;
      if (capturesFrom(state, index).length) score += 70;
      return score;
    }
    if (key === 'shield') {
      if (target.king) score += 80;
      const threatened = legalMovesForSide(state, 'h').some(move => move.capture === index);
      if (threatened) score += 120;
      return score;
    }
    if (key === 'bomb') return score + 90;
    return score;
  }

  function chooseAiPowerAction() {
    const state = r.game, level = aiLevel();
    if (!state || state.mode !== 'power' || state.turn !== 'g' || state.powerUsedThisTurn || state.bonusMove) return null;
    const hand = state.powerHands.g || [];
    if (!hand.length || Math.random() > level.powerChance) return null;
    const mandatoryCapture = legalMovesForSide(state, 'g').some(move => move.capture >= 0);
    const candidates = [];

    hand.forEach(key => {
      if (key === 'extra') {
        if (!mandatoryCapture) candidates.push({ action: { kind: 'power', power: 'extra', target: -1 }, score: 36 + (level.depth * 7) });
        return;
      }
      const targets = powerTargets(state, 'g', key);
      targets.forEach(target => {
        const child = deepClone(state);
        const result = applyPower(child, 'g', key, target);
        if (!result.ok) return;
        let score = evaluateAiState(child, 'g') - evaluateAiState(state, 'g');
        score += botPowerTargetWeight(state, key, target) * (key === 'bomb' ? .28 : .13);
        if (key === 'bomb' && child.roundOver && child.roundWinner === 'g') score += 100000;
        candidates.push({ action: { kind: 'power', power: key, target }, score });
      });
    });

    candidates.sort((a, b) => b.score - a.score);
    if (!candidates.length) return null;
    const best = candidates[0];
    if (level.depth <= 1 && candidates.length > 1 && Math.random() < .35) return candidates[Math.floor(Math.random() * Math.min(3, candidates.length))].action;
    return best.action;
  }

  async function runSoloBotTurn() {
    if (!isSolo() || !r.game || r.game.roundOver || r.state !== 'game' || r.paused || r.game.turn !== 'g') { r.aiThinking = false; return; }
    r.aiThinking = true; renderHud(); renderGameStatus();
    await new Promise(resolve => requestAnimationFrame(() => resolve()));
    if (!isSolo() || !r.game || r.game.roundOver || r.game.turn !== 'g') { r.aiThinking = false; return; }

    const powerAction = chooseAiPowerAction();
    if (powerAction) { processHostAction(powerAction, 'g'); return; }
    const move = chooseAiMove();
    if (!move) {
      r.aiThinking = false;
      if (!r.game.roundOver) finishRound(r.game, 'h', 'Code Bot has no legal moves.');
      renderGame(); showRoundResultSoon(); return;
    }
    processHostAction({ kind: 'move', from: move.from, to: move.to }, 'g');
  }

  function maybeScheduleSoloBot(delayOverride = -1) {
    if (!isSolo() || !r.game || r.game.roundOver || r.state !== 'game' || r.paused || r.game.turn !== 'g') {
      clearTimeout(r.aiTimer); r.aiTimer = 0; r.aiThinking = false; return;
    }
    if (r.aiTimer) return;
    r.aiThinking = true; renderHud(); renderGameStatus();
    const level = aiLevel();
    const naturalDelay = level.thinkMin + Math.random() * Math.max(0, level.thinkMax - level.thinkMin);
    const delay = delayOverride >= 0 ? Math.max(220, delayOverride) : naturalDelay;
    r.aiTimer = setTimeout(() => { r.aiTimer = 0; runSoloBotTurn(); }, delay);
  }

  function startNewSeries() {
    if (!isAuthority()) return;
    if (!isSolo()) r.config = readHostConfig();
    r.game = baseState({ roundNo: 1, seriesScore: { h: 0, g: 0 } });
    r.localReady = r.remoteReady = false; r.localNextReady = r.remoteNextReady = false;
    show('game'); startHostClock(); broadcastState('start'); renderGame(); maybeScheduleSoloBot(720);
  }

  function startNextRound() {
    if (!isAuthority() || !r.game) return;
    const resetSeries = !!r.game.seriesComplete;
    const nextRound = resetSeries ? 1 : r.game.roundNo + 1;
    const scores = resetSeries ? { h: 0, g: 0 } : deepClone(r.game.seriesScore);
    r.game = baseState({ roundNo: nextRound, seriesScore: scores });
    r.localNextReady = r.remoteNextReady = false;
    show('game'); startHostClock(); broadcastState('next-round'); renderGame(); maybeScheduleSoloBot(720);
  }

  function broadcastState(reason = '') {
    if (r.role !== 'host' || !r.game) return;
    r.session?.send({ t: 'state', reason, game: r.game });
  }

  function processHostAction(action, side) {
    if (!isAuthority() || !r.game || r.game.roundOver) return;
    syncClockNow();
    if (r.game.roundOver) { broadcastState('timer-finish'); renderGame(); return; }
    let result;
    if (action.kind === 'move') result = applyMove(r.game, side, Number(action.from), Number(action.to));
    else if (action.kind === 'power') result = applyPower(r.game, side, String(action.power || ''), Number(action.target));
    else result = { ok: false, error: 'Unknown action.' };
    if (!result.ok) {
      if (side === 'h' || isSolo()) toast(result.error, 'error');
      else r.session?.send({ t: 'reject', message: result.error });
      r.aiThinking = false; renderGame(); return;
    }
    handleActionEvent(result);
    broadcastState(result.event || action.kind);
    r.aiThinking = isSolo() && !r.game.roundOver && r.game.turn === 'g';
    renderGame();
    if (r.game.roundOver) showRoundResultSoon();
    else maybeScheduleSoloBot(result.event === 'capture-chain' || result.event === 'extra-move' ? 320 : 560);
  }

  function submitAction(action) {
    if (!r.game || r.game.roundOver || r.paused || r.remotePaused || r.actionPending) return;
    const side = localSide();
    if (r.game.turn !== side) { toast('Wait for your turn.'); return; }
    r.selectedPower = '';
    if (isAuthority()) processHostAction(action, side);
    else { r.actionPending = true; r.session?.send({ t: 'action', action }); }
  }

  function handleActionEvent(result) {
    if (!result?.ok) return;
    if (result.event === 'capture' || result.event === 'capture-chain' || result.event === 'capture-win') sfx('capture');
    else if (result.event === 'king' || result.event === 'king-win') sfx('king');
    else if (result.event === 'freeze') sfx('freeze');
    else if (result.event === 'extra' || result.event === 'extra-move') sfx('extra');
    else if (result.event === 'bomb' || result.event === 'bomb-win') sfx('bomb');
    else if (result.event === 'shield' || result.event === 'shield-block') sfx('shield');
    else sfx('move');
    if (result.earnedPower) toast(`New power: ${POWER_META[result.earnedPower]?.icon || ''} ${POWER_META[result.earnedPower]?.name || result.earnedPower}`, 'power');
  }

  function handleBoardClick(event) {
    const cell = event.target.closest('[data-cell]');
    if (!cell || !r.game || r.state !== 'game' || r.game.roundOver) return;
    const index = Number(cell.dataset.cell), side = localSide();
    if (r.game.turn !== side || r.paused || r.remotePaused || r.actionPending) return;

    if (r.selectedPower) {
      submitAction({ kind: 'power', power: r.selectedPower, target: index });
      return;
    }

    const piece = r.game.board[index];
    if (piece?.side === side) {
      const moves = legalMovesFrom(r.game, index, side);
      if (!moves.length) { toast(piece.frozen ? 'That piece is frozen this turn.' : 'That piece has no legal move.'); return; }
      r.selected = index; renderBoard(); return;
    }
    if (r.selected >= 0) {
      const move = legalMovesFrom(r.game, r.selected, side).find(item => item.to === index);
      if (move) { const from = r.selected; r.selected = -1; submitAction({ kind: 'move', from, to: index }); }
    }
  }

  function handlePowerClick(event) {
    const button = event.target.closest('[data-power]');
    if (!button || !r.game || r.game.turn !== localSide() || r.game.roundOver || r.actionPending) return;
    const key = button.dataset.power;
    if (button.disabled) return;
    if (key === 'extra') { submitAction({ kind: 'power', power: key, target: -1 }); return; }
    r.selected = -1; r.selectedPower = r.selectedPower === key ? '' : key; renderBoard(); renderPowers();
  }

  function boardDisplayIndices() {
    const base = Array.from({ length: 64 }, (_, i) => i);
    return localSide() === 'g' ? base.reverse() : base;
  }

  function renderBoard() {
    const board = $('[data-board]'); if (!board || !r.game) return;
    const side = localSide();
    const legalForSelected = r.selected >= 0 ? legalMovesFrom(r.game, r.selected, side) : [];
    const destinations = new Map(legalForSelected.map(move => [move.to, move]));
    const powerTargetSet = new Set(r.selectedPower ? powerTargets(r.game, side, r.selectedPower) : []);
    const mandatory = legalMovesForSide(r.game, side).some(move => move.capture >= 0);
    const movableSources = new Set(legalMovesForSide(r.game, side).map(move => move.from));

    board.innerHTML = boardDisplayIndices().map(index => {
      const row = rowOf(index), col = colOf(index), dark = (row + col) % 2 === 1, piece = r.game.board[index];
      const move = destinations.get(index), classes = ['dama-cell', dark ? 'dark' : 'light'];
      if (index === r.selected) classes.push('selected');
      if (move) classes.push(move.capture >= 0 ? 'capture-target' : 'move-target');
      if (powerTargetSet.has(index)) classes.push('power-target');
      if (piece && piece.side === side && movableSources.has(index) && r.game.turn === side) classes.push('movable');
      let pieceHtml = '';
      if (piece) {
        const pieceClasses = ['dama-piece', piece.side === 'h' ? 'host-piece' : 'guest-piece'];
        if (piece.side === r.game.turn && !r.game.roundOver) pieceClasses.push('turn-piece');
        if (piece.side === side && r.game.turn === side && !r.game.roundOver) pieceClasses.push('your-turn-piece');
        if (piece.king) pieceClasses.push('king'); if (piece.shield) pieceClasses.push('shielded'); if (piece.frozen) pieceClasses.push('frozen');
        pieceHtml = `<span class="${pieceClasses.join(' ')}" aria-label="${piece.side === side ? 'Your' : 'Opponent'} ${piece.king ? 'King' : 'piece'}"><i>${piece.king ? '♛' : ''}</i>${piece.shield ? '<em>🛡️</em>' : ''}${piece.frozen ? '<b>❄</b>' : ''}</span>`;
      }
      const marker = move ? `<span class="dama-target-dot">${move.capture >= 0 ? '×' : ''}</span>` : powerTargetSet.has(index) ? '<span class="dama-power-ring"></span>' : '';
      return `<button type="button" class="${classes.join(' ')}" data-cell="${index}" role="gridcell" aria-label="Board square ${row + 1}, ${col + 1}">${pieceHtml}${marker}</button>`;
    }).join('');
    board.classList.toggle('your-turn', r.game.turn === side && !r.game.roundOver);
    board.classList.toggle('mandatory-capture', mandatory);
    board.classList.toggle('turn-blue', r.game.turn === 'h');
    board.classList.toggle('turn-red', r.game.turn === 'g');
  }

  function formatClock(ms) {
    const total = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
    const minutes = Math.floor(total / 60), seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function renderHud() {
    if (!r.game) return;
    const me = localSide(), them = remoteSide(), mode = MODES[r.game.mode] || MODES.classic;
    applySideThemeClasses();
    $('[data-mode-chip]').textContent = mode.label;
    $('[data-turn-label]').textContent = r.game.roundOver ? 'ROUND COMPLETE' : r.game.turn === me ? (r.game.mustContinueFrom >= 0 ? 'CAPTURE AGAIN' : 'YOUR TURN') : (isSolo() ? 'BOT THINKING' : 'OPPONENT TURN');
    const remoteLabel = $('[data-remote-hud-label]'); if (remoteLabel) remoteLabel.textContent = isSolo() ? `CODE BOT · ${aiLevel().label}` : 'OPPONENT';
    $('[data-series-label]').textContent = r.game.seriesLength === 1 ? `GAME ${r.game.roundNo}` : `GAME ${r.game.roundNo} · BEST OF ${r.game.seriesLength}`;
    $('[data-round-label]').textContent = `Round ${r.game.roundNo}`;
    $('[data-local-piece-count]').textContent = `${countPieces(r.game, me)} pieces · 👑 ${countKings(r.game, me)}`;
    $('[data-remote-piece-count]').textContent = `${countPieces(r.game, them)} pieces · 👑 ${countKings(r.game, them)}`;
    $('[data-series-local]').textContent = r.game.seriesScore[me]; $('[data-series-remote]').textContent = r.game.seriesScore[them];
    const lc = $('[data-local-clock]'), rc = $('[data-remote-clock]');
    if (r.game.mode === 'speed') {
      const text = formatClock(r.game.turnRemainingMs); lc.textContent = r.game.turn === me ? text : ''; rc.textContent = r.game.turn === them ? text : '';
      lc.hidden = !lc.textContent; rc.hidden = !rc.textContent;
    } else if (r.game.mode === 'blitz') {
      lc.textContent = formatClock(r.game.blitz[me]); rc.textContent = formatClock(r.game.blitz[them]); lc.hidden = rc.hidden = false;
    } else { lc.textContent = rc.textContent = ''; lc.hidden = rc.hidden = true; }

    const ruleTitle = $('[data-rule-title]'), ruleCopy = $('[data-rule-copy]');
    if (r.game.mode === 'speed') { ruleTitle.textContent = '30-SECOND TURN'; ruleCopy.textContent = 'Running out of time forfeits only that turn.'; }
    else if (r.game.mode === 'blitz') { ruleTitle.textContent = '3-MINUTE CLOCK'; ruleCopy.textContent = 'Your total clock runs only on your turn. Zero loses the round.'; }
    else if (r.game.mode === 'king') { ruleTitle.textContent = 'KING RUSH'; ruleCopy.textContent = `First player to crown ${KING_RUSH_TARGET} Kings wins the round.`; }
    else if (r.game.mode === 'power') { ruleTitle.textContent = 'POWER DAMA'; ruleCopy.textContent = 'One power per turn. Mandatory captures still override Extra Move.'; }
    else { ruleTitle.textContent = 'MANDATORY CAPTURE'; ruleCopy.textContent = 'If a capture is available, you must take it.'; }
  }

  function renderPowers() {
    const panel = $('[data-power-panel]'), list = $('[data-power-list]');
    if (!panel || !list || !r.game) return;
    const me = localSide(), active = r.game.mode === 'power'; panel.hidden = !active; if (!active) return;
    const hand = r.game.powerHands[me] || [];
    if (!hand.length) list.innerHTML = '<div class="dama-no-power">No power cards. Capture 2 pieces to earn one.</div>';
    else list.innerHTML = hand.map((key, index) => {
      const meta = POWER_META[key];
      let disabled = r.game.turn !== me || r.game.powerUsedThisTurn || r.game.bonusMove || r.actionPending;
      if (key === 'extra' && legalMovesForSide(r.game, me).some(move => move.capture >= 0)) disabled = true;
      if (key === 'bomb' && !adjacentEnemyBombTargets(r.game, me).length) disabled = true;
      const selected = r.selectedPower === key;
      return `<button type="button" class="dama-power ${selected ? 'selected' : ''}" data-power="${key}" data-power-index="${index}" ${disabled ? 'disabled' : ''}><span>${meta.icon}</span><div><strong>${meta.name}</strong><small>${meta.hint}</small></div></button>`;
    }).join('');
    const help = $('[data-power-help]'); if (help) help.textContent = r.selectedPower ? `${POWER_META[r.selectedPower].icon} Choose a highlighted target.` : 'Tap a power, then choose its highlighted target.';
  }

  function renderGameStatus() {
    const el = $('[data-game-status]'); if (!el || !r.game) return;
    const me = localSide();
    if (r.game.roundOver) el.textContent = r.game.winReason;
    else if (r.selectedPower) el.textContent = `${POWER_META[r.selectedPower].icon} ${POWER_META[r.selectedPower].name}: choose a highlighted target.`;
    else if (r.game.turn !== me) el.textContent = isSolo() ? `${r.remoteName} is thinking…` : (r.game.lastAction || 'Opponent is thinking…');
    else if (r.game.mustContinueFrom >= 0) el.textContent = 'CAPTURE AGAIN — continue with the same piece.';
    else if (legalMovesForSide(r.game, me).some(move => move.capture >= 0)) el.textContent = 'MANDATORY CAPTURE — choose a highlighted piece.';
    else el.textContent = r.game.lastAction || 'Select a piece to move.';
  }

  function renderGame() {
    if (!r.game) return;
    syncNames(); renderHud(); renderBoard(); renderPowers(); renderGameStatus();
    if (r.game.roundOver && r.state === 'game') showRoundResultSoon();
  }

  function showRoundResultSoon() {
    clearInterval(r.timerId); r.timerId = 0; clearTimeout(r.aiTimer); r.aiTimer = 0; r.aiThinking = false;
    setTimeout(() => { if (r.game?.roundOver && r.open) showResult(); }, 260);
  }

  function showResult() {
    if (!r.game) return;
    const me = localSide(), them = remoteSide(), winner = r.game.roundWinner;
    show('result');
    const won = winner === me, draw = winner !== 'h' && winner !== 'g';
    $('[data-result-icon]').textContent = draw ? '🤝' : won ? '🏆' : '🏁';
    $('[data-result-title]').textContent = draw ? 'ROUND DRAW' : won ? 'YOU WIN!' : (isSolo() ? 'CODE BOT WINS' : 'OPPONENT WINS');
    $('[data-result-sub]').textContent = r.game.winReason;
    $('[data-result-local-series]').textContent = r.game.seriesScore[me];
    $('[data-result-remote-series]').textContent = r.game.seriesScore[them];
    $('[data-result-mode]').textContent = (MODES[r.game.mode]?.label || 'DAMA').replace(' DAMA', '');
    $('[data-result-kicker]').textContent = r.game.seriesComplete ? 'SERIES COMPLETE' : `ROUND ${r.game.roundNo} COMPLETE`;
    const next = $('[data-next-round]'); next.textContent = r.game.seriesComplete ? 'NEW SERIES READY' : (r.game.seriesLength === 1 ? 'REMATCH READY' : 'NEXT ROUND READY');
    r.localNextReady = r.remoteNextReady = false; updateResultReady();
    if (won) sfx('win'); else if (!draw) sfx('lose');
  }

  function nextRoundReady() {
    if (!r.game?.roundOver) return;
    if (isSolo()) { beginCountdown(true); return; }
    r.localNextReady = !r.localNextReady;
    r.session?.send({ t: 'nextReady', v: r.localNextReady }); updateResultReady();
    if (r.role === 'host' && r.localNextReady && r.remoteNextReady) beginCountdown(true);
  }

  function updateResultReady() {
    const button = $('[data-next-round]');
    if (isSolo()) {
      if (button) button.textContent = r.game?.seriesComplete ? 'START NEW SERIES' : (r.game?.seriesLength === 1 ? 'REMATCH BOT' : 'NEXT ROUND');
      status('[data-result-status]', `Solo · ${aiLevel().label} Code Bot`, false, true);
      return;
    }
    if (button) button.textContent = r.localNextReady ? 'READY ✓' : (r.game?.seriesComplete ? 'NEW SERIES READY' : (r.game?.seriesLength === 1 ? 'REMATCH READY' : 'NEXT ROUND READY'));
    status('[data-result-status]', r.localNextReady && r.remoteNextReady ? 'Both ready — starting…' : r.localNextReady ? 'Waiting for opponent…' : r.remoteNextReady ? 'Opponent is ready.' : 'Both players press ready to continue.', false, r.localNextReady && r.remoteNextReady);
  }

  function startHostClock() {
    clearInterval(r.timerId); r.timerId = 0;
    if (!isAuthority() || !r.game || !['speed', 'blitz'].includes(r.game.mode)) return;
    r.lastClockAt = performance.now(); r.lastTimerBroadcast = 0;
    r.timerId = setInterval(() => {
      if (!r.game || r.game.roundOver || r.state !== 'game' || r.paused || r.remotePaused) { r.lastClockAt = performance.now(); return; }
      syncClockNow();
      const now = performance.now();
      if (r.role === 'host' && now - r.lastTimerBroadcast > 240) { r.lastTimerBroadcast = now; r.session?.send({ t: 'timer', turn: r.game.turn, turnRemainingMs: r.game.turnRemainingMs, blitz: r.game.blitz }); }
      renderHud();
      if (r.game.roundOver) { broadcastState('timer-finish'); renderGame(); showRoundResultSoon(); }
    }, 100);
  }

  function syncClockNow() {
    if (!isAuthority() || !r.game || r.game.roundOver || r.paused || r.remotePaused) { r.lastClockAt = performance.now(); return; }
    const now = performance.now(), dt = Math.max(0, now - (r.lastClockAt || now)); r.lastClockAt = now;
    if (r.game.mode === 'speed') {
      r.game.turnRemainingMs = Math.max(0, r.game.turnRemainingMs - dt);
      if (r.game.turnRemainingMs <= 0) {
        const timedOut = r.game.turn; r.game.mustContinueFrom = -1; r.game.extraMoveArmed = false; r.game.bonusMove = false;
        switchTurn(r.game, timedOut, '⏱ Turn forfeited — 30 seconds expired.');
        sfx('timeout'); broadcastState('speed-timeout'); r.aiThinking = isSolo() && r.game.turn === 'g'; renderGame(); maybeScheduleSoloBot(420);
      }
    } else if (r.game.mode === 'blitz') {
      const side = r.game.turn; r.game.blitz[side] = Math.max(0, r.game.blitz[side] - dt);
      if (r.game.blitz[side] <= 0) { finishRound(r.game, sideOther(side), '⏱ Opponent clock reached zero.'); sfx('timeout'); }
    }
  }

  function message(message) {
    switch (message?.t) {
      case 'config':
        if (r.role === 'guest') { const config = message.config || {}; r.config = { mode: MODES[config.mode] ? config.mode : 'classic', series: [1, 3, 5].includes(Number(config.series)) ? Number(config.series) : 1 }; r.configReceived = true; renderConfigSummary(); updateReady(); }
        break;
      case 'ready':
        r.remoteReady = !!message.v; updateReady(); if (r.role === 'host' && r.localReady && r.remoteReady) beginCountdown(false); break;
      case 'countdown':
        if (r.role === 'guest') countdown(() => {}); break;
      case 'state':
        if (r.role === 'guest') { r.game = deepClone(message.game); r.actionPending = false; r.selected = -1; r.selectedPower = ''; if (r.game.roundOver) showResult(); else { show('game'); renderGame(); } }
        break;
      case 'timer':
        if (r.role === 'guest' && r.game && !r.game.roundOver) { r.game.turn = message.turn || r.game.turn; r.game.turnRemainingMs = Number(message.turnRemainingMs ?? r.game.turnRemainingMs); if (message.blitz) r.game.blitz = deepClone(message.blitz); renderHud(); }
        break;
      case 'action':
        if (r.role === 'host') processHostAction(message.action || {}, 'g'); break;
      case 'reject':
        if (r.role === 'guest') { r.actionPending = false; toast(message.message || 'Action rejected.', 'error'); renderGame(); }
        break;
      case 'nextReady':
        r.remoteNextReady = !!message.v; updateResultReady(); if (r.role === 'host' && r.localNextReady && r.remoteNextReady) beginCountdown(true); break;
      case 'pause':
        r.remotePaused = true; pauseGame('Opponent paused the match.'); break;
      case 'resume':
        r.remotePaused = false; if (!r.exitPaused) resumeGame(); break;
      default: break;
    }
  }

  function clearDisconnectNotice() {
    const actions = $('[data-disconnect-actions]'); if (actions) actions.hidden = true;
    const title = $('[data-pause-title]'); if (title) title.textContent = 'MATCH PAUSED';
  }
  function showDisconnectedNotice(text) {
    if (!r.open || !['game', 'lobby', 'result'].includes(r.state)) return;
    r.remotePaused = true; pauseGame(text || 'Opponent left the match.');
    const title = $('[data-pause-title]'); if (title) title.textContent = 'OPPONENT LEFT';
    const resume = $('[data-resume]'); if (resume) resume.hidden = true;
    const actions = $('[data-disconnect-actions]'); if (actions) actions.hidden = false;
  }
  function exitDisconnectedMatch() {
    r.state = 'home'; const pause = $('[data-pause]'); if (pause) pause.hidden = true; clearDisconnectNotice(); reset();
    if (r.bridge?.getSnapshot?.()?.soundEnabled !== false) r.music?.resume?.();
  }
  function closeDisconnectedGame() { r.state = 'home'; clearDisconnectNotice(); close(true); }

  function pauseGame(text) {
    r.paused = true; if (isSolo()) { clearTimeout(r.aiTimer); r.aiTimer = 0; r.aiThinking = false; }
    const panel = $('[data-pause]'); if (panel) panel.hidden = false; $('[data-pause-text]').textContent = text || 'Paused.'; r.music?.pause?.();
  }
  function resumeGame() {
    r.paused = false; const panel = $('[data-pause]'); if (panel) panel.hidden = true; r.lastClockAt = performance.now(); if (r.bridge?.getSnapshot?.()?.soundEnabled !== false) r.music?.resume?.();
    maybeScheduleSoloBot(360);
  }
  function pauseLocal(reason = 'pause') {
    if (r.state !== 'game' || r.paused) return false;
    r.exitPaused = true; pauseGame(reason === 'hidden' ? 'Match paused while app is in background.' : 'Match paused safely.'); r.session?.send({ t: 'pause' }); $('[data-resume]').hidden = false; return true;
  }
  function resumeLocal() {
    if (!r.exitPaused) return false;
    r.exitPaused = false; $('[data-resume]').hidden = true; if (!r.remotePaused) resumeGame(); r.session?.send({ t: 'resume' }); return true;
  }
  function visibilityChanged() { if (!r.open || r.state !== 'game') return; if (document.hidden) pauseLocal('hidden'); else if (r.exitPaused) resumeLocal(); }

  function toggleSound() {
    const next = !(r.bridge?.getSnapshot?.()?.soundEnabled !== false);
    r.bridge?.setSoundEnabled?.(next); $('[data-sound]').textContent = next ? '🔊' : '🔇'; if (next && !r.paused) r.music?.resume?.(); else r.music?.pause?.();
  }

  function audio() {
    if (r.audio) return r.audio;
    try { r.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    return r.audio;
  }

  function sfx(kind) {
    if (r.bridge?.getSnapshot?.()?.soundEnabled === false) return;
    const a = audio(); if (!a) return;
    try {
      if (a.state === 'suspended') a.resume();
      const table = {
        ready: [520, 700, .10, 'triangle'], connect: [620, 860, .11, 'sine'], count: [380, 420, .09, 'triangle'], go: [720, 1020, .12, 'triangle'],
        move: [240, 300, .07, 'triangle'], capture: [150, 420, .14, 'square'], king: [620, 1120, .14, 'sine'], freeze: [900, 430, .13, 'sine'], extra: [520, 880, .12, 'triangle'],
        bomb: [110, 55, .18, 'sawtooth'], shield: [760, 520, .13, 'triangle'], timeout: [190, 120, .12, 'square'], win: [650, 1180, .16, 'sine'], lose: [260, 120, .13, 'sawtooth']
      };
      const [start, end, volume, type] = table[kind] || table.move, now = a.currentTime;
      const osc = a.createOscillator(), gain = a.createGain(); osc.type = type; osc.frequency.setValueAtTime(start, now); osc.frequency.exponentialRampToValueAtTime(Math.max(40, end), now + .16);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, __ict8SfxGain(volume)), now + .008); gain.gain.exponentialRampToValueAtTime(.0001, now + .18);
      osc.connect(gain).connect(a.destination); osc.start(now); osc.stop(now + .2);
    } catch (_) {}
  }

  function reset() {
    clearInterval(r.timerId); r.timerId = 0; clearTimeout(r.aiTimer); r.aiTimer = 0; r.aiThinking = false; closeScanner();
    try { r.session?.close?.(); } catch (_) {}
    r.session = null; r.role = ''; r.localReady = r.remoteReady = false; r.localNextReady = r.remoteNextReady = false;
    r.game = null; r.selected = -1; r.selectedPower = ''; r.actionPending = false; r.paused = r.remotePaused = r.exitPaused = false; r.hostCode = r.answerCode = ''; r.configReceived = false;
    const pause = $('[data-pause]'); if (pause) pause.hidden = true; clearDisconnectNotice(); show('home');
  }

  function returnHub() { const callback = r.onBack; close(false); callback?.(); }
  function close(callOnClose = true) {
    if (!r.open) return;
    r.invites?.stop?.({ cleanup: true }); reset(); r.open = false; r.overlay.hidden = true; document.body.classList.remove('p2p0-active'); if (callOnClose) r.onClose?.();
  }

  function open(options = {}) {
    build(); r.bridge = options.bridge || null; r.music = options.music || null; r.onBack = options.onBack || null; r.onClose = options.onClose || null;
    r.open = true; r.overlay.hidden = false; document.body.classList.add('p2p0-active'); reset(); ensureStudentInvites(); r.invites?.start?.();
    const identity = r.bridge?.getPlayerIdentity?.(); if (identity?.name && $('[data-solo-name]')) $('[data-solo-name]').value = identity.name;
    $('[data-sound]').textContent = r.bridge?.getSnapshot?.()?.soundEnabled === false ? '🔇' : '🔊';
  }

  window[GLOBAL_NAME] = Object.freeze({ open, close: () => close(true), isOpen: () => r.open, pauseForExitGuard: () => pauseLocal('Match paused safely.'), resumeFromExitGuard: resumeLocal });
})();
