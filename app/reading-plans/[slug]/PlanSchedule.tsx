"use client";

import { ProgressHeader } from "@/components/reading-plans/ProgressHeader";
import { DayRow } from "@/components/reading-plans/DayRow";
import type { DayReading } from "@/lib/reading-plans-data";

interface PlanScheduleProps {
  planSlug: string;
  planName: string;
  durationDays: number;
  schedule: DayReading[];
}

/**
 * Client wrapper for the day-by-day schedule view.
 * Renders ProgressHeader and all DayRow components.
 */
export function PlanSchedule({
  planSlug,
  planName,
  durationDays,
  schedule,
}: PlanScheduleProps) {
  return (
    <div className="space-y-5">
      <ProgressHeader
        planSlug={planSlug}
        planName={planName}
        durationDays={durationDays}
      />

      <div className="space-y-2" role="list" aria-label="Daily readings">
        {schedule.map((day) => (
          <div key={day.day} role="listitem">
            <DayRow planSlug={planSlug} day={day} />
          </div>
        ))}
      </div>
    </div>
  );
}
