/**
 * Cross-References Tab — Design Reference
 *
 * This file documents the expected behavior and styling for
 * the cross-references tab in the context panel.
 *
 * ## Feature Overview
 *
 * The Cross-References tab shows related scripture passages for
 * the current chapter and allows drill-down by individual verse.
 *
 * 1. **Chapter-level cross-refs** shown by default when tab is active
 * 2. **Verse-level cross-refs** shown when user clicks a verse number
 * 3. **Grouped by relationship type**: parallel, prophecy-fulfillment,
 *    quotation, allusion, contrast
 * 4. **CrossRefPopover** for quick inline preview on verse number click
 *
 * ## Components
 *
 * - `components/scripture/CrossRefTab.tsx` — Tab content in context panel
 * - `components/scripture/CrossRefGroup.tsx` — Grouped refs by relationship
 * - `components/scripture/CrossRefCard.tsx` — Single cross-ref card
 * - `components/scripture/CrossRefPopover.tsx` — Inline popover on verse click
 * - `stores/cross-references.ts` — Zustand store for selected verse + data
 *
 * ## Data Flow
 *
 * 1. Chapter page fetches all cross-refs for every verse in the chapter (SSR)
 * 2. `CrossRefProvider` hydrates the Zustand store with chapter cross-refs
 * 3. CrossRefTab reads from store, groups by relationship type
 * 4. Clicking a verse number in ScriptureDisplay:
 *    a. Opens the CrossRefPopover showing that verse's cross-refs
 *    b. Sets `selectedVerseNumber` in the store
 *    c. CrossRefTab filters to show only that verse's cross-refs
 * 5. "Show all chapter refs" button clears the verse filter
 *
 * ## Relationship Types & Badges
 *
 * | Type                  | Color           | Icon    |
 * |-----------------------|-----------------|---------|
 * | parallel              | blue            | GitBranch |
 * | prophecy-fulfillment  | amber/gold      | Sparkles  |
 * | quotation             | green           | Quote     |
 * | allusion              | purple          | Eye       |
 * | contrast              | rose            | ArrowLeftRight |
 *
 * ## Styling Specs
 *
 * ### CrossRefCard
 * - Container: `p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent-gold)]`
 * - Background: `bg-[var(--surface)]` on hover
 * - Reference: `font-cormorant text-sm font-semibold text-[var(--accent-gold)]`
 * - Preview text: `text-xs text-[var(--text-secondary)] leading-relaxed`
 * - Note: `text-xs text-[var(--text-muted)] italic`
 * - Relationship badge: colored pill with icon + label
 * - Click navigates to target verse page
 *
 * ### CrossRefGroup
 * - Header: relationship type label with icon
 * - Collapsible with count indicator
 * - Smooth animation on expand/collapse
 *
 * ### CrossRefPopover
 * - Positioned below the clicked verse number
 * - Width: `w-72`
 * - Max 3 cross-refs shown, "View all in panel" link
 * - Background: `bg-[var(--bg-card)]`
 * - Border: `border border-[var(--border)]`
 * - Shadow: `shadow-lg shadow-black/20`
 * - Dismiss on click outside or Escape key
 *
 * ### CrossRefTab
 * - Scrollable content area
 * - Header shows selected verse or "Chapter Cross-References"
 * - Empty state: elegant message when no cross-refs found
 * - Loading skeleton while data loads
 *
 * ## Example Usage
 *
 * ```tsx
 * // In chapter page (server component):
 * const crossRefs = await getChapterCrossReferences(bookSlug, chapterNum);
 *
 * <CrossRefProvider
 *   crossReferences={crossRefs}
 *   bookSlug={bookSlug}
 *   bookName={book.name}
 *   chapter={chapterNum}
 * >
 *   <ScriptureDisplay verses={verses} />
 *   <ContextPanel />
 * </CrossRefProvider>
 * ```
 *
 * ## Keyboard Shortcuts
 *
 * - `Escape` — Dismiss popover / clear verse selection
 * - Click verse number — Toggle popover + filter cross-refs
 */

export interface CrossRefSample {
  id: number;
  sourceVerseId: number;
  sourceVerseNumber: number;
  targetBook: string;
  targetBookSlug: string;
  targetChapter: number;
  targetVerse: number;
  targetText: string;
  relationship: "parallel" | "prophecy-fulfillment" | "quotation" | "allusion" | "contrast";
  note: string | null;
}

/** Sample cross-references for testing. */
export const sampleCrossReferences: CrossRefSample[] = [
  {
    id: 1,
    sourceVerseId: 1,
    sourceVerseNumber: 1,
    targetBook: "John",
    targetBookSlug: "john",
    targetChapter: 1,
    targetVerse: 1,
    targetText: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    relationship: "parallel",
    note: "Both passages open with 'In the beginning', linking creation to the incarnation.",
  },
  {
    id: 2,
    sourceVerseId: 1,
    sourceVerseNumber: 1,
    targetBook: "Hebrews",
    targetBookSlug: "hebrews",
    targetChapter: 11,
    targetVerse: 3,
    targetText: "Through faith we understand that the worlds were framed by the word of God, so that things which are seen were not made of things which do appear.",
    relationship: "allusion",
    note: "Hebrews alludes to the creation account as the foundation of faith.",
  },
  {
    id: 3,
    sourceVerseId: 2,
    sourceVerseNumber: 3,
    targetBook: "2 Corinthians",
    targetBookSlug: "2-corinthians",
    targetChapter: 4,
    targetVerse: 6,
    targetText: "For God, who commanded the light to shine out of darkness, hath shined in our hearts, to give the light of the knowledge of the glory of God in the face of Jesus Christ.",
    relationship: "prophecy-fulfillment",
    note: "God's command of light in creation foreshadows spiritual illumination through Christ.",
  },
  {
    id: 4,
    sourceVerseId: 3,
    sourceVerseNumber: 26,
    targetBook: "Colossians",
    targetBookSlug: "colossians",
    targetChapter: 1,
    targetVerse: 16,
    targetText: "For by him were all things created, that are in heaven, and that are in earth, visible and invisible, whether they be thrones, or dominions, or principalities, or powers: all things were created by him, and for him.",
    relationship: "quotation",
    note: null,
  },
  {
    id: 5,
    sourceVerseId: 3,
    sourceVerseNumber: 26,
    targetBook: "James",
    targetBookSlug: "james",
    targetChapter: 3,
    targetVerse: 9,
    targetText: "Therewith bless we God, even the Father; and therewith curse we men, which are made after the similitude of God.",
    relationship: "contrast",
    note: "James contrasts the blessing of God with the cursing of those made in God's image.",
  },
];
