"use client";

import { Bookmark, Trash2 } from "lucide-react";
import { useNotesStore } from "@/stores/notes";
import { cn } from "@/lib/utils";

interface BookmarkListProps {
  book: string;
  chapter: number;
}

/**
 * Displays all bookmarks for the current chapter.
 */
export function BookmarkList({ book, chapter }: BookmarkListProps) {
  const bookmarks = useNotesStore((s) =>
    s.getBookmarksForChapter(book, chapter)
  );
  const toggleBookmark = useNotesStore((s) => s.toggleBookmark);

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-6">
        <Bookmark
          className="h-5 w-5 text-muted-foreground mx-auto mb-2"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          No bookmarks yet. Tap the bookmark icon on any verse.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1" aria-label="Bookmarks">
      {bookmarks.map((bm) => (
        <li
          key={bm.id}
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-md",
            "hover:bg-secondary/50 transition-colors duration-150"
          )}
        >
          <div className="flex items-center gap-2">
            <Bookmark
              className="h-4 w-4 text-gold"
              fill="currentColor"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground font-source-sans">
              {bm.book} {bm.chapter}:{bm.verseNumber}
            </span>
          </div>
          <button
            onClick={() => toggleBookmark(bm.book, bm.chapter, bm.verseNumber)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={`Remove bookmark from ${bm.book} ${bm.chapter}:${bm.verseNumber}`}
            title="Remove bookmark"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
