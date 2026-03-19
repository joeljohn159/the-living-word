import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvidenceCard } from "./EvidenceCard";

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
    const { fill, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img alt="" data-fill={fill ? "true" : undefined} {...rest} />;
  },
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  MapPin: (props: Record<string, unknown>) => (
    <svg data-testid="map-pin-icon" {...props} />
  ),
  Calendar: (props: Record<string, unknown>) => (
    <svg data-testid="calendar-icon" {...props} />
  ),
  Star: ({ className, ...props }: Record<string, unknown>) => (
    <svg data-testid="star-icon" className={className as string} {...props} />
  ),
  BookOpen: (props: Record<string, unknown>) => (
    <svg data-testid="book-open-icon" {...props} />
  ),
  Pickaxe: (props: Record<string, unknown>) => (
    <svg data-testid="pickaxe-icon" {...props} />
  ),
  FileText: (props: Record<string, unknown>) => (
    <svg data-testid="file-text-icon" {...props} />
  ),
  Gem: (props: Record<string, unknown>) => (
    <svg data-testid="gem-icon" {...props} />
  ),
}));

const baseProps = {
  title: "Dead Sea Scrolls",
  slug: "dead-sea-scrolls",
  description:
    "A collection of nearly 1,000 manuscripts discovered in caves near the Dead Sea.",
  category: "manuscript",
  dateDiscovered: "1946–1956",
  locationFound: "Qumran, West Bank",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/2/21/Dead_Sea_Scroll.jpg",
  sourceUrl:
    "https://commons.wikimedia.org/wiki/File:Dead_Sea_Scroll.jpg",
  significance:
    "Confirmed the remarkable textual accuracy of the Hebrew Bible. Contains the oldest known copies.",
};

describe("EvidenceCard", () => {
  describe("rendering with image", () => {
    it("renders the title", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(screen.getByText("Dead Sea Scrolls")).toBeInTheDocument();
    });

    it("links to the correct evidence detail page", () => {
      render(<EvidenceCard {...baseProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/evidence/dead-sea-scrolls");
    });

    it("has an accessible aria-label", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(
        screen.getByLabelText("View details about Dead Sea Scrolls")
      ).toBeInTheDocument();
    });

    it("displays the image with correct alt text", () => {
      render(<EvidenceCard {...baseProps} />);
      const img = screen.getByAltText("Dead Sea Scrolls");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", baseProps.imageUrl);
    });

    it("renders the image with fill layout", () => {
      render(<EvidenceCard {...baseProps} />);
      const img = screen.getByAltText("Dead Sea Scrolls");
      expect(img).toHaveAttribute("data-fill", "true");
    });

    it("shows the date discovered", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(screen.getByText("1946–1956")).toBeInTheDocument();
    });

    it("shows the location found", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(screen.getByText("Qumran, West Bank")).toBeInTheDocument();
    });

    it("renders the category badge", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(screen.getByText("Manuscript")).toBeInTheDocument();
    });
  });

  describe("Wikimedia attribution", () => {
    it("shows attribution when both imageUrl and sourceUrl are present", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(screen.getByText("Wikimedia Commons")).toBeInTheDocument();
    });

    it("has proper aria-label on attribution", () => {
      render(<EvidenceCard {...baseProps} />);
      expect(
        screen.getByLabelText("Wikimedia Commons source")
      ).toBeInTheDocument();
    });

    it("does not show attribution when sourceUrl is missing", () => {
      render(<EvidenceCard {...baseProps} sourceUrl={undefined} />);
      expect(screen.queryByText("Wikimedia Commons")).not.toBeInTheDocument();
    });

    it("does not show attribution when imageUrl is null", () => {
      render(<EvidenceCard {...baseProps} imageUrl={null} />);
      expect(screen.queryByText("Wikimedia Commons")).not.toBeInTheDocument();
    });
  });

  describe("significance rating", () => {
    it("renders 5 star icons for rating display", () => {
      render(<EvidenceCard {...baseProps} />);
      const stars = screen.getAllByTestId("star-icon");
      expect(stars).toHaveLength(5);
    });

    it("shows accessible significance label", () => {
      render(<EvidenceCard {...baseProps} />);
      // significance contains "oldest" (+1) -> score 4
      expect(
        screen.getByLabelText(/Significance: \d out of 5/)
      ).toBeInTheDocument();
    });

    it("does not show stars when significance is null", () => {
      render(<EvidenceCard {...baseProps} significance={null} />);
      expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
    });

    it("gives higher rating for text with 'earliest' keyword", () => {
      render(
        <EvidenceCard
          {...baseProps}
          significance="The earliest known manuscript directly confirms biblical accounts and is historically significant."
        />
      );
      // "earliest" +1, "directly confirms" +1 -> 3+1+1 = 5
      expect(
        screen.getByLabelText("Significance: 5 out of 5")
      ).toBeInTheDocument();
    });

    it("gives lower rating for short significance text", () => {
      render(
        <EvidenceCard
          {...baseProps}
          significance="Notable find."
        />
      );
      // short (<80 chars) -1 -> 3-1 = 2
      expect(
        screen.getByLabelText("Significance: 2 out of 5")
      ).toBeInTheDocument();
    });

    it("clamps rating to minimum of 1", () => {
      render(
        <EvidenceCard
          {...baseProps}
          significance="Short."
        />
      );
      // short -1 -> 3-1 = 2, still >= 1
      expect(
        screen.getByLabelText("Significance: 2 out of 5")
      ).toBeInTheDocument();
    });
  });

  describe("fallback state (no image)", () => {
    const noImageProps = {
      ...baseProps,
      imageUrl: null,
      sourceUrl: null,
    };

    it("does not render an img element", () => {
      render(<EvidenceCard {...noImageProps} />);
      expect(screen.queryByAltText(baseProps.title)).not.toBeInTheDocument();
    });

    it("still shows the category badge in the text section", () => {
      render(<EvidenceCard {...noImageProps} />);
      expect(screen.getByText("Manuscript")).toBeInTheDocument();
    });

    it("still shows the title and description", () => {
      render(<EvidenceCard {...noImageProps} />);
      expect(screen.getByText("Dead Sea Scrolls")).toBeInTheDocument();
    });
  });

  describe("description truncation", () => {
    it("truncates descriptions longer than 150 characters", () => {
      const longDescription = "A".repeat(200);
      render(
        <EvidenceCard {...baseProps} description={longDescription} />
      );
      const truncated = screen.getByText(/^A+\.\.\.$/);
      expect(truncated).toBeInTheDocument();
    });

    it("does not truncate short descriptions", () => {
      const shortDesc = "A short description.";
      render(
        <EvidenceCard {...baseProps} description={shortDesc} />
      );
      expect(screen.getByText(shortDesc)).toBeInTheDocument();
    });
  });

  describe("location truncation", () => {
    it("truncates long location names", () => {
      render(
        <EvidenceCard
          {...baseProps}
          locationFound="A Very Long Location Name That Exceeds Thirty Characters"
        />
      );
      expect(screen.getByText(/\.\.\.$/).textContent).toBeTruthy();
    });
  });

  describe("edge cases", () => {
    it("renders without dateDiscovered", () => {
      render(<EvidenceCard {...baseProps} dateDiscovered={null} />);
      expect(screen.queryByTestId("calendar-icon")).not.toBeInTheDocument();
    });

    it("renders without locationFound", () => {
      render(<EvidenceCard {...baseProps} locationFound={null} />);
      expect(screen.queryByTestId("map-pin-icon")).not.toBeInTheDocument();
    });

    it("renders with all optional fields null", () => {
      render(
        <EvidenceCard
          title="Test"
          slug="test"
          description="A test item."
          category="artifact"
          dateDiscovered={null}
          locationFound={null}
          imageUrl={null}
          significance={null}
        />
      );
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("handles unknown category gracefully", () => {
      render(<EvidenceCard {...baseProps} category="unknown-type" />);
      // Should fall back to artifact config
      expect(screen.getByText("Artifact")).toBeInTheDocument();
    });
  });
});
