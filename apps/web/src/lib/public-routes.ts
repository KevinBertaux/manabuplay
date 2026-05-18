import { PUBLIC_LOCALES, type PublicLocale } from "./public-locales";

export const PUBLIC_MODE_KEYS = ["daily", "practice", "archives"] as const;

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
    kicker: LocalizedCopy;
    description: LocalizedCopy;
    status: LocalizedCopy;
  }
> = {
  daily: {
    navLabel: { en: "Daily", fr: "Quotidien" },
    title: { en: "Daily quiz", fr: "Quiz quotidien" },
    kicker: {
      en: "One shared run per day",
      fr: "Une run commune par jour",
    },
    description: {
      en: "Play the shared 10-question daily quiz: one challenge per day, no account required.",
      fr: "Joue le quiz quotidien commun de 10 questions : un défi par jour, sans compte.",
    },
    status: {
      en: "v0.1: deterministic daily quiz wired from the pack catalog.",
      fr: "v0.1 : quiz quotidien déterministe branché sur le catalogue de packs.",
    },
  },
  practice: {
    navLabel: { en: "Practice", fr: "Entraînement" },
    title: { en: "Practice mode", fr: "Mode Libre" },
    kicker: {
      en: "Four difficulties, longer sessions",
      fr: "Quatre difficultés, sessions plus longues",
    },
    description: {
      en: "Train freely across four difficulties, with 10-question sessions and a 2-session word cooldown.",
      fr: "Entraîne-toi librement sur quatre difficultés, avec des sessions de 10 questions et un cooldown de deux sessions par mot.",
    },
    status: {
      en: "v0.1: Practice mode is live with four recipes and session cooldown.",
      fr: "v0.1 : le mode Libre est branché avec quatre recettes et cooldown de session.",
    },
  },
  archives: {
    navLabel: { en: "Archives", fr: "Archives" },
    title: { en: "Archives", fr: "Archives" },
    kicker: {
      en: "Past daily quizzes, no sharing",
      fr: "Anciens quotidiens, sans partage",
    },
    description: {
      en: "Replay past daily quizzes by date, with the same 10-question seeded run and no sharing in v0.1.",
      fr: "Rejoue les anciens quotidiens par date, avec la même run seedée de 10 questions et sans partage en v0.1.",
    },
    status: {
      en: "v0.1: Archives are live by date, without sharing.",
      fr: "v0.1 : les Archives sont jouables par date, sans partage.",
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
