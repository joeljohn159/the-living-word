/**
 * Global loading skeleton with gold-themed spinner.
 */
export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
      role="status"
      aria-label="Loading content"
    >
      {/* Gold spinner */}
      <div className="relative w-12 h-12 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent-gold)] animate-spin" />
      </div>

      <p className="font-source-sans text-sm text-[var(--text-muted)] animate-pulse">
        Loading&hellip;
      </p>
    </div>
  );
}
