import { type NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy-request";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const segment = path?.length ? path.join("/") : "";
  return proxyToBackend(req, `/media/${segment}`);
}

export const GET = handle;
export const HEAD = handle;
