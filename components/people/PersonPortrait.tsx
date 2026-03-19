"use client";

import { Crown, ExternalLink } from "lucide-react";
import { SmartImage } from "@/components/shared/SmartImage";

interface PersonPortraitProps {
  name: string;
  imageUrl: string | null;
  sourceUrl: string | null;
}

export function PersonPortrait({ name, imageUrl, sourceUrl }: PersonPortraitProps) {
  return (
    <div className="relative w-full sm:w-40 aspect-[3/4] sm:aspect-[3/4] shrink-0 overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
      <SmartImage
        src={imageUrl}
        alt={`Portrait of ${name}`}
        fill
        sizes="(max-width: 640px) 100vw, 160px"
        className="object-cover"
        priority
        fallbackLabel={name}
        fallbackIcon={<Crown className="h-10 w-10" />}
        fallbackClassName="absolute inset-0"
      />
      {imageUrl && sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-1 right-1 z-20 flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white/80 hover:text-white backdrop-blur-sm transition-colors"
          aria-label="View image source on Wikimedia Commons"
        >
          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          Wikimedia
        </a>
      )}
    </div>
  );
}
