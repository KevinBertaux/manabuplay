import { expect, test } from "@playwright/test";
import { ASTRO_URL } from "./helpers/visual";

const BACKLOG_URL = `${ASTRO_URL}admin/backlog`;

test.describe("admin backlog", () => {
  test("switches versions and status filters client-side", async ({ page }) => {
    await page.goto(BACKLOG_URL, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Backlog/i);
    await expect(page.locator("#backlog-list")).toBeVisible();

    await expect(page.locator("#backlog-current-version-chip")).toHaveText("v0.1");
    await expect(page.locator("#backlog-list")).toContainText("Finir le wording landing lot 1");

    await page.locator('[data-role="version-option"][data-version-id="v0.2"]').evaluate((node) => {
      (node as HTMLAnchorElement).click();
    });
    await expect(page).toHaveURL(/version=v0\.2/);
    await expect(page.locator("#backlog-current-version-chip")).toHaveText("v0.2");
    await expect(page.locator("#backlog-list")).toContainText("Lancer streak et progression visible");
    await expect(page.locator("#backlog-list")).not.toContainText("Finir le wording landing lot 1");

    await page.locator('[data-role="version-option"][data-version-id="v0.1"]').evaluate((node) => {
      (node as HTMLAnchorElement).click();
    });
    await page.locator('[data-role="status-option"][data-status-id="done"]').evaluate((node) => {
      (node as HTMLAnchorElement).click();
    });
    await expect(page).toHaveURL(/status=done/);
    await expect(page.locator("#backlog-list")).toContainText("Finir le wording landing lot 1");
    await expect(page.locator("#backlog-list")).not.toContainText("Lancer le Quotidien");
    await expect(page.locator("#backlog-list .backlog-meta-chip.status-todo")).toHaveCount(0);
  });

  test("can read all versions without depending on v0.1", async ({ page }) => {
    await page.goto(`${BACKLOG_URL}?version=all`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#backlog-list")).toBeVisible();

    await expect(page.locator("#backlog-current-version-chip")).toHaveText("Lecture libre");
    const sectionTitles = await page.locator(".backlog-section-title").allTextContents();
    expect(sectionTitles).toEqual(expect.arrayContaining(["MVP 2026-03-27", "v0.1", "v0.2"]));
    await expect(page.locator("#backlog-list")).toContainText("Lancer le Quotidien");
    await expect(page.locator("#backlog-list")).toContainText("Atteindre 50 visites organiques par jour");
  });
});
