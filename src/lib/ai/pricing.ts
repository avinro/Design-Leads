/**
 * Gemini Flash Lite pricing constants.
 *
 * Source: https://ai.google.dev/pricing#gemini-2.0-flash-lite
 * Update PRICING_LAST_UPDATED and rates whenever Google changes its pricing.
 */

export const PRICING_VERSION = "2026-05";
export const PRICING_LAST_UPDATED = "2026-05-05";

export const GEMINI_FLASH_LITE_PRICING = {
  /** USD per 1 million input tokens */
  inputUsdPer1MTokens: 0.075,
  /** USD per 1 million output tokens */
  outputUsdPer1MTokens: 0.3,
} as const;

/**
 * Estimates cost in USD for a single Gemini call.
 * Returns null when either token count is unavailable — never returns 0 to mask missing data.
 */
export function estimateCostUsd(
  inputTokens: number | null,
  outputTokens: number | null,
): number | null {
  if (inputTokens === null || outputTokens === null) return null;

  const inputCost = (inputTokens / 1_000_000) * GEMINI_FLASH_LITE_PRICING.inputUsdPer1MTokens;
  const outputCost = (outputTokens / 1_000_000) * GEMINI_FLASH_LITE_PRICING.outputUsdPer1MTokens;

  return inputCost + outputCost;
}
