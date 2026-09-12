(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID='memory-code';
  const PAIRS=Object.freeze([
    {key:'html',face:'</>',label:'HTML'}, {key:'css',face:'🎨',label:'CSS'}, {key:'js',face:'{ }',label:'JS'}, {key:'bug',face:'🐛',label:'BUG'},
    {key:'wifi',face:'📶',label:'WIFI'}, {key:'db',face:'🗄',label:'DB'}, {key:'lock',face:'🔒',label:'LOCK'}, {key:'cloud',face:'☁',label:'CLOUD'}
  ]);
  const runtime={built:false,open:false,state:'ready',bridge:null,onBack:null,onClose:null,onReward:null,overlay:null,shell:null,grid:null,timeEl:null,movesEl:null,matchEl:null,readyPanel:null,pausePanel:null,overPanel:null,finalTime:null,finalMoves:null,finalBest:null,finalXp:null,finalStars:null,rewardNote:null,soundBtn:null,cards:[],first:null,second:null,inputLocked:false,moves:0,matches:0,startedAt:0,elapsedBeforePause:0,pauseStartedAt:0,raf:0,round:null,bestTimeMs:0,fewestMoves:0,soundEnabled:true,audioContext:null};

  function build(){
    if(runtime.built)return;
    const overlay=document.createElement('div');overlay.id='memoryCodeOverlay';overlay.className='xp-games-game-overlay memory-code-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Memory Code mini-game');
    overlay.innerHTML=`
      <section class="memory-code-shell">
        <div class="memory-code-topbar">
          <button type="button" data-memory-code-back>← MINI-GAMES</button>
          <button type="button" data-memory-code-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-memory-code-close aria-label="Close MEMORY CODE">×</button>
        </div>
        <div class="memory-code-title"><strong>🧠 MEMORY CODE</strong><span>NORMAL · 4 × 4</span></div>
        <div class="memory-code-hud">
          <div><small>TIME</small><strong data-memory-code-time>0.0</strong></div>
          <div><small>MOVES</small><strong data-memory-code-moves>0</strong></div>
          <div><small>MATCHES</small><strong data-memory-code-match>0/8</strong></div>
        </div>
        <div class="memory-code-grid" data-memory-code-grid aria-label="Memory card grid"></div>

        <div class="memory-code-panel" data-memory-code-ready>
          <div class="memory-code-panel-card">
            <span class="memory-code-hero">🧠</span><h2>MEMORY CODE</h2><p>Match all the coding pairs!</p>
            <div class="memory-code-difficulty"><small>DIFFICULTY</small><strong>NORMAL · 8 PAIRS</strong></div>
            <button class="primary" type="button" data-memory-code-start>START</button>
          </div>
        </div>
        <div class="memory-code-panel" data-memory-code-pause hidden>
          <div class="memory-code-panel-card"><h2>PAUSED</h2><p>Your board is frozen.</p><button class="primary" type="button" data-memory-code-resume>RESUME</button></div>
        </div>
        <div class="memory-code-panel" data-memory-code-over hidden>
          <div class="memory-code-panel-card">
            <h2>COMPLETE!</h2><div class="memory-code-stars" data-memory-code-stars>⭐</div>
            <div class="memory-code-stats">
              <div><small>Time</small><strong data-memory-code-final-time>0.0s</strong></div>
              <div><small>Moves</small><strong data-memory-code-final-moves>0</strong></div>
              <div><small>Best Time</small><strong data-memory-code-final-best>—</strong></div>
              <div class="xp"><small>XP Earned</small><strong data-memory-code-final-xp>+0</strong></div>
            </div>
            <p class="memory-code-reward-note" data-memory-code-reward-note>Checking reward…</p>
            <div class="memory-code-actions">
              <button class="primary" type="button" data-memory-code-again>PLAY AGAIN</button>
              <button type="button" data-memory-code-hub>MINI-GAMES</button>
              <button type="button" data-memory-code-close-result>CLOSE</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay=overlay;runtime.shell=overlay.querySelector('.memory-code-shell');runtime.grid=overlay.querySelector('[data-memory-code-grid]');runtime.timeEl=overlay.querySelector('[data-memory-code-time]');runtime.movesEl=overlay.querySelector('[data-memory-code-moves]');runtime.matchEl=overlay.querySelector('[data-memory-code-match]');runtime.readyPanel=overlay.querySelector('[data-memory-code-ready]');runtime.pausePanel=overlay.querySelector('[data-memory-code-pause]');runtime.overPanel=overlay.querySelector('[data-memory-code-over]');runtime.finalTime=overlay.querySelector('[data-memory-code-final-time]');runtime.finalMoves=overlay.querySelector('[data-memory-code-final-moves]');runtime.finalBest=overlay.querySelector('[data-memory-code-final-best]');runtime.finalXp=overlay.querySelector('[data-memory-code-final-xp]');runtime.finalStars=overlay.querySelector('[data-memory-code-stars]');runtime.rewardNote=overlay.querySelector('[data-memory-code-reward-note]');runtime.soundBtn=overlay.querySelector('[data-memory-code-sound]');
    overlay.querySelector('[data-memory-code-start]').addEventListener('click',startRound);overlay.querySelector('[data-memory-code-resume]').addEventListener('click',resume);overlay.querySelector('[data-memory-code-again]').addEventListener('click',resetReady);overlay.querySelector('[data-memory-code-back]').addEventListener('click',returnToHub);overlay.querySelector('[data-memory-code-hub]').addEventListener('click',returnToHub);overlay.querySelector('[data-memory-code-close]').addEventListener('click',closeAll);overlay.querySelector('[data-memory-code-close-result]').addEventListener('click',closeAll);runtime.soundBtn.addEventListener('click',toggleSound);
    runtime.grid.addEventListener('click',e=>{const button=e.target.closest('[data-memory-card]');if(button)flipCard(Number(button.dataset.memoryCard));});
    overlay.addEventListener('touchmove',e=>{if(runtime.open)e.preventDefault();},{passive:false});
    document.addEventListener('visibilitychange',()=>{if(runtime.open&&document.hidden&&runtime.state==='playing')pause();});window.addEventListener('blur',()=>{if(runtime.open&&runtime.state==='playing')pause();});
    runtime.built=true;
  }

  function shuffle(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function makeDeck(){return shuffle(PAIRS.flatMap(pair=>[{...pair,id:`${pair.key}-a`},{...pair,id:`${pair.key}-b`}])).map((c,index)=>({...c,index,revealed:false,matched:false}));}
  function renderDeck(){runtime.grid.innerHTML=runtime.cards.map((card,index)=>`<button type="button" class="memory-code-card ${card.revealed||card.matched?'is-flipped':''} ${card.matched?'is-matched':''}" data-memory-card="${index}" aria-label="${card.matched?'Matched '+card.label:'Hidden memory card'}" ${card.matched?'disabled':''}><span class="memory-code-card-inner"><span class="memory-code-card-back">&lt;/&gt;</span><span class="memory-code-card-front"><b>${card.face}</b><small>${card.label}</small></span></span></button>`).join('');}
  function getAudio(){if(!runtime.soundEnabled)return null;try{if(!runtime.audioContext)runtime.audioContext=new (window.AudioContext || window.webkitAudioContext)();if(runtime.audioContext.state==='suspended')runtime.audioContext.resume().catch(()=>{});return runtime.audioContext;}catch(_){return null;}}
  function tone(kind){const ctx=getAudio();if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;const t=kind==='match'?[560,840,.10,.055]:kind==='complete'?[520,1040,.22,.06]:[250,180,.08,.035];o.type=kind==='miss'?'triangle':'sine';o.frequency.setValueAtTime(t[0],now);o.frequency.exponentialRampToValueAtTime(t[1],now+t[2]);g.gain.setValueAtTime(__ict8SfxGain(t[3]),now);g.gain.exponentialRampToValueAtTime(.001,now+t[2]);o.connect(g).connect(ctx.destination);o.start();o.stop(now+t[2]+.02);}
  function toggleSound(){runtime.soundEnabled=!runtime.soundEnabled;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);}

  function resetReady(){runtime.state='ready';runtime.cards=makeDeck();runtime.first=null;runtime.second=null;runtime.inputLocked=false;runtime.moves=0;runtime.matches=0;runtime.startedAt=0;runtime.elapsedBeforePause=0;runtime.round=null;runtime.readyPanel.hidden=false;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;runtime.timeEl.textContent='0.0';runtime.movesEl.textContent='0';runtime.matchEl.textContent='0/8';renderDeck();stopTimer();}
  function startRound(){if(runtime.state!=='ready')return;runtime.readyPanel.hidden=true;runtime.cards=makeDeck();renderDeck();runtime.moves=0;runtime.matches=0;runtime.first=null;runtime.second=null;runtime.inputLocked=false;runtime.elapsedBeforePause=0;runtime.startedAt=performance.now();runtime.state='playing';try{runtime.round=runtime.bridge?.beginRound?.(GAME_ID)||null;}catch(_){runtime.round=null;}startTimer();}
  function elapsedMs(){if(runtime.state==='paused')return runtime.elapsedBeforePause; if(!runtime.startedAt)return 0;return runtime.elapsedBeforePause+(performance.now()-runtime.startedAt);}
  function startTimer(){stopTimer();const tick=()=>{runtime.raf=0;if(!runtime.open)return;if(runtime.state==='playing')runtime.timeEl.textContent=(elapsedMs()/1000).toFixed(1);if(runtime.state==='playing'||runtime.state==='paused')runtime.raf=requestAnimationFrame(tick);};runtime.raf=requestAnimationFrame(tick);}
  function stopTimer(){if(runtime.raf)cancelAnimationFrame(runtime.raf);runtime.raf=0;}
  function pause(){if(runtime.state!=='playing')return;runtime.elapsedBeforePause=elapsedMs();runtime.startedAt=0;runtime.state='paused';runtime.pausePanel.hidden=false;}
  function resume(){if(runtime.state!=='paused')return;runtime.state='playing';runtime.pausePanel.hidden=true;runtime.startedAt=performance.now();startTimer();}

  function flipCard(index){if(runtime.state!=='playing'||runtime.inputLocked)return;const card=runtime.cards[index];if(!card||card.matched||card.revealed)return;card.revealed=true;renderDeck();if(runtime.first===null){runtime.first=index;return;}runtime.second=index;runtime.moves++;runtime.movesEl.textContent=String(runtime.moves);runtime.inputLocked=true;const a=runtime.cards[runtime.first],b=runtime.cards[runtime.second];if(a.key===b.key){setTimeout(()=>{a.matched=b.matched=true;a.revealed=b.revealed=true;runtime.matches++;runtime.matchEl.textContent=`${runtime.matches}/8`;tone('match');runtime.first=runtime.second=null;runtime.inputLocked=false;renderDeck();if(runtime.matches===8)finishRound();},220);}else{tone('miss');setTimeout(()=>{a.revealed=false;b.revealed=false;runtime.first=runtime.second=null;runtime.inputLocked=false;renderDeck();},650);}}
  function starRating(timeMs,moves){if(timeMs<=45000&&moves<=22)return 3;if(timeMs<=70000&&moves<=30)return 2;return 1;}
  async function finishRound(){if(runtime.state!=='playing')return;const timeMs=Math.max(1,Math.round(elapsedMs()));runtime.elapsedBeforePause=timeMs;runtime.startedAt=0;runtime.state='gameover';stopTimer();tone('complete');const stars=starRating(timeMs,runtime.moves);const accuracy=runtime.moves>0?Math.round(PAIRS.length/runtime.moves*100):100;runtime.finalTime.textContent=`${(timeMs/1000).toFixed(1)}s`;runtime.finalMoves.textContent=String(runtime.moves);runtime.finalBest.textContent=runtime.bestTimeMs>0?`${(Math.min(runtime.bestTimeMs,timeMs)/1000).toFixed(1)}s`:`${(timeMs/1000).toFixed(1)}s`;runtime.finalStars.textContent='⭐'.repeat(stars);runtime.finalXp.textContent='+0';runtime.rewardNote.className='memory-code-reward-note';runtime.rewardNote.textContent=runtime.round?'Checking reward…':'Practice run — account reward unavailable.';runtime.overPanel.hidden=false;
    if(!runtime.round?.sessionId||!runtime.bridge?.claimRound)return;
    try{const result=await runtime.bridge.claimRound(runtime.round.sessionId,{score:0,metrics:{completed:true,timeMs,moves:runtime.moves,pairs:8,accuracy,stars}});const rec=result?.gameRecord||result?.gameRecords?.memoryCode||{};runtime.bestTimeMs=Number(rec.bestTimeMs||runtime.bestTimeMs||timeMs);runtime.fewestMoves=Number(rec.fewestMoves||runtime.fewestMoves||runtime.moves);runtime.finalBest.textContent=runtime.bestTimeMs>0?`${(runtime.bestTimeMs/1000).toFixed(1)}s`:'—';runtime.finalXp.textContent=`+${Math.max(0,Number(result?.awardedXp||0))}`;
      if(result?.loginRequired){runtime.rewardNote.className='memory-code-reward-note warn';runtime.rewardNote.textContent='Practice mode — log in as a student to earn account XP.';}else if(result?.syncFailed){runtime.rewardNote.className='memory-code-reward-note warn';runtime.rewardNote.textContent='Record kept locally, but XP could not sync.';}else if(result?.capReached&&Number(result.awardedXp||0)===0){runtime.rewardNote.className='memory-code-reward-note warn';runtime.rewardNote.textContent='Daily Mini-Game XP limit reached. Keep playing for a faster time!';}else{runtime.rewardNote.className='memory-code-reward-note success';runtime.rewardNote.textContent=Number(result?.awardedXp||0)>0?`Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'Complete faster or in fewer moves for a bigger XP tier.';}try{runtime.onReward?.(result);}catch(_){}}
    catch(_){runtime.rewardNote.className='memory-code-reward-note warn';runtime.rewardNote.textContent='Reward could not be processed. No XP was added.';}}

  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.();}catch(_){}}
  function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.();}catch(_){}}
  function closeInternal(){if(!runtime.open)return;runtime.open=false;runtime.overlay.hidden=true;document.body.classList.remove('memory-code-active');stopTimer();runtime.state='ready';runtime.round=null;runtime.inputLocked=false;runtime.pausePanel.hidden=true;runtime.overPanel.hidden=true;}
  function open(options={}){build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;runtime.onReward=typeof options.onReward==='function'?options.onReward:null;const snap=runtime.bridge?.getSnapshot?.()||{};runtime.soundEnabled=snap.soundEnabled!==false;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bestTimeMs=Math.max(0,Number(snap.gameRecords?.memoryCode?.bestTimeMs||snap.bestScores?.memoryCode||0));runtime.fewestMoves=Math.max(0,Number(snap.gameRecords?.memoryCode?.fewestMoves||0));runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('memory-code-active');resetReady();}
  window.ICT8MemoryCode=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open});
})();
