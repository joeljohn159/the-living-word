import { describe, it, expect, beforeEach } from "vitest";
import { useCrossRefStore, type ChapterCrossRef } from "../cross-references";

/**
 * Tests for the cross-references Zustand store.
 *
 * Validates hydration, verse selection/filtering, and state reset behavior.
 */

// ─── Test Fixtures ────────────────────────────────────────────────────────

function makeCrossRef(overrides: Partial<ChapterCrossRef> = {}): ChapterCrossRef {
  return {
    id: 1,
    sourceVerseId: 100,
    sourceVerseNumber: 1,
    targetBook: "John",
    targetBookSlug: "john",
    targetChapter: 1,
    targetVerse: 1,
    targetText: "In the beginning was the Word.",
    relationship: "allusion",
    note: "Genesis 1:1 echoed in John 1:1",
    ...overrides,
  };
}

const SAMPLE_CROSS_REFS: ChapterCrossRef[] = [
  makeCrossRef({ id: 1, sourceVerseNumber: 1, targetBook: "John", targetBookSlug: "john" }),
  makeCrossRef({
    id: 2,
    sourceVerseNumber: 1,
    targetBook: "Hebrews",
    targetBookSlug: "hebrews",
    targetChapter: 11,
    targetVerse: 3,
    relationship: "allusion",
    note: "God created by His word",
  }),
  makeCrossRef({
    id: 3,
    sourceVerseNumber: 3,
    targetBook: "2 Corinthians",
    targetBookSlug: "2-corinthians",
    targetChapter: 4,
    targetVerse: 6,
    relationship: "allusion",
    note: "Light from darkness",
  }),
  makeCrossRef({
    id: 4,
    sourceVerseNumber: 26,
    targetBook: "Colossians",
    targetBookSlug: "colossians",
    targetChapter: 1,
    targetVerse: 15,
    relationship: "allusion",
    note: "Image of God",
  }),
  makeCrossRef({
    id: 5,
    sourceVerseNumber: 27,
    targetBook: "1 Corinthians",
    targetBookSlug: "1-corinthians",
    targetChapter: 11,
    targetVerse: 7,
    relationship: "allusion",
    note: "Man as image and glory",
  }),
];

// ─── Store Reset ──────────────────────────────────────────────────────────

beforeEach(() => {
  useCrossRefStore.setState({
    crossRefs: [],
    selectedVerseNumber: null,
    bookSlug: "",
    bookName: "",
    chapter: 0,
  });
});

// ─── Default State ────────────────────────────────────────────────────────

describe("CrossRef store — default state", () => {
  it("starts with empty crossRefs array", () => {
    expect(useCrossRefStore.getState().crossRefs).toEqual([]);
  });

  it("starts with no selected verse", () => {
    expect(useCrossRefStore.getState().selectedVerseNumber).toBeNull();
  });

  it("starts with empty book context", () => {
    const state = useCrossRefStore.getState();
    expect(state.bookSlug).toBe("");
    expect(state.bookName).toBe("");
    expect(state.chapter).toBe(0);
  });
});

// ─── Hydration ────────────────────────────────────────────────────────────

describe("CrossRef store — hydrate", () => {
  it("hydrates the store with chapter cross-reference data", () => {
    useCrossRefStore.getState().hydrate({
      crossRefs: SAMPLE_CROSS_REFS,
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });

    const state = useCrossRefStore.getState();
    expect(state.crossRefs).toHaveLength(5);
    expect(state.bookSlug).toBe("genesis");
    expect(state.bookName).toBe("Genesis");
    expect(state.chapter).toBe(1);
  });

  it("resets selectedVerseNumber on hydrate", () => {
    // First set a selection
    useCrossRefStore.getState().selectVerse(3);
    expect(useCrossRefStore.getState().selectedVerseNumber).toBe(3);

    // Hydrate should clear it
    useCrossRefStore.getState().hydrate({
      crossRefs: SAMPLE_CROSS_REFS,
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });

    expect(useCrossRefStore.getState().selectedVerseNumber).toBeNull();
  });

  it("replaces previous crossRefs on re-hydrate", () => {
    useCrossRefStore.getState().hydrate({
      crossRefs: SAMPLE_CROSS_REFS,
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });
    expect(useCrossRefStore.getState().crossRefs).toHaveLength(5);

    // Hydrate with different data
    const newRefs = [makeCrossRef({ id: 99 })];
    useCrossRefStore.getState().hydrate({
      crossRefs: newRefs,
      bookSlug: "exodus",
      bookName: "Exodus",
      chapter: 12,
    });

    const state = useCrossRefStore.getState();
    expect(state.crossRefs).toHaveLength(1);
    expect(state.crossRefs[0].id).toBe(99);
    expect(state.bookSlug).toBe("exodus");
  });

  it("handles hydration with empty crossRefs array", () => {
    useCrossRefStore.getState().hydrate({
      crossRefs: [],
      bookSlug: "obadiah",
      bookName: "Obadiah",
      chapter: 1,
    });

    const state = useCrossRefStore.getState();
    expect(state.crossRefs).toEqual([]);
    expect(state.bookName).toBe("Obadiah");
  });
});

// ─── Verse Selection ──────────────────────────────────────────────────────

describe("CrossRef store — selectVerse", () => {
  beforeEach(() => {
    useCrossRefStore.getState().hydrate({
      crossRefs: SAMPLE_CROSS_REFS,
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });
  });

  it("sets the selected verse number", () => {
    useCrossRefStore.getState().selectVerse(1);
    expect(useCrossRefStore.getState().selectedVerseNumber).toBe(1);
  });

  it("changes the selected verse number", () => {
    useCrossRefStore.getState().selectVerse(1);
    useCrossRefStore.getState().selectVerse(26);
    expect(useCrossRefStore.getState().selectedVerseNumber).toBe(26);
  });

  it("allows selecting null to show all refs", () => {
    useCrossRefStore.getState().selectVerse(1);
    useCrossRefStore.getState().selectVerse(null);
    expect(useCrossRefStore.getState().selectedVerseNumber).toBeNull();
  });

  it("does not modify the crossRefs array when selecting a verse", () => {
    useCrossRefStore.getState().selectVerse(1);
    expect(useCrossRefStore.getState().crossRefs).toHaveLength(5);
  });
});

// ─── Clear Selection ──────────────────────────────────────────────────────

describe("CrossRef store — clearSelection", () => {
  it("clears the selected verse number", () => {
    useCrossRefStore.getState().selectVerse(3);
    expect(useCrossRefStore.getState().selectedVerseNumber).toBe(3);

    useCrossRefStore.getState().clearSelection();
    expect(useCrossRefStore.getState().selectedVerseNumber).toBeNull();
  });

  it("is a no-op when nothing is selected", () => {
    useCrossRefStore.getState().clearSelection();
    expect(useCrossRefStore.getState().selectedVerseNumber).toBeNull();
  });
});

// ─── Filtering Cross-Refs by Selected Verse ───────────────────────────────

describe("CrossRef store — filtering behavior", () => {
  beforeEach(() => {
    useCrossRefStore.getState().hydrate({
      crossRefs: SAMPLE_CROSS_REFS,
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });
  });

  it("can derive filtered refs from state (verse 1 has 2 refs)", () => {
    useCrossRefStore.getState().selectVerse(1);
    const { crossRefs, selectedVerseNumber } = useCrossRefStore.getState();

    const filtered = selectedVerseNumber
      ? crossRefs.filter((r) => r.sourceVerseNumber === selectedVerseNumber)
      : crossRefs;

    expect(filtered).toHaveLength(2);
    expect(filtered.every((r) => r.sourceVerseNumber === 1)).toBe(true);
  });

  it("returns all refs when no verse is selected", () => {
    const { crossRefs, selectedVerseNumber } = useCrossRefStore.getState();

    const filtered = selectedVerseNumber
      ? crossRefs.filter((r) => r.sourceVerseNumber === selectedVerseNumber)
      : crossRefs;

    expect(filtered).toHaveLength(5);
  });

  it("returns empty array when selecting a verse with no refs", () => {
    useCrossRefStore.getState().selectVerse(999);
    const { crossRefs, selectedVerseNumber } = useCrossRefStore.getState();

    const filtered = selectedVerseNumber
      ? crossRefs.filter((r) => r.sourceVerseNumber === selectedVerseNumber)
      : crossRefs;

    expect(filtered).toHaveLength(0);
  });
});

// ─── ChapterCrossRef Shape ────────────────────────────────────────────────

describe("CrossRef store — ChapterCrossRef data shape", () => {
  it("preserves all fields after hydration", () => {
    const ref = makeCrossRef({
      id: 42,
      sourceVerseId: 500,
      sourceVerseNumber: 15,
      targetBook: "Revelation",
      targetBookSlug: "revelation",
      targetChapter: 12,
      targetVerse: 5,
      targetText: "Man child who shall rule all nations",
      relationship: "prophecy-fulfillment",
      note: "Seed of woman crushes serpent",
    });

    useCrossRefStore.getState().hydrate({
      crossRefs: [ref],
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 3,
    });

    const stored = useCrossRefStore.getState().crossRefs[0];
    expect(stored.id).toBe(42);
    expect(stored.sourceVerseId).toBe(500);
    expect(stored.sourceVerseNumber).toBe(15);
    expect(stored.targetBook).toBe("Revelation");
    expect(stored.targetBookSlug).toBe("revelation");
    expect(stored.targetChapter).toBe(12);
    expect(stored.targetVerse).toBe(5);
    expect(stored.targetText).toBe("Man child who shall rule all nations");
    expect(stored.relationship).toBe("prophecy-fulfillment");
    expect(stored.note).toBe("Seed of woman crushes serpent");
  });

  it("allows null note field", () => {
    const ref = makeCrossRef({ note: null });
    useCrossRefStore.getState().hydrate({
      crossRefs: [ref],
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });

    expect(useCrossRefStore.getState().crossRefs[0].note).toBeNull();
  });
});
