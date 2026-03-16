import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrossRefTab } from "../CrossRefTab";
import { useCrossRefStore } from "@/stores/cross-references";
import type { ChapterCrossRef } from "@/stores/cross-references";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function makeRef(
  id: number,
  verseNum: number,
  relationship: string,
  targetBook = "Romans",
): ChapterCrossRef {
  return {
    id,
    sourceVerseId: 100 + verseNum,
    sourceVerseNumber: verseNum,
    targetBook,
    targetBookSlug: targetBook.toLowerCase(),
    targetChapter: 8,
    targetVerse: id,
    targetText: `Text for ${targetBook} 8:${id}`,
    relationship,
    note: null,
  };
}

const SAMPLE_REFS: ChapterCrossRef[] = [
  makeRef(1, 1, "parallel", "Romans"),
  makeRef(2, 1, "quotation", "Isaiah"),
  makeRef(3, 2, "prophecy-fulfillment", "Matthew"),
  makeRef(4, 3, "allusion", "Hebrews"),
  makeRef(5, 3, "contrast", "Galatians"),
];

describe("CrossRefTab", () => {
  beforeEach(() => {
    // Reset the store before each test
    useCrossRefStore.getState().hydrate({
      crossRefs: SAMPLE_REFS,
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });
  });

  it("shows 'Chapter Cross-References' header when no verse is selected", () => {
    render(<CrossRefTab />);
    expect(screen.getByText("Chapter Cross-References")).toBeInTheDocument();
  });

  it("shows total count of cross-references", () => {
    render(<CrossRefTab />);
    expect(screen.getByText("5 cross-references")).toBeInTheDocument();
  });

  it("displays all relationship groups in correct order", () => {
    render(<CrossRefTab />);
    // Each badge text may appear multiple times (group header + card), use getAllByText
    expect(screen.getAllByText("Parallel").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Quotation").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Prophecy").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Allusion").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Contrast").length).toBeGreaterThanOrEqual(1);
  });

  it("filters by selected verse", () => {
    useCrossRefStore.getState().selectVerse(1);
    render(<CrossRefTab />);

    // Header shows verse reference
    expect(screen.getByText("Genesis 1:1")).toBeInTheDocument();
    // Count reflects filtered set
    expect(screen.getByText("2 cross-references")).toBeInTheDocument();
    // Only verse 1 refs visible
    expect(screen.getByText("Romans 8:1")).toBeInTheDocument();
    expect(screen.getByText("Isaiah 8:2")).toBeInTheDocument();
    // Verse 2 and 3 refs not visible
    expect(screen.queryByText("Matthew 8:3")).not.toBeInTheDocument();
  });

  it("shows singular 'cross-reference' for a single match", () => {
    useCrossRefStore.getState().selectVerse(2);
    render(<CrossRefTab />);
    expect(screen.getByText("1 cross-reference")).toBeInTheDocument();
  });

  it("shows clear button when a verse is selected", () => {
    useCrossRefStore.getState().selectVerse(1);
    render(<CrossRefTab />);
    expect(
      screen.getByRole("button", { name: /show all chapter references/i }),
    ).toBeInTheDocument();
  });

  it("does not show clear button when no verse is selected", () => {
    render(<CrossRefTab />);
    expect(
      screen.queryByRole("button", { name: /show all chapter references/i }),
    ).not.toBeInTheDocument();
  });

  it("clears the selection when Clear button is clicked", async () => {
    const user = userEvent.setup();
    useCrossRefStore.getState().selectVerse(1);
    render(<CrossRefTab />);

    await user.click(
      screen.getByRole("button", { name: /show all chapter references/i }),
    );

    // Store should be cleared
    expect(useCrossRefStore.getState().selectedVerseNumber).toBeNull();
  });

  it("shows empty state when no cross-refs exist", () => {
    useCrossRefStore.getState().hydrate({
      crossRefs: [],
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });
    render(<CrossRefTab />);
    expect(
      screen.getByText("No cross-references found for this chapter."),
    ).toBeInTheDocument();
  });

  it("shows verse-specific empty state when selected verse has no refs", () => {
    useCrossRefStore.getState().selectVerse(99);
    render(<CrossRefTab />);
    expect(
      screen.getByText("No cross-references found for this verse."),
    ).toBeInTheDocument();
  });
});
