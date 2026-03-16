"use client";

import Link from "next/link";
import { X, ArrowRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DictionaryEntry } from "@/lib/dictionary";

interface DictionaryPanelEntry extends DictionaryEntry {
  pronunciation?: string | null;
  usageNotes?: string | null;
  exampleVerse?: {
    text: string;
    bookName: string;
    chapterNumber: number;
    verseNumber: number;
    bookSlug: string;
  } | null;
}

interface DictionaryPanelProps {
  /** The selected dictionary entry to display. */
  entry: DictionaryPanelEntry | null;
  /** Callback to close the panel. */
  onClose: () => void;
}

/**
 * Side panel that shows full dictionary info for a selected word.
 * Appears when a highlighted word is clicked in Dictionary Mode.
 */
export function DictionaryPanel({ entry, onClose }: DictionaryPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {entry && (
        <motion.aside
          key={entry.slug}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "fixed right-0 top-16 bottom-0 z-40 w-80 sm:w-96",
            "bg-[var(--bg-card)] border-l border-[var(--border)]",
            "shadow-xl shadow-black/20 overflow-y-auto"
          )}
          role="complementary"
          aria-label={`Dictionary entry: ${entry.word}`}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border)] p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[var(--accent-gold)]">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-semibold">
                  Dictionary
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
                aria-label="Close dictionary panel"
              >
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Word + pronunciation */}
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-[var(--accent-gold)]">
                {entry.word}
              </h2>
              {entry.pronunciation && (
                <p className="text-sm font-source-sans text-[var(--text-muted)] mt-0.5 italic">
                  {entry.pronunciation}
                </p>
              )}
            </div>

            {/* Part of speech */}
            {entry.partOfSpeech && (
              <div>
                <Label>Part of Speech</Label>
                <p className="text-sm text-[var(--text-secondary)] italic">
                  {entry.partOfSpeech}
                </p>
              </div>
            )}

            {/* Definition */}
            <div>
              <Label>Definition</Label>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {entry.definition}
              </p>
            </div>

            {/* Modern equivalent */}
            {entry.modernEquivalent && (
              <div>
                <Label>Modern Equivalent</Label>
                <p className="text-sm text-[var(--accent-gold)]">
                  {entry.modernEquivalent}
                </p>
              </div>
            )}

            {/* Usage notes */}
            {entry.usageNotes && (
              <div>
                <Label>Usage Notes</Label>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {entry.usageNotes}
                </p>
              </div>
            )}

            {/* Example verse */}
            {entry.exampleVerse && (
              <div>
                <Label>Example Verse</Label>
                <blockquote className="scripture text-sm leading-relaxed text-[var(--scripture-text)] border-l-2 border-[var(--accent-gold)]/30 pl-3 mt-1">
                  &ldquo;{entry.exampleVerse.text}&rdquo;
                </blockquote>
                <p className="text-xs text-[var(--text-muted)] mt-1.5">
                  &mdash; {entry.exampleVerse.bookName} {entry.exampleVerse.chapterNumber}:{entry.exampleVerse.verseNumber}
                </p>
              </div>
            )}

            {/* Link to full dictionary page */}
            <Link
              href={`/dictionary/${entry.slug}`}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-source-sans",
                "text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)]",
                "transition-colors pt-2"
              )}
            >
              See in Dictionary
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/** Small label component for panel sections. */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">
      {children}
    </p>
  );
}
