import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderKanban } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Client Detail — Owner Workspace",
  robots: { index: false },
};

interface Props {
  params: Promise<{ accountId: string }>;
}

/**
 * /owner/clients/[accountId] — client detail view (stubs F3-15).
 *
 * Validates the accountId param against the database so unknown IDs return
 * a 404 rather than an empty shell. Real content (project list, member list,
 * activity timeline) will be implemented in F3-15.
 */
export default async function OwnerClientDetailPage({ params }: Props) {
  const { accountId } = await params;

  const supabase = await createClient();
  const { data: account } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("id", accountId)
    .maybeSingle();
  if (!account) return notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Client"
        title={account.name}
        subtitle="Projects, members, and activity for this client account."
      />
      <EmptyState
        icon={<FolderKanban className="size-6" />}
        title="Client detail coming soon"
        description="Project list, member management, and activity feed will appear here in F3-15."
      />
    </div>
  );
}
