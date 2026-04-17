export const PUBLIC_LOCALES = ["en", "fr"] as const;
export const PLANNED_PUBLIC_LOCALES = ["es"] as const;

export type PublicLocale = (typeof PUBLIC_LOCALES)[number];
export type PlannedPublicLocale = (typeof PLANNED_PUBLIC_LOCALES)[number];
export type KnownPublicLocale = PublicLocale | PlannedPublicLocale;

export const DEFAULT_PUBLIC_LOCALE: PublicLocale = "en";

export const PUBLIC_LOCALE_LABELS: Record<KnownPublicLocale, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
};

export function isPublicLocale(value: string | undefined): value is PublicLocale {
  return PUBLIC_LOCALES.includes(value as PublicLocale);
}

export function normalizePublicLocale(value: string | undefined): PublicLocale {
  return isPublicLocale(value) ? value : DEFAULT_PUBLIC_LOCALE;
}
