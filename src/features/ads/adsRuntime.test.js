// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyConsentToScripts, clearConsentScripts } from '@/features/consent/scriptManager';
import { getAdsRuntimeState, initAdsRuntime, resetAdsRuntimeForTests, syncAdsConsent } from './adsRuntime';

describe('adsRuntime', () => {
  beforeEach(() => {
    clearConsentScripts();
    resetAdsRuntimeForTests();
    delete window.gtag;
  });

  afterEach(() => {
    clearConsentScripts();
    resetAdsRuntimeForTests();
    delete window.gtag;
  });

  it('stays disabled when no ad provider is configured', () => {
    const state = initAdsRuntime();

    expect(state).toMatchObject({
      provider: 'none',
      enabled: false,
      scriptRegistered: false,
    });
    expect(document.querySelector('script[data-consent-category="ads"]')).toBeNull();
  });

  it('registers a consent-gated bootstrap script when AdSense is configured', () => {
    initAdsRuntime({
      provider: 'adsense',
      adsenseClient: 'ca-pub-1234567890',
    });

    expect(document.querySelector('script[data-consent-category="ads"]')).toBeNull();

    applyConsentToScripts({ ads: true });

    const script = document.querySelector('script[data-consent-category="ads"]');
    expect(script).not.toBeNull();
    expect(script?.src).toContain('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
    expect(script?.src).toContain('client=ca-pub-1234567890');
  });

  it('syncs Google Consent Mode compatible state and updates gtag when available', () => {
    const gtag = vi.fn();

    const snapshot = syncAdsConsent(
      {
        necessary: true,
        analytics: true,
        ads: false,
      },
      gtag
    );

    expect(snapshot.adsAllowed).toBe(false);
    expect(snapshot.analyticsAllowed).toBe(true);
    expect(snapshot.googleConsent).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'granted',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    expect(gtag).toHaveBeenCalledWith('consent', 'update', snapshot.googleConsent);
    expect(getAdsRuntimeState()).toMatchObject({
      adsAllowed: false,
      analyticsAllowed: true,
      consent: snapshot.googleConsent,
    });
  });
});
