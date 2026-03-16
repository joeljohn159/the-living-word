import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonCardProps {
  name: string;
  slug: string;
  description: string | null;
  tribeOrGroup: string | null;
  alsoKnownAs: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
}

export function PersonCard({
  name,
  slug,
  description,
  tribeOrGroup,
  alsoKnownAs,
  imageUrl,
  sourceUrl,
}: PersonCardProps) {
  return (
    <Link
      href={`/people/${slug}`}
      className={cn(
        "group block rounded-lg border border-[var(--border)] overflow-hidden",
        "bg-[var(--bg-card)] hover:border-[var(--accent-gold)]",
        "transition-all duration-200 hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]"
      )}
      aria-label={`View profile of ${name}`}
    >
      {/* Portrait image */}
      {imageUrl ? (
        <div className="relative aspect-[3/2] overflow-hidden bg-[var(--bg-secondary)]">
          <Image
            src={imageUrl}
            alt={`Portrait of ${name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {tribeOrGroup && (
            <span className="absolute top-2 left-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
              {tribeOrGroup}
            </span>
          )}
        </div>
      ) : (
        /* Fallback: icon-based avatar when no image */
        null
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {!imageUrl && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                "bg-[var(--bg-tertiary)] text-[var(--accent-gold)]",
                "group-hover:bg-[var(--accent-gold)] group-hover:text-[var(--bg-primary)]",
                "transition-colors duration-200"
              )}
              aria-hidden="true"
            >
              <Users className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="heading text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
              {name}
            </h3>
            {alsoKnownAs && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Also known as: {alsoKnownAs}
              </p>
            )}
            {!imageUrl && tribeOrGroup && (
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent-gold)]">
                {tribeOrGroup}
              </span>
            )}
            {description && (
              <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Wikimedia attribution */}
        {imageUrl && sourceUrl && (
          <p className="mt-2 text-[10px] text-[var(--text-muted)] truncate">
            Image:{" "}
            <span
              className="underline"
              aria-label="Wikimedia Commons source"
            >
              Wikimedia Commons
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
