"use client";

import { FontSizeControls } from "@/components/scripture/FontSizeControls";
import { ReadingModeToggle } from "@/components/scripture/ReadingModeToggle";
import { DictionaryModeToggle } from "@/components/dictionary/DictionaryModeToggle";

/** Client toolbar with reading mode toggle, font size controls, and dictionary toggle. */
export function ChapterToolbar() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div
        className="flex items-center justify-between py-3 px-4
                    rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]"
      >
        <ReadingModeToggle />
        <div className="flex items-center gap-2">
          <DictionaryModeToggle />
          <FontSizeControls />
        </div>
      </div>
    </div>
  );
}
