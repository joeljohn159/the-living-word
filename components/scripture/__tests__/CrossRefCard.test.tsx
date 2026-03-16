import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CrossRefCard } from "../CrossRefCard";
import type { ChapterCrossRef } from "@/stores/cross-references";

// Mock next/link to render a plain <a>
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

function makeCrossRef(overrides: Partial<ChapterCrossRef> = {}): ChapterCrossRef {
  return {
    id: 1,
    sourceVerseId: 100,
    sourceVerseNumber: 3,
    targetBook: "Romans",
    targetBookSlug: "romans",
    targetChapter: 8,
    targetVerse: 28,
    targetText:
      "And we know that in all things God works for the good of those who love him.",
    relationship: "parallel",
    note: "Thematic parallel on God's providence",
    ...overrides,
  };
}

describe("CrossRefCard", () => {
  it("renders the target verse reference", () => {
    render(<CrossRefCard crossRef={makeCrossRef()} />);
    expect(screen.getByText("Romans 8:28")).toBeInTheDocument();
  });

  it("renders the relationship badge", () => {
    render(<CrossRefCard crossRef={makeCrossRef()} />);
    expect(screen.getByText("Parallel")).toBeInTheDocument();
  });

  it("renders the verse text preview", () => {
    render(<CrossRefCard crossRef={makeCrossRef()} />);
    expect(
      screen.getByText(/And we know that in all things/),
    ).toBeInTheDocument();
  });

  it("renders the note when present", () => {
    render(<CrossRefCard crossRef={makeCrossRef()} />);
    expect(
      screen.getByText("Thematic parallel on God's providence"),
    ).toBeInTheDocument();
  });

  it("does not render a note element when note is null", () => {
    render(<CrossRefCard crossRef={makeCrossRef({ note: null })} />);
    expect(
      screen.queryByText("Thematic parallel on God's providence"),
    ).not.toBeInTheDocument();
  });

  it("links to the correct target verse URL", () => {
    render(<CrossRefCard crossRef={makeCrossRef()} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/bible/romans/8/28");
  });

  it("has an accessible label with the target verse reference", () => {
    render(<CrossRefCard crossRef={makeCrossRef()} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Romans 8:28");
  });

  it("truncates long verse text", () => {
    const longText = "A".repeat(200);
    render(<CrossRefCard crossRef={makeCrossRef({ targetText: longText })} />);
    // truncate(text, 120) should produce 120 chars + "..."
    expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
  });
});
