import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  CONSENT_CATEGORIES,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CONSENT_STATUSES,
} from './consentConfig';
import { applyConsentToScripts, bootConsentScriptRegistry } from './scriptManager';

const LOCKED_IDS = new Set(CONSENT_CATEGORIES.filter((cat) => cat.locked).map((cat) => cat.id));

function buildDefaultSelections() {
  return CONSENT_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = category.locked ? true : false;
    return acc;
  }, {});
}

function readStoredConsent() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }
    if (!parsed.selections) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const useConsentStore = defineStore('consent', () => {
  const selections = ref(buildDefaultSelections());
  const status = ref(CONSENT_STATUSES.UNKNOWN);
  const updatedAt = ref(null);
  const panelOpen = ref(false);
  const initialized = ref(false);

  function hydrateFromStorage() {
    const stored = readStoredConsent();
    if (!stored) {
      applyConsentToScripts(selections.value);
      return;
    }
    selections.value = { ...buildDefaultSelections(), ...stored.selections };
    status.value = stored.status || CONSENT_STATUSES.CUSTOM;
    updatedAt.value = stored.updatedAt || null;
    applyConsentToScripts(selections.value);
  }

  function persist(nextStatus) {
    const payload = {
      version: CONSENT_VERSION,
      status: nextStatus,
      selections: selections.value,
      updatedAt: new Date().toISOString(),
    };
    status.value = nextStatus;
    updatedAt.value = payload.updatedAt;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Keep in-memory consent usable even if persistence is unavailable.
      }
    }
    applyConsentToScripts(selections.value);
  }

  function acceptAll() {
    selections.value = CONSENT_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {});
    persist(CONSENT_STATUSES.GRANTED);
    panelOpen.value = false;
  }

  function rejectAll() {
    selections.value = CONSENT_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = category.locked ? true : false;
      return acc;
    }, {});
    persist(CONSENT_STATUSES.DENIED);
    panelOpen.value = false;
  }

  function setCategory(categoryId, value) {
    if (LOCKED_IDS.has(categoryId)) {
      return;
    }
    selections.value = {
      ...selections.value,
      [categoryId]: Boolean(value),
    };
  }

  function saveCustom() {
    persist(CONSENT_STATUSES.CUSTOM);
    panelOpen.value = false;
  }

  function openPanel() {
    panelOpen.value = true;
  }

  function closePanel() {
    panelOpen.value = false;
  }

  function init() {
    if (initialized.value) {
      return;
    }
    if (typeof window !== 'undefined') {
      bootConsentScriptRegistry();
      hydrateFromStorage();
    }
    initialized.value = true;
  }

  function reset() {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      } catch {
        // Ignore storage failures and still reset the in-memory state.
      }
    }
    selections.value = buildDefaultSelections();
    status.value = CONSENT_STATUSES.UNKNOWN;
    updatedAt.value = null;
    panelOpen.value = false;
    applyConsentToScripts(selections.value);
  }

  const shouldDisplayBanner = computed(() => status.value === CONSENT_STATUSES.UNKNOWN);
  const summary = computed(() => ({
    selections: selections.value,
    status: status.value,
    updatedAt: updatedAt.value,
  }));

  const nonEssentialAllowed = computed(() =>
    Object.entries(selections.value).some(([id, value]) => !LOCKED_IDS.has(id) && value)
  );

  return {
    // state
    selections,
    status,
    updatedAt,
    panelOpen,
    shouldDisplayBanner,
    summary,
    nonEssentialAllowed,
    categories: CONSENT_CATEGORIES,
    // actions
    init,
    acceptAll,
    rejectAll,
    saveCustom,
    setCategory,
    openPanel,
    closePanel,
    reset,
  };
});
