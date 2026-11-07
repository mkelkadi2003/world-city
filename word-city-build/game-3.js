/* ============================================================
   Mini-games: Level 1 Word Detective + Level 2 Secret Agent
   ============================================================ */

const AGENT_PARAGRAPH = [
  'PEOPLE love living in Word City.',
  'Every morning, PEOPLE visit the busy market.',
  'The PEOPLE in our city are kind and clever.',
  'When PEOPLE work together, problems get solved.',
  'Smart PEOPLE always check their writing.',
  'Word City needs PEOPLE with big ideas!'
];

function startMiniGame(levelNumber){
  stopMissionTimer();
  sound('swish');
  if(levelNumber === 1) startDetectiveGame();
  else if(levelNumber === 2) startSwapGame();
  else if(levelNumber === 3) startHospitalGame();
  else if(levelNumber === 4) startFinalQuiz();
  scrollLevelTop();
}

function renderMiniGame(){
  if(!activeGame) return;
  if(activeGame.type === 'detective') renderDetective();
  else if(activeGame.type === 'swap') renderSwap();
  else if(activeGame.type === 'hospital') renderHospital();
  else if(activeGame.type === 'final') renderFinalQuiz();
}

function backToLesson(){
  cleanupGameSession();
  const level = LEVELS[currentLevel - 1];
  currentSlide = level ? level.slides.length - 1 : 0;
  renderLevel();
  scrollLevelTop();
  sound('click');
}

function gameTopline(kicker, title){
  return `
    <div class="game-topline">
      <button class="btn btn-ghost btn-small" type="button" data-level-action="back-lesson">← LESSON</button>
      <div class="game-mission-title"><span class="mission-dot"></span>${escapeHtml(kicker)}</div>
    </div>
    <div class="game-card">
      <span class="game-kicker">${escapeHtml(title)}</span>
  `;
}

/* ============================================================
   LEVEL 1 — WORD DETECTIVE
   ============================================================ */
function startDetectiveGame(){
  activeGame = { type: 'detective', step: 0, attempts: 0 };
  $('levelStepPill').textContent = 'Mini game • Case 1 / 2';
  renderDetective();
}

function detectiveStars(){
  if(activeGame.attempts === 0) return 3;
  if(activeGame.attempts <= 2) return 2;
  return 1;
}

function detectivePoints(){
  return 100 + Math.max(0, 2 - activeGame.attempts) * 15;
}

function renderDetective(){
  if(!activeGame || activeGame.type !== 'detective') return;
  const game = activeGame;
  let caseHtml = '';
  let sideHtml = '';

  if(game.step === 0){
    $('levelStepPill').textContent = 'Mini game • Case 1 / 2';
    caseHtml = `
      <div class="case-file">
        <span class="case-stamp">🔎 CASE FILE #1</span>
        <p class="case-sentence">The cat is cute. The cat is funny. The cat is smart.</p>
        <p class="case-question">Which animal word appears three times?</p>
        <div class="answer-grid">
          <button class="answer-btn" type="button" data-l1-option="cat">cat</button>
          <button class="answer-btn" type="button" data-l1-option="cute">cute</button>
          <button class="answer-btn" type="button" data-l1-option="funny">funny</button>
          <button class="answer-btn" type="button" data-l1-option="smart">smart</button>
        </div>
        <div class="feedback-box" id="l1Feedback">🔍 Count the animal word in each sentence.</div>
      </div>
    `;
    sideHtml = `
      <div class="detective-side">
        <span class="detective-emoji">🕵️</span>
        <div>
          <h3>Captain Word’s clue</h3>
          <p>Check every clue before you answer.</p>
        </div>
        <div class="clue-ticket">CASE 1<br>Find the repeated animal word.</div>
      </div>
    `;
  }else if(game.step === 1){
    $('levelStepPill').textContent = 'Mini game • Case 2 / 2';
    caseHtml = `
      <div class="case-success"><span>🎉</span>Case #1 cracked! <strong>CAT</strong> appears three times.</div>
      <div class="case-file">
        <span class="case-stamp">🔎 CASE FILE #2</span>
        <p class="case-sentence">The <mark>cat</mark> is cute. The <mark>cat</mark> is funny. The <mark>cat</mark> is smart.</p>
        <p class="case-question">Which tool changes all three cats to dogs?</p>
        <div class="answer-grid">
          <button class="answer-btn" type="button" data-l1-option="find-next">Find Next</button>
          <button class="answer-btn" type="button" data-l1-option="replace">Replace</button>
          <button class="answer-btn" type="button" data-l1-option="replace-all">Replace All</button>
          <button class="answer-btn" type="button" data-l1-option="zoom">Zoom In</button>
        </div>
        <div class="feedback-box" id="l1Feedback">Which button changes <strong>every match at once</strong>?</div>
      </div>
    `;
    sideHtml = `
      <div class="detective-side">
        <span class="detective-emoji">🧠</span>
        <div>
          <h3>Detective thinking</h3>
          <p>Find Next checks one match. Replace changes one. Replace All changes every match.</p>
        </div>
        <div class="clue-ticket">CASE 2<br>Need all 3? Choose the ALL button.</div>
      </div>
    `;
  }else{
    $('levelStepPill').textContent = 'Mini game • Case solved!';
    caseHtml = `
      <div class="case-success"><span>🏆</span>Both cases solved! You are a true Word Detective.</div>
      <div class="transform-sentence">The <mark>dog</mark> is cute. The <mark>dog</mark> is funny. The <mark>dog</mark> is smart.</div>
      <div class="lesson-note green" style="margin-top:12px"><span class="note-icon">🚀</span><span><strong>Replace All</strong> changed all 3 CATs to DOGs in one click.</span></div>
      <div class="claim-row">
        <button class="btn btn-primary" type="button" data-level-action="claim-detective">⭐ CLAIM MY STARS</button>
      </div>
    `;
    sideHtml = `
      <div class="detective-side">
        <span class="detective-emoji">🏅</span>
        <div>
          <h3>Badge ready!</h3>
          <p>You found the repeated word and chose the speediest tool.</p>
        </div>
        <div class="clue-ticket">Stars: ${detectiveStars()} / 3<br>Points: ${detectivePoints()}</div>
      </div>
    `;
  }

  $('levelContent').innerHTML = `
    <div class="game-shell">
      ${gameTopline('Word Detective • Level 1', '🕵️ Case files')}
        <div class="detective-wrap">
          ${caseHtml}
          ${sideHtml}
        </div>
      </div>
    </div>
  `;
  const feedback = $('l1Feedback');
  if(feedback && game.step < 2){
    feedback.className = 'feedback-box';
  }
}

function handleDetectiveAnswer(answer){
  if(!activeGame || activeGame.type !== 'detective') return;
  const game = activeGame;
  const feedback = $('l1Feedback');
  if(game.step === 0){
    if(answer === 'cat'){
      game.step = 1;
      sound('correct');
      renderDetective();
    }else{
      game.attempts++;
      if(feedback){
        feedback.className = 'feedback-box bad';
        feedback.textContent = 'Not quite! Look for the word in all three sentences.';
      }
      sound('wrong');
    }
    return;
  }

  if(game.step === 1){
    if(answer === 'replace-all'){
      game.step = 2;
      sound('win');
      launchConfetti(45);
      renderDetective();
    }else{
      game.attempts++;
      if(feedback){
        feedback.className = 'feedback-box bad';
        feedback.textContent = answer === 'replace'
          ? 'Replace changes only one cat. You need all three changed.'
          : 'That tool does not change every word. Look for Replace All.';
      }
      sound('wrong');
    }
  }
}

/* ============================================================
   LEVEL 2 — SECRET AGENT FIND & SWAP
   ============================================================ */
function newSwapGame(started = false){
  return {
    type: 'swap',
    started,
    failed: false,
    success: false,
    timeLeft: 60,
    find: '',
    replace: '',
    replaced: [false, false, false, false, false, false],
    current: -1,
    attempts: 0,
    usedReplaceAll: false,
    hintShown: false,
    feedback: { text: '', type: '' }
  };
}

function startSwapGame(){
  activeGame = newSwapGame(false);
  $('levelStepPill').textContent = 'Mission • Briefing';
  renderSwap();
}

function stopMissionTimer(){
  if(missionTimerId){
    window.clearInterval(missionTimerId);
    missionTimerId = null;
  }
}

function startSwapTimer(){
  stopMissionTimer();
  if(!activeGame || activeGame.type !== 'swap' || !activeGame.started || activeGame.success || activeGame.failed) return;
  missionTimerId = window.setInterval(() => {
    if(!activeGame || activeGame.type !== 'swap' || activeGame.success || activeGame.failed){
      stopMissionTimer();
      return;
    }
    activeGame.timeLeft = Math.max(0, activeGame.timeLeft - 1);
    updateSwapTimerDisplay();
    if(activeGame.timeLeft <= 0){
      stopMissionTimer();
      activeGame.started = false;
      activeGame.failed = true;
      activeGame.current = -1;
      renderSwap();
      sound('wrong');
    }
  }, 1000);
}

function updateSwapTimerDisplay(){
  if(!activeGame || activeGame.type !== 'swap') return;
  const timer = $('missionTimer');
  if(!timer) return;
  timer.textContent = String(activeGame.timeLeft);
  timer.classList.toggle('low', activeGame.timeLeft <= 10);
}

function swapReward(){
  if(!activeGame) return { stars: 1, points: 120 };
  const usedAll = activeGame.usedReplaceAll;
  const stars = usedAll
    ? (activeGame.timeLeft >= 30 ? 3 : activeGame.timeLeft >= 15 ? 2 : 1)
    : (activeGame.timeLeft >= 20 ? 2 : 1);
  const points = 120 + (usedAll ? activeGame.timeLeft * 2 : 20);
  return { stars, points };
}

function swapProgressCount(){
  return activeGame.replaced.filter(Boolean).length;
}

function buildAgentParagraph(){
  let matchIndex = 0;
  return AGENT_PARAGRAPH.map((sentence) => {
    const html = sentence.replace(/PEOPLE/g, () => {
      const index = matchIndex++;
      const isReplaced = activeGame.replaced[index];
      const isCurrent = activeGame.current === index && !isReplaced;
      return `<span class="match${isReplaced ? ' replaced' : ''}${isCurrent ? ' current' : ''}">${isReplaced ? 'CITIZENS' : 'PEOPLE'}</span>`;
    });
    return `<p>${html}</p>`;
  }).join('');
}

function swapInputsAreCorrect(requireReplace = true){
  const findOk = activeGame.find.trim().toLowerCase() === 'people';
  const replaceOk = !requireReplace || activeGame.replace.trim().toLowerCase() === 'citizens';
  return { findOk, replaceOk, ok: findOk && replaceOk };
}

function setSwapFeedback(message, type = 'info'){
  if(!activeGame) return;
  activeGame.feedback = { text: message, type };
  renderSwap();
}

function renderSwap(){
  if(!activeGame || activeGame.type !== 'swap') return;
  const game = activeGame;
  const progress = swapProgressCount();
  const reward = swapReward();

  let content = '';

  if(game.success){
    $('levelStepPill').textContent = 'Mission • Accomplished';
    content = `
      <div class="mission-success">
        <div class="success-emblem">🎉</div>
        <span class="game-kicker">🕵️ MISSION ACCOMPLISHED</span>
        <h2>Secret Agent, you did it!</h2>
        <p class="brief-sub">Every PEOPLE is now a CITIZEN.</p>
        <div class="mission-score"><span class="spark">⏱️</span> ${game.timeLeft} seconds left <span>•</span> ${game.usedReplaceAll ? 'Replace All used' : 'Fixed one by one'}</div>
        <div class="agent-stars">
          ${[0, 1, 2].map((index) => `<span class="${index < reward.stars ? 'earned' : ''}">★</span>`).join('')}
        </div>
        <div class="win-rewards">
          <span class="reward-chip">💎 +${reward.points} points</span>
          <span class="reward-chip badge">🕵️ Secret Agent badge</span>
        </div>
        <div class="claim-row" style="justify-content:center">
          <button class="btn btn-primary btn-big" type="button" data-swap-action="claim">🕵️ COLLECT MY BADGE</button>
        </div>
      </div>
    `;
  }else if(game.failed){
    $('levelStepPill').textContent = 'Mission • Time up';
    content = `
      <div class="mission-failed">
        <div class="fail-emoji">⏰</div>
        <span class="game-kicker">MISSION PAUSED</span>
        <h2>Time’s up, Agent!</h2>
        <p class="brief-sub">Time ran out. Use <strong>PEOPLE</strong> in Find and <strong>CITIZENS</strong> in Replace. Then click <strong>Replace All</strong>.</p>
        <div class="brief-rule" style="margin-bottom:18px"><span>FIND</span><span class="word-chip">PEOPLE</span><span>→</span><span>REPLACE</span><span class="word-chip new">CITIZENS</span></div>
        <div class="claim-row" style="justify-content:center">
          <button class="btn btn-primary btn-big" type="button" data-swap-action="retry">↻ TRY AGAIN — 60 SECONDS</button>
        </div>
      </div>
    `;
  }else if(!game.started){
    $('levelStepPill').textContent = 'Mission • Briefing';
    content = `
      <div class="mission-brief">
        <div class="brief-emblem">🕵️</div>
        <span class="game-kicker">🕵️ SECRET MISSION 002</span>
        <h2>Operation: Citizens</h2>
        <p class="brief-sub">Change every PEOPLE to CITIZENS before time runs out.</p>
        <div class="brief-rule">
          <span>FIND</span><span class="word-chip">PEOPLE</span>
          <span>→</span>
          <span>REPLACE</span><span class="word-chip new">CITIZENS</span>
        </div>
        <div class="brief-grid">
          <div class="brief-mini"><b>TIME</b><span>60 seconds on the clock</span></div>
          <div class="brief-mini"><b>MATCHES</b><span>6 PEOPLE hiding inside</span></div>
          <div class="brief-mini"><b>TOOL</b><span>Replace All = every match</span></div>
        </div>
        <button class="btn btn-primary btn-big" type="button" data-swap-action="start">⏱️ START 60-SECOND MISSION</button>
      </div>
    `;
  }else{
    $('levelStepPill').textContent = 'Mission • In progress';
    content = `
      <div class="timer-panel">
        <div>
          <div class="timer-label">Time remaining</div>
          <div class="timer-value${game.timeLeft <= 10 ? ' low' : ''}" id="missionTimer">${game.timeLeft}</div>
        </div>
        <div class="mission-progress-mini">
          <div style="display:flex;justify-content:space-between;align-items:center"><small>MISSION PROGRESS</small><small>${progress} / 6</small></div>
          <div class="track"><span style="width:${(progress / 6) * 100}%"></span></div>
        </div>
        <div class="timer-side">Find PEOPLE<br>Replace with CITIZENS</div>
      </div>
      <div class="agent-instructions"><span class="tip-icon">💡</span><span>Type PEOPLE and CITIZENS. Then click <strong>Replace All</strong>.</span></div>
      <div class="agent-layout">
        <div class="agent-document">
          <div class="agent-document-bar"><span>📄 Word City News</span><span class="classified">TOP SECRET</span></div>
          <div class="agent-page">${buildAgentParagraph()}</div>
          <div class="agent-document-footer"><span>Document 002</span><span>${progress} of 6 citizens created</span></div>
        </div>
        <div class="replace-machine">
          <div class="machine-head"><strong>🔍 Find &amp; Replace</strong><span>Agent gadget</span></div>
          <div class="field-group">
            <label for="swapFindInput">Find</label>
            <div class="field-with-icon"><span class="field-icon">🔍</span><input id="swapFindInput" type="text" data-swap-input="find" value="${escapeAttr(game.find)}" placeholder="Type the old word" autocomplete="off" spellcheck="false"></div>
          </div>
          <div class="field-group">
            <label for="swapReplaceInput">Replace with</label>
            <div class="field-with-icon"><span class="field-icon">✏️</span><input id="swapReplaceInput" type="text" data-swap-input="replace" value="${escapeAttr(game.replace)}" placeholder="Type the new word" autocomplete="off" spellcheck="false"></div>
          </div>
          <div class="machine-buttons">
            <button class="machine-btn" type="button" data-swap-action="find">➡️ Find Next</button>
            <button class="machine-btn" type="button" data-swap-action="replace">✏️ Replace</button>
            <button class="machine-btn all" type="button" data-swap-action="all">🚀 Replace All</button>
          </div>
          <button class="hint-button" type="button" data-swap-action="hint">💡 Need a hint?</button>
          <div class="agent-hint${game.hintShown ? ' show' : ''}">Find: <strong>PEOPLE</strong> &nbsp; Replace: <strong>CITIZENS</strong> &nbsp; Then click <strong>Replace All</strong>.</div>
        </div>
      </div>
      <div class="feedback-box ${game.feedback.type || ''}" id="swapFeedback" aria-live="polite">${game.feedback.text || 'Agent gadget is ready. Type the mission words!'}</div>
      <div class="mission-progress-wrap">
        <div class="mission-progress-top"><span>Mission progress</span><span>${progress} / 6 matches</span></div>
        <div class="mission-progress-track"><div class="mission-progress-fill" style="width:${(progress / 6) * 100}%"></div></div>
      </div>
    `;
  }

  $('levelContent').innerHTML = `
    <div class="game-shell">
      ${gameTopline('Secret Agent HQ • Level 2', '🕵️ Find & Swap Mission')}
        ${content}
      </div>
    </div>
  `;

  if(game.started && !game.success && !game.failed){
    updateSwapTimerDisplay();
  }
}

function finishSwapSuccess(){
  activeGame.success = true;
  activeGame.started = false;
  stopMissionTimer();
  launchConfetti(65);
  sound('win');
  renderSwap();
  scrollLevelTop();
}

function handleSwapAction(action){
  if(!activeGame || activeGame.type !== 'swap') return;
  const game = activeGame;

  if(action === 'start'){
    game.started = true;
    game.failed = false;
    game.success = false;
    game.timeLeft = 60;
    game.feedback = { text: 'Mission started! Type PEOPLE and CITIZENS, then click Replace All.', type: 'info' };
    renderSwap();
    scrollLevelTop();
    startSwapTimer();
    sound('unlock');
    return;
  }

  if(action === 'retry'){
    activeGame = newSwapGame(true);
    activeGame.feedback = { text: 'Second chance, Agent! You have 60 seconds.', type: 'info' };
    renderSwap();
    scrollLevelTop();
    startSwapTimer();
    sound('correct');
    return;
  }

  if(action === 'hint'){
    game.hintShown = !game.hintShown;
    renderSwap();
    return;
  }

  if(action === 'claim'){
    const reward = swapReward();
    completeLevel(2, {
      stars: reward.stars,
      points: reward.points,
      percent: 100,
      message: 'You replaced every PEOPLE with CITIZENS and earned the Secret Agent badge.'
    });
    return;
  }

  if(!game.started || game.failed || game.success) return;

  const validation = swapInputsAreCorrect(action !== 'find');

  if(action === 'find'){
    if(!validation.findOk){
      game.attempts++;
      setSwapFeedback('Find needs PEOPLE. Check your spelling.', 'bad');
      sound('wrong');
      return;
    }
    let nextIndex = game.replaced.findIndex((replaced, index) => !replaced && index !== game.current);
    if(nextIndex === -1) nextIndex = game.replaced.findIndex((replaced) => !replaced);
    if(nextIndex === -1){
      setSwapFeedback('All 6 matches are already CITIZENS. Nothing left to find!', 'good');
      return;
    }
    game.current = nextIndex;
    setSwapFeedback(`🔍 Found match ${nextIndex + 1}. Click Replace for one, or Replace All for all.`, 'info');
    sound('swish');
    return;
  }

  if(action === 'replace'){
    if(!validation.ok){
      game.attempts++;
      setSwapFeedback('Check both fields: PEOPLE → CITIZENS.', 'bad');
      sound('wrong');
      return;
    }
    if(game.current === -1 || game.replaced[game.current]){
      const nextIndex = game.replaced.findIndex((replaced) => !replaced);
      if(nextIndex === -1){
        setSwapFeedback('Every match is already fixed. Well done, Agent!', 'good');
        return;
      }
      game.current = nextIndex;
      setSwapFeedback(`Found match ${nextIndex + 1}. Now click Replace again to swap it.`, 'info');
      sound('swish');
      return;
    }
    game.replaced[game.current] = true;
    game.current = -1;
    game.feedback = { text: '✏️ One match changed. Replace All changes the rest.', type: 'info' };
    if(swapProgressCount() === 6){
      finishSwapSuccess();
      return;
    }
    renderSwap();
    sound('correct');
    return;
  }

  if(action === 'all'){
    if(!validation.ok){
      game.attempts++;
      setSwapFeedback('Check your words: PEOPLE → CITIZENS.', 'bad');
      sound('wrong');
      return;
    }
    if(swapProgressCount() === 6){
      setSwapFeedback('Success! Every PEOPLE is already CITIZENS.', 'good');
      return;
    }
    game.replaced = game.replaced.map(() => true);
    game.current = -1;
    game.usedReplaceAll = true;
    finishSwapSuccess();
  }
}

function handleSwapInput(target){
  if(!activeGame || activeGame.type !== 'swap') return;
  if(target.dataset.swapInput === 'find') activeGame.find = target.value;
  if(target.dataset.swapInput === 'replace') activeGame.replace = target.value;
}
