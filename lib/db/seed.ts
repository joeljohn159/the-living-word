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
import { seedPeople } from "./seed-data/seed-people";
import { seedMedia } from "./seed-data/seed-media";
import { seedEvidence } from "./seed-data/seed-evidence";
import { seedLocations } from "./seed-data/seed-locations";
import { seedJourneys } from "./seed-data/seed-journeys";
import { seedLocationReferences } from "./seed-data/seed-location-references";
import { seedCrossReferences } from "./seed-data/seed-cross-references";
import { seedDictionary } from "./seed-data/seed-dictionary";

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

    // Step 5: Insert biblical people and references
    seedPeople();

    // Step 6: Insert media (paintings & art)
    seedMedia();

    // Step 7: Insert archaeological evidence
    seedEvidence();

    // Step 8: Insert biblical locations
    const locationIdMap = seedLocations();

    // Step 9: Insert journeys with stops
    seedJourneys(locationIdMap);

    // Step 10: Insert location-to-scripture references
    seedLocationReferences(locationIdMap);

    // Step 11: Insert cross-references (500+ entries)
    seedCrossReferences();

    // Step 12: Insert dictionary (archaic KJV words)
    seedDictionary();

    console.log();
    console.log("✅ Seed complete! The Living Word database is ready.");
    console.log();
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
