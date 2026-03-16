/**
 * Seeds location_references linking locations to specific Bible verses.
 * Uses book name + chapter to create references via the books/chapters tables.
 */

import { eq, and } from "drizzle-orm";
import { db } from "../connection";
import { locationReferences, books, chapters } from "../schema";

interface LocationRef {
  locationName: string;
  bookName: string;
  chapterNumber: number;
}

/**
 * Key scripture references for major biblical locations.
 */
const LOCATION_REFS: LocationRef[] = [
  // Cities
  { locationName: "Jerusalem", bookName: "2 Samuel", chapterNumber: 5 },
  { locationName: "Jerusalem", bookName: "Psalms", chapterNumber: 122 },
  { locationName: "Jerusalem", bookName: "Isaiah", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "Matthew", chapterNumber: 23 },
  { locationName: "Bethlehem", bookName: "Micah", chapterNumber: 5 },
  { locationName: "Bethlehem", bookName: "Matthew", chapterNumber: 2 },
  { locationName: "Bethlehem", bookName: "Luke", chapterNumber: 2 },
  { locationName: "Nazareth", bookName: "Luke", chapterNumber: 2 },
  { locationName: "Nazareth", bookName: "Luke", chapterNumber: 4 },
  { locationName: "Babylon", bookName: "2 Kings", chapterNumber: 25 },
  { locationName: "Babylon", bookName: "Daniel", chapterNumber: 1 },
  { locationName: "Babylon", bookName: "Jeremiah", chapterNumber: 29 },
  { locationName: "Rome", bookName: "Acts", chapterNumber: 28 },
  { locationName: "Rome", bookName: "Romans", chapterNumber: 1 },
  { locationName: "Antioch of Syria", bookName: "Acts", chapterNumber: 11 },
  { locationName: "Antioch of Syria", bookName: "Acts", chapterNumber: 13 },
  { locationName: "Corinth", bookName: "Acts", chapterNumber: 18 },
  { locationName: "Damascus", bookName: "Acts", chapterNumber: 9 },
  { locationName: "Ephesus", bookName: "Acts", chapterNumber: 19 },
  { locationName: "Ephesus", bookName: "Ephesians", chapterNumber: 1 },
  { locationName: "Jericho", bookName: "Joshua", chapterNumber: 6 },
  { locationName: "Jericho", bookName: "Luke", chapterNumber: 19 },
  { locationName: "Hebron", bookName: "Genesis", chapterNumber: 23 },
  { locationName: "Hebron", bookName: "2 Samuel", chapterNumber: 2 },
  { locationName: "Capernaum", bookName: "Matthew", chapterNumber: 4 },
  { locationName: "Capernaum", bookName: "Mark", chapterNumber: 2 },
  { locationName: "Bethany", bookName: "John", chapterNumber: 11 },
  { locationName: "Bethany", bookName: "John", chapterNumber: 12 },
  { locationName: "Tyre", bookName: "Ezekiel", chapterNumber: 26 },
  { locationName: "Sidon", bookName: "1 Kings", chapterNumber: 17 },
  { locationName: "Nineveh", bookName: "Jonah", chapterNumber: 1 },
  { locationName: "Nineveh", bookName: "Nahum", chapterNumber: 1 },
  { locationName: "Ur of the Chaldees", bookName: "Genesis", chapterNumber: 11 },
  { locationName: "Haran", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Shechem", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Shechem", bookName: "Joshua", chapterNumber: 24 },
  { locationName: "Beersheba", bookName: "Genesis", chapterNumber: 21 },
  { locationName: "Bethel", bookName: "Genesis", chapterNumber: 28 },
  { locationName: "Shiloh", bookName: "Joshua", chapterNumber: 18 },
  { locationName: "Shiloh", bookName: "1 Samuel", chapterNumber: 1 },
  { locationName: "Megiddo", bookName: "Revelation", chapterNumber: 16 },
  { locationName: "Gaza", bookName: "Judges", chapterNumber: 16 },

  // Mountains
  { locationName: "Mount Sinai", bookName: "Exodus", chapterNumber: 19 },
  { locationName: "Mount Sinai", bookName: "Exodus", chapterNumber: 20 },
  { locationName: "Mount Ararat", bookName: "Genesis", chapterNumber: 8 },
  { locationName: "Mount Carmel", bookName: "1 Kings", chapterNumber: 18 },
  { locationName: "Mount of Olives", bookName: "Matthew", chapterNumber: 24 },
  { locationName: "Mount of Olives", bookName: "Acts", chapterNumber: 1 },
  { locationName: "Mount Zion", bookName: "Psalms", chapterNumber: 48 },
  { locationName: "Mount Moriah", bookName: "Genesis", chapterNumber: 22 },
  { locationName: "Mount Moriah", bookName: "2 Chronicles", chapterNumber: 3 },
  { locationName: "Mount Nebo", bookName: "Deuteronomy", chapterNumber: 34 },
  { locationName: "Mount Hermon", bookName: "Psalms", chapterNumber: 133 },
  { locationName: "Mount Tabor", bookName: "Judges", chapterNumber: 4 },
  { locationName: "Mount Gilboa", bookName: "1 Samuel", chapterNumber: 31 },
  { locationName: "Mount Ebal", bookName: "Deuteronomy", chapterNumber: 27 },
  { locationName: "Mount Gerizim", bookName: "Deuteronomy", chapterNumber: 11 },

  // Water bodies
  { locationName: "Jordan River", bookName: "Joshua", chapterNumber: 3 },
  { locationName: "Jordan River", bookName: "Matthew", chapterNumber: 3 },
  { locationName: "Sea of Galilee", bookName: "Matthew", chapterNumber: 4 },
  { locationName: "Sea of Galilee", bookName: "Mark", chapterNumber: 4 },
  { locationName: "Red Sea", bookName: "Exodus", chapterNumber: 14 },
  { locationName: "Dead Sea", bookName: "Genesis", chapterNumber: 19 },
  { locationName: "Nile River", bookName: "Exodus", chapterNumber: 7 },
  { locationName: "Euphrates River", bookName: "Genesis", chapterNumber: 2 },
  { locationName: "Jabbok River", bookName: "Genesis", chapterNumber: 32 },

  // Regions
  { locationName: "Canaan", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Canaan", bookName: "Joshua", chapterNumber: 1 },
  { locationName: "Galilee", bookName: "Matthew", chapterNumber: 4 },
  { locationName: "Galilee", bookName: "Isaiah", chapterNumber: 9 },
  { locationName: "Samaria Region", bookName: "John", chapterNumber: 4 },
  { locationName: "Judah", bookName: "1 Kings", chapterNumber: 12 },
  { locationName: "Goshen", bookName: "Genesis", chapterNumber: 47 },
  { locationName: "Edom", bookName: "Obadiah", chapterNumber: 1 },
  { locationName: "Moab", bookName: "Ruth", chapterNumber: 1 },
  { locationName: "Mesopotamia", bookName: "Genesis", chapterNumber: 24 },

  // Other
  { locationName: "Cana", bookName: "John", chapterNumber: 2 },
  { locationName: "Emmaus", bookName: "Luke", chapterNumber: 24 },
  { locationName: "Gethsemane", bookName: "Matthew", chapterNumber: 26 },
  { locationName: "Golgotha", bookName: "John", chapterNumber: 19 },
  { locationName: "Thessalonica", bookName: "Acts", chapterNumber: 17 },
  { locationName: "Philippi", bookName: "Acts", chapterNumber: 16 },
  { locationName: "Athens", bookName: "Acts", chapterNumber: 17 },
  { locationName: "Patmos", bookName: "Revelation", chapterNumber: 1 },
  { locationName: "Tarsus", bookName: "Acts", chapterNumber: 9 },
  { locationName: "Berea", bookName: "Acts", chapterNumber: 17 },
  { locationName: "Susa", bookName: "Esther", chapterNumber: 1 },
  { locationName: "Susa", bookName: "Daniel", chapterNumber: 8 },
];

export function seedLocationReferences(locationIdMap: Map<string, number>): void {
  console.log("🔗 Seeding location references...");

  // Check if references already exist
  const existingRefs = db.select().from(locationReferences).all();
  if (existingRefs.length >= LOCATION_REFS.length) {
    console.log(`   Location references already seeded (${existingRefs.length} records), skipping`);
    return;
  }

  // Clear partial data
  if (existingRefs.length > 0) {
    console.log("   Clearing partial location reference data...");
    db.delete(locationReferences).run();
  }

  let insertedCount = 0;
  let skippedCount = 0;

  for (const ref of LOCATION_REFS) {
    const locationId = locationIdMap.get(ref.locationName);
    if (!locationId) {
      skippedCount++;
      continue;
    }

    // Find the book by name
    const book = db
      .select()
      .from(books)
      .where(eq(books.name, ref.bookName))
      .get();

    if (!book) {
      skippedCount++;
      continue;
    }

    // Find the chapter
    const chapter = db
      .select()
      .from(chapters)
      .where(
        and(
          eq(chapters.bookId, book.id),
          eq(chapters.chapterNumber, ref.chapterNumber)
        )
      )
      .get();

    if (!chapter) {
      skippedCount++;
      continue;
    }

    db.insert(locationReferences)
      .values({
        locationId,
        bookId: book.id,
        chapterId: chapter.id,
      })
      .run();

    insertedCount++;
  }

  console.log(`   ✓ ${insertedCount} location references inserted (${skippedCount} skipped)`);
}
