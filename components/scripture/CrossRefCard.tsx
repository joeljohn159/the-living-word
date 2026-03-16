"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { truncate, cn } from "@/lib/utils";
import { RelationshipBadge } from "./RelationshipBadge";
import type { ChapterCrossRef } from "@/stores/cross-references";

interface CrossRefCardProps {
  crossRef: ChapterCrossRef;
}

/** Displays a single cross-reference as a clickable card linking to the target verse. */
export function CrossRefCard({ crossRef }: CrossRefCardProps) {
  return (
    <Link
      href={`/bible/${crossRef.targetBookSlug}/${crossRef.targetChapter}/${crossRef.targetVerse}`}
      className={cn(
        "group block p-3 rounded-lg border border-[var(--border)]",
        "hover:border-[var(--accent-gold)] hover:bg-[var(--surface)]",
        "transition-colors duration-200",
      )}
      aria-label={`${crossRef.targetBook} ${crossRef.targetChapter}:${crossRef.targetVerse}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-cormorant text-sm font-semibold text-[var(--accent-gold)]">
              {crossRef.targetBook} {crossRef.targetChapter}:{crossRef.targetVerse}
            </span>
            <RelationshipBadge relationship={crossRef.relationship} />
          </div>
          <p className="mt-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
            {truncate(crossRef.targetText, 120)}
          </p>
          {crossRef.note && (
            <p className="mt-1 text-xs text-[var(--text-muted)] italic leading-relaxed">
              {crossRef.note}
            </p>
          )}
        </div>
        <ArrowRight
          className={cn(
            "w-3.5 h-3.5 shrink-0 mt-0.5",
            "text-[var(--text-muted)] group-hover:text-[var(--accent-gold)]",
            "group-hover:translate-x-0.5 transition-all",
          )}
        />
      </div>
    </Link>
  );
}
