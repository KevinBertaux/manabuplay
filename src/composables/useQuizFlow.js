import { computed, onMounted, onUnmounted, ref } from 'vue';

function readBestStreak(bestStreakKey) {
  if (!bestStreakKey || typeof window === 'undefined') {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(bestStreakKey);
    const parsed = Number.parseInt(raw ?? '0', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveBestStreak(bestStreakKey, value) {
  if (!bestStreakKey || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(bestStreakKey, String(value));
  } catch {
    // Ignore localStorage failures (private mode/quota).
  }
}

export function useQuizFlow({ bestStreakKey = '', autoNextDelayMs = 2000 } = {}) {
  const score = ref(0);
  const total = ref(0);
  const streak = ref(0);
  const bestStreak = ref(0);

  const currentQuestion = ref(null);
  const hasChecked = ref(false);
  const feedbackType = ref('');
  const feedbackMain = ref('');
  const feedbackExtra = ref('');

  const nextQuestionTimeoutId = ref(null);
  const canCheck = computed(() => !hasChecked.value);

  function clearAutoNextTimeout() {
    if (nextQuestionTimeoutId.value) {
      clearTimeout(nextQuestionTimeoutId.value);
      nextQuestionTimeoutId.value = null;
    }
  }

  function clearFeedback() {
    feedbackType.value = '';
    feedbackMain.value = '';
    feedbackExtra.value = '';
  }

  function setFeedback({ type = '', main = '', extra = '' } = {}) {
    feedbackType.value = type;
    feedbackMain.value = main;
    feedbackExtra.value = extra;
  }

  function setChecked(value) {
    hasChecked.value = Boolean(value);
  }

  function setCurrentQuestion(question) {
    currentQuestion.value = question ?? null;
  }

  function nextQuestion({ isReady = () => true, buildQuestion } = {}) {
    clearAutoNextTimeout();
    setChecked(false);
    clearFeedback();

    if (!isReady()) {
      setCurrentQuestion(null);
      return null;
    }

    const next = typeof buildQuestion === 'function' ? buildQuestion() : null;
    setCurrentQuestion(next);
    return next;
  }

  function applyProgress({ nextScore, nextTotal, nextStreak }) {
    const bestStreakBefore = bestStreak.value;
    score.value = nextScore;
    total.value = nextTotal;
    streak.value = nextStreak;

    if (streak.value > bestStreak.value) {
      bestStreak.value = streak.value;
      saveBestStreak(bestStreakKey, bestStreak.value);
    }

    return {
      bestStreakBefore,
      bestStreakAfter: bestStreak.value,
    };
  }

  function applyAttempt(isCorrect) {
    const bestStreakBefore = bestStreak.value;
    total.value += 1;

    if (isCorrect) {
      score.value += 1;
      streak.value += 1;
      if (streak.value > bestStreak.value) {
        bestStreak.value = streak.value;
        saveBestStreak(bestStreakKey, bestStreak.value);
      }
    } else {
      streak.value = 0;
    }

    return {
      bestStreakBefore,
      bestStreakAfter: bestStreak.value,
    };
  }

  function scheduleAutoNext(onNext) {
    clearAutoNextTimeout();
    nextQuestionTimeoutId.value = setTimeout(() => {
      nextQuestionTimeoutId.value = null;
      if (typeof onNext === 'function') {
        onNext();
      }
    }, autoNextDelayMs);
  }

  onMounted(() => {
    bestStreak.value = readBestStreak(bestStreakKey);
  });

  onUnmounted(() => {
    clearAutoNextTimeout();
  });

  return {
    score,
    total,
    streak,
    bestStreak,
    currentQuestion,
    hasChecked,
    canCheck,
    feedbackType,
    feedbackMain,
    feedbackExtra,
    setFeedback,
    clearFeedback,
    setChecked,
    setCurrentQuestion,
    nextQuestion,
    applyProgress,
    applyAttempt,
    scheduleAutoNext,
    clearAutoNextTimeout,
  };
}
