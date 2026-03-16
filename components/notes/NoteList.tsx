"use client";

import { useState } from "react";
import { Trash2, Pencil, StickyNote } from "lucide-react";
import { useNotesStore } from "@/stores/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { cn } from "@/lib/utils";

interface NoteListProps {
  book: string;
  chapter: number;
}

/**
 * Displays all notes for the current chapter with edit/delete actions.
 */
export function NoteList({ book, chapter }: NoteListProps) {
  const notes = useNotesStore((s) => s.getNotesForChapter(book, chapter));
  const removeNote = useNotesStore((s) => s.removeNote);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (notes.length === 0) {
    return (
      <div className="text-center py-6">
        <StickyNote
          className="h-5 w-5 text-muted-foreground mx-auto mb-2"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          No notes yet. Add a note to any verse.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Notes">
      {notes.map((note) => (
        <li
          key={note.id}
          className={cn(
            "p-3 rounded-md border border-border bg-secondary/50",
            "transition-colors duration-150"
          )}
        >
          {editingId === note.id ? (
            <NoteEditor
              book={note.book}
              chapter={note.chapter}
              verseNumber={note.verseNumber}
              existingNoteId={note.id}
              existingContent={note.content}
              onClose={() => setEditingId(null)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-gold">
                  {note.book} {note.chapter}:{note.verseNumber}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingId(note.id)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Edit note for verse ${note.verseNumber}`}
                    title="Edit note"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Delete note for verse ${note.verseNumber}`}
                    title="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                {note.content}
              </p>
              <time className="text-[10px] text-muted-foreground mt-1 block">
                {new Date(note.updatedAt).toLocaleDateString()}
              </time>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
