import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

// Singleton avoids duplicate auth listeners and storage races across React renders.
let client: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (client) return client;

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    isSingleton: true,
  });

  return client;
}
