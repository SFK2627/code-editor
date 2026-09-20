(() => {
  'use strict';

  const GAME_ID = 'byte-quest';
  const ASSET_VERSION = '20260920-v565-byte-quest-progression-safety';
  const DATA = () => window.ICT8_BYTE_QUEST_LEVELS || { worlds: [], levels: [], byId: {}, byWorld: {} };
  const STEP = 1 / 60;
  const GRAVITY = 1650;
  const PLAYER_W = 38;
  const PLAYER_H = 54;
  const COYOTE = 0.12;
  const JUMP_BUFFER = 0.13;
  const JUMP_V = 620;
  const MAX_FALL = 980;

  const state = {
    built: false,
    open: false,
    overlay: null,
    bridge: null,
    music: null,
    onBack: null,
    onClose: null,
    onReward: null,
    soundEnabled: true,
    musicEnabled: true,
    reducedMotion: false,
    audioCtx: null,
    panel: 'home',
    progress: null,
    storageKey: 'ict8.bytequest.v1.guest',
    currentLevelId: '',
    run: null,
    raf: 0,
    lastFrame: 0,
    accumulator: 0,
    hudPaintAt: 0,
    toastTimer: 0,
    resizeObserver: null,
    keyDown: new Set(),
    pointerMap: new Map(),
    input: { left: false, right: false, down: false, jump: false, jumpPressed: false, action: false, actionPressed: false },
    canvas: null,
    ctx: null,
    logicalW: 960,
    logicalH: 540
  };

  const $ = (sel, root = state.overlay) => root?.querySelector?.(sel) || null;
  const $$ = (sel, root = state.overlay) => Array.from(root?.querySelectorAll?.(sel) || []);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
  const lerp = (a, b, t) => a + (b - a) * t;
  const approach = (value, target, delta) => value < target ? Math.min(target, value + delta) : Math.max(target, value - delta);
  const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
  const now = () => performance.now();
  const wallNow = () => Date.now();
  const formatTime = ms => {
    const total = Math.max(0, Math.floor(ms || 0));
    const min = Math.floor(total / 60000);
    const sec = Math.floor((total % 60000) / 1000);
    const cs = Math.floor((total % 1000) / 10);
    return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
  };


  const BOSS_NAMES = Object.freeze({ bugzilla:'BUGZILLA', glitchbeast:'GLITCH BEAST', volttitan:'VOLT TITAN', cloudwarden:'CLOUD WARDEN' });
  function hasBlaster(r) {
    const p = r?.player;
    return Boolean(p && (p.gear?.blasterArm === true || p.weaponUnlocked === true || (p.power === 'pulse' && p.powerUntil > r.elapsed)));
  }
  function hasJumpBoots(r) { return Boolean(r?.player?.gear?.jumpBoots); }
  function tempPowerActive(r, type) { return Boolean(r?.player?.power === type && r.player.powerUntil > r.elapsed); }
  function campaignGear() {
    if (!state.progress) loadProgress();
    return state.progress.gear || (state.progress.gear = { blasterArm:false, jumpBoots:false });
  }
  function syncCampaignGearFromPlayer(r) {
    if (!r?.player) return;
    const gear=campaignGear();
    gear.blasterArm=Boolean(r.player.gear?.blasterArm);
    gear.jumpBoots=Boolean(r.player.gear?.jumpBoots);
    saveProgress();
  }
  function clearCampaignGear() {
    const gear=campaignGear(); gear.blasterArm=false; gear.jumpBoots=false; saveProgress();
  }
  function bossName(b) { return BOSS_NAMES[b?.type] || 'GUARDIAN'; }

  function identityKey() {
    try {
      const id = state.bridge?.getPlayerIdentity?.() || {};
      const uid = String(id.uid || id.studentUid || id.id || '').trim();
      return uid ? `ict8.bytequest.v1.${uid.replace(/[^a-z0-9_-]/gi,'').slice(0,80)}` : 'ict8.bytequest.v1.guest';
    } catch (_) { return 'ict8.bytequest.v1.guest'; }
  }

  function defaultProgress() {
    return { version: 2, startedAt: '', lastLevelId: '1-1', levels: {}, gear: { blasterArm:false, jumpBoots:false }, settings: { music: true, sfx: true, reducedMotion: false } };
  }

  function normalizeProgress(input) {
    const base = defaultProgress();
    const src = input && typeof input === 'object' ? input : {};
    base.startedAt = String(src.startedAt || '');
    base.lastLevelId = DATA().byId?.[src.lastLevelId] ? src.lastLevelId : '1-1';
    base.gear.blasterArm = src.gear?.blasterArm === true;
    base.gear.jumpBoots = src.gear?.jumpBoots === true;
    base.settings.music = src.settings?.music !== false;
    base.settings.sfx = src.settings?.sfx !== false;
    base.settings.reducedMotion = src.settings?.reducedMotion === true;
    const rawLevels = src.levels && typeof src.levels === 'object' ? src.levels : {};
    DATA().levels.forEach(level => {
      const r = rawLevels[level.id] && typeof rawLevels[level.id] === 'object' ? rawLevels[level.id] : {};
      base.levels[level.id] = {
        completed: r.completed === true,
        stars: clamp(Math.floor(r.stars || 0), 0, 3),
        chips: clamp(Math.floor(r.chips || 0), 0, 3),
        bestTimeMs: Math.max(0, Math.floor(Number(r.bestTimeMs || 0))),
        bestScore: Math.max(0, Math.floor(Number(r.bestScore || 0))),
        perfect: r.perfect === true,
        xpClaimed: Math.max(0, Math.min(level.xp, Math.floor(Number(r.xpClaimed || 0)))),
        lastCompletedAt: String(r.lastCompletedAt || '')
      };
    });
    return base;
  }

  function loadProgress() {
    state.storageKey = identityKey();
    try { state.progress = normalizeProgress(JSON.parse(localStorage.getItem(state.storageKey) || '{}')); }
    catch (_) { state.progress = normalizeProgress({}); }
    // When the secure XP backend exposes BYTE QUEST level claims, merge them
    // into the local campaign copy so a different device cannot appear to
    // forget already-cleared stages or already-claimed permanent XP.
    try {
      const remote = state.bridge?.getSnapshot?.()?.gameRecords?.byteQuest;
      const claims = remote?.levelClaims && typeof remote.levelClaims === 'object' ? remote.levelClaims : {};
      Object.entries(claims).forEach(([levelId, row]) => {
        const level = DATA().byId?.[levelId];
        if (!level || !row || typeof row !== 'object') return;
        const p = state.progress.levels[levelId];
        p.completed = p.completed || row.completed === true;
        p.stars = Math.max(p.stars, clamp(Math.floor(row.bestStars || 0), 0, 3));
        p.chips = Math.max(p.chips, clamp(Math.floor(row.bestChips || 0), 0, 3));
        const remoteTime = Math.max(0, Math.floor(Number(row.bestTimeMs || 0)));
        if (remoteTime > 0) p.bestTimeMs = p.bestTimeMs > 0 ? Math.min(p.bestTimeMs, remoteTime) : remoteTime;
        p.bestScore = Math.max(p.bestScore, Math.max(0, Math.floor(Number(row.bestScore || 0))));
        p.perfect = p.perfect || row.perfect === true;
        p.xpClaimed = Math.max(p.xpClaimed, Math.min(level.xp, Math.max(0, Math.floor(Number(row.xpClaimed || 0)))));
        p.lastCompletedAt = [p.lastCompletedAt, String(row.lastCompletedAt || '')].filter(Boolean).sort().pop() || '';
      });
    } catch (_) {}
    state.soundEnabled = state.progress.settings.sfx !== false && state.bridge?.getSnapshot?.()?.soundEnabled !== false;
    state.musicEnabled = state.progress.settings.music !== false;
    state.reducedMotion = state.progress.settings.reducedMotion === true || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  }

  function saveProgress() {
    if (!state.progress) return;
    state.progress.settings = { music: state.musicEnabled, sfx: state.soundEnabled, reducedMotion: state.reducedMotion };
    try { localStorage.setItem(state.storageKey, JSON.stringify(state.progress)); } catch (_) {}
  }

  function progressFor(id) {
    if (!state.progress) loadProgress();
    if (!state.progress.levels[id]) state.progress.levels[id] = normalizeProgress({}).levels[id] || { completed:false,stars:0,chips:0,bestTimeMs:0,bestScore:0,perfect:false,xpClaimed:0,lastCompletedAt:'' };
    return state.progress.levels[id];
  }

  function totalStars() { return DATA().levels.reduce((sum, l) => sum + Number(progressFor(l.id).stars || 0), 0); }
  function totalChips() { return DATA().levels.reduce((sum, l) => sum + Number(progressFor(l.id).chips || 0), 0); }
  function completedCount() { return DATA().levels.reduce((sum, l) => sum + (progressFor(l.id).completed ? 1 : 0), 0); }
  function isLevelUnlocked(level) {
    if (!level) return false;
    if (level.id === '1-1') return true;
    const worldLevels = DATA().byWorld[level.world] || [];
    if (level.order > 1) {
      const prev = worldLevels.find(l => l.order === level.order - 1);
      return Boolean(prev && progressFor(prev.id).completed);
    }
    const prevBoss = DATA().byWorld[level.world - 1]?.find(l => l.type === 'boss');
    return Boolean(prevBoss && progressFor(prevBoss.id).completed);
  }
  function nextLevel(level) {
    const all = DATA().levels;
    const i = all.findIndex(l => l.id === level?.id);
    return i >= 0 && i + 1 < all.length ? all[i + 1] : null;
  }

  function build() {
    if (state.built) return;
    const overlay = document.createElement('div');
    overlay.className = 'bq-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Byte Quest');
    overlay.innerHTML = `
      <section class="bq-shell">
        <header class="bq-topbar">
          <button type="button" class="bq-topbtn" data-bq-back>← MINI-GAMES</button>
          <div class="bq-brand"><span>G8CODE SOLO ADVENTURE</span><strong>BYTE QUEST</strong><small>RUN. JUMP. EXPLORE. RESTORE THE BYTE WORLD.</small></div>
          <div class="bq-top-actions"><button type="button" class="bq-iconbtn" data-bq-sound aria-label="Toggle sound">🔊</button><button type="button" class="bq-iconbtn" data-bq-close aria-label="Close">×</button></div>
        </header>
        <main class="bq-main">
          <section class="bq-panel active" data-bq-panel="home">
            <div class="bq-home">
              <article class="bq-hero"><span class="bq-kicker">ORIGINAL G8CODE PLATFORM ADVENTURE</span><h1>BYTE<br>QUEST</h1><h2>RUN. JUMP. CROUCH. EXPLORE.</h2><p>Guide BYTE through a bigger four-world platform quest with stronger jump control, crouching, improved run feel, longer stages, hidden shortcuts, moving platforms, boss fights, and collectible Data Chips that help you push deeper into the Byte World.</p><div class="bq-badges"><span>20 STAGES</span><span>4 WORLDS</span><span>LONGER LEVELS</span><span>SOLO XP</span><span>PHONE + DESKTOP</span></div><div class="bq-byte-art" aria-hidden="true"></div></article>
              <aside class="bq-home-card"><h3>ADVENTURE STATUS</h3><p data-bq-home-sub>Start your first restoration mission.</p><div class="bq-menu-stack"><button class="bq-btn primary" data-bq-continue>START ADVENTURE</button><button class="bq-btn secondary" data-bq-world-map>WORLD MAP</button><button class="bq-btn secondary" data-bq-how>HOW TO PLAY</button><button class="bq-btn secondary" data-bq-settings>SETTINGS</button></div><div class="bq-home-tip"><strong>NEW GAMEPLAY TUNING</strong><span>Persistent BLASTER ARM + JUMP BOOTS, limited JET/OVERCLOCK cores, safer checkpoints, and visible Link Token guidance.</span></div><div class="bq-mini-progress"><div class="bq-stat"><strong data-bq-stat-levels>0/20</strong><span>STAGES</span></div><div class="bq-stat"><strong data-bq-stat-stars>0/60</strong><span>STARS</span></div><div class="bq-stat"><strong data-bq-stat-chips>0/60</strong><span>DATA CHIPS</span></div></div></aside>
            </div>
          </section>
          <section class="bq-panel" data-bq-panel="map"><div class="bq-map-wrap"><div class="bq-map-head"><div><h1>BYTE WORLD MAP</h1><p>Complete stages to unlock the path. Boss clears restore the next world.</p></div><button class="bq-btn secondary" style="min-height:44px" data-bq-map-home>HOME</button></div><div data-bq-worlds></div></div></section>
          <section class="bq-panel" data-bq-panel="how"><div class="bq-info"><article class="bq-info-card"><h1>HOW TO PLAY</h1><p>BYTE QUEST is a handcrafted platform adventure. Explore each stage, collect the three Data Chips, and reach the Restore Terminal.</p><div class="bq-control-grid"><div class="bq-keyline"><strong>DESKTOP — MOVE</strong><span>A / D or Left / Right Arrow</span></div><div class="bq-keyline"><strong>DESKTOP — JUMP</strong><span>Space / W / Up Arrow</span></div><div class="bq-keyline"><strong>DESKTOP — CROUCH</strong><span>S / Down Arrow to duck under pressure and prepare jumps</span></div><div class="bq-keyline"><strong>DESKTOP — FIRE / POWER</strong><span>X / Shift. BLASTER ARM persists across stages until a full Core death</span></div><div class="bq-keyline"><strong>MOBILE — MOVE</strong><span>Use ◀ ▶ plus the new ▼ crouch button.</span></div><div class="bq-keyline"><strong>MOBILE — JUMP / FIRE</strong><span>Hold movement while pressing JUMP. When BLASTER ARM is equipped, the purple button becomes FIRE.</span></div></div><h2>THREE STARS</h2><p>★ Complete the stage. ★ Collect all three Data Chips. ★ Beat the target time. A Perfect Run requires all chips, target time, and zero damage.</p><h2>DATA BLOCKS & LINK GATES</h2><p>Hit glowing ? Data Blocks from below for Byte Coins and cores. Required Link Tokens are now standalone glowing pickups placed before their matching gates. A strong full jump can break normal blue Data Blocks, while reinforced tunnel blocks make crouching useful. Link Tokens open matching gates later in the stage.</p><h2>GEAR & TEMPORARY CORES</h2><p><strong>BLASTER ARM</strong> and <strong>JUMP BOOTS</strong> persist into later stages while BYTE still has Core Hearts. A full Core death removes persistent gear. <strong>JET CORE</strong> gives limited flight time and <strong>OVERCLOCK</strong> gives temporary contact/hazard invincibility; both expire by timer.</p><h2>COLLECTIBLE BOOSTS</h2><p>Every 10 Byte Coins gives a Sync Bonus: restore one Core Heart if hurt, or activate a short movement boost at full health. Collecting all 3 Data Chips also triggers a temporary Sync Boost.</p><h2>SYNC POINTS</h2><p>Touch a holographic Sync Point to save your respawn location. Retries are unlimited.</p><h2>XP SAFETY</h2><p>Permanent XP is tied to valid stage completion. Replays remain useful for stars, chips, score, secrets, and best time without repeatedly farming the same stage reward.</p><div class="bq-menu-stack"><button class="bq-btn primary" data-bq-how-map>OPEN WORLD MAP</button><button class="bq-btn secondary" data-bq-how-home>BACK HOME</button></div></article></div></section>
          <section class="bq-panel" data-bq-panel="game">
            <div class="bq-game-stage" data-bq-game-stage>
              <div class="bq-canvas-wrap"><canvas class="bq-canvas" data-bq-canvas width="960" height="540"></canvas></div>
              <div class="bq-stage-banner" data-bq-stage-banner hidden><span data-bq-intro-world>WORLD 1</span><strong data-bq-intro-title>FIRST SYNC</strong><small data-bq-intro-objective>Reach the Restore Terminal.</small><button type="button" class="bq-ready-btn" data-bq-ready>READY</button></div>
              <div class="bq-clear-banner" data-bq-clear-banner hidden><span data-bq-clear-kicker>RESTORE COMPLETE</span><strong data-bq-clear-title>LEVEL CLEAR</strong><small data-bq-clear-stars>★★★</small></div>
              <div class="bq-hud"><div class="bq-hud-card bq-hud-left"><div><small>CORE</small><strong class="bq-hearts" data-bq-health>♥ ♥ ♥</strong></div><div class="bq-power-icon" data-bq-power>—</div></div><div class="bq-hud-card bq-hud-mid"><div><small data-bq-level-label>DATA MEADOW 1-1</small><strong class="bq-hud-chip" data-bq-chip>DATA CHIPS 0 / 3</strong></div></div><div class="bq-hud-card bq-hud-right"><div><small>COINS · TIME</small><strong><span data-bq-coins>0</span> · <span class="bq-hud-time" data-bq-time>00:00.00</span></strong></div><button class="bq-pause-fab" data-bq-pause aria-label="Pause">Ⅱ</button></div></div>
              <div class="bq-status-strip"><span data-bq-gear>NORMAL BYTE</span><span data-bq-temp hidden></span><span data-bq-link-status hidden></span></div>
              <div class="bq-toast" data-bq-toast></div>
              <div class="bq-mobile-controls" data-bq-mobile-controls><div class="bq-pad"><button class="bq-control" data-bq-control="left" aria-label="Move left">◀</button><button class="bq-control down" data-bq-control="down" aria-label="Crouch">▼</button><button class="bq-control" data-bq-control="right" aria-label="Move right">▶</button></div><div class="bq-right-controls"><button class="bq-control action" data-bq-control="action" aria-label="Power">POWER</button><button class="bq-control jump" data-bq-control="jump" aria-label="Jump">JUMP</button></div></div>
              <div class="bq-modal-layer" data-bq-pause-layer hidden><div class="bq-modal"><h2>PAUSED</h2><p>The Byte World is frozen. Your timer will resume when you continue.</p><div class="bq-modal-actions"><button class="bq-btn primary" data-bq-resume>RESUME</button><button class="bq-btn secondary" data-bq-restart>RESTART LEVEL</button><button class="bq-btn secondary" data-bq-game-settings>SETTINGS</button><button class="bq-btn warn" data-bq-exit-map>EXIT TO WORLD MAP</button></div></div></div>
              <div class="bq-modal-layer" data-bq-settings-layer hidden><div class="bq-modal"><h2>SETTINGS</h2><p>Settings apply across BYTE QUEST.</p><div class="bq-setting"><strong>MUSIC</strong><button class="bq-switch" data-bq-setting="music"><i></i></button></div><div class="bq-setting"><strong>SFX</strong><button class="bq-switch" data-bq-setting="sfx"><i></i></button></div><div class="bq-setting"><strong>REDUCED MOTION</strong><button class="bq-switch" data-bq-setting="motion"><i></i></button></div><button class="bq-btn primary" data-bq-settings-done>DONE</button></div></div>
            </div>
          </section>
          <section class="bq-panel" data-bq-panel="result"><div class="bq-result-wrap"><article class="bq-result-card" data-bq-result-card></article></div></section>
        </main>
      </section>`;
    document.body.appendChild(overlay);
    state.overlay = overlay;
    state.canvas = $('[data-bq-canvas]');
    state.ctx = state.canvas.getContext('2d', { alpha: false, desynchronized: true });
    bindUi();
    bindInput();
    state.built = true;
  }

  function bindUi() {
    $('[data-bq-back]').addEventListener('click', requestBack);
    $('[data-bq-close]').addEventListener('click', () => close(true));
    $('[data-bq-sound]').addEventListener('click', toggleQuickSound);
    $('[data-bq-continue]').addEventListener('click', continueAdventure);
    $('[data-bq-world-map]').addEventListener('click', () => showPanel('map'));
    $('[data-bq-how]').addEventListener('click', () => showPanel('how'));
    $('[data-bq-settings]').addEventListener('click', () => openSettings(false));
    $('[data-bq-map-home]').addEventListener('click', () => showPanel('home'));
    $('[data-bq-how-map]').addEventListener('click', () => showPanel('map'));
    $('[data-bq-how-home]').addEventListener('click', () => showPanel('home'));
    $('[data-bq-pause]').addEventListener('click', pauseGame);
    $('[data-bq-ready]').addEventListener('click', () => { if (state.run?.phase === 'INTRO') finishStageIntro(state.run); });
    $('[data-bq-resume]').addEventListener('click', resumeGame);
    $('[data-bq-restart]').addEventListener('click', () => restartLevel());
    $('[data-bq-game-settings]').addEventListener('click', () => openSettings(true));
    $('[data-bq-exit-map]').addEventListener('click', exitToMap);
    $('[data-bq-settings-done]').addEventListener('click', closeSettings);
    $$('[data-bq-setting]').forEach(btn => btn.addEventListener('click', () => toggleSetting(btn.dataset.bqSetting)));
    $('[data-bq-worlds]').addEventListener('click', event => {
      const node = event.target.closest('[data-bq-level]');
      if (!node || node.disabled) return;
      startLevel(node.dataset.bqLevel);
    });
    $('[data-bq-result-card]').addEventListener('click', event => {
      const action = event.target.closest('[data-bq-result-action]')?.dataset.bqResultAction;
      if (!action) return;
      const level = DATA().byId[state.currentLevelId];
      if (action === 'next') {
        const next = nextLevel(level);
        if (next && isLevelUnlocked(next)) startLevel(next.id); else showPanel('map');
      } else if (action === 'replay') startLevel(level.id);
      else if (action === 'map') showPanel('map');
    });
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', updateOrientationHint, { passive: true });
  }

  function bindInput() {
    window.addEventListener('keydown', event => {
      if (!state.open || state.panel !== 'game') return;
      const target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const key = String(event.key || '').toLowerCase();
      if (['a','arrowleft','d','arrowright','s','arrowdown',' ','w','arrowup','x','shift'].includes(key)) event.preventDefault();
      if (event.repeat && [' ','w','arrowup','x','shift'].includes(key)) return;
      state.keyDown.add(key);
      refreshInputFromKeys();
      if ([' ','w','arrowup'].includes(key)) pressJump();
      if (['x','shift'].includes(key)) pressAction();
    }, { passive: false });
    window.addEventListener('keyup', event => {
      const key = String(event.key || '').toLowerCase();
      state.keyDown.delete(key);
      refreshInputFromKeys();
      if ([' ','w','arrowup'].includes(key)) releaseJump();
      if (['x','shift'].includes(key)) releaseAction();
    }, { passive: true });

    $$('[data-bq-control]').forEach(button => {
      button.addEventListener('pointerdown', event => {
        if (!state.run || state.run.paused) return;
        event.preventDefault();
        try { button.setPointerCapture(event.pointerId); } catch (_) {}
        const control = button.dataset.bqControl;
        state.pointerMap.set(event.pointerId, control);
        button.classList.add('active');
        setTouchControl(control, true);
      }, { passive: false });
      const end = event => {
        const control = state.pointerMap.get(event.pointerId);
        if (!control) return;
        state.pointerMap.delete(event.pointerId);
        button.classList.remove('active');
        const stillHeld = Array.from(state.pointerMap.values()).includes(control);
        if (!stillHeld) setTouchControl(control, false);
      };
      button.addEventListener('pointerup', end, { passive: true });
      button.addEventListener('pointercancel', end, { passive: true });
      button.addEventListener('lostpointercapture', end, { passive: true });
      button.addEventListener('contextmenu', e => e.preventDefault());
    });
  }

  function refreshInputFromKeys() {
    const held = Array.from(state.pointerMap.values());
    state.input.left = state.keyDown.has('a') || state.keyDown.has('arrowleft') || held.includes('left');
    state.input.right = state.keyDown.has('d') || state.keyDown.has('arrowright') || held.includes('right');
    state.input.down = state.keyDown.has('s') || state.keyDown.has('arrowdown') || held.includes('down');
  }
  function setTouchControl(control, down) {
    if (control === 'left' || control === 'right' || control === 'down') refreshInputFromKeys();
    else if (control === 'jump') down ? pressJump() : releaseJump();
    else if (control === 'action') down ? pressAction() : releaseAction();
  }
  function pressJump() { if (!state.input.jump) state.input.jumpPressed = true; state.input.jump = true; sfx('tap'); }
  function releaseJump() { state.input.jump = false; }
  function pressAction() { if (!state.input.action) state.input.actionPressed = true; state.input.action = true; }
  function releaseAction() { state.input.action = false; }
  function clearInput() {
    state.keyDown.clear(); state.pointerMap.clear();
    Object.assign(state.input, { left:false,right:false,down:false,jump:false,jumpPressed:false,action:false,actionPressed:false });
    $$('[data-bq-control]').forEach(b => b.classList.remove('active'));
  }

  function showPanel(name) {
    state.panel = name;
    $$('[data-bq-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.bqPanel === name));
    if (name !== 'game') stopLoop();
    if (name === 'home') renderHome();
    if (name === 'map') renderMap();
    updateTopbar();
  }
  function updateTopbar() {
    const back = $('[data-bq-back]');
    if (back) back.textContent = state.panel === 'home' ? '← MINI-GAMES' : state.panel === 'game' ? '← QUEST' : '← HOME';
    updateSoundIcon();
  }

  function renderHome() {
    const done = completedCount();
    $('[data-bq-stat-levels]').textContent = `${done}/${DATA().levels.length}`;
    $('[data-bq-stat-stars]').textContent = `${totalStars()}/${DATA().levels.length * 3}`;
    $('[data-bq-stat-chips]').textContent = `${totalChips()}/${DATA().levels.length * 3}`;
    const continueBtn = $('[data-bq-continue]');
    if (done <= 0) continueBtn.textContent = 'START ADVENTURE';
    else if (done >= DATA().levels.length) continueBtn.textContent = 'REPLAY ADVENTURE';
    else continueBtn.textContent = 'CONTINUE';
    const level = DATA().byId[state.progress?.lastLevelId] || DATA().byId['1-1'];
    const gear=campaignGear(); const gearText=[gear.blasterArm?'BLASTER ARM':'',gear.jumpBoots?'JUMP BOOTS':''].filter(Boolean).join(' + ');
    $('[data-bq-home-sub]').textContent = done > 0 ? `Continue from ${level?.id || '1-1'} — ${level?.name || 'First Sync'}.${gearText?`  Equipped: ${gearText}.`:''}` : `Start your first restoration mission.${gearText?`  Equipped: ${gearText}.`:''}`;
  }

  function renderMap() {
    const root = $('[data-bq-worlds]');
    if (!root) return;
    const worldGlyph = { 1:'⌁', 2:'✦', 3:'⚙', 4:'☁' };
    root.innerHTML = `<div class="bq-map-journey">${DATA().worlds.map(world => {
      const levels = DATA().byWorld[world.id] || [];
      const worldUnlocked = levels.some(isLevelUnlocked);
      const completed = levels.filter(level => progressFor(level.id).completed).length;
      const stars = levels.reduce((sum, level) => sum + Number(progressFor(level.id).stars || 0), 0);
      const chips = levels.reduce((sum, level) => sum + Number(progressFor(level.id).chips || 0), 0);
      const pct = Math.round((completed / Math.max(1, levels.length)) * 100);
      return `<section class="bq-world bq-world-${world.id} ${worldUnlocked ? 'world-open' : 'world-locked'}" style="--world-accent:${world.accent};--world-line:${world.accent}44;--world-glow:${world.accent}24">
        <div class="bq-world-scene" aria-hidden="true"><span class="bq-world-glyph">${worldGlyph[world.id] || '◆'}</span><i></i><i></i><i></i></div>
        <div class="bq-world-head"><div class="bq-world-title"><span>WORLD ${world.id}</span><strong>${esc(world.name)}</strong><small>${worldUnlocked ? esc(world.subtitle) : 'Restore the previous guardian to unlock this route.'}</small></div><div class="bq-world-summary"><strong>${completed}/${levels.length}</strong><span>STAGES</span><b>${pct}%</b></div></div>
        <div class="bq-world-meter"><i style="width:${pct}%"></i></div>
        <div class="bq-world-loot"><span>★ ${stars}/${levels.length * 3}</span><span>◆ ${chips}/${levels.length * 3}</span></div>
        <div class="bq-path">${levels.map(level => levelNodeMarkup(level)).join('')}</div>
      </section>`;
    }).join('')}</div>`;
  }

  function levelNodeMarkup(level) {
    const p = progressFor(level.id);
    const unlocked = isLevelUnlocked(level);
    const stars = '★'.repeat(p.stars) + '☆'.repeat(3 - p.stars);
    const xpRemaining = Math.max(0, level.xp - p.xpClaimed);
    const stageLabel = level.type === 'boss' ? 'GUARDIAN' : `STAGE ${level.order}`;
    return `<button class="bq-node ${unlocked ? 'unlocked' : 'locked'} ${p.completed ? 'completed' : ''} ${level.type === 'boss' ? 'boss' : ''}" data-bq-level="${level.id}" ${unlocked ? '' : 'disabled'}>
      <span class="bq-node-dot">${level.type === 'boss' ? '✦' : level.order}</span><span class="bq-node-id">${stageLabel}</span><h4>${esc(level.name)}</h4>
      <div class="bq-node-meta"><span class="bq-stars">${stars}</span><span>${p.chips}/3 ◆</span></div>
      <div class="bq-node-meta bq-node-bottom"><span>${p.bestTimeMs ? formatTime(p.bestTimeMs) : level.difficulty}</span><span class="bq-node-xp">${xpRemaining > 0 ? `+${xpRemaining} XP` : 'XP ✓'}</span></div>
    </button>`;
  }

  function continueAdventure() {
    const preferred = DATA().byId[state.progress?.lastLevelId];
    if (preferred && isLevelUnlocked(preferred) && !progressFor(preferred.id).completed) return startLevel(preferred.id);
    const first = DATA().levels.find(l => isLevelUnlocked(l) && !progressFor(l.id).completed) || DATA().byId['1-1'];
    startLevel(first.id);
  }

  function cloneLevel(level) {
    return {
      ...level,
      platforms: level.platforms.map((p, i) => ({ ...p, _id:i, _baseX:p.x, _baseY:p.y, _dx:0, _dy:0, _triggered:false, _triggerAt:0, _fallen:false, _used:false, _broken:false, _bump:0, _springPulse:0 })),
      enemies: level.enemies.map((e, i) => ({ ...e, _id:i, _baseX:e.x, _baseY:e.y, x:e.x, y:e.y, vx:0, vy:0, alive:true, t:Math.random()*3, shoot:.9+Math.random()*1.2, _dir:Number(e.dir||0)||((i%2)?-1:1), _state:'patrol', _stateUntil:0, _charge:0, _spin:0 })),
      hazards: level.hazards.map(h => ({ ...h })),
      coins: level.coins.map((c,i) => ({ ...c, _id:i, taken:false })),
      chips: level.chips.map((c,i) => ({ ...c, _id:i, taken:false })),
      checkpoints: level.checkpoints.map((c,i) => ({ ...c, _id:i, active:false })),
      portals: level.portals.map((p,i) => ({ ...p, _id:i, used:false })),
      powerUps: level.powerUps.map((p,i) => ({ ...p, _id:i, taken:false })),
      gearPickups: (level.gearPickups || []).map((g,i) => ({ ...g, _id:i, taken:false })),
      linkTokens: (level.linkTokens || []).map((t,i) => ({ ...t, _id:i, taken:false })),
      winds: level.winds.map(w => ({ ...w })),
      gates: (level.gates || []).map((g,i) => ({ ...g, _id:i, open:false, justOpened:false }))
    };
  }

  function startLevel(levelId) {
    const base = DATA().byId[levelId];
    if (!base || !isLevelUnlocked(base)) return;
    cancelRewardRound();
    clearInput();
    const level = cloneLevel(base);
    const progress = progressFor(level.id);
    const snapshot = state.bridge?.getSnapshot?.() || {};
    let xpRound = null;
    const xpRemaining = Math.max(0, level.xp - progress.xpClaimed);
    if (xpRemaining > 0 && snapshot.loggedIn !== false) {
      try { xpRound = state.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { xpRound = null; }
    }
    state.currentLevelId = level.id;
    state.progress.lastLevelId = level.id;
    if (!state.progress.startedAt) state.progress.startedAt = new Date().toISOString();
    saveProgress();
    const player = {
      x: level.spawn.x, y: level.spawn.y - PLAYER_H, prevX: level.spawn.x, prevY: level.spawn.y - PLAYER_H,
      w: PLAYER_W, h: PLAYER_H, standH:PLAYER_H, crouchH:34, vx:0, vy:0, facing:1, grounded:false, groundPlatform:null,
      coyote:0, jumpBuffer:0, health:3, shield:0, invuln:0, damageTaken:0, landPulse:0,
      power:'', powerUntil:0, airReady:false, portalCooldown:0, crouching:false, runCycle:0, animTime:0, syncBoostUntil:0,
      gear:{ blasterArm:Boolean(campaignGear().blasterArm), jumpBoots:Boolean(campaignGear().jumpBoots) }, weaponUnlocked:false,
      fireCooldown:0, fireFlash:0, shotsFired:0, fullDeath:false, overclockPulse:0
    };
    state.run = {
      level, player, phase:'INTRO', paused:false, pauseStarted:0, pausedTotal:0, introUntil:wallNow()+1450, clearUntil:0, pendingResult:null,
      startWall:wallNow(), activeMs:0, elapsed:0, camera:{x:0,y:0}, cameraTarget:{x:0,y:0},
      respawn:{x:level.spawn.x,y:level.spawn.y - PLAYER_H}, checkpointIndex:-1,
      coins:0, chips:0, keys:0, syncTier:0, enemiesDefeated:0, secrets:0, projectiles:[], particles:[], shots:[], collectedTokenIds:new Set(),
      completed:false, respawning:false, respawnAt:0, xpRound, xpRemaining, rewardResult:null,
      portalLock:0, corruptionX:-240, autoCameraX:0, boss: level.boss ? { ...level.boss, alive:true, maxHp:level.boss.hp, hp:level.boss.hp, t:0, attack:0, weak:false, invuln:0, x:level.boss.x, y:level.boss.y, vx:0, vy:0, defeatedAt:0 } : null,
      tutorialSeen:new Set(), shake:0, flash:0, bossTutorialShown:false, bossShieldToastAt:0
    };
    showPanel('game');
    $('[data-bq-pause-layer]').hidden = true;
    $('[data-bq-settings-layer]').hidden = true;
    const clearBanner = $('[data-bq-clear-banner]'); if (clearBanner) { clearBanner.hidden = true; clearBanner.classList.remove('burst'); }
    updateOrientationHint();
    updateHud(true);
    showStageIntro(level);
    beginLoop();
  }


  function showStageIntro(level) {
    const world = DATA().worlds.find(w => w.id === level.world);
    const banner = $('[data-bq-stage-banner]');
    if (!banner) return;
    $('[data-bq-intro-world]').textContent = `WORLD ${level.world} · ${world?.name || 'BYTE WORLD'}`;
    $('[data-bq-intro-title]').textContent = `${level.id}  ${level.name}`;
    $('[data-bq-intro-objective]').textContent = level.type === 'boss'
      ? `${level.objective || 'Defeat the Guardian.'}  Collect the BLASTER ARM if you are unarmed · X / SHIFT / FIRE · Shoot when the core turns GREEN.`
      : (level.objective || 'Reach the Restore Terminal.');
    banner.hidden = false;
    banner.classList.remove('go');
  }

  function finishStageIntro(r) {
    if (!r || r.phase !== 'INTRO') return;
    r.phase = 'PLAYING';
    r.startWall = wallNow();
    state.lastFrame = now();
    state.accumulator = 0;
    const banner = $('[data-bq-stage-banner]');
    if (banner) {
      banner.classList.add('go');
      const label = $('[data-bq-ready]', banner);
      if (label) label.textContent = 'GO!';
      setTimeout(() => {
        if (banner && state.run === r) { banner.hidden = true; banner.classList.remove('go'); if (label) label.textContent = 'READY'; }
      }, 320);
    }
    sfx('start');
    if (r.level.type === 'boss') {
      setTimeout(() => {
        if (state.run === r && r.phase === 'PLAYING') toast('PULSE BLASTER EQUIPPED · X / SHIFT / FIRE · GREEN CORE = VULNERABLE', 'good', 3000);
      }, 360);
    }
  }

  function restartLevel() {
    const id = state.currentLevelId;
    if (!id) return;
    startLevel(id);
  }

  function cancelRewardRound() {
    const round = state.run?.xpRound;
    if (round?.sessionId) { try { state.bridge?.cancelRound?.(round.sessionId); } catch (_) {} }
  }

  function beginLoop() {
    stopLoop();
    state.lastFrame = now();
    state.accumulator = 0;
    const tick = stamp => {
      if (!state.open || state.panel !== 'game' || !state.run) return;
      const dt = Math.min(0.05, Math.max(0, (stamp - state.lastFrame) / 1000));
      state.lastFrame = stamp;
      if (!state.run.paused) {
        if (state.run.phase === 'INTRO' && wallNow() >= state.run.introUntil) finishStageIntro(state.run);
        if (state.run.phase === 'CLEAR' && wallNow() >= state.run.clearUntil) finalizeLevelClear(state.run);
        if (state.run.phase === 'PLAYING') {
          state.accumulator += dt;
          let loops = 0;
          while (state.accumulator >= STEP && loops < 4) { update(STEP); state.accumulator -= STEP; loops++; }
        }
      }
      draw();
      updateHud();
      state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
  }
  function stopLoop() { if (state.raf) cancelAnimationFrame(state.raf); state.raf = 0; }

  function update(dt) {
    const r = state.run;
    if (!r || r.completed) return;
    r.activeMs += dt * 1000;
    r.elapsed += dt;
    r.player.prevX = r.player.x; r.player.prevY = r.player.y;
    updatePlatforms(r, dt);
    updatePlayer(r, dt);
    updateEnemies(r, dt);
    updateBoss(r, dt);
    updateProjectiles(r, dt);
    updatePickups(r, dt);
    updateGates(r, dt);
    updateHazards(r, dt);
    updateTutorial(r);
    updateParticles(r, dt);
    updateCamera(r, dt);
    if (r.player.invuln > 0) r.player.invuln -= dt;
    if (r.player.portalCooldown > 0) r.player.portalCooldown -= dt;
    if (r.player.landPulse > 0) r.player.landPulse = Math.max(0, r.player.landPulse - dt * 5);
    if (r.player.overclockPulse > 0) r.player.overclockPulse = Math.max(0, r.player.overclockPulse - dt * 5);
    if (r.shake > 0) r.shake = Math.max(0, r.shake - dt * 10);
    if (r.flash > 0) r.flash = Math.max(0, r.flash - dt * 3);
    if (r.respawning && wallNow() >= r.respawnAt) performRespawn(r);
    state.input.jumpPressed = false;
    state.input.actionPressed = false;
  }

  function platformActive(p, elapsed) {
    if (p._broken) return false;
    if (p.kind === 'blinking') {
      const cycle = Math.max(400, Number(p.onMs || 1500) + Number(p.offMs || 800));
      return ((elapsed * 1000 + Number(p.phase || 0)) % cycle) < Number(p.onMs || 1500);
    }
    if (p.kind === 'falling' && p._fallen && p.y > state.run.level.height + 300) return false;
    return true;
  }

  function updatePlatforms(r, dt) {
    r.level.platforms.forEach(p => {
      const oldX = p.x, oldY = p.y;
      if (p.kind === 'moving') {
        const distance = Number(p.distance || 120), speed = Number(p.speed || 60);
        const phase = (r.elapsed * speed / Math.max(1,distance)) + Number(p.phase || 0) / 1000;
        const offset = (Math.sin(phase) * .5 + .5) * distance;
        if (p.axis === 'y') p.y = p._baseY - offset; else p.x = p._baseX + offset;
      } else if (p.kind === 'falling') {
        if (p._triggered && !p._fallen && r.elapsed - p._triggerAt > .48) p._fallen = true;
        if (p._fallen) p.y += (p._fallV = Math.min(720, (p._fallV || 30) + 1200 * dt)) * dt;
      }
      if (p._bump > 0) p._bump = Math.max(0, p._bump - dt * 5.5);
      if (p._springPulse > 0) p._springPulse = Math.max(0, p._springPulse - dt * 5.2);
      p._dx = p.x - oldX; p._dy = p.y - oldY;
    });
  }


  function canPlayerStand(r, p) {
    const delta = Math.max(0, Number(p.standH || PLAYER_H) - Number(p.h || PLAYER_H));
    if (!delta) return true;
    const test = { x:p.x + 3, y:p.y - delta + 2, w:p.w - 6, h:(p.standH || PLAYER_H) - 4 };
    const blockedByPlatform = r.level.platforms.some(pl => platformActive(pl, r.elapsed) && (Number(pl.h||0)>34 || isByteBlock(pl)) && intersects(test, pl));
    if (blockedByPlatform) return false;
    return !(r.level.gates || []).some(g => !g.open && intersects(test, g));
  }

  function setPlayerCrouch(r, p, wantsCrouch) {
    if (wantsCrouch && p.grounded && !p.crouching) {
      const nextH = Number(p.crouchH || 34);
      const delta = p.h - nextH;
      p.y += delta;
      p.prevY += delta;
      p.h = nextH;
      p.crouching = true;
      return;
    }
    if (!wantsCrouch && p.crouching && canPlayerStand(r, p)) {
      const nextH = Number(p.standH || PLAYER_H);
      const delta = nextH - p.h;
      p.y -= delta;
      p.prevY -= delta;
      p.h = nextH;
      p.crouching = false;
    }
  }

  function updatePlayer(r, dt) {
    const p = r.player;
    if (r.respawning) return;
    if (p.groundPlatform && platformActive(p.groundPlatform, r.elapsed)) {
      p.x += p.groundPlatform._dx || 0; p.y += p.groundPlatform._dy || 0;
    }
    const dir = (state.input.right ? 1 : 0) - (state.input.left ? 1 : 0);
    const crouchHeld = state.input.down && p.grounded;
    setPlayerCrouch(r, p, crouchHeld);
    const speedBoost = p.power === 'speed' && p.powerUntil > r.elapsed;
    const syncBoost = p.syncBoostUntil > r.elapsed;
    const maxSpeed = p.crouching ? 118 : (speedBoost ? 432 : 352) + (syncBoost ? 42 : 0);
    const accel = p.grounded ? (dir && Math.sign(p.vx) !== dir && Math.abs(p.vx) > 35 ? 3600 : (p.crouching ? 1850 : 2800)) : 1550;
    if (dir) {
      p.vx = approach(p.vx, dir * maxSpeed, accel * dt);
      p.facing = dir;
    } else {
      p.vx = approach(p.vx, 0, (p.grounded ? 3150 : 620) * dt);
    }

    if (p.grounded) p.coyote = COYOTE; else p.coyote = Math.max(0, p.coyote - dt);
    if (state.input.jumpPressed) p.jumpBuffer = JUMP_BUFFER; else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);

    if (p.jumpBuffer > 0 && p.coyote > 0 && !p.crouching) {
      const jumpPower = hasJumpBoots(r) ? 705 : JUMP_V;
      p.vy = -jumpPower; p.grounded = false; p.groundPlatform = null; p.coyote = 0; p.jumpBuffer = 0;
      burst(r, p.x + p.w/2, p.y + p.h, hasJumpBoots(r)?10:6, hasJumpBoots(r)?'#ffe47a':'#7af5d1'); sfx('jump');
    } else if (p.jumpBuffer > 0 && !p.grounded && p.power === 'air' && p.powerUntil > r.elapsed && p.airReady) {
      p.vy = -555; p.airReady = false; p.jumpBuffer = 0; burst(r,p.x+p.w/2,p.y+p.h/2,10,'#9fdfff'); sfx('boost');
    }

    const flying = tempPowerActive(r,'flight');
    if (flying && state.input.jump && !p.crouching) {
      p.grounded=false; p.groundPlatform=null; p.vy=approach(p.vy,-355,1350*dt);
      if (Math.random()<.28) burst(r,p.x+p.w/2,p.y+p.h,2,'#8eeaff');
    } else {
      let gravityMult = 1;
      if (!p.grounded) {
        if (p.vy < 0) gravityMult = state.input.jump ? 0.76 : 1.72;
        else gravityMult = 1.2;
        if (Math.abs(p.vy) < 95) gravityMult *= 0.9;
      }
      p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * gravityMult * dt);
    }

    let wind = 0;
    r.level.winds.forEach(w => { if (intersects(p, w)) wind += Number(w.forceX || 0); });
    p.vx += wind * dt;
    if (p.groundPlatform?.conveyor) p.vx += Number(p.groundPlatform.conveyor) * dt * 3.4;

    moveHorizontal(r, p.vx * dt);
    moveVertical(r, p.vy * dt);

    p.animTime += dt;
    p.fireCooldown = Math.max(0, Number(p.fireCooldown || 0) - dt);
    p.fireFlash = Math.max(0, Number(p.fireFlash || 0) - dt * 7);
    const speedAbs = Math.abs(p.vx);
    if (p.grounded && speedAbs > 8) p.runCycle += dt * (1.6 + speedAbs / 130);
    else if (!p.grounded) p.runCycle += dt * 2.2;

    if (hasBlaster(r) && state.input.action) usePower(r);
    else if (state.input.actionPressed) usePower(r);
    if (p.power && p.powerUntil <= r.elapsed) {
      const expired=p.power; p.power=''; p.airReady=false;
      if(expired==='flight') toast('JET CORE DEPLETED','warn',800);
      if(expired==='overclock') toast('OVERCLOCK ENDED · DAMAGE RESTORED','warn',900);
    }
    if (p.y > r.level.height + 160) { p.health=0; defeatPlayer(r, 'SIGNAL LOST', true); }
    if (r.level.type === 'escape') {
      r.corruptionX = Math.max(-240, r.elapsed * Number(r.level.escapeSpeed || 80) - 320);
      if (p.x + p.w < r.corruptionX) { p.health=0; defeatPlayer(r, 'CORRUPTION CAUGHT BYTE', true); }
    }
    if (r.level.autoScroll > 0) {
      r.autoCameraX = Math.min(Math.max(0,r.level.width-state.logicalW), r.elapsed * r.level.autoScroll);
      if (p.x + p.w < r.autoCameraX - 30) { p.health=0; defeatPlayer(r, 'RELAY LOST', true); }
    }
  }


  function isByteBlock(pl) {
    return pl && (pl.kind === 'question' || pl.kind === 'brick');
  }

  function releaseBlockContent(r, pl) {
    const content = String(pl.content || 'coin');
    const x = pl.x + pl.w / 2;
    const y = pl.y - 24;
    if (content === 'coin') {
      addCoins(r, 1, 'QUESTION BLOCK');
      burst(r, x, y, 8, '#ffe370');
      sfx('coin');
      return;
    }
    if (content === 'key') {
      r.keys += 1;
      burst(r, x, y, 16, '#77f7d1');
      toast('LINK TOKEN ACQUIRED · GATE ACCESS ONLINE', 'good', 1500);
      sfx('checkpoint');
      return;
    }
    if (['shield','air','speed','pulse'].includes(content)) {
      r.level.powerUps.push({ type:content, x, y:pl.y - 28, _id:9000 + pl._id, taken:false, spawned:true });
      toast(`${content.toUpperCase()} CORE RELEASED`, 'good', 1100);
      burst(r, x, y, 12, '#c58cff');
      sfx('power');
    }
  }

  function hitByteBlock(r, pl, impactVy) {
    if (!isByteBlock(pl) || pl._broken) return;
    pl._bump = 1;
    if (pl.kind === 'question') {
      if (!pl._used) {
        pl._used = true;
        releaseBlockContent(r, pl);
      } else sfx('tap');
      return;
    }
    const strongJump = Math.abs(Number(impactVy || 0)) >= 520;
    const powered = r.player.power === 'pulse' && r.player.powerUntil > r.elapsed;
    if (!pl.reinforced && (strongJump || powered)) {
      pl._broken = true;
      burst(r, pl.x + pl.w/2, pl.y + pl.h/2, 10, '#7dd8ff');
      r.secrets += 1;
      sfx('stomp');
    } else {
      toast(pl.reinforced ? 'REINFORCED DATA BLOCK · CROUCH UNDER' : 'HOLD JUMP FOR A STRONGER HIT', 'warn', 650);
      sfx('tap');
    }
  }

  function moveHorizontal(r, dx) {
    const p = r.player; p.x += dx;
    p.x = clamp(p.x, 0, r.level.width - p.w);
    r.level.platforms.forEach(pl => {
      if (!platformActive(pl,r.elapsed) || (pl.h <= 34 && !isByteBlock(pl))) return;
      if (!intersects(p,pl)) return;
      if (dx > 0) p.x = pl.x - p.w; else if (dx < 0) p.x = pl.x + pl.w;
      p.vx = 0;
    });
    (r.level.gates || []).forEach(g => {
      if (g.open || !intersects(p,g)) return;
      if (dx > 0) p.x = g.x - p.w; else if (dx < 0) p.x = g.x + g.w;
      p.vx = 0;
    });
  }

  function moveVertical(r, dy) {
    const p = r.player;
    const prevBottom = p.y + p.h;
    const prevTop = p.y;
    const impactVy = p.vy;
    p.y += dy;
    let landed = null;
    if (dy >= 0) {
      let nearestY = Infinity;
      const landingTolerance = Math.max(14, Math.abs(dy) + 10);
      const surfaces = r.level.platforms.concat((r.level.gates || []).filter(g => !g.open));
      surfaces.forEach(pl => {
        if (pl.kind && !platformActive(pl,r.elapsed)) return;
        const horizontal = p.x + p.w > pl.x + 4 && p.x < pl.x + pl.w - 4;
        if (!horizontal) return;
        const newBottom = p.y + p.h;
        if (prevBottom <= pl.y + landingTolerance && newBottom >= pl.y && p.y < pl.y + 10 && pl.y < nearestY) { nearestY = pl.y; landed = pl; }
      });
      if (landed) {
        const wasAir = !p.grounded && p.vy > 120;
        p.y = landed.y - p.h;
        if (landed.kind === 'spring') {
          p.vy = -Number(landed.bounce || 760); p.grounded = false; p.groundPlatform = null; p.airReady = true; landed._springPulse = 1;
          burst(r,p.x+p.w/2,landed.y,10,'#ffe477'); sfx('boost');
        } else {
          p.vy = 0; p.grounded = true; p.groundPlatform = landed.kind ? landed : null; p.airReady = true;
          if (landed.kind === 'falling' && !landed._triggered) { landed._triggered = true; landed._triggerAt = r.elapsed; }
          if (wasAir) { p.landPulse = 1; burst(r,p.x+p.w/2,p.y+p.h,5,'#b8f7ff'); sfx('land'); }
        }
      } else { p.grounded = false; p.groundPlatform = null; }
    } else {
      r.level.platforms.forEach(pl => {
        if (!platformActive(pl,r.elapsed) || (pl.h <= 34 && !isByteBlock(pl))) return;
        if (!intersects(p,pl)) return;
        const bottom = pl.y + pl.h;
        if (prevTop >= bottom - 11) {
          if (isByteBlock(pl)) hitByteBlock(r, pl, impactVy);
          p.y = bottom; p.vy = Math.max(0,p.vy);
        }
      });
      p.grounded = false; p.groundPlatform = null;
    }
  }

  function enemyBox(e) {
    const sizes = { bugbot:[42,34], spikebyte:[42,38], flyer:[42,30], crawler:[42,28], firewall:[46,42] };
    const [w,h] = sizes[e.type] || [42,34];
    return { x:e.x-w/2, y:e.y-h, w, h };
  }

  function updateEnemies(r, dt) {
    const p = r.player;
    r.level.enemies.forEach(e => {
      if (!e.alive) return;
      e.t += dt;
      const range = Math.max(55, Number(e.range || 95));
      const dxToPlayer = (p.x + p.w/2) - e.x;
      const near = Math.abs(dxToPlayer) < 240;

      if (e.type === 'bugbot') {
        const speed = near ? 92 : 58;
        e._dir = e._dir || 1;
        e.x += e._dir * speed * dt;
        if (e.x > e._baseX + range) { e.x = e._baseX + range; e._dir = -1; }
        if (e.x < e._baseX - range) { e.x = e._baseX - range; e._dir = 1; }
        if (near && Math.abs(dxToPlayer) > 28) e._dir = Math.sign(dxToPlayer) || e._dir;
      } else if (e.type === 'crawler') {
        const speed = near ? 126 : 82;
        e._dir = e._dir || -1;
        e.x += e._dir * speed * dt;
        if (e.x > e._baseX + range) { e.x = e._baseX + range; e._dir = -1; }
        if (e.x < e._baseX - range) { e.x = e._baseX - range; e._dir = 1; }
        if (near && Math.abs(dxToPlayer) > 35) e._dir = Math.sign(dxToPlayer) || e._dir;
      } else if (e.type === 'spikebyte') {
        const charge = Math.abs(dxToPlayer) < 260;
        const speed = charge ? 152 : 68;
        if (charge) e._dir = Math.sign(dxToPlayer) || e._dir || 1;
        e.x += (e._dir || 1) * speed * dt;
        if (e.x > e._baseX + range) { e.x = e._baseX + range; e._dir = -1; }
        if (e.x < e._baseX - range) { e.x = e._baseX - range; e._dir = 1; }
        e._spin += dt * speed * .08;
      } else if (e.type === 'flyer') {
        if (e._state === 'dive') {
          e.x = approach(e.x, p.x + p.w/2, 215 * dt);
          e.y = approach(e.y, p.y + 18, 180 * dt);
          if (r.elapsed >= e._stateUntil) { e._state = 'recover'; e._stateUntil = r.elapsed + .75; }
        } else if (e._state === 'recover') {
          e.x = approach(e.x, e._baseX, 165 * dt);
          e.y = approach(e.y, e._baseY, 150 * dt);
          if (r.elapsed >= e._stateUntil) { e._state = 'patrol'; e._stateUntil = r.elapsed + 1.4 + Math.random(); }
        } else {
          e.x = e._baseX + Math.sin(e.t * .85) * range;
          e.y = e._baseY + Math.sin(e.t * 1.65) * 28;
          if (near && r.elapsed >= e._stateUntil) { e._state = 'dive'; e._stateUntil = r.elapsed + .8; }
        }
      } else if (e.type === 'firewall') {
        e._charge = e.shoot < .42 ? clamp(1 - e.shoot / .42, 0, 1) : 0;
        e.shoot -= dt;
        if (e.shoot <= 0 && Math.abs(p.x - e.x) < 680) {
          e.shoot = 1.55 + Math.random()*.55;
          e._charge = 0;
          const sx = e.x, sy = e.y - 24;
          const tx = p.x + p.w/2, ty = p.y + p.h*.45;
          const dx = tx - sx, dy = ty - sy, len = Math.hypot(dx,dy) || 1;
          r.projectiles.push({ x:sx,y:sy,vx:dx/len*270,vy:dy/len*270,w:16,h:9,life:3,enemy:true,kind:'bolt' });
          sfx('enemyShot');
        }
      }

      const box = enemyBox(e);
      if (!intersects(p, box) || p.invuln > 0) return;
      const prevBottom = p.prevY + p.h;
      const stompable = !['spikebyte','firewall'].includes(e.type);
      if (stompable && p.vy > 80 && prevBottom <= box.y + 14) {
        e.alive = false; p.vy = -375; p.grounded = false; r.enemiesDefeated++;
        burst(r,e.x,e.y-12,10,'#79f3d2'); sfx('stomp');
      } else damagePlayer(r, e.x < p.x ? 1 : -1);
    });
  }

  function updateBoss(r, dt) {
    const b = r.boss; if (!b || !b.alive || r.respawning) return;
    b.t += dt; b.invuln = Math.max(0,b.invuln-dt);
    const arenaLeft = Number(b.arenaStart || 700) + 40;
    const arenaRight = r.level.width - 160;
    const cycle = b.t % 4.8;
    b.weak = cycle > 2.55 && cycle < 4.25;
    if (!r.bossTutorialShown && r.player.x > Number(b.arenaStart || 700) - 220) {
      r.bossTutorialShown = true;
      toast('GUARDIAN FIGHT · HOLD FIRE · GREEN CORE = DAMAGE · RED CORE = SHIELDED', 'warn', 3000);
    }
    if (b.type === 'cloudwarden') {
      b.x = lerp(arenaLeft+240, arenaRight, (Math.sin(b.t*.7)+1)/2);
      b.y = 275 + Math.sin(b.t*1.25)*70;
    } else if (cycle < 1.75) {
      const target = r.player.x < b.x ? arenaLeft : arenaRight;
      b.x = approach(b.x,target,(b.type==='glitchbeast'?235:170)*dt);
    }
    if (b.attack <= 0) {
      b.attack = b.type === 'volttitan' ? 1.45 : 1.8;
      bossAttack(r,b);
    } else b.attack -= dt;
    const box = { x:b.x-55,y:b.y-86,w:110,h:86 };
    if (intersects(r.player,box) && r.player.invuln<=0) {
      const prevBottom = r.player.prevY+r.player.h;
      if (b.weak && b.invuln<=0 && r.player.vy>100 && prevBottom<=box.y+18) hitBoss(r,b,'stomp');
      else damagePlayer(r,b.x<r.player.x?1:-1);
    }
  }

  function bossAttack(r,b) {
    const p = r.player;
    if (b.type === 'bugzilla') {
      const dir = p.x < b.x ? -1 : 1;
      r.projectiles.push({x:b.x,y:455,vx:dir*260,vy:0,w:34,h:12,life:3,enemy:true,kind:'shock'});
    } else if (b.type === 'glitchbeast') {
      [-1,0,1].forEach((n,i)=>r.projectiles.push({x:b.x+n*18,y:b.y-70,vx:n*85,vy:-250-i*30,w:14,h:14,life:3,enemy:true,kind:'orb',gravity:520}));
    } else if (b.type === 'volttitan') {
      const dir = p.x < b.x ? -1 : 1;
      r.projectiles.push({x:b.x,y:b.y-45,vx:dir*330,vy:0,w:28,h:10,life:2.5,enemy:true,kind:'volt'});
      setTimeout(()=>{ if(state.run===r&&b.alive) r.projectiles.push({x:b.x,y:b.y-70,vx:dir*280,vy:0,w:22,h:8,life:2.5,enemy:true,kind:'volt'}); },160);
    } else {
      const dx=p.x-b.x, dy=(p.y+20)-b.y, len=Math.hypot(dx,dy)||1;
      r.projectiles.push({x:b.x,y:b.y,vx:dx/len*250,vy:dy/len*250,w:16,h:16,life:3,enemy:true,kind:'wind'});
    }
    sfx('bossAttack');
  }

  function hitBoss(r,b,source='stomp') {
    b.hp--; b.invuln=.68;
    if (source === 'stomp') { r.player.vy=-410; r.player.grounded=false; }
    r.shake=state.reducedMotion?0:.6;
    burst(r,b.x,b.y-50,18,source==='shot'?'#c68cff':'#ffe37b'); sfx('bossHit');
    toast(`${bossName(b)} HIT · ${Math.max(0,b.hp)} / ${b.maxHp} HP`, 'good', 850);
    if (b.hp<=0) {
      b.alive=false; b.defeatedAt=r.elapsed; r.enemiesDefeated++; r.shake=state.reducedMotion?0:1;
      burst(r,b.x,b.y-45,42,'#72f3d1'); toast('GUARDIAN DEFEATED — RESTORE TERMINAL ONLINE','good',2400); sfx('bossDefeat');
    }
  }

  function updateProjectiles(r,dt) {
    const p=r.player;
    r.projectiles.forEach(q=>{
      q.life-=dt; if(q.gravity) q.vy+=q.gravity*dt; q.x+=q.vx*dt; q.y+=q.vy*dt;
      if(q.enemy&&q.life>0&&intersects(p,q)&&p.invuln<=0){q.life=0;damagePlayer(r,q.vx<0?1:-1);}
    });
    r.projectiles=r.projectiles.filter(q=>q.life>0&&q.x>-100&&q.x<r.level.width+100&&q.y<r.level.height+150);
    r.shots.forEach(q=>{
      q.life-=dt;q.x+=q.vx*dt;q.y+=Number(q.vy||0)*dt;
      r.level.enemies.forEach(e=>{if(e.alive&&q.life>0&&intersects(q,enemyBox(e))){e.alive=false;q.life=0;r.enemiesDefeated++;burst(r,e.x,e.y-10,9,'#b28aff');sfx('stomp');}});
      const b=r.boss;
      if(b?.alive&&q.life>0&&intersects(q,{x:b.x-55,y:b.y-86,w:110,h:86})){
        q.life=0;
        if(b.weak&&b.invuln<=0) hitBoss(r,b,'shot');
        else {
          burst(r,q.x,q.y,7,'#ff8297');
          const stamp=wallNow();
          if(stamp-r.bossShieldToastAt>850){r.bossShieldToastAt=stamp;toast('GUARDIAN SHIELDED · WAIT FOR THE CORE TO TURN GREEN','warn',900);}
          sfx('shield');
        }
      }
    });
    r.shots=r.shots.filter(q=>q.life>0&&q.x>-50&&q.x<r.level.width+50);
  }


  function addCoins(r, amount = 1, source = '') {
    const add = Math.max(0, Math.floor(Number(amount || 0)));
    if (!add) return;
    const beforeTier = Math.floor(r.coins / 10);
    r.coins += add;
    const afterTier = Math.floor(r.coins / 10);
    if (afterTier > beforeTier) {
      r.syncTier = afterTier;
      const p = r.player;
      if (p.health < 3) {
        p.health += 1;
        toast('10 BYTE COINS · CORE HEALTH RESTORED', 'good', 1350);
      } else {
        p.syncBoostUntil = Math.max(p.syncBoostUntil || 0, r.elapsed + 7);
        toast('10 BYTE COINS · SYNC BOOST ACTIVE', 'good', 1350);
      }
      burst(r, p.x + p.w/2, p.y + p.h/2, 14, '#ffe370');
      sfx('checkpoint');
    } else if (source) {
      // Source is intentionally kept local; no extra persistence/write is needed.
    }
  }

  function acquirePersistentGear(r, item) {
    const p=r.player;
    p.gear=p.gear||{blasterArm:false,jumpBoots:false};
    const type=String(item.type||'');
    const already=(type==='blaster'&&p.gear.blasterArm)||(type==='jumpBoots'&&p.gear.jumpBoots);
    if(already){
      if(p.health<3){p.health++;toast(`${item.label||'GEAR'} DUPLICATE · CORE HEART RESTORED`,'good',1200);}
      else {addCoins(r,3,'GEAR DUPLICATE');toast(`${item.label||'GEAR'} DUPLICATE · +3 BYTE COINS`,'good',1200);}
      return;
    }
    if(type==='blaster'){
      p.gear.blasterArm=true;p.fireCooldown=0;
      toast('BLASTER ARM EQUIPPED · PERSISTS UNTIL FULL CORE DEATH','good',2200);
      burst(r,item.x,item.y,22,'#c58cff');
    } else if(type==='jumpBoots'){
      p.gear.jumpBoots=true;
      toast('JUMP BOOTS EQUIPPED · HIGH JUMP UNLOCKED','good',2200);
      burst(r,item.x,item.y,22,'#ffe477');
    }
    syncCampaignGearFromPlayer(r);sfx('power');
  }

  function updatePickups(r) {
    const p=r.player;
    r.level.coins.forEach(c=>{if(!c.taken&&Math.abs(p.x+p.w/2-c.x)<28&&Math.abs(p.y+p.h/2-c.y)<38){c.taken=true;addCoins(r,1);burst(r,c.x,c.y,5,'#ffe370');sfx('coin');}});
    r.level.chips.forEach(c=>{if(!c.taken&&Math.abs(p.x+p.w/2-c.x)<34&&Math.abs(p.y+p.h/2-c.y)<42){c.taken=true;r.chips++;burst(r,c.x,c.y,14,'#77f7d1');if(r.chips>=3){p.syncBoostUntil=Math.max(p.syncBoostUntil||0,r.elapsed+8);toast('ALL DATA CHIPS · TERMINAL SYNC BOOST ACTIVE','good',1500);}else toast(`DATA CHIP ${r.chips} / 3`,'good',1000);sfx('chip');}});
    (r.level.linkTokens||[]).forEach(t=>{
      if(t.taken||Math.abs(p.x+p.w/2-t.x)>34||Math.abs(p.y+p.h/2-t.y)>46)return;
      t.taken=true;r.keys++;r.collectedTokenIds.add(String(t.gateId||''));
      burst(r,t.x,t.y,20,'#ffdf63');toast(`${t.label||'LINK TOKEN'} ACQUIRED · MATCHING GATE ONLINE`,'good',1800);sfx('checkpoint');
    });
    (r.level.gearPickups||[]).forEach(g=>{
      if(g.taken||Math.abs(p.x+p.w/2-g.x)>36||Math.abs(p.y+p.h/2-g.y)>48)return;
      g.taken=true;acquirePersistentGear(r,g);
    });
    r.level.checkpoints.forEach(cp=>{
      if(Math.abs(p.x+p.w/2-cp.x)<38&&Math.abs(p.y+p.h-cp.y)<70&&!cp.active){
        r.level.checkpoints.forEach(x=>x.active=false);cp.active=true;r.checkpointIndex=cp._id;r.respawn={x:cp.x-18,y:cp.y-PLAYER_H};burst(r,cp.x,cp.y-30,16,'#65eaff');toast('SAFE SYNC POINT SAVED','good',1300);sfx('checkpoint');
      }
    });
    r.level.powerUps.forEach(u=>{
      if(u.taken||Math.abs(p.x+p.w/2-u.x)>32||Math.abs(p.y+p.h/2-u.y)>40)return;u.taken=true;
      if(u.type==='shield'){p.shield=1;if(!['flight','overclock'].includes(p.power))p.power='shield';p.powerUntil=Infinity;}
      if(u.type==='air'){p.power='air';p.powerUntil=r.elapsed+20;p.airReady=true;}
      if(u.type==='speed'){p.power='speed';p.powerUntil=r.elapsed+12;}
      if(u.type==='pulse'){p.power='pulse';p.powerUntil=r.elapsed+22;p.fireCooldown=0;}
      if(u.type==='flight'){const d=Math.max(4,Number(u.duration||8));p.power='flight';p.powerUntil=r.elapsed+d;p.vy=Math.min(p.vy,-220);toast(`JET CORE ONLINE · HOLD JUMP TO FLY · ${d}s`,'good',2000);}
      if(u.type==='overclock'){const d=Math.max(3,Number(u.duration||6));p.power='overclock';p.powerUntil=r.elapsed+d;p.invuln=Math.max(p.invuln,.35);toast(`OVERCLOCK ONLINE · CONTACT INVINCIBLE · ${d}s`,'good',2100);}
      if(!['flight','overclock'].includes(u.type))toast(u.type==='pulse'?'PULSE BLASTER ONLINE · X / SHIFT / FIRE':`${u.type.toUpperCase()} CORE ONLINE`,'good',u.type==='pulse'?2200:1400);
      burst(r,u.x,u.y,14,u.type==='overclock'?'#fff27a':u.type==='flight'?'#8eeaff':'#c58cff');sfx('power');
    });
    r.level.portals.forEach(po=>{
      if(p.portalCooldown>0)return;
      const box={x:po.x-22,y:po.y-64,w:44,h:64};
      if(intersects(p,box)){p.x=po.tx;p.y=po.ty-p.h;p.vx=0;p.vy=0;p.portalCooldown=.8;if(!po.used){po.used=true;r.secrets++;}toast(po.label||'DATA PORTAL','good',1000);burst(r,po.x,po.y-30,18,'#ae82ff');burst(r,po.tx,po.ty-30,18,'#ae82ff');sfx('portal');}
    });
    const exit={x:r.level.exit.x-26,y:r.level.exit.y-70,w:52,h:70};
    if(intersects(p,exit)) {
      if(r.level.type==='boss'&&r.boss?.alive) toast('DEFEAT THE GUARDIAN FIRST','warn',900);
      else if(r.level.type==='collect'&&r.chips<3) toast('RECOVER ALL 3 DATA CHIPS','warn',900);
      else if((r.level.gates||[]).some(g=>!g.open)) toast('LINK GATE LOCKED · FOLLOW THE GOLD TOKEN SIGNAL','warn',1100);
      else completeLevel(r);
    }
  }

  function updateGates(r) {
    (r.level.gates || []).forEach(g => {
      const tokenMatch=Boolean(g.gateId && r.collectedTokenIds?.has(String(g.gateId)));
      if (g.open || (!tokenMatch && r.keys < Number(g.requiredKeys || 1))) return;
      g.open = true;g.justOpened = true;
      burst(r, g.x + g.w/2, g.y + g.h/2, 22, '#6ff7d0');
      toast(`${g.label || 'LINK GATE'} OPEN`, 'good', 1250);sfx('portal');
    });
  }

  function updateHazards(r) {
    const p=r.player;
    r.level.hazards.forEach(h=>{
      let active=true;
      if(h.type==='laser') active=((r.elapsed*1000+Number(h.phase||0))%Number(h.period||1800))<Number(h.activeMs||900);
      if(active&&intersects(p,h)&&p.invuln<=0) damagePlayer(r,p.x<h.x?-1:1);
    });
  }

  function damagePlayer(r,knockDir=1) {
    const p=r.player;if(p.invuln>0||r.respawning)return;
    if(tempPowerActive(r,'overclock')){
      p.overclockPulse=1;burst(r,p.x+p.w/2,p.y+p.h/2,9,'#fff46f');
      if(!r.overclockToastAt||wallNow()-r.overclockToastAt>700){r.overclockToastAt=wallNow();toast('OVERCLOCK · NO DAMAGE','good',650);}
      sfx('shield');return;
    }
    if(p.shield>0){p.shield=0;if(p.power==='shield')p.power='';p.invuln=.85;burst(r,p.x+p.w/2,p.y+p.h/2,12,'#72eaff');toast('SHIELD CORE ABSORBED THE HIT','good',900);sfx('shield');return;}
    p.health--;p.damageTaken++;p.invuln=1.05;p.vx=knockDir*260;p.vy=-300;r.shake=state.reducedMotion?0:.35;burst(r,p.x+p.w/2,p.y+p.h/2,10,'#ff708b');sfx('hurt');
    if(p.health<=0) defeatPlayer(r,'BYTE CORE OFFLINE',true);
  }

  function defeatPlayer(r,message,fullDeath=false) {
    if(r.respawning||r.completed)return;
    const p=r.player;
    r.respawning=true;r.fullDeath=Boolean(fullDeath||p.health<=0);p.health=Math.max(0,p.health);r.respawnAt=wallNow()+720;r.flash=1;
    if(r.fullDeath){
      p.gear={blasterArm:false,jumpBoots:false};p.weaponUnlocked=false;p.power='';p.powerUntil=0;p.shield=0;clearCampaignGear();
      toast(`${message} · GEAR LOST · RESYNCING…`,'bad',1050);
    } else toast(`${message} · RESYNCING…`,'bad',700);
    sfx('fail');
  }
  function performRespawn(r) {
    const p=r.player;r.respawning=false;p.x=r.respawn.x;p.y=r.respawn.y;p.vx=0;p.vy=0;p.health=3;p.invuln=1.5;p.grounded=false;p.groundPlatform=null;p.shield=0;p.h=p.standH||PLAYER_H;p.crouching=false;p.power='';p.powerUntil=0;p.airReady=false;
    if(r.fullDeath&&r.boss?.alive&&!p.gear?.blasterArm){
      const floorY=p.y+p.h;
      const exists=(r.level.gearPickups||[]).some(g=>!g.taken&&g.type==='blaster'&&Math.abs(g.x-p.x)<220);
      if(!exists)r.level.gearPickups.push({type:'blaster',x:clamp(p.x+105,60,r.level.width-60),y:floorY-34,label:'RECOVERY BLASTER ARM',guaranteed:true,_id:9900+r.level.gearPickups.length,taken:false});
      toast('FULL CORE DEATH · PERSISTENT GEAR RESET · RECOVERY BLASTER NEARBY','warn',2100);
    }
    r.fullDeath=false;
    r.level.platforms.forEach(pl=>{if(pl.kind==='falling'){pl.x=pl._baseX;pl.y=pl._baseY;pl._triggered=false;pl._fallen=false;pl._fallV=0;}});
  }

  function fireBlaster(r) {
    const p=r.player;
    if(!hasBlaster(r) || p.fireCooldown>0) return false;
    p.fireCooldown = r.level.type === 'boss' ? .19 : .24;
    p.fireFlash = 1;
    p.shotsFired = Math.max(0,Number(p.shotsFired||0))+1;
    const sx=p.x+p.w/2+p.facing*22, sy=p.y+p.h*.46;
    let vx=p.facing*650, vy=0;
    const b=r.boss;
    if(b?.alive){
      const tx=b.x, ty=b.y-48, dx=tx-sx, dy=ty-sy;
      if(Math.sign(dx||p.facing)===p.facing && Math.abs(dx)<900){
        const len=Math.hypot(dx,dy)||1;
        vx=dx/len*680;vy=dy/len*680;
      }
    }
    r.shots.push({x:sx,y:sy,vx,vy,w:20,h:9,life:1.8,enemy:false,kind:'player-blaster'});
    burst(r,sx,sy,5,'#c58cff');sfx('pulse');
    return true;
  }

  function usePower(r) {
    const p=r.player;
    if(hasBlaster(r) && fireBlaster(r)) return;
    if(p.power==='air'&&p.powerUntil>r.elapsed&&p.airReady&&!p.grounded){p.vy=-510;p.airReady=false;burst(r,p.x+p.w/2,p.y+p.h/2,10,'#9fdfff');sfx('boost');}
  }

  function updateTutorial(r) {
    if(r.level.id!=='1-1')return;
    r.level.tutorial.forEach((t,i)=>{if(!r.tutorialSeen.has(i)&&Math.abs(r.player.x-t.x)<90){r.tutorialSeen.add(i);toast(t.text,'good',1800);}});
  }

  function burst(r,x,y,count,color) {
    const n=state.reducedMotion?Math.ceil(count*.45):count;
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=45+Math.random()*145;r.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-35,life:.35+Math.random()*.35,max:.7,color,size:2+Math.random()*4});}
    if(r.particles.length>160)r.particles.splice(0,r.particles.length-160);
  }
  function updateParticles(r,dt){r.particles.forEach(q=>{q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=320*dt;q.vx*=.985;});r.particles=r.particles.filter(q=>q.life>0);}

  function updateCamera(r,dt) {
    const p=r.player,c=r.camera;
    const lookX=p.facing*110+clamp(p.vx*.14,-70,70);
    let tx=p.x+p.w/2-state.logicalW*.43+lookX;
    let ty=p.y+p.h/2-state.logicalH*.56+clamp(p.vy*.08,-60,80);
    if(r.level.autoScroll>0)tx=Math.max(tx,r.autoCameraX);
    tx=clamp(tx,0,Math.max(0,r.level.width-state.logicalW));
    ty=clamp(ty,0,Math.max(0,r.level.height-state.logicalH));
    const smooth=1-Math.pow(.001,dt);
    c.x=lerp(c.x,tx,smooth*.55);c.y=lerp(c.y,ty,smooth*.5);
  }

  function completeLevel(r) {
    if(r.completed)return;
    r.completed=true;r.phase='CLEAR';clearInput();
    const level=r.level,timeMs=Math.round(r.activeMs);const under=timeMs<=level.targetTimeMs;const allChips=r.chips>=3;const stars=1+(allChips?1:0)+(under?1:0);const perfect=allChips&&under&&r.player.damageTaken===0;
    const timeBonus=Math.max(0,Math.round((level.targetTimeMs-timeMs)/55));
    const score=Math.max(0,Math.round(r.coins*50+r.chips*1000+r.enemiesDefeated*250+r.secrets*500+r.player.health*400+timeBonus+(perfect?1500:0)));
    const p=progressFor(level.id);const oldBest=p.bestTimeMs;const newBest=oldBest===0||timeMs<oldBest;
    p.completed=true;p.stars=Math.max(p.stars,stars);p.chips=Math.max(p.chips,r.chips);p.bestTimeMs=oldBest>0?Math.min(oldBest,timeMs):timeMs;p.bestScore=Math.max(p.bestScore,score);p.perfect=p.perfect||perfect;p.lastCompletedAt=new Date().toISOString();
    saveProgress();
    r.pendingResult={level,timeMs,score,stars,perfect,newBest,oldBest};
    r.clearUntil=wallNow()+1850;
    const clear=$('[data-bq-clear-banner]');
    if(clear){
      $('[data-bq-clear-kicker]').textContent=level.type==='boss'?'WORLD RESTORED':'RESTORE COMPLETE';
      $('[data-bq-clear-title]').textContent=level.type==='boss'?`${DATA().worlds.find(w=>w.id===level.world)?.name||'BYTE WORLD'} ONLINE`:`${level.id}  CLEAR`;
      $('[data-bq-clear-stars]').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
      clear.hidden=false;clear.classList.remove('burst');requestAnimationFrame(()=>clear.classList.add('burst'));
    }
    burst(r,r.level.exit.x,r.level.exit.y-36,36,'#72f3d1');
    sfx('complete');
  }

  function finalizeLevelClear(r) {
    if(!r||r.phase!=='CLEAR'||!r.pendingResult)return;
    const data=r.pendingResult,level=data.level;
    const clear=$('[data-bq-clear-banner]');if(clear){clear.hidden=true;clear.classList.remove('burst');}
    r.phase='RESULT';
    renderResult({...data,xpState:'syncing',awardedXp:0});
    showPanel('result');
    settleXpReward(r,data).catch(()=>{});
  }

  async function settleXpReward(r,resultData) {
    const level=r.level,p=progressFor(level.id),round=r.xpRound;
    if(!round?.sessionId||r.xpRemaining<=0){renderResult({...resultData,xpState:'practice',awardedXp:0});return;}
    const metrics={
      completed:true,levelId:level.id,world:level.world,order:level.order,difficulty:String(level.difficulty).toLowerCase(),difficultyRank:level.xp<=5?1:level.xp<=10?2:level.xp<=15?3:4,targetXp:level.xp,
      chips:r.chips,stars:resultData.stars,timeMs:resultData.timeMs,targetTimeMs:level.targetTimeMs,damageTaken:r.player.damageTaken,enemiesDefeated:r.enemiesDefeated,coins:r.coins,secrets:r.secrets,boss:level.type==='boss',bossDefeated:level.type!=='boss'||!r.boss?.alive,activeTimeMs:resultData.timeMs,durationMs:resultData.timeMs,perfect:resultData.perfect
    };
    try{
      const reward=await state.bridge.claimRound(round.sessionId,{score:resultData.score,metrics});
      r.rewardResult=reward;
      const awarded=Math.max(0,Number(reward?.awardedXp||0));
      if(Number.isFinite(Number(reward?.levelClaimedXp)))p.xpClaimed=Math.min(level.xp,Math.max(p.xpClaimed,Number(reward.levelClaimedXp)||0));
      else if(awarded>0)p.xpClaimed=Math.min(level.xp,p.xpClaimed+awarded);
      if(reward?.levelFullyClaimed===true)p.xpClaimed=level.xp;
      saveProgress();
      if(awarded>0){try{state.onReward?.(reward);}catch(_){}sfx('xp');}
      renderResult({...resultData,xpState:reward?.syncPending?'pending':awarded>0?'awarded':reward?.capReached?'cap':p.xpClaimed>=level.xp?'claimed':'practice',awardedXp:awarded,reward});
    }catch(error){renderResult({...resultData,xpState:'pending',awardedXp:0,reward:{error:String(error?.message||error||'XP sync pending')}});}
  }

  function renderResult(data) {
    const level=data.level||DATA().byId[state.currentLevelId];if(!level)return;
    const p=progressFor(level.id);const next=nextLevel(level);const stars='★'.repeat(data.stars||p.stars)+'☆'.repeat(3-(data.stars||p.stars));
    let xpLabel='PRACTICE CLEAR',xpCopy='Replay for stars, Data Chips, score, secrets, and best time.';
    if(data.xpState==='syncing'){xpLabel='XP CHECK';xpCopy='Validating this stage clear…';}
    else if(data.xpState==='awarded'){xpLabel=`+${Math.floor(data.awardedXp||0)} XP`;xpCopy=p.xpClaimed>=level.xp?'Permanent XP for this stage is fully claimed.':`${Math.max(0,level.xp-p.xpClaimed)} XP remains claimable for this stage.`;}
    else if(data.xpState==='cap'){xpLabel='DAILY CAP';xpCopy='Your stage clear is saved. Remaining level XP can be claimed on a later eligible clear.';}
    else if(data.xpState==='pending'){xpLabel='XP SYNC PENDING';xpCopy='Progress is saved locally. The secure reward service will be retried safely.';}
    else if(p.xpClaimed>=level.xp||data.xpState==='claimed'){xpLabel='XP CLAIMED';xpCopy='Permanent XP already earned for this stage.';}
    const card=$('[data-bq-result-card]');
    card.innerHTML=`<span class="bq-result-kicker">${data.perfect?'PERFECT RUN':'LEVEL COMPLETE'}</span><h1>LEVEL COMPLETE</h1><div class="bq-result-level">${esc(DATA().worlds.find(w=>w.id===level.world)?.name||'BYTE WORLD')} · ${level.id} ${esc(level.name)}</div><div class="bq-result-stars">${stars}</div><div class="bq-result-grid"><div class="bq-result-stat"><span>TIME</span><strong>${formatTime(data.timeMs||p.bestTimeMs)}</strong></div><div class="bq-result-stat"><span>BYTE COINS</span><strong>${state.run?.coins||0}</strong></div><div class="bq-result-stat"><span>DATA CHIPS</span><strong>${state.run?.chips||0} / 3</strong></div><div class="bq-result-stat"><span>ENEMIES</span><strong>${state.run?.enemiesDefeated||0}</strong></div><div class="bq-result-stat"><span>DAMAGE</span><strong>${state.run?.player?.damageTaken||0}</strong></div><div class="bq-result-stat"><span>SCORE</span><strong>${Math.floor(data.score||p.bestScore).toLocaleString()}</strong></div></div>${data.perfect?'<div class="bq-perfect">PERFECT RUN · SYSTEM RESTORED CLEANLY</div>':''}${data.newBest?'<div class="bq-perfect" style="color:#bde8ff;border-color:rgba(117,220,255,.25)">NEW BEST TIME!</div>':''}<div class="bq-xp-line"><strong>${esc(xpLabel)}</strong><span>${esc(xpCopy)}</span></div><div class="bq-result-actions"><button class="bq-btn primary" data-bq-result-action="next" ${next&&!isLevelUnlocked(next)?'disabled':''}>${next?'NEXT LEVEL':'WORLD MAP'}</button><button class="bq-btn secondary" data-bq-result-action="replay">REPLAY</button><button class="bq-btn secondary" data-bq-result-action="map">WORLD MAP</button></div>`;
  }

  function pauseGame() {
    const r=state.run;if(!r||r.paused||r.completed)return;r.paused=true;r.pauseStarted=wallNow();$('[data-bq-pause-layer]').hidden=false;try{state.music?.pause?.();}catch(_){}clearInput();
  }
  function resumeGame() {
    const r=state.run;if(!r||!r.paused)return;r.paused=false;r.pausedTotal+=Math.max(0,wallNow()-r.pauseStarted);r.pauseStarted=0;$('[data-bq-pause-layer]').hidden=true;$('[data-bq-settings-layer]').hidden=true;try{if(state.musicEnabled)state.music?.resume?.();}catch(_){}state.lastFrame=now();
  }
  function onVisibilityChange(){if(document.hidden&&state.open&&state.panel==='game'&&state.run&&!state.run.paused)pauseGame();}

  function exitToMap(){cancelRewardRound();state.run=null;clearInput();showPanel('map');}
  function requestBack(){if(state.panel==='home'){state.overlay.hidden=true;state.open=false;stopLoop();try{state.onBack?.();}catch(_){}return;}if(state.panel==='game'){pauseGame();return;}showPanel('home');}

  function openSettings(fromGame) {
    const layer=$('[data-bq-settings-layer]');
    if(fromGame){if(state.run&&!state.run.paused)pauseGame();layer.hidden=false;}else{showPanel('game'); if(!state.run){state.run={paused:true,phase:'MENU'};} $('[data-bq-pause-layer]').hidden=true;layer.hidden=false;}
    renderSettings();
  }
  function closeSettings(){const layer=$('[data-bq-settings-layer]');layer.hidden=true;if(state.run?.phase==='MENU'){state.run=null;showPanel('home');}else if(state.run?.paused)$('[data-bq-pause-layer]').hidden=false;}
  function renderSettings(){const pairs={music:state.musicEnabled,sfx:state.soundEnabled,motion:state.reducedMotion};Object.entries(pairs).forEach(([k,v])=>$(`[data-bq-setting="${k}"]`)?.classList.toggle('on',Boolean(v)));}
  function toggleSetting(which){if(which==='music'){state.musicEnabled=!state.musicEnabled;try{state.music?.setEnabled?.(state.musicEnabled&&state.soundEnabled);}catch(_){} }if(which==='sfx'){state.soundEnabled=!state.soundEnabled;try{state.bridge?.setSoundEnabled?.(state.soundEnabled);}catch(_){}try{state.music?.setEnabled?.(state.musicEnabled&&state.soundEnabled);}catch(_){} }if(which==='motion')state.reducedMotion=!state.reducedMotion;saveProgress();renderSettings();updateSoundIcon();}
  function toggleQuickSound(){state.soundEnabled=!state.soundEnabled;try{state.bridge?.setSoundEnabled?.(state.soundEnabled);}catch(_){}try{state.music?.setEnabled?.(state.soundEnabled&&state.musicEnabled);}catch(_){}saveProgress();updateSoundIcon();if(state.soundEnabled)sfx('tap');}
  function updateSoundIcon(){const b=$('[data-bq-sound]');if(b)b.textContent=state.soundEnabled?'🔊':'🔇';}

  function updateOrientationHint(){const stage=$('[data-bq-game-stage]');if(!stage)return;stage.classList.toggle('landscape-hint',window.innerWidth<700&&window.innerHeight>window.innerWidth);}
  function updateHud(force=false){
    const r=state.run;if(!r||r.phase==='MENU')return;const t=now();if(!force&&t-state.hudPaintAt<80)return;state.hudPaintAt=t;
    const p=r.player;
    $('[data-bq-health]').textContent='♥ '.repeat(Math.max(0,p.health)).trim()||'OFFLINE';
    const linkNeed=(r.level.gates||[]).length;
    const b=r.boss;
    if(b?.alive) $('[data-bq-chip]').textContent=`${bossName(b)} HP ${b.hp}/${b.maxHp} · ${b.weak?'VULNERABLE — FIRE!':'SHIELDED — DODGE'}`;
    else $('[data-bq-chip]').textContent=`DATA CHIPS ${r.chips} / 3${r.player.crouching?' · CROUCH':''}`;
    $('[data-bq-coins]').textContent=String(r.coins);$('[data-bq-time]').textContent=formatTime(r.activeMs);
    const world=DATA().worlds.find(w=>w.id===r.level.world);$('[data-bq-level-label]').textContent=`${world?.name||'BYTE WORLD'} ${r.level.id}`;

    const gearBits=[];if(p.gear?.blasterArm)gearBits.push('BLASTER ARM');if(p.gear?.jumpBoots)gearBits.push('JUMP BOOTS');
    const gearEl=$('[data-bq-gear]');if(gearEl)gearEl.textContent=gearBits.length?`GEAR · ${gearBits.join(' + ')}`:'NORMAL BYTE · FIND GEAR CAPSULES';

    const temp=$('[data-bq-temp]');
    if(temp){
      const timed=['flight','overclock','speed','air','pulse'].includes(p.power)&&Number.isFinite(p.powerUntil)&&p.powerUntil>r.elapsed;
      if(timed){const remain=Math.max(0,p.powerUntil-r.elapsed);const names={flight:'JET',overclock:'OVERCLOCK',speed:'SPEED',air:'AIR',pulse:'PULSE'};temp.hidden=false;temp.textContent=`${names[p.power]||p.power.toUpperCase()} · ${remain.toFixed(1)}s`;}
      else {temp.hidden=true;temp.textContent='';}
    }

    const link=$('[data-bq-link-status]');
    if(link){
      const pending=(r.level.linkTokens||[]).find(t=>!t.taken&&t.required!==false);
      const locked=(r.level.gates||[]).some(g=>!g.open);
      if(pending&&locked){const dx=pending.x-(p.x+p.w/2);link.hidden=false;link.textContent=`LINK TOKEN ${dx>=0?'→':'←'} ${Math.round(Math.abs(dx)/10)*10}px`;}
      else if(linkNeed&&locked){link.hidden=false;link.textContent=`LINK TOKEN · ${r.keys}/${linkNeed}`;}
      else if(linkNeed){link.hidden=false;link.textContent='LINK GATE · OPEN';}
      else {link.hidden=true;link.textContent='';}
    }

    const power=$('[data-bq-power]');const icons={shield:'⬡',air:'⇧',speed:'»',pulse:'✦',flight:'🚀',overclock:'★'};
    power.textContent=hasBlaster(r)?'BL':(hasJumpBoots(r)?'JB':(icons[p.power]||(p.syncBoostUntil>r.elapsed?'⚡':'—')));
    power.title=hasBlaster(r)?'BLASTER ARM · PERSISTENT':hasJumpBoots(r)?'JUMP BOOTS · PERSISTENT':(p.power?`${p.power.toUpperCase()} CORE`:(p.syncBoostUntil>r.elapsed?'SYNC BOOST':''));
    const action=$('[data-bq-control="action"]');
    if(action){const armed=hasBlaster(r);const usable=armed||(p.power==='air'&&p.powerUntil>r.elapsed);action.textContent=armed?'FIRE':'POWER';action.setAttribute('aria-label',armed?'Fire Blaster Arm':'Power');action.classList.toggle('armed',armed);action.disabled=!usable;action.style.opacity=usable?'1':'.42';action.style.background=armed?'linear-gradient(145deg,rgba(137,77,218,.92),rgba(55,148,208,.88))':'';action.style.borderColor=armed?'rgba(222,178,255,.9)':'';action.style.boxShadow=armed?'0 0 24px rgba(190,116,255,.34), inset 0 1px rgba(255,255,255,.16)':'';action.title=armed?'BLASTER ARM · HOLD TO FIRE · INFINITE ENERGY':usable?'AIR CORE BOOST':'';}
  }
  function toast(message,type='normal',duration=1300){const el=$('[data-bq-toast]');if(!el)return;clearTimeout(state.toastTimer);el.textContent=message;el.className=`bq-toast show ${type}`;state.toastTimer=setTimeout(()=>el.classList.remove('show'),duration);}

  function draw() {
    const r=state.run,ctx=state.ctx;if(!r||!ctx||r.phase==='MENU')return;
    const w=state.logicalW,h=state.logicalH;const world=DATA().worlds.find(x=>x.id===r.level.world)||DATA().worlds[0];
    const shake=state.reducedMotion?0:r.shake*6;const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;
    ctx.save();ctx.clearRect(0,0,w,h);drawBackground(ctx,r,world,w,h);ctx.translate(-r.camera.x+sx,-r.camera.y+sy);
    drawWinds(ctx,r);drawPlatforms(ctx,r,world);drawGates(ctx,r,world);drawHazards(ctx,r);drawPortals(ctx,r);drawCheckpoints(ctx,r);drawPickups(ctx,r);drawEnemies(ctx,r);drawBoss(ctx,r);drawProjectiles(ctx,r);drawExit(ctx,r,world);drawPlayer(ctx,r);drawParticles(ctx,r);drawEscape(ctx,r);ctx.restore();
    drawGuardianOverlay(ctx,r,w,h);
    if(r.flash>0){ctx.fillStyle=`rgba(255,80,110,${Math.min(.32,r.flash*.25)})`;ctx.fillRect(0,0,w,h);}
    if(r.respawning){ctx.fillStyle='rgba(3,8,15,.3)';ctx.fillRect(0,0,w,h);}
  }

  function drawGuardianOverlay(ctx,r,w,h){
    const b=r.boss;if(!b?.alive)return;
    const bw=Math.min(430,w*.56), bh=48, x=(w-bw)/2, y=64;
    ctx.save();ctx.globalAlpha=.96;
    ctx.fillStyle='rgba(4,13,24,.86)';roundRect(ctx,x,y,bw,bh,13);ctx.fill();
    ctx.strokeStyle=b.weak?'rgba(101,255,200,.75)':'rgba(255,113,139,.52)';ctx.lineWidth=2;roundRect(ctx,x,y,bw,bh,13);ctx.stroke();
    ctx.fillStyle='#eaffff';ctx.font='900 11px system-ui,sans-serif';ctx.textAlign='left';ctx.fillText(`${bossName(b)} · HP ${b.hp}/${b.maxHp}`,x+14,y+17);
    ctx.fillStyle=b.weak?'#72ffc8':'#ff9aac';ctx.font='900 10px system-ui,sans-serif';ctx.textAlign='right';ctx.fillText(b.weak?'VULNERABLE · FIRE NOW!':'SHIELDED · DODGE',x+bw-14,y+17);
    const trackX=x+14, trackY=y+27, trackW=bw-28, trackH=9;
    ctx.fillStyle='rgba(255,255,255,.12)';roundRect(ctx,trackX,trackY,trackW,trackH,5);ctx.fill();
    const ratio=clamp(b.hp/Math.max(1,b.maxHp),0,1);ctx.fillStyle=b.weak?'#65f0b7':'#ff667e';roundRect(ctx,trackX,trackY,trackW*ratio,trackH,5);ctx.fill();
    ctx.fillStyle='rgba(235,250,255,.8)';ctx.font='800 8px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('BLASTER ∞ · X / SHIFT · PHONE: FIRE',w/2,y+45);
    ctx.restore();
  }

  function drawBackground(ctx,r,world,w,h){
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,world.sky[0]);
    g.addColorStop(.62,world.sky[1]);
    g.addColorStop(1,'#07111f');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    const cx=r.camera.x;
    if(world.id===1){
      for(let i=0;i<7;i++){
        const x=((i*270-cx*.1)%1900+1900)%1900-180;
        ctx.fillStyle=i%2?'rgba(28,118,126,.16)':'rgba(40,157,134,.14)';
        ctx.beginPath();ctx.moveTo(x,h);ctx.quadraticCurveTo(x+120,h-180,x+280,h);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle='rgba(255,255,255,.58)';
      for(let i=0;i<8;i++){
        const x=((i*250-cx*.05)%1750+1750)%1750;
        ctx.beginPath();ctx.ellipse(x,88+(i%3)*54,78,22,0,0,Math.PI*2);ctx.fill();
      }
      for(let i=0;i<12;i++){
        const x=((i*145-cx*.22)%1900+1900)%1900-40;const y=430-(i%4)*6;
        ctx.fillStyle='rgba(103,231,186,.28)';ctx.fillRect(x,y,4,18);ctx.beginPath();ctx.arc(x+2,y-4,8,0,Math.PI*2);ctx.fill();
      }
    } else if(world.id===2){
      for(let i=0;i<10;i++){
        const x=((i*180-cx*.12)%1800+1800)%1800;
        ctx.fillStyle='rgba(6,16,28,.38)';ctx.fillRect(x,110,34,h);
        ctx.beginPath();ctx.arc(x+17,112,76,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(204,117,255,.11)';ctx.fillRect(x+10,190,6,8);ctx.fillRect(x+18,265,6,8);ctx.fillRect(x+6,325,6,8);
      }
      ctx.fillStyle='rgba(215,136,255,.17)';
      for(let i=0;i<28;i++){
        const x=((i*83-cx*.18)%1300+1300)%1300, y=(i*59)%360+30;
        ctx.fillRect(x,y,3,3);
      }
    } else if(world.id===3){
      for(let i=0;i<8;i++){
        const x=((i*240-cx*.14)%1820+1820)%1820;
        ctx.fillStyle='rgba(8,14,22,.42)';ctx.fillRect(x,150,130,400);
        ctx.fillStyle='rgba(255,186,63,.14)';for(let y=180;y<430;y+=46)ctx.fillRect(x+20,y,14,9);
        ctx.fillStyle='rgba(255,209,105,.08)';ctx.fillRect(x+84,160,18,220);
      }
      ctx.strokeStyle='rgba(255,202,101,.14)';ctx.lineWidth=6;
      for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(0,98+i*72);ctx.lineTo(w,55+i*72);ctx.stroke();}
      ctx.fillStyle='rgba(255,120,66,.08)';
      for(let i=0;i<6;i++){const x=((i*320-cx*.2)%1900+1900)%1900-80;ctx.fillRect(x,360,170,10);ctx.fillRect(x+24,330,12,45);ctx.fillRect(x+128,330,12,45);}    
    } else {
      ctx.fillStyle='rgba(255,255,255,.52)';
      for(let i=0;i<11;i++){
        const x=((i*190-cx*.08)%1650+1650)%1650-100,y=92+(i%4)*68;
        ctx.beginPath();ctx.ellipse(x,y,96,28,0,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='rgba(53,121,184,.16)';
      for(let i=0;i<8;i++){
        const x=((i*260-cx*.16)%1900+1900)%1900-100;
        ctx.beginPath();ctx.moveTo(x,h);ctx.lineTo(x+95,h-170);ctx.lineTo(x+220,h);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle='rgba(255,255,255,.18)';
      for(let i=0;i<7;i++){
        const x=((i*320-cx*.22)%2000+2000)%2000-50, y=160+(i%3)*70;
        ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.arc(x+24,y+6,14,0,Math.PI*2);ctx.arc(x+50,y,12,0,Math.PI*2);ctx.fill();
      }
    }
    const vign=ctx.createRadialGradient(w/2,h/2,80,w/2,h/2,650);vign.addColorStop(.58,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(0,10,24,.3)');ctx.fillStyle=vign;ctx.fillRect(0,0,w,h);
  }

  function drawPlatforms(ctx,r,world){r.level.platforms.forEach(p=>{const active=platformActive(p,r.elapsed);if(!active&&p.kind==='blinking')return;ctx.save();if(p.kind==='falling'&&p._triggered&&!p._fallen){const jig=state.reducedMotion?0:Math.sin(r.elapsed*55)*2;ctx.translate(jig,0);}const grad=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h);grad.addColorStop(0,world.trim);grad.addColorStop(.18,world.ground);grad.addColorStop(1,'#091522');ctx.fillStyle=grad;roundRect(ctx,p.x,p.y,p.w,p.h,Math.min(10,p.h/2));ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(p.x+6,p.y+4,Math.max(0,p.w-12),3);if(p.kind==='conveyor'){ctx.fillStyle='rgba(255,220,100,.55)';for(let x=p.x+12;x<p.x+p.w-12;x+=28){ctx.beginPath();const d=p.conveyor>=0?1:-1;ctx.moveTo(x,p.y+14);ctx.lineTo(x+8*d,p.y+9);ctx.lineTo(x+8*d,p.y+19);ctx.closePath();ctx.fill();}}if(p.kind==='moving'){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.setLineDash([5,6]);ctx.strokeRect(p.x+5,p.y+5,p.w-10,p.h-10);}ctx.restore();});}
  function drawWinds(ctx,r){r.level.winds.forEach(w=>{ctx.save();ctx.strokeStyle='rgba(225,249,255,.36)';ctx.lineWidth=2;for(let i=0;i<5;i++){const y=w.y+30+i*(w.h-60)/4;const dir=Math.sign(w.forceX||1);const offset=((r.elapsed*90*dir+i*53)%120);ctx.beginPath();ctx.moveTo(w.x+(dir>0?offset:w.w-offset),y);ctx.quadraticCurveTo(w.x+w.w/2,y-10,w.x+(dir>0?Math.min(w.w,offset+70):Math.max(0,w.w-offset-70)),y);ctx.stroke();}ctx.restore();});}
  function drawGates(ctx,r,world){
    (r.level.gates || []).forEach(g=>{
      if(g.open){
        if(g.justOpened){
          ctx.save();ctx.globalAlpha=.24;ctx.fillStyle=world.accent||'#6ff7d0';
          ctx.fillRect(g.x-10,g.y,g.w+20,g.h);ctx.restore();g.justOpened=false;
        }
        return;
      }
      ctx.save();
      const pulse=.55+.45*Math.sin(r.elapsed*4+g._id);
      const grad=ctx.createLinearGradient(g.x,g.y,g.x+g.w,g.y);
      grad.addColorStop(0,'rgba(13,31,48,.96)');
      grad.addColorStop(.48,world.accent||'#6ff7d0');
      grad.addColorStop(.52,'#071421');
      grad.addColorStop(1,'rgba(13,31,48,.96)');
      ctx.fillStyle=grad;
      roundRect(ctx,g.x,g.y,g.w,g.h,Math.min(10,g.w/2));ctx.fill();
      ctx.strokeStyle=`rgba(126,255,218,${.45+.3*pulse})`;ctx.lineWidth=2;
      roundRect(ctx,g.x+4,g.y+4,g.w-8,g.h-8,Math.min(8,g.w/2));ctx.stroke();
      ctx.fillStyle='rgba(5,18,29,.9)';
      for(let yy=g.y+14;yy<g.y+g.h-10;yy+=22)ctx.fillRect(g.x+5,yy,g.w-10,5);
      ctx.fillStyle='#baffea';ctx.font='900 8px sans-serif';ctx.textAlign='center';
      ctx.fillText('LINK',g.x+g.w/2,g.y+18);ctx.save();ctx.translate(g.x+g.w/2,g.y+g.h/2);ctx.rotate(-Math.PI/2);ctx.fillStyle='#fff0a0';ctx.font='900 8px sans-serif';ctx.fillText(`${g.label||'GATE'} · TOKEN`,0,-8);ctx.restore();
      ctx.restore();
    });
  }

  function drawHazards(ctx,r){r.level.hazards.forEach(h=>{if(h.type==='laser'){const active=((r.elapsed*1000+Number(h.phase||0))%Number(h.period||1800))<Number(h.activeMs||900);ctx.fillStyle=active?'rgba(255,77,105,.9)':'rgba(255,206,90,.45)';ctx.fillRect(h.x,h.y,h.w,h.h);if(active){ctx.shadowBlur=18;ctx.shadowColor='#ff4768';ctx.fillRect(h.x+5,h.y,h.w-10,h.h);ctx.shadowBlur=0;}}else{ctx.fillStyle='#ffcc55';ctx.beginPath();for(let x=h.x;x<h.x+h.w;x+=16){ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+8,h.y);ctx.lineTo(x+16,h.y+h.h);}ctx.fill();}});}
  function drawPortals(ctx,r){r.level.portals.forEach(po=>{ctx.save();ctx.translate(po.x,po.y-34);ctx.strokeStyle='#b789ff';ctx.lineWidth=6;ctx.shadowBlur=18;ctx.shadowColor='#ae7cff';ctx.beginPath();ctx.ellipse(0,0,20,31,0,0,Math.PI*2);ctx.stroke();ctx.lineWidth=2;ctx.rotate(r.elapsed*.8);ctx.beginPath();ctx.ellipse(0,0,31,12,0,0,Math.PI*2);ctx.stroke();ctx.restore();});}
  function drawCheckpoints(ctx,r){r.level.checkpoints.forEach(cp=>{ctx.save();ctx.translate(cp.x,cp.y);ctx.fillStyle=cp.active?'#66ffd0':'#4ccde6';ctx.shadowBlur=cp.active?26:12;ctx.shadowColor=ctx.fillStyle;ctx.fillRect(-4,-58,8,58);ctx.beginPath();ctx.arc(0,-62,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-62,22+Math.sin(r.elapsed*3)*3,0,Math.PI*2);ctx.stroke();ctx.restore();});}
  function drawPickups(ctx,r){r.level.coins.forEach(c=>{if(c.taken)return;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(r.elapsed*2.2+c._id);ctx.fillStyle='#ffd85f';ctx.shadowBlur=10;ctx.shadowColor='#ffd85f';roundRect(ctx,-6,-10,12,20,4);ctx.fill();ctx.fillStyle='#5c4200';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('B',0,3);ctx.restore();});r.level.chips.forEach(c=>{if(c.taken)return;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(Math.sin(r.elapsed*2+c._id)*.18);ctx.fillStyle='#6ff7d0';ctx.shadowBlur=20;ctx.shadowColor='#4ff5d0';ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(14,-4);ctx.lineTo(9,14);ctx.lineTo(-9,14);ctx.lineTo(-14,-4);ctx.closePath();ctx.fill();ctx.fillStyle='#083044';ctx.fillRect(-3,-7,6,14);ctx.restore();});r.level.powerUps.forEach(u=>{if(u.taken)return;const colors={shield:'#61eaff',air:'#8adfff',speed:'#ffe26b',pulse:'#c38bff'};ctx.save();ctx.translate(u.x,u.y);ctx.rotate(r.elapsed*.9);ctx.fillStyle=colors[u.type]||'#fff';ctx.shadowBlur=20;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;const x=Math.cos(a)*14,y=Math.sin(a)*14;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.fillStyle='#092033';ctx.font='900 10px sans-serif';ctx.textAlign='center';ctx.fillText({shield:'S',air:'A',speed:'»',pulse:'P'}[u.type]||'?',0,4);ctx.restore();});}
  function drawEnemies(ctx,r){r.level.enemies.forEach(e=>{if(!e.alive)return;ctx.save();ctx.translate(e.x,e.y);if(e.type==='bugbot'){ctx.fillStyle='#ff6f82';roundRect(ctx,-20,-30,40,28,10);ctx.fill();ctx.fillStyle='#ffe377';ctx.fillRect(-12,-24,7,5);ctx.fillRect(5,-24,7,5);ctx.strokeStyle='#702236';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-14,-3);ctx.lineTo(-20,7);ctx.moveTo(14,-3);ctx.lineTo(20,7);ctx.stroke();}
      else if(e.type==='spikebyte'){ctx.fillStyle='#ff9b55';ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=i%2?17:25,xx=Math.cos(a)*rr,yy=Math.sin(a)*rr-17;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fill();ctx.fillStyle='#251522';ctx.fillRect(-10,-22,6,5);ctx.fillRect(4,-22,6,5);}
      else if(e.type==='flyer'){ctx.fillStyle='#b989ff';ctx.beginPath();ctx.ellipse(0,-18,18,14,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d9c2ff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-14,-18);ctx.lineTo(-28,-28+Math.sin(r.elapsed*12)*5);ctx.moveTo(14,-18);ctx.lineTo(28,-28-Math.sin(r.elapsed*12)*5);ctx.stroke();ctx.fillStyle='#67f5e0';ctx.fillRect(-8,-21,16,5);}
      else if(e.type==='crawler'){ctx.fillStyle='#69d8ff';roundRect(ctx,-20,-24,40,22,8);ctx.fill();ctx.strokeStyle='#174d74';ctx.lineWidth=3;for(let x=-14;x<=14;x+=14){ctx.beginPath();ctx.moveTo(x,-2);ctx.lineTo(x-6,6);ctx.stroke();}}
      else{ctx.fillStyle='#ffbd4a';roundRect(ctx,-22,-39,44,38,8);ctx.fill();ctx.fillStyle='#142337';ctx.fillRect(-13,-30,26,7);ctx.fillStyle='#ff6a6a';ctx.fillRect(e.dir<0?-14:6,-27,8,4);ctx.strokeStyle='#ffdf83';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-39);ctx.lineTo(0,-51);ctx.stroke();}
      ctx.restore();});}
  function drawBoss(ctx,r){const b=r.boss;if(!b||!b.alive)return;ctx.save();ctx.translate(b.x,b.y);const color=b.type==='bugzilla'?'#ff6d77':b.type==='glitchbeast'?'#bd6cff':b.type==='volttitan'?'#ffbf48':'#6ddcff';ctx.fillStyle=color;ctx.shadowBlur=b.weak?28:12;ctx.shadowColor=color;roundRect(ctx,-55,-86,110,82,22);ctx.fill();ctx.fillStyle='#0b2032';roundRect(ctx,-36,-69,72,25,10);ctx.fill();ctx.fillStyle=b.weak?'#65ffc3':'#ff6f82';ctx.fillRect(-24,-62,48,10);ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-45,-8);ctx.lineTo(-62,8);ctx.moveTo(45,-8);ctx.lineTo(62,8);ctx.stroke();for(let i=0;i<b.maxHp;i++){ctx.fillStyle=i<b.hp?'#ffef83':'rgba(255,255,255,.17)';ctx.fillRect(-b.maxHp*10+i*20,-112,14,6);}if(b.weak){ctx.strokeStyle='#8bffd9';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-50,47+Math.sin(r.elapsed*8)*4,0,Math.PI*2);ctx.stroke();}ctx.font='900 10px system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle=b.weak?'#8bffd9':'#ff9aaa';ctx.fillText(b.weak?'FIRE!':'SHIELDED',0,-123);ctx.restore();}
  function drawProjectiles(ctx,r){r.projectiles.forEach(q=>{ctx.save();ctx.fillStyle=q.kind==='shock'?'#ff845f':q.kind==='volt'?'#ffe35c':q.kind==='wind'?'#dff8ff':'#cd7dff';ctx.shadowBlur=12;ctx.shadowColor=ctx.fillStyle;roundRect(ctx,q.x,q.y,q.w,q.h,6);ctx.fill();ctx.restore();});r.shots.forEach(q=>{ctx.save();ctx.fillStyle='#d59aff';ctx.shadowBlur=18;ctx.shadowColor='#b968ff';roundRect(ctx,q.x,q.y,q.w,q.h,5);ctx.fill();ctx.fillStyle='#f5e8ff';roundRect(ctx,q.x+3,q.y+2,Math.max(4,q.w-8),Math.max(2,q.h-4),3);ctx.fill();ctx.restore();});}
  function drawExit(ctx,r,world){const x=r.level.exit.x,y=r.level.exit.y;const locked=(r.level.type==='boss'&&r.boss?.alive)||(r.level.type==='collect'&&r.chips<3)||(r.level.gates||[]).some(g=>!g.open);ctx.save();ctx.translate(x,y);ctx.fillStyle=locked?'#6f7780':world.accent;ctx.shadowBlur=locked?0:22;ctx.shadowColor=world.accent;roundRect(ctx,-24,-66,48,66,12);ctx.fill();ctx.fillStyle='#071421';roundRect(ctx,-16,-54,32,34,8);ctx.fill();ctx.fillStyle=locked?'#8e969e':'#9fffe3';ctx.font='900 9px sans-serif';ctx.textAlign='center';ctx.fillText(locked?'LOCK':'RESTORE',0,-33);ctx.restore();}
  function drawPlayer(ctx,r){
    const p=r.player;
    if(r.respawning&&Math.floor(r.elapsed*16)%2===0)return;
    if(p.invuln>0&&Math.floor(r.elapsed*18)%2===0)return;
    const speed=Math.abs(p.vx),crouch=p.crouching?1:0;
    const run=Math.sin((p.runCycle||0)*7.4),runAlt=Math.cos((p.runCycle||0)*7.4);
    const jumpTilt=clamp(p.vy/620,-.22,.22);
    const legLen=crouch?7:15,bodyH=crouch?21:27,bodyBottom=-legLen+1,bodyY=bodyBottom-bodyH,headH=crouch?14:16,headY=bodyY-headH+2;
    const legSwing=p.grounded&&!crouch?run*12:(!p.grounded?runAlt*5:0);
    const armSwing=p.grounded&&!crouch?-run*10:(!p.grounded?-8:0);
    ctx.save();
    ctx.translate(p.x+p.w/2,p.y+p.h);
    ctx.scale(p.facing,1);
    const squash=p.landPulse?1-p.landPulse*.08:1;ctx.scale(1/squash,squash);ctx.rotate(jumpTilt*.12);
    if(p.grounded&&!crouch)ctx.translate(0,Math.abs(run)*1.2);

    ctx.save();ctx.translate(-12,bodyY+8);ctx.rotate((armSwing-8)*Math.PI/180);ctx.fillStyle='#2d5a7f';roundRect(ctx,-3,0,6,crouch?13:18,3);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(-7,bodyBottom-1);ctx.rotate((legSwing-5)*Math.PI/180);ctx.fillStyle='#274763';roundRect(ctx,-4,0,8,legLen,4);ctx.fill();ctx.fillStyle='#6eeaff';roundRect(ctx,-6,legLen-3,12,4,2);ctx.fill();ctx.restore();

    const grad=ctx.createLinearGradient(0,bodyY,0,bodyBottom);grad.addColorStop(0,'#2b5273');grad.addColorStop(1,'#132a40');ctx.fillStyle=grad;roundRect(ctx,-15,bodyY,30,bodyH,9);ctx.fill();
    ctx.fillStyle='#59f0c4';roundRect(ctx,-12,bodyY+4,24,crouch?8:10,5);ctx.fill();ctx.fillStyle='#0b1f31';ctx.fillRect(-6,bodyY+6,12,3);ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(-11,bodyY+2,22,2);

    ctx.save();ctx.translate(12,bodyY+8);ctx.rotate((armSwing+12)*Math.PI/180);ctx.fillStyle='#35678f';roundRect(ctx,-3,0,6,crouch?13:18,3);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(7,bodyBottom-1);ctx.rotate((-legSwing+5)*Math.PI/180);ctx.fillStyle='#325777';roundRect(ctx,-4,0,8,legLen,4);ctx.fill();ctx.fillStyle='#6eeaff';roundRect(ctx,-6,legLen-3,12,4,2);ctx.fill();ctx.restore();

    ctx.fillStyle='#173450';roundRect(ctx,-16,headY,32,headH,7);ctx.fill();ctx.fillStyle=hasBlaster(r)?'#c58cff':'#67f3d0';roundRect(ctx,-12,headY+3,24,Math.max(7,headH-7),5);ctx.fill();ctx.fillStyle='#082033';ctx.fillRect(-7,headY+6,14,3);ctx.fillStyle=hasBlaster(r)?'#ffd8ff':'#72e8ff';ctx.beginPath();ctx.arc(15,headY+Math.min(10,headH-4),4,0,Math.PI*2);ctx.fill();

    if(hasBlaster(r)){
      ctx.save();
      ctx.translate(16,bodyY+9);
      ctx.fillStyle='#7a4fd1';roundRect(ctx,-1,-5,23,11,5);ctx.fill();
      ctx.fillStyle='#d7a7ff';roundRect(ctx,13,-3,13,7,4);ctx.fill();
      ctx.fillStyle='#6ff7f0';ctx.fillRect(3,-2,8,4);
      if(p.fireFlash>0){ctx.fillStyle=`rgba(238,196,255,${clamp(p.fireFlash,0,1)})`;ctx.shadowBlur=18;ctx.shadowColor='#e8b5ff';ctx.beginPath();ctx.arc(29,0,5+4*p.fireFlash,0,Math.PI*2);ctx.fill();}
      ctx.restore();
      ctx.strokeStyle='rgba(200,139,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,bodyY+10,20+Math.sin(r.elapsed*8)*1.5,0,Math.PI*2);ctx.stroke();
    }

    if(hasJumpBoots(r)){
      ctx.fillStyle='#ffe477';ctx.shadowBlur=10;ctx.shadowColor='#ffe477';roundRect(ctx,-14,-5,10,5,2);ctx.fill();roundRect(ctx,4,-5,10,5,2);ctx.fill();ctx.shadowBlur=0;
      if(!p.grounded){ctx.fillStyle='rgba(255,227,105,.32)';ctx.fillRect(-11,1,4,8);ctx.fillRect(7,1,4,8);}
    }
    if(tempPowerActive(r,'flight')){ctx.fillStyle='#7deaff';ctx.shadowBlur=16;ctx.shadowColor='#7deaff';ctx.beginPath();ctx.moveTo(-12,2);ctx.lineTo(-6,17+Math.sin(r.elapsed*20)*5);ctx.lineTo(-2,2);ctx.fill();ctx.beginPath();ctx.moveTo(2,2);ctx.lineTo(8,17+Math.cos(r.elapsed*20)*5);ctx.lineTo(12,2);ctx.fill();ctx.shadowBlur=0;}
    if(tempPowerActive(r,'overclock')){ctx.strokeStyle=`rgba(255,242,112,${.62+.25*Math.sin(r.elapsed*15)})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,crouch?-18:-28,34,crouch?26:39,0,0,Math.PI*2);ctx.stroke();}
    if(speed>245&&p.grounded&&!crouch){ctx.fillStyle='rgba(112,236,255,.18)';for(let i=0;i<3;i++)ctx.fillRect(-25-i*9,-5+i*2,8,2);}
    if(p.syncBoostUntil>r.elapsed){ctx.strokeStyle='rgba(255,226,99,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,bodyY+12,23+Math.sin(r.elapsed*10)*2,0,Math.PI*2);ctx.stroke();}
    if(p.shield>0){ctx.strokeStyle='rgba(105,236,255,.72)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,crouch?-18:-28,29,crouch?22:34,0,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }

  function drawParticles(ctx,r){r.particles.forEach(q=>{ctx.globalAlpha=clamp(q.life/q.max,0,1);ctx.fillStyle=q.color;ctx.fillRect(q.x-q.size/2,q.y-q.size/2,q.size,q.size);});ctx.globalAlpha=1;}
  function drawEscape(ctx,r){if(r.level.type!=='escape')return;const x=r.corruptionX;const g=ctx.createLinearGradient(x-120,0,x+80,0);g.addColorStop(0,'rgba(139,54,255,.05)');g.addColorStop(.7,'rgba(139,54,255,.55)');g.addColorStop(1,'rgba(255,62,119,.75)');ctx.fillStyle=g;ctx.fillRect(x-120,0,200,r.level.height);}
  function roundRect(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();}

  function ensureAudio(){if(!state.soundEnabled)return null;if(!state.audioCtx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{state.audioCtx=new C();}catch(_){return null;}}try{if(state.audioCtx.state==='suspended')state.audioCtx.resume();}catch(_){}return state.audioCtx;}
  function tone(freq,dur=.07,gain=.025,type='triangle',slide=0){const c=ensureAudio();if(!c)return;try{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,c.currentTime);if(slide)o.frequency.linearRampToValueAtTime(Math.max(50,freq+slide),c.currentTime+dur);g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(gain,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+dur);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+dur+.02);}catch(_){} }
  function sfx(kind){if(!state.soundEnabled)return;try{state.music?.duck?.(.52,130);}catch(_){}if(kind==='start'){tone(392,.07,.022,'square',90);setTimeout(()=>tone(587,.09,.024,'triangle',120),55);}else if(kind==='jump')tone(330,.08,.028,'square',120);else if(kind==='land')tone(130,.045,.018,'triangle',-20);else if(kind==='coin')tone(760,.055,.023,'square',180);else if(kind==='chip'){tone(520,.09,.03,'triangle',220);setTimeout(()=>tone(850,.11,.026,'triangle',170),55);}else if(kind==='checkpoint'){[440,660,880].forEach((f,i)=>setTimeout(()=>tone(f,.09,.025,'triangle',80),i*55));}else if(kind==='stomp')tone(210,.08,.035,'square',110);else if(kind==='hurt')tone(150,.16,.035,'sawtooth',-70);else if(kind==='fail')tone(110,.3,.035,'sawtooth',-55);else if(kind==='power'){tone(430,.08,.025,'triangle',240);setTimeout(()=>tone(760,.1,.024,'sine',140),60);}else if(kind==='portal'){tone(300,.15,.02,'sine',500);}else if(kind==='pulse'){tone(430,.055,.03,'square',310);setTimeout(()=>tone(760,.045,.018,'triangle',90),28);}else if(kind==='boost')tone(260,.11,.03,'sawtooth',340);else if(kind==='shield')tone(380,.13,.03,'sine',220);else if(kind==='bossHit')tone(125,.18,.04,'square',100);else if(kind==='bossAttack')tone(95,.13,.024,'sawtooth',70);else if(kind==='bossDefeat'){[196,262,330,440,659].forEach((f,i)=>setTimeout(()=>tone(f,.16,.032,'triangle',80),i*75));}else if(kind==='complete'){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.16,.03,'triangle',90),i*75));}else if(kind==='xp'){[659,784,988].forEach((f,i)=>setTimeout(()=>tone(f,.13,.025,'sine',100),i*60));}else tone(480,.04,.015,'square',40);}

  function open(options={}) {
    build();
    state.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;state.music=options.music||null;state.onBack=typeof options.onBack==='function'?options.onBack:null;state.onClose=typeof options.onClose==='function'?options.onClose:null;state.onReward=typeof options.onReward==='function'?options.onReward:null;
    loadProgress();state.open=true;state.overlay.hidden=false;try{state.music?.setEnabled?.(state.soundEnabled&&state.musicEnabled);}catch(_){}showPanel('home');renderSettings();
  }
  function close(fromTop=false){if(!state.built)return;cancelRewardRound();stopLoop();clearInput();state.run=null;state.open=false;state.overlay.hidden=true;try{if(fromTop)state.onClose?.();else state.onBack?.();}catch(_){} }
  function isOpen(){return Boolean(state.open&&state.overlay&&!state.overlay.hidden);}
  function pauseForExitGuard(){if(!isOpen()||state.panel!=='game'||!state.run||state.run.completed)return false;pauseGame();return true;}

  window.ICT8ByteQuest=Object.freeze({assetVersion:ASSET_VERSION,open,close,isOpen,pauseForExitGuard});
})();
