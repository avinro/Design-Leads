/**
 * Shared Gemini Flash Lite wrapper.
 *
 * Server-only module — never import from client components.
 * Reads GEMINI_API_KEY and NEXT_PUBLIC_AI_ENABLED at call time (not module load)
 * so tests can override process.env before calling.
 */

import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { estimateCostUsd } from "./pricing";
import type { AiCallLog, Logger } from "./types";

export type { AiCallLog, Logger };

const MODEL_ID = "gemini-2.0-flash-lite";

/** Retry status codes that warrant a single retry with backoff. */
const RETRYABLE_STATUSES = new Set([429, 503]);

/** Base delay in ms for the retry backoff. Overridable via env for tests. */
const RETRY_BASE_MS = 500;

const consoleLogger: Logger = {
  info(log) {
    console.info(JSON.stringify(log));
  },
};

export interface VersionedPrompt {
  /** Stable identifier referenced in logs. */
  id: string;
  /** Semantic version, e.g. "v1". Increment when template changes. */
  version: string;
  /** Prompt template — variables are interpolated before calling the model. */
  template: string;
}

export interface GenerateInput {
  prompt: VersionedPrompt;
  /** Key/value pairs to interpolate into prompt.template via {{key}} syntax. */
  variables: Record<string, string>;
  logger?: Logger;
}

/**
 * Calls Gemini Flash Lite with the given prompt and variables.
 *
 * Returns the model response text, or null when AI is disabled.
 * Logs every call (including disabled calls) via the injected logger.
 * Retries once on 429 or 503 with exponential backoff + jitter.
 */
export async function generateGeminiText(input: GenerateInput): Promise<string | null> {
  const { prompt, variables, logger = consoleLogger } = input;

  // Feature flag — read server-side only
  if (process.env.NEXT_PUBLIC_AI_ENABLED !== "true") {
    logger.info({
      event: "ai.call",
      status: "disabled",
      model: MODEL_ID,
      promptId: prompt.id,
      promptVersion: prompt.version,
      inputTokens: null,
      outputTokens: null,
      latencyMs: 0,
      costEstimateUsd: null,
      retried: false,
    });
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. Set it in .env.local or Vercel environment.",
    );
  }

  const interpolated = interpolate(prompt.template, variables);
  const google = createGoogleGenerativeAI({ apiKey });

  return await callWithRetry({
    prompt,
    interpolated,
    google,
    logger,
    retried: false,
  });
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

interface CallArgs {
  prompt: VersionedPrompt;
  interpolated: string;
  google: ReturnType<typeof createGoogleGenerativeAI>;
  logger: Logger;
  retried: boolean;
}

async function callWithRetry(args: CallArgs): Promise<string> {
  const { prompt, interpolated, google, logger, retried } = args;
  const start = performance.now();

  try {
    const result = await generateText({
      model: google(MODEL_ID),
      prompt: interpolated,
    });

    const latencyMs = Math.round(performance.now() - start);
    const inputTokens = result.usage.inputTokens ?? null;
    const outputTokens = result.usage.outputTokens ?? null;

    logger.info({
      event: "ai.call",
      status: "ok",
      model: MODEL_ID,
      promptId: prompt.id,
      promptVersion: prompt.version,
      inputTokens,
      outputTokens,
      latencyMs,
      costEstimateUsd: estimateCostUsd(inputTokens, outputTokens),
      retried,
    });

    return result.text;
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const status = extractStatus(err);

    // Single retry on transient errors, not on subsequent failure
    if (!retried && status !== null && RETRYABLE_STATUSES.has(status)) {
      await sleep(RETRY_BASE_MS + Math.random() * RETRY_BASE_MS);
      return callWithRetry({ ...args, retried: true });
    }

    const error = normalizeError(err);

    logger.info({
      event: "ai.call",
      status: "error",
      model: MODEL_ID,
      promptId: prompt.id,
      promptVersion: prompt.version,
      inputTokens: null,
      outputTokens: null,
      latencyMs,
      costEstimateUsd: null,
      retried,
      error,
    });

    throw err;
  }
}

/** Replaces {{key}} placeholders in a template string. */
function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractStatus(err: unknown): number | null {
  if (
    err !== null &&
    typeof err === "object" &&
    "status" in err &&
    typeof (err as Record<string, unknown>).status === "number"
  ) {
    return (err as { status: number }).status;
  }
  return null;
}

function normalizeError(err: unknown): AiCallLog["error"] {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      status: extractStatus(err) ?? undefined,
    };
  }
  return { name: "UnknownError", message: String(err) };
}
