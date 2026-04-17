import { getAdminDocumentHtml } from "../../../lib/admin-documents";

export const prerender = true;

export async function GET() {
  return new Response(getAdminDocumentHtml("tier-breakdown-mockup"), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
