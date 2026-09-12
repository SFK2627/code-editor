(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'code-duel';
  const SIGNAL_VERSION = 1;
  const QUESTION_COUNT = 12;
  const CONNECTION_TIMEOUT_MS = 15000;
  const FINISH_GRACE_MS = 1000;

  const QUESTIONS = Object.freeze([
    { c:'HTML', q:'Which tag creates the largest default heading?', a:['<h6>','<head>','<h1>','<title>'], k:2 },
    { c:'HTML', q:'Which tag creates a hyperlink?', a:['<a>','<link>','<href>','<nav>'], k:0 },
    { c:'HTML', q:'Which attribute gives an image its file source?', a:['href','src','alt','path'], k:1 },
    { c:'HTML', q:'Which element is semantic for site navigation links?', a:['<section>','<aside>','<nav>','<span>'], k:2 },
    { c:'HTML', q:'Which tag is used for an unordered list?', a:['<ol>','<ul>','<li>','<list>'], k:1 },
    { c:'HTML', q:'Which element is best for the main content unique to the page?', a:['<main>','<footer>','<meta>','<style>'], k:0 },
    { c:'HTML', q:'Which tag creates a line break?', a:['<br>','<lb>','<break>','<hr>'], k:0 },
    { c:'HTML', q:'Which attribute provides alternative text for an image?', a:['title','alt','name','label'], k:1 },
    { c:'HTML', q:'Which tag is used to connect an external CSS file?', a:['<script>','<css>','<link>','<style src>'], k:2 },
    { c:'HTML', q:'What belongs inside the <head> element?', a:['Main article text','Page metadata','Visible footer','Image gallery'], k:1 },
    { c:'CSS', q:'Which CSS property changes text color?', a:['font-color','text-color','color','foreground'], k:2 },
    { c:'CSS', q:'Which selector targets an element with id="hero"?', a:['.hero','#hero','hero','*hero'], k:1 },
    { c:'CSS', q:'Which selector targets elements with class="card"?', a:['#card','.card','card','@card'], k:1 },
    { c:'CSS', q:'Which property controls the space inside an element border?', a:['margin','gap','padding','outline'], k:2 },
    { c:'CSS', q:'Which property controls the space outside an element border?', a:['margin','padding','border-spacing','inset'], k:0 },
    { c:'CSS', q:'Which declaration makes a flex container?', a:['display: flex','position: flex','layout: flex','flex: display'], k:0 },
    { c:'CSS', q:'Which property rounds the corners of a box?', a:['corner-radius','border-radius','box-radius','radius'], k:1 },
    { c:'CSS', q:'Which unit is relative to the root element font size?', a:['px','vh','rem','cm'], k:2 },
    { c:'CSS', q:'Which property changes the background color?', a:['background-color','fill-color','back-color','color-background'], k:0 },
    { c:'CSS', q:'Which rule hides an element and removes it from layout?', a:['opacity: 0','visibility: hidden','display: none','hidden: true'], k:2 },
    { c:'JS', q:'Which keyword declares a block-scoped variable that can be reassigned?', a:['const','let','static','define'], k:1 },
    { c:'JS', q:'Which operator checks strict equality?', a:['=','==','===','!='], k:2 },
    { c:'JS', q:'Which method writes a message to the browser console?', a:['console.log()','print.console()','log.browser()','write.log()'], k:0 },
    { c:'JS', q:'Which value represents intentional absence of an object value?', a:['null','NaN','false','0'], k:0 },
    { c:'JS', q:'Which syntax starts a single-line comment?', a:['<!--','//','**','##'], k:1 },
    { c:'JS', q:'Which array method adds an item to the end?', a:['push()','pop()','shift()','slice()'], k:0 },
    { c:'JS', q:'Which event commonly fires when a button is pressed with a pointer?', a:['load','click','change','submit'], k:1 },
    { c:'JS', q:'Which function converts JSON text into a JavaScript value?', a:['JSON.read()','JSON.parse()','JSON.open()','JSON.stringify()'], k:1 },
    { c:'JS', q:'Which keyword exits a loop immediately?', a:['stop','return','break','exit'], k:2 },
    { c:'JS', q:'What does document.querySelector(".box") return?', a:['All matching elements','The first matching element','Only text content','A CSS rule'], k:1 },
    { c:'WEB', q:'Which part of a URL usually identifies a secure web protocol?', a:['https','www','com','html'], k:0 },
    { c:'WEB', q:'Which file extension is commonly used for JavaScript?', a:['.css','.js','.html','.javaweb'], k:1 },
    { c:'WEB', q:'Which file extension is commonly used for a stylesheet?', a:['.style','.css','.design','.sheet'], k:1 },
    { c:'WEB', q:'Responsive design mainly helps a page adapt to what?', a:['Only printers','Different screen sizes','Only dark mode','File names'], k:1 },
    { c:'HTML', q:'Which input type is intended for a password?', a:['text','secret','password','private'], k:2 },
    { c:'CSS', q:'Which media feature is commonly used to adapt styles by screen width?', a:['max-width','device-name','browser-size','screen-name'], k:0 },
    { c:'JS', q:'Which value is returned by typeof [] in JavaScript?', a:['array','list','object','collection'], k:2 },
    { c:'HTML', q:'Which element represents a self-contained article or post?', a:['<article>','<div>','<body>','<header>'], k:0 },
    { c:'CSS', q:'Which property sets the thickness of text characters?', a:['font-weight','font-thickness','text-weight','letter-bold'], k:0 },
    { c:'JS', q:'Which method prevents the browser default action for an event?', a:['event.stop()','event.preventDefault()','event.cancel()','event.block()'], k:1 }
  ]);

  const runtime = {
    built:false, open:false, bridge:null, music:null, onBack:null, onClose:null,
    overlay:null, shell:null, panels:{}, pc:null, dc:null, role:'', localName:'PLAYER 1', remoteName:'OPPONENT',
    signalSeed:0, matchSeed:0, questionOrder:[], questionIndex:0, correct:0, wrong:0, streak:0,
    remoteProgress:0, remoteWrong:0, localReady:false, remoteReady:false, state:'home',
    startedAt:0, pausedTotal:0, pauseStartedAt:0, pauseReasons:new Set(), finishTimer:0,
    finishRecords:{host:null,guest:null}, result:null, connectionTimer:0, frame:0,
    soundEnabled:true, audioContext:null, hostCode:'', answerCode:'', connected:false,
    localFinished:false, remoteFinished:false, lastFocusPause:false,
    identity:null, pendingInvites:[], invitePollTimer:0, invitePollBusy:false,
    hostInvite:null, hostInvitePollTimer:0, hostInvitePollBusy:false,
    activeInvite:null, scanStream:null, scanRaf:0, scanBusy:false, scanMode:''
  };

  const $ = (sel) => runtime.overlay?.querySelector(sel) || null;
  const $$ = (sel) => Array.from(runtime.overlay?.querySelectorAll(sel) || []);
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));

  function build(){
    if(runtime.built) return;
    const overlay=document.createElement('div');
    overlay.id='codeDuelOverlay';
    overlay.className='xp-games-game-overlay code-duel-overlay';
    overlay.hidden=true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Code Duel two-player game');
    overlay.innerHTML=`
      <section class="code-duel-shell">
        <header class="code-duel-topbar">
          <button type="button" data-cd-back>← MINI-GAMES</button>
          <div class="code-duel-brand"><span>⚔️</span><div><small>LIVE 2 PLAYER · NO XP</small><strong>CODE DUEL</strong></div></div>
          <div class="code-duel-top-actions">
            <button type="button" data-cd-sound aria-label="Toggle game sound">🔊</button>
            <button type="button" data-cd-close aria-label="Close Code Duel">×</button>
          </div>
        </header>

        <main class="code-duel-main">
          <section class="code-duel-panel is-active" data-cd-panel="home">
            <div class="code-duel-home-card">
              <span class="code-duel-hero">⚔️</span>
              <h1>CODE DUEL</h1>
              <p>Two devices. Same coding challenge sequence. First player to clear all ${QUESTION_COUNT} questions wins.</p>
              <div class="code-duel-badges"><span>👥 2 PLAYERS</span><span>⚡ WEBRTC P2P</span><span>0 XP</span></div>
              <div class="code-duel-zero-note"><b>Gameplay stays database-free.</b> Student ID mode uses RTDB only for a tiny temporary invite/offer/answer, then the live match switches to direct WebRTC. QR pairing remains the zero-RTDB fallback.</div>
              <div class="code-duel-identity" data-cd-identity hidden></div>
              <div class="code-duel-inbox" data-cd-inbox hidden>
                <div class="code-duel-inbox-head"><strong>⚔️ DUEL INVITES</strong><button type="button" data-cd-refresh-invites>REFRESH</button></div>
                <div data-cd-invite-list></div>
              </div>
              <div class="code-duel-home-actions">
                <button class="primary" type="button" data-cd-create>CREATE / INVITE</button>
                <button type="button" data-cd-join>JOIN / SCAN QR</button>
              </div>
              <small class="code-duel-network-note">Student ID invite is easiest for logged-in students. QR mode works without RTDB signaling and hides the long WebRTC code.</small>
            </div>
          </section>

          <section class="code-duel-panel" data-cd-panel="host">
            <div class="code-duel-pair-card">
              <div class="code-duel-step-head"><span>HOST</span><strong>Create a direct match</strong></div>
              <label>Your display name<input maxlength="18" autocomplete="nickname" data-cd-host-name value="PLAYER 1"></label>

              <div class="code-duel-method-card primary-method">
                <span class="code-duel-method-icon">🆔</span>
                <div><strong>SEND TO STUDENT ID</strong><small>Fast setup · temporary RTDB signaling only</small></div>
              </div>
              <label>Player 2 Student ID<input maxlength="30" autocomplete="off" autocapitalize="characters" data-cd-target-student placeholder="Example: 2026-001"></label>
              <button class="primary" type="button" data-cd-send-invite>SEND DUEL INVITE</button>
              <div class="code-duel-waiting" data-cd-host-waiting hidden><span class="code-duel-pulse-dot"></span><div><strong data-cd-host-waiting-title>Waiting for Player 2…</strong><small data-cd-host-waiting-sub>They can accept inside CODE DUEL.</small></div></div>

              <div class="code-duel-or"><span>OR</span></div>
              <div class="code-duel-method-card">
                <span class="code-duel-method-icon">📷</span>
                <div><strong>QR / SHARE PAIRING</strong><small>Zero RTDB fallback</small></div>
              </div>
              <button type="button" data-cd-make-offer>CREATE HOST QR</button>
              <div class="code-duel-qr-block" data-cd-host-qr-block hidden>
                <img data-cd-host-qr alt="CODE DUEL Host QR Code">
                <strong>PLAYER 2: SCAN THIS QR</strong>
                <small>Then scan Player 2's response QR.</small>
                <div class="code-duel-inline-actions"><button type="button" data-cd-share-host>SHARE INVITE</button><button type="button" data-cd-copy-host>COPY CODE</button></div>
                <button class="primary" type="button" data-cd-scan-answer>SCAN RESPONSE QR</button>
                <details class="code-duel-advanced"><summary>Manual paste fallback</summary><label>Player 2 Response Code<textarea spellcheck="false" data-cd-answer-input placeholder="Paste the RESPONSE CODE here"></textarea></label><button type="button" data-cd-apply-answer>CONNECT PLAYER 2</button></details>
              </div>
              <div class="code-duel-status" data-cd-host-status>Choose Student ID invite or QR pairing.</div>
              <button class="ghost" type="button" data-cd-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="code-duel-panel" data-cd-panel="guest">
            <div class="code-duel-pair-card">
              <div class="code-duel-step-head"><span>PLAYER 2</span><strong>Join a direct match</strong></div>
              <label>Your display name<input maxlength="18" autocomplete="nickname" data-cd-guest-name value="PLAYER 2"></label>
              <div class="code-duel-method-card primary-method">
                <span class="code-duel-method-icon">📷</span>
                <div><strong>SCAN HOST QR</strong><small>Zero RTDB pairing</small></div>
              </div>
              <button class="primary" type="button" data-cd-scan-offer>SCAN HOST QR</button>
              <details class="code-duel-advanced"><summary>Paste shared Host Code instead</summary><label>Host Pair Code<textarea spellcheck="false" data-cd-offer-input placeholder="Paste the HOST PAIR CODE here"></textarea></label><button type="button" data-cd-make-answer>CREATE RESPONSE</button></details>
              <div class="code-duel-qr-block" data-cd-guest-answer-block hidden>
                <img data-cd-guest-qr alt="CODE DUEL Response QR Code">
                <strong>HOST: SCAN THIS RESPONSE</strong>
                <small>Keep this screen open while the Host connects.</small>
                <div class="code-duel-inline-actions"><button type="button" data-cd-share-guest>SHARE RESPONSE</button><button type="button" data-cd-copy-guest>COPY CODE</button></div>
              </div>
              <div class="code-duel-status" data-cd-guest-status>Scan the Host QR or accept a Student ID invite from the CODE DUEL home screen.</div>
              <button class="ghost" type="button" data-cd-pair-cancel>CANCEL</button>
            </div>
          </section>

          <section class="code-duel-panel" data-cd-panel="lobby">
            <div class="code-duel-lobby-card">
              <div class="code-duel-live-pill">● DIRECT CONNECTION</div>
              <h2>DUEL LOBBY</h2>
              <div class="code-duel-versus">
                <div><span class="avatar">🧑‍💻</span><strong data-cd-local-lobby>YOU</strong><small data-cd-local-ready>NOT READY</small></div>
                <b>VS</b>
                <div><span class="avatar">🧑‍💻</span><strong data-cd-remote-lobby>OPPONENT</strong><small data-cd-remote-ready>NOT READY</small></div>
              </div>
              <p>Both players answer the same ${QUESTION_COUNT}-question coding race. Wrong answers cause a short lockout. No XP is awarded.</p>
              <button class="primary" type="button" data-cd-ready>I'M READY</button>
              <div class="code-duel-status" data-cd-lobby-status>Connected. Waiting for both players.</div>
            </div>
          </section>

          <section class="code-duel-panel" data-cd-panel="game">
            <div class="code-duel-game-wrap">
              <div class="code-duel-race">
                <div class="code-duel-racer you"><div class="code-duel-racer-meta"><strong data-cd-race-local-name>YOU</strong><span data-cd-local-score>0/${QUESTION_COUNT}</span></div><div class="track"><i data-cd-local-track></i><span class="runner" data-cd-local-runner>💻</span></div></div>
                <div class="code-duel-racer opponent"><div class="code-duel-racer-meta"><strong data-cd-race-remote-name>OPPONENT</strong><span data-cd-remote-score>0/${QUESTION_COUNT}</span></div><div class="track"><i data-cd-remote-track></i><span class="runner" data-cd-remote-runner>💻</span></div></div>
              </div>
              <div class="code-duel-game-hud"><span data-cd-question-number>QUESTION 1/${QUESTION_COUNT}</span><strong data-cd-timer>00:00.0</strong><span data-cd-streak>STREAK ×0</span></div>
              <article class="code-duel-question-card">
                <small data-cd-category>HTML</small>
                <h2 data-cd-question>Question</h2>
                <div class="code-duel-options" data-cd-options></div>
                <div class="code-duel-feedback" data-cd-feedback>Choose the correct answer.</div>
              </article>
            </div>
          </section>

          <section class="code-duel-panel" data-cd-panel="result">
            <div class="code-duel-result-card">
              <span class="code-duel-result-icon" data-cd-result-icon>🏆</span>
              <small>CODE DUEL COMPLETE</small>
              <h2 data-cd-result-title>YOU WIN!</h2>
              <p data-cd-result-sub>Great race.</p>
              <div class="code-duel-result-grid">
                <div><small>YOUR TIME</small><strong data-cd-result-time>--</strong></div>
                <div><small>MISTAKES</small><strong data-cd-result-wrong>0</strong></div>
                <div><small>OPPONENT</small><strong data-cd-result-opponent>--</strong></div>
                <div><small>REWARD</small><strong>0 XP</strong></div>
              </div>
              <div class="code-duel-result-actions"><button class="primary" type="button" data-cd-rematch>REMATCH</button><button type="button" data-cd-result-hub>MINI-GAMES</button></div>
            </div>
          </section>
        </main>

        <div class="code-duel-countdown" data-cd-countdown hidden><strong data-cd-countdown-value>3</strong><small>GET READY</small></div>
        <div class="code-duel-pause" data-cd-pause hidden><div><span>Ⅱ</span><h2>DUEL PAUSED</h2><p data-cd-pause-text>Waiting…</p><button type="button" data-cd-resume hidden>RESUME</button></div></div>
        <div class="code-duel-scanner" data-cd-scanner hidden>
          <div class="code-duel-scanner-card">
            <div class="code-duel-scan-head"><div><small>CODE DUEL</small><strong data-cd-scan-title>SCAN QR</strong></div><button type="button" data-cd-scan-close>×</button></div>
            <div class="code-duel-camera"><video data-cd-scan-video playsinline muted></video><div class="code-duel-scan-frame"></div></div>
            <p data-cd-scan-status>Point the camera at the QR code on the other device.</p>
            <button type="button" data-cd-scan-close-bottom>CANCEL SCAN</button>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay=overlay;
    runtime.shell=overlay.querySelector('.code-duel-shell');
    $$('.code-duel-panel').forEach(panel => runtime.panels[panel.dataset.cdPanel]=panel);

    $('[data-cd-back]').addEventListener('click',returnToHub);
    $('[data-cd-close]').addEventListener('click',closeAll);
    $('[data-cd-sound]').addEventListener('click',toggleSound);
    $('[data-cd-create]').addEventListener('click',()=>showPanel('host'));
    $('[data-cd-join]').addEventListener('click',()=>showPanel('guest'));
    $$('[data-cd-pair-cancel]').forEach(btn=>btn.addEventListener('click',cancelPairing));
    $('[data-cd-send-invite]').addEventListener('click',sendStudentInvite);
    $('[data-cd-make-offer]').addEventListener('click',createHostQrOffer);
    $('[data-cd-apply-answer]').addEventListener('click',()=>applyGuestAnswerCode($('[data-cd-answer-input]').value));
    $('[data-cd-make-answer]').addEventListener('click',()=>createGuestAnswerFromCode($('[data-cd-offer-input]').value,{showQr:true}));
    $('[data-cd-copy-host]').addEventListener('click',()=>copyText(runtime.hostCode,'Host Pair Code copied.'));
    $('[data-cd-share-host]').addEventListener('click',()=>shareText(runtime.hostCode,'CODE DUEL Host Pair Code'));
    $('[data-cd-copy-guest]').addEventListener('click',()=>copyText(runtime.answerCode,'Response Code copied.'));
    $('[data-cd-share-guest]').addEventListener('click',()=>shareText(runtime.answerCode,'CODE DUEL Response Code'));
    $('[data-cd-scan-offer]').addEventListener('click',()=>openQrScanner('offer'));
    $('[data-cd-scan-answer]').addEventListener('click',()=>openQrScanner('answer'));
    $('[data-cd-scan-close]').addEventListener('click',closeQrScanner);
    $('[data-cd-scan-close-bottom]').addEventListener('click',closeQrScanner);
    $('[data-cd-refresh-invites]').addEventListener('click',()=>refreshPendingInvites(true));
    $('[data-cd-invite-list]').addEventListener('click',event=>{
      const accept=event.target.closest('[data-cd-accept-invite]');
      const decline=event.target.closest('[data-cd-decline-invite]');
      if(accept) acceptStudentInvite(accept.dataset.cdAcceptInvite||'');
      if(decline) declineStudentInvite(decline.dataset.cdDeclineInvite||'');
    });
    $('[data-cd-ready]').addEventListener('click',toggleReady);
    $('[data-cd-options]').addEventListener('click',event=>{const btn=event.target.closest('[data-cd-answer]');if(btn)answerQuestion(Number(btn.dataset.cdAnswer));});
    $('[data-cd-rematch]').addEventListener('click',requestRematch);
    $('[data-cd-result-hub]').addEventListener('click',returnToHub);
    $('[data-cd-resume]').addEventListener('click',resumeLocalPause);

    overlay.addEventListener('touchmove',e=>{if(runtime.open && e.target.closest('.code-duel-main')===null)e.preventDefault();},{passive:false});
    document.addEventListener('visibilitychange',handleVisibility);
    runtime.built=true;
  }

  function showPanel(name){
    Object.entries(runtime.panels).forEach(([key,panel])=>panel.classList.toggle('is-active',key===name));
    runtime.state=name;
    if(name==='home') refreshPendingInvites(false).catch(()=>{});
  }

  function safeName(value,fallback){
    const v=String(value||'').replace(/[<>]/g,'').trim().slice(0,18);
    return v||fallback;
  }

  function randomSeed(){
    try { const a=new Uint32Array(1); crypto.getRandomValues(a); return a[0]>>>0; } catch(_){ return (Date.now()^Math.floor(Math.random()*0xffffffff))>>>0; }
  }

  function mulberry32(seed){
    let a=seed>>>0;
    return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
  }

  function questionOrder(seed){
    const arr=Array.from({length:QUESTIONS.length},(_,i)=>i);
    const rnd=mulberry32(seed||1);
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr.slice(0,QUESTION_COUNT);
  }

  function bytesToB64(bytes){
    let out=''; const chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk) out+=String.fromCharCode(...bytes.subarray(i,i+chunk));
    return btoa(out).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function b64ToBytes(text){
    let s=String(text||'').trim().replace(/-/g,'+').replace(/_/g,'/');
    while(s.length%4)s+='=';
    const bin=atob(s), bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    return bytes;
  }
  function encodeSignal(payload){return `CD1.${bytesToB64(new TextEncoder().encode(JSON.stringify(payload)))}`;}
  function decodeSignal(code){
    const raw=String(code||'').trim();
    if(!raw.startsWith('CD1.')) throw new Error('This is not a CODE DUEL pairing code.');
    const data=JSON.parse(new TextDecoder().decode(b64ToBytes(raw.slice(4))));
    if(Number(data.v)!==SIGNAL_VERSION) throw new Error('Pairing code version does not match this build.');
    return data;
  }

  async function waitForIce(pc,timeout=5500){
    if(pc.iceGatheringState==='complete') return;
    await new Promise(resolve=>{
      let done=false;
      const finish=()=>{if(done)return;done=true;pc.removeEventListener('icegatheringstatechange',onchange);clearTimeout(timer);resolve();};
      const onchange=()=>{if(pc.iceGatheringState==='complete')finish();};
      const timer=setTimeout(finish,timeout);
      pc.addEventListener('icegatheringstatechange',onchange);
    });
  }

  function createPeer(){
    disconnectPeer();
    const pc=new RTCPeerConnection({
      iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}],
      bundlePolicy:'max-bundle', iceCandidatePoolSize:2
    });
    runtime.pc=pc;
    pc.addEventListener('connectionstatechange',()=>{
      const st=pc.connectionState;
      if(st==='connected'){
        runtime.connected=true;clearTimeout(runtime.connectionTimer);setPairStatus('connected');sound('connect');
        cleanupHostInvite().catch(()=>{});
      }
      if(st==='failed'||st==='disconnected'){runtime.connected=false;if(runtime.open)setConnectionNotice(st==='failed'?'Direct connection failed. Try QR pairing or a different network.':'Opponent connection interrupted.');}
      if(st==='closed')runtime.connected=false;
    });
    pc.addEventListener('iceconnectionstatechange',()=>{
      if(pc.iceConnectionState==='failed')setConnectionNotice('Peer-to-peer connection failed. Strict school/mobile networks can block direct WebRTC.');
    });
    return pc;
  }

  function bindDataChannel(dc){
    runtime.dc=dc;
    dc.addEventListener('open',()=>{
      runtime.connected=true;
      clearTimeout(runtime.connectionTimer);
      send({t:'hello',name:runtime.localName,seed:runtime.signalSeed,role:runtime.role});
      sound('connect');
      cleanupHostInvite().catch(()=>{});
      showLobby();
    });
    dc.addEventListener('message',event=>{try{handleMessage(JSON.parse(event.data));}catch(_){}});
    dc.addEventListener('close',()=>{runtime.connected=false;if(runtime.open && runtime.state!=='home')setConnectionNotice('Opponent disconnected.');});
    dc.addEventListener('error',()=>setConnectionNotice('Data channel error. Re-pair the devices.'));
  }

  function renderIdentity(){
    runtime.identity=runtime.bridge?.getPlayerIdentity?.()||null;
    const el=$('[data-cd-identity]');
    if(!el)return;
    if(runtime.identity?.loggedIn){
      el.hidden=false;
      el.innerHTML=`<span>SIGNED IN</span><strong>${escapeText(runtime.identity.name||'Student')}</strong><small>${escapeText(runtime.identity.studentId||'')}</small>`;
    }else{
      el.hidden=false;
      el.innerHTML='<span>QR MODE</span><strong>Practice / guest session</strong><small>Log in as a student to send or receive Student ID invites.</small>';
    }
  }

  function escapeText(value=''){
    return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  async function refreshPendingInvites(force=false){
    if(!runtime.open||runtime.invitePollBusy)return;
    const can=runtime.bridge?.canUseDuelStudentInvites?.();
    const wrap=$('[data-cd-inbox]'),list=$('[data-cd-invite-list]');
    if(!can){ if(wrap)wrap.hidden=true; return; }
    runtime.invitePollBusy=true;
    try{
      const result=await runtime.bridge.listDuelInvites?.();
      runtime.pendingInvites=Array.isArray(result?.invites)?result.invites:[];
      if(!wrap||!list)return;
      wrap.hidden=false;
      if(!runtime.pendingInvites.length){
        list.innerHTML='<div class="code-duel-empty-invite">No pending invites right now.</div>';
      }else{
        list.innerHTML=runtime.pendingInvites.map(invite=>{
          const section=invite.fromSection?` · ${escapeText(invite.fromSection)}`:'';
          return `<article class="code-duel-invite-card"><div><strong>⚔️ ${escapeText(invite.fromName||'Student')}</strong><small>${escapeText(invite.fromStudentId||'')}${section}</small><p>wants to play CODE DUEL</p></div><div><button class="accept" type="button" data-cd-accept-invite="${escapeText(invite.inviteId)}">ACCEPT</button><button type="button" data-cd-decline-invite="${escapeText(invite.inviteId)}">DECLINE</button></div></article>`;
        }).join('');
      }
    }catch(error){
      if(force&&list){wrap.hidden=false;list.innerHTML=`<div class="code-duel-empty-invite error">${escapeText(error?.message||'Could not check invites.')}</div>`;}
    }finally{runtime.invitePollBusy=false;}
  }

  function startInvitePolling(){
    stopInvitePolling();
    refreshPendingInvites(false).catch(()=>{});
    runtime.invitePollTimer=setInterval(()=>{
      if(runtime.open && runtime.state==='home')refreshPendingInvites(false).catch(()=>{});
    },6000);
  }
  function stopInvitePolling(){clearInterval(runtime.invitePollTimer);runtime.invitePollTimer=0;runtime.invitePollBusy=false;}

  async function createHostOfferBase(){
    if(!window.RTCPeerConnection)throw new Error('WebRTC is not supported by this browser.');
    runtime.localName=safeName($('[data-cd-host-name]').value,runtime.identity?.name||'PLAYER 1');
    runtime.remoteName='PLAYER 2';
    runtime.signalSeed=randomSeed();
    const pc=createPeer();
    runtime.role='host';
    const dc=pc.createDataChannel('code-duel',{ordered:true});
    bindDataChannel(dc);
    await pc.setLocalDescription(await pc.createOffer());
    await waitForIce(pc);
    runtime.hostCode=encodeSignal({v:SIGNAL_VERSION,kind:'offer',desc:pc.localDescription,seed:runtime.signalSeed,name:runtime.localName});
    return runtime.hostCode;
  }

  async function sendStudentInvite(){
    const button=$('[data-cd-send-invite]');
    const target=String($('[data-cd-target-student]').value||'').trim();
    if(!runtime.bridge?.canUseDuelStudentInvites?.()){
      setHostStatus('Student ID invites require both players to be logged in. Use QR pairing instead.',true);return;
    }
    button.disabled=true;button.textContent='CREATING INVITE…';
    try{
      await cancelHostInvite(true);
      setHostStatus('Creating a direct WebRTC offer…');
      const code=await createHostOfferBase();
      setHostStatus('Sending temporary invite to the Student ID…');
      const sent=await runtime.bridge.createDuelInvite({targetStudentId:target,offerCode:code,hostName:runtime.localName});
      runtime.hostInvite={inviteId:sent.inviteId,targetUid:sent.targetUid,targetStudentId:sent.targetStudentId,expiresAtMs:sent.expiresAtMs};
      const waiting=$('[data-cd-host-waiting]');if(waiting)waiting.hidden=false;
      $('[data-cd-host-waiting-title]').textContent=`Invite sent to ${sent.targetStudentId}`;
      $('[data-cd-host-waiting-sub]').textContent='Waiting for Player 2 to accept inside CODE DUEL…';
      setHostStatus('Invite sent. Keep this screen open — the direct connection will finish automatically.');
      sound('ready');startHostInvitePolling();
    }catch(error){setHostStatus(error?.message||'Could not send the duel invite.',true);disconnectPeer();}
    finally{button.disabled=false;button.textContent='SEND DUEL INVITE';}
  }

  function startHostInvitePolling(){
    stopHostInvitePolling();
    const started=Date.now();
    const poll=async()=>{
      if(!runtime.open||!runtime.hostInvite||runtime.connected)return;
      if(runtime.hostInvitePollBusy)return;
      if(Date.now()-started>90000){setHostStatus('Invite timed out. Send a new invite or use QR pairing.',true);return;}
      runtime.hostInvitePollBusy=true;
      try{
        const result=await runtime.bridge.getDuelInviteStatus?.(runtime.hostInvite);
        if(result?.status==='accepted'&&result.answerCode){
          runtime.remoteName=safeName(result.acceptedByName,'PLAYER 2');
          $('[data-cd-host-waiting-sub]').textContent=`${runtime.remoteName} accepted. Connecting directly…`;
          stopHostInvitePolling();
          await applyGuestAnswerCode(result.answerCode,{fromInvite:true});
          return;
        }
        if(result?.status==='declined'){
          stopHostInvitePolling();setHostStatus('Player 2 declined the invite.',true);await cleanupHostInvite();return;
        }
        if(result?.status==='expired'||result?.status==='missing'){
          stopHostInvitePolling();setHostStatus('Invite expired. Send a new one.',true);return;
        }
      }catch(error){console.info('Code Duel invite poll skipped.',error);}
      finally{runtime.hostInvitePollBusy=false;}
      if(runtime.open&&runtime.hostInvite&&!runtime.connected)runtime.hostInvitePollTimer=setTimeout(poll,2500);
    };
    runtime.hostInvitePollTimer=setTimeout(poll,900);
  }
  function stopHostInvitePolling(){clearTimeout(runtime.hostInvitePollTimer);runtime.hostInvitePollTimer=0;runtime.hostInvitePollBusy=false;}

  async function acceptStudentInvite(inviteId){
    const invite=runtime.pendingInvites.find(item=>item.inviteId===inviteId);
    if(!invite)return;
    showPanel('guest');
    runtime.localName=safeName(runtime.identity?.name,'PLAYER 2');
    $('[data-cd-guest-name]').value=runtime.localName;
    setGuestStatus(`Accepting ${invite.fromName}'s invite…`);
    try{
      runtime.activeInvite=invite;
      const answer=await createGuestAnswerFromCode(invite.offerCode,{showQr:false,autoInvite:true});
      await runtime.bridge.respondDuelInvite({inviteId:invite.inviteId,hostUid:invite.fromUid,status:'accepted',answerCode:answer});
      setGuestStatus(`Accepted ${invite.fromName}'s invite. Connecting directly…`);
      startConnectionTimeout();sound('ready');
    }catch(error){setGuestStatus(error?.message||'Could not accept the invite.',true);disconnectPeer();}
  }

  async function declineStudentInvite(inviteId){
    const invite=runtime.pendingInvites.find(item=>item.inviteId===inviteId);
    if(!invite)return;
    try{await runtime.bridge.respondDuelInvite({inviteId:invite.inviteId,hostUid:invite.fromUid,status:'declined'});sound('tap');}catch(_){}
    runtime.pendingInvites=runtime.pendingInvites.filter(item=>item.inviteId!==inviteId);
    refreshPendingInvites(true).catch(()=>{});
  }

  async function createHostQrOffer(){
    const button=$('[data-cd-make-offer]');button.disabled=true;button.textContent='CREATING QR…';
    try{
      await cancelHostInvite(true);
      setHostStatus('Creating a zero-RTDB direct pairing QR…');
      const code=await createHostOfferBase();
      const dataUrl=runtime.bridge?.createQrDataUrl?.(code,360)||'';
      const block=$('[data-cd-host-qr-block]'),img=$('[data-cd-host-qr]');
      if(dataUrl&&img){img.src=dataUrl;block.hidden=false;setHostStatus('Host QR ready. Player 2 scans it, then you scan their Response QR.');}
      else{block.hidden=false;setHostStatus('QR could not be generated on this device. Use Share Invite or Copy Code.',true);}
      sound('ready');
    }catch(error){setHostStatus(error?.message||'Could not create the Host QR.',true);disconnectPeer();}
    finally{button.disabled=false;button.textContent='CREATE HOST QR';}
  }

  async function createGuestAnswerFromCode(rawCode,options={}){
    if(!window.RTCPeerConnection)throw new Error('WebRTC is not supported by this browser.');
    const offer=decodeSignal(rawCode);
    if(offer.kind!=='offer'||!offer.desc)throw new Error('The Host Pair Code is invalid.');
    runtime.localName=safeName($('[data-cd-guest-name]').value,runtime.identity?.name||'PLAYER 2');
    runtime.remoteName=safeName(offer.name,'PLAYER 1');
    runtime.signalSeed=Number(offer.seed||1)>>>0;
    const pc=createPeer();
    runtime.role='guest';
    pc.addEventListener('datachannel',event=>bindDataChannel(event.channel),{once:true});
    await pc.setRemoteDescription(offer.desc);
    await pc.setLocalDescription(await pc.createAnswer());
    await waitForIce(pc);
    runtime.answerCode=encodeSignal({v:SIGNAL_VERSION,kind:'answer',desc:pc.localDescription,name:runtime.localName});
    if(options.showQr!==false){
      const block=$('[data-cd-guest-answer-block]'),img=$('[data-cd-guest-qr]');
      const dataUrl=runtime.bridge?.createQrDataUrl?.(runtime.answerCode,360)||'';
      if(img&&dataUrl)img.src=dataUrl;
      if(block)block.hidden=false;
      setGuestStatus(dataUrl?'Response QR ready. Let the Host scan it.':'Response ready. Use Share Response or Copy Code.');
    }
    startConnectionTimeout();sound('ready');
    return runtime.answerCode;
  }

  async function applyGuestAnswerCode(rawCode,options={}){
    const button=$('[data-cd-apply-answer]');if(button){button.disabled=true;button.textContent='CONNECTING…';}
    try{
      if(!runtime.pc||runtime.role!=='host')throw new Error('Create a Host invite or QR first.');
      const answer=decodeSignal(rawCode);
      if(answer.kind!=='answer'||!answer.desc)throw new Error('The Response Code is invalid.');
      runtime.remoteName=safeName(answer.name,runtime.remoteName||'PLAYER 2');
      await runtime.pc.setRemoteDescription(answer.desc);
      setHostStatus('Connecting directly to Player 2…');
      startConnectionTimeout();
    }catch(error){setHostStatus(error?.message||'Could not connect Player 2.',true);throw error;}
    finally{if(button){button.disabled=false;button.textContent='CONNECT PLAYER 2';}}
  }

  async function createGuestAnswer(){
    const button=$('[data-cd-make-answer]');button.disabled=true;button.textContent='PREPARING…';
    try{await createGuestAnswerFromCode($('[data-cd-offer-input]').value,{showQr:true});}
    catch(error){setGuestStatus(error?.message||'Could not create the response.',true);disconnectPeer();}
    finally{button.disabled=false;button.textContent='CREATE RESPONSE';}
  }

  function startConnectionTimeout(){
    clearTimeout(runtime.connectionTimer);
    runtime.connectionTimer=setTimeout(()=>{
      if(runtime.connected)return;
      const msg='Still not connected. Both devices must stay online. If the network blocks WebRTC, try the same Wi-Fi or another network.';
      if(runtime.role==='host')setHostStatus(msg,true);else setGuestStatus(msg,true);
    },CONNECTION_TIMEOUT_MS);
  }

  function setPairStatus(kind){
    if(kind==='connected'){
      if(runtime.role==='host')setHostStatus('Connected! Opening the Duel Lobby…');
      else setGuestStatus('Connected! Opening the Duel Lobby…');
    }
  }
  function setHostStatus(text,error=false){const el=$('[data-cd-host-status]');if(el){el.textContent=text;el.classList.toggle('error',error);}}
  function setGuestStatus(text,error=false){const el=$('[data-cd-guest-status]');if(el){el.textContent=text;el.classList.toggle('error',error);}}
  function setConnectionNotice(text){
    if(runtime.state==='lobby'){const el=$('[data-cd-lobby-status]');if(el){el.textContent=text;el.classList.add('error');}}
    else if(runtime.state==='game'){showFeedback(text,'bad');pauseGame('connection');}
  }

  async function copyText(text,success){
    if(!text)return;
    let ok=false;
    try{await navigator.clipboard.writeText(text);ok=true;}catch(_){
      const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{ok=document.execCommand('copy');}catch(_){}ta.remove();
    }
    const message=ok?success:'Copy failed — use Share instead.';
    if(runtime.role==='host')setHostStatus(message,!ok);else setGuestStatus(message,!ok);
    if(ok)sound('copy');
  }

  async function shareText(text,title){
    if(!text)return;
    if(navigator.share){
      try{await navigator.share({title,text});sound('copy');return;}catch(error){if(error?.name==='AbortError')return;}
    }
    await copyText(text,`${title} copied.`);
  }

  async function openQrScanner(mode){
    closeQrScanner();
    const scanner=$('[data-cd-scanner]'),status=$('[data-cd-scan-status]'),title=$('[data-cd-scan-title]'),video=$('[data-cd-scan-video]');
    if(!scanner||!video)return;
    runtime.scanMode=mode;
    title.textContent=mode==='answer'?'SCAN RESPONSE QR':'SCAN HOST QR';
    status.textContent='Starting camera…';scanner.hidden=false;
    if(!('BarcodeDetector' in window)||!navigator.mediaDevices?.getUserMedia){
      status.textContent='Camera QR scanning is not supported by this browser. Use Share / Copy / Paste fallback.';return;
    }
    try{
      const supported=typeof BarcodeDetector.getSupportedFormats==='function' ? await BarcodeDetector.getSupportedFormats().catch(()=>[]) : ['qr_code'];
      if(supported.length&&!supported.includes('qr_code'))throw new Error('QR detection is not available.');
      const detector=new BarcodeDetector({formats:['qr_code']});
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
      runtime.scanStream=stream;video.srcObject=stream;await video.play();status.textContent='Point the camera at the QR code on the other device.';
      const scan=async()=>{
        if(!runtime.open||!runtime.scanStream||runtime.scanBusy)return;
        runtime.scanBusy=true;
        try{
          const results=await detector.detect(video);
          const value=String(results?.[0]?.rawValue||'').trim();
          if(value.startsWith('CD1.')){
            const kind=runtime.scanMode;closeQrScanner();sound('ready');
            if(kind==='offer'){
              $('[data-cd-offer-input]').value=value;
              try{await createGuestAnswerFromCode(value,{showQr:true});}catch(error){setGuestStatus(error?.message||'Could not read Host QR.',true);}
            }else{
              $('[data-cd-answer-input]').value=value;
              try{await applyGuestAnswerCode(value);}catch(_){}
            }
            return;
          }
        }catch(_){}finally{runtime.scanBusy=false;}
        if(runtime.scanStream)runtime.scanRaf=setTimeout(scan,180);
      };
      runtime.scanRaf=setTimeout(scan,120);
    }catch(error){status.textContent=error?.message||'Camera permission was not granted. Use Share / Copy / Paste fallback.';}
  }

  function closeQrScanner(){
    clearTimeout(runtime.scanRaf);runtime.scanRaf=0;runtime.scanBusy=false;
    if(runtime.scanStream){runtime.scanStream.getTracks().forEach(track=>{try{track.stop();}catch(_){}});runtime.scanStream=null;}
    const video=$('[data-cd-scan-video]');if(video){try{video.pause();}catch(_){}video.srcObject=null;}
    const scanner=$('[data-cd-scanner]');if(scanner)scanner.hidden=true;runtime.scanMode='';
  }

  async function cleanupHostInvite(){
    stopHostInvitePolling();
    const invite=runtime.hostInvite;runtime.hostInvite=null;
    const waiting=$('[data-cd-host-waiting]');if(waiting)waiting.hidden=true;
    if(invite&&runtime.bridge?.removeDuelInvite){try{await runtime.bridge.removeDuelInvite(invite);}catch(_){}}
  }

  async function cancelHostInvite(remove=true){
    stopHostInvitePolling();
    const invite=runtime.hostInvite;runtime.hostInvite=null;
    const waiting=$('[data-cd-host-waiting]');if(waiting)waiting.hidden=true;
    if(remove&&invite&&runtime.bridge?.removeDuelInvite){try{await runtime.bridge.removeDuelInvite(invite);}catch(_){}}
  }

  function cancelPairing(){
    cancelHostInvite(true).catch(()=>{});closeQrScanner();disconnectPeer();showPanel('home');
  }

  function send(payload){
    if(runtime.dc?.readyState!=='open')return false;
    try{runtime.dc.send(JSON.stringify(payload));return true;}catch(_){return false;}
  }

  function handleMessage(msg){
    if(!msg||typeof msg!=='object')return;
    switch(msg.t){
      case 'hello':
        runtime.remoteName=safeName(msg.name,runtime.role==='host'?'PLAYER 2':'PLAYER 1');
        if(runtime.role==='guest' && msg.seed)runtime.signalSeed=Number(msg.seed)>>>0;
        showLobby();
        break;
      case 'ready':
        runtime.remoteReady=Boolean(msg.ready); updateLobby(); maybeStartFromHost(); break;
      case 'start':
        if(runtime.role==='guest')beginCountdown(Number(msg.seed)||1); break;
      case 'progress':
        runtime.remoteProgress=clamp(Number(msg.progress)||0,0,QUESTION_COUNT);
        runtime.remoteWrong=Math.max(0,Number(msg.wrong)||0); updateRace(); break;
      case 'finish':
        if(runtime.role==='host')recordFinish('guest',msg); else runtime.remoteFinished=true;
        break;
      case 'result':
        applyResult(msg); break;
      case 'pause':
        pauseGame('remote',String(msg.reason||'Opponent paused.')); break;
      case 'resume':
        resumeGame('remote'); break;
      case 'rematch':
        runtime.signalSeed=Number(msg.seed)||randomSeed(); resetLobbyForRematch(); break;
      case 'rematch-request':
        if(runtime.role==='host')sendRematch(); break;
      case 'disconnect':
        setConnectionNotice('Opponent left the duel.'); break;
    }
  }

  function showLobby(){
    if(!runtime.open||!runtime.connected)return;
    runtime.localReady=false;runtime.remoteReady=false;
    showPanel('lobby');updateLobby();
  }
  function updateLobby(){
    $('[data-cd-local-lobby]').textContent=runtime.localName;
    $('[data-cd-remote-lobby]').textContent=runtime.remoteName;
    const local=$('[data-cd-local-ready]'), remote=$('[data-cd-remote-ready]');
    local.textContent=runtime.localReady?'READY ✓':'NOT READY'; local.classList.toggle('ready',runtime.localReady);
    remote.textContent=runtime.remoteReady?'READY ✓':'NOT READY'; remote.classList.toggle('ready',runtime.remoteReady);
    const btn=$('[data-cd-ready]');btn.textContent=runtime.localReady?'READY ✓':'I\'M READY';btn.classList.toggle('is-ready',runtime.localReady);
    const status=$('[data-cd-lobby-status]');
    if(runtime.localReady&&runtime.remoteReady)status.textContent=runtime.role==='host'?'Both ready — starting the duel…':'Both ready — Host is starting the duel…';
    else if(runtime.localReady)status.textContent='You are ready. Waiting for your opponent…';
    else if(runtime.remoteReady)status.textContent='Opponent is ready. Tap I\'M READY when you are set.';
    else status.textContent='Connected. Waiting for both players.';
    status.classList.remove('error');
  }
  function toggleReady(){
    if(!runtime.connected)return;
    runtime.localReady=!runtime.localReady;
    send({t:'ready',ready:runtime.localReady});sound(runtime.localReady?'ready':'tap');updateLobby();maybeStartFromHost();
  }
  function maybeStartFromHost(){
    if(runtime.role!=='host'||runtime.state!=='lobby'||!runtime.localReady||!runtime.remoteReady)return;
    runtime.localReady=false;runtime.remoteReady=false;
    const seed=randomSeed();runtime.signalSeed=seed;
    send({t:'start',seed});beginCountdown(seed);
  }

  async function beginCountdown(seed){
    runtime.matchSeed=Number(seed)||1;
    runtime.questionOrder=questionOrder(runtime.matchSeed);
    resetMatchStats();
    showPanel('game');
    updateRace();
    const layer=$('[data-cd-countdown]'); const value=$('[data-cd-countdown-value]');
    layer.hidden=false;
    for(const label of ['3','2','1','GO!']){
      value.textContent=label;sound(label==='GO!'?'go':'count');
      await wait(label==='GO!'?500:700);
      if(!runtime.open||runtime.state!=='game')return;
    }
    layer.hidden=true;
    runtime.startedAt=performance.now();runtime.pausedTotal=0;runtime.pauseReasons.clear();
    renderQuestion();startFrameLoop();
  }

  function resetMatchStats(){
    clearTimeout(runtime.finishTimer); runtime.finishTimer=0;
    runtime.questionIndex=0;runtime.correct=0;runtime.wrong=0;runtime.streak=0;runtime.remoteProgress=0;runtime.remoteWrong=0;
    runtime.finishRecords={host:null,guest:null};runtime.localFinished=false;runtime.remoteFinished=false;runtime.result=null;
    $('[data-cd-feedback]').textContent='Choose the correct answer.';$('[data-cd-feedback]').className='code-duel-feedback';
  }

  function currentQuestion(){return QUESTIONS[runtime.questionOrder[runtime.questionIndex]??0]||QUESTIONS[0];}
  function renderQuestion(){
    if(runtime.questionIndex>=QUESTION_COUNT)return;
    const q=currentQuestion();
    $('[data-cd-question-number]').textContent=`QUESTION ${runtime.questionIndex+1}/${QUESTION_COUNT}`;
    $('[data-cd-category]').textContent=q.c;
    $('[data-cd-question]').textContent=q.q;
    $('[data-cd-streak]').textContent=`STREAK ×${runtime.streak}`;
    $('[data-cd-options]').innerHTML=q.a.map((option,i)=>`<button type="button" data-cd-answer="${i}"><span>${String.fromCharCode(65+i)}</span><b>${escapeHtml(option)}</b></button>`).join('');
  }

  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function answerQuestion(index){
    if(runtime.state!=='game'||runtime.pauseReasons.size||runtime.localFinished)return;
    const buttons=$$('[data-cd-answer]');if(buttons.some(b=>b.disabled))return;
    const q=currentQuestion();const correct=index===q.k;
    runtime.music?.duck?.(correct?.42:.34,190);
    if(correct){
      runtime.correct++;runtime.streak++;
      buttons.forEach((b,i)=>{b.disabled=true;if(i===q.k)b.classList.add('correct');});
      showFeedback(runtime.streak>=3?`✓ CORRECT · STREAK ×${runtime.streak}`:'✓ CORRECT','good');sound('correct');
      runtime.questionIndex++;
      send({t:'progress',progress:runtime.questionIndex,wrong:runtime.wrong,streak:runtime.streak});updateRace();
      if(runtime.questionIndex>=QUESTION_COUNT){setTimeout(finishLocal,300);return;}
      setTimeout(()=>{if(runtime.state==='game'&&!runtime.localFinished)renderQuestion();},360);
    }else{
      runtime.wrong++;runtime.streak=0;
      buttons.forEach((b,i)=>{b.disabled=true;if(i===index)b.classList.add('wrong');if(i===q.k)b.classList.add('correct-hint');});
      $('[data-cd-streak]').textContent='STREAK ×0';showFeedback('✕ WRONG · 0.7s LOCK','bad');sound('wrong');
      send({t:'progress',progress:runtime.questionIndex,wrong:runtime.wrong,streak:0});
      setTimeout(()=>{if(runtime.state==='game'&&!runtime.pauseReasons.size&&!runtime.localFinished){buttons.forEach(b=>{b.disabled=false;b.classList.remove('wrong','correct-hint');});showFeedback('Try again.','');}},700);
    }
  }

  function showFeedback(text,kind=''){const el=$('[data-cd-feedback]');el.textContent=text;el.className=`code-duel-feedback ${kind}`;}

  function updateRace(){
    const local=clamp(runtime.questionIndex/QUESTION_COUNT*100,0,100), remote=clamp(runtime.remoteProgress/QUESTION_COUNT*100,0,100);
    $('[data-cd-local-track]').style.width=`${local}%`; $('[data-cd-remote-track]').style.width=`${remote}%`;
    $('[data-cd-local-runner]').style.left=`calc(${local}% - 15px)`; $('[data-cd-remote-runner]').style.left=`calc(${remote}% - 15px)`;
    $('[data-cd-local-score]').textContent=`${runtime.questionIndex}/${QUESTION_COUNT}`;$('[data-cd-remote-score]').textContent=`${runtime.remoteProgress}/${QUESTION_COUNT}`;
    $('[data-cd-race-local-name]').textContent=runtime.localName;$('[data-cd-race-remote-name]').textContent=runtime.remoteName;
  }

  function elapsedMs(){
    if(!runtime.startedAt)return 0;
    const end=runtime.localFinished&&runtime.finishRecords[runtime.role]?.elapsedMs?runtime.startedAt+runtime.finishRecords[runtime.role].elapsedMs+runtime.pausedTotal:performance.now();
    const activePause=runtime.pauseReasons.size&&runtime.pauseStartedAt?performance.now()-runtime.pauseStartedAt:0;
    return Math.max(0,end-runtime.startedAt-runtime.pausedTotal-activePause);
  }
  function formatTime(ms){const sec=Math.max(0,ms)/1000;const m=Math.floor(sec/60),s=sec-m*60;return `${String(m).padStart(2,'0')}:${s.toFixed(1).padStart(4,'0')}`;}
  function startFrameLoop(){
    cancelAnimationFrame(runtime.frame);
    const tick=()=>{if(!runtime.open||runtime.state!=='game')return;if(!runtime.localFinished)$('[data-cd-timer]').textContent=formatTime(elapsedMs());runtime.frame=requestAnimationFrame(tick);};
    runtime.frame=requestAnimationFrame(tick);
  }

  function finishLocal(){
    if(runtime.localFinished)return;
    runtime.localFinished=true;
    const info={elapsedMs:Math.round(elapsedMs()),wrong:runtime.wrong,correct:runtime.correct};
    showFeedback('🏁 FINISH! Waiting for duel result…','finish');sound('finish');
    $$('[data-cd-answer]').forEach(b=>b.disabled=true);
    if(runtime.role==='host')recordFinish('host',info);else send({t:'finish',...info});
  }

  function recordFinish(role,info){
    if(runtime.role!=='host'||runtime.result)return;
    runtime.finishRecords[role]={elapsedMs:Math.max(0,Number(info.elapsedMs)||0),wrong:Math.max(0,Number(info.wrong)||0),correct:Math.max(0,Number(info.correct)||0)};
    if(role==='guest')runtime.remoteFinished=true;
    clearTimeout(runtime.finishTimer);
    runtime.finishTimer=setTimeout(finalizeHostResult,FINISH_GRACE_MS);
    if(runtime.finishRecords.host&&runtime.finishRecords.guest){clearTimeout(runtime.finishTimer);runtime.finishTimer=setTimeout(finalizeHostResult,220);}
  }

  function finalizeHostResult(){
    if(runtime.result||runtime.role!=='host')return;
    const h=runtime.finishRecords.host,g=runtime.finishRecords.guest;
    if(!h&&!g)return;
    let winner='host';
    if(!h)winner='guest';
    else if(g){
      if(g.elapsedMs<h.elapsedMs)winner='guest';
      else if(g.elapsedMs===h.elapsedMs&&g.wrong<h.wrong)winner='guest';
    }
    const result={t:'result',winner,host:h,guest:g};
    runtime.result=result;send(result);applyResult(result);
  }

  function applyResult(result){
    runtime.result=result;runtime.localFinished=true;
    const myRole=runtime.role, my=result[myRole]||runtime.finishRecords[myRole]||null, opp=result[myRole==='host'?'guest':'host']||null;
    const won=result.winner===myRole;
    $('[data-cd-result-icon]').textContent=won?'🏆':'⚔️';
    $('[data-cd-result-title]').textContent=won?'YOU WIN!':'OPPONENT WINS';
    $('[data-cd-result-sub]').textContent=won?'Fast and accurate coding wins the duel.':'Rematch when you are ready.';
    $('[data-cd-result-time]').textContent=my?formatTime(my.elapsedMs):'--';
    $('[data-cd-result-wrong]').textContent=String(my?.wrong??runtime.wrong);
    $('[data-cd-result-opponent]').textContent=opp?formatTime(opp.elapsedMs):'DNF';
    showPanel('result');sound(won?'win':'lose');
  }

  function requestRematch(){
    if(!runtime.connected){setConnectionNotice('Opponent is no longer connected.');return;}
    if(runtime.role==='host')sendRematch();else{send({t:'rematch-request'});$('[data-cd-rematch]').textContent='REMATCH REQUESTED…';}
  }
  function sendRematch(){
    const seed=randomSeed();runtime.signalSeed=seed;send({t:'rematch',seed});resetLobbyForRematch();
  }
  function resetLobbyForRematch(){
    clearTimeout(runtime.finishTimer);runtime.localReady=false;runtime.remoteReady=false;runtime.result=null;runtime.localFinished=false;runtime.remoteFinished=false;
    const btn=$('[data-cd-rematch]');if(btn)btn.textContent='REMATCH';
    showPanel('lobby');updateLobby();
  }

  function pauseGame(reason,text='Duel paused.'){
    if(runtime.state!=='game')return false;
    const before=runtime.pauseReasons.size;
    runtime.pauseReasons.add(reason);
    if(!before){runtime.pauseStartedAt=performance.now();$$('[data-cd-answer]').forEach(b=>b.disabled=true);runtime.music?.pause?.();}
    $('[data-cd-pause]').hidden=false;$('[data-cd-pause-text]').textContent=text;
    const resume=$('[data-cd-resume]');resume.hidden=!(runtime.pauseReasons.has('visibility-local')||runtime.pauseReasons.has('manual-local'));
    return true;
  }
  function resumeGame(reason){
    if(!runtime.pauseReasons.has(reason))return false;
    runtime.pauseReasons.delete(reason);
    if(!runtime.pauseReasons.size){
      if(runtime.pauseStartedAt)runtime.pausedTotal+=performance.now()-runtime.pauseStartedAt;
      runtime.pauseStartedAt=0;$('[data-cd-pause]').hidden=true;runtime.music?.resume?.();
      if(!runtime.localFinished)renderQuestion();
    }else{
      $('[data-cd-pause-text]').textContent=runtime.pauseReasons.has('remote')?'Opponent is paused. Waiting…':'Duel paused.';
    }
    return true;
  }
  function pauseForExitGuard(){
    if(runtime.state!=='game'||runtime.pauseReasons.has('exit-local'))return false;
    const ok=pauseGame('exit-local','Exit confirmation open. Both players are paused.');
    if(ok)send({t:'pause',reason:'Opponent opened an exit confirmation.'});return ok;
  }
  function resumeFromExitGuard(){
    if(!runtime.pauseReasons.has('exit-local'))return false;
    resumeGame('exit-local');send({t:'resume'});return true;
  }
  function handleVisibility(){
    if(!runtime.open||runtime.state!=='game')return;
    if(document.hidden && !runtime.pauseReasons.has('visibility-local')){runtime.lastFocusPause=true;pauseGame('visibility-local','You left the game. The duel is paused.');send({t:'pause',reason:'Opponent temporarily left the game.'});}
  }
  function resumeLocalPause(){
    if(runtime.pauseReasons.has('visibility-local')){resumeGame('visibility-local');send({t:'resume'});runtime.lastFocusPause=false;}
  }

  function getAudio(){
    if(!runtime.soundEnabled)return null;
    try{if(!runtime.audioContext)runtime.audioContext=new (window.AudioContext||window.webkitAudioContext)();if(runtime.audioContext.state==='suspended')runtime.audioContext.resume().catch(()=>{});return runtime.audioContext;}catch(_){return null;}
  }
  function playTone(freq=440,dur=.1,type='sine',gain=.09,slide=0){
    const ctx=getAudio();if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,slide),now+dur);g.gain.setValueAtTime(__ict8SfxGain(gain),now);g.gain.exponentialRampToValueAtTime(.001,now+dur);o.connect(g).connect(ctx.destination);o.start(now);o.stop(now+dur+.02);
  }
  function sound(kind){
    if(!runtime.soundEnabled)return;runtime.music?.duck?.(.45,170);
    if(kind==='count')playTone(520,.08,'square',.075);
    else if(kind==='go'){playTone(780,.12,'square',.10,1100);setTimeout(()=>playTone(1040,.12,'square',.085),70);}
    else if(kind==='correct'){playTone(680,.09,'sine',.10,980);setTimeout(()=>playTone(980,.08,'sine',.075),65);}
    else if(kind==='wrong')playTone(190,.16,'sawtooth',.09,85);
    else if(kind==='ready')playTone(600,.08,'triangle',.075,820);
    else if(kind==='connect'){playTone(440,.08,'sine',.07,660);setTimeout(()=>playTone(660,.12,'sine',.08,880),80);}
    else if(kind==='finish'){playTone(700,.10,'square',.09,980);setTimeout(()=>playTone(980,.14,'square',.09,1320),90);}
    else if(kind==='win'){[660,830,990,1320].forEach((f,i)=>setTimeout(()=>playTone(f,.16,'triangle',.085),i*90));}
    else if(kind==='lose'){playTone(330,.15,'triangle',.07,220);setTimeout(()=>playTone(220,.18,'triangle',.065,140),110);}
    else playTone(520,.055,'sine',.045);
  }
  function toggleSound(){
    runtime.soundEnabled=!runtime.soundEnabled;$('[data-cd-sound]').textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);runtime.music?.setEnabled?.(runtime.soundEnabled);if(runtime.soundEnabled)sound('tap');
  }

  function wait(ms){return new Promise(r=>setTimeout(r,ms));}
  function disconnectPeer(){
    clearTimeout(runtime.connectionTimer);clearTimeout(runtime.finishTimer);cancelAnimationFrame(runtime.frame);runtime.frame=0;
    if(runtime.dc?.readyState==='open'){try{runtime.dc.send(JSON.stringify({t:'disconnect'}));}catch(_){}}
    try{runtime.dc?.close();}catch(_){}try{runtime.pc?.close();}catch(_){}
    runtime.dc=null;runtime.pc=null;runtime.connected=false;runtime.role='';runtime.pauseReasons.clear();runtime.hostCode='';runtime.answerCode='';
  }

  function resetHome(){
    closeQrScanner();
    stopHostInvitePolling();
    disconnectPeer();
    runtime.state='home';runtime.localReady=false;runtime.remoteReady=false;runtime.remoteProgress=0;runtime.result=null;runtime.activeInvite=null;
    const hostQr=$('[data-cd-host-qr-block]');if(hostQr)hostQr.hidden=true;
    const guestQr=$('[data-cd-guest-answer-block]');if(guestQr)guestQr.hidden=true;
    const waiting=$('[data-cd-host-waiting]');if(waiting)waiting.hidden=true;
    const answer=$('[data-cd-answer-input]');if(answer)answer.value='';
    const offer=$('[data-cd-offer-input]');if(offer)offer.value='';
    $('[data-cd-countdown]').hidden=true;$('[data-cd-pause]').hidden=true;
    renderIdentity();showPanel('home');
  }

  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.();}catch(_){} }
  function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.();}catch(_){} }
  function closeInternal(){
    if(!runtime.open)return;
    const bridge=runtime.bridge, pendingHostInvite=runtime.hostInvite;
    runtime.open=false;stopInvitePolling();stopHostInvitePolling();closeQrScanner();disconnectPeer();
    runtime.hostInvite=null;runtime.activeInvite=null;runtime.pendingInvites=[];
    if(pendingHostInvite&&bridge?.removeDuelInvite){bridge.removeDuelInvite(pendingHostInvite).catch(()=>{});}
    runtime.overlay.hidden=true;document.body.classList.remove('code-duel-active');runtime.music=null;runtime.bridge=null;runtime.onBack=null;runtime.onClose=null;
  }

  function open(options={}){
    build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.music=options.music||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;
    const snap=runtime.bridge?.getSnapshot?.()||{};runtime.soundEnabled=snap.soundEnabled!==false;$('[data-cd-sound]').textContent=runtime.soundEnabled?'🔊':'🔇';
    runtime.identity=runtime.bridge?.getPlayerIdentity?.()||null;
    const defaultName=safeName(runtime.identity?.name,'PLAYER 1');
    const hostName=$('[data-cd-host-name]'),guestName=$('[data-cd-guest-name]');if(hostName)hostName.value=defaultName;if(guestName)guestName.value=defaultName;
    runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('code-duel-active');resetHome();startInvitePolling();
  }

  window.ICT8CodeDuel=Object.freeze({
    open,
    close:closeInternal,
    isOpen:()=>runtime.open,
    pauseForExitGuard,
    resumeFromExitGuard
  });
})();
