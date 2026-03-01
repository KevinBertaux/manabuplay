import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getActiveSymmetryShapesConfig,
  getBaseSymmetryShapesConfig,
  hasSymmetryShapesOverride,
  resetSymmetryShapesOverride,
  saveSymmetryShapesOverride,
} from './symmetryShapeStore';

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

beforeEach(() => {
  originalWindow = globalThis.window;
  const localStorage = new MemoryStorage();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage },
  });
});

afterEach(() => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: originalWindow,
  });
});

describe('symmetryShapeStore', () => {
  it('returns a sanitized base config and does not leak mutable references', () => {
    const configA = getBaseSymmetryShapesConfig();
    const configB = getBaseSymmetryShapesConfig();

    expect(configA.version).toBe('v1');
    expect(configA.gridSize).toBeGreaterThanOrEqual(3);
    expect(configA.shapes.length).toBeGreaterThan(0);

    configA.shapes[0].points[0].x = 999;
    expect(configB.shapes[0].points[0].x).not.toBe(999);
  });

  it('persists override and resets it', () => {
    const saved = saveSymmetryShapesOverride({
      version: 'v1',
      gridSize: 5,
      axes: ['vertical'],
      shapes: [
        {
          id: 'custom-1',
          points: [
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 0, y: 3 },
          ],
        },
      ],
    });

    expect(saved).toBe(true);
    expect(hasSymmetryShapesOverride()).toBe(true);

    const active = getActiveSymmetryShapesConfig();
    expect(active.axes).toEqual(['vertical']);
    expect(active.shapes[0].id).toBe('custom-1');

    resetSymmetryShapesOverride();
    expect(hasSymmetryShapesOverride()).toBe(false);
  });

  it('drops invalid custom shapes and falls back to default shapes', () => {
    const base = getBaseSymmetryShapesConfig();

    const saved = saveSymmetryShapesOverride({
      version: 'v1',
      gridSize: 5,
      axes: ['horizontal'],
      shapes: [
        {
          id: 'invalid-out-grid',
          points: [
            { x: 0, y: 1 },
            { x: 99, y: 2 },
            { x: 0, y: 3 },
          ],
        },
      ],
    });
    expect(saved).toBe(true);

    const active = getActiveSymmetryShapesConfig();
    expect(active.axes).toEqual(['horizontal']);
    expect(active.shapes.length).toBe(base.shapes.length);
    expect(active.shapes[0].id).toBe(base.shapes[0].id);
  });
});
