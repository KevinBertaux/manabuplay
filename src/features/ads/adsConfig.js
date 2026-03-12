export const ADS_RUNTIME_KEY = "__manabuAdsRuntime";

export const ADS_PROVIDER_IDS = Object.freeze({
  NONE: "none",
  ADSENSE: "adsense",
});

export const ADS_SLOT_DEFINITIONS = Object.freeze([
  {
    id: "study-rail-left",
    label: "Rail gauche d'étude",
    format: "vertical-rail",
    enabled: false,
  },
  {
    id: "study-rail-right",
    label: "Rail droit d'étude",
    format: "vertical-rail",
    enabled: false,
  },
  {
    id: "study-top-banner",
    label: "Bandeau haut d'étude",
    format: "top-banner",
    enabled: false,
  },
  {
    id: "study-bottom-banner",
    label: "Bandeau bas d'étude",
    format: "mobile-banner",
    enabled: false,
  },
]);

export function resolveAdsProviderConfig({
  provider = import.meta.env.VITE_ADS_PROVIDER || ADS_PROVIDER_IDS.NONE,
  adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT || "",
} = {}) {
  const normalizedProvider = String(provider || ADS_PROVIDER_IDS.NONE).toLowerCase();
  const normalizedClient = String(adsenseClient || "").trim();

  if (normalizedProvider === ADS_PROVIDER_IDS.ADSENSE && normalizedClient) {
    return {
      id: ADS_PROVIDER_IDS.ADSENSE,
      label: "Google AdSense",
      enabled: true,
      consentCategory: "ads",
      script: {
        id: "adsense-bootstrap",
        src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${normalizedClient}`,
        async: true,
        defer: false,
        parentSelector: "head",
      },
    };
  }

  return {
    id: ADS_PROVIDER_IDS.NONE,
    label: "Disabled",
    enabled: false,
    consentCategory: "ads",
    script: null,
  };
}