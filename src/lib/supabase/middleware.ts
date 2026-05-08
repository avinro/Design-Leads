import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  isClientPath,
  isOutreachPath,
  isOwnerPath,
  isPublicPath,
  sanitizeNext,
} from "@/lib/auth/paths";
import { getAuthenticatedUser, hasClientMembership, isSystemOwner } from "@/lib/auth/access";
import { getSupabaseEnv } from "./env";

/**
 * updateSession — called on every matched request from proxy.ts.
 *
 * Responsibilities:
 *   1. Refresh the Supabase session cookie so Server Components always see
 *      a valid, up-to-date token (existing behaviour).
 *   2. Enforce route-level access gates:
 *      - /client/*   → authenticated account member required
 *      - /outreach/* → system owner required
 *      - /owner/*    → system owner required
 *   3. Redirect unauthenticated or unauthorised requests appropriately.
 *
 * Authorization is always server-validated (auth.getUser(), RPC calls).
 * Client-side checks in components are decorative only.
 *
 * Cookie note: @supabase/ssr sets Secure+SameSite=Lax cookies in production
 * automatically. We do not force HttpOnly because the browser client needs
 * to read the refresh token to maintain the session. This matches the
 * official Supabase SSR recommendation.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Always call getUser() — this refreshes the token and validates the JWT
  // with the Supabase Auth server. The result is used for gate decisions below.
  const user = await getAuthenticatedUser(supabase);

  // ── Public paths: no gate needed ──────────────────────────────────────────
  if (isPublicPath(pathname)) {
    return response;
  }

  // ── /client/* gate: authenticated + confirmed account member ──────────────
  if (isClientPath(pathname)) {
    if (!user) {
      return redirectToLogin(request, pathname);
    }
    const member = await hasClientMembership(supabase);
    if (!member) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return response;
  }

  // ── /outreach/* and /owner/* gates: system owner only ────────────────────
  if (isOutreachPath(pathname) || isOwnerPath(pathname)) {
    if (!user) {
      return redirectToLogin(request, pathname);
    }
    const owner = await isSystemOwner(supabase);
    if (!owner) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return response;
  }

  // All other matched paths (e.g. future authenticated sections) — just
  // ensure the session cookie is refreshed.
  return response;
}

/** Builds a /login redirect that preserves the intended destination. */
function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const loginUrl = new URL("/login", request.url);
  // sanitizeNext ensures the return path is a safe relative URL.
  loginUrl.searchParams.set("next", sanitizeNext(pathname));
  return NextResponse.redirect(loginUrl);
}
