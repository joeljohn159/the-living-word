import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChapterGridProps {
  bookSlug: string;
  chapterCount: number;
}

/**
 * Numbered grid of clickable chapter links for navigating a book.
 * Responsive: more columns on larger screens.
 */
export function ChapterGrid({ bookSlug, chapterCount }: ChapterGridProps) {
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  return (
    <section aria-label="Chapters" className="mb-12">
      <h2 className="heading text-2xl text-foreground mb-4">Chapters</h2>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {chapters.map((num) => (
          <Link
            key={num}
            href={`/bible/${bookSlug}/${num}`}
            className={cn(
              "flex items-center justify-center rounded-md",
              "aspect-square text-sm font-source-sans font-medium",
              "border border-border bg-card text-muted-foreground",
              "hover:border-gold/50 hover:bg-gold/10 hover:text-gold",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
              "transition-all duration-200",
            )}
            aria-label={`Chapter ${num}`}
          >
            {num}
          </Link>
        ))}
      </div>
    </section>
  );
}
