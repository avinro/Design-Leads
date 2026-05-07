"use server";

import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import { contactSchema, type ContactState } from "@/lib/contact/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOwnerNotification } from "@/lib/email/gmail";

// Row shape for contact_submissions inserts/updates.
// Kept local because we have no generated DB types yet.
interface ContactSubmissionInsert {
  name: string;
  email: string;
  company: string | null;
  message: string;
  user_agent?: string;
  ip_address?: string;
  notification_status: string;
}

interface ContactSubmissionUpdate {
  notification_status: string;
  notified_at?: string;
  notification_error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedClient = SupabaseClient<any, any, any>;

/*
 * submitContact — server action for the /contact form.
 *
 * Flow:
 *   1. Server-side schema validation (zod).
 *   2. Honeypot check — silently succeed without insert/email if filled.
 *   3. Insert the validated row via the service-role admin client.
 *   4. Attempt to send owner notification via Gmail OAuth2.
 *   5. Update notification_status on the inserted row ('sent' or 'failed').
 *   6. Return a discriminated ContactState to the form component.
 *
 * The visitor always sees success if the DB insert succeeds, even if the
 * email fails. The notification_error column makes failures recoverable
 * without requiring a re-submission.
 */
export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // ── 1. Parse & validate ────────────────────────────────────────────────
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    message: formData.get("message"),
    website: formData.get("website"),
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors = parsed.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const key = String(issue.path[0] ?? "");
      if (key) {
        acc[key] = [...(acc[key] ?? []), issue.message];
      }
      return acc;
    }, {});
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors,
    };
  }

  const { name, email, company, message, website } = parsed.data;

  // ── 2. Honeypot ─────────────────────────────────────────────────────────
  // If the hidden field is non-empty, it's almost certainly a bot.
  // Return fake success without touching the DB or sending email.
  if ((website ?? "").trim() !== "") {
    return { status: "success", message: "Message sent." };
  }

  // ── 3. Capture request metadata ─────────────────────────────────────────
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") ?? undefined;
  // x-forwarded-for may contain multiple IPs ("1.2.3.4, 5.6.7.8").
  // Take only the first (leftmost), which is the originating client.
  const rawIp = reqHeaders.get("x-forwarded-for");
  const ipAddress = rawIp ? rawIp.split(",")[0].trim() : undefined;

  // ── 4. Insert submission ─────────────────────────────────────────────────
  // Cast to UntypedClient because we have no generated DB schema types yet.
  const admin = createAdminClient() as UntypedClient;

  const insertPayload: ContactSubmissionInsert = {
    name,
    email,
    company: company ?? null,
    message,
    user_agent: userAgent,
    ip_address: ipAddress,
    notification_status: "pending",
  };

  const { data: inserted, error: insertError } = await admin
    .from("contact_submissions")
    .insert(insertPayload)
    .select("id")
    .single<{ id: string }>();

  if (insertError ?? !inserted) {
    console.error("[contact] Insert failed:", insertError);
    return {
      status: "error",
      message:
        "We couldn't save your message. Please try again or email hello@avinro.com directly.",
    };
  }

  const submissionId = inserted.id;

  // ── 5. Send owner notification ───────────────────────────────────────────
  try {
    await sendOwnerNotification({ name, email, company, message });

    const sentUpdate: ContactSubmissionUpdate = {
      notification_status: "sent",
      notified_at: new Date().toISOString(),
    };
    await admin.from("contact_submissions").update(sentUpdate).eq("id", submissionId);
  } catch (mailError) {
    const errorMsg =
      mailError instanceof Error
        ? mailError.message.slice(0, 500)
        : String(mailError).slice(0, 500);

    console.error("[contact] Owner notification failed:", mailError);

    // Persist the failure — submission is still stored and recoverable.
    const failedUpdate: ContactSubmissionUpdate = {
      notification_status: "failed",
      notification_error: errorMsg,
    };
    await admin.from("contact_submissions").update(failedUpdate).eq("id", submissionId);
  }

  // ── 6. Return success ────────────────────────────────────────────────────
  return {
    status: "success",
    message: "Message sent.",
  };
}
