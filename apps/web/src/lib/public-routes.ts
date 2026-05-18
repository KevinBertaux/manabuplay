import { PUBLIC_LOCALES, type PublicLocale } from "./public-locales";

export const PUBLIC_MODE_KEYS = ["daily", "arcade", "archives"] as const;

export type PublicModeKey = (typeof PUBLIC_MODE_KEYS)[number];

/** Locales actually built for the public web (`PUBLIC_LOCALES`). Spanish is planned, not shipped here. */
type LocalizedCopy = Record<PublicLocale, string>;

/** Link back to the localized landing page (mode routes have no other in-page "home" affordance). */
export const PUBLIC_NAV_HOME_LABEL: Record<PublicLocale, string> = {
  en: "Home",
  fr: "Accueil",
};

export const PUBLIC_MODE_COPY: Record<
  PublicModeKey,
  {
    navLabel: LocalizedCopy;
    title: LocalizedCopy;
    description: LocalizedCopy;
  }
> = {
  daily: {
    navLabel: { en: "Daily", fr: "Quotidien" },
    title: { en: "Daily Japanese quiz", fr: "Quiz japonais du jour" },
    description: {
      en: "Play today's 10-question Japanese vocabulary quiz. Same challenge for everyone, no account required.",
      fr: "Joue le quiz japonais du jour en 10 questions. Le même défi pour tout le monde, sans compte.",
    },
  },
  arcade: {
    navLabel: { en: "Arcade", fr: "Arcade" },
    title: { en: "Arcade mode", fr: "Mode Arcade" },
    description: {
      en: "Play quick 10-question Japanese vocabulary runs across four difficulty levels. No account, no lesson plan: just one more run when you want it.",
      fr: "Enchaîne des runs rapides de 10 questions de vocabulaire japonais sur quatre difficultés. Pas de compte, pas de leçon figée : juste une petite dernière quand tu veux.",
    },
  },
  archives: {
    navLabel: { en: "Archives", fr: "Archives" },
    title: { en: "Quiz archives", fr: "Archives des quiz" },
    description: {
      en: "Replay previous daily quizzes by date and keep track of your best scores locally.",
      fr: "Rejoue les anciens quiz quotidiens par date et garde tes meilleurs scores en local.",
    },
  },
};

/**
 * Paths generated for end users (marketing + quiz). Excludes `/internal/*`, assets, and `404.html`.
 * Use for audits, sitemaps, or checks — keep in sync with `src/pages/`.
 */
export function listPublicUserFacingPaths(): readonly string[] {
  const paths: string[] = ["/"];
  for (const locale of PUBLIC_LOCALES) {
    paths.push(getLocalizedHomePath(locale));
    for (const mode of PUBLIC_MODE_KEYS) {
      paths.push(getLocalizedModePath(locale, mode));
    }
  }
  return paths;
}

export function getLocalizedHomePath(locale: PublicLocale) {
  return `/${locale}/`;
}

export function getLocalizedModePath(locale: PublicLocale, mode: PublicModeKey) {
  return `/${locale}/${mode}/`;
}

export function getPublicStaticLocalePaths() {
  return PUBLIC_LOCALES.map((locale) => ({ params: { locale } }));
}

export function getPublicStaticModePaths() {
  return PUBLIC_LOCALES.flatMap((locale) =>
    PUBLIC_MODE_KEYS.map((mode) => ({ params: { locale, mode } })),
  );
}
