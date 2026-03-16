import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "../not-found";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("NotFound (404 page)", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders without errors", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("displays the 404 heading", () => {
    render(<NotFound />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("404");
  });

  it("displays 'Page Not Found' label", () => {
    render(<NotFound />);
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  // ── Museum-themed content ──────────────────────────────────────────

  it("displays the KJV quote from Matthew 7:7", () => {
    render(<NotFound />);
    expect(screen.getByText(/Seek, and ye shall find/)).toBeInTheDocument();
  });

  it("displays the verse reference", () => {
    render(<NotFound />);
    expect(screen.getByText(/Matthew 7:7/)).toBeInTheDocument();
  });

  it("displays a helpful message about the missing page", () => {
    render(<NotFound />);
    expect(
      screen.getByText(/The page you are looking for has been moved or does not exist/)
    ).toBeInTheDocument();
  });

  // ── Navigation links ──────────────────────────────────────────────

  it("renders a 'Return Home' link pointing to /", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /return home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders a 'Browse the Bible' link pointing to /bible", () => {
    render(<NotFound />);
    const bibleLink = screen.getByRole("link", { name: /browse the bible/i });
    expect(bibleLink).toBeInTheDocument();
    expect(bibleLink).toHaveAttribute("href", "/bible");
  });

  // ── Theme & styling ───────────────────────────────────────────────

  it("uses gold accent color via CSS variables", () => {
    render(<NotFound />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("text-gold");
  });

  it("has decorative dividers marked as aria-hidden", () => {
    const { container } = render(<NotFound />);
    const decorativeDivs = container.querySelectorAll("[aria-hidden='true']");
    expect(decorativeDivs.length).toBeGreaterThanOrEqual(2);
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("links have focus ring styles for keyboard navigation", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /return home/i });
    expect(homeLink.className).toContain("focus:ring-2");
  });

  it("links have adequate touch targets", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /return home/i });
    expect(homeLink.className).toContain("touch-target");
  });
});
