import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ChapterNavLink {
  bookSlug: string;
  bookName: string;
  chapter: number;
}

interface ChapterNavigationProps {
  prev: ChapterNavLink | null;
  next: ChapterNavLink | null;
}

/** Previous / Next chapter navigation arrows with touch-friendly targets. */
export function ChapterNavigation({ prev, next }: ChapterNavigationProps) {
  return (
    <nav
      className="flex items-center justify-between py-6 sm:py-8 border-t border-[var(--border)] gap-2"
      aria-label="Chapter navigation"
    >
      {prev ? (
        <Link
          href={`/bible/${prev.bookSlug}/${prev.chapter}`}
          className="group flex items-center gap-1.5 sm:gap-2 text-[var(--text-secondary)]
                     hover:text-[var(--accent-gold)] transition-colors
                     touch-target py-2 px-1 -ml-1 rounded-lg"
          aria-label={`Previous: ${prev.bookName} ${prev.chapter}`}
        >
          <ChevronLeft className="w-5 h-5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          <div className="text-left min-w-0">
            <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Previous
            </span>
            <span className="font-cormorant text-base sm:text-lg truncate block">
              {prev.bookName} {prev.chapter}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/bible/${next.bookSlug}/${next.chapter}`}
          className="group flex items-center gap-1.5 sm:gap-2 text-[var(--text-secondary)]
                     hover:text-[var(--accent-gold)] transition-colors
                     touch-target py-2 px-1 -mr-1 rounded-lg"
          aria-label={`Next: ${next.bookName} ${next.chapter}`}
        >
          <div className="text-right min-w-0">
            <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Next
            </span>
            <span className="font-cormorant text-base sm:text-lg truncate block">
              {next.bookName} {next.chapter}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
