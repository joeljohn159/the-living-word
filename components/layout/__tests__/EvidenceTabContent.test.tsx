import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvidenceTabContent } from "../EvidenceTabContent";
import type { EvidenceItem } from "@/hooks/use-chapter-evidence";

// Mock the hook
const mockUseChapterEvidence = vi.fn();
vi.mock("@/hooks/use-chapter-evidence", () => ({
  useChapterEvidence: () => mockUseChapterEvidence(),
}));

// Mock EvidenceCard to simplify assertions
vi.mock("@/components/media/EvidenceCard", () => ({
  EvidenceCard: ({
    title,
    slug,
    category,
  }: {
    title: string;
    slug: string;
    category: string;
  }) => (
    <div data-testid={`evidence-card-${slug}`} data-category={category}>
      {title}
    </div>
  ),
}));

function makeEvidence(overrides: Partial<EvidenceItem> & { id: number; title: string; slug: string }): EvidenceItem {
  return {
    description: "A test description",
    category: "archaeology",
    dateDiscovered: "1947",
    locationFound: null,
    currentLocation: "Museum",
    significance: "Very significant",
    imageUrl: null,
    sourceUrl: null,
    ...overrides,
  };
}

describe("EvidenceTabContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("shows a loading spinner with descriptive text", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: [],
        loading: true,
        error: null,
      });

      render(<EvidenceTabContent />);
      expect(screen.getByText("Loading evidence...")).toBeInTheDocument();
    });

    it("does not render any evidence cards while loading", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: [],
        loading: true,
        error: null,
      });

      render(<EvidenceTabContent />);
      expect(screen.queryByTestId(/evidence-card/)).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("displays an error alert with the error message", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: [],
        loading: false,
        error: "Network timeout",
      });

      render(<EvidenceTabContent />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Unable to load evidence.")).toBeInTheDocument();
      expect(screen.getByText("Network timeout")).toBeInTheDocument();
    });

    it("does not render evidence cards on error", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: [],
        loading: false,
        error: "Server error",
      });

      render(<EvidenceTabContent />);
      expect(screen.queryByTestId(/evidence-card/)).not.toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows the empty state heading and description", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: [],
        loading: false,
        error: null,
      });

      render(<EvidenceTabContent />);
      expect(screen.getByText("No Evidence Found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "No archaeological or historical evidence is linked to this chapter yet."
        )
      ).toBeInTheDocument();
    });
  });

  describe("happy path — evidence list", () => {
    const sampleEvidence: EvidenceItem[] = [
      makeEvidence({ id: 1, title: "Dead Sea Scrolls", slug: "dead-sea-scrolls", category: "manuscript" }),
      makeEvidence({ id: 2, title: "Tel Dan Stele", slug: "tel-dan-stele", category: "inscription" }),
      makeEvidence({ id: 3, title: "Cyrus Cylinder", slug: "cyrus-cylinder", category: "artifact" }),
    ];

    it("renders all evidence cards", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: sampleEvidence,
        loading: false,
        error: null,
      });

      render(<EvidenceTabContent />);
      expect(screen.getByText("Dead Sea Scrolls")).toBeInTheDocument();
      expect(screen.getByText("Tel Dan Stele")).toBeInTheDocument();
      expect(screen.getByText("Cyrus Cylinder")).toBeInTheDocument();
    });

    it("renders evidence items in a list with proper ARIA roles", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: sampleEvidence,
        loading: false,
        error: null,
      });

      render(<EvidenceTabContent />);
      expect(
        screen.getByRole("list", { name: "Evidence items" })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("passes correct props to each EvidenceCard", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: sampleEvidence,
        loading: false,
        error: null,
      });

      render(<EvidenceTabContent />);
      const scrollCard = screen.getByTestId("evidence-card-dead-sea-scrolls");
      expect(scrollCard).toHaveAttribute("data-category", "manuscript");

      const steleCard = screen.getByTestId("evidence-card-tel-dan-stele");
      expect(steleCard).toHaveAttribute("data-category", "inscription");
    });
  });

  describe("single evidence item", () => {
    it("renders correctly with just one item", () => {
      mockUseChapterEvidence.mockReturnValue({
        evidence: [
          makeEvidence({ id: 1, title: "Rosetta Stone", slug: "rosetta-stone" }),
        ],
        loading: false,
        error: null,
      });

      render(<EvidenceTabContent />);
      expect(screen.getByText("Rosetta Stone")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(1);
    });
  });
});
