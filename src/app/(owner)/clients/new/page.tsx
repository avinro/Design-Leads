import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "New Client — Owner Workspace",
  robots: { index: false },
};

/**
 * /owner/clients/new — add a new client account (stubs F3-14b).
 *
 * Placeholder page that ships with the (owner) shell. Real content
 * (account creation form) will be implemented in F3-14b.
 */
export default function OwnerClientsNewPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Clients"
        title="New Client"
        subtitle="Create a new client account and invite the first member."
      />
      <EmptyState
        icon={<UserPlus className="size-6" />}
        title="Client creation form coming soon"
        description="Account setup form will be implemented in F3-14b."
      />
    </div>
  );
}
