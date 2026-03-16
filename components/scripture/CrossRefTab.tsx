"use client";

import { useMemo } from "react";
import { Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCrossRefStore } from "@/stores/cross-references";
import { CrossRefGroup } from "./CrossRefGroup";

/** Ordering for relationship type groups. */
const RELATIONSHIP_ORDER = [
  "parallel",
  "prophecy-fulfillment",
  "quotation",
  "allusion",
  "contrast",
];

/** Cross-References tab content for the context panel. */
export function CrossRefTab() {
  const crossRefs = useCrossRefStore((s) => s.crossRefs);
  const selectedVerse = useCrossRefStore((s) => s.selectedVerseNumber);
  const bookName = useCrossRefStore((s) => s.bookName);
  const chapter = useCrossRefStore((s) => s.chapter);
  const clearSelection = useCrossRefStore((s) => s.clearSelection);

  // Filter by selected verse or show all
  const filteredRefs = useMemo(() => {
    if (selectedVerse === null) return crossRefs;
    return crossRefs.filter((ref) => ref.sourceVerseNumber === selectedVerse);
  }, [crossRefs, selectedVerse]);

  // Group by relationship type
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredRefs> = {};
    for (const ref of filteredRefs) {
      const key = ref.relationship || "parallel";
      if (!groups[key]) groups[key] = [];
      groups[key].push(ref);
    }
    return groups;
  }, [filteredRefs]);

  // Sort groups by defined order
  const sortedGroups = useMemo(() => {
    return RELATIONSHIP_ORDER
      .filter((rel) => grouped[rel]?.length)
      .map((rel) => ({ relationship: rel, references: grouped[rel] }));
  }, [grouped]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold">
            {selectedVerse !== null
              ? `${bookName} ${chapter}:${selectedVerse}`
              : "Chapter Cross-References"}
          </h3>
          {selectedVerse !== null && (
            <button
              onClick={clearSelection}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-xs",
                "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                "hover:bg-[var(--bg-tertiary)] transition-colors",
              )}
              aria-label="Show all chapter references"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        {filteredRefs.length > 0 && (
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {filteredRefs.length} cross-reference{filteredRefs.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {sortedGroups.length === 0 ? (
          <EmptyState selectedVerse={selectedVerse} />
        ) : (
          sortedGroups.map(({ relationship, references }) => (
            <CrossRefGroup
              key={relationship}
              relationship={relationship}
              references={references}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ selectedVerse }: { selectedVerse: number | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Link2 className="w-8 h-8 text-[var(--text-muted)] opacity-40 mb-3" />
      <p className="text-sm text-[var(--text-muted)] italic">
        {selectedVerse !== null
          ? "No cross-references found for this verse."
          : "No cross-references found for this chapter."}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-2 opacity-60">
        {selectedVerse !== null
          ? "Try clicking a different verse number."
          : "Click a verse number to search for related passages."}
      </p>
    </div>
  );
}
