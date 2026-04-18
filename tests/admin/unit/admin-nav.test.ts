import { describe, expect, it } from "vitest";
import { ADMIN_NAV_CSS, getAdminNavHtml } from "../../../apps/admin/src/lib/admin-nav";

describe("admin nav", () => {
  it("exports the topnav CSS shell", () => {
    expect(ADMIN_NAV_CSS).toContain(".admin-topnav");
    expect(ADMIN_NAV_CSS).toContain("Chakra Petch");
  });

  it("marks the active section and keeps other links available", () => {
    const html = getAdminNavHtml("architecture");

    expect(html).toContain('href="/pilotage/architecture"');
    expect(html).toContain('class="admin-topnav__link is-active" href="/pilotage/architecture"');
    expect(html).toContain('href="/pilotage/backlog"');
    expect(html).toContain(">Accueil</a>");
    expect(html).toContain('data-admin-public href="http://localhost:4321/"');
    expect(html).toContain(">ManabuPlay</a>");
  });

  it("groups and opens mockup routes under the active mockups drawer", () => {
    const html = getAdminNavHtml("mockups");

    expect(html).toContain('<details class="admin-topnav__group is-active" open>');
    expect(html.match(/admin-topnav__link is-active/g)?.length).toBe(1);
    expect(html).toContain("/design/mockups/answer-cards");
    expect(html).not.toContain("/design/mockups/tier-breakdown");
  });

  it("escapes attribute quotes in href values", () => {
    const html = getAdminNavHtml("hub");

    expect(html).not.toContain('href="/admin" label=');
    expect(html).toContain("data-admin-lang");
  });

  it("includes drawer behavior for exclusive and external close", () => {
    const html = getAdminNavHtml("hub");

    expect(html).toContain("function closeGroups");
    expect(html).toContain("group.addEventListener('toggle'");
    expect(html).toContain("document.addEventListener('click'");
    expect(html).toContain("event.key==='Escape'");
  });
});
