import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }
}

let originalWindow;
let originalLocalStorage;
let originalFetch;

beforeEach(() => {
  originalWindow = globalThis.window;
  originalLocalStorage = globalThis.localStorage;
  originalFetch = globalThis.fetch;

  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: storage },
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: originalWindow,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: originalLocalStorage,
  });
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: originalFetch,
  });
});

async function loadVocabModule() {
  return import('./vocabLists');
}

function okJson(payload) {
  return {
    ok: true,
    json: async () => payload,
  };
}

describe('vocabLists remote hydration', () => {
  it('returns disabled when remote base URL is empty', async () => {
    vi.stubEnv('VITE_VOCAB_REMOTE_BASE_URL', '');

    const { hydrateRemoteVocabLists } = await loadVocabModule();
    const result = await hydrateRemoteVocabLists();

    expect(result).toEqual({
      enabled: false,
      loaded: 0,
      updated: 0,
      skipped: 0,
    });
  });

  it('hydrates known list and appends unknown list from remote manifest', async () => {
    vi.stubEnv('VITE_VOCAB_REMOTE_BASE_URL', 'https://example.test');
    vi.stubEnv('VITE_VOCAB_REMOTE_LANG', 'en');

    const fetchMock = vi.fn(async (url) => {
      const asText = String(url);
      if (asText.endsWith('/en/manifest.json')) {
        return okJson({ lists: [{ key: 'bonusList', file: 'bonus.json' }] });
      }
      if (asText.endsWith('/en/fruits.json')) {
        return okJson({
          name: '🍉 Fruits distants',
          label: '🍉 Fruits distants',
          description: 'Liste chargée depuis R2',
          words: [{ english: 'Watermelon', french: 'Pastèque' }],
        });
      }
      if (asText.endsWith('/en/bonus.json')) {
        return okJson({
          name: '🧪 Bonus',
          label: '🧪 Bonus',
          description: 'Liste injectée via manifest distant',
          words: [{ english: 'Test', french: 'Essai' }],
        });
      }
      return { ok: false, json: async () => ({}) };
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { getVocabList, hydrateRemoteVocabLists, listVocabOptions } = await loadVocabModule();
    const result = await hydrateRemoteVocabLists();

    expect(result.enabled).toBe(true);
    expect(result.loaded).toBeGreaterThanOrEqual(2);
    expect(result.updated).toBeGreaterThanOrEqual(2);

    expect(getVocabList('fruits')?.name).toBe('🍉 Fruits distants');
    expect(getVocabList('bonusList')?.name).toBe('🧪 Bonus');
    expect(listVocabOptions().some((item) => item.key === 'bonusList')).toBe(true);
  });

  it('ignores remote payload with empty words and keeps local fallback', async () => {
    vi.stubEnv('VITE_VOCAB_REMOTE_BASE_URL', 'https://example.test');
    vi.stubEnv('VITE_VOCAB_REMOTE_LANG', 'en');

    const fetchMock = vi.fn(async (url) => {
      const asText = String(url);
      if (asText.endsWith('/en/manifest.json')) {
        return okJson([]);
      }
      if (asText.endsWith('/en/fruits.json')) {
        return okJson({
          name: 'Remote invalid',
          label: 'Remote invalid',
          description: 'should be ignored',
          words: [],
        });
      }
      return { ok: false, json: async () => ({}) };
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { getVocabList, hydrateRemoteVocabLists } = await loadVocabModule();
    const baseline = getVocabList('fruits');

    const result = await hydrateRemoteVocabLists();
    const afterHydration = getVocabList('fruits');

    expect(result.enabled).toBe(true);
    expect(afterHydration).toEqual(baseline);
  });

  it('hydrates only once and returns cached state on subsequent call', async () => {
    vi.stubEnv('VITE_VOCAB_REMOTE_BASE_URL', 'https://example.test');
    vi.stubEnv('VITE_VOCAB_REMOTE_LANG', 'en');

    const fetchMock = vi.fn(async (url) => {
      const asText = String(url);
      if (asText.endsWith('/en/manifest.json')) {
        return okJson([]);
      }
      if (asText.endsWith('/en/fruits.json')) {
        return okJson({
          name: '🍓 Fruits',
          label: '🍓 Fruits',
          description: 'First load',
          words: [{ english: 'Strawberry', french: 'Fraise' }],
        });
      }
      return { ok: false, json: async () => ({}) };
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { hydrateRemoteVocabLists } = await loadVocabModule();

    await hydrateRemoteVocabLists();
    const firstCallCount = fetchMock.mock.calls.length;

    const secondResult = await hydrateRemoteVocabLists();
    const secondCallCount = fetchMock.mock.calls.length;

    expect(secondResult).toEqual({
      enabled: true,
      loaded: 0,
      updated: 0,
      skipped: 0,
    });
    expect(secondCallCount).toBe(firstCallCount);
  });
});
