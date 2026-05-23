import { type NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy-request";

async function handle(req: NextRequest) {
  return proxyToBackend(req, req.nextUrl.pathname);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
