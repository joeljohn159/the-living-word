"use client";

import { PlanCard } from "@/components/reading-plans/PlanCard";
import type { ReadingPlan } from "@/lib/reading-plans-data";

interface ReadingPlansListProps {
  plans: ReadingPlan[];
}

/**
 * Client wrapper that renders PlanCard components.
 * Separated so the parent page can remain a server component.
 */
export function ReadingPlansList({ plans }: ReadingPlansListProps) {
  return (
    <div className="grid gap-4 sm:gap-5" role="list" aria-label="Reading plans">
      {plans.map((plan) => (
        <div key={plan.slug} role="listitem">
          <PlanCard
            slug={plan.slug}
            name={plan.name}
            description={plan.description}
            durationDays={plan.durationDays}
          />
        </div>
      ))}
    </div>
  );
}
