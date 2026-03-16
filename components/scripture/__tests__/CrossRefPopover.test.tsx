import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrossRefPopover } from "../CrossRefPopover";
import { useCrossRefStore } from "@/stores/cross-references";
import { usePreferencesStore } from "@/stores/preferences";
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
  relationship = "parallel",
  targetBook = "Romans",
): ChapterCrossRef {
  return {
    id,
    sourceVerseId: 100,
    sourceVerseNumber: 5,
    targetBook,
    targetBookSlug: targetBook.toLowerCase(),
    targetChapter: 3,
    targetVerse: id,
    targetText: `Verse text for ${targetBook} 3:${id} - some preview content here for testing`,
    relationship,
    note: null,
  };
}

const VERSE_5_REFS = [
  makeRef(1, "parallel", "Romans"),
  makeRef(2, "quotation", "Isaiah"),
  makeRef(3, "prophecy-fulfillment", "Matthew"),
  makeRef(4, "allusion", "Hebrews"),
];

describe("CrossRefPopover", () => {
  beforeEach(() => {
    useCrossRefStore.getState().hydrate({
      crossRefs: VERSE_5_REFS,
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });
  });

  function renderPopover(verseNumber = 5) {
    return render(
      <CrossRefPopover verseNumber={verseNumber}>
        <sup>{verseNumber}</sup>
      </CrossRefPopover>,
    );
  }

  it("renders the trigger with verse number", () => {
    renderPopover();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows cross-reference count in aria-label when refs exist", () => {
    renderPopover();
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute(
      "aria-label",
      "Verse 5, 4 cross-references",
    );
  });

  it("shows simple aria-label when no refs exist for verse", () => {
    renderPopover(99);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-label", "Verse 99");
  });

  it("opens popover when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Cross-References (4)")).toBeInTheDocument();
  });

  it("shows only up to 3 preview references (MAX_PREVIEW_REFS)", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button"));

    // 3 links should be preview refs, plus the "View all" button
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("shows 'View all N in panel' when more than 3 refs exist", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("View all 4 in panel →")).toBeInTheDocument();
  });

  it("shows 'View in panel' when 3 or fewer refs exist", async () => {
    const user = userEvent.setup();
    // Override store with only 2 refs for verse 5
    useCrossRefStore.getState().hydrate({
      crossRefs: VERSE_5_REFS.slice(0, 2),
      bookSlug: "genesis",
      bookName: "Genesis",
      chapter: 1,
    });

    renderPopover();
    await user.click(screen.getByRole("button"));

    expect(screen.getByText("View in panel →")).toBeInTheDocument();
  });

  it("does not open popover when verse has no cross-references", async () => {
    const user = userEvent.setup();
    renderPopover(99);

    await user.click(screen.getByRole("button"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes popover when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes popover when clicking outside", async () => {
    const user = userEvent.setup();
    const { container } = renderPopover();

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Click outside the popover
    await user.click(container.parentElement!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles popover open and closed on repeated clicks", async () => {
    const user = userEvent.setup();
    renderPopover();
    const trigger = screen.getByRole("button");

    await user.click(trigger); // open
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(trigger); // close
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens via keyboard (Enter key)", async () => {
    const user = userEvent.setup();
    renderPopover();

    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens via keyboard (Space key)", async () => {
    const user = userEvent.setup();
    renderPopover();

    screen.getByRole("button").focus();
    await user.keyboard(" ");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("sets aria-expanded correctly", async () => {
    const user = userEvent.setup();
    renderPopover();

    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("'View all' button selects the verse and switches to cross-references tab", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("View all 4 in panel →"));

    // Should set selectedVerse in the cross-ref store
    expect(useCrossRefStore.getState().selectedVerseNumber).toBe(5);
    // Should set the active tab to cross-references
    expect(usePreferencesStore.getState().activeSidebarTab).toBe(
      "cross-references",
    );
    // Popover should close
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders links with correct target verse URLs", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button"));

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/bible/romans/3/1");
    expect(links[1]).toHaveAttribute("href", "/bible/isaiah/3/2");
    expect(links[2]).toHaveAttribute("href", "/bible/matthew/3/3");
  });
});
