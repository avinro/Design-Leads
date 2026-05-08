import type { Metadata } from "next";
import { Files } from "lucide-react";

import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Files — Client Portal",
  robots: { index: false },
};

export default function FilesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Files" subtitle="Deliverables and shared documents from your project." />

      <div className="bg-card border-border flex flex-1 items-center justify-center rounded-xl border shadow-sm">
        <EmptyState
          icon={<Files className="size-6" aria-hidden="true" />}
          title="Files coming soon"
          description="Deliverables, design assets, and documents shared with you will appear here."
        />
      </div>
    </div>
  );
}
