export const CMP_PROVIDERS = Object.freeze({
  NONE: 'none',
  GOOGLE_PRIVACY_MESSAGING: 'google_privacy_messaging',
});

export function resolveCmpProviderConfig(options = {}) {
  const provider = String(options.provider ?? import.meta.env.VITE_CMP_PROVIDER ?? CMP_PROVIDERS.NONE)
    .trim()
    .toLowerCase();

  switch (provider) {
    case CMP_PROVIDERS.GOOGLE_PRIVACY_MESSAGING:
      return {
        id: CMP_PROVIDERS.GOOGLE_PRIVACY_MESSAGING,
        enabled: true,
        managedConsent: true,
      };
    default:
      return {
        id: CMP_PROVIDERS.NONE,
        enabled: false,
        managedConsent: false,
      };
  }
}

export function isCmpManagedConsentEnabled(options = {}) {
  return resolveCmpProviderConfig(options).managedConsent;
}
