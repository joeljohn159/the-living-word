import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChapterGrid } from "../ChapterGrid";

// Mock next/link to render an anchor tag
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ChapterGrid", () => {
  it("renders a section with 'Chapters' heading", () => {
    render(<ChapterGrid bookSlug="genesis" chapterCount={50} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Chapters");
  });

  it("renders the correct number of chapter links", () => {
    render(<ChapterGrid bookSlug="genesis" chapterCount={50} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(50);
  });

  it("renders chapter numbers 1 through N", () => {
    render(<ChapterGrid bookSlug="genesis" chapterCount={5} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("generates correct href for each chapter link", () => {
    render(<ChapterGrid bookSlug="genesis" chapterCount={3} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/bible/genesis/1");
    expect(links[1]).toHaveAttribute("href", "/bible/genesis/2");
    expect(links[2]).toHaveAttribute("href", "/bible/genesis/3");
  });

  it("uses the bookSlug in chapter URLs", () => {
    render(<ChapterGrid bookSlug="revelation" chapterCount={1} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/bible/revelation/1");
  });

  it("adds aria-label to each chapter link", () => {
    render(<ChapterGrid bookSlug="genesis" chapterCount={3} />);
    expect(screen.getByLabelText("Chapter 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Chapter 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Chapter 3")).toBeInTheDocument();
  });

  it("has an accessible section label", () => {
    render(<ChapterGrid bookSlug="genesis" chapterCount={5} />);
    const section = screen.getByLabelText("Chapters");
    expect(section).toBeInTheDocument();
  });

  it("renders a single link for a book with 1 chapter", () => {
    render(<ChapterGrid bookSlug="obadiah" chapterCount={1} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/bible/obadiah/1");
  });

  it("renders correct number of links for large chapter count", () => {
    render(<ChapterGrid bookSlug="psalms" chapterCount={150} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(150);
  });
});
