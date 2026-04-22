export const ADMIN_APP_NAME = "ManabuPlay Admin";
export const ADMIN_APP_DESCRIPTION =
  "Dashboard Astro privé pour piloter le produit, le contenu, le design et les opérations de ManabuPlay.";
export const ADMIN_THEME_COLOR = "#0a0911";
export const ADMIN_BODY_APP = "manabuplay-admin";

export function getAdminDocumentTitle(title: string) {
  return /ManabuPlay|Admin/.test(title) ? title : `${title} — ${ADMIN_APP_NAME}`;
}
