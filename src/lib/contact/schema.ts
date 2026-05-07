import { z } from "zod";

/*
 * contactSchema — single source of truth for client and server validation.
 *
 * Import this from both ContactForm (client) and the submitContact server
 * action (server) to guarantee the same rules apply on both sides.
 *
 * Honeypot (`website`): intentionally not validated here so that bots that
 * fill it still pass schema parsing. The server action checks the value and
 * silently drops the submission without inserting or emailing.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
  email: z.email("Enter a valid email address").max(320, "Email is too long"),
  company: z.string().trim().max(200, "Company name is too long").optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(5000, "Message is too long"),
  // Honeypot — checked server-side only; bots silently dropped.
  website: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export type ContactState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<keyof ContactFormValues, string[]>>;
    };
