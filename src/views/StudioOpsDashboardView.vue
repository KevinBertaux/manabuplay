<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AdminStatusBanner from '@/components/AdminStatusBanner.vue';
import { useSessionCountdown } from '@/composables/useSessionCountdown';
import {
  getEnglishList,
  resetEnglishList,
  saveEnglishList,
  englishListOptions,
} from '@/features/languages/englishLists';
import { buildListPayload } from '@/features/languages/listPayload';
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
import { getAdsPubBacklog, getAdsPubBacklogMeta } from '@/features/admin/adsBacklogStore';
import { getRoadmapEntries, ROADMAP_PRIORITY_ORDER } from '@/features/admin/roadmapStore';

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
    items: [{ id: 'english', icon: '📚', label: 'Anglais' }],
  },
  {
    id: 'admin',
    icon: '🛠️',
    label: 'Administration',
    items: [
      { id: 'overview', icon: '📊', label: "Vue d'ensemble" },
      { id: 'roadmap', icon: '🗺️', label: 'Roadmap & Scopes' },
      { id: 'ads-backlog', icon: '💰', label: 'Pub & CMP' },
      { id: 'maintenance', icon: '🧹', label: 'Maintenance locale' },
      { id: 'admin-help', icon: '📘', label: 'Aide' },
    ],
  },
]);

const sectionTitleMap = Object.freeze({
  overview: 'Dashboard admin',
  roadmap: 'Roadmap & Scopes',
  'ads-backlog': 'Pub & CMP',
  english: 'Édition de listes d’anglais',
  symmetry: 'Formes de symétrie',
  maintenance: 'Maintenance locale',
  'admin-help': 'Documentation du panneau interne',
});

function readSidebarCollapsed() {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY) === '1';
}

const selectedSection = ref('overview');
const sidebarCollapsed = ref(readSidebarCollapsed());
const mobileSidebarOpen = ref(false);
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
  const list = getEnglishList(listKey);
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
  englishListOptions.map((option) => {
    const currentList = getEnglishList(option.key);
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
  const shouldOpen = !sidebarOpen.value[groupId];
  const nextState = Object.keys(sidebarOpen.value).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});

  nextState[groupId] = shouldOpen;
  sidebarOpen.value = {
    ...nextState,
  };
}

function switchSection(sectionId) {
  selectedSection.value = sectionId;
  mobileSidebarOpen.value = false;
  clearStatus();
}

function clearSidebarSearch() {
  sidebarSearchQuery.value = '';
}

function toggleMobileSidebar() {
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
}

function closeMobileSidebar() {
  mobileSidebarOpen.value = false;
}

async function logout() {
  mobileSidebarOpen.value = false;
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
  return buildListPayload(draft.value);
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

  const saved = saveEnglishList(selectedList.value, result.payload);
  if (!saved) {
    setStatus('error', 'Sauvegarde impossible sur cet appareil.');
    return;
  }

  draft.value = createDraft(selectedList.value);
  refreshDashboardMetrics();
  refreshMaintenanceData();
  setStatus('success', 'Liste sauvegardée localement. Le module anglais utilise maintenant cette version.');
}

function resetCurrentList() {
  if (!selectedList.value) {
    setStatus('error', 'Choisir d\'abord une liste à modifier.');
    return;
  }

  resetEnglishList(selectedList.value);
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

  const fileName = `english-${selectedList.value}.json`;
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

const scopePriorityOrder = ROADMAP_PRIORITY_ORDER;
const roadmapEntries = Object.freeze(getRoadmapEntries());
const adsBacklogItems = Object.freeze(getAdsPubBacklog());
const adsBacklogMeta = Object.freeze(getAdsPubBacklogMeta());
const hideDoneAdsBacklog = ref(false);
const selectedRoadmapId = ref(
  roadmapEntries.find((entry) => entry.id === APP_VERSION)?.id || roadmapEntries[0]?.id || ''
);
const visibleAdsBacklogItems = computed(() =>
  hideDoneAdsBacklog.value ? adsBacklogItems.filter((item) => item.status !== 'Fait') : adsBacklogItems
);

function adsStatusClass(status) {
  if (status === 'Fait') {
    return 's-done';
  }
  if (status === 'En cours') {
    return 's-in-progress';
  }
  if (status === 'En attente') {
    return 's-waiting';
  }
  if (status === 'À surveiller') {
    return 's-watch';
  }
  if (status === 'Plus tard') {
    return 's-later';
  }
  return 's-todo';
}

const activeRoadmapEntry = computed(() => {
  return roadmapEntries.find((entry) => entry.id === selectedRoadmapId.value) || roadmapEntries[0] || null;
});

const filterPriority = ref('all');
const filterDone = ref('all');
const filterDomain = ref('all');
const filterFeature = ref('all');
const sortKey1 = ref('priority');
const sortDir1 = ref('asc');
const sortKey2 = ref('done');
const sortDir2 = ref('asc');
const sortKey3 = ref('domain');
const sortDir3 = ref('asc');
const sortKeyOptions = Object.freeze([
  { key: 'priority', label: 'Priorité' },
  { key: 'done', label: 'État' },
  { key: 'domain', label: 'Catégorie' },
  { key: 'feature', label: 'Sous-catégorie' },
  { key: 'label', label: 'Libellé' },
]);

function getSortKeyByLevel(level) {
  if (level === 1) {
    return sortKey1.value;
  }
  if (level === 2) {
    return sortKey2.value;
  }
  return sortKey3.value;
}

function getSortDirByLevel(level) {
  if (level === 1) {
    return sortDir1.value;
  }
  if (level === 2) {
    return sortDir2.value;
  }
  return sortDir3.value;
}

function setSortKeyByLevel(level, key) {
  if (level === 1) {
    sortKey1.value = key;
    return;
  }
  if (level === 2) {
    sortKey2.value = key;
    return;
  }
  sortKey3.value = key;
}

function toggleSortDirByLevel(level) {
  if (level === 1) {
    sortDir1.value = sortDir1.value === 'asc' ? 'desc' : 'asc';
    return;
  }
  if (level === 2) {
    sortDir2.value = sortDir2.value === 'asc' ? 'desc' : 'asc';
    return;
  }
  sortDir3.value = sortDir3.value === 'asc' ? 'desc' : 'asc';
}

const roadmapDomainOptions = computed(() => {
  const items = activeRoadmapEntry.value?.items || [];
  return [...new Set(items.map((item) => item.domain))].sort((a, b) => a.localeCompare(b, 'fr'));
});

const roadmapFeatureOptions = computed(() => {
  const items = activeRoadmapEntry.value?.items || [];
  return [...new Set(items.map((item) => item.feature))].sort((a, b) => a.localeCompare(b, 'fr'));
});

const filteredRoadmapItems = computed(() => {
  const items = activeRoadmapEntry.value?.items || [];
  return items.filter((item) => {
    if (filterPriority.value !== 'all' && item.priority !== filterPriority.value) {
      return false;
    }
    if (filterDone.value === 'done' && !item.done) {
      return false;
    }
    if (filterDone.value === 'todo' && item.done) {
      return false;
    }
    if (filterDomain.value !== 'all' && item.domain !== filterDomain.value) {
      return false;
    }
    if (filterFeature.value !== 'all' && item.feature !== filterFeature.value) {
      return false;
    }
    return true;
  });
});

function valueForSortKey(item, key) {
  if (key === 'priority') {
    return scopePriorityOrder.indexOf(item.priority);
  }
  if (key === 'done') {
    return item.done ? 1 : 0;
  }
  if (key === 'domain') {
    return item.domain;
  }
  if (key === 'feature') {
    return item.feature;
  }
  return item.label;
}

function compareBySortKey(a, b, key, dir) {
  const av = valueForSortKey(a, key);
  const bv = valueForSortKey(b, key);
  let result = 0;

  if (typeof av === 'number' && typeof bv === 'number') {
    result = av - bv;
  } else {
    result = String(av).localeCompare(String(bv), 'fr', { sensitivity: 'base' });
  }

  return dir === 'desc' ? -result : result;
}

const sortedRoadmapItems = computed(() => {
  const list = [...filteredRoadmapItems.value];
  list.sort((a, b) => {
    const tri1 = compareBySortKey(a, b, sortKey1.value, sortDir1.value);
    if (tri1 !== 0) {
      return tri1;
    }

    const tri2 = compareBySortKey(a, b, sortKey2.value, sortDir2.value);
    if (tri2 !== 0) {
      return tri2;
    }

    return compareBySortKey(a, b, sortKey3.value, sortDir3.value);
  });
  return list;
});

const activeScopeDoneCount = computed(() => {
  const items = activeRoadmapEntry.value?.items || [];
  return items.filter((item) => item.done).length;
});
const activeScopeTotalCount = computed(() => activeRoadmapEntry.value?.items?.length || 0);
const activeScopeProgressPercent = computed(() =>
  activeScopeTotalCount.value ? Math.round((activeScopeDoneCount.value / activeScopeTotalCount.value) * 100) : 0
);

const dashboardMetrics = ref({
  englishListCount: 0,
  englishWordCount: 0,
  symmetryShapeCount: 0,
  storageKeyCount: 0,
});

function refreshDashboardMetrics() {
  let englishWordCount = 0;
  for (const option of englishListOptions) {
    const list = getEnglishList(option.key);
    englishWordCount += Array.isArray(list?.words) ? list.words.length : 0;
  }

  const symmetryConfig = getActiveSymmetryShapesConfig();
  const snapshot = getStorageSnapshot();
  dashboardMetrics.value = {
    englishListCount: englishListOptions.length,
    englishWordCount,
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

function formatDateFr(isoString) {
  if (!isoString) {
    return '-';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleDateString('fr-FR');
}

refreshSymmetryDraft();
refreshMaintenanceData();
refreshDashboardMetrics();
</script>

<template>
  <section class="w-full min-h-0 lg:min-h-[calc(100dvh-146px)]">
    <div
      class="admin-dashboard relative grid overflow-hidden border border-[#d4deea] bg-[#f2f6fb] lg:min-h-[calc(100dvh-146px)]"
      :class="{ 'is-collapsed': sidebarCollapsed, 'is-mobile-sidebar-open': mobileSidebarOpen }"
    >
      <button
        class="admin-sidebar-backdrop"
        type="button"
        aria-label="Fermer le panneau latéral"
        @click="closeMobileSidebar"
      />
      <aside id="adminSidebarPanel" class="admin-sidebar">
        <div class="sidebar-head">
          <div class="sidebar-head-main">
            <button class="sidebar-toggle" type="button" @click="toggleSidebar">
              {{ sidebarCollapsed ? '⮞' : '⮜' }}
            </button>
            <span v-if="!sidebarCollapsed" class="sidebar-title">Panneau interne</span>
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

        <button class="btn btn-danger sidebar-logout" type="button" @click="logout">
          <span v-if="!sidebarCollapsed">Déconnexion</span>
          <span v-else>⏻</span>
        </button>

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
              <span v-if="!sidebarCollapsed" class="sidebar-chevron" :class="{ 'is-open': isSidebarGroupOpen(group.id) }">
                ▸
              </span>
            </button>

            <Transition name="sidebar-accordion">
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
            </Transition>
          </section>

          <p v-if="!sidebarCollapsed && !sidebarHasSearchResults" class="sidebar-empty">
            Aucun résultat.
          </p>
        </nav>
      </aside>

      <div class="flex min-w-0 flex-col bg-white">
        <header class="relative z-[5] flex flex-wrap items-start justify-between gap-3 border-b border-[#e0e8f1] bg-white px-3 pt-2.5 pb-2.5 md:px-4 md:pt-3 md:pb-2.5 lg:sticky lg:top-0">
          <div class="min-w-0">
            <h1 class="m-0 text-[1.4rem] leading-[1.2] text-[#132f4c]">{{ activeSectionTitle }}</h1>
            <p class="meta-line">Version {{ APP_VERSION }} - Dernière modification : {{ LAST_UPDATE_FR }}</p>
          </div>
          <button
            class="mobile-sidebar-trigger inline-flex items-center justify-center lg:hidden"
            type="button"
            aria-controls="adminSidebarPanel"
            :aria-expanded="mobileSidebarOpen ? 'true' : 'false'"
            @click="toggleMobileSidebar"
          >
            ☰ Sections
          </button>
        </header>

        <AdminStatusBanner :message="statusMessage" :tone="statusType || 'info'" />

        <section v-if="selectedSection === 'overview'" class="grid gap-3 p-3 md:px-4 md:pt-3 md:pb-4">
          <div class="stat-grid">
            <article class="admin-card">
              <h2>📚 Listes</h2>
              <p class="stat-value">{{ dashboardMetrics.englishListCount }}</p>
            </article>
            <article class="admin-card">
              <h2>🇬🇧 Mots anglais</h2>
              <p class="stat-value">{{ dashboardMetrics.englishWordCount }}</p>
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
        </section>

        <section v-else-if="selectedSection === 'roadmap'" class="grid gap-3 p-3 md:px-4 md:pt-3 md:pb-4">
          <article class="admin-card">
            <div class="scope-head">
              <h2>Roadmap & Scopes</h2>
              <span class="scope-summary-pill">{{ activeScopeDoneCount }}/{{ activeScopeTotalCount }} • {{ activeScopeProgressPercent }}%</span>
            </div>

            <div class="roadmap-toolbar">
              <div>
                <label for="roadmapVersion">Version / vue</label>
                <select id="roadmapVersion" v-model="selectedRoadmapId">
                  <option v-for="entry in roadmapEntries" :key="entry.id" :value="entry.id">
                    {{ entry.title }}
                  </option>
                </select>
              </div>
              <div class="roadmap-meta">
                <span>Début: {{ formatDateFr(activeRoadmapEntry?.startDate) }}</span>
                <span>Fin: {{ formatDateFr(activeRoadmapEntry?.endDate) }}</span>
              </div>
            </div>

            <div class="scope-progress-block">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${activeScopeProgressPercent}%` }" />
              </div>
            </div>

            <div class="roadmap-filters">
              <div>
                <label for="filterPriority">Priorité</label>
                <select id="filterPriority" v-model="filterPriority">
                  <option value="all">Toutes</option>
                  <option v-for="priority in scopePriorityOrder" :key="priority" :value="priority">{{ priority }}</option>
                </select>
              </div>
              <div>
                <label for="filterDone">État</label>
                <select id="filterDone" v-model="filterDone">
                  <option value="all">Tous</option>
                  <option value="todo">⌛</option>
                  <option value="done">✅</option>
                </select>
              </div>
              <div>
                <label for="filterDomain">Catégorie</label>
                <select id="filterDomain" v-model="filterDomain">
                  <option value="all">Toutes</option>
                  <option v-for="domain in roadmapDomainOptions" :key="domain" :value="domain">{{ domain }}</option>
                </select>
              </div>
              <div>
                <label for="filterFeature">Sous-catégorie</label>
                <select id="filterFeature" v-model="filterFeature">
                  <option value="all">Toutes</option>
                  <option v-for="feature in roadmapFeatureOptions" :key="feature" :value="feature">{{ feature }}</option>
                </select>
              </div>
            </div>

            <div class="roadmap-sorts">
              <h3>Tri multi-niveaux</h3>
              <div class="roadmap-sort-stack">
                <div v-for="level in [1, 2, 3]" :key="`sort-${level}`" class="roadmap-sort-row">
                  <span class="roadmap-sort-label">Tri {{ level }}</span>
                  <div class="roadmap-sort-pill-group">
                    <button
                      v-for="option in sortKeyOptions"
                      :key="`sort-${level}-${option.key}`"
                      class="roadmap-sort-pill"
                      :class="{ 'is-active': getSortKeyByLevel(level) === option.key }"
                      type="button"
                      @click="setSortKeyByLevel(level, option.key)"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                  <button
                    class="roadmap-sort-dir-btn"
                    type="button"
                    :aria-label="`Basculer ordre tri ${level}`"
                    @click="toggleSortDirByLevel(level)"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      class="roadmap-sort-dir-icon"
                      :class="{ 'is-desc': getSortDirByLevel(level) === 'desc' }"
                    >
                      <path d="M8 3l3.5 4.5h-7L8 3zM8 13l-3.5-4.5h7L8 13z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="roadmap-table-wrap">
              <table class="roadmap-table">
                <thead>
                  <tr>
                    <th>Priorité</th>
                    <th>État</th>
                    <th>Catégorie</th>
                    <th>Sous-catégorie</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in sortedRoadmapItems" :key="item.id">
                    <td>
                      <span class="priority-chip" :class="`p-${item.priority.toLowerCase()}`">{{ item.priority }}</span>
                    </td>
                    <td>{{ item.done ? '✅' : '⌛' }}</td>
                    <td>{{ item.domain }}</td>
                    <td>{{ item.feature }}</td>
                    <td>{{ item.label }}</td>
                  </tr>
                  <tr v-if="sortedRoadmapItems.length === 0">
                    <td colspan="5" class="meta-line">Aucun item pour ces filtres.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section v-else-if="selectedSection === 'ads-backlog'" class="grid gap-3 p-3 md:px-4 md:pt-3 md:pb-4">
          <article class="admin-card">
            <div class="scope-head">
              <h2>Backlog module pub</h2>
              <span class="scope-summary-pill">{{ adsBacklogMeta.version }}</span>
            </div>

            <div class="roadmap-meta ads-backlog-meta">
              <span>Dernière mise à jour: {{ formatDateFr(adsBacklogMeta.updatedAt) }}</span>
              <span>{{ visibleAdsBacklogItems.length }} / {{ adsBacklogItems.length }} actions visibles</span>
            </div>

            <div class="ads-backlog-toolbar">
              <label class="ads-backlog-toggle">
                <input v-model="hideDoneAdsBacklog" type="checkbox" />
                <span>Masquer les éléments faits</span>
              </label>
            </div>

            <div class="roadmap-table-wrap">
              <table class="roadmap-table ads-backlog-table">
                <thead>
                  <tr>
                    <th>Priorité</th>
                    <th>État</th>
                    <th>Quand</th>
                    <th>Blocage / attente</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in visibleAdsBacklogItems"
                    :key="item.id"
                    :class="{ 'ads-backlog-row-done': item.status === 'Fait' }"
                  >
                    <td>
                      <span class="priority-chip" :class="`p-${item.priority.toLowerCase()}`">{{ item.priority }}</span>
                    </td>
                    <td><span class="status-chip" :class="adsStatusClass(item.status)">{{ item.status }}</span></td>
                    <td>{{ item.timing }}</td>
                    <td>{{ item.blocker }}</td>
                    <td>{{ item.label }}</td>
                  </tr>
                  <tr v-if="visibleAdsBacklogItems.length === 0">
                    <td colspan="5" class="meta-line">Aucun item visible avec ce filtre.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section v-else-if="selectedSection === 'english'" class="grid gap-3 p-3 md:px-4 md:pt-3 md:pb-4">
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

            <p v-else class="empty-state">Choisir une liste pour commencer l'édition.</p>
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

        <section v-else-if="selectedSection === 'symmetry'" class="grid gap-3 p-3 md:px-4 md:pt-3 md:pb-4">
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

        <section v-else-if="selectedSection === 'admin-help'" class="grid gap-3 p-3 md:px-4 md:pt-3 md:pb-4">
          <article class="admin-card internal-help-card">
            <h2>Documentation du panneau interne</h2>
            <p class="meta-line">
              Version: {{ APP_VERSION }} - Dernière modification: {{ LAST_UPDATE_FR }}.
            </p>

            <p>
              Cette aide reste intégrée au dashboard pour éviter de sortir du panneau pendant l’édition.
              Version anglaise:
              <router-link :to="{ name: 'studio-ops-help', query: { lang: 'en' } }">Internal panel documentation</router-link>.
            </p>

            <h3 id="scope">Périmètre</h3>
            <ul>
              <li>Édition locale dans le navigateur (stockage <a href="#glossary-localstorage">localStorage</a>).</li>
              <li>Aucun backend requis pour cette version.</li>
              <li>Export JSON pour versionner les données dans le repo Git.</li>
            </ul>

            <h3 id="security">Accès et sécurité</h3>
            <ul>
              <li>Connexion par identifiant + mot de passe (vérification par hash côté client).</li>
              <li>Blocage niveau 1: 3 essais invalides puis 30 minutes.</li>
              <li>Blocage niveau 2: un nouvel essai invalide après niveau 1 déclenche 24 heures de blocage.</li>
              <li>Session temporaire: expiration automatique par timeout.</li>
            </ul>

            <h3 id="workflow">Workflow recommandé</h3>
            <ol>
              <li>Se connecter au panneau interne.</li>
              <li>Choisir la liste à modifier.</li>
              <li>Éditer les mots (anglais/français), puis sauvegarder localement.</li>
              <li>Vérifier le rendu dans le module Langues.</li>
              <li>Exporter le JSON, puis commit/push dans le repo.</li>
            </ol>

            <h3 id="json-ops">Opérations JSON</h3>
            <ul>
              <li><strong>Copier JSON</strong>: audit rapide ou partage ponctuel.</li>
              <li><strong>Télécharger JSON</strong>: fichier prêt à versionner.</li>
              <li><strong>Importer JSON</strong>: recharge une liste existante dans le panneau.</li>
              <li><strong>Réinitialiser</strong>: revient à la version par défaut du projet.</li>
            </ul>

            <h3 id="limits">Limites connues</h3>
            <ul>
              <li>Protection front-only: ce n’est pas une sécurité serveur forte.</li>
              <li>Les données locales sont liées à l’appareil/navigateur en cours.</li>
              <li>Effacement navigateur peut supprimer les modifications locales.</li>
            </ul>

            <h3 id="troubleshooting">Dépannage</h3>
            <ul>
              <li>Accès bloqué: attendre la fin du compte à rebours affiché.</li>
              <li>Session expirée: se reconnecter.</li>
              <li>Doute sur les données: réinitialiser puis réimporter un JSON de référence.</li>
            </ul>

            <h3 id="glossary">Glossaire</h3>
            <dl>
              <dt id="glossary-localstorage">localStorage</dt>
              <dd>Stockage persistant dans le navigateur, propre à un domaine.</dd>

              <dt id="glossary-hash">Hash (SHA-256)</dt>
              <dd>Empreinte irréversible pour vérifier un mot de passe sans le stocker en clair.</dd>

              <dt id="glossary-timeout">Timeout de session</dt>
              <dd>Durée limite d’une session connectée avant déconnexion automatique.</dd>

              <dt id="glossary-front-only">Front-only security</dt>
              <dd>Protection implémentée uniquement côté navigateur, sans contrôle serveur.</dd>

              <dt id="glossary-json">JSON</dt>
              <dd>Format texte structuré pour stocker et échanger des données.</dd>
            </dl>
          </article>
        </section>

        <section v-else class="grid gap-3 p-3 md:px-4 md:pt-3 md:pb-4">
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

<style scoped src="../styles/admin-dashboard.css"></style>
