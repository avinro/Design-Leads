import { FolderKanban, Files, MessageSquare, Settings, LayoutDashboard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ClientPortalNavLink } from "./client-portal-nav-link";
import type { ClientPortalContext } from "@/lib/client-portal/context";

const NAV_ITEMS = [
  {
    href: "/client",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" aria-hidden="true" />,
  },
  {
    href: "/client/projects",
    label: "Projects",
    icon: <FolderKanban className="size-4" aria-hidden="true" />,
  },
  { href: "/client/files", label: "Files", icon: <Files className="size-4" aria-hidden="true" /> },
  {
    href: "/client/comments",
    label: "Comments",
    icon: <MessageSquare className="size-4" aria-hidden="true" />,
  },
  {
    href: "/client/settings",
    label: "Settings",
    icon: <Settings className="size-4" aria-hidden="true" />,
  },
] as const;

interface ClientPortalSidebarProps {
  context: ClientPortalContext;
}

/**
 * Desktop portal sidebar.
 *
 * Visible only on md+ (hidden on mobile via CSS).
 * Uses shadcn <Sidebar collapsible="icon"> which provides:
 * - Icon rail when collapsed (md default)
 * - Expanded labels when open
 * - Keyboard shortcut (Ctrl/Cmd+B) to toggle
 * - Tooltip labels in icon-rail mode
 * - Cookie-persisted collapse state
 *
 * The mobile bottom tab bar handles navigation below md.
 * Both nav trees share the same NAV_ITEMS constant for consistency.
 */
export function ClientPortalSidebar({ context }: ClientPortalSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader className="border-border border-b px-2 py-3">
        {/* Account name visible when expanded; hidden in icon-rail mode via group-data-[collapsible=icon] */}
        <span className="text-foreground truncate px-2 text-xs font-semibold tracking-wider uppercase group-data-[collapsible=icon]:hidden">
          {context.account.name}
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <ClientPortalNavLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                variant="sidebar"
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

export { NAV_ITEMS };
