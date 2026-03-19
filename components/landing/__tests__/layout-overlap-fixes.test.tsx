import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "../HeroSection";
import { BooksGrid } from "../BooksGrid";
import { TimelinePreview } from "../TimelinePreview";
import { EvidenceSpotlight } from "../EvidenceSpotlight";

// Mock framer-motion to render plain elements without animations
vi.mock("framer-motion", () => ({
  motion: {
    p: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return <p {...(rest as React.HTMLAttributes<HTMLParagraphElement>)}>{children}</p>;
    },
    h1: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return <h1 {...(rest as React.HTMLAttributes<HTMLHeadingElement>)}>{children}</h1>;
    },
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initial, animate, transition, whileInView, viewport, layout, ...rest } =
        props as Record<string, unknown>;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
    blockquote: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return (
        <blockquote {...(rest as React.HTMLAttributes<HTMLQuoteElement>)}>
          {children}
        </blockquote>
      );
    },
    article: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, loading, sizes, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Layout Overlap Fixes", () => {
  // ── Hero Section: Header Height Compensation ──────────────────────

  describe("HeroSection accounts for sticky header height", () => {
    it("uses calc(100dvh - 4rem) to subtract header height from viewport height", () => {
      const { container } = render(
        <HeroSection
          verseText="In the beginning God created the heaven and the earth."
          verseRef="Genesis 1:1"
        />
      );
      const section = container.querySelector("section");
      expect(section?.className).toContain("h-[calc(100dvh-4rem)]");
    });

    it("does NOT use full viewport height (100dvh) which would overlap the header", () => {
      const { container } = render(
        <HeroSection
          verseText="In the beginning God created the heaven and the earth."
          verseRef="Genesis 1:1"
        />
      );
      const section = container.querySelector("section");
      const classes = section?.className || "";
      // Should not have bare h-[100dvh] (which causes overlap)
      // But should have the calc version
      expect(classes).not.toMatch(/\bh-\[100dvh\]/);
      expect(classes).toContain("calc(100dvh-4rem)");
    });

    it("has a min-height to prevent content collapse on small screens", () => {
      const { container } = render(
        <HeroSection
          verseText="Test verse"
          verseRef="Test 1:1"
        />
      );
      const section = container.querySelector("section");
      expect(section?.className).toMatch(/min-h-\[/);
    });
  });

  // ── BooksGrid: Balanced Column Count ──────────────────────────────

  describe("BooksGrid uses balanced grid columns", () => {
    it("uses xl:grid-cols-10 for balanced layout with 66 books", () => {
      const { container } = render(<BooksGrid />);
      // Find the grid container
      const gridDiv = container.querySelector("[class*='grid-cols']");
      expect(gridDiv?.className).toContain("xl:grid-cols-10");
    });

    it("does NOT use xl:grid-cols-11 which creates unbalanced last row", () => {
      const { container } = render(<BooksGrid />);
      const gridDiv = container.querySelector("[class*='grid-cols']");
      expect(gridDiv?.className).not.toContain("xl:grid-cols-11");
    });

    it("uses grid-cols-3 on mobile for clean layout", () => {
      const { container } = render(<BooksGrid />);
      const gridDiv = container.querySelector("[class*='grid-cols']");
      expect(gridDiv?.className).toContain("grid-cols-3");
    });

    it("has responsive breakpoints for all screen sizes", () => {
      const { container } = render(<BooksGrid />);
      const gridDiv = container.querySelector("[class*='grid-cols']");
      const classes = gridDiv?.className || "";
      // Should have mobile, sm, md, lg, and xl breakpoints
      expect(classes).toContain("grid-cols-3");
      expect(classes).toContain("sm:grid-cols-4");
      expect(classes).toContain("md:grid-cols-6");
      expect(classes).toContain("lg:grid-cols-8");
      expect(classes).toContain("xl:grid-cols-10");
    });
  });

  // ── TimelinePreview: Dot and Line Alignment ───────────────────────

  describe("TimelinePreview dot/line alignment", () => {
    it("uses relative flex layout for dot/line alignment instead of absolute positioning on the line", () => {
      const { container } = render(<TimelinePreview />);
      // The dot containers should use flex for alignment
      const dotContainers = container.querySelectorAll(".flex.items-center.justify-center");
      expect(dotContainers.length).toBeGreaterThan(0);
    });

    it("does NOT use absolute top-[38px] for the horizontal line (which misaligns on different font sizes)", () => {
      const { container } = render(<TimelinePreview />);
      const allElements = container.querySelectorAll("*");
      allElements.forEach((el) => {
        const classes = el.className || "";
        if (typeof classes === "string") {
          expect(classes).not.toContain("top-[38px]");
        }
      });
    });

    it("horizontal line segments span the full width of each timeline item", () => {
      const { container } = render(<TimelinePreview />);
      // Lines should use left-0 right-0 to span full width within each item
      const lineSegments = container.querySelectorAll(".left-0.right-0");
      expect(lineSegments.length).toBeGreaterThan(0);
    });

    it("timeline dots are positioned with relative z-index above the line", () => {
      const { container } = render(<TimelinePreview />);
      // Dots should have z-10 to sit above the line
      const dots = container.querySelectorAll(".z-10.rounded-full");
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  // ── EvidenceSpotlight: Overflow Prevention ────────────────────────

  describe("EvidenceSpotlight overflow handling", () => {
    it("uses overflow-x-clip on the section to prevent horizontal scrollbar", () => {
      render(<EvidenceSpotlight />);
      const section = screen.getByRole("region", { name: /evidence spotlight/i });
      expect(section.className).toContain("overflow-x-clip");
    });

    it("does NOT use overflow-hidden on the section (which clips vertical content)", () => {
      render(<EvidenceSpotlight />);
      const section = screen.getByRole("region", { name: /evidence spotlight/i });
      // overflow-x-clip is preferred over overflow-hidden
      expect(section.className).not.toMatch(/\boverflow-hidden\b/);
    });

    it("carousel container uses -mx-4 px-4 for edge-to-edge scrolling", () => {
      const { container } = render(<EvidenceSpotlight />);
      const scrollContainer = container.querySelector("[class*='-mx-4'][class*='px-4']");
      expect(scrollContainer).toBeInTheDocument();
    });

    it("carousel items have snap-start for smooth scrolling", () => {
      const { container } = render(<EvidenceSpotlight />);
      const snapItems = container.querySelectorAll(".snap-start");
      expect(snapItems.length).toBeGreaterThan(0);
    });
  });

  // ── TimelinePreview: Overflow Prevention ──────────────────────────

  describe("TimelinePreview overflow handling", () => {
    it("uses overflow-x-clip on the section to prevent horizontal scrollbar leaking", () => {
      render(<TimelinePreview />);
      const section = screen.getByRole("region", { name: /timeline preview/i });
      expect(section.className).toContain("overflow-x-clip");
    });
  });
});
