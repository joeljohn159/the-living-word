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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // ── Wikipedia images on timeline cards ────────────────────────────

  it("renders thumbnail images for events that have imageUrl", () => {
    render(<TimelinePreview />);
    // Events with images: Abraham, Exodus, David, Solomon's Temple, Birth of Jesus, Crucifixion
    const abrahamImg = screen.getByAltText(/abraham/i);
    const exodusImg = screen.getByAltText(/red sea/i);
    const davidImg = screen.getByAltText(/king david/i);
    const templeImg = screen.getByAltText(/solomon.*temple/i);
    const nativityImg = screen.getByAltText(/nativity/i);
    const crucifixionImg = screen.getByAltText(/crucifixion/i);

    expect(abrahamImg).toBeInTheDocument();
    expect(exodusImg).toBeInTheDocument();
    expect(davidImg).toBeInTheDocument();
    expect(templeImg).toBeInTheDocument();
    expect(nativityImg).toBeInTheDocument();
    expect(crucifixionImg).toBeInTheDocument();
  });

  it("all timeline images load from Wikimedia Commons", () => {
    render(<TimelinePreview />);
    const images = [
      screen.getByAltText(/abraham/i),
      screen.getByAltText(/red sea/i),
      screen.getByAltText(/king david/i),
      screen.getByAltText(/solomon.*temple/i),
      screen.getByAltText(/nativity/i),
      screen.getByAltText(/crucifixion/i),
    ];
    images.forEach((img) => {
      expect(img).toHaveAttribute(
        "src",
        expect.stringContaining("upload.wikimedia.org")
      );
    });
  });

  it("events without imageUrl do not render an img element", () => {
    const { container } = render(<TimelinePreview />);
    // There are 10 events total but only 6 have images
    const allImages = container.querySelectorAll("img");
    expect(allImages.length).toBe(6);
  });

  it("timeline image alt text includes artwork attribution details", () => {
    render(<TimelinePreview />);
    // Both Giotto paintings should include artist attribution in alt text
    const giottoImages = screen.getAllByAltText(/giotto/i);
    expect(giottoImages.length).toBe(2);
    // Abraham image should reference the manuscript source
    const abrahamImg = screen.getByAltText(/hortus deliciarum/i);
    expect(abrahamImg).toBeInTheDocument();
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("timeline dot decorations are marked aria-hidden", () => {
    const { container } = render(<TimelinePreview />);
    const hiddenElements = container.querySelectorAll("[aria-hidden='true']");
    expect(hiddenElements.length).toBeGreaterThan(0);
  });

  it("image overlay gradients on timeline cards are aria-hidden", () => {
    const { container } = render(<TimelinePreview />);
    const hiddenDivs = container.querySelectorAll("div[aria-hidden='true']");
    // Each event with an image has an overlay gradient + dot decorations
    expect(hiddenDivs.length).toBeGreaterThanOrEqual(6);
  });
});
