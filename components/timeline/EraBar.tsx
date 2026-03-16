"use client";

import { cn } from "@/lib/utils";
import type { TimelineEra } from "@/data/timeline-events";

interface EraBarProps {
  eras: TimelineEra[];
  totalRange: { start: number; end: number };
}

/**
 * Horizontal era segments shown above/below the main timeline axis.
 * Each era is proportionally sized based on its date range.
 */
export function EraBar({ eras, totalRange }: EraBarProps) {
  const totalSpan = totalRange.end - totalRange.start;

  return (
    <div className="flex w-full h-2 rounded-full overflow-hidden" role="img" aria-label="Biblical era timeline">
      {eras.map((era) => {
        const widthPercent =
          ((era.endYear - era.startYear) / totalSpan) * 100;
        return (
          <div
            key={era.id}
            className={cn("h-full opacity-60 hover:opacity-100 transition-opacity", era.color)}
            style={{ width: `${widthPercent}%` }}
            title={era.label}
            aria-label={era.label}
          />
        );
      })}
    </div>
  );
}
