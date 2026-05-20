export const MICROSOFT_CLARITY_APP_URL = "https://clarity.microsoft.com/";

export const CLARITY_SETUP_CHECKLIST = [
  {
    id: "deploy",
    fr: "Premier deploy prod à jour (landing + waitlist + pages légales).",
    en: "First production deploy is up to date (landing + waitlist + legal pages).",
  },
  {
    id: "waitlist-smoke",
    fr: "Smoke Netlify Forms sur la waitlist prod.",
    en: "Netlify Forms smoke test on production waitlist.",
  },
  {
    id: "script",
    fr: "Ajouter le script Clarity (apps/web/public/scripts/analytics*.js) et l’inclure sur les pages publiques.",
    en: "Add the Clarity script (apps/web/public/scripts/analytics*.js) and include it on public pages.",
  },
  {
    id: "privacy",
    fr: "Mettre à jour privacy + consentement (mention Clarity / cookies analytics si besoin).",
    en: "Update privacy + consent copy (mention Clarity / analytics cookies if needed).",
  },
  {
    id: "verify",
    fr: "Vérifier l’enregistrement des sessions dans le dashboard Clarity.",
    en: "Verify session recording in the Clarity dashboard.",
  },
] as const;

export const CLARITY_TOUCH_FILES = [
  "apps/web/public/scripts/analytics*.js",
  "apps/web/src/pages/[locale]/index.astro",
  "shared/data/manabuplay/legal-copy.ts",
  "apps/web/src/pages/[locale]/privacy.astro",
] as const;
