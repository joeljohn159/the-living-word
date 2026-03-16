import { describe, it, expect } from "vitest";
import { CONTEXT_TABS, type ContextTab } from "../context-panel-tabs";

describe("CONTEXT_TABS", () => {
  it("defines exactly 6 tabs", () => {
    expect(CONTEXT_TABS).toHaveLength(6);
  });

  it("has the correct tab keys in display order", () => {
    const keys = CONTEXT_TABS.map((t) => t.key);
    expect(keys).toEqual([
      "visuals",
      "evidence",
      "map",
      "cross-references",
      "people",
      "notes",
    ]);
  });

  it("each tab has a non-empty label, shortLabel, and icon", () => {
    CONTEXT_TABS.forEach((tab) => {
      expect(tab.label).toBeTruthy();
      expect(tab.shortLabel).toBeTruthy();
      expect(tab.icon).toBeTruthy(); // LucideIcon is a component (object or function)
    });
  });

  it("has unique keys across all tabs", () => {
    const keys = CONTEXT_TABS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("has unique labels across all tabs", () => {
    const labels = CONTEXT_TABS.map((t) => t.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
