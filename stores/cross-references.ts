import { create } from "zustand";

export interface ChapterCrossRef {
  id: number;
  sourceVerseId: number;
  sourceVerseNumber: number;
  targetBook: string;
  targetBookSlug: string;
  targetChapter: number;
  targetVerse: number;
  targetText: string;
  relationship: string;
  note: string | null;
}

interface CrossRefState {
  /** All cross-references for the current chapter. */
  crossRefs: ChapterCrossRef[];
  /** Currently selected verse number (null = show all chapter refs). */
  selectedVerseNumber: number | null;
  /** Book slug for link building. */
  bookSlug: string;
  /** Book display name. */
  bookName: string;
  /** Current chapter number. */
  chapter: number;

  /** Hydrate the store with chapter data (called from provider). */
  hydrate: (data: {
    crossRefs: ChapterCrossRef[];
    bookSlug: string;
    bookName: string;
    chapter: number;
  }) => void;
  /** Select a verse to filter cross-refs. */
  selectVerse: (verseNumber: number | null) => void;
  /** Clear verse selection to show all chapter refs. */
  clearSelection: () => void;
}

export const useCrossRefStore = create<CrossRefState>()((set) => ({
  crossRefs: [],
  selectedVerseNumber: null,
  bookSlug: "",
  bookName: "",
  chapter: 0,

  hydrate: (data) =>
    set({
      crossRefs: data.crossRefs,
      bookSlug: data.bookSlug,
      bookName: data.bookName,
      chapter: data.chapter,
      selectedVerseNumber: null,
    }),

  selectVerse: (verseNumber) => set({ selectedVerseNumber: verseNumber }),

  clearSelection: () => set({ selectedVerseNumber: null }),
}));
