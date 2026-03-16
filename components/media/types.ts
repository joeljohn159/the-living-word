/** Shape returned by getMediaByChapter / getBookMedia queries. */
export interface MediaItem {
  id: number;
  title: string;
  description: string | null;
  artist: string | null;
  yearCreated: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  attribution: string | null;
  license: string | null;
  mediaType: string;
}
