import { FolderKanban, Files, MessageSquare, LayoutDashboard } from "lucide-react";

import { ClientPortalNavLink } from "./client-portal-nav-link";

/**
 * Mobile bottom tab bar.
 *
 * Visible only on <md (hidden at md+ via md:hidden).
 * Fixed at the bottom of the viewport, above the iOS/Android home indicator
 * via pb-[env(safe-area-inset-bottom)].
 *
 * Content is pushed up by pb-20 on the page wrapper so nothing hides
 * beneath this bar.
 *
 * touch-action: manipulation is applied inside ClientPortalNavLink to
 * eliminate the 300ms tap delay on mobile browsers.
 *
 * At md+, the sidebar handles navigation and this element is hidden.
 * Both trees share the same nav destinations for URL consistency.
 */
export function ClientPortalBottomNav() {
  // Settings is accessible via the user avatar menu in the header — keeping
  // the bottom nav at 4 items gives each tab more touch area at 375 px.
  const items = [
    {
      href: "/client",
      label: "Dashboard",
      icon: <LayoutDashboard className="size-5" aria-hidden="true" />,
    },
    {
      href: "/client/projects",
      label: "Projects",
      icon: <FolderKanban className="size-5" aria-hidden="true" />,
    },
    {
      href: "/client/files",
      label: "Files",
      icon: <Files className="size-5" aria-hidden="true" />,
    },
    {
      href: "/client/comments",
      label: "Comments",
      icon: <MessageSquare className="size-5" aria-hidden="true" />,
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className={[
        // Only visible on mobile; hidden at md+ (where the sidebar takes over)
        "md:hidden",
        // Fixed position, full width, above home indicator
        "fixed inset-x-0 bottom-0 z-20",
        // Background / border
        "bg-background/95 border-border border-t backdrop-blur-sm",
        // Safe area inset for iOS home bar + base padding
        "pb-[env(safe-area-inset-bottom)]",
      ].join(" ")}
    >
      <ul className="flex items-center justify-around gap-1 px-2 py-1">
        {items.map((item) => (
          <li key={item.href} className="flex flex-1 justify-center">
            <ClientPortalNavLink
              href={item.href}
              label={item.label}
              icon={item.icon}
              variant="bottom"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
