import type { Page } from "@playwright/test";

/** Viewports alignés sur Tailwind `md` (768px). */
export const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;
export const VIEWPORT_BELOW_MD = { width: 767, height: 844 } as const;
export const VIEWPORT_MD = { width: 768, height: 844 } as const;
export const DESKTOP_VIEWPORT = { width: 1440, height: 1400 } as const;

export function desktopModeNav(page: Page) {
  return page.locator(".public-mode-nav-segmented");
}

export function mobileModeMenuTrigger(page: Page) {
  return page.locator("#public-mode-menu-trigger");
}

export function mobileModeMenuPanel(page: Page) {
  return page.locator("#public-mode-menu-panel");
}

export function localeSwitch(page: Page) {
  return page.locator(".public-locale-switch");
}

export function archiveCalendarGrid(page: Page) {
  return page.locator(".archive-calendar-view--grid");
}

export function archiveAgendaList(page: Page) {
  return page.locator(".archive-calendar-view--agenda");
}

export function archiveGridArchiveCell(page: Page, dateKey: string) {
  return archiveCalendarGrid(page).locator(
    `[data-archive-date='${dateKey}'][data-archive-tone='archive']`,
  );
}

export function archiveGridTodayCell(page: Page) {
  return archiveCalendarGrid(page).locator("[data-archive-tone='today']");
}

export function hintChip1(page: Page) {
  return page.locator("#hintChip1");
}

export function hintChip2(page: Page) {
  return page.locator("#hintChip2");
}

/** Révèle l'indice 1, puis l'indice 2 si présent en data. */
export async function revealQuizHints(page: Page) {
  await hintChip1(page).click();
  const chip2 = hintChip2(page);
  if (await chip2.isVisible()) {
    await chip2.click();
  }
}
