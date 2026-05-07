import "server-only";
import nodemailer from "nodemailer";

/*
 * Gmail OAuth2 mailer — server-only module.
 *
 * Uses Nodemailer with Gmail's OAuth2 authentication. The bundled `xoauth2`
 * library handles access-token refresh automatically; no googleapis dep needed.
 *
 * Required env vars (all server-side, never NEXT_PUBLIC_):
 *   GMAIL_USER          — Gmail address that owns the OAuth credentials (sender)
 *   GMAIL_CLIENT_ID     — OAuth2 client ID from Google Cloud Console
 *   GMAIL_CLIENT_SECRET — OAuth2 client secret
 *   GMAIL_REFRESH_TOKEN — Offline refresh token (scope: https://mail.google.com/)
 *   CONTACT_NOTIFICATION_TO — Recipient for contact notifications (defaults to GMAIL_USER)
 *
 * The `server-only` import causes a build-time error if this module is ever
 * accidentally imported in a client component.
 */

interface GmailEnv {
  user: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  notifyTo: string;
}

function getGmailEnv(): GmailEnv {
  const user = process.env.GMAIL_USER;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!user) throw new Error("Missing GMAIL_USER environment variable.");
  if (!clientId) throw new Error("Missing GMAIL_CLIENT_ID environment variable.");
  if (!clientSecret) throw new Error("Missing GMAIL_CLIENT_SECRET environment variable.");
  if (!refreshToken) throw new Error("Missing GMAIL_REFRESH_TOKEN environment variable.");

  return {
    user,
    clientId,
    clientSecret,
    refreshToken,
    // Fall back to sender address if no explicit recipient is configured.
    notifyTo: process.env.CONTACT_NOTIFICATION_TO ?? user,
  };
}

// Lazy singleton transport — avoids re-creating the OAuth client per request.
let transport: nodemailer.Transporter | undefined;

function getTransport(): nodemailer.Transporter {
  if (transport) return transport;

  const { user, clientId, clientSecret, refreshToken } = getGmailEnv();

  transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user,
      clientId,
      clientSecret,
      refreshToken,
    },
  });

  return transport;
}

export interface OwnerNotificationPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

/*
 * sendOwnerNotification — sends a formatted contact alert to the site owner.
 *
 * Returns void on success. Throws on transport error so the caller can
 * decide how to handle the failure (persist the error, log, etc.).
 * The replyTo header is set to the visitor's email for one-click replies.
 */
export async function sendOwnerNotification(payload: OwnerNotificationPayload): Promise<void> {
  const { user, notifyTo } = getGmailEnv();
  const { name, email, company, message } = payload;

  const companyLine = company ? `Company: ${company}\n` : "";

  const text = [
    `New contact form submission from ${name} <${email}>`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    companyLine.trimEnd(),
    `Message:\n${message}`,
    "",
    "---",
    "Reply directly to this email to respond to the sender.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p><strong>New contact form submission</strong></p>
    <table cellpadding="4" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td style="font-weight:bold;padding-right:16px;">Name</td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      ${company ? `<tr><td style="font-weight:bold;padding-right:16px;">Company</td><td>${escapeHtml(company)}</td></tr>` : ""}
    </table>
    <p style="margin-top:16px;font-weight:bold;">Message:</p>
    <p style="white-space:pre-wrap;background:#f4f4f4;padding:12px;border-radius:4px;">${escapeHtml(message)}</p>
    <hr/>
    <p style="color:#666;font-size:12px;">Reply directly to this email to respond to the sender.</p>
  `.trim();

  await getTransport().sendMail({
    from: `"Avinro Contact" <${user}>`,
    to: notifyTo,
    replyTo: `"${name}" <${email}>`,
    subject: `[Contact] ${name} — ${truncate(message, 60)}`,
    text,
    html,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str: string, len: number): string {
  const trimmed = str.trim().replace(/\s+/g, " ");
  return trimmed.length <= len ? trimmed : trimmed.slice(0, len - 1) + "…";
}
