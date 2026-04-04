import fs from "node:fs";
import path from "node:path";
import { ADMIN_NAV_CSS, getAdminNavHtml, type AdminNavKey } from "./admin-nav";

type AdminDocName = "brand-system" | "fx-lab" | "answer-card-mockup" | "tier-breakdown-mockup";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs");
const assetsDir = path.join(docsDir, "assets");

function readText(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function getDocActiveKey(docName: AdminDocName): AdminNavKey {
  if (docName === "answer-card-mockup" || docName === "tier-breakdown-mockup") {
    return "mockups";
  }
  return docName === "fx-lab" ? "fx-lab" : "brand-system";
}

function inlineDocAssets(html: string, docName: AdminDocName) {
  const fxPreviewCss = readText(path.join(assetsDir, "fx-preview.css"));
  const fxPresetStoreJs = readText(path.join(assetsDir, "fx-preset-store.js"));
  const fxLabJs = readText(path.join(assetsDir, "fx-lab.js"));
  const adminNav = getAdminNavHtml(getDocActiveKey(docName));

  return html
    .replace(
      '<link rel="stylesheet" href="./assets/fx-preview.css" />',
      `<style>\n${fxPreviewCss}\n</style>\n<style>\n${ADMIN_NAV_CSS}\n</style>`,
    )
    .replace(
      '<script src="./assets/fx-preset-store.js"></script>',
      `<script>\n${fxPresetStoreJs}\n</script>`,
    )
    .replace(
      '<script src="./assets/fx-lab.js"></script>',
      `<script>\n${fxLabJs}\n</script>`,
    )
    .replaceAll('../public/fonts/Joystix.woff', '/fonts/Joystix.woff')
    .replaceAll('./fx-lab.html', '/admin/fx-lab')
    .replaceAll('./brand-system.html#fx-preview', '/admin/brand-system#fx-preview')
    .replace(
      "</head>",
      docName === "answer-card-mockup" || docName === "tier-breakdown-mockup"
        ? `<style>\n${ADMIN_NAV_CSS}\n</style>\n</head>`
        : "</head>",
    )
    .replace(
      docName === "answer-card-mockup" || docName === "tier-breakdown-mockup" ? "<body>" : "<main class=\"page\">",
      docName === "answer-card-mockup" || docName === "tier-breakdown-mockup"
        ? `<body>\n${adminNav}`
        : `<main class="page">\n    ${adminNav}`,
    )
    .replace(
      docName === "answer-card-mockup" || docName === "tier-breakdown-mockup" ? "<body>\r\n" : "<main class=\"page\">\r\n",
      docName === "answer-card-mockup" || docName === "tier-breakdown-mockup"
        ? `<body>\r\n${adminNav}\r\n`
        : `<main class="page">\r\n    ${adminNav}\r\n`,
    );
}

export function getAdminDocumentHtml(docName: AdminDocName) {
  const docPath = path.join(docsDir, `${docName}.html`);
  return inlineDocAssets(readText(docPath), docName);
}
