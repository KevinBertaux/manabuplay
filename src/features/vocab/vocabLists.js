import identiteEcole from '@/content/vocab/en/identite-ecole.json';
import salutationsPolitesse from '@/content/vocab/en/salutations-politesse.json';
import etatsRessentis from '@/content/vocab/en/etats-ressentis.json';
import tempsSemaine from '@/content/vocab/en/temps-semaine.json';
import consignesClasse from '@/content/vocab/en/consignes-classe.json';
import reglesClasse from '@/content/vocab/en/regles-classe.json';
import materielScolaire from '@/content/vocab/en/materiel-scolaire.json';
import activitesCapacites from '@/content/vocab/en/activites-capacites.json';
import fetesSymboles from '@/content/vocab/en/fetes-symboles.json';
import thanksgiving from '@/content/vocab/en/thanksgiving.json';
import paysNationalites from '@/content/vocab/en/pays-nationalites.json';
import prepositionsLieu from '@/content/vocab/en/prepositions-lieu.json';
import villePersonnes from '@/content/vocab/en/ville-personnes.json';
import maisonVetements from '@/content/vocab/en/maison-vetements.json';
import animauxObjets from '@/content/vocab/en/animaux-objets.json';
import alimentsBoissons from '@/content/vocab/en/aliments-boissons.json';
import fruits from '@/content/vocab/en/fruits.json';
import legumes from '@/content/vocab/en/legumes.json';
import fruits2 from '@/content/vocab/en/fruits-2.json';
import legumes2 from '@/content/vocab/en/legumes-2.json';
import meteo from '@/content/vocab/en/meteo.json';

const STORAGE_PREFIX = 'manabuplay_vocab_list_';
const REMOTE_TIMEOUT_MS = 3500;
const DEFAULT_REMOTE_LANG = 'en';

const baseVocabLists = {
  identiteEcole: {
    key: 'identiteEcole',
    label: identiteEcole.label || identiteEcole.name,
    name: identiteEcole.name,
    description: identiteEcole.description,
    words: identiteEcole.words,
  },
  salutationsPolitesse: {
    key: 'salutationsPolitesse',
    label: salutationsPolitesse.label || salutationsPolitesse.name,
    name: salutationsPolitesse.name,
    description: salutationsPolitesse.description,
    words: salutationsPolitesse.words,
  },
  etatsRessentis: {
    key: 'etatsRessentis',
    label: etatsRessentis.label || etatsRessentis.name,
    name: etatsRessentis.name,
    description: etatsRessentis.description,
    words: etatsRessentis.words,
  },
  tempsSemaine: {
    key: 'tempsSemaine',
    label: tempsSemaine.label || tempsSemaine.name,
    name: tempsSemaine.name,
    description: tempsSemaine.description,
    words: tempsSemaine.words,
  },
  consignesClasse: {
    key: 'consignesClasse',
    label: consignesClasse.label || consignesClasse.name,
    name: consignesClasse.name,
    description: consignesClasse.description,
    words: consignesClasse.words,
  },
  reglesClasse: {
    key: 'reglesClasse',
    label: reglesClasse.label || reglesClasse.name,
    name: reglesClasse.name,
    description: reglesClasse.description,
    words: reglesClasse.words,
  },
  materielScolaire: {
    key: 'materielScolaire',
    label: materielScolaire.label || materielScolaire.name,
    name: materielScolaire.name,
    description: materielScolaire.description,
    words: materielScolaire.words,
  },
  activitesCapacites: {
    key: 'activitesCapacites',
    label: activitesCapacites.label || activitesCapacites.name,
    name: activitesCapacites.name,
    description: activitesCapacites.description,
    words: activitesCapacites.words,
  },
  fetesSymboles: {
    key: 'fetesSymboles',
    label: fetesSymboles.label || fetesSymboles.name,
    name: fetesSymboles.name,
    description: fetesSymboles.description,
    words: fetesSymboles.words,
  },
  thanksgiving: {
    key: 'thanksgiving',
    label: thanksgiving.label || thanksgiving.name,
    name: thanksgiving.name,
    description: thanksgiving.description,
    words: thanksgiving.words,
  },
  paysNationalites: {
    key: 'paysNationalites',
    label: paysNationalites.label || paysNationalites.name,
    name: paysNationalites.name,
    description: paysNationalites.description,
    words: paysNationalites.words,
  },
  prepositionsLieu: {
    key: 'prepositionsLieu',
    label: prepositionsLieu.label || prepositionsLieu.name,
    name: prepositionsLieu.name,
    description: prepositionsLieu.description,
    words: prepositionsLieu.words,
  },
  villePersonnes: {
    key: 'villePersonnes',
    label: villePersonnes.label || villePersonnes.name,
    name: villePersonnes.name,
    description: villePersonnes.description,
    words: villePersonnes.words,
  },
  maisonVetements: {
    key: 'maisonVetements',
    label: maisonVetements.label || maisonVetements.name,
    name: maisonVetements.name,
    description: maisonVetements.description,
    words: maisonVetements.words,
  },
  animauxObjets: {
    key: 'animauxObjets',
    label: animauxObjets.label || animauxObjets.name,
    name: animauxObjets.name,
    description: animauxObjets.description,
    words: animauxObjets.words,
  },
  alimentsBoissons: {
    key: 'alimentsBoissons',
    label: alimentsBoissons.label || alimentsBoissons.name,
    name: alimentsBoissons.name,
    description: alimentsBoissons.description,
    words: alimentsBoissons.words,
  },
  fruits: {
    key: 'fruits',
    label: fruits.label || fruits.name,
    name: fruits.name,
    description: fruits.description,
    words: fruits.words,
  },
  legumes: {
    key: 'legumes',
    label: legumes.label || legumes.name,
    name: legumes.name,
    description: legumes.description,
    words: legumes.words,
  },
  fruits2: {
    key: 'fruits2',
    label: fruits2.label || fruits2.name,
    name: fruits2.name,
    description: fruits2.description,
    words: fruits2.words,
  },
  legumes2: {
    key: 'legumes2',
    label: legumes2.label || legumes2.name,
    name: legumes2.name,
    description: legumes2.description,
    words: legumes2.words,
  },
  meteo: {
    key: 'meteo',
    label: meteo.label || meteo.name,
    name: meteo.name,
    description: meteo.description,
    words: meteo.words,
  },
};

const listFileByKey = {
  identiteEcole: 'identite-ecole.json',
  salutationsPolitesse: 'salutations-politesse.json',
  etatsRessentis: 'etats-ressentis.json',
  tempsSemaine: 'temps-semaine.json',
  consignesClasse: 'consignes-classe.json',
  reglesClasse: 'regles-classe.json',
  materielScolaire: 'materiel-scolaire.json',
  activitesCapacites: 'activites-capacites.json',
  fetesSymboles: 'fetes-symboles.json',
  thanksgiving: 'thanksgiving.json',
  paysNationalites: 'pays-nationalites.json',
  prepositionsLieu: 'prepositions-lieu.json',
  villePersonnes: 'ville-personnes.json',
  maisonVetements: 'maison-vetements.json',
  animauxObjets: 'animaux-objets.json',
  alimentsBoissons: 'aliments-boissons.json',
  fruits: 'fruits.json',
  legumes: 'legumes.json',
  fruits2: 'fruits-2.json',
  legumes2: 'legumes-2.json',
  meteo: 'meteo.json',
};

const runtimeVocabLists = { ...baseVocabLists };

export const vocabLists = runtimeVocabLists;
export const vocabListOptions = [];

let remoteHydrated = false;
let remoteHydrationPromise = null;

rebuildVocabListOptions();

function getRemoteBaseUrl() {
  const env =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_VOCAB_REMOTE_BASE_URL
      : '';

  if (!env || typeof env !== 'string') {
    return '';
  }

  return env.trim().replace(/\/$/, '');
}

function getRemoteLanguage() {
  const env =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_VOCAB_REMOTE_LANG
      : '';

  const lang = typeof env === 'string' ? env.trim().toLowerCase() : '';
  return lang || DEFAULT_REMOTE_LANG;
}

function cloneWords(words) {
  if (!Array.isArray(words)) {
    return [];
  }
  return words.map((word) => ({
    english: typeof word.english === 'string' ? word.english : '',
    french: typeof word.french === 'string' ? word.french : '',
  }));
}

function sanitizeRuntimeList(payload, fallbackList) {
  const fallback = fallbackList || { key: '', name: '', label: '', description: '', words: [] };
  const name =
    payload && typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim()
      : fallback.name;
  const label =
    payload && typeof payload.label === 'string' && payload.label.trim()
      ? payload.label.trim()
      : fallback.label || fallback.name;
  const description =
    payload && typeof payload.description === 'string'
      ? payload.description.trim()
      : fallback.description;
  const words = cloneWords(payload?.words);

  return {
    key: fallback.key,
    name,
    label,
    description,
    words,
  };
}

function sanitizeListPayload(payload, fallbackList) {
  const fallback = fallbackList || { name: '', description: '', words: [] };
  const runtimeSafe = sanitizeRuntimeList(payload, {
    key: '',
    name: fallback.name,
    label: fallback.name,
    description: fallback.description,
    words: fallback.words,
  });

  return {
    name: runtimeSafe.name,
    description: runtimeSafe.description,
    words: runtimeSafe.words,
  };
}

function rebuildVocabListOptions() {
  const options = Object.values(runtimeVocabLists).map((list) => ({
    key: list.key,
    label: list.label,
    wordCount: Array.isArray(list.words) ? list.words.length : 0,
  }));

  vocabListOptions.splice(0, vocabListOptions.length, ...options);
}

function getStorageKey(listKey) {
  return `${STORAGE_PREFIX}${listKey}`;
}

async function fetchJsonWithTimeout(url, timeoutMs = REMOTE_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeRemoteIndexEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const key = typeof entry.key === 'string' ? entry.key.trim() : '';
  const file = typeof entry.file === 'string' ? entry.file.trim() : '';

  if (!key || !file) {
    return null;
  }

  return { key, file };
}

function extractRemoteEntries(payload) {
  if (!payload) {
    return [];
  }

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.lists)
      ? payload.lists
      : [];

  return list.map(normalizeRemoteIndexEntry).filter(Boolean);
}

async function resolveRemoteIndex(baseUrl) {
  const remoteLang = getRemoteLanguage();
  const manifestPayload = await fetchJsonWithTimeout(`${baseUrl}/${remoteLang}/manifest.json`);
  return extractRemoteEntries(manifestPayload);
}

function upsertRuntimeList(listKey, payload) {
  const fallback = runtimeVocabLists[listKey] || {
    key: listKey,
    name: listKey,
    label: listKey,
    description: '',
    words: [],
  };

  const sanitized = sanitizeRuntimeList(payload, { ...fallback, key: listKey });

  if (!Array.isArray(sanitized.words) || sanitized.words.length === 0) {
    return false;
  }

  runtimeVocabLists[listKey] = sanitized;
  return true;
}

export function listVocabOptions() {
  return Object.values(runtimeVocabLists).map((list) => ({
    key: list.key,
    label: list.label,
    wordCount: Array.isArray(list.words) ? list.words.length : 0,
  }));
}

export async function hydrateRemoteVocabLists() {
  if (remoteHydrated) {
    return { enabled: !!getRemoteBaseUrl(), loaded: 0, updated: 0, skipped: 0 };
  }

  if (remoteHydrationPromise) {
    return remoteHydrationPromise;
  }

  remoteHydrationPromise = (async () => {
    const baseUrl = getRemoteBaseUrl();
    const remoteLang = getRemoteLanguage();
    if (!baseUrl || typeof window === 'undefined' || typeof fetch !== 'function') {
      remoteHydrated = true;
      return { enabled: false, loaded: 0, updated: 0, skipped: 0 };
    }

    const queue = Object.entries(listFileByKey).map(([key, file]) => ({ key, file }));
    const remoteIndex = await resolveRemoteIndex(baseUrl);

    for (const entry of remoteIndex) {
      if (!queue.some((item) => item.key === entry.key)) {
        queue.push(entry);
      }
    }

    let loaded = 0;
    let updated = 0;

    for (const { key, file } of queue) {
      const payload = await fetchJsonWithTimeout(`${baseUrl}/${remoteLang}/${file}`);
      if (!payload) {
        continue;
      }

      loaded += 1;
      if (upsertRuntimeList(key, payload)) {
        updated += 1;
      }
    }

    rebuildVocabListOptions();
    remoteHydrated = true;

    return {
      enabled: true,
      loaded,
      updated,
      skipped: Math.max(0, queue.length - loaded),
    };
  })();

  try {
    return await remoteHydrationPromise;
  } finally {
    remoteHydrationPromise = null;
  }
}

export function getVocabList(listKey) {
  const baseList = runtimeVocabLists[listKey];
  if (!baseList) {
    return null;
  }

  if (typeof window === 'undefined') {
    return sanitizeListPayload(baseList, baseList);
  }

  const raw = localStorage.getItem(getStorageKey(listKey));
  if (!raw) {
    return sanitizeListPayload(baseList, baseList);
  }

  try {
    const parsed = JSON.parse(raw);
    return sanitizeListPayload(parsed, baseList);
  } catch {
    return sanitizeListPayload(baseList, baseList);
  }
}

export function saveVocabList(listKey, payload) {
  const baseList = runtimeVocabLists[listKey];
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
}



