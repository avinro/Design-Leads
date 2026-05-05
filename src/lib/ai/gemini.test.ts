import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AiCallLog, Logger } from "./types";

// Mock the AI SDK before importing the module under test
vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn()),
}));

import { generateGeminiText } from "./gemini";
import { generateText } from "ai";

/** Build a minimal mock result compatible with the AI SDK's generateText return type. */
function mockResult(text: string, inputTokens: number, outputTokens: number) {
  // Cast through unknown to avoid satisfying the full GenerateTextResult shape in tests
  return {
    text,
    usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
  } as unknown as Awaited<ReturnType<typeof generateText>>;
}

const MOCK_PROMPT = {
  id: "test-prompt",
  version: "v1",
  template: "Hello {{name}}, write about {{topic}}.",
};

function makeLogger(): { logger: Logger; logs: AiCallLog[] } {
  const logs: AiCallLog[] = [];
  const logger: Logger = { info: (log) => logs.push(log) };
  return { logger, logs };
}

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, GEMINI_API_KEY: "test-key" };
  vi.clearAllMocks();
});

afterEach(() => {
  process.env = originalEnv;
});

describe("generateGeminiText — feature flag disabled", () => {
  it("returns null and logs status=disabled when NEXT_PUBLIC_AI_ENABLED is not 'true'", async () => {
    process.env.NEXT_PUBLIC_AI_ENABLED = "false";
    const { logger, logs } = makeLogger();

    const result = await generateGeminiText({
      prompt: MOCK_PROMPT,
      variables: { name: "Alice", topic: "design" },
      logger,
    });

    expect(result).toBeNull();
    expect(generateText).not.toHaveBeenCalled();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject<Partial<AiCallLog>>({
      event: "ai.call",
      status: "disabled",
      promptId: "test-prompt",
      promptVersion: "v1",
      retried: false,
    });
  });

  it("treats missing NEXT_PUBLIC_AI_ENABLED as disabled", async () => {
    delete process.env.NEXT_PUBLIC_AI_ENABLED;
    const { logger, logs } = makeLogger();

    const result = await generateGeminiText({
      prompt: MOCK_PROMPT,
      variables: {},
      logger,
    });

    expect(result).toBeNull();
    expect(logs[0]?.status).toBe("disabled");
  });
});

describe("generateGeminiText — successful call", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_AI_ENABLED = "true";
  });

  it("calls the SDK and returns the model text", async () => {
    vi.mocked(generateText).mockResolvedValueOnce(mockResult("Hello from Gemini", 10, 20));

    const result = await generateGeminiText({
      prompt: MOCK_PROMPT,
      variables: { name: "Alice", topic: "design" },
    });

    expect(result).toBe("Hello from Gemini");
    expect(generateText).toHaveBeenCalledOnce();
  });

  it("interpolates variables into the prompt template before calling the SDK", async () => {
    vi.mocked(generateText).mockResolvedValueOnce(mockResult("response", 5, 5));

    await generateGeminiText({
      prompt: MOCK_PROMPT,
      variables: { name: "Bob", topic: "typography" },
    });

    expect(vi.mocked(generateText)).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "Hello Bob, write about typography." }),
    );
  });

  it("logs a complete AiCallLog with status=ok", async () => {
    vi.mocked(generateText).mockResolvedValueOnce(mockResult("ok", 100, 200));

    const { logger, logs } = makeLogger();

    await generateGeminiText({
      prompt: MOCK_PROMPT,
      variables: {},
      logger,
    });

    expect(logs).toHaveLength(1);
    // logs.length is asserted above — index 0 is guaranteed
    const log = logs[0];
    expect(log.event).toBe("ai.call");
    expect(log.status).toBe("ok");
    expect(log.model).toBe("gemini-2.0-flash-lite");
    expect(log.promptId).toBe("test-prompt");
    expect(log.promptVersion).toBe("v1");
    expect(log.inputTokens).toBe(100);
    expect(log.outputTokens).toBe(200);
    expect(log.costEstimateUsd).toBeTypeOf("number");
    expect(log.retried).toBe(false);
    expect(typeof log.latencyMs).toBe("number");
  });
});

describe("generateGeminiText — retry logic", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_AI_ENABLED = "true";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries once on 429 and succeeds, logging retried=true", async () => {
    const retryError = Object.assign(new Error("Rate limited"), { status: 429 });

    vi.mocked(generateText)
      .mockRejectedValueOnce(retryError)
      .mockResolvedValueOnce(mockResult("retry success", 10, 10));

    const { logger, logs } = makeLogger();

    const promise = generateGeminiText({
      prompt: MOCK_PROMPT,
      variables: {},
      logger,
    });
    // Advance timers to resolve the backoff sleep
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("retry success");
    expect(generateText).toHaveBeenCalledTimes(2);
    expect(logs[0]?.retried).toBe(true);
    expect(logs[0]?.status).toBe("ok");
  });

  it("retries once on 503 and succeeds", async () => {
    const serviceError = Object.assign(new Error("Service unavailable"), {
      status: 503,
    });

    vi.mocked(generateText)
      .mockRejectedValueOnce(serviceError)
      .mockResolvedValueOnce(mockResult("back online", 5, 5));

    const { logger, logs } = makeLogger();

    const promise = generateGeminiText({
      prompt: MOCK_PROMPT,
      variables: {},
      logger,
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(logs[0]?.retried).toBe(true);
  });

  it("does not retry on 429 a second time — propagates error after one retry", async () => {
    const retryError = Object.assign(new Error("Rate limited"), { status: 429 });

    vi.mocked(generateText).mockRejectedValue(retryError);

    const { logger, logs } = makeLogger();

    const promise = generateGeminiText({ prompt: MOCK_PROMPT, variables: {}, logger });
    // Attach the rejection handler BEFORE advancing timers to avoid unhandled rejection warnings
    const assertion = expect(promise).rejects.toThrow("Rate limited");
    await vi.runAllTimersAsync();
    await assertion;

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(logs[0]?.status).toBe("error");
    expect(logs[0]?.retried).toBe(true);
  });

  it("does not retry on non-retryable status codes (e.g. 400)", async () => {
    const badRequest = Object.assign(new Error("Bad request"), { status: 400 });
    vi.mocked(generateText).mockRejectedValueOnce(badRequest);

    const { logger, logs } = makeLogger();

    const promise = generateGeminiText({ prompt: MOCK_PROMPT, variables: {}, logger });
    const assertion = expect(promise).rejects.toThrow("Bad request");
    await vi.runAllTimersAsync();
    await assertion;

    expect(generateText).toHaveBeenCalledTimes(1);
    expect(logs[0]?.retried).toBe(false);
  });

  it("does not retry on non-retryable status codes (e.g. 500)", async () => {
    const serverError = Object.assign(new Error("Internal server error"), { status: 500 });
    vi.mocked(generateText).mockRejectedValueOnce(serverError);

    const { logger, logs } = makeLogger();

    const promise = generateGeminiText({ prompt: MOCK_PROMPT, variables: {}, logger });
    const assertion = expect(promise).rejects.toThrow("Internal server error");
    await vi.runAllTimersAsync();
    await assertion;

    expect(generateText).toHaveBeenCalledTimes(1);
    expect(logs[0]?.retried).toBe(false);
  });
});

describe("generateGeminiText — missing API key", () => {
  it("throws when NEXT_PUBLIC_AI_ENABLED is true but GEMINI_API_KEY is missing", async () => {
    process.env.NEXT_PUBLIC_AI_ENABLED = "true";
    delete process.env.GEMINI_API_KEY;

    await expect(generateGeminiText({ prompt: MOCK_PROMPT, variables: {} })).rejects.toThrow(
      "Missing GEMINI_API_KEY",
    );
  });
});
