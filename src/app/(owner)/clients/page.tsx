import type { Metadata } from "next";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Clients — Owner Workspace",
  robots: { index: false },
};

/**
 * /owner/clients — clients list (stubs F3-14b).
 *
 * Placeholder page that ships with the (owner) shell so the primary nav
 * destination never returns a 404. Real content (client list, add button,
 * status chips) will be implemented in F3-14b.
 */
export default function OwnerClientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Owner Workspace"
        title="Clients"
        subtitle="Manage your client accounts and portal access."
      />
      <EmptyState
        icon={<Users className="size-6" />}
        title="Client list coming soon"
        description="Account management, invitations, and member access will appear here in F3-14b."
      />
    </div>
  );
}
