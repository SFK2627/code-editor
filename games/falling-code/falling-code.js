(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'falling-code';
  const MAX_DPR = 2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const runtime = {
    built:false,open:false,state:'ready',bridge:null,onBack:null,onClose:null,onReward:null,
    overlay:null,shell:null,canvas:null,ctx:null,depthEl:null,gatesEl:null,readyPanel:null,pausePanel:null,overPanel:null,
    finalDepth:null,finalBest:null,finalGates:null,finalXp:null,rewardNote:null,soundBtn:null,pauseBtn:null,fxEl:null,
    view:{w:650,h:760,dpr:1},raf:0,lastFrame:0,resizeTimer:0,elapsed:0,depth:0,gatesPassed:0,
    barriers:[],spawnClock:0,playerX:0,targetX:0,pointer:null,lastGapX:0,round:null,bestVisible:0,soundEnabled:true,audioContext:null,gridOffset:0
  };

  function build(){
    if(runtime.built)return;
    const overlay=document.createElement('div');overlay.id='fallingCodeOverlay';overlay.className='xp-games-game-overlay falling-code-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Falling Code mini-game');
    overlay.innerHTML=`
      <section class="falling-code-shell">
        <canvas class="falling-code-canvas" tabindex="-1" aria-label="FALLING CODE digital shaft"></canvas>
        <div class="falling-code-topbar">
          <button type="button" data-falling-code-back>← MINI-GAMES</button>
          <button type="button" data-falling-code-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-falling-code-pause aria-label="Pause FALLING CODE">Ⅱ</button>
          <button type="button" data-falling-code-close aria-label="Close FALLING CODE">×</button>
        </div>
        <div class="falling-code-hud">
          <div><small>DEPTH</small><strong data-falling-code-depth>0</strong></div>
          <div><small>GAPS</small><strong data-falling-code-gates>0</strong></div>
        </div>
        <div class="falling-code-fx" data-falling-code-fx></div>

        <div class="falling-code-panel" data-falling-code-ready>
          <div class="falling-code-panel-card">
            <span class="falling-code-hero">🪂</span>
            <h2>FALLING CODE</h2>
            <p>Drop through the digital shaft. Slide into each opening before the platform reaches you.</p>
            <div class="falling-code-help">Desktop: ← → / A D / mouse · Phone: drag or swipe left/right</div>
            <button class="primary" type="button" data-falling-code-start>START</button>
          </div>
        </div>
        <div class="falling-code-panel" data-falling-code-pause-panel hidden><div class="falling-code-panel-card"><h2>PAUSED</h2><p>Your fall is frozen.</p><button class="primary" type="button" data-falling-code-resume>RESUME</button></div></div>
        <div class="falling-code-panel" data-falling-code-over hidden>
          <div class="falling-code-panel-card">
            <h2>CRASHED!</h2>
            <div class="falling-code-stats">
              <div><small>Depth</small><strong data-falling-code-final-depth>0</strong></div>
              <div><small>Best</small><strong data-falling-code-final-best>0</strong></div>
              <div><small>Gaps Passed</small><strong data-falling-code-final-gates>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-falling-code-final-xp>+0</strong></div>
            </div>
            <p class="falling-code-reward-note" data-falling-code-reward-note>Securing reward…</p>
            <div class="falling-code-actions">
              <button class="primary" type="button" data-falling-code-again>PLAY AGAIN</button>
              <button type="button" data-falling-code-hub>MINI-GAMES</button>
              <button type="button" data-falling-code-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay=overlay;runtime.shell=overlay.querySelector('.falling-code-shell');runtime.canvas=overlay.querySelector('.falling-code-canvas');runtime.ctx=runtime.canvas.getContext('2d',{alpha:false});runtime.depthEl=overlay.querySelector('[data-falling-code-depth]');runtime.gatesEl=overlay.querySelector('[data-falling-code-gates]');runtime.readyPanel=overlay.querySelector('[data-falling-code-ready]');runtime.pausePanel=overlay.querySelector('[data-falling-code-pause-panel]');runtime.overPanel=overlay.querySelector('[data-falling-code-over]');runtime.finalDepth=overlay.querySelector('[data-falling-code-final-depth]');runtime.finalBest=overlay.querySelector('[data-falling-code-final-best]');runtime.finalGates=overlay.querySelector('[data-falling-code-final-gates]');runtime.finalXp=overlay.querySelector('[data-falling-code-final-xp]');runtime.rewardNote=overlay.querySelector('[data-falling-code-reward-note]');runtime.soundBtn=overlay.querySelector('[data-falling-code-sound]');runtime.pauseBtn=overlay.querySelector('[data-falling-code-pause]');runtime.fxEl=overlay.querySelector('[data-falling-code-fx]');
    overlay.querySelector('[data-falling-code-start]').addEventListener('click',startRound);overlay.querySelector('[data-falling-code-resume]').addEventListener('click',resume);overlay.querySelector('[data-falling-code-again]').addEventListener('click',resetReady);overlay.querySelector('[data-falling-code-back]').addEventListener('click',returnToHub);overlay.querySelector('[data-falling-code-hub]').addEventListener('click',returnToHub);overlay.querySelector('[data-falling-code-close]').addEventListener('click',closeAll);overlay.querySelector('[data-falling-code-close-result]').addEventListener('click',closeAll);runtime.soundBtn.addEventListener('click',toggleSound);runtime.pauseBtn.addEventListener('click',()=>runtime.state==='playing'?pause():resume());
    document.addEventListener('keydown',event=>{if(!runtime.open||runtime.state!=='playing')return;if(event.target instanceof HTMLElement&&event.target.closest('button,input,textarea,select,a'))return;if(['ArrowLeft','KeyA'].includes(event.code)){event.preventDefault();nudge(-1)}else if(['ArrowRight','KeyD'].includes(event.code)){event.preventDefault();nudge(1)}});
    runtime.canvas.addEventListener('pointerdown',event=>{if(!runtime.open||runtime.state!=='playing')return;runtime.pointer={id:event.pointerId,startX:event.clientX};try{runtime.canvas.setPointerCapture(event.pointerId)}catch(_){}moveTargetToClientX(event.clientX);event.preventDefault()});runtime.canvas.addEventListener('pointermove',event=>{if(!runtime.pointer||runtime.pointer.id!==event.pointerId||runtime.state!=='playing')return;moveTargetToClientX(event.clientX);event.preventDefault()});runtime.canvas.addEventListener('pointerup',event=>{if(!runtime.pointer||runtime.pointer.id!==event.pointerId)return;const dx=event.clientX-runtime.pointer.startX;if(Math.abs(dx)>25)nudge(dx>0?.45:-.45);runtime.pointer=null;event.preventDefault()});runtime.canvas.addEventListener('pointercancel',()=>runtime.pointer=null);overlay.addEventListener('touchmove',event=>{if(runtime.open)event.preventDefault()},{passive:false});document.addEventListener('visibilitychange',()=>{if(runtime.open&&document.hidden&&runtime.state==='playing')pause()});window.addEventListener('blur',()=>{if(runtime.open&&runtime.state==='playing')pause()});window.addEventListener('resize',queueResize,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(queueResize,100),{passive:true});runtime.built=true;
  }

  function getAudio(){if(!runtime.soundEnabled)return null;try{if(!runtime.audioContext)runtime.audioContext=new(window.AudioContext||window.webkitAudioContext)();if(runtime.audioContext.state==='suspended')runtime.audioContext.resume().catch(()=>{});return runtime.audioContext}catch(_){return null}}
  function tone(kind){const ctx=getAudio();if(!ctx)return;const osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;const table={move:[300,390,.04,.022],pass:[520,820,.075,.04],crash:[170,55,.22,.075],streak:[620,1050,.12,.045]};const [from,to,dur,vol]=table[kind]||table.move;osc.type=kind==='crash'?'sawtooth':'sine';osc.frequency.setValueAtTime(from,now);osc.frequency.exponentialRampToValueAtTime(Math.max(40,to),now+dur);gain.gain.setValueAtTime(__ict8SfxGain(vol),now);gain.gain.exponentialRampToValueAtTime(.001,now+dur);osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+dur+.02)}
  function toggleSound(){runtime.soundEnabled=!runtime.soundEnabled;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled)}
  function queueResize(){if(!runtime.open)return;clearTimeout(runtime.resizeTimer);runtime.resizeTimer=setTimeout(resizeCanvas,70)}
  function resizeCanvas(){if(!runtime.open||!runtime.ctx)return;const rect=runtime.canvas.getBoundingClientRect();const w=Math.max(300,rect.width||650),h=Math.max(420,rect.height||760),dpr=Math.max(1,Math.min(MAX_DPR,Number(devicePixelRatio||1)));runtime.canvas.width=Math.round(w*dpr);runtime.canvas.height=Math.round(h*dpr);runtime.ctx.setTransform(dpr,0,0,dpr,0,0);runtime.view={w,h,dpr};const b=playerBounds();if(!runtime.playerX)runtime.playerX=(b.left+b.right)/2;runtime.playerX=clamp(runtime.playerX,b.left,b.right);runtime.targetX=clamp(runtime.targetX||runtime.playerX,b.left,b.right);runtime.lastGapX=clamp(runtime.lastGapX||w/2,w*.2,w*.8)}
  function playerBounds(){const pad=clamp(runtime.view.w*.07,26,52);return{left:pad,right:runtime.view.w-pad}}
  function playerSize(){return{w:clamp(runtime.view.w*.065,32,46),h:clamp(runtime.view.h*.055,34,46)}}
  function playerRect(){const s=playerSize();return{x:runtime.playerX-s.w/2,y:runtime.view.h*.31-s.h/2,w:s.w,h:s.h}}
  function moveTargetToClientX(clientX){const rect=runtime.canvas.getBoundingClientRect();const x=(clientX-rect.left)/Math.max(1,rect.width)*runtime.view.w;const b=playerBounds();runtime.targetX=clamp(x,b.left,b.right)}
  function nudge(direction){if(runtime.state!=='playing')return;const b=playerBounds(),step=(b.right-b.left)*.17;runtime.targetX=clamp(runtime.targetX+step*direction,b.left,b.right);tone('move')}
  function platformSpeed(){return clamp(runtime.view.h*.25+runtime.elapsed*3.4,155,480)}
  function gapWidth(){const progress=clamp(runtime.elapsed/100,0,1);return clamp(runtime.view.w*(.38-progress*.11),112,runtime.view.w*.4)}
  function updateHud(){runtime.depthEl.textContent=String(Math.floor(runtime.depth));runtime.gatesEl.textContent=String(runtime.gatesPassed)}
  function showFx(text){runtime.fxEl.textContent=text;runtime.fxEl.classList.remove('show');void runtime.fxEl.offsetWidth;runtime.fxEl.classList.add('show')}
  function resetReady(){runtime.state='ready';runtime.elapsed=0;runtime.depth=0;runtime.gatesPassed=0;runtime.barriers=[];runtime.spawnClock=.7;runtime.gridOffset=0;runtime.round=null;const b=playerBounds();runtime.playerX=(b.left+b.right)/2;runtime.targetX=runtime.playerX;runtime.lastGapX=runtime.view.w/2;runtime.readyPanel.hidden=false;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.pauseBtn.textContent='Ⅱ';runtime.lastFrame=performance.now();updateHud()}
  function startRound(){if(runtime.state!=='ready')return;try{runtime.round=runtime.bridge?.beginRound?.(GAME_ID)||null}catch(_){runtime.round=null}runtime.elapsed=0;runtime.depth=0;runtime.gatesPassed=0;runtime.barriers=[];runtime.spawnClock=.85;runtime.gridOffset=0;const b=playerBounds();runtime.playerX=(b.left+b.right)/2;runtime.targetX=runtime.playerX;runtime.lastGapX=runtime.view.w/2;runtime.readyPanel.hidden=true;runtime.overPanel.hidden=true;runtime.state='playing';runtime.lastFrame=performance.now();try{runtime.canvas.focus({preventScroll:true})}catch(_){}updateHud()}
  function pause(){if(runtime.state!=='playing')return;runtime.state='paused';runtime.pausePanel.hidden=false;runtime.pauseBtn.textContent='▶'}function resume(){if(runtime.state!=='paused')return;runtime.state='playing';runtime.pausePanel.hidden=true;runtime.pauseBtn.textContent='Ⅱ';runtime.lastFrame=performance.now();try{runtime.canvas.focus({preventScroll:true})}catch(_){}}

  function spawnBarrier(){const gapW=gapWidth();const margin=gapW/2+22;const maxShift=runtime.view.w*.28;const desired=margin+Math.random()*(runtime.view.w-margin*2);const gapX=clamp(desired,runtime.lastGapX-maxShift,runtime.lastGapX+maxShift);runtime.lastGapX=clamp(gapX,margin,runtime.view.w-margin);runtime.barriers.push({y:runtime.view.h+34,gapX:runtime.lastGapX,gapW,thick:clamp(runtime.view.h*.027,16,24),passed:false});const progress=clamp(runtime.elapsed/95,0,1);runtime.spawnClock=(1.52-progress*.47)*(0.90+Math.random()*.20)}
  function update(dt){if(runtime.state!=='playing')return;runtime.elapsed+=dt;const speed=platformSpeed();runtime.gridOffset=(runtime.gridOffset+speed*dt*.45)%44;runtime.playerX+=(runtime.targetX-runtime.playerX)*Math.min(1,dt*12.5);runtime.depth+=dt*(25+runtime.elapsed*.085);runtime.spawnClock-=dt;if(runtime.spawnClock<=0)spawnBarrier();const player=playerRect();
    for(const barrier of runtime.barriers){const oldY=barrier.y;barrier.y-=speed*dt;const top=barrier.y,bottom=barrier.y+barrier.thick;const playerMid=player.y+player.h/2;if(bottom>=player.y&&top<=player.y+player.h){const gapLeft=barrier.gapX-barrier.gapW/2,gapRight=barrier.gapX+barrier.gapW/2;const safeLeft=player.x+4>=gapLeft;const safeRight=player.x+player.w-4<=gapRight;if(!(safeLeft&&safeRight)){finishRound();return;}}
      if(!barrier.passed&&oldY>playerMid&&barrier.y<=playerMid){barrier.passed=true;runtime.gatesPassed+=1;tone('pass');if(runtime.gatesPassed%10===0){tone('streak');showFx(`🔥 DEEP DIVE x${runtime.gatesPassed}`)}else if(runtime.gatesPassed%3===0)showFx(`GAP x${runtime.gatesPassed}`)}
    }
    runtime.barriers=runtime.barriers.filter(b=>b.y>-80);updateHud();
  }

  function rounded(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));else ctx.rect(x,y,w,h)}
  function drawBackground(){const ctx=runtime.ctx,{w,h}=runtime.view;const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#100b2c');grad.addColorStop(.55,'#07172f');grad.addColorStop(1,'#03111f');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(129,140,248,.08)';ctx.lineWidth=1;for(let x=0;x<w;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=-44+runtime.gridOffset;y<h+44;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.fillStyle='rgba(103,232,249,.05)';ctx.fillRect(w*.08,0,2,h);ctx.fillRect(w*.92,0,2,h)}
  function drawBarrier(barrier){const ctx=runtime.ctx,{w}=runtime.view,gL=barrier.gapX-barrier.gapW/2,gR=barrier.gapX+barrier.gapW/2,t=barrier.thick;ctx.save();ctx.shadowColor='rgba(244,63,94,.25)';ctx.shadowBlur=12;ctx.fillStyle='#3f1230';ctx.strokeStyle='#fb7185';ctx.lineWidth=2;if(gL>0){rounded(ctx,0,barrier.y,gL,t,7);ctx.fill();ctx.stroke()}if(gR<w){rounded(ctx,gR,barrier.y,w-gR,t,7);ctx.fill();ctx.stroke()}ctx.shadowBlur=0;ctx.fillStyle='#fda4af';ctx.font=`900 ${clamp(t*.48,8,11)}px system-ui`;ctx.textBaseline='middle';if(gL>54){ctx.textAlign='right';ctx.fillText('</>',gL-10,barrier.y+t/2)}if(w-gR>54){ctx.textAlign='left';ctx.fillText('ERR',gR+10,barrier.y+t/2)}ctx.restore()}
  function drawPlayer(){const ctx=runtime.ctx,r=playerRect();ctx.save();ctx.shadowColor='rgba(34,211,238,.6)';ctx.shadowBlur=17;ctx.fillStyle='#22d3ee';rounded(ctx,r.x,r.y,r.w,r.h,10);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#083344';ctx.font=`950 ${clamp(r.w*.27,9,12)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('01',r.x+r.w/2,r.y+r.h/2);ctx.strokeStyle='rgba(186,230,253,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.x+r.w*.12,r.y-r.h*.4);ctx.lineTo(r.x+r.w*.5,r.y-r.h*.72);ctx.lineTo(r.x+r.w*.88,r.y-r.h*.4);ctx.stroke();ctx.restore()}
  function render(){drawBackground();runtime.barriers.forEach(drawBarrier);drawPlayer()}
  function frame(time){runtime.raf=0;if(!runtime.open)return;const dt=clamp((time-(runtime.lastFrame||time))/1000,0,.034);runtime.lastFrame=time;update(dt);render();runtime.raf=requestAnimationFrame(frame)}

  async function finishRound(){if(runtime.state!=='playing')return;runtime.state='gameover';tone('crash');runtime.shell.classList.remove('impact');void runtime.shell.offsetWidth;runtime.shell.classList.add('impact');const depth=Math.floor(runtime.depth);runtime.finalDepth.textContent=String(depth);runtime.finalBest.textContent=String(Math.max(runtime.bestVisible,depth));runtime.finalGates.textContent=String(runtime.gatesPassed);runtime.finalXp.textContent='+0';runtime.rewardNote.className='falling-code-reward-note';runtime.rewardNote.textContent=runtime.round?'Securing reward…':'Practice run — account reward unavailable.';runtime.overPanel.hidden=false;if(!runtime.round?.sessionId||!runtime.bridge?.claimRound)return;
    try{const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score:depth,metrics:{depth,gatesPassed:runtime.gatesPassed}});const rec=result?.gameRecord||result?.gameRecords?.fallingCode||{};runtime.bestVisible=Math.max(runtime.bestVisible,Number(rec.bestDepth||rec.bestScore||0),depth);runtime.finalBest.textContent=String(runtime.bestVisible);runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;if(result?.loginRequired){runtime.rewardNote.className='falling-code-reward-note warn';runtime.rewardNote.textContent='Practice mode — log in as a student to earn account XP.'}else if(result?.syncFailed){runtime.rewardNote.className='falling-code-reward-note warn';runtime.rewardNote.textContent='Reward saved for sync. XP will update automatically once confirmed.'}else if(result?.capReached&&Number(result.awardedXp||0)===0){runtime.rewardNote.className='falling-code-reward-note warn';runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep falling for records!'}else{runtime.rewardNote.className='falling-code-reward-note success';runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'No XP tier reached this fall yet.'}try{runtime.onReward?.(result)}catch(_){}}catch(_){runtime.rewardNote.className='falling-code-reward-note warn';runtime.rewardNote.textContent='Reward could not be processed. No XP was added.'}}
  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.()}catch(_){}}function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.()}catch(_){}}function closeInternal(){if(!runtime.open)return;runtime.open=false;runtime.overlay.hidden=true;document.body.classList.remove('falling-code-active');if(runtime.raf)cancelAnimationFrame(runtime.raf);runtime.raf=0;runtime.state='ready';runtime.round=null;runtime.barriers=[];runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.pointer=null}function open(options={}){build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;runtime.onReward=typeof options.onReward==='function'?options.onReward:null;const snap=runtime.bridge?.getSnapshot?.()||{};runtime.soundEnabled=snap.soundEnabled!==false;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bestVisible=Math.max(0,Number(snap.gameRecords?.fallingCode?.bestDepth||snap.gameRecords?.fallingCode?.bestScore||snap.bestScores?.fallingCode||0));runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('falling-code-active');requestAnimationFrame(()=>{resizeCanvas();resetReady();if(!runtime.raf)runtime.raf=requestAnimationFrame(frame)})}
  window.ICT8FallingCode=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
