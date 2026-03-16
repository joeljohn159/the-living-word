import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { truncate } from "@/lib/utils";

interface VerseRef {
  id: number;
  book: { name: string; slug: string } | null;
  chapter: { chapterNumber: number } | null;
  verse: { verseNumber: number; text: string; chapterNumber: number } | null;
}

interface VerseReferencesProps {
  references: VerseRef[];
  personName: string;
}

export function VerseReferences({ references, personName }: VerseReferencesProps) {
  if (references.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] italic">
        No verse references recorded for {personName}.
      </p>
    );
  }

  // Deduplicate by verse ID
  const seen = new Set<number>();
  const unique = references.filter((ref) => {
    if (!ref.verse) return false;
    if (seen.has(ref.verse.verseNumber + (ref.chapter?.chapterNumber ?? 0) * 1000)) return false;
    seen.add(ref.verse.verseNumber + (ref.chapter?.chapterNumber ?? 0) * 1000);
    return true;
  });

  return (
    <div className="space-y-2">
      {unique.slice(0, 20).map((ref) => {
        const bookName = ref.book?.name ?? "Unknown";
        const bookSlug = ref.book?.slug ?? "";
        const chapter = ref.verse?.chapterNumber ?? ref.chapter?.chapterNumber ?? 1;
        const verse = ref.verse?.verseNumber ?? 0;
        const text = ref.verse?.text ?? "";
        const label = `${bookName} ${chapter}:${verse}`;

        return (
          <div
            key={ref.id}
            className={cn(
              "rounded-lg border border-[var(--border)] p-3",
              "bg-[var(--bg-secondary)]"
            )}
          >
            <div className="flex items-start gap-2">
              <BookOpen
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-gold)]"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/bible/${bookSlug}/${chapter}`}
                  className="text-sm font-semibold text-[var(--accent-gold)] hover:underline"
                >
                  {label}
                </Link>
                {text && (
                  <p className="scripture mt-1 text-sm italic text-[var(--scripture-text)] leading-relaxed">
                    &ldquo;{truncate(text, 200)}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {unique.length > 20 && (
        <p className="text-xs text-[var(--text-muted)]">
          Showing 20 of {unique.length} references.
        </p>
      )}
    </div>
  );
}
