/**
 * Evidence page loading skeleton — card grid placeholder.
 */
export default function EvidenceLoading() {
  return (
    <div
      className="max-w-6xl mx-auto px-4 py-12"
      role="status"
      aria-label="Loading evidence"
    >
      {/* Header skeleton */}
      <div className="text-center mb-10 space-y-3">
        <div className="h-4 w-40 mx-auto rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-8 w-64 mx-auto rounded bg-[var(--bg-tertiary)] animate-pulse" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-[var(--bg-tertiary)]" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 rounded bg-[var(--bg-tertiary)]" />
              <div className="h-3 w-1/3 rounded bg-[var(--bg-tertiary)]" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-[var(--bg-tertiary)]" />
                <div className="h-3 w-2/3 rounded bg-[var(--bg-tertiary)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
