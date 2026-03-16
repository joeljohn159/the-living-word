/**
 * Evidence Tab — Design Reference
 *
 * This file documents the expected behavior, styling, and data flow
 * for the Evidence tab in the context panel sidebar.
 *
 * ## Feature Overview
 *
 * When a user is reading a chapter and opens the context panel,
 * the Evidence tab shows archaeological and historical evidence
 * linked to the current chapter. Evidence is fetched from the DB
 * via the `/api/evidence` route.
 *
 * ## Components
 *
 * - `components/layout/EvidenceTabContent.tsx` — Tab content with loading/empty/error states
 * - `components/media/EvidenceCard.tsx` — Compact card for sidebar display
 * - `hooks/use-chapter-evidence.ts` — Data fetching hook using URL params
 * - `app/api/evidence/route.ts` — API endpoint for fetching evidence by chapter
 * - `components/layout/ContextPanelContent.tsx` — Updated to render EvidenceTabContent
 *
 * ## Data Flow
 *
 * 1. User navigates to `/bible/[bookSlug]/[chapter]`
 * 2. Opens sidebar, selects "Evidence" tab
 * 3. `useChapterEvidence()` hook reads `bookSlug` and `chapter` from URL params
 * 4. Fetches from `/api/evidence?bookSlug=genesis&chapter=1`
 * 5. API calls `getEvidenceByChapter()` from DB queries
 * 6. Results rendered as scrollable list of `EvidenceCard` components
 *
 * ## EvidenceCard Layout (Compact — for sidebar)
 *
 * ```
 * ┌─────────────────────────────────┐
 * │ [Image with gradient overlay]   │
 * │  ┌──────────┐                   │
 * │  │ Category │  (badge overlay)  │
 * │  └──────────┘                   │
 * ├─────────────────────────────────┤
 * │ Title (font-cormorant, semibold)│
 * │ Significance summary (2 lines) │
 * │ 📅 1947  📍 British Museum     │
 * └─────────────────────────────────┘
 * ```
 *
 * ## Styling Specs
 *
 * ### EvidenceCard
 * - Container: `rounded-lg overflow-hidden bg-card border border-border`
 * - Hover: `hover:border-gold/50 hover:shadow-md hover:shadow-gold/5`
 * - Focus: `focus-visible:ring-2 focus-visible:ring-gold`
 * - Image: `aspect-[16/9]` with gradient overlay `from-black/60`
 * - Badge: overlaid top-left on image, uses CategoryBadge component
 * - Title: `font-cormorant text-base font-semibold`, gold on hover
 * - Significance: `text-xs text-muted-foreground line-clamp-2`
 * - Metadata: `text-[11px]` with Calendar and MapPin icons
 * - Entire card is a Link to `/evidence/[slug]`
 *
 * ### Category Badge Colors
 * - Manuscript: blue (`bg-blue-500/10 text-blue-400`)
 * - Archaeology: amber (`bg-amber-500/10 text-amber-400`)
 * - Inscription: emerald (`bg-emerald-500/10 text-emerald-400`)
 * - Artifact: purple (`bg-purple-500/10 text-purple-400`)
 *
 * ### Loading State
 * - Centered spinner in gold (`animate-spin`)
 * - "Loading evidence..." text below
 *
 * ### Empty State
 * - Gold ShieldCheck icon in `bg-gold/10` circle
 * - "No Evidence Found" heading (font-cormorant)
 * - Descriptive subtitle text
 *
 * ### Error State
 * - Destructive-colored AlertCircle icon
 * - Error message displayed
 *
 * ## Example Usage
 *
 * ```tsx
 * // The EvidenceTabContent is automatically rendered by ContextPanelContent
 * // when activeTab === "evidence"
 *
 * import { ContextPanelContent } from "@/components/layout/ContextPanelContent";
 *
 * <ContextPanelContent activeTab="evidence" />
 * ```
 *
 * ## Standalone Card Usage
 *
 * ```tsx
 * import { EvidenceCard } from "@/components/media/EvidenceCard";
 *
 * <EvidenceCard
 *   title="Dead Sea Scrolls"
 *   slug="dead-sea-scrolls"
 *   description="Ancient manuscripts found near the Dead Sea."
 *   category="manuscript"
 *   dateDiscovered="1947"
 *   currentLocation="Israel Museum, Jerusalem"
 *   significance="Contains the oldest known copies of the Hebrew Bible texts."
 *   imageUrl="/images/evidence/dead-sea-scrolls.jpg"
 * />
 * ```
 *
 * ## Responsive Behavior
 *
 * - Desktop: cards render in the 380px sidebar panel
 * - Mobile: cards render in the bottom sheet (70vh)
 * - Image aspect ratio: 16:9 for compact display
 * - Text truncation prevents overflow
 * - Scrollable container handles many items
 *
 * ## Accessibility
 *
 * - Card list uses `role="list"` with `role="listitem"` children
 * - Each card is a `<Link>` with descriptive `aria-label`
 * - Category badges use `aria-hidden` on decorative icons
 * - Loading spinner uses descriptive text for screen readers
 * - Error state uses `role="alert"`
 * - Keyboard navigation: Tab through cards, Enter to navigate
 */

import type { EvidenceItem } from "@/hooks/use-chapter-evidence";

/** Sample evidence items for testing and development. */
export const sampleEvidenceItems: EvidenceItem[] = [
  {
    id: 1,
    title: "Dead Sea Scrolls",
    slug: "dead-sea-scrolls",
    description:
      "Collection of Jewish texts discovered between 1947 and 1956 in eleven caves near the Dead Sea.",
    category: "manuscript",
    dateDiscovered: "1947",
    locationFound: "Qumran, West Bank",
    currentLocation: "Israel Museum, Jerusalem",
    significance:
      "Contains the oldest known copies of the Hebrew Bible texts, directly confirms preservation accuracy.",
    imageUrl: "/images/evidence/dead-sea-scrolls.jpg",
    sourceUrl: "https://www.deadseascrolls.org.il/",
  },
  {
    id: 2,
    title: "Tel Dan Stele",
    slug: "tel-dan-stele",
    description:
      "A broken stele discovered in 1993 at Tel Dan in northern Israel.",
    category: "inscription",
    dateDiscovered: "1993",
    locationFound: "Tel Dan, Israel",
    currentLocation: "Israel Museum, Jerusalem",
    significance:
      "First historical evidence of King David outside the Bible.",
    imageUrl: null,
    sourceUrl: null,
  },
  {
    id: 3,
    title: "Cyrus Cylinder",
    slug: "cyrus-cylinder",
    description:
      "An ancient clay cylinder describing the conquest of Babylon by Cyrus the Great.",
    category: "artifact",
    dateDiscovered: "1879",
    locationFound: "Babylon, Iraq",
    currentLocation: "British Museum, London",
    significance:
      "Confirms the biblical account of Cyrus allowing Jewish exiles to return to Jerusalem.",
    imageUrl: "/images/evidence/cyrus-cylinder.jpg",
    sourceUrl: null,
  },
];
