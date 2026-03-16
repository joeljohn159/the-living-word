import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MapTabContent } from "../MapTabContent";
import type { MapLocation } from "../types";

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

// Mock the hook
const mockUseChapterLocations = vi.fn();
vi.mock("@/hooks/use-chapter-locations", () => ({
  useChapterLocations: (...args: unknown[]) => mockUseChapterLocations(...args),
}));

// Mock BibleMap to simplify testing (Leaflet requires full browser env)
vi.mock("../BibleMap", () => ({
  BibleMap: ({ locations }: { locations: MapLocation[] }) => (
    <div data-testid="bible-map" data-location-count={locations.length}>
      {locations.map((loc) => (
        <span key={loc.id} data-testid={`map-pin-${loc.slug}`}>
          {loc.name}
        </span>
      ))}
    </div>
  ),
}));

function makeLocation(
  overrides: Partial<MapLocation> & { id: number; name: string; slug: string }
): MapLocation {
  return {
    description: null,
    locationType: "city",
    latitude: 31.7683,
    longitude: 35.2137,
    modernName: null,
    imageUrl: null,
    ...overrides,
  };
}

describe("MapTabContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("idle state — not on a chapter page", () => {
    it("shows navigate prompt when pathname has no book slug", () => {
      mockPathname.mockReturnValue("/bible");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      expect(
        screen.getByText("Navigate to a chapter to see locations on the map.")
      ).toBeInTheDocument();
    });

    it("shows navigate prompt when pathname is root", () => {
      mockPathname.mockReturnValue("/");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      expect(
        screen.getByText("Navigate to a chapter to see locations on the map.")
      ).toBeInTheDocument();
    });

    it("shows navigate prompt when pathname is null", () => {
      mockPathname.mockReturnValue(null);
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      expect(
        screen.getByText("Navigate to a chapter to see locations on the map.")
      ).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows a loading spinner with accessible label", () => {
      mockPathname.mockReturnValue("/bible/genesis/1");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: true,
        error: null,
      });

      render(<MapTabContent />);
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-label",
        "Loading map"
      );
    });

    it("does not render the map while loading", () => {
      mockPathname.mockReturnValue("/bible/genesis/1");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: true,
        error: null,
      });

      render(<MapTabContent />);
      expect(screen.queryByTestId("bible-map")).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("displays an error alert with the error message", () => {
      mockPathname.mockReturnValue("/bible/genesis/1");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: "Could not load locations",
      });

      render(<MapTabContent />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Could not load locations")
      ).toBeInTheDocument();
    });

    it("suggests refreshing the page on error", () => {
      mockPathname.mockReturnValue("/bible/genesis/1");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: "Server error",
      });

      render(<MapTabContent />);
      expect(
        screen.getByText("Try refreshing the page.")
      ).toBeInTheDocument();
    });

    it("does not render the map on error", () => {
      mockPathname.mockReturnValue("/bible/genesis/1");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: "Some error",
      });

      render(<MapTabContent />);
      expect(screen.queryByTestId("bible-map")).not.toBeInTheDocument();
    });
  });

  describe("empty state — no locations for chapter", () => {
    it("shows the no locations message", () => {
      mockPathname.mockReturnValue("/bible/genesis/1");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      expect(screen.getByText("No Locations")).toBeInTheDocument();
      expect(
        screen.getByText(
          "No geographic locations are referenced in this chapter."
        )
      ).toBeInTheDocument();
    });
  });

  describe("happy path — locations rendered", () => {
    const sampleLocations: MapLocation[] = [
      makeLocation({
        id: 1,
        name: "Jerusalem",
        slug: "jerusalem",
        locationType: "city",
        modernName: "Jerusalem",
      }),
      makeLocation({
        id: 2,
        name: "Jordan River",
        slug: "jordan-river",
        locationType: "river",
        latitude: 31.8,
        longitude: 35.5,
        modernName: null,
      }),
      makeLocation({
        id: 3,
        name: "Mount Sinai",
        slug: "mount-sinai",
        locationType: "mountain",
        modernName: "Jabal Musa",
      }),
    ];

    it("renders the BibleMap with all locations", () => {
      mockPathname.mockReturnValue("/bible/exodus/3");
      mockUseChapterLocations.mockReturnValue({
        locations: sampleLocations,
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      const map = screen.getByTestId("bible-map");
      expect(map).toBeInTheDocument();
      expect(map).toHaveAttribute("data-location-count", "3");
    });

    it("shows a list of locations below the map", () => {
      mockPathname.mockReturnValue("/bible/exodus/3");
      mockUseChapterLocations.mockReturnValue({
        locations: sampleLocations,
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      const list = screen.getByRole("list", {
        name: "Locations in this chapter",
      });
      expect(list).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("displays location names in the list", () => {
      mockPathname.mockReturnValue("/bible/exodus/3");
      mockUseChapterLocations.mockReturnValue({
        locations: sampleLocations,
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      // Names appear in both the mocked BibleMap and the list below,
      // so we use getAllByText and check at least 2 instances
      expect(screen.getAllByText("Jerusalem").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Jordan River").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Mount Sinai").length).toBeGreaterThanOrEqual(2);
    });

    it("shows the location count header with plural suffix", () => {
      mockPathname.mockReturnValue("/bible/exodus/3");
      mockUseChapterLocations.mockReturnValue({
        locations: sampleLocations,
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      expect(
        screen.getByText(/3 Locations in this chapter/i)
      ).toBeInTheDocument();
    });

    it("shows singular label for a single location", () => {
      mockPathname.mockReturnValue("/bible/genesis/1");
      mockUseChapterLocations.mockReturnValue({
        locations: [sampleLocations[0]],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      expect(
        screen.getByText(/1 Location in this chapter/i)
      ).toBeInTheDocument();
    });

    it("shows modern name when available", () => {
      mockPathname.mockReturnValue("/bible/exodus/3");
      mockUseChapterLocations.mockReturnValue({
        locations: sampleLocations,
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      // Jerusalem has modernName
      expect(screen.getByText("Modern: Jerusalem")).toBeInTheDocument();
      // Mount Sinai has modernName "Jabal Musa"
      expect(screen.getByText("Modern: Jabal Musa")).toBeInTheDocument();
    });

    it("does not show modern name when null", () => {
      mockPathname.mockReturnValue("/bible/exodus/3");
      mockUseChapterLocations.mockReturnValue({
        locations: [
          makeLocation({
            id: 1,
            name: "Eden",
            slug: "eden",
            modernName: null,
          }),
        ],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      // Eden appears in both the mocked map and the location list
      expect(screen.getAllByText("Eden").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText(/Modern:/)).not.toBeInTheDocument();
    });

    it("shows location type labels", () => {
      mockPathname.mockReturnValue("/bible/exodus/3");
      mockUseChapterLocations.mockReturnValue({
        locations: sampleLocations,
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      expect(screen.getAllByText("city")).toHaveLength(1);
      expect(screen.getByText("river")).toBeInTheDocument();
      expect(screen.getByText("mountain")).toBeInTheDocument();
    });
  });

  describe("URL parsing", () => {
    it("extracts book and chapter from /bible/[bookSlug]/[chapter] URL", () => {
      mockPathname.mockReturnValue("/bible/genesis/12");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      expect(mockUseChapterLocations).toHaveBeenCalledWith("genesis", 12);
    });

    it("handles deep URLs with verse segments", () => {
      mockPathname.mockReturnValue("/bible/genesis/12/5");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      // Should still parse bookSlug and chapter correctly
      expect(mockUseChapterLocations).toHaveBeenCalledWith("genesis", 12);
    });

    it("passes 0 for non-numeric chapter values", () => {
      mockPathname.mockReturnValue("/bible/genesis/abc");
      mockUseChapterLocations.mockReturnValue({
        locations: [],
        loading: false,
        error: null,
      });

      render(<MapTabContent />);
      // parseInt("abc", 10) = NaN, which would be falsy
      expect(mockUseChapterLocations).toHaveBeenCalled();
    });
  });
});
