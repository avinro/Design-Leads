import { LayoutDashboard, Users, Inbox, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { OwnerNavLink } from "./owner-nav-link";

export const NAV_ITEMS = [
  {
    href: "/owner/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" aria-hidden="true" />,
  },
  {
    href: "/owner/clients",
    label: "Clients",
    icon: <Users className="size-4" aria-hidden="true" />,
  },
  {
    href: "/owner/inbox",
    label: "Inbox",
    icon: <Inbox className="size-4" aria-hidden="true" />,
  },
  {
    href: "/owner/settings",
    label: "Settings",
    icon: <Settings className="size-4" aria-hidden="true" />,
  },
] as const;

/**
 * Desktop owner workspace sidebar.
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
export function OwnerSidebar() {
  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader className="border-border border-b px-2 py-3">
        {/* Label visible when expanded; hidden in icon-rail mode */}
        <span className="text-foreground truncate px-2 text-xs font-semibold tracking-wider uppercase group-data-[collapsible=icon]:hidden">
          Owner Workspace
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <OwnerNavLink
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
