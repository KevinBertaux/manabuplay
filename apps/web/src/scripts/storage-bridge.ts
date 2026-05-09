const ADMIN_SOURCE = "manabu-admin-dashboard";
const BRIDGE_SOURCE = "manabu-web-storage-bridge";
const ADMIN_PORTS = ["4322", "4175"];
const MANABU_PREFIX = "mp_";
const WAITLIST_KEY = "mp_waitlist_submissions";
const EMAIL_SUBMITTED_KEY = "mp_email_submitted";
const PRACTICE_KEY = "mp_practice_sessions";
const LANG_KEY = "mp_lang";

type BridgeRequest = {
  source?: string;
  action?: keyof typeof actions;
  requestId?: string;
  payload?: unknown;
};

function isLoopbackHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  );
}

function getAllowedOrigins() {
  const protocol = window.location.protocol;
  const currentHost = window.location.hostname || "localhost";
  const hosts = [currentHost];

  if (isLoopbackHost(currentHost)) {
    ["localhost", "127.0.0.1"].forEach((host) => {
      if (!hosts.includes(host)) {
        hosts.push(host);
      }
    });
  }

  return hosts.flatMap((host) => ADMIN_PORTS.map((port) => `${protocol}//${host}:${port}`));
}

function getLocalStorageKeys() {
  return Object.keys(localStorage).sort();
}

function getManabuKeys() {
  return getLocalStorageKeys().filter((key) => key.startsWith(MANABU_PREFIX));
}

function safePreview(rawValue: unknown) {
  const value = String(rawValue ?? "");
  return value.length <= 96 ? value : `${value.slice(0, 93)}...`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function inspectStorage() {
  const keys = getManabuKeys();
  const practiceSessions = readJson<unknown[]>(PRACTICE_KEY, []);

  return {
    origin: window.location.origin,
    keys: keys.map((key) => {
      const raw = localStorage.getItem(key) ?? "";
      return {
        key,
        length: String(raw).length,
        preview: safePreview(raw),
      };
    }),
    manabuCount: keys.length,
    bestCount: keys.filter((key) => key.startsWith("mp_best_")).length,
    practiceCount: Array.isArray(practiceSessions) ? practiceSessions.length : 0,
  };
}

function readWaitlist() {
  const submissions = readJson<unknown[]>(WAITLIST_KEY, []);
  return {
    origin: window.location.origin,
    submissions: Array.isArray(submissions) ? submissions : [],
  };
}

function removeKeys(keys: string[]) {
  keys.forEach((key) => localStorage.removeItem(key));
}

const actions = {
  ping() {
    return { origin: window.location.origin, ready: true };
  },
  inspectStorage() {
    return inspectStorage();
  },
  readWaitlist() {
    return readWaitlist();
  },
  clearWaitlist() {
    localStorage.removeItem(WAITLIST_KEY);
    localStorage.removeItem(EMAIL_SUBMITTED_KEY);
    return readWaitlist();
  },
  clearBest() {
    removeKeys(getManabuKeys().filter((key) => key.startsWith("mp_best_")));
    return inspectStorage();
  },
  clearPractice() {
    localStorage.removeItem(PRACTICE_KEY);
    return inspectStorage();
  },
  clearLang() {
    localStorage.removeItem(LANG_KEY);
    return inspectStorage();
  },
  clearAll() {
    removeKeys(getManabuKeys());
    sessionStorage.clear();
    return inspectStorage();
  },
};

window.addEventListener("message", (event) => {
  if (!getAllowedOrigins().includes(event.origin)) {
    return;
  }

  const message = event.data as BridgeRequest;
  if (!message || message.source !== ADMIN_SOURCE || typeof message.action !== "string") {
    return;
  }

  const respond = (payload: Record<string, unknown>) => {
    event.source?.postMessage(
      {
        source: BRIDGE_SOURCE,
        requestId: message.requestId,
        ...payload,
      },
      { targetOrigin: event.origin },
    );
  };

  try {
    const handler = actions[message.action];
    if (!handler) {
      throw new Error(`Unknown bridge action: ${message.action}`);
    }

    respond({ ok: true, data: handler() });
  } catch (error) {
    respond({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown bridge error",
    });
  }
});
