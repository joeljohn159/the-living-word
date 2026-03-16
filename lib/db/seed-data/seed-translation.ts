/**
 * Seeds the KJV translation record.
 */

import { db } from "../connection";
import { translations } from "../schema";
import { eq } from "drizzle-orm";

export function seedTranslation(): number {
  console.log("📚 Seeding KJV translation...");

  // Check if KJV already exists
  const existing = db
    .select()
    .from(translations)
    .where(eq(translations.abbreviation, "KJV"))
    .get();

  if (existing) {
    console.log("   KJV translation already exists (id: " + existing.id + ")");
    return existing.id;
  }

  const result = db
    .insert(translations)
    .values({
      name: "King James Version",
      abbreviation: "KJV",
      language: "en",
      description:
        "The Authorized King James Version of the Holy Bible, first published in 1611. " +
        "Commissioned by King James I of England, this translation has been the most widely " +
        "printed and distributed English Bible for over four centuries.",
      year: 1611,
      isDefault: true,
    })
    .returning()
    .get();

  console.log("   ✓ KJV translation inserted (id: " + result.id + ")");
  return result.id;
}
