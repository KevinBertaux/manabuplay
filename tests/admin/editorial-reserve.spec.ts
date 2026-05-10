import { expect, test } from "@playwright/test";
import { ADMIN_URL } from "./helpers/admin";

const RESERVE_URL = `${ADMIN_URL}content/editorial-reserve/`;

test.describe("admin editorial reserve", () => {
  test("shows the unified editorial reserve and future pack reading area", async ({ page }) => {
    await page.goto(RESERVE_URL, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Réserve éditoriale/i);
    await expect(page.locator(".catalog-hero")).toContainText("Réserve éditoriale");
    await expect(page.locator(".catalog-stats")).toContainText("Actifs cachés");
    await expect(page.locator(".catalog-stats")).toContainText("170");
    await expect(page.locator(".catalog-stats")).toContainText("0");
    await expect(page.locator(".catalog-stats")).toHaveCSS("display", "grid");
    await expect(page.locator(".catalog-stats")).toHaveCSS("grid-template-columns", /.+ .+ .+ .+/);
    await expect(page.getByRole("heading", { name: "Champs obligatoires" })).toHaveCount(0);
    await expect(page.getByText("Tier à trier")).toHaveCount(0);
    await expect(page.getByText("romaji à trier")).toHaveCount(20);
    await expect(page.getByRole("heading", { name: "Mots actifs" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Éléments à trier" })).toHaveCount(0);
    await expect(page.locator(".catalog-tier-drawer")).toHaveCount(5);
    await expect(page.locator(".catalog-tier-drawer[open]")).toHaveCount(0);
    await expect(page.locator(".catalog-tier-summary")).toContainText([
      "T1",
      "T2",
      "T3",
      "T4",
      "À écrire / à trier",
    ]);
    await expect(page.getByRole("heading", { name: "Pistes futures" })).toBeVisible();
  });
});
