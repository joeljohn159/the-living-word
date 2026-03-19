/**
 * Seeds dictionary words (archaic KJV vocabulary) into the dictionary table.
 * Uses data/dictionary.json as the source.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { eq, and } from "drizzle-orm";
import { seedDb as db } from "../seed-connection";
import { dictionary, verses, books } from "../schema";

interface DictionaryEntry {
  word: string;
  slug: string;
  definition: string;
  modernEquivalent: string | null;
  partOfSpeech: string | null;
  pronunciation: string | null;
  usageNotes: string | null;
  exampleRef: string | null;
}

/**
 * Parse a scripture reference like "Genesis 1:1" into { bookName, chapter, verse }.
 */
function parseRef(ref: string): { bookName: string; chapter: number; verse: number } | null {
  if (!ref) return null;

  // Match patterns like "1 Samuel 3:4", "Genesis 1:1", "Psalm 23:4"
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return null;

  let bookName = match[1].trim();
  const chapter = parseInt(match[2], 10);
  const verse = parseInt(match[3], 10);

  // Handle "Psalm" -> "Psalms" mapping
  if (bookName === "Psalm") bookName = "Psalms";

  return { bookName, chapter, verse };
}

export function seedDictionary(): void {
  console.log("📖 Seeding dictionary...");

  // Check if dictionary already seeded
  const existing = db.select().from(dictionary).all();
  if (existing.length > 0) {
    console.log(`   Dictionary already seeded (${existing.length} records), skipping`);
    return;
  }

  const dataPath = resolve(process.cwd(), "data/dictionary.json");
  const raw = readFileSync(dataPath, "utf-8");
  const entries: DictionaryEntry[] = JSON.parse(raw);

  // Build book name → id lookup
  const allBooks = db.select().from(books).all();
  const bookNameMap = new Map<string, number>();
  for (const book of allBooks) {
    bookNameMap.set(book.name, book.id);
  }

  let insertedCount = 0;
  let verseLinkedCount = 0;

  for (const entry of entries) {
    // Try to resolve the example verse reference
    let exampleVerseId: number | null = null;

    if (entry.exampleRef) {
      const parsed = parseRef(entry.exampleRef);
      if (parsed) {
        const bookId = bookNameMap.get(parsed.bookName);
        if (bookId) {
          const verse = db
            .select()
            .from(verses)
            .where(
              and(
                eq(verses.bookId, bookId),
                eq(verses.chapterNumber, parsed.chapter),
                eq(verses.verseNumber, parsed.verse),
              ),
            )
            .get();

          if (verse) {
            exampleVerseId = verse.id;
            verseLinkedCount++;
          }
        }
      }
    }

    try {
      db.insert(dictionary)
        .values({
          word: entry.word,
          slug: entry.slug,
          definition: entry.definition,
          modernEquivalent: entry.modernEquivalent,
          partOfSpeech: entry.partOfSpeech,
          pronunciation: entry.pronunciation,
          usageNotes: entry.usageNotes,
          exampleVerseId,
        })
        .run();

      insertedCount++;
    } catch (err) {
      // Skip duplicates silently
      if (err instanceof Error && err.message.includes("UNIQUE")) {
        continue;
      }
      throw err;
    }
  }

  console.log(`   ✓ ${insertedCount} dictionary words inserted`);
  console.log(`   ✓ ${verseLinkedCount} linked to example verses`);
}
