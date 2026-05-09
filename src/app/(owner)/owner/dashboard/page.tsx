import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/client/page-header";
import { EmptyState } from "@/components/client/empty-state";
import { ClientsOverview } from "@/components/owner/dashboard/clients-overview";
import { createClient } from "@/lib/supabase/server";
import { loadOwnerDashboardData } from "@/lib/owner/dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard — Owner Workspace",
  robots: { index: false },
};

/**
 * /owner/dashboard — owner mission-control dashboard (F3-14 / PRO-50).
 *
 * Renders one card per client account showing the primary project's phase,
 * next milestone, last activity, and member count. Sort and filter are handled
 * client-side by <ClientsOverview /> — account volume for a solo designer is
 * always small enough that in-memory operations are instant.
 *
 * Auth is enforced upstream by the (owner) route-group layout (isSystemOwner
 * check) and by middleware. No auth logic is repeated here.
 */
export default async function OwnerDashboardPage() {
  const supabase = await createClient();
  const { cards } = await loadOwnerDashboardData(supabase);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        eyebrow="Owner Workspace"
        title="Dashboard"
        subtitle="All your clients and where each project stands."
        action={
          <Button asChild size="sm">
            <Link href="/owner/clients/new">
              <UserPlus className="size-3.5" aria-hidden="true" />
              Add client
            </Link>
          </Button>
        }
      />

      {cards.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" />}
          title="No clients yet"
          description="Create your first client account to start tracking projects, milestones, and deliverables."
          primaryAction={
            <Button asChild>
              <Link href="/owner/clients/new">
                <UserPlus className="size-4" aria-hidden="true" />
                Create first client
              </Link>
            </Button>
          }
        />
      ) : (
        <ClientsOverview cards={cards} />
      )}
    </div>
  );
}
