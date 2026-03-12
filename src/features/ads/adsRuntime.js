import { registerConsentScript } from '@/features/consent/scriptManager';
import { ADS_RUNTIME_KEY, resolveAdsProviderConfig } from './adsConfig';
import { buildAdsConsentSnapshot } from './consentBridge';

let initializedProviderId = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

function buildAdsScriptDescriptor(providerConfig) {
  if (!providerConfig.script) {
    return null;
  }

  return {
    id: providerConfig.script.id || `${providerConfig.id}-bootstrap`,
    category: providerConfig.consentCategory || 'ads',
    src: providerConfig.script.src,
    async: providerConfig.script.async ?? true,
    defer: providerConfig.script.defer ?? false,
    parentSelector: providerConfig.script.parentSelector || 'head',
  };
}

function writeRuntimeState(nextState) {
  if (!isBrowser()) {
    return nextState;
  }

  const previousState = window[ADS_RUNTIME_KEY] || {};
  const runtimeState = {
    ...previousState,
    ...nextState,
  };
  window[ADS_RUNTIME_KEY] = runtimeState;
  return runtimeState;
}

export function initAdsRuntime(options = {}) {
  const providerConfig = resolveAdsProviderConfig(options);
  const descriptor = buildAdsScriptDescriptor(providerConfig);

  if (initializedProviderId === providerConfig.id) {
    return writeRuntimeState({
      provider: providerConfig.id,
      enabled: providerConfig.enabled,
      scriptRegistered: Boolean(descriptor),
    });
  }

  if (descriptor) {
    registerConsentScript(descriptor);
  }

  initializedProviderId = providerConfig.id;

  return writeRuntimeState({
    provider: providerConfig.id,
    enabled: providerConfig.enabled,
    scriptRegistered: Boolean(descriptor),
  });
}

export function syncAdsConsent(selections = {}, gtag = isBrowser() ? window.gtag : undefined) {
  const snapshot = buildAdsConsentSnapshot(selections);
  const runtimeState = writeRuntimeState({
    consent: snapshot.googleConsent,
    adsAllowed: snapshot.adsAllowed,
    analyticsAllowed: snapshot.analyticsAllowed,
    updatedAt: new Date().toISOString(),
  });

  if (typeof gtag === 'function') {
    gtag('consent', 'update', snapshot.googleConsent);
  }

  return {
    ...snapshot,
    runtimeState,
  };
}

export function getAdsRuntimeState() {
  if (!isBrowser()) {
    return null;
  }
  return window[ADS_RUNTIME_KEY] || null;
}

export function resetAdsRuntimeForTests() {
  initializedProviderId = null;
  if (isBrowser()) {
    delete window[ADS_RUNTIME_KEY];
  }
}
