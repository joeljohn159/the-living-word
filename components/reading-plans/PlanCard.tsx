"use client";

import Link from "next/link";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReadingPlanStore } from "@/stores/reading-plans";

interface PlanCardProps {
  slug: string;
  name: string;
  description: string;
  durationDays: number;
}

/**
 * Card component for a reading plan on the listing page.
 * Shows name, description, duration, and progress bar.
 */
export function PlanCard({ slug, name, description, durationDays }: PlanCardProps) {
  const completedCount = useReadingPlanStore((s) => s.getCompletedCount(slug));
  const progress = durationDays > 0 ? Math.round((completedCount / durationDays) * 100) : 0;
  const hasStarted = completedCount > 0;

  return (
    <Link
      href={`/reading-plans/${slug}`}
      className={cn(
        "group block rounded-lg border border-border",
        "bg-card p-5 sm:p-6",
        "transition-all duration-200",
        "hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5"
      )}
      aria-label={`${name} — ${durationDays} days`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <BookOpen
            className="h-5 w-5 text-gold shrink-0"
            aria-hidden="true"
          />
          <h2 className="font-cormorant text-xl sm:text-2xl font-semibold text-foreground group-hover:text-gold transition-colors">
            {name}
          </h2>
        </div>
        <ChevronRight
          className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors shrink-0 mt-1"
          aria-hidden="true"
        />
      </div>

      {/* Description */}
      <p className="font-source-sans text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      {/* Duration badge */}
      <div className="flex items-center gap-1.5 mb-4">
        <Calendar className="h-4 w-4 text-gold/70" aria-hidden="true" />
        <span className="font-source-sans text-xs sm:text-sm text-muted-foreground">
          {durationDays} {durationDays === 1 ? "day" : "days"}
        </span>
      </div>

      {/* Progress bar */}
      {hasStarted && (
        <div aria-label={`${progress}% complete`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-source-sans text-xs text-muted-foreground">
              {completedCount} of {durationDays} days
            </span>
            <span className="font-source-sans text-xs font-medium text-gold">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!hasStarted && (
        <span className="inline-flex items-center font-source-sans text-xs text-gold/70 group-hover:text-gold transition-colors">
          Start reading &rarr;
        </span>
      )}
    </Link>
  );
}
