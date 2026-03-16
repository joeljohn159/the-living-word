import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { truncate } from "@/lib/utils";

interface CrossReference {
  id: number;
  targetBook: string;
  targetBookSlug: string;
  targetChapter: number;
  targetVerse: number;
  targetText: string;
  relationship: string | null;
  note: string | null;
}

interface CrossReferencesListProps {
  references: CrossReference[];
}

/** Displays a list of cross-references for a verse with links. */
export function CrossReferencesList({ references }: CrossReferencesListProps) {
  if (references.length === 0) {
    return (
      <div className="text-center py-6 text-[var(--text-muted)] text-sm italic">
        No cross-references found for this verse.
      </div>
    );
  }

  return (
    <section aria-label="Cross references" className="mt-10">
      <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 text-center">
        Cross References
      </h2>
      <ul className="space-y-3 max-w-2xl mx-auto">
        {references.map((ref) => (
          <li key={ref.id}>
            <Link
              href={`/bible/${ref.targetBookSlug}/${ref.targetChapter}/${ref.targetVerse}`}
              className="group block p-4 rounded-lg border border-[var(--border)]
                         hover:border-[var(--accent-gold)] transition-colors
                         bg-[var(--surface)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="font-cormorant text-sm font-semibold text-[var(--accent-gold)]">
                    {ref.targetBook} {ref.targetChapter}:{ref.targetVerse}
                  </span>
                  {ref.relationship && (
                    <span className="ml-2 text-xs text-[var(--text-muted)] uppercase tracking-wider">
                      ({ref.relationship})
                    </span>
                  )}
                  <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {truncate(ref.targetText, 150)}
                  </p>
                  {ref.note && (
                    <p className="mt-1 text-xs text-[var(--text-muted)] italic">
                      {ref.note}
                    </p>
                  )}
                </div>
                <ArrowRight
                  className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-gold)]
                             group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
