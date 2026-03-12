export const GOOGLE_CONSENT_GRANTED = 'granted';
export const GOOGLE_CONSENT_DENIED = 'denied';

function toGoogleConsentValue(isGranted) {
  return isGranted ? GOOGLE_CONSENT_GRANTED : GOOGLE_CONSENT_DENIED;
}

export function mapConsentToGoogleConsentState(selections = {}) {
  const adsGranted = Boolean(selections.ads);
  const analyticsGranted = Boolean(selections.analytics);

  return {
    ad_storage: toGoogleConsentValue(adsGranted),
    analytics_storage: toGoogleConsentValue(analyticsGranted),
    ad_user_data: toGoogleConsentValue(adsGranted),
    ad_personalization: toGoogleConsentValue(adsGranted),
  };
}

export function canServeAds(selections = {}) {
  return Boolean(selections.ads);
}

export function buildAdsConsentSnapshot(selections = {}) {
  return {
    adsAllowed: canServeAds(selections),
    analyticsAllowed: Boolean(selections.analytics),
    googleConsent: mapConsentToGoogleConsentState(selections),
  };
}
