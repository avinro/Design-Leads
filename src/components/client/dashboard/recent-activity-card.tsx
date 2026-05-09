import { CheckCircle2, FileUp, MessageSquare } from "lucide-react";

import { relativeTime } from "@/lib/format/relative-time";
import { EmptyState } from "@/components/client/empty-state";

interface ActivityDeliverable {
  id: string;
  title: string;
  uploaded_at: string | null;
  created_at: string;
}

interface ActivityComment {
  id: string;
  body: string;
  created_at: string;
}

interface ActivityMilestone {
  id: string;
  name: string;
  status: string;
  updated_at: string;
}

interface RecentActivityCardProps {
  deliverables: ActivityDeliverable[];
  comments: ActivityComment[];
  milestones: ActivityMilestone[];
  /** Injected in tests to avoid flaky "just now" boundaries. Defaults to Date.now(). */
  now?: number;
}

type ActivityEvent =
  | { type: "deliverable"; id: string; label: string; ts: number }
  | { type: "comment"; id: string; label: string; ts: number }
  | { type: "milestone"; id: string; label: string; ts: number };

const EVENT_ICON: Record<ActivityEvent["type"], React.ReactNode> = {
  deliverable: <FileUp className="size-4 shrink-0 text-blue-500" aria-hidden="true" />,
  comment: <MessageSquare className="size-4 shrink-0 text-violet-500" aria-hidden="true" />,
  milestone: <CheckCircle2 className="size-4 shrink-0 text-green-500" aria-hidden="true" />,
};

/**
 * Merges deliverable uploads, comments, and milestone completions into a
 * unified activity feed sorted by timestamp descending, capped at 5 items.
 *
 * Only `milestones` with `status = 'done'` are included to avoid noise.
 */
export function RecentActivityCard({
  deliverables,
  comments,
  milestones,
  now,
}: RecentActivityCardProps) {
  const events: ActivityEvent[] = [
    ...deliverables.map((d) => ({
      type: "deliverable" as const,
      id: `d-${d.id}`,
      label: `${d.title} uploaded`,
      ts: new Date(d.uploaded_at ?? d.created_at).getTime(),
    })),
    ...comments.map((c) => ({
      type: "comment" as const,
      id: `c-${c.id}`,
      label: `New comment: "${c.body.slice(0, 60)}${c.body.length > 60 ? "…" : ""}"`,
      ts: new Date(c.created_at).getTime(),
    })),
    ...milestones
      .filter((m) => m.status === "done")
      .map((m) => ({
        type: "milestone" as const,
        id: `m-${m.id}`,
        label: `Milestone complete: ${m.name}`,
        ts: new Date(m.updated_at).getTime(),
      })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

  return (
    <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
      <h2 className="text-foreground mb-4 text-sm font-semibold">Recent activity</h2>

      {events.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Deliverables, comments, and milestone updates will appear here."
          className="py-4"
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id} className="flex items-start gap-2.5">
              {EVENT_ICON[event.type]}
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm leading-snug">{event.label}</p>
                <time
                  dateTime={new Date(event.ts).toISOString()}
                  className="text-muted-foreground mt-0.5 block text-xs"
                >
                  {relativeTime(event.ts, now)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
