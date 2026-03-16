import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

/**
 * Integration tests for lib/db/queries.ts
 *
 * Uses an in-memory SQLite database with Drizzle ORM.
 * We mock the connection module so every query function uses
 * our test database instead of the real file-based one.
 */

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

// ─── In-memory DB setup ──────────────────────────────────

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

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      artist TEXT,
      year_created TEXT,
      source_url TEXT,
      image_url TEXT,
      attribution TEXT,
      license TEXT DEFAULT 'Public Domain',
      media_type TEXT NOT NULL DEFAULT 'painting'
    );

    CREATE TABLE IF NOT EXISTS media_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
      verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_media_refs_chapter ON media_references(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_media_refs_book ON media_references(book_id);

    CREATE TABLE IF NOT EXISTS evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      date_discovered TEXT,
      location_found TEXT,
      current_location TEXT,
      significance TEXT,
      image_url TEXT,
      source_url TEXT
    );

    CREATE TABLE IF NOT EXISTS evidence_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evidence_id INTEGER NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
      verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_evidence_refs_chapter ON evidence_references(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_evidence_refs_book ON evidence_references(book_id);

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      location_type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      modern_name TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS location_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
      verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_location_refs_chapter ON location_references(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_location_refs_book ON location_references(book_id);

    CREATE TABLE IF NOT EXISTS journeys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      person_name TEXT,
      color TEXT DEFAULT '#C4975C'
    );

    CREATE TABLE IF NOT EXISTS journey_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journey_id INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
      location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
      stop_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      scripture_ref TEXT,
      latitude REAL,
      longitude REAL
    );

    CREATE TABLE IF NOT EXISTS dictionary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      definition TEXT NOT NULL,
      modern_equivalent TEXT,
      part_of_speech TEXT,
      pronunciation TEXT,
      usage_notes TEXT,
      example_verse_id INTEGER REFERENCES verses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS cross_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_verse_id INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
      target_verse_id INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
      relationship TEXT NOT NULL,
      note TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_cross_refs_source ON cross_references(source_verse_id);
    CREATE INDEX IF NOT EXISTS idx_cross_refs_target ON cross_references(target_verse_id);

    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      also_known_as TEXT,
      description TEXT,
      birth_ref TEXT,
      death_ref TEXT,
      father_id INTEGER,
      mother_id INTEGER,
      tribe_or_group TEXT
    );

    CREATE TABLE IF NOT EXISTS people_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
      verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_people_refs_chapter ON people_references(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_people_refs_book ON people_references(book_id);

    CREATE TABLE IF NOT EXISTS reading_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      duration_days INTEGER NOT NULL,
      schedule TEXT NOT NULL
    );
  `);
}

// Mock the connection module BEFORE importing queries
vi.mock("@/lib/db/connection", () => {
  // These will be set in beforeAll
  return {
    get db() {
      return db;
    },
    getRawDb: () => sqlite,
  };
});

// Import queries AFTER mocking
let queries: typeof import("@/lib/db/queries");

beforeAll(async () => {
  sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  applySchema(sqlite);
  db = drizzle(sqlite, { schema });

  // Dynamically import so the mock is in place
  queries = await import("@/lib/db/queries");

  // ─── Seed minimal test data ───────────────────────────

  // Books
  sqlite.exec(`
    INSERT INTO books (name, abbreviation, slug, testament, category, chapter_count, author, description, sort_order)
    VALUES
      ('Genesis', 'Gen', 'genesis', 'OT', 'Law', 50, 'Moses', 'The book of beginnings', 1),
      ('Exodus',  'Exo', 'exodus',  'OT', 'Law', 40, 'Moses', 'The book of deliverance', 2),
      ('Matthew', 'Mat', 'matthew', 'NT', 'Gospel', 28, 'Matthew', 'First gospel', 40);
  `);

  // Chapters
  sqlite.exec(`
    INSERT INTO chapters (book_id, chapter_number, verse_count, summary) VALUES
      (1, 1, 31, 'Creation'),
      (1, 2, 25, 'Garden of Eden'),
      (2, 1, 22, 'Israel in Egypt'),
      (3, 1, 25, 'Genealogy of Jesus');
  `);

  // Verses (minimal set)
  sqlite.exec(`
    INSERT INTO verses (book_id, chapter_id, chapter_number, verse_number, text) VALUES
      (1, 1, 1, 1, 'In the beginning God created the heaven and the earth.'),
      (1, 1, 1, 2, 'And the earth was without form, and void; and darkness was upon the face of the deep.'),
      (1, 1, 1, 3, 'And God said, Let there be light: and there was light.'),
      (1, 1, 1, 4, 'And God saw the light, that it was good: and God divided the light from the darkness.'),
      (1, 1, 1, 5, 'And God called the light Day, and the darkness he called Night.'),
      (1, 2, 2, 1, 'Thus the heavens and the earth were finished, and all the host of them.'),
      (2, 3, 1, 1, 'Now these are the names of the children of Israel.'),
      (3, 4, 1, 1, 'The book of the generation of Jesus Christ, the son of David.');
  `);

  // Cross references
  sqlite.exec(`
    INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note) VALUES
      (1, 8, 'parallel', 'Creation and Christ'),
      (1, 6, 'parallel', 'Beginning and completion');
  `);

  // Dictionary
  sqlite.exec(`
    INSERT INTO dictionary (word, slug, definition, modern_equivalent, part_of_speech, pronunciation, usage_notes, example_verse_id) VALUES
      ('Atonement', 'atonement', 'Reconciliation between God and humanity', 'Reconciliation', 'noun', 'uh-TONE-ment', 'Used in sacrificial context', 1),
      ('Covenant', 'covenant', 'A binding agreement between God and man', 'Agreement', 'noun', 'KUV-uh-nunt', 'Central theme of scripture', NULL),
      ('Baptism', 'baptism', 'Ritual washing symbolizing purification', 'Immersion', 'noun', 'BAP-tiz-um', 'Christian sacrament', NULL),
      ('Grace', 'grace', 'Unmerited favor from God', 'Mercy', 'noun', 'GRAYS', 'Key NT concept', NULL);
  `);

  // Locations
  sqlite.exec(`
    INSERT INTO locations (name, slug, description, location_type, latitude, longitude, modern_name, image_url) VALUES
      ('Jerusalem', 'jerusalem', 'Holy city', 'city', 31.7683, 35.2137, 'Jerusalem', NULL),
      ('Bethlehem', 'bethlehem', 'Birthplace of Jesus', 'city', 31.7054, 35.2024, 'Bethlehem', NULL),
      ('Mount Sinai', 'mount-sinai', 'Where Moses received the law', 'mountain', 28.5394, 33.9750, 'Jebel Musa', NULL);
  `);

  // Location references
  sqlite.exec(`
    INSERT INTO location_references (location_id, book_id, chapter_id) VALUES
      (1, 1, 1),
      (2, 3, 4),
      (3, 2, 3);
  `);

  // People
  sqlite.exec(`
    INSERT INTO people (name, slug, description, birth_ref, death_ref, father_id, mother_id, tribe_or_group) VALUES
      ('Abraham', 'abraham', 'Father of many nations', 'Genesis 11:26', 'Genesis 25:8', NULL, NULL, 'Hebrew'),
      ('Isaac', 'isaac', 'Son of Abraham', 'Genesis 21:3', 'Genesis 35:29', 1, NULL, 'Hebrew'),
      ('Sarah', 'sarah', 'Wife of Abraham', 'Genesis 11:29', 'Genesis 23:1', NULL, NULL, 'Hebrew'),
      ('Jacob', 'jacob', 'Son of Isaac', 'Genesis 25:26', NULL, 2, NULL, 'Hebrew');
  `);

  // Set Isaac's mother to Sarah
  sqlite.exec(`UPDATE people SET mother_id = 3 WHERE id = 2;`);

  // People references
  sqlite.exec(`
    INSERT INTO people_references (person_id, book_id, chapter_id) VALUES
      (1, 1, 1),
      (2, 1, 1),
      (1, 1, 2);
  `);

  // Media
  sqlite.exec(`
    INSERT INTO media (title, description, artist, year_created, image_url, media_type) VALUES
      ('Creation of Adam', 'Famous ceiling painting', 'Michelangelo', '1512', 'http://example.com/creation.jpg', 'painting'),
      ('The Nativity', 'Birth of Christ', 'Giotto', '1305', 'http://example.com/nativity.jpg', 'painting');
  `);

  // Media references
  sqlite.exec(`
    INSERT INTO media_references (media_id, book_id, chapter_id) VALUES
      (1, 1, 1),
      (2, 3, 4);
  `);

  // Evidence
  sqlite.exec(`
    INSERT INTO evidence (title, slug, description, category, date_discovered, location_found, significance) VALUES
      ('Dead Sea Scrolls', 'dead-sea-scrolls', 'Ancient manuscripts found in caves', 'manuscript', '1947', 'Qumran', 'Oldest known biblical manuscripts'),
      ('Tel Dan Stele', 'tel-dan-stele', 'Inscription mentioning House of David', 'inscription', '1993', 'Tel Dan', 'Extra-biblical reference to David'),
      ('Rosetta Stone', 'rosetta-stone', 'Key to deciphering hieroglyphs', 'artifact', '1799', 'Rosetta', 'Unlocked Egyptian language');
  `);

  // Evidence references
  sqlite.exec(`
    INSERT INTO evidence_references (evidence_id, book_id, chapter_id, verse_id) VALUES
      (1, 1, 1, 1),
      (2, 1, 1, NULL);
  `);

  // Journeys
  sqlite.exec(`
    INSERT INTO journeys (name, slug, description, person_name, color) VALUES
      ('Exodus Journey', 'exodus-journey', 'From Egypt to Canaan', 'Moses', '#FF5733'),
      ('Abrahams Journey', 'abrahams-journey', 'From Ur to Canaan', 'Abraham', '#33FF57');
  `);

  // Journey stops
  sqlite.exec(`
    INSERT INTO journey_stops (journey_id, location_id, stop_order, name, description, scripture_ref, latitude, longitude) VALUES
      (1, 1, 1, 'Egypt', 'Starting point', 'Exodus 1:1', 30.0444, 31.2357),
      (1, 3, 2, 'Mount Sinai', 'Receiving the law', 'Exodus 19:1', 28.5394, 33.9750),
      (1, NULL, 3, 'Kadesh Barnea', 'Wilderness wandering', 'Numbers 13:26', 30.6, 34.4),
      (2, 1, 1, 'Ur', 'Birthplace', 'Genesis 11:31', 30.9627, 46.1025);
  `);
});

afterAll(() => {
  sqlite?.close();
});

// ═══════════════════════════════════════════════════════════
// BOOKS
// ═══════════════════════════════════════════════════════════

describe("getBooks", () => {
  it("returns all books ordered by sort order", async () => {
    const result = await queries.getBooks();
    expect(result).toHaveLength(3);
    expect(result[0].slug).toBe("genesis");
    expect(result[1].slug).toBe("exodus");
    expect(result[2].slug).toBe("matthew");
  });

  it("includes all expected fields on each book", async () => {
    const result = await queries.getBooks();
    const genesis = result[0];
    expect(genesis).toMatchObject({
      name: "Genesis",
      abbreviation: "Gen",
      slug: "genesis",
      testament: "OT",
      category: "Law",
      chapterCount: 50,
      author: "Moses",
    });
  });
});

describe("getBookBySlug", () => {
  it("returns the correct book for a valid slug", async () => {
    const book = await queries.getBookBySlug("genesis");
    expect(book).toBeDefined();
    expect(book!.name).toBe("Genesis");
    expect(book!.testament).toBe("OT");
  });

  it("returns undefined for a non-existent slug", async () => {
    const book = await queries.getBookBySlug("nonexistent-book");
    expect(book).toBeUndefined();
  });

  it("returns undefined for an empty slug", async () => {
    const book = await queries.getBookBySlug("");
    expect(book).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════
// CHAPTERS & VERSES
// ═══════════════════════════════════════════════════════════

describe("getChapter", () => {
  it("returns the chapter for valid book slug and chapter number", async () => {
    const chapter = await queries.getChapter("genesis", 1);
    expect(chapter).toBeDefined();
    expect(chapter!.chapterNumber).toBe(1);
    expect(chapter!.verseCount).toBe(31);
    expect(chapter!.summary).toBe("Creation");
  });

  it("returns undefined when book does not exist", async () => {
    const chapter = await queries.getChapter("fake-book", 1);
    expect(chapter).toBeUndefined();
  });

  it("returns undefined when chapter number does not exist in book", async () => {
    const chapter = await queries.getChapter("genesis", 999);
    expect(chapter).toBeUndefined();
  });
});

describe("getVerse", () => {
  it("returns the correct verse for valid book, chapter, and verse numbers", async () => {
    const verse = await queries.getVerse("genesis", 1, 1);
    expect(verse).toBeDefined();
    expect(verse!.text).toContain("In the beginning");
    expect(verse!.chapterNumber).toBe(1);
    expect(verse!.verseNumber).toBe(1);
  });

  it("returns undefined when verse does not exist", async () => {
    const verse = await queries.getVerse("genesis", 1, 999);
    expect(verse).toBeUndefined();
  });

  it("returns undefined when book does not exist", async () => {
    const verse = await queries.getVerse("nonexistent", 1, 1);
    expect(verse).toBeUndefined();
  });
});

describe("getChapterVerses", () => {
  it("returns all verses in a chapter ordered by verse number", async () => {
    const result = await queries.getChapterVerses("genesis", 1);
    expect(result).toHaveLength(5);
    expect(result[0].verseNumber).toBe(1);
    expect(result[4].verseNumber).toBe(5);
  });

  it("returns empty array when book does not exist", async () => {
    const result = await queries.getChapterVerses("fake-book", 1);
    expect(result).toEqual([]);
  });

  it("returns empty array when chapter has no verses", async () => {
    // Chapter 2 of Exodus has no verses in our seed data
    const result = await queries.getChapterVerses("exodus", 99);
    expect(result).toEqual([]);
  });
});

describe("getSurroundingVerses", () => {
  it("returns surrounding verses excluding the target verse", async () => {
    const result = await queries.getSurroundingVerses("genesis", 1, 3, 1);
    // Should return verse 2 and 4 but not 3
    expect(result.map((v) => v.verseNumber)).toEqual(
      expect.arrayContaining([2, 4]),
    );
    expect(result.find((v) => v.verseNumber === 3)).toBeUndefined();
  });

  it("returns empty array for non-existent book", async () => {
    const result = await queries.getSurroundingVerses("fake", 1, 1);
    expect(result).toEqual([]);
  });

  it("handles edge case at beginning of chapter (verse 1)", async () => {
    const result = await queries.getSurroundingVerses("genesis", 1, 1, 1);
    // Only verse 2 should be returned (no verse 0, and verse 1 is excluded)
    expect(result.every((v) => v.verseNumber !== 1)).toBe(true);
    expect(result.some((v) => v.verseNumber === 2)).toBe(true);
  });
});

describe("getChapterVerseCount", () => {
  it("returns the correct verse count for a chapter", async () => {
    const count = await queries.getChapterVerseCount("genesis", 1);
    expect(count).toBe(31);
  });

  it("returns 0 for non-existent book", async () => {
    const count = await queries.getChapterVerseCount("fake", 1);
    expect(count).toBe(0);
  });

  it("returns 0 for non-existent chapter", async () => {
    const count = await queries.getChapterVerseCount("genesis", 999);
    expect(count).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// CROSS REFERENCES
// ═══════════════════════════════════════════════════════════

describe("getCrossReferences", () => {
  it("returns cross-references with target verse details", async () => {
    const refs = await queries.getCrossReferences(1); // verse 1 (Gen 1:1)
    expect(refs).toHaveLength(2);
    expect(refs[0]).toHaveProperty("targetBook");
    expect(refs[0]).toHaveProperty("targetBookSlug");
    expect(refs[0]).toHaveProperty("targetChapter");
    expect(refs[0]).toHaveProperty("targetVerse");
    expect(refs[0]).toHaveProperty("targetText");
    expect(refs[0]).toHaveProperty("relationship");
  });

  it("returns empty array for a verse with no cross-references", async () => {
    const refs = await queries.getCrossReferences(999);
    expect(refs).toEqual([]);
  });
});

describe("getChapterCrossReferences", () => {
  it("returns cross-references for all verses in a chapter", async () => {
    const refs = await queries.getChapterCrossReferences("genesis", 1);
    expect(refs.length).toBeGreaterThan(0);
    expect(refs[0]).toHaveProperty("sourceVerseNumber");
  });

  it("returns empty array when the chapter has no verses", async () => {
    const refs = await queries.getChapterCrossReferences("genesis", 999);
    expect(refs).toEqual([]);
  });

  it("returns empty array for non-existent book", async () => {
    const refs = await queries.getChapterCrossReferences("fake-book", 1);
    expect(refs).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════
// DICTIONARY
// ═══════════════════════════════════════════════════════════

describe("getDictionaryWord", () => {
  it("returns the word for a valid slug", async () => {
    const word = await queries.getDictionaryWord("atonement");
    expect(word).toBeDefined();
    expect(word!.word).toBe("Atonement");
    expect(word!.definition).toContain("Reconciliation");
  });

  it("returns undefined for a non-existent slug", async () => {
    const word = await queries.getDictionaryWord("nonexistent");
    expect(word).toBeUndefined();
  });
});

describe("getDictionaryWords", () => {
  it("returns all dictionary words alphabetically", async () => {
    const words = await queries.getDictionaryWords();
    expect(words).toHaveLength(4);
    expect(words[0].word).toBe("Atonement");
    expect(words[1].word).toBe("Baptism");
  });
});

describe("getDictionaryWordsByLetter", () => {
  it("filters words by starting letter", async () => {
    const words = await queries.getDictionaryWordsByLetter("a");
    expect(words.length).toBeGreaterThanOrEqual(1);
    words.forEach((w) => {
      expect(w.slug.toLowerCase().startsWith("a")).toBe(true);
    });
  });

  it("returns empty array for letter with no words", async () => {
    const words = await queries.getDictionaryWordsByLetter("z");
    expect(words).toEqual([]);
  });
});

describe("searchDictionaryWords", () => {
  it("finds words matching a partial query", async () => {
    const results = await queries.searchDictionaryWords("grace");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].word).toBe("Grace");
  });

  it("returns empty array for empty query", async () => {
    const results = await queries.searchDictionaryWords("");
    expect(results).toEqual([]);
  });

  it("returns empty array for whitespace-only query", async () => {
    const results = await queries.searchDictionaryWords("   ");
    expect(results).toEqual([]);
  });

  it("returns empty array for no matches", async () => {
    const results = await queries.searchDictionaryWords("zzzznotaword");
    expect(results).toEqual([]);
  });
});

describe("getDictionaryWordWithVerse", () => {
  it("returns the word with example verse when it exists", async () => {
    const result = await queries.getDictionaryWordWithVerse("atonement");
    expect(result).toBeDefined();
    expect(result!.word).toBe("Atonement");
    expect(result!.exampleVerse).toBeDefined();
    expect(result!.exampleVerse!.text).toContain("In the beginning");
    expect(result!.exampleVerse!.bookName).toBe("Genesis");
    expect(result!.exampleVerse!.bookSlug).toBe("genesis");
  });

  it("returns the word with undefined exampleVerse when no verse is linked", async () => {
    const result = await queries.getDictionaryWordWithVerse("covenant");
    expect(result).toBeDefined();
    expect(result!.word).toBe("Covenant");
    expect(result!.exampleVerse).toBeUndefined();
  });

  it("returns undefined for non-existent word", async () => {
    const result = await queries.getDictionaryWordWithVerse("nonexistent");
    expect(result).toBeUndefined();
  });
});

describe("getDictionaryLetters", () => {
  it("returns sorted unique first letters", async () => {
    const letters = await queries.getDictionaryLetters();
    expect(letters).toEqual(["A", "B", "C", "G"]);
  });
});

// ═══════════════════════════════════════════════════════════
// LOCATIONS
// ═══════════════════════════════════════════════════════════

describe("getLocationsByChapter", () => {
  it("returns locations referenced in the given chapter", async () => {
    const locs = await queries.getLocationsByChapter("genesis", 1);
    expect(locs).toHaveLength(1);
    expect(locs[0].name).toBe("Jerusalem");
  });

  it("returns empty array for non-existent book", async () => {
    const locs = await queries.getLocationsByChapter("fake", 1);
    expect(locs).toEqual([]);
  });

  it("returns empty array for chapter with no location references", async () => {
    const locs = await queries.getLocationsByChapter("genesis", 2);
    expect(locs).toEqual([]);
  });
});

describe("getAllLocations", () => {
  it("returns all locations ordered by name", async () => {
    const locs = await queries.getAllLocations();
    expect(locs).toHaveLength(3);
    expect(locs[0].name).toBe("Bethlehem");
    expect(locs[1].name).toBe("Jerusalem");
    expect(locs[2].name).toBe("Mount Sinai");
  });

  it("includes coordinate data", async () => {
    const locs = await queries.getAllLocations();
    for (const loc of locs) {
      expect(typeof loc.latitude).toBe("number");
      expect(typeof loc.longitude).toBe("number");
    }
  });
});

describe("getAllLocationSlugs", () => {
  it("returns all location slugs for sitemap generation", async () => {
    const slugs = await queries.getAllLocationSlugs();
    expect(slugs).toHaveLength(3);
    expect(slugs.map((s) => s.slug)).toEqual(
      expect.arrayContaining(["jerusalem", "bethlehem", "mount-sinai"]),
    );
  });
});

describe("getLocationsWithBookRefs", () => {
  it("returns locations enriched with testament and book data", async () => {
    const locs = await queries.getLocationsWithBookRefs();
    expect(locs.length).toBeGreaterThan(0);
    const jerusalem = locs.find((l) => l.slug === "jerusalem");
    expect(jerusalem).toBeDefined();
    expect(jerusalem!.testaments).toEqual(expect.arrayContaining(["OT"]));
    expect(jerusalem!.bookSlugs).toEqual(expect.arrayContaining(["genesis"]));
  });

  it("returns empty arrays for locations without references", async () => {
    // Bethlehem is referenced by Matthew (NT)
    const locs = await queries.getLocationsWithBookRefs();
    const bethlehem = locs.find((l) => l.slug === "bethlehem");
    expect(bethlehem).toBeDefined();
    expect(bethlehem!.testaments).toEqual(expect.arrayContaining(["NT"]));
  });
});

// ═══════════════════════════════════════════════════════════
// PEOPLE
// ═══════════════════════════════════════════════════════════

describe("getPeopleByChapter", () => {
  it("returns people referenced in a chapter", async () => {
    const result = await queries.getPeopleByChapter("genesis", 1);
    expect(result.length).toBeGreaterThanOrEqual(1);
    const names = result.map((p) => p.name);
    expect(names).toContain("Abraham");
  });

  it("returns empty array for chapter with no people refs", async () => {
    const result = await queries.getPeopleByChapter("exodus", 1);
    expect(result).toEqual([]);
  });

  it("returns empty array for non-existent book", async () => {
    const result = await queries.getPeopleByChapter("fake", 1);
    expect(result).toEqual([]);
  });
});

describe("getPerson", () => {
  it("returns a person with parent information", async () => {
    const person = await queries.getPerson("isaac");
    expect(person).toBeDefined();
    expect(person!.name).toBe("Isaac");
    expect(person!.father).toBeDefined();
    expect(person!.father!.name).toBe("Abraham");
    expect(person!.mother).toBeDefined();
    expect(person!.mother!.name).toBe("Sarah");
  });

  it("returns undefined for non-existent slug", async () => {
    const person = await queries.getPerson("nonexistent");
    expect(person).toBeUndefined();
  });

  it("returns null parents for people without parents", async () => {
    const person = await queries.getPerson("abraham");
    expect(person).toBeDefined();
    expect(person!.father).toBeNull();
    expect(person!.mother).toBeNull();
  });
});

describe("getAllPeople", () => {
  it("returns all people ordered alphabetically", async () => {
    const result = await queries.getAllPeople();
    expect(result).toHaveLength(4);
    expect(result[0].name).toBe("Abraham");
    expect(result[3].name).toBe("Sarah");
  });
});

describe("getPersonChildren", () => {
  it("returns children of a person", async () => {
    const children = await queries.getPersonChildren(1); // Abraham
    expect(children.length).toBeGreaterThanOrEqual(1);
    expect(children.map((c) => c.name)).toContain("Isaac");
  });

  it("returns empty array for person with no children", async () => {
    const children = await queries.getPersonChildren(4); // Jacob (no children in seed)
    expect(children).toEqual([]);
  });
});

describe("getPersonSiblings", () => {
  it("returns siblings (same father) excluding self", async () => {
    // Isaac (id=2) has father Abraham (id=1). Jacob (id=4) also has father Isaac (id=2).
    // Isaac has no siblings in our data
    const siblings = await queries.getPersonSiblings(2, 1);
    // No other children of Abraham in our seed
    expect(siblings).toEqual([]);
  });

  it("returns empty array when fatherId is null", async () => {
    const siblings = await queries.getPersonSiblings(1, null);
    expect(siblings).toEqual([]);
  });
});

describe("getAllPeopleSlugs", () => {
  it("returns all people slugs", async () => {
    const slugs = await queries.getAllPeopleSlugs();
    expect(slugs).toHaveLength(4);
    expect(slugs.map((s) => s.slug)).toEqual(
      expect.arrayContaining(["abraham", "isaac", "sarah", "jacob"]),
    );
  });
});

// ═══════════════════════════════════════════════════════════
// MEDIA
// ═══════════════════════════════════════════════════════════

describe("getMediaByChapter", () => {
  it("returns media for a chapter that has media references", async () => {
    const result = await queries.getMediaByChapter("genesis", 1);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Creation of Adam");
    expect(result[0].artist).toBe("Michelangelo");
  });

  it("returns empty array for chapter with no media", async () => {
    const result = await queries.getMediaByChapter("genesis", 2);
    expect(result).toEqual([]);
  });

  it("returns empty array for non-existent book", async () => {
    const result = await queries.getMediaByChapter("fake", 1);
    expect(result).toEqual([]);
  });
});

describe("getPersonMedia", () => {
  it("returns media related to a person through book references", async () => {
    const result = await queries.getPersonMedia(1); // Abraham is in Genesis
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty array for person with no references", async () => {
    const result = await queries.getPersonMedia(999);
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════
// EVIDENCE
// ═══════════════════════════════════════════════════════════

describe("getEvidenceByChapter", () => {
  it("returns evidence for a chapter", async () => {
    const result = await queries.getEvidenceByChapter("genesis", 1);
    expect(result.length).toBeGreaterThanOrEqual(1);
    const titles = result.map((e) => e.title);
    expect(titles).toContain("Dead Sea Scrolls");
  });

  it("returns empty array for chapter with no evidence", async () => {
    const result = await queries.getEvidenceByChapter("genesis", 2);
    expect(result).toEqual([]);
  });

  it("returns empty array for non-existent book", async () => {
    const result = await queries.getEvidenceByChapter("fake", 1);
    expect(result).toEqual([]);
  });
});

describe("getAllEvidence", () => {
  it("returns all evidence when no category filter", async () => {
    const result = await queries.getAllEvidence();
    expect(result).toHaveLength(3);
  });

  it("filters by valid category", async () => {
    const result = await queries.getAllEvidence("manuscript");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Dead Sea Scrolls");
  });

  it("returns all evidence for invalid category", async () => {
    const result = await queries.getAllEvidence("invalid-category");
    expect(result).toHaveLength(3);
  });
});

describe("getEvidenceBySlug", () => {
  it("returns evidence with scripture references", async () => {
    const result = await queries.getEvidenceBySlug("dead-sea-scrolls");
    expect(result).toBeDefined();
    expect(result!.title).toBe("Dead Sea Scrolls");
    expect(result!.references).toBeDefined();
    expect(result!.references.length).toBeGreaterThanOrEqual(1);
  });

  it("returns undefined for non-existent slug", async () => {
    const result = await queries.getEvidenceBySlug("nonexistent");
    expect(result).toBeUndefined();
  });
});

describe("getEvidenceCategoryCounts", () => {
  it("returns correct counts per category", async () => {
    const counts = await queries.getEvidenceCategoryCounts();
    expect(counts).toHaveProperty("manuscript");
    expect(counts.manuscript).toBe(1);
    expect(counts.inscription).toBe(1);
    expect(counts.artifact).toBe(1);
  });
});

describe("getAllEvidenceSlugs", () => {
  it("returns all evidence slugs", async () => {
    const slugs = await queries.getAllEvidenceSlugs();
    expect(slugs).toHaveLength(3);
    expect(slugs.map((s) => s.slug)).toEqual(
      expect.arrayContaining(["dead-sea-scrolls", "tel-dan-stele", "rosetta-stone"]),
    );
  });
});

// ═══════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════

describe("searchVerses", () => {
  it("finds verses matching a text query", async () => {
    const results = await queries.searchVerses("beginning");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].text).toContain("beginning");
    expect(results[0]).toHaveProperty("bookName");
    expect(results[0]).toHaveProperty("bookSlug");
  });

  it("returns empty array for empty query", async () => {
    const results = await queries.searchVerses("");
    expect(results).toEqual([]);
  });

  it("returns empty array for whitespace-only query", async () => {
    const results = await queries.searchVerses("   ");
    expect(results).toEqual([]);
  });

  it("respects the limit parameter", async () => {
    const results = await queries.searchVerses("God", 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it("returns empty array for no matches", async () => {
    const results = await queries.searchVerses("xyznonexistentphrase");
    expect(results).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════
// JOURNEYS
// ═══════════════════════════════════════════════════════════

describe("getJourneys", () => {
  it("returns all journeys ordered by name", async () => {
    const result = await queries.getJourneys();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Abrahams Journey");
    expect(result[1].name).toBe("Exodus Journey");
  });
});

describe("getAllJourneySlugs", () => {
  it("returns all journey slugs", async () => {
    const slugs = await queries.getAllJourneySlugs();
    expect(slugs).toHaveLength(2);
    expect(slugs.map((s) => s.slug)).toEqual(
      expect.arrayContaining(["exodus-journey", "abrahams-journey"]),
    );
  });
});

describe("getJourneyWithStops", () => {
  it("returns a journey with all stops ordered by stop order", async () => {
    const result = await queries.getJourneyWithStops("exodus-journey");
    expect(result).toBeDefined();
    expect(result!.name).toBe("Exodus Journey");
    expect(result!.stops).toHaveLength(3);
    expect(result!.stops[0].stopOrder).toBe(1);
    expect(result!.stops[1].stopOrder).toBe(2);
    expect(result!.stops[2].stopOrder).toBe(3);
  });

  it("includes location info via left join", async () => {
    const result = await queries.getJourneyWithStops("exodus-journey");
    expect(result!.stops[0].locationName).toBe("Jerusalem");
    // Stop 3 has no location_id
    expect(result!.stops[2].locationName).toBeNull();
  });

  it("returns undefined for non-existent journey", async () => {
    const result = await queries.getJourneyWithStops("nonexistent");
    expect(result).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════
// BOOK-LEVEL AGGREGATION
// ═══════════════════════════════════════════════════════════

describe("getBookPeople", () => {
  it("returns distinct people referenced in a book", async () => {
    const result = await queries.getBookPeople("genesis");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.map((p) => p.name)).toContain("Abraham");
  });

  it("returns empty array for non-existent book", async () => {
    const result = await queries.getBookPeople("fake");
    expect(result).toEqual([]);
  });
});

describe("getBookLocations", () => {
  it("returns distinct locations for a book", async () => {
    const result = await queries.getBookLocations("genesis");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.map((l) => l.name)).toContain("Jerusalem");
  });

  it("returns empty array for non-existent book", async () => {
    const result = await queries.getBookLocations("fake");
    expect(result).toEqual([]);
  });
});

describe("getBookMedia", () => {
  it("returns distinct media for a book", async () => {
    const result = await queries.getBookMedia("genesis");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].title).toBe("Creation of Adam");
  });

  it("returns empty array for non-existent book", async () => {
    const result = await queries.getBookMedia("fake");
    expect(result).toEqual([]);
  });
});

describe("getBookEvidence", () => {
  it("returns distinct evidence for a book", async () => {
    const result = await queries.getBookEvidence("genesis");
    expect(result.length).toBeGreaterThanOrEqual(1);
    const titles = result.map((e) => e.title);
    expect(titles).toContain("Dead Sea Scrolls");
  });

  it("returns empty array for non-existent book", async () => {
    const result = await queries.getBookEvidence("fake");
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════
// SITEMAP QUERIES
// ═══════════════════════════════════════════════════════════

describe("getSitemapChapters", () => {
  it("returns all chapters with book slugs for sitemap generation", async () => {
    const result = await queries.getSitemapChapters();
    expect(result.length).toBeGreaterThanOrEqual(4);
    expect(result[0]).toHaveProperty("bookSlug");
    expect(result[0]).toHaveProperty("chapterNumber");
    expect(result[0]).toHaveProperty("verseCount");
  });

  it("orders by book sort order then chapter number", async () => {
    const result = await queries.getSitemapChapters();
    expect(result[0].bookSlug).toBe("genesis");
    expect(result[0].chapterNumber).toBe(1);
    expect(result[1].bookSlug).toBe("genesis");
    expect(result[1].chapterNumber).toBe(2);
  });
});

describe("getAllDictionarySlugs", () => {
  it("returns all dictionary slugs", async () => {
    const slugs = await queries.getAllDictionarySlugs();
    expect(slugs).toHaveLength(4);
    expect(slugs.map((s) => s.slug)).toEqual(
      expect.arrayContaining(["atonement", "covenant", "baptism", "grace"]),
    );
  });
});
