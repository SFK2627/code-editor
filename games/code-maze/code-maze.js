(() => {
  'use strict';

  const GAME_ID = 'code-maze';
  const MAX_DPR = 2;
  const LEVEL_SIZES = [7, 9, 11, 13, 15, 17, 19];
  const runtime = {
    built:false, open:false, state:'ready', bridge:null, onBack:null, onClose:null, onReward:null,
    overlay:null, shell:null, canvas:null, ctx:null, readyPanel:null, pausePanel:null, overPanel:null,
    levelEl:null, timeEl:null, keyEl:null, movesEl:null, finalLevels:null, finalBest:null, finalFastest:null,
    finalXp:null, rewardNote:null, soundBtn:null, pauseBtn:null, fxEl:null,
    view:{w:760,h:700,dpr:1}, raf:0, lastFrame:0, resizeTimer:0,
    level:1, completedLevels:0, moves:0, keysCollected:0, levelStartedAt:0, levelElapsedBeforePause:0,
    pausedAt:0, pausedTotal:0, levelLimitMs:40000, fastestLevelMs:0, bestLevelVisible:0, fastestVisible:0,
    maze:[], size:7, player:{x:0,y:0}, key:{x:0,y:0,collected:false}, exit:{x:6,y:6},
    swipeStart:null, transitioning:false, round:null, soundEnabled:true, audioContext:null
  };

  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function build(){
    if(runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'codeMazeOverlay';
    overlay.className = 'xp-games-game-overlay code-maze-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Code Maze mini-game');
    overlay.innerHTML = `
      <section class="code-maze-shell">
        <canvas class="code-maze-canvas" aria-label="CODE MAZE gameplay area"></canvas>
        <div class="code-maze-topbar">
          <button type="button" data-code-maze-back>&larr; MINI-GAMES</button>
          <button type="button" data-code-maze-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-code-maze-pause aria-label="Pause CODE MAZE">Ⅱ</button>
          <button type="button" data-code-maze-close aria-label="Close CODE MAZE">×</button>
        </div>
        <div class="code-maze-hud">
          <div><small>LEVEL</small><strong data-code-maze-level>1</strong></div>
          <div><small>TIME</small><strong data-code-maze-time>40.0</strong></div>
          <div><small>CODE KEY</small><strong data-code-maze-key>FIND</strong></div>
          <div><small>MOVES</small><strong data-code-maze-moves>0</strong></div>
        </div>
        <div class="code-maze-fx" data-code-maze-fx></div>

        <div class="code-maze-panel" data-code-maze-ready>
          <div class="code-maze-panel-card">
            <span class="code-maze-hero">🧩</span>
            <h2>CODE MAZE</h2>
            <p>Guide the cursor through the maze, collect the CODE KEY, then reach the exit.</p>
            <div class="code-maze-help">Desktop: Arrow keys / WASD · Phone: Swipe</div>
            <button class="primary" type="button" data-code-maze-start>START</button>
          </div>
        </div>

        <div class="code-maze-panel" data-code-maze-pause-panel hidden>
          <div class="code-maze-panel-card">
            <h2>PAUSED</h2>
            <p>The maze timer is frozen.</p>
            <button class="primary" type="button" data-code-maze-resume>RESUME</button>
          </div>
        </div>

        <div class="code-maze-panel" data-code-maze-over hidden>
          <div class="code-maze-panel-card">
            <h2>GAME OVER</h2>
            <div class="code-maze-stats">
              <div><small>Levels Cleared</small><strong data-code-maze-final-levels>0</strong></div>
              <div><small>Best Level</small><strong data-code-maze-final-best>0</strong></div>
              <div><small>Fastest Clear</small><strong data-code-maze-final-fastest>—</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-code-maze-final-xp>+0</strong></div>
            </div>
            <p class="code-maze-reward-note" data-code-maze-reward-note>Checking reward...</p>
            <div class="code-maze-actions">
              <button class="primary" type="button" data-code-maze-again>PLAY AGAIN</button>
              <button type="button" data-code-maze-hub>MINI-GAMES</button>
              <button type="button" data-code-maze-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-maze-shell');
    runtime.canvas = overlay.querySelector('.code-maze-canvas');
    runtime.ctx = runtime.canvas.getContext('2d',{alpha:false});
    runtime.readyPanel = overlay.querySelector('[data-code-maze-ready]');
    runtime.pausePanel = overlay.querySelector('[data-code-maze-pause-panel]');
    runtime.overPanel = overlay.querySelector('[data-code-maze-over]');
    runtime.levelEl = overlay.querySelector('[data-code-maze-level]');
    runtime.timeEl = overlay.querySelector('[data-code-maze-time]');
    runtime.keyEl = overlay.querySelector('[data-code-maze-key]');
    runtime.movesEl = overlay.querySelector('[data-code-maze-moves]');
    runtime.finalLevels = overlay.querySelector('[data-code-maze-final-levels]');
    runtime.finalBest = overlay.querySelector('[data-code-maze-final-best]');
    runtime.finalFastest = overlay.querySelector('[data-code-maze-final-fastest]');
    runtime.finalXp = overlay.querySelector('[data-code-maze-final-xp]');
    runtime.rewardNote = overlay.querySelector('[data-code-maze-reward-note]');
    runtime.soundBtn = overlay.querySelector('[data-code-maze-sound]');
    runtime.pauseBtn = overlay.querySelector('[data-code-maze-pause]');
    runtime.fxEl = overlay.querySelector('[data-code-maze-fx]');

    overlay.querySelector('[data-code-maze-start]').addEventListener('click', startRound);
    overlay.querySelector('[data-code-maze-resume]').addEventListener('click', resume);
    overlay.querySelector('[data-code-maze-again]').addEventListener('click', resetReady);
    overlay.querySelector('[data-code-maze-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-maze-hub]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-maze-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-code-maze-close-result]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.pauseBtn.addEventListener('click', () => runtime.state === 'playing' ? pause() : resume());
    document.addEventListener('keydown', keyDown);
    runtime.canvas.addEventListener('touchstart', touchStart, {passive:false});
    runtime.canvas.addEventListener('touchend', touchEnd, {passive:false});
    runtime.canvas.addEventListener('touchmove', e => { if(runtime.open) e.preventDefault(); }, {passive:false});
    overlay.addEventListener('touchmove', e => { if(runtime.open) e.preventDefault(); }, {passive:false});
    document.addEventListener('visibilitychange', () => { if(runtime.open && document.hidden && runtime.state === 'playing') pause(); });
    window.addEventListener('blur', () => { if(runtime.open && runtime.state === 'playing') pause(); });
    window.addEventListener('resize', queueResize, {passive:true});
    window.addEventListener('orientationchange', () => setTimeout(queueResize, 100), {passive:true});
    runtime.built = true;
  }

  function getAudio(){
    if(!runtime.soundEnabled) return null;
    try{
      if(!runtime.audioContext) runtime.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if(runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(()=>{});
      return runtime.audioContext;
    }catch(_){ return null; }
  }
  function tone(kind){
    const ctx = getAudio(); if(!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), n = ctx.currentTime;
    const t = {move:[360,520,.035,.025], key:[580,980,.09,.04], clear:[660,1220,.14,.055], over:[170,70,.2,.05]}[kind] || [330,440,.05,.03];
    o.type = kind === 'over' ? 'sawtooth' : 'sine';
    o.frequency.setValueAtTime(t[0],n); o.frequency.exponentialRampToValueAtTime(Math.max(40,t[1]),n+t[2]);
    g.gain.setValueAtTime(t[3],n); g.gain.exponentialRampToValueAtTime(.001,n+t[2]);
    o.connect(g).connect(ctx.destination); o.start(n); o.stop(n+t[2]+.02);
  }
  function toggleSound(){ runtime.soundEnabled = !runtime.soundEnabled; runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇'; runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); }

  function queueResize(){ if(!runtime.open) return; clearTimeout(runtime.resizeTimer); runtime.resizeTimer = setTimeout(resizeCanvas,70); }
  function resizeCanvas(){
    if(!runtime.open || !runtime.ctx) return;
    const r = runtime.canvas.getBoundingClientRect();
    const w = Math.max(300, r.width || 760), h = Math.max(420, r.height || 700), dpr = clamp(Number(devicePixelRatio || 1),1,MAX_DPR);
    runtime.canvas.width = Math.round(w*dpr); runtime.canvas.height = Math.round(h*dpr);
    runtime.ctx.setTransform(dpr,0,0,dpr,0,0); runtime.view = {w,h,dpr};
  }

  function createMaze(size){
    const cells = Array.from({length:size*size}, () => ({t:true,r:true,b:true,l:true,seen:false}));
    const idx = (x,y) => y*size+x;
    const stack = [{x:0,y:0}]; cells[0].seen = true;
    const dirs = [
      {dx:0,dy:-1,a:'t',b:'b'}, {dx:1,dy:0,a:'r',b:'l'}, {dx:0,dy:1,a:'b',b:'t'}, {dx:-1,dy:0,a:'l',b:'r'}
    ];
    while(stack.length){
      const cur = stack[stack.length-1];
      const options = dirs.map(d => ({...d,x:cur.x+d.dx,y:cur.y+d.dy})).filter(n => n.x>=0 && n.y>=0 && n.x<size && n.y<size && !cells[idx(n.x,n.y)].seen);
      if(!options.length){ stack.pop(); continue; }
      const n = options[Math.floor(Math.random()*options.length)];
      cells[idx(cur.x,cur.y)][n.a] = false; cells[idx(n.x,n.y)][n.b] = false; cells[idx(n.x,n.y)].seen = true; stack.push({x:n.x,y:n.y});
    }
    cells.forEach(c => { delete c.seen; });
    return cells;
  }

  function chooseKey(size){
    const candidates = [];
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){
      if((x===0&&y===0)||(x===size-1&&y===size-1)) continue;
      const d = x+y;
      if(d >= Math.floor(size*.9)) candidates.push({x,y});
    }
    return candidates[Math.floor(Math.random()*candidates.length)] || {x:Math.floor(size/2),y:Math.floor(size/2)};
  }

  function levelSize(level){ return LEVEL_SIZES[Math.min(LEVEL_SIZES.length-1, Math.max(0,level-1))]; }
  function levelLimit(level){ return Math.max(26000, 42000 - Math.min(8,level-1)*1800); }

  function prepareLevel(){
    runtime.size = levelSize(runtime.level);
    runtime.maze = createMaze(runtime.size);
    runtime.player = {x:0,y:0}; runtime.exit = {x:runtime.size-1,y:runtime.size-1};
    runtime.key = {...chooseKey(runtime.size), collected:false}; runtime.transitioning=false;
    runtime.levelLimitMs = levelLimit(runtime.level); runtime.levelStartedAt = performance.now(); runtime.levelElapsedBeforePause = 0; runtime.pausedTotal = 0; runtime.pausedAt = 0;
    updateHud(runtime.levelLimitMs); showFx(`LEVEL ${runtime.level}`,'level');
  }

  function resetReady(){
    runtime.state='ready'; runtime.level=1; runtime.completedLevels=0; runtime.moves=0; runtime.keysCollected=0; runtime.fastestLevelMs=0; runtime.round=null;
    runtime.readyPanel.hidden=false; runtime.pausePanel.hidden=true; runtime.overPanel.hidden=true; runtime.pauseBtn.textContent='Ⅱ';
    runtime.size=7; runtime.maze=createMaze(7); runtime.player={x:0,y:0}; runtime.exit={x:6,y:6}; runtime.key={...chooseKey(7),collected:false};
    updateHud(40000);
  }
  function startRound(){
    if(!runtime.open || runtime.state!=='ready') return;
    runtime.readyPanel.hidden=true; runtime.overPanel.hidden=true; runtime.level=1; runtime.completedLevels=0; runtime.moves=0; runtime.keysCollected=0; runtime.fastestLevelMs=0;
    try{ runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; }catch(_){ runtime.round=null; }
    runtime.state='playing'; prepareLevel(); runtime.lastFrame=performance.now();
  }
  function pause(){ if(runtime.state!=='playing') return; runtime.state='paused'; runtime.pausedAt=performance.now(); runtime.pausePanel.hidden=false; runtime.pauseBtn.textContent='▶'; }
  function resume(){ if(runtime.state!=='paused') return; const now=performance.now(); if(runtime.pausedAt) runtime.pausedTotal += now-runtime.pausedAt; runtime.pausedAt=0; runtime.state='playing'; runtime.pausePanel.hidden=true; runtime.pauseBtn.textContent='Ⅱ'; runtime.lastFrame=now; }

  function elapsedLevel(now=performance.now()){ return Math.max(0, now-runtime.levelStartedAt-runtime.pausedTotal); }
  function updateHud(remaining){
    runtime.levelEl.textContent=String(runtime.level); runtime.timeEl.textContent=(Math.max(0,remaining)/1000).toFixed(1); runtime.keyEl.textContent=runtime.key?.collected?'FOUND':'FIND'; runtime.movesEl.textContent=String(runtime.moves);
  }
  function showFx(text,kind=''){ runtime.fxEl.textContent=text; runtime.fxEl.className=`code-maze-fx show ${kind}`; clearTimeout(runtime.fxTimer); runtime.fxTimer=setTimeout(()=>runtime.fxEl.className='code-maze-fx',700); }

  function canMove(dx,dy){
    const cell=runtime.maze[runtime.player.y*runtime.size+runtime.player.x]; if(!cell) return false;
    if(dx===1) return !cell.r; if(dx===-1) return !cell.l; if(dy===1) return !cell.b; if(dy===-1) return !cell.t; return false;
  }
  function move(dx,dy){
    if(runtime.state!=='playing' || runtime.transitioning || !canMove(dx,dy)) return;
    runtime.player.x += dx; runtime.player.y += dy; runtime.moves++; tone('move');
    if(!runtime.key.collected && runtime.player.x===runtime.key.x && runtime.player.y===runtime.key.y){ runtime.key.collected=true; runtime.keysCollected++; tone('key'); showFx('🔑 CODE KEY!','key'); }
    if(runtime.player.x===runtime.exit.x && runtime.player.y===runtime.exit.y){
      if(runtime.key.collected) completeLevel(); else showFx('FIND THE KEY','warn');
    }
    updateHud(runtime.levelLimitMs-elapsedLevel());
  }
  function completeLevel(){
    if(runtime.state!=='playing' || runtime.transitioning) return;
    runtime.transitioning=true; const clearMs=elapsedLevel(); runtime.completedLevels++; runtime.fastestLevelMs = runtime.fastestLevelMs>0 ? Math.min(runtime.fastestLevelMs,clearMs) : clearMs; tone('clear'); showFx('LEVEL CLEAR!','clear');
    runtime.level++; setTimeout(()=>{ if(runtime.open && runtime.state==='playing') prepareLevel(); },420);
  }

  function keyDown(e){
    if(!runtime.open) return;
    if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const map={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
    if(map[e.key]){ e.preventDefault(); move(...map[e.key]); }
  }
  function touchStart(e){ if(!runtime.open) return; e.preventDefault(); const t=e.changedTouches[0]; runtime.swipeStart={x:t.clientX,y:t.clientY}; }
  function touchEnd(e){
    if(!runtime.open || !runtime.swipeStart) return; e.preventDefault(); const t=e.changedTouches[0],dx=t.clientX-runtime.swipeStart.x,dy=t.clientY-runtime.swipeStart.y; runtime.swipeStart=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))<18) return;
    if(Math.abs(dx)>Math.abs(dy)) move(dx>0?1:-1,0); else move(0,dy>0?1:-1);
  }

  async function finishRound(){
    if(runtime.state!=='playing') return; runtime.state='gameover'; tone('over');
    const fastest=runtime.fastestLevelMs; runtime.finalLevels.textContent=String(runtime.completedLevels); runtime.finalBest.textContent=String(Math.max(runtime.bestLevelVisible,runtime.completedLevels)); runtime.finalFastest.textContent=fastest>0?`${(fastest/1000).toFixed(1)}s`:(runtime.fastestVisible>0?`${(runtime.fastestVisible/1000).toFixed(1)}s`:'—'); runtime.finalXp.textContent='+0';
    runtime.rewardNote.className='code-maze-reward-note'; runtime.rewardNote.textContent=runtime.round?'Checking reward…':'Practice run — account reward unavailable.'; runtime.overPanel.hidden=false;
    if(!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    try{
      const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score:runtime.completedLevels,metrics:{completedLevels:runtime.completedLevels,level:runtime.level,moves:runtime.moves,keys:runtime.keysCollected,fastestLevelMs:fastest}});
      const rec=result?.gameRecord||result?.gameRecords?.codeMaze||{};
      runtime.bestLevelVisible=Math.max(runtime.bestLevelVisible,Number(rec.bestLevel||rec.bestScore||0),Number(result?.bestScore||0)); runtime.fastestVisible=Number(rec.fastestLevelMs||runtime.fastestVisible||0);
      runtime.finalBest.textContent=String(runtime.bestLevelVisible); runtime.finalFastest.textContent=runtime.fastestVisible>0?`${(runtime.fastestVisible/1000).toFixed(1)}s`:'—'; runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;
      if(result?.loginRequired){ runtime.rewardNote.className='code-maze-reward-note warn'; runtime.rewardNote.textContent='Practice mode — log in as a student to earn account XP.'; }
      else if(result?.syncFailed){ runtime.rewardNote.className='code-maze-reward-note warn'; runtime.rewardNote.textContent='XP could not sync. No account XP was added.'; }
      else if(result?.capReached && Number(result.awardedXp||0)===0){ runtime.rewardNote.className='code-maze-reward-note warn'; runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep solving for records!'; }
      else { runtime.rewardNote.className='code-maze-reward-note success'; runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'Clear at least one maze level to reach an XP tier.'; }
      try{ runtime.onReward?.(result); }catch(_){ }
    }catch(_){ runtime.rewardNote.className='code-maze-reward-note warn'; runtime.rewardNote.textContent='Reward could not be processed. No XP was added.'; }
  }

  function update(){
    if(runtime.state!=='playing') return;
    const remaining=runtime.levelLimitMs-elapsedLevel(); updateHud(remaining); if(remaining<=0) finishRound();
  }
  function draw(){
    const ctx=runtime.ctx,{w,h}=runtime.view; ctx.fillStyle='#06111b';ctx.fillRect(0,0,w,h);
    const pad=Math.max(28,Math.min(w,h)*.06), top=Math.max(100,h*.16); const boardSize=Math.min(w-pad*2,h-top-pad); const cell=boardSize/runtime.size; const ox=(w-boardSize)/2,oy=top+(h-top-boardSize)/2;
    ctx.fillStyle='rgba(15,23,42,.92)';ctx.fillRect(ox,oy,boardSize,boardSize);
    ctx.lineWidth=Math.max(1.5,cell*.08);ctx.strokeStyle='rgba(125,211,252,.72)';ctx.lineCap='round';
    for(let y=0;y<runtime.size;y++) for(let x=0;x<runtime.size;x++){
      const c=runtime.maze[y*runtime.size+x],x0=ox+x*cell,y0=oy+y*cell,x1=x0+cell,y1=y0+cell;
      ctx.beginPath(); if(c.t){ctx.moveTo(x0,y0);ctx.lineTo(x1,y0);} if(c.r){ctx.moveTo(x1,y0);ctx.lineTo(x1,y1);} if(c.b){ctx.moveTo(x1,y1);ctx.lineTo(x0,y1);} if(c.l){ctx.moveTo(x0,y1);ctx.lineTo(x0,y0);} ctx.stroke();
    }
    // exit
    ctx.fillStyle=runtime.key.collected?'#22c55e':'#334155';ctx.fillRect(ox+runtime.exit.x*cell+cell*.2,oy+runtime.exit.y*cell+cell*.2,cell*.6,cell*.6);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${Math.max(9,cell*.28)}px system-ui`;ctx.fillText('EXIT',ox+(runtime.exit.x+.5)*cell,oy+(runtime.exit.y+.5)*cell);
    if(!runtime.key.collected){ ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(ox+(runtime.key.x+.5)*cell,oy+(runtime.key.y+.5)*cell,Math.max(5,cell*.23),0,Math.PI*2);ctx.fill();ctx.fillStyle='#111827';ctx.font=`900 ${Math.max(9,cell*.35)}px system-ui`;ctx.fillText('K',ox+(runtime.key.x+.5)*cell,oy+(runtime.key.y+.5)*cell); }
    const px=ox+(runtime.player.x+.5)*cell,py=oy+(runtime.player.y+.5)*cell;ctx.fillStyle='#38bdf8';ctx.shadowColor='#38bdf8';ctx.shadowBlur=14;ctx.beginPath();ctx.roundRect?ctx.roundRect(px-cell*.29,py-cell*.29,cell*.58,cell*.58,cell*.13):ctx.rect(px-cell*.29,py-cell*.29,cell*.58,cell*.58);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#00111a';ctx.font=`900 ${Math.max(10,cell*.28)}px system-ui`;ctx.fillText('</>',px,py);
  }
  function frame(time){ runtime.raf=0; if(!runtime.open) return; runtime.lastFrame=time; update(); draw(); runtime.raf=requestAnimationFrame(frame); }

  function returnToHub(){ const cb=runtime.onBack; closeInternal(); try{cb?.();}catch(_){ } }
  function closeAll(){ const cb=runtime.onClose; closeInternal(); try{cb?.();}catch(_){ } }
  function closeInternal(){ if(!runtime.open) return; runtime.open=false; runtime.overlay.hidden=true; document.body.classList.remove('code-maze-active'); if(runtime.raf) cancelAnimationFrame(runtime.raf); runtime.raf=0; runtime.state='ready'; runtime.round=null; runtime.pausePanel.hidden=true; runtime.overPanel.hidden=true; }
  function open(options={}){
    build(); runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null; runtime.onBack=typeof options.onBack==='function'?options.onBack:null; runtime.onClose=typeof options.onClose==='function'?options.onClose:null; runtime.onReward=typeof options.onReward==='function'?options.onReward:null;
    const snap=runtime.bridge?.getSnapshot?.()||{}; runtime.soundEnabled=snap.soundEnabled!==false; runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇'; const rec=snap.gameRecords?.codeMaze||{}; runtime.bestLevelVisible=Math.max(0,Number(rec.bestLevel||rec.bestScore||snap.bestScores?.codeMaze||0)); runtime.fastestVisible=Math.max(0,Number(rec.fastestLevelMs||0));
    runtime.open=true; runtime.overlay.hidden=false; document.body.classList.add('code-maze-active'); requestAnimationFrame(()=>{resizeCanvas();resetReady();runtime.lastFrame=performance.now();if(!runtime.raf)runtime.raf=requestAnimationFrame(frame);});
  }

  window.ICT8CodeMaze=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
