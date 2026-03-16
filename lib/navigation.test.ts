import { describe, it, expect, vi } from "vitest";
import { getChapterNavLinks } from "./navigation";

// Mock the ALL_BOOKS data
vi.mock("@/lib/data/books", () => ({
  ALL_BOOKS: [
    { slug: "genesis", name: "Genesis", chapterCount: 50 },
    { slug: "exodus", name: "Exodus", chapterCount: 40 },
    { slug: "leviticus", name: "Leviticus", chapterCount: 27 },
  ],
}));

describe("getChapterNavLinks", () => {
  it("returns previous and next chapters within the same book", () => {
    const { prev, next } = getChapterNavLinks("genesis", 5, 50);

    expect(prev).toEqual({
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 4,
    });
    expect(next).toEqual({
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 6,
    });
  });

  it("returns null for prev at the very first chapter of the first book", () => {
    const { prev, next } = getChapterNavLinks("genesis", 1, 50);

    expect(prev).toBeNull();
    expect(next).toEqual({
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 2,
    });
  });

  it("returns null for next at the very last chapter of the last book", () => {
    const { prev, next } = getChapterNavLinks("leviticus", 27, 27);

    expect(prev).toEqual({
      bookSlug: "leviticus",
      bookName: "Leviticus",
      chapter: 26,
    });
    expect(next).toBeNull();
  });

  it("crosses to the previous book when on chapter 1", () => {
    const { prev } = getChapterNavLinks("exodus", 1, 40);

    expect(prev).toEqual({
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 50, // last chapter of Genesis
    });
  });

  it("crosses to the next book when on the last chapter", () => {
    const { next } = getChapterNavLinks("genesis", 50, 50);

    expect(next).toEqual({
      bookSlug: "exodus",
      bookName: "Exodus",
      chapter: 1,
    });
  });

  it("handles middle book with both cross-book navigation", () => {
    // Exodus chapter 1 — prev should be Genesis 50
    const { prev } = getChapterNavLinks("exodus", 1, 40);
    expect(prev).toEqual({
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 50,
    });

    // Exodus chapter 40 — next should be Leviticus 1
    const { next } = getChapterNavLinks("exodus", 40, 40);
    expect(next).toEqual({
      bookSlug: "leviticus",
      bookName: "Leviticus",
      chapter: 1,
    });
  });
});
