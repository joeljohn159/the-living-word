/**
 * Search utilities — types, highlight helpers, and constants.
 */

// ─── Types ──────────────────────────────────────────────────

export interface VerseResult {
  id: number;
  bookId: number;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  bookName: string;
  bookSlug: string;
  testament: "OT" | "NT";
}

export interface DictionaryResult {
  id: number;
  word: string;
  slug: string;
  definition: string;
  partOfSpeech: string | null;
}

export interface PersonResult {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  tribeOrGroup: string | null;
}

export interface LocationResult {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  locationType: string;
}

export type SearchTab = "verses" | "dictionary" | "people" | "places";

export interface SearchState {
  query: string;
  tab: SearchTab;
  testament: "all" | "OT" | "NT";
  bookSlug: string;
}

// ─── Constants ──────────────────────────────────────────────

export const SEARCH_TABS: { key: SearchTab; label: string }[] = [
  { key: "verses", label: "Verses" },
  { key: "dictionary", label: "Dictionary" },
  { key: "people", label: "People" },
  { key: "places", label: "Places" },
];

export const MIN_QUERY_LENGTH = 2;
export const DEBOUNCE_MS = 300;
export const MAX_RESULTS = 50;
export const MAX_SUGGESTIONS = 8;

// ─── Highlight Helper ───────────────────────────────────────

export interface HighlightSegment {
  text: string;
  highlight: boolean;
}

/**
 * Split text into segments with highlight markers for the given query.
 * Case-insensitive matching.
 */
export function highlightMatches(
  text: string,
  query: string
): HighlightSegment[] {
  if (!query.trim()) return [{ text, highlight: false }];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      highlight: regex.test(part) || part.toLowerCase() === query.toLowerCase(),
    }));
}

/**
 * Truncate text around the first match to provide context.
 */
export function excerptAround(
  text: string,
  query: string,
  maxLength = 200
): string {
  if (text.length <= maxLength) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) return text.slice(0, maxLength) + "...";

  const start = Math.max(0, matchIndex - 60);
  const end = Math.min(text.length, matchIndex + query.length + 100);

  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = "..." + excerpt;
  if (end < text.length) excerpt = excerpt + "...";

  return excerpt;
}
