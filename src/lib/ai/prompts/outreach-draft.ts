import type { VersionedPrompt } from "../gemini";

/**
 * Generates a cold outreach email draft for a lead.
 *
 * Variables:
 *  - {{recipientName}} — first name of the contact
 *  - {{companyName}} — company name
 *  - {{senderName}} — sender's display name
 */
export const OUTREACH_DRAFT_PROMPT: VersionedPrompt = {
  id: "outreach-draft",
  version: "v1",
  template: `You are a professional outreach specialist writing on behalf of a product designer.

Write a concise, personalized cold outreach email to {{recipientName}} at {{companyName}}.
Keep it under 100 words. Focus on the value the designer can bring, not on selling.
End with a single, low-commitment call to action.

Sender: {{senderName}}`,
} as const;
