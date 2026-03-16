"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReadingPlanStore } from "@/stores/reading-plans";

interface ProgressHeaderProps {
  planSlug: string;
  planName: string;
  durationDays: number;
}

/**
 * Shows overall progress for a reading plan with a reset button.
 */
export function ProgressHeader({ planSlug, planName, durationDays }: ProgressHeaderProps) {
  const completedCount = useReadingPlanStore((s) => s.getCompletedCount(planSlug));
  const resetPlan = useReadingPlanStore((s) => s.resetPlan);
  const progress = durationDays > 0 ? Math.round((completedCount / durationDays) * 100) : 0;

  function handleReset() {
    if (completedCount === 0) return;
    const confirmed = window.confirm(
      `Reset all progress for "${planName}"? This cannot be undone.`
    );
    if (confirmed) {
      resetPlan(planSlug);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-source-sans text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{completedCount}</span>
          {" "}of{" "}
          <span className="font-medium text-foreground">{durationDays}</span>
          {" "}days completed
        </div>

        {completedCount > 0 && (
          <button
            onClick={handleReset}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5",
              "font-source-sans text-xs text-muted-foreground",
              "hover:text-foreground hover:bg-accent transition-colors"
            )}
            aria-label={`Reset progress for ${planName}`}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-gold transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress}% complete`}
        />
      </div>

      {progress === 100 && (
        <p className="font-source-sans text-sm text-gold font-medium mt-3 text-center">
          Congratulations! You have completed this reading plan.
        </p>
      )}
    </div>
  );
}
