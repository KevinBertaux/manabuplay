const KEY = "mp_admin_lang";
const DEFAULT_LANG = "fr";

function closeGroups(groups: HTMLDetailsElement[], except?: HTMLDetailsElement) {
  for (const group of groups) {
    if (group !== except) {
      group.removeAttribute("open");
    }
  }
}

function readLang() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function writeLang(lang: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lang));
  } catch {
    // localStorage is optional for the admin shell
  }
}

function emitAdminLangChange(lang: "fr" | "en") {
  window.dispatchEvent(new CustomEvent("adminlangchange", { detail: { lang } }));
}

function resolvePublicUrl() {
  return `${window.location.protocol}//${window.location.hostname}:4321/`;
}

function initAdminTopNav() {
  const nav = document.querySelector<HTMLElement>("[data-admin-topnav]");

  if (!nav) {
    return;
  }

  const root = document.documentElement;
  const buttons = [...nav.querySelectorAll<HTMLButtonElement>("[data-admin-lang]")];
  const groups = [...nav.querySelectorAll<HTMLDetailsElement>("[data-admin-group]")];
  const publicLink = nav.querySelector<HTMLAnchorElement>("[data-admin-public]");

  if (publicLink) {
    publicLink.href = resolvePublicUrl();
  }

  for (const group of groups) {
    group.addEventListener("toggle", () => {
      if (group.open) {
        closeGroups(groups, group);
      }
    });

    for (const link of group.querySelectorAll("a")) {
      link.addEventListener("click", () => {
        group.removeAttribute("open");
      });
    }
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("[data-admin-group]")) {
      closeGroups(groups);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeGroups(groups);
    }
  });

  function applyLang(lang: string) {
    const nextLang = lang === "en" ? "en" : "fr";
    root.lang = nextLang;

    for (const button of buttons) {
      button.classList.toggle("is-active", button.dataset.adminLang === nextLang);
    }

    emitAdminLangChange(nextLang);
  }

  applyLang(readLang());

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const nextLang = button.dataset.adminLang || DEFAULT_LANG;
      writeLang(nextLang);
      applyLang(nextLang);
    });
  }
}

initAdminTopNav();
