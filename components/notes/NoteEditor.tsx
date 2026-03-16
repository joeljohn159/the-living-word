"use client";

import { useState, useCallback } from "react";
import { Send, X } from "lucide-react";
import { useNotesStore } from "@/stores/notes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  book: string;
  chapter: number;
  verseNumber: number;
  existingNoteId?: string;
  existingContent?: string;
  onClose?: () => void;
}

/**
 * Text area for adding or editing a note on a specific verse.
 */
export function NoteEditor({
  book,
  chapter,
  verseNumber,
  existingNoteId,
  existingContent = "",
  onClose,
}: NoteEditorProps) {
  const [content, setContent] = useState(existingContent);
  const addNote = useNotesStore((s) => s.addNote);
  const updateNote = useNotesStore((s) => s.updateNote);

  const handleSave = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (existingNoteId) {
      updateNote(existingNoteId, trimmed);
    } else {
      addNote(book, chapter, verseNumber, trimmed);
    }
    onClose?.();
  }, [content, existingNoteId, updateNote, addNote, book, chapter, verseNumber, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        onClose?.();
      }
    },
    [handleSave, onClose]
  );

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground font-source-sans">
        {existingNoteId ? "Edit note" : "Add note"} for {book} {chapter}:
        {verseNumber}
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your note..."
        className={cn(
          "w-full min-h-[80px] p-3 rounded-md",
          "bg-secondary border border-border",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "font-source-sans resize-y",
          "focus:outline-none focus:ring-2 focus:ring-ring"
        )}
        aria-label={`Note for ${book} ${chapter}:${verseNumber}`}
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          ⌘/Ctrl+Enter to save
        </span>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!content.trim()}
          >
            <Send className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
