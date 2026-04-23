import type { APIRoute } from "astro";
import { getRoadmapPayload } from "../../lib/admin-roadmap";

export const GET: APIRoute = () => {
  return Response.json(getRoadmapPayload());
};
