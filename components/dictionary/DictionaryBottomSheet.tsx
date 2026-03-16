"use client";

import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DictionaryEntry } from "@/lib/dictionary";

interface DictionaryBottomSheetProps {
  /** The dictionary entry to display. */
  entry: DictionaryEntry;
  /** Callback to close the sheet. */
  onClose: () => void;
}

/** Mobile bottom sheet overlay with dictionary definition. */
export function DictionaryBottomSheet({
  entry,
  onClose,
}: DictionaryBottomSheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Definition of ${entry.word}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />

      {/* Sheet content */}
      <div
        className={cn(
          "relative w-full max-w-lg mx-auto",
          "bg-[var(--bg-card)] border-t border-[var(--border)]",
          "rounded-t-2xl p-5 pb-8",
          "animate-slide-up"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/30 mx-auto mb-4" />

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <h3 className="font-cormorant text-xl font-semibold text-[var(--accent-gold)]">
              {entry.word}
            </h3>
            {entry.partOfSpeech && (
              <span className="text-xs font-source-sans italic text-[var(--text-muted)]">
                {entry.partOfSpeech}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Close definition"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <p className="text-sm font-source-sans text-[var(--text-secondary)] leading-relaxed mb-3">
          {entry.definition}
        </p>

        {entry.modernEquivalent && (
          <p className="text-sm font-source-sans text-[var(--text-muted)] mb-4">
            Modern equivalent:{" "}
            <span className="text-[var(--accent-gold)]">{entry.modernEquivalent}</span>
          </p>
        )}

        <Link
          href={`/dictionary/${entry.slug}`}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-source-sans",
            "text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)]",
            "transition-colors"
          )}
        >
          View full entry
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
