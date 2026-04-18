import { expect, test } from "@playwright/test";
import { ADMIN_URL } from "./helpers/admin";

const BACKLOG_URL = `${ADMIN_URL}pilotage/backlog/`;

test.describe("admin backlog", () => {
  test("switches versions client-side", async ({ page }) => {
    await page.goto(BACKLOG_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Backlog/i);
    await expect(page.locator("#backlog-list")).toBeVisible();
    await expect(page.locator("#backlog-current-version-chip")).toHaveText("v0.1");
    await expect(page.locator("#backlog-list")).toContainText("Finir le wording landing lot 1");

    await page.locator('[data-role="version-option"][data-version-id="v0.2"]').click();
    await expect(page).toHaveURL(/version=v0\.2/);
    await expect(page.locator("#backlog-current-version-chip")).toHaveText("v0.2");
    await expect(page.locator("#backlog-list")).toContainText(
      "Lancer streak et progression visible",
    );
  });

  test("reads all versions without depending on v0.1", async ({ page }) => {
    await page.goto(`${BACKLOG_URL}?version=all`, { waitUntil: "domcontentloaded" });

    await expect(page.locator("#backlog-list")).toBeVisible();
    await expect(page.locator("#backlog-current-version-chip")).toHaveText("Lecture libre");
    await expect(page.locator("#backlog-list")).toContainText("Lancer le Quotidien");
    await expect(page.locator("#backlog-list")).toContainText(
      "Atteindre 50 visites organiques par jour",
    );
  });
});
