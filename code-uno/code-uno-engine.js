(() => {
  'use strict';

  if (window.ICT8UnoEngine) return;

  const VERSION = 1;
  const COLORS = Object.freeze(['red', 'yellow', 'green', 'blue']);
  const ACTION_TYPES = Object.freeze(['skip', 'reverse', 'draw2']);
  const WILD_TYPES = Object.freeze(['wild', 'wild4']);
  const ALL_TYPES = Object.freeze(['number', ...ACTION_TYPES, ...WILD_TYPES]);
  const MODE_QUICK = 'quick';
  const MODE_CLASSIC = 'classic';
  const TARGET_SCORE_DEFAULT = 500;
  const STARTING_HAND = 7;
  const DECK_SIZE = 108;

  const clampInt = (value, min, max) => Math.max(min, Math.min(max, Math.floor(Number(value) || 0)));
  const cleanName = (value, fallback = 'PLAYER') => String(value || '').replace(/[<>]/g, '').trim().slice(0, 24) || fallback;
  const clone = value => JSON.parse(JSON.stringify(value));

  function hash32(value) {
    const text = String(value ?? '');
    let hash = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let a = Number(seed || 1) >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(list, seed) {
    const out = Array.from(list || []);
    const rnd = mulberry32(seed || 1);
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function numberLabel(value) { return String(clampInt(value, 0, 9)); }
  function cardLabel(type, value) {
    if (type === 'number') return numberLabel(value);
    if (type === 'skip') return 'SKIP';
    if (type === 'reverse') return 'REVERSE';
    if (type === 'draw2') return '+2';
    if (type === 'wild4') return '+4';
    return 'WILD';
  }

  function makeCard(id, color, type, value = null) {
    return Object.freeze({
      id: String(id),
      color: color || 'wild',
      type,
      value: type === 'number' ? clampInt(value, 0, 9) : null,
      label: cardLabel(type, value)
    });
  }

  function buildClassicDeck() {
    const deck = [];
    let serial = 0;
    COLORS.forEach(color => {
      deck.push(makeCard(`u${++serial}`, color, 'number', 0));
      for (let n = 1; n <= 9; n += 1) {
        deck.push(makeCard(`u${++serial}`, color, 'number', n));
        deck.push(makeCard(`u${++serial}`, color, 'number', n));
      }
      ACTION_TYPES.forEach(type => {
        deck.push(makeCard(`u${++serial}`, color, type));
        deck.push(makeCard(`u${++serial}`, color, type));
      });
    });
    for (let i = 0; i < 4; i += 1) deck.push(makeCard(`u${++serial}`, 'wild', 'wild'));
    for (let i = 0; i < 4; i += 1) deck.push(makeCard(`u${++serial}`, 'wild', 'wild4'));
    return deck;
  }

  function normalizePlayers(players = []) {
    const source = Array.isArray(players) ? players.slice(0, 10) : [];
    if (source.length < 2) throw new Error('UNO requires at least 2 players.');
    return source.map((player, index) => ({
      seat: index,
      uid: String(player?.uid || `seat-${index}`).slice(0, 128),
      studentId: String(player?.studentId || '').slice(0, 40),
      name: cleanName(player?.name, player?.bot ? `BOT ${index}` : `PLAYER ${index + 1}`),
      bot: player?.bot === true,
      botLevel: ['easy', 'normal', 'hard'].includes(String(player?.botLevel || '').toLowerCase()) ? String(player.botLevel).toLowerCase() : 'normal',
      botTakeover: player?.botTakeover === true,
      connected: player?.connected !== false,
      ready: player?.ready !== false,
      score: Math.max(0, Math.floor(Number(player?.score || 0))),
      hand: [],
      unoCalled: false,
      preUno: false
    }));
  }

  function nextSeat(state, fromSeat, steps = 1) {
    const total = state.players.length;
    let seat = clampInt(fromSeat, 0, total - 1);
    const dir = state.direction === -1 ? -1 : 1;
    for (let i = 0; i < Math.max(0, steps); i += 1) seat = (seat + dir + total) % total;
    return seat;
  }

  function topCard(state) {
    return state.discardPile[state.discardPile.length - 1] || null;
  }

  function sameSymbol(card, top) {
    if (!card || !top) return false;
    if (card.type === 'number' && top.type === 'number') return card.value === top.value;
    return card.type === top.type && card.type !== 'wild' && card.type !== 'wild4';
  }

  function isCardPlayable(state, seat, card) {
    if (!card || state.phase !== 'turn' || seat !== state.turnSeat) return false;
    if (state.drawnCardId && card.id !== state.drawnCardId) return false;
    if (card.type === 'wild' || card.type === 'wild4') return true;
    const top = topCard(state);
    return card.color === state.currentColor || sameSymbol(card, top);
  }

  function playerBySeat(state, seat) {
    return state.players.find(player => player.seat === Number(seat)) || null;
  }

  function findCardInHand(state, seat, cardId) {
    const player = playerBySeat(state, seat);
    if (!player) return null;
    return player.hand.find(card => card.id === String(cardId || '')) || null;
  }

  function emit(state, type, detail = {}) {
    state.eventSeq += 1;
    state.revision += 1;
    state.lastEvent = { seq: state.eventSeq, type, at: Date.now(), ...clone(detail) };
    return state.lastEvent;
  }

  function recycleDiscard(state) {
    if (state.drawPile.length || state.discardPile.length <= 1) return false;
    const keep = state.discardPile.pop();
    const recycle = state.discardPile.splice(0);
    state.shuffleCycle += 1;
    state.drawPile = shuffled(recycle, hash32(`${state.seed}:recycle:${state.round}:${state.shuffleCycle}:${state.eventSeq}`));
    state.discardPile.push(keep);
    return true;
  }

  function drawCards(state, seat, count, options = {}) {
    const player = playerBySeat(state, seat);
    if (!player) throw new Error('Player seat is unavailable.');
    const cards = [];
    const amount = clampInt(count, 0, DECK_SIZE);
    for (let i = 0; i < amount; i += 1) {
      if (!state.drawPile.length) recycleDiscard(state);
      const card = state.drawPile.pop();
      if (!card) break;
      player.hand.push(card);
      cards.push(card);
    }
    if (cards.length && !options.quiet) emit(state, options.reason || 'drawCards', { seat, count: cards.length });
    if (player.hand.length !== 1) {
      player.unoCalled = false;
      player.preUno = false;
      if (state.unoVulnerableSeat === seat) state.unoVulnerableSeat = null;
    }
    return cards;
  }

  function handHasCurrentColor(player, currentColor, excludedId = '') {
    return player.hand.some(card => card.id !== excludedId && card.color === currentColor);
  }

  function cardPoints(card) {
    if (!card) return 0;
    if (card.type === 'number') return card.value;
    if (card.type === 'wild' || card.type === 'wild4') return 50;
    return 20;
  }

  function handPoints(player) {
    return (player?.hand || []).reduce((sum, card) => sum + cardPoints(card), 0);
  }

  function expireUnoWindowBeforeTurnAction(state, actingSeat) {
    const vulnerable = state.unoVulnerableSeat;
    if (vulnerable == null) return;
    // A catch is a separate reaction. Once the next actual play/draw starts,
    // the catch window is over regardless of who owns the next action.
    if (actingSeat === state.turnSeat) state.unoVulnerableSeat = null;
  }

  function markUnoAfterPlay(state, player) {
    if (player.hand.length === 1) {
      if (player.preUno) {
        player.unoCalled = true;
        player.preUno = false;
        state.unoVulnerableSeat = null;
      } else {
        player.unoCalled = false;
        state.unoVulnerableSeat = player.seat;
      }
    } else {
      player.unoCalled = false;
      player.preUno = false;
      if (state.unoVulnerableSeat === player.seat) state.unoVulnerableSeat = null;
    }
  }

  function resetTransientTurn(state) {
    state.drawnCardId = '';
    state.drawnBySeat = null;
    state.pending = null;
    state.players.forEach(player => {
      if (player.hand.length !== 1) player.unoCalled = false;
      if (player.hand.length !== 2) player.preUno = false;
    });
  }

  function finalizeRound(state, winnerSeat) {
    const winner = playerBySeat(state, winnerSeat);
    if (!winner) throw new Error('Round winner is unavailable.');
    state.pendingWinnerSeat = null;
    state.roundWinnerSeat = winnerSeat;
    state.unoVulnerableSeat = null;
    const points = state.players.reduce((sum, player) => player.seat === winnerSeat ? sum : sum + handPoints(player), 0);
    state.roundPoints = points;
    if (state.mode === MODE_CLASSIC) winner.score += points;
    if (state.mode === MODE_QUICK || winner.score >= state.targetScore) {
      state.phase = 'match-over';
      state.matchWinnerSeat = winnerSeat;
      emit(state, 'matchOver', { winnerSeat, roundPoints: points, score: winner.score, mode: state.mode });
    } else {
      state.phase = 'round-over';
      emit(state, 'roundOver', { winnerSeat, roundPoints: points, score: winner.score, mode: state.mode });
    }
  }

  function finishPendingWinnerIfReady(state) {
    if (state.pendingWinnerSeat == null) return false;
    const player = playerBySeat(state, state.pendingWinnerSeat);
    if (!player || player.hand.length !== 0) {
      state.pendingWinnerSeat = null;
      return false;
    }
    const seat = state.pendingWinnerSeat;
    finalizeRound(state, seat);
    return true;
  }

  function advanceTurn(state, fromSeat, steps = 1) {
    state.turnSeat = nextSeat(state, fromSeat, steps);
    state.drawnCardId = '';
    state.drawnBySeat = null;
    state.phase = 'turn';
    state.pending = null;
  }

  function prepareRound(state, options = {}) {
    const seed = hash32(`${state.seed}:round:${state.round}:${options.extraSeed || 0}`) || 1;
    const deck = shuffled(buildClassicDeck(), seed);
    state.drawPile = deck;
    state.discardPile = [];
    state.direction = 1;
    state.phase = 'turn';
    state.currentColor = 'red';
    state.drawnCardId = '';
    state.drawnBySeat = null;
    state.pending = null;
    state.pendingWinnerSeat = null;
    state.roundWinnerSeat = null;
    state.roundPoints = 0;
    state.matchWinnerSeat = null;
    state.unoVulnerableSeat = null;
    state.shuffleCycle = 0;
    state.players.forEach(player => {
      player.hand = [];
      player.unoCalled = false;
      player.preUno = false;
    });

    for (let n = 0; n < STARTING_HAND; n += 1) {
      state.players.forEach(player => {
        const card = state.drawPile.pop();
        if (card) player.hand.push(card);
      });
    }

    const firstSeat = (state.dealerSeat + 1) % state.players.length;
    state.turnSeat = firstSeat;

    let first = null;
    let guard = 0;
    while (state.drawPile.length && guard++ < 20) {
      const candidate = state.drawPile.pop();
      if (candidate.type === 'wild4') {
        state.drawPile.unshift(candidate);
        state.drawPile = shuffled(state.drawPile, hash32(`${seed}:wild4-redraw:${guard}`));
        continue;
      }
      first = candidate;
      break;
    }
    if (!first) first = state.drawPile.pop();
    if (!first) throw new Error('UNO deck could not start.');
    state.discardPile.push(first);

    if (first.type === 'wild') {
      state.currentColor = 'red';
      state.phase = 'choose-color';
      state.pending = { kind: 'opening-wild', actorSeat: firstSeat };
    } else {
      state.currentColor = first.color;
      if (first.type === 'skip') {
        state.turnSeat = nextSeat(state, firstSeat, 1);
      } else if (first.type === 'reverse') {
        state.direction = -1;
        state.turnSeat = nextSeat(state, firstSeat, 1);
      } else if (first.type === 'draw2') {
        drawCards(state, firstSeat, 2, { quiet: true });
        state.turnSeat = nextSeat(state, firstSeat, 1);
      }
    }
    emit(state, 'roundStart', { round: state.round, dealerSeat: state.dealerSeat, topCard: first, turnSeat: state.turnSeat });
    return state;
  }

  function createMatch(options = {}) {
    const players = normalizePlayers(options.players || []);
    const state = {
      version: VERSION,
      mode: options.mode === MODE_CLASSIC ? MODE_CLASSIC : MODE_QUICK,
      targetScore: clampInt(options.targetScore || TARGET_SCORE_DEFAULT, 100, 5000),
      seed: Number(options.seed || hash32(`${Date.now()}:${Math.random()}`) || 1) >>> 0,
      round: 1,
      dealerSeat: clampInt(options.dealerSeat || players.length - 1, 0, players.length - 1),
      players,
      drawPile: [],
      discardPile: [],
      direction: 1,
      turnSeat: 0,
      currentColor: 'red',
      phase: 'turn',
      drawnCardId: '',
      drawnBySeat: null,
      pending: null,
      pendingWinnerSeat: null,
      unoVulnerableSeat: null,
      roundWinnerSeat: null,
      roundPoints: 0,
      matchWinnerSeat: null,
      revision: 0,
      eventSeq: 0,
      lastEvent: null,
      shuffleCycle: 0,
      createdAtMs: Date.now()
    };
    prepareRound(state);
    return state;
  }

  function startNextRound(state) {
    if (state.phase !== 'round-over') throw new Error('The current round is not finished.');
    state.round += 1;
    state.dealerSeat = (state.dealerSeat + 1) % state.players.length;
    prepareRound(state);
    return state;
  }

  function playCard(state, seat, cardId) {
    if (state.phase !== 'turn' || seat !== state.turnSeat) throw new Error('It is not this player\'s turn.');
    expireUnoWindowBeforeTurnAction(state, seat);
    const player = playerBySeat(state, seat);
    const index = player.hand.findIndex(card => card.id === String(cardId || ''));
    if (index < 0) throw new Error('That card is not in this hand.');
    const card = player.hand[index];
    if (!isCardPlayable(state, seat, card)) throw new Error('That card cannot be played now.');

    const colorBefore = state.currentColor;
    const wild4Legal = card.type !== 'wild4' || !handHasCurrentColor(player, colorBefore, card.id);
    player.hand.splice(index, 1);
    state.discardPile.push(card);
    state.drawnCardId = '';
    state.drawnBySeat = null;
    if (card.color !== 'wild') state.currentColor = card.color;
    markUnoAfterPlay(state, player);
    if (player.hand.length === 0) state.pendingWinnerSeat = seat;

    emit(state, 'playCard', { seat, card, handCount: player.hand.length, currentColor: state.currentColor });

    if (card.type === 'wild' || card.type === 'wild4') {
      state.phase = 'choose-color';
      state.pending = card.type === 'wild4'
        ? { kind: 'wild4', actorSeat: seat, offenderSeat: seat, targetSeat: nextSeat(state, seat, 1), wasLegal: wild4Legal, previousColor: colorBefore }
        : { kind: 'wild', actorSeat: seat };
      state.turnSeat = seat;
      return { ok: true, card, needsColor: true };
    }

    if (card.type === 'skip') {
      advanceTurn(state, seat, 2);
      emit(state, 'skip', { seat, skippedSeat: nextSeat({ ...state, direction: state.direction }, seat, 1), nextSeat: state.turnSeat });
    } else if (card.type === 'reverse') {
      state.direction *= -1;
      if (state.players.length === 2) advanceTurn(state, seat, 2);
      else advanceTurn(state, seat, 1);
      emit(state, 'reverse', { seat, direction: state.direction, nextSeat: state.turnSeat });
    } else if (card.type === 'draw2') {
      const targetSeat = nextSeat(state, seat, 1);
      const cards = drawCards(state, targetSeat, 2, { quiet: true });
      advanceTurn(state, targetSeat, 1);
      emit(state, 'drawPenalty', { sourceSeat: seat, targetSeat, count: cards.length, kind: 'draw2', nextSeat: state.turnSeat });
    } else {
      advanceTurn(state, seat, 1);
    }

    finishPendingWinnerIfReady(state);
    return { ok: true, card };
  }

  function chooseColor(state, seat, color) {
    if (state.phase !== 'choose-color' || !state.pending || state.pending.actorSeat !== seat) throw new Error('Color choice is not available.');
    const chosen = String(color || '').toLowerCase();
    if (!COLORS.includes(chosen)) throw new Error('Choose red, yellow, green, or blue.');
    const pending = state.pending;
    state.currentColor = chosen;
    emit(state, 'chooseColor', { seat, color: chosen, kind: pending.kind });

    if (pending.kind === 'wild4') {
      state.phase = 'wild4-challenge';
      state.turnSeat = pending.targetSeat;
      state.pending = pending;
      return { ok: true, challengeSeat: pending.targetSeat };
    }

    if (pending.kind === 'opening-wild') {
      state.phase = 'turn';
      state.pending = null;
      state.turnSeat = seat;
      return { ok: true };
    }

    advanceTurn(state, seat, 1);
    finishPendingWinnerIfReady(state);
    return { ok: true };
  }

  function resolveWild4(state, seat, challenge) {
    if (state.phase !== 'wild4-challenge' || !state.pending || state.pending.kind !== 'wild4') throw new Error('There is no +4 challenge to resolve.');
    const pending = state.pending;
    if (seat !== pending.targetSeat) throw new Error('Only the affected player can resolve the +4.');

    if (challenge === true) {
      if (pending.wasLegal) {
        const cards = drawCards(state, pending.targetSeat, 6, { quiet: true });
        advanceTurn(state, pending.targetSeat, 1);
        emit(state, 'wild4Challenge', { targetSeat: pending.targetSeat, offenderSeat: pending.offenderSeat, successful: false, count: cards.length, nextSeat: state.turnSeat });
      } else {
        const cards = drawCards(state, pending.offenderSeat, 4, { quiet: true });
        state.pendingWinnerSeat = null;
        state.phase = 'turn';
        state.pending = null;
        state.drawnCardId = '';
        state.drawnBySeat = null;
        state.turnSeat = pending.targetSeat;
        emit(state, 'wild4Challenge', { targetSeat: pending.targetSeat, offenderSeat: pending.offenderSeat, successful: true, count: cards.length, nextSeat: state.turnSeat });
      }
    } else {
      const cards = drawCards(state, pending.targetSeat, 4, { quiet: true });
      advanceTurn(state, pending.targetSeat, 1);
      emit(state, 'wild4Accepted', { targetSeat: pending.targetSeat, offenderSeat: pending.offenderSeat, count: cards.length, nextSeat: state.turnSeat });
    }

    finishPendingWinnerIfReady(state);
    return { ok: true };
  }

  function drawOne(state, seat) {
    if (state.phase !== 'turn' || seat !== state.turnSeat) throw new Error('It is not this player\'s turn.');
    if (state.drawnCardId) throw new Error('A card was already drawn this turn.');
    expireUnoWindowBeforeTurnAction(state, seat);
    const cards = drawCards(state, seat, 1, { quiet: true });
    const card = cards[0] || null;
    if (!card) {
      advanceTurn(state, seat, 1);
      emit(state, 'drawEmpty', { seat, nextSeat: state.turnSeat });
      return { ok: true, card: null, playable: false };
    }
    const playable = isCardPlayable(state, seat, card);
    emit(state, 'drawOne', { seat, count: 1, cardId: card.id, playable });
    if (playable) {
      state.drawnCardId = card.id;
      state.drawnBySeat = seat;
    } else {
      advanceTurn(state, seat, 1);
      emit(state, 'drawPass', { seat, nextSeat: state.turnSeat });
    }
    return { ok: true, card, playable };
  }

  function passDrawn(state, seat) {
    if (state.phase !== 'turn' || seat !== state.turnSeat || state.drawnBySeat !== seat || !state.drawnCardId) throw new Error('There is no drawn card to keep.');
    const keptCardId = state.drawnCardId;
    advanceTurn(state, seat, 1);
    emit(state, 'passDrawn', { seat, cardId: keptCardId, nextSeat: state.turnSeat });
    return { ok: true };
  }

  function callUno(state, seat) {
    const player = playerBySeat(state, seat);
    if (!player) throw new Error('Player is unavailable.');
    if (player.hand.length === 1 && state.unoVulnerableSeat === seat) {
      player.unoCalled = true;
      player.preUno = false;
      state.unoVulnerableSeat = null;
      emit(state, 'unoCalled', { seat, timing: 'after' });
      return { ok: true };
    }
    if (player.hand.length === 2 && state.phase === 'turn' && state.turnSeat === seat && !player.preUno) {
      player.preUno = true;
      emit(state, 'unoPrimed', { seat });
      return { ok: true };
    }
    throw new Error('UNO can be called when you are about to reach, or already have, one card.');
  }

  function catchUno(state, bySeat, targetSeat) {
    const catcher = playerBySeat(state, bySeat);
    const target = playerBySeat(state, targetSeat);
    if (!catcher || !target || bySeat === targetSeat) throw new Error('That UNO catch is not available.');
    if (state.unoVulnerableSeat !== targetSeat || target.hand.length !== 1 || target.unoCalled) throw new Error('The UNO catch window already closed.');
    const cards = drawCards(state, targetSeat, 2, { quiet: true });
    target.unoCalled = false;
    target.preUno = false;
    state.unoVulnerableSeat = null;
    emit(state, 'unoCaught', { bySeat, targetSeat, count: cards.length });
    return { ok: true };
  }

  function setConnection(state, seat, connected, botTakeover = false) {
    const player = playerBySeat(state, seat);
    if (!player) return false;
    player.connected = connected !== false;
    player.botTakeover = botTakeover === true;
    emit(state, 'connection', { seat, connected: player.connected, botTakeover: player.botTakeover });
    return true;
  }

  function legalActions(state, seat) {
    const player = playerBySeat(state, seat);
    if (!player) return { canAct: false, canPlayIds: [], canDraw: false, canPass: false, canCallUno: false, catchableSeat: null };
    const ownTurn = state.turnSeat === seat;
    const canPlayIds = state.phase === 'turn' && ownTurn
      ? player.hand.filter(card => isCardPlayable(state, seat, card)).map(card => card.id)
      : [];
    return {
      canAct: ownTurn && ['turn', 'choose-color', 'wild4-challenge'].includes(state.phase),
      canPlayIds,
      canDraw: state.phase === 'turn' && ownTurn && !state.drawnCardId,
      canPass: state.phase === 'turn' && ownTurn && state.drawnBySeat === seat && !!state.drawnCardId,
      canChooseColor: state.phase === 'choose-color' && state.pending?.actorSeat === seat,
      canAcceptWild4: state.phase === 'wild4-challenge' && state.pending?.targetSeat === seat,
      canChallengeWild4: state.phase === 'wild4-challenge' && state.pending?.targetSeat === seat,
      canCallUno: (player.hand.length === 1 && state.unoVulnerableSeat === seat && !player.unoCalled)
        || (player.hand.length === 2 && state.phase === 'turn' && ownTurn && !player.preUno),
      unoPrimed: player.preUno === true,
      catchableSeat: state.unoVulnerableSeat != null && state.unoVulnerableSeat !== seat ? state.unoVulnerableSeat : null,
      drawnCardId: state.drawnBySeat === seat ? state.drawnCardId : ''
    };
  }

  function act(state, seat, action = {}) {
    if (!state || !Array.isArray(state.players)) throw new Error('UNO state is unavailable.');
    const type = String(action.type || '').trim();
    if (state.phase === 'match-over' && type !== 'noop') throw new Error('This match is already over.');
    if (type === 'play') return playCard(state, seat, action.cardId);
    if (type === 'draw') return drawOne(state, seat);
    if (type === 'pass') return passDrawn(state, seat);
    if (type === 'color') return chooseColor(state, seat, action.color);
    if (type === 'wild4-accept') return resolveWild4(state, seat, false);
    if (type === 'wild4-challenge') return resolveWild4(state, seat, true);
    if (type === 'uno') return callUno(state, seat);
    if (type === 'catch-uno') return catchUno(state, seat, Number(action.targetSeat));
    if (type === 'next-round') {
      if (seat !== 0) throw new Error('Only the Host can start the next round.');
      return { ok: true, state: startNextRound(state) };
    }
    throw new Error('Unknown UNO action.');
  }

  function sanitizeCard(card) {
    return card ? { id: card.id, color: card.color, type: card.type, value: card.value, label: card.label } : null;
  }

  function publicEvent(event) {
    if (!event) return null;
    const safe = clone(event);
    // Drawn/kept card identities are private information. Card IDs map to a
    // deterministic deck, so even an opaque-looking ID must never be broadcast.
    if (safe.type === 'drawOne' || safe.type === 'passDrawn') delete safe.cardId;
    return safe;
  }

  function publicSnapshot(state) {
    const pending = state.pending ? {
      kind: state.pending.kind,
      actorSeat: state.pending.actorSeat,
      offenderSeat: state.pending.offenderSeat,
      targetSeat: state.pending.targetSeat
    } : null;
    return {
      version: VERSION,
      mode: state.mode,
      targetScore: state.targetScore,
      round: state.round,
      dealerSeat: state.dealerSeat,
      direction: state.direction,
      turnSeat: state.turnSeat,
      currentColor: state.currentColor,
      phase: state.phase,
      drawCount: state.drawPile.length,
      discardCount: state.discardPile.length,
      topCard: sanitizeCard(topCard(state)),
      pending,
      pendingWinnerSeat: state.pendingWinnerSeat,
      unoVulnerableSeat: state.unoVulnerableSeat,
      roundWinnerSeat: state.roundWinnerSeat,
      roundPoints: state.roundPoints,
      matchWinnerSeat: state.matchWinnerSeat,
      revision: state.revision,
      eventSeq: state.eventSeq,
      lastEvent: publicEvent(state.lastEvent),
      players: state.players.map(player => ({
        seat: player.seat,
        name: player.name,
        bot: player.bot,
        botLevel: player.botLevel,
        botTakeover: player.botTakeover,
        connected: player.connected,
        score: player.score,
        handCount: player.hand.length,
        unoCalled: player.hand.length === 1 && player.unoCalled
      }))
    };
  }

  function privateSnapshot(state, seat) {
    const player = playerBySeat(state, seat);
    if (!player) return null;
    return {
      seat,
      hand: player.hand.map(sanitizeCard),
      actions: legalActions(state, seat)
    };
  }

  function colorPreferenceFromHand(hand, fallback = 'red') {
    const counts = Object.fromEntries(COLORS.map(color => [color, 0]));
    (hand || []).forEach(card => { if (COLORS.includes(card.color)) counts[card.color] += 1; });
    return COLORS.slice().sort((a, b) => counts[b] - counts[a] || COLORS.indexOf(a) - COLORS.indexOf(b))[0] || fallback;
  }

  function cardHeuristic(card, publicState, privateState, difficulty) {
    const hand = privateState.hand || [];
    const colorCount = hand.filter(item => item.id !== card.id && item.color === card.color).length;
    let score = colorCount * 5;
    const nextSeatPublic = (() => {
      const total = publicState.players.length;
      return (publicState.turnSeat + (publicState.direction === -1 ? -1 : 1) + total) % total;
    })();
    const danger = Number(publicState.players.find(player => player.seat === nextSeatPublic)?.handCount || 99) <= 2;
    if (card.type === 'skip') score += danger ? 22 : 8;
    if (card.type === 'reverse') score += danger ? 18 : 6;
    if (card.type === 'draw2') score += danger ? 30 : 12;
    if (card.type === 'wild') score += difficulty === 'hard' ? -6 : 5;
    if (card.type === 'wild4') {
      const matchingColor = hand.some(item => item.id !== card.id && item.color === publicState.currentColor);
      if (difficulty === 'hard' && matchingColor) score -= 100;
      else score += danger ? 35 : 10;
    }
    if (card.type === 'number') score += card.value * .25;
    return score;
  }

  function chooseBotAction(publicState, privateState, difficulty = 'normal', random = Math.random) {
    if (!publicState || !privateState) return { type: 'noop' };
    const level = ['easy', 'normal', 'hard'].includes(difficulty) ? difficulty : 'normal';
    const seat = privateState.seat;
    const actions = privateState.actions || {};
    const hand = privateState.hand || [];

    if (actions.catchableSeat != null) {
      const chance = level === 'easy' ? .42 : (level === 'normal' ? .82 : .97);
      if (random() < chance) return { type: 'catch-uno', targetSeat: actions.catchableSeat };
    }
    if (actions.canCallUno) {
      const chance = level === 'easy' ? .78 : (level === 'normal' ? .97 : 1);
      if (random() < chance) return { type: 'uno' };
    }
    if (actions.canChooseColor) return { type: 'color', color: colorPreferenceFromHand(hand, publicState.currentColor) };
    if (actions.canAcceptWild4 || actions.canChallengeWild4) {
      const offender = publicState.players.find(player => player.seat === publicState.pending?.offenderSeat);
      const lowOffender = Number(offender?.handCount || 99) <= 2;
      const challengeChance = level === 'easy' ? .18 : (level === 'normal' ? (lowOffender ? .42 : .30) : (lowOffender ? .66 : .48));
      return random() < challengeChance ? { type: 'wild4-challenge' } : { type: 'wild4-accept' };
    }

    const playable = hand.filter(card => (actions.canPlayIds || []).includes(card.id));
    if (playable.length) {
      if (level === 'easy') return { type: 'play', cardId: playable[Math.floor(random() * playable.length)].id };
      const ranked = playable.map(card => ({ card, score: cardHeuristic(card, publicState, privateState, level) + random() * .75 }))
        .sort((a, b) => b.score - a.score);
      return { type: 'play', cardId: ranked[0].card.id };
    }
    if (actions.canDraw) return { type: 'draw' };
    if (actions.canPass) {
      if (actions.drawnCardId && (actions.canPlayIds || []).includes(actions.drawnCardId)) {
        const playChance = level === 'easy' ? .78 : (level === 'normal' ? .96 : 1);
        if (random() < playChance) return { type: 'play', cardId: actions.drawnCardId };
      }
      return { type: 'pass' };
    }
    return { type: 'noop', seat };
  }

  function validateState(state, options = {}) {
    const errors = [];
    if (!state || !Array.isArray(state.players)) return { ok: false, errors: ['Missing state or players.'] };
    if (state.players.length < 2 || state.players.length > 10) errors.push('Player count must be 2–10.');
    const seats = state.players.map(player => player.seat);
    if (new Set(seats).size !== seats.length) errors.push('Duplicate player seats.');
    const cards = [];
    state.players.forEach(player => cards.push(...(player.hand || [])));
    cards.push(...(state.drawPile || []), ...(state.discardPile || []));
    if (cards.length !== DECK_SIZE) errors.push(`Card conservation failed: ${cards.length}/${DECK_SIZE}.`);
    const ids = cards.map(card => card.id);
    if (new Set(ids).size !== ids.length) errors.push('Duplicate card ID detected.');
    if (!COLORS.includes(state.currentColor)) errors.push('Invalid current color.');
    if (![1, -1].includes(state.direction)) errors.push('Invalid direction.');
    if (!['turn', 'choose-color', 'wild4-challenge', 'round-over', 'match-over'].includes(state.phase)) errors.push('Invalid phase.');
    if (!playerBySeat(state, state.turnSeat)) errors.push('Invalid turn seat.');
    if (!topCard(state)) errors.push('Discard pile has no top card.');
    if (state.drawnCardId) {
      const player = playerBySeat(state, state.drawnBySeat);
      if (!player || !player.hand.some(card => card.id === state.drawnCardId)) errors.push('Drawn card marker is not in the expected hand.');
    }
    if (options.throwOnError && errors.length) throw new Error(errors.join(' | '));
    return { ok: errors.length === 0, errors, cardCount: cards.length, uniqueCards: new Set(ids).size };
  }

  window.ICT8UnoEngine = Object.freeze({
    version: VERSION,
    colors: COLORS,
    deckSize: DECK_SIZE,
    buildClassicDeck,
    createMatch,
    startNextRound,
    act,
    legalActions,
    publicSnapshot,
    privateSnapshot,
    validateState,
    chooseBotAction,
    colorPreferenceFromHand,
    cardPoints,
    handPoints,
    isCardPlayable,
    nextSeat,
    setConnection,
    _test: Object.freeze({ hash32, mulberry32, shuffled, makeCard, topCard, drawCards, recycleDiscard, finalizeRound })
  });
})();
