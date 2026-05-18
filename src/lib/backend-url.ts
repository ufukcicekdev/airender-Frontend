/** Django backend origin (no trailing slash). Used by SSR and runtime API proxy. */
export function getBackendOrigin(): string {
  return (
    process.env.API_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}
