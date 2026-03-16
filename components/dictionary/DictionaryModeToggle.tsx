"use client";

import { BookOpen } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import { cn } from "@/lib/utils";

/**
 * Mobile button to toggle Dictionary Mode.
 * Shows a 📖 icon that activates/deactivates dictionary highlighting.
 * Hidden on desktop (keyboard shortcut 'D' is used instead).
 */
export function DictionaryModeToggle() {
  const dictionaryMode = usePreferencesStore((s) => s.dictionaryMode);
  const toggleDictionaryMode = usePreferencesStore((s) => s.toggleDictionaryMode);

  return (
    <button
      onClick={toggleDictionaryMode}
      className={cn(
        "lg:hidden p-2 rounded-lg transition-colors",
        dictionaryMode
          ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30"
          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
      )}
      aria-label={dictionaryMode ? "Exit dictionary mode" : "Enter dictionary mode"}
      aria-pressed={dictionaryMode}
    >
      <BookOpen className="w-4 h-4" />
    </button>
  );
}
