"use client";

import { useState, useCallback } from "react";
import {
  Download,
  Trash2,
  Plus,
  Highlighter,
  StickyNote,
  Bookmark,
} from "lucide-react";
import { useNotesStore } from "@/stores/notes";
import { HighlightList } from "@/components/notes/HighlightList";
import { NoteList } from "@/components/notes/NoteList";
import { BookmarkList } from "@/components/notes/BookmarkList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubTab = "highlights" | "notes" | "bookmarks";

interface NotesTabContentProps {
  book: string;
  chapter: number;
}

const SUB_TABS: { key: SubTab; label: string; icon: typeof Highlighter }[] = [
  { key: "highlights", label: "Highlights", icon: Highlighter },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "bookmarks", label: "Bookmarks", icon: Bookmark },
];

/**
 * Full Notes tab content for the context panel.
 * Contains sub-tabs for highlights, notes, and bookmarks.
 * Includes add note form, export, and clear actions.
 */
export function NotesTabContent({ book, chapter }: NotesTabContentProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("notes");
  const [showAddNote, setShowAddNote] = useState(false);
  const [addVerseNumber, setAddVerseNumber] = useState(1);
  const exportData = useNotesStore((s) => s.exportData);
  const clearAll = useNotesStore((s) => s.clearAll);

  const handleExport = useCallback(() => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "the-living-word-notes.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail if download not supported
    }
  }, [exportData]);

  const handleClear = useCallback(() => {
    if (window.confirm("Clear all highlights, notes, and bookmarks? This cannot be undone.")) {
      clearAll();
    }
  }, [clearAll]);

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab navigation */}
      <div className="flex border-b border-border px-2">
        {SUB_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSubTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-source-sans",
              "border-b-2 transition-colors duration-150",
              activeSubTab === key
                ? "border-gold text-gold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            aria-selected={activeSubTab === key}
            role="tab"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Chapter header */}
        <div className="flex items-center justify-between">
          <h3 className="font-cormorant text-sm font-semibold text-foreground">
            {book} {chapter}
          </h3>
          {activeSubTab === "notes" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddNote(!showAddNote)}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Add Note
            </Button>
          )}
        </div>

        {/* Add note form */}
        {showAddNote && activeSubTab === "notes" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Verse:
              <input
                type="number"
                min={1}
                value={addVerseNumber}
                onChange={(e) =>
                  setAddVerseNumber(Math.max(1, parseInt(e.target.value) || 1))
                }
                className={cn(
                  "w-16 px-2 py-1 rounded-md",
                  "bg-secondary border border-border text-sm text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                aria-label="Verse number"
              />
            </label>
            <NoteEditor
              book={book}
              chapter={chapter}
              verseNumber={addVerseNumber}
              onClose={() => setShowAddNote(false)}
            />
          </div>
        )}

        {/* Sub-tab content */}
        {activeSubTab === "highlights" && (
          <HighlightList book={book} chapter={chapter} />
        )}
        {activeSubTab === "notes" && (
          <NoteList book={book} chapter={chapter} />
        )}
        {activeSubTab === "bookmarks" && (
          <BookmarkList book={book} chapter={chapter} />
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="text-xs text-muted-foreground"
        >
          <Download className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Clear All
        </Button>
      </div>
    </div>
  );
}
