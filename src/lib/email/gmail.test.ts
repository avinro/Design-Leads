import { describe, it, expect, vi, beforeEach } from "vitest";

/*
 * gmail.test.ts — unit tests for sendOwnerNotification.
 *
 * Strategy:
 *   1. Mock `nodemailer` so no real SMTP call is made.
 *   2. Mock `server-only` so the import guard doesn't throw in test env.
 *   3. Stub all required env vars before each test.
 *   4. Assert that `sendMail` is called with the correct envelope.
 */

// Mock server-only so the guard import is a no-op in the test environment.
vi.mock("server-only", () => ({}));

// Capture the sendMail spy before nodemailer is imported by the module under test.
const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test-id" });

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock,
    })),
  },
}));

describe("sendOwnerNotification", () => {
  const env: Record<string, string> = {
    GMAIL_USER: "sender@gmail.com",
    GMAIL_CLIENT_ID: "client-id",
    GMAIL_CLIENT_SECRET: "client-secret",
    GMAIL_REFRESH_TOKEN: "refresh-token",
    CONTACT_NOTIFICATION_TO: "owner@gmail.com",
  };

  beforeEach(() => {
    vi.resetModules();
    sendMailMock.mockClear();
    Object.entries(env).forEach(([k, v]) => {
      process.env[k] = v;
    });
  });

  it("calls sendMail with the correct from, to, and replyTo", async () => {
    const { sendOwnerNotification } = await import("./gmail");

    await sendOwnerNotification({
      name: "Alice Test",
      email: "alice@example.com",
      company: "Acme",
      message: "Hello, I would like to discuss a project with you.",
    });

    expect(sendMailMock).toHaveBeenCalledOnce();
    const [options] = sendMailMock.mock.calls[0] as [Record<string, unknown>];

    expect(options.from).toContain("sender@gmail.com");
    expect(options.to).toBe("owner@gmail.com");
    expect(options.replyTo).toContain("alice@example.com");
  });

  it("prefixes the subject with [Contact]", async () => {
    const { sendOwnerNotification } = await import("./gmail");

    await sendOwnerNotification({
      name: "Bob",
      email: "bob@example.com",
      message: "This is a longer test message for the subject line truncation test.",
    });

    const [options] = sendMailMock.mock.calls[0] as [Record<string, unknown>];
    expect(String(options.subject)).toMatch(/^\[Contact\]/);
  });

  it("includes the visitor's name and message in the text body", async () => {
    const { sendOwnerNotification } = await import("./gmail");

    await sendOwnerNotification({
      name: "Carol",
      email: "carol@example.com",
      message: "I have an interesting project I would like to talk about.",
    });

    const [options] = sendMailMock.mock.calls[0] as [Record<string, unknown>];
    const text = String(options.text);
    expect(text).toContain("Carol");
    expect(text).toContain("carol@example.com");
    expect(text).toContain("I have an interesting project");
  });

  it("includes the company name when provided", async () => {
    const { sendOwnerNotification } = await import("./gmail");

    await sendOwnerNotification({
      name: "Dan",
      email: "dan@example.com",
      company: "Widgetco",
      message: "We are building something and would love your input on it.",
    });

    const [options] = sendMailMock.mock.calls[0] as [Record<string, unknown>];
    expect(String(options.text)).toContain("Widgetco");
  });

  it("defaults notifyTo to GMAIL_USER when CONTACT_NOTIFICATION_TO is unset", async () => {
    delete process.env.CONTACT_NOTIFICATION_TO;
    const { sendOwnerNotification } = await import("./gmail");

    await sendOwnerNotification({
      name: "Eve",
      email: "eve@example.com",
      message: "Default recipient test — no CONTACT_NOTIFICATION_TO set.",
    });

    const [options] = sendMailMock.mock.calls[0] as [Record<string, unknown>];
    expect(options.to).toBe("sender@gmail.com");
  });

  it("throws when GMAIL_USER is missing", async () => {
    delete process.env.GMAIL_USER;
    const { sendOwnerNotification } = await import("./gmail");

    await expect(
      sendOwnerNotification({
        name: "Frank",
        email: "frank@example.com",
        message: "This should throw because GMAIL_USER is missing.",
      }),
    ).rejects.toThrow("GMAIL_USER");
  });
});
