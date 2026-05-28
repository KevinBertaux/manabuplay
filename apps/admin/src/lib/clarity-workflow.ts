export const MICROSOFT_CLARITY_APP_URL = "https://clarity.microsoft.com/";

export const CLARITY_SETUP_CHECKLIST = [
  {
    id: "legal",
    fr: "Pages légales / privacy à jour (Clarity + waitlist prod décrits) — fait sur la branche.",
    en: "Legal / privacy pages updated (Clarity + production waitlist described) — done on branch.",
  },
  {
    id: "env",
    fr: "Définir PUBLIC_CLARITY_PROJECT_ID sur Netlify (deploy prod). Sans variable, la bannière analytics ne s’affiche pas.",
    en: "Set PUBLIC_CLARITY_PROJECT_ID on Netlify (production deploy). Without it, the analytics banner does not appear.",
  },
  {
    id: "deploy",
    fr: "Premier deploy prod à jour (landing + waitlist + pages légales).",
    en: "First production deploy is up to date (landing + waitlist + legal pages).",
  },
  {
    id: "waitlist-smoke",
    fr: "Smoke Netlify Forms waitlist validé (deploy pré-prod, notification mail reçue).",
    en: "Netlify Forms waitlist smoke test passed (pre-production deploy, notification email received).",
  },
  {
    id: "verify",
    fr: "Accepter la bannière cookies sur le site live, puis vérifier les sessions dans le dashboard Clarity.",
    en: "Accept the cookie banner on the live site, then verify sessions in the Clarity dashboard.",
  },
] as const;

export const CLARITY_ENV_VAR = "PUBLIC_CLARITY_PROJECT_ID";

export const CLARITY_TOUCH_FILES = [
  "apps/web/public/scripts/analytics-clarity.js",
  "apps/web/src/scripts/public-analytics.ts",
  "apps/web/src/layouts/PublicLayout.astro",
  "shared/data/manabuplay/legal-copy.ts",
] as const;
