import type { Metadata } from "next";
import { Inbox } from "lucide-react";

import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Inbox — Owner Workspace",
  robots: { index: false },
};

/**
 * /owner/inbox — comments inbox (stubs a future F3 issue).
 *
 * Placeholder page that ships with the (owner) shell so the primary nav
 * destination never returns a 404. Real content (unread comments, mentions,
 * feedback threads) will be implemented in a future F3 issue.
 */
export default function OwnerInboxPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Owner Workspace"
        title="Inbox"
        subtitle="Client comments, feedback, and mentions across all projects."
      />
      <EmptyState
        icon={<Inbox className="size-6" />}
        title="Inbox coming soon"
        description="Comments and feedback from clients across all projects will appear here."
      />
    </div>
  );
}
