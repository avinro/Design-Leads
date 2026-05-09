import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, isSystemOwner } from "@/lib/auth/access";
import { OwnerWorkspaceShell } from "@/components/owner/owner-workspace-shell";

/**
 * Owner workspace layout — wraps all /(owner)/* pages.
 *
 * Performs a second-layer authorization check (the primary gate is in
 * middleware.ts). Using notFound() here means non-owners receive a 404,
 * which avoids leaking the existence of owner-only routes.
 *
 * The middleware has already validated the session and confirmed system
 * ownership by the time this layout runs, so this check is defense in depth.
 *
 * Renders the full workspace shell: sticky header, sidebar (md+), bottom
 * nav (<md).
 */
export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const [user, ownerAccess] = await Promise.all([
    getAuthenticatedUser(supabase),
    isSystemOwner(supabase),
  ]);

  if (!user || !ownerAccess) {
    notFound();
  }

  const displayName = user.email?.split("@")[0] ?? "Owner";

  return (
    <OwnerWorkspaceShell user={{ displayName, email: user.email ?? null }}>
      {children}
    </OwnerWorkspaceShell>
  );
}
