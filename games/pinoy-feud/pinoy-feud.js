(() => {
  'use strict';

  if (window.ICT8PinoyFeud) return;

  const GAME_ID = 'pinoy-feud';
  const GLOBAL_NAME = 'ICT8PinoyFeud';
  const PREFIX = 'PF1';
  const WATCH_GAME_ID = 'pinoy-feud-watch';
  const WATCH_PREFIX = 'PFW1';
  const MAIN_ROUNDS = 3;
  const ROUND_MULTIPLIERS = [1, 1, 2];
  const FACE_OFF_BUZZ_MS = 8000;
  const ANSWER_MS = 12000;
  const STEAL_MS = 15000;
  const FAST_MONEY_MS = 35000;
  const FAST_MONEY_TARGET = 120;

  const BOT_LEVELS = Object.freeze({
    easy:   { label: 'EASY',   minDelay: 2200, maxDelay: 3900, correct: .56, topBias: .30, description: 'Relaxed bot. Mabagal at madalas magkamali.' },
    normal: { label: 'NORMAL', minDelay: 1450, maxDelay: 2800, correct: .76, topBias: .52, description: 'Balanced speed at accuracy para sa casual match.' },
    hard:   { label: 'HARD',   minDelay: 850,  maxDelay: 1700, correct: .90, topBias: .72, description: 'Mabilis at mas madalas makakuha ng high-board answers.' }
  });

  const P = () => window.ICT8ZeroDbP2P;
  const BANK = () => window.ICT8PinoyFeudQuestions?.questions || [];
  const CATEGORIES = () => window.ICT8PinoyFeudQuestions?.categories || ['RANDOM'];
  const other = side => side === 'h' ? 'g' : 'h';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const deepClone = value => JSON.parse(JSON.stringify(value));

  const r = {
    built: false,
    open: false,
    overlay: null,
    panels: {},
    bridge: null,
    music: null,
    onBack: null,
    onClose: null,
    role: '',
    state: 'home',
    session: null,
    audienceHostSession: null,
    watchSession: null,
    invites: null,
    scannerStop: null,
    hostCode: '',
    answerCode: '',
    watchHostCode: '',
    watchAnswerCode: '',
    localName: 'PLAYER 1',
    remoteName: 'PLAYER 2',
    category: 'RANDOM',
    botDifficulty: 'normal',
    seed: 1,
    localReady: false,
    remoteReady: false,
    game: null,
    authorityTimer: 0,
    botTimer: 0,
    uiTimer: 0,
    uiTimerStartedAt: 0,
    uiTimerDuration: 0,
    uiTimerToken: -1,
    fastEndsAt: 0,
    rematchLocal: false,
    rematchRemote: false,
    audioCtx: null,
    toastTimer: 0,
    audienceConnected: false,
    paused: false,
    exitPaused: false,
    lastWatchState: null,
    lastUiPhase: '',
    lastUiRevealedCount: 0,
    lastUiStrikes: 0,
    stageFlashTimer: 0
  };

  const $ = selector => r.overlay?.querySelector(selector) || null;
  const $$ = selector => Array.from(r.overlay?.querySelectorAll(selector) || []);

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function cleanName(value, fallback = 'PLAYER') {
    return P()?.cleanName ? P().cleanName(value, fallback) : (String(value || '').trim().slice(0, 20) || fallback);
  }

  function rand() {
    if (!r.game) return Math.random();
    r.game.rngState = (Math.imul(r.game.rngState ^ (r.game.rngState >>> 15), 1 | r.game.rngState) + 0x6D2B79F5) >>> 0;
    let t = r.game.rngState;
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function currentQuestion() {
    if (!r.game) return null;
    const id = r.game.roundIds?.[r.game.roundIndex];
    return BANK().find(q => q.id === id) || null;
  }

  function currentFastQuestion() {
    if (!r.game) return null;
    const id = r.game.fastIds?.[r.game.fast?.index || 0];
    return BANK().find(q => q.id === id) || null;
  }

  function localSide() {
    if (r.role === 'host' || r.role === 'solo') return 'h';
    if (r.role === 'guest') return 'g';
    return '';
  }

  function isAuthority() { return r.role === 'host' || r.role === 'solo'; }
  function isSolo() { return r.role === 'solo'; }
  function isWatch() { return r.role === 'watch'; }
  function sideName(side) { return side === 'h' ? r.localHostName() : r.localGuestName(); }
  r.localHostName = () => r.role === 'guest' ? r.remoteName : r.localName;
  r.localGuestName = () => r.role === 'guest' ? r.localName : r.remoteName;

  function ensureAudio() {
    if (r.bridge?.getSnapshot?.()?.soundEnabled === false) return null;
    if (!r.audioCtx) {
      try { r.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { r.audioCtx = null; }
    }
    try { if (r.audioCtx?.state === 'suspended') r.audioCtx.resume(); } catch (_) {}
    return r.audioCtx;
  }

  function tone(freq = 440, duration = .11, volume = .065, type = 'sine', end = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(50, freq), now);
    if (end > 0) osc.frequency.exponentialRampToValueAtTime(Math.max(50, end), now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + duration + .03);
  }

  function sfx(kind) {
    if (r.bridge?.getSnapshot?.()?.soundEnabled === false) return;
    if (kind === 'buzz') { tone(210, .12, .11, 'square', 150); setTimeout(() => tone(170, .09, .08, 'square'), 95); }
    else if (kind === 'correct') { tone(520, .13, .08, 'triangle', 760); setTimeout(() => tone(790, .16, .08, 'sine', 1050), 90); }
    else if (kind === 'wrong') { tone(175, .22, .11, 'sawtooth', 95); }
    else if (kind === 'steal') { tone(330, .12, .08, 'triangle', 500); setTimeout(() => tone(590, .14, .08, 'triangle', 760), 100); }
    else if (kind === 'win') { tone(523, .16, .08, 'triangle', 660); setTimeout(() => tone(659, .17, .08, 'triangle', 880), 120); setTimeout(() => tone(784, .24, .09, 'sine', 1040), 250); }
    else if (kind === 'reveal') { tone(392, .08, .065, 'triangle', 523); setTimeout(() => tone(523, .10, .07, 'triangle', 659), 75); setTimeout(() => tone(659, .15, .075, 'sine', 784), 150); }
    else if (kind === 'round') { tone(330, .10, .065, 'triangle', 440); setTimeout(() => tone(494, .12, .07, 'triangle', 659), 90); setTimeout(() => tone(659, .17, .075, 'sine', 880), 190); }
    else if (kind === 'strike3') { tone(150, .16, .11, 'sawtooth', 90); setTimeout(() => tone(120, .20, .10, 'square', 75), 120); }
    else if (kind === 'tick') tone(440, .035, .025, 'sine');
    else tone(410, .08, .055, 'triangle', 560);
  }

  function build() {
    if (r.built) return;
    const o = document.createElement('div');
    o.className = 'p2p0-overlay feud-overlay';
    o.hidden = true;
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-label', 'Pinoy Feud game');
    o.innerHTML = `
      <section class="p2p0-shell feud-shell">
        <header class="p2p0-top feud-top">
          <button type="button" data-back>← MINI-GAMES</button>
          <div class="p2p0-brand"><span>🇵🇭</span><div><small>SOLO · 2P · AUDIENCE · NO XP</small><strong>PINOY FEUD</strong></div></div>
          <div class="p2p0-top-actions"><button type="button" data-sound aria-label="Toggle sound">🔊</button><button type="button" data-close aria-label="Close Pinoy Feud">×</button></div>
        </header>
        <main class="p2p0-main feud-main">
          <section class="p2p0-panel active" data-panel="home">
            <div class="p2p0-card p2p0-home-card feud-home-card">
              <span class="feud-hero">🎤</span>
              <h1>PINOY FEUD</h1>
              <p>Hulaan ang top answers sa Filipino game-board questions. Mag-solo laban sa bot, mag-1v1, o gawing audience screen ang device na ito.</p>
              <div class="p2p0-badges"><span>🤖 SOLO VS BOT</span><span>⚡ LIVE BUZZER</span><span>📺 AUDIENCE VIEW</span><span>📝 3000+ QUESTIONS</span></div>
              <div class="feud-mode-grid">
                <button class="feud-mode-btn primary" type="button" data-solo><span>🤖</span><div><strong>SOLO VS BOT</strong><small>Easy, Normal, or Hard.</small></div></button>
                <button class="feud-mode-btn" type="button" data-multi><span>👥</span><div><strong>2P / TEAM BATTLE</strong><small>Create or join a direct match.</small></div></button>
                <button class="feud-mode-btn audience" type="button" data-watch><span>📺</span><div><strong>AUDIENCE / WATCH</strong><small>View-only screen for TV or projector.</small></div></button>
              </div>
              <small class="p2p0-note">Typed answers · aliases + light typo matching · 3 strikes · steal · Fast Money · 3000+ question bank · clearer turn prompts · show-style graphics and animation.</small>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="solo">
            <div class="p2p0-card p2p0-pair-card feud-setup-card">
              <div class="p2p0-step-head"><span>SOLO</span><strong>Play against the Pinoy Bot</strong></div>
              <label class="feud-select-field"><span>BOT DIFFICULTY</span><select data-bot-level><option value="easy">Easy</option><option value="normal" selected>Normal</option><option value="hard">Hard</option></select></label>
              <div class="feud-help" data-bot-help></div>
              <label class="feud-select-field"><span>QUESTION PACK</span><select data-solo-category></select></label>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME</span><input data-solo-name maxlength="20" value="PLAYER 1" autocomplete="nickname"></label>
              <button class="p2p0-btn primary" type="button" data-start-solo>START SOLO GAME</button>
              <button class="p2p0-btn feud-back-btn" type="button" data-home>BACK</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="multi">
            <div class="p2p0-card p2p0-home-card feud-multi-card">
              <span class="feud-lobby-icon">⚡</span><h2>2P / TEAM BATTLE</h2>
              <p>Player 1 hosts. Player 2 joins by Student ID invite, QR, Share, or manual pairing code.</p>
              <div class="p2p0-actions p2p0-home-actions"><button class="p2p0-btn primary" type="button" data-host>CREATE / INVITE</button><button class="p2p0-btn" type="button" data-join>JOIN / SCAN QR</button></div>
              <small class="p2p0-note">Direct WebRTC · one authoritative board · phone and desktop friendly.</small>
              <button class="p2p0-btn feud-back-btn" type="button" data-home>BACK</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="host">
            <div class="p2p0-card p2p0-pair-card">
              <div class="p2p0-step-head"><span>HOST</span><strong>Create Pinoy Feud match</strong></div>
              <label class="feud-select-field"><span>QUESTION PACK</span><select data-host-category></select></label>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME / TEAM</span><input data-host-name maxlength="20" autocomplete="nickname" value="TEAM A"></label>
              <div class="p2p0-method-card"><span class="p2p0-method-icon">📷</span><div><strong>QR / SHARE PAIRING</strong><small>Player 2 scans or receives the Host code.</small></div></div>
              <button class="p2p0-btn" type="button" data-make-offer>CREATE HOST QR</button>
              <div class="p2p0-qr-block" data-host-qr-wrap hidden><img data-host-qr alt="Pinoy Feud Host QR"><strong>PLAYER 2: SCAN THIS QR</strong><small>Then scan Player 2's response QR.</small><div class="p2p0-inline-actions"><button class="p2p0-btn" type="button" data-share-offer>SHARE INVITE</button><button class="p2p0-btn" type="button" data-copy-offer>COPY CODE</button></div><button class="p2p0-btn primary" type="button" data-scan-answer>SCAN RESPONSE QR</button><details class="p2p0-advanced"><summary>Manual paste fallback</summary><label class="p2p0-field"><span>PLAYER 2 RESPONSE CODE</span><textarea data-answer-input spellcheck="false"></textarea></label><button class="p2p0-btn" type="button" data-apply-answer>CONNECT PLAYER 2</button></details></div>
              <div class="p2p0-status" data-host-status>Create a Student ID invite or Host QR.</div>
              <button class="p2p0-btn feud-back-btn" type="button" data-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="guest">
            <div class="p2p0-card p2p0-pair-card">
              <div class="p2p0-step-head"><span>PLAYER 2</span><strong>Join Pinoy Feud match</strong></div>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME / TEAM</span><input data-guest-name maxlength="20" autocomplete="nickname" value="TEAM B"></label>
              <div class="p2p0-method-card primary-method"><span class="p2p0-method-icon">📷</span><div><strong>SCAN HOST QR</strong><small>Scan Player 1's Pinoy Feud QR.</small></div></div>
              <button class="p2p0-btn primary" type="button" data-scan-offer>SCAN HOST QR</button>
              <details class="p2p0-advanced"><summary>Paste shared Host Code instead</summary><label class="p2p0-field"><span>HOST PAIR CODE</span><textarea data-offer-input spellcheck="false"></textarea></label><button class="p2p0-btn" type="button" data-make-answer>CREATE RESPONSE</button></details>
              <div class="p2p0-qr-block" data-guest-qr-wrap hidden><img data-guest-qr alt="Pinoy Feud Response QR"><strong>HOST: SCAN THIS RESPONSE</strong><small>Keep this screen open while connecting.</small><div class="p2p0-inline-actions"><button class="p2p0-btn" type="button" data-share-answer>SHARE RESPONSE</button><button class="p2p0-btn" type="button" data-copy-answer>COPY CODE</button></div></div>
              <div class="p2p0-status" data-guest-status>Scan Host QR or accept a Student ID invite.</div>
              <button class="p2p0-btn feud-back-btn" type="button" data-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="lobby">
            <div class="p2p0-card feud-lobby-card">
              <span class="feud-lobby-icon">🎤</span><h2>FEUD LOBBY</h2>
              <div class="feud-config-summary" data-config-summary></div>
              <div class="p2p0-lobby-grid"><div class="p2p0-player" data-local-player><small>YOU</small><strong data-local-name>PLAYER</strong></div><div class="p2p0-player" data-remote-player><small>OPPONENT</small><strong data-remote-name>OPPONENT</strong></div></div>
              <button class="p2p0-btn primary" type="button" data-ready>I'M READY</button>
              <div class="p2p0-status" data-lobby-status>Waiting for both players.</div>
              <div class="feud-audience-box"><div><span>📺</span><p><strong>AUDIENCE DISPLAY</strong><small>Optional TV/projector view. It never becomes a player.</small></p></div><button class="p2p0-btn" type="button" data-open-audience-host>CONNECT AUDIENCE</button><span class="feud-audience-status" data-audience-status>Not connected</span></div>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="audience-host">
            <div class="p2p0-card p2p0-pair-card">
              <div class="p2p0-step-head"><span>HOST DISPLAY LINK</span><strong>Connect a view-only audience screen</strong></div>
              <p class="feud-pair-copy">On the TV/projector device, open Pinoy Feud → Audience / Watch, then scan this QR or paste the code.</p>
              <button class="p2p0-btn primary" type="button" data-make-watch-offer>CREATE WATCH QR</button>
              <div class="p2p0-qr-block" data-watch-host-qr-wrap hidden><img data-watch-host-qr alt="Audience Host QR"><strong>AUDIENCE DEVICE: SCAN THIS</strong><small>Then return its response QR to this Host.</small><div class="p2p0-inline-actions"><button class="p2p0-btn" type="button" data-share-watch-offer>SHARE</button><button class="p2p0-btn" type="button" data-copy-watch-offer>COPY CODE</button></div><button class="p2p0-btn primary" type="button" data-scan-watch-answer>SCAN AUDIENCE RESPONSE</button><details class="p2p0-advanced"><summary>Manual paste fallback</summary><label class="p2p0-field"><span>AUDIENCE RESPONSE CODE</span><textarea data-watch-answer-input spellcheck="false"></textarea></label><button class="p2p0-btn" type="button" data-apply-watch-answer>CONNECT DISPLAY</button></details></div>
              <div class="p2p0-status" data-watch-host-status>Audience display is optional.</div>
              <button class="p2p0-btn feud-back-btn" type="button" data-back-lobby>BACK TO LOBBY</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="watch">
            <div class="p2p0-card p2p0-pair-card feud-watch-card">
              <div class="p2p0-step-head"><span>AUDIENCE / WATCH</span><strong>This device becomes view-only</strong></div>
              <p class="feud-pair-copy">No buzzer. No answer box. The Host sends the live board, scores, strikes, and round changes to this screen.</p>
              <button class="p2p0-btn primary" type="button" data-scan-watch-offer>SCAN HOST WATCH QR</button>
              <details class="p2p0-advanced"><summary>Paste Host Watch Code instead</summary><label class="p2p0-field"><span>HOST WATCH CODE</span><textarea data-watch-offer-input spellcheck="false"></textarea></label><button class="p2p0-btn" type="button" data-make-watch-answer>CREATE AUDIENCE RESPONSE</button></details>
              <div class="p2p0-qr-block" data-watch-guest-qr-wrap hidden><img data-watch-guest-qr alt="Audience response QR"><strong>HOST: SCAN THIS RESPONSE</strong><small>Keep this audience screen open.</small><div class="p2p0-inline-actions"><button class="p2p0-btn" type="button" data-share-watch-answer>SHARE</button><button class="p2p0-btn" type="button" data-copy-watch-answer>COPY CODE</button></div></div>
              <div class="p2p0-status" data-watch-status>Waiting for Host Watch QR.</div>
              <button class="p2p0-btn feud-back-btn" type="button" data-watch-cancel>BACK</button>
            </div>
          </section>

          <section class="p2p0-panel feud-game-panel" data-panel="game">
            <div class="feud-game" data-game-root>
              <div class="feud-scorebar">
                <div class="feud-team-card team-a" data-team-h><small>TEAM A</small><strong data-team-h-name>TEAM A</strong><b><span data-score-h>0</span><em data-pending-h></em></b></div>
                <div class="feud-center-status"><span data-round-label>ROUND 1</span><strong data-phase-label>FACE-OFF</strong><div class="feud-timer"><i data-timer-bar></i><b data-timer>—</b></div></div>
                <div class="feud-team-card team-b" data-team-g><small>TEAM B</small><strong data-team-g-name>TEAM B</strong><b><span data-score-g>0</span><em data-pending-g></em></b></div>
              </div>
              <section class="feud-question-card"><small data-category-label>GAME BOARD</small><h2 data-question>Waiting for the question…</h2></section>
              <div class="feud-turn-banner waiting" data-turn-banner><span data-turn-kicker>GET READY</span><strong data-turn-main>Waiting for the next action…</strong><small data-turn-sub>Watch the board and timer.</small></div>
              <div class="feud-board-wrap"><div class="feud-board" data-board></div></div>
              <div class="feud-stage-row"><div class="feud-strikes" data-strikes><span>✕</span><span>✕</span><span>✕</span></div><div class="feud-round-bank"><small>ROUND BANK</small><strong data-round-bank>0</strong></div></div>
              <div class="feud-feedback" data-feedback>Get ready.</div>
              <div class="feud-controls" data-controls>
                <button class="feud-buzz" type="button" data-buzz hidden><span>⚡</span><strong>BUZZ!</strong><small>Tap first</small></button>
                <form class="feud-answer-form" data-answer-form hidden><input data-answer-input-game maxlength="60" autocomplete="off" placeholder="I-type ang sagot…"><button type="submit">SUBMIT</button></form>
                <button class="p2p0-btn primary feud-fast-start" type="button" data-fast-start hidden>START FAST MONEY</button>
                <small class="feud-control-note" data-control-note></small>
              </div>
              <div class="feud-audience-badge" data-audience-badge hidden>📺 AUDIENCE VIEW · LIVE BOARD ONLY</div>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="result">
            <div class="p2p0-card feud-result-card">
              <span class="feud-result-icon" data-result-icon>🏆</span><small>PINOY FEUD COMPLETE</small><h2 data-result-title>GAME OVER</h2><p data-result-sub></p>
              <div class="feud-result-grid"><div><small data-result-h-name>TEAM A</small><strong data-result-h-score>0</strong></div><div><small data-result-g-name>TEAM B</small><strong data-result-g-score>0</strong></div><div><small>FAST MONEY</small><strong data-result-fast>—</strong></div><div><small>REWARD</small><strong>0 XP</strong></div></div>
              <div class="p2p0-actions"><button class="p2p0-btn primary" type="button" data-rematch>REMATCH</button><button class="p2p0-btn" type="button" data-result-hub>MINI-GAMES</button></div>
              <div class="p2p0-status" data-result-status>Ready for another round?</div>
            </div>
          </section>

          <div class="p2p0-pause" data-pause hidden><div><h2 data-pause-title>GAME PAUSED</h2><p data-pause-text>Waiting…</p><button class="p2p0-btn primary" type="button" data-resume>CONTINUE</button><button class="p2p0-btn" type="button" data-continue-bot hidden>CONTINUE VS BOT</button><div class="p2p0-disconnect-actions" data-disconnect-actions hidden><button class="p2p0-btn primary" type="button" data-disconnect-exit>EXIT MATCH</button><button class="p2p0-btn ghost" type="button" data-disconnect-close>CLOSE GAME</button></div></div></div>
          <div class="p2p0-scanner" data-scanner hidden><div class="p2p0-scanner-card"><div class="p2p0-scan-head"><strong data-scan-title>SCAN QR</strong><button type="button" data-scan-close>×</button></div><div class="p2p0-camera"><video data-scan-video playsinline muted></video></div><p class="p2p0-scan-status" data-scan-status>Point the camera at the other device.</p></div></div>
          <div class="feud-stage-flash" data-stage-flash hidden><div><small data-stage-flash-kicker>SHOWTIME</small><strong data-stage-flash-title>GET READY!</strong><span data-stage-flash-sub></span></div></div>
          <div class="feud-toast" data-toast hidden></div>
        </main>
      </section>`;

    document.body.appendChild(o);
    r.overlay = o;
    $$('[data-panel]').forEach(panel => { r.panels[panel.dataset.panel] = panel; });

    fillCategorySelects();
    $('[data-back]').onclick = returnHub;
    $('[data-close]').onclick = () => close(true);
    $('[data-sound]').onclick = toggleSound;
    $$('[data-home]').forEach(btn => { btn.onclick = () => show('home'); });
    $('[data-solo]').onclick = () => { show('solo'); renderBotHelp(); };
    $('[data-multi]').onclick = () => show('multi');
    $('[data-watch]').onclick = () => { r.role = 'watch'; show('watch'); };
    $('[data-host]').onclick = () => show('host');
    $('[data-join]').onclick = () => show('guest');
    $('[data-start-solo]').onclick = startSolo;
    $('[data-bot-level]').onchange = renderBotHelp;
    $('[data-make-offer]').onclick = createOffer;
    $('[data-make-answer]').onclick = () => createAnswer($('[data-offer-input]').value);
    $('[data-apply-answer]').onclick = () => applyAnswer($('[data-answer-input]').value);
    $('[data-scan-offer]').onclick = () => scan('player-offer');
    $('[data-scan-answer]').onclick = () => scan('player-answer');
    $('[data-copy-offer]').onclick = () => copyCode(r.hostCode, '[data-host-status]', 'Host invite copied.');
    $('[data-share-offer]').onclick = () => P()?.shareText?.(r.hostCode, 'Pinoy Feud Host Invite');
    $('[data-copy-answer]').onclick = () => copyCode(r.answerCode, '[data-guest-status]', 'Response copied.');
    $('[data-share-answer]').onclick = () => P()?.shareText?.(r.answerCode, 'Pinoy Feud Response');
    $$('[data-pair-cancel]').forEach(btn => { btn.onclick = cancelPlayerPairing; });
    $('[data-ready]').onclick = ready;
    $('[data-open-audience-host]').onclick = () => show('audience-host');
    $('[data-back-lobby]').onclick = () => show('lobby');
    $('[data-make-watch-offer]').onclick = createWatchOffer;
    $('[data-apply-watch-answer]').onclick = () => applyWatchAnswer($('[data-watch-answer-input]').value);
    $('[data-scan-watch-answer]').onclick = () => scan('watch-answer');
    $('[data-copy-watch-offer]').onclick = () => copyCode(r.watchHostCode, '[data-watch-host-status]', 'Watch code copied.');
    $('[data-share-watch-offer]').onclick = () => P()?.shareText?.(r.watchHostCode, 'Pinoy Feud Audience Display');
    $('[data-scan-watch-offer]').onclick = () => scan('watch-offer');
    $('[data-make-watch-answer]').onclick = () => createWatchAnswer($('[data-watch-offer-input]').value);
    $('[data-copy-watch-answer]').onclick = () => copyCode(r.watchAnswerCode, '[data-watch-status]', 'Audience response copied.');
    $('[data-share-watch-answer]').onclick = () => P()?.shareText?.(r.watchAnswerCode, 'Pinoy Feud Audience Response');
    $('[data-watch-cancel]').onclick = cancelWatch;
    $('[data-scan-close]').onclick = closeScanner;
    $('[data-buzz]').onclick = localBuzz;
    $('[data-answer-form]').addEventListener('submit', event => { event.preventDefault(); localAnswer(); });
    $('[data-fast-start]').onclick = localStartFastMoney;
    $('[data-rematch]').onclick = rematchReady;
    $('[data-result-hub]').onclick = returnHub;
    $('[data-resume]').onclick = resumeLocal;
    $('[data-continue-bot]').onclick = continueVsBot;
    $('[data-disconnect-exit]').onclick = exitDisconnectedMatch;
    $('[data-disconnect-close]').onclick = closeDisconnectedGame;

    r.built = true;
  }

  function fillCategorySelects() {
    const html = CATEGORIES().map(category => `<option value="${escapeHtml(category)}">${category === 'RANDOM' ? 'Random Mix' : escapeHtml(category)}</option>`).join('');
    ['[data-solo-category]', '[data-host-category]'].forEach(sel => { const el = $(sel); if (el) el.innerHTML = html; });
  }

  function renderBotHelp() {
    const level = BOT_LEVELS[String($('[data-bot-level]')?.value || 'normal')] || BOT_LEVELS.normal;
    const el = $('[data-bot-help]');
    if (el) el.innerHTML = `<strong>${level.label}</strong><p>${escapeHtml(level.description)}</p>`;
  }

  function show(name) {
    Object.entries(r.panels).forEach(([key, panel]) => panel.classList.toggle('active', key === name));
    r.state = name;
    if (r.panels[name]) r.panels[name].scrollTop = 0;
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
    el.className = `feud-toast ${kind}`.trim();
    clearTimeout(r.toastTimer);
    r.toastTimer = setTimeout(() => { if (el) el.hidden = true; }, 1500);
  }

  function showStageFlash(title, subtitle = '', kind = 'info', kicker = 'PINOY FEUD') {
    const el = $('[data-stage-flash]');
    if (!el) return;
    const titleEl = $('[data-stage-flash-title]');
    const subEl = $('[data-stage-flash-sub]');
    const kickEl = $('[data-stage-flash-kicker]');
    if (titleEl) titleEl.textContent = String(title || '');
    if (subEl) subEl.textContent = String(subtitle || '');
    if (kickEl) kickEl.textContent = String(kicker || 'PINOY FEUD');
    el.className = `feud-stage-flash ${kind}`.trim();
    el.hidden = false;
    clearTimeout(r.stageFlashTimer);
    r.stageFlashTimer = setTimeout(() => { if (el) el.hidden = true; }, kind === 'strike' ? 920 : 1150);
  }

  function runShowMoments(audience = false) {
    if (!r.game) return;
    const phase = String(r.game.phase || '');
    const revealCount = Array.isArray(r.game.revealed) ? r.game.revealed.length : 0;
    const strikes = Number(r.game.strikes || 0);
    const phaseChanged = phase !== r.lastUiPhase;

    if (revealCount > r.lastUiRevealedCount && !phase.startsWith('fast')) {
      showStageFlash('ANSWER ON THE BOARD!', `${boardPoints().toLocaleString()} points in the round bank`, 'reveal', 'SURVEY BOARD');
      sfx('reveal');
    } else if (strikes > r.lastUiStrikes) {
      showStageFlash(strikes >= 3 ? 'THREE STRIKES!' : 'STRIKE!', strikes >= 3 ? 'Steal chance is coming.' : 'Try another answer.', 'strike', '✕');
      sfx(strikes >= 3 ? 'strike3' : 'wrong');
    } else if (phaseChanged) {
      if (phase === 'steal') { showStageFlash('STEAL CHANCE!', `${sideName(other(r.game.controller))} gets one answer.`, 'steal', 'ONE SHOT'); sfx('steal'); }
      else if (phase === 'round-result') { showStageFlash('ROUND COMPLETE!', `${sideName(r.game.roundWinner || 'h')} takes the round.`, 'round', 'SCORES UPDATED'); sfx('round'); }
      else if (phase === 'fast-intro') { showStageFlash('FAST MONEY!', `${sideName(r.game.fast.side)} is up.`, 'fast', 'FINAL ROUND'); sfx('round'); }
      else if (phase === 'faceoff-buzz' && r.lastUiPhase) { showStageFlash('BUZZER READY!', audience ? 'Watch the face-off live.' : 'Tap first to answer!', 'buzz', 'FACE-OFF'); }
    }

    r.lastUiPhase = phase;
    r.lastUiRevealedCount = revealCount;
    r.lastUiStrikes = strikes;
  }

  function readCategory(selector) {
    const value = String($(selector)?.value || 'RANDOM');
    return CATEGORIES().includes(value) ? value : 'RANDOM';
  }

  function selectQuestionIds(category, seed) {
    let pool = BANK().filter(q => category === 'RANDOM' || q.category === category);
    if (pool.length < 9) pool = BANK().slice();
    const shuffled = P()?.shuffle ? P().shuffle(pool, seed) : pool.slice().sort(() => Math.random() - .5);
    const ids = shuffled.map(q => q.id);
    return { roundIds: ids.slice(0, 4), fastIds: ids.slice(4, 9) };
  }

  function makeGame(seed, category) {
    const picks = selectQuestionIds(category, seed);
    return {
      seed: Number(seed || 1) >>> 0,
      rngState: (Number(seed || 1) ^ 0x9e3779b9) >>> 0,
      category,
      roundIds: picks.roundIds,
      fastIds: picks.fastIds,
      roundIndex: 0,
      tieBreaker: false,
      phase: 'idle',
      seq: 0,
      timerMs: 0,
      scores: { h: 0, g: 0 },
      revealed: [],
      strikes: 0,
      controller: '',
      buzzWinner: '',
      faceoff: { firstSide: '', currentSide: '', firstPoints: 0, secondPoints: 0, firstIndex: -1, secondIndex: -1 },
      feedback: 'Get ready.',
      roundWinner: '',
      fast: { side: '', index: 0, total: 0, answers: [], target: FAST_MONEY_TARGET, done: false, success: false },
      winner: ''
    };
  }

  function beginNewMatch(seed = r.seed, category = r.category) {
    clearAuthorityTimers();
    r.lastUiPhase = '';
    r.lastUiRevealedCount = 0;
    r.lastUiStrikes = 0;
    r.rematchLocal = r.rematchRemote = false;
    r.game = makeGame(seed, category);
    show('game');
    startRound(0, false);
  }

  function startRound(index, tieBreaker = false) {
    if (!r.game || !isAuthority()) return;
    r.game.roundIndex = index;
    r.game.tieBreaker = tieBreaker;
    r.game.revealed = [];
    r.game.strikes = 0;
    r.game.controller = '';
    r.game.buzzWinner = '';
    r.game.faceoff = { firstSide: '', currentSide: '', firstPoints: 0, secondPoints: 0, firstIndex: -1, secondIndex: -1 };
    r.game.roundWinner = '';
    r.game.feedback = tieBreaker ? 'Tie-breaker! Unang makakuha ng round ang mananalo.' : 'Face-Off! Unahan sa BUZZ.';
    enterPhase('faceoff-buzz', FACE_OFF_BUZZ_MS, () => {
      if (isSolo()) acceptBuzz('g');
      else { r.game.feedback = 'Walang nag-buzz. Subukan ulit!'; enterPhase('faceoff-buzz', FACE_OFF_BUZZ_MS, phaseTimeout); }
    });
  }

  function phaseTimeout() {
    if (!r.game || !isAuthority()) return;
    const phase = r.game.phase;
    if (phase === 'faceoff-buzz') {
      if (isSolo()) acceptBuzz('g');
      else { r.game.feedback = 'Walang nag-buzz. Subukan ulit!'; enterPhase('faceoff-buzz', FACE_OFF_BUZZ_MS, phaseTimeout); }
      return;
    }
    if (phase === 'faceoff-answer') {
      processFaceoffAnswer(r.game.faceoff.currentSide, '', true);
      return;
    }
    if (phase === 'control') {
      processControlAnswer(r.game.controller, '', true);
      return;
    }
    if (phase === 'steal') {
      processStealAnswer(other(r.game.controller), '', true);
    }
  }

  function enterPhase(phase, timerMs = 0, timeoutFn = null) {
    if (!r.game) return;
    clearTimeout(r.authorityTimer);
    r.authorityTimer = 0;
    r.game.phase = phase;
    r.game.seq += 1;
    r.game.timerMs = Math.max(0, Number(timerMs || 0));
    syncGame();
    renderGame();
    if (isAuthority() && timerMs > 0 && timeoutFn) {
      const seq = r.game.seq;
      r.authorityTimer = setTimeout(() => { if (r.game?.seq === seq && r.game?.phase === phase) timeoutFn(); }, timerMs);
    }
    maybeScheduleBot();
  }

  function currentMultiplier() {
    if (!r.game) return 1;
    if (r.game.tieBreaker) return 1;
    return ROUND_MULTIPLIERS[r.game.roundIndex] || 1;
  }

  function boardPoints() {
    const q = currentQuestion();
    if (!q) return 0;
    return r.game.revealed.reduce((sum, index) => sum + Math.max(0, Number(q.answers[index]?.points || 0)), 0) * currentMultiplier();
  }

  function normalizeAnswer(value = '') {
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function levenshtein(a, b) {
    const s = String(a), t = String(b);
    if (s === t) return 0;
    if (!s) return t.length;
    if (!t) return s.length;
    const prev = Array.from({ length: t.length + 1 }, (_, i) => i);
    const cur = new Array(t.length + 1);
    for (let i = 1; i <= s.length; i += 1) {
      cur[0] = i;
      for (let j = 1; j <= t.length; j += 1) {
        cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1));
      }
      for (let j = 0; j <= t.length; j += 1) prev[j] = cur[j];
    }
    return prev[t.length];
  }

  const FEUD_STOP_WORDS = new Set(['ang','ng','mga','sa','at','ay','na','nang','para','the','a','an','of','to','and','or','with']);
  const FEUD_CONCEPTS = Object.freeze({
    cellphone:'phone', smartphone:'phone', selpon:'phone', mobile:'phone', cp:'phone',
    tubig:'water', tumbler:'water',
    sapatos:'shoes', sneaker:'shoes', sneakers:'shoes',
    jacket:'jacket', hoodie:'jacket', coat:'jacket',
    payong:'umbrella', umbrella:'umbrella',
    ulan:'rain', rainy:'rain',
    kape:'coffee', coffee:'coffee',
    tinapay:'bread', bread:'bread', pandesal:'bread',
    kanin:'rice', rice:'rice',
    itlog:'egg', eggs:'egg', egg:'egg',
    isda:'fish', fish:'fish',
    karne:'meat', meat:'meat',
    gulay:'vegetable', vegetables:'vegetable', vegetable:'vegetable', veggies:'vegetable',
    prutas:'fruit', fruits:'fruit', fruit:'fruit',
    backpack:'bag', schoolbag:'bag', bag:'bag',
    ballpen:'pen', bolpen:'pen', pen:'pen',
    kwaderno:'notebook', kuwaderno:'notebook', notebook:'notebook',
    libro:'book', book:'book',
    kaibigan:'friend', friends:'friend', friend:'friend', barkada:'friend',
    bahay:'home', house:'home', home:'home',
    tulog:'sleep', matulog:'sleep', natutulog:'sleep', sleep:'sleep', sleeping:'sleep',
    pagkain:'food', food:'food', snacks:'snack', snack:'snack',
    laro:'game', games:'game', game:'game', gaming:'game',
    musika:'music', music:'music', songs:'music', song:'music', kanta:'music',
    sine:'movie', movie:'movie', film:'movie', cinema:'movie',
    softdrink:'soda', softdrinks:'soda', soda:'soda',
    wifi:'internet', internet:'internet', data:'data',
    charger:'charger', charging:'charger',
    pera:'money', money:'money', cash:'money',
    teacher:'teacher', guro:'teacher',
    estudyante:'student', learner:'student', student:'student'
  });

  function feudStemToken(token = '') {
    let t = String(token || '').trim();
    if (!t) return '';
    if (FEUD_CONCEPTS[t]) return FEUD_CONCEPTS[t];
    if (t.length > 5 && t.endsWith('ies')) t = `${t.slice(0, -3)}y`;
    else if (t.length > 5 && t.endsWith('es')) t = t.slice(0, -2);
    else if (t.length > 4 && t.endsWith('s')) t = t.slice(0, -1);
    return FEUD_CONCEPTS[t] || t;
  }

  function feudTokens(value = '') {
    return normalizeAnswer(value)
      .split(' ')
      .map(feudStemToken)
      .filter(token => token && token.length > 1 && !FEUD_STOP_WORDS.has(token));
  }

  function tokenNear(a, b) {
    if (a === b) return true;
    if (!a || !b || Math.min(a.length, b.length) < 4) return false;
    const maxLen = Math.max(a.length, b.length);
    const limit = maxLen >= 9 ? 2 : 1;
    return Math.abs(a.length - b.length) <= limit && levenshtein(a, b) <= limit;
  }

  function fuzzyMatchScore(input, candidate) {
    if (!input || !candidate) return 0;
    if (input === candidate) return 1;

    const inputTokens = feudTokens(input);
    const candidateTokens = feudTokens(candidate);
    const inputCanon = inputTokens.join(' ');
    const candidateCanon = candidateTokens.join(' ');
    if (inputCanon && inputCanon === candidateCanon) return .99;

    // Accept a meaningful board-answer word by itself (e.g. "hoodie" for "Jacket / Hoodie").
    if (inputTokens.length === 1 && candidateTokens.some(token => tokenNear(inputTokens[0], token))) return .96;
    if (candidateTokens.length === 1 && inputTokens.some(token => tokenNear(candidateTokens[0], token))) return .94;

    // Phrase containment is useful for natural answers like "rubber shoes" vs "shoes".
    if (input.length >= 4 && candidate.length >= 4 && (input.includes(candidate) || candidate.includes(input))) {
      const ratio = Math.min(input.length, candidate.length) / Math.max(input.length, candidate.length);
      if (ratio >= .42) return .93;
    }

    if (inputTokens.length && candidateTokens.length) {
      let matched = 0;
      for (const token of inputTokens) {
        if (candidateTokens.some(otherToken => tokenNear(token, otherToken))) matched += 1;
      }
      const coverageInput = matched / inputTokens.length;
      const coverageCandidate = matched / candidateTokens.length;
      if (coverageInput >= .8 && coverageCandidate >= .5) return .91;
      if (coverageInput >= .67 && coverageCandidate >= .67) return .88;
    }

    if (input.length >= 4 && candidate.length >= 4) {
      const distance = levenshtein(input, candidate);
      const ratio = 1 - (distance / Math.max(input.length, candidate.length));
      if (ratio >= .84) return .87;
      if (Math.max(input.length, candidate.length) >= 9 && ratio >= .79 && input[0] === candidate[0]) return .82;
    }
    return 0;
  }

  function fuzzyEquivalent(input, candidate) {
    return fuzzyMatchScore(input, candidate) >= .82;
  }

  function findAnswer(question, raw) {
    const input = normalizeAnswer(raw);
    if (!question || input.length < 2) return { index: -1, duplicate: false, blank: true };
    let bestIndex = -1;
    let bestScore = 0;
    for (let index = 0; index < question.answers.length; index += 1) {
      const answer = question.answers[index];
      const variants = [answer.text, ...(answer.aliases || [])].map(normalizeAnswer).filter(Boolean);
      for (const candidate of variants) {
        const score = fuzzyMatchScore(input, candidate);
        if (score > bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      }
    }
    if (bestIndex >= 0 && bestScore >= .82) {
      return { index: bestIndex, duplicate: r.game?.revealed?.includes(bestIndex) || false, blank: false, score: bestScore };
    }
    return { index: -1, duplicate: false, blank: false, score: bestScore };
  }

  function acceptBuzz(side) {
    if (!r.game || !isAuthority() || r.game.phase !== 'faceoff-buzz' || r.game.buzzWinner) return;
    r.game.buzzWinner = side;
    r.game.faceoff.firstSide = side;
    r.game.faceoff.currentSide = side;
    r.game.feedback = `${sideName(side)} ang unang nag-BUZZ! Sagot na.`;
    sfx('buzz');
    enterPhase('faceoff-answer', ANSWER_MS, phaseTimeout);
  }

  function processFaceoffAnswer(side, text, timedOut = false) {
    if (!r.game || !isAuthority() || r.game.phase !== 'faceoff-answer' || side !== r.game.faceoff.currentSide) return;
    const q = currentQuestion();
    const result = findAnswer(q, text);
    const isFirst = side === r.game.faceoff.firstSide && r.game.faceoff.secondSide !== side;
    let points = 0;
    let index = -1;
    if (result.index >= 0 && !result.duplicate) {
      index = result.index;
      points = Number(q.answers[index].points || 0);
      if (!r.game.revealed.includes(index)) r.game.revealed.push(index);
      sfx('correct');
    } else {
      sfx('wrong');
    }

    if (isFirst) {
      r.game.faceoff.firstIndex = index;
      r.game.faceoff.firstPoints = points;
      r.game.faceoff.secondSide = other(side);
      r.game.faceoff.currentSide = other(side);
      r.game.feedback = points > 0 ? `${points} points! ${sideName(other(side))}, may isang sagot ka.` : `${timedOut ? 'Time!' : 'Wala sa board!'} ${sideName(other(side))}, chance mo.`;
      enterPhase('faceoff-answer', ANSWER_MS, phaseTimeout);
      return;
    }

    r.game.faceoff.secondIndex = index;
    r.game.faceoff.secondPoints = points;
    const p1 = Number(r.game.faceoff.firstPoints || 0);
    const p2 = Number(r.game.faceoff.secondPoints || 0);
    if (p1 <= 0 && p2 <= 0) {
      r.game.buzzWinner = '';
      r.game.faceoff = { firstSide: '', currentSide: '', firstPoints: 0, secondPoints: 0, firstIndex: -1, secondIndex: -1 };
      r.game.feedback = 'Parehong wala sa board. Face-Off ulit!';
      enterPhase('faceoff-buzz', FACE_OFF_BUZZ_MS, phaseTimeout);
      return;
    }
    const controller = p2 > p1 ? side : r.game.faceoff.firstSide;
    beginControl(controller);
  }

  function beginControl(side) {
    r.game.controller = side;
    r.game.strikes = 0;
    r.game.feedback = `${sideName(side)} controls the board. Hulaan ang natitirang sagot!`;
    enterPhase('control', ANSWER_MS, phaseTimeout);
  }

  function processControlAnswer(side, text, timedOut = false) {
    if (!r.game || !isAuthority() || r.game.phase !== 'control' || side !== r.game.controller) return;
    const q = currentQuestion();
    const result = findAnswer(q, text);
    if (result.duplicate) {
      r.game.feedback = 'Nasa board na ang sagot na iyon — try another answer.';
      toast('ALREADY ON THE BOARD', 'duplicate');
      enterPhase('control', ANSWER_MS, phaseTimeout);
      return;
    }
    if (result.index >= 0) {
      r.game.revealed.push(result.index);
      const answer = q.answers[result.index];
      r.game.feedback = `${answer.text} — ${answer.points} points!`;
      sfx('correct');
      if (r.game.revealed.length >= q.answers.length) { finishRound(side); return; }
      enterPhase('control', ANSWER_MS, phaseTimeout);
      return;
    }
    r.game.strikes += 1;
    r.game.feedback = timedOut ? 'TIME! Strike!' : 'Wala sa board — Strike!';
    sfx('wrong');
    if (r.game.strikes >= 3) {
      r.game.feedback = `3 STRIKES! ${sideName(other(side))} has one chance to STEAL.`;
      sfx('steal');
      enterPhase('steal', STEAL_MS, phaseTimeout);
    } else {
      enterPhase('control', ANSWER_MS, phaseTimeout);
    }
  }

  function processStealAnswer(side, text, timedOut = false) {
    if (!r.game || !isAuthority() || r.game.phase !== 'steal' || side !== other(r.game.controller)) return;
    const q = currentQuestion();
    const result = findAnswer(q, text);
    if (result.index >= 0 && !result.duplicate) {
      r.game.revealed.push(result.index);
      r.game.feedback = `STEAL! ${q.answers[result.index].text} is on the board.`;
      sfx('steal');
      finishRound(side);
    } else {
      r.game.feedback = `${timedOut ? 'TIME!' : 'STEAL FAILED!'} ${sideName(r.game.controller)} keeps the round.`;
      sfx('wrong');
      finishRound(r.game.controller);
    }
  }

  function finishRound(winnerSide) {
    if (!r.game || !isAuthority()) return;
    clearTimeout(r.authorityTimer);
    r.game.roundWinner = winnerSide;
    const bank = boardPoints();
    r.game.scores[winnerSide] += bank;
    r.game.feedback = `${sideName(winnerSide)} wins ${bank} round points!`;
    sfx('win');
    enterPhase('round-result', 2600, () => {
      const nextIndex = r.game.roundIndex + 1;
      if (!r.game.tieBreaker && nextIndex < MAIN_ROUNDS) startRound(nextIndex, false);
      else endMainGame();
    });
  }

  function endMainGame() {
    if (!r.game || !isAuthority()) return;
    const h = r.game.scores.h, g = r.game.scores.g;
    if (h === g && !r.game.tieBreaker) {
      r.game.feedback = 'TIED SCORE! Sudden tie-breaker round.';
      startRound(3, true);
      return;
    }
    const winner = h >= g ? 'h' : 'g';
    r.game.winner = winner;
    r.game.fast.side = winner;
    r.game.feedback = `${sideName(winner)} wins the main game! Fast Money is next.`;
    enterPhase('fast-intro', 0, null);
    if (isSolo() && winner === 'g') {
      const seq = r.game.seq;
      clearTimeout(r.botTimer);
      r.botTimer = setTimeout(() => { if (r.game?.seq === seq && r.game.phase === 'fast-intro') startFastMoney(); }, 1800);
    }
  }

  function startFastMoney() {
    if (!r.game || !isAuthority() || r.game.phase !== 'fast-intro') return;
    r.game.fast.index = 0;
    r.game.fast.total = 0;
    r.game.fast.answers = [];
    r.game.fast.done = false;
    r.game.fast.success = false;
    r.fastEndsAt = Date.now() + FAST_MONEY_MS;
    r.game.feedback = `${sideName(r.game.fast.side)}: 5 mabilisang tanong. Target ${FAST_MONEY_TARGET} points!`;
    clearTimeout(r.authorityTimer);
    r.game.phase = 'fast-money'; r.game.seq += 1; r.game.timerMs = FAST_MONEY_MS;
    syncGame(); renderGame(); maybeScheduleBot();
    const seq = r.game.seq;
    r.authorityTimer = setTimeout(() => { if (r.game?.seq === seq && r.game.phase === 'fast-money') finishFastMoney(); }, FAST_MONEY_MS);
  }

  function processFastMoneyAnswer(side, text) {
    if (!r.game || !isAuthority() || r.game.phase !== 'fast-money' || side !== r.game.fast.side) return;
    const q = currentFastQuestion();
    const result = findFastAnswer(q, text);
    const answer = result.index >= 0 ? q.answers[result.index] : null;
    const points = Number(answer?.points || 0);
    r.game.fast.answers.push({ questionId: q?.id || '', answer: answer?.text || String(text || '').trim() || '—', points });
    r.game.fast.total += points;
    r.game.fast.index += 1;
    r.game.feedback = points > 0 ? `${answer.text} — ${points} points!` : 'Wala sa game board. Next question!';
    if (points > 0) sfx('correct'); else sfx('wrong');
    if (r.game.fast.index >= r.game.fastIds.length || Date.now() >= r.fastEndsAt) { finishFastMoney(); return; }
    r.game.seq += 1;
    r.game.timerMs = Math.max(0, r.fastEndsAt - Date.now());
    syncGame(); renderGame(); maybeScheduleBot();
  }

  function findFastAnswer(question, raw) {
    const input = normalizeAnswer(raw);
    if (!question || input.length < 2) return { index: -1 };
    for (let index = 0; index < question.answers.length; index += 1) {
      const variants = [question.answers[index].text, ...(question.answers[index].aliases || [])].map(normalizeAnswer).filter(Boolean);
      if (variants.some(candidate => fuzzyEquivalent(input, candidate))) return { index };
    }
    return { index: -1 };
  }

  function finishFastMoney() {
    if (!r.game || !isAuthority() || !['fast-money','fast-intro'].includes(r.game.phase)) return;
    clearAuthorityTimers();
    r.game.fast.done = true;
    r.game.fast.success = r.game.fast.total >= r.game.fast.target;
    r.game.phase = 'complete'; r.game.seq += 1; r.game.timerMs = 0;
    r.game.feedback = r.game.fast.success ? 'FAST MONEY CLEARED!' : 'Fast Money complete!';
    syncGame();
    showResult();
    sfx('win');
  }

  function expectedAnswerSide() {
    if (!r.game) return '';
    if (r.game.phase === 'faceoff-answer') return r.game.faceoff.currentSide;
    if (r.game.phase === 'control') return r.game.controller;
    if (r.game.phase === 'steal') return other(r.game.controller);
    if (r.game.phase === 'fast-money') return r.game.fast.side;
    return '';
  }

  function localBuzz() {
    const side = localSide();
    if (!side || !r.game || r.game.phase !== 'faceoff-buzz') return;
    if (isAuthority()) acceptBuzz(side);
    else r.session?.send({ t: 'action', kind: 'buzz' });
  }

  function localAnswer() {
    const input = $('[data-answer-input-game]');
    const text = String(input?.value || '').trim();
    if (!text) { toast('TYPE AN ANSWER', 'wrong'); return; }
    if (input) input.value = '';
    const side = localSide();
    if (!side || side !== expectedAnswerSide()) return;
    if (isAuthority()) routeAnswer(side, text);
    else r.session?.send({ t: 'action', kind: 'answer', text });
  }

  function routeAnswer(side, text) {
    if (!r.game) return;
    if (r.game.phase === 'faceoff-answer') processFaceoffAnswer(side, text, false);
    else if (r.game.phase === 'control') processControlAnswer(side, text, false);
    else if (r.game.phase === 'steal') processStealAnswer(side, text, false);
    else if (r.game.phase === 'fast-money') processFastMoneyAnswer(side, text);
  }

  function localStartFastMoney() {
    if (!r.game || r.game.phase !== 'fast-intro' || localSide() !== r.game.fast.side) return;
    if (isAuthority()) startFastMoney(); else r.session?.send({ t: 'action', kind: 'fast-start' });
  }

  function botLevel() { return BOT_LEVELS[r.botDifficulty] || BOT_LEVELS.normal; }
  function botDelay() { const level = botLevel(); return Math.round(level.minDelay + rand() * (level.maxDelay - level.minDelay)); }

  function maybeScheduleBot() {
    clearTimeout(r.botTimer); r.botTimer = 0;
    if (!isSolo() || !r.game || !isAuthority()) return;
    const phase = r.game.phase;
    const seq = r.game.seq;
    let fn = null;
    if (phase === 'faceoff-buzz') fn = () => acceptBuzz('g');
    else if (phase === 'faceoff-answer' && r.game.faceoff.currentSide === 'g') fn = () => routeAnswer('g', botAnswerText(currentQuestion()));
    else if (phase === 'control' && r.game.controller === 'g') fn = () => routeAnswer('g', botAnswerText(currentQuestion()));
    else if (phase === 'steal' && other(r.game.controller) === 'g') fn = () => routeAnswer('g', botAnswerText(currentQuestion()));
    else if (phase === 'fast-money' && r.game.fast.side === 'g') fn = () => routeAnswer('g', botAnswerText(currentFastQuestion(), true));
    if (!fn) return;
    r.botTimer = setTimeout(() => { if (r.game?.seq === seq) fn(); }, botDelay());
  }

  function botAnswerText(question, fast = false) {
    if (!question) return 'hindi ko alam';
    const level = botLevel();
    const available = question.answers.map((a, index) => ({ a, index })).filter(item => fast || !r.game.revealed.includes(item.index));
    if (!available.length) return 'wala na';
    if (rand() > level.correct) {
      const wrong = ['assignment folder','sapatos','payong','telebisyon','laruan','calculator','charger','headset','uniform','wallet'];
      return wrong[Math.floor(rand() * wrong.length)];
    }
    const maxIndex = Math.max(1, Math.ceil(available.length * (1 - level.topBias * .65)));
    const pick = available[Math.min(available.length - 1, Math.floor(rand() * maxIndex))];
    return pick.a.text;
  }

  function publicState() {
    if (!r.game) return null;
    const state = deepClone(r.game);
    if (state.phase === 'fast-money') state.timerMs = Math.max(0, r.fastEndsAt - Date.now());
    return state;
  }

  function syncGame() {
    if (!isAuthority()) return;
    const state = publicState();
    if (r.role === 'host' && r.session?.connected) r.session.send({ t: 'state', state, names: { h: r.localName, g: r.remoteName } });
    if (r.audienceHostSession?.connected) r.audienceHostSession.send({ t: 'watch-state', state, names: { h: r.localHostName(), g: r.localGuestName() } });
  }

  function receiveState(message) {
    if (!message?.state) return;
    r.game = message.state;
    if (message.names) {
      if (r.role === 'guest') { r.remoteName = cleanName(message.names.h, 'TEAM A'); r.localName = cleanName(message.names.g, 'TEAM B'); }
      else if (r.role === 'watch') { r.remoteName = cleanName(message.names.g, 'TEAM B'); r.localName = cleanName(message.names.h, 'TEAM A'); }
    }
    if (r.game.phase === 'complete') { showResult(); return; }
    show('game');
    renderGame();
  }

  function playerMessage(message) {
    if (!message || typeof message !== 'object') return;
    if (message.t === 'config' && r.role === 'guest') {
      r.category = CATEGORIES().includes(message.category) ? message.category : 'RANDOM';
      renderConfigSummary();
      return;
    }
    if (message.t === 'ready' && r.role === 'host') {
      r.remoteReady = true; updateReady(); maybeStartMultiplayer(); return;
    }
    if (message.t === 'state' && r.role === 'guest') { receiveState(message); return; }
    if (message.t === 'action' && r.role === 'host') {
      if (!r.game) return;
      if (message.kind === 'buzz') acceptBuzz('g');
      else if (message.kind === 'answer') routeAnswer('g', String(message.text || '').slice(0, 80));
      else if (message.kind === 'fast-start' && r.game.phase === 'fast-intro' && r.game.fast.side === 'g') startFastMoney();
      return;
    }
    if (message.t === 'rematch' && r.role === 'host') { r.rematchRemote = true; maybeRematch(); return; }
    if (message.t === 'rematch-start' && r.role === 'guest') {
      r.seed = Number(message.seed || r.seed) >>> 0;
      r.category = CATEGORIES().includes(message.category) ? message.category : r.category;
      r.rematchLocal = r.rematchRemote = false;
      show('game');
      return;
    }
  }

  function initPlayerSession() {
    try { r.session?.close?.(); } catch (_) {}
    r.session = P().createSession({
      gameId: GAME_ID,
      prefix: PREFIX,
      timeoutMs: 90000,
      channelLabel: 'pinoy-feud',
      onMessage: playerMessage,
      onConnected: playerConnected,
      onRemoteName: name => { r.remoteName = cleanName(name, 'OPPONENT'); syncNames(); },
      onDisconnected: () => { if (r.open && ['game','lobby','result','audience-host'].includes(r.state)) showDisconnected('Opponent disconnected.'); },
      onState: state => {
        const target = r.role === 'host' ? '[data-host-status]' : '[data-guest-status]';
        if (state === 'timeout') status(target, 'Connection timed out. Try pairing again.', true);
      }
    });
  }

  async function createOffer() {
    try {
      r.role = 'host'; r.category = readCategory('[data-host-category]');
      r.localName = cleanName($('[data-host-name]')?.value, 'TEAM A');
      initPlayerSession();
      r.hostCode = await r.session.createOffer(r.localName); r.seed = r.session.seed;
      const src = r.bridge?.createQrDataUrl?.(r.hostCode, 360) || '';
      if (src) { $('[data-host-qr]').src = src; $('[data-host-qr-wrap]').hidden = false; }
      status('[data-host-status]', 'Host QR ready. Player 2 scans it, then return their response.', false, true); sfx('ui');
    } catch (error) { status('[data-host-status]', error?.message || 'Could not create Host QR.', true); }
  }

  async function createAnswer(code) {
    try {
      r.role = 'guest'; r.localName = cleanName($('[data-guest-name]')?.value, 'TEAM B');
      initPlayerSession();
      r.answerCode = await r.session.createAnswer(String(code || '').trim(), r.localName); r.seed = r.session.seed; r.remoteName = cleanName(r.session.remoteName, 'TEAM A');
      const src = r.bridge?.createQrDataUrl?.(r.answerCode, 360) || '';
      if (src) { $('[data-guest-qr]').src = src; $('[data-guest-qr-wrap]').hidden = false; }
      status('[data-guest-status]', 'Response ready. Host scans this QR.', false, true); sfx('ui');
    } catch (error) { status('[data-guest-status]', error?.message || 'Invalid Host QR.', true); }
  }

  async function applyAnswer(code) {
    try { await r.session.applyAnswer(String(code || '').trim()); status('[data-host-status]', 'Connecting directly…', false, true); }
    catch (error) { status('[data-host-status]', error?.message || 'Could not connect Player 2.', true); }
  }

  function playerConnected() {
    r.invites?.onConnected?.();
    r.remoteName = cleanName(r.session.remoteName, r.role === 'host' ? 'TEAM B' : 'TEAM A');
    r.seed = r.session.seed;
    r.localReady = r.remoteReady = false;
    syncNames();
    if (r.role === 'host') r.session.send({ t: 'config', category: r.category });
    show('lobby'); renderConfigSummary(); updateReady(); sfx('ui');
  }

  function renderConfigSummary() {
    const el = $('[data-config-summary]');
    if (!el) return;
    el.innerHTML = `<div><small>QUESTION PACK</small><strong>${escapeHtml(r.category === 'RANDOM' ? 'RANDOM MIX' : r.category)}</strong></div><div><small>ROUNDS</small><strong>3 + FAST MONEY</strong></div><p>Face-Off buzzer · typed answers · 3 strikes · steal · no XP.</p>`;
  }

  function syncNames() {
    const local = $('[data-local-name]'), remote = $('[data-remote-name]');
    if (local) local.textContent = r.localName;
    if (remote) remote.textContent = r.remoteName;
  }

  function ready() {
    if (!['host','guest'].includes(r.role)) return;
    r.localReady = true;
    if (r.role === 'guest') r.session?.send({ t: 'ready' });
    updateReady();
    maybeStartMultiplayer();
  }

  function updateReady() {
    $('[data-local-player]')?.classList.toggle('ready', r.localReady);
    $('[data-remote-player]')?.classList.toggle('ready', r.remoteReady);
    const btn = $('[data-ready]'); if (btn) { btn.disabled = r.localReady; btn.textContent = r.localReady ? 'READY ✓' : "I'M READY"; }
    const text = r.localReady && r.remoteReady ? 'Both ready. Starting…' : r.localReady ? 'You are ready. Waiting for opponent.' : r.remoteReady ? 'Opponent is ready. Press READY.' : 'Waiting for both players.';
    status('[data-lobby-status]', text, false, r.localReady && r.remoteReady);
  }

  function maybeStartMultiplayer() {
    if (r.role !== 'host' || !r.localReady || !r.remoteReady || r.game) return;
    beginNewMatch(r.seed, r.category);
  }

  function startSolo() {
    try { r.session?.close?.(); } catch (_) {}
    r.session = null;
    r.role = 'solo';
    r.botDifficulty = BOT_LEVELS[String($('[data-bot-level]')?.value || '')] ? String($('[data-bot-level]').value) : 'normal';
    r.category = readCategory('[data-solo-category]');
    const identity = r.bridge?.getPlayerIdentity?.();
    r.localName = cleanName($('[data-solo-name]')?.value || identity?.name, 'YOU');
    r.remoteName = `PINOY BOT · ${BOT_LEVELS[r.botDifficulty].label}`;
    r.seed = ((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
    beginNewMatch(r.seed, r.category);
  }

  function ensureStudentInvites() {
    if (r.invites || !P()?.createStudentInviteController) return;
    r.invites = P().createStudentInviteController({
      overlay: r.overlay,
      gameId: GAME_ID,
      gameName: 'PINOY FEUD',
      getBridge: () => r.bridge,
      getState: () => r.state,
      isConnected: () => !!r.session?.connected,
      getLocalName: () => r.localName,
      showHost: () => show('host'),
      showGuest: () => show('guest'),
      createHostOffer: async () => { await createOffer(); return r.hostCode; },
      createGuestAnswer: async offer => { await createAnswer(offer); return r.answerCode; },
      applyHostAnswer: async answer => { await applyAnswer(answer); },
      setGuestStatus: (text, err = false, ok = false) => status('[data-guest-status]', text, err, ok)
    });
  }

  async function createWatchOffer() {
    if (r.role !== 'host') { status('[data-watch-host-status]', 'Only Player 1 / Host can attach the audience display.', true); return; }
    try {
      try { r.audienceHostSession?.close?.(); } catch (_) {}
      r.audienceHostSession = P().createSession({
        gameId: WATCH_GAME_ID, prefix: WATCH_PREFIX, timeoutMs: 90000, channelLabel: 'pinoy-feud-watch',
        onMessage: () => {},
        onConnected: () => { r.audienceConnected = true; updateAudienceStatus(); status('[data-watch-host-status]', 'Audience display connected!', false, true); sendAudienceSnapshot(); setTimeout(() => show('lobby'), 700); },
        onDisconnected: () => { r.audienceConnected = false; updateAudienceStatus(); }
      });
      r.watchHostCode = await r.audienceHostSession.createOffer('PINOY FEUD HOST');
      const src = r.bridge?.createQrDataUrl?.(r.watchHostCode, 360) || '';
      if (src) { $('[data-watch-host-qr]').src = src; $('[data-watch-host-qr-wrap]').hidden = false; }
      status('[data-watch-host-status]', 'Watch QR ready. Audience scans it, then return the response QR.', false, true);
    } catch (error) { status('[data-watch-host-status]', error?.message || 'Could not create Watch QR.', true); }
  }

  async function createWatchAnswer(code) {
    try {
      r.role = 'watch';
      try { r.watchSession?.close?.(); } catch (_) {}
      r.watchSession = P().createSession({
        gameId: WATCH_GAME_ID, prefix: WATCH_PREFIX, timeoutMs: 90000, channelLabel: 'pinoy-feud-watch',
        onMessage: message => { if (message?.t === 'watch-state') receiveWatchState(message); },
        onConnected: () => { status('[data-watch-status]', 'Connected. This device is now Audience View.', false, true); showAudienceWaiting(); },
        onDisconnected: () => { status('[data-watch-status]', 'Audience link lost. Reconnect from the Host.', true); if (r.state === 'game') showDisconnected('Audience link lost.', true); }
      });
      r.watchAnswerCode = await r.watchSession.createAnswer(String(code || '').trim(), 'AUDIENCE DISPLAY');
      const src = r.bridge?.createQrDataUrl?.(r.watchAnswerCode, 360) || '';
      if (src) { $('[data-watch-guest-qr]').src = src; $('[data-watch-guest-qr-wrap]').hidden = false; }
      status('[data-watch-status]', 'Response ready. Host scans this QR.', false, true);
    } catch (error) { status('[data-watch-status]', error?.message || 'Invalid Watch QR.', true); }
  }

  async function applyWatchAnswer(code) {
    try { await r.audienceHostSession.applyAnswer(String(code || '').trim()); status('[data-watch-host-status]', 'Connecting audience display…', false, true); }
    catch (error) { status('[data-watch-host-status]', error?.message || 'Could not connect audience display.', true); }
  }

  function sendAudienceSnapshot() {
    if (!r.audienceHostSession?.connected) return;
    r.audienceHostSession.send({ t: 'watch-state', state: publicState(), names: { h: r.localHostName(), g: r.localGuestName() } });
  }

  function receiveWatchState(message) {
    r.lastWatchState = message;
    if (message.names) { r.localName = cleanName(message.names.h, 'TEAM A'); r.remoteName = cleanName(message.names.g, 'TEAM B'); }
    if (!message.state) { showAudienceWaiting(); return; }
    r.game = message.state;
    if (r.game.phase === 'complete') { showResult(true); return; }
    show('game'); renderGame(true);
  }

  function showAudienceWaiting() {
    show('game');
    r.game = null;
    const root = $('[data-game-root]'); root?.classList.add('audience-mode');
    $('[data-audience-badge]').hidden = false;
    $('[data-controls]').hidden = true;
    $('[data-question]').textContent = 'Waiting for the Host to start the match…';
    $('[data-category-label]').textContent = 'AUDIENCE VIEW';
    $('[data-board]').innerHTML = Array.from({ length: 6 }, (_, i) => `<div class="feud-answer-tile hidden-answer"><span>${i + 1}</span><strong>••••••••••</strong><b>—</b></div>`).join('');
    $('[data-feedback]').textContent = 'Live board only — no controls on this screen.';
  }

  function updateAudienceStatus() {
    const el = $('[data-audience-status]');
    if (!el) return;
    el.textContent = r.audienceConnected ? 'Connected ✓' : 'Not connected';
    el.classList.toggle('connected', r.audienceConnected);
  }

  async function scan(kind) {
    closeScanner();
    const scanner = $('[data-scanner]'), video = $('[data-scan-video]');
    scanner.hidden = false;
    const isWatchKind = kind.startsWith('watch-');
    $('[data-scan-title]').textContent = kind.includes('answer') ? 'SCAN RESPONSE QR' : 'SCAN HOST QR';
    try {
      r.scannerStop = await P().openScanner({
        video,
        acceptPrefix: `${isWatchKind ? WATCH_PREFIX : PREFIX}.`,
        onCode: async code => {
          scanner.hidden = true; r.scannerStop = null;
          if (kind === 'player-offer') { show('guest'); $('[data-offer-input]').value = code; await createAnswer(code); }
          else if (kind === 'player-answer') { $('[data-answer-input]').value = code; await applyAnswer(code); }
          else if (kind === 'watch-offer') { show('watch'); $('[data-watch-offer-input]').value = code; await createWatchAnswer(code); }
          else if (kind === 'watch-answer') { $('[data-watch-answer-input]').value = code; await applyWatchAnswer(code); }
        }
      });
      $('[data-scan-status]').textContent = 'Point the camera at the QR code on the other device.';
    } catch (error) { $('[data-scan-status]').textContent = error?.message || 'QR scanner unavailable. Use Copy / Paste fallback.'; }
  }

  function closeScanner() {
    try { r.scannerStop?.(); } catch (_) {}
    r.scannerStop = null;
    const el = $('[data-scanner]'); if (el) el.hidden = true;
  }

  async function copyCode(text, selector, okText) {
    const ok = await P()?.copyText?.(text);
    status(selector, ok ? okText : 'Copy failed.', !ok, ok);
  }

  function cancelPlayerPairing() {
    closeScanner();
    try { r.invites?.cancelHostInvite?.(); } catch (_) {}
    try { r.session?.close?.(); } catch (_) {}
    r.session = null; r.role = ''; r.hostCode = r.answerCode = '';
    show('multi');
  }

  function cancelWatch() {
    closeScanner();
    try { r.watchSession?.close?.(); } catch (_) {}
    r.watchSession = null; r.role = ''; r.watchAnswerCode = '';
    show('home');
  }

  function livePendingScore(side) {
    if (!r.game || !side || r.game.phase.startsWith('fast')) return '';
    if (r.game.phase === 'faceoff-answer') {
      const firstSide = r.game.faceoff?.firstSide || '';
      const secondSide = r.game.faceoff?.secondSide || '';
      if (side === firstSide && Number(r.game.faceoff?.firstPoints || 0) > 0) return `FACE-OFF +${Number(r.game.faceoff.firstPoints)}`;
      if (side === secondSide && Number(r.game.faceoff?.secondPoints || 0) > 0) return `FACE-OFF +${Number(r.game.faceoff.secondPoints)}`;
      return '';
    }
    const bank = boardPoints();
    if (bank <= 0) return '';
    if (r.game.phase === 'control') {
      return side === r.game.controller ? `+${bank} IN BANK` : '';
    }
    if (r.game.phase === 'steal') {
      if (side === r.game.controller) return `${bank} AT RISK`;
      if (side === other(r.game.controller)) return `STEAL +${bank}`;
    }
    return '';
  }

  function renderGame(forceAudience = false) {
    if (!r.game) return;
    const audience = forceAudience || isWatch();
    const root = $('[data-game-root]');
    root?.classList.toggle('audience-mode', audience);
    r.overlay?.classList.toggle('feud-audience-live', audience);
    $('[data-audience-badge]').hidden = !audience;
    $('[data-controls]').hidden = audience;

    const q = r.game.phase.startsWith('fast') ? currentFastQuestion() : currentQuestion();
    const hName = r.role === 'guest' ? r.remoteName : r.localName;
    const gName = r.role === 'guest' ? r.localName : r.remoteName;
    $('[data-team-h-name]').textContent = hName || 'TEAM A';
    $('[data-team-g-name]').textContent = gName || 'TEAM B';
    $('[data-score-h]').textContent = Number(r.game.scores?.h || 0).toLocaleString();
    $('[data-score-g]').textContent = Number(r.game.scores?.g || 0).toLocaleString();
    $('[data-pending-h]').textContent = livePendingScore('h');
    $('[data-pending-g]').textContent = livePendingScore('g');

    const roundText = r.game.phase.startsWith('fast') ? 'FAST MONEY' : r.game.tieBreaker ? 'TIE-BREAKER' : `ROUND ${Math.min(MAIN_ROUNDS, r.game.roundIndex + 1)} · ×${currentMultiplier()}`;
    $('[data-round-label]').textContent = roundText;
    $('[data-phase-label]').textContent = phaseLabel();
    $('[data-category-label]').textContent = q?.category || (r.game.category === 'RANDOM' ? 'RANDOM MIX' : r.game.category);
    $('[data-question]').textContent = q?.prompt || (r.game.phase === 'fast-intro' ? 'Fast Money is ready.' : 'Preparing question…');
    $('[data-feedback]').textContent = r.game.feedback || '';
    $('[data-round-bank]').textContent = r.game.phase.startsWith('fast') ? `${Number(r.game.fast?.total || 0)} / ${FAST_MONEY_TARGET}` : boardPoints().toLocaleString();

    const board = $('[data-board]');
    if (r.game.phase.startsWith('fast')) {
      const rows = r.game.fast?.answers || [];
      board.innerHTML = Array.from({ length: 5 }, (_, i) => {
        const item = rows[i];
        return `<div class="feud-answer-tile ${item ? 'revealed-answer' : 'hidden-answer'}"><span>${i + 1}</span><strong>${item ? escapeHtml(item.answer) : '••••••••••'}</strong><b>${item ? Number(item.points || 0) : '—'}</b></div>`;
      }).join('');
    } else {
      const answers = q?.answers || [];
      board.innerHTML = answers.map((answer, index) => {
        const shown = r.game.revealed.includes(index);
        return `<div class="feud-answer-tile ${shown ? 'revealed-answer' : 'hidden-answer'}"><span>${index + 1}</span><strong>${shown ? escapeHtml(answer.text) : '••••••••••'}</strong><b>${shown ? Number(answer.points || 0) : '—'}</b></div>`;
      }).join('');
    }

    const strikes = $$('[data-strikes] span');
    strikes.forEach((el, index) => el.classList.toggle('active', index < Number(r.game.strikes || 0)));
    updateTurnHighlights();
    renderTurnBanner(audience);
    renderControls();
    runShowMoments(audience);
    restartUiTimerIfNeeded();
  }

  function phaseLabel() {
    if (!r.game) return 'WAITING';
    const phase = r.game.phase;
    if (phase === 'faceoff-buzz') return 'FACE-OFF · BUZZ!';
    if (phase === 'faceoff-answer') return 'FACE-OFF ANSWER';
    if (phase === 'control') return 'CONTROL ROUND';
    if (phase === 'steal') return 'STEAL CHANCE';
    if (phase === 'round-result') return 'ROUND COMPLETE';
    if (phase === 'fast-intro') return 'FAST MONEY READY';
    if (phase === 'fast-money') return `FAST MONEY · ${Math.min(5, (r.game.fast?.index || 0) + 1)}/5`;
    return 'PINOY FEUD';
  }

  function updateTurnHighlights() {
    if (!r.game) return;
    const activeSide = r.game.phase === 'faceoff-buzz' ? '' : expectedAnswerSide();
    const local = localSide();
    const hCard = $('[data-team-h]');
    const gCard = $('[data-team-g]');
    const labelFor = side => {
      if (!activeSide || side !== activeSide) return '';
      if (local && side === local) return 'YOUR TURN';
      if (isSolo() && side === 'g') return 'BOT TURN';
      return 'OPPONENT TURN';
    };
    if (hCard) {
      hCard.classList.toggle('active-turn', activeSide === 'h');
      hCard.classList.toggle('winner-round', r.game.roundWinner === 'h' && r.game.phase === 'round-result');
      hCard.dataset.turnLabel = labelFor('h');
    }
    if (gCard) {
      gCard.classList.toggle('active-turn', activeSide === 'g');
      gCard.classList.toggle('winner-round', r.game.roundWinner === 'g' && r.game.phase === 'round-result');
      gCard.dataset.turnLabel = labelFor('g');
    }
  }


  function renderTurnBanner(audience = false) {
    if (!r.game) return;
    const banner = $('[data-turn-banner]');
    const kicker = $('[data-turn-kicker]');
    const main = $('[data-turn-main]');
    const sub = $('[data-turn-sub]');
    const root = $('[data-game-root]');
    if (!banner || !kicker || !main || !sub || !root) return;

    banner.className = 'feud-turn-banner';
    let mode = 'waiting';
    let kickerText = 'GET READY';
    let mainText = 'Watch the board.';
    let subText = 'Stay alert for the next action.';

    const phase = r.game.phase;
    const expected = expectedAnswerSide();
    const local = localSide();

    if (audience) {
      mode = 'audience';
      if (phase === 'faceoff-buzz') {
        kickerText = 'LIVE FACE-OFF';
        mainText = 'Waiting for the first buzz!';
        subText = 'Audience mode only — board will update live.';
      } else if (phase === 'fast-intro') {
        kickerText = 'FAST MONEY';
        mainText = `${sideName(r.game.fast.side)} is getting ready.`;
        subText = 'Fast Money begins once the player starts.';
      } else if (phase === 'fast-money' && expected) {
        kickerText = 'LIVE ANSWER';
        mainText = `${sideName(expected)} is answering now.`;
        subText = 'Watch the live board update.';
      } else if (phase === 'round-result') {
        kickerText = 'ROUND COMPLETE';
        mainText = `${sideName(r.game.roundWinner || 'h')} wins this round.`;
        subText = 'Scores have been updated.';
      } else if (phase === 'complete') {
        kickerText = 'GAME COMPLETE';
        mainText = `${sideName(r.game.winner || 'h')} wins the match!`;
        subText = 'Audience screen complete.';
      } else if (expected) {
        kickerText = 'LIVE TURN';
        mainText = `${sideName(expected)} is answering.`;
        subText = 'Wait for the next reveal.';
      }
    } else if (phase === 'faceoff-buzz') {
      mode = 'buzz';
      kickerText = 'BUZZER OPEN';
      mainText = isSolo() ? 'Tap BUZZ now — unahan mo ang bot!' : 'Tap BUZZ now — paunahan kayo!';
      subText = 'First buzz gets the first answer chance.';
    } else if (phase === 'fast-intro') {
      if (local === r.game.fast.side) {
        mode = 'self';
        kickerText = 'YOUR TURN';
        mainText = 'Ikaw ang magfa-Fast Money.';
        subText = 'Press START FAST MONEY when ready.';
      } else {
        mode = 'other';
        kickerText = 'WAIT';
        mainText = `${sideName(r.game.fast.side)} will play Fast Money.`;
        subText = 'Ready your eyes on the board.';
      }
    } else if (phase === 'round-result') {
      mode = 'result';
      kickerText = 'ROUND COMPLETE';
      mainText = `${sideName(r.game.roundWinner || 'h')} wins the round!`;
      subText = 'Prepare for the next round.';
    } else if (phase === 'complete') {
      mode = 'result';
      kickerText = 'GAME COMPLETE';
      mainText = `${sideName(r.game.winner || 'h')} wins the match!`;
      subText = 'You may rematch or exit the game.';
    } else if (isSolo() && expected === 'g') {
      mode = 'bot';
      kickerText = 'BOT TURN';
      if (phase === 'steal') {
        mainText = 'Pinoy Bot is trying to steal the round.';
        subText = 'Hintayin ang sagot ng bot.';
      } else if (phase === 'fast-money') {
        mainText = 'Pinoy Bot is answering Fast Money.';
        subText = 'Automatic ang sagot ng bot.';
      } else {
        mainText = 'Pinoy Bot is answering now…';
        subText = 'Hindi mo pa turn — wait for the bot.';
      }
    } else if (expected && local && local === expected) {
      mode = 'self';
      kickerText = 'YOUR TURN';
      if (phase === 'steal') {
        mainText = 'Ikaw na! One answer lang for the steal.';
        subText = 'Make it count before the timer ends.';
      } else if (phase === 'fast-money') {
        mainText = 'Ikaw ang sasagot sa Fast Money.';
        subText = 'Type one answer fast, then next agad.';
      } else {
        mainText = 'Ikaw na ang sasagot!';
        subText = 'Type your best answer before time runs out.';
      }
    } else if (expected) {
      mode = 'other';
      kickerText = 'WAIT';
      if (phase === 'steal') {
        mainText = `${sideName(expected)} is attempting the steal.`;
        subText = 'Watch closely — one answer only.';
      } else if (phase === 'fast-money') {
        mainText = `${sideName(expected)} is answering Fast Money.`;
        subText = 'Stand by for the next question.';
      } else {
        mainText = `${sideName(expected)} is answering now.`;
        subText = 'Hintayin mo ang turn mo.';
      }
    }

    banner.classList.add(mode);
    root.dataset.turn = mode;
    kicker.textContent = kickerText;
    main.textContent = mainText;
    sub.textContent = subText;
  }

  function renderControls() {
    const controls = $('[data-controls]');
    if (!controls || isWatch()) return;
    controls.hidden = false;
    const buzz = $('[data-buzz]'), form = $('[data-answer-form]'), fast = $('[data-fast-start]'), note = $('[data-control-note]');
    buzz.hidden = true; form.hidden = true; fast.hidden = true;
    const side = localSide();
    if (r.game.phase === 'faceoff-buzz') {
      buzz.hidden = false; buzz.disabled = !side;
      note.textContent = isSolo() ? 'Unahan mo ang bot sa buzzer.' : 'Parehong player puwedeng mag-buzz.';
      return;
    }
    if (r.game.phase === 'fast-intro') {
      if (side === r.game.fast.side) { fast.hidden = false; note.textContent = 'Ikaw ang winner. Start when ready.'; }
      else note.textContent = `${sideName(r.game.fast.side)} will play Fast Money.`;
      return;
    }
    const expected = expectedAnswerSide();
    if (side && side === expected) {
      form.hidden = false;
      note.textContent = r.game.phase === 'steal' ? 'One answer only — steal the round!' : r.game.phase === 'fast-money' ? 'Type one answer, then next question agad.' : 'Type your answer. Filipino or accepted English equivalent is okay.';
      setTimeout(() => { try { $('[data-answer-input-game]')?.focus({ preventScroll: true }); } catch (_) {} }, 40);
    } else {
      note.textContent = expected
        ? (isSolo() && expected === 'g' ? 'BOT TURN — Pinoy Bot is thinking…' : `${sideName(expected)} is answering…`)
        : 'Watch the board.';
    }
  }

  function restartUiTimerIfNeeded() {
    if (!r.game) return;
    if (r.uiTimerToken !== r.game.seq) {
      r.uiTimerToken = r.game.seq;
      r.uiTimerStartedAt = performance.now();
      r.uiTimerDuration = Math.max(0, Number(r.game.timerMs || 0));
    }
    if (!r.uiTimer) r.uiTimer = requestAnimationFrame(uiTimerLoop);
  }

  function uiTimerLoop(now) {
    r.uiTimer = 0;
    if (!r.open || !r.game || !['game'].includes(r.state)) return;
    const timer = $('[data-timer]'), bar = $('[data-timer-bar]');
    let remaining = 0;
    if (r.uiTimerDuration > 0) remaining = Math.max(0, r.uiTimerDuration - (now - r.uiTimerStartedAt));
    if (timer) timer.textContent = r.uiTimerDuration > 0 ? `${Math.ceil(remaining / 1000)}s` : '—';
    if (bar) bar.style.width = r.uiTimerDuration > 0 ? `${clamp(remaining / r.uiTimerDuration * 100, 0, 100)}%` : '0%';
    if (remaining > 0 && remaining < 4200 && Math.floor(remaining / 1000) !== Math.floor((remaining + 80) / 1000)) sfx('tick');
    r.uiTimer = requestAnimationFrame(uiTimerLoop);
  }

  function showResult(fromWatch = false) {
    if (!r.game) return;
    show('result');
    const hName = r.role === 'guest' ? r.remoteName : r.localName;
    const gName = r.role === 'guest' ? r.localName : r.remoteName;
    const winner = r.game.winner || (r.game.scores.h >= r.game.scores.g ? 'h' : 'g');
    const winnerName = winner === 'h' ? hName : gName;
    $('[data-result-title]').textContent = `${winnerName} WINS!`;
    $('[data-result-sub]').textContent = r.game.fast?.done ? (r.game.fast.success ? `Fast Money cleared with ${r.game.fast.total} points!` : `Fast Money: ${r.game.fast.total}/${FAST_MONEY_TARGET} points.`) : 'Main game complete.';
    $('[data-result-h-name]').textContent = hName || 'TEAM A';
    $('[data-result-g-name]').textContent = gName || 'TEAM B';
    $('[data-result-h-score]').textContent = Number(r.game.scores.h || 0).toLocaleString();
    $('[data-result-g-score]').textContent = Number(r.game.scores.g || 0).toLocaleString();
    $('[data-result-fast]').textContent = r.game.fast?.done ? `${r.game.fast.total}/${FAST_MONEY_TARGET}` : '—';
    $('[data-rematch]').hidden = fromWatch || isWatch();
    $('[data-result-status]').textContent = fromWatch || isWatch() ? 'Audience view complete.' : isSolo() ? 'Play again anytime.' : 'Both players press REMATCH to play again.';
  }

  function rematchReady() {
    if (isSolo()) { r.seed = ((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0; beginNewMatch(r.seed, r.category); return; }
    if (!['host','guest'].includes(r.role)) return;
    r.rematchLocal = true;
    $('[data-rematch]').disabled = true;
    status('[data-result-status]', 'Rematch ready. Waiting for opponent…');
    if (r.role === 'guest') r.session?.send({ t: 'rematch' });
    maybeRematch();
  }

  function maybeRematch() {
    if (r.role !== 'host' || !r.rematchLocal || !r.rematchRemote) return;
    r.seed = ((Date.now() & 0xffffffff) ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
    r.session?.send({ t: 'rematch-start', seed: r.seed, category: r.category });
    r.game = null;
    beginNewMatch(r.seed, r.category);
  }

  function showDisconnected(text, audienceOnly = false) {
    const pause = $('[data-pause]'); if (!pause) return;
    pause.hidden = false;
    $('[data-pause-title]').textContent = audienceOnly ? 'AUDIENCE DISCONNECTED' : 'MATCH CONNECTION LOST';
    $('[data-pause-text]').textContent = text || 'Connection lost.';
    $('[data-resume]').hidden = true;
    $('[data-disconnect-actions]').hidden = audienceOnly;
    $('[data-continue-bot]').hidden = audienceOnly || r.role !== 'host';
  }

  function continueVsBot() {
    if (r.role !== 'host' || !r.game) return;
    try { r.session?.close?.(); } catch (_) {}
    r.session = null;
    r.role = 'solo';
    r.remoteName = 'PINOY BOT · NORMAL';
    r.botDifficulty = 'normal';
    $('[data-pause]').hidden = true;
    r.game.seq += 1;
    syncGame(); renderGame(); maybeScheduleBot();
  }

  function pauseLocal(text = 'Game paused safely.') {
    if (!r.open || !r.game || r.state !== 'game') return false;
    r.paused = true;
    const pause = $('[data-pause]'); if (pause) pause.hidden = false;
    $('[data-pause-title]').textContent = 'GAME PAUSED';
    $('[data-pause-text]').textContent = text;
    $('[data-resume]').hidden = false;
    $('[data-disconnect-actions]').hidden = true;
    $('[data-continue-bot]').hidden = true;
    return true;
  }

  function resumeLocal() { r.paused = false; const pause = $('[data-pause]'); if (pause) pause.hidden = true; return true; }
  function exitDisconnectedMatch() { const pause = $('[data-pause]'); if (pause) pause.hidden = true; resetGameState(); show('home'); }
  function closeDisconnectedGame() { const pause = $('[data-pause]'); if (pause) pause.hidden = true; close(true); }

  function clearAuthorityTimers() {
    clearTimeout(r.authorityTimer); clearTimeout(r.botTimer);
    r.authorityTimer = r.botTimer = 0;
  }

  function resetGameState() {
    clearAuthorityTimers();
    if (r.uiTimer) cancelAnimationFrame(r.uiTimer);
    r.uiTimer = 0; r.uiTimerToken = -1;
    r.game = null; r.fastEndsAt = 0; r.rematchLocal = r.rematchRemote = false;
    r.localReady = r.remoteReady = false;
  }

  function resetAll() {
    closeScanner(); clearAuthorityTimers(); resetGameState();
    try { r.session?.close?.(); } catch (_) {}
    try { r.audienceHostSession?.close?.(); } catch (_) {}
    try { r.watchSession?.close?.(); } catch (_) {}
    r.session = r.audienceHostSession = r.watchSession = null;
    r.audienceConnected = false; r.hostCode = r.answerCode = r.watchHostCode = r.watchAnswerCode = '';
    r.role = ''; r.state = 'home'; r.lastWatchState = null; r.paused = false;
    const pause = $('[data-pause]'); if (pause) pause.hidden = true;
    updateAudienceStatus();
    show('home');
  }

  function toggleSound() {
    const current = r.bridge?.getSnapshot?.()?.soundEnabled !== false;
    try { r.bridge?.setSoundEnabled?.(!current); } catch (_) {}
    $('[data-sound]').textContent = current ? '🔇' : '🔊';
    if (current) r.music?.pause?.(); else r.music?.resume?.();
    if (!current) sfx('ui');
  }

  function returnHub() { const cb = r.onBack; close(false); cb?.(); }

  function close(callClose = true) {
    if (!r.open) return;
    try { r.invites?.stop?.({ cleanup: true }); } catch (_) {}
    resetAll();
    r.open = false;
    r.overlay.hidden = true;
    document.body.classList.remove('p2p0-active');
    if (callClose) r.onClose?.();
  }

  function open(options = {}) {
    build();
    r.bridge = options.bridge || null;
    r.music = options.music || null;
    r.onBack = options.onBack || null;
    r.onClose = options.onClose || null;
    r.open = true;
    r.overlay.hidden = false;
    document.body.classList.add('p2p0-active');
    resetAll();
    ensureStudentInvites();
    r.invites?.start?.();
    const identity = r.bridge?.getPlayerIdentity?.();
    if (identity?.name) {
      if ($('[data-solo-name]')) $('[data-solo-name]').value = identity.name;
      if ($('[data-host-name]')) $('[data-host-name]').value = identity.name;
      if ($('[data-guest-name]')) $('[data-guest-name]').value = identity.name;
    }
    $('[data-sound]').textContent = r.bridge?.getSnapshot?.()?.soundEnabled === false ? '🔇' : '🔊';
    renderBotHelp();
  }

  window[GLOBAL_NAME] = Object.freeze({
    open,
    close: () => close(true),
    isOpen: () => r.open,
    pauseForExitGuard: () => pauseLocal('Game paused safely.'),
    resumeFromExitGuard: resumeLocal
  });
})();
