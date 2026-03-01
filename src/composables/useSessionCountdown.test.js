import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const lifecycle = {
  mounted: [],
  unmounted: [],
};

vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: (callback) => {
      lifecycle.mounted.push(callback);
    },
    onUnmounted: (callback) => {
      lifecycle.unmounted.push(callback);
    },
  };
});

import { useSessionCountdown } from './useSessionCountdown';

let originalWindow;

beforeEach(() => {
  originalWindow = globalThis.window;
  lifecycle.mounted = [];
  lifecycle.unmounted = [];
});

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: originalWindow,
  });
});

describe('useSessionCountdown', () => {
  it('updates remainingMs and triggers onExpire only once per expiration cycle', () => {
    let remaining = 1_200;
    const onExpire = vi.fn();
    const countdown = useSessionCountdown({
      getRemainingMs: () => remaining,
      onExpire,
    });

    countdown.tick();
    expect(countdown.remainingMs.value).toBe(1200);
    expect(onExpire).not.toHaveBeenCalled();

    remaining = 0;
    countdown.tick();
    countdown.tick();
    expect(onExpire).toHaveBeenCalledTimes(1);

    remaining = 500;
    countdown.tick();
    expect(countdown.remainingMs.value).toBe(500);

    remaining = 0;
    countdown.tick();
    expect(onExpire).toHaveBeenCalledTimes(2);
  });

  it('starts interval polling and clears it on stop', () => {
    vi.useFakeTimers();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        setInterval,
        clearInterval,
      },
    });

    let remaining = 3_000;
    const onExpire = vi.fn();
    const countdown = useSessionCountdown({
      getRemainingMs: () => remaining,
      intervalMs: 500,
      onExpire,
    });

    for (const callback of lifecycle.mounted) {
      callback();
    }
    expect(countdown.remainingMs.value).toBe(3000);

    remaining = 0;
    vi.advanceTimersByTime(500);
    expect(onExpire).toHaveBeenCalledTimes(1);

    for (const callback of lifecycle.unmounted) {
      callback();
    }
    vi.advanceTimersByTime(1_000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
