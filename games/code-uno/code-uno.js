(() => {
  'use strict';

  if (window.ICT8CodeUno) return;

  const GAME_ID = 'code-uno';
  const GLOBAL_NAME = 'ICT8CodeUno';
  const PREFIX = 'UNO1';
  const ROOM_QR_PREFIX = 'ICT8UNO:';
  const HOST_JOIN_POLL_MS = 1500;
  const HOST_ANSWER_POLL_MS = 700;
  const GUEST_OFFER_POLL_MS = 900;
  const ROOM_TOUCH_MS = 90000;
  const RECONNECT_GRACE_MS = 30000;
  const INVITE_IDLE_MS = 5000;
  const INVITE_ACTIVE_MS = 2500;
  const COLORS = Object.freeze(['red', 'yellow', 'green', 'blue']);
  const COLOR_META = Object.freeze({
    red: { label: 'RED', icon: '●' },
    yellow: { label: 'YELLOW', icon: '●' },
    green: { label: 'GREEN', icon: '●' },
    blue: { label: 'BLUE', icon: '●' }
  });

  const E = () => window.ICT8UnoEngine;
  const P = () => window.ICT8ZeroDbP2P;

  const r = {
    open: false,
    closing: false,
    overlay: null,
    bridge: null,
    music: null,
    onBack: null,
    onClose: null,
    state: 'home',
    role: '',
    localSeat: 0,
    maxPlayers: 6,
    mode: 'quick',
    targetScore: 500,
    botCount: 3,
    botLevel: 'normal',
    players: [],
    peers: new Map(),
    seatByUid: new Map(),
    guestSession: null,
    roomCode: '',
    roomMeta: null,
    game: null,
    guestPublic: null,
    guestPrivate: null,
    signalTimer: 0,
    roomTouchTimer: 0,
    inviteTimer: 0,
    botTimer: 0,
    reconnectTimer: 0,
    disconnectTimers: new Map(),
    reconnecting: false,
    pendingInvites: [],
    scannerStop: null,
    busyAction: false,
    lastRenderedRevision: -1,
    lastTopCardId: '',
    lastEventSeq: 0,
    lastPublic: null,
    soundEnabled: true,
    audioCtx: null,
    toastTimer: 0,
    transitionSerial: 0,
    handSort: (()=>{try{return localStorage.getItem('ict8UnoHandSort')||'color';}catch(_){return 'color';}})(),
    discardHistory: [],
    turnVisualTimer: 0,
    houseRules: { stackDraw2:false, drawUntilPlayable:false, sevenZero:false },
    lastCelebratedResultKey: '',
    voiceRoomEnabled: false
  };

  // UNO v8 duplex voice call: separate WebRTC audio plane signaled over the already-open
  // game DataChannel. No microphone audio or voice SDP is written to Firebase.
  const voice = {
    ctx: null,
    silentOsc: null,
    silentTrack: null,
    localStream: null,
    micTrack: null,
    micOn: false,
    speakerOn: true,
    hostMuteAll: false,
    hostPeers: new Map(),
    hostAudioByUid: new Map(),
    guestPeer: null,
    remoteAudio: null,
    monitorGain: null,
    hostMicSource: null,
    hostMicGain: null,
    analyser: null,
    analyserData: null,
    meterTimer: 0,
    lastLocalSpeaking: false,
    speakingBySeat: new Map(),
    micBySeat: new Map(),
    playbackBlocked: false
  };

  const $ = sel => r.overlay?.querySelector(sel) || null;
  const $$ = sel => Array.from(r.overlay?.querySelectorAll(sel) || []);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const identity = () => r.bridge?.getPlayerIdentity?.() || { loggedIn:false, uid:'', studentId:'', name:'PLAYER', section:'' };
  const isHost = () => r.role === 'host';
  const isSolo = () => r.role === 'solo';
  const isGuest = () => r.role === 'guest';
  // Resolve the local lobby record by authenticated UID first. Seat numbers can
  // change while the Host compacts/reassigns the lobby, so using only localSeat
  // can make a freshly joined guest appear to have no clickable READY control.
  const localLobbyPlayer = () => {
    const uid = String(identity().uid || '');
    return (uid && r.players.find(player => String(player.uid || '') === uid))
      || r.players.find(player => player.seat === r.localSeat)
      || null;
  };
  const lobbyPlayerAt = seat => r.players.find(player => player.seat === Number(seat)) || null;

  function randomRoomCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(6);
    try { crypto.getRandomValues(bytes); } catch (_) { for (let i=0;i<6;i++) bytes[i]=Math.floor(Math.random()*256); }
    return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('');
  }

  function createLobbyPlayer(seat, name, options = {}) {
    return {
      seat,
      uid: String(options.uid || `seat-${seat}`),
      studentId: String(options.studentId || ''),
      name: String(name || `PLAYER ${seat + 1}`).trim().slice(0, 24) || `PLAYER ${seat + 1}`,
      ready: options.ready === true,
      connected: options.connected !== false,
      bot: options.bot === true,
      botLevel: options.botLevel || r.botLevel
    };
  }


  function normalizeHouseRules(value={}) {
    const source=value&&typeof value==='object'?value:{};
    return {stackDraw2:source.stackDraw2===true,drawUntilPlayable:source.drawUntilPlayable===true,sevenZero:source.sevenZero===true};
  }

  function readHouseRules(prefix='solo') {
    return normalizeHouseRules({
      stackDraw2:$(`[data-${prefix}-rule-stack2]`)?.checked===true,
      drawUntilPlayable:$(`[data-${prefix}-rule-draw-until]`)?.checked===true,
      sevenZero:$(`[data-${prefix}-rule-seven-zero]`)?.checked===true
    });
  }

  function houseRuleItems(rules=r.houseRules) {
    const clean=normalizeHouseRules(rules),items=[];
    if(clean.stackDraw2)items.push('STACK +2');
    if(clean.drawUntilPlayable)items.push('DRAW UNTIL PLAYABLE');
    if(clean.sevenZero)items.push('7–0');
    return items;
  }

  function houseRuleLabel(rules=r.houseRules) {
    const items=houseRuleItems(rules);
    return items.length?`HOUSE · ${items.join(' · ')}`:'CLASSIC RULES';
  }

  function formatDuration(ms=0){const total=Math.max(0,Math.round(Number(ms||0)/1000));const m=Math.floor(total/60),sec=total%60;return m?`${m}m ${String(sec).padStart(2,'0')}s`:`${sec}s`;}

  function build() {
    if (r.overlay) return;
    const o = document.createElement('div');
    o.className = 'uno-overlay';
    o.hidden = true;
    o.innerHTML = `
      <section class="uno-shell" role="dialog" aria-modal="true" aria-label="UNO game">
        <header class="uno-head">
          <button class="uno-icon-btn" type="button" data-back aria-label="Back">←</button>
          <div class="uno-brand"><span class="uno-brand-mark">4C</span><div><strong>UNO!</strong><small>COLOR CARD ARENA · 0 XP</small></div></div>
          <div class="uno-head-actions">
            <span class="uno-zero-xp">0 XP</span>
            <button class="uno-icon-btn" type="button" data-sound aria-label="Toggle game sound">🔊</button>
            <button class="uno-icon-btn uno-voice-head" type="button" data-voice-mic hidden aria-label="Toggle microphone" title="Microphone">🎙️</button>
            <button class="uno-icon-btn uno-voice-head" type="button" data-voice-speaker hidden aria-label="Toggle voice speaker" title="Voice speaker">🎧</button>
            <button class="uno-icon-btn close" type="button" data-close aria-label="Close">×</button>
          </div>
        </header>

        <main class="uno-stage">
          <section class="uno-panel home" data-panel="home">
            <div class="uno-hero">
              <div class="uno-hero-cards" aria-hidden="true">
                <div class="uno-mini-card red">7</div><div class="uno-mini-card yellow">↺</div><div class="uno-mini-card green">+2</div><div class="uno-mini-card blue">3</div><div class="uno-mini-card wild">W</div>
              </div>
              <div class="uno-kicker">CLASSIC 108-CARD RULESET</div>
              <h1>Match color. Match symbol. Empty your hand.</h1>
              <p>Solo against up to 9 bots, or host a private live room for 2–10 students. No XP. Pure card strategy.</p>
            </div>
            <div class="uno-mode-grid">
              <button class="uno-mode-card solo" type="button" data-go="solo">
                <span class="uno-mode-icon">🤖</span><strong>SOLO</strong><small>You vs 1–9 fair bots</small><b>PLAY SOLO</b>
              </button>
              <button class="uno-mode-card live" type="button" data-go="host">
                <span class="uno-mode-icon">👥</span><strong>HOST LIVE</strong><small>Create a 2–10 player room</small><b>CREATE ROOM</b>
              </button>
              <button class="uno-mode-card join" type="button" data-go="join">
                <span class="uno-mode-icon">🔗</span><strong>JOIN LIVE</strong><small>Room code, QR, or invite</small><b>JOIN ROOM</b>
              </button>
            </div>
            <div class="uno-rule-strip">
              <span>7 cards each</span><span>No stacking</span><span>+4 challenge</span><span>UNO catch = +2</span><span>Quick / 500 pts</span>
            </div>
          </section>

          <section class="uno-panel setup" data-panel="solo" hidden>
            <div class="uno-setup-card">
              <div class="uno-section-title"><span>🤖</span><div><h2>SOLO MATCH</h2><p>Build a table of smart bots. They only use information a real player could know.</p></div></div>
              <div class="uno-form-grid">
                <label><span>YOUR NAME</span><input data-solo-name maxlength="24" autocomplete="off" value="PLAYER"></label>
                <label><span>BOT OPPONENTS</span><select data-bot-count>${Array.from({length:9},(_,i)=>`<option value="${i+1}" ${i===2?'selected':''}>${i+1} BOT${i?'S':''}</option>`).join('')}</select></label>
                <label><span>BOT DIFFICULTY</span><select data-bot-level><option value="easy">Easy</option><option value="normal" selected>Normal</option><option value="hard">Hard</option></select></label>
                <label><span>MATCH MODE</span><select data-solo-mode><option value="quick">Quick Round · first out wins</option><option value="classic">Classic 500 · multi-round scoring</option></select></label>
              </div>
              <fieldset class="uno-house-rules"><legend>OPTIONAL HOUSE RULES</legend><div class="uno-house-grid">
                <label><input type="checkbox" data-solo-rule-stack2><span><b>STACK +2</b><small>Answer a +2 with another +2. The penalty grows by 2.</small></span></label>
                <label><input type="checkbox" data-solo-rule-draw-until><span><b>DRAW UNTIL PLAYABLE</b><small>Keep drawing until the first playable card appears.</small></span></label>
                <label><input type="checkbox" data-solo-rule-seven-zero><span><b>7–0</b><small>7 swaps hands with one player. 0 rotates every hand.</small></span></label>
              </div></fieldset>
              <div class="uno-setup-note">Hard bots plan colors and action cards but never inspect hidden opponent hands. House rules are OFF by default.</div>
              <div class="uno-actions"><button class="uno-btn ghost" type="button" data-go="home">BACK</button><button class="uno-btn primary" type="button" data-start-solo>START MATCH</button></div>
            </div>
          </section>

          <section class="uno-panel setup" data-panel="host" hidden>
            <div class="uno-setup-card">
              <div class="uno-section-title"><span>👥</span><div><h2>HOST LIVE ROOM</h2><p>Create a private room, invite up to 9 players, and start when everyone is ready.</p></div></div>
              <div class="uno-form-grid">
                <label><span>HOST NAME</span><input data-host-name maxlength="24" autocomplete="off" value="HOST"></label>
                <label><span>ROOM CAPACITY</span><select data-host-capacity>${Array.from({length:9},(_,i)=>`<option value="${i+2}" ${i===4?'selected':''}>UP TO ${i+2} PLAYERS</option>`).join('')}</select></label>
                <label><span>MATCH MODE</span><select data-host-mode><option value="quick">Quick Round</option><option value="classic">Classic 500</option></select></label>
              </div>
              <label class="uno-voice-setting"><input type="checkbox" data-host-voice checked><span class="uno-voice-setting-icon">🎙️</span><span><b>VOICE CALL</b><small>Live group voice for 2–10 players. Mic starts muted. Audio is peer-to-peer and is not recorded.</small></span></label>
              <fieldset class="uno-house-rules"><legend>OPTIONAL HOUSE RULES</legend><div class="uno-house-grid">
                <label><input type="checkbox" data-host-rule-stack2><span><b>STACK +2</b><small>+2 can be answered only by another +2.</small></span></label>
                <label><input type="checkbox" data-host-rule-draw-until><span><b>DRAW UNTIL PLAYABLE</b><small>Draw until the first playable card appears.</small></span></label>
                <label><input type="checkbox" data-host-rule-seven-zero><span><b>7–0</b><small>7 swaps hands; 0 rotates hands in play direction.</small></span></label>
              </div></fieldset>
              <div class="uno-status" data-host-status></div>
              <div class="uno-actions"><button class="uno-btn ghost" type="button" data-go="home">BACK</button><button class="uno-btn primary" type="button" data-create-room>CREATE ROOM</button></div>
            </div>
          </section>

          <section class="uno-panel setup" data-panel="join" hidden>
            <div class="uno-setup-card join-card">
              <div class="uno-section-title"><span>🔗</span><div><h2>JOIN LIVE ROOM</h2><p>Enter the Host room code, scan its QR, or accept a Student ID invite below.</p></div></div>
              <div class="uno-form-grid join-grid">
                <label><span>YOUR NAME</span><input data-guest-name maxlength="24" autocomplete="off" value="PLAYER"></label>
                <label><span>ROOM CODE</span><input data-room-code maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC234"></label>
              </div>
              <div class="uno-join-buttons"><button class="uno-btn primary" type="button" data-join-room>JOIN ROOM</button><button class="uno-btn" type="button" data-scan-room>📷 SCAN QR</button></div>
              <div class="uno-status" data-join-status></div>
              <section class="uno-invites" data-invites-wrap hidden>
                <div class="uno-invites-head"><strong>🎮 UNO INVITES</strong><button type="button" data-refresh-invites>REFRESH</button></div>
                <div data-invite-list><div class="uno-invite-empty">No pending UNO invites.</div></div>
              </section>
              <div class="uno-actions"><button class="uno-btn ghost" type="button" data-go="home">BACK</button></div>
            </div>
          </section>

          <section class="uno-panel lobby" data-panel="lobby" hidden>
            <div class="uno-lobby-top">
              <div><span class="uno-label">ROOM CODE</span><strong data-room-code-label>------</strong><small data-room-mode>QUICK ROUND</small><small class="uno-room-rules" data-room-rules>CLASSIC RULES</small></div>
              <div class="uno-room-count"><span>PLAYERS</span><strong data-room-count>1 / 6</strong></div>
            </div>
            <div class="uno-lobby-grid">
              <div class="uno-roster" data-roster></div>
              <aside class="uno-host-tools" data-host-tools>
                <div class="uno-qr-wrap" data-room-qr-wrap hidden><img data-room-qr alt="Room QR"><small>Scan to join this room</small></div>
                <label class="uno-student-invite"><span>INVITE BY STUDENT ID</span><div><input data-target-student maxlength="30" autocomplete="off" placeholder="Student ID"><button type="button" data-send-student>SEND</button></div></label>
                <div class="uno-status" data-host-room-status></div>
              </aside>
            </div>
            <div class="uno-voice-call-bar" data-voice-bar hidden>
              <div class="uno-voice-call-info"><i data-voice-dot></i><div><strong>VOICE CALL</strong><small data-voice-status>CONNECTING…</small></div></div>
              <div class="uno-voice-call-actions"><button type="button" data-voice-mic>🎙️ MIC OFF</button><button type="button" data-voice-speaker>🎧 SPEAKER ON</button><button type="button" data-voice-mute-all hidden>🔇 MUTE GUESTS</button></div>
            </div>
            <div class="uno-lobby-actions"><button class="uno-btn danger" type="button" data-leave-room>LEAVE</button><button class="uno-btn ready" type="button" data-ready>I'M READY</button><button class="uno-btn primary" type="button" data-start-live hidden>START GAME</button></div>
          </section>

          <section class="uno-panel game" data-panel="game" hidden>
            <div class="uno-game-hud">
              <div class="uno-turn-banner" data-turn-banner>YOUR TURN</div>
              <div class="uno-hud-chips">
                <span class="uno-hud-chip color" data-color-chip>● RED</span>
                <span class="uno-hud-chip" data-direction>↻ CLOCKWISE</span>
                <span class="uno-hud-chip" data-round-chip>ROUND 1</span>
                <span class="uno-hud-chip house" data-house-chip hidden>HOUSE</span>
                <span class="uno-hud-chip voice" data-voice-game-chip hidden>🎙 VOICE</span>
              </div>
              <button class="uno-exit-game" type="button" data-leave-room>EXIT</button>
            </div>

            <div class="uno-table" data-table data-color="red">
              <div class="uno-table-glow"></div>
              <div class="uno-opponents" data-opponents></div>
              <div class="uno-center-zone">
                <button class="uno-pile draw" type="button" data-draw-pile aria-label="Draw one card"><span class="uno-card-back"><b>4C</b></span><small><b data-draw-count>0</b> DRAW</small></button>
                <div class="uno-discard" data-discard></div>
                <div class="uno-center-status" data-center-status></div>
              </div>
              <div class="uno-effect" data-effect hidden></div>
            </div>

            <div class="uno-player-bar">
              <div class="uno-you" data-local-voice><span>YOU</span><strong data-you-name>PLAYER</strong><small data-you-cards>7 CARDS</small><i class="uno-voice-mini" data-local-mic-state hidden>🎙</i></div>
              <div class="uno-action-cluster">
                <button class="uno-action sort" type="button" data-sort title="Change hand sorting">SORT: COLOR</button>
                <button class="uno-action draw" type="button" data-draw>DRAW</button>
                <button class="uno-action keep" type="button" data-keep hidden>KEEP CARD</button>
                <button class="uno-action catch" type="button" data-catch hidden>⚠ CATCH UNO</button>
                <button class="uno-action uno" type="button" data-uno>UNO!</button>
              </div>
            </div>
            <div class="uno-hand-shell"><button class="uno-hand-nav prev" type="button" data-hand-prev aria-label="Scroll cards left" hidden>&lsaquo;</button><div class="uno-hand" data-hand aria-label="Your cards"></div><button class="uno-hand-nav next" type="button" data-hand-next aria-label="Scroll cards right" hidden>&rsaquo;</button></div>
          </section>
        </main>

        <div class="uno-choice-modal" data-color-modal hidden>
          <div><span>WILD CARD</span><strong>CHOOSE A COLOR</strong><div class="uno-color-grid">${COLORS.map(color=>`<button type="button" data-choose-color="${color}" class="${color}"><i></i>${COLOR_META[color].label}</button>`).join('')}</div></div>
        </div>
        <div class="uno-choice-modal" data-challenge-modal hidden>
          <div><span>WILD DRAW FOUR</span><strong>ACCEPT +4 OR CHALLENGE?</strong><p>If the previous player still had the active color, they draw 4. If the +4 was legal, you draw 6.</p><div class="uno-challenge-actions"><button type="button" data-wild4-accept>ACCEPT +4</button><button type="button" data-wild4-challenge>CHALLENGE</button></div></div>
        </div>
        <div class="uno-choice-modal uno-swap-modal" data-swap-modal hidden>
          <div><span>7–0 HOUSE RULE</span><strong>CHOOSE A HAND TO SWAP</strong><p>Your current hand will trade places with the selected player.</p><div class="uno-swap-list" data-swap-list></div></div>
        </div>
        <div class="uno-result-modal" data-result hidden><div data-result-card></div></div>
        <div class="uno-disconnect" data-disconnect hidden><div><span>CONNECTION</span><strong data-disconnect-title>RECONNECTING…</strong><p data-disconnect-copy>Please wait while the room reconnects.</p><button type="button" data-disconnect-home>BACK TO HOME</button></div></div>
        <div class="uno-scanner" data-scanner hidden><div><button type="button" data-close-scanner>×</button><strong>SCAN ROOM QR</strong><video data-scan-video playsinline muted></video><p data-scan-status>Point the camera at the Host QR.</p></div></div>
        <div class="uno-toast" data-toast hidden></div>
      </section>`;
    document.body.appendChild(o);
    r.overlay = o;
    bind();
  }

  function bind() {
    $('[data-close]')?.addEventListener('click', () => close(true));
    $('[data-back]')?.addEventListener('click', back);
    $('[data-sound]')?.addEventListener('click', toggleSound);
    $$('[data-voice-mic]').forEach(button => button.addEventListener('click', toggleVoiceMic));
    $$('[data-voice-speaker]').forEach(button => button.addEventListener('click', toggleVoiceSpeaker));
    $('[data-voice-mute-all]')?.addEventListener('click', toggleHostMuteAll);
    $$('[data-go]').forEach(button => button.addEventListener('click', () => show(button.dataset.go)));
    $('[data-start-solo]')?.addEventListener('click', startSolo);
    $('[data-create-room]')?.addEventListener('click', createHostRoom);
    $('[data-join-room]')?.addEventListener('click', () => joinRoom($('[data-room-code]')?.value));
    $('[data-room-code]')?.addEventListener('keydown', event => { if (event.key === 'Enter') joinRoom(event.currentTarget.value); });
    $('[data-scan-room]')?.addEventListener('click', scanRoom);
    $('[data-close-scanner]')?.addEventListener('click', closeScanner);
    $('[data-send-student]')?.addEventListener('click', sendStudentInvite);
    $('[data-refresh-invites]')?.addEventListener('click', () => refreshInvites(true));
    $('[data-invite-list]')?.addEventListener('click', handleInviteListClick);
    $('[data-ready]')?.addEventListener('click', toggleReady);
    $('[data-start-live]')?.addEventListener('click', startLiveGame);
    $$('[data-leave-room]').forEach(button => button.addEventListener('click', leaveRoomToHome));
    $('[data-sort]')?.addEventListener('click', cycleHandSort);
    $('[data-draw]')?.addEventListener('click', () => performLocalAction({ type:'draw' }));
    $('[data-draw-pile]')?.addEventListener('click', () => performLocalAction({ type:'draw' }));
    $('[data-keep]')?.addEventListener('click', () => performLocalAction({ type:'pass' }));
    $('[data-uno]')?.addEventListener('click', () => performLocalAction({ type:'uno' }));
    $('[data-catch]')?.addEventListener('click', () => {
      const view = currentView();
      if (view?.private?.actions?.catchableSeat != null) performLocalAction({ type:'catch-uno', targetSeat:view.private.actions.catchableSeat });
    });
    const handRail=$('[data-hand]');
    handRail?.addEventListener('click', event => {
      if(Date.now()<Number(handRail.dataset.suppressClickUntil||0))return;
      const card = event.target.closest('[data-card-id]');
      if (!card || card.dataset.disabled==='1' || card.classList.contains('disabled')) return;
      performLocalAction({ type:'play', cardId:card.dataset.cardId });
    });
    handRail?.addEventListener('wheel', event => {
      if(!handRail||handRail.scrollWidth<=handRail.clientWidth+4||Math.abs(event.deltaY)<=Math.abs(event.deltaX))return;
      event.preventDefault();
      handRail.scrollLeft+=event.deltaY;
    },{passive:false});
    handRail?.addEventListener('scroll',()=>updateHandRailControls(handRail),{passive:true});
    $('[data-hand-prev]')?.addEventListener('click',()=>scrollHandRail(-1));
    $('[data-hand-next]')?.addEventListener('click',()=>scrollHandRail(1));
    let handMouseDrag=null;
    handRail?.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='mouse'||handRail.scrollWidth<=handRail.clientWidth+4)return;
      handMouseDrag={id:event.pointerId,x:event.clientX,left:handRail.scrollLeft,moved:false};
      handRail.classList.add('dragging');
      try{handRail.setPointerCapture(event.pointerId);}catch(_){}
    });
    handRail?.addEventListener('pointermove',event=>{
      if(!handMouseDrag||event.pointerId!==handMouseDrag.id)return;
      const dx=event.clientX-handMouseDrag.x;if(Math.abs(dx)>4)handMouseDrag.moved=true;
      handRail.scrollLeft=handMouseDrag.left-dx;
    });
    const finishHandDrag=event=>{
      if(!handMouseDrag||event.pointerId!==handMouseDrag.id)return;
      if(handMouseDrag.moved)handRail.dataset.suppressClickUntil=String(Date.now()+220);
      handMouseDrag=null;handRail.classList.remove('dragging');updateHandRailControls(handRail);
    };
    handRail?.addEventListener('pointerup',finishHandDrag);
    handRail?.addEventListener('pointercancel',finishHandDrag);
    $$('[data-choose-color]').forEach(button => button.addEventListener('click', () => performLocalAction({ type:'color', color:button.dataset.chooseColor })));
    $('[data-wild4-accept]')?.addEventListener('click', () => performLocalAction({ type:'wild4-accept' }));
    $('[data-wild4-challenge]')?.addEventListener('click', () => performLocalAction({ type:'wild4-challenge' }));
    $('[data-swap-list]')?.addEventListener('click',event=>{const button=event.target.closest('[data-swap-seat]');if(button)performLocalAction({type:'swap',targetSeat:Number(button.dataset.swapSeat)});});
    $('[data-result]')?.addEventListener('click', event => {
      if (event.target.closest('[data-next-round]')) startNextRound();
      if (event.target.closest('[data-play-again]')) playAgain();
      if (event.target.closest('[data-result-home]')) leaveRoomToHome();
    });
    $('[data-disconnect-home]')?.addEventListener('click', leaveRoomToHome);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const refreshResponsiveGame=()=>{if(r.open&&r.state==='game')requestAnimationFrame(()=>{const hand=$('[data-hand]'),view=currentView();updateHandLayout(hand,view?.private?.hand?.length||0);updateHandRailControls(hand);});};
    window.addEventListener('resize',refreshResponsiveGame,{passive:true});
    try{window.visualViewport?.addEventListener('resize',refreshResponsiveGame,{passive:true});}catch(_){}
  }

  function show(name) {
    const next = ['home','solo','host','join','lobby','game'].includes(name) ? name : 'home';
    r.state = next;
    $$('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== next; });
    if (next === 'join') startInvitePolling(); else { clearTimeout(r.inviteTimer); r.inviteTimer=0; }
    if (next !== 'game') hideChoiceModals();
    if (next === 'home') hideDisconnect();
    updateVoiceUi();
    const activePanel=$(`[data-panel="${next}"]`);
    if(activePanel&&['solo','host','join'].includes(next))requestAnimationFrame(()=>{activePanel.scrollTop=0;});
    if(next==='game')requestAnimationFrame(()=>{const hand=$('[data-hand]');const view=currentView();updateHandLayout(hand,view?.private?.hand?.length||0);updateHandRailControls(hand);});
  }

  function back() {
    if (r.state === 'game' || r.state === 'lobby') { leaveRoomToHome(); return; }
    if (r.state !== 'home') { show('home'); return; }
    r.onBack?.();
  }

  function setStatus(el, text, error = false, ok = false) {
    if (!el) return;
    el.textContent = String(text || '');
    el.classList.toggle('error', !!error);
    el.classList.toggle('ok', !!ok);
  }

  function toast(text, ms = 1700) {
    const el = $('[data-toast]');
    if (!el) return;
    clearTimeout(r.toastTimer);
    el.textContent = String(text || '');
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('show'));
    r.toastTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(()=>{el.hidden=true;},180); }, ms);
  }

  function currentView() {
    if ((isSolo() || isHost()) && r.game) return { public:E().publicSnapshot(r.game), private:E().privateSnapshot(r.game, r.localSeat) };
    if (isGuest()) return { public:r.guestPublic, private:r.guestPrivate };
    return { public:null, private:null };
  }

  function soundAllowed() {
    return r.soundEnabled && r.bridge?.getSnapshot?.()?.soundEnabled !== false;
  }

  function audioContext() {
    if (!soundAllowed()) return null;
    try {
      r.audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (r.audioCtx.state === 'suspended') r.audioCtx.resume().catch(()=>{});
      return r.audioCtx;
    } catch (_) { return null; }
  }

  function tone(freq, duration = .08, type = 'sine', gain = .04, when = 0) {
    const ctx = audioContext(); if (!ctx) return;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type=type; osc.frequency.value=freq; g.gain.setValueAtTime(0.0001,ctx.currentTime+when); g.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+when+.008); g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+when+duration);
    osc.connect(g).connect(ctx.destination); osc.start(ctx.currentTime+when); osc.stop(ctx.currentTime+when+duration+.02);
  }

  function sfx(kind) {
    if (!soundAllowed()) return;
    if (kind==='play') { tone(420,.06,'triangle',.035);tone(620,.07,'triangle',.026,.045); }
    else if (kind==='draw') { tone(180,.055,'square',.025);tone(240,.06,'triangle',.02,.045); }
    else if (kind==='skip') { tone(520,.07,'square',.035);tone(280,.10,'square',.025,.07); }
    else if (kind==='reverse') { tone(320,.06,'triangle',.03);tone(440,.06,'triangle',.03,.05);tone(580,.08,'triangle',.03,.10); }
    else if (kind==='wild') { tone(330,.08,'sine',.03);tone(494,.08,'sine',.03,.06);tone(660,.11,'sine',.03,.12); }
    else if (kind==='uno') { tone(523,.08,'square',.04);tone(659,.08,'square',.04,.07);tone(784,.14,'square',.04,.14); }
    else if (kind==='win') { [523,659,784,1046].forEach((f,i)=>tone(f,.15,'triangle',.04,i*.09)); }
    else if (kind==='error') { tone(150,.11,'sawtooth',.03); }
    else if (kind==='join') { tone(440,.07,'triangle',.03);tone(660,.09,'triangle',.03,.065); }
  }

  function toggleSound() {
    r.soundEnabled = !r.soundEnabled;
    $('[data-sound]').textContent = r.soundEnabled ? '🔊' : '🔇';
    try { r.bridge?.setSoundEnabled?.(r.soundEnabled); } catch (_) {}
    if (r.soundEnabled) { audioContext(); r.music?.start?.(GAME_ID,{enabled:true}); }
    else r.music?.stop?.();
  }

  const UNO_COLOR_ORDER=Object.freeze({red:0,yellow:1,green:2,blue:3,wild:4});
  const UNO_TYPE_ORDER=Object.freeze({number:0,skip:1,reverse:2,draw2:3,wild:4,wild4:5});

  function handSortLabel(){return r.handSort==='value'?'VALUE':r.handSort==='deal'?'DEAL':'COLOR';}

  function cycleHandSort(){
    r.handSort=r.handSort==='color'?'value':r.handSort==='value'?'deal':'color';
    try{localStorage.setItem('ict8UnoHandSort',r.handSort);}catch(_){}
    const btn=$('[data-sort]');if(btn)btn.textContent=`SORT: ${handSortLabel()}`;
    if(r.state==='game')syncLocalRender(true);
    toast(`Hand sorted by ${handSortLabel().toLowerCase()}.`,1100);
  }

  function sortedHand(cards){
    const list=(Array.isArray(cards)?cards:[]).slice();
    if(r.handSort==='deal')return list;
    const numberValue=card=>card?.type==='number'?Number(card.value||0):20+(UNO_TYPE_ORDER[card?.type]??9);
    return list.sort((a,b)=>{
      if(r.handSort==='value'){
        const av=numberValue(a),bv=numberValue(b);if(av!==bv)return av-bv;
        const ac=UNO_COLOR_ORDER[a?.color]??9,bc=UNO_COLOR_ORDER[b?.color]??9;if(ac!==bc)return ac-bc;
      }else{
        const ac=UNO_COLOR_ORDER[a?.color]??9,bc=UNO_COLOR_ORDER[b?.color]??9;if(ac!==bc)return ac-bc;
        const at=UNO_TYPE_ORDER[a?.type]??9,bt=UNO_TYPE_ORDER[b?.type]??9;if(at!==bt)return at-bt;
        const av=numberValue(a),bv=numberValue(b);if(av!==bv)return av-bv;
      }
      return String(a?.id||'').localeCompare(String(b?.id||''));
    });
  }

  function cardSymbol(card) {
    if (!card) return '';
    if (card.type==='number') return String(card.value);
    if (card.type==='skip') return '⊘';
    if (card.type==='reverse') return '↺';
    if (card.type==='draw2') return '+2';
    if (card.type==='wild4') return '+4';
    return 'W';
  }

  function cardHtml(card, options = {}) {
    if (!card) return '<div class="uno-card placeholder"></div>';
    const symbol = cardSymbol(card);
    const wild = card.color === 'wild';
    const playable = options.playable === true;
    const drawn = options.drawn === true;
    const button = options.button === true;
    const tag = button ? 'button' : 'div';
    const attrs = button ? ` type="button" data-card-id="${esc(card.id)}" data-disabled="${options.disabled?'1':'0'}" aria-disabled="${options.disabled?'true':'false'}" tabindex="${options.disabled?'-1':'0'}"` : '';
    return `<${tag}${attrs} class="uno-card ${wild?'wild':`color-${card.color}`} type-${card.type}${playable?' playable':''}${drawn?' drawn':''}${options.disabled?' disabled':''}">
      <span class="uno-card-corner top">${esc(symbol)}</span>
      <span class="uno-card-oval"><b>${esc(symbol)}</b>${wild?'<i class="uno-wild-wheel"><em></em><em></em><em></em><em></em></i>':''}</span>
      <span class="uno-card-corner bottom">${esc(symbol)}</span>
    </${tag}>`;
  }

  function startSolo() {
    clearNetwork();
    r.role='solo'; r.localSeat=0;
    r.botCount=clamp($('[data-bot-count]')?.value||3,1,9);
    r.botLevel=String($('[data-bot-level]')?.value||'normal');
    r.mode=String($('[data-solo-mode]')?.value||'quick')==='classic'?'classic':'quick';
    r.houseRules=readHouseRules('solo');
    const name=String($('[data-solo-name]')?.value||identity().name||'PLAYER').trim().slice(0,24)||'PLAYER';
    const players=[{uid:identity().uid||'local',studentId:identity().studentId||'',name,bot:false}];
    for(let i=0;i<r.botCount;i++) players.push({uid:`bot-${i+1}`,name:`BOT ${i+1}`,bot:true,botLevel:r.botLevel});
    r.game=E().createMatch({players,mode:r.mode,targetScore:r.targetScore,houseRules:r.houseRules});
    show('game');
    syncLocalRender(true);
    sfx('join');
    scheduleAutomation();
  }

  async function createHostRoom() {
    const status=$('[data-host-status]'),button=$('[data-create-room]');
    if(!identity().loggedIn){setStatus(status,'Sign in as a student before hosting a live room.',true);return;}
    button.disabled=true;button.textContent='CREATING…';
    try{
      clearNetwork(); r.role='host';r.localSeat=0;r.maxPlayers=clamp($('[data-host-capacity]')?.value||6,2,10);r.mode=String($('[data-host-mode]')?.value||'quick')==='classic'?'classic':'quick';r.houseRules=readHouseRules('host');r.voiceRoomEnabled=$('[data-host-voice]')?.checked!==false;if(r.voiceRoomEnabled)prepareVoicePlayback();
      const name=String($('[data-host-name]')?.value||identity().name||'HOST').trim().slice(0,24)||'HOST';
      let meta=null,attempts=0;
      while(!meta&&attempts++<6){try{meta=await r.bridge.createCodeUnoRoom({roomCode:randomRoomCode(),maxPlayers:r.maxPlayers,hostName:name});}catch(e){if(attempts>=6)throw e;}}
      r.roomMeta=meta;r.roomCode=meta.roomCode;
      r.players=[createLobbyPlayer(0,name,{uid:identity().uid,studentId:identity().studentId,ready:true,connected:true})];r.seatByUid.set(identity().uid,0);setVoiceMicState(0,false);
      enterLobby();startHostSignalLoop();
    }catch(error){r.role='';setStatus(status,error?.message||'Could not create the room.',true);}
    finally{button.disabled=false;button.textContent='CREATE ROOM';}
  }

  function enterLobby() {
    $('[data-room-code-label]').textContent=r.roomCode||'------';
    $('[data-room-mode]').textContent=r.mode==='classic'?'CLASSIC 500':'QUICK ROUND';
    if($('[data-room-rules]'))$('[data-room-rules]').textContent=houseRuleLabel();
    $('[data-host-tools]').hidden=!isHost();
    $('[data-start-live]').hidden=!isHost();
    const qrWrap=$('[data-room-qr-wrap]');
    if(isHost()&&r.roomCode){const url=r.bridge?.createQrDataUrl?.(`${ROOM_QR_PREFIX}${r.roomCode}`,360)||'';if(url){$('[data-room-qr]').src=url;qrWrap.hidden=false;}else qrWrap.hidden=true;}else if(qrWrap)qrWrap.hidden=true;
    show('lobby');renderLobby();updateVoiceUi();
  }

  function applyGuestLobbyPlayers(players=[], seatHint=null) {
    if(!isGuest())return;
    if(Array.isArray(players)&&players.length){
      r.players=players.map(player=>({ ...player, seat:Number(player.seat) }));
    }
    const uid=String(identity().uid||'');
    let mine=(uid&&r.players.find(player=>String(player.uid||'')===uid))||null;
    const hinted=Number(seatHint);
    if(!mine&&Number.isFinite(hinted))mine=r.players.find(player=>Number(player.seat)===hinted)||null;
    if(mine){r.localSeat=Number(mine.seat);mine.connected=true;}
  }

  function compactLobbySeats() {
    // Host owns seat assignment, but IMPORTANT: keep negotiating players.
    // A newly discovered join is intentionally `connected:false` until the
    // DataChannel opens. Filtering by `connected` here used to delete that
    // player immediately, so the Host stayed at 1/N and the Guest received a
    // welcome roster without its own seat (READY remained stuck on SYNCING).
    if(r.state==='game'||!isHost())return;
    const sorted=r.players.slice().sort((a,b)=>Number(a.seat)-Number(b.seat));
    r.seatByUid.clear();
    sorted.forEach((p,index)=>{
      p.seat=index;
      r.seatByUid.set(p.uid,index);
      const peer=r.peers.get(p.uid);if(peer)peer.seat=index;
    });
    r.players=sorted;
  }

  function renderLobby() {
    const roster=$('[data-roster]');if(!roster)return;
    compactLobbySeats();
    const bySeat=new Map(r.players.map(p=>[p.seat,p]));
    roster.innerHTML=Array.from({length:r.maxPlayers},(_,seat)=>{
      const p=bySeat.get(seat);
      if(!p)return `<div class="uno-roster-row empty"><span class="uno-avatar">${seat+1}</span><div><strong>OPEN SEAT</strong><small>Waiting for player…</small></div><b>OPEN</b></div>`;
      const you=p.uid===identity().uid||seat===r.localSeat?' · YOU':'';
      const connecting=!p.connected&&((isHost()&&!!r.peers.get(p.uid)?.connecting)||(isGuest()&&String(p.uid||'')===String(identity().uid||'')&&!!r.guestSession));
      return `<div class="uno-roster-row ${p.ready?'ready':''} ${p.connected?'':'offline'}" data-seat-avatar="${seat}"><span class="uno-avatar">${esc((p.name||'?').charAt(0).toUpperCase())}</span><div><strong>${esc(p.name)}${you}</strong><small>${p.studentId?esc(p.studentId):'LIVE PLAYER'}</small></div><b>${p.connected?(p.ready?'READY ✓':'NOT READY'):(connecting?'CONNECTING…':'OFFLINE')}</b><i class="uno-roster-mic" data-voice-seat-mic="${seat}" hidden>🎙</i></div>`;
    }).join('');
    if($('[data-room-rules]'))$('[data-room-rules]').textContent=houseRuleLabel();
    const connected=r.players.filter(p=>p.connected).length;
    $('[data-room-count]').textContent=`${connected} / ${r.maxPlayers}`;
    const me=localLobbyPlayer();const readyButton=$('[data-ready]');if(readyButton){const syncing=isGuest()&&(!r.guestSession?.connected||!me);readyButton.disabled=syncing;readyButton.textContent=syncing?'SYNCING…':(me?.ready?'READY ✓':"I'M READY");readyButton.classList.toggle('active',!!me?.ready&&!syncing);}
    if(isHost()){
      const humans=r.players.filter(p=>p.connected);
      const enough=humans.length>=2;
      const allReady=enough&&humans.every(p=>p.ready);
      const start=$('[data-start-live]');start.disabled=!allReady;start.textContent=allReady?`START ${humans.length}-PLAYER GAME`:!enough?'NEED 1 MORE PLAYER':'WAITING FOR READY…';
    }
    updateVoiceUi();updateVoiceIndicators();
  }

  function hostNeedsSignalPolling() {
    if(!r.open||!isHost()||!r.roomCode)return false;
    const negotiating=[...r.peers.values()].some(peer=>peer.connecting&&!peer.connected&&!peer.answerApplied);
    if(r.state==='game'){
      const disconnected=[...r.peers.values()].some(peer=>{const gp=r.game?.players?.find(player=>player.seat===peer.seat);return !peer.connected&&!(gp?.botTakeover);});
      return negotiating||disconnected;
    }
    return r.players.filter(p=>p.connected).length<r.maxPlayers||negotiating;
  }

  function stopHostSignalPolling(){clearTimeout(r.signalTimer);r.signalTimer=0;}

  function startHostSignalLoop() {
    stopHostSignalPolling();clearInterval(r.roomTouchTimer);
    let lastJoinPollAt=0;
    const poll=async()=>{
      if(!hostNeedsSignalPolling())return;
      let waiting=[...r.peers.values()].some(peer=>peer.connecting&&!peer.connected&&!peer.answerApplied);
      try{
        const now=Date.now();
        if(!waiting||now-lastJoinPollAt>=HOST_JOIN_POLL_MS){const joins=await r.bridge.listCodeUnoJoins({roomCode:r.roomCode,meta:r.roomMeta});lastJoinPollAt=Date.now();for(const join of joins)await prepareHostPeer(join);waiting=[...r.peers.values()].some(peer=>peer.connecting&&!peer.connected&&!peer.answerApplied);}
        if(waiting){const answers=await r.bridge.listCodeUnoAnswers({roomCode:r.roomCode,meta:r.roomMeta});for(const answer of answers){const peer=r.peers.get(answer.uid);if(peer&&!peer.answerApplied&&answer.answerCode&&Number(answer.updatedAtMs||0)>=Number(peer.offerAt||0)){peer.answerApplied=true;try{await peer.session.applyAnswer(answer.answerCode);}catch(_){peer.answerApplied=false;peer.connecting=false;}}}}
      }catch(_){}
      if(hostNeedsSignalPolling()){const negotiating=[...r.peers.values()].some(peer=>peer.connecting&&!peer.connected&&!peer.answerApplied);r.signalTimer=setTimeout(poll,negotiating?HOST_ANSWER_POLL_MS:HOST_JOIN_POLL_MS);}
    };
    r.signalTimer=setTimeout(poll,180);
    r.roomTouchTimer=setInterval(()=>{if(!r.open||!isHost()||!r.roomCode)return;r.bridge.touchCodeUnoRoom({roomCode:r.roomCode,status:r.state==='game'?'playing':'lobby',meta:r.roomMeta}).then(meta=>{if(meta)r.roomMeta=meta;}).catch(()=>{});},ROOM_TOUCH_MS);
  }

  function nextFreeSeat(uid='') {
    if(uid&&r.seatByUid.has(uid))return r.seatByUid.get(uid);
    const used=new Set(r.players.map(p=>p.seat));for(let seat=1;seat<r.maxPlayers;seat++)if(!used.has(seat))return seat;return -1;
  }

  async function prepareHostPeer(join) {
    if(!join?.uid||join.uid===identity().uid)return;
    const knownSeat=r.seatByUid.get(join.uid);
    if(r.state==='game'&&knownSeat==null){r.bridge.setCodeUnoOffer({roomCode:r.roomCode,targetUid:join.uid,status:'started',seat:1,color:'seat',offerCode:'',meta:r.roomMeta}).catch(()=>{});return;}
    const existing=r.peers.get(join.uid);
    if(existing&&(existing.connected||existing.connecting))return;
    const seat=knownSeat??nextFreeSeat(join.uid);
    if(seat<0){r.bridge.setCodeUnoOffer({roomCode:r.roomCode,targetUid:join.uid,status:'full',seat:1,color:'seat',offerCode:'',meta:r.roomMeta}).catch(()=>{});return;}
    try{existing?.session?.close();}catch(_){}
    const peer={uid:join.uid,seat,name:String(join.name||`PLAYER ${seat+1}`),studentId:String(join.studentId||''),connected:false,connecting:true,answerApplied:false,session:null,offerAt:Date.now()};
    r.peers.set(join.uid,peer);r.seatByUid.set(join.uid,seat);
    let p=r.players.find(item=>String(item.uid||'')===String(join.uid||''))||lobbyPlayerAt(seat);
    if(!p){p=createLobbyPlayer(seat,peer.name,{uid:join.uid,studentId:peer.studentId,ready:false,connected:false});r.players.push(p);}
    else{p.seat=seat;p.name=peer.name;p.uid=join.uid;p.studentId=peer.studentId;p.connected=false;}
    if(r.state==='lobby')renderLobby();
    let session=null;
    session=P().createSession({
      gameId:`code-uno-${r.roomCode}-${join.uid}`,prefix:PREFIX,channelLabel:'uno',timeoutMs:12000,
      onMessage:msg=>{if(r.peers.get(join.uid)?.session===session)handleGuestMessage(join.uid,msg);},
      onConnected:()=>{if(r.peers.get(join.uid)?.session===session)hostPeerConnected(join.uid);},
      onDisconnected:()=>{if(r.peers.get(join.uid)?.session===session)hostPeerDisconnected(join.uid);},
      onState:state=>{
        if(r.peers.get(join.uid)?.session!==session)return;
        if(state==='timeout'||state==='ice-failed'||state==='channel-error'){peer.connecting=false;peer.answerApplied=false;try{session.close();}catch(_){}if(hostNeedsSignalPolling()&&!r.signalTimer)startHostSignalLoop();}
      }
    });peer.session=session;
    try{const offer=await session.createOffer(r.players[0]?.name||'HOST');await r.bridge.setCodeUnoOffer({roomCode:r.roomCode,targetUid:join.uid,status:'offer',seat,color:`seat-${seat}`,offerCode:offer,meta:r.roomMeta});}catch(_){peer.connecting=false;}
  }

  function hostPeerConnected(uid) {
    const peer=r.peers.get(uid);if(!peer)return;peer.connected=true;peer.connecting=false;peer.answerApplied=true;
    // Defensive upsert: even if an older/stale lobby render lost a pending row,
    // a successfully opened DataChannel must always materialize that player in
    // the authoritative Host roster before welcome/broadcast is sent.
    let p=r.players.find(item=>String(item.uid||'')===String(uid||''))||lobbyPlayerAt(peer.seat);
    if(!p){p=createLobbyPlayer(peer.seat,peer.name,{uid,studentId:peer.studentId,ready:false,connected:true});r.players.push(p);}
    p.seat=peer.seat;p.uid=uid;p.connected=true;p.name=peer.name;p.studentId=peer.studentId;
    r.seatByUid.set(uid,peer.seat);
    clearDisconnectTimer(peer.seat);
    if(r.game){E().setConnection(r.game,peer.seat,true,false);const gp=r.game.players.find(x=>x.seat===peer.seat);if(gp){gp.bot=false;gp.botTakeover=false;gp.connected=true;}if(![...r.peers.values()].some(item=>!item.connected))hideDisconnect();}
    if(r.state==='lobby'){
      renderLobby();
      // Make the direct welcome self-contained so the guest does not depend on
      // receiving a separate lobby broadcast before it can press READY.
      peer.session.send({t:'welcome',roomCode:r.roomCode,seat:peer.seat,maxPlayers:r.maxPlayers,mode:r.mode,houseRules:r.houseRules,voiceEnabled:r.voiceRoomEnabled,players:publicLobbyPlayers(),state:'lobby'});
      broadcastLobby();
    }
    else if(r.state==='game'){peer.session.send({t:'welcome',roomCode:r.roomCode,seat:peer.seat,maxPlayers:r.maxPlayers,mode:r.mode,houseRules:r.houseRules,voiceEnabled:r.voiceRoomEnabled,state:'game'});syncAll();}
    // Once the DataChannel is open these SDP/join records are no longer needed.
    // Clearing them keeps later lobby polling tiny, especially in 6-10 player rooms.
    r.bridge.clearCodeUnoHandshake?.({roomCode:r.roomCode,targetUid:uid,meta:r.roomMeta}).catch(()=>{});
    if(r.voiceRoomEnabled){peer.session.send({t:'voiceMicState',seat:0,on:voice.micOn});for(const [seat,on] of voice.micBySeat)peer.session.send({t:'voiceMicState',seat,on});peer.session.send({t:'voiceHostMute',on:voice.hostMuteAll});}
    toast(`${peer.name} connected.`);sfx('join');if(r.voiceRoomEnabled)setTimeout(()=>hostStartVoicePeer(uid),120);if(!hostNeedsSignalPolling())stopHostSignalPolling();
  }

  function clearDisconnectTimer(seat){const timer=r.disconnectTimers.get(seat);if(timer)clearTimeout(timer);r.disconnectTimers.delete(seat);}

  function hostPeerDisconnected(uid) {
    closeHostVoicePeer(uid);
    const peer=r.peers.get(uid);if(!peer)return;peer.connected=false;peer.connecting=false;peer.answerApplied=false;
    const p=lobbyPlayerAt(peer.seat);if(p)p.connected=false;
    if(r.state==='lobby'){
      r.players=r.players.filter(item=>item.uid!==uid);r.seatByUid.delete(uid);r.peers.delete(uid);compactLobbySeats();renderLobby();broadcastLobby();if(!r.signalTimer)startHostSignalLoop();return;
    }
    if(r.game){E().setConnection(r.game,peer.seat,false,false);syncAll();showDisconnectForSeat(peer.seat,`${p?.name||'A player'} disconnected. Waiting ${Math.round(RECONNECT_GRACE_MS/1000)} seconds before bot takeover.`);clearDisconnectTimer(peer.seat);const timer=setTimeout(()=>{const latest=r.peers.get(uid);if(latest?.connected)return;const gp=r.game?.players?.find(x=>x.seat===peer.seat);if(gp){gp.bot=true;gp.botLevel='normal';gp.botTakeover=true;gp.connected=true;emitLocalConnectionEvent(peer.seat);toast(`${gp.name} is now controlled by a bot.`,2400);hideDisconnect();syncAll();scheduleAutomation();}stopHostSignalPolling();},RECONNECT_GRACE_MS);r.disconnectTimers.set(peer.seat,timer);startHostSignalLoop();}
  }

  function emitLocalConnectionEvent(seat){try{E()._test&&E().validateState(r.game,{throwOnError:true});}catch(_){} if(r.game){r.game.revision+=1;r.game.eventSeq+=1;r.game.lastEvent={seq:r.game.eventSeq,type:'botTakeover',seat,at:Date.now()};}}

  function publicLobbyPlayers(){return r.players.slice().sort((a,b)=>a.seat-b.seat).map(p=>({seat:p.seat,uid:p.uid,name:p.name,ready:!!p.ready,connected:!!p.connected}));}
  function broadcast(payload){for(const peer of r.peers.values())if(peer.connected)peer.session.send(payload);}
  function broadcastLobby(){broadcast({t:'lobby',maxPlayers:r.maxPlayers,mode:r.mode,houseRules:r.houseRules,voiceEnabled:r.voiceRoomEnabled,players:publicLobbyPlayers()});}

  function handleGuestMessage(uid,msg) {
    const peer=r.peers.get(uid);if(!peer||!msg)return;
    if(msg.t==='ready'&&r.state==='lobby'){
      let p=lobbyPlayerAt(peer.seat);
      if(!p){p=createLobbyPlayer(peer.seat,peer.name,{uid:peer.uid,studentId:peer.studentId,ready:false,connected:true});r.players.push(p);}
      p.connected=true;p.ready=!!msg.value;renderLobby();broadcastLobby();
      peer.session.send({t:'readyAck',ready:p.ready,seat:peer.seat});
    }
    else if(msg.t==='lobbyRequest'&&r.state==='lobby'){peer.session.send({t:'welcome',roomCode:r.roomCode,seat:peer.seat,maxPlayers:r.maxPlayers,mode:r.mode,houseRules:r.houseRules,voiceEnabled:r.voiceRoomEnabled,players:publicLobbyPlayers(),state:'lobby'});}
    else if(msg.t==='action'&&r.state==='game'){processHostAction(peer.seat,msg.action,Number(msg.revision),peer);}
    else if(msg.t==='snapshotRequest'&&r.state==='game'){sendStateToPeer(peer);}
    else if(msg.t==='voiceNeedOffer'&&r.voiceRoomEnabled){hostStartVoicePeer(uid,msg.force===true);}
    else if(msg.t==='voiceAnswer'&&r.voiceRoomEnabled){hostApplyVoiceAnswer(uid,msg.desc);}
    else if(msg.t==='voiceSpeak'){handleRemoteVoiceSpeak(peer.seat,msg.speaking);}
    else if(msg.t==='voiceMicState'){handleRemoteVoiceMic(peer.seat,msg.on);}
    else if(msg.t==='leave'){hostPeerDisconnected(uid);}
  }

  async function joinRoom(rawCode, reconnect = false) {
    if(!reconnect)prepareVoicePlayback();
    const code=String(rawCode||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6),status=$('[data-join-status]');
    if(code.length!==6){setStatus(status,'Enter a valid 6-character room code.',true);return;}
    if(!identity().loggedIn){setStatus(status,'Sign in as a student before joining a live room.',true);return;}
    if(!reconnect)setStatus(status,'Finding room…');
    try{
      if(!reconnect)clearNetwork(false); else {try{r.guestSession?.close();}catch(_){}r.guestSession=null;clearTimeout(r.signalTimer);}
      r.role='guest';r.roomCode=code;
      const name=String($('[data-guest-name]')?.value||identity().name||'PLAYER').trim().slice(0,24)||'PLAYER';
      const req=await r.bridge.requestCodeUnoJoin({roomCode:code,name});r.roomMeta=req.meta;r.maxPlayers=Number(req.meta.maxPlayers||10);
      if(!reconnect){r.players=[createLobbyPlayer(0,req.meta.hostName,{uid:req.meta.hostUid,ready:true,connected:true}),createLobbyPlayer(1,name,{uid:identity().uid,studentId:identity().studentId,ready:false,connected:false})];r.mode='quick';}
      setStatus(status,reconnect?'Reconnecting to Host…':'Room found. Connecting…');startGuestSignalLoop(name,reconnect);
    }catch(error){if(!reconnect){r.role='';setStatus(status,error?.message||'Could not join the room.',true);}else scheduleGuestReconnect(error?.message);}
  }

  function startGuestSignalLoop(name,reconnect=false) {
    clearTimeout(r.signalTimer);
    const poll=async()=>{
      if(!r.open||r.role!=='guest'||!r.roomCode||r.guestSession?.connected)return;
      try{
        const offer=await r.bridge.getCodeUnoOffer({roomCode:r.roomCode});
        if(offer?.status==='full'){setStatus($('[data-join-status]'),'That room is full.',true);return;}
        if(offer?.status==='started'&&!reconnect){setStatus($('[data-join-status]'),'That match has already started.',true);return;}
        if(offer?.offerCode&&!r.guestSession){
          r.localSeat=Number(offer.seat||1);
          let session=null;
          session=P().createSession({
            gameId:`code-uno-${r.roomCode}-${identity().uid}`,prefix:PREFIX,channelLabel:'uno',timeoutMs:12000,
            onMessage:msg=>{if(r.guestSession===session)handleHostMessage(msg);},
            onConnected:()=>{if(r.guestSession===session)guestConnected();},
            onDisconnected:()=>{if(r.guestSession===session)guestDisconnected();},
            onState:state=>{if(r.guestSession!==session)return;if(state==='timeout'||state==='ice-failed'||state==='channel-error'){try{session.close();}catch(_){}r.guestSession=null;if(r.open&&isGuest()&&!r.closing){clearTimeout(r.signalTimer);r.signalTimer=setTimeout(()=>startGuestSignalLoop(name,reconnect),500);}}}
          });r.guestSession=session;
          const answer=await session.createAnswer(offer.offerCode,name);await r.bridge.setCodeUnoAnswer({roomCode:r.roomCode,answerCode:answer,meta:r.roomMeta});setStatus($('[data-join-status]'),'Connecting to Host…');
        }
      }catch(error){if(r.guestSession&&!r.guestSession.connected){try{r.guestSession.close();}catch(_){}r.guestSession=null;}if(!reconnect)setStatus($('[data-join-status]'),error?.message||'Still waiting for Host…');}
      // After an answer is posted, wait on the direct WebRTC connection instead
      // of re-downloading the same RTDB offer every 900 ms. A failed/timeout
      // session restarts signaling from onState above.
      if(r.open&&r.role==='guest'&&!r.guestSession)r.signalTimer=setTimeout(poll,GUEST_OFFER_POLL_MS);
    };r.signalTimer=setTimeout(poll,120);
  }

  function guestConnected(){
    r.reconnecting=false;clearTimeout(r.reconnectTimer);clearTimeout(r.signalTimer);r.signalTimer=0;hideDisconnect();
    const me=localLobbyPlayer();if(me)me.connected=true;
    if(r.state==='lobby')renderLobby();
    // Ask for an authoritative lobby/game snapshot immediately. This removes the
    // race where the DataChannel is connected but the guest still has its local
    // pre-connection roster (connected:false), which previously broke READY.
    if(r.state==='game')r.guestSession?.send({t:'snapshotRequest'});else r.guestSession?.send({t:'lobbyRequest'});
    setStatus($('[data-join-status]'),'Connected to Host ✓',false,true);sfx('join');if(r.voiceRoomEnabled)setTimeout(()=>r.guestSession?.send({t:'voiceNeedOffer'}),180);updateVoiceUi();
  }

  function guestDisconnected(){closeGuestVoicePeer();if(r.closing||!r.open)return;if(r.state==='game'){showDisconnect('Host connection lost. Reconnecting…','Your seat and hand are reserved during the reconnect window.');scheduleGuestReconnect();}else setStatus($('[data-join-status]'),'Connection lost. Rejoin using the same room code.',true);}

  function scheduleGuestReconnect(reason='') {
    if(!r.open||!isGuest()||!r.roomCode||r.reconnecting)return;
    r.reconnecting=true;let started=Date.now();
    const attempt=async()=>{
      if(!r.open||!isGuest()||r.guestSession?.connected){r.reconnecting=false;return;}
      if(Date.now()-started>RECONNECT_GRACE_MS){r.reconnecting=false;showDisconnect('Reconnect window ended.',reason||'The Host may replace your seat with a bot. Return home and rejoin a new match.');return;}
      if(r.guestSession&&!r.guestSession.connected){r.reconnecting=true;r.reconnectTimer=setTimeout(attempt,1400);return;}
      try{r.reconnecting=false;await joinRoom(r.roomCode,true);}catch(_){};
      if(!r.guestSession?.connected){r.reconnecting=true;r.reconnectTimer=setTimeout(attempt,2600);}
    };r.reconnectTimer=setTimeout(attempt,900);
  }

  function handleHostMessage(msg) {
    if(!msg)return;
    if(msg.t==='welcome'){
      r.localSeat=Number(msg.seat??r.localSeat);setVoiceMicState(r.localSeat,voice.micOn);r.maxPlayers=Number(msg.maxPlayers||r.maxPlayers);r.mode=msg.mode==='classic'?'classic':'quick';r.houseRules=normalizeHouseRules(msg.houseRules);r.voiceRoomEnabled=msg.voiceEnabled===true;
      if(Array.isArray(msg.players))applyGuestLobbyPlayers(msg.players,r.localSeat);
      if(msg.state==='game'){show('game');}else{enterLobby();}if(r.voiceRoomEnabled){prepareVoicePlayback();r.guestSession?.send({t:'voiceNeedOffer'});}updateVoiceUi();
    }else if(msg.t==='lobby'){
      r.maxPlayers=Number(msg.maxPlayers||r.maxPlayers);r.mode=msg.mode==='classic'?'classic':'quick';r.houseRules=normalizeHouseRules(msg.houseRules);r.voiceRoomEnabled=msg.voiceEnabled===true;applyGuestLobbyPlayers(msg.players,r.localSeat);renderLobby();if(r.voiceRoomEnabled)r.guestSession?.send({t:'voiceNeedOffer'});
    }else if(msg.t==='readyAck'){const me=localLobbyPlayer();if(me){me.ready=!!msg.ready;me.connected=true;}renderLobby();
    }else if(msg.t==='start'){r.guestPublic=msg.public||null;r.guestPrivate=msg.private||null;show('game');syncLocalRender(true);sfx('join');}
    else if(msg.t==='state'){applyGuestState(msg.public,msg.private);}
    else if(msg.t==='actionError'){r.busyAction=false;toast(msg.message||'That move is no longer available.',2200);sfx('error');if(msg.public)applyGuestState(msg.public,msg.private);}
    else if(msg.t==='voiceOffer'&&r.voiceRoomEnabled){guestAcceptVoiceOffer(msg.desc);}
    else if(msg.t==='voiceSpeak'){setVoiceSpeaking(Number(msg.seat),msg.speaking===true);}
    else if(msg.t==='voiceMicState'){setVoiceMicState(Number(msg.seat),msg.on===true);}
    else if(msg.t==='voiceHostMute'){voice.hostMuteAll=msg.on===true;updateVoiceUi();}
    else if(msg.t==='exit'){showDisconnect('The Host ended the room.','This live match is closed.');}
  }

  function applyGuestState(pub,priv){if(!pub||!priv)return;if(r.guestPublic&&Number(pub.revision)<Number(r.guestPublic.revision))return;r.guestPublic=pub;r.guestPrivate=priv;r.busyAction=false;syncLocalRender();}

  async function sendStudentInvite() {
    const input=$('[data-target-student]'),status=$('[data-host-room-status]'),button=$('[data-send-student]'),target=String(input?.value||'').trim();
    if(!target){setStatus(status,'Enter a Student ID first.',true);return;}button.disabled=true;button.textContent='SENDING…';
    try{const sent=await r.bridge.createTwoPlayerInvite({gameId:GAME_ID,targetStudentId:target,offerCode:`${PREFIX}.${r.roomCode}`,hostName:r.players[0]?.name||identity().name});setStatus(status,`Invite sent to ${sent.targetStudentId||target}.`,false,true);input.value='';}
    catch(error){setStatus(status,error?.message||'Could not send the invite.',true);}finally{button.disabled=false;button.textContent='SEND';}
  }

  async function refreshInvites(force=false) {
    if(!r.bridge?.listTwoPlayerInvites||!identity().loggedIn)return;
    try{const result=await r.bridge.listTwoPlayerInvites({gameId:GAME_ID});r.pendingInvites=Array.isArray(result?.invites)?result.invites:[];renderInvites();}
    catch(error){if(force){$('[data-invites-wrap]').hidden=false;$('[data-invite-list]').innerHTML=`<div class="uno-invite-empty error">${esc(error?.message||'Could not load invites.')}</div>`;}}
  }

  function renderInvites(){const wrap=$('[data-invites-wrap]'),list=$('[data-invite-list]');if(!wrap||!list)return;wrap.hidden=false;if(!r.pendingInvites.length){list.innerHTML='<div class="uno-invite-empty">No pending UNO invites.</div>';return;}list.innerHTML=r.pendingInvites.map(inv=>`<article class="uno-invite-card"><div><strong>${esc(inv.fromName||'Student')}</strong><small>${esc(inv.fromStudentId||'')}</small><p>invited you to room <b>${esc(String(inv.offerCode||'').split('.').pop()||'')}</b></p></div><div><button type="button" data-accept-invite="${esc(inv.inviteId)}">ACCEPT</button><button type="button" data-decline-invite="${esc(inv.inviteId)}">DECLINE</button></div></article>`).join('');}

  function startInvitePolling(){clearTimeout(r.inviteTimer);const poll=async()=>{if(!r.open||r.state!=='join')return;await refreshInvites(false);if(r.open&&r.state==='join'){const hidden=document.visibilityState==='hidden';r.inviteTimer=setTimeout(poll,hidden?12000:(r.pendingInvites.length?INVITE_ACTIVE_MS:INVITE_IDLE_MS));}};r.inviteTimer=setTimeout(poll,650);}

  async function handleInviteListClick(event){const accept=event.target.closest('[data-accept-invite]'),decline=event.target.closest('[data-decline-invite]');if(accept){const inv=r.pendingInvites.find(x=>x.inviteId===accept.dataset.acceptInvite);if(!inv)return;try{await r.bridge.respondTwoPlayerInvite({gameId:GAME_ID,inviteId:inv.inviteId,hostUid:inv.fromUid,status:'accepted',answerCode:`${PREFIX}.ROOM`});r.pendingInvites=r.pendingInvites.filter(x=>x!==inv);renderInvites();await joinRoom(String(inv.offerCode||'').split('.').pop());}catch(error){setStatus($('[data-join-status]'),error?.message||'Could not accept invite.',true);}}else if(decline){const inv=r.pendingInvites.find(x=>x.inviteId===decline.dataset.declineInvite);if(!inv)return;try{await r.bridge.respondTwoPlayerInvite({gameId:GAME_ID,inviteId:inv.inviteId,hostUid:inv.fromUid,status:'declined'});}catch(_){}r.pendingInvites=r.pendingInvites.filter(x=>x!==inv);renderInvites();}}

  function scanRoom(){if(!P()?.openScanner){setStatus($('[data-join-status]'),'QR scanner is unavailable. Enter the room code instead.',true);return;}closeScanner();const modal=$('[data-scanner]'),video=$('[data-scan-video]');modal.hidden=false;$('[data-scan-status]').textContent='Point the camera at the Host QR.';P().openScanner({video,acceptPrefix:ROOM_QR_PREFIX,onCode:value=>{closeScanner();joinRoom(String(value).slice(ROOM_QR_PREFIX.length));}}).then(stop=>{r.scannerStop=stop;}).catch(error=>{$('[data-scan-status]').textContent=error?.message||'Could not open camera.';});}
  function closeScanner(){try{r.scannerStop?.();}catch(_){}r.scannerStop=null;if($('[data-scanner]'))$('[data-scanner]').hidden=true;}

  function toggleReady(){
    if(isGuest()&&!r.guestSession?.connected){toast('Still connecting to the Host…',1800);return;}
    const p=localLobbyPlayer();
    if(!p){toast('Syncing your lobby seat…',1800);r.guestSession?.send({t:'lobbyRequest'});return;}
    const previous=!!p.ready,next=!previous;p.ready=next;p.connected=true;renderLobby();
    if(isHost()){broadcastLobby();return;}
    const sent=r.guestSession?.send({t:'ready',value:next});
    if(!sent){p.ready=previous;renderLobby();toast('Connection is not ready yet.',1800);sfx('error');}
  }

  function startLiveGame(){if(!isHost())return;const connected=r.players.filter(p=>p.connected).sort((a,b)=>a.seat-b.seat);if(connected.length<2||!connected.every(p=>p.ready))return;compactLobbySeats();const gamePlayers=connected.map((p,index)=>({uid:p.uid,studentId:p.studentId,name:p.name,bot:false,connected:true}));r.game=E().createMatch({players:gamePlayers,mode:r.mode,targetScore:r.targetScore,houseRules:r.houseRules});r.players=connected.map((p,index)=>({...p,seat:index}));r.seatByUid.clear();r.players.forEach(p=>r.seatByUid.set(p.uid,p.seat));for(const peer of r.peers.values())peer.seat=r.seatByUid.get(peer.uid);stopHostSignalPolling();show('game');broadcast({t:'start'});syncAll(true);updateVoiceUi();sfx('join');r.bridge.touchCodeUnoRoom({roomCode:r.roomCode,status:'playing',meta:r.roomMeta}).then(meta=>{if(meta)r.roomMeta=meta;}).catch(()=>{});scheduleAutomation();}

  function sendStateToPeer(peer){if(!peer?.connected||!r.game)return;peer.session.send({t:'state',public:E().publicSnapshot(r.game),private:E().privateSnapshot(r.game,peer.seat)});}

  function syncAll(force=false){if(!r.game)return;const pub=E().publicSnapshot(r.game);for(const peer of r.peers.values())if(peer.connected)peer.session.send({t:'state',public:pub,private:E().privateSnapshot(r.game,peer.seat)});syncLocalRender(force);}

  function performLocalAction(action){if(r.busyAction)return;const view=currentView();if(!view?.public||!view?.private)return;if(isGuest()){r.busyAction=true;renderControls(view);const sent=r.guestSession?.send({t:'action',action,revision:Number(view.public.revision||0)});if(!sent){r.busyAction=false;toast('Connection is not ready.',1800);sfx('error');}else setTimeout(()=>{if(r.busyAction){r.busyAction=false;renderGame();}},2200);}else processHostAction(r.localSeat,action,Number(view.public.revision||0),null);}

  function processHostAction(seat,action,expectedRevision=null,peer=null){if(!r.game)return;if(expectedRevision!=null&&Number(expectedRevision)!==Number(r.game.revision)){if(peer)sendStateToPeer(peer);return;}try{E().act(r.game,seat,action);E().validateState(r.game,{throwOnError:true});r.busyAction=false;syncAll();playEventSfx(E().publicSnapshot(r.game).lastEvent);scheduleAutomation();}catch(error){if(peer){peer.session.send({t:'actionError',message:String(error?.message||'Move rejected.'),public:E().publicSnapshot(r.game),private:E().privateSnapshot(r.game,peer.seat)});}else{toast(error?.message||'That move is not available.',1800);sfx('error');}syncLocalRender();}}

  function startNextRound(){if(!r.game||r.game.phase!=='round-over'||(!isSolo()&&!isHost()))return;try{E().startNextRound(r.game);syncAll(true);scheduleAutomation();}catch(error){toast(error?.message||'Could not start the next round.',1800);}}

  function playAgain(){if(isSolo()){startSolo();return;}if(isHost()){r.game=null;r.players.forEach((p,index)=>{p.seat=index;p.ready=index===0;p.connected=true;});show('lobby');renderLobby();broadcastLobby();startHostSignalLoop();r.bridge.touchCodeUnoRoom({roomCode:r.roomCode,status:'lobby',meta:r.roomMeta}).then(meta=>{if(meta)r.roomMeta=meta;}).catch(()=>{});}else{toast('Wait for the Host to start another match.');}}

  function playEventSfx(event){if(!event)return;if(event.type==='playCard')sfx(event.card?.type?.startsWith('wild')?'wild':'play');else if(event.type==='drawOne'||event.type==='drawPass'||event.type==='drawPenalty'||event.type==='wild4Accepted')sfx('draw');else if(event.type==='skip')sfx('skip');else if(event.type==='reverse')sfx('reverse');else if(event.type==='unoCalled'||event.type==='unoPrimed'||event.type==='unoCaught')sfx('uno');else if(event.type==='matchOver'||event.type==='roundOver')sfx('win');}

  function scheduleAutomation(){clearTimeout(r.botTimer);r.botTimer=0;if(!r.game||(r.game.phase==='match-over'||r.game.phase==='round-over'))return;
    // Any bot may catch a vulnerable UNO before the next turn action begins.
    if(r.game.unoVulnerableSeat!=null){const target=r.game.unoVulnerableSeat;const catcher=r.game.players.find(p=>p.seat!==target&&(p.bot||p.botTakeover));if(catcher){const chance=catcher.botLevel==='easy'?.42:catcher.botLevel==='hard'?.97:.82;if(Math.random()<chance){r.botTimer=setTimeout(()=>{try{E().act(r.game,catcher.seat,{type:'catch-uno',targetSeat:target});syncAll();sfx('uno');scheduleAutomation();}catch(_){scheduleAutomation();}},380);return;}}}
    const seat=r.game.turnSeat,player=r.game.players.find(p=>p.seat===seat);if(!player||(player.bot!==true&&player.botTakeover!==true))return;const delay=player.botLevel==='hard'?520:player.botLevel==='easy'?760:620;r.botTimer=setTimeout(()=>{if(!r.game)return;try{const pub=E().publicSnapshot(r.game),priv=E().privateSnapshot(r.game,seat),action=E().chooseBotAction(pub,priv,player.botLevel||'normal',Math.random);if(action.type!=='noop'){E().act(r.game,seat,action);E().validateState(r.game,{throwOnError:true});syncAll();playEventSfx(E().publicSnapshot(r.game).lastEvent);}scheduleAutomation();}catch(error){console.warn('UNO bot action failed',error);r.botTimer=setTimeout(scheduleAutomation,500);}},delay);}

  function syncLocalRender(force=false){if(r.state!=='game')return;renderGame(force);}

  function renderGame(force=false){const view=currentView(),pub=view.public,priv=view.private;if(!pub||!priv)return;const previous=r.lastPublic;if(previous&&(Number(previous.round)!==Number(pub.round)||(previous.phase==='match-over'&&pub.phase==='turn')))r.discardHistory=[];const source=transitionSourceRect(previous,pub);renderHud(pub,priv);renderOpponents(pub);renderCenter(pub);renderHand(pub,priv);renderControls(view);renderChoices(pub,priv);renderResult(pub);if(force||Number(pub.revision)!==r.lastRenderedRevision){animateTransition(previous,pub,source);r.lastRenderedRevision=Number(pub.revision||0);r.lastPublic=JSON.parse(JSON.stringify(pub));r.lastTopCardId=pub.topCard?.id||'';r.lastEventSeq=Number(pub.eventSeq||0);}}

  function renderHud(pub,priv){const me=pub.players.find(p=>p.seat===r.localSeat),turn=pub.players.find(p=>p.seat===pub.turnSeat);$('[data-you-name]').textContent=me?.name||'PLAYER';$('[data-you-cards]').textContent=`${me?.handCount||priv.hand.length} CARD${(me?.handCount||priv.hand.length)===1?'':'S'}`;const banner=$('[data-turn-banner]');let text='';if(pub.phase==='choose-color'&&pub.pending?.actorSeat===r.localSeat)text='CHOOSE A COLOR';else if(pub.phase==='wild4-challenge'&&pub.pending?.targetSeat===r.localSeat)text='+4 DECISION';else if(pub.phase==='choose-swap'&&pub.pending?.actorSeat===r.localSeat)text='CHOOSE A PLAYER';else if(pub.phase==='draw2-stack'&&pub.turnSeat===r.localSeat)text=`STACK +2 OR TAKE ${pub.pending?.total||2}`;else if(pub.phase==='round-over')text='ROUND OVER';else if(pub.phase==='match-over')text='MATCH OVER';else if(pub.turnSeat===r.localSeat)text='YOUR TURN';else text=`${String(turn?.name||'PLAYER').toUpperCase()}'S TURN`;banner.textContent=text;banner.classList.toggle('mine',pub.turnSeat===r.localSeat&&['turn','draw2-stack'].includes(pub.phase));const cm=COLOR_META[pub.currentColor]||COLOR_META.red;$('[data-color-chip]').textContent=`${cm.icon} ${cm.label}`;$('[data-color-chip]').dataset.color=pub.currentColor;$('[data-direction]').textContent=pub.direction===-1?'↺ COUNTER-CLOCKWISE':'↻ CLOCKWISE';$('[data-round-chip]').textContent=pub.mode==='classic'?`ROUND ${pub.round} · TO ${pub.targetScore}`:`ROUND ${pub.round}`;const house=$('[data-house-chip]'),items=houseRuleItems(pub.houseRules);if(house){house.hidden=!items.length;house.textContent=items.length?`HOUSE ${items.length}`:'HOUSE';house.title=items.join(' · ');}const vc=$('[data-voice-game-chip]');if(vc){vc.hidden=!r.voiceRoomEnabled;vc.textContent=voice.micOn?'🎙 MIC ON':'🎙 VOICE';vc.classList.toggle('active',voice.micOn);}const table=$('[data-table]');table.dataset.color=pub.currentColor;updateVoiceUi();updateVoiceIndicators();}

  function renderOpponents(pub){const wrap=$('[data-opponents]');const others=pub.players.filter(p=>p.seat!==r.localSeat);const n=Math.max(1,others.length);wrap.innerHTML=others.map((p,i)=>{const t=n===1?.5:i/(n-1);const angle=Math.PI*(1.08+0.84*t);const x=50+44*Math.cos(angle),y=55+42*Math.sin(angle);const turn=p.seat===pub.turnSeat;const danger=p.handCount===1?'uno-danger':p.handCount===2?'danger-two':'';const warning=p.handCount===1?(p.unoCalled?'UNO!':'UNO DANGER'):p.handCount===2?'2 LEFT':'';return `<div class="uno-opponent ${turn?'turn':''} ${p.connected?'':'offline'} ${p.bot||p.botTakeover?'bot':''} ${danger}" data-seat-avatar="${p.seat}" style="--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%"><span class="uno-op-avatar">${esc((p.name||'?').charAt(0).toUpperCase())}</span><div class="uno-op-copy"><strong>${esc(p.name)}${p.botTakeover?' 🤖':''}</strong><small>${p.handCount} CARD${p.handCount===1?'':'S'}</small>${warning?`<em class="uno-op-warning">${esc(warning)}</em>`:''}</div><span class="uno-op-stack"><i></i><b>${p.handCount}</b></span><i class="uno-op-mic" data-voice-seat-mic="${p.seat}" hidden>🎙</i></div>`;}).join('');updateVoiceIndicators();}

  function visualPileFor(topCard){
    if(!topCard)return [];
    const topId=String(topCard.id||'');
    const last=r.discardHistory[r.discardHistory.length-1];
    if(!last||String(last.id||'')!==topId){r.discardHistory.push({...topCard});if(r.discardHistory.length>5)r.discardHistory.splice(0,r.discardHistory.length-5);}
    return r.discardHistory.slice(-5);
  }

  function pileTransform(card,index,total){
    const text=String(card?.id||index);let h=0;for(let i=0;i<text.length;i++)h=(h*31+text.charCodeAt(i))|0;
    const depth=total-1-index;const rot=((Math.abs(h)%11)-5)*.72;const x=((Math.abs(h>>3)%7)-3)*1.25;const y=depth*1.8+((Math.abs(h>>6)%5)-2)*.55;
    return `--pile-rot:${rot.toFixed(2)}deg;--pile-x:${x.toFixed(1)}px;--pile-y:${y.toFixed(1)}px;--pile-z:${index+1};--pile-depth:${depth};`;
  }

  function renderCenter(pub){const discard=$('[data-discard]');$('[data-draw-count]').textContent=String(pub.drawCount);if(discard){const pile=visualPileFor(pub.topCard);discard.innerHTML=pile.map((card,index)=>`<div class="uno-discard-layer ${index===pile.length-1?'top':''}" style="${pileTransform(card,index,pile.length)}">${cardHtml(card)}</div>`).join('');discard.dataset.cardId=String(pub.topCard?.id||'');}const status=$('[data-center-status]');if(pub.phase==='wild4-challenge'){const offender=pub.players.find(p=>p.seat===pub.pending?.offenderSeat);const target=pub.players.find(p=>p.seat===pub.pending?.targetSeat);status.innerHTML=`<b>+4 CHALLENGE</b><span>${esc(target?.name||'Player')} decides against ${esc(offender?.name||'Player')}</span>`;}else if(pub.phase==='draw2-stack'){const target=pub.players.find(p=>p.seat===pub.pending?.targetSeat);status.innerHTML=`<b>+${pub.pending?.total||2} STACK</b><span>${esc(target?.name||'Player')} can stack a +2 or take the cards</span>`;}else if(pub.phase==='choose-swap'){const actor=pub.players.find(p=>p.seat===pub.pending?.actorSeat);status.innerHTML=`<b>7–0 SWAP</b><span>${esc(actor?.name||'Player')} chooses a hand</span>`;}else if(pub.unoVulnerableSeat!=null){const p=pub.players.find(x=>x.seat===pub.unoVulnerableSeat);status.innerHTML=`<b>UNO WINDOW!</b><span>${esc(p?.name||'Player')} forgot to call UNO</span>`;}else{status.innerHTML=`<b>${(COLOR_META[pub.currentColor]||COLOR_META.red).label}</b><span>${pub.direction===-1?'Counter-clockwise':'Clockwise'} · ${pub.drawCount} in draw pile</span>`;}}

  function updateHandRailControls(hand=$('[data-hand]')){if(!hand)return;const max=Math.max(0,hand.scrollWidth-hand.clientWidth),overflow=max>6;const prev=$('[data-hand-prev]'),next=$('[data-hand-next]');if(prev){prev.hidden=!overflow;prev.disabled=!overflow||hand.scrollLeft<=4;}if(next){next.hidden=!overflow;next.disabled=!overflow||hand.scrollLeft>=max-4;}hand.classList.toggle('has-overflow',overflow);}
  function scrollHandRail(direction){const hand=$('[data-hand]');if(!hand)return;const amount=Math.max(130,Math.round(hand.clientWidth*.68));hand.scrollBy({left:(direction<0?-amount:amount),behavior:'smooth'});setTimeout(()=>updateHandRailControls(hand),260);}
  function updateHandLayout(hand,count){if(!hand)return;const cards=[...hand.querySelectorAll('.uno-card')];const n=Math.max(1,Number(count||cards.length||1));const mobile=window.matchMedia?.('(max-width: 820px)')?.matches===true;const narrow=window.matchMedia?.('(max-width: 430px)')?.matches===true;const shortLandscape=window.matchMedia?.('(orientation: landscape) and (max-height: 620px)')?.matches===true;const cardWidth=shortLandscape?60:(narrow?68:(mobile?72:86));const railWidth=hand.clientWidth||window.visualViewport?.width||window.innerWidth||760;const usable=Math.max(210,railWidth-(mobile?24:42));const idealGap=mobile?6:9;const comfortableStep=cardWidth+idealGap;const fitStep=n<=1?cardWidth:(usable-cardWidth)/Math.max(1,n-1);const readableFloor=narrow?44:(mobile?48:56);const step=Math.max(readableFloor,Math.min(comfortableStep,fitStep));const gap=Math.round(step-cardWidth);const total=cardWidth+(n-1)*step;const scrolling=total>usable+2;hand.style.setProperty('--uno-hand-card-width',`${cardWidth}px`);hand.style.setProperty('--uno-hand-gap',`${gap}px`);hand.classList.toggle('scrolling',scrolling);hand.classList.toggle('crowded',n>=12);const mid=(n-1)/2;cards.forEach((card,index)=>{const d=mid?((index-mid)/mid):0;const maxRot=scrolling?1.2:3.0;card.style.setProperty('--fan-rot',`${(d*maxRot).toFixed(2)}deg`);card.style.setProperty('--fan-lift',`${Math.round(Math.abs(d)*(scrolling?1:3))}px`);card.style.zIndex=String(index+1);card.style.scrollSnapAlign=mobile?'none':'center';});requestAnimationFrame(()=>updateHandRailControls(hand));}

  function renderHand(pub,priv){const hand=$('[data-hand]'),actions=priv.actions||{};if(!hand)return;const oldMax=Math.max(0,hand.scrollWidth-hand.clientWidth),oldLeft=hand.scrollLeft,oldAtEnd=oldMax>0&&oldMax-oldLeft<18;const cards=sortedHand(priv.hand||[]);hand.innerHTML=cards.map(card=>{const playable=(actions.canPlayIds||[]).includes(card.id);const disabled=!playable||r.busyAction;return cardHtml(card,{button:true,playable,drawn:actions.drawnCardId===card.id,disabled})}).join('');hand.style.setProperty('--card-count',String(cards.length||1));updateHandLayout(hand,cards.length);requestAnimationFrame(()=>{const nextMax=Math.max(0,hand.scrollWidth-hand.clientWidth);if(oldMax>0)hand.scrollLeft=oldAtEnd?nextMax:Math.min(oldLeft,nextMax);updateHandRailControls(hand);});const sort=$('[data-sort]');if(sort)sort.textContent=`SORT: ${handSortLabel()}`;}

  function renderControls(view=currentView()){const pub=view.public,priv=view.private;if(!pub||!priv)return;const actions=priv.actions||{};const draw=$('[data-draw]'),keep=$('[data-keep]'),uno=$('[data-uno]'),catchBtn=$('[data-catch]'),pile=$('[data-draw-pile]'),sort=$('[data-sort]');draw.disabled=r.busyAction||!actions.canDraw;draw.textContent=actions.stackTotal?`TAKE +${actions.stackTotal}`:(pub.houseRules?.drawUntilPlayable?'DRAW UNTIL':'DRAW');pile.disabled=draw.disabled;keep.hidden=!actions.canPass;keep.disabled=r.busyAction||!actions.canPass;uno.disabled=r.busyAction||!actions.canCallUno;uno.classList.toggle('hot',!!actions.canCallUno);uno.textContent=actions.unoPrimed?'UNO ✓':'UNO!';catchBtn.hidden=actions.catchableSeat==null;catchBtn.disabled=r.busyAction||actions.catchableSeat==null;if(sort){sort.disabled=false;sort.textContent=`SORT: ${handSortLabel()}`;}}

  function renderChoices(pub,priv){const actions=priv.actions||{};$('[data-color-modal]').hidden=!actions.canChooseColor;$('[data-challenge-modal]').hidden=!actions.canAcceptWild4;const swap=$('[data-swap-modal]'),list=$('[data-swap-list]');if(swap){swap.hidden=!actions.canChooseSwap;if(actions.canChooseSwap&&list){list.innerHTML=(actions.swapTargets||[]).map(seat=>{const player=pub.players.find(p=>p.seat===seat);return `<button type="button" data-swap-seat="${seat}"><span>${esc((player?.name||'?').charAt(0).toUpperCase())}</span><b>${esc(player?.name||`PLAYER ${seat+1}`)}</b><small>${player?.handCount||0} CARDS</small></button>`;}).join('');}}}
  function hideChoiceModals(){if($('[data-color-modal]'))$('[data-color-modal]').hidden=true;if($('[data-challenge-modal]'))$('[data-challenge-modal]').hidden=true;if($('[data-swap-modal]'))$('[data-swap-modal]').hidden=true;if($('[data-result]'))$('[data-result]').hidden=true;}

  function launchVictoryCelebration(mine=false){const modal=$('[data-result]');if(!modal)return;modal.querySelectorAll('.uno-victory-particle').forEach(el=>el.remove());const count=mine?34:22;for(let i=0;i<count;i++){const particle=document.createElement('i');particle.className='uno-victory-particle';particle.style.setProperty('--x',`${8+Math.random()*84}%`);particle.style.setProperty('--delay',`${(Math.random()*.45).toFixed(2)}s`);particle.style.setProperty('--dur',`${(1.6+Math.random()*1.2).toFixed(2)}s`);particle.style.setProperty('--rot',`${Math.round(Math.random()*540-270)}deg`);particle.style.setProperty('--hue',`${Math.floor(Math.random()*4)*90}deg`);modal.appendChild(particle);}const result=modal.querySelector('[data-result-card]');result?.classList.remove('celebrate');void result?.offsetWidth;result?.classList.add('celebrate');setTimeout(()=>result?.classList.remove('celebrate'),1500);}

  function statsHtml(pub){if(!Array.isArray(pub.matchStats))return '';const statsBySeat=new Map(pub.matchStats.map(item=>[Number(item.seat),item]));return `<section class="uno-match-stats"><div class="uno-stats-head"><b>MATCH STATS</b><small>${formatDuration(pub.matchDurationMs)} · ${houseRuleLabel(pub.houseRules)}</small></div><div class="uno-stats-table">${pub.players.map(player=>{const st=statsBySeat.get(Number(player.seat))||{};const challenge=Number(st.challengesWon||0)+Number(st.challengesLost||0);return `<article class="${player.seat===r.localSeat?'you':''} ${player.seat===(pub.matchWinnerSeat??pub.roundWinnerSeat)?'winner':''}"><header><strong>${esc(player.name)}</strong>${player.seat===(pub.matchWinnerSeat??pub.roundWinnerSeat)?'<em>🏆</em>':''}</header><div><span><b>${st.cardsPlayed||0}</b><small>PLAYED</small></span><span><b>${st.cardsDrawn||0}</b><small>DRAWN</small></span><span><b>${st.actionCardsPlayed||0}</b><small>ACTIONS</small></span><span><b>${st.unoCalls||0}</b><small>UNO</small></span><span><b>${st.unoCatches||0}</b><small>CATCHES</small></span><span><b>${challenge?`${st.challengesWon||0}/${challenge}`:'—'}</b><small>CHALLENGE</small></span><span><b>${st.maxHand||7}</b><small>MAX HAND</small></span><span><b>${st.roundsWon||0}</b><small>ROUNDS</small></span></div></article>`;}).join('')}</div></section>`;}

  function renderResult(pub){const modal=$('[data-result]'),card=$('[data-result-card]');if(!modal||!card)return;if(pub.phase!=='round-over'&&pub.phase!=='match-over'){modal.hidden=true;return;}const winner=pub.players.find(p=>p.seat===(pub.matchWinnerSeat??pub.roundWinnerSeat));const mine=winner?.seat===r.localSeat;const scores=pub.mode==='classic'?`<div class="uno-score-list">${pub.players.slice().sort((a,b)=>b.score-a.score).map(p=>`<span><b>${esc(p.name)}</b><em>${p.score}</em></span>`).join('')}</div>`:'';const nextAllowed=(isSolo()||isHost())&&pub.phase==='round-over';const replayAllowed=isSolo()||isHost();const title=pub.phase==='match-over'?(mine?'CHAMPION!':`${esc(winner?.name||'PLAYER')} WINS!`):(mine?'ROUND WINNER!':`${esc(winner?.name||'PLAYER')} WINS THE ROUND`);card.innerHTML=`<div class="uno-victory-crown">${pub.phase==='match-over'?'🏆':'★'}</div><span>${pub.phase==='match-over'?'MATCH COMPLETE':'ROUND COMPLETE'}</span><h2>${title}</h2><p>${pub.roundPoints?`+${pub.roundPoints} round points`:'First hand emptied.'}</p>${scores}${statsHtml(pub)}<div class="uno-result-actions">${nextAllowed?'<button data-next-round>START NEXT ROUND</button>':''}${pub.phase==='match-over'&&replayAllowed?'<button data-play-again>PLAY AGAIN</button>':''}<button data-result-home>HOME</button></div>`;modal.hidden=false;const key=`${pub.phase}:${pub.round}:${pub.matchWinnerSeat??pub.roundWinnerSeat}:${pub.eventSeq}`;if(r.lastCelebratedResultKey!==key){r.lastCelebratedResultKey=key;launchVictoryCelebration(mine);}}

  function transitionSourceRect(prev,pub){if(!prev||prev.topCard?.id===pub.topCard?.id)return null;const ev=pub.lastEvent||{};const actor=ev.seat??ev.sourceSeat??ev.offenderSeat;let el=null;if(actor===r.localSeat&&pub.topCard?.id){try{el=document.querySelector(`[data-hand] [data-card-id="${CSS.escape(String(pub.topCard.id))}"]`);}catch(_){el=null;}}if(!el&&actor===r.localSeat)el=$('[data-hand]');if(!el&&actor!=null)el=$(`[data-seat-avatar="${actor}"]`);const rect=el?.getBoundingClientRect?.();return rect?{x:rect.left+rect.width/2,y:rect.top+rect.height/2,width:rect.width,height:rect.height}:null;}

  function rectCenter(rect){return rect?{x:rect.left+rect.width/2,y:rect.top+rect.height/2}:{x:innerWidth/2,y:innerHeight/2};}

  function animateCardFlight(card,start,dest,serial){const fly=document.createElement('div');fly.className='uno-fly-card';fly.innerHTML=cardHtml(card);fly.style.left=`${start.x}px`;fly.style.top=`${start.y}px`;document.body.appendChild(fly);const end=rectCenter(dest),dx=end.x-start.x,dy=end.y-start.y;const arc=Math.min(125,Math.max(54,Math.abs(dy)*.30+38));const spin=(Math.random()-.5)*18;const frames=[{transform:'translate(-50%,-50%) scale(.92) rotate(0deg)',opacity:1},{transform:`translate(-50%,-50%) translate(${(dx*.48).toFixed(1)}px,${(dy*.48-arc).toFixed(1)}px) scale(1.12) rotate(${(spin*.55).toFixed(1)}deg)`,opacity:1,offset:.52},{transform:`translate(-50%,-50%) translate(${(dx*1.025).toFixed(1)}px,${(dy*1.025-4).toFixed(1)}px) scale(1.04) rotate(${(spin*1.08).toFixed(1)}deg)`,opacity:1,offset:.88},{transform:`translate(-50%,-50%) translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(1) rotate(${spin.toFixed(1)}deg)`,opacity:1}];const finish=()=>{fly.remove();const discard=$('[data-discard]');if(!discard||discard.dataset.flightSerial!==String(serial))return;delete discard.dataset.flightSerial;discard.classList.remove('incoming');discard.classList.remove('landed');void discard.offsetWidth;discard.classList.add('landed');setTimeout(()=>discard.classList.remove('landed'),360);};if(typeof fly.animate==='function'){const anim=fly.animate(frames,{duration:640,easing:'cubic-bezier(.18,.82,.22,1)',fill:'forwards'});anim.onfinish=finish;anim.oncancel=()=>fly.remove();}else{fly.style.transition='transform .62s cubic-bezier(.18,.82,.22,1),opacity .62s';requestAnimationFrame(()=>{fly.style.transform=`translate(-50%,-50%) translate(${dx}px,${dy}px) rotate(${spin}deg)`;fly.style.opacity='1';});setTimeout(finish,650);}}

  function animateTurnTransition(prev,pub){
    if(!prev||prev.turnSeat===pub.turnSeat||pub.phase!=='turn')return;
    clearTimeout(r.turnVisualTimer);
    const table=$('[data-table]'),target=pub.turnSeat===r.localSeat?$('[data-turn-banner]'):$(`[data-seat-avatar="${pub.turnSeat}"]`);
    target?.classList.remove('turn-arrival');void target?.offsetWidth;target?.classList.add('turn-arrival');
    const player=pub.players.find(p=>p.seat===pub.turnSeat);
    if(table){const chip=document.createElement('div');chip.className=`uno-turn-toast${pub.turnSeat===r.localSeat?' mine':''}`;chip.textContent=pub.turnSeat===r.localSeat?'YOUR TURN':`${String(player?.name||'PLAYER').toUpperCase()}'S TURN`;table.appendChild(chip);setTimeout(()=>chip.classList.add('show'),20);setTimeout(()=>{chip.classList.remove('show');setTimeout(()=>chip.remove(),180);},700);}
    r.turnVisualTimer=setTimeout(()=>target?.classList.remove('turn-arrival'),900);
  }

  function animateColorWave(prev,pub){
    if(!prev||(prev.currentColor===pub.currentColor&&pub.lastEvent?.type!=='chooseColor'))return;
    const table=$('[data-table]');if(!table)return;
    table.style.setProperty('--uno-wave',({red:'#ef4444',yellow:'#facc15',green:'#22c55e',blue:'#3b82f6'})[pub.currentColor]||'#fff');
    table.classList.remove('color-wave');void table.offsetWidth;table.classList.add('color-wave');setTimeout(()=>table.classList.remove('color-wave'),720);
    const chip=$('[data-color-chip]');chip?.classList.remove('color-pop');void chip?.offsetWidth;chip?.classList.add('color-pop');setTimeout(()=>chip?.classList.remove('color-pop'),520);
  }

  function animateTransition(prev,pub,source){if(!prev)return;const serial=++r.transitionSerial;animateTurnTransition(prev,pub);animateColorWave(prev,pub);if(prev.topCard?.id!==pub.topCard?.id&&pub.topCard){const discard=$('[data-discard]'),dest=discard?.getBoundingClientRect();if(dest){discard.classList.remove('landed');discard.classList.add('incoming');discard.dataset.flightSerial=String(serial);const start=source||{x:innerWidth/2,y:Math.max(90,innerHeight*.24)};animateCardFlight(pub.topCard,start,dest,serial);}}
    const ev=pub.lastEvent;if(!ev||Number(ev.seq)<=r.lastEventSeq)return;if(ev.type==='reverse')flashEffect('↺ REVERSE','reverse');else if(ev.type==='skip')flashEffect('⊘ SKIPPED','skip');else if(ev.type==='drawPenalty')flashEffect(`+${Number(ev.count||2)} DRAW`,'draw');else if(ev.type==='wild4Accepted'||ev.type==='wild4Challenge')flashEffect(ev.successful?'CHALLENGE WON!':ev.type==='wild4Accepted'?'+4 DRAW': 'CHALLENGE LOST','draw');else if(ev.type==='unoCalled'||ev.type==='unoPrimed')flashEffect('UNO!','uno');else if(ev.type==='unoCaught')flashEffect('CAUGHT! +2','catch');else if(ev.type==='matchOver'||ev.type==='roundOver')flashEffect('ROUND!','win');
    animateDrawEvent(ev,pub,serial);
  }

  function animateDrawEvent(ev,pub,serial){let target=null,count=0;if(ev.type==='drawOne'||ev.type==='drawPass'){target=ev.seat;count=Math.max(1,Number(ev.count||1));}else if(ev.type==='drawPenalty'||ev.type==='wild4Accepted'){target=ev.targetSeat;count=Number(ev.count||0);}else if(ev.type==='unoCaught'){target=ev.targetSeat;count=Number(ev.count||2);}else if(ev.type==='wild4Challenge'){target=ev.successful?ev.offenderSeat:ev.targetSeat;count=Number(ev.count||0);}if(target==null||!count)return;const deckEl=$('[data-draw-pile]'),deck=deckEl?.getBoundingClientRect();const targetEl=target===r.localSeat?$('[data-hand]'):$(`[data-seat-avatar="${target}"]`);const dst=targetEl?.getBoundingClientRect();if(!deck||!dst)return;targetEl?.classList.add('receiving-cards');const start=rectCenter(deck),end=rectCenter(dst),dx=end.x-start.x,dy=end.y-start.y;const shown=Math.min(count,6),stagger=count>=4?112:96;for(let i=0;i<shown;i++){setTimeout(()=>{if(serial!==r.transitionSerial)return;const fly=document.createElement('div');fly.className='uno-fly-back';fly.innerHTML='<span class="uno-card-back"><b>4C</b></span>';fly.style.left=`${start.x}px`;fly.style.top=`${start.y}px`;document.body.appendChild(fly);const spread=(i-(shown-1)/2)*9;const lift=Math.min(110,Math.max(50,Math.abs(dy)*.24+30));const twist=(i-(shown-1)/2)*4;const frames=[{transform:'translate(-50%,-50%) scale(.94) rotate(0deg)',opacity:1},{transform:`translate(-50%,-50%) translate(${(dx*.46+spread*.45).toFixed(1)}px,${(dy*.46-lift).toFixed(1)}px) scale(1.08) rotate(${twist.toFixed(1)}deg)`,opacity:1,offset:.50},{transform:`translate(-50%,-50%) translate(${(dx+spread).toFixed(1)}px,${(dy-3).toFixed(1)}px) scale(.9) rotate(${(twist*1.35).toFixed(1)}deg)`,opacity:.72,offset:.88},{transform:`translate(-50%,-50%) translate(${(dx+spread).toFixed(1)}px,${dy.toFixed(1)}px) scale(.78) rotate(${(twist*1.5).toFixed(1)}deg)`,opacity:.08}];const done=()=>fly.remove();if(typeof fly.animate==='function'){const anim=fly.animate(frames,{duration:560,easing:'cubic-bezier(.18,.78,.23,1)',fill:'forwards'});anim.onfinish=done;anim.oncancel=done;}else{fly.style.transition='transform .54s cubic-bezier(.18,.78,.23,1),opacity .54s';requestAnimationFrame(()=>{fly.style.transform=`translate(-50%,-50%) translate(${dx+spread}px,${dy}px) rotate(${twist*1.5}deg) scale(.78)`;fly.style.opacity='.08';});setTimeout(done,580);}},i*stagger);}setTimeout(()=>targetEl?.classList.remove('receiving-cards'),shown*stagger+620);}

  function flashEffect(text,kind=''){const el=$('[data-effect]');if(!el)return;el.textContent=text;el.className=`uno-effect ${kind} show`;el.hidden=false;setTimeout(()=>{el.classList.remove('show');setTimeout(()=>{el.hidden=true;},180);},820);}

  function showDisconnectForSeat(seat,copy){const p=r.game?.players?.find(x=>x.seat===seat);showDisconnect(`${p?.name||'A player'} disconnected`,copy);}
  function showDisconnect(title,copy=''){const el=$('[data-disconnect]');if(!el)return;$('[data-disconnect-title]').textContent=title;$('[data-disconnect-copy]').textContent=copy;el.hidden=false;}
  function hideDisconnect(){const el=$('[data-disconnect]');if(el)el.hidden=true;}

  async function leaveRoomToHome(){const room=r.roomCode,host=isHost();if(host)broadcast({t:'exit'});else r.guestSession?.send({t:'leave'});clearNetwork();if(room&&r.bridge?.leaveCodeUnoRoom)r.bridge.leaveCodeUnoRoom({roomCode:room,closeRoom:host}).catch(()=>{});r.role='';r.roomCode='';r.roomMeta=null;r.players=[];r.game=null;r.guestPublic=null;r.guestPrivate=null;r.lastPublic=null;r.lastRenderedRevision=-1;r.discardHistory=[];show('home');}


  function voiceSupported(){return !!(window.RTCPeerConnection&&typeof navigator!=='undefined'&&navigator.mediaDevices?.getUserMedia&&(window.AudioContext||window.webkitAudioContext));}
  function prepareVoicePlayback(){
    if(!voiceSupported())return null;
    try{
      voice.ctx ||= new (window.AudioContext||window.webkitAudioContext)();
      if(voice.ctx.state==='suspended')voice.ctx.resume().catch(()=>{});
      if(!voice.monitorGain){voice.monitorGain=voice.ctx.createGain();voice.monitorGain.gain.value=voice.speakerOn?1:0;voice.monitorGain.connect(voice.ctx.destination);}
      return voice.ctx;
    }catch(_){return null;}
  }
  function ensureSilentVoiceTrack(){
    if(voice.silentTrack&&voice.silentTrack.readyState==='live')return voice.silentTrack;
    const ctx=prepareVoicePlayback();if(!ctx)return null;
    const dest=ctx.createMediaStreamDestination(),osc=ctx.createOscillator(),gain=ctx.createGain();gain.gain.value=0;osc.frequency.value=440;osc.connect(gain).connect(dest);try{osc.start();}catch(_){}
    voice.silentOsc=osc;voice.silentTrack=dest.stream.getAudioTracks()[0]||null;return voice.silentTrack;
  }
  function createVoicePc(){
    const pc=new RTCPeerConnection({iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun.cloudflare.com:3478']}],iceTransportPolicy:'all',bundlePolicy:'max-bundle',rtcpMuxPolicy:'require',iceCandidatePoolSize:2});
    return pc;
  }
  function waitVoiceIce(pc,timeout=4200){
    if(!pc||pc.iceGatheringState==='complete')return Promise.resolve();
    return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',onState);resolve();};const onState=()=>{if(pc.iceGatheringState==='complete')finish();};const timer=setTimeout(finish,timeout);pc.addEventListener('icegatheringstatechange',onState);});
  }
  function safeVoiceDesc(desc){if(!desc)return null;return {type:String(desc.type||''),sdp:String(desc.sdp||'')};}
  function voiceConnectedCount(){
    if(!r.voiceRoomEnabled)return 0;
    if(isHost())return 1+[...voice.hostPeers.values()].filter(item=>item.connected).length;
    return voice.guestPeer?.connected?Math.max(2,r.players.filter(p=>p.connected).length):0;
  }
  function updateVoiceUi(){
    if(!r.overlay)return;
    const live=(isHost()||isGuest())&&r.voiceRoomEnabled&&(r.state==='lobby'||r.state==='game');
    $$('[data-voice-mic]').forEach(button=>{button.hidden=!live;button.classList.toggle('active',voice.micOn);button.classList.toggle('blocked',!voiceSupported());if(button.closest('.uno-voice-call-actions'))button.textContent=voice.micOn?'🎙️ MIC ON':'🎙️ MIC OFF';else button.textContent=voice.micOn?'🎙️':'🎤';button.setAttribute('aria-pressed',voice.micOn?'true':'false');});
    $$('[data-voice-speaker]').forEach(button=>{button.hidden=!live;button.classList.toggle('active',voice.speakerOn);if(button.closest('.uno-voice-call-actions'))button.textContent=voice.speakerOn?'🎧 SPEAKER ON':'🔇 SPEAKER OFF';else button.textContent=voice.speakerOn?'🎧':'🔇';button.setAttribute('aria-pressed',voice.speakerOn?'true':'false');});
    const bar=$('[data-voice-bar]');if(bar)bar.hidden=!live;
    const mute=$('[data-voice-mute-all]');if(mute){mute.hidden=!live||!isHost();mute.classList.toggle('active',voice.hostMuteAll);mute.textContent=voice.hostMuteAll?'🔊 UNMUTE GUESTS':'🔇 MUTE GUESTS';}
    const status=$('[data-voice-status]');if(status&&live){const connected=voiceConnectedCount(),total=Math.max(1,r.players.filter(p=>p.connected).length);let text=!voiceSupported()?'VOICE NOT SUPPORTED':voice.playbackBlocked?'TAP SPEAKER TO HEAR CALL':`${connected}/${total} CONNECTED · ${voice.micOn?'MIC OPEN':'MIC MUTED'}`;if(voice.hostMuteAll&&isGuest())text+=' · HOST MUTED GUESTS';status.textContent=text;}
    const dot=$('[data-voice-dot]');if(dot){const ok=live&&voiceConnectedCount()>0;dot.classList.toggle('connected',ok);dot.classList.toggle('speaking',voice.speakingBySeat.get(r.localSeat)===true);}
    const chip=$('[data-voice-game-chip]');if(chip){chip.hidden=!live;chip.classList.toggle('active',voice.micOn);}
    const localMic=$('[data-local-mic-state]');if(localMic){localMic.hidden=!live;localMic.textContent=voice.micOn?'🎙':'🔇';}
  }
  function setVoiceSpeaking(seat,on){const s=Number(seat);if(!Number.isFinite(s))return;voice.speakingBySeat.set(s,on===true);updateVoiceIndicators();}
  function setVoiceMicState(seat,on){const s=Number(seat);if(!Number.isFinite(s))return;voice.micBySeat.set(s,on===true);updateVoiceIndicators();}
  function updateVoiceIndicators(){
    if(!r.overlay)return;
    $$('[data-seat-avatar]').forEach(el=>{const seat=Number(el.dataset.seatAvatar);el.classList.toggle('voice-speaking',voice.speakingBySeat.get(seat)===true);el.classList.toggle('voice-muted',r.voiceRoomEnabled&&voice.micBySeat.get(seat)===false);});
    $$('[data-voice-seat-mic]').forEach(el=>{const seat=Number(el.dataset.voiceSeatMic);const known=voice.micBySeat.has(seat);el.hidden=!r.voiceRoomEnabled||!known;el.textContent=voice.micBySeat.get(seat)?'🎙':'🔇';});
    const mine=$('[data-local-voice]');if(mine){mine.classList.toggle('voice-speaking',voice.speakingBySeat.get(r.localSeat)===true);mine.classList.toggle('voice-muted',r.voiceRoomEnabled&&!voice.micOn);}
  }
  function startVoiceMeter(){
    clearInterval(voice.meterTimer);voice.meterTimer=0;
    if(!voice.localStream||!voice.micTrack)return;
    const ctx=prepareVoicePlayback();if(!ctx)return;
    try{voice.analyser=ctx.createAnalyser();voice.analyser.fftSize=256;voice.analyser.smoothingTimeConstant=.72;voice.analyserData=new Uint8Array(voice.analyser.fftSize);const source=ctx.createMediaStreamSource(new MediaStream([voice.micTrack]));source.connect(voice.analyser);}catch(_){return;}
    let hangUntil=0;
    voice.meterTimer=setInterval(()=>{if(!r.open||!r.voiceRoomEnabled)return;let speaking=false;if(voice.micOn&&voice.analyser&&voice.analyserData){voice.analyser.getByteTimeDomainData(voice.analyserData);let sum=0;for(const x of voice.analyserData){const d=(x-128)/128;sum+=d*d;}const rms=Math.sqrt(sum/voice.analyserData.length);const now=Date.now();if(rms>.045)hangUntil=now+420;speaking=now<hangUntil;}if(speaking===voice.lastLocalSpeaking)return;voice.lastLocalSpeaking=speaking;setVoiceSpeaking(r.localSeat,speaking);if(isHost())broadcast({t:'voiceSpeak',seat:r.localSeat,speaking});else r.guestSession?.send({t:'voiceSpeak',speaking});},180);
  }
  async function ensureMicrophone(){
    if(voice.micTrack&&voice.micTrack.readyState==='live')return voice.micTrack;
    if(!voiceSupported())throw new Error('Voice call is not supported on this browser.');
    if(!window.isSecureContext)throw new Error('Microphone access needs HTTPS.');
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1},video:false});
    const track=stream.getAudioTracks()[0];if(!track)throw new Error('No microphone was found.');
    voice.localStream=stream;voice.micTrack=track;track.enabled=voice.micOn;startVoiceMeter();return track;
  }
  function ensureHostMicGraph(){
    if(!isHost()||!voice.localStream||!voice.micTrack)return;
    const ctx=prepareVoicePlayback();if(!ctx)return;
    if(!voice.hostMicSource){voice.hostMicSource=ctx.createMediaStreamSource(new MediaStream([voice.micTrack]));voice.hostMicGain=ctx.createGain();voice.hostMicGain.gain.value=voice.micOn?1:0;voice.hostMicSource.connect(voice.hostMicGain);for(const item of voice.hostPeers.values())try{voice.hostMicGain.connect(item.mixDest);}catch(_){}}
    if(voice.hostMicGain)voice.hostMicGain.gain.value=voice.micOn?1:0;
  }
  async function setVoiceMic(on){
    if(!r.voiceRoomEnabled||!(isHost()||isGuest())){toast('Voice call is not enabled for this room.',1800);return;}
    if(on){
      try{
        voice.micOn=true;
        const track=await ensureMicrophone();
        track.enabled=true;
        if(isHost()){
          ensureHostMicGraph();
        }else if(voice.guestPeer?.sender){
          // A guest initially joins the voice call receive-only. Some mobile browsers
          // do not reliably begin upstream audio when a synthetic/silent sender is
          // replaced after the connection is already established. If this voice peer
          // was not negotiated with the real microphone, force one voice-only
          // re-offer over the existing UNO DataChannel. Firebase is not involved.
          if(voice.guestPeer.micNegotiated){
            await voice.guestPeer.sender.replaceTrack(track);
          }else{
            r.guestSession?.send({t:'voiceNeedOffer',force:true,reason:'mic-ready'});
          }
        }else{
          r.guestSession?.send({t:'voiceNeedOffer',force:true,reason:'mic-ready'});
        }
      }catch(error){voice.micOn=false;toast(error?.message||'Microphone permission was not granted.',2600);}
    }else{
      voice.micOn=false;
      if(voice.micTrack)voice.micTrack.enabled=false;
      if(isHost()&&voice.hostMicGain)voice.hostMicGain.gain.value=0;
    }
    setVoiceMicState(r.localSeat,voice.micOn);setVoiceSpeaking(r.localSeat,false);if(isHost())broadcast({t:'voiceMicState',seat:r.localSeat,on:voice.micOn});else r.guestSession?.send({t:'voiceMicState',on:voice.micOn});updateVoiceUi();
  }
  function toggleVoiceMic(){prepareVoicePlayback();setVoiceMic(!voice.micOn);}
  function toggleVoiceSpeaker(){
    voice.speakerOn=!voice.speakerOn;
    const ctx=prepareVoicePlayback();if(ctx&&voice.monitorGain)voice.monitorGain.gain.value=voice.speakerOn?1:0;
    const audios=[];if(voice.remoteAudio)audios.push(voice.remoteAudio);for(const audio of voice.hostAudioByUid.values())audios.push(audio);
    for(const audio of audios){const isHostGuestAudio=audio.dataset?.unoVoiceHostAudio!=null;audio.muted=!voice.speakerOn||(isHostGuestAudio&&voice.hostMuteAll);if(voice.speakerOn&&!audio.muted)audio.play().then(()=>{voice.playbackBlocked=false;updateVoiceUi();}).catch(()=>{voice.playbackBlocked=true;updateVoiceUi();});}
    updateVoiceUi();
  }
  function toggleHostMuteAll(){if(!isHost())return;voice.hostMuteAll=!voice.hostMuteAll;for(const item of voice.hostPeers.values())if(item.relayGain)item.relayGain.gain.value=voice.hostMuteAll?0:1;for(const audio of voice.hostAudioByUid.values()){audio.muted=!voice.speakerOn||voice.hostMuteAll;if(!audio.muted)audio.play().catch(()=>{});}broadcast({t:'voiceHostMute',on:voice.hostMuteAll});if(voice.hostMuteAll){for(const [seat] of voice.speakingBySeat)if(seat!==r.localSeat)setVoiceSpeaking(seat,false);}updateVoiceUi();}
  function attachGuestPlayback(stream){
    if(!stream)return;let audio=voice.remoteAudio;if(!audio){audio=document.createElement('audio');audio.autoplay=true;audio.playsInline=true;audio.hidden=true;audio.dataset.unoVoiceAudio='1';r.overlay?.appendChild(audio);voice.remoteAudio=audio;}audio.srcObject=stream;audio.muted=!voice.speakerOn;audio.play().then(()=>{voice.playbackBlocked=false;updateVoiceUi();}).catch(()=>{voice.playbackBlocked=true;updateVoiceUi();});
  }
  function closeHostMonitorAudio(uid){const audio=voice.hostAudioByUid.get(uid);if(!audio)return;try{audio.pause();audio.srcObject=null;audio.remove();}catch(_){}voice.hostAudioByUid.delete(uid);}
  function attachHostMonitorAudio(uid,stream){
    if(!stream)return;closeHostMonitorAudio(uid);const audio=document.createElement('audio');audio.autoplay=true;audio.playsInline=true;audio.hidden=true;audio.dataset.unoVoiceHostAudio=String(uid||'');audio.srcObject=stream;audio.muted=!voice.speakerOn||voice.hostMuteAll;r.overlay?.appendChild(audio);voice.hostAudioByUid.set(uid,audio);
    if(!audio.muted)audio.play().then(()=>{voice.playbackBlocked=false;updateVoiceUi();}).catch(()=>{voice.playbackBlocked=true;updateVoiceUi();});
  }
  function closeHostVoicePeer(uid){const item=voice.hostPeers.get(uid);if(!item){closeHostMonitorAudio(uid);return;}try{item.pc?.close();}catch(_){}try{item.relayGain?.disconnect();}catch(_){}try{item.source?.disconnect();}catch(_){}closeHostMonitorAudio(uid);voice.hostPeers.delete(uid);const peer=r.peers.get(uid);if(peer){setVoiceSpeaking(peer.seat,false);voice.micBySeat.delete(peer.seat);}updateVoiceUi();}
  function hostAttachGuestVoice(uid,stream){
    const item=voice.hostPeers.get(uid);if(!item||!stream)return;const ctx=prepareVoicePlayback();if(!ctx)return;try{item.source?.disconnect();item.relayGain?.disconnect();}catch(_){}
    // Play each guest natively on the Host. This avoids depending on Web Audio's
    // destination path for the Host monitor while Web Audio remains responsible
    // only for mixing that guest into the OTHER guests' outbound streams.
    attachHostMonitorAudio(uid,stream);
    try{item.source=ctx.createMediaStreamSource(stream);item.relayGain=ctx.createGain();item.relayGain.gain.value=voice.hostMuteAll?0:1;item.source.connect(item.relayGain);for(const [otherUid,other] of voice.hostPeers)if(otherUid!==uid&&other.mixDest)try{item.relayGain.connect(other.mixDest);}catch(_){};for(const [otherUid,other] of voice.hostPeers)if(otherUid!==uid&&other.relayGain&&item.mixDest)try{other.relayGain.connect(item.mixDest);}catch(_){};}catch(error){console.warn('UNO voice mix attach failed',error);}
  }
  async function hostStartVoicePeer(uid,force=false){
    if(!r.voiceRoomEnabled||!isHost())return;const dataPeer=r.peers.get(uid);if(!dataPeer?.connected||!dataPeer.session?.send)return;const existing=voice.hostPeers.get(uid);if(!force&&existing&&existing.pc&&!['failed','closed'].includes(existing.pc.connectionState))return;closeHostVoicePeer(uid);const ctx=prepareVoicePlayback();if(!ctx)return;
    try{
      const pc=createVoicePc(),mixDest=ctx.createMediaStreamDestination();const mixTrack=mixDest.stream.getAudioTracks()[0];const item={pc,mixDest,source:null,relayGain:null,connected:false,transceiver:null};voice.hostPeers.set(uid,item);
      if(voice.hostMicGain)voice.hostMicGain.connect(mixDest);for(const [otherUid,other] of voice.hostPeers)if(otherUid!==uid&&other.relayGain)try{other.relayGain.connect(mixDest);}catch(_){};
      // Explicit sendrecv audio transceiver: Host sends this guest a group mix and
      // reserves the reverse direction for that guest's microphone.
      item.transceiver=pc.addTransceiver(mixTrack,{direction:'sendrecv',streams:[mixDest.stream]});
      pc.addEventListener('track',event=>{const stream=event.streams?.[0]||new MediaStream([event.track]);hostAttachGuestVoice(uid,stream);});
      pc.addEventListener('connectionstatechange',()=>{item.connected=pc.connectionState==='connected';if(['failed','closed'].includes(pc.connectionState)){item.connected=false;}updateVoiceUi();});
      await pc.setLocalDescription(await pc.createOffer());await waitVoiceIce(pc);if(voice.hostPeers.get(uid)!==item)return;dataPeer.session.send({t:'voiceOffer',desc:safeVoiceDesc(pc.localDescription)});updateVoiceUi();
    }catch(error){console.warn('UNO voice offer failed',error);closeHostVoicePeer(uid);}
  }
  async function hostApplyVoiceAnswer(uid,desc){const item=voice.hostPeers.get(uid);if(!item?.pc||!desc)return;try{await item.pc.setRemoteDescription(desc);updateVoiceUi();}catch(error){console.warn('UNO voice answer failed',error);closeHostVoicePeer(uid);setTimeout(()=>hostStartVoicePeer(uid),900);}}
  function closeGuestVoicePeer(){const item=voice.guestPeer;if(!item)return;try{item.pc?.close();}catch(_){}voice.guestPeer=null;try{if(voice.remoteAudio)voice.remoteAudio.srcObject=null;}catch(_){}updateVoiceUi();}
  async function guestAcceptVoiceOffer(desc){
    if(!r.voiceRoomEnabled||!isGuest()||!desc)return;closeGuestVoicePeer();const ctx=prepareVoicePlayback();if(!ctx)return;
    try{
      const pc=createVoicePc(),item={pc,sender:null,transceiver:null,connected:false,micNegotiated:false};voice.guestPeer=item;
      pc.addEventListener('track',event=>attachGuestPlayback(event.streams?.[0]||new MediaStream([event.track])));
      pc.addEventListener('connectionstatechange',()=>{item.connected=pc.connectionState==='connected';if(['failed','closed'].includes(pc.connectionState))item.connected=false;updateVoiceUi();});
      await pc.setRemoteDescription(desc);
      const trans=pc.getTransceivers().find(t=>t.receiver?.track?.kind==='audio'||t.sender?.track?.kind==='audio');if(!trans)throw new Error('Voice audio channel was not negotiated.');
      item.transceiver=trans;try{trans.direction='sendrecv';}catch(_){}
      // Do not negotiate a synthetic WebAudio track for muted guests. A real mic is
      // attached only when it exists; the first MIC ON can force a fresh voice-only
      // offer so mobile browsers negotiate the upstream direction with the mic live.
      const track=(voice.micOn&&voice.micTrack&&voice.micTrack.readyState==='live')?voice.micTrack:null;
      await trans.sender.replaceTrack(track);item.sender=trans.sender;item.micNegotiated=!!track;
      await pc.setLocalDescription(await pc.createAnswer());await waitVoiceIce(pc);if(voice.guestPeer!==item)return;
      r.guestSession?.send({t:'voiceAnswer',desc:safeVoiceDesc(pc.localDescription)});r.guestSession?.send({t:'voiceMicState',on:voice.micOn});updateVoiceUi();
    }catch(error){console.warn('UNO voice answer failed',error);closeGuestVoicePeer();}
  }
  function handleRemoteVoiceSpeak(seat,on){if(!isHost())return;const speaking=on===true&&!voice.hostMuteAll;setVoiceSpeaking(seat,speaking);broadcast({t:'voiceSpeak',seat:Number(seat),speaking});}
  function handleRemoteVoiceMic(seat,on){if(!isHost())return;setVoiceMicState(seat,on===true);broadcast({t:'voiceMicState',seat:Number(seat),on:on===true});}
  function closeVoiceSystem(){
    clearInterval(voice.meterTimer);voice.meterTimer=0;voice.lastLocalSpeaking=false;for(const uid of [...voice.hostPeers.keys()])closeHostVoicePeer(uid);for(const uid of [...voice.hostAudioByUid.keys()])closeHostMonitorAudio(uid);closeGuestVoicePeer();try{voice.localStream?.getTracks?.().forEach(track=>track.stop());}catch(_){}voice.localStream=null;voice.micTrack=null;voice.micOn=false;try{voice.silentOsc?.stop();}catch(_){}voice.silentOsc=null;try{voice.silentTrack?.stop();}catch(_){}voice.silentTrack=null;try{voice.hostMicSource?.disconnect();}catch(_){}try{voice.hostMicGain?.disconnect();}catch(_){}voice.hostMicSource=null;voice.hostMicGain=null;voice.analyser=null;voice.analyserData=null;voice.speakingBySeat.clear();voice.micBySeat.clear();voice.hostMuteAll=false;voice.playbackBlocked=false;if(voice.remoteAudio){try{voice.remoteAudio.remove();}catch(_){}voice.remoteAudio=null;}updateVoiceUi();
  }

  function clearNetwork(resetRoleData=true){closeVoiceSystem();clearTimeout(r.signalTimer);clearInterval(r.roomTouchTimer);clearTimeout(r.inviteTimer);clearTimeout(r.botTimer);clearTimeout(r.reconnectTimer);r.signalTimer=r.roomTouchTimer=r.inviteTimer=r.botTimer=r.reconnectTimer=0;r.reconnecting=false;for(const timer of r.disconnectTimers.values())clearTimeout(timer);r.disconnectTimers.clear();for(const peer of r.peers.values())try{peer.session?.close();}catch(_){}r.peers.clear();try{r.guestSession?.close();}catch(_){}r.guestSession=null;r.seatByUid.clear();closeScanner();hideDisconnect();r.busyAction=false;if(resetRoleData){r.players=[];r.game=null;r.guestPublic=null;r.guestPrivate=null;}}

  function onVisibilityChange(){if(r.open&&r.state==='join'&&!r.inviteTimer)startInvitePolling();}

  function close(call=true){if(!r.open)return;r.closing=true;const room=r.roomCode,host=isHost();if(host)broadcast({t:'exit'});else r.guestSession?.send({t:'leave'});clearNetwork();if(room&&r.bridge?.leaveCodeUnoRoom)r.bridge.leaveCodeUnoRoom({roomCode:room,closeRoom:host}).catch(()=>{});r.open=false;r.overlay.hidden=true;document.body.classList.remove('code-uno-active');r.role='';r.roomCode='';r.voiceRoomEnabled=false;r.players=[];r.game=null;r.guestPublic=null;r.guestPrivate=null;r.lastPublic=null;r.lastRenderedRevision=-1;r.discardHistory=[];r.closing=false;if(call)r.onClose?.();}

  function open(options={}){build();r.bridge=options.bridge||null;r.music=options.music||null;r.onBack=options.onBack||null;r.onClose=options.onClose||null;r.open=true;r.overlay.hidden=false;document.body.classList.add('code-uno-active');clearNetwork();r.role='';r.roomCode='';r.players=[];r.game=null;r.guestPublic=null;r.guestPrivate=null;r.lastPublic=null;r.lastRenderedRevision=-1;r.discardHistory=[];r.lastCelebratedResultKey='';r.houseRules={stackDraw2:false,drawUntilPlayable:false,sevenZero:false};r.voiceRoomEnabled=false;r.soundEnabled=r.bridge?.getSnapshot?.()?.soundEnabled!==false;$('[data-sound]').textContent=r.soundEnabled?'🔊':'🔇';const id=identity();if(id.name){$('[data-solo-name]').value=id.name;$('[data-host-name]').value=id.name;$('[data-guest-name]').value=id.name;}show('home');}

  window[GLOBAL_NAME]=Object.freeze({open,close,isOpen:()=>r.open,_debug:Object.freeze({currentView:()=>currentView(),state:()=>({role:r.role,state:r.state,roomCode:r.roomCode,localSeat:r.localSeat,maxPlayers:r.maxPlayers})})});
})();
