export type AdminNavKey = "hub" | "reader" | "fx-lab" | "brand-system";

export const ADMIN_NAV_CSS = `
.admin-topnav{position:sticky;top:12px;z-index:30;display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 16px;padding:8px;border:1px solid rgba(139,92,246,.18);border-radius:8px;background:rgba(15,12,26,.9);backdrop-filter:blur(12px);box-shadow:0 12px 32px rgba(0,0,0,.26)}
.admin-topnav__link{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 14px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#c7c2df;font:700 .9rem/1 'Rajdhani',sans-serif;letter-spacing:.04em;text-decoration:none;transition:border-color .18s ease,background .18s ease,color .18s ease,transform .18s ease}
.admin-topnav__link:hover{border-color:rgba(139,92,246,.38);background:rgba(139,92,246,.08);color:#fff;transform:translateY(-1px)}
.admin-topnav__link.is-active{border-color:rgba(232,121,249,.42);background:rgba(232,121,249,.1);color:#fff}
`;

const items: Array<{ key?: AdminNavKey; href: string; label: string }> = [
  { key: "hub", href: "/admin", label: "Admin" },
  { key: "reader", href: "/admin/packs/jrpg-essentials", label: "Lecteur" },
  { key: "fx-lab", href: "/admin/fx-lab", label: "FX Lab" },
  { key: "brand-system", href: "/admin/brand-system", label: "Charte" },
  { href: "/", label: "Site public" },
];

function escapeAttr(value: string) {
  return value.replace(/"/g, "&quot;");
}

export function getAdminNavHtml(active: AdminNavKey) {
  const links = items
    .map((item) => {
      const className = item.key === active ? "admin-topnav__link is-active" : "admin-topnav__link";
      return `<a class="${className}" href="${escapeAttr(item.href)}">${item.label}</a>`;
    })
    .join("");

  return `<nav class="admin-topnav">${links}</nav>`;
}
