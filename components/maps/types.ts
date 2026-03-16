/** Location data returned from the DB/API. */
export interface MapLocation {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  locationType: string;
  latitude: number;
  longitude: number;
  modernName: string | null;
  imageUrl: string | null;
}

/** Extended location with book/testament references for filtering. */
export interface MapLocationWithRefs extends MapLocation {
  testaments: string[];
  bookSlugs: string[];
  bookNames: string[];
}

/** Journey data for the maps hub. */
export interface Journey {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  personName: string | null;
  color: string | null;
}

/** Journey stop data. */
export interface JourneyStop {
  id: number;
  stopOrder: number;
  name: string;
  description: string | null;
  scriptureRef: string | null;
  latitude: number | null;
  longitude: number | null;
  locationId: number | null;
  locationName: string | null;
  locationSlug: string | null;
}

/** Journey with stops. */
export interface JourneyWithStops extends Journey {
  stops: JourneyStop[];
}
