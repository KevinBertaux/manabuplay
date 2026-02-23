<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue';
import {
  createMultiplicationQuizSession,
  evaluateAnswer,
} from '@/features/math/quizEngine';
import MotivationToast from '@/components/MotivationToast.vue';
import QuizActions from '@/components/QuizActions.vue';
import QuizEmptyState from '@/components/QuizEmptyState.vue';
import QuizFeedbackBanner from '@/components/QuizFeedbackBanner.vue';
import QuizNumericPad from '@/components/QuizNumericPad.vue';
import QuizScoreBar from '@/components/QuizScoreBar.vue';
import { useQuizFlow } from '@/composables/useQuizFlow';
import {
  buildMotivationToast,
  MOTIVATION_TOAST_DURATION_MS,
  resetMotivationRunState,
} from '@/features/motivation/toastEngine';

const BEST_STREAK_KEY = 'manabuplay_math_best_streak_v1';
const AUTO_NEXT_DELAY_MS = 2000;
const TABLE_VALUES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

const selectedTables = ref([]);
const questionOrderMode = ref('ordered');
const reviewErrorsEnabled = ref(true);
const answerInput = ref('');
const answerField = ref(null);
const quizSession = ref(null);
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

const quickActions = [
  {
    id: 'all',
    label: 'Tout',
    apply: () => setSelectedTables(TABLE_VALUES),
  },
  {
    id: 'none',
    label: 'Aucun',
    apply: () => setSelectedTables([]),
  },
  {
    id: 'even',
    label: 'Pairs',
    apply: () => setSelectedTables(TABLE_VALUES.filter((value) => value % 2 === 0)),
  },
  {
    id: 'odd',
    label: 'Impairs',
    apply: () => setSelectedTables(TABLE_VALUES.filter((value) => value % 2 !== 0)),
  },
];

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

function hasSelectedTable(table) {
  return selectedTables.value.includes(table);
}

function setSelectedTables(tables) {
  const normalized = [...new Set(tables)]
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 11)
    .sort((a, b) => a - b);
  selectedTables.value = normalized;
}

function toggleTable(table) {
  if (hasSelectedTable(table)) {
    setSelectedTables(selectedTables.value.filter((value) => value !== table));
    return;
  }
  setSelectedTables([...selectedTables.value, table]);
}

function applyQuickAction(actionId) {
  const action = quickActions.find((item) => item.id === actionId);
  action?.apply();
}

function setOrderMode(mode) {
  questionOrderMode.value = mode === 'mixed' ? 'mixed' : 'ordered';
}

function toggleReviewErrors() {
  reviewErrorsEnabled.value = !reviewErrorsEnabled.value;
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
    return;
  }
  quizSession.value = createMultiplicationQuizSession({
    tables: selectedTables.value,
    mode: questionOrderMode.value,
    reviewErrorsEnabled: reviewErrorsEnabled.value,
  });
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

watch([selectedTables, questionOrderMode, reviewErrorsEnabled], () => {
  motivationState.value = resetMotivationRunState(motivationState.value);
  resetQuizSession();
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
      <div class="settings-group">
        <p class="settings-label">Choisir les tables :</p>
        <div class="table-grid" role="group" aria-label="Choix des tables de multiplication">
          <button
            v-for="table in TABLE_VALUES"
            :key="`table-${table}`"
            type="button"
            class="table-cell"
            :class="{ 'is-selected': hasSelectedTable(table) }"
            @click="toggleTable(table)"
          >
            {{ table }}
          </button>

          <button
            v-for="action in quickActions"
            :key="`action-${action.id}`"
            type="button"
            class="table-cell table-action"
            @click="applyQuickAction(action.id)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-inline">
          <p class="settings-label">Ordre des questions :</p>
          <div class="segmented-control" role="radiogroup" aria-label="Ordre des questions">
            <button
              type="button"
              class="segment-btn"
              :class="{ 'is-active': questionOrderMode === 'ordered' }"
              :aria-pressed="questionOrderMode === 'ordered'"
              @click="setOrderMode('ordered')"
            >
              Dans l'ordre
            </button>
            <button
              type="button"
              class="segment-btn"
              :class="{ 'is-active': questionOrderMode === 'mixed' }"
              :aria-pressed="questionOrderMode === 'mixed'"
              @click="setOrderMode('mixed')"
            >
              Tout mélanger
            </button>
          </div>
        </div>

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

    <QuizEmptyState v-if="selectedTables.length === 0" message="Choisir une table pour commencer." />

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

    <div v-if="selectedTables.length > 0 && currentQuestion" class="question-layout">
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
        class="question-pad"
        :answer-locked="hasChecked"
        @digit="appendDigit"
        @backspace="backspaceAnswer"
        @enter="submitFromPad"
      />
    </div>

    <QuizActions
      v-if="selectedTables.length > 0"
      :can-check="canCheck"
      @check="checkAnswer"
      @next="loadNextQuestion"
    />
  </section>
</template>

<style scoped>
.math-page {
  max-width: 760px;
  margin-inline: auto;
}

.settings-box {
  background: rgba(255, 230, 109, 0.14);
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 18px;
}

.settings-group {
  margin-bottom: 14px;
}

.settings-label {
  margin: 0 0 8px;
  font-weight: 700;
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: min(320px, 100%);
  margin-inline: auto;
  gap: 0;
  border: 1px solid #9bb9d3;
  border-radius: 12px;
  overflow: hidden;
  background: #f3faff;
}

.table-cell {
  border: 0;
  border-right: 1px solid #9bb9d3;
  border-bottom: 1px solid #9bb9d3;
  border-radius: 0;
  min-height: 44px;
  font-size: 1rem;
  font-weight: 700;
  color: #1d4b6a;
  background: transparent;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.table-cell:hover,
.table-cell:focus-visible {
  background: #deefff;
}

.table-grid .table-cell:nth-child(4n) {
  border-right: 0;
}

.table-grid .table-cell:nth-child(n + 13) {
  border-bottom: 0;
}

.table-cell.is-selected {
  color: var(--ink-inverse);
  background: var(--btn-primary-grad);
}

.table-action {
  background: #ecf8ef;
  color: #1d5740;
}

.table-action:hover,
.table-action:focus-visible {
  background: #d8f0df;
}

.settings-row {
  display: grid;
  gap: 10px;
  width: min(320px, 100%);
  margin-inline: auto;
}

.settings-inline {
  display: grid;
  gap: 6px;
}

.segmented-control {
  display: flex;
  border: 1px solid #9bb9d3;
  border-radius: 12px;
  overflow: hidden;
  background: #f3faff;
}

.segment-btn {
  border: 0;
  border-right: 1px solid #9bb9d3;
  background: transparent;
  color: #1d4b6a;
  font-weight: 700;
  padding: 10px 10px;
  min-height: 44px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.segment-btn:last-child {
  border-right: 0;
}

.segment-btn:hover,
.segment-btn:focus-visible {
  background: #deefff;
}

.segment-btn.is-active {
  color: var(--ink-inverse);
  background: var(--btn-secondary-grad);
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
  height: 10px;
  margin-bottom: 10px;
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

.question-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 228px;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 18px;
}

.question-pad {
  justify-self: stretch;
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

@media (max-width: 560px) {
  .question-layout {
    grid-template-columns: 1fr;
  }

  .question-pad {
    display: none;
  }

  .settings-row {
    width: 100%;
  }
}
</style>
