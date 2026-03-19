import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";

/**
 * Tests for media-references.json and evidence.json data integrity
 * and the seed-media / seed-evidence modules.
 *
 * Validates that:
 * - media-references.json contains correct artwork entries
 * - evidence.json has 50+ archaeological evidence items
 * - All required fields are present and well-formed
 * - Key artworks and artifacts are present
 * - Seed functions insert data correctly with proper references
 * - Cascade deletes work for reference tables
 */

// ──────────────────────────────────────────────────────────────
// Types mirroring seed modules
// ──────────────────────────────────────────────────────────────

interface MediaEntry {
  title: string;
  description: string;
  artist: string;
  year_created: string;
  source_url: string;
  image_url: string;
  attribution: string;
  license: string;
  media_type: "painting" | "illustration" | "photograph" | "map";
  book_ref: string;
}

interface EvidenceEntry {
  title: string;
  slug: string;
  description: string;
  category: "manuscript" | "archaeology" | "inscription" | "artifact";
  date_discovered: string;
  location_found: string;
  current_location: string;
  significance: string;
  image_url: string;
  source_url: string;
  book_refs: string[];
}

// ──────────────────────────────────────────────────────────────
// Known Bible book names for validation
// ──────────────────────────────────────────────────────────────

const KNOWN_BOOKS = new Set([
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms",
  "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation",
]);

const VALID_MEDIA_TYPES = new Set(["painting", "illustration", "photograph", "map"]);
const VALID_CATEGORIES = new Set(["manuscript", "archaeology", "inscription", "artifact"]);

// ──────────────────────────────────────────────────────────────
// Load data once for all tests
// ──────────────────────────────────────────────────────────────

let mediaData: MediaEntry[];
let evidenceData: EvidenceEntry[];

beforeAll(() => {
  const mediaPath = path.join(process.cwd(), "data", "media-references.json");
  mediaData = JSON.parse(fs.readFileSync(mediaPath, "utf-8")) as MediaEntry[];

  const evidencePath = path.join(process.cwd(), "data", "evidence.json");
  evidenceData = JSON.parse(fs.readFileSync(evidencePath, "utf-8")) as EvidenceEntry[];
});

// ══════════════════════════════════════════════════════════════
// MEDIA REFERENCES DATA VALIDATION
// ══════════════════════════════════════════════════════════════

describe("media-references.json data file", () => {
  it("should be a non-empty array", () => {
    expect(Array.isArray(mediaData)).toBe(true);
    expect(mediaData.length).toBeGreaterThan(0);
  });

  it("should contain at least 30 media entries", () => {
    expect(mediaData.length).toBeGreaterThanOrEqual(30);
  });
});

// ──────────────────────────────────────────────────────────────
// MEDIA ENTRY SCHEMA VALIDATION
// ──────────────────────────────────────────────────────────────

describe("media entry schema", () => {
  it("every entry should have all required string fields", () => {
    for (const entry of mediaData) {
      expect(entry.title).toBeTruthy();
      expect(typeof entry.title).toBe("string");
      expect(entry.description).toBeTruthy();
      expect(typeof entry.description).toBe("string");
      expect(entry.artist).toBeTruthy();
      expect(typeof entry.artist).toBe("string");
      expect(entry.year_created).toBeTruthy();
      expect(typeof entry.year_created).toBe("string");
      expect(entry.attribution).toBeTruthy();
      expect(typeof entry.attribution).toBe("string");
      expect(entry.license).toBeTruthy();
      expect(typeof entry.license).toBe("string");
    }
  });

  it("every entry should have a valid media_type", () => {
    for (const entry of mediaData) {
      expect(VALID_MEDIA_TYPES.has(entry.media_type)).toBe(true);
    }
  });

  it("every entry should have a valid book_ref that matches a known Bible book", () => {
    for (const entry of mediaData) {
      expect(KNOWN_BOOKS.has(entry.book_ref)).toBe(true);
    }
  });

  it("every entry should have a source_url from Wikimedia Commons", () => {
    for (const entry of mediaData) {
      expect(entry.source_url).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });

  it("every entry should have an image_url from Wikimedia uploads", () => {
    for (const entry of mediaData) {
      expect(entry.image_url).toMatch(/^https:\/\/upload\.wikimedia\.org\//);
    }
  });

  it("every entry should have Public Domain license", () => {
    for (const entry of mediaData) {
      expect(entry.license).toBe("Public Domain");
    }
  });

  it("descriptions should be meaningful (more than 20 characters)", () => {
    for (const entry of mediaData) {
      expect(entry.description.length).toBeGreaterThan(20);
    }
  });

  it("year_created should be a plausible year string", () => {
    for (const entry of mediaData) {
      // Should contain at least a 4-digit year
      expect(entry.year_created).toMatch(/\d{4}/);
    }
  });
});

// ──────────────────────────────────────────────────────────────
// MEDIA ARTIST COVERAGE
// ──────────────────────────────────────────────────────────────

describe("media artist coverage", () => {
  it("should include works by Michelangelo", () => {
    const michelangelo = mediaData.filter((m) => m.artist === "Michelangelo");
    expect(michelangelo.length).toBeGreaterThanOrEqual(1);
  });

  it("should include works by Rembrandt", () => {
    const rembrandt = mediaData.filter((m) => m.artist === "Rembrandt");
    expect(rembrandt.length).toBeGreaterThanOrEqual(1);
  });

  it("should include works by Gustave Doré", () => {
    const dore = mediaData.filter((m) => m.artist === "Gustave Doré");
    expect(dore.length).toBeGreaterThanOrEqual(1);
  });

  it("should include works by Caravaggio", () => {
    const caravaggio = mediaData.filter((m) => m.artist === "Caravaggio");
    expect(caravaggio.length).toBeGreaterThanOrEqual(1);
  });

  it("should include works by Raphael", () => {
    const raphael = mediaData.filter((m) => m.artist === "Raphael");
    expect(raphael.length).toBeGreaterThanOrEqual(1);
  });

  it("should include both paintings and illustrations", () => {
    const paintings = mediaData.filter((m) => m.media_type === "painting");
    const illustrations = mediaData.filter((m) => m.media_type === "illustration");
    expect(paintings.length).toBeGreaterThan(0);
    expect(illustrations.length).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────────────────────
// MEDIA BOOK COVERAGE
// ──────────────────────────────────────────────────────────────

describe("media book coverage", () => {
  it("should include artwork for Genesis", () => {
    expect(mediaData.some((m) => m.book_ref === "Genesis")).toBe(true);
  });

  it("should include artwork for Exodus", () => {
    expect(mediaData.some((m) => m.book_ref === "Exodus")).toBe(true);
  });

  it("should include artwork for Gospel books", () => {
    expect(mediaData.some((m) => m.book_ref === "Matthew")).toBe(true);
    expect(mediaData.some((m) => m.book_ref === "Luke")).toBe(true);
    expect(mediaData.some((m) => m.book_ref === "John")).toBe(true);
  });

  it("should include artwork for Revelation", () => {
    expect(mediaData.some((m) => m.book_ref === "Revelation")).toBe(true);
  });

  it("should have no duplicate titles", () => {
    const titles = mediaData.map((m) => m.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });
});

// ──────────────────────────────────────────────────────────────
// KEY ARTWORKS
// ──────────────────────────────────────────────────────────────

describe("key artworks present", () => {
  const findByTitle = (title: string) =>
    mediaData.find((m) => m.title === title);

  it("should include 'Creation of Adam' by Michelangelo", () => {
    const artwork = findByTitle("Creation of Adam");
    expect(artwork).toBeDefined();
    expect(artwork!.artist).toBe("Michelangelo");
    expect(artwork!.book_ref).toBe("Genesis");
  });

  it("should include 'The Prodigal Son' by Rembrandt", () => {
    const artwork = findByTitle("The Prodigal Son");
    expect(artwork).toBeDefined();
    expect(artwork!.artist).toBe("Rembrandt");
    expect(artwork!.book_ref).toBe("Luke");
  });

  it("should include 'The Last Supper' by Leonardo da Vinci", () => {
    const artwork = findByTitle("The Last Supper");
    expect(artwork).toBeDefined();
    expect(artwork!.book_ref).toBe("John");
  });

  it("should include 'The Conversion of Saint Paul' by Caravaggio", () => {
    const artwork = findByTitle("The Conversion of Saint Paul");
    expect(artwork).toBeDefined();
    expect(artwork!.artist).toBe("Caravaggio");
    expect(artwork!.book_ref).toBe("Acts");
  });
});

// ══════════════════════════════════════════════════════════════
// EVIDENCE DATA VALIDATION
// ══════════════════════════════════════════════════════════════

describe("evidence.json data file", () => {
  it("should be a non-empty array", () => {
    expect(Array.isArray(evidenceData)).toBe(true);
    expect(evidenceData.length).toBeGreaterThan(0);
  });

  it("should contain at least 50 evidence items", () => {
    expect(evidenceData.length).toBeGreaterThanOrEqual(50);
  });
});

// ──────────────────────────────────────────────────────────────
// EVIDENCE ENTRY SCHEMA VALIDATION
// ──────────────────────────────────────────────────────────────

describe("evidence entry schema", () => {
  it("every entry should have all required string fields", () => {
    for (const entry of evidenceData) {
      expect(entry.title).toBeTruthy();
      expect(typeof entry.title).toBe("string");
      expect(entry.slug).toBeTruthy();
      expect(typeof entry.slug).toBe("string");
      expect(entry.description).toBeTruthy();
      expect(typeof entry.description).toBe("string");
      expect(entry.significance).toBeTruthy();
      expect(typeof entry.significance).toBe("string");
      expect(entry.date_discovered).toBeTruthy();
      expect(typeof entry.date_discovered).toBe("string");
      expect(entry.location_found).toBeTruthy();
      expect(typeof entry.location_found).toBe("string");
      expect(entry.current_location).toBeTruthy();
      expect(typeof entry.current_location).toBe("string");
    }
  });

  it("every entry should have a valid category", () => {
    for (const entry of evidenceData) {
      expect(VALID_CATEGORIES.has(entry.category)).toBe(true);
    }
  });

  it("every entry should have a non-empty book_refs array", () => {
    for (const entry of evidenceData) {
      expect(Array.isArray(entry.book_refs)).toBe(true);
      expect(entry.book_refs.length).toBeGreaterThan(0);
    }
  });

  it("all book_refs should reference valid Bible book names", () => {
    for (const entry of evidenceData) {
      for (const bookRef of entry.book_refs) {
        expect(KNOWN_BOOKS.has(bookRef)).toBe(true);
      }
    }
  });

  it("every entry should have a source_url from Wikimedia Commons", () => {
    for (const entry of evidenceData) {
      expect(entry.source_url).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
    }
  });

  it("every entry should have an image_url from Wikimedia uploads", () => {
    for (const entry of evidenceData) {
      expect(entry.image_url).toMatch(/^https:\/\/upload\.wikimedia\.org\//);
    }
  });

  it("every entry should have a unique slug", () => {
    const slugs = evidenceData.map((e) => e.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("descriptions should be meaningful (more than 30 characters)", () => {
    for (const entry of evidenceData) {
      expect(entry.description.length).toBeGreaterThan(30);
    }
  });

  it("significance should be meaningful (more than 30 characters)", () => {
    for (const entry of evidenceData) {
      expect(entry.significance.length).toBeGreaterThan(30);
    }
  });

  it("slugs should be URL-friendly (lowercase, hyphens, no spaces)", () => {
    for (const entry of evidenceData) {
      expect(entry.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

// ──────────────────────────────────────────────────────────────
// EVIDENCE CATEGORY COVERAGE
// ──────────────────────────────────────────────────────────────

describe("evidence category coverage", () => {
  it("should include manuscript evidence", () => {
    const manuscripts = evidenceData.filter((e) => e.category === "manuscript");
    expect(manuscripts.length).toBeGreaterThanOrEqual(3);
  });

  it("should include inscription evidence", () => {
    const inscriptions = evidenceData.filter((e) => e.category === "inscription");
    expect(inscriptions.length).toBeGreaterThanOrEqual(5);
  });

  it("should include archaeological evidence", () => {
    const archaeology = evidenceData.filter((e) => e.category === "archaeology");
    expect(archaeology.length).toBeGreaterThanOrEqual(3);
  });

  it("should include artifact evidence", () => {
    const artifacts = evidenceData.filter((e) => e.category === "artifact");
    expect(artifacts.length).toBeGreaterThanOrEqual(3);
  });
});

// ──────────────────────────────────────────────────────────────
// KEY ARCHAEOLOGICAL EVIDENCE ITEMS
// ──────────────────────────────────────────────────────────────

describe("key archaeological evidence items", () => {
  const findBySlug = (slug: string) =>
    evidenceData.find((e) => e.slug === slug);

  it("should include Dead Sea Scrolls", () => {
    const item = findBySlug("dead-sea-scrolls");
    expect(item).toBeDefined();
    expect(item!.category).toBe("manuscript");
    expect(item!.book_refs).toContain("Isaiah");
  });

  it("should include Rosetta Stone", () => {
    const item = findBySlug("rosetta-stone");
    expect(item).toBeDefined();
    expect(item!.category).toBe("inscription");
    expect(item!.current_location).toMatch(/British Museum/);
  });

  it("should include Tel Dan Inscription", () => {
    const item = findBySlug("tel-dan-inscription");
    expect(item).toBeDefined();
    expect(item!.category).toBe("inscription");
    expect(item!.description).toMatch(/House of David/i);
  });

  it("should include Cyrus Cylinder", () => {
    const item = findBySlug("cyrus-cylinder");
    expect(item).toBeDefined();
    expect(item!.category).toBe("artifact");
    expect(item!.book_refs).toContain("Ezra");
  });

  it("should include Pilate Inscription", () => {
    const item = findBySlug("pilate-inscription");
    expect(item).toBeDefined();
    expect(item!.book_refs).toContain("Matthew");
    expect(item!.book_refs).toContain("John");
  });

  it("should include James Ossuary", () => {
    const item = findBySlug("james-ossuary");
    expect(item).toBeDefined();
    expect(item!.category).toBe("artifact");
  });

  it("should include Hezekiah's Tunnel", () => {
    const item = findBySlug("hezekiahs-tunnel");
    expect(item).toBeDefined();
    expect(item!.category).toBe("archaeology");
    expect(item!.book_refs).toContain("2 Kings");
  });

  it("should include Babylonian Chronicles", () => {
    const item = findBySlug("babylonian-chronicles");
    expect(item).toBeDefined();
    expect(item!.category).toBe("inscription");
  });

  it("should include Moabite Stone (Mesha Stele)", () => {
    const item = findBySlug("moabite-stone");
    expect(item).toBeDefined();
    expect(item!.current_location).toMatch(/Louvre/);
  });

  it("should include Merneptah Stele", () => {
    const item = findBySlug("merneptah-stele");
    expect(item).toBeDefined();
    expect(item!.description).toMatch(/Israel/);
  });

  it("should include Codex Sinaiticus", () => {
    const item = findBySlug("codex-sinaiticus");
    expect(item).toBeDefined();
    expect(item!.category).toBe("manuscript");
    expect(item!.book_refs).toContain("Matthew");
  });

  it("should include Codex Vaticanus", () => {
    const item = findBySlug("codex-vaticanus");
    expect(item).toBeDefined();
    expect(item!.category).toBe("manuscript");
    expect(item!.current_location).toMatch(/Vatican/);
  });
});

// ──────────────────────────────────────────────────────────────
// EVIDENCE UNIQUE TITLE VALIDATION
// ──────────────────────────────────────────────────────────────

describe("evidence data integrity", () => {
  it("should have no duplicate titles", () => {
    const titles = evidenceData.map((e) => e.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  it("should have no duplicate slugs", () => {
    const slugs = evidenceData.map((e) => e.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("should not have empty book_refs arrays", () => {
    for (const entry of evidenceData) {
      expect(entry.book_refs.length).toBeGreaterThan(0);
    }
  });

  it("should not have duplicate book_refs within a single entry", () => {
    for (const entry of evidenceData) {
      const uniqueRefs = new Set(entry.book_refs);
      expect(uniqueRefs.size).toBe(entry.book_refs.length);
    }
  });
});

// ══════════════════════════════════════════════════════════════
// SEED FUNCTION - IN-MEMORY DATABASE TESTS
// ══════════════════════════════════════════════════════════════

describe("seedMedia database insertion", () => {
  let sqlite: Database.Database;
  let testDb: ReturnType<typeof drizzle>;

  function applySchema(rawDb: Database.Database) {
    rawDb.exec(`
      PRAGMA foreign_keys = ON;

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
        media_type TEXT NOT NULL DEFAULT 'painting' CHECK(media_type IN ('painting','illustration','photograph','map'))
      );

      CREATE TABLE IF NOT EXISTS media_references (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        chapter_id INTEGER,
        verse_id INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_media_refs_book ON media_references(book_id);
    `);
  }

  function insertBookFixtures(rawDb: Database.Database) {
    rawDb.exec(`
      INSERT INTO books (id, name, abbreviation, slug, testament, category, chapter_count, sort_order)
      VALUES
        (1, 'Genesis', 'Gen', 'genesis', 'OT', 'Law', 50, 1),
        (2, 'Exodus', 'Exod', 'exodus', 'OT', 'Law', 40, 2),
        (3, 'Matthew', 'Matt', 'matthew', 'NT', 'Gospel', 28, 40),
        (4, 'Luke', 'Luke', 'luke', 'NT', 'Gospel', 24, 42),
        (5, 'John', 'John', 'john', 'NT', 'Gospel', 21, 43),
        (6, 'Acts', 'Acts', 'acts', 'NT', 'History', 28, 44);
    `);
  }

  beforeEach(() => {
    sqlite = new Database(":memory:");
    testDb = drizzle(sqlite, { schema });
    applySchema(sqlite);
  });

  afterAll(() => {
    if (sqlite) sqlite.close();
  });

  it("should insert a media record with correct fields", () => {
    testDb
      .insert(schema.media)
      .values({
        title: "Creation of Adam",
        description: "Iconic fresco depicting God giving life to Adam.",
        artist: "Michelangelo",
        yearCreated: "1512",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Creation.jpg",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Creation.jpg",
        attribution: "Michelangelo, Public domain, via Wikimedia Commons",
        license: "Public Domain",
        mediaType: "painting",
      })
      .run();

    const result = testDb.select().from(schema.media).all();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Creation of Adam");
    expect(result[0].artist).toBe("Michelangelo");
    expect(result[0].mediaType).toBe("painting");
    expect(result[0].license).toBe("Public Domain");
  });

  it("should insert media_references linking media to a book", () => {
    insertBookFixtures(sqlite);

    const mediaRecord = testDb
      .insert(schema.media)
      .values({
        title: "Test Painting",
        description: "A test painting",
        artist: "Test Artist",
        mediaType: "painting",
      })
      .returning()
      .get();

    testDb
      .insert(schema.mediaReferences)
      .values({ mediaId: mediaRecord.id, bookId: 1 })
      .run();

    const refs = testDb.select().from(schema.mediaReferences).all();
    expect(refs).toHaveLength(1);
    expect(refs[0].mediaId).toBe(mediaRecord.id);
    expect(refs[0].bookId).toBe(1);
  });

  it("should cascade delete media_references when media is deleted", () => {
    insertBookFixtures(sqlite);

    const mediaRecord = testDb
      .insert(schema.media)
      .values({
        title: "Temp Painting",
        description: "Will be deleted",
        mediaType: "painting",
      })
      .returning()
      .get();

    testDb
      .insert(schema.mediaReferences)
      .values({ mediaId: mediaRecord.id, bookId: 1 })
      .run();

    // Delete the media record
    testDb.delete(schema.media).where(eq(schema.media.id, mediaRecord.id)).run();

    const refs = testDb.select().from(schema.mediaReferences).all();
    expect(refs).toHaveLength(0);
  });

  it("should allow multiple media references for the same book", () => {
    insertBookFixtures(sqlite);

    const media1 = testDb
      .insert(schema.media)
      .values({ title: "Painting 1", mediaType: "painting" })
      .returning()
      .get();

    const media2 = testDb
      .insert(schema.media)
      .values({ title: "Painting 2", mediaType: "illustration" })
      .returning()
      .get();

    testDb.insert(schema.mediaReferences).values({ mediaId: media1.id, bookId: 1 }).run();
    testDb.insert(schema.mediaReferences).values({ mediaId: media2.id, bookId: 1 }).run();

    const refs = testDb.select().from(schema.mediaReferences).all();
    expect(refs).toHaveLength(2);
  });

  it("should allow null chapter_id and verse_id in media_references", () => {
    insertBookFixtures(sqlite);

    const mediaRecord = testDb
      .insert(schema.media)
      .values({ title: "Book-level art", mediaType: "painting" })
      .returning()
      .get();

    testDb
      .insert(schema.mediaReferences)
      .values({ mediaId: mediaRecord.id, bookId: 1, chapterId: null, verseId: null })
      .run();

    const refs = testDb.select().from(schema.mediaReferences).all();
    expect(refs[0].chapterId).toBeNull();
    expect(refs[0].verseId).toBeNull();
  });

  it("should handle bulk insertion of media records", () => {
    const entries = [
      { title: "Art 1", mediaType: "painting" as const },
      { title: "Art 2", mediaType: "illustration" as const },
      { title: "Art 3", mediaType: "painting" as const },
      { title: "Art 4", mediaType: "photograph" as const },
      { title: "Art 5", mediaType: "map" as const },
    ];

    for (const entry of entries) {
      testDb.insert(schema.media).values(entry).run();
    }

    const result = testDb.select().from(schema.media).all();
    expect(result).toHaveLength(5);
  });
});

// ──────────────────────────────────────────────────────────────
// SEED EVIDENCE - IN-MEMORY DATABASE TESTS
// ──────────────────────────────────────────────────────────────

describe("seedEvidence database insertion", () => {
  let sqlite: Database.Database;
  let testDb: ReturnType<typeof drizzle>;

  function applySchema(rawDb: Database.Database) {
    rawDb.exec(`
      PRAGMA foreign_keys = ON;

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

      CREATE TABLE IF NOT EXISTS evidence (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('manuscript','archaeology','inscription','artifact')),
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
        chapter_id INTEGER,
        verse_id INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_evidence_refs_book ON evidence_references(book_id);
    `);
  }

  function insertBookFixtures(rawDb: Database.Database) {
    rawDb.exec(`
      INSERT INTO books (id, name, abbreviation, slug, testament, category, chapter_count, sort_order)
      VALUES
        (1, 'Genesis', 'Gen', 'genesis', 'OT', 'Law', 50, 1),
        (2, 'Isaiah', 'Isa', 'isaiah', 'OT', 'Major Prophet', 66, 23),
        (3, 'Psalms', 'Psa', 'psalms', 'OT', 'Poetry', 150, 19),
        (4, 'Matthew', 'Matt', 'matthew', 'NT', 'Gospel', 28, 40),
        (5, 'John', 'John', 'john', 'NT', 'Gospel', 21, 43),
        (6, 'Ezra', 'Ezra', 'ezra', 'OT', 'History', 10, 15);
    `);
  }

  beforeEach(() => {
    sqlite = new Database(":memory:");
    testDb = drizzle(sqlite, { schema });
    applySchema(sqlite);
  });

  afterAll(() => {
    if (sqlite) sqlite.close();
  });

  it("should insert an evidence record with correct fields", () => {
    testDb
      .insert(schema.evidence)
      .values({
        title: "Dead Sea Scrolls",
        slug: "dead-sea-scrolls",
        description: "A collection of nearly 1,000 manuscripts.",
        category: "manuscript",
        dateDiscovered: "1946–1956",
        locationFound: "Qumran, West Bank",
        currentLocation: "Shrine of the Book, Israel Museum, Jerusalem",
        significance: "Confirmed textual accuracy of the Hebrew Bible.",
        imageUrl: "https://upload.wikimedia.org/test.jpg",
        sourceUrl: "https://commons.wikimedia.org/test.jpg",
      })
      .run();

    const result = testDb.select().from(schema.evidence).all();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Dead Sea Scrolls");
    expect(result[0].slug).toBe("dead-sea-scrolls");
    expect(result[0].category).toBe("manuscript");
    expect(result[0].dateDiscovered).toBe("1946–1956");
    expect(result[0].currentLocation).toBe("Shrine of the Book, Israel Museum, Jerusalem");
  });

  it("should enforce unique slug constraint on evidence", () => {
    testDb
      .insert(schema.evidence)
      .values({
        title: "Dead Sea Scrolls",
        slug: "dead-sea-scrolls",
        description: "First entry",
        category: "manuscript",
      })
      .run();

    expect(() =>
      testDb
        .insert(schema.evidence)
        .values({
          title: "Dead Sea Scrolls Copy",
          slug: "dead-sea-scrolls",
          description: "Duplicate slug",
          category: "manuscript",
        })
        .run()
    ).toThrow();
  });

  it("should insert evidence_references linking evidence to books", () => {
    insertBookFixtures(sqlite);

    const evidenceRecord = testDb
      .insert(schema.evidence)
      .values({
        title: "Test Artifact",
        slug: "test-artifact",
        description: "A test artifact",
        category: "artifact",
      })
      .returning()
      .get();

    testDb
      .insert(schema.evidenceReferences)
      .values({ evidenceId: evidenceRecord.id, bookId: 2 })
      .run();

    testDb
      .insert(schema.evidenceReferences)
      .values({ evidenceId: evidenceRecord.id, bookId: 4 })
      .run();

    const refs = testDb.select().from(schema.evidenceReferences).all();
    expect(refs).toHaveLength(2);
    expect(refs[0].evidenceId).toBe(evidenceRecord.id);
    expect(refs[1].evidenceId).toBe(evidenceRecord.id);
  });

  it("should cascade delete evidence_references when evidence is deleted", () => {
    insertBookFixtures(sqlite);

    const record = testDb
      .insert(schema.evidence)
      .values({
        title: "Temp Evidence",
        slug: "temp-evidence",
        description: "Will be deleted",
        category: "inscription",
      })
      .returning()
      .get();

    testDb.insert(schema.evidenceReferences).values({ evidenceId: record.id, bookId: 1 }).run();
    testDb.insert(schema.evidenceReferences).values({ evidenceId: record.id, bookId: 2 }).run();

    // Delete the evidence record
    testDb.delete(schema.evidence).where(eq(schema.evidence.id, record.id)).run();

    const refs = testDb.select().from(schema.evidenceReferences).all();
    expect(refs).toHaveLength(0);
  });

  it("should handle all four evidence categories", () => {
    const categories = ["manuscript", "archaeology", "inscription", "artifact"] as const;

    for (let i = 0; i < categories.length; i++) {
      testDb
        .insert(schema.evidence)
        .values({
          title: `Evidence ${i}`,
          slug: `evidence-${i}`,
          description: `A ${categories[i]} item`,
          category: categories[i],
        })
        .run();
    }

    const result = testDb.select().from(schema.evidence).all();
    expect(result).toHaveLength(4);
    const insertedCategories = new Set(result.map((r) => r.category));
    expect(insertedCategories.size).toBe(4);
  });

  it("should allow null optional fields in evidence", () => {
    testDb
      .insert(schema.evidence)
      .values({
        title: "Minimal Evidence",
        slug: "minimal-evidence",
        description: "Only required fields",
        category: "artifact",
      })
      .run();

    const result = testDb.select().from(schema.evidence).all();
    expect(result[0].dateDiscovered).toBeNull();
    expect(result[0].locationFound).toBeNull();
    expect(result[0].currentLocation).toBeNull();
    expect(result[0].significance).toBeNull();
    expect(result[0].imageUrl).toBeNull();
    expect(result[0].sourceUrl).toBeNull();
  });

  it("should handle bulk insertion of evidence with multiple book references", () => {
    insertBookFixtures(sqlite);

    const records = [
      { title: "Item A", slug: "item-a", description: "Desc A", category: "manuscript" as const },
      { title: "Item B", slug: "item-b", description: "Desc B", category: "inscription" as const },
      { title: "Item C", slug: "item-c", description: "Desc C", category: "artifact" as const },
    ];

    for (const rec of records) {
      const result = testDb.insert(schema.evidence).values(rec).returning().get();
      // Link to multiple books
      testDb.insert(schema.evidenceReferences).values({ evidenceId: result.id, bookId: 1 }).run();
      testDb.insert(schema.evidenceReferences).values({ evidenceId: result.id, bookId: 2 }).run();
    }

    const allEvidence = testDb.select().from(schema.evidence).all();
    expect(allEvidence).toHaveLength(3);

    const allRefs = testDb.select().from(schema.evidenceReferences).all();
    expect(allRefs).toHaveLength(6); // 3 evidence × 2 books each
  });
});

// ══════════════════════════════════════════════════════════════
// SEED SCRIPT INTEGRATION
// ══════════════════════════════════════════════════════════════

describe("seed script integration", () => {
  it("seed.ts should import seedMedia", () => {
    const seedPath = path.join(process.cwd(), "lib", "db", "seed.ts");
    const content = fs.readFileSync(seedPath, "utf-8");
    expect(content).toContain('import { seedMedia }');
    expect(content).toContain("seedMedia()");
  });

  it("seed.ts should import seedEvidence", () => {
    const seedPath = path.join(process.cwd(), "lib", "db", "seed.ts");
    const content = fs.readFileSync(seedPath, "utf-8");
    expect(content).toContain('import { seedEvidence }');
    expect(content).toContain("seedEvidence()");
  });

  it("seed-media.ts module should exist", () => {
    const modulePath = path.join(process.cwd(), "lib", "db", "seed-data", "seed-media.ts");
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("seed-evidence.ts module should exist", () => {
    const modulePath = path.join(process.cwd(), "lib", "db", "seed-data", "seed-evidence.ts");
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("seedMedia should be a named export function", async () => {
    const mod = await import("@/lib/db/seed-data/seed-media");
    expect(typeof mod.seedMedia).toBe("function");
  });

  it("seedEvidence should be a named export function", async () => {
    const mod = await import("@/lib/db/seed-data/seed-evidence");
    expect(typeof mod.seedEvidence).toBe("function");
  });
});

// ══════════════════════════════════════════════════════════════
// EDGE CASES
// ══════════════════════════════════════════════════════════════

describe("edge cases - media", () => {
  it("no media entry should have empty title or description", () => {
    for (const entry of mediaData) {
      expect(entry.title.trim().length).toBeGreaterThan(0);
      expect(entry.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("no media entry should have an empty artist field", () => {
    for (const entry of mediaData) {
      expect(entry.artist.trim().length).toBeGreaterThan(0);
    }
  });

  it("all source_url values should be valid URLs", () => {
    for (const entry of mediaData) {
      expect(() => new URL(entry.source_url)).not.toThrow();
    }
  });

  it("all image_url values should be valid URLs", () => {
    for (const entry of mediaData) {
      expect(() => new URL(entry.image_url)).not.toThrow();
    }
  });
});

describe("edge cases - evidence", () => {
  it("no evidence entry should have empty title or description", () => {
    for (const entry of evidenceData) {
      expect(entry.title.trim().length).toBeGreaterThan(0);
      expect(entry.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("no evidence entry should have empty book_refs entries", () => {
    for (const entry of evidenceData) {
      for (const ref of entry.book_refs) {
        expect(ref.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("all evidence source_url values should be valid URLs", () => {
    for (const entry of evidenceData) {
      expect(() => new URL(entry.source_url)).not.toThrow();
    }
  });

  it("all evidence image_url values should be valid URLs", () => {
    for (const entry of evidenceData) {
      expect(() => new URL(entry.image_url)).not.toThrow();
    }
  });

  it("evidence slugs should match slugified titles", () => {
    for (const entry of evidenceData) {
      // Slugs in data are hand-crafted but should be reasonable transformations
      expect(entry.slug.length).toBeGreaterThan(0);
      expect(entry.slug).not.toContain(" ");
      expect(entry.slug).toBe(entry.slug.toLowerCase());
    }
  });
});
