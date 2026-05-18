import { describe, expect, it } from "vitest";

import { INTRO_PENDING_HTML_CLASS, INTRO_SEEN_SESSION_KEY } from "@/lib/intro/constants";
import { INTRO_BLOCK_FIRST_PAINT_SCRIPT } from "@/lib/intro/block-first-paint";

describe("INTRO_BLOCK_FIRST_PAINT_SCRIPT", () => {
  it("references the intro-seen session key", () => {
    expect(INTRO_BLOCK_FIRST_PAINT_SCRIPT).toContain(INTRO_SEEN_SESSION_KEY);
  });

  it("adds the pending html class when intro has not been seen", () => {
    expect(INTRO_BLOCK_FIRST_PAINT_SCRIPT).toContain(INTRO_PENDING_HTML_CLASS);
  });
});
