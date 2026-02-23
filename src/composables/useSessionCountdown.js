import { onMounted, onUnmounted, ref } from 'vue';

function toMs(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.floor(parsed);
}

export function useSessionCountdown({ getRemainingMs, intervalMs = 1000, onExpire } = {}) {
  const remainingMs = ref(0);
  let timerId = null;
  let hasExpired = false;

  function tick() {
    const current = toMs(typeof getRemainingMs === 'function' ? getRemainingMs() : 0);
    remainingMs.value = current;

    if (current <= 0) {
      if (!hasExpired) {
        hasExpired = true;
        if (typeof onExpire === 'function') {
          onExpire();
        }
      }
      return;
    }

    hasExpired = false;
  }

  function start() {
    stop();
    tick();
    timerId = window.setInterval(tick, intervalMs);
  }

  function stop() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  onMounted(() => {
    start();
  });

  onUnmounted(() => {
    stop();
  });

  return {
    remainingMs,
    start,
    stop,
    tick,
  };
}
