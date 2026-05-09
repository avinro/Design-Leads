import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isSystemOwner } from "@/lib/auth/access";
import { PageHeader } from "@/components/client/page-header";
import { InviteMemberForm } from "./invite-form";
import { sendInvite } from "./actions";

export const metadata: Metadata = {
  title: "Invite member — Owner Workspace",
  robots: { index: false },
};

interface Props {
  params: Promise<{ accountId: string }>;
}

/**
 * /owner/clients/[accountId]/members/new — invite a member to an account.
 *
 * Replaces the legacy /owner/invite route (see next.config.ts for the 301).
 *
 * Access: system owner only. notFound() is returned for non-owners so the
 * route is not discoverable by client users. The layout above also enforces
 * this via notFound(), but the check here guards the server action binding.
 *
 * Fetches the account server-side to validate the accountId param and to
 * show the account name in the form. Binds the accountId into the server
 * action so the form cannot target a different account via a tampered field.
 */
export default async function InviteMemberPage({ params }: Props) {
  const { accountId } = await params;

  const supabase = await createClient();

  const [ownerAccess, accountResult] = await Promise.all([
    isSystemOwner(supabase),
    supabase.from("accounts").select("id, name").eq("id", accountId).maybeSingle(),
  ]);

  if (!ownerAccess || !accountResult.data) return notFound();

  const account = accountResult.data;

  // Bind the trusted accountId into the server action so it cannot be
  // overridden by the hidden form field.
  const boundAction = sendInvite.bind(null, account.id);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow={account.name}
        title="Invite member"
        subtitle="Send a magic-link so a new member can join this account."
      />
      <InviteMemberForm accountId={account.id} accountName={account.name} action={boundAction} />
    </div>
  );
}
