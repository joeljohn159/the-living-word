"use client";

import { cn } from "@/lib/utils";
import type { TimelineEra } from "@/data/timeline-events";

interface EraLegendProps {
  eras: TimelineEra[];
  activeEra: string | null;
  onEraClick: (eraId: string | null) => void;
}

/**
 * Compact legend showing all biblical eras as clickable chips.
 * Clicking an era scrolls/filters to it; clicking again clears.
 */
export function EraLegend({ eras, activeEra, onEraClick }: EraLegendProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by biblical era"
    >
      {eras.map((era) => (
        <button
          key={era.id}
          onClick={() => onEraClick(activeEra === era.id ? null : era.id)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-source-sans font-medium transition-all",
            "border border-transparent",
            activeEra === era.id
              ? "ring-2 ring-gold border-gold text-gold bg-[var(--bg-tertiary)]"
              : "text-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          )}
          aria-pressed={activeEra === era.id}
          aria-label={`Filter to ${era.label} era`}
        >
          <span
            className={cn("w-2.5 h-2.5 rounded-full shrink-0", era.color)}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">{era.label}</span>
          <span className="sm:hidden">{era.label.split(" ")[0]}</span>
        </button>
      ))}
    </div>
  );
}
