(() => {
  'use strict';
  if (window.ICT8ByteRunner3D) return;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const mod=(v,m)=>((v%m)+m)%m;
  const LANE_X=[-3.15,0,3.15];
  const SIDE_TRACK_X=[-7.35,7.35];
  const ALL_TRACK_X=[SIDE_TRACK_X[0],LANE_X[0],LANE_X[1],LANE_X[2],SIDE_TRACK_X[1]];
  const PLAY_TRACK_X=[LANE_X[0],LANE_X[1],LANE_X[2]];
  const COLORS={
    rail:[.53,.59,.62], sleeper:[.28,.21,.15], ballast:[.19,.23,.24], grass:[.10,.26,.18],
    train:[.075,.29,.39], trainTop:[.10,.43,.56], window:[.61,.88,.98], yellow:[.95,.72,.19],
    cyan:[.16,.74,.86], dark:[.025,.055,.075], white:[.90,.96,.98]
  };

  function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s;}
  function program(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p;}

  const M={
    ident(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);},
    mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;},
    t(x,y,z){const o=M.ident();o[12]=x;o[13]=y;o[14]=z;return o;},
    s(x,y,z){const o=M.ident();o[0]=x;o[5]=y;o[10]=z;return o;},
    rx(a){const c=Math.cos(a),s=Math.sin(a),o=M.ident();o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o;},
    ry(a){const c=Math.cos(a),s=Math.sin(a),o=M.ident();o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o;},
    rz(a){const c=Math.cos(a),s=Math.sin(a),o=M.ident();o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o;},
    persp(fov,asp,n,f){const q=1/Math.tan(fov/2),nf=1/(n-f),o=new Float32Array(16);o[0]=q/asp;o[5]=q;o[10]=(f+n)*nf;o[11]=-1;o[14]=2*f*n*nf;return o;},
    look(eye,target,up=[0,1,0]){let zx=eye[0]-target[0],zy=eye[1]-target[1],zz=eye[2]-target[2];let l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;let xx=up[1]*zz-up[2]*zy,xy=up[2]*zx-up[0]*zz,xz=up[0]*zy-up[1]*zx;l=Math.hypot(xx,xy,xz)||1;xx/=l;xy/=l;xz/=l;let yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;const o=M.ident();o[0]=xx;o[1]=yx;o[2]=zx;o[4]=xy;o[5]=yy;o[6]=zy;o[8]=xz;o[9]=yz;o[10]=zz;o[12]=-(xx*eye[0]+xy*eye[1]+xz*eye[2]);o[13]=-(yx*eye[0]+yy*eye[1]+yz*eye[2]);o[14]=-(zx*eye[0]+zy*eye[1]+zz*eye[2]);return o;}
  };

  const cubeVerts=new Float32Array([
    -1,-1, 1,0,0,1, 1,-1, 1,0,0,1, 1,1,1,0,0,1, -1,-1,1,0,0,1, 1,1,1,0,0,1, -1,1,1,0,0,1,
     1,-1,-1,0,0,-1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,
    -1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,-1,-1,-1,0,0,-1,1,1,-1,0,0,-1,1,-1,-1,0,0,
     1,-1,1,1,0,0,1,-1,-1,1,0,0,1,1,-1,1,0,0,1,-1,1,1,0,0,1,1,1,1,0,0,1,1,1,-1,0,0,
    -1,1,1,0,1,0,1,1,1,0,1,0,1,1,-1,0,1,0,-1,1,1,0,1,0,1,1,-1,0,1,0,-1,1,-1,0,1,0,
    -1,-1,-1,0,-1,0,1,-1,-1,0,-1,0,1,-1,1,0,-1,0,-1,-1,-1,0,-1,0,1,-1,1,0,-1,0,-1,-1,1,0,-1,0
  ]);
  const quadVerts=new Float32Array([-1,-1,0,0,0, 1,-1,0,1,0, 1,1,0,1,1, -1,-1,0,0,0, 1,1,0,1,1, -1,1,0,0,1]);

  function create(canvas){
    const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'})||canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'high-performance'});
    if(!gl) return null;
    const vs=`attribute vec3 aP;attribute vec3 aN;uniform mat4 uM;uniform mat4 uVP;uniform vec3 uCam;varying float vL;varying float vD;void main(){vec4 w=uM*vec4(aP,1.0);vec3 n=normalize(mat3(uM)*aN);vL=.40+.60*max(dot(n,normalize(vec3(-.38,.88,.34))),0.0);vD=distance(w.xyz,uCam);gl_Position=uVP*w;}`;
    const fs=`precision mediump float;uniform vec4 uC;uniform vec3 uFog;uniform float uFogNear;uniform float uFogFar;varying float vL;varying float vD;void main(){float f=smoothstep(uFogNear,uFogFar,vD);vec3 c=uC.rgb*vL;gl_FragColor=vec4(mix(c,uFog,f),uC.a);}`;
    const tvs=`attribute vec3 aP;attribute vec2 aUV;uniform mat4 uM;uniform mat4 uVP;varying vec2 vUV;void main(){vUV=aUV;gl_Position=uVP*uM*vec4(aP,1.0);}`;
    const tfs=`precision mediump float;uniform sampler2D uTex;uniform float uA;varying vec2 vUV;void main(){vec4 c=texture2D(uTex,vUV);if(c.a<.02)discard;gl_FragColor=vec4(c.rgb,c.a*uA);}`;
    let p,tp;try{p=program(gl,vs,fs);tp=program(gl,tvs,tfs);}catch(e){console.warn('[BYTE 3D] shader init failed',e);return null;}
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,cubeVerts,gl.STATIC_DRAW);
    const qbuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qbuf);gl.bufferData(gl.ARRAY_BUFFER,quadVerts,gl.STATIC_DRAW);
    const loc={p:{aP:gl.getAttribLocation(p,'aP'),aN:gl.getAttribLocation(p,'aN'),uM:gl.getUniformLocation(p,'uM'),uVP:gl.getUniformLocation(p,'uVP'),uC:gl.getUniformLocation(p,'uC'),uCam:gl.getUniformLocation(p,'uCam'),uFog:gl.getUniformLocation(p,'uFog'),uFogNear:gl.getUniformLocation(p,'uFogNear'),uFogFar:gl.getUniformLocation(p,'uFogFar')},t:{aP:gl.getAttribLocation(tp,'aP'),aUV:gl.getAttribLocation(tp,'aUV'),uM:gl.getUniformLocation(tp,'uM'),uVP:gl.getUniformLocation(tp,'uVP'),uTex:gl.getUniformLocation(tp,'uTex'),uA:gl.getUniformLocation(tp,'uA')}};
    const textures=new Map();
    let vp=M.ident(),cam=[0,4,8],cameraX=0,cameraY=4,cameraRoll=0,playerLean=0,lastLane=1,lastLanePos=1,lastRenderTime=0,laneVelocity=0,w=1,h=1,quality='high',qualityCeiling='high',fog=[.46,.72,.86];
    const seenNearMiss=new WeakSet();
    let nearMissPulse=0,nearMissSide=0,hitPulse=0,landingPulse=0,zonePulse=0,lastZone='city',lastStumble=0,lastLanding=0,perfClock=0,perfSamples=0,perfDt=0;
    let animJump=0,animSlide=0,animStumble=0,animRoof=0,catchPulse=0,tunnelFlash=0;
    let worldCurveAmount=0,worldCurvePhase=0,introBlend=0,finishBlend=0;

    function curveOffset(z){
      if(Math.abs(z)<.001||worldCurveAmount<.001)return 0;
      return worldCurveAmount*(Math.sin(worldCurvePhase+(-z)*.015)-Math.sin(worldCurvePhase));
    }
    function curveYaw(z){
      if(worldCurveAmount<.001)return 0;
      return clamp(worldCurveAmount*.015*Math.cos(worldCurvePhase+(-z)*.015),-.10,.10);
    }
    function worldLoopZ(base,pulse,factor,span=160,behind=18){
      const d=mod(base-pulse*factor+behind,span)-behind;
      return -d;
    }
    function drawBuilding(x,z,wid,depth,height,body,accent=[.12,.20,.26],seed=0){
      const y=height*.5-.08;
      shadow(x,.02,z,wid*.92,depth*.92,.24);
      cube(x,y,z,wid,height*.5,depth,body);
      // base / cornice / roof cap make it read as architecture instead of a plain box
      cube(x,.20,z,wid*1.03,.20,depth*1.03,[.10,.12,.15]);
      cube(x,height-.10,z,wid*1.04,.10,depth*1.04,accent);
      cube(x,height+.10,z,wid*.70,.10,depth*.70,[.08,.11,.14]);
      // front facade faces the railway corridor
      const frontZ=z+(z<0?depth+.025:depth+.025);
      const facingX=x<0?x+wid+.035:x-wid-.035;
      const rows=Math.max(2,Math.min(6,Math.floor(height/.82)));
      const cols=Math.max(2,Math.min(4,Math.floor(wid/.65)));
      const warm=(seed%3===0)?[.96,.78,.42]:seed%3===1?[.58,.86,.96]:[.80,.88,.72];
      for(let row=0;row<rows;row++){
        for(let col=0;col<cols;col++){
          const zz=z-depth*.68+(col/(Math.max(1,cols-1)))*depth*1.36;
          const yy=.72+row*.72;
          cube(facingX,yy,zz,.025,.18,.22,warm,0,0,0,.72);
        }
      }
      // entrance + awning toward the tracks
      cube(facingX,.55,z+.02,.035,.48,.32,[.05,.09,.12]);
      cube(facingX+(x<0?.08:-.08),1.07,z+.02,.18,.045,.46,accent);
      if(quality!=='low'&&seed%2===0){
        cube(facingX+(x<0?.055:-.055),1.48,z-.30,.025,.22,.46,[.09,.18,.22]);
      }
      if(quality==='high'){
        // balconies / rooftop equipment provide recognizable building silhouettes
        for(let b=0;b<2;b++){
          const by=1.85+b*1.35,bz=z-depth*.28+b*depth*.48;
          cube(facingX+(x<0?.10:-.10),by,bz,.12,.035,.52,[.18,.20,.22]);
          cube(facingX+(x<0?.16:-.16),by+.18,bz,.025,.18,.52,[.30,.34,.36],0,0,0,.82);
        }
        cube(x,height+.32,z-depth*.24,.32,.16,.28,[.15,.18,.20]);
        cube(x+(seed%2?-.42:.42),height+.29,z+depth*.25,.18,.13,.20,[.28,.30,.31]);
        // storefront band + vertical facade ribs create architectural depth at speed.
        const innerFace=x<0?x+wid+.08:x-wid-.08;
        cube(innerFace,.62,z,.05,.48,depth*.78,[.07,.12,.15],0,0,0,.92);
        for(let rib=-1;rib<=1;rib++) cube(innerFace+(x<0?.025:-.025),1.65+rib*.78,z-depth*.05,.025,.31,depth*.76,[.12,.15,.17],0,0,0,.68);
        cube(x,height+.58,z,.46,.15,.34,[.12,.14,.15]);
      }
    }
    function mat(x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){let m=M.t(x,y,z);if(ry)m=M.mul(m,M.ry(ry));if(rx)m=M.mul(m,M.rx(rx));if(rz)m=M.mul(m,M.rz(rz));return M.mul(m,M.s(sx,sy,sz));}
    function useSolid(){gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(loc.p.aP);gl.vertexAttribPointer(loc.p.aP,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(loc.p.aN);gl.vertexAttribPointer(loc.p.aN,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(loc.p.uVP,false,vp);gl.uniform3fv(loc.p.uCam,cam);gl.uniform3f(loc.p.uFog,fog[0],fog[1],fog[2]);gl.uniform1f(loc.p.uFogNear,34);gl.uniform1f(loc.p.uFogFar,122);}
    function cube(x,y,z,sx,sy,sz,c,rx=0,ry=0,rz=0,a=1){const cx=x+curveOffset(z),cyaw=ry+curveYaw(z);gl.uniformMatrix4fv(loc.p.uM,false,mat(cx,y,z,sx,sy,sz,rx,cyaw,rz));gl.uniform4f(loc.p.uC,c[0],c[1],c[2],a);gl.drawArrays(gl.TRIANGLES,0,36);}
    function shadow(x,y,z,sx,sz,a=.35){
      cube(x,y,z,sx,.010,sz,[.008,.015,.018],0,0,0,a*.48);
      cube(x,y+.002,z,sx*.78,.009,sz*.78,[.008,.015,.018],0,0,0,a*.34);
      cube(x,y+.004,z,sx*.55,.008,sz*.55,[.008,.015,.018],0,0,0,a*.22);
    }
    function limb(x,yTop,zTop,len,angle,thick,color,rz=0){const cy=yTop-Math.cos(angle)*len*.5,cz=zTop-Math.sin(angle)*len*.5;cube(x,cy,cz,thick,len*.5,thick,color,angle,0,rz);return [x,yTop-Math.cos(angle)*len,zTop-Math.sin(angle)*len];}

    function ring(x,y,z,radius,color,t,pieces=10,tilt=0,alpha=.72){
      for(let i=0;i<pieces;i++){const a=t+i*Math.PI*2/pieces;const px=x+Math.cos(a)*radius,pz=z+Math.sin(a)*radius*.46,py=y+Math.sin(a+tilt)*radius*.16;cube(px,py,pz,.045,.045,.16,color,0,-a,0,alpha);}
    }
    function byteBoard(r,t,x,base){
      if((r.boostTime||0)<=0)return;
      const pulse=.03+Math.sin(t*.018)*.018;
      cube(x,base+.12,.06,.62,.045,1.02,[.035,.13,.20],0,0,0,.98);
      cube(x,base+.17,.06,.50,.025,.90,[.12,.84,.94],0,0,0,.92);
      cube(x-.46,base+.13,.06,.055,.055,.82,[.98,.72,.15],0,0,0,.9);cube(x+.46,base+.13,.06,.055,.055,.82,[.98,.72,.15],0,0,0,.9);
      for(let i=0;i<5;i++){const zz=.65+i*.42+(t*.006%0.42);cube(x+(i%2?-.23:.23),base+.07,zz,.025+pulse,.025+pulse,.22,[.23,.90,1],0,0,0,.62);}
      if(quality!=='low')text('</>',x,base+.22,.02,.36,.12,.96,'yellow');
    }
    function powerAuras(r,t,x,base){
      if(r.shield>0){ring(x,base+1.18,.04,.82,[.63,.94,.27],t*.003,12,.2,.62);ring(x,base+1.20,.04,1.02,[.32,.82,.94],-t*.0022,8,.9,.36);}
      if((r.magnetTime||0)>0){for(let i=0;i<4;i++){const a=t*.0038+i*Math.PI/2;cube(x+Math.cos(a)*.86,base+1.14+Math.sin(a*1.7)*.22,.10+Math.sin(a)*.36,.075,.075,.075,[.22,.90,.98],a,a*.6,0,.88);}}
      if((r.multiplierTime||0)>0&&quality!=='low')text('2x',x,base+2.72,.02,.34,.13,.92,'yellow');
    }

    function makeText(label,variant='cyan'){
      const key=variant+'|'+String(label);if(textures.has(key))return textures.get(key);
      const c=document.createElement('canvas');c.width=512;c.height=160;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
      const palette=variant==='yellow'?['rgba(31,20,2,.94)','#facc15']:variant==='green'?['rgba(2,31,18,.94)','#86efac']:['rgba(3,15,35,.94)','#67e8f9'];
      x.fillStyle=palette[0];x.beginPath();if(x.roundRect)x.roundRect(8,8,496,144,28);else x.rect(8,8,496,144);x.fill();x.strokeStyle=palette[1];x.lineWidth=8;x.stroke();let fs=70;x.font=`900 ${fs}px ui-monospace,monospace`;while(x.measureText(String(label)).width>430&&fs>32){fs-=4;x.font=`900 ${fs}px ui-monospace,monospace`;}x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f8fafc';x.fillText(String(label),256,84);
      const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);textures.set(key,t);return t;
    }
    function text(label,x,y,z,sx=2.4,sy=.76,a=1,variant='cyan'){
      const tx=x+curveOffset(z),tyaw=curveYaw(z);
      gl.useProgram(tp);gl.bindBuffer(gl.ARRAY_BUFFER,qbuf);gl.enableVertexAttribArray(loc.t.aP);gl.vertexAttribPointer(loc.t.aP,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(loc.t.aUV);gl.vertexAttribPointer(loc.t.aUV,2,gl.FLOAT,false,20,12);gl.uniformMatrix4fv(loc.t.uVP,false,vp);gl.uniformMatrix4fv(loc.t.uM,false,mat(tx,y,z,sx,sy,1,0,tyaw,0));gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,makeText(label,variant));gl.uniform1i(loc.t.uTex,0);gl.uniform1f(loc.t.uA,a);gl.drawArrays(gl.TRIANGLES,0,6);useSolid();
    }

    function drawTrain(x,z,{roof=0,len=17,moving=false,side=false,color=COLORS.train,variant='commuter'}={}){
      const half=len*.5;const y=1.62+roof;
      const styles={
        commuter:{body:color,top:COLORS.trainTop,stripe:COLORS.yellow,window:[.34,.56,.64],windowGlow:[.74,.90,.96],front:[.50,.74,.82]},
        express:{body:[.12,.24,.48],top:[.12,.38,.62],stripe:[.95,.30,.23],window:[.35,.52,.67],windowGlow:[.82,.92,1],front:[.96,.82,.42]},
        metro:{body:[.18,.34,.31],top:[.13,.47,.40],stripe:[.22,.86,.72],window:[.28,.48,.42],windowGlow:[.78,.95,.88],front:[.48,.90,.78]},
        cargo:{body:[.28,.25,.22],top:[.20,.19,.18],stripe:[.94,.55,.12],window:[.32,.36,.38],windowGlow:[.62,.68,.70],front:[.92,.65,.26]},
        service:{body:[.42,.30,.09],top:[.33,.24,.08],stripe:[.98,.78,.17],window:[.36,.42,.44],windowGlow:[.86,.90,.92],front:[1,.86,.46]}
      };
      const st=styles[variant]||styles.commuter;
      shadow(x,.03+roof,z-half,1.28,half,.42);
      cube(x,y,z-half,1.26,1.60,half,st.body);
      cube(x,1.92+roof,z-half,1.02,.92,half*.93,[.05,.08,.10]);
      cube(x,3.12+roof,z-half,1.17,.18,half*.98,st.top);
      cube(x,1.48+roof,z+.08,1.08,.23,.08,st.stripe);
      cube(x,2.58+roof,z+.10,1.05,.18,.09,moving?st.front:[.50,.74,.82]);
      cube(x,2.16+roof,z+.20,1.02,.52,.13,[.06,.10,.12]);
      cube(x,2.04+roof,z-len+.18,1.01,.50,.12,[.05,.08,.10]);
      if(variant==='express'){cube(x,2.97+roof,z-half,1.20,.055,half*.94,[.93,.17,.18]);cube(x,1.06+roof,z-half,1.17,.035,half*.94,[.93,.17,.18]);}
      if(variant==='metro'){cube(x,2.98+roof,z-half,1.19,.045,half*.94,[.19,.90,.72]);}
      if(variant==='cargo'){cube(x,2.73+roof,z-half,1.20,.08,half*.94,[.13,.12,.12]);for(let k=0;k<3;k++)cube(x,1.34+roof,z-2.6-k*(len/3),1.18,.035,.06,[.68,.42,.12]);}
      if(variant==='service'){for(let k=0;k<4;k++)cube(x-.88+k*.58,2.96+roof,z-half,.13,.06,half*.88,k%2?[.10,.10,.11]:[.98,.78,.17],0,-.45,0);}
      const wheelCount=quality==='low'?3:5;
      for(let i=0;i<wheelCount;i++){
        const zz=z-1.6-i*((len-3)/Math.max(1,wheelCount-1));
        cube(x-.96,.36+roof,zz,.22,.30,.46,[.04,.05,.06]);cube(x+.96,.36+roof,zz,.22,.30,.46,[.04,.05,.06]);
      }
      const windowCount=variant==='cargo'?(quality==='low'?2:3):(quality==='low'?4:7);
      for(let i=0;i<windowCount;i++){
        const zz=z-1.1-i*((len-2.2)/Math.max(1,windowCount-1));
        if(variant==='cargo'){
          cube(x-.99,2.28+roof,zz,.035,.18,.36,st.window);cube(x+.99,2.28+roof,zz,.035,.18,.36,st.window);
        } else {
          cube(x-.99,2.23+roof,zz,.035,.33,.55,st.window);cube(x+.99,2.23+roof,zz,.035,.33,.55,st.window);
          cube(x-.965,2.23+roof,zz,.012,.20,.30,st.windowGlow,0,0,0,.70);cube(x+.965,2.23+roof,zz,.012,.20,.30,st.windowGlow,0,0,0,.70);
        }
      }
      if(moving){cube(x-.55,2.92+roof,z+.13,.13,.13,.06,[1,.92,.60]);cube(x+.55,2.92+roof,z+.13,.13,.13,.06,[1,.92,.60]);}
      if(!side&&quality!=='low'){
        const roofCount=variant==='express'?3:2;
        for(let i=0;i<roofCount;i++)cube(x,3.38+roof,z-half*(.48+i*.50),.28,.16,.42,[.05,.17,.22]);
        if(variant==='service'){cube(x,3.58+roof,z-half*.78,.08,.30,.08,[.72,.72,.70]);cube(x,3.92+roof,z-half*.78,.28,.035,.06,[.96,.72,.16]);}
      }
      if(quality==='high'&&side&&variant!=='cargo'){
        for(let i=0;i<Math.min(4,windowCount);i++){
          const zz=z-1.1-i*((len-2.2)/Math.max(1,windowCount-1));
          cube(x+(x<0?1.005:-1.005),2.23+roof,zz,.010,.11,.24,st.windowGlow,0,0,0,.20);
        }
      }
    }

    function player(r,t){
      const laneX=lerp(LANE_X[0],LANE_X[2],r.lanePos/2);
      const roof=(r.roofHeight||0)*2.15, jump=(r.jumpY||0)*1.48, base=roof+jump;
      const running=r.state==='RUNNING', speed=Math.max(18,r.speed||18);
      const phase=t*.001*(7.6+speed*.18), step=Math.sin(phase), stepCos=Math.cos(phase);
      const slideB=animSlide, airB=animJump, stumbleB=animStumble;
      const catchB=clamp(1-(r.catchSequence||0)/Math.max(.01,r.catchSequenceDuration||1.35),0,1);
      let targetLean=clamp((r.lane-lastLane)*-.22 + laneVelocity*-.025,-.30,.30);
      targetLean+=stumbleB*Math.sin(t*.031)*.18+catchB*Math.sin(t*.022)*.08;
      playerLean=lerp(playerLean,clamp(targetLean,-.46,.46),.18);lastLane=r.lane;
      const runWeight=(1-slideB)*(1-airB*.55)*(1-stumbleB*.28);
      const bob=(.018+.018*Math.abs(stepCos))*runWeight;
      const land=(r.landingKick||0)*.28;
      const hipY=base+lerp(1.08,.67,slideB)-land+bob-catchB*.06;
      const air=clamp(jump/1.5,0,1);
      shadow(laneX,roof+.025,.14,.70*(1-air*.34),.92*(1-air*.42),.46*(1-air*.48));
      byteBoard(r,t,laneX,base);powerAuras(r,t,laneX,base);

      // BYTE faces FORWARD down-track (-Z). The camera sees the BACKPACK (+Z), never the face.
      const runForwardLean=-.10*runWeight;
      const torsoPitch=runForwardLean + slideB*.70 + stumbleB*(.12+.12*Math.sin(t*.026)) + catchB*.12;
      const torsoTwist=step*.065*runWeight + laneVelocity*.0025 + stumbleB*Math.sin(t*.040)*.12;
      const torsoY=hipY+lerp(.62,.31,slideB), torsoZ=lerp(.00,.24,slideB);
      cube(laneX,torsoY,torsoZ,.42,.65-.18*slideB,.27,[.04,.20,.31],torsoPitch,torsoTwist,playerLean);
      // hoodie back panel
      cube(laneX,torsoY+.02,torsoZ+.285,.34,.46-.12*slideB,.075,[.035,.25,.34],torsoPitch,torsoTwist,playerLean);
      // unmistakable backpack on camera-facing side (+Z)
      cube(laneX,torsoY-.02,torsoZ+.48,.31,.43-.10*slideB,.16,[.03,.38,.48],torsoPitch,torsoTwist,playerLean);
      cube(laneX,torsoY+.28,torsoZ+.56,.25,.08,.17,[.05,.16,.22],torsoPitch,torsoTwist,playerLean);
      cube(laneX-.27,torsoY+.05,torsoZ+.31,.035,.40,.035,[.12,.64,.74],torsoPitch,torsoTwist,playerLean);
      cube(laneX+.27,torsoY+.05,torsoZ+.31,.035,.40,.035,[.12,.64,.74],torsoPitch,torsoTwist,playerLean);
      if(quality!=='low'&&slideB<.55) text('BYTE',laneX,torsoY+.01,torsoZ+.66,.30,.10,.92,'cyan');

      const headY=hipY+lerp(1.47,.82,slideB), headZ=lerp(-.02,.11,slideB);
      cube(laneX,headY,headZ,.27,.27,.25,[.90,.65,.48],torsoPitch*.34,0,playerLean*.30);
      // cap crown + rear cyan tab visible to camera; brim points FORWARD (-Z), away from camera.
      cube(laneX,headY+.21,headZ,.29,.11,.27,[.03,.08,.12],torsoPitch*.34,0,playerLean*.30);
      cube(laneX,headY+.25,headZ-.22,.24,.035,.15,[.03,.08,.12],torsoPitch*.34,0,playerLean*.30);
      cube(laneX,headY+.19,headZ+.27,.12,.05,.025,[.18,.82,.92],torsoPitch*.34,0,playerLean*.30);

      // Four-phase run cycle. Forward is -Z: positive thigh angle sends the foot forward.
      let leftThigh=step*.72*runWeight, rightThigh=-step*.72*runWeight;
      const leftSwing=Math.max(0,-stepCos)*runWeight, rightSwing=Math.max(0,stepCos)*runWeight;
      leftThigh=lerp(leftThigh,-.28,airB);rightThigh=lerp(rightThigh,.34,airB);
      leftThigh=lerp(leftThigh,1.08,slideB);rightThigh=lerp(rightThigh,1.16,slideB);
      leftThigh+=stumbleB*Math.sin(t*.034)*.24;rightThigh-=stumbleB*Math.sin(t*.034)*.24;
      const legSpread=lerp(.20,.24,slideB);
      const lk=limb(laneX-legSpread,hipY,.01,.66,leftThigh,.14,[.03,.10,.18],playerLean*.12);
      const leftShin=slideB?.88:airB?.48:(leftThigh-leftSwing*.72-.04);
      const lfoot=limb(lk[0],lk[1],lk[2],.58,leftShin,.13,[.04,.13,.21],playerLean*.10);
      cube(lfoot[0],lfoot[1]-.02,lfoot[2]-.16,.17,.08,.30,[.88,.92,.94],-.05+airB*.26+slideB*.32,0,playerLean*.08);
      const rk=limb(laneX+legSpread,hipY,.01,.66,rightThigh,.14,[.03,.10,.18],playerLean*.12);
      const rightShin=slideB?.94:airB?.56:(rightThigh-rightSwing*.72-.04);
      const rfoot=limb(rk[0],rk[1],rk[2],.58,rightShin,.13,[.04,.13,.21],playerLean*.10);
      cube(rfoot[0],rfoot[1]-.02,rfoot[2]-.16,.17,.08,.30,[.88,.92,.94],-.05+airB*.22+slideB*.32,0,playerLean*.08);

      let leftArm=-leftThigh*.88, rightArm=-rightThigh*.88;
      leftArm=lerp(leftArm,-.64,airB);rightArm=lerp(rightArm,-.56,airB);
      leftArm+=stumbleB*(.70+.24*Math.sin(t*.043))+catchB*.34;rightArm-=stumbleB*(.70-.24*Math.sin(t*.043))+catchB*.34;
      leftArm=lerp(leftArm,.94,slideB);rightArm=lerp(rightArm,.98,slideB);
      const armY=hipY+lerp(1.02,.54,slideB), armX=lerp(.49,.36,slideB);
      const la=limb(laneX-armX,armY,.00,.49,leftArm,.105,[.08,.34,.48],-.07+playerLean*.17);limb(la[0],la[1],la[2],.43,leftArm*.28-.12,.095,[.90,.65,.48],-.07);
      const ra=limb(laneX+armX,armY,.00,.49,rightArm,.105,[.08,.34,.48],.07+playerLean*.17);limb(ra[0],ra[1],ra[2],.43,rightArm*.28-.12,.095,[.90,.65,.48],.07);

      if(stumbleB>.02){for(let i=0;i<5;i++){const a=t*.012+i*Math.PI*2/5;cube(laneX+Math.cos(a)*(.48+.18*stumbleB),base+.82+Math.sin(a)*.36,.45,.055,.055,.18,[.98,.30,.28],0,a,0,.78*stumbleB);}}
      if((r.transferCue||0)>0&&r.transferTargetLane>=0&&quality!=='low'){
        const tx=LANE_X[clamp(r.transferTargetLane,0,2)];for(let i=1;i<=3;i++){const q=i/4;cube(lerp(laneX,tx,q),base+.12+Math.sin(q*Math.PI)*.28,-.12-q*.42,.05,.04,.14,[.30,.96,1],0,0,0,.62);}
      }
    }

    function obstacle(o){
      const lane=Math.max(0,Math.min(2,Math.round(o.lane)));const x=LANE_X[lane];const z=-(o.z||0)*.82;const roof=o.level==='roof'?2.32:0;const motionT=(performance.now()||0)*.001+(o.dynamicPhase||0);
      if(o.type==='train'){const variants=['commuter','express','metro','service'];const variant=variants[Math.abs((Math.round(o.lane||0)*3+Math.round((o.z||0)*.1)))%variants.length];drawTrain(x,z,{roof,len:o.moving?22:18,moving:Boolean(o.moving),variant});return;}
      if(o.type==='ramp'){
        shadow(x,.02,z,1.05,1.75,.26);cube(x,.30,z,.98,.18,1.72,[.04,.38,.50],-.24);cube(x,.49,z-.92,.80,.055,.54,[.20,.88,.98]);
        for(let i=0;i<4;i++)cube(x+(i-1.5)*.36,.53,z-.94,.10,.018,.55,i%2?[.98,.73,.18]:[.06,.12,.18]);return;
      }
      if(o.type==='roofTransfer'){
        const source=clamp(Number(o.sourceLane)||lane,0,2),target=clamp(Number(o.targetLane)||lane,0,2),sx=LANE_X[source],tx=LANE_X[target];
        cube(sx,.07+roof,z,1.18,.04,1.25,[.008,.012,.018]);cube(sx-.98,.11+roof,z,.07,.09,1.18,[.58,.64,.68]);cube(sx+.98,.11+roof,z,.07,.09,1.18,[.58,.64,.68]);
        cube(tx,.10+roof,z-1.15,1.10,.06,.42,[.10,.46,.55]);cube(tx-.98,.14+roof,z-1.15,.05,.08,.44,[.20,.90,1]);cube(tx+.98,.14+roof,z-1.15,.05,.08,.44,[.20,.90,1]);
        const pieces=quality==='low'?3:5;for(let i=1;i<=pieces;i++){const q=i/(pieces+1);cube(lerp(sx,tx,q),roof+.36+Math.sin(q*Math.PI)*.62,z-.18-q*.72,.055,.055,.18,[.25,.95,1],0,0,0,.88);}return;
      }

      if(o.type==='liftBarrier'){
        const lift=.06+.09*(.5+.5*Math.sin(motionT*3.1));shadow(x,.02+roof,z,.96,.34,.27);cube(x-.78,.48+roof,z,.07,.48,.09,[.17,.20,.23]);cube(x+.78,.48+roof,z,.07,.48,.09,[.17,.20,.23]);cube(x,.48+roof+lift,z,.83,.18,.15,[.70,.06,.08]);for(let i=-3;i<=3;i++)cube(x+i*.25,.49+roof+lift,z+.16,.08,.04,.025,i%2?[.98,.77,.18]:[.08,.08,.09],0,-.46,0);return;
      }
      if(o.type==='roofHatch'){
        const tilt=Math.sin(motionT*2.4)*.06;shadow(x,.02+roof,z,.80,.40,.22);cube(x,.26+roof,z,.76,.24,.40,[.25,.29,.33],tilt,0,0);cube(x,.52+roof,z-.08,.58,.045,.31,[.82,.62,.12],tilt,0,0);for(let i=-2;i<=2;i++)cube(x+i*.22,.31+roof,z+.42,.06,.03,.025,[.12,.15,.18]);return;
      }
      if(o.type==='swingSign'||o.type==='roofSwingSign'){
        const swing=Math.sin(motionT*2.2)*.16;shadow(x,.02+roof,z,1.02,.36,.22);cube(x-.90,1.42+roof,z,.07,1.42,.08,[.12,.16,.20]);cube(x+.90,1.42+roof,z,.07,1.42,.08,[.12,.16,.20]);cube(x-.44,2.20+roof,z,.025,.26,.025,[.58,.62,.64],0,0,swing*.35);cube(x+.44,2.20+roof,z,.025,.26,.025,[.58,.62,.64],0,0,swing*.35);cube(x,2.02+roof,z,.78,.22,.15,[.45,.15,.06],0,0,swing);if(quality!=='low')text(o.type==='roofSwingSign'?'SLIDE ROOF':'SLIDE SIGN',x,2.04+roof,z+.17,.70,.15,.92,'cyan');return;
      }
      if(o.type==='serviceGate'){
        const pulse=.5+.5*Math.sin(motionT*2.0),gap=.07+.05*pulse;shadow(x,.02+roof,z,1.09,.46,.30);cube(x,1.18+roof,z,1.06,1.18,.24,[.05,.09,.16]);cube(x-.55-gap,1.12+roof,z+.25,.46,1.03,.025,[.08,.22,.46]);cube(x+.55+gap,1.12+roof,z+.25,.46,1.03,.025,[.08,.22,.46]);for(let i=0;i<4;i++){const yy=.46+i*.48+roof;cube(x-.55-gap,yy,z+.28,.38,.025,.02,[.38,.70,1]);cube(x+.55+gap,yy,z+.28,.38,.025,.02,[.38,.70,1]);}cube(x-.72,.22+roof,z+.30,.07,.07,.02,[1,.12,.10]);cube(x+.72,.22+roof,z+.30,.07,.07,.02,[1,.12,.10]);return;
      }
      if(o.type==='barrier'){
        shadow(x,.02+roof,z,.94,.34,.28);cube(x-.72,.48+roof,z,.08,.48,.10,[.18,.20,.22]);cube(x+.72,.48+roof,z,.08,.48,.10,[.18,.20,.22]);cube(x,.55+roof,z,.78,.25,.15,[.90,.18,.12]);
        for(let i=0;i<5;i++)cube(x-.58+i*.29,.56+roof,z+.16,.09,.05,.025,i%2?[.98,.78,.18]:[.10,.10,.11],0,-.45,0);return;
      }
      if(o.type==='luggage'){
        shadow(x,.02+roof,z,.88,.42,.25);cube(x-.34,.28+roof,z,.34,.28,.26,[.73,.22,.24]);cube(x+.28,.24+roof,z+.06,.30,.24,.23,[.16,.42,.72]);cube(x,.62+roof,z-.04,.31,.26,.24,[.83,.56,.16]);
        cube(x-.34,.58+roof,z,.05,.18,.04,[.14,.14,.16]);cube(x,.89+roof,z-.04,.05,.17,.04,[.14,.14,.16]);return;
      }
      if(o.type==='maintenanceCart'){
        shadow(x,.02+roof,z,.92,.48,.27);cube(x,.36+roof,z,.78,.22,.38,[.88,.52,.10]);cube(x,.66+roof,z-.05,.68,.08,.30,[.24,.27,.30]);
        cube(x-.57,.16+roof,z+.25,.15,.15,.15,[.04,.06,.08]);cube(x+.57,.16+roof,z+.25,.15,.15,.15,[.04,.06,.08]);cube(x-.57,.16+roof,z-.25,.15,.15,.15,[.04,.06,.08]);cube(x+.57,.16+roof,z-.25,.15,.15,.15,[.04,.06,.08]);return;
      }
      if(o.type==='roofVent'){
        shadow(x,.02+roof,z,.82,.42,.24);cube(x,.34+roof,z,.80,.30,.44,[.34,.39,.43]);for(let i=-2;i<=2;i++)cube(x+i*.25,.58+roof,z+.25,.085,.02,.03,[.10,.14,.16]);return;
      }
      if(o.type==='lowSign'||o.type==='roofSign'){
        shadow(x,.02+roof,z,1.03,.38,.26);cube(x-.88,1.42+roof,z,.08,1.42,.10,[.13,.18,.22]);cube(x+.88,1.42+roof,z,.08,1.42,.10,[.13,.18,.22]);cube(x,2.06+roof,z,.92,.22,.16,[.10,.34,.48]);
        if(quality!=='low')text(o.type==='roofSign'?'SLIDE CLEARANCE':'SLIDE UNDER',x,2.08+roof,z+.17,.78,.16,.92,'cyan');return;
      }
      if(o.type==='pipe'||o.type==='roofPipe'){
        shadow(x,.02+roof,z,1.04,.36,.22);cube(x-.92,1.42+roof,z,.07,1.42,.08,[.31,.34,.35]);cube(x+.92,1.42+roof,z,.07,1.42,.08,[.31,.34,.35]);
        for(let i=-3;i<=3;i++)cube(x+i*.29,2.08+roof,z,.15,.15,.22,i%2?[.56,.60,.61]:[.35,.38,.39]);return;
      }
      if(o.type==='cableArch'){
        shadow(x,.02+roof,z,1.04,.34,.20);cube(x-.92,1.44+roof,z,.08,1.44,.08,[.12,.16,.20]);cube(x+.92,1.44+roof,z,.08,1.44,.08,[.12,.16,.20]);
        for(let i=0;i<5;i++){const sway=Math.sin(motionT*2.5+i*.72)*.08,xx=x-.68+i*.34+sway;cube(xx,2.14+roof-Math.abs(i-2)*.06,z,.025,.25,.025,[.95,.32,.20],0,0,sway*.9);}return;
      }
      if(o.type==='signalBox'){
        shadow(x,.02+roof,z,.72,.40,.26);cube(x,.92+roof,z,.56,.92,.32,[.18,.24,.29]);cube(x,1.32+roof,z+.33,.44,.18,.03,[.08,.12,.15]);cube(x-.15,1.33+roof,z+.36,.06,.06,.02,[.94,.18,.14]);cube(x+.15,1.33+roof,z+.36,.06,.06,.02,[.22,.86,.42]);return;
      }
      if(o.type==='constructionWall'){
        shadow(x,.02+roof,z,1.08,.46,.30);cube(x,1.18+roof,z,1.05,1.18,.24,[.86,.34,.08]);for(let i=-3;i<=3;i++)cube(x+i*.30,1.18+roof,z+.25,.10,1.02,.025,i%2?[.97,.79,.20]:[.94,.94,.92],0,-.42,0);return;
      }
      if(o.type==='beam'||o.type==='roofBeam'){
        shadow(x,.02+roof,z,1.08,.38,.3);cube(x-.86,1.30+roof,z,.13,1.30,.16,[.09,.18,.30]);cube(x+.86,1.30+roof,z,.13,1.30,.16,[.09,.18,.30]);cube(x,2.24+roof,z,.98,.20,.18,[.66,.06,.08]);
        for(let i=0;i<6;i++)cube(x-.75+i*.30,2.24+roof,z+.19,.12,.055,.02,i%2?[.98,.77,.18]:[.08,.08,.09]);
        cube(x-.82,.70+roof,z+.18,.055,.18,.03,[1,.20,.18]);cube(x+.82,.70+roof,z+.18,.055,.18,.03,[1,.20,.18]);return;
      }
      if(o.type==='wall'){
        shadow(x,.02+roof,z,1.12,.45,.34);cube(x,1.28+roof,z,1.08,1.28,.28,[.22,.05,.31]);cube(x,1.28+roof,z+.31,.82,.18,.04,[.87,.31,.96]);
        for(let i=0;i<3;i++){const yy=.70+i*.55;cube(x-.60,yy+roof,z+.32,.16,.07,.02,[.95,.68,.18]);cube(x+.60,yy+roof,z+.32,.16,.07,.02,[.95,.68,.18]);}return;
      }
      if(o.type==='roofGap'){
        cube(x,.04+roof,z,1.15,.035,.98,[.01,.012,.02]);cube(x-.98,.08+roof,z,.08,.08,.98,[.58,.63,.68]);cube(x+.98,.08+roof,z,.08,.08,.98,[.58,.63,.68]);
        cube(x-.82,.16+roof,z+.72,.09,.10,.08,[1,.24,.16]);cube(x+.82,.16+roof,z+.72,.09,.10,.08,[1,.24,.16]);return;
      }
      shadow(x,.02+roof,z,.92,.52,.28);cube(x,.38+roof,z,.84,.38,.46,[.31,.06,.11]);cube(x,.56+roof,z,.86,.06,.48,[.92,.55,.08]);
      for(let i=0;i<4;i++)cube(x-.57+i*.38,.39+roof,z+.47,.12,.055,.02,i%2?[.99,.78,.18]:[.11,.10,.10]);
    }

    function pickup(it,t){
      const x=lerp(LANE_X[0],LANE_X[2],clamp(it.lane,0,2)/2),z=-(it.z||0)*.82,y=(it.level==='roof'?2.52:.82)+(it.height||0)*.9;const spin=t*.003;const heart=it.type==='power'&&it.power==='heart';const c=it.type==='power'?(heart?[.86,.18,.28]:it.power==='shield'?[.65,.95,.25]:it.power==='magnet'?[.96,.30,.35]:it.power==='boost'?[.97,.70,.15]:[.70,.35,.96]):[.10,.82,.92];
      cube(x,y,z,.24,.24,.24,c,spin,spin*.7,spin*.5);if(it.type==='power'){for(let k=0;k<3;k++){const a=spin*1.8+k*Math.PI*2/3;cube(x+Math.cos(a)*.42,y+Math.sin(a*.8)*.18,z+Math.sin(a)*.24,.05,.05,.05,heart?[1,.80,.86]:[.92,.98,1]);}if(quality!=='low')text(it.label||'',x,y+.62,z+.03,.45,.16,.92,heart?'green':'yellow');}
    }

    function gateEnvironment(g,z,alpha,pulse){
      const theme=g?.theme||'station';
      if(theme==='station'){
        cube(-5.35,.20,z,1.18,.18,3.2,[.42,.43,.40],0,0,0,.82*alpha);cube(5.35,.20,z,1.18,.18,3.2,[.42,.43,.40],0,0,0,.82*alpha);
        cube(-4.18,.30,z,.06,.10,3.0,[.94,.71,.16],0,0,0,.95*alpha);cube(4.18,.30,z,.06,.10,3.0,[.94,.71,.16],0,0,0,.95*alpha);
        for(const side of [-1,1]){cube(side*5.15,1.48,z-.35,.08,1.48,.08,[.18,.23,.27],0,0,0,.9*alpha);cube(side*5.15,2.87,z-.35,.74,.055,.62,[.14,.36,.42],0,0,0,.88*alpha);}
        if(quality!=='low')text('HTML PLATFORM',0,3.18,z-.48,.92,.19,.68*alpha,'yellow');
      }else if(theme==='neon'){
        for(let k=0;k<5;k++){const zz=z+(k-2)*.76;cube(-5.0,1.55,zz,.045,1.55,.045,[.18,.80,.94],0,0,0,.48*alpha);cube(5.0,1.55,zz,.045,1.55,.045,[.72,.22,.94],0,0,0,.48*alpha);cube(0,3.03,zz,5.0,.035,.045,k%2?[.72,.22,.94]:[.18,.80,.94],0,0,0,(.32+.16*pulse)*alpha);}
        if(quality!=='low')text('CODE GATE',0,3.38,z-.54,.72,.17,.68*alpha,'cyan');
      }else if(theme==='tunnel'){
        for(let k=0;k<4;k++){const zz=z+(k-1.5)*1.08;cube(-5.25,1.72,zz,.12,1.72,.10,[.09,.12,.15],0,0,0,.92*alpha);cube(5.25,1.72,zz,.12,1.72,.10,[.09,.12,.15],0,0,0,.92*alpha);cube(0,3.36,zz,5.35,.12,.10,[.07,.10,.13],0,0,0,.92*alpha);cube(0,3.18,zz+.03,1.30,.035,.06,k%2?[.98,.68,.20]:[.24,.88,.98],0,0,0,(.54+.20*pulse)*alpha);}
        if(quality!=='low')text('</> CHECKPOINT',0,3.02,z-.64,.86,.18,.62*alpha,'cyan');
      }else{
        for(const side of [-1,1]){cube(side*4.70,.40,z+.8,.38,.40,.38,[.56,.23,.08],0,0,0,.72*alpha);cube(side*5.42,.34,z-.5,.24,.34,.24,[.15,.24,.29],0,0,0,.72*alpha);cube(side*4.95,1.16,z-1.1,.06,1.16,.06,[.21,.24,.26],0,0,0,.74*alpha);cube(side*4.95,2.17,z-1.1,.62,.07,.10,[.82,.49,.10],0,0,0,.74*alpha);}
        if(quality!=='low')text('BYTE YARD',0,3.18,z-.50,.78,.18,.62*alpha,'yellow');
      }
    }

    function gates(g){
      if(!g)return;
      const z=-(g.z||0)*.82,alpha=g.alpha==null?1:g.alpha;
      const motion=g.motion==='jump'?'JUMP':g.motion==='slide'?'SLIDE':'RUN';
      const enter=clamp((122-(g.z||0))/22,0,1),resolved=g.resolved?1:0;
      const pulse=.5+.5*Math.sin((performance.now()||0)*.007),open=clamp(.58+enter*.42,0,1);
      gateEnvironment(g,z,alpha,pulse);

      for(let i=0;i<3;i++){
        const x=LANE_X[i],isCorrect=i===g.correctLane,isSelected=i===g.selectedLane;
        let base=[.07,.42,.52],accent=[.12,.72,.84],variant='cyan';
        if(g.resolved){
          if(isCorrect){base=[.10,.54,.30];accent=[.48,.94,.58];variant='green';}
          else if(isSelected){base=[.58,.07,.10];accent=[1,.28,.30];variant='yellow';}
          else{base=[.13,.18,.22];accent=[.34,.42,.46];}
        }
        const lift=(1-enter)*.34;

        // Every action has a genuinely different physical silhouette.
        if(g.motion==='jump'){
          // JUMP = a genuinely LOW bench/barricade. Nothing overhead.
          const jumpBase=g.resolved?(isCorrect?[.20,.48,.18]:isSelected?[.58,.10,.10]:[.30,.20,.12]):[.52,.31,.10];
          shadow(x,.02,z,.98,.38,.24*alpha);
          cube(x,.29+lift,z+.08,.84*open,.12,.30,jumpBase,0,0,0,.98*alpha);                  // seat/plank
          cube(x-.64*open,.14+lift,z+.08,.075,.14,.22,[.16,.18,.18],0,0,0,.95*alpha);     // short legs
          cube(x+.64*open,.14+lift,z+.08,.075,.14,.22,[.16,.18,.18],0,0,0,.95*alpha);
          cube(x,.62+lift,z+.10,.78*open,.09,.07,accent,0,0,0,.94*alpha);                   // low bright rail
          for(let k=-3;k<=3;k++) cube(x+k*.20,.24+lift,z+.37,.065,.035,.022,k%2?accent:[.10,.10,.11],0,-.45,0,.92*alpha);
          text(g.lanes?.[i]||'',x,1.18+lift,z+.03,.96*open,.28*open,alpha,variant);
          if(quality!=='low') text('↑',x,.82+lift,z+.04,.30,.15,.72*alpha,'yellow');
        }else if(g.motion==='slide'){
          // SLIDE = a TALL arch with a clearly readable low clearance opening.
          // The bottom of the canopy sits above the slide pose but below standing head height.
          const slideFrame=g.resolved?(isCorrect?[.08,.38,.23]:isSelected?[.56,.08,.12]:[.10,.24,.34]):[.08,.28,.46];
          shadow(x,.02,z,1.10,.48,.25*alpha);
          cube(x-.92*open,1.08+lift,z,.075,1.08,.13,[.12,.17,.22],0,0,0,.95*alpha);
          cube(x+.92*open,1.08+lift,z,.075,1.08,.13,[.12,.17,.22],0,0,0,.95*alpha);
          cube(x,2.36+lift,z+.04,1.02*open,.28,.25,slideFrame,0,0,0,.98*alpha);                // raised canopy
          cube(x,2.04+lift,z+.12,.92*open,.045,.060,accent,0,0,0,.96*alpha);                 // underside clearance line
          for(let k=-4;k<=4;k++) cube(x+k*.22,2.37+lift,z+.29,.055,.035,.024,k%2?accent:[.08,.09,.11],0,-.45,0,.90*alpha);
          text(g.lanes?.[i]||'',x,2.84+lift,z+.06,1.06*open,.31*open,alpha,variant);
          if(quality!=='low') text('↓',x,1.42+lift,z+.055,.30,.16,.74*alpha,'cyan');
        }else{
          // RUN = a completely OPEN translucent scan portal. No bench, no canopy, no blocker.
          const portalA=(.12+.07*pulse)*alpha;
          cube(x-.94*open,1.45+lift,z,.035,1.45,.06,accent,0,0,0,.72*alpha);
          cube(x+.94*open,1.45+lift,z,.035,1.45,.06,accent,0,0,0,.72*alpha);
          cube(x,2.84+lift,z,.98*open,.035,.06,accent,0,0,0,.62*alpha);
          cube(x-.72*open,1.45+lift,z+.035,.16,1.30,.018,base,0,0,0,portalA);
          cube(x+.72*open,1.45+lift,z+.035,.16,1.30,.018,base,0,0,0,portalA);
          for(let k=0;k<5;k++){
            const zz=z+.18+k*.31;
            cube(x,.045,zz,.13+.045*k,.012,.075,accent,0,0,0,(.32+.10*pulse)*alpha);
          }
          text(g.lanes?.[i]||'',x,1.78+lift,z+.055,1.06*open,.33*open,alpha,variant);
          if(quality!=='low') text('→',x,1.06+lift,z+.05,.30,.15,.66*alpha,'green');
        }

        if(g.resolved&&isCorrect&&quality!=='low'){
          for(let k=0;k<5;k++){
            const zz=z+.38+k*.42;
            cube(x,.09,zz,.15,.016,.13,accent,0,0,0,.32+.16*pulse);
          }
        }
      }
    }
    function portal(r){if(!r.finishPortal)return;const z=-(r.finishPortal.z||0)*.82;const pulse=.06+Math.sin((r.finishPortal.pulse||0)*8)*.035;const c=[.55,.90,.16],approach=clamp(1-(r.finishPortal.z||0)/140,0,1);for(let frame=0;frame<4;frame++){const spread=frame*.16;cube(-1.48-spread,1.84,z-frame*.10,.08+pulse*.4,1.84+spread,.10,c,0,0,0,.80-frame*.13);cube(1.48+spread,1.84,z-frame*.10,.08+pulse*.4,1.84+spread,.10,c,0,0,0,.80-frame*.13);cube(0,3.58+spread,z-frame*.10,1.56+spread,.08+pulse*.4,.10,c,0,0,0,.80-frame*.13);}cube(0,.05,z,1.52,.03,1.20,[.24,.48,.08]);for(let i=0;i<9;i++){const zz=z+1.0+i*.34;cube((i-4)*.34,.10,zz,.12,.018,.20,[.50,.95,.20],0,0,0,.45+.25*approach);}text('</HTML>',0,2.28,z+.07,1.34+.12*approach,.40+.04*approach,1,'green');if(quality!=='low')text('VALIDATE',0,1.55,z+.075,.72,.18,.88,'cyan');if(quality==='high'){for(let i=0;i<8;i++){const a=(r.finishPortal.pulse||0)*2.2+i*Math.PI/4;cube(Math.cos(a)*1.8,1.80+Math.sin(a*1.6)*.65,z+.15+Math.sin(a)*.35,.035,.035,.18,[.68,1,.32],0,a,0,.45+.30*approach);}}}
    function chaser(r,t){
      // Keep the runner view clean during normal play. GLITCH only appears for the actual catch sequence.
      if(r.state!=='RUNNING'||r.questionPhase==='finish'||!(r.catchSequence>0))return;
      const pressure=1,x=lerp(LANE_X[0],LANE_X[2],r.lanePos/2);const catchDur=Math.max(.01,r.catchSequenceDuration||1.35),catchProgress=clamp(1-(r.catchSequence||0)/catchDur,0,1);
      const z=lerp(2.0+pressure*1.55,.48,catchProgress),y=.62+catchProgress*.16;shadow(x,.02,z,.42+.18*catchProgress,.46+.20*catchProgress,.25+.18*catchProgress);const pulse=.04+pressure*.05+catchProgress*.08;
      cube(x,y,z,.36+.10*catchProgress,.45+.12*catchProgress,.29+.08*catchProgress,[.25,.05,.48],0,t*.0018,0);cube(x,1.13+catchProgress*.16,z,.30+.07*catchProgress,.20+.05*catchProgress,.25+.06*catchProgress,[.48,.12,.70],0,-t*.0012,0);cube(x,1.18+catchProgress*.18,z-.26,.12,.12,.04,(r.chaserFlash||0)>0?[1,.20,.42]:[.82,.18,.92],0,0,0,.96);
      const armReach=.30+catchProgress*.72;cube(x-.35-catchProgress*.12,.88+catchProgress*.16,z-.12,.08,armReach,.08,[.54,.10,.76],-.72-catchProgress*.28,0,-.28);cube(x+.35+catchProgress*.12,.88+catchProgress*.16,z-.12,.08,armReach,.08,[.54,.10,.76],-.72-catchProgress*.28,0,.28);
      for(let i=0;i<6;i++){const a=t*.004+i*Math.PI/3;cube(x+Math.cos(a)*(.48+pulse),.88+Math.sin(a)*.26,z+Math.sin(a)*.18,.04+.02*catchProgress,.04+.02*catchProgress,.12,[.86,.30,1],0,a,0,.70+.18*catchProgress);}
      if(catchProgress>.45&&quality!=='low'){for(let i=0;i<8;i++){const a=t*.009+i*.78;cube(x+Math.cos(a)*(1.0-catchProgress*.35),.65+(i%4)*.34,z-.12+Math.sin(a)*.46,.035,.035,.28,[1,.18,.56],0,a,0,.55+catchProgress*.35);}}
      if(catchProgress>.52){
        const beamA=clamp((catchProgress-.52)/.48,0,1),midZ=(z+.10)*.5,beamLen=Math.max(.08,(z-.10)*.5);
        cube(x-.23,1.02+catchProgress*.08,midZ,.025+.018*beamA,.025+.018*beamA,beamLen,[.95,.18,.70],0,0,0,.48+.40*beamA);
        cube(x+.23,1.02+catchProgress*.08,midZ,.025+.018*beamA,.025+.018*beamA,beamLen,[.58,.24,1],0,0,0,.48+.40*beamA);
        if(quality!=='low'){ring(x,1.02,.06,.55+.12*Math.sin(t*.012),[.92,.18,.76],t*.006,10,.4,.35+.45*beamA);ring(x,1.18,.04,.78,[.46,.28,1],-t*.005,8,.8,.22+.38*beamA);}
        if(catchProgress>.78&&quality!=='low')text('GLITCH LOCK',x,2.42,.02,.62,.15,.72*beamA,'yellow');
      }
    }


    function drawRails(r){
      // Three playable tracks dominate the scene. Outer service tracks stay deliberately subdued.
      cube(0,-.22,-76,19.2,.18,118,COLORS.grass);
      cube(0,-.10,-76,9.35,.08,118,COLORS.ballast);
      const pulse=r.roadPulse||0;
      const railSpan=168, railSegs=quality==='low'?34:quality==='medium'?42:50;
      const segLen=railSpan/railSegs, railHalf=segLen*.34;
      for(let i=0;i<railSegs;i++){
        const z=worldLoopZ(i*segLen,pulse,1.0,railSpan,24);
        for(const trackX of ALL_TRACK_X){
          const side=Math.abs(trackX)>5.5;
          const c=side?[.25,.30,.32]:[.66,.70,.72];
          const rw=side?.038:.060;
          for(const dx of [-.62,.62]){
            cube(trackX+dx,.036,z,rw,.055,railHalf,c,0,0,0,side?.55:1);
            if(!side&&i%2===0){
              const jointZ=z+railHalf*.98;
              cube(trackX+dx,.078,jointZ,.15,.030,.085,[.26,.31,.34],0,0,0,.96);
              cube(trackX+dx-.11,.082,jointZ,.025,.018,.030,[.72,.76,.77]);
              cube(trackX+dx+.11,.082,jointZ,.025,.018,.030,[.72,.76,.77]);
            }
          }
        }
      }
      // Dense sleepers and track-bed plates are the forward-motion reference the eye can actually pass.
      const sleeperSpan=168, sleeperN=quality==='low'?42:quality==='medium'?56:72;
      for(let i=0;i<sleeperN;i++){
        const z=worldLoopZ(i*(sleeperSpan/sleeperN),pulse,1.0,sleeperSpan,24);
        for(const trackX of PLAY_TRACK_X){
          cube(trackX,-.015,z,1.20,.038,.115,COLORS.sleeper);
          if(i%3===0){cube(trackX-.62,.045,z,.13,.030,.16,[.17,.20,.21]);cube(trackX+.62,.045,z,.13,.030,.16,[.17,.20,.21]);}
        }
        // Outer service rails have fewer/darker sleepers so they never read as extra playable lanes.
        if(i%2===0) for(const trackX of SIDE_TRACK_X) cube(trackX,-.020,z,1.15,.028,.095,[.18,.19,.18],0,0,0,.52);
      }
      // Repeating lane-bed slabs / stains make it obvious that the runner is advancing through the world.
      const slabN=quality==='low'?12:18;
      for(let i=0;i<slabN;i++){
        const z=worldLoopZ(i*(168/slabN)+3.1,pulse,1.0,168,24);
        for(const trackX of PLAY_TRACK_X){
          cube(trackX,-.055,z,1.28,.010,.32,i%2?[.15,.18,.18]:[.12,.15,.15],0,0,0,.48);
          if(i%4===0) cube(trackX,.010,z+.19,.36,.014,.035,[.84,.65,.18],0,0,0,.42);
        }
      }
    }

    function worldZone(r){const d=mod((r.roadPulse||0)*.36,520);if(d<135)return 'city';if(d<245)return 'station';if(d<355)return 'tunnel';return 'code';}
    function cityProps(r){
      const segN=quality==='low'?8:quality==='medium'?12:16;
      const pulse=r.roadPulse||0;
      for(let i=0;i<segN;i++){
        const seed=(i*37)%17;
        const z=worldLoopZ(i*(220/segN),pulse,.24,220,32);
        const z2=worldLoopZ(i*(220/segN)+104,pulse,.24,220,32);
        const h=3.4+(seed%5)*.78;
        const leftCol=seed%3===0?[.23,.37,.48]:seed%3===1?[.48,.31,.22]:[.34,.30,.48];
        const rightCol=seed%3===0?[.32,.28,.43]:seed%3===1?[.24,.42,.38]:[.48,.34,.23];
        // Buildings are moved outside the dedicated side tracks so trains never cut through them.
        drawBuilding(-12.65,z,2.30,2.30,h,leftCol,[.18,.46,.55],seed);
        drawBuilding(12.75,z2,2.38,2.28,h*.92,rightCol,[.66,.42,.15],seed+5);
        if(i%3===0){
          const lampZ=worldLoopZ(i*(220/segN)+30,pulse,.24,220,32);
          cube(-9.35,.78,lampZ,.08,.78,.08,[.18,.21,.24]);cube(-9.35,1.56,lampZ,.34,.05,.05,[.90,.72,.20]);
          cube(9.35,.78,lampZ-3,.08,.78,.08,[.18,.21,.24]);cube(9.35,1.56,lampZ-3,.34,.05,.05,[.30,.84,.94]);
        }
      }
    }
    function stationProps(r){
      cube(-9.10,.18,-58,1.32,.18,90,[.45,.45,.42]);cube(9.10,.18,-58,1.32,.18,90,[.45,.45,.42]);
      cube(-7.76,.28,-58,.07,.12,90,[.94,.71,.16]);cube(7.76,.28,-58,.07,.12,90,[.94,.71,.16]);
      const n=quality==='low'?6:10;for(let i=0;i<n;i++){const z=worldLoopZ(i*(136/n),r.roadPulse||0,.45,136,16);for(const side of [-1,1]){const x=side*9.0;cube(x,1.65,z,.10,1.65,.10,[.20,.24,.27]);cube(x,3.16,z,.92,.07,1.55,[.18,.37,.42]);cube(x,2.98,z,.86,.04,1.45,[.82,.83,.72]);if(i%2===0){cube(x-side*.54,.62,z+.70,.55,.08,.18,[.28,.20,.14]);cube(x-side*.54,.78,z+.70,.05,.20,.18,[.18,.15,.13]);}if(i%3===0&&quality!=='low'){cube(x-side*.45,1.82,z-.55,.52,.38,.05,[.09,.20,.25]);text(i%2?'PLATFORM 1':'PLATFORM 2',x-side*.46,1.82,z-.49,.42,.12,.82,'yellow');}}}
      if(quality!=='low'){
        // Platform clutter gives the station depth without creating unfair playable-lane collisions.
        for(let i=0;i<5;i++){
          const z=worldLoopZ(i*27,r.roadPulse||0,.42,135,16),side=i%2?-1:1,x=side*8.70;
          if(i%3===0){cube(x,.34,z,.48,.20,.34,[.80,.46,.10]);cube(x-.34*side,.15,z+.28,.10,.10,.10,[.05,.06,.07]);cube(x+.34*side,.15,z+.28,.10,.10,.10,[.05,.06,.07]);}
          else if(i%3===1){cube(x,.52,z,.26,.52,.22,[.20,.28,.33]);cube(x,.93,z+.01,.20,.08,.18,[.82,.22,.18]);}
          else{cube(x,.40,z,.42,.40,.24,[.52,.18,.24]);cube(x+.30*side,.29,z+.10,.28,.29,.22,[.18,.42,.70]);}
        }
      }
      text('HTML STATION',-8.85,2.16,-22,.98,.26,.95,'yellow');text('BYTE LINE',8.85,2.16,-35,.86,.24,.92,'cyan');
    }
    function stationPlatformTrains(r,t){
      if(quality==='low')return;
      const phase=mod((r.roadPulse||0)*.20,150);
      for(let i=0;i<2;i++){
        const side=i?1:-1;const local=mod(phase+i*72,150);if(local<8||local>116)continue;
        const arrive=clamp((local-8)/24,0,1),depart=clamp((local-88)/28,0,1);const stopBlend=arrive*(1-depart);const z=lerp(-72,-29,arrive)-depart*54;
        const x=SIDE_TRACK_X[i];drawTrain(x,z,{len:26,moving:depart>.05,side:true,color:i?[.12,.31,.42]:[.18,.35,.30],variant:i?'express':'metro'});
        const doorOpen=stopBlend*clamp(.5+.5*Math.sin((t*.0012+i)*2.2),.12,1);const innerX=x-side*1.27;
        for(let car=0;car<3;car++){
          const dz=z-4.2-car*7.1;cube(innerX,1.55,dz-.28-doorOpen*.42,.035,.72,.34,[.08,.18,.23],0,0,0,.96);cube(innerX,1.55,dz+.28+doorOpen*.42,.035,.72,.34,[.08,.18,.23],0,0,0,.96);
          cube(innerX-side*.015,2.52,dz,.040,.15,.70,[.18,.72,.82],0,0,0,.64);
          if(doorOpen>.55){cube(innerX-side*.06,.46,dz,.03,.10,.55,[.94,.71,.18],0,0,0,.62);}
        }
      }
    }

    function tunnelProps(r){
      cube(-8.25,2.55,-60,.35,2.55,92,[.10,.13,.16]);cube(8.25,2.55,-60,.35,2.55,92,[.10,.13,.16]);cube(0,5.05,-60,8.60,.30,92,[.07,.10,.13]);
      const n=quality==='low'?8:14;for(let i=0;i<n;i++){const d=mod(i*(120/n)-(r.roadPulse||0)*.56,120)+5,z=-d;cube(0,4.72,z,8.25,.07,.10,[.30,.36,.39]);cube(-7.82,2.4,z,.07,2.4,.10,[.28,.33,.35]);cube(7.82,2.4,z,.07,2.4,.10,[.28,.33,.35]);const lamp=((i+Math.floor((r.roadPulse||0)*.02))%4===0)?[.98,.67,.20]:[.26,.88,.98];cube(-5.8,3.05,z,.42,.055,.05,lamp,0,0,0,.92);cube(5.8,3.05,z,.42,.055,.05,lamp,0,0,0,.92);if(quality==='high')cube(0,4.58,z,.78,.035,.06,lamp,0,0,0,.52);}
      if(tunnelFlash>.04){cube(0,4.48,-8,5.8,.035,.48,[.72,.96,1],0,0,0,.34+.42*tunnelFlash);cube(-6.9,2.45,-9,.04,1.55,.18,[.50,.92,1],0,0,0,.22+.38*tunnelFlash);cube(6.9,2.45,-9,.04,1.55,.18,[.50,.92,1],0,0,0,.22+.38*tunnelFlash);}
      text('</HTML> TUNNEL',0,3.75,-31,1.22,.28,.92,'cyan');
    }
    function codeDistrictProps(r){
      const n=quality==='low'?7:12,pulse=r.roadPulse||0,labels=['<HTML>','CSS','JS','</>'];
      for(let i=0;i<n;i++){
        const side=i%2?-1:1,z=worldLoopZ(i*(170/n),pulse,.31,170,18),x=side*(11.2+(i%3)*.32),h=3.6+(i%4)*.82;
        drawBuilding(x,z,1.75,1.85,h,[.08,.11,.19],i%2?[.18,.58,.72]:[.50,.24,.70],i+20);
        if(quality!=='low') text(labels[i%labels.length],x-side*1.82,1.82+(i%2)*.62,z+.18,.72,.22,.84,i%2?'yellow':'cyan');
      }
    }

    function transitionStructures(r){
      const phase=mod((r.roadPulse||0)*.36,520);const gates=[
        {at:0,label:'BYTE CITY',variant:'cyan',accent:[.18,.72,.82]},
        {at:135,label:'HTML STATION',variant:'yellow',accent:[.94,.65,.14]},
        {at:245,label:'CODE TUNNEL',variant:'cyan',accent:[.20,.88,.98]},
        {at:355,label:'CODE DISTRICT',variant:'green',accent:[.42,.88,.48]}
      ];
      for(const g of gates){let rel=mod(g.at-phase+260,520)-260;if(rel<-9||rel>55)continue;const z=-rel*1.18;const c=g.accent;cube(-5.65,2.35,z,.22,2.35,.22,[.10,.15,.19]);cube(5.65,2.35,z,.22,2.35,.22,[.10,.15,.19]);cube(0,4.58,z,5.85,.20,.24,[.10,.15,.19]);cube(-5.65,2.35,z+.03,.07,2.05,.25,c,0,0,0,.82);cube(5.65,2.35,z+.03,.07,2.05,.25,c,0,0,0,.82);cube(0,4.58,z+.03,5.15,.06,.25,c,0,0,0,.82);if(quality!=='low')text(g.label,0,3.78,z+.06,1.50,.30,.96,g.variant);}
    }
    function sidePassingTrains(r,zone){
      if(quality==='low'||zone==='station'||zone==='tunnel')return;
      const pulse=r.roadPulse||0;
      for(let i=0;i<2;i++){
        const z=worldLoopZ(i*94,pulse,1.34,188,32),x=SIDE_TRACK_X[i];
        drawTrain(x,z,{len:24,moving:true,side:true,color:i?[.13,.30,.46]:[.19,.33,.28],variant:i?'express':'metro'});
      }
    }
    function crossingTrains(r,t,zone){
      // Phase 9: scenery trains no longer cut sideways through buildings.
      // Extra traffic remains locked to the two dedicated outer rails.
      if(quality==='low'||zone==='station'||zone==='tunnel')return;
      const pulse=r.roadPulse||0;
      for(let i=0;i<2;i++){
        const z=worldLoopZ(42+i*108,pulse,.92,216,34),x=SIDE_TRACK_X[1-i];
        drawTrain(x,z,{len:i?20:18,moving:true,side:true,color:i?[.24,.30,.46]:[.18,.38,.32],variant:i?'cargo':'service'});
      }
    }
    function cinematicStart(r){
      if(introBlend<=.01||quality==='low')return;const a=introBlend;cube(0,4.52,-20,5.1,.12,.16,[.08,.16,.20],0,0,0,.72*a);text('HTML BYTE RUN',0,4.02,-19.86,1.65,.34,.96*a,'cyan');text('BUILD THE PAGE · SURVIVE THE RUN',0,3.42,-19.84,1.10,.18,.80*a,'yellow');
    }

    function drawPedestrian(x,z,t,seed=0,dir=1,accent=[.30,.58,.84]){
      const phase=t*.0055+seed*1.73,step=Math.sin(phase),bob=Math.abs(Math.cos(phase))*.035;
      const y=.02+bob;shadow(x,y,z,.24,.28,.17);
      cube(x,y+.78,z,.20,.38,.16,accent,0,0,step*.025*dir);
      cube(x,y+1.31,z,.17,.17,.16,[.86,.62,.46],0,0,step*.02*dir);
      cube(x,y+1.49,z-.02,.18,.07,.17,[.05,.08,.11]);
      const legA=step*.48,legB=-step*.48,armA=-step*.52,armB=step*.52;
      limb(x-.11,y+.42,z,.40,legA,.065,[.08,.12,.17]);limb(x+.11,y+.42,z,.40,legB,.065,[.08,.12,.17]);
      limb(x-.25,y+1.02,z,.34,armA,.055,[.86,.62,.46],-.04);limb(x+.25,y+1.02,z,.34,armB,.055,[.86,.62,.46],.04);
    }

    function drawMaintenanceBot(x,z,t,seed=0,side=1){
      const phase=t*.003+seed*2.1,hover=.06+Math.sin(phase*1.8)*.035,turn=Math.sin(phase*.7)*.18;
      shadow(x,.02,z,.35,.38,.20);cube(x,.28+hover,z,.34,.22,.34,[.12,.18,.22],0,turn,0);cube(x,.58+hover,z,.29,.22,.25,[.14,.58,.68],0,-turn*.5,0);
      cube(x,.61+hover,z-.26,.18,.11,.025,[.24,.92,1],0,0,0,.95);cube(x-side*.31,.34+hover,z,.06,.26,.06,[.50,.56,.58],0,0,.22*side);cube(x+side*.31,.34+hover,z,.06,.26,.06,[.50,.56,.58],0,0,-.22*side);
      cube(x-.22,.09,z+.06,.13,.09,.20,[.04,.05,.06]);cube(x+.22,.09,z+.06,.13,.09,.20,[.04,.05,.06]);
      if(quality==='high'){const a=phase*2.2;cube(x+Math.cos(a)*.46,.67+hover+Math.sin(a)*.12,z+.05,.035,.035,.12,[.98,.70,.16],0,a,0,.8);}
    }

    function railInfrastructure(r,t,zone){
      if(zone==='tunnel')return;
      const poleN=quality==='low'?5:quality==='medium'?8:11;
      for(let i=0;i<poleN;i++){
        const z=worldLoopZ(i*(146/poleN),r.roadPulse||0,.50,146,15),flash=.5+.5*Math.sin(t*.003+i*1.7);
        for(const side of [-1,1]){const x=side*5.25;cube(x,2.20,z,.065,2.20,.065,[.18,.21,.23]);cube(x-side*.72,4.12,z,.78,.055,.07,[.28,.31,.32]);}
        cube(0,4.08,z,5.25,.045,.055,[.30,.33,.34]);
        if(i%3===0){cube(-4.20,2.68,z+.04,.22,.44,.12,[.05,.09,.12]);cube(-4.20,2.82,z+.18,.075,.075,.025,flash>.48?[.20,.90,.42]:[.92,.16,.14]);cube(4.20,2.68,z+.04,.22,.44,.12,[.05,.09,.12]);cube(4.20,2.82,z+.18,.075,.075,.025,flash>.48?[.92,.16,.14]:[.20,.90,.42]);}
      }
      // Longitudinal catenary lines. Kept thin and cheap so they add depth without hurting phones.
      if(quality!=='low'){
        for(const x of [-3.95,0,3.95]){cube(x,4.02,-60,.018,.018,58,[.42,.45,.44],0,0,0,.70);cube(x+.10,3.84,-60,.012,.012,58,[.62,.50,.28],0,0,0,.44);}
      }
    }

    function sideLife(r,t,zone){
      const pulse=r.roadPulse||0;
      if(zone==='station'){
        const count=quality==='low'?2:quality==='medium'?5:8;
        for(let i=0;i<count;i++){const z=worldLoopZ(i*(116/count),pulse,.34,116,16),side=i%2?-1:1,x=side*(8.60+(i%3)*.18);drawPedestrian(x,z,t,i,side,i%3===0?[.62,.24,.28]:i%3===1?[.20,.50,.70]:[.48,.36,.68]);}
        if(quality!=='low')for(let i=0;i<3;i++){const z=worldLoopZ(i*34,pulse,.38,112,16),side=i%2?-1:1;drawMaintenanceBot(side*8.45,z,t,i,side);}
      }else if(zone==='city'){
        if(quality!=='low'){const count=quality==='high'?6:3;for(let i=0;i<count;i++){const z=worldLoopZ(i*(138/count),pulse,.24,138,18),side=i%2?-1:1;drawPedestrian(side*8.65,z,t,i+10,side,i%2?[.18,.47,.62]:[.58,.32,.20]);}}
        for(let i=0;i<(quality==='high'?3:1);i++){const z=worldLoopZ(i*43,pulse,.30,138,18),side=i%2?-1:1;drawMaintenanceBot(side*8.40,z,t,i+8,side);}
      }else if(zone==='code'){
        const count=quality==='low'?2:quality==='medium'?4:7;for(let i=0;i<count;i++){const z=worldLoopZ(i*(142/count),pulse,.33,142,18),side=i%2?-1:1;drawMaintenanceBot(side*(8.55+(i%3)*.18),z,t,i+18,side);if(quality==='high'&&i%2===0){const y=2.2+Math.sin(t*.002+i)*.28;cube(side*9.25,y,z-.4,.15,.07,.18,[.17,.74,.92],0,t*.001+i,0,.80);}}
      }else if(zone==='tunnel'&&quality==='high'){
        for(let i=0;i<2;i++){const z=worldLoopZ(i*62,pulse,.42,124,14),side=i?-1:1;drawMaintenanceBot(side*7.78,z,t,i+30,side);}
      }
    }

    function environmentalStory(r,t,zone){
      if(quality==='low')return;const p=r.roadPulse||0;
      if(zone==='city'){
        const z=-mod(42-p*.18,118)-12;text('KEEP CODING',-8.70,2.50,z,.86,.22,.78,'cyan');
        const z2=-mod(88-p*.18,126)-16;text('BUILD · TEST · RUN',8.70,2.25,z2,1.00,.20,.76,'yellow');
      }else if(zone==='station'){
        const z=-mod(36-p*.24,106)-12;text('NEXT: CODE DISTRICT',-8.65,2.44,z,1.08,.20,.78,'cyan');
        const z2=-mod(76-p*.24,108)-12;text('MIND THE GAP',8.65,2.44,z2,.82,.20,.76,'yellow');
      }else if(zone==='code'){
        const z=-mod(30-p*.20,110)-14;text('<SEMANTIC>',-8.65,2.70,z,.88,.22,.84,'green');
        const z2=-mod(74-p*.20,118)-14;text('VALIDATE ✓',8.65,2.45,z2,.82,.21,.80,'yellow');
      }
    }

    function roofWorld(r){
      if((r.roofHeight||0)<=.015)return;
      const roof=(r.roofHeight||0)*2.15;
      for(let lane=0;lane<3;lane++){
        for(let car=0;car<4;car++){
          const z=-12-car*26+mod((r.roadPulse||0)*.18,26);
          drawTrain(LANE_X[lane],z,{roof:0,len:24,moving:false,variant:(lane+car)%3===0?'express':(lane+car)%3===1?'commuter':'metro'});
          // Car seam / coupling gap and roof-edge rails make train-to-train traversal easier to read.
          cube(LANE_X[lane],roof+.095,z-11.7,1.12,.025,.08,[.72,.76,.78],0,0,0,.76);
          cube(LANE_X[lane]-.98,roof+.18,z-5.6,.035,.14,5.4,[.40,.45,.48],0,0,0,.80);
          cube(LANE_X[lane]+.98,roof+.18,z-5.6,.035,.14,5.4,[.40,.45,.48],0,0,0,.80);
        }
        cube(LANE_X[lane],roof+.06,-48,1.16,.06,48,[.10,.39,.48]);
        if(quality!=='low'){
          for(let i=0;i<6;i++){
            const z=-8-i*16+mod((r.roadPulse||0)*.25,16);
            const kind=i%3;
            if(kind===0){cube(LANE_X[lane],roof+.28,z,.28,.15,.36,[.04,.16,.21]);}
            else if(kind===1){cube(LANE_X[lane],roof+.24,z,.44,.09,.28,[.34,.39,.43]);for(let k=-1;k<=1;k++)cube(LANE_X[lane]+k*.22,roof+.34,z+.20,.07,.015,.025,[.10,.14,.16]);}
            else{cube(LANE_X[lane],roof+.31,z,.18,.21,.26,[.11,.17,.20]);cube(LANE_X[lane],roof+.58,z,.05,.18,.06,[.46,.52,.54]);}
          }
        }
      }
    }

    function speedStreaks(r,speedRatio){if(speedRatio<.72||quality==='low')return;const count=quality==='high'?18:10;for(let i=0;i<count;i++){const d=mod(i*(66/count)-(r.roadPulse||0)*2.1,66)+2,z=-d,x=((i%2)?-1:1)*(4.9+(i%4)*.72),y=.45+(i%5)*.78;cube(x,y,z,.018,.018,.70+speedRatio*.9,[.74,.94,1]);}}

    function cinematicFx(r,t,speedRatio){
      if(quality==='low')return;const x=lerp(LANE_X[0],LANE_X[2],r.lanePos/2),roof=(r.roofHeight||0)*2.15;
      if(nearMissPulse>0){const count=quality==='high'?12:7;for(let i=0;i<count;i++){const a=i/count*Math.PI*2+t*.006;cube(x+nearMissSide*(1.1+i*.08),roof+.55+(i%4)*.45,.7+i*.35,.025,.025,.34,[.85,.97,1],0,a,0,.72*nearMissPulse);}}
      if(hitPulse>0){for(let i=0;i<8;i++){const a=i*Math.PI/4+t*.01;cube(x+Math.cos(a)*(.45+.35*(1-hitPulse)),roof+.8+Math.sin(a)*.38,.45,.045,.045,.20,[1,.18,.22],0,a,0,.78*hitPulse);}}
      if(landingPulse>0){for(let i=0;i<6;i++){const a=i*Math.PI/3;cube(x+Math.cos(a)*(1.0-landingPulse*.45),roof+.04,.20+Math.sin(a)*.62,.07,.018,.22,[.72,.86,.88],0,a,0,.40*landingPulse);}}
      if((r.boostTime||0)>0&&quality==='high')for(let i=0;i<10;i++){const a=i*Math.PI*.2+t*.004;cube(x+Math.cos(a)*1.15,roof+.45+(i%5)*.32,.9+i*.25,.025,.025,.42,[.30,.94,1],0,a,0,.65);}
    }

    function boostBreakDebris(o,t){
      const lane=Math.max(0,Math.min(2,Math.round(o.lane)));const x=LANE_X[lane],z=-(o.z||0)*.82,roof=o.level==='roof'?2.32:0,age=clamp(o.postResolveAge||0,0,.65),life=clamp(1-age/.58,0,1);if(life<=0)return;
      const seed=(o.boostBurstSeed||.5)*6.283;const count=quality==='low'?7:quality==='medium'?11:15;
      for(let i=0;i<count;i++){
        const a=seed+i*Math.PI*2/count,spread=.25+age*(2.4+(i%3)*.35),lift=.35+Math.sin(a*1.7)*.18+age*(1.5+(i%4)*.22);const px=x+Math.cos(a)*spread,py=roof+.45+lift,pz=z+Math.sin(a)*spread*.72+age*.8;
        cube(px,py,pz,.055+.018*(i%2),.045+.016*(i%3),.15+.025*(i%4),i%2?[.22,.90,1]:[.98,.73,.16],a+age*7,a*.5+age*5,age*8,.82*life);
      }
      if(quality!=='low'&&age<.28)text('BOOST BREAK!',x,roof+1.62,z+.08,.72,.17,.82*life,'yellow');
    }

    function world(r,t,speedRatio){
      useSolid();drawRails(r);const zone=worldZone(r);if(zone==='city')cityProps(r);else if(zone==='station'){stationProps(r);stationPlatformTrains(r,t);}else if(zone==='tunnel')tunnelProps(r);else codeDistrictProps(r);railInfrastructure(r,t,zone);sideLife(r,t,zone);environmentalStory(r,t,zone);transitionStructures(r);sidePassingTrains(r,zone);crossingTrains(r,t,zone);cinematicStart(r);roofWorld(r);speedStreaks(r,speedRatio);cinematicFx(r,t,speedRatio);
      for(const it of r.pickups||[])if(!it.resolved)pickup(it,t);for(const o of r.obstacles||[]){if(o.boostBreak&&o.resolved)boostBreakDebris(o,t);else if(!o.resolved||o.postResolveAge<.22)obstacle(o);}gates(r.gateGroup);portal(r);chaser(r,t);player(r,t);
    }

    function resize(W,H,dpr=1){w=Math.max(1,W);h=Math.max(1,H);const cap=w<700?1.15:1.55,D=Math.min(cap,Math.max(1,dpr||1));canvas.width=Math.round(w*D);canvas.height=Math.round(h*D);canvas.style.width=w+'px';canvas.style.height=h+'px';gl.viewport(0,0,canvas.width,canvas.height);qualityCeiling=(w<520||(navigator.deviceMemory&&navigator.deviceMemory<=4))?'low':(w<900?'medium':'high');quality=qualityCeiling;}
    function samplePerformance(dt){
      perfClock+=dt;perfDt+=dt;perfSamples+=1;if(perfClock<2.25)return;const avg=perfDt/Math.max(1,perfSamples);perfClock=0;perfDt=0;perfSamples=0;
      if(avg>.030){if(quality==='high')quality='medium';else if(quality==='medium')quality='low';}
      else if(avg<.019){if(quality==='low'&&qualityCeiling!=='low')quality='medium';else if(quality==='medium'&&qualityCeiling==='high')quality='high';}
    }
    function render(r,time){
      const dt=lastRenderTime?clamp((time-lastRenderTime)/1000,.001,.05):.016;lastRenderTime=time;samplePerformance(dt);laneVelocity=lerp(laneVelocity,((r.lanePos||1)-lastLanePos)/dt,.12);lastLanePos=r.lanePos||1;
      const animBlend=1-Math.exp(-11*dt);animJump=lerp(animJump,(r.jumpY||0)>.045?1:0,animBlend);animSlide=lerp(animSlide,(r.slideTime||0)>.02?1:0,animBlend);animStumble=lerp(animStumble,(r.stumbleTime||0)>.02?1:0,1-Math.exp(-14*dt));animRoof=lerp(animRoof,(r.roofHeight||0)>.18?1:0,1-Math.exp(-8*dt));
      for(const o of r.obstacles||[]){if(o&&o.nearMiss&&!seenNearMiss.has(o)){seenNearMiss.add(o);nearMissPulse=1;nearMissSide=o.lane===0?1:o.lane===2?-1:(r.lanePos<1?1:-1);}}
      if((r.stumbleTime||0)>lastStumble+.08)hitPulse=1;lastStumble=r.stumbleTime||0;if((r.landingKick||0)>lastLanding+.025)landingPulse=1;lastLanding=r.landingKick||0;
      nearMissPulse=Math.max(0,nearMissPulse-dt*2.8);hitPulse=Math.max(0,hitPulse-dt*3.2);landingPulse=Math.max(0,landingPulse-dt*4.4);
      const zone=worldZone(r);if(zone!==lastZone){lastZone=zone;zonePulse=1;}zonePulse=Math.max(0,zonePulse-dt*1.8);const tunnelTarget=zone==='tunnel'?Math.pow(Math.max(0,Math.sin((r.roadPulse||0)*.48+time*.0024)),10):0;tunnelFlash=lerp(tunnelFlash,tunnelTarget,1-Math.exp(-16*dt));
      const speedRatio=clamp((r.speed||18)/Math.max(18,r.difficulty?.maxSpeed||28),0,1.25),px=lerp(LANE_X[0],LANE_X[2],r.lanePos/2),roof=(r.roofHeight||0)*2.15;const catchDur=Math.max(.01,r.catchSequenceDuration||1.35),catchProgress=(r.catchSequence||0)>0?clamp(1-(r.catchSequence||0)/catchDur,0,1):0;catchPulse=lerp(catchPulse,catchProgress,1-Math.exp(-10*dt));
      const introTarget=r.state==='RUNNING'&&Number(r.activeTimeMs||0)<2500?clamp(1-Number(r.activeTimeMs||0)/2500,0,1):0;introBlend=lerp(introBlend,introTarget,1-Math.exp(-6*dt));const finishTarget=r.questionPhase==='finish'?1:0;finishBlend=lerp(finishBlend,finishTarget,1-Math.exp(-5*dt));
      worldCurveAmount=lerp(worldCurveAmount,zone==='tunnel'?.015:zone==='station'?.035:.055,1-Math.exp(-.70*dt));worldCurvePhase=.34;
      const cinematicX=nearMissSide*nearMissPulse*.18+Math.sin(time*.055)*catchPulse*.12;
      const zoneCamX=zone==='station'?Math.sin((r.roadPulse||0)*.010)*.10:zone==='tunnel'?0:.03*Math.sin((r.roadPulse||0)*.006);
      const desiredX=px*.08+cinematicX*.45+zoneCamX*.08;cameraX=lerp(cameraX,desiredX,.08);
      const zoneCamY=zone==='tunnel'?-.22:zone==='station'?.16:zone==='code'?.06:0;
      const desiredY=3.28+zoneCamY+roof*.58+(r.jumpY||0)*.18-(r.landingKick||0)*.30-hitPulse*.06-catchPulse*.14+introBlend*.70+finishBlend*.18;cameraY=lerp(cameraY,desiredY,.10);
      const zoneRoll=zone==='station'?Math.sin((r.roadPulse||0)*.008)*.006:0;
      cameraRoll=lerp(cameraRoll,clamp(-laneVelocity*.006+nearMissSide*nearMissPulse*.035+Math.sin(time*.041)*catchPulse*.05+zoneRoll,-.095,.095),.09);
      const bob=r.state==='RUNNING'&&animJump<.18&&animSlide<.18?Math.sin(time*.014*(.76+speedRatio))*.045:0;const kick=(r.cameraKick||0)*.14*Math.sin(time*.065)+hitPulse*Math.sin(time*.095)*.075+catchPulse*Math.sin(time*.11)*.065;const boostPull=(r.boostTime||0)>0?.42:0;
      const zoneCamZ=zone==='tunnel'?.30:zone==='station'?-.18:0;
      cam=[cameraX+kick,cameraY+bob,6.85+zoneCamZ+boostPull+nearMissPulse*.10+catchPulse*.42+introBlend*3.0+finishBlend*.30];
      const zoneLook=zone==='tunnel'?1.0:zone==='station'?-1.1:0;
      const target=[0,1.22+roof*.40-(r.landingKick||0)*.10+catchPulse*.08+introBlend*.38,-15.2+zoneLook-speedRatio*1.2-nearMissPulse*.7+catchPulse*2.1-introBlend*5.2-finishBlend*1.4];
      const up=[Math.sin(cameraRoll),Math.cos(cameraRoll),0];
      const zoneFov=zone==='station'?1.8:zone==='tunnel'?-1.5:zone==='code'?.8:0;
      const fov=56+zoneFov+speedRatio*9.0+((r.boostTime||0)>0?4:0)+nearMissPulse*2.4+zonePulse*.7+tunnelFlash*.9+catchPulse*3.2-introBlend*4.0+finishBlend*2.0;const proj=M.persp(fov*Math.PI/180,w/h,.1,155),view=M.look(cam,target,up);vp=M.mul(proj,view);
      const fogTargets={tunnel:[.055,.080,.105],code:[.12,.20,.34],station:[.38,.58,.66],city:[.46,.72,.86]};const ft=fogTargets[zone]||fogTargets.city;const tint=hitPulse*.13,flash=tunnelFlash*.20;fog=[lerp(fog[0],ft[0]+tint+flash*.35,.08),lerp(fog[1],Math.max(.04,ft[1]-tint*.65+flash*.65),.08),lerp(fog[2],Math.max(.04,ft[2]-tint*.55+flash),.08)];
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(fog[0],fog[1],fog[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);world(r,time,speedRatio);
    }

    function destroy(){for(const t of textures.values())gl.deleteTexture(t);textures.clear();}
    return {supported:true,resize,render,destroy,canvas,get quality(){return quality;}};
  }

  window.ICT8ByteRunner3D={create};
})();
