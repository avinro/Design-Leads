import { LayoutDashboard, Users, Inbox, Settings } from "lucide-react";

import { OwnerNavLink } from "./owner-nav-link";

/**
 * Mobile bottom tab bar for the owner workspace.
 *
 * Visible only on <md (hidden at md+ via md:hidden).
 * Fixed at the bottom of the viewport, above the iOS/Android home indicator
 * via pb-[env(safe-area-inset-bottom)].
 *
 * Content is pushed up by pb-20 on the page wrapper so nothing hides
 * beneath this bar.
 *
 * At md+, the sidebar handles navigation and this element is hidden.
 * Both trees share the same NAV_ITEMS destinations for URL consistency.
 */
export function OwnerBottomNav() {
  const items = [
    {
      href: "/owner/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="size-5" aria-hidden="true" />,
    },
    {
      href: "/owner/clients",
      label: "Clients",
      icon: <Users className="size-5" aria-hidden="true" />,
    },
    {
      href: "/owner/inbox",
      label: "Inbox",
      icon: <Inbox className="size-5" aria-hidden="true" />,
    },
    {
      href: "/owner/settings",
      label: "Settings",
      icon: <Settings className="size-5" aria-hidden="true" />,
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className={[
        "md:hidden",
        "fixed inset-x-0 bottom-0 z-20",
        "bg-background/95 border-border border-t backdrop-blur-sm",
        "pb-[env(safe-area-inset-bottom)]",
      ].join(" ")}
    >
      <ul className="flex items-center justify-around gap-1 px-2 py-1">
        {items.map((item) => (
          <li key={item.href} className="flex flex-1 justify-center">
            <OwnerNavLink href={item.href} label={item.label} icon={item.icon} variant="bottom" />
          </li>
        ))}
      </ul>
    </nav>
  );
}
