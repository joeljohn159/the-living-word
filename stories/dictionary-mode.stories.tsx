/**
 * Dictionary Mode (D Key Toggle)
 * ==============================
 *
 * A reading enhancement that highlights all dictionary words at once,
 * allowing readers to explore archaic/biblical vocabulary in context.
 *
 * ── Activation ──────────────────────────────────────────────────
 * Desktop: Press 'D' key to toggle on/off
 * Mobile:  Tap the 📖 button in the chapter toolbar
 * Exit:    Press 'D' again, press 'Escape', or tap the 📖 button
 *
 * ── Visual Behavior ─────────────────────────────────────────────
 * When Dictionary Mode is active:
 * 1. All dictionary words illuminate with a warm gold highlight
 *    background (15% opacity gold + gold underline)
 * 2. A floating badge appears at the top center of the viewport:
 *    "Dictionary Mode ON — press D or Esc to exit"
 * 3. The `dictionary-mode` class is added to <html> element
 *    which triggers enhanced CSS styles on `.dictionary-word`
 *
 * ── Word Interaction ────────────────────────────────────────────
 * Clicking any highlighted word opens the DictionaryPanel:
 * - Side panel slides in from the right (Framer Motion)
 * - Shows: word, pronunciation, part of speech, definition,
 *   modern equivalent, usage notes, example verse
 * - "See in Dictionary →" link to full dictionary page
 * - Close button (X) or click another word to switch
 *
 * ── Component Architecture ──────────────────────────────────────
 * hooks/useDictionaryMode.ts
 *   - Keyboard listener for D and Escape keys
 *   - Returns current dictionaryMode state from Zustand
 *
 * stores/preferences.ts (extended)
 *   - dictionaryMode: boolean
 *   - toggleDictionaryMode()
 *   - setDictionaryMode(on)
 *
 * components/dictionary/DictionaryModeProvider.tsx
 *   - Orchestrator: manages <html> class, click listeners, API calls
 *   - Renders DictionaryModeBadge + DictionaryPanel
 *
 * components/dictionary/DictionaryModeBadge.tsx
 *   - Floating "Dictionary Mode ON" pill with AnimatePresence
 *
 * components/dictionary/DictionaryPanel.tsx
 *   - Right-side panel with full word details
 *   - Animated entry/exit with Framer Motion
 *
 * components/dictionary/DictionaryModeToggle.tsx
 *   - Mobile-only 📖 button for the toolbar
 *   - Hidden on lg+ (desktop uses keyboard shortcut)
 *
 * app/api/dictionary/[slug]/route.ts
 *   - API endpoint returning full dictionary entry with example verse
 *
 * ── CSS (in globals.css) ────────────────────────────────────────
 * .dictionary-mode .dictionary-word {
 *   background-color: color-mix(in srgb, var(--accent-gold) 15%, transparent);
 *   text-decoration-color: var(--accent-gold);
 *   border-radius: 2px;
 *   padding: 0 2px;
 * }
 *
 * ── Animation Specs ─────────────────────────────────────────────
 * Badge:  fade + slide down (opacity 0→1, y -10→0), 200ms ease-out
 * Panel:  fade + slide left (opacity 0→1, x 20→0), 200ms ease-out
 * Exit:   reverse of entry animations
 * All transitions via Framer Motion's AnimatePresence
 *
 * ── Accessibility ───────────────────────────────────────────────
 * - Badge has role="status" with aria-live="polite"
 * - Panel has role="complementary" with aria-label
 * - Toggle button has aria-pressed state
 * - Keyboard: D to toggle, Escape to exit
 * - Ignores key events when typing in input/textarea
 */

// ── Sample Data (for testing/demo) ──────────────────────────────

export const sampleDictionaryEntry = {
  word: "Verily",
  slug: "verily",
  definition:
    "In truth; certainly; truly. Used to affirm the truth of a statement with emphasis.",
  modernEquivalent: "Truly, indeed",
  partOfSpeech: "adverb",
  pronunciation: "/ˈvɛrɪli/",
  usageNotes:
    'Often used by Jesus to introduce important teachings. The double "Verily, verily" (Amen, amen) in John\'s Gospel signals statements of great significance.',
  exampleVerse: {
    text: "Verily, verily, I say unto you, He that heareth my word, and believeth on him that sent me, hath everlasting life.",
    bookName: "John",
    chapterNumber: 5,
    verseNumber: 24,
    bookSlug: "john",
  },
};

export const sampleVerseText =
  "Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.";

export const sampleDictionaryEntries = [
  {
    word: "Verily",
    slug: "verily",
    definition: "In truth; certainly.",
    modernEquivalent: "Truly",
    partOfSpeech: "adverb",
  },
  {
    word: "thee",
    slug: "thee",
    definition: "You (singular, objective case).",
    modernEquivalent: "you",
    partOfSpeech: "pronoun",
  },
  {
    word: "unto",
    slug: "unto",
    definition: "To; toward.",
    modernEquivalent: "to",
    partOfSpeech: "preposition",
  },
];
