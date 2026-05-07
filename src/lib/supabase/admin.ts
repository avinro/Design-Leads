import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

/*
 * Supabase admin client — uses the service-role key, which bypasses RLS.
 *
 * IMPORTANT: This client must never be imported in client components or
 * passed to the browser. The `server-only` import above causes a build-time
 * error if this module is ever bundled for the client.
 *
 * Use only in Server Actions and Route Handlers that require elevated
 * write privileges (e.g. inserting contact_submissions without an auth session).
 */
function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "Set it in .env.local (never with a NEXT_PUBLIC_ prefix).",
    );
  }
  return key;
}

// Lazy singleton — avoids creating a new client on every request in dev.
let adminClient: ReturnType<typeof createSupabaseClient> | undefined;

export function createAdminClient() {
  if (adminClient) return adminClient;

  const { supabaseUrl } = getSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();

  adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable auto-refresh and session persistence — admin client is
      // server-only and never represents a user session.
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
