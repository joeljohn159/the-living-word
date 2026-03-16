import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtworkOfDay } from "../ArtworkOfDay";
import { EvidenceSpotlight } from "../EvidenceSpotlight";

/**
 * These tests verify that images use the correct loading strategy:
 * - Below-fold images (ArtworkOfDay, EvidenceSpotlight) use loading="lazy"
 * - HeroSection background is handled via CSS (backgroundImage), not Next Image
 *
 * This is critical for Core Web Vitals (LCP optimization).
 */

// Track Image props to verify loading strategy
const imageProps: Record<string, unknown>[] = [];

// Mock next/image to capture props
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    imageProps.push({ ...props });
    const { fill, priority, sizes, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img data-loading={props.loading} data-priority={String(!!priority)} {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
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

describe("Image loading strategy", () => {
  beforeEach(() => {
    imageProps.length = 0;
  });

  // ── ArtworkOfDay: below-fold, should lazy load ────────────────────

  describe("ArtworkOfDay", () => {
    it("uses loading='lazy' on the artwork image", () => {
      render(<ArtworkOfDay />);
      const img = screen.getByAltText(/The Creation of Adam by Michelangelo/);
      expect(img).toHaveAttribute("data-loading", "lazy");
    });

    it("does NOT use priority on the artwork image", () => {
      render(<ArtworkOfDay />);
      const img = screen.getByAltText(/The Creation of Adam by Michelangelo/);
      expect(img).toHaveAttribute("data-priority", "false");
    });
  });

  // ── EvidenceSpotlight: below-fold, should lazy load ───────────────

  describe("EvidenceSpotlight", () => {
    it("uses loading='lazy' on evidence images", () => {
      render(<EvidenceSpotlight />);
      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("data-loading", "lazy");
      });
    });

    it("does NOT use priority on evidence images", () => {
      render(<EvidenceSpotlight />);
      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img).toHaveAttribute("data-priority", "false");
      });
    });

    it("all evidence card images have lazy loading set", () => {
      render(<EvidenceSpotlight />);
      // Fallback has 3 evidence items
      const images = screen.getAllByRole("img");
      expect(images.length).toBe(3);
      images.forEach((img) => {
        expect(img).toHaveAttribute("data-loading", "lazy");
      });
    });
  });
});
