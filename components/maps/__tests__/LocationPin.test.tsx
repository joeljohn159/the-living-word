import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationPin } from "../LocationPin";
import type { MapLocation } from "../types";

// Mock react-leaflet components
vi.mock("react-leaflet", () => ({
  Marker: ({
    children,
    position,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    position: [number, number];
    icon: unknown;
    "aria-label"?: string;
  }) => (
    <div
      data-testid="marker"
      data-lat={position[0]}
      data-lng={position[1]}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  ),
  Popup: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
    maxWidth?: number;
    minWidth?: number;
    closeButton?: boolean;
  }) => (
    <div data-testid="popup" data-classname={className}>
      {children}
    </div>
  ),
}));

// Mock leaflet's divIcon
const mockDivIcon = vi.fn((opts: { html: string; className: string }) => ({
  html: opts.html,
  className: opts.className,
}));
vi.mock("leaflet", () => ({
  default: {
    divIcon: (...args: unknown[]) => mockDivIcon(...args),
  },
}));

function makeLocation(
  overrides: Partial<MapLocation> = {}
): MapLocation {
  return {
    id: 1,
    name: "Jerusalem",
    slug: "jerusalem",
    description: "The holy city",
    locationType: "city",
    latitude: 31.7683,
    longitude: 35.2137,
    modernName: "Jerusalem",
    imageUrl: null,
    ...overrides,
  };
}

describe("LocationPin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("marker positioning", () => {
    it("renders a marker at the correct coordinates", () => {
      const loc = makeLocation({ latitude: 31.5, longitude: 35.2 });
      render(<LocationPin location={loc} />);

      const marker = screen.getByTestId("marker");
      expect(marker).toHaveAttribute("data-lat", "31.5");
      expect(marker).toHaveAttribute("data-lng", "35.2");
    });
  });

  describe("popup content", () => {
    it("displays the location name", () => {
      render(<LocationPin location={makeLocation()} />);
      expect(screen.getByText("Jerusalem")).toBeInTheDocument();
    });

    it("shows a capitalized type badge", () => {
      render(
        <LocationPin location={makeLocation({ locationType: "mountain" })} />
      );
      expect(screen.getByText("Mountain")).toBeInTheDocument();
    });

    it("shows description when provided", () => {
      render(
        <LocationPin
          location={makeLocation({ description: "An ancient trading city" })}
        />
      );
      expect(screen.getByText("An ancient trading city")).toBeInTheDocument();
    });

    it("does not render description when null", () => {
      render(
        <LocationPin location={makeLocation({ description: null })} />
      );
      expect(
        screen.queryByText("An ancient trading city")
      ).not.toBeInTheDocument();
    });

    it("shows modern name when provided", () => {
      render(
        <LocationPin location={makeLocation({ modernName: "Tel Aviv" })} />
      );
      expect(screen.getByText("Modern: Tel Aviv")).toBeInTheDocument();
    });

    it("does not show modern name when null", () => {
      render(
        <LocationPin location={makeLocation({ modernName: null })} />
      );
      expect(screen.queryByText(/Modern:/)).not.toBeInTheDocument();
    });
  });

  describe("location type color mapping", () => {
    it.each([
      ["city", "#C4975C"],
      ["mountain", "#8B7D6B"],
      ["river", "#5C8FA6"],
      ["sea", "#5C8FA6"],
      ["region", "#9E7A48"],
      ["desert", "#D4A96A"],
      ["unknown-type", "#C4975C"], // default fallback
    ])(
      "creates icon with correct color for %s type",
      (locationType, expectedColor) => {
        mockDivIcon.mockClear();
        render(
          <LocationPin location={makeLocation({ locationType })} />
        );

        const divIconCall = mockDivIcon.mock.calls[
          mockDivIcon.mock.calls.length - 1
        ][0];
        expect(divIconCall.html).toContain(`fill="${expectedColor}"`);
      }
    );
  });

  describe("type label capitalization", () => {
    it.each([
      ["city", "City"],
      ["mountain", "Mountain"],
      ["river", "River"],
      ["sea", "Sea"],
      ["region", "Region"],
      ["desert", "Desert"],
    ])("capitalizes %s as %s", (input, expected) => {
      render(
        <LocationPin location={makeLocation({ locationType: input })} />
      );
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  describe("popup styling", () => {
    it("uses bible-map-popup class", () => {
      render(<LocationPin location={makeLocation()} />);
      const popup = screen.getByTestId("popup");
      expect(popup).toHaveAttribute("data-classname", "bible-map-popup");
    });
  });
});
