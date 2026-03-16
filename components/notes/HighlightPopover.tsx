"use client";

import { useState, useCallback } from "react";
import { Highlighter } from "lucide-react";
import { useNotesStore, type HighlightColor } from "@/stores/notes";
import { HighlightColorPicker } from "@/components/notes/HighlightColorPicker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HighlightPopoverProps {
  book: string;
  chapter: number;
  verseNumber: number;
  selectedText: string;
  position: { top: number; left: number };
  onClose: () => void;
}

/**
 * Floating popover that appears when user selects verse text.
 * Allows choosing a highlight color and saving.
 */
export function HighlightPopover({
  book,
  chapter,
  verseNumber,
  selectedText,
  position,
  onClose,
}: HighlightPopoverProps) {
  const [color, setColor] = useState<HighlightColor>("gold");
  const addHighlight = useNotesStore((s) => s.addHighlight);

  const handleSave = useCallback(() => {
    addHighlight(book, chapter, verseNumber, selectedText, color);
    onClose();
  }, [addHighlight, book, chapter, verseNumber, selectedText, color, onClose]);

  return (
    <div
      className={cn(
        "fixed z-50 p-3 rounded-lg shadow-xl",
        "bg-card border border-border",
        "animate-fade-in"
      )}
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-label="Highlight selected text"
    >
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          &ldquo;{selectedText}&rdquo;
        </p>
        <HighlightColorPicker selected={color} onSelect={setColor} />
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Highlighter className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            Highlight
          </Button>
        </div>
      </div>
    </div>
  );
}
