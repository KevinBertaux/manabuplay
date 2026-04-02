// ══════════════════════════════════════════════════════════════
  // BOOT DATA
  // ══════════════════════════════════════════════════════════════
  const MANABUPLAY_BOOT = window["__MANABUPLAY_DATA__"];
  if (!MANABUPLAY_BOOT) {
    throw new Error("ManabuPlay boot data is missing.");
  }

  const DIFFICULTIES = MANABUPLAY_BOOT.difficulties;
  let currentDiff = null;  // currently selected difficulty object


  // ══════════════════════════════════════════════════════════════
  // LOCALSTORAGE HELPERS
  // ══════════════════════════════════════════════════════════════
  const LS = {
    get(k)    { try { return JSON.parse(localStorage.getItem('mp_' + k)); } catch(e){ return null; } },
    set(k, v) { try { localStorage.setItem('mp_' + k, JSON.stringify(v)); } catch(e){} },
    getBest(diffId) { return LS.get('best_' + diffId) || 0; },
    setBest(diffId, score) {
      const prev = LS.getBest(diffId);
      if (score > prev) { LS.set('best_' + diffId, score); return true; }
      return false;
    },
    getLang()     { return LS.get('lang') || 'en'; },
    setLang(lang) { LS.set('lang', lang); },
  };


  // ══════════════════════════════════════════════════════════════
  // i18n
  // ══════════════════════════════════════════════════════════════
  const LANG = MANABUPLAY_BOOT.lang;

  let currentLang = LS.getLang();
  const t = k => (LANG[currentLang]?.[k] ?? LANG.en?.[k]) || '';

  function applyLang() {
    document.getElementById('htmlRoot').lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (typeof v === 'string') el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    document.getElementById('btnEN').classList.toggle('active', currentLang === 'en');
    document.getElementById('btnFR').classList.toggle('active', currentLang === 'fr');
    // Refresh copy button label if not in "copied" state
    const copyBtn = document.getElementById('shareBtnCopy');
    const copyLbl = document.getElementById('copyBtnLabel');
    if (copyBtn && copyLbl && !copyBtn.classList.contains('copied')) {
      copyLbl.textContent = t('result_share_copy');
    }
    // Refresh difficulty grid labels
    renderDiffGrid();
    // Update next button if mid-quiz
    const nb = document.getElementById('nextBtn');
    if (nb && !nb.classList.contains('opacity-0')) {
      nb.textContent = state.currentIndex >= state.questions.length - 1 ? t('see_results') : t('next_word');
    }
  }

  function setLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    LS.setLang(lang);
    const idx=state.currentIndex, sc=state.score, st=state.streak, bs=state.bestStreak;
    if (currentDiff) {
      state.questions = buildQuestions(currentDiff.words);
      state.currentIndex = Math.min(idx, state.questions.length - 1);
      state.score=sc; state.streak=st; state.bestStreak=bs; state.answered=false;
    }
    applyLang();
    if (document.getElementById('quizArea').style.display !== 'none') renderQuestion();
  }


  // ══════════════════════════════════════════════════════════════
  // 50 QUIZ WORDS — bilingual
  // ══════════════════════════════════════════════════════════════
  const QUIZ_DATA = MANABUPLAY_BOOT.quizData;


  // QUIZ ENGINE
  // ══════════════════════════════════════════════════════════════
  let state = { questions:[], currentIndex:0, score:0, streak:0, bestStreak:0, answered:false, correct:0 };

  const shuffle = a => {
    const b=[...a];
    for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
    return b;
  };

  function buildQuestions(n) {
    const pool = shuffle(QUIZ_DATA).slice(0, n);
    return pool.map(q => {
      const correctText = q.correct[currentLang] || q.correct.en;
      const wrongList   = q.wrong[currentLang]   || q.wrong.en;
      const answers     = shuffle([correctText, ...shuffle(wrongList).slice(0,3)]);
      return { ...q, correctText, answers };
    });
  }

  // ── DIFFICULTY GRID ──────────────────────────────────────────
  function renderDiffGrid() {
    const grid = document.getElementById('diffGrid');
    if (!grid) return;
    grid.innerHTML = '';
    DIFFICULTIES.forEach(d => {
      const best = LS.getBest(d.id);
      const bestLabel = best > 0
        ? `${t('diff_best')} <span style="color:${d.color};font-weight:700;">${best} pts</span>`
        : `<span style="color:rgba(255,255,255,.3);">${t('diff_no_best')}</span>`;
      const card = document.createElement('div');
      card.className = `diff-card ${d.cls}${currentDiff?.id === d.id ? ' selected' : ''}`;
      card.innerHTML = `
        <span class="diff-icon">${d.icon}</span>
        <div class="diff-name" style="color:${d.color};">${t('diff_'+d.id)}</div>
        <div class="diff-count" style="color:rgba(255,255,255,.6);">${d.words} ${t('diff_words')}</div>
        <div class="diff-best mt-1" style="color:rgba(255,255,255,.5);">${bestLabel}</div>
      `;
      card.onclick = () => selectDiff(d);
      grid.appendChild(card);
    });
  }

  function selectDiff(d) {
    currentDiff = d;
    renderDiffGrid();
    const sb = document.getElementById('startBtn');
    sb.classList.add('ready');
  }

  function launchQuiz() {
    if (!currentDiff) return;
    state = { questions:buildQuestions(currentDiff.words), currentIndex:0, score:0, streak:0, bestStreak:0, answered:false, correct:0 };
    // Hide picker, show progress+hud+quiz
    document.getElementById('diffArea').style.display   = 'none';
    document.getElementById('progressRow').style.display = 'flex';
    document.getElementById('hudRow').style.display      = 'flex';
    document.getElementById('quizArea').style.display    = 'block';
    document.getElementById('resultsArea').style.display = 'none';
    renderQuestion();
  }

  function goToDiffPicker() {
    document.getElementById('diffArea').style.display    = 'block';
    document.getElementById('progressRow').style.display = 'none';
    document.getElementById('hudRow').style.display      = 'none';
    document.getElementById('quizArea').style.display    = 'none';
    document.getElementById('resultsArea').style.display = 'none';
    renderDiffGrid();
  }

  function replayDifficulty() {
    launchQuiz();
  }

  // ── HINT ─────────────────────────────────────────────────────
  function revealHint() {
    document.getElementById('hintBtn').style.display  = 'none';
    const zone    = document.getElementById('hintText');
    const content = document.getElementById('hintContent');
    zone.style.display = 'block';
    content.classList.remove('hint-revealed');
    void content.offsetWidth;
    content.classList.add('hint-revealed');
  }

  // ── RENDER QUESTION ──────────────────────────────────────────
  function renderQuestion() {
    const q     = state.questions[state.currentIndex];
    const total = state.questions.length;

    document.getElementById('progressBar').style.width  = `${(state.currentIndex/total)*100}%`;
    document.getElementById('progressText').textContent = `${state.currentIndex}/${total}`;

    document.getElementById('scoreDisplay').textContent  = state.score;
    document.getElementById('streakDisplay').textContent = state.streak >= 2 ? `🔥 x${state.streak}` : '';
    const level = state.score < 30 ? 'I' : state.score < 80 ? 'II' : state.score < 180 ? 'III' : 'IV';
    document.getElementById('levelDisplay').textContent  = level;

    document.getElementById('wordKana').textContent     = q.kana;
    document.getElementById('wordDisplay').textContent  = q.word;
    document.getElementById('wordCategory').textContent = q.cat[currentLang] || q.cat.en;

    // Reset hint
    const hintBtn     = document.getElementById('hintBtn');
    const hintText    = document.getElementById('hintText');
    const hintContent = document.getElementById('hintContent');
    hintBtn.style.display   = 'inline-flex';
    hintText.style.display  = 'none';
    hintContent.textContent = q.hint[currentLang] || q.hint.en;
    hintContent.classList.remove('hint-revealed');
    const hl = hintBtn.querySelector('[data-i18n]');
    if (hl) hl.textContent = t('hint_btn');

    // Answers
    const grid = document.getElementById('answersGrid');
    grid.innerHTML = '';
    q.answers.forEach(ans => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = `<span>${ans}</span>`;
      btn.onclick = () => handleAnswer(btn, ans, q.correctText);
      grid.appendChild(btn);
    });

    const fb = document.getElementById('feedback');
    fb.style.display='none'; fb.textContent='';
    const nb = document.getElementById('nextBtn');
    nb.classList.add('opacity-0','pointer-events-none');
    state.answered = false;
  }

  // ── HANDLE ANSWER ────────────────────────────────────────────
  function handleAnswer(btn, chosen, correct) {
    if (state.answered) return;
    state.answered = true;
    document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
    if (document.getElementById('hintText').style.display === 'none') revealHint();

    const isCorrect = chosen === correct;
    const fb = document.getElementById('feedback');
    fb.style.display = 'block';

    if (isCorrect) {
      btn.classList.add('correct');
      state.streak++;
      state.correct++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      const bonus = state.streak>=3 ? 15 : state.streak>=2 ? 12 : 10;
      state.score += bonus;
      fb.style.color = 'var(--green)';
      fb.textContent = state.streak>=3 ? t('fb_combo')(state.streak,bonus) : t('fb_correct')(bonus);
      spawnParticles(btn, '#4ade80');
    } else {
      btn.classList.add('wrong');
      state.streak = 0;
      document.querySelectorAll('.answer-btn').forEach(b => {
        if (b.querySelector('span').textContent===correct) b.classList.add('correct');
      });
      fb.style.color = 'var(--red)';
      const shortAns = correct.split(' ').slice(0,7).join(' ')+(correct.split(' ').length>7?'…':'');
      fb.textContent = t('fb_wrong')(shortAns);
    }

    document.getElementById('scoreDisplay').textContent  = state.score;
    document.getElementById('streakDisplay').textContent = state.streak>=2 ? `🔥 x${state.streak}` : '';

    const nb = document.getElementById('nextBtn');
    nb.classList.remove('opacity-0','pointer-events-none');
    nb.textContent = state.currentIndex>=state.questions.length-1 ? t('see_results') : t('next_word');
  }

  function nextQuestion() {
    state.currentIndex++;
    if (state.currentIndex >= state.questions.length) showResults();
    else renderQuestion();
  }

  // ── RESULTS ──────────────────────────────────────────────────
  function showResults() {
    document.getElementById('progressRow').style.display = 'none';
    document.getElementById('hudRow').style.display      = 'none';
    document.getElementById('quizArea').style.display    = 'none';
    document.getElementById('resultsArea').style.display = 'block';

    const total = state.questions.length;
    const pct   = Math.round((state.score/(total*15))*100);
    const tier  = t('results').find(r=>pct>=r.min) || t('results')[t('results').length-1];

    document.getElementById('finalEmoji').textContent   = tier.emoji;
    document.getElementById('finalTitle').textContent   = tier.title;
    document.getElementById('finalMsg').textContent     = tier.msg;
    document.getElementById('finalScore').textContent   = state.score + ' pts';
    document.getElementById('finalCorrect').textContent = `${state.correct}/${total}`;
    document.getElementById('finalPercent').textContent = pct+'%';
    document.getElementById('finalStreak').textContent  = state.bestStreak;
    document.getElementById('progressBar').style.width  = '100%';
    document.getElementById('progressText').textContent = `${total}/${total}`;

    // localStorage — save best & show badge/msg
    const isNewRecord = LS.setBest(currentDiff.id, state.score);
    const badge = document.getElementById('newRecordBadge');
    badge.style.display = isNewRecord ? 'block' : 'none';

    const bestMsg = document.getElementById('bestScoreMsg');
    const currentBest = LS.getBest(currentDiff.id);
    const diffLabel = t('diff_'+currentDiff.id);
    bestMsg.innerHTML = t('result_best_msg')(currentBest, diffLabel);

    // Refresh diff grid best scores for next visit
    renderDiffGrid();
  }

  // ── PARTICLES ────────────────────────────────────────────────
  function spawnParticles(btn, color) {
    const r=btn.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    for(let i=0;i<8;i++){
      const p=document.createElement('div');
      p.className='particle';
      p.style.cssText=`left:${cx}px;top:${cy}px;background:${color};--tx:${(Math.random()-.5)*120}px;--ty:${(Math.random()-.8)*100}px;`;
      document.body.appendChild(p);
      p.addEventListener('animationend',()=>p.remove());
    }
  }

  // ── EMAIL → NETLIFY FORMS ────────────────────────────────────
  async function handleEmailSubmit(e) {
    e.preventDefault();
    const form    = e.target;
    const email   = document.getElementById('emailInput').value.trim();
    const btn     = form.querySelector('button[type="submit"]');
    const success = document.getElementById('emailSuccess');

    // Optimistic UI — disable button while sending
    const originalText = btn.textContent;
    btn.disabled   = true;
    btn.textContent = '...';

    try {
      const body = new URLSearchParams({
        'form-name': 'manabuplay-waitlist',
        'email':     email,
        'lang':      currentLang,
      });

      const res = await fetch('/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body.toString(),
      });

      if (res.ok) {
        form.style.display      = 'none';
        success.style.display   = 'block';
        // Also store locally so we don't show the form again this session
        LS.set('email_submitted', true);
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (err) {
      // Graceful fallback — show success anyway (Netlify may still catch it)
      // and log the error silently
      console.warn('Netlify form submit error:', err);
      btn.disabled    = false;
      btn.textContent = originalText;
      // Show a soft error message
      success.style.display = 'block';
      success.querySelector('span').textContent =
        currentLang === 'fr'
          ? '⚠ Réessaie dans un instant…'
          : '⚠ Something went wrong, please retry.';
    }
  }

  // ── SCROLL REVEAL ─────────────────────────────────────────────
  const revealObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObs.unobserve(e.target);}});
  },{threshold:0.1});
  document.querySelectorAll('.reveal').forEach(el=>revealObs.observe(el));

  // ── SHARE ─────────────────────────────────────────────────────
  function buildShareText() {
    const total     = state.questions.length;
    const pct       = Math.round((state.score / (total * 15)) * 100);
    const diffLabel = t('diff_' + currentDiff.id);
    const tier      = t('results').find(r => pct >= r.min) || t('results')[t('results').length - 1];
    // Emoji bar: filled squares proportional to accuracy
    const filled  = Math.round(pct / 10);
    const bar     = '🟪'.repeat(filled) + '⬛'.repeat(10 - filled);
    return currentLang === 'fr'
      ? `${tier.emoji} ManabuPlay — Quiz Gaming Japonais\nDifficulté : ${diffLabel} | ${state.correct}/${total} réponses justes\nScore : ${state.score} pts (${pct}%)\n${bar}\nTeste ton niveau 👇`
      : `${tier.emoji} ManabuPlay — Japanese Gaming Quiz\nDifficulty: ${diffLabel} | ${state.correct}/${total} correct\nScore: ${state.score} pts (${pct}%)\n${bar}\nTest your level 👇`;
  }

  function shareOnX() {
    const text = buildShareText();
    const url  = encodeURIComponent(window.location.href.split('#')[0]);
    const tweet = encodeURIComponent(text + '\n' + decodeURIComponent(url));
    window.open('https://x.com/intent/tweet?text=' + tweet, '_blank', 'noopener,width=600,height=500');
  }

  function copyShareLink() {
    const text = buildShareText() + '\n' + window.location.href.split('#')[0];
    const btn  = document.getElementById('shareBtnCopy');
    const lbl  = document.getElementById('copyBtnLabel');
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add('copied');
      lbl.textContent = t('result_share_copied');
      setTimeout(() => {
        btn.classList.remove('copied');
        lbl.textContent = t('result_share_copy');
      }, 2200);
    }).catch(() => {
      // Non-deprecated fallback: reveal the share text for manual copy.
      window.prompt(
        currentLang === 'fr'
          ? 'Copie ce texte manuellement :'
          : 'Copy this text manually:',
        text
      );
    });
  }

  // ── BOOT ─────────────────────────────────────────────────────
  applyLang();        // uses saved lang from LS
  renderDiffGrid();   // show difficulty picker
  const waitlistForm = document.querySelector('form[name="manabuplay-waitlist"]');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', handleEmailSubmit);
  }
  // If email already submitted this session, show success directly
  if (LS.get('email_submitted')) {
    const f = document.querySelector('form[name="manabuplay-waitlist"]');
    const s = document.getElementById('emailSuccess');
    if (f) f.style.display = 'none';
    if (s) s.style.display = 'block';
  }
