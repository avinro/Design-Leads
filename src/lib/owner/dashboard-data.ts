import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isActivePhase } from "@/lib/projects/phases";

// ─── Row shapes ──────────────────────────────────────────────────────────────
// createClient() returns SupabaseClient<any>, so select() results are typed
// as structured objects with `any` fields. Direct casts ("data as Foo") are
// flagged as "unnecessary" by the linter. The two-step pattern (widen to
// unknown, then narrow to the concrete type) keeps the linter happy:
//   Step 1 (widen to unknown): not unnecessary
//   Step 2 (narrow from unknown): not unnecessary
// See project-dashboard-data.ts for the same pattern documented in detail.

interface AccountRow {
  id: string;
  name: string;
  created_at: string;
}

interface ProjectRow {
  id: string;
  name: string;
  account_id: string;
  current_phase: string;
  updated_at: string;
}

interface MilestoneRow {
  id: string;
  name: string;
  status: string;
  due_at: string | null;
  display_order: number;
  project_id: string;
  account_id: string;
  updated_at: string;
}

interface DeliverableRow {
  id: string;
  account_id: string;
  updated_at: string;
}

interface CommentRow {
  id: string;
  account_id: string;
  created_at: string;
}

interface MemberRow {
  account_id: string;
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface OwnerDashboardCard {
  account: { id: string; name: string };
  /** Most recently active project in this account, or null if none. */
  primaryProject: { id: string; name: string; current_phase: string } | null;
  /** Number of additional projects beyond the primary. */
  extraProjectCount: number;
  /** First non-done milestone of the primary project, by due_at then display_order. */
  nextMilestone: { id: string; name: string; due_at: string | null } | null;
  /** ISO timestamp of the most recent activity across primary project's rows. */
  lastActivityAt: string | null;
  /** Count of confirmed members (joined_at IS NOT NULL) for this account. */
  memberCount: number;
  /**
   * Pre-computed filter bucket for the client-side filter tabs:
   * - active:    at least one project with current_phase !== 'delivery'
   * - completed: all projects have current_phase = 'delivery'
   * - none:      account has no projects
   */
  filterBucket: "active" | "completed" | "none";
}

export interface OwnerDashboardData {
  cards: OwnerDashboardCard[];
}

// ─── Pure transform helpers (exported for unit tests) ─────────────────────────

/**
 * Picks the most recently active project for an account.
 *
 * "Activity" for a project is the maximum of:
 *   - projects.updated_at
 *   - MAX(milestones.updated_at) for milestones belonging to the project
 *   - MAX(deliverables.updated_at) for deliverables belonging to the account
 *     that are associated with those milestones
 *   - MAX(comments.created_at) for comments on those milestones
 *
 * Because computing per-project deliverable/comment timestamps would require
 * O(N²) work without a pre-built index, we use the account-level deliverable
 * and comment arrays passed in, filtered by milestone_id membership.
 *
 * @param projects - All projects for a given account.
 * @param milestones - All milestones for the account's projects.
 * @param deliverables - All deliverables for the account.
 * @param comments - All comments for the account.
 * @returns The project with the most recent activity, or null if no projects.
 */
export function pickPrimaryProject(
  projects: ProjectRow[],
  milestones: MilestoneRow[],
  deliverables: DeliverableRow[],
  comments: CommentRow[],
): ProjectRow | null {
  if (projects.length === 0) return null;
  if (projects.length === 1) return projects[0] ?? null;

  // Build a milestone-id set per project for O(1) lookup.
  const milestonesByProject = new Map<string, MilestoneRow[]>();
  for (const m of milestones) {
    const existing = milestonesByProject.get(m.project_id) ?? [];
    existing.push(m);
    milestonesByProject.set(m.project_id, existing);
  }

  // Build a milestone-id set for fast deliverable/comment lookup.
  const milestoneIdSet = new Set(milestones.map((m) => m.id));

  // Pre-filter account-level deliverables/comments to those touching known milestones.
  const relevantDeliverables = deliverables.filter((d) =>
    milestoneIdSet.has((d as unknown as { milestone_id?: string }).milestone_id ?? ""),
  );
  const relevantComments = comments.filter((c) =>
    milestoneIdSet.has((c as unknown as { milestone_id?: string }).milestone_id ?? ""),
  );

  // projects.length >= 2 is guaranteed by the early returns above.
  // Initialize best to the first project so the type is never null.
  let best: ProjectRow = projects[0];
  let bestTs = "";

  for (const project of projects) {
    const projectMilestones = milestonesByProject.get(project.id) ?? [];
    const projectMilestoneIds = new Set(projectMilestones.map((m) => m.id));

    const candidates: string[] = [project.updated_at];

    for (const m of projectMilestones) candidates.push(m.updated_at);
    for (const d of relevantDeliverables) {
      const milestoneId = (d as unknown as { milestone_id?: string }).milestone_id ?? "";
      if (projectMilestoneIds.has(milestoneId)) candidates.push(d.updated_at);
    }
    for (const c of relevantComments) {
      const milestoneId = (c as unknown as { milestone_id?: string }).milestone_id ?? "";
      if (projectMilestoneIds.has(milestoneId)) candidates.push(c.created_at);
    }

    // Max timestamp via string comparison (ISO 8601 sorts lexicographically).
    const projectTs = candidates.reduce((a, b) => (a > b ? a : b), "");
    if (projectTs > bestTs) {
      bestTs = projectTs;
      best = project;
    }
  }

  return best;
}

/**
 * Returns the first non-done milestone for a project, ordered by due_at ASC
 * (nulls last) then display_order ASC.
 *
 * @param projectId - The project to filter milestones for.
 * @param milestones - All milestones for the account.
 */
export function computeNextMilestone(
  projectId: string,
  milestones: MilestoneRow[],
): Pick<MilestoneRow, "id" | "name" | "due_at"> | null {
  const pending = milestones
    .filter((m) => m.project_id === projectId && m.status !== "done")
    .sort((a, b) => {
      // Nulls go last.
      if (a.due_at === null && b.due_at === null) return a.display_order - b.display_order;
      if (a.due_at === null) return 1;
      if (b.due_at === null) return -1;
      const cmp = a.due_at.localeCompare(b.due_at);
      return cmp !== 0 ? cmp : a.display_order - b.display_order;
    });

  const next = pending.at(0);
  if (!next) return null;
  return { id: next.id, name: next.name, due_at: next.due_at };
}

/**
 * Computes the ISO timestamp of the most recent activity for a given project.
 *
 * Considers: project.updated_at, milestones.updated_at,
 * deliverables.updated_at (for deliverables whose milestone belongs to the
 * project), comments.created_at (same scope).
 *
 * @param project - The primary project.
 * @param milestones - All milestones for the account.
 * @param deliverables - All deliverables for the account.
 * @param comments - All comments for the account.
 */
export function computeLastActivity(
  project: ProjectRow,
  milestones: MilestoneRow[],
  deliverables: DeliverableRow[],
  comments: CommentRow[],
): string | null {
  const projectMilestones = milestones.filter((m) => m.project_id === project.id);
  const projectMilestoneIds = new Set(projectMilestones.map((m) => m.id));

  const candidates: string[] = [project.updated_at];

  for (const m of projectMilestones) candidates.push(m.updated_at);

  for (const d of deliverables) {
    const mid = (d as unknown as { milestone_id?: string }).milestone_id ?? "";
    if (projectMilestoneIds.has(mid)) candidates.push(d.updated_at);
  }
  for (const c of comments) {
    const mid = (c as unknown as { milestone_id?: string }).milestone_id ?? "";
    if (projectMilestoneIds.has(mid)) candidates.push(c.created_at);
  }

  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (a > b ? a : b));
}

/**
 * Counts confirmed members (joined_at IS NOT NULL) for a given account.
 * The DB-level filter (joined_at IS NOT NULL) is applied at query time;
 * this function simply counts the pre-filtered rows.
 */
export function countMembers(accountId: string, members: MemberRow[]): number {
  return members.filter((m) => m.account_id === accountId).length;
}

// ─── Main loader ──────────────────────────────────────────────────────────────

/**
 * Loads all data required to render the owner dashboard.
 *
 * Runs 3 round-trips:
 *  1. accounts — filtered to owner via RLS (accounts.owner_id = auth.uid())
 *  2. projects + account_members — parallel, filtered by accountIds
 *  3. milestones + deliverables + comments — parallel, filtered by projectIds
 *     / accountIds using denormalized account_id columns
 *
 * All queries run under the authenticated session; existing RLS policies from
 * PRO-36 enforce visibility. No migrations, RLS changes, or Server Actions
 * are required.
 *
 * Returns an empty cards array when the owner has no accounts yet.
 */
export async function loadOwnerDashboardData(
  supabase: SupabaseClient,
): Promise<OwnerDashboardData> {
  // Round-trip 1: accounts.
  const { data: accountsRaw } = await supabase
    .from("accounts")
    .select("id, name, created_at")
    .order("created_at", { ascending: true });

  const accountsUnknown = accountsRaw as unknown;
  const accounts = (accountsUnknown as AccountRow[] | null) ?? [];

  if (accounts.length === 0) return { cards: [] };

  const accountIds = accounts.map((a) => a.id);

  // Round-trip 2: projects + confirmed members in parallel.
  const [projectsResult, membersResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, account_id, current_phase, updated_at")
      .in("account_id", accountIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("account_members")
      .select("account_id")
      .in("account_id", accountIds)
      .not("joined_at", "is", null),
  ]);

  const projectsUnknown = projectsResult.data as unknown;
  const allProjects = (projectsUnknown as ProjectRow[] | null) ?? [];

  const membersUnknown = membersResult.data as unknown;
  const allMembers = (membersUnknown as MemberRow[] | null) ?? [];

  const projectIds = allProjects.map((p) => p.id);

  if (projectIds.length === 0) {
    // Accounts exist but have no projects — build cards with null project data.
    const cards: OwnerDashboardCard[] = accounts.map((account) => ({
      account: { id: account.id, name: account.name },
      primaryProject: null,
      extraProjectCount: 0,
      nextMilestone: null,
      lastActivityAt: null,
      memberCount: countMembers(account.id, allMembers),
      filterBucket: "none" as const,
    }));
    return { cards };
  }

  // Round-trip 3: milestones + deliverables + comments in parallel.
  // deliverables and comments use denormalized account_id for efficiency.
  const [milestonesResult, deliverablesResult, commentsResult] = await Promise.all([
    supabase
      .from("milestones")
      .select("id, name, status, due_at, display_order, project_id, account_id, updated_at")
      .in("project_id", projectIds)
      .order("display_order", { ascending: true }),
    supabase.from("deliverables").select("id, account_id, updated_at").in("account_id", accountIds),
    supabase.from("comments").select("id, account_id, created_at").in("account_id", accountIds),
  ]);

  const milestonesUnknown = milestonesResult.data as unknown;
  const allMilestones = (milestonesUnknown as MilestoneRow[] | null) ?? [];

  const deliverablesUnknown = deliverablesResult.data as unknown;
  const allDeliverables = (deliverablesUnknown as DeliverableRow[] | null) ?? [];

  const commentsUnknown = commentsResult.data as unknown;
  const allComments = (commentsUnknown as CommentRow[] | null) ?? [];

  // Build one card per account.
  const cards: OwnerDashboardCard[] = accounts.map((account) => {
    const accountProjects = allProjects.filter((p) => p.account_id === account.id);

    const primaryProject = pickPrimaryProject(
      accountProjects,
      allMilestones,
      allDeliverables,
      allComments,
    );

    const extraProjectCount = Math.max(0, accountProjects.length - 1);

    const nextMilestone = primaryProject
      ? computeNextMilestone(primaryProject.id, allMilestones)
      : null;

    const lastActivityAt = primaryProject
      ? computeLastActivity(primaryProject, allMilestones, allDeliverables, allComments)
      : null;

    const memberCount = countMembers(account.id, allMembers);

    const hasActive = accountProjects.some((p) => isActivePhase(p.current_phase));
    const filterBucket: OwnerDashboardCard["filterBucket"] =
      accountProjects.length === 0 ? "none" : hasActive ? "active" : "completed";

    return {
      account: { id: account.id, name: account.name },
      primaryProject: primaryProject
        ? {
            id: primaryProject.id,
            name: primaryProject.name,
            current_phase: primaryProject.current_phase,
          }
        : null,
      extraProjectCount,
      nextMilestone,
      lastActivityAt,
      memberCount,
      filterBucket,
    };
  });

  return { cards };
}
