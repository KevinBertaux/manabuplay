import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getVocabList, resetVocabList, saveVocabList } from './vocabLists';

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

  clear() {
    this.map.clear();
  }
}

let originalWindow;
let originalLocalStorage;
let storage;

beforeEach(() => {
  originalWindow = globalThis.window;
  originalLocalStorage = globalThis.localStorage;

  storage = new MemoryStorage();

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
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: originalWindow,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: originalLocalStorage,
  });
});

describe('vocabLists storage behavior', () => {
  it('returns base list when no override exists', () => {
    const list = getVocabList('fruits');

    expect(list).not.toBeNull();
    expect(list.name.length).toBeGreaterThan(0);
    expect(Array.isArray(list.words)).toBe(true);
    expect(list.words.length).toBeGreaterThan(0);
  });

  it('saves and returns sanitized payload', () => {
    const saved = saveVocabList('fruits', {
      name: '  Fruits perso ',
      description: '  ma liste  ',
      words: [
        { english: ' Apple ', french: ' Pomme ' },
        { english: 123, french: null },
      ],
    });

    expect(saved).toBe(true);

    const list = getVocabList('fruits');
    expect(list).toEqual({
      name: 'Fruits perso',
      description: 'ma liste',
      words: [
        { english: ' Apple ', french: ' Pomme ' },
        { english: '', french: '' },
      ],
    });
  });

  it('migrates legacy storage key into current key', () => {
    const legacyKey = 'revision_enfants_vocab_list_fruits';
    storage.setItem(
      legacyKey,
      JSON.stringify({
        name: 'Legacy Fruits',
        description: 'old',
        words: [{ english: 'Pear', french: 'Poire' }],
      })
    );

    const list = getVocabList('fruits');

    expect(list.name).toBe('Legacy Fruits');
    expect(storage.getItem('manabuplay_vocab_list_fruits')).not.toBeNull();
  });

  it('falls back to base list when stored JSON is invalid', () => {
    const baseline = getVocabList('fruits');
    storage.setItem('manabuplay_vocab_list_fruits', '{broken-json');

    const list = getVocabList('fruits');
    expect(list).toEqual(baseline);
  });

  it('resets both current and legacy overrides', () => {
    storage.setItem('manabuplay_vocab_list_fruits', JSON.stringify({ name: 'Current', words: [] }));
    storage.setItem('revision_enfants_vocab_list_fruits', JSON.stringify({ name: 'Legacy', words: [] }));

    resetVocabList('fruits');

    expect(storage.getItem('manabuplay_vocab_list_fruits')).toBeNull();
    expect(storage.getItem('revision_enfants_vocab_list_fruits')).toBeNull();
  });


  it('returns false when localStorage.setItem throws on save', () => {
    storage.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    const saved = saveVocabList('fruits', {
      name: 'Fruits',
      description: '',
      words: [{ english: 'Apple', french: 'Pomme' }],
    });

    expect(saved).toBe(false);
  });

  it('keeps legacy read working even when migration write fails', () => {
    const legacyKey = 'revision_enfants_vocab_list_fruits';
    storage.map.set(
      legacyKey,
      JSON.stringify({
        name: 'Legacy Fruits',
        description: 'old',
        words: [{ english: 'Pear', french: 'Poire' }],
      })
    );

    const originalSetItem = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
      if (key === 'manabuplay_vocab_list_fruits') {
        throw new Error('QuotaExceededError');
      }
      originalSetItem(key, value);
    };

    const list = getVocabList('fruits');

    expect(list.name).toBe('Legacy Fruits');
    expect(storage.getItem('manabuplay_vocab_list_fruits')).toBeNull();
  });
  it('returns null / false for unknown list keys', () => {
    expect(getVocabList('unknown-key')).toBeNull();
    expect(saveVocabList('unknown-key', { name: 'x', words: [] })).toBe(false);
  });
});


