(() => {
  'use strict';
  // Global Mini-Game audio mix: +50% SFX, safely capped to avoid clipping.
  function __ict8SfxGain(value) {
    return Math.min(1, Math.max(0, Number(value) || 0) * 1.5);
  }


  // BYTE RUNNER v8 — bright rail-city runner environment, strict action silhouettes,
  // readable question HUD, visible obstacle clearance, and validated fixed XP by difficulty.

  const GAME_ID = 'byte-runner-html-rush';
  const STATE_KEY = 'byteRunnerHtmlRush';
  const MAX_DPR = 2;
  const LANES = 3;
  const Z_MAX = 122;
  const GATE_TRIGGER_Z = 8.2;
  const PLAYER_GROUND_Y = 0;
  const SLIDE_DURATION = 1.50;
  const JUMP_LAUNCH_VELOCITY = 6.45;
  const JUMP_GRAVITY = 16.0;
  const PARTICLE_LIMIT = 72;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const positiveMod = (value, base) => ((value % base) + base) % base;
  const easeOutCubic = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const pick = rows => rows[Math.floor(Math.random() * rows.length)];
  const CODE_SIGNS = Object.freeze(['HTML','</>','404','BYTE','CSS','01']);

  const DIFFICULTIES = Object.freeze({
    easy: Object.freeze({
      key: 'easy', label: 'EASY', stars: '★☆☆☆', hearts: 3, steps: 8,
      startSpeed: 18.2, acceleration: .122, maxSpeed: 23.0, obstacleGap: 2.20,
      preview: 3.05, betweenQuestions: 1.45, actionChance: .44, maxXp: 5,
      minActiveMs: 46000, description: 'Beginner HTML · more reading time · forgiving pace'
    }),
    medium: Object.freeze({
      key: 'medium', label: 'MEDIUM', stars: '★★☆☆', hearts: 3, steps: 10,
      startSpeed: 20.9, acceleration: .154, maxSpeed: 26.9, obstacleGap: 1.84,
      preview: 2.65, betweenQuestions: 1.30, actionChance: .56, maxXp: 10,
      minActiveMs: 56000, description: 'Attributes + nesting · moderate reaction window'
    }),
    hard: Object.freeze({
      key: 'hard', label: 'HARD', stars: '★★★☆', hearts: 2, steps: 12,
      startSpeed: 23.3, acceleration: .182, maxSpeed: 30.4, obstacleGap: 1.50,
      preview: 2.28, betweenQuestions: 1.15, actionChance: .67, maxXp: 15,
      minActiveMs: 66000, description: 'Semantic HTML + forms · tighter runner patterns'
    }),
    difficult: Object.freeze({
      key: 'difficult', label: 'DIFFICULT', stars: '★★★★', hearts: 2, steps: 14,
      startSpeed: 25.4, acceleration: .205, maxSpeed: 33.0, obstacleGap: 1.20,
      preview: 2.02, betweenQuestions: 1.05, actionChance: .78, maxXp: 20,
      minActiveMs: 76000, description: 'Mixed debugging + accessibility · highest reward ceiling'
    })
  });

  const MISSION_BLUEPRINTS = Object.freeze([
    { key:'profile', title:'My Profile', h1:'Alex Rivera', intro:'Welcome to my personal profile page.', items:['Web Design','Photography','Basketball'], link:'Visit my school page', section:'About Me', image:'Profile Photo' },
    { key:'foods', title:'Favorite Foods', h1:'My Favorite Foods', intro:'Here are dishes I enjoy with family and friends.', items:['Adobo','Sinigang','Pancit'], link:'See a recipe', section:'Food Picks', image:'Favorite Food' },
    { key:'family', title:'My Family', h1:'Our Family Page', intro:'A simple page about the people who support me.', items:['Parents','Siblings','Grandparents'], link:'Family activity ideas', section:'Family Moments', image:'Family Picture' },
    { key:'movies', title:'Favorite Movies', h1:'Movie Night Picks', intro:'These are movies I would recommend for movie night.', items:['Adventure','Comedy','Animation'], link:'Movie guide', section:'Top Picks', image:'Movie Poster' },
    { key:'subjects', title:'School Subjects', h1:'My School Subjects', intro:'A quick guide to the subjects I study this term.', items:['ICT','Science','English'], link:'Study resources', section:'Class List', image:'School Subjects' },
    { key:'schedule', title:'Class Schedule', h1:'Weekly Class Schedule', intro:'This page organizes a sample school-day schedule.', items:['ICT — 8:00','Math — 9:00','Science — 10:00'], link:'School portal', section:'Schedule', image:'School Clock' },
    { key:'recipe', title:'Recipe Page', h1:'Easy Fruit Salad', intro:'Follow these simple steps for a quick classroom recipe.', items:['Prepare fruit','Mix ingredients','Chill and serve'], link:'More recipes', section:'Instructions', image:'Fruit Salad' },
    { key:'travel', title:'Travel Blog', h1:'Weekend in Puerto Galera', intro:'A short travel note about beaches, views, and local culture.', items:['Beach walk','Local food','Sunset view'], link:'Travel information', section:'Trip Highlights', image:'Travel View' },
    { key:'gallery', title:'Image Gallery', h1:'My Photo Gallery', intro:'A small collection of memorable school and community moments.', items:['School Event','Nature Walk','Family Day'], link:'Photo tips', section:'Featured Photo', image:'Gallery Image' },
    { key:'club', title:'School Club', h1:'ICT Club', intro:'Our club builds projects, shares ideas, and practices teamwork.', items:['Coding','Design','Peer Help'], link:'Join the club', section:'Club Activities', image:'ICT Club' },
    { key:'portfolio', title:'Student Portfolio', h1:'Student Portfolio', intro:'This portfolio highlights school projects and skills.', items:['HTML Page','Poster Design','Research Task'], link:'View projects', section:'Featured Work', image:'Portfolio Project' },
    { key:'menu', title:'Restaurant Menu', h1:'Byte Cafe Menu', intro:'A sample digital menu for a small neighborhood cafe.', items:['Sandwich — ₱95','Pasta — ₱120','Juice — ₱55'], link:'Contact the cafe', section:'Menu', image:'Cafe Meal' },
    { key:'playlist', title:'Music Playlist', h1:'Study Playlist', intro:'Songs and instrumentals that make study time more focused.', items:['Focus Beat','Calm Keys','Night Coding'], link:'Music notes', section:'Playlist', image:'Headphones' },
    { key:'sports', title:'Sports Team', h1:'School Sports Team', intro:'Meet the team and see the values we practice together.', items:['Teamwork','Discipline','Respect'], link:'Game schedule', section:'Team Values', image:'Sports Team' },
    { key:'news', title:'News Article', h1:'Campus Tech Day', intro:'Students shared coding projects during the school technology event.', items:['Project Booths','Demo Sessions','Awards'], link:'Read more', section:'Event Report', image:'Campus Event' },
    { key:'invitation', title:'Event Invitation', h1:'You Are Invited!', intro:'Join our class for a simple school showcase and celebration.', items:['Friday','2:00 PM','School Hall'], link:'Event details', section:'Event Information', image:'Invitation' },
    { key:'contact', title:'Contact Page', h1:'Contact Our Club', intro:'Send a message or use the details below to reach the club.', items:['Email','School Office','Club Adviser'], link:'School website', section:'Contact Details', image:'Contact Icon' },
    { key:'registration', title:'Registration Form', h1:'Club Registration', intro:'Complete the form to register interest in the ICT Club.', items:['Name','Email','Section'], link:'Registration guide', section:'Registration', image:'Registration Form' },
    { key:'blog', title:'Simple Blog', h1:'My Learning Blog', intro:'A short blog about what I learned while building web pages.', items:['HTML Structure','Links and Images','Semantic Tags'], link:'Learning resources', section:'Latest Post', image:'Learning Blog' },
    { key:'product', title:'Product Page', h1:'Byte Study Lamp', intro:'A simple product page describing a useful study accessory.', items:['LED Light','USB Powered','Adjustable'], link:'Product details', section:'Features', image:'Study Lamp' },
    { key:'resume', title:'Student Resume', h1:'Student Resume', intro:'A beginner-friendly page for skills, interests, and school experience.', items:['HTML Basics','Teamwork','Creative Design'], link:'Portfolio link', section:'Skills', image:'Student Resume' },
    { key:'hobbies', title:'My Hobbies', h1:'Things I Enjoy', intro:'These hobbies help me relax, learn, and stay active.', items:['Drawing','Cycling','Coding'], link:'Hobby ideas', section:'Hobbies', image:'Hobby Collage' },
    { key:'officers', title:'Class Officers', h1:'Class Officers', intro:'Meet the students helping organize class activities.', items:['President','Vice President','Secretary'], link:'Class page', section:'Leadership Team', image:'Class Officers' },
    { key:'animals', title:'Animal Facts', h1:'Amazing Sea Turtles', intro:'Learn a few beginner-friendly facts about sea turtles.', items:['They are reptiles','They breathe air','They live in oceans'], link:'Learn more', section:'Quick Facts', image:'Sea Turtle' },
    { key:'destination', title:'Tourist Destination', h1:'Explore Occidental Mindoro', intro:'A sample tourism page highlighting nature and local experiences.', items:['Beaches','Mountains','Local Culture'], link:'Travel guide', section:'Highlights', image:'Tourist Destination' },
    { key:'book', title:'Book Review', h1:'My Book Review', intro:'A simple review page for a favorite classroom reading.', items:['Main Idea','Favorite Part','Recommendation'], link:'Reading list', section:'Review Notes', image:'Book Cover' }
  ]);

  const runtime = {
    built:false, open:false, state:'DIFFICULTY_SELECT', bridge:null, onBack:null, onClose:null, onReward:null,
    overlay:null, shell:null, canvas:null, ctx:null, soundBtn:null, pauseBtn:null,
    statScore:null, statDistance:null, statCombo:null, statHearts:null, statHtml:null,
    questionBox:null, qType:null, qAction:null, qPrompt:null, qCode:null, qChoices:null,
    buildProgress:null, buildCount:null, buildCode:null, insertion:null, toast:null,
    difficultyPanel:null, missionPanel:null, missionName:null, missionDifficulty:null, countdownEl:null,
    pausePanel:null, resultPanel:null, gameOverPanel:null, resultMission:null, resultDifficulty:null,
    resultChallenges:null, resultCorrect:null, resultAccuracy:null, resultCombo:null, resultHearts:null,
    resultDistance:null, resultScore:null, resultXp:null, resultRewardNote:null, resultSource:null,
    resultPreview:null, resultPerfect:null, mistakesList:null, overProgress:null, overAccuracy:null,
    overScore:null, overDistance:null, overCombo:null, overXp:null, overNote:null,
    view:{w:960,h:760,dpr:1}, raf:0, lastFrame:0, resizeTimer:0, skyGradient:null, roadGradient:null, horizonGlow:null,
    difficulty:DIFFICULTIES.easy, mission:null, lastMissionKey:'', round:null, rewardSubmitting:false,
    speed:0, distance:0, arcadeScore:0, performanceScore:0, activeTimeMs:0,
    hearts:3, shield:0, invulnerable:0, combo:0, longestCombo:0, correctAnswers:0, wrongAnswers:0,
    obstacleHits:0, collectibles:0, completedSteps:0, stepAttempt:0, currentChallenge:null,
    questionPhase:'none', questionTimer:0, questionWait:0, questionPending:false, feedbackClock:0,
    gateGroup:null, lane:1, lanePos:1, laneShiftCooldown:0, jumpY:0, jumpVy:0, slideTime:0,
    stumbleTime:0, landingKick:0, cameraKick:0, roadPulse:0, obstacleClock:0, collectibleClock:0,
    obstacles:[], pickups:[], particles:[], laneHistory:[], motionHistory:[], challengeHistory:new Set(), mistakes:[],
    lastObstaclePattern:'', visualTime:0, audioContext:null, soundEnabled:true, musicClock:0,
    pointer:null, pauseFrom:'', countdownClock:0, countdownStage:3, toastClock:0, toastKind:'',
    bestScore:0, bestAccuracy:0, bestCombo:0, bestDifficultyRank:0, clearFxTime:0, clearFxKind:''
  };

  for (let i = 0; i < PARTICLE_LIMIT; i += 1) runtime.particles.push({ active:false, x:0, y:0, vx:0, vy:0, age:0, ttl:0, size:0, kind:'code' });

  const escapeText = value => String(value ?? '').replace(/[&<>]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[char]));
  const escapeAttr = value => String(value ?? '').replace(/[&"<>]/g, char => ({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]));
  const humanLane = lane => ['LEFT','CENTER','RIGHT'][clamp(Math.floor(lane),0,2)];
  const difficultyRank = key => ({easy:1,medium:2,hard:3,difficult:4}[key] || 1);

  function buildMission(difficultyKey = 'easy') {
    const candidates = MISSION_BLUEPRINTS.filter(item => item.key !== runtime.lastMissionKey);
    const base = pick(candidates.length ? candidates : MISSION_BLUEPRINTS);
    runtime.lastMissionKey = base.key;
    const variant = 1 + Math.floor(Math.random() * 999);
    const title = `${base.title}`;
    const heading = variant % 3 === 0 ? `${base.h1} — Web Page` : base.h1;
    const intro = variant % 4 === 0 ? `${base.intro} This version was built in HTML Rush.` : base.intro;
    const imageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="260" viewBox="0 0 520 260"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#061727"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs><rect width="520" height="260" rx="24" fill="url(#g)"/><path d="M65 196 165 84l72 82 62-69 156 99" fill="none" stroke="#67e8f9" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/><circle cx="402" cy="68" r="24" fill="#bef264" opacity=".8"/><text x="260" y="232" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="white">${escapeText(base.image)}</text></svg>`;
    const imageUrl = `data:image/svg+xml,${encodeURIComponent(imageSvg)}`;
    const linkUrl = 'https://example.com';
    const listItems = base.items.map(item => `<li>${escapeText(item)}</li>`).join('\n      ');
    const tableRows = base.items.slice(0,3).map((item, index) => `<tr><td>${index + 1}</td><td>${escapeText(item)}</td></tr>`).join('\n        ');
    const id = `${base.key}-${difficultyKey}-${variant}`;
    const initialCode = '<!DOCTYPE html>';
    const closeAll = '</body>\n</html>';
    const common = {
      html: { concept:'html-open', insertion:'<html lang="en">' },
      head: { concept:'head-open', insertion:'<head>\n  <meta charset="UTF-8">' },
      title: { concept:'title', insertion:`  <title>${escapeText(title)}</title>\n</head>` },
      body: { concept:'body-open', insertion:'<body>' },
      heading: { concept:'heading', insertion:`  <h1>${escapeText(heading)}</h1>` },
      paragraph: { concept:'paragraph', insertion:`  <p>${escapeText(intro)}</p>` },
      link: { concept:'link-href', insertion:`  <a href="${linkUrl}">${escapeText(base.link)}</a>` },
      image: { concept:'image-alt', insertion:`  <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(base.image)}">` },
      list: { concept:'list', insertion:`  <ul>\n      ${listItems}\n  </ul>` },
      close: { concept:'closing-html', insertion:closeAll }
    };
    let steps;
    if (difficultyKey === 'easy') {
      const feature = Math.random() < .5 ? common.link : common.list;
      steps = [common.html, common.head, common.title, common.body, common.heading, common.paragraph, feature, common.close];
    } else if (difficultyKey === 'medium') {
      steps = [common.html, common.head, common.title, common.body, common.heading, common.paragraph, common.image, common.list, common.link, common.close];
    } else if (difficultyKey === 'hard') {
      steps = [
        common.html, common.head, common.title, common.body,
        { concept:'header', insertion:`  <header>\n    <h1>${escapeText(heading)}</h1>\n  </header>` },
        { concept:'nav', insertion:`  <nav aria-label="Primary navigation">\n    <a href="#main">Main content</a>\n  </nav>` },
        { concept:'main', insertion:'  <main id="main">' },
        { concept:'section', insertion:`    <section>\n      <h2>${escapeText(base.section)}</h2>\n      <p>${escapeText(intro)}</p>\n    </section>` },
        common.image,
        { concept:'table-row', insertion:`    <table>\n      <tr><th>#</th><th>Item</th></tr>\n      ${tableRows}\n    </table>` },
        { concept:'label-for', insertion:'    <form>\n      <label for="email">Email:</label>\n      <input id="email" name="email" type="email">\n      <button type="submit">Send</button>\n    </form>' },
        { concept:'semantic-close', insertion:'  </main>\n  <footer>Built with semantic HTML.</footer>\n</body>\n</html>' }
      ];
    } else {
      steps = [
        common.html, common.head, common.title, common.body,
        { concept:'header', insertion:`  <header>\n    <h1>${escapeText(heading)}</h1>\n  </header>` },
        { concept:'nav', insertion:'  <nav aria-label="Primary navigation">\n    <a href="#story">Story</a>\n    <a href="#details">Details</a>\n  </nav>' },
        { concept:'main', insertion:'  <main id="main">' },
        { concept:'article', insertion:`    <article id="story">\n      <h2>${escapeText(base.section)}</h2>\n      <p>${escapeText(intro)}</p>\n    </article>` },
        { concept:'image-alt', insertion:`    <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(base.image)}">` },
        { concept:'table-header', insertion:`    <section id="details">\n      <h2>Quick Details</h2>\n      <table>\n        <tr><th>#</th><th>Item</th></tr>\n        ${tableRows}\n      </table>\n    </section>` },
        { concept:'form', insertion:'    <form>' },
        { concept:'label-for', insertion:'      <label for="email">Email address:</label>' },
        { concept:'input-email', insertion:'      <input id="email" name="email" type="email" placeholder="name@example.com">\n      <button type="submit">Submit</button>\n    </form>' },
        { concept:'semantic-close', insertion:'  </main>\n  <footer>HTML Rush mission complete.</footer>\n</body>\n</html>' }
      ];
    }
    return { id, key:base.key, title, heading, initialCode, steps, finalHtml:[initialCode,...steps.map(step => step.insertion)].join('\n') };
  }

  function choiceSet(correct, distractors) {
    const unique = [correct, ...distractors].filter((value,index,array) => array.indexOf(value) === index);
    return unique.slice(0,3);
  }

  function challengeVariants(concept, mission) {
    const title = mission?.title || 'Web Page';
    const variants = {
      'html-open': [
        {type:'COMPLETE THE TAG',prompt:'Which element should open the HTML document after the DOCTYPE?',code:'<!DOCTYPE html>\n____',correct:'<html lang="en">',choices:choiceSet('<html lang="en">',['<body>','<head>']),explanation:'The <html> element is the root element of the document.'},
        {type:'CODE ORDER',prompt:'Which code belongs next at the root of the page?',code:'<!DOCTYPE html>\n[ NEXT ]',correct:'<html lang="en">',choices:choiceSet('<html lang="en">',['<main>','<title>']),explanation:'The root <html> element wraps the head and body.'},
        {type:'FIX THE ERROR',prompt:'The page needs a root element. Which replacement is correct?',code:'<!DOCTYPE html>\n<page>',correct:'<html lang="en">',choices:choiceSet('<html lang="en">',['<page>','<document>']),explanation:'HTML uses the <html> root element; <page> and <document> are not HTML root tags.'}
      ],
      'head-open': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element contains document metadata and the page title?',code:'<html>\n  ____',correct:'<head>',choices:choiceSet('<head>',['<header>','<main>']),explanation:'The <head> contains metadata such as the title and character encoding.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which tag starts the non-visible document information area?',code:'____\n  <meta charset="UTF-8">',correct:'<head>',choices:choiceSet('<head>',['<body>','<nav>']),explanation:'Metadata belongs inside <head>, not inside the visible body.'},
        {type:'FIX THE ERROR',prompt:'Replace the semantic page header with the correct metadata container.',code:'<header>\n  <meta charset="UTF-8">',correct:'<head>',choices:choiceSet('<head>',['<header>','<section>']),explanation:'<header> is visible page content; <head> is for document metadata.'}
      ],
      'title': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element sets the browser tab title?',code:`____${title}____`,correct:'<title>',choices:choiceSet('<title>',['<h1>','<caption>']),explanation:'The <title> element defines the document title shown in the browser tab.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which tag belongs in <head> and names the document?',code:'<head>\n  ____',correct:'<title>',choices:choiceSet('<title>',['<header>','<h1>']),explanation:'A document title uses <title> inside the head.'},
        {type:'CORRECT CLOSING TAG',prompt:'Which closing tag completes the document title?',code:`<title>${title}____`,correct:'</title>',choices:choiceSet('</title>',['</h1>','</head>']),explanation:'An opening <title> is closed with </title>.'}
      ],
      'body-open': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element contains the visible webpage content?',code:'</head>\n____',correct:'<body>',choices:choiceSet('<body>',['<head>','<meta>']),explanation:'Visible headings, paragraphs, images, and links belong inside <body>.'},
        {type:'CODE ORDER',prompt:'The head is finished. Which section should begin next?',code:'</head>\n[ NEXT ]',correct:'<body>',choices:choiceSet('<body>',['<title>','<html>']),explanation:'The visible document body follows the head.'},
        {type:'FIX THE ERROR',prompt:'Which tag replaces <content> for standard visible page content?',code:'<content>\n  <h1>...</h1>',correct:'<body>',choices:choiceSet('<body>',['<content>','<head>']),explanation:'HTML documents use <body> for visible content.'}
      ],
      'heading': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element is the main top-level heading?',code:'____ My Page ____',correct:'<h1>',choices:choiceSet('<h1>',['<p>','<title>']),explanation:'<h1> represents the main heading in page content.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which tag creates the most important visible heading?',code:'<body>\n  ____',correct:'<h1>',choices:choiceSet('<h1>',['<head>','<strong>']),explanation:'Use <h1> for the primary visible page heading.'},
        {type:'CORRECT CLOSING TAG',prompt:'Which closing tag completes this main heading?',code:'<h1>My Page____',correct:'</h1>',choices:choiceSet('</h1>',['</p>','</title>']),explanation:'An <h1> element closes with </h1>.'}
      ],
      'paragraph': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element creates a paragraph of text?',code:'____ Welcome to my page. ____',correct:'<p>',choices:choiceSet('<p>',['<h1>','<br>']),explanation:'Use <p> for a paragraph.'},
        {type:'PURPOSE / CONCEPT',prompt:'What tag should wrap a normal block of paragraph text?',code:'<body>\n  ____ Intro text...',correct:'<p>',choices:choiceSet('<p>',['<title>','<nav>']),explanation:'The paragraph element is <p>.'},
        {type:'FIX THE ERROR',prompt:'Replace the heading tag with the correct tag for body text.',code:'<h1>This sentence is normal paragraph text.</h1>',correct:'<p>',choices:choiceSet('<p>',['<h2>','<title>']),explanation:'Normal paragraph content should use <p>, not a heading.'}
      ],
      'link-href': [
        {type:'CHOOSE THE ATTRIBUTE',prompt:'Which attribute gives a link its destination?',code:'<a ____="https://example.com">Visit</a>',correct:'href',choices:choiceSet('href',['src','alt']),explanation:'The href attribute stores the destination URL of an anchor.'},
        {type:'FILL IN THE BLANK',prompt:'Complete the anchor so clicking it can open a destination.',code:'<a ____="https://example.com">Learn more</a>',correct:'href',choices:choiceSet('href',['class','src']),explanation:'Links use href for their destination.'},
        {type:'FIX THE ERROR',prompt:'Which attribute should replace src in this link?',code:'<a src="https://example.com">Visit</a>',correct:'href',choices:choiceSet('href',['alt','type']),explanation:'The anchor element uses href, while src is used by elements such as images.'}
      ],
      'image-alt': [
        {type:'ACCESSIBILITY CHALLENGE',prompt:'Which attribute provides text describing an image?',code:'<img src="photo.jpg" ____="Class photo">',correct:'alt',choices:choiceSet('alt',['href','type']),explanation:'The alt attribute provides a text alternative for an image.'},
        {type:'CHOOSE THE ATTRIBUTE',prompt:'Which attribute should describe the image for accessibility?',code:'<img src="photo.jpg" ____="Profile Photo">',correct:'alt',choices:choiceSet('alt',['src','class']),explanation:'Use alt to describe meaningful images.'},
        {type:'FIX THE ERROR',prompt:'The image uses href for its description. Which attribute should replace it?',code:'<img src="photo.jpg" href="School event">',correct:'alt',choices:choiceSet('alt',['name','value']),explanation:'An image description belongs in the alt attribute.'}
      ],
      'list': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element starts an unordered (bulleted) list?',code:'____\n  <li>Item</li>\n____',correct:'<ul>',choices:choiceSet('<ul>',['<ol>','<li>']),explanation:'<ul> creates an unordered list; <ol> creates a numbered list.'},
        {type:'CORRECT NESTING',prompt:'Which parent should contain these <li> items for a bulleted list?',code:'____\n  <li>HTML</li>\n  <li>CSS</li>\n____',correct:'<ul>',choices:choiceSet('<ul>',['<p>','<table>']),explanation:'List items belong inside a list container such as <ul>.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which tag creates a bulleted list?',code:'[ BULLETED LIST ]',correct:'<ul>',choices:choiceSet('<ul>',['<ol>','<tr>']),explanation:'Use <ul> for an unordered list.'}
      ],
      'header': [
        {type:'SEMANTIC HTML',prompt:'Which semantic element is appropriate for introductory page content?',code:'____\n  <h1>Page Title</h1>\n____',correct:'<header>',choices:choiceSet('<header>',['<footer>','<aside>']),explanation:'<header> represents introductory or heading content.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which semantic tag can group the page title near the top?',code:'<body>\n  ____',correct:'<header>',choices:choiceSet('<header>',['<head>','<title>']),explanation:'<header> is visible semantic content and is different from <head>.'},
        {type:'FIX THE ERROR',prompt:'The page title is wrapped in <head> inside the body. What semantic element should replace it?',code:'<body>\n  <head><h1>My Page</h1></head>',correct:'<header>',choices:choiceSet('<header>',['<head>','<meta>']),explanation:'A visible introductory region inside body should use <header>, not <head>.'}
      ],
      'nav': [
        {type:'SEMANTIC HTML',prompt:'Which element should contain primary navigation links?',code:'____\n  <a href="#main">Main</a>\n____',correct:'<nav>',choices:choiceSet('<nav>',['<aside>','<article>']),explanation:'The <nav> element represents a major navigation block.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which semantic element identifies a group of navigation links?',code:'[ PRIMARY LINKS ]',correct:'<nav>',choices:choiceSet('<nav>',['<main>','<footer>']),explanation:'Use <nav> for major navigation links.'},
        {type:'ACCESSIBILITY CHALLENGE',prompt:'Which semantic tag gives assistive technology a navigation landmark?',code:'____ aria-label="Primary navigation"',correct:'<nav>',choices:choiceSet('<nav>',['<section>','<div>']),explanation:'<nav> exposes navigation semantics in addition to grouping links.'}
      ],
      'main': [
        {type:'SEMANTIC HTML',prompt:'Which element represents the page’s primary unique content?',code:'____ id="main"',correct:'<main>',choices:choiceSet('<main>',['<nav>','<aside>']),explanation:'The <main> element represents the dominant content of the document.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which semantic landmark should wrap the central page content?',code:'[ PRIMARY CONTENT ]',correct:'<main>',choices:choiceSet('<main>',['<header>','<footer>']),explanation:'Use <main> for the primary page content.'},
        {type:'CORRECT NESTING',prompt:'After header and nav, which element can contain the page’s main sections?',code:'</nav>\n____\n  <section>...</section>',correct:'<main>',choices:choiceSet('<main>',['<title>','<meta>']),explanation:'Sections containing the central content can be grouped inside <main>.'}
      ],
      'section': [
        {type:'SEMANTIC HTML',prompt:'Which element groups a themed section with its own heading?',code:'____\n  <h2>Highlights</h2>\n  <p>...</p>\n____',correct:'<section>',choices:choiceSet('<section>',['<nav>','<label>']),explanation:'<section> groups related content, commonly with a heading.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which semantic tag is suitable for a related themed block of content?',code:'[ HEADING + RELATED CONTENT ]',correct:'<section>',choices:choiceSet('<section>',['<head>','<input>']),explanation:'A section represents a thematic grouping of content.'},
        {type:'CORRECT NESTING',prompt:'Which container can wrap this h2 and paragraph as one themed unit?',code:'____\n<h2>About</h2>\n<p>...</p>\n____',correct:'<section>',choices:choiceSet('<section>',['<title>','<tr>']),explanation:'A semantic <section> is appropriate for a themed content group.'}
      ],
      'article': [
        {type:'SEMANTIC HTML',prompt:'Which element best represents a self-contained blog/news entry?',code:'____\n  <h2>Latest Post</h2>\n  <p>...</p>\n____',correct:'<article>',choices:choiceSet('<article>',['<nav>','<label>']),explanation:'<article> is for self-contained content that can stand on its own.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which semantic element fits a self-contained story or post?',code:'[ SELF-CONTAINED STORY ]',correct:'<article>',choices:choiceSet('<article>',['<footer>','<form>']),explanation:'Use <article> for self-contained posts, stories, or similar content.'},
        {type:'CORRECT NESTING',prompt:'Which semantic wrapper fits this independent content block inside main?',code:'<main>\n  ____\n    <h2>Story</h2>\n  ____',correct:'<article>',choices:choiceSet('<article>',['<head>','<nav>']),explanation:'An article can be nested inside main as a self-contained content unit.'}
      ],
      'table-row': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element creates a row inside a table?',code:'<table>\n  ____\n    <td>1</td>\n  ____\n</table>',correct:'<tr>',choices:choiceSet('<tr>',['<td>','<th>']),explanation:'A table row is created with <tr>.'},
        {type:'CORRECT NESTING',prompt:'Which element should contain table cells horizontally?',code:'<table>\n  ____ <td>A</td><td>B</td> ____\n</table>',correct:'<tr>',choices:choiceSet('<tr>',['<table>','<li>']),explanation:'<td> and <th> cells are placed inside table rows (<tr>).'},
        {type:'PURPOSE / CONCEPT',prompt:'What tag represents a table row?',code:'[ TABLE ROW ]',correct:'<tr>',choices:choiceSet('<tr>',['<td>','<ul>']),explanation:'The <tr> element represents a row of cells.'}
      ],
      'table-header': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element creates a table header cell?',code:'<tr>\n  ____ Item ____\n</tr>',correct:'<th>',choices:choiceSet('<th>',['<td>','<tr>']),explanation:'Use <th> for a header cell in a table.'},
        {type:'ACCESSIBILITY CHALLENGE',prompt:'Which table cell element clearly identifies a column heading?',code:'<tr>\n  ____ Name ____\n  <th>Value</th>\n</tr>',correct:'<th>',choices:choiceSet('<th>',['<td>','<li>']),explanation:'Header cells use <th>, helping communicate table structure.'},
        {type:'FIX THE ERROR',prompt:'The first row is meant to contain headings. Which tag should replace <td>?',code:'<tr><td>#</td><td>Item</td></tr>',correct:'<th>',choices:choiceSet('<th>',['<tr>','<caption>']),explanation:'Use <th> for cells that are headers.'}
      ],
      'form': [
        {type:'CHOOSE THE CORRECT ELEMENT',prompt:'Which element groups interactive form controls?',code:'____\n  <label>...</label>\n  <input>\n____',correct:'<form>',choices:choiceSet('<form>',['<table>','<nav>']),explanation:'The <form> element groups controls used to submit user input.'},
        {type:'PURPOSE / CONCEPT',prompt:'Which tag starts a form for collecting user input?',code:'[ INPUT AREA ]',correct:'<form>',choices:choiceSet('<form>',['<main>','<article>']),explanation:'Use <form> to group controls for user input.'},
        {type:'CODE ORDER',prompt:'Before adding a label and input, which form container should open?',code:'____\n<label>...</label>\n<input>',correct:'<form>',choices:choiceSet('<form>',['<footer>','<table>']),explanation:'Labels and inputs can be grouped within a <form>.'}
      ],
      'label-for': [
        {type:'ACCESSIBILITY CHALLENGE',prompt:'Which attribute connects a <label> to an input’s id?',code:'<label ____="email">Email:</label>\n<input id="email">',correct:'for',choices:choiceSet('for',['id','name']),explanation:'A label’s for value matches the id of its associated form control.'},
        {type:'FILL IN THE BLANK',prompt:'Complete the accessible label-to-input connection.',code:'<label ____="email">Email</label>\n<input id="email" type="email">',correct:'for',choices:choiceSet('for',['href','src']),explanation:'Use for on the label and a matching id on the input.'},
        {type:'FIX THE ERROR',prompt:'The label uses href to point to an input. Which attribute should replace it?',code:'<label href="email">Email</label>\n<input id="email">',correct:'for',choices:choiceSet('for',['alt','type']),explanation:'The label association attribute is for.'}
      ],
      'input-email': [
        {type:'CHOOSE THE ATTRIBUTE VALUE',prompt:'The user must enter an email address. Which input type is appropriate?',code:'<input type="____">',correct:'email',choices:choiceSet('email',['password','button']),explanation:'type="email" is appropriate for email-address input.'},
        {type:'FILL IN THE BLANK',prompt:'Complete the input type for an email field.',code:'<input id="email" type="____">',correct:'email',choices:choiceSet('email',['text','submit']),explanation:'The email input type communicates the expected value.'},
        {type:'FIX THE ERROR',prompt:'This field should collect email. Which value should replace password?',code:'<input type="password" placeholder="name@example.com">',correct:'email',choices:choiceSet('email',['hidden','reset']),explanation:'Use type="email" for an email-address field.'}
      ],
      'closing-html': [
        {type:'CORRECT CLOSING TAG',prompt:'Which closing tag ends the visible document content?',code:'<body>\n  ...\n____\n</html>',correct:'</body>',choices:choiceSet('</body>',['</head>','</main>']),explanation:'The visible body closes with </body> before </html>.'},
        {type:'CODE ORDER',prompt:'The visible page is complete. Which closing tag comes before </html>?',code:'...\n____\n</html>',correct:'</body>',choices:choiceSet('</body>',['</title>','</head>']),explanation:'Close the body before closing the root html element.'},
        {type:'FIX THE ERROR',prompt:'Which tag correctly closes an open <body>?',code:'<body>\n  ...\n</content>',correct:'</body>',choices:choiceSet('</body>',['</content>','</html>']),explanation:'An opening <body> must be paired with </body>.'}
      ],
      'semantic-close': [
        {type:'CORRECT CLOSING TAG',prompt:'Which closing tag should end the primary content before the footer?',code:'<main>\n  ...\n____\n<footer>...</footer>',correct:'</main>',choices:choiceSet('</main>',['</nav>','</head>']),explanation:'Close <main> with </main> before moving to sibling footer content.'},
        {type:'CORRECT NESTING',prompt:'Which tag closes the main landmark before the footer begins?',code:'<main>\n  <section>...</section>\n____\n<footer>...',correct:'</main>',choices:choiceSet('</main>',['</body>','</section>']),explanation:'The main region must be closed before its sibling footer.'},
        {type:'DEBUGGING CHALLENGE',prompt:'The main element is still open when footer starts. Which tag fixes the structure?',code:'<main>\n  ...\n<footer>...',correct:'</main>',choices:choiceSet('</main>',['</html>','</header>']),explanation:'Insert </main> to close the main content before footer.'}
      ]
    };
    return variants[concept] || [
      {type:'HTML CHALLENGE',prompt:'Choose the valid HTML fragment for the current build step.',code:'[ SELECT THE VALID CODE ]',correct:'<p>',choices:choiceSet('<p>',['<paragraph>','<text>']),explanation:'Use standard HTML elements and attributes.'}
    ];
  }

  function nextChallenge() {
    const step = runtime.mission?.steps?.[runtime.completedSteps];
    if (!step) return null;
    const variants = challengeVariants(step.concept, runtime.mission);
    const start = runtime.stepAttempt % variants.length;
    let chosen = null;
    for (let offset = 0; offset < variants.length; offset += 1) {
      const index = (start + offset) % variants.length;
      const id = `${runtime.mission.id}-${runtime.completedSteps}-${runtime.stepAttempt}-${index}`;
      if (!runtime.challengeHistory.has(id)) {
        chosen = { ...variants[index], id, variantIndex:index };
        runtime.challengeHistory.add(id);
        break;
      }
    }
    if (!chosen) {
      const fallback = variants[start];
      chosen = { ...fallback, id:`${runtime.mission.id}-${runtime.completedSteps}-${runtime.stepAttempt}-${Date.now().toString(36)}` };
    }
    const motion = selectChallengeMotion();
    return { ...chosen, motion, codeInsertion:step.insertion, concept:step.concept };
  }

  function chooseCorrectLane() {
    const history = runtime.laneHistory;
    let candidates = [0,1,2];
    if (history.length >= 2 && history[history.length-1] === history[history.length-2]) candidates = candidates.filter(lane => lane !== history[history.length-1]);
    if (history.length >= 3) {
      const a = history[history.length-3], b = history[history.length-2], c = history[history.length-1];
      if (new Set([a,b,c]).size === 3) candidates = candidates.filter(lane => lane !== a);
    }
    if (!candidates.length) candidates = [0,1,2];
    const lane = pick(candidates);
    history.push(lane);
    if (history.length > 8) history.shift();
    return lane;
  }

  function assignChoiceLanes(challenge) {
    const correctLane = chooseCorrectLane();
    const distractors = challenge.choices.filter(choice => choice !== challenge.correct).slice();
    for (let i=distractors.length-1;i>0;i-=1) { const j=Math.floor(Math.random()*(i+1)); [distractors[i],distractors[j]]=[distractors[j],distractors[i]]; }
    const lanes = new Array(3);
    lanes[correctLane] = challenge.correct;
    let d = 0;
    for (let lane=0;lane<3;lane+=1) if (lane !== correctLane) lanes[lane] = distractors[d++] ?? challenge.choices.find(choice => choice !== challenge.correct) ?? '—';
    return { correctLane, lanes };
  }

  function rememberMotion(motion) {
    const history = runtime.motionHistory;
    history.push(motion);
    if (history.length > 8) history.shift();
    return motion;
  }

  function selectChallengeMotion() {
    const history = runtime.motionHistory;
    const recent = history.slice(-4);
    const last = history[history.length - 1] || '';
    const jumpMissing = recent.length >= 3 && !recent.includes('jump');
    const slideMissing = recent.length >= 3 && !recent.includes('slide');
    const starterBoost = history.length < 2 && runtime.completedSteps > 0;
    const forceAction = jumpMissing || slideMissing || starterBoost || ((runtime.difficulty.key === 'hard' || runtime.difficulty.key === 'difficult') && recent.length >= 2 && recent.every(item => item === 'run') && Math.random() < 0.72);
    if (!forceAction && Math.random() >= runtime.difficulty.actionChance) return rememberMotion('run');
    let motion = '';
    if (jumpMissing) motion = 'jump';
    else if (slideMissing) motion = 'slide';
    else if (last === 'slide') motion = Math.random() < 0.76 ? 'jump' : 'run';
    else if (last === 'jump') motion = Math.random() < 0.76 ? 'slide' : 'run';
    else motion = Math.random() < 0.60 ? 'jump' : 'slide';
    if (history.length >= 2 && history[history.length - 1] === motion && history[history.length - 2] === motion) motion = motion === 'jump' ? 'slide' : 'jump';
    return rememberMotion(motion);
  }

  function build() {
    if (runtime.built) return;
    const overlay = document.createElement('div');
    overlay.id = 'byteRunnerHtmlRushOverlay';
    overlay.className = 'xp-games-game-overlay byte-runner-html-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','BYTE RUNNER: HTML RUSH mini-game');
    overlay.innerHTML = `
      <section class="byte-runner-html-shell">
        <canvas class="byte-runner-html-canvas" tabindex="-1" aria-label="Three lane HTML runner game"></canvas>
        <header class="byte-runner-html-topbar">
          <button type="button" data-brh-back aria-label="Back to Arcade">←<span class="brh-back-word"> ARCADE</span></button>
          <div class="byte-runner-html-brand"><strong><span>BYTE RUNNER</span><span class="brh-title-extra">: HTML RUSH</span></strong><small>Build HTML at full speed</small></div>
          <button type="button" data-brh-sound aria-label="Toggle sound">🔊</button>
          <button type="button" data-brh-pause aria-label="Pause game">Ⅱ</button>
          <button type="button" data-brh-close aria-label="Close game">×</button>
        </header>
        <div class="byte-runner-html-stats">
          <div class="byte-runner-html-stat"><small>SCORE</small><strong data-brh-score>0</strong></div>
          <div class="byte-runner-html-stat"><small>DISTANCE</small><strong data-brh-distance>0m</strong></div>
          <div class="byte-runner-html-stat"><small>COMBO</small><strong data-brh-combo>x0</strong></div>
          <div class="byte-runner-html-stat hearts"><small>HEARTS</small><strong data-brh-hearts>♥♥♥</strong></div>
          <div class="byte-runner-html-stat"><small>HTML</small><strong data-brh-html>0/8</strong></div>
        </div>
        <section class="byte-runner-html-question" data-brh-question hidden>
          <div class="byte-runner-html-qtop"><span class="byte-runner-html-qtype" data-brh-qtype>HTML CHALLENGE</span><span class="byte-runner-html-action" data-brh-qaction>RUN THROUGH ANSWER</span></div>
          <h3 data-brh-qprompt>Read the question.</h3>
          <pre class="byte-runner-html-codeprompt" data-brh-qcode></pre>
          <div class="byte-runner-html-choices" data-brh-qchoices></div>
        </section>
        <section class="byte-runner-html-build">
          <div class="byte-runner-html-build-head"><strong>HTML BUILD</strong><span data-brh-build-count>0 / 8</span></div>
          <div class="byte-runner-html-progress"><i data-brh-build-progress></i></div>
          <pre class="byte-runner-html-code" data-brh-build-code>&lt;!DOCTYPE html&gt;</pre>
        </section>
        <div class="byte-runner-html-insertion" data-brh-insertion></div>
        <div class="byte-runner-html-toast" data-brh-toast></div>

        <div class="byte-runner-html-panel" data-brh-difficulty>
          <div class="byte-runner-html-card">
            <div class="byte-runner-html-logo">&lt;/&gt;</div><p class="byte-runner-html-kicker">G8CODE ARCADE · ORIGINAL RUNNER</p>
            <h2>BYTE RUNNER: HTML RUSH</h2>
            <p>Read the HTML challenge, pick the correct lane, then run, jump, or slide through the answer in a bright three-track city rush.</p>
            <div class="byte-runner-html-controls"><span>← → / A D · LANES</span><span>↑ / W / SPACE · JUMP</span><span>↓ / S · SLIDE</span><span>PHONE · SWIPE</span></div>
            <div class="byte-runner-html-difficulties">
              <button class="byte-runner-html-difficulty easy" data-brh-difficulty-key="easy"><strong>EASY · COMPLETE = 5 XP</strong><span>3 hearts · Beginner HTML</span><small>Slower runner, longer reading window, clear distractors.</small></button>
              <button class="byte-runner-html-difficulty medium" data-brh-difficulty-key="medium"><strong>MEDIUM · COMPLETE = 10 XP</strong><span>3 hearts · Attributes + nesting</span><small>More obstacles and shorter reaction time.</small></button>
              <button class="byte-runner-html-difficulty hard" data-brh-difficulty-key="hard"><strong>HARD · COMPLETE = 15 XP</strong><span>2 hearts · Semantic HTML</span><small>Faster patterns, similar distractors, longer page.</small></button>
              <button class="byte-runner-html-difficulty difficult" data-brh-difficulty-key="difficult"><strong>DIFFICULT · COMPLETE = 20 XP</strong><span>2 hearts · Mixed advanced challenges</span><small>Fastest fair speed and the highest performance ceiling.</small></button>
            </div>
            <p>Complete the validated mission to earn the listed XP. All Mini-Game XP still shares the existing 50 XP daily account cap.</p>
          </div>
        </div>

        <div class="byte-runner-html-panel" data-brh-mission hidden>
          <div class="byte-runner-html-card narrow">
            <div class="byte-runner-html-logo">01</div><p class="byte-runner-html-kicker">NEW HTML MISSION</p>
            <h2 data-brh-mission-name>Build a Personal Profile</h2>
            <div class="byte-runner-html-mission-box"><strong data-brh-mission-difficulty>EASY · 8 decisions</strong><small>Correct answers insert real HTML into your page.</small></div>
            <p>Action rule: RUN accepts running, jumping, or sliding. JUMP requires a jump. SLIDE requires an active slide. The gate shape always shows the required move.</p>
            <div class="byte-runner-html-actions"><button type="button" class="secondary" data-brh-change-difficulty>CHANGE DIFFICULTY</button><button type="button" class="primary" data-brh-begin>START MISSION</button></div>
          </div>
        </div>

        <div class="byte-runner-html-panel" data-brh-countdown hidden>
          <div class="byte-runner-html-card narrow"><p class="byte-runner-html-kicker">MISSION LOADED</p><h2 data-brh-countdown-title>HTML RUSH</h2><div class="byte-runner-html-countdown" data-brh-countdown-number>3</div><p>Get ready to run.</p></div>
        </div>

        <div class="byte-runner-html-panel" data-brh-pause-panel hidden>
          <div class="byte-runner-html-card narrow"><div class="byte-runner-html-logo">Ⅱ</div><h2>PAUSED</h2><p>The world is frozen. You will not be hit while the game is paused.</p><button type="button" class="primary" data-brh-resume>RESUME</button></div>
        </div>

        <div class="byte-runner-html-panel" data-brh-result hidden>
          <div class="byte-runner-html-card byte-runner-html-result">
            <div class="byte-runner-html-result-head"><p class="byte-runner-html-kicker">HTML PAGE COMPLETE!</p><h2 data-brh-result-mission>MISSION COMPLETE</h2><span class="byte-runner-html-perfect" data-brh-perfect>⚡ PERFECT SYNTAX!</span></div>
            <div class="byte-runner-html-result-grid">
              <div><small>Difficulty</small><strong data-brh-result-difficulty>HARD</strong></div>
              <div><small>Challenges</small><strong data-brh-result-challenges>12/12</strong></div>
              <div><small>Accuracy</small><strong data-brh-result-accuracy>100%</strong></div>
              <div><small>Longest Combo</small><strong data-brh-result-combo>x12</strong></div>
              <div><small>Hearts</small><strong data-brh-result-hearts>2</strong></div>
              <div><small>Distance</small><strong data-brh-result-distance>0m</strong></div>
              <div><small>Arcade Score</small><strong data-brh-result-score>0</strong></div>
              <div class="xp"><small>Performance XP</small><strong data-brh-result-xp>+0 XP</strong></div>
            </div>
            <p class="byte-runner-html-reward-note" data-brh-result-note>Checking reward…</p>
            <div class="byte-runner-html-output">
              <section><h3>COMPLETED SOURCE</h3><pre class="byte-runner-html-source" data-brh-result-source></pre></section>
              <section><h3>RENDERED PAGE PREVIEW</h3><iframe class="byte-runner-html-preview" data-brh-result-preview sandbox="" title="Completed HTML page preview"></iframe></section>
            </div>
            <ul class="byte-runner-html-mistakes" data-brh-mistakes></ul>
            <div class="byte-runner-html-actions"><button type="button" class="primary" data-brh-next>NEW MISSION</button><button type="button" class="secondary" data-brh-replay>PLAY AGAIN</button><button type="button" class="secondary" data-brh-result-difficulty-btn>CHANGE DIFFICULTY</button><button type="button" data-brh-result-exit>EXIT</button></div>
          </div>
        </div>

        <div class="byte-runner-html-panel" data-brh-gameover hidden>
          <div class="byte-runner-html-card narrow"><div class="byte-runner-html-logo">!</div><p class="byte-runner-html-kicker">RUN ENDED</p><h2>SYSTEM BREACHED</h2><p>Your HTML mission was not completed. Retry it or lower the difficulty.</p>
            <div class="byte-runner-html-gameover-grid"><div><small>HTML Progress</small><strong data-brh-over-progress>0/8</strong></div><div><small>Accuracy</small><strong data-brh-over-accuracy>0%</strong></div><div><small>Score</small><strong data-brh-over-score>0</strong></div><div><small>Distance</small><strong data-brh-over-distance>0m</strong></div><div><small>Longest Combo</small><strong data-brh-over-combo>x0</strong></div><div><small>XP</small><strong data-brh-over-xp>+0</strong></div></div>
            <p class="byte-runner-html-reward-note" data-brh-over-note>No XP is awarded for an incomplete mission.</p>
            <div class="byte-runner-html-actions"><button type="button" class="primary" data-brh-try-again>TRY AGAIN</button><button type="button" class="secondary" data-brh-over-difficulty>CHANGE DIFFICULTY</button><button type="button" data-brh-over-exit>EXIT</button></div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    runtime.overlay = overlay;
    runtime.shell = overlay.querySelector('.byte-runner-html-shell');
    runtime.canvas = overlay.querySelector('.byte-runner-html-canvas');
    runtime.ctx = runtime.canvas.getContext('2d', { alpha:false, desynchronized:true });
    runtime.soundBtn = overlay.querySelector('[data-brh-sound]');
    runtime.pauseBtn = overlay.querySelector('[data-brh-pause]');
    runtime.statScore = overlay.querySelector('[data-brh-score]'); runtime.statDistance = overlay.querySelector('[data-brh-distance]'); runtime.statCombo = overlay.querySelector('[data-brh-combo]'); runtime.statHearts = overlay.querySelector('[data-brh-hearts]'); runtime.statHtml = overlay.querySelector('[data-brh-html]');
    runtime.questionBox = overlay.querySelector('[data-brh-question]'); runtime.qType = overlay.querySelector('[data-brh-qtype]'); runtime.qAction = overlay.querySelector('[data-brh-qaction]'); runtime.qPrompt = overlay.querySelector('[data-brh-qprompt]'); runtime.qCode = overlay.querySelector('[data-brh-qcode]'); runtime.qChoices = overlay.querySelector('[data-brh-qchoices]');
    runtime.buildProgress = overlay.querySelector('[data-brh-build-progress]'); runtime.buildCount = overlay.querySelector('[data-brh-build-count]'); runtime.buildCode = overlay.querySelector('[data-brh-build-code]'); runtime.insertion = overlay.querySelector('[data-brh-insertion]'); runtime.toast = overlay.querySelector('[data-brh-toast]');
    runtime.difficultyPanel = overlay.querySelector('[data-brh-difficulty]'); runtime.missionPanel = overlay.querySelector('[data-brh-mission]'); runtime.missionName = overlay.querySelector('[data-brh-mission-name]'); runtime.missionDifficulty = overlay.querySelector('[data-brh-mission-difficulty]'); runtime.countdownEl = overlay.querySelector('[data-brh-countdown]'); runtime.pausePanel = overlay.querySelector('[data-brh-pause-panel]'); runtime.resultPanel = overlay.querySelector('[data-brh-result]'); runtime.gameOverPanel = overlay.querySelector('[data-brh-gameover]');
    runtime.resultMission = overlay.querySelector('[data-brh-result-mission]'); runtime.resultDifficulty = overlay.querySelector('[data-brh-result-difficulty]'); runtime.resultChallenges = overlay.querySelector('[data-brh-result-challenges]'); runtime.resultAccuracy = overlay.querySelector('[data-brh-result-accuracy]'); runtime.resultCombo = overlay.querySelector('[data-brh-result-combo]'); runtime.resultHearts = overlay.querySelector('[data-brh-result-hearts]'); runtime.resultDistance = overlay.querySelector('[data-brh-result-distance]'); runtime.resultScore = overlay.querySelector('[data-brh-result-score]'); runtime.resultXp = overlay.querySelector('[data-brh-result-xp]'); runtime.resultRewardNote = overlay.querySelector('[data-brh-result-note]'); runtime.resultSource = overlay.querySelector('[data-brh-result-source]'); runtime.resultPreview = overlay.querySelector('[data-brh-result-preview]'); runtime.resultPerfect = overlay.querySelector('[data-brh-perfect]'); runtime.mistakesList = overlay.querySelector('[data-brh-mistakes]');
    runtime.overProgress = overlay.querySelector('[data-brh-over-progress]'); runtime.overAccuracy = overlay.querySelector('[data-brh-over-accuracy]'); runtime.overScore = overlay.querySelector('[data-brh-over-score]'); runtime.overDistance = overlay.querySelector('[data-brh-over-distance]'); runtime.overCombo = overlay.querySelector('[data-brh-over-combo]'); runtime.overXp = overlay.querySelector('[data-brh-over-xp]'); runtime.overNote = overlay.querySelector('[data-brh-over-note]');

    overlay.querySelector('[data-brh-back]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-brh-close]').addEventListener('click', closeAll);
    runtime.soundBtn.addEventListener('click', toggleSound);
    runtime.pauseBtn.addEventListener('click', togglePause);
    overlay.querySelectorAll('[data-brh-difficulty-key]').forEach(button => button.addEventListener('click', () => selectDifficulty(button.dataset.brhDifficultyKey)));
    overlay.querySelector('[data-brh-change-difficulty]').addEventListener('click', showDifficultySelect);
    overlay.querySelector('[data-brh-begin]').addEventListener('click', beginCountdown);
    overlay.querySelector('[data-brh-resume]').addEventListener('click', resumeGame);
    overlay.querySelector('[data-brh-next]').addEventListener('click', startNextMission);
    overlay.querySelector('[data-brh-replay]').addEventListener('click', replayMission);
    overlay.querySelector('[data-brh-result-difficulty-btn]').addEventListener('click', showDifficultySelect);
    overlay.querySelector('[data-brh-result-exit]').addEventListener('click', returnToHub);
    overlay.querySelector('[data-brh-try-again]').addEventListener('click', replayMission);
    overlay.querySelector('[data-brh-over-difficulty]').addEventListener('click', showDifficultySelect);
    overlay.querySelector('[data-brh-over-exit]').addEventListener('click', returnToHub);

    window.addEventListener('resize', scheduleResize, { passive:true });
    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('visibilitychange', onVisibilityChange);
    runtime.canvas.addEventListener('pointerdown', onPointerDown, { passive:false });
    runtime.canvas.addEventListener('pointermove', onPointerMove, { passive:false });
    runtime.canvas.addEventListener('pointerup', onPointerUp, { passive:false });
    runtime.canvas.addEventListener('pointercancel', onPointerCancel, { passive:false });
    runtime.built = true;
  }

  function setText(node, value) { const text=String(value); if (node && node.textContent !== text) node.textContent=text; }

  function resizeCanvas() {
    if (!runtime.shell || !runtime.canvas || !runtime.ctx) return;
    const rect = runtime.shell.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width));
    const h = Math.max(360, Math.floor(rect.height));
    const dprCap = w <= 700 ? 1.35 : MAX_DPR;
    const dpr = Math.min(dprCap, Math.max(1, window.devicePixelRatio || 1));
    runtime.view = {w,h,dpr};
    runtime.canvas.width = Math.round(w*dpr); runtime.canvas.height = Math.round(h*dpr);
    runtime.canvas.style.width = `${w}px`; runtime.canvas.style.height = `${h}px`;
    runtime.ctx.setTransform(dpr,0,0,dpr,0,0);
    runtime.skyGradient = runtime.ctx.createLinearGradient(0,0,0,h);
    runtime.skyGradient.addColorStop(0,'#58b9f3'); runtime.skyGradient.addColorStop(.48,'#9edcf6'); runtime.skyGradient.addColorStop(1,'#e8f7fb');
    const horizon=h*(w <= 700 ? .365 : .315);
    runtime.roadGradient = runtime.ctx.createLinearGradient(0,horizon,0,h);
    runtime.roadGradient.addColorStop(0,'#5e6c72'); runtime.roadGradient.addColorStop(.55,'#46545b'); runtime.roadGradient.addColorStop(1,'#303c42');
    runtime.horizonGlow = runtime.ctx.createRadialGradient(w*.5,horizon,2,w*.5,horizon,w*.42);
    runtime.horizonGlow.addColorStop(0,'rgba(255,248,196,.46)'); runtime.horizonGlow.addColorStop(.48,'rgba(255,255,255,.12)'); runtime.horizonGlow.addColorStop(1,'rgba(255,255,255,0)');
  }

  function scheduleResize() {
    clearTimeout(runtime.resizeTimer);
    runtime.resizeTimer = window.setTimeout(resizeCanvas, 90);
  }

  function ensureAudio() {
    if (!runtime.soundEnabled) return null;
    if (!runtime.audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { runtime.audioContext = new AC(); } catch (_) { return null; }
    }
    if (runtime.audioContext.state === 'suspended') runtime.audioContext.resume().catch(()=>{});
    return runtime.audioContext;
  }

  function tone(kind='move') {
    const audio = ensureAudio(); if (!audio) return;
    const map = {
      move:[260,.035,.020,'square'], jump:[480,.08,.035,'sine'], land:[150,.05,.026,'triangle'], slide:[190,.06,.022,'sawtooth'],
      good:[760,.10,.045,'sine'], bad:[115,.16,.045,'sawtooth'], pickup:[920,.07,.032,'sine'], shield:[560,.15,.035,'triangle'],
      combo:[1040,.10,.032,'sine'], complete:[880,.22,.055,'triangle'], beat:[82,.035,.008,'sine']
    };
    const [freq,dur,vol,type] = map[kind] || map.move;
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type=type; osc.frequency.setValueAtTime(freq,audio.currentTime);
    if (kind==='good' || kind==='complete') osc.frequency.exponentialRampToValueAtTime(freq*1.35,audio.currentTime+dur);
    gain.gain.setValueAtTime(.0001,audio.currentTime); gain.gain.exponentialRampToValueAtTime(__ict8SfxGain(vol),audio.currentTime+.008); gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);
    osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime+dur+.02);
  }

  function toggleSound() {
    runtime.soundEnabled = !runtime.soundEnabled;
    runtime.soundBtn.textContent = runtime.soundEnabled ? '🔊' : '🔇';
    try { runtime.bridge?.setSoundEnabled?.(runtime.soundEnabled); } catch (_) {}
    if (runtime.soundEnabled) tone('pickup');
  }

  function showDifficultySelect() {
    cancelUnclaimedRound();
    runtime.state='DIFFICULTY_SELECT';
    runtime.difficultyPanel.hidden=false; runtime.missionPanel.hidden=true; runtime.countdownEl.hidden=true; runtime.pausePanel.hidden=true; runtime.resultPanel.hidden=true; runtime.gameOverPanel.hidden=true; runtime.questionBox.hidden=true;
    runtime.pauseBtn.textContent='Ⅱ';
  }

  function selectDifficulty(key) {
    const difficulty = DIFFICULTIES[key] || DIFFICULTIES.easy;
    runtime.difficulty = difficulty;
    runtime.mission = buildMission(difficulty.key);
    runtime.state='MISSION_INTRO';
    runtime.difficultyPanel.hidden=true; runtime.missionPanel.hidden=false; runtime.resultPanel.hidden=true; runtime.gameOverPanel.hidden=true; runtime.questionBox.hidden=true;
    setText(runtime.missionName, `Build: ${runtime.mission.title}`);
    setText(runtime.missionDifficulty, `${difficulty.label} · ${difficulty.steps} coding decisions · ${difficulty.maxXp} XP on completion`);
    resetRunData(false);
    updateHud(true); updateBuildDock();
  }

  function startNextMission() {
    cancelUnclaimedRound();
    runtime.mission = buildMission(runtime.difficulty.key);
    runtime.state='MISSION_INTRO';
    runtime.resultPanel.hidden=true; runtime.gameOverPanel.hidden=true; runtime.missionPanel.hidden=false; runtime.questionBox.hidden=true;
    setText(runtime.missionName, `Build: ${runtime.mission.title}`);
    setText(runtime.missionDifficulty, `${runtime.difficulty.label} · ${runtime.difficulty.steps} coding decisions · ${runtime.difficulty.maxXp} XP on completion`);
    resetRunData(false); updateHud(true);
  }

  function replayMission() {
    cancelUnclaimedRound();
    runtime.state='MISSION_INTRO'; runtime.resultPanel.hidden=true; runtime.gameOverPanel.hidden=true; runtime.missionPanel.hidden=false; runtime.questionBox.hidden=true;
    resetRunData(false); updateHud(true);
  }

  function resetRunData(clearMission=false) {
    if (clearMission) runtime.mission=null;
    const d=runtime.difficulty || DIFFICULTIES.easy;
    runtime.round=null; runtime.rewardSubmitting=false; runtime.speed=d.startSpeed; runtime.distance=0; runtime.arcadeScore=0; runtime.performanceScore=0; runtime.activeTimeMs=0; runtime.hearts=d.hearts; runtime.shield=0; runtime.invulnerable=0; runtime.combo=0; runtime.longestCombo=0; runtime.correctAnswers=0; runtime.wrongAnswers=0; runtime.obstacleHits=0; runtime.collectibles=0; runtime.completedSteps=0; runtime.stepAttempt=0; runtime.currentChallenge=null; runtime.questionPhase='none'; runtime.questionTimer=0; runtime.questionWait=2.15; runtime.questionPending=false; runtime.feedbackClock=0; runtime.gateGroup=null; runtime.lane=1; runtime.lanePos=1; runtime.laneShiftCooldown=0; runtime.jumpY=0; runtime.jumpVy=0; runtime.slideTime=0; runtime.stumbleTime=0; runtime.landingKick=0; runtime.cameraKick=0; runtime.obstacleClock=1.1; runtime.collectibleClock=2.4; runtime.obstacles.length=0; runtime.pickups.length=0; runtime.laneHistory.length=0; runtime.motionHistory.length=0; runtime.challengeHistory.clear(); runtime.mistakes.length=0; runtime.pointer=null; runtime.countdownClock=0; runtime.countdownStage=3; runtime.musicClock=.35; runtime.toastClock=0; runtime.clearFxTime=0; runtime.clearFxKind='';
    for (const p of runtime.particles) p.active=false;
    updateBuildHud();
  }

  function beginCountdown() {
    if (!runtime.mission) runtime.mission = buildMission(runtime.difficulty.key);
    resetRunData(false);
    runtime.state='COUNTDOWN'; runtime.missionPanel.hidden=true; runtime.countdownEl.hidden=false; runtime.difficultyPanel.hidden=true; runtime.resultPanel.hidden=true; runtime.gameOverPanel.hidden=true;
    setText(runtime.countdownEl.querySelector('[data-brh-countdown-title]'), `${runtime.mission.title} · ${runtime.difficulty.label}`);
    runtime.countdownClock=3.35; runtime.countdownStage=3; setText(runtime.countdownEl.querySelector('[data-brh-countdown-number]'),'3');
    runtime.lastFrame=performance.now(); tone('pickup'); startLoop();
  }

  function startRunning() {
    try { runtime.round = runtime.bridge?.beginRound?.(GAME_ID) || null; } catch (_) { runtime.round=null; }
    runtime.state='RUNNING'; runtime.countdownEl.hidden=true; runtime.questionBox.hidden=true; runtime.lastFrame=performance.now();
    try { runtime.canvas.focus({preventScroll:true}); } catch (_) {}
    showToast(`MISSION START · ${runtime.mission.title}`,'combo',1.15);
  }

  function updateCountdown(dt) {
    runtime.countdownClock -= dt;
    const next = runtime.countdownClock > 2.3 ? 3 : runtime.countdownClock > 1.3 ? 2 : runtime.countdownClock > .35 ? 1 : 0;
    if (next !== runtime.countdownStage) {
      runtime.countdownStage=next;
      setText(runtime.countdownEl.querySelector('[data-brh-countdown-number]'), next ? String(next) : 'RUN!');
      tone(next ? 'pickup' : 'good');
    }
    if (runtime.countdownClock <= 0) startRunning();
  }

  function shiftLane(direction) {
    if (runtime.state !== 'RUNNING' || runtime.laneShiftCooldown > 0) return;
    const next = clamp(runtime.lane + (direction < 0 ? -1 : 1), 0, 2);
    if (next === runtime.lane) return;
    runtime.lane=next; runtime.laneShiftCooldown=.09; tone('move');
  }

  function jump() {
    if (runtime.state !== 'RUNNING' || runtime.jumpY > .015 || runtime.jumpVy > .01 || runtime.slideTime > .05) return;
    runtime.jumpVy=JUMP_LAUNCH_VELOCITY; runtime.jumpY=.02; tone('jump');
  }

  function slide() {
    if (runtime.state !== 'RUNNING' || runtime.jumpY > .06 || runtime.jumpVy > .1 || runtime.slideTime > .05) return;
    runtime.slideTime=SLIDE_DURATION; tone('slide');
  }

  function onKeyDown(event) {
    if (!runtime.open) return;
    if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const key=String(event.key||'').toLowerCase();
    const activeKeys=['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s',' ','p','escape'];
    if (!activeKeys.includes(key)) return;
    if (runtime.state==='RUNNING' || runtime.state==='PAUSED') event.preventDefault();
    if (key==='escape') { returnToHub(); return; }
    if (key==='p') { togglePause(); return; }
    if (runtime.state!=='RUNNING') return;
    if (key==='arrowleft'||key==='a') shiftLane(-1);
    else if (key==='arrowright'||key==='d') shiftLane(1);
    else if (key==='arrowup'||key==='w'||key===' ') jump();
    else if (key==='arrowdown'||key==='s') slide();
  }

  function onPointerDown(event) {
    if (!runtime.open || runtime.state!=='RUNNING') return;
    runtime.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,triggered:false};
    try { runtime.canvas.setPointerCapture(event.pointerId); } catch (_) {}
    event.preventDefault();
  }

  function onPointerMove(event) {
    const p=runtime.pointer; if (!p || p.id!==event.pointerId || p.triggered || runtime.state!=='RUNNING') return;
    const dx=event.clientX-p.x, dy=event.clientY-p.y; const ax=Math.abs(dx), ay=Math.abs(dy); const threshold=26;
    if (Math.max(ax,ay)<threshold) { event.preventDefault(); return; }
    p.triggered=true;
    if (ax>ay*1.12) shiftLane(dx<0?-1:1); else if (ay>ax*.82) { if (dy<0) jump(); else slide(); }
    event.preventDefault();
  }

  function onPointerUp(event) { if (runtime.pointer?.id===event.pointerId) runtime.pointer=null; if (runtime.state==='RUNNING') event.preventDefault(); }
  function onPointerCancel(event) { if (runtime.pointer?.id===event.pointerId) runtime.pointer=null; }

  function togglePause() { if (runtime.state==='RUNNING') pauseGame('button'); else if (runtime.state==='PAUSED') resumeGame(); }
  function pauseGame(reason='pause') {
    if (runtime.state!=='RUNNING') return;
    runtime.pauseFrom='RUNNING'; runtime.state='PAUSED'; runtime.pausePanel.hidden=false; runtime.pauseBtn.textContent='▶'; runtime.pointer=null; showToast(reason==='visibility'?'TAB PAUSED SAFELY':'PAUSED','',.8);
  }
  function resumeGame() {
    if (runtime.state!=='PAUSED') return;
    runtime.state=runtime.pauseFrom||'RUNNING'; runtime.pauseFrom=''; runtime.pausePanel.hidden=true; runtime.pauseBtn.textContent='Ⅱ'; runtime.lastFrame=performance.now();
    try { runtime.canvas.focus({preventScroll:true}); } catch (_) {}
  }
  function onVisibilityChange() { if (document.hidden && runtime.state==='RUNNING') pauseGame('visibility'); }

  function startQuestionPreview() {
    runtime.currentChallenge=nextChallenge(); if (!runtime.currentChallenge) return;
    runtime.questionPhase='preview'; runtime.questionTimer=runtime.difficulty.preview; runtime.questionPending=false; runtime.gateGroup=null;
    runtime.questionBox.hidden=false; setText(runtime.qType,runtime.currentChallenge.type); setText(runtime.qPrompt,runtime.currentChallenge.prompt); setText(runtime.qCode,runtime.currentChallenge.code);
    const actionText = runtime.currentChallenge.motion==='jump' ? '↑ JUMP' : runtime.currentChallenge.motion==='slide' ? '↓ SLIDE' : 'RUN · ANY MOVE';
    runtime.questionBox.dataset.motion=runtime.currentChallenge.motion; runtime.qAction.dataset.motion=runtime.currentChallenge.motion;
    setText(runtime.qAction,actionText);
    runtime.qChoices.innerHTML='<span class="byte-runner-html-choice wait">READ FIRST · ANSWER GATES INCOMING…</span>';
  }

  function currentRunnerAction() {
    if (runtime.slideTime > .055 && runtime.jumpY < .08) return 'slide';
    if (runtime.jumpY > .12 || (runtime.jumpY >= .015 && Math.abs(runtime.jumpVy) > .55)) return 'jump';
    return 'run';
  }

  function launchAnswerGates() {
    const challenge=runtime.currentChallenge; if (!challenge) return;
    const assigned=assignChoiceLanes(challenge);
    runtime.gateGroup={
      z:Z_MAX,
      correctLane:assigned.correctLane,
      lanes:assigned.lanes,
      resolved:false,
      flash:'',
      motion:challenge.motion,
      resolution:'',
      selectedLane:-1,
      postResolveAge:0,
      impactHold:0,
      alpha:1
    };
    runtime.questionPhase='approach'; runtime.questionTimer=0;
    runtime.qChoices.innerHTML=assigned.lanes.map((answer,lane)=>`<span class="byte-runner-html-choice"><b>${['L','C','R'][lane]}</b>${escapeText(answer)}</span>`).join('');
    tone('pickup');
  }

  function resolveAnswer() {
    const group=runtime.gateGroup, challenge=runtime.currentChallenge;
    if (!group || group.resolved || !challenge) return;
    group.resolved=true;
    group.postResolveAge=0;
    const playerLane=clamp(Math.round(runtime.lanePos),0,2);
    const laneLocked=Math.abs(runtime.lanePos-playerLane)<.50;
    const playerAction=currentRunnerAction();
    // RUN is intentionally permissive: running, jumping, or sliding through the
    // correct open portal is safe. JUMP and SLIDE are strict action checks.
    const actionOk = challenge.motion==='run' ? true : playerAction===challenge.motion;
    const correct = laneLocked && playerLane===group.correctLane && actionOk;
    group.selectedLane=playerLane; group.playerAction=playerAction;
    group.resolution=correct?'correct':'wrong';
    group.impactHold=correct?0:.12;
    if (correct) handleCorrectAnswer(group); else handleWrongAnswer(group, playerLane, actionOk);
  }

  function handleCorrectAnswer(group) {
    runtime.correctAnswers+=1; runtime.completedSteps+=1; runtime.combo+=1; runtime.longestCombo=Math.max(runtime.longestCombo,runtime.combo); runtime.stepAttempt=0;
    runtime.arcadeScore += 650 + runtime.combo*55 + Math.round(runtime.speed*7);
    group.flash='good'; group.resolution='correct'; runtime.feedbackClock=.60; runtime.questionPhase='feedback'; tone('good');
    burstAtGate(group.correctLane,'good',18); animateInsertion(runtime.currentChallenge.codeInsertion); const passMove=runtime.currentChallenge.motion==='run'?(group.playerAction==='jump'?'JUMP THROUGH ✓':group.playerAction==='slide'?'SLIDE THROUGH ✓':'RUN THROUGH ✓'):(runtime.currentChallenge.motion==='jump'?'CLEAN JUMP ✓':'CLEAN SLIDE ✓'); showToast(runtime.combo>=5?'CODE FLOW!':passMove,runtime.combo>=3?'combo':'good',.78);
    updateBuildHud();
  }

  function consumeDamage(kind='obstacle') {
    if (runtime.invulnerable>0) return false;
    runtime.invulnerable=1.05; runtime.stumbleTime=.42; runtime.cameraKick=1;
    if (runtime.shield>0) { runtime.shield=0; tone('shield'); showToast('DEBUGGER SHIELD BLOCKED DAMAGE','combo',.95); return false; }
    runtime.hearts=Math.max(0,runtime.hearts-1); tone('bad'); return true;
  }

  function handleWrongAnswer(group, playerLane, actionOk) {
    runtime.wrongAnswers+=1; runtime.combo=0; runtime.stepAttempt+=1; group.flash='bad'; group.resolution='wrong'; group.selectedLane=playerLane; runtime.feedbackClock=.72; runtime.questionPhase='feedback';
    const chosen=group.lanes[playerLane] || 'No gate'; const reason=playerLane===group.correctLane&&!actionOk?`Correct lane, but ${runtime.currentChallenge.motion.toUpperCase()} was required. ${group.playerAction.toUpperCase()} is not safe for this gate.`:`${chosen} was not the correct answer.`;
    runtime.mistakes.push({prompt:runtime.currentChallenge.prompt,chosen,correct:runtime.currentChallenge.correct,reason:runtime.currentChallenge.explanation,actionReason:reason});
    consumeDamage('answer'); burstAtGate(playerLane,'bad',15); showToast('CODE ERROR!','bad',.72);
    if (runtime.hearts<=0) runtime.feedbackClock=.40;
  }

  function animateInsertion(code) {
    if (!runtime.insertion) return;
    runtime.insertion.classList.remove('show'); void runtime.insertion.offsetWidth;
    runtime.insertion.textContent=String(code||'').split('\n')[0].slice(0,72); runtime.insertion.classList.add('show');
  }

  function updateQuestion(dt) {
    if (runtime.questionPhase==='preview') {
      runtime.questionTimer-=dt; if (runtime.questionTimer<=0) launchAnswerGates(); return;
    }
    if (runtime.questionPhase==='approach' && runtime.gateGroup) {
      runtime.gateGroup.z -= runtime.speed*dt;
      if (runtime.gateGroup.z<=GATE_TRIGGER_Z) resolveAnswer();
      return;
    }
    if (runtime.questionPhase==='feedback') {
      const group=runtime.gateGroup;
      if (group) {
        group.postResolveAge=(group.postResolveAge||0)+dt;
        if (group.impactHold>0) {
          group.impactHold=Math.max(0,group.impactHold-dt);
          group.z-=runtime.speed*dt*.12;
        } else {
          group.z-=runtime.speed*dt*(group.resolution==='correct'?1.34:1.72);
        }
        const fadeWindow=group.resolution==='correct'?.48:.56;
        group.alpha=clamp(1-group.postResolveAge/fadeWindow,0,1);
        if (group.z<(group.resolution==='correct'?-5:-4) || group.alpha<=.02) runtime.gateGroup=null;
      }
      runtime.feedbackClock-=dt;
      if (runtime.feedbackClock<=0) {
        runtime.gateGroup=null; runtime.currentChallenge=null; runtime.questionBox.hidden=true; runtime.questionBox.removeAttribute('data-motion'); runtime.questionPhase='none'; runtime.questionWait=runtime.difficulty.betweenQuestions; runtime.questionPending=false;
        if (runtime.hearts<=0) { endRun(false); return; }
        if (runtime.completedSteps>=runtime.difficulty.steps) { endRun(true); return; }
      }
    }
  }

  function chooseObstacleType(preferJump = false) {
    const r = Math.random();
    if (preferJump) return r < .48 ? 'crate' : r < .75 ? 'wall' : 'beam';
    return r < .40 ? 'crate' : r < .68 ? 'wall' : 'beam';
  }

  function pushObstacle(lane, z, type) {
    runtime.obstacles.push({ lane, z, type, resolved:false, outcome:'', postResolveAge:0 });
  }

  function spawnObstaclePattern() {
    const d = runtime.difficulty;
    const tier = d.key === 'easy' ? 0 : d.key === 'medium' ? 1 : d.key === 'hard' ? 2 : 3;
    const roll = Math.random();

    if (tier === 0) {
      if (roll < .58) {
        pushObstacle(Math.floor(Math.random()*3), Z_MAX, chooseObstacleType(true));
        if (Math.random() < .18) {
          let lane2 = Math.floor(Math.random()*3);
          const lane1 = runtime.obstacles[runtime.obstacles.length - 1].lane;
          if (lane2 === lane1) lane2 = (lane2 + 1) % 3;
          pushObstacle(lane2, Z_MAX + 18, chooseObstacleType(false));
        }
      } else if (roll < .84) {
        const openLane = Math.floor(Math.random()*3);
        const type = Math.random() < .52 ? 'wall' : chooseObstacleType(false);
        for (let lane = 0; lane < 3; lane += 1) if (lane !== openLane) pushObstacle(lane, Z_MAX + (lane === 2 ? 1.2 : 0), type);
      } else {
        const order = [0,1,2].sort(() => Math.random() - .5);
        pushObstacle(order[0], Z_MAX, 'crate');
        pushObstacle(order[1], Z_MAX + 20, 'beam');
      }
    } else if (tier === 1) {
      if (roll < .42) {
        pushObstacle(Math.floor(Math.random()*3), Z_MAX, chooseObstacleType(true));
        if (Math.random() < .34) {
          let lane2 = Math.floor(Math.random()*3); const lane1 = runtime.obstacles[runtime.obstacles.length - 1].lane;
          if (lane2 === lane1) lane2 = (lane2 + 1) % 3;
          pushObstacle(lane2, Z_MAX + 17, chooseObstacleType(false));
        }
      } else if (roll < .74) {
        const openLane = Math.floor(Math.random()*3);
        const type = chooseObstacleType(false);
        for (let lane = 0; lane < 3; lane += 1) if (lane !== openLane) pushObstacle(lane, Z_MAX + lane * .9, type);
      } else {
        const order = [0,1,2].sort(() => Math.random() - .5);
        pushObstacle(order[0], Z_MAX, chooseObstacleType(true));
        pushObstacle(order[1], Z_MAX + 16, chooseObstacleType(false));
        pushObstacle(order[2], Z_MAX + 32, chooseObstacleType(true));
      }
    } else if (tier === 2) {
      if (roll < .32) {
        pushObstacle(Math.floor(Math.random()*3), Z_MAX, chooseObstacleType(true));
        if (Math.random() < .44) {
          let lane2 = Math.floor(Math.random()*3);
          const lane1 = runtime.obstacles[runtime.obstacles.length - 1].lane;
          if (lane2 === lane1) lane2 = (lane2 + 1) % 3;
          pushObstacle(lane2, Z_MAX + 15, chooseObstacleType(false));
        }
      } else if (roll < .63) {
        const openLane = Math.floor(Math.random()*3);
        const type = Math.random() < .48 ? 'wall' : chooseObstacleType(false);
        for (let lane = 0; lane < 3; lane += 1) if (lane !== openLane) pushObstacle(lane, Z_MAX + lane * .8, type);
        if (Math.random() < .40) pushObstacle(openLane, Z_MAX + 24, type === 'beam' ? 'crate' : 'beam');
      } else {
        const sequence = [0,1,2].sort(() => Math.random() - .5);
        pushObstacle(sequence[0], Z_MAX, chooseObstacleType(true));
        pushObstacle(sequence[1], Z_MAX + 14, chooseObstacleType(false));
        pushObstacle(sequence[2], Z_MAX + 28, chooseObstacleType(true));
      }
    } else {
      if (roll < .24) {
        pushObstacle(Math.floor(Math.random()*3), Z_MAX, chooseObstacleType(true));
        let lane2 = Math.floor(Math.random()*3);
        const lane1 = runtime.obstacles[runtime.obstacles.length - 1].lane;
        if (lane2 === lane1) lane2 = (lane2 + 1) % 3;
        pushObstacle(lane2, Z_MAX + 14, chooseObstacleType(false));
        if (Math.random() < .30) {
          let lane3 = Math.floor(Math.random()*3);
          if (lane3 === lane2) lane3 = (lane3 + 1) % 3;
          pushObstacle(lane3, Z_MAX + 28, chooseObstacleType(true));
        }
      } else if (roll < .56) {
        const openLane = Math.floor(Math.random()*3);
        const type = Math.random() < .5 ? 'wall' : chooseObstacleType(false);
        for (let lane = 0; lane < 3; lane += 1) if (lane !== openLane) pushObstacle(lane, Z_MAX + lane * .8, type);
        if (Math.random() < .45) pushObstacle(openLane, Z_MAX + 22, type === 'beam' ? 'crate' : 'beam');
      } else {
        const sequence = [0,1,2].sort(() => Math.random() - .5);
        pushObstacle(sequence[0], Z_MAX, chooseObstacleType(true));
        pushObstacle(sequence[1], Z_MAX + 13, chooseObstacleType(false));
        pushObstacle(sequence[2], Z_MAX + 25, chooseObstacleType(true));
      }
    }

    runtime.lastObstaclePattern = `tier-${tier}`;
    runtime.obstacleClock = d.obstacleGap * (.80 + Math.random() * .24);
  }

  function spawnPickup() {
    const lane=Math.floor(Math.random()*3); const shieldChance=runtime.activeTimeMs>18000&&runtime.shield===0&&Math.random()<.12;
    runtime.pickups.push({lane,z:Z_MAX+4,type:shieldChance?'shield':'code',label:shieldChance?'DBG':pick(['</>','01','HTML','{}']),resolved:false,postResolveAge:0});
    runtime.collectibleClock=(shieldChance?13:3.8)+Math.random()*(shieldChance?6:3.2);
  }

  function updateWorldObjects(dt) {
    for (const obstacle of runtime.obstacles) {
      const moveScale=obstacle.resolved ? (obstacle.outcome==='hit'?2.25:1.18) : 1;
      obstacle.z-=runtime.speed*dt*moveScale;
      if (obstacle.resolved) obstacle.postResolveAge=(obstacle.postResolveAge||0)+dt;
      if (!obstacle.resolved && obstacle.z<=7.8) {
        obstacle.resolved=true; obstacle.postResolveAge=0;
        const laneHit=Math.abs(runtime.lanePos-obstacle.lane)<.43;
        if (laneHit) {
          const action=currentRunnerAction();
          const required=obstacle.type==='crate'?'jump':obstacle.type==='beam'?'slide':'dodge';
          const cleared=(required==='jump'&&action==='jump')||(required==='slide'&&action==='slide');
          obstacle.requiredAction=required; obstacle.playerAction=action;
          if (!cleared) {
            obstacle.outcome='hit'; runtime.obstacleHits+=1; runtime.combo=0;
            const lost=consumeDamage('obstacle'); burstAtGate(obstacle.lane,'bad',10);
            if (lost) showToast(obstacle.type==='crate'?'JUMP REQUIRED!':obstacle.type==='beam'?'SLIDE REQUIRED!':'CHANGE LANE!','bad',.72);
          } else {
            obstacle.outcome='cleared'; obstacle.clearAction=action; runtime.arcadeScore+=95; runtime.clearFxTime=.52; runtime.clearFxKind=action; burstAtGate(obstacle.lane,'good',6);
            showToast(action==='jump'?'CLEAN JUMP ✓':'SMOOTH SLIDE ✓','good',.52);
          }
        } else { obstacle.outcome='passed'; runtime.arcadeScore+=45; }
      }
    }
    runtime.obstacles=runtime.obstacles.filter(item=>item.z>-12 && !(item.resolved && item.postResolveAge>(item.outcome==='cleared'?.58:.32)));
    for (const item of runtime.pickups) {
      item.z-=runtime.speed*dt*(item.resolved?1.7:1);
      if (item.resolved) item.postResolveAge=(item.postResolveAge||0)+dt;
      if (!item.resolved && item.z<=7.6) {
        item.resolved=true; item.postResolveAge=0;
        if (Math.abs(runtime.lanePos-item.lane)<.45) {
          if (item.type==='shield') { runtime.shield=1; runtime.arcadeScore+=120; tone('shield'); showToast('DEBUGGER SHIELD READY','combo',.72); burstAtGate(item.lane,'shield',12); }
          else { runtime.collectibles+=1; runtime.arcadeScore+=35; tone('pickup'); burstAtGate(item.lane,'pickup',7); }
        }
      }
    }
    runtime.pickups=runtime.pickups.filter(item=>item.z>-7 && !(item.resolved && item.postResolveAge>.35));
  }

  function updatePlayer(dt) {
    runtime.laneShiftCooldown=Math.max(0,runtime.laneShiftCooldown-dt);
    const smooth=1-Math.exp(-12*dt); runtime.lanePos += (runtime.lane-runtime.lanePos)*smooth;
    if (runtime.jumpY>0 || runtime.jumpVy>0) {
      runtime.jumpVy-=JUMP_GRAVITY*dt; runtime.jumpY+=runtime.jumpVy*dt;
      if (runtime.jumpY<=PLAYER_GROUND_Y) { runtime.jumpY=0; if (runtime.jumpVy<-.5) { runtime.landingKick=.18; tone('land'); } runtime.jumpVy=0; }
    }
    runtime.slideTime=Math.max(0,runtime.slideTime-dt); runtime.clearFxTime=Math.max(0,runtime.clearFxTime-dt); runtime.stumbleTime=Math.max(0,runtime.stumbleTime-dt); runtime.invulnerable=Math.max(0,runtime.invulnerable-dt); runtime.landingKick=Math.max(0,runtime.landingKick-dt); runtime.cameraKick=Math.max(0,runtime.cameraKick-dt*4.8);
  }

  function updateParticles(dt) {
    for (const p of runtime.particles) if (p.active) { p.age+=dt; if (p.age>=p.ttl) {p.active=false;continue;} p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=45*dt; }
  }

  function allocParticle() { const p=runtime.particles.find(item=>!item.active); if (!p) return null; p.active=true; p.age=0; return p; }
  function burstAtGate(lane,kind,count=10) {
    const point=projectLane(lane,8,0); const actualCount=runtime.view.w<=700?Math.max(4,Math.ceil(count*.62)):count; for(let i=0;i<actualCount;i+=1){const p=allocParticle();if(!p)break;p.x=point.x+(Math.random()-.5)*35;p.y=point.y+(Math.random()-.5)*30;p.vx=(Math.random()-.5)*125;p.vy=-40-Math.random()*100;p.ttl=.45+Math.random()*.45;p.size=2+Math.random()*4;p.kind=kind;}
  }

  function updateRun(dt) {
    runtime.activeTimeMs += dt*1000; runtime.visualTime += dt; runtime.roadPulse += runtime.speed*dt;
    const accelScale=runtime.questionPhase==='approach'?.32:1; runtime.speed=Math.min(runtime.difficulty.maxSpeed,runtime.speed+runtime.difficulty.acceleration*accelScale*dt);
    runtime.distance += runtime.speed*dt*1.13; runtime.arcadeScore += runtime.speed*dt*1.35;
    updatePlayer(dt); updateParticles(dt); updateQuestion(dt);
    if (runtime.state!=='RUNNING') return;
    if (runtime.questionPhase==='none') {
      runtime.questionWait-=dt;
      if (runtime.questionWait<=0) runtime.questionPending=true;
      if (!runtime.questionPending) {
        runtime.obstacleClock-=dt; runtime.collectibleClock-=dt;
        if (runtime.obstacleClock<=0) spawnObstaclePattern();
        if (runtime.collectibleClock<=0) spawnPickup();
      } else if (runtime.obstacles.length===0) startQuestionPreview();
      updateWorldObjects(dt);
    } else {
      // Existing runner objects finish clearing, but no new obstacles spawn near questions.
      updateWorldObjects(dt);
    }
    runtime.musicClock-=dt;
    if (runtime.musicClock<=0) { tone('beat'); const pace=clamp(runtime.speed/runtime.difficulty.maxSpeed,.65,1); runtime.musicClock=.72-.22*pace; }
    if (runtime.toastClock>0) { runtime.toastClock-=dt; if(runtime.toastClock<=0) runtime.toast.classList.remove('show','good','bad','combo'); }
    updateBuildDock();
    updateHud();
  }

  function showToast(text,kind='',seconds=.7) {
    if (!runtime.toast) return; setText(runtime.toast,text); runtime.toast.className=`byte-runner-html-toast show${kind?` ${kind}`:''}`; runtime.toastClock=Math.max(.2,seconds);
  }

  function currentAccuracy() { const attempts=runtime.correctAnswers+runtime.wrongAnswers; return attempts?runtime.correctAnswers/attempts*100:0; }
  function isPerfectRun() { return runtime.completedSteps>=runtime.difficulty.steps && runtime.wrongAnswers===0 && runtime.obstacleHits===0; }

  function calculatePerformanceScore() {
    if (runtime.completedSteps<runtime.difficulty.steps) return 0;
    const accuracy=currentAccuracy()/100; const comboRatio=clamp(runtime.longestCombo/runtime.difficulty.steps,0,1); const heartRatio=clamp(runtime.hearts/runtime.difficulty.hearts,0,1); const cleanMovement=runtime.obstacleHits===0?1:runtime.obstacleHits===1?.45:0; const perfect=isPerfectRun()?1:0;
    return Math.max(0,Math.min(1000,Math.round(420+accuracy*300+comboRatio*120+heartRatio*65+cleanMovement*45+perfect*50)));
  }

  function rewardMetrics(completed) {
    const accuracy=Math.round(currentAccuracy()*10)/10;
    return {
      completedRun:completed===true,
      difficulty:runtime.difficulty.key,
      requiredSteps:runtime.difficulty.steps,
      completedSteps:runtime.completedSteps,
      correctAnswers:runtime.correctAnswers,
      wrongAnswers:runtime.wrongAnswers,
      answers:runtime.correctAnswers+runtime.wrongAnswers,
      accuracy,
      longestCombo:runtime.longestCombo,
      heartsRemaining:runtime.hearts,
      obstacleHits:runtime.obstacleHits,
      perfectRun:completed===true&&isPerfectRun(),
      distance:Math.floor(runtime.distance),
      arcadeScore:Math.floor(runtime.arcadeScore),
      collectibles:runtime.collectibles,
      activeTimeMs:Math.floor(runtime.activeTimeMs)
    };
  }

  async function endRun(completed) {
    if (runtime.state!=='RUNNING') return;
    runtime.questionBox.hidden=true; runtime.gateGroup=null; runtime.obstacles.length=0; runtime.pickups.length=0; runtime.performanceScore=completed?calculatePerformanceScore():0;
    if (completed) {
      runtime.state='ROUND_COMPLETE'; burstAtGate(runtime.lane,'good',24); runtime.resultPanel.hidden=false; tone('complete'); fillResultPanel();
      await claimReward(true);
    } else {
      runtime.state='GAME_OVER'; runtime.gameOverPanel.hidden=false; tone('bad'); fillGameOverPanel();
      // Incomplete missions intentionally do not submit a reward claim. Cancel the round so it cannot be replayed.
      cancelUnclaimedRound();
    }
    updateHud(true);
  }

  function fillResultPanel() {
    const accuracy=currentAccuracy(); const html=runtime.mission.finalHtml;
    setText(runtime.resultMission,runtime.mission.title); setText(runtime.resultDifficulty,runtime.difficulty.label); setText(runtime.resultChallenges,`${runtime.completedSteps}/${runtime.difficulty.steps}`); setText(runtime.resultAccuracy,`${accuracy.toFixed(1)}%`); setText(runtime.resultCombo,`x${runtime.longestCombo}`); setText(runtime.resultHearts,String(runtime.hearts)); setText(runtime.resultDistance,`${Math.floor(runtime.distance)}m`); setText(runtime.resultScore,Math.floor(runtime.arcadeScore).toLocaleString()); setText(runtime.resultXp,'+0 XP');
    runtime.resultPerfect.classList.toggle('show',isPerfectRun()); runtime.resultSource.textContent=html;
    try { runtime.resultPreview.srcdoc=html; } catch (_) {}
    renderMistakes();
    runtime.resultRewardNote.className='byte-runner-html-reward-note'; runtime.resultRewardNote.textContent=runtime.round?.sessionId?'Checking secure XP reward…':'Practice mode — account XP is unavailable.';
  }

  function renderMistakes() {
    if (!runtime.mistakes.length) { runtime.mistakesList.innerHTML='<li class="none">✓ No coding mistakes — every answer was correct.</li>'; return; }
    runtime.mistakesList.innerHTML=runtime.mistakes.slice(-6).map(item=>`<li><strong>Missed:</strong> ${escapeText(item.prompt)}<br><strong>Correct:</strong> <code>${escapeText(item.correct)}</code> · ${escapeText(item.actionReason||'')} ${escapeText(item.reason)}</li>`).join('');
  }

  function fillGameOverPanel() {
    setText(runtime.overProgress,`${runtime.completedSteps}/${runtime.difficulty.steps}`); setText(runtime.overAccuracy,`${currentAccuracy().toFixed(1)}%`); setText(runtime.overScore,Math.floor(runtime.arcadeScore).toLocaleString()); setText(runtime.overDistance,`${Math.floor(runtime.distance)}m`); setText(runtime.overCombo,`x${runtime.longestCombo}`); setText(runtime.overXp,'+0'); runtime.overNote.textContent='Incomplete mission — no XP claim was sent. Your high-score run remains local.';
  }

  async function claimReward(completed) {
    if (!completed || runtime.rewardSubmitting || !runtime.round?.sessionId || !runtime.bridge?.claimRound) return;
    runtime.rewardSubmitting=true; const round=runtime.round; runtime.round=null;
    const metrics=rewardMetrics(true);
    const runArcadeScore=runtime.arcadeScore, runAccuracy=currentAccuracy(), runCombo=runtime.longestCombo, runDifficultyRank=difficultyRank(runtime.difficulty.key);
    try {
      const result=await runtime.bridge.claimRound(round.sessionId,{score:runtime.performanceScore,metrics});
      const awarded=Math.max(0,Number(result?.awardedXp||0)); setText(runtime.resultXp,`+${awarded} XP`);
      const record=result?.gameRecord||result?.gameRecords?.[STATE_KEY]||{};
      runtime.bestScore=Math.max(runtime.bestScore,Number(record.bestArcadeScore||record.bestScore||0),runArcadeScore); runtime.bestAccuracy=Math.max(runtime.bestAccuracy,Number(record.bestAccuracy||0),runAccuracy); runtime.bestCombo=Math.max(runtime.bestCombo,Number(record.bestCombo||0),runCombo); runtime.bestDifficultyRank=Math.max(runtime.bestDifficultyRank,Number(record.bestDifficultyRank||0),runDifficultyRank);
      if (result?.loginRequired) { runtime.resultRewardNote.className='byte-runner-html-reward-note warn'; runtime.resultRewardNote.textContent='Practice mode — log in as a student to earn account XP.'; }
      else if (result?.syncFailed) { runtime.resultRewardNote.className='byte-runner-html-reward-note warn'; runtime.resultRewardNote.textContent='XP could not sync. No account XP was added for this run.'; }
      else if (result?.capReached && awarded===0) { runtime.resultRewardNote.className='byte-runner-html-reward-note warn'; runtime.resultRewardNote.textContent='Daily Mini-Game XP limit reached. You can keep playing for records.'; }
      else { runtime.resultRewardNote.className='byte-runner-html-reward-note success'; runtime.resultRewardNote.textContent=awarded>0?`Reward added safely · Today's Game XP: ${result.todayXp}/${result.dailyCap}`:'Mission complete, but this run did not reach an XP tier.'; }
      try { runtime.onReward?.(result); } catch (_) {}
    } catch (_) {
      runtime.resultRewardNote.className='byte-runner-html-reward-note warn'; runtime.resultRewardNote.textContent='Reward could not be processed. No XP was added.';
    } finally { runtime.rewardSubmitting=false; }
  }

  function cancelUnclaimedRound() {
    try { if(runtime.round?.sessionId&&!runtime.rewardSubmitting) runtime.bridge?.cancelRound?.(runtime.round.sessionId); } catch (_) {}
    runtime.round=null;
  }

  function builtCodeText() {
    if (!runtime.mission) return '<!DOCTYPE html>';
    return [runtime.mission.initialCode,...runtime.mission.steps.slice(0,runtime.completedSteps).map(step=>step.insertion)].join('\n');
  }

  function buildHudDisplayText() {
    // The build HUD is a learning preview, not the exported source. Keep meaningful
    // tags readable on small screens instead of letting long data URIs consume the box.
    return builtCodeText()
      .replace(/src="data:image\/[^"]+"/gi, 'src="image.svg"')
      .replace(/\s+$/gm, '');
  }

  function updateBuildHud() {
    const total=runtime.difficulty?.steps||8, done=runtime.completedSteps;
    setText(runtime.buildCount,`${done} / ${total}`);
    runtime.buildProgress.style.width=`${total?done/total*100:0}%`;
    if (!runtime.buildCode) return;
    const lines=buildHudDisplayText().split('\n');
    // Keep a little history above, but always prioritize the newest lines at the bottom.
    runtime.buildCode.textContent=lines.slice(-7).join('\n');
    runtime.buildCode.classList.toggle('has-history', lines.length > 4);
    requestAnimationFrame(() => {
      if (runtime.buildCode) runtime.buildCode.scrollTop = runtime.buildCode.scrollHeight;
    });
  }

  function updateHud(force=false) {
    const total=runtime.difficulty?.steps||8; setText(runtime.statScore,Math.floor(runtime.arcadeScore).toLocaleString()); setText(runtime.statDistance,`${Math.floor(runtime.distance)}m`); setText(runtime.statCombo,`x${runtime.combo}`); setText(runtime.statHearts,`${'♥'.repeat(runtime.hearts)}${runtime.shield?' 🛡':''}`||'—'); setText(runtime.statHtml,`${runtime.completedSteps}/${total}`); if(force)updateBuildHud();
  }

  function updateBuildDock() {
    const panel = runtime.buildPanel;
    if (!panel) return;
    const dockRight = runtime.lanePos <= 1;
    panel.classList.toggle('dock-right', dockRight);
    panel.classList.toggle('dock-left', !dockRight);
    panel.classList.toggle('compact', runtime.state === 'RUNNING');
  }

  function roadGeometry() {
    const {w,h}=runtime.view;
    const phone=w<=700;
    return {
      horizon:h*(phone?.365:.315),
      ground:h*.985,
      farHalf:w*(phone?.082:.067),
      nearHalf:w*(phone?.490:.465),
      laneFactor:phone?.74:.70
    };
  }

  function projectLane(lane,z,vertical=0) {
    const {w}=runtime.view;
    const geo=roadGeometry();
    const t=clamp(1-z/Z_MAX,0,1);
    const p=Math.pow(t,1.18);
    const half=lerp(geo.farHalf,geo.nearHalf,p);
    const x=w*.5+(lane-1)*half*geo.laneFactor;
    const y=geo.horizon+p*(geo.ground-geo.horizon)-vertical*(22+74*p);
    const scale=.18+p*.94;
    return {x,y,scale,p,half};
  }

  function drawRounded(ctx,x,y,w,h,r) { ctx.beginPath(); if(ctx.roundRect)ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2)); else ctx.rect(x,y,w,h); }

  function drawBackground(ctx,time) {
    const {w,h}=runtime.view;
    const phone=w<=700;
    const geo=roadGeometry();
    const kick=runtime.cameraKick>0?Math.sin(runtime.visualTime*42)*1.35*runtime.cameraKick:0;
    const laneParallax=(runtime.lanePos-1)*-w*.004;
    ctx.save(); ctx.translate(kick+laneParallax,0);

    // Bright daytime city / rail corridor. Everything is procedurally drawn so
    // the game keeps its own visual identity while getting the lively depth of
    // a modern endless runner.
    ctx.fillStyle=runtime.skyGradient||'#8dd8f6'; ctx.fillRect(-18,0,w+36,h);
    ctx.fillStyle=runtime.horizonGlow||'rgba(255,255,255,.14)'; ctx.fillRect(0,0,w,geo.horizon*1.85);

    // Sun + slow parallax clouds.
    ctx.globalAlpha=.86; ctx.fillStyle='#fff3a8'; ctx.beginPath(); ctx.arc(w*.79,h*.105,phone?22:31,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=.34;
    for(let i=0;i<(phone?3:5);i+=1){
      const cx=positiveMod(i*w*.31+runtime.visualTime*(4+i*.7),w+170)-85;
      const cy=h*(.08+.055*(i%3)); const cw=phone?46:66;
      ctx.fillStyle='#ffffff';
      ctx.beginPath();ctx.ellipse(cx,cy,cw*.42,cw*.16,0,0,Math.PI*2);ctx.ellipse(cx+cw*.25,cy-5,cw*.29,cw*.19,0,0,Math.PI*2);ctx.ellipse(cx-cw*.22,cy-3,cw*.25,cw*.16,0,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;

    // Distant hills and colorful city blocks.
    ctx.fillStyle='#7bbf91'; ctx.beginPath(); ctx.moveTo(0,geo.horizon+4); for(let x=0;x<=w;x+=w/8){ctx.lineTo(x,geo.horizon-16-Math.sin(x*.018)*10);} ctx.lineTo(w,geo.horizon+28);ctx.lineTo(0,geo.horizon+28);ctx.closePath();ctx.fill();
    const buildingCount=phone?7:11;
    const cityColors=['#5c7fa3','#6b8fb2','#54728f','#7597ac','#526f82'];
    for(let side=0;side<2;side+=1){
      for(let i=0;i<buildingCount;i+=1){
        const bw=18+(i%4)*7, bh=30+((i*31+side*17)%74);
        const step=phone?22:28;
        const base=side===0?w*.01+i*step:w-w*.01-i*step-bw;
        const y=geo.horizon-bh+6+(i%2)*4;
        ctx.fillStyle=cityColors[(i+side)%cityColors.length]; ctx.fillRect(base,y,bw,bh);
        ctx.fillStyle='rgba(255,247,201,.46)';
        for(let yy=y+9;yy<geo.horizon-4;yy+=15) for(let xx=base+5;xx<base+bw-3;xx+=10) ctx.fillRect(xx,yy,2.5,3);
      }
    }

    // Side platforms / green verge.
    ctx.beginPath();ctx.moveTo(0,geo.horizon);ctx.lineTo(w*.5-geo.farHalf,geo.horizon);ctx.lineTo(w*.5-geo.nearHalf,h);ctx.lineTo(0,h);ctx.closePath();ctx.fillStyle='#3b6e58';ctx.fill();
    ctx.beginPath();ctx.moveTo(w*.5+geo.farHalf,geo.horizon);ctx.lineTo(w,geo.horizon);ctx.lineTo(w,h);ctx.lineTo(w*.5+geo.nearHalf,h);ctx.closePath();ctx.fillStyle='#3b6e58';ctx.fill();

    // Main ballast / track bed.
    ctx.beginPath();ctx.moveTo(w*.5-geo.farHalf,geo.horizon);ctx.lineTo(w*.5+geo.farHalf,geo.horizon);ctx.lineTo(w*.5+geo.nearHalf,h);ctx.lineTo(w*.5-geo.nearHalf,h);ctx.closePath();ctx.fillStyle=runtime.roadGradient||'#46545b';ctx.fill();

    // Three separate rail tracks: sleepers move toward the player to sell speed.
    const railOffset=.145;
    ctx.lineCap='round';
    for(let lane=0;lane<3;lane+=1){
      const farC=w*.5+(lane-1)*geo.farHalf*geo.laneFactor;
      const nearC=w*.5+(lane-1)*geo.nearHalf*geo.laneFactor;
      const farGap=geo.farHalf*railOffset, nearGap=geo.nearHalf*railOffset;
      ctx.strokeStyle='rgba(226,232,240,.84)';ctx.lineWidth=phone?1.7:2.1;
      ctx.beginPath();ctx.moveTo(farC-farGap,geo.horizon);ctx.lineTo(nearC-nearGap,h);ctx.moveTo(farC+farGap,geo.horizon);ctx.lineTo(nearC+nearGap,h);ctx.stroke();
    }
    const tieCount=phone?10:13;
    for(let i=0;i<tieCount;i+=1){
      const z=positiveMod(i*(Z_MAX/tieCount)-runtime.roadPulse*.78,Z_MAX);
      for(let lane=0;lane<3;lane+=1){
        const p=projectLane(lane,z); if(p.p<.015)continue;
        const half=clamp((22+50*p.p)*p.scale,5,66);
        ctx.strokeStyle=`rgba(55,65,81,${.36+.42*p.p})`;ctx.lineWidth=1.2+3.2*p.p;
        ctx.beginPath();ctx.moveTo(p.x-half,p.y);ctx.lineTo(p.x+half,p.y);ctx.stroke();
      }
    }

    // Yellow safety edges keep the lanes legible even under dense obstacles.
    ctx.strokeStyle='rgba(250,204,21,.66)';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(w*.5-geo.farHalf,geo.horizon);ctx.lineTo(w*.5-geo.nearHalf,h);ctx.moveTo(w*.5+geo.farHalf,geo.horizon);ctx.lineTo(w*.5+geo.nearHalf,h);ctx.stroke();

    // Moving side scenery: trees, lamps, signs, and occasional parked train cars.
    const propCount=phone?5:7;
    for(let i=0;i<propCount;i+=1){
      const z=positiveMod(i*(Z_MAX/propCount)+9-runtime.roadPulse*.50,Z_MAX);
      for(const side of [-1,1]){
        const sideLane=side<0?-1.82:3.82; const p=projectLane(sideLane,z); if(p.p<.025)continue;
        const sc=p.scale;
        if((i+side+3)%3===0){
          // tree
          ctx.globalAlpha=.35+.58*p.p; ctx.fillStyle='#76543c';ctx.fillRect(p.x-2.5*sc,p.y-38*sc,5*sc,38*sc);
          ctx.fillStyle='#2f855a';ctx.beginPath();ctx.arc(p.x,p.y-45*sc,16*sc,0,Math.PI*2);ctx.arc(p.x-9*sc,p.y-38*sc,10*sc,0,Math.PI*2);ctx.arc(p.x+10*sc,p.y-38*sc,11*sc,0,Math.PI*2);ctx.fill();
        }else if((i+side+3)%3===1){
          // lamp / overhead utility pole
          ctx.globalAlpha=.35+.55*p.p;ctx.fillStyle='#334155';ctx.fillRect(p.x-2*sc,p.y-55*sc,4*sc,55*sc);ctx.fillStyle='#fef3c7';ctx.fillRect(p.x-6*sc,p.y-56*sc,12*sc,4*sc);
        }else{
          // colorful code billboard
          const bw=36*sc,bh=24*sc;ctx.globalAlpha=.38+.58*p.p;ctx.fillStyle=side<0?'#2563eb':'#e11d48';drawRounded(ctx,p.x-bw/2,p.y-46*sc,bw,bh,4*sc);ctx.fill();ctx.fillStyle='#fff';ctx.font=`900 ${clamp(7*sc,5,10)}px ui-monospace,monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(CODE_SIGNS[(i+(side>0?2:0))%CODE_SIGNS.length],p.x,p.y-34*sc);
        }
      }
    }
    ctx.globalAlpha=1;

    // Original BYTE LINE commuter cars on the outer service tracks. These are
    // intentionally simple side scenery (not collision objects) so the rail
    // corridor feels inhabited without adding gameplay clutter or frame-heavy
    // sprites. One car drifts through each side at a different phase.
    for(const side of [-1,1]){
      const cycle=positiveMod(runtime.roadPulse*(side<0?.22:.17)+(side<0?17:42),Z_MAX+28)-7;
      const sideLane=side<0?-1.58:3.58;
      const p=projectLane(sideLane,cycle); if(p.p>.025&&p.p<.82){
        const sc=p.scale; const carW=clamp(74*sc,18,86); const carH=clamp(35*sc,11,44);
        ctx.save();ctx.translate(p.x,p.y);
        ctx.globalAlpha=.34+.55*p.p;
        ctx.fillStyle=side<0?'#2563eb':'#e11d48';ctx.strokeStyle='rgba(255,255,255,.74)';ctx.lineWidth=Math.max(1,1.3*sc);
        drawRounded(ctx,-carW*.5,-carH,carW,carH,5*sc);ctx.fill();ctx.stroke();
        ctx.fillStyle='#dff6ff';
        const windows=4;for(let j=0;j<windows;j+=1){const wx=-carW*.36+j*carW*.24;drawRounded(ctx,wx,-carH*.77,carW*.16,carH*.28,2*sc);ctx.fill();}
        ctx.fillStyle='#1e293b';ctx.fillRect(-carW*.5,-carH*.18,carW,carH*.18);
        ctx.fillStyle='#fef3c7';ctx.beginPath();ctx.arc(-carW*.31,1.5*sc,3.3*sc,0,Math.PI*2);ctx.arc(carW*.31,1.5*sc,3.3*sc,0,Math.PI*2);ctx.fill();
        if(!phone||p.p>.20){ctx.fillStyle='#ffffff';ctx.font=`900 ${clamp(6.2*sc,4.6,8)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('BYTE LINE',0,-carH*.41);}
        ctx.restore();
      }
    }

    // Catenary frames / overhead wires. Sparse on phones for performance.
    const frameCount=phone?3:5;
    for(let i=0;i<frameCount;i+=1){
      const z=positiveMod(i*(Z_MAX/frameCount)+18-runtime.roadPulse*.44,Z_MAX);const p=projectLane(1,z);if(p.p<.04)continue;
      const width=lerp(geo.farHalf*1.75,geo.nearHalf*1.75,p.p), top=p.y-(48+62*p.p);
      ctx.globalAlpha=.15+.35*p.p;ctx.strokeStyle='#475569';ctx.lineWidth=1+1.3*p.p;ctx.beginPath();ctx.moveTo(w*.5-width, p.y);ctx.lineTo(w*.5-width,top);ctx.lineTo(w*.5+width,top);ctx.lineTo(w*.5+width,p.y);ctx.stroke();
    }
    ctx.globalAlpha=1;
    ctx.restore();
  }

  function drawObstacle(ctx,item) {
    const p=projectLane(item.lane,item.z); if(p.p<=.004)return;
    const scale=p.scale;
    const laneW=Math.max(42,92*scale);
    const age=item.postResolveAge||0;
    let alpha=1;
    if(item.outcome==='hit') alpha=clamp(1-age/.30,0,1);
    else if(item.resolved) alpha=clamp(1-age/(item.outcome==='cleared'?.58:.48),0,1);
    const passDrop=item.outcome==='cleared'?Math.min(36*scale,age*78*scale):0;
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(p.x,p.y+passDrop);

    // Ground shadow keeps every obstacle visually planted on the lane.
    ctx.fillStyle=`rgba(0,0,0,${.13+.22*p.p})`;
    ctx.beginPath(); ctx.ellipse(0,4*scale,laneW*.47,8*scale,0,0,Math.PI*2); ctx.fill();

    if(item.type==='crate') {
      // LOW obstacle: deliberately knee/waist height so JUMP is immediately obvious.
      const w=laneW*.90;
      const hh=34*scale;
      ctx.fillStyle=item.outcome==='hit'?'#6f1f32':'#581b2b';
      ctx.strokeStyle=item.outcome==='hit'?'#fecdd3':'#fb7185';
      ctx.lineWidth=Math.max(1,2.1*scale);
      drawRounded(ctx,-w/2,-hh,w,hh,7*scale); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#f59e0b';
      for(let stripe=-2;stripe<=2;stripe+=1){const sx=stripe*w*.18;ctx.save();ctx.translate(sx,-hh*.52);ctx.rotate(-.28);ctx.fillRect(-4*scale,-hh*.38,8*scale,hh*.76);ctx.restore();}

      // Up chevrons communicate "jump over this" without relying on text alone.
      ctx.strokeStyle='#fef3c7'; ctx.lineWidth=Math.max(1.5,2.2*scale); ctx.lineCap='round';
      for(const ox of [-13,13]){
        ctx.beginPath(); ctx.moveTo((ox-7)*scale,-23*scale); ctx.lineTo(ox*scale,-31*scale); ctx.lineTo((ox+7)*scale,-23*scale); ctx.stroke();
      }
      ctx.fillStyle='#fecdd3'; ctx.font=`950 ${clamp(10*scale,6,13)}px system-ui`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('JUMP',0,-hh*.58);
    } else if(item.type==='beam') {
      // SLIDE TUNNEL: the upper half is visibly SOLID, while the lower half is
      // one large clean opening. Running or jumping hits the canopy; sliding fits.
      const w=laneW*1.02;
      const topY=-138*scale;
      const openingTop=-48*scale;
      const postW=Math.max(6,9*scale);
      ctx.fillStyle='#173b60';
      drawRounded(ctx,-w*.52,topY,postW,-topY,3*scale);ctx.fill();
      drawRounded(ctx,w*.52-postW,topY,postW,-topY,3*scale);ctx.fill();

      ctx.shadowColor='rgba(248,113,113,.7)';ctx.shadowBlur=10*scale;
      ctx.fillStyle=item.outcome==='hit'?'#991b1b':'#b91c1c';
      drawRounded(ctx,-w*.5,topY,w,topY*-1+openingTop,6*scale);ctx.fill();
      ctx.shadowBlur=0;
      // hazard lip exactly at the top of the slide opening
      ctx.fillStyle='#ef4444';drawRounded(ctx,-w*.50,openingTop-10*scale,w,12*scale,3*scale);ctx.fill();
      ctx.fillStyle='#facc15';
      for(let x=-w*.40;x<w*.40;x+=18*scale){ctx.save();ctx.translate(x,openingTop-4*scale);ctx.rotate(-.45);ctx.fillRect(-3*scale,-5*scale,6*scale,10*scale);ctx.restore();}

      ctx.strokeStyle='rgba(207,250,254,.68)';ctx.lineWidth=Math.max(1,1.6*scale);
      drawRounded(ctx,-w*.38,openingTop,w*.76,-openingTop-2*scale,7*scale);ctx.stroke();
      ctx.fillStyle='#fee2e2';ctx.font=`950 ${clamp(10*scale,6,13)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('SLIDE',0,topY+24*scale);
      ctx.fillStyle='#cffafe';ctx.font=`850 ${clamp(6.7*scale,5,9)}px system-ui`;ctx.fillText('BIG OPENING BELOW',0,openingTop+19*scale);
      // clear downward cue inside the opening
      ctx.strokeStyle='#ecfeff';ctx.lineWidth=Math.max(1.4,2*scale);ctx.lineCap='round';
      for(const ox of [-14,14]){ctx.beginPath();ctx.moveTo(ox*scale,openingTop+5*scale);ctx.lineTo(ox*scale,openingTop+17*scale);ctx.moveTo((ox-6)*scale,openingTop+11*scale);ctx.lineTo(ox*scale,openingTop+18*scale);ctx.lineTo((ox+6)*scale,openingTop+11*scale);ctx.stroke();}
    } else {
      // FULL BLOCKING WALL: intentionally much taller than the runner and fills the lane.
      // This is NOT jumpable/slidable; the silhouette should immediately communicate DODGE.
      const w=laneW*1.08;
      const hh=184*scale;
      ctx.fillStyle=item.outcome==='hit'?'rgba(127,29,29,.96)':'#3b1859';
      ctx.strokeStyle=item.outcome==='hit'?'#fb7185':'#c084fc';
      ctx.lineWidth=Math.max(1.2,2.4*scale);
      drawRounded(ctx,-w*.5,-hh,w,hh,8*scale); ctx.fill(); ctx.stroke();

      // Solid side rails remove any false "slide under" opening.
      ctx.fillStyle='rgba(216,180,254,.14)';
      ctx.fillRect(-w*.43,-hh+8*scale,6*scale,hh-14*scale);
      ctx.fillRect(w*.43-6*scale,-hh+8*scale,6*scale,hh-14*scale);

      ctx.strokeStyle='#f5d0fe'; ctx.lineWidth=Math.max(2,3*scale); ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(-20*scale,-126*scale); ctx.lineTo(20*scale,-82*scale);
      ctx.moveTo(20*scale,-126*scale); ctx.lineTo(-20*scale,-82*scale);
      ctx.stroke();

      ctx.fillStyle='#f3e8ff'; ctx.font=`950 ${clamp(10*scale,6,13)}px system-ui`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('DODGE',0,-154*scale);
      ctx.fillStyle='#d8b4fe'; ctx.font=`900 ${clamp(7*scale,5,10)}px system-ui`;
      ctx.fillText('FULL WALL',0,-55*scale);

      // L/R arrows hint that lane change is the only safe response.
      ctx.strokeStyle='rgba(233,213,255,.75)'; ctx.lineWidth=Math.max(1.2,1.8*scale);
      ctx.beginPath(); ctx.moveTo(-30*scale,-25*scale); ctx.lineTo(-42*scale,-25*scale); ctx.lineTo(-36*scale,-31*scale); ctx.moveTo(-42*scale,-25*scale); ctx.lineTo(-36*scale,-19*scale); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30*scale,-25*scale); ctx.lineTo(42*scale,-25*scale); ctx.lineTo(36*scale,-31*scale); ctx.moveTo(42*scale,-25*scale); ctx.lineTo(36*scale,-19*scale); ctx.stroke();

      if(item.outcome==='hit'){
        ctx.strokeStyle='#fecdd3'; ctx.lineWidth=Math.max(1,1.5*scale);
        ctx.beginPath(); ctx.moveTo(-9*scale,-80*scale); ctx.lineTo(5*scale,-63*scale); ctx.lineTo(-6*scale,-46*scale); ctx.lineTo(12*scale,-29*scale); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawPickup(ctx,item) {
    const p=projectLane(item.lane,item.z,.12); if(p.p<=.005)return; const s=34*p.scale;ctx.save();ctx.translate(p.x,p.y-s*.8);ctx.rotate(runtime.visualTime*1.7);ctx.shadowColor=item.type==='shield'?'rgba(190,242,100,.7)':'rgba(34,211,238,.65)';ctx.shadowBlur=14*p.scale;ctx.fillStyle=item.type==='shield'?'#365314':'#164e63';ctx.strokeStyle=item.type==='shield'?'#bef264':'#67e8f9';ctx.lineWidth=Math.max(1,2*p.scale);drawRounded(ctx,-s/2,-s/2,s,s,8*p.scale);ctx.fill();ctx.stroke();ctx.rotate(-runtime.visualTime*1.7);ctx.shadowBlur=0;ctx.fillStyle='#ecfeff';ctx.font=`900 ${clamp(9*p.scale,5,11)}px ui-monospace,monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.label,0,0);ctx.restore();
  }

  function drawGate(ctx,lane,label,group) {
    const p=projectLane(lane,group.z); if(p.p<=.003)return;
    const geo=roadGeometry();
    const scale=Math.max(p.scale,.20); const action=group.motion;
    const resolved=group.resolved===true; const selected=lane===group.selectedLane; const isCorrect=lane===group.correctLane;
    const resolution=group.resolution||'';
    const alpha=(group.alpha==null?1:group.alpha)*clamp(.60+p.p*.55,0,1);
    const good=resolved && resolution==='correct' && isCorrect;
    const bad=resolved && resolution==='wrong' && selected;
    const muted=resolved && !good && !bad;
    const laneSpan=Math.max(30,p.half*geo.laneFactor);
    const frameW=clamp(laneSpan*.74,28,72);
    const cardW=clamp(laneSpan*.90,36,86);
    const actionTop=(action==='slide'?106:action==='run'?94:70)*scale;
    const cardH=clamp(44*scale,25,48);
    const cardY=p.y-actionTop-clamp(10*scale,3,11);

    ctx.save();
    ctx.globalAlpha=alpha*(muted?(resolution==='correct'?.10:.24):1);
    ctx.translate(p.x,0);

    const frameColor=good?'#bef264':bad?'#fb7185':action==='jump'?'#facc15':action==='slide'?'#fb7185':'#22d3ee';
    const fillColor=good?'rgba(20,83,45,.94)':bad?'rgba(127,29,29,.95)':'rgba(4,24,39,.96)';

    // ANSWER CARD: always sits above the action silhouette, never inside it.
    ctx.fillStyle=fillColor; ctx.strokeStyle=frameColor; ctx.lineWidth=Math.max(1,1.4*scale);
    drawRounded(ctx,-cardW*.5,cardY-cardH,cardW,cardH,clamp(7*scale,4,8)); ctx.fill(); ctx.stroke();
    ctx.fillStyle=good?'#ecfccb':bad?'#ffe4e6':'#f8fafc';
    ctx.font=`900 ${clamp(10.5*scale,7,11.5)}px ui-monospace,monospace`; ctx.textAlign='center'; ctx.textBaseline='middle';
    const answer=String(label||'').replace(/\s+/g,' ').trim();
    const maxChars=cardW>72?12:cardW>56?10:8;
    const words=answer.split(' '); const lines=[]; let line='';
    for(const word of words){const next=line?`${line} ${word}`:word;if(next.length>maxChars&&line){lines.push(line);line=word;}else line=next;}
    if(line)lines.push(line); if(!lines.length)lines.push(answer.slice(0,maxChars));
    const visible=lines.slice(0,2);
    visible.forEach((part,index)=>ctx.fillText(part.slice(0,maxChars+2),0,cardY-cardH*.57+(index-(visible.length-1)/2)*11*scale));

    ctx.shadowColor=frameColor; ctx.shadowBlur=7*scale; ctx.strokeStyle=frameColor; ctx.fillStyle=frameColor;

    if(action==='jump'){
      // LOW HURDLE: ground-level obstruction with a completely open upper half.
      // Shape alone says JUMP, even when the text is too far away to read.
      const hurdleH=clamp(27*scale,9,30);
      const hurdleW=frameW*.88;
      ctx.globalAlpha*=.98;
      drawRounded(ctx,-hurdleW*.5,p.y-hurdleH,hurdleW,hurdleH,5*scale);
      ctx.fillStyle=bad?'#7f1d1d':good?'#3f6212':'#a16207'; ctx.fill();
      ctx.strokeStyle=frameColor; ctx.lineWidth=Math.max(1.5,2.2*scale); ctx.stroke();
      ctx.shadowBlur=0;
      // oversized up chevrons floating over the hurdle
      ctx.strokeStyle=good?'#ecfccb':'#fef3c7'; ctx.lineWidth=Math.max(1.6,2.2*scale); ctx.lineCap='round';
      for(const ox of [-12,12]){
        ctx.beginPath(); ctx.moveTo((ox-6)*scale,p.y-46*scale); ctx.lineTo(ox*scale,p.y-56*scale); ctx.lineTo((ox+6)*scale,p.y-46*scale); ctx.stroke();
      }
      ctx.fillStyle='#fef9c3'; ctx.font=`950 ${clamp(8.5*scale,6,10)}px system-ui`; ctx.fillText('JUMP',0,p.y-34*scale);
    }else if(action==='slide'){
      // SOLID CANOPY + LARGE LOWER OPENING: unmistakably a slide gate.
      const w=frameW*.98; const topY=p.y-108*scale; const openingTop=p.y-45*scale; const postW=Math.max(4.5,7*scale);
      ctx.fillStyle='rgba(71,85,105,.92)';
      drawRounded(ctx,-w*.50,topY,postW,p.y-topY,2*scale);ctx.fill();drawRounded(ctx,w*.50-postW,topY,postW,p.y-topY,2*scale);ctx.fill();
      ctx.fillStyle=bad?'#be123c':good?'#65a30d':'#b91c1c';drawRounded(ctx,-w*.48,topY,w*.96,63*scale,5*scale);ctx.fill();
      ctx.fillStyle='#ef4444';drawRounded(ctx,-w*.48,openingTop-8*scale,w*.96,10*scale,3*scale);ctx.fill();ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(207,250,254,.72)';ctx.lineWidth=Math.max(1,1.5*scale);drawRounded(ctx,-w*.36,openingTop,w*.72,p.y-openingTop-2*scale,5*scale);ctx.stroke();
      ctx.fillStyle='#fee2e2';ctx.font=`950 ${clamp(8.5*scale,6,10)}px system-ui`;ctx.fillText('SLIDE',0,topY+20*scale);
      ctx.strokeStyle='#ecfeff';ctx.lineWidth=Math.max(1.2,1.8*scale);for(const ox of [-12,12]){ctx.beginPath();ctx.moveTo(ox*scale,openingTop+5*scale);ctx.lineTo(ox*scale,openingTop+15*scale);ctx.moveTo((ox-5)*scale,openingTop+10*scale);ctx.lineTo(ox*scale,openingTop+16*scale);ctx.lineTo((ox+5)*scale,openingTop+10*scale);ctx.stroke();}
    }else{
      // OPEN PORTAL: no hurdle and no overhead bar. Just run straight through.
      const postH=82*scale; const postW=Math.max(4.5,7*scale);
      ctx.fillStyle=bad?'rgba(127,29,29,.90)':good?'rgba(63,98,18,.82)':'rgba(8,145,178,.45)';
      drawRounded(ctx,-frameW*.5,p.y-postH,postW,postH,3*scale); ctx.fill();
      drawRounded(ctx,frameW*.5-postW,p.y-postH,postW,postH,3*scale); ctx.fill();
      ctx.strokeStyle=frameColor; ctx.lineWidth=Math.max(1.2,1.8*scale); ctx.beginPath();
      ctx.moveTo(-frameW*.5,p.y-postH); ctx.lineTo(frameW*.5,p.y-postH); ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle='#cffafe'; ctx.font=`950 ${clamp(8.5*scale,6,10)}px system-ui`; ctx.fillText('RUN',0,p.y-50*scale);
      // forward chevrons on the ground reinforce that the route is OPEN.
      ctx.strokeStyle='rgba(103,232,249,.80)'; ctx.lineWidth=Math.max(1,1.5*scale);
      for(let i=0;i<2;i+=1){const yy=p.y-(17-i*11)*scale;ctx.beginPath();ctx.moveTo(-9*scale,yy-5*scale);ctx.lineTo(0,yy);ctx.lineTo(9*scale,yy-5*scale);ctx.stroke();}
    }

    ctx.shadowBlur=0;
    // Small lane tag separated from the answer text.
    ctx.fillStyle=action==='jump'?'#fde68a':action==='slide'?'#fecdd3':'#a5f3fc';
    ctx.font=`950 ${clamp(7*scale,5.5,8.5)}px system-ui`;
    ctx.fillText(`${humanLane(lane)} · ${action.toUpperCase()}`,0,cardY-5*scale);

    if(bad){
      // Wrong answer briefly becomes a solid blocker so the mistake reads clearly.
      ctx.fillStyle='rgba(127,29,29,.62)';
      drawRounded(ctx,-frameW*.43,p.y-actionTop*.68,frameW*.86,actionTop*.48,6*scale); ctx.fill();
      ctx.strokeStyle='#fecdd3'; ctx.lineWidth=Math.max(1.5,2*scale);
      ctx.beginPath(); ctx.moveTo(-10*scale,p.y-actionTop*.50); ctx.lineTo(10*scale,p.y-actionTop*.32); ctx.moveTo(10*scale,p.y-actionTop*.50); ctx.lineTo(-10*scale,p.y-actionTop*.32); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlayer(ctx,time) {
    const {w,h}=runtime.view;
    const geo=roadGeometry();
    const x=w*.5+(runtime.lanePos-1)*geo.nearHalf*geo.laneFactor;
    const jumping=runtime.jumpY>.02;
    const slide=runtime.slideTime>0;
    const hit=runtime.stumbleTime>0;
    const celebrating=runtime.state==='ROUND_COMPLETE';
    const idle=runtime.state!=='RUNNING'&&runtime.state!=='COUNTDOWN'&&!celebrating;
    const running=!jumping&&!slide&&!idle&&!celebrating;
    const phoneBoost=w<=520?1.15:1;
    const scale=clamp(h/690,.82,1.22)*phoneBoost;

    // Rear-view gait: forward/back stride is represented mostly through leg
    // compression and foot lift, not giant sideways sweeps. The old horizontal
    // leg motion is what made BYTE read like an octopus sliding across the road.
    const runRate=clamp(runtime.speed/22,.84,1.36);
    const runPhase=time*.00945*runRate;
    const stride=Math.sin(runPhase);
    const leftLift=Math.max(0,stride);
    const rightLift=Math.max(0,-stride);
    const leftPlant=Math.max(0,-stride);
    const rightPlant=Math.max(0,stride);

    // Pose envelopes.
    const slideElapsed=slide?clamp((SLIDE_DURATION-runtime.slideTime)/SLIDE_DURATION,0,1):0;
    // 1.5 s total: fast crouch, long readable low phase, smooth recovery.
    const slidePose=slide?(slideElapsed<.18?easeOutCubic(slideElapsed/.18):slideElapsed>.82?easeOutCubic((1-slideElapsed)/.18):1):0;
    const jumpAir=clamp(runtime.jumpY/1.18,0,1);
    const jumpRise=jumping?clamp((runtime.jumpVy+2.4)/8.9,0,1):0;
    const jumpFall=jumping?clamp((-runtime.jumpVy)/7.5,0,1):0;

    const bob=running?(0.55+1.15*Math.abs(Math.sin(runPhase*2)))*scale:0;
    const idleBob=idle?Math.sin(time*.0028)*.7*scale:0;
    const celebrationBob=celebrating?Math.abs(Math.sin(time*.006))*5*scale:0;
    const landingAmount=runtime.landingKick>0?clamp(runtime.landingKick/.18,0,1):0;
    const baseY=h*.958-runtime.jumpY*78-celebrationBob+slidePose*25*scale;
    const laneLean=clamp((runtime.lane-runtime.lanePos)*-.07,-.05,.05);

    // Ground shadow stays centered under the character so lane movement reads as
    // running instead of the body drifting independently from its feet.
    ctx.save();
    const air=clamp(runtime.jumpY/1.25,0,.78);
    ctx.globalAlpha=.25*(1-air*.58); ctx.fillStyle='#020617'; ctx.beginPath();
    ctx.ellipse(x,h*.963,27*scale*(1-air*.16+slidePose*.16),6.4*scale*(1-air*.25),0,0,Math.PI*2); ctx.fill();
    if(landingAmount>0){
      ctx.globalAlpha=.18*landingAmount; ctx.strokeStyle='#a5f3fc'; ctx.lineWidth=1.2*scale;
      ctx.beginPath(); ctx.arc(x,h*.961,23*scale+17*scale*(1-landingAmount),0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(x,baseY+bob+idleBob+landingAmount*2.2*scale);
    // Only lane changes tilt the runner. No sinusoidal body rotation during the
    // normal gait; that sideways rocking was another source of the sliding feel.
    ctx.rotate(hit?Math.sin(time*.045)*.07:laneLean*(slide?.18:.58));
    ctx.scale(1+landingAmount*.035,1-landingAmount*.055);
    if(runtime.invulnerable>0&&Math.floor(runtime.invulnerable*12)%2===0)ctx.globalAlpha=.56;

    if(runtime.shield){
      ctx.strokeStyle='rgba(190,242,100,.72)'; ctx.lineWidth=2.2*scale; ctx.beginPath(); ctx.arc(0,-45*scale,43*scale,0,Math.PI*2); ctx.stroke();
    }

    const hipSway=running?stride*1.15*scale:0;
    const shoulderCounter=running?-stride*.55*scale:0;
    const hipY=lerp(-22,-4,slidePose)*scale;
    const shoulderY=lerp(-57,-24,slidePose)*scale;
    const leftHipX=-8.5*scale+hipSway;
    const rightHipX=8.5*scale+hipSway;
    const leftShoulderX=-20*scale+shoulderCounter;
    const rightShoulderX=20*scale+shoulderCounter;

    ctx.lineCap='round'; ctx.lineJoin='round';

    // LEGS — separate articulated limbs with restrained lateral travel.
    if(slide){
      ctx.strokeStyle='#173c59'; ctx.lineWidth=8*scale;
      ctx.beginPath(); ctx.moveTo(leftHipX,hipY); ctx.lineTo(-9*scale,0); ctx.lineTo(-22*scale,4*scale); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rightHipX,hipY); ctx.lineTo(12*scale,-1*scale); ctx.lineTo(28*scale,3*scale); ctx.stroke();
      ctx.fillStyle='#1f5577';
      ctx.beginPath(); ctx.arc(-9*scale,0,4.1*scale,0,Math.PI*2); ctx.arc(12*scale,-1*scale,4.1*scale,0,Math.PI*2); ctx.fill();
    }else if(jumping){
      const tuck=clamp(.42+jumpAir*.48-jumpFall*.18,0,1);
      const lkx=(-9-2.5*tuck)*scale, rkx=(9+2.5*tuck)*scale;
      const lky=(-9-5.5*tuck+2*jumpFall)*scale, rky=(-9-5.5*tuck+2*jumpFall)*scale;
      const lfx=(-8-2*tuck)*scale, rfx=(8+2*tuck)*scale;
      const lfy=(1+4*jumpFall-5*tuck)*scale, rfy=(1+4*jumpFall-5*tuck)*scale;
      ctx.strokeStyle='#173c59'; ctx.lineWidth=8*scale;
      ctx.beginPath(); ctx.moveTo(leftHipX,hipY);ctx.lineTo(lkx,lky);ctx.lineTo(lfx,lfy);ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rightHipX,hipY);ctx.lineTo(rkx,rky);ctx.lineTo(rfx,rfy);ctx.stroke();
    }else{
      // The planted leg stays long and almost vertical. The recovery leg bends
      // and lifts behind the runner. Horizontal motion is only a few pixels.
      const lKneeX=(-8.5+stride*1.7)*scale+hipSway*.22;
      const rKneeX=(8.5-stride*1.7)*scale+hipSway*.22;
      const lKneeY=(-7.5-leftLift*8.5+leftPlant*1.3)*scale;
      const rKneeY=(-7.5-rightLift*8.5+rightPlant*1.3)*scale;
      const lFootX=(-10.5+stride*2.4)*scale+hipSway*.15;
      const rFootX=(10.5-stride*2.4)*scale+hipSway*.15;
      const lFootY=(3.2-leftLift*12.5)*scale;
      const rFootY=(3.2-rightLift*12.5)*scale;

      // Raised/recovery leg is slightly darker and is drawn first for depth.
      if(leftLift>=rightLift){
        ctx.strokeStyle='#12344e'; ctx.lineWidth=7.6*scale; ctx.beginPath();ctx.moveTo(leftHipX,hipY);ctx.lineTo(lKneeX,lKneeY);ctx.lineTo(lFootX,lFootY);ctx.stroke();
        ctx.strokeStyle='#1d4f73'; ctx.lineWidth=8.3*scale; ctx.beginPath();ctx.moveTo(rightHipX,hipY);ctx.lineTo(rKneeX,rKneeY);ctx.lineTo(rFootX,rFootY);ctx.stroke();
      }else{
        ctx.strokeStyle='#12344e'; ctx.lineWidth=7.6*scale; ctx.beginPath();ctx.moveTo(rightHipX,hipY);ctx.lineTo(rKneeX,rKneeY);ctx.lineTo(rFootX,rFootY);ctx.stroke();
        ctx.strokeStyle='#1d4f73'; ctx.lineWidth=8.3*scale; ctx.beginPath();ctx.moveTo(leftHipX,hipY);ctx.lineTo(lKneeX,lKneeY);ctx.lineTo(lFootX,lFootY);ctx.stroke();
      }

      // Knee joints make the bend readable on a small phone screen.
      ctx.fillStyle='#2a6c91';
      ctx.beginPath();ctx.arc(lKneeX,lKneeY,3.6*scale,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(rKneeX,rKneeY,3.6*scale,0,Math.PI*2);ctx.fill();
    }

    // SHOES — short, grounded silhouettes; never sweeping sideways.
    ctx.strokeStyle='#dbeafe'; ctx.lineWidth=4.2*scale;
    if(slide){
      ctx.beginPath();ctx.moveTo(-22*scale,4*scale);ctx.lineTo(-30*scale,4.8*scale);ctx.stroke();
      ctx.beginPath();ctx.moveTo(28*scale,3*scale);ctx.lineTo(36*scale,3.3*scale);ctx.stroke();
    }else if(jumping){
      const tuck=clamp(.42+jumpAir*.48-jumpFall*.18,0,1);
      const lfx=(-8-2*tuck)*scale, rfx=(8+2*tuck)*scale;
      const fy=(1+4*jumpFall-5*tuck)*scale;
      ctx.beginPath();ctx.moveTo(lfx,fy);ctx.lineTo(lfx-7*scale,fy+1.2*scale);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rfx,fy);ctx.lineTo(rfx+7*scale,fy+1.2*scale);ctx.stroke();
    }else{
      const lFootX=(-10.5+stride*2.4)*scale+hipSway*.15;
      const rFootX=(10.5-stride*2.4)*scale+hipSway*.15;
      const lFootY=(3.2-leftLift*12.5)*scale;
      const rFootY=(3.2-rightLift*12.5)*scale;
      ctx.beginPath();ctx.moveTo(lFootX,lFootY);ctx.lineTo(lFootX-6.8*scale,lFootY+(leftLift>.1?.6:1.2)*scale);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rFootX,rFootY);ctx.lineTo(rFootX+6.8*scale,rFootY+(rightLift>.1?.6:1.2)*scale);ctx.stroke();
    }

    // ARMS — fore/aft pump, kept on their own side of the torso.
    ctx.lineWidth=6.8*scale;
    if(celebrating){
      ctx.strokeStyle='#1d4f73';
      ctx.beginPath();ctx.moveTo(leftShoulderX,shoulderY);ctx.lineTo(-27*scale,-74*scale);ctx.lineTo(-19*scale,-84*scale);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rightShoulderX,shoulderY);ctx.lineTo(27*scale,-74*scale);ctx.lineTo(19*scale,-84*scale);ctx.stroke();
    }else if(slide){
      ctx.strokeStyle='#1d4f73';
      ctx.beginPath();ctx.moveTo(leftShoulderX,shoulderY);ctx.lineTo(-24*scale,-17*scale);ctx.lineTo(-19*scale,-8*scale);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rightShoulderX,shoulderY);ctx.lineTo(25*scale,-18*scale);ctx.lineTo(20*scale,-9*scale);ctx.stroke();
    }else if(jumping){
      const armLift=clamp(.52+jumpRise*.30,0,1);
      ctx.strokeStyle='#1d4f73';
      ctx.beginPath();ctx.moveTo(leftShoulderX,shoulderY);ctx.lineTo((-23-3*armLift)*scale,(-62-7*armLift)*scale);ctx.lineTo((-17-2*armLift)*scale,(-69-8*armLift)*scale);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rightShoulderX,shoulderY);ctx.lineTo((23+3*armLift)*scale,(-62-7*armLift)*scale);ctx.lineTo((17+2*armLift)*scale,(-69-8*armLift)*scale);ctx.stroke();
    }else{
      const leftArm=-stride, rightArm=stride;
      const lElbowX=(-23.5-leftArm*.9)*scale+shoulderCounter*.18;
      const rElbowX=(23.5-rightArm*.9)*scale+shoulderCounter*.18;
      const lElbowY=(-43+leftArm*4.2)*scale;
      const rElbowY=(-43+rightArm*4.2)*scale;
      const lHandX=(-19.5-leftArm*1.4)*scale;
      const rHandX=(19.5-rightArm*1.4)*scale;
      const lHandY=(-29+leftArm*8.2)*scale;
      const rHandY=(-29+rightArm*8.2)*scale;
      ctx.strokeStyle='#163f5e';ctx.beginPath();ctx.moveTo(leftShoulderX,shoulderY);ctx.lineTo(lElbowX,lElbowY);ctx.lineTo(lHandX,lHandY);ctx.stroke();
      ctx.strokeStyle='#1f5b80';ctx.beginPath();ctx.moveTo(rightShoulderX,shoulderY);ctx.lineTo(rElbowX,rElbowY);ctx.lineTo(rHandX,rHandY);ctx.stroke();
      ctx.fillStyle='#f2c6a8';ctx.beginPath();ctx.arc(lHandX,lHandY,3.1*scale,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(rHandX,rHandY,3.1*scale,0,Math.PI*2);ctx.fill();
    }

    // Waist / hip anchor gives the legs a clear origin instead of appearing to
    // sprout independently from the torso.
    const waistY=lerp(-24,-7,slidePose)*scale;
    ctx.fillStyle='#0b2237';
    drawRounded(ctx,-16*scale+hipSway*.25,waistY,32*scale,11*scale,5*scale);ctx.fill();

    // TORSO — tapered jacket instead of a square floating block.
    const torsoTop=lerp(-70,-41,slidePose)*scale;
    const torsoH=lerp(49,29,slidePose)*scale;
    const shoulderHalf=lerp(23,24,slidePose)*scale;
    const waistHalf=lerp(17,21,slidePose)*scale;
    ctx.fillStyle=hit?'#4b1d2a':'#0b2d46';ctx.strokeStyle=hit?'#fb7185':'#67e8f9';ctx.lineWidth=2.4*scale;
    ctx.beginPath();
    ctx.moveTo(-shoulderHalf+shoulderCounter*.15,torsoTop+5*scale);
    ctx.quadraticCurveTo(-shoulderHalf-2*scale,torsoTop+11*scale,-waistHalf+hipSway*.18,torsoTop+torsoH);
    ctx.lineTo(waistHalf+hipSway*.18,torsoTop+torsoH);
    ctx.quadraticCurveTo(shoulderHalf+2*scale,torsoTop+11*scale,shoulderHalf+shoulderCounter*.15,torsoTop+5*scale);
    ctx.quadraticCurveTo(0,torsoTop-2*scale,-shoulderHalf+shoulderCounter*.15,torsoTop+5*scale);
    ctx.closePath();ctx.fill();ctx.stroke();

    // Backpack stays centered with a subtle gait counter-shift.
    const packW=lerp(34,37,slidePose)*scale;
    const packH=lerp(31,23,slidePose)*scale;
    const packX=shoulderCounter*.18;
    ctx.fillStyle='#164e63';drawRounded(ctx,packX-packW*.5,torsoTop+8*scale,packW,packH,8*scale);ctx.fill();
    ctx.strokeStyle='rgba(125,211,252,.35)';ctx.lineWidth=1.1*scale;
    ctx.beginPath();ctx.moveTo(packX-packW*.31,torsoTop+11*scale);ctx.lineTo(packX-packW*.39,torsoTop+torsoH-5*scale);ctx.moveTo(packX+packW*.31,torsoTop+11*scale);ctx.lineTo(packX+packW*.39,torsoTop+torsoH-5*scale);ctx.stroke();

    const badgeY=torsoTop+torsoH*.50;
    ctx.fillStyle='#071a2b';ctx.strokeStyle=celebrating?'#bef264':'#22d3ee';ctx.lineWidth=1.7*scale;
    drawRounded(ctx,packX-14*scale,badgeY-12.5*scale,28*scale,25*scale,6*scale);ctx.fill();ctx.stroke();
    ctx.fillStyle='#a3e635';ctx.font=`950 ${7.7*scale}px ui-monospace,monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('</>',packX,badgeY-2*scale);
    ctx.fillStyle='#7dd3fc';ctx.font=`900 ${5.8*scale}px system-ui`;ctx.fillText('BYTE',packX,badgeY+7.4*scale);

    // Neck/head. Tiny counter-motion keeps the face stable while the body runs.
    const headCounter=running?-stride*.28*scale:0;
    const headY=lerp(-82,-35,slidePose)*scale;
    ctx.fillStyle='#e8b996';drawRounded(ctx,-5*scale+headCounter,headY+8*scale,10*scale,10*scale,4*scale);ctx.fill();
    ctx.fillStyle='#f2c6a8';ctx.beginPath();ctx.arc(headCounter,headY,13.2*scale,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#071827';ctx.beginPath();ctx.arc(headCounter,headY-4*scale,13.8*scale,Math.PI,Math.PI*2);ctx.lineTo(headCounter+12*scale,headY+2*scale);ctx.quadraticCurveTo(headCounter,headY+7*scale,headCounter-12*scale,headY+2*scale);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#22d3ee';ctx.lineWidth=1.6*scale;ctx.beginPath();ctx.moveTo(headCounter-10*scale,headY-1*scale);ctx.quadraticCurveTo(headCounter,headY-5.5*scale,headCounter+10*scale,headY-1*scale);ctx.stroke();

    // Very restrained slide streaks: enough speed cue without making the body
    // itself look like it is being dragged sideways.
    if(slidePose>.45){
      ctx.globalAlpha=.18*slidePose;ctx.strokeStyle='#67e8f9';ctx.lineWidth=1.2*scale;
      ctx.beginPath();ctx.moveTo(-25*scale,-24*scale);ctx.lineTo(-38*scale,-21*scale);ctx.moveTo(25*scale,-18*scale);ctx.lineTo(38*scale,-16*scale);ctx.stroke();
    }

    // Clear feedback stays attached to BYTE for a fraction of a second. This
    // makes the successful interaction readable: a jump visibly clears OVER a
    // hurdle, while a slide leaves a low tunnel streak as BYTE passes UNDER it.
    if(runtime.clearFxTime>0){
      const fx=clamp(runtime.clearFxTime/.52,0,1);
      ctx.save();
      if(runtime.clearFxKind==='jump'){
        ctx.globalAlpha=.34*fx;
        ctx.strokeStyle='#cffafe';ctx.lineWidth=1.7*scale;
        ctx.beginPath();ctx.ellipse(0,4*scale,(22+(1-fx)*19)*scale,(5+(1-fx)*3)*scale,0,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha=.24*fx;ctx.strokeStyle='#a3e635';ctx.lineWidth=1.3*scale;
        ctx.beginPath();ctx.moveTo(-21*scale,-8*scale);ctx.quadraticCurveTo(0,-19*scale,21*scale,-8*scale);ctx.stroke();
      }else if(runtime.clearFxKind==='slide'){
        ctx.globalAlpha=.28*fx;ctx.strokeStyle='#67e8f9';ctx.lineWidth=1.45*scale;ctx.lineCap='round';
        for(const yy of [-1,5,11]){ctx.beginPath();ctx.moveTo(-34*scale,yy*scale);ctx.lineTo((-13+(1-fx)*8)*scale,yy*scale);ctx.stroke();ctx.beginPath();ctx.moveTo(13*scale,yy*scale);ctx.lineTo((38+(1-fx)*8)*scale,yy*scale);ctx.stroke();}
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function drawParticles(ctx) {
    for(const p of runtime.particles)if(p.active){const a=clamp(1-p.age/p.ttl,0,1);ctx.save();ctx.globalAlpha=a;ctx.fillStyle=p.kind==='bad'?'#fb7185':p.kind==='good'?'#bef264':p.kind==='shield'?'#fde68a':'#67e8f9';ctx.fillRect(p.x,p.y,p.size,p.size);ctx.restore();}
  }

  function render(time) {
    const ctx=runtime.ctx;if(!ctx)return;drawBackground(ctx,time);
    // Spawn arrays are chronological (older objects are closer). Drawing in
    // reverse gives correct back-to-front perspective without allocating/sorting.
    for(let i=runtime.pickups.length-1;i>=0;i-=1)drawPickup(ctx,runtime.pickups[i]);
    for(let i=runtime.obstacles.length-1;i>=0;i-=1)drawObstacle(ctx,runtime.obstacles[i]);
    if(runtime.gateGroup){for(let lane=0;lane<3;lane+=1)drawGate(ctx,lane,runtime.gateGroup.lanes[lane],runtime.gateGroup);}
    drawPlayer(ctx,time);drawParticles(ctx);
    if(runtime.state==='DIFFICULTY_SELECT'||runtime.state==='MISSION_INTRO'||runtime.state==='ROUND_COMPLETE'||runtime.state==='GAME_OVER'){ctx.fillStyle='rgba(2,6,23,.16)';ctx.fillRect(0,0,runtime.view.w,runtime.view.h);}
  }

  function frame(time) {
    runtime.raf=0;if(!runtime.open)return;const dt=clamp((time-(runtime.lastFrame||time))/1000,0,.034);runtime.lastFrame=time;
    if(runtime.state==='COUNTDOWN')updateCountdown(dt);else if(runtime.state==='RUNNING')updateRun(dt);else updateParticles(dt);
    render(time);runtime.raf=requestAnimationFrame(frame);
  }
  function startLoop(){if(!runtime.raf&&runtime.open){runtime.lastFrame=performance.now();runtime.raf=requestAnimationFrame(frame);}}

  function returnToHub(){const cb=runtime.onBack;closeInternal();try{cb?.();}catch(_){}}
  function closeAll(){const cb=runtime.onClose;closeInternal();try{cb?.();}catch(_){}}
  function closeInternal(){
    if(!runtime.open)return;cancelUnclaimedRound();runtime.open=false;runtime.state='CLOSED';runtime.pointer=null;runtime.overlay.hidden=true;document.body.classList.remove('byte-runner-html-active');if(runtime.raf)cancelAnimationFrame(runtime.raf);runtime.raf=0;clearTimeout(runtime.resizeTimer);runtime.questionBox.hidden=true;runtime.pausePanel.hidden=true;
  }

  function open(options={}) {
    build();runtime.bridge=options.bridge||window.ICT8_XP_MINIGAMES_BRIDGE||null;runtime.onBack=typeof options.onBack==='function'?options.onBack:null;runtime.onClose=typeof options.onClose==='function'?options.onClose:null;runtime.onReward=typeof options.onReward==='function'?options.onReward:null;
    const snap=runtime.bridge?.getSnapshot?.()||{};const record=snap.gameRecords?.[STATE_KEY]||{};runtime.soundEnabled=snap.soundEnabled!==false;runtime.soundBtn.textContent=runtime.soundEnabled?'🔊':'🔇';runtime.bestScore=Math.max(0,Number(record.bestArcadeScore||record.bestScore||0));runtime.bestAccuracy=Math.max(0,Number(record.bestAccuracy||0));runtime.bestCombo=Math.max(0,Number(record.bestCombo||0));runtime.bestDifficultyRank=Math.max(0,Number(record.bestDifficultyRank||0));runtime.open=true;runtime.overlay.hidden=false;document.body.classList.add('byte-runner-html-active');runtime.difficulty=DIFFICULTIES.easy;runtime.mission=null;resetRunData(true);showDifficultySelect();requestAnimationFrame(()=>{resizeCanvas();startLoop();});
  }

  window.ICT8ByteRunnerHtmlRush=Object.freeze({open,close:closeInternal,isOpen:()=>runtime.open,pauseForExitGuard:()=>{if(runtime.state==='RUNNING'){pauseGame('exit-guard');return true;}return false;},resumeFromExitGuard:()=>{if(runtime.state==='PAUSED'){resumeGame();return true;}return false;}});
})();
