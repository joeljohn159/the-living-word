import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Tests for data/cross-references.json — validates the integrity,
 * format, and completeness of the 500+ cross-reference entries.
 */

interface RawCrossRef {
  s: [number, number, number];
  t: [number, number, number];
  r: "parallel" | "prophecy-fulfillment" | "quotation" | "allusion" | "contrast";
  n: string;
}

const VALID_RELATIONSHIPS = [
  "parallel",
  "prophecy-fulfillment",
  "quotation",
  "allusion",
  "contrast",
] as const;

// Bible book count: 66 canonical books (1-indexed)
const MAX_BOOK_NUM = 66;

let crossRefs: RawCrossRef[];

// Load once for all tests
crossRefs = JSON.parse(
  readFileSync(resolve(process.cwd(), "data/cross-references.json"), "utf-8"),
);

// ─── Data File Existence & Parsing ────────────────────────────────────────

describe("Cross-references JSON — file integrity", () => {
  it("loads and parses as valid JSON", () => {
    expect(crossRefs).toBeDefined();
    expect(Array.isArray(crossRefs)).toBe(true);
  });

  it("contains more than 500 entries", () => {
    expect(crossRefs.length).toBeGreaterThan(500);
  });
});

// ─── Entry Schema Validation ──────────────────────────────────────────────

describe("Cross-references JSON — entry schema", () => {
  it("every entry has required keys: s, t, r, n", () => {
    for (let i = 0; i < crossRefs.length; i++) {
      const ref = crossRefs[i];
      expect(ref).toHaveProperty("s");
      expect(ref).toHaveProperty("t");
      expect(ref).toHaveProperty("r");
      expect(ref).toHaveProperty("n");
    }
  });

  it("source (s) is always a 3-element array of numbers", () => {
    for (const ref of crossRefs) {
      expect(Array.isArray(ref.s)).toBe(true);
      expect(ref.s).toHaveLength(3);
      expect(ref.s.every((v) => typeof v === "number" && Number.isInteger(v))).toBe(true);
    }
  });

  it("target (t) is always a 3-element array of numbers", () => {
    for (const ref of crossRefs) {
      expect(Array.isArray(ref.t)).toBe(true);
      expect(ref.t).toHaveLength(3);
      expect(ref.t.every((v) => typeof v === "number" && Number.isInteger(v))).toBe(true);
    }
  });

  it("relationship (r) is one of the valid enum values", () => {
    for (const ref of crossRefs) {
      expect(VALID_RELATIONSHIPS).toContain(ref.r);
    }
  });

  it("note (n) is a non-empty string for every entry", () => {
    for (const ref of crossRefs) {
      expect(typeof ref.n).toBe("string");
      expect(ref.n.trim().length).toBeGreaterThan(0);
    }
  });
});

// ─── Verse Reference Range Validation ─────────────────────────────────────

describe("Cross-references JSON — verse reference ranges", () => {
  it("all source book numbers are between 1 and 66", () => {
    for (const ref of crossRefs) {
      expect(ref.s[0]).toBeGreaterThanOrEqual(1);
      expect(ref.s[0]).toBeLessThanOrEqual(MAX_BOOK_NUM);
    }
  });

  it("all target book numbers are between 1 and 66", () => {
    for (const ref of crossRefs) {
      expect(ref.t[0]).toBeGreaterThanOrEqual(1);
      expect(ref.t[0]).toBeLessThanOrEqual(MAX_BOOK_NUM);
    }
  });

  it("all chapter numbers are positive integers", () => {
    for (const ref of crossRefs) {
      expect(ref.s[1]).toBeGreaterThanOrEqual(1);
      expect(ref.t[1]).toBeGreaterThanOrEqual(1);
    }
  });

  it("all verse numbers are positive integers", () => {
    for (const ref of crossRefs) {
      expect(ref.s[2]).toBeGreaterThanOrEqual(1);
      expect(ref.t[2]).toBeGreaterThanOrEqual(1);
    }
  });

  it("no entry references itself (source !== target)", () => {
    for (const ref of crossRefs) {
      const same =
        ref.s[0] === ref.t[0] && ref.s[1] === ref.t[1] && ref.s[2] === ref.t[2];
      expect(same).toBe(false);
    }
  });
});

// ─── Content Coverage ─────────────────────────────────────────────────────

describe("Cross-references JSON — content coverage", () => {
  it("includes all five relationship types", () => {
    const types = new Set(crossRefs.map((r) => r.r));
    for (const rel of VALID_RELATIONSHIPS) {
      expect(types.has(rel)).toBe(true);
    }
  });

  it("includes OT → NT prophecy-fulfillment pairs", () => {
    const prophecyFulfillments = crossRefs.filter(
      (r) => r.r === "prophecy-fulfillment" && r.s[0] <= 39 && r.t[0] >= 40,
    );
    // Should have a meaningful number of OT→NT prophecy fulfillments
    expect(prophecyFulfillments.length).toBeGreaterThanOrEqual(20);
  });

  it("includes quotation references", () => {
    const quotations = crossRefs.filter((r) => r.r === "quotation");
    expect(quotations.length).toBeGreaterThanOrEqual(10);
  });

  it("includes Synoptic Gospel parallel entries (books 40-42)", () => {
    const synopticParallels = crossRefs.filter(
      (r) =>
        r.r === "parallel" &&
        [40, 41, 42].includes(r.s[0]) &&
        [40, 41, 42].includes(r.t[0]),
    );
    expect(synopticParallels.length).toBeGreaterThanOrEqual(5);
  });

  it("includes contrast type entries", () => {
    const contrasts = crossRefs.filter((r) => r.r === "contrast");
    expect(contrasts.length).toBeGreaterThanOrEqual(1);
  });

  it("spans both OT and NT source books", () => {
    const otSources = crossRefs.filter((r) => r.s[0] <= 39);
    const ntSources = crossRefs.filter((r) => r.s[0] >= 40);
    expect(otSources.length).toBeGreaterThan(0);
    expect(ntSources.length).toBeGreaterThan(0);
  });

  it("includes Genesis references (book 1)", () => {
    const genesis = crossRefs.filter((r) => r.s[0] === 1 || r.t[0] === 1);
    expect(genesis.length).toBeGreaterThan(0);
  });

  it("includes Revelation references (book 66)", () => {
    const revelation = crossRefs.filter((r) => r.s[0] === 66 || r.t[0] === 66);
    expect(revelation.length).toBeGreaterThan(0);
  });
});

// ─── No Duplicate Entries ─────────────────────────────────────────────────

describe("Cross-references JSON — uniqueness", () => {
  it("has no exact duplicate entries (same source, target, and relationship)", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const ref of crossRefs) {
      const key = `${ref.s.join(",")}->${ref.t.join(",")}_${ref.r}`;
      if (seen.has(key)) {
        duplicates.push(key);
      }
      seen.add(key);
    }

    expect(duplicates).toEqual([]);
  });
});

// ─── Edge Cases in Notes ──────────────────────────────────────────────────

describe("Cross-references JSON — note quality", () => {
  it("notes do not exceed 200 characters (concise descriptions)", () => {
    const longNotes = crossRefs.filter((r) => r.n.length > 200);
    expect(longNotes.length).toBe(0);
  });

  it("notes are not just whitespace", () => {
    for (const ref of crossRefs) {
      expect(ref.n.trim()).not.toBe("");
    }
  });
});
