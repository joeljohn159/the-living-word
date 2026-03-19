/**
 * Seeds biblical journeys with stops, coordinates, and scripture references.
 * Links journey stops to existing locations when available.
 */

import { seedDb as db } from "../seed-connection";
import { journeys, journeyStops } from "../schema";
import journeysData from "../../../data/journeys.json";

interface JourneyStopData {
  name: string;
  description?: string;
  scriptureRef?: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
}

interface JourneyData {
  name: string;
  slug: string;
  description?: string;
  personName?: string;
  color?: string;
  stops: JourneyStopData[];
}

export function seedJourneys(locationIdMap: Map<string, number>): void {
  console.log("🗺️  Seeding biblical journeys...");

  const data = journeysData as JourneyData[];

  // Check if journeys are already seeded
  const existingJourneys = db.select().from(journeys).all();
  if (existingJourneys.length >= data.length) {
    console.log(`   Journeys already seeded (${existingJourneys.length} records), skipping`);
    return;
  }

  // Clear partial data
  if (existingJourneys.length > 0) {
    console.log("   Clearing partial journey data...");
    db.delete(journeyStops).run();
    db.delete(journeys).run();
  }

  let totalStops = 0;

  for (const journey of data) {
    const journeyResult = db
      .insert(journeys)
      .values({
        name: journey.name,
        slug: journey.slug,
        description: journey.description ?? null,
        personName: journey.personName ?? null,
        color: journey.color ?? "#C4975C",
      })
      .returning()
      .get();

    for (const stop of journey.stops) {
      // Try to match stop name to an existing location
      const locationId = findLocationId(stop.name, locationIdMap);

      db.insert(journeyStops)
        .values({
          journeyId: journeyResult.id,
          locationId: locationId ?? null,
          stopOrder: stop.stopOrder,
          name: stop.name,
          description: stop.description ?? null,
          scriptureRef: stop.scriptureRef ?? null,
          latitude: stop.latitude,
          longitude: stop.longitude,
        })
        .run();

      totalStops++;
    }
  }

  console.log(`   ✓ ${data.length} journeys with ${totalStops} stops inserted`);
}

/**
 * Attempts to match a journey stop name to a location in the map.
 * Handles partial matches (e.g., "Jordan River (Baptism)" → "Jordan River").
 */
function findLocationId(
  stopName: string,
  locationIdMap: Map<string, number>
): number | null {
  // Direct match
  if (locationIdMap.has(stopName)) {
    return locationIdMap.get(stopName)!;
  }

  // Try matching without parenthetical suffixes
  const baseName = stopName.replace(/\s*\(.*\)$/, "").trim();
  if (locationIdMap.has(baseName)) {
    return locationIdMap.get(baseName)!;
  }

  // Try matching by checking if any location name is contained in the stop name
  const entries = Array.from(locationIdMap.entries());
  for (const [locName, locId] of entries) {
    if (stopName.includes(locName) && locName.length > 3) {
      return locId;
    }
  }

  return null;
}
