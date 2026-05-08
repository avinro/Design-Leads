/**
 * Route classification helpers and return-URL sanitization for PRO-37 auth.
 * These are pure functions with no I/O — safe to import on both client and
 * server, but only used by server-side middleware and server actions in practice.
 */

/** Routes that require an authenticated account member. */
export function isClientPath(pathname: string): boolean {
  return pathname.startsWith("/client");
}

/**
 * Routes that require system-owner access (the solo designer / platform admin).
 * Outreach is owner-only because it contains private lead pipeline data.
 */
export function isOutreachPath(pathname: string): boolean {
  return pathname.startsWith("/outreach");
}

/**
 * Routes that are owner-only management surfaces (/owner/invite, etc.).
 * These must never be accessible to client-portal users.
 */
export function isOwnerPath(pathname: string): boolean {
  return pathname.startsWith("/owner");
}

/**
 * Returns true for paths that are always publicly accessible and should
 * never be subject to auth redirects (login page, auth callbacks, public
 * portfolio pages, static assets, etc.).
 */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/unauthorized") ||
    // Public portfolio routes
    pathname === "/" ||
    pathname.startsWith("/work") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/lab") ||
    pathname.startsWith("/dev")
  );
}

/**
 * Sanitizes a raw `next` query param to a safe relative path.
 *
 * Rules:
 * - Must start with "/" (relative, same origin).
 * - Must not start with "//" (would be interpreted as a protocol-relative URL
 *   by the browser and could redirect to an attacker-controlled domain).
 * - Falls back to `fallback` (default "/") when the value is invalid.
 */
export function sanitizeNext(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  return fallback;
}
