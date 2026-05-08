import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  currentPhase: string;
}

interface ClientPortalProjectSwitcherProps {
  projects: Project[];
  activeProject: { id: string; name: string } | null;
}

/**
 * Read-only project identity pill — v1.
 *
 * Renders the active project name as a static label. When the user belongs
 * to multiple projects, a secondary "+N more" badge indicates there are
 * additional projects; actual switching ships in PRO-56.
 *
 * Kept as a server component: no state, no interactivity yet.
 */
export function ClientPortalProjectSwitcher({
  projects,
  activeProject,
}: ClientPortalProjectSwitcherProps) {
  if (!activeProject) return null;

  const extraCount = projects.length - 1;

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="text-foreground truncate text-sm font-semibold">{activeProject.name}</span>

      {extraCount > 0 && (
        <Badge
          variant="outline"
          className="shrink-0 text-[10px]"
          title={`${String(extraCount)} more project${extraCount > 1 ? "s" : ""} available — project switching coming soon`}
          aria-label={`${String(extraCount)} more project${extraCount > 1 ? "s" : ""} available`}
        >
          +{extraCount}
        </Badge>
      )}
    </div>
  );
}
