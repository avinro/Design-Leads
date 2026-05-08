import type { ReactNode } from "react";

/**
 * Outreach (LimaLeads) layout — owner-only.
 *
 * Route protection is enforced in proxy.ts (updateSession). This layout does
 * NOT render the public site header/footer; the outreach backoffice has its
 * own navigation which will be built in Phase 2 issues (PRO-25+).
 *
 * Only applies to routes under /(outreach)/ (e.g. /outreach, /outreach/leads/…).
 */
export default function OutreachLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
