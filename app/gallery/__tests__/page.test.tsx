import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
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

// Mock the seo module
vi.mock("@/lib/seo", () => ({
  generatePageMetadata: vi.fn(() => ({})),
  buildBreadcrumbJsonLd: vi.fn(() => ({})),
  jsonLdScriptProps: vi.fn(() => ({
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: "{}" },
  })),
}));

// Mock the database queries module
const mockGetAllMedia = vi.fn();
vi.mock("@/lib/db/queries", () => ({
  getAllMedia: () => mockGetAllMedia(),
}));

// Import the component after mocks are set up
import GalleryPage from "../page";

const MOCK_ARTWORKS = [
  {
    id: 1,
    title: "The Creation of Adam",
    description: "Famous Sistine Chapel painting",
    artist: "Michelangelo",
    yearCreated: "c. 1508-1512",
    imageUrl: "https://example.com/creation.jpg",
    attribution: "Wikimedia Commons",
    license: "Public Domain",
    mediaType: "painting",
  },
  {
    id: 2,
    title: "David and Goliath",
    description: null,
    artist: "Caravaggio",
    yearCreated: "c. 1610",
    imageUrl: null,
    attribution: null,
    license: null,
    mediaType: "painting",
  },
  {
    id: 3,
    title: "Unknown Ancient Fresco",
    description: "An ancient fresco from a catacomb",
    artist: null,
    yearCreated: null,
    imageUrl: "https://example.com/fresco.jpg",
    attribution: "Museum Collection",
    license: "CC BY 4.0",
    mediaType: "fresco",
  },
];

describe("GalleryPage", () => {
  it("renders the page header with title and description", async () => {
    mockGetAllMedia.mockResolvedValue(MOCK_ARTWORKS);
    const page = await GalleryPage();
    render(page);

    expect(screen.getByText("Biblical Artwork")).toBeInTheDocument();
    expect(screen.getByText("Gallery")).toBeInTheDocument();
    expect(
      screen.getByText(/Classical paintings and illustrations/)
    ).toBeInTheDocument();
  });

  it("renders artwork cards when data is available", async () => {
    mockGetAllMedia.mockResolvedValue(MOCK_ARTWORKS);
    const page = await GalleryPage();
    render(page);

    expect(screen.getByText("The Creation of Adam")).toBeInTheDocument();
    expect(screen.getByText("David and Goliath")).toBeInTheDocument();
    expect(screen.getByText("Unknown Ancient Fresco")).toBeInTheDocument();
  });

  it("shows empty state when no artworks exist", async () => {
    mockGetAllMedia.mockResolvedValue([]);
    const page = await GalleryPage();
    render(page);

    expect(
      screen.getByText("No artwork has been added yet. Check back soon.")
    ).toBeInTheDocument();
  });

  it("renders image with correct alt text including artist", async () => {
    mockGetAllMedia.mockResolvedValue([MOCK_ARTWORKS[0]]);
    const page = await GalleryPage();
    render(page);

    const img = screen.getByAltText("The Creation of Adam by Michelangelo");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/creation.jpg");
  });

  it("renders alt text without artist when artist is null", async () => {
    mockGetAllMedia.mockResolvedValue([MOCK_ARTWORKS[2]]);
    const page = await GalleryPage();
    render(page);

    const img = screen.getByAltText("Unknown Ancient Fresco");
    expect(img).toBeInTheDocument();
  });

  it("shows 'No image available' placeholder when imageUrl is null", async () => {
    mockGetAllMedia.mockResolvedValue([MOCK_ARTWORKS[1]]);
    const page = await GalleryPage();
    render(page);

    expect(screen.getByText("No image available")).toBeInTheDocument();
  });

  it("renders artist and year when both are present", async () => {
    mockGetAllMedia.mockResolvedValue([MOCK_ARTWORKS[0]]);
    const page = await GalleryPage();
    render(page);

    // Artist · Year should appear
    expect(screen.getByText(/Michelangelo/)).toBeInTheDocument();
    expect(screen.getByText(/c\. 1508-1512/)).toBeInTheDocument();
  });

  it("does not render artist/year line when both are null", async () => {
    const artworkNoArtistNoYear = {
      ...MOCK_ARTWORKS[2],
      artist: null,
      yearCreated: null,
    };
    mockGetAllMedia.mockResolvedValue([artworkNoArtistNoYear]);
    const page = await GalleryPage();
    render(page);

    // Title and description should be present
    expect(screen.getByText("Unknown Ancient Fresco")).toBeInTheDocument();
    // The middot separator should not appear
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });

  it("renders description when present", async () => {
    mockGetAllMedia.mockResolvedValue([MOCK_ARTWORKS[0]]);
    const page = await GalleryPage();
    render(page);

    expect(
      screen.getByText("Famous Sistine Chapel painting")
    ).toBeInTheDocument();
  });

  it("does not render description when null", async () => {
    mockGetAllMedia.mockResolvedValue([MOCK_ARTWORKS[1]]);
    const page = await GalleryPage();
    render(page);

    // Only title and artist should be visible, no description
    expect(screen.getByText("David and Goliath")).toBeInTheDocument();
    expect(
      screen.queryByText("Famous Sistine Chapel painting")
    ).not.toBeInTheDocument();
  });

  it("renders attribution when present", async () => {
    mockGetAllMedia.mockResolvedValue([MOCK_ARTWORKS[0]]);
    const page = await GalleryPage();
    render(page);

    expect(screen.getByText("Wikimedia Commons")).toBeInTheDocument();
  });

  it("has a screen-reader-only heading for the gallery section", async () => {
    mockGetAllMedia.mockResolvedValue(MOCK_ARTWORKS);
    const page = await GalleryPage();
    render(page);

    const heading = screen.getByText("Artworks");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("sr-only");
  });

  it("renders the correct number of cards", async () => {
    mockGetAllMedia.mockResolvedValue(MOCK_ARTWORKS);
    const page = await GalleryPage();
    const { container } = render(page);

    // Each card has an h3 element
    const cardTitles = container.querySelectorAll("h3");
    // Includes the sr-only h2 "Artworks" heading excluded; h3s are card titles
    expect(cardTitles.length).toBe(MOCK_ARTWORKS.length);
  });
});
