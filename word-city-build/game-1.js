'use strict';

/* ============================================================
   WORD CITY — game core
   State, sound, screens, city map, modal and certificate helpers
   ============================================================ */

const STORAGE_KEY = 'wordCityUltimate_v1';
const MAX_LEVEL = 4;
const MAX_STARS = 12;

const $ = (id) => document.getElementById(id);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

let state = loadState();
let currentLevel = 1;
let currentSlide = 0;
let activeGame = null;
let missionTimerId = null;
let justUnlockedLevel = null;
let completionContext = null;
let toastTimeout = null;
let guideTimeout = null;
let audioCtx = null;

function defaultState(){
  return {
    playerName: '',
    completed: [false, false, false, false],
    stars: [0, 0, 0, 0],
    points: [0, 0, 0, 0],
    unlocked: 1,
    sound: true,
    finalScore: 0
  };
}

function loadState(){
  const base = defaultState();
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return base;
    const saved = JSON.parse(raw);
    if(!saved || typeof saved !== 'object') return base;
    if(typeof saved.playerName === 'string') base.playerName = saved.playerName.slice(0, 30);
    if(Array.isArray(saved.completed)){
      for(let i = 0; i < 4; i++) base.completed[i] = Boolean(saved.completed[i]);
    }
    if(Array.isArray(saved.stars)){
      for(let i = 0; i < 4; i++) base.stars[i] = clamp(Number(saved.stars[i]) || 0, 0, 3);
    }
    if(Array.isArray(saved.points)){
      for(let i = 0; i < 4; i++) base.points[i] = Math.max(0, Number(saved.points[i]) || 0);
    }
    base.unlocked = clamp(Number(saved.unlocked) || 1, 1, MAX_LEVEL);
    base.sound = saved.sound !== false;
    base.finalScore = clamp(Number(saved.finalScore) || 0, 0, 100);
    for(let i = 0; i < 3; i++){
      if(base.completed[i]) base.unlocked = Math.max(base.unlocked, i + 2);
    }
    return base;
  }catch(error){
    return base;
  }
}

function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(error){
    /* Storage can be unavailable in private browsing. The game still works. */
  }
}

function clamp(value, min, max){
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value){
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value){
  return escapeHtml(value).replaceAll('\n', ' ');
}

function completedCount(){
  return state.completed.filter(Boolean).length;
}

function totalStars(){
  return state.stars.reduce((sum, value) => sum + value, 0);
}

function totalPoints(){
  return state.points.reduce((sum, value) => sum + value, 0);
}

function nextLevelToPlay(){
  for(let i = 0; i < MAX_LEVEL; i++){
    if(!state.completed[i]) return i + 1;
  }
  return MAX_LEVEL;
}

/* ---------------- Sound effects ---------------- */
function getAudioContext(){
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if(!AudioCtor) return null;
  if(!audioCtx) audioCtx = new AudioCtor();
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(frequency, startOffset, duration, type = 'sine', volume = 0.05){
  const ctx = getAudioContext();
  if(!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + startOffset;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function sound(name){
  if(!state.sound) return;
  try{
    switch(name){
      case 'click':
        tone(520, 0, 0.08, 'triangle', 0.035);
        break;
      case 'correct':
        tone(523.25, 0, 0.13, 'sine', 0.05);
        tone(659.25, 0.1, 0.14, 'sine', 0.045);
        tone(783.99, 0.22, 0.2, 'sine', 0.045);
        break;
      case 'wrong':
        tone(210, 0, 0.14, 'sawtooth', 0.028);
        tone(155, 0.13, 0.2, 'sawtooth', 0.024);
        break;
      case 'star':
        tone(880, 0, 0.1, 'triangle', 0.04);
        tone(1174.66, 0.09, 0.14, 'triangle', 0.038);
        break;
      case 'unlock':
        tone(392, 0, 0.13, 'triangle', 0.04);
        tone(523.25, 0.12, 0.13, 'triangle', 0.04);
        tone(659.25, 0.24, 0.15, 'triangle', 0.04);
        tone(1046.5, 0.38, 0.32, 'sine', 0.04);
        break;
      case 'win':
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((note, index) => {
          tone(note, index * 0.11, 0.24, 'sine', 0.045);
        });
        break;
      case 'swish':
        tone(760, 0, 0.06, 'triangle', 0.022);
        tone(980, 0.05, 0.06, 'triangle', 0.018);
        break;
      default:
        tone(520, 0, 0.08, 'triangle', 0.03);
    }
  }catch(error){
    /* Sound is an enhancement, never a blocker. */
  }
}

function toggleSound(){
  state.sound = !state.sound;
  saveState();
  updateHUD();
  if(state.sound) sound('correct');
  showToast(state.sound ? 'Sound turned on 🔊' : 'Sound turned off 🔇', 'info');
}

/* ---------------- Confetti ---------------- */
function launchConfetti(amount = 70){
  const layer = $('confettiLayer');
  if(!layer) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ff5ca8', '#ffd83d', '#4b7bff', '#8a5cf6', '#12b886', '#ff9f43', '#ffffff'];
  const fragment = document.createDocumentFragment();
  for(let i = 0; i < amount; i++){
    const piece = document.createElement('span');
    const isStar = Math.random() < 0.12;
    const isCircle = Math.random() < 0.25;
    piece.className = `confetti-piece${isCircle ? ' circle' : ''}${isStar ? ' star' : ''}`;
    if(isStar) piece.textContent = Math.random() > 0.5 ? '⭐' : '✦';
    else piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.9}s`;
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 360}px`);
    piece.style.setProperty('--spin', `${Math.random() * 1300 - 650}deg`);
    fragment.appendChild(piece);
  }
  layer.appendChild(fragment);
  window.setTimeout(() => {
    while(layer.firstChild) layer.removeChild(layer.firstChild);
  }, 4800);
}

/* ---------------- Toast ---------------- */
function showToast(message, type = 'info'){
  const toast = $('toast');
  if(!toast) return;
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.className = `toast${type && type !== 'info' ? ` toast-${type}` : ''} show`;
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2700);
}

/* ---------------- HUD ---------------- */
function updateHUD(){
  const done = completedCount();
  const stars = totalStars();
  const points = totalPoints();

  const progressFill = $('hudProgressFill');
  const progressText = $('hudProgressText');
  const progressTrack = $('hudProgressTrack');
  const starsEl = $('hudStars');
  const pointsEl = $('hudPoints');
  const soundBtn = $('hudSoundBtn');
  const introSoundBtn = $('introSoundBtn');
  const certBtn = $('hudCertBtn');

  if(progressFill) progressFill.style.width = `${(done / MAX_LEVEL) * 100}%`;
  if(progressText) progressText.textContent = `${done} / ${MAX_LEVEL} levels`;
  if(progressTrack){
    progressTrack.setAttribute('aria-valuenow', String(done));
  }
  if(starsEl) starsEl.textContent = String(stars);
  if(pointsEl) pointsEl.textContent = String(points);
  if(soundBtn){
    soundBtn.textContent = state.sound ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-label', state.sound ? 'Turn sound off' : 'Turn sound on');
  }
  if(introSoundBtn){
    introSoundBtn.textContent = state.sound ? '🔊' : '🔇';
    introSoundBtn.setAttribute('aria-label', state.sound ? 'Turn sound off' : 'Turn sound on');
  }
  if(certBtn) certBtn.classList.toggle('show', state.completed.every(Boolean));
}

/* ---------------- Screen navigation ---------------- */
function showScreen(screenId){
  $$('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenId);
  });
  const inGame = screenId === 'cityScreen' || screenId === 'levelScreen';
  document.body.classList.toggle('in-game', inGame);
  updateHUD();
  window.scrollTo(0, 0);
}

function scrollLevelTop(){
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showIntro(){
  cleanupGameSession();
  showScreen('introScreen');
  const input = $('playerNameInput');
  if(input) input.value = state.playerName || '';
  renderSavedNote();
}

function renderSavedNote(){
  const note = $('savedNote');
  const text = $('savedNoteText');
  if(!note || !text) return;
  const done = completedCount();
  const hasSave = done > 0 || state.unlocked > 1;
  note.classList.toggle('show', hasSave);
  if(hasSave){
    text.textContent = `Adventure saved: ${done}/4 levels • ⭐ ${totalStars()} • 💎 ${totalPoints()}`;
  }
}

function showObjectives(){
  cleanupGameSession();
  savePlayerNameFromInput();
  showScreen('objectivesScreen');
}

function showCity(){
  cleanupGameSession();
  currentLevel = 1;
  currentSlide = 0;
  showScreen('cityScreen');
  renderCity();
  updateGuide();
}

function openLevel(levelNumber){
  const level = LEVELS[levelNumber - 1];
  if(!level) return;
  if(levelNumber > state.unlocked){
    showToast(`Level ${levelNumber} is locked. Finish Level ${levelNumber - 1}.`, 'warn');
    sound('wrong');
    return;
  }
  cleanupGameSession();
  currentLevel = levelNumber;
  currentSlide = 0;
  activeGame = null;

  const screen = $('levelScreen');
  screen.dataset.theme = level.theme;
  $('levelEmblem').textContent = level.icon;
  $('levelEyebrow').textContent = `LEVEL ${levelNumber} • ${level.tagline.toUpperCase()}`;
  $('levelTitle').textContent = level.name;
  showScreen('levelScreen');
  renderLevel();
  sound('swish');
}

function savePlayerNameFromInput(){
  const input = $('playerNameInput');
  if(!input) return;
  const name = input.value.trim().slice(0, 30);
  state.playerName = name;
  saveState();
}

function cleanupGameSession(){
  stopMissionTimer();
  activeGame = null;
}

/* ---------------- City map ---------------- */
function buildingStarsMarkup(stars){
  return [0, 1, 2].map((index) => `<span class="${index < stars ? 'earned' : ''}">★</span>`).join('');
}

function renderCity(){
  const grid = $('buildingsGrid');
  if(!grid) return;
  grid.innerHTML = LEVELS.map((level, index) => {
    const number = index + 1;
    const locked = number > state.unlocked;
    const complete = state.completed[index];
    const stars = state.stars[index];
    const lines = level.buildingLines.map((line) => escapeHtml(line)).join('<br>');
    const status = locked
      ? `Locked. Complete Level ${number - 1} first.`
      : `${level.name}. ${complete ? `Completed with ${stars} stars.` : 'Ready to play.'}`;
    return `
      <button
        class="city-building b${number}${locked ? ' is-locked' : ''}${complete ? ' is-complete' : ''}"
        type="button"
        data-level="${number}"
        aria-label="${escapeAttr(status)}"
        aria-disabled="${locked ? 'true' : 'false'}"
      >
        <span class="b-level">LEVEL ${number}</span>
        <span class="b-roof" aria-hidden="true"></span>
        <span class="b-shell">
          <span class="b-sign" aria-hidden="true">${level.icon}</span>
          <span class="b-name">${lines}</span>
          <span class="b-windows" aria-hidden="true">
            <span class="b-window"></span><span class="b-window"></span>
            <span class="b-window"></span><span class="b-window"></span>
          </span>
          <span class="b-door" aria-hidden="true"><span>${level.icon}</span></span>
          <span class="b-stars" aria-hidden="true">${buildingStarsMarkup(stars)}</span>
        </span>
        <span class="b-complete" aria-hidden="true">✓</span>
        <span class="b-lock" aria-hidden="true"><span class="lock-bubble">🔒</span><span>Finish Level ${number - 1}</span></span>
      </button>
    `;
  }).join('');

  const certBtn = $('cityCertificateBtn');
  if(certBtn) certBtn.classList.toggle('show', state.completed.every(Boolean));

  if(justUnlockedLevel){
    const levelToCelebrate = justUnlockedLevel;
    justUnlockedLevel = null;
    window.setTimeout(() => {
      const building = grid.querySelector(`[data-level="${levelToCelebrate}"]`);
      if(building){
        building.classList.add('unlock-pop');
        window.setTimeout(() => building.classList.remove('unlock-pop'), 1400);
      }
      const flash = document.createElement('div');
      flash.className = 'unlock-toast-glow';
      document.body.appendChild(flash);
      window.setTimeout(() => flash.remove(), 1300);
      showToast(`🔓 Level ${levelToCelebrate} unlocked!`, 'good');
      sound('unlock');
      launchConfetti(55);
    }, 420);
  }
}

function handleBuildingClick(levelNumber, button){
  if(levelNumber > state.unlocked){
    button.classList.remove('shake');
    void button.offsetWidth;
    button.classList.add('shake');
    window.setTimeout(() => button.classList.remove('shake'), 500);
    setGuideMessage(`Locked! Finish Level ${levelNumber - 1} first.`);
    showToast(`🔒 Level ${levelNumber} is locked. Finish Level ${levelNumber - 1}.`, 'warn');
    sound('wrong');
    return;
  }
  sound('click');
  openLevel(levelNumber);
}

function updateGuide(){
  const total = completedCount();
  if(total === MAX_LEVEL){
    setGuideMessage(`Word City is saved! You are an Ultimate Word Superhero${state.playerName ? `, ${state.playerName}` : ''}!`);
    return;
  }
  const next = nextLevelToPlay();
  if(total === 0){
    setGuideMessage(`Welcome${state.playerName ? `, ${state.playerName}` : ''}! Tap the glowing Academy.`);
  }else{
    setGuideMessage(`Level ${next} is unlocked! Tap the glowing building.`);
  }
}

function setGuideMessage(message){
  const guide = $('guideText');
  if(!guide) return;
  guide.textContent = message;
  window.clearTimeout(guideTimeout);
  guideTimeout = window.setTimeout(() => {
    updateGuide();
  }, 7000);
}

/* ---------------- Modal helpers ---------------- */
function openModal(innerHtml, options = {}){
  const root = $('modalRoot');
  if(!root) return;
  const dismissible = Boolean(options.dismissible);
  root.innerHTML = `
    <div class="modal-backdrop"${dismissible ? ' data-modal-action="close"' : ''}></div>
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Word City message">
      ${dismissible ? '<button class="modal-close" type="button" data-modal-action="close" aria-label="Close">✕</button>' : ''}
      ${innerHtml}
    </div>
  `;
  root.classList.add('open');
  document.body.classList.add('modal-open');
  window.setTimeout(() => {
    const focusTarget = root.querySelector('button');
    if(focusTarget) focusTarget.focus({ preventScroll: true });
  }, 60);
}

function closeModal(){
  const root = $('modalRoot');
  if(!root) return;
  root.classList.remove('open');
  root.innerHTML = '';
  document.body.classList.remove('modal-open');
  completionContext = null;
}

function confirmRestart(){
  openModal(`
    <div class="win-modal">
      <div class="win-icon" style="background:radial-gradient(circle,#ffe6e6,#ffc4c4)">↻</div>
      <div class="win-kicker">Start again?</div>
      <h2>Restart adventure?</h2>
      <p class="win-message">Stars, points and unlocked buildings will reset. Your name will be kept.</p>
      <div class="win-actions">
        <button class="btn btn-primary" type="button" data-modal-action="restart">YES, RESTART</button>
        <button class="btn btn-ghost" type="button" data-modal-action="close">KEEP PLAYING</button>
      </div>
    </div>
  `, { dismissible: true });
}

function resetAdventure(){
  const name = state.playerName;
  state = defaultState();
  state.playerName = name;
  currentLevel = 1;
  currentSlide = 0;
  justUnlockedLevel = null;
  try{ localStorage.removeItem(STORAGE_KEY); }catch(error){}
  saveState();
  closeModal();
  cleanupGameSession();
  showIntro();
  showToast('Adventure restarted. Word City needs you again!', 'good');
  launchConfetti(40);
}

/* ---------------- Certificate ---------------- */
function showCertificate(){
  cleanupGameSession();
  renderCertificate();
  showScreen('certificateScreen');
  launchConfetti(110);
  sound('win');
}

function renderCertificate(){
  const name = state.playerName || 'Word Hero';
  $('certificateName').textContent = name;
  $('cerStars').textContent = String(totalStars());
  $('cerPoints').textContent = String(totalPoints());
  $('cerScore').textContent = `${state.finalScore || 0}%`;
  $('certificateDate').textContent = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}
