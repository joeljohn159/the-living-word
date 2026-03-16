"use client";

import { usePreferencesStore } from "@/stores/preferences";
import { Minus, Plus } from "lucide-react";

/** A- / A+ buttons to adjust scripture font size. */
export function FontSizeControls() {
  const fontSize = usePreferencesStore((s) => s.fontSize);
  const increase = usePreferencesStore((s) => s.increaseFontSize);
  const decrease = usePreferencesStore((s) => s.decreaseFontSize);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Font size controls">
      <button
        onClick={decrease}
        disabled={fontSize <= 14}
        className="flex items-center justify-center w-8 h-8 rounded
                   text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                   hover:bg-[var(--bg-tertiary)] disabled:opacity-30
                   disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease font size"
      >
        <span className="font-cormorant text-sm font-semibold">A</span>
        <Minus className="w-3 h-3" />
      </button>

      <span className="text-xs text-[var(--text-muted)] w-8 text-center tabular-nums">
        {fontSize}
      </span>

      <button
        onClick={increase}
        disabled={fontSize >= 28}
        className="flex items-center justify-center w-8 h-8 rounded
                   text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                   hover:bg-[var(--bg-tertiary)] disabled:opacity-30
                   disabled:cursor-not-allowed transition-colors"
        aria-label="Increase font size"
      >
        <span className="font-cormorant text-lg font-semibold">A</span>
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
