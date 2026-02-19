import { createHash, webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAdminSession,
  clearFailedAttempts,
  getAdminSecurityConfig,
  getAdminSessionRemainingMs,
  getRateLimitInfo,
  isAdminSessionValid,
  registerFailedAttempt,
  startAdminSession,
  verifyAdminCredentials,
} from './auth';

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

const PASSWORD = 'N7v!Q2z@L9m#R4x$T8p%C6k^W1s&Y5dF';
const PASSWORD_HASH = createHash('sha256').update(PASSWORD, 'utf8').digest('hex');
const DEFAULT_USERNAME = 'kevinbertaux';
const DEFAULT_HASH = 'e99635f91e227f640d09218dc823f7a284fd9340648e291a599fdefdaf4dbeaf';

let originalWindow;
let originalLocalStorage;
let originalCrypto;

beforeEach(() => {
  originalWindow = globalThis.window;
  originalLocalStorage = globalThis.localStorage;
  originalCrypto = globalThis.crypto;

  const localStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage,
      sessionStorage,
    },
  });

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: localStorage,
  });

  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: originalCrypto?.subtle ? originalCrypto : webcrypto,
  });

  vi.stubEnv('VITE_ADMIN_USERNAME', DEFAULT_USERNAME);
  vi.stubEnv('VITE_ADMIN_PASSWORD_HASH', PASSWORD_HASH);
  vi.stubEnv('VITE_ADMIN_SESSION_TTL_MS', '1800000');
  vi.stubEnv('VITE_ADMIN_MAX_ATTEMPTS', '3');
  vi.stubEnv('VITE_ADMIN_BLOCK_MS', '1800000');
  vi.stubEnv('VITE_ADMIN_HARD_BLOCK_MS', '86400000');

  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-02-20T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: originalWindow,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: originalLocalStorage,
  });

  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: originalCrypto,
  });
});

describe('getAdminSecurityConfig', () => {
  it('reads environment overrides', () => {
    const config = getAdminSecurityConfig();

    expect(config.username).toBe(DEFAULT_USERNAME);
    expect(config.passwordHash).toBe(PASSWORD_HASH);
    expect(config.maxAttempts).toBe(3);
    expect(config.blockDurationMs).toBe(1800000);
    expect(config.hardBlockDurationMs).toBe(86400000);
  });

  it('falls back to defaults when env strings are empty', () => {
    vi.stubEnv('VITE_ADMIN_USERNAME', '   ');
    vi.stubEnv('VITE_ADMIN_PASSWORD_HASH', '   ');

    const config = getAdminSecurityConfig();

    expect(config.username).toBe(DEFAULT_USERNAME);
    expect(config.passwordHash).toBe(DEFAULT_HASH);
  });

  it('falls back to defaults when numeric env values are invalid', () => {
    vi.stubEnv('VITE_ADMIN_SESSION_TTL_MS', 'abc');
    vi.stubEnv('VITE_ADMIN_MAX_ATTEMPTS', '0');
    vi.stubEnv('VITE_ADMIN_BLOCK_MS', '-42');
    vi.stubEnv('VITE_ADMIN_HARD_BLOCK_MS', '');

    const config = getAdminSecurityConfig();

    expect(config.sessionTtlMs).toBe(1800000);
    expect(config.maxAttempts).toBe(3);
    expect(config.blockDurationMs).toBe(1800000);
    expect(config.hardBlockDurationMs).toBe(86400000);
  });

  it('normalizes hash to lowercase when env hash contains uppercase chars', () => {
    vi.stubEnv('VITE_ADMIN_PASSWORD_HASH', PASSWORD_HASH.toUpperCase());

    const config = getAdminSecurityConfig();
    expect(config.passwordHash).toBe(PASSWORD_HASH);
  });
});

describe('verifyAdminCredentials', () => {
  it('accepts valid credentials and rejects invalid ones', async () => {
    await expect(verifyAdminCredentials(DEFAULT_USERNAME, PASSWORD)).resolves.toBe(true);
    await expect(verifyAdminCredentials('wrong-user', PASSWORD)).resolves.toBe(false);
    await expect(verifyAdminCredentials(DEFAULT_USERNAME, 'wrong-password')).resolves.toBe(false);
  });
});

describe('rate limit policy', () => {
  it('applies soft block after 3 failed attempts then hard block on next failed attempt', () => {
    const first = registerFailedAttempt();
    expect(first.isBlocked).toBe(false);
    expect(first.remainingAttempts).toBe(2);

    const second = registerFailedAttempt();
    expect(second.isBlocked).toBe(false);
    expect(second.remainingAttempts).toBe(1);

    const third = registerFailedAttempt();
    expect(third.isBlocked).toBe(true);
    expect(third.blockLevel).toBe('soft');
    expect(third.blockedMs).toBeGreaterThan(0);

    vi.advanceTimersByTime(1800000 + 1);

    const afterSoftBlock = registerFailedAttempt();
    expect(afterSoftBlock.isBlocked).toBe(true);
    expect(afterSoftBlock.blockLevel).toBe('hard');
    expect(afterSoftBlock.blockedMs).toBeGreaterThan(86000000);
  });

  it('resets failed attempts when cleared', () => {
    registerFailedAttempt();
    clearFailedAttempts();

    const info = getRateLimitInfo();
    expect(info.isBlocked).toBe(false);
    expect(info.blockLevel).toBe('none');
    expect(info.remainingAttempts).toBe(3);
  });
});

describe('session lifecycle', () => {
  it('starts, expires and clears session', () => {
    startAdminSession();
    expect(isAdminSessionValid()).toBe(true);
    expect(getAdminSessionRemainingMs()).toBeGreaterThan(0);

    vi.advanceTimersByTime(1800000 + 1);
    expect(isAdminSessionValid()).toBe(false);
    expect(getAdminSessionRemainingMs()).toBe(0);

    startAdminSession();
    expect(isAdminSessionValid()).toBe(true);
    clearAdminSession();
    expect(isAdminSessionValid()).toBe(false);
  });
});
