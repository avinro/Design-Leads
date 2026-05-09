import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { hasClientMembership, isSystemOwner } from "@/lib/auth/access";
import { isClientPath, isOutreachPath, isOwnerPath, sanitizeNext } from "@/lib/auth/paths";

// Valid OTP types this route accepts. Kept as a set for O(1) lookup.
const VALID_OTP_TYPES = new Set<string>([
  "email",
  "recovery",
  "invite",
  "magiclink",
  "sms",
  "phone_change",
  "email_change",
]);

// Fallback destinations when the requested `next` is not reachable for the
// authenticated user. These must always exist and pass middleware gates.
const OWNER_HOME = "/owner/dashboard";
const CLIENT_HOME = "/client";

/**
 * GET /auth/confirm
 *
 * Confirm route — verifies an email OTP and establishes a server-side
 * session. Called after the user clicks a magic-link or invite email.
 *
 * Query params:
 *   token_hash  — from the email template: {{ .TokenHash }}
 *   type        — "magiclink" | "invite" | "email" (validated below)
 *   next        — optional return URL (sanitized + role-checked before use)
 *
 * Note on role-aware redirects: the /login form does not know whether the
 * email belongs to a system owner or a client member, so it always sets
 * `next=/client`. After verification we resolve the real target based on
 * the user's role to avoid bouncing legitimate owners through /unauthorized.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const requestedNext = sanitizeNext(searchParams.get("next"), CLIENT_HOME);

  const loginErrorUrl = `${origin}/login?error=link_invalid&next=${encodeURIComponent(requestedNext)}`;

  if (!token_hash || !rawType || !VALID_OTP_TYPES.has(rawType)) {
    return NextResponse.redirect(loginErrorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: rawType,
    token_hash,
  });

  if (error) {
    console.error("[auth/confirm] verifyOtp error:", error.message);
    return NextResponse.redirect(loginErrorUrl);
  }

  // verifyOtp sets the session cookie via the SSR client; subsequent calls
  // on the same client now run as the authenticated user. The trigger
  // handle_user_email_confirmed fires inside Postgres and seals joined_at
  // automatically — no additional server action needed here.
  const [owner, member] = await Promise.all([
    isSystemOwner(supabase),
    hasClientMembership(supabase),
  ]);

  const target = resolveTarget(requestedNext, { owner, member });
  return NextResponse.redirect(`${origin}${target}`);
}

/**
 * Resolve the post-auth redirect target so the user never lands on a
 * page their role cannot access. This mirrors the middleware gates in
 * src/lib/supabase/middleware.ts but applied proactively here so we
 * never trigger the /unauthorized bounce for a legitimate user.
 */
function resolveTarget(requested: string, role: { owner: boolean; member: boolean }): string {
  if (isOwnerPath(requested) || isOutreachPath(requested)) {
    return role.owner ? requested : "/unauthorized";
  }

  if (isClientPath(requested)) {
    if (role.member) return requested;
    if (role.owner) return OWNER_HOME;
    return "/unauthorized";
  }

  // Unknown / public destination — only honour it if the user has any role.
  if (role.owner) return OWNER_HOME;
  if (role.member) return CLIENT_HOME;
  return "/unauthorized";
}
