import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Star } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";

interface EvidenceCardProps {
  title: string;
  slug: string;
  description: string;
  category: string;
  dateDiscovered: string | null;
  locationFound: string | null;
  imageUrl: string | null;
  significance: string | null;
}

export function EvidenceCard({
  title,
  slug,
  description,
  category,
  dateDiscovered,
  locationFound,
  imageUrl,
  significance,
}: EvidenceCardProps) {
  const significanceRating = getSignificanceRating(significance);

  return (
    <Link
      href={`/evidence/${slug}`}
      className={cn(
        "group block rounded-lg overflow-hidden",
        "bg-[var(--bg-card)] border border-[var(--border)]",
        "hover:border-gold/50 transition-all duration-300",
        "hover:shadow-lg hover:shadow-gold/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      )}
      aria-label={`View details about ${title}`}
    >
      {imageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <CategoryBadge category={category} />
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {!imageUrl && (
          <CategoryBadge category={category} />
        )}

        <h3 className="heading text-lg text-[var(--foreground)] group-hover:text-gold transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
          {truncate(description, 150)}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
          {dateDiscovered && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              {dateDiscovered}
            </span>
          )}
          {locationFound && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {truncate(locationFound, 30)}
            </span>
          )}
        </div>

        {significanceRating > 0 && (
          <div className="flex items-center gap-1" aria-label={`Significance: ${significanceRating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < significanceRating
                    ? "text-gold fill-gold"
                    : "text-[var(--text-muted)]"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/** Derive a 1–5 significance rating from the significance text length and keywords. */
function getSignificanceRating(significance: string | null): number {
  if (!significance) return 0;
  const text = significance.toLowerCase();
  let score = 3;
  if (text.includes("earliest") || text.includes("oldest") || text.includes("only known")) score += 1;
  if (text.includes("directly confirms") || text.includes("first")) score += 1;
  if (text.length < 80) score -= 1;
  return Math.max(1, Math.min(5, score));
}
