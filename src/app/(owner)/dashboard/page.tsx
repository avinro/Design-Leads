import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";

import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Dashboard — Owner Workspace",
  robots: { index: false },
};

/**
 * /owner/dashboard — owner workspace dashboard (stubs F3-14).
 *
 * Placeholder page that ships with the (owner) shell. Real content
 * (recent activity, client overview, quick actions) will be implemented
 * in F3-14.
 */
export default function OwnerDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Owner Workspace"
        title="Dashboard"
        subtitle="Your overview of clients, projects, and activity."
      />
      <EmptyState
        icon={<LayoutDashboard className="size-6" />}
        title="Dashboard coming soon"
        description="Client summaries, recent activity, and quick actions will appear here in F3-14."
      />
    </div>
  );
}
