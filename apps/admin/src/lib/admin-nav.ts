export type AdminNavKey =
  | "hub"
  | "backlog"
  | "architecture"
  | "insight"
  | "clarity"
  | "business"
  | "wording"
  | "guide"
  | "packs"
  | "reserve"
  | "brand"
  | "mockups"
  | "maintenance"
  | "waitlist";

export type AdminNavLink = {
  key?: AdminNavKey;
  activeKey?: AdminNavKey;
  href?: string;
  exact?: boolean;
  label: string;
  children?: AdminNavLink[];
};

export type AdminNavGroup = {
  label: string;
  keys: AdminNavKey[];
  items: AdminNavLink[];
};

export const ADMIN_PRIMARY_ITEMS: AdminNavLink[] = [{ key: "hub", href: "/", label: "Accueil" }];

export const ADMIN_GROUPS: AdminNavGroup[] = [
  {
    label: "Contenu",
    keys: ["packs", "reserve"],
    items: [
      { key: "packs", href: "/content/packs/", label: "Packs" },
      { key: "reserve", href: "/content/editorial-reserve", label: "Réserve" },
    ],
  },
  {
    label: "Pilotage",
    keys: ["backlog", "architecture", "insight", "clarity", "business", "wording", "guide"],
    items: [
      { key: "backlog", href: "/pilotage/backlog", label: "Backlog" },
      { key: "architecture", href: "/pilotage/architecture", label: "Architecture" },
      { key: "insight", href: "/pilotage/insight", label: "Insight" },
      { key: "clarity", href: "/pilotage/clarity", label: "Clarity" },
      { key: "business", href: "/pilotage/business", label: "Business" },
      { key: "wording", href: "/copy/landing", label: "Wording" },
      { key: "guide", href: "/guide", label: "Guide" },
    ],
  },
  {
    label: "Design",
    keys: ["brand", "mockups"],
    items: [
      { key: "brand", href: "/design/brand-system", label: "Charte" },
      {
        activeKey: "mockups",
        label: "Mockups",
        children: [
          {
            activeKey: "mockups",
            exact: true,
            href: "/design/mockups/quiz-chantiers",
            label: "Quiz A/B",
          },
          {
            activeKey: "mockups",
            exact: true,
            href: "/design/mockups/tier-breakdown",
            label: "Tiers",
          },
          {
            activeKey: "mockups",
            exact: true,
            href: "/design/mockups/archives",
            label: "Archives",
          },
          {
            activeKey: "mockups",
            exact: true,
            href: "/design/mockups/typography",
            label: "Typo",
          },
          {
            activeKey: "mockups",
            exact: true,
            href: "/design/mockups/mobile-landing",
            label: "Landing mobile",
          },
          {
            activeKey: "mockups",
            exact: true,
            href: "/design/mockups/favicon",
            label: "Favicon",
          },
        ],
      },
    ],
  },
  {
    label: "Ops",
    keys: ["maintenance", "waitlist"],
    items: [
      { key: "maintenance", href: "/ops/maintenance", label: "Maintenance" },
      { key: "waitlist", href: "/ops/waitlist", label: "Waitlist" },
    ],
  },
];

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
}

export function isAdminNavItemActive(
  item: AdminNavLink,
  active: AdminNavKey,
  currentPath = "",
): boolean {
  const matchesPath =
    Boolean(item.href && currentPath) &&
    normalizePath(item.href || "") === normalizePath(currentPath);

  if (item.exact && currentPath) {
    return matchesPath;
  }

  return (
    matchesPath ||
    item.key === active ||
    item.activeKey === active ||
    Boolean(item.children?.some((child) => isAdminNavItemActive(child, active, currentPath)))
  );
}

export function isAdminNavGroupActive(group: AdminNavGroup, active: AdminNavKey) {
  return group.keys.includes(active);
}
