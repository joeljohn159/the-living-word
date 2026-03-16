"use client";

import { usePreferencesStore } from "@/stores/preferences";
import { CrossRefPopover } from "./CrossRefPopover";

interface Verse {
  id: number;
  verseNumber: number;
  text: string;
}

interface ScriptureDisplayProps {
  verses: Verse[];
}

/** Renders scripture verses in paragraph or verse-per-line mode with user font size. */
export function ScriptureDisplay({ verses }: ScriptureDisplayProps) {
  const fontSize = usePreferencesStore((s) => s.fontSize);
  const readingMode = usePreferencesStore((s) => s.readingMode);

  if (verses.length === 0) {
    return (
      <p className="text-[var(--text-muted)] text-center py-12 italic">
        No verses found for this chapter.
      </p>
    );
  }

  if (readingMode === "verse-per-line") {
    return (
      <div
        className="scripture space-y-3"
        style={{ fontSize: `${fontSize}px` }}
      >
        {verses.map((verse) => (
          <p key={verse.id} id={`verse-${verse.verseNumber}`} className="leading-[1.9]">
            <CrossRefPopover verseNumber={verse.verseNumber}>
              <sup className="verse-number">{verse.verseNumber}</sup>
            </CrossRefPopover>
            {verse.text}
          </p>
        ))}
      </div>
    );
  }

  // Paragraph mode — render as flowing text
  return (
    <div
      className="scripture leading-[1.9]"
      style={{ fontSize: `${fontSize}px` }}
    >
      <p>
        {verses.map((verse) => (
          <span key={verse.id} id={`verse-${verse.verseNumber}`}>
            <CrossRefPopover verseNumber={verse.verseNumber}>
              <sup className="verse-number">{verse.verseNumber}</sup>
            </CrossRefPopover>
            {verse.text}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}
