<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AdminStatusBanner from '@/components/AdminStatusBanner.vue';
import { useSessionCountdown } from '@/composables/useSessionCountdown';
import {
  getVocabList,
  resetVocabList,
  saveVocabList,
  vocabListOptions,
} from '@/features/vocab/vocabLists';
import { buildVocabPayload } from '@/features/vocab/adminPayload';
import { clearAdminSession, getAdminSessionRemainingMs } from '@/features/admin/auth';

const router = useRouter();
const selectedList = ref('');
const statusType = ref('');
const statusMessage = ref('');
const englishInputRefs = ref([]);
const APP_VERSION = '0.5.0-prep';
const LAST_UPDATE_FR = '22 février 2026';

function emptyWord() {
  return { english: '', french: '' };
}

function createEmptyDraft() {
  return {
    name: '',
    description: '',
    words: [],
  };
}

function createDraft(listKey) {
  const list = getVocabList(listKey);
  if (!list) {
    return createEmptyDraft();
  }

  return {
    name: list.name || '',
    description: list.description || '',
    words:
      Array.isArray(list.words) && list.words.length > 0
        ? list.words.map((word) => ({
            english: word.english || '',
            french: word.french || '',
          }))
        : [emptyWord()],
  };
}

const draft = ref(createDraft(selectedList.value));

const adminListOptionsWithCount = computed(() =>
  vocabListOptions.map((option) => {
    const currentList = getVocabList(option.key);
    return {
      ...option,
      wordCount: Array.isArray(currentList?.words) ? currentList.words.length : option.wordCount || 0,
    };
  })
);
function setStatus(type, message) {
  statusType.value = type;
  statusMessage.value = message;
}

function clearStatus() {
  statusType.value = '';
  statusMessage.value = '';
}

async function logout() {
  clearAdminSession();
  await router.replace({ name: 'studio-ops-login' });
}

useSessionCountdown({
  getRemainingMs: getAdminSessionRemainingMs,
  onExpire: () => {
    logout();
  },
});

watch(selectedList, (newList) => {
  englishInputRefs.value = [];
  if (!newList) {
    draft.value = createEmptyDraft();
    clearStatus();
    return;
  }
  draft.value = createDraft(newList);
  clearStatus();
});

async function addWordAndFocus() {
  if (!selectedList.value) {
    return;
  }

  draft.value.words.push(emptyWord());
  await nextTick();

  const newIndex = draft.value.words.length - 1;
  const input = englishInputRefs.value[newIndex];
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function setEnglishInputRef(el, index) {
  if (!el) {
    return;
  }
  englishInputRefs.value[index] = el;
}

function removeWord(index) {
  draft.value.words.splice(index, 1);
}

function buildPayload() {
  return buildVocabPayload(draft.value);
}

function saveCurrentList() {
  if (!selectedList.value) {
    setStatus('error', 'Choisir d\'abord une liste à modifier.');
    return;
  }

  const result = buildPayload();
  if (!result.ok) {
    setStatus('error', result.error);
    return;
  }

  const saved = saveVocabList(selectedList.value, result.payload);
  if (!saved) {
    setStatus('error', 'Sauvegarde impossible sur cet appareil.');
    return;
  }

  draft.value = createDraft(selectedList.value);
  setStatus('success', 'Liste sauvegardée localement. Le module vocabulaire utilise maintenant cette version.');
}

function resetCurrentList() {
  if (!selectedList.value) {
    setStatus('error', 'Choisir d\'abord une liste à modifier.');
    return;
  }

  resetVocabList(selectedList.value);
  draft.value = createDraft(selectedList.value);
  setStatus('success', 'Liste réinitialisée à la version par défaut.');
}

const previewJson = ref('');
watch(
  draft,
  () => {
    const result = buildPayload();
    previewJson.value = result.ok ? JSON.stringify(result.payload, null, 2) : '';
  },
  { deep: true, immediate: true }
);

async function copyJsonToClipboard() {
  if (!selectedList.value) {
    setStatus('error', 'Choisir d\'abord une liste à modifier.');
    return;
  }

  const result = buildPayload();
  if (!result.ok) {
    setStatus('error', result.error);
    return;
  }

  if (!navigator.clipboard?.writeText) {
    setStatus('error', 'Copie non supportée par ce navigateur.');
    return;
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(result.payload, null, 2));
    setStatus('success', 'JSON copié dans le presse-papiers.');
  } catch {
    setStatus('error', 'Copie refusée par le navigateur.');
  }
}

function downloadJson() {
  if (!selectedList.value) {
    setStatus('error', 'Choisir d\'abord une liste à modifier.');
    return;
  }

  const result = buildPayload();
  if (!result.ok) {
    setStatus('error', result.error);
    return;
  }

  const fileName = `vocab-${selectedList.value}.json`;
  const blob = new Blob([JSON.stringify(result.payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
  setStatus('success', `Fichier ${fileName} téléchargé.`);
}

async function importJson(event) {
  if (!selectedList.value) {
    setStatus('error', 'Choisir d\'abord une liste à modifier.');
    event.target.value = '';
    return;
  }

  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.words)) {
      setStatus('error', 'Format JSON invalide: words[] manquant.');
      return;
    }

    draft.value = {
      name: typeof parsed.name === 'string' ? parsed.name : draft.value.name,
      description: typeof parsed.description === 'string' ? parsed.description : '',
      words:
        parsed.words.length > 0
          ? parsed.words.map((word) => ({
              english: typeof word.english === 'string' ? word.english : '',
              french: typeof word.french === 'string' ? word.french : '',
            }))
          : [emptyWord()],
    };

    setStatus('success', 'Fichier JSON importé. Pense à sauvegarder pour l\'activer.');
  } catch {
    setStatus('error', 'Import impossible: fichier JSON invalide.');
  } finally {
    event.target.value = '';
  }
}

function onFrenchInputEnter(index) {
  if (index !== draft.value.words.length - 1) {
    return;
  }
  addWordAndFocus();
}
</script>

<template>
  <section class="page-block admin-page">
    <div class="admin-header">
      <h1>Édition de listes de vocabulaire</h1>
      <div class="admin-header-actions">
        <button class="btn btn-danger" type="button" @click="logout">Déconnexion</button>
      </div>
    </div>

    <p class="intro">
      <router-link class="intro-link" to="/aide/panel-interne">Documentation du panel interne</router-link>
    </p>
    <p class="meta-line">Version {{ APP_VERSION }} - Dernière modification : {{ LAST_UPDATE_FR }}</p>

    <div class="admin-card">
      <label for="listSelect">Liste à modifier</label>
      <select id="listSelect" v-model="selectedList">
        <option value="">-- Choisir une liste --</option>
        <option v-for="option in adminListOptionsWithCount" :key="option.key" :value="option.key">
          {{ option.label }} ({{ option.wordCount }} mots)
        </option>
      </select>

      <template v-if="selectedList">
      <label for="listName">Nom de la liste</label>
      <input id="listName" v-model="draft.name" type="text" />

      <label for="listDescription">Description</label>
      <input id="listDescription" v-model="draft.description" type="text" />
      </template>

      <p v-else class="empty-state">
        Sélectionner une liste pour commencer l'édition.
      </p>
    </div>

    <div v-if="selectedList" class="admin-card">
      <div class="table-header">
        <h2>Mots ({{ draft.words.length }})</h2>
        <button class="btn btn-secondary" type="button" @click="addWordAndFocus">+ Ajouter un mot</button>
      </div>

      <div class="words-grid words-grid-head">
        <span>Anglais</span>
        <span>Français</span>
        <span>Action</span>
      </div>

      <div v-for="(word, index) in draft.words" :key="`word-${index}`" class="words-grid">
        <input
          :ref="(el) => setEnglishInputRef(el, index)"
          v-model="word.english"
          type="text"
          placeholder="English word"
        />
        <input
          v-model="word.french"
          type="text"
          placeholder="Traduction française"
          @keydown.enter.prevent="onFrenchInputEnter(index)"
        />
        <button class="btn btn-danger" type="button" @click="removeWord(index)">Supprimer</button>
      </div>

      <div class="add-row-sticky">
        <button class="btn btn-secondary" type="button" @click="addWordAndFocus">
          + Ajouter un mot
        </button>
      </div>
    </div>

    <div v-if="selectedList" class="admin-card">
      <div class="actions">
        <button class="btn btn-primary" type="button" @click="saveCurrentList">
          Sauvegarder (local)
        </button>
        <button class="btn btn-secondary" type="button" @click="resetCurrentList">
          Réinitialiser
        </button>
        <button class="btn btn-secondary" type="button" @click="copyJsonToClipboard">
          Copier JSON
        </button>
        <button class="btn btn-secondary" type="button" @click="downloadJson">
          Télécharger JSON
        </button>
      </div>

      <label for="jsonImport" class="import-label">Importer un JSON</label>
      <input id="jsonImport" type="file" accept="application/json" @change="importJson" />

      <AdminStatusBanner :message="statusMessage" :tone="statusType || 'info'" />
    </div>

    <div class="admin-card" v-if="selectedList && previewJson">
      <h2>Aperçu JSON</h2>
      <pre>{{ previewJson }}</pre>
    </div>
  </section>
</template>

<style scoped>
.admin-page {
  max-width: 980px;
  margin-inline: auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-header h1 {
  margin: 0;
}

.admin-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.intro {
  margin-top: 10px;
}

.intro-link {
  text-decoration: underline;
  font-weight: 700;
}

.admin-card {
  margin-top: 14px;
  border: 1px solid #d9e1ed;
  border-radius: 14px;
  padding: 14px;
  background: #fbfdff;
}

.admin-card label {
  display: block;
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: 700;
}

.admin-card input,
.admin-card select {
  width: 100%;
  border: 1px solid #9ab0c8;
  border-radius: 10px;
  padding: 10px;
  background: white;
}

.admin-card input:focus-visible,
.admin-card select:focus-visible {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.16);
  outline: none;
}

.empty-state {
  margin: 10px 0 0;
  color: #4b5f79;
  font-weight: 600;
}

.table-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.table-header h2 {
  margin: 0;
}

.words-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  margin-bottom: 10px;
}

.words-grid-head {
  font-weight: 700;
  color: #4b5f79;
}

.add-row-sticky {
  position: sticky;
  bottom: 12px;
  margin-top: 12px;
  background: transparent;
  display: flex;
  justify-content: flex-end;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 0 rgba(15, 23, 42, 0.14);
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease,
    border-color 0.18s ease;
}

.btn-primary {
  background: var(--btn-primary-grad);
  color: var(--ink-inverse);
}

.btn-secondary {
  background: var(--btn-secondary-grad);
  color: var(--ink-inverse);
}

.btn-danger {
  background: var(--btn-danger-grad);
  color: var(--ink-inverse);
}

.btn:hover:not(:disabled),
.btn:focus-visible:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05) saturate(1.03);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 0 rgba(15, 23, 42, 0.16);
}

.btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
  box-shadow: none;
}

.import-label {
  margin-top: 14px;
}

pre {
  margin: 0;
  overflow-x: auto;
  background: #1e2633;
  color: #d9e1ed;
  border-radius: 10px;
  padding: 12px;
}

@media (max-width: 860px) {
  .words-grid {
    grid-template-columns: 1fr;
  }

  .words-grid-head {
    display: none;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>












