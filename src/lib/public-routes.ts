/** Routes that work without authentication — no forced redirect to /login on session expiry. */
export function isPublicAppPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/login" || pathname === "/signup";
}
