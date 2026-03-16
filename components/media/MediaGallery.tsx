"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { ArtworkCard } from "./ArtworkCard";
import { ArtworkExpandedView } from "./ArtworkExpandedView";
import type { MediaItem } from "./types";

interface MediaGalleryProps {
  items: MediaItem[];
}

/**
 * Scrollable grid of artwork cards for the Visuals context-panel tab.
 * Shows an empty state when no media is available for the chapter.
 */
export function MediaGallery({ items }: MediaGalleryProps) {
  const [selected, setSelected] = useState<MediaItem | null>(null);

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <ArtworkCard key={item.id} item={item} onSelect={setSelected} />
        ))}
      </div>

      <ArtworkExpandedView item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/** Tasteful empty state when no media exists for the current chapter. */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-gold/10 p-4 mb-4">
        <ImageIcon className="h-8 w-8 text-gold" aria-hidden="true" />
      </div>
      <h3 className="font-cormorant text-lg font-semibold text-[var(--foreground)] mb-1">
        No Artwork Available
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-[220px]">
        There are no paintings or illustrations linked to this chapter yet.
      </p>
    </div>
  );
}
