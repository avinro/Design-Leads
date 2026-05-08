import { ClientPortalProjectSwitcher } from "./client-portal-project-switcher";
import { ClientPortalUserMenu } from "./client-portal-user-menu";
import type { ClientPortalContext } from "@/lib/client-portal/context";

interface ClientPortalHeaderProps {
  context: ClientPortalContext;
}

/**
 * Sticky portal header — server component.
 *
 * Displays: brand mark (mobile only), account name, active project pill,
 * and a user avatar menu (client island) containing settings + sign-out.
 *
 * The notification bell is omitted for v1 and returns when PRO-45 ships.
 *
 * Sign-out is handled by a native form POST inside ClientPortalUserMenu
 * so no server-side auth code is imported here.
 */
export function ClientPortalHeader({ context }: ClientPortalHeaderProps) {
  return (
    <header className="bg-background border-border sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4">
      {/* Brand sub-mark — visible only on <sm where the sidebar is hidden */}
      <span
        className="text-foreground mr-1 shrink-0 text-sm font-bold tracking-tight sm:hidden"
        aria-label="Avinro client portal"
      >
        Avinro
      </span>

      {/* Account + project identity */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-muted-foreground hidden shrink-0 text-xs font-semibold tracking-wider uppercase sm:block">
          {context.account.name}
        </span>

        {context.hasProjects && (
          <>
            <span className="text-muted-foreground hidden text-xs sm:block" aria-hidden="true">
              /
            </span>
            <ClientPortalProjectSwitcher
              projects={context.projects}
              activeProject={context.activeProject}
            />
          </>
        )}

        {/* Mobile: show account name when no project label is visible */}
        {!context.hasProjects && (
          <span className="text-foreground truncate text-sm font-semibold sm:hidden">
            {context.account.name}
          </span>
        )}
      </div>

      {/* User menu (client island) */}
      <div className="shrink-0">
        <ClientPortalUserMenu displayName={context.user.displayName} email={context.user.email} />
      </div>
    </header>
  );
}
