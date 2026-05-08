import type { ReactNode } from "react";

/**
 * Client portal layout — intentionally minimal.
 *
 * Route protection is enforced in proxy.ts (updateSession). This layout does
 * NOT render the public site header/footer; the portal has its own navigation
 * shell which will be built in PRO-38.
 *
 * Only applies to routes under /(client)/ (e.g. /client, /client/projects/…).
 * It inherits the root layout (html, body, fonts, Toaster) from app/layout.tsx.
 */
export default function ClientPortalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
