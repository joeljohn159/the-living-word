/**
 * Seeds media (paintings/art) and links them to books and chapters via media_references.
 * Uses data/media-references.json as the source.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { eq, and } from "drizzle-orm";
import { seedDb as db } from "../seed-connection";
import { media, mediaReferences, books, chapters } from "../schema";

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
  chapter_refs?: number[];
}

export function seedMedia(): void {
  console.log("🎨 Seeding media (paintings & art)...");

  // Check if media already seeded
  const existing = db.select().from(media).all();
  if (existing.length > 0) {
    console.log(`   Media already seeded (${existing.length} records), skipping`);
    return;
  }

  const dataPath = resolve(process.cwd(), "data/media-references.json");
  const raw = readFileSync(dataPath, "utf-8");
  const entries: MediaEntry[] = JSON.parse(raw);

  // Build book name → id lookup
  const allBooks = db.select().from(books).all();
  const bookNameMap = new Map<string, number>();
  for (const book of allBooks) {
    bookNameMap.set(book.name, book.id);
  }

  let mediaCount = 0;
  let refCount = 0;

  for (const entry of entries) {
    // Insert media record
    const result = db
      .insert(media)
      .values({
        title: entry.title,
        description: entry.description,
        artist: entry.artist,
        yearCreated: entry.year_created,
        sourceUrl: entry.source_url,
        imageUrl: entry.image_url,
        attribution: entry.attribution,
        license: entry.license,
        mediaType: entry.media_type,
      })
      .returning()
      .get();

    mediaCount++;

    // Link to book
    const bookId = bookNameMap.get(entry.book_ref);
    if (bookId) {
      // If chapter_refs are specified, create a reference for each chapter
      if (entry.chapter_refs && entry.chapter_refs.length > 0) {
        for (const chapterNum of entry.chapter_refs) {
          const chapter = db
            .select()
            .from(chapters)
            .where(
              and(
                eq(chapters.bookId, bookId),
                eq(chapters.chapterNumber, chapterNum)
              )
            )
            .get();

          if (chapter) {
            db.insert(mediaReferences)
              .values({ mediaId: result.id, bookId, chapterId: chapter.id })
              .run();
            refCount++;
          }
        }
      } else {
        // Book-level reference only (fallback)
        db.insert(mediaReferences)
          .values({ mediaId: result.id, bookId })
          .run();
        refCount++;
      }
    } else {
      console.warn(`   ⚠ Book not found: "${entry.book_ref}"`);
    }
  }

  console.log(`   ✓ ${mediaCount} media records inserted`);
  console.log(`   ✓ ${refCount} media references linked`);
}
