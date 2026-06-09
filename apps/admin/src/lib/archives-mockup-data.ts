export type DayTone = "played" | "current" | "open" | "future" | "empty";

export type CalendarCell = {
  key: string;
  day?: string;
  title?: string;
  pack?: string;
  status?: string;
  score?: string;
  attempts?: string;
  href?: string;
  tone: DayTone;
  disabled?: boolean;
};

export const WEEKDAYS = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."] as const;

export const DEFAULT_SELECTED_DAY = "04";

export const MAY_SUMMARY = "3 joués · 1 ouvert · 27 à venir";

const mayDetails: Partial<
  Record<
    number,
    Omit<CalendarCell, "day" | "key"> & {
      longDate: string;
      cta: string;
    }
  >
> = {
  1: {
    title: "Archive du 1 mai",
    pack: "JRPG Questline",
    status: "Déjà joué",
    score: "132",
    attempts: "1 t.",
    longDate: "1 mai 2026",
    href: "#",
    tone: "played",
    cta: "Rejouer",
  },
  2: {
    title: "Archive du 2 mai",
    pack: "Builds & Gear",
    status: "Disponible",
    score: "—",
    attempts: "0 t.",
    longDate: "2 mai 2026",
    href: "#",
    tone: "open",
    cta: "Jouer",
  },
  3: {
    title: "Archive du 3 mai",
    pack: "Anime Codes",
    status: "Déjà joué",
    score: "118",
    attempts: "2 t.",
    longDate: "3 mai 2026",
    href: "#",
    tone: "played",
    cta: "Rejouer",
  },
  4: {
    title: "Aujourd'hui · 4 mai",
    pack: "Gacha & Rewards",
    status: "Quotidien joué",
    score: "124",
    attempts: "1 t.",
    longDate: "4 mai 2026",
    href: "#daily",
    tone: "current",
    cta: "Quotidien",
  },
};

export function getMayDayDetail(day: string) {
  const n = Number.parseInt(day, 10);
  return mayDetails[n];
}

export function buildMay2026Cells(): CalendarCell[] {
  const weekStartsOn = 1;
  const mayFirstIndex = 5;
  const leading = (mayFirstIndex - weekStartsOn + 7) % 7;
  const leadingCells: CalendarCell[] = Array.from({ length: leading }, (_, i) => ({
    key: `empty-${i}`,
    tone: "empty",
  }));

  const monthCells: CalendarCell[] = Array.from({ length: 31 }, (_, i) => {
    const dayNumber = i + 1;
    const day = String(dayNumber).padStart(2, "0");
    const known = mayDetails[dayNumber];

    if (known) {
      return { key: `2026-05-${day}`, day, ...known };
    }

    return {
      key: `2026-05-${day}`,
      day,
      title: `${day} mai`,
      status: "À venir",
      score: "—",
      attempts: "",
      tone: "future",
      disabled: true,
    };
  });

  const cells = [...leadingCells, ...monthCells];
  const trailing = (7 - (cells.length % 7)) % 7;
  const trailingCells: CalendarCell[] = Array.from({ length: trailing }, (_, i) => ({
    key: `empty-end-${i}`,
    tone: "empty",
  }));

  return [...cells, ...trailingCells];
}

export const MAY_CELLS = buildMay2026Cells();

export const AGENDA_DAYS = MAY_CELLS.filter(
  (cell): cell is CalendarCell & { day: string } =>
    cell.tone !== "empty" && typeof cell.day === "string",
);

export const VARIANTS = [
  {
    id: "a",
    badge: "Recommandé",
    title: "Dense + panneau focus",
    intent:
      "Grille 7 colonnes légère sur mobile (jour + ★ + score), détail et CTA dans une bande sous le mois. Sur desktop, cartes plus riches comme la cible prod.",
    fit: "Meilleur équilibre scan + lisibilité iPhone XR. Proche des patterns iOS/Android (pastille dans la grille, détail ailleurs).",
  },
  {
    id: "b",
    badge: null,
    title: "Pastilles type calendrier iOS",
    intent:
      "Cases quasi carrées : numéro + point d'état (joué / ouvert / aujourd'hui). Zéro texte dans la grille mobile ; tout le contexte dans le focus.",
    fit: "Le plus compact sur petit écran. Idéal si tu veux un calendrier « pur » avant le quiz en dessous.",
  },
  {
    id: "c",
    badge: null,
    title: "Agenda mobile · grille desktop",
    intent:
      "Sur téléphone, liste verticale scannable (date, statut, score). Sur desktop, grille mensuelle complète avec meta et sélection.",
    fit: "Quand la grille 7×N reste illisible sur mobile malgré la densité — lecture type fil d'actualité.",
  },
] as const;

export type VariantId = (typeof VARIANTS)[number]["id"];

export const MOBILE_DEVICES = [
  { id: "xr", label: "iPhone XR", width: 414, form: "narrow" as const },
  { id: "compact", label: "Autre mobile", width: 390, form: "narrow" as const },
] as const;

export const DESKTOP_DEVICE = {
  id: "desktop",
  label: "Desktop",
  width: 960,
  form: "desktop" as const,
} as const;
