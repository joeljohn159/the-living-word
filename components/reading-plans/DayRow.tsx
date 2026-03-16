"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReadingPlanStore } from "@/stores/reading-plans";
import type { DayReading } from "@/lib/reading-plans-data";

interface DayRowProps {
  planSlug: string;
  day: DayReading;
}

/**
 * Single day row in a reading plan's schedule view.
 * Shows day number, scripture links, and a completion toggle.
 */
export function DayRow({ planSlug, day }: DayRowProps) {
  const toggleDay = useReadingPlanStore((s) => s.toggleDay);
  const isComplete = useReadingPlanStore((s) => s.isDayComplete(planSlug, day.day));

  return (
    <div
      className={cn(
        "flex items-center gap-3 sm:gap-4 rounded-lg border px-4 py-3",
        "transition-colors duration-150",
        isComplete
          ? "border-gold/30 bg-gold/5"
          : "border-border bg-card hover:border-border/80"
      )}
    >
      {/* Completion toggle */}
      <button
        onClick={() => toggleDay(planSlug, day.day)}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150",
          isComplete
            ? "border-gold bg-gold text-[var(--bg-primary)]"
            : "border-muted-foreground/40 hover:border-gold/60"
        )}
        aria-label={
          isComplete
            ? `Mark day ${day.day} as incomplete`
            : `Mark day ${day.day} as complete`
        }
        aria-pressed={isComplete}
      >
        {isComplete && <Check className="h-4 w-4" aria-hidden="true" />}
      </button>

      {/* Day label */}
      <span
        className={cn(
          "font-source-sans text-sm font-medium shrink-0 w-14 sm:w-16",
          isComplete ? "text-gold" : "text-muted-foreground"
        )}
      >
        {day.label}
      </span>

      {/* Scripture links */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
        {day.readings.map((reading, idx) => (
          <Link
            key={`${reading.href}-${idx}`}
            href={reading.href}
            className={cn(
              "font-source-sans text-sm",
              "underline decoration-gold/30 underline-offset-2",
              "hover:text-gold hover:decoration-gold transition-colors",
              isComplete ? "text-foreground/70" : "text-foreground"
            )}
          >
            {reading.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
