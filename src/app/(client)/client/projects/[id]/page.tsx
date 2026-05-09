import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { loadClientPortalContext } from "@/lib/client-portal/context";
import { loadProjectName } from "@/lib/client-portal/project-dashboard-data";
import { ProjectDashboard } from "@/components/client/dashboard/project-dashboard";

/**
 * /client/projects/[id] — Project dashboard page (PRO-39).
 *
 * In Next.js 16 `params` is a Promise. We await it before reading `id`.
 *
 * Access control:
 * - Middleware (proxy.ts) ensures the request is authenticated before here.
 * - `loadClientPortalContext` confirms the user has a confirmed account membership.
 * - `ProjectDashboard` (via `loadProjectDashboardData`) queries under the user's
 *   session, so RLS (PRO-36) prevents reading projects from other accounts.
 * - If the project ID does not exist or is not accessible, notFound() is returned.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const name = await loadProjectName(supabase, id);

  return {
    title: name ? `${name} — Client Portal` : "Project — Client Portal",
    robots: { index: false },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const context = await loadClientPortalContext(supabase);

  // User has no confirmed membership — middleware should have caught this.
  if (!context) return notFound();

  // Verify the requested project belongs to the user's active account.
  // RLS will prevent the SELECT from returning rows for other accounts, so
  // a null result means not found or not accessible.
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("account_id", context.account.id)
    .maybeSingle();

  if (!project) return notFound();

  return <ProjectDashboard projectId={id} accountName={context.account.name} />;
}
