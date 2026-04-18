export type AdminLang = "fr" | "en";

export function resolveAdminLang(value: unknown): AdminLang {
  return value === "fr" ? "fr" : "en";
}

export function updateAdminLocalizedNodes(lang: AdminLang): void {
  document.querySelectorAll("[data-admin-i18n]").forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const localizedValue =
      lang === "fr" ? node.dataset.adminFr : node.dataset.adminEn || node.dataset.adminFr;
    if (typeof localizedValue === "string") {
      node.innerHTML = localizedValue;
    }

    const localizedAria =
      lang === "fr"
        ? node.dataset.adminAriaFr
        : node.dataset.adminAriaEn || node.dataset.adminAriaFr;
    if (typeof localizedAria === "string") {
      node.setAttribute("aria-label", localizedAria);
    }
  });
}

export function bindAdminI18n(onUpdate?: (lang: AdminLang) => void): void {
  const apply = (nextLang: unknown) => {
    const lang = resolveAdminLang(nextLang);
    updateAdminLocalizedNodes(lang);
    onUpdate?.(lang);
  };

  apply(document.documentElement.lang);

  window.addEventListener("adminlangchange", (event) => {
    const detail = event instanceof CustomEvent ? event.detail : null;
    apply(detail?.lang);
  });
}
