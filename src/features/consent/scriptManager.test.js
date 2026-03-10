// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { bootConsentScriptRegistry, applyConsentToScripts, registerConsentScript, clearConsentScripts } from './scriptManager';

describe('scriptManager', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    clearConsentScripts();
    delete window.__adsRuntime;
    delete window.__adScriptLoaded;
  });

  it('removes deferred scripts until consent is granted', () => {
    const blocked = document.createElement('script');
    blocked.dataset.consentCategory = 'ads';
    blocked.textContent = 'window.__adScriptLoaded = true;';
    blocked.id = 'ads-script';
    document.head.appendChild(blocked);

    bootConsentScriptRegistry();
    expect(document.getElementById('ads-script')).toBeNull();

    applyConsentToScripts({ ads: true });
    const restored = document.querySelector('script[data-consent-category="ads"]');
    expect(restored).not.toBeNull();
  });

  it('supports runtime registrations and removes scripts when consent is revoked', () => {
    registerConsentScript({
      id: 'ads-runtime',
      category: 'ads',
      src: '',
      content: 'window.__adsRuntime = (window.__adsRuntime || 0) + 1;',
      async: true,
      defer: false,
      parentSelector: 'body',
      type: 'text/javascript',
    });

    applyConsentToScripts({ ads: true });
    expect(document.querySelectorAll('script[data-consent-category="ads"]').length).toBe(1);

    applyConsentToScripts({ ads: false });
    const stillInjected = document.querySelector('script[data-consent-category="ads"]');
    expect(stillInjected).toBeNull();
  });
});
