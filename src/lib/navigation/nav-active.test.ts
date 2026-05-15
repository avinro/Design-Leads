import { describe, expect, it } from "vitest";

import { isNavSectionActive } from "./nav-active";

describe("isNavSectionActive", () => {
  it("returns false when pathname is missing (SSR / tests without router)", () => {
    expect(isNavSectionActive(undefined, "/work")).toBe(false);
    expect(isNavSectionActive(null, "/work")).toBe(false);
  });

  it("matches exact href and nested paths", () => {
    expect(isNavSectionActive("/work", "/work")).toBe(true);
    expect(isNavSectionActive("/work/pineapp", "/work")).toBe(true);
    expect(isNavSectionActive("/workshop", "/work")).toBe(false);
    expect(isNavSectionActive("/case-studies/uma", "/case-studies")).toBe(true);
    expect(isNavSectionActive("/about", "/about")).toBe(true);
  });

  it("treats home as exact match only", () => {
    expect(isNavSectionActive("/", "/")).toBe(true);
    expect(isNavSectionActive("/work", "/")).toBe(false);
  });
});
