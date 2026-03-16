/**
 * People page loading skeleton — card grid placeholder.
 */
export default function PeopleLoading() {
  return (
    <div
      className="max-w-6xl mx-auto px-4 py-12"
      role="status"
      aria-label="Loading people"
    >
      {/* Header skeleton */}
      <div className="text-center mb-10 space-y-3">
        <div className="h-4 w-36 mx-auto rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-8 w-56 mx-auto rounded bg-[var(--bg-tertiary)] animate-pulse" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 animate-pulse space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] mx-auto" />
            <div className="h-5 w-2/3 mx-auto rounded bg-[var(--bg-tertiary)]" />
            <div className="h-3 w-1/2 mx-auto rounded bg-[var(--bg-tertiary)]" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-[var(--bg-tertiary)]" />
              <div className="h-3 w-4/5 rounded bg-[var(--bg-tertiary)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
