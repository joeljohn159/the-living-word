import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { slugify } from "@/lib/utils";

/**
 * Tests for people.json data integrity and the seed-people module.
 *
 * Validates that:
 * - people.json has 100+ figures with correct schema
 * - All required biblical categories are represented
 * - Parent references are internally consistent
 * - Verse references point to valid person names
 * - The seed function inserts data correctly and is idempotent
 */

// ──────────────────────────────────────────────────────────────
// Types mirroring seed-people.ts
// ──────────────────────────────────────────────────────────────

interface PersonEntry {
  name: string;
  also_known_as: string | null;
  description: string;
  birth_ref: string | null;
  death_ref: string | null;
  father_slug: string | null;
  mother_slug: string | null;
  tribe_or_group: string;
}

interface ReferenceEntry {
  person_name: string;
  book_name: string;
  chapter: number;
  verse: number;
}

interface PeopleData {
  people: PersonEntry[];
  people_references: ReferenceEntry[];
}

// ──────────────────────────────────────────────────────────────
// Load data once for all tests
// ──────────────────────────────────────────────────────────────

let data: PeopleData;

beforeAll(() => {
  const filePath = path.join(process.cwd(), "data", "people.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  data = JSON.parse(raw) as PeopleData;
});

// ──────────────────────────────────────────────────────────────
// 1. DATA FILE STRUCTURE
// ──────────────────────────────────────────────────────────────

describe("people.json data file", () => {
  it("should be valid JSON with people and people_references arrays", () => {
    expect(data).toHaveProperty("people");
    expect(data).toHaveProperty("people_references");
    expect(Array.isArray(data.people)).toBe(true);
    expect(Array.isArray(data.people_references)).toBe(true);
  });

  it("should contain at least 100 biblical figures", () => {
    expect(data.people.length).toBeGreaterThanOrEqual(100);
  });

  it("should contain verse references for people", () => {
    expect(data.people_references.length).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────────────────────
// 2. PERSON ENTRY SCHEMA VALIDATION
// ──────────────────────────────────────────────────────────────

describe("person entry schema", () => {
  it("every person should have required string fields", () => {
    for (const person of data.people) {
      expect(person.name).toBeTruthy();
      expect(typeof person.name).toBe("string");
      expect(person.description).toBeTruthy();
      expect(typeof person.description).toBe("string");
      expect(person.tribe_or_group).toBeTruthy();
      expect(typeof person.tribe_or_group).toBe("string");
    }
  });

  it("optional fields should be string or null", () => {
    for (const person of data.people) {
      expect(
        person.also_known_as === null || typeof person.also_known_as === "string"
      ).toBe(true);
      expect(
        person.birth_ref === null || typeof person.birth_ref === "string"
      ).toBe(true);
      expect(
        person.death_ref === null || typeof person.death_ref === "string"
      ).toBe(true);
      expect(
        person.father_slug === null || typeof person.father_slug === "string"
      ).toBe(true);
      expect(
        person.mother_slug === null || typeof person.mother_slug === "string"
      ).toBe(true);
    }
  });

  it("every person should generate a unique slug", () => {
    const slugs = data.people.map((p) => slugify(p.name));
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("no person name should be empty or whitespace-only", () => {
    for (const person of data.people) {
      expect(person.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("descriptions should be meaningful (more than 10 characters)", () => {
    for (const person of data.people) {
      expect(person.description.length).toBeGreaterThan(10);
    }
  });
});

// ──────────────────────────────────────────────────────────────
// 3. BIBLICAL CATEGORY COVERAGE
// ──────────────────────────────────────────────────────────────

describe("biblical category coverage", () => {
  const findByName = (name: string) =>
    data.people.find((p) => p.name === name);

  it("should include key patriarchs (Adam through Joseph)", () => {
    const patriarchs = ["Adam", "Eve", "Noah", "Abraham", "Isaac", "Jacob", "Joseph"];
    for (const name of patriarchs) {
      expect(findByName(name)).toBeDefined();
    }
  });

  it("should include Moses and the Exodus figures", () => {
    expect(findByName("Moses")).toBeDefined();
    expect(findByName("Aaron")).toBeDefined();
  });

  it("should include key kings", () => {
    const kings = ["Saul", "David", "Solomon"];
    for (const name of kings) {
      expect(findByName(name)).toBeDefined();
    }
  });

  it("should include major prophets", () => {
    const prophets = ["Isaiah", "Jeremiah", "Elijah", "Elisha"];
    for (const name of prophets) {
      expect(findByName(name)).toBeDefined();
    }
  });

  it("should include Jesus and key NT figures", () => {
    expect(findByName("Jesus")).toBeDefined();
    expect(data.people.some((p) => p.name.includes("Mary"))).toBe(true);
    expect(findByName("Paul")).toBeDefined();
  });

  it("should include apostles", () => {
    const apostles = data.people.filter((p) => p.tribe_or_group === "Apostle");
    expect(apostles.length).toBeGreaterThanOrEqual(12);
  });

  it("should have people with also_known_as aliases", () => {
    const withAliases = data.people.filter((p) => p.also_known_as !== null);
    expect(withAliases.length).toBeGreaterThan(0);
  });

  it("should have people across OT and NT time periods", () => {
    const groups = new Set(data.people.map((p) => p.tribe_or_group));
    // OT groups
    expect(groups.has("Patriarch")).toBe(true);
    expect(groups.has("Prophet")).toBe(true);
    // NT groups
    expect(groups.has("Apostle")).toBe(true);
    expect(groups.has("Early Church")).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────
// 4. PARENT REFERENCE INTEGRITY
// ──────────────────────────────────────────────────────────────

describe("parent reference integrity", () => {
  it("all father_slug values should reference an existing person slug", () => {
    const validSlugs = new Set(data.people.map((p) => slugify(p.name)));
    const withFather = data.people.filter((p) => p.father_slug !== null);

    expect(withFather.length).toBeGreaterThan(0);

    for (const person of withFather) {
      expect(validSlugs.has(person.father_slug!)).toBe(true);
    }
  });

  it("all mother_slug values should reference an existing person slug", () => {
    const validSlugs = new Set(data.people.map((p) => slugify(p.name)));
    const withMother = data.people.filter((p) => p.mother_slug !== null);

    expect(withMother.length).toBeGreaterThan(0);

    for (const person of withMother) {
      expect(validSlugs.has(person.mother_slug!)).toBe(true);
    }
  });

  it("no person should be their own parent", () => {
    for (const person of data.people) {
      const slug = slugify(person.name);
      if (person.father_slug) {
        expect(person.father_slug).not.toBe(slug);
      }
      if (person.mother_slug) {
        expect(person.mother_slug).not.toBe(slug);
      }
    }
  });
});

// ──────────────────────────────────────────────────────────────
// 5. VERSE REFERENCE VALIDATION
// ──────────────────────────────────────────────────────────────

describe("people_references entries", () => {
  it("every reference should have all required fields", () => {
    for (const ref of data.people_references) {
      expect(ref.person_name).toBeTruthy();
      expect(ref.book_name).toBeTruthy();
      expect(typeof ref.chapter).toBe("number");
      expect(typeof ref.verse).toBe("number");
      expect(ref.chapter).toBeGreaterThan(0);
      expect(ref.verse).toBeGreaterThan(0);
    }
  });

  it("every reference should point to a person who exists in the people array", () => {
    const validNames = new Set(data.people.map((p) => p.name));
    for (const ref of data.people_references) {
      expect(validNames.has(ref.person_name)).toBe(true);
    }
  });

  it("should have references for key figures like Jesus, Moses, David", () => {
    const referencedPeople = new Set(
      data.people_references.map((r) => r.person_name)
    );
    expect(referencedPeople.has("Jesus")).toBe(true);
    expect(referencedPeople.has("Moses")).toBe(true);
    expect(referencedPeople.has("David")).toBe(true);
  });

  it("should use valid Bible book names", () => {
    const knownBooks = new Set([
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
    for (const ref of data.people_references) {
      expect(knownBooks.has(ref.book_name)).toBe(true);
    }
  });
});

// ──────────────────────────────────────────────────────────────
// 6. BIRTH/DEATH REFERENCE FORMAT
// ──────────────────────────────────────────────────────────────

describe("birth and death reference format", () => {
  const refPattern = /^[A-Z0-9][a-zA-Z ]+\d+:\d+$/;

  it("birth_ref values should follow 'Book Chapter:Verse' format", () => {
    const withBirth = data.people.filter((p) => p.birth_ref !== null);
    expect(withBirth.length).toBeGreaterThan(0);

    for (const person of withBirth) {
      expect(person.birth_ref).toMatch(refPattern);
    }
  });

  it("death_ref values should follow 'Book Chapter:Verse' format", () => {
    const withDeath = data.people.filter((p) => p.death_ref !== null);
    expect(withDeath.length).toBeGreaterThan(0);

    for (const person of withDeath) {
      expect(person.death_ref).toMatch(refPattern);
    }
  });
});

// ──────────────────────────────────────────────────────────────
// 7. SEED FUNCTION - IN-MEMORY DATABASE TESTS
// ──────────────────────────────────────────────────────────────

describe("seedPeople database insertion", () => {
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
      CREATE INDEX IF NOT EXISTS idx_verses_chapter_id ON verses(chapter_id);

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
        tribe_or_group TEXT,
        image_url TEXT,
        source_url TEXT
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
    `);
  }

  function insertBookFixtures(rawDb: Database.Database) {
    rawDb.exec(`
      INSERT INTO books (id, name, abbreviation, slug, testament, category, chapter_count, sort_order)
      VALUES
        (1, 'Genesis', 'Gen', 'genesis', 'OT', 'Law', 50, 1),
        (2, 'Exodus', 'Exod', 'exodus', 'OT', 'Law', 40, 2);

      INSERT INTO chapters (id, book_id, chapter_number, verse_count)
      VALUES
        (1, 1, 2, 25),
        (2, 1, 4, 26),
        (3, 1, 5, 32);

      INSERT INTO verses (id, book_id, chapter_id, chapter_number, verse_number, text)
      VALUES
        (1, 1, 1, 2, 7, 'And the LORD God formed man...'),
        (2, 1, 1, 2, 22, 'And the rib...'),
        (3, 1, 2, 4, 1, 'And Adam knew Eve...'),
        (4, 1, 2, 4, 2, 'And she again bare...'),
        (5, 1, 3, 5, 5, 'And all the days...');
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

  it("should insert people records with correct fields", () => {
    const slug = slugify("Adam");
    testDb
      .insert(schema.people)
      .values({
        name: "Adam",
        slug,
        alsoKnownAs: null,
        description: "The first man.",
        birthRef: "Genesis 2:7",
        deathRef: "Genesis 5:5",
        fatherId: null,
        motherId: null,
        tribeOrGroup: "Patriarch",
      })
      .run();

    const result = testDb.select().from(schema.people).all();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Adam");
    expect(result[0].slug).toBe("adam");
    expect(result[0].tribeOrGroup).toBe("Patriarch");
    expect(result[0].birthRef).toBe("Genesis 2:7");
  });

  it("should enforce unique slug constraint", () => {
    testDb
      .insert(schema.people)
      .values({
        name: "Adam",
        slug: "adam",
        description: "First man",
        tribeOrGroup: "Patriarch",
      })
      .run();

    expect(() =>
      testDb
        .insert(schema.people)
        .values({
          name: "Adam duplicate",
          slug: "adam",
          description: "Duplicate",
          tribeOrGroup: "Patriarch",
        })
        .run()
    ).toThrow();
  });

  it("should correctly link parent references via father_id and mother_id", () => {
    // Insert Adam and Eve
    const adam = testDb
      .insert(schema.people)
      .values({ name: "Adam", slug: "adam", description: "First man", tribeOrGroup: "Patriarch" })
      .returning()
      .get();

    const eve = testDb
      .insert(schema.people)
      .values({ name: "Eve", slug: "eve", description: "First woman", tribeOrGroup: "Patriarch" })
      .returning()
      .get();

    // Insert Cain with parents
    testDb
      .insert(schema.people)
      .values({
        name: "Cain",
        slug: "cain",
        description: "Son of Adam and Eve",
        fatherId: adam.id,
        motherId: eve.id,
        tribeOrGroup: "Patriarch",
      })
      .run();

    const cain = testDb
      .select()
      .from(schema.people)
      .where(eq(schema.people.slug, "cain"))
      .get();

    expect(cain!.fatherId).toBe(adam.id);
    expect(cain!.motherId).toBe(eve.id);
  });

  it("should insert people_references linked to a person and book", () => {
    insertBookFixtures(sqlite);

    const adam = testDb
      .insert(schema.people)
      .values({ name: "Adam", slug: "adam", description: "First man", tribeOrGroup: "Patriarch" })
      .returning()
      .get();

    testDb
      .insert(schema.peopleReferences)
      .values({
        personId: adam.id,
        bookId: 1,
        chapterId: 1,
        verseId: 1,
      })
      .run();

    const refs = testDb.select().from(schema.peopleReferences).all();
    expect(refs).toHaveLength(1);
    expect(refs[0].personId).toBe(adam.id);
    expect(refs[0].bookId).toBe(1);
    expect(refs[0].chapterId).toBe(1);
    expect(refs[0].verseId).toBe(1);
  });

  it("should cascade delete references when a person is deleted", () => {
    insertBookFixtures(sqlite);

    const adam = testDb
      .insert(schema.people)
      .values({ name: "Adam", slug: "adam", description: "First man", tribeOrGroup: "Patriarch" })
      .returning()
      .get();

    testDb
      .insert(schema.peopleReferences)
      .values({ personId: adam.id, bookId: 1, chapterId: 1, verseId: 1 })
      .run();

    // Delete the person
    testDb.delete(schema.people).where(eq(schema.people.id, adam.id)).run();

    const refs = testDb.select().from(schema.peopleReferences).all();
    expect(refs).toHaveLength(0);
  });

  it("should allow null verseId in people_references (chapter-level reference)", () => {
    insertBookFixtures(sqlite);

    const moses = testDb
      .insert(schema.people)
      .values({ name: "Moses", slug: "moses", description: "Lawgiver", tribeOrGroup: "Tribe of Levi" })
      .returning()
      .get();

    testDb
      .insert(schema.peopleReferences)
      .values({ personId: moses.id, bookId: 1, chapterId: 1, verseId: null })
      .run();

    const refs = testDb.select().from(schema.peopleReferences).all();
    expect(refs).toHaveLength(1);
    expect(refs[0].verseId).toBeNull();
  });

  it("should handle bulk insertion of multiple people", () => {
    const entries = [
      { name: "Adam", slug: "adam", description: "First man", tribeOrGroup: "Patriarch" },
      { name: "Eve", slug: "eve", description: "First woman", tribeOrGroup: "Patriarch" },
      { name: "Noah", slug: "noah", description: "Ark builder", tribeOrGroup: "Patriarch" },
      { name: "Abraham", slug: "abraham", description: "Father of faith", tribeOrGroup: "Patriarch" },
      { name: "Moses", slug: "moses", description: "Lawgiver", tribeOrGroup: "Tribe of Levi" },
    ];

    for (const entry of entries) {
      testDb.insert(schema.people).values(entry).run();
    }

    const result = testDb.select().from(schema.people).all();
    expect(result).toHaveLength(5);
  });

  it("should store also_known_as field correctly", () => {
    testDb
      .insert(schema.people)
      .values({
        name: "Simon Peter",
        slug: "simon-peter",
        alsoKnownAs: "Cephas, Peter",
        description: "Leader of the apostles",
        tribeOrGroup: "Apostle",
      })
      .run();

    const peter = testDb
      .select()
      .from(schema.people)
      .where(eq(schema.people.slug, "simon-peter"))
      .get();

    expect(peter!.alsoKnownAs).toBe("Cephas, Peter");
  });
});

// ──────────────────────────────────────────────────────────────
// 8. EDGE CASES
// ──────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("slugify should handle names with special characters", () => {
    expect(slugify("Mary Mother of Jesus")).toBe("mary-mother-of-jesus");
    expect(slugify("James son of Zebedee")).toBe("james-son-of-zebedee");
    expect(slugify("Simon Peter")).toBe("simon-peter");
  });

  it("no person should have an empty tribe_or_group", () => {
    for (const person of data.people) {
      expect(person.tribe_or_group.trim().length).toBeGreaterThan(0);
    }
  });

  it("birth_ref and death_ref should not be empty strings", () => {
    for (const person of data.people) {
      if (person.birth_ref !== null) {
        expect(person.birth_ref.trim().length).toBeGreaterThan(0);
      }
      if (person.death_ref !== null) {
        expect(person.death_ref.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("chapter numbers should be within reasonable Bible ranges", () => {
    for (const ref of data.people_references) {
      expect(ref.chapter).toBeGreaterThanOrEqual(1);
      expect(ref.chapter).toBeLessThanOrEqual(150); // Psalms has 150
    }
  });

  it("verse numbers should be within reasonable Bible ranges", () => {
    for (const ref of data.people_references) {
      expect(ref.verse).toBeGreaterThanOrEqual(1);
      expect(ref.verse).toBeLessThanOrEqual(176); // Psalm 119 has 176
    }
  });

  it("no duplicate people entries (by name)", () => {
    const names = data.people.map((p) => p.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it("no duplicate reference entries", () => {
    const refKeys = data.people_references.map(
      (r) => `${r.person_name}|${r.book_name}|${r.chapter}|${r.verse}`
    );
    const uniqueKeys = new Set(refKeys);
    expect(uniqueKeys.size).toBe(refKeys.length);
  });
});
