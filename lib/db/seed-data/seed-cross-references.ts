/**
 * Seeds 500+ cross-references from data/cross-references.json.
 *
 * Each entry maps a source verse to a target verse with a relationship
 * type (parallel, prophecy-fulfillment, quotation, allusion, contrast)
 * and a brief explanatory note.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { getRawDb } from "../seed-connection";
import { seedDb as db } from "../seed-connection";
import { crossReferences } from "../schema";

interface RawCrossRef {
  /** [bookNum, chapter, verse] */
  s: [number, number, number];
  /** [bookNum, chapter, verse] */
  t: [number, number, number];
  /** relationship type */
  r: "parallel" | "prophecy-fulfillment" | "quotation" | "allusion" | "contrast";
  /** brief note */
  n: string;
}

const BATCH_SIZE = 100;

/**
 * Looks up a verse ID by book sort order, chapter number, and verse number.
 * Returns null if the verse is not found in the database.
 */
function buildVerseLookup(rawDb: ReturnType<typeof getRawDb>): Map<string, number> {
  const lookup = new Map<string, number>();

  const rows = rawDb
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

  for (const row of rows) {
    const key = `${row.book_num}-${row.chapter_number}-${row.verse_number}`;
    lookup.set(key, row.id);
  }

  return lookup;
}

export function seedCrossReferences(): void {
  console.log("🔗 Seeding cross-references...");

  // Check if already seeded
  const existing = db.select().from(crossReferences).all();
  if (existing.length > 500) {
    console.log(`   Already seeded (${existing.length} cross-references found). Skipping.`);
    return;
  }

  // Clear partial data
  if (existing.length > 0) {
    console.log("   Clearing partial cross-reference data...");
    db.delete(crossReferences).run();
  }

  // Load cross-references JSON
  const jsonPath = resolve(process.cwd(), "data/cross-references.json");
  const rawData: RawCrossRef[] = JSON.parse(readFileSync(jsonPath, "utf-8"));
  console.log(`   Loaded ${rawData.length} cross-references from JSON`);

  // Build verse ID lookup
  const rawDb = getRawDb();
  const verseLookup = buildVerseLookup(rawDb);
  console.log(`   Built verse lookup with ${verseLookup.size} entries`);

  // Prepare insert statement
  const insertStmt = rawDb.prepare(`
    INSERT INTO cross_references (source_verse_id, target_verse_id, relationship, note)
    VALUES (?, ?, ?, ?)
  `);

  let inserted = 0;
  let skipped = 0;

  const insertBatch = rawDb.transaction((batch: RawCrossRef[]) => {
    for (const ref of batch) {
      const sourceKey = `${ref.s[0]}-${ref.s[1]}-${ref.s[2]}`;
      const targetKey = `${ref.t[0]}-${ref.t[1]}-${ref.t[2]}`;

      const sourceId = verseLookup.get(sourceKey);
      const targetId = verseLookup.get(targetKey);

      if (!sourceId || !targetId) {
        skipped++;
        continue;
      }

      insertStmt.run(sourceId, targetId, ref.r, ref.n);
      inserted++;
    }
  });

  // Process in batches
  for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
    const batch = rawData.slice(i, i + BATCH_SIZE);
    insertBatch(batch);

    const pct = Math.min(100, Math.round(((i + batch.length) / rawData.length) * 100));
    process.stdout.write(`\r   Progress: ${pct}% (${inserted} inserted)`);
  }

  process.stdout.write("\n");

  if (skipped > 0) {
    console.log(`   ⚠ Skipped ${skipped} entries (verse not found in database)`);
  }

  console.log(`   ✓ ${inserted} cross-references inserted`);
}
