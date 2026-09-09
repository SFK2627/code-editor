(() => {
  'use strict';

  const GAME_REGISTRY = Object.freeze([
    {
      id: 'code-fly',
      name: 'CODE FLY',
      icon: '🖥️',
      description: 'Fly through digital server towers, beat your high score, and earn a little bonus XP.',
      bestKey: 'codeFly'
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
    previousFocus: null
  };

  function getBridge() {
    return window.ICT8_XP_MINIGAMES_BRIDGE || null;
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
          <p>Play mini-games, beat your high score, and earn a little bonus XP. More games can be added here later.</p>
          <div class="xp-games-daily">
            <div class="xp-games-daily-head">
              <span>TODAY'S GAME XP</span>
              <strong data-xp-games-daily-value>0 / 50 XP</strong>
            </div>
            <div class="xp-games-daily-track" aria-hidden="true"><i data-xp-games-daily-bar></i></div>
            <div class="xp-games-daily-foot">
              <span data-xp-games-daily-foot>Small bonus only — learning XP still matters most.</span>
              <b>50 XP/day</b>
            </div>
          </div>
        </section>

        <section class="xp-games-game-list" aria-label="Available mini-games">
          <div class="xp-games-limit-message" data-xp-games-limit>
            DAILY XP LIMIT REACHED — you can still play and beat your high score, but no more bonus XP can be earned today.
          </div>
          <div class="xp-games-login-message" data-xp-games-login>
            Log in as a student to earn account XP. You can still play CODE FLY in practice mode.
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
      if (!button) return;
      const gameId = String(button.dataset.xpGamePlay || '');
      launchGame(gameId);
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
        try { window.ICT8CodeFly?.close?.(); } catch (_) {}
        state.gameOpen = false;
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
    return GAME_REGISTRY.map(game => {
      const best = Math.max(0, Number(snapshot?.bestScores?.[game.bestKey] || 0));
      const xpCopy = snapshot?.capReached
        ? 'XP limit reached · play for high score'
        : 'Up to +15 XP/run · 50 XP/day cap';
      return `
        <article class="xp-games-card" data-xp-game-card="${game.id}">
          <div class="xp-games-card-art" aria-hidden="true">${game.icon}</div>
          <div class="xp-games-card-copy">
            <h4>${game.name}</h4>
            <p>${game.description}</p>
          </div>
          <div class="xp-games-card-meta">
            <span class="xp-games-best">🏆 Best Score: ${best}</span>
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
      bestScores: { codeFly: 0 }
    };
    const cap = Math.max(1, Number(next.dailyCap || 50));
    const today = Math.max(0, Math.min(cap, Number(next.todayXp || 0)));
    const percent = Math.max(0, Math.min(100, today / cap * 100));
    state.dailyValue.textContent = `${today} / ${cap} XP`;
    state.dailyBar.style.width = `${percent}%`;
    state.dailyFoot.textContent = next.capReached
      ? 'Full for today — gameplay stays open for high scores.'
      : `${cap - today} bonus XP still available today.`;
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
    lockAppBehindHub();
    render();
    state.overlay.hidden = false;
    state.closeBtn.focus({ preventScroll: true });
  }

  function closeHub() {
    if (!state.open && !state.gameOpen) return;
    if (state.gameOpen) {
      try { window.ICT8CodeFly?.close?.(); } catch (_) {}
    }
    state.gameOpen = false;
    state.open = false;
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
    render();
    state.overlay.hidden = false;
    window.requestAnimationFrame(() => {
      try { state.closeBtn.focus({ preventScroll: true }); } catch (_) {}
    });
  }

  function launchGame(gameId) {
    if (gameId !== 'code-fly') return;
    if (!window.ICT8CodeFly?.open) {
      console.warn('CODE FLY could not initialize. The Mini-Games Hub will stay open.');
      return;
    }
    state.overlay.hidden = true;
    state.open = false;
    state.gameOpen = true;
    window.ICT8CodeFly.open({
      bridge: state.bridge,
      onBack: showHubAfterGame,
      onClose: closeHub,
      onReward: result => {
        render();
        const amount = Math.max(0, Number(result?.awardedXp || 0));
        if (amount > 0) animateXpAward(amount);
      }
    });
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

    // Defensive late binding for deployments where a cached main script builds
    // the Code Explorer screen a moment after this module is parsed.
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
