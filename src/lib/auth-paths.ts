const AUTH_PATHS = ["/login", "/register"];

/**
 * The page to return to after signing in. `next` comes from the URL, so anything that could
 * lead to another site ("//evil.example", "https://…", "/\evil.example") falls back to home.
 */
export const getSafeNextPath = (next: string | null | undefined): string => {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  const pathname = next.split(/[?#]/)[0];
  return AUTH_PATHS.includes(pathname) ? "/" : next;
};

const withNext = (path: string, next: string | null | undefined) => {
  const safeNext = getSafeNextPath(next);
  return safeNext === "/" ? path : `${path}?next=${encodeURIComponent(safeNext)}`;
};

export const loginPath = (next?: string | null) => withNext("/login", next);
export const registerPath = (next?: string | null) => withNext("/register", next);
