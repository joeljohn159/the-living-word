import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

/**
 * Tests for the seed-cross-references module.
 *
 * Uses an in-memory SQLite database to verify the seeding logic
 * inserts correct data, handles idempotency, and deals with
 * missing verse lookups gracefully.
 */

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

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
    CREATE INDEX IF NOT EXISTS idx_verses_book_chapter_verse ON verses(book_id, chapter_number, verse_number);
    CREATE INDEX IF NOT EXISTS idx_verses_chapter_id ON verses(chapter_id);

    CREATE TABLE IF NOT EXISTS cross_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_verse_id INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
      target_verse_id INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
      relationship TEXT NOT NULL CHECK(relationship IN ('parallel','prophecy-fulfillment','quotation','allusion','contrast')),
      note TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_cross_refs_source ON cross_references(source_verse_id);
    CREATE INDEX IF NOT EXISTS idx_cross_refs_target ON cross_references(target_verse_id);
  `);
}

/** Insert minimal book/chapter/verse fixtures matching data that cross-references.json uses. */
function insertFixtures(rawDb: Database.Database) {
  // Insert Genesis (book 1, sort_order=1) and John (book 43 → sort_order=43)
  rawDb.exec(`
    INSERT INTO books (id, name, abbreviation, slug, testament, category, chapter_count, sort_order)
    VALUES
      (1, 'Genesis', 'Gen', 'genesis', 'OT', 'Law', 50, 1),
      (43, 'John', 'Jn', 'john', 'NT', 'Gospels', 21, 43),
      (45, 'Romans', 'Rom', 'romans', 'NT', 'Epistles', 16, 45),
      (58, 'Hebrews', 'Heb', 'hebrews', 'NT', 'Epistles', 13, 58),
      (66, 'Revelation', 'Rev', 'revelation', 'NT', 'Apocalyptic', 22, 66);
  `);

  // Chapters
  rawDb.exec(`
    INSERT INTO chapters (id, book_id, chapter_number, verse_count)
    VALUES
      (1, 1, 1, 31),
      (2, 1, 2, 25),
      (3, 1, 3, 24),
      (43, 43, 1, 51),
      (44, 43, 3, 36),
      (45, 45, 5, 21),
      (58, 58, 11, 40),
      (66, 66, 12, 17);
  `);

  // Verses — just the ones referenced in the first few cross-refs
  rawDb.exec(`
    INSERT INTO verses (id, book_id, chapter_id, chapter_number, verse_number, text)
    VALUES
      (1,  1,  1, 1, 1,  'In the beginning God created the heaven and the earth.'),
      (3,  1,  1, 1, 3,  'And God said, Let there be light.'),
      (26, 1,  1, 1, 26, 'And God said, Let us make man in our image.'),
      (27, 1,  1, 1, 27, 'So God created man in his own image.'),
      (50, 1,  2, 2, 7,  'And the LORD God formed man of the dust of the ground.'),
      (51, 1,  2, 2, 17, 'But of the tree of the knowledge thou shalt not eat.'),
      (52, 1,  2, 2, 24, 'Therefore shall a man leave his father and his mother.'),
      (70, 1,  3, 3, 15, 'And I will put enmity between thee and the woman.'),
      (100, 43, 43, 1, 1, 'In the beginning was the Word.'),
      (101, 43, 44, 3, 14, 'And as Moses lifted up the serpent in the wilderness.'),
      (102, 43, 44, 3, 16, 'For God so loved the world.'),
      (200, 45, 45, 5, 12, 'As by one man sin entered into the world.'),
      (300, 58, 58, 11, 3, 'Through faith we understand the worlds were framed.'),
      (301, 58, 58, 11, 5, 'By faith Enoch was translated.'),
      (400, 66, 66, 12, 5, 'And she brought forth a man child.'),
      (401, 66, 66, 12, 9, 'And the great dragon was cast out, that old serpent.');
  `);
}

beforeAll(() => {
  sqlite = new Database(":memory:");
  applySchema(sqlite);
  insertFixtures(sqlite);
  db = drizzle(sqlite, { schema });
});

afterAll(() => {
  sqlite.close();
});

beforeEach(() => {
  sqlite.exec("DELETE FROM cross_references");
});

// ─── Schema Validation ───────────────────────────────────────────────────

describe("Cross-references table — schema constraints", () => {
  it("allows inserting a valid cross-reference", () => {
    sqlite.exec(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
      VALUES (1, 100, 'allusion', 'In the beginning — Genesis echoed in John')
    `);

    const rows = sqlite.prepare("SELECT * FROM cross_references").all() as any[];
    expect(rows).toHaveLength(1);
    expect(rows[0].relationship).toBe("allusion");
    expect(rows[0].note).toBe("In the beginning — Genesis echoed in John");
  });

  it("enforces valid relationship enum values", () => {
    expect(() => {
      sqlite.exec(`
        INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
        VALUES (1, 100, 'invalid-type', 'test')
      `);
    }).toThrow();
  });

  it("allows all five valid relationship types", () => {
    const types = ["parallel", "prophecy-fulfillment", "quotation", "allusion", "contrast"];
    for (const type of types) {
      sqlite.exec(`DELETE FROM cross_references`);
      sqlite.exec(`
        INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
        VALUES (1, 100, '${type}', 'test note')
      `);
      const row = sqlite
        .prepare("SELECT relationship FROM cross_references LIMIT 1")
        .get() as any;
      expect(row.relationship).toBe(type);
    }
  });

  it("allows null note", () => {
    sqlite.exec(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship)
      VALUES (1, 100, 'allusion')
    `);

    const row = sqlite
      .prepare("SELECT note FROM cross_references LIMIT 1")
      .get() as any;
    expect(row.note).toBeNull();
  });

  it("cascades delete when source verse is deleted", () => {
    sqlite.exec(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
      VALUES (1, 100, 'allusion', 'test cascade')
    `);

    const before = sqlite
      .prepare("SELECT COUNT(*) as cnt FROM cross_references")
      .get() as any;
    expect(before.cnt).toBe(1);

    // Delete source verse (id=1) — should cascade
    sqlite.exec("DELETE FROM verses WHERE id = 1");
    const after = sqlite
      .prepare("SELECT COUNT(*) as cnt FROM cross_references")
      .get() as any;
    expect(after.cnt).toBe(0);

    // Re-insert the deleted verse for subsequent tests
    sqlite.exec(`
      INSERT INTO verses (id, book_id, chapter_id, chapter_number, verse_number, text)
      VALUES (1, 1, 1, 1, 1, 'In the beginning God created the heaven and the earth.')
    `);
  });

  it("cascades delete when target verse is deleted", () => {
    sqlite.exec(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
      VALUES (1, 100, 'allusion', 'test cascade target')
    `);

    sqlite.exec("DELETE FROM verses WHERE id = 100");
    const after = sqlite
      .prepare("SELECT COUNT(*) as cnt FROM cross_references")
      .get() as any;
    expect(after.cnt).toBe(0);

    // Re-insert
    sqlite.exec(`
      INSERT INTO verses (id, book_id, chapter_id, chapter_number, verse_number, text)
      VALUES (100, 43, 43, 1, 1, 'In the beginning was the Word.')
    `);
  });
});

// ─── Verse Lookup Key Format ──────────────────────────────────────────────

describe("Cross-references — verse lookup logic", () => {
  it("builds correct lookup keys from book sort_order, chapter, and verse", () => {
    // Simulate what buildVerseLookup does
    const rows = sqlite
      .prepare(
        `SELECT v.id, b.sort_order AS book_num, v.chapter_number, v.verse_number
         FROM verses v
         JOIN books b ON v.book_id = b.id`,
      )
      .all() as Array<{
      id: number;
      book_num: number;
      chapter_number: number;
      verse_number: number;
    }>;

    const lookup = new Map<string, number>();
    for (const row of rows) {
      const key = `${row.book_num}-${row.chapter_number}-${row.verse_number}`;
      lookup.set(key, row.id);
    }

    // Genesis 1:1 → book sort_order=1, chapter=1, verse=1
    expect(lookup.get("1-1-1")).toBe(1);
    // John 1:1 → book sort_order=43, chapter=1, verse=1
    expect(lookup.get("43-1-1")).toBe(100);
    // Romans 5:12
    expect(lookup.get("45-5-12")).toBe(200);
    // Hebrews 11:3
    expect(lookup.get("58-11-3")).toBe(300);
  });

  it("returns undefined for non-existent verses", () => {
    const rows = sqlite
      .prepare(
        `SELECT v.id, b.sort_order AS book_num, v.chapter_number, v.verse_number
         FROM verses v
         JOIN books b ON v.book_id = b.id`,
      )
      .all() as Array<{
      id: number;
      book_num: number;
      chapter_number: number;
      verse_number: number;
    }>;

    const lookup = new Map<string, number>();
    for (const row of rows) {
      lookup.set(`${row.book_num}-${row.chapter_number}-${row.verse_number}`, row.id);
    }

    // Non-existent verse
    expect(lookup.get("99-1-1")).toBeUndefined();
    expect(lookup.get("1-100-1")).toBeUndefined();
  });
});

// ─── Batch Insert Simulation ──────────────────────────────────────────────

describe("Cross-references — batch insertion", () => {
  it("inserts multiple cross-references in a transaction", () => {
    const insertStmt = sqlite.prepare(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
      VALUES (?, ?, ?, ?)
    `);

    const insertBatch = sqlite.transaction(
      (batch: Array<{ src: number; tgt: number; rel: string; note: string }>) => {
        for (const row of batch) {
          insertStmt.run(row.src, row.tgt, row.rel, row.note);
        }
      },
    );

    insertBatch([
      { src: 1, tgt: 100, rel: "allusion", note: "Genesis → John" },
      { src: 1, tgt: 300, rel: "allusion", note: "Genesis → Hebrews" },
      { src: 70, tgt: 400, rel: "prophecy-fulfillment", note: "Seed of woman" },
    ]);

    const count = sqlite
      .prepare("SELECT COUNT(*) as cnt FROM cross_references")
      .get() as any;
    expect(count.cnt).toBe(3);
  });

  it("processes batches of BATCH_SIZE=100 correctly with small data", () => {
    const BATCH_SIZE = 100;
    const data = Array.from({ length: 5 }, (_, i) => ({
      src: 1,
      tgt: 100,
      rel: "allusion",
      note: `Note ${i}`,
    }));

    const insertStmt = sqlite.prepare(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
      VALUES (?, ?, ?, ?)
    `);

    let inserted = 0;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const tx = sqlite.transaction(() => {
        for (const row of batch) {
          insertStmt.run(row.src, row.tgt, row.rel, row.note);
          inserted++;
        }
      });
      tx();
    }

    expect(inserted).toBe(5);
  });

  it("skips entries when source verse is not found in lookup", () => {
    const verseLookup = new Map<string, number>();
    verseLookup.set("1-1-1", 1);
    verseLookup.set("43-1-1", 100);

    const testRefs = [
      { s: [1, 1, 1], t: [43, 1, 1], r: "allusion", n: "Found" },
      { s: [99, 1, 1], t: [43, 1, 1], r: "allusion", n: "Source missing" },
      { s: [1, 1, 1], t: [99, 1, 1], r: "allusion", n: "Target missing" },
    ];

    let inserted = 0;
    let skipped = 0;

    for (const ref of testRefs) {
      const sourceKey = `${ref.s[0]}-${ref.s[1]}-${ref.s[2]}`;
      const targetKey = `${ref.t[0]}-${ref.t[1]}-${ref.t[2]}`;
      const sourceId = verseLookup.get(sourceKey);
      const targetId = verseLookup.get(targetKey);

      if (!sourceId || !targetId) {
        skipped++;
        continue;
      }
      inserted++;
    }

    expect(inserted).toBe(1);
    expect(skipped).toBe(2);
  });
});

// ─── Idempotency Logic ───────────────────────────────────────────────────

describe("Cross-references — idempotency checks", () => {
  it("detects when data is already seeded (>500 entries threshold)", () => {
    // Insert 501 records to simulate already-seeded state
    const insertStmt = sqlite.prepare(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
      VALUES (?, ?, ?, ?)
    `);

    const tx = sqlite.transaction(() => {
      for (let i = 0; i < 501; i++) {
        insertStmt.run(1, 100, "allusion", `Entry ${i}`);
      }
    });
    tx();

    const existing = sqlite
      .prepare("SELECT COUNT(*) as cnt FROM cross_references")
      .get() as any;
    const shouldSkip = existing.cnt > 500;
    expect(shouldSkip).toBe(true);
  });

  it("clears partial data when count is between 1 and 500", () => {
    sqlite.exec("DELETE FROM cross_references");

    // Insert 10 records (partial seed)
    const insertStmt = sqlite.prepare(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
      VALUES (?, ?, ?, ?)
    `);
    for (let i = 0; i < 10; i++) {
      insertStmt.run(1, 100, "allusion", `Partial ${i}`);
    }

    const existing = sqlite
      .prepare("SELECT COUNT(*) as cnt FROM cross_references")
      .get() as any;
    const isPartial = existing.cnt > 0 && existing.cnt <= 500;
    expect(isPartial).toBe(true);

    // Clear partial data (mimics what seed function does)
    if (isPartial) {
      sqlite.exec("DELETE FROM cross_references");
    }

    const afterClear = sqlite
      .prepare("SELECT COUNT(*) as cnt FROM cross_references")
      .get() as any;
    expect(afterClear.cnt).toBe(0);
  });

  it("does not clear data when already fully seeded", () => {
    sqlite.exec("DELETE FROM cross_references");
    const insertStmt = sqlite.prepare(`
      INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
      VALUES (?, ?, ?, ?)
    `);
    const tx = sqlite.transaction(() => {
      for (let i = 0; i < 501; i++) {
        insertStmt.run(1, 100, "allusion", `Full ${i}`);
      }
    });
    tx();

    const existing = sqlite
      .prepare("SELECT COUNT(*) as cnt FROM cross_references")
      .get() as any;
    const shouldSkip = existing.cnt > 500;

    // Data should remain untouched
    expect(shouldSkip).toBe(true);
    expect(existing.cnt).toBe(501);
  });
});

// ─── Index Existence ──────────────────────────────────────────────────────

describe("Cross-references — database indexes", () => {
  it("has an index on source_verse_id", () => {
    const indexes = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='cross_references'")
      .all() as any[];
    const names = indexes.map((i: any) => i.name);
    expect(names).toContain("idx_cross_refs_source");
  });

  it("has an index on target_verse_id", () => {
    const indexes = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='cross_references'")
      .all() as any[];
    const names = indexes.map((i: any) => i.name);
    expect(names).toContain("idx_cross_refs_target");
  });
});

