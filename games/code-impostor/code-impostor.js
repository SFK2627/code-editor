(() => {
  'use strict';

  if (window.ICT8CodeImpostor) return;

  const GAME_ID = 'code-impostor';
  const GLOBAL_NAME = 'ICT8CodeImpostor';
  const PREFIX = 'IMP1';
  const ROOM_QR_PREFIX = 'ICT8IMPOSTOR:';
  const HOST_JOIN_POLL_MS = 2400;
  const HOST_ANSWER_POLL_MS = 1100;
  const GUEST_OFFER_POLL_MS = 1400;
  const ROOM_TOUCH_MS = 90000;
  const RECONNECT_GRACE_MS = 30000;
  const MAX_PLAYERS = 12;
  const DEFAULT_SETTINGS = Object.freeze({
    category: 'Random Mix', rounds: 5, impostors: 'auto', wordMode: 'related', difficulty: 'normal',
    clueTimer: 15, discussionTimer: 45, votingTimer: 30, tieRule: 'revote', allowSpectators: true,
    allowBotReplacement: true, clueMode: 'text', sound: true, vibration: true, hostPlays: true,
    allowVoteChanges: false
  });

  const B = () => window.ICT8CodeImpostorBank || { pairs: [], categories: ['Random Mix'], parseCustom: () => ({ valid: [], errors: [] }) };
  const P = () => window.ICT8ZeroDbP2P;
  const $ = (sel, root = r.overlay) => root?.querySelector?.(sel) || null;
  const $$ = (sel, root = r.overlay) => Array.from(root?.querySelectorAll?.(sel) || []);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const norm = value => clean(value).toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  const now = () => Date.now();
  const identity = () => r.bridge?.getPlayerIdentity?.() || { loggedIn:false, uid:'local', studentId:'', name:'PLAYER', section:'' };
  const shuffle = list => P()?.shuffle ? P().shuffle(list.slice(), (Math.random()*0xffffffff)>>>0) : list.slice().sort(() => Math.random() - .5);
  const randomPick = list => list?.length ? list[Math.floor(Math.random() * list.length)] : null;

  const BOT_NAMES = ['NOVA','PIXEL','ECHO','BYTE','LUNA','ARC','MILO','SAGE','KAI','ZED','MIRA'];
  const BOT_PERSONALITIES = ['careful','bold','analytical','chaotic','quiet','social'];

  const r = {
    open:false, closing:false, overlay:null, bridge:null, music:null, onBack:null, onClose:null,
    role:'', state:'home', roomCode:'', roomMeta:null, localSeat:0, joinRole:'player', viewMode:'normal',
    settings:{...DEFAULT_SETTINGS}, customCategory:'Custom Topic', customPairs:[],
    players:[], spectators:[], peers:new Map(), seatByUid:new Map(), guestSession:null,
    signalTimer:0, roomTouchTimer:0, phaseTimer:0, tickTimer:0, reconnectTimer:0, reconnecting:false,
    disconnectTimers:new Map(), scannerStop:null, game:null, guestPublic:null, guestPrivate:null,
    soundEnabled:true, audioCtx:null, toastTimer:0, botTimers:new Set(), lastPublicRevision:-1,
    hostSetupKind:'private', pendingVoteTarget:''
  };

  function randomRoomCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(6);
    try { crypto.getRandomValues(bytes); } catch (_) { for (let i=0;i<6;i++) bytes[i]=Math.floor(Math.random()*256); }
    return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('');
  }

  function makePlayer(seat, name, options = {}) {
    return {
      seat:Number(seat), uid:String(options.uid || `seat-${seat}`), studentId:String(options.studentId || ''),
      name:clean(name || `PLAYER ${seat+1}`).slice(0,24) || `PLAYER ${seat+1}`, ready:options.ready === true,
      connected:options.connected !== false, bot:options.bot === true, botLevel:options.botLevel || 'normal',
      personality:options.personality || randomPick(BOT_PERSONALITIES) || 'careful', score:Number(options.score||0),
      correctVotes:Number(options.correctVotes||0), timesImpostor:Number(options.timesImpostor||0), roundsWon:Number(options.roundsWon||0)
    };
  }

  function build() {
    if (r.overlay) return;
    const o = document.createElement('div');
    o.className = 'ci-overlay';
    o.hidden = true;
    o.innerHTML = `
      <section class="ci-shell" role="dialog" aria-modal="true" aria-label="Code Impostor game">
        <header class="ci-head">
          <button class="ci-head-btn" type="button" data-ci-back>← MINI-GAMES</button>
          <div class="ci-brand"><span>G8CODE SOCIAL DEDUCTION</span><strong>CODE IMPOSTOR</strong><small>ANY TOPIC · SOLO · CLASSROOM · LIVE ROOM · 0 XP</small></div>
          <div class="ci-head-actions"><button class="ci-icon-btn" type="button" data-ci-sound>🔊</button><button class="ci-icon-btn" type="button" data-ci-close>×</button></div>
        </header>
        <main class="ci-main">
          <section class="ci-panel home active" data-ci-panel="home">
            <div class="ci-home-wrap">
              <div class="ci-hero">
                <div class="ci-mask-mark" aria-hidden="true"><i></i><i></i><span>?</span></div>
                <div><span class="ci-kicker">WHO DOESN'T BELONG?</span><h1>Give a clue. Read the room. Find the Impostor.</h1><p>Most players share one secret word. The Impostor gets a related word — or no word at all — and must blend in without getting caught.</p></div>
              </div>
              <div class="ci-mode-grid">
                <button class="ci-mode-card" type="button" data-ci-go="solo"><b>🤖</b><strong>SOLO VS BOTS</strong><small>Believable clues and voting. Easy, Normal, or Hard bots.</small><em>PLAY SOLO</em></button>
                <button class="ci-mode-card live" type="button" data-ci-go="private"><b>🕵️</b><strong>PRIVATE MULTIPLAYER</strong><small>Host a 3–12 player private room with QR and room code.</small><em>CREATE ROOM</em></button>
                <button class="ci-mode-card classroom" type="button" data-ci-go="classroom"><b>🏫</b><strong>CLASSROOM MODE</strong><small>Your laptop becomes the shared host/projector while students use phones privately.</small><em>HOST CLASS</em></button>
                <button class="ci-mode-card watch" type="button" data-ci-go="watch"><b>📺</b><strong>WATCH / PROJECTOR</strong><small>Join a live room as a view-only spectator. No secret information is sent.</small><em>WATCH ROOM</em></button>
              </div>
              <div class="ci-home-bottom"><button class="ci-secondary" type="button" data-ci-go="join">JOIN ROOM</button><span>122 curated related-word pairs · 26 categories · custom teacher packs supported</span></div>
            </div>
          </section>

          <section class="ci-panel" data-ci-panel="solo">
            <div class="ci-setup-wrap"><div class="ci-title-row"><div><span>SOLO VS BOTS</span><h2>Build your mystery round</h2></div><button class="ci-secondary" type="button" data-ci-home>BACK</button></div>
              <div class="ci-setup-grid">
                <div class="ci-card"><h3>GAME</h3>${settingsFields('solo')}</div>
                <div class="ci-card"><h3>SOLO BOTS</h3><label class="ci-field"><span>BOT PLAYERS</span><select data-ci-solo-bots>${[3,4,5,6,7,8,9].map(n=>`<option value="${n}" ${n===4?'selected':''}>${n} BOTS · ${n+1} PLAYERS</option>`).join('')}</select></label><label class="ci-field"><span>BOT DIFFICULTY</span><select data-ci-bot-level><option>Easy</option><option selected>Normal</option><option>Hard</option></select></label><p class="ci-help">Bots use word-specific clue banks and imperfect deduction. They are never given hidden information they should not know.</p><button class="ci-primary" type="button" data-ci-start-solo>START SOLO GAME</button></div>
              </div>
            </div>
          </section>

          <section class="ci-panel" data-ci-panel="host">
            <div class="ci-setup-wrap"><div class="ci-title-row"><div><span data-ci-host-kicker>PRIVATE MULTIPLAYER</span><h2 data-ci-host-title>Create Code Impostor room</h2></div><button class="ci-secondary" type="button" data-ci-home>BACK</button></div>
              <div class="ci-setup-grid">
                <div class="ci-card"><h3>ROOM</h3><label class="ci-field"><span>YOUR NAME</span><input data-ci-host-name maxlength="24" autocomplete="off"></label><label class="ci-field"><span>PLAYER CAPACITY</span><select data-ci-host-capacity>${[3,4,5,6,7,8,9,10,11,12].map(n=>`<option value="${n}" ${n===8?'selected':''}>${n} PLAYERS</option>`).join('')}</select></label><label class="ci-check"><input type="checkbox" data-ci-host-plays checked><span>HOST ALSO PLAYS</span></label><button class="ci-primary" type="button" data-ci-create-room>CREATE ROOM</button><div class="ci-status" data-ci-host-status></div></div>
                <div class="ci-card"><h3>GAME SETTINGS</h3>${settingsFields('host')}</div>
              </div>
            </div>
          </section>

          <section class="ci-panel" data-ci-panel="join">
            <div class="ci-join-wrap"><div class="ci-join-card"><div class="ci-mask-small">?</div><span data-ci-join-kicker>JOIN PRIVATE ROOM</span><h2>Enter the room code</h2><label class="ci-field"><span>ROOM CODE</span><input data-ci-room-input maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123"></label><label class="ci-field"><span>YOUR NAME</span><input data-ci-guest-name maxlength="24" autocomplete="off"></label><div class="ci-segment" data-ci-watch-type hidden><button class="active" type="button" data-ci-view-mode="spectator">SPECTATOR</button><button type="button" data-ci-view-mode="projector">PROJECTOR / TV</button></div><div class="ci-join-actions"><button class="ci-primary" type="button" data-ci-join-room>JOIN ROOM</button><button class="ci-secondary" type="button" data-ci-scan-room>SCAN QR</button></div><div class="ci-status" data-ci-join-status></div><button class="ci-link" type="button" data-ci-home>← Back to Code Impostor</button></div></div>
          </section>

          <section class="ci-panel" data-ci-panel="lobby">
            <div class="ci-lobby-wrap">
              <div class="ci-room-banner"><div><span>ROOM CODE</span><strong data-ci-room-code>------</strong><small data-ci-room-mode>RELATED WORD · NORMAL</small></div><div class="ci-room-actions"><button class="ci-secondary" type="button" data-ci-copy-room>COPY</button><button class="ci-secondary" type="button" data-ci-share-room>SHARE</button><button class="ci-danger ghost" type="button" data-ci-leave>LEAVE</button></div></div>
              <div class="ci-lobby-grid"><section class="ci-card ci-roster-card"><div class="ci-card-head"><div><span>PLAYERS</span><strong data-ci-room-count>0 / 8</strong></div><span data-ci-ready-status>WAITING</span></div><div class="ci-roster" data-ci-roster></div><button class="ci-ready-btn" type="button" data-ci-ready>I'M READY</button></section><aside class="ci-card ci-qr-card"><h3>JOIN BY QR</h3><div class="ci-qr-wrap"><img data-ci-room-qr alt="Room QR code"></div><small>Players scan this QR, then their phone becomes a private role / clue / vote controller.</small><div class="ci-spectator-count" data-ci-spectator-count>0 spectators</div><button class="ci-primary" type="button" data-ci-start-live>START GAME</button></aside></div>
            </div>
          </section>

          <section class="ci-panel" data-ci-panel="game">
            <div class="ci-game" data-ci-game>
              <div class="ci-game-top"><div><small data-ci-round-label>ROUND 1 / 5</small><strong data-ci-phase-label>ROLE REVEAL</strong></div><div class="ci-live-code">ROOM <b data-ci-live-code>------</b></div><div class="ci-timer"><span>TIME</span><strong data-ci-timer>--</strong></div></div>
              <section class="ci-private-card" data-ci-private-card><span>PRIVATE SCREEN</span><h2 data-ci-private-role>YOUR ROLE</h2><div class="ci-secret" data-ci-secret>••••••</div><p data-ci-private-note>Only you can see this information.</p><button class="ci-primary" type="button" data-ci-role-ready>I'M READY</button></section>
              <section class="ci-stage-card">
                <div class="ci-current"><span data-ci-stage-kicker>GET READY</span><h2 data-ci-stage-title>Waiting for players…</h2><p data-ci-stage-sub>Private role cards are being shown on player devices.</p></div>
                <div class="ci-clue-board" data-ci-clues></div>
              </section>
              <section class="ci-action-card" data-ci-actions></section>
              <aside class="ci-score-strip" data-ci-score-strip></aside>
              <div class="ci-host-controls" data-ci-host-controls hidden><button type="button" data-ci-host-skip>SKIP / ADVANCE</button><button type="button" data-ci-host-next hidden>NEXT ROUND</button><button class="danger" type="button" data-ci-host-end>END GAME</button></div>
            </div>
          </section>

          <section class="ci-panel" data-ci-panel="final">
            <div class="ci-final-wrap">
              <span class="ci-kicker">FINAL LEADERBOARD</span>
              <div class="ci-final-winner" data-ci-final-winner><span>MATCH COMPLETE</span><h2 data-ci-final-winner-title>FINAL WINNER</h2><p data-ci-final-winner-sub>The highest score wins the match.</p></div>
              <div class="ci-final-board" data-ci-final-board></div>
              <div class="ci-final-actions">
                <button class="ci-primary" type="button" data-ci-rematch>PLAY AGAIN</button>
                <button class="ci-secondary" type="button" data-ci-home>CHANGE SETTINGS</button>
                <button class="ci-secondary" type="button" data-ci-final-minigames>← MINI-GAMES</button>
                <button class="ci-danger ghost" type="button" data-ci-final-exit>EXIT</button>
              </div>
            </div>
          </section>
        </main>
        <div class="ci-toast" data-ci-toast hidden></div>
        <div class="ci-reveal-layer" data-ci-reveal-layer hidden><div><span data-ci-reveal-kicker>IMPOSTOR FOUND</span><strong data-ci-reveal-name>PLAYER</strong><small data-ci-reveal-sub>was the Impostor</small></div></div>
        <div class="ci-confirm-layer" data-ci-confirm hidden role="dialog" aria-modal="true" aria-labelledby="ciConfirmTitle">
          <div class="ci-confirm-card">
            <div class="ci-confirm-icon" aria-hidden="true">⌖</div>
            <span class="ci-confirm-kicker">LOCK YOUR VOTE</span>
            <h2 id="ciConfirmTitle">Vote for <b data-ci-confirm-name>PLAYER</b>?</h2>
            <p>Your vote stays private until the reveal. Once confirmed, it cannot be changed unless the Host enabled vote changes.</p>
            <div class="ci-confirm-actions"><button class="ci-secondary" type="button" data-ci-confirm-cancel>CANCEL</button><button class="ci-danger" type="button" data-ci-confirm-vote>CONFIRM VOTE</button></div>
          </div>
        </div>
        <div class="ci-scanner" data-ci-scanner hidden><div class="ci-scanner-card"><video data-ci-scan-video playsinline muted></video><p>Point the camera at a Code Impostor room QR.</p><button class="ci-secondary" type="button" data-ci-scan-close>CANCEL</button></div></div>
      </section>`;
    document.body.appendChild(o); r.overlay = o; bindUi();
  }

  function settingsFields(prefix) {
    const cats = B().categories || ['Random Mix'];
    return `<div class="ci-settings-grid">
      <label class="ci-field"><span>CATEGORY</span><select data-ci-${prefix}-category>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}<option>Custom Topic</option></select></label>
      <label class="ci-field"><span>ROUNDS</span><select data-ci-${prefix}-rounds><option>3</option><option selected>5</option><option>7</option><option>10</option><option value="0">Endless</option></select></label>
      <label class="ci-field"><span>WORD MODE</span><select data-ci-${prefix}-word-mode><option value="related" selected>Related Word Impostor</option><option value="none">No Word Impostor</option></select></label>
      <label class="ci-field"><span>DIFFICULTY</span><select data-ci-${prefix}-difficulty><option>Easy</option><option selected>Normal</option><option>Hard</option></select></label>
    </div>
    <div class="ci-custom-box" data-ci-${prefix}-custom hidden><label class="ci-field"><span>CUSTOM CATEGORY NAME</span><input data-ci-${prefix}-custom-name maxlength="36" value="Custom Topic"></label><label class="ci-field"><span>ONE PAIR PER LINE · WORD A | WORD B</span><textarea data-ci-${prefix}-custom-text rows="6" placeholder="Beach | Swimming Pool\nPizza | Burger\nCat | Dog"></textarea></label><div class="ci-custom-status" data-ci-${prefix}-custom-status>Paste at least 3 valid pairs.</div></div>
    <details class="ci-advanced"><summary>ADVANCED SETTINGS</summary><div class="ci-settings-grid advanced">
      <label class="ci-field"><span>IMPOSTORS</span><select data-ci-${prefix}-impostors><option value="auto" selected>Auto</option><option value="1">1 Impostor</option><option value="2">2 Impostors</option></select></label>
      <label class="ci-field"><span>CLUE TIMER</span><select data-ci-${prefix}-clue><option>10</option><option selected>15</option><option>20</option><option>30</option></select></label>
      <label class="ci-field"><span>DISCUSSION</span><select data-ci-${prefix}-discussion><option value="0">Off</option><option>30</option><option selected>45</option><option>60</option><option>90</option></select></label>
      <label class="ci-field"><span>VOTING TIMER</span><select data-ci-${prefix}-voting><option>20</option><option selected>30</option><option>45</option><option>60</option></select></label>
      <label class="ci-field"><span>TIE RULE</span><select data-ci-${prefix}-tie><option value="revote" selected>Revote</option><option value="none">No Elimination</option></select></label>
      <label class="ci-field"><span>CLUE TYPE</span><select data-ci-${prefix}-clue-mode><option value="text" selected>Text Clues</option><option value="verbal">Verbal Clues</option></select></label>
    </div>${prefix==='host'?`<div class="ci-check-grid"><label class="ci-check"><input type="checkbox" data-ci-host-spectators checked><span>ALLOW SPECTATORS</span></label><label class="ci-check"><input type="checkbox" data-ci-host-botrepl checked><span>ALLOW BOT REPLACEMENT</span></label><label class="ci-check"><input type="checkbox" data-ci-host-votechanges><span>ALLOW VOTE CHANGES</span></label><label class="ci-check"><input type="checkbox" data-ci-host-sound checked><span>ROOM SOUND CUES</span></label><label class="ci-check"><input type="checkbox" data-ci-host-vibration checked><span>VIBRATION</span></label></div>`:''}</details>`;
  }

  function bindUi() {
    $('[data-ci-back]').addEventListener('click', returnToMiniGames);
    $('[data-ci-close]').addEventListener('click', () => close());
    $('[data-ci-sound]').addEventListener('click', toggleSound);
    $$('[data-ci-go]').forEach(btn => btn.addEventListener('click', () => route(btn.dataset.ciGo)));
    $$('[data-ci-home]').forEach(btn => btn.addEventListener('click', goHome));
    bindSettings('solo'); bindSettings('host');
    $('[data-ci-start-solo]').addEventListener('click', startSolo);
    $('[data-ci-create-room]').addEventListener('click', createHostRoom);
    $('[data-ci-join-room]').addEventListener('click', () => joinRoom($('[data-ci-room-input]').value));
    $('[data-ci-room-input]').addEventListener('input', e => e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6));
    $('[data-ci-copy-room]').addEventListener('click', () => copyRoom());
    $('[data-ci-share-room]').addEventListener('click', () => shareRoom());
    $('[data-ci-ready]').addEventListener('click', toggleReady);
    $('[data-ci-start-live]').addEventListener('click', startLiveGame);
    $('[data-ci-leave]').addEventListener('click', leaveRoomToHome);
    $('[data-ci-role-ready]').addEventListener('click', markRoleReady);
    $('[data-ci-host-skip]').addEventListener('click', hostAdvance);
    $('[data-ci-host-next]').addEventListener('click', nextRound);
    $('[data-ci-host-end]').addEventListener('click', () => finishMatch(true));
    $('[data-ci-rematch]').addEventListener('click', rematch);
    $('[data-ci-final-minigames]').addEventListener('click', returnToMiniGames);
    $('[data-ci-final-exit]').addEventListener('click', () => close());
    $('[data-ci-scan-room]').addEventListener('click', openScanner);
    $('[data-ci-scan-close]').addEventListener('click', closeScanner);
    $('[data-ci-confirm-cancel]').addEventListener('click', closeVoteConfirm);
    $('[data-ci-confirm-vote]').addEventListener('click', confirmPendingVote);
    $$('[data-ci-view-mode]').forEach(btn => btn.addEventListener('click', () => {
      r.viewMode = btn.dataset.ciViewMode; $$('[data-ci-view-mode]').forEach(x=>x.classList.toggle('active',x===btn));
    }));
  }

  function bindSettings(prefix) {
    const cat = $(`[data-ci-${prefix}-category]`);
    const custom = $(`[data-ci-${prefix}-custom]`);
    const refresh = () => { if (custom) custom.hidden = cat?.value !== 'Custom Topic'; validateCustom(prefix); };
    cat?.addEventListener('change', refresh);
    $(`[data-ci-${prefix}-custom-text]`)?.addEventListener('input', () => validateCustom(prefix));
    refresh();
  }

  function validateCustom(prefix) {
    const box = $(`[data-ci-${prefix}-custom-text]`), status = $(`[data-ci-${prefix}-custom-status]`); if (!box || !status) return;
    const parsed = B().parseCustom(box.value); const good = parsed.valid.length >= 3 && parsed.errors.length === 0;
    status.className = `ci-custom-status ${good?'good':parsed.errors.length?'bad':''}`;
    status.textContent = parsed.errors.length ? `${parsed.valid.length} valid · ${parsed.errors[0]}` : `${parsed.valid.length} valid pair${parsed.valid.length===1?'':'s'}${good?' · READY':''}`;
  }

  function route(kind) {
    if (kind === 'solo') { r.role='solo'; fillIdentityInputs(); show('solo'); return; }
    if (kind === 'private' || kind === 'classroom') {
      r.role=''; r.hostSetupKind=kind; fillIdentityInputs();
      $('[data-ci-host-kicker]').textContent = kind === 'classroom' ? 'CLASSROOM MODE' : 'PRIVATE MULTIPLAYER';
      $('[data-ci-host-title]').textContent = kind === 'classroom' ? 'Host a projector-first classroom game' : 'Create Code Impostor room';
      $('[data-ci-host-plays]').checked = kind !== 'classroom'; show('host'); return;
    }
    if (kind === 'watch') { r.joinRole='spectator'; r.viewMode='projector'; $('[data-ci-join-kicker]').textContent='WATCH / PROJECTOR'; $('[data-ci-watch-type]').hidden=false; fillIdentityInputs(); show('join'); return; }
    if (kind === 'join') { r.joinRole='player'; r.viewMode='normal'; $('[data-ci-join-kicker]').textContent='JOIN PRIVATE ROOM'; $('[data-ci-watch-type]').hidden=true; fillIdentityInputs(); show('join'); }
  }

  function fillIdentityInputs() {
    const id=identity(); const name=clean(id.name||'PLAYER').slice(0,24);
    if ($('[data-ci-host-name]')&&!$('[data-ci-host-name]').value) $('[data-ci-host-name]').value=name;
    if ($('[data-ci-guest-name]')&&!$('[data-ci-guest-name]').value) $('[data-ci-guest-name]').value=name;
  }

  function readSettings(prefix) {
    const category=$(`[data-ci-${prefix}-category]`)?.value||'Random Mix';
    const parsed = category==='Custom Topic' ? B().parseCustom($(`[data-ci-${prefix}-custom-text]`)?.value||'') : {valid:[],errors:[]};
    if (category==='Custom Topic' && (parsed.errors.length || parsed.valid.length<3)) throw new Error(parsed.errors[0] || 'Add at least 3 valid custom word pairs.');
    return {
      ...DEFAULT_SETTINGS, category, customCategory:clean($(`[data-ci-${prefix}-custom-name]`)?.value||'Custom Topic').slice(0,36)||'Custom Topic', customPairs:parsed.valid,
      rounds:Number($(`[data-ci-${prefix}-rounds]`)?.value||5), wordMode:$(`[data-ci-${prefix}-word-mode]`)?.value||'related',
      difficulty:String($(`[data-ci-${prefix}-difficulty]`)?.value||'Normal').toLowerCase(), impostors:$(`[data-ci-${prefix}-impostors]`)?.value||'auto',
      clueTimer:Number($(`[data-ci-${prefix}-clue]`)?.value||15), discussionTimer:Number($(`[data-ci-${prefix}-discussion]`)?.value||45), votingTimer:Number($(`[data-ci-${prefix}-voting]`)?.value||30),
      tieRule:$(`[data-ci-${prefix}-tie]`)?.value||'revote', clueMode:$(`[data-ci-${prefix}-clue-mode]`)?.value||'text',
      allowSpectators:prefix==='host' ? $('[data-ci-host-spectators]')?.checked!==false : true,
      allowBotReplacement:prefix==='host' ? $('[data-ci-host-botrepl]')?.checked!==false : true,
      allowVoteChanges:prefix==='host' ? $('[data-ci-host-votechanges]')?.checked===true : false,
      sound:prefix==='host' ? $('[data-ci-host-sound]')?.checked!==false : true,
      vibration:prefix==='host' ? $('[data-ci-host-vibration]')?.checked!==false : true,
      hostPlays:prefix==='host' ? $('[data-ci-host-plays]')?.checked!==false : true
    };
  }

  function show(name) {
    r.state=name; $$('[data-ci-panel]').forEach(p=>p.classList.toggle('active',p.dataset.ciPanel===name));
    if (name==='game') startTick(); else stopTick();
  }
  function setStatus(el,msg,error=false,good=false){if(!el)return;el.textContent=msg||'';el.className=`ci-status${error?' error':good?' good':''}`;}
  function toast(msg,ms=2200){const el=$('[data-ci-toast]');if(!el)return;el.textContent=msg;el.hidden=false;clearTimeout(r.toastTimer);r.toastTimer=setTimeout(()=>el.hidden=true,ms);}

  function choosePair(settings) {
    const source = settings.category==='Custom Topic' ? settings.customPairs : B().pairs.filter(x => (settings.category==='Random Mix'||x.category===settings.category) && (x.difficulty===settings.difficulty || settings.difficulty==='normal'));
    const fallback = settings.category==='Custom Topic' ? settings.customPairs : B().pairs.filter(x=>settings.category==='Random Mix'||x.category===settings.category);
    return randomPick(source.length?source:fallback.length?fallback:B().pairs);
  }

  function startSolo() {
    try { r.settings=readSettings('solo'); } catch(e){toast(e.message);return;}
    // Solo should feel brisk: keep the player's selected flow, but cap passive discussion waiting.
    if (r.settings.discussionTimer > 0) r.settings.discussionTimer = Math.min(8, r.settings.discussionTimer);
    r.role='solo'; r.roomCode='SOLO';
    const id=identity(), human=makePlayer(0,id.name||'YOU',{uid:id.uid||'local',studentId:id.studentId,ready:true,connected:true});
    const botCount=clamp($('[data-ci-solo-bots]')?.value||4,3,9), botLevel=String($('[data-ci-bot-level]')?.value||'Normal').toLowerCase();
    r.players=[human]; for(let i=0;i<botCount;i++) r.players.push(makePlayer(i+1,BOT_NAMES[i% BOT_NAMES.length],{uid:`bot-${i+1}`,bot:true,botLevel,ready:true}));
    r.spectators=[]; initMatch(); sfx('join');
  }

  async function createHostRoom() {
    const status=$('[data-ci-host-status]'),button=$('[data-ci-create-room]');
    if(!identity().loggedIn){setStatus(status,'Sign in as a student before hosting a live room.',true);return;}
    try { r.settings=readSettings('host'); } catch(e){setStatus(status,e.message,true);return;}
    button.disabled=true; button.textContent='CREATING…';
    try {
      clearNetwork(false); r.role='host'; const id=identity(); const name=clean($('[data-ci-host-name]').value||id.name||'HOST').slice(0,24)||'HOST';
      const cap=clamp($('[data-ci-host-capacity]').value||8,3,MAX_PLAYERS); let meta=null,attempts=0;
      while(!meta&&attempts++<6){try{meta=await r.bridge.createCodeImpostorRoom({roomCode:randomRoomCode(),maxPlayers:cap,hostName:name,allowSpectators:r.settings.allowSpectators});}catch(e){if(attempts>=6)throw e;}}
      r.roomMeta=meta;r.roomCode=meta.roomCode;r.players=[];r.spectators=[];r.seatByUid.clear();
      if(r.settings.hostPlays){const host=makePlayer(0,name,{uid:id.uid,studentId:id.studentId,ready:true});r.players=[host];r.seatByUid.set(id.uid,0);r.localSeat=0;}
      enterLobby();startHostSignalLoop();
    } catch(e){r.role='';setStatus(status,e?.message||'Could not create room.',true);} finally {button.disabled=false;button.textContent='CREATE ROOM';}
  }

  function enterLobby() {
    $('[data-ci-room-code]').textContent=r.roomCode||'------';
    $('[data-ci-room-mode]').textContent=`${r.settings.wordMode==='related'?'RELATED WORD':'NO WORD'} · ${r.settings.difficulty.toUpperCase()} · ${r.settings.rounds||'∞'} ROUNDS`;
    $('[data-ci-start-live]').hidden=r.role!=='host'; $('[data-ci-ready]').hidden=r.role==='host'&&!r.settings.hostPlays || r.role==='spectator';
    const qr=r.bridge?.createQrDataUrl?.(`${ROOM_QR_PREFIX}${r.roomCode}:PLAYER`,360)||''; if(qr)$('[data-ci-room-qr]').src=qr;
    show('lobby'); renderLobby();
  }

  function renderLobby() {
    const cap=Number(r.roomMeta?.maxPlayers||MAX_PLAYERS), roster=$('[data-ci-roster]'); if(!roster)return;
    const players=r.players.slice().sort((a,b)=>a.seat-b.seat);
    roster.innerHTML=players.map(p=>`<article class="ci-player-row ${p.ready?'ready':''} ${p.connected?'':'offline'}"><span>${esc((p.name||'?')[0]?.toUpperCase()||'?')}</span><div><strong>${esc(p.name)}${p.uid===identity().uid?' · YOU':''}</strong><small>${p.bot?'BOT':p.studentId?esc(p.studentId):'LIVE PLAYER'}</small></div><b>${p.connected?(p.ready?'READY ✓':'NOT READY'):'DISCONNECTED'}</b></article>`).join('') + Array.from({length:Math.max(0,cap-players.length)},(_,i)=>`<article class="ci-player-row empty"><span>+</span><div><strong>OPEN PLAYER SLOT</strong><small>Scan QR or enter room code</small></div><b>OPEN</b></article>`).join('');
    $('[data-ci-room-count]').textContent=`${players.filter(p=>p.connected).length} / ${cap}`;
    $('[data-ci-spectator-count]').textContent=`${r.spectators.filter(x=>x.connected).length} spectator${r.spectators.filter(x=>x.connected).length===1?'':'s'}`;
    const me=players.find(p=>p.uid===identity().uid)||players.find(p=>p.seat===r.localSeat); const ready=$('[data-ci-ready]');
    if(ready&&!ready.hidden){ready.disabled=r.role==='guest'&&!r.guestSession?.connected;ready.textContent=me?.ready?'READY ✓':"I'M READY";ready.classList.toggle('active',!!me?.ready);}
    if(r.role==='host'){
      const active=players.filter(p=>p.connected), enough=active.length>=3, all=active.length&&active.every(p=>p.ready);
      const start=$('[data-ci-start-live]');start.disabled=!(enough&&all);start.textContent=!enough?'NEED 3 PLAYERS':!all?'WAITING FOR READY…':`START ${active.length}-PLAYER GAME`;
    }
  }

  function hostNeedsSignalPolling(){return r.open&&r.role==='host'&&r.roomCode&&([...r.peers.values()].some(p=>p.connecting&&!p.connected)||r.state==='lobby'||r.state==='game');}
  function stopHostSignalPolling(){clearTimeout(r.signalTimer);r.signalTimer=0;}
  function startHostSignalLoop(){
    stopHostSignalPolling();clearInterval(r.roomTouchTimer);let lastJoin=0;
    const poll=async()=>{if(!hostNeedsSignalPolling())return;try{const t=now();if(t-lastJoin>=HOST_JOIN_POLL_MS){const joins=await r.bridge.listCodeImpostorJoins({roomCode:r.roomCode,meta:r.roomMeta});lastJoin=t;for(const join of joins)await prepareHostPeer(join);}const waiting=[...r.peers.values()].some(p=>p.connecting&&!p.connected&&!p.answerApplied);if(waiting){const answers=await r.bridge.listCodeImpostorAnswers({roomCode:r.roomCode,meta:r.roomMeta});for(const ans of answers){const peer=r.peers.get(ans.uid);if(peer&&!peer.answerApplied&&ans.answerCode&&Number(ans.updatedAtMs||0)>=peer.offerAt){peer.answerApplied=true;try{await peer.session.applyAnswer(ans.answerCode);}catch(_){peer.answerApplied=false;peer.connecting=false;}}}}}catch(_){}if(hostNeedsSignalPolling()){const negotiating=[...r.peers.values()].some(p=>p.connecting&&!p.connected);const idleGame=r.state==='game'&&!negotiating&&!r.players.some(p=>!p.connected&&!p.bot);r.signalTimer=setTimeout(poll,negotiating?HOST_ANSWER_POLL_MS:idleGame?8000:HOST_JOIN_POLL_MS);}};
    r.signalTimer=setTimeout(poll,160);r.roomTouchTimer=setInterval(()=>{if(r.open&&r.role==='host'&&r.roomCode)r.bridge.touchCodeImpostorRoom({roomCode:r.roomCode,status:r.state==='game'?'playing':'lobby',meta:r.roomMeta}).then(m=>{if(m)r.roomMeta=m;}).catch(()=>{});},ROOM_TOUCH_MS);
  }

  function nextFreeSeat(uid=''){if(uid&&r.seatByUid.has(uid))return r.seatByUid.get(uid);const used=new Set(r.players.map(p=>p.seat));for(let s=0;s<Number(r.roomMeta?.maxPlayers||MAX_PLAYERS);s++)if(!used.has(s))return s;return -1;}
  async function prepareHostPeer(join){
    if(!join?.uid||join.uid===identity().uid)return; const existing=r.peers.get(join.uid); if(existing&&(existing.connected||existing.connecting))return;
    const spectator=join.joinRole==='spectator'; if(spectator&&!r.settings.allowSpectators){r.bridge.setCodeImpostorOffer({roomCode:r.roomCode,targetUid:join.uid,status:'spectators-off',seat:0,joinRole:'spectator',offerCode:'',meta:r.roomMeta}).catch(()=>{});return;}
    const knownSeat=r.seatByUid.get(join.uid);
    if(!spectator&&r.state==='game'&&knownSeat==null){r.bridge.setCodeImpostorOffer({roomCode:r.roomCode,targetUid:join.uid,status:'started',seat:0,joinRole:'player',offerCode:'',meta:r.roomMeta}).catch(()=>{});return;}
    const seat=spectator?-1:(knownSeat??nextFreeSeat(join.uid));
    if(!spectator&&seat<0){r.bridge.setCodeImpostorOffer({roomCode:r.roomCode,targetUid:join.uid,status:'full',seat:0,joinRole:'player',offerCode:'',meta:r.roomMeta}).catch(()=>{});return;}
    try{existing?.session?.close();}catch(_){}
    const peer={uid:join.uid,seat,name:clean(join.name||'PLAYER'),studentId:String(join.studentId||''),joinRole:spectator?'spectator':'player',viewMode:join.viewMode||'normal',connected:false,connecting:true,answerApplied:false,session:null,offerAt:now()};r.peers.set(join.uid,peer);
    if(spectator){let sp=r.spectators.find(x=>x.uid===join.uid);if(!sp){sp={uid:join.uid,name:peer.name,connected:false,viewMode:peer.viewMode};r.spectators.push(sp);}}
    else {r.seatByUid.set(join.uid,seat);let p=r.players.find(x=>x.uid===join.uid);if(!p){p=makePlayer(seat,peer.name,{uid:join.uid,studentId:peer.studentId,ready:false,connected:false});r.players.push(p);}else{p.seat=seat;p.connected=false;}}
    let session=null;session=P().createSession({gameId:`code-impostor-${r.roomCode}-${join.uid}`,prefix:PREFIX,channelLabel:'code-impostor',timeoutMs:13000,onMessage:msg=>handleGuestMessage(join.uid,msg),onConnected:()=>hostPeerConnected(join.uid),onDisconnected:()=>hostPeerDisconnected(join.uid),onState:s=>{if(s==='timeout'||s==='ice-failed'||s==='channel-error'){const p=r.peers.get(join.uid);if(p){p.connecting=false;try{p.session?.close();}catch(_){}p.session=null;}}}});peer.session=session;
    try{const offer=await session.createOffer(identity().name||'HOST');await r.bridge.setCodeImpostorOffer({roomCode:r.roomCode,targetUid:join.uid,status:'offer',seat:Math.max(0,seat),joinRole:peer.joinRole,offerCode:offer,meta:r.roomMeta});}catch(_){peer.connecting=false;}
    renderLobby();
  }

  function hostPeerConnected(uid){const peer=r.peers.get(uid);if(!peer)return;peer.connected=true;peer.connecting=false;peer.answerApplied=true;if(peer.joinRole==='spectator'){const sp=r.spectators.find(x=>x.uid===uid);if(sp)sp.connected=true;}else{const p=r.players.find(x=>x.uid===uid);if(p)p.connected=true;}peer.session.send({t:'welcome',roomCode:r.roomCode,seat:peer.seat,joinRole:peer.joinRole,viewMode:peer.viewMode,settings:publicSettings(),state:r.state,players:publicLobbyPlayers()});if(r.state==='game')sendStateToPeer(peer);else broadcastLobby();r.bridge.clearCodeImpostorHandshake?.({roomCode:r.roomCode,targetUid:uid,meta:r.roomMeta}).catch(()=>{});renderLobby();toast(`${peer.name} connected.`);}
  function hostPeerDisconnected(uid){const peer=r.peers.get(uid);if(!peer)return;peer.connected=false;peer.connecting=false;peer.answerApplied=false;if(peer.joinRole==='spectator'){const sp=r.spectators.find(x=>x.uid===uid);if(sp)sp.connected=false;renderLobby();return;}const p=r.players.find(x=>x.uid===uid);if(p)p.connected=false;if(r.state==='lobby'){renderLobby();broadcastLobby();return;}syncAll();clearTimeout(r.disconnectTimers.get(uid));r.disconnectTimers.set(uid,setTimeout(()=>{const pp=r.players.find(x=>x.uid===uid);if(!pp||pp.connected)return;if(r.settings.allowBotReplacement){pp.bot=true;pp.connected=true;pp.name=`${pp.name} · BOT`;toast(`${pp.name} is now bot-controlled.`);syncAll();scheduleBots();}},RECONNECT_GRACE_MS));startHostSignalLoop();}
  function publicLobbyPlayers(){return r.players.slice().sort((a,b)=>a.seat-b.seat).map(p=>({seat:p.seat,uid:p.uid,name:p.name,ready:!!p.ready,connected:!!p.connected,bot:!!p.bot}));}
  function broadcast(payload, playersOnly=false){for(const peer of r.peers.values())if(peer.connected&&(!playersOnly||peer.joinRole==='player'))peer.session.send(payload);}
  function broadcastLobby(){broadcast({t:'lobby',settings:publicSettings(),players:publicLobbyPlayers(),spectatorCount:r.spectators.filter(x=>x.connected).length});}

  async function joinRoom(rawCode,reconnect=false){
    const code=clean(rawCode).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6),status=$('[data-ci-join-status]'); if(code.length!==6){setStatus(status,'Enter a valid 6-character room code.',true);return;} if(!identity().loggedIn){setStatus(status,'Sign in as a student before joining a live room.',true);return;}
    try{if(!reconnect)clearNetwork(false);else{try{r.guestSession?.close();}catch(_){}r.guestSession=null;clearTimeout(r.signalTimer);}r.role=r.joinRole==='spectator'?'spectator':'guest';r.roomCode=code;const name=clean($('[data-ci-guest-name]').value||identity().name||'PLAYER').slice(0,24)||'PLAYER';const req=await r.bridge.requestCodeImpostorJoin({roomCode:code,name,joinRole:r.joinRole,viewMode:r.viewMode});r.roomMeta=req.meta;r.settings={...DEFAULT_SETTINGS};setStatus(status,'Room found. Connecting…');startGuestSignalLoop(name,reconnect);}catch(e){if(!reconnect){r.role='';setStatus(status,e?.message||'Could not join room.',true);}else scheduleGuestReconnect();}}
  function startGuestSignalLoop(name,reconnect=false){clearTimeout(r.signalTimer);const poll=async()=>{if(!r.open||!['guest','spectator'].includes(r.role)||!r.roomCode||r.guestSession?.connected)return;try{const offer=await r.bridge.getCodeImpostorOffer({roomCode:r.roomCode});if(offer?.status==='full'){setStatus($('[data-ci-join-status]'),'That player room is full.',true);return;}if(offer?.status==='started'&&!reconnect){setStatus($('[data-ci-join-status]'),'That match has already started. Join as a spectator instead.',true);return;}if(offer?.status==='spectators-off'){setStatus($('[data-ci-join-status]'),'Spectators are disabled for this room.',true);return;}if(offer?.offerCode&&!r.guestSession){r.localSeat=Number(offer.seat||0);let session=null;session=P().createSession({gameId:`code-impostor-${r.roomCode}-${identity().uid}`,prefix:PREFIX,channelLabel:'code-impostor',timeoutMs:13000,onMessage:msg=>handleHostMessage(msg),onConnected:guestConnected,onDisconnected:guestDisconnected,onState:s=>{if(['timeout','ice-failed','channel-error'].includes(s)&&r.guestSession===session){try{session.close();}catch(_){}r.guestSession=null;setTimeout(()=>startGuestSignalLoop(name,reconnect),500);}}});r.guestSession=session;const answer=await session.createAnswer(offer.offerCode,name);await r.bridge.setCodeImpostorAnswer({roomCode:r.roomCode,answerCode:answer,meta:r.roomMeta});setStatus($('[data-ci-join-status]'),'Connecting to Host…');}}catch(e){if(!reconnect)setStatus($('[data-ci-join-status]'),e?.message||'Waiting for Host…');}if(r.open&&['guest','spectator'].includes(r.role)&&!r.guestSession)r.signalTimer=setTimeout(poll,GUEST_OFFER_POLL_MS);};r.signalTimer=setTimeout(poll,120);}
  function guestConnected(){r.reconnecting=false;clearTimeout(r.reconnectTimer);clearTimeout(r.signalTimer);setStatus($('[data-ci-join-status]'),'Connected ✓',false,true);r.guestSession?.send({t:'snapshotRequest'});sfx('join');}
  function guestDisconnected(){if(r.closing||!r.open)return;toast('Connection lost. Reconnecting…',2600);scheduleGuestReconnect();}
  function scheduleGuestReconnect(){if(r.reconnecting||!r.roomCode)return;r.reconnecting=true;clearTimeout(r.reconnectTimer);r.reconnectTimer=setTimeout(()=>{r.reconnecting=false;joinRoom(r.roomCode,true);},850);}

  function handleGuestMessage(uid,msg){const peer=r.peers.get(uid);if(!peer||!msg)return;if(msg.t==='ready'&&r.state==='lobby'&&peer.joinRole==='player'){const p=r.players.find(x=>x.uid===uid);if(p){p.ready=!!msg.value;p.connected=true;}renderLobby();broadcastLobby();}else if(msg.t==='snapshotRequest'){if(r.state==='game')sendStateToPeer(peer);else peer.session.send({t:'lobby',settings:publicSettings(),players:publicLobbyPlayers(),spectatorCount:r.spectators.filter(x=>x.connected).length});}else if(msg.t==='roleReady')hostRoleReady(uid);else if(msg.t==='clue')hostSubmitClue(uid,msg.clue);else if(msg.t==='verbalClue')hostSubmitClue(uid,'✓ Verbal clue');else if(msg.t==='vote')hostSubmitVote(uid,msg.targetUid);else if(msg.t==='finalGuess')hostFinalGuess(uid,msg.answer);else if(msg.t==='leave')hostPeerDisconnected(uid);}
  function handleHostMessage(msg){if(!msg)return;if(msg.t==='welcome'){r.settings={...DEFAULT_SETTINGS,...(msg.settings||{})};if(Array.isArray(msg.players))r.players=msg.players.map(x=>({...x}));r.localSeat=Number(msg.seat||0);r.joinRole=msg.joinRole||r.joinRole;r.viewMode=msg.viewMode||r.viewMode;if(msg.state==='game'){show('game');}else{enterLobby();}}else if(msg.t==='lobby'){r.settings={...DEFAULT_SETTINGS,...(msg.settings||{})};r.players=Array.isArray(msg.players)?msg.players.map(x=>({...x})):r.players;enterLobby();}else if(msg.t==='state'){r.guestPublic=msg.public||null;r.guestPrivate=msg.private||null;if(r.state!=='game')show('game');renderGame();}else if(msg.t==='error')toast(msg.message||'Action not accepted.');else if(msg.t==='final')showFinal(msg.leaderboard||[]);else if(msg.t==='hostTransfer'){assumeTransferredHost(msg);}else if(msg.t==='hostRejoin'){try{r.guestSession?.close();}catch(_){}r.guestSession=null;r.reconnecting=false;setTimeout(()=>joinRoom(r.roomCode,true),650);}else if(msg.t==='exit'){toast('Host ended the room.');setTimeout(goHome,1000);}}

  function toggleReady(){if(r.role==='host'){const p=r.players.find(x=>x.uid===identity().uid);if(p){p.ready=!p.ready;renderLobby();broadcastLobby();}}else if(r.role==='guest'){const p=r.players.find(x=>x.uid===identity().uid)||r.players.find(x=>x.seat===r.localSeat);const next=!(p?.ready);if(p)p.ready=next;r.guestSession?.send({t:'ready',value:next});renderLobby();}}

  function initMatch(){r.game={roundIndex:0,revision:0,phase:'',phaseEndsAt:0,pairHistory:[],round:null,leaderboardDone:false};show('game');beginRound();}
  function startLiveGame(){if(r.role!=='host')return;const active=r.players.filter(p=>p.connected);if(active.length<3||!active.every(p=>p.ready))return;r.players=active.map((p,i)=>({...p,seat:i}));r.seatByUid.clear();r.players.forEach(p=>r.seatByUid.set(p.uid,p.seat));r.game={roundIndex:0,revision:0,phase:'',phaseEndsAt:0,pairHistory:[],round:null,leaderboardDone:false};show('game');beginRound();r.bridge.touchCodeImpostorRoom({roomCode:r.roomCode,status:'playing',meta:r.roomMeta}).then(m=>r.roomMeta=m||r.roomMeta).catch(()=>{});}

  function impostorCount(){const n=r.players.filter(p=>p.connected||p.bot).length;if(r.settings.impostors==='2')return n>=8?2:1;if(r.settings.impostors==='1')return 1;return n>=8?2:1;}
  function beginRound(){if(!r.game)return;clearPhaseTimers();r.game.roundIndex+=1;const pair=chooseUnusedPair();if(!pair){toast('No word pair available.');finishMatch(true);return;}const active=r.players.filter(p=>p.connected||p.bot);const statsBefore=Object.fromEntries(active.map(p=>[p.uid,{score:Number(p.score||0),correctVotes:Number(p.correctVotes||0),timesImpostor:Number(p.timesImpostor||0),roundsWon:Number(p.roundsWon||0)}]));const count=Math.min(impostorCount(),Math.max(1,active.length-2));const shuffled=shuffle(active.map(p=>p.uid)),impostors=shuffled.slice(0,count);active.forEach(p=>{if(impostors.includes(p.uid))p.timesImpostor=(p.timesImpostor||0)+1;});const order=shuffle(active.map(p=>p.uid));const priv={};active.forEach(p=>{const imp=impostors.includes(p.uid);priv[p.uid]={role:imp?'impostor':'crewmate',word:imp?(r.settings.wordMode==='related'?pair.impostor:''):pair.crew};});const scoreBefore=Object.fromEntries(active.map(p=>[p.uid,Number(p.score||0)]));r.game.round={pair,impostors,private:priv,order,currentIndex:-1,clues:{},votes:{},ready:{},voteCandidates:active.map(p=>p.uid),revote:false,eliminatedUid:'',caught:false,finalGuess:'',finalGuessCorrect:false,scoreBefore,statsBefore,result:null};setPhase('role',0);active.filter(p=>p.bot).forEach(p=>r.game.round.ready[p.uid]=true);syncAll();if(allRoleReady())setTimeout(beginClues,650);}
  function chooseUnusedPair(){let pool=(r.settings.category==='Custom Topic'?r.settings.customPairs:B().pairs.filter(x=>r.settings.category==='Random Mix'||x.category===r.settings.category));if(r.settings.difficulty) {const d=pool.filter(x=>x.difficulty===r.settings.difficulty);if(d.length)pool=d;}pool=pool.filter(x=>!r.game.pairHistory.includes(x.id));if(!pool.length){r.game.pairHistory=[];pool=(r.settings.category==='Custom Topic'?r.settings.customPairs:B().pairs.filter(x=>r.settings.category==='Random Mix'||x.category===r.settings.category));}const pair=randomPick(pool);if(pair)r.game.pairHistory.push(pair.id);return pair;}
  function setPhase(phase,durationSec){r.game.phase=phase;r.game.phaseEndsAt=durationSec?now()+durationSec*1000:0;r.game.revision++;schedulePhaseExpiry();renderGame();}
  function schedulePhaseExpiry(){clearTimeout(r.phaseTimer);if(!r.game?.phaseEndsAt||!isAuthority())return;const delay=Math.max(20,r.game.phaseEndsAt-now()+40);r.phaseTimer=setTimeout(onPhaseExpired,delay);}
  function onPhaseExpired(){if(!r.game)return;const ph=r.game.phase;if(ph==='clue'){const uid=currentSpeakerUid();if(uid&&!r.game.round.clues[uid])r.game.round.clues[uid]='NO CLUE';advanceClue();}else if(ph==='discussion')beginVoting();else if(ph==='voting'||ph==='revote')resolveVoting();else if(ph==='finalGuess')finishRound();}
  function isAuthority(){return r.role==='solo'||r.role==='host';}
  function allRoleReady(){const active=r.players.filter(p=>p.connected||p.bot);return active.every(p=>r.game.round.ready[p.uid]);}
  function markRoleReady(){const uid=identity().uid||'local';if(r.role==='guest')r.guestSession?.send({t:'roleReady'});else hostRoleReady(uid);}
  function hostRoleReady(uid){if(!isAuthority()||r.game?.phase!=='role')return;r.game.round.ready[uid]=true;syncAll();if(allRoleReady())setTimeout(beginClues,500);}
  function beginClues(){if(!isAuthority())return;r.game.round.currentIndex=0;setPhase('clue',r.settings.clueTimer);syncAll();scheduleBots();sfx('turn');}
  function currentSpeakerUid(){return r.game?.round?.order?.[r.game.round.currentIndex]||'';}
  function hostSubmitClue(uid,raw){if(!isAuthority()||r.game?.phase!=='clue'||uid!==currentSpeakerUid())return;let clue=clean(raw).slice(0,48);if(!clue)clue='NO CLUE';const pair=r.game.round.pair;const secret=r.game.round.private[uid]?.word||'';if(r.settings.clueMode==='text'&&clue!=='NO CLUE'&&containsSecret(clue,secret,pair)){sendError(uid,'Your clue cannot contain the secret word. Try another clue.');return;}r.game.round.clues[uid]=clue;syncAll();sfx('clue');setTimeout(advanceClue,420);}
  function containsSecret(clue,secret,pair){const n=norm(clue),targets=[secret,pair.crew,pair.impostor].map(norm).filter(Boolean);return targets.some(t=>t.length>=3&&(n===t||n.includes(t)));}
  function advanceClue(){if(!isAuthority()||r.game.phase!=='clue')return;r.game.round.currentIndex++;if(r.game.round.currentIndex>=r.game.round.order.length){if(r.settings.discussionTimer>0){setPhase('discussion',r.settings.discussionTimer);syncAll();sfx('phase');}else beginVoting();return;}setPhase('clue',r.settings.clueTimer);syncAll();scheduleBots();sfx('turn');}
  function beginVoting(candidates=null,revote=false){r.game.round.votes={};r.game.round.voteCandidates=candidates||r.players.filter(p=>p.connected||p.bot).map(p=>p.uid);r.game.round.revote=!!revote;setPhase(revote?'revote':'voting',r.settings.votingTimer);syncAll();scheduleBots();sfx('vote');haptic(10);}
  function hostSubmitVote(uid,targetUid){if(!isAuthority()||!['voting','revote'].includes(r.game?.phase))return;const eligible=r.game.round.voteCandidates;if(!eligible.includes(targetUid)||targetUid===uid)return;if(r.game.round.votes[uid]&&!r.settings.allowVoteChanges)return;r.game.round.votes[uid]=targetUid;syncAll();if(allVotesIn())setTimeout(resolveVoting,450);}
  function allVotesIn(){const voters=r.players.filter(p=>(p.connected||p.bot)&&r.game.round.voteCandidates.includes(p.uid)||((p.connected||p.bot)&&r.game.phase==='revote'));return voters.every(p=>r.game.round.votes[p.uid]);}
  function resolveVoting(){if(!isAuthority()||!['voting','revote'].includes(r.game.phase))return;const active=r.players.filter(p=>p.connected||p.bot);const tally={};Object.values(r.game.round.votes).forEach(uid=>tally[uid]=(tally[uid]||0)+1);const max=Math.max(0,...Object.values(tally));const top=Object.keys(tally).filter(uid=>tally[uid]===max&&max>0);if(top.length>1&&r.settings.tieRule==='revote'&&!r.game.round.revote){beginVoting(top,true);toast('Tie! Revote between tied players.');return;}if(top.length!==1){r.game.round.eliminatedUid='';r.game.round.caught=false;revealVotes();setTimeout(finishRound,1800);return;}const eliminated=top[0];r.game.round.eliminatedUid=eliminated;r.game.round.caught=r.game.round.impostors.includes(eliminated);revealVotes();if(r.game.round.caught){setTimeout(()=>{setPhase('reveal',0);syncAll();showReveal(eliminated);setTimeout(()=>beginFinalGuess(eliminated),2300);},900);}else setTimeout(finishRound,2100);}
  function revealVotes(){setPhase('voteReveal',0);syncAll();sfx('reveal');}
  function beginFinalGuess(uid){r.game.round.finalGuesserUid=uid;setPhase('finalGuess',20);syncAll();scheduleBots();}
  function hostFinalGuess(uid,answer){if(!isAuthority()||r.game?.phase!=='finalGuess'||uid!==r.game.round.finalGuesserUid)return;r.game.round.finalGuess=clean(answer).slice(0,60);r.game.round.finalGuessCorrect=norm(answer)===norm(r.game.round.pair.crew);syncAll();setTimeout(finishRound,500);}
  function finishRound(){if(!isAuthority()||!r.game?.round)return;clearPhaseTimers();const round=r.game.round,active=r.players.filter(p=>p.connected||p.bot);const impostors=new Set(round.impostors);const breakdown=Object.fromEntries(active.map(p=>[p.uid,[]]));for(const p of active){const vote=round.votes[p.uid];if(!impostors.has(p.uid)&&impostors.has(vote)){p.score+=100;p.correctVotes=(p.correctVotes||0)+1;breakdown[p.uid].push({points:100,label:'Correct Impostor vote'});}}
    let winner='IMPOSTOR WINS';let headline='IMPOSTOR WINS!';let explanation='The Impostor survived the vote.';if(round.caught){active.filter(p=>!impostors.has(p.uid)).forEach(p=>{p.score+=50;breakdown[p.uid].push({points:50,label:'Impostor found'});});const caught=r.players.find(p=>p.uid===round.eliminatedUid);if(round.finalGuessCorrect&&caught){caught.score+=150;breakdown[caught.uid].push({points:150,label:'Comeback secret-word guess'});winner='IMPOSTOR';headline='IMPOSTOR STEALS THE ROUND!';explanation=`${caught.name} was caught, but correctly guessed the Crewmates' secret word: ${round.pair.crew}.`;active.filter(p=>impostors.has(p.uid)).forEach(p=>p.roundsWon=(p.roundsWon||0)+1);}else{winner='CREWMATES';headline='CREWMATES WIN!';const caughtName=caught?.name||'The Impostor';explanation=`${caughtName} was correctly identified and failed the final secret-word guess.`;active.filter(p=>!impostors.has(p.uid)).forEach(p=>p.roundsWon=(p.roundsWon||0)+1);}}else{const anyCrewVote=Object.entries(round.votes).some(([voter,target])=>!impostors.has(voter)&&impostors.has(target));active.filter(p=>impostors.has(p.uid)).forEach(p=>{p.score+=200;breakdown[p.uid].push({points:200,label:'Survived the vote'});p.roundsWon=(p.roundsWon||0)+1;if(!anyCrewVote){p.score+=100;breakdown[p.uid].push({points:100,label:'Fooled every Crewmate'});}});winner='IMPOSTOR';headline='IMPOSTOR WINS!';const names=round.impostors.map(uid=>r.players.find(p=>p.uid===uid)?.name||'Impostor').join(' & ');explanation=`${names} survived the vote and wins the round.`;}
    const gains=Object.fromEntries(active.map(p=>[p.uid,Number(p.score||0)-Number(round.scoreBefore?.[p.uid]||0)]));round.result={winner,headline,explanation,secret:round.pair.crew,impostorWord:r.settings.wordMode==='related'?round.pair.impostor:'NO WORD',impostors:round.impostors.slice(),votes:{...round.votes},eliminatedUid:round.eliminatedUid,caught:round.caught,finalGuess:round.finalGuess,finalGuessCorrect:round.finalGuessCorrect,gains,breakdown};setPhase('result',0);syncAll();sfx(round.caught?'win':'impostor');}
  function matchDone(){return r.settings.rounds>0&&r.game.roundIndex>=r.settings.rounds;}
  function nextRound(){if(!isAuthority()||r.game?.phase!=='result')return;if(matchDone()){finishMatch();return;}beginRound();}
  function retryRound(){if(!isAuthority()||r.game?.phase!=='result'||!r.game?.round)return;const round=r.game.round;const snapshot=round.statsBefore||{};for(const p of r.players){const s=snapshot[p.uid];if(!s)continue;p.score=Number(s.score||0);p.correctVotes=Number(s.correctVotes||0);p.timesImpostor=Number(s.timesImpostor||0);p.roundsWon=Number(s.roundsWon||0);}r.game.roundIndex=Math.max(0,r.game.roundIndex-1);r.game.round=null;r.game.leaderboardDone=false;toast('Round reset. New word and roles loading…');beginRound();}
  function finishMatch(force=false){if(!isAuthority())return;clearPhaseTimers();const board=leaderboard();r.game.leaderboardDone=true;broadcast({t:'final',leaderboard:board});showFinal(board);if(force&&r.role==='host')r.bridge.touchCodeImpostorRoom({roomCode:r.roomCode,status:'finished',meta:r.roomMeta}).catch(()=>{});}
  function leaderboard(){return r.players.slice().sort((a,b)=>b.score-a.score||b.correctVotes-a.correctVotes).map((p,i)=>({rank:i+1,uid:p.uid,name:p.name,score:p.score||0,correctVotes:p.correctVotes||0,timesImpostor:p.timesImpostor||0,roundsWon:p.roundsWon||0}));}

  function publicSettings(){const {customPairs,...s}=r.settings;return {...s,customPairs:undefined};}
  function publicSnapshot(){if(!r.game)return null;const round=r.game.round||{};const votesPublic=['voteReveal','reveal','finalGuess','result'].includes(r.game.phase);const identityPublic=['reveal','finalGuess','result'].includes(r.game.phase);return {revision:r.game.revision,roundIndex:r.game.roundIndex,totalRounds:r.settings.rounds,phase:r.game.phase,phaseEndsAt:r.game.phaseEndsAt,settings:publicSettings(),players:r.players.map(p=>({uid:p.uid,seat:p.seat,name:p.name,score:p.score||0,connected:!!p.connected,bot:!!p.bot,correctVotes:p.correctVotes||0,timesImpostor:p.timesImpostor||0,roundsWon:p.roundsWon||0})),order:round.order||[],currentUid:currentSpeakerUid(),clues:{...(round.clues||{})},voteCount:Object.keys(round.votes||{}).length,voteCandidates:round.voteCandidates||[],votes:votesPublic?{...(round.votes||{})}:undefined,eliminatedUid:votesPublic?round.eliminatedUid:'',caught:identityPublic?!!round.caught:false,result:r.game.phase==='result'?round.result:null,roleReadyCount:Object.keys(round.ready||{}).length,roleReadyNeeded:r.players.filter(p=>p.connected||p.bot).length,finalGuesserUid:r.game.phase==='finalGuess'?round.finalGuesserUid:''};}
  function privateSnapshot(uid){const round=r.game?.round;if(!round)return null;const priv=round.private?.[uid];return priv?{...priv,isImpostor:priv.role==='impostor'}:null;}
  function sendStateToPeer(peer){if(!peer?.connected)return;peer.session.send({t:'state',public:publicSnapshot(),private:peer.joinRole==='player'?privateSnapshot(peer.uid):null});}
  function syncAll(){if(!isAuthority())return;renderGame();for(const peer of r.peers.values())sendStateToPeer(peer);}
  function sendError(uid,message){const peer=r.peers.get(uid);if(peer?.connected)peer.session.send({t:'error',message});else if(uid===(identity().uid||'local'))toast(message);}

  function localUid(){return identity().uid||'local';}
  function currentPublic(){return isAuthority()?publicSnapshot():r.guestPublic;}
  function currentPrivate(){return isAuthority()?privateSnapshot(localUid()):r.guestPrivate;}
  function playerName(uid,pub=currentPublic()){return pub?.players?.find(p=>p.uid===uid)?.name||'PLAYER';}
  function renderGame(){const pub=currentPublic();if(!pub)return;const priv=currentPrivate();const game=$('[data-ci-game]');const spectator=r.role==='spectator'||(r.role==='host'&&!r.settings.hostPlays);game.dataset.phase=pub.phase||'';game.classList.toggle('solo-game',r.role==='solo');game.classList.toggle('local-turn',pub.phase==='clue'&&pub.currentUid===localUid());game.classList.toggle('projector',spectator&&r.viewMode==='projector'||r.role==='host'&&!r.settings.hostPlays);game.classList.toggle('spectator',spectator);$('[data-ci-live-code]').textContent=r.roomCode||'SOLO';$('[data-ci-round-label]').textContent=`ROUND ${pub.roundIndex}${pub.totalRounds?` / ${pub.totalRounds}`:' · ENDLESS'}`;$('[data-ci-phase-label]').textContent=phaseLabel(pub.phase);renderPrivate(pub,priv,spectator);renderStage(pub,priv);renderActions(pub,priv,spectator);renderScores(pub);renderHostControls(pub);updateTimer();}
  function phaseLabel(p){return ({role:'ROLE REVEAL',clue:'CLUE PHASE',discussion:'DISCUSSION',voting:'VOTING',revote:'REVOTE',voteReveal:'VOTE REVEAL',reveal:'IMPOSTOR REVEAL',finalGuess:'FINAL WORD GUESS',result:'ROUND RESULT'}[p]||'CODE IMPOSTOR');}
  function renderPrivate(pub,priv,spectator){const card=$('[data-ci-private-card]'),game=$('[data-ci-game]');const hide=spectator||pub.phase!=='role';game?.classList.toggle('private-hidden',hide);if(hide){card.hidden=true;if(pub.phase!=='role'){$('[data-ci-private-role]').textContent='PRIVATE INFO LOCKED';$('[data-ci-secret]').textContent='••••••';$('[data-ci-private-note]').textContent='Role and secret word stay private until the round reveal.';}return;}card.hidden=false;const ready=$('[data-ci-role-ready]');if(pub.phase==='role'&&priv){$('[data-ci-private-role]').textContent=priv.role==='impostor'?'IMPOSTOR':'CREWMATE';$('[data-ci-private-role]').classList.toggle('impostor',priv.role==='impostor');$('[data-ci-secret]').textContent=priv.role==='impostor'&&!priv.word?'YOU DO NOT KNOW THE WORD':priv.word;$('[data-ci-private-note]').textContent=priv.role==='impostor'?(priv.word?'Your word is related, but different. Blend in.':'Listen carefully to clues and blend in.'):'Do not say the secret word directly. Give one short clue.';card.classList.toggle('impostor',priv.role==='impostor');ready.hidden=false;ready.disabled=false;}else{ready.hidden=true;$('[data-ci-private-role]').textContent='PRIVATE INFO LOCKED';$('[data-ci-secret]').textContent='••••••';$('[data-ci-private-note]').textContent='Role and secret word stay private until the round reveal.';card.classList.remove('impostor');}}
  function renderStage(pub,priv){const kicker=$('[data-ci-stage-kicker]'),title=$('[data-ci-stage-title]'),sub=$('[data-ci-stage-sub]');if(pub.phase==='role'){kicker.textContent='PRIVATE ROLE REVEAL';title.textContent=`${pub.roleReadyCount} / ${pub.roleReadyNeeded} READY`;sub.textContent='Players: read your private role and word, then tap I\'M READY.';}else if(pub.phase==='clue'){kicker.textContent='CURRENT PLAYER';title.textContent=playerName(pub.currentUid,pub);sub.textContent=pub.currentUid===localUid()?'YOUR TURN — give one short clue now.':'Listen carefully. What does this clue reveal?';}else if(pub.phase==='discussion'){kicker.textContent=r.role==='solo'?'QUICK DISCUSSION':'DISCUSSION';title.textContent=r.role==='solo'?'Who feels out of place?':'Who sounds suspicious?';sub.textContent=r.role==='solo'?'Review the clues, then vote. Solo discussion is capped at 8 seconds — or vote early below.':'Compare the clues. Do not reveal your secret word.';}else if(pub.phase==='voting'||pub.phase==='revote'){kicker.textContent=pub.phase==='revote'?'TIE REVOTE':'VOTING';title.textContent=`${pub.voteCount} / ${pub.players.length} VOTES`;sub.textContent='Votes are private until the reveal.';}else if(pub.phase==='voteReveal'){kicker.textContent='VOTE REVEAL';title.textContent=pub.eliminatedUid?`${playerName(pub.eliminatedUid,pub)} received the top vote`:'No player was eliminated';sub.textContent='Votes are now public.';}else if(pub.phase==='reveal'){kicker.textContent=pub.caught?'IMPOSTOR FOUND':'NOT THE IMPOSTOR';title.textContent=pub.eliminatedUid?playerName(pub.eliminatedUid,pub):'NO ELIMINATION';sub.textContent=pub.caught?'One last word guess can still trigger a comeback.':'The Impostor survived the vote.';}else if(pub.phase==='finalGuess'){kicker.textContent='FINAL WORD GUESS';title.textContent=`${playerName(pub.finalGuesserUid,pub)} gets one last chance`;sub.textContent='Guess the Crewmates\' actual secret word.';}else if(pub.phase==='result'){kicker.textContent='ROUND COMPLETE';title.textContent=pub.result?.headline||pub.result?.winner||'RESULT';sub.textContent=pub.result?.explanation||`Secret Word: ${pub.result?.secret||'—'}`;}
    const clues=$('[data-ci-clues]');let rows=(pub.order||[]).map((uid,i)=>{const clue=pub.clues?.[uid];return `<article class="ci-clue-row ${uid===pub.currentUid&&pub.phase==='clue'?'active':''}"><span>${i+1}</span><strong>${esc(playerName(uid,pub))}</strong><b>${clue?esc(clue):'••••••'}</b></article>`;}).join('');
    if(['voteReveal','reveal','finalGuess','result'].includes(pub.phase)&&pub.votes){const voteRows=pub.players.map((p,i)=>{const target=pub.votes[p.uid];return `<article class="ci-vote-reveal-row" style="--vote-delay:${i}"><strong>${esc(p.name)}</strong><span>→</span><b>${target?esc(playerName(target,pub)):'NO VOTE'}</b></article>`;}).join('');rows+=`<div class="ci-vote-reveal-list"><em>VOTE REVEAL</em>${voteRows}</div>`;}
    clues.innerHTML=rows||'<div class="ci-empty">Clues will appear here without revealing any secret words.</div>';}
  function renderActions(pub,priv,spectator){const box=$('[data-ci-actions]');if(spectator){box.innerHTML=`<div class="ci-watch-note"><strong>VIEW-ONLY SCREEN</strong><span>Spectators can see clues, timers, vote progress, reveals, and scores — never private roles or secret words before reveal.</span></div>`;return;}const uid=localUid();if(pub.phase==='clue'&&pub.currentUid===uid){if(pub.settings.clueMode==='verbal')box.innerHTML=`<button class="ci-mega-action" type="button" data-act-verbal>I GAVE MY CLUE</button>`;else box.innerHTML=`<form class="ci-clue-form" data-act-clue-form><label><span>YOUR ONE SHORT CLUE</span><input data-act-clue maxlength="48" autocomplete="off" placeholder="Example: Sand"></label><button type="submit">SUBMIT CLUE</button></form>`;}else if(pub.phase==='discussion'&&r.role==='solo'){box.innerHTML=`<div class="ci-solo-discuss"><div><strong>READY TO ACCUSE?</strong><span>You do not need to wait for the timer. Review the clues and move straight to voting when ready.</span></div><button type="button" data-act-solo-vote-now>VOTE NOW</button></div>`;}else if(pub.phase==='voting'||pub.phase==='revote'){const candidates=(pub.voteCandidates||[]).filter(x=>x!==uid);box.innerHTML=`<div class="ci-vote-grid">${candidates.map(x=>`<button type="button" data-act-vote="${esc(x)}"><span>${esc(playerName(x,pub).charAt(0))}</span><strong>${esc(playerName(x,pub))}</strong><small>VOTE</small></button>`).join('')}</div>`;}else if(pub.phase==='finalGuess'&&pub.finalGuesserUid===uid){box.innerHTML=`<form class="ci-clue-form final" data-act-final-form><label><span>GUESS THE CREWMATES' SECRET WORD</span><input data-act-final maxlength="60" autocomplete="off" placeholder="Type the exact word"></label><button type="submit">LOCK GUESS</button></form>`;}else if(pub.phase==='result'){const result=pub.result||{};const imps=(result.impostors||[]).map(x=>playerName(x,pub)).join(' · ');const gains=pub.players.slice().sort((a,b)=>(result.gains?.[b.uid]||0)-(result.gains?.[a.uid]||0)).map(p=>{const detail=(result.breakdown?.[p.uid]||[]).map(x=>`+${Number(x.points||0)} ${esc(x.label||'')}`).join(' · ');return `<article class="ci-gain-card"><div><strong>${esc(p.name)}</strong><small>${detail||'No points this round'}</small></div><b>+${Math.max(0,Number(result.gains?.[p.uid]||0))}</b></article>`;}).join('');const authority=isAuthority();const done=authority?matchDone():false;const actionButtons=authority?(done?`<button class="ci-primary" type="button" data-act-final-results>FINAL RESULTS</button><button class="ci-secondary" type="button" data-act-retry-round>RETRY ROUND</button>`:`<button class="ci-primary" type="button" data-act-next-round>NEXT ROUND →</button><button class="ci-secondary" type="button" data-act-retry-round>RETRY ROUND</button>`):`<div class="ci-result-wait"><strong>WAITING FOR HOST</strong><span>The Host will start the next round.</span></div>`;box.innerHTML=`<div class="ci-result-callout ${result.caught&&result.finalGuessCorrect?'comeback':result.winner==='CREWMATES'?'crew':'impostor'}"><span>ROUND ${pub.roundIndex} RESULT</span><strong>${esc(result.headline||result.winner||'ROUND COMPLETE')}</strong><p>${esc(result.explanation||'')}</p></div><div class="ci-result-mini"><div><span>IMPOSTOR${(result.impostors||[]).length>1?'S':''}</span><strong>${esc(imps||'—')}</strong></div><div><span>SECRET WORD</span><strong>${esc(result.secret||'—')}</strong></div><div><span>IMPOSTOR WORD</span><strong>${esc(result.impostorWord||'—')}</strong></div></div><div class="ci-round-gains">${gains}</div><div class="ci-round-result-actions">${actionButtons}<button class="ci-secondary" type="button" data-act-mini-games>← MINI-GAMES</button><button class="ci-danger ghost" type="button" data-act-exit-game>EXIT</button></div>`;}else box.innerHTML=`<div class="ci-wait-action"><strong>${pub.phase==='clue'?`${esc(playerName(pub.currentUid,pub))} is giving a clue…`:phaseLabel(pub.phase)}</strong><span>Watch the board and wait for your action.</span></div>`;
    bindActionControls();}
  function bindActionControls(){$('[data-act-clue-form]')?.addEventListener('submit',e=>{e.preventDefault();submitLocalClue($('[data-act-clue]')?.value||'');});$('[data-act-verbal]')?.addEventListener('click',()=>submitLocalVerbal());$('[data-act-solo-vote-now]')?.addEventListener('click',()=>{if(r.role==='solo'&&r.game?.phase==='discussion')beginVoting();});$$('[data-act-vote]').forEach(b=>b.addEventListener('click',()=>submitLocalVote(b.dataset.actVote)));$('[data-act-final-form]')?.addEventListener('submit',e=>{e.preventDefault();submitLocalFinal($('[data-act-final]')?.value||'');});$('[data-act-next-round]')?.addEventListener('click',nextRound);$('[data-act-retry-round]')?.addEventListener('click',retryRound);$('[data-act-final-results]')?.addEventListener('click',()=>finishMatch());$('[data-act-mini-games]')?.addEventListener('click',returnToMiniGames);$('[data-act-exit-game]')?.addEventListener('click',()=>close());}
  function renderScores(pub){$('[data-ci-score-strip]').innerHTML=pub.players.slice().sort((a,b)=>b.score-a.score).map((p,i)=>`<div class="ci-score-chip"><span>#${i+1}</span><strong>${esc(p.name)}</strong><b>${Number(p.score||0).toLocaleString()}</b></div>`).join('');}
  function renderHostControls(pub){const el=$('[data-ci-host-controls]');el.hidden=r.role!=='host';if(r.role==='host'){$('[data-ci-host-next]').hidden=true;$('[data-ci-host-skip]').hidden=pub.phase==='result';}}
  function submitLocalClue(clue){if(r.role==='guest')r.guestSession?.send({t:'clue',clue});else hostSubmitClue(localUid(),clue);}
  function submitLocalVerbal(){if(r.role==='guest')r.guestSession?.send({t:'verbalClue'});else hostSubmitClue(localUid(),'✓ Verbal clue');}
  function submitLocalVote(target){
    if(!target)return;
    r.pendingVoteTarget=String(target);
    const layer=$('[data-ci-confirm]');
    const name=$('[data-ci-confirm-name]');
    if(name)name.textContent=playerName(target);
    if(layer){layer.hidden=false;requestAnimationFrame(()=>{try{$('[data-ci-confirm-vote]')?.focus({preventScroll:true});}catch(_){}});}
  }
  function closeVoteConfirm(){r.pendingVoteTarget='';const layer=$('[data-ci-confirm]');if(layer)layer.hidden=true;}
  function confirmPendingVote(){
    const target=String(r.pendingVoteTarget||'');
    if(!target){closeVoteConfirm();return;}
    closeVoteConfirm();
    if(r.role==='guest')r.guestSession?.send({t:'vote',targetUid:target});else hostSubmitVote(localUid(),target);
    sfx('vote');haptic(14);toast(`Vote locked for ${playerName(target)}.`);
  }
  function submitLocalFinal(answer){if(r.role==='guest')r.guestSession?.send({t:'finalGuess',answer});else hostFinalGuess(localUid(),answer);}
  function updateTimer(){const pub=currentPublic(),el=$('[data-ci-timer]');if(!pub||!el)return;if(!pub.phaseEndsAt){el.textContent='—';return;}el.textContent=`${Math.max(0,Math.ceil((pub.phaseEndsAt-now())/1000))}s`;}
  function startTick(){stopTick();r.tickTimer=setInterval(()=>{if(r.state==='game'){updateTimer();if(isAuthority())scheduleBots();}},250);}
  function stopTick(){clearInterval(r.tickTimer);r.tickTimer=0;}

  function scheduleBots(){if(!isAuthority()||!r.game)return;const pub=publicSnapshot();if(pub.phase==='clue'){const uid=pub.currentUid,p=r.players.find(x=>x.uid===uid);if(p?.bot&&!r.botTimers.size){const t=setTimeout(()=>{r.botTimers.delete(t);hostSubmitClue(uid,botClue(p));},botDelay(p));r.botTimers.add(t);}}else if(['voting','revote'].includes(pub.phase)){for(const p of r.players.filter(x=>x.bot&&!r.game.round.votes[x.uid])){const t=setTimeout(()=>{r.botTimers.delete(t);hostSubmitVote(p.uid,botVote(p));},500+Math.random()*1200);r.botTimers.add(t);}}else if(pub.phase==='finalGuess'){const p=r.players.find(x=>x.uid===pub.finalGuesserUid);if(p?.bot&&!r.botTimers.size){const t=setTimeout(()=>{r.botTimers.delete(t);const chance={easy:.28,normal:.48,hard:.68}[p.botLevel]||.48;hostFinalGuess(p.uid,Math.random()<chance?r.game.round.pair.crew:r.game.round.pair.impostor);},900);r.botTimers.add(t);}}}
  function botDelay(p){const base={easy:1600,normal:1150,hard:800}[p.botLevel]||1150;if(r.role==='solo')return Math.round(base*.7+Math.random()*480);return base+Math.random()*900;}
  function botClue(p){const priv=r.game.round.private[p.uid],pair=r.game.round.pair;const pool=priv.role==='impostor'?(r.settings.wordMode==='none'?[]:pair.impostorClues):pair.crewClues;if(pool?.length){let options=pool.slice();if(p.personality==='bold'&&options.length>1)return options[0];if(p.personality==='quiet'&&options.length>2)return options[options.length-1];return randomPick(options);}return priv.role==='impostor'?'common':(pair.category||'related');}
  function botVote(p){const candidates=r.game.round.voteCandidates.filter(uid=>uid!==p.uid);const priv=r.game.round.private[p.uid],level=p.botLevel||'normal';if(priv.role==='impostor')return randomPick(candidates.filter(x=>!r.game.round.impostors.includes(x)))||randomPick(candidates);const accuracy={easy:.38,normal:.58,hard:.76}[level]||.58;if(Math.random()<accuracy){const possible=r.game.round.impostors.filter(x=>candidates.includes(x));if(possible.length)return randomPick(possible);}return randomPick(candidates);}

  function showReveal(uid){const layer=$('[data-ci-reveal-layer]');$('[data-ci-reveal-kicker]').textContent='IMPOSTOR FOUND';$('[data-ci-reveal-name]').textContent=playerName(uid);$('[data-ci-reveal-sub]').textContent='was one of the Impostors';layer.hidden=false;sfx('impostor');haptic([45,35,70]);setTimeout(()=>layer.hidden=true,2100);}
  function showFinal(board){show('final');const rows=board||leaderboard();const top=rows[0];const tied=top?rows.filter(x=>Number(x.score||0)===Number(top.score||0)):[];const title=$('[data-ci-final-winner-title]'),sub=$('[data-ci-final-winner-sub]');if(title&&sub){if(!top){title.textContent='MATCH COMPLETE';sub.textContent='No final score available.';}else if(tied.length>1){title.textContent='TIE GAME!';sub.textContent=`${tied.map(x=>x.name).join(' & ')} finish tied at ${Number(top.score||0).toLocaleString()} points.`;}else{title.textContent=`${top.name} WINS!`;sub.textContent=`Final score: ${Number(top.score||0).toLocaleString()} points · ${top.roundsWon||0} round${Number(top.roundsWon||0)===1?'':'s'} won.`;}}$('[data-ci-final-board]').innerHTML=rows.map(row=>`<article class="ci-final-row ${row.rank===1?'winner':''}"><span>#${row.rank}</span><div><strong>${esc(row.name)}</strong><small>Correct Votes ${row.correctVotes} · Impostor ${row.timesImpostor}× · Rounds Won ${row.roundsWon}</small></div><b>${Number(row.score).toLocaleString()}</b></article>`).join('');}
  function rematch(){if(r.role==='solo'){startSolo();return;}if(r.role==='host'){r.players.forEach(p=>{p.ready=p.uid===identity().uid&&r.settings.hostPlays;p.score=0;p.correctVotes=0;p.timesImpostor=0;p.roundsWon=0;});r.game=null;enterLobby();broadcastLobby();startHostSignalLoop();}else toast('Wait for the Host to start another match.');}
  function hostAdvance(){if(!isAuthority()||!r.game)return;const ph=r.game.phase;if(ph==='role')beginClues();else if(ph==='clue'){const uid=currentSpeakerUid();if(uid&&!r.game.round.clues[uid])r.game.round.clues[uid]='NO CLUE';advanceClue();}else if(ph==='discussion')beginVoting();else if(ph==='voting'||ph==='revote')resolveVoting();else if(ph==='finalGuess')finishRound();else if(ph==='result')nextRound();}

  function clearPhaseTimers(){clearTimeout(r.phaseTimer);r.phaseTimer=0;for(const t of r.botTimers)clearTimeout(t);r.botTimers.clear();}
  function copyRoom(){P()?.copyText?.(r.roomCode).then(ok=>toast(ok?'Room code copied.':'Could not copy.'));}
  function shareRoom(){P()?.shareText?.(`Join my Code Impostor room: ${r.roomCode}`,'Code Impostor').then(()=>{});}
  async function openScanner(){const wrap=$('[data-ci-scanner]'),video=$('[data-ci-scan-video]');wrap.hidden=false;try{r.scannerStop=await P().openScanner({video,acceptPrefix:ROOM_QR_PREFIX,onScan:value=>{const parts=String(value).split(':');const code=parts[1]||'';if(parts[2]==='SPECTATOR'){r.joinRole='spectator';r.viewMode='projector';}else if(r.joinRole!=='spectator'){r.joinRole='player';}$('[data-ci-room-input]').value=code;closeScanner();joinRoom(code);}});}catch(e){toast(e?.message||'QR scanning unavailable.');closeScanner();}}
  function closeScanner(){try{r.scannerStop?.();}catch(_){}r.scannerStop=null;$('[data-ci-scanner]').hidden=true;}

  async function returnToMiniGames(){
    const cb=r.onBack;
    closeVoteConfirm();
    try{
      if(r.roomCode&&r.role)await leaveRoomToHome();
      else{clearNetwork();show('home');}
    }catch(_){clearNetwork();show('home');}
    r.overlay.hidden=true;r.open=false;
    try{cb?.();}catch(_){}
  }

  async function leaveRoomToHome(){const room=r.roomCode;if(r.role==='host'){const candidates=r.players.filter(p=>p.connected&&!p.bot&&p.uid!==identity().uid);if(candidates.length&&r.bridge?.transferCodeImpostorHost){const next=candidates[0],peer=r.peers.get(next.uid);try{const oldHostUid=identity().uid;let transferredPlayers=r.players.map(p=>({...p}));if(r.state==='lobby')transferredPlayers=transferredPlayers.filter(p=>p.uid!==oldHostUid);else{const leaving=transferredPlayers.find(p=>p.uid===oldHostUid);if(leaving){leaving.connected=r.settings.allowBotReplacement===true;leaving.bot=r.settings.allowBotReplacement===true;if(leaving.bot)leaving.name=`${leaving.name} · BOT`;}}const meta=await r.bridge.transferCodeImpostorHost({roomCode:room,targetUid:next.uid,targetName:next.name,targetStudentId:next.studentId||'',meta:r.roomMeta});peer?.session?.send({t:'hostTransfer',meta,settings:r.settings,players:transferredPlayers,game:r.game,state:r.state,roomCode:r.roomCode,viewMode:'normal'});for(const [uid,p] of r.peers){if(uid!==next.uid&&p.connected)p.session.send({t:'hostRejoin',newHostUid:next.uid});}toast(`${next.name} is the new Host.`);await new Promise(resolve=>setTimeout(resolve,260));clearNetwork(false);goHome();return;}catch(_){broadcast({t:'exit'});}}else broadcast({t:'exit'});}else r.guestSession?.send({t:'leave'});const host=r.role==='host';clearNetwork(false);if(room&&r.bridge?.leaveCodeImpostorRoom)r.bridge.leaveCodeImpostorRoom({roomCode:room,closeRoom:host}).catch(()=>{});goHome();}
  function assumeTransferredHost(msg){try{r.guestSession?.close();}catch(_){}r.guestSession=null;r.role='host';r.roomMeta=msg.meta||r.roomMeta;r.roomCode=msg.roomCode||r.roomCode;r.settings={...DEFAULT_SETTINGS,...(msg.settings||{})};r.players=Array.isArray(msg.players)?msg.players.map(p=>({...p})):r.players;r.game=msg.game||r.game;r.spectators=[];r.peers.clear();r.seatByUid.clear();r.players.forEach(p=>r.seatByUid.set(p.uid,p.seat));r.localSeat=r.seatByUid.get(identity().uid)??0;if(msg.state==='game'){show('game');renderGame();}else enterLobby();startHostSignalLoop();toast('You are now the Host.',2600);}
  function clearNetwork(clearRoom=true){clearPhaseTimers();stopTick();clearTimeout(r.signalTimer);clearInterval(r.roomTouchTimer);clearTimeout(r.reconnectTimer);for(const t of r.disconnectTimers.values())clearTimeout(t);r.disconnectTimers.clear();for(const p of r.peers.values())try{p.session?.close();}catch(_){}r.peers.clear();try{r.guestSession?.close();}catch(_){}r.guestSession=null;r.players=[];r.spectators=[];r.seatByUid.clear();if(clearRoom){r.roomCode='';r.roomMeta=null;}r.game=null;r.guestPublic=null;r.guestPrivate=null;}
  function goHome(){closeVoteConfirm();clearNetwork();r.role='';r.joinRole='player';r.viewMode='normal';show('home');}

  function haptic(pattern=12){if(r.settings?.vibration===false)return;try{navigator.vibrate?.(pattern);}catch(_){}}
  function toggleSound(){r.soundEnabled=!r.soundEnabled;const b=$('[data-ci-sound]');b.textContent=r.soundEnabled?'🔊':'🔇';try{r.music?.setEnabled?.(r.soundEnabled);}catch(_){}if(r.soundEnabled)sfx('click');}
  function audio(){if(!r.soundEnabled||r.settings?.sound===false)return null;if(!r.audioCtx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{r.audioCtx=new C();}catch(_){return null;}}try{if(r.audioCtx.state==='suspended')r.audioCtx.resume();}catch(_){}return r.audioCtx;}
  function tone(freq=440,dur=.08,gain=.025,type='sine',delay=0){const ctx=audio();if(!ctx)return;const t=ctx.currentTime+delay/1000,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+dur+.02);}
  function sfx(kind){if(kind==='impostor'){tone(140,.35,.04,'sawtooth');tone(94,.5,.03,'sine',110);}else if(kind==='win'){tone(520,.12,.025,'triangle');tone(660,.14,.025,'triangle',120);tone(820,.2,.028,'triangle',250);}else if(kind==='vote'){tone(300,.08,.02,'triangle');tone(430,.08,.018,'triangle',80);}else if(kind==='reveal'){tone(220,.1,.025,'square');tone(180,.18,.025,'square',100);}else if(kind==='turn'){tone(680,.07,.018,'sine');}else if(kind==='clue'){tone(520,.07,.018,'triangle');}else if(kind==='phase'){tone(360,.08,.018,'sine');tone(470,.08,.018,'sine',85);}else if(kind==='join'){tone(520,.08,.02,'triangle');tone(760,.09,.02,'triangle',90);}else tone(420,.05,.014,'sine');}

  function open(options={}){build();r.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;r.music=options.music||null;r.onBack=options.onBack||null;r.onClose=options.onClose||null;r.soundEnabled=r.bridge?.getSnapshot?.()?.soundEnabled!==false;r.open=true;r.closing=false;r.overlay.hidden=false;fillIdentityInputs();show('home');$('[data-ci-sound]').textContent=r.soundEnabled?'🔊':'🔇';}
  function close(silent=false){if(!r.overlay)return;r.closing=true;closeVoteConfirm();clearNetwork();closeScanner();r.overlay.hidden=true;r.open=false;r.closing=false;if(!silent)r.onClose?.();}

  window[GLOBAL_NAME]=Object.freeze({open,close});
})();
