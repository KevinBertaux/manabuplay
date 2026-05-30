export const MICROSOFT_CLARITY_APP_URL = "https://clarity.microsoft.com/";

export const CLARITY_SETUP_CHECKLIST = [
  {
    id: "legal",
    fr: "Pages légales / privacy à jour (Clarity + waitlist prod décrits) — fait.",
    en: "Legal / privacy pages updated (Clarity + production waitlist described) — done.",
  },
  {
    id: "env",
    fr: "PUBLIC_CLARITY_PROJECT_ID défini sur Netlify (deploy prod / main) — fait.",
    en: "PUBLIC_CLARITY_PROJECT_ID set on Netlify (production deploy / main) — done.",
  },
  {
    id: "deploy",
    fr: "Deploy prod à jour (landing + waitlist + pages légales) — fait.",
    en: "Production deploy up to date (landing + waitlist + legal pages) — done.",
  },
  {
    id: "waitlist-smoke",
    fr: "Smoke Netlify Forms waitlist validé (deploy pré-prod, notification mail reçue).",
    en: "Netlify Forms waitlist smoke test passed (pre-production deploy, notification email received).",
  },
  {
    id: "verify",
    fr: "Rapports de visites Clarity reçus — mesure active en prod.",
    en: "Clarity visit reports received — measurement active in production.",
  },
] as const;

export const CLARITY_ENV_VAR = "PUBLIC_CLARITY_PROJECT_ID";

export const CLARITY_TOUCH_FILES = [
  "apps/web/public/scripts/analytics-clarity.js",
  "apps/web/src/scripts/public-analytics.ts",
  "apps/web/src/layouts/PublicLayout.astro",
  "shared/data/manabuplay/legal-copy.ts",
] as const;
