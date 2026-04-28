const ADMIN_SOURCE = "manabu-admin-dashboard";
const BRIDGE_SOURCE = "manabu-web-storage-bridge";
const PUBLIC_PORT = "4321";
const TEST_ADMIN_PORT = "4175";
const TEST_PUBLIC_PORT = "4176";
const BRIDGE_PATH = "/internal/storage-bridge/";
const REQUEST_TIMEOUT_MS = 4000;

let bridgeFramePromise: Promise<HTMLIFrameElement> | null = null;
let bridgeReadyPromise: Promise<HTMLIFrameElement> | null = null;
let requestCounter = 0;
let activePublicOrigin: string | null = null;
const pendingRequests = new Map<
  string,
  {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
    timer: number;
  }
>();

function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  );
}

function getOriginCandidates(port: string): string[] {
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

  return hosts.map((host) => `${protocol}//${host}:${port}`);
}

function getPublicOriginCandidates(): string[] {
  const port = window.location.port === TEST_ADMIN_PORT ? TEST_PUBLIC_PORT : PUBLIC_PORT;

  return getOriginCandidates(port);
}

function getPublicOrigin(): string {
  return activePublicOrigin || getPublicOriginCandidates()[0];
}

function getBridgeUrl(origin: string): string {
  return `${origin}${BRIDGE_PATH}`;
}

function handleBridgeMessage(event: MessageEvent): void {
  if (!getPublicOriginCandidates().includes(event.origin)) {
    return;
  }

  const message = event.data;
  if (!message || message.source !== BRIDGE_SOURCE || !message.requestId) {
    return;
  }

  const request = pendingRequests.get(message.requestId);
  if (!request) {
    return;
  }

  window.clearTimeout(request.timer);
  pendingRequests.delete(message.requestId);

  if (message.ok) {
    request.resolve(message.data);
    return;
  }

  request.reject(new Error(message.error || "Public storage bridge error"));
}

window.addEventListener("message", handleBridgeMessage);

function mountBridgeFrame(origin: string): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.src = getBridgeUrl(origin);
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.style.position = "fixed";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.border = "0";
    iframe.style.bottom = "0";
    iframe.style.right = "0";

    const timer = window.setTimeout(() => {
      iframe.remove();
      reject(new Error(`Bridge iframe not reachable at ${getBridgeUrl(origin)}`));
    }, REQUEST_TIMEOUT_MS);

    iframe.addEventListener(
      "load",
      () => {
        window.clearTimeout(timer);
        resolve(iframe);
      },
      { once: true },
    );

    document.body.appendChild(iframe);
  });
}

function sendBridgeRequest<T = unknown>(
  iframe: HTMLIFrameElement,
  action: string,
  payload?: unknown,
  origin = getPublicOrigin(),
): Promise<T> {
  return new Promise((resolve, reject) => {
    const requestId = `bridge_${Date.now()}_${++requestCounter}`;
    const timer = window.setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error(`Bridge request timed out for action "${action}"`));
    }, REQUEST_TIMEOUT_MS);

    pendingRequests.set(requestId, {
      resolve: (value) => resolve(value as T),
      reject,
      timer,
    });

    iframe.contentWindow?.postMessage(
      {
        source: ADMIN_SOURCE,
        requestId,
        action,
        payload,
      },
      origin,
    );
  });
}

async function ensureBridgeFrame(): Promise<HTMLIFrameElement> {
  if (bridgeFramePromise) {
    return bridgeFramePromise;
  }

  bridgeFramePromise = (async () => {
    let lastError: unknown = null;

    for (const origin of getPublicOriginCandidates()) {
      try {
        const iframe = await mountBridgeFrame(origin);
        try {
          await sendBridgeRequest(iframe, "ping", undefined, origin);
          activePublicOrigin = origin;
          return iframe;
        } catch (error) {
          iframe.remove();
          lastError = error;
        }
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Public storage bridge unavailable.");
  })();

  try {
    return await bridgeFramePromise;
  } catch (error) {
    bridgeFramePromise = null;
    throw error;
  }
}

async function ensureBridgeReady(): Promise<HTMLIFrameElement> {
  if (!bridgeReadyPromise) {
    bridgeReadyPromise = ensureBridgeFrame();
  }

  try {
    return await bridgeReadyPromise;
  } catch (error) {
    bridgeReadyPromise = null;
    throw error;
  }
}

export async function requestPublicStorage<T = unknown>(
  action: string,
  payload?: unknown,
): Promise<T> {
  const iframe = await ensureBridgeReady();
  return sendBridgeRequest<T>(iframe, action, payload);
}

export function getPublicStorageOrigin(): string {
  return getPublicOrigin();
}
