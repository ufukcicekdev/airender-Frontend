import { type NextRequest, NextResponse } from "next/server";
import { getBackendOrigin } from "@/lib/backend-url";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

export async function proxyToBackend(
  req: NextRequest,
  backendPath: string
): Promise<NextResponse> {
  const origin = getBackendOrigin();
  const target = new URL(backendPath, origin);
  target.search = req.nextUrl.search;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const fetchOpts: RequestInit = {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
    cache: "no-store",
  };

  let upstream = await fetch(target.toString(), fetchOpts);

  // Django APPEND_SLASH returns 301 when the proxy omits a trailing slash (Next normalizes URLs).
  // Follow one same-origin redirect so the browser gets 200, not a 301 axios won't follow.
  if (
    (req.method === "GET" || req.method === "HEAD") &&
    [301, 302, 307, 308].includes(upstream.status)
  ) {
    const location = upstream.headers.get("location");
    if (location) {
      const redirectTarget = new URL(location, origin);
      if (redirectTarget.origin === new URL(origin).origin) {
        upstream = await fetch(redirectTarget.toString(), fetchOpts);
      }
    }
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.append(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
