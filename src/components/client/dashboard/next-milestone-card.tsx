import { CalendarDays, CheckCircle2, Circle, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/client/empty-state";

// Accept `string` so callers don't need to narrow before passing DB data.
// The STATUS_CONFIG lookup falls back to "upcoming" for unknown values.
type MilestoneStatus = "upcoming" | "in_progress" | "done";

function isMilestoneStatus(s: string): s is MilestoneStatus {
  return s === "upcoming" || s === "in_progress" || s === "done";
}

interface Milestone {
  id: string;
  name: string;
  status: string;
  due_at: string | null;
  display_order: number;
}

interface NextMilestoneCardProps {
  milestones: Milestone[];
}

const STATUS_CONFIG: Record<
  MilestoneStatus,
  { label: string; icon: React.ReactNode; variant: "secondary" | "default" | "outline" }
> = {
  upcoming: {
    label: "Upcoming",
    icon: <Circle className="size-3.5" aria-hidden="true" />,
    variant: "secondary",
  },
  in_progress: {
    label: "In progress",
    icon: <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />,
    variant: "default",
  },
  done: {
    label: "Done",
    icon: <CheckCircle2 className="size-3.5" aria-hidden="true" />,
    variant: "outline",
  },
};

/**
 * Shows the next non-done milestone, ordered by display_order ascending.
 * If all milestones are done, shows a celebration empty state.
 *
 * Uses `.at(0)` instead of `[0]` so TypeScript infers `Milestone | undefined`
 * (array index access without noUncheckedIndexedAccess returns `T`, not `T | undefined`).
 */
export function NextMilestoneCard({ milestones }: NextMilestoneCardProps) {
  const next: Milestone | undefined = milestones
    .filter((m) => m.status !== "done")
    .sort((a, b) => a.display_order - b.display_order)
    .at(0);

  const allDone = milestones.length > 0 && next === undefined;

  return (
    <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
      <h2 className="text-foreground mb-4 text-sm font-semibold">Next milestone</h2>

      {milestones.length === 0 && (
        <EmptyState
          title="No milestones yet"
          description="Milestones will appear here once your project is set up."
          className="py-4"
        />
      )}

      {allDone && (
        <EmptyState
          icon={<CheckCircle2 className="size-5 text-green-500" aria-hidden="true" />}
          title="All milestones complete"
          description="Great work — your project has reached all its milestones."
          className="py-4"
        />
      )}

      {next && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-foreground leading-snug font-medium">{next.name}</p>
            {(() => {
              const safeStatus = isMilestoneStatus(next.status) ? next.status : "upcoming";
              const cfg = STATUS_CONFIG[safeStatus];
              return (
                <Badge variant={cfg.variant} className="flex shrink-0 items-center gap-1">
                  {cfg.icon}
                  {cfg.label}
                </Badge>
              );
            })()}
          </div>

          {next.due_at && (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              <time dateTime={next.due_at}>
                {new Date(next.due_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
