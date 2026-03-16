import type { ChapterNavLink } from "@/components/scripture/ChapterNavigation";
import { ALL_BOOKS } from "@/lib/data/books";

/**
 * Compute the previous and next chapter navigation links
 * given a book slug and chapter number.
 */
export function getChapterNavLinks(
  bookSlug: string,
  chapterNumber: number,
  bookChapterCount: number,
): { prev: ChapterNavLink | null; next: ChapterNavLink | null } {
  const bookIndex = ALL_BOOKS.findIndex((b) => b.slug === bookSlug);
  const currentBook = ALL_BOOKS[bookIndex];

  let prev: ChapterNavLink | null = null;
  let next: ChapterNavLink | null = null;

  // Previous chapter
  if (chapterNumber > 1) {
    prev = {
      bookSlug,
      bookName: currentBook?.name ?? bookSlug,
      chapter: chapterNumber - 1,
    };
  } else if (bookIndex > 0) {
    const prevBook = ALL_BOOKS[bookIndex - 1];
    prev = {
      bookSlug: prevBook.slug,
      bookName: prevBook.name,
      chapter: prevBook.chapterCount,
    };
  }

  // Next chapter
  if (chapterNumber < bookChapterCount) {
    next = {
      bookSlug,
      bookName: currentBook?.name ?? bookSlug,
      chapter: chapterNumber + 1,
    };
  } else if (bookIndex < ALL_BOOKS.length - 1) {
    const nextBook = ALL_BOOKS[bookIndex + 1];
    next = {
      bookSlug: nextBook.slug,
      bookName: nextBook.name,
      chapter: 1,
    };
  }

  return { prev, next };
}
