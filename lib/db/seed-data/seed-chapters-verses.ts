/**
 * Seeds all chapters and verses from downloaded KJV data.
 * Uses batched inserts inside transactions for performance.
 */

import { seedDb as db, getRawDb } from "../seed-connection";
import { chapters, verses } from "../schema";
import type { KjvVerse } from "./fetch-kjv";
import { CHAPTER_SUMMARIES } from "./chapter-summaries";

const VERSE_BATCH_SIZE = 500;

interface ChapterInfo {
  bookId: number;
  bookNum: number;
  chapterNum: number;
  verseCount: number;
}

export function seedChaptersAndVerses(
  kjvVerses: KjvVerse[],
  bookIdMap: Map<number, number>,
): void {
  console.log("📝 Seeding chapters and verses...");

  const rawDb = getRawDb();

  // Check if verses already exist
  const existingCount = db.select().from(verses).all().length;
  if (existingCount > 30000) {
    console.log(
      `   Already seeded (${existingCount.toLocaleString()} verses found). Skipping.`,
    );
    return;
  }

  // Clear partial data
  if (existingCount > 0) {
    console.log("   Clearing partial verse/chapter data...");
    db.delete(verses).run();
    db.delete(chapters).run();
  }

  // Group verses by book and chapter to determine chapter info
  const chapterMap = new Map<string, ChapterInfo>();
  for (const verse of kjvVerses) {
    const key = `${verse.b}-${verse.c}`;
    const bookId = bookIdMap.get(verse.b);
    if (!bookId) {
      console.warn(`   ⚠ Unknown book number: ${verse.b}`);
      continue;
    }

    if (!chapterMap.has(key)) {
      chapterMap.set(key, {
        bookId,
        bookNum: verse.b,
        chapterNum: verse.c,
        verseCount: 0,
      });
    }
    chapterMap.get(key)!.verseCount++;
  }

  // Insert chapters
  console.log(`   Inserting ${chapterMap.size.toLocaleString()} chapters...`);

  const chapterIdMap = new Map<string, number>();

  const insertChapter = rawDb.prepare(`
    INSERT INTO chapters (book_id, chapter_number, verse_count, summary)
    VALUES (?, ?, ?, ?)
  `);

  const chapterEntries = Array.from(chapterMap.entries());

  const insertChaptersTx = rawDb.transaction(() => {
    for (const entry of chapterEntries) {
      const key = entry[0];
      const info = entry[1];
      const summary = CHAPTER_SUMMARIES[`${info.bookNum}-${info.chapterNum}`] || null;
      const result = insertChapter.run(
        info.bookId,
        info.chapterNum,
        info.verseCount,
        summary,
      );
      chapterIdMap.set(key, Number(result.lastInsertRowid));
    }
  });

  insertChaptersTx();
  console.log(`   ✓ ${chapterMap.size.toLocaleString()} chapters inserted`);

  // Insert verses in batches
  console.log(`   Inserting ${kjvVerses.length.toLocaleString()} verses...`);

  const insertVerse = rawDb.prepare(`
    INSERT INTO verses (book_id, chapter_id, chapter_number, verse_number, text)
    VALUES (?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  const totalVerses = kjvVerses.length;

  const insertBatch = rawDb.transaction((batch: KjvVerse[]) => {
    for (const verse of batch) {
      const bookId = bookIdMap.get(verse.b);
      const chapterId = chapterIdMap.get(`${verse.b}-${verse.c}`);

      if (!bookId || !chapterId) continue;

      insertVerse.run(bookId, chapterId, verse.c, verse.v, verse.t);
      inserted++;
    }
  });

  // Process in batches
  for (let i = 0; i < totalVerses; i += VERSE_BATCH_SIZE) {
    const batch = kjvVerses.slice(i, i + VERSE_BATCH_SIZE);
    insertBatch(batch);

    // Progress reporting
    const pct = Math.min(100, Math.round(((i + batch.length) / totalVerses) * 100));
    process.stdout.write(`\r   Progress: ${pct}% (${inserted.toLocaleString()} verses)`);
  }

  process.stdout.write("\n");
  console.log(`   ✓ ${inserted.toLocaleString()} verses inserted`);
}
