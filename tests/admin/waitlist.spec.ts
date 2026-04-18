import { expect, test, type Page } from "@playwright/test";
import { ADMIN_URL, PUBLIC_URL } from "./helpers/admin";

const WAITLIST_URL = `${ADMIN_URL}ops/waitlist/`;
const PUBLIC_FR_URL = `${PUBLIC_URL}fr/`;

type WaitlistEntry = {
  email: string;
  lang: string;
  source?: string;
  formName?: string;
  createdAt?: string;
  page?: string;
};

async function seedPublicWaitlist(page: Page, entries: WaitlistEntry[] | null) {
  await page.goto(PUBLIC_FR_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate((payload: WaitlistEntry[] | null) => {
    if (payload === null) {
      localStorage.removeItem("mp_waitlist_submissions");
      return;
    }

    localStorage.setItem("mp_waitlist_submissions", JSON.stringify(payload));
  }, entries);
}

test.describe("admin waitlist", () => {
  test("renders local waitlist submissions", async ({ page }) => {
    await seedPublicWaitlist(page, [
      {
        email: "machin.truc+site@mail.tld",
        lang: "fr",
        source: "localStorage",
        formName: "manabuplay-waitlist",
        createdAt: "2026-04-15T12:00:00.000Z",
        page: "/#email",
      },
    ]);

    await page.goto(WAITLIST_URL, { waitUntil: "domcontentloaded" });
    await page.locator("#waitlist-refresh").click();

    await expect(page).toHaveTitle(/Waitlist locale/i);
    await expect(page.locator("#waitlist-count")).toHaveText("1");
    await expect(page.locator("#waitlist-body")).toContainText("machin.truc+site@mail.tld");
  });

  test("can clear and export the local waitlist mock", async ({ page }) => {
    await seedPublicWaitlist(page, [{ email: "export@example.com", lang: "fr" }]);
    await page.goto(WAITLIST_URL, { waitUntil: "domcontentloaded" });

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#waitlist-export").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^manabuplay-waitlist-local-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/,
    );

    await page.locator("#waitlist-clear").click();
    await expect(page.locator("#waitlist-count")).toHaveText("0");
    await expect(page.locator("#waitlist-empty")).toBeVisible();
  });
});
