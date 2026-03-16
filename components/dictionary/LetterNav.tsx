"use client";

import { cn } from "@/lib/utils";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface LetterNavProps {
  /** Letters that have dictionary entries. */
  activeLetters: string[];
  /** Currently selected letter (null = show all). */
  selectedLetter: string | null;
  /** Callback when a letter is clicked. */
  onSelect: (letter: string | null) => void;
}

/**
 * Horizontal A–Z navigation bar for the dictionary browser.
 * Letters without entries are displayed but disabled.
 */
export function LetterNav({
  activeLetters,
  selectedLetter,
  onSelect,
}: LetterNavProps) {
  return (
    <nav
      className="flex flex-wrap gap-1 justify-center"
      aria-label="Filter by letter"
    >
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "px-2.5 py-1.5 rounded-md text-sm font-source-sans font-medium",
          "transition-colors duration-150",
          selectedLetter === null
            ? "bg-gold text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        aria-pressed={selectedLetter === null}
      >
        All
      </button>
      {ALPHABET.map((letter) => {
        const hasEntries = activeLetters.includes(letter);
        const isSelected = selectedLetter === letter;
        return (
          <button
            key={letter}
            onClick={() => hasEntries && onSelect(letter)}
            disabled={!hasEntries}
            className={cn(
              "w-9 h-9 rounded-md text-sm font-source-sans font-medium",
              "transition-colors duration-150",
              isSelected
                ? "bg-gold text-primary-foreground"
                : hasEntries
                  ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                  : "text-muted-foreground/30 cursor-not-allowed"
            )}
            aria-label={`Filter by letter ${letter}`}
            aria-pressed={isSelected}
          >
            {letter}
          </button>
        );
      })}
    </nav>
  );
}
