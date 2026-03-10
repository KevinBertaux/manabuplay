const registry = new Map();
let booted = false;

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function createDescriptorFromScript(scriptEl) {
  return {
    id: scriptEl.id || `consent-script-${registry.size + 1}`,
    category: scriptEl.dataset.consentCategory || 'ads',
    src: scriptEl.src || '',
    content: scriptEl.src ? '' : scriptEl.textContent ?? '',
    async: scriptEl.async,
    defer: scriptEl.defer,
    type: scriptEl.type && scriptEl.type !== 'text/plain' ? scriptEl.type : 'text/javascript',
    parentSelector: scriptEl.parentElement ? getSelector(scriptEl.parentElement) : 'head',
    injectedNode: null,
  };
}

function getSelector(node) {
  if (!node || !node.tagName) return 'head';
  if (node.id) {
    return `#${node.id}`;
  }
  return node.tagName.toLowerCase();
}

export function bootConsentScriptRegistry() {
  if (!isBrowser() || booted) {
    return;
  }
  const scriptNodes = document.querySelectorAll('script[data-consent-category]');
  scriptNodes.forEach((node) => {
    const descriptor = createDescriptorFromScript(node);
    registry.set(descriptor.id, descriptor);
    node.remove();
  });
  booted = true;
}

export function registerConsentScript(descriptor) {
  if (!descriptor || !descriptor.id) {
    throw new Error('registerConsentScript requires an id');
  }
  registry.set(descriptor.id, {
    ...descriptor,
    injectedNode: null,
  });
}

export function applyConsentToScripts(selections = {}) {
  if (!isBrowser()) {
    return;
  }

  registry.forEach((descriptor) => {
    const allowed = Boolean(selections[descriptor.category]);
    if (!allowed && descriptor.injectedNode) {
      descriptor.injectedNode.remove();
      descriptor.injectedNode = null;
    } else if (allowed && !descriptor.injectedNode) {
      const target =
        (descriptor.parentSelector && document.querySelector(descriptor.parentSelector)) || document.head;
      const scriptEl = document.createElement('script');
      if (descriptor.src) {
        scriptEl.src = descriptor.src;
      } else {
        scriptEl.textContent = descriptor.content;
      }
      scriptEl.async = descriptor.async ?? true;
      scriptEl.defer = descriptor.defer ?? false;
      scriptEl.type = descriptor.type || 'text/javascript';
      scriptEl.dataset.consentCategory = descriptor.category;
      target.appendChild(scriptEl);
      descriptor.injectedNode = scriptEl;
    }
  });
}

export function clearConsentScripts() {
  registry.forEach((descriptor) => {
    if (descriptor.injectedNode) {
      descriptor.injectedNode.remove();
      descriptor.injectedNode = null;
    }
  });
  registry.clear();
  booted = false;
}
