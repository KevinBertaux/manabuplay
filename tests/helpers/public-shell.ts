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
