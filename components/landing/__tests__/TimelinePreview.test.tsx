import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelinePreview } from "../TimelinePreview";

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

describe("TimelinePreview", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders the section with correct aria-label", () => {
    render(<TimelinePreview />);
    expect(
      screen.getByRole("region", { name: /timeline preview/i })
    ).toBeInTheDocument();
  });

  it("renders the main heading 'Timeline'", () => {
    render(<TimelinePreview />);
    expect(
      screen.getByRole("heading", { name: /timeline/i })
    ).toBeInTheDocument();
  });

  it("renders the 'Biblical History' label", () => {
    render(<TimelinePreview />);
    expect(screen.getByText("Biblical History")).toBeInTheDocument();
  });

  // ── Timeline events ───────────────────────────────────────────────

  it("renders all 10 timeline events", () => {
    render(<TimelinePreview />);
    expect(screen.getByText("Call of Abraham")).toBeInTheDocument();
    expect(screen.getByText("The Exodus")).toBeInTheDocument();
    expect(screen.getByText("Birth of Jesus")).toBeInTheDocument();
    expect(screen.getByText("Book of Revelation")).toBeInTheDocument();
  });

  it("displays dates for events", () => {
    render(<TimelinePreview />);
    expect(screen.getByText("c. 2000 BC")).toBeInTheDocument();
    expect(screen.getByText("c. AD 95")).toBeInTheDocument();
  });

  it("displays era labels for events", () => {
    render(<TimelinePreview />);
    expect(screen.getByText("Patriarchs")).toBeInTheDocument();
    // "Early Church" appears twice (two events share this era)
    const earlyChurchLabels = screen.getAllByText("Early Church");
    expect(earlyChurchLabels.length).toBe(2);
  });

  it("displays event descriptions", () => {
    render(<TimelinePreview />);
    expect(
      screen.getByText(
        "God calls Abraham to leave Ur and travel to the Promised Land"
      )
    ).toBeInTheDocument();
  });

  // ── Text sizing for readability ────────────────────────────────────

  it("date text uses text-[11px] with font-medium for legibility", () => {
    render(<TimelinePreview />);
    const dateElement = screen.getByText("c. 2000 BC");
    expect(dateElement.className).toContain("text-[11px]");
    expect(dateElement.className).toContain("font-medium");
  });

  it("era labels use font-semibold for better readability at small sizes", () => {
    render(<TimelinePreview />);
    const eraElement = screen.getByText("Patriarchs");
    expect(eraElement.className).toContain("font-semibold");
  });

  it("date text uses --text-secondary (not --text-muted) for better contrast", () => {
    render(<TimelinePreview />);
    const dateElement = screen.getByText("c. 2000 BC");
    // Should use text-secondary for better readability, not muted
    expect(dateElement.className).toContain("var(--text-secondary)");
  });

  it("event titles use --text-primary for clear readability", () => {
    render(<TimelinePreview />);
    const title = screen.getByText("Call of Abraham");
    expect(title.className).toContain("var(--text-primary)");
  });

  it("description text uses --text-secondary for adequate contrast", () => {
    render(<TimelinePreview />);
    const desc = screen.getByText(
      "God calls Abraham to leave Ur and travel to the Promised Land"
    );
    expect(desc.className).toContain("var(--text-secondary)");
  });

  // ── era label uses accent-gold (not muted) ────────────────────────

  it("era labels use --accent-gold color for visibility", () => {
    render(<TimelinePreview />);
    const eraElement = screen.getByText("Patriarchs");
    expect(eraElement.className).toContain("var(--accent-gold)");
  });

  // ── Navigation ─────────────────────────────────────────────────────

  it("renders the 'Explore Full Timeline' link", () => {
    render(<TimelinePreview />);
    const link = screen.getByText(/explore full timeline/i);
    expect(link.closest("a")).toHaveAttribute("href", "/timeline");
  });

  // ── Scroll controls ───────────────────────────────────────────────

  it("renders scroll left and right buttons with aria-labels", () => {
    render(<TimelinePreview />);
    expect(
      screen.getByLabelText("Scroll timeline left")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Scroll timeline right")
    ).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("timeline dot decorations are marked aria-hidden", () => {
    const { container } = render(<TimelinePreview />);
    const hiddenElements = container.querySelectorAll("[aria-hidden='true']");
    expect(hiddenElements.length).toBeGreaterThan(0);
  });
});
