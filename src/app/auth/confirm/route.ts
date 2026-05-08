import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { sanitizeNext } from "@/lib/auth/paths";

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

/**
 * GET /auth/confirm
 *
 * PKCE confirm route — exchanges a token_hash for a server-side session.
 * Called after the user clicks a magic-link or invite email.
 *
 * Query params:
 *   token_hash  — from the email template: {{ .TokenHash }}
 *   type        — "magiclink" | "invite" | "email" (validated below)
 *   next        — optional return URL (sanitized before use)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const next = sanitizeNext(searchParams.get("next"), "/client");

  const loginErrorUrl = `${origin}/login?error=link_invalid&next=${encodeURIComponent(next)}`;

  // Validate both params before touching the auth client.
  if (!token_hash || !rawType || !VALID_OTP_TYPES.has(rawType)) {
    return NextResponse.redirect(loginErrorUrl);
  }

  const supabase = await createClient();
  // rawType validated against VALID_OTP_TYPES above; passed as-is since
  // verifyOtp accepts string-compatible EmailOtpType.
  const { error } = await supabase.auth.verifyOtp({
    type: rawType,
    token_hash,
  });

  if (error) {
    console.error("[auth/confirm] verifyOtp error:", error.message);
    return NextResponse.redirect(loginErrorUrl);
  }

  // verifyOtp sets the session cookie via the SSR client. The trigger
  // handle_user_email_confirmed fires inside Postgres and seals joined_at
  // automatically — no additional server action needed here.
  return NextResponse.redirect(`${origin}${next}`);
}
