"use client";

import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/SmartImage";

interface ArtworkItem {
  id: number;
  title: string;
  description: string | null;
  artist: string | null;
  yearCreated: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  attribution: string | null;
}

interface RelatedArtworkProps {
  artwork: ArtworkItem[];
  personName: string;
}

export function RelatedArtwork({ artwork, personName }: RelatedArtworkProps) {
  if (artwork.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] italic">
        No related artwork found for {personName}.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {artwork.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-lg border border-[var(--border)] overflow-hidden",
            "bg-[var(--bg-card)] transition-all hover:border-[var(--accent-gold)]"
          )}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-tertiary)]">
            <SmartImage
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              fallbackLabel={item.title}
              fallbackIcon={<Palette className="h-8 w-8" />}
              fallbackClassName="absolute inset-0"
            />
          </div>
          <div className="p-3">
            <h4 className="heading text-sm text-[var(--text-primary)]">
              {item.title}
            </h4>
            {item.artist && (
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {item.artist}
                {item.yearCreated ? `, ${item.yearCreated}` : ""}
              </p>
            )}
            {item.attribution && (
              <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                {item.attribution}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
