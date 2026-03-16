import { Users } from "lucide-react";

/**
 * Empty state shown when no people are found for the current chapter.
 */
export function PeopleTabEmpty() {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center px-4"
      role="status"
      aria-label="No people found"
    >
      <div className="rounded-full bg-[var(--bg-tertiary)] p-4 mb-4">
        <Users
          className="h-8 w-8 text-[var(--text-muted)]"
          aria-hidden="true"
        />
      </div>
      <h3 className="heading text-lg text-[var(--text-primary)] mb-1">
        No People Found
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-[220px]">
        No named individuals are referenced in this chapter.
      </p>
    </div>
  );
}
