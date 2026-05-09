import { Badge } from "@/components/ui/badge";

const PHASES = ["discovery", "research", "design", "validation", "delivery"] as const;
type Phase = (typeof PHASES)[number];

const PHASE_LABELS: Record<Phase, string> = {
  discovery: "Discovery",
  research: "Research",
  design: "Design",
  validation: "Validation",
  delivery: "Delivery",
};

interface PhaseProgressCardProps {
  currentPhase: string;
}

/**
 * Displays the project's current phase with a step-based progress indicator.
 *
 * Phase order is fixed by the DB enum:
 * discovery → research → design → validation → delivery.
 *
 * Progress is expressed as "step N of 5" and rendered as a segmented bar
 * so it degrades gracefully at 375 px.
 */
export function PhaseProgressCard({ currentPhase }: PhaseProgressCardProps) {
  const phaseIndex = PHASES.indexOf(currentPhase as Phase);
  // Default to 0 if the value is somehow outside the enum (defensive).
  const activeIndex = phaseIndex === -1 ? 0 : phaseIndex;
  // Cast to a wider Record type so the lookup can return undefined for unknown
  // phases, making the ?? fallback necessary and type-safe.
  const label = (PHASE_LABELS as Record<string, string | undefined>)[currentPhase] ?? currentPhase;

  return (
    <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-foreground text-sm font-semibold">Current phase</h2>
        <Badge variant="secondary" className="capitalize">
          {label}
        </Badge>
      </div>

      {/* Segmented progress bar — 5 equal segments */}
      <div
        className="flex gap-1"
        role="progressbar"
        aria-label={`Phase ${String(activeIndex + 1)} of ${String(PHASES.length)}: ${label}`}
        aria-valuenow={activeIndex + 1}
        aria-valuemin={1}
        aria-valuemax={PHASES.length}
      >
        {PHASES.map((phase, i) => (
          <div
            key={phase}
            className={[
              "h-2 flex-1 rounded-full transition-colors",
              i <= activeIndex ? "bg-primary" : "bg-muted",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Step labels under the bar — hidden on very narrow viewports */}
      <ol className="mt-3 hidden grid-cols-5 sm:grid" aria-hidden="true">
        {PHASES.map((phase, i) => (
          <li
            key={phase}
            className={[
              "text-center text-[10px] leading-tight",
              i === activeIndex ? "text-foreground font-semibold" : "text-muted-foreground",
            ].join(" ")}
          >
            {PHASE_LABELS[phase]}
          </li>
        ))}
      </ol>
    </div>
  );
}

export { PHASES, PHASE_LABELS };
export type { Phase };
