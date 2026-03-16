"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ExternalLink, Paintbrush, Calendar, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "./types";

interface ArtworkExpandedViewProps {
  item: MediaItem | null;
  onClose: () => void;
}

/**
 * Full-screen dialog showing expanded artwork with all metadata.
 */
export function ArtworkExpandedView({ item, onClose }: ArtworkExpandedViewProps) {
  return (
    <Dialog.Root open={!!item} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" />

        <Dialog.Content
          className={cn(
            "fixed inset-4 z-50 flex flex-col",
            "bg-[var(--bg-primary)] rounded-xl border border-[var(--border)]",
            "shadow-2xl overflow-hidden",
            "animate-in fade-in zoom-in-95 duration-200",
            "sm:inset-8 lg:inset-12",
          )}
          aria-describedby={item ? "artwork-description" : undefined}
        >
          {item && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b border-[var(--border)]">
                <div className="min-w-0 pr-4">
                  <Dialog.Title className="heading text-lg sm:text-xl text-[var(--foreground)] line-clamp-2">
                    {item.title}
                  </Dialog.Title>
                  {item.artist && (
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {item.artist}
                      {item.yearCreated && ` · ${item.yearCreated}`}
                    </p>
                  )}
                </div>
                <Dialog.Close asChild>
                  <button
                    className={cn(
                      "shrink-0 p-2 rounded-lg",
                      "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                      "hover:bg-[var(--bg-tertiary)] transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                    )}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Image area */}
              <div className="flex-1 relative min-h-0 bg-black/40">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="90vw"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Paintbrush className="w-16 h-16 text-[var(--text-muted)]" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Footer metadata */}
              <div className="p-4 border-t border-[var(--border)] space-y-3">
                {item.description && (
                  <p id="artwork-description" className="text-sm text-[var(--text-secondary)] line-clamp-3">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
                  {item.artist && (
                    <span className="inline-flex items-center gap-1.5">
                      <Paintbrush className="w-3.5 h-3.5" aria-hidden="true" />
                      {item.artist}
                    </span>
                  )}
                  {item.yearCreated && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      {item.yearCreated}
                    </span>
                  )}
                  {item.license && (
                    <span className="inline-flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                      {item.license}
                    </span>
                  )}
                </div>

                {item.attribution && (
                  <p className="text-[11px] text-[var(--text-muted)] italic">
                    {item.attribution}
                  </p>
                )}

                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs text-gold",
                      "hover:text-[var(--accent-gold-light)] transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded",
                    )}
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    View on Wikimedia Commons
                  </a>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
