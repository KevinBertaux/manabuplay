import { vocabListOptions } from '@/features/vocab/vocabLists';
import { SYMMETRY_SHAPES_STORAGE_KEY } from '@/features/math/symmetryShapeStore';

const APP_PREFIX = 'manabuplay_';
const HISTORY_KEY = 'manabuplay_admin_storage_history_v1';
const HISTORY_LIMIT_KEY = 'manabuplay_admin_storage_history_limit_v1';
const SIDEBAR_COLLAPSED_KEY = 'manabuplay_admin_sidebar_collapsed_v1';

const DEFAULT_HISTORY_LIMIT = 20;
const HISTORY_LIMIT_MIN = 10;
const HISTORY_LIMIT_MAX = 50;
const HISTORY_LIMIT_STEP = 5;

const KNOWN_ENTRY_DEFS = [
  {
    key: 'manabuplay_math_best_streak_v1',
    label: 'Math - meilleure série (multiplications)',
    group: 'math',
    storage: 'local',
  },
  {
    key: 'manabuplay_symmetry_best_streak_v1',
    label: 'Math - meilleure série (symétrie)',
    group: 'math',
    storage: 'local',
  },
  {
    key: 'manabuplay_tts_accent',
    label: 'Langues - accent TTS',
    group: 'vocab',
    storage: 'local',
  },
  {
    key: 'manabuplay_tts_rate',
    label: 'Langues - vitesse TTS',
    group: 'vocab',
    storage: 'local',
  },
  {
    key: 'manabuplay_vocab_card_direction',
    label: 'Langues - sens des cartes',
    group: 'vocab',
    storage: 'local',
  },
  {
    key: SYMMETRY_SHAPES_STORAGE_KEY,
    label: 'Math - formes de symétrie personnalisées',
    group: 'math',
    storage: 'local',
  },
  {
    key: 'manabuplay_admin_rate_limit_v1',
    label: 'Admin - sécurité anti-bruteforce',
    group: 'admin',
    storage: 'local',
  },
  {
    key: 'manabuplay_admin_session_v1',
    label: 'Admin - session active',
    group: 'admin',
    storage: 'session',
  },
  {
    key: SIDEBAR_COLLAPSED_KEY,
    label: 'Admin - état du menu latéral',
    group: 'admin',
    storage: 'local',
  },
  {
    key: HISTORY_KEY,
    label: 'Admin - historique maintenance',
    group: 'admin-system',
    storage: 'local',
    protected: true,
  },
  {
    key: HISTORY_LIMIT_KEY,
    label: "Admin - limite d'historique maintenance",
    group: 'admin-system',
    storage: 'local',
    protected: true,
  },
];

const PRESET_DEFS = [
  { id: 'full', label: 'RAZ complète', groups: ['*'] },
  { id: 'math', label: 'RAZ Math', groups: ['math'] },
  { id: 'vocab', label: 'RAZ Langues', groups: ['vocab'] },
  { id: 'admin', label: 'RAZ Admin', groups: ['admin'] },
  { id: 'streaks', label: 'RAZ meilleures séries', groups: ['streaks'] },
];

function getStorageByType(storageType) {
  if (typeof window === 'undefined') {
    return null;
  }

  if (storageType === 'session') {
    return window.sessionStorage;
  }
  return window.localStorage;
}

function normalizeHistoryLimit(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed)) {
    return DEFAULT_HISTORY_LIMIT;
  }

  const clamped = Math.max(HISTORY_LIMIT_MIN, Math.min(HISTORY_LIMIT_MAX, parsed));
  const offset = clamped - HISTORY_LIMIT_MIN;
  const snapped =
    HISTORY_LIMIT_MIN + Math.round(offset / HISTORY_LIMIT_STEP) * HISTORY_LIMIT_STEP;
  return Math.max(HISTORY_LIMIT_MIN, Math.min(HISTORY_LIMIT_MAX, snapped));
}

function toVocabEntries() {
  return vocabListOptions.map((list) => ({
    key: `${APP_PREFIX}vocab_list_${list.key}`,
    label: `Langues - liste vocab ${list.label}`,
    group: 'vocab',
    storage: 'local',
  }));
}

function buildKnownEntries() {
  return [...KNOWN_ENTRY_DEFS, ...toVocabEntries()];
}

function dedupeEntries(entries) {
  const seen = new Set();
  const unique = [];
  for (const entry of entries) {
    const key = `${entry.storage}:${entry.key}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(entry);
  }
  return unique;
}

function readAllKeys(storageType) {
  const storage = getStorageByType(storageType);
  if (!storage) {
    return [];
  }

  const keys = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key) {
      continue;
    }
    keys.push(key);
  }
  return keys;
}

function readJson(storageType, key, fallback) {
  const storage = getStorageByType(storageType);
  if (!storage) {
    return fallback;
  }
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(storageType, key, value) {
  const storage = getStorageByType(storageType);
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function writeString(storageType, key, value) {
  const storage = getStorageByType(storageType);
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeEntry(entry) {
  const storage = getStorageByType(entry.storage);
  if (!storage) {
    return;
  }
  storage.removeItem(entry.key);
}

function isStreakKey(key) {
  return key === 'manabuplay_math_best_streak_v1' || key === 'manabuplay_symmetry_best_streak_v1';
}

function isProtectedEntry(entry) {
  return Boolean(entry.protected);
}

function resolvePresetFilter(presetId) {
  const preset = PRESET_DEFS.find((item) => item.id === presetId);
  if (!preset) {
    return null;
  }

  return (entry) => {
    if (preset.id === 'streaks') {
      return isStreakKey(entry.key);
    }
    if (preset.groups.includes('*')) {
      return true;
    }
    return preset.groups.includes(entry.group);
  };
}

function readValue(entry) {
  const storage = getStorageByType(entry.storage);
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(entry.key);
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function createHistoryEntry({ actionLabel, affected }) {
  return {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actionLabel,
    createdAt: nowIso(),
    affected,
  };
}

function readHistoryRaw() {
  const history = readJson('local', HISTORY_KEY, []);
  return Array.isArray(history) ? history : [];
}

function writeHistoryRaw(history) {
  const limit = getHistoryLimit();
  const trimmed = history.slice(0, limit);
  writeJson('local', HISTORY_KEY, trimmed);
}

function collectUnknownEntries(knownEntries) {
  const knownKeySet = new Set(knownEntries.map((entry) => `${entry.storage}:${entry.key}`));
  const unknown = [];

  for (const storageType of ['local', 'session']) {
    for (const key of readAllKeys(storageType)) {
      if (!key.startsWith(APP_PREFIX)) {
        continue;
      }
      const composite = `${storageType}:${key}`;
      if (knownKeySet.has(composite)) {
        continue;
      }
      unknown.push({
        key,
        label: `Clé non référencée (${storageType})`,
        group: 'other',
        storage: storageType,
      });
    }
  }

  return unknown;
}

export function getHistoryLimitConfig() {
  return {
    min: HISTORY_LIMIT_MIN,
    max: HISTORY_LIMIT_MAX,
    step: HISTORY_LIMIT_STEP,
    defaultValue: DEFAULT_HISTORY_LIMIT,
  };
}

export function getHistoryLimit() {
  const raw = readJson('local', HISTORY_LIMIT_KEY, DEFAULT_HISTORY_LIMIT);
  return normalizeHistoryLimit(raw);
}

export function setHistoryLimit(value) {
  const normalized = normalizeHistoryLimit(value);
  writeJson('local', HISTORY_LIMIT_KEY, normalized);
  const history = readHistoryRaw();
  if (history.length > normalized) {
    writeHistoryRaw(history);
  }
  return normalized;
}

export function getPresetDefinitions() {
  return PRESET_DEFS.map((preset) => ({ ...preset }));
}

export function getStorageEntries({ includeUnknown = true, includeProtected = true } = {}) {
  const known = buildKnownEntries();
  const entries = includeUnknown ? [...known, ...collectUnknownEntries(known)] : known;
  const filtered = includeProtected ? entries : entries.filter((entry) => !isProtectedEntry(entry));
  return dedupeEntries(filtered);
}

export function getStorageSnapshot() {
  const entries = getStorageEntries({ includeUnknown: true, includeProtected: true });
  return entries.map((entry) => {
    const value = readValue(entry);
    return {
      ...entry,
      exists: value !== null,
      size: value ? value.length : 0,
    };
  });
}

export function getMaintenanceHistory() {
  return readHistoryRaw();
}

export function resolveTargetEntries({ presetId = '', selectedKeys = [], includeSession = false } = {}) {
  const entries = getStorageEntries({ includeUnknown: true, includeProtected: false });
  const byKey = new Map(entries.map((entry) => [`${entry.storage}:${entry.key}`, entry]));

  if (presetId) {
    const predicate = resolvePresetFilter(presetId);
    if (!predicate) {
      return [];
    }
    return entries.filter((entry) => {
      if (!includeSession && entry.storage === 'session') {
        return false;
      }
      return predicate(entry);
    });
  }

  const unique = [];
  const seen = new Set();
  for (const keyRef of selectedKeys) {
    if (seen.has(keyRef)) {
      continue;
    }
    seen.add(keyRef);
    const entry = byKey.get(keyRef);
    if (!entry) {
      continue;
    }
    if (!includeSession && entry.storage === 'session') {
      continue;
    }
    unique.push(entry);
  }
  return unique;
}

export function previewResetAction({ presetId = '', selectedKeys = [], includeSession = false } = {}) {
  const targets = resolveTargetEntries({ presetId, selectedKeys, includeSession });
  const withExistence = targets.map((entry) => ({
    ...entry,
    exists: readValue(entry) !== null,
  }));

  return {
    targets: withExistence,
    existingCount: withExistence.filter((entry) => entry.exists).length,
  };
}

export function executeResetAction({
  actionLabel = 'Maintenance reset',
  presetId = '',
  selectedKeys = [],
  includeSession = false,
} = {}) {
  const targets = resolveTargetEntries({ presetId, selectedKeys, includeSession });
  const affected = [];

  for (const entry of targets) {
    const value = readValue(entry);
    if (value === null) {
      continue;
    }
    affected.push({
      key: entry.key,
      label: entry.label,
      group: entry.group,
      storage: entry.storage,
      value,
    });
  }

  const historyEntry = createHistoryEntry({
    actionLabel,
    affected,
  });

  writeHistoryRaw([historyEntry, ...readHistoryRaw()]);

  for (const entry of targets) {
    removeEntry(entry);
  }

  return {
    removedCount: affected.length,
    targetCount: targets.length,
    historyId: historyEntry.id,
  };
}

export function rollbackResetAction(historyId) {
  if (!historyId) {
    return {
      restoredCount: 0,
      found: false,
    };
  }

  const history = readHistoryRaw();
  const entry = history.find((item) => item.id === historyId);
  if (!entry) {
    return {
      restoredCount: 0,
      found: false,
    };
  }

  let restoredCount = 0;
  for (const item of entry.affected || []) {
    if (writeString(item.storage || 'local', item.key, item.value)) {
      restoredCount += 1;
    }
  }

  return {
    restoredCount,
    found: true,
  };
}

export {
  HISTORY_KEY as ADMIN_STORAGE_HISTORY_KEY,
  HISTORY_LIMIT_KEY as ADMIN_STORAGE_HISTORY_LIMIT_KEY,
  SIDEBAR_COLLAPSED_KEY as ADMIN_SIDEBAR_COLLAPSED_KEY,
};

