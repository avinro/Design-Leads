import { describe, expect, it } from "vitest";

import { isClientPath, isOutreachPath, isOwnerPath, isPublicPath, sanitizeNext } from "./paths";

describe("isClientPath", () => {
  it("matches /client", () => {
    expect(isClientPath("/client")).toBe(true);
  });
  it("matches /client/projects/123", () => {
    expect(isClientPath("/client/projects/123")).toBe(true);
  });
  it("does not match /about", () => {
    expect(isClientPath("/about")).toBe(false);
  });
});

describe("isOutreachPath", () => {
  it("matches /outreach", () => {
    expect(isOutreachPath("/outreach")).toBe(true);
  });
  it("matches /outreach/leads", () => {
    expect(isOutreachPath("/outreach/leads")).toBe(true);
  });
  it("does not match /client", () => {
    expect(isOutreachPath("/client")).toBe(false);
  });
});

describe("isOwnerPath", () => {
  it("matches /owner/invite", () => {
    expect(isOwnerPath("/owner/invite")).toBe(true);
  });
  it("matches /owner/dashboard", () => {
    expect(isOwnerPath("/owner/dashboard")).toBe(true);
  });
  it("matches /owner/clients", () => {
    expect(isOwnerPath("/owner/clients")).toBe(true);
  });
  it("matches /owner/clients/abc-123", () => {
    expect(isOwnerPath("/owner/clients/abc-123")).toBe(true);
  });
  it("matches /owner/clients/abc-123/members/new", () => {
    expect(isOwnerPath("/owner/clients/abc-123/members/new")).toBe(true);
  });
  it("matches /owner/inbox", () => {
    expect(isOwnerPath("/owner/inbox")).toBe(true);
  });
  it("matches /owner/settings", () => {
    expect(isOwnerPath("/owner/settings")).toBe(true);
  });
  it("does not match /outreach", () => {
    expect(isOwnerPath("/outreach")).toBe(false);
  });
  it("does not match /client", () => {
    expect(isOwnerPath("/client")).toBe(false);
  });
});

describe("isPublicPath", () => {
  it("matches /login", () => {
    expect(isPublicPath("/login")).toBe(true);
  });
  it("matches /auth/confirm", () => {
    expect(isPublicPath("/auth/confirm")).toBe(true);
  });
  it("matches /", () => {
    expect(isPublicPath("/")).toBe(true);
  });
  it("matches /work", () => {
    expect(isPublicPath("/work")).toBe(true);
  });
  it("matches /about", () => {
    expect(isPublicPath("/about")).toBe(true);
  });
  it("matches /unauthorized", () => {
    expect(isPublicPath("/unauthorized")).toBe(true);
  });
  it("does not match /client", () => {
    expect(isPublicPath("/client")).toBe(false);
  });
  it("does not match /owner/invite", () => {
    expect(isPublicPath("/owner/invite")).toBe(false);
  });
  it("does not match /owner/dashboard", () => {
    expect(isPublicPath("/owner/dashboard")).toBe(false);
  });
});

describe("sanitizeNext", () => {
  it("returns valid relative path unchanged", () => {
    expect(sanitizeNext("/client")).toBe("/client");
  });
  it("returns nested path unchanged", () => {
    expect(sanitizeNext("/client/projects/123")).toBe("/client/projects/123");
  });
  it("returns fallback for null", () => {
    expect(sanitizeNext(null)).toBe("/");
  });
  it("returns fallback for undefined", () => {
    expect(sanitizeNext(undefined)).toBe("/");
  });
  it("returns fallback for empty string", () => {
    expect(sanitizeNext("")).toBe("/");
  });
  it("blocks protocol-relative URL (//evil.com)", () => {
    expect(sanitizeNext("//evil.com")).toBe("/");
  });
  it("blocks absolute URL", () => {
    expect(sanitizeNext("https://evil.com")).toBe("/");
  });
  it("respects custom fallback", () => {
    expect(sanitizeNext(null, "/client")).toBe("/client");
  });
});
