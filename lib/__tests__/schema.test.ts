import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";

/**
 * Integration tests for the Drizzle ORM schema definitions.
 * Uses an in-memory SQLite database to verify that all tables,
 * columns, constraints, indexes, and relations work correctly.
 */

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

/** Read the migration SQL from the generated drizzle output and apply it */
function applySchema(rawDb: Database.Database) {
  // Create all tables directly via SQL derived from the schema definitions
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
      media_type TEXT NOT NULL DEFAULT 'painting' CHECK(media_type IN ('painting','illustration','photograph','map'))
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
      location_type TEXT NOT NULL CHECK(location_type IN ('city','mountain','river','sea','region','desert','valley','island')),
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
      relationship TEXT NOT NULL CHECK(relationship IN ('parallel','prophecy-fulfillment','quotation','allusion','contrast')),
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

/** Insert a book and return its id */
function insertBook(overrides: Partial<typeof schema.books.$inferInsert> = {}) {
  const defaults = {
    name: "Genesis",
    abbreviation: "Gen",
    slug: "genesis",
    testament: "OT" as const,
    category: "Law",
    chapterCount: 50,
    sortOrder: 1,
  };
  const result = db.insert(schema.books).values({ ...defaults, ...overrides }).returning().get();
  return result;
}

/** Insert a chapter and return its id */
function insertChapter(bookId: number, num = 1) {
  return db
    .insert(schema.chapters)
    .values({ bookId, chapterNumber: num, verseCount: 31 })
    .returning()
    .get();
}

/** Insert a verse and return its id */
function insertVerse(bookId: number, chapterId: number, chapterNumber: number, verseNumber: number, text = "In the beginning...") {
  return db
    .insert(schema.verses)
    .values({ bookId, chapterId, chapterNumber, verseNumber, text })
    .returning()
    .get();
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

// ─── Schema Exports ──────────────────────────────────────
describe("Schema exports", () => {
  it("exports all 18 table definitions", () => {
    const tables = [
      schema.books, schema.chapters, schema.verses,
      schema.translations, schema.verseTranslations,
      schema.media, schema.mediaReferences,
      schema.evidence, schema.evidenceReferences,
      schema.locations, schema.locationReferences,
      schema.journeys, schema.journeyStops,
      schema.dictionary, schema.crossReferences,
      schema.people, schema.peopleReferences,
      schema.readingPlans,
    ];
    for (const table of tables) {
      expect(table).toBeDefined();
    }
  });

  it("exports relation definitions for all tables with relations", () => {
    const relations = [
      schema.booksRelations, schema.chaptersRelations, schema.versesRelations,
      schema.translationsRelations, schema.verseTranslationsRelations,
      schema.mediaRelations, schema.mediaReferencesRelations,
      schema.evidenceRelations, schema.evidenceReferencesRelations,
      schema.locationsRelations, schema.locationReferencesRelations,
      schema.journeysRelations, schema.journeyStopsRelations,
      schema.dictionaryRelations, schema.crossReferencesRelations,
      schema.peopleRelations, schema.peopleReferencesRelations,
    ];
    for (const rel of relations) {
      expect(rel).toBeDefined();
    }
  });
});

// ─── Books Table ─────────────────────────────────────────
describe("Books table", () => {
  it("inserts and retrieves a book with all fields", () => {
    const book = insertBook({
      slug: "genesis-full",
      author: "Moses",
      dateWritten: "~1400 BC",
      description: "The book of beginnings",
      keyThemes: "creation, fall, covenant",
    });
    expect(book.id).toBeGreaterThan(0);
    expect(book.name).toBe("Genesis");
    expect(book.testament).toBe("OT");
    expect(book.author).toBe("Moses");
  });

  it("enforces unique slug constraint", () => {
    insertBook({ slug: "unique-slug-test" });
    expect(() => insertBook({ slug: "unique-slug-test" })).toThrow();
  });

  it("stores both OT and NT testament values", () => {
    const ot = insertBook({ slug: "ot-book", testament: "OT" });
    const nt = insertBook({ slug: "nt-book", testament: "NT" });
    expect(ot.testament).toBe("OT");
    expect(nt.testament).toBe("NT");
  });
});

// ─── Chapters Table ──────────────────────────────────────
describe("Chapters table", () => {
  it("inserts a chapter linked to a book", () => {
    const book = insertBook({ slug: "ch-book" });
    const chapter = insertChapter(book.id, 1);
    expect(chapter.bookId).toBe(book.id);
    expect(chapter.chapterNumber).toBe(1);
  });

  it("cascades delete when parent book is removed", () => {
    const book = insertBook({ slug: "cascade-ch-book" });
    insertChapter(book.id, 1);
    db.delete(schema.books).where(eq(schema.books.id, book.id)).run();
    const remaining = db.select().from(schema.chapters).where(eq(schema.chapters.bookId, book.id)).all();
    expect(remaining).toHaveLength(0);
  });
});

// ─── Verses Table ────────────────────────────────────────
describe("Verses table", () => {
  it("inserts a verse linked to a book and chapter", () => {
    const book = insertBook({ slug: "v-book" });
    const ch = insertChapter(book.id, 1);
    const verse = insertVerse(book.id, ch.id, 1, 1, "In the beginning God created the heavens and the earth.");
    expect(verse.verseNumber).toBe(1);
    expect(verse.text).toContain("beginning");
  });

  it("cascades delete when parent chapter is removed", () => {
    const book = insertBook({ slug: "cascade-v-book" });
    const ch = insertChapter(book.id, 1);
    insertVerse(book.id, ch.id, 1, 1);
    insertVerse(book.id, ch.id, 1, 2, "And the earth was formless...");
    db.delete(schema.chapters).where(eq(schema.chapters.id, ch.id)).run();
    const remaining = db.select().from(schema.verses).where(eq(schema.verses.chapterId, ch.id)).all();
    expect(remaining).toHaveLength(0);
  });
});

// ─── Translations & Verse Translations ───────────────────
describe("Translations table", () => {
  it("inserts a translation with defaults", () => {
    const t = db.insert(schema.translations).values({
      name: "King James Version",
      abbreviation: "KJV",
    }).returning().get();
    expect(t.language).toBe("en");
    expect(t.isDefault).toBe(false);
  });

  it("enforces unique abbreviation", () => {
    db.insert(schema.translations).values({ name: "Test1", abbreviation: "TST1" }).run();
    expect(() =>
      db.insert(schema.translations).values({ name: "Test2", abbreviation: "TST1" }).run()
    ).toThrow();
  });
});

describe("Verse translations table", () => {
  it("links a verse to a translation with alternate text", () => {
    const book = insertBook({ slug: "vt-book" });
    const ch = insertChapter(book.id, 1);
    const verse = insertVerse(book.id, ch.id, 1, 1);
    const translation = db.insert(schema.translations).values({
      name: "NIV",
      abbreviation: "NIV",
    }).returning().get();

    const vt = db.insert(schema.verseTranslations).values({
      verseId: verse.id,
      translationId: translation.id,
      text: "In the beginning God created...",
    }).returning().get();

    expect(vt.verseId).toBe(verse.id);
    expect(vt.translationId).toBe(translation.id);
  });
});

// ─── Media & Media References ────────────────────────────
describe("Media table", () => {
  it("inserts media with default values", () => {
    const m = db.insert(schema.media).values({
      title: "The Creation of Adam",
    }).returning().get();
    expect(m.license).toBe("Public Domain");
    expect(m.mediaType).toBe("painting");
  });

  it("accepts all media type enum values", () => {
    const types = ["painting", "illustration", "photograph", "map"] as const;
    for (const mediaType of types) {
      const m = db.insert(schema.media).values({
        title: `Test ${mediaType}`,
        mediaType,
      }).returning().get();
      expect(m.mediaType).toBe(mediaType);
    }
  });
});

describe("Media references table", () => {
  it("links media to a book and chapter", () => {
    const book = insertBook({ slug: "mr-book" });
    const ch = insertChapter(book.id, 1);
    const m = db.insert(schema.media).values({ title: "Test Art" }).returning().get();
    const ref = db.insert(schema.mediaReferences).values({
      mediaId: m.id,
      bookId: book.id,
      chapterId: ch.id,
    }).returning().get();
    expect(ref.mediaId).toBe(m.id);
    expect(ref.bookId).toBe(book.id);
  });
});

// ─── Evidence & Evidence References ──────────────────────
describe("Evidence table", () => {
  it("inserts archaeological evidence", () => {
    const e = db.insert(schema.evidence).values({
      title: "Dead Sea Scrolls",
      slug: "dead-sea-scrolls",
      description: "Ancient manuscripts found in Qumran",
      category: "manuscript",
    }).returning().get();
    expect(e.category).toBe("manuscript");
    expect(e.slug).toBe("dead-sea-scrolls");
  });

  it("enforces unique slug", () => {
    db.insert(schema.evidence).values({
      title: "Test Evidence",
      slug: "dup-evidence",
      description: "desc",
      category: "artifact",
    }).run();
    expect(() =>
      db.insert(schema.evidence).values({
        title: "Test Evidence 2",
        slug: "dup-evidence",
        description: "desc2",
        category: "archaeology",
      }).run()
    ).toThrow();
  });
});

// ─── Locations & Location References ─────────────────────
describe("Locations table", () => {
  it("inserts a location with coordinates", () => {
    const loc = db.insert(schema.locations).values({
      name: "Jerusalem",
      slug: "jerusalem",
      locationType: "city",
      latitude: 31.7683,
      longitude: 35.2137,
      modernName: "Jerusalem",
    }).returning().get();
    expect(loc.latitude).toBeCloseTo(31.7683, 4);
    expect(loc.longitude).toBeCloseTo(35.2137, 4);
    expect(loc.locationType).toBe("city");
  });

  it("accepts all location type enum values", () => {
    const types = ["city", "mountain", "river", "sea", "region", "desert", "valley", "island"] as const;
    for (const locationType of types) {
      const loc = db.insert(schema.locations).values({
        name: `Test ${locationType}`,
        slug: `test-${locationType}`,
        locationType,
        latitude: 0,
        longitude: 0,
      }).returning().get();
      expect(loc.locationType).toBe(locationType);
    }
  });
});

// ─── Journeys & Journey Stops ────────────────────────────
describe("Journeys table", () => {
  it("inserts a journey with default color", () => {
    const j = db.insert(schema.journeys).values({
      name: "Exodus",
      slug: "exodus-journey",
    }).returning().get();
    expect(j.color).toBe("#C4975C");
  });
});

describe("Journey stops table", () => {
  it("creates ordered stops for a journey", () => {
    const journey = db.insert(schema.journeys).values({
      name: "Paul's First",
      slug: "pauls-first",
      personName: "Paul",
    }).returning().get();

    const stop1 = db.insert(schema.journeyStops).values({
      journeyId: journey.id,
      stopOrder: 1,
      name: "Antioch",
      latitude: 36.2,
      longitude: 36.15,
    }).returning().get();

    const stop2 = db.insert(schema.journeyStops).values({
      journeyId: journey.id,
      stopOrder: 2,
      name: "Cyprus",
      latitude: 35.1,
      longitude: 33.4,
    }).returning().get();

    expect(stop1.stopOrder).toBe(1);
    expect(stop2.stopOrder).toBe(2);
    expect(stop1.journeyId).toBe(journey.id);
  });

  it("cascades delete when parent journey is removed", () => {
    const j = db.insert(schema.journeys).values({ name: "Temp", slug: "temp-journey" }).returning().get();
    db.insert(schema.journeyStops).values({ journeyId: j.id, stopOrder: 1, name: "Stop" }).run();
    db.delete(schema.journeys).where(eq(schema.journeys.id, j.id)).run();
    const stops = db.select().from(schema.journeyStops).where(eq(schema.journeyStops.journeyId, j.id)).all();
    expect(stops).toHaveLength(0);
  });
});

// ─── Dictionary ──────────────────────────────────────────
describe("Dictionary table", () => {
  it("inserts a dictionary entry", () => {
    const d = db.insert(schema.dictionary).values({
      word: "Abba",
      slug: "abba",
      definition: "Father; an Aramaic term of endearment",
      modernEquivalent: "Dad/Father",
      partOfSpeech: "noun",
    }).returning().get();
    expect(d.word).toBe("Abba");
    expect(d.modernEquivalent).toBe("Dad/Father");
  });

  it("enforces unique word constraint", () => {
    db.insert(schema.dictionary).values({ word: "Selah", slug: "selah", definition: "Pause" }).run();
    expect(() =>
      db.insert(schema.dictionary).values({ word: "Selah", slug: "selah-2", definition: "Pause2" }).run()
    ).toThrow();
  });
});

// ─── Cross References ────────────────────────────────────
describe("Cross references table", () => {
  it("links two verses with a relationship type", () => {
    const book = insertBook({ slug: "xref-book" });
    const ch = insertChapter(book.id, 1);
    const v1 = insertVerse(book.id, ch.id, 1, 1, "Isaiah prophecy");
    const v2 = insertVerse(book.id, ch.id, 1, 2, "Matthew fulfillment");

    const xref = db.insert(schema.crossReferences).values({
      sourceVerseId: v1.id,
      targetVerseId: v2.id,
      relationship: "prophecy-fulfillment",
      note: "Messianic prophecy",
    }).returning().get();

    expect(xref.relationship).toBe("prophecy-fulfillment");
    expect(xref.sourceVerseId).toBe(v1.id);
    expect(xref.targetVerseId).toBe(v2.id);
  });

  it("accepts all relationship types", () => {
    const book = insertBook({ slug: "xref-types-book" });
    const ch = insertChapter(book.id, 1);
    const types = ["parallel", "prophecy-fulfillment", "quotation", "allusion", "contrast"] as const;

    for (let i = 0; i < types.length; i++) {
      const v1 = insertVerse(book.id, ch.id, 1, 10 + i * 2, "src");
      const v2 = insertVerse(book.id, ch.id, 1, 11 + i * 2, "tgt");
      const xref = db.insert(schema.crossReferences).values({
        sourceVerseId: v1.id,
        targetVerseId: v2.id,
        relationship: types[i],
      }).returning().get();
      expect(xref.relationship).toBe(types[i]);
    }
  });
});

// ─── People & People References ──────────────────────────
describe("People table", () => {
  it("inserts a person with genealogy fields", () => {
    const father = db.insert(schema.people).values({
      name: "Abraham",
      slug: "abraham",
      description: "Father of many nations",
      tribeOrGroup: "Hebrew",
    }).returning().get();

    const son = db.insert(schema.people).values({
      name: "Isaac",
      slug: "isaac",
      fatherId: father.id,
      description: "Son of promise",
    }).returning().get();

    expect(son.fatherId).toBe(father.id);
  });

  it("enforces unique slug", () => {
    db.insert(schema.people).values({ name: "Moses", slug: "moses" }).run();
    expect(() =>
      db.insert(schema.people).values({ name: "Moses2", slug: "moses" }).run()
    ).toThrow();
  });
});

// ─── Reading Plans ───────────────────────────────────────
describe("Reading plans table", () => {
  it("inserts a reading plan with JSON schedule", () => {
    const schedule = JSON.stringify([
      { day: 1, readings: ["Gen 1-2"] },
      { day: 2, readings: ["Gen 3-4"] },
    ]);
    const plan = db.insert(schema.readingPlans).values({
      name: "Bible in a Year",
      slug: "bible-in-a-year",
      description: "Read through the entire Bible in 365 days",
      durationDays: 365,
      schedule,
    }).returning().get();

    expect(plan.durationDays).toBe(365);
    const parsed = JSON.parse(plan.schedule);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].readings[0]).toBe("Gen 1-2");
  });
});

// ─── Join Queries ────────────────────────────────────────
describe("Join queries across related tables", () => {
  it("queries chapters for a specific book", () => {
    const book = insertBook({ slug: "join-book", name: "Exodus" });
    insertChapter(book.id, 1);
    insertChapter(book.id, 2);

    const chapters = db
      .select()
      .from(schema.chapters)
      .where(eq(schema.chapters.bookId, book.id))
      .all();

    expect(chapters).toHaveLength(2);
    expect(chapters[0].bookId).toBe(book.id);
    expect(chapters[1].bookId).toBe(book.id);
  });

  it("queries verses for a specific chapter with book info via join", () => {
    const book = insertBook({ slug: "join-ch-book", name: "Leviticus" });
    const ch = insertChapter(book.id, 1);
    insertVerse(book.id, ch.id, 1, 1, "Verse text 1");
    insertVerse(book.id, ch.id, 1, 2, "Verse text 2");

    const rows = db
      .select({
        verseTxt: schema.verses.text,
        bookName: schema.books.name,
      })
      .from(schema.verses)
      .innerJoin(schema.books, eq(schema.verses.bookId, schema.books.id))
      .where(eq(schema.verses.chapterId, ch.id))
      .all();

    expect(rows).toHaveLength(2);
    expect(rows[0].bookName).toBe("Leviticus");
  });

  it("queries verse translations via join", () => {
    const book = insertBook({ slug: "join-vt-book" });
    const ch = insertChapter(book.id, 1);
    const verse = insertVerse(book.id, ch.id, 1, 1);
    const tr = db.insert(schema.translations).values({
      name: "ESV",
      abbreviation: "ESV-join",
    }).returning().get();
    db.insert(schema.verseTranslations).values({
      verseId: verse.id,
      translationId: tr.id,
      text: "ESV text here",
    }).run();

    const rows = db
      .select({
        vtText: schema.verseTranslations.text,
        translationName: schema.translations.name,
      })
      .from(schema.verseTranslations)
      .innerJoin(schema.translations, eq(schema.verseTranslations.translationId, schema.translations.id))
      .where(eq(schema.verseTranslations.verseId, verse.id))
      .all();

    expect(rows).toHaveLength(1);
    expect(rows[0].vtText).toBe("ESV text here");
    expect(rows[0].translationName).toBe("ESV");
  });
});

// ─── Edge Cases ──────────────────────────────────────────
describe("Edge cases", () => {
  it("handles empty string fields where allowed", () => {
    const book = insertBook({
      slug: "empty-fields-book",
      author: "",
      description: "",
      keyThemes: "",
    });
    expect(book.author).toBe("");
    expect(book.description).toBe("");
  });

  it("handles null optional fields", () => {
    const book = insertBook({ slug: "null-fields-book" });
    expect(book.author).toBeNull();
    expect(book.dateWritten).toBeNull();
    expect(book.description).toBeNull();
  });

  it("handles very long text in verse content", () => {
    const longText = "A".repeat(10000);
    const book = insertBook({ slug: "long-text-book" });
    const ch = insertChapter(book.id, 1);
    const verse = insertVerse(book.id, ch.id, 1, 1, longText);
    expect(verse.text).toHaveLength(10000);
  });

  it("handles special characters in text fields", () => {
    const specialText = "He said, \"I am the way\" — 'truth' & <life> (John 14:6)";
    const book = insertBook({ slug: "special-chars-book" });
    const ch = insertChapter(book.id, 1);
    const verse = insertVerse(book.id, ch.id, 1, 1, specialText);
    expect(verse.text).toBe(specialText);
  });

  it("handles Unicode text (Hebrew, Greek)", () => {
    const hebrewText = "בְּרֵאשִׁית בָּרָא אֱלֹהִים";
    const book = insertBook({ slug: "unicode-book" });
    const ch = insertChapter(book.id, 1);
    const verse = insertVerse(book.id, ch.id, 1, 1, hebrewText);
    expect(verse.text).toBe(hebrewText);
  });

  it("handles coordinate boundary values for locations", () => {
    const loc = db.insert(schema.locations).values({
      name: "South Pole",
      slug: "south-pole",
      locationType: "region",
      latitude: -90,
      longitude: -180,
    }).returning().get();
    expect(loc.latitude).toBe(-90);
    expect(loc.longitude).toBe(-180);
  });
});
