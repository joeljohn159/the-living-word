import { useCallback } from "react";
import { useNotesStore } from "@/stores/notes";

/**
 * Hook for managing verse bookmarks.
 * Returns bookmark state and toggle function for a specific verse.
 */
export function useBookmarks(
  book: string,
  chapter: number,
  verseNumber: number
) {
  const isBookmarked = useNotesStore((s) =>
    s.isBookmarked(book, chapter, verseNumber)
  );
  const toggleBookmark = useNotesStore((s) => s.toggleBookmark);

  const toggle = useCallback(() => {
    toggleBookmark(book, chapter, verseNumber);
  }, [toggleBookmark, book, chapter, verseNumber]);

  return { isBookmarked, toggleBookmark: toggle };
}

/**
 * Hook for all bookmarks in a chapter.
 */
export function useChapterBookmarks(book: string, chapter: number) {
  const bookmarks = useNotesStore((s) =>
    s.getBookmarksForChapter(book, chapter)
  );
  return bookmarks;
}
