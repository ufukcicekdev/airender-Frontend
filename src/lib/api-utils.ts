/** DRF PageNumberPagination shape */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Normalize list endpoints — plain array or paginated `{ results }`. */
export function unwrapList<T>(data: T[] | PaginatedResponse<T> | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object" && "results" in data && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

/**
 * Join API path segments without double slashes.
 * Does not add trailing slash (auth/workflow routes use slashless paths).
 */
export function apiPath(...segments: string[]): string {
  return (
    "/" +
    segments
      .map((s) => s.replace(/^\/+|\/+$/g, ""))
      .filter(Boolean)
      .join("/")
  );
}
