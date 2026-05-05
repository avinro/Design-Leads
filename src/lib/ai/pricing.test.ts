import { describe, it, expect } from "vitest";
import {
  estimateCostUsd,
  GEMINI_FLASH_LITE_PRICING,
  PRICING_VERSION,
  PRICING_LAST_UPDATED,
} from "./pricing";

describe("estimateCostUsd", () => {
  it("returns null when inputTokens is null", () => {
    expect(estimateCostUsd(null, 100)).toBeNull();
  });

  it("returns null when outputTokens is null", () => {
    expect(estimateCostUsd(100, null)).toBeNull();
  });

  it("returns null when both tokens are null", () => {
    expect(estimateCostUsd(null, null)).toBeNull();
  });

  it("calculates cost correctly for 1M input tokens", () => {
    const cost = estimateCostUsd(1_000_000, 0);
    expect(cost).toBeCloseTo(GEMINI_FLASH_LITE_PRICING.inputUsdPer1MTokens);
  });

  it("calculates cost correctly for 1M output tokens", () => {
    const cost = estimateCostUsd(0, 1_000_000);
    expect(cost).toBeCloseTo(GEMINI_FLASH_LITE_PRICING.outputUsdPer1MTokens);
  });

  it("returns 0 for zero tokens (both provided and zero)", () => {
    expect(estimateCostUsd(0, 0)).toBe(0);
  });

  it("returns a number greater than 0 for positive tokens", () => {
    const cost = estimateCostUsd(100, 200);
    expect(cost).not.toBeNull();
    expect(cost).toBeGreaterThan(0);
  });
});

describe("pricing metadata", () => {
  it("PRICING_VERSION is a non-empty string", () => {
    expect(typeof PRICING_VERSION).toBe("string");
    expect(PRICING_VERSION.length).toBeGreaterThan(0);
  });

  it("PRICING_LAST_UPDATED is a non-empty string", () => {
    expect(typeof PRICING_LAST_UPDATED).toBe("string");
    expect(PRICING_LAST_UPDATED.length).toBeGreaterThan(0);
  });
});
