import Link from "next/link";

/**
 * Custom 404 page with museum-themed design.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Decorative gold line */}
      <div
        className="w-16 h-px bg-[var(--accent-gold)] mb-8"
        aria-hidden="true"
      />

      <p className="font-source-sans text-xs uppercase tracking-[0.3em] text-[var(--accent-gold)] mb-4">
        Page Not Found
      </p>

      <h1 className="heading text-5xl sm:text-6xl md:text-7xl text-gold mb-6">
        404
      </h1>

      <p className="font-cormorant text-xl sm:text-2xl italic text-[var(--text-secondary)] mb-2 max-w-md">
        &ldquo;Seek, and ye shall find&rdquo;
      </p>
      <p className="font-source-sans text-xs text-[var(--text-muted)] mb-10">
        Matthew 7:7 &mdash; KJV
      </p>

      <p className="font-source-sans text-[var(--text-secondary)] mb-8 max-w-sm">
        The page you are looking for has been moved or does not exist.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-gold text-[var(--primary-foreground)] px-6 py-3 rounded-lg font-source-sans font-semibold text-sm hover:bg-gold-light transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] touch-target"
        >
          Return Home
        </Link>
        <Link
          href="/bible"
          className="inline-flex items-center justify-center gap-2 border border-[var(--border)] text-[var(--text-primary)] px-6 py-3 rounded-lg font-source-sans font-semibold text-sm hover:border-[var(--accent-gold)] hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] touch-target"
        >
          Browse the Bible
        </Link>
      </div>

      {/* Decorative gold line */}
      <div
        className="w-16 h-px bg-[var(--accent-gold)] mt-12"
        aria-hidden="true"
      />
    </div>
  );
}
