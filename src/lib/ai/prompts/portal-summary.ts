import type { VersionedPrompt } from "../gemini";

/**
 * Generates a brief AI summary of a client project for the portal dashboard.
 *
 * Variables:
 *  - {{projectName}} — name of the project
 *  - {{milestones}} — comma-separated list of recent milestones
 *  - {{status}} — current project status (e.g. "on track", "at risk")
 */
export const PORTAL_SUMMARY_PROMPT: VersionedPrompt = {
  id: "portal-summary",
  version: "v1",
  template: `You are a project assistant generating a concise status summary for a client portal.

Project: {{projectName}}
Recent milestones: {{milestones}}
Current status: {{status}}

Write a 2–3 sentence summary in plain, client-friendly language.
Highlight progress and next steps. Do not use bullet points.`,
} as const;
