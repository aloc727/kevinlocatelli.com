/* ═══════════════════════════════════════════════════════
   EVERGLADES: River of Grass Adventure  —  Game Engine v3
   Features: randomized Q+A, power-downs, bot AI, multiplayer UI
═══════════════════════════════════════════════════════ */

/* ── MAZE CONSTANTS ── */
const COLS = 19, ROWS = 13;

// Maximum achievable score:
//   1,900 pts quiz  (12 questions × up to 150 pts, one Double XP power-up)
//   +500 pts maze-speed bonus  (Lightning tier)
//   +300 pts power-up reserve  (4 unused × 75 pts; Speed Boost always auto-uses)
// Solo/bot max ~2875 (quiz+speed+PU reserve); add 400 race bonus for MP → 3275.
// Set to 3500 as a round ceiling with buffer for all modes.
const MAX_LEGIT_SCORE = 3500;
const W = 0, P = 1, S = 3, U = 4, E = 5, D = 6; // cell types

/* ══════════════════════════════════════════════
   QUESTION BANKS  (Kevin's research only)
   ans = exact text of the correct option
══════════════════════════════════════════════ */
const STATIONS = [
  {
    id: 0, label: '🗺️  AREA 1: BASIC INFO', color: '#6dff4a',
    bank: [
      { q: 'WHEN WAS EVERGLADES NATIONAL PARK ESTABLISHED?',
        opts: ['1947','1932','1956','1902'], ans: '1947' },
      { q: 'HOW MANY SQUARE MILES IS THE EVERGLADES?',
        opts: ['2,357','1,200','5,000','890'], ans: '2,357' },
      { q: 'WHAT IS THE AVERAGE ANNUAL RAINFALL IN THE EVERGLADES?',
        opts: ['60 INCHES','30 INCHES','100 INCHES','45 INCHES'], ans: '60 INCHES' },
      { q: 'HOW MANY VISITORS DOES THE EVERGLADES GET PER YEAR?',
        opts: ['1 MILLION','500,000','5 MILLION','100,000'], ans: '1 MILLION' },
      { q: 'WHAT REGION OF THE U.S. IS THE EVERGLADES IN?',
        opts: ['SOUTHEAST','NORTHEAST','SOUTHWEST','MIDWEST'], ans: 'SOUTHEAST' },
      { q: 'WHAT STATE IS THE EVERGLADES LOCATED IN?',
        opts: ['SOUTHERN FLORIDA','GEORGIA','LOUISIANA','SOUTH CAROLINA'], ans: 'SOUTHERN FLORIDA' },
      { q: 'WHAT IS THE HIGHEST OBSERVATION POINT IN THE EVERGLADES?',
        opts: ['SHARK VALLEY OBSERVATION TOWER','PINE ISLAND LOOKOUT','FLORIDA BAY SUMMIT','ANHINGA PEAK'],
        ans: 'SHARK VALLEY OBSERVATION TOWER' },
      { q: 'WHAT CITY IS THE EVERGLADES PARK ADDRESS IN?',
        opts: ['HOMESTEAD, FL','MIAMI, FL','ORLANDO, FL','TAMPA, FL'], ans: 'HOMESTEAD, FL' },
    ]
  },
  {
    id: 1, label: '🌿  AREA 2: LANDFORMS', color: '#00e06a',
    bank: [
      { q: 'THE EVERGLADES IS THE ONLY PLACE ON EARTH WHERE THESE TWO ANIMALS LIVE TOGETHER — WHICH PAIR?',
        opts: ['ALLIGATORS & CROCODILES','ALLIGATORS & IGUANAS','CROCODILES & PYTHONS','TURTLES & MANATEES'],
        ans: 'ALLIGATORS & CROCODILES' },
      { q: 'WHAT DOES AN "ESTUARINE ECOSYSTEM" MEAN?',
        opts: ['CONNECTS FRESHWATER & SALTWATER','ONLY HAS SALTWATER','ONLY HAS FRESHWATER','HAS NO WATER'],
        ans: 'CONNECTS FRESHWATER & SALTWATER' },
      { q: 'HOW DOES WATER MOVE IN THE EVERGLADES WETLANDS?',
        opts: ['IT DRAINS SLOWLY','IT FLOWS RAPIDLY','IT STAYS PERFECTLY STILL','IT MOVES UPHILL'],
        ans: 'IT DRAINS SLOWLY' },
      { q: 'WHICH AREA OF THE EVERGLADES HAS AN ESTUARINE ECOSYSTEM?',
        opts: ['TEN THOUSAND ISLANDS','PINE ISLAND','SHARK VALLEY','FLORIDA CITY'],
        ans: 'TEN THOUSAND ISLANDS' },
      { q: 'WHICH ANIMALS ARE FOUND IN THE EVERGLADES WETLANDS?',
        opts: ['ALLIGATORS, TOAD FISH & CROCODILES','LIONS, TIGERS & BEARS','SHARKS & DOLPHINS','WOLVES & FOXES'],
        ans: 'ALLIGATORS, TOAD FISH & CROCODILES' },
      { q: 'WHAT TWO TYPES OF HABITATS DOES THE EVERGLADES HAVE?',
        opts: ['DRY AND WET','TROPICAL AND ARCTIC','DESERT AND OCEAN','FOREST AND MOUNTAIN'],
        ans: 'DRY AND WET' },
      { q: 'WHICH OF THESE BIRDS IS FOUND IN THE EVERGLADES?',
        opts: ['EGRET','PENGUIN','PUFFIN','TOUCAN'], ans: 'EGRET' },
    ]
  },
  {
    id: 2, label: '🌦️  AREA 3: WEATHER', color: '#00d4ff',
    bank: [
      { q: 'WHEN IS THE WET SEASON IN THE EVERGLADES?',
        opts: ['MID-MAY TO NOVEMBER','DEC TO MID-MAY','JANUARY TO MARCH','ALL YEAR ROUND'],
        ans: 'MID-MAY TO NOVEMBER' },
      { q: 'WHAT IS THE AVERAGE MAXIMUM ANNUAL TEMPERATURE?',
        opts: ['85°F (30°C)','100°F (38°C)','72°F (22°C)','95°F (35°C)'],
        ans: '85°F (30°C)' },
      { q: 'WHAT IS THE AVERAGE MINIMUM ANNUAL TEMPERATURE?',
        opts: ['65°F (18°C)','45°F (7°C)','80°F (27°C)','55°F (13°C)'],
        ans: '65°F (18°C)' },
      { q: 'WHEN IS THE DRY SEASON IN THE EVERGLADES?',
        opts: ['DECEMBER TO MID-MAY','MID-MAY TO NOVEMBER','JUNE TO SEPTEMBER','MARCH TO JULY'],
        ans: 'DECEMBER TO MID-MAY' },
      { q: 'HOW WOULD YOU DESCRIBE SUMMERS IN THE EVERGLADES?',
        opts: ['HOT AND HUMID','COLD AND DRY','MILD AND BREEZY','SNOWY AND COLD'],
        ans: 'HOT AND HUMID' },
      { q: 'WHAT IS THE TEMPERATURE RANGE DURING THE WET SEASON?',
        opts: ['LOW 90s°F','LOW 50s°F','HIGH 30s°F','HIGH 110s°F'],
        ans: 'LOW 90s°F' },
      { q: 'WHAT IS THE TEMPERATURE RANGE DURING THE DRY SEASON?',
        opts: ['LOW 50s TO HIGH 70s°F','LOW 90s°F','BELOW FREEZING','HIGH 100s°F'],
        ans: 'LOW 50s TO HIGH 70s°F' },
    ]
  },
  {
    id: 3, label: '🚣  AREA 4: ACTIVITIES', color: '#ffd700',
    bank: [
      { q: 'HOW LONG IS THE SHARK VALLEY TRAM TOUR LOOP?',
        opts: ['FIFTEEN MILES','FIVE MILES','TWENTY-FIVE MILES','TEN MILES'],
        ans: 'FIFTEEN MILES' },
      { q: 'HOW LONG DOES THE SHARK VALLEY TRAM TOUR TAKE?',
        opts: ['2 HOURS','30 MINUTES','5 HOURS','45 MINUTES'],
        ans: '2 HOURS' },
      { q: 'WHAT DOES THE SHARK VALLEY TRAM TOUR LEAD TO?',
        opts: ['THE OBSERVATION TOWER','THE BEACH','A CAMPGROUND','A WATERFALL'],
        ans: 'THE OBSERVATION TOWER' },
      { q: 'WHICH OF THESE IS A CANOE/KAYAK TRAIL?',
        opts: ['NOBLE HAMMOCK','GUMBO LIMBO TRAIL','PINELANDS TRAIL','PAHAY-OKEE OVERLOOK'],
        ans: 'NOBLE HAMMOCK' },
      { q: 'WHICH OF THESE IS A HIKING TRAIL?',
        opts: ['ANHINGA TRAIL','SANDFLY ISLAND LOOP','NINE MILE POND','TAMER RIVER'],
        ans: 'ANHINGA TRAIL' },
      { q: 'WHICH OF THESE IS A KAYAK/CANOE TRAIL?',
        opts: ['SANDFLY ISLAND LOOP','ANHINGA TRAIL','GUMBO LIMBO TRAIL','PINELANDS TRAIL'],
        ans: 'SANDFLY ISLAND LOOP' },
      { q: 'WHICH OF THESE IS A HIKING TRAIL?',
        opts: ['ECO POND TRAIL','NOBLE HAMMOCK','FLORIDA BAY','HALFWAY CREEK'],
        ans: 'ECO POND TRAIL' },
      { q: 'WHICH OF THESE IS A CANOE/KAYAK TRAIL?',
        opts: ['NINE MILE POND','WEST LAKE TRAIL','PAHAY-OKEE OVERLOOK','PINELANDS TRAIL'],
        ans: 'NINE MILE POND' },
    ]
  }
];

/* ── POWER-UP TYPES ── */
const PU_TYPES = [
  { id: 'hint',   emoji: '💡', name: 'HINT',        desc: 'REMOVES 2 WRONG ANSWERS' },
  { id: 'double', emoji: '⭐', name: 'DOUBLE XP',   desc: '2× POINTS ON NEXT QUESTION' },
  { id: 'time',   emoji: '⏱️', name: 'EXTRA TIME',  desc: '+10 SECONDS ADDED' },
  { id: 'shield', emoji: '🛡️', name: 'SHIELD',      desc: 'SURVIVE ONE WRONG ANSWER' },
  { id: 'speed',  emoji: '⚡', name: 'SPEED BOOST', desc: 'MOVE FASTER FOR 20 SECS' },
];

/* ── POWER-DOWN TYPES ── */
const PD_TYPES = [
  { id: 'mosquito',  emoji: '🦟', name: 'MOSQUITO SWARM!',   desc: 'MOVEMENT SLOWED FOR 15 SECS',    color: '#ff4444' },
  { id: 'quicksand', emoji: '💀', name: 'QUICKSAND!',         desc: '-50 POINTS!',                   color: '#ff4444' },
  { id: 'storm',     emoji: '🌪️', name: 'STORM!',             desc: 'FOG THICKENS FOR 15 SECS',      color: '#ff6600' },
  { id: 'snake',     emoji: '🐍', name: 'SNAKE BITE!',        desc: 'LOSE ONE POWER-UP!',             color: '#ff4444' },
  { id: 'flood',     emoji: '💧', name: 'FLOOD!',             desc: 'CONTROLS REVERSED FOR 10 SECS', color: '#ff6600' },
];

/* ── BOT DIFFICULTY SETTINGS ── */
// moveDelay = ticks between moves at 60fps.
// Player minimum is ~9 ticks (160ms key-repeat), but humans also think and
// backtrack, so effective average is higher.  Hard bot is fast but beatable.
const BOT_DIFF = {
  easy:   { moveDelay: 45, accuracy: 0.50, emoji: '🐢', name: 'EASY BOT' },
  medium: { moveDelay: 28, accuracy: 0.70, emoji: '🐊', name: 'MEDIUM BOT' },
  hard:   { moveDelay: 18, accuracy: 0.90, emoji: '🦅', name: 'HARD BOT' },
};

/* ══════════════════════════════════════════════
   PENDING MODE (set before username screen)
══════════════════════════════════════════════ */
let pendingMode = 'solo';
let pendingDiff = null;

function setPendingMode(mode, diff) {
  pendingMode = mode;
  pendingDiff = diff;
}

/* ══════════════════════════════════════════════
   GAME STATE
══════════════════════════════════════════════ */
let G = {};

function resetState() {
  G = {
    mode:            pendingMode,   // 'solo' | 'bot' | 'passplay'
    username:        '',
    score:           0,
    powerups:        [],
    visitedStations: new Set(),
    maze:            null,
    stationCells:    [],
    puCells:         [],
    pdCells:         [],
    exitCell:        { col: COLS-2, row: ROWS-2 },
    player: {
      col: 1, row: 1, px: 0, py: 0,
      moving: false, facing: 1,
      slowTimer: 0, stormTimer: 0, reverseTimer: 0, speedBoostTimer: 0,
    },
    bot: null,
    keys:            {},
    dpad:            { dc: 0, dr: 0 },
    animFrame:       null,
    quizState:       null,
    quizTimerInt:    null,
    pendingPowerup:  null,
    pendingPowerdown: null,
    CS:              32,
    tick:            0,
    gameOver:        false,
    mazeStartTime:   null,
    passPlayTurn:    1,   // 1 or 2 for pass-and-play
    p2score:         0,
    p2stations:      new Set(),
    mp:              null, // multiplayer session state (see MP section)
  };
}

/* ══════════════════════════════════════════════
   REAL-TIME MULTIPLAYER  (up to 10 players)
   Firebase REST API + Server-Sent Events
   Room structure: /rooms/{code}/players/{pushId}
══════════════════════════════════════════════ */
const FB_ROOMS_URL = id => `${FB_ROOT}/rooms/${id}`;

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
  let c = '';
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

// ── RACE FINISH BONUS ────────────────────────
// Position = number of others who already have doneAt set + 1.
// This avoids async sync issues — we count others who finished before us.
function calcRaceBonus(players, myId) {
  const finishedBefore = Object.entries(players || {})
    .filter(([id, p]) => id !== myId && p.doneAt).length;
  const position = finishedBefore + 1;
  const bonusList = [400, 250, 150, 100, 50];
  const pts    = bonusList[position - 1] ?? 25;
  const medals = ['🥇 1ST PLACE!', '🥈 2ND PLACE!', '🥉 3RD PLACE!'];
  const label  = medals[position - 1] || `#${position} PLACE`;
  return { pts, label, position };
}

// ── CREATE ROOM (Host) ──────────────────────
async function mpCreate() {
  const nameEl = document.getElementById('mp-create-name');
  const errEl  = document.getElementById('mp-create-error');
  errEl.textContent = '';
  const name = (nameEl.value || '').trim().toUpperCase().replace(/[<>"'&]/g, '');
  if (!name) { nameEl.focus(); nameEl.style.borderColor = '#ff4444'; setTimeout(() => nameEl.style.borderColor = '', 900); return; }
  if (containsProfanity(name)) {
    nameEl.value = ''; nameEl.placeholder = 'PLEASE CHOOSE A DIFFERENT NAME';
    nameEl.focus(); setTimeout(() => { nameEl.placeholder = 'YOUR NAME'; }, 2000);
    return;
  }
  const code = generateRoomCode();
  const seed = Math.floor(Math.random() * 999983);
  try {
    await fetch(`${FB_ROOMS_URL(code)}.json`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed, status: 'lobby', createdAt: Date.now(), hostId: '' }),
    });
    const pRes = await fetch(`${FB_ROOMS_URL(code)}/players.json`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, col:1, row:1, score:0, stations:'', done:false, doneAt:null, joinedAt:Date.now() }),
    });
    const { name: myId } = await pRes.json();
    await fetch(`${FB_ROOMS_URL(code)}/hostId.json`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(myId),
    });
    G.mp = { roomCode:code, myId, isHost:true, seed, myName:name,
             players:{[myId]:{name,col:1,row:1,score:0,stations:'',done:false,doneAt:null,joinedAt:Date.now()}},
             gameStarted:false, evtSource:null };
    mpShowWaitScreen(code);
    mpUpdateLobby();
    goTo('mp-wait');
    mpListenRoom(code);
  } catch(e) { errEl.textContent = '⚠ CONNECTION ERROR'; }
}

// ── JOIN ROOM (Guest) ───────────────────────
async function mpJoin() {
  const nameEl = document.getElementById('mp-join-name');
  const codeEl = document.getElementById('mp-join-code');
  const errEl  = document.getElementById('mp-join-error');
  errEl.textContent = '';
  const name = (nameEl.value || '').trim().toUpperCase().replace(/[<>"'&]/g, '');
  const code = (codeEl.value || '').trim().toUpperCase();
  if (!name) { nameEl.focus(); nameEl.style.borderColor = '#ff4444'; setTimeout(() => nameEl.style.borderColor = '', 900); return; }
  if (containsProfanity(name)) {
    nameEl.value = ''; nameEl.placeholder = 'PLEASE CHOOSE A DIFFERENT NAME';
    nameEl.focus(); setTimeout(() => { nameEl.placeholder = 'YOUR NAME'; }, 2000);
    return;
  }
  if (!/^[A-Z]{4}$/.test(code)) { codeEl.focus(); codeEl.style.borderColor = '#ff4444'; setTimeout(() => codeEl.style.borderColor = '', 900); return; }

  try {
    const res  = await fetch(`${FB_ROOMS_URL(code)}.json`);
    const room = await res.json();
    if (!room?.seed)              { errEl.textContent = '⚠ ROOM NOT FOUND'; return; }
    if (room.status !== 'lobby')  { errEl.textContent = '⚠ GAME ALREADY IN PROGRESS'; return; }
    const playerCount = Object.keys(room.players || {}).length;
    if (playerCount >= 10)        { errEl.textContent = '⚠ ROOM IS FULL (10/10)'; return; }

    const pRes = await fetch(`${FB_ROOMS_URL(code)}/players.json`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, col:1, row:1, score:0, stations:'', done:false, doneAt:null, joinedAt:Date.now() }),
    });
    const { name: myId } = await pRes.json();
    G.mp = { roomCode:code, myId, isHost:false, seed:room.seed, myName:name,
             players:room.players || {}, gameStarted:false, evtSource:null };
    mpShowWaitScreen(code);
    mpUpdateLobby();
    goTo('mp-wait');
    mpListenRoom(code);
  } catch(e) { errEl.textContent = '⚠ CONNECTION ERROR'; }
}

// ── LOBBY UI ─────────────────────────────────
function mpShowWaitScreen(code) {
  document.getElementById('mp-room-code-display').textContent = code;
  document.getElementById('mp-host-controls').style.display = G.mp.isHost ? 'block' : 'none';
  document.getElementById('mp-guest-wait').style.display    = G.mp.isHost ? 'none'  : 'block';
}

function mpUpdateLobby() {
  if (!G.mp) return;
  const listEl   = document.getElementById('mp-player-list');
  const countEl  = document.getElementById('mp-player-count');
  const startBtn = document.getElementById('mp-start-btn');
  if (!listEl) return;

  const entries = Object.entries(G.mp.players)
    .sort(([, a], [, b]) => (a.joinedAt || 0) - (b.joinedAt || 0));
  listEl.innerHTML = entries.map(([id, p]) => {
    const isMe = id === G.mp.myId;
    return `<div class="mp-lobby-player${isMe ? ' mp-lobby-me' : ''}">${escHtml(p.name)}${isMe ? ' ◀ YOU' : ''}</div>`;
  }).join('');

  const count = entries.length;
  if (countEl)  countEl.textContent = `${count} / 10 PLAYERS`;
  if (startBtn) {
    const ready = count >= 2;
    startBtn.disabled    = !ready;
    startBtn.textContent = ready
      ? `▶ START RACE  (${count} PLAYER${count !== 1 ? 'S' : ''})`
      : `WAITING FOR MORE PLAYERS…  (${count}/10)`;
  }
}

// ── HOST STARTS THE RACE ────────────────────
async function mpStartRace() {
  if (!G.mp || !G.mp.isHost) return;
  const startBtn = document.getElementById('mp-start-btn');
  if (startBtn) { startBtn.disabled = true; startBtn.textContent = '⏳ STARTING…'; }
  try {
    await fetch(`${FB_ROOMS_URL(G.mp.roomCode)}/status.json`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('active'),
    });
  } catch(e) {
    if (startBtn) { startBtn.disabled = false; startBtn.textContent = '▶ START RACE'; }
  }
}

// ── SSE LISTENER ────────────────────────────
function mpListenRoom(code) {
  if (G.mp && G.mp.evtSource) { try { G.mp.evtSource.close(); } catch(e) {} }
  const src = new EventSource(`${FB_ROOMS_URL(code)}.json`);
  if (G.mp) G.mp.evtSource = src;
  const handle = e => { try { const d = JSON.parse(e.data); mpHandleSSE(d.path, d.data); } catch(ex) {} };
  src.addEventListener('put',   handle);
  src.addEventListener('patch', handle);
}

function mpHandleSSE(path, data) {
  if (!G.mp || data == null) return;

  // Full room snapshot on initial connection
  if (path === '/') {
    if (data.players && typeof data.players === 'object') {
      G.mp.players = data.players;
      if (!G.mp.gameStarted) mpUpdateLobby(); else mpUpdateInGameHUD();
    }
    if (data.status === 'active' && !G.mp.gameStarted) mpBeginGame();
    return;
  }

  // Full players map replaced
  if (path === '/players') {
    G.mp.players = data || {};
    if (!G.mp.gameStarted) mpUpdateLobby(); else mpUpdateInGameHUD();
    return;
  }

  // New player joined OR position PATCH for existing player (path = /players/-KEY-)
  // Use Object.assign so a position PATCH doesn't wipe name/joinedAt/etc.
  if (path.startsWith('/players/') && path.split('/').length === 3) {
    const pid = path.split('/')[2];
    if (typeof data === 'object' && data !== null) {
      G.mp.players[pid] = Object.assign({}, G.mp.players[pid] || {}, data);
      if (!G.mp.gameStarted) mpUpdateLobby(); else mpUpdateInGameHUD();
    }
    return;
  }

  // Individual player field (path = /players/-KEY-/col)
  if (path.startsWith('/players/')) {
    const parts = path.split('/');
    const pid   = parts[2];
    const field = parts[3];
    if (!G.mp.players[pid]) G.mp.players[pid] = {};
    G.mp.players[pid][field] = data;
    if (G.mp.gameStarted) {
      mpUpdateInGameHUD();
      if (field === 'doneAt' && data && pid !== G.mp.myId) mpOtherPlayerFinished(pid);
    }
    return;
  }

  // Status changes to active — host set start
  if (path === '/status' && data === 'active' && !G.mp.gameStarted) {
    fetch(`${FB_ROOMS_URL(G.mp.roomCode)}/players.json`)
      .then(r => r.json())
      .then(players => { if (G.mp && players) G.mp.players = players; mpBeginGame(); })
      .catch(() => mpBeginGame());
  }
}

// ── BEGIN GAME ──────────────────────────────
function mpBeginGame() {
  if (!G.mp || G.mp.gameStarted) return;
  G.mp.gameStarted = true;
  const savedMp = G.mp;
  resetState();
  G.mp = savedMp;
  G.mode     = 'mp';
  G.username = savedMp.myName;
  document.getElementById('hud-name').textContent = G.username.slice(0, 20);
  updateHUDScore(); updateHUDStations();
  document.getElementById('hud-bot-block').style.display = 'flex';
  mpUpdateInGameHUD();
  buildMaze(savedMp.seed);
  goTo('maze');
  setTimeout(startGameLoop, 300);
}

// ── SYNC ─────────────────────────────────────
async function mpSyncPosition() {
  if (!G.mp) return;
  try {
    await fetch(`${FB_ROOMS_URL(G.mp.roomCode)}/players/${G.mp.myId}.json`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ col: G.player.col, row: G.player.row,
                             score: G.score, stations: [...G.visitedStations].join(',') }),
    });
  } catch(e) {}
}

async function mpSyncDone() {
  if (!G.mp) return;
  try {
    await fetch(`${FB_ROOMS_URL(G.mp.roomCode)}/players/${G.mp.myId}.json`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true, doneAt: Date.now(), score: G.score }),
    });
  } catch(e) {}
}

// ── IN-GAME HUD ──────────────────────────────
function mpUpdateInGameHUD() {
  if (!G.mp) return;
  const others       = Object.entries(G.mp.players || {}).filter(([id]) => id !== G.mp.myId);
  const doneCount    = others.filter(([, p]) => p.doneAt || p.done).length;
  const bestScore    = others.length ? Math.max(...others.map(([, p]) => p.score || 0)) : 0;
  const bestStations = others.length
    ? Math.max(...others.map(([, p]) => (p.stations || '').split(',').filter(Boolean).length))
    : 0;
  document.getElementById('hud-bot-icon').textContent     = '👥';
  document.getElementById('hud-bot-name').textContent     = `${others.length} OPPONENT${others.length !== 1 ? 'S' : ''}`;
  document.getElementById('hud-bot-score').textContent    = others.length ? bestScore : '—';
  document.getElementById('hud-bot-stations').textContent =
    doneCount > 0 ? `${doneCount} DONE` : `${bestStations}/4`;
}

function mpOtherPlayerFinished(pid) {
  const p = G.mp.players[pid];
  if (!p) return;
  const finishers = Object.entries(G.mp.players)
    .filter(([, pl]) => pl.doneAt).sort(([, a], [, b]) => a.doneAt - b.doneAt);
  const pos    = finishers.findIndex(([id]) => id === pid) + 1;
  const medals = ['🥇', '🥈', '🥉'];
  showBotNotify(`${medals[pos - 1] || '#' + pos} ${escHtml(p.name)} FINISHED!`);
  mpUpdateInGameHUD();
}

// ── CANCEL / CLEANUP ─────────────────────────
async function mpCancel() {
  if (!G.mp) { goTo('multiplayer'); return; }
  if (G.mp.evtSource) { try { G.mp.evtSource.close(); } catch(e) {} }
  try {
    if (G.mp.isHost) {
      await fetch(`${FB_ROOMS_URL(G.mp.roomCode)}.json`, { method: 'DELETE' });
    } else {
      await fetch(`${FB_ROOMS_URL(G.mp.roomCode)}/players/${G.mp.myId}.json`, { method: 'DELETE' });
    }
  } catch(e) {}
  G.mp = null;
  goTo('multiplayer');
}

async function mpCleanup() {
  if (!G.mp) return;
  const code = G.mp.roomCode;
  if (G.mp.evtSource) { try { G.mp.evtSource.close(); } catch(e) {} G.mp.evtSource = null; }
  G.mp = null;
  try { await fetch(`${FB_ROOMS_URL(code)}.json`, { method: 'DELETE' }); } catch(e) {}
}

/* ══════════════════════════════════════════════
   FIREBASE LEADERBOARD
   REST API — no SDK required
══════════════════════════════════════════════ */
const FB_ROOT = 'https://everglades-leaderboard-default-rtdb.firebaseio.com';
const FB_SCORES_URL = `${FB_ROOT}/scores.json`;
const LB_MAX = 1000;

const LB = {
  async add(name, score) {
    const entry = {
      name:     name.toUpperCase(),
      score,
      timestamp: Date.now(),
      datetime:  new Date().toLocaleString('en-US', {
        month: 'numeric', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      }),
    };
    try {
      await fetch(FB_SCORES_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(entry),
      });
      await this.prune();
    } catch (e) {
      console.error('LB.add failed:', e);
    }
  },

  async getAll() {
    try {
      const res  = await fetch(FB_SCORES_URL);
      const data = await res.json();
      if (!data) return [];
      return Object.entries(data).map(([id, val]) => ({ id, ...val }));
    } catch (e) {
      console.error('LB.getAll failed:', e);
      return [];
    }
  },

  // Delete oldest entries beyond LB_MAX, but never delete a top-10 score.
  async prune() {
    try {
      const all = await this.getAll();
      if (all.length <= LB_MAX) return;

      const top10Ids = new Set(
        [...all].sort((a, b) => b.score - a.score).slice(0, 20).map(s => s.id)
      );
      const byAge    = [...all].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      let surplus = all.length - LB_MAX;
      for (const entry of byAge) {
        if (surplus <= 0) break;
        if (!top10Ids.has(entry.id)) {
          await fetch(`${FB_ROOT}/scores/${entry.id}.json`, { method: 'DELETE' });
          surplus--;
        }
      }
    } catch (e) {
      console.error('LB.prune failed:', e);
    }
  },

};

/* ══════════════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════════════ */
const flash = document.getElementById('flash-overlay');

function goTo(id) {
  flash.classList.add('flashing');
  setTimeout(() => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
    onEnter(id);
    flash.classList.remove('flashing');
  }, 160);
}

function goToStudy(id) {
  goTo(id);
  setTimeout(() => {
    document.querySelectorAll('#screen-' + id + ' .sf, #screen-' + id + ' .temp-fill').forEach(el => {
      el.style.width = '0';
      setTimeout(() => { el.style.width = (el.dataset.w || 100) + '%'; }, 80);
    });
    document.querySelectorAll('#screen-' + id + ' .discovery').forEach((d) => {
      d.classList.remove('visible');
      setTimeout(() => d.classList.add('visible'), parseInt(d.dataset.delay || 0) + 80);
    });
  }, 200);
}

function onEnter(id) {
  if (id === 'leaderboard') renderLeaderboard();
  if (id === 'title') { pendingMode = 'solo'; pendingDiff = null; mpCleanup(); }
}

/* ══════════════════════════════════════════════
   GAME START
══════════════════════════════════════════════ */
function startGame() {
  const input = document.getElementById('username-input');
  // Strip HTML/script chars before storing or displaying the name anywhere.
  const name  = (input.value || '').trim().toUpperCase().replace(/[<>"'&]/g, '');
  if (!name) {
    input.focus(); input.style.borderColor = '#ff4444';
    setTimeout(() => input.style.borderColor = '', 800);
    return;
  }
  if (containsProfanity(name)) {
    input.value = '';
    input.placeholder = 'PLEASE CHOOSE A DIFFERENT NAME';
    input.focus(); input.style.borderColor = '#ff4444';
    setTimeout(() => { input.style.borderColor = ''; input.placeholder = 'YOUR NAME'; }, 2000);
    return;
  }

  resetState();
  G.username = name;
  G.mode = pendingMode || 'solo';

  document.getElementById('hud-name').textContent = name.slice(0, 20);
  updateHUDScore(); updateHUDStations();

  // Bot mode setup
  const botBlock = document.getElementById('hud-bot-block');
  if (G.mode === 'bot') {
    const diff = BOT_DIFF[pendingDiff || 'medium'];
    G.bot = {
      col: 1, row: 1, px: 0, py: 0,
      facing: 1, moveTimer: 0,
      moveDelay: diff.moveDelay,
      accuracy:  diff.accuracy,
      emoji:     diff.emoji,
      name:      diff.name,
      score:     0,
      visitedStations: new Set(),
      path:      [],
      quizCooldown: 0,
      done:      false,
    };
    document.getElementById('hud-bot-icon').textContent    = diff.emoji + ' BOT';
    document.getElementById('hud-bot-name').textContent    = diff.name;
    document.getElementById('hud-bot-score').textContent   = '0';
    document.getElementById('hud-bot-stations').textContent = '0/4';
    botBlock.style.display = 'flex';
  } else {
    botBlock.style.display = 'none';
  }

  buildMaze();
  goTo('maze');
  setTimeout(startGameLoop, 300);
}

/* ══════════════════════════════════════════════
   MAZE GENERATION
══════════════════════════════════════════════ */
// seed — numeric seed for deterministic maze (used in MP so both players
// get the same maze); omit / pass null for a random maze.
function buildMaze(seed) {
  const rng = seed != null ? makeRNG(seed) : null;
  const rshuf = arr => shuffle(arr, rng);

  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(W));

  function carve(x, y) {
    grid[y][x] = P;
    const dirs = rshuf([[-2,0],[2,0],[0,-2],[0,2]]);
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < COLS-1 && ny > 0 && ny < ROWS-1 && grid[ny][nx] === W) {
        grid[y + dy/2][x + dx/2] = P;
        carve(nx, ny);
      }
    }
  }
  carve(1, 1);

  grid[ROWS-2][COLS-2] = E;

  // 4 stations — one per quadrant
  const quads = [
    { minX:1, maxX:Math.floor(COLS/2), minY:1, maxY:Math.floor(ROWS/2) },
    { minX:Math.ceil(COLS/2), maxX:COLS-1, minY:1, maxY:Math.floor(ROWS/2) },
    { minX:1, maxX:Math.floor(COLS/2), minY:Math.ceil(ROWS/2), maxY:ROWS-1 },
    { minX:Math.ceil(COLS/2), maxX:COLS-1, minY:Math.ceil(ROWS/2), maxY:ROWS-1 },
  ];
  G.stationCells = [];
  rshuf([...quads]).forEach((q, i) => {
    const cell = randomPath(grid, q, [[1,1],[COLS-2,ROWS-2]], rng);
    if (cell) { grid[cell.row][cell.col] = S; G.stationCells.push({ ...cell, stationIndex: i }); }
  });

  // 5 power-ups scattered on path cells
  G.puCells = [];
  const puShuffled = rshuf([...PU_TYPES]);
  for (let i = 0; i < 5; i++) {
    const cell = randomPath(grid, { minX:1, maxX:COLS-1, minY:1, maxY:ROWS-1 }, [[1,1]], rng);
    if (cell) {
      grid[cell.row][cell.col] = U;
      G.puCells.push({ ...cell, puType: puShuffled[i % puShuffled.length], collected: false });
    }
  }

  // 2–3 power-downs placed ONLY at dead ends (always avoidable)
  const deadEnds = findDeadEnds(grid).filter(c =>
    !(c.col <= 2 && c.row <= 2) &&
    !(c.col >= COLS-3 && c.row >= ROWS-3)
  );
  G.pdCells = [];
  const numPD = Math.min(3, Math.max(2, Math.floor(deadEnds.length * 0.25)));
  const pdShuffled = rshuf([...PD_TYPES]);
  rshuf(deadEnds).slice(0, numPD).forEach((cell, i) => {
    grid[cell.row][cell.col] = D;
    G.pdCells.push({ ...cell, pdType: pdShuffled[i % pdShuffled.length], activated: false });
  });

  G.maze = grid;
  G.player.col = 1; G.player.row = 1;
  if (G.bot) { G.bot.col = 1; G.bot.row = 1; }
}

function findDeadEnds(grid) {
  const ends = [];
  for (let y = 1; y < ROWS-1; y++) {
    for (let x = 1; x < COLS-1; x++) {
      if (grid[y][x] !== P) continue;
      const pathNeighbors = [[0,1],[0,-1],[1,0],[-1,0]]
        .filter(([dx,dy]) => {
          const nx=x+dx, ny=y+dy;
          return nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&grid[ny][nx]!==W;
        }).length;
      if (pathNeighbors === 1) ends.push({ col: x, row: y });
    }
  }
  return ends;
}

function randomPath(grid, q, excludes, rng = null) {
  const cells = [];
  for (let y = q.minY; y < q.maxY; y++) {
    for (let x = q.minX; x < q.maxX; x++) {
      if (grid[y][x] === P) {
        if (!excludes.some(([ex,ey]) => Math.abs(x-ex)<2 && Math.abs(y-ey)<2))
          cells.push({ col: x, row: y });
      }
    }
  }
  return cells.length ? cells[Math.floor((rng || Math.random)() * cells.length)] : null;
}

/* ══════════════════════════════════════════════
   CANVAS + GAME LOOP
══════════════════════════════════════════════ */
function startGameLoop() {
  const canvas = document.getElementById('maze-canvas');
  const wrap   = document.querySelector('.canvas-wrap');

  const availW = wrap.clientWidth  - 8;
  const availH = wrap.clientHeight - 8;
  G.CS = Math.max(16, Math.min(40, Math.floor(Math.min(availW / COLS, availH / ROWS))));

  canvas.width  = COLS * G.CS;
  canvas.height = ROWS * G.CS;

  G.player.px = G.player.col * G.CS;
  G.player.py = G.player.row * G.CS;
  if (G.bot) { G.bot.px = G.bot.col * G.CS; G.bot.py = G.bot.row * G.CS; }

  // Always show dpad (useful on touch, harmless on desktop)
  if (window.innerWidth < 900 || 'ontouchstart' in window) {
    document.getElementById('dpad').style.display = 'grid';
  }

  G.mazeStartTime = Date.now();
  setupInput();
  if (G.animFrame) cancelAnimationFrame(G.animFrame);
  loop();
}

function loop() {
  G.tick++;
  G.animFrame = requestAnimationFrame(loop);
  processInput();
  updatePlayer();
  if (G.bot && !G.bot.done) updateBot();
  render();
}

/* ══════════════════════════════════════════════
   INPUT
══════════════════════════════════════════════ */
function setupInput() {
  document.onkeydown = e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) e.preventDefault();
    G.keys[e.key] = true;
  };
  document.onkeyup = e => { G.keys[e.key] = false; };
}

let dpadIv = null;
function dpadStart(dc, dr) {
  G.dpad = { dc, dr };
  if (dpadIv) clearInterval(dpadIv);
  dpadIv = setInterval(() => tryMove(G.dpad.dc, G.dpad.dr, G.player), 160);
  tryMove(dc, dr, G.player);
}
function dpadEnd() {
  G.dpad = { dc:0, dr:0 };
  if (dpadIv) { clearInterval(dpadIv); dpadIv = null; }
}

let lastMove = 0;
function processInput() {
  if (G.quizState || G.gameOver) return;
  const now = performance.now();
  const delay = G.player.slowTimer > 0 ? 280 : G.player.speedBoostTimer > 0 ? 65 : 110;
  if (now - lastMove < delay || G.player.moving) return;

  let dc = 0, dr = 0;
  // Reversed controls effect
  const rev = G.player.reverseTimer > 0;
  if      (G.keys['ArrowUp']    || G.keys['w'] || G.keys['W']) dr = rev ?  1 : -1;
  else if (G.keys['ArrowDown']  || G.keys['s'] || G.keys['S']) dr = rev ? -1 :  1;
  else if (G.keys['ArrowLeft']  || G.keys['a'] || G.keys['A']) dc = rev ?  1 : -1;
  else if (G.keys['ArrowRight'] || G.keys['d'] || G.keys['D']) dc = rev ? -1 :  1;

  if (dc !== 0 || dr !== 0) { tryMove(dc, dr, G.player); lastMove = now; }
}

function tryMove(dc, dr, entity) {
  if (entity === G.player && (G.quizState || G.player.moving || G.gameOver)) return;
  const nc = entity.col + dc, nr = entity.row + dr;
  if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) return;
  if (G.maze[nr][nc] === W) return;
  entity.col = nc; entity.row = nr; entity.moving = true;
  if (dc !== 0) entity.facing = dc;
}

/* ══════════════════════════════════════════════
   PLAYER UPDATE
══════════════════════════════════════════════ */
function updatePlayer() {
  const p = G.player;
  const targetX = p.col * G.CS, targetY = p.row * G.CS;
  const dx = targetX - p.px, dy = targetY - p.py;

  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
    p.px = targetX; p.py = targetY;
    if (p.moving) { p.moving = false; checkCell(p.col, p.row, 'player'); if (G.mode === 'mp') mpSyncPosition(); }
  } else {
    // Lerp speed: fast normally, blazing on speed boost, sluggish on slow debuff
    const lerpFactor = p.speedBoostTimer > 0 ? 0.55 : p.slowTimer > 0 ? 0.22 : 0.42;
    p.px += dx * lerpFactor; p.py += dy * lerpFactor;
  }

  if (p.slowTimer       > 0) p.slowTimer--;
  if (p.stormTimer      > 0) p.stormTimer--;
  if (p.reverseTimer    > 0) p.reverseTimer--;
  if (p.speedBoostTimer > 0) p.speedBoostTimer--;
}

/* ══════════════════════════════════════════════
   BOT AI  (BFS pathfinding)
══════════════════════════════════════════════ */
function updateBot() {
  const bot = G.bot;

  // Lerp towards target cell
  const tx = bot.col * G.CS, ty = bot.row * G.CS;
  const dx = tx - bot.px, dy = ty - bot.py;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
    bot.px = tx; bot.py = ty;
    if (bot.moving) {
      bot.moving = false;
      checkCell(bot.col, bot.row, 'bot');
    }
  } else {
    bot.px += dx * 0.3; bot.py += dy * 0.3;
  }

  if (bot.quizCooldown > 0) { bot.quizCooldown--; return; }
  if (bot.moving) return;

  bot.moveTimer++;
  if (bot.moveTimer < bot.moveDelay) return;
  bot.moveTimer = 0;

  // Find next target
  const target = getBotTarget();
  if (!target) return;

  if (bot.path.length === 0 || (G.tick % 30 === 0)) {
    bot.path = bfsPath(bot.col, bot.row, target.col, target.row);
  }

  if (bot.path.length > 0) {
    const [dc, dr] = bot.path.shift();
    tryMove(dc, dr, bot);
  }
}

function getBotTarget() {
  const bot = G.bot;
  // Find nearest incomplete station
  let nearest = null, minDist = Infinity;
  G.stationCells.forEach(sc => {
    if (!bot.visitedStations.has(sc.stationIndex)) {
      const dist = Math.abs(sc.col - bot.col) + Math.abs(sc.row - bot.row);
      if (dist < minDist) { minDist = dist; nearest = sc; }
    }
  });
  if (nearest) return nearest;
  // All stations done — head to exit
  if (bot.visitedStations.size >= STATIONS.length) return G.exitCell;
  return null;
}

function bfsPath(fromCol, fromRow, toCol, toRow) {
  if (fromCol === toCol && fromRow === toRow) return [];
  const queue   = [[fromCol, fromRow, []]];
  const visited = new Set([`${fromCol},${fromRow}`]);
  while (queue.length) {
    const [col, row, path] = queue.shift();
    for (const [dc, dr] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nc = col+dc, nr = row+dr, key = `${nc},${nr}`;
      if (!visited.has(key) && nc>=0 && nc<COLS && nr>=0 && nr<ROWS && G.maze[nr][nc] !== W) {
        visited.add(key);
        const np = [...path, [dc,dr]];
        if (nc===toCol && nr===toRow) return np;
        queue.push([nc, nr, np]);
      }
    }
  }
  return [];
}

/* ══════════════════════════════════════════════
   CELL INTERACTION
══════════════════════════════════════════════ */
function checkCell(col, row, who) {
  const cell = G.maze[row][col];

  if (cell === S) {
    const sc = G.stationCells.find(s => s.col===col && s.row===row);
    if (!sc) return;
    if (who === 'player' && !G.visitedStations.has(sc.stationIndex)) {
      openQuiz(sc.stationIndex);
    }
    if (who === 'bot' && !G.bot.visitedStations.has(sc.stationIndex)) {
      botAnswerQuiz(sc.stationIndex);
    }
  }

  if (cell === U && who === 'player') {
    const pu = G.puCells.find(p => p.col===col && p.row===row && !p.collected);
    if (pu) { pu.collected = true; G.maze[row][col] = P; showPowerupPopup(pu.puType); }
  }

  if (cell === D && who === 'player') {
    const pd = G.pdCells.find(p => p.col===col && p.row===row && !p.activated);
    if (pd) { pd.activated = true; G.maze[row][col] = P; showPowerdwonPopup(pd.pdType); }
  }

  if (cell === E) {
    if (who === 'player' && G.visitedStations.size === STATIONS.length) {
      endGame('player');
    }
    if (who === 'bot' && G.bot.visitedStations.size >= STATIONS.length) {
      G.bot.done = true;
      if (G.mode === 'bot') showBotNotify('🤖 BOT FINISHED! RACE TO THE EXIT!');
    }
  }
}

/* ══════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════ */
function render() {
  const canvas = document.getElementById('maze-canvas');
  const ctx    = canvas.getContext('2d');
  const CS     = G.CS;

  ctx.fillStyle = '#020802';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wall fills
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (G.maze[y][x] === W) {
        ctx.fillStyle = '#060e06';
        ctx.fillRect(x*CS, y*CS, CS, CS);
      }
    }
  }

  // Neon corridor edges
  ctx.save();
  ctx.strokeStyle = '#2aff0a'; ctx.lineWidth = 1.5;
  ctx.shadowColor = '#2aff0a'; ctx.shadowBlur = 6;
  for (let y = 0; y <= ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const above = y > 0    ? G.maze[y-1][x] : W;
      const below = y < ROWS ? G.maze[y][x]   : W;
      if ((above===W) !== (below===W)) {
        ctx.beginPath(); ctx.moveTo(x*CS, y*CS); ctx.lineTo((x+1)*CS, y*CS); ctx.stroke();
      }
    }
  }
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x <= COLS; x++) {
      const left  = x > 0    ? G.maze[y][x-1] : W;
      const right = x < COLS ? G.maze[y][x]   : W;
      if ((left===W) !== (right===W)) {
        ctx.beginPath(); ctx.moveTo(x*CS, y*CS); ctx.lineTo(x*CS, (y+1)*CS); ctx.stroke();
      }
    }
  }
  ctx.restore();

  // Exit portal
  drawExit(ctx, G.exitCell.col, G.exitCell.row, CS);

  // Power-ups
  G.puCells.forEach(pu => { if (!pu.collected) drawPowerup(ctx, pu, CS); });

  // Power-downs
  G.pdCells.forEach(pd => { if (!pd.activated) drawPowerdown(ctx, pd, CS); });

  // Stations
  G.stationCells.forEach(sc => drawStation(ctx, sc, CS));

  // Bot (drawn behind player, subject to fog)
  if (G.bot) drawEntity(ctx, G.bot, G.bot.emoji, '#ff6600', CS);

  // Fog of war
  const fogRadius = G.player.stormTimer > 0 ? CS * 2.8 : CS * 5.5;
  const pcx = G.player.px + CS/2, pcy = G.player.py + CS/2;
  const fog = ctx.createRadialGradient(pcx, pcy, CS*1.2, pcx, pcy, fogRadius);
  fog.addColorStop(0, 'rgba(0,0,0,0)');
  fog.addColorStop(1, 'rgba(0,0,0,0.92)');
  ctx.fillStyle = fog; ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Player glow
  const pg = ctx.createRadialGradient(pcx, pcy, 0, pcx, pcy, CS*1.2);
  pg.addColorStop(0, 'rgba(109,255,74,0.35)'); pg.addColorStop(1, 'rgba(109,255,74,0)');
  ctx.fillStyle = pg; ctx.fillRect(0, 0, canvas.width, canvas.height);

  // MP opponents — drawn AFTER fog so they're always visible through it
  if (G.mode === 'mp' && G.mp && G.mp.players) {
    Object.entries(G.mp.players).forEach(([id, p]) => {
      if (id !== G.mp.myId && p.col != null && !p.done) {
        drawEntity(ctx, { px: p.col * CS, py: p.row * CS, facing: 1 }, '🧑', '#00d4ff', CS);
      }
    });
  }

  // Player emoji
  drawEntity(ctx, G.player, '🐊', '#6dff4a', CS);

  // Reversed controls warning
  if (G.player.reverseTimer > 0 && G.tick % 30 < 20) {
    ctx.save();
    ctx.font = `${Math.round(CS * 0.5)}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('🔄 REVERSED!', canvas.width/2, 6);
    ctx.restore();
  }
}

function drawEntity(ctx, entity, emoji, glowColor, CS) {
  const cx = entity.px + CS/2, cy = entity.py + CS/2;
  ctx.save();
  // Reset any inherited state (e.g. gradient fillStyle left by the player glow
  // pass) so the emoji renders as a proper color glyph on all mobile browsers.
  ctx.globalAlpha              = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur               = 0;
  ctx.shadowColor              = 'transparent';
  ctx.fillStyle                = 'white';
  ctx.font         = `${Math.round(CS * 0.72)}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  if (entity.facing < 0) {
    ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.fillText(emoji, 0, 0);
  } else {
    ctx.fillText(emoji, cx, cy);
  }
  ctx.restore();
}

function drawStation(ctx, sc, CS) {
  const done  = G.visitedStations.has(sc.stationIndex);
  const botDone = G.bot && G.bot.visitedStations.has(sc.stationIndex);
  if (done) {
    ctx.save(); ctx.globalAlpha = 0.4;
    ctx.font = `${Math.round(CS*0.65)}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('✅', sc.col*CS+CS/2, sc.row*CS+CS/2);
    ctx.restore(); return;
  }
  const color = STATIONS[sc.stationIndex].color;
  const pulse = 0.6 + 0.4 * Math.sin(G.tick * 0.08);
  const cx = sc.col*CS+CS/2, cy = sc.row*CS+CS/2;
  ctx.save();
  const g = ctx.createRadialGradient(cx,cy,0,cx,cy,CS*0.9);
  g.addColorStop(0, color+'66'); g.addColorStop(1, color+'00');
  ctx.globalAlpha = pulse; ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx,cy,CS*0.9,0,Math.PI*2); ctx.fill();
  ctx.restore();
  const icons = ['🗺️','🌿','🌦️','🚣'];
  ctx.save(); ctx.font=`${Math.round(CS*0.6)}px serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(icons[sc.stationIndex], cx, cy);
  ctx.restore();
}

function drawPowerup(ctx, pu, CS) {
  const cx = pu.col*CS+CS/2, cy = pu.row*CS+CS/2 + Math.sin(G.tick*0.1)*3;
  const pulse = 0.5 + 0.5*Math.sin(G.tick*0.12);
  ctx.save();
  const g = ctx.createRadialGradient(cx,cy,0,cx,cy,CS*0.7);
  g.addColorStop(0,'rgba(255,215,0,0.45)'); g.addColorStop(1,'rgba(255,215,0,0)');
  ctx.globalAlpha=pulse; ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(cx,cy,CS*0.7,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.font=`${Math.round(CS*0.6)}px serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(pu.puType.emoji, cx, cy); ctx.restore();
}

function drawPowerdown(ctx, pd, CS) {
  const cx = pd.col*CS+CS/2, cy = pd.row*CS+CS/2 + Math.sin(G.tick*0.09)*2;
  const pulse = 0.5 + 0.5*Math.sin(G.tick*0.15);
  ctx.save();
  const g = ctx.createRadialGradient(cx,cy,0,cx,cy,CS*0.65);
  g.addColorStop(0,'rgba(255,50,0,0.45)'); g.addColorStop(1,'rgba(255,50,0,0)');
  ctx.globalAlpha=pulse; ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(cx,cy,CS*0.65,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.font=`${Math.round(CS*0.58)}px serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(pd.pdType.emoji, cx, cy); ctx.restore();
}

function drawExit(ctx, ex, ey, CS) {
  const active = G.visitedStations.size === STATIONS.length;
  const cx=ex*CS+CS/2, cy=ey*CS+CS/2;
  const pulse = 0.5 + 0.5*Math.sin(G.tick*0.07);
  const col = active ? '#00d4ff' : '#1a4a4a';
  ctx.save();
  const g = ctx.createRadialGradient(cx,cy,0,cx,cy,CS);
  g.addColorStop(0, col+(active?'88':'33')); g.addColorStop(1,col+'00');
  ctx.globalAlpha = active ? pulse : 0.3; ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(cx,cy,CS,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.font=`${Math.round(CS*0.65)}px serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.globalAlpha = active ? 1 : 0.3;
  ctx.fillText('🚪', cx, cy); ctx.restore();
}

/* ══════════════════════════════════════════════
   QUIZ SYSTEM
══════════════════════════════════════════════ */
function openQuiz(stationIndex) {
  const station = STATIONS[stationIndex];
  // Pick 3 random questions from bank (no repeats within this visit)
  const picked = shuffle([...station.bank]).slice(0, 3);

  G.quizState = {
    stationIndex, questions: picked,
    questionIndex: 0,
    pendingHint: false, pendingDouble: false,
    pendingShield: false, pendingTime: false,
    answered: false,
  };

  document.getElementById('quiz-station-label').textContent = station.label;
  document.getElementById('quiz-station-label').style.color = station.color;
  document.getElementById('quiz-overlay').classList.remove('hidden');
  showQuestion();
  renderQuizPowerups();
}

function showQuestion() {
  const { questions, questionIndex } = G.quizState;
  const q = questions[questionIndex];

  document.getElementById('quiz-q-num').textContent =
    `QUESTION ${questionIndex+1} / ${questions.length}`;
  document.getElementById('quiz-question').textContent = q.q;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-feedback').className = 'quiz-feedback';
  G.quizState.answered = false;

  // Shuffle the answer options so correct answer is NOT always upper-left
  let opts = shuffle([...q.opts]);

  // Hint: eliminate 2 wrong answers before displaying
  if (G.quizState.pendingHint) {
    const wrongs = opts.filter(o => o !== q.ans);
    const toRemove = shuffle(wrongs).slice(0, 2);
    opts = opts.filter(o => !toRemove.includes(o));
    G.quizState.pendingHint = false;
  }

  // Store the shuffled display order on the state so submitAnswer can reference it
  G.quizState.currentQ = q;

  const container = document.getElementById('quiz-options');
  container.innerHTML = '';
  opts.forEach(optText => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = optText;
    btn.onclick = () => submitAnswer(optText);
    container.appendChild(btn);
  });

  // Remove focus from any previously-tapped button so mobile doesn't
  // show a blue outline pre-selected on the first option of the new question.
  if (document.activeElement && document.activeElement !== document.body) {
    document.activeElement.blur();
  }

  startTimer(20);
}

function startTimer(seconds) {
  clearInterval(G.quizTimerInt);
  let remaining = seconds + (G.quizState.pendingTime ? 10 : 0);
  G.quizState.pendingTime = false;
  const bar = document.getElementById('timer-bar');
  const val = document.getElementById('timer-val');

  bar.style.background   = '#6dff4a';
  bar.style.boxShadow    = '0 0 6px #6dff4a';
  bar.style.transition   = 'none';
  bar.style.width        = '100%';
  val.textContent        = remaining;

  setTimeout(() => {
    bar.style.transition = `width ${remaining}s linear`;
    bar.style.width = '0%';
  }, 50);

  G.quizTimerInt = setInterval(() => {
    remaining--;
    val.textContent = remaining;
    if (remaining <= 5) {
      bar.style.background = '#ff4444';
      bar.style.boxShadow  = '0 0 6px #ff4444';
    }
    if (remaining <= 0) { clearInterval(G.quizTimerInt); onTimeout(); }
  }, 1000);
}

function submitAnswer(selectedText) {
  if (G.quizState.answered) return;
  if (document.activeElement) document.activeElement.blur();
  clearInterval(G.quizTimerInt);
  G.quizState.answered = true;

  const q       = G.quizState.currentQ;
  const correct = selectedText === q.ans;
  const feedback = document.getElementById('quiz-feedback');

  // Highlight buttons
  document.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.ans)          btn.classList.add('correct');
    if (btn.textContent === selectedText && !correct) btn.classList.add('wrong');
  });

  if (correct) {
    let pts    = 100;
    const time = parseInt(document.getElementById('timer-val').textContent) || 0;
    const bonus = time > 12 ? 50 : time > 6 ? 25 : 0;
    if (G.quizState.pendingDouble) { pts *= 2; G.quizState.pendingDouble = false; }
    const earned = pts + bonus;
    G.score += earned;
    feedback.textContent = bonus ? `✅ CORRECT! +${pts} PTS · SPEED BONUS +${bonus}!` : `✅ CORRECT! +${pts} PTS`;
    feedback.className = 'quiz-feedback feedback-correct';
  } else {
    if (G.quizState.pendingShield) {
      G.quizState.pendingShield = false;
      feedback.textContent = '🛡️ WRONG — SHIELD PROTECTED YOU!';
      feedback.className   = 'quiz-feedback feedback-correct';
    } else {
      G.score = Math.max(0, G.score - 25);
      feedback.textContent = `❌ WRONG! -25 PTS`;
      feedback.className   = 'quiz-feedback feedback-wrong';
    }
  }

  updateHUDScore();
  setTimeout(advanceQuiz, 1800);
}

function onTimeout() {
  if (G.quizState.answered) return;
  if (document.activeElement) document.activeElement.blur();
  G.quizState.answered = true;
  const q = G.quizState.currentQ;
  document.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.ans) btn.classList.add('correct');
  });
  const fb = document.getElementById('quiz-feedback');
  fb.textContent = `⏱️ TIME'S UP! CORRECT: ${q.ans}`;
  fb.className   = 'quiz-feedback feedback-timeout';
  G.score = Math.max(0, G.score - 25);
  updateHUDScore();
  setTimeout(advanceQuiz, 1800);
}

function advanceQuiz() {
  const { questions, questionIndex, stationIndex } = G.quizState;
  if (questionIndex + 1 < questions.length) {
    G.quizState.questionIndex++;
    showQuestion();
    renderQuizPowerups();
  } else {
    closeQuiz(stationIndex);
  }
}

function closeQuiz(stationIndex) {
  clearInterval(G.quizTimerInt);
  G.visitedStations.add(stationIndex);
  document.getElementById('quiz-overlay').classList.add('hidden');
  G.quizState = null;
  updateHUDStations();
  flash.classList.add('flashing');
  setTimeout(() => flash.classList.remove('flashing'), 100);
  if (G.mode === 'mp') mpSyncPosition();
}

function renderQuizPowerups() {
  const container = document.getElementById('quiz-pu-btns');
  container.innerHTML = '';
  G.powerups.filter(p => !p.used).forEach((pu, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-pu-btn';
    btn.innerHTML = `${pu.emoji} <span class="pu-label">${pu.name}</span>`;
    btn.onclick = () => useQuizPowerup(pu.id, btn);
    container.appendChild(btn);
  });
}

function useQuizPowerup(id, btn) {
  if (!G.quizState) return;
  const pu = G.powerups.find(p => p.id === id && !p.used);
  if (!pu) return;
  pu.used = true;
  btn.classList.add('used');

  if (id === 'hint')   { G.quizState.pendingHint   = true;  showQuestion(); }
  if (id === 'double') { G.quizState.pendingDouble  = true; }
  if (id === 'time')   { G.quizState.pendingTime    = true;  startTimer(20); }
  if (id === 'shield') { G.quizState.pendingShield  = true; }
  updatePowerupBar();
}

/* ── BOT auto-answers quiz ── */
function botAnswerQuiz(stationIndex) {
  const bot     = G.bot;
  const station = STATIONS[stationIndex];
  const picked  = shuffle([...station.bank]).slice(0, 3);
  let botScore  = 0;

  picked.forEach(q => {
    if (Math.random() < bot.accuracy) botScore += 100;
  });

  bot.score += botScore;
  bot.visitedStations.add(stationIndex);
  bot.quizCooldown = 80;  // pause at station briefly
  bot.path = [];          // recalculate path after station

  document.getElementById('hud-bot-score').textContent    = bot.score;
  document.getElementById('hud-bot-stations').textContent = `${bot.visitedStations.size}/4`;
  showBotNotify(`${bot.emoji} BOT CLEARED STATION ${stationIndex + 1}!`);
}

/* ══════════════════════════════════════════════
   POWER-UP SYSTEM
══════════════════════════════════════════════ */
function showPowerupPopup(puType) {
  if (G.animFrame) cancelAnimationFrame(G.animFrame);
  G.pendingPowerup = puType;
  document.getElementById('pu-emoji').textContent = puType.emoji;
  document.getElementById('pu-name').textContent  = puType.name;
  document.getElementById('pu-desc').textContent  = puType.desc;
  document.getElementById('powerup-popup').classList.remove('hidden');
}

function updatePowerupBar() {
  const slots  = document.getElementById('pu-slots');
  const empty  = document.getElementById('pu-empty');
  const active = G.powerups.filter(p => !p.used);
  empty.style.display = active.length ? 'none' : 'block';
  slots.innerHTML = '';
  active.forEach(pu => {
    const slot = document.createElement('div');
    slot.className = 'pu-slot';
    slot.innerHTML = `${pu.emoji} <span class="pu-label">${pu.name}</span>`;
    slot.title = pu.desc;
    slots.appendChild(slot);
  });
}

/* ══════════════════════════════════════════════
   POWER-DOWN SYSTEM
══════════════════════════════════════════════ */
function showPowerdwonPopup(pdType) {
  if (G.animFrame) cancelAnimationFrame(G.animFrame);
  G.pendingPowerdown = pdType;

  // Reuse overlay but style it differently
  const overlay = document.getElementById('powerup-popup');
  const popup   = overlay.querySelector('.pu-popup');

  // Swap to power-down styling
  overlay.dataset.pd = '1';
  document.getElementById('pu-emoji').textContent = pdType.emoji;
  document.getElementById('pu-name').textContent  = pdType.name;
  document.getElementById('pu-desc').textContent  = pdType.desc;
  document.getElementById('pu-found-label').textContent = '⚠️ HAZARD ACTIVATED!';

  popup.style.borderColor = '#ff4444';
  popup.style.boxShadow   = '0 0 40px rgba(255,68,68,0.5)';
  document.getElementById('pu-collect-btn').textContent = '😬 OK...';
  document.getElementById('pu-collect-btn').style.borderColor = '#ff4444';
  document.getElementById('pu-collect-btn').style.color = '#ff4444';

  overlay.classList.remove('hidden');
}

function closePowerupPopup() {
  const overlay = document.getElementById('powerup-popup');
  const popup   = overlay.querySelector('.pu-popup');
  overlay.classList.add('hidden');

  if (overlay.dataset.pd === '1') {
    // Apply power-down effect
    applyPowerdown(G.pendingPowerdown);
    G.pendingPowerdown = null;
    overlay.dataset.pd = '';
    // Reset styling
    popup.style.borderColor = '';
    popup.style.boxShadow   = '';
    document.getElementById('pu-found-label').textContent = '⚡ POWER-UP FOUND!';
    document.getElementById('pu-collect-btn').textContent = '▶ COLLECT!';
    document.getElementById('pu-collect-btn').style.borderColor = '';
    document.getElementById('pu-collect-btn').style.color = '';
  } else if (G.pendingPowerup) {
    const pu = { ...G.pendingPowerup, used: false };
    if (pu.id === 'speed') {
      // Speed boost activates immediately on pickup
      G.player.slowTimer = 0;
      G.player.speedBoostTimer = 20 * 60;
      pu.used = true;
    }
    G.powerups.push(pu);
    G.pendingPowerup = null;
    updatePowerupBar();
  }
  loop();
}

function applyPowerdown(pd) {
  const FPS = 60;
  if (pd.id === 'mosquito')  G.player.slowTimer    = 15 * FPS;
  if (pd.id === 'storm')     G.player.stormTimer   = 15 * FPS;
  if (pd.id === 'flood')     G.player.reverseTimer = 10 * FPS;
  if (pd.id === 'quicksand') { G.score = Math.max(0, G.score - 50); updateHUDScore(); }
  if (pd.id === 'snake') {
    const unused = G.powerups.filter(p => !p.used);
    if (unused.length) {
      const idx = G.powerups.indexOf(unused[Math.floor(Math.random()*unused.length)]);
      G.powerups.splice(idx, 1);
      updatePowerupBar();
    }
  }
}

/* ══════════════════════════════════════════════
   BOT NOTIFICATION
══════════════════════════════════════════════ */
let botNotifyTimer = null;
function showBotNotify(msg) {
  let el = document.getElementById('bot-notify');
  if (!el) {
    el = document.createElement('div');
    el.id = 'bot-notify';
    document.querySelector('.canvas-wrap').appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  if (botNotifyTimer) clearTimeout(botNotifyTimer);
  botNotifyTimer = setTimeout(() => el.classList.remove('visible'), 2200);
}

/* ══════════════════════════════════════════════
   HUD
══════════════════════════════════════════════ */
function updateHUDScore()    { document.getElementById('hud-score').textContent = G.score; }
function updateHUDStations() { document.getElementById('hud-stations').textContent = `${G.visitedStations.size}/4`; }

/* ══════════════════════════════════════════════
   MAZE SPEED BONUS
══════════════════════════════════════════════ */
function calcSpeedBonus(seconds) {
  if (seconds <  90) return { pts: 500, label: '⚡ LIGHTNING!' };
  if (seconds < 120) return { pts: 350, label: '🔥 BLAZING!'   };
  if (seconds < 180) return { pts: 200, label: '🚀 FAST!'      };
  if (seconds < 240) return { pts: 100, label: '🏃 QUICK!'     };
  if (seconds < 360) return { pts:  50, label: '👍 STEADY'     };
  return { pts: 0, label: '' };
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ══════════════════════════════════════════════
   END GAME
══════════════════════════════════════════════ */
let scoreSubmitted = false;

function endGame(winner) {
  if (G.gameOver) return;
  G.gameOver = true;
  if (G.animFrame) cancelAnimationFrame(G.animFrame);
  document.onkeydown = null; document.onkeyup = null;

  // Maze speed bonus
  const elapsedSec  = G.mazeStartTime ? Math.floor((Date.now() - G.mazeStartTime) / 1000) : 9999;
  const speedResult = calcSpeedBonus(elapsedSec);
  G.score += speedResult.pts;

  // Power-up reserve bonus — 75 pts per unused power-up carried to the exit
  const unusedPUs     = G.powerups.filter(p => !p.used);
  const puReserveBonus = unusedPUs.length * 75;
  G.score += puReserveBonus;

  // Multiplayer race bonus — calculated before any display so the score shown is final
  let raceResult = null;
  if (G.mode === 'mp' && G.mp) {
    mpSyncDone();
    raceResult = calcRaceBonus(G.mp.players, G.mp.myId);
    G.score += raceResult.pts;
    setTimeout(mpCleanup, 5000);
  }

  document.getElementById('victory-name').textContent  = G.username;
  document.getElementById('victory-score').textContent = G.score;

  const stats = document.getElementById('victory-stats');
  const rows  = [
    { label: 'STATIONS CLEARED',   val: `${G.visitedStations.size} / 4` },
    { label: 'MAZE TIME',          val: formatTime(elapsedSec) },
    { label: 'SPEED BONUS',        val: speedResult.pts > 0 ? `+${speedResult.pts} ${speedResult.label}` : '—' },
    { label: 'POWER-UPS SAVED',    val: unusedPUs.length > 0 ? `${unusedPUs.length} × 75 = +${puReserveBonus} PTS 🎒` : '0' },
  ];
  if (G.bot) {
    rows.push({ label: `${G.bot.emoji} BOT SCORE`, val: `${G.bot.score} PTS` });
    rows.push({ label: winner === 'player' ? '🏆 YOU WIN!' : '🤖 BOT WINS', val: winner === 'player' ? 'GREAT RACE!' : 'TRY AGAIN?' });
  }
  if (raceResult) {
    rows.push({ label: 'RACE FINISH',  val: raceResult.label });
    rows.push({ label: 'RACE BONUS',   val: raceResult.pts > 0 ? `+${raceResult.pts} PTS` : '—' });
  }
  rows.push({ label: 'YOUR FINAL SCORE', val: `${G.score} PTS` });

  stats.innerHTML = rows.map(r =>
    `<div class="vstat"><span class="vstat-label">${r.label}</span><span class="vstat-val">${r.val}</span></div>`
  ).join('');

  scoreSubmitted = false;
  goTo('victory');
}

async function submitScore() {
  if (scoreSubmitted) { goTo('leaderboard'); return; }
  // Reject scores that couldn't have been earned through normal play.
  if (!Number.isFinite(G.score) || G.score < 0 || G.score > MAX_LEGIT_SCORE) {
    goTo('leaderboard');
    return;
  }
  const btn = document.querySelector('#screen-victory .primary-btn');
  if (btn) { btn.textContent = '⏳ SUBMITTING...'; btn.disabled = true; }
  await LB.add(G.username, G.score);
  scoreSubmitted = true;
  if (btn) { btn.textContent = '🏆 SUBMIT SCORE'; btn.disabled = false; }
  goTo('leaderboard');
}

/* ══════════════════════════════════════════════
   LEADERBOARD
══════════════════════════════════════════════ */
async function renderLeaderboard() {
  const table       = document.getElementById('lb-table');
  const loading     = document.getElementById('lb-loading');
  const personalDiv = document.getElementById('lb-personal-best');

  loading.style.display = 'block';
  table.innerHTML       = '';
  personalDiv.innerHTML = '';

  const all = await LB.getAll();
  loading.style.display = 'none';

  if (!all.length) {
    table.innerHTML = '<div class="lb-empty">NO SCORES YET — BE THE FIRST!</div>';
    return;
  }

  const sorted  = [...all].sort((a, b) => b.score - a.score);
  const top20   = sorted.slice(0, 20);
  const medals  = ['🥇', '🥈', '🥉'];
  const curName = (G.username || '').toUpperCase();

  table.innerHTML = top20.map((s, i) => {
    const tierCls = i < 3 ? `lb-top${i+1}` : '';
    const selfCls = curName && s.name === curName ? 'lb-self' : '';
    const youTag  = selfCls ? ' <span class="lb-you">◀ YOU</span>' : '';
    return `<div class="lb-row ${tierCls} ${selfCls}">
      <div class="lb-rank">${medals[i] || '#' + (i + 1)}</div>
      <div class="lb-name">${escHtml(s.name)}${youTag}</div>
      <div class="lb-score">${Number(s.score).toLocaleString()} PTS</div>
      <div class="lb-date">${escHtml(s.datetime || s.date || '')}</div>
    </div>`;
  }).join('');

  // Personal best — only shown when the player's best score falls outside the top 20
  if (curName) {
    const myScores = all.filter(s => s.name === curName);
    if (myScores.length) {
      const myBest  = myScores.sort((a, b) => b.score - a.score)[0];
      const myRank  = sorted.findIndex(s => s.id === myBest.id) + 1;
      if (myRank > 20) {
        personalDiv.innerHTML = `
          <div class="lb-personal-header">— YOUR PERSONAL BEST —</div>
          <div class="lb-row lb-self">
            <div class="lb-rank">#${myRank}</div>
            <div class="lb-name">${escHtml(myBest.name)} <span class="lb-you">◀ YOU</span></div>
            <div class="lb-score">${Number(myBest.score).toLocaleString()} PTS</div>
            <div class="lb-date">${escHtml(myBest.datetime || myBest.date || '')}</div>
          </div>`;
      }
    }
  }
}


/* ══════════════════════════════════════════════
   FIREFLY PARTICLES
══════════════════════════════════════════════ */
const pc = document.getElementById('particles');
function createFirefly() {
  const el = document.createElement('div');
  el.className = 'firefly';
  const sx=Math.random()*window.innerWidth, sy=Math.random()*window.innerHeight;
  const dx=(Math.random()-0.5)*200, dy=(Math.random()-0.5)*200;
  const dur=4+Math.random()*6, delay=Math.random()*8;
  el.style.cssText=`left:${sx}px;top:${sy}px;animation-duration:${dur}s;animation-delay:${delay}s`;
  el.style.setProperty('--dx', dx+'px'); el.style.setProperty('--dy', dy+'px');
  if (Math.random()<0.3){ el.style.background='#6dff4a'; el.style.boxShadow='0 0 6px 2px #6dff4a'; }
  pc.appendChild(el);
  setTimeout(()=>{ el.remove(); createFirefly(); }, (dur+delay)*1000+200);
}
for (let i=0;i<18;i++) createFirefly();

/* ══════════════════════════════════════════════
   PROFANITY FILTER
   Catches obvious cases; no filter is exhaustive.
══════════════════════════════════════════════ */
const BLOCKED_WORDS = [
  // Profanity & slurs
  'fuck','shit','ass','bitch','cunt','dick','cock','pussy','piss','fag',
  'nigger','nigga','chink','spic','kike','wetback','retard','tranny',
  'whore','slut','bastard','damn','crap','prick','twat','wank','jerk',
  'arse','bollocks','bugger','tosser','shag','cum','sex','porn','nude',
  'penis','vagina','boob','tit','butt','dildo','condom','rape','kill',
  'nazi','hitler','satan',
  // Mean / taunting words
  'sucks','suck','stinks','stink','stupid','dumb','idiot','loser','moron',
  'ugly','lame','gross','smells','smelly','dummy','dork','eww','yuck',
  'worst','terrible','awful','hate','hater','garbage','trash','nasty',
  // Meme names flagged for this game
  'chungus','emungus',
];

function containsProfanity(str) {
  const lower = str.toLowerCase().replace(/[^a-z]/g, '');
  return BLOCKED_WORDS.some(w => lower.includes(w));
}

/* ══════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════ */

// Escapes HTML special characters to prevent XSS when inserting
// Firebase-sourced strings into innerHTML.
function escHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Deterministic LCG — used to seed maze generation so both MP players
// get the identical maze from the same numeric seed.
function makeRNG(seed) {
  let s = seed >>> 0;
  return () => { s = ((Math.imul(1664525, s) + 1013904223) >>> 0); return s / 0x100000000; };
}

function shuffle(arr, rng) {
  const r = rng || Math.random;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

document.addEventListener('keydown', e => {
  if (e.key==='Enter') {
    const active = document.querySelector('.screen.active');
    if (active && active.id==='screen-title') goTo('username');
  }
});
