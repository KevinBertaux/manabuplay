<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { createSymmetryQuestionBag, evaluateSymmetryAnswer } from '@/features/math/symmetryEngine';
import MotivationToast from '@/components/MotivationToast.vue';
import QuizFeedbackBanner from '@/components/QuizFeedbackBanner.vue';
import QuizScoreBar from '@/components/QuizScoreBar.vue';
import {
  buildMotivationToast,
  MOTIVATION_TOAST_DURATION_MS,
  resetMotivationRunState,
} from '@/features/motivation/toastEngine';

const BEST_STREAK_KEY = 'manabuplay_symmetry_best_streak_v1';
const AUTO_NEXT_DELAY_MS = 2000;

const questionBag = createSymmetryQuestionBag();
const currentQuestion = ref(questionBag.next());
const selectedOptionId = ref('');
const hasChecked = ref(false);
const feedbackType = ref('');
const feedbackMain = ref('');
const feedbackExtra = ref('');
const score = ref(0);
const total = ref(0);
const streak = ref(0);
const bestStreak = ref(0);
const nextQuestionTimeoutId = ref(null);
const toastMessage = ref('');
const toastTone = ref('streak');
const toastTimeoutId = ref(null);
const motivationState = ref({
  hasShownX3InSession: false,
  hasShownRecordInRun: false,
});

const optionLabels = ['1', '2', '3', '4'];
const canCheck = computed(() => !hasChecked.value);
const axisLabel = computed(() => (currentQuestion.value.axis === 'horizontal' ? 'horizontal' : 'vertical'));

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

function nextQuestion() {
  clearNextQuestionTimeout();
  currentQuestion.value = questionBag.next();
  selectedOptionId.value = '';
  hasChecked.value = false;
  feedbackType.value = '';
  feedbackMain.value = '';
  feedbackExtra.value = '';
}

function selectOption(optionId) {
  if (hasChecked.value) {
    return;
  }
  selectedOptionId.value = optionId;
}

function checkAnswer() {
  if (hasChecked.value) {
    return;
  }

  const result = evaluateSymmetryAnswer(currentQuestion.value, selectedOptionId.value);
  feedbackType.value = result.isCorrect ? 'correct' : 'incorrect';
  feedbackMain.value = '';
  feedbackExtra.value = '';

  if (!result.isValid) {
    feedbackMain.value = '⚠️ Choisir une réponse avant de vérifier.';
    return;
  }

  hasChecked.value = true;
  total.value += 1;

  if (result.isCorrect) {
    score.value += 1;
    streak.value += 1;
    const bestStreakBefore = bestStreak.value;

    if (streak.value > bestStreak.value) {
      bestStreak.value = streak.value;
      saveBestStreak(bestStreak.value);
    }

    const motivation = buildMotivationToast({
      streak: streak.value,
      bestStreakBefore,
      state: motivationState.value,
    });
    motivationState.value = motivation.state;
    showMotivationToast(motivation.toast);

    feedbackMain.value = 'Bonne réponse.';
    nextQuestionTimeoutId.value = setTimeout(() => {
      nextQuestionTimeoutId.value = null;
      nextQuestion();
    }, AUTO_NEXT_DELAY_MS);
    return;
  }

  const correctIndex = currentQuestion.value.options.findIndex(
    (option) => option.id === currentQuestion.value.correctOptionId
  );
  const correctLabel = correctIndex >= 0 ? optionLabels[correctIndex] : '?';
  feedbackMain.value = '❌ Mauvaise réponse.';
  feedbackExtra.value = `Bonne réponse : ${correctLabel}. Axe : ${axisLabel.value}.`;
  streak.value = 0;
  motivationState.value = resetMotivationRunState(motivationState.value);
}

function optionStateClass(option) {
  if (!hasChecked.value) {
    return selectedOptionId.value === option.id ? 'is-selected' : '';
  }

  if (option.id === currentQuestion.value.correctOptionId) {
    return 'is-correct';
  }

  if (option.id === selectedOptionId.value && option.id !== currentQuestion.value.correctOptionId) {
    return 'is-incorrect';
  }

  return '';
}

function pointToPixel(point, gridSize, size = 120, padding = 12) {
  const step = (size - padding * 2) / (gridSize - 1);
  return {
    x: padding + point.x * step,
    y: padding + point.y * step,
  };
}

function shapePoints(points, gridSize) {
  return points
    .map((point) => pointToPixel(point, gridSize))
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
}

function shouldCloseShape(points) {
  return currentQuestion.value.renderMode === 'closed' && points.length >= 3;
}

function axisLine(axis, gridSize, size = 120, padding = 12) {
  const step = (size - padding * 2) / (gridSize - 1);

  if (axis === 'horizontal') {
    const axisY = padding + ((gridSize - 1) / 2) * step;
    return {
      x1: padding,
      y1: axisY,
      x2: size - padding,
      y2: axisY,
    };
  }

  const axisX = padding + ((gridSize - 1) / 2) * step;
  return {
    x1: axisX,
    y1: padding,
    x2: axisX,
    y2: size - padding,
  };
}

function renderGridLines(gridSize, size = 120, padding = 12) {
  const lines = [];
  const step = (size - padding * 2) / (gridSize - 1);

  for (let i = 0; i < gridSize; i += 1) {
    const position = padding + i * step;
    lines.push({ x1: padding, y1: position, x2: size - padding, y2: position });
    lines.push({ x1: position, y1: padding, x2: position, y2: size - padding });
  }

  return lines;
}

function onKeydown(event) {
  const mapping = {
    1: 0,
    2: 1,
    3: 2,
    4: 3,
  };

  if (event.key in mapping) {
    const option = currentQuestion.value.options[mapping[event.key]];
    if (option) {
      selectOption(option.id);
    }
  }

  if (event.key === 'Enter') {
    if (hasChecked.value) {
      nextQuestion();
    } else {
      checkAnswer();
    }
  }
}

onMounted(() => {
  bestStreak.value = readBestStreak();
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  clearNextQuestionTimeout();
  clearToastTimeout();
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <section class="page-block symmetry-page">
    <h1>Math - Symétrie</h1>

    <QuizScoreBar
      :score="score"
      :total="total"
      :streak="streak"
      :best-streak="bestStreak"
      :extras="[ `Axe : ${axisLabel}` ]"
    />
    <div class="motivation-toast-anchor">
      <MotivationToast :message="toastMessage" :tone="toastTone" />
    </div>

    <QuizFeedbackBanner v-if="feedbackMain" :type="feedbackType" :main="feedbackMain" :extra="feedbackExtra" />

    <div class="prompt-box">
      <p>{{ currentQuestion.prompt }}</p>
      <svg viewBox="0 0 120 120" class="shape-preview" aria-label="Figure de référence">
        <line
          v-for="(line, index) in renderGridLines(currentQuestion.gridSize)"
          :key="`grid-${index}`"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
          class="grid-line"
        />
        <polygon
          v-if="shouldCloseShape(currentQuestion.baseShape)"
          :points="shapePoints(currentQuestion.baseShape, currentQuestion.gridSize)"
          class="shape-line"
        />
        <polyline
          v-else
          :points="shapePoints(currentQuestion.baseShape, currentQuestion.gridSize)"
          class="shape-line"
        />
        <circle
          v-for="(point, idx) in currentQuestion.baseShape"
          :key="`base-point-${idx}`"
          :cx="pointToPixel(point, currentQuestion.gridSize).x"
          :cy="pointToPixel(point, currentQuestion.gridSize).y"
          r="3.2"
          class="shape-dot"
        />
        <line
          :x1="axisLine(currentQuestion.axis, currentQuestion.gridSize).x1"
          :y1="axisLine(currentQuestion.axis, currentQuestion.gridSize).y1"
          :x2="axisLine(currentQuestion.axis, currentQuestion.gridSize).x2"
          :y2="axisLine(currentQuestion.axis, currentQuestion.gridSize).y2"
          class="axis-line"
        />
      </svg>
    </div>

    <div class="options-grid">
      <button
        v-for="(option, idx) in currentQuestion.options"
        :key="option.id"
        class="option-btn"
        :class="optionStateClass(option)"
        type="button"
        @click="selectOption(option.id)"
      >
        <span class="option-label">{{ optionLabels[idx] }}</span>
        <svg viewBox="0 0 120 120" class="option-preview" :aria-label="`Option ${optionLabels[idx]}`">
          <line
            v-for="(line, index) in renderGridLines(currentQuestion.gridSize)"
            :key="`option-grid-${idx}-${index}`"
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            class="grid-line"
          />
          <polygon
            v-if="shouldCloseShape(option.points)"
            :points="shapePoints(option.points, currentQuestion.gridSize)"
            class="shape-line"
          />
          <polyline
            v-else
            :points="shapePoints(option.points, currentQuestion.gridSize)"
            class="shape-line"
          />
          <circle
            v-for="(point, pointIndex) in option.points"
            :key="`option-point-${idx}-${pointIndex}`"
            :cx="pointToPixel(point, currentQuestion.gridSize).x"
            :cy="pointToPixel(point, currentQuestion.gridSize).y"
            r="3.2"
            class="shape-dot"
          />
          <line
            :x1="axisLine(currentQuestion.axis, currentQuestion.gridSize).x1"
            :y1="axisLine(currentQuestion.axis, currentQuestion.gridSize).y1"
            :x2="axisLine(currentQuestion.axis, currentQuestion.gridSize).x2"
            :y2="axisLine(currentQuestion.axis, currentQuestion.gridSize).y2"
            class="axis-line"
          />
        </svg>
      </button>
    </div>

    <div class="mp-actions">
      <button class="mp-btn mp-btn-primary" type="button" :disabled="!canCheck" @click="checkAnswer">
        Vérifier ✓
      </button>
      <button class="mp-btn mp-btn-secondary" type="button" @click="nextQuestion">Question suivante →</button>
    </div>

    <p class="hint">Raccourcis clavier: 1, 2, 3, 4 pour choisir une option, Entrée pour vérifier/suivant.</p>
  </section>
</template>

<style scoped>
.symmetry-page {
  max-width: 820px;
  margin-inline: auto;
}

.symmetry-page :deep(.mp-actions) {
  margin-top: 18px;
}

.prompt-box {
  margin-bottom: 8px;
  text-align: center;
}

.prompt-box p {
  margin: 0 0 6px;
  font-weight: 700;
}

.shape-preview {
  display: block;
  width: 150px;
  height: 150px;
  margin-inline: auto;
  border-radius: 12px;
  border: 1px solid #c6d5e8;
  background: #fbfdff;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  max-width: 620px;
  margin-inline: auto;
}

.option-btn {
  position: relative;
  border: 1px solid #8ea8c2;
  border-radius: 12px;
  background: #fbfdff;
  padding: 10px 10px 8px;
  display: grid;
  justify-items: center;
  cursor: pointer;
  box-shadow: 0 2px 0 rgba(15, 23, 42, 0.12);
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.option-btn:hover {
  background: #ebf4ff;
  border-color: #55789e;
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.18);
}

.option-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 0 rgba(15, 23, 42, 0.14);
}

.option-label {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 24px;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.2;
  color: #243041;
  background: #e6f9f7;
  border: 1px solid #bfece7;
  text-align: center;
}

.option-preview {
  width: 150px;
  height: 150px;
}

.option-btn.is-selected {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.2);
}

.option-btn.is-correct {
  border-color: #2fa36b;
  background: #f0fff7;
}

.option-btn.is-incorrect {
  border-color: #d95f5f;
  background: #fff3f3;
}

.grid-line {
  stroke: #e6edf6;
  stroke-width: 1;
}

.axis-line {
  stroke: #0f766e;
  stroke-width: 2;
  stroke-dasharray: 4 3;
}

.shape-line {
  fill: none;
  stroke: #243041;
  stroke-width: 2.4;
}

.shape-dot {
  fill: #243041;
}

.hint {
  margin: 6px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.88rem;
}

.motivation-toast-anchor {
  position: relative;
  height: 10px;
  margin-bottom: 10px;
}

@media (max-width: 700px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .shape-preview,
  .option-preview {
    width: 120px;
    height: 120px;
  }
}
</style>
