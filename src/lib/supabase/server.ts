import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Implicit flow keeps email magic-links and invites verifiable across
      // browsers (no PKCE code_verifier cookie required). The /auth/confirm
      // route handler uses verifyOtp({ token_hash, type }) which only works
      // with implicit-flow tokens — PKCE tokens carry a "pkce_" prefix that
      // verifyOtp rejects.
      flowType: "implicit",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; Server Actions and Route Handlers can.
        }
      },
    },
  });
}
