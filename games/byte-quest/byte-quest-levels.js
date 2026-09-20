(() => {
  'use strict';

  const H = 540;
  const ground = (x, w, y = 470, h = 90, extra = {}) => ({ x, y, w, h, ...extra });
  const plat = (x, y, w, h = 24, extra = {}) => ({ x, y, w, h, ...extra });
  const chip = (x, y) => ({ x, y });
  const coinLine = (x, y, count, dx = 36) => Array.from({ length: count }, (_, i) => ({ x: x + i * dx, y }));
  const enemy = (type, x, y, extra = {}) => ({ type, x, y, ...extra });
  const hazard = (type, x, y, w, h, extra = {}) => ({ type, x, y, w, h, ...extra });
  const moving = (x, y, w, axis, distance, speed = 62, extra = {}) => plat(x, y, w, 22, { kind: 'moving', axis, distance, speed, ...extra });
  const fall = (x, y, w, extra = {}) => plat(x, y, w, 22, { kind: 'falling', ...extra });
  const blink = (x, y, w, extra = {}) => plat(x, y, w, 22, { kind: 'blinking', onMs: 1500, offMs: 850, ...extra });
  const conveyor = (x, y, w, dir = 1, speed = 84, extra = {}) => plat(x, y, w, 28, { kind: 'conveyor', conveyor: dir * speed, ...extra });
  const checkpoint = (x, y) => ({ x, y });
  const portal = (x, y, tx, ty, label = 'DATA PORTAL') => ({ x, y, tx, ty, label });
  const power = (type, x, y, extra = {}) => ({ type, x, y, ...extra });
  const gear = (type, x, y, extra = {}) => ({ type, x, y, ...extra });
  const linkToken = (x, y, gateId = 'A', extra = {}) => ({ x, y, gateId, ...extra });
  const qblock = (x, y, content = 'coin', extra = {}) => plat(x, y, 34, 34, { kind: 'question', content, ...extra });
  const brick = (x, y, extra = {}) => plat(x, y, 34, 34, { kind: 'brick', ...extra });
  const spring = (x, y, extra = {}) => plat(x, y, 52, 18, { kind: 'spring', bounce: 760, ...extra });
  const linkGate = (x, groundY, requiredKeys = 1, label = 'LINK GATE', gateId = 'A') => ({ x, y: groundY - 190, w: 26, h: 190, requiredKeys, label, gateId });

  const WORLDS = Object.freeze([
    { id: 1, name: 'DATA MEADOW', subtitle: 'Boot the world back online.', accent: '#42f5b3', sky: ['#73d8ff','#e9fbff'], ground: '#173b5d', trim: '#55e2b2' },
    { id: 2, name: 'GLITCH FOREST', subtitle: 'Trace the corruption through the canopy.', accent: '#b970ff', sky: ['#142137','#503665'], ground: '#182839', trim: '#c06cff' },
    { id: 3, name: 'VOLT FACTORY', subtitle: 'Restart the machine city.', accent: '#ffc84a', sky: ['#243445','#111922'], ground: '#313d46', trim: '#ffbd37' },
    { id: 4, name: 'CLOUD NETWORK', subtitle: 'Reconnect the highest relay.', accent: '#65c7ff', sky: ['#87dfff','#f4fbff'], ground: '#385c87', trim: '#b4efff' }
  ]);

  function baseLevel(input) {
    return {
      id: input.id,
      world: input.world,
      order: input.order,
      name: input.name,
      type: input.type || 'standard',
      difficulty: input.difficulty || 'Normal',
      xp: input.xp || 10,
      width: input.width || 3000,
      height: input.height || H,
      spawn: input.spawn || { x: 80, y: 400 },
      targetTimeMs: input.targetTimeMs || 90000,
      platforms: input.platforms || [],
      enemies: input.enemies || [],
      hazards: input.hazards || [],
      coins: input.coins || [],
      chips: input.chips || [],
      checkpoints: input.checkpoints || [],
      portals: input.portals || [],
      powerUps: input.powerUps || [],
      gearPickups: input.gearPickups || [],
      linkTokens: input.linkTokens || [],
      winds: input.winds || [],
      gates: input.gates || [],
      exit: input.exit || { x: (input.width || 3000) - 140, y: 390 },
      boss: input.boss || null,
      objective: input.objective || 'Reach the Restore Terminal.',
      tutorial: input.tutorial || [],
      escapeSpeed: input.escapeSpeed || 0,
      autoScroll: input.autoScroll || 0
    };
  }

  const LEVELS = [
    baseLevel({
      id: '1-1', world: 1, order: 1, name: 'FIRST SYNC', difficulty: 'Easy', xp: 5, width: 2520, targetTimeMs: 78000,
      platforms: [ground(0,600),ground(700,520),ground(1320,430),ground(1850,670),plat(420,385,130),plat(760,355,150),plat(1020,315,120),plat(1425,360,140),plat(1605,315,120),plat(2030,355,150),plat(2240,315,110)],
      coins: [...coinLine(160,420,6),...coinLine(740,310,5),...coinLine(1360,420,4),...coinLine(2010,310,6)],
      chips: [chip(520,340),chip(1115,270),chip(2288,270)],
      enemies: [enemy('bugbot',860,430),enemy('bugbot',1510,430),enemy('bugbot',2090,430)],
      checkpoints: [checkpoint(1375,420)],
      powerUps: [power('shield',1715,275)],
      exit: { x: 2400, y: 388 },
      tutorial: [
        { x: 120, text: 'MOVE  A / D  •  ◀ ▶' }, { x: 470, text: 'JUMP  SPACE  •  JUMP' },
        { x: 815, text: 'JUMP ON BUG BOTS' }, { x: 1380, text: 'SYNC POINT SAVES YOUR RESPAWN' }, { x: 2220, text: 'COLLECT 3 DATA CHIPS' }
      ]
    }),
    baseLevel({
      id: '1-2', world: 1, order: 2, name: 'CHIP TRAIL', difficulty: 'Normal', xp: 10, width: 3000, targetTimeMs: 82000,
      platforms: [ground(0,480),ground(610,410),ground(1140,520),ground(1790,430),ground(2350,650),plat(345,345,110),moving(720,350,120,'x',210,70),plat(1030,300,120),plat(1300,350,140),plat(1510,295,110),moving(1900,350,130,'y',120,55),plat(2160,300,125),plat(2520,330,110),plat(2700,285,120)],
      coins: [...coinLine(100,420,5),...coinLine(650,310,5),...coinLine(1180,420,6),...coinLine(1850,305,5),...coinLine(2420,420,8)],
      chips: [chip(410,300),chip(1085,255),chip(2755,240)],
      enemies: [enemy('bugbot',750,430),enemy('spikebyte',1260,430),enemy('flyer',2050,250,{range:100}),enemy('bugbot',2600,430)],
      checkpoints: [checkpoint(1560,420)],
      portals: [portal(1450,420,2670,235,'MEADOW SHORTCUT')],
      exit: { x: 2870, y: 388 }
    }),
    baseLevel({
      id: '1-3', world: 1, order: 3, name: 'PORTAL GARDEN', difficulty: 'Normal', xp: 10, width: 3220, targetTimeMs: 90000,
      platforms: [ground(0,560),ground(720,390),ground(1240,520),ground(1900,360),ground(2420,800),plat(400,360,130),plat(810,330,110),plat(1000,275,125),plat(1380,350,120),fall(1580,310,120),plat(1990,320,125),plat(2190,265,120),plat(2610,335,125),plat(2810,290,125)],
      coins: [...coinLine(120,420,7),...coinLine(780,285,7),...coinLine(1280,420,7),...coinLine(1950,280,5),...coinLine(2480,420,10)],
      chips: [chip(465,315),chip(1055,230),chip(2860,245)],
      enemies: [enemy('bugbot',880,430),enemy('spikebyte',1450,430),enemy('flyer',2050,220,{range:120}),enemy('bugbot',2500,430),enemy('firewall',2960,420,{dir:-1})],
      checkpoints: [checkpoint(1700,420)],
      portals: [portal(530,420,980,220,'SECRET BLOOM'),portal(2260,420,2750,240,'UPPER CACHE')],
      powerUps: [power('air',2115,225)],
      exit: { x: 3080, y: 388 }
    }),
    baseLevel({
      id: '1-4', world: 1, order: 4, name: 'MEADOW RUSH', type: 'time', difficulty: 'Hard', xp: 15, width: 3500, targetTimeMs: 72000,
      platforms: [ground(0,440),ground(570,360),ground(1050,430),ground(1600,330),ground(2050,400),ground(2580,360),ground(3060,440),moving(700,345,120,'x',160,85),fall(1220,335,110),moving(1720,330,120,'y',120,70),plat(2280,305,120),fall(2740,330,110),moving(3150,325,130,'x',150,95)],
      coins: [...coinLine(80,420,5),...coinLine(610,300,6),...coinLine(1080,420,5),...coinLine(1630,300,4),...coinLine(2080,420,5),...coinLine(2600,300,5),...coinLine(3090,420,6)],
      chips: [chip(800,300),chip(1775,280),chip(3250,280)],
      enemies: [enemy('bugbot',620,430),enemy('spikebyte',1120,430),enemy('bugbot',2100,430),enemy('flyer',2700,240,{range:110}),enemy('firewall',3180,420,{dir:-1})],
      checkpoints: [checkpoint(1900,420)],
      powerUps: [power('speed',2350,265)],
      exit: { x: 3380, y: 388 }, objective: 'Reach the terminal before the target time.'
    }),
    baseLevel({
      id: '1-B', world: 1, order: 5, name: 'BUGZILLA', type: 'boss', difficulty: 'Boss', xp: 20, width: 1680, targetTimeMs: 120000,
      platforms: [ground(0,1680),plat(500,350,140),plat(1040,350,140)],
      coins: [...coinLine(120,420,5),...coinLine(1280,420,5)], chips: [chip(540,305),chip(790,410),chip(1080,305)], checkpoints: [checkpoint(310,420)], powerUps: [power('shield',420,410)],
      boss: { type: 'bugzilla', x: 1240, y: 390, hp: 4, arenaStart: 720 }, exit: { x: 1540, y: 388 }, objective: 'Defeat BUGZILLA and restore Data Meadow.'
    }),

    baseLevel({
      id: '2-1', world: 2, order: 1, name: 'GLITCH ROOTS', difficulty: 'Normal', xp: 10, width: 3160, targetTimeMs: 92000,
      platforms: [ground(0,500),ground(650,370),ground(1160,400),ground(1700,360),ground(2180,410),ground(2740,420),plat(350,350,110),moving(760,340,120,'y',130,60),plat(1030,285,110),fall(1330,330,115),plat(1810,310,125),blink(2010,270,120),moving(2320,330,120,'x',170,70),plat(2860,305,120)],
      coins: [...coinLine(100,420,5),...coinLine(690,300,6),...coinLine(1190,420,5),...coinLine(1740,420,5),...coinLine(2220,420,5),...coinLine(2780,420,6)],
      chips: [chip(405,305),chip(1085,240),chip(2915,260)], enemies: [enemy('bugbot',720,430),enemy('crawler',1220,430),enemy('flyer',1880,220,{range:140}),enemy('spikebyte',2260,430),enemy('bugbot',2840,430)], checkpoints: [checkpoint(1600,420)], powerUps: [power('air',2060,225)], exit:{x:3040,y:388}
    }),
    baseLevel({
      id: '2-2', world: 2, order: 2, name: 'FLICKER CANOPY', difficulty: 'Hard', xp: 15, width: 3380, targetTimeMs: 98000,
      platforms: [ground(0,420),ground(560,350),ground(1070,320),ground(1540,340),ground(2040,350),ground(2550,350),ground(3060,320),blink(640,340,120),blink(820,290,110,{phase:500}),moving(1160,335,120,'y',150,70),fall(1420,300,110),blink(2130,320,125,{phase:850}),moving(2380,280,120,'x',180,80),fall(2790,320,120),blink(3130,285,110)],
      coins: [...coinLine(80,420,4),...coinLine(590,295,8),...coinLine(1090,420,5),...coinLine(1580,420,5),...coinLine(2070,420,6),...coinLine(2580,420,5),...coinLine(3080,420,5)], chips:[chip(875,245),chip(1240,260),chip(3180,240)], enemies:[enemy('flyer',700,210,{range:130}),enemy('crawler',1180,430),enemy('spikebyte',2110,430),enemy('flyer',2660,220,{range:150})], checkpoints:[checkpoint(1830,420)], portals:[portal(1510,420,2340,230,'GLITCH HOLLOW')], exit:{x:3260,y:388}
    }),
    baseLevel({
      id: '2-3', world: 2, order: 3, name: 'HIDDEN CACHE', type: 'collect', difficulty: 'Hard', xp: 15, width: 3500, targetTimeMs: 110000,
      platforms:[ground(0,500),ground(650,420),ground(1200,420),ground(1770,390),ground(2290,420),ground(2860,640),plat(370,340,120),plat(760,330,120),moving(980,280,120,'y',150,60),plat(1300,330,125),fall(1510,290,110),plat(1880,315,120),blink(2080,270,120),moving(2400,330,120,'x',180,72),plat(2720,285,120),plat(3090,330,120)],
      coins:[...coinLine(90,420,6),...coinLine(680,420,5),...coinLine(1220,420,5),...coinLine(1800,420,5),...coinLine(2310,420,5),...coinLine(2890,420,8)], chips:[chip(430,295),chip(1555,245),chip(2775,240)], enemies:[enemy('crawler',720,430),enemy('flyer',1360,220,{range:120}),enemy('spikebyte',1840,430),enemy('firewall',2480,420,{dir:-1}),enemy('bugbot',3020,430)], checkpoints:[checkpoint(1700,420)], portals:[portal(850,420,1470,240,'ROOT CACHE'),portal(2190,420,2690,235,'SECRET BRANCH')], powerUps:[power('pulse',1960,275)], exit:{x:3370,y:388}, objective:'Recover all three Data Chips, then reach the terminal.'
    }),
    baseLevel({
      id:'2-4', world:2, order:4, name:'CORRUPTION CHASE', type:'escape', difficulty:'Hard', xp:15, width:3720, targetTimeMs:90000, escapeSpeed:82,
      platforms:[ground(0,500),ground(630,330),ground(1080,360),ground(1580,330),ground(2050,350),ground(2540,350),ground(3050,670),fall(700,330,110),moving(900,280,120,'x',140,88),blink(1190,320,120),fall(1700,320,110),moving(2150,310,120,'y',120,80),blink(2660,320,120),fall(2900,300,115),moving(3250,310,120,'x',170,95)],
      coins:[...coinLine(110,420,6),...coinLine(660,420,5),...coinLine(1100,420,4),...coinLine(1600,420,4),...coinLine(2070,420,5),...coinLine(2560,420,5),...coinLine(3090,420,8)], chips:[chip(955,235),chip(2205,265),chip(3310,265)], enemies:[enemy('bugbot',730,430),enemy('flyer',1260,220,{range:100}),enemy('spikebyte',2110,430),enemy('crawler',2700,430)], checkpoints:[checkpoint(1980,420)], powerUps:[power('speed',2320,410)], exit:{x:3580,y:388}, objective:'Stay ahead of the corruption wave and reach the terminal.'
    }),
    baseLevel({
      id:'2-B', world:2, order:5, name:'GLITCH BEAST', type:'boss', difficulty:'Boss', xp:20, width:1760, targetTimeMs:130000,
      platforms:[ground(0,1760),plat(520,345,130),plat(1080,345,130),blink(790,300,130)], coins:[...coinLine(110,420,5),...coinLine(1340,420,5)], chips:[chip(560,300),chip(850,255),chip(1120,300)], checkpoints:[checkpoint(300,420)], powerUps:[power('air',430,410)], boss:{type:'glitchbeast',x:1300,y:390,hp:5,arenaStart:720}, exit:{x:1600,y:388}, objective:'Defeat the GLITCH BEAST and restore Glitch Forest.'
    }),

    baseLevel({
      id:'3-1', world:3, order:1, name:'CONVEYOR CORE', difficulty:'Hard', xp:15, width:3300, targetTimeMs:98000,
      platforms:[ground(0,460),conveyor(580,442,360,1,86),ground(1050,360),conveyor(1540,442,350,-1,92),ground(2010,380),conveyor(2500,442,360,1,100),ground(2980,320),plat(350,340,120),moving(1160,325,120,'y',130,65),plat(1410,280,120),moving(2100,320,120,'x',180,76),plat(2880,310,120)],
      coins:[...coinLine(90,420,5),...coinLine(610,400,7),...coinLine(1080,420,5),...coinLine(1570,400,7),...coinLine(2040,420,5),...coinLine(2530,400,7),...coinLine(3020,420,5)], chips:[chip(410,295),chip(1465,235),chip(2935,265)], enemies:[enemy('bugbot',700,410),enemy('spikebyte',1130,430),enemy('firewall',1660,410,{dir:-1}),enemy('bugbot',2200,430),enemy('spikebyte',2600,410)], checkpoints:[checkpoint(1940,420)], powerUps:[power('shield',2260,410)], exit:{x:3180,y:388}
    }),
    baseLevel({
      id:'3-2', world:3, order:2, name:'VOLTAGE GAP', difficulty:'Hard', xp:15, width:3440, targetTimeMs:100000,
      platforms:[ground(0,420),ground(560,320),ground(1030,330),ground(1510,320),ground(1990,350),ground(2480,330),ground(2960,480),moving(630,340,120,'x',150,85),plat(900,285,110),fall(1120,330,110),moving(1600,315,120,'y',145,78),plat(1830,270,120),blink(2110,315,115),moving(2580,305,120,'x',180,90),fall(2860,320,110),plat(3140,285,120)],
      hazards:[hazard('laser',470,250,18,220,{period:1800,activeMs:920}),hazard('laser',1440,230,18,240,{period:2100,activeMs:1050,phase:600}),hazard('laser',2400,250,18,220,{period:1700,activeMs:780,phase:300})], coins:[...coinLine(80,420,4),...coinLine(600,420,5),...coinLine(1060,420,4),...coinLine(1540,420,5),...coinLine(2020,420,5),...coinLine(2510,420,5),...coinLine(3000,420,7)], chips:[chip(950,240),chip(1885,225),chip(3195,240)], enemies:[enemy('firewall',680,430,{dir:1}),enemy('bugbot',1190,430),enemy('flyer',1700,210,{range:115}),enemy('spikebyte',2070,430),enemy('firewall',3040,430,{dir:-1})], checkpoints:[checkpoint(1770,420)], powerUps:[power('pulse',2660,265)], exit:{x:3320,y:388}
    }),
    baseLevel({
      id:'3-3', world:3, order:3, name:'MACHINE PULSE', type:'vertical', difficulty:'Difficult', xp:20, width:2760, height:980, spawn:{x:90,y:840}, targetTimeMs:120000,
      platforms:[ground(0,520,890,90),ground(610,420,890,90),ground(1150,420,890,90),ground(1700,390,890,90),ground(2210,550,890,90),plat(350,770,125),moving(650,730,120,'y',150,70),plat(900,650,120),blink(1160,590,120),moving(1430,520,120,'y',170,72),plat(1700,450,120),fall(1940,390,110),moving(2200,320,120,'x',170,80),plat(2470,255,125)],
      hazards:[hazard('electric',1040,865,80,25),hazard('electric',1610,865,70,25)], coins:[...coinLine(100,840,4),...coinLine(650,690,5),...coinLine(1180,550,4),...coinLine(1710,410,4),...coinLine(2220,280,6)], chips:[chip(410,725),chip(1485,475),chip(2525,210)], enemies:[enemy('flyer',970,560,{range:120}),enemy('crawler',1740,410),enemy('flyer',2310,230,{range:110})], checkpoints:[checkpoint(1580,520)], powerUps:[power('air',1875,350)], exit:{x:2590,y:205}, objective:'Climb to the upper Restore Terminal.'
    }),
    baseLevel({
      id:'3-4', world:3, order:4, name:'FACTORY ESCAPE', type:'escape', difficulty:'Difficult', xp:20, width:3820, targetTimeMs:95000, escapeSpeed:94,
      platforms:[ground(0,500),conveyor(620,442,350,1,110),ground(1080,340),conveyor(1550,442,360,-1,115),ground(2040,350),conveyor(2520,442,350,1,118),ground(3000,820),fall(740,330,110),moving(1180,330,120,'y',120,85),blink(1660,305,120),moving(2150,315,120,'x',170,95),fall(2650,310,110),blink(3120,300,120),moving(3400,305,120,'x',180,105)], hazards:[hazard('laser',1000,240,18,230,{period:1600,activeMs:700}),hazard('laser',1980,230,18,240,{period:1750,activeMs:800,phase:450}),hazard('laser',2920,230,18,240,{period:1550,activeMs:690,phase:200})], coins:[...coinLine(100,420,5),...coinLine(650,400,7),...coinLine(1110,420,4),...coinLine(1580,400,7),...coinLine(2070,420,4),...coinLine(2550,400,7),...coinLine(3030,420,9)], chips:[chip(800,285),chip(2210,270),chip(3460,260)], enemies:[enemy('bugbot',700,410),enemy('firewall',1640,410,{dir:-1}),enemy('spikebyte',2110,430),enemy('firewall',3220,430,{dir:-1})], checkpoints:[checkpoint(2000,420)], powerUps:[power('speed',2360,410)], exit:{x:3680,y:388}, objective:'Outrun the shutdown wave and escape the factory.'
    }),
    baseLevel({
      id:'3-B', world:3, order:5, name:'VOLT TITAN', type:'boss', difficulty:'Boss', xp:20, width:1820, targetTimeMs:140000,
      platforms:[ground(0,1820),conveyor(700,442,420,1,75),plat(500,345,130),plat(1180,345,130)], hazards:[hazard('laser',900,225,18,245,{period:1900,activeMs:760})], coins:[...coinLine(100,420,5),...coinLine(1430,420,5)], chips:[chip(540,300),chip(910,410),chip(1220,300)], checkpoints:[checkpoint(300,420)], powerUps:[power('shield',430,410)], boss:{type:'volttitan',x:1370,y:380,hp:5,arenaStart:710}, exit:{x:1660,y:388}, objective:'Defeat VOLT TITAN and restore Volt Factory.'
    }),

    baseLevel({
      id:'4-1', world:4, order:1, name:'SKY LINKS', difficulty:'Hard', xp:15, width:3300, targetTimeMs:100000,
      platforms:[ground(0,380),ground(520,300),ground(960,300),ground(1410,300),ground(1870,300),ground(2340,300),ground(2810,490),moving(580,350,120,'x',160,78),moving(1050,330,120,'y',120,70),plat(1280,285,110),moving(1510,340,120,'x',170,82),fall(1970,325,110),moving(2440,320,120,'y',130,75),plat(2710,280,110),moving(2980,330,120,'x',150,86)],
      winds:[{x:820,y:180,w:300,h:290,forceX:35},{x:2140,y:150,w:340,h:320,forceX:-45}], coins:[...coinLine(70,420,4),...coinLine(550,420,5),...coinLine(990,420,4),...coinLine(1440,420,4),...coinLine(1900,420,4),...coinLine(2370,420,4),...coinLine(2840,420,7)], chips:[chip(640,305),chip(1335,240),chip(2765,235)], enemies:[enemy('flyer',780,230,{range:120}),enemy('bugbot',1020,430),enemy('flyer',1740,220,{range:150}),enemy('spikebyte',2440,430)], checkpoints:[checkpoint(1800,420)], powerUps:[power('air',2545,275)], exit:{x:3170,y:388}
    }),
    baseLevel({
      id:'4-2', world:4, order:2, name:'WIND TUNNEL', difficulty:'Difficult', xp:20, width:3500, targetTimeMs:110000,
      platforms:[ground(0,360),ground(500,260),ground(900,260),ground(1300,260),ground(1700,260),ground(2100,260),ground(2500,260),ground(2900,600),moving(560,345,110,'y',130,75),fall(990,320,110),moving(1390,300,110,'x',150,90),blink(1810,315,110),moving(2200,295,110,'y',150,85),fall(2620,310,110),moving(3040,300,120,'x',170,95)], winds:[{x:360,y:120,w:520,h:350,forceX:70},{x:1120,y:120,w:520,h:350,forceX:-85},{x:1880,y:120,w:520,h:350,forceX:90},{x:2640,y:120,w:520,h:350,forceX:-80}], coins:[...coinLine(70,420,4),...coinLine(520,420,4),...coinLine(920,420,4),...coinLine(1320,420,4),...coinLine(1720,420,4),...coinLine(2120,420,4),...coinLine(2520,420,4),...coinLine(2940,420,7)], chips:[chip(615,300),chip(1865,270),chip(3095,255)], enemies:[enemy('flyer',740,210,{range:130}),enemy('flyer',1470,220,{range:120}),enemy('spikebyte',2140,430),enemy('flyer',2750,220,{range:150})], checkpoints:[checkpoint(1710,420)], powerUps:[power('shield',2340,410)], exit:{x:3370,y:388}
    }),
    baseLevel({
      id:'4-3', world:4, order:3, name:'CLOUD STEPS', type:'vertical', difficulty:'Difficult', xp:20, width:2860, height:1050, spawn:{x:80,y:910}, targetTimeMs:125000,
      platforms:[ground(0,460,960,90),ground(600,350,960,90),ground(1080,350,960,90),ground(1560,350,960,90),ground(2040,350,960,90),ground(2520,340,960,90),plat(340,820,120),moving(640,770,120,'y',160,80),plat(900,700,120),fall(1160,630,110),moving(1420,560,120,'x',170,90),blink(1680,500,110),moving(1940,420,120,'y',180,88),plat(2220,340,120),moving(2460,280,120,'x',160,92),plat(2690,225,110)], winds:[{x:1260,y:360,w:500,h:520,forceX:45},{x:2070,y:180,w:430,h:480,forceX:-55}], coins:[...coinLine(100,910,4),...coinLine(650,730,5),...coinLine(1120,590,4),...coinLine(1600,455,4),...coinLine(2080,375,5),...coinLine(2520,235,5)], chips:[chip(400,775),chip(1735,455),chip(2740,180)], enemies:[enemy('flyer',980,620,{range:100}),enemy('flyer',1530,470,{range:130}),enemy('crawler',2240,300)], checkpoints:[checkpoint(1510,560)], powerUps:[power('air',2340,300)], exit:{x:2760,y:175}, objective:'Climb through the cloud relay and reach the upper terminal.'
    }),
    baseLevel({
      id:'4-4', world:4, order:4, name:'HIGH NETWORK', type:'auto', difficulty:'Difficult', xp:20, width:3900, targetTimeMs:110000, autoScroll:44,
      platforms:[ground(0,500),ground(620,300),ground(1050,300),ground(1490,300),ground(1930,300),ground(2370,300),ground(2810,300),ground(3250,650),moving(700,340,120,'x',140,95),fall(1130,320,110),moving(1570,305,120,'y',130,90),blink(2010,310,120),moving(2450,300,120,'x',180,100),fall(2890,310,110),blink(3340,300,120),moving(3600,300,120,'x',140,105)], winds:[{x:880,y:130,w:420,h:340,forceX:55},{x:2200,y:130,w:420,h:340,forceX:-60},{x:3040,y:130,w:420,h:340,forceX:65}], coins:[...coinLine(100,420,5),...coinLine(650,420,5),...coinLine(1080,420,4),...coinLine(1520,420,4),...coinLine(1960,420,4),...coinLine(2400,420,4),...coinLine(2840,420,4),...coinLine(3290,420,8)], chips:[chip(760,295),chip(2065,265),chip(3655,255)], enemies:[enemy('flyer',850,220,{range:120}),enemy('spikebyte',1100,430),enemy('flyer',1750,220,{range:130}),enemy('firewall',2480,430,{dir:-1}),enemy('flyer',3150,210,{range:150})], checkpoints:[checkpoint(2120,420)], powerUps:[power('pulse',2660,410)], exit:{x:3760,y:388}, objective:'Stay with the advancing relay camera and reach the terminal.'
    }),
    baseLevel({
      id:'4-B', world:4, order:5, name:'CLOUD WARDEN', type:'boss', difficulty:'Boss', xp:20, width:1880, targetTimeMs:150000,
      platforms:[ground(0,1880),moving(690,350,120,'y',100,60),moving(1040,350,120,'y',100,60,{phase:900}),plat(520,335,120),plat(1260,335,120)], winds:[{x:760,y:130,w:420,h:330,forceX:38}], coins:[...coinLine(100,420,5),...coinLine(1490,420,5)], chips:[chip(560,290),chip(920,410),chip(1300,290)], checkpoints:[checkpoint(300,420)], powerUps:[power('air',430,410)], boss:{type:'cloudwarden',x:1450,y:310,hp:5,arenaStart:720}, exit:{x:1720,y:388}, objective:'Defeat CLOUD WARDEN and restore the Cloud Network.'
    })
  ];

  function groundSurfaceNear(level, targetX, minWidth = 170) {
    const grounds = level.platforms.filter(p => Number(p.h || 0) >= 55 && Number(p.w || 0) >= minWidth);
    if (!grounds.length) return null;
    const containing = grounds.find(p => targetX >= p.x + 26 && targetX <= p.x + p.w - 26);
    if (containing) return containing;
    return grounds.slice().sort((a,b) => Math.abs((a.x + a.w/2) - targetX) - Math.abs((b.x + b.w/2) - targetX))[0] || null;
  }

  function safeSpotOnGround(g, bias = .5, margin = 80) {
    if (!g) return null;
    const usable = Math.max(0, g.w - margin * 2);
    return { x: Math.round(g.x + margin + usable * bias), y: g.y };
  }

  function addQuestionRow(level, x, groundY, contents = ['coin','coin','coin']) {
    const start = Math.round(x - (contents.length * 38) / 2);
    level.platforms.push(brick(start - 38, groundY - 126, { setPiece:true }));
    contents.forEach((content, i) => level.platforms.push(qblock(start + i * 38, groundY - 126, content, { setPiece:true })));
    level.platforms.push(brick(start + contents.length * 38, groundY - 126, { setPiece:true }));
  }

  function addBrickStairs(level, x, groundY, steps = 4) {
    for (let s = 0; s < steps; s += 1) {
      for (let h = 0; h <= s; h += 1) level.platforms.push(brick(x + s * 36, groundY - 34 * (h + 1), { setPiece:true }));
    }
  }

  function addCrouchTunnel(level, x, groundY, length = 5) {
    for (let i = 0; i < length; i += 1) level.platforms.push(brick(x + i * 35, groundY - 74, { reinforced: true, setPiece:true }));
    level.coins.push(...coinLine(x + 16, groundY - 18, Math.max(3, length - 1), 35));
  }

  function addClassicAdventureSetPieces(level) {
    if (level.type === 'boss') return level;

    if (level.type === 'vertical') {
      const lower = groundSurfaceNear(level, level.width * .18, 220);
      const lowerSpot = safeSpotOnGround(lower, .62, 70);
      if (lowerSpot) {
        addQuestionRow(level, lowerSpot.x, lowerSpot.y, ['coin', level.world >= 3 ? 'pulse' : 'shield', 'coin']);
        level.platforms.push(spring(lowerSpot.x + 118, lowerSpot.y - 18));
      }
      const upper = groundSurfaceNear(level, level.width * .76, 220);
      const upperSpot = safeSpotOnGround(upper, .45, 70);
      if (upperSpot) addBrickStairs(level, upperSpot.x - 80, upperSpot.y, 3);
      return level;
    }

    const introGround = groundSurfaceNear(level, level.width * .17, 250);
    const midGround = groundSurfaceNear(level, level.width * .39, 260);
    const lateGround = groundSurfaceNear(level, level.width * .64, 260);
    const gateGround = groundSurfaceNear(level, level.width * .82, 280);
    const intro = safeSpotOnGround(introGround, .52, 85);
    const mid = safeSpotOnGround(midGround, .42, 95);
    const late = safeSpotOnGround(lateGround, .52, 95);
    const gateSpot = safeSpotOnGround(gateGround, .64, 105);

    if (intro) {
      const powerContent = level.world === 1 ? 'shield' : level.world === 2 ? 'air' : level.world === 3 ? 'pulse' : 'air';
      addQuestionRow(level, intro.x, intro.y, ['coin', powerContent, 'coin']);
    }

    if (mid && midGround.w >= 280) {
      addCrouchTunnel(level, Math.round(mid.x - 85), mid.y, level.world === 2 ? 6 : 5);
      level.platforms.push(spring(Math.round(mid.x + 120), mid.y - 18));
    }

    if (late && lateGround.w >= 250) addBrickStairs(level, Math.round(late.x - 80), late.y, level.world >= 3 ? 4 : 3);

    // Standard/collect stages get a Link Token + gate loop. Time/escape/auto
    // stages stay one-way friendly and use the set pieces without a hard gate.
    if (!['time','escape','auto'].includes(level.type) && gateSpot && late && gateSpot.x > late.x + 180) {
      const keyX = Math.round(Math.min(gateSpot.x - 260, late.x + 80));
      addQuestionRow(level, Math.max(late.x - 30, keyX - 120), late.y, ['coin','coin','coin']);
      const gateId = `${level.id}-A`;
      level.linkTokens.push(linkToken(keyX, late.y - 34, gateId, { required:true, label:'LINK TOKEN A' }));
      level.gates.push(linkGate(gateSpot.x, gateSpot.y, 1, 'LINK GATE A', gateId));
      if (level.id === '1-1') {
        level.tutorial.push({ x: Math.max(120, mid ? mid.x - 70 : keyX - 500), text: 'CROUCH  S / ↓  •  DUCK UNDER LOW DATA BLOCKS' });
        const chipTip = level.tutorial.find(t => String(t.text || '').includes('COLLECT 3 DATA CHIPS'));
        if (chipTip) { chipTip.x = keyX - 120; chipTip.text = 'GLOWING LINK TOKENS OPEN MATCHING GATES'; }
        level.tutorial.push({ x: gateSpot.x - 120, text: 'LINK GATE A · TOKEN MUST BE COLLECTED FIRST' });
      }
    }

    return level;
  }


  function permanentGrounds(level) {
    return level.platforms.filter(p => !p.kind && Number(p.h || 0) >= 60 && Number(p.w || 0) >= 220);
  }

  function pointClear(level, x, y, radius = 110) {
    const badHazard = level.hazards.some(h => x + radius > h.x && x - radius < h.x + h.w && y > h.y - 80 && y - 120 < h.y + h.h);
    const badEnemy = level.enemies.some(e => Math.abs(Number(e.x || 0) - x) < radius && Math.abs(Number(e.y || y) - y) < 120);
    const badGate = (level.gates || []).some(g => Math.abs((g.x + g.w/2) - x) < radius);
    return !badHazard && !badEnemy && !badGate;
  }

  function safestGroundSpot(level, targetX, bias = .5) {
    const grounds = permanentGrounds(level).sort((a,b) => Math.abs((a.x+a.w/2)-targetX)-Math.abs((b.x+b.w/2)-targetX));
    for (const g of grounds) {
      const samples = [bias,.35,.65,.22,.78];
      for (const s of samples) {
        const spot = safeSpotOnGround(g,s,95);
        if (spot && pointClear(level,spot.x,spot.y,115)) return spot;
      }
    }
    const fallback = grounds[0];
    return fallback ? safeSpotOnGround(fallback,.5,95) : null;
  }

  function addProgressionPickups(level) {
    // Persistent gear is deliberately repeated by world so a full death never
    // forces the student to replay an old world just to recover a core mechanic.
    const blasterStages = new Set(['1-1','2-1','3-1','4-1']);
    const bootsStages = new Set(['1-2','2-2','3-2','4-2']);
    if (level.type === 'boss') {
      const spot = safestGroundSpot(level, Math.min(level.width*.28, Number(level.boss?.arenaStart || 700)-170), .45);
      if (spot) level.gearPickups.push(gear('blaster', spot.x, spot.y - 34, { label:'BLASTER ARM', guaranteed:true }));
      return level;
    }
    if (blasterStages.has(level.id)) {
      const spot=safestGroundSpot(level,level.width*.22,.46);
      if(spot) level.gearPickups.push(gear('blaster',spot.x,spot.y-34,{label:'BLASTER ARM'}));
    }
    if (bootsStages.has(level.id)) {
      const spot=safestGroundSpot(level,level.width*.31,.54);
      if(spot) level.gearPickups.push(gear('jumpBoots',spot.x,spot.y-30,{label:'JUMP BOOTS'}));
    }
    // Temporary mobility and invincibility boosts are never required for the
    // main route; they support secrets/shortcuts and difficult encounters.
    if (['1-3','2-1','2-3','3-3','4-1','4-3'].includes(level.id)) {
      const spot=safestGroundSpot(level,level.width*.56,.42);
      if(spot) level.powerUps.push(power('flight',spot.x,spot.y-36,{duration:8,label:'JET CORE'}));
    }
    if (['1-4','2-4','3-4','4-4'].includes(level.id)) {
      const spot=safestGroundSpot(level,level.width*.68,.58);
      if(spot) level.powerUps.push(power('overclock',spot.x,spot.y-36,{duration:6,label:'OVERCLOCK CORE'}));
    }
    return level;
  }

  function relocateCheckpoints(level) {
    level.checkpoints.forEach((cp,i) => {
      const spot=safestGroundSpot(level,Number(cp.x || level.width*.5),.5);
      if(!spot) return;
      cp.x=spot.x; cp.y=spot.y; cp.safe=true;
      const zone={x:cp.x-105,y:cp.y-150,w:210,h:165};
      level.platforms=level.platforms.filter(p => {
        if(!p.setPiece) return true;
        return !(p.x < zone.x+zone.w && p.x+p.w > zone.x && p.y < zone.y+zone.h && p.y+p.h > zone.y);
      });
      level.enemies=level.enemies.filter(e => Math.abs(Number(e.x||0)-cp.x)>140 || Math.abs(Number(e.y||cp.y)-cp.y)>120);
      level.hazards=level.hazards.filter(h => !(h.x < zone.x+zone.w && h.x+h.w > zone.x && h.y < zone.y+zone.h && h.y+h.h > zone.y));
    });
    return level;
  }

  function normalizeRequiredTokens(level) {
    (level.gates || []).forEach((g,i) => {
      const id=g.gateId || `${level.id}-${String.fromCharCode(65+i)}`;
      g.gateId=id; g.requiredKeys=1; g.label=g.label || `LINK GATE ${String.fromCharCode(65+i)}`;
      let token=(level.linkTokens || []).find(t => t.gateId===id);
      if(!token || token.x >= g.x-70) {
        const spot=safestGroundSpot(level,Math.max(160,g.x-430),.5);
        if(spot) {
          if(token){token.x=spot.x;token.y=spot.y-34;token.required=true;token.label=`LINK TOKEN ${String.fromCharCode(65+i)}`;}
          else level.linkTokens.push(linkToken(spot.x,spot.y-34,id,{required:true,label:`LINK TOKEN ${String.fromCharCode(65+i)}`}));
        }
      }
    });
    return level;
  }

  function removeSetPieceOverlaps(level) {
    const result=[];
    for(const p of level.platforms){
      if(!p.setPiece){result.push(p);continue;}
      const overlaps=result.some(q => {
        if(q===p) return false;
        const ix=Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x);
        const iy=Math.min(p.y+p.h,q.y+q.h)-Math.max(p.y,q.y);
        return ix>5 && iy>5;
      });
      const nearToken=(level.linkTokens||[]).some(t => Math.abs(t.x-(p.x+p.w/2))<28 && Math.abs(t.y-(p.y+p.h/2))<45);
      const nearGear=(level.gearPickups||[]).some(t => Math.abs(t.x-(p.x+p.w/2))<32 && Math.abs(t.y-(p.y+p.h/2))<48);
      if(!overlaps && !nearToken && !nearGear) result.push(p);
    }
    level.platforms=result;
    return level;
  }

  function auditAdventureLevel(level) {
    relocateCheckpoints(level);
    normalizeRequiredTokens(level);
    removeSetPieceOverlaps(level);
    return level;
  }


  function extendAdventureLevel(level) {
    if (level.type === 'boss') return level;
    if (level.type === 'vertical') {
      const tail = level.exit.x + 40;
      level.platforms.push(plat(tail + 70, Math.max(140, level.exit.y + 26), 110));
      level.platforms.push(moving(tail + 220, Math.max(120, level.exit.y - 18), 120, 'y', 70, 62));
      level.coins.push(...coinLine(tail + 60, Math.max(100, level.exit.y - 26), 4, 34));
      level.enemies.push(enemy(level.world === 4 ? 'flyer' : 'crawler', tail + 150, Math.max(120, level.exit.y - 36), { range: 80 }));
      level.width += 320;
      level.exit = { x: level.width - 110, y: Math.max(140, level.exit.y - 10) };
      return level;
    }

    const oldExitX = level.exit.x;
    const y = (level.platforms[0] && level.platforms[0].y) || 470;
    const extra = level.type === 'escape' || level.type === 'auto' ? 760 : 620;
    const tailStart = oldExitX + 70;
    level.platforms.push(ground(tailStart - 40, extra + 170, y, Math.max(70, level.height - y)));
    const ledgeY = Math.max(250, y - 140);
    level.platforms.push(plat(tailStart + 120, ledgeY, 130));
    level.platforms.push(moving(tailStart + 320, Math.max(210, ledgeY - 40), 120, level.world % 2 ? 'x' : 'y', 120, 76));
    level.coins.push(...coinLine(tailStart + 30, Math.min(y - 42, level.height - 110), Math.max(5, Math.round(extra / 140)), 36));
    level.coins.push(...coinLine(tailStart + 130, Math.max(210, ledgeY - 28), 4, 34));
    if (level.world === 3) {
      level.hazards.push(hazard('laser', tailStart + 480, Math.max(220, y - 220), 18, 220, { period: 1850, activeMs: 820, phase: level.order * 240 }));
    }
    if (level.world === 4) {
      level.winds.push({ x: tailStart + 60, y: 120, w: Math.max(280, extra - 40), h: Math.max(260, level.height - 170), forceX: level.order % 2 ? 42 : -46 });
    }
    const enemyType = level.world === 4 ? 'flyer' : level.world === 3 ? 'firewall' : 'bugbot';
    const enemyY = enemyType === 'flyer' ? Math.max(220, y - 180) : y - 40;
    level.enemies.push(enemy(enemyType, tailStart + Math.round(extra * 0.52), enemyY, enemyType === 'flyer' ? { range: 110 } : { dir: level.order % 2 ? 1 : -1 }));
    level.width += extra;
    level.exit = { x: level.width - 120, y: level.exit.y };
    return level;
  }

  LEVELS.forEach(extendAdventureLevel);
  LEVELS.forEach(addClassicAdventureSetPieces);
  LEVELS.forEach(addProgressionPickups);
  LEVELS.forEach(auditAdventureLevel);


  const byId = Object.freeze(Object.fromEntries(LEVELS.map(level => [level.id, level])));
  const byWorld = Object.freeze(WORLDS.reduce((out, world) => {
    out[world.id] = LEVELS.filter(level => level.world === world.id).sort((a,b) => a.order - b.order);
    return out;
  }, {}));

  window.ICT8_BYTE_QUEST_LEVELS = Object.freeze({ worlds: WORLDS, levels: LEVELS, byId, byWorld });
})();
