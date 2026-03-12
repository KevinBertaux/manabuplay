import { describe, expect, it } from 'vitest';
import { buildAdsConsentSnapshot, canServeAds, mapConsentToGoogleConsentState } from './consentBridge';

describe('consentBridge', () => {
  it('maps denied consent by default', () => {
    expect(mapConsentToGoogleConsentState()).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('keeps analytics and ads consent separate', () => {
    expect(mapConsentToGoogleConsentState({ analytics: true, ads: false })).toEqual({
      ad_storage: 'denied',
      analytics_storage: 'granted',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('builds an ads snapshot for downstream runtimes', () => {
    expect(buildAdsConsentSnapshot({ analytics: true, ads: true })).toEqual({
      adsAllowed: true,
      analyticsAllowed: true,
      googleConsent: {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      },
    });
    expect(canServeAds({ ads: false })).toBe(false);
  });
});
