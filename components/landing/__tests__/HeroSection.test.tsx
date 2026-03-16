import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { HeroSection } from "../HeroSection";

// Mock framer-motion to render plain elements without animations
vi.mock("framer-motion", () => ({
  motion: {
    p: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return <p {...(rest as React.HTMLAttributes<HTMLParagraphElement>)}>{children}</p>;
    },
    h1: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return <h1 {...(rest as React.HTMLAttributes<HTMLHeadingElement>)}>{children}</h1>;
    },
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
    blockquote: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileInView, viewport, ...rest } =
        props as Record<string, unknown>;
      return (
        <blockquote {...(rest as React.HTMLAttributes<HTMLQuoteElement>)}>
          {children}
        </blockquote>
      );
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

const defaultProps = {
  verseText: "In the beginning God created the heaven and the earth.",
  verseRef: "Genesis 1:1",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("HeroSection", () => {
  // ── Rendering ──────────────────────────────────────────────────────

  it("renders without errors", () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByRole("region", { name: /hero/i })).toBeInTheDocument();
  });

  it("renders the main heading 'The Living Word'", () => {
    render(<HeroSection {...defaultProps} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /the living word/i })
    ).toBeInTheDocument();
  });

  it("renders the KJV subtitle", () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByText("King James Version")).toBeInTheDocument();
  });

  it("renders the descriptive tagline", () => {
    render(<HeroSection {...defaultProps} />);
    expect(
      screen.getByText(
        /illuminated with history, art, and archaeological evidence/i
      )
    ).toBeInTheDocument();
  });

  // ── Verse display ─────────────────────────────────────────────────

  it("displays the provided verse text", () => {
    render(<HeroSection {...defaultProps} />);
    expect(
      screen.getByText(
        /in the beginning god created the heaven and the earth/i
      )
    ).toBeInTheDocument();
  });

  it("displays the verse reference", () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByText("Genesis 1:1")).toBeInTheDocument();
  });

  it("renders the verse inside a blockquote", () => {
    render(<HeroSection {...defaultProps} />);
    const blockquote = screen.getByRole("blockquote");
    expect(blockquote).toBeInTheDocument();
    expect(
      within(blockquote).getByText(
        /in the beginning god created the heaven and the earth/i
      )
    ).toBeInTheDocument();
  });

  it("handles a long verse text without error", () => {
    const longVerse =
      "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. ".repeat(
        5
      );
    render(<HeroSection verseText={longVerse.trim()} verseRef="John 3:16" />);
    expect(screen.getByText(/for god so loved the world/i)).toBeInTheDocument();
  });

  it("handles empty verse text gracefully", () => {
    render(<HeroSection verseText="" verseRef="" />);
    // Should still render the section without crashing
    expect(screen.getByRole("region", { name: /hero/i })).toBeInTheDocument();
  });

  // ── CTA button ────────────────────────────────────────────────────

  it("renders the 'Begin Reading' CTA link pointing to /bible", () => {
    render(<HeroSection {...defaultProps} />);
    const link = screen.getByRole("link", {
      name: /begin reading the bible/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/bible");
  });

  // ── Theme-aware overlay (no hardcoded dark colors) ────────────────

  it("uses CSS variables for the hero overlay gradient, not hardcoded hex", () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    // Find the overlay div (aria-hidden with gradient style)
    const overlayDivs = container.querySelectorAll("[aria-hidden='true']");
    const gradientOverlay = Array.from(overlayDivs).find((el) => {
      const style = (el as HTMLElement).style.background || "";
      return style.includes("linear-gradient");
    });

    expect(gradientOverlay).toBeDefined();
    const bgStyle = (gradientOverlay as HTMLElement).style.background;
    // Must use CSS variables, NOT hardcoded hex colors like #0F0F1A
    expect(bgStyle).toContain("var(--hero-overlay-from)");
    expect(bgStyle).toContain("var(--hero-overlay-via)");
    expect(bgStyle).toContain("var(--hero-overlay-to)");
    expect(bgStyle).not.toContain("#0F0F1A");
  });

  // ── Theme-aware text colors ───────────────────────────────────────

  it("uses CSS variable for text-secondary (tagline), not hardcoded color", () => {
    render(<HeroSection {...defaultProps} />);
    const tagline = screen.getByText(
      /illuminated with history, art, and archaeological evidence/i
    );
    expect(tagline.className).toContain("var(--text-secondary)");
  });

  it("uses CSS variable for text-muted (verse reference)", () => {
    render(<HeroSection {...defaultProps} />);
    const verseRef = screen.getByText("Genesis 1:1");
    expect(verseRef.className).toContain("var(--text-muted)");
  });

  it("uses CSS variable for accent-gold (KJV subtitle)", () => {
    render(<HeroSection {...defaultProps} />);
    const subtitle = screen.getByText("King James Version");
    expect(subtitle.className).toContain("var(--accent-gold)");
  });

  // ── CTA button uses theme-aware colors ────────────────────────────

  it("CTA button uses --primary-foreground for text color, not hardcoded", () => {
    render(<HeroSection {...defaultProps} />);
    const link = screen.getByRole("link", {
      name: /begin reading the bible/i,
    });
    expect(link.className).toContain("var(--primary-foreground)");
  });

  it("CTA button uses --bg-primary for focus ring offset", () => {
    render(<HeroSection {...defaultProps} />);
    const link = screen.getByRole("link", {
      name: /begin reading the bible/i,
    });
    expect(link.className).toContain("var(--bg-primary)");
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it("has aria-label on the hero section", () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByRole("region", { name: "Hero" })).toBeInTheDocument();
  });

  it("marks the background image as aria-hidden", () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    const bgDiv = container.querySelector("[aria-hidden='true']");
    expect(bgDiv).toBeInTheDocument();
  });

  it("CTA link has an accessible aria-label", () => {
    render(<HeroSection {...defaultProps} />);
    const link = screen.getByLabelText(/begin reading the bible/i);
    expect(link).toBeInTheDocument();
  });

  // ── No hardcoded dark colors ──────────────────────────────────────

  it("does not contain hardcoded dark hex #0F0F1A in any inline styles", () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    const allElements = container.querySelectorAll("*");
    allElements.forEach((el) => {
      const style = (el as HTMLElement).getAttribute("style") || "";
      expect(style).not.toContain("#0F0F1A");
      expect(style).not.toContain("#0f0f1a");
    });
  });

  it("does not contain hardcoded dark hex in class names (from-[#0F0F1A])", () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    const allElements = container.querySelectorAll("*");
    allElements.forEach((el) => {
      const cls = el.className || "";
      if (typeof cls === "string") {
        expect(cls).not.toContain("#0F0F1A");
        expect(cls).not.toContain("#0f0f1a");
      }
    });
  });

  // ── Background image ─────────────────────────────────────────────

  it("has a background image referencing the Michelangelo painting", () => {
    const { container } = render(<HeroSection {...defaultProps} />);
    const bgDiv = container.querySelector("[aria-hidden='true']");
    const style = (bgDiv as HTMLElement)?.getAttribute("style") || "";
    expect(style).toContain("Michelangelo");
  });
});
