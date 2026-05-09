import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Settings — Owner Workspace",
  robots: { index: false },
};

/**
 * /owner/settings — owner workspace settings (stubs a future F3 issue).
 *
 * Placeholder page that ships with the (owner) shell so the primary nav
 * destination never returns a 404. Real content (profile, notifications,
 * billing) will be implemented in a future F3 issue.
 */
export default function OwnerSettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Owner Workspace"
        title="Settings"
        subtitle="Profile, notifications, and workspace configuration."
      />
      <EmptyState
        icon={<Settings className="size-6" />}
        title="Settings coming soon"
        description="Profile management and workspace configuration will appear here."
      />
    </div>
  );
}
