/**
 * People Tab — Design Reference
 *
 * This file documents the expected behavior and styling for the
 * People tab within the context panel on the chapter reading page.
 *
 * ## Feature Overview
 *
 * When a user is reading a Bible chapter and opens the context panel's
 * "People" tab, they see a scrollable list of all named individuals
 * referenced in that chapter. Each person is displayed as a compact
 * card with:
 *
 * 1. **Name** — heading style (font-cormorant)
 * 2. **Tribe/Group badge** — gold on tertiary background
 * 3. **Description snippet** — 2-line clamp
 * 4. **Family connections** — father, mother, spouse (compact labels)
 * 5. **Click to navigate** — links to `/people/[slug]` full profile
 *
 * ## Components
 *
 * - `components/people/PeopleTabContent.tsx` — Main tab content (client)
 * - `components/people/PeopleTabCard.tsx` — Mini person card
 * - `components/people/PeopleTabEmpty.tsx` — Empty state
 * - `app/api/people/chapter/route.ts` — API endpoint
 * - `lib/db/queries.ts` — `getPeopleByChapterWithFamily()`
 *
 * ## Integration Points
 *
 * - `components/layout/ContextPanelContent.tsx` — renders PeopleTabContent
 *   when `activeTab === "people"`
 * - `components/scripture/ContextPanel.tsx` — same integration for the
 *   chapter page's inline context panel
 *
 * ## Data Flow
 *
 * 1. User navigates to `/bible/[bookSlug]/[chapter]`
 * 2. Context panel shows tabs; user clicks "People"
 * 3. `PeopleTabContent` reads URL via `usePathname()` to get bookSlug/chapter
 * 4. Fetches `/api/people/chapter?book=genesis&chapter=1`
 * 5. API calls `getPeopleByChapterWithFamily()` which:
 *    a. Gets base people from `people_references` → `people` join
 *    b. Deduplicates by person ID
 *    c. Enriches each with father/mother names via relational query
 *    d. Finds spouse by looking for shared children
 * 6. Returns JSON `{ people: ChapterPerson[] }`
 * 7. Client renders list of `PeopleTabCard` components
 *
 * ## States
 *
 * - **Loading** — Centered spinner with "Loading people…" text
 * - **Empty** — Users icon + "No People Found" message
 * - **Error** — Red error message with details
 * - **Success** — Count label + scrollable card list
 *
 * ## Styling Specs
 *
 * ### PeopleTabCard
 * - Border: `border border-[var(--border)]` → hover: `border-[var(--accent-gold)]`
 * - Background: `bg-[var(--bg-card)]`
 * - Avatar: 36×36 rounded-full, gold icon on tertiary bg
 * - Avatar hover: gold bg with primary bg text (inverted)
 * - Name: `heading text-base`, hover turns gold
 * - Badge: `text-[10px]` gold text on tertiary bg, rounded-full
 * - Description: `text-xs text-[var(--text-secondary)] line-clamp-2`
 * - Family labels: `text-[10px]` with bold label + muted value
 * - Focus: `ring-2 ring-[var(--accent-gold)]`
 *
 * ### PeopleTabEmpty
 * - Centered layout with large Users icon (h-8 w-8)
 * - Heading: `heading text-lg`
 * - Subtitle: `text-sm text-[var(--text-muted)]`
 *
 * ### List Container
 * - Gap: `gap-2` between cards
 * - Count label: `text-xs text-[var(--text-muted)]` above list
 * - Semantic `<ul>` with `role="list"`
 *
 * ## Responsive Behavior
 *
 * - Desktop: renders inside the fixed 380px right sidebar
 * - Mobile: renders inside the bottom sheet (70vh)
 * - Cards are full-width within the panel padding
 * - Touch targets meet 44px minimum via card padding
 *
 * ## Accessibility
 *
 * - Each card has `aria-label="View profile of {name}"`
 * - Loading state has `role="status"` + `aria-label="Loading people"`
 * - Empty state has `role="status"` + `aria-label="No people found"`
 * - Error state has `role="alert"`
 * - List uses semantic `<ul>/<li>` with `role="list"`
 * - All cards are keyboard-focusable with visible focus ring
 *
 * ## Example Data
 */

import type { ChapterPerson } from "@/components/people/PeopleTabCard";

/** Sample people for Genesis 1 testing. */
export const sampleChapterPeople: ChapterPerson[] = [
  {
    id: 1,
    name: "Adam",
    slug: "adam",
    description:
      "The first man, created by God from the dust of the ground and given life by the breath of God.",
    alsoKnownAs: null,
    tribeOrGroup: "First Humans",
    fatherName: null,
    motherName: null,
    spouseName: "Eve",
  },
  {
    id: 2,
    name: "Eve",
    slug: "eve",
    description:
      "The first woman, created from Adam's rib to be his companion and helper.",
    alsoKnownAs: null,
    tribeOrGroup: "First Humans",
    fatherName: null,
    motherName: null,
    spouseName: "Adam",
  },
  {
    id: 3,
    name: "Abraham",
    slug: "abraham",
    description:
      "Father of the Hebrew nation, called by God to leave Ur and journey to the Promised Land.",
    alsoKnownAs: "Abram",
    tribeOrGroup: "Patriarch",
    fatherName: "Terah",
    motherName: null,
    spouseName: "Sarah",
  },
  {
    id: 4,
    name: "Isaac",
    slug: "isaac",
    description:
      "Son of Abraham and Sarah, born miraculously in their old age as fulfillment of God's promise.",
    alsoKnownAs: null,
    tribeOrGroup: "Patriarch",
    fatherName: "Abraham",
    motherName: "Sarah",
    spouseName: "Rebekah",
  },
  {
    id: 5,
    name: "Jacob",
    slug: "jacob",
    description:
      "Son of Isaac, later renamed Israel. Father of the twelve tribes.",
    alsoKnownAs: "Israel",
    tribeOrGroup: "Patriarch",
    fatherName: "Isaac",
    motherName: "Rebekah",
    spouseName: "Rachel",
  },
];
