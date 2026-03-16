/**
 * Dictionary hotword detection — O(1) lookup using Set.
 *
 * Matches archaic/biblical words in verse text and returns
 * their positions for inline highlighting.
 */

export interface DictionaryEntry {
  word: string;
  slug: string;
  definition: string;
  modernEquivalent: string | null;
  partOfSpeech: string | null;
}

export interface HotwordMatch {
  /** Start index in the original text. */
  start: number;
  /** End index (exclusive) in the original text. */
  end: number;
  /** The matched word as it appears in the text. */
  original: string;
  /** The dictionary entry for this word. */
  entry: DictionaryEntry;
}

/**
 * Build a case-insensitive lookup map from dictionary entries.
 * Keys are lowercase words for O(1) matching.
 */
export function buildDictionaryLookup(
  entries: DictionaryEntry[],
): Map<string, DictionaryEntry> {
  const lookup = new Map<string, DictionaryEntry>();
  for (const entry of entries) {
    lookup.set(entry.word.toLowerCase(), entry);
  }
  return lookup;
}

/** Strip punctuation from the edges of a word token. */
function stripPunctuation(token: string): string {
  return token.replace(/^[^\w]+|[^\w]+$/g, "");
}

/**
 * Find all dictionary hotword matches within a verse text.
 *
 * Uses word-boundary tokenization to avoid partial matches.
 * Returns matches sorted by their position in the text.
 */
export function findHotwords(
  text: string,
  lookup: Map<string, DictionaryEntry>,
): HotwordMatch[] {
  if (!text || lookup.size === 0) return [];

  const matches: HotwordMatch[] = [];
  // Match word-like tokens including apostrophes (e.g., "thou'rt")
  const wordRegex = /[\w']+/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(text)) !== null) {
    const raw = match[0];
    const cleaned = stripPunctuation(raw).toLowerCase();
    if (!cleaned) continue;

    const entry = lookup.get(cleaned);
    if (entry) {
      matches.push({
        start: match.index,
        end: match.index + raw.length,
        original: raw,
        entry,
      });
    }
  }

  return matches;
}

/**
 * Split verse text into segments: plain text and hotword matches.
 *
 * Returns an array of segments that can be mapped to React elements.
 * Each segment is either a plain text string or a HotwordMatch.
 */
export type TextSegment =
  | { type: "text"; content: string }
  | { type: "hotword"; match: HotwordMatch };

export function segmentVerseText(
  text: string,
  lookup: Map<string, DictionaryEntry>,
): TextSegment[] {
  const hotwords = findHotwords(text, lookup);
  if (hotwords.length === 0) {
    return [{ type: "text", content: text }];
  }

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const hw of hotwords) {
    // Add plain text before this hotword
    if (hw.start > cursor) {
      segments.push({ type: "text", content: text.slice(cursor, hw.start) });
    }
    segments.push({ type: "hotword", match: hw });
    cursor = hw.end;
  }

  // Add remaining text after last hotword
  if (cursor < text.length) {
    segments.push({ type: "text", content: text.slice(cursor) });
  }

  return segments;
}
