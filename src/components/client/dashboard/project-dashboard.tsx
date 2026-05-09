import { createClient } from "@/lib/supabase/server";
import { loadProjectDashboardData } from "@/lib/client-portal/project-dashboard-data";
import { EmptyState } from "@/components/client/empty-state";
import { PageHeader } from "@/components/client/page-header";
import { PhaseProgressCard } from "./phase-progress-card";
import { NextMilestoneCard } from "./next-milestone-card";
import { PendingFromYouCard } from "./pending-from-you-card";
import { RecentActivityCard } from "./recent-activity-card";
import { QuickLinksCard } from "./quick-links-card";

interface ProjectDashboardProps {
  projectId: string;
  accountName: string;
}

/**
 * Server Component that fetches all data for one project dashboard and
 * composes the section cards.
 *
 * Data fetching is delegated to `loadProjectDashboardData` (server-only lib)
 * which follows the same cast pattern as context.ts, keeping type-aware lint
 * rules satisfied without modifying the shared supabase server client helper.
 */
export async function ProjectDashboard({ projectId, accountName }: ProjectDashboardProps) {
  const supabase = await createClient();
  const data = await loadProjectDashboardData(supabase, projectId);

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <EmptyState
          title="Project not found"
          description="This project does not exist or you do not have access to it."
        />
      </div>
    );
  }

  const { project, milestones, deliverables, comments, intakeForm } = data;
  const phaseLabel = project.current_phase.split("_").join(" ");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow={accountName}
        title={project.name}
        subtitle={`Current phase: ${phaseLabel}`}
      />

      {/* Phase progress — full width */}
      <PhaseProgressCard currentPhase={project.current_phase} />

      {/* Two-column section on sm+; stacked on mobile */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NextMilestoneCard milestones={milestones} />
        <PendingFromYouCard deliverables={deliverables} intakeForm={intakeForm} />
      </div>

      {/* Two-column section on lg+; single column below */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentActivityCard
          deliverables={deliverables}
          comments={comments}
          milestones={milestones}
        />
        <QuickLinksCard />
      </div>
    </div>
  );
}
