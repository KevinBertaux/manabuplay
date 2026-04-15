import { expect, test } from "@playwright/test";
import { ASTRO_URL } from "./helpers/visual";

const WAITLIST_URL = `${ASTRO_URL}admin/waitlist`;

test.describe("admin waitlist", () => {
  test("renders localStorage waitlist submissions", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "mp_waitlist_submissions",
        JSON.stringify([
          {
            email: "machin.truc+site@mail.tld",
            lang: "fr",
            source: "localStorage",
            formName: "manabuplay-waitlist",
            createdAt: "2026-04-15T12:00:00.000Z",
            page: "/#email",
          },
          {
            email: "player@example.com",
            lang: "en",
            source: "localStorage",
            formName: "manabuplay-waitlist",
            createdAt: "2026-04-15T12:30:00.000Z",
            page: "/",
          },
        ]),
      );
    });

    await page.goto(WAITLIST_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Waitlist locale/i);
    await expect(page.locator("#waitlist-count")).toHaveText("2");
    await expect(page.locator("#waitlist-fr-count")).toHaveText("1");
    await expect(page.locator("#waitlist-en-count")).toHaveText("1");
    await expect(page.locator("#waitlist-body")).toContainText("machin.truc+site@mail.tld");
    await expect(page.locator("#waitlist-empty")).toBeHidden();
  });

  test("can clear the local waitlist mock", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "mp_waitlist_submissions",
        JSON.stringify([{ email: "delete-me@example.com", lang: "fr" }]),
      );
    });

    await page.goto(WAITLIST_URL, { waitUntil: "domcontentloaded" });
    await page.locator("#waitlist-clear").click();

    await expect(page.locator("#waitlist-count")).toHaveText("0");
    await expect(page.locator("#waitlist-empty")).toBeVisible();
    const storage = await page.evaluate(() => ({
      submissions: localStorage.getItem("mp_waitlist_submissions"),
    }));
    expect(storage).toEqual({ submissions: null });
  });

  test("shows feedback when refresh finds no local email", async ({ page }) => {
    await page.goto(WAITLIST_URL, { waitUntil: "domcontentloaded" });

    await page.locator("#waitlist-refresh").click();

    await expect(page.locator("#waitlist-status")).toContainText("Aucun email local trouvé");
    await expect(page.locator("#waitlist-status")).toHaveClass(/is-visible/);
  });

  test("exports a timestamped CSV filename", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "mp_waitlist_submissions",
        JSON.stringify([{ email: "export@example.com", lang: "fr" }]),
      );
    });
    await page.goto(WAITLIST_URL, { waitUntil: "domcontentloaded" });

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#waitlist-export").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^manabuplay-waitlist-local-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/);
  });
});
