<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import {
  createMultiplicationQuizSession,
  evaluateAnswer,
} from '@/features/math/quizEngine';
import MotivationToast from '@/components/MotivationToast.vue';
import QuizActions from '@/components/QuizActions.vue';
import QuizEmptyState from '@/components/QuizEmptyState.vue';
import QuizFeedbackBanner from '@/components/QuizFeedbackBanner.vue';
import QuizNumericPad from '@/components/QuizNumericPad.vue';
import QuizSegmentedControl from '@/components/QuizSegmentedControl.vue';
import QuizScoreBar from '@/components/QuizScoreBar.vue';
import QuizTableSelector from '@/components/QuizTableSelector.vue';
import { useQuizFlow } from '@/composables/useQuizFlow';
import {
  buildMotivationToast,
  MOTIVATION_TOAST_DURATION_MS,
  resetMotivationRunState,
} from '@/features/motivation/toastEngine';

const BEST_STREAK_KEY = 'manabuplay_math_best_streak_v1';
const AUTO_NEXT_DELAY_MS = 2000;
const DIFFICULTY_OPTIONS = Object.freeze([
  { value: 'discovery', label: 'Découverte' },
  { value: 'standard', label: 'Standard' },
  { value: 'reinforced', label: 'Renforcé' },
  { value: 'infinite', label: 'Infini' },
]);
const ORDER_OPTIONS = Object.freeze([
  { value: 'ordered', label: "Dans l'ordre" },
  { value: 'mixed', label: 'Tout mélanger' },
]);

const selectedTables = ref([]);
const questionOrderMode = ref('ordered');
const difficultyId = ref('standard');
const passAfterWrong = ref(false);
const reviewErrorsEnabled = ref(true);
const answerInput = ref('');
const answerField = ref(null);
const quizSession = ref(null);
const sessionCompleted = ref(false);
const firstTryTotal = ref(0);
const firstTryCorrect = ref(0);
const toastMessage = ref('');
const toastTone = ref('streak');
const toastTimeoutId = ref(null);
const motivationState = ref({
  hasShownX3InSession: false,
  hasShownRecordInRun: false,
});
const {
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
  setChecked,
  nextQuestion,
  applyProgress,
  scheduleAutoNext,
  resetProgress,
  clearAutoNextTimeout,
} = useQuizFlow({
  bestStreakKey: BEST_STREAK_KEY,
  autoNextDelayMs: AUTO_NEXT_DELAY_MS,
});

const firstTryPercent = computed(() => {
  if (firstTryTotal.value <= 0) {
    return 0;
  }
  return Math.round((firstTryCorrect.value / firstTryTotal.value) * 100);
});

const firstTryBadge = computed(() => {
  const pct = firstTryPercent.value;
  if (pct >= 90) {
    return { emoji: '🏆', label: 'Excellent !' };
  }
  if (pct >= 75) {
    return { emoji: '🌟', label: 'Très bien !' };
  }
  if (pct >= 60) {
    return { emoji: '👍', label: 'Bien joué !' };
  }
  if (pct >= 40) {
    return { emoji: '📘', label: 'Continue !' };
  }
  return { emoji: '💪', label: "On s'entraîne encore !" };
});

function resetFirstTryStats() {
  firstTryTotal.value = 0;
  firstTryCorrect.value = 0;
}

function clearToastTimeout() {
  if (toastTimeoutId.value) {
    clearTimeout(toastTimeoutId.value);
    toastTimeoutId.value = null;
  }
}

function showMotivationToast(toast) {
  if (!toast) {
    return;
  }
  clearToastTimeout();
  toastTone.value = toast.tone;
  toastMessage.value = toast.message;
  toastTimeoutId.value = setTimeout(() => {
    toastTimeoutId.value = null;
    toastMessage.value = '';
  }, MOTIVATION_TOAST_DURATION_MS);
}

function focusAnswerField() {
  nextTick(() => {
    answerField.value?.focus();
  });
}

function toggleReviewErrors() {
  reviewErrorsEnabled.value = !reviewErrorsEnabled.value;
}

function togglePassAfterWrong() {
  passAfterWrong.value = !passAfterWrong.value;
}

function hasAnyTableSelected() {
  return selectedTables.value.length > 0;
}

function loadNextQuestion() {
  answerInput.value = '';

  const next = nextQuestion({
    isReady: () => hasAnyTableSelected(),
    buildQuestion: () => quizSession.value?.next() || null,
  });
  sessionCompleted.value = Boolean(quizSession.value?.getState?.().isCompleted);
  if (next) {
    focusAnswerField();
  }
}

function appendDigit(digit) {
  if (hasChecked.value) {
    return;
  }

  const safeDigit = String(digit).replace(/\D/g, '');
  if (!safeDigit) {
    return;
  }

  const nextRaw = `${answerInput.value}${safeDigit}`;
  answerInput.value = nextRaw.replace(/^0+(?=\d)/, '');
  focusAnswerField();
}

function backspaceAnswer() {
  if (hasChecked.value) {
    return;
  }
  answerInput.value = answerInput.value.slice(0, -1);
  focusAnswerField();
}

function submitFromPad() {
  if (hasChecked.value) {
    loadNextQuestion();
    return;
  }
  checkAnswer();
}

function resetQuizSession() {
  if (!hasAnyTableSelected()) {
    quizSession.value = null;
    sessionCompleted.value = false;
    return;
  }
  quizSession.value = createMultiplicationQuizSession({
    tables: selectedTables.value,
    mode: questionOrderMode.value,
    difficulty: difficultyId.value,
    reviewErrorsEnabled: reviewErrorsEnabled.value,
  });
  sessionCompleted.value = false;
}

function reviewBannerMain() {
  if (currentQuestion.value?.source !== 'review') {
    return '';
  }

  if (currentQuestion.value.reviewRemaining > 0) {
    return '🔁 Revoir les erreurs en cours.';
  }

  return '🔁 Revoir les erreurs: dernière question de cette série.';
}

function reviewBannerExtra() {
  if (currentQuestion.value?.source !== 'review' || currentQuestion.value.reviewRemaining <= 0) {
    return '';
  }
  const suffix = currentQuestion.value.reviewRemaining > 1 ? 's' : '';
  return `Encore ${currentQuestion.value.reviewRemaining} question${suffix} après celle-ci.`;
}

function checkAnswer() {
  if (!currentQuestion.value || hasChecked.value) {
    return;
  }

  const result = evaluateAnswer({
    answerInput: answerInput.value,
    question: currentQuestion.value,
    score: score.value,
    total: total.value,
    streak: streak.value,
  });

  setFeedback({
    type: result.feedbackType,
    main: result.feedbackMain,
    extra: result.feedbackExtra,
  });

  if (!result.isValid) {
    return;
  }

  const stateBeforeMark = quizSession.value?.getState?.();
  const isMainFirstTry =
    currentQuestion.value?.source === 'main' && stateBeforeMark?.phase === 'main';
  if (isMainFirstTry) {
    firstTryTotal.value += 1;
    if (result.feedbackType === 'correct') {
      firstTryCorrect.value += 1;
    }
  }

  quizSession.value?.markAnswer({
    question: currentQuestion.value,
    isCorrect: result.feedbackType === 'correct',
  });

  setChecked(true);
  const { bestStreakBefore } = applyProgress({
    nextScore: result.nextScore,
    nextTotal: result.nextTotal,
    nextStreak: result.nextStreak,
  });

  if (result.feedbackType === 'correct') {
    const motivation = buildMotivationToast({
      streak: streak.value,
      bestStreakBefore,
      state: motivationState.value,
    });
    motivationState.value = motivation.state;
    showMotivationToast(motivation.toast);

    scheduleAutoNext(() => {
      loadNextQuestion();
    });
  } else {
    motivationState.value = resetMotivationRunState(motivationState.value);
    if (passAfterWrong.value) {
      scheduleAutoNext(() => {
        loadNextQuestion();
      });
    }
  }
}

function restartSession() {
  motivationState.value = resetMotivationRunState(motivationState.value);
  resetProgress();
  resetFirstTryStats();
  resetQuizSession();
  loadNextQuestion();
}

function onAnswerKeydown(event) {
  if (event.key === 'Enter' && !event.repeat) {
    if (hasChecked.value) {
      loadNextQuestion();
    } else {
      checkAnswer();
    }
  }
}

watch([selectedTables, questionOrderMode, difficultyId, reviewErrorsEnabled], () => {
  motivationState.value = resetMotivationRunState(motivationState.value);
  resetProgress();
  resetFirstTryStats();
  resetQuizSession();
  loadNextQuestion();
});

onUnmounted(() => {
  clearAutoNextTimeout();
  clearToastTimeout();
});
</script>

<template>
  <section class="page-block mx-auto max-w-[760px]">
    <h1>Math - Tables de multiplication</h1>

    <div class="settings-box">
      <QuizTableSelector v-model="selectedTables" label="Choisir les tables :" />

      <div class="settings-grid grid w-full gap-[10px] md:mx-auto md:max-w-[360px]">
        <QuizSegmentedControl
          v-model="difficultyId"
          label="Difficulté :"
          aria-label="Choix de la difficulté"
          :options="DIFFICULTY_OPTIONS"
        />

        <QuizSegmentedControl
          v-model="questionOrderMode"
          label="Ordre des questions :"
          aria-label="Ordre des questions"
          :options="ORDER_OPTIONS"
        />

        <label class="review-toggle">
          <span class="settings-label review-toggle-label">Passer après erreur</span>
          <button
            type="button"
            class="toggle-btn"
            role="switch"
            :aria-checked="passAfterWrong"
            :class="{ 'is-on': passAfterWrong }"
            @click="togglePassAfterWrong"
          >
            <span class="toggle-track">
              <span class="toggle-thumb" />
            </span>
          </button>
        </label>

        <label class="review-toggle">
          <span class="settings-label review-toggle-label">Revoir mes erreurs</span>
          <button
            type="button"
            class="toggle-btn"
            role="switch"
            :aria-checked="reviewErrorsEnabled"
            :class="{ 'is-on': reviewErrorsEnabled }"
            @click="toggleReviewErrors"
          >
            <span class="toggle-track">
              <span class="toggle-thumb" />
            </span>
          </button>
        </label>
      </div>
    </div>

    <QuizScoreBar
      v-if="selectedTables.length > 0"
      :score="score"
      :total="total"
      :streak="streak"
      :best-streak="bestStreak"
    />
    <div class="motivation-toast-anchor">
      <MotivationToast :message="toastMessage" :tone="toastTone" />
    </div>

    <QuizEmptyState v-if="selectedTables.length === 0" message="Choisir les tables pour commencer." />

    <QuizFeedbackBanner
      v-if="selectedTables.length > 0 && currentQuestion?.source === 'review'"
      type="correct"
      :main="reviewBannerMain()"
      :extra="reviewBannerExtra()"
    />

    <QuizFeedbackBanner
      v-if="selectedTables.length > 0 && feedbackMain"
      :type="feedbackType"
      :main="feedbackMain"
      :extra="feedbackExtra"
    />

    <div v-if="selectedTables.length > 0 && sessionCompleted" class="session-complete">
      <p class="session-complete-title">🎉 Session terminée !</p>
      <p class="session-complete-tier">{{ firstTryBadge.emoji }} {{ firstTryBadge.label }}</p>
      <p class="session-complete-score">Score : {{ score }} / {{ total }}</p>
      <p class="session-complete-percent">{{ firstTryPercent }}%</p>
      <button class="mp-btn mp-btn-secondary" type="button" @click="restartSession">
        Nouvelle session
      </button>
    </div>

    <div
      v-if="selectedTables.length > 0 && currentQuestion && !sessionCompleted"
      class="mb-[18px] grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_228px] md:items-stretch"
    >
      <div class="question-box">
        <div class="question">{{ currentQuestion.num1 }} × {{ currentQuestion.num2 }} = ?</div>
        <input
          ref="answerField"
          v-model="answerInput"
          class="answer-input"
          type="number"
          min="0"
          placeholder="?"
          autocomplete="off"
          @keydown="onAnswerKeydown"
        />
      </div>

      <QuizNumericPad
        class="hidden md:block"
        :answer-locked="hasChecked"
        @digit="appendDigit"
        @backspace="backspaceAnswer"
        @enter="submitFromPad"
      />
    </div>

    <QuizActions
      v-if="selectedTables.length > 0 && currentQuestion && !sessionCompleted"
      :can-check="canCheck"
      @check="checkAnswer"
      @next="loadNextQuestion"
    />
  </section>
</template>

<style scoped>
.settings-box {
  background: rgba(255, 230, 109, 0.14);
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 18px;
}

.settings-box :deep(.table-selector) {
  margin-bottom: 14px;
}

.settings-label {
  margin: 0 0 8px;
  font-weight: 700;
}

.settings-grid :deep(.segmented-field) {
  width: 100%;
}

.review-toggle {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  border: 1px solid #9bb9d3;
  border-radius: 12px;
  overflow: hidden;
  background: #f3faff;
}

.review-toggle-label {
  margin: 0;
  min-height: 44px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  border-right: 1px solid #9bb9d3;
}

.toggle-btn {
  border: 0;
  padding: 0 10px;
  min-height: 44px;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.toggle-track {
  width: 52px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid #95aac0;
  background: #d7e1ea;
  display: inline-flex;
  align-items: center;
  padding: 3px;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fbfdff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  transform: translateX(0);
  transition: transform 0.18s ease;
}

.toggle-btn.is-on .toggle-track {
  border-color: #3aaf7b;
  background: linear-gradient(135deg, #51c18f, #35aa76);
}

.toggle-btn.is-on .toggle-thumb {
  transform: translateX(22px);
}

.motivation-toast-anchor {
  position: relative;
  height: 0;
  margin: 0;
}

.question-box {
  background: linear-gradient(140deg, #f6fbff, #eaf5ff);
  border: 1px solid #bfd8ec;
  padding: 34px 22px;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 0;
  box-shadow: 0 10px 24px rgba(36, 48, 65, 0.08);
}

.session-complete {
  margin-bottom: 18px;
  border: 1px solid #bfd8ec;
  border-radius: 14px;
  background: #f6fbff;
  padding: 14px;
  text-align: center;
  display: grid;
  gap: 10px;
}

.session-complete p {
  margin: 0;
}

.session-complete-title,
.session-complete-tier,
.session-complete-score {
  font-weight: 700;
}

.session-complete-percent {
  font-size: clamp(2rem, 5vw, 2.6rem);
  line-height: 1;
  font-weight: 800;
  color: #1d4b6a;
}

.question {
  font-size: 2.4em;
  font-weight: 800;
  margin-bottom: 14px;
}

.answer-input {
  font-size: 2em;
  padding: 12px 18px;
  border: 2px solid #5f9fc6;
  background: #fbfdff;
  border-radius: 14px;
  text-align: center;
  width: 150px;
  font-weight: 700;
}

.answer-input:focus-visible {
  outline: none;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.16);
}

@media (max-width: 1023px) {
  .question {
    font-size: 2em;
  }

  .answer-input {
    width: 130px;
    font-size: 1.7em;
  }
}

</style>
