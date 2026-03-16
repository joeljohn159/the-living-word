import { ALL_BOOKS } from "@/lib/data/books";

export interface VerseNavLink {
  bookSlug: string;
  bookName: string;
  chapter: number;
  verse: number;
}

/**
 * Compute previous and next verse navigation links
 * within the same chapter.
 */
export function getVerseNavLinks(
  bookSlug: string,
  chapterNumber: number,
  verseNumber: number,
  chapterVerseCount: number,
): { prev: VerseNavLink | null; next: VerseNavLink | null } {
  const bookIndex = ALL_BOOKS.findIndex((b) => b.slug === bookSlug);
  const currentBook = ALL_BOOKS[bookIndex];

  let prev: VerseNavLink | null = null;
  let next: VerseNavLink | null = null;

  // Previous verse
  if (verseNumber > 1) {
    prev = {
      bookSlug,
      bookName: currentBook?.name ?? bookSlug,
      chapter: chapterNumber,
      verse: verseNumber - 1,
    };
  }

  // Next verse
  if (verseNumber < chapterVerseCount) {
    next = {
      bookSlug,
      bookName: currentBook?.name ?? bookSlug,
      chapter: chapterNumber,
      verse: verseNumber + 1,
    };
  }

  return { prev, next };
}
