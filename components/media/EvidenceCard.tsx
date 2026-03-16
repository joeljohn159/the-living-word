import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { CategoryBadge } from "@/components/evidence/CategoryBadge";

interface EvidenceCardProps {
  title: string;
  slug: string;
  description: string;
  category: string;
  dateDiscovered: string | null;
  currentLocation: string | null;
  significance: string | null;
  imageUrl: string | null;
}

/**
 * Compact evidence card for the context panel sidebar.
 * Shows title, image, category badge, date discovered,
 * current location, and a significance summary.
 * Navigates to /evidence/[slug] on click.
 */
export function EvidenceCard({
  title,
  slug,
  description,
  category,
  dateDiscovered,
  currentLocation,
  significance,
  imageUrl,
}: EvidenceCardProps) {
  const summary = significance || description;
  return (
    <Link
      href={`/evidence/${slug}`}
      className={cn(
        "group block rounded-lg overflow-hidden",
        "bg-card border border-border",
        "hover:border-gold/50 transition-all duration-300",
        "hover:shadow-md hover:shadow-gold/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
      )}
      aria-label={`View evidence: ${title}`}
    >
      {/* Image with gradient overlay */}
      {imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-2 left-2">
            <CategoryBadge category={category} size="sm" />
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="p-3 space-y-2">
        {/* Badge when no image */}
        {!imageUrl && <CategoryBadge category={category} size="sm" />}

        {/* Title */}
        <h3 className="font-cormorant text-base font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Significance summary (falls back to description) */}
        {summary && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {truncate(summary, 120)}
          </p>
        )}

        {/* Metadata: date + location */}
        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          {dateDiscovered && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
              {dateDiscovered}
            </span>
          )}
          {currentLocation && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
              {truncate(currentLocation, 25)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
