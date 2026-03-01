import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  executeResetAction,
  getHistoryLimit,
  getMaintenanceHistory,
  previewResetAction,
  rollbackResetAction,
  setHistoryLimit,
} from './storageMaintenance';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  get length() {
    return this.map.size;
  }

  key(index) {
    return Array.from(this.map.keys())[index] ?? null;
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
let localStorage;
let sessionStorage;

beforeEach(() => {
  originalWindow = globalThis.window;
  localStorage = new MemoryStorage();
  sessionStorage = new MemoryStorage();

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage,
      sessionStorage,
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: originalWindow,
  });
});

describe('storageMaintenance', () => {
  it('normalizes history limit within bounds and step', () => {
    expect(setHistoryLimit(22)).toBe(20);
    expect(getHistoryLimit()).toBe(20);

    expect(setHistoryLimit(3)).toBe(10);
    expect(getHistoryLimit()).toBe(10);

    expect(setHistoryLimit(999)).toBe(50);
    expect(getHistoryLimit()).toBe(50);
  });

  it('resets streak keys with preset and keeps unrelated keys', () => {
    localStorage.setItem('manabuplay_math_best_streak_v1', '12');
    localStorage.setItem('manabuplay_symmetry_best_streak_v1', '8');
    localStorage.setItem('manabuplay_tts_rate', '1');

    const result = executeResetAction({
      actionLabel: 'Reset streaks',
      presetId: 'streaks',
      includeSession: false,
    });

    expect(result.targetCount).toBe(2);
    expect(result.removedCount).toBe(2);
    expect(localStorage.getItem('manabuplay_math_best_streak_v1')).toBeNull();
    expect(localStorage.getItem('manabuplay_symmetry_best_streak_v1')).toBeNull();
    expect(localStorage.getItem('manabuplay_tts_rate')).toBe('1');

    const history = getMaintenanceHistory();
    expect(history).toHaveLength(1);
    expect(history[0].affected).toHaveLength(2);
  });

  it('rolls back a maintenance action from history', () => {
    localStorage.setItem('manabuplay_math_best_streak_v1', '10');
    localStorage.setItem('manabuplay_symmetry_best_streak_v1', '6');

    const resetResult = executeResetAction({
      actionLabel: 'Reset streaks',
      presetId: 'streaks',
      includeSession: false,
    });
    const rollback = rollbackResetAction(resetResult.historyId);

    expect(rollback.found).toBe(true);
    expect(rollback.restoredCount).toBe(2);
    expect(localStorage.getItem('manabuplay_math_best_streak_v1')).toBe('10');
    expect(localStorage.getItem('manabuplay_symmetry_best_streak_v1')).toBe('6');
  });

  it('excludes session targets from admin preview when includeSession=false', () => {
    const previewWithoutSession = previewResetAction({
      presetId: 'admin',
      includeSession: false,
    });
    const previewWithSession = previewResetAction({
      presetId: 'admin',
      includeSession: true,
    });

    expect(previewWithoutSession.targets.some((entry) => entry.storage === 'session')).toBe(false);
    expect(previewWithSession.targets.some((entry) => entry.storage === 'session')).toBe(true);
  });
});
