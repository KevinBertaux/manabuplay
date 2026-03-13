import baseShapesConfig from '../../content/math/symmetry-shapes.v1.json';

export const SYMMETRY_SHAPES_STORAGE_KEY = 'manabuplay_symmetry_shapes_v1';

const DEFAULT_GRID_SIZE = 5;
const DEFAULT_AXES = ['vertical', 'horizontal'];
const VALID_AXES = new Set(DEFAULT_AXES);
const REMOTE_TIMEOUT_MS = 3500;
const DEFAULT_REMOTE_FOLDER = 'math';
const DEFAULT_REMOTE_FILE = 'symmetry-shapes.v1.json';

let runtimeBaseShapesConfig = sanitizeWithFallback(baseShapesConfig, baseShapesConfig);
let remoteHydrated = false;
let remoteHydrationPromise = null;

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeGridSize(value, fallback = DEFAULT_GRID_SIZE) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed < 3 || parsed > 11) {
    return fallback;
  }
  return parsed;
}

function normalizeAxes(value, fallback = DEFAULT_AXES) {
  const source = Array.isArray(value) ? value : fallback;
  const axes = source.filter((axis) => VALID_AXES.has(axis));
  if (axes.length === 0) {
    return [...DEFAULT_AXES];
  }
  return Array.from(new Set(axes));
}

function normalizePoint(point) {
  const x = Number(point?.x);
  const y = Number(point?.y);
  return {
    x: Number.isInteger(x) ? x : NaN,
    y: Number.isInteger(y) ? y : NaN,
  };
}

function normalizeShapes(shapes, gridSize, fallbackShapes = []) {
  const source = Array.isArray(shapes) ? shapes : fallbackShapes;
  const seenIds = new Set();
  const normalized = [];

  for (let index = 0; index < source.length; index += 1) {
    const rawShape = source[index];
    const idCandidate =
      typeof rawShape?.id === 'string' && rawShape.id.trim() ? rawShape.id.trim() : `shape-${index + 1}`;
    if (seenIds.has(idCandidate)) {
      continue;
    }

    const points = Array.isArray(rawShape?.points) ? rawShape.points.map(normalizePoint) : [];
    const allPointsInGrid = points.every(
      (point) =>
        Number.isInteger(point.x) &&
        Number.isInteger(point.y) &&
        point.x >= 0 &&
        point.x < gridSize &&
        point.y >= 0 &&
        point.y < gridSize
    );
    if (!allPointsInGrid || points.length < 3) {
      continue;
    }

    seenIds.add(idCandidate);
    normalized.push({
      id: idCandidate,
      points,
    });
  }

  return normalized;
}

function readOverrideRaw() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SYMMETRY_SHAPES_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function sanitizeWithFallback(input, fallback) {
  const fallbackGrid = normalizeGridSize(fallback?.gridSize, DEFAULT_GRID_SIZE);
  const gridSize = normalizeGridSize(input?.gridSize, fallbackGrid);
  const axes = normalizeAxes(input?.axes, normalizeAxes(fallback?.axes, DEFAULT_AXES));
  const fallbackShapes = normalizeShapes(fallback?.shapes, gridSize, []);
  const shapes = normalizeShapes(input?.shapes, gridSize, fallbackShapes);

  return {
    version: 'v1',
    gridSize,
    axes,
    shapes: shapes.length > 0 ? shapes : fallbackShapes,
  };
}

export function getBaseSymmetryShapesConfig() {
  return cloneJson(runtimeBaseShapesConfig);
}

export function getActiveSymmetryShapesConfig() {
  const fallback = getBaseSymmetryShapesConfig();
  const override = readOverrideRaw();
  if (!override) {
    return fallback;
  }
  return sanitizeWithFallback(override, fallback);
}

export function hasSymmetryShapesOverride() {
  if (typeof window === 'undefined') {
    return false;
  }
  return Boolean(window.localStorage.getItem(SYMMETRY_SHAPES_STORAGE_KEY));
}

export function saveSymmetryShapesOverride(config) {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const fallback = getBaseSymmetryShapesConfig();
    const sanitized = sanitizeWithFallback(config, fallback);
    window.localStorage.setItem(SYMMETRY_SHAPES_STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch {
    return false;
  }
}

export function resetSymmetryShapesOverride() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(SYMMETRY_SHAPES_STORAGE_KEY);
}

function getEnvValue(key, fallback = '') {
  if (typeof import.meta === 'undefined' || !import.meta.env) {
    return fallback;
  }

  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function getRemoteBaseUrl() {
  const env = getEnvValue('VITE_MATH_REMOTE_BASE_URL', '');
  return env ? env.replace(/\/$/, '') : '';
}

function getRemoteFolder() {
  return getEnvValue('VITE_MATH_REMOTE_FOLDER', DEFAULT_REMOTE_FOLDER).replace(/^\/+|\/+$/g, '');
}

function getRemoteConfigFile() {
  return getEnvValue('VITE_MATH_REMOTE_CONFIG_FILE', DEFAULT_REMOTE_FILE).replace(/^\/+/, '');
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

export async function hydrateRemoteSymmetryShapesConfig() {
  if (remoteHydrated) {
    return { enabled: !!getRemoteBaseUrl(), loaded: 0, updated: 0, skipped: 0 };
  }

  if (remoteHydrationPromise) {
    return remoteHydrationPromise;
  }

  remoteHydrationPromise = (async () => {
    const baseUrl = getRemoteBaseUrl();
    if (!baseUrl || typeof window === 'undefined' || typeof fetch !== 'function') {
      remoteHydrated = true;
      return { enabled: false, loaded: 0, updated: 0, skipped: 0 };
    }

    const remoteFolder = getRemoteFolder();
    const remoteFile = getRemoteConfigFile();
    const remoteUrl = `${baseUrl}/${remoteFolder}/${remoteFile}`;
    const payload = await fetchJsonWithTimeout(remoteUrl);

    remoteHydrated = true;

    if (!payload) {
      return { enabled: true, loaded: 0, updated: 0, skipped: 1 };
    }

    const sanitized = sanitizeWithFallback(payload, baseShapesConfig);
    const hasRemoteShapes = Array.isArray(sanitized.shapes) && sanitized.shapes.length > 0;

    if (!hasRemoteShapes) {
      return { enabled: true, loaded: 1, updated: 0, skipped: 0 };
    }

    runtimeBaseShapesConfig = sanitized;
    return { enabled: true, loaded: 1, updated: 1, skipped: 0 };
  })();

  try {
    return await remoteHydrationPromise;
  } finally {
    remoteHydrationPromise = null;
  }
}
