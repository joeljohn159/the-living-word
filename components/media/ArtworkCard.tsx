"use client";

import Image from "next/image";
import { Paintbrush, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "./types";

interface ArtworkCardProps {
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
}

/**
 * Compact card for a painting/artwork in the context panel gallery.
 * Shows lazy-loaded image, title, artist, date. Click to expand.
 */
export function ArtworkCard({ item, onSelect }: ArtworkCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        "group w-full text-left rounded-lg overflow-hidden",
        "bg-[var(--bg-card)] border border-[var(--border)]",
        "hover:border-gold/50 transition-all duration-300",
        "hover:shadow-lg hover:shadow-gold/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
      )}
      aria-label={`View ${item.title}${item.artist ? ` by ${item.artist}` : ""}`}
    >
      {/* Image */}
      {item.imageUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)]">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 1280px) 50vw, 200px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-[var(--bg-secondary)] flex items-center justify-center">
          <Paintbrush className="w-8 h-8 text-[var(--text-muted)]" aria-hidden="true" />
        </div>
      )}

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h4 className="heading text-sm text-[var(--foreground)] group-hover:text-gold transition-colors line-clamp-2">
          {item.title}
        </h4>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
          {item.artist && (
            <span className="inline-flex items-center gap-1">
              <Paintbrush className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[120px]">{item.artist}</span>
            </span>
          )}
          {item.yearCreated && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
              {item.yearCreated}
            </span>
          )}
        </div>

        {item.sourceUrl && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gold/70">
            <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
            Wikimedia
          </span>
        )}
      </div>
    </button>
  );
}
