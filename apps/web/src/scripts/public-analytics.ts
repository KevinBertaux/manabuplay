const CONSENT_STORAGE_KEY = "mp_analytics_consent";

type AnalyticsConsent = "accepted" | "refused";

const COPY = {
  fr: {
    title: "Cookies analytics",
    body: "Nous utilisons Microsoft Clarity pour améliorer le site. Tu peux accepter ou refuser — le quiz et l'inscription email ne sont pas bloqués.",
    accept: "Accepter",
    refuse: "Refuser",
    privacyLabel: "Politique de confidentialité",
  },
  en: {
    title: "Analytics cookies",
    body: "We use Microsoft Clarity to improve the site. You can accept or refuse — the quiz and email signup still work.",
    accept: "Accept",
    refuse: "Decline",
    privacyLabel: "Privacy Policy",
  },
} as const;

function getLocale(): keyof typeof COPY {
  return document.documentElement.lang === "fr" ? "fr" : "en";
}

function getProjectId(): string {
  return document.body.dataset.clarityProjectId?.trim() || "";
}

function readConsent(): AnalyticsConsent | null {
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "accepted" || value === "refused" ? value : null;
}

function writeConsent(value: AnalyticsConsent) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
}

function loadClarity(projectId: string) {
  if (document.querySelector("script[data-clarity-loader]")) {
    return;
  }
  const script = document.createElement("script");
  script.src = "/scripts/analytics-clarity.js";
  script.defer = true;
  script.dataset.projectId = projectId;
  script.dataset.clarityLoader = "true";
  document.head.append(script);
}

function getPrivacyPath(locale: keyof typeof COPY): string {
  return locale === "fr" ? "/fr/privacy/" : "/en/privacy/";
}

function removeConsentBanner() {
  document.querySelector(".public-analytics-consent")?.remove();
}

function showConsentBanner(projectId: string) {
  const locale = getLocale();
  const strings = COPY[locale];
  const privacyPath = getPrivacyPath(locale);

  removeConsentBanner();

  const banner = document.createElement("aside");
  banner.className = "public-analytics-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", strings.title);

  const title = document.createElement("p");
  title.className = "public-analytics-consent-title";
  title.textContent = strings.title;

  const body = document.createElement("p");
  body.className = "public-analytics-consent-copy";
  body.textContent = strings.body;

  const privacy = document.createElement("a");
  privacy.className = "public-analytics-consent-link";
  privacy.href = privacyPath;
  privacy.textContent = strings.privacyLabel;

  const actions = document.createElement("div");
  actions.className = "public-analytics-consent-actions";

  const acceptButton = document.createElement("button");
  acceptButton.type = "button";
  acceptButton.className = "public-analytics-consent-accept";
  acceptButton.textContent = strings.accept;

  const refuseButton = document.createElement("button");
  refuseButton.type = "button";
  refuseButton.className = "public-analytics-consent-refuse";
  refuseButton.textContent = strings.refuse;

  acceptButton.addEventListener("click", () => {
    writeConsent("accepted");
    banner.remove();
    loadClarity(projectId);
  });

  refuseButton.addEventListener("click", () => {
    writeConsent("refused");
    banner.remove();
  });

  actions.append(refuseButton, acceptButton);
  banner.append(title, body, privacy, actions);
  document.body.append(banner);
}

export function openAnalyticsConsentPreferences() {
  const projectId = getProjectId();
  if (!projectId) {
    return;
  }
  showConsentBanner(projectId);
}

function bindConsentPreferencesTriggers() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (!target.closest("[data-open-analytics-consent]")) {
      return;
    }
    event.preventDefault();
    openAnalyticsConsentPreferences();
  });
}

function initPublicAnalytics() {
  const projectId = getProjectId();
  bindConsentPreferencesTriggers();

  if (!projectId) {
    return;
  }

  const consent = readConsent();
  if (consent === "accepted") {
    loadClarity(projectId);
    return;
  }
  if (consent === "refused") {
    return;
  }

  showConsentBanner(projectId);
}

initPublicAnalytics();
