/* ============================================================
   Event wiring + startup
   ============================================================ */

function handleLevelAction(action, trigger, event){
  if(action === 'prev-slide'){
    previousSlide();
    return;
  }
  if(action === 'next-slide'){
    nextSlide();
    return;
  }
  if(action === 'goto-slide'){
    goToSlide(Number(trigger.dataset.slide) || 0);
    return;
  }
  if(action === 'start-game'){
    startMiniGame(currentLevel);
    return;
  }
  if(action === 'back-lesson'){
    backToLesson();
    return;
  }
  if(action === 'reveal-fix'){
    handleRevealFix(trigger);
    return;
  }
  if(action === 'next-patient'){
    nextPatient();
    return;
  }
  if(action === 'claim-detective'){
    if(!activeGame || activeGame.type !== 'detective') return;
    const stars = detectiveStars();
    const points = detectivePoints();
    completeLevel(1, {
      stars,
      points,
      percent: 100,
      message: 'You solved both Word Detective cases and chose Replace All like a true editing hero.'
    });
    return;
  }
  if(action === 'claim-hospital'){
    if(!activeGame || activeGame.type !== 'hospital') return;
    const stars = hospitalStars();
    const points = hospitalPoints();
    completeLevel(3, {
      stars,
      points,
      percent: 100,
      message: 'You cleared Doctor Word’s Emergency Room and earned the Grammar Doctor badge.'
    });
    return;
  }
  if(action === 'go-city'){
    closeModal();
    showCity();
  }
}

function bindStaticEvents(){
  $('startAdventureBtn').addEventListener('click', () => {
    savePlayerNameFromInput();
    sound('click');
    showObjectives();
  });
  $('enterCityBtn').addEventListener('click', () => {
    savePlayerNameFromInput();
    sound('click');
    showCity();
  });
  $('continueSavedBtn').addEventListener('click', () => {
    savePlayerNameFromInput();
    sound('click');
    showCity();
  });
  $('objBackBtn').addEventListener('click', () => {
    sound('click');
    showIntro();
  });
  $('objEnterCityBtn').addEventListener('click', () => {
    sound('click');
    showCity();
  });
  $('introSoundBtn').addEventListener('click', toggleSound);
  $('hudSoundBtn').addEventListener('click', toggleSound);
  $('hudResetBtn').addEventListener('click', () => {
    sound('click');
    confirmRestart();
  });
  $('hudCityBtn').addEventListener('click', () => {
    sound('click');
    showCity();
  });
  $('levelBackBtn').addEventListener('click', () => {
    sound('click');
    showCity();
  });
  $('cityCertificateBtn').addEventListener('click', () => {
    sound('click');
    showCertificate();
  });
  $('certBackBtn').addEventListener('click', () => {
    sound('click');
    showCity();
  });
  $('certPrintBtn').addEventListener('click', () => {
    sound('click');
    window.print();
  });
  $('certReplayBtn').addEventListener('click', () => {
    sound('click');
    confirmRestart();
  });

  const nameInput = $('playerNameInput');
  nameInput.addEventListener('change', savePlayerNameFromInput);
  nameInput.addEventListener('blur', savePlayerNameFromInput);
  nameInput.addEventListener('keydown', (event) => {
    if(event.key === 'Enter'){
      savePlayerNameFromInput();
      showObjectives();
    }
  });

  $('buildingsGrid').addEventListener('click', (event) => {
    const building = event.target.closest('.city-building');
    if(!building) return;
    handleBuildingClick(Number(building.dataset.level), building);
  });

  $('modalRoot').addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-modal-action]');
    if(!actionButton) return;
    const action = actionButton.dataset.modalAction;
    if(action === 'close'){
      if(actionButton.classList.contains('modal-close') || actionButton.classList.contains('modal-backdrop')){
        closeModal();
      }else{
        closeModal();
      }
      sound('click');
      return;
    }
    if(action === 'restart'){
      sound('click');
      resetAdventure();
      return;
    }
    if(action === 'next-level'){
      sound('click');
      handleCompletionNext();
      return;
    }
    if(action === 'back-city'){
      sound('click');
      closeModal();
      showCity();
      return;
    }
    if(action === 'certificate'){
      sound('click');
      closeModal();
      showCertificate();
    }
  });

  $('levelContent').addEventListener('click', (event) => {
    const quickOption = event.target.closest('[data-quick-option]');
    if(quickOption){
      handleQuickCheck(quickOption);
      return;
    }

    const demoButton = event.target.closest('[data-demo-action]');
    if(demoButton){
      handleDemoAction(demoButton);
      return;
    }

    const detectiveOption = event.target.closest('[data-l1-option]');
    if(detectiveOption){
      handleDetectiveAnswer(detectiveOption.dataset.l1Option);
      return;
    }

    const swapButton = event.target.closest('[data-swap-action]');
    if(swapButton){
      handleSwapAction(swapButton.dataset.swapAction);
      return;
    }

    const erOption = event.target.closest('[data-er-option]');
    if(erOption){
      handleHospitalOption(Number(erOption.dataset.erOption));
      return;
    }

    const finalOption = event.target.closest('[data-final-option]');
    if(finalOption){
      handleFinalOption(Number(finalOption.dataset.finalOption));
      return;
    }

    const finalAction = event.target.closest('[data-final-action]');
    if(finalAction){
      handleFinalAction(finalAction.dataset.finalAction);
      return;
    }

    const wlabAction = event.target.closest('[data-wlab-action]');
    if(wlabAction){
      handleWordLabAction(wlabAction.dataset.wlabAction);
      return;
    }

    const levelActionButton = event.target.closest('[data-level-action]');
    if(levelActionButton){
      handleLevelAction(levelActionButton.dataset.levelAction, levelActionButton, event);
    }
  });

  $('levelContent').addEventListener('input', (event) => {
    const input = event.target.closest('[data-swap-input]');
    if(input) handleSwapInput(input);
    const wlabInput = event.target.closest('[data-wlab-input]');
    if(wlabInput) handleWordLabInput(wlabInput);
  });

  document.addEventListener('keydown', (event) => {
    const modalOpen = $('modalRoot').classList.contains('open');
    if(event.key === 'Escape' && modalOpen){
      if($('modalRoot').querySelector('[data-modal-action="close"]')){
        closeModal();
      }
      return;
    }
    if(modalOpen) return;

    const active = document.activeElement;
    const typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if(typing) return;

    if($('levelScreen').classList.contains('active') && !activeGame){
      if(event.key === 'ArrowRight'){
        event.preventDefault();
        const level = LEVELS[currentLevel - 1];
        if(level && currentSlide < level.slides.length - 1) nextSlide();
      }else if(event.key === 'ArrowLeft'){
        event.preventDefault();
        previousSlide();
      }
    }
  });
}

function initGame(){
  bindStaticEvents();
  updateHUD();
  const input = $('playerNameInput');
  if(input) input.value = state.playerName || '';
  renderSavedNote();
  renderCity();
  showIntro();
}

initGame();
