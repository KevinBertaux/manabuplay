import { describe, expect, it } from "vitest";
import { getAdminDocumentHtml } from "../../src/lib/admin-documents";

describe("admin documents", () => {
  it("inlines assets and nav into the FX Lab document", () => {
    const html = getAdminDocumentHtml("fx-lab");

    expect(html).toContain("admin-topnav");
    expect(html).toContain("fx-preview");
    expect(html).toContain("/admin/brand-system#fx-preview");
    expect(html).not.toContain('<script src="./assets/fx-lab.js"></script>');
    expect(html).not.toContain('<link rel="stylesheet" href="./assets/fx-preview.css" />');
  });

  it("injects admin nav into mockup documents", () => {
    const html = getAdminDocumentHtml("answer-card-mockup");

    expect(html).toContain("<body>");
    expect(html).toContain("admin-topnav");
    expect(html).toContain("/admin/mockups/answer-cards");
    expect(html).toContain("Mockup UI");
    expect(html).not.toContain("../public/fonts/Joystix.woff");
  });
});
