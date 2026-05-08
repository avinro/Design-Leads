import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Returns the currently authenticated Supabase user, or null.
 *
 * Always uses auth.getUser() — never auth.getSession() — so the JWT is
 * validated server-side on every call. getSession() is not safe for
 * authorization decisions in server code.
 */
export async function getAuthenticatedUser(client: SupabaseClient): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Returns true if the authenticated user is the platform system owner.
 * Calls the is_system_owner() SECURITY DEFINER RPC which reads
 * public.system_owners without exposing the table directly.
 */
export async function isSystemOwner(client: SupabaseClient): Promise<boolean> {
  const result = await client.rpc("is_system_owner");
  if (result.error) return false;
  return (result.data as boolean | null) === true;
}

/**
 * Returns true if the given user has a confirmed membership in any account
 * (joined_at is not null). Used to gate access to /client/* routes.
 *
 * Queries account_members under the user's own session, so RLS applies:
 * users can only see their own rows.
 */
export async function hasClientMembership(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client
    .from("account_members")
    .select("id")
    .not("joined_at", "is", null)
    .limit(1)
    .maybeSingle();

  if (error) return false;
  return data !== null;
}
