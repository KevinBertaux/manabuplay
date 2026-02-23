<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue';
import {
  createMultiplicationQuestionBag,
  evaluateAnswer,
  generateQuestion,
} from '@/features/math/quizEngine';
import MotivationToast from '@/components/MotivationToast.vue';
import QuizActions from '@/components/QuizActions.vue';
import QuizEmptyState from '@/components/QuizEmptyState.vue';
import QuizFeedbackBanner from '@/components/QuizFeedbackBanner.vue';
import QuizScoreBar from '@/components/QuizScoreBar.vue';
import QuizSelectField from '@/components/QuizSelectField.vue';
import { useQuizFlow } from '@/composables/useQuizFlow';
import {
  buildMotivationToast,
  MOTIVATION_TOAST_DURATION_MS,
  resetMotivationRunState,
} from '@/features/motivation/toastEngine';

const BEST_STREAK_KEY = 'manabuplay_math_best_streak_v1';
const AUTO_NEXT_DELAY_MS = 2000;
const tableOptions = [
  { value: '0', label: 'Table de 0' },
  { value: '1', label: 'Table de 1' },
  { value: '2', label: 'Table de 2' },
  { value: '3', label: 'Table de 3' },
  { value: '4', label: 'Table de 4' },
  { value: '5', label: 'Table de 5' },
  { value: '6', label: 'Table de 6' },
  { value: '7', label: 'Table de 7' },
  { value: '8', label: 'Table de 8' },
  { value: '9', label: 'Table de 9' },
  { value: '10', label: 'Table de 10' },
  { value: '11', label: 'Table de 11' },
  { value: 'all', label: 'Toutes les tables (0-11)' },
];

const tableSelect = ref('');
const answerInput = ref('');
const answerField = ref(null);
const questionBag = ref(null);
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
  clearAutoNextTimeout,
} = useQuizFlow({
  bestStreakKey: BEST_STREAK_KEY,
  autoNextDelayMs: AUTO_NEXT_DELAY_MS,
});

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

function loadNextQuestion() {
  answerInput.value = '';

  const next = nextQuestion({
    isReady: () => Boolean(tableSelect.value),
    buildQuestion: () => questionBag.value?.next() || generateQuestion(tableSelect.value),
  });
  if (next) {
    focusAnswerField();
  }
}

function resetQuestionBag() {
  if (!tableSelect.value) {
    questionBag.value = null;
    return;
  }
  questionBag.value = createMultiplicationQuestionBag(tableSelect.value);
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
  }
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

watch(tableSelect, () => {
  motivationState.value = resetMotivationRunState(motivationState.value);
  resetQuestionBag();
  loadNextQuestion();
});

onUnmounted(() => {
  clearAutoNextTimeout();
  clearToastTimeout();
});
</script>

<template>
  <section class="page-block math-page">
    <h1>Math - Tables de multiplication</h1>

    <div class="settings-box">
      <QuizSelectField
        v-model="tableSelect"
        select-id="tableSelect"
        label="Choisir la table :"
        placeholder="-- Sélectionner une table --"
        :options="tableOptions"
      />
    </div>

    <QuizScoreBar
      v-if="tableSelect"
      :score="score"
      :total="total"
      :streak="streak"
      :best-streak="bestStreak"
    />
    <div class="motivation-toast-anchor">
      <MotivationToast :message="toastMessage" :tone="toastTone" />
    </div>

    <QuizEmptyState v-if="!tableSelect" message="Choisir une table pour commencer." />

    <QuizFeedbackBanner
      v-if="tableSelect && feedbackMain"
      :type="feedbackType"
      :main="feedbackMain"
      :extra="feedbackExtra"
    />

    <div v-if="tableSelect && currentQuestion" class="question-box">
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

    <QuizActions v-if="tableSelect" :can-check="canCheck" @check="checkAnswer" @next="loadNextQuestion" />
  </section>
</template>

<style scoped>
.math-page {
  max-width: 760px;
  margin-inline: auto;
}

.settings-box {
  background: rgba(255, 230, 109, 0.2);
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 18px;
}

.motivation-toast-anchor {
  position: relative;
  height: 10px;
  margin-bottom: 10px;
}

.question-box {
  background: linear-gradient(140deg, #f6fbff, #eaf5ff);
  border: 1px solid #bfd8ec;
  padding: 34px 22px;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 18px;
  box-shadow: 0 10px 24px rgba(36, 48, 65, 0.08);
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

@media (max-width: 820px) {
  .question {
    font-size: 2em;
  }

  .answer-input {
    width: 130px;
    font-size: 1.7em;
  }
}
</style>
