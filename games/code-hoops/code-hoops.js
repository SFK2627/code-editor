(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'code-hoops';
  const ROUND_MS = 45000;
  const MAX_DPR = 2;
  const runtime = {
    built:false, open:false, state:'ready', bridge:null, onBack:null, onClose:null, onReward:null,
    overlay:null, shell:null, canvas:null, ctx:null, readyPanel:null, pausePanel:null, overPanel:null,
    scoreEl:null, timeEl:null, streakEl:null, accuracyEl:null, finalScore:null, finalBest:null,
    finalMade:null, finalAccuracy:null, finalStreak:null, finalXp:null, rewardNote:null, soundBtn:null,
    pauseBtn:null, fxEl:null, view:{w:700,h:700,dpr:1}, raf:0, resizeTimer:0, lastFrame:0,
    roundStartedAt:0, pausedAt:0, pausedTotal:0, score:0, attempts:0, made:0, perfects:0,
    perfectStreak:0, bestStreak:0, bestVisible:0, ball:null, hoop:null, shotActive:false,
    dragActive:false, pointerId:null, aimPoint:null, shotResolved:false, resetAt:0, round:null,
    soundEnabled:true, audioContext:null, netKickAt:0, rimFxAt:0
  };

  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function physicsGravity(){ return clamp(runtime.view.h*1.32,840,1180); }

  // Convert the drag endpoint into a real ballistic solution. The pointer is an
  // aiming target, not a raw velocity vector, so the same gesture works on tall
  // phones and desktop canvases. The solver chooses a flight time long enough
  // for the ball to arrive while descending through the rim.
  function calculateShot(point){
    if(!runtime.ball||!point) return null;
    const b=runtime.ball, hoop=runtime.hoop, w=runtime.view.w, h=runtime.view.h;
    let tx=clamp(point.x,b.x+42,w-20), ty=clamp(point.y,78,b.y-30);

    // Gentle touch assist only when the user is already aiming very near the rim.
    // It compensates for a finger covering the exact center without auto-aiming.
    if(hoop){
      const near=Math.hypot(tx-hoop.x,ty-hoop.y);
      const assist=clamp(hoop.width*.42,30,48);
      if(near<assist){
        const strength=(1-near/assist)*.24;
        tx=lerp(tx,hoop.x,strength);
        ty=lerp(ty,hoop.y,strength);
      }
    }

    const dx=tx-b.x, dy=ty-b.y;
    if(dx<48||dy>-24) return null;
    const g=physicsGravity();
    const horizontal=clamp(dx/Math.max(1,w),0,1);
    const vertical=clamp((b.y-ty)/Math.max(1,h),0,1);
    let flight=.72+horizontal*.30+vertical*.16;
    const descendingMinimum=Math.sqrt(Math.max(0,-2*dy/g))+.11;
    flight=clamp(Math.max(flight,descendingMinimum),.72,1.18);
    const vx=dx/flight;
    const vy=(dy-.5*g*flight*flight)/flight;
    if(!Number.isFinite(vx)||!Number.isFinite(vy)||vx<80||vx>980||vy>80||vy<-1320) return null;
    return {vx,vy,g,flight,target:{x:tx,y:ty}};
  }

  function build(){
    if(runtime.built) return;
    const overlay=document.createElement('div');
    overlay.id='codeHoopsOverlay';
    overlay.className='xp-games-game-overlay code-hoops-overlay';
    overlay.hidden=true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Code Hoops mini-game');
    overlay.innerHTML=`
      <section class="code-hoops-shell">
        <canvas class="code-hoops-canvas" aria-label="CODE HOOPS gameplay area"></canvas>
        <div class="code-hoops-topbar">
          <button type="button" data-code-hoops-back>&larr; MINI-GAMES</button>
          <button type="button" data-code-hoops-sound aria-label="Toggle sound">&#128266;</button>
          <button type="button" data-code-hoops-pause aria-label="Pause CODE HOOPS">II</button>
          <button type="button" data-code-hoops-close aria-label="Close CODE HOOPS">&times;</button>
        </div>
        <div class="code-hoops-hud">
          <div><small>SCORE</small><strong data-code-hoops-score>0</strong></div>
          <div><small>TIME</small><strong data-code-hoops-time>45.0</strong></div>
          <div><small>STREAK</small><strong data-code-hoops-streak>x0</strong></div>
          <div><small>ACCURACY</small><strong data-code-hoops-accuracy>0%</strong></div>
        </div>
        <div class="code-hoops-fx" data-code-hoops-fx></div>

        <div class="code-hoops-panel" data-code-hoops-ready>
          <div class="code-hoops-panel-card">
            <span class="code-hoops-hero">&#127936;</span>
            <h2>CODE HOOPS</h2>
            <p>Drag the aim marker onto the hoop. Follow the dotted arc, then release for a smooth physics-based shot.</p>
            <div class="code-hoops-help">Aim with drag &middot; Release to shoot &middot; Center swish = PERFECT +3</div>
            <button class="primary" type="button" data-code-hoops-start>START</button>
          </div>
        </div>

        <div class="code-hoops-panel" data-code-hoops-pause-panel hidden>
          <div class="code-hoops-panel-card">
            <h2>PAUSED</h2>
            <p>Your timer and ball are frozen.</p>
            <button class="primary" type="button" data-code-hoops-resume>RESUME</button>
          </div>
        </div>

        <div class="code-hoops-panel" data-code-hoops-over hidden>
          <div class="code-hoops-panel-card">
            <h2>GAME OVER</h2>
            <div class="code-hoops-stats">
              <div><small>Score</small><strong data-code-hoops-final-score>0</strong></div>
              <div><small>Best</small><strong data-code-hoops-final-best>0</strong></div>
              <div><small>Shots Made</small><strong data-code-hoops-final-made>0</strong></div>
              <div><small>Accuracy</small><strong data-code-hoops-final-accuracy>0%</strong></div>
              <div><small>Best Streak</small><strong data-code-hoops-final-streak>x0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-code-hoops-final-xp>+0</strong></div>
            </div>
            <p class="code-hoops-reward-note" data-code-hoops-reward-note>Checking reward...</p>
            <div class="code-hoops-actions">
              <button class="primary" type="button" data-code-hoops-again>PLAY AGAIN</button>
              <button type="button" data-code-hoops-hub>MINI-GAMES</button>
              <button type="button" data-code-hoops-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay=overlay;
    runtime.shell=overlay.querySelector('.code-hoops-shell');
    runtime.canvas=overlay.querySelector('.code-hoops-canvas');
    runtime.ctx=runtime.canvas.getContext('2d',{alpha:false});
    runtime.readyPanel=overlay.querySelector('[data-code-hoops-ready]');
    runtime.pausePanel=overlay.querySelector('[data-code-hoops-pause-panel]');
    runtime.overPanel=overlay.querySelector('[data-code-hoops-over]');
    runtime.scoreEl=overlay.querySelector('[data-code-hoops-score]');
    runtime.timeEl=overlay.querySelector('[data-code-hoops-time]');
    runtime.streakEl=overlay.querySelector('[data-code-hoops-streak]');
    runtime.accuracyEl=overlay.querySelector('[data-code-hoops-accuracy]');
    runtime.finalScore=overlay.querySelector('[data-code-hoops-final-score]');
    runtime.finalBest=overlay.querySelector('[data-code-hoops-final-best]');
    runtime.finalMade=overlay.querySelector('[data-code-hoops-final-made]');
    runtime.finalAccuracy=overlay.querySelector('[data-code-hoops-final-accuracy]');
    runtime.finalStreak=overlay.querySelector('[data-code-hoops-final-streak]');
    runtime.finalXp=overlay.querySelector('[data-code-hoops-final-xp]');
    runtime.rewardNote=overlay.querySelector('[data-code-hoops-reward-note]');
    runtime.soundBtn=overlay.querySelector('[data-code-hoops-sound]');
    runtime.pauseBtn=overlay.querySelector('[data-code-hoops-pause]');
    runtime.fxEl=overlay.querySelector('[data-code-hoops-fx]');

    overlay.querySelector('[data-code-hoops-start]').addEventListener('click',startRound);
    overlay.querySelector('[data-code-hoops-resume]').addEventListener('click',resume);
    overlay.querySelector('[data-code-hoops-again]').addEventListener('click',resetReady);
    overlay.querySelector('[data-code-hoops-back]').addEventListener('click',returnToHub);
    overlay.querySelector('[data-code-hoops-hub]').addEventListener('click',returnToHub);
    overlay.querySelector('[data-code-hoops-close]').addEventListener('click',closeAll);
    overlay.querySelector('[data-code-hoops-close-result]').addEventListener('click',closeAll);
    runtime.soundBtn.addEventListener('click',toggleSound);
    runtime.pauseBtn.addEventListener('click',()=>runtime.state==='playing'?pause():resume());

    runtime.canvas.addEventListener('pointerdown',pointerDown,{passive:false});
    runtime.canvas.addEventListener('pointermove',pointerMove,{passive:false});
    runtime.canvas.addEventListener('pointerup',pointerUp,{passive:false});
    runtime.canvas.addEventListener('pointercancel',pointerCancel,{passive:false});
    overlay.addEventListener('touchmove',event=>{ if(runtime.open) event.preventDefault(); },{passive:false});
    document.addEventListener('visibilitychange',()=>{ if(runtime.open&&document.hidden&&runtime.state==='playing') pause(); });
    window.addEventListener('blur',()=>{ if(runtime.open&&runtime.state==='playing') pause(); });
    window.addEventListener('resize',queueResize,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(queueResize,100),{passive:true});
    runtime.built=true;
  }

  function getAudio(){
    if(!runtime.soundEnabled) return null;
    try{
      if(!runtime.audioContext) runtime.audioContext=new (window.AudioContext||window.webkitAudioContext)();
      if(runtime.audioContext.state==='suspended') runtime.audioContext.resume().catch(()=>{});
      return runtime.audioContext;
    }catch(_){ return null; }
  }

  function tone(kind){
    const ctx=getAudio(); if(!ctx) return;
    const osc=ctx.createOscillator(), gain=ctx.createGain(), now=ctx.currentTime;
    const t={shoot:[250,430,.07,.035],score:[520,820,.11,.05],perfect:[680,1180,.13,.055],miss:[170,100,.09,.035],over:[150,70,.2,.05]}[kind]||[300,450,.08,.04];
    osc.type=kind==='miss'||kind==='over'?'sawtooth':'sine';
    osc.frequency.setValueAtTime(t[0],now); osc.frequency.exponentialRampToValueAtTime(Math.max(40,t[1]),now+t[2]);
    gain.gain.setValueAtTime(__ict8SfxGain(t[3]),now); gain.gain.exponentialRampToValueAtTime(.001,now+t[2]);
    osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now+t[2]+.02);
  }

  function toggleSound(){ runtime.soundEnabled=!runtime.soundEnabled; runtime.soundBtn.innerHTML=runtime.soundEnabled?'&#128266;':'&#128263;'; runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); }
  function queueResize(){ if(!runtime.open) return; clearTimeout(runtime.resizeTimer); runtime.resizeTimer=setTimeout(resizeCanvas,70); }
  function resizeCanvas(){
    if(!runtime.open||!runtime.ctx) return;
    const rect=runtime.canvas.getBoundingClientRect();
    const w=Math.max(300,rect.width||700), h=Math.max(420,rect.height||700), dpr=clamp(Number(devicePixelRatio||1),1,MAX_DPR);
    runtime.canvas.width=Math.round(w*dpr); runtime.canvas.height=Math.round(h*dpr); runtime.ctx.setTransform(dpr,0,0,dpr,0,0); runtime.view={w,h,dpr};
    createCourtObjects(true);
  }

  function createCourtObjects(keepBall=false){
    const w=runtime.view.w,h=runtime.view.h;
    const radius=clamp(w*.022,11,17);
    if(!keepBall||!runtime.ball||!runtime.shotActive){
      runtime.ball={x:clamp(w*.16,58,115),y:h-clamp(h*.12,62,96),vx:0,vy:0,r:radius,prevX:0,prevY:h-80,gravity:physicsGravity(),spin:0,touchedRim:false,touchedBoard:false,lastRimAt:0};
      runtime.ball.prevX=runtime.ball.x;
      runtime.shotActive=false;
    }
    runtime.hoop=runtime.hoop||{};
    runtime.hoop.x=w-clamp(w*.16,72,118);
    runtime.hoop.y=clamp(runtime.hoop.y||h*.44,h*.27,h*.60);
    runtime.hoop.baseY=runtime.hoop.y;
    runtime.hoop.baseWidth=clamp(w*.15,82,112);
    runtime.hoop.width=runtime.hoop.baseWidth;
    runtime.hoop.phase=runtime.hoop.phase||Math.random()*Math.PI*2;
    runtime.hoop.lockedY=null;
  }

  function resetReady(){
    runtime.state='ready'; runtime.score=0; runtime.attempts=0; runtime.made=0; runtime.perfects=0; runtime.perfectStreak=0; runtime.bestStreak=0;
    runtime.round=null; runtime.roundStartedAt=0; runtime.pausedAt=0; runtime.pausedTotal=0; runtime.dragActive=false; runtime.pointerId=null; runtime.aimPoint=null;
    runtime.readyPanel.hidden=false; runtime.pausePanel.hidden=true; runtime.overPanel.hidden=true; runtime.pauseBtn.textContent='II';
    createCourtObjects(false); updateHud(ROUND_MS);
  }

  function startRound(){
    if(!runtime.open) return;
    runtime.score=0; runtime.attempts=0; runtime.made=0; runtime.perfects=0; runtime.perfectStreak=0; runtime.bestStreak=0;
    runtime.roundStartedAt=performance.now(); runtime.pausedAt=0; runtime.pausedTotal=0; runtime.readyPanel.hidden=true; runtime.pausePanel.hidden=true; runtime.overPanel.hidden=true;
    runtime.round=runtime.bridge?.beginRound?.(GAME_ID)||null; runtime.state='playing'; createCourtObjects(false); updateHud(ROUND_MS);
  }

  function pause(){ if(runtime.state!=='playing') return; runtime.state='paused'; runtime.pausedAt=performance.now(); runtime.dragActive=false; runtime.pointerId=null; runtime.aimPoint=null; if(runtime.hoop&&!runtime.shotActive) runtime.hoop.lockedY=null; runtime.pausePanel.hidden=false; runtime.pauseBtn.textContent='▶'; }
  function resume(){ if(runtime.state!=='paused') return; if(runtime.pausedAt) runtime.pausedTotal+=performance.now()-runtime.pausedAt; runtime.pausedAt=0; runtime.state='playing'; runtime.pausePanel.hidden=true; runtime.pauseBtn.textContent='II'; }

  function remainingMs(now=performance.now()){ return Math.max(0,ROUND_MS-(now-runtime.roundStartedAt-runtime.pausedTotal)); }
  function canvasPoint(event){ const r=runtime.canvas.getBoundingClientRect(); return {x:(event.clientX-r.left)*(runtime.view.w/r.width),y:(event.clientY-r.top)*(runtime.view.h/r.height)}; }

  function pointerDown(event){
    if(runtime.state!=='playing'||runtime.shotActive) return;
    event.preventDefault(); const p=canvasPoint(event); const b=runtime.ball;
    const near=Math.hypot(p.x-b.x,p.y-b.y)<=Math.max(80,b.r*5.2);
    if(!near&&p.y<runtime.view.h*.55) return;
    runtime.dragActive=true; runtime.pointerId=event.pointerId; runtime.aimPoint=p;
    runtime.hoop.lockedY=runtime.hoop.y;
    try{ runtime.canvas.setPointerCapture(event.pointerId); }catch(_){}
  }
  function pointerMove(event){ if(!runtime.dragActive||event.pointerId!==runtime.pointerId) return; event.preventDefault(); runtime.aimPoint=canvasPoint(event); }
  function pointerUp(event){
    if(!runtime.dragActive||event.pointerId!==runtime.pointerId) return;
    event.preventDefault(); const p=canvasPoint(event); runtime.dragActive=false; runtime.pointerId=null; runtime.aimPoint=p; launchShot(p);
    try{ runtime.canvas.releasePointerCapture(event.pointerId); }catch(_){}
  }
  function pointerCancel(event){
    if(event.pointerId!==runtime.pointerId) return;
    runtime.dragActive=false; runtime.pointerId=null; runtime.aimPoint=null;
    if(runtime.hoop) runtime.hoop.lockedY=null;
  }

  function launchShot(p){
    if(runtime.state!=='playing'||runtime.shotActive) return;
    const shot=calculateShot(p);
    if(!shot){
      if(runtime.hoop) runtime.hoop.lockedY=null;
      fx('DRAG UP TOWARD THE HOOP','miss');
      return;
    }
    const b=runtime.ball;
    b.vx=shot.vx; b.vy=shot.vy; b.gravity=shot.g; b.prevX=b.x; b.prevY=b.y;
    b.spin=0; b.touchedRim=false; b.touchedBoard=false; b.lastRimAt=0;
    runtime.shotActive=true; runtime.shotResolved=false; runtime.resetAt=0; runtime.attempts+=1; runtime.aimPoint=null;
    runtime.hoop.lockedY=runtime.hoop.y;
    tone('shoot'); updateHud(remainingMs());
  }

  function resolveScore(perfect){
    if(runtime.shotResolved) return;
    runtime.shotResolved=true; runtime.made+=1; runtime.netKickAt=performance.now();
    if(perfect){ runtime.score+=3; runtime.perfects+=1; runtime.perfectStreak+=1; runtime.bestStreak=Math.max(runtime.bestStreak,runtime.perfectStreak); tone('perfect'); fx(runtime.perfectStreak>=5?`🔥 PERFECT x${runtime.perfectStreak}`:'PERFECT! +3','perfect'); }
    else{ runtime.score+=1; runtime.perfectStreak=0; tone('score'); fx('SWISH +1','good'); }
    runtime.resetAt=performance.now()+420; updateHud(remainingMs());
  }

  function markMiss(){ if(runtime.shotResolved) return; runtime.shotResolved=true; runtime.perfectStreak=0; tone('miss'); fx('MISS','miss'); runtime.resetAt=performance.now()+250; updateHud(remainingMs()); }

  function resetShot(){
    const w=runtime.view.w,h=runtime.view.h;
    runtime.ball={x:clamp(w*.16,58,115),y:h-clamp(h*.12,62,96),vx:0,vy:0,r:clamp(w*.022,11,17),prevX:0,prevY:h-80,gravity:physicsGravity(),spin:0,touchedRim:false,touchedBoard:false,lastRimAt:0};
    runtime.ball.prevX=runtime.ball.x;
    runtime.shotActive=false; runtime.shotResolved=false; runtime.resetAt=0; runtime.aimPoint=null;
    runtime.hoop.lockedY=null;
    runtime.hoop.baseY=clamp(h*(.33+Math.random()*.18),h*.27,h*.57);
    runtime.hoop.y=runtime.hoop.baseY;
    runtime.hoop.phase=Math.random()*Math.PI*2;
    const shrink=clamp(1-runtime.score*.0017,.84,1);
    runtime.hoop.width=runtime.hoop.baseWidth*shrink;
  }

  function updateHud(remaining){
    runtime.scoreEl.textContent=String(runtime.score); runtime.timeEl.textContent=(Math.max(0,remaining)/1000).toFixed(1); runtime.streakEl.textContent=`x${runtime.perfectStreak}`;
    const acc=runtime.attempts?runtime.made/runtime.attempts*100:0; runtime.accuracyEl.textContent=`${Math.round(acc)}%`;
  }

  function fx(text,kind=''){ runtime.fxEl.textContent=text; runtime.fxEl.className=`code-hoops-fx ${kind}`; void runtime.fxEl.offsetWidth; runtime.fxEl.classList.add('show'); }

  function collideRimPoint(b,rx,ry,now){
    const rimRadius=5.5;
    const dx=b.x-rx, dy=b.y-ry, minDist=b.r+rimRadius;
    const d2=dx*dx+dy*dy;
    if(d2>=minDist*minDist||d2<.0001||now-(b.lastRimAt||0)<45) return false;
    const d=Math.sqrt(d2), nx=dx/d, ny=dy/d;
    b.x=rx+nx*(minDist+.25); b.y=ry+ny*(minDist+.25);
    const dot=b.vx*nx+b.vy*ny;
    if(dot<0){
      const restitution=.66;
      b.vx=(b.vx-(1+restitution)*dot*nx)*.94;
      b.vy=(b.vy-(1+restitution)*dot*ny)*.94;
    }
    b.touchedRim=true; b.lastRimAt=now;
    if(now-runtime.rimFxAt>120){ runtime.rimFxAt=now; fx('RIM!','good'); }
    return true;
  }

  function update(now,dt){
    if(runtime.state!=='playing') return;
    const remaining=remainingMs(now); if(remaining<=0){ finishRound(); return; }
    const h=runtime.view.h;

    if(runtime.hoop.lockedY==null){
      const difficulty=clamp(runtime.score/70,0,1);
      const amp=Math.min(48,h*.065)*(1+difficulty*.18);
      const speed=.00145+difficulty*.00038;
      runtime.hoop.y=clamp(runtime.hoop.baseY+Math.sin(now*speed+runtime.hoop.phase)*amp,h*.25,h*.61);
    }else{
      runtime.hoop.y=runtime.hoop.lockedY;
    }

    if(runtime.shotActive){
      const b=runtime.ball;
      b.prevX=b.x; b.prevY=b.y;
      b.vy+=(b.gravity||physicsGravity())*dt;
      b.x+=b.vx*dt; b.y+=b.vy*dt; b.spin+=b.vx*dt*.018;

      const rimY=runtime.hoop.y, half=runtime.hoop.width*.5, rimRadius=5.5;
      const openingHalf=Math.max(16,half-rimRadius-b.r*.20);

      // Score only when the CENTER of the ball crosses the rim plane downward.
      if(!runtime.shotResolved&&b.vy>0&&b.prevY<rimY&&b.y>=rimY){
        const denom=b.y-b.prevY;
        const t=denom?clamp((rimY-b.prevY)/denom,0,1):1;
        const crossX=lerp(b.prevX,b.x,t);
        if(Math.abs(crossX-runtime.hoop.x)<openingHalf){
          const perfect=Math.abs(crossX-runtime.hoop.x)<runtime.hoop.width*.125&&!b.touchedRim&&!b.touchedBoard;
          resolveScore(perfect);
        }
      }

      // Backboard: a real rebound instead of an invisible wall/miss.
      const boardX=runtime.hoop.x+runtime.hoop.width*.60;
      const boardTop=rimY-78, boardBottom=rimY+12;
      if(!runtime.shotResolved&&b.vx>0&&b.prevX+b.r<boardX&&b.x+b.r>=boardX&&b.y>boardTop-b.r&&b.y<boardBottom+b.r){
        b.x=boardX-b.r-.2; b.vx=-Math.abs(b.vx)*.62; b.vy*=.94; b.touchedBoard=true; fx('BANK SHOT','good');
      }

      if(!runtime.shotResolved){
        collideRimPoint(b,runtime.hoop.x-half,rimY,now);
        collideRimPoint(b,runtime.hoop.x+half,rimY,now);
      }

      if(!runtime.shotResolved&&(b.y>h+b.r*2||b.x>runtime.view.w+b.r*3||b.x<-b.r*3||b.y<-h*.35)) markMiss();
      if(runtime.resetAt&&now>=runtime.resetAt) resetShot();
    }
    updateHud(remaining);
  }

  function drawBackground(now){
    const c=runtime.ctx,w=runtime.view.w,h=runtime.view.h;
    const g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,'#071a24'); g.addColorStop(1,'#071021'); c.fillStyle=g; c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(34,211,238,.07)'; c.lineWidth=1; const grid=40,shift=(now*.02)%grid;
    for(let x=-grid+shift;x<w+grid;x+=grid){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=-grid+shift;y<h+grid;y+=grid){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    c.fillStyle='rgba(15,118,110,.15)'; c.fillRect(0,h*.82,w,h*.18);
    c.strokeStyle='rgba(45,212,191,.25)'; c.beginPath(); c.moveTo(0,h*.82); c.lineTo(w,h*.82); c.stroke();
  }

  function drawHoop(now){
    const c=runtime.ctx,x=runtime.hoop.x,y=runtime.hoop.y,w=runtime.hoop.width;
    const netKick=runtime.netKickAt?clamp(1-(now-runtime.netKickAt)/420,0,1):0;
    const netDrop=netKick*Math.sin((1-netKick)*Math.PI*2)*7;
    c.save();
    const boardX=x+w*.60;
    c.strokeStyle='rgba(226,232,240,.94)'; c.lineWidth=5;
    c.beginPath(); c.moveTo(boardX,y-78); c.lineTo(boardX,y+12); c.stroke();
    c.fillStyle='rgba(226,232,240,.82)'; c.fillRect(boardX-3,y-74,6,82);

    c.shadowColor='rgba(251,146,60,.35)'; c.shadowBlur=10;
    c.strokeStyle='#fb923c'; c.lineWidth=6; c.beginPath(); c.moveTo(x-w*.5,y); c.lineTo(x+w*.5,y); c.stroke(); c.shadowBlur=0;

    c.strokeStyle='rgba(203,213,225,.72)'; c.lineWidth=1.5;
    for(let i=-2;i<=2;i++){
      c.beginPath(); c.moveTo(x+i*w*.16,y+3); c.lineTo(x+i*w*.10,y+36+netDrop); c.stroke();
    }
    c.beginPath(); c.moveTo(x-w*.42,y+18); c.quadraticCurveTo(x,y+46+netDrop,x+w*.42,y+18); c.stroke();

    // Small center glow gives a readable skill target without auto-aiming.
    if(runtime.dragActive&&!runtime.shotActive){
      c.fillStyle='rgba(45,212,191,.18)'; c.beginPath(); c.arc(x,y,Math.max(9,w*.12),0,Math.PI*2); c.fill();
    }
    c.restore();
  }

  function drawBall(){
    const c=runtime.ctx,b=runtime.ball; c.save(); c.translate(b.x,b.y); c.rotate(b.spin||0);
    c.shadowColor='rgba(249,115,22,.38)'; c.shadowBlur=14; c.fillStyle='#f97316'; c.beginPath(); c.arc(0,0,b.r,0,Math.PI*2); c.fill(); c.shadowBlur=0;
    c.strokeStyle='#7c2d12'; c.lineWidth=1.5; c.beginPath(); c.arc(0,0,b.r*.62,-Math.PI/2,Math.PI/2); c.stroke(); c.beginPath(); c.moveTo(-b.r,0); c.lineTo(b.r,0); c.stroke(); c.restore();
  }

  function drawAim(){
    if(!runtime.dragActive||!runtime.aimPoint||runtime.shotActive) return;
    const c=runtime.ctx,b=runtime.ball,raw=runtime.aimPoint,shot=calculateShot(raw);
    c.save();
    c.setLineDash([7,7]); c.strokeStyle='rgba(250,204,21,.65)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(b.x,b.y); c.lineTo(raw.x,raw.y); c.stroke(); c.setLineDash([]);

    if(!shot){
      c.fillStyle='#fca5a5'; c.beginPath(); c.arc(raw.x,raw.y,6,0,Math.PI*2); c.fill(); c.restore(); return;
    }

    const nearRim=Math.hypot(shot.target.x-runtime.hoop.x,shot.target.y-runtime.hoop.y)<runtime.hoop.width*.30;
    const steps=18;
    for(let i=1;i<=steps;i++){
      const t=shot.flight*(i/steps)*1.08;
      const x=b.x+shot.vx*t;
      const y=b.y+shot.vy*t+.5*shot.g*t*t;
      if(x>runtime.view.w+20||y>runtime.view.h+20||y<-20) break;
      const alpha=.22+.62*(i/steps);
      c.fillStyle=nearRim?`rgba(94,234,212,${alpha})`:`rgba(125,211,252,${alpha})`;
      c.beginPath(); c.arc(x,y,clamp(b.r*.16,2.2,3.3),0,Math.PI*2); c.fill();
    }

    c.strokeStyle=nearRim?'#5eead4':'#fde047'; c.lineWidth=2;
    c.beginPath(); c.arc(shot.target.x,shot.target.y,9,0,Math.PI*2); c.stroke();
    c.beginPath(); c.moveTo(shot.target.x-13,shot.target.y); c.lineTo(shot.target.x+13,shot.target.y); c.moveTo(shot.target.x,shot.target.y-13); c.lineTo(shot.target.x,shot.target.y+13); c.stroke();
    c.restore();
  }

  function render(now){ drawBackground(now); drawHoop(now); drawBall(); drawAim(); }
  function frame(now){ runtime.raf=0; if(!runtime.open) return; const dt=clamp((now-(runtime.lastFrame||now))/1000,0,.034); runtime.lastFrame=now; update(now,dt); render(now); runtime.raf=requestAnimationFrame(frame); }

  async function finishRound(){
    if(runtime.state!=='playing') return; runtime.state='gameover'; runtime.dragActive=false; runtime.pointerId=null; runtime.aimPoint=null; runtime.shotActive=false; if(runtime.hoop) runtime.hoop.lockedY=null; tone('over');
    const accuracy=runtime.attempts?runtime.made/runtime.attempts*100:0;
    runtime.finalScore.textContent=String(runtime.score); runtime.finalBest.textContent=String(Math.max(runtime.bestVisible,runtime.score)); runtime.finalMade.textContent=String(runtime.made);
    runtime.finalAccuracy.textContent=`${Math.round(accuracy)}%`; runtime.finalStreak.textContent=`x${runtime.bestStreak}`; runtime.finalXp.textContent='+0';
    runtime.rewardNote.className='code-hoops-reward-note'; runtime.rewardNote.textContent=runtime.round?'Checking reward...':'Practice run - account reward unavailable.'; runtime.overPanel.hidden=false;
    if(!runtime.round?.sessionId||!runtime.bridge?.claimRound) return;
    try{
      const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score:runtime.score,metrics:{attempts:runtime.attempts,made:runtime.made,perfects:runtime.perfects,accuracy,bestStreak:runtime.bestStreak,durationMs:ROUND_MS}});
      const rec=result?.gameRecord||result?.gameRecords?.codeHoops||{}; runtime.bestVisible=Math.max(runtime.bestVisible,Number(rec.bestScore||0),Number(result?.bestScore||0)); runtime.finalBest.textContent=String(runtime.bestVisible);
      runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;
      if(result?.loginRequired){runtime.rewardNote.className='code-hoops-reward-note warn';runtime.rewardNote.textContent='Practice mode - log in as a student to earn account XP.';}
      else if(result?.syncFailed){runtime.rewardNote.className='code-hoops-reward-note warn';runtime.rewardNote.textContent='XP could not sync. No account XP was added.';}
      else if(result?.capReached&&Number(result.awardedXp||0)===0){runtime.rewardNote.className='code-hoops-reward-note warn';runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep shooting for records!';}
      else{runtime.rewardNote.className='code-hoops-reward-note success';runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely - Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'No XP tier reached this round yet.';}
      try{runtime.onReward?.(result);}catch(_){}
    }catch(_){ runtime.rewardNote.className='code-hoops-reward-note warn'; runtime.rewardNote.textContent='Reward could not be processed. No XP was added.'; }
  }

  function returnToHub(){ const cb=runtime.onBack; closeInternal(); try{cb?.();}catch(_){} }
  function closeAll(){ const cb=runtime.onClose; closeInternal(); try{cb?.();}catch(_){} }
  function closeInternal(){ if(!runtime.open) return; runtime.open=false; runtime.overlay.hidden=true; document.body.classList.remove('code-hoops-active'); if(runtime.raf) cancelAnimationFrame(runtime.raf); runtime.raf=0; runtime.state='ready'; runtime.round=null; runtime.dragActive=false; runtime.pointerId=null; runtime.aimPoint=null; runtime.shotActive=false; if(runtime.hoop) runtime.hoop.lockedY=null; runtime.pausePanel.hidden=true; runtime.overPanel.hidden=true; }

  function open(options={}){
    build(); runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null; runtime.onBack=typeof options.onBack==='function'?options.onBack:null; runtime.onClose=typeof options.onClose==='function'?options.onClose:null; runtime.onReward=typeof options.onReward==='function'?options.onReward:null;
    const snap=runtime.bridge?.getSnapshot?.()||{}; runtime.soundEnabled=snap.soundEnabled!==false; runtime.soundBtn.innerHTML=runtime.soundEnabled?'&#128266;':'&#128263;'; runtime.bestVisible=Math.max(0,Number(snap.gameRecords?.codeHoops?.bestScore||snap.bestScores?.codeHoops||0));
    runtime.open=true; runtime.overlay.hidden=false; document.body.classList.add('code-hoops-active'); requestAnimationFrame(()=>{resizeCanvas();resetReady();runtime.lastFrame=performance.now();if(!runtime.raf)runtime.raf=requestAnimationFrame(frame);});
  }

  window.ICT8CodeHoops=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
