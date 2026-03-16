import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Progress state for all reading plans, keyed by plan slug. */
interface ReadingPlanProgress {
  /** Map of plan slug → set of completed day numbers */
  completed: Record<string, number[]>;

  /** Mark a day as complete for a given plan. */
  markDayComplete: (planSlug: string, day: number) => void;

  /** Mark a day as incomplete for a given plan. */
  markDayIncomplete: (planSlug: string, day: number) => void;

  /** Toggle a day's completion status. */
  toggleDay: (planSlug: string, day: number) => void;

  /** Check if a specific day is completed. */
  isDayComplete: (planSlug: string, day: number) => boolean;

  /** Get count of completed days for a plan. */
  getCompletedCount: (planSlug: string) => number;

  /** Reset all progress for a plan. */
  resetPlan: (planSlug: string) => void;
}

export const useReadingPlanStore = create<ReadingPlanProgress>()(
  persist(
    (set, get) => ({
      completed: {},

      markDayComplete: (planSlug, day) =>
        set((state) => {
          const current = state.completed[planSlug] ?? [];
          if (current.includes(day)) return state;
          return {
            completed: {
              ...state.completed,
              [planSlug]: [...current, day],
            },
          };
        }),

      markDayIncomplete: (planSlug, day) =>
        set((state) => {
          const current = state.completed[planSlug] ?? [];
          return {
            completed: {
              ...state.completed,
              [planSlug]: current.filter((d) => d !== day),
            },
          };
        }),

      toggleDay: (planSlug, day) => {
        const current = get().completed[planSlug] ?? [];
        if (current.includes(day)) {
          get().markDayIncomplete(planSlug, day);
        } else {
          get().markDayComplete(planSlug, day);
        }
      },

      isDayComplete: (planSlug, day) => {
        const current = get().completed[planSlug] ?? [];
        return current.includes(day);
      },

      getCompletedCount: (planSlug) => {
        return (get().completed[planSlug] ?? []).length;
      },

      resetPlan: (planSlug) =>
        set((state) => ({
          completed: {
            ...state.completed,
            [planSlug]: [],
          },
        })),
    }),
    {
      name: "the-living-word-reading-plans",
    }
  )
);
