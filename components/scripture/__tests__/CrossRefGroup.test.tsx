import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrossRefGroup } from "../CrossRefGroup";
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

function makeRef(id: number, targetBook = "Romans"): ChapterCrossRef {
  return {
    id,
    sourceVerseId: 100,
    sourceVerseNumber: 1,
    targetBook,
    targetBookSlug: targetBook.toLowerCase(),
    targetChapter: 1,
    targetVerse: id,
    targetText: `Verse text for ${targetBook} 1:${id}`,
    relationship: "parallel",
    note: null,
  };
}

describe("CrossRefGroup", () => {
  const refs = [makeRef(1), makeRef(2), makeRef(3)];

  it("renders the group header with relationship badge and count", () => {
    render(<CrossRefGroup relationship="parallel" references={refs} />);
    // Badge appears in header + each card, so use getAllByText
    const badges = screen.getAllByText("Parallel");
    expect(badges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("(3)")).toBeInTheDocument();
  });

  it("renders all cross-reference cards when expanded (default)", () => {
    render(<CrossRefGroup relationship="parallel" references={refs} />);
    expect(screen.getByText("Romans 1:1")).toBeInTheDocument();
    expect(screen.getByText("Romans 1:2")).toBeInTheDocument();
    expect(screen.getByText("Romans 1:3")).toBeInTheDocument();
  });

  it("collapses the group and hides cards when the header is clicked", async () => {
    const user = userEvent.setup();
    render(<CrossRefGroup relationship="parallel" references={refs} />);

    const toggle = screen.getByRole("button", {
      name: /parallel references/i,
    });

    // Initially expanded
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Romans 1:1")).toBeInTheDocument();

    // Collapse
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Romans 1:1")).not.toBeInTheDocument();
  });

  it("re-expands when clicked again after collapsing", async () => {
    const user = userEvent.setup();
    render(<CrossRefGroup relationship="parallel" references={refs} />);

    const toggle = screen.getByRole("button", {
      name: /parallel references/i,
    });

    await user.click(toggle); // collapse
    await user.click(toggle); // expand
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Romans 1:1")).toBeInTheDocument();
  });

  it("shows correct count for a single reference", () => {
    render(
      <CrossRefGroup relationship="quotation" references={[makeRef(5)]} />,
    );
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("has accessible aria-label describing the group", () => {
    render(<CrossRefGroup relationship="allusion" references={refs} />);
    const toggle = screen.getByRole("button");
    expect(toggle).toHaveAttribute(
      "aria-label",
      "allusion references, 3 items",
    );
  });
});
