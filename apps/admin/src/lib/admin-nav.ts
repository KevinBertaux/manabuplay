export type AdminNavKey =
  | "hub"
  | "backlog"
  | "architecture"
  | "business"
  | "wording"
  | "guide"
  | "packs"
  | "reserve"
  | "brand"
  | "fx"
  | "mockups"
  | "references"
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
    keys: ["backlog", "architecture", "business", "wording", "guide"],
    items: [
      { key: "backlog", href: "/pilotage/backlog", label: "Backlog" },
      { key: "architecture", href: "/pilotage/architecture", label: "Architecture" },
      { key: "business", href: "/pilotage/business", label: "Business" },
      { key: "wording", href: "/copy/landing", label: "Wording" },
      { key: "guide", href: "/guide", label: "Guide" },
    ],
  },
  {
    label: "Design",
    keys: ["brand", "fx", "mockups", "references"],
    items: [
      { key: "brand", href: "/design/brand-system", label: "Charte" },
      { key: "fx", href: "/design/fx", label: "FX" },
      {
        activeKey: "mockups",
        label: "Mockups",
        children: [
          {
            activeKey: "mockups",
            exact: true,
            href: "/design/mockups/answer-cards",
            label: "Réponses",
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
        ],
      },
      { activeKey: "references", href: "/design/references/hero", label: "Références" },
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
