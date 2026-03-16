/**
 * Seeds archaeological evidence and links them to books via evidence_references.
 * Uses data/evidence.json as the source.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { db } from "../connection";
import { evidence, evidenceReferences, books } from "../schema";
import { slugify } from "../../utils";

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

export function seedEvidence(): void {
  console.log("🏛️  Seeding archaeological evidence...");

  // Check if evidence already seeded
  const existing = db.select().from(evidence).all();
  if (existing.length > 0) {
    console.log(`   Evidence already seeded (${existing.length} records), skipping`);
    return;
  }

  const dataPath = resolve(process.cwd(), "data/evidence.json");
  const raw = readFileSync(dataPath, "utf-8");
  const entries: EvidenceEntry[] = JSON.parse(raw);

  // Build book name → id lookup
  const allBooks = db.select().from(books).all();
  const bookNameMap = new Map<string, number>();
  for (const book of allBooks) {
    bookNameMap.set(book.name, book.id);
  }

  let evidenceCount = 0;
  let refCount = 0;

  for (const entry of entries) {
    // Insert evidence record
    const result = db
      .insert(evidence)
      .values({
        title: entry.title,
        slug: entry.slug || slugify(entry.title),
        description: entry.description,
        category: entry.category,
        dateDiscovered: entry.date_discovered,
        locationFound: entry.location_found,
        currentLocation: entry.current_location,
        significance: entry.significance,
        imageUrl: entry.image_url,
        sourceUrl: entry.source_url,
      })
      .returning()
      .get();

    evidenceCount++;

    // Link to books
    for (const bookRef of entry.book_refs) {
      const bookId = bookNameMap.get(bookRef);
      if (bookId) {
        db.insert(evidenceReferences)
          .values({ evidenceId: result.id, bookId })
          .run();
        refCount++;
      } else {
        console.warn(`   ⚠ Book not found: "${bookRef}"`);
      }
    }
  }

  console.log(`   ✓ ${evidenceCount} evidence records inserted`);
  console.log(`   ✓ ${refCount} evidence references linked`);
}
