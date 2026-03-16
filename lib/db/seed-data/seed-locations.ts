/**
 * Seeds 100+ biblical locations with real geographic coordinates.
 * Returns a map of location name → inserted location ID.
 */

import { db } from "../connection";
import { locations } from "../schema";
import { slugify } from "../../utils";
import locationsData from "../../../data/locations.json";

interface LocationData {
  name: string;
  locationType: "city" | "mountain" | "river" | "sea" | "region" | "desert" | "valley" | "island";
  latitude: number;
  longitude: number;
  modernName?: string;
  description?: string;
}

export function seedLocations(): Map<string, number> {
  console.log("📍 Seeding biblical locations...");

  const locationIdMap = new Map<string, number>();
  const data = locationsData as LocationData[];

  // Check if locations are already seeded
  const existingLocations = db.select().from(locations).all();
  if (existingLocations.length >= data.length) {
    console.log(`   Locations already seeded (${existingLocations.length} records), using existing`);
    for (const loc of existingLocations) {
      locationIdMap.set(loc.name, loc.id);
    }
    return locationIdMap;
  }

  // Clear partial data
  if (existingLocations.length > 0) {
    console.log("   Clearing partial location data...");
    db.delete(locations).run();
  }

  for (const loc of data) {
    const result = db
      .insert(locations)
      .values({
        name: loc.name,
        slug: slugify(loc.name),
        description: loc.description ?? null,
        locationType: loc.locationType,
        latitude: loc.latitude,
        longitude: loc.longitude,
        modernName: loc.modernName ?? null,
        imageUrl: null,
      })
      .returning()
      .get();

    locationIdMap.set(loc.name, result.id);
  }

  console.log(`   ✓ ${data.length} locations inserted`);
  return locationIdMap;
}
