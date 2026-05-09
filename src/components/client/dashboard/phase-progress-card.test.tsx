import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PhaseProgressCard, PHASES, PHASE_LABELS } from "./phase-progress-card";

describe("PhaseProgressCard", () => {
  it("renders the current phase label as a badge", () => {
    const html = renderToStaticMarkup(<PhaseProgressCard currentPhase="design" />);
    expect(html).toContain("Design");
  });

  it.each(PHASES.map((phase, i) => ({ phase, expectedStep: i + 1 })))(
    "reports aria-valuenow=$expectedStep for phase $phase",
    ({ phase, expectedStep }) => {
      const html = renderToStaticMarkup(<PhaseProgressCard currentPhase={phase} />);
      expect(html).toContain(`aria-valuenow="${String(expectedStep)}"`);
    },
  );

  it("aria-valuemax is always 5", () => {
    const html = renderToStaticMarkup(<PhaseProgressCard currentPhase="discovery" />);
    expect(html).toContain('aria-valuemax="5"');
  });

  it("falls back to index 0 for an unknown phase value", () => {
    // `currentPhase` is typed as `string`, so no cast is needed.
    const html = renderToStaticMarkup(<PhaseProgressCard currentPhase="unknown_phase" />);
    // aria-valuenow should be 1 (index 0 + 1) when phase is unrecognized
    expect(html).toContain('aria-valuenow="1"');
  });

  it("renders all phase labels in the step list", () => {
    const html = renderToStaticMarkup(<PhaseProgressCard currentPhase="research" />);
    for (const label of Object.values(PHASE_LABELS)) {
      expect(html).toContain(label);
    }
  });
});
