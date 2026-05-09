/**
 * Shared project phase constants used by both the client portal and the owner
 * dashboard. Centralised here so neither portal imports from the other.
 *
 * Phase order matches the DB enum constraint defined in PRO-36:
 * discovery → research → design → validation → delivery
 */

export const PHASES = ["discovery", "research", "design", "validation", "delivery"] as const;

export type Phase = (typeof PHASES)[number];

export const PHASE_LABELS: Record<Phase, string> = {
  discovery: "Discovery",
  research: "Research",
  design: "Design",
  validation: "Validation",
  delivery: "Delivery",
};

/**
 * Returns a human-readable label for a phase string.
 * Falls back to the raw value for unknown phases so callers never crash.
 */
export function phaseLabel(phase: string): string {
  return (PHASE_LABELS as Record<string, string | undefined>)[phase] ?? phase;
}

/**
 * Returns true when the project is still in an active (non-delivery) phase.
 * Used to determine the `Active` filter on the owner dashboard.
 */
export function isActivePhase(phase: string): boolean {
  return phase !== "delivery";
}
