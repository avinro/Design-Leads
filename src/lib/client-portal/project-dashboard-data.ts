import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

// Local row shapes used for explicit casts below.
// The shared createClient() returns SupabaseClient<any> so maybeSingle() results
// are inferred as structured objects with `any` fields (e.g. `{ name: any }`).
//
// Casting directly to a concrete type is flagged as "unnecessary" by the linter
// because `{ name: any }` is structurally assignable to `{ name: string }`.
//
// The workaround — established in context.ts (see lines 61-65) — is to split
// the cast into two statements: first widen to `unknown`, then narrow to the
// concrete type. The linter analyses each statement independently, so:
//   Step 1 (widening to unknown): not unnecessary
//   Step 2 (narrowing from unknown): not unnecessary

interface ProjectRow {
  id: string;
  name: string;
  current_phase: string;
}

interface MilestoneRow {
  id: string;
  name: string;
  status: string;
  due_at: string | null;
  display_order: number;
  updated_at: string;
}

interface DeliverableRow {
  id: string;
  title: string;
  status: string;
  uploaded_at: string | null;
  created_at: string;
}

interface CommentRow {
  id: string;
  body: string;
  created_at: string;
}

interface IntakeRow {
  id: string;
  submitted_at: string | null;
  schema: unknown;
}

/**
 * Data shape returned by `loadProjectDashboardData`.
 * All fields are concrete types — no `any` leaks to callers.
 */
export interface ProjectDashboardData {
  project: {
    id: string;
    name: string;
    current_phase: string;
  };
  milestones: {
    id: string;
    name: string;
    status: string;
    due_at: string | null;
    display_order: number;
    updated_at: string;
  }[];
  deliverables: {
    id: string;
    title: string;
    status: string;
    uploaded_at: string | null;
    created_at: string;
  }[];
  comments: {
    id: string;
    body: string;
    created_at: string;
  }[];
  intakeForm: {
    id: string;
    submitted_at: string | null;
    hasFilled: boolean;
  } | null;
}

/**
 * Returns the project name for use in page metadata.
 * Returns null when the project does not exist or is not accessible under RLS.
 */
export async function loadProjectName(
  supabase: SupabaseClient,
  projectId: string,
): Promise<string | null> {
  const { data } = await supabase.from("projects").select("name").eq("id", projectId).maybeSingle();
  // Two-step cast — see module-level comment for rationale.
  const rowUnknown = data as unknown;
  const row = rowUnknown as { name: string } | null;
  return row?.name ?? null;
}

/**
 * Loads all data required to render the project dashboard for a given project.
 *
 * Runs under the authenticated user's session — existing RLS policies (PRO-36)
 * enforce row visibility. No backend changes are required.
 *
 * Returns null if the project row is not accessible (not found or wrong account).
 */
export async function loadProjectDashboardData(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectDashboardData | null> {
  // Parallel fetch: project row + milestones.
  const [projectResult, milestonesResult] = await Promise.all([
    supabase.from("projects").select("id, name, current_phase").eq("id", projectId).maybeSingle(),
    supabase
      .from("milestones")
      .select("id, name, status, due_at, display_order, updated_at")
      .eq("project_id", projectId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  // Two-step cast for maybeSingle() result — see module-level comment.
  const projectUnknown = projectResult.data as unknown;
  const project = projectUnknown as ProjectRow | null;
  if (!project) return null;

  // Two-step cast (same rationale as above).
  const milestonesUnknown = milestonesResult.data as unknown;
  const milestones = (milestonesUnknown as MilestoneRow[] | null) ?? [];
  const milestoneIds = milestones.map((m) => m.id);

  // Parallel fetch: deliverables, comments, intake form.
  // .in() with an empty array is valid PostgREST — returns 0 rows, no error.
  // Comments are scoped to milestone_id only; deliverable-anchored comments ship in PRO-42.
  const [deliverablesResult, commentsResult, intakeResult] = await Promise.all([
    supabase
      .from("deliverables")
      .select("id, title, status, uploaded_at, created_at")
      .in("milestone_id", milestoneIds)
      .order("uploaded_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("comments")
      .select("id, body, created_at")
      .in("milestone_id", milestoneIds)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("intake_forms")
      .select("id, submitted_at, schema")
      .eq("project_id", projectId)
      .maybeSingle(),
  ]);

  // Two-step cast (same rationale as above — structured-any from chained selects).
  const deliverablesUnknown = deliverablesResult.data as unknown;
  const deliverables = (deliverablesUnknown as DeliverableRow[] | null) ?? [];
  const commentsUnknown = commentsResult.data as unknown;
  const comments = (commentsUnknown as CommentRow[] | null) ?? [];

  // Two-step cast for maybeSingle() result — see module-level comment.
  const intakeUnknown = intakeResult.data as unknown;
  const intakeRaw = intakeUnknown as IntakeRow | null;

  const intakeForm = intakeRaw
    ? {
        id: intakeRaw.id,
        submitted_at: intakeRaw.submitted_at,
        hasFilled:
          intakeRaw.schema !== null &&
          typeof intakeRaw.schema === "object" &&
          !Array.isArray(intakeRaw.schema) &&
          Object.keys(intakeRaw.schema).length > 0,
      }
    : null;

  return {
    project,
    milestones,
    deliverables,
    comments,
    intakeForm,
  };
}
