import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CrossRefProvider } from "../CrossRefProvider";
import { useCrossRefStore } from "@/stores/cross-references";
import type { ChapterCrossRef } from "@/stores/cross-references";

const SAMPLE_REFS: ChapterCrossRef[] = [
  {
    id: 1,
    sourceVerseId: 100,
    sourceVerseNumber: 1,
    targetBook: "Romans",
    targetBookSlug: "romans",
    targetChapter: 8,
    targetVerse: 28,
    targetText: "And we know that in all things...",
    relationship: "parallel",
    note: null,
  },
];

describe("CrossRefProvider", () => {
  beforeEach(() => {
    // Reset the store
    useCrossRefStore.setState({
      crossRefs: [],
      selectedVerseNumber: null,
      bookSlug: "",
      bookName: "",
      chapter: 0,
    });
  });

  it("renders children", () => {
    render(
      <CrossRefProvider
        crossReferences={SAMPLE_REFS}
        bookSlug="genesis"
        bookName="Genesis"
        chapter={1}
      >
        <div>Child content</div>
      </CrossRefProvider>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("hydrates the store with provided data", () => {
    render(
      <CrossRefProvider
        crossReferences={SAMPLE_REFS}
        bookSlug="genesis"
        bookName="Genesis"
        chapter={3}
      >
        <div />
      </CrossRefProvider>,
    );

    const state = useCrossRefStore.getState();
    expect(state.crossRefs).toEqual(SAMPLE_REFS);
    expect(state.bookSlug).toBe("genesis");
    expect(state.bookName).toBe("Genesis");
    expect(state.chapter).toBe(3);
    expect(state.selectedVerseNumber).toBeNull();
  });

  it("resets selectedVerseNumber on hydration", () => {
    // Pre-set a selection
    useCrossRefStore.getState().selectVerse(5);

    render(
      <CrossRefProvider
        crossReferences={SAMPLE_REFS}
        bookSlug="genesis"
        bookName="Genesis"
        chapter={1}
      >
        <div />
      </CrossRefProvider>,
    );

    expect(useCrossRefStore.getState().selectedVerseNumber).toBeNull();
  });

  it("hydrates with empty cross-references array", () => {
    render(
      <CrossRefProvider
        crossReferences={[]}
        bookSlug="exodus"
        bookName="Exodus"
        chapter={10}
      >
        <div />
      </CrossRefProvider>,
    );

    const state = useCrossRefStore.getState();
    expect(state.crossRefs).toEqual([]);
    expect(state.bookSlug).toBe("exodus");
  });
});
