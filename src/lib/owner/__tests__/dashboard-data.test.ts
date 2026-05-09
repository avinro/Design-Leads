import { describe, expect, it } from "vitest";

import {
  pickPrimaryProject,
  computeNextMilestone,
  computeLastActivity,
  countMembers,
} from "../dashboard-data";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const BASE_DATE = "2026-05-01T00:00:00.000Z";
const LATER_DATE = "2026-05-05T00:00:00.000Z";
const LATEST_DATE = "2026-05-09T00:00:00.000Z";

function makeProject(overrides: {
  id: string;
  account_id?: string;
  current_phase?: string;
  updated_at?: string;
}) {
  return {
    id: overrides.id,
    name: `Project ${overrides.id}`,
    account_id: overrides.account_id ?? "acc-1",
    current_phase: overrides.current_phase ?? "design",
    updated_at: overrides.updated_at ?? BASE_DATE,
  };
}

function makeMilestone(overrides: {
  id: string;
  project_id: string;
  status?: string;
  due_at?: string | null;
  display_order?: number;
  updated_at?: string;
}) {
  return {
    id: overrides.id,
    name: `Milestone ${overrides.id}`,
    status: overrides.status ?? "upcoming",
    due_at: overrides.due_at ?? null,
    display_order: overrides.display_order ?? 0,
    project_id: overrides.project_id,
    account_id: "acc-1",
    updated_at: overrides.updated_at ?? BASE_DATE,
  };
}

// Deliverable and comment rows carry milestone_id for the transform helpers.
// The helpers access it via (d as unknown as { milestone_id?: string }).
function makeDeliverable(milestoneId: string, updated_at: string) {
  return Object.assign(
    { id: `del-${milestoneId}`, account_id: "acc-1", updated_at },
    { milestone_id: milestoneId },
  );
}

function makeComment(milestoneId: string, created_at: string) {
  return Object.assign(
    { id: `cmt-${milestoneId}`, account_id: "acc-1", created_at },
    { milestone_id: milestoneId },
  );
}

// ─── pickPrimaryProject ───────────────────────────────────────────────────────

describe("pickPrimaryProject", () => {
  it("returns null for an empty project list", () => {
    expect(pickPrimaryProject([], [], [], [])).toBeNull();
  });

  it("returns the only project when there is exactly one", () => {
    const p = makeProject({ id: "p1" });
    expect(pickPrimaryProject([p], [], [], [])).toMatchObject({ id: "p1" });
  });

  it("selects the project with the most recent projects.updated_at when no milestones/deliverables/comments exist", () => {
    const old = makeProject({ id: "old", updated_at: BASE_DATE });
    const recent = makeProject({ id: "recent", updated_at: LATEST_DATE });
    expect(pickPrimaryProject([old, recent], [], [], [])).toMatchObject({ id: "recent" });
  });

  it("prefers a project with a more recently updated milestone over a project with a newer updated_at", () => {
    const pA = makeProject({ id: "pA", updated_at: LATER_DATE });
    const pB = makeProject({ id: "pB", updated_at: BASE_DATE });
    // pB has a milestone updated more recently than anything in pA.
    const milestoneB = makeMilestone({
      id: "mB",
      project_id: "pB",
      updated_at: LATEST_DATE,
    });
    const result = pickPrimaryProject([pA, pB], [milestoneB], [], []);
    expect(result).toMatchObject({ id: "pB" });
  });

  it("uses a comment's created_at to elevate a project", () => {
    const pA = makeProject({ id: "pA", updated_at: BASE_DATE });
    const pB = makeProject({ id: "pB", updated_at: BASE_DATE });
    const mB = makeMilestone({ id: "mB", project_id: "pB", updated_at: BASE_DATE });
    // Comment on pB's milestone has the latest timestamp.
    const comment = makeComment("mB", LATEST_DATE);
    const result = pickPrimaryProject([pA, pB], [mB], [], [comment]);
    expect(result).toMatchObject({ id: "pB" });
  });

  it("uses a deliverable's updated_at to elevate a project", () => {
    const pA = makeProject({ id: "pA", updated_at: BASE_DATE });
    const pB = makeProject({ id: "pB", updated_at: BASE_DATE });
    const mB = makeMilestone({ id: "mB", project_id: "pB" });
    const deliverable = makeDeliverable("mB", LATEST_DATE);
    const result = pickPrimaryProject([pA, pB], [mB], [deliverable], []);
    expect(result).toMatchObject({ id: "pB" });
  });
});

// ─── computeNextMilestone ────────────────────────────────────────────────────

describe("computeNextMilestone", () => {
  it("returns null when there are no milestones for the project", () => {
    expect(computeNextMilestone("p1", [])).toBeNull();
  });

  it("returns null when all milestones are done", () => {
    const done = makeMilestone({ id: "m1", project_id: "p1", status: "done" });
    expect(computeNextMilestone("p1", [done])).toBeNull();
  });

  it("returns the single non-done milestone", () => {
    const m = makeMilestone({ id: "m1", project_id: "p1", status: "upcoming" });
    expect(computeNextMilestone("p1", [m])).toMatchObject({ id: "m1" });
  });

  it("prefers the milestone with the earliest due_at when both are non-null", () => {
    const early = makeMilestone({
      id: "early",
      project_id: "p1",
      due_at: "2026-05-02T00:00:00.000Z",
      display_order: 2,
    });
    const late = makeMilestone({
      id: "late",
      project_id: "p1",
      due_at: "2026-05-10T00:00:00.000Z",
      display_order: 1,
    });
    expect(computeNextMilestone("p1", [late, early])).toMatchObject({ id: "early" });
  });

  it("places null due_at milestones after dated ones", () => {
    const dated = makeMilestone({
      id: "dated",
      project_id: "p1",
      due_at: "2026-06-01T00:00:00.000Z",
      display_order: 2,
    });
    const undated = makeMilestone({
      id: "undated",
      project_id: "p1",
      due_at: null,
      display_order: 1,
    });
    expect(computeNextMilestone("p1", [undated, dated])).toMatchObject({ id: "dated" });
  });

  it("uses display_order as a tiebreaker when due_at values are equal", () => {
    const first = makeMilestone({
      id: "first",
      project_id: "p1",
      due_at: "2026-05-15T00:00:00.000Z",
      display_order: 1,
    });
    const second = makeMilestone({
      id: "second",
      project_id: "p1",
      due_at: "2026-05-15T00:00:00.000Z",
      display_order: 2,
    });
    expect(computeNextMilestone("p1", [second, first])).toMatchObject({ id: "first" });
  });

  it("ignores milestones belonging to other projects", () => {
    const otherProject = makeMilestone({ id: "other", project_id: "p2", status: "upcoming" });
    expect(computeNextMilestone("p1", [otherProject])).toBeNull();
  });
});

// ─── computeLastActivity ─────────────────────────────────────────────────────

describe("computeLastActivity", () => {
  it("returns the project's own updated_at when there are no milestones/deliverables/comments", () => {
    const p = makeProject({ id: "p1", updated_at: LATER_DATE });
    expect(computeLastActivity(p, [], [], [])).toBe(LATER_DATE);
  });

  it("returns a milestone's updated_at when it is more recent than the project", () => {
    const p = makeProject({ id: "p1", updated_at: BASE_DATE });
    const m = makeMilestone({ id: "m1", project_id: "p1", updated_at: LATEST_DATE });
    expect(computeLastActivity(p, [m], [], [])).toBe(LATEST_DATE);
  });

  it("returns a comment's created_at when it is the most recent timestamp", () => {
    const p = makeProject({ id: "p1", updated_at: BASE_DATE });
    const m = makeMilestone({ id: "m1", project_id: "p1", updated_at: LATER_DATE });
    const comment = makeComment("m1", LATEST_DATE);
    expect(computeLastActivity(p, [m], [], [comment])).toBe(LATEST_DATE);
  });

  it("returns a deliverable's updated_at when it is the most recent timestamp", () => {
    const p = makeProject({ id: "p1", updated_at: BASE_DATE });
    const m = makeMilestone({ id: "m1", project_id: "p1", updated_at: BASE_DATE });
    const deliverable = makeDeliverable("m1", LATEST_DATE);
    expect(computeLastActivity(p, [m], [deliverable], [])).toBe(LATEST_DATE);
  });

  it("ignores milestones/deliverables/comments from other projects", () => {
    const p = makeProject({ id: "p1", updated_at: LATER_DATE });
    const otherMilestone = makeMilestone({
      id: "m-other",
      project_id: "p2",
      updated_at: LATEST_DATE,
    });
    expect(computeLastActivity(p, [otherMilestone], [], [])).toBe(LATER_DATE);
  });
});

// ─── countMembers ────────────────────────────────────────────────────────────

describe("countMembers", () => {
  it("returns 0 when there are no members", () => {
    expect(countMembers("acc-1", [])).toBe(0);
  });

  it("counts only members belonging to the given account", () => {
    const members = [{ account_id: "acc-1" }, { account_id: "acc-1" }, { account_id: "acc-2" }];
    expect(countMembers("acc-1", members)).toBe(2);
  });

  it("returns 0 when no members match the account", () => {
    const members = [{ account_id: "acc-2" }];
    expect(countMembers("acc-1", members)).toBe(0);
  });
});
