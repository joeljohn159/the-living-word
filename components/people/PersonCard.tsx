"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/SmartImage";

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
      {/* Portrait image or decorative fallback */}
      <div className="relative aspect-[3/2] overflow-hidden bg-[var(--bg-secondary)]">
        <SmartImage
          src={imageUrl}
          alt={`Portrait of ${name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackLabel={name}
          fallbackIcon={<Users className="h-8 w-8" />}
          fallbackClassName="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        {tribeOrGroup && (
          <span className="absolute top-2 left-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm z-20">
            {tribeOrGroup}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="min-w-0 flex-1">
          <h3 className="heading text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
            {name}
          </h3>
          {alsoKnownAs && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Also known as: {alsoKnownAs}
            </p>
          )}
          {description && (
            <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
              {description}
            </p>
          )}
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
