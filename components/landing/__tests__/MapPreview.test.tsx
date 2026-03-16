import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MapPreview } from "../MapPreview";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, ...rest } =
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
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const { fill, priority, sizes, ...rest } = props;
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

// Mock lucide-react MapPin
vi.mock("lucide-react", () => ({
  MapPin: ({
    className,
    "aria-hidden": ariaHidden,
  }: {
    className?: string;
    "aria-hidden"?: string;
  }) => (
    <svg className={className} aria-hidden={ariaHidden} data-testid="map-pin">
      <path d="M0 0" />
    </svg>
  ),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("MapPreview", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders without errors", () => {
    render(<MapPreview />);
    expect(
      screen.getByRole("region", { name: /map preview/i })
    ).toBeInTheDocument();
  });

  it("renders the section heading 'The Biblical World'", () => {
    render(<MapPreview />);
    expect(
      screen.getByRole("heading", { level: 2, name: /the biblical world/i })
    ).toBeInTheDocument();
  });

  it("renders the 'Interactive Maps' subtitle", () => {
    render(<MapPreview />);
    expect(screen.getByText("Interactive Maps")).toBeInTheDocument();
  });

  // ── Location pins ─────────────────────────────────────────────────

  it("renders all 8 key biblical location labels", () => {
    render(<MapPreview />);
    const locations = [
      "Jerusalem",
      "Bethlehem",
      "Nazareth",
      "Capernaum",
      "Mount Sinai",
      "Jericho",
      "Babylon",
      "Damascus",
    ];
    locations.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("renders MapPin icons for each location", () => {
    render(<MapPreview />);
    const pins = screen.getAllByTestId("map-pin");
    // Each location gets a pin icon, plus the CTA button has one = 9 total
    expect(pins.length).toBeGreaterThanOrEqual(8);
  });

  // ── CTA link ──────────────────────────────────────────────────────

  it("renders the 'Explore Biblical World' CTA linking to /maps", () => {
    render(<MapPreview />);
    const link = screen.getByRole("link", {
      name: /explore biblical world/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/maps");
  });

  // ── Stats bar ─────────────────────────────────────────────────────

  it("renders the stats bar with location, journey, and region counts", () => {
    render(<MapPreview />);
    expect(screen.getByText("100+")).toBeInTheDocument();
    expect(screen.getByText("Locations")).toBeInTheDocument();
    expect(screen.getByText("5+")).toBeInTheDocument();
    expect(screen.getByText("Journeys")).toBeInTheDocument();
    expect(screen.getByText("12+")).toBeInTheDocument();
    expect(screen.getByText("Regions")).toBeInTheDocument();
  });

  // ── Attribution ───────────────────────────────────────────────────

  it("shows the map attribution text", () => {
    render(<MapPreview />);
    expect(screen.getByText(/william smith/i)).toBeInTheDocument();
    expect(screen.getByText(/wikimedia commons/i)).toBeInTheDocument();
  });

  // ── Historical map image ──────────────────────────────────────────

  it("renders the historical map image with descriptive alt text", () => {
    render(<MapPreview />);
    const img = screen.getByAltText(/historical map of palestine/i);
    expect(img).toBeInTheDocument();
  });

  // ── Theme-aware overlay (no hardcoded dark colors) ────────────────

  it("uses CSS variables for map overlay gradient, not hardcoded hex", () => {
    const { container } = render(<MapPreview />);
    const overlays = container.querySelectorAll("[aria-hidden='true']");
    const gradientOverlay = Array.from(overlays).find((el) => {
      const style = (el as HTMLElement).style.background || "";
      return style.includes("linear-gradient") && style.includes("var(--map-bg");
    });

    expect(gradientOverlay).toBeDefined();
    const bgStyle = (gradientOverlay as HTMLElement).style.background;
    expect(bgStyle).toContain("var(--map-bg-from)");
    expect(bgStyle).toContain("var(--map-bg-via)");
    expect(bgStyle).toContain("var(--map-bg-to)");
  });

  it("uses CSS variable for map grid color, not hardcoded rgba", () => {
    const { container } = render(<MapPreview />);
    const overlays = container.querySelectorAll("[aria-hidden='true']");
    const gridOverlay = Array.from(overlays).find((el) => {
      const style = (el as HTMLElement).style.backgroundImage || "";
      return style.includes("1px");
    });

    expect(gridOverlay).toBeDefined();
    const bgImage = (gridOverlay as HTMLElement).style.backgroundImage;
    expect(bgImage).toContain("var(--map-grid-color)");
    // Should NOT contain hardcoded rgba gold
    expect(bgImage).not.toContain("rgba(196");
    expect(bgImage).not.toContain("rgba(212");
  });

  // ── No hardcoded dark colors anywhere ─────────────────────────────

  it("does not contain hardcoded dark gradient hex #1a1f2e in inline styles", () => {
    const { container } = render(<MapPreview />);
    const allElements = container.querySelectorAll("*");
    allElements.forEach((el) => {
      const style = (el as HTMLElement).getAttribute("style") || "";
      expect(style).not.toContain("#1a1f2e");
      expect(style).not.toContain("#1e2438");
      expect(style).not.toContain("#151927");
    });
  });

  it("does not contain hardcoded dark gradient hex in class names", () => {
    const { container } = render(<MapPreview />);
    const allElements = container.querySelectorAll("*");
    allElements.forEach((el) => {
      const cls = el.className || "";
      if (typeof cls === "string") {
        expect(cls).not.toContain("#1a1f2e");
        expect(cls).not.toContain("#1e2438");
        expect(cls).not.toContain("#151927");
      }
    });
  });

  // ── Theme-aware text colors ───────────────────────────────────────

  it("uses CSS variable for text-secondary on location labels", () => {
    render(<MapPreview />);
    const label = screen.getByText("Jerusalem");
    expect(label.className).toContain("var(--text-secondary)");
  });

  it("uses CSS variable for text-muted on stat labels", () => {
    render(<MapPreview />);
    const label = screen.getByText("Locations");
    expect(label.className).toContain("var(--text-muted)");
  });

  it("uses CSS variable for accent-gold on section subtitle", () => {
    render(<MapPreview />);
    const subtitle = screen.getByText("Interactive Maps");
    expect(subtitle.className).toContain("var(--accent-gold)");
  });

  // ── Theme-aware card & CTA ────────────────────────────────────────

  it("uses CSS variable for card background (--bg-card), not hardcoded", () => {
    const { container } = render(<MapPreview />);
    // The main card wrapper should use var(--bg-card) via Tailwind class
    const card = container.querySelector(".bg-\\[var\\(--bg-card\\)\\]");
    expect(card).toBeInTheDocument();
  });

  it("CTA button uses --primary-foreground for text, not hardcoded", () => {
    render(<MapPreview />);
    const link = screen.getByRole("link", {
      name: /explore biblical world/i,
    });
    expect(link.className).toContain("var(--primary-foreground)");
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("has aria-label on the section", () => {
    render(<MapPreview />);
    expect(
      screen.getByRole("region", { name: "Map Preview" })
    ).toBeInTheDocument();
  });

  it("marks decorative overlays as aria-hidden", () => {
    const { container } = render(<MapPreview />);
    const hiddenElements = container.querySelectorAll("[aria-hidden='true']");
    // Overlay + grid + pin icons = at least 2 decorative overlays
    expect(hiddenElements.length).toBeGreaterThanOrEqual(2);
  });

  // ── Pin positioning ───────────────────────────────────────────────

  it("positions location pins with percentage-based left/top styles", () => {
    const { container } = render(<MapPreview />);
    // Find elements with inline left/top positioning (the pin containers)
    const pins = container.querySelectorAll(".group");
    expect(pins.length).toBe(8);
    pins.forEach((pin) => {
      const style = (pin as HTMLElement).getAttribute("style") || "";
      expect(style).toMatch(/left:\s*[\d.]+%/);
      expect(style).toMatch(/top:\s*[\d.]+%/);
    });
  });

  it("clamps pin positions to stay within visible bounds (5-90% left, 5-85% top)", () => {
    const { container } = render(<MapPreview />);
    const pins = container.querySelectorAll(".group");
    pins.forEach((pin) => {
      const style = (pin as HTMLElement).getAttribute("style") || "";
      const leftMatch = style.match(/left:\s*([\d.]+)%/);
      const topMatch = style.match(/top:\s*([\d.]+)%/);
      if (leftMatch) {
        const left = parseFloat(leftMatch[1]);
        expect(left).toBeGreaterThanOrEqual(5);
        expect(left).toBeLessThanOrEqual(90);
      }
      if (topMatch) {
        const top = parseFloat(topMatch[1]);
        expect(top).toBeGreaterThanOrEqual(5);
        expect(top).toBeLessThanOrEqual(85);
      }
    });
  });
});
