/**
 * Notes & Highlights Tab — Design Specification
 * ================================================
 *
 * The Notes tab lives in the Context Panel sidebar and provides
 * personal annotation features for the reader.
 *
 * STORE: stores/notes.ts (Zustand + localStorage persistence)
 * KEY: "the-living-word-notes"
 *
 * ── Data Types ──────────────────────────────────────────────
 *
 * Highlight {
 *   id: string           — unique ID (timestamp + random)
 *   book: string          — e.g. "Genesis"
 *   chapter: number       — e.g. 1
 *   verseNumber: number   — e.g. 3
 *   text: string          — selected text fragment
 *   color: HighlightColor — "gold" | "crimson" | "blue" | "green" | "purple"
 *   createdAt: number     — Unix timestamp
 * }
 *
 * Note {
 *   id: string
 *   book: string
 *   chapter: number
 *   verseNumber: number
 *   content: string       — user's note text
 *   createdAt: number
 *   updatedAt: number
 * }
 *
 * Bookmark {
 *   id: string
 *   book: string
 *   chapter: number
 *   verseNumber: number
 *   createdAt: number
 * }
 *
 * ── Components ──────────────────────────────────────────────
 *
 * 1. NotesTabContent (components/notes/NotesTabContent.tsx)
 *    - Main container rendered inside ContextPanelContent when activeTab="notes"
 *    - Props: { book: string; chapter: number }
 *    - Contains 3 sub-tabs: Highlights | Notes | Bookmarks
 *    - Sub-tabs use simple button row with gold underline on active
 *    - Footer: Export (downloads JSON) and Clear All (with confirm dialog)
 *
 * 2. HighlightColorPicker (components/notes/HighlightColorPicker.tsx)
 *    - 5 color circles: gold, crimson, blue, green, purple
 *    - Selected color gets ring-2 ring-foreground and scale-110
 *    - Uses role="radiogroup" for accessibility
 *
 * 3. HighlightPopover (components/notes/HighlightPopover.tsx)
 *    - Floating popover at cursor position when text is selected
 *    - Shows truncated selected text, color picker, and save/cancel buttons
 *    - Fixed position, z-50, card background with border
 *
 * 4. HighlightList (components/notes/HighlightList.tsx)
 *    - Lists highlights for current chapter
 *    - Each item: verse number + quoted text + delete button
 *    - Background tinted with highlight color at 20% opacity
 *    - Empty state: Highlighter icon + instructional text
 *
 * 5. NoteEditor (components/notes/NoteEditor.tsx)
 *    - Textarea with save/cancel actions
 *    - Supports Cmd/Ctrl+Enter to save, Escape to cancel
 *    - Used for both adding new notes and editing existing ones
 *    - Props: { book, chapter, verseNumber, existingNoteId?, existingContent?, onClose? }
 *
 * 6. NoteList (components/notes/NoteList.tsx)
 *    - Lists notes for current chapter
 *    - Each note: verse reference (gold mono) + content + edit/delete actions + date
 *    - Inline editing via NoteEditor when edit button is clicked
 *    - Empty state: StickyNote icon + instructional text
 *
 * 7. BookmarkButton (components/notes/BookmarkButton.tsx)
 *    - Toggle button using lucide Bookmark icon
 *    - Filled gold when bookmarked, outline when not
 *    - aria-pressed for accessibility
 *    - Uses hooks/useBookmarks.ts
 *
 * 8. BookmarkList (components/notes/BookmarkList.tsx)
 *    - Lists bookmarks for current chapter
 *    - Each item: filled bookmark icon + verse reference + remove button
 *    - Empty state: Bookmark icon + instructional text
 *
 * ── Hook ────────────────────────────────────────────────────
 *
 * hooks/useBookmarks.ts
 *   - useBookmarks(book, chapter, verseNumber)
 *     Returns { isBookmarked: boolean; toggleBookmark: () => void }
 *   - useChapterBookmarks(book, chapter)
 *     Returns Bookmark[] for the chapter
 *
 * ── Integration ─────────────────────────────────────────────
 *
 * ContextPanelContent.tsx receives optional `book` and `chapter` props.
 * When activeTab === "notes", it renders <NotesTabContent book={book} chapter={chapter} />.
 * Default values: book="Genesis", chapter=1.
 *
 * ── Styling ─────────────────────────────────────────────────
 *
 * - Follows existing theme system (CSS variables)
 * - font-cormorant for headings, font-source-sans for UI text
 * - gold accent color for active states
 * - bg-secondary for input backgrounds
 * - border-border for all borders
 * - Responsive: works within 380px sidebar and mobile bottom sheet
 * - All interactive elements have focus-visible ring styles
 * - Transitions: duration-150 for color changes
 *
 * ── Persistence ─────────────────────────────────────────────
 *
 * All data persists via Zustand's `persist` middleware to localStorage.
 * Key: "the-living-word-notes"
 * Data survives page refreshes and browser restarts.
 *
 * ── Export Format ───────────────────────────────────────────
 *
 * {
 *   "highlights": [...],
 *   "notes": [...],
 *   "bookmarks": [...]
 * }
 *
 * Downloaded as "the-living-word-notes.json".
 *
 * ── Highlight Colors ────────────────────────────────────────
 *
 * | Name    | Swatch        | Display BG (20%) |
 * |---------|---------------|------------------|
 * | gold    | #C4975C       | bg-[#C4975C]/20  |
 * | crimson | #8B2F3F       | bg-[#8B2F3F]/20  |
 * | blue    | #3B6FA0       | bg-[#3B6FA0]/20  |
 * | green   | #4A7C59       | bg-[#4A7C59]/20  |
 * | purple  | #6B4C8A       | bg-[#6B4C8A]/20  |
 */

// Example usage in a page component:
//
// import { Sidebar } from "@/components/layout/Sidebar";
// import { BookmarkButton } from "@/components/notes/BookmarkButton";
//
// // In verse rendering:
// <div className="flex items-center gap-2">
//   <span>1:3 And God said, Let there be light...</span>
//   <BookmarkButton book="Genesis" chapter={1} verseNumber={3} />
// </div>
//
// // Sidebar already renders NotesTabContent when Notes tab is active.
// // Pass book/chapter to ContextPanelContent:
// <ContextPanelContent activeTab={activeTab} book="Genesis" chapter={1} />

export {};
