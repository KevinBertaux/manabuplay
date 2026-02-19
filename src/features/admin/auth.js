const SESSION_KEY = 'manabuplay_admin_session_v1';
const RATE_LIMIT_KEY = 'manabuplay_admin_rate_limit_v1';

const DEFAULTS = {
  username: 'manabuplay-owner',
  passwordHash: '8cbd9bba110b472f24889dfacc9e234b889d91bc0aca412b51aa09a9e9d618d1',
  sessionTtlMs: 30 * 60 * 1000,
  maxAttempts: 3,
  blockDurationMs: 30 * 60 * 1000,
  hardBlockDurationMs: 24 * 60 * 60 * 1000,
};

function getStringEnvValue(key) {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function getNumberEnvValue(key, fallback) {
  const value = Number.parseInt(import.meta.env[key], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getAdminSecurityConfig() {
  return {
    username: getStringEnvValue('VITE_ADMIN_USERNAME') || DEFAULTS.username,
    passwordHash:
      getStringEnvValue('VITE_ADMIN_PASSWORD_HASH').toLowerCase() || DEFAULTS.passwordHash,
    sessionTtlMs: getNumberEnvValue('VITE_ADMIN_SESSION_TTL_MS', DEFAULTS.sessionTtlMs),
    maxAttempts: getNumberEnvValue('VITE_ADMIN_MAX_ATTEMPTS', DEFAULTS.maxAttempts),
    blockDurationMs: getNumberEnvValue('VITE_ADMIN_BLOCK_MS', DEFAULTS.blockDurationMs),
    hardBlockDurationMs: getNumberEnvValue('VITE_ADMIN_HARD_BLOCK_MS', DEFAULTS.hardBlockDurationMs),
  };
}

function nowMs() {
  return Date.now();
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function readJson(storage, key, fallback) {
  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(storage, key, value) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors on locked-down environments.
  }
}

function clearKey(storage, key) {
  if (!storage) {
    return;
  }
  storage.removeItem(key);
}

function createInitialRateLimitState() {
  return {
    failedAttempts: 0,
    blockedUntilMs: 0,
    escalationArmed: false,
    blockLevel: 'none',
  };
}

function getRateLimitState() {
  const state = readJson(getStorage(), RATE_LIMIT_KEY, createInitialRateLimitState());
  return {
    failedAttempts: Number.isFinite(state.failedAttempts) ? state.failedAttempts : 0,
    blockedUntilMs: Number.isFinite(state.blockedUntilMs) ? state.blockedUntilMs : 0,
    escalationArmed: Boolean(state.escalationArmed),
    blockLevel: state.blockLevel === 'hard' || state.blockLevel === 'soft' ? state.blockLevel : 'none',
  };
}

function setRateLimitState(state) {
  writeJson(getStorage(), RATE_LIMIT_KEY, state);
}

function clearRateLimitState() {
  clearKey(getStorage(), RATE_LIMIT_KEY);
}

export function getRateLimitInfo() {
  const config = getAdminSecurityConfig();
  const state = getRateLimitState();
  const remainingMs = Math.max(0, state.blockedUntilMs - nowMs());

  return {
    remainingAttempts: Math.max(0, config.maxAttempts - state.failedAttempts),
    blockedMs: remainingMs,
    isBlocked: remainingMs > 0,
    blockLevel: remainingMs > 0 ? state.blockLevel : 'none',
  };
}

export function registerFailedAttempt() {
  const config = getAdminSecurityConfig();
  const state = getRateLimitState();

  if (state.blockedUntilMs > nowMs()) {
    return getRateLimitInfo();
  }

  if (state.escalationArmed) {
    setRateLimitState({
      failedAttempts: 0,
      blockedUntilMs: nowMs() + config.hardBlockDurationMs,
      escalationArmed: false,
      blockLevel: 'hard',
    });
    return getRateLimitInfo();
  }

  const failedAttempts = state.failedAttempts + 1;
  const shouldBlock = failedAttempts >= config.maxAttempts;

  setRateLimitState({
    failedAttempts: shouldBlock ? 0 : failedAttempts,
    blockedUntilMs: shouldBlock ? nowMs() + config.blockDurationMs : 0,
    escalationArmed: shouldBlock,
    blockLevel: shouldBlock ? 'soft' : 'none',
  });

  return getRateLimitInfo();
}

export function clearFailedAttempts() {
  clearRateLimitState();
}

function readSession() {
  return readJson(getSessionStorage(), SESSION_KEY, { expiresAtMs: 0 });
}

export function startAdminSession() {
  const config = getAdminSecurityConfig();
  writeJson(getSessionStorage(), SESSION_KEY, {
    expiresAtMs: nowMs() + config.sessionTtlMs,
  });
}

export function clearAdminSession() {
  clearKey(getSessionStorage(), SESSION_KEY);
}

export function isAdminSessionValid() {
  const session = readSession();
  return Number.isFinite(session.expiresAtMs) && session.expiresAtMs > nowMs();
}

export function getAdminSessionRemainingMs() {
  const session = readSession();
  return Math.max(0, (session.expiresAtMs || 0) - nowMs());
}

async function sha256(text) {
  const input = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', input);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyAdminCredentials(username, password) {
  const config = getAdminSecurityConfig();
  const typedUsername = typeof username === 'string' ? username.trim() : '';
  const typedPassword = typeof password === 'string' ? password : '';

  if (!typedUsername || !typedPassword) {
    return false;
  }

  if (typedUsername !== config.username) {
    return false;
  }

  const hashedPassword = await sha256(typedPassword);
  return hashedPassword === config.passwordHash;
}
