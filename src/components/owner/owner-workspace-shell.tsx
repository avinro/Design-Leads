import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { OwnerSidebar } from "./owner-sidebar";
import { OwnerHeader } from "./owner-header";
import { OwnerBottomNav } from "./owner-bottom-nav";

interface OwnerWorkspaceShellProps {
  user: { displayName: string; email: string | null };
  children: ReactNode;
}

/**
 * Authenticated owner workspace shell.
 *
 * Layout cascade (mobile-first):
 * - <md   : header + content area + fixed bottom tab bar
 * - md    : header + shadcn sidebar (icon rail) + content area
 * - lg+   : header + shadcn sidebar (expanded) + content area
 *
 * SidebarProvider is a client component that manages sidebar open/close
 * state and persists it to a cookie. It is placed here, at layout level,
 * so the state hydrates once and is shared across all owner pages.
 *
 * The sidebar is hidden below md via CSS — the BottomNav handles mobile.
 * To avoid duplicate keyboard-accessible landmarks at any single breakpoint,
 * the sidebar and bottom nav are each hidden at the opposing breakpoint.
 */
export function OwnerWorkspaceShell({ user, children }: OwnerWorkspaceShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-dvh w-full">
        {/* Desktop sidebar — hidden below md, visible md+ */}
        <OwnerSidebar />

        {/*
         * Content column: fills remaining space.
         * At md+, the SidebarProvider CSS variables control the left shift
         * via peer selectors on the sidebar.
         */}
        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader user={user} />

          {/*
           * Main content area. pb-20 on mobile reserves space above the fixed
           * BottomNav. Padding is removed at md+ where the nav is hidden.
           */}
          <main id="main-content" className="flex flex-1 flex-col overflow-auto pb-20 md:pb-0">
            {children}
          </main>

          {/* Mobile bottom tab bar — hidden at md+ */}
          <OwnerBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
