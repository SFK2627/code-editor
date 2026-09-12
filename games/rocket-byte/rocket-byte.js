(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'rocket-byte';
  const MAX_DPR = 2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const runtime = {
    built:false, open:false, state:'ready', bridge:null, onBack:null, onClose:null, onReward:null,
    overlay:null, shell:null, canvas:null, ctx:null, heightEl:null, fuelEl:null, chipsEl:null,
    readyPanel:null, pausePanel:null, overPanel:null, finalHeight:null, finalBest:null, finalFuel:null,
    finalChips:null, finalXp:null, rewardNote:null, soundBtn:null, pauseBtn:null, fxEl:null,
    view:{w:620,h:760,dpr:1}, raf:0, lastFrame:0, resizeTimer:0, elapsed:0,
    height:0, fuel:100, fuelCollected:0, chips:0, obstaclesPassed:0,
    obstacleClock:0, fuelClock:0, chipClock:0, stars:[], items:[], rocketX:0, targetX:0,
    pointer:null, round:null, bestVisible:0, soundEnabled:true, audioContext:null
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'rocketByteOverlay';
    overlay.className = 'xp-games-game-overlay rocket-byte-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Rocket Byte mini-game');
    overlay.innerHTML = `
      <section class="rocket-byte-shell">
        <canvas class="rocket-byte-canvas" tabindex="-1" aria-label="ROCKET BYTE digital sky"></canvas>
        <div class="rocket-byte-topbar">
          <button type="button" data-rocket-byte-back>← MINI-GAMES</button>
          <button type="button" data-rocket-byte-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-rocket-byte-pause aria-label="Pause ROCKET BYTE">Ⅱ</button>
          <button type="button" data-rocket-byte-close aria-label="Close ROCKET BYTE">×</button>
        </div>
        <div class="rocket-byte-hud">
          <div><small>HEIGHT</small><strong data-rocket-byte-height>0</strong></div>
          <div class="fuel"><small>FUEL</small><strong data-rocket-byte-fuel>100%</strong></div>
          <div><small>CHIPS</small><strong data-rocket-byte-chips>0</strong></div>
        </div>
        <div class="rocket-byte-fuel-track" aria-hidden="true"><i data-rocket-byte-fuel-bar></i></div>
        <div class="rocket-byte-fx" data-rocket-byte-fx></div>

        <div class="rocket-byte-panel" data-rocket-byte-ready>
          <div class="rocket-byte-panel-card">
            <span class="rocket-byte-hero">🚀</span>
            <h2>ROCKET BYTE</h2>
            <p>Fly upward through the digital sky. Dodge errors, collect fuel, and climb as high as you can.</p>
            <div class="rocket-byte-help">Desktop: ← → / A D / mouse · Phone: drag or swipe left/right</div>
            <button class="primary" type="button" data-rocket-byte-start>START</button>
          </div>
        </div>

        <div class="rocket-byte-panel" data-rocket-byte-pause-panel hidden>
          <div class="rocket-byte-panel-card"><h2>PAUSED</h2><p>Your rocket is holding position.</p><button class="primary" type="button" data-rocket-byte-resume>RESUME</button></div>
        </div>

        <div class="rocket-byte-panel" data-rocket-byte-over hidden>
          <div class="rocket-byte-panel-card">
            <h2>MISSION OVER</h2>
            <div class="rocket-byte-stats">
              <div><small>Height</small><strong data-rocket-byte-final-height>0</strong></div>
              <div><small>Best</small><strong data-rocket-byte-final-best>0</strong></div>
              <div><small>Fuel Pickups</small><strong data-rocket-byte-final-fuel>0</strong></div>
              <div><small>Bonus Chips</small><strong data-rocket-byte-final-chips>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-rocket-byte-final-xp>+0</strong></div>
            </div>
            <p class="rocket-byte-reward-note" data-rocket-byte-reward-note>Checking reward…</p>
            <div class="rocket-byte-actions">
              <button class="primary" type="button" data-rocket-byte-again>PLAY AGAIN</button>
              <button type="button" data-rocket-byte-hub>MINI-GAMES</button>
              <button type="button" data-rocket-byte-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.rocket-byte-shell');
    runtime.canvas = overlay.querySelector('.rocket-byte-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha:false });
    runtime.heightEl = overlay.querySelector('[data-rocket-byte-height]');
    runtime.fuelEl = overlay.querySelector('[data-rocket-byte-fuel]');
    runtime.fuelBar = overlay.querySelector('[data-rocket-byte-fuel-bar]');
    runtime.chipsEl = overlay.querySelector('[data-rocket-byte-chips]');
    runtime.readyPanel = overlay.querySelector('[data-rocket-byte-ready]');
    runtime.pausePanel = overlay.querySelector('[data-rocket-byte-pause-panel]');
    runtime.overPanel = overlay.querySelector('[data-rocket-byte-over]');
    runtime.finalHeight = overlay.querySelector('[data-rocket-byte-final-height]');
    runtime.finalBest = overlay.querySelector('[data-rocket-byte-final-best]');
    runtime.finalFuel = overlay.querySelector('[data-rocket-byte-final-fuel]');
    runtime.finalChips = overlay.querySelector('[data-rocket-byte-final-chips]');
    runtime.finalXp = overlay.querySelector('[data-rocket-byte-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-rocket-byte-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-rocket-byte-sound]');
    runtime.pauseBtn = overlay.querySelector('[data-rocket-byte-pause]');
    runtime.fxEl = overlay.querySelector('[data-rocket-byte-fx]');

    overlay.querySelector('[data-rocket-byte-start]').addEventListener('click', startRound);
    overlay.querySelector('[data-rocket-byte-resume]').addEventListener('click', resume);
    overlay.querySelector('[data-rocket-byte-again]').addEventListener('click', resetReady);
    overlay.querySelector('[data-rocket-byte-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-rocket-byte-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-rocket-byte-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-rocket-byte-close-result]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.pauseBtn.addEventListener('click', () => runtime.state === 'playing' ? pause() : resume());

    document.addEventListener('keydown', event => {
      if (!runtime.open || runtime.state !== 'playing') return;
      if (event.target instanceof HTMLElement && event.target.closest('button,input,textarea,select,a')) return;
      if (['ArrowLeft','KeyA'].includes(event.code)) { event.preventDefault(); nudge(-1); }
      else if (['ArrowRight','KeyD'].includes(event.code)) { event.preventDefault(); nudge(1); }
    });

    runtime.canvas.addEventListener('pointerdown', event => {
      if (!runtime.open || runtime.state !== 'playing') return;
      runtime.pointer = { id:event.pointerId, x:event.clientX, startX:event.clientX };
      try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
      moveTargetToClientX(event.clientX);
      event.preventDefault();
    });
    runtime.canvas.addEventListener('pointermove', event => {
      if (!runtime.pointer || runtime.pointer.id !== event.pointerId || runtime.state !== 'playing') return;
      runtime.pointer.x = event.clientX;
      moveTargetToClientX(event.clientX);
      event.preventDefault();
    });
    runtime.canvas.addEventListener('pointerup', event => {
      if (!runtime.pointer || runtime.pointer.id !== event.pointerId) return;
      const dx = event.clientX - runtime.pointer.startX;
      if (Math.abs(dx) > 24) nudge(dx > 0 ? .45 : -.45);
      runtime.pointer = null;
      event.preventDefault();
    });
    runtime.canvas.addEventListener('pointercancel', () => { runtime.pointer = null; });
    overlay.addEventListener('touchmove', event => { if (runtime.open) event.preventDefault(); }, { passive:false });
    document.addEventListener('visibilitychange', () => { if (runtime.open && document.hidden && runtime.state === 'playing') pause(); });
    window.addEventListener('blur', () => { if (runtime.open && runtime.state === 'playing') pause(); });
    window.addEventListener('resize', queueResize, { passive:true });
    window.addEventListener('orientationchange', () => setTimeout(queueResize, 100), { passive:true });
    runtime.built = true;
  }

  function getAudio() {
    if (!runtime.soundEnabled) return null;
    try {
      if (!runtime.audioContext) runtime.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
      return runtime.audioContext;
    } catch (_) { return null; }
  }
  function tone(kind) {
    const ctx = getAudio(); if (!ctx) return;
    const osc = ctx.createOscillator(), gain = ctx.createGain(), now = ctx.currentTime;
    const table = { move:[320,430,.04,.025], fuel:[520,900,.09,.045], chip:[700,1280,.10,.05], crash:[180,65,.22,.075], boost:[420,980,.15,.055] };
    const [from,to,dur,vol] = table[kind] || table.move;
    osc.type = kind === 'crash' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + dur);
    gain.gain.setValueAtTime(__ict8SfxGain(vol), now);
    gain.gain.exponentialRampToValueAtTime(.001, now + dur);
    osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + dur + .02);
  }
  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);
  }

  function queueResize() { if (!runtime.open) return; clearTimeout(runtime.resizeTimer); runtime.resizeTimer = setTimeout(resizeCanvas, 70); }
  function resizeCanvas() {
    if (!runtime.open || !runtime.ctx) return;
    const rect = runtime.canvas.getBoundingClientRect();
    const w = Math.max(300, rect.width || 620), h = Math.max(420, rect.height || 760);
    const dpr = Math.max(1, Math.min(MAX_DPR, Number(devicePixelRatio || 1)));
    runtime.canvas.width = Math.round(w * dpr); runtime.canvas.height = Math.round(h * dpr);
    runtime.ctx.setTransform(dpr,0,0,dpr,0,0); runtime.view = { w,h,dpr };
    if (!runtime.rocketX) runtime.rocketX = w / 2;
    runtime.targetX = clamp(runtime.targetX || runtime.rocketX, rocketBounds().left, rocketBounds().right);
    runtime.rocketX = clamp(runtime.rocketX, rocketBounds().left, rocketBounds().right);
    buildStars();
  }
  function buildStars() {
    const count = Math.round(clamp(runtime.view.w * runtime.view.h / 12000, 24, 70));
    runtime.stars = Array.from({ length:count }, () => ({ x:Math.random()*runtime.view.w, y:Math.random()*runtime.view.h, s:.6+Math.random()*1.8, speed:.18+Math.random()*.55 }));
  }
  function rocketBounds() { const pad = clamp(runtime.view.w * .08, 28, 58); return { left:pad, right:runtime.view.w-pad }; }
  function rocketSize() { return { w:clamp(runtime.view.w*.075, 38, 54), h:clamp(runtime.view.h*.085, 58, 74) }; }
  function rocketRect() { const s=rocketSize(); return { x:runtime.rocketX-s.w/2, y:runtime.view.h-s.h-runtime.view.h*.075, w:s.w, h:s.h }; }
  function moveTargetToClientX(clientX) { const rect=runtime.canvas.getBoundingClientRect(); const x=(clientX-rect.left)/Math.max(1,rect.width)*runtime.view.w; const b=rocketBounds(); runtime.targetX=clamp(x,b.left,b.right); }
  function nudge(direction) { if (runtime.state!=='playing') return; const b=rocketBounds(); const step=(b.right-b.left)*.16; runtime.targetX=clamp(runtime.targetX + step*direction,b.left,b.right); tone('move'); }

  function worldSpeed() { return clamp(runtime.view.h * .29 + runtime.elapsed * 3.7, 175, 520); }
  function updateHud() {
    runtime.heightEl.textContent = String(Math.floor(runtime.height));
    runtime.fuelEl.textContent = `${Math.round(runtime.fuel)}%`;
    runtime.fuelBar.style.width = `${clamp(runtime.fuel,0,100)}%`;
    runtime.chipsEl.textContent = String(runtime.chips);
  }
  function showFx(text) { runtime.fxEl.textContent=text; runtime.fxEl.classList.remove('show'); void runtime.fxEl.offsetWidth; runtime.fxEl.classList.add('show'); }

  function resetReady() {
    runtime.state='ready'; runtime.elapsed=0; runtime.height=0; runtime.fuel=100; runtime.fuelCollected=0; runtime.chips=0; runtime.obstaclesPassed=0;
    runtime.obstacleClock=1.1; runtime.fuelClock=5.2; runtime.chipClock=3.4; runtime.items=[]; runtime.round=null;
    const b=rocketBounds(); runtime.rocketX=(b.left+b.right)/2; runtime.targetX=runtime.rocketX;
    runtime.readyPanel.hidden=false; runtime.pausePanel.hidden=true; runtime.overPanel.hidden=true; runtime.pauseBtn.textContent='Ⅱ'; runtime.lastFrame=performance.now(); updateHud();
  }
  function startRound() {
    if (runtime.state!=='ready') return;
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round=null; }
    runtime.elapsed=0; runtime.height=0; runtime.fuel=100; runtime.fuelCollected=0; runtime.chips=0; runtime.obstaclesPassed=0;
    runtime.obstacleClock=1.2; runtime.fuelClock=5.0; runtime.chipClock=3.2; runtime.items=[];
    const b=rocketBounds(); runtime.rocketX=(b.left+b.right)/2; runtime.targetX=runtime.rocketX;
    runtime.readyPanel.hidden=true; runtime.overPanel.hidden=true; runtime.state='playing'; runtime.lastFrame=performance.now();
    try { runtime.canvas.focus({ preventScroll:true }); } catch (_) {} updateHud();
  }
  function pause() { if (runtime.state!=='playing') return; runtime.state='paused'; runtime.pausePanel.hidden=false; runtime.pauseBtn.textContent='▶'; }
  function resume() { if (runtime.state!=='paused') return; runtime.state='playing'; runtime.pausePanel.hidden=true; runtime.pauseBtn.textContent='Ⅱ'; runtime.lastFrame=performance.now(); try { runtime.canvas.focus({preventScroll:true}); } catch (_) {} }

  function spawnObstacle() {
    const types=['SERVER','ERROR','ASTEROID']; const type=types[Math.floor(Math.random()*types.length)];
    const w=clamp(runtime.view.w*(type==='SERVER'?.085:.065),34,58), h=clamp(runtime.view.h*(type==='SERVER'?.075:.055),34,58);
    const x=clamp(30+Math.random()*(runtime.view.w-60),w/2+8,runtime.view.w-w/2-8);
    runtime.items.push({kind:'obstacle',type,x,y:-h-15,w,h,passed:false,drift:(Math.random()-.5)*26});
    const progress=clamp(runtime.elapsed/95,0,1); runtime.obstacleClock=(1.10-progress*.42)*(0.86+Math.random()*.30);
  }
  function spawnFuel() {
    const x=clamp(40+Math.random()*(runtime.view.w-80),35,runtime.view.w-35);
    runtime.items.push({kind:'fuel',x,y:-42,w:34,h:34}); runtime.fuelClock=5.4+Math.random()*3.0;
  }
  function spawnChip() {
    const x=clamp(40+Math.random()*(runtime.view.w-80),34,runtime.view.w-34);
    runtime.items.push({kind:'chip',x,y:-38,w:30,h:30}); runtime.chipClock=3.6+Math.random()*3.8;
  }
  function itemRect(item) { return {x:item.x-item.w/2,y:item.y,w:item.w,h:item.h}; }
  function intersects(a,b,pad=3) { return a.x+pad<b.x+b.w-pad&&a.x+a.w-pad>b.x+pad&&a.y+pad<b.y+b.h-pad&&a.y+a.h-pad>b.y+pad; }

  function update(dt) {
    if (runtime.state!=='playing') return;
    runtime.elapsed += dt;
    const speed = worldSpeed();
    runtime.rocketX += (runtime.targetX-runtime.rocketX)*Math.min(1,dt*11.5);
    runtime.height += dt*(22+runtime.elapsed*.075);
    runtime.fuel = Math.max(0, runtime.fuel-dt*(2.15+runtime.elapsed*.003));
    runtime.obstacleClock -= dt; runtime.fuelClock -= dt; runtime.chipClock -= dt;
    if(runtime.obstacleClock<=0)spawnObstacle(); if(runtime.fuelClock<=0)spawnFuel(); if(runtime.chipClock<=0)spawnChip();
    if(runtime.fuel<=0){showFx('OUT OF FUEL'); finishRound(); return;}

    const rocket=rocketRect();
    for(const item of runtime.items){
      item.y += speed*dt*(item.kind==='obstacle'?1:0.92);
      if(item.kind==='obstacle') item.x=clamp(item.x+item.drift*dt,item.w/2+4,runtime.view.w-item.w/2-4);
      const rect=itemRect(item);
      if(item.kind==='obstacle'&&!item.hit&&intersects(rocket,rect,6)){item.hit=true;finishRound();return;}
      if(item.kind==='fuel'&&!item.collected&&intersects(rocket,rect,2)){item.collected=true;runtime.fuelCollected+=1;runtime.fuel=Math.min(100,runtime.fuel+26);tone('fuel');showFx('⛽ FUEL +26');}
      if(item.kind==='chip'&&!item.collected&&intersects(rocket,rect,2)){item.collected=true;runtime.chips+=1;tone('chip');showFx(runtime.chips%10===0?'🚀 ROCKET BOOST!':'⭐ BONUS CHIP');}
      if(item.kind==='obstacle'&&!item.passed&&item.y>rocket.y+rocket.h){item.passed=true;runtime.obstaclesPassed+=1;if(runtime.obstaclesPassed%8===0){tone('boost');showFx(`COMBO x${runtime.obstaclesPassed}`);}}
    }
    runtime.items=runtime.items.filter(item=>!item.collected&&item.y<runtime.view.h+100);
    updateHud();
  }

  function rounded(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));else ctx.rect(x,y,w,h)}
  function drawBackground(time){
    const ctx=runtime.ctx,{w,h}=runtime.view; const grad=ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0,'#07152f');grad.addColorStop(.55,'#10224b');grad.addColorStop(1,'#050a18');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(56,189,248,.07)';ctx.lineWidth=1;const step=48;const offset=(time*.025)%step;for(let x=offset-step;x<w+step;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=offset-step;y<h+step;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.fillStyle='rgba(186,230,253,.75)';for(const s of runtime.stars){const y=(s.y+(time*.06*s.speed))%h;ctx.globalAlpha=.35+s.speed*.45;ctx.fillRect(s.x,y,s.s,s.s)}ctx.globalAlpha=1;
  }
  function drawRocket(){
    const ctx=runtime.ctx,r=rocketRect();ctx.save();ctx.shadowColor='rgba(56,189,248,.6)';ctx.shadowBlur=18;ctx.fillStyle='#e2e8f0';
    ctx.beginPath();ctx.moveTo(r.x+r.w/2,r.y);ctx.lineTo(r.x+r.w*.88,r.y+r.h*.56);ctx.lineTo(r.x+r.w*.72,r.y+r.h*.84);ctx.lineTo(r.x+r.w*.28,r.y+r.h*.84);ctx.lineTo(r.x+r.w*.12,r.y+r.h*.56);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    ctx.fillStyle='#0ea5e9';rounded(ctx,r.x+r.w*.28,r.y+r.h*.30,r.w*.44,r.h*.26,8);ctx.fill();ctx.fillStyle='#7dd3fc';rounded(ctx,r.x+r.w*.37,r.y+r.h*.36,r.w*.26,r.h*.13,6);ctx.fill();
    const flame=8+Math.sin(performance.now()*.025)*4;ctx.fillStyle='#f97316';ctx.beginPath();ctx.moveTo(r.x+r.w*.36,r.y+r.h*.82);ctx.lineTo(r.x+r.w*.50,r.y+r.h+flame);ctx.lineTo(r.x+r.w*.64,r.y+r.h*.82);ctx.closePath();ctx.fill();ctx.fillStyle='#facc15';ctx.beginPath();ctx.moveTo(r.x+r.w*.43,r.y+r.h*.82);ctx.lineTo(r.x+r.w*.50,r.y+r.h+flame*.62);ctx.lineTo(r.x+r.w*.57,r.y+r.h*.82);ctx.closePath();ctx.fill();ctx.restore();
  }
  function drawItem(item){
    const ctx=runtime.ctx,r=itemRect(item);ctx.save();
    if(item.kind==='fuel'){ctx.shadowColor='rgba(34,197,94,.5)';ctx.shadowBlur=14;ctx.fillStyle='#22c55e';rounded(ctx,r.x,r.y,r.w,r.h,9);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#052e16';ctx.font=`900 ${clamp(r.w*.34,10,13)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('F',r.x+r.w/2,r.y+r.h/2);}
    else if(item.kind==='chip'){ctx.shadowColor='rgba(250,204,21,.55)';ctx.shadowBlur=14;ctx.fillStyle='#facc15';rounded(ctx,r.x,r.y,r.w,r.h,9);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#713f12';ctx.font=`950 ${clamp(r.w*.25,8,11)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('XP',r.x+r.w/2,r.y+r.h/2);}
    else {ctx.fillStyle=item.type==='ASTEROID'?'#475569':'#7f1d1d';rounded(ctx,r.x,r.y,r.w,r.h,10);ctx.fill();ctx.strokeStyle=item.type==='ASTEROID'?'#94a3b8':'#fb7185';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#f8fafc';ctx.font=`900 ${clamp(r.w*.18,8,11)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.type==='ASTEROID'?'☄':item.type,r.x+r.w/2,r.y+r.h/2);}
    ctx.restore();
  }
  function render(time){drawBackground(time);runtime.items.forEach(drawItem);drawRocket();}
  function frame(time){runtime.raf=0;if(!runtime.open)return;const dt=clamp((time-(runtime.lastFrame||time))/1000,0,.034);runtime.lastFrame=time;update(dt);render(time);runtime.raf=requestAnimationFrame(frame);}

  async function finishRound(){
    if(runtime.state!=='playing')return;runtime.state='gameover';tone('crash');runtime.shell.classList.remove('impact');void runtime.shell.offsetWidth;runtime.shell.classList.add('impact');
    const height=Math.floor(runtime.height);runtime.finalHeight.textContent=String(height);runtime.finalBest.textContent=String(Math.max(runtime.bestVisible,height));runtime.finalFuel.textContent=String(runtime.fuelCollected);runtime.finalChips.textContent=String(runtime.chips);runtime.finalXp.textContent='+0';runtime.rewardNote.className='rocket-byte-reward-note';runtime.rewardNote.textContent=runtime.round?'Checking reward…':'Practice run — account reward unavailable.';runtime.overPanel.hidden=false;
    if(!runtime.round?.sessionId||!runtime.bridge?.claimRound)return;
    try{
      const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score:height,metrics:{height,fuelCollected:runtime.fuelCollected,chips:runtime.chips,obstaclesPassed:runtime.obstaclesPassed}});
      const rec=result?.gameRecord||result?.gameRecords?.rocketByte||{};runtime.bestVisible=Math.max(runtime.bestVisible,Number(rec.bestHeight||rec.bestScore||0),height);runtime.finalBest.textContent=String(runtime.bestVisible);runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;
      if(result?.loginRequired){runtime.rewardNote.className='rocket-byte-reward-note warn';runtime.rewardNote.textContent='Practice mode — log in as a student to earn account XP.';}
      else if(result?.syncFailed){runtime.rewardNote.className='rocket-byte-reward-note warn';runtime.rewardNote.textContent='XP could not sync. No account XP was added.';}
      else if(result?.capReached&&Number(result.awardedXp||0)===0){runtime.rewardNote.className='rocket-byte-reward-note warn';runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep flying for records!';}
      else{runtime.rewardNote.className='rocket-byte-reward-note success';runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'No XP tier reached this flight yet.';}
      try{runtime.onReward?.(result)}catch(_){}
    }catch(_){runtime.rewardNote.className='rocket-byte-reward-note warn';runtime.rewardNote.textContent='Reward could not be processed. No XP was added.';}
  }

  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.()}catch(_){}}
  function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.()}catch(_){}}
  function closeInternal(){if(!runtime.open)return;runtime.open=false;runtime.overlay.hidden=true;document.body.classList.remove('rocket-byte-active');if(runtime.raf)cancelAnimationFrame(runtime.raf);runtime.raf=0;runtime.state='ready';runtime.round=null;runtime.items=[];runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.pointer=null;}
  function open(options={}){build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;runtime.onReward=typeof options.onReward==='function'?options.onReward:null;const snap=runtime.bridge?.getSnapshot?.()||{};runtime.soundEnabled=snap.soundEnabled!==false;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bestVisible=Math.max(0,Number(snap.gameRecords?.rocketByte?.bestHeight||snap.gameRecords?.rocketByte?.bestScore||snap.bestScores?.rocketByte||0));runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('rocket-byte-active');requestAnimationFrame(()=>{resizeCanvas();resetReady();if(!runtime.raf)runtime.raf=requestAnimationFrame(frame);});}

  window.ICT8RocketByte=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
