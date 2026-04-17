export type AdminNavKey =
  | "hub"
  | "backlog"
  | "architecture"
  | "business"
  | "wording"
  | "guide"
  | "packs"
  | "catalog"
  | "brand"
  | "fx"
  | "mockups"
  | "references"
  | "maintenance"
  | "waitlist";

export const ADMIN_NAV_CSS = `
.admin-topnav{position:sticky;top:12px;z-index:30;display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 16px;padding:8px;border:1px solid rgba(139,92,246,.18);border-radius:8px;background:rgba(15,12,26,.9);backdrop-filter:blur(12px);box-shadow:0 12px 32px rgba(0,0,0,.26)}
.admin-topnav__link,.admin-topnav__summary{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 14px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#c7c2df;font:700 .9rem/1 'Chakra Petch',sans-serif;letter-spacing:.04em;text-decoration:none;transition:border-color .18s ease,background .18s ease,color .18s ease,transform .18s ease}
.admin-topnav__link:hover{border-color:rgba(139,92,246,.38);background:rgba(139,92,246,.08);color:#fff;transform:translateY(-1px)}
.admin-topnav__link.is-active,.admin-topnav__group.is-active>.admin-topnav__summary{border-color:rgba(232,121,249,.42);background:rgba(232,121,249,.1);color:#fff}
.admin-topnav__group{position:relative}
.admin-topnav__summary{list-style:none;cursor:pointer;gap:7px}
.admin-topnav__summary::-webkit-details-marker{display:none}
.admin-topnav__summary::after{content:"";width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid currentColor;opacity:.72;transition:transform .18s ease}
.admin-topnav__group[open]>.admin-topnav__summary::after{transform:rotate(180deg)}
.admin-topnav__menu{position:absolute;top:calc(100% + 8px);left:0;z-index:50;display:grid;gap:6px;min-width:210px;padding:8px;border:1px solid rgba(139,92,246,.22);border-radius:8px;background:rgba(15,12,26,.98);box-shadow:0 18px 42px rgba(0,0,0,.34)}
.admin-topnav__menu .admin-topnav__link{justify-content:flex-start;white-space:nowrap}
.admin-topnav__spacer{flex:1 1 auto}
.admin-topnav__lang{display:inline-flex;align-items:center;gap:4px;min-height:40px;padding:4px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04)}
.admin-topnav__lang-btn{display:inline-flex;align-items:center;justify-content:center;min-width:40px;min-height:30px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:#8f8aa7;font:800 .84rem/1 'Chakra Petch',sans-serif;letter-spacing:.06em;cursor:pointer;transition:background .18s ease,color .18s ease}
.admin-topnav__lang-btn:hover{color:#fff}
.admin-topnav__lang-btn.is-active{background:rgba(139,92,246,.2);color:#fff}
`;

type AdminNavLink = { key?: AdminNavKey; activeKey?: AdminNavKey; href: string; label: string };
type AdminNavGroup = { label: string; keys: AdminNavKey[]; items: AdminNavLink[] };

const primaryItems: AdminNavLink[] = [
  { key: "hub", href: "/", label: "Accueil" },
  { key: "backlog", href: "/pilotage/backlog", label: "Backlog" },
  { key: "architecture", href: "/pilotage/architecture", label: "Architecture" },
  { key: "business", href: "/pilotage/business", label: "Business" },
  { key: "wording", href: "/copy/landing", label: "Wording" },
  { key: "guide", href: "/guide", label: "Guide" },
];

const groups: AdminNavGroup[] = [
  {
    label: "Contenu",
    keys: ["packs", "catalog"],
    items: [
      { key: "packs", href: "/content/packs", label: "Packs" },
      { key: "catalog", href: "/content/catalog", label: "Catalogue" },
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

function escapeAttr(value: string) {
  return value.replace(/"/g, "&quot;");
}

export function getAdminNavHtml(active: AdminNavKey) {
  const links = primaryItems
    .map((item) => {
      const isActive = item.key === active || item.activeKey === active;
      const className = isActive ? "admin-topnav__link is-active" : "admin-topnav__link";
      return `<a class="${className}" href="${escapeAttr(item.href)}">${item.label}</a>`;
    })
    .join("");

  const groupLinks = groups
    .map((group) => {
      const isActive = group.keys.includes(active);
      const groupClassName = isActive ? "admin-topnav__group is-active" : "admin-topnav__group";
      const childLinks = group.items
        .map((item) => {
          const isChildActive = item.key === active || item.activeKey === active;
          const className = isChildActive ? "admin-topnav__link is-active" : "admin-topnav__link";
          return `<a class="${className}" href="${escapeAttr(item.href)}">${item.label}</a>`;
        })
        .join("");
      return `<details class="${groupClassName}"${isActive ? " open" : ""}><summary class="admin-topnav__summary">${group.label}</summary><div class="admin-topnav__menu">${childLinks}</div></details>`;
    })
    .join("");

  return `<nav class="admin-topnav">${links}${groupLinks}<span class="admin-topnav__spacer"></span><a class="admin-topnav__link" data-admin-public href="http://localhost:4321/" target="_blank" rel="noreferrer">ManabuPlay</a><div class="admin-topnav__lang" aria-label="Language switch"><button class="admin-topnav__lang-btn" type="button" data-admin-lang="fr">FR</button><button class="admin-topnav__lang-btn" type="button" data-admin-lang="en">EN</button></div></nav><script>(function(){const KEY='mp_admin_lang';const DEFAULT_LANG='fr';const root=document.documentElement;const buttons=[...document.querySelectorAll('[data-admin-lang]')];const groups=[...document.querySelectorAll('.admin-topnav__group')];const publicLink=document.querySelector('[data-admin-public]');if(publicLink){publicLink.setAttribute('href',window.location.protocol+'//'+window.location.hostname+':4321/');}function closeGroups(except){groups.forEach((group)=>{if(group!==except)group.removeAttribute('open');});}groups.forEach((group)=>{group.addEventListener('toggle',()=>{if(group.open)closeGroups(group);});group.querySelectorAll('a').forEach((link)=>link.addEventListener('click',()=>group.removeAttribute('open')));});document.addEventListener('click',(event)=>{if(!event.target.closest('.admin-topnav__group'))closeGroups();});document.addEventListener('keydown',(event)=>{if(event.key==='Escape')closeGroups();});function readLang(){try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):DEFAULT_LANG;}catch(_){return DEFAULT_LANG;}}function writeLang(lang){try{localStorage.setItem(KEY,JSON.stringify(lang));}catch(_){}}function emit(lang){window.dispatchEvent(new CustomEvent('adminlangchange',{detail:{lang}}));}function apply(lang){const nextLang=lang==='en'?'en':'fr';root.lang=nextLang;buttons.forEach((button)=>button.classList.toggle('is-active',button.getAttribute('data-admin-lang')===nextLang));emit(nextLang);}const initial=readLang();apply(initial);buttons.forEach((button)=>button.addEventListener('click',()=>{const lang=button.getAttribute('data-admin-lang')||DEFAULT_LANG;writeLang(lang);apply(lang);}));})();</script>`;
}
