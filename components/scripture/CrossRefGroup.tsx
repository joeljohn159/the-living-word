"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CrossRefCard } from "./CrossRefCard";
import { RelationshipBadge } from "./RelationshipBadge";
import type { ChapterCrossRef } from "@/stores/cross-references";

interface CrossRefGroupProps {
  relationship: string;
  references: ChapterCrossRef[];
}

/** Collapsible group of cross-references by relationship type. */
export function CrossRefGroup({ relationship, references }: CrossRefGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 py-2 px-1",
          "text-left transition-colors",
          "hover:text-[var(--text-primary)]",
        )}
        aria-expanded={isOpen}
        aria-label={`${relationship} references, ${references.length} items`}
      >
        <div className="flex items-center gap-2">
          <RelationshipBadge relationship={relationship} />
          <span className="text-xs text-[var(--text-muted)]">
            ({references.length})
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="space-y-2 mt-1 animate-fade-in">
          {references.map((ref) => (
            <CrossRefCard key={ref.id} crossRef={ref} />
          ))}
        </div>
      )}
    </div>
  );
}
