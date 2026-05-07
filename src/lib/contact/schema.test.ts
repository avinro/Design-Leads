import { describe, it, expect } from "vitest";
import type { z } from "zod";
import { contactSchema } from "./schema";

/*
 * Helper — extracts per-field error messages from a ZodError.
 * Uses error.issues directly (flatten() is deprecated in Zod v4).
 */
function fieldErrors(err: z.ZodError): Record<string, string[]> {
  return err.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = String(issue.path[0] ?? "");
    if (key) {
      acc[key] = [...(acc[key] ?? []), issue.message];
    }
    return acc;
  }, {});
}

describe("contactSchema", () => {
  const valid = {
    name: "Ary Test",
    email: "ary@example.com",
    company: "Acme",
    message: "This is a test message that is long enough to pass validation.",
    website: "",
  };

  // ── Happy path ──────────────────────────────────────────────────────────

  it("accepts a fully valid submission", () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts a submission without optional fields", () => {
    const result = contactSchema.safeParse({
      name: valid.name,
      email: valid.email,
      message: valid.message,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty company string (treated as optional)", () => {
    const result = contactSchema.safeParse({ ...valid, company: "" });
    expect(result.success).toBe(true);
  });

  // ── Name ────────────────────────────────────────────────────────────────

  it("rejects an empty name", () => {
    const result = contactSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).name).toBeDefined();
    }
  });

  it("rejects a name that exceeds 200 characters", () => {
    const result = contactSchema.safeParse({ ...valid, name: "A".repeat(201) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).name).toBeDefined();
    }
  });

  it("accepts a name of exactly 200 characters", () => {
    const result = contactSchema.safeParse({ ...valid, name: "A".repeat(200) });
    expect(result.success).toBe(true);
  });

  // ── Email ───────────────────────────────────────────────────────────────

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).email).toBeDefined();
    }
  });

  it("rejects an email without a TLD", () => {
    const result = contactSchema.safeParse({ ...valid, email: "user@domain" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid email with subdomain", () => {
    const result = contactSchema.safeParse({ ...valid, email: "user@mail.example.co.uk" });
    expect(result.success).toBe(true);
  });

  // ── Message ─────────────────────────────────────────────────────────────

  it("rejects a message shorter than 20 characters", () => {
    const result = contactSchema.safeParse({ ...valid, message: "Too short." });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).message).toBeDefined();
    }
  });

  it("rejects a message longer than 5000 characters", () => {
    const result = contactSchema.safeParse({ ...valid, message: "A".repeat(5001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).message).toBeDefined();
    }
  });

  it("accepts a message of exactly 20 characters", () => {
    const result = contactSchema.safeParse({ ...valid, message: "A".repeat(20) });
    expect(result.success).toBe(true);
  });

  it("accepts a message of exactly 5000 characters", () => {
    const result = contactSchema.safeParse({ ...valid, message: "A".repeat(5000) });
    expect(result.success).toBe(true);
  });

  // ── Company ─────────────────────────────────────────────────────────────

  it("rejects a company name longer than 200 characters", () => {
    const result = contactSchema.safeParse({ ...valid, company: "X".repeat(201) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).company).toBeDefined();
    }
  });

  // ── Honeypot ────────────────────────────────────────────────────────────
  // The schema intentionally allows any value in `website` — the server
  // action performs the bot-drop logic, not the schema.

  it("passes schema parsing even when the honeypot field is filled", () => {
    const result = contactSchema.safeParse({ ...valid, website: "http://spam.example.com" });
    expect(result.success).toBe(true);
  });

  // ── Whitespace trimming ─────────────────────────────────────────────────

  it("trims leading and trailing whitespace from name", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  Ary  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ary");
    }
  });

  it("trims whitespace from message", () => {
    const trimmed = "  This message has leading and trailing spaces.  ";
    const result = contactSchema.safeParse({ ...valid, message: trimmed });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe(trimmed.trim());
    }
  });
});
