import fruits from '@/content/vocab/en/fruits.json';
import legumes from '@/content/vocab/en/legumes.json';

const STORAGE_PREFIX = 'manabuplay_vocab_list_';
const LEGACY_STORAGE_PREFIX = 'revision_enfants_vocab_list_';

const baseVocabLists = {
  fruits: {
    key: 'fruits',
    label: '🍎 Fruits',
    name: fruits.name,
    description: fruits.description,
    words: fruits.words,
  },
  legumes: {
    key: 'legumes',
    label: '🥕 Légumes',
    name: legumes.name,
    description: legumes.description,
    words: legumes.words,
  },
};

export const vocabLists = baseVocabLists;

export const vocabListOptions = Object.values(baseVocabLists).map((list) => ({
  key: list.key,
  label: list.label,
}));

function cloneWords(words) {
  if (!Array.isArray(words)) {
    return [];
  }
  return words.map((word) => ({
    english: typeof word.english === 'string' ? word.english : '',
    french: typeof word.french === 'string' ? word.french : '',
  }));
}

function sanitizeListPayload(payload, fallbackList) {
  const fallback = fallbackList || { name: '', description: '', words: [] };
  const name =
    payload && typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim()
      : fallback.name;
  const description =
    payload && typeof payload.description === 'string'
      ? payload.description.trim()
      : fallback.description;
  const words = cloneWords(payload?.words);

  return {
    name,
    description,
    words,
  };
}

function getStorageKey(listKey) {
  return `${STORAGE_PREFIX}${listKey}`;
}

function getLegacyStorageKey(listKey) {
  return `${LEGACY_STORAGE_PREFIX}${listKey}`;
}

export function getVocabList(listKey) {
  const baseList = baseVocabLists[listKey];
  if (!baseList) {
    return null;
  }

  if (typeof window === 'undefined') {
    return sanitizeListPayload(baseList, baseList);
  }

  const currentRaw = localStorage.getItem(getStorageKey(listKey));
  const legacyRaw = localStorage.getItem(getLegacyStorageKey(listKey));
  const raw = currentRaw || legacyRaw;
  if (!raw) {
    return sanitizeListPayload(baseList, baseList);
  }

  try {
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeListPayload(parsed, baseList);

    if (!currentRaw && legacyRaw) {
      try {
        localStorage.setItem(getStorageKey(listKey), JSON.stringify(sanitized));
      } catch {
        // Ignore migration write failures and keep serving legacy payload.
      }
    }

    return sanitized;
  } catch {
    return sanitizeListPayload(baseList, baseList);
  }
}

export function saveVocabList(listKey, payload) {
  const baseList = baseVocabLists[listKey];
  if (!baseList || typeof window === 'undefined') {
    return false;
  }

  const sanitized = sanitizeListPayload(payload, baseList);
  try {
    localStorage.setItem(getStorageKey(listKey), JSON.stringify(sanitized));
    return true;
  } catch {
    return false;
  }
}

export function resetVocabList(listKey) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(getStorageKey(listKey));
  localStorage.removeItem(getLegacyStorageKey(listKey));
}
