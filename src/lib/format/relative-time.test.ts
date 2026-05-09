import { describe, expect, it } from "vitest";

import { relativeTime } from "./relative-time";

// Fix a reference point so all tests are deterministic.
const NOW = new Date("2026-05-09T10:00:00.000Z").getTime();
const sec = (n: number) => NOW - n * 1000;
const min = (n: number) => sec(n * 60);
const hr = (n: number) => min(n * 60);
const day = (n: number) => hr(n * 24);

describe("relativeTime", () => {
  it("returns 'just now' for 0 seconds ago", () => {
    expect(relativeTime(NOW, NOW)).toBe("just now");
  });

  it("returns 'just now' for 59 seconds ago", () => {
    expect(relativeTime(sec(59), NOW)).toBe("just now");
  });

  it("returns '1m ago' for exactly 60 seconds ago", () => {
    expect(relativeTime(sec(60), NOW)).toBe("1m ago");
  });

  it("returns '59m ago' for 59 minutes ago", () => {
    expect(relativeTime(min(59), NOW)).toBe("59m ago");
  });

  it("returns '1h ago' for exactly 60 minutes ago", () => {
    expect(relativeTime(min(60), NOW)).toBe("1h ago");
  });

  it("returns '23h ago' for 23 hours ago", () => {
    expect(relativeTime(hr(23), NOW)).toBe("23h ago");
  });

  it("returns '1d ago' for exactly 24 hours ago", () => {
    expect(relativeTime(hr(24), NOW)).toBe("1d ago");
  });

  it("returns '6d ago' for 6 days ago", () => {
    expect(relativeTime(day(6), NOW)).toBe("6d ago");
  });

  it("returns an absolute date for 7 days ago", () => {
    // 7 days before 2026-05-09 = 2026-05-02
    const result = relativeTime(day(7), NOW);
    expect(result).toMatch(/May 2, 2026/);
  });

  it("accepts a string date", () => {
    expect(relativeTime("2026-05-09T10:00:00.000Z", NOW)).toBe("just now");
  });

  it("accepts a Date object", () => {
    expect(relativeTime(new Date(sec(30)), NOW)).toBe("just now");
  });
});
