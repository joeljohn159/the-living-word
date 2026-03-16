"use client";

import { FontSizeControls } from "@/components/scripture/FontSizeControls";
import { ReadingModeToggle } from "@/components/scripture/ReadingModeToggle";

/** Client toolbar with reading mode toggle and font size controls. */
export function ChapterToolbar() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div
        className="flex items-center justify-between py-3 px-4
                    rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]"
      >
        <ReadingModeToggle />
        <FontSizeControls />
      </div>
    </div>
  );
}
