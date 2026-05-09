import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { loadClientPortalContext } from "@/lib/client-portal/context";
import { ProjectDashboard } from "@/components/client/dashboard/project-dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Client Portal",
  robots: { index: false },
};

/**
 * /client — Client portal dashboard (PRO-39).
 *
 * Renders the same ProjectDashboard component used by /client/projects/[id],
 * pointed at the active project from context. This avoids a redirect (which
 * would break the Dashboard nav tab's aria-current state) while satisfying
 * the AC that /client/projects/[id] exists and serves real data.
 *
 * When the account has no projects yet, shows a friendly empty state instead.
 *
 * Route protection is enforced upstream in proxy.ts (updateSession).
 */
export default async function ClientPage() {
  const supabase = await createClient();
  const context = await loadClientPortalContext(supabase);

  if (!context) return null;

  if (!context.hasProjects || !context.activeProject) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="bg-card border-border w-full max-w-sm rounded-xl border p-8 text-center shadow-sm">
          <p className="text-foreground mb-1 text-base font-semibold">No projects yet</p>
          <p className="text-muted-foreground text-sm">
            Your project owner will set things up — you&apos;ll see updates here once it&apos;s
            ready.
          </p>
          <p className="text-muted-foreground mt-6 text-xs">
            Signed in as <span className="text-foreground font-medium">{context.user.email}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProjectDashboard projectId={context.activeProject.id} accountName={context.account.name} />
  );
}
