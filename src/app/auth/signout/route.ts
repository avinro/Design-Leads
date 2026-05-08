import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * POST /auth/signout
 *
 * Signs the current user out and redirects to the home page.
 * Accepts POST only — GET requests should never trigger side effects.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // Revalidate the root layout so server components that depended on the
  // session (e.g. nav variants) pick up the logged-out state immediately.
  revalidatePath("/", "layout");

  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}
