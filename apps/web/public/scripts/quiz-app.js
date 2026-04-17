// ══════════════════════════════════════════════════════════════
  // BOOT DATA
  // ══════════════════════════════════════════════════════════════
  const MANABUPLAY_BOOT = window["__MANABUPLAY_DATA__"];
  if (!MANABUPLAY_BOOT) {
    throw new Error("ManabuPlay boot data is missing.");
  }

  const MANABUPLAY_MODE = MANABUPLAY_BOOT.mode || window.__MANABUPLAY_MODE__ || 'legacy';
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
  const WAITLIST_STORAGE_KEY = 'waitlist_submissions';
  const WAITLIST_FORM_NAME = 'manabuplay-waitlist';
  const WAITLIST_EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;
  const WAITLIST_SUCCESS_BUTTON_DELAY = 2800;
  const WAITLIST_SUCCESS_MESSAGE_DELAY = 4000;
  let waitlistButtonTimer = null;
  let waitlistMessageTimer = null;
  const SUPPORTED_LANGS = ['en', 'fr'];
  const LOCALIZED_ROUTES = ['daily', 'practice', 'archives'];
  const PRACTICE_HISTORY_KEY = 'practice_sessions';
  const PRACTICE_HISTORY_LIMIT = 8;


  // ══════════════════════════════════════════════════════════════
  // i18n
  // ══════════════════════════════════════════════════════════════
  const LANG = MANABUPLAY_BOOT.lang;

  const pageLocale = SUPPORTED_LANGS.includes(window.__MANABUPLAY_LOCALE__) ? window.__MANABUPLAY_LOCALE__ : null;
  let currentLang = pageLocale || (SUPPORTED_LANGS.includes(LS.getLang()) ? LS.getLang() : 'en');
  const t = k => (LANG[currentLang]?.[k] ?? LANG.en?.[k]) || '';

  function localizedPath(lang, route) {
    return `/${lang}/${route ? `${route}/` : ''}`;
  }

  function getCurrentLocalizedRoute() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (!SUPPORTED_LANGS.includes(parts[0])) return '';
    return LOCALIZED_ROUTES.includes(parts[1]) ? parts[1] : '';
  }

  function updateLocalizedLinks() {
    const route = getCurrentLocalizedRoute();
    const currentSearch = window.location.search;
    document.querySelectorAll('[data-public-route]').forEach(link => {
      const targetRoute = link.dataset.publicRoute;
      if (LOCALIZED_ROUTES.includes(targetRoute)) {
        link.setAttribute('href', localizedPath(currentLang, targetRoute));
      }
    });
    document.querySelectorAll('[data-locale-home]').forEach(link => {
      const targetLang = link.dataset.localeHome;
      if (SUPPORTED_LANGS.includes(targetLang)) {
        const searchSuffix = route === 'archives' ? currentSearch : '';
        link.setAttribute('href', localizedPath(targetLang, route) + searchSuffix);
      }
    });
  }

  function applyLang() {
    document.getElementById('htmlRoot').lang = currentLang;
    const seoTitle = t('seo_title');
    if (typeof seoTitle === 'string' && seoTitle) {
      document.title = seoTitle;
    }
    const seoDescription = t('seo_description');
    if (typeof seoDescription === 'string' && seoDescription) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', seoDescription);
      }
    }
    const ogDescription = t('og_description');
    if (typeof ogDescription === 'string' && ogDescription) {
      const ogMetaDescription = document.querySelector('meta[property="og:description"]');
      if (ogMetaDescription) {
        ogMetaDescription.setAttribute('content', ogDescription);
      }
    }
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (typeof v === 'string') el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    document.getElementById('btnEN')?.classList.toggle('active', currentLang === 'en');
    document.getElementById('btnFR')?.classList.toggle('active', currentLang === 'fr');
    updateLocalizedLinks();
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
    if (!SUPPORTED_LANGS.includes(lang)) return;
    if (lang === currentLang) return;
    const currentRoute = getCurrentLocalizedRoute();
    const isLocalizedPage = SUPPORTED_LANGS.includes(window.location.pathname.split('/').filter(Boolean)[0]);
    if (isLocalizedPage) {
      LS.setLang(lang);
      window.location.href = localizedPath(lang, currentRoute) + window.location.search + window.location.hash;
      return;
    }
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
  const RAW_QUIZ_DATA = MANABUPLAY_BOOT.quizData;
  const SESSION_DATE_KEY = getSessionDateKey();
  const QUIZ_DATA = MANABUPLAY_MODE === 'daily' || MANABUPLAY_MODE === 'archives'
    ? buildDailyQuizData(RAW_QUIZ_DATA, SESSION_DATE_KEY)
    : RAW_QUIZ_DATA;
  let hintStage = 0;


  // QUIZ ENGINE
  // ══════════════════════════════════════════════════════════════
  let state = { questions:[], currentIndex:0, score:0, streak:0, bestStreak:0, answered:false, correct:0 };

  const shuffle = a => {
    const b=[...a];
    for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
    return b;
  };

  function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getArchiveConfig() {
    return MANABUPLAY_BOOT.archive || {};
  }

  function getSessionDateKey() {
    if (MANABUPLAY_MODE !== 'archives') {
      return getLocalDateKey();
    }
    const archiveConfig = getArchiveConfig();
    const selectedFromQuery = new URLSearchParams(window.location.search).get('date');
    const selectedDate = selectedFromQuery || archiveConfig.selectedDate || getLocalDateKey();
    const startDate = archiveConfig.startDate || selectedDate;
    const latestDate = archiveConfig.latestDate || selectedDate;
    const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
    if (isValidFormat && selectedDate >= startDate && selectedDate <= latestDate) {
      return selectedDate;
    }
    return archiveConfig.selectedDate || latestDate || getLocalDateKey();
  }

  function hashSeed(input) {
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let value = seed >>> 0;
    return () => {
      value = (value + 0x6d2b79f5) >>> 0;
      let result = Math.imul(value ^ (value >>> 15), value | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(items, seedSource) {
    const random = mulberry32(hashSeed(seedSource));
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function buildDailyQuizData(pool, dateKey) {
    const dailyConfig = MANABUPLAY_BOOT.daily || {};
    const targets = dailyConfig.tierTargets || { 1: 4, 2: 3, 3: 2, 4: 1 };
    const questionCount = dailyConfig.questionCount || 10;
    const selected = [];
    const selectedIds = new Set();

    Object.entries(targets).forEach(([tier, count]) => {
      const tierPool = pool.filter((entry) => String(entry.tier || 1) === tier);
      seededShuffle(tierPool, `${dateKey}:tier:${tier}`).slice(0, count).forEach((entry) => {
        selected.push(entry);
        selectedIds.add(entry.id);
      });
    });

    if (selected.length < questionCount) {
      seededShuffle(pool, `${dateKey}:fill`).forEach((entry) => {
        if (selected.length >= questionCount || selectedIds.has(entry.id)) return;
        selected.push(entry);
        selectedIds.add(entry.id);
      });
    }

    return seededShuffle(selected.slice(0, questionCount), `${dateKey}:order`);
  }

  function getPracticeConfig() {
    return MANABUPLAY_BOOT.practice || { questionCount: 10, cooldownSessions: 2, recipes: {} };
  }

  function readPracticeSessions() {
    const sessions = LS.get(PRACTICE_HISTORY_KEY);
    return Array.isArray(sessions) ? sessions : [];
  }

  function getPracticeCooldownIds() {
    const cooldownSessions = getPracticeConfig().cooldownSessions || 2;
    const recentSessions = readPracticeSessions().slice(0, cooldownSessions);
    return new Set(recentSessions.flatMap((session) => Array.isArray(session.wordIds) ? session.wordIds : []));
  }

  function savePracticeSession(diffId, questions) {
    const currentSessions = readPracticeSessions();
    const session = {
      diffId,
      completedAt: new Date().toISOString(),
      wordIds: questions.map((question) => question.id),
    };
    LS.set(PRACTICE_HISTORY_KEY, [session, ...currentSessions].slice(0, PRACTICE_HISTORY_LIMIT));
  }

  function pickPracticeEntries(pool, desiredCount, seedSource, selectedIds, cooldownIds) {
    const eligiblePool = pool.filter((entry) => !selectedIds.has(entry.id) && !cooldownIds.has(entry.id));
    const fallbackPool = pool.filter((entry) => !selectedIds.has(entry.id));
    const picks = seededShuffle(eligiblePool, `${seedSource}:eligible`).slice(0, desiredCount);

    if (picks.length < desiredCount) {
      seededShuffle(fallbackPool, `${seedSource}:fallback`).forEach((entry) => {
        if (picks.length >= desiredCount) return;
        if (picks.some((pick) => pick.id === entry.id)) return;
        picks.push(entry);
      });
    }

    picks.forEach((entry) => selectedIds.add(entry.id));
    return picks;
  }

  function buildPracticeSession(diff) {
    const practiceConfig = getPracticeConfig();
    const tierTargets = diff?.tierTargets || practiceConfig.recipes?.[diff?.id] || {};
    const selected = [];
    const selectedIds = new Set();
    const cooldownIds = getPracticeCooldownIds();

    Object.entries(tierTargets).forEach(([tier, count]) => {
      const tierPool = RAW_QUIZ_DATA.filter((entry) => String(entry.tier || 1) === tier);
      selected.push(
        ...pickPracticeEntries(
          tierPool,
          count,
          `practice:${diff.id}:tier:${tier}:${Date.now()}`,
          selectedIds,
          cooldownIds,
        ),
      );
    });

    if (selected.length < (practiceConfig.questionCount || diff.words || 10)) {
      selected.push(
        ...pickPracticeEntries(
          RAW_QUIZ_DATA,
          (practiceConfig.questionCount || diff.words || 10) - selected.length,
          `practice:${diff.id}:fill:${Date.now()}`,
          selectedIds,
          cooldownIds,
        ),
      );
    }

    return shuffle(selected);
  }

  function buildQuestions(n) {
    const isDailyMode = MANABUPLAY_MODE === 'daily';
    const isArchivesMode = MANABUPLAY_MODE === 'archives';
    const isPracticeMode = MANABUPLAY_MODE === 'practice';
    const isSeededMode = isDailyMode || isArchivesMode;
    const pool = isSeededMode
      ? QUIZ_DATA.slice(0, n)
      : isPracticeMode
        ? buildPracticeSession(currentDiff).slice(0, n)
        : shuffle(QUIZ_DATA).slice(0, n);
    return pool.map((q, index) => {
      const correctText = q.correct[currentLang] || q.correct.en;
      const wrongList   = q.wrong[currentLang]   || q.wrong.en;
      const answerSeed = `${SESSION_DATE_KEY}:${q.id || q.word}:${currentLang}:${index}`;
      const pickedWrong = isSeededMode ? seededShuffle(wrongList, `${answerSeed}:wrong`).slice(0,3) : shuffle(wrongList).slice(0,3);
      const answers     = isSeededMode ? seededShuffle([correctText, ...pickedWrong], `${answerSeed}:answers`) : shuffle([correctText, ...pickedWrong]);
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
      const bestMarkup = MANABUPLAY_MODE === 'archives'
        ? ''
        : `<div class="diff-best mt-1" style="color:rgba(255,255,255,.5);">${bestLabel}</div>`;
      const card = document.createElement('div');
      card.className = `diff-card ${d.cls}${currentDiff?.id === d.id ? ' selected' : ''}`;
      card.innerHTML = `
        <span class="diff-icon">${d.icon}</span>
        <div class="diff-name" style="color:${d.color};">${t('diff_'+d.id)}</div>
        <div class="diff-count" style="color:rgba(255,255,255,.6);">${d.words} ${t('diff_words')}</div>
        ${bestMarkup}
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
  function getLocalizedField(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[currentLang] || value.en || '';
  }

  function animateReveal(node) {
    if (!node) return;
    node.classList.remove('hint-revealed');
    void node.offsetWidth;
    node.classList.add('hint-revealed');
  }

  function setHintButtonLabel(key) {
    const hintBtn = document.getElementById('hintBtn');
    if (!hintBtn) return;
    const label = hintBtn.querySelector('[data-i18n]');
    if (label) label.textContent = t(key);
  }

  function hideHintButton() {
    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) hintBtn.style.display = 'none';
  }

  function renderExplanation(text, reveal = false) {
    const explanationBox = document.getElementById('explanationBox');
    const explanationContent = document.getElementById('explanationContent');
    if (!explanationBox || !explanationContent) return;
    if (!text) {
      explanationBox.style.display = 'none';
      explanationContent.textContent = '';
      return;
    }
    explanationContent.textContent = text;
    explanationBox.style.display = 'grid';
    if (reveal) animateReveal(explanationBox);
  }

  function revealHint(forceAll = false) {
    const q = state.questions[state.currentIndex];
    if (!q) return;

    const hintPrimary = getLocalizedField(q.hint);
    const hintSecondary = getLocalizedField(q.hint2);
    const previousStage = hintStage;
    const zone = document.getElementById('hintText');
    const primaryContent = document.getElementById('hintContent');
    const secondaryRow = document.getElementById('hintTextSecondary');
    const secondaryContent = document.getElementById('hint2Content');

    if (!zone || !primaryContent) return;

    zone.style.display = 'grid';

    if (hintStage === 0 || forceAll) {
      primaryContent.textContent = hintPrimary;
      animateReveal(primaryContent);
      hintStage = 1;
    }

    if ((forceAll || previousStage >= 1) && hintSecondary && secondaryRow && secondaryContent) {
      secondaryRow.style.display = 'grid';
      secondaryContent.textContent = hintSecondary;
      animateReveal(secondaryRow);
      hintStage = 2;
    }

    if (forceAll || !hintSecondary || hintStage >= 2) {
      hideHintButton();
      return;
    }

    setHintButtonLabel('hint_btn_more');
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
    const hintTextSecondary = document.getElementById('hintTextSecondary');
    const hint2Content = document.getElementById('hint2Content');
    const primaryHint = getLocalizedField(q.hint);
    const secondaryHint = getLocalizedField(q.hint2);
    hintStage = 0;
    if (hintBtn) {
      hintBtn.style.display = primaryHint || secondaryHint ? 'inline-flex' : 'none';
      setHintButtonLabel('hint_btn');
    }
    if (hintText) hintText.style.display = 'none';
    if (hintContent) {
      hintContent.textContent = primaryHint;
      hintContent.classList.remove('hint-revealed');
    }
    if (hintTextSecondary) {
      hintTextSecondary.style.display = 'none';
      hintTextSecondary.classList.remove('hint-revealed');
    }
    if (hint2Content) {
      hint2Content.textContent = secondaryHint;
      hint2Content.classList.remove('hint-revealed');
    }
    renderExplanation(getLocalizedField(q.explanation), false);

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
    revealHint(true);
    const q = state.questions[state.currentIndex];
    renderExplanation(getLocalizedField(q?.explanation), true);

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

    if (MANABUPLAY_MODE === 'practice' && currentDiff) {
      savePracticeSession(currentDiff.id, state.questions);
    }

    const badge = document.getElementById('newRecordBadge');
    const bestMsg = document.getElementById('bestScoreMsg');
    const shareRow = document.getElementById('shareRow');
    const isArchiveMode = MANABUPLAY_MODE === 'archives';

    if (isArchiveMode) {
      badge.style.display = 'none';
      bestMsg.style.display = 'none';
      if (shareRow) shareRow.style.display = 'none';
    } else {
      // localStorage — save best & show badge/msg
      const isNewRecord = LS.setBest(currentDiff.id, state.score);
      badge.style.display = isNewRecord ? 'block' : 'none';
      bestMsg.style.display = 'block';
      const currentBest = LS.getBest(currentDiff.id);
      const diffLabel = t('diff_'+currentDiff.id);
      bestMsg.innerHTML = t('result_best_msg')(currentBest, diffLabel);
      if (shareRow) shareRow.style.display = 'block';
    }

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

  // ── EMAIL → LOCAL MOCK / NETLIFY FORMS ───────────────────────
  function isLocalWaitlistMode() {
    return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname) || window.location.protocol === 'file:';
  }

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function isValidWaitlistEmail(email) {
    if (!WAITLIST_EMAIL_RE.test(email)) return false;
    const [local, domain] = email.split('@');
    if (!local || !domain) return false;
    if (/[/:<>"\s]/.test(email)) return false;
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
    const labels = domain.split('.');
    if (labels.some((label) => !label || label.startsWith('-') || label.endsWith('-'))) return false;
    const tld = labels[labels.length - 1];
    return /^[a-z]{2,}$/i.test(tld);
  }

  function readWaitlistSubmissions() {
    const submissions = LS.get(WAITLIST_STORAGE_KEY);
    return Array.isArray(submissions) ? submissions : [];
  }

  function saveLocalWaitlistSubmission(email) {
    const normalizedEmail = normalizeEmail(email);
    const submissions = readWaitlistSubmissions();
    const existing = submissions.find((entry) => normalizeEmail(entry.email) === normalizedEmail);

    if (existing) {
      return { submission: existing, duplicate: true };
    }

    const submission = {
      email: normalizedEmail,
      lang: currentLang,
      source: 'localStorage',
      formName: WAITLIST_FORM_NAME,
      createdAt: new Date().toISOString(),
      page: `${window.location.pathname}${window.location.hash || ''}`,
    };
    LS.set(WAITLIST_STORAGE_KEY, [submission, ...submissions]);
    return { submission, duplicate: false };
  }

  function showWaitlistSuccess(form, input, success) {
    const submitButton = form.querySelector('button[type="submit"]');
    const successText = success.querySelector('span');
    window.clearTimeout(waitlistButtonTimer);
    window.clearTimeout(waitlistMessageTimer);

    success.style.display = 'block';
    success.classList.remove('waitlist-success-pop', 'waitlist-success-fade');
    void success.offsetWidth;
    success.classList.add('waitlist-success-pop');
    if (successText) {
      successText.textContent = t('email_ok');
    }

    input.value = '';
    window.setTimeout(() => input.focus(), 150);

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = t('email_saved_cta');
      submitButton.classList.add('waitlist-submit-saved');
      waitlistButtonTimer = window.setTimeout(() => {
        submitButton.textContent = t('email_cta');
        submitButton.classList.remove('waitlist-submit-saved');
      }, WAITLIST_SUCCESS_BUTTON_DELAY);
    }

    waitlistMessageTimer = window.setTimeout(() => {
      success.classList.remove('waitlist-success-pop');
      success.classList.add('waitlist-success-fade');
      success.addEventListener('animationend', () => {
        if (success.classList.contains('waitlist-success-fade')) {
          success.style.display = 'none';
          success.classList.remove('waitlist-success-fade');
        }
      }, { once: true });
    }, WAITLIST_SUCCESS_MESSAGE_DELAY);
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    const form    = e.target;
    const input   = document.getElementById('emailInput');
    const email   = normalizeEmail(input.value);
    const btn     = form.querySelector('button[type="submit"]');
    const success = document.getElementById('emailSuccess');

    input.setCustomValidity('');
    if (!input.validity.valid || !isValidWaitlistEmail(email)) {
      input.setCustomValidity(
        currentLang === 'fr'
          ? 'Entre une adresse email valide.'
          : 'Enter a valid email address.'
      );
      input.reportValidity();
      return;
    }

    if (isLocalWaitlistMode()) {
      saveLocalWaitlistSubmission(email);
      showWaitlistSuccess(form, input, success);
      return;
    }

    // Optimistic UI — disable button while sending
    const originalText = btn.textContent;
    btn.disabled   = true;
    btn.textContent = '...';

    try {
      const body = new URLSearchParams({
        'form-name': WAITLIST_FORM_NAME,
        'email':     email,
        'lang':      currentLang,
      });

      const res = await fetch('/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body.toString(),
      });

      if (res.ok) {
        showWaitlistSuccess(form, input, success);
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
