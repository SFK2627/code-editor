(() => {
  'use strict';

  if (window.ICT8ByteStrikeMaps) return;

  const W = (x,y,w,h, kind='wall') => ({x,y,w,h,solid:true,vision:true,kind});
  const R = (x,y,w,h, kind='rail') => ({x,y,w,h,solid:true,vision:false,kind});
  const D = (x,y,w,h, kind='decor') => ({x,y,w,h,solid:false,vision:false,kind});
  const P = (x,y,weapon) => ({x,y,weapon});
  const H = (x,y,amount=25,respawnMs=18000) => ({x,y,amount,respawnMs});
  const S = (ax,ay,bx,by,aa=0,ba=Math.PI) => [{x:ax,y:ay,a:aa},{x:bx,y:by,a:ba}];

  const MAPS = [
    {
      id:'data-vault', name:'DATA VAULT', size:'MEDIUM', environment:'Secure Server Facility', playStyle:'Balanced · Close + Mid Range',
      width:1760,height:1160, floor:'#081521', grid:'rgba(72,164,209,.055)', accent:'#37d7ff', danger:'#ff5577',
      walls:[
        W(0,0,1760,34),W(0,1126,1760,34),W(0,0,34,1160),W(1726,0,34,1160),
        W(280,180,420,42),W(1060,180,420,42),W(280,938,420,42),W(1060,938,420,42),
        W(250,360,42,440),W(1468,360,42,440),
        W(610,390,150,42),W(1000,390,150,42),W(610,728,150,42),W(1000,728,150,42),
        W(790,455,180,250,'vault'),W(460,510,110,140,'crate'),W(1190,510,110,140,'crate'),
        R(810,365,140,18),R(810,777,140,18)
      ],
      decor:[D(80,80,260,70,'server'),D(1420,80,260,70,'server'),D(80,1010,260,70,'server'),D(1420,1010,260,70,'server')],
      pickups:[P(880,330,'pulserifle'),P(470,770,'compactsmg'),P(1290,390,'shotgun'),P(880,835,'sniper'),P(1370,780,'autoshotgun')],
      healthPickups:[H(390,580,25),H(880,420,30),H(1370,580,25),H(880,820,30)],
      spawnPairs:[S(150,580,1610,580,0,Math.PI),S(360,300,1400,860,.25,-2.9),S(360,860,1400,300,-.25,2.9)]
    },
    {
      id:'firewall-lab', name:'FIREWALL LAB', size:'SMALL', environment:'Experimental Security Lab', playStyle:'Close Range · Corners + Doorways',
      width:1540,height:1040, floor:'#170b13', grid:'rgba(255,85,119,.045)', accent:'#ff5b7d', danger:'#ffcc44',
      walls:[
        W(0,0,1540,34),W(0,1006,1540,34),W(0,0,34,1040),W(1506,0,34,1040),
        W(210,160,360,38),W(970,160,360,38),W(210,842,360,38),W(970,842,360,38),
        W(210,198,38,210),W(532,198,38,210),W(970,198,38,210),W(1292,198,38,210),
        W(210,632,38,210),W(532,632,38,210),W(970,632,38,210),W(1292,632,38,210),
        W(650,300,240,38),W(650,702,240,38),W(650,338,38,124),W(852,338,38,124),W(650,578,38,124),W(852,578,38,124),
        W(360,470,190,38,'bench'),W(990,532,190,38,'bench'),
        R(740,475,60,16),R(740,549,60,16)
      ],
      decor:[D(290,260,190,40,'lab'),D(1060,260,190,40,'lab'),D(290,740,190,40,'lab'),D(1060,740,190,40,'lab')],
      pickups:[P(770,520,'shotgun'),P(470,520,'machinepistol'),P(1070,520,'compactsmg'),P(770,250,'tacticalshotgun'),P(770,790,'autoshotgun')],
      healthPickups:[H(470,600,25),H(770,620,25),H(1070,440,25)],
      spawnPairs:[S(125,520,1415,520,0,Math.PI),S(400,100,1140,940,1.05,-2.1),S(400,940,1140,100,-1.05,2.1)]
    },
    {
      id:'byte-yard', name:'BYTE YARD', size:'MEDIUM', environment:'Industrial Cyber Yard', playStyle:'Open · Long Sight Lines + Flanks',
      width:1900,height:1180, floor:'#11161d', grid:'rgba(109,255,193,.04)', accent:'#70f0c3', danger:'#ff9b52',
      walls:[
        W(0,0,1900,34),W(0,1146,1900,34),W(0,0,34,1180),W(1866,0,34,1180),
        W(330,220,300,120,'container'),W(1270,220,300,120,'container'),W(330,840,300,120,'container'),W(1270,840,300,120,'container'),
        W(770,150,120,280,'container'),W(1010,750,120,280,'container'),
        W(760,545,380,90,'container'),
        W(150,460,150,90,'crate'),W(1600,630,150,90,'crate'),W(520,500,120,120,'crate'),W(1260,560,120,120,'crate'),
        R(880,440,140,20),R(880,720,140,20)
      ],
      decor:[D(85,85,300,60,'stripe'),D(1515,1035,300,60,'stripe')],
      pickups:[P(950,680,'sniper'),P(690,770,'heavylmg'),P(1210,410,'battlerifle'),P(950,350,'carbine'),P(1500,780,'scattergun')],
      healthPickups:[H(180,860,25),H(950,770,30),H(1720,320,25)],
      spawnPairs:[S(120,590,1780,590,0,Math.PI),S(250,160,1650,1020,.5,-2.65),S(250,1020,1650,160,-.5,2.65)]
    },
    {
      id:'server-maze', name:'SERVER MAZE', size:'MEDIUM', environment:'Dense Server Complex', playStyle:'Maze · Ambush + Directional Vision',
      width:1700,height:1200, floor:'#07131b', grid:'rgba(102,126,234,.05)', accent:'#7c8cff', danger:'#42e8ff',
      walls:[
        W(0,0,1700,34),W(0,1166,1700,34),W(0,0,34,1200),W(1666,0,34,1200),
        W(170,150,50,350,'server'),W(170,650,50,350,'server'),W(360,260,50,420,'server'),W(360,830,50,210,'server'),
        W(560,130,50,250,'server'),W(560,530,50,510,'server'),W(760,250,50,300,'server'),W(760,720,50,330,'server'),
        W(960,130,50,390,'server'),W(960,690,50,350,'server'),W(1160,250,50,420,'server'),W(1160,820,50,220,'server'),
        W(1360,130,50,250,'server'),W(1360,530,50,490,'server'),
        W(245,545,90,50,'rack'),W(435,725,100,50,'rack'),W(635,600,100,50,'rack'),W(835,560,100,50,'rack'),W(1035,575,100,50,'rack'),W(1235,690,100,50,'rack')
      ],
      decor:[D(75,70,110,40,'server'),D(1515,1090,110,40,'server')],
      pickups:[P(850,650,'pdw'),P(490,180,'shotgun'),P(1260,1040,'pulserifle'),P(1260,180,'machinepistol'),P(850,1060,'tacticalshotgun')],
      healthPickups:[H(850,150,25),H(850,1100,30),H(1510,600,25)],
      spawnPairs:[S(90,600,1610,600,0,Math.PI),S(100,1040,1600,160,-.3,2.85),S(100,160,1600,1040,.3,-2.85)]
    },
    {
      id:'neon-grid', name:'NEON GRID', size:'MEDIUM', environment:'Competitive Simulation Arena', playStyle:'Symmetrical · Precision + Fair Lanes',
      width:1760,height:1120, floor:'#07101f', grid:'rgba(0,229,255,.07)', accent:'#00e5ff', danger:'#ff3d99',
      walls:[
        W(0,0,1760,34),W(0,1086,1760,34),W(0,0,34,1120),W(1726,0,34,1120),
        W(320,230,260,48,'barrier'),W(1180,230,260,48,'barrier'),W(320,842,260,48,'barrier'),W(1180,842,260,48,'barrier'),
        W(300,420,48,280,'barrier'),W(1412,420,48,280,'barrier'),
        W(650,300,70,170,'pillar'),W(1040,300,70,170,'pillar'),W(650,650,70,170,'pillar'),W(1040,650,70,170,'pillar'),
        W(800,470,160,180,'core'),R(760,390,240,18),R(760,712,240,18),
        W(500,520,90,80,'cover'),W(1170,520,90,80,'cover')
      ],
      decor:[D(120,100,160,34,'neon'),D(1480,985,160,34,'neon')],
      pickups:[P(880,365,'rifle'),P(880,755,'battlerifle'),P(620,560,'compactsmg'),P(1140,560,'pdw'),P(880,450,'dmr'),P(880,700,'autoshotgun')],
      healthPickups:[H(430,560,25),H(880,430,30),H(1330,560,25),H(880,690,30)],
      spawnPairs:[S(140,560,1620,560,0,Math.PI),S(250,180,1510,940,.35,-2.8),S(250,940,1510,180,-.35,2.8)]
    },
    {
      id:'core-reactor', name:'CORE REACTOR', size:'MEDIUM', environment:'Radial Power Chamber', playStyle:'Circular · Rotations + Flanking',
      width:1680,height:1120, floor:'#120b1c', grid:'rgba(202,112,255,.045)', accent:'#c66bff', danger:'#5ef2ff',
      walls:[
        W(0,0,1680,34),W(0,1086,1680,34),W(0,0,34,1120),W(1646,0,34,1120),
        W(690,390,300,42,'reactor'),W(690,688,300,42,'reactor'),W(620,460,42,200,'reactor'),W(1018,460,42,200,'reactor'),
        W(300,250,170,60,'duct'),W(1210,250,170,60,'duct'),W(300,810,170,60,'duct'),W(1210,810,170,60,'duct'),
        W(240,490,80,140,'pillar'),W(1360,490,80,140,'pillar'),W(520,170,80,140,'pillar'),W(1080,170,80,140,'pillar'),W(520,810,80,140,'pillar'),W(1080,810,80,140,'pillar'),
        R(760,350,160,16),R(760,754,160,16)
      ],
      decor:[D(750,470,180,180,'reactor-glow')],
      pickups:[P(840,330,'pulserifle'),P(840,790,'shotgun'),P(500,560,'lmg'),P(1180,560,'heavylmg'),P(840,560,'revolver'),P(840,940,'tacticalshotgun')],
      healthPickups:[H(400,560,25),H(840,270,30),H(1280,560,25),H(840,850,30)],
      spawnPairs:[S(120,560,1560,560,0,Math.PI),S(360,150,1320,970,.6,-2.55),S(360,970,1320,150,-.6,2.55)]
    },
    {
      id:'shadow-terminal', name:'SHADOW TERMINAL', size:'MEDIUM', environment:'Abandoned Transit Node', playStyle:'Stealth · Sound + Long Corridors',
      width:1820,height:1160, floor:'#050b12', grid:'rgba(82,123,153,.035)', accent:'#6aa7c7', danger:'#e64873',
      walls:[
        W(0,0,1820,34),W(0,1126,1820,34),W(0,0,34,1160),W(1786,0,34,1160),
        W(180,160,620,42,'terminal'),W(1020,160,620,42,'terminal'),W(180,958,620,42,'terminal'),W(1020,958,620,42,'terminal'),
        W(360,340,42,500,'wall'),W(1418,340,42,500,'wall'),
        W(600,300,42,300,'wall'),W(1178,560,42,300,'wall'),
        W(820,360,180,80,'kiosk'),W(820,720,180,80,'kiosk'),W(760,520,300,120,'platform'),
        W(160,515,120,120,'cover'),W(1540,525,120,120,'cover')
      ],
      decor:[D(100,260,80,30,'lamp'),D(1640,840,80,30,'lamp')],
      pickups:[P(910,300,'sniper'),P(910,850,'shotgun'),P(500,700,'compactsmg'),P(1320,460,'battlerifle'),P(1100,580,'scattergun')],
      healthPickups:[H(540,580,25),H(910,680,30),H(1280,580,25)],
      spawnPairs:[S(100,580,1720,580,0,Math.PI),S(230,260,1590,900,.35,-2.8),S(230,900,1590,260,-.35,2.8)]
    },
    {
      id:'cyber-depot', name:'CYBER DEPOT', size:'SMALL', environment:'Digital Cargo Warehouse', playStyle:'Aggressive · Crate Lanes + Pickups',
      width:1600,height:1060, floor:'#10151b', grid:'rgba(255,183,77,.045)', accent:'#ffb74d', danger:'#51d6ff',
      walls:[
        W(0,0,1600,34),W(0,1026,1600,34),W(0,0,34,1060),W(1566,0,34,1060),
        W(240,170,180,160,'crate'),W(590,170,180,160,'crate'),W(940,170,180,160,'crate'),W(1180,360,180,160,'crate'),
        W(240,730,180,160,'crate'),W(590,730,180,160,'crate'),W(940,730,180,160,'crate'),W(240,430,180,160,'crate'),
        W(560,430,170,170,'crate'),W(870,430,170,170,'crate'),W(1180,650,180,160,'crate'),
        R(770,500,60,20),R(770,620,60,20)
      ],
      decor:[D(70,70,200,40,'hazard'),D(1330,950,200,40,'hazard')],
      pickups:[P(800,400,'shotgun'),P(800,670,'heavylmg'),P(500,650,'machinepistol'),P(1100,390,'pdw'),P(800,535,'dmr'),P(1280,860,'autoshotgun')],
      healthPickups:[H(800,130,25),H(800,900,30),H(1450,530,25)],
      spawnPairs:[S(110,530,1490,530,0,Math.PI),S(150,120,1450,940,.55,-2.6),S(150,940,1450,120,-.55,2.6)]
    },
    {
      id:'quantum-port', name:'QUANTUM PORT', size:'LARGE', environment:'Cyber Shipping Terminal', playStyle:'Long Range · Dock Lanes + Deep Flanks',
      width:2220,height:1320, floor:'#08141b', grid:'rgba(67,234,213,.045)', accent:'#45ead5', danger:'#ff8a5c',
      walls:[
        W(0,0,2220,34),W(0,1286,2220,34),W(0,0,34,1320),W(2186,0,34,1320),
        W(250,180,360,110,'container'),W(760,180,300,110,'container'),W(1160,180,300,110,'container'),W(1610,180,360,110,'container'),
        W(250,1030,360,110,'container'),W(760,1030,300,110,'container'),W(1160,1030,300,110,'container'),W(1610,1030,360,110,'container'),
        W(410,430,160,330,'warehouse'),W(1650,560,160,330,'warehouse'),
        W(760,420,120,120,'crate'),W(1340,780,120,120,'crate'),W(1020,530,180,260,'terminal'),
        W(680,800,200,55,'barrier'),W(1340,465,200,55,'barrier'),
        R(900,400,420,18),R(900,902,420,18)
      ],
      decor:[D(90,90,360,45,'stripe'),D(1770,1185,360,45,'stripe'),D(990,475,240,360,'neon')],
      pickups:[P(1110,390,'sniper'),P(1110,930,'battlerifle'),P(700,660,'compactsmg'),P(1520,660,'heavylmg'),P(1110,840,'revolver'),P(950,650,'tacticalshotgun')],
      healthPickups:[H(330,660,25),H(910,660,30),H(1310,660,30),H(1890,660,25)],
      spawnPairs:[S(120,660,2100,660,0,Math.PI),S(220,250,2000,1070,.42,-2.72),S(220,1070,2000,250,-.42,2.72)]
    },
    {
      id:'packet-factory', name:'PACKET FACTORY', size:'MEDIUM', environment:'Automated Data Plant', playStyle:'Room-to-Room · Cross Lanes + Machinery',
      width:1960,height:1260, floor:'#10131b', grid:'rgba(112,180,255,.05)', accent:'#70b4ff', danger:'#ffcf5c',
      walls:[
        W(0,0,1960,34),W(0,1226,1960,34),W(0,0,34,1260),W(1926,0,34,1260),
        W(210,180,420,48,'factory'),W(1330,180,420,48,'factory'),W(210,1032,420,48,'factory'),W(1330,1032,420,48,'factory'),
        W(210,228,48,270,'factory'),W(582,228,48,270,'factory'),W(1330,228,48,270,'factory'),W(1702,228,48,270,'factory'),
        W(210,762,48,270,'factory'),W(582,762,48,270,'factory'),W(1330,762,48,270,'factory'),W(1702,762,48,270,'factory'),
        W(750,250,120,250,'machine'),W(1090,760,120,250,'machine'),
        W(780,560,400,140,'conveyor'),W(410,575,170,110,'crate'),W(1380,575,170,110,'crate'),
        R(650,620,100,18),R(1210,620,100,18)
      ],
      decor:[D(310,310,220,50,'lab'),D(1430,310,220,50,'lab'),D(310,900,220,50,'lab'),D(1430,900,220,50,'lab')],
      pickups:[P(980,480,'pulserifle'),P(980,780,'shotgun'),P(650,720,'pdw'),P(1310,720,'lmg'),P(980,750,'carbine'),P(1600,650,'autoshotgun')],
      healthPickups:[H(480,720,25),H(980,360,30),H(1480,720,25),H(980,900,30)],
      spawnPairs:[S(120,630,1840,630,0,Math.PI),S(320,120,1640,1140,.55,-2.58),S(320,1140,1640,120,-.55,2.58)]
    },
    {
      id:'zero-sector', name:'ZERO SECTOR', size:'LARGE', environment:'Quarantined Data Ruins', playStyle:'Large · Broken Blocks + Long Flank Routes',
      width:2400,height:1400, floor:'#0a0d13', grid:'rgba(255,84,112,.035)', accent:'#ff647d', danger:'#7cf4ff',
      walls:[
        W(0,0,2400,34),W(0,1366,2400,34),W(0,0,34,1400),W(2366,0,34,1400),
        W(300,210,520,55,'ruin'),W(1580,210,520,55,'ruin'),W(300,1135,520,55,'ruin'),W(1580,1135,520,55,'ruin'),
        W(300,265,55,350,'ruin'),W(765,265,55,220,'ruin'),W(1580,265,55,220,'ruin'),W(2045,265,55,350,'ruin'),
        W(300,785,55,350,'ruin'),W(765,915,55,220,'ruin'),W(1580,915,55,220,'ruin'),W(2045,785,55,350,'ruin'),
        W(1040,300,320,90,'broken'),W(1040,1010,320,90,'broken'),W(1040,560,90,280,'pillar'),W(1270,560,90,280,'pillar'),
        W(610,620,210,120,'cover'),W(1580,660,210,120,'cover'),R(980,470,440,20),R(980,910,440,20)
      ],
      decor:[D(90,80,400,44,'hazard'),D(1910,1275,400,44,'hazard'),D(1110,610,180,180,'reactor-glow')],
      pickups:[P(1200,430,'sniper'),P(1200,970,'battlerifle'),P(930,700,'compactsmg'),P(1470,700,'heavylmg'),P(1200,700,'revolver'),P(1200,1220,'scattergun')],
      healthPickups:[H(470,700,25),H(950,520,30),H(1450,880,30),H(1930,700,25)],
      spawnPairs:[S(130,700,2270,700,0,Math.PI),S(260,160,2140,1240,.48,-2.66),S(260,1240,2140,160,-.48,2.66)]
    },
    {
      id:'memory-district', name:'MEMORY DISTRICT', size:'LARGE', environment:'Cyber City Blocks', playStyle:'Urban · Alleys + Central Plaza + Rotations',
      width:2100,height:1360, floor:'#0b101a', grid:'rgba(190,128,255,.045)', accent:'#bd80ff', danger:'#55e5ff',
      walls:[
        W(0,0,2100,34),W(0,1326,2100,34),W(0,0,34,1360),W(2066,0,34,1360),
        W(220,180,430,260,'block'),W(1450,180,430,260,'block'),W(220,920,430,260,'block'),W(1450,920,430,260,'block'),
        W(760,200,180,180,'block'),W(1160,200,180,180,'block'),W(760,980,180,180,'block'),W(1160,980,180,180,'block'),
        W(430,560,200,200,'kiosk'),W(1470,600,200,200,'kiosk'),
        W(900,520,300,320,'plaza-core'),
        W(720,610,100,80,'cover'),W(1280,670,100,80,'cover'),R(840,470,420,18),R(840,872,420,18)
      ],
      decor:[D(250,470,340,42,'neon'),D(1510,850,340,42,'neon'),D(965,585,170,190,'reactor-glow')],
      pickups:[P(1050,460,'rifle'),P(1050,900,'shotgun'),P(690,680,'pdw'),P(1410,680,'sniper'),P(1050,430,'revolver'),P(1800,680,'autoshotgun')],
      healthPickups:[H(350,680,25),H(760,470,30),H(1340,890,30),H(1750,680,25)],
      spawnPairs:[S(120,680,1980,680,0,Math.PI),S(180,130,1920,1230,.5,-2.64),S(180,1230,1920,130,-.5,2.64)]
    }
  ];


  // Phase 2: objective/base-warfare arenas. Kept separate from Classic so
  // larger lane geometry never changes the existing tactical duel pool.
  const SIEGE_MAPS = [
    {
      id:'data-frontier', name:'DATA FRONTIER', size:'LARGE', environment:'Frontline Data Corridor', playStyle:'Core Siege · 1 Lane · 3 Defense Layers',
      width:2800,height:1500, floor:'#07131b', grid:'rgba(72,215,255,.045)', accent:'#42ddff', danger:'#ff5b78',
      walls:[
        W(0,0,2800,34),W(0,1466,2800,34),W(0,0,34,1500),W(2766,0,34,1500),
        W(500,250,300,120,'server'),W(2000,1130,300,120,'server'),W(500,1130,300,120,'server'),W(2000,250,300,120,'server'),
        W(920,360,160,260,'bunker'),W(1720,880,160,260,'bunker'),W(920,880,160,260,'bunker'),W(1720,360,160,260,'bunker'),
        W(1260,250,280,90,'barrier'),W(1260,1160,280,90,'barrier'),
        W(1260,555,90,150,'cover'),W(1450,795,90,150,'cover'),
        R(1160,650,480,18),R(1160,1000,480,18)
      ],
      decor:[D(80,80,420,50,'hazard'),D(2300,1370,420,50,'hazard'),D(1320,680,160,140,'reactor-glow')],
      pickups:[P(620,750,'smg'),P(900,750,'shotgun'),P(1180,690,'battlerifle'),P(1620,820,'pulserifle'),P(1900,750,'autoshotgun'),P(2180,750,'heavylmg'),P(1400,1040,'sniper')],
      healthPickups:[H(760,620,30,15000),H(1180,850,25,15000),H(1620,600,25,15000),H(2040,880,30,15000)],
      spawnPairs:[S(140,940,2660,560,0,Math.PI)],
      siege:{
        timeLimitSec:720,
        spawns:[{x:140,y:940,a:0},{x:2660,y:560,a:Math.PI}],
        lanes:[{id:'mid',label:'MAIN LANE',paths:[[{x:190,y:750},{x:560,y:750},{x:930,y:750},{x:1200,y:750},{x:1400,y:750},{x:1600,y:750},{x:1870,y:750},{x:2240,y:750},{x:2610,y:750}],[{x:2610,y:750},{x:2240,y:750},{x:1870,y:750},{x:1600,y:750},{x:1400,y:750},{x:1200,y:750},{x:930,y:750},{x:560,y:750},{x:190,y:750}]]}],
        structures:[
          {id:'b-outer',team:0,lane:'mid',tier:1,kind:'guardian',name:'BLUE GUARDIAN',x:1110,y:750,r:48,maxHp:850},
          {id:'b-inner',team:0,lane:'mid',tier:2,kind:'firewall',name:'BLUE FIREWALL',x:660,y:750,r:55,maxHp:1100},
          {id:'b-core',team:0,lane:'mid',tier:3,kind:'core',name:'BLUE DATA CORE',x:260,y:750,r:70,maxHp:2400},
          {id:'r-outer',team:1,lane:'mid',tier:1,kind:'guardian',name:'RED GUARDIAN',x:1690,y:750,r:48,maxHp:850},
          {id:'r-inner',team:1,lane:'mid',tier:2,kind:'firewall',name:'RED FIREWALL',x:2140,y:750,r:55,maxHp:1100},
          {id:'r-core',team:1,lane:'mid',tier:3,kind:'core',name:'RED DATA CORE',x:2540,y:750,r:70,maxHp:2400}
        ]
      }
    },
    {
      id:'cyber-citadel', name:'CYBER CITADEL', size:'LARGE', environment:'Twin-Lane Fortress', playStyle:'Core Siege · 2 Lanes · Layered Towers',
      width:3060,height:1720, floor:'#0b1020', grid:'rgba(157,118,255,.045)', accent:'#9d76ff', danger:'#ff657f',
      walls:[
        W(0,0,3060,34),W(0,1686,3060,34),W(0,0,34,1720),W(3026,0,34,1720),
        W(830,720,190,280,'citadel'),W(2040,720,190,280,'citadel'),
        W(1120,710,300,80,'barrier'),W(1640,930,300,80,'barrier'),
        W(1120,1110,300,80,'barrier'),W(1640,530,300,80,'barrier'),
        W(830,300,170,160,'cover'),W(2060,1260,170,160,'cover'),W(830,1260,170,160,'cover'),W(2060,300,170,160,'cover'),
        W(1430,650,200,140,'core-wall'),W(1430,930,200,140,'core-wall'),
        R(1240,700,580,18),R(1240,1002,580,18)
      ],
      decor:[D(100,100,420,50,'neon'),D(2540,1570,420,50,'neon'),D(1450,785,160,150,'reactor-glow')],
      pickups:[P(720,500,'tacticalshotgun'),P(720,1220,'compactsmg'),P(1180,500,'rifle'),P(1180,1220,'battlerifle'),P(1880,500,'sniper'),P(1880,1220,'autoshotgun'),P(2340,500,'pulserifle'),P(2340,1220,'heavylmg')],
      healthPickups:[H(960,610,25,15000),H(960,1110,25,15000),H(2100,610,25,15000),H(2100,1110,25,15000),H(1530,860,35,18000)],
      spawnPairs:[S(150,1080,2910,640,0,Math.PI)],
      siege:{
        timeLimitSec:780,
        spawns:[{x:150,y:1080,a:0},{x:2910,y:640,a:Math.PI}],
        lanes:[
          {id:'top',label:'TOP LANE',paths:[[{x:330,y:500},{x:760,y:500},{x:1140,y:500},{x:1530,y:500},{x:1920,y:500},{x:2300,y:500},{x:2730,y:500}],[{x:2730,y:500},{x:2300,y:500},{x:1920,y:500},{x:1530,y:500},{x:1140,y:500},{x:760,y:500},{x:330,y:500}]]},
          {id:'bottom',label:'BOTTOM LANE',paths:[[{x:330,y:1220},{x:760,y:1220},{x:1140,y:1220},{x:1530,y:1220},{x:1920,y:1220},{x:2300,y:1220},{x:2730,y:1220}],[{x:2730,y:1220},{x:2300,y:1220},{x:1920,y:1220},{x:1530,y:1220},{x:1140,y:1220},{x:760,y:1220},{x:330,y:1220}]]}
        ],
        structures:[
          {id:'b-top-outer',team:0,lane:'top',tier:1,kind:'guardian',name:'BLUE TOP GUARDIAN',x:1160,y:500,r:46,maxHp:760},
          {id:'b-bottom-outer',team:0,lane:'bottom',tier:1,kind:'guardian',name:'BLUE BOTTOM GUARDIAN',x:1040,y:1180,r:46,maxHp:760},
          {id:'b-inner',team:0,lane:'mid',tier:2,kind:'firewall',name:'BLUE INNER FIREWALL',x:620,y:860,r:58,maxHp:1250},
          {id:'b-core',team:0,lane:'mid',tier:3,kind:'core',name:'BLUE CITADEL CORE',x:250,y:860,r:72,maxHp:2700},
          {id:'r-top-outer',team:1,lane:'top',tier:1,kind:'guardian',name:'RED TOP GUARDIAN',x:2020,y:540,r:46,maxHp:760},
          {id:'r-bottom-outer',team:1,lane:'bottom',tier:1,kind:'guardian',name:'RED BOTTOM GUARDIAN',x:1960,y:1220,r:46,maxHp:760},
          {id:'r-inner',team:1,lane:'mid',tier:2,kind:'firewall',name:'RED INNER FIREWALL',x:2440,y:860,r:58,maxHp:1250},
          {id:'r-core',team:1,lane:'mid',tier:3,kind:'core',name:'RED CITADEL CORE',x:2810,y:860,r:72,maxHp:2700}
        ]
      }
    },
    {
      id:'neural-warzone', name:'NEURAL WARZONE', size:'XL', environment:'Tri-Lane Neural Battlefield', playStyle:'Core Siege · 3 Lanes · Heavy Wave Warfare',
      width:3400,height:1900, floor:'#071018', grid:'rgba(80,224,255,.042)', accent:'#53e8ff', danger:'#ff5f8f',
      walls:[
        W(0,0,3400,34),W(0,1866,3400,34),W(0,0,34,1900),W(3366,0,34,1900),
        W(610,660,390,120,'neural-block'),W(610,1120,390,120,'neural-block'),W(2400,660,390,120,'neural-block'),W(2400,1120,390,120,'neural-block'),
        W(1320,640,310,150,'server'),W(1770,1110,310,150,'server'),W(1770,640,310,150,'server'),W(1320,1110,310,150,'server'),
        W(1040,650,160,180,'bunker'),W(2200,1070,160,180,'bunker'),
        W(1510,820,140,110,'cover'),W(1750,970,140,110,'cover'),
        W(420,250,180,120,'cover'),W(2800,1530,180,120,'cover'),W(420,1530,180,120,'cover'),W(2800,250,180,120,'cover'),
        R(1450,585,500,18),R(1450,1297,500,18)
      ],
      decor:[D(90,80,460,48,'neon'),D(2850,1770,460,48,'neon'),D(1580,860,240,180,'reactor-glow')],
      pickups:[P(720,430,'compactsmg'),P(720,950,'shotgun'),P(720,1470,'pdw'),P(1250,430,'battlerifle'),P(1250,1470,'tacticalshotgun'),P(1700,950,'pulserifle'),P(2150,430,'sniper'),P(2150,1470,'autoshotgun'),P(2680,950,'heavylmg')],
      healthPickups:[H(880,600,25,15000),H(880,1300,25,15000),H(1700,760,30,17000),H(1700,1140,30,17000),H(2520,600,25,15000),H(2520,1300,25,15000)],
      spawnPairs:[S(180,1200,3220,700,0,Math.PI)],
      siege:{
        timeLimitSec:840,
        spawns:[{x:180,y:1200,a:0},{x:3220,y:700,a:Math.PI}],
        lanes:[
          {id:'top',label:'TOP LANE',paths:[[{x:330,y:430},{x:720,y:430},{x:1100,y:430},{x:1450,y:430},{x:1700,y:430},{x:1950,y:430},{x:2300,y:430},{x:2680,y:430},{x:3070,y:430}],[{x:3070,y:430},{x:2680,y:430},{x:2300,y:430},{x:1950,y:430},{x:1700,y:430},{x:1450,y:430},{x:1100,y:430},{x:720,y:430},{x:330,y:430}]]},
          {id:'mid',label:'MID LANE',paths:[[{x:330,y:950},{x:720,y:950},{x:1100,y:950},{x:1450,y:950},{x:1700,y:950},{x:1950,y:950},{x:2300,y:950},{x:2680,y:950},{x:3070,y:950}],[{x:3070,y:950},{x:2680,y:950},{x:2300,y:950},{x:1950,y:950},{x:1700,y:950},{x:1450,y:950},{x:1100,y:950},{x:720,y:950},{x:330,y:950}]]},
          {id:'bottom',label:'BOTTOM LANE',paths:[[{x:330,y:1470},{x:720,y:1470},{x:1100,y:1470},{x:1450,y:1470},{x:1700,y:1470},{x:1950,y:1470},{x:2300,y:1470},{x:2680,y:1470},{x:3070,y:1470}],[{x:3070,y:1470},{x:2680,y:1470},{x:2300,y:1470},{x:1950,y:1470},{x:1700,y:1470},{x:1450,y:1470},{x:1100,y:1470},{x:720,y:1470},{x:330,y:1470}]]}
        ],
        structures:[
          {id:'b-top-g',team:0,lane:'top',tier:1,kind:'guardian',name:'BLUE TOP GUARDIAN',x:1310,y:430,r:46,maxHp:780},
          {id:'b-mid-g',team:0,lane:'mid',tier:1,kind:'guardian',name:'BLUE MID GUARDIAN',x:1310,y:950,r:46,maxHp:780},
          {id:'b-bottom-g',team:0,lane:'bottom',tier:1,kind:'guardian',name:'BLUE BOTTOM GUARDIAN',x:1310,y:1470,r:46,maxHp:780},
          {id:'b-upper-b',team:0,lane:'top',tier:2,kind:'bastion',name:'BLUE UPPER BASTION',x:760,y:580,r:54,maxHp:1120},
          {id:'b-lower-b',team:0,lane:'bottom',tier:2,kind:'bastion',name:'BLUE LOWER BASTION',x:760,y:1320,r:54,maxHp:1120},
          {id:'b-core',team:0,lane:'mid',tier:3,kind:'core',name:'BLUE NEURAL CORE',x:240,y:950,r:76,maxHp:3000},
          {id:'r-top-g',team:1,lane:'top',tier:1,kind:'guardian',name:'RED TOP GUARDIAN',x:2090,y:430,r:46,maxHp:780},
          {id:'r-mid-g',team:1,lane:'mid',tier:1,kind:'guardian',name:'RED MID GUARDIAN',x:2090,y:950,r:46,maxHp:780},
          {id:'r-bottom-g',team:1,lane:'bottom',tier:1,kind:'guardian',name:'RED BOTTOM GUARDIAN',x:2090,y:1470,r:46,maxHp:780},
          {id:'r-upper-b',team:1,lane:'top',tier:2,kind:'bastion',name:'RED UPPER BASTION',x:2640,y:580,r:54,maxHp:1120},
          {id:'r-lower-b',team:1,lane:'bottom',tier:2,kind:'bastion',name:'RED LOWER BASTION',x:2640,y:1320,r:54,maxHp:1120},
          {id:'r-core',team:1,lane:'mid',tier:3,kind:'core',name:'RED NEURAL CORE',x:3160,y:950,r:76,maxHp:3000}
        ]
      }
    },
    {
      id:'firewall-valley', name:'FIREWALL VALLEY', size:'XL', environment:'Split Canyon Security Grid', playStyle:'Core Siege · 2 Lanes · Long-Range Pulse Towers',
      width:3200,height:1700, floor:'#140d13', grid:'rgba(255,122,92,.04)', accent:'#ff9a62', danger:'#64e7ff',
      walls:[
        W(0,0,3200,34),W(0,1666,3200,34),W(0,0,34,1700),W(3166,0,34,1700),
        W(1180,690,840,320,'cliff'),W(930,760,170,180,'bunker'),W(2100,760,170,180,'bunker'),
        W(560,760,150,180,'cover'),W(2490,760,150,180,'cover'),
        W(820,250,250,110,'server'),W(2130,1340,250,110,'server'),W(820,1340,250,110,'server'),W(2130,250,250,110,'server'),
        W(1420,250,360,85,'barrier'),W(1420,1365,360,85,'barrier'),
        R(1320,560,560,18),R(1320,1122,560,18)
      ],
      decor:[D(100,80,420,48,'hazard'),D(2680,1570,420,48,'hazard'),D(1480,735,240,230,'reactor-glow')],
      pickups:[P(620,500,'rifle'),P(620,1200,'tacticalshotgun'),P(1080,500,'dmr'),P(1080,1200,'autoshotgun'),P(1600,460,'sniper'),P(1600,1240,'pulserifle'),P(2120,500,'heavylmg'),P(2120,1200,'scattergun'),P(2760,850,'battlerifle')],
      healthPickups:[H(780,650,25,15000),H(780,1050,25,15000),H(1600,620,30,18000),H(1600,1080,30,18000),H(2420,650,25,15000),H(2420,1050,25,15000)],
      spawnPairs:[S(180,1080,3020,620,0,Math.PI)],
      siege:{
        timeLimitSec:840,
        spawns:[{x:180,y:1080,a:0},{x:3020,y:620,a:Math.PI}],
        lanes:[
          {id:'upper',label:'UPPER VALLEY',paths:[[{x:330,y:500},{x:700,y:500},{x:1080,y:500},{x:1380,y:500},{x:1600,y:520},{x:1820,y:500},{x:2120,y:500},{x:2500,y:500},{x:2870,y:500}],[{x:2870,y:500},{x:2500,y:500},{x:2120,y:500},{x:1820,y:500},{x:1600,y:520},{x:1380,y:500},{x:1080,y:500},{x:700,y:500},{x:330,y:500}]]},
          {id:'lower',label:'LOWER VALLEY',paths:[[{x:330,y:1200},{x:700,y:1200},{x:1080,y:1200},{x:1380,y:1200},{x:1600,y:1180},{x:1820,y:1200},{x:2120,y:1200},{x:2500,y:1200},{x:2870,y:1200}],[{x:2870,y:1200},{x:2500,y:1200},{x:2120,y:1200},{x:1820,y:1200},{x:1600,y:1180},{x:1380,y:1200},{x:1080,y:1200},{x:700,y:1200},{x:330,y:1200}]]}
        ],
        structures:[
          {id:'b-upper-g',team:0,lane:'upper',tier:1,kind:'guardian',name:'BLUE UPPER GUARDIAN',x:1160,y:500,r:46,maxHp:820},
          {id:'b-lower-g',team:0,lane:'lower',tier:1,kind:'guardian',name:'BLUE LOWER GUARDIAN',x:1160,y:1200,r:46,maxHp:820},
          {id:'b-upper-p',team:0,lane:'upper',tier:2,kind:'pulse',name:'BLUE UPPER PULSE',x:650,y:500,r:54,maxHp:1160},
          {id:'b-lower-p',team:0,lane:'lower',tier:2,kind:'pulse',name:'BLUE LOWER PULSE',x:650,y:1200,r:54,maxHp:1160},
          {id:'b-core',team:0,lane:'mid',tier:3,kind:'core',name:'BLUE VALLEY CORE',x:240,y:850,r:74,maxHp:2900},
          {id:'r-upper-g',team:1,lane:'upper',tier:1,kind:'guardian',name:'RED UPPER GUARDIAN',x:2040,y:500,r:46,maxHp:820},
          {id:'r-lower-g',team:1,lane:'lower',tier:1,kind:'guardian',name:'RED LOWER GUARDIAN',x:2040,y:1200,r:46,maxHp:820},
          {id:'r-upper-p',team:1,lane:'upper',tier:2,kind:'pulse',name:'RED UPPER PULSE',x:2550,y:500,r:54,maxHp:1160},
          {id:'r-lower-p',team:1,lane:'lower',tier:2,kind:'pulse',name:'RED LOWER PULSE',x:2550,y:1200,r:54,maxHp:1160},
          {id:'r-core',team:1,lane:'mid',tier:3,kind:'core',name:'RED VALLEY CORE',x:2960,y:850,r:74,maxHp:2900}
        ]
      }
    },
    {
      id:'byte-metropolis', name:'BYTE METROPOLIS', size:'XXL', environment:'Three-Lane Cyber City', playStyle:'Core Siege · 3 Lanes · 4 Defense Tiers · Full Siege',
      width:3600,height:2100, floor:'#09121c', grid:'rgba(120,168,255,.043)', accent:'#79a8ff', danger:'#ff6b86',
      walls:[
        W(0,0,3600,34),W(0,2066,3600,34),W(0,0,34,2100),W(3566,0,34,2100),
        W(540,670,420,180,'city-block'),W(540,1250,420,180,'city-block'),W(2640,670,420,180,'city-block'),W(2640,1250,420,180,'city-block'),
        W(1120,650,330,200,'city-block'),W(1120,1250,330,200,'city-block'),W(2150,650,330,200,'city-block'),W(2150,1250,330,200,'city-block'),
        W(1550,690,500,150,'plaza'),W(1550,1260,500,150,'plaza'),
        W(1480,700,160,150,'tower-block'),W(1960,1250,160,150,'tower-block'),
        W(300,770,160,220,'base-wall'),W(300,1110,160,220,'base-wall'),W(3140,770,160,220,'base-wall'),W(3140,1110,160,220,'base-wall'),
        R(1440,590,720,18),R(1440,1492,720,18)
      ],
      decor:[D(110,90,520,50,'neon'),D(2970,1960,520,50,'neon'),D(1660,930,280,240,'reactor-glow')],
      pickups:[P(720,460,'compactsmg'),P(720,1050,'shotgun'),P(720,1640,'pdw'),P(1220,460,'battlerifle'),P(1220,1640,'autoshotgun'),P(1800,460,'sniper'),P(1800,1050,'pulserifle'),P(1800,1640,'tacticalshotgun'),P(2380,460,'dmr'),P(2380,1640,'heavylmg'),P(2880,1050,'scattergun')],
      healthPickups:[H(900,620,25,15000),H(900,1480,25,15000),H(1420,1050,30,17000),H(2180,1050,30,17000),H(2700,620,25,15000),H(2700,1480,25,15000)],
      spawnPairs:[S(150,1290,3450,810,0,Math.PI)],
      siege:{
        timeLimitSec:900,
        spawns:[{x:150,y:1290,a:0},{x:3450,y:810,a:Math.PI}],
        lanes:[
          {id:'top',label:'SKYWAY',paths:[[{x:340,y:460},{x:760,y:460},{x:1160,y:460},{x:1500,y:460},{x:1800,y:460},{x:2100,y:460},{x:2440,y:460},{x:2840,y:460},{x:3260,y:460}],[{x:3260,y:460},{x:2840,y:460},{x:2440,y:460},{x:2100,y:460},{x:1800,y:460},{x:1500,y:460},{x:1160,y:460},{x:760,y:460},{x:340,y:460}]]},
          {id:'mid',label:'CENTRAL AVENUE',paths:[[{x:340,y:1050},{x:760,y:1050},{x:1160,y:1050},{x:1500,y:1050},{x:1800,y:1050},{x:2100,y:1050},{x:2440,y:1050},{x:2840,y:1050},{x:3260,y:1050}],[{x:3260,y:1050},{x:2840,y:1050},{x:2440,y:1050},{x:2100,y:1050},{x:1800,y:1050},{x:1500,y:1050},{x:1160,y:1050},{x:760,y:1050},{x:340,y:1050}]]},
          {id:'bottom',label:'LOWER GRID',paths:[[{x:340,y:1640},{x:760,y:1640},{x:1160,y:1640},{x:1500,y:1640},{x:1800,y:1640},{x:2100,y:1640},{x:2440,y:1640},{x:2840,y:1640},{x:3260,y:1640}],[{x:3260,y:1640},{x:2840,y:1640},{x:2440,y:1640},{x:2100,y:1640},{x:1800,y:1640},{x:1500,y:1640},{x:1160,y:1640},{x:760,y:1640},{x:340,y:1640}]]}
        ],
        structures:[
          {id:'b-top-g',team:0,lane:'top',tier:1,kind:'guardian',name:'BLUE SKY GUARDIAN',x:1440,y:460,r:46,maxHp:840},
          {id:'b-mid-g',team:0,lane:'mid',tier:1,kind:'guardian',name:'BLUE MID GUARDIAN',x:1440,y:1050,r:46,maxHp:840},
          {id:'b-bottom-g',team:0,lane:'bottom',tier:1,kind:'guardian',name:'BLUE LOWER GUARDIAN',x:1440,y:1640,r:46,maxHp:840},
          {id:'b-top-b',team:0,lane:'top',tier:2,kind:'bastion',name:'BLUE SKY BASTION',x:980,y:460,r:54,maxHp:1180},
          {id:'b-mid-b',team:0,lane:'mid',tier:2,kind:'bastion',name:'BLUE MID BASTION',x:980,y:1050,r:54,maxHp:1180},
          {id:'b-bottom-b',team:0,lane:'bottom',tier:2,kind:'bastion',name:'BLUE LOWER BASTION',x:980,y:1640,r:54,maxHp:1180},
          {id:'b-firewall',team:0,lane:'mid',tier:3,kind:'firewall',name:'BLUE CITY FIREWALL',x:520,y:1050,r:60,maxHp:1500},
          {id:'b-core',team:0,lane:'mid',tier:4,kind:'core',name:'BLUE METRO CORE',x:220,y:1050,r:80,maxHp:3400},
          {id:'r-top-g',team:1,lane:'top',tier:1,kind:'guardian',name:'RED SKY GUARDIAN',x:2160,y:460,r:46,maxHp:840},
          {id:'r-mid-g',team:1,lane:'mid',tier:1,kind:'guardian',name:'RED MID GUARDIAN',x:2160,y:1050,r:46,maxHp:840},
          {id:'r-bottom-g',team:1,lane:'bottom',tier:1,kind:'guardian',name:'RED LOWER GUARDIAN',x:2160,y:1640,r:46,maxHp:840},
          {id:'r-top-b',team:1,lane:'top',tier:2,kind:'bastion',name:'RED SKY BASTION',x:2620,y:460,r:54,maxHp:1180},
          {id:'r-mid-b',team:1,lane:'mid',tier:2,kind:'bastion',name:'RED MID BASTION',x:2620,y:1050,r:54,maxHp:1180},
          {id:'r-bottom-b',team:1,lane:'bottom',tier:2,kind:'bastion',name:'RED LOWER BASTION',x:2620,y:1640,r:54,maxHp:1180},
          {id:'r-firewall',team:1,lane:'mid',tier:3,kind:'firewall',name:'RED CITY FIREWALL',x:3080,y:1050,r:60,maxHp:1500},
          {id:'r-core',team:1,lane:'mid',tier:4,kind:'core',name:'RED METRO CORE',x:3380,y:1050,r:80,maxHp:3400}
        ]
      }
    },
    {
      id:'quantum-harbor', name:'QUANTUM HARBOR', size:'XL', environment:'Dual-Dock Quantum Port', playStyle:'Core Siege · 2 Lanes · Open Dock Rotations',
      width:3100,height:1800, floor:'#07141a', grid:'rgba(57,226,215,.045)', accent:'#39e2d7', danger:'#ff6b86',
      walls:[
        W(0,0,3100,34),W(0,1766,3100,34),W(0,0,34,1800),W(3066,0,34,1800),
        W(760,760,240,280,'container'),W(2100,760,240,280,'container'),W(1280,760,220,110,'server'),W(1600,930,220,110,'server'),
        W(520,260,180,110,'crate'),W(2400,1430,180,110,'crate'),W(520,1430,180,110,'crate'),W(2400,260,180,110,'crate'),
        W(1100,260,210,100,'cover'),W(1790,1440,210,100,'cover'),W(1790,260,210,100,'cover'),W(1100,1440,210,100,'cover'),
        R(1240,700,620,18),R(1240,1082,620,18)
      ],
      decor:[D(90,90,460,44,'neon'),D(2550,1660,460,44,'neon'),D(1450,810,200,180,'reactor-glow')],
      pickups:[P(650,500,'pdw'),P(650,1300,'shotgun'),P(1120,500,'rifle'),P(1120,1300,'autoshotgun'),P(1980,500,'dmr'),P(1980,1300,'pulserifle'),P(2450,500,'sniper'),P(2450,1300,'heavylmg')],
      healthPickups:[H(850,650,25,15000),H(850,1150,25,15000),H(1550,650,30,17000),H(1550,1150,30,17000),H(2250,650,25,15000),H(2250,1150,25,15000)],
      spawnPairs:[S(170,1120,2930,680,0,Math.PI)],
      siege:{timeLimitSec:840,spawns:[{x:170,y:1120,a:0},{x:2930,y:680,a:Math.PI}],lanes:[
        {id:'north',label:'NORTH DOCK',paths:[[{x:320,y:500},{x:720,y:500},{x:1100,y:500},{x:1450,y:500},{x:1550,y:500},{x:1650,y:500},{x:2000,y:500},{x:2380,y:500},{x:2780,y:500}],[{x:2780,y:500},{x:2380,y:500},{x:2000,y:500},{x:1650,y:500},{x:1550,y:500},{x:1450,y:500},{x:1100,y:500},{x:720,y:500},{x:320,y:500}]]},
        {id:'south',label:'SOUTH DOCK',paths:[[{x:320,y:1300},{x:720,y:1300},{x:1100,y:1300},{x:1450,y:1300},{x:1550,y:1300},{x:1650,y:1300},{x:2000,y:1300},{x:2380,y:1300},{x:2780,y:1300}],[{x:2780,y:1300},{x:2380,y:1300},{x:2000,y:1300},{x:1650,y:1300},{x:1550,y:1300},{x:1450,y:1300},{x:1100,y:1300},{x:720,y:1300},{x:320,y:1300}]]}
      ],structures:[
        {id:'b-n-g',team:0,lane:'north',tier:1,kind:'guardian',name:'BLUE NORTH GUARDIAN',x:1180,y:500,r:46,maxHp:810},{id:'b-s-g',team:0,lane:'south',tier:1,kind:'guardian',name:'BLUE SOUTH GUARDIAN',x:1180,y:1300,r:46,maxHp:810},
        {id:'b-n-b',team:0,lane:'north',tier:2,kind:'bastion',name:'BLUE NORTH BASTION',x:690,y:500,r:54,maxHp:1140},{id:'b-s-b',team:0,lane:'south',tier:2,kind:'bastion',name:'BLUE SOUTH BASTION',x:690,y:1300,r:54,maxHp:1140},{id:'b-core',team:0,lane:'mid',tier:3,kind:'core',name:'BLUE HARBOR CORE',x:240,y:900,r:76,maxHp:3000},
        {id:'r-n-g',team:1,lane:'north',tier:1,kind:'guardian',name:'RED NORTH GUARDIAN',x:1920,y:500,r:46,maxHp:810},{id:'r-s-g',team:1,lane:'south',tier:1,kind:'guardian',name:'RED SOUTH GUARDIAN',x:1920,y:1300,r:46,maxHp:810},
        {id:'r-n-b',team:1,lane:'north',tier:2,kind:'bastion',name:'RED NORTH BASTION',x:2410,y:500,r:54,maxHp:1140},{id:'r-s-b',team:1,lane:'south',tier:2,kind:'bastion',name:'RED SOUTH BASTION',x:2410,y:1300,r:54,maxHp:1140},{id:'r-core',team:1,lane:'mid',tier:3,kind:'core',name:'RED HARBOR CORE',x:2860,y:900,r:76,maxHp:3000}
      ]}
    },
    {
      id:'packet-rift', name:'PACKET RIFT', size:'XXL', environment:'Fractured Network Expanse', playStyle:'Core Siege · 3 Lanes · Fast Rotations',
      width:3320,height:1940, floor:'#0b0c1b', grid:'rgba(157,118,255,.045)', accent:'#a37cff', danger:'#ff6e9a',
      walls:[W(0,0,3320,34),W(0,1906,3320,34),W(0,0,34,1940),W(3286,0,34,1940),
        W(700,690,300,120,'server'),W(700,1130,300,120,'server'),W(2320,690,300,120,'server'),W(2320,1130,300,120,'server'),
        W(1350,670,220,120,'cover'),W(1750,1150,220,120,'cover'),W(1750,670,220,120,'cover'),W(1350,1150,220,120,'cover'),
        W(1510,840,300,260,'reactor'),W(430,250,170,100,'crate'),W(2720,1590,170,100,'crate'),W(430,1590,170,100,'crate'),W(2720,250,170,100,'crate'),R(1400,590,520,18),R(1400,1332,520,18)],
      decor:[D(90,80,460,44,'neon'),D(2770,1810,460,44,'neon'),D(1560,880,200,180,'reactor-glow')],
      pickups:[P(650,420,'compactsmg'),P(650,970,'shotgun'),P(650,1520,'pdw'),P(1180,420,'battlerifle'),P(1180,1520,'tacticalshotgun'),P(1660,1280,'pulserifle'),P(2140,420,'sniper'),P(2140,1520,'autoshotgun'),P(2670,970,'heavylmg')],
      healthPickups:[H(860,590,25),H(860,1350,25),H(1660,690,30),H(1660,1250,30),H(2460,590,25),H(2460,1350,25)],spawnPairs:[S(170,1200,3150,740,0,Math.PI)],
      siege:{timeLimitSec:900,spawns:[{x:170,y:1200,a:0},{x:3150,y:740,a:Math.PI}],lanes:[
        {id:'top',label:'UPLINK',paths:[[{x:320,y:420},{x:720,y:420},{x:1120,y:420},{x:1460,y:420},{x:1660,y:420},{x:1860,y:420},{x:2200,y:420},{x:2600,y:420},{x:3000,y:420}],[{x:3000,y:420},{x:2600,y:420},{x:2200,y:420},{x:1860,y:420},{x:1660,y:420},{x:1460,y:420},{x:1120,y:420},{x:720,y:420},{x:320,y:420}]]},
        {id:'mid',label:'RIFT LINE',paths:[[{x:320,y:970},{x:720,y:970},{x:1120,y:970},{x:1320,y:970},{x:1320,y:550},{x:2000,y:550},{x:2000,y:970},{x:2200,y:970},{x:2600,y:970},{x:3000,y:970}],[{x:3000,y:970},{x:2600,y:970},{x:2200,y:970},{x:2000,y:970},{x:2000,y:1400},{x:1320,y:1400},{x:1320,y:970},{x:1120,y:970},{x:720,y:970},{x:320,y:970}]]},
        {id:'bottom',label:'DOWNLINK',paths:[[{x:320,y:1520},{x:720,y:1520},{x:1120,y:1520},{x:1460,y:1520},{x:1660,y:1520},{x:1860,y:1520},{x:2200,y:1520},{x:2600,y:1520},{x:3000,y:1520}],[{x:3000,y:1520},{x:2600,y:1520},{x:2200,y:1520},{x:1860,y:1520},{x:1660,y:1520},{x:1460,y:1520},{x:1120,y:1520},{x:720,y:1520},{x:320,y:1520}]]}
      ],structures:[
        {id:'b-t-g',team:0,lane:'top',tier:1,kind:'guardian',name:'BLUE UPLINK GUARDIAN',x:1260,y:420,r:46,maxHp:800},{id:'b-m-g',team:0,lane:'mid',tier:1,kind:'guardian',name:'BLUE RIFT GUARDIAN',x:1260,y:970,r:46,maxHp:800},{id:'b-b-g',team:0,lane:'bottom',tier:1,kind:'guardian',name:'BLUE DOWNLINK GUARDIAN',x:1260,y:1520,r:46,maxHp:800},{id:'b-fw',team:0,lane:'mid',tier:2,kind:'firewall',name:'BLUE RIFT FIREWALL',x:700,y:970,r:58,maxHp:1350},{id:'b-core',team:0,lane:'mid',tier:3,kind:'core',name:'BLUE PACKET CORE',x:240,y:970,r:76,maxHp:3100},
        {id:'r-t-g',team:1,lane:'top',tier:1,kind:'guardian',name:'RED UPLINK GUARDIAN',x:2060,y:420,r:46,maxHp:800},{id:'r-m-g',team:1,lane:'mid',tier:1,kind:'guardian',name:'RED RIFT GUARDIAN',x:2060,y:970,r:46,maxHp:800},{id:'r-b-g',team:1,lane:'bottom',tier:1,kind:'guardian',name:'RED DOWNLINK GUARDIAN',x:2060,y:1520,r:46,maxHp:800},{id:'r-fw',team:1,lane:'mid',tier:2,kind:'firewall',name:'RED RIFT FIREWALL',x:2620,y:970,r:58,maxHp:1350},{id:'r-core',team:1,lane:'mid',tier:3,kind:'core',name:'RED PACKET CORE',x:3080,y:970,r:76,maxHp:3100}
      ]}
    },
    {
      id:'zero-day-foundry', name:'ZERO DAY FOUNDRY', size:'LARGE', environment:'Industrial Exploit Forge', playStyle:'Core Siege · 1 Lane · Curved Foundry Push',
      width:2920,height:1620, floor:'#160e0a', grid:'rgba(255,157,72,.04)', accent:'#ff9d48', danger:'#57e5ff',
      walls:[W(0,0,2920,34),W(0,1586,2920,34),W(0,0,34,1620),W(2886,0,34,1620),W(720,330,250,180,'crate'),W(720,1110,250,180,'crate'),W(1950,330,250,180,'crate'),W(1950,1110,250,180,'crate'),W(1180,560,200,130,'server'),W(1540,930,200,130,'server'),W(1370,250,180,120,'cover'),W(1370,1250,180,120,'cover'),R(1120,520,680,18),R(1120,1082,680,18)],
      decor:[D(90,90,420,48,'hazard'),D(2410,1480,420,48,'hazard'),D(1360,690,200,240,'reactor-glow')],
      pickups:[P(600,810,'shotgun'),P(940,700,'smg'),P(1160,930,'battlerifle'),P(1460,430,'dmr'),P(1760,1050,'pulserifle'),P(1980,690,'autoshotgun'),P(2320,810,'heavylmg')],healthPickups:[H(780,930,25),H(1180,760,25),H(1740,860,30),H(2140,700,25)],spawnPairs:[S(150,1040,2770,580,0,Math.PI)],
      siege:{timeLimitSec:760,spawns:[{x:150,y:1040,a:0},{x:2770,y:580,a:Math.PI}],lanes:[{id:'forge',label:'FOUNDRY LINE',paths:[[{x:300,y:810},{x:620,y:810},{x:900,y:810},{x:1120,y:810},{x:1120,y:740},{x:1460,y:740},{x:1460,y:810},{x:1800,y:810},{x:2020,y:810},{x:2300,y:810},{x:2620,y:810}],[{x:2620,y:810},{x:2300,y:810},{x:2020,y:810},{x:1800,y:810},{x:1800,y:880},{x:1460,y:880},{x:1460,y:810},{x:1120,y:810},{x:900,y:810},{x:620,y:810},{x:300,y:810}]]}],structures:[
        {id:'b-g',team:0,lane:'forge',tier:1,kind:'guardian',name:'BLUE FORGE GUARDIAN',x:1120,y:810,r:48,maxHp:900},{id:'b-p',team:0,lane:'forge',tier:2,kind:'pulse',name:'BLUE FORGE PULSE',x:650,y:810,r:55,maxHp:1250},{id:'b-core',team:0,lane:'forge',tier:3,kind:'core',name:'BLUE FOUNDRY CORE',x:240,y:810,r:76,maxHp:3000},{id:'r-g',team:1,lane:'forge',tier:1,kind:'guardian',name:'RED FORGE GUARDIAN',x:1800,y:810,r:48,maxHp:900},{id:'r-p',team:1,lane:'forge',tier:2,kind:'pulse',name:'RED FORGE PULSE',x:2270,y:810,r:55,maxHp:1250},{id:'r-core',team:1,lane:'forge',tier:3,kind:'core',name:'RED FOUNDRY CORE',x:2680,y:810,r:76,maxHp:3000}
      ]}
    },
    {
      id:'neon-crossroads', name:'NEON CROSSROADS', size:'XL', environment:'Split-Lane Neon Junction', playStyle:'Core Siege · 2 Lanes · Central Rotation Hub',
      width:3260,height:1840, floor:'#100918', grid:'rgba(255,85,210,.04)', accent:'#ff62d8', danger:'#5be9ff',
      walls:[W(0,0,3260,34),W(0,1806,3260,34),W(0,0,34,1840),W(3226,0,34,1840),W(720,760,250,320,'city-block'),W(2290,760,250,320,'city-block'),W(1260,780,220,100,'cover'),W(1780,960,220,100,'cover'),W(1510,760,240,320,'plaza'),W(480,250,180,100,'crate'),W(2600,1490,180,100,'crate'),W(480,1490,180,100,'crate'),W(2600,250,180,100,'crate'),R(1260,680,740,18),R(1260,1142,740,18)],
      decor:[D(90,80,500,46,'neon'),D(2670,1710,500,46,'neon'),D(1530,810,200,220,'reactor-glow')],
      pickups:[P(660,520,'compactsmg'),P(660,1320,'shotgun'),P(1120,520,'rifle'),P(1120,1320,'tacticalshotgun'),P(1630,520,'sniper'),P(1630,1320,'pulserifle'),P(2140,520,'dmr'),P(2140,1320,'autoshotgun'),P(2600,920,'heavylmg')],healthPickups:[H(860,680,25),H(860,1160,25),H(1630,640,30),H(1630,1200,30),H(2400,680,25),H(2400,1160,25)],spawnPairs:[S(170,1160,3090,680,0,Math.PI)],
      siege:{timeLimitSec:840,spawns:[{x:170,y:1160,a:0},{x:3090,y:680,a:Math.PI}],lanes:[
        {id:'upper',label:'NEON NORTH',paths:[[{x:320,y:520},{x:720,y:520},{x:1120,y:520},{x:1450,y:520},{x:1630,y:520},{x:1810,y:520},{x:2140,y:520},{x:2540,y:520},{x:2940,y:520}],[{x:2940,y:520},{x:2540,y:520},{x:2140,y:520},{x:1810,y:520},{x:1630,y:520},{x:1450,y:520},{x:1120,y:520},{x:720,y:520},{x:320,y:520}]]},
        {id:'lower',label:'NEON SOUTH',paths:[[{x:320,y:1320},{x:720,y:1320},{x:1120,y:1320},{x:1450,y:1320},{x:1630,y:1320},{x:1810,y:1320},{x:2140,y:1320},{x:2540,y:1320},{x:2940,y:1320}],[{x:2940,y:1320},{x:2540,y:1320},{x:2140,y:1320},{x:1810,y:1320},{x:1630,y:1320},{x:1450,y:1320},{x:1120,y:1320},{x:720,y:1320},{x:320,y:1320}]]}
      ],structures:[
        {id:'b-u-g',team:0,lane:'upper',tier:1,kind:'guardian',name:'BLUE NORTH GUARDIAN',x:1220,y:520,r:46,maxHp:820},{id:'b-l-g',team:0,lane:'lower',tier:1,kind:'guardian',name:'BLUE SOUTH GUARDIAN',x:1220,y:1320,r:46,maxHp:820},{id:'b-fw',team:0,lane:'mid',tier:2,kind:'firewall',name:'BLUE JUNCTION FIREWALL',x:620,y:920,r:58,maxHp:1350},{id:'b-core',team:0,lane:'mid',tier:3,kind:'core',name:'BLUE NEON CORE',x:240,y:920,r:76,maxHp:3050},
        {id:'r-u-g',team:1,lane:'upper',tier:1,kind:'guardian',name:'RED NORTH GUARDIAN',x:2040,y:520,r:46,maxHp:820},{id:'r-l-g',team:1,lane:'lower',tier:1,kind:'guardian',name:'RED SOUTH GUARDIAN',x:2040,y:1320,r:46,maxHp:820},{id:'r-fw',team:1,lane:'mid',tier:2,kind:'firewall',name:'RED JUNCTION FIREWALL',x:2640,y:920,r:58,maxHp:1350},{id:'r-core',team:1,lane:'mid',tier:3,kind:'core',name:'RED NEON CORE',x:3020,y:920,r:76,maxHp:3050}
      ]}
    },
    {
      id:'cloud-spire', name:'CLOUD SPIRE', size:'XXL', environment:'High-Altitude Data Citadel', playStyle:'Core Siege · 3 Lanes · Open Long-Range Warfare',
      width:3520,height:2020, floor:'#07121f', grid:'rgba(118,190,255,.043)', accent:'#76beff', danger:'#ff7692',
      walls:[W(0,0,3520,34),W(0,1986,3520,34),W(0,0,34,2020),W(3486,0,34,2020),W(600,690,300,150,'server'),W(600,1180,300,150,'server'),W(2620,690,300,150,'server'),W(2620,1180,300,150,'server'),W(1220,690,220,150,'cover'),W(2080,1180,220,150,'cover'),W(2080,690,220,150,'cover'),W(1220,1180,220,150,'cover'),W(1580,800,360,120,'tower-block'),W(1580,1100,360,120,'tower-block'),W(400,260,180,100,'crate'),W(2940,1660,180,100,'crate'),W(400,1660,180,100,'crate'),W(2940,260,180,100,'crate'),R(1450,620,620,18),R(1450,1382,620,18)],
      decor:[D(100,90,500,44,'neon'),D(2920,1880,500,44,'neon'),D(1650,900,220,220,'reactor-glow')],
      pickups:[P(720,420,'pdw'),P(720,1010,'shotgun'),P(720,1600,'compactsmg'),P(1240,420,'battlerifle'),P(1240,1600,'tacticalshotgun'),P(1760,420,'sniper'),P(1760,1600,'pulserifle'),P(2280,420,'dmr'),P(2280,1600,'autoshotgun'),P(2800,1010,'heavylmg')],healthPickups:[H(920,600,25),H(920,1420,25),H(1760,690,30),H(1760,1330,30),H(2600,600,25),H(2600,1420,25)],spawnPairs:[S(180,1280,3340,740,0,Math.PI)],
      siege:{timeLimitSec:900,spawns:[{x:180,y:1280,a:0},{x:3340,y:740,a:Math.PI}],lanes:[
        {id:'top',label:'UPPER CLOUD',paths:[[{x:340,y:420},{x:760,y:420},{x:1160,y:420},{x:1500,y:420},{x:1760,y:420},{x:2020,y:420},{x:2360,y:420},{x:2760,y:420},{x:3180,y:420}],[{x:3180,y:420},{x:2760,y:420},{x:2360,y:420},{x:2020,y:420},{x:1760,y:420},{x:1500,y:420},{x:1160,y:420},{x:760,y:420},{x:340,y:420}]]},
        {id:'mid',label:'SPIRE AVENUE',paths:[[{x:340,y:1010},{x:760,y:1010},{x:1160,y:1010},{x:1420,y:1010},{x:1760,y:1010},{x:2100,y:1010},{x:2360,y:1010},{x:2760,y:1010},{x:3180,y:1010}],[{x:3180,y:1010},{x:2760,y:1010},{x:2360,y:1010},{x:2100,y:1010},{x:1760,y:1010},{x:1420,y:1010},{x:1160,y:1010},{x:760,y:1010},{x:340,y:1010}]]},
        {id:'bottom',label:'LOWER CLOUD',paths:[[{x:340,y:1600},{x:760,y:1600},{x:1160,y:1600},{x:1500,y:1600},{x:1760,y:1600},{x:2020,y:1600},{x:2360,y:1600},{x:2760,y:1600},{x:3180,y:1600}],[{x:3180,y:1600},{x:2760,y:1600},{x:2360,y:1600},{x:2020,y:1600},{x:1760,y:1600},{x:1500,y:1600},{x:1160,y:1600},{x:760,y:1600},{x:340,y:1600}]]}
      ],structures:[
        {id:'b-t-g',team:0,lane:'top',tier:1,kind:'guardian',name:'BLUE UPPER GUARDIAN',x:1380,y:420,r:46,maxHp:840},{id:'b-m-g',team:0,lane:'mid',tier:1,kind:'guardian',name:'BLUE MID GUARDIAN',x:1380,y:1010,r:46,maxHp:840},{id:'b-b-g',team:0,lane:'bottom',tier:1,kind:'guardian',name:'BLUE LOWER GUARDIAN',x:1380,y:1600,r:46,maxHp:840},{id:'b-bastion',team:0,lane:'mid',tier:2,kind:'bastion',name:'BLUE SPIRE BASTION',x:820,y:1010,r:56,maxHp:1280},{id:'b-core',team:0,lane:'mid',tier:3,kind:'core',name:'BLUE CLOUD CORE',x:240,y:1010,r:78,maxHp:3250},
        {id:'r-t-g',team:1,lane:'top',tier:1,kind:'guardian',name:'RED UPPER GUARDIAN',x:2140,y:420,r:46,maxHp:840},{id:'r-m-g',team:1,lane:'mid',tier:1,kind:'guardian',name:'RED MID GUARDIAN',x:2140,y:1010,r:46,maxHp:840},{id:'r-b-g',team:1,lane:'bottom',tier:1,kind:'guardian',name:'RED LOWER GUARDIAN',x:2140,y:1600,r:46,maxHp:840},{id:'r-bastion',team:1,lane:'mid',tier:2,kind:'bastion',name:'RED SPIRE BASTION',x:2700,y:1010,r:56,maxHp:1280},{id:'r-core',team:1,lane:'mid',tier:3,kind:'core',name:'RED CLOUD CORE',x:3280,y:1010,r:78,maxHp:3250}
      ]}
    }
  ];

  const MAP_BY_ID = Object.freeze(Object.fromEntries(MAPS.map(map => [map.id, map])));
  const SIEGE_BY_ID = Object.freeze(Object.fromEntries(SIEGE_MAPS.map(map => [map.id, map])));
  const DEFAULT_MAP_ID = 'data-vault';
  const DEFAULT_SIEGE_MAP_ID = 'data-frontier';

  function get(id){ return MAP_BY_ID[id] || MAP_BY_ID[DEFAULT_MAP_ID]; }
  function random(excludeId=''){
    const pool = MAPS.filter(map => map.id !== excludeId);
    return pool[Math.floor(Math.random() * Math.max(1,pool.length))] || MAPS[0];
  }
  function getSiege(id){ return SIEGE_BY_ID[id] || SIEGE_BY_ID[DEFAULT_SIEGE_MAP_ID]; }
  function randomSiege(excludeId=''){
    const pool = SIEGE_MAPS.filter(map => map.id !== excludeId);
    return pool[Math.floor(Math.random() * Math.max(1,pool.length))] || SIEGE_MAPS[0];
  }

  window.ICT8ByteStrikeMaps = Object.freeze({version:9, maps:Object.freeze(MAPS), get, random, defaultMapId:DEFAULT_MAP_ID, siegeMaps:Object.freeze(SIEGE_MAPS), getSiege, randomSiege, defaultSiegeMapId:DEFAULT_SIEGE_MAP_ID});
})();
