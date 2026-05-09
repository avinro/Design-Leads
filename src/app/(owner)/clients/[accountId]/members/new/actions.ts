"use server";

import { notFound } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { isSystemOwner } from "@/lib/auth/access";
import { inviteClientMember } from "@/lib/auth/invitations";

const inviteSchema = z.object({
  email: z.email("Please enter a valid email address."),
  // accountId is validated server-side against the bound URL param, not trusted from form data.
  accountId: z.uuid("Invalid account."),
});

export type InviteState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

/**
 * Invite a member to the account identified by `expectedAccountId`.
 *
 * Security: `expectedAccountId` is injected via `.bind(null, accountId)` in
 * the page server component and never comes from user input. The hidden
 * `accountId` field in the form is for progressive-enhancement compatibility
 * only. Both values are compared here so a tampered form field cannot target
 * a different account.
 *
 * Defense in depth: even though middleware already gates this route to
 * system owners, this action re-checks `isSystemOwner()` to ensure it
 * cannot be called out-of-context (e.g. via direct fetch).
 */
export async function sendInvite(
  expectedAccountId: string,
  _prevState: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const supabase = await createClient();
  const ownerAccess = await isSystemOwner(supabase);
  if (!ownerAccess) notFound();

  const raw = {
    email: formData.get("email"),
    accountId: formData.get("accountId"),
  };

  // Reject if the submitted accountId does not match the URL-bound value.
  if (raw.accountId !== expectedAccountId) {
    return { status: "error", message: "Invalid account. Please reload and try again." };
  }

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const key = String(issue.path[0] ?? "");
      if (key) acc[key] = [...(acc[key] ?? []), issue.message];
      return acc;
    }, {});
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const { email, accountId } = parsed.data;
  const result = await inviteClientMember({ email, accountId });

  if (result.status === "error") {
    return { status: "error", message: result.message };
  }

  if (result.status === "already_member") {
    return {
      status: "success",
      message: `${email} is already a confirmed member of this account.`,
    };
  }

  return {
    status: "success",
    message: `Invitation sent to ${email}.`,
  };
}
