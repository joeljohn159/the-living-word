"use client";

import { usePreferencesStore, type ReadingMode } from "@/stores/preferences";
import { AlignJustify, List } from "lucide-react";
import { cn } from "@/lib/utils";

/** Toggle between paragraph and verse-per-line reading modes. */
export function ReadingModeToggle() {
  const mode = usePreferencesStore((s) => s.readingMode);
  const setMode = usePreferencesStore((s) => s.setReadingMode);

  const options: { value: ReadingMode; icon: typeof AlignJustify; label: string }[] = [
    { value: "paragraph", icon: AlignJustify, label: "Paragraph mode" },
    { value: "verse-per-line", icon: List, label: "Verse-per-line mode" },
  ];

  return (
    <div
      className="flex items-center rounded-md border border-[var(--border)] overflow-hidden"
      role="radiogroup"
      aria-label="Reading mode"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={mode === value}
          aria-label={label}
          onClick={() => setMode(value)}
          className={cn(
            "flex items-center justify-center w-8 h-8 transition-colors",
            mode === value
              ? "bg-[var(--accent-gold)] text-[var(--bg-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
          )}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
