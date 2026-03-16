"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { useCrossRefStore } from "@/stores/cross-references";
import { usePreferencesStore } from "@/stores/preferences";
import { RelationshipBadge } from "./RelationshipBadge";

interface CrossRefPopoverProps {
  /** The verse number this popover is attached to. */
  verseNumber: number;
  /** The trigger element (verse number sup). */
  children: React.ReactNode;
}

const MAX_PREVIEW_REFS = 3;

/**
 * Inline popover shown when a verse number is clicked.
 * Shows a quick preview of cross-references for that verse,
 * with a link to open the full cross-refs tab in the context panel.
 */
export function CrossRefPopover({ verseNumber, children }: CrossRefPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const crossRefs = useCrossRefStore((s) => s.crossRefs);
  const selectVerse = useCrossRefStore((s) => s.selectVerse);
  const setTab = usePreferencesStore((s) => s.setActiveSidebarTab);
  const openSidebar = usePreferencesStore((s) => s.sidebarOpen);
  const toggleSidebar = usePreferencesStore((s) => s.toggleSidebar);

  const verseRefs = crossRefs.filter((r) => r.sourceVerseNumber === verseNumber);
  const hasRefs = verseRefs.length > 0;

  const handleClick = useCallback(() => {
    if (!hasRefs) return;
    setIsOpen((prev) => !prev);
  }, [hasRefs]);

  const handleViewAll = useCallback(() => {
    selectVerse(verseNumber);
    setTab("cross-references");
    if (!openSidebar) toggleSidebar();
    setIsOpen(false);
  }, [verseNumber, selectVerse, setTab, openSidebar, toggleSidebar]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  return (
    <span className="relative inline">
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label={
          hasRefs
            ? `Verse ${verseNumber}, ${verseRefs.length} cross-references`
            : `Verse ${verseNumber}`
        }
        aria-expanded={isOpen}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "cursor-pointer transition-colors duration-200",
          hasRefs && "hover:text-[var(--accent-gold)]",
          hasRefs && "border-b border-dotted border-transparent hover:border-[var(--accent-gold)]/50",
          isOpen && "text-[var(--accent-gold)]",
        )}
      >
        {children}
        {hasRefs && (
          <Link2 className="inline w-2.5 h-2.5 ml-0.5 opacity-40" />
        )}
      </span>

      {isOpen && hasRefs && (
        <PopoverCard
          ref={popoverRef}
          verseRefs={verseRefs}
          onViewAll={handleViewAll}
        />
      )}
    </span>
  );
}

interface PopoverCardProps {
  verseRefs: ReturnType<typeof useCrossRefStore.getState>["crossRefs"];
  onViewAll: () => void;
}

import { forwardRef } from "react";

const PopoverCard = forwardRef<HTMLDivElement, PopoverCardProps>(
  function PopoverCard({ verseRefs, onViewAll }, ref) {
    const preview = verseRefs.slice(0, MAX_PREVIEW_REFS);
    const remaining = verseRefs.length - MAX_PREVIEW_REFS;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-label="Cross-references preview"
        className={cn(
          "absolute top-full left-0 mt-1.5 z-50",
          "w-72 rounded-lg",
          "bg-[var(--bg-card)] border border-[var(--border)]",
          "shadow-lg shadow-black/20",
          "animate-fade-in",
        )}
      >
        {/* Header */}
        <div className="px-3 pt-3 pb-2 border-b border-[var(--border)]">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            Cross-References ({verseRefs.length})
          </p>
        </div>

        {/* Refs list */}
        <div className="px-3 py-2 space-y-2 max-h-60 overflow-y-auto">
          {preview.map((ref) => (
            <Link
              key={ref.id}
              href={`/bible/${ref.targetBookSlug}/${ref.targetChapter}/${ref.targetVerse}`}
              className={cn(
                "group flex items-start gap-2 p-2 -mx-1 rounded",
                "hover:bg-[var(--bg-tertiary)] transition-colors",
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-cormorant text-xs font-semibold text-[var(--accent-gold)]">
                    {ref.targetBook} {ref.targetChapter}:{ref.targetVerse}
                  </span>
                  <RelationshipBadge relationship={ref.relationship} />
                </div>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {truncate(ref.targetText, 80)}
                </p>
              </div>
              <ArrowRight
                className={cn(
                  "w-3 h-3 shrink-0 mt-1",
                  "text-[var(--text-muted)] group-hover:text-[var(--accent-gold)]",
                  "transition-colors",
                )}
              />
            </Link>
          ))}
        </div>

        {/* Footer */}
        {(remaining > 0 || verseRefs.length > 0) && (
          <div className="px-3 py-2 border-t border-[var(--border)]">
            <button
              onClick={onViewAll}
              className={cn(
                "w-full text-center text-xs py-1.5 rounded",
                "text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10",
                "transition-colors",
              )}
            >
              {remaining > 0
                ? `View all ${verseRefs.length} in panel →`
                : "View in panel →"}
            </button>
          </div>
        )}
      </div>
    );
  },
);
