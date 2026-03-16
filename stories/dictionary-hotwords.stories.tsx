/**
 * Dictionary Hotwords — Design Reference
 *
 * This file documents the expected behavior and styling for
 * the dictionary hotword detection & tooltip feature.
 *
 * ## Feature Overview
 *
 * When scripture text is displayed, archaic/biblical words that
 * exist in the dictionary are detected and rendered with:
 *
 * 1. **Subtle dotted underline** in muted gold (`border-dotted border-[var(--accent-gold)]/50`)
 * 2. **Hover tooltip** (desktop) showing definition + modern equivalent
 * 3. **Tap bottom sheet** (mobile) with full definition and link to dictionary entry
 *
 * ## Components
 *
 * - `lib/dictionary.ts` — Word matching engine (Set-based O(1) lookup)
 * - `components/scripture/VerseText.tsx` — Renders text with hotword spans
 * - `components/dictionary/DictionaryTooltip.tsx` — Tooltip + bottom sheet
 *
 * ## Example Usage
 *
 * ```tsx
 * import { VerseText } from "@/components/scripture/VerseText";
 *
 * const dictionaryEntries = [
 *   {
 *     word: "Thee",
 *     slug: "thee",
 *     definition: "An archaic form of 'you', used as the object of a verb.",
 *     modernEquivalent: "You",
 *     partOfSpeech: "pronoun",
 *   },
 *   {
 *     word: "Hath",
 *     slug: "hath",
 *     definition: "Archaic third person singular of 'have'.",
 *     modernEquivalent: "Has",
 *     partOfSpeech: "verb",
 *   },
 *   {
 *     word: "Begat",
 *     slug: "begat",
 *     definition: "Past tense of beget; to father or produce offspring.",
 *     modernEquivalent: "Fathered",
 *     partOfSpeech: "verb",
 *   },
 * ];
 *
 * <VerseText
 *   text="For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
 *   dictionaryEntries={dictionaryEntries}
 * />
 * ```
 *
 * ## Styling Specs
 *
 * ### Hotword Underline
 * - Border: `border-b border-dotted border-[var(--accent-gold)]/50`
 * - Hover: `border-[var(--accent-gold)] text-[var(--accent-gold)]`
 * - Cursor: `cursor-help`
 * - Transition: `transition-colors duration-200`
 *
 * ### Desktop Tooltip
 * - Position: absolute, centered above the word
 * - Width: `w-64`
 * - Background: `bg-[var(--bg-card)]`
 * - Border: `border border-[var(--border)]`
 * - Shadow: `shadow-lg shadow-black/20`
 * - Animation: `animate-fade-in`
 * - Arrow: 6px CSS triangle pointing down
 * - Content:
 *   - Word in gold (font-cormorant, semibold)
 *   - Part of speech in italics (text-muted)
 *   - Definition (text-secondary, text-xs)
 *   - Modern equivalent in gold
 *
 * ### Mobile Bottom Sheet
 * - Backdrop: `bg-black/50` with fade-in
 * - Sheet: `rounded-t-2xl`, slides up from bottom
 * - Drag handle: `w-10 h-1 rounded-full bg-[var(--text-muted)]/30`
 * - Close button with X icon
 * - Link to full dictionary entry
 *
 * ## Word Matching Rules
 *
 * - Case-insensitive matching against dictionary words
 * - Word-boundary aware (no partial matches)
 * - Handles apostrophes in words (e.g., "thou'rt")
 * - Strips leading/trailing punctuation before matching
 * - Returns matches in order of appearance
 *
 * ## Data Flow
 *
 * 1. Dictionary entries fetched during SSR (server component)
 * 2. Passed to VerseText as `dictionaryEntries` prop
 * 3. `buildDictionaryLookup()` creates Map for O(1) lookup
 * 4. `segmentVerseText()` splits text into plain + hotword segments
 * 5. Each hotword segment rendered with DictionaryTooltip wrapper
 */

import type { DictionaryEntry } from "@/lib/dictionary";

/** Sample dictionary entries for testing. */
export const sampleDictionaryEntries: DictionaryEntry[] = [
  {
    word: "Thee",
    slug: "thee",
    definition:
      "An archaic or dialectal form of 'you', used as the objective case of 'thou'.",
    modernEquivalent: "You",
    partOfSpeech: "pronoun",
  },
  {
    word: "Thou",
    slug: "thou",
    definition:
      "The second person singular pronoun in the nominative case, now archaic.",
    modernEquivalent: "You",
    partOfSpeech: "pronoun",
  },
  {
    word: "Hath",
    slug: "hath",
    definition: "Archaic third person singular present tense of 'have'.",
    modernEquivalent: "Has",
    partOfSpeech: "verb",
  },
  {
    word: "Thy",
    slug: "thy",
    definition:
      "The possessive form of 'thou'; belonging to the person addressed.",
    modernEquivalent: "Your",
    partOfSpeech: "pronoun",
  },
  {
    word: "Begat",
    slug: "begat",
    definition: "Past tense of beget; to father, sire, or produce offspring.",
    modernEquivalent: "Fathered",
    partOfSpeech: "verb",
  },
  {
    word: "Wherein",
    slug: "wherein",
    definition: "In which; in what place, situation, or respect.",
    modernEquivalent: "In which",
    partOfSpeech: "adverb",
  },
  {
    word: "Verily",
    slug: "verily",
    definition: "In truth; certainly; with confidence.",
    modernEquivalent: "Truly",
    partOfSpeech: "adverb",
  },
  {
    word: "Behold",
    slug: "behold",
    definition: "To see or observe; used to call attention to something.",
    modernEquivalent: "Look / See",
    partOfSpeech: "verb",
  },
];

/** Sample verse text for testing hotword matching. */
export const sampleVerseText =
  "Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.";
