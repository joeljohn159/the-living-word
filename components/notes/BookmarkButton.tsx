"use client";

import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  book: string;
  chapter: number;
  verseNumber: number;
  className?: string;
}

/**
 * Toggle button for bookmarking a verse.
 * Filled icon when bookmarked, outline when not.
 */
export function BookmarkButton({
  book,
  chapter,
  verseNumber,
  className,
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks(
    book,
    chapter,
    verseNumber
  );

  return (
    <button
      onClick={toggleBookmark}
      className={cn(
        "p-1 rounded transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isBookmarked
          ? "text-gold hover:text-gold-dark"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label={
        isBookmarked
          ? `Remove bookmark from ${book} ${chapter}:${verseNumber}`
          : `Bookmark ${book} ${chapter}:${verseNumber}`
      }
      aria-pressed={isBookmarked}
      title={isBookmarked ? "Remove bookmark" : "Bookmark verse"}
    >
      <Bookmark
        className="h-4 w-4"
        fill={isBookmarked ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}
