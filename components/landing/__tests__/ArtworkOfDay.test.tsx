import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtworkOfDay, ArtworkData } from "../ArtworkOfDay";

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
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

const CUSTOM_ARTWORK: ArtworkData = {
  title: "The Last Supper",
  artist: "Leonardo da Vinci",
  yearCreated: "c. 1495-1498",
  imageUrl: "https://example.com/last-supper.jpg",
  description: "A famous depiction of the last meal Jesus shared with his apostles.",
  attribution: "Public Domain",
};

describe("ArtworkOfDay", () => {
  it("renders the section with correct aria-label", () => {
    render(<ArtworkOfDay />);
    expect(
      screen.getByRole("region", { name: "Artwork of the Day" })
    ).toBeInTheDocument();
  });

  it("displays the section heading", () => {
    render(<ArtworkOfDay />);
    expect(screen.getByText("Artwork of the Day")).toBeInTheDocument();
    expect(screen.getByText("Featured Masterpiece")).toBeInTheDocument();
  });

  it("renders fallback artwork when no prop is provided", () => {
    render(<ArtworkOfDay />);
    expect(screen.getByText("The Creation of Adam")).toBeInTheDocument();
    expect(screen.getByText(/Michelangelo/)).toBeInTheDocument();
    expect(screen.getByText(/c\. 1508-1512/)).toBeInTheDocument();
    expect(
      screen.getByText(/One of the most iconic images in art history/)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Wikimedia Commons, Public Domain")
    ).toBeInTheDocument();
  });

  it("renders custom artwork when provided as prop", () => {
    render(<ArtworkOfDay artwork={CUSTOM_ARTWORK} />);
    expect(screen.getByText("The Last Supper")).toBeInTheDocument();
    expect(screen.getByText(/Leonardo da Vinci/)).toBeInTheDocument();
    expect(screen.getByText(/c\. 1495-1498/)).toBeInTheDocument();
    expect(
      screen.getByText(/A famous depiction of the last meal/)
    ).toBeInTheDocument();
    expect(screen.getByText("Public Domain")).toBeInTheDocument();
  });

  it("renders the image with correct alt text", () => {
    render(<ArtworkOfDay artwork={CUSTOM_ARTWORK} />);
    const img = screen.getByAltText("The Last Supper by Leonardo da Vinci");
    expect(img).toBeInTheDocument();
  });

  it("renders the fallback image with correct alt text", () => {
    render(<ArtworkOfDay />);
    const img = screen.getByAltText("The Creation of Adam by Michelangelo");
    expect(img).toBeInTheDocument();
  });

  it("links to /gallery with correct text", () => {
    render(<ArtworkOfDay />);
    const galleryLink = screen.getByRole("link", {
      name: /Explore Gallery/,
    });
    expect(galleryLink).toBeInTheDocument();
    expect(galleryLink).toHaveAttribute("href", "/gallery");
  });

  it("gallery link points to an existing route", () => {
    render(<ArtworkOfDay />);
    const galleryLink = screen.getByRole("link", {
      name: /Explore Gallery/,
    });
    // /gallery page exists in app/gallery/page.tsx
    expect(galleryLink.getAttribute("href")).toBe("/gallery");
  });
});
