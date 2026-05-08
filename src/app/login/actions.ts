"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/seo/site";
import { sanitizeNext } from "@/lib/auth/paths";

const emailSchema = z.object({
  email: z.email("Please enter a valid email address."),
  next: z.string().optional(),
});

export type LoginState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export async function sendMagicLink(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    email: formData.get("email"),
    next: formData.get("next"),
  };

  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const key = String(issue.path[0] ?? "");
      if (key) acc[key] = [...(acc[key] ?? []), issue.message];
      return acc;
    }, {});
    return { status: "error", message: "Please check the form below.", fieldErrors };
  }

  const { email, next } = parsed.data;
  const safeNext = sanitizeNext(next, "/client");

  // Append the return URL to the confirm callback so the user lands on the
  // right page after verifyOtp.
  const confirmUrl = new URL(`${SITE_URL}/auth/confirm`);
  confirmUrl.searchParams.set("next", safeNext);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Do not auto-create accounts — only invited users may access the portal.
      shouldCreateUser: false,
      emailRedirectTo: confirmUrl.toString(),
    },
  });

  if (error) {
    console.error("[login] signInWithOtp error:", error.message);
    // Return a generic message — do not reveal whether the email exists.
    return {
      status: "success",
      message: "If that email is registered, a sign-in link has been sent.",
    };
  }

  // Intentionally redirect away so the user can't re-submit.
  redirect(`/login/check-email?email=${encodeURIComponent(email)}`);
}
