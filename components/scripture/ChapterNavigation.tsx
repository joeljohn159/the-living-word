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

/** Previous / Next chapter navigation arrows. */
export function ChapterNavigation({ prev, next }: ChapterNavigationProps) {
  return (
    <nav
      className="flex items-center justify-between py-8 border-t border-[var(--border)]"
      aria-label="Chapter navigation"
    >
      {prev ? (
        <Link
          href={`/bible/${prev.bookSlug}/${prev.chapter}`}
          className="group flex items-center gap-2 text-[var(--text-secondary)]
                     hover:text-[var(--accent-gold)] transition-colors"
          aria-label={`Previous: ${prev.bookName} ${prev.chapter}`}
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <div className="text-left">
            <span className="block text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Previous
            </span>
            <span className="font-cormorant text-lg">
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
          className="group flex items-center gap-2 text-[var(--text-secondary)]
                     hover:text-[var(--accent-gold)] transition-colors"
          aria-label={`Next: ${next.bookName} ${next.chapter}`}
        >
          <div className="text-right">
            <span className="block text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Next
            </span>
            <span className="font-cormorant text-lg">
              {next.bookName} {next.chapter}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
