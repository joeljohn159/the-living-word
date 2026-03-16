"use client";

import { Trash2, Highlighter } from "lucide-react";
import { useNotesStore } from "@/stores/notes";
import { HIGHLIGHT_BG_MAP } from "@/components/notes/HighlightColorPicker";
import { cn } from "@/lib/utils";

interface HighlightListProps {
  book: string;
  chapter: number;
}

/**
 * Displays all highlights for the current chapter.
 */
export function HighlightList({ book, chapter }: HighlightListProps) {
  const highlights = useNotesStore((s) =>
    s.getHighlightsForChapter(book, chapter)
  );
  const removeHighlight = useNotesStore((s) => s.removeHighlight);

  if (highlights.length === 0) {
    return (
      <div className="text-center py-6">
        <Highlighter
          className="h-5 w-5 text-muted-foreground mx-auto mb-2"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          No highlights yet. Select text in a verse to highlight.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Highlights">
      {highlights.map((h) => (
        <li
          key={h.id}
          className={cn(
            "flex items-start gap-2 p-2 rounded-md",
            HIGHLIGHT_BG_MAP[h.color]
          )}
        >
          <span className="text-xs text-muted-foreground font-mono shrink-0 pt-0.5">
            {h.verseNumber}
          </span>
          <p className="text-sm text-foreground flex-1 break-words">
            &ldquo;{h.text}&rdquo;
          </p>
          <button
            onClick={() => removeHighlight(h.id)}
            className="p-1 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={`Remove highlight: ${h.text}`}
            title="Remove highlight"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
