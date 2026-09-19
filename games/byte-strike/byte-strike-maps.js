(() => {
  'use strict';

  if (window.ICT8ByteStrikeMaps) return;

  const W = (x,y,w,h, kind='wall') => ({x,y,w,h,solid:true,vision:true,kind});
  const R = (x,y,w,h, kind='rail') => ({x,y,w,h,solid:true,vision:false,kind});
  const D = (x,y,w,h, kind='decor') => ({x,y,w,h,solid:false,vision:false,kind});
  const P = (x,y,weapon) => ({x,y,weapon});
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
      pickups:[P(880,330,'carbine'),P(470,770,'smg'),P(1290,390,'shotgun'),P(880,835,'dmr')],
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
      pickups:[P(770,520,'shotgun'),P(470,520,'machinepistol'),P(1070,520,'machinepistol'),P(770,250,'revolver'),P(770,790,'revolver')],
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
      pickups:[P(950,590,'dmr'),P(690,770,'lmg'),P(1210,410,'carbine'),P(950,350,'revolver')],
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
      pickups:[P(850,600,'pdw'),P(490,180,'shotgun'),P(1260,1040,'carbine'),P(1260,180,'machinepistol')],
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
      pickups:[P(880,365,'rifle'),P(880,755,'rifle'),P(540,560,'pdw'),P(1220,560,'pdw'),P(880,560,'dmr')],
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
      pickups:[P(840,330,'carbine'),P(840,790,'shotgun'),P(500,560,'lmg'),P(1180,560,'lmg'),P(840,560,'revolver')],
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
      pickups:[P(910,300,'dmr'),P(910,850,'shotgun'),P(500,700,'smg'),P(1320,460,'carbine')],
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
      pickups:[P(800,400,'shotgun'),P(800,670,'lmg'),P(500,650,'machinepistol'),P(1100,390,'pdw'),P(800,535,'revolver')],
      spawnPairs:[S(110,530,1490,530,0,Math.PI),S(150,120,1450,940,.55,-2.6),S(150,940,1450,120,-.55,2.6)]
    }
  ];

  const MAP_BY_ID = Object.freeze(Object.fromEntries(MAPS.map(map => [map.id, map])));
  const DEFAULT_MAP_ID = 'data-vault';

  function get(id){ return MAP_BY_ID[id] || MAP_BY_ID[DEFAULT_MAP_ID]; }
  function random(excludeId=''){
    const pool = MAPS.filter(map => map.id !== excludeId);
    return pool[Math.floor(Math.random() * Math.max(1,pool.length))] || MAPS[0];
  }

  window.ICT8ByteStrikeMaps = Object.freeze({version:2, maps:Object.freeze(MAPS), get, random, defaultMapId:DEFAULT_MAP_ID});
})();
