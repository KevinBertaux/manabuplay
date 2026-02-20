<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { evaluateAnswer, generateQuestion } from '@/features/math/quizEngine';

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
const nextQuestionTimeoutId = ref(null);
const currentQuestion = ref(null);

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

  if (streak.value > bestStreak.value) {
    bestStreak.value = streak.value;
    saveBestStreak(bestStreak.value);
  }

  nextQuestionTimeoutId.value = setTimeout(() => {
    nextQuestionTimeoutId.value = null;
    nextQuestion();
  }, 2000);
}

function onAnswerKeydown(event) {
  if (event.key === 'Enter' && !event.repeat) {
    checkAnswer();
  }
}

watch(tableSelect, () => {
  nextQuestion();
});

onMounted(() => {
  bestStreak.value = readBestStreak();
});

onUnmounted(() => {
  clearNextQuestionTimeout();
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

    <div class="score-panel">
      <span>Score : {{ score }} / {{ total }}</span>
      <span>🏆 Série : {{ streak }}</span>
      <span>🥇 Meilleure série : {{ bestStreak }}</span>
    </div>

    <div v-if="!tableSelect" class="feedback feedback-incorrect">Sélectionne une table pour commencer.</div>

    <div
      v-if="tableSelect && feedbackMain"
      class="feedback"
      :class="feedbackType === 'correct' ? 'feedback-correct' : 'feedback-incorrect'"
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

    <div class="actions">
      <button class="btn btn-primary" type="button" :disabled="!tableSelect" @click="checkAnswer">Vérifier ✓</button>
      <button class="btn btn-secondary" type="button" :disabled="!tableSelect" @click="nextQuestion">
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
  border: 1px solid #b6c7db;
  background: white;
}

.score-panel {
  display: flex;
  justify-content: center;
  gap: 22px;
  flex-wrap: wrap;
  text-align: center;
  font-size: 1.2em;
  margin-bottom: 14px;
  font-weight: 700;
  padding: 12px;
  border-radius: 12px;
  background: rgba(78, 205, 196, 0.14);
}

.feedback {
  text-align: center;
  font-size: 1.2em;
  font-weight: 700;
  border-radius: 14px;
  margin-bottom: 16px;
  padding: 16px;
}

.feedback-correct {
  background: linear-gradient(135deg, #95e1d3, #a8e6cf);
  color: #243041;
}

.feedback-incorrect {
  background: linear-gradient(135deg, #ff7675, #fab1a0);
  color: white;
}

.feedback-extra {
  margin-top: 6px;
}

.question-box {
  background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
  padding: 34px 22px;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 18px;
  box-shadow: 0 10px 28px rgba(253, 203, 110, 0.28);
}

.question {
  font-size: 2.4em;
  font-weight: 800;
  margin-bottom: 14px;
}

.answer-input {
  font-size: 2em;
  padding: 12px 18px;
  border: 3px solid #ff6b6b;
  border-radius: 14px;
  text-align: center;
  width: 150px;
  font-weight: 700;
}

.answer-input:focus {
  outline: none;
  border-color: #4ecdc4;
}

.actions {
  text-align: center;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin: 4px;
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
