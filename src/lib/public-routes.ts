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
      en: "Practice will let players train freely across four difficulties with the two-session word cooldown.",
      fr: "Le Libre permettra de s’entraîner sur quatre difficultés avec le cooldown de deux sessions par mot.",
      es: "Práctica permitirá entrenar libremente en cuatro dificultades con cooldown de dos sesiones por palabra.",
    },
    status: {
      en: "v0.1 skeleton: framing is done, session builder next.",
      fr: "Squelette v0.1 : cadrage fait, builder de session ensuite.",
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
      en: "Archives will expose past daily quizzes generated from dates, without share mechanics for v0.1.",
      fr: "Les Archives exposeront les anciens quotidiens générés par date, sans mécanique de partage en v0.1.",
      es: "Archivo expondrá diarios anteriores generados por fecha, sin mecánica de compartir en v0.1.",
    },
    status: {
      en: "v0.1 skeleton: route ready, date handling next.",
      fr: "Squelette v0.1 : route prête, gestion des dates ensuite.",
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
