"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { DictionaryEntry } from "@/lib/dictionary";
import { DictionaryBottomSheet } from "./DictionaryBottomSheet";

interface DictionaryTooltipProps {
  /** The dictionary entry to display. */
  entry: DictionaryEntry;
  /** The trigger element (hotword span). */
  children: React.ReactNode;
}

/**
 * Dictionary tooltip for hotwords.
 *
 * Desktop: hover reveals a positioned tooltip with definition + modern equivalent.
 * Mobile: tap opens a bottom sheet overlay.
 */
export function DictionaryTooltip({ entry, children }: DictionaryTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleClick = useCallback(() => {
    if (isMobile) setShowSheet(true);
  }, [isMobile]);

  const closeSheet = useCallback(() => {
    setShowSheet(false);
  }, []);

  useEffect(() => {
    if (!showSheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showSheet, closeSheet]);

  return (
    <>
      <span
        className="relative inline"
        onMouseEnter={() => !isMobile && setShowTooltip(true)}
        onMouseLeave={() => !isMobile && setShowTooltip(false)}
        onFocus={() => !isMobile && setShowTooltip(true)}
        onBlur={() => !isMobile && setShowTooltip(false)}
      >
        <span
          role="button"
          tabIndex={0}
          aria-label={`Dictionary word: ${entry.word}`}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          className={cn(
            "cursor-help",
            "border-b border-dotted border-[var(--accent-gold)]/50",
            "hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]",
            "transition-colors duration-200"
          )}
          data-dictionary-word={entry.slug}
        >
          {children}
        </span>

        {showTooltip && !isMobile && <TooltipCard entry={entry} />}
      </span>

      {showSheet && isMobile && (
        <DictionaryBottomSheet entry={entry} onClose={closeSheet} />
      )}
    </>
  );
}

/** Desktop tooltip card positioned above the hotword. */
function TooltipCard({ entry }: { entry: DictionaryEntry }) {
  return (
    <span
      role="tooltip"
      className={cn(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
        "w-64 p-3 rounded-lg",
        "bg-[var(--bg-card)] border border-[var(--border)]",
        "shadow-lg shadow-black/20",
        "animate-fade-in",
        "pointer-events-none"
      )}
    >
      <span className="flex items-baseline gap-2 mb-1">
        <span className="font-cormorant text-base font-semibold text-[var(--accent-gold)]">
          {entry.word}
        </span>
        {entry.partOfSpeech && (
          <span className="text-xs font-source-sans italic text-[var(--text-muted)]">
            {entry.partOfSpeech}
          </span>
        )}
      </span>
      <span className="block text-xs font-source-sans text-[var(--text-secondary)] leading-relaxed mb-1.5">
        {entry.definition}
      </span>
      {entry.modernEquivalent && (
        <span className="block text-xs font-source-sans text-[var(--text-muted)]">
          Modern: <span className="text-[var(--accent-gold)]/80">{entry.modernEquivalent}</span>
        </span>
      )}
      <span
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2",
          "border-[6px] border-transparent border-t-[var(--bg-card)]"
        )}
      />
    </span>
  );
}
