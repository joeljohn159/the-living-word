import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ─── Types ────────────────────────────────────────────────── */

export type HighlightColor = "gold" | "crimson" | "blue" | "green" | "purple";

export interface Highlight {
  id: string;
  book: string;
  chapter: number;
  verseNumber: number;
  text: string;
  color: HighlightColor;
  createdAt: number;
}

export interface Note {
  id: string;
  book: string;
  chapter: number;
  verseNumber: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verseNumber: number;
  createdAt: number;
}

/* ─── Helpers ──────────────────────────────────────────────── */

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function chapterKey(book: string, chapter: number): string {
  return `${book}:${chapter}`;
}

/* ─── Store ────────────────────────────────────────────────── */

interface NotesState {
  highlights: Highlight[];
  notes: Note[];
  bookmarks: Bookmark[];

  // Highlights
  addHighlight: (
    book: string,
    chapter: number,
    verseNumber: number,
    text: string,
    color: HighlightColor
  ) => void;
  removeHighlight: (id: string) => void;
  getHighlightsForChapter: (book: string, chapter: number) => Highlight[];

  // Notes
  addNote: (
    book: string,
    chapter: number,
    verseNumber: number,
    content: string
  ) => void;
  updateNote: (id: string, content: string) => void;
  removeNote: (id: string) => void;
  getNotesForChapter: (book: string, chapter: number) => Note[];
  getNoteForVerse: (
    book: string,
    chapter: number,
    verseNumber: number
  ) => Note | undefined;

  // Bookmarks
  toggleBookmark: (
    book: string,
    chapter: number,
    verseNumber: number
  ) => void;
  isBookmarked: (
    book: string,
    chapter: number,
    verseNumber: number
  ) => boolean;
  getBookmarksForChapter: (book: string, chapter: number) => Bookmark[];

  // Export / Clear
  exportData: () => string;
  clearAll: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      highlights: [],
      notes: [],
      bookmarks: [],

      /* ── Highlights ─────────────────────────────────────── */

      addHighlight: (book, chapter, verseNumber, text, color) =>
        set((state) => ({
          highlights: [
            ...state.highlights,
            {
              id: makeId(),
              book,
              chapter,
              verseNumber,
              text,
              color,
              createdAt: Date.now(),
            },
          ],
        })),

      removeHighlight: (id) =>
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== id),
        })),

      getHighlightsForChapter: (book, chapter) => {
        const key = chapterKey(book, chapter);
        return get().highlights.filter(
          (h) => chapterKey(h.book, h.chapter) === key
        );
      },

      /* ── Notes ──────────────────────────────────────────── */

      addNote: (book, chapter, verseNumber, content) =>
        set((state) => {
          const now = Date.now();
          return {
            notes: [
              ...state.notes,
              {
                id: makeId(),
                book,
                chapter,
                verseNumber,
                content,
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        }),

      updateNote: (id, content) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, content, updatedAt: Date.now() } : n
          ),
        })),

      removeNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),

      getNotesForChapter: (book, chapter) => {
        const key = chapterKey(book, chapter);
        return get().notes.filter(
          (n) => chapterKey(n.book, n.chapter) === key
        );
      },

      getNoteForVerse: (book, chapter, verseNumber) => {
        return get().notes.find(
          (n) =>
            n.book === book &&
            n.chapter === chapter &&
            n.verseNumber === verseNumber
        );
      },

      /* ── Bookmarks ──────────────────────────────────────── */

      toggleBookmark: (book, chapter, verseNumber) =>
        set((state) => {
          const existing = state.bookmarks.find(
            (b) =>
              b.book === book &&
              b.chapter === chapter &&
              b.verseNumber === verseNumber
          );
          if (existing) {
            return {
              bookmarks: state.bookmarks.filter((b) => b.id !== existing.id),
            };
          }
          return {
            bookmarks: [
              ...state.bookmarks,
              {
                id: makeId(),
                book,
                chapter,
                verseNumber,
                createdAt: Date.now(),
              },
            ],
          };
        }),

      isBookmarked: (book, chapter, verseNumber) => {
        return get().bookmarks.some(
          (b) =>
            b.book === book &&
            b.chapter === chapter &&
            b.verseNumber === verseNumber
        );
      },

      getBookmarksForChapter: (book, chapter) => {
        const key = chapterKey(book, chapter);
        return get().bookmarks.filter(
          (b) => chapterKey(b.book, b.chapter) === key
        );
      },

      /* ── Export / Clear ─────────────────────────────────── */

      exportData: () => {
        const { highlights, notes, bookmarks } = get();
        return JSON.stringify({ highlights, notes, bookmarks }, null, 2);
      },

      clearAll: () => set({ highlights: [], notes: [], bookmarks: [] }),
    }),
    {
      name: "the-living-word-notes",
    }
  )
);
