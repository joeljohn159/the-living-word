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
