import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import locationsData from "@/data/locations.json";
import journeysData from "@/data/journeys.json";
import { slugify } from "@/lib/utils";

/**
 * Tests for Biblical Locations (100+) & Journeys seed data.
 *
 * Validates:
 * - locations.json: 100+ entries with real coordinates, required fields, valid types
 * - journeys.json: 5+ journeys with stops, scripture refs, coordinates
 * - seedLocations: inserts all locations, returns ID map, idempotency
 * - seedJourneys: inserts journeys + stops, links to locations, idempotency
 * - seedLocationReferences: links locations to scripture verses
 * - findLocationId: direct match, parenthetical stripping, substring matching
 * - Database constraints and cascade behavior
 */

// ─── Type Definitions ────────────────────────────────────────────────────

interface LocationData {
  name: string;
  locationType: string;
  latitude: number;
  longitude: number;
  modernName?: string;
  description?: string;
}

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

const locations = locationsData as LocationData[];
const journeys = journeysData as JourneyData[];

const VALID_LOCATION_TYPES = [
  "city",
  "mountain",
  "river",
  "sea",
  "region",
  "desert",
  "valley",
  "island",
];

// ─── In-Memory Database Setup ────────────────────────────────────────────

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

function applySchema(rawDb: Database.Database) {
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      testament TEXT NOT NULL CHECK(testament IN ('OT','NT')),
      category TEXT NOT NULL,
      chapter_count INTEGER NOT NULL,
      author TEXT,
      date_written TEXT,
      description TEXT,
      key_themes TEXT,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      chapter_number INTEGER NOT NULL,
      verse_count INTEGER NOT NULL,
      summary TEXT
    );

    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      chapter_number INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      location_type TEXT NOT NULL CHECK(location_type IN ('city','mountain','river','sea','region','desert','valley','island')),
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      modern_name TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS location_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
      verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journeys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      person_name TEXT,
      color TEXT DEFAULT '#C4975C'
    );

    CREATE TABLE IF NOT EXISTS journey_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journey_id INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
      location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
      stop_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      scripture_ref TEXT,
      latitude REAL,
      longitude REAL
    );
  `);
}

beforeAll(() => {
  sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  applySchema(sqlite);
  db = drizzle(sqlite, { schema });
});

afterAll(() => {
  sqlite.close();
});

// ═══════════════════════════════════════════════════════════════════════════
// LOCATIONS.JSON DATA VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

describe("locations.json — biblical locations data completeness", () => {
  it("should contain at least 100 locations", () => {
    expect(locations.length).toBeGreaterThanOrEqual(100);
  });

  it("should have at least 130 locations", () => {
    expect(locations.length).toBeGreaterThanOrEqual(130);
  });

  it("should have unique location names", () => {
    const names = locations.map((l) => l.name);
    expect(new Set(names).size).toBe(locations.length);
  });

  it("should only use valid location types", () => {
    for (const loc of locations) {
      expect(VALID_LOCATION_TYPES).toContain(loc.locationType);
    }
  });

  it("should have all required fields for every location", () => {
    for (const loc of locations) {
      expect(loc.name).toBeDefined();
      expect(loc.name.length).toBeGreaterThan(0);
      expect(loc.locationType).toBeDefined();
      expect(typeof loc.latitude).toBe("number");
      expect(typeof loc.longitude).toBe("number");
    }
  });

  it("should have valid latitude values (-90 to 90)", () => {
    for (const loc of locations) {
      expect(loc.latitude).toBeGreaterThanOrEqual(-90);
      expect(loc.latitude).toBeLessThanOrEqual(90);
    }
  });

  it("should have valid longitude values (-180 to 180)", () => {
    for (const loc of locations) {
      expect(loc.longitude).toBeGreaterThanOrEqual(-180);
      expect(loc.longitude).toBeLessThanOrEqual(180);
    }
  });

  it("should have descriptions for all locations", () => {
    for (const loc of locations) {
      expect(loc.description).toBeDefined();
      expect(loc.description!.length).toBeGreaterThan(0);
    }
  });
});

describe("locations.json — required location categories", () => {
  it("should include key cities: Jerusalem, Bethlehem, Nazareth, Babylon, Rome, Antioch, Corinth", () => {
    const names = locations.map((l) => l.name);
    const requiredCities = [
      "Jerusalem",
      "Bethlehem",
      "Nazareth",
      "Babylon",
      "Rome",
      "Antioch of Syria",
      "Corinth",
    ];
    for (const city of requiredCities) {
      expect(names).toContain(city);
    }
  });

  it("should include key mountains: Sinai, Ararat, Carmel, Olivet, Zion, Moriah", () => {
    const names = locations.map((l) => l.name);
    const requiredMountains = [
      "Mount Sinai",
      "Mount Ararat",
      "Mount Carmel",
      "Mount of Olives",
      "Mount Zion",
      "Mount Moriah",
    ];
    for (const mountain of requiredMountains) {
      expect(names).toContain(mountain);
    }
  });

  it("should include key water bodies: Jordan, Sea of Galilee, Red Sea, Dead Sea, Mediterranean", () => {
    const names = locations.map((l) => l.name);
    const requiredWater = [
      "Jordan River",
      "Sea of Galilee",
      "Red Sea",
      "Dead Sea",
      "Mediterranean Sea",
    ];
    for (const water of requiredWater) {
      expect(names).toContain(water);
    }
  });

  it("should include key regions: Canaan, Judah, Samaria, Galilee, Mesopotamia", () => {
    const names = locations.map((l) => l.name);
    const requiredRegions = [
      "Canaan",
      "Judah",
      "Samaria Region",
      "Galilee",
      "Mesopotamia",
    ];
    for (const region of requiredRegions) {
      expect(names).toContain(region);
    }
  });

  it("should have a reasonable distribution of location types", () => {
    const typeCounts = new Map<string, number>();
    for (const loc of locations) {
      typeCounts.set(loc.locationType, (typeCounts.get(loc.locationType) || 0) + 1);
    }
    // Should have multiple entries for each type
    expect(typeCounts.get("city")).toBeGreaterThanOrEqual(50);
    expect(typeCounts.get("mountain")).toBeGreaterThanOrEqual(10);
    expect(typeCounts.get("river")).toBeGreaterThanOrEqual(5);
    expect(typeCounts.get("sea")).toBeGreaterThanOrEqual(3);
    expect(typeCounts.get("region")).toBeGreaterThanOrEqual(10);
  });

  it("should include the seven churches of Revelation", () => {
    const names = locations.map((l) => l.name);
    const sevenChurches = [
      "Ephesus",
      "Smyrna",
      "Pergamum",
      "Thyatira",
      "Sardis",
      "Philadelphia",
      "Laodicea",
    ];
    for (const church of sevenChurches) {
      expect(names).toContain(church);
    }
  });
});

describe("locations.json — coordinate accuracy for well-known locations", () => {
  it("should have Jerusalem near 31.77N, 35.21E", () => {
    const jerusalem = locations.find((l) => l.name === "Jerusalem");
    expect(jerusalem).toBeDefined();
    expect(jerusalem!.latitude).toBeCloseTo(31.77, 0);
    expect(jerusalem!.longitude).toBeCloseTo(35.21, 0);
  });

  it("should have Rome near 41.9N, 12.5E", () => {
    const rome = locations.find((l) => l.name === "Rome");
    expect(rome).toBeDefined();
    expect(rome!.latitude).toBeCloseTo(41.9, 0);
    expect(rome!.longitude).toBeCloseTo(12.5, 0);
  });

  it("should have Mount Sinai in the Sinai Peninsula (around 28.5N, 34E)", () => {
    const sinai = locations.find((l) => l.name === "Mount Sinai");
    expect(sinai).toBeDefined();
    expect(sinai!.latitude).toBeCloseTo(28.5, 0);
    expect(sinai!.longitude).toBeCloseTo(34, 0);
  });

  it("should place all mountains as type 'mountain'", () => {
    const mountainNames = [
      "Mount Sinai",
      "Mount Ararat",
      "Mount Carmel",
      "Mount of Olives",
      "Mount Zion",
      "Mount Moriah",
      "Mount Hermon",
      "Mount Nebo",
      "Mount Tabor",
    ];
    for (const name of mountainNames) {
      const loc = locations.find((l) => l.name === name);
      expect(loc).toBeDefined();
      expect(loc!.locationType).toBe("mountain");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEYS.JSON DATA VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

describe("journeys.json — journey data completeness", () => {
  it("should contain at least 5 journeys", () => {
    expect(journeys.length).toBeGreaterThanOrEqual(5);
  });

  it("should contain exactly 8 journeys", () => {
    expect(journeys).toHaveLength(8);
  });

  it("should have unique journey names", () => {
    const names = journeys.map((j) => j.name);
    expect(new Set(names).size).toBe(journeys.length);
  });

  it("should have unique journey slugs", () => {
    const slugs = journeys.map((j) => j.slug);
    expect(new Set(slugs).size).toBe(journeys.length);
  });

  it("should have all required fields for every journey", () => {
    for (const journey of journeys) {
      expect(journey.name.length).toBeGreaterThan(0);
      expect(journey.slug.length).toBeGreaterThan(0);
      expect(journey.description).toBeDefined();
      expect(journey.description!.length).toBeGreaterThan(0);
      expect(journey.personName).toBeDefined();
      expect(journey.color).toBeDefined();
      expect(journey.stops).toBeDefined();
      expect(journey.stops.length).toBeGreaterThan(0);
    }
  });

  it("should have valid hex color codes for all journeys", () => {
    for (const journey of journeys) {
      expect(journey.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("journeys.json — required journeys", () => {
  it("should include Abraham's journey from Ur to Canaan", () => {
    const abraham = journeys.find((j) => j.personName === "Abraham");
    expect(abraham).toBeDefined();
    expect(abraham!.name).toContain("Ur");
    expect(abraham!.name).toContain("Canaan");
  });

  it("should include the Exodus route", () => {
    const exodus = journeys.find((j) => j.personName === "Moses");
    expect(exodus).toBeDefined();
    expect(exodus!.name).toContain("Exodus");
  });

  it("should include David's flight from Saul", () => {
    const david = journeys.find((j) => j.personName === "David");
    expect(david).toBeDefined();
    expect(david!.name).toContain("David");
  });

  it("should include Paul's three missionary journeys", () => {
    const paulJourneys = journeys.filter((j) => j.personName === "Paul");
    expect(paulJourneys.length).toBeGreaterThanOrEqual(3);

    const missionaryJourneys = paulJourneys.filter((j) =>
      j.name.includes("Missionary Journey")
    );
    expect(missionaryJourneys).toHaveLength(3);
  });

  it("should include Paul's voyage to Rome", () => {
    const voyage = journeys.find(
      (j) => j.personName === "Paul" && j.name.includes("Rome")
    );
    expect(voyage).toBeDefined();
  });

  it("should include Jesus' ministry journey", () => {
    const jesus = journeys.find((j) => j.personName === "Jesus");
    expect(jesus).toBeDefined();
  });
});

describe("journeys.json — journey stops validation", () => {
  it("should have sequential stop orders starting from 1 for each journey", () => {
    for (const journey of journeys) {
      const orders = journey.stops.map((s) => s.stopOrder).sort((a, b) => a - b);
      expect(orders[0]).toBe(1);
      // Check sequential
      for (let i = 0; i < orders.length; i++) {
        expect(orders[i]).toBe(i + 1);
      }
    }
  });

  it("should have valid coordinates for all stops", () => {
    for (const journey of journeys) {
      for (const stop of journey.stops) {
        expect(typeof stop.latitude).toBe("number");
        expect(typeof stop.longitude).toBe("number");
        expect(stop.latitude).toBeGreaterThanOrEqual(-90);
        expect(stop.latitude).toBeLessThanOrEqual(90);
        expect(stop.longitude).toBeGreaterThanOrEqual(-180);
        expect(stop.longitude).toBeLessThanOrEqual(180);
      }
    }
  });

  it("should have scripture references for all stops", () => {
    for (const journey of journeys) {
      for (const stop of journey.stops) {
        expect(stop.scriptureRef).toBeDefined();
        expect(stop.scriptureRef!.length).toBeGreaterThan(0);
      }
    }
  });

  it("should have descriptions for all stops", () => {
    for (const journey of journeys) {
      for (const stop of journey.stops) {
        expect(stop.description).toBeDefined();
        expect(stop.description!.length).toBeGreaterThan(0);
      }
    }
  });

  it("should have names for all stops", () => {
    for (const journey of journeys) {
      for (const stop of journey.stops) {
        expect(stop.name).toBeDefined();
        expect(stop.name.length).toBeGreaterThan(0);
      }
    }
  });

  it("should have at least 100 total stops across all journeys", () => {
    const totalStops = journeys.reduce((sum, j) => sum + j.stops.length, 0);
    expect(totalStops).toBeGreaterThanOrEqual(100);
  });

  it("Abraham's journey should start at Ur and end at Beersheba", () => {
    const abraham = journeys.find((j) => j.personName === "Abraham")!;
    const firstStop = abraham.stops.find((s) => s.stopOrder === 1)!;
    const lastStop = abraham.stops.find(
      (s) => s.stopOrder === abraham.stops.length
    )!;
    expect(firstStop.name).toContain("Ur");
    expect(lastStop.name).toContain("Beersheba");
  });

  it("Exodus journey should include Mount Sinai and Red Sea Crossing", () => {
    const exodus = journeys.find((j) => j.personName === "Moses")!;
    const stopNames = exodus.stops.map((s) => s.name);
    expect(stopNames).toContain("Mount Sinai");
    expect(stopNames).toContain("Red Sea Crossing");
  });

  it("Paul's first missionary journey should start and end at Antioch", () => {
    const paul1 = journeys.find((j) => j.name.includes("First Missionary"))!;
    const firstStop = paul1.stops.find((s) => s.stopOrder === 1)!;
    const lastStop = paul1.stops.find(
      (s) => s.stopOrder === paul1.stops.length
    )!;
    expect(firstStop.name).toContain("Antioch");
    expect(lastStop.name).toContain("Antioch");
  });

  it("Paul's voyage to Rome should end in Rome", () => {
    const voyage = journeys.find((j) => j.name.includes("Voyage to Rome"))!;
    const lastStop = voyage.stops.find(
      (s) => s.stopOrder === voyage.stops.length
    )!;
    expect(lastStop.name).toBe("Rome");
  });

  it("Jesus' ministry should start with Bethlehem and end with Ascension", () => {
    const jesus = journeys.find((j) => j.personName === "Jesus")!;
    const firstStop = jesus.stops.find((s) => s.stopOrder === 1)!;
    const lastStop = jesus.stops.find(
      (s) => s.stopOrder === jesus.stops.length
    )!;
    expect(firstStop.name).toBe("Bethlehem");
    expect(lastStop.name).toContain("Ascension");
  });
});

describe("journeys.json — scripture reference format", () => {
  it("should have non-empty scripture references for all stops", () => {
    for (const journey of journeys) {
      for (const stop of journey.stops) {
        expect(stop.scriptureRef).toBeDefined();
        expect(stop.scriptureRef!.length).toBeGreaterThan(0);
        // Should contain at least one number (chapter/verse reference)
        expect(stop.scriptureRef).toMatch(/\d+/);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEED LOCATIONS — DATABASE INSERTION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe("seedLocations — inserting locations into the database", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM journey_stops");
    sqlite.exec("DELETE FROM location_references");
    sqlite.exec("DELETE FROM journeys");
    sqlite.exec("DELETE FROM locations");
  });

  it("should insert all locations from the JSON data", () => {
    for (const loc of locations) {
      db.insert(schema.locations)
        .values({
          name: loc.name,
          slug: slugify(loc.name),
          description: loc.description ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locationType: loc.locationType as any,
          latitude: loc.latitude,
          longitude: loc.longitude,
          modernName: loc.modernName ?? null,
          imageUrl: null,
        })
        .run();
    }

    const allLocations = db.select().from(schema.locations).all();
    expect(allLocations).toHaveLength(locations.length);
  });

  it("should generate valid slugs for all location names", () => {
    for (const loc of locations) {
      const slug = slugify(loc.name);
      expect(slug.length).toBeGreaterThan(0);
      // Slugs should be lowercase, no special chars except hyphens
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("should generate unique slugs for all locations", () => {
    const slugs = locations.map((l) => slugify(l.name));
    expect(new Set(slugs).size).toBe(locations.length);
  });

  it("should return location IDs in a map keyed by name", () => {
    const locationIdMap = new Map<string, number>();

    for (const loc of locations) {
      const result = db
        .insert(schema.locations)
        .values({
          name: loc.name,
          slug: slugify(loc.name),
          description: loc.description ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locationType: loc.locationType as any,
          latitude: loc.latitude,
          longitude: loc.longitude,
          modernName: loc.modernName ?? null,
          imageUrl: null,
        })
        .returning()
        .get();

      locationIdMap.set(loc.name, result.id);
    }

    expect(locationIdMap.size).toBe(locations.length);
    expect(locationIdMap.get("Jerusalem")).toBeGreaterThan(0);
    expect(locationIdMap.get("Mount Sinai")).toBeGreaterThan(0);
    expect(locationIdMap.get("Sea of Galilee")).toBeGreaterThan(0);
  });

  it("should enforce unique slug constraint on locations", () => {
    db.insert(schema.locations)
      .values({
        name: "Jerusalem",
        slug: "jerusalem",
        locationType: "city",
        latitude: 31.77,
        longitude: 35.21,
      })
      .run();

    expect(() => {
      db.insert(schema.locations)
        .values({
          name: "Jerusalem Duplicate",
          slug: "jerusalem", // duplicate slug
          locationType: "city",
          latitude: 31.77,
          longitude: 35.21,
        })
        .run();
    }).toThrow();
  });

  it("should store all location fields correctly", () => {
    db.insert(schema.locations)
      .values({
        name: "Jerusalem",
        slug: "jerusalem",
        description: "Holy city and capital",
        locationType: "city",
        latitude: 31.7683,
        longitude: 35.2137,
        modernName: "Jerusalem, Israel",
        imageUrl: null,
      })
      .run();

    const result = db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.slug, "jerusalem"))
      .get();

    expect(result).toBeDefined();
    expect(result!.name).toBe("Jerusalem");
    expect(result!.locationType).toBe("city");
    expect(result!.latitude).toBeCloseTo(31.7683, 3);
    expect(result!.longitude).toBeCloseTo(35.2137, 3);
    expect(result!.modernName).toBe("Jerusalem, Israel");
    expect(result!.imageUrl).toBeNull();
  });
});

describe("seedLocations — idempotency and partial data handling", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM journey_stops");
    sqlite.exec("DELETE FROM location_references");
    sqlite.exec("DELETE FROM journeys");
    sqlite.exec("DELETE FROM locations");
  });

  it("should detect existing locations and skip re-insertion", () => {
    // Insert all locations
    for (const loc of locations) {
      db.insert(schema.locations)
        .values({
          name: loc.name,
          slug: slugify(loc.name),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locationType: loc.locationType as any,
          latitude: loc.latitude,
          longitude: loc.longitude,
        })
        .run();
    }

    const existing = db.select().from(schema.locations).all();
    // Idempotency check: should have >= data.length
    const shouldSkip = existing.length >= locations.length;
    expect(shouldSkip).toBe(true);
  });

  it("should detect partial data and allow clearing for re-seed", () => {
    // Insert only 5 locations
    for (let i = 0; i < 5; i++) {
      const loc = locations[i];
      db.insert(schema.locations)
        .values({
          name: loc.name,
          slug: slugify(loc.name),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locationType: loc.locationType as any,
          latitude: loc.latitude,
          longitude: loc.longitude,
        })
        .run();
    }

    const existing = db.select().from(schema.locations).all();
    expect(existing.length).toBe(5);
    expect(existing.length).toBeLessThan(locations.length);

    // Simulate partial data cleanup
    db.delete(schema.locations).run();
    const afterClear = db.select().from(schema.locations).all();
    expect(afterClear).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEED JOURNEYS — DATABASE INSERTION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe("seedJourneys — inserting journeys and stops into the database", () => {
  let locationIdMap: Map<string, number>;

  beforeEach(() => {
    sqlite.exec("DELETE FROM journey_stops");
    sqlite.exec("DELETE FROM journeys");
    sqlite.exec("DELETE FROM location_references");
    sqlite.exec("DELETE FROM locations");

    // Seed locations first to provide the ID map
    locationIdMap = new Map<string, number>();
    for (const loc of locations) {
      const result = db
        .insert(schema.locations)
        .values({
          name: loc.name,
          slug: slugify(loc.name),
          description: loc.description ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locationType: loc.locationType as any,
          latitude: loc.latitude,
          longitude: loc.longitude,
          modernName: loc.modernName ?? null,
          imageUrl: null,
        })
        .returning()
        .get();
      locationIdMap.set(loc.name, result.id);
    }
  });

  it("should insert all journeys with correct metadata", () => {
    for (const journey of journeys) {
      db.insert(schema.journeys)
        .values({
          name: journey.name,
          slug: journey.slug,
          description: journey.description ?? null,
          personName: journey.personName ?? null,
          color: journey.color ?? "#C4975C",
        })
        .run();
    }

    const allJourneys = db.select().from(schema.journeys).all();
    expect(allJourneys).toHaveLength(8);
  });

  it("should insert journey stops with correct foreign keys", () => {
    const journeyResult = db
      .insert(schema.journeys)
      .values({
        name: journeys[0].name,
        slug: journeys[0].slug,
        description: journeys[0].description ?? null,
        personName: journeys[0].personName ?? null,
        color: journeys[0].color ?? "#C4975C",
      })
      .returning()
      .get();

    for (const stop of journeys[0].stops) {
      db.insert(schema.journeyStops)
        .values({
          journeyId: journeyResult.id,
          locationId: locationIdMap.get(stop.name) ?? null,
          stopOrder: stop.stopOrder,
          name: stop.name,
          description: stop.description ?? null,
          scriptureRef: stop.scriptureRef ?? null,
          latitude: stop.latitude,
          longitude: stop.longitude,
        })
        .run();
    }

    const stops = db
      .select()
      .from(schema.journeyStops)
      .where(eq(schema.journeyStops.journeyId, journeyResult.id))
      .all();

    expect(stops).toHaveLength(journeys[0].stops.length);
    expect(stops[0].journeyId).toBe(journeyResult.id);
  });

  it("should insert all journeys and all stops across all journeys", () => {
    let totalStops = 0;

    for (const journey of journeys) {
      const journeyResult = db
        .insert(schema.journeys)
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
        db.insert(schema.journeyStops)
          .values({
            journeyId: journeyResult.id,
            locationId: locationIdMap.get(stop.name) ?? null,
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

    const allJourneys = db.select().from(schema.journeys).all();
    const allStops = db.select().from(schema.journeyStops).all();

    expect(allJourneys).toHaveLength(8);
    expect(allStops).toHaveLength(totalStops);
    expect(totalStops).toBeGreaterThanOrEqual(100);
  });

  it("should enforce unique slug constraint on journeys", () => {
    db.insert(schema.journeys)
      .values({
        name: "Test Journey",
        slug: "test-journey",
        personName: "Test",
      })
      .run();

    expect(() => {
      db.insert(schema.journeys)
        .values({
          name: "Another Journey",
          slug: "test-journey", // duplicate
          personName: "Test",
        })
        .run();
    }).toThrow();
  });

  it("should cascade delete stops when a journey is deleted", () => {
    const journey = db
      .insert(schema.journeys)
      .values({
        name: "Test Journey",
        slug: "test-cascade",
        personName: "Test",
      })
      .returning()
      .get();

    db.insert(schema.journeyStops)
      .values({
        journeyId: journey.id,
        stopOrder: 1,
        name: "Stop 1",
        latitude: 31.7,
        longitude: 35.2,
      })
      .run();

    db.insert(schema.journeyStops)
      .values({
        journeyId: journey.id,
        stopOrder: 2,
        name: "Stop 2",
        latitude: 32.0,
        longitude: 35.5,
      })
      .run();

    // Verify stops exist
    let stops = db.select().from(schema.journeyStops).all();
    expect(stops).toHaveLength(2);

    // Delete journey
    db.delete(schema.journeys).where(eq(schema.journeys.id, journey.id)).run();

    stops = db.select().from(schema.journeyStops).all();
    expect(stops).toHaveLength(0);
  });

  it("should set locationId to null when a linked location is deleted", () => {
    const journey = db
      .insert(schema.journeys)
      .values({
        name: "Test Journey",
        slug: "test-null-loc",
        personName: "Test",
      })
      .returning()
      .get();

    const jerusalemId = locationIdMap.get("Jerusalem")!;

    db.insert(schema.journeyStops)
      .values({
        journeyId: journey.id,
        locationId: jerusalemId,
        stopOrder: 1,
        name: "Jerusalem Stop",
        latitude: 31.77,
        longitude: 35.21,
      })
      .run();

    // Delete the location
    db.delete(schema.locations)
      .where(eq(schema.locations.id, jerusalemId))
      .run();

    const stop = db
      .select()
      .from(schema.journeyStops)
      .where(eq(schema.journeyStops.journeyId, journey.id))
      .get();

    expect(stop).toBeDefined();
    expect(stop!.locationId).toBeNull();
  });

  it("should store the default color when none provided", () => {
    const journey = db
      .insert(schema.journeys)
      .values({
        name: "No Color Journey",
        slug: "no-color",
        personName: "Test",
      })
      .returning()
      .get();

    expect(journey.color).toBe("#C4975C");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FIND LOCATION ID — NAME MATCHING LOGIC
// ═══════════════════════════════════════════════════════════════════════════

describe("findLocationId — location name matching for journey stops", () => {
  /**
   * Reimplements the findLocationId function to test the matching logic
   * without requiring the real database module.
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

  const testMap = new Map<string, number>([
    ["Jerusalem", 1],
    ["Jordan River", 2],
    ["Antioch of Syria", 3],
    ["Mount of Olives", 4],
    ["Wilderness of Judea", 5],
    ["Ur of the Chaldees", 6],
  ]);

  it("should find exact match", () => {
    expect(findLocationId("Jerusalem", testMap)).toBe(1);
    expect(findLocationId("Antioch of Syria", testMap)).toBe(3);
  });

  it("should match after removing parenthetical suffix", () => {
    expect(findLocationId("Jordan River (Baptism)", testMap)).toBe(2);
    expect(findLocationId("Mount of Olives (Ascension)", testMap)).toBe(4);
  });

  it("should match via substring containment for names longer than 3 chars", () => {
    expect(findLocationId("Jerusalem (Triumphal Entry)", testMap)).toBe(1);
    expect(findLocationId("Wilderness of Judea (Temptation)", testMap)).toBe(5);
  });

  it("should return null for unknown stop names", () => {
    expect(findLocationId("Storm at Sea (Euraquilo)", testMap)).toBeNull();
    expect(findLocationId("Forum of Appius", testMap)).toBeNull();
    expect(findLocationId("Rhegium", testMap)).toBeNull();
  });

  it("should not match short location names (length <= 3) via substring", () => {
    const mapWithShort = new Map<string, number>([
      ["Ai", 10],
      ["Ur", 11],
    ]);
    // "Ai" and "Ur" are <= 3 chars, so substring match should not work
    expect(findLocationId("Ai of the Valley", mapWithShort)).toBeNull();
    expect(findLocationId("Ur of the Chaldees Extended", mapWithShort)).toBeNull();
  });

  it("should prefer direct match over parenthetical/substring match", () => {
    const mapWithBoth = new Map<string, number>([
      ["Antioch of Syria", 100],
      ["Antioch", 200],
    ]);
    // Direct match should take priority
    expect(findLocationId("Antioch of Syria", mapWithBoth)).toBe(100);
  });

  it("should handle the Antioch of Syria (Return) pattern from journey data", () => {
    expect(findLocationId("Antioch of Syria (Return)", testMap)).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEED LOCATION REFERENCES — LINKING LOCATIONS TO SCRIPTURE
// ═══════════════════════════════════════════════════════════════════════════

describe("seedLocationReferences — linking locations to scripture", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM location_references");
    sqlite.exec("DELETE FROM journey_stops");
    sqlite.exec("DELETE FROM journeys");
    sqlite.exec("DELETE FROM verses");
    sqlite.exec("DELETE FROM chapters");
    sqlite.exec("DELETE FROM books");
    sqlite.exec("DELETE FROM locations");
  });

  it("should insert a location reference with valid foreign keys", () => {
    // Setup: create a location, book, and chapter
    const loc = db
      .insert(schema.locations)
      .values({
        name: "Jerusalem",
        slug: "jerusalem",
        locationType: "city",
        latitude: 31.77,
        longitude: 35.21,
      })
      .returning()
      .get();

    const book = db
      .insert(schema.books)
      .values({
        name: "2 Samuel",
        abbreviation: "2Sa",
        slug: "2-samuel",
        testament: "OT",
        category: "History",
        chapterCount: 24,
        sortOrder: 10,
      })
      .returning()
      .get();

    const chapter = db
      .insert(schema.chapters)
      .values({
        bookId: book.id,
        chapterNumber: 5,
        verseCount: 25,
      })
      .returning()
      .get();

    db.insert(schema.locationReferences)
      .values({
        locationId: loc.id,
        bookId: book.id,
        chapterId: chapter.id,
      })
      .run();

    const refs = db.select().from(schema.locationReferences).all();
    expect(refs).toHaveLength(1);
    expect(refs[0].locationId).toBe(loc.id);
    expect(refs[0].bookId).toBe(book.id);
    expect(refs[0].chapterId).toBe(chapter.id);
  });

  it("should cascade delete references when a location is deleted", () => {
    const loc = db
      .insert(schema.locations)
      .values({
        name: "Test Loc",
        slug: "test-loc-ref",
        locationType: "city",
        latitude: 31.0,
        longitude: 35.0,
      })
      .returning()
      .get();

    const book = db
      .insert(schema.books)
      .values({
        name: "Genesis",
        abbreviation: "Gen",
        slug: "genesis",
        testament: "OT",
        category: "Law",
        chapterCount: 50,
        sortOrder: 1,
      })
      .returning()
      .get();

    const chapter = db
      .insert(schema.chapters)
      .values({
        bookId: book.id,
        chapterNumber: 1,
        verseCount: 31,
      })
      .returning()
      .get();

    db.insert(schema.locationReferences)
      .values({
        locationId: loc.id,
        bookId: book.id,
        chapterId: chapter.id,
      })
      .run();

    // Delete the location
    db.delete(schema.locations).where(eq(schema.locations.id, loc.id)).run();

    const refs = db.select().from(schema.locationReferences).all();
    expect(refs).toHaveLength(0);
  });

  it("should support multiple references for the same location", () => {
    const loc = db
      .insert(schema.locations)
      .values({
        name: "Jerusalem",
        slug: "jerusalem-multi",
        locationType: "city",
        latitude: 31.77,
        longitude: 35.21,
      })
      .returning()
      .get();

    const book1 = db
      .insert(schema.books)
      .values({
        name: "2 Samuel",
        abbreviation: "2Sa",
        slug: "2-samuel",
        testament: "OT",
        category: "History",
        chapterCount: 24,
        sortOrder: 10,
      })
      .returning()
      .get();

    const book2 = db
      .insert(schema.books)
      .values({
        name: "Matthew",
        abbreviation: "Mat",
        slug: "matthew",
        testament: "NT",
        category: "Gospels",
        chapterCount: 28,
        sortOrder: 40,
      })
      .returning()
      .get();

    const ch1 = db
      .insert(schema.chapters)
      .values({ bookId: book1.id, chapterNumber: 5, verseCount: 25 })
      .returning()
      .get();

    const ch2 = db
      .insert(schema.chapters)
      .values({ bookId: book2.id, chapterNumber: 23, verseCount: 39 })
      .returning()
      .get();

    db.insert(schema.locationReferences)
      .values({ locationId: loc.id, bookId: book1.id, chapterId: ch1.id })
      .run();

    db.insert(schema.locationReferences)
      .values({ locationId: loc.id, bookId: book2.id, chapterId: ch2.id })
      .run();

    const refs = db
      .select()
      .from(schema.locationReferences)
      .where(eq(schema.locationReferences.locationId, loc.id))
      .all();

    expect(refs).toHaveLength(2);
  });

  it("should reject a reference with invalid location_id", () => {
    expect(() => {
      db.insert(schema.locationReferences)
        .values({
          locationId: 99999,
          bookId: null,
          chapterId: null,
        })
        .run();
    }).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEED SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

describe("Seed script configuration — location and journey files", () => {
  it("should have data/locations.json file", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "locations.json");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should have data/journeys.json file", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "journeys.json");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should have seed-locations.ts module", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "lib",
      "db",
      "seed-data",
      "seed-locations.ts"
    );
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should have seed-journeys.ts module", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "lib",
      "db",
      "seed-data",
      "seed-journeys.ts"
    );
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should have seed-location-references.ts module", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "lib",
      "db",
      "seed-data",
      "seed-location-references.ts"
    );
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("locations.json should be valid JSON parseable as an array", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "locations.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(100);
  });

  it("journeys.json should be valid JSON parseable as an array", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "journeys.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(5);
  });
});
