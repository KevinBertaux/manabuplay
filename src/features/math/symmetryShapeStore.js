import localManifest from '../../content/math/symmetry/manifest.json';
import shapesThreePoints from '../../content/math/symmetry/shapes-3-points.json';
import shapesFourPoints from '../../content/math/symmetry/shapes-4-points.json';
import shapesFivePoints from '../../content/math/symmetry/shapes-5-points.json';

export const SYMMETRY_SHAPES_STORAGE_KEY = 'manabuplay_symmetry_shapes_v1';

const DEFAULT_GRID_SIZE = 5;
const DEFAULT_AXES = ['vertical', 'horizontal'];
const VALID_AXES = new Set(DEFAULT_AXES);
const REMOTE_TIMEOUT_MS = 3500;
const DEFAULT_REMOTE_FOLDER = 'math/symmetry';
const DEFAULT_REMOTE_MANIFEST_FILE = 'manifest.json';
const DEFAULT_REMOTE_CONFIG_FILE = 'shapes-3-points.json';

const LOCAL_GROUP_PAYLOADS = {
  threePoints: shapesThreePoints,
  fourPoints: shapesFourPoints,
  fivePoints: shapesFivePoints,
};

let localBaseShapesConfig = createLocalBaseShapesConfig();
let runtimeBaseShapesConfig = cloneJson(localBaseShapesConfig);
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

function normalizeUpdatedAt(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizePoint(point) {
  const x = Number(point?.x);
  const y = Number(point?.y);
  return {
    x: Number.isInteger(x) ? x : NaN,
    y: Number.isInteger(y) ? y : NaN,
  };
}

function normalizeManifestGroupEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const key = typeof entry.key === 'string' ? entry.key.trim() : '';
  const file = typeof entry.file === 'string' ? entry.file.trim() : '';
  const points = Number.parseInt(String(entry.points ?? ''), 10);

  if (!key || !file || !Number.isInteger(points) || points < 3 || points > 9) {
    return null;
  }

  return { key, file, points };
}

function extractManifestGroups(payload) {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const groups = Array.isArray(payload.groups) ? payload.groups : [];
  return groups.map(normalizeManifestGroupEntry).filter(Boolean);
}

function sanitizeManifest(payload, fallback = null) {
  const fallbackGridSize = normalizeGridSize(fallback?.gridSize, DEFAULT_GRID_SIZE);
  const fallbackAxes = normalizeAxes(fallback?.axes, DEFAULT_AXES);
  const fallbackUpdatedAt = normalizeUpdatedAt(fallback?.updatedAt, '');
  const fallbackGroups = Array.isArray(fallback?.groups) ? fallback.groups : [];

  const groups = extractManifestGroups(payload);

  return {
    gridSize: normalizeGridSize(payload?.gridSize, fallbackGridSize),
    axes: normalizeAxes(payload?.axes, fallbackAxes),
    updatedAt: normalizeUpdatedAt(payload?.updatedAt, fallbackUpdatedAt),
    groups: groups.length > 0 ? groups : fallbackGroups,
  };
}

function extractShapesArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === 'object' && Array.isArray(payload.shapes)) {
    return payload.shapes;
  }
  return [];
}

function normalizeShapes(shapes, gridSize, expectedPoints = null, fallbackShapes = []) {
  const source = Array.isArray(shapes) ? shapes : fallbackShapes;
  const seenIds = new Set();
  const normalized = [];

  for (let index = 0; index < source.length; index += 1) {
    const rawShape = source[index];
    const idCandidate =
      typeof rawShape?.id === 'string' && rawShape.id.trim()
        ? rawShape.id.trim()
        : `shape-${index + 1}`;
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
    const pointCountMatches = expectedPoints === null || points.length === expectedPoints;
    if (!allPointsInGrid || points.length < 3 || !pointCountMatches) {
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

function buildShapesFromManifest(manifest, payloads, fallbackShapes = []) {
  const shapes = [];
  const seenIds = new Set();

  for (const group of manifest.groups) {
    const payload = payloads[group.key];
    const groupShapes = normalizeShapes(extractShapesArray(payload), manifest.gridSize, group.points);

    for (const shape of groupShapes) {
      if (seenIds.has(shape.id)) {
        continue;
      }
      seenIds.add(shape.id);
      shapes.push(shape);
    }
  }

  return shapes.length > 0 ? shapes : fallbackShapes;
}

function buildConfigFromManifest(manifest, payloads, fallback = null) {
  const fallbackShapes = Array.isArray(fallback?.shapes)
    ? fallback.shapes.map((shape) => ({
        id: shape.id,
        points: shape.points.map((point) => ({ ...point })),
      }))
    : [];

  const shapes = buildShapesFromManifest(manifest, payloads, fallbackShapes);

  return {
    version: 'v1',
    gridSize: manifest.gridSize,
    axes: manifest.axes,
    updatedAt: manifest.updatedAt,
    shapes,
  };
}

function createLocalBaseShapesConfig() {
  const manifest = sanitizeManifest(localManifest);
  return buildConfigFromManifest(manifest, LOCAL_GROUP_PAYLOADS);
}

function readOverrideRaw() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SYMMETRY_SHAPES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function sanitizeWithFallback(input, fallback) {
  const fallbackGrid = normalizeGridSize(fallback?.gridSize, DEFAULT_GRID_SIZE);
  const gridSize = normalizeGridSize(input?.gridSize, fallbackGrid);
  const axes = normalizeAxes(input?.axes, normalizeAxes(fallback?.axes, DEFAULT_AXES));
  const fallbackShapes = normalizeShapes(fallback?.shapes, gridSize, null, []);
  const shapes = normalizeShapes(input?.shapes, gridSize, null, fallbackShapes);

  return {
    version: 'v1',
    gridSize,
    axes,
    updatedAt: normalizeUpdatedAt(input?.updatedAt, normalizeUpdatedAt(fallback?.updatedAt, '')),
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

function stripTrailingSlashes(value) {
  return value.replace(/\/+$/, '');
}

function stripLeadingSlashes(value) {
  return value.replace(/^\/+/, '');
}

function joinRemoteUrl(baseUrl, ...segments) {
  const cleaned = segments
    .map((segment) => stripLeadingSlashes(String(segment ?? '').trim()))
    .filter(Boolean);

  return [stripTrailingSlashes(baseUrl), ...cleaned].join('/');
}

function compareUpdatedAt(left, right) {
  return String(left || '').localeCompare(String(right || ''));
}

function createTimeoutSignal(timeoutMs) {
  if (typeof AbortController === 'undefined') {
    return { signal: undefined, clear: () => {} };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

async function fetchJson(url) {
  const { signal, clear } = createTimeoutSignal(REMOTE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  } finally {
    clear();
  }
}

function setRuntimeBaseShapesConfig(config) {
  runtimeBaseShapesConfig = sanitizeWithFallback(config, localBaseShapesConfig);
}

export function resetSymmetryShapesRuntimeForTests() {
  localBaseShapesConfig = createLocalBaseShapesConfig();
  runtimeBaseShapesConfig = cloneJson(localBaseShapesConfig);
  remoteHydrated = false;
  remoteHydrationPromise = null;
}

async function hydrateFromRemoteManifest(baseUrl, folder, fallbackFile) {
  const manifestUrl = joinRemoteUrl(baseUrl, folder, DEFAULT_REMOTE_MANIFEST_FILE);
  const remoteManifestPayload = await fetchJson(manifestUrl);
  const manifest = sanitizeManifest(remoteManifestPayload, localManifest);

  if (!manifest.updatedAt || compareUpdatedAt(manifest.updatedAt, localManifest.updatedAt) <= 0) {
    return {
      enabled: true,
      loaded: 0,
      updated: 0,
      skipped: 1,
    };
  }

  const payloads = {};
  let loaded = 0;

  for (const group of manifest.groups) {
    const payload = await fetchJson(joinRemoteUrl(baseUrl, folder, group.file));
    if (!payload) {
      return null;
    }
    payloads[group.key] = payload;
    loaded += 1;
  }

  const remoteConfig = buildConfigFromManifest(manifest, payloads, localBaseShapesConfig);
  setRuntimeBaseShapesConfig(remoteConfig);

  return {
    enabled: true,
    loaded,
    updated: 1,
    skipped: 0,
  };
}

async function hydrateFromRemoteFile(baseUrl, folder, file) {
  const remotePayload = await fetchJson(joinRemoteUrl(baseUrl, folder, file || DEFAULT_REMOTE_CONFIG_FILE));
  if (!remotePayload) {
    return null;
  }

  const remoteConfig = sanitizeWithFallback(remotePayload, localBaseShapesConfig);
  setRuntimeBaseShapesConfig(remoteConfig);

  return {
    enabled: true,
    loaded: 1,
    updated: 1,
    skipped: 0,
  };
}

export async function hydrateRemoteSymmetryShapesConfig() {
  if (remoteHydrated) {
    return {
      enabled: true,
      loaded: 0,
      updated: 0,
      skipped: 0,
    };
  }

  if (remoteHydrationPromise) {
    return remoteHydrationPromise;
  }

  const baseUrl = getEnvValue('VITE_SYMMETRY_REMOTE_BASE_URL', '');
  if (!baseUrl) {
    return {
      enabled: false,
      loaded: 0,
      updated: 0,
      skipped: 0,
    };
  }

  const folder = getEnvValue('VITE_SYMMETRY_REMOTE_FOLDER', DEFAULT_REMOTE_FOLDER);
  const fallbackFile = getEnvValue('VITE_SYMMETRY_REMOTE_CONFIG_FILE', DEFAULT_REMOTE_CONFIG_FILE);

  remoteHydrationPromise = (async () => {
    const manifestResult = await hydrateFromRemoteManifest(baseUrl, folder, fallbackFile);
    if (manifestResult) {
      remoteHydrated = true;
      return manifestResult;
    }

    const fileResult = await hydrateFromRemoteFile(baseUrl, folder, fallbackFile);
    if (fileResult) {
      remoteHydrated = true;
      return fileResult;
    }

    remoteHydrated = true;
    return {
      enabled: true,
      loaded: 0,
      updated: 0,
      skipped: 1,
    };
  })();

  try {
    return await remoteHydrationPromise;
  } finally {
    remoteHydrationPromise = null;
  }
}
