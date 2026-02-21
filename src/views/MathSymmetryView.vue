<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { createSymmetryQuestionBag, evaluateSymmetryAnswer } from '@/features/math/symmetryEngine';

const BEST_STREAK_KEY = 'manabuplay_symmetry_best_streak_v1';
const AUTO_NEXT_DELAY_MS = 2000;

const questionBag = createSymmetryQuestionBag();
const currentQuestion = ref(questionBag.next());
const selectedOptionId = ref('');
const hasChecked = ref(false);
const feedbackType = ref('');
const feedbackMessage = ref('');
const score = ref(0);
const total = ref(0);
const streak = ref(0);
const bestStreak = ref(0);
const nextQuestionTimeoutId = ref(null);

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

function nextQuestion() {
  clearNextQuestionTimeout();
  currentQuestion.value = questionBag.next();
  selectedOptionId.value = '';
  hasChecked.value = false;
  feedbackType.value = '';
  feedbackMessage.value = '';
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
  feedbackMessage.value = result.message;

  if (!result.isValid) {
    return;
  }

  hasChecked.value = true;
  total.value += 1;

  if (result.isCorrect) {
    score.value += 1;
    streak.value += 1;

    if (streak.value > bestStreak.value) {
      bestStreak.value = streak.value;
      saveBestStreak(bestStreak.value);
    }

    nextQuestionTimeoutId.value = setTimeout(() => {
      nextQuestionTimeoutId.value = null;
      nextQuestion();
    }, AUTO_NEXT_DELAY_MS);
    return;
  }

  streak.value = 0;
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
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <section class="page-block symmetry-page">
    <h1>Math - Symétrie</h1>

    <div class="score-panel">
      <span>Score : {{ score }} / {{ total }}</span>
      <span>🏆 Série : {{ streak }}</span>
      <span>🥇 Meilleure série : {{ bestStreak }}</span>
      <span>Axe : {{ axisLabel }}</span>
    </div>

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

    <div class="actions">
      <button class="btn btn-primary" type="button" :disabled="!canCheck" @click="checkAnswer">Vérifier</button>
      <button class="btn btn-secondary" type="button" @click="nextQuestion">Question suivante</button>
    </div>

    <div v-if="feedbackMessage" class="feedback" :class="feedbackType === 'correct' ? 'ok' : 'ko'">
      {{ feedbackMessage }}
    </div>

    <p class="hint">Raccourcis clavier: 1, 2, 3, 4 pour choisir une option, Entrée pour vérifier/suivant.</p>
  </section>
</template>

<style scoped>
.symmetry-page {
  max-width: 860px;
  margin-inline: auto;
}

.score-panel {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 12px;
  font-weight: 700;
  background: rgba(78, 205, 196, 0.14);
}

.prompt-box {
  margin-bottom: 14px;
  text-align: center;
}

.prompt-box p {
  margin: 0 0 10px;
  font-weight: 700;
}

.shape-preview {
  width: 170px;
  height: 170px;
  border-radius: 12px;
  border: 1px solid #d9e1ed;
  background: #fff;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.option-btn {
  border: 1px solid #c8d4e6;
  border-radius: 12px;
  background: #fff;
  padding: 8px;
  display: grid;
  gap: 6px;
  justify-items: center;
  cursor: pointer;
}

.option-label {
  font-weight: 700;
}

.option-preview {
  width: 150px;
  height: 150px;
}

.option-btn.is-selected {
  border-color: #4ecdc4;
  box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
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
  stroke: #4ecdc4;
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

.actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #4ecdc4, #6fe7dd);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #a29bfe, #6c5ce7);
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  margin-top: 10px;
  text-align: center;
  font-weight: 700;
}

.feedback.ok {
  color: #1f7a5c;
}

.feedback.ko {
  color: #b33939;
}

.hint {
  margin: 10px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.94rem;
}

@media (max-width: 860px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .shape-preview,
  .option-preview {
    width: 136px;
    height: 136px;
  }
}
</style>


