(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'byte-rush';
  const MAX_DPR = 2;
  const LANES = 3;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const runtime = {
    built:false, open:false, state:'ready', bridge:null, onBack:null, onClose:null, onReward:null,
    overlay:null, shell:null, canvas:null, ctx:null, distanceEl:null, chipsEl:null, scoreEl:null,
    readyPanel:null, pausePanel:null, overPanel:null, finalDistance:null, finalBest:null, finalChips:null,
    finalXp:null, rewardNote:null, soundBtn:null, pauseBtn:null, fxEl:null,
    view:{w:720,h:640,dpr:1}, raf:0, lastFrame:0, resizeTimer:0, elapsed:0, distance:0, score:0, chips:0,
    obstaclesPassed:0, spawnClock:0, chipClock:0, roadOffset:0, items:[], lane:1, carX:0, carTargetX:0,
    swipeStart:null, round:null, bestVisible:0, soundEnabled:true, audioContext:null
  };

  function build(){
    if(runtime.built)return;
    const overlay=document.createElement('div');
    overlay.id='byteRushOverlay'; overlay.className='xp-games-game-overlay byte-rush-overlay'; overlay.hidden=true;
    overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','Byte Rush mini-game');
    overlay.innerHTML=`
      <section class="byte-rush-shell">
        <canvas class="byte-rush-canvas" tabindex="-1" aria-label="BYTE RUSH cyber highway"></canvas>
        <div class="byte-rush-topbar">
          <button type="button" data-byte-rush-back>← MINI-GAMES</button>
          <button type="button" data-byte-rush-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-byte-rush-pause aria-label="Pause BYTE RUSH">Ⅱ</button>
          <button type="button" data-byte-rush-close aria-label="Close BYTE RUSH">×</button>
        </div>
        <div class="byte-rush-hud">
          <div><small>DISTANCE</small><strong data-byte-rush-distance>0</strong></div>
          <div><small>CHIPS</small><strong data-byte-rush-chips>0</strong></div>
          <div><small>SCORE</small><strong data-byte-rush-score>0</strong></div>
        </div>
        <div class="byte-rush-fx" data-byte-rush-fx></div>

        <div class="byte-rush-panel" data-byte-rush-ready>
          <div class="byte-rush-panel-card">
            <span class="byte-rush-hero">🚗</span>
            <h2>BYTE RUSH</h2>
            <p>Dodge 404s, BUGs, ERRORs, and viruses on the cyber highway.</p>
            <div class="byte-rush-help">Desktop: ← → / A D · Phone: swipe left/right</div>
            <button class="primary" type="button" data-byte-rush-start>START</button>
          </div>
        </div>

        <div class="byte-rush-panel" data-byte-rush-pause-panel hidden>
          <div class="byte-rush-panel-card"><h2>PAUSED</h2><p>Your car is safe.</p><button class="primary" type="button" data-byte-rush-resume>RESUME</button></div>
        </div>

        <div class="byte-rush-panel" data-byte-rush-over hidden>
          <div class="byte-rush-panel-card">
            <h2>CRASHED!</h2>
            <div class="byte-rush-stats">
              <div><small>Distance</small><strong data-byte-rush-final-distance>0</strong></div>
              <div><small>Best</small><strong data-byte-rush-final-best>0</strong></div>
              <div><small>XP Chips</small><strong data-byte-rush-final-chips>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-byte-rush-final-xp>+0</strong></div>
            </div>
            <p class="byte-rush-reward-note" data-byte-rush-reward-note>Securing reward…</p>
            <div class="byte-rush-actions">
              <button class="primary" type="button" data-byte-rush-again>PLAY AGAIN</button>
              <button type="button" data-byte-rush-hub>MINI-GAMES</button>
              <button type="button" data-byte-rush-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay=overlay; runtime.shell=overlay.querySelector('.byte-rush-shell'); runtime.canvas=overlay.querySelector('.byte-rush-canvas');
    runtime.ctx=runtime.canvas.getContext('2d',{alpha:false}); runtime.distanceEl=overlay.querySelector('[data-byte-rush-distance]');
    runtime.chipsEl=overlay.querySelector('[data-byte-rush-chips]'); runtime.scoreEl=overlay.querySelector('[data-byte-rush-score]');
    runtime.readyPanel=overlay.querySelector('[data-byte-rush-ready]'); runtime.pausePanel=overlay.querySelector('[data-byte-rush-pause-panel]');
    runtime.overPanel=overlay.querySelector('[data-byte-rush-over]'); runtime.finalDistance=overlay.querySelector('[data-byte-rush-final-distance]');
    runtime.finalBest=overlay.querySelector('[data-byte-rush-final-best]'); runtime.finalChips=overlay.querySelector('[data-byte-rush-final-chips]');
    runtime.finalXp=overlay.querySelector('[data-byte-rush-final-xp]'); runtime.rewardNote=overlay.querySelector('[data-byte-rush-reward-note]');
    runtime.soundBtn=overlay.querySelector('[data-byte-rush-sound]'); runtime.pauseBtn=overlay.querySelector('[data-byte-rush-pause]'); runtime.fxEl=overlay.querySelector('[data-byte-rush-fx]');

    overlay.querySelector('[data-byte-rush-start]').addEventListener('click',startRound);
    overlay.querySelector('[data-byte-rush-resume]').addEventListener('click',resume);
    overlay.querySelector('[data-byte-rush-again]').addEventListener('click',resetReady);
    overlay.querySelector('[data-byte-rush-back]').addEventListener('click',returnToHub); overlay.querySelector('[data-byte-rush-hub]').addEventListener('click',returnToHub);
    overlay.querySelector('[data-byte-rush-close]').addEventListener('click',closeAll); overlay.querySelector('[data-byte-rush-close-result]').addEventListener('click',closeAll);
    runtime.soundBtn.addEventListener('click',toggleSound); runtime.pauseBtn.addEventListener('click',()=>runtime.state==='playing'?pause():resume());

    document.addEventListener('keydown',event=>{
      if(!runtime.open||runtime.state!=='playing')return;
      if(event.target instanceof HTMLElement&&event.target.closest('button,input,textarea,select,a'))return;
      if(['ArrowLeft','KeyA'].includes(event.code)){event.preventDefault();changeLane(-1)}
      else if(['ArrowRight','KeyD'].includes(event.code)){event.preventDefault();changeLane(1)}
    });
    runtime.canvas.addEventListener('pointerdown',event=>{if(!runtime.open)return;runtime.swipeStart={x:event.clientX,y:event.clientY,id:event.pointerId};try{runtime.canvas.setPointerCapture(event.pointerId)}catch(_){} event.preventDefault()});
    runtime.canvas.addEventListener('pointerup',event=>{if(!runtime.swipeStart||runtime.state!=='playing')return;const dx=event.clientX-runtime.swipeStart.x;const dy=event.clientY-runtime.swipeStart.y;runtime.swipeStart=null;if(Math.abs(dx)>26&&Math.abs(dx)>Math.abs(dy)*.75)changeLane(dx>0?1:-1);event.preventDefault()});
    runtime.canvas.addEventListener('pointercancel',()=>{runtime.swipeStart=null});
    overlay.addEventListener('touchmove',event=>{if(runtime.open)event.preventDefault()},{passive:false});
    document.addEventListener('visibilitychange',()=>{if(runtime.open&&document.hidden&&runtime.state==='playing')pause()});
    window.addEventListener('blur',()=>{if(runtime.open&&runtime.state==='playing')pause()});
    window.addEventListener('resize',queueResize,{passive:true}); window.addEventListener('orientationchange',()=>setTimeout(queueResize,100),{passive:true});
    runtime.built=true;
  }

  function getAudio(){if(!runtime.soundEnabled)return null;try{if(!runtime.audioContext)runtime.audioContext=new(window.AudioContext||window.webkitAudioContext)();if(runtime.audioContext.state==='suspended')runtime.audioContext.resume().catch(()=>{});return runtime.audioContext}catch(_){return null}}
  function tone(kind){const ctx=getAudio();if(!ctx)return;const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;const table={lane:[310,420,.045,.025],chip:[650,1150,.10,.055],crash:[150,60,.22,.075],near:[430,680,.07,.035]};const [from,to,dur,vol]=table[kind]||table.lane;osc.type=kind==='crash'?'sawtooth':'sine';osc.frequency.setValueAtTime(from,now);osc.frequency.exponentialRampToValueAtTime(Math.max(40,to),now+dur);gain.gain.setValueAtTime(__ict8SfxGain(vol),now);gain.gain.exponentialRampToValueAtTime(.001,now+dur);osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+dur+.02)}
  function toggleSound(){runtime.soundEnabled=!runtime.soundEnabled;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled)}
  function queueResize(){if(!runtime.open)return;clearTimeout(runtime.resizeTimer);runtime.resizeTimer=setTimeout(resizeCanvas,70)}
  function resizeCanvas(){if(!runtime.open||!runtime.ctx)return;const rect=runtime.canvas.getBoundingClientRect();const w=Math.max(300,rect.width||720),h=Math.max(400,rect.height||640),dpr=Math.max(1,Math.min(MAX_DPR,Number(devicePixelRatio||1)));runtime.canvas.width=Math.round(w*dpr);runtime.canvas.height=Math.round(h*dpr);runtime.ctx.setTransform(dpr,0,0,dpr,0,0);runtime.view={w,h,dpr};runtime.carX=laneX(runtime.lane);runtime.carTargetX=runtime.carX}

  function roadBounds(){return {left:runtime.view.w*.17,right:runtime.view.w*.83}}
  function laneX(lane){const r=roadBounds(),width=r.right-r.left,step=width/LANES;return r.left+step*(lane+.5)}
  function carSize(){return {w:clamp(runtime.view.w*.065,34,48),h:clamp(runtime.view.h*.10,54,72)}}
  function roadSpeed(){return clamp(runtime.view.h*.37+runtime.elapsed*4.4,190,560)}
  function updateHud(){runtime.distanceEl.textContent=String(Math.floor(runtime.distance));runtime.chipsEl.textContent=String(runtime.chips);runtime.scoreEl.textContent=String(runtime.score)}
  function showFx(text){runtime.fxEl.textContent=text;runtime.fxEl.classList.remove('show');void runtime.fxEl.offsetWidth;runtime.fxEl.classList.add('show')}
  function changeLane(delta){if(runtime.state!=='playing')return;const next=clamp(runtime.lane+delta,0,LANES-1);if(next===runtime.lane)return;runtime.lane=next;runtime.carTargetX=laneX(runtime.lane);tone('lane')}

  function resetReady(){runtime.state='ready';runtime.elapsed=0;runtime.distance=0;runtime.score=0;runtime.chips=0;runtime.obstaclesPassed=0;runtime.spawnClock=.9;runtime.chipClock=2.6;runtime.roadOffset=0;runtime.items=[];runtime.lane=1;runtime.carX=laneX(1);runtime.carTargetX=runtime.carX;runtime.round=null;runtime.readyPanel.hidden=false;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.pauseBtn.textContent='Ⅱ';runtime.lastFrame=performance.now();updateHud()}
  function startRound(){if(runtime.state!=='ready')return;try{runtime.round=runtime.bridge?.beginRound?.(GAME_ID)||null}catch(_){runtime.round=null}runtime.elapsed=0;runtime.distance=0;runtime.score=0;runtime.chips=0;runtime.obstaclesPassed=0;runtime.spawnClock=1.0;runtime.chipClock=2.5;runtime.items=[];runtime.lane=1;runtime.carX=laneX(1);runtime.carTargetX=runtime.carX;runtime.readyPanel.hidden=true;runtime.overPanel.hidden=true;runtime.state='playing';runtime.lastFrame=performance.now();try{runtime.canvas.focus({preventScroll:true})}catch(_){}updateHud()}
  function pause(){if(runtime.state!=='playing')return;runtime.state='paused';runtime.pausePanel.hidden=false;runtime.pauseBtn.textContent='▶'}
  function resume(){if(runtime.state!=='paused')return;runtime.state='playing';runtime.pausePanel.hidden=true;runtime.pauseBtn.textContent='Ⅱ';runtime.lastFrame=performance.now();try{runtime.canvas.focus({preventScroll:true})}catch(_){}}

  function spawnObstacle(){const labels=['404','BUG','ERROR','VIRUS'];const lane=Math.floor(Math.random()*LANES);runtime.items.push({kind:'obstacle',lane,y:-86,label:labels[Math.floor(Math.random()*labels.length)],passed:false});const progress=clamp(runtime.elapsed/90,0,1);runtime.spawnClock=(1.12-progress*.48)*(0.88+Math.random()*.28)}
  function spawnChip(){let lane=Math.floor(Math.random()*LANES);const nearest=runtime.items.find(item=>item.kind==='obstacle'&&item.y<runtime.view.h*.18);if(nearest&&nearest.lane===lane)lane=(lane+1+Math.floor(Math.random()*2))%LANES;runtime.items.push({kind:'chip',lane,y:-46,label:'XP'});runtime.chipClock=2.8+Math.random()*2.6}
  function itemRect(item){const x=laneX(item.lane),isChip=item.kind==='chip';const w=isChip?clamp(runtime.view.w*.044,26,36):clamp(runtime.view.w*.075,40,58);const h=isChip?w:clamp(runtime.view.h*.083,48,64);return{x:x-w/2,y:item.y,w,h}}
  function carRect(){const size=carSize();return{x:runtime.carX-size.w/2,y:runtime.view.h-size.h-runtime.view.h*.07,w:size.w,h:size.h}}
  function intersects(a,b,pad=4){return a.x+pad<b.x+b.w-pad&&a.x+a.w-pad>b.x+pad&&a.y+pad<b.y+b.h-pad&&a.y+a.h-pad>b.y+pad}

  function update(dt){if(runtime.state!=='playing')return;runtime.elapsed+=dt;const sp=roadSpeed();runtime.roadOffset=(runtime.roadOffset+sp*dt)%80;runtime.carTargetX=laneX(runtime.lane);runtime.carX+=(runtime.carTargetX-runtime.carX)*Math.min(1,dt*14);runtime.distance+=dt*(19+runtime.elapsed*.10);runtime.spawnClock-=dt;runtime.chipClock-=dt;if(runtime.spawnClock<=0)spawnObstacle();if(runtime.chipClock<=0)spawnChip();
    const car=carRect();
    for(const item of runtime.items){item.y+=sp*dt;const rect=itemRect(item);if(item.kind==='chip'&&!item.collected&&intersects(car,rect,2)){item.collected=true;runtime.chips+=1;tone('chip');showFx('⭐ CHIP +40');}
      if(item.kind==='obstacle'&&!item.hit&&intersects(car,rect,6)){item.hit=true;finishRound();return;}
      if(item.kind==='obstacle'&&!item.passed&&item.y>car.y+car.h){item.passed=true;runtime.obstaclesPassed+=1;if(Math.abs(item.lane-runtime.lane)===1&&Math.random()<.35){showFx('NICE DODGE!');tone('near')}}
    }
    runtime.items=runtime.items.filter(item=>!item.collected&&item.y<runtime.view.h+110);
    runtime.score=Math.max(0,Math.floor(runtime.distance)+runtime.chips*40);updateHud();
  }

  function rounded(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));else ctx.rect(x,y,w,h)}
  function drawRoad(time){const ctx=runtime.ctx,{w,h}=runtime.view,r=roadBounds();ctx.fillStyle='#050915';ctx.fillRect(0,0,w,h);const sky=ctx.createLinearGradient(0,0,w,0);sky.addColorStop(0,'#071022');sky.addColorStop(.5,'#0b1630');sky.addColorStop(1,'#071022');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);ctx.fillStyle='#101827';ctx.fillRect(r.left,0,r.right-r.left,h);ctx.strokeStyle='#22d3ee';ctx.lineWidth=3;ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(r.left,0);ctx.lineTo(r.left,h);ctx.moveTo(r.right,0);ctx.lineTo(r.right,h);ctx.stroke();ctx.globalAlpha=1;const laneW=(r.right-r.left)/LANES;ctx.strokeStyle='rgba(148,163,184,.26)';ctx.lineWidth=2;ctx.setLineDash([20,24]);ctx.lineDashOffset=runtime.roadOffset;for(let i=1;i<LANES;i++){const x=r.left+laneW*i;ctx.beginPath();ctx.moveTo(x,-80);ctx.lineTo(x,h+80);ctx.stroke()}ctx.setLineDash([]);ctx.fillStyle='rgba(34,211,238,.05)';for(let y=((time*.09)%70)-70;y<h;y+=70)ctx.fillRect(r.left,y,r.right-r.left,1)}
  function drawCar(){const ctx=runtime.ctx,r=carRect();ctx.save();ctx.shadowColor='rgba(34,211,238,.5)';ctx.shadowBlur=16;ctx.fillStyle='#06b6d4';rounded(ctx,r.x,r.y,r.w,r.h,10);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#083344';rounded(ctx,r.x+r.w*.18,r.y+r.h*.16,r.w*.64,r.h*.30,5);ctx.fill();ctx.fillStyle='#67e8f9';ctx.fillRect(r.x+r.w*.13,r.y+r.h*.72,r.w*.12,r.h*.16);ctx.fillRect(r.x+r.w*.75,r.y+r.h*.72,r.w*.12,r.h*.16);ctx.fillStyle='#f8fafc';ctx.font=`900 ${clamp(r.w*.22,9,12)}px system-ui`;ctx.textAlign='center';ctx.fillText('01',r.x+r.w/2,r.y+r.h*.61);ctx.restore()}
  function drawItem(item){const ctx=runtime.ctx,r=itemRect(item);ctx.save();if(item.kind==='chip'){ctx.shadowColor='rgba(250,204,21,.55)';ctx.shadowBlur=15;ctx.fillStyle='#facc15';rounded(ctx,r.x,r.y,r.w,r.h,9);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#713f12';ctx.font=`950 ${clamp(r.w*.26,9,12)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('XP',r.x+r.w/2,r.y+r.h/2)}else{ctx.fillStyle='#7f1d1d';rounded(ctx,r.x,r.y,r.w,r.h,8);ctx.fill();ctx.strokeStyle='#fb7185';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fecdd3';ctx.font=`900 ${clamp(r.w*.20,9,12)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.label,r.x+r.w/2,r.y+r.h/2)}ctx.restore()}
  function render(time){drawRoad(time);runtime.items.forEach(drawItem);drawCar()}
  function frame(time){runtime.raf=0;if(!runtime.open)return;const dt=clamp((time-(runtime.lastFrame||time))/1000,0,.034);runtime.lastFrame=time;update(dt);render(time);runtime.raf=requestAnimationFrame(frame)}

  async function finishRound(){if(runtime.state!=='playing')return;runtime.state='gameover';tone('crash');runtime.shell.classList.remove('impact');void runtime.shell.offsetWidth;runtime.shell.classList.add('impact');const distance=Math.floor(runtime.distance);runtime.finalDistance.textContent=String(distance);runtime.finalBest.textContent=String(Math.max(runtime.bestVisible,distance));runtime.finalChips.textContent=String(runtime.chips);runtime.finalXp.textContent='+0';runtime.rewardNote.className='byte-rush-reward-note';runtime.rewardNote.textContent=runtime.round?'Securing reward…':'Practice run — account reward unavailable.';runtime.overPanel.hidden=false;if(!runtime.round?.sessionId||!runtime.bridge?.claimRound)return;
    try{const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score:runtime.score,metrics:{distance,chips:runtime.chips,obstaclesPassed:runtime.obstaclesPassed}});const rec=result?.gameRecord||result?.gameRecords?.byteRush||{};runtime.bestVisible=Math.max(runtime.bestVisible,Number(rec.bestDistance||0),distance);runtime.finalBest.textContent=String(runtime.bestVisible);runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;
      if(result?.loginRequired){runtime.rewardNote.className='byte-rush-reward-note warn';runtime.rewardNote.textContent='Practice mode — log in as a student to earn account XP.'}
      else if(result?.syncFailed){runtime.rewardNote.className='byte-rush-reward-note warn';runtime.rewardNote.textContent='Reward saved for sync. XP will update automatically once confirmed.'}
      else if(result?.capReached&&Number(result.awardedXp||0)===0){runtime.rewardNote.className='byte-rush-reward-note warn';runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep racing for records!'}
      else{runtime.rewardNote.className='byte-rush-reward-note success';runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'No XP tier reached this run yet.'}
      try{runtime.onReward?.(result)}catch(_){}}
    catch(_){runtime.rewardNote.className='byte-rush-reward-note warn';runtime.rewardNote.textContent='Reward could not be processed. No XP was added.'}
  }

  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.()}catch(_){}}
  function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.()}catch(_){}}
  function closeInternal(){if(!runtime.open)return;runtime.open=false;runtime.overlay.hidden=true;document.body.classList.remove('byte-rush-active');if(runtime.raf)cancelAnimationFrame(runtime.raf);runtime.raf=0;runtime.state='ready';runtime.round=null;runtime.items=[];runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.swipeStart=null}
  function open(options={}){build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;runtime.onReward=typeof options.onReward==='function'?options.onReward:null;const snap=runtime.bridge?.getSnapshot?.()||{};runtime.soundEnabled=snap.soundEnabled!==false;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bestVisible=Math.max(0,Number(snap.gameRecords?.byteRush?.bestDistance||snap.bestScores?.byteRush||0));runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('byte-rush-active');requestAnimationFrame(()=>{resizeCanvas();resetReady();if(!runtime.raf)runtime.raf=requestAnimationFrame(frame)})}
  window.ICT8ByteRush=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
