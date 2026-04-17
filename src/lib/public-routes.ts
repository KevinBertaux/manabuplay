import { PUBLIC_LOCALES, type KnownPublicLocale, type PublicLocale } from "./public-locales";

export const PUBLIC_MODE_KEYS = ["daily", "practice", "archives"] as const;

export type PublicModeKey = (typeof PUBLIC_MODE_KEYS)[number];

type LocalizedCopy = Record<KnownPublicLocale, string>;

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
    navLabel: { en: "Daily", fr: "Quotidien", es: "Diario" },
    title: { en: "Daily quiz", fr: "Quiz quotidien", es: "Quiz diario" },
    kicker: {
      en: "One shared run per day",
      fr: "Une run commune par jour",
      es: "Una partida común al día",
    },
    description: {
      en: "Play the shared 10-question daily quiz: one challenge per day, no account required.",
      fr: "Joue le quiz quotidien commun de 10 questions : un défi par jour, sans compte.",
      es: "La ruta Diario alojará el quiz de 10 preguntas con seed: un reto al día, sin cuenta.",
    },
    status: {
      en: "v0.1: deterministic daily quiz wired from the pack catalog.",
      fr: "v0.1 : quiz quotidien déterministe branché sur le catalogue de packs.",
      es: "Esqueleto v0.1: ruta lista, integración de gameplay después.",
    },
  },
  practice: {
    navLabel: { en: "Practice", fr: "Libre", es: "Práctica" },
    title: { en: "Practice mode", fr: "Mode Libre", es: "Modo práctica" },
    kicker: {
      en: "Four difficulties, longer sessions",
      fr: "Quatre difficultés, sessions plus longues",
      es: "Cuatro dificultades, sesiones más largas",
    },
    description: {
      en: "Train freely across four difficulties, with 10-question sessions and a 2-session word cooldown.",
      fr: "Entraîne-toi librement sur quatre difficultés, avec des sessions de 10 questions et un cooldown de deux sessions par mot.",
      es: "Práctica permitirá entrenar libremente en cuatro dificultades con cooldown de dos sesiones por palabra.",
    },
    status: {
      en: "v0.1: Practice mode is live with four recipes and session cooldown.",
      fr: "v0.1 : le mode Libre est branché avec quatre recettes et cooldown de session.",
      es: "Esqueleto v0.1: marco definido, constructor de sesión después.",
    },
  },
  archives: {
    navLabel: { en: "Archives", fr: "Archives", es: "Archivo" },
    title: { en: "Archives", fr: "Archives", es: "Archivo" },
    kicker: {
      en: "Past daily quizzes, no sharing",
      fr: "Anciens quotidiens, sans partage",
      es: "Diarios anteriores, sin compartir",
    },
    description: {
      en: "Replay past daily quizzes by date, with the same 10-question seeded run and no sharing in v0.1.",
      fr: "Rejoue les anciens quotidiens par date, avec la même run seedée de 10 questions et sans partage en v0.1.",
      es: "Archivo expondrá diarios anteriores generados por fecha, sin mecánica de compartir en v0.1.",
    },
    status: {
      en: "v0.1: Archives are live by date, without sharing.",
      fr: "v0.1 : les Archives sont jouables par date, sans partage.",
      es: "Esqueleto v0.1: ruta lista, gestión de fechas después.",
    },
  },
};

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
