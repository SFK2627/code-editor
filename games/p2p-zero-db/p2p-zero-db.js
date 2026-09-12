(() => {
  'use strict';

  if (window.ICT8ZeroDbP2P) return;

  const VERSION = 1;
  const DEFAULT_TIMEOUT = 16000;

  const cleanName = (value, fallback = 'PLAYER') => {
    const text = String(value || '').replace(/[<>]/g, '').trim().slice(0, 20);
    return text || fallback;
  };

  function randomSeed() {
    try {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] >>> 0;
    } catch (_) {
      return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    }
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

  function shuffle(list, seed) {
    const out = Array.from(list || []);
    const rnd = mulberry32(seed || 1);
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function bytesToB64(bytes) {
    let out = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      out += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(out).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function b64ToBytes(text) {
    let s = String(text || '').trim().replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function encode(prefix, payload) {
    const safePrefix = String(prefix || 'P2P').replace(/[^A-Z0-9_-]/gi, '').slice(0, 14) || 'P2P';
    const body = bytesToB64(new TextEncoder().encode(JSON.stringify(payload)));
    return `${safePrefix}.${body}`;
  }

  function decode(prefix, code) {
    const safePrefix = String(prefix || 'P2P').replace(/[^A-Z0-9_-]/gi, '').slice(0, 14) || 'P2P';
    const raw = String(code || '').trim();
    if (!raw.startsWith(`${safePrefix}.`)) throw new Error('This pairing code belongs to a different game.');
    const data = JSON.parse(new TextDecoder().decode(b64ToBytes(raw.slice(safePrefix.length + 1))));
    if (Number(data.v || 0) !== VERSION) throw new Error('Pairing code version does not match this build.');
    return data;
  }

  async function waitForIce(pc, timeout = 5500) {
    if (pc.iceGatheringState === 'complete') return;
    await new Promise(resolve => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        pc.removeEventListener('icegatheringstatechange', onChange);
        clearTimeout(timer);
        resolve();
      };
      const onChange = () => { if (pc.iceGatheringState === 'complete') done(); };
      const timer = setTimeout(done, timeout);
      pc.addEventListener('icegatheringstatechange', onChange);
    });
  }

  function createSession(options = {}) {
    const gameId = String(options.gameId || 'p2p-game');
    const prefix = String(options.prefix || 'P2P1').toUpperCase();
    const channelLabel = String(options.channelLabel || gameId).slice(0, 40);
    let pc = null;
    let dc = null;
    let role = '';
    let localName = 'PLAYER';
    let remoteName = 'OPPONENT';
    let seed = 0;
    let connected = false;
    let connectionTimer = 0;
    let messageHandler = typeof options.onMessage === 'function' ? options.onMessage : null;

    function notifyState(state, extra = {}) {
      try { options.onState?.(state, { role, localName, remoteName, seed, connected, ...extra }); } catch (_) {}
    }

    function notifyRemoteName() {
      try { options.onRemoteName?.(remoteName); } catch (_) {}
    }

    function send(payload) {
      if (!dc || dc.readyState !== 'open') return false;
      try {
        dc.send(JSON.stringify(payload));
        return true;
      } catch (_) {
        return false;
      }
    }

    function bindChannel(channel) {
      dc = channel;
      dc.binaryType = 'arraybuffer';
      dc.addEventListener('open', () => {
        connected = true;
        clearTimeout(connectionTimer);
        send({ t: '__hello', n: localName, g: gameId });
        notifyState('connected');
        try { options.onConnected?.({ role, seed, localName, remoteName }); } catch (_) {}
      });
      dc.addEventListener('close', () => {
        const wasConnected = connected;
        connected = false;
        notifyState('closed');
        if (wasConnected) {
          try { options.onDisconnected?.('channel-closed'); } catch (_) {}
        }
      });
      dc.addEventListener('error', () => notifyState('channel-error'));
      dc.addEventListener('message', event => {
        let msg = null;
        try { msg = JSON.parse(String(event.data || '')); } catch (_) { return; }
        if (!msg || typeof msg !== 'object') return;
        if (msg.t === '__hello') {
          remoteName = cleanName(msg.n, 'OPPONENT');
          notifyRemoteName();
          return;
        }
        try { messageHandler?.(msg); } catch (error) { console.warn(`${gameId} P2P message error`, error); }
      });
    }

    function closePeer() {
      clearTimeout(connectionTimer);
      connectionTimer = 0;
      connected = false;
      try { dc?.close(); } catch (_) {}
      try { pc?.close(); } catch (_) {}
      dc = null;
      pc = null;
    }

    function buildPeer() {
      closePeer();
      if (!window.RTCPeerConnection) throw new Error('WebRTC is not supported by this browser.');
      pc = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
        ],
        bundlePolicy: 'max-bundle',
        iceCandidatePoolSize: 1
      });
      pc.addEventListener('connectionstatechange', () => {
        const state = pc?.connectionState || 'closed';
        if (state === 'connected') {
          connected = true;
          clearTimeout(connectionTimer);
        }
        if (state === 'failed' || state === 'disconnected') {
          const wasConnected = connected;
          connected = false;
          notifyState(state);
          if (wasConnected || state === 'failed') {
            try { options.onDisconnected?.(state); } catch (_) {}
          }
        }
        if (state === 'closed') connected = false;
      });
      return pc;
    }

    function startTimeout() {
      clearTimeout(connectionTimer);
      connectionTimer = setTimeout(() => {
        if (!connected) notifyState('timeout');
      }, Math.max(5000, Number(options.timeoutMs || DEFAULT_TIMEOUT)));
    }

    async function createOffer(name = 'PLAYER 1') {
      localName = cleanName(name, 'PLAYER 1');
      role = 'host';
      seed = randomSeed();
      const peer = buildPeer();
      bindChannel(peer.createDataChannel(channelLabel, { ordered: true }));
      await peer.setLocalDescription(await peer.createOffer());
      await waitForIce(peer);
      const code = encode(prefix, {
        v: VERSION,
        g: gameId,
        kind: 'offer',
        desc: peer.localDescription,
        name: localName,
        seed
      });
      startTimeout();
      notifyState('offer-ready');
      return code;
    }

    async function createAnswer(offerCode, name = 'PLAYER 2') {
      const offer = decode(prefix, offerCode);
      if (offer.kind !== 'offer' || !offer.desc || offer.g !== gameId) throw new Error('Invalid Host QR for this game.');
      localName = cleanName(name, 'PLAYER 2');
      remoteName = cleanName(offer.name, 'PLAYER 1');
      role = 'guest';
      seed = Number(offer.seed || 1) >>> 0;
      const peer = buildPeer();
      peer.addEventListener('datachannel', event => bindChannel(event.channel), { once: true });
      await peer.setRemoteDescription(offer.desc);
      await peer.setLocalDescription(await peer.createAnswer());
      await waitForIce(peer);
      const answer = encode(prefix, {
        v: VERSION,
        g: gameId,
        kind: 'answer',
        desc: peer.localDescription,
        name: localName
      });
      startTimeout();
      notifyRemoteName();
      notifyState('answer-ready');
      return answer;
    }

    async function applyAnswer(answerCode) {
      if (!pc || role !== 'host') throw new Error('Create a Host QR first.');
      const answer = decode(prefix, answerCode);
      if (answer.kind !== 'answer' || !answer.desc || answer.g !== gameId) throw new Error('Invalid Response QR for this game.');
      remoteName = cleanName(answer.name, 'PLAYER 2');
      notifyRemoteName();
      await pc.setRemoteDescription(answer.desc);
      startTimeout();
      notifyState('connecting');
      return true;
    }

    return {
      createOffer,
      createAnswer,
      applyAnswer,
      send,
      close: closePeer,
      setMessageHandler(handler) { messageHandler = typeof handler === 'function' ? handler : null; },
      get role() { return role; },
      get seed() { return seed; },
      get connected() { return connected; },
      get localName() { return localName; },
      get remoteName() { return remoteName; },
      get dataChannel() { return dc; }
    };
  }

  async function copyText(text) {
    const value = String(text || '');
    if (!value) return false;
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove();
      return ok;
    }
  }

  async function shareText(text, title = '2P Pairing') {
    const value = String(text || '');
    if (!value) return false;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: value });
        return true;
      } catch (error) {
        if (error?.name === 'AbortError') return false;
      }
    }
    return copyText(value);
  }

  async function openScanner(options = {}) {
    const video = options.video;
    if (!video) throw new Error('Scanner video element is missing.');
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera QR scanning is not supported by this browser. Use Share / Copy / Paste fallback.');
    }
    const acceptPrefix = String(options.acceptPrefix || 'P2P1.');
    const supported = typeof BarcodeDetector.getSupportedFormats === 'function'
      ? await BarcodeDetector.getSupportedFormats().catch(() => [])
      : ['qr_code'];
    if (supported.length && !supported.includes('qr_code')) throw new Error('QR detection is not available on this browser.');

    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    let stopped = false;
    let busy = false;
    let timer = 0;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer);
      try { video.pause(); } catch (_) {}
      try { stream.getTracks().forEach(track => track.stop()); } catch (_) {}
      video.srcObject = null;
    };

    const scan = async () => {
      if (stopped || busy) return;
      busy = true;
      try {
        const results = await detector.detect(video);
        const value = String(results?.[0]?.rawValue || '').trim();
        if (value.startsWith(acceptPrefix)) {
          stop();
          options.onCode?.(value);
          return;
        }
      } catch (_) {
      } finally {
        busy = false;
      }
      if (!stopped) timer = setTimeout(scan, 160);
    };

    timer = setTimeout(scan, 120);
    return stop;
  }


  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function createStudentInviteController(options = {}) {
    const overlay = options.overlay;
    if (!overlay) return null;
    const gameId = String(options.gameId || '').trim();
    const gameName = String(options.gameName || '2 PLAYER GAME').trim();
    let active = false;
    let inboxTimer = 0;
    let hostPollTimer = 0;
    let hostPollBusy = false;
    let pendingInvites = [];
    let hostInvite = null;

    const bridge = () => options.getBridge?.() || options.bridge || null;
    const canUse = () => Boolean(bridge()?.canUseTwoPlayerStudentInvites?.());
    const getState = () => String(options.getState?.() || 'home');
    const q = sel => overlay.querySelector(sel);

    function mount() {
      const homeCard = overlay.querySelector('[data-panel="home"] .p2p0-card');
      if (homeCard && !homeCard.querySelector('[data-p2p-student-inbox]')) {
        const inbox = document.createElement('section');
        inbox.className = 'p2p0-student-inbox';
        inbox.dataset.p2pStudentInbox = '';
        inbox.hidden = true;
        inbox.innerHTML = `
          <div class="p2p0-student-head">
            <div><small>STUDENT INVITES</small><strong>${escapeHtml(gameName)}</strong></div>
            <button class="p2p0-icon-btn" type="button" data-p2p-refresh-invites aria-label="Refresh invites">↻</button>
          </div>
          <div class="p2p0-student-list" data-p2p-invite-list><div class="p2p0-student-empty">No pending invites right now.</div></div>`;
        const actions = homeCard.querySelector('.p2p0-actions');
        if (actions) homeCard.insertBefore(inbox, actions);
        else homeCard.appendChild(inbox);
      }

      const hostCard = overlay.querySelector('[data-panel="host"] .p2p0-card');
      if (hostCard && !hostCard.querySelector('[data-p2p-student-connect]')) {
        const box = document.createElement('section');
        box.className = 'p2p0-student-connect';
        box.dataset.p2pStudentConnect = '';
        box.hidden = true;
        box.innerHTML = `
          <div class="p2p0-student-head"><div><small>QUICK CONNECT</small><strong>INVITE BY STUDENT ID</strong></div><span>🆔</span></div>
          <label class="p2p0-field"><span>PLAYER 2 STUDENT ID</span><input data-p2p-target-student maxlength="30" autocomplete="off" autocapitalize="characters" placeholder="Example: 2026-001"></label>
          <button class="p2p0-btn primary p2p0-student-send" type="button" data-p2p-send-student>SEND INVITE</button>
          <div class="p2p0-student-status" data-p2p-student-status>Player 2 should open this same game first.</div>
          <div class="p2p0-divider">OR USE QR / SHARE</div>`;
        const nameField = hostCard.querySelector('[data-host-name]')?.closest('label');
        if (nameField) nameField.insertAdjacentElement('afterend', box);
        else hostCard.prepend(box);
      }

      const inbox = q('[data-p2p-student-inbox]');
      inbox?.addEventListener('click', event => {
        const refresh = event.target.closest('[data-p2p-refresh-invites]');
        if (refresh) { refreshInvites(true); return; }
        const accept = event.target.closest('[data-p2p-accept-invite]');
        if (accept) { acceptInvite(accept.dataset.p2pAcceptInvite); return; }
        const decline = event.target.closest('[data-p2p-decline-invite]');
        if (decline) declineInvite(decline.dataset.p2pDeclineInvite);
      });
      q('[data-p2p-send-student]')?.addEventListener('click', sendInvite);
    }

    function setStudentStatus(text, error = false, ok = false) {
      const el = q('[data-p2p-student-status]');
      if (!el) return;
      el.textContent = String(text || '');
      el.classList.toggle('error', !!error);
      el.classList.toggle('ok', !!ok);
    }

    function renderAvailability() {
      const available = canUse();
      const inbox = q('[data-p2p-student-inbox]');
      const connect = q('[data-p2p-student-connect]');
      if (inbox) inbox.hidden = !available;
      if (connect) connect.hidden = !available;
      const identity = bridge()?.getPlayerIdentity?.();
      if (available && identity?.name) {
        const hostName = q('[data-host-name]');
        const guestName = q('[data-guest-name]');
        if (hostName && (!hostName.value || /^PLAYER\s*1$/i.test(hostName.value))) hostName.value = identity.name;
        if (guestName && (!guestName.value || /^PLAYER\s*2$/i.test(guestName.value))) guestName.value = identity.name;
      }
    }

    function renderInvites() {
      const list = q('[data-p2p-invite-list]');
      if (!list) return;
      if (!pendingInvites.length) {
        list.innerHTML = '<div class="p2p0-student-empty">No pending invites right now.</div>';
        return;
      }
      list.innerHTML = pendingInvites.map(invite => {
        const section = invite.fromSection ? ` · ${escapeHtml(invite.fromSection)}` : '';
        return `<article class="p2p0-student-invite-card">
          <div><strong>${escapeHtml(invite.fromName || 'Student')}</strong><small>${escapeHtml(invite.fromStudentId || '')}${section}</small><p>wants to play ${escapeHtml(gameName)}</p></div>
          <div><button class="p2p0-btn primary" type="button" data-p2p-accept-invite="${escapeHtml(invite.inviteId)}">ACCEPT</button><button class="p2p0-btn" type="button" data-p2p-decline-invite="${escapeHtml(invite.inviteId)}">DECLINE</button></div>
        </article>`;
      }).join('');
    }

    async function refreshInvites(force = false) {
      if (!active || !canUse()) return;
      if (!force && getState() !== 'home') return;
      try {
        const result = await bridge()?.listTwoPlayerInvites?.({ gameId });
        pendingInvites = Array.isArray(result?.invites) ? result.invites : [];
        renderInvites();
      } catch (error) {
        if (force) {
          const list = q('[data-p2p-invite-list]');
          if (list) list.innerHTML = `<div class="p2p0-student-empty error">${escapeHtml(error?.message || 'Could not check invites.')}</div>`;
        }
      }
    }

    function scheduleInboxPoll() {
      clearTimeout(inboxTimer);
      if (!active || !canUse()) return;
      inboxTimer = setTimeout(async function poll() {
        if (!active) return;
        if (getState() === 'home') await refreshInvites(false);
        if (active) inboxTimer = setTimeout(poll, 5000);
      }, 900);
    }

    async function sendInvite() {
      if (!active) return;
      const btn = q('[data-p2p-send-student]');
      const target = String(q('[data-p2p-target-student]')?.value || '').trim();
      if (!canUse()) { setStudentStatus('Sign in as a student to use Student ID invites.', true); return; }
      if (!target) { setStudentStatus('Enter Player 2 Student ID.', true); return; }
      if (btn) { btn.disabled = true; btn.textContent = 'SENDING…'; }
      try {
        await cancelHostInvite(true);
        setStudentStatus('Preparing invite…');
        options.showHost?.();
        const offerCode = await options.createHostOffer?.();
        if (!offerCode) throw new Error('Could not prepare the match invite.');
        const identity = bridge()?.getPlayerIdentity?.();
        const sent = await bridge()?.createTwoPlayerInvite?.({
          gameId,
          targetStudentId: target,
          offerCode,
          hostName: options.getLocalName?.() || identity?.name || 'Student'
        });
        hostInvite = sent || null;
        setStudentStatus(`Invite sent to ${sent?.targetStudentId || target}. Waiting for Player 2…`, false, true);
        startHostPolling();
        options.onInviteSent?.(sent);
      } catch (error) {
        setStudentStatus(error?.message || 'Could not send the invite.', true);
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'SEND INVITE'; }
      }
    }

    function startHostPolling() {
      clearTimeout(hostPollTimer);
      const started = Date.now();
      const poll = async () => {
        if (!active || !hostInvite || options.isConnected?.()) return;
        if (hostPollBusy) return;
        if (Date.now() - started > 90000) {
          setStudentStatus('Invite timed out. Send a new invite or use QR.', true);
          return;
        }
        hostPollBusy = true;
        try {
          const result = await bridge()?.getTwoPlayerInviteStatus?.({ gameId, ...hostInvite });
          if (result?.status === 'accepted' && result.answerCode) {
            clearTimeout(hostPollTimer);
            setStudentStatus(`${result.acceptedByName || 'Player 2'} accepted. Connecting…`, false, true);
            await options.applyHostAnswer?.(result.answerCode, result);
            return;
          }
          if (result?.status === 'declined') {
            clearTimeout(hostPollTimer);
            setStudentStatus('Player 2 declined the invite.', true);
            await cancelHostInvite(true);
            return;
          }
          if (result?.status === 'expired' || result?.status === 'missing') {
            clearTimeout(hostPollTimer);
            setStudentStatus('Invite expired. Send a new one.', true);
            return;
          }
        } catch (_) {
        } finally {
          hostPollBusy = false;
        }
        if (active && hostInvite && !options.isConnected?.()) hostPollTimer = setTimeout(poll, 2200);
      };
      hostPollTimer = setTimeout(poll, 900);
    }

    async function acceptInvite(inviteId) {
      const invite = pendingInvites.find(item => item.inviteId === inviteId);
      if (!invite || !active) return;
      const buttons = Array.from(overlay.querySelectorAll('[data-p2p-accept-invite],[data-p2p-decline-invite]')).filter(button =>
        button.dataset.p2pAcceptInvite === inviteId || button.dataset.p2pDeclineInvite === inviteId
      );
      buttons.forEach(button => { button.disabled = true; });
      try {
        options.showGuest?.();
        options.setGuestStatus?.(`Accepting ${invite.fromName || 'Player 1'}'s invite…`);
        const answerCode = await options.createGuestAnswer?.(invite.offerCode, invite);
        if (!answerCode) throw new Error('Could not prepare the response.');
        await bridge()?.respondTwoPlayerInvite?.({
          gameId,
          inviteId: invite.inviteId,
          hostUid: invite.fromUid,
          status: 'accepted',
          answerCode
        });
        options.setGuestStatus?.(`Accepted ${invite.fromName || 'Player 1'}'s invite. Connecting…`, false, true);
        pendingInvites = pendingInvites.filter(item => item.inviteId !== inviteId);
        renderInvites();
      } catch (error) {
        options.setGuestStatus?.(error?.message || 'Could not accept the invite.', true);
        buttons.forEach(button => { button.disabled = false; });
      }
    }

    async function declineInvite(inviteId) {
      const invite = pendingInvites.find(item => item.inviteId === inviteId);
      if (!invite) return;
      try {
        await bridge()?.respondTwoPlayerInvite?.({ gameId, inviteId: invite.inviteId, hostUid: invite.fromUid, status: 'declined' });
      } catch (_) {}
      pendingInvites = pendingInvites.filter(item => item.inviteId !== inviteId);
      renderInvites();
    }

    async function cancelHostInvite(silent = false) {
      clearTimeout(hostPollTimer);
      hostPollTimer = 0;
      hostPollBusy = false;
      if (!hostInvite) return;
      const current = hostInvite;
      hostInvite = null;
      try { await bridge()?.removeTwoPlayerInvite?.({ gameId, ...current }); } catch (_) {}
      if (!silent) setStudentStatus('Invite cancelled.');
    }

    function onConnected() {
      clearTimeout(hostPollTimer);
      hostPollTimer = 0;
      if (hostInvite) cancelHostInvite(true);
    }

    function start() {
      active = true;
      renderAvailability();
      if (canUse()) {
        const registration = bridge()?.ensureTwoPlayerInviteDirectory?.();
        if (registration && typeof registration.catch === 'function') registration.catch(() => {});
        refreshInvites(false);
        scheduleInboxPoll();
      }
    }

    function stop({ cleanup = true } = {}) {
      active = false;
      clearTimeout(inboxTimer);
      clearTimeout(hostPollTimer);
      inboxTimer = hostPollTimer = 0;
      hostPollBusy = false;
      if (cleanup && hostInvite) cancelHostInvite(true);
    }

    mount();
    renderAvailability();
    return Object.freeze({ start, stop, refresh: () => refreshInvites(true), onConnected, cancelHostInvite });
  }

  window.ICT8ZeroDbP2P = Object.freeze({
    version: VERSION,
    createSession,
    encode,
    decode,
    randomSeed,
    mulberry32,
    shuffle,
    copyText,
    shareText,
    openScanner,
    createStudentInviteController,
    cleanName
  });
})();
