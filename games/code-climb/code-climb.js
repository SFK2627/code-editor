(() => {
  'use strict';

  const GAME_ID = 'code-climb';
  const GLOBAL_NAME = 'ICT8CodeClimb';
  const PREFIX = 'CCL1';
  const ROOM_QR_PREFIX = 'ICT8CLIMB:';
  const COLORS = Object.freeze([
    { key: 'blue', label: 'BLUE', hex: '#38bdf8', soft: 'rgba(56,189,248,.22)' },
    { key: 'red', label: 'RED', hex: '#fb7185', soft: 'rgba(251,113,133,.22)' },
    { key: 'green', label: 'GREEN', hex: '#34d399', soft: 'rgba(52,211,153,.22)' },
    { key: 'yellow', label: 'YELLOW', hex: '#facc15', soft: 'rgba(250,204,21,.22)' }
  ]);
  const LADDERS = Object.freeze({ 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 });
  const SNAKES = Object.freeze({ 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 });
  const SIGNAL_POLL_MS = 650;
  const ROOM_TOUCH_MS = 90000;

  const P = () => window.ICT8ZeroDbP2P;
  const r = {
    built: false, open: false, bridge: null, music: null, onBack: null, onClose: null,
    overlay: null, panels: {}, state: 'home', role: '', localSeat: 0, roomCode: '', roomMeta: null,
    maxPlayers: 4, players: [], game: null, visualPositions: [0, 0, 0, 0], animationBusy: false,
    rollQueue: [], processingRollQueue: false, lastAppliedRollSeq: 0, localRollPending: false, rollRequestTimer: 0, diceAnticipationAt: 0, turnCueSeat: -1,
    peers: new Map(), guestSession: null, seatByUid: new Map(), signalTimer: 0, roomTouchTimer: 0,
    inviteTimer: 0, pendingInvites: [], scannerStop: null, audio: null, botTimer: 0,
    soloPace: 'balanced', disconnectedSeat: -1, closing: false
  };

  const $ = sel => r.overlay?.querySelector(sel) || null;
  const $$ = sel => Array.from(r.overlay?.querySelectorAll(sel) || []);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const identity = () => r.bridge?.getPlayerIdentity?.() || { loggedIn: false, uid: '', studentId: '', name: 'PLAYER', section: '' };
  const localPlayer = () => r.players.find(p => p.seat === r.localSeat) || null;
  const playerAt = seat => r.players.find(p => p.seat === seat) || null;
  const isHost = () => r.role === 'host';
  const isSolo = () => r.role === 'solo';
  const DIE_PIPS = Object.freeze({1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]});
  const PACE_PROFILES = Object.freeze({
    relaxed: Object.freeze({ diceRollMs:2550, diceHoldMs:1450, diceFadeMs:240, afterDiceMs:190, stepMs:340, stepSettleMs:70, snakeMs:1150, ladderMs:1000, specialPauseMs:180, botMinMs:1250, botMaxMs:1650 }),
    balanced: Object.freeze({ diceRollMs:2100, diceHoldMs:1200, diceFadeMs:220, afterDiceMs:160, stepMs:265, stepSettleMs:55, snakeMs:980, ladderMs:840, specialPauseMs:150, botMinMs:900, botMaxMs:1250 }),
    quick: Object.freeze({ diceRollMs:1600, diceHoldMs:900, diceFadeMs:190, afterDiceMs:120, stepMs:195, stepSettleMs:36, snakeMs:800, ladderMs:660, specialPauseMs:110, botMinMs:580, botMaxMs:820 })
  });
  const paceProfile = () => isSolo() ? (PACE_PROFILES[r.soloPace] || PACE_PROFILES.balanced) : PACE_PROFILES.balanced;

  // CODE CLIMB v8 — one large canvas-rendered physical die. This replaces the
  // stacked CSS-card cube used by earlier versions. The canvas renderer keeps a
  // solid cube silhouette at every angle, gives each face real perspective and
  // shading, and lands on the exact same authoritative value used for movement.
  const DIE_ROTATIONS = Object.freeze({
    1: Object.freeze({x:0,y:0,z:0}),
    2: Object.freeze({x:90,y:0,z:0}),
    3: Object.freeze({x:0,y:-90,z:0}),
    4: Object.freeze({x:0,y:90,z:0}),
    5: Object.freeze({x:-90,y:0,z:0}),
    6: Object.freeze({x:0,y:180,z:0})
  });
  const DEG = Math.PI / 180;
  const DICE_FACES = Object.freeze([
    Object.freeze({value:1,normal:[0,0,1],u:[1,0,0],v:[0,1,0],corners:[[-1,1,1],[1,1,1],[1,-1,1],[-1,-1,1]]}),
    Object.freeze({value:3,normal:[1,0,0],u:[0,0,-1],v:[0,1,0],corners:[[1,1,-1],[1,1,1],[1,-1,1],[1,-1,-1]]}),
    Object.freeze({value:6,normal:[0,0,-1],u:[-1,0,0],v:[0,1,0],corners:[[1,1,-1],[-1,1,-1],[-1,-1,-1],[1,-1,-1]]}),
    Object.freeze({value:4,normal:[-1,0,0],u:[0,0,1],v:[0,1,0],corners:[[-1,1,1],[-1,1,-1],[-1,-1,-1],[-1,-1,1]]}),
    Object.freeze({value:2,normal:[0,1,0],u:[1,0,0],v:[0,0,-1],corners:[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]}),
    Object.freeze({value:5,normal:[0,-1,0],u:[1,0,0],v:[0,0,1],corners:[[-1,-1,1],[1,-1,1],[1,-1,-1],[-1,-1,-1]]})
  ]);
  const DICE_GRID = Object.freeze([-0.52,0,0.52]);
  let diceAnimationSerial = 0;
  let diceRaf = 0;

  function stopDiceCanvasAnimation(){
    diceAnimationSerial += 1;
    if(diceRaf){cancelAnimationFrame(diceRaf);diceRaf=0;}
  }
  function clearDiceCanvas(canvas){
    stopDiceCanvasAnimation();
    if(!canvas)return;
    const ctx=canvas.getContext?.('2d');
    if(ctx){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width||1,canvas.height||1);}
  }
  function fitDiceCanvas(canvas){
    const rect=canvas.getBoundingClientRect();
    const cssW=Math.max(2,rect.width||canvas.clientWidth||320);
    const cssH=Math.max(2,rect.height||canvas.clientHeight||cssW);
    const dpr=Math.min(2.25,Math.max(1,window.devicePixelRatio||1));
    const pxW=Math.max(2,Math.round(cssW*dpr)),pxH=Math.max(2,Math.round(cssH*dpr));
    if(canvas.width!==pxW||canvas.height!==pxH){canvas.width=pxW;canvas.height=pxH;}
    const ctx=canvas.getContext('2d',{alpha:true});
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    return {ctx,w:cssW,h:cssH,dpr};
  }
  function rotate3(p,rx,ry,rz){
    let [x,y,z]=p;
    const cx=Math.cos(rx),sx=Math.sin(rx);let y1=y*cx-z*sx,z1=y*sx+z*cx;y=y1;z=z1;
    const cy=Math.cos(ry),sy=Math.sin(ry);let x1=x*cy+z*sy,z2=-x*sy+z*cy;x=x1;z=z2;
    const cz=Math.cos(rz),sz=Math.sin(rz);let x2=x*cz-y*sz,y2=x*sz+y*cz;
    return [x2,y2,z];
  }
  function projectDicePoint(p,w,h,state){
    const q=rotate3(p,state.rx,state.ry,state.rz);
    const camera=5.0;
    const perspective=camera/Math.max(2.35,camera-q[2]);
    const unit=Math.min(w,h)*0.258*state.scale;
    return {
      x:w*.5+state.shiftX*w+q[0]*unit*perspective,
      y:h*.5+state.lift*h-q[1]*unit*perspective,
      z:q[2],k:perspective
    };
  }
  function roundedQuadPath(ctx,pts,radius){
    const n=pts.length;if(n<3)return;
    const pair=(p,a,d)=>({x:p.x+(a.x-p.x)*d,y:p.y+(a.y-p.y)*d});
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)||1;
    const points=[];
    for(let i=0;i<n;i++){
      const p=pts[i],prev=pts[(i+n-1)%n],next=pts[(i+1)%n];
      const r=Math.min(radius,dist(p,prev)*.22,dist(p,next)*.22);
      points.push({p,start:pair(p,prev,r/dist(p,prev)),end:pair(p,next,r/dist(p,next))});
    }
    ctx.beginPath();ctx.moveTo(points[0].start.x,points[0].start.y);
    for(let i=0;i<n;i++){
      const item=points[i];ctx.quadraticCurveTo(item.p.x,item.p.y,item.end.x,item.end.y);
      const next=points[(i+1)%n];ctx.lineTo(next.start.x,next.start.y);
    }
    ctx.closePath();
  }
  function pipWorld(face,pos){
    const index=Math.max(1,Math.min(9,Number(pos)||5))-1;
    const gx=DICE_GRID[index%3],gy=DICE_GRID[Math.floor(index/3)];
    const n=face.normal,u=face.u,v=face.v;
    return [
      n[0]*1.012+u[0]*gx+v[0]*gy,
      n[1]*1.012+u[1]*gx+v[1]*gy,
      n[2]*1.012+u[2]*gx+v[2]*gy
    ];
  }
  function renderDiceCanvas(canvas,state){
    if(!canvas)return;
    const {ctx,w,h}=fitDiceCanvas(canvas);
    const s=Object.assign({rx:.42,ry:-.58,rz:.12,lift:0,shiftX:0,scale:1,shadowScale:1,shadowAlpha:.33},state||{});

    // Ground shadow: independent from the cube, so the die visibly leaves and
    // returns to a surface instead of looking like a flat icon spinning in place.
    const shadowX=w*.5+s.shiftX*w*.55,shadowY=h*.765;
    const shadowW=w*.29*s.scale*Math.max(.48,s.shadowScale),shadowH=h*.052*s.scale*Math.max(.56,s.shadowScale);
    ctx.save();ctx.globalAlpha=Math.max(0,Math.min(.5,s.shadowAlpha));ctx.filter=`blur(${Math.max(3,w*.014)}px)`;
    const sg=ctx.createRadialGradient(shadowX,shadowY,0,shadowX,shadowY,shadowW*.54);
    sg.addColorStop(0,'rgba(2,6,23,.72)');sg.addColorStop(.68,'rgba(2,6,23,.34)');sg.addColorStop(1,'rgba(2,6,23,0)');
    ctx.fillStyle=sg;ctx.beginPath();ctx.ellipse(shadowX,shadowY,shadowW,shadowH,0,0,Math.PI*2);ctx.fill();ctx.restore();

    const light=[-.36,.52,.78];
    const faces=DICE_FACES.map(face=>{
      const normal=rotate3(face.normal,s.rx,s.ry,s.rz);
      const points=face.corners.map(p=>projectDicePoint(p,w,h,s));
      const avgZ=points.reduce((sum,p)=>sum+p.z,0)/points.length;
      return {face,normal,points,avgZ};
    }).filter(row=>row.normal[2]>.015).sort((a,b)=>a.avgZ-b.avgZ);

    for(const row of faces){
      const pts=row.points;
      const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      const dot=Math.max(-1,Math.min(1,row.normal[0]*light[0]+row.normal[1]*light[1]+row.normal[2]*light[2]));
      const shade=Math.max(.76,Math.min(1.04,.89+dot*.12));
      const lo=Math.round(224*shade),mid=Math.round(240*shade),hi=Math.round(252*Math.min(1.02,shade+.06));
      const grad=ctx.createLinearGradient(minX,minY,maxX,maxY);
      grad.addColorStop(0,`rgb(${Math.min(255,hi)},${Math.min(255,hi)},255)`);
      grad.addColorStop(.48,`rgb(${Math.min(255,mid)},${Math.min(255,mid+4)},${Math.min(255,mid+10)})`);
      grad.addColorStop(1,`rgb(${Math.min(255,lo)},${Math.min(255,lo+8)},${Math.min(255,lo+17)})`);
      const edge=Math.max(4,Math.min(w,h)*.018);
      roundedQuadPath(ctx,pts,edge);
      ctx.save();ctx.fillStyle=grad;ctx.shadowColor='rgba(15,23,42,.16)';ctx.shadowBlur=Math.max(3,w*.012);ctx.fill();ctx.restore();
      roundedQuadPath(ctx,pts,edge);
      ctx.lineJoin='round';ctx.lineWidth=Math.max(1.1,w*.0042);ctx.strokeStyle='rgba(255,255,255,.82)';ctx.stroke();
      roundedQuadPath(ctx,pts,edge*.75);
      const gloss=ctx.createLinearGradient(minX,minY,maxX,maxY);
      gloss.addColorStop(0,'rgba(255,255,255,.28)');gloss.addColorStop(.42,'rgba(255,255,255,.06)');gloss.addColorStop(1,'rgba(125,160,195,.05)');
      ctx.fillStyle=gloss;ctx.fill();

      // Perspective-aware pips: project the center plus both local face axes so
      // circles gently compress when a face turns away from the camera.
      const value=row.face.value;
      for(const pos of (DIE_PIPS[value]||[])){
        const world=pipWorld(row.face,pos),center=projectDicePoint(world,w,h,s);
        const uWorld=[world[0]+row.face.u[0]*.112,world[1]+row.face.u[1]*.112,world[2]+row.face.u[2]*.112];
        const vWorld=[world[0]+row.face.v[0]*.112,world[1]+row.face.v[1]*.112,world[2]+row.face.v[2]*.112];
        const pu=projectDicePoint(uWorld,w,h,s),pv=projectDicePoint(vWorld,w,h,s);
        const rx=Math.max(2.2,Math.hypot(pu.x-center.x,pu.y-center.y));
        const ry=Math.max(2.0,Math.hypot(pv.x-center.x,pv.y-center.y));
        const angle=Math.atan2(pu.y-center.y,pu.x-center.x);
        ctx.save();ctx.translate(center.x,center.y);ctx.rotate(angle);
        ctx.shadowColor='rgba(15,23,42,.25)';ctx.shadowBlur=Math.max(1.5,w*.004);ctx.shadowOffsetY=Math.max(1,w*.0025);
        const pg=ctx.createRadialGradient(-rx*.25,-ry*.28,Math.min(rx,ry)*.08,0,0,Math.max(rx,ry));
        pg.addColorStop(0,'#475569');pg.addColorStop(.34,'#1e293b');pg.addColorStop(1,'#020617');
        ctx.fillStyle=pg;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    }

    // A soft highlight across the whole die makes the large render read as one
    // glossy physical object rather than several independent CSS cards.
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.12;
    const glow=ctx.createRadialGradient(w*.38,h*.31,0,w*.45,h*.42,w*.38);
    glow.addColorStop(0,'rgba(255,255,255,.75)');glow.addColorStop(.55,'rgba(255,255,255,.08)');glow.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.restore();
  }
  function diceFinalState(value){
    const target=DIE_ROTATIONS[Math.max(1,Math.min(6,Number(value)||1))]||DIE_ROTATIONS[1];
    return {rx:target.x*DEG,ry:target.y*DEG,rz:0,lift:0,shiftX:0,scale:1,shadowScale:1,shadowAlpha:.34};
  }
  function sampleMotion(points,t){
    if(t<=points[0][0])return points[0][1];
    for(let i=1;i<points.length;i++){
      if(t<=points[i][0]){
        const a=points[i-1],b=points[i],span=Math.max(.0001,b[0]-a[0]),u=(t-a[0])/span,e=u*u*(3-2*u);
        return a[1]+(b[1]-a[1])*e;
      }
    }
    return points[points.length-1][1];
  }
  function diceTumbleState(value,t){
    const roll=Math.max(1,Math.min(6,Number(value)||1));
    const target=DIE_ROTATIONS[roll]||DIE_ROTATIONS[1];
    const dirX=roll%2===0?-1:1,dirY=roll%3===0?1:-1,dirZ=(roll===2||roll===5)?-1:1;
    const remain=Math.pow(Math.max(0,1-t),1.48),settle=Math.pow(Math.max(0,1-t),2.25);
    const turnsX=(3+(roll%2))*Math.PI*2*dirX,turnsY=(4+(roll%3===0?1:0))*Math.PI*2*dirY,turnsZ=2*Math.PI*2*dirZ;
    const rx=target.x*DEG+(turnsX+.62*dirX)*remain;
    const ry=target.y*DEG+(turnsY-.78*dirY)*remain;
    const rz=target.z*DEG+(turnsZ+.28*dirZ)*remain*.88+.05*dirZ*settle;
    const lift=sampleMotion([[0,.045],[.11,-.01],[.29,-.175],[.50,-.12],[.68,-.038],[.775,.012],[.855,-.048],[.94,.006],[1,0]],t);
    const shiftX=sampleMotion([[0,-.018*dirX],[.26,.018*dirX],[.50,-.014*dirX],[.76,.009*dirX],[1,0]],t);
    const scale=sampleMotion([[0,.88],[.14,.96],[.31,1.035],[.57,1.015],[.775,.965],[.855,1.018],[.94,.994],[1,1]],t);
    const air=Math.max(0,Math.min(1,-lift/.175));
    let shadowScale=1-air*.48,shadowAlpha=.34-air*.18;
    if(t>.73&&t<.82){const impact=1-Math.abs(.775-t)/.045;shadowScale+=Math.max(0,impact)*.10;shadowAlpha+=Math.max(0,impact)*.09;}
    return {rx,ry,rz,lift,shiftX,scale,shadowScale,shadowAlpha};
  }
  function renderDiceFinal(canvas,value){
    stopDiceCanvasAnimation();
    renderDiceCanvas(canvas,diceFinalState(value));
    canvas.dataset.dieValue=String(Math.max(1,Math.min(6,Number(value)||1)));
  }
  function startDiceAnticipationCanvas(canvas){
    if(!canvas)return;
    stopDiceCanvasAnimation();
    const serial=diceAnimationSerial;
    const started=performance.now();
    const loop=now=>{
      if(serial!==diceAnimationSerial)return;
      const sec=(now-started)/1000;
      renderDiceCanvas(canvas,{
        rx:.48+sec*2.25,
        ry:-.62+sec*2.85,
        rz:.12+Math.sin(sec*2.4)*.16,
        lift:-.022-Math.sin(sec*3.1)*.012,
        shiftX:Math.sin(sec*1.7)*.008,
        scale:.94+Math.sin(sec*3.1)*.018,
        shadowScale:.78+Math.sin(sec*3.1)*.05,
        shadowAlpha:.25
      });
      diceRaf=requestAnimationFrame(loop);
    };
    diceRaf=requestAnimationFrame(loop);
  }
  async function playDiceTumbleCanvas(canvas,value,duration){
    const roll=Math.max(1,Math.min(6,Number(value)||1));
    if(!canvas)return;
    stopDiceCanvasAnimation();
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if(reduced){renderDiceFinal(canvas,roll);await sleep(Math.min(140,Math.max(0,Number(duration)||0)));return;}
    const serial=diceAnimationSerial;
    const rollMs=Math.max(1000,Number(duration)||2100);
    await new Promise(resolve=>{
      const started=performance.now();
      const frame=now=>{
        if(serial!==diceAnimationSerial){resolve();return;}
        const t=Math.max(0,Math.min(1,(now-started)/rollMs));
        renderDiceCanvas(canvas,diceTumbleState(roll,t));
        if(t>=1){diceRaf=0;canvas.dataset.dieValue=String(roll);resolve();return;}
        diceRaf=requestAnimationFrame(frame);
      };
      diceRaf=requestAnimationFrame(frame);
    });
    if(serial===diceAnimationSerial)renderDiceCanvas(canvas,diceFinalState(roll));
  }


  function build() {
    if (r.built) return;
    const o = document.createElement('div');
    o.className = 'p2p0-overlay climb-overlay';
    o.hidden = true;
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-label', 'Code Climb Snakes and Ladders');
    o.innerHTML = `
      <section class="p2p0-shell climb-shell">
        <header class="p2p0-top climb-top">
          <button type="button" data-back>← MINI-GAMES</button>
          <div class="p2p0-brand"><span>🐍🪜</span><div><small>1–4 PLAYERS · NO XP</small><strong>CODE CLIMB</strong></div></div>
          <div class="p2p0-top-actions"><button type="button" data-sound aria-label="Toggle sound">🔊</button><button type="button" data-close aria-label="Close Code Climb">×</button></div>
        </header>
        <main class="p2p0-main climb-main">
          <section class="p2p0-panel active" data-panel="home">
            <div class="p2p0-card p2p0-home-card climb-home">
              <span class="climb-hero">🐍🪜</span><h1>CODE CLIMB</h1>
              <p>Race to 100 with animated dice, ladders, snakes, and crystal-clear turn indicators on every screen.</p>
              <div class="p2p0-badges"><span>👤 1P + BOTS</span><span>👥 2–4 LIVE</span><span>🆔 STUDENT ID</span><span>📷 QR / CODE</span><span>0 XP</span></div>
              <div class="climb-home-actions"><button class="p2p0-btn primary" type="button" data-solo>PLAY SOLO</button><button class="p2p0-btn" type="button" data-host>CREATE LIVE ROOM</button><button class="p2p0-btn" type="button" data-join>JOIN LIVE ROOM</button></div>
              <small class="p2p0-note">Exact finish · roll 6 to roll again · direct host-star gameplay after pairing.</small>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="solo-setup">
            <div class="p2p0-card p2p0-pair-card climb-setup-card">
              <div class="p2p0-step-head"><span>1P</span><strong>Play against bots</strong></div>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME</span><input data-solo-name maxlength="20" value="PLAYER 1"></label>
              <label class="climb-select-field"><span>OPPONENTS</span><select data-bot-count><option value="1">1 Bot · 2 players</option><option value="2">2 Bots · 3 players</option><option value="3" selected>3 Bots · 4 players</option></select></label>
              <label class="climb-select-field"><span>GAME PACE</span><select data-solo-pace><option value="relaxed">Relaxed · slow and easy to follow</option><option value="balanced" selected>Balanced · smooth and graceful</option><option value="quick">Quick · faster turns</option></select></label>
              <div class="climb-rule-summary"><span>🎯</span><div><strong>CLASSIC RULES</strong><small>Exact roll to reach 100. Roll a 6 and you roll again.</small></div></div>
              <button class="p2p0-btn primary" type="button" data-start-solo>START SOLO MATCH</button><button class="p2p0-btn" type="button" data-cancel-setup>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="host-setup">
            <div class="p2p0-card p2p0-pair-card climb-setup-card">
              <div class="p2p0-step-head"><span>HOST</span><strong>Create a live room</strong></div>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME</span><input data-host-name maxlength="20" value="PLAYER 1"></label>
              <label class="climb-select-field"><span>LIVE PLAYERS</span><select data-live-count><option value="2">2 Players</option><option value="3">3 Players</option><option value="4" selected>4 Players</option></select></label>
              <div class="climb-rule-summary"><span>🌐</span><div><strong>HOST-STAR ROOM</strong><small>Guests pair with the Host, then gameplay runs directly between devices.</small></div></div>
              <button class="p2p0-btn primary" type="button" data-create-room>CREATE ROOM</button><div class="p2p0-status" data-create-status>Choose the room size, then invite classmates.</div><button class="p2p0-btn" type="button" data-cancel-setup>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="join">
            <div class="p2p0-card p2p0-pair-card climb-join-card">
              <div class="p2p0-step-head"><span>JOIN</span><strong>Join a live room</strong></div>
              <label class="p2p0-field"><span>YOUR DISPLAY NAME</span><input data-guest-name maxlength="20" value="PLAYER 2"></label>
              <section class="climb-invites" data-invites-wrap hidden><div class="climb-section-head"><div><small>ROOM INVITES</small><strong>Student ID invitations</strong></div><button type="button" data-refresh-invites>REFRESH</button></div><div data-invite-list></div></section>
              <div class="p2p0-method-card primary-method"><span class="p2p0-method-icon">📷</span><div><strong>SCAN ROOM QR</strong><small>The same Host QR works for every guest.</small></div></div>
              <button class="p2p0-btn primary" type="button" data-scan-room>SCAN ROOM QR</button>
              <div class="p2p0-or">OR</div>
              <label class="p2p0-field"><span>6-CHARACTER ROOM CODE</span><input data-room-code maxlength="6" autocapitalize="characters" placeholder="Example: CLM482"></label>
              <button class="p2p0-btn" type="button" data-join-code>JOIN ROOM</button><div class="p2p0-status" data-join-status>Scan the Host QR, enter the room code, or accept a Student ID invite.</div><button class="p2p0-btn" type="button" data-cancel-setup>CANCEL</button>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="lobby">
            <div class="p2p0-card climb-lobby-card">
              <div class="climb-room-head"><div><small>LIVE ROOM</small><strong data-room-code-label>------</strong></div><span data-room-count>1 / 4</span></div>
              <div class="climb-room-grid"><div class="climb-room-qr" data-room-qr-wrap hidden><img data-room-qr alt="Code Climb room QR"><small>Same QR for Players 2–4</small></div><div class="climb-roster" data-roster></div></div>
              <div class="climb-host-tools" data-host-tools hidden>
                <div class="p2p0-method-card primary-method"><span class="p2p0-method-icon">🆔</span><div><strong>INVITE BY STUDENT ID</strong><small>Invite classmates one at a time. Everyone joins this same room.</small></div></div>
                <div class="climb-invite-row"><input data-target-student maxlength="30" placeholder="Student ID"><button class="p2p0-btn primary" type="button" data-send-student>SEND INVITE</button></div>
                <div class="p2p0-status" data-host-room-status>Waiting for players to join.</div>
              </div>
              <div class="climb-lobby-actions"><button class="p2p0-btn primary" type="button" data-ready>I'M READY</button><button class="p2p0-btn primary" type="button" data-start-live hidden>START GAME</button><button class="p2p0-btn" type="button" data-leave-room>LEAVE ROOM</button></div>
            </div>
          </section>

          <section class="p2p0-panel climb-game-panel" data-panel="game">
            <div class="climb-game">
              <div class="climb-player-strip" data-player-strip></div>
              <div class="climb-play-layout">
                <div class="climb-board-wrap" data-board-wrap>
                  <div class="climb-board" data-board aria-label="Snakes and Ladders board"></div>
                  <svg class="climb-paths" data-paths viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"></svg>
                  <div class="climb-token-layer" data-token-layer></div>
                  <div class="climb-square-flash" data-square-flash></div>
                  <div class="climb-board-dice-overlay" data-board-dice hidden>
                    <div class="climb-board-dice-backdrop"></div>
                    <div class="climb-dice-stage"><small data-dice-player>YOUR ROLL</small><div class="climb-die-shell"><canvas class="climb-die-canvas" data-die aria-label="Rolling dice"></canvas></div><strong data-dice-result>ROLLING…</strong></div>
                  </div>
                </div>
                <aside class="climb-control-card" data-control-card>
                  <div class="climb-turn-banner" data-turn-banner><small>YOUR TURN</small><strong>ROLL THE DICE</strong></div>
                  <div class="climb-last-roll" data-last-roll><small>LAST ROLL</small><strong>🎲 —</strong></div>
                  <button class="climb-roll-btn" type="button" data-roll>🎲 ROLL NOW</button>
                  <div class="climb-board-turn-cue" data-board-turn-cue><small data-board-turn-kicker>YOUR TURN</small><strong data-board-turn-name>ROLL THE DICE</strong></div>
                  <div class="climb-event" data-event>First player to reach 100 wins.</div>
                  <div class="climb-rule-chips"><span>🎯 EXACT FINISH</span><span>🎲 6 = ROLL AGAIN</span></div>
                </aside>
              </div>
            </div>
          </section>

          <section class="p2p0-panel" data-panel="result">
            <div class="p2p0-card climb-result-card"><span class="climb-result-crown">🏆</span><small>MATCH COMPLETE</small><h2 data-result-title>YOU WIN!</h2><p data-result-sub>First to the summit.</p><div class="climb-standings" data-standings></div><div class="p2p0-actions"><button class="p2p0-btn primary" type="button" data-play-again>PLAY AGAIN</button><button class="p2p0-btn" type="button" data-result-hub>MINI-GAMES</button></div></div>
          </section>

          <div class="p2p0-scanner" data-scanner hidden><div class="p2p0-scanner-card"><div class="p2p0-scan-head"><strong>SCAN CODE CLIMB ROOM</strong><button type="button" data-scan-close>×</button></div><div class="p2p0-camera"><video data-scan-video playsinline muted></video></div><p class="p2p0-scan-status" data-scan-status>Point the camera at the Host QR.</p></div></div>
          <div class="climb-disconnect" data-disconnect hidden><div><span>📡</span><h2 data-disconnect-title>PLAYER DISCONNECTED</h2><p data-disconnect-text>The match is paused.</p><button class="p2p0-btn primary" type="button" data-continue-bot hidden>CONTINUE WITH BOT</button><button class="p2p0-btn" type="button" data-disconnect-exit>EXIT MATCH</button></div></div>
          <div class="climb-toast" data-toast hidden></div>
        </main>
      </section>`;
    document.body.appendChild(o);
    r.overlay = o;
    $$('[data-panel]').forEach(panel => { r.panels[panel.dataset.panel] = panel; });

    $('[data-back]').onclick = returnHub;
    $('[data-close]').onclick = () => close(true);
    $('[data-sound]').onclick = toggleSound;
    $('[data-solo]').onclick = () => show('solo-setup');
    $('[data-host]').onclick = () => show('host-setup');
    $('[data-join]').onclick = () => { show('join'); refreshInvites(true); startInvitePolling(); };
    $$('[data-cancel-setup]').forEach(b => { b.onclick = () => show('home'); });
    $('[data-start-solo]').onclick = startSolo;
    $('[data-create-room]').onclick = createRoom;
    $('[data-scan-room]').onclick = scanRoom;
    $('[data-join-code]').onclick = () => joinRoom($('[data-room-code]').value);
    $('[data-refresh-invites]').onclick = () => refreshInvites(true);
    $('[data-invite-list]').onclick = handleInviteListClick;
    $('[data-send-student]').onclick = sendStudentInvite;
    $('[data-ready]').onclick = toggleReady;
    $('[data-start-live]').onclick = startLiveGame;
    $('[data-leave-room]').onclick = leaveRoomToHome;
    $('[data-roll]').onclick = requestRoll;
    $('[data-play-again]').onclick = playAgain;
    $('[data-result-hub]').onclick = returnHub;
    $('[data-scan-close]').onclick = closeScanner;
    $('[data-continue-bot]').onclick = continueWithBot;
    $('[data-disconnect-exit]').onclick = leaveRoomToHome;
    window.addEventListener('resize', placeTokens);
    r.built = true;
    buildBoard();
  }

  function show(name) {
    Object.entries(r.panels).forEach(([key, panel]) => panel.classList.toggle('active', key === name));
    r.state = name;
    r.overlay?.classList.toggle('climb-game-open', name === 'game');
    if (name !== 'join') { clearTimeout(r.inviteTimer); r.inviteTimer = 0; }
    if (name === 'game') requestAnimationFrame(() => { renderGame(); placeTokens(); });
  }

  function buildBoard() {
    const board = $('[data-board]');
    if (!board || board.children.length) return;
    const visual = [];
    for (let row = 9; row >= 0; row--) {
      const nums = Array.from({ length: 10 }, (_, i) => row * 10 + i + 1);
      if (row % 2 === 1) nums.reverse();
      visual.push(...nums);
    }
    board.innerHTML = visual.map(n => {
      const type = LADDERS[n] ? ' ladder-start' : SNAKES[n] ? ' snake-start' : '';
      return `<div class="climb-cell${type}" data-square="${n}"><span>${n}</span></div>`;
    }).join('');
    renderPaths();
  }

  function cellCenter(n) {
    const value = clamp(n || 1, 1, 100);
    const rowFromBottom = Math.floor((value - 1) / 10);
    const pos = (value - 1) % 10;
    const col = rowFromBottom % 2 === 0 ? pos : 9 - pos;
    const rowFromTop = 9 - rowFromBottom;
    return { x: (col + .5) * 10, y: (rowFromTop + .5) * 10, col, row: rowFromTop };
  }

  function snakeGeometry(a,b,index=0){
    const p1=cellCenter(+a),p2=cellCenter(+b),x1=p1.x*10,y1=p1.y*10,x2=p2.x*10,y2=p2.y*10;
    const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    const bend=(index%2?1:-1)*Math.min(112,Math.max(58,len*.18)),mx=(x1+x2)/2,my=(y1+y2)/2;
    const c1={x:x1+dx*.18+nx*bend,y:y1+dy*.18+ny*bend},c2={x:mx-dx*.12+nx*bend,y:my-dy*.12+ny*bend};
    const c3={x:mx+dx*.12-nx*bend,y:my+dy*.12-ny*bend},c4={x:x2-dx*.18-nx*bend,y:y2-dy*.18-ny*bend};
    const headAngle=Math.atan2(y1-c1.y,x1-c1.x)*180/Math.PI;
    return {x1,y1,x2,y2,mx,my,c1,c2,c3,c4,headAngle,d:`M ${x1} ${y1} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${mx} ${my} C ${c3.x} ${c3.y} ${c4.x} ${c4.y} ${x2} ${y2}`};
  }
  function cubicPoint(p0,p1,p2,p3,t){const u=1-t;return{x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y};}
  function snakePoint(a,b,index,t){const g=snakeGeometry(a,b,index);if(t<=.5)return cubicPoint({x:g.x1,y:g.y1},g.c1,g.c2,{x:g.mx,y:g.my},t*2);return cubicPoint({x:g.mx,y:g.my},g.c3,g.c4,{x:g.x2,y:g.y2},(t-.5)*2);}

  function renderPaths() {
    const svg = $('[data-paths]');
    if (!svg) return;
    const parts = [];
    Object.entries(LADDERS).forEach(([a, b], index) => {
      const p1 = cellCenter(+a), p2 = cellCenter(+b);
      const x1 = p1.x * 10, y1 = p1.y * 10, x2 = p2.x * 10, y2 = p2.y * 10;
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const ox = -dy / len * 12, oy = dx / len * 12;
      parts.push(`<g class="climb-ladder ladder-${index}"><line class="rail shadow" x1="${x1+ox}" y1="${y1+oy}" x2="${x2+ox}" y2="${y2+oy}"/><line class="rail shadow" x1="${x1-ox}" y1="${y1-oy}" x2="${x2-ox}" y2="${y2-oy}"/><line class="rail" x1="${x1+ox}" y1="${y1+oy}" x2="${x2+ox}" y2="${y2+oy}"/><line class="rail" x1="${x1-ox}" y1="${y1-oy}" x2="${x2-ox}" y2="${y2-oy}"/>`);
      for (let i=1;i<8;i++){ const t=i/8, cx=x1+dx*t, cy=y1+dy*t; parts.push(`<line class="rung" x1="${cx+ox}" y1="${cy+oy}" x2="${cx-ox}" y2="${cy-oy}"/>`); }
      parts.push('</g>');
    });
    const palette=['#22c55e','#8b5cf6','#f97316','#06b6d4','#ec4899','#84cc16','#a855f7','#14b8a6'];
    Object.entries(SNAKES).forEach(([a,b],index)=>{
      const g=snakeGeometry(+a,+b,index),color=palette[index%palette.length];
      parts.push(`<g class="climb-snake snake-${index}" style="--snake:${color}"><path class="snake-outline" d="${g.d}"/><path class="snake-body" d="${g.d}"/><path class="snake-markings" d="${g.d}"/><circle class="snake-tail" cx="${g.x2}" cy="${g.y2}" r="7"/><g class="snake-head" transform="translate(${g.x1} ${g.y1}) rotate(${g.headAngle})"><ellipse rx="26" ry="18"/><circle class="snake-eye" cx="9" cy="-7" r="5"/><circle class="snake-eye" cx="9" cy="7" r="5"/><circle class="snake-pupil" cx="12" cy="-7" r="2.2"/><circle class="snake-pupil" cx="12" cy="7" r="2.2"/><path class="snake-mouth" d="M 12 0 Q 18 3 22 0"/><path class="snake-tongue" d="M 22 0 L 35 0 M 34 0 L 41 -5 M 34 0 L 41 5"/></g></g>`);
    });
    svg.innerHTML = parts.join('');
  }

  function createPlayer(seat, name, options = {}) {
    return { seat, uid: options.uid || `local-${seat}`, name: String(name || `PLAYER ${seat+1}`).slice(0, 24), color: COLORS[seat].key, ready: !!options.ready, connected: options.connected !== false, bot: !!options.bot, position: 0 };
  }

  function initializeGamePlayers() {
    resetRollPipeline();
    r.visualPositions = [0,0,0,0];
    r.players.forEach(p => { p.position = 0; });
    r.game = { status: 'playing', turnSeat: 0, winnerSeat: -1, rollSeq: 0 };
  }

  function startSolo() {
    clearNetwork();
    r.role = 'solo'; r.localSeat = 0; r.roomCode = ''; r.maxPlayers = clamp($('[data-bot-count]').value, 1, 3) + 1;
    r.soloPace = String($('[data-solo-pace]')?.value || 'balanced');
    const name = String($('[data-solo-name]').value || identity().name || 'PLAYER 1').trim().slice(0,20) || 'PLAYER 1';
    const botNames = ['BYTE BOT', 'PIXEL BOT', 'LOGIC BOT'];
    r.players = [createPlayer(0, name, { ready: true })];
    for (let seat=1; seat<r.maxPlayers; seat++) r.players.push(createPlayer(seat, botNames[seat-1], { bot:true, ready:true }));
    initializeGamePlayers();
    show('game'); renderGame(); sfx('start'); maybeScheduleBot();
  }

  function randomRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(6); try { crypto.getRandomValues(bytes); } catch (_) { for (let i=0;i<6;i++) bytes[i]=Math.floor(Math.random()*256); }
    return Array.from(bytes, b => chars[b % chars.length]).join('');
  }

  async function createRoom() {
    const status = $('[data-create-status]');
    const button = $('[data-create-room]');
    if (!r.bridge?.createCodeClimbRoom) { setStatus(status, 'Live room support is not loaded. Refresh the app.', true); return; }
    if (!identity().loggedIn) { setStatus(status, 'Sign in as a student before creating a live room.', true); return; }
    button.disabled = true; button.textContent = 'CREATING…';
    try {
      clearNetwork();
      r.role = 'host'; r.localSeat = 0; r.maxPlayers = clamp($('[data-live-count]').value, 2, 4);
      const name = String($('[data-host-name]').value || identity().name || 'HOST').trim().slice(0,20) || 'HOST';
      let meta = null, attempts = 0;
      while (!meta && attempts++ < 5) {
        try { meta = await r.bridge.createCodeClimbRoom({ roomCode: randomRoomCode(), maxPlayers: r.maxPlayers, hostName: name }); } catch (e) { if (attempts >= 5) throw e; }
      }
      r.roomMeta = meta; r.roomCode = meta.roomCode;
      r.players = [createPlayer(0, name, { uid: identity().uid, ready:false, connected:true })];
      r.seatByUid.set(identity().uid, 0);
      enterLobby(); startHostSignalLoop();
    } catch (error) { setStatus(status, error?.message || 'Could not create the room.', true); r.role=''; }
    finally { button.disabled=false; button.textContent='CREATE ROOM'; }
  }

  function enterLobby() {
    $('[data-room-code-label]').textContent = r.roomCode || '------';
    $('[data-host-tools]').hidden = !isHost();
    $('[data-start-live]').hidden = !isHost();
    const qrWrap = $('[data-room-qr-wrap]');
    if (isHost() && r.roomCode) {
      const url = r.bridge?.createQrDataUrl?.(`${ROOM_QR_PREFIX}${r.roomCode}`, 360) || '';
      if (url) { $('[data-room-qr]').src = url; qrWrap.hidden=false; }
    } else qrWrap.hidden=true;
    show('lobby'); renderLobby();
  }

  function renderLobby() {
    const roster = $('[data-roster]'); if (!roster) return;
    const bySeat = new Map(r.players.map(p => [p.seat,p]));
    roster.innerHTML = Array.from({ length: r.maxPlayers }, (_, seat) => {
      const p = bySeat.get(seat), c = COLORS[seat];
      if (!p) return `<div class="climb-roster-row empty" style="--player:${c.hex}"><span class="climb-roster-dot"></span><div><strong>PLAYER ${seat+1}</strong><small>Waiting for player…</small></div><b>OPEN</b></div>`;
      const you = seat===r.localSeat ? ' · YOU' : '';
      return `<div class="climb-roster-row ${p.ready?'ready':''} ${p.connected?'':'offline'}" style="--player:${c.hex}"><span class="climb-roster-dot"></span><div><strong>${esc(p.name)}${you}</strong><small>${c.label}${p.bot?' · BOT':''}</small></div><b>${p.connected ? (p.ready?'READY ✓':'NOT READY') : 'OFFLINE'}</b></div>`;
    }).join('');
    const connected = r.players.filter(p=>p.connected).length;
    $('[data-room-count]').textContent = `${connected} / ${r.maxPlayers}`;
    const me=localPlayer(); $('[data-ready]').textContent = me?.ready ? 'READY ✓' : "I'M READY";
    if (isHost()) {
      const full = connected === r.maxPlayers;
      const allReady = full && r.players.filter(p=>p.connected).every(p=>p.ready);
      const start=$('[data-start-live]'); start.disabled=!allReady; start.textContent=allReady?'START GAME':full?'WAITING FOR READY…':`WAITING FOR ${r.maxPlayers-connected} PLAYER${r.maxPlayers-connected===1?'':'S'}…`;
    }
  }

  function startHostSignalLoop() {
    clearTimeout(r.signalTimer); clearInterval(r.roomTouchTimer);
    const poll = async () => {
      if (!r.open || !isHost() || !r.roomCode) return;
      try {
        const joins = await r.bridge.listCodeClimbJoins({ roomCode:r.roomCode });
        joins.forEach(join => prepareHostPeer(join));
        const answers = await r.bridge.listCodeClimbAnswers({ roomCode:r.roomCode });
        for (const answer of answers) {
          const peer=r.peers.get(answer.uid);
          if (peer && !peer.answerApplied && answer.answerCode && Number(answer.updatedAtMs || 0) >= Number(peer.offerAt || 0)) {
            peer.answerApplied=true;
            try { await peer.session.applyAnswer(answer.answerCode); } catch (e) { peer.answerApplied=false; peer.connecting=false; }
          }
        }
      } catch (_) {}
      if (r.open && isHost() && r.roomCode) r.signalTimer=setTimeout(poll,SIGNAL_POLL_MS);
    };
    r.signalTimer=setTimeout(poll,180);
    r.roomTouchTimer=setInterval(()=>{ if(r.open&&isHost()&&r.roomCode)r.bridge.touchCodeClimbRoom({roomCode:r.roomCode,status:r.state==='game'?'playing':'lobby'}).catch(()=>{}); },ROOM_TOUCH_MS);
  }

  function nextFreeSeat(uid='') {
    if (uid && r.seatByUid.has(uid)) return r.seatByUid.get(uid);
    const used=new Set(r.players.map(p=>p.seat));
    for(let seat=1;seat<r.maxPlayers;seat++) if(!used.has(seat)) return seat;
    return -1;
  }

  async function prepareHostPeer(join) {
    if (!join?.uid || join.uid===identity().uid) return;
    const existing=r.peers.get(join.uid);
    if (existing && (existing.connected || existing.connecting)) return;
    const seat=nextFreeSeat(join.uid);
    if (seat<0) {
      r.bridge.setCodeClimbOffer({roomCode:r.roomCode,targetUid:join.uid,status:'full',seat:1,color:'red',offerCode:''}).catch(()=>{});
      return;
    }
    try { existing?.session?.close(); } catch (_) {}
    const peer={uid:join.uid,seat,name:String(join.name||`PLAYER ${seat+1}`),connected:false,connecting:true,answerApplied:false,session:null,offerAt:Date.now()};
    r.peers.set(join.uid,peer); r.seatByUid.set(join.uid,seat);
    let p=playerAt(seat); if(!p){p=createPlayer(seat,peer.name,{uid:join.uid,ready:false,connected:false});r.players.push(p);} else {p.name=peer.name;p.uid=join.uid;p.connected=false;p.bot=false;}
    renderLobby();
    const session=P().createSession({gameId:`code-climb-${r.roomCode}-${join.uid}`,prefix:PREFIX,channelLabel:'climb',timeoutMs:30000,onMessage:msg=>handleGuestMessage(join.uid,msg),onConnected:()=>hostPeerConnected(join.uid),onDisconnected:()=>hostPeerDisconnected(join.uid)});
    peer.session=session;
    try {
      const offer=await session.createOffer(localPlayer()?.name||'HOST');
      await r.bridge.setCodeClimbOffer({roomCode:r.roomCode,targetUid:join.uid,status:'offer',seat,color:COLORS[seat].key,offerCode:offer});
    } catch (e) { peer.connecting=false; }
  }

  function hostPeerConnected(uid) {
    const peer=r.peers.get(uid); if(!peer)return;
    peer.connected=true; peer.connecting=false;
    const p=playerAt(peer.seat); if(p){p.connected=true;p.name=peer.name;}
    renderLobby(); broadcastLobby();
    if (r.disconnectedSeat === peer.seat) hideDisconnect();
    peer.session.send({t:'welcome',roomCode:r.roomCode,seat:peer.seat,maxPlayers:r.maxPlayers,players:publicPlayers(),game:r.game});
    toast(`${peer.name} joined the room.`); sfx('join');
  }

  function hostPeerDisconnected(uid) {
    const peer=r.peers.get(uid); if(!peer)return;
    peer.connected=false;peer.connecting=false;peer.answerApplied=false;
    const p=playerAt(peer.seat); if(p){p.connected=false;p.ready=false;}
    renderLobby(); broadcastLobby();
    if(r.state==='game') showDisconnect(peer.seat,`${p?.name||'A player'} disconnected.`);
  }

  function publicPlayers(){return r.players.slice().sort((a,b)=>a.seat-b.seat).map(p=>({seat:p.seat,uid:p.uid,name:p.name,color:p.color,ready:!!p.ready,connected:!!p.connected,bot:!!p.bot,position:Number(p.position||0)}));}
  function broadcast(payload){for(const peer of r.peers.values())if(peer.connected)peer.session.send(payload);}
  function broadcastLobby(){broadcast({t:'lobby',maxPlayers:r.maxPlayers,players:publicPlayers()});}

  function handleGuestMessage(uid,msg){
    const peer=r.peers.get(uid); if(!peer||!msg)return;
    if(msg.t==='ready'){const p=playerAt(peer.seat);if(p){p.ready=!!msg.value;renderLobby();broadcastLobby();}}
    else if(msg.t==='rollRequest'){if(r.state==='game')hostRoll(peer.seat);}
    else if(msg.t==='leave'){hostPeerDisconnected(uid);}
  }

  async function joinRoom(rawCode) {
    const code=String(rawCode||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6), status=$('[data-join-status]');
    if(code.length!==6){setStatus(status,'Enter a valid 6-character room code.',true);return;}
    if(!identity().loggedIn){setStatus(status,'Sign in as a student before joining a live room.',true);return;}
    setStatus(status,'Finding room…');
    try{
      clearNetwork(); r.role='guest';r.localSeat=1;r.roomCode=code;
      const name=String($('[data-guest-name]').value||identity().name||'PLAYER').trim().slice(0,20)||'PLAYER';
      const req=await r.bridge.requestCodeClimbJoin({roomCode:code,name});r.roomMeta=req.meta;r.maxPlayers=req.meta.maxPlayers;
      r.players=[createPlayer(0,req.meta.hostName,{uid:req.meta.hostUid,ready:false,connected:true}),createPlayer(1,name,{uid:identity().uid,ready:false,connected:false})];
      setStatus(status,'Room found. Preparing direct connection…'); startGuestSignalLoop(name);
    }catch(error){r.role='';setStatus(status,error?.message||'Could not join the room.',true);}
  }

  function startGuestSignalLoop(name) {
    clearTimeout(r.signalTimer);
    const poll=async()=>{
      if(!r.open||r.role!=='guest'||!r.roomCode||r.guestSession?.connected)return;
      try{
        const offer=await r.bridge.getCodeClimbOffer({roomCode:r.roomCode});
        if(offer?.status==='full'){setStatus($('[data-join-status]'),'That room is already full.',true);return;}
        if(offer?.offerCode&&!r.guestSession){
          r.localSeat=Number(offer.seat||1); const me=r.players.find(p=>p.uid===identity().uid);if(me){me.seat=r.localSeat;me.color=COLORS[r.localSeat].key;}
          const session=P().createSession({gameId:`code-climb-${r.roomCode}-${identity().uid}`,prefix:PREFIX,channelLabel:'climb',timeoutMs:30000,onMessage:handleHostMessage,onConnected:guestConnected,onDisconnected:guestDisconnected});
          r.guestSession=session;
          const answer=await session.createAnswer(offer.offerCode,name); await r.bridge.setCodeClimbAnswer({roomCode:r.roomCode,answerCode:answer});
          setStatus($('[data-join-status]'),'Direct answer sent. Connecting…');
        }
      }catch(error){setStatus($('[data-join-status]'),error?.message||'Still waiting for the Host…',false);}
      if(r.open&&r.role==='guest'&&!r.guestSession?.connected)r.signalTimer=setTimeout(poll,SIGNAL_POLL_MS);
    };
    r.signalTimer=setTimeout(poll,120);
  }

  function guestConnected(){setStatus($('[data-join-status]'),'Connected to Host ✓',false,true);sfx('join');}
  function guestDisconnected(){if(r.state==='game')showDisconnect(r.localSeat,'Connection to the Host was lost.');else setStatus($('[data-join-status]'),'Connection lost. Rejoin using the same room code.',true);}

  function handleHostMessage(msg){
    if(!msg)return;
    if(msg.t==='welcome'){
      r.localSeat=Number(msg.seat||r.localSeat);r.maxPlayers=Number(msg.maxPlayers||r.maxPlayers);r.players=(msg.players||[]).map(p=>({...p}));if(msg.game)r.game={...msg.game};
      if(r.game?.status==='playing'){const resumeSeq=Number(r.game.rollSeq||0);resetRollPipeline();r.lastAppliedRollSeq=resumeSeq;r.visualPositions=r.players.map(p=>p.position||0);hideDisconnect();show('game');renderGame();}else{enterLobby();renderLobby();}
    }else if(msg.t==='lobby'){r.maxPlayers=Number(msg.maxPlayers||r.maxPlayers);r.players=(msg.players||[]).map(p=>({...p}));renderLobby();}
    else if(msg.t==='start'){resetRollPipeline();r.players=(msg.players||[]).map(p=>({...p}));r.game={...msg.game};r.visualPositions=r.players.map(p=>p.position||0);show('game');renderGame();sfx('start');}
    else if(msg.t==='roll'){enqueueRollEvent(msg.event);}
    else if(msg.t==='convertBot'){const p=playerAt(Number(msg.seat));if(p){p.bot=true;p.connected=true;}hideDisconnect();renderGame();}
    else if(msg.t==='exit'){showDisconnect(-1,'The Host ended the room.');}
  }

  async function sendStudentInvite(){
    const input=$('[data-target-student]'),status=$('[data-host-room-status]'),button=$('[data-send-student]');const target=String(input.value||'').trim();
    if(!target){setStatus(status,'Enter a Student ID first.',true);return;}
    button.disabled=true;button.textContent='SENDING…';
    try{const sent=await r.bridge.createTwoPlayerInvite({gameId:GAME_ID,targetStudentId:target,offerCode:`${PREFIX}.${r.roomCode}`,hostName:localPlayer()?.name||identity().name});setStatus(status,`Invite sent to ${sent.targetStudentId||target}.`,false,true);input.value='';}
    catch(error){setStatus(status,error?.message||'Could not send the invite.',true);}finally{button.disabled=false;button.textContent='SEND INVITE';}
  }

  async function refreshInvites(force=false){
    if(!r.bridge?.listTwoPlayerInvites||!identity().loggedIn)return;
    try{const result=await r.bridge.listTwoPlayerInvites({gameId:GAME_ID});r.pendingInvites=Array.isArray(result?.invites)?result.invites:[];renderInvites();}
    catch(error){if(force){$('[data-invites-wrap]').hidden=false;$('[data-invite-list]').innerHTML=`<div class="climb-invite-empty error">${esc(error?.message||'Could not load invites.')}</div>`;}}
  }
  function renderInvites(){const wrap=$('[data-invites-wrap]'),list=$('[data-invite-list]');if(!wrap||!list)return;wrap.hidden=false;if(!r.pendingInvites.length){list.innerHTML='<div class="climb-invite-empty">No pending CODE CLIMB invites.</div>';return;}list.innerHTML=r.pendingInvites.map(inv=>`<article class="climb-invite-card"><div><strong>${esc(inv.fromName||'Student')}</strong><small>${esc(inv.fromStudentId||'')}</small><p>invited you to room <b>${esc(String(inv.offerCode||'').split('.').pop()||'')}</b></p></div><div><button type="button" data-accept-invite="${esc(inv.inviteId)}">ACCEPT</button><button type="button" data-decline-invite="${esc(inv.inviteId)}">DECLINE</button></div></article>`).join('');}
  function startInvitePolling(){clearTimeout(r.inviteTimer);const poll=async()=>{if(!r.open||r.state!=='join')return;await refreshInvites(false);if(r.open&&r.state==='join')r.inviteTimer=setTimeout(poll,2500);};r.inviteTimer=setTimeout(poll,700);}
  async function handleInviteListClick(e){const a=e.target.closest('[data-accept-invite]'),d=e.target.closest('[data-decline-invite]');if(a){const inv=r.pendingInvites.find(x=>x.inviteId===a.dataset.acceptInvite);if(!inv)return;try{await r.bridge.respondTwoPlayerInvite({gameId:GAME_ID,inviteId:inv.inviteId,hostUid:inv.fromUid,status:'accepted',answerCode:`${PREFIX}.ROOM`});r.pendingInvites=r.pendingInvites.filter(x=>x!==inv);renderInvites();await joinRoom(String(inv.offerCode||'').split('.').pop());}catch(err){setStatus($('[data-join-status]'),err?.message||'Could not accept invite.',true);}}else if(d){const inv=r.pendingInvites.find(x=>x.inviteId===d.dataset.declineInvite);if(!inv)return;try{await r.bridge.respondTwoPlayerInvite({gameId:GAME_ID,inviteId:inv.inviteId,hostUid:inv.fromUid,status:'declined'});}catch(_){}r.pendingInvites=r.pendingInvites.filter(x=>x!==inv);renderInvites();}}

  function scanRoom(){
    if(!P()?.openScanner){setStatus($('[data-join-status]'),'QR scanner is unavailable. Enter the room code instead.',true);return;}
    closeScanner();const modal=$('[data-scanner]'),video=$('[data-scan-video]');modal.hidden=false;$('[data-scan-status]').textContent='Point the camera at the Host QR.';
    P().openScanner({video,acceptPrefix:ROOM_QR_PREFIX,onCode:value=>{closeScanner();joinRoom(String(value).slice(ROOM_QR_PREFIX.length));}}).then(stop=>{r.scannerStop=stop;}).catch(err=>{$('[data-scan-status]').textContent=err?.message||'Could not open camera.';});
  }
  function closeScanner(){try{r.scannerStop?.();}catch(_){}r.scannerStop=null;if($('[data-scanner]'))$('[data-scanner]').hidden=true;}

  function toggleReady(){const p=localPlayer();if(!p)return;p.ready=!p.ready;renderLobby();if(isHost()){broadcastLobby();}else r.guestSession?.send({t:'ready',value:p.ready});}
  function startLiveGame(){if(!isHost())return;const connected=r.players.filter(p=>p.connected);if(connected.length!==r.maxPlayers||!connected.every(p=>p.ready))return;initializeGamePlayers();broadcast({t:'start',players:publicPlayers(),game:r.game});show('game');renderGame();sfx('start');r.bridge.touchCodeClimbRoom({roomCode:r.roomCode,status:'playing'}).catch(()=>{});}

  function fairDie(){if(window.crypto?.getRandomValues){const a=new Uint32Array(1),limit=0xffffffff-(0xffffffff%6);do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%6+1;}return Math.floor(Math.random()*6)+1;}
  function nextSeat(current){const seats=r.players.filter(p=>p.connected||p.bot).map(p=>p.seat).sort((a,b)=>a-b);const i=seats.indexOf(current);return seats[(i+1)%seats.length];}
  function makeRollEvent(seat,value){
    const p=playerAt(seat);if(!p||!r.game||r.game.status!=='playing')return null;
    const from=Number(p.position||0),path=[];let landing=from,special=null;
    if(from+value<=100){for(let n=from+1;n<=from+value;n++)path.push(n);landing=from+value;if(LADDERS[landing])special={type:'ladder',from:landing,to:LADDERS[landing]};else if(SNAKES[landing])special={type:'snake',from:landing,to:SNAKES[landing]};}
    const finalPos=special?special.to:landing,winner=finalPos===100,extra=!winner&&value===6;
    const state={...r.game,rollSeq:Number(r.game.rollSeq||0)+1,winnerSeat:winner?seat:-1,status:winner?'finished':'playing',turnSeat:winner?seat:(extra?seat:nextSeat(seat))};
    const players=publicPlayers().map(x=>({...x,position:x.seat===seat?finalPos:x.position}));
    return {seq:state.rollSeq,seat,value,from,path,special,finalPos,winner,extra,state,players};
  }

  function resetRollPipeline(){
    clearTimeout(r.rollRequestTimer);r.rollRequestTimer=0;r.rollQueue=[];r.processingRollQueue=false;r.lastAppliedRollSeq=0;r.localRollPending=false;r.diceAnticipationAt=0;r.animationBusy=false;r.turnCueSeat=-1;
    const overlay=$('[data-board-dice]'),die=$('[data-die]');if(overlay){overlay.hidden=true;overlay.classList.remove('show','landed','hiding','anticipating');}if(die)clearDiceCanvas(die);
  }
  function cancelLocalRollPending(message=''){
    clearTimeout(r.rollRequestTimer);r.rollRequestTimer=0;r.localRollPending=false;r.diceAnticipationAt=0;
    const overlay=$('[data-board-dice]'),die=$('[data-die]');stopDiceCanvasAnimation();if(overlay){overlay.classList.add('hiding');setTimeout(()=>{if(!r.localRollPending){overlay.hidden=true;overlay.classList.remove('show','landed','hiding','anticipating');if(die)clearDiceCanvas(die);}},170);}
    if(message)toast(message);renderGame();
  }
  function startDiceAnticipation(seat){
    const overlay=$('[data-board-dice]'),die=$('[data-die]'),label=$('[data-dice-player]'),result=$('[data-dice-result]');if(!overlay||!die)return;
    const p=playerAt(seat),mine=seat===r.localSeat,color=COLORS[seat]?.hex||'#38bdf8';overlay.hidden=false;overlay.style.setProperty('--turn',color);overlay.classList.remove('hiding','landed');overlay.classList.add('show','anticipating');startDiceAnticipationCanvas(die);if(label)label.textContent=mine?'YOUR ROLL':`${String(p?.name||'PLAYER').toUpperCase()} ROLLS`;if(result)result.textContent='ROLLING…';r.diceAnticipationAt=performance.now();sfx('dice');
  }
  function requestRoll(){
    if(r.animationBusy||r.localRollPending||!r.game||r.game.status!=='playing')return;if(r.game.turnSeat!==r.localSeat)return;
    r.localRollPending=true;startDiceAnticipation(r.localSeat);renderGame();
    clearTimeout(r.rollRequestTimer);r.rollRequestTimer=setTimeout(()=>cancelLocalRollPending('Roll response timed out. Tap ROLL again.'),4200);
    if(isSolo()||isHost())hostRoll(r.localSeat);else r.guestSession?.send({t:'rollRequest'});
  }
  function hostRoll(seat){
    if(r.animationBusy||!r.game||r.game.status!=='playing'||r.game.turnSeat!==seat){if(seat===r.localSeat&&r.localRollPending)cancelLocalRollPending();return;}
    const event=makeRollEvent(seat,fairDie());if(!event)return;if(isHost())broadcast({t:'roll',event});enqueueRollEvent(event);
  }
  function enqueueRollEvent(event){
    const seq=Number(event?.seq||0);if(!event||!seq||seq<=r.lastAppliedRollSeq)return;if(r.rollQueue.some(x=>Number(x.seq||0)===seq))return;r.rollQueue.push(event);r.rollQueue.sort((a,b)=>Number(a.seq||0)-Number(b.seq||0));processRollQueue();
  }
  async function processRollQueue(){
    if(r.processingRollQueue)return;r.processingRollQueue=true;
    try{while(r.rollQueue.length){const event=r.rollQueue.shift();if(Number(event.seq||0)<=r.lastAppliedRollSeq)continue;await playRollEvent(event);r.lastAppliedRollSeq=Math.max(r.lastAppliedRollSeq,Number(event.seq||0));}}
    finally{r.processingRollQueue=false;}
  }

  async function playRollEvent(event){
    if(!event)return;r.animationBusy=true;clearTimeout(r.botTimer);
    if(event.seat===r.localSeat){clearTimeout(r.rollRequestTimer);r.rollRequestTimer=0;r.localRollPending=false;}
    const p=playerAt(event.seat),name=p?.name||`PLAYER ${event.seat+1}`;
    setEvent(`${name} is rolling…`);setTurnAccent(event.seat);await animateDie(event.value,event.seat);
    const last=$('[data-last-roll] strong');if(last)last.textContent=`🎲 ${event.value}`;
    if(!event.path.length){setEvent(`${name} rolled ${event.value}. Exact finish needed.`);sfx('blocked');await sleep(300);}else{
      for(const square of event.path){await animateTokenStep(event.seat,square);flashSquare(square,COLORS[event.seat].hex);sfx('step');}
      if(event.special){const pace=paceProfile();setEvent(event.special.type==='ladder'?`🪜 ${name} found a ladder!`:`🐍 ${name} landed on a snake!`);sfx(event.special.type);await sleep(pace.specialPauseMs);await animateSpecial(event.seat,event.special);r.visualPositions[event.seat]=event.special.to;placeTokens();await sleep(pace.stepSettleMs);}
    }
    r.game={...event.state};r.players=(event.players||r.players).map(x=>({...x}));r.visualPositions=r.players.map(p=>p.position||0);r.animationBusy=false;renderGame();
    if(event.winner){sfx('win');await sleep(420);showResult(event.seat);return;}
    if(event.extra)setEvent(`${name} rolled a 6 — ${event.seat===r.localSeat?'ROLL AGAIN!':'rolls again!'}`);else setEvent(`${playerAt(r.game.turnSeat)?.name||'Next player'} is up.`);
    await sleep(140);renderGame();maybeScheduleBot();
  }

  function maybeScheduleBot(){clearTimeout(r.botTimer);if(!isSolo()||r.state!=='game'||!r.game||r.game.status!=='playing'||r.animationBusy)return;const p=playerAt(r.game.turnSeat);if(!p?.bot)return;const pace=paceProfile(),delay=pace.botMinMs+Math.random()*Math.max(0,pace.botMaxMs-pace.botMinMs);r.botTimer=setTimeout(()=>hostRoll(p.seat),delay);}

  function announceTurn(turn,mine){
    const cue=$('[data-board-turn-cue]'),wrap=$('[data-board-wrap]');if(!cue||!wrap||!turn)return;const color=COLORS[turn.seat]?.hex||'#38bdf8';wrap.style.setProperty('--turn',color);wrap.classList.toggle('is-my-turn',mine);wrap.classList.toggle('is-waiting-turn',!mine);$('[data-board-turn-kicker]').textContent=mine?'YOUR TURN':`${COLORS[turn.seat]?.label||'PLAYER'} TURN`;$('[data-board-turn-name]').textContent=mine?'🎲 ROLL THE DICE':`WAITING FOR ${String(turn.name||'PLAYER').toUpperCase()}`;
    if(r.turnCueSeat!==turn.seat){r.turnCueSeat=turn.seat;cue.classList.remove('turn-enter');void cue.offsetWidth;cue.classList.add('turn-enter');}
  }
  function renderGame(){
    if(!r.game)return;renderPlayerStrip();renderTokens();const turn=playerAt(r.game.turnSeat),mine=r.game.turnSeat===r.localSeat;setTurnAccent(r.game.turnSeat);announceTurn(turn,mine);
    const banner=$('[data-turn-banner]');if(banner){banner.style.setProperty('--turn',COLORS[r.game.turnSeat]?.hex||'#38bdf8');banner.classList.toggle('mine',mine);banner.querySelector('small').textContent=mine?'YOUR TURN':`${String(turn?.name||'PLAYER').toUpperCase()}'S TURN`;banner.querySelector('strong').textContent=mine?(r.localRollPending?'ROLLING…':'ROLL THE DICE'):`WAITING FOR ${String(turn?.name||'PLAYER').toUpperCase()}`;}
    const roll=$('[data-roll]');if(roll){roll.disabled=!mine||r.animationBusy||r.localRollPending||r.game.status!=='playing';roll.textContent=mine?(r.localRollPending?'ROLLING…':'🎲 ROLL NOW'):'WAITING';roll.style.setProperty('--turn',COLORS[r.game.turnSeat]?.hex||'#38bdf8');roll.classList.toggle('ready',mine&&!r.animationBusy&&!r.localRollPending);}
    const card=$('[data-control-card]');card?.style.setProperty('--turn',COLORS[r.game.turnSeat]?.hex||'#38bdf8');
  }

  function renderPlayerStrip(){const strip=$('[data-player-strip]');if(!strip)return;strip.innerHTML=r.players.slice().sort((a,b)=>a.seat-b.seat).map(p=>{const c=COLORS[p.seat],active=r.game?.turnSeat===p.seat,you=p.seat===r.localSeat;return `<div class="climb-player-chip ${active?'active':''} ${you?'you':''}" style="--player:${c.hex};--player-soft:${c.soft}"><span></span><div><small>${you?'YOU':p.bot?'BOT':`P${p.seat+1}`} · ${c.label}</small><strong>${esc(p.name)}</strong><em>${active?(you?'YOUR TURN':'TURN'):''}</em></div><b>${p.position||'START'}</b></div>`;}).join('');}

  function renderTokens(){const layer=$('[data-token-layer]');if(!layer)return;const existing=new Map(Array.from(layer.children).map(n=>[Number(n.dataset.seat),n]));r.players.forEach(p=>{let token=existing.get(p.seat);if(!token){token=document.createElement('div');token.className='climb-token';token.dataset.seat=p.seat;token.innerHTML=`<i aria-hidden="true"></i><span>${p.seat+1}</span>`;layer.appendChild(token);}token.style.setProperty('--player',COLORS[p.seat].hex);token.classList.toggle('active',r.game?.turnSeat===p.seat);token.classList.toggle('you',p.seat===r.localSeat);});Array.from(layer.children).forEach(n=>{if(!r.players.some(p=>p.seat===Number(n.dataset.seat)))n.remove();});placeTokens();}

  function tokenPoint(seat,pos,positions=r.visualPositions){
    const wrap=$('[data-board-wrap]');if(!wrap)return{x:0,y:0};const rect=wrap.getBoundingClientRect(),center=pos>0?cellCenter(pos):{x:7+8*seat,y:96};
    const peers=r.players.filter(p=>{const other=Number(positions[p.seat]??p.position??0);return pos>0?other===pos:p.seat===seat;}).map(p=>p.seat).sort((a,b)=>a-b),idx=Math.max(0,peers.indexOf(seat)),offsets=[[-.21,-.2],[.21,-.2],[-.21,.2],[.21,.2]],off=offsets[idx]||[0,0],cell=rect.width/10;
    return{x:rect.width*(center.x/100)+off[0]*cell,y:rect.height*(center.y/100)+off[1]*cell,cell};
  }
  const tokenTransform=point=>`translate3d(${point.x}px,${point.y}px,0) translate(-50%,-50%)`;
  function placeTokens(){const layer=$('[data-token-layer]'),wrap=$('[data-board-wrap]');if(!layer||!wrap||!r.players.length)return;const rect=wrap.getBoundingClientRect();if(!rect.width||!rect.height)return;r.players.forEach(p=>{const token=layer.querySelector(`[data-seat="${p.seat}"]`);if(!token||token.classList.contains('stepping')||token.classList.contains('special'))return;const pos=Number(r.visualPositions[p.seat]??p.position??0);token.style.transform=tokenTransform(tokenPoint(p.seat,pos));});}
  async function animateTokenStep(seat,toSquare){
    const pace=paceProfile(),token=$(`[data-token-layer] [data-seat="${seat}"]`);if(!token){r.visualPositions[seat]=toSquare;placeTokens();await sleep(pace.stepSettleMs);return;}
    const fromPos=Number(r.visualPositions[seat]??playerAt(seat)?.position??0),before=[...r.visualPositions],after=[...r.visualPositions];after[seat]=toSquare;const a=tokenPoint(seat,fromPos,before),b=tokenPoint(seat,toSquare,after),hop=Math.max(6,Math.min(13,a.cell*.22));
    const px=t=>a.x+(b.x-a.x)*t,py=t=>a.y+(b.y-a.y)*t;
    token.classList.add('stepping');token.style.transform=tokenTransform(a);
    if(token.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const anim=token.animate([
        {offset:0,transform:`${tokenTransform(a)} scale(1)`},
        {offset:.34,transform:`translate3d(${px(.34)}px,${py(.34)-hop*.78}px,0) translate(-50%,-50%) scale(1.07)`},
        {offset:.62,transform:`translate3d(${px(.62)}px,${py(.62)-hop}px,0) translate(-50%,-50%) scale(1.11)`},
        {offset:.88,transform:`translate3d(${px(.92)}px,${py(.92)-hop*.22}px,0) translate(-50%,-50%) scale(1.035)`},
        {offset:1,transform:`${tokenTransform(b)} scale(1)`}
      ],{duration:pace.stepMs,easing:'cubic-bezier(.22,.72,.2,1)',fill:'forwards'});
      await anim.finished.catch(()=>{});
    }else await sleep(Math.min(90,pace.stepMs));
    r.visualPositions[seat]=toSquare;token.style.transform=tokenTransform(b);token.classList.remove('stepping');placeTokens();await sleep(pace.stepSettleMs);
  }

  async function animateSpecial(seat,special){
    const pace=paceProfile(),token=$(`[data-token-layer] [data-seat="${seat}"]`),wrap=$('[data-board-wrap]');if(!token||!wrap)return;const rect=wrap.getBoundingClientRect(),from=cellCenter(special.from),to=cellCenter(special.to),sx=rect.width*from.x/100,sy=rect.height*from.y/100,ex=rect.width*to.x/100,ey=rect.height*to.y/100;token.classList.add('special');
    const duration=special.type==='snake'?pace.snakeMs:pace.ladderMs;
    if(token.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const frames=[];if(special.type==='snake'){const index=Math.max(0,Object.keys(SNAKES).map(Number).indexOf(Number(special.from)));for(let i=0;i<=18;i++){const t=i/18,p=snakePoint(special.from,special.to,index,t);frames.push({transform:`translate3d(${rect.width*p.x/1000}px,${rect.height*p.y/1000}px,0) translate(-50%,-50%) scale(${1+Math.sin(t*Math.PI)*.12})`});}}else{for(let i=0;i<=12;i++){const t=i/12,ease=t*t*(3-2*t),wobble=Math.sin(t*Math.PI*6)*2.2;frames.push({transform:`translate3d(${sx+(ex-sx)*ease+wobble}px,${sy+(ey-sy)*ease}px,0) translate(-50%,-50%) scale(${1+Math.sin(t*Math.PI)*.1})`});}}await token.animate(frames,{duration,easing:'linear',fill:'forwards'}).finished.catch(()=>{});}else await sleep(Math.min(120,duration));token.classList.remove('special');
  }

  async function animateDie(value,seat){
    const pace=paceProfile(),overlay=$('[data-board-dice]'),die=$('[data-die]'),label=$('[data-dice-player]'),result=$('[data-dice-result]');
    if(!overlay||!die)return;
    const roll=Math.max(1,Math.min(6,Number(value)||1)),p=playerAt(seat),mine=seat===r.localSeat,color=COLORS[seat]?.hex||'#38bdf8',hadAnticipation=!!r.diceAnticipationAt;
    overlay.hidden=false;overlay.style.setProperty('--turn',color);overlay.classList.remove('hiding','landed');overlay.classList.add('show');overlay.classList.remove('anticipating');
    if(label)label.textContent=mine?'YOUR ROLL':`${String(p?.name||'PLAYER').toUpperCase()} ROLLS`;
    if(result)result.textContent='ROLLING…';
    if(!hadAnticipation)sfx('dice');

    await playDiceTumbleCanvas(die,roll,pace.diceRollMs);

    // One authoritative value drives the final cube orientation, result text,
    // LAST ROLL, and movement event. The cube is never repainted at landing.
    overlay.classList.add('landed');
    if(result)result.textContent=`ROLLED ${roll}`;
    const last=$('[data-last-roll] strong');if(last)last.textContent=`🎲 ${roll}`;
    sfx('land');
    await sleep(pace.diceHoldMs);
    overlay.classList.add('hiding');await sleep(pace.diceFadeMs);overlay.hidden=true;overlay.classList.remove('show','landed','hiding','anticipating');r.diceAnticipationAt=0;await sleep(pace.afterDiceMs);
  }

  function setTurnAccent(seat){r.overlay?.style.setProperty('--climb-turn',COLORS[seat]?.hex||'#38bdf8');}
  function setEvent(text){const el=$('[data-event]');if(el)el.textContent=text;}
  function flashSquare(square,color){const cell=$(`[data-square="${square}"]`);if(!cell)return;cell.style.setProperty('--flash',color);cell.classList.remove('flash');void cell.offsetWidth;cell.classList.add('flash');}

  function showResult(winnerSeat){const winner=playerAt(winnerSeat),mine=winnerSeat===r.localSeat;$('[data-result-title]').textContent=mine?'YOU WIN!':`${String(winner?.name||'PLAYER').toUpperCase()} WINS!`;$('[data-result-sub]').textContent='Reached square 100 first.';const standings=r.players.slice().sort((a,b)=>(b.position||0)-(a.position||0));$('[data-standings]').innerHTML=standings.map((p,i)=>`<div style="--player:${COLORS[p.seat].hex}"><span>${['🏆','🥈','🥉','4'][i]||i+1}</span><strong>${esc(p.name)}${p.seat===r.localSeat?' · YOU':''}</strong><b>${p.position}</b></div>`).join('');show('result');}
  function playAgain(){if(isSolo()){startSolo();return;}if(isHost()){r.players.forEach(p=>{p.position=0;p.ready=p.seat===0;});r.visualPositions=[0,0,0,0];r.game=null;show('lobby');renderLobby();broadcastLobby();}else{show('lobby');const p=localPlayer();if(p)p.ready=false;renderLobby();r.guestSession?.send({t:'ready',value:false});}}

  function showDisconnect(seat,text){r.disconnectedSeat=seat;const box=$('[data-disconnect]');$('[data-disconnect-title]').textContent=seat>=0?`${String(playerAt(seat)?.name||'PLAYER').toUpperCase()} DISCONNECTED`:'CONNECTION LOST';$('[data-disconnect-text]').textContent=text||'The match is paused.';$('[data-continue-bot]').hidden=!isHost()||seat<=0;box.hidden=false;}
  function hideDisconnect(){r.disconnectedSeat=-1;if($('[data-disconnect]'))$('[data-disconnect]').hidden=true;}
  function continueWithBot(){if(!isHost()||r.disconnectedSeat<1)return;const p=playerAt(r.disconnectedSeat);if(p){p.bot=true;p.connected=true;p.name=`${p.name} BOT`;const peer=Array.from(r.peers.values()).find(x=>x.seat===p.seat);peer?.session.close();broadcast({t:'convertBot',seat:p.seat});}hideDisconnect();renderGame();maybeScheduleBot();}

  function setStatus(el,text,error=false,ok=false){if(!el)return;el.textContent=String(text||'');el.classList.toggle('error',!!error);el.classList.toggle('ok',!!ok);}
  function toast(text){const el=$('[data-toast]');if(!el)return;el.textContent=text;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>{el.hidden=true;},1800);}
  function toggleSound(){const next=!(r.bridge?.getSnapshot?.()?.soundEnabled!==false);r.bridge?.setSoundEnabled?.(next);$('[data-sound]').textContent=next?'🔊':'🔇';if(next)r.music?.resume?.();else r.music?.pause?.();}
  function ac(){if(r.audio)return r.audio;try{r.audio=new (window.AudioContext||window.webkitAudioContext)();}catch(_){}return r.audio;}
  function sfx(kind){if(r.bridge?.getSnapshot?.()?.soundEnabled===false)return;const a=ac();if(!a)return;try{if(a.state==='suspended')a.resume();const map={dice:[190,310,.18],land:[120,90,.12],step:[520,610,.055],ladder:[520,880,.28],snake:[220,90,.35],win:[660,990,.5],join:[520,740,.22],start:[440,780,.28],blocked:[180,150,.16]},m=map[kind]||[420,520,.12],o=a.createOscillator(),g=a.createGain();o.type=kind==='snake'?'sawtooth':'triangle';o.frequency.setValueAtTime(m[0],a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(40,m[1]),a.currentTime+m[2]);g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(.13,a.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+m[2]);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+m[2]+.03);}catch(_){} }

  function clearNetwork(){stopDiceCanvasAnimation();clearTimeout(r.signalTimer);clearInterval(r.roomTouchTimer);clearTimeout(r.inviteTimer);clearTimeout(r.botTimer);clearTimeout(r.rollRequestTimer);r.signalTimer=r.roomTouchTimer=r.inviteTimer=r.botTimer=r.rollRequestTimer=0;r.rollQueue=[];r.processingRollQueue=false;r.localRollPending=false;r.diceAnticipationAt=0;for(const peer of r.peers.values())try{peer.session?.close();}catch(_){}r.peers.clear();try{r.guestSession?.close();}catch(_){}r.guestSession=null;r.seatByUid.clear();closeScanner();hideDisconnect();}
  async function leaveRoomToHome(){const room=r.roomCode,host=isHost();if(host)broadcast({t:'exit'});else r.guestSession?.send({t:'leave'});clearNetwork();if(room&&r.bridge?.leaveCodeClimbRoom)r.bridge.leaveCodeClimbRoom({roomCode:room,closeRoom:host}).catch(()=>{});r.role='';r.roomCode='';r.roomMeta=null;r.players=[];r.game=null;r.visualPositions=[0,0,0,0];r.lastAppliedRollSeq=0;r.turnCueSeat=-1;show('home');}
  function returnHub(){const cb=r.onBack;close(false);cb?.();}
  function close(call=true){if(!r.open)return;r.closing=true;const room=r.roomCode,host=isHost();if(host)broadcast({t:'exit'});else r.guestSession?.send({t:'leave'});clearNetwork();if(room&&r.bridge?.leaveCodeClimbRoom)r.bridge.leaveCodeClimbRoom({roomCode:room,closeRoom:host}).catch(()=>{});r.open=false;r.overlay.hidden=true;document.body.classList.remove('code-climb-active');r.role='';r.roomCode='';r.players=[];r.game=null;r.lastAppliedRollSeq=0;r.turnCueSeat=-1;r.closing=false;if(call)r.onClose?.();}
  function open(options={}){build();r.bridge=options.bridge||null;r.music=options.music||null;r.onBack=options.onBack||null;r.onClose=options.onClose||null;r.open=true;r.overlay.hidden=false;document.body.classList.add('code-climb-active');clearNetwork();r.role='';r.roomCode='';r.players=[];r.game=null;r.visualPositions=[0,0,0,0];r.lastAppliedRollSeq=0;r.turnCueSeat=-1;const id=identity();if(id.name){$('[data-solo-name]').value=id.name;$('[data-host-name]').value=id.name;$('[data-guest-name]').value=id.name;}$('[data-sound]').textContent=r.bridge?.getSnapshot?.()?.soundEnabled===false?'🔇':'🔊';show('home');}

  // Small deterministic helpers exposed for regression tests.
  const debug=Object.freeze({cellCenter,snakeGeometry,snakePoint,diePips:value=>[...(DIE_PIPS[Math.max(1,Math.min(6,Number(value)||1))]||[])],dieRotation:value=>({...DIE_ROTATIONS[Math.max(1,Math.min(6,Number(value)||1))]}),renderDicePreview:(canvas,value,progress=1)=>{const t=Math.max(0,Math.min(1,Number(progress)));renderDiceCanvas(canvas,t>=1?diceFinalState(value):diceTumbleState(value,t));return String(Math.max(1,Math.min(6,Number(value)||1)));},makeRollEvent:(players,game,seat,value)=>{const saveP=r.players,saveG=r.game;r.players=JSON.parse(JSON.stringify(players));r.game={...game};const out=makeRollEvent(seat,value);r.players=saveP;r.game=saveG;return out;},enqueueRollEvent,snapshot:()=>({players:JSON.parse(JSON.stringify(r.players)),game:r.game?{...r.game}:null,visualPositions:[...r.visualPositions],animationBusy:r.animationBusy,lastAppliedRollSeq:r.lastAppliedRollSeq,queued:r.rollQueue.map(x=>Number(x.seq||0)),localRollPending:r.localRollPending}),ladders:LADDERS,snakes:SNAKES});
  window[GLOBAL_NAME]=Object.freeze({open,close:()=>close(true),isOpen:()=>r.open,_debug:debug});
})();
