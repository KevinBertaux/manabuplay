import { describe, expect, it } from "vitest";
import { ADMIN_NAV_CSS, getAdminNavHtml } from "../../src/lib/admin-nav";

describe("admin nav", () => {
  it("exports the topnav CSS shell", () => {
    expect(ADMIN_NAV_CSS).toContain(".admin-topnav");
    expect(ADMIN_NAV_CSS).toContain("Chakra Petch");
  });

  it("marks the active section and keeps other links available", () => {
    const html = getAdminNavHtml("architecture");

    expect(html).toContain('href="/admin/architecture-plan"');
    expect(html).toContain('class="admin-topnav__link is-active" href="/admin/architecture-plan"');
    expect(html).toContain('href="/admin/backlog"');
    expect(html).toContain('href="/"');
  });

  it("activates both mockup routes under the mockups tab", () => {
    const html = getAdminNavHtml("mockups");

    expect(html.match(/admin-topnav__link is-active/g)?.length).toBe(2);
    expect(html).toContain("/admin/mockups/answer-cards");
    expect(html).toContain("/admin/mockups/tier-breakdown");
  });

  it("escapes attribute quotes in href values", () => {
    const html = getAdminNavHtml("hub");

    expect(html).not.toContain('href="/admin" label=');
    expect(html).toContain("data-admin-lang");
  });
});
