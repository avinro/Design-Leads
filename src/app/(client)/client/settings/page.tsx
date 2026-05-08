import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Settings — Client Portal",
  robots: { index: false },
};

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and notification settings."
      />

      <div className="bg-card border-border flex flex-1 items-center justify-center rounded-xl border shadow-sm">
        <EmptyState
          icon={<Settings className="size-6" aria-hidden="true" />}
          title="Settings coming soon"
          description="Account preferences, notification controls, and member management will appear here."
        />
      </div>
    </div>
  );
}
