import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BooksGrid } from "../BooksGrid";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, layout, ...rest } =
        props as Record<string, unknown>;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
  },
}));

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

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, loading, sizes, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("BooksGrid", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders the section with correct aria-label", () => {
    render(<BooksGrid />);
    expect(
      screen.getByRole("region", { name: /quick navigation/i })
    ).toBeInTheDocument();
  });

  it("renders the section heading", () => {
    render(<BooksGrid />);
    expect(
      screen.getByRole("heading", { name: /explore the scriptures/i })
    ).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    render(<BooksGrid />);
    expect(
      screen.getByText(/all 66 books of the king james bible/i)
    ).toBeInTheDocument();
  });

  // ── Book cards content ─────────────────────────────────────────────

  it("renders Genesis book card", () => {
    render(<BooksGrid />);
    expect(screen.getByText("Genesis")).toBeInTheDocument();
  });

  it("renders Revelation book card", () => {
    render(<BooksGrid />);
    expect(screen.getByText("Revelation")).toBeInTheDocument();
  });

  it("book cards link to correct Bible routes", () => {
    render(<BooksGrid />);
    const genesisLink = screen.getByTitle("Genesis").closest("a");
    expect(genesisLink).toHaveAttribute("href", "/bible/genesis");
  });

  // ── Text contrast: CSS variable usage ──────────────────────────────

  it("abbreviations use --text-secondary for adequate contrast", () => {
    render(<BooksGrid />);
    // Find an abbreviation (rendered as uppercase via CSS tracking-wider)
    const gen = screen.getByText("Gen");
    expect(gen.className).toContain("var(--text-secondary)");
  });

  it("book names use --text-primary for clear readability", () => {
    render(<BooksGrid />);
    const genesis = screen.getByText("Genesis");
    expect(genesis.className).toContain("var(--text-primary)");
  });

  it("subtitle uses --text-secondary for readable contrast", () => {
    render(<BooksGrid />);
    const subtitle = screen.getByText(
      /all 66 books of the king james bible/i
    );
    expect(subtitle.className).toContain("var(--text-secondary)");
  });

  // ── Heading uses text-gold class ──────────────────────────────────

  it("main heading uses the 'text-gold' class", () => {
    render(<BooksGrid />);
    const heading = screen.getByRole("heading", {
      name: /explore the scriptures/i,
    });
    expect(heading.className).toContain("text-gold");
  });

  // ── Testament filter ───────────────────────────────────────────────

  it("renders testament filter tabs", () => {
    render(<BooksGrid />);
    // There are two "All" tabs (testament + category), so use getAllByRole
    const allTabs = screen.getAllByRole("tab", { name: "All" });
    expect(allTabs.length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByRole("tab", { name: "Old Testament" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "New Testament" })
    ).toBeInTheDocument();
  });

  it("'All' testament tab is selected by default", () => {
    render(<BooksGrid />);
    // Both "All" tabs should be selected by default (testament + category)
    const allTabs = screen.getAllByRole("tab", { name: "All" });
    const selectedTabs = allTabs.filter(
      (tab) => tab.getAttribute("aria-selected") === "true"
    );
    expect(selectedTabs.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking 'Old Testament' filters to OT books only", async () => {
    const user = userEvent.setup();
    render(<BooksGrid />);

    await user.click(screen.getByRole("tab", { name: "Old Testament" }));

    // OT book should still be visible
    expect(screen.getByText("Genesis")).toBeInTheDocument();
    // NT book should not be visible
    expect(screen.queryByText("Matthew")).not.toBeInTheDocument();
  });

  it("clicking 'New Testament' filters to NT books only", async () => {
    const user = userEvent.setup();
    render(<BooksGrid />);

    await user.click(screen.getByRole("tab", { name: "New Testament" }));

    expect(screen.getByText("Matthew")).toBeInTheDocument();
    expect(screen.queryByText("Genesis")).not.toBeInTheDocument();
  });

  // ── Category filter ───────────────────────────────────────────────

  it("renders category filter tabs", () => {
    render(<BooksGrid />);
    expect(screen.getByRole("tab", { name: "Law" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Prophets" })).toBeInTheDocument();
  });

  it("category filter tabs use --text-muted when inactive", () => {
    render(<BooksGrid />);
    // "Law" should be inactive by default (All is active)
    const lawTab = screen.getByRole("tab", { name: "Law" });
    expect(lawTab.className).toContain("var(--text-muted)");
  });

  it("shows 'No books match' message when no results", async () => {
    const user = userEvent.setup();
    render(<BooksGrid />);

    // Select NT then Law (no NT law books exist)
    await user.click(screen.getByRole("tab", { name: "New Testament" }));
    await user.click(screen.getByRole("tab", { name: "Law" }));

    expect(
      screen.getByText(/no books match the current filter/i)
    ).toBeInTheDocument();
  });

  // ── Manuscript background image ──────────────────────────────────

  it("renders a background manuscript image from Wikimedia Commons", () => {
    const { container } = render(<BooksGrid />);
    // The decorative background image has empty alt text
    const bgImage = container.querySelector("img[alt='']");
    expect(bgImage).toBeInTheDocument();
    expect(bgImage).toHaveAttribute(
      "src",
      expect.stringContaining("upload.wikimedia.org")
    );
  });

  it("background manuscript image has empty alt (decorative)", () => {
    const { container } = render(<BooksGrid />);
    const bgImage = container.querySelector("img[alt='']");
    expect(bgImage).toBeInTheDocument();
    // Empty alt marks it as decorative for screen readers
    expect(bgImage).toHaveAttribute("alt", "");
  });

  it("background manuscript image is inside an aria-hidden container", () => {
    const { container } = render(<BooksGrid />);
    const ariaHiddenDiv = container.querySelector("div[aria-hidden='true']");
    expect(ariaHiddenDiv).toBeInTheDocument();
    const imgInside = ariaHiddenDiv?.querySelector("img");
    expect(imgInside).toBeInTheDocument();
  });

  it("background image uses Codex Vaticanus manuscript URL", () => {
    const { container } = render(<BooksGrid />);
    const bgImage = container.querySelector("img[alt='']");
    expect(bgImage).toHaveAttribute(
      "src",
      expect.stringContaining("Codex_Vaticanus")
    );
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("testament filter has role='tablist' with aria-label", () => {
    render(<BooksGrid />);
    const tablist = screen.getByRole("tablist", {
      name: /filter by testament/i,
    });
    expect(tablist).toBeInTheDocument();
  });

  it("category filter has role='tablist' with aria-label", () => {
    render(<BooksGrid />);
    const tablist = screen.getByRole("tablist", {
      name: /filter by category/i,
    });
    expect(tablist).toBeInTheDocument();
  });

  it("book cards have title attributes for full book names", () => {
    render(<BooksGrid />);
    const genesisCard = screen.getByTitle("Genesis");
    expect(genesisCard).toBeInTheDocument();
  });
});
