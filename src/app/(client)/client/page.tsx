import type { Metadata } from "next";
import { BarChart2, Clock, ListChecks } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { loadClientPortalContext } from "@/lib/client-portal/context";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";

export const metadata: Metadata = {
  title: "Dashboard — Client Portal",
  robots: { index: false },
};

/**
 * /client — Client portal dashboard.
 *
 * Shows the active project summary or an empty state when the account has
 * no projects yet. Three placeholder cards (Phase progress, Pending from you,
 * Recent activity) establish the visual rhythm PRO-39 will fill in.
 *
 * Route protection is enforced upstream in proxy.ts (updateSession).
 */
export default async function ClientPage() {
  const supabase = await createClient();
  const context = await loadClientPortalContext(supabase);

  if (!context) return null;

  if (!context.hasProjects) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="bg-card border-border w-full max-w-sm rounded-xl border p-8 text-center shadow-sm">
          <p className="text-foreground mb-1 text-base font-semibold">No projects yet</p>
          <p className="text-muted-foreground text-sm">
            Your project owner will set things up — you&apos;ll see updates here once it&apos;s
            ready.
          </p>
          <p className="text-muted-foreground mt-6 text-xs">
            Signed in as <span className="text-foreground font-medium">{context.user.email}</span>
          </p>
        </div>
      </div>
    );
  }

  const project = context.activeProject;
  if (!project) return null;

  const phaseLabel = project.currentPhase.split("_").join(" ");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow={context.account.name}
        title={project.name}
        subtitle={`Current phase: ${phaseLabel}`}
        action={
          <Badge variant="outline" className="capitalize">
            {phaseLabel}
          </Badge>
        }
      />

      {/* Three intentional placeholder cards — PRO-39 will replace with real data */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Phase progress */}
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 className="text-muted-foreground size-4" aria-hidden="true" />
            <span className="text-foreground text-sm font-semibold">Phase progress</span>
          </div>
          <EmptyState
            title="Coming soon"
            description="Phase milestones and progress will appear here."
            className="py-6"
          />
        </div>

        {/* Pending from you */}
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ListChecks className="text-muted-foreground size-4" aria-hidden="true" />
            <span className="text-foreground text-sm font-semibold">Pending from you</span>
          </div>
          <EmptyState
            title="Nothing pending"
            description="Items requiring your feedback or approval will appear here."
            className="py-6"
          />
        </div>

        {/* Recent activity */}
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="text-muted-foreground size-4" aria-hidden="true" />
            <span className="text-foreground text-sm font-semibold">Recent activity</span>
          </div>
          <EmptyState
            title="No recent activity"
            description="Deliverables, comments, and milestone updates will appear here."
            className="py-6"
          />
        </div>
      </div>
    </div>
  );
}
