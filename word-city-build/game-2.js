/* ============================================================
   Presentation content + lesson slide renderer
   ============================================================ */

function heroArt(caption = 'CAPTAIN WORD', sub = 'YOUR GUIDE') {
  return `
    <div class="hero-stand" aria-hidden="true">
      <svg class="hero-svg" viewBox="0 0 240 300"><use href="#hero-sprite"></use></svg>
    </div>
    <div class="art-caption" style="position:absolute;bottom:14px;z-index:3;text-align:center;width:100%">${caption}<div class="art-sub">${sub}</div></div>
  `;
}

const wordLabDefaultDoc = 'Our hero is brave. Every hero helps people. A hero never gives up.';
const wordLabState = { doc: wordLabDefaultDoc, find: 'hero', replace: 'legend' };

function escapeRegex(value){ return String(value).replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'); }

function updateWordLabFeedback(message){
  const el = $('wordLabFeedback');
  if(el) el.textContent = message;
}

function initWordLab(){
  const doc = $('wordLabDoc');
  const find = $('wordLabFind');
  const repl = $('wordLabReplace');
  if(doc) doc.value = wordLabState.doc;
  if(find) find.value = wordLabState.find;
  if(repl) repl.value = wordLabState.replace;
  updateWordLabFeedback('Type in the document, then try Find Next, Replace or Replace All.');
}

function handleWordLabInput(target){
  if(!target || !target.dataset) return;
  if(target.dataset.wlabInput === 'doc') wordLabState.doc = target.value;
  if(target.dataset.wlabInput === 'find') wordLabState.find = target.value;
  if(target.dataset.wlabInput === 'replace') wordLabState.replace = target.value;
}

function handleWordLabAction(action){
  const doc = $('wordLabDoc');
  const findInput = $('wordLabFind');
  const replInput = $('wordLabReplace');
  if(!doc || !findInput || !replInput) return;

  if(action === 'reset'){
    wordLabState.doc = wordLabDefaultDoc;
    wordLabState.find = 'hero';
    wordLabState.replace = 'legend';
    initWordLab();
    sound('click');
    return;
  }

  const text = doc.value;
  const term = findInput.value;
  const repl = replInput.value;
  wordLabState.doc = text;
  wordLabState.find = term;
  wordLabState.replace = repl;

  if(!term){
    updateWordLabFeedback('Type a word in Find first.');
    sound('wrong');
    return;
  }

  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();

  if(action === 'find-next'){
    let start = doc.selectionStart || 0;
    if(doc.selectionStart !== doc.selectionEnd && text.slice(doc.selectionStart, doc.selectionEnd).toLowerCase() === lowerTerm){
      start = doc.selectionEnd;
    }
    let idx = lowerText.indexOf(lowerTerm, start);
    let wrapped = false;
    if(idx === -1){
      idx = lowerText.indexOf(lowerTerm, 0);
      wrapped = idx !== -1;
    }
    if(idx === -1){
      updateWordLabFeedback('No matches found.');
      sound('wrong');
      return;
    }
    doc.focus();
    doc.setSelectionRange(idx, idx + term.length);
    const count = (lowerText.match(new RegExp(escapeRegex(lowerTerm), 'g')) || []).length;
    updateWordLabFeedback('🔍 Found a match. ' + count + ' match(es) in the document.' + (wrapped ? ' (wrapped around)' : ''));
    sound('swish');
    return;
  }

  if(action === 'replace'){
    if(doc.selectionStart !== doc.selectionEnd && text.slice(doc.selectionStart, doc.selectionEnd).toLowerCase() === lowerTerm){
      const start = doc.selectionStart;
      const end = doc.selectionEnd;
      const newText = text.slice(0, start) + repl + text.slice(end);
      doc.value = newText;
      wordLabState.doc = newText;
      doc.focus();
      doc.setSelectionRange(start, start + repl.length);
      updateWordLabFeedback('✏️ One match replaced.');
      sound('correct');
      return;
    }
    handleWordLabAction('find-next');
    return;
  }

  if(action === 'replace-all'){
    const regex = new RegExp(escapeRegex(term), 'gi');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    if(count === 0){
      updateWordLabFeedback('No matches found.');
      sound('wrong');
      return;
    }
    const newText = text.replace(regex, repl);
    doc.value = newText;
    wordLabState.doc = newText;
    updateWordLabFeedback('🚀 Replaced ' + count + ' match(es).');
    sound('win');
    return;
  }
}

function emojiArt(emoji, caption, sub = '') {
  return `
    <div class="art-emoji-scene">
      <div class="art-emoji">${emoji}</div>
      <div class="art-caption">${caption}</div>
      ${sub ? `<div class="art-sub">${sub}</div>` : ''}
    </div>
    <span class="orbit-dot o1">✦</span><span class="orbit-dot o2">⭐</span>
    <span class="orbit-dot o3">✨</span><span class="orbit-dot o4">✦</span>
  `;
}

const LEVELS = [
  {
    id: 1,
    name: 'Find & Replace Academy',
    shortName: 'Find & Replace Academy',
    tagline: 'Learn the superpower',
    icon: '🔍',
    theme: 'blue',
    buildingLines: ['Find & Replace', 'Academy'],
    gameName: 'Word Detective',
    badgeIcon: '🔍',
    badgeName: 'Find & Replace Star',
    slides: [
      {
        kicker: 'Welcome, hero!',
        title: 'Your first superpower!',
        intro: 'Change one word or every match in seconds with Find & Replace.',
        body: `
          <div class="mission-banner">
            <span class="mini-icon">🎯</span>
            <div><strong>Academy mission</strong><p>Find words fast and replace them.</p></div>
          </div>
          <div class="explain-box">
            <strong>What is Find & Replace?</strong>
            <p>Find & Replace is a Microsoft Word tool. It searches your document for a word, then swaps it for a new word. You can change one match or every match.</p>
          </div>
          <div class="mini-pill-row">
            <span class="mini-pill">🔍 Find</span>
            <span class="mini-pill">✏️ Replace</span>
            <span class="mini-pill">🚀 Replace All</span>
            <span class="mini-pill">➡️ Find Next</span>
          </div>
          <div class="lesson-note blue"><span class="note-icon">💡</span><span>No more changing words one by one!</span></div>
        `,
        art: emojiArt('🔍', 'WORD DETECTIVE', 'SUPER SPEED EDITING')
      },
      {
        kicker: 'Power #1',
        title: 'Find: your word detective',
        intro: 'Find searches your document for a word and shows every match.',
        body: `
          <div class="word-window" aria-label="Example Word document with the word hero highlighted">
            <div class="word-window-bar"><span class="win-dots"><span></span><span></span><span></span></span> The Bravest Hero.docx</div>
            <div class="word-toolbar"><span>Home</span><span>Insert</span><span>Review</span><span class="find-pill">🔍 Find: hero</span></div>
            <div class="word-page">
              <p>Once there was a brave <mark>hero</mark> in Word City.</p>
              <p>Every <mark>hero</mark> helps people with big problems.</p>
              <p>Our <mark>hero</mark> never gives up!</p>
            </div>
            <div class="word-status"><span>🔍 Find</span><span>3 matches found</span></div>
          </div>
          <div class="explain-box">
            <strong>What does Find do?</strong>
            <p>Find searches your whole document for the word you type. Word shows every place the word appears. Find does not change anything, so it is safe to use when you only want to check.</p>
          </div>
          <div class="hero-looks">
            <div class="hl-hero"><svg class="hero-svg" viewBox="0 0 240 300"><use href="#hero-sprite"></use></svg></div>
            <div class="hl-body">
              <div class="hl-doc">The <strong>hero</strong> is brave. Every <strong>hero</strong> helps.</div>
              <div class="hl-speech">🔍 I found 2 matches for “hero”!</div>
            </div>
          </div>
          <div class="lesson-note"><span class="note-icon">💡</span><span>Use Find to <strong>check</strong> a word before you change it.</span></div>
        `,
        art: emojiArt('🔎', 'FIND', 'SEARCH & DISCOVER')
      },
      {
        kicker: 'Power #2',
        title: 'Replace: the word changer',
        intro: 'Replace swaps one match for a new word.',
        body: `
          <div class="replace-visual">
            <div class="before-after"><small>Before</small><strong>hero</strong></div>
            <div class="swap-arrow" aria-hidden="true">⟶</div>
            <div class="before-after after"><small>After</small><strong>legend</strong></div>
          </div>
          <div class="explain-box">
            <strong>How does Replace work?</strong>
            <p>Replace finds the old word and changes only the match you are looking at. The other matches stay the same, so you can check each change before you make it.</p>
          </div>
          <div class="lesson-note blue"><span class="note-icon">☝️</span><span>Replace changes <strong>one match at a time</strong>. Replace All changes every match.</span></div>
        `,
        art: emojiArt('✏️', 'REPLACE', 'SWAP THE WORD')
      },
      {
        kicker: 'The two super buttons',
        title: 'Replace All vs Find Next',
        intro: 'Try both buttons on the sentence below.',
        body: `
          <div class="two-tool-grid">
            <div class="tool-card green">
              <div class="tool-icon">🚀</div>
              <h3>Replace All</h3>
              <p>Changes every match at once. Use it when a word appears many times.</p>
              <span class="tool-tag">For many matches</span>
            </div>
            <div class="tool-card">
              <div class="tool-icon">➡️</div>
              <h3>Find Next</h3>
              <p>Jumps to the next match to check it. It does not change the word.</p>
              <span class="tool-tag">For careful checking</span>
            </div>
          </div>
          <div class="explain-box">
            <strong>Which button should I use?</strong>
            <p>Use Find Next when you want to check matches one at a time. Use Replace All when every match must become the same new word.</p>
          </div>
          <div class="demo-sentence" id="heroDemo">Our <span class="hero-word">hero</span> is brave. Every <span class="hero-word">hero</span> helps. A <span class="hero-word">hero</span> never gives up.</div>
          <div class="demo-actions">
            <button class="btn btn-ghost btn-small" type="button" data-demo-action="find-next">➡️ Find Next</button>
            <button class="btn btn-green btn-small" type="button" data-demo-action="replace-all">🚀 Replace All</button>
          </div>
          <div class="demo-feedback" id="heroDemoFeedback" aria-live="polite">Press a button and watch what happens.</div>
        `,
        art: emojiArt('🚀', 'SUPER SPEED', 'REPLACE ALL')
      },
      {
        kicker: 'Secret shortcut',
        title: 'Open it with Ctrl + H',
        intro: 'Press Ctrl + H together to open Find and Replace.',
        body: `
          <div class="key-row" aria-label="Keyboard shortcut Control plus H">
            <span class="keycap">Ctrl</span><span class="keycap plus">+</span><span class="keycap">H</span>
          </div>
          <div class="explain-box">
            <strong>What does Ctrl + H open?</strong>
            <p>It opens the Find and Replace box. Type the word to find, type the new word, then choose Find Next, Replace or Replace All.</p>
          </div>
          <div class="lesson-note green"><span class="note-icon">⚡</span><span><strong>Ctrl + H</strong> is faster than using the menu.</span></div>
          <div class="quick-check" data-correct="1" data-answered="false">
            <div class="qc-heading">⚡ Quick check</div>
            <p>Which shortcut opens Find and Replace in Word?</p>
            <div class="qc-options">
              <button class="qc-option" type="button" data-quick-option="0">Ctrl + F</button>
              <button class="qc-option" type="button" data-quick-option="1">Ctrl + H</button>
              <button class="qc-option" type="button" data-quick-option="2">F7</button>
            </div>
            <div class="qc-feedback" data-hint="Not quite. Ctrl + F opens Find only." aria-live="polite"></div>
          </div>
        `,
        art: emojiArt('⌨️', 'CTRL + H', 'THE MAGIC SHORTCUT')
      },
      {
        kicker: 'Word Lab',
        title: 'Try it in Word!',
        intro: 'Type your own words and use Find & Replace right here.',
        body: `
          <div class="word-lab">
            <div class="word-lab-window">
              <div class="word-lab-bar">
                <span class="win-dots"><span></span><span></span><span></span></span>
                <span>Word Lab.docx</span>
                <span class="word-lab-tabs"><span>Home</span><span>Insert</span><span>Review</span></span>
              </div>
              <div class="word-lab-toolbar">
                <span class="word-lab-tool">🔍 Find</span>
                <span class="word-lab-tool">✏️ Replace</span>
                <span class="word-lab-tool">🚀 Replace All</span>
              </div>
              <textarea class="word-lab-doc" id="wordLabDoc" data-wlab-input="doc" rows="7" spellcheck="false"></textarea>
            </div>
            <div class="word-lab-controls">
              <div class="field-group">
                <label for="wordLabFind">Find</label>
                <input id="wordLabFind" type="text" data-wlab-input="find" placeholder="Type the old word" autocomplete="off" spellcheck="false">
              </div>
              <div class="field-group">
                <label for="wordLabReplace">Replace with</label>
                <input id="wordLabReplace" type="text" data-wlab-input="replace" placeholder="Type the new word" autocomplete="off" spellcheck="false">
              </div>
              <div class="word-lab-buttons">
                <button class="btn btn-ghost btn-small" type="button" data-wlab-action="find-next">➡️ Find Next</button>
                <button class="btn btn-blue btn-small" type="button" data-wlab-action="replace">✏️ Replace</button>
                <button class="btn btn-green btn-small" type="button" data-wlab-action="replace-all">🚀 Replace All</button>
                <button class="btn btn-ghost btn-small" type="button" data-wlab-action="reset">↻ Reset</button>
              </div>
            </div>
            <div class="word-lab-feedback" id="wordLabFeedback" aria-live="polite">Type in the document, then try Find Next, Replace or Replace All.</div>
          </div>
          <div class="explain-box">
            <strong>How to use the Word Lab</strong>
            <p>Type a word in Find and a new word in Replace. Click Find Next to jump to a match. Click Replace to change one match. Click Replace All to change every match.</p>
          </div>
        `,
        art: emojiArt('🧪', 'WORD LAB', 'TRY IT YOURSELF'),
        onRender: 'initWordLab'
      },
      {
        kicker: 'Mini game time',
        title: 'Word Detective is ready!',
        intro: 'Solve two cases and earn your badge.',
        body: `
          <div class="mission-banner">
            <span class="mini-icon">🕵️</span>
            <div><strong>Case files waiting</strong><p>Spot the repeated word. Choose the best tool.</p></div>
          </div>
          <div class="mini-pill-row">
            <span class="mini-pill">🔍 Spot the word</span>
            <span class="mini-pill">🚀 Pick the tool</span>
            <span class="mini-pill">⭐ Earn 3 stars</span>
          </div>
          <div class="lesson-note pink"><span class="note-icon">🎁</span><span>Finish to unlock <strong>Secret Agent HQ</strong>.</span></div>
        `,
        art: emojiArt('🕵️', 'WORD DETECTIVE', 'MINI GAME')
      }
    ]
  },
  {
    id: 2,
    name: 'Secret Agent Headquarters',
    shortName: 'Secret Agent HQ',
    tagline: 'Find & swap mission',
    icon: '🕵️',
    theme: 'purple',
    buildingLines: ['Secret Agent', 'Headquarters'],
    gameName: 'Find & Swap Mission',
    badgeIcon: '🕵️',
    badgeName: 'Secret Agent',
    slides: [
      {
        kicker: 'Top secret briefing',
        title: 'Welcome to Secret Agent HQ',
        intro: 'Agent, this document repeats PEOPLE. Change every PEOPLE to CITIZENS.',
        body: `
          <div class="mission-banner">
            <span class="mini-icon">📁</span>
            <div><strong>Mission 002</strong><p>Replace every PEOPLE with CITIZENS in 60 seconds.</p></div>
          </div>
          <div class="explain-box">
            <strong>Why use Replace All here?</strong>
            <p>PEOPLE appears six times. Replace would change one match at a time. Replace All changes all six in one click, which saves time.</p>
          </div>
          <div class="brief-rule"><span>REPLACE</span><span class="word-chip">PEOPLE</span><span>with</span><span class="word-chip new">CITIZENS</span></div>
          <div class="lesson-note"><span class="note-icon">⏱️</span><span>Use the right button. Check your spelling.</span></div>
        `,
        art: emojiArt('🕵️', 'AGENT HQ', 'TOP SECRET')
      },
      {
        kicker: 'Your gadget',
        title: 'The Find & Replace machine',
        intro: 'Type the old word in Find and the new word in Replace.',
        body: `
          <div class="editor-card">
            <div class="editor-head"><span>🔍</span> Find and Replace</div>
            <ul class="editor-steps">
              <li><b>1</b> Type <strong>PEOPLE</strong> in the Find box.</li>
              <li><b>2</b> Type <strong>CITIZENS</strong> in the Replace box.</li>
              <li><b>3</b> Click <strong>Replace All</strong> to change every match at once.</li>
            </ul>
          </div>
          <div class="two-tool-grid">
            <div class="tool-card"><div class="tool-icon">✏️</div><h3>Replace</h3><p>Changes just one match.</p></div>
            <div class="tool-card green"><div class="tool-icon">🚀</div><h3>Replace All</h3><p>Changes every match in one click.</p></div>
          </div>
          <div class="explain-box">
            <strong>What do the boxes do?</strong>
            <p>Find is the word you want to change. Replace with is the new word. Word only changes the exact letters you type, so spelling must match.</p>
          </div>
        `,
        art: emojiArt('🛠️', 'YOUR GADGET', 'FIND & REPLACE')
      },
      {
        kicker: 'Agent field rules',
        title: 'Check before you click',
        intro: 'Type the words exactly. Then use Replace All.',
        body: `
          <div class="mission-banner">
            <span class="mini-icon">📋</span>
            <div><strong>Agent checklist</strong><p>✓ Spell the words correctly &nbsp; ✓ Use Replace All &nbsp; ✓ Watch the timer</p></div>
          </div>
          <div class="explain-box">
            <strong>Why check spelling?</strong>
            <p>Word looks for the exact letters you type. If the document says PEOPLE and you type people, Replace All may not find it. Always check the words before you click.</p>
          </div>
          <div class="quick-check" data-correct="2" data-answered="false">
            <div class="qc-heading">⚡ Quick check</div>
            <p>Which button changes every PEOPLE to CITIZENS in one click?</p>
            <div class="qc-options">
              <button class="qc-option" type="button" data-quick-option="0">Find Next</button>
              <button class="qc-option" type="button" data-quick-option="1">Replace</button>
              <button class="qc-option" type="button" data-quick-option="2">Replace All</button>
            </div>
            <div class="qc-feedback" data-hint="Careful! Replace changes one. Look for ALL." aria-live="polite"></div>
          </div>
        `,
        art: emojiArt('📋', 'FIELD RULES', 'STAY SHARP')
      },
      {
        kicker: 'Mission ready',
        title: 'Your 60-second mission awaits',
        intro: 'Turn every PEOPLE into a CITIZEN before time runs out.',
        body: `
          <div class="mission-banner">
            <span class="mini-icon">⏱️</span>
            <div><strong>Remember</strong><p>Find PEOPLE • Replace with CITIZENS • Click Replace All</p></div>
          </div>
          <div class="mini-pill-row">
            <span class="mini-pill">🔍 6 matches</span>
            <span class="mini-pill">⏱️ 60 seconds</span>
            <span class="mini-pill">🕵️ Secret Agent badge</span>
          </div>
          <div class="lesson-note blue"><span class="note-icon">🎯</span><span>Finish to unlock <strong>Grammar Hospital</strong>.</span></div>
        `,
        art: emojiArt('⏱️', 'MISSION READY', '60 SECONDS')
      }
    ]
  },
  {
    id: 3,
    name: 'Grammar Hospital',
    shortName: 'Grammar Hospital',
    tagline: 'Learn grammar check',
    icon: '🩺',
    theme: 'teal',
    buildingLines: ['Grammar', 'Hospital'],
    gameName: "Doctor Word's Emergency Room",
    badgeIcon: '🩺',
    badgeName: 'Grammar Doctor',
    slides: [
      {
        kicker: 'Emergency ward',
        title: 'Doctor Word needs your help!',
        intro: 'Three sentences need help. Learn how Word finds grammar mistakes.',
        body: `
          <div class="mission-banner">
            <span class="mini-icon">🏥</span>
            <div><strong>Hospital mission</strong><p>Find each mistake and choose the healthy sentence.</p></div>
          </div>
          <div class="explain-box">
            <strong>What is grammar?</strong>
            <p>Grammar is the set of rules that helps words fit together. A grammar mistake can make a sentence sound wrong. Word can mark it, and you decide how to fix it.</p>
          </div>
          <div class="mini-pill-row">
            <span class="mini-pill">🩺 Grammar mistakes</span>
            <span class="mini-pill">💙 Blue underlines</span>
            <span class="mini-pill">📝 Word Editor</span>
            <span class="mini-pill">⌨️ F7</span>
          </div>
          <div class="lesson-note green"><span class="note-icon">💚</span><span>Fix all 3 patients to earn the <strong>Grammar Doctor</strong> badge.</span></div>
        `,
        art: emojiArt('🏥', 'GRAMMAR HOSPITAL', 'PATIENTS WAITING')
      },
      {
        kicker: 'Grammar first aid',
        title: 'What is a grammar mistake?',
        intro: 'Grammar mistakes make a sentence sound wrong. Word can mark them for you.',
        body: `
          <div class="sentence-compare">
            <div class="sentence-card bad">She <span class="grammar-underline">go</span> to school every day.</div>
            <div class="sentence-card good">She <span style="color:#0a7b5c">goes</span> to school every day.</div>
          </div>
          <div class="underliner-legend">
            <span class="legend-item"><span class="legend-line red"></span>Red underline: possible spelling mistake</span>
            <span class="legend-item"><span class="legend-line"></span>Blue underline: possible grammar problem</span>
          </div>
          <div class="hero-looks">
            <div class="hl-hero"><svg class="hero-svg" viewBox="0 0 240 300"><use href="#hero-sprite"></use></svg></div>
            <div class="hl-body">
              <div class="hl-doc">She <span class="hl-bad">go</span> to school every day.</div>
              <div class="hl-speech">💙 Blue underline = grammar problem!</div>
            </div>
          </div>
          <div class="explain-box">
            <strong>What do the underlines mean?</strong>
            <p>A red underline usually points to a spelling mistake. A blue underline can point to a grammar problem. Click the underlined word to see Word's suggestion.</p>
          </div>
          <div class="lesson-note blue"><span class="note-icon">💙</span><span>A <strong>blue underline</strong> can show a grammar issue. Word Editor explains the fix.</span></div>
        `,
        art: emojiArt('💙', 'BLUE UNDERLINE', 'GRAMMAR CHECK')
      },
      {
        kicker: 'Your medical kit',
        title: 'Meet Microsoft Word Editor',
        intro: 'Word Editor checks spelling and grammar, then explains each fix.',
        body: `
          <div class="two-tool-grid">
            <div class="tool-card green">
              <div class="tool-icon">🩺</div>
              <h3>Word Editor</h3>
              <p><strong>Home → Editor</strong> shows each suggestion.</p>
              <span class="tool-tag">Best for learning WHY</span>
            </div>
            <div class="tool-card">
              <div class="tool-icon">📝</div>
              <h3>Spelling &amp; Grammar</h3>
              <p>Click <strong>Review → Spelling &amp; Grammar</strong> or press <strong>F7</strong>.</p>
              <span class="tool-tag">Quick grammar check</span>
            </div>
          </div>
          <div class="explain-box">
            <strong>What does Word Editor do?</strong>
            <p>It checks your writing and shows suggestions. Each suggestion explains the problem, so you can learn why the change is needed. Choose Accept to fix it or Ignore to keep your words.</p>
          </div>
          <div class="quick-check" data-correct="0" data-answered="false">
            <div class="qc-heading">⚡ Quick check</div>
            <p>Which key opens Spelling &amp; Grammar in Word?</p>
            <div class="qc-options">
              <button class="qc-option" type="button" data-quick-option="0">F7</button>
              <button class="qc-option" type="button" data-quick-option="1">Ctrl + H</button>
              <button class="qc-option" type="button" data-quick-option="2">Ctrl + S</button>
            </div>
            <div class="qc-feedback" data-hint="That key does something else. Try F7." aria-live="polite"></div>
          </div>
        `,
        art: emojiArt('🩺', 'WORD EDITOR', 'REVIEW & FIX')
      },
      {
        kicker: 'Doctor’s example',
        title: 'Diagnose the sentence',
        intro: 'The verb does not match the subject. Can you find the fix?',
        body: `
          <div class="sentence-compare">
            <div class="sentence-card bad">He <span class="grammar-underline">don't</span> like apples.</div>
          </div>
          <div class="hero-looks">
            <div class="hl-hero"><svg class="hero-svg" viewBox="0 0 240 300"><use href="#hero-sprite"></use></svg></div>
            <div class="hl-body">
              <div class="hl-doc">He <span class="hl-bad">don't</span> like apples.</div>
              <div class="hl-speech">🩺 “He” needs “doesn’t”!</div>
            </div>
          </div>
          <div class="explain-box">
            <strong>What is subject-verb agreement?</strong>
            <p>The subject is who the sentence is about. The verb is the action. In “He don't like apples”, “He” is singular, so the verb must be “doesn't”. Then “like” stays the same.</p>
          </div>
          <button class="btn btn-green btn-small" type="button" data-level-action="reveal-fix" aria-expanded="false">👩‍⚕️ Show Doctor’s fix</button>
          <div class="reveal-box" id="doctorFix">✅ He <strong>doesn't</strong> like apples. “He” needs “doesn’t”, so “like” stays the same.</div>
          <div class="lesson-note blue"><span class="note-icon">🔍</span><span>Always read a suggestion before you accept it.</span></div>
        `,
        art: emojiArt('🔬', 'DIAGNOSIS', 'SUBJECT + VERB')
      },
      {
        kicker: 'Emergency room',
        title: "Doctor Word's patients are waiting",
        intro: 'Choose the healthy sentence for each patient.',
        body: `
          <div class="mission-banner">
            <span class="mini-icon">🚑</span>
            <div><strong>Emergency Room</strong><p>Patient 1: He don't like apples. &nbsp; Patient 2: She go to school every day. &nbsp; Patient 3: They is playing football.</p></div>
          </div>
          <div class="mini-pill-row">
            <span class="mini-pill">🩺 3 patients</span>
            <span class="mini-pill">✅ Choose the healthy sentence</span>
            <span class="mini-pill">🏅 Grammar Doctor badge</span>
          </div>
          <div class="lesson-note green"><span class="note-icon">🎁</span><span>Clear the room to unlock the <strong>Superhero Training Center</strong>.</span></div>
        `,
        art: emojiArt('🚑', 'EMERGENCY ROOM', 'MINI GAME')
      }
    ]
  },
  {
    id: 4,
    name: 'Word Superhero Training Center',
    shortName: 'Superhero Training',
    tagline: 'Final challenge',
    icon: '🦸',
    theme: 'pink',
    buildingLines: ['Superhero', 'Training Center'],
    gameName: 'Ultimate Word Hero Quiz',
    badgeIcon: '🦸',
    badgeName: 'Ultimate Word Superhero',
    slides: [
      {
        kicker: 'Final training',
        title: 'The Ultimate Word Hero Quiz',
        intro: 'Answer 10 questions about Find, Replace, grammar and shortcuts.',
        body: `
          <div class="mission-banner">
            <span class="mini-icon">🎯</span>
            <div><strong>Pass mark: 70%</strong><p>Get at least 7 out of 10 correct. Read every question.</p></div>
          </div>
          <div class="mini-pill-row">
            <span class="mini-pill">❓ 10 questions</span>
            <span class="mini-pill">✅ Instant feedback</span>
            <span class="mini-pill">🏆 Superhero certificate</span>
          </div>
          <div class="lesson-note pink"><span class="note-icon">🦸</span><span>Use everything you learned in Word City.</span></div>
        `,
        art: emojiArt('🦸', 'FINAL CHALLENGE', 'SHOW YOUR POWERS')
      },
      {
        kicker: 'Power recap',
        title: 'Your superhero toolbox',
        intro: 'Review your tools, then start the final quiz.',
        body: `
          <div class="two-tool-grid">
            <div class="tool-card"><div class="tool-icon">🔍</div><h3>Find &amp; Replace</h3><p>Ctrl + H • Replace one • Replace All every match</p></div>
            <div class="tool-card green"><div class="tool-icon">🩺</div><h3>Grammar Check</h3><p>Blue underline • Word Editor • Review → Spelling &amp; Grammar • F7</p></div>
          </div>
          <div class="explain-box">
            <strong>Quick reminder</strong>
            <p>Find looks for a word. Replace changes one match. Replace All changes every match. Word Editor and F7 help you check grammar.</p>
          </div>
          <div class="lesson-note blue"><span class="note-icon">💪</span><span>Score <strong>70% or more</strong> to earn your certificate.</span></div>
        `,
        art: emojiArt('🏆', 'READY, HERO?', 'YOUR TOOLBOX')
      }
    ]
  }
];

/* ---------------- Lesson rendering ---------------- */
function renderLevel(){
  if(activeGame){
    renderMiniGame();
    return;
  }
  renderLesson();
}

function renderLesson(){
  const level = LEVELS[currentLevel - 1];
  if(!level) return;
  const slide = level.slides[currentSlide];
  if(!slide) return;

  $('levelStepPill').textContent = `Lesson ${currentSlide + 1} / ${level.slides.length}`;

  const dots = level.slides.map((item, index) => `
    <button
      class="slide-dot${index === currentSlide ? ' active' : ''}${index < currentSlide ? ' done' : ''}"
      type="button"
      data-level-action="goto-slide"
      data-slide="${index}"
      aria-label="Go to lesson slide ${index + 1}"
      aria-current="${index === currentSlide ? 'true' : 'false'}"
    ></button>
  `).join('');

  const isLast = currentSlide === level.slides.length - 1;

  $('levelContent').innerHTML = `
    <article class="lesson-card" aria-live="polite">
      <div class="lesson-layout${slide.art ? '' : ' no-art'}">
        <div class="lesson-copy">
          <span class="lesson-kicker">${escapeHtml(slide.kicker)}</span>
          <h2>${slide.title}</h2>
          <p class="lesson-intro">${slide.intro}</p>
          <div class="lesson-body">${slide.body || ''}</div>
        </div>
        ${slide.art ? `<aside class="lesson-art" aria-hidden="true">${slide.art}</aside>` : ''}
      </div>
      <div class="lesson-nav">
        <button class="btn btn-ghost btn-small" type="button" data-level-action="prev-slide" ${currentSlide === 0 ? 'disabled' : ''}>← BACK</button>
        <div class="slide-dots" aria-label="Lesson slides">${dots}</div>
        <div class="nav-right">
          <button class="btn ${isLast ? 'btn-primary' : 'btn-blue'} btn-small" type="button" data-level-action="${isLast ? 'start-game' : 'next-slide'}">
            ${isLast ? `🎮 START ${escapeHtml(level.gameName.toUpperCase())}` : 'NEXT →'}
          </button>
        </div>
      </div>
    </article>
  `;

  scrollLevelTop();
  if(slide.onRender && typeof window[slide.onRender] === 'function'){
    window.setTimeout(() => window[slide.onRender](), 0);
  }
}
 
function goToSlide(index){
  const level = LEVELS[currentLevel - 1];
  if(!level) return;
  currentSlide = clamp(index, 0, level.slides.length - 1);
  renderLesson();
  sound('click');
}

function nextSlide(){
  const level = LEVELS[currentLevel - 1];
  if(!level) return;
  if(currentSlide < level.slides.length - 1){
    currentSlide++;
    renderLesson();
    sound('click');
  }
}

function previousSlide(){
  if(currentSlide > 0){
    currentSlide--;
    renderLesson();
    sound('click');
  }
}

function handleQuickCheck(button){
  const box = button.closest('.quick-check');
  if(!box || box.dataset.answered === 'true') return;
  const correctIndex = Number(box.dataset.correct);
  const chosenIndex = Number(button.dataset.quickOption);
  const feedback = box.querySelector('.qc-feedback');
  const options = Array.from(box.querySelectorAll('.qc-option'));

  if(chosenIndex === correctIndex){
    button.classList.add('correct');
    options.forEach((option) => { option.disabled = true; });
    box.dataset.answered = 'true';
    if(feedback){
      feedback.className = 'qc-feedback good';
      feedback.textContent = '✅ Correct!';
    }
    sound('correct');
  }else{
    button.classList.add('wrong');
    button.disabled = true;
    if(feedback){
      feedback.className = 'qc-feedback bad';
      feedback.textContent = box.querySelector('.qc-feedback').dataset.hint || 'Not quite. Try again!';
    }
    sound('wrong');
  }
}

function handleDemoAction(button){
  const action = button.dataset.demoAction;
  const demo = $('heroDemo');
  const feedback = $('heroDemoFeedback');
  if(!demo || !feedback) return;

  const heroWords = Array.from(demo.querySelectorAll('.hero-word:not(.is-legend)'));
  if(action === 'find-next'){
    if(heroWords.length === 0){
      feedback.className = 'demo-feedback good';
      feedback.textContent = 'All 3 matches are already “legend”.';
      return;
    }
    const currentlyMarked = demo.querySelector('.hero-word.current');
    if(currentlyMarked) currentlyMarked.classList.remove('current');
    const nextIndex = currentlyMarked ? (heroWords.indexOf(currentlyMarked) + 1) % heroWords.length : 0;
    heroWords[nextIndex].classList.add('current');
    feedback.className = 'demo-feedback';
    feedback.textContent = `🔍 Found match ${nextIndex + 1} of ${heroWords.length}. Find Next checks one match at a time.`;
    sound('swish');
    return;
  }

  if(action === 'replace-all'){
    if(heroWords.length === 0){
      feedback.className = 'demo-feedback good';
      feedback.textContent = 'Every “hero” is already “legend”.';
      return;
    }
    heroWords.forEach((word, index) => {
      word.classList.remove('current');
      word.classList.add('is-legend');
      word.textContent = 'legend';
      word.style.animationDelay = `${index * 0.12}s`;
    });
    feedback.className = 'demo-feedback good';
    feedback.textContent = '🚀 Replace All changed all 3 matches at once!';
    sound('correct');
  }
}

function handleRevealFix(button){
  const box = $('doctorFix');
  if(!box) return;
  const open = box.classList.toggle('show');
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? '🙈 Hide Doctor’s fix' : '👩‍⚕️ Show Doctor’s fix';
  sound(open ? 'correct' : 'click');
}
