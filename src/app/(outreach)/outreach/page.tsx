import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Outreach",
  robots: { index: false },
};

/**
 * /outreach — owner-only backoffice placeholder.
 *
 * Route protection is enforced upstream in proxy.ts (system owner required).
 * The full LimaLeads outreach UI ships in Phase 2 issues.
 */
export default function OutreachPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-16"
    >
      <div className="text-center">
        <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-widest uppercase">
          LimaLeads
        </p>
        <h1 className="text-2xl font-bold">Outreach</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Owner area — outreach dashboard coming in Phase 2.
        </p>
      </div>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
