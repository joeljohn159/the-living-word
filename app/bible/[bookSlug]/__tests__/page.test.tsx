import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BookOverviewPage, { generateMetadata } from "../page";

// Mock database query
const mockGetBookBySlug = vi.fn();
vi.mock("@/lib/db/queries", () => ({
  getBookBySlug: (...args: unknown[]) => mockGetBookBySlug(...args),
}));

// Mock next/navigation
const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Mock next/link to render an anchor tag
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const makeBook = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: "Genesis",
  abbreviation: "Gen",
  slug: "genesis",
  testament: "OT",
  category: "Law",
  chapterCount: 50,
  author: "Moses",
  dateWritten: "c. 1445–1405 BC",
  description: "The book of beginnings.",
  keyThemes: "Creation, Fall, Covenant, Faith, Providence",
  sortOrder: 1,
  ...overrides,
});

describe("BookOverviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Happy Path ──────────────────────────────────────────────

  it("renders the book name in both breadcrumb and heading", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const page = await BookOverviewPage({ params: { bookSlug: "genesis" } });
    render(page);

    const genesisElements = screen.getAllByText("Genesis");
    // One in breadcrumb, one in h1 heading
    expect(genesisElements).toHaveLength(2);
  });

  it("renders breadcrumb navigation with link to Bible index", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const page = await BookOverviewPage({ params: { bookSlug: "genesis" } });
    render(page);

    const nav = screen.getByLabelText("Breadcrumb");
    expect(nav).toBeInTheDocument();

    const bibleLink = screen.getByRole("link", { name: "Bible" });
    expect(bibleLink).toHaveAttribute("href", "/bible");
  });

  it("renders BookHeader with book metadata", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const page = await BookOverviewPage({ params: { bookSlug: "genesis" } });
    render(page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Genesis");
    expect(screen.getByText("Moses")).toBeInTheDocument();
    expect(screen.getByText("c. 1445–1405 BC")).toBeInTheDocument();
    expect(screen.getByText("The book of beginnings.")).toBeInTheDocument();
  });

  it("renders ChapterGrid with correct number of chapter links", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook({ chapterCount: 5 }));
    const page = await BookOverviewPage({ params: { bookSlug: "genesis" } });
    render(page);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Chapters");
    // 1 Bible breadcrumb link + 5 chapter links = 6 total links
    const allLinks = screen.getAllByRole("link");
    const chapterLinks = allLinks.filter(
      (link) => link.getAttribute("href")?.match(/\/bible\/genesis\/\d+$/)
    );
    expect(chapterLinks).toHaveLength(5);
  });

  it("renders three placeholder sections for future content", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const page = await BookOverviewPage({ params: { bookSlug: "genesis" } });
    render(page);

    expect(screen.getByText("Archaeological Evidence")).toBeInTheDocument();
    expect(screen.getByText("Key People")).toBeInTheDocument();
    expect(screen.getByText("Locations Map")).toBeInTheDocument();
  });

  it("renders placeholder descriptions", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const page = await BookOverviewPage({ params: { bookSlug: "genesis" } });
    render(page);

    expect(
      screen.getByText("Discoveries and artifacts related to this book will appear here.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Important figures mentioned in this book will appear here.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("An interactive map of places mentioned in this book will appear here.")
    ).toBeInTheDocument();
  });

  it("renders JSON-LD breadcrumb structured data", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const page = await BookOverviewPage({ params: { bookSlug: "genesis" } });
    const { container } = render(page);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();

    const jsonLd = JSON.parse(script!.innerHTML);
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0].name).toBe("Home");
    expect(jsonLd.itemListElement[1].name).toBe("Bible");
    expect(jsonLd.itemListElement[2].name).toBe("Genesis");
  });

  it("passes the correct bookSlug to getBookBySlug", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook({ slug: "exodus", name: "Exodus" }));
    const page = await BookOverviewPage({ params: { bookSlug: "exodus" } });
    render(page);

    expect(mockGetBookBySlug).toHaveBeenCalledWith("exodus");
  });

  // ── Error Handling ──────────────────────────────────────────

  it("calls notFound() when book does not exist", async () => {
    mockGetBookBySlug.mockResolvedValue(undefined);

    await expect(
      BookOverviewPage({ params: { bookSlug: "nonexistent" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound() when getBookBySlug returns null", async () => {
    mockGetBookBySlug.mockResolvedValue(null);

    await expect(
      BookOverviewPage({ params: { bookSlug: "invalid" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalled();
  });

  // ── Edge Cases ──────────────────────────────────────────────

  it("renders correctly when optional book fields are null", async () => {
    mockGetBookBySlug.mockResolvedValue(
      makeBook({
        author: null,
        dateWritten: null,
        description: null,
        keyThemes: null,
      })
    );
    const page = await BookOverviewPage({ params: { bookSlug: "genesis" } });
    render(page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Genesis");
    expect(screen.queryByText("Author")).not.toBeInTheDocument();
    expect(screen.queryByText("Date Written")).not.toBeInTheDocument();
  });

  it("renders correctly for a single-chapter book", async () => {
    mockGetBookBySlug.mockResolvedValue(
      makeBook({
        name: "Obadiah",
        slug: "obadiah",
        chapterCount: 1,
        category: "Minor Prophets",
      })
    );
    const page = await BookOverviewPage({ params: { bookSlug: "obadiah" } });
    render(page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Obadiah");
    const chapterLinks = screen.getAllByRole("link").filter(
      (link) => link.getAttribute("href")?.includes("/bible/obadiah/")
    );
    expect(chapterLinks).toHaveLength(1);
  });

  it("renders NT book with correct testament label", async () => {
    mockGetBookBySlug.mockResolvedValue(
      makeBook({
        name: "Romans",
        slug: "romans",
        testament: "NT",
        category: "Pauline Epistles",
      })
    );
    const page = await BookOverviewPage({ params: { bookSlug: "romans" } });
    render(page);

    expect(screen.getByText("New Testament")).toBeInTheDocument();
  });
});

describe("generateMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns metadata with correct title for a book", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const metadata = await generateMetadata({ params: { bookSlug: "genesis" } });

    expect(metadata.title).toBe("Genesis KJV — Book Overview");
  });

  it("uses book description as meta description when available", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const metadata = await generateMetadata({ params: { bookSlug: "genesis" } });

    expect(metadata.description).toBe("The book of beginnings.");
  });

  it("generates fallback description when book has no description", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook({ description: null }));
    const metadata = await generateMetadata({ params: { bookSlug: "genesis" } });

    expect(metadata.description).toContain("Read the Book of Genesis");
    expect(metadata.description).toContain("50 chapters");
  });

  it("returns empty object when book is not found", async () => {
    mockGetBookBySlug.mockResolvedValue(undefined);
    const metadata = await generateMetadata({ params: { bookSlug: "nonexistent" } });

    expect(metadata).toEqual({});
  });

  it("includes canonical URL with book slug", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const metadata = await generateMetadata({ params: { bookSlug: "genesis" } });

    expect(metadata.alternates?.canonical).toContain("/bible/genesis");
  });

  it("includes OpenGraph metadata", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    const metadata = await generateMetadata({ params: { bookSlug: "genesis" } });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toContain("Genesis KJV — Book Overview");
  });
});
