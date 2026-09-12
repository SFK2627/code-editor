(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'runner-404';
  const MAX_DPR = 2;
  const runtime = {
    built:false, open:false, state:'ready', bridge:null, onBack:null, onClose:null, onReward:null,
    overlay:null, shell:null, canvas:null, ctx:null, scoreEl:null, fxEl:null, pausePanel:null, overPanel:null,
    finalScore:null, finalBest:null, finalXp:null, rewardNote:null, soundBtn:null, pauseBtn:null,
    raf:0, lastFrame:0, view:{w:820,h:500,dpr:1}, player:{x:110,y:0,vy:0,w:34,h:44,onGround:true},
    obstacles:[], particles:[], score:0, elapsed:0, distance:0, passed:0, spawnClock:0, round:null,
    bestVisible:0, soundEnabled:true, audioContext:null, resizeTimer:0
  };
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function build(){
    if(runtime.built)return;
    const overlay=document.createElement('div');
    overlay.id='runner404Overlay';
    overlay.className='xp-games-game-overlay runner404-overlay';
    overlay.hidden=true;
    overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','404 Runner mini-game');
    overlay.innerHTML=`
      <section class="runner404-shell">
        <canvas class="runner404-canvas" aria-label="404 RUNNER gameplay area"></canvas>
        <div class="runner404-topbar">
          <button type="button" data-runner404-back>← MINI-GAMES</button>
          <button type="button" data-runner404-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-runner404-pause aria-label="Pause game">Ⅱ</button>
          <button type="button" data-runner404-close aria-label="Close 404 RUNNER">×</button>
        </div>
        <div class="runner404-score" data-runner404-score>0</div>
        <div class="runner404-fx" data-runner404-fx></div>
        <div class="runner404-panel" data-runner404-pause-panel hidden>
          <div class="runner404-panel-card"><h2>PAUSED</h2><p>Your run is safe.</p><button class="primary" type="button" data-runner404-resume>RESUME</button></div>
        </div>
        <div class="runner404-panel" data-runner404-over hidden>
          <div class="runner404-panel-card">
            <h2>GAME OVER</h2>
            <p>Run it back and beat your best distance.</p>
            <div class="runner404-stats">
              <div><small>Distance Score</small><strong data-runner404-final-score>0</strong></div>
              <div><small>Best</small><strong data-runner404-final-best>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-runner404-final-xp>+0</strong></div>
            </div>
            <p class="runner404-reward-note" data-runner404-reward-note>Checking reward…</p>
            <div class="runner404-actions">
              <button class="primary" type="button" data-runner404-again>PLAY AGAIN</button>
              <button type="button" data-runner404-hub>MINI-GAMES</button>
              <button type="button" data-runner404-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay=overlay; runtime.shell=overlay.querySelector('.runner404-shell'); runtime.canvas=overlay.querySelector('.runner404-canvas');
    runtime.ctx=runtime.canvas.getContext('2d',{alpha:false}); runtime.scoreEl=overlay.querySelector('[data-runner404-score]'); runtime.fxEl=overlay.querySelector('[data-runner404-fx]');
    runtime.pausePanel=overlay.querySelector('[data-runner404-pause-panel]'); runtime.overPanel=overlay.querySelector('[data-runner404-over]');
    runtime.finalScore=overlay.querySelector('[data-runner404-final-score]'); runtime.finalBest=overlay.querySelector('[data-runner404-final-best]'); runtime.finalXp=overlay.querySelector('[data-runner404-final-xp]'); runtime.rewardNote=overlay.querySelector('[data-runner404-reward-note]');
    runtime.soundBtn=overlay.querySelector('[data-runner404-sound]'); runtime.pauseBtn=overlay.querySelector('[data-runner404-pause]');

    runtime.canvas.addEventListener('pointerdown',e=>{ if(!runtime.open)return; e.preventDefault(); e.stopPropagation(); if(runtime.state==='ready') startRound(); else if(runtime.state==='playing') jump(); });
    overlay.querySelector('[data-runner404-back]').addEventListener('click',returnToHub); overlay.querySelector('[data-runner404-hub]').addEventListener('click',returnToHub);
    overlay.querySelector('[data-runner404-close]').addEventListener('click',closeAll); overlay.querySelector('[data-runner404-close-result]').addEventListener('click',closeAll);
    overlay.querySelector('[data-runner404-again]').addEventListener('click',resetReady); overlay.querySelector('[data-runner404-resume]').addEventListener('click',resume);
    runtime.soundBtn.addEventListener('click',toggleSound); runtime.pauseBtn.addEventListener('click',()=>{if(runtime.state==='playing')pause(); else if(runtime.state==='paused')resume();});
    overlay.addEventListener('touchmove',e=>{if(runtime.open)e.preventDefault();},{passive:false});
    document.addEventListener('keydown',e=>{ if(!runtime.open)return; if(e.code!=='Space')return; if(e.target?.closest?.('button,input,textarea,select,a'))return; e.preventDefault(); if(runtime.state==='ready')startRound(); else if(runtime.state==='playing')jump(); });
    document.addEventListener('visibilitychange',()=>{if(runtime.open&&document.hidden&&runtime.state==='playing')pause();});
    window.addEventListener('blur',()=>{if(runtime.open&&runtime.state==='playing')pause();});
    window.addEventListener('resize',queueResize,{passive:true}); window.addEventListener('orientationchange',()=>setTimeout(queueResize,100),{passive:true});
    runtime.built=true;
  }

  function queueResize(){ if(!runtime.open)return; clearTimeout(runtime.resizeTimer); runtime.resizeTimer=setTimeout(resizeCanvas,70); }
  function resizeCanvas(){
    const rect=runtime.canvas.getBoundingClientRect(); const w=Math.max(300,rect.width||820); const h=Math.max(300,rect.height||500); const oldH=runtime.view.h||h;
    const dpr=Math.max(1,Math.min(MAX_DPR,Number(window.devicePixelRatio || 1))); runtime.canvas.width=Math.round(w*dpr); runtime.canvas.height=Math.round(h*dpr); runtime.ctx.setTransform(dpr,0,0,dpr,0,0); runtime.view={w,h,dpr};
    if(oldH!==h&&runtime.state!=='ready'){ const sy=h/oldH; runtime.player.y*=sy; runtime.player.h*=sy; runtime.player.w*=sy; runtime.obstacles.forEach(o=>{o.y*=sy;o.h*=sy;o.w*=sy;}); }
    placePlayer();
  }
  function groundY(){return runtime.view.h-clamp(runtime.view.h*.13,52,72);}
  function placePlayer(){ runtime.player.w=clamp(runtime.view.h*.07,30,40); runtime.player.h=runtime.player.w*1.2; runtime.player.x=clamp(runtime.view.w*.16,70,130); if(runtime.state==='ready'||runtime.player.onGround) runtime.player.y=groundY()-runtime.player.h; }

  function getAudio(){ if(!runtime.soundEnabled)return null; try{ if(!runtime.audioContext)runtime.audioContext=new (window.AudioContext || window.webkitAudioContext)(); if(runtime.audioContext.state==='suspended')runtime.audioContext.resume().catch(()=>{}); return runtime.audioContext;}catch(_){return null;} }
  function tone(kind){ const ctx=getAudio(); if(!ctx)return; const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime; const t=kind==='jump'?[430,620,.07,.05]:kind==='pass'?[650,900,.06,.045]:[180,70,.18,.07]; o.type=kind==='crash'?'sawtooth':'square'; o.frequency.setValueAtTime(t[0],now); o.frequency.exponentialRampToValueAtTime(t[1],now+t[2]); g.gain.setValueAtTime(__ict8SfxGain(t[3]),now); g.gain.exponentialRampToValueAtTime(.001,now+t[2]); o.connect(g).connect(ctx.destination); o.start(); o.stop(now+t[2]+.02); }
  function toggleSound(){runtime.soundEnabled=!runtime.soundEnabled;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);}

  function resetReady(){ runtime.state='ready'; runtime.obstacles=[]; runtime.particles=[]; runtime.score=0;runtime.elapsed=0;runtime.distance=0;runtime.passed=0;runtime.spawnClock=0;runtime.round=null;runtime.overPanel.hidden=true;runtime.pausePanel.hidden=true;runtime.pauseBtn.textContent='Ⅱ';runtime.scoreEl.textContent='0'; placePlayer(); runtime.lastFrame=performance.now(); }
  function startRound(){ if(runtime.state!=='ready')return; try{runtime.round=runtime.bridge?.beginRound?.(GAME_ID)||null;}catch(_){runtime.round=null;} runtime.state='playing';runtime.elapsed=0;runtime.distance=0;runtime.score=0;runtime.passed=0;runtime.obstacles=[];runtime.spawnClock=.9;runtime.lastFrame=performance.now();jump(); }
  function jump(){ if(runtime.state!=='playing'||!runtime.player.onGround)return; runtime.player.vy=-clamp(runtime.view.h*1.18,430,620);runtime.player.onGround=false;tone('jump');spawnDust(runtime.player.x,runtime.player.y+runtime.player.h); }
  function pause(){if(runtime.state!=='playing')return;runtime.state='paused';runtime.pausePanel.hidden=false;runtime.pauseBtn.textContent='▶';}
  function resume(){if(runtime.state!=='paused')return;runtime.state='playing';runtime.pausePanel.hidden=true;runtime.pauseBtn.textContent='Ⅱ';runtime.lastFrame=performance.now();}

  function speed(){return clamp(runtime.view.w*.37+runtime.score*.055,150,410);}
  function spawnObstacle(){
    const g=groundY(); const progress=clamp(runtime.score/800,0,1); const tall=Math.random()<(.18+progress*.08); const w=clamp(runtime.view.h*(tall?.055:.075),26,44); const h=clamp(runtime.view.h*(tall?.13:.085),34,68); const labels=['404','BUG','ERR','!','VIRUS'];
    runtime.obstacles.push({x:runtime.view.w+30,y:g-h,w,h,label:labels[Math.floor(Math.random()*labels.length)],passed:false});
    runtime.spawnClock=clamp(1.75-progress*.5,0.95,1.75)*(0.95+Math.random()*.18);
  }
  function spawnDust(x,y){for(let i=0;i<5;i++)runtime.particles.push({x,y,vx:-20-Math.random()*45,vy:-15-Math.random()*25,age:0,life:.35+Math.random()*.2});}
  function collides(a,b){const pad=4;return a.x+pad<b.x+b.w-pad&&a.x+a.w-pad>b.x+pad&&a.y+pad<b.y+b.h-pad&&a.y+a.h-pad>b.y+pad;}

  function update(dt){
    if(runtime.state==='ready'){ runtime.player.y=groundY()-runtime.player.h-Math.sin(performance.now()/350)*3; return; }
    if(runtime.state!=='playing')return;
    runtime.elapsed+=dt; const g=groundY(); runtime.player.vy+=clamp(runtime.view.h*2.15,760,1150)*dt;runtime.player.y+=runtime.player.vy*dt;
    if(runtime.player.y+runtime.player.h>=g){runtime.player.y=g-runtime.player.h;runtime.player.vy=0;runtime.player.onGround=true;}
    const sp=speed(); runtime.distance+=sp*dt; runtime.spawnClock-=dt; if(runtime.spawnClock<=0)spawnObstacle();
    runtime.obstacles.forEach(o=>{o.x-=sp*dt;if(!o.passed&&o.x+o.w<runtime.player.x){o.passed=true;runtime.passed++;tone('pass');showFx(runtime.passed%10===0?'🔥 SPEED UP':'+10');}});
    runtime.obstacles=runtime.obstacles.filter(o=>o.x+o.w>-40);
    runtime.score=Math.max(0,Math.floor(runtime.elapsed*12+runtime.passed*10));runtime.scoreEl.textContent=String(runtime.score);
    runtime.particles.forEach(p=>{p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=80*dt;});runtime.particles=runtime.particles.filter(p=>p.age<p.life);
    for(const o of runtime.obstacles){if(collides(runtime.player,o)){finishRound();break;}}
  }

  function showFx(text){runtime.fxEl.textContent=text;runtime.fxEl.classList.remove('show');void runtime.fxEl.offsetWidth;runtime.fxEl.classList.add('show');}
  async function finishRound(){
    if(runtime.state!=='playing')return;runtime.state='gameover';tone('crash');runtime.shell.classList.remove('impact');void runtime.shell.offsetWidth;runtime.shell.classList.add('impact');
    runtime.finalScore.textContent=String(runtime.score);runtime.finalBest.textContent=String(Math.max(runtime.bestVisible,runtime.score));runtime.finalXp.textContent='+0';runtime.rewardNote.className='runner404-reward-note';runtime.rewardNote.textContent=runtime.round?'Checking reward…':'Practice run — account reward unavailable.';runtime.overPanel.hidden=false;
    if(!runtime.round?.sessionId||!runtime.bridge?.claimRound)return;
    try{const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score:runtime.score,metrics:{obstaclesPassed:runtime.passed}});const rec=result?.gameRecord||result?.gameRecords?.runner404||{};runtime.bestVisible=Math.max(runtime.bestVisible,Number(rec.bestScore||0),Number(result?.bestScore||0));runtime.finalBest.textContent=String(runtime.bestVisible);runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;
      if(result?.loginRequired){runtime.rewardNote.className='runner404-reward-note warn';runtime.rewardNote.textContent='Practice mode — log in as a student to earn account XP.';}
      else if(result?.syncFailed){runtime.rewardNote.className='runner404-reward-note warn';runtime.rewardNote.textContent='XP could not sync. No account XP was added.';}
      else if(result?.capReached&&Number(result.awardedXp||0)===0){runtime.rewardNote.className='runner404-reward-note warn';runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep running for records!';}
      else{runtime.rewardNote.className='runner404-reward-note success';runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'No XP tier reached this run yet.';}
      try{runtime.onReward?.(result);}catch(_){}}
    catch(_){runtime.rewardNote.className='runner404-reward-note warn';runtime.rewardNote.textContent='Reward could not be processed. No XP was added.';}
  }

  function drawBg(time){const ctx=runtime.ctx,{w,h}=runtime.view;const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#08162d');g.addColorStop(1,'#160d2c');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(99,102,241,.09)';const step=38,off=-(time*.04)%step;for(let x=off;x<w+step;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=0;y<h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}}
  function drawGround(time){const ctx=runtime.ctx,{w,h}=runtime.view,g=groundY();ctx.fillStyle='#060b17';ctx.fillRect(0,g,w,h-g);ctx.fillStyle='#8b5cf6';ctx.fillRect(0,g,w,3);ctx.fillStyle='rgba(196,181,253,.24)';const step=32,off=-(time*.18)%step;for(let x=off;x<w+step;x+=step)ctx.fillRect(x,g+14,18,2);}
  function rounded(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,rr):(ctx.rect(x,y,w,h));}
  function drawPlayer(){const ctx=runtime.ctx,p=runtime.player;ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h/2);const rot=clamp(runtime.player.vy/900,-.14,.12);ctx.rotate(rot);ctx.fillStyle='#22d3ee';rounded(ctx,-p.w/2,-p.h/2,p.w,p.h,8);ctx.fill();ctx.fillStyle='#08111f';rounded(ctx,-p.w*.30,-p.h*.20,p.w*.60,p.h*.25,4);ctx.fill();ctx.fillStyle='#67e8f9';ctx.fillRect(-p.w*.18,-p.h*.13,p.w*.10,p.h*.08);ctx.fillRect(p.w*.07,-p.h*.13,p.w*.10,p.h*.08);ctx.strokeStyle='#c4b5fd';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-p.w*.28,p.h*.5);ctx.lineTo(-p.w*.34,p.h*.68);ctx.moveTo(p.w*.28,p.h*.5);ctx.lineTo(p.w*.34,p.h*.68);ctx.stroke();ctx.restore();}
  function drawObstacle(o){const ctx=runtime.ctx;ctx.save();ctx.fillStyle='#7f1d1d';rounded(ctx,o.x,o.y,o.w,o.h,6);ctx.fill();ctx.strokeStyle='#fb7185';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fecdd3';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${clamp(o.w*.34,10,15)}px system-ui`;ctx.save();ctx.translate(o.x+o.w/2,o.y+o.h/2);ctx.rotate(-Math.PI/2);ctx.fillText(o.label,0,0);ctx.restore();ctx.restore();}
  function drawParticles(){const ctx=runtime.ctx;runtime.particles.forEach(p=>{ctx.save();ctx.globalAlpha=1-p.age/p.life;ctx.fillStyle='#c4b5fd';ctx.fillRect(p.x,p.y,4,4);ctx.restore();});}
  function drawReady(){if(runtime.state!=='ready')return;const ctx=runtime.ctx,{w,h}=runtime.view;ctx.save();ctx.fillStyle='rgba(2,6,23,.38)';rounded(ctx,w*.12,h*.22,w*.76,h*.36,18);ctx.fill();ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font=`950 ${clamp(w*.058,26,42)}px system-ui`;ctx.fillText('404 RUNNER',w/2,h*.34);ctx.fillStyle='#ddd6fe';ctx.font=`850 ${clamp(w*.024,13,18)}px system-ui`;ctx.fillText("RUN. JUMP. DON'T CRASH.",w/2,h*.405);ctx.fillText('Tap / Click / Space to Start',w/2,h*.46);ctx.fillStyle='#fbbf24';ctx.font=`800 ${clamp(w*.021,12,16)}px system-ui`;ctx.fillText(`Best: ${runtime.bestVisible}`,w/2,h*.515);ctx.restore();}
  function render(time){drawBg(time);runtime.obstacles.forEach(drawObstacle);drawGround(time);drawParticles();drawPlayer();drawReady();}
  function frame(time){runtime.raf=0;if(!runtime.open)return;const dt=clamp((time-(runtime.lastFrame||time))/1000,0,.034);runtime.lastFrame=time;update(dt);render(time);runtime.raf=requestAnimationFrame(frame);}
  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.();}catch(_){}}
  function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.();}catch(_){}}
  function closeInternal(){if(!runtime.open)return;runtime.open=false;runtime.overlay.hidden=true;document.body.classList.remove('runner404-active');if(runtime.raf)cancelAnimationFrame(runtime.raf);runtime.raf=0;runtime.state='ready';runtime.round=null;runtime.obstacles=[];runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;}
  function open(options={}){build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;runtime.onReward=typeof options.onReward==='function'?options.onReward:null;const snap=runtime.bridge?.getSnapshot?.()||{};runtime.soundEnabled=snap.soundEnabled!==false;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bestVisible=Math.max(0,Number(snap.gameRecords?.runner404?.bestScore||snap.bestScores?.runner404||0));runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('runner404-active');requestAnimationFrame(()=>{resizeCanvas();resetReady();if(!runtime.raf)runtime.raf=requestAnimationFrame(frame);});}
  window.ICT8404Runner=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
