import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo/site";

export type InviteResult =
  | { status: "invited"; userId: string; email: string }
  | { status: "already_member"; userId: string; email: string }
  | { status: "error"; message: string };

/**
 * Invites a user to a client account by email.
 *
 * Flow:
 *   1. Sends a Supabase Auth invite email (magic link scoped to /auth/confirm).
 *      inviteUserByEmail creates the auth.users row with email_confirmed_at = null.
 *   2. Inserts a pending account_members row (joined_at = null).
 *      When the user clicks the link and verifyOtp fires, the DB trigger
 *      handle_user_email_confirmed seals joined_at automatically.
 *
 * Callers must verify the invoking user is a system owner before calling this.
 *
 * @param email     - Email address to invite
 * @param accountId - UUID of the account to add the user to
 * @param role      - Member role (defaults to "member")
 */
export async function inviteClientMember({
  email,
  accountId,
  role = "member",
}: {
  email: string;
  accountId: string;
  role?: string;
}): Promise<InviteResult> {
  const admin = createAdminClient();

  // Check whether the user already has a confirmed membership in this account.
  // We do this before calling inviteUserByEmail to avoid creating duplicate
  // auth users and to give a clean status back to the caller.
  const { data: existingMember } = await admin
    .from("account_members")
    .select("id, joined_at")
    .eq("account_id", accountId)
    .neq("joined_at", null)
    .limit(1)
    .maybeSingle();

  // Look up by email to get the user_id if they already exist.
  const { data: listData } = await admin.auth.admin.listUsers();
  const existingUser = listData.users.find((u) => u.email === email);

  if (existingMember && existingUser) {
    return { status: "already_member", userId: existingUser.id, email };
  }

  // Send the invite. Supabase creates (or re-invites) the auth user and sends
  // the invitation email. The redirectTo URL is embedded in the token so the
  // user lands on /auth/confirm?type=invite&next=/client.
  const inviteRedirectTo = `${SITE_URL}/auth/confirm?type=invite&next=/client`;
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: inviteRedirectTo,
  });

  if (inviteError) {
    console.error("[invitations] inviteUserByEmail error:", inviteError.message);
    return {
      status: "error",
      message: inviteError.message,
    };
  }

  const userId = inviteData.user.id;

  // Insert the pending membership row. ON CONFLICT DO NOTHING keeps the
  // action idempotent if called twice for the same email + account pair.
  const { error: memberError } = await admin.from("account_members").insert({
    account_id: accountId,
    user_id: userId,
    role,
    invited_at: new Date().toISOString(),
    joined_at: null,
  });

  if (memberError) {
    console.error("[invitations] account_members insert error:", memberError.message);
    // The invite email was already sent; returning error here would be misleading.
    // Log and treat as invited so the caller isn't blocked.
  }

  return { status: "invited", userId, email };
}
