"use server";

import { notFound } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { isSystemOwner } from "@/lib/auth/access";
import { inviteClientMember } from "@/lib/auth/invitations";

const inviteSchema = z.object({
  email: z.email("Please enter a valid email address."),
  accountId: z.uuid("Please select a valid account."),
});

export type InviteState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export async function sendInvite(
  _prevState: InviteState,
  formData: FormData,
): Promise<InviteState> {
  // Gate: only the system owner may call this action.
  // notFound() is intentional — it avoids leaking the route to non-owners.
  const supabase = await createClient();
  const ownerAccess = await isSystemOwner(supabase);
  if (!ownerAccess) notFound();

  const raw = {
    email: formData.get("email"),
    accountId: formData.get("accountId"),
  };

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
