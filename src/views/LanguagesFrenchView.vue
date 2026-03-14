<script setup>
import { computed, ref, watch } from 'vue';
import QuizEmptyState from '@/components/QuizEmptyState.vue';
import QuizSelectField from '@/components/QuizSelectField.vue';
import {
  buildFrenchVerbCards,
  buildFrenchVerbRows,
  createFrenchExercise,
  getFrenchConjugationModule,
  listFrenchVerbOptions,
  isFrenchExerciseAnswerCorrect,
} from '@/features/languages/frenchConjugations';

const moduleData = getFrenchConjugationModule();
const verbOptions = listFrenchVerbOptions();
const selectedVerb = ref(verbOptions[0]?.value || '');
const cards = ref(buildFrenchVerbCards(selectedVerb.value));
const currentIndex = ref(0);
const isFlipped = ref(false);
const exercise = ref(createFrenchExercise(selectedVerb.value));
const userAnswer = ref('');
const answerStatus = ref('');
const answerTone = ref('idle');
const cardDirection = ref('pronoun-first');

const currentCard = computed(() => cards.value[currentIndex.value] || null);
const cardNumber = computed(() => (cards.value.length ? currentIndex.value + 1 : 0));
const totalCards = computed(() => cards.value.length);
const rows = computed(() => buildFrenchVerbRows(selectedVerb.value));
const frontText = computed(() => {
  if (!currentCard.value) {
    return 'Choisir un verbe';
  }
  return cardDirection.value === 'pronoun-first'
    ? currentCard.value.prompt
    : currentCard.value.answer;
});
const backText = computed(() => {
  if (!currentCard.value) {
    return '';
  }
  return cardDirection.value === 'pronoun-first'
    ? currentCard.value.answer
    : currentCard.value.prompt;
});

function resetCards() {
  cards.value = buildFrenchVerbCards(selectedVerb.value);
  currentIndex.value = 0;
  isFlipped.value = false;
}

function refreshExercise() {
  const previousPronounKey = exercise.value?.pronounKey || '';
  exercise.value = createFrenchExercise(selectedVerb.value, Math.random, previousPronounKey);
  userAnswer.value = '';
}

function skipExercise() {
  answerStatus.value = '';
  answerTone.value = 'idle';
  refreshExercise();
}

function nextCard() {
  if (!cards.value.length) {
    return;
  }
  currentIndex.value = (currentIndex.value + 1) % cards.value.length;
  isFlipped.value = false;
}

function previousCard() {
  if (!cards.value.length) {
    return;
  }
  currentIndex.value = (currentIndex.value - 1 + cards.value.length) % cards.value.length;
  isFlipped.value = false;
}

function shuffleCards() {
  const shuffled = [...cards.value];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  cards.value = shuffled;
  currentIndex.value = 0;
  isFlipped.value = false;
}

function submitAnswer() {
  if (!exercise.value) {
    return;
  }

  if (isFrenchExerciseAnswerCorrect(exercise.value, userAnswer.value)) {
    answerTone.value = 'success';
    answerStatus.value = `Correct : ${exercise.value.pronounLabel.toLowerCase()} ${exercise.value.expectedAnswer}`;
    refreshExercise();
    return;
  }

  answerTone.value = 'error';
  answerStatus.value = `Réponse attendue : ${exercise.value.expectedAnswer}`;
}

watch(selectedVerb, () => {
  resetCards();
  answerStatus.value = '';
  answerTone.value = 'idle';
  refreshExercise();
});
</script>

<template>
  <section class="page-block quiz-module french-conjugation-module">
    <h1>Conjugaison française</h1>

    <div class="settings-box">
      <QuizSelectField
        v-model="selectedVerb"
        select-id="frenchVerbSelect"
        label="Choisir un verbe :"
        :options="verbOptions"
      />

      <div class="setting-field">
        <label for="frenchCardDirectionSelect">Sens :</label>
        <select id="frenchCardDirectionSelect" v-model="cardDirection">
          <option value="pronoun-first">Pronom + infinitif -> forme</option>
          <option value="answer-first">Forme -> pronom + infinitif</option>
        </select>
      </div>
    </div>

    <p class="module-description">{{ moduleData.description }}</p>

    <template v-if="selectedVerb">
      <div class="french-layout">
        <section class="french-panel">
          <h2>Tableau du présent</h2>
          <div class="conjugation-table" role="table" aria-label="Tableau de conjugaison du présent">
            <div v-for="row in rows" :key="row.key" class="conjugation-row" role="row">
              <div class="conjugation-label" role="rowheader">{{ row.label }}</div>
              <div class="conjugation-values" role="cell">{{ row.values.join(' • ') }}</div>
            </div>
          </div>
        </section>

        <section class="french-panel">
          <h2>Flashcards</h2>
          <div class="flashcard-carousel">
            <div class="flashcard" :class="{ flipped: isFlipped }" @click="isFlipped = !isFlipped">
              <button class="carousel-rail carousel-rail-left" type="button" aria-label="Carte précédente" @click.stop="previousCard">
                <span aria-hidden="true">❮</span>
              </button>

              <button class="carousel-rail carousel-rail-right" type="button" aria-label="Carte suivante" @click.stop="nextCard">
                <span aria-hidden="true">❯</span>
              </button>

              <div class="flashcard-count">{{ cardNumber }}/{{ totalCards }}</div>
              <div class="flashcard-content">
                <div class="flashcard-word">{{ frontText }}</div>
                <div class="flashcard-translation" :style="{ display: isFlipped ? 'block' : 'none' }">
                  {{ backText }}
                </div>
              </div>
              <div v-if="!isFlipped && currentCard" class="flashcard-hint">Cliquer pour révéler la réponse</div>
            </div>
          </div>

          <div class="french-actions">
            <button class="mp-btn mp-btn-secondary" type="button" @click="shuffleCards">🔀 Mélanger</button>
          </div>
        </section>
      </div>

      <section class="french-panel">
        <h2>Exercice de saisie</h2>
        <div v-if="exercise" class="exercise-card">
          <p class="exercise-prompt">
            <strong>{{ exercise.pronounLabel }}</strong> + <strong>{{ exercise.infinitive }}</strong>
          </p>

          <form class="exercise-form" @submit.prevent="submitAnswer">
            <input
              v-model="userAnswer"
              class="exercise-input"
              type="text"
              autocomplete="off"
              placeholder="Tape la forme conjuguée"
            />
            <button class="mp-btn mp-btn-primary" type="submit">Vérifier</button>
            <button class="mp-btn mp-btn-secondary" type="button" @click="skipExercise">Question suivante</button>
          </form>

          <p v-if="answerStatus" class="exercise-feedback" :class="`is-${answerTone}`">
            {{ answerStatus }}
          </p>
        </div>
      </section>
    </template>

    <QuizEmptyState v-else message="Choisir un verbe pour commencer." />
  </section>
</template>

<style scoped>
.french-conjugation-module {
  display: grid;
  gap: 18px;
}

.settings-box {
  display: grid;
  gap: 14px;
  background: rgba(255, 230, 109, 0.2);
}

.setting-field label {
  display: block;
  margin: 0 0 8px;
  font-weight: 700;
}

.setting-field select {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #9ab0c8;
  background: #fbfdff;
}

.module-description {
  margin: 0;
  text-align: center;
  color: #1f3550;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.14), rgba(111, 231, 221, 0.22));
  border: 1px solid rgba(78, 205, 196, 0.45);
  border-radius: 12px;
  padding: 12px 14px;
}

.french-layout {
  display: grid;
  gap: 18px;
}

.french-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(140, 167, 193, 0.42);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(36, 48, 65, 0.08);
}

.french-panel h2 {
  margin: 0 0 14px;
}

.conjugation-table {
  display: grid;
  gap: 10px;
}

.conjugation-row {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(140, 167, 193, 0.35);
  background: rgba(245, 248, 252, 0.92);
}

.conjugation-label {
  font-weight: 800;
  color: #17304d;
}

.conjugation-values {
  color: #2b4461;
  line-height: 1.5;
}

.flashcard-carousel {
  max-width: 720px;
  margin-inline: auto;
}

.flashcard {
  --rail-width: 32px;
  position: relative;
  background: #fbfdff;
  border-radius: 18px;
  min-height: 240px;
  padding: 42px calc(var(--rail-width) + 28px);
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(36, 48, 65, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.carousel-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--rail-width);
  border: 0;
  margin: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #325574;
  background: rgba(50, 85, 116, 0.1);
  cursor: pointer;
}

.carousel-rail-left {
  left: 0;
  border-right: 1px solid rgba(50, 85, 116, 0.16);
}

.carousel-rail-right {
  right: 0;
  border-left: 1px solid rgba(50, 85, 116, 0.16);
}

.flashcard-count {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 800;
  color: #26415c;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding: 6px 12px;
}

.flashcard-content {
  text-align: center;
}

.flashcard-word {
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 800;
  color: #1f3550;
}

.flashcard-translation {
  margin-top: 16px;
  font-size: clamp(1.6rem, 3vw, 2rem);
  font-weight: 700;
  color: #156f77;
}

.flashcard-hint {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  color: #54708e;
  font-size: 0.95rem;
}

.french-actions {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}

.exercise-card {
  display: grid;
  gap: 14px;
  background: rgba(247, 251, 255, 0.96);
  border: 1px solid rgba(140, 167, 193, 0.35);
  border-radius: 14px;
  padding: 18px;
}

.exercise-prompt {
  margin: 0;
  font-size: 1.15rem;
  text-align: center;
  color: #1f3550;
}

.exercise-form {
  display: grid;
  gap: 10px;
}

.exercise-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #9ab0c8;
  background: #fff;
  font-size: 1rem;
}

.exercise-feedback {
  margin: 0;
  font-weight: 700;
}

.exercise-feedback.is-success {
  color: #0f766e;
}

.exercise-feedback.is-error {
  color: #c2410c;
}

@media (min-width: 980px) {
  .french-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .conjugation-row {
    grid-template-columns: 180px minmax(0, 1fr);
    align-items: center;
  }

  .exercise-form {
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
  }
}
</style>
