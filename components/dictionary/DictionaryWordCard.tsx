import Link from "next/link";
import { cn } from "@/lib/utils";

interface DictionaryWordCardProps {
  /** The archaic word. */
  word: string;
  /** URL slug for the word. */
  slug: string;
  /** Short definition. */
  definition: string;
  /** Part of speech (noun, verb, etc.). */
  partOfSpeech: string | null;
  /** Modern English equivalent. */
  modernEquivalent: string | null;
}

/**
 * Card displaying a dictionary word in the browse list.
 * Links to the full word detail page.
 */
export function DictionaryWordCard({
  word,
  slug,
  definition,
  partOfSpeech,
  modernEquivalent,
}: DictionaryWordCardProps) {
  return (
    <Link
      href={`/dictionary/${slug}`}
      className={cn(
        "group block rounded-lg border border-border",
        "bg-card p-4 sm:p-5",
        "hover:border-gold/50 hover:bg-card/80",
        "transition-all duration-200"
      )}
    >
      <div className="flex items-baseline gap-2 mb-1.5">
        <h3 className="heading text-lg sm:text-xl text-gold group-hover:text-gold-light transition-colors">
          {word}
        </h3>
        {partOfSpeech && (
          <span className="text-xs font-source-sans italic text-muted-foreground">
            {partOfSpeech}
          </span>
        )}
      </div>
      <p className="text-sm font-source-sans text-foreground/80 line-clamp-2 mb-2">
        {definition}
      </p>
      {modernEquivalent && (
        <p className="text-xs font-source-sans text-muted-foreground">
          Modern: <span className="text-gold/80">{modernEquivalent}</span>
        </p>
      )}
    </Link>
  );
}
