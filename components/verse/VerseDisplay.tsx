"use client";

import { usePreferencesStore } from "@/stores/preferences";

interface VerseDisplayProps {
  bookName: string;
  chapter: number;
  verseNumber: number;
  text: string;
}

/** Large, beautiful typography display for a single featured verse. */
export function VerseDisplay({ bookName, chapter, verseNumber, text }: VerseDisplayProps) {
  const fontSize = usePreferencesStore((s) => s.fontSize);

  // Scale up the font size for the hero verse
  const heroSize = Math.max(fontSize + 6, 26);

  return (
    <blockquote
      className="scripture text-center leading-[2] tracking-wide py-8"
      style={{ fontSize: `${heroSize}px` }}
      aria-label={`${bookName} ${chapter}:${verseNumber}`}
    >
      <p className="text-[var(--text-primary)]">
        &ldquo;{text}&rdquo;
      </p>
      <footer className="mt-6">
        <cite className="not-italic font-source-sans text-base tracking-[0.15em] uppercase text-[var(--accent-gold)]">
          &mdash; {bookName} {chapter}:{verseNumber} <span className="text-[var(--text-muted)]">KJV</span>
        </cite>
      </footer>
    </blockquote>
  );
}
