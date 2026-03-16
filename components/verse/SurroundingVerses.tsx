import Link from "next/link";

interface SurroundingVerse {
  id: number;
  verseNumber: number;
  text: string;
}

interface SurroundingVersesProps {
  verses: SurroundingVerse[];
  activeVerse: number;
  bookSlug: string;
  bookName: string;
  chapter: number;
}

/** Shows surrounding verses in muted style for context, with the active verse highlighted. */
export function SurroundingVerses({
  verses,
  activeVerse,
  bookSlug,
  bookName,
  chapter,
}: SurroundingVersesProps) {
  if (verses.length === 0) return null;

  return (
    <section aria-label="Surrounding verses for context" className="mt-10">
      <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 text-center">
        In Context &mdash; {bookName} {chapter}
      </h2>
      <div className="scripture space-y-2 max-w-2xl mx-auto text-base leading-[1.9]">
        {verses.map((v) => {
          const isActive = v.verseNumber === activeVerse;
          return (
            <p
              key={v.id}
              className={
                isActive
                  ? "text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-muted)] opacity-60"
              }
            >
              <sup className="verse-number mr-1">{v.verseNumber}</sup>
              {isActive ? (
                <span>{v.text}</span>
              ) : (
                <Link
                  href={`/bible/${bookSlug}/${chapter}/${v.verseNumber}`}
                  className="hover:text-[var(--text-secondary)] transition-colors"
                >
                  {v.text}
                </Link>
              )}
            </p>
          );
        })}
      </div>
    </section>
  );
}
