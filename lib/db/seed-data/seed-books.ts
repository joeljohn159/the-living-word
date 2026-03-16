/**
 * Seeds all 66 books with full metadata.
 * Returns a map of sortOrder (1-66) → inserted book ID.
 */

import { db } from "../connection";
import { books } from "../schema";
import { BOOK_METADATA } from "./book-metadata";
import { slugify } from "../../utils";

export function seedBooks(): Map<number, number> {
  console.log("📖 Seeding 66 books...");

  const bookIdMap = new Map<number, number>();

  // Check if books are already seeded
  const existingBooks = db.select().from(books).all();
  if (existingBooks.length === 66) {
    console.log("   Books already seeded, using existing records");
    for (const book of existingBooks) {
      bookIdMap.set(book.sortOrder, book.id);
    }
    return bookIdMap;
  }

  // Clear existing books if partial seed
  if (existingBooks.length > 0) {
    console.log("   Clearing partial book data...");
    db.delete(books).run();
  }

  for (const meta of BOOK_METADATA) {
    const result = db
      .insert(books)
      .values({
        name: meta.name,
        abbreviation: meta.abbreviation,
        slug: slugify(meta.name),
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

  console.log("   ✓ 66 books inserted");
  return bookIdMap;
}
