// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyConsentToScripts, clearConsentScripts } from '@/features/consent/scriptManager';
import { GOOGLE_FC_CONSENT_MODE_STATUS } from '@/features/cmp/googleConsentMode';
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
    const state = initAdsRuntime({
      provider: 'none',
      adsenseClient: '',
    });

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

  it('loads the AdSense bootstrap immediately in advanced CMP mode and updates runtime on consent callbacks', () => {
    const googlefc = {
      callbackQueue: [],
      getGoogleConsentModeValues: () => ({
        adStoragePurposeConsentStatus: GOOGLE_FC_CONSENT_MODE_STATUS.GRANTED,
        analyticsStoragePurposeConsentStatus: GOOGLE_FC_CONSENT_MODE_STATUS.DENIED,
        adUserDataPurposeConsentStatus: GOOGLE_FC_CONSENT_MODE_STATUS.GRANTED,
        adPersonalizationPurposeConsentStatus: GOOGLE_FC_CONSENT_MODE_STATUS.GRANTED,
      }),
    };
    window.googlefc = googlefc;

    initAdsRuntime({
      provider: 'adsense',
      adsenseClient: 'ca-pub-1234567890',
      managedConsent: true,
    });

    const script = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    expect(script).not.toBeNull();
    expect(script?.src).toContain('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
    expect(script?.crossOrigin).toBe('anonymous');
    expect(script?.getAttribute('data-consent-category')).toBeNull();
    expect(googlefc.callbackQueue).toHaveLength(1);

    googlefc.callbackQueue[0].CONSENT_MODE_DATA_READY();

    expect(getAdsRuntimeState()).toMatchObject({
      source: 'cmp',
      adsAllowed: true,
      analyticsAllowed: false,
      consentStatuses: {
        ad_storage: GOOGLE_FC_CONSENT_MODE_STATUS.GRANTED,
        ad_user_data: GOOGLE_FC_CONSENT_MODE_STATUS.GRANTED,
        ad_personalization: GOOGLE_FC_CONSENT_MODE_STATUS.GRANTED,
        analytics_storage: GOOGLE_FC_CONSENT_MODE_STATUS.DENIED,
      },
    });
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
      source: 'local',
    });
  });
});
