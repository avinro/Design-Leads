import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Comments — Client Portal",
  robots: { index: false },
};

export default function CommentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Comments"
        subtitle="Feedback and discussion threads on your project deliverables."
      />

      <div className="bg-card border-border flex flex-1 items-center justify-center rounded-xl border shadow-sm">
        <EmptyState
          icon={<MessageSquare className="size-6" aria-hidden="true" />}
          title="Comments coming soon"
          description="Feedback threads anchored to specific deliverables and milestones will appear here."
        />
      </div>
    </div>
  );
}
