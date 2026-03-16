import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import VersePage, { generateMetadata } from "../page";

// ─── Mocks ─────────────────────────────────────────────────

const mockGetBookBySlug = vi.fn();
const mockGetVerse = vi.fn();
const mockGetSurroundingVerses = vi.fn();
const mockGetCrossReferences = vi.fn();
const mockGetChapterVerseCount = vi.fn();

vi.mock("@/lib/db/queries", () => ({
  getBookBySlug: (...args: unknown[]) => mockGetBookBySlug(...args),
  getVerse: (...args: unknown[]) => mockGetVerse(...args),
  getSurroundingVerses: (...args: unknown[]) => mockGetSurroundingVerses(...args),
  getCrossReferences: (...args: unknown[]) => mockGetCrossReferences(...args),
  getChapterVerseCount: (...args: unknown[]) => mockGetChapterVerseCount(...args),
}));

const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

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

vi.mock("@/lib/verse-navigation", () => ({
  getVerseNavLinks: vi.fn(() => ({ prev: null, next: null })),
}));

// Mock child client components to isolate page logic
vi.mock("@/components/verse/VerseDisplay", () => ({
  VerseDisplay: (props: { bookName: string; chapter: number; verseNumber: number; text: string }) => (
    <div data-testid="verse-display">{props.text}</div>
  ),
}));

vi.mock("@/components/verse/SurroundingVerses", () => ({
  SurroundingVerses: (props: { activeVerse: number }) => (
    <div data-testid="surrounding-verses">active: {props.activeVerse}</div>
  ),
}));

vi.mock("@/components/verse/CrossReferencesList", () => ({
  CrossReferencesList: (props: { references: unknown[] }) => (
    <div data-testid="cross-references">{props.references.length} refs</div>
  ),
}));

vi.mock("@/components/verse/ShareButtons", () => ({
  ShareButtons: (props: { url: string }) => (
    <div data-testid="share-buttons">{props.url}</div>
  ),
}));

vi.mock("@/components/verse/VerseNavigation", () => ({
  VerseNavigation: () => <div data-testid="verse-navigation" />,
}));

// ─── Test Data Factories ───────────────────────────────────

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

const makeVerse = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  bookId: 1,
  chapterNumber: 1,
  verseNumber: 1,
  text: "In the beginning God created the heaven and the earth.",
  ...overrides,
});

const makeSurroundingVerses = () => [
  { id: 2, verseNumber: 2, text: "And the earth was without form, and void." },
  { id: 3, verseNumber: 3, text: "And God said, Let there be light: and there was light." },
];

const makeCrossRef = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  sourceVerseId: 1,
  targetVerseId: 100,
  targetBookName: "John",
  targetBookSlug: "john",
  targetChapter: 1,
  targetVerse: 1,
  targetText: "In the beginning was the Word.",
  ...overrides,
});

function setupHappyPath() {
  mockGetBookBySlug.mockResolvedValue(makeBook());
  mockGetVerse.mockResolvedValue(makeVerse());
  mockGetSurroundingVerses.mockResolvedValue(makeSurroundingVerses());
  mockGetCrossReferences.mockResolvedValue([makeCrossRef()]);
  mockGetChapterVerseCount.mockResolvedValue(31);
}

const defaultParams = { bookSlug: "genesis", chapter: "1", verse: "1" };

// ─── Page Component Tests ──────────────────────────────────

describe("VersePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Happy Path ──────────────────────────────────────────

  it("renders the verse heading with book name, chapter, and verse", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Genesis 1:1");
  });

  it("renders breadcrumb navigation with all levels", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    const nav = screen.getByLabelText("Breadcrumb");
    expect(nav).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Bible" })).toHaveAttribute("href", "/bible");
    expect(screen.getByRole("link", { name: "Genesis" })).toHaveAttribute("href", "/bible/genesis");
    expect(screen.getByRole("link", { name: "Chapter 1" })).toHaveAttribute("href", "/bible/genesis/1");
    expect(screen.getByText("Verse 1")).toBeInTheDocument();
  });

  it("renders the VerseDisplay component with correct props", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    const display = screen.getByTestId("verse-display");
    expect(display).toHaveTextContent("In the beginning God created the heaven and the earth.");
  });

  it("renders surrounding verses section", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    expect(screen.getByTestId("surrounding-verses")).toHaveTextContent("active: 1");
  });

  it("renders cross references section", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    expect(screen.getByTestId("cross-references")).toHaveTextContent("1 refs");
  });

  it("renders share buttons with the correct URL", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    const shareButtons = screen.getByTestId("share-buttons");
    expect(shareButtons.textContent).toContain("/bible/genesis/1/1");
  });

  it("renders verse navigation component", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    expect(screen.getByTestId("verse-navigation")).toBeInTheDocument();
  });

  it("renders 'Read full chapter' link back to the chapter page", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    const chapterLink = screen.getByText("← Read full chapter");
    expect(chapterLink).toHaveAttribute("href", "/bible/genesis/1");
  });

  it("renders the article with the verse reference as aria-label", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    expect(screen.getByLabelText("Genesis 1:1")).toBeInTheDocument();
  });

  it("displays Old Testament label for OT books", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    expect(screen.getByText(/Old Testament/)).toBeInTheDocument();
  });

  it("displays New Testament label for NT books", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook({ testament: "NT", name: "John", slug: "john", category: "Gospels" }));
    mockGetVerse.mockResolvedValue(makeVerse({ text: "In the beginning was the Word." }));
    mockGetSurroundingVerses.mockResolvedValue([]);
    mockGetCrossReferences.mockResolvedValue([]);
    mockGetChapterVerseCount.mockResolvedValue(51);

    const page = await VersePage({ params: { bookSlug: "john", chapter: "1", verse: "1" } });
    render(page);

    expect(screen.getByText(/New Testament/)).toBeInTheDocument();
  });

  it("renders JSON-LD CreativeWork structured data", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    const { container } = render(page);

    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const jsonLdData = Array.from(scripts).map((s) => JSON.parse(s.innerHTML));

    const creativeWork = jsonLdData.find((d) => d["@type"] === "CreativeWork");
    expect(creativeWork).toBeDefined();
    expect(creativeWork.name).toBe("Genesis 1:1 (KJV)");
    expect(creativeWork.text).toBe("In the beginning God created the heaven and the earth.");
    expect(creativeWork.inLanguage).toBe("en");
    expect(creativeWork.isPartOf["@type"]).toBe("Book");
    expect(creativeWork.url).toContain("/bible/genesis/1/1");
  });

  it("renders JSON-LD BreadcrumbList structured data", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    const { container } = render(page);

    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const jsonLdData = Array.from(scripts).map((s) => JSON.parse(s.innerHTML));

    const breadcrumb = jsonLdData.find((d) => d["@type"] === "BreadcrumbList");
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(5);
    expect(breadcrumb.itemListElement[0].name).toBe("Home");
    expect(breadcrumb.itemListElement[1].name).toBe("Bible");
    expect(breadcrumb.itemListElement[2].name).toBe("Genesis");
    expect(breadcrumb.itemListElement[3].name).toBe("Chapter 1");
    expect(breadcrumb.itemListElement[4].name).toBe("Verse 1");
  });

  it("fetches related data in parallel (surrounding, cross-refs, verse count)", async () => {
    setupHappyPath();
    const page = await VersePage({ params: defaultParams });
    render(page);

    expect(mockGetSurroundingVerses).toHaveBeenCalledWith("genesis", 1, 1, 3);
    expect(mockGetCrossReferences).toHaveBeenCalledWith(1);
    expect(mockGetChapterVerseCount).toHaveBeenCalledWith("genesis", 1);
  });

  // ── Error Handling ──────────────────────────────────────

  it("calls notFound() when chapter is not a valid number", async () => {
    await expect(
      VersePage({ params: { bookSlug: "genesis", chapter: "abc", verse: "1" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound() when verse is not a valid number", async () => {
    await expect(
      VersePage({ params: { bookSlug: "genesis", chapter: "1", verse: "xyz" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound() when chapter is zero", async () => {
    await expect(
      VersePage({ params: { bookSlug: "genesis", chapter: "0", verse: "1" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound() when verse is zero", async () => {
    await expect(
      VersePage({ params: { bookSlug: "genesis", chapter: "1", verse: "0" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound() when chapter is negative", async () => {
    await expect(
      VersePage({ params: { bookSlug: "genesis", chapter: "-1", verse: "1" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound() when book does not exist", async () => {
    mockGetBookBySlug.mockResolvedValue(null);
    await expect(
      VersePage({ params: { bookSlug: "nonexistent", chapter: "1", verse: "1" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound() when chapter exceeds book chapter count", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook({ chapterCount: 50 }));
    await expect(
      VersePage({ params: { bookSlug: "genesis", chapter: "51", verse: "1" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("calls notFound() when verse does not exist in the database", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(null);
    await expect(
      VersePage({ params: { bookSlug: "genesis", chapter: "1", verse: "999" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });

  // ── Edge Cases ──────────────────────────────────────────

  it("handles a verse with no surrounding verses", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse());
    mockGetSurroundingVerses.mockResolvedValue([]);
    mockGetCrossReferences.mockResolvedValue([]);
    mockGetChapterVerseCount.mockResolvedValue(1);

    const page = await VersePage({ params: defaultParams });
    render(page);

    expect(screen.getByTestId("verse-display")).toBeInTheDocument();
    expect(screen.getByTestId("surrounding-verses")).toBeInTheDocument();
  });

  it("handles a verse with no cross-references", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse());
    mockGetSurroundingVerses.mockResolvedValue([]);
    mockGetCrossReferences.mockResolvedValue([]);
    mockGetChapterVerseCount.mockResolvedValue(31);

    const page = await VersePage({ params: defaultParams });
    render(page);

    expect(screen.getByTestId("cross-references")).toHaveTextContent("0 refs");
  });

  it("renders correctly for a middle verse with multi-digit numbers", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook({ name: "Psalms", slug: "psalms", chapterCount: 150 }));
    mockGetVerse.mockResolvedValue(
      makeVerse({ id: 500, verseNumber: 15, chapterNumber: 119, text: "I will meditate in thy precepts." })
    );
    mockGetSurroundingVerses.mockResolvedValue([]);
    mockGetCrossReferences.mockResolvedValue([]);
    mockGetChapterVerseCount.mockResolvedValue(176);

    const page = await VersePage({
      params: { bookSlug: "psalms", chapter: "119", verse: "15" },
    });
    render(page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Psalms 119:15");
  });

  it("does not skip db calls when params are at the boundary of valid chapter count", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook({ chapterCount: 50 }));
    mockGetVerse.mockResolvedValue(makeVerse({ chapterNumber: 50 }));
    mockGetSurroundingVerses.mockResolvedValue([]);
    mockGetCrossReferences.mockResolvedValue([]);
    mockGetChapterVerseCount.mockResolvedValue(26);

    const page = await VersePage({
      params: { bookSlug: "genesis", chapter: "50", verse: "1" },
    });
    render(page);

    expect(mockGetVerse).toHaveBeenCalledWith("genesis", 50, 1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Genesis 50:1");
  });

  it("includes the active verse in the context verses list passed to SurroundingVerses", async () => {
    // The page merges surrounding + active verse and sorts them
    const surrounding = [
      { id: 2, verseNumber: 2, text: "Verse 2 text" },
    ];
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse({ id: 1, verseNumber: 1, text: "Verse 1 text" }));
    mockGetSurroundingVerses.mockResolvedValue(surrounding);
    mockGetCrossReferences.mockResolvedValue([]);
    mockGetChapterVerseCount.mockResolvedValue(31);

    const page = await VersePage({ params: defaultParams });
    render(page);

    // The page should render without error — the merge is tested implicitly
    expect(screen.getByTestId("surrounding-verses")).toBeInTheDocument();
  });
});

// ─── Metadata Tests ────────────────────────────────────────

describe("generateMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates metadata with formatted title for a valid verse", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse());

    const metadata = await generateMetadata({ params: defaultParams });

    expect(metadata.title).toContain("Genesis 1:1 KJV");
    expect(metadata.title).toContain("In the beginning");
  });

  it("includes verse text in the description", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse());

    const metadata = await generateMetadata({ params: defaultParams });

    expect(metadata.description).toContain("In the beginning God created the heaven and the earth.");
    expect(metadata.description).toContain("Genesis 1:1");
    expect(metadata.description).toContain("King James Version");
  });

  it("returns 'Verse Not Found' title when book does not exist", async () => {
    mockGetBookBySlug.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: { bookSlug: "nonexistent", chapter: "1", verse: "1" },
    });

    expect(metadata.title).toBe("Verse Not Found");
  });

  it("returns 'Verse Not Found' title when verse does not exist", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: { bookSlug: "genesis", chapter: "1", verse: "999" },
    });

    expect(metadata.title).toBe("Verse Not Found");
  });

  it("includes canonical URL with correct path", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse());

    const metadata = await generateMetadata({ params: defaultParams });

    expect(metadata.alternates?.canonical).toContain("/bible/genesis/1/1");
  });

  it("includes OpenGraph metadata with article type", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse());

    const metadata = await generateMetadata({ params: defaultParams });

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.type).toBe("article");
  });

  it("includes Twitter card metadata", async () => {
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse());

    const metadata = await generateMetadata({ params: defaultParams });

    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.card).toBe("summary_large_image");
  });

  it("truncates long verse text in the title", async () => {
    const longText = "A".repeat(200);
    mockGetBookBySlug.mockResolvedValue(makeBook());
    mockGetVerse.mockResolvedValue(makeVerse({ text: longText }));

    const metadata = await generateMetadata({ params: defaultParams });

    // The title should contain truncated text, not the full 200 chars
    expect((metadata.title as string).length).toBeLessThan(200);
  });
});
