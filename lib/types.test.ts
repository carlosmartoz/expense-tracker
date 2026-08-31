import { describe, expect, it } from "vitest";
import {
  CATEGORY_COLORS,
  CATEGORY_COLOR_VALUES,
  DEFAULT_CATEGORIES,
  isDefaultCategory,
} from "./types";

/**
 * The default set carries rules that are easy to break by hand-editing the
 * list — a colour reused, a palette entry left dangling — and nothing else in
 * the app would notice.
 */

describe("the default categories", () => {
  it("all take a colour from the palette", () => {
    expect(
      DEFAULT_CATEGORIES.every((c) => CATEGORY_COLOR_VALUES.includes(c.color))
    ).toBe(true);
  });

  it("use every colour in the palette, so none is dead weight", () => {
    const used = new Set(DEFAULT_CATEGORIES.map((c) => c.color));
    expect(CATEGORY_COLOR_VALUES.every((c) => used.has(c))).toBe(true);
  });

  it("share a colour only between the two Other buckets", () => {
    const byColour = new Map<string, string[]>();
    for (const c of DEFAULT_CATEGORIES) {
      byColour.set(c.color, [...(byColour.get(c.color) ?? []), c.id]);
    }
    const shared = [...byColour.entries()].filter(([, ids]) => ids.length > 1);
    expect(shared).toEqual([["#ffffff", ["Other", "OtherIncome"]]]);
  });

  it("give the two Other buckets the same icon as well", () => {
    const others = DEFAULT_CATEGORIES.filter((c) => c.name === "Other");
    expect(others).toHaveLength(2);
    expect(new Set(others.map((c) => c.icon)).size).toBe(1);
  });

  it("cover both sides of the book", () => {
    for (const type of ["income", "expense"] as const) {
      expect(DEFAULT_CATEGORIES.some((c) => c.type === type)).toBe(true);
    }
  });

  it("have unique ids", () => {
    const ids = DEFAULT_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("have unique names within a side", () => {
    for (const type of ["income", "expense"] as const) {
      const names = DEFAULT_CATEGORIES.filter((c) => c.type === type).map((c) =>
        c.name.toLowerCase()
      );
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe("the colour palette", () => {
  it("names every colour", () => {
    expect(CATEGORY_COLORS.every((c) => c.name.trim().length > 0)).toBe(true);
  });

  it("uses each name once, so a tooltip is never ambiguous", () => {
    const names = CATEGORY_COLORS.map((c) => c.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("uses each value once", () => {
    expect(new Set(CATEGORY_COLOR_VALUES).size).toBe(CATEGORY_COLOR_VALUES.length);
  });

  it("keeps the values and the named list in step", () => {
    expect(CATEGORY_COLOR_VALUES).toEqual(CATEGORY_COLORS.map((c) => c.value));
  });
});

describe("telling a default from a category someone made", () => {
  it("recognises every shipped id", () => {
    expect(DEFAULT_CATEGORIES.every((c) => isDefaultCategory(c.id))).toBe(true);
  });

  it("doesn't claim anything else", () => {
    expect(isDefaultCategory("some-generated-uuid")).toBe(false);
    expect(isDefaultCategory("")).toBe(false);
    // A retired default is no longer protected: it can be deleted like any other.
    expect(isDefaultCategory("Home")).toBe(false);
  });
});
