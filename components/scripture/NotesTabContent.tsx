"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Loader2,
  PenLine,
  Trash2,
  Edit3,
  Check,
  X,
  StickyNote,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VerseNote {
  id: number;
  bookSlug: string;
  chapterNumber: number;
  verseNumber: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function parseChapterPath(pathname: string | null) {
  if (!pathname) return null;
  const match = pathname.match(/^\/bible\/([^/]+)\/(\d+)/);
  if (!match) return null;
  return { bookSlug: match[1], chapter: parseInt(match[2], 10) };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotesTabContent() {
  const pathname = usePathname();
  const parsed = parseChapterPath(pathname);

  const [notes, setNotes] = useState<VerseNote[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [selectedVerse, setSelectedVerse] = useState(1);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [versePickerOpen, setVersePickerOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!parsed) return;
    setStatus("loading");
    try {
      const res = await fetch(
        `/api/notes?book=${parsed.bookSlug}&chapter=${parsed.chapter}`,
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotes(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.bookSlug, parsed?.chapter]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAdd = async () => {
    if (!parsed || !newNote.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookSlug: parsed.bookSlug,
          chapterNumber: parsed.chapter,
          verseNumber: selectedVerse,
          content: newNote.trim(),
        }),
      });
      if (res.ok) {
        setNewNote("");
        await fetchNotes();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editContent.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content: editContent.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        await fetchNotes();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    await fetchNotes();
  };

  // Group notes by verse
  const notesByVerse: Record<number, VerseNote[]> = {};
  for (const note of notes) {
    if (!notesByVerse[note.verseNumber]) notesByVerse[note.verseNumber] = [];
    notesByVerse[note.verseNumber].push(note);
  }
  const verseNumbers = Object.keys(notesByVerse)
    .map(Number)
    .sort((a, b) => a - b);

  if (!parsed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <StickyNote className="h-8 w-8 text-[var(--text-muted)] mb-3" />
        <p className="text-sm text-[var(--text-muted)]">
          Navigate to a chapter to add notes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Add note form */}
      <div className="p-3 border-b border-[var(--border)]">
        {/* Verse selector */}
        <div className="relative mb-2">
          <button
            onClick={() => setVersePickerOpen(!versePickerOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm",
              "bg-[var(--bg-secondary)] border border-[var(--border)]",
              "text-[var(--text-primary)] hover:border-[var(--accent-gold)]",
              "transition-colors",
            )}
          >
            <span>
              <span className="text-[var(--accent-gold)] font-semibold">
                Verse {selectedVerse}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[var(--text-muted)] transition-transform",
                versePickerOpen && "rotate-180",
              )}
            />
          </button>
          {versePickerOpen && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-lg">
              <div className="grid grid-cols-6 gap-0.5 p-2">
                {Array.from({ length: 176 }, (_, i) => i + 1).map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setSelectedVerse(v);
                      setVersePickerOpen(false);
                    }}
                    className={cn(
                      "px-1 py-1.5 rounded text-xs text-center transition-colors",
                      v === selectedVerse
                        ? "bg-[var(--accent-gold)] text-[var(--bg-primary)] font-bold"
                        : notesByVerse[v]
                          ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] font-medium"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={`Add a note for verse ${selectedVerse}...`}
          rows={3}
          className={cn(
            "w-full resize-none rounded-lg px-3 py-2.5 text-sm",
            "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
            "border border-[var(--border)] focus:border-[var(--accent-gold)]",
            "placeholder:text-[var(--text-muted)]",
            "focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]",
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-[var(--text-muted)]">Cmd+Enter to save</p>
          {newNote.trim() && (
            <button
              onClick={handleAdd}
              disabled={saving}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
                "bg-[var(--accent-gold)] text-[var(--bg-primary)]",
                "hover:bg-[var(--accent-gold-light)] transition-colors disabled:opacity-50",
              )}
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <PenLine className="h-3 w-3" />}
              Save Note
            </button>
          )}
        </div>
      </div>

      {/* Notes list grouped by verse */}
      <div className="flex-1 overflow-y-auto">
        {status === "loading" && notes.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-gold)]" />
          </div>
        )}

        {status === "success" && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-[var(--accent-gold)]/10 p-3 mb-3">
              <StickyNote className="h-6 w-6 text-[var(--accent-gold)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">No notes yet.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Select a verse and write your thoughts above.
            </p>
          </div>
        )}

        {verseNumbers.map((verseNum) => (
          <div key={verseNum} className="border-b border-[var(--border)]">
            {/* Verse header */}
            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                Verse {verseNum}
              </span>
            </div>

            {/* Notes for this verse */}
            {notesByVerse[verseNum].map((note) => (
              <div
                key={note.id}
                className="px-3 py-2 hover:bg-[var(--bg-secondary)]/50 transition-colors group"
              >
                {editingId === note.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className={cn(
                        "w-full resize-none rounded-lg px-3 py-2 text-sm",
                        "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
                        "border border-[var(--accent-gold)]",
                        "focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]",
                      )}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          handleUpdate(note.id);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <div className="flex gap-2 mt-1.5">
                      <button
                        onClick={() => handleUpdate(note.id)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-[var(--accent-gold)] text-[var(--bg-primary)] disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {formatDate(note.updatedAt)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(note.id);
                            setEditContent(note.content);
                          }}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--bg-tertiary)]"
                          aria-label="Edit note"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent-crimson)] hover:bg-[var(--bg-tertiary)]"
                          aria-label="Delete note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
