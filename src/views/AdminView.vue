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
import {
  ADMIN_SIDEBAR_COLLAPSED_KEY,
  executeResetAction,
  getHistoryLimit,
  getHistoryLimitConfig,
  getMaintenanceHistory,
  getPresetDefinitions,
  getStorageSnapshot,
  previewResetAction,
  rollbackResetAction,
  setHistoryLimit,
} from '@/features/admin/storageMaintenance';
import {
  getActiveSymmetryShapesConfig,
  hasSymmetryShapesOverride,
  resetSymmetryShapesOverride,
  saveSymmetryShapesOverride,
} from '@/features/math/symmetryShapeStore';

const router = useRouter();
const selectedList = ref('');
const statusType = ref('');
const statusMessage = ref('');
const englishInputRefs = ref([]);
const APP_VERSION = '0.5.0-prep';
const LAST_UPDATE_FR = '23 février 2026';
const RESET_CONFIRM_TEXT = 'SUPPRIMER';

const sidebarGroups = Object.freeze([
  {
    id: 'math',
    icon: '🧮',
    label: 'Mathématiques',
    items: [{ id: 'symmetry', icon: '🧩', label: 'Symétrie' }],
  },
  {
    id: 'languages',
    icon: '🗣️',
    label: 'Langues',
    items: [{ id: 'vocab', icon: '📚', label: 'Anglais' }],
  },
  {
    id: 'admin',
    icon: '🛠️',
    label: 'Administration',
    items: [
      { id: 'overview', icon: '📊', label: "Vue d'ensemble" },
      { id: 'maintenance', icon: '🧹', label: 'Maintenance locale' },
    ],
  },
]);

const sectionTitleMap = Object.freeze({
  overview: 'Dashboard admin',
  vocab: 'Édition de listes de vocabulaire',
  symmetry: 'Formes de symétrie',
  maintenance: 'Maintenance locale',
});

function readSidebarCollapsed() {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY) === '1';
}

const selectedSection = ref('overview');
const sidebarCollapsed = ref(readSidebarCollapsed());
const activeSectionTitle = computed(() => sectionTitleMap[selectedSection.value] || 'Dashboard admin');
const sidebarOpen = ref({
  math: false,
  languages: false,
  admin: false,
});
const sidebarSearchQuery = ref('');
const normalizedSidebarSearchQuery = computed(() => sidebarSearchQuery.value.trim().toLowerCase());
const filteredSidebarGroups = computed(() => {
  const query = normalizedSidebarSearchQuery.value;
  if (!query) {
    return sidebarGroups;
  }

  return sidebarGroups
    .map((group) => {
      const groupMatch = group.label.toLowerCase().includes(query);
      const items = groupMatch
        ? group.items
        : group.items.filter((item) => item.label.toLowerCase().includes(query));
      if (items.length === 0) {
        return null;
      }

      return {
        ...group,
        items,
      };
    })
    .filter(Boolean);
});
const sidebarHasSearchResults = computed(() => filteredSidebarGroups.value.length > 0);

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

watch(sidebarCollapsed, (value) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, value ? '1' : '0');
});

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function isSidebarGroupOpen(groupId) {
  if (normalizedSidebarSearchQuery.value) {
    return true;
  }
  return Boolean(sidebarOpen.value[groupId]);
}

function toggleSidebarGroup(groupId) {
  if (sidebarCollapsed.value) {
    return;
  }
  sidebarOpen.value = {
    ...sidebarOpen.value,
    [groupId]: !sidebarOpen.value[groupId],
  };
}

function switchSection(sectionId) {
  selectedSection.value = sectionId;
  clearStatus();
}

function clearSidebarSearch() {
  sidebarSearchQuery.value = '';
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
  refreshDashboardMetrics();
  refreshMaintenanceData();
  setStatus('success', 'Liste sauvegardée localement. Le module vocabulaire utilise maintenant cette version.');
}

function resetCurrentList() {
  if (!selectedList.value) {
    setStatus('error', 'Choisir d\'abord une liste à modifier.');
    return;
  }

  resetVocabList(selectedList.value);
  draft.value = createDraft(selectedList.value);
  refreshDashboardMetrics();
  refreshMaintenanceData();
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

const scopeItems = ref([
  { id: 'crit-cms', priority: 'Crit', label: 'Supprimer les traces CMS legacy', done: true },
  { id: 'crit-legal', priority: 'Crit', label: 'Harmoniser les pages légales et les dates', done: true },
  { id: 'crit-static', priority: 'Crit', label: 'Conserver un mode 100% statique Netlify', done: true },
  { id: 'crit-release-tests', priority: 'Crit', label: 'Validation pré-release complète (test/e2e/build)', done: false },
  { id: 'crit-qa', priority: 'Crit', label: 'QA manuelle finale desktop + mobile', done: false },
  { id: 'crit-merge-main', priority: 'Crit', label: 'Merge vers main + déploiement Netlify', done: false },

  { id: 'high-home', priority: 'High', label: 'Refonte Accueil V1 par sections matières', done: true },
  { id: 'high-sym-v1', priority: 'High', label: 'Symétrie V1 QCM (axes vertical + horizontal)', done: true },
  { id: 'high-sym-open-close', priority: 'High', label: 'Symétrie: enrichissement formes ouvert/fermé', done: true },
  { id: 'high-math-default', priority: 'High', label: 'Multiplications: table 0 + aucune sélection par défaut', done: true },
  { id: 'high-math-feedback', priority: 'High', label: 'Multiplications/Symétrie: feedbacks harmonisés', done: true },
  { id: 'high-toast', priority: 'High', label: 'Système de motivation (toast + jalons)', done: true },
  { id: 'high-tailwind', priority: 'High', label: 'Tailwind v3 intégré (sans refonte brutale)', done: true },
  { id: 'high-bag-core', priority: 'High', label: 'Système de sac réutilisable extrait', done: true },
  { id: 'high-bag-usage', priority: 'High', label: 'Système de sac branché Symétrie + Multiplications', done: true },
  { id: 'high-difficulty', priority: 'High', label: 'Multiplications: difficultés Découverte/Standard/Renforcé/Infini', done: true },
  { id: 'high-difficulty-ui', priority: 'High', label: 'UI de difficulté (boutons segmentés)', done: true },
  { id: 'high-keypad', priority: 'High', label: 'Pavé numérique desktop/tablette', done: true },
  { id: 'high-weather', priority: 'High', label: 'Ajouter la liste anglaise Weather (EN/FR)', done: false },
  { id: 'high-admin-sym', priority: 'High', label: 'Admin: gestion des formes de symétrie', done: false },
  { id: 'high-admin-reset', priority: 'High', label: 'Admin: RAZ locale granulaire + rollback', done: false },
  { id: 'high-admin-dashboard', priority: 'High', label: 'Admin: dashboard avec sidebar repliable', done: false },

  { id: 'med-refactor-ui', priority: 'Med', label: 'Refactor composants quiz partagés', done: true },
  { id: 'med-refactor-flow', priority: 'Med', label: 'Refactor logique quiz (useQuizFlow)', done: true },
  { id: 'med-refactor-admin', priority: 'Med', label: 'Refactor admin (status/session countdown)', done: true },
  { id: 'med-refactor-legal', priority: 'Med', label: 'Refactor layout pages légales', done: true },
  { id: 'med-docs-pass', priority: 'Med', label: 'Passage de cohérence docs final 0.5.0', done: false },

  { id: 'low-copy', priority: 'Low', label: 'Ajustements micro-copy non bloquants', done: false },
  { id: 'low-polish', priority: 'Low', label: 'Polissage visuel léger', done: false },
  { id: 'low-css', priority: 'Low', label: 'Refactor CSS mineur restant', done: false },
  { id: 'low-clean', priority: 'Low', label: 'Nettoyage technique léger', done: false },
]);

const scopeDoneCount = computed(() => scopeItems.value.filter((item) => item.done).length);
const scopeTotalCount = computed(() => scopeItems.value.length);
const scopeProgressPercent = computed(() =>
  scopeTotalCount.value ? Math.round((scopeDoneCount.value / scopeTotalCount.value) * 100) : 0
);
const scopePriorityOrder = Object.freeze(['Crit', 'High', 'Med', 'Low']);
const scopeByPriority = computed(() =>
  scopePriorityOrder.map((priority) => ({
    priority,
    items: scopeItems.value.filter((item) => item.priority === priority),
  }))
);

const dashboardMetrics = ref({
  vocabListCount: 0,
  englishWordCount: 0,
  spanishWordCount: 0,
  symmetryShapeCount: 0,
  storageKeyCount: 0,
});

function refreshDashboardMetrics() {
  let englishWordCount = 0;
  for (const option of vocabListOptions) {
    const list = getVocabList(option.key);
    englishWordCount += Array.isArray(list?.words) ? list.words.length : 0;
  }

  const symmetryConfig = getActiveSymmetryShapesConfig();
  const snapshot = getStorageSnapshot();
  dashboardMetrics.value = {
    vocabListCount: vocabListOptions.length,
    englishWordCount,
    spanishWordCount: 0,
    symmetryShapeCount: Array.isArray(symmetryConfig?.shapes) ? symmetryConfig.shapes.length : 0,
    storageKeyCount: snapshot.filter((entry) => entry.exists).length,
  };
}

function pointsToText(points) {
  return points.map((point) => `${point.x},${point.y}`).join(' | ');
}

function parsePointsText(pointsText, gridSize) {
  const chunks = String(pointsText || '')
    .split('|')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (chunks.length < 3) {
    return { ok: false, error: 'Une forme doit contenir au moins 3 points.', points: [] };
  }

  const points = [];
  for (const chunk of chunks) {
    const [xRaw, yRaw] = chunk.split(',').map((part) => part.trim());
    const x = Number.parseInt(xRaw, 10);
    const y = Number.parseInt(yRaw, 10);
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      return { ok: false, error: `Point invalide "${chunk}"`, points: [] };
    }
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return { ok: false, error: `Point hors grille "${chunk}"`, points: [] };
    }
    points.push({ x, y });
  }

  return { ok: true, points, error: '' };
}

function createSymmetryDraft() {
  const config = getActiveSymmetryShapesConfig();
  return {
    gridSize: config.gridSize,
    axes: [...config.axes],
    shapes: config.shapes.map((shape) => ({
      id: shape.id,
      pointsText: pointsToText(shape.points),
    })),
  };
}

const symmetryDraft = ref(createSymmetryDraft());
const symmetryOverrideActive = ref(hasSymmetryShapesOverride());

function refreshSymmetryDraft() {
  symmetryDraft.value = createSymmetryDraft();
  symmetryOverrideActive.value = hasSymmetryShapesOverride();
}

function addSymmetryShapeRow() {
  const index = symmetryDraft.value.shapes.length + 1;
  symmetryDraft.value.shapes.push({
    id: `shape-${String(index).padStart(2, '0')}`,
    pointsText: '0,1 | 1,2 | 0,3',
  });
}

function removeSymmetryShapeRow(index) {
  symmetryDraft.value.shapes.splice(index, 1);
}

function saveSymmetryShapes() {
  const gridSize = symmetryDraft.value.gridSize;
  const seenIds = new Set();
  const shapes = [];

  for (let i = 0; i < symmetryDraft.value.shapes.length; i += 1) {
    const row = symmetryDraft.value.shapes[i];
    const id = typeof row.id === 'string' ? row.id.trim() : '';
    if (!id) {
      setStatus('error', `Forme ${i + 1}: identifiant manquant.`);
      return;
    }
    if (seenIds.has(id)) {
      setStatus('error', `Forme ${i + 1}: identifiant dupliqué (${id}).`);
      return;
    }
    seenIds.add(id);

    const parsed = parsePointsText(row.pointsText, gridSize);
    if (!parsed.ok) {
      setStatus('error', `Forme ${i + 1}: ${parsed.error}`);
      return;
    }
    shapes.push({ id, points: parsed.points });
  }

  const saved = saveSymmetryShapesOverride({
    version: 'v1',
    gridSize,
    axes: symmetryDraft.value.axes,
    shapes,
  });

  if (!saved) {
    setStatus('error', 'Sauvegarde des formes impossible sur cet appareil.');
    return;
  }

  refreshSymmetryDraft();
  refreshDashboardMetrics();
  refreshMaintenanceData();
  setStatus('success', 'Formes de symétrie sauvegardées localement.');
}

function resetSymmetryShapes() {
  resetSymmetryShapesOverride();
  refreshSymmetryDraft();
  refreshDashboardMetrics();
  refreshMaintenanceData();
  setStatus('success', 'Formes de symétrie réinitialisées à la version par défaut.');
}

const presetOptions = Object.freeze([...getPresetDefinitions(), { id: 'custom', label: 'RAZ ciblée' }]);
const historyLimitConfig = getHistoryLimitConfig();
const historyLimitOptions = Object.freeze(
  Array.from(
    { length: (historyLimitConfig.max - historyLimitConfig.min) / historyLimitConfig.step + 1 },
    (_, index) => historyLimitConfig.min + index * historyLimitConfig.step
  )
);

const historyLimit = ref(getHistoryLimit());
const includeSessionInReset = ref(false);
const selectedPreset = ref('full');
const selectedKeyRefs = ref([]);
const confirmChecked = ref(false);
const confirmText = ref('');
const maintenanceHistory = ref(getMaintenanceHistory());
const storageSnapshot = ref(getStorageSnapshot());

function entryRef(entry) {
  return `${entry.storage}:${entry.key}`;
}

const resettableEntries = computed(() => storageSnapshot.value.filter((entry) => !entry.protected));
const customSelectableEntries = computed(() =>
  resettableEntries.value.filter((entry) => includeSessionInReset.value || entry.storage !== 'session')
);

const resetPreview = computed(() =>
  previewResetAction({
    presetId: selectedPreset.value === 'custom' ? '' : selectedPreset.value,
    selectedKeys: selectedPreset.value === 'custom' ? selectedKeyRefs.value : [],
    includeSession: includeSessionInReset.value,
  })
);

const previewLabels = computed(() =>
  resetPreview.value.targets.map((entry) => `${entry.label} [${entry.storage}]`)
);

const canExecuteReset = computed(() => {
  return (
    resetPreview.value.targets.length > 0 &&
    confirmChecked.value &&
    confirmText.value.trim().toUpperCase() === RESET_CONFIRM_TEXT
  );
});

watch(historyLimit, (value) => {
  historyLimit.value = setHistoryLimit(value);
  maintenanceHistory.value = getMaintenanceHistory();
});

function refreshMaintenanceData() {
  storageSnapshot.value = getStorageSnapshot();
  maintenanceHistory.value = getMaintenanceHistory();
}

function resetConfirmation() {
  confirmChecked.value = false;
  confirmText.value = '';
}

function executeReset() {
  if (!canExecuteReset.value) {
    setStatus('error', 'Confirmation incomplète pour la réinitialisation.');
    return;
  }

  const actionLabel =
    selectedPreset.value === 'custom'
      ? 'RAZ ciblée'
      : presetOptions.find((option) => option.id === selectedPreset.value)?.label || 'RAZ';

  const result = executeResetAction({
    actionLabel,
    presetId: selectedPreset.value === 'custom' ? '' : selectedPreset.value,
    selectedKeys: selectedPreset.value === 'custom' ? selectedKeyRefs.value : [],
    includeSession: includeSessionInReset.value,
  });

  refreshMaintenanceData();
  refreshDashboardMetrics();
  resetConfirmation();

  if (result.removedCount === 0) {
    setStatus('success', 'Aucune donnée à supprimer pour cette sélection.');
    return;
  }

  setStatus('success', `${result.removedCount} valeur(s) supprimée(s). Rollback disponible.`);
}

function rollbackHistory(item) {
  const result = rollbackResetAction(item?.id);
  refreshMaintenanceData();
  refreshDashboardMetrics();
  if (!result.found) {
    setStatus('error', 'Rollback impossible: entrée introuvable.');
    return;
  }
  setStatus('success', `${result.restoredCount} valeur(s) restaurée(s) depuis l'historique.`);
}

function formatDateTimeFr(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleString('fr-FR');
}

refreshSymmetryDraft();
refreshMaintenanceData();
refreshDashboardMetrics();
</script>

<template>
  <section class="page-block admin-page">
    <div class="admin-dashboard" :class="{ 'is-collapsed': sidebarCollapsed }">
      <aside class="admin-sidebar">
        <div class="sidebar-head">
          <div class="sidebar-head-main">
            <button class="sidebar-toggle" type="button" @click="toggleSidebar">
              {{ sidebarCollapsed ? '⮞' : '⮜' }}
            </button>
            <span v-if="!sidebarCollapsed" class="sidebar-title">Panel interne</span>
          </div>
          <button
            class="sidebar-home"
            :class="{ 'is-active': selectedSection === 'overview' }"
            type="button"
            title="Aller à la vue d'ensemble"
            aria-label="Aller à la vue d'ensemble"
            @click="switchSection('overview')"
          >
            🏠
          </button>
        </div>

        <div v-if="!sidebarCollapsed" class="sidebar-search" :class="{ 'has-query': !!sidebarSearchQuery }">
          <span class="sidebar-search-icon" aria-hidden="true">🔎</span>
          <input
            id="adminSidebarSearch"
            v-model.trim="sidebarSearchQuery"
            type="search"
            placeholder="Rechercher une section"
            aria-label="Rechercher une section dans le panneau"
          />
          <button
            v-if="sidebarSearchQuery"
            class="sidebar-search-clear"
            type="button"
            title="Effacer la recherche"
            aria-label="Effacer la recherche"
            @click="clearSidebarSearch"
          >
            ✕
          </button>
        </div>

        <nav class="sidebar-nav">
          <section v-for="group in filteredSidebarGroups" :key="group.id" class="sidebar-group">
            <button
              class="sidebar-group-toggle"
              :class="{ 'is-open': isSidebarGroupOpen(group.id) }"
              type="button"
              @click="toggleSidebarGroup(group.id)"
            >
              <span class="sidebar-group-left">
                <span class="sidebar-icon">{{ group.icon }}</span>
                <span v-if="!sidebarCollapsed" class="sidebar-group-label">{{ group.label }}</span>
              </span>
              <span v-if="!sidebarCollapsed" class="sidebar-chevron">
                {{ isSidebarGroupOpen(group.id) ? '▾' : '▸' }}
              </span>
            </button>

            <div v-if="!sidebarCollapsed && isSidebarGroupOpen(group.id)" class="sidebar-children">
              <button
                v-for="item in group.items"
                :key="item.id"
                class="sidebar-child-link"
                :class="{ 'is-active': selectedSection === item.id }"
                type="button"
                @click="switchSection(item.id)"
              >
                <span class="sidebar-child-icon">{{ item.icon }}</span>
                <span class="sidebar-child-label">{{ item.label }}</span>
              </button>
            </div>
          </section>

          <p v-if="!sidebarCollapsed && !sidebarHasSearchResults" class="sidebar-empty">
            Aucun résultat.
          </p>
        </nav>

        <button class="btn btn-danger" type="button" @click="logout">
          <span v-if="!sidebarCollapsed">Déconnexion</span>
          <span v-else>⏻</span>
        </button>
      </aside>

      <div class="admin-main">
        <header class="admin-header">
          <div>
            <h1>{{ activeSectionTitle }}</h1>
            <p class="meta-line">Version {{ APP_VERSION }} - Dernière modification : {{ LAST_UPDATE_FR }}</p>
          </div>
          <router-link class="intro-link" to="/aide/panel-interne">Documentation du panel interne</router-link>
        </header>

        <AdminStatusBanner :message="statusMessage" :tone="statusType || 'info'" />

        <section v-if="selectedSection === 'overview'" class="admin-section">
          <div class="stat-grid">
            <article class="admin-card">
              <h2>📚 Listes</h2>
              <p class="stat-value">{{ dashboardMetrics.vocabListCount }}</p>
            </article>
            <article class="admin-card">
              <h2>🇬🇧 Mots anglais</h2>
              <p class="stat-value">{{ dashboardMetrics.englishWordCount }}</p>
            </article>
            <article class="admin-card">
              <h2>🇪🇸 Mots espagnol</h2>
              <p class="stat-value">{{ dashboardMetrics.spanishWordCount }}</p>
            </article>
            <article class="admin-card">
              <h2>🧩 Formes symétrie</h2>
              <p class="stat-value">{{ dashboardMetrics.symmetryShapeCount }}</p>
            </article>
            <article class="admin-card">
              <h2>🗄️ Clés stockées</h2>
              <p class="stat-value">{{ dashboardMetrics.storageKeyCount }}</p>
            </article>
          </div>

          <article class="admin-card">
            <div class="scope-head">
              <h2>Scope 0.5.0</h2>
              <span class="scope-chip">{{ scopeDoneCount }} / {{ scopeTotalCount }} - {{ scopeProgressPercent }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${scopeProgressPercent}%` }" />
            </div>

            <section v-for="group in scopeByPriority" :key="group.priority" class="scope-priority-block">
              <h3 class="scope-priority-title">{{ group.priority }}</h3>
              <ul class="scope-list">
                <li v-for="item in group.items" :key="item.id" :class="{ done: item.done }">
                  <span>{{ item.done ? '✅' : '⌛' }}</span>
                  <span>{{ item.label }}</span>
                </li>
              </ul>
            </section>
          </article>
        </section>

        <section v-else-if="selectedSection === 'vocab'" class="admin-section">
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

            <p v-else class="empty-state">Sélectionner une liste pour commencer l'édition.</p>
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
              <button class="btn btn-secondary" type="button" @click="addWordAndFocus">+ Ajouter un mot</button>
            </div>
          </div>

          <div v-if="selectedList" class="admin-card">
            <div class="actions">
              <button class="btn btn-primary" type="button" @click="saveCurrentList">Sauvegarder (local)</button>
              <button class="btn btn-secondary" type="button" @click="resetCurrentList">Réinitialiser</button>
              <button class="btn btn-secondary" type="button" @click="copyJsonToClipboard">Copier JSON</button>
              <button class="btn btn-secondary" type="button" @click="downloadJson">Télécharger JSON</button>
            </div>

            <label for="jsonImport" class="import-label">Importer un JSON</label>
            <input id="jsonImport" type="file" accept="application/json" @change="importJson" />
          </div>

          <div class="admin-card" v-if="selectedList && previewJson">
            <h2>Aperçu JSON</h2>
            <pre>{{ previewJson }}</pre>
          </div>
        </section>

        <section v-else-if="selectedSection === 'symmetry'" class="admin-section">
          <div class="admin-card">
            <div class="scope-head">
              <h2>Formes de symétrie</h2>
              <span class="scope-chip" :class="{ active: symmetryOverrideActive }">
                {{ symmetryOverrideActive ? 'Override local actif' : 'Version par défaut' }}
              </span>
            </div>
            <p class="meta-line">Format: <code>x,y | x,y | x,y</code> - Grille 0 à {{ symmetryDraft.gridSize - 1 }}</p>

            <div class="sym-grid sym-grid-head">
              <span>ID</span>
              <span>Points</span>
              <span>Action</span>
            </div>
            <div v-for="(shape, index) in symmetryDraft.shapes" :key="`shape-${index}`" class="sym-grid">
              <input v-model="shape.id" type="text" placeholder="shape-xx" />
              <input v-model="shape.pointsText" type="text" placeholder="0,1 | 1,2 | 0,3" />
              <button class="btn btn-danger" type="button" @click="removeSymmetryShapeRow(index)">Supprimer</button>
            </div>

            <div class="actions">
              <button class="btn btn-secondary" type="button" @click="addSymmetryShapeRow">+ Ajouter une forme</button>
              <button class="btn btn-primary" type="button" @click="saveSymmetryShapes">Sauvegarder</button>
              <button class="btn btn-secondary" type="button" @click="resetSymmetryShapes">Réinitialiser</button>
            </div>
          </div>
        </section>

        <section v-else class="admin-section">
          <div class="admin-card">
            <h2>Réinitialisation granulaire</h2>
            <div class="maintenance-grid">
              <div>
                <label for="presetSelect">Mode</label>
                <select id="presetSelect" v-model="selectedPreset" @change="resetConfirmation">
                  <option v-for="preset in presetOptions" :key="preset.id" :value="preset.id">{{ preset.label }}</option>
                </select>
              </div>
              <div>
                <label for="historyLimit">Historique (10-50)</label>
                <select id="historyLimit" v-model.number="historyLimit">
                  <option v-for="value in historyLimitOptions" :key="value" :value="value">{{ value }}</option>
                </select>
              </div>
              <label class="maintenance-switch">
                <span>Inclure la session admin</span>
                <input type="checkbox" v-model="includeSessionInReset" />
              </label>
            </div>

            <div v-if="selectedPreset === 'custom'" class="custom-select-box">
              <label v-for="entry in customSelectableEntries" :key="entryRef(entry)" class="storage-item">
                <input :value="entryRef(entry)" v-model="selectedKeyRefs" type="checkbox" @change="resetConfirmation" />
                <span>{{ entry.label }}</span>
                <small>{{ entry.key }} - {{ entry.storage }}</small>
              </label>
            </div>

            <div class="admin-card compact-card">
              <h3>Clés qui seront supprimées</h3>
              <ul class="preview-list">
                <li v-for="label in previewLabels" :key="label">{{ label }}</li>
                <li v-if="previewLabels.length === 0" class="meta-line">Aucune clé sélectionnée.</li>
              </ul>
            </div>

            <div class="confirm-box">
              <label class="confirm-check">
                <input v-model="confirmChecked" type="checkbox" />
                <span>Je confirme cette suppression.</span>
              </label>
              <label for="confirmText">Saisir {{ RESET_CONFIRM_TEXT }} pour exécuter</label>
              <input id="confirmText" v-model="confirmText" type="text" placeholder="SUPPRIMER" />
              <button class="btn btn-danger" type="button" :disabled="!canExecuteReset" @click="executeReset">
                Exécuter la réinitialisation
              </button>
            </div>
          </div>

          <div class="admin-card">
            <h2>Historique maintenance</h2>
            <div class="history-list">
              <article v-for="item in maintenanceHistory" :key="item.id" class="history-item">
                <div>
                  <strong>{{ item.actionLabel }}</strong>
                  <p class="meta-line">{{ formatDateTimeFr(item.createdAt) }} - {{ item.affected?.length || 0 }} clés</p>
                </div>
                <button class="btn btn-secondary" type="button" @click="rollbackHistory(item)">Rollback</button>
              </article>
              <p v-if="maintenanceHistory.length === 0" class="meta-line">Aucune action enregistrée.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin-inline: auto;
}

.admin-dashboard {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.admin-dashboard.is-collapsed {
  grid-template-columns: 88px minmax(0, 1fr);
}

.admin-sidebar {
  border: 1px solid #d9e1ed;
  border-radius: 14px;
  padding: 12px;
  background: linear-gradient(180deg, #f8fbff, #f0f7ff);
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: sticky;
  top: 10px;
  align-self: start;
  max-height: calc(100dvh - 20px);
  overflow: hidden;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sidebar-head-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sidebar-title {
  font-weight: 800;
}

.sidebar-toggle {
  border: 1px solid #9ab0c8;
  border-radius: 10px;
  background: #deefff;
  min-height: 40px;
  min-width: 44px;
  font-weight: 800;
  cursor: pointer;
}

.sidebar-home {
  border: 1px solid #9ab0c8;
  border-radius: 10px;
  background: #f8fcff;
  min-height: 40px;
  min-width: 44px;
  font-size: 1rem;
  cursor: pointer;
}

.sidebar-home:hover,
.sidebar-home:focus-visible {
  background: #e5f2ff;
}

.sidebar-home.is-active {
  border-color: #67a6d7;
  background: #d8ebff;
}

.sidebar-nav {
  display: grid;
  gap: 8px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.sidebar-search {
  position: relative;
}

.sidebar-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.sidebar-search input {
  width: 100%;
  border: 1px solid #9ab0c8;
  border-radius: 10px;
  padding: 9px 12px 9px 30px;
  background: #ffffff;
}

.sidebar-search.has-query input {
  padding-right: 34px;
}

.sidebar-search input:focus-visible {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.16);
  outline: none;
}

.sidebar-search input[type='search']::-webkit-search-cancel-button,
.sidebar-search input[type='search']::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.sidebar-search-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid #c7d4e2;
  border-radius: 8px;
  background: #f8fcff;
  width: 24px;
  height: 24px;
  line-height: 1;
  cursor: pointer;
}

.sidebar-search-clear:hover,
.sidebar-search-clear:focus-visible {
  background: #e7f2ff;
}

.sidebar-empty {
  margin: 4px 0 0;
  color: #4b5f79;
  font-size: 0.92rem;
  font-weight: 600;
}

.sidebar-group {
  display: grid;
  gap: 6px;
}

.sidebar-group-toggle {
  border: 1px solid #bdd2e6;
  border-radius: 12px;
  height: 44px;
  background: #fbfdff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 10px;
  font-weight: 700;
  color: #1a3651;
  cursor: pointer;
  overflow: hidden;
}

.sidebar-group-toggle:hover,
.sidebar-group-toggle:focus-visible {
  background: #e5f2ff;
}

.sidebar-group-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-group-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-icon,
.sidebar-child-icon {
  width: 18px;
  display: inline-flex;
  justify-content: center;
}

.sidebar-chevron {
  font-size: 0.85rem;
}

.sidebar-children {
  border-left: 2px solid #d3e2f0;
  margin-left: 12px;
  padding-left: 8px;
  display: grid;
  gap: 6px;
}

.sidebar-child-link {
  border: 1px solid #c8d9ea;
  border-radius: 10px;
  height: 44px;
  background: #f8fcff;
  display: grid;
  grid-template-columns: 18px 1fr;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  text-align: left;
  color: #1a3651;
  font-weight: 700;
  cursor: pointer;
  min-width: 0;
}

.sidebar-child-link:hover,
.sidebar-child-link:focus-visible {
  background: #e8f3ff;
}

.sidebar-child-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-child-link.is-active {
  border-color: #67a6d7;
  background: #d8ebff;
}

.admin-dashboard.is-collapsed .sidebar-group-toggle {
  justify-content: center;
}

.admin-sidebar > .btn-danger {
  margin-top: auto;
  width: 100%;
}

.admin-dashboard.is-collapsed .sidebar-children {
  display: none;
}

.admin-main {
  min-width: 0;
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

.intro-link {
  text-decoration: underline;
  font-weight: 700;
}

.admin-section {
  display: grid;
  gap: 14px;
}

.admin-card {
  border: 1px solid #d9e1ed;
  border-radius: 14px;
  padding: 14px;
  background: #fbfdff;
}

.compact-card {
  margin-top: 10px;
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

.stat-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.stat-value {
  margin: 8px 0 0;
  font-size: 1.8rem;
  font-weight: 800;
}

.scope-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.scope-chip {
  border: 1px solid #bdd2e6;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.88rem;
  font-weight: 700;
}

.scope-chip.active {
  border-color: #63b089;
  background: #e5f7ec;
}

.progress-track {
  height: 12px;
  border-radius: 999px;
  border: 1px solid #c3d5e6;
  overflow: hidden;
  background: #eef4fa;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #4dc79f, #3aa981);
}

.scope-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.scope-list li {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 8px;
  align-items: baseline;
}

.scope-list li.done {
  color: #1f6a4d;
}

.scope-priority-block + .scope-priority-block {
  margin-top: 10px;
}

.scope-priority-title {
  margin: 0 0 8px;
  font-size: 0.95rem;
  color: #2d4d69;
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

.sym-grid {
  display: grid;
  grid-template-columns: 180px 1fr auto;
  gap: 10px;
  margin-top: 10px;
  align-items: center;
}

.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.maintenance-switch {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  border: 1px solid #9bb9d3;
  border-radius: 12px;
  padding: 10px;
  background: #f3faff;
}

.maintenance-switch input {
  width: auto;
}

.custom-select-box {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.storage-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 10px;
  align-items: start;
  border: 1px solid #d7e4f0;
  border-radius: 10px;
  padding: 8px;
}

.storage-item input[type='checkbox'] {
  width: auto;
  margin-top: 2px;
}

.storage-item small {
  grid-column: 2;
  color: #4b5f79;
}

.preview-list {
  margin: 8px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
}

.confirm-box {
  margin-top: 12px;
  border: 1px solid #efb0b0;
  border-radius: 12px;
  padding: 12px;
  background: #fff8f8;
}

.confirm-check {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px;
}

.confirm-check input {
  width: auto;
}

.history-list {
  display: grid;
  gap: 10px;
}

.history-item {
  border: 1px solid #d4e1ee;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.history-item p {
  margin: 4px 0 0;
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
  .admin-sidebar {
    position: static;
    max-height: none;
  }
  .admin-dashboard,
  .admin-dashboard.is-collapsed {
    grid-template-columns: 1fr;
  }

  .sidebar-nav {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .admin-dashboard.is-collapsed .sidebar-group-toggle {
    justify-content: space-between;
  }

  .admin-dashboard.is-collapsed .sidebar-children {
    display: grid;
  }

  .words-grid {
    grid-template-columns: 1fr;
  }

  .words-grid-head {
    display: none;
  }

  .sym-grid {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
