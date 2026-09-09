(() => {
  'use strict';

  const GAME_REGISTRY = Object.freeze([
    {
      id: 'code-fly',
      stateKey: 'codeFly',
      name: 'CODE FLY',
      icon: '🖥️',
      description: 'Fly through digital server towers, beat your high score, and earn a little bonus XP.',
      maxXp: 15,
      globalName: 'ICT8CodeFly',
      script: 'games/code-fly/code-fly.js',
      style: 'games/code-fly/code-fly.css',
      bestText(record = {}) { return `🏆 Best Score: ${Math.max(0, Number(record.bestScore || 0))}`; }
    },
    {
      id: 'bug-smash',
      stateKey: 'bugSmash',
      name: 'BUG SMASH',
      icon: '🐛',
      description: 'Smash bugs before they disappear. Build combos and test your reaction speed!',
      maxXp: 10,
      globalName: 'ICT8BugSmash',
      script: 'games/bug-smash/bug-smash.js',
      style: 'games/bug-smash/bug-smash.css',
      bestText(record = {}) { return `🏆 Best: ${Math.max(0, Number(record.bestScore || 0))}`; }
    },
    {
      id: 'runner-404',
      stateKey: 'runner404',
      name: '404 RUNNER',
      icon: '🏃',
      description: 'Run through the digital world, jump over errors, and survive as long as you can.',
      maxXp: 15,
      globalName: 'ICT8404Runner',
      script: 'games/runner-404/runner-404.js',
      style: 'games/runner-404/runner-404.css',
      bestText(record = {}) { return `🏆 Best: ${Math.max(0, Number(record.bestScore || 0))}`; }
    },
    {
      id: 'memory-code',
      stateKey: 'memoryCode',
      name: 'MEMORY CODE',
      icon: '🧠',
      description: 'Flip the cards, remember their positions, and match all the coding pairs.',
      maxXp: 8,
      globalName: 'ICT8MemoryCode',
      script: 'games/memory-code/memory-code.js',
      style: 'games/memory-code/memory-code.css',
      bestText(record = {}) {
        const timeMs = Math.max(0, Number(record.bestTimeMs || 0));
        return timeMs > 0 ? `🏆 Best: ${(timeMs / 1000).toFixed(1)} sec` : '🏆 Best: —';
      }
    },
    {
      id: 'code-snake',
      stateKey: 'codeSnake',
      name: 'CODE SNAKE',
      icon: '🐍',
      description: 'Collect code tokens, grow your digital chain, and avoid crashing into yourself.',
      maxXp: 10,
      globalName: 'ICT8CodeSnake',
      script: 'games/code-snake/code-snake.js',
      style: 'games/code-snake/code-snake.css',
      bestText(record = {}) { return `🏆 Best: ${Math.max(0, Number(record.bestScore || 0))}`; }
    },
    {
      id: 'code-stack',
      stateKey: 'codeStack',
      name: 'CODE STACK',
      icon: '🧱',
      description: 'Stack moving code blocks, hit perfect placements, and build the highest tower you can.',
      maxXp: 10,
      globalName: 'ICT8CodeStack',
      script: 'games/code-stack/code-stack.js',
      style: 'games/code-stack/code-stack.css',
      bestText(record = {}) {
        const score = Math.max(0, Number(record.bestScore || 0));
        const tower = Math.max(0, Number(record.highestTower || 0));
        return tower > 0 ? `🏆 Best: ${score} · Tower ${tower}` : `🏆 Best: ${score}`;
      }
    },
    {
      id: 'byte-rush',
      stateKey: 'byteRush',
      name: 'BYTE RUSH',
      icon: '🚗',
      description: 'Race through a cyber highway, dodge errors, and collect score chips without crashing.',
      maxXp: 10,
      globalName: 'ICT8ByteRush',
      script: 'games/byte-rush/byte-rush.js',
      style: 'games/byte-rush/byte-rush.css',
      bestText(record = {}) {
        const distance = Math.max(0, Number(record.bestDistance || record.bestScore || 0));
        return `🏆 Best Distance: ${Math.floor(distance)}`;
      }
    },
    {
      id: 'rocket-byte',
      stateKey: 'rocketByte',
      name: 'ROCKET BYTE',
      icon: '🚀',
      description: 'Climb through the digital sky, dodge errors, collect fuel, and reach a new height record.',
      maxXp: 10,
      globalName: 'ICT8RocketByte',
      script: 'games/rocket-byte/rocket-byte.js',
      style: 'games/rocket-byte/rocket-byte.css',
      bestText(record = {}) {
        const height = Math.max(0, Number(record.bestHeight || record.bestScore || 0));
        return `🏆 Best Height: ${Math.floor(height)}`;
      }
    },
    {
      id: 'falling-code',
      stateKey: 'fallingCode',
      name: 'FALLING CODE',
      icon: '🪂',
      description: 'Fall through digital platforms, line up with shrinking gaps, and dive as deep as you can.',
      maxXp: 10,
      globalName: 'ICT8FallingCode',
      script: 'games/falling-code/falling-code.js',
      style: 'games/falling-code/falling-code.css',
      bestText(record = {}) {
        const depth = Math.max(0, Number(record.bestDepth || record.bestScore || 0));
        return `🏆 Best Depth: ${Math.floor(depth)}`;
      }
    },
    {
      id: 'perfect-shot',
      stateKey: 'perfectShot',
      name: 'PERFECT SHOT',
      icon: '\u{1F3AF}',
      description: 'Time the moving target, hit the bullseye, and build a perfect-shot combo.',
      maxXp: 10,
      globalName: 'ICT8PerfectShot',
      script: 'games/perfect-shot/perfect-shot.js',
      style: 'games/perfect-shot/perfect-shot.css',
      bestText(record = {}) {
        const score = Math.max(0, Number(record.bestScore || 0));
        const combo = Math.max(0, Number(record.bestCombo || 0));
        return combo > 0 ? `\u{1F3C6} Best: ${score} \u00b7 Combo x${combo}` : `\u{1F3C6} Best: ${score}`;
      }
    },
    {
      id: 'color-switch-byte',
      stateKey: 'colorSwitchByte',
      name: 'COLOR SWITCH BYTE',
      icon: '\u{1F7E8}',
      description: 'Tap upward and pass through rotating color sections only when your byte color matches.',
      maxXp: 10,
      globalName: 'ICT8ColorSwitchByte',
      script: 'games/color-switch-byte/color-switch-byte.js',
      style: 'games/color-switch-byte/color-switch-byte.css',
      bestText(record = {}) {
        const score = Math.max(0, Number(record.bestScore || 0));
        return `\u{1F3C6} Best: ${score}`;
      }
    },
    {
      id: 'code-hoops',
      stateKey: 'codeHoops',
      name: 'CODE HOOPS',
      icon: '\u{1F3C0}',
      description: 'Drag, aim, and release a digital ball into moving hoops. Perfect swishes build your streak.',
      maxXp: 10,
      globalName: 'ICT8CodeHoops',
      script: 'games/code-hoops/code-hoops.js',
      style: 'games/code-hoops/code-hoops.css',
      bestText(record = {}) {
        const score = Math.max(0, Number(record.bestScore || 0));
        const streak = Math.max(0, Number(record.bestStreak || 0));
        return streak > 0 ? `\u{1F3C6} Best: ${score} \u00b7 Streak x${streak}` : `\u{1F3C6} Best: ${score}`;
      }
    },
    {
      id: 'red-light-green-light',
      stateKey: 'redLightGreenLight',
      name: 'RED LIGHT / GREEN LIGHT',
      icon: '\u{1F534}',
      description: 'Hold to run on green, stop fast on red, and reach the digital finish line without getting caught.',
      maxXp: 10,
      globalName: 'ICT8RedLightGreenLight',
      script: 'games/red-light-green-light/red-light-green-light.js',
      style: 'games/red-light-green-light/red-light-green-light.css',
      bestText(record = {}) {
        const distance = Math.max(0, Number(record.bestDistance || record.bestScore || 0));
        const timeMs = Math.max(0, Number(record.fastestFinishMs || 0));
        return timeMs > 0 ? `\u{1F3C6} Finish: ${(timeMs / 1000).toFixed(1)}s` : `\u{1F3C6} Best Run: ${Math.floor(distance)}`;
      }
    },
    {
      id: 'code-maze',
      stateKey: 'codeMaze',
      name: 'CODE MAZE',
      icon: '🧩',
      description: 'Guide a coding cursor through generated mazes, collect the key, and reach the exit before time runs out.',
      maxXp: 10,
      globalName: 'ICT8CodeMaze',
      script: 'games/code-maze/code-maze.js',
      style: 'games/code-maze/code-maze.css',
      bestText(record = {}) {
        const level = Math.max(0, Number(record.bestLevel || record.bestScore || 0));
        const timeMs = Math.max(0, Number(record.fastestLevelMs || 0));
        return timeMs > 0 ? `🏆 Best Level: ${level} · ${(timeMs / 1000).toFixed(1)}s` : `🏆 Best Level: ${level}`;
      }
    },
    {
      id: 'pattern-lock',
      stateKey: 'patternLock',
      name: 'PATTERN LOCK',
      icon: '🔐',
      description: 'Watch the code pattern, remember the sequence, and repeat it as the chain gets longer.',
      maxXp: 10,
      globalName: 'ICT8PatternLock',
      script: 'games/pattern-lock/pattern-lock.js',
      style: 'games/pattern-lock/pattern-lock.css',
      bestText(record = {}) {
        const level = Math.max(0, Number(record.bestLevel || record.bestScore || 0));
        return `🏆 Best Level: ${level}`;
      }
    }
  ]);

  const state = {
    built: false,
    open: false,
    gameOpen: false,
    overlay: null,
    modal: null,
    closeBtn: null,
    dailyValue: null,
    dailyBar: null,
    dailyFoot: null,
    limitMessage: null,
    loginMessage: null,
    gameList: null,
    launcher: null,
    bridge: null,
    unsubscribe: null,
    previousFocus: null,
    activeGameId: '',
    activeGameApi: null,
    loadingGameId: '',
    assetPromises: new Map()
  };

  function getBridge() {
    return window.ICT8_XP_MINIGAMES_BRIDGE || null;
  }

  function gameById(id) {
    return GAME_REGISTRY.find(game => game.id === id) || null;
  }

  function build() {
    if (state.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'xpMiniGamesOverlay';
    overlay.className = 'xp-games-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'xpMiniGamesTitle');
    overlay.innerHTML = `
      <section class="xp-games-modal">
        <header class="xp-games-modal-head">
          <div class="xp-games-modal-titleline">
            <span class="xp-games-modal-icon" aria-hidden="true">🎮</span>
            <div>
              <small>ICT 8 Connect</small>
              <h2 id="xpMiniGamesTitle">XP MINI-GAMES</h2>
            </div>
          </div>
          <button class="xp-games-close" type="button" data-xp-games-close aria-label="Close XP Mini-Games">×</button>
        </header>

        <section class="xp-games-summary">
          <h3>WANT SOME EXTRA XP?</h3>
          <p>Play mini-games, beat your records, and earn a little bonus XP. Pick a game below.</p>
          <div class="xp-games-daily">
            <div class="xp-games-daily-head">
              <span>TODAY'S GAME XP</span>
              <strong data-xp-games-daily-value>0 / 50 XP</strong>
            </div>
            <div class="xp-games-daily-track" aria-hidden="true"><i data-xp-games-daily-bar></i></div>
            <div class="xp-games-daily-foot">
              <span data-xp-games-daily-foot>Small bonus only — learning XP still matters most.</span>
              <b data-xp-games-cap-label>50 XP/day</b>
            </div>
          </div>
        </section>

        <section class="xp-games-game-list" aria-label="Available mini-games">
          <div class="xp-games-limit-message" data-xp-games-limit>
            DAILY XP LIMIT REACHED — you can still play every mini-game and beat your records, but no more bonus XP can be earned today.
          </div>
          <div class="xp-games-login-message" data-xp-games-login>
            Log in as a student to earn account XP. Mini-games remain playable in practice mode.
          </div>
          <div data-xp-games-cards></div>
        </section>
      </section>`;
    document.body.appendChild(overlay);

    state.overlay = overlay;
    state.modal = overlay.querySelector('.xp-games-modal');
    state.closeBtn = overlay.querySelector('[data-xp-games-close]');
    state.dailyValue = overlay.querySelector('[data-xp-games-daily-value]');
    state.dailyBar = overlay.querySelector('[data-xp-games-daily-bar]');
    state.dailyFoot = overlay.querySelector('[data-xp-games-daily-foot]');
    state.limitMessage = overlay.querySelector('[data-xp-games-limit]');
    state.loginMessage = overlay.querySelector('[data-xp-games-login]');
    state.gameList = overlay.querySelector('[data-xp-games-cards]');

    state.closeBtn.addEventListener('click', closeHub);
    state.gameList.addEventListener('click', event => {
      const button = event.target.closest('[data-xp-game-play]');
      if (!button || button.disabled) return;
      const gameId = String(button.dataset.xpGamePlay || '');
      launchGame(gameId, button);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Tab' && state.open && !state.gameOpen && state.modal) {
        const focusable = Array.from(state.modal.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
          .filter(node => !node.hidden && node.getClientRects().length);
        if (focusable.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
        return;
      }
      if (event.key !== 'Escape') return;
      if (state.gameOpen) {
        event.preventDefault();
        try { state.activeGameApi?.close?.(); } catch (_) {}
        showHubAfterGame();
        return;
      }
      if (state.open) {
        event.preventDefault();
        closeHub();
      }
    });

    state.built = true;
  }

  function gameCardsHtml(snapshot) {
    const cap = Math.max(1, Number(snapshot?.dailyCap || 50));
    const records = snapshot?.gameRecords || {};
    return GAME_REGISTRY.map(game => {
      const record = records[game.stateKey] || {};
      const xpCopy = snapshot?.capReached
        ? 'XP limit reached · play for records'
        : `Up to +${game.maxXp} XP/run · ${cap} XP/day shared cap`;
      return `
        <article class="xp-games-card" data-xp-game-card="${game.id}">
          <div class="xp-games-card-art" aria-hidden="true">${game.icon}</div>
          <div class="xp-games-card-copy">
            <h4>${game.name}</h4>
            <p>${game.description}</p>
          </div>
          <div class="xp-games-card-meta">
            <span class="xp-games-best">${game.bestText(record)}</span>
            <span class="xp-games-xp-note">${xpCopy}</span>
          </div>
          <button class="xp-games-play" type="button" data-xp-game-play="${game.id}">PLAY</button>
        </article>`;
    }).join('');
  }

  function render(snapshot = null) {
    if (!state.built) return;
    const next = snapshot || state.bridge?.getSnapshot?.() || {
      dailyCap: 50,
      todayXp: 0,
      capReached: false,
      loggedIn: false,
      gameRecords: {}
    };
    const cap = Math.max(1, Number(next.dailyCap || 50));
    const today = Math.max(0, Math.min(cap, Number(next.todayXp || 0)));
    const percent = Math.max(0, Math.min(100, today / cap * 100));
    state.dailyValue.textContent = `${today} / ${cap} XP`;
    state.dailyBar.style.width = `${percent}%`;
    state.dailyFoot.textContent = next.capReached
      ? 'Full for today — all games stay open for high scores.'
      : `${cap - today} bonus XP still available today.`;
    const capLabel = state.overlay.querySelector('[data-xp-games-cap-label]');
    if (capLabel) capLabel.textContent = `${cap} XP/day`;
    state.limitMessage.classList.toggle('show', Boolean(next.capReached));
    state.loginMessage.classList.toggle('show', !next.loggedIn);
    state.gameList.innerHTML = gameCardsHtml(next);
  }

  function lockAppBehindHub() {
    document.body.classList.add('xp-games-modal-open');
  }

  function unlockAppBehindHub() {
    document.body.classList.remove('xp-games-modal-open');
  }

  function openHub() {
    build();
    state.bridge = getBridge();
    if (!state.bridge) {
      console.warn('XP Mini-Games bridge is unavailable. The rest of ICT 8 Connect remains active.');
      return;
    }
    state.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    state.open = true;
    state.gameOpen = false;
    state.activeGameId = '';
    state.activeGameApi = null;
    lockAppBehindHub();
    render();
    state.overlay.hidden = false;
    state.closeBtn.focus({ preventScroll: true });
  }

  function closeHub() {
    if (!state.open && !state.gameOpen) return;
    const api = state.activeGameApi;
    state.gameOpen = false;
    state.open = false;
    state.activeGameId = '';
    state.activeGameApi = null;
    try {
      if (api?.isOpen?.()) api.close?.();
    } catch (_) {}
    if (state.overlay) state.overlay.hidden = true;
    unlockAppBehindHub();
    const focusTarget = state.previousFocus;
    state.previousFocus = null;
    if (focusTarget && document.contains(focusTarget)) {
      window.requestAnimationFrame(() => {
        try { focusTarget.focus({ preventScroll: true }); } catch (_) {}
      });
    }
  }

  function showHubAfterGame() {
    state.open = true;
    state.gameOpen = false;
    state.activeGameId = '';
    state.activeGameApi = null;
    render();
    state.overlay.hidden = false;
    window.requestAnimationFrame(() => {
      try { state.closeBtn.focus({ preventScroll: true }); } catch (_) {}
    });
  }

  function ensureStylesheet(game) {
    if (!game.style) return;
    if (document.querySelector(`link[data-xp-game-style="${game.id}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${game.style}?v=20260909-v440-maze-pattern`;
    link.dataset.xpGameStyle = game.id;
    document.head.appendChild(link);
  }

  function ensureGameModule(game) {
    const current = window[game.globalName];
    if (current?.open) return Promise.resolve(current);
    if (state.assetPromises.has(game.id)) return state.assetPromises.get(game.id);
    ensureStylesheet(game);
    const promise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-xp-game-script="${game.id}"]`);
      // If a previous attempt loaded a broken/stale module without registering
      // its API, remove that script so PLAY can retry cleanly instead of waiting
      // forever for a load event that already fired.
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.src = `${game.script}?v=20260909-v440-maze-pattern`;
      script.defer = true;
      script.dataset.xpGameScript = game.id;
      script.addEventListener('load', () => {
        const api = window[game.globalName];
        if (api?.open) resolve(api);
        else reject(new Error(`${game.name} did not initialize.`));
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`${game.name} failed to load.`)), { once: true });
      document.body.appendChild(script);
    }).finally(() => state.assetPromises.delete(game.id));
    state.assetPromises.set(game.id, promise);
    return promise;
  }

  async function launchGame(gameId, button = null) {
    const game = gameById(gameId);
    if (!game || state.loadingGameId) return;
    state.loadingGameId = game.id;
    if (button) {
      button.disabled = true;
      button.textContent = 'LOADING…';
    }
    try {
      const api = await ensureGameModule(game);
      if (!api?.open) throw new Error(`${game.name} is unavailable.`);
      state.overlay.hidden = true;
      state.open = false;
      state.gameOpen = true;
      state.activeGameId = game.id;
      state.activeGameApi = api;
      api.open({
        bridge: state.bridge,
        onBack: showHubAfterGame,
        onClose: closeHub,
        onReward: result => {
          render();
          const amount = Math.max(0, Number(result?.awardedXp || 0));
          if (amount > 0) animateXpAward(amount);
        }
      });
    } catch (error) {
      console.warn(`${game.name} could not initialize.`, error);
      state.open = true;
      state.gameOpen = false;
      state.activeGameId = '';
      state.activeGameApi = null;
      state.overlay.hidden = false;
      render();
    } finally {
      state.loadingGameId = '';
      if (button && document.contains(button)) {
        button.disabled = false;
        button.textContent = 'PLAY';
      }
    }
  }

  function animateXpAward(amount) {
    const launcher = state.launcher || document.getElementById('codeExplorerXpBadge');
    if (!launcher || !amount) return;
    const rect = launcher.getBoundingClientRect();
    const floater = document.createElement('span');
    floater.className = 'xp-games-xp-float';
    floater.textContent = `⭐ +${amount} XP`;
    floater.style.left = `${rect.left + rect.width / 2}px`;
    floater.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(floater);
    window.setTimeout(() => floater.remove(), 950);
  }

  function bindLauncher() {
    const launcher = document.getElementById('codeExplorerXpBadge');
    if (!launcher || launcher.dataset.xpMiniGamesBound === 'true') return false;
    launcher.dataset.xpMiniGamesBound = 'true';
    launcher.classList.add('xp-games-launcher');
    launcher.setAttribute('role', 'button');
    launcher.setAttribute('tabindex', '0');
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.setAttribute('aria-controls', 'xpMiniGamesOverlay');
    launcher.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openHub();
    });
    launcher.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openHub();
    });
    state.launcher = launcher;
    return true;
  }

  function init() {
    build();
    state.bridge = getBridge();
    bindLauncher();
    if (state.bridge?.subscribe) {
      state.unsubscribe = state.bridge.subscribe(snapshot => {
        if (state.open) render(snapshot);
      });
    }

    if (!state.launcher) {
      const observer = new MutationObserver(() => {
        if (bindLauncher()) observer.disconnect();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      window.setTimeout(() => observer.disconnect(), 10000);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.ICT8XpMiniGames = Object.freeze({
    open: openHub,
    close: closeHub,
    render: () => render(),
    games: GAME_REGISTRY.map(game => ({ id: game.id, name: game.name }))
  });
})();
