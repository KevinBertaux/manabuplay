<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { getVocabList, vocabListOptions } from '@/features/vocab/vocabLists';

const ttsAccentStorageKey = 'manabuplay_tts_accent';
const ttsRateStorageKey = 'manabuplay_tts_rate';
const cardDirectionStorageKey = 'manabuplay_vocab_card_direction';
const legacyTtsAccentStorageKey = 'revision_enfants_tts_accent';
const ttsSupported =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

const ttsRateValues = ['0.85', '1', '1.15'];
const ttsRateLabels = ['0.85x', '1x', '1.15x'];

const selectedList = ref('');
const words = ref([]);
const currentIndex = ref(0);
const isFlipped = ref(false);

const ttsAccent = ref('en-US');
const ttsRate = ref('1');
const cardDirection = ref('en-first');
const ttsVoices = ref([]);
const isSpeaking = ref(false);
const ttsStatus = ref('');

let currentUtterance = null;
let voicesChangedHandler = null;

const touchStartX = ref(0);
const touchStartY = ref(0);
const suppressNextFlip = ref(false);

const activeList = computed(() => (selectedList.value ? getVocabList(selectedList.value) : null));
const vocabListOptionsWithCount = computed(() =>
  vocabListOptions.map((list) => {
    const currentList = getVocabList(list.key);
    return {
      ...list,
      wordCount: Array.isArray(currentList?.words) ? currentList.words.length : list.wordCount || 0,
    };
  })
);

const ttsRateIndex = computed({
  get() {
    const idx = ttsRateValues.indexOf(ttsRate.value);
    return idx >= 0 ? idx : 1;
  },
  set(indexValue) {
    const clamped = Math.max(0, Math.min(2, Number(indexValue) || 0));
    ttsRate.value = ttsRateValues[clamped];
  },
});
const ttsRateLabel = computed(() => ttsRateLabels[ttsRateIndex.value]);

const currentWord = computed(() => words.value[currentIndex.value] || null);
const cardNumber = computed(() => (words.value.length ? currentIndex.value + 1 : 0));
const totalCards = computed(() => words.value.length);
const isFrenchFirst = computed(() => cardDirection.value === 'fr-first');
const frontText = computed(() => {
  if (!currentWord.value) {
    return 'Choisir une liste';
  }
  return isFrenchFirst.value ? currentWord.value.french : currentWord.value.english;
});
const backText = computed(() => {
  if (!currentWord.value) {
    return '';
  }
  return isFrenchFirst.value ? currentWord.value.english : currentWord.value.french;
});
const canPlayTts = computed(
  () => ttsSupported && !!currentWord.value && (!isFrenchFirst.value || isFlipped.value)
);

function cloneWords(sourceWords) {
  return sourceWords.map((word) => ({ ...word }));
}

function loadList(listKey) {
  if (!listKey) {
    stopSpeech();
    words.value = [];
    currentIndex.value = 0;
    isFlipped.value = false;
    return;
  }

  const list = getVocabList(listKey);
  if (!list || !Array.isArray(list.words)) {
    words.value = [];
    currentIndex.value = 0;
    isFlipped.value = false;
    return;
  }

  stopSpeech();
  words.value = cloneWords(list.words);
  currentIndex.value = 0;
  isFlipped.value = false;
}

function showCard(index) {
  if (!words.value.length) {
    currentIndex.value = 0;
    isFlipped.value = false;
    return;
  }

  stopSpeech();
  currentIndex.value = index;
  isFlipped.value = false;
}

function nextCard() {
  if (!words.value.length) {
    return;
  }
  const nextIndex = (currentIndex.value + 1) % words.value.length;
  showCard(nextIndex);
}

function previousCard() {
  if (!words.value.length) {
    return;
  }
  const previousIndex = (currentIndex.value - 1 + words.value.length) % words.value.length;
  showCard(previousIndex);
}

function shuffleCards() {
  if (!words.value.length) {
    return;
  }

  stopSpeech();
  const shuffled = cloneWords(words.value);
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  words.value = shuffled;
  currentIndex.value = 0;
  isFlipped.value = false;
}

function flipCard() {
  if (suppressNextFlip.value) {
    suppressNextFlip.value = false;
    return;
  }
  isFlipped.value = !isFlipped.value;
}

function onTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
}

function onTouchEnd(event) {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;
  const horizontalThreshold = 45;
  const isHorizontalSwipe =
    Math.abs(deltaX) > horizontalThreshold && Math.abs(deltaX) > Math.abs(deltaY);

  if (!isHorizontalSwipe) {
    return;
  }

  suppressNextFlip.value = true;
  if (deltaX < 0) {
    nextCard();
  } else {
    previousCard();
  }
}

function refreshVoices() {
  if (!ttsSupported) {
    ttsVoices.value = [];
    return;
  }
  ttsVoices.value = speechSynthesis.getVoices();
}

function findBestVoice() {
  if (!ttsVoices.value.length) {
    return null;
  }

  const wanted = ttsAccent.value.toLowerCase();
  let voice = ttsVoices.value.find((item) => item.lang && item.lang.toLowerCase() === wanted);
  if (voice) {
    return voice;
  }

  voice = ttsVoices.value.find(
    (item) => item.lang && item.lang.toLowerCase().startsWith(wanted)
  );
  if (voice) {
    return voice;
  }

  return ttsVoices.value.find(
    (item) => item.lang && item.lang.toLowerCase().startsWith('en-')
  );
}

function stopSpeech() {
  if (!ttsSupported) {
    return;
  }
  speechSynthesis.cancel();
  isSpeaking.value = false;
  currentUtterance = null;
  ttsStatus.value = '';
}

function toggleSpeakWord() {
  if (!canPlayTts.value || !currentWord.value) {
    return;
  }

  if (isSpeaking.value) {
    stopSpeech();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(currentWord.value.english);
  utterance.lang = ttsAccent.value;
  utterance.rate = Number(ttsRate.value) || 1;

  const preferredVoice = findBestVoice();
  if (preferredVoice) {
    utterance.voice = preferredVoice;
    utterance.lang = preferredVoice.lang;
  }

  utterance.onstart = () => {
    isSpeaking.value = true;
    ttsStatus.value = '';
  };

  utterance.onend = () => {
    isSpeaking.value = false;
    currentUtterance = null;
    ttsStatus.value = '';
  };

  utterance.onerror = (event) => {
    isSpeaking.value = false;
    currentUtterance = null;

    if (event && (event.error === 'canceled' || event.error === 'interrupted')) {
      ttsStatus.value = '';
      return;
    }

    ttsStatus.value = 'Lecture impossible';
  };

  currentUtterance = utterance;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function handleKeyboardNav(event) {
  const targetTag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '';
  const isTypingField =
    targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select' || event.target?.isContentEditable;
  if (isTypingField) {
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    previousCard();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    nextCard();
  }
}

watch(selectedList, (newList) => {
  loadList(newList);
});

watch(ttsAccent, (accent) => {
  if (accent !== 'en-US' && accent !== 'en-GB') {
    return;
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ttsAccentStorageKey, accent);
  }
});

watch(ttsRate, (rate) => {
  if (!ttsRateValues.includes(rate)) {
    return;
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ttsRateStorageKey, rate);
  }
});

watch(cardDirection, (direction) => {
  if (direction !== 'en-first' && direction !== 'fr-first') {
    return;
  }
  isFlipped.value = false;
  stopSpeech();
  if (typeof window !== 'undefined') {
    localStorage.setItem(cardDirectionStorageKey, direction);
  }
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedAccent =
      localStorage.getItem(ttsAccentStorageKey) || localStorage.getItem(legacyTtsAccentStorageKey);
    if (savedAccent === 'en-US' || savedAccent === 'en-GB') {
      ttsAccent.value = savedAccent;
      localStorage.setItem(ttsAccentStorageKey, savedAccent);
    }

    const savedRate = localStorage.getItem(ttsRateStorageKey);
    if (savedRate && ttsRateValues.includes(savedRate)) {
      ttsRate.value = savedRate;
    }

    const savedDirection = localStorage.getItem(cardDirectionStorageKey);
    if (savedDirection === 'en-first' || savedDirection === 'fr-first') {
      cardDirection.value = savedDirection;
    }
  }

  loadList(selectedList.value);
  window.addEventListener('keydown', handleKeyboardNav);

  if (!ttsSupported) {
    return;
  }

  refreshVoices();
  voicesChangedHandler = () => refreshVoices();
  if (typeof speechSynthesis.addEventListener === 'function') {
    speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
  } else {
    speechSynthesis.onvoiceschanged = voicesChangedHandler;
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardNav);
  stopSpeech();

  if (!ttsSupported || !voicesChangedHandler) {
    return;
  }

  if (typeof speechSynthesis.removeEventListener === 'function') {
    speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
  } else if (speechSynthesis.onvoiceschanged === voicesChangedHandler) {
    speechSynthesis.onvoiceschanged = null;
  }
});
</script>

<template>
  <section class="page-block vocab-page">
    <h1>Vocabulaire anglais</h1>

    <div class="settings-box">
      <div class="setting-field setting-list">
        <label for="vocabListSelect">Choisir une liste :</label>
        <select id="vocabListSelect" v-model="selectedList">
          <option value="" disabled>-- Sélectionner une liste --</option>
          <option v-for="list in vocabListOptionsWithCount" :key="list.key" :value="list.key">
            {{ list.label }} ({{ list.wordCount }} mots)
          </option>
        </select>
      </div>

      <div class="settings-row">
        <div class="setting-field setting-accent">
          <label for="ttsAccentSelect">Accent :</label>
          <select id="ttsAccentSelect" v-model="ttsAccent">
            <option value="en-US">🇺🇸 Américain</option>
            <option value="en-GB">🇬🇧 Britannique</option>
          </select>
        </div>

        <div class="setting-field setting-rate">
          <label for="ttsRateSlider">Vitesse de lecture : {{ ttsRateLabel }}</label>
          <input id="ttsRateSlider" v-model.number="ttsRateIndex" type="range" min="0" max="2" step="1" />
        </div>

        <div class="setting-field setting-direction">
          <label for="cardDirectionSelect">Sens :</label>
          <select id="cardDirectionSelect" v-model="cardDirection">
            <option value="en-first">Anglais -> Français</option>
            <option value="fr-first">Français -> Anglais</option>
          </select>
        </div>
      </div>
    </div>

    <p v-if="activeList?.description" class="list-description">{{ activeList.description }}</p>

    <template v-if="selectedList">
      <div class="flashcard-carousel">
        <button
          class="carousel-arrow"
          type="button"
          aria-label="Carte précédente"
          @click="previousCard"
        >
          ❮
        </button>

        <div
          class="flashcard"
          :class="{ flipped: isFlipped }"
          @click="flipCard"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <div class="flashcard-count">{{ cardNumber }}/{{ totalCards }}</div>

          <div v-if="canPlayTts" class="tts-inline-control">
            <div class="tts-inline-label">Écouter</div>
            <button
              class="tts-inline-btn"
              type="button"
              :aria-label="isSpeaking ? 'Arrêter la lecture' : 'Écouter le mot'"
              @click.stop="toggleSpeakWord"
            >
              {{ isSpeaking ? '⏹️' : '▶️' }}
            </button>
          </div>

          <div class="flashcard-content">
            <div class="flashcard-word">{{ frontText }}</div>
            <div class="flashcard-translation" :style="{ display: isFlipped ? 'block' : 'none' }">
              {{ backText }}
            </div>
          </div>

          <div v-if="!isFlipped && currentWord" class="flashcard-hint">Cliquer pour révéler la traduction</div>
        </div>

        <button class="carousel-arrow" type="button" aria-label="Carte suivante" @click="nextCard">
          ❯
        </button>
      </div>

      <div v-if="ttsStatus" class="tts-status" aria-live="polite">{{ ttsStatus }}</div>

      <div class="vocab-controls">
        <button class="btn btn-secondary" type="button" @click="shuffleCards">🔀 Mélanger</button>
      </div>
    </template>

    <div v-else class="empty-list-state">Choisir une liste pour commencer.</div>
  </section>
</template>

<style scoped>
.vocab-page {
  max-width: 760px;
  margin-inline: auto;
}

.settings-box {
  background: rgba(255, 230, 109, 0.2);
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 18px;
}

.setting-field label {
  display: flex;
  align-items: flex-end;
  margin: 0 0 8px;
  min-height: 2.4em;
  font-weight: 700;
}

.setting-field select,
.setting-field input[type='range'] {
  width: 100%;
}

.setting-field select {
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #9ab0c8;
  background: white;
}

.setting-field select:focus-visible,
.setting-field input[type='range']:focus-visible {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.16);
  outline: none;
}

.setting-list {
  margin-bottom: 12px;
}

.setting-list label {
  display: block;
  min-height: 0;
}

.settings-row {
  display: grid;
  grid-template-columns: minmax(170px, 220px) minmax(170px, 200px) minmax(180px, 1fr);
  gap: 10px;
  align-items: start;
}

.list-description {
  margin: 0 0 14px;
  text-align: center;
  color: #1f3550;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.14), rgba(111, 231, 221, 0.22));
  border: 1px solid rgba(78, 205, 196, 0.45);
  border-radius: 12px;
  padding: 12px 14px;
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

.flashcard-carousel {
  display: grid;
  grid-template-columns: 52px 1fr 52px;
  align-items: center;
  gap: 10px;
}

.carousel-arrow {
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: var(--btn-secondary-grad);
  color: #ffffff;
  font-size: 1.3em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-arrow:hover,
.carousel-arrow:focus-visible {
  filter: brightness(1.05);
}

.flashcard {
  position: relative;
  background: #fff;
  border-radius: 18px;
  min-height: 260px;
  padding: 42px 22px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(36, 48, 65, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.flashcard-count {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 800;
  font-size: 1.02rem;
  color: #25374d;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.65);
}

.flashcard.flipped {
  background: linear-gradient(135deg, #4ecdc4, #6fe7dd);
  color: #113246;
}

.flashcard-content {
  width: 100%;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.flashcard.flipped .flashcard-content {
  gap: 14px;
}

.flashcard-word,
.flashcard-translation {
  font-size: 2.15em;
  line-height: 1.15;
  margin: 0;
  text-align: center;
}

.flashcard-word {
  font-weight: 700;
}

.flashcard-translation {
  font-weight: 600;
}

.flashcard-hint {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  text-align: center;
  font-size: 0.9em;
  opacity: 0.72;
}

.tts-inline-control {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.tts-inline-label {
  font-size: 0.82em;
  font-weight: 700;
  margin-bottom: 6px;
  opacity: 0.88;
}

.tts-inline-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 2px solid rgba(36, 48, 65, 0.2);
  background: #fff;
  color: #243041;
  font-size: 1.15em;
  cursor: pointer;
}

.flashcard.flipped .flashcard-count {
  color: #0f5f5a;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
}

.flashcard.flipped .tts-inline-btn {
  border-color: rgba(15, 95, 90, 0.35);
  color: #0f5f5a;
}

.tts-status {
  min-height: 1.2em;
  text-align: center;
  margin-top: 10px;
  font-weight: 700;
  color: #5d6c80;
}

.vocab-controls {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  background: var(--btn-secondary-grad);
  color: #ffffff;
}

.btn:hover:not(:disabled),
.btn:focus-visible:not(:disabled) {
  filter: brightness(1.05);
}

@media (max-width: 820px) {
  .settings-row {
    grid-template-columns: 1fr;
  }

  .flashcard-carousel {
    grid-template-columns: 44px 1fr 44px;
    gap: 6px;
  }

  .carousel-arrow {
    width: 44px;
    height: 44px;
    font-size: 1.1em;
  }

  .flashcard {
    min-height: 230px;
    padding: 36px 16px;
  }

  .flashcard-word,
  .flashcard-translation {
    font-size: clamp(1.6em, 7.5vw, 2em);
  }

  .tts-inline-control {
    right: 8px;
  }
}
</style>




