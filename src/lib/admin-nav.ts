export type AdminNavKey =
  | "hub"
  | "backlog"
  | "reader"
  | "catalog"
  | "wording"
  | "fx-lab"
  | "brand-system"
  | "mockups";

export const ADMIN_NAV_CSS = `
.admin-topnav{position:sticky;top:12px;z-index:30;display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 16px;padding:8px;border:1px solid rgba(139,92,246,.18);border-radius:8px;background:rgba(15,12,26,.9);backdrop-filter:blur(12px);box-shadow:0 12px 32px rgba(0,0,0,.26)}
.admin-topnav__link{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 14px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#c7c2df;font:700 .9rem/1 'Rajdhani',sans-serif;letter-spacing:.04em;text-decoration:none;transition:border-color .18s ease,background .18s ease,color .18s ease,transform .18s ease}
.admin-topnav__link:hover{border-color:rgba(139,92,246,.38);background:rgba(139,92,246,.08);color:#fff;transform:translateY(-1px)}
.admin-topnav__link.is-active{border-color:rgba(232,121,249,.42);background:rgba(232,121,249,.1);color:#fff}
.admin-topnav__spacer{flex:1 1 auto}
.admin-topnav__lang{display:inline-flex;align-items:center;gap:4px;min-height:40px;padding:4px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04)}
.admin-topnav__lang-btn{display:inline-flex;align-items:center;justify-content:center;min-width:40px;min-height:30px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:#8f8aa7;font:800 .84rem/1 'Rajdhani',sans-serif;letter-spacing:.06em;cursor:pointer;transition:background .18s ease,color .18s ease}
.admin-topnav__lang-btn:hover{color:#fff}
.admin-topnav__lang-btn.is-active{background:rgba(139,92,246,.2);color:#fff}
`;

const items: Array<{ key?: AdminNavKey; activeKey?: AdminNavKey; href: string; label: string }> = [
  { key: "hub", href: "/admin", label: "Admin" },
  { key: "backlog", href: "/admin/backlog", label: "Backlog" },
  { key: "reader", href: "/admin/packs", label: "Lecteur" },
  { key: "catalog", href: "/admin/catalog", label: "Catalogue" },
  { key: "wording", href: "/admin/landing-wording", label: "Wording" },
  { key: "mockups", href: "/admin/mockups/answer-cards", label: "Mockups réponses" },
  { activeKey: "mockups", href: "/admin/mockups/tier-breakdown", label: "Mockups tiers" },
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
      const isActive = item.key === active || item.activeKey === active;
      const className = isActive ? "admin-topnav__link is-active" : "admin-topnav__link";
      return `<a class="${className}" href="${escapeAttr(item.href)}">${item.label}</a>`;
    })
    .join("");

  return `<nav class="admin-topnav">${links}<span class="admin-topnav__spacer"></span><div class="admin-topnav__lang" aria-label="Language switch"><button class="admin-topnav__lang-btn" type="button" data-admin-lang="en">EN</button><button class="admin-topnav__lang-btn" type="button" data-admin-lang="fr">FR</button></div></nav><script>(function(){const KEY='mp_lang';const root=document.documentElement;const buttons=[...document.querySelectorAll('[data-admin-lang]')];function readLang(){try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):'en';}catch(_){return'en';}}function writeLang(lang){try{localStorage.setItem(KEY,JSON.stringify(lang));}catch(_){}}function emit(lang){window.dispatchEvent(new CustomEvent('adminlangchange',{detail:{lang}}));}function apply(lang){root.lang=lang==='fr'?'fr':'en';buttons.forEach((button)=>button.classList.toggle('is-active',button.getAttribute('data-admin-lang')===lang));emit(root.lang);}const initial=readLang();apply(initial);buttons.forEach((button)=>button.addEventListener('click',()=>{const lang=button.getAttribute('data-admin-lang')||'en';writeLang(lang);apply(lang);}));})();</script>`;
}
