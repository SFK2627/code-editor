(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'red-light-green-light';
  const ROUND_MS = 60000;
  const FINISH_DISTANCE = 1000;
  const MAX_DPR = 2;
  const RED_GRACE_MS = 230;

  const runtime = {
    built:false, open:false, state:'ready', bridge:null, onBack:null, onClose:null, onReward:null,
    overlay:null, shell:null, canvas:null, ctx:null, readyPanel:null, pausePanel:null, overPanel:null,
    lightBadge:null, distanceEl:null, timeEl:null, strikesEl:null, progressFill:null, statusEl:null,
    finalDistance:null, finalBest:null, finalTime:null, finalStrikes:null, finalXp:null, rewardNote:null,
    soundBtn:null, pauseBtn:null, fxEl:null, holdHint:null,
    view:{w:720,h:680,dpr:1}, raf:0, lastFrame:0, resizeTimer:0,
    roundStartedAt:0, pausedAt:0, pausedTotal:0,
    countdownStartedAt:0, countdownValue:3,
    distance:0, strikes:0, bestVisible:0, bestFinishVisible:0, finished:false,
    moving:false, pointerId:null, light:'green', lightChangedAt:0, nextLightAt:0,
    redViolationHandled:false, redGraceUntil:0, round:null,
    soundEnabled:true, audioContext:null,
    visual:{shake:0, scanPulse:0, hitFlash:0, runPhase:0, roadScroll:0, particles:[], stars:[], caughtAt:0, shotProgress:0, fallProgress:0}
  };

  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function rand(min,max){ return min+Math.random()*(max-min); }

  function build(){
    if(runtime.built) return;
    const overlay=document.createElement('div');
    overlay.id='redLightGreenLightOverlay';
    overlay.className='xp-games-game-overlay red-light-green-light-overlay';
    overlay.hidden=true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Red Light Green Light mini-game');
    overlay.innerHTML=`
      <section class="red-light-green-light-shell">
        <canvas class="red-light-green-light-canvas" aria-label="RED LIGHT GREEN LIGHT gameplay area"></canvas>

        <div class="red-light-green-light-topbar">
          <button type="button" data-red-light-back>&larr; MINI-GAMES</button>
          <button type="button" data-red-light-sound aria-label="Toggle sound">&#128266;</button>
          <button type="button" data-red-light-pause aria-label="Pause RED LIGHT GREEN LIGHT">II</button>
          <button type="button" data-red-light-close aria-label="Close RED LIGHT GREEN LIGHT">&times;</button>
        </div>

        <div class="red-light-green-light-hud">
          <div><small>DISTANCE</small><strong data-red-light-distance>0 / 1000</strong></div>
          <div class="light green" data-red-light-badge><small>SIGNAL</small><strong>GREEN</strong></div>
          <div><small>TIME</small><strong data-red-light-time>60.0</strong></div>
          <div><small>WARNINGS</small><strong data-red-light-strikes>0 / 3</strong></div>
        </div>

        <div class="red-light-green-light-progress" aria-hidden="true"><span data-red-light-progress></span></div>
        <div class="red-light-green-light-status" data-red-light-status>WAIT FOR GREEN</div>
        <div class="red-light-green-light-fx" data-red-light-fx></div>
        <div class="red-light-green-light-hold-hint" data-red-light-hold-hint><span>HOLD TO RUN</span><small>Release on RED</small></div>

        <div class="red-light-green-light-panel" data-red-light-ready>
          <div class="red-light-green-light-panel-card red-light-green-light-ready-card">
            <div class="red-light-green-light-ready-lights" aria-hidden="true"><i class="red"></i><i class="green"></i></div>
            <span class="red-light-green-light-kicker">ICT 8 ARCADE</span>
            <h2>RED LIGHT / GREEN LIGHT</h2>
            <p>Race through the digital checkpoint. <b>Hold to run on GREEN</b> and release fast when the scanner turns RED.</p>
            <div class="red-light-green-light-rules">
              <div><span>&#128994;</span><b>GREEN</b><small>Hold to sprint</small></div>
              <div><span>&#128308;</span><b>RED</b><small>Release and freeze</small></div>
              <div><span>&#9888;&#65039;</span><b>3 WARNINGS</b><small>Eliminated</small></div>
            </div>
            <div class="red-light-green-light-help">Desktop: hold <b>Space</b> or mouse &middot; Phone: press and hold the arena</div>
            <button class="primary" type="button" data-red-light-start>START RUN</button>
          </div>
        </div>

        <div class="red-light-green-light-countdown" data-red-light-countdown hidden><strong>3</strong><small>GET READY</small></div>

        <div class="red-light-green-light-panel" data-red-light-pause-panel hidden>
          <div class="red-light-green-light-panel-card">
            <span class="red-light-green-light-kicker">CHECKPOINT PAUSED</span>
            <h2>PAUSED</h2>
            <p>The timer and signal are frozen. Resume when you're ready.</p>
            <button class="primary" type="button" data-red-light-resume>RESUME</button>
          </div>
        </div>

        <div class="red-light-green-light-panel" data-red-light-over hidden>
          <div class="red-light-green-light-panel-card">
            <span class="red-light-green-light-kicker">RUN COMPLETE</span>
            <h2 data-red-light-over-title>GAME OVER</h2>
            <div class="red-light-green-light-stats">
              <div><small>Distance</small><strong data-red-light-final-distance>0</strong></div>
              <div><small>Best Run</small><strong data-red-light-final-best>0</strong></div>
              <div><small>Time</small><strong data-red-light-final-time>0.0s</strong></div>
              <div><small>Warnings</small><strong data-red-light-final-strikes>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-red-light-final-xp>+0</strong></div>
            </div>
            <p class="red-light-green-light-reward-note" data-red-light-reward-note>Checking reward...</p>
            <div class="red-light-green-light-actions">
              <button class="primary" type="button" data-red-light-again>PLAY AGAIN</button>
              <button type="button" data-red-light-hub>MINI-GAMES</button>
              <button type="button" data-red-light-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay=overlay;
    runtime.shell=overlay.querySelector('.red-light-green-light-shell');
    runtime.canvas=overlay.querySelector('.red-light-green-light-canvas');
    runtime.ctx=runtime.canvas.getContext('2d',{alpha:false});
    runtime.readyPanel=overlay.querySelector('[data-red-light-ready]');
    runtime.pausePanel=overlay.querySelector('[data-red-light-pause-panel]');
    runtime.overPanel=overlay.querySelector('[data-red-light-over]');
    runtime.countdownEl=overlay.querySelector('[data-red-light-countdown]');
    runtime.lightBadge=overlay.querySelector('[data-red-light-badge]');
    runtime.distanceEl=overlay.querySelector('[data-red-light-distance]');
    runtime.timeEl=overlay.querySelector('[data-red-light-time]');
    runtime.strikesEl=overlay.querySelector('[data-red-light-strikes]');
    runtime.progressFill=overlay.querySelector('[data-red-light-progress]');
    runtime.statusEl=overlay.querySelector('[data-red-light-status]');
    runtime.holdHint=overlay.querySelector('[data-red-light-hold-hint]');
    runtime.finalDistance=overlay.querySelector('[data-red-light-final-distance]');
    runtime.finalBest=overlay.querySelector('[data-red-light-final-best]');
    runtime.finalTime=overlay.querySelector('[data-red-light-final-time]');
    runtime.finalStrikes=overlay.querySelector('[data-red-light-final-strikes]');
    runtime.finalXp=overlay.querySelector('[data-red-light-final-xp]');
    runtime.rewardNote=overlay.querySelector('[data-red-light-reward-note]');
    runtime.soundBtn=overlay.querySelector('[data-red-light-sound]');
    runtime.pauseBtn=overlay.querySelector('[data-red-light-pause]');
    runtime.fxEl=overlay.querySelector('[data-red-light-fx]');

    overlay.querySelector('[data-red-light-start]').addEventListener('click',startRound);
    overlay.querySelector('[data-red-light-resume]').addEventListener('click',resume);
    overlay.querySelector('[data-red-light-again]').addEventListener('click',resetReady);
    overlay.querySelector('[data-red-light-back]').addEventListener('click',returnToHub);
    overlay.querySelector('[data-red-light-hub]').addEventListener('click',returnToHub);
    overlay.querySelector('[data-red-light-close]').addEventListener('click',closeAll);
    overlay.querySelector('[data-red-light-close-result]').addEventListener('click',closeAll);
    runtime.soundBtn.addEventListener('click',toggleSound);
    runtime.pauseBtn.addEventListener('click',()=>runtime.state==='playing'?pause():runtime.state==='paused'?resume():null);

    runtime.canvas.addEventListener('pointerdown',pressStart,{passive:false});
    runtime.canvas.addEventListener('pointerup',pressEnd,{passive:false});
    runtime.canvas.addEventListener('pointercancel',pressEnd,{passive:false});
    runtime.canvas.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')pressEnd(event);},{passive:false});
    document.addEventListener('keydown',keyDown);
    document.addEventListener('keyup',keyUp);
    overlay.addEventListener('touchmove',event=>{if(runtime.open)event.preventDefault();},{passive:false});
    document.addEventListener('visibilitychange',()=>{if(runtime.open&&document.hidden&&runtime.state==='playing')pause();});
    window.addEventListener('blur',()=>{if(runtime.open&&runtime.state==='playing')pause();});
    window.addEventListener('resize',queueResize,{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(queueResize,100),{passive:true});
    runtime.built=true;
  }

  function getAudio(){
    if(!runtime.soundEnabled)return null;
    try{
      if(!runtime.audioContext)runtime.audioContext=new (window.AudioContext||window.webkitAudioContext)();
      if(runtime.audioContext.state==='suspended')runtime.audioContext.resume().catch(()=>{});
      return runtime.audioContext;
    }catch(_){return null;}
  }

  function tone(kind){
    const ctx=getAudio(); if(!ctx)return;
    const o=ctx.createOscillator(),g=ctx.createGain(),n=ctx.currentTime;
    const t={green:[520,880,.13,.045],red:[250,105,.18,.055],warn:[120,62,.22,.065],shot:[980,72,.16,.085],finish:[620,1250,.27,.07],over:[150,58,.25,.055],count:[420,520,.08,.035],go:[660,980,.12,.05]}[kind]||[330,440,.08,.04];
    o.type=(kind==='red'||kind==='warn'||kind==='shot'||kind==='over')?'sawtooth':'sine';
    o.frequency.setValueAtTime(t[0],n);o.frequency.exponentialRampToValueAtTime(Math.max(40,t[1]),n+t[2]);
    g.gain.setValueAtTime(__ict8SfxGain(t[3]),n);g.gain.exponentialRampToValueAtTime(.001,n+t[2]);
    o.connect(g).connect(ctx.destination);o.start(n);o.stop(n+t[2]+.02);
  }

  function toggleSound(){runtime.soundEnabled=!runtime.soundEnabled;runtime.soundBtn.innerHTML=runtime.soundEnabled?'&#128266;':'&#128263;';runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);}
  function queueResize(){if(!runtime.open)return;clearTimeout(runtime.resizeTimer);runtime.resizeTimer=setTimeout(resizeCanvas,70);}
  function resizeCanvas(){
    if(!runtime.open||!runtime.ctx)return;
    const r=runtime.canvas.getBoundingClientRect(),w=Math.max(300,r.width||720),h=Math.max(420,r.height||680),dpr=clamp(Number(devicePixelRatio||1),1,MAX_DPR);
    runtime.canvas.width=Math.round(w*dpr);runtime.canvas.height=Math.round(h*dpr);runtime.ctx.setTransform(dpr,0,0,dpr,0,0);runtime.view={w,h,dpr};
    if(!runtime.visual.stars.length){
      runtime.visual.stars=Array.from({length:36},()=>({x:Math.random(),y:Math.random(),s:rand(.5,1.8),a:rand(.16,.65)}));
    }
  }

  function resetReady(){
    runtime.state='ready';runtime.distance=0;runtime.strikes=0;runtime.finished=false;runtime.moving=false;runtime.pointerId=null;
    runtime.light='green';runtime.lightChangedAt=0;runtime.nextLightAt=0;runtime.redViolationHandled=false;runtime.redGraceUntil=0;
    runtime.round=null;runtime.roundStartedAt=0;runtime.pausedAt=0;runtime.pausedTotal=0;runtime.countdownStartedAt=0;
    runtime.visual.shake=0;runtime.visual.scanPulse=0;runtime.visual.hitFlash=0;runtime.visual.runPhase=0;runtime.visual.roadScroll=0;runtime.visual.particles=[];runtime.visual.caughtAt=0;runtime.visual.shotProgress=0;runtime.visual.fallProgress=0;
    runtime.readyPanel.hidden=false;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.countdownEl.hidden=true;
    runtime.pauseBtn.textContent='II';runtime.statusEl.textContent='WAIT FOR GREEN';runtime.holdHint.classList.remove('active','danger');updateHud(ROUND_MS);
  }

  function startRound(){
    if(!runtime.open)return;
    runtime.distance=0;runtime.strikes=0;runtime.finished=false;runtime.moving=false;runtime.pointerId=null;
    runtime.round=runtime.bridge?.beginRound?.(GAME_ID)||null;
    runtime.readyPanel.hidden=true;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;
    runtime.state='countdown';runtime.countdownStartedAt=performance.now();runtime.countdownValue=3;
    runtime.countdownEl.hidden=false;runtime.countdownEl.querySelector('strong').textContent='3';runtime.countdownEl.querySelector('small').textContent='GET READY';
    tone('count');
  }

  function beginPlaying(now){
    runtime.state='playing';runtime.roundStartedAt=now;runtime.pausedAt=0;runtime.pausedTotal=0;runtime.countdownEl.hidden=true;
    setLight('green',now,true);runtime.statusEl.textContent='GO! HOLD TO RUN';runtime.holdHint.classList.add('active');tone('go');fx('GREEN LIGHT — RUN!','green');
  }

  function pause(){if(runtime.state!=='playing')return;runtime.state='paused';runtime.pausedAt=performance.now();runtime.moving=false;runtime.pointerId=null;runtime.pausePanel.hidden=false;runtime.pauseBtn.textContent='▶';runtime.holdHint.classList.remove('active','danger');}
  function resume(){if(runtime.state!=='paused')return;const now=performance.now(),delta=runtime.pausedAt?now-runtime.pausedAt:0;runtime.pausedTotal+=delta;runtime.lightChangedAt+=delta;runtime.nextLightAt+=delta;runtime.redGraceUntil+=delta;runtime.pausedAt=0;runtime.state='playing';runtime.pausePanel.hidden=true;runtime.pauseBtn.textContent='II';updateStatus();}
  function remainingMs(now=performance.now()){return Math.max(0,ROUND_MS-(now-runtime.roundStartedAt-runtime.pausedTotal));}

  function pressStart(event){
    if(runtime.state!=='playing'||runtime.pointerId!==null)return;
    event.preventDefault();runtime.pointerId=event.pointerId;runtime.moving=true;
    try{runtime.canvas.setPointerCapture(event.pointerId);}catch(_){}
    checkRedViolation(performance.now());updateStatus();
  }
  function pressEnd(event){
    if(runtime.pointerId!==null&&event.pointerId!==undefined&&event.pointerId!==runtime.pointerId)return;
    if(event?.preventDefault)event.preventDefault();runtime.moving=false;const id=runtime.pointerId;runtime.pointerId=null;
    if(id!==null){try{runtime.canvas.releasePointerCapture(id);}catch(_){}}
    updateStatus();
  }
  function keyDown(event){
    if(!runtime.open||runtime.state!=='playing'||event.repeat)return;
    if(event.code!=='Space'&&event.key!=='Enter')return;
    if(event.target&&event.target.closest?.('button,input,textarea,select'))return;
    event.preventDefault();runtime.moving=true;checkRedViolation(performance.now());updateStatus();
  }
  function keyUp(event){if(!runtime.open||(event.code!=='Space'&&event.key!=='Enter'))return;event.preventDefault();runtime.moving=false;updateStatus();}

  function lightDuration(type){
    const p=runtime.distance/FINISH_DISTANCE;
    if(type==='green') return 1500+Math.random()*(1150-p*380);
    return 900+Math.random()*(820-p*240);
  }

  function setLight(type,now,initial=false){
    runtime.light=type;runtime.lightChangedAt=now;runtime.nextLightAt=now+lightDuration(type);runtime.redViolationHandled=false;
    runtime.redGraceUntil=type==='red'?now+RED_GRACE_MS:0;
    runtime.visual.scanPulse=type==='red'?1:0;
    if(!initial)tone(type==='green'?'green':'red');
    if(type==='green')fx('GREEN LIGHT — RUN!','green'); else fx('RED LIGHT — FREEZE!','red');
    updateStatus();updateHud(remainingMs(now));
  }

  function updateStatus(){
    if(!runtime.statusEl||!runtime.holdHint)return;
    runtime.holdHint.classList.remove('active','danger');
    if(runtime.state==='countdown'){runtime.statusEl.textContent='GET READY';return;}
    if(runtime.state==='caught'){
      runtime.statusEl.textContent='ELIMINATED';
      runtime.holdHint.classList.add('danger');
      runtime.holdHint.querySelector('span').textContent='ELIMINATED';
      runtime.holdHint.querySelector('small').textContent='Movement detected during RED';
      return;
    }
    if(runtime.state!=='playing'){runtime.statusEl.textContent='WAIT FOR GREEN';return;}
    if(runtime.light==='red'){
      runtime.statusEl.textContent=runtime.moving?'RELEASE NOW!':'FROZEN — SAFE';
      runtime.holdHint.classList.add('danger');
      runtime.holdHint.querySelector('span').textContent=runtime.moving?'RELEASE!':'STAY FROZEN';
      runtime.holdHint.querySelector('small').textContent='Scanner is watching';
    }else{
      runtime.statusEl.textContent=runtime.moving?'SPRINTING':'GREEN — HOLD TO RUN';
      runtime.holdHint.classList.add('active');
      runtime.holdHint.querySelector('span').textContent=runtime.moving?'RUNNING!':'HOLD TO RUN';
      runtime.holdHint.querySelector('small').textContent='Release when signal turns red';
    }
  }

  function checkRedViolation(now){
    if(runtime.state!=='playing'||runtime.light!=='red'||runtime.redViolationHandled||!runtime.moving)return;
    if(now<runtime.redGraceUntil)return;
    runtime.redViolationHandled=true;runtime.strikes=Math.min(3,runtime.strikes+1);runtime.distance=Math.max(0,runtime.distance-55);
    runtime.moving=false;runtime.pointerId=null;runtime.visual.shake=1;runtime.visual.hitFlash=1;runtime.visual.scanPulse=1;
    if(runtime.strikes>=3){
      beginElimination(now);
    }else{
      tone('warn');fx('⚠ MOVEMENT DETECTED','warn');
      runtime.shell.classList.remove('caught');void runtime.shell.offsetWidth;runtime.shell.classList.add('caught');
      spawnBurst('#fb7185',14);
    }
    updateStatus();updateHud(remainingMs(now));
  }

  function spawnBurst(color,count){
    const p=clamp(runtime.distance/FINISH_DISTANCE,0,1),w=runtime.view.w,h=runtime.view.h;
    const top=h*.24,bottom=h*.84,y=bottom-(bottom-top-24)*p,x=w*.5;
    for(let i=0;i<count;i++)runtime.visual.particles.push({x,y,vx:rand(-70,70),vy:rand(-110,-20),life:rand(.3,.65),max:rand(.3,.65),color});
  }

  function beginElimination(now){
    runtime.state='caught';
    runtime.moving=false;runtime.pointerId=null;
    runtime.visual.caughtAt=now;runtime.visual.shotProgress=0;runtime.visual.fallProgress=0;
    runtime.visual.shake=1;runtime.visual.hitFlash=1;runtime.visual.scanPulse=1;
    runtime.holdHint.classList.remove('active','danger');
    runtime.statusEl.textContent='ELIMINATED';
    runtime.holdHint.querySelector('span').textContent='ELIMINATED';
    runtime.holdHint.querySelector('small').textContent='Movement detected during RED';
    runtime.holdHint.classList.add('danger');
    tone('shot');fx('⚡ ELIMINATED!','warn');
    runtime.shell.classList.remove('caught');void runtime.shell.offsetWidth;runtime.shell.classList.add('caught');
    spawnBurst('#fb7185',24);
    setTimeout(()=>{ if(runtime.open&&runtime.state==='caught') tone('over'); },520);
  }

  function updateHud(remaining){
    runtime.distanceEl.textContent=`${Math.floor(runtime.distance)} / ${FINISH_DISTANCE}`;
    runtime.timeEl.textContent=(Math.max(0,remaining)/1000).toFixed(1);
    runtime.strikesEl.textContent=`${runtime.strikes} / 3`;
    runtime.lightBadge.className=`light ${runtime.light}`;
    const strong=runtime.lightBadge.querySelector('strong');if(strong)strong.textContent=runtime.light.toUpperCase();
    if(runtime.progressFill)runtime.progressFill.style.width=`${clamp(runtime.distance/FINISH_DISTANCE*100,0,100)}%`;
  }

  function fx(text,kind=''){
    runtime.fxEl.textContent=text;runtime.fxEl.className=`red-light-green-light-fx ${kind}`;void runtime.fxEl.offsetWidth;runtime.fxEl.classList.add('show');
  }

  function updateCountdown(now){
    const elapsed=now-runtime.countdownStartedAt;
    const step=Math.floor(elapsed/720);
    const value=3-step;
    if(value>0){
      if(value!==runtime.countdownValue){runtime.countdownValue=value;runtime.countdownEl.querySelector('strong').textContent=String(value);tone('count');}
      return;
    }
    if(elapsed<2500){runtime.countdownEl.querySelector('strong').textContent='GO!';runtime.countdownEl.querySelector('small').textContent='GREEN LIGHT';return;}
    beginPlaying(now);
  }

  function update(now,dt){
    if(runtime.state==='countdown'){updateCountdown(now);return;}
    if(runtime.state==='caught'){
      const elapsed=Math.max(0,now-runtime.visual.caughtAt);
      runtime.visual.shotProgress=clamp(elapsed/190,0,1);
      runtime.visual.fallProgress=clamp((elapsed-120)/820,0,1);
      runtime.visual.shake=Math.max(0,runtime.visual.shake-dt*3.1);
      runtime.visual.hitFlash=Math.max(0,runtime.visual.hitFlash-dt*2.1);
      runtime.visual.scanPulse=Math.max(0,runtime.visual.scanPulse-dt*1.2);
      for(const p of runtime.visual.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=170*dt;p.life-=dt;}
      runtime.visual.particles=runtime.visual.particles.filter(p=>p.life>0);
      updateHud(remainingMs(now));
      if(elapsed>=1180){finishRound(false);}
      return;
    }
    if(runtime.state!=='playing')return;
    const remain=remainingMs(now);if(remain<=0){finishRound(false);return;}
    if(now>=runtime.nextLightAt)setLight(runtime.light==='green'?'red':'green',now);
    if(runtime.light==='red') checkRedViolation(now);
    else if(runtime.moving){
      const pace=50+Math.min(11,runtime.distance/120);
      runtime.distance=Math.min(FINISH_DISTANCE,runtime.distance+pace*dt);
      runtime.visual.runPhase+=dt*(10+runtime.distance/220);
      runtime.visual.roadScroll+=dt*(120+runtime.distance*.08);
      if(Math.random()<dt*8)spawnRunParticle();
      if(runtime.distance>=FINISH_DISTANCE){finishRound(true);return;}
    }

    runtime.visual.scanPulse=Math.max(0,runtime.visual.scanPulse-dt*1.5);
    runtime.visual.shake=Math.max(0,runtime.visual.shake-dt*4.5);
    runtime.visual.hitFlash=Math.max(0,runtime.visual.hitFlash-dt*3.2);
    for(const p of runtime.visual.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;p.life-=dt;}
    runtime.visual.particles=runtime.visual.particles.filter(p=>p.life>0);
    updateHud(remain);
  }

  function spawnRunParticle(){
    const p=clamp(runtime.distance/FINISH_DISTANCE,0,1),w=runtime.view.w,h=runtime.view.h;
    const top=h*.24,bottom=h*.84,y=bottom-(bottom-top-24)*p,x=w*.5;
    runtime.visual.particles.push({x:x+rand(-11,11),y:y+18,vx:rand(-25,25),vy:rand(8,35),life:.35,max:.35,color:'#38bdf8'});
  }

  function drawRoundedRect(c,x,y,w,h,r){
    const rr=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+rr,y);c.arcTo(x+w,y,x+w,y+h,rr);c.arcTo(x+w,y+h,x,y+h,rr);c.arcTo(x,y+h,x,y,rr);c.arcTo(x,y,x+w,y,rr);c.closePath();
  }


  function smoothStep(edge0,edge1,value){
    const t=clamp((value-edge0)/(edge1-edge0),0,1);return t*t*(3-2*t);
  }

  function legKnee(hip,foot,side){
    const upper=15.4,lower=15.8,dx=foot.x-hip.x,dy=foot.y-hip.y;
    const raw=Math.hypot(dx,dy)||.001,d=clamp(raw,3,upper+lower-.25);
    const ux=dx/raw,uy=dy/raw;
    const a=(upper*upper-lower*lower+d*d)/(2*d);
    const h=Math.sqrt(Math.max(0,upper*upper-a*a));
    const baseX=hip.x+ux*a,baseY=hip.y+uy*a;
    const px=-uy,py=ux;
    // Rear view: each knee bends subtly outward, which keeps the gait readable
    // without making the legs look splayed or rubbery.
    const bend=side<0?1:-1;
    return {x:baseX+px*h*bend,y:baseY+py*h*bend};
  }

  function strokeJointedLimb(c,a,b,d,color,width){
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(d.x,d.y);c.stroke();
  }

  function drawRearShoe(c,foot,side,angle,lift){
    c.save();c.translate(foot.x,foot.y);c.rotate(angle);
    c.fillStyle='#0f172a';drawRoundedRect(c,-5.8,-3.4,11.6,6.7,2.6);c.fill();
    c.fillStyle='#e2e8f0';drawRoundedRect(c,-5.2,1.1,10.4,2.7,1.2);c.fill();
    c.fillStyle='#38bdf8';drawRoundedRect(c,side<0?-4.2:-1.2,-1.8,5.4,1.4,.7);c.fill();
    if(lift>.16){c.globalAlpha=.28*lift;c.fillStyle='#7dd3fc';c.beginPath();c.ellipse(0,5.3,6.2,1.8,0,0,Math.PI*2);c.fill();c.globalAlpha=1;}
    c.restore();
  }

  function drawSentinel(c,w,h,top){
    const x=w*.5,y=top-42,scale=clamp(w/720,.75,1.1);
    c.save();c.translate(x,y);c.scale(scale,scale);
    c.shadowColor=runtime.light==='green'?'rgba(34,197,94,.7)':'rgba(239,68,68,.82)';c.shadowBlur=28;
    c.fillStyle='#0f172a';drawRoundedRect(c,-34,-30,68,56,15);c.fill();c.shadowBlur=0;
    c.fillStyle='#1e293b';drawRoundedRect(c,-22,22,44,37,9);c.fill();
    c.fillStyle=runtime.light==='green'?'#22c55e':'#ef4444';c.beginPath();c.arc(0,-4,13,0,Math.PI*2);c.fill();
    c.fillStyle='rgba(255,255,255,.82)';c.beginPath();c.arc(-4,-8,4,0,Math.PI*2);c.fill();
    c.strokeStyle='#64748b';c.lineWidth=4;c.beginPath();c.moveTo(-17,56);c.lineTo(-29,72);c.moveTo(17,56);c.lineTo(29,72);c.stroke();
    c.restore();
  }

  function drawRunner(c,x,y,scale,now){
    const moving=runtime.moving&&runtime.light==='green'&&runtime.state==='playing';
    const phase=runtime.visual.runPhase;
    const caught=runtime.state==='caught';
    const fall=caught?clamp(runtime.visual.fallProgress,0,1):0;
    const impact=caught?smoothStep(0,.18,fall):0;
    const stumble=caught?smoothStep(.12,.55,fall):0;
    const collapse=caught?smoothStep(.42,1,fall):0;

    // A rear-view runner should read as someone moving AWAY from the camera.
    // The pelvis stays near the road plane while the upper body subtly counter-
    // rotates with the stride. During elimination the knees buckle first, then
    // the torso rolls onto the road instead of rotating like a rigid sticker.
    const stride=moving?Math.sin(phase):0;
    const strideOpp=moving?Math.sin(phase+Math.PI):0;
    const leftLift=moving?Math.max(0,Math.sin(phase+.18)):0;
    const rightLift=moving?Math.max(0,Math.sin(phase+Math.PI+.18)):0;
    const bob=moving?(1-Math.cos(phase*2))*1.15:0;
    const pelvis={
      x:(moving?Math.sin(phase)*.75:0)+collapse*10,
      y:-8+bob+stumble*6+collapse*21
    };
    const bodyAngle=(moving?Math.sin(phase)*.025:0)+(caught?(-.08*impact+.18*stumble+1.36*collapse):0);

    c.save();
    c.translate(x,y);
    c.scale(scale,scale);
    c.lineCap='round';c.lineJoin='round';

    const bodyPoint=(lx,ly)=>{
      const cos=Math.cos(bodyAngle),sin=Math.sin(bodyAngle);
      return {x:pelvis.x+lx*cos-ly*sin,y:pelvis.y+lx*sin+ly*cos};
    };

    const hipL=bodyPoint(-5.4,0),hipR=bodyPoint(5.4,0);
    let footL,footR;
    if(caught){
      // Feet keep contact with the road at first, then slide apart as the body
      // loses balance. This produces a visible knee-buckle before the collapse.
      footL={x:-8.5-collapse*6,y:21.2+collapse*1.4};
      footR={x:8.5+collapse*16,y:21.2+collapse*2.4};
    }else{
      const leftDepth=moving?Math.cos(phase):0;
      const rightDepth=moving?Math.cos(phase+Math.PI):0;
      footL={x:-7.2-stride*.9,y:21+leftDepth*1.2-leftLift*7.2};
      footR={x:7.2-strideOpp*.9,y:21+rightDepth*1.2-rightLift*7.2};
    }
    const kneeL=legKnee(hipL,footL,-1),kneeR=legKnee(hipR,footR,1);

    // Far leg first, then near leg. Constant segment lengths prevent the knees
    // and ankles from visibly stretching during the run cycle.
    strokeJointedLimb(c,hipL,kneeL,footL,'#1e293b',8.3);
    strokeJointedLimb(c,hipR,kneeR,footR,'#334155',8.3);
    c.fillStyle='#475569';c.beginPath();c.arc(kneeL.x,kneeL.y,4.1,0,Math.PI*2);c.fill();c.beginPath();c.arc(kneeR.x,kneeR.y,4.1,0,Math.PI*2);c.fill();
    drawRearShoe(c,footL,-1,moving?-.05-stride*.035:collapse*-.16,leftLift);
    drawRearShoe(c,footR,1,moving?.05+stride*.035:collapse*.1,rightLift);

    // Shoulder/arm kinematics: arms swing opposite their same-side leg. From a
    // rear camera the movement is mostly up/down and slightly outward, rather
    // than wildly crossing the torso.
    const shoulderL=bodyPoint(-13,-27.5),shoulderR=bodyPoint(13,-27.5);
    const leftArm=moving?-stride:0,rightArm=moving?stride:0;
    const elbowLLocal={x:-18.5-Math.abs(leftArm)*1.1,y:-19.5+leftArm*4.8};
    const handLLocal={x:-15.8-Math.abs(leftArm)*1.4,y:-8.6+leftArm*7.2};
    const elbowRLocal={x:18.5+Math.abs(rightArm)*1.1,y:-19.5+rightArm*4.8};
    const handRLocal={x:15.8+Math.abs(rightArm)*1.4,y:-8.6+rightArm*7.2};
    let elbowL=bodyPoint(elbowLLocal.x,elbowLLocal.y),handL=bodyPoint(handLLocal.x,handLLocal.y);
    let elbowR=bodyPoint(elbowRLocal.x,elbowRLocal.y),handR=bodyPoint(handRLocal.x,handRLocal.y);
    if(caught){
      // On impact the arms flare naturally before following the falling torso.
      const flare=impact*(1-collapse)*7;
      elbowL.x-=flare;handL.x-=flare*1.3;elbowR.x+=flare;handR.x+=flare*1.3;
    }
    strokeJointedLimb(c,shoulderL,elbowL,handL,'#0369a1',7.1);
    strokeJointedLimb(c,shoulderR,elbowR,handR,'#0284c7',7.1);
    c.fillStyle='#d8a47f';c.beginPath();c.arc(handL.x,handL.y,3.1,0,Math.PI*2);c.fill();c.beginPath();c.arc(handR.x,handR.y,3.1,0,Math.PI*2);c.fill();

    // Torso, deliberately drawn as a BACK view: shoulder yoke, hood, center
    // seam, player number and cyber panel. No eyes/visor/face details.
    c.save();c.translate(pelvis.x,pelvis.y);c.rotate(bodyAngle);
    c.shadowColor='rgba(14,165,233,.42)';c.shadowBlur=15;
    const jacket=c.createLinearGradient(-16,-31,16,0);jacket.addColorStop(0,'#0284c7');jacket.addColorStop(.58,'#0369a1');jacket.addColorStop(1,'#075985');
    c.fillStyle=jacket;drawRoundedRect(c,-15.5,-31.5,31,31.5,8.5);c.fill();c.shadowBlur=0;
    // Shoulder yoke and rear seam.
    c.fillStyle='rgba(125,211,252,.18)';drawRoundedRect(c,-13.5,-29.5,27,8.2,4);c.fill();
    c.strokeStyle='rgba(186,230,253,.52)';c.lineWidth=1.25;c.beginPath();c.moveTo(0,-28);c.lineTo(0,-3);c.stroke();
    c.strokeStyle='rgba(34,211,238,.7)';c.lineWidth=1.3;c.beginPath();c.moveTo(-11,-22);c.lineTo(-5,-16);c.lineTo(0,-18);c.lineTo(5,-16);c.lineTo(11,-22);c.stroke();
    // Compact code badge on the back.
    c.fillStyle='rgba(2,6,23,.52)';drawRoundedRect(c,-8.6,-17.4,17.2,8.7,3);c.fill();
    c.fillStyle='#cffafe';c.font='900 6.4px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('ICT 8',0,-13.2);
    // Jacket hem / waistband makes the pelvis placement clear.
    c.fillStyle='#082f49';drawRoundedRect(c,-13.8,-4.6,27.6,5.2,2.2);c.fill();
    // Hood seen from behind.
    c.fillStyle='#075985';c.beginPath();c.moveTo(-11,-28);c.quadraticCurveTo(-8,-37,0,-39);c.quadraticCurveTo(8,-37,11,-28);c.quadraticCurveTo(5,-31,0,-29);c.quadraticCurveTo(-5,-31,-11,-28);c.fill();

    // Back of neck/head. Only hair, ears and nape are visible.
    c.fillStyle='#d8a47f';drawRoundedRect(c,-4.3,-38.5,8.6,6.6,2.8);c.fill();
    c.fillStyle='#e2ad87';c.beginPath();c.arc(0,-48.7,10.7,0,Math.PI*2);c.fill();
    c.fillStyle='#0f172a';c.beginPath();c.arc(0,-51.4,11.2,Math.PI*.82,Math.PI*2.18);c.quadraticCurveTo(7,-40,0,-41.4);c.quadraticCurveTo(-7,-40,-10,-45.5);c.closePath();c.fill();
    c.fillStyle='#111827';c.beginPath();c.moveTo(-8.8,-47);c.quadraticCurveTo(-4,-42.2,0,-43.7);c.quadraticCurveTo(4,-42.2,8.8,-47);c.lineTo(7.5,-40.8);c.quadraticCurveTo(0,-38.4,-7.5,-40.8);c.closePath();c.fill();
    // Ears are tiny side cues that reinforce the rear orientation.
    c.fillStyle='#d59a75';c.beginPath();c.ellipse(-10.2,-48.2,2.1,3.1,-.12,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(10.2,-48.2,2.1,3.1,.12,0,Math.PI*2);c.fill();

    // Rear impact spark. It sits on the upper back, never on a visible chest.
    if(caught&&runtime.visual.shotProgress<1){
      const pulse=1-runtime.visual.shotProgress;
      c.strokeStyle=`rgba(254,202,202,${.42+.5*pulse})`;c.lineWidth=2.2;
      for(let i=0;i<7;i++){const a=i*Math.PI*2/7+now*.011,r=7+11*(1-pulse);c.beginPath();c.moveTo(Math.cos(a)*3.5,-21+Math.sin(a)*3.5);c.lineTo(Math.cos(a)*r,-21+Math.sin(a)*r);c.stroke();}
      c.fillStyle='#fff7ed';c.beginPath();c.arc(0,-21,3.4+2.5*pulse,0,Math.PI*2);c.fill();
    }
    c.restore();

    c.restore();
  }

  function draw(now){
    const c=runtime.ctx,w=runtime.view.w,h=runtime.view.h,p=clamp(runtime.distance/FINISH_DISTANCE,0,1);
    if(!c)return;
    c.save();
    const shakePx=runtime.visual.shake?runtime.visual.shake*5:0;
    if(shakePx)c.translate(rand(-shakePx,shakePx),rand(-shakePx,shakePx));

    const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,runtime.light==='green'?'#042f2e':'#34070d');bg.addColorStop(.52,'#071426');bg.addColorStop(1,'#020617');c.fillStyle=bg;c.fillRect(-8,-8,w+16,h+16);

    // Stars / digital particles in the sky.
    for(const s of runtime.visual.stars){c.globalAlpha=s.a;c.fillStyle='#bae6fd';c.fillRect(s.x*w,s.y*h*.48,s.s,s.s);}c.globalAlpha=1;

    // Distant cyber skyline.
    const skylineY=h*.235;c.fillStyle='rgba(15,23,42,.9)';
    for(let i=0;i<14;i++){const bw=w/13,xx=i*bw-8,bh=28+(i%5)*12;c.fillRect(xx,skylineY-bh,bw*.75,bh);c.fillStyle='rgba(34,211,238,.12)';for(let yy=skylineY-bh+8;yy<skylineY-5;yy+=10)c.fillRect(xx+5,yy,bw*.42,2);c.fillStyle='rgba(15,23,42,.9)';}

    const top=h*.255,bottom=h*.855,leftTop=w*.39,rightTop=w*.61,leftBottom=w*.07,rightBottom=w*.93;
    const roadGrad=c.createLinearGradient(0,top,0,bottom);roadGrad.addColorStop(0,'rgba(30,41,59,.82)');roadGrad.addColorStop(1,'rgba(8,16,31,.98)');c.fillStyle=roadGrad;c.beginPath();c.moveTo(leftTop,top);c.lineTo(rightTop,top);c.lineTo(rightBottom,bottom);c.lineTo(leftBottom,bottom);c.closePath();c.fill();

    c.strokeStyle=runtime.light==='green'?'rgba(34,211,238,.42)':'rgba(248,113,113,.42)';c.lineWidth=2;c.beginPath();c.moveTo(leftTop,top);c.lineTo(leftBottom,bottom);c.moveTo(rightTop,top);c.lineTo(rightBottom,bottom);c.stroke();

    // Perspective lane stripes.
    for(let i=0;i<12;i++){
      const t=((i/12)+(runtime.visual.roadScroll%90)/900)%1;
      const y=lerp(top,bottom,t*t);const laneHalf=lerp((rightTop-leftTop)*.16,(rightBottom-leftBottom)*.16,t);
      const alpha=.12+.22*t;c.strokeStyle=`rgba(148,163,184,${alpha})`;c.lineWidth=lerp(1,4,t);
      c.beginPath();c.moveTo(w*.5-laneHalf,y);c.lineTo(w*.5+laneHalf,y);c.stroke();
    }

    // Finish gate.
    c.strokeStyle='#f8fafc';c.lineWidth=4;c.beginPath();c.moveTo(leftTop-12,top+8);c.lineTo(rightTop+12,top+8);c.stroke();
    for(let i=0;i<10;i++){c.fillStyle=i%2?'#0f172a':'#f8fafc';const cell=(rightTop-leftTop+24)/10;c.fillRect(leftTop-12+i*cell,top+4,cell,8);}
    c.fillStyle='rgba(226,232,240,.78)';c.font='800 10px system-ui';c.textAlign='center';c.fillText('DIGITAL CHECKPOINT',w*.5,top-8);
    drawSentinel(c,w,h,top);

    // Scanner beam during RED.
    if(runtime.light==='red'){
      const pulse=.14+.12*Math.sin(now*.012);const grad=c.createLinearGradient(w*.5,top,w*.5,bottom);grad.addColorStop(0,`rgba(239,68,68,${.34+pulse})`);grad.addColorStop(1,'rgba(239,68,68,0)');c.fillStyle=grad;c.beginPath();c.moveTo(w*.5-10,top);c.lineTo(leftBottom+35,bottom);c.lineTo(rightBottom-35,bottom);c.closePath();c.fill();
      const scanY=lerp(top,bottom,((now-runtime.lightChangedAt)%900)/900);c.strokeStyle='rgba(254,202,202,.72)';c.lineWidth=2;c.beginPath();c.moveTo(lerp(leftTop,leftBottom,(scanY-top)/(bottom-top)),scanY);c.lineTo(lerp(rightTop,rightBottom,(scanY-top)/(bottom-top)),scanY);c.stroke();
    }

    const runnerY=bottom-(bottom-top-26)*p;const runnerScale=1.1-p*.45;const runnerX=w*.5+Math.sin(p*17)*w*.012;

    // Shadow belongs BEHIND the runner. In the previous version it was drawn
    // over the shoes, which made the feet look clipped and badly positioned.
    const fallShadow=runtime.state==='caught'?runtime.visual.fallProgress:0;
    c.fillStyle='rgba(0,0,0,.34)';c.beginPath();c.ellipse(runnerX+fallShadow*16,runnerY+21*runnerScale,22*runnerScale+fallShadow*24,6.3*runnerScale+fallShadow*1.5,0,0,Math.PI*2);c.fill();

    // Elimination pulse. Aim at the upper torso; the runner itself renders the
    // impact on the back-facing jacket during the short recoil phase.
    if(runtime.state==='caught'&&runtime.visual.shotProgress<1){
      const alpha=1-runtime.visual.shotProgress;
      const sx=w*.5,sy=top-46,tx=runnerX,ty=runnerY-24*runnerScale;
      c.save();c.globalCompositeOperation='lighter';
      c.strokeStyle=`rgba(255,255,255,${.55*alpha})`;c.lineWidth=7*alpha+1;c.shadowColor='#ef4444';c.shadowBlur=22;c.beginPath();c.moveTo(sx,sy);c.lineTo(tx,ty);c.stroke();
      c.strokeStyle=`rgba(239,68,68,${.95*alpha})`;c.lineWidth=2.2;c.shadowBlur=10;c.beginPath();c.moveTo(sx,sy);c.lineTo(tx,ty);c.stroke();c.restore();
    }
    drawRunner(c,runnerX,runnerY,runnerScale,now);

    // Particles.
    for(const q of runtime.visual.particles){c.globalAlpha=clamp(q.life/q.max,0,1);c.fillStyle=q.color;c.beginPath();c.arc(q.x,q.y,2.2,0,Math.PI*2);c.fill();}c.globalAlpha=1;

    // Big light halo.
    const haloX=w*.5,haloY=h*.145,haloR=clamp(w*.047,22,34);c.shadowColor=runtime.light==='green'?'rgba(34,197,94,.85)':'rgba(239,68,68,.9)';c.shadowBlur=30;c.fillStyle=runtime.light==='green'?'#22c55e':'#ef4444';c.beginPath();c.arc(haloX,haloY,haloR,0,Math.PI*2);c.fill();c.shadowBlur=0;c.fillStyle='rgba(255,255,255,.72)';c.beginPath();c.arc(haloX-haloR*.28,haloY-haloR*.3,haloR*.18,0,Math.PI*2);c.fill();

    if(runtime.visual.hitFlash){c.fillStyle=`rgba(239,68,68,${runtime.visual.hitFlash*.16})`;c.fillRect(0,0,w,h);}
    c.restore();
  }

  function frame(now){
    runtime.raf=0;if(!runtime.open)return;
    const dt=clamp((now-(runtime.lastFrame||now))/1000,0,.04);runtime.lastFrame=now;
    update(now,dt);draw(now);runtime.raf=requestAnimationFrame(frame);
  }

  async function finishRound(completed){
    if(runtime.state!=='playing'&&runtime.state!=='caught')return;
    const wasCaught=runtime.state==='caught';
    const endedAt=wasCaught&&runtime.visual.caughtAt?runtime.visual.caughtAt:performance.now();
    runtime.state='gameover';runtime.moving=false;runtime.pointerId=null;runtime.holdHint.classList.remove('active','danger');
    runtime.finished=Boolean(completed&&runtime.distance>=FINISH_DISTANCE);
    const elapsed=Math.max(0,ROUND_MS-remainingMs(endedAt));if(runtime.finished)tone('finish');else if(runtime.strikes<3)tone('over');
    const score=Math.floor(runtime.distance);
    runtime.finalDistance.textContent=runtime.finished?'FINISH!':String(score);
    runtime.finalBest.textContent=String(Math.max(runtime.bestVisible,score));
    runtime.finalTime.textContent=`${(elapsed/1000).toFixed(1)}s`;
    runtime.finalStrikes.textContent=String(runtime.strikes);runtime.finalXp.textContent='+0';
    runtime.overlay.querySelector('[data-red-light-over-title]').textContent=runtime.finished?'CHECKPOINT CLEARED!':runtime.strikes>=3?'ELIMINATED':'TIME UP';
    runtime.rewardNote.className='red-light-green-light-reward-note';runtime.rewardNote.textContent=runtime.round?'Checking reward...':'Practice run - account reward unavailable.';runtime.overPanel.hidden=false;
    if(!runtime.round?.sessionId||!runtime.bridge?.claimRound)return;
    try{
      const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score,metrics:{distance:score,strikes:runtime.strikes,completed:runtime.finished,timeMs:elapsed,durationMs:elapsed}});
      const rec=result?.gameRecord||result?.gameRecords?.redLightGreenLight||{};
      runtime.bestVisible=Math.max(runtime.bestVisible,Number(rec.bestDistance||rec.bestScore||0),Number(result?.bestScore||0));
      runtime.bestFinishVisible=Math.max(0,Number(rec.fastestFinishMs||0));runtime.finalBest.textContent=String(runtime.bestVisible);runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;
      if(result?.loginRequired){runtime.rewardNote.className='red-light-green-light-reward-note warn';runtime.rewardNote.textContent='Practice mode - log in as a student to earn account XP.';}
      else if(result?.syncFailed){runtime.rewardNote.className='red-light-green-light-reward-note warn';runtime.rewardNote.textContent='XP could not sync. No account XP was added.';}
      else if(result?.capReached&&Number(result.awardedXp||0)===0){runtime.rewardNote.className='red-light-green-light-reward-note warn';runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep racing for records!';}
      else{runtime.rewardNote.className='red-light-green-light-reward-note success';runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely - Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'No XP tier reached this run yet.';}
      try{runtime.onReward?.(result);}catch(_){}
    }catch(_){runtime.rewardNote.className='red-light-green-light-reward-note warn';runtime.rewardNote.textContent='Reward could not be processed. No XP was added.';}
  }

  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.();}catch(_){} }
  function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.();}catch(_){} }
  function closeInternal(){
    if(!runtime.open)return;runtime.open=false;runtime.overlay.hidden=true;document.body.classList.remove('red-light-green-light-active');
    if(runtime.raf)cancelAnimationFrame(runtime.raf);runtime.raf=0;runtime.state='ready';runtime.round=null;runtime.moving=false;runtime.pointerId=null;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.countdownEl.hidden=true;
  }

  function open(options={}){
    build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;runtime.onReward=typeof options.onReward==='function'?options.onReward:null;
    const snap=runtime.bridge?.getSnapshot?.()||{};runtime.soundEnabled=snap.soundEnabled!==false;runtime.soundBtn.innerHTML=runtime.soundEnabled?'&#128266;':'&#128263;';
    runtime.bestVisible=Math.max(0,Number(snap.gameRecords?.redLightGreenLight?.bestDistance||snap.gameRecords?.redLightGreenLight?.bestScore||snap.bestScores?.redLightGreenLight||0));
    runtime.bestFinishVisible=Math.max(0,Number(snap.gameRecords?.redLightGreenLight?.fastestFinishMs||0));
    runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('red-light-green-light-active');
    requestAnimationFrame(()=>{resizeCanvas();resetReady();runtime.lastFrame=performance.now();if(!runtime.raf)runtime.raf=requestAnimationFrame(frame);});
  }

  window.ICT8RedLightGreenLight=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
