import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookCard } from "../BookCard";
import type { BookWithSlug } from "@/lib/data/books";

// Mock framer-motion to render plain divs (avoids animation complexity in tests)
vi.mock("framer-motion", () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, layout, initial, animate, exit, transition, ...rest }: React.PropsWithChildren<Record<string, unknown>>) => {
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock next/link to render an anchor tag
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const makeBook = (overrides: Partial<BookWithSlug> = {}): BookWithSlug => ({
  name: "Genesis",
  abbreviation: "Gen",
  testament: "OT",
  category: "Law",
  chapterCount: 50,
  author: "Moses",
  dateWritten: "c. 1445–1405 BC",
  description: "The book of beginnings.",
  keyThemes: "Creation, Fall, Covenant, Faith, Providence",
  sortOrder: 1,
  slug: "genesis",
  ...overrides,
});

describe("BookCard", () => {
  it("renders book name, chapter count, author, and category badge", () => {
    render(<BookCard book={makeBook()} />);

    expect(screen.getByText("Genesis")).toBeInTheDocument();
    expect(screen.getByText("50 chapters")).toBeInTheDocument();
    expect(screen.getByText("Moses")).toBeInTheDocument();
    expect(screen.getByText("Law")).toBeInTheDocument();
  });

  it("renders the first key theme", () => {
    render(<BookCard book={makeBook()} />);
    expect(screen.getByText("Creation")).toBeInTheDocument();
  });

  it("links to the correct book slug URL", () => {
    render(<BookCard book={makeBook({ slug: "genesis" })} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/bible/genesis");
  });

  it("uses singular 'chapter' for books with 1 chapter", () => {
    render(<BookCard book={makeBook({ name: "Obadiah", chapterCount: 1, slug: "obadiah" })} />);
    expect(screen.getByText("1 chapter")).toBeInTheDocument();
  });

  it("has an accessible aria-label with book name and chapter count", () => {
    render(<BookCard book={makeBook()} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Genesis — 50 chapters");
  });

  it("maps compound categories to display categories (e.g., Major Prophets → Prophets)", () => {
    render(
      <BookCard book={makeBook({ category: "Major Prophets", name: "Isaiah", slug: "isaiah" })} />
    );
    expect(screen.getByText("Prophets")).toBeInTheDocument();
  });

  it("maps Pauline Epistles → Epistles display category", () => {
    render(
      <BookCard book={makeBook({ category: "Pauline Epistles", name: "Romans", slug: "romans" })} />
    );
    expect(screen.getByText("Epistles")).toBeInTheDocument();
  });

  it("handles book with empty keyThemes gracefully", () => {
    const { container } = render(<BookCard book={makeBook({ keyThemes: "" })} />);
    // Should not render an italic theme element when there's no theme
    const italicEls = container.querySelectorAll("p.italic, p[class*='italic']");
    // The first theme is empty string, so the conditional renders nothing
    expect(italicEls.length).toBe(0);
  });
});
