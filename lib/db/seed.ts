/**
 * Seed script for the KJV Bible database.
 *
 * Downloads KJV text from scrollmapper/bible_databases on GitHub,
 * then inserts all 66 books, 1,189 chapters, and 31,102 verses.
 *
 * Usage: npm run db:seed
 */

import { seedTranslation } from "./seed-data/seed-translation";
import { seedBooks } from "./seed-data/seed-books";
import { seedChaptersAndVerses } from "./seed-data/seed-chapters-verses";
import { fetchKjvData } from "./seed-data/fetch-kjv";

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   The Living Word — KJV Bible Seed Script   ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log();

  try {
    // Step 1: Download KJV data
    const kjvVerses = await fetchKjvData();

    // Step 2: Insert KJV translation
    seedTranslation();

    // Step 3: Insert all 66 books
    const bookIdMap = seedBooks();

    // Step 4: Insert chapters and verses
    seedChaptersAndVerses(kjvVerses, bookIdMap);

    console.log();
    console.log("✅ Seed complete! The Living Word database is ready.");
    console.log();
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
