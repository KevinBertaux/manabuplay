<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
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
const sessionRemainingMs = ref(getAdminSessionRemainingMs());
let sessionTimerId;

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

function setStatus(type, message) {
  statusType.value = type;
  statusMessage.value = message;
}

function clearStatus() {
  statusType.value = '';
  statusMessage.value = '';
}

function refreshSessionRemaining() {
  sessionRemainingMs.value = getAdminSessionRemainingMs();
}

async function logout() {
  clearAdminSession();
  await router.replace({ name: 'studio-ops-login' });
}

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
    setStatus('error', 'Choisis d\'abord une liste a modifier.');
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
  setStatus('success', 'Liste sauvegardee localement. Le module vocabulaire utilise maintenant cette version.');
}

function resetCurrentList() {
  if (!selectedList.value) {
    setStatus('error', 'Choisis d\'abord une liste a modifier.');
    return;
  }

  resetVocabList(selectedList.value);
  draft.value = createDraft(selectedList.value);
  setStatus('success', 'Liste reinitialisee a la version par defaut.');
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
    setStatus('error', 'Choisis d\'abord une liste a modifier.');
    return;
  }

  const result = buildPayload();
  if (!result.ok) {
    setStatus('error', result.error);
    return;
  }

  if (!navigator.clipboard?.writeText) {
    setStatus('error', 'Copie non supportee par ce navigateur.');
    return;
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(result.payload, null, 2));
    setStatus('success', 'JSON copie dans le presse-papiers.');
  } catch {
    setStatus('error', 'Copie refusee par le navigateur.');
  }
}

function downloadJson() {
  if (!selectedList.value) {
    setStatus('error', 'Choisis d\'abord une liste a modifier.');
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
  setStatus('success', `Fichier ${fileName} telecharge.`);
}

async function importJson(event) {
  if (!selectedList.value) {
    setStatus('error', 'Choisis d\'abord une liste a modifier.');
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

    setStatus('success', 'Fichier JSON importe. Pense a sauvegarder pour l\'activer.');
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

onMounted(() => {
  sessionTimerId = window.setInterval(() => {
    refreshSessionRemaining();
    if (sessionRemainingMs.value <= 0) {
      logout();
    }
  }, 1000);
});

onUnmounted(() => {
  if (sessionTimerId) {
    window.clearInterval(sessionTimerId);
  }
});
</script>

<template>
  <section class="page-block admin-page">
    <div class="admin-header">
      <h1>Edition de listes de vocabulaire</h1>
      <div class="admin-header-actions">
        <button class="btn btn-danger" type="button" @click="logout">Deconnexion</button>
      </div>
    </div>

    <p class="intro">
      V1: edite les listes localement dans ton navigateur, puis exporte en JSON pour versionner dans le repo.
    </p>

    <div class="admin-card">
      <label for="listSelect">Liste a modifier</label>
      <select id="listSelect" v-model="selectedList">
        <option value="">-- Choisir une liste --</option>
        <option v-for="option in vocabListOptions" :key="option.key" :value="option.key">
          {{ option.label }}
        </option>
      </select>

      <template v-if="selectedList">
      <label for="listName">Nom de la liste</label>
      <input id="listName" v-model="draft.name" type="text" />

      <label for="listDescription">Description</label>
      <input id="listDescription" v-model="draft.description" type="text" />
      </template>

      <p v-else class="empty-state">
        Selectionne une liste pour commencer l'edition.
      </p>
    </div>

    <div v-if="selectedList" class="admin-card">
      <div class="table-header">
        <h2>Mots ({{ draft.words.length }})</h2>
        <button class="btn btn-secondary" type="button" @click="addWordAndFocus">+ Ajouter un mot</button>
      </div>

      <div class="words-grid words-grid-head">
        <span>Anglais</span>
        <span>Francais</span>
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
          placeholder="Traduction francaise"
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
          Reinitialiser
        </button>
        <button class="btn btn-secondary" type="button" @click="copyJsonToClipboard">
          Copier JSON
        </button>
        <button class="btn btn-secondary" type="button" @click="downloadJson">
          Telecharger JSON
        </button>
      </div>

      <label for="jsonImport" class="import-label">Importer un JSON</label>
      <input id="jsonImport" type="file" accept="application/json" @change="importJson" />

      <p v-if="statusMessage" :class="['status', statusType === 'error' ? 'status-error' : 'status-success']">
        {{ statusMessage }}
      </p>
    </div>

    <div class="admin-card" v-if="selectedList && previewJson">
      <h2>Apercu JSON</h2>
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
  border: 1px solid #c2d0e1;
  border-radius: 10px;
  padding: 10px;
  background: white;
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

.btn-danger {
  background: linear-gradient(135deg, #ff7675, #e17055);
  color: white;
}

.import-label {
  margin-top: 14px;
}

.status {
  margin: 12px 0 0;
  font-weight: 700;
}

.status-success {
  color: #1f7a5c;
}

.status-error {
  color: #b33939;
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
