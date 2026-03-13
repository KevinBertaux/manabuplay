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

async function loadSymmetryModule() {
  return import('./symmetryShapeStore');
}

function okJson(payload) {
  return {
    ok: true,
    json: async () => payload,
  };
}

describe('symmetryShapeStore remote hydration', () => {
  it('returns disabled when remote base URL is empty', async () => {
    vi.stubEnv('VITE_SYMMETRY_REMOTE_BASE_URL', '');

    const { hydrateRemoteSymmetryShapesConfig } = await loadSymmetryModule();
    const result = await hydrateRemoteSymmetryShapesConfig();

    expect(result).toEqual({
      enabled: false,
      loaded: 0,
      updated: 0,
      skipped: 0,
    });
  });

  it('hydrates remote symmetry shapes config from R2-style URL', async () => {
    vi.stubEnv('VITE_SYMMETRY_REMOTE_BASE_URL', 'https://example.test');
    vi.stubEnv('VITE_SYMMETRY_REMOTE_FOLDER', 'math/symmetry');
    vi.stubEnv('VITE_SYMMETRY_REMOTE_CONFIG_FILE', 'shapes-3-points.json');

    const fetchMock = vi.fn(async (url) => {
      const asText = String(url);
      if (asText.endsWith('/math/symmetry/manifest.json')) {
        return okJson({
          updatedAt: '2026-03-13.3',
          gridSize: 5,
          axes: ['vertical'],
          groups: [{ key: 'threePoints', file: 'shapes-3-points.remote.json', points: 3 }],
        });
      }
      if (asText.endsWith('/math/symmetry/shapes-3-points.remote.json')) {
        return okJson({
          shapes: [
            {
              id: 'remote-shape-01',
              points: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 0, y: 2 },
              ],
            },
          ],
        });
      }
      return { ok: false, json: async () => ({}) };
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { getBaseSymmetryShapesConfig, hydrateRemoteSymmetryShapesConfig } = await loadSymmetryModule();
    const result = await hydrateRemoteSymmetryShapesConfig();
    const config = getBaseSymmetryShapesConfig();

    expect(result).toEqual({
      enabled: true,
      loaded: 1,
      updated: 1,
      skipped: 0,
    });
    expect(config.axes).toEqual(['vertical']);
    expect(config.shapes).toHaveLength(1);
    expect(config.shapes[0].id).toBe('remote-shape-01');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/math/symmetry/manifest.json',
      expect.any(Object)
    );
  });

  it('falls back to local shapes when remote manifest is not newer', async () => {
    vi.stubEnv('VITE_SYMMETRY_REMOTE_BASE_URL', 'https://example.test');

    const fetchMock = vi.fn(async () => okJson({ updatedAt: '2026-03-13.1' }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { getBaseSymmetryShapesConfig, hydrateRemoteSymmetryShapesConfig } = await loadSymmetryModule();
    const baseline = getBaseSymmetryShapesConfig();
    const result = await hydrateRemoteSymmetryShapesConfig();
    const config = getBaseSymmetryShapesConfig();

    expect(result).toEqual({
      enabled: true,
      loaded: 0,
      updated: 0,
      skipped: 1,
    });
    expect(config.axes).toEqual(baseline.axes);
    expect(config.shapes).toEqual(baseline.shapes);
  });

  it('hydrates only once and keeps local override on top of remote base', async () => {
    vi.stubEnv('VITE_SYMMETRY_REMOTE_BASE_URL', 'https://example.test');

    const fetchMock = vi.fn(async (url) => {
      const asText = String(url);
      if (asText.endsWith('/math/symmetry/manifest.json')) {
        return okJson({
          updatedAt: '2026-03-13.3',
          gridSize: 5,
          axes: ['vertical', 'horizontal'],
          groups: [{ key: 'threePoints', file: 'shapes-3-points.remote.json', points: 3 }],
        });
      }

      return okJson({
        shapes: [
          {
            id: 'remote-shape-02',
            points: [
              { x: 0, y: 1 },
              { x: 1, y: 2 },
              { x: 0, y: 3 },
            ],
          },
        ],
      });
    });

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const {
      getActiveSymmetryShapesConfig,
      hydrateRemoteSymmetryShapesConfig,
      saveSymmetryShapesOverride,
    } = await loadSymmetryModule();

    const firstResult = await hydrateRemoteSymmetryShapesConfig();
    const secondResult = await hydrateRemoteSymmetryShapesConfig();

    const saved = saveSymmetryShapesOverride({
      version: 'v1',
      gridSize: 5,
      axes: ['horizontal'],
      shapes: [
        {
          id: 'override-shape-01',
          points: [
            { x: 1, y: 0 },
            { x: 0, y: 2 },
            { x: 1, y: 4 },
          ],
        },
      ],
    });

    expect(saved).toBe(true);
    expect(firstResult).toEqual({
      enabled: true,
      loaded: 1,
      updated: 1,
      skipped: 0,
    });
    expect(secondResult).toEqual({
      enabled: true,
      loaded: 0,
      updated: 0,
      skipped: 0,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const active = getActiveSymmetryShapesConfig();
    expect(active.axes).toEqual(['horizontal']);
    expect(active.shapes[0].id).toBe('override-shape-01');
  });
});
