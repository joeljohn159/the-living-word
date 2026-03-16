/**
 * Chapter loading skeleton — mimics the verse layout with
 * gold-themed placeholder bars.
 */
export default function ChapterLoading() {
  return (
    <div
      className="max-w-3xl mx-auto px-4 py-12"
      role="status"
      aria-label="Loading chapter"
    >
      {/* Chapter header skeleton */}
      <div className="text-center mb-10 space-y-3">
        <div className="h-4 w-32 mx-auto rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-8 w-56 mx-auto rounded bg-[var(--bg-tertiary)] animate-pulse" />
      </div>

      {/* Verse skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-4 w-5 shrink-0 rounded bg-[var(--accent-gold)]/20 mt-1" />
            <div className="flex-1 space-y-2">
              <div
                className="h-4 rounded bg-[var(--bg-tertiary)]"
                style={{ width: `${70 + Math.random() * 30}%` }}
              />
              {i % 3 === 0 && (
                <div
                  className="h-4 rounded bg-[var(--bg-tertiary)]"
                  style={{ width: `${40 + Math.random() * 40}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
