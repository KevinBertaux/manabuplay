const ADMIN_SOURCE = "manabu-admin-dashboard";
const BRIDGE_SOURCE = "manabu-web-storage-bridge";
const PUBLIC_PORT = "4321";
const BRIDGE_PATH = "/internal/storage-bridge/";
const REQUEST_TIMEOUT_MS = 4000;

let bridgeFramePromise = null;
let bridgeReadyPromise = null;
let requestCounter = 0;
const pendingRequests = new Map();

function getPublicOrigin() {
  return `${window.location.protocol}//${window.location.hostname}:${PUBLIC_PORT}`;
}

function getBridgeUrl() {
  return `${getPublicOrigin()}${BRIDGE_PATH}`;
}

function handleBridgeMessage(event) {
  if (event.origin !== getPublicOrigin()) {
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

function ensureBridgeFrame() {
  if (bridgeFramePromise) {
    return bridgeFramePromise;
  }

  bridgeFramePromise = new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.src = getBridgeUrl();
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
      reject(new Error(`Bridge iframe not reachable at ${getBridgeUrl()}`));
    }, REQUEST_TIMEOUT_MS);

    iframe.addEventListener("load", () => {
      window.clearTimeout(timer);
      resolve(iframe);
    }, { once: true });

    document.body.appendChild(iframe);
  });

  return bridgeFramePromise;
}

function sendBridgeRequest(iframe, action, payload) {
  return new Promise((resolve, reject) => {
    const requestId = `bridge_${Date.now()}_${++requestCounter}`;
    const timer = window.setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error(`Bridge request timed out for action "${action}"`));
    }, REQUEST_TIMEOUT_MS);

    pendingRequests.set(requestId, { resolve, reject, timer });

    iframe.contentWindow?.postMessage(
      {
        source: ADMIN_SOURCE,
        requestId,
        action,
        payload,
      },
      getPublicOrigin(),
    );
  });
}

async function ensureBridgeReady() {
  if (!bridgeReadyPromise) {
    bridgeReadyPromise = (async () => {
      const iframe = await ensureBridgeFrame();
      await sendBridgeRequest(iframe, "ping");
      return iframe;
    })();
  }

  return bridgeReadyPromise;
}

export async function requestPublicStorage(action, payload) {
  const iframe = await ensureBridgeReady();
  return sendBridgeRequest(iframe, action, payload);
}

export function getPublicStorageOrigin() {
  return getPublicOrigin();
}
