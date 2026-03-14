<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { createSymmetryQuestionBag, evaluateSymmetryAnswer } from '@/features/math/symmetryEngine';
import { hydrateRemoteSymmetryShapesConfig } from '@/features/math/symmetryShapeStore';
import MotivationToast from '@/components/MotivationToast.vue';
import RemoteContentLoading from '@/components/RemoteContentLoading.vue';
import QuizActions from '@/components/QuizActions.vue';
import QuizFeedbackBanner from '@/components/QuizFeedbackBanner.vue';
import QuizScoreBar from '@/components/QuizScoreBar.vue';
import SymmetryShapePreview from '@/components/SymmetryShapePreview.vue';
import { useQuizFlow } from '@/composables/useQuizFlow';
import {
  buildMotivationToast,
  MOTIVATION_TOAST_DURATION_MS,
  resetMotivationRunState,
} from '@/features/motivation/toastEngine';

const BEST_STREAK_KEY = 'manabuplay_symmetry_best_streak_v1';
const AUTO_NEXT_DELAY_MS = 2000;

const questionBag = ref(createSymmetryQuestionBag());
const selectedOptionId = ref('');
const toastMessage = ref('');
const toastTone = ref('streak');
const toastTimeoutId = ref(null);
const isReady = ref(false);
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
  applyAttempt,
  scheduleAutoNext,
  clearAutoNextTimeout,
} = useQuizFlow({
  bestStreakKey: BEST_STREAK_KEY,
  autoNextDelayMs: AUTO_NEXT_DELAY_MS,
});

const optionLabels = ['1', '2', '3', '4'];
const axisLabel = computed(() =>
  currentQuestion.value?.axis === 'horizontal' ? 'horizontal' : 'vertical'
);

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

function loadNextQuestion() {
  nextQuestion({
    isReady: () => true,
    buildQuestion: () => questionBag.value.next(),
  });
  selectedOptionId.value = '';
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
  setFeedback({
    type: result.isCorrect ? 'correct' : 'incorrect',
    main: '',
    extra: '',
  });

  if (!result.isValid) {
    setFeedback({
      type: 'incorrect',
      main: '⚠️ Choisir une réponse avant de vérifier.',
      extra: '',
    });
    return;
  }

  setChecked(true);
  const { bestStreakBefore } = applyAttempt(result.isCorrect);

  if (result.isCorrect) {
    const motivation = buildMotivationToast({
      streak: streak.value,
      bestStreakBefore,
      state: motivationState.value,
    });
    motivationState.value = motivation.state;
    showMotivationToast(motivation.toast);

    setFeedback({
      type: 'correct',
      main: 'Bonne réponse.',
      extra: '',
    });
    scheduleAutoNext(() => {
      loadNextQuestion();
    });
    return;
  }

  const correctIndex = currentQuestion.value.options.findIndex(
    (option) => option.id === currentQuestion.value.correctOptionId
  );
  const correctLabel = correctIndex >= 0 ? optionLabels[correctIndex] : '?';
  setFeedback({
    type: 'incorrect',
    main: '❌ Mauvaise réponse.',
    extra: `Bonne réponse : ${correctLabel}. Axe : ${axisLabel.value}.`,
  });
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
      loadNextQuestion();
    } else {
      checkAnswer();
    }
  }
}

onMounted(async () => {
  const remoteResult = await hydrateRemoteSymmetryShapesConfig();
  if (remoteResult.updated > 0) {
    questionBag.value = createSymmetryQuestionBag();
  }
  loadNextQuestion();
  isReady.value = true;
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  clearAutoNextTimeout();
  clearToastTimeout();
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <section class="page-block quiz-module symmetry-page">
    <h1>Math - Symétrie</h1>

    <RemoteContentLoading
      v-if="!isReady || !currentQuestion"
      title="Préparation de la session"
      message="Chargement des formes de symétrie…"
    />

    <template v-else>
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
      <SymmetryShapePreview
        class="shape-preview h-[120px] w-[120px] md:h-[150px] md:w-[150px]"
        :points="currentQuestion.baseShape"
        :axis="currentQuestion.axis"
        :render-mode="currentQuestion.renderMode"
        :grid-size="currentQuestion.gridSize"
        :transform-for-axis="false"
      />
    </div>

    <div class="mx-auto grid w-full max-w-[720px] grid-cols-1 gap-2 md:grid-cols-2">
      <button
        v-for="(option, idx) in currentQuestion.options"
        :key="option.id"
        class="option-btn"
        :class="optionStateClass(option)"
        type="button"
        @click="selectOption(option.id)"
      >
        <span class="option-label">{{ optionLabels[idx] }}</span>
        <SymmetryShapePreview
          class="option-preview h-[120px] w-[120px] md:h-[150px] md:w-[150px]"
          :points="option.points"
          :axis="currentQuestion.axis"
          :render-mode="currentQuestion.renderMode"
          :grid-size="currentQuestion.gridSize"
          :transform-for-axis="false"
        />
      </button>
    </div>

    <QuizActions :can-check="canCheck" @check="checkAnswer" @next="loadNextQuestion" />

    <p class="hint">Raccourcis clavier: 1, 2, 3, 4 pour choisir une option, Entrée pour vérifier/suivant.</p>
    </template>
  </section>
</template>

<style scoped>
.symmetry-page :deep(.mp-actions) {
  margin-top: 18px;
}

.prompt-box {
  max-width: 720px;
  margin: 0 auto 8px;
  text-align: center;
}

.prompt-box p {
  margin: 0 0 6px;
  font-weight: 700;
}

.shape-preview {
  display: block;
  margin-inline: auto;
  border-radius: 12px;
  border: 1px solid #c6d5e8;
  background: #fbfdff;
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
  transform: translateY(-2px);
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

.option-btn.is-selected {
  border-color: #155e75;
  background: #f1fbfb;
  box-shadow:
    0 0 0 2px rgba(21, 94, 117, 0.22),
    0 10px 18px rgba(15, 23, 42, 0.14);
  transform: translateY(-1px);
}

.option-btn.is-correct {
  border-color: #2fa36b;
  background: #f0fff7;
}

.option-btn.is-incorrect {
  border-color: #d95f5f;
  background: #fff3f3;
}

.hint {
  margin: 6px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.88rem;
}

</style>
