import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isSystemOwner } from "@/lib/auth/access";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = {
  title: "Invite client",
  robots: { index: false },
};

/**
 * /owner/invite — minimal owner-only form to invite a client to an account.
 *
 * Access: system owner only. notFound() is returned for anyone else so the
 * route is not discoverable by client users.
 *
 * Fetches the list of accounts server-side so the form can auto-select if
 * only one account exists, or show a dropdown for multi-account scenarios.
 */
export default async function OwnerInvitePage() {
  const supabase = await createClient();
  const ownerAccess = await isSystemOwner(supabase);
  if (!ownerAccess) notFound();

  // Load accounts visible to this user under RLS.
  const { data: accounts } = await supabase.from("accounts").select("id, name").order("name");

  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center px-4 py-16"
    >
      <InviteForm accounts={accounts ?? []} />
    </main>
  );
}
