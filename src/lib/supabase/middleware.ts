import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./env";

/**
 * Refreshes the Supabase session on every matched request and writes the
 * updated auth cookies back to the response. Runs from `proxy.ts` so that
 * navigations to Server Components keep a valid session even though
 * Server Components themselves cannot mutate cookies.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

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

  // Touching getUser() is what triggers the token refresh; the result is
  // intentionally discarded here. Authorization decisions belong in
  // Server Components, Server Actions or Route Handlers.
  await supabase.auth.getUser();

  return response;
}
