<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { evaluateAnswer, generateQuestion } from '@/features/math/quizEngine';
import MotivationToast from '@/components/MotivationToast.vue';
import {
  buildMotivationToast,
  MOTIVATION_TOAST_DURATION_MS,
  resetMotivationRunState,
} from '@/features/motivation/toastEngine';

const BEST_STREAK_KEY = 'manabuplay_math_best_streak_v1';

const tableSelect = ref('');
const score = ref(0);
const total = ref(0);
const streak = ref(0);
const bestStreak = ref(0);
const answerInput = ref('');
const answerField = ref(null);
const feedbackType = ref('');
const feedbackMain = ref('');
const feedbackExtra = ref('');
const hasAnsweredCurrentQuestion = ref(false);
const currentQuestion = ref(null);
const nextQuestionTimeoutId = ref(null);
const toastMessage = ref('');
const toastTone = ref('streak');
const toastTimeoutId = ref(null);
const motivationState = ref({
  hasShownX3InSession: false,
  hasShownRecordInRun: false,
});
const canCheck = computed(() => !hasAnsweredCurrentQuestion.value);

function readBestStreak() {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(BEST_STREAK_KEY);
    const parsed = Number.parseInt(raw ?? '0', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveBestStreak(value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(BEST_STREAK_KEY, String(value));
  } catch {
    // Ignore localStorage failures (private mode/quota).
  }
}

function clearNextQuestionTimeout() {
  if (nextQuestionTimeoutId.value) {
    clearTimeout(nextQuestionTimeoutId.value);
    nextQuestionTimeoutId.value = null;
  }
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

function nextQuestion() {
  clearNextQuestionTimeout();
  hasAnsweredCurrentQuestion.value = false;
  feedbackType.value = '';
  feedbackMain.value = '';
  feedbackExtra.value = '';
  answerInput.value = '';

  if (!tableSelect.value) {
    currentQuestion.value = null;
    return;
  }

  currentQuestion.value = generateQuestion(tableSelect.value);
  focusAnswerField();
}

function checkAnswer() {
  if (!currentQuestion.value || hasAnsweredCurrentQuestion.value) {
    return;
  }

  const result = evaluateAnswer({
    answerInput: answerInput.value,
    question: currentQuestion.value,
    score: score.value,
    total: total.value,
    streak: streak.value,
  });

  feedbackType.value = result.feedbackType;
  feedbackMain.value = result.feedbackMain;
  feedbackExtra.value = result.feedbackExtra;

  if (!result.isValid) {
    return;
  }

  hasAnsweredCurrentQuestion.value = true;
  score.value = result.nextScore;
  total.value = result.nextTotal;
  streak.value = result.nextStreak;
  const bestStreakBefore = bestStreak.value;

  if (streak.value > bestStreak.value) {
    bestStreak.value = streak.value;
    saveBestStreak(bestStreak.value);
  }

  if (result.feedbackType === 'correct') {
    const motivation = buildMotivationToast({
      streak: streak.value,
      bestStreakBefore,
      state: motivationState.value,
    });
    motivationState.value = motivation.state;
    showMotivationToast(motivation.toast);

    nextQuestionTimeoutId.value = setTimeout(() => {
      nextQuestionTimeoutId.value = null;
      nextQuestion();
    }, 2000);
  } else {
    motivationState.value = resetMotivationRunState(motivationState.value);
  }
}

function onAnswerKeydown(event) {
  if (event.key === 'Enter' && !event.repeat) {
    if (hasAnsweredCurrentQuestion.value) {
      nextQuestion();
    } else {
      checkAnswer();
    }
  }
}

watch(tableSelect, () => {
  motivationState.value = resetMotivationRunState(motivationState.value);
  nextQuestion();
});

onMounted(() => {
  bestStreak.value = readBestStreak();
});

onUnmounted(() => {
  clearNextQuestionTimeout();
  clearToastTimeout();
});
</script>

<template>
  <section class="page-block math-page">
    <h1>Math - Tables de multiplication</h1>

    <div class="settings-box">
      <label for="tableSelect">Choisir la table :</label>
      <select id="tableSelect" v-model="tableSelect">
        <option value="">-- Sélectionner une table --</option>
        <option value="0">Table de 0</option>
        <option value="1">Table de 1</option>
        <option value="2">Table de 2</option>
        <option value="3">Table de 3</option>
        <option value="4">Table de 4</option>
        <option value="5">Table de 5</option>
        <option value="6">Table de 6</option>
        <option value="7">Table de 7</option>
        <option value="8">Table de 8</option>
        <option value="9">Table de 9</option>
        <option value="10">Table de 10</option>
        <option value="11">Table de 11</option>
        <option value="all">Toutes les tables (0-11)</option>
      </select>
    </div>

    <div v-if="tableSelect" class="mp-panel-info">
      <span>Score : {{ score }} / {{ total }}</span>
      <span>🏆 Série : {{ streak }}</span>
      <span>🥇 Meilleure série : {{ bestStreak }}</span>
    </div>
    <div class="motivation-toast-anchor">
      <MotivationToast :message="toastMessage" :tone="toastTone" />
    </div>

    <div v-if="!tableSelect" class="empty-list-state">Choisir une table pour commencer.</div>

    <div
      v-if="tableSelect && feedbackMain"
      class="mp-feedback"
      :class="feedbackType === 'correct' ? 'mp-feedback-success' : 'mp-feedback-error'"
    >
      <div>{{ feedbackMain }}</div>
      <div v-if="feedbackExtra" class="feedback-extra">{{ feedbackExtra }}</div>
    </div>

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

    <div v-if="tableSelect" class="mp-actions">
      <button class="mp-btn mp-btn-primary" type="button" :disabled="!canCheck" @click="checkAnswer">
        Vérifier ✓
      </button>
      <button class="mp-btn mp-btn-secondary" type="button" @click="nextQuestion">
        Question suivante →
      </button>
    </div>
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

.settings-box label {
  display: block;
  margin: 0 0 8px;
  font-weight: 700;
}

.settings-box select {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #9ab0c8;
  background: white;
}

.settings-box select:focus-visible {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.16);
  outline: none;
}

.empty-list-state {
  text-align: center;
  font-weight: 700;
  color: #3a4b61;
  background: rgba(78, 205, 196, 0.12);
  border: 1px dashed #7ab8c3;
  border-radius: 12px;
  padding: 16px;
}

.feedback-extra {
  margin-top: 6px;
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
