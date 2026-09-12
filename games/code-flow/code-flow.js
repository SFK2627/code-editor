(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  const GAME_ID = 'code-flow';
  const STORAGE_TUTORIAL = 'ict8.codeFlowTutorialSeen.v1';
  const MAX_DPR = 2;
  const MAX_LEVEL = 50;
  const PALETTE = [
    '#22d3ee', '#f472b6', '#fbbf24', '#a3e635', '#a78bfa', '#fb7185', '#60a5fa', '#fb923c'
  ];
  const NODE_PAIRS = [
    ['H', '</>'], ['CSS', '{}'], ['JS', '()'], ['BUG', '✓'], ['IN', 'OUT'], ['fn', '↵'], ['<>', '▶'], ['CLI', 'SRV']
  ];
  const PUZZLES = [{"id":"cf-001","level":1,"size":5,"difficulty":"easy","targetMs":53500,"paths":[[22,17,12,13,8,7,6],[11,16,21,20,15,10,5,0,1],[2,3,4,9,14,19,24,23,18]]},{"id":"cf-002","level":2,"size":5,"difficulty":"easy","targetMs":57000,"paths":[[24,23,18,19,14,9,4,3],[2,7,6,1,0,5,10,15],[20,21,22,17,16,11,12,13,8]]},{"id":"cf-003","level":3,"size":5,"difficulty":"easy","targetMs":60500,"paths":[[4,3,8,9,14,19,24,23,22],[21,16,17,18,13,12,7,2],[1,0,5,6,11,10,15,20]]},{"id":"cf-004","level":4,"size":5,"difficulty":"easy","targetMs":64000,"paths":[[10,5,0,1,2,3,4],[9,14,19,24,23,22,21],[20,15,16,17,12],[11,6,7,8,13,18]]},{"id":"cf-005","level":5,"size":5,"difficulty":"easy","targetMs":67500,"paths":[[14,19,24,23,22,17],[18,13,8,9,4,3],[2,7,12,11,6,1,0],[5,10,15,16,21,20]]},{"id":"cf-006","level":6,"size":6,"difficulty":"medium","targetMs":78000,"paths":[[13,14,8,7,6,0,1,2,3,9],[15,16,10,4,5,11,17,23],[29,35,34,28,22,21,20,26,27,33],[32,31,30,24,25,19,18,12]]},{"id":"cf-007","level":7,"size":6,"difficulty":"medium","targetMs":82500,"paths":[[34,35,29,28,27,33,32,31,30],[24,18,19,25,26,20,14],[15,9,8,7,13,12,6,0,1,2,3],[4,5,11,10,16,17,23,22,21]]},{"id":"cf-008","level":8,"size":6,"difficulty":"medium","targetMs":87000,"paths":[[28,27,33,34,35,29,23,22,21],[20,26,32,31,30,24,18,12,6],[0,1,7,8,2,3,9,10],[4,5,11,17,16,15,14,13,19,25]]},{"id":"cf-009","level":9,"size":6,"difficulty":"medium","targetMs":91500,"paths":[[13,19,20,21,27,28,22,23,29,35],[34,33,32,26,25,31,30,24,18],[12,6,0,1,7,8,2,3],[4,5,11,17,16,10,9,15,14]]},{"id":"cf-010","level":10,"size":6,"difficulty":"medium","targetMs":96000,"paths":[[15,21,27,28,22,16,17,23,29,35],[34,33,32,31,30,24,25,26],[20,14,13,19,18,12,6,0],[1,7,8,9,10,11,5,4,3,2]]},{"id":"cf-011","level":11,"size":7,"difficulty":"medium","targetMs":104000,"paths":[[26,33,40,39,38,37,36,29,30,31],[32,25,24,17,16,23,22,15,8],[9,10,3,2,1,0,7,14,21],[28,35,42,43,44,45,46,47,48,41,34],[27,20,19,12,13,6,5,4,11,18]]},{"id":"cf-012","level":12,"size":7,"difficulty":"medium","targetMs":109000,"paths":[[20,13,6,5,4,11,12,19,26,27],[34,33,32,39,40,41,48,47,46,45],[44,43,42,35,28,29,36,37,38],[31,30,23,24,25,18,17,10,3,2,9],[8,1,0,7,14,21,22,15,16]]},{"id":"cf-013","level":13,"size":7,"difficulty":"medium","targetMs":114000,"paths":[[12,19,26,33,32,25,18,11,4],[5,6,13,20,27,34,41,48,47,40,39],[46,45,44,37,38,31,30,29,22],[23,24,17,10,3,2,9,16,15,8],[1,0,7,14,21,28,35,42,43,36]]},{"id":"cf-014","level":14,"size":7,"difficulty":"medium","targetMs":119000,"paths":[[48,47,46,45,44,37,36,43,42,35,28],[21,14,7,0,1,2,3,4,5,6],[13,12,11,10,9,8,15,16,17,18,19],[20,27,34,41,40,33,26,25],[32,39,38,31,30,29,22,23,24]]},{"id":"cf-015","level":15,"size":7,"difficulty":"medium","targetMs":124000,"paths":[[36,43,42,35,28,21,22,29,30,23],[24,31,32,33,40,39,38,37,44],[45,46,47,48,41,34,27,20,19,12],[13,6,5,4,3,2,1,0,7,14,15],[8,9,16,17,10,11,18,25,26]]},{"id":"cf-016","level":16,"size":7,"difficulty":"hard","targetMs":126000,"paths":[[12,13,6,5,4,11,18,19,20,27],[34,41,48,47,40,33,26,25,24,17],[10,3,2,9,8,1,0,7,14,21],[22,15,16,23,30,37,38,31,32],[39,46,45,44,43,42,35,28,29,36]]},{"id":"cf-017","level":17,"size":7,"difficulty":"hard","targetMs":131500,"paths":[[30,31,32,33,34,41,48,47,40,39],[46,45,38,37,44,43,42,35,36,29],[28,21,22,23,24,25,18,11,10],[17,16,15,14,7,0,1,8,9],[2,3,4,5,6,13,12,19,20,27,26]]},{"id":"cf-018","level":18,"size":7,"difficulty":"hard","targetMs":137000,"paths":[[2,3,10,11,4,5,6,13,20,27],[34,41,48,47,40,39,46,45,38,37],[44,43,42,35,36,29,28,21,22],[15,14,7,0,1,8,9,16,17,24],[23,30,31,32,33,26,25,18,19,12]]},{"id":"cf-019","level":19,"size":7,"difficulty":"hard","targetMs":142500,"paths":[[2,1,0,7,8,9,16,23,30],[29,22,15,14,21,28,35,42,43],[36,37,44,45,46,47,48,41,40],[39,38,31,32,25,24,17,18],[11,10,3,4,5,6,13],[12,19,20,27,34,33,26]]},{"id":"cf-020","level":20,"size":7,"difficulty":"hard","targetMs":148000,"paths":[[40,33,26,27,34,41,48],[47,46,45,44,37,30,29,22,23],[24,31,38,39,32,25,18,11,12,19],[20,13,6,5,4,3,2,9],[10,17,16,15,8,1,0],[7,14,21,28,35,42,43,36]]},{"id":"cf-021","level":21,"size":7,"difficulty":"hard","targetMs":153500,"paths":[[6,13,20,27,26,19,12,5],[4,3,2,1,0,7,8,9],[10,11,18,25,32,33,34,41],[48,47,40,39,46,45,44,43],[42,35,36,37,30,29,28,21,14],[15,22,23,16,17,24,31,38]]},{"id":"cf-022","level":22,"size":7,"difficulty":"hard","targetMs":159000,"paths":[[48,47,40,41,34,33,32,39],[46,45,44,43,42,35,28,29],[36,37,38,31,30,23,16],[15,22,21,14,7,0,1,8,9,2],[3,10,17,18,11,4,5,6,13],[12,19,20,27,26,25,24]]},{"id":"cf-023","level":23,"size":8,"difficulty":"hard","targetMs":158000,"paths":[[25,24,16,17,18,26,27,19,20,12,11],[10,9,8,0,1,2,3,4,5,6],[7,15,14,13,21,29,28,36,35,34,33],[32,40,48,56,57,49,41,42,43,44,52,53],[45,37,38,30,22,23,31,39,47],[46,54,55,63,62,61,60,59,51,50,58]]},{"id":"cf-024","level":24,"size":8,"difficulty":"hard","targetMs":164000,"paths":[[12,11,10,2,3,4,5,6,7,15],[23,31,39,47,46,38,37,45,53],[54,55,63,62,61,60,52,44,43,51,59],[58,50,49,57,56,48,40,32,33,41],[42,34,35,36,28,29,30,22,14,13,21],[20,19,27,26,18,17,25,24,16,8,9,1,0]]},{"id":"cf-025","level":25,"size":8,"difficulty":"hard","targetMs":170000,"paths":[[9,1,0,8,16,24,32,40,48,56,57],[58,59,51,43,35,27,26,34,42],[50,49,41,33,25,17,18,19,11,10,2],[3,4,12,13,5,6,14,22,30,29,21,20,28],[36,44,52,60,61,62,63,55,47,46],[54,53,45,37,38,39,31,23,15,7]]},{"id":"cf-026","level":26,"size":8,"difficulty":"hard","targetMs":176000,"paths":[[30,38,37,45,53,61,62,63,55,54,46],[47,39,31,23,15,7,6,14,22,21,29],[28,27,35,36,44,52,60,59,51,43,42],[34,33,41,49,50,58,57,56,48,40],[32,24,25,26,18,19,20,12,13,5],[4,3,2,1,0,8,16,17,9,10,11]]},{"id":"cf-027","level":27,"size":8,"difficulty":"hard","targetMs":182000,"paths":[[57,56,48,40,32,33,25,24],[16,17,18,10,9,8,0,1,2,3],[4,5,6,7,15,14,13,12,11,19],[20,21,22,23,31,30,38,39,47,55],[63,62,61,60,52,53,54],[46,45,44,36,37,29,28,27,35,43],[51,59,58,50,49,41,42,34,26]]},{"id":"cf-028","level":28,"size":8,"difficulty":"hard","targetMs":188000,"paths":[[4,5,13,14,6,7,15,23,31],[39,47,55,63,62,54,46,38,30,22],[21,29,28,20,12,11,3,2],[1,0,8,16,24,32,33,25,17],[9,10,18,19,27,26,34,42,43,44],[52,51,50,49,41,40,48,56,57],[58,59,60,61,53,45,37,36,35]]},{"id":"cf-029","level":29,"size":8,"difficulty":"hard","targetMs":194000,"paths":[[13,14,15,7,6,5,4,12,11],[3,2,1,0,8,16,24,25],[17,9,10,18,26,34,42,41],[33,32,40,48,56,57,49,50,51,52,44],[43,35,27,19,20,21,22,23,31],[30,29,28,36,37,45,46,38,39],[47,55,63,62,54,53,61,60,59,58]]},{"id":"cf-030","level":30,"size":8,"difficulty":"hard","targetMs":200000,"paths":[[59,58,57,56,48,49,41,40,32],[33,34,42,50,51,43,44,45,37],[36,35,27,26,25,24,16],[8,0,1,9,17,18,19,11,10],[2,3,4,5,13,12,20,21,22,14],[6,7,15,23,31,39,47,55,63,62],[61,60,52,53,54,46,38,30,29,28]]},{"id":"cf-031","level":31,"size":9,"difficulty":"expert","targetMs":205000,"paths":[[50,51,52,43,42,41,40,49,48,47,46,45],[36,27,28,37,38,39,30,29,20,11,10],[19,18,9,0,1,2,3,4,5,6,15],[14,13,12,21,22,31,32,23,24,33,34,25,16],[7,8,17,26,35,44,53,62,71],[80,79,78,69,70,61,60,59,58,57,66,67],[68,77,76,75,74,65,56,55,54,63,72,73,64]]},{"id":"cf-032","level":32,"size":9,"difficulty":"expert","targetMs":212000,"paths":[[12,21,30,29,28,27,18,9,0,1,10],[19,20,11,2,3,4,13,22,31,32,23],[14,5,6,15,16,7,8,17,26],[35,44,43,34,25,24,33,42,41,40,39,38,37],[36,45,54,63,72,73,74,75,76,77,78,79,80],[71,70,69,60,61,62,53,52,51,50,59],[68,67,66,65,64,55,46,47,48,49,58,57,56]]},{"id":"cf-033","level":33,"size":9,"difficulty":"expert","targetMs":219000,"paths":[[64,65,66,57,48,49,50,51,42,33,24],[15,16,25,34,43,44,35,26,17,8,7],[6,5,14,13,4,3,2,1,0,9,18,27],[36,37,28,19,10,11,12,21,20,29,30,31],[22,23,32,41,40,39,38,47,56,55,46,45],[54,63,72,73,74,75,76,67,58,59,68,77],[78,69,60,61,52,53,62,71,80,79,70]]},{"id":"cf-034","level":34,"size":9,"difficulty":"expert","targetMs":226000,"paths":[[68,77,78,69,60,61,70,79,80,71,62,53],[44,43,52,51,42,41,32,33,24,23],[22,13,14,15,16,25,34,35,26,17,8,7],[6,5,4,3,2,1,0,9,18,27],[36,37,28,19,10,11,20,29,38,39,48,47,46],[45,54,63,72,73,64,55,56,65,74,75,76],[67,66,57,58,59,50,49,40,31,30,21,12]]},{"id":"cf-035","level":35,"size":9,"difficulty":"expert","targetMs":233000,"paths":[[38,47,46,37,36,45,54,63,72,73,74],[65,64,55,56,57,48,39,30,29,20,21],[12,11,10,19,28,27,18,9,0,1,2],[3,4,5,6,7,8,17,26,25,16,15],[14,13,22,23,24,33,32,31,40,49,58,59],[68,67,66,75,76,77,78,69,70,79,80,71,62],[61,60,51,50,41,42,43,52,53,44,35,34]]},{"id":"cf-036","level":36,"size":9,"difficulty":"expert","targetMs":240000,"paths":[[24,23,14,15,16,25,26,17,8,7,6,5],[4,13,12,3,2,1,0,9,18,19,10,11],[20,21,22,31,32,33,34,35,44,43],[42,51,50,41,40,39,30,29,28,27,36],[37,38,47,46,45,54,63,72,73,74,65],[64,55,56,57,48,49,58,59,68,67,66,75,76],[77,78,69,70,79,80,71,62,53,52,61,60]]},{"id":"cf-037","level":37,"size":10,"difficulty":"expert","targetMs":250000,"paths":[[87,97,96,86,76,66,67,77,78,88,98,99],[89,79,69,68,58,59,49,39,38,48,47,37,36,46],[45,35,25,15,16,26,27,17,18,28,29,19,9],[8,7,6,5,4,14,24,34,44,54],[53,43,42,41,31,32,33,23,22,21,11,12,13],[3,2,1,0,10,20,30,40,50,51,52,62,61],[60,70,71,72,82,81,80,90,91,92,93,83],[84,94,95,85,75,74,73,63,64,65,55,56,57]]},{"id":"cf-038","level":38,"size":10,"difficulty":"expert","targetMs":258500,"paths":[[0,10,20,30,40,50,60,70,80,90,91,81,71],[61,51,41,31,21,11,1,2,12,22,32],[42,43,53,52,62,72,82,92,93,83,84,94,95,96],[97,87,88,98,99,89,79,78,77,76,86,85],[75,74,73,63,64,54,55,65,66,56,57,67,68],[69,59,58,48,49,39,29,28,38,37,27],[17,18,19,9,8,7,6,16,26,25,15,5,4],[3,13,14,24,23,33,34,44,45,35,36,46,47]]},{"id":"cf-039","level":39,"size":10,"difficulty":"expert","targetMs":267000,"paths":[[16,6,7,8,9,19,29,28,18,17,27,26,36],[46,45,44,34,35,25,24,23,13,14,15,5,4],[3,2,1,0,10,11,12,22,21,20,30,31],[41,40,50,51,52,42,32,33,43,53,54],[55,56,66,76,75,65,64,63,62,61,60,70,80],[90,91,81,71,72,82,92,93,83,73,74,84],[94,95,85,86,96,97,98,99,89,88,87,77,78,79],[69,59,49,48,58,68,67,57,47,37,38,39]]},{"id":"cf-040","level":40,"size":10,"difficulty":"expert","targetMs":275500,"paths":[[42,32,22,12,2,3,13,23,24,14,4,5],[15,16,6,7,8,9,19,18,17,27,26,25,35],[34,33,43,44,45,46,36,37,47,57,56,55,65],[64,54,53,63,73,74,75,85,86,87,88,78,77],[76,66,67,68,58,48,38,28,29,39,49,59],[69,79,89,99,98,97,96,95,94,84,83,93,92],[91,90,80,81,82,72,62,61,71,70,60],[50,40,30,20,10,0,1,11,21,31,41,51,52]]},{"id":"cf-041","level":41,"size":10,"difficulty":"expert","targetMs":284000,"paths":[[38,28,18,17,7,8,9,19,29,39,49,59],[58,48,47,37,27,26,16,6,5,4,3,2,1],[0,10,20,30,40,50,60,70,80,90,91,92],[93,94,95,96,97,87,86,76,77,78,88,98,99,89],[79,69,68,67,57,56,66,65,55,45,46,36,35],[25,15,14,13,12,11,21,22,23,24,34],[44,54,64,63,53,52,42,43,33,32,31,41],[51,61,62,72,71,81,82,83,73,74,75,85,84]]},{"id":"cf-042","level":42,"size":10,"difficulty":"expert","targetMs":292500,"paths":[[50,51,61,60,70,80,90,91,92,93,94,95,96],[97,98,99,89,88,87,86,76,75,85],[84,74,64,65,55,54,44,45,46,36,37,38],[48,47,57,56,66,67,77,78,79,69,68,58,59,49],[39,29,28,18,19,9,8,7,17,27,26,25],[15,16,6,5,4,3,2,1,0,10,20,30],[40,41,31,21,11,12,22,32,42,52,62,72,71],[81,82,83,73,63,53,43,33,23,13,14,24,34,35]]},{"id":"cf-043","level":43,"size":10,"difficulty":"expert","targetMs":301000,"paths":[[81,71,72,73,63,62,61,51,41,31,32],[42,52,53,54,64,74,84,85,86,96,95,94],[93,83,82,92,91,90,80,70,60,50,40,30],[20,21,11,10,0,1,2,3,13,12,22,23],[24,34,33,43,44,45,55,56,46,47,48,38,37],[27,17,16,26,36,35,25,15,14,4,5,6,7,8],[9,19,18,28,29,39,49,59,69,79,89,99,98],[97,87,88,78,77,76,75,65,66,67,57,58,68]]},{"id":"cf-044","level":44,"size":10,"difficulty":"expert","targetMs":309500,"paths":[[79,78,88,89,99,98,97,87,77,76,86,96],[95,94,93,92,82,72,71,81,91,90,80,70],[60,61,62,52,51,50,40,41,31,30,20,10,0,1],[2,12,11,21,22,23,13,3,4,14,24],[34,33,32,42,43,53,54,44,45,35,25,15],[5,6,16,26,27,37,36,46,47,57,58,48,38],[28,18,17,7,8,9,19,29,39,49,59,69,68],[67,66,56,55,65,64,63,73,83,84,74,75,85]]},{"id":"cf-045","level":45,"size":10,"difficulty":"expert","targetMs":318000,"paths":[[81,80,90,91,92,93,83,82,72,73,63,53,43],[42,32,31,41,51,52,62,61,71,70,60,50],[40,30,20,10,0,1,11,21,22,23,33,34,24],[14,13,12,2,3,4,5,15,16,26,25,35,36],[37,47,46,45,44,54,64,74,84,94,95],[85,75,65,55,56,57,67,66,76,77,78,88,87,86],[96,97,98,99,89,79,69,68,58,59,49,48],[38,39,29,28,27,17,18,19,9,8,7,6]]},{"id":"cf-046","level":46,"size":10,"difficulty":"expert","targetMs":326500,"paths":[[16,6,5,15,25,24,23,22,12,13,14,4],[3,2,1,0,10,11,21,20,30,31,41,40,50],[51,61,60,70,71,81,80,90,91,92,82,72,62],[63,53,52,42,32,33,43,44,34,35,45,46],[47,37,36,26,27,17,7,8,9,19,18,28,29],[39,38,48,49,59,58,57,56,55,54,64,65,66],[76,75,74,73,83,93,94,84,85,86,87,77],[67,68,69,79,78,88,89,99,98,97,96,95]]},{"id":"cf-047","level":47,"size":10,"difficulty":"expert","targetMs":335000,"paths":[[23,24,25,15,16,26,27,17,7,6,5,4,14],[13,3,2,1,0,10,20,30,40,50,60,70],[71,72,73,74,64,63,62,61,51,41,31],[21,11,12,22,32,42,52,53,54,44,43,33],[34,35,36,37,47,46,45,55,65,75,76,66,56],[57,58,68,67,77,87,86,85,84,83,82,81,80,90],[91,92,93,94,95,96,97,98,99,89,88,78,79,69],[59,49,48,38,39,29,19,9,8,18,28]]},{"id":"cf-048","level":48,"size":10,"difficulty":"expert","targetMs":343500,"paths":[[26,25,15,16,6,5,4,14,24,34],[33,43,44,54,55,45,35,36,37,27,28,18,17],[7,8,9,19,29,39,38,48,49,59,69,79],[89,99,98,88,78,77,67,68,58,57,47,46,56,66],[65,64,74,73,83,84,85,75,76,86,87,97,96,95],[94,93,92,91,90,80,70,71,81,82,72,62,63],[53,52,42,32,22,23,13,3,2,1,0,10],[20,30,40,50,60,61,51,41,31,21,11,12]]},{"id":"cf-049","level":49,"size":10,"difficulty":"expert","targetMs":352000,"paths":[[26,16,15,25,35,34,24,23,33,32,22,21,31],[41,42,52,51,61,62,63,64,74,73,72,71,70],[60,50,40,30,20,10,0,1,11,12,2,3],[13,14,4,5,6,7,17,18,8,9,19,29,28],[27,37,36,46,47,48,38,39,49,59,58],[57,56,66,67,77,76,86,87,88,78,68],[69,79,89,99,98,97,96,95,94,93,92,91,90,80],[81,82,83,84,85,75,65,55,45,44,43,53,54]]},{"id":"cf-050","level":50,"size":10,"difficulty":"expert","targetMs":360500,"paths":[[29,39,38,28,18,19,9,8,7,6,16,17],[27,26,25,15,5,4,14,24,23,22,21,11,12],[13,3,2,1,0,10,20,30,31,32,33,34],[44,54,53,43,42,52,62,61,51,41,40,50],[60,70,71,81,80,90,91,92,93,94,95,85],[86,96,97,87,77,76,75,74,84,83,82,72,73],[63,64,65,66,67,57,58,68,78,88,98,99,89],[79,69,59,49,48,47,37,36,35,45,46,56,55]]}];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const byLevel = level => PUZZLES[Math.max(0, Math.min(PUZZLES.length - 1, Number(level || 1) - 1))];

  const runtime = {
    built: false,
    open: false,
    bridge: null,
    onBack: null,
    onClose: null,
    onReward: null,
    overlay: null,
    shell: null,
    canvas: null,
    ctx: null,
    boardWrap: null,
    readyPanel: null,
    resultPanel: null,
    tutorial: null,
    titleLevel: null,
    titleMeta: null,
    timerEl: null,
    movesEl: null,
    statusEl: null,
    resetBtn: null,
    hintBtn: null,
    soundBtn: null,
    resultTitle: null,
    resultTime: null,
    resultMoves: null,
    resultMistakes: null,
    resultHints: null,
    resultScore: null,
    resultXp: null,
    resultNote: null,
    nextBtn: null,
    resizeObserver: null,
    resizeTimer: 0,
    view: { size: 360, dpr: 1 },
    puzzle: null,
    level: 1,
    paths: [],
    dragging: false,
    pointerId: null,
    activePair: -1,
    lastPointer: null,
    locked: true,
    completed: false,
    moves: 0,
    mistakes: 0,
    hints: 0,
    resets: 0,
    redraws: 0,
    round: null,
    activeAccumMs: 0,
    activeSegmentStartedAt: 0,
    timerInterval: 0,
    interrupted: false,
    soundEnabled: true,
    audioContext: null,
    bestScore: 0,
    highestCompletedLevel: 0,
    blockedCells: new Map(),
    connectionPulses: new Map(),
    sparks: [],
    hintFx: null,
    fxRaf: 0,
    renderQueued: false,
    statusTimer: 0,
    lastBlockedKey: '',
    lastBlockedAt: 0
  };

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'codeFlowOverlay';
    overlay.className = 'xp-games-game-overlay code-flow-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Code Flow mini-game');
    overlay.innerHTML = `
      <section class="code-flow-shell">
        <header class="code-flow-topbar">
          <button type="button" data-code-flow-back aria-label="Back to Mini-Games">←</button>
          <div class="code-flow-brand">
            <strong>🧩 CODE FLOW</strong>
            <small>Connect the Logic</small>
          </div>
          <button type="button" data-code-flow-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-code-flow-close aria-label="Close Code Flow">×</button>
        </header>

        <div class="code-flow-hud">
          <div class="code-flow-level-copy">
            <strong data-code-flow-level>Level 1</strong>
            <small data-code-flow-meta>Easy • 5×5</small>
          </div>
          <div class="code-flow-hud-stat"><small>TIME</small><strong data-code-flow-time>00:00</strong></div>
          <div class="code-flow-hud-stat"><small>MOVES</small><strong data-code-flow-moves>0</strong></div>
        </div>

        <main class="code-flow-play-area">
          <div class="code-flow-board-wrap" data-code-flow-board-wrap>
            <canvas class="code-flow-canvas" data-code-flow-canvas aria-label="Code Flow puzzle board"></canvas>
          </div>
          <div class="code-flow-status" data-code-flow-status aria-live="polite">Connect every pair and fill the grid.</div>
          <div class="code-flow-controls">
            <button type="button" data-code-flow-reset>↺ RESET</button>
            <button type="button" data-code-flow-hint>💡 HINT</button>
          </div>
        </main>

        <div class="code-flow-ready" data-code-flow-ready>
          <div class="code-flow-ready-card">
            <span class="code-flow-ready-icon">🧩</span>
            <h2>CODE FLOW</h2>
            <p>Connect the Logic</p>
            <strong data-code-flow-ready-level>Level 1</strong>
            <small data-code-flow-ready-meta>5 × 5 Grid</small>
            <button class="primary" type="button" data-code-flow-play>PLAY</button>
          </div>
        </div>

        <div class="code-flow-tutorial" data-code-flow-tutorial hidden>
          Connect matching nodes. Fill the grid. Lines cannot cross.
        </div>

        <div class="code-flow-result" data-code-flow-result hidden>
          <div class="code-flow-result-card">
            <div class="code-flow-complete-mark">✓</div>
            <p class="code-flow-complete-label">LOGIC COMPLETE</p>
            <h2 data-code-flow-result-title>Level 1 Complete</h2>
            <div class="code-flow-result-grid">
              <div><small>Time</small><strong data-code-flow-result-time>00:00</strong></div>
              <div><small>Moves</small><strong data-code-flow-result-moves>0</strong></div>
              <div><small>Mistakes</small><strong data-code-flow-result-mistakes>0</strong></div>
              <div><small>Hints</small><strong data-code-flow-result-hints>0</strong></div>
            </div>
            <div class="code-flow-score-line"><span>Score</span><strong data-code-flow-result-score>0</strong></div>
            <div class="code-flow-xp-line"><span>XP Earned</span><strong data-code-flow-result-xp>+0 XP</strong></div>
            <p class="code-flow-result-note" data-code-flow-result-note>Checking reward…</p>
            <div class="code-flow-result-actions">
              <button class="primary" type="button" data-code-flow-next>NEXT PUZZLE</button>
              <button type="button" data-code-flow-retry>RETRY</button>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.code-flow-shell');
    runtime.canvas = overlay.querySelector('[data-code-flow-canvas]');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha: false, desynchronized: true });
    runtime.boardWrap = overlay.querySelector('[data-code-flow-board-wrap]');
    runtime.readyPanel = overlay.querySelector('[data-code-flow-ready]');
    runtime.resultPanel = overlay.querySelector('[data-code-flow-result]');
    runtime.tutorial = overlay.querySelector('[data-code-flow-tutorial]');
    runtime.titleLevel = overlay.querySelector('[data-code-flow-level]');
    runtime.titleMeta = overlay.querySelector('[data-code-flow-meta]');
    runtime.timerEl = overlay.querySelector('[data-code-flow-time]');
    runtime.movesEl = overlay.querySelector('[data-code-flow-moves]');
    runtime.statusEl = overlay.querySelector('[data-code-flow-status]');
    runtime.resetBtn = overlay.querySelector('[data-code-flow-reset]');
    runtime.hintBtn = overlay.querySelector('[data-code-flow-hint]');
    runtime.soundBtn = overlay.querySelector('[data-code-flow-sound]');
    runtime.resultTitle = overlay.querySelector('[data-code-flow-result-title]');
    runtime.resultTime = overlay.querySelector('[data-code-flow-result-time]');
    runtime.resultMoves = overlay.querySelector('[data-code-flow-result-moves]');
    runtime.resultMistakes = overlay.querySelector('[data-code-flow-result-mistakes]');
    runtime.resultHints = overlay.querySelector('[data-code-flow-result-hints]');
    runtime.resultScore = overlay.querySelector('[data-code-flow-result-score]');
    runtime.resultXp = overlay.querySelector('[data-code-flow-result-xp]');
    runtime.resultNote = overlay.querySelector('[data-code-flow-result-note]');
    runtime.nextBtn = overlay.querySelector('[data-code-flow-next]');

    overlay.querySelector('[data-code-flow-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-code-flow-close]').addEventListener('click', closeAll);
    overlay.querySelector('[data-code-flow-play]').addEventListener('click', () => startCurrentPuzzle({ showTutorial: true }));
    overlay.querySelector('[data-code-flow-retry]').addEventListener('click', () => startCurrentPuzzle({ immediate: true }));
    runtime.nextBtn.addEventListener('click', nextPuzzle);
    runtime.resetBtn.addEventListener('click', resetPuzzleState);
    runtime.hintBtn.addEventListener('click', showHint);
    runtime.soundBtn.addEventListener('click', toggleSound);

    runtime.canvas.addEventListener('pointerdown', onPointerDown);
    runtime.canvas.addEventListener('pointermove', onPointerMove);
    runtime.canvas.addEventListener('pointerup', onPointerEnd);
    runtime.canvas.addEventListener('pointercancel', onPointerEnd);
    runtime.canvas.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('visibilitychange', () => {
      if (!runtime.open || runtime.locked || runtime.completed) return;
      if (document.hidden) pauseForInterruption();
      else resumeAfterInterruption();
    });
    window.addEventListener('blur', () => {
      if (runtime.open && !runtime.locked && !runtime.completed) pauseForInterruption();
    });
    window.addEventListener('focus', () => {
      if (runtime.open && !document.hidden && runtime.interrupted) resumeAfterInterruption();
    });

    runtime.resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => queueResize())
      : null;
    runtime.resizeObserver?.observe(runtime.boardWrap);
    window.addEventListener('resize', queueResize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(queueResize, 100), { passive: true });
    runtime.built = true;
  }

  function getAudio() {
    if (!runtime.soundEnabled) return null;
    try {
      if (!runtime.audioContext) runtime.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(() => {});
      return runtime.audioContext;
    } catch (_) { return null; }
  }

  function tone(kind) {
    const ctx = getAudio();
    if (!ctx) return;
    const map = {
      connect: [520, 760, .09, .035, 'sine'],
      blocked: [150, 105, .05, .022, 'square'],
      perfect: [660, 1080, .14, .04, 'sine'],
      complete: [440, 880, .18, .045, 'triangle'],
      hint: [410, 540, .07, .024, 'sine']
    };
    const [from, to, dur, vol, type] = map[kind] || map.connect;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + dur);
    gain.gain.setValueAtTime(__ict8SfxGain(vol), now);
    gain.gain.exponentialRampToValueAtTime(.001, now + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + .02);
  }

  function maybeVibrate(ms = 10) {
    try { navigator.vibrate?.(ms); } catch (_) {}
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled);
  }

  function queueResize() {
    if (!runtime.open) return;
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = setTimeout(resizeCanvas, 45);
  }

  function resizeCanvas() {
    if (!runtime.open || !runtime.canvas || !runtime.ctx) return;
    const rect = runtime.boardWrap.getBoundingClientRect();
    const size = Math.max(220, Math.floor(Math.min(rect.width || 360, rect.height || rect.width || 360)));
    const dpr = clamp(Number(devicePixelRatio || 1), 1, MAX_DPR);
    runtime.canvas.width = Math.max(1, Math.round(size * dpr));
    runtime.canvas.height = Math.max(1, Math.round(size * dpr));
    runtime.canvas.style.width = `${size}px`;
    runtime.canvas.style.height = `${size}px`;
    runtime.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    runtime.view = { size, dpr };
    requestRender();
  }

  function difficultyLabel(value = '') {
    const d = String(value || '').toLowerCase();
    return d ? d.charAt(0).toUpperCase() + d.slice(1) : 'Easy';
  }

  function prepareLevel(level, options = {}) {
    runtime.level = clamp(Math.floor(Number(level || 1)), 1, MAX_LEVEL);
    runtime.puzzle = byLevel(runtime.level);
    runtime.paths = Array.from({ length: runtime.puzzle.paths.length }, () => []);
    runtime.dragging = false;
    runtime.pointerId = null;
    runtime.activePair = -1;
    runtime.lastPointer = null;
    runtime.locked = true;
    runtime.completed = false;
    runtime.moves = 0;
    runtime.mistakes = 0;
    runtime.hints = 0;
    runtime.resets = 0;
    runtime.redraws = 0;
    runtime.round = null;
    runtime.activeAccumMs = 0;
    runtime.activeSegmentStartedAt = 0;
    runtime.interrupted = false;
    runtime.blockedCells.clear();
    runtime.connectionPulses.clear();
    runtime.sparks = [];
    runtime.hintFx = null;
    stopTimerTicker();

    runtime.titleLevel.textContent = `Level ${runtime.level}`;
    runtime.titleMeta.textContent = `${difficultyLabel(runtime.puzzle.difficulty)} • ${runtime.puzzle.size}×${runtime.puzzle.size}`;
    runtime.overlay.querySelector('[data-code-flow-ready-level]').textContent = `Level ${runtime.level}`;
    runtime.overlay.querySelector('[data-code-flow-ready-meta]').textContent = `${runtime.puzzle.size} × ${runtime.puzzle.size} Grid`;
    runtime.timerEl.textContent = '00:00';
    runtime.movesEl.textContent = '0';
    runtime.statusEl.textContent = 'Connect every pair and fill the grid.';
    runtime.resultPanel.hidden = true;
    runtime.readyPanel.hidden = options.ready === false;
    runtime.resetBtn.disabled = options.ready !== false;
    runtime.hintBtn.disabled = options.ready !== false;
    requestRender();
  }

  function startCurrentPuzzle(options = {}) {
    runtime.resultPanel?.classList.remove('show');
    if (!runtime.puzzle) prepareLevel(runtime.level || 1, { ready: true });
    runtime.paths = Array.from({ length: runtime.puzzle.paths.length }, () => []);
    runtime.moves = 0;
    runtime.mistakes = 0;
    runtime.hints = 0;
    runtime.resets = 0;
    runtime.redraws = 0;
    runtime.completed = false;
    runtime.dragging = false;
    runtime.activePair = -1;
    runtime.pointerId = null;
    runtime.lastPointer = null;
    runtime.blockedCells.clear();
    runtime.connectionPulses.clear();
    runtime.sparks = [];
    runtime.hintFx = null;
    runtime.locked = false;
    runtime.readyPanel.hidden = true;
    runtime.resultPanel.hidden = true;
    runtime.resetBtn.disabled = false;
    runtime.hintBtn.disabled = false;
    runtime.timerEl.textContent = '00:00';
    runtime.movesEl.textContent = '0';
    runtime.statusEl.textContent = 'Connect every pair and fill the grid.';
    runtime.activeAccumMs = 0;
    runtime.activeSegmentStartedAt = performance.now();
    runtime.interrupted = false;
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round = null; }
    startTimerTicker();
    requestRender();
    if (options.showTutorial) showFirstTutorial();
  }

  function showFirstTutorial() {
    let seen = false;
    try { seen = localStorage.getItem(STORAGE_TUTORIAL) === '1'; } catch (_) {}
    if (seen) return;
    runtime.tutorial.hidden = false;
    runtime.tutorial.classList.remove('show');
    requestAnimationFrame(() => runtime.tutorial.classList.add('show'));
    window.setTimeout(() => {
      runtime.tutorial.classList.remove('show');
      window.setTimeout(() => { runtime.tutorial.hidden = true; }, 180);
    }, 2600);
    try { localStorage.setItem(STORAGE_TUTORIAL, '1'); } catch (_) {}
  }

  function startTimerTicker() {
    stopTimerTicker();
    runtime.timerInterval = window.setInterval(updateTimerText, 250);
  }

  function stopTimerTicker() {
    if (runtime.timerInterval) clearInterval(runtime.timerInterval);
    runtime.timerInterval = 0;
  }

  function activeTimeMs() {
    return Math.max(0, Math.floor(runtime.activeAccumMs + (runtime.activeSegmentStartedAt ? performance.now() - runtime.activeSegmentStartedAt : 0)));
  }

  function updateTimerText() {
    runtime.timerEl.textContent = formatTime(activeTimeMs());
  }

  function pauseForInterruption() {
    if (runtime.interrupted || runtime.locked || runtime.completed) return;
    if (runtime.activeSegmentStartedAt) {
      runtime.activeAccumMs += performance.now() - runtime.activeSegmentStartedAt;
      runtime.activeSegmentStartedAt = 0;
    }
    runtime.interrupted = true;
    showStatus('PAUSED', 1000);
  }

  function resumeAfterInterruption() {
    if (!runtime.interrupted || runtime.locked || runtime.completed) return;
    runtime.interrupted = false;
    runtime.activeSegmentStartedAt = performance.now();
    showStatus('RESUMED', 650);
  }

  function finishActiveTimer() {
    if (runtime.activeSegmentStartedAt) {
      runtime.activeAccumMs += performance.now() - runtime.activeSegmentStartedAt;
      runtime.activeSegmentStartedAt = 0;
    }
    runtime.interrupted = false;
    stopTimerTicker();
    updateTimerText();
    return Math.max(0, Math.floor(runtime.activeAccumMs));
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(Number(ms || 0) / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function endpointInfo(cell) {
    if (!runtime.puzzle) return null;
    for (let pair = 0; pair < runtime.puzzle.paths.length; pair += 1) {
      const solution = runtime.puzzle.paths[pair];
      if (cell === solution[0]) return { pair, end: 0 };
      if (cell === solution[solution.length - 1]) return { pair, end: 1 };
    }
    return null;
  }

  function buildOccupancy() {
    const occupied = new Int16Array(runtime.puzzle.size * runtime.puzzle.size);
    occupied.fill(-1);
    runtime.puzzle.paths.forEach((solution, pair) => {
      occupied[solution[0]] = pair;
      occupied[solution[solution.length - 1]] = pair;
    });
    runtime.paths.forEach((path, pair) => {
      path.forEach(cell => { occupied[cell] = pair; });
    });
    return occupied;
  }

  function pathConnected(pair) {
    const path = runtime.paths[pair] || [];
    const solution = runtime.puzzle.paths[pair];
    if (path.length < 2 || !solution) return false;
    const a = solution[0];
    const b = solution[solution.length - 1];
    return (path[0] === a && path[path.length - 1] === b) || (path[0] === b && path[path.length - 1] === a);
  }

  function cellFromClient(clientX, clientY, allowNearEdge = true) {
    const rect = runtime.canvas.getBoundingClientRect();
    const n = runtime.puzzle?.size || 1;
    const cellSize = rect.width / n;
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    const tolerance = allowNearEdge ? cellSize * .42 : 0;
    if (x < -tolerance || y < -tolerance || x > rect.width + tolerance || y > rect.height + tolerance) return null;
    x = clamp(x, 0, Math.max(0, rect.width - .001));
    y = clamp(y, 0, Math.max(0, rect.height - .001));
    const col = clamp(Math.floor(x / cellSize), 0, n - 1);
    const row = clamp(Math.floor(y / cellSize), 0, n - 1);
    return { cell: row * n + col, x, y, cellSize };
  }

  function onPointerDown(event) {
    if (!runtime.open || runtime.locked || runtime.completed || runtime.interrupted || !runtime.puzzle) return;
    const hit = cellFromClient(event.clientX, event.clientY, true);
    if (!hit) return;
    const endpoint = endpointInfo(hit.cell);
    if (!endpoint) {
      showStatus('START FROM A NODE', 850);
      return;
    }
    event.preventDefault();
    try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
    runtime.pointerId = event.pointerId;
    runtime.dragging = true;
    runtime.activePair = endpoint.pair;
    runtime.lastPointer = { x: event.clientX, y: event.clientY };

    const oldPath = runtime.paths[endpoint.pair] || [];
    if (oldPath.length > 1) runtime.redraws += 1;
    runtime.paths[endpoint.pair] = [hit.cell];
    showStatus('DRAW THE CONNECTION', 600);
    requestRender();
  }

  function onPointerMove(event) {
    if (!runtime.dragging || event.pointerId !== runtime.pointerId || runtime.locked || runtime.interrupted) return;
    event.preventDefault();
    const samples = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [event];
    for (const sample of samples) processPointerSegment(sample.clientX, sample.clientY);
  }

  function processPointerSegment(clientX, clientY) {
    const previous = runtime.lastPointer || { x: clientX, y: clientY };
    const rect = runtime.canvas.getBoundingClientRect();
    const cellSize = rect.width / runtime.puzzle.size;
    const distance = Math.hypot(clientX - previous.x, clientY - previous.y);
    const steps = Math.max(1, Math.ceil(distance / Math.max(4, cellSize * .28)));
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const x = previous.x + (clientX - previous.x) * t;
      const y = previous.y + (clientY - previous.y) * t;
      const hit = cellFromClient(x, y, true);
      if (hit) extendActivePath(hit.cell);
      if (!runtime.dragging) break;
    }
    runtime.lastPointer = { x: clientX, y: clientY };
  }

  function onPointerEnd(event) {
    if (event.pointerId !== runtime.pointerId) return;
    if (runtime.dragging) event.preventDefault();
    runtime.dragging = false;
    runtime.pointerId = null;
    runtime.activePair = -1;
    runtime.lastPointer = null;
  }

  function areAdjacent(a, b) {
    const n = runtime.puzzle.size;
    const ar = Math.floor(a / n), ac = a % n;
    const br = Math.floor(b / n), bc = b % n;
    return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
  }

  function extendActivePath(cell) {
    const pair = runtime.activePair;
    if (pair < 0) return;
    const path = runtime.paths[pair];
    if (!path?.length) return;
    const last = path[path.length - 1];
    if (cell === last) return;

    const existingIndex = path.indexOf(cell);
    if (existingIndex >= 0) {
      if (existingIndex === path.length - 1) return;
      runtime.paths[pair] = path.slice(0, existingIndex + 1);
      requestRender();
      return;
    }

    if (!areAdjacent(last, cell)) return;
    const endpoint = endpointInfo(cell);
    if (endpoint && endpoint.pair !== pair) {
      blockedMove(cell, 'CONNECTION CONFLICT');
      return;
    }

    const occupancy = buildOccupancy();
    if (occupancy[cell] >= 0 && occupancy[cell] !== pair) {
      blockedMove(cell, 'PATH BLOCKED');
      return;
    }

    path.push(cell);
    runtime.moves += 1;
    runtime.movesEl.textContent = String(runtime.moves);
    requestRender();

    if (endpoint && endpoint.pair === pair) {
      const solution = runtime.puzzle.paths[pair];
      const other = path[0] === solution[0] ? solution[solution.length - 1] : solution[0];
      if (cell === other) {
        runtime.dragging = false;
        runtime.pointerId = null;
        runtime.activePair = -1;
        runtime.lastPointer = null;
        connectionSuccess(pair, cell);
        checkCompletion();
      }
    }
  }

  function blockedMove(cell, message) {
    const now = performance.now();
    const key = `${runtime.activePair}:${cell}`;
    if (runtime.lastBlockedKey !== key || now - runtime.lastBlockedAt > 280) {
      runtime.mistakes += 1;
      runtime.lastBlockedKey = key;
      runtime.lastBlockedAt = now;
      tone('blocked');
      maybeVibrate(8);
    }
    runtime.blockedCells.set(cell, now + 230);
    showStatus(message, 700);
    startFxLoop();
  }

  function connectionSuccess(pair, endpointCell) {
    // V466B: clean snap effect. Avoid flickering/pulsing; use a short stable glow.
    const until = performance.now() + 120;
    runtime.connectionPulses.set(pair, until);
    const center = cellCenter(endpointCell);
    const color = PALETTE[pair % PALETTE.length];
    runtime.sparks.push({ x: center.x, y: center.y, vx: 0, vy: -18, color, born: performance.now(), ttl: 120 });
    tone('connect');
    showStatus('CONNECTED ✓', 450);
    startFxLoop();
  }

  function showStatus(text, duration = 800) {
    if (!runtime.statusEl) return;
    runtime.statusEl.textContent = text;
    runtime.statusEl.classList.add('flash');
    clearTimeout(runtime.statusTimer);
    runtime.statusTimer = window.setTimeout(() => {
      runtime.statusEl.classList.remove('flash');
      if (!runtime.completed && !runtime.locked) runtime.statusEl.textContent = 'Connect every pair and fill the grid.';
    }, duration);
  }

  function resetPuzzleState() {
    if (runtime.locked || runtime.completed || !runtime.puzzle) return;
    runtime.paths = Array.from({ length: runtime.puzzle.paths.length }, () => []);
    runtime.dragging = false;
    runtime.pointerId = null;
    runtime.activePair = -1;
    runtime.lastPointer = null;
    runtime.resets += 1;
    runtime.blockedCells.clear();
    runtime.connectionPulses.clear();
    runtime.sparks = [];
    runtime.hintFx = null;
    showStatus('GRID RESET · −50 SCORE', 900);
    requestRender();
  }

  function showHint() {
    if (runtime.locked || runtime.completed || !runtime.puzzle) return;
    let pair = runtime.paths.findIndex((_, index) => !pathConnected(index));
    if (pair < 0) pair = 0;
    const solution = runtime.puzzle.paths[pair];
    let from = solution[0];
    let to = solution[1];
    const current = runtime.paths[pair] || [];
    if (current.length) {
      const forward = current[0] === solution[0];
      const oriented = forward ? solution : [...solution].reverse();
      const last = current[current.length - 1];
      const solutionIndex = oriented.indexOf(last);
      const pathMatches = current.every((cell, idx) => oriented[idx] === cell);
      if (pathMatches && solutionIndex >= 0 && solutionIndex < oriented.length - 1) {
        from = last;
        to = oriented[solutionIndex + 1];
      } else {
        from = oriented[0];
        to = oriented[1];
      }
    }
    runtime.hints += 1;
    runtime.hintFx = { pair, from, to, until: performance.now() + 1050 };
    tone('hint');
    showStatus('HINT USED · −75 SCORE', 950);
    startFxLoop();
  }

  function checkCompletion() {
    const allConnected = runtime.puzzle.paths.every((_, pair) => pathConnected(pair));
    if (!allConnected) return;
    const occupancy = buildOccupancy();
    const filled = Array.from(occupancy).filter(value => value >= 0).length;
    if (filled < runtime.puzzle.size * runtime.puzzle.size) {
      showStatus(`${runtime.puzzle.size * runtime.puzzle.size - filled} CELL${runtime.puzzle.size * runtime.puzzle.size - filled === 1 ? '' : 'S'} LEFT`, 900);
      return;
    }
    completePuzzle();
  }

  function levelSpec(level = runtime.level) {
    const l = clamp(Math.floor(Number(level || 1)), 1, MAX_LEVEL);
    if (l <= 5) return { difficulty: 'easy', base: 50, complexity: l * 5 };
    if (l <= 15) return { difficulty: 'medium', base: 120, complexity: 80 + (l - 6) * 8 };
    if (l <= 30) return { difficulty: 'hard', base: 220, complexity: 180 + (l - 16) * 8 };
    return { difficulty: 'expert', base: 350, complexity: 320 + Math.min(110, (l - 31) * 10) };
  }

  function calculateScore(metrics) {
    const spec = levelSpec(metrics.level);
    const optimalMoves = Math.max(1, metrics.requiredCells - metrics.pairs);
    const extraMoves = Math.max(0, metrics.moves - optimalMoves);
    const efficiencyBonus = clamp(Math.round(100 - extraMoves * 4 - metrics.mistakes * 3), 0, 100);
    const ratio = metrics.activeTimeMs / Math.max(1, metrics.targetTimeMs);
    let timeBonus = 0;
    if (ratio <= .7) timeBonus = 100;
    else if (ratio <= 1) timeBonus = Math.round(100 - (ratio - .7) / .3 * 30);
    else if (ratio <= 1.5) timeBonus = Math.round(70 - (ratio - 1) / .5 * 50);
    else if (ratio <= 2) timeBonus = Math.round(20 - (ratio - 1.5) / .5 * 20);
    const perfect = metrics.hints === 0 && metrics.resets === 0 && metrics.mistakes === 0 && metrics.redraws <= 1 && extraMoves <= 2 && ratio <= 1.05;
    const hintPenalty = metrics.hints * 75;
    const resetPenalty = metrics.resets * 50;
    const redrawPenalty = Math.min(90, Math.max(0, metrics.redraws - 1) * 8 + Math.max(0, metrics.redraws - 4) * 3);
    const mistakePenalty = Math.min(80, metrics.mistakes * 5);
    const score = Math.max(0, Math.round(spec.base + spec.complexity + efficiencyBonus + timeBonus + (perfect ? 150 : 0) - hintPenalty - resetPenalty - redrawPenalty - mistakePenalty));
    return { score, perfect, efficiencyBonus, timeBonus, optimalMoves, extraMoves };
  }

  async function completePuzzle() {
    if (runtime.completed || runtime.locked) return;
    runtime.completed = true;
    runtime.locked = true;
    runtime.dragging = false;
    runtime.pointerId = null;
    runtime.activePair = -1;
    runtime.resetBtn.disabled = true;
    runtime.hintBtn.disabled = true;
    const activeMs = finishActiveTimer();
    const pairCount = runtime.puzzle.paths.length;
    const requiredCells = runtime.puzzle.size * runtime.puzzle.size;
    const metrics = {
      completed: true,
      puzzleId: runtime.puzzle.id,
      level: runtime.level,
      difficulty: runtime.puzzle.difficulty,
      size: runtime.puzzle.size,
      pairs: pairCount,
      connectedPairs: pairCount,
      filledCells: requiredCells,
      requiredCells,
      moves: runtime.moves,
      mistakes: runtime.mistakes,
      hints: runtime.hints,
      resets: runtime.resets,
      redraws: runtime.redraws,
      activeTimeMs: activeMs,
      targetTimeMs: runtime.puzzle.targetMs
    };
    const scored = calculateScore(metrics);
    metrics.perfectSolve = scored.perfect;
    metrics.efficiencyBonus = scored.efficiencyBonus;
    metrics.timeBonus = scored.timeBonus;

    runtime.resultTitle.textContent = `Level ${runtime.level} Complete`;
    runtime.resultTime.textContent = formatTime(activeMs);
    runtime.resultMoves.textContent = String(runtime.moves);
    runtime.resultMistakes.textContent = String(runtime.mistakes);
    runtime.resultHints.textContent = String(runtime.hints);
    runtime.resultScore.textContent = String(scored.score);
    runtime.resultXp.textContent = '+0 XP';
    runtime.resultNote.className = 'code-flow-result-note';
    runtime.resultNote.textContent = runtime.round ? 'Checking reward…' : 'Practice run — account reward unavailable.';
    runtime.nextBtn.textContent = runtime.level < MAX_LEVEL ? 'NEXT PUZZLE' : 'EXPERT REPLAY';

    tone(scored.perfect ? 'perfect' : 'complete');
    runtime.connectionPulses.set(-1, performance.now() + 360);
    startFxLoop();
    window.setTimeout(() => {
      if (!runtime.open) return;
      runtime.resultPanel.hidden = false;
      requestAnimationFrame(() => runtime.resultPanel.classList.add('show'));
    }, 230);

    if (!runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    try {
      const result = await runtime.bridge.claimRound(runtime.round.sessionId, { score: scored.score, metrics });
      const rec = result?.gameRecord || result?.gameRecords?.codeFlow || {};
      runtime.bestScore = Math.max(runtime.bestScore, Number(rec.bestScore || 0), Number(result?.bestScore || 0));
      runtime.highestCompletedLevel = Math.max(runtime.highestCompletedLevel, Number(rec.highestCompletedLevel || rec.bestLevel || 0));
      if (Number(result?.score || 0) >= 0 && Number(result.score) !== scored.score) runtime.resultScore.textContent = String(Math.max(0, Number(result.score || 0)));
      runtime.resultXp.textContent = `+${Math.max(0, Number(result?.awardedXp || 0))} XP`;

      if (result?.loginRequired) {
        runtime.resultNote.className = 'code-flow-result-note warn';
        runtime.resultNote.textContent = 'Practice mode — log in as a student to earn account XP.';
      } else if (result?.syncFailed) {
        runtime.resultNote.className = 'code-flow-result-note warn';
        runtime.resultNote.textContent = 'Reward sync failed. Your local puzzle result is still safe.';
      } else if (result?.progressionBlocked) {
        runtime.resultNote.className = 'code-flow-result-note warn';
        runtime.resultNote.textContent = 'Complete the previous puzzle first to unlock XP eligibility.';
      } else if (result?.replayNoXp) {
        runtime.resultNote.className = 'code-flow-result-note info';
        runtime.resultNote.textContent = 'Replay score saved · this puzzle already awarded XP before.';
      } else if (result?.replayReduced && Number(result?.awardedXp || 0) > 0) {
        runtime.resultNote.className = 'code-flow-result-note info';
        runtime.resultNote.textContent = 'Replay improvement · XP reduced to protect against farming.';
      } else if (result?.capReached && Number(result.awardedXp || 0) === 0) {
        runtime.resultNote.className = 'code-flow-result-note warn';
        runtime.resultNote.textContent = 'Daily Mini-Game XP limit reached. Keep solving for records!';
      } else if (Number(result?.awardedXp || 0) > 0) {
        runtime.resultNote.className = 'code-flow-result-note success';
        runtime.resultNote.textContent = `Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`;
      } else {
        runtime.resultNote.className = 'code-flow-result-note info';
        runtime.resultNote.textContent = 'Puzzle complete. A stronger score is needed to earn XP.';
      }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.resultNote.className = 'code-flow-result-note warn';
      runtime.resultNote.textContent = 'Reward could not be processed. No XP was added.';
    }
  }

  function nextPuzzle() {
    runtime.resultPanel.classList.remove('show');
    runtime.resultPanel.hidden = true;
    let next = runtime.level + 1;
    if (next > MAX_LEVEL) next = 31 + ((runtime.level + Date.now()) % 20);
    prepareLevel(next, { ready: false });
    startCurrentPuzzle({ immediate: true });
  }

  function requestRender() {
    if (!runtime.open || runtime.renderQueued) return;
    runtime.renderQueued = true;
    requestAnimationFrame(() => {
      runtime.renderQueued = false;
      render();
    });
  }

  function startFxLoop() {
    if (runtime.fxRaf || !runtime.open) return;
    const tick = () => {
      runtime.fxRaf = 0;
      if (!runtime.open) return;
      const now = performance.now();
      runtime.blockedCells.forEach((until, cell) => { if (until <= now) runtime.blockedCells.delete(cell); });
      runtime.connectionPulses.forEach((until, pair) => { if (until <= now) runtime.connectionPulses.delete(pair); });
      runtime.sparks = runtime.sparks.filter(spark => now - spark.born < spark.ttl);
      if (runtime.hintFx && runtime.hintFx.until <= now) runtime.hintFx = null;
      render();
      if (runtime.blockedCells.size || runtime.connectionPulses.size || runtime.sparks.length || runtime.hintFx) runtime.fxRaf = requestAnimationFrame(tick);
    };
    runtime.fxRaf = requestAnimationFrame(tick);
  }

  function cellCenter(cell) {
    const n = runtime.puzzle.size;
    const s = runtime.view.size / n;
    return { x: (cell % n + .5) * s, y: (Math.floor(cell / n) + .5) * s };
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  }

  function render() {
    if (!runtime.ctx || !runtime.puzzle) return;
    const ctx = runtime.ctx;
    const size = runtime.view.size;
    const n = runtime.puzzle.size;
    const cell = size / n;
    const now = performance.now();

    ctx.save();
    ctx.clearRect(0, 0, size, size);
    const bg = ctx.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, '#071426');
    bg.addColorStop(1, '#07101d');
    ctx.fillStyle = bg;
    roundedRect(ctx, 0, 0, size, size, Math.max(14, cell * .22));
    ctx.fill();

    ctx.strokeStyle = 'rgba(125,211,252,.105)';
    ctx.lineWidth = 1;
    for (let i = 1; i < n; i += 1) {
      const p = i * cell;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
    }

    const allCompletePulse = runtime.connectionPulses.has(-1);
    runtime.paths.forEach((path, pair) => {
      if (!path.length) return;
      const color = PALETTE[pair % PALETTE.length];
      const pulse = runtime.connectionPulses.get(pair);
      const connected = pathConnected(pair);
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.globalAlpha = connected ? .94 : .78;
      ctx.lineWidth = Math.max(8, cell * .46);
      if (pulse || allCompletePulse) {
        ctx.shadowColor = color;
        ctx.shadowBlur = Math.max(5, cell * .18);
      }
      ctx.beginPath();
      path.forEach((cellIndex, idx) => {
        const point = cellCenter(cellIndex);
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.restore();
    });

    if (runtime.hintFx) {
      const color = PALETTE[runtime.hintFx.pair % PALETTE.length];
      const a = cellCenter(runtime.hintFx.from);
      const b = cellCenter(runtime.hintFx.to);
      const life = clamp((runtime.hintFx.until - now) / 1050, 0, 1);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.globalAlpha = .45 + Math.sin(now / 70) * .25;
      ctx.lineWidth = Math.max(4, cell * .18);
      ctx.setLineDash([Math.max(4, cell * .16), Math.max(3, cell * .1)]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.globalAlpha = .45 + life * .4;
      ctx.beginPath(); ctx.arc(b.x, b.y, Math.max(5, cell * .14), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    runtime.puzzle.paths.forEach((solution, pair) => {
      const color = PALETTE[pair % PALETTE.length];
      const labels = NODE_PAIRS[pair % NODE_PAIRS.length];
      const cells = [solution[0], solution[solution.length - 1]];
      cells.forEach((cellIndex, endIndex) => {
        const p = cellCenter(cellIndex);
        const connected = pathConnected(pair);
        const pulse = runtime.connectionPulses.get(pair);
        let scale = 1;
        if (pulse) {
          const remaining = clamp((pulse - now) / 120, 0, 1);
          scale = 1 + Math.sin((1 - remaining) * Math.PI) * .06;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(scale, scale);
        ctx.shadowColor = color;
        ctx.shadowBlur = connected ? Math.max(8, cell * .24) : Math.max(4, cell * .11);
        ctx.fillStyle = '#07111f';
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2.5, cell * .075);
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(10, cell * .31), 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = color;
        ctx.font = `900 ${clamp(cell * .23, 8, 16)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[endIndex], 0, 0);
        if (connected) {
          ctx.fillStyle = '#ecfeff';
          ctx.font = `900 ${clamp(cell * .16, 7, 11)}px system-ui, sans-serif`;
          ctx.fillText('✓', Math.max(8, cell * .22), -Math.max(8, cell * .22));
        }
        ctx.restore();
      });
    });

    runtime.blockedCells.forEach((until, cellIndex) => {
      const remaining = clamp((until - now) / 230, 0, 1);
      const row = Math.floor(cellIndex / n), col = cellIndex % n;
      ctx.save();
      ctx.globalAlpha = remaining * .55;
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = Math.max(2, cell * .06);
      roundedRect(ctx, col * cell + cell * .08, row * cell + cell * .08, cell * .84, cell * .84, Math.max(5, cell * .13));
      ctx.stroke();
      ctx.restore();
    });

    runtime.sparks.forEach(spark => {
      const age = now - spark.born;
      const t = clamp(age / spark.ttl, 0, 1);
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = spark.color;
      const x = spark.x + spark.vx * (age / 1000);
      const y = spark.y + spark.vy * (age / 1000);
      ctx.beginPath(); ctx.arc(x, y, Math.max(1.2, cell * .035) * (1 - t * .4), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  function returnToHub() {
    const cb = runtime.onBack;
    closeInternal();
    try { cb?.(); } catch (_) {}
  }

  function closeAll() {
    const cb = runtime.onClose;
    closeInternal();
    try { cb?.(); } catch (_) {}
  }

  function closeInternal() {
    if (!runtime.open) return;
    runtime.open = false;
    runtime.overlay.hidden = true;
    document.body.classList.remove('code-flow-active');
    stopTimerTicker();
    if (runtime.fxRaf) cancelAnimationFrame(runtime.fxRaf);
    runtime.fxRaf = 0;
    runtime.renderQueued = false;
    runtime.dragging = false;
    runtime.pointerId = null;
    runtime.activePair = -1;
    runtime.round = null;
  }

  function open(options = {}) {
    build();
    runtime.bridge = options.bridge || window.ICT8_XP_MINIGAMES_BRIDGE || null;
    runtime.onBack = typeof options.onBack === 'function' ? options.onBack : null;
    runtime.onClose = typeof options.onClose === 'function' ? options.onClose : null;
    runtime.onReward = typeof options.onReward === 'function' ? options.onReward : null;
    const snapshot = runtime.bridge?.getSnapshot?.() || {};
    const record = snapshot.gameRecords?.codeFlow || {};
    runtime.bestScore = Math.max(0, Number(record.bestScore || 0));
    runtime.highestCompletedLevel = Math.max(0, Number(record.highestCompletedLevel || record.bestLevel || 0));
    runtime.soundEnabled = snapshot.soundEnabled !== false;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    const nextLevel = runtime.highestCompletedLevel >= MAX_LEVEL ? MAX_LEVEL : Math.max(1, runtime.highestCompletedLevel + 1);
    runtime.open = true;
    runtime.overlay.hidden = false;
    document.body.classList.add('code-flow-active');
    prepareLevel(nextLevel, { ready: true });
    requestAnimationFrame(() => resizeCanvas());
  }

  window.ICT8CodeFlow = Object.freeze({
    open,
    close: closeInternal,
    isOpen: () => runtime.open
  });
})();
