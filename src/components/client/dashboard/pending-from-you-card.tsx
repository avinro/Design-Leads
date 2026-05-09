import { AlertCircle, FileText } from "lucide-react";

import { EmptyState } from "@/components/client/empty-state";

interface PendingDeliverable {
  id: string;
  title: string;
  status: string;
}

interface PendingIntakeForm {
  id: string;
  submitted_at: string | null;
  /** True when the form has at least one field defined in the schema. */
  hasFilled: boolean;
}

interface PendingFromYouCardProps {
  deliverables: PendingDeliverable[];
  intakeForm: PendingIntakeForm | null;
}

/**
 * Derives "pending from client" items from concrete DB signals:
 *
 * 1. Intake form not yet submitted (submitted_at IS NULL and schema is non-empty).
 * 2. Deliverables with status = 'published' — the owner has published them and
 *    the client needs to review/approve (next states: approved | rejected).
 *
 * Action buttons are placeholders today (PRO-41 / PRO-42 not yet shipped);
 * they are rendered as disabled with a coming-soon tooltip to be honest about
 * the current state without hiding the feature intent.
 */
export function PendingFromYouCard({ deliverables, intakeForm }: PendingFromYouCardProps) {
  const pendingDeliverables = deliverables.filter((d) => d.status === "published");
  const intakePending =
    intakeForm !== null && intakeForm.submitted_at === null && intakeForm.hasFilled;

  const items = [
    ...pendingDeliverables.map((d) => ({
      id: `deliverable-${d.id}`,
      icon: <FileText className="size-4 shrink-0 text-amber-500" aria-hidden="true" />,
      label: `Review: ${d.title}`,
      actionLabel: "Review deliverable",
    })),
    ...(intakePending
      ? [
          {
            id: "intake-form",
            icon: <AlertCircle className="size-4 shrink-0 text-amber-500" aria-hidden="true" />,
            label: "Project intake form not yet submitted",
            actionLabel: "Fill out form",
          },
        ]
      : []),
  ];

  return (
    <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-foreground text-sm font-semibold">Pending from you</h2>
        {items.length > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing pending"
          description="Items requiring your feedback or approval will appear here."
          className="py-4"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                {item.icon}
                <p className="text-foreground text-sm leading-snug">{item.label}</p>
              </div>
              {/* Coming-soon action — enabled once PRO-41 / PRO-42 ship */}
              <button
                type="button"
                disabled
                title="This action will be available soon"
                className="text-muted-foreground hover:text-foreground shrink-0 cursor-not-allowed text-xs underline underline-offset-2 opacity-50 transition-colors"
                aria-disabled="true"
              >
                {item.actionLabel}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
