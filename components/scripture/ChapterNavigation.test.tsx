import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChapterNavigation } from "./ChapterNavigation";
import type { ChapterNavLink } from "./ChapterNavigation";

// Mock Next.js Link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const prevLink: ChapterNavLink = {
  bookSlug: "genesis",
  bookName: "Genesis",
  chapter: 2,
};

const nextLink: ChapterNavLink = {
  bookSlug: "genesis",
  bookName: "Genesis",
  chapter: 4,
};

describe("ChapterNavigation", () => {
  it("renders both previous and next navigation links", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);

    const prevEl = screen.getByLabelText("Previous: Genesis 2");
    expect(prevEl).toBeInTheDocument();
    expect(prevEl).toHaveAttribute("href", "/bible/genesis/2");

    const nextEl = screen.getByLabelText("Next: Genesis 4");
    expect(nextEl).toBeInTheDocument();
    expect(nextEl).toHaveAttribute("href", "/bible/genesis/4");
  });

  it("shows book name and chapter text for navigation", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    expect(screen.getByText("Genesis 2")).toBeInTheDocument();
    expect(screen.getByText("Genesis 4")).toBeInTheDocument();
  });

  it("renders only next link when prev is null (first chapter)", () => {
    render(<ChapterNavigation prev={null} next={nextLink} />);
    expect(screen.queryByLabelText(/Previous/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Next: Genesis 4")).toBeInTheDocument();
  });

  it("renders only prev link when next is null (last chapter)", () => {
    render(<ChapterNavigation prev={prevLink} next={null} />);
    expect(screen.getByLabelText("Previous: Genesis 2")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Next/)).not.toBeInTheDocument();
  });

  it("renders empty placeholders when both are null", () => {
    const { container } = render(<ChapterNavigation prev={null} next={null} />);
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    // Should have 2 empty divs as placeholders
    expect(nav!.querySelectorAll("div").length).toBe(2);
  });

  it("has correct ARIA label on the nav element", () => {
    render(<ChapterNavigation prev={prevLink} next={nextLink} />);
    const nav = screen.getByRole("navigation", { name: "Chapter navigation" });
    expect(nav).toBeInTheDocument();
  });

  it("links to a different book when navigating across books", () => {
    const crossBookNext: ChapterNavLink = {
      bookSlug: "exodus",
      bookName: "Exodus",
      chapter: 1,
    };
    render(<ChapterNavigation prev={prevLink} next={crossBookNext} />);
    expect(screen.getByLabelText("Next: Exodus 1")).toHaveAttribute(
      "href",
      "/bible/exodus/1"
    );
  });
});
