import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvidenceCard } from "../EvidenceCard";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="evidence-image" {...props} />
  ),
}));

// Mock CategoryBadge
vi.mock("@/components/evidence/CategoryBadge", () => ({
  CategoryBadge: ({ category, size }: { category: string; size: string }) => (
    <span data-testid="category-badge" data-category={category} data-size={size}>
      {category}
    </span>
  ),
}));

const baseProps = {
  title: "Dead Sea Scrolls",
  slug: "dead-sea-scrolls",
  description: "Ancient manuscripts discovered in caves near Qumran.",
  category: "manuscript",
  dateDiscovered: "1947",
  currentLocation: "Israel Museum, Jerusalem",
  significance: "Oldest known copies of biblical texts.",
  imageUrl: "/images/evidence/dead-sea-scrolls.jpg",
};

describe("EvidenceCard", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(screen.getByText("Dead Sea Scrolls")).toBeInTheDocument();
    });

    it("renders the significance as summary when provided", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(
        screen.getByText("Oldest known copies of biblical texts.")
      ).toBeInTheDocument();
    });

    it("falls back to description when significance is null", () => {
      render(<EvidenceCard {...baseProps} significance={null} />);
      expect(
        screen.getByText("Ancient manuscripts discovered in caves near Qumran.")
      ).toBeInTheDocument();
    });

    it("renders the date discovered with calendar icon", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(screen.getByText("1947")).toBeInTheDocument();
    });

    it("renders the current location with map pin icon", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(screen.getByText("Israel Museum, Jerusalem")).toBeInTheDocument();
    });

    it("renders the category badge", () => {
      render(<EvidenceCard {...baseProps} />);
      const badge = screen.getByTestId("category-badge");
      expect(badge).toHaveAttribute("data-category", "manuscript");
    });

    it("renders the image when imageUrl is provided", () => {
      render(<EvidenceCard {...baseProps} />);
      const img = screen.getByTestId("evidence-image");
      expect(img).toHaveAttribute("src", "/images/evidence/dead-sea-scrolls.jpg");
      expect(img).toHaveAttribute("alt", "Dead Sea Scrolls");
    });
  });

  describe("navigation", () => {
    it("links to the correct evidence detail page", () => {
      render(<EvidenceCard {...baseProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/evidence/dead-sea-scrolls");
    });

    it("has an accessible aria-label", () => {
      render(<EvidenceCard {...baseProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "aria-label",
        "View evidence: Dead Sea Scrolls"
      );
    });
  });

  describe("optional fields", () => {
    it("hides image section when imageUrl is null", () => {
      render(<EvidenceCard {...baseProps} imageUrl={null} />);
      expect(screen.queryByTestId("evidence-image")).not.toBeInTheDocument();
    });

    it("shows category badge in body when no image", () => {
      render(<EvidenceCard {...baseProps} imageUrl={null} />);
      // Badge should still render even without image
      expect(screen.getByTestId("category-badge")).toBeInTheDocument();
    });

    it("hides date when dateDiscovered is null", () => {
      render(<EvidenceCard {...baseProps} dateDiscovered={null} />);
      expect(screen.queryByText("1947")).not.toBeInTheDocument();
    });

    it("hides location when currentLocation is null", () => {
      render(<EvidenceCard {...baseProps} currentLocation={null} />);
      expect(
        screen.queryByText("Israel Museum, Jerusalem")
      ).not.toBeInTheDocument();
    });

    it("renders nothing for summary when both significance and description are empty", () => {
      render(
        <EvidenceCard
          {...baseProps}
          significance={null}
          description=""
        />
      );
      // Empty string is falsy, so the summary paragraph should not render
      const paragraphs = screen
        .getByRole("link")
        .querySelectorAll("p.text-xs");
      expect(paragraphs.length).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("truncates long location text", () => {
      render(
        <EvidenceCard
          {...baseProps}
          currentLocation="The Very Long Named Museum of Antiquities and Historical Artifacts"
        />
      );
      // truncate(text, 25) should cut to 25 chars + "..."
      expect(
        screen.getByText("The Very Long Named Museu...")
      ).toBeInTheDocument();
    });

    it("truncates long significance text", () => {
      const longText = "A".repeat(150);
      render(<EvidenceCard {...baseProps} significance={longText} />);
      // truncate(text, 120) should cut to 120 chars + "..."
      expect(
        screen.getByText("A".repeat(120) + "...")
      ).toBeInTheDocument();
    });

    it("handles special characters in title", () => {
      render(
        <EvidenceCard
          {...baseProps}
          title="Tel Dan Stele — 'House of David'"
        />
      );
      expect(
        screen.getByText("Tel Dan Stele — 'House of David'")
      ).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveAttribute(
        "aria-label",
        "View evidence: Tel Dan Stele — 'House of David'"
      );
    });
  });
});
