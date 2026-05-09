import { OwnerUserMenu } from "./owner-user-menu";

interface OwnerHeaderProps {
  user: { displayName: string; email: string | null };
}

/**
 * Sticky owner workspace header — server component.
 *
 * Displays the platform brand name and a user avatar menu (client island)
 * containing settings + sign-out.
 *
 * The notification bell is omitted for v1 and returns when a future issue ships.
 * Sign-out is handled by a native form POST inside OwnerUserMenu so no
 * server-side auth code is imported here.
 */
export function OwnerHeader({ user }: OwnerHeaderProps) {
  return (
    <header className="bg-background border-border sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4">
      {/* Brand mark */}
      <span
        className="text-foreground shrink-0 text-sm font-bold tracking-tight"
        aria-label="Avinro owner workspace"
      >
        Avinro
      </span>

      {/* Separator + workspace label */}
      <span className="text-muted-foreground text-xs" aria-hidden="true">
        /
      </span>
      <span className="text-muted-foreground hidden text-xs font-semibold tracking-wider uppercase sm:block">
        Owner Workspace
      </span>

      {/* Push user menu to the right */}
      <div className="flex-1" />

      {/* User menu (client island) */}
      <div className="shrink-0">
        <OwnerUserMenu displayName={user.displayName} email={user.email} />
      </div>
    </header>
  );
}
