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
  href: string;
  label: string;
};

export type AdminNavGroup = {
  label: string;
  keys: AdminNavKey[];
  items: AdminNavLink[];
};

export const ADMIN_PRIMARY_ITEMS: AdminNavLink[] = [
  { key: "hub", href: "/", label: "Accueil" },
  { key: "backlog", href: "/pilotage/backlog", label: "Backlog" },
  { key: "architecture", href: "/pilotage/architecture", label: "Architecture" },
  { key: "business", href: "/pilotage/business", label: "Business" },
  { key: "wording", href: "/copy/landing", label: "Wording" },
  { key: "guide", href: "/guide", label: "Guide" },
];

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
    label: "Design",
    keys: ["brand", "fx", "mockups", "references"],
    items: [
      { key: "brand", href: "/design/brand-system", label: "Charte" },
      { key: "fx", href: "/design/fx", label: "FX" },
      { activeKey: "mockups", href: "/design/mockups/answer-cards", label: "Mockups" },
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

export function isAdminNavItemActive(item: AdminNavLink, active: AdminNavKey) {
  return item.key === active || item.activeKey === active;
}

export function isAdminNavGroupActive(group: AdminNavGroup, active: AdminNavKey) {
  return group.keys.includes(active);
}
