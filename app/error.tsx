"use client";

import { useEffect } from "react";

/**
 * Global error boundary with museum-themed design.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Decorative gold line */}
      <div
        className="w-16 h-px bg-[var(--accent-gold)] mb-8"
        aria-hidden="true"
      />

      <p className="font-source-sans text-xs uppercase tracking-[0.3em] text-[var(--accent-gold)] mb-4">
        Something Went Wrong
      </p>

      <h1 className="heading text-4xl sm:text-5xl text-gold mb-6">
        An Error Occurred
      </h1>

      <p className="font-cormorant text-xl sm:text-2xl italic text-[var(--text-secondary)] mb-2 max-w-md">
        &ldquo;Be still, and know that I am God&rdquo;
      </p>
      <p className="font-source-sans text-xs text-[var(--text-muted)] mb-10">
        Psalm 46:10 &mdash; KJV
      </p>

      <p className="font-source-sans text-[var(--text-secondary)] mb-8 max-w-sm">
        We encountered an unexpected error. Please try again.
      </p>

      <button
        onClick={reset}
        className="inline-flex items-center justify-center gap-2 bg-gold text-[var(--primary-foreground)] px-6 py-3 rounded-lg font-source-sans font-semibold text-sm hover:bg-gold-light transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] touch-target"
      >
        Try Again
      </button>

      {/* Decorative gold line */}
      <div
        className="w-16 h-px bg-[var(--accent-gold)] mt-12"
        aria-hidden="true"
      />
    </div>
  );
}
