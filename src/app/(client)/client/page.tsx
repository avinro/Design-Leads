import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/access";

export const metadata: Metadata = {
  title: "Client Portal",
  robots: { index: false },
};

/**
 * /client — authenticated client portal landing page (placeholder).
 *
 * The navigation shell, project dashboard and full portal UI ship in PRO-38
 * and following issues. This page exists to validate the auth gate and
 * confirm that invited users can land here after clicking their magic link.
 *
 * Route protection is enforced upstream in proxy.ts. If the user reaches
 * this page they are an authenticated account member.
 */
export default async function ClientPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-16"
    >
      <div className="text-center">
        <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-widest uppercase">
          Client Portal
        </p>
        <h1 className="text-2xl font-bold">{user?.email ? `Welcome, ${user.email}` : "Welcome"}</h1>
        <p className="text-muted-foreground mt-2 text-sm">Your project dashboard is coming soon.</p>
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
