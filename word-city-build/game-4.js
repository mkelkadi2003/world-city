/* ============================================================
   Mini-games: Level 3 Grammar Hospital + Level 4 Final Quiz
   Level completion, rewards and victory modal
   ============================================================ */

const ER_CASES = [
  {
    patient: 'Patient 01',
    short: 'He don’t like apples.',
    sentence: 'He <span class="grammar-underline">don’t</span> like apples.',
    options: [
      'He don’t likes apples.',
      'He doesn’t like apples.',
      'He not like apples.',
      'He doesn’t likes apples.'
    ],
    correct: 1,
    explanation: '“He” is singular, so we use “doesn’t”. After “doesn’t”, the verb stays as “like”.',
    diagnosis: 'Subject–verb agreement'
  },
  {
    patient: 'Patient 02',
    short: 'She go to school every day.',
    sentence: 'She <span class="grammar-underline">go</span> to school every day.',
    options: [
      'She goes to school every day.',
      'She go to school every days.',
      'She going to school every day.',
      'She gone to school every day.'
    ],
    correct: 0,
    explanation: 'With “she”, a present-tense verb usually adds -s: she goes.',
    diagnosis: 'Third-person singular verb'
  },
  {
    patient: 'Patient 03',
    short: 'They is playing football.',
    sentence: 'They <span class="grammar-underline">is</span> playing football.',
    options: [
      'They is play football.',
      'They am playing football.',
      'They are playing football.',
      'They be playing football.'
    ],
    correct: 2,
    explanation: '“They” is plural, so the correct verb is “are”: they are playing.',
    diagnosis: 'Plural subject–verb agreement'
  }
];

function startHospitalGame(){
  activeGame = {
    type: 'hospital',
    caseIndex: 0,
    wrongAttempts: 0,
    answered: false,
    selected: -1,
    wrongPicks: [],
    finished: false
  };
  $('levelStepPill').textContent = 'Mini game • Patient 1 / 3';
  renderHospital();
}

function hospitalStars(){
  if(!activeGame) return 1;
  if(activeGame.wrongAttempts === 0) return 3;
  if(activeGame.wrongAttempts <= 2) return 2;
  return 1;
}

function hospitalPoints(){
  return 150 + Math.max(0, 3 - activeGame.wrongAttempts) * 20;
}

function renderHospital(){
  if(!activeGame || activeGame.type !== 'hospital') return;
  const game = activeGame;

  if(game.finished){
    $('levelStepPill').textContent = 'Mini game • Ward cleared!';
    const stars = hospitalStars();
    $('levelContent').innerHTML = `
      <div class="game-shell">
        ${gameTopline('Grammar Hospital • Level 3', '🩺 Emergency Room')}
          <div class="hospital-finish">
            <div class="finish-emoji">🧑‍⚕️</div>
            <span class="game-kicker">🏥 EMERGENCY CLEARED</span>
            <h2>All three patients are healthy!</h2>
            <p>You fixed all three grammar problems.</p>
            <div class="care-stats">
              <span class="care-stat">🩺 3 / 3 cured</span>
              <span class="care-stat">✅ ${game.wrongAttempts === 0 ? 'Perfect diagnosis' : `${game.wrongAttempts} re-check${game.wrongAttempts === 1 ? '' : 's'}`}</span>
              <span class="care-stat">🏅 Grammar Doctor badge</span>
            </div>
            <div class="agent-stars">
              ${[0, 1, 2].map((index) => `<span class="${index < stars ? 'earned' : ''}">★</span>`).join('')}
            </div>
            <div class="win-rewards">
              <span class="reward-chip">💎 +${hospitalPoints()} points</span>
              <span class="reward-chip badge">🩺 Grammar Doctor</span>
            </div>
            <button class="btn btn-primary btn-big" type="button" data-level-action="claim-hospital">🩺 COLLECT MY BADGE</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const current = ER_CASES[game.caseIndex];
  const queue = ER_CASES.map((item, index) => {
    const done = index < game.caseIndex || (index === game.caseIndex && game.answered);
    const active = index === game.caseIndex;
    return `<div class="patient-chip${active ? ' active' : ''}${done ? ' done' : ''}"><b>${done ? '✓' : item.patient}</b>${item.short}</div>`;
  }).join('');

  const options = current.options.map((option, index) => {
    let extraClass = '';
    if(game.answered && index === current.correct) extraClass = ' correct';
    if(game.wrongPicks.includes(index)) extraClass = ' wrong';
    const disabled = game.answered || game.wrongPicks.includes(index);
    return `
      <button class="er-option${extraClass}" type="button" data-er-option="${index}" ${disabled ? 'disabled' : ''}>
        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
        <span>${escapeHtml(option)}</span>
      </button>
    `;
  }).join('');

  const feedback = game.answered
    ? `<div class="er-explanation">✅ <strong>Doctor’s note:</strong> ${escapeHtml(current.explanation)}</div>`
    : game.wrongPicks.length > 0
      ? `<div class="feedback-box bad">That sentence still has a mistake. Check the blue underline.</div>`
      : '';

  $('levelStepPill').textContent = `Mini game • Patient ${game.caseIndex + 1} / 3`;

  $('levelContent').innerHTML = `
    <div class="game-shell">
      ${gameTopline('Grammar Hospital • Level 3', '🩺 Emergency Room')}
        <div class="hospital-top">
          <div class="hospital-title"><span class="cross-icon">✚</span> Doctor Word’s Emergency Room</div>
          <span class="pill">🩺 ${game.wrongAttempts} wrong turn${game.wrongAttempts === 1 ? '' : 's'}</span>
        </div>
        <div class="waiting-room">${queue}</div>
        <div class="er-layout">
          <div class="patient-card">
            <div class="patient-card-header">
              <div class="patient-avatar">🤒</div>
              <div><small>${escapeHtml(current.patient)} • ${escapeHtml(current.diagnosis)}</small><strong>Choose the healthy sentence</strong></div>
            </div>
            <p class="sick-sentence">${current.sentence}</p>
            <p class="er-question">Which sentence makes this patient healthy again?</p>
            <div class="er-options">${options}</div>
            ${feedback}
            ${game.answered ? `<div class="er-nav"><button class="btn btn-green btn-small" type="button" data-level-action="next-patient">${game.caseIndex === ER_CASES.length - 1 ? '✅ SEE RESULTS' : 'NEXT PATIENT →'}</button></div>` : ''}
          </div>
          <aside class="doctor-panel">
            <div class="doctor-head">
              <span class="doctor-emoji">👩‍⚕️</span>
              <div><strong>Doctor Word</strong><span>Grammar specialist</span></div>
            </div>
            <p>The blue underline shows the mistake.</p>
            <div class="doctor-tip">🩺 <strong>Doctor’s tip:</strong> Check the subject and verb. “He/she” often needs “does” or -s. “They” works with “are”.</div>
            <div class="er-explanation" style="background:#fff;border-color:#d3e9e6;color:#3c6567">${game.answered ? 'Great! Read the Doctor’s note below.' : 'The verb must match the subject.'}</div>
          </aside>
        </div>
      </div>
    </div>
  `;
  if(game.answered && game.caseIndex === ER_CASES.length - 1){
    sound('star');
  }
}

function handleHospitalOption(index){
  if(!activeGame || activeGame.type !== 'hospital' || activeGame.answered || activeGame.finished) return;
  const current = ER_CASES[activeGame.caseIndex];
  if(index === current.correct){
    activeGame.answered = true;
    activeGame.selected = index;
    sound('correct');
    launchConfetti(24);
    renderHospital();
  }else{
    activeGame.wrongAttempts++;
    if(!activeGame.wrongPicks.includes(index)) activeGame.wrongPicks.push(index);
    sound('wrong');
    renderHospital();
  }
}

function nextPatient(){
  if(!activeGame || activeGame.type !== 'hospital') return;
  if(activeGame.caseIndex < ER_CASES.length - 1){
    activeGame.caseIndex++;
    activeGame.answered = false;
    activeGame.selected = -1;
    activeGame.wrongPicks = [];
    sound('click');
    renderHospital();
    scrollLevelTop();
  }else{
    activeGame.finished = true;
    sound('win');
    launchConfetti(55);
    renderHospital();
    scrollLevelTop();
  }
}

/* ============================================================
   LEVEL 4 — ULTIMATE WORD HERO QUIZ
   ============================================================ */
const FINAL_QUESTIONS = [
  {
    type: 'Shortcut',
    question: 'Which shortcut opens Find and Replace in Microsoft Word?',
    options: ['Ctrl + F', 'Ctrl + H', 'F7', 'Ctrl + S'],
    correct: 1,
    explanation: 'Ctrl + H opens the Find and Replace dialog. Ctrl + F only opens Find.'
  },
  {
    type: 'Pick the tool',
    question: 'You must change every “people” to “citizens”. Which button is best?',
    options: ['Replace', 'Find Next', 'Replace All', 'Undo'],
    correct: 2,
    explanation: 'Replace All changes every match in one click, so it is perfect for a long document.'
  },
  {
    type: 'True or False',
    question: 'In supported versions of Word, a blue underline can show a grammar issue.',
    options: ['True', 'False'],
    correct: 0,
    explanation: 'Yes. In supported versions, blue can signal a possible grammar problem. The Editor panel gives more detail.'
  },
  {
    type: 'Shortcut',
    question: 'Which key opens Spelling & Grammar in Word?',
    options: ['F7', 'Ctrl + H', 'Enter', 'F1'],
    correct: 0,
    explanation: 'Press F7 to open Spelling & Grammar. You can also use Review → Spelling & Grammar.'
  },
  {
    type: 'Grammar check',
    question: 'Choose the sentence with correct grammar.',
    options: ['They is playing football.', 'They are playing football.', 'They be playing football.', 'They am playing football.'],
    correct: 1,
    explanation: '“They” is plural, so it needs “are”: They are playing football.'
  },
  {
    type: 'Pick the tool',
    question: 'You want to check the next match before changing it. Which button do you click?',
    options: ['Replace All', 'Find Next', 'Print', 'Zoom In'],
    correct: 1,
    explanation: 'Find Next jumps to the next match so you can inspect it first.'
  },
  {
    type: 'True or False',
    question: 'Replace changes one match, while Replace All changes every match.',
    options: ['True', 'False'],
    correct: 0,
    explanation: 'Correct. Replace handles one match at a time. Replace All changes every match at once.'
  },
  {
    type: 'Word Editor',
    question: 'Where can you find Spelling & Grammar in Word?',
    options: ['Home tab', 'Insert tab', 'Review tab', 'Design tab'],
    correct: 2,
    explanation: 'Open the Review tab and choose Spelling & Grammar. F7 also opens it.'
  },
  {
    type: 'Grammar check',
    question: 'Which sentence is correct?',
    options: ['She go to school every day.', 'She goes to school every day.', 'She going to school every day.', 'She gone to school every day.'],
    correct: 1,
    explanation: 'With “she”, the present-tense verb adds -s: she goes.'
  },
  {
    type: 'True or False',
    question: 'Replace All only changes the first match it finds.',
    options: ['True', 'False'],
    correct: 1,
    explanation: 'False! Replace All changes every match. “All” really means all of them.'
  }
];

function newFinalQuiz(){
  return {
    type: 'final',
    index: 0,
    score: 0,
    answered: false,
    selected: -1,
    resultsShown: false,
    attempt: 1
  };
}

function startFinalQuiz(){
  activeGame = newFinalQuiz();
  $('levelStepPill').textContent = 'Final quiz • Question 1 / 10';
  renderFinalQuiz();
}

function finalStars(score){
  if(score >= 9) return 3;
  if(score >= 8) return 2;
  if(score >= 7) return 1;
  return 0;
}

function renderFinalQuiz(){
  if(!activeGame || activeGame.type !== 'final') return;
  const game = activeGame;

  if(game.resultsShown){
    const percent = Math.round((game.score / FINAL_QUESTIONS.length) * 100);
    const passed = game.score >= 7;
    const stars = finalStars(game.score);
    $('levelStepPill').textContent = passed ? 'Final quiz • Passed!' : 'Final quiz • Try again';

    $('levelContent').innerHTML = `
      <div class="game-shell">
        ${gameTopline('Superhero Training • Level 4', '🦸 Ultimate Word Hero Quiz')}
          <div class="results-wrap">
            <div class="results-medal${passed ? '' : ' fail'}">${passed ? '🏆' : '💪'}</div>
            <span class="game-kicker">${passed ? '🎉 TRAINING COMPLETE' : '📚 KEEP TRAINING'}</span>
            <h2>${passed ? 'You passed, Word Hero!' : 'So close!'}</h2>
            <p class="result-sub">${passed ? 'You scored 70% or more and earned your certificate.' : 'You need 70% to pass. Review the feedback and try again.'}</p>
            <div class="score-display">${game.score}<small>/ 10</small><span class="percent">${percent}%</span></div>
            <div class="results-stars">
              ${[0, 1, 2].map((index) => `<span class="${index < stars ? 'earned' : ''}">★</span>`).join('')}
            </div>
            <div class="pass-rule">🎯 Pass mark: 70% &nbsp;•&nbsp; You scored ${percent}%</div>
            <div class="results-actions">
              ${passed
                ? `<button class="btn btn-primary btn-big" type="button" data-final-action="claim">🏆 CLAIM MY CERTIFICATE</button>`
                : `<button class="btn btn-primary btn-big" type="button" data-final-action="retry">↻ TRY THE QUIZ AGAIN</button>`}
              <button class="btn btn-ghost" type="button" data-level-action="go-city">🏙️ BACK TO CITY</button>
            </div>
          </div>
        </div>
      </div>
    `;
    if(passed && !game.celebrated){
      game.celebrated = true;
      sound('win');
      launchConfetti(75);
    }
    return;
  }

  const question = FINAL_QUESTIONS[game.index];
  const progress = ((game.index + 1) / FINAL_QUESTIONS.length) * 100;
  $('levelStepPill').textContent = `Final quiz • Question ${game.index + 1} / ${FINAL_QUESTIONS.length}`;

  const options = question.options.map((option, index) => {
    let extraClass = '';
    if(game.answered && index === question.correct) extraClass = ' correct';
    if(game.answered && index === game.selected && index !== question.correct) extraClass = ' wrong';
    return `
      <button class="quiz-option${extraClass}" type="button" data-final-option="${index}" ${game.answered ? 'disabled' : ''}>
        <span class="quiz-letter">${String.fromCharCode(65 + index)}</span>
        <span>${escapeHtml(option)}</span>
      </button>
    `;
  }).join('');

  let feedback = '';
  if(game.answered){
    const correct = game.selected === question.correct;
    feedback = `
      <div class="quiz-feedback ${correct ? 'good' : 'bad'}">
        <strong>${correct ? '✅ Correct!' : '💡 Not quite'}</strong>
        ${escapeHtml(question.explanation)}
      </div>
    `;
  }

  $('levelContent').innerHTML = `
    <div class="game-shell">
      ${gameTopline('Superhero Training • Level 4', '🦸 Final Challenge')}
        <div class="quiz-top">
          <span class="quiz-chip">${escapeHtml(question.type)}</span>
          <span class="quiz-score-pill"><span class="score-dot"></span> Score: ${game.score} / ${FINAL_QUESTIONS.length}</span>
        </div>
        <div class="quiz-progress"><span style="width:${progress}%"></span></div>
        <div class="quiz-question">${escapeHtml(question.question)}</div>
        <div class="quiz-options">${options}</div>
        ${feedback}
        <div class="quiz-nav">
          ${game.answered
            ? `<button class="btn btn-blue btn-small" type="button" data-final-action="next">${game.index === FINAL_QUESTIONS.length - 1 ? 'SEE MY RESULTS →' : 'NEXT QUESTION →'}</button>`
            : '<span class="pill">Choose one answer</span>'}
        </div>
      </div>
    </div>
  `;
}

function handleFinalOption(index){
  if(!activeGame || activeGame.type !== 'final' || activeGame.answered || activeGame.resultsShown) return;
  activeGame.selected = index;
  activeGame.answered = true;
  if(index === FINAL_QUESTIONS[activeGame.index].correct){
    activeGame.score++;
    sound('correct');
  }else{
    sound('wrong');
  }
  renderFinalQuiz();
}

function handleFinalAction(action){
  if(!activeGame || activeGame.type !== 'final') return;

  if(action === 'next'){
    if(activeGame.index < FINAL_QUESTIONS.length - 1){
      activeGame.index++;
      activeGame.answered = false;
      activeGame.selected = -1;
      renderFinalQuiz();
      scrollLevelTop();
      sound('click');
    }else{
      activeGame.resultsShown = true;
      renderFinalQuiz();
      scrollLevelTop();
    }
    return;
  }

  if(action === 'retry'){
    activeGame = newFinalQuiz();
    renderFinalQuiz();
    scrollLevelTop();
    sound('swish');
    return;
  }

  if(action === 'claim'){
    const percent = Math.round((activeGame.score / FINAL_QUESTIONS.length) * 100);
    if(percent < 70){
      showToast('You need at least 70% to claim the certificate. Keep training!', 'warn');
      return;
    }
    completeLevel(4, {
      stars: finalStars(activeGame.score),
      points: 100 + activeGame.score * 10,
      percent,
      scoreText: `${activeGame.score} / ${FINAL_QUESTIONS.length}`,
      message: `You scored ${percent}% in the final challenge and became the Ultimate Word Superhero!`
    });
  }
}

/* ============================================================
   Completion and victory modal
   ============================================================ */
function completeLevel(levelNumber, result){
  const level = LEVELS[levelNumber - 1];
  if(!level) return;
  const index = levelNumber - 1;
  const wasCompleted = state.completed[index];
  const previousUnlocked = state.unlocked;
  const stars = clamp(Number(result.stars) || 1, 0, 3);
  const points = Math.max(0, Number(result.points) || 0);

  state.completed[index] = true;
  state.stars[index] = Math.max(state.stars[index], stars);
  state.points[index] = Math.max(state.points[index], points);
  if(levelNumber < MAX_LEVEL){
    state.unlocked = Math.max(state.unlocked, levelNumber + 1);
  }
  if(levelNumber === MAX_LEVEL){
    state.finalScore = Math.max(state.finalScore, clamp(Number(result.percent) || 0, 0, 100));
  }

  const newlyUnlocked = levelNumber < MAX_LEVEL && previousUnlocked < levelNumber + 1;
  if(newlyUnlocked) justUnlockedLevel = levelNumber + 1;

  stopMissionTimer();
  saveState();
  updateHUD();
  renderSavedNote();
  sound('win');
  launchConfetti(100);
  completionContext = { level: levelNumber };
  showCompletionModal(levelNumber, {
    ...result,
    stars,
    points,
    newlyUnlocked,
    firstCompletion: !wasCompleted
  });
}

function showCompletionModal(levelNumber, result){
  const level = LEVELS[levelNumber - 1];
  const final = levelNumber === MAX_LEVEL;
  const isNewBest = result.firstCompletion || result.stars >= state.stars[levelNumber - 1];
  const percent = Number(result.percent) || 100;

  const nextButton = final
    ? '<button class="btn btn-primary" type="button" data-modal-action="certificate">🏆 VIEW MY CERTIFICATE</button>'
    : `<button class="btn btn-primary" type="button" data-modal-action="next-level">NEXT LEVEL: ${escapeHtml(LEVELS[levelNumber].shortName.toUpperCase())} →</button>`;

  const message = final
    ? `You scored ${percent}% and earned the Ultimate Word Superhero badge.`
    : `${escapeHtml(result.message || `You completed ${level.name}!`)}`;

  openModal(`
    <div class="win-modal">
      <div class="win-icon">${level.badgeIcon}</div>
      <div class="win-kicker">LEVEL ${levelNumber} COMPLETE</div>
      <h2>${final ? 'Word City is saved!' : 'Super job, hero!'}</h2>
      <p class="win-message">${message}</p>
      <div class="win-stars">
        ${[0, 1, 2].map((index) => `<span class="${index < result.stars ? 'earned' : ''}">★</span>`).join('')}
      </div>
      <div class="win-rewards">
        <span class="reward-chip">💎 +${result.points} points</span>
        <span class="reward-chip badge">${level.badgeIcon} ${escapeHtml(level.badgeName)}</span>
        ${final ? `<span class="reward-chip">🎯 ${percent}%</span>` : ''}
      </div>
      ${result.newlyUnlocked ? `<div class="unlock-banner">🔓 LEVEL ${levelNumber + 1} UNLOCKED — ${escapeHtml(LEVELS[levelNumber].shortName)} is ready!</div>` : ''}
      ${isNewBest && !result.firstCompletion ? '<p class="win-message" style="font-size:.72rem">Your best rewards were saved. Replay anytime to improve your stars!</p>' : ''}
      <div class="win-actions">
        ${nextButton}
        <button class="btn btn-ghost" type="button" data-modal-action="back-city">🏙️ BACK TO CITY</button>
      </div>
    </div>
  `, { dismissible: false });
}

function handleCompletionNext(){
  if(!completionContext) return;
  const level = completionContext.level;
  justUnlockedLevel = null;
  closeModal();
  if(level >= MAX_LEVEL){
    showCertificate();
  }else{
    openLevel(level + 1);
  }
}
