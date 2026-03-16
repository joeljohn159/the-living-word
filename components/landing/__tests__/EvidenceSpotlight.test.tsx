import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EvidenceSpotlight, type EvidenceItem } from "../EvidenceSpotlight";

// Mock framer-motion to render plain elements
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
    article: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, layout, ...rest } =
        props as Record<string, unknown>;
      return <article {...(rest as React.HTMLAttributes<HTMLElement>)}>{children}</article>;
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

const MOCK_ITEMS: EvidenceItem[] = [
  {
    title: "Dead Sea Scrolls",
    category: "manuscript",
    locationFound: "Qumran, West Bank",
    significance: "The oldest known copies of Hebrew Bible texts.",
    imageUrl: "https://example.com/dss.jpg",
    slug: "dead-sea-scrolls",
  },
  {
    title: "Tel Dan Stele",
    category: "inscription",
    locationFound: "Tel Dan, Israel",
    significance: "Earliest known reference to the House of David.",
    imageUrl: "https://example.com/teldan.jpg",
    slug: "tel-dan-stele",
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("EvidenceSpotlight", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders the section with correct aria-label", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    expect(
      screen.getByRole("region", { name: /evidence spotlight/i })
    ).toBeInTheDocument();
  });

  it("renders the section heading", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    expect(
      screen.getByRole("heading", { name: /evidence spotlight/i })
    ).toBeInTheDocument();
  });

  it("renders evidence cards for each item", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    expect(screen.getByText("Dead Sea Scrolls")).toBeInTheDocument();
    expect(screen.getByText("Tel Dan Stele")).toBeInTheDocument();
  });

  it("renders fallback evidence when no items are provided", () => {
    render(<EvidenceSpotlight />);
    // Fallback contains "Dead Sea Scrolls", "Tel Dan Stele", "Pilate Stone"
    expect(screen.getByText("Dead Sea Scrolls")).toBeInTheDocument();
    expect(screen.getByText("Pilate Stone")).toBeInTheDocument();
  });

  it("renders fallback evidence when empty array is provided", () => {
    render(<EvidenceSpotlight items={[]} />);
    expect(screen.getByText("Dead Sea Scrolls")).toBeInTheDocument();
  });

  // ── Badge contrast fix ─────────────────────────────────────────────

  it("category badges use theme-aware colors with sufficient contrast", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    const badges = screen.getAllByText(/manuscript|inscription/i);
    badges.forEach((badge) => {
      const classes = badge.className;
      // Badge should use accent-gold bg with white text (not bg-primary with gold text)
      // Check it does NOT use the old illegible pattern: bg-[var(--bg-primary)]/80 with gold text
      expect(classes).not.toContain("bg-[var(--bg-primary)]");
    });
  });

  it("category badges render with white text for readability", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    const badge = screen.getByText("manuscript");
    // Should have white text class for contrast against gold background
    expect(badge.className).toContain("text-white");
  });

  // ── Card content ───────────────────────────────────────────────────

  it("displays location information for each item", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    expect(screen.getByText("Qumran, West Bank")).toBeInTheDocument();
    expect(screen.getByText("Tel Dan, Israel")).toBeInTheDocument();
  });

  it("displays significance text for each item", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    expect(
      screen.getByText(/oldest known copies of Hebrew Bible texts/i)
    ).toBeInTheDocument();
  });

  it("renders 'Learn more' links with correct hrefs", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    const links = screen.getAllByText(/learn more/i);
    expect(links).toHaveLength(2);
    expect(links[0].closest("a")).toHaveAttribute(
      "href",
      "/evidence/dead-sea-scrolls"
    );
    expect(links[1].closest("a")).toHaveAttribute(
      "href",
      "/evidence/tel-dan-stele"
    );
  });

  // ── Text uses CSS variables (theme-aware) ──────────────────────────

  it("card titles use --text-primary CSS variable", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    const title = screen.getByText("Dead Sea Scrolls");
    expect(title.className).toContain("var(--text-primary)");
  });

  it("significance text uses --text-secondary CSS variable", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    const desc = screen.getByText(
      /oldest known copies of Hebrew Bible texts/i
    );
    expect(desc.className).toContain("var(--text-secondary)");
  });

  // ── Accessibility ──────────────────────────────────────────────────

  it("carousel has role='list' with listitem articles", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("scroll buttons have aria-labels", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    expect(screen.getByLabelText("Scroll left")).toBeInTheDocument();
    expect(screen.getByLabelText("Scroll right")).toBeInTheDocument();
  });

  it("images have alt text matching item titles", () => {
    render(<EvidenceSpotlight items={MOCK_ITEMS} />);
    expect(screen.getByAltText("Dead Sea Scrolls")).toBeInTheDocument();
    expect(screen.getByAltText("Tel Dan Stele")).toBeInTheDocument();
  });
});
