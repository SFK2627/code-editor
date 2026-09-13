(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID='pattern-lock';
  const TILES=Object.freeze([
    {icon:'</>',label:'HTML'}, {icon:'🎨',label:'CSS'}, {icon:'JS',label:'JAVASCRIPT'},
    {icon:'🐛',label:'BUG'}, {icon:'{ }',label:'CODE'}, {icon:'01',label:'BINARY'}
  ]);
  const runtime={
    built:false,open:false,state:'ready',bridge:null,onBack:null,onClose:null,onReward:null,
    overlay:null,shell:null,grid:null,readyPanel:null,pausePanel:null,overPanel:null,levelEl:null,patternEl:null,
    finalLevel:null,finalBest:null,finalPattern:null,finalXp:null,rewardNote:null,soundBtn:null,pauseBtn:null,fxEl:null,
    level:1,completedLevels:0,sequence:[],inputIndex:0,inputLocked:true,bestVisible:0,longestVisible:0,
    round:null,soundEnabled:true,audioContext:null,playToken:0,pauseAt:0,pausedTotal:0
  };

  function build(){
    if(runtime.built)return;
    const overlay=document.createElement('div');
    overlay.id='patternLockOverlay'; overlay.className='xp-games-game-overlay pattern-lock-overlay'; overlay.hidden=true;
    overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-label','Pattern Lock mini-game');
    overlay.innerHTML=`
      <section class="pattern-lock-shell">
        <div class="pattern-lock-topbar">
          <button type="button" data-pattern-lock-back>&larr; MINI-GAMES</button>
          <button type="button" data-pattern-lock-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-pattern-lock-pause aria-label="Pause PATTERN LOCK">Ⅱ</button>
          <button type="button" data-pattern-lock-close aria-label="Close PATTERN LOCK">×</button>
        </div>
        <div class="pattern-lock-hud">
          <div><small>LEVEL</small><strong data-pattern-lock-level>1</strong></div>
          <div><small>PATTERN</small><strong data-pattern-lock-pattern>3</strong></div>
        </div>
        <div class="pattern-lock-stage">
          <div class="pattern-lock-title">🔐 PATTERN LOCK</div>
          <div class="pattern-lock-sub">Watch the sequence, then repeat it.</div>
          <div class="pattern-lock-grid" data-pattern-lock-grid></div>
          <div class="pattern-lock-fx" data-pattern-lock-fx></div>
        </div>

        <div class="pattern-lock-panel" data-pattern-lock-ready>
          <div class="pattern-lock-panel-card">
            <span class="pattern-lock-hero">🔐</span>
            <h2>PATTERN LOCK</h2>
            <p>Memorize the flashing code icons, then tap them back in the same order.</p>
            <div class="pattern-lock-help">Each successful round adds one more item to the pattern.</div>
            <button class="primary" type="button" data-pattern-lock-start>START</button>
          </div>
        </div>

        <div class="pattern-lock-panel" data-pattern-lock-pause-panel hidden>
          <div class="pattern-lock-panel-card">
            <h2>PAUSED</h2>
            <p>The pattern is waiting for you.</p>
            <button class="primary" type="button" data-pattern-lock-resume>RESUME</button>
          </div>
        </div>

        <div class="pattern-lock-panel" data-pattern-lock-over hidden>
          <div class="pattern-lock-panel-card">
            <h2>GAME OVER</h2>
            <div class="pattern-lock-stats">
              <div><small>Pattern Level</small><strong data-pattern-lock-final-level>0</strong></div>
              <div><small>Best Level</small><strong data-pattern-lock-final-best>0</strong></div>
              <div><small>Longest Pattern</small><strong data-pattern-lock-final-pattern>0</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-pattern-lock-final-xp>+0</strong></div>
            </div>
            <p class="pattern-lock-reward-note" data-pattern-lock-reward-note>Securing reward...</p>
            <div class="pattern-lock-actions">
              <button class="primary" type="button" data-pattern-lock-again>PLAY AGAIN</button>
              <button type="button" data-pattern-lock-hub>MINI-GAMES</button>
              <button type="button" data-pattern-lock-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay=overlay; runtime.shell=overlay.querySelector('.pattern-lock-shell'); runtime.grid=overlay.querySelector('[data-pattern-lock-grid]');
    runtime.readyPanel=overlay.querySelector('[data-pattern-lock-ready]'); runtime.pausePanel=overlay.querySelector('[data-pattern-lock-pause-panel]'); runtime.overPanel=overlay.querySelector('[data-pattern-lock-over]');
    runtime.levelEl=overlay.querySelector('[data-pattern-lock-level]'); runtime.patternEl=overlay.querySelector('[data-pattern-lock-pattern]'); runtime.finalLevel=overlay.querySelector('[data-pattern-lock-final-level]'); runtime.finalBest=overlay.querySelector('[data-pattern-lock-final-best]'); runtime.finalPattern=overlay.querySelector('[data-pattern-lock-final-pattern]'); runtime.finalXp=overlay.querySelector('[data-pattern-lock-final-xp]'); runtime.rewardNote=overlay.querySelector('[data-pattern-lock-reward-note]'); runtime.soundBtn=overlay.querySelector('[data-pattern-lock-sound]'); runtime.pauseBtn=overlay.querySelector('[data-pattern-lock-pause]'); runtime.fxEl=overlay.querySelector('[data-pattern-lock-fx]');
    runtime.grid.innerHTML=TILES.map((tile,i)=>`<button type="button" class="pattern-lock-tile" data-pattern-lock-tile="${i}" aria-label="${tile.label}"><span>${tile.icon}</span><small>${tile.label}</small></button>`).join('');
    runtime.grid.addEventListener('click',event=>{const btn=event.target.closest('[data-pattern-lock-tile]');if(btn)selectTile(Number(btn.dataset.patternLockTile));});
    overlay.querySelector('[data-pattern-lock-start]').addEventListener('click',startRound); overlay.querySelector('[data-pattern-lock-resume]').addEventListener('click',resume); overlay.querySelector('[data-pattern-lock-again]').addEventListener('click',resetReady); overlay.querySelector('[data-pattern-lock-back]').addEventListener('click',returnToHub); overlay.querySelector('[data-pattern-lock-hub]').addEventListener('click',returnToHub); overlay.querySelector('[data-pattern-lock-close]').addEventListener('click',closeAll); overlay.querySelector('[data-pattern-lock-close-result]').addEventListener('click',closeAll); runtime.soundBtn.addEventListener('click',toggleSound); runtime.pauseBtn.addEventListener('click',()=>runtime.state==='playing'?pause():resume());
    overlay.addEventListener('touchmove',e=>{if(runtime.open)e.preventDefault();},{passive:false}); document.addEventListener('visibilitychange',()=>{if(runtime.open&&document.hidden&&runtime.state==='playing')pause();}); window.addEventListener('blur',()=>{if(runtime.open&&runtime.state==='playing')pause();});
    runtime.built=true;
  }

  function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
  function getAudio(){if(!runtime.soundEnabled)return null;try{if(!runtime.audioContext)runtime.audioContext=new (window.AudioContext||window.webkitAudioContext)();if(runtime.audioContext.state==='suspended')runtime.audioContext.resume().catch(()=>{});return runtime.audioContext}catch(_){return null}}
  function tone(kind,index=0){const ctx=getAudio();if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain(),n=ctx.currentTime;const base=[330,390,460,540,630,740][index%6];const f=kind==='bad'?150:kind==='good'?880:base;o.type=kind==='bad'?'sawtooth':'sine';o.frequency.setValueAtTime(f,n);if(kind==='good')o.frequency.exponentialRampToValueAtTime(1200,n+.1);if(kind==='bad')o.frequency.exponentialRampToValueAtTime(70,n+.16);g.gain.setValueAtTime(__ict8SfxGain(kind==='show'?.035:.045),n);g.gain.exponentialRampToValueAtTime(.001,n+(kind==='bad'?.17:.09));o.connect(g).connect(ctx.destination);o.start(n);o.stop(n+.2)}
  function toggleSound(){runtime.soundEnabled=!runtime.soundEnabled;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled)}
  function updateHud(){runtime.levelEl.textContent=String(runtime.level);runtime.patternEl.textContent=String(runtime.sequence.length||3)}
  function showFx(text,kind=''){runtime.fxEl.textContent=text;runtime.fxEl.className=`pattern-lock-fx show ${kind}`;clearTimeout(runtime.fxTimer);runtime.fxTimer=setTimeout(()=>runtime.fxEl.className='pattern-lock-fx',720)}
  function setTilesDisabled(disabled){runtime.grid.querySelectorAll('.pattern-lock-tile').forEach(btn=>btn.disabled=disabled)}
  function flashTile(index,kind='show'){const btn=runtime.grid.querySelector(`[data-pattern-lock-tile="${index}"]`);if(!btn)return;btn.classList.add(kind);setTimeout(()=>btn.classList.remove(kind),260);tone(kind==='bad'?'bad':'show',index)}
  function randomTile(){return Math.floor(Math.random()*TILES.length)}

  function resetReady(){runtime.playToken++;runtime.state='ready';runtime.level=1;runtime.completedLevels=0;runtime.sequence=[];runtime.inputIndex=0;runtime.inputLocked=true;runtime.round=null;runtime.readyPanel.hidden=false;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.pauseBtn.textContent='Ⅱ';setTilesDisabled(true);runtime.levelEl.textContent='1';runtime.patternEl.textContent='3'}
  function startRound(){if(!runtime.open||runtime.state!=='ready')return;runtime.readyPanel.hidden=true;runtime.overPanel.hidden=true;runtime.level=1;runtime.completedLevels=0;runtime.sequence=[randomTile(),randomTile(),randomTile()];runtime.inputIndex=0;runtime.inputLocked=true;try{runtime.round=runtime.bridge?.beginRound?.(GAME_ID)||null}catch(_){runtime.round=null}runtime.state='playing';updateHud();playSequence()}
  function pause(){if(runtime.state!=='playing')return;runtime.state='paused';runtime.playToken++;runtime.inputLocked=true;runtime.pausePanel.hidden=false;runtime.pauseBtn.textContent='▶';setTilesDisabled(true)}
  function resume(){if(runtime.state!=='paused')return;runtime.state='playing';runtime.pausePanel.hidden=true;runtime.pauseBtn.textContent='Ⅱ';runtime.inputIndex=0;playSequence()}

  async function playSequence(){
    if(runtime.state!=='playing')return;const token=++runtime.playToken;runtime.inputLocked=true;setTilesDisabled(true);showFx('WATCH','watch');await delay(480);if(token!==runtime.playToken||runtime.state!=='playing')return;
    for(const index of runtime.sequence){flashTile(index,'show');await delay(430);if(token!==runtime.playToken||runtime.state!=='playing')return;}
    await delay(180);if(token!==runtime.playToken||runtime.state!=='playing')return;runtime.inputIndex=0;runtime.inputLocked=false;setTilesDisabled(false);showFx('YOUR TURN','turn');
  }

  function selectTile(index){
    if(runtime.state!=='playing'||runtime.inputLocked)return;const expected=runtime.sequence[runtime.inputIndex];
    if(index!==expected){flashTile(index,'bad');finishRound();return;}
    flashTile(index,'good');runtime.inputIndex++;
    if(runtime.inputIndex>=runtime.sequence.length){runtime.inputLocked=true;setTilesDisabled(true);runtime.completedLevels=runtime.level;tone('good');showFx(`LEVEL ${runtime.level} CLEAR!`,'good');runtime.level++;runtime.sequence.push(randomTile());updateHud();setTimeout(()=>{if(runtime.open&&runtime.state==='playing')playSequence()},700)}
  }

  async function finishRound(){
    if(runtime.state!=='playing')return;runtime.state='gameover';runtime.playToken++;runtime.inputLocked=true;setTilesDisabled(true);tone('bad');const longest=runtime.completedLevels>0?runtime.completedLevels+2:0;runtime.finalLevel.textContent=String(runtime.completedLevels);runtime.finalBest.textContent=String(Math.max(runtime.bestVisible,runtime.completedLevels));runtime.finalPattern.textContent=String(Math.max(runtime.longestVisible,longest));runtime.finalXp.textContent='+0';runtime.rewardNote.className='pattern-lock-reward-note';runtime.rewardNote.textContent=runtime.round?'Securing reward…':'Practice run — account reward unavailable.';runtime.overPanel.hidden=false;
    if(!runtime.round?.sessionId||!runtime.bridge?.claimRound)return;
    try{const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score:runtime.completedLevels,metrics:{highestLevel:runtime.completedLevels,longestPattern:longest,roundsCompleted:runtime.completedLevels}});const rec=result?.gameRecord||result?.gameRecords?.patternLock||{};runtime.bestVisible=Math.max(runtime.bestVisible,Number(rec.bestLevel||rec.bestScore||0),Number(result?.bestScore||0));runtime.longestVisible=Math.max(runtime.longestVisible,Number(rec.longestPattern||0));runtime.finalBest.textContent=String(runtime.bestVisible);runtime.finalPattern.textContent=String(Math.max(runtime.longestVisible,longest));runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;
      if(result?.loginRequired){runtime.rewardNote.className='pattern-lock-reward-note warn';runtime.rewardNote.textContent='Practice mode — log in as a student to earn account XP.'}
      else if(result?.syncFailed){runtime.rewardNote.className='pattern-lock-reward-note warn';runtime.rewardNote.textContent='Reward saved for sync. XP will update automatically once confirmed.'}
      else if(result?.capReached&&Number(result.awardedXp||0)===0){runtime.rewardNote.className='pattern-lock-reward-note warn';runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep pushing your memory record!'}
      else{runtime.rewardNote.className='pattern-lock-reward-note success';runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'Reach Pattern Level 3 to earn the first XP tier.'}
      try{runtime.onReward?.(result)}catch(_){}}
    catch(_){runtime.rewardNote.className='pattern-lock-reward-note warn';runtime.rewardNote.textContent='Reward could not be processed. No XP was added.'}
  }

  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.()}catch(_){}}
  function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.()}catch(_){}}
  function closeInternal(){if(!runtime.open)return;runtime.open=false;runtime.playToken++;runtime.overlay.hidden=true;document.body.classList.remove('pattern-lock-active');runtime.state='ready';runtime.round=null;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;setTilesDisabled(true)}
  function open(options={}){build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;runtime.onReward=typeof options.onReward==='function'?options.onReward:null;const snap=runtime.bridge?.getSnapshot?.()||{};runtime.soundEnabled=snap.soundEnabled!==false;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';const rec=snap.gameRecords?.patternLock||{};runtime.bestVisible=Math.max(0,Number(rec.bestLevel||rec.bestScore||snap.bestScores?.patternLock||0));runtime.longestVisible=Math.max(0,Number(rec.longestPattern||0));runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('pattern-lock-active');resetReady()}

  window.ICT8PatternLock=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
