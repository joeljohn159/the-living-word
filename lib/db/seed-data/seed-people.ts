/**
 * Seeds 100+ biblical figures and their verse references.
 * Reads from data/people.json and inserts into the people
 * and people_references tables.
 */

import fs from "fs";
import path from "path";
import { db } from "../connection";
import { people, peopleReferences, books, chapters, verses } from "../schema";
import { slugify } from "../../utils";
import { eq, and } from "drizzle-orm";

interface PersonEntry {
  name: string;
  also_known_as: string | null;
  description: string;
  birth_ref: string | null;
  death_ref: string | null;
  father_slug: string | null;
  mother_slug: string | null;
  tribe_or_group: string;
  image_url: string | null;
  source_url: string | null;
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

function loadPeopleData(): PeopleData {
  const filePath = path.join(process.cwd(), "data", "people.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as PeopleData;
}

export function seedPeople(): void {
  console.log("👤 Seeding biblical figures...");

  const data = loadPeopleData();

  // Check if already seeded
  const existing = db.select().from(people).all();
  if (existing.length >= data.people.length) {
    console.log(`   People already seeded (${existing.length} records)`);
    return;
  }

  // Clear partial data
  if (existing.length > 0) {
    console.log("   Clearing partial people data...");
    db.delete(peopleReferences).run();
    db.delete(people).run();
  }

  // Build a slug-to-id map for parent lookups
  const slugToId = new Map<string, number>();

  // Phase 1: Insert all people without parent references
  for (const entry of data.people) {
    const slug = slugify(entry.name);
    const result = db
      .insert(people)
      .values({
        name: entry.name,
        slug,
        alsoKnownAs: entry.also_known_as,
        description: entry.description,
        birthRef: entry.birth_ref,
        deathRef: entry.death_ref,
        fatherId: null,
        motherId: null,
        tribeOrGroup: entry.tribe_or_group,
        imageUrl: entry.image_url ?? null,
        sourceUrl: entry.source_url ?? null,
      })
      .returning()
      .get();

    slugToId.set(slug, result.id);
  }

  console.log(`   ✓ ${data.people.length} people inserted`);

  // Phase 2: Update parent references
  let parentLinks = 0;
  for (const entry of data.people) {
    const slug = slugify(entry.name);
    const personId = slugToId.get(slug);
    if (!personId) continue;

    const fatherId = entry.father_slug ? slugToId.get(entry.father_slug) : null;
    const motherId = entry.mother_slug ? slugToId.get(entry.mother_slug) : null;

    if (fatherId || motherId) {
      db.update(people)
        .set({
          fatherId: fatherId ?? null,
          motherId: motherId ?? null,
        })
        .where(eq(people.id, personId))
        .run();
      parentLinks++;
    }
  }

  console.log(`   ✓ ${parentLinks} parent relationships linked`);

  // Phase 3: Insert people references
  // Pre-load book name → id map
  const allBooks = db.select().from(books).all();
  const bookNameToId = new Map<string, number>();
  for (const book of allBooks) {
    bookNameToId.set(book.name, book.id);
  }

  // Pre-load person name → id map
  const personNameToId = new Map<string, number>();
  for (const entry of data.people) {
    const slug = slugify(entry.name);
    const id = slugToId.get(slug);
    if (id) personNameToId.set(entry.name, id);
  }

  let refsInserted = 0;
  let refsSkipped = 0;

  for (const ref of data.people_references) {
    const personId = personNameToId.get(ref.person_name);
    const bookId = bookNameToId.get(ref.book_name);

    if (!personId || !bookId) {
      refsSkipped++;
      continue;
    }

    // Look up chapter
    const chapter = db
      .select()
      .from(chapters)
      .where(
        and(
          eq(chapters.bookId, bookId),
          eq(chapters.chapterNumber, ref.chapter)
        )
      )
      .get();

    if (!chapter) {
      refsSkipped++;
      continue;
    }

    // Look up verse
    const verse = db
      .select()
      .from(verses)
      .where(
        and(
          eq(verses.chapterId, chapter.id),
          eq(verses.verseNumber, ref.verse)
        )
      )
      .get();

    db.insert(peopleReferences)
      .values({
        personId,
        bookId,
        chapterId: chapter.id,
        verseId: verse?.id ?? null,
      })
      .run();

    refsInserted++;
  }

  console.log(`   ✓ ${refsInserted} verse references linked`);
  if (refsSkipped > 0) {
    console.log(`   ⚠ ${refsSkipped} references skipped (missing data)`);
  }
}
