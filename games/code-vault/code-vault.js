(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'code-vault';
  const GLOBAL_NAME = 'ICT8CodeVault';
  const CASE_VALUES = Object.freeze([
    10, 25, 50, 100, 250, 500, 1000, 2500,
    5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000
  ]);
  const OPEN_COUNTS = Object.freeze([4, 3, 2, 2, 1, 1, 1]);
  const OFFER_FACTORS = Object.freeze([0.55, 0.63, 0.70, 0.78, 0.85, 0.91, 0.96]);

  const runtime = {
    built: false,
    open: false,
    bridge: null,
    onBack: null,
    onClose: null,
    onReward: null,
    overlay: null,
    shell: null,
    casesEl: null,
    valuesEl: null,
    statusEl: null,
    roundEl: null,
    openLeftEl: null,
    personalEl: null,
    stageBadge: null,
    offerPanel: null,
    offerValueEl: null,
    offerRoundEl: null,
    offerCopyEl: null,
    finalPanel: null,
    resultPanel: null,
    resultTitle: null,
    resultPayout: null,
    resultCase: null,
    resultRound: null,
    resultScore: null,
    resultXp: null,
    resultNote: null,
    soundBtn: null,
    revealToast: null,
    revealToastTimer: 0,
    offerAnimFrame: 0,
    round: null,
    state: 'closed',
    caseValues: [],
    personalCase: -1,
    openedCases: [],
    roundIndex: 0,
    openedThisRound: 0,
    currentOffer: 0,
    currentExpected: 0,
    acceptedRound: 0,
    acceptedOffer: 0,
    finalChoice: '',
    payout: 0,
    startedAt: 0,
    interactionLocked: false,
    rewardSubmitting: false,
    soundEnabled: true,
    audioContext: null,
    lastRewardDay: '',
    lastRewardXp: 0,
    bestScore: 0,
    bestRound: 0
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.className = 'xp-games-game-overlay code-vault-overlay';
    overlay.id = 'codeVaultOverlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Vault');
    overlay.innerHTML = `
      <section class="code-vault-shell">
        <header class="code-vault-topbar">
          <button type="button" class="code-vault-icon-btn" data-cv-back aria-label="Back to Mini-Games">←</button>
          <div class="code-vault-brand">
            <strong>💼 CODE VAULT</strong>
            <small>Take the Offer?</small>
          </div>
          <div class="code-vault-top-stat"><span>ROUND</span><strong data-cv-round>—</strong></div>
          <button type="button" class="code-vault-icon-btn" data-cv-sound aria-label="Toggle sound">🔊</button>
          <button type="button" class="code-vault-icon-btn" data-cv-close aria-label="Close">×</button>
        </header>

        <div class="code-vault-game">
          <div class="code-vault-stage-badge" data-cv-stage-badge>CHOOSE YOUR VAULT</div>
          <div class="code-vault-layout">
            <aside class="code-vault-values code-vault-values-low" data-cv-values-low aria-label="Low values"></aside>
            <main class="code-vault-center">
              <section class="code-vault-case-grid" data-cv-cases aria-label="Vault cases"></section>
              <div class="code-vault-personal-card">
                <span>YOUR VAULT</span>
                <strong data-cv-personal>Not selected</strong>
                <small>Your vault stays sealed until you take a deal or reach the final choice.</small>
              </div>
            </main>
            <aside class="code-vault-values code-vault-values-high" data-cv-values-high aria-label="High values"></aside>
          </div>

          <footer class="code-vault-hud">
            <div><span>OPEN THIS ROUND</span><strong data-cv-open-left>—</strong></div>
            <p data-cv-status>Pick one vault to keep. Then open the others.</p>
          </footer>
        </div>

        <div class="code-vault-panel" data-cv-ready>
          <div class="code-vault-modal code-vault-intro">
            <div class="code-vault-logo">💼</div>
            <p class="code-vault-kicker">16 VAULTS · 7 BANKER OFFERS</p>
            <h2>CODE VAULT</h2>
            <p>Choose one sealed DATA VAULT. Open the others, remove values, and decide when the SYSTEM BANKER makes an offer.</p>
            <div class="code-vault-rule-row">
              <div><small>TOP VAULT</small><strong>1,000,000</strong></div>
              <div><small>DECISION</small><strong>DEAL / NO DEAL</strong></div>
              <div><small>XP</small><strong>Late-game only</strong></div>
            </div>
            <div class="code-vault-actions"><button type="button" class="code-vault-primary" data-cv-play>OPEN THE VAULT ROOM</button></div>
          </div>
        </div>

        <div class="code-vault-panel code-vault-offer-panel" data-cv-offer hidden>
          <div class="code-vault-modal">
            <div class="code-vault-banker-orb"><span>SYS</span></div>
            <p class="code-vault-kicker" data-cv-offer-round>SYSTEM BANKER · ROUND 1</p>
            <h2>THE OFFER</h2>
            <div class="code-vault-offer-value" data-cv-offer-value>0 BYTE</div>
            <p data-cv-offer-copy>The banker wants your vault. Lock the offer or keep playing?</p>
            <div class="code-vault-offer-actions">
              <button type="button" class="code-vault-deal" data-cv-deal><span>✓</span><strong>DEAL</strong></button>
              <button type="button" class="code-vault-no-deal" data-cv-no-deal><span>×</span><strong>NO DEAL</strong></button>
            </div>
            <small class="code-vault-offer-note">XP is based on how deep you reach, not on lucky vault value.</small>
          </div>
        </div>

        <div class="code-vault-panel" data-cv-final hidden>
          <div class="code-vault-modal">
            <div class="code-vault-logo code-vault-final-logo">🔐</div>
            <p class="code-vault-kicker">FINAL TWO VAULTS</p>
            <h2>KEEP OR SWAP?</h2>
            <p>Only your sealed vault and one other vault remain. Your final choice does not change XP — this part is pure luck.</p>
            <div class="code-vault-final-cases" data-cv-final-cases></div>
            <div class="code-vault-actions">
              <button type="button" class="code-vault-primary" data-cv-keep>KEEP MY VAULT</button>
              <button type="button" class="code-vault-secondary" data-cv-swap>SWAP VAULTS</button>
            </div>
          </div>
        </div>

        <div class="code-vault-panel" data-cv-result hidden>
          <div class="code-vault-modal code-vault-result-modal">
            <div class="code-vault-logo code-vault-result-logo">🏦</div>
            <p class="code-vault-kicker">RUN COMPLETE</p>
            <h2 data-cv-result-title>DEAL LOCKED</h2>
            <div class="code-vault-payout" data-cv-result-payout>0 BYTE</div>
            <p data-cv-result-case>Your vault contained 0 BYTE.</p>
            <div class="code-vault-result-grid">
              <div><small>Round Reached</small><strong data-cv-result-round>R1</strong></div>
              <div><small>Decision Score</small><strong data-cv-result-score>0</strong></div>
              <div><small>XP Earned</small><strong class="code-vault-xp" data-cv-result-xp>+0</strong></div>
            </div>
            <p class="code-vault-reward-note" data-cv-result-note>No XP for early deals. Reach the late rounds.</p>
            <div class="code-vault-actions">
              <button type="button" class="code-vault-primary" data-cv-again>PLAY AGAIN</button>
              <button type="button" class="code-vault-secondary" data-cv-hub>MINI-GAMES</button>
            </div>
          </div>
        </div>

        <div class="code-vault-reveal-toast" data-cv-reveal-toast hidden aria-live="polite">
          <span class="code-vault-reveal-case">VAULT 00</span>
          <small>REVEALED VALUE</small>
          <strong>0 BYTE</strong>
          <em>REMOVED FROM THE BOARD</em>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-vault-shell');
    runtime.casesEl = overlay.querySelector('[data-cv-cases]');
    runtime.valuesLowEl = overlay.querySelector('[data-cv-values-low]');
    runtime.valuesHighEl = overlay.querySelector('[data-cv-values-high]');
    runtime.statusEl = overlay.querySelector('[data-cv-status]');
    runtime.roundEl = overlay.querySelector('[data-cv-round]');
    runtime.openLeftEl = overlay.querySelector('[data-cv-open-left]');
    runtime.personalEl = overlay.querySelector('[data-cv-personal]');
    runtime.stageBadge = overlay.querySelector('[data-cv-stage-badge]');
    runtime.readyPanel = overlay.querySelector('[data-cv-ready]');
    runtime.offerPanel = overlay.querySelector('[data-cv-offer]');
    runtime.offerValueEl = overlay.querySelector('[data-cv-offer-value]');
    runtime.offerRoundEl = overlay.querySelector('[data-cv-offer-round]');
    runtime.offerCopyEl = overlay.querySelector('[data-cv-offer-copy]');
    runtime.finalPanel = overlay.querySelector('[data-cv-final]');
    runtime.finalCasesEl = overlay.querySelector('[data-cv-final-cases]');
    runtime.resultPanel = overlay.querySelector('[data-cv-result]');
    runtime.resultTitle = overlay.querySelector('[data-cv-result-title]');
    runtime.resultPayout = overlay.querySelector('[data-cv-result-payout]');
    runtime.resultCase = overlay.querySelector('[data-cv-result-case]');
    runtime.resultRound = overlay.querySelector('[data-cv-result-round]');
    runtime.resultScore = overlay.querySelector('[data-cv-result-score]');
    runtime.resultXp = overlay.querySelector('[data-cv-result-xp]');
    runtime.resultNote = overlay.querySelector('[data-cv-result-note]');
    runtime.soundBtn = overlay.querySelector('[data-cv-sound]');
    runtime.revealToast = overlay.querySelector('[data-cv-reveal-toast]');

    overlay.querySelector('[data-cv-play]').addEventListener('click', startGame);
    overlay.querySelector('[data-cv-deal]').addEventListener('click', takeDeal);
    overlay.querySelector('[data-cv-no-deal]').addEventListener('click', rejectDeal);
    overlay.querySelector('[data-cv-keep]').addEventListener('click', () => finishFinal('keep'));
    overlay.querySelector('[data-cv-swap]').addEventListener('click', () => finishFinal('swap'));
    overlay.querySelector('[data-cv-again]').addEventListener('click', startGame);
    overlay.querySelector('[data-cv-hub]').addEventListener('click', backToHub);
    overlay.querySelector('[data-cv-back]').addEventListener('click', backToHub);
    overlay.querySelector('[data-cv-close]').addEventListener('click', close);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.casesEl.addEventListener('click', event => {
      const button = event.target.closest('[data-case-index]');
      if (!button) return;
      handleCase(Number(button.dataset.caseIndex));
    });

    runtime.built = true;
  }

  function formatByte(value) {
    const n = Math.max(0, Math.floor(Number(value || 0)));
    return `${n.toLocaleString('en-US')} BYTE`;
  }

  function hashString(value) {
    const text = String(value || 'code-vault');
    let hash = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = (((hash * 31) >>> 0) + text.charCodeAt(i)) >>> 0;
    }
    return hash >>> 0;
  }

  function seededRandom(seedText) {
    let state = hashString(seedText) || 1;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function shuffledValues(roundId) {
    const values = CASE_VALUES.slice();
    const rand = seededRandom(`${roundId}:cases`);
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  }

  function roundBankerAmount(value) {
    const amount = Math.max(0, Number(value || 0));
    let step = 5;
    if (amount >= 100000) step = 5000;
    else if (amount >= 10000) step = 500;
    else if (amount >= 1000) step = 50;
    else if (amount >= 100) step = 10;
    return Math.max(5, Math.round(amount / step) * step);
  }

  function bankerOffer(roundNumber, remainingValues, roundId) {
    const safeRound = Math.max(1, Math.min(7, Math.floor(Number(roundNumber || 1))));
    const rows = Array.isArray(remainingValues) && remainingValues.length ? remainingValues : [0];
    const expected = rows.reduce((sum, value) => sum + Number(value || 0), 0) / rows.length;
    const jitterRaw = hashString(`${roundId}:offer:${safeRound}`) % 61; // 0..60
    const jitter = (jitterRaw - 30) / 1000; // -3.0% .. +3.0%
    const ratio = Math.max(.48, Math.min(.99, OFFER_FACTORS[safeRound - 1] + jitter));
    return { offer: roundBankerAmount(expected * ratio), expected, ratio };
  }

  function scoreDetails(metrics = {}) {
    const acceptedRound = Math.max(0, Math.min(7, Math.floor(Number(metrics.acceptedRound || 0))));
    const finalChoice = String(metrics.finalChoice || '');
    const roundReached = acceptedRound || 7;
    const activeTimeMs = Math.max(0, Math.floor(Number(metrics.activeTimeMs || metrics.durationMs || 0)));
    const minTimeMs = roundReached >= 7 ? 10000 : (roundReached === 6 ? 8500 : (roundReached === 5 ? 7000 : Math.max(1800, roundReached * 1200)));
    const completed = metrics.completedRun === true && (acceptedRound > 0 || finalChoice === 'keep' || finalChoice === 'swap') && activeTimeMs >= minTimeMs;
    if (!completed) return { score: 0, tier: 0, roundReached };
    let score = [0, 270, 350, 440, 560, 690, 820, 930][roundReached] || 0;
    if (!acceptedRound) score = 1000;
    else {
      const offerRatio = Math.max(0, Math.min(1.1, Number(metrics.offerRatio || 0)));
      score += Math.round(Math.max(0, Math.min(1, (offerRatio - .5) / .5)) * 60);
      score = Math.min(990, score);
    }
    let tier = 0;
    if (roundReached >= 5) tier = 1;
    if (roundReached >= 7) tier = 2;
    return { score, tier, roundReached };
  }

  function clearRevealToast() {
    if (runtime.revealToastTimer) {
      window.clearTimeout(runtime.revealToastTimer);
      runtime.revealToastTimer = 0;
    }
    if (runtime.revealToast) {
      runtime.revealToast.hidden = true;
      runtime.revealToast.classList.remove('is-high', 'is-top', 'is-showing');
    }
  }

  function showRevealToast(index, value) {
    if (!runtime.revealToast) return;
    clearRevealToast();
    const n = Math.max(0, Math.floor(Number(value || 0)));
    runtime.revealToast.querySelector('.code-vault-reveal-case').textContent = `VAULT ${String(index + 1).padStart(2, '0')}`;
    runtime.revealToast.querySelector('strong').textContent = formatByte(n);
    runtime.revealToast.classList.toggle('is-high', n >= 100000);
    runtime.revealToast.classList.toggle('is-top', n >= 500000);
    runtime.revealToast.hidden = false;
    // Force a fresh animation even if two reveals happen quickly.
    void runtime.revealToast.offsetWidth;
    runtime.revealToast.classList.add('is-showing');
    runtime.revealToastTimer = window.setTimeout(clearRevealToast, n >= 100000 ? 1280 : 1050);
  }

  function pulseEliminatedValue(value) {
    const chip = runtime.overlay?.querySelector(`.code-vault-value-chip[data-value="${Number(value)}"]`);
    if (!chip) return;
    chip.classList.add('just-eliminated');
    window.setTimeout(() => chip.classList.remove('just-eliminated'), 620);
  }

  function animateOfferValue(target) {
    if (!runtime.offerValueEl) return;
    if (runtime.offerAnimFrame) cancelAnimationFrame(runtime.offerAnimFrame);
    const end = Math.max(0, Math.floor(Number(target || 0)));
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) {
      runtime.offerValueEl.textContent = formatByte(end);
      return;
    }
    const duration = 720;
    const started = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      runtime.offerValueEl.textContent = formatByte(Math.round(end * eased));
      if (t < 1) runtime.offerAnimFrame = requestAnimationFrame(tick);
      else { runtime.offerAnimFrame = 0; runtime.offerValueEl.textContent = formatByte(end); }
    };
    runtime.offerAnimFrame = requestAnimationFrame(tick);
  }

  function animatePanelIn(panel) {
    if (!panel) return;
    panel.classList.remove('is-entering');
    void panel.offsetWidth;
    panel.classList.add('is-entering');
    window.setTimeout(() => panel.classList.remove('is-entering'), 520);
  }

  function renderValues() {
    const openedSet = new Set(runtime.openedCases.map(index => runtime.caseValues[index]));
    const low = CASE_VALUES.slice(0, 8);
    const high = CASE_VALUES.slice(8);
    const chip = value => `<div class="code-vault-value-chip${openedSet.has(value) ? ' eliminated' : ''}" data-value="${value}"><span>${formatCompact(value)}</span></div>`;
    runtime.valuesLowEl.innerHTML = `<h3>DATA VALUES</h3>${low.map(chip).join('')}`;
    runtime.valuesHighEl.innerHTML = `<h3>HIGH VAULTS</h3>${high.map(chip).join('')}`;
  }

  function formatCompact(value) {
    const n = Number(value || 0);
    if (n >= 1000000) return '1M';
    if (n >= 1000) return `${Number.isInteger(n / 1000) ? n / 1000 : (n / 1000).toFixed(1)}K`;
    return String(n);
  }

  function renderCases() {
    const opened = new Set(runtime.openedCases);
    runtime.casesEl.innerHTML = runtime.caseValues.map((value, index) => {
      const isOwn = index === runtime.personalCase;
      const isOpen = opened.has(index);
      const classes = ['code-vault-case'];
      if (isOwn) classes.push('is-yours');
      if (isOpen) classes.push('is-open');
      const disabled = runtime.interactionLocked || isOwn || isOpen || (runtime.state !== 'choose' && runtime.state !== 'opening');
      const dealStyle = runtime.state === 'choose' ? ` style="--cv-case-i:${index}"` : '';
      return `
        <button type="button" class="${classes.join(' ')}" data-case-index="${index}"${dealStyle} ${disabled ? 'disabled' : ''} aria-label="Vault ${index + 1}${isOwn ? ', your vault' : ''}">
          <span class="code-vault-case-inner">
            <span class="code-vault-case-front">
              <i class="code-vault-lock"></i>
              <span class="code-vault-front-label">VAULT</span>
              <b>${String(index + 1).padStart(2, '0')}</b>
              <small>${isOwn ? 'YOUR SEALED VAULT' : 'TAP TO OPEN'}</small>
            </span>
            <span class="code-vault-case-back">
              <span class="code-vault-back-case">VAULT ${String(index + 1).padStart(2, '0')}</span>
              <small>REVEALED VALUE</small>
              <b>${Number(value).toLocaleString('en-US')}</b>
              <em>BYTE</em>
            </span>
          </span>
        </button>`;
    }).join('');
  }

  function renderHud() {
    if (runtime.state === 'choose') {
      runtime.roundEl.textContent = '—';
      runtime.openLeftEl.textContent = 'PICK 1';
      runtime.stageBadge.textContent = 'CHOOSE YOUR VAULT';
      runtime.personalEl.textContent = 'Not selected';
      setStatus('Choose one sealed vault to keep.', 'gold');
      return;
    }
    const roundNumber = Math.min(7, runtime.roundIndex + 1);
    const count = OPEN_COUNTS[runtime.roundIndex] || 0;
    runtime.roundEl.textContent = `R${roundNumber}/7`;
    runtime.openLeftEl.textContent = Math.max(0, count - runtime.openedThisRound);
    runtime.personalEl.textContent = runtime.personalCase >= 0 ? `VAULT ${String(runtime.personalCase + 1).padStart(2, '0')}` : 'Not selected';
    runtime.stageBadge.textContent = runtime.state === 'offer' ? 'BANKER OFFER' : `ROUND ${roundNumber}`;
  }

  function setStatus(message, kind = '') {
    runtime.statusEl.textContent = message;
    runtime.statusEl.dataset.kind = kind;
  }

  function startGame() {
    cancelCurrentRound();
    hidePanels();
    runtime.state = 'choose';
    runtime.caseValues = [];
    runtime.personalCase = -1;
    runtime.openedCases = [];
    runtime.roundIndex = 0;
    runtime.openedThisRound = 0;
    runtime.currentOffer = 0;
    runtime.currentExpected = 0;
    runtime.acceptedRound = 0;
    runtime.acceptedOffer = 0;
    runtime.finalChoice = '';
    runtime.payout = 0;
    runtime.startedAt = Date.now();
    runtime.interactionLocked = false;
    runtime.rewardSubmitting = false;
    clearRevealToast();
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    const roundId = String(runtime.round?.sessionId || `code-vault-local-${Date.now()}`);
    runtime.caseValues = shuffledValues(roundId);
    renderValues();
    renderCases();
    runtime.casesEl.classList.remove('is-dealing');
    void runtime.casesEl.offsetWidth;
    runtime.casesEl.classList.add('is-dealing');
    window.setTimeout(() => runtime.casesEl?.classList.remove('is-dealing'), 900);
    renderHud();
    playTone(320, .04, .04);
  }

  function handleCase(index) {
    if (!Number.isInteger(index) || index < 0 || index >= 16 || runtime.interactionLocked) return;
    if (runtime.state === 'choose') {
      runtime.personalCase = index;
      runtime.state = 'opening';
      runtime.roundIndex = 0;
      runtime.openedThisRound = 0;
      renderCases();
      renderHud();
      setStatus(`VAULT ${String(index + 1).padStart(2, '0')} locked as YOUR VAULT. Open ${OPEN_COUNTS[0]} other vaults.`, 'good');
      runtime.stageBadge.classList.remove('is-pulse');
      void runtime.stageBadge.offsetWidth;
      runtime.stageBadge.classList.add('is-pulse');
      window.setTimeout(() => runtime.stageBadge?.classList.remove('is-pulse'), 620);
      playTone(520, .05, .05);
      return;
    }
    if (runtime.state !== 'opening' || index === runtime.personalCase || runtime.openedCases.includes(index)) return;
    openCase(index);
  }

  function openCase(index) {
    runtime.interactionLocked = true;
    const button = runtime.casesEl.querySelector(`[data-case-index="${index}"]`);
    if (!button) { runtime.interactionLocked = false; return; }
    button.disabled = true;
    button.classList.add('is-opening');
    playTone(180, .025, .04);

    window.setTimeout(() => {
      runtime.openedCases.push(index);
      runtime.openedThisRound += 1;
      button.classList.remove('is-opening');
      button.classList.add('is-open');
      const revealedValue = runtime.caseValues[index];
      playTone(revealedValue >= 100000 ? 230 : 440, .06, .06);
      showRevealToast(index, revealedValue);
      renderValues();
      pulseEliminatedValue(revealedValue);
      const required = OPEN_COUNTS[runtime.roundIndex] || 0;
      const left = Math.max(0, required - runtime.openedThisRound);
      if (left > 0) {
        runtime.interactionLocked = false;
        renderCases();
        renderHud();
        setStatus(`${formatByte(runtime.caseValues[index])} removed. Open ${left} more.`, runtime.caseValues[index] >= 100000 ? 'warn' : 'good');
      } else {
        renderHud();
        setStatus('SYSTEM BANKER is calculating an offer…', 'gold');
        window.setTimeout(showOffer, 520);
      }
    }, 430);
  }

  function remainingIndices() {
    const opened = new Set(runtime.openedCases);
    return runtime.caseValues.map((_, index) => index).filter(index => !opened.has(index));
  }

  function showOffer() {
    const roundNumber = runtime.roundIndex + 1;
    const remaining = remainingIndices().map(index => runtime.caseValues[index]);
    const offer = bankerOffer(roundNumber, remaining, String(runtime.round?.sessionId || 'local'));
    runtime.currentOffer = offer.offer;
    runtime.currentExpected = offer.expected;
    runtime.state = 'offer';
    runtime.interactionLocked = true;
    runtime.offerRoundEl.textContent = `SYSTEM BANKER · ROUND ${roundNumber}`;
    runtime.offerValueEl.textContent = '0 BYTE';
    runtime.offerCopyEl.textContent = roundNumber < 5
      ? 'Early offer. Taking it ends the run, but late rounds are required for XP.'
      : (roundNumber < 7 ? 'You reached the XP zone. Lock the offer or push deeper?' : 'Final banker offer. Deal now or risk the last two vaults?');
    runtime.offerPanel.hidden = false;
    animatePanelIn(runtime.offerPanel);
    animateOfferValue(offer.offer);
    renderHud();
    playBankerTone();
  }

  function takeDeal() {
    if (runtime.state !== 'offer' || runtime.rewardSubmitting) return;
    runtime.acceptedRound = runtime.roundIndex + 1;
    runtime.acceptedOffer = runtime.currentOffer;
    runtime.finalChoice = 'deal';
    runtime.payout = runtime.currentOffer;
    runtime.offerPanel.hidden = true;
    finishRun('deal');
  }

  function rejectDeal() {
    if (runtime.state !== 'offer') return;
    runtime.offerPanel.hidden = true;
    playTone(160, .05, .05);
    if (runtime.roundIndex >= OPEN_COUNTS.length - 1) {
      showFinalChoice();
      return;
    }
    runtime.roundIndex += 1;
    runtime.openedThisRound = 0;
    runtime.state = 'opening';
    runtime.interactionLocked = false;
    renderCases();
    renderHud();
    setStatus(`NO DEAL. Open ${OPEN_COUNTS[runtime.roundIndex]} vault${OPEN_COUNTS[runtime.roundIndex] === 1 ? '' : 's'} in Round ${runtime.roundIndex + 1}.`, 'good');
  }

  function showFinalChoice() {
    runtime.state = 'final';
    runtime.interactionLocked = true;
    const left = remainingIndices();
    const other = left.find(index => index !== runtime.personalCase);
    runtime.finalCasesEl.innerHTML = `
      <div class="code-vault-final-case is-own"><span>YOUR VAULT</span><strong>${String(runtime.personalCase + 1).padStart(2, '0')}</strong></div>
      <div class="code-vault-final-vs">VS</div>
      <div class="code-vault-final-case"><span>OTHER VAULT</span><strong>${String((other ?? 0) + 1).padStart(2, '0')}</strong></div>`;
    runtime.finalPanel.hidden = false;
    animatePanelIn(runtime.finalPanel);
    runtime.roundEl.textContent = 'FINAL';
    runtime.openLeftEl.textContent = '0';
    runtime.stageBadge.textContent = 'FINAL TWO';
  }

  function finishFinal(choice) {
    if (runtime.state !== 'final') return;
    const left = remainingIndices();
    const other = left.find(index => index !== runtime.personalCase);
    if (!Number.isInteger(other)) return;
    runtime.finalChoice = choice === 'swap' ? 'swap' : 'keep';
    const finalIndex = runtime.finalChoice === 'swap' ? other : runtime.personalCase;
    runtime.payout = runtime.caseValues[finalIndex];
    runtime.finalPanel.hidden = true;
    finishRun('final');
  }

  function buildMetrics() {
    const activeTimeMs = Math.max(0, Date.now() - runtime.startedAt);
    const roundId = String(runtime.round?.sessionId || '');
    let offerRatio = 0;
    if (runtime.acceptedRound > 0) {
      const openCount = OPEN_COUNTS.slice(0, runtime.acceptedRound).reduce((sum, n) => sum + n, 0);
      const opened = new Set(runtime.openedCases.slice(0, openCount));
      const remaining = runtime.caseValues.filter((_, index) => !opened.has(index));
      const calc = bankerOffer(runtime.acceptedRound, remaining, roundId || 'local');
      offerRatio = calc.expected > 0 ? calc.offer / calc.expected : 0;
    }
    return {
      completedRun: true,
      chosenCase: runtime.personalCase,
      openedCases: runtime.openedCases.slice(),
      acceptedRound: runtime.acceptedRound,
      acceptedOffer: runtime.acceptedOffer,
      finalChoice: runtime.finalChoice,
      payout: runtime.payout,
      offerRatio: Math.round(offerRatio * 10000) / 10000,
      activeTimeMs,
      durationMs: activeTimeMs
    };
  }

  async function finishRun(kind) {
    runtime.state = 'result';
    runtime.interactionLocked = true;
    runtime.resultPanel.hidden = false;
    animatePanelIn(runtime.resultPanel);
    const metrics = buildMetrics();
    const details = scoreDetails(metrics);
    const ownValue = runtime.caseValues[runtime.personalCase] || 0;
    runtime.resultTitle.textContent = kind === 'deal' ? 'DEAL LOCKED' : 'VAULT REVEALED';
    runtime.resultPayout.textContent = formatByte(runtime.payout);
    runtime.resultCase.textContent = kind === 'deal'
      ? `Your sealed Vault ${String(runtime.personalCase + 1).padStart(2, '0')} contained ${formatByte(ownValue)}.`
      : `${runtime.finalChoice === 'swap' ? 'You swapped vaults.' : 'You kept your vault.'} Final payout revealed.`;
    runtime.resultRound.textContent = kind === 'deal' ? `R${runtime.acceptedRound}` : 'FINAL';
    runtime.resultScore.textContent = details.score.toLocaleString('en-US');
    runtime.resultXp.textContent = '+0';
    runtime.resultNote.className = 'code-vault-reward-note';

    if (details.tier <= 0) {
      runtime.resultNote.textContent = 'No XP for an early deal. Reach Round 5 or later.';
      cancelCurrentRound();
      return;
    }

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) {
      runtime.resultNote.textContent = 'Practice result only — sign in to earn XP.';
      cancelCurrentRound();
      return;
    }

    const today = todayKey();
    if (runtime.lastRewardDay === today && runtime.lastRewardXp >= details.tier) {
      runtime.resultNote.textContent = `You already reached today’s ${runtime.lastRewardXp} XP CODE VAULT tier. Replay for a better decision score.`;
      cancelCurrentRound();
      return;
    }

    runtime.rewardSubmitting = true;
    runtime.resultNote.textContent = 'Validating the run and reward…';
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, { score: details.score, metrics });
      const awarded = Math.max(0, Number(result?.awardedXp || 0));
      runtime.resultXp.textContent = `+${awarded}`;
      runtime.resultNote.classList.toggle('success', awarded > 0);
      if (result?.loginRequired) runtime.resultNote.textContent = 'Practice result only — log in to earn XP.';
      else if (result?.syncFailed) runtime.resultNote.textContent = 'Reward saved for sync. XP will update automatically once confirmed.';
      else if (result?.capReached && awarded <= 0) runtime.resultNote.textContent = 'Daily Mini-Game XP cap reached. You can still play for a better score.';
      else if (result?.replayNoXp && awarded <= 0) runtime.resultNote.textContent = 'Today’s CODE VAULT XP tier is already secured. Replay is score-only.';
      else if (awarded > 0) runtime.resultNote.textContent = `Reward verified: +${awarded} XP. CODE VAULT contributes at most 2 XP/day.`;
      else runtime.resultNote.textContent = 'Valid run, but this result did not improve today’s XP tier.';
      const record = result?.gameRecord || {};
      runtime.lastRewardDay = String(record.lastRewardDay || runtime.lastRewardDay || '');
      runtime.lastRewardXp = Math.max(runtime.lastRewardXp, Number(record.lastRewardXp || 0));
      runtime.bestScore = Math.max(runtime.bestScore, Number(record.bestScore || details.score || 0));
      runtime.bestRound = Math.max(runtime.bestRound, Number(record.bestRound || details.roundReached || 0));
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (error) {
      runtime.resultNote.textContent = `XP sync failed: ${String(error?.message || error || 'Unknown error')}`;
    } finally {
      runtime.rewardSubmitting = false;
      runtime.round = null;
    }
  }

  function todayKey() {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(new Date()).reduce((out, part) => { if (part.type !== 'literal') out[part.type] = part.value; return out; }, {});
      return `${parts.year}-${parts.month}-${parts.day}`;
    } catch (_) {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }

  function hidePanels() {
    [runtime.readyPanel, runtime.offerPanel, runtime.finalPanel, runtime.resultPanel].forEach(panel => { if (panel) panel.hidden = true; });
    clearRevealToast();
    if (runtime.offerAnimFrame) { cancelAnimationFrame(runtime.offerAnimFrame); runtime.offerAnimFrame = 0; }
  }

  function cancelCurrentRound() {
    if (runtime.round?.sessionId) {
      try { runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    }
    runtime.round = null;
  }

  function backToHub() {
    cancelCurrentRound();
    closeUiOnly();
    try { runtime.onBack?.(); } catch (_) {}
  }

  function close() {
    cancelCurrentRound();
    closeUiOnly();
    try { runtime.onClose?.(); } catch (_) {}
  }

  function closeUiOnly() {
    runtime.open = false;
    runtime.state = 'closed';
    clearRevealToast();
    if (runtime.offerAnimFrame) { cancelAnimationFrame(runtime.offerAnimFrame); runtime.offerAnimFrame = 0; }
    if (runtime.overlay) runtime.overlay.hidden = true;
    document.body.classList.remove('code-vault-active');
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snap = runtime.bridge?.getSnapshot?.() || {};
    const record = snap.gameRecords?.codeVault || {};
    runtime.soundEnabled = snap.soundEnabled !== false;
    runtime.lastRewardDay = String(record.lastRewardDay || '');
    runtime.lastRewardXp = Math.max(0, Math.min(2, Number(record.lastRewardXp || 0)));
    runtime.bestScore = Math.max(0, Number(record.bestScore || 0));
    runtime.bestRound = Math.max(0, Number(record.bestRound || 0));
    syncSoundButton();
    runtime.open = true;
    runtime.state = 'ready';
    runtime.overlay.hidden = false;
    runtime.readyPanel.hidden = false;
    animatePanelIn(runtime.readyPanel);
    runtime.offerPanel.hidden = true;
    runtime.finalPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.casesEl.innerHTML = '';
    runtime.valuesLowEl.innerHTML = '';
    runtime.valuesHighEl.innerHTML = '';
    runtime.roundEl.textContent = '—';
    runtime.openLeftEl.textContent = '—';
    runtime.personalEl.textContent = 'Not selected';
    runtime.stageBadge.textContent = 'CHOOSE YOUR VAULT';
    setStatus('Pick one vault to keep. Then open the others.');
    document.body.classList.add('code-vault-active');
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    syncSoundButton();
    try { runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); } catch (_) {}
    if (runtime.soundEnabled) playTone(520, .04, .04);
  }

  function syncSoundButton() {
    if (runtime.soundBtn) runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
  }

  function audioCtx() {
    if (!runtime.soundEnabled) return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!runtime.audioContext) runtime.audioContext = new AudioCtor();
    if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
    return runtime.audioContext;
  }

  function playTone(freq, duration = .05, volume = .045) {
    const ctx = audioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = Math.max(60, Number(freq || 320));
      gain.gain.setValueAtTime(__ict8SfxGain(Math.max(.001, volume)), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + .01);
    } catch (_) {}
  }

  function playBankerTone() {
    playTone(330, .09, .035);
    window.setTimeout(() => playTone(440, .09, .035), 90);
    window.setTimeout(() => playTone(660, .11, .04), 180);
  }

  window[GLOBAL_NAME] = Object.freeze({
    open,
    close,
    isOpen: () => runtime.open,
    __test: Object.freeze({
      shuffledValues,
      bankerOffer,
      scoreDetails,
      values: CASE_VALUES.slice(),
      openCounts: OPEN_COUNTS.slice()
    })
  });
})();
