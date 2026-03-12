import { registerConsentScript } from '@/features/consent/scriptManager';
import { buildManagedCmpConsentSnapshot } from '@/features/cmp/googleConsentMode';
import { ADS_RUNTIME_KEY, resolveAdsProviderConfig } from './adsConfig';
import { buildAdsConsentSnapshot } from './consentBridge';

let initializedProviderId = null;
let managedConsentModeSubscribed = false;
let managedInjectedScript = null;

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
    crossOrigin: providerConfig.script.crossOrigin || null,
    parentSelector: providerConfig.script.parentSelector || 'head',
  };
}

function injectManagedScript(descriptor) {
  if (!isBrowser() || !descriptor || managedInjectedScript) {
    return managedInjectedScript;
  }

  const target =
    (descriptor.parentSelector && document.querySelector(descriptor.parentSelector)) || document.head;
  const scriptEl = document.createElement('script');
  scriptEl.async = descriptor.async ?? true;
  scriptEl.defer = descriptor.defer ?? false;
  if (descriptor.category) {
    scriptEl.dataset.consentCategory = descriptor.category;
  }
  if (descriptor.crossOrigin) {
    scriptEl.crossOrigin = descriptor.crossOrigin;
  }
  if (descriptor.src) {
    scriptEl.src = descriptor.src;
  } else {
    scriptEl.textContent = descriptor.content || '';
  }
  target.appendChild(scriptEl);
  managedInjectedScript = scriptEl;
  return managedInjectedScript;
}

function removeManagedScript() {
  if (managedInjectedScript) {
    managedInjectedScript.remove();
    managedInjectedScript = null;
  }
}

function syncAdsConsentFromCmp(googlefc = isBrowser() ? window.googlefc : undefined, gtag = isBrowser() ? window.gtag : undefined) {
  const values =
    typeof googlefc?.getGoogleConsentModeValues === 'function' ? googlefc.getGoogleConsentModeValues() : {};
  const snapshot = buildManagedCmpConsentSnapshot(values);
  const runtimeState = writeRuntimeState({
    consent: snapshot.googleConsent,
    rawConsent: snapshot.rawValues,
    consentStatuses: snapshot.purposeStatuses,
    adsAllowed: snapshot.adsAllowed,
    analyticsAllowed: snapshot.analyticsAllowed,
    source: 'cmp',
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

function registerManagedConsentSubscription(googlefc = isBrowser() ? window.googlefc : undefined) {
  if (!isBrowser() || !googlefc || !Array.isArray(googlefc.callbackQueue) || managedConsentModeSubscribed) {
    return;
  }

  googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: () => {
      syncAdsConsentFromCmp(window.googlefc, window.gtag);
    },
  });
  managedConsentModeSubscribed = true;
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
  const managedConsent = Boolean(options.managedConsent);

  if (initializedProviderId === providerConfig.id) {
    return writeRuntimeState({
      provider: providerConfig.id,
      enabled: providerConfig.enabled,
      scriptRegistered: Boolean(descriptor),
      managedConsent,
    });
  }

  if (descriptor && managedConsent) {
    injectManagedScript({ ...descriptor, category: null });
    registerManagedConsentSubscription();
    const initialSnapshot = buildManagedCmpConsentSnapshot();
    writeRuntimeState({
      consent: initialSnapshot.googleConsent,
      rawConsent: initialSnapshot.rawValues,
      consentStatuses: initialSnapshot.purposeStatuses,
      adsAllowed: initialSnapshot.adsAllowed,
      analyticsAllowed: initialSnapshot.analyticsAllowed,
      source: 'cmp',
      updatedAt: new Date().toISOString(),
    });
    if (typeof window.googlefc?.getGoogleConsentModeValues === 'function') {
      syncAdsConsentFromCmp(window.googlefc, window.gtag);
    }
  } else if (descriptor) {
    registerConsentScript(descriptor);
  }

  initializedProviderId = providerConfig.id;

  return writeRuntimeState({
    provider: providerConfig.id,
    enabled: providerConfig.enabled,
    scriptRegistered: Boolean(descriptor),
    managedConsent,
  });
}

export function syncAdsConsent(selections = {}, gtag = isBrowser() ? window.gtag : undefined) {
  const snapshot = buildAdsConsentSnapshot(selections);
  const runtimeState = writeRuntimeState({
    consent: snapshot.googleConsent,
    adsAllowed: snapshot.adsAllowed,
    analyticsAllowed: snapshot.analyticsAllowed,
    source: 'local',
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
  managedConsentModeSubscribed = false;
  removeManagedScript();
  if (isBrowser()) {
    delete window[ADS_RUNTIME_KEY];
  }
}
