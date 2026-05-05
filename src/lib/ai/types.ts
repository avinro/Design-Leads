/**
 * Shared types for the AI module.
 * Callers should import from @/lib/ai (via prompts/index re-export).
 */

export interface AiCallLog {
  event: "ai.call";
  status: "ok" | "error" | "disabled";
  model: string;
  promptId: string;
  promptVersion: string;
  /** null when the SDK does not return usage metadata */
  inputTokens: number | null;
  /** null when the SDK does not return usage metadata */
  outputTokens: number | null;
  latencyMs: number;
  /** null when tokens are unavailable for cost calculation */
  costEstimateUsd: number | null;
  /** true if the call succeeded or failed after a retry attempt */
  retried: boolean;
  error?: { name: string; status?: number; message: string };
}

/** Injectable logger — default implementation uses console.info with JSON payload. */
export interface Logger {
  info: (log: AiCallLog) => void;
}
