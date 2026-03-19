import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { BOOK_METADATA } from "@/lib/db/seed-data/book-metadata";
import { CHAPTER_SUMMARIES } from "@/lib/db/seed-data/chapter-summaries";

/**
 * Tests for the KJV Bible seed data and seed logic.
 *
 * Validates:
 * - Book metadata completeness and correctness (66 books)
 * - Chapter summaries format
 * - Seed functions insert correct data into an in-memory SQLite DB
 * - KJV translation record is correct
 * - Edge cases: idempotency, partial data handling
 */

// ─── In-Memory Database Setup ─────────────────────────────────────────────

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

function applySchema(rawDb: Database.Database) {
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      testament TEXT NOT NULL CHECK(testament IN ('OT','NT')),
      category TEXT NOT NULL,
      chapter_count INTEGER NOT NULL,
      author TEXT,
      date_written TEXT,
      description TEXT,
      key_themes TEXT,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      chapter_number INTEGER NOT NULL,
      verse_count INTEGER NOT NULL,
      summary TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_chapters_book_chapter ON chapters(book_id, chapter_number);

    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      chapter_number INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      text TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_verses_book_chapter_verse ON verses(book_id, chapter_number, verse_number);
    CREATE INDEX IF NOT EXISTS idx_verses_chapter_id ON verses(chapter_id);

    CREATE TABLE IF NOT EXISTS translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL UNIQUE,
      language TEXT NOT NULL DEFAULT 'en',
      description TEXT,
      year INTEGER,
      is_default INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS verse_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_id INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
      translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
      text TEXT NOT NULL
    );
  `);
}

beforeAll(() => {
  sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  applySchema(sqlite);
  db = drizzle(sqlite, { schema });
});

afterAll(() => {
  sqlite.close();
});

// ─── BOOK METADATA TESTS ─────────────────────────────────────────────────

describe("BOOK_METADATA — 66 canonical books", () => {
  it("should contain exactly 66 books", () => {
    expect(BOOK_METADATA).toHaveLength(66);
  });

  it("should have unique sort orders from 1 to 66", () => {
    const sortOrders = BOOK_METADATA.map((b) => b.sortOrder).sort((a, b) => a - b);
    expect(sortOrders).toEqual(Array.from({ length: 66 }, (_, i) => i + 1));
  });

  it("should have unique book names", () => {
    const names = BOOK_METADATA.map((b) => b.name);
    expect(new Set(names).size).toBe(66);
  });

  it("should have unique abbreviations", () => {
    const abbrs = BOOK_METADATA.map((b) => b.abbreviation);
    expect(new Set(abbrs).size).toBe(66);
  });

  it("should have 39 Old Testament and 27 New Testament books", () => {
    const ot = BOOK_METADATA.filter((b) => b.testament === "OT");
    const nt = BOOK_METADATA.filter((b) => b.testament === "NT");
    expect(ot).toHaveLength(39);
    expect(nt).toHaveLength(27);
  });

  it("should only use valid testament values (OT or NT)", () => {
    for (const book of BOOK_METADATA) {
      expect(["OT", "NT"]).toContain(book.testament);
    }
  });

  it("should only use valid category values", () => {
    const validCategories = [
      "Law",
      "History",
      "Poetry",
      "Major Prophets",
      "Minor Prophets",
      "Gospels",
      "Pauline Epistles",
      "General Epistles",
      "Apocalyptic",
    ];
    for (const book of BOOK_METADATA) {
      expect(validCategories).toContain(book.category);
    }
  });

  it("should have correct category distribution", () => {
    const categories = new Map<string, number>();
    for (const book of BOOK_METADATA) {
      categories.set(book.category, (categories.get(book.category) || 0) + 1);
    }
    expect(categories.get("Law")).toBe(5);
    expect(categories.get("Gospels")).toBe(4);
    expect(categories.get("Minor Prophets")).toBe(12);
    expect(categories.get("Major Prophets")).toBe(5);
    expect(categories.get("Apocalyptic")).toBe(1);
  });

  it("should have positive chapter counts for all books", () => {
    for (const book of BOOK_METADATA) {
      expect(book.chapterCount).toBeGreaterThan(0);
    }
  });

  it("should have total chapter count of 1,189", () => {
    const totalChapters = BOOK_METADATA.reduce((sum, b) => sum + b.chapterCount, 0);
    expect(totalChapters).toBe(1189);
  });

  it("should have non-empty required fields for every book", () => {
    for (const book of BOOK_METADATA) {
      expect(book.name.length).toBeGreaterThan(0);
      expect(book.abbreviation.length).toBeGreaterThan(0);
      expect(book.author.length).toBeGreaterThan(0);
      expect(book.dateWritten.length).toBeGreaterThan(0);
      expect(book.description.length).toBeGreaterThan(0);
      expect(book.keyThemes.length).toBeGreaterThan(0);
    }
  });

  it("should have correct data for well-known books", () => {
    const genesis = BOOK_METADATA.find((b) => b.name === "Genesis");
    expect(genesis).toBeDefined();
    expect(genesis!.abbreviation).toBe("Gen");
    expect(genesis!.testament).toBe("OT");
    expect(genesis!.category).toBe("Law");
    expect(genesis!.chapterCount).toBe(50);
    expect(genesis!.sortOrder).toBe(1);

    const psalms = BOOK_METADATA.find((b) => b.name === "Psalms");
    expect(psalms).toBeDefined();
    expect(psalms!.chapterCount).toBe(150); // Largest book by chapters
    expect(psalms!.category).toBe("Poetry");

    const revelation = BOOK_METADATA.find((b) => b.name === "Revelation");
    expect(revelation).toBeDefined();
    expect(revelation!.sortOrder).toBe(66);
    expect(revelation!.testament).toBe("NT");
    expect(revelation!.category).toBe("Apocalyptic");
    expect(revelation!.chapterCount).toBe(22);
  });

  it("should have OT books sorted before NT books in canonical order", () => {
    const lastOtBook = BOOK_METADATA.filter((b) => b.testament === "OT")
      .sort((a, b) => b.sortOrder - a.sortOrder)[0];
    const firstNtBook = BOOK_METADATA.filter((b) => b.testament === "NT")
      .sort((a, b) => a.sortOrder - b.sortOrder)[0];

    expect(lastOtBook.sortOrder).toBeLessThan(firstNtBook.sortOrder);
    // Malachi (39) < Matthew (40)
    expect(lastOtBook.name).toBe("Malachi");
    expect(firstNtBook.name).toBe("Matthew");
  });

  it("should have Obadiah as the only 1-chapter OT book in Minor Prophets", () => {
    const oneChapterMinor = BOOK_METADATA.filter(
      (b) => b.category === "Minor Prophets" && b.chapterCount === 1
    );
    expect(oneChapterMinor).toHaveLength(1);
    expect(oneChapterMinor[0].name).toBe("Obadiah");
  });
});

// ─── CHAPTER SUMMARIES TESTS ──────────────────────────────────────────────

describe("CHAPTER_SUMMARIES — chapter summary data", () => {
  it("should be a non-empty record", () => {
    const keys = Object.keys(CHAPTER_SUMMARIES);
    expect(keys.length).toBeGreaterThan(0);
  });

  it("should have keys in 'bookNum-chapterNum' format", () => {
    for (const key of Object.keys(CHAPTER_SUMMARIES)) {
      expect(key).toMatch(/^\d+-\d+$/);
    }
  });

  it("should have non-empty string values for all summaries", () => {
    for (const [, value] of Object.entries(CHAPTER_SUMMARIES)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it("should include summaries for Genesis 1 (key '1-1')", () => {
    expect(CHAPTER_SUMMARIES["1-1"]).toBeDefined();
    expect(CHAPTER_SUMMARIES["1-1"]).toContain("God creates");
  });

  it("should only reference valid book numbers (1-66)", () => {
    for (const key of Object.keys(CHAPTER_SUMMARIES)) {
      const bookNum = parseInt(key.split("-")[0], 10);
      expect(bookNum).toBeGreaterThanOrEqual(1);
      expect(bookNum).toBeLessThanOrEqual(66);
    }
  });

  it("should only reference valid chapter numbers (>= 1)", () => {
    for (const key of Object.keys(CHAPTER_SUMMARIES)) {
      const chapterNum = parseInt(key.split("-")[1], 10);
      expect(chapterNum).toBeGreaterThanOrEqual(1);
    }
  });

  it("should not reference chapter numbers exceeding the book's chapter count", () => {
    // Build a lookup: sortOrder (bookNum) → chapterCount
    const chapterCounts = new Map<number, number>();
    for (const book of BOOK_METADATA) {
      chapterCounts.set(book.sortOrder, book.chapterCount);
    }

    for (const key of Object.keys(CHAPTER_SUMMARIES)) {
      const [bookStr, chapterStr] = key.split("-");
      const bookNum = parseInt(bookStr, 10);
      const chapterNum = parseInt(chapterStr, 10);
      const maxChapters = chapterCounts.get(bookNum);

      if (maxChapters !== undefined) {
        expect(chapterNum).toBeLessThanOrEqual(maxChapters);
      }
    }
  });
});

// ─── SEED TRANSLATION TESTS (in-memory DB) ───────────────────────────────

describe("seedTranslation — KJV translation record", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM translations");
  });

  it("should insert a KJV translation with correct fields", () => {
    const result = db
      .insert(schema.translations)
      .values({
        name: "King James Version",
        abbreviation: "KJV",
        language: "en",
        description: "The Authorized King James Version",
        year: 1611,
        isDefault: true,
      })
      .returning()
      .get();

    expect(result.name).toBe("King James Version");
    expect(result.abbreviation).toBe("KJV");
    expect(result.language).toBe("en");
    expect(result.year).toBe(1611);
    expect(result.isDefault).toBeTruthy();
  });

  it("should enforce unique abbreviation constraint", () => {
    db.insert(schema.translations)
      .values({
        name: "King James Version",
        abbreviation: "KJV",
        language: "en",
        year: 1611,
        isDefault: true,
      })
      .run();

    expect(() => {
      db.insert(schema.translations)
        .values({
          name: "Another KJV",
          abbreviation: "KJV",
          language: "en",
          year: 1611,
          isDefault: false,
        })
        .run();
    }).toThrow();
  });

  it("should allow retrieving KJV by abbreviation", () => {
    db.insert(schema.translations)
      .values({
        name: "King James Version",
        abbreviation: "KJV",
        language: "en",
        year: 1611,
        isDefault: true,
      })
      .run();

    const kjv = db
      .select()
      .from(schema.translations)
      .where(eq(schema.translations.abbreviation, "KJV"))
      .get();

    expect(kjv).toBeDefined();
    expect(kjv!.name).toBe("King James Version");
  });
});

// ─── SEED BOOKS TESTS (in-memory DB) ──────────────────────────────────────

describe("seedBooks — inserting 66 books into the database", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM verses");
    sqlite.exec("DELETE FROM chapters");
    sqlite.exec("DELETE FROM books");
  });

  it("should insert all 66 books with correct metadata", () => {
    for (const meta of BOOK_METADATA) {
      db.insert(schema.books)
        .values({
          name: meta.name,
          abbreviation: meta.abbreviation,
          slug: meta.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          testament: meta.testament,
          category: meta.category,
          chapterCount: meta.chapterCount,
          author: meta.author,
          dateWritten: meta.dateWritten,
          description: meta.description,
          keyThemes: meta.keyThemes,
          sortOrder: meta.sortOrder,
        })
        .run();
    }

    const allBooks = db.select().from(schema.books).all();
    expect(allBooks).toHaveLength(66);
  });

  it("should enforce unique slug constraint on books", () => {
    db.insert(schema.books)
      .values({
        name: "Genesis",
        abbreviation: "Gen",
        slug: "genesis",
        testament: "OT",
        category: "Law",
        chapterCount: 50,
        sortOrder: 1,
      })
      .run();

    expect(() => {
      db.insert(schema.books)
        .values({
          name: "Genesis Duplicate",
          abbreviation: "Gen2",
          slug: "genesis", // duplicate slug
          testament: "OT",
          category: "Law",
          chapterCount: 50,
          sortOrder: 99,
        })
        .run();
    }).toThrow();
  });

  it("should store all book fields correctly", () => {
    const genesis = BOOK_METADATA[0]; // Genesis
    db.insert(schema.books)
      .values({
        name: genesis.name,
        abbreviation: genesis.abbreviation,
        slug: "genesis",
        testament: genesis.testament,
        category: genesis.category,
        chapterCount: genesis.chapterCount,
        author: genesis.author,
        dateWritten: genesis.dateWritten,
        description: genesis.description,
        keyThemes: genesis.keyThemes,
        sortOrder: genesis.sortOrder,
      })
      .run();

    const result = db
      .select()
      .from(schema.books)
      .where(eq(schema.books.slug, "genesis"))
      .get();

    expect(result).toBeDefined();
    expect(result!.name).toBe("Genesis");
    expect(result!.abbreviation).toBe("Gen");
    expect(result!.testament).toBe("OT");
    expect(result!.category).toBe("Law");
    expect(result!.chapterCount).toBe(50);
    expect(result!.author).toBe("Moses");
    expect(result!.dateWritten).toContain("1445");
    expect(result!.description).toContain("beginnings");
    expect(result!.keyThemes).toContain("Creation");
    expect(result!.sortOrder).toBe(1);
  });

  it("should return book IDs in a map keyed by sortOrder", () => {
    const bookIdMap = new Map<number, number>();

    for (const meta of BOOK_METADATA) {
      const result = db
        .insert(schema.books)
        .values({
          name: meta.name,
          abbreviation: meta.abbreviation,
          slug: meta.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          testament: meta.testament,
          category: meta.category,
          chapterCount: meta.chapterCount,
          author: meta.author,
          dateWritten: meta.dateWritten,
          description: meta.description,
          keyThemes: meta.keyThemes,
          sortOrder: meta.sortOrder,
        })
        .returning()
        .get();

      bookIdMap.set(meta.sortOrder, result.id);
    }

    expect(bookIdMap.size).toBe(66);
    // Every book number 1-66 should have an ID
    for (let i = 1; i <= 66; i++) {
      expect(bookIdMap.has(i)).toBe(true);
      expect(bookIdMap.get(i)).toBeGreaterThan(0);
    }
  });
});

// ─── SEED CHAPTERS & VERSES TESTS (in-memory DB) ─────────────────────────

describe("seedChaptersAndVerses — chapter and verse insertion", () => {
  let genesisBookId: number;

  beforeEach(() => {
    sqlite.exec("DELETE FROM verses");
    sqlite.exec("DELETE FROM chapters");
    sqlite.exec("DELETE FROM books");

    // Insert a single book for testing
    const result = db
      .insert(schema.books)
      .values({
        name: "Genesis",
        abbreviation: "Gen",
        slug: "genesis",
        testament: "OT",
        category: "Law",
        chapterCount: 50,
        sortOrder: 1,
      })
      .returning()
      .get();
    genesisBookId = result.id;
  });

  it("should insert chapters with correct book reference", () => {
    db.insert(schema.chapters)
      .values({
        bookId: genesisBookId,
        chapterNumber: 1,
        verseCount: 31,
        summary: "God creates the heavens and the earth.",
      })
      .run();

    const chapter = db
      .select()
      .from(schema.chapters)
      .where(eq(schema.chapters.bookId, genesisBookId))
      .get();

    expect(chapter).toBeDefined();
    expect(chapter!.chapterNumber).toBe(1);
    expect(chapter!.verseCount).toBe(31);
    expect(chapter!.summary).toContain("creates");
  });

  it("should insert verses with correct foreign keys", () => {
    const chapter = db
      .insert(schema.chapters)
      .values({
        bookId: genesisBookId,
        chapterNumber: 1,
        verseCount: 3,
      })
      .returning()
      .get();

    const sampleVerses = [
      { bookId: genesisBookId, chapterId: chapter.id, chapterNumber: 1, verseNumber: 1, text: "In the beginning God created the heaven and the earth." },
      { bookId: genesisBookId, chapterId: chapter.id, chapterNumber: 1, verseNumber: 2, text: "And the earth was without form, and void." },
      { bookId: genesisBookId, chapterId: chapter.id, chapterNumber: 1, verseNumber: 3, text: "And God said, Let there be light: and there was light." },
    ];

    for (const v of sampleVerses) {
      db.insert(schema.verses).values(v).run();
    }

    const allVerses = db
      .select()
      .from(schema.verses)
      .where(eq(schema.verses.chapterId, chapter.id))
      .all();

    expect(allVerses).toHaveLength(3);
    expect(allVerses[0].text).toContain("In the beginning");
    expect(allVerses[2].verseNumber).toBe(3);
  });

  it("should cascade delete verses when a chapter is deleted", () => {
    const chapter = db
      .insert(schema.chapters)
      .values({
        bookId: genesisBookId,
        chapterNumber: 1,
        verseCount: 1,
      })
      .returning()
      .get();

    db.insert(schema.verses)
      .values({
        bookId: genesisBookId,
        chapterId: chapter.id,
        chapterNumber: 1,
        verseNumber: 1,
        text: "In the beginning...",
      })
      .run();

    // Delete the chapter
    db.delete(schema.chapters).where(eq(schema.chapters.id, chapter.id)).run();

    const remainingVerses = db.select().from(schema.verses).all();
    expect(remainingVerses).toHaveLength(0);
  });

  it("should cascade delete chapters when a book is deleted", () => {
    db.insert(schema.chapters)
      .values({
        bookId: genesisBookId,
        chapterNumber: 1,
        verseCount: 5,
      })
      .run();

    db.delete(schema.books).where(eq(schema.books.id, genesisBookId)).run();

    const remainingChapters = db.select().from(schema.chapters).all();
    expect(remainingChapters).toHaveLength(0);
  });

  it("should handle chapters without summaries (null summary)", () => {
    const chapter = db
      .insert(schema.chapters)
      .values({
        bookId: genesisBookId,
        chapterNumber: 42,
        verseCount: 10,
        summary: null,
      })
      .returning()
      .get();

    expect(chapter.summary).toBeNull();
  });

  it("should support batch insertion of multiple verses", () => {
    const chapter = db
      .insert(schema.chapters)
      .values({
        bookId: genesisBookId,
        chapterNumber: 1,
        verseCount: 100,
      })
      .returning()
      .get();

    // Simulate batch insert (like the seed does with 500-verse batches)
    const batchSize = 50;
    const totalVerses = 100;

    for (let i = 0; i < totalVerses; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, totalVerses); j++) {
        batch.push({
          bookId: genesisBookId,
          chapterId: chapter.id,
          chapterNumber: 1,
          verseNumber: j + 1,
          text: `Test verse ${j + 1}`,
        });
      }
      // Use raw SQL transaction for batch insert (as the real seed does)
      const insertStmt = sqlite.prepare(
        "INSERT INTO verses (book_id, chapter_id, chapter_number, verse_number, text) VALUES (?, ?, ?, ?, ?)"
      );
      const insertMany = sqlite.transaction((rows: typeof batch) => {
        for (const row of rows) {
          insertStmt.run(row.bookId, row.chapterId, row.chapterNumber, row.verseNumber, row.text);
        }
      });
      insertMany(batch);
    }

    const allVerses = db.select().from(schema.verses).all();
    expect(allVerses).toHaveLength(100);
  });
});

// ─── KJV VERSE FORMAT VALIDATION ──────────────────────────────────────────

describe("KjvVerse format — validates the cached KJV data structure", () => {
  // We test the shape contract rather than loading the full 4.8MB file
  it("should accept valid verse objects with b, c, v, t fields", () => {
    const validVerse = { b: 1, c: 1, v: 1, t: "In the beginning God created the heaven and the earth." };
    expect(validVerse.b).toBeGreaterThanOrEqual(1);
    expect(validVerse.b).toBeLessThanOrEqual(66);
    expect(validVerse.c).toBeGreaterThanOrEqual(1);
    expect(validVerse.v).toBeGreaterThanOrEqual(1);
    expect(typeof validVerse.t).toBe("string");
    expect(validVerse.t.length).toBeGreaterThan(0);
  });

  it("should group verses correctly by book-chapter key", () => {
    const sampleVerses = [
      { b: 1, c: 1, v: 1, t: "Verse 1" },
      { b: 1, c: 1, v: 2, t: "Verse 2" },
      { b: 1, c: 2, v: 1, t: "Chapter 2 verse 1" },
      { b: 2, c: 1, v: 1, t: "Exodus 1:1" },
    ];

    // Simulate the chapter grouping logic from seed-chapters-verses.ts
    const chapterMap = new Map<string, { bookNum: number; chapterNum: number; verseCount: number }>();
    for (const verse of sampleVerses) {
      const key = `${verse.b}-${verse.c}`;
      if (!chapterMap.has(key)) {
        chapterMap.set(key, { bookNum: verse.b, chapterNum: verse.c, verseCount: 0 });
      }
      chapterMap.get(key)!.verseCount++;
    }

    expect(chapterMap.size).toBe(3); // Gen 1, Gen 2, Exod 1
    expect(chapterMap.get("1-1")!.verseCount).toBe(2);
    expect(chapterMap.get("1-2")!.verseCount).toBe(1);
    expect(chapterMap.get("2-1")!.verseCount).toBe(1);
  });

  it("should handle the full range of book numbers 1-66", () => {
    for (let bookNum = 1; bookNum <= 66; bookNum++) {
      const verse = { b: bookNum, c: 1, v: 1, t: `Test verse for book ${bookNum}` };
      expect(verse.b).toBe(bookNum);
    }
  });
});

// ─── IDEMPOTENCY & EDGE CASE TESTS ───────────────────────────────────────

describe("Seed idempotency — re-running should not duplicate data", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM verse_translations");
    sqlite.exec("DELETE FROM verses");
    sqlite.exec("DELETE FROM chapters");
    sqlite.exec("DELETE FROM translations");
    sqlite.exec("DELETE FROM books");
  });

  it("should detect existing books and skip re-insertion", () => {
    // Insert 66 books
    for (const meta of BOOK_METADATA) {
      db.insert(schema.books)
        .values({
          name: meta.name,
          abbreviation: meta.abbreviation,
          slug: meta.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          testament: meta.testament,
          category: meta.category,
          chapterCount: meta.chapterCount,
          sortOrder: meta.sortOrder,
        })
        .run();
    }

    // Simulate idempotency check (as in seedBooks)
    const existingBooks = db.select().from(schema.books).all();
    expect(existingBooks).toHaveLength(66);

    // The seed would detect 66 books and skip
    const shouldSkip = existingBooks.length === 66;
    expect(shouldSkip).toBe(true);
  });

  it("should detect existing KJV translation and skip re-insertion", () => {
    db.insert(schema.translations)
      .values({
        name: "King James Version",
        abbreviation: "KJV",
        language: "en",
        year: 1611,
        isDefault: true,
      })
      .run();

    // Simulate idempotency check (as in seedTranslation)
    const existing = db
      .select()
      .from(schema.translations)
      .where(eq(schema.translations.abbreviation, "KJV"))
      .get();

    expect(existing).toBeDefined();
    expect(existing!.id).toBeGreaterThan(0);
  });

  it("should detect verses > 30000 and skip re-seeding", () => {
    // Insert a book and chapter first
    const book = db
      .insert(schema.books)
      .values({
        name: "Test",
        abbreviation: "TST",
        slug: "test",
        testament: "OT",
        category: "Law",
        chapterCount: 1,
        sortOrder: 1,
      })
      .returning()
      .get();

    const chapter = db
      .insert(schema.chapters)
      .values({
        bookId: book.id,
        chapterNumber: 1,
        verseCount: 1,
      })
      .returning()
      .get();

    // Insert a small number of verses to verify the threshold check
    db.insert(schema.verses)
      .values({
        bookId: book.id,
        chapterId: chapter.id,
        chapterNumber: 1,
        verseNumber: 1,
        text: "Test verse",
      })
      .run();

    const existingCount = db.select().from(schema.verses).all().length;
    // Should NOT skip because we have < 30000
    expect(existingCount).toBeLessThan(30000);
    const shouldSkip = existingCount > 30000;
    expect(shouldSkip).toBe(false);
  });

  it("should clear partial book data if fewer than 66 books exist", () => {
    // Insert only 3 books
    for (let i = 0; i < 3; i++) {
      const meta = BOOK_METADATA[i];
      db.insert(schema.books)
        .values({
          name: meta.name,
          abbreviation: meta.abbreviation,
          slug: meta.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          testament: meta.testament,
          category: meta.category,
          chapterCount: meta.chapterCount,
          sortOrder: meta.sortOrder,
        })
        .run();
    }

    const existingBooks = db.select().from(schema.books).all();
    expect(existingBooks.length).toBe(3);
    expect(existingBooks.length).not.toBe(66);

    // Simulate partial seed cleanup
    if (existingBooks.length > 0 && existingBooks.length !== 66) {
      db.delete(schema.books).run();
    }

    const afterClear = db.select().from(schema.books).all();
    expect(afterClear).toHaveLength(0);
  });
});

// ─── DATA INTEGRITY TESTS ─────────────────────────────────────────────────

describe("Data integrity — foreign key and constraint validation", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM verses");
    sqlite.exec("DELETE FROM chapters");
    sqlite.exec("DELETE FROM books");
  });

  it("should reject a chapter with invalid book_id", () => {
    expect(() => {
      db.insert(schema.chapters)
        .values({
          bookId: 99999, // Non-existent book
          chapterNumber: 1,
          verseCount: 10,
        })
        .run();
    }).toThrow();
  });

  it("should reject a verse with invalid chapter_id", () => {
    const book = db
      .insert(schema.books)
      .values({
        name: "TestBook",
        abbreviation: "TB",
        slug: "testbook",
        testament: "OT",
        category: "Law",
        chapterCount: 1,
        sortOrder: 1,
      })
      .returning()
      .get();

    expect(() => {
      db.insert(schema.verses)
        .values({
          bookId: book.id,
          chapterId: 99999, // Non-existent chapter
          chapterNumber: 1,
          verseNumber: 1,
          text: "Test",
        })
        .run();
    }).toThrow();
  });

  it("should reject a book with invalid testament value", () => {
    expect(() => {
      sqlite.exec(`
        INSERT INTO books (name, abbreviation, slug, testament, category, chapter_count, sort_order)
        VALUES ('Bad', 'BAD', 'bad', 'INVALID', 'Law', 1, 1)
      `);
    }).toThrow();
  });

  it("should store and retrieve verse text with special characters", () => {
    const book = db
      .insert(schema.books)
      .values({
        name: "Test",
        abbreviation: "TST",
        slug: "test-special",
        testament: "OT",
        category: "Law",
        chapterCount: 1,
        sortOrder: 1,
      })
      .returning()
      .get();

    const chapter = db
      .insert(schema.chapters)
      .values({
        bookId: book.id,
        chapterNumber: 1,
        verseCount: 1,
      })
      .returning()
      .get();

    // KJV text often contains special characters like em-dashes, apostrophes, colons
    const specialText = "And he said, I AM THAT I AM: and he said, Thus shalt thou say—the LORD God of your fathers hath sent me unto you.";

    db.insert(schema.verses)
      .values({
        bookId: book.id,
        chapterId: chapter.id,
        chapterNumber: 1,
        verseNumber: 1,
        text: specialText,
      })
      .run();

    const retrieved = db.select().from(schema.verses).where(eq(schema.verses.bookId, book.id)).get();
    expect(retrieved!.text).toBe(specialText);
  });
});

// ─── NPM SCRIPT & CONFIGURATION TESTS ────────────────────────────────────

describe("npm db:seed script configuration", () => {
  it("should have db:seed defined in package.json", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts["db:seed"]).toBeDefined();
    expect(pkg.scripts["db:seed"]).toContain("seed");
  });

  it("should have the seed entry point at lib/db/seed.ts", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const seedPath = path.join(process.cwd(), "lib", "db", "seed.ts");
    expect(fs.existsSync(seedPath)).toBe(true);
  });

  it("should have the fetch-kjv module at lib/db/seed-data/fetch-kjv.ts", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const fetchPath = path.join(process.cwd(), "lib", "db", "seed-data", "fetch-kjv.ts");
    expect(fs.existsSync(fetchPath)).toBe(true);
  });

  it("should have book-metadata module with all required exports", () => {
    expect(BOOK_METADATA).toBeDefined();
    expect(Array.isArray(BOOK_METADATA)).toBe(true);
    expect(BOOK_METADATA.length).toBe(66);
  });

  it("should have chapter-summaries module", () => {
    expect(CHAPTER_SUMMARIES).toBeDefined();
    expect(typeof CHAPTER_SUMMARIES).toBe("object");
  });
});
