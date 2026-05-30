export type PreviewLocale = "en" | "fr";
export type PreviewLocaleToken = PreviewLocale | "__LOCALE__";

export type MobileLandingMockupId = "current" | "with-scroll" | "legacy-centered";

export type MobileLandingMockup = {
  id: MobileLandingMockupId;
  title: string;
  pitch: string;
  decisionHint: string;
  buildHref: (locale: PreviewLocaleToken, webOrigin: string) => string;
};

/** Web app origin for iframe previews (local dev: apps/web on 4321). */
export const DEFAULT_WEB_PREVIEW_ORIGIN = "http://127.0.0.1:4321";

export function resolveWebPreviewOrigin(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.replace(/\/$/, "") : DEFAULT_WEB_PREVIEW_ORIGIN;
}

export function appendEmbedMockup(href: string): string {
  return href.includes("?") ? `${href}&embed=mockup` : `${href}?embed=mockup`;
}

export const MOBILE_LANDING_MOCKUPS: MobileLandingMockup[] = [
  {
    id: "current",
    title: "Actuel (branch adjust/v01-mobile-nav)",
    pitch:
      "Hero pill → CTA dans le viewport mobile, chevron scroll cyan sous le CTA, stats en section dédiée sous le fold, burger ≡ seul.",
    decisionHint: "Référence de validation — iframe vers la landing live.",
    buildHref: (locale, webOrigin) => appendEmbedMockup(`${webOrigin}/${locale}/`),
  },
  {
    id: "with-scroll",
    title: "Variante chevron scroll (mobile)",
    pitch:
      "Même fold pill → CTA, stats hors hero, mais chevron scroll visible en bas du hero pour inviter à scroller.",
    decisionHint: "À comparer si Clarity montre peu de scroll sous le CTA.",
    buildHref: (locale, webOrigin) =>
      appendEmbedMockup(
        `${webOrigin}/internal/mobile-landing-preview?variant=with-scroll&locale=${locale}`,
      ),
  },
  {
    id: "legacy-centered",
    title: "Référence legacy (avant fold mobile)",
    pitch:
      "Hero centré sur 100svh, stats dans le hero, chevron scroll, nav modes en scroll horizontal (sans burger).",
    decisionHint: "Ancien layout — utile pour juger le gain vertical du fold actuel.",
    buildHref: (locale, webOrigin) =>
      appendEmbedMockup(
        `${webOrigin}/internal/mobile-landing-preview?variant=legacy-centered&locale=${locale}`,
      ),
  },
];

export const MOBILE_MOCKUP_VIEWPORT = {
  width: 390,
  height: 844,
  label: "iPhone XR · 390×844",
} as const;
