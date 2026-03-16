"use client";

import { usePathname } from "next/navigation";
import { MapPin, AlertCircle, Loader2 } from "lucide-react";
import { BibleMap } from "./BibleMap";
import { useChapterLocations } from "@/hooks/use-chapter-locations";
import { cn } from "@/lib/utils";

/**
 * Map tab content for the context panel.
 * Reads the current book/chapter from the URL and fetches referenced locations.
 */
export function MapTabContent() {
  const pathname = usePathname();

  // Extract bookSlug and chapter from URL: /bible/[bookSlug]/[chapter]
  const segments = pathname?.split("/") ?? [];
  const bookSlug = segments[2] ?? "";
  const chapter = parseInt(segments[3] ?? "0", 10);

  const { locations, loading, error } = useChapterLocations(bookSlug, chapter);

  // Idle — not on a chapter page
  if (!bookSlug || !chapter) {
    return (
      <MapEmptyState
        title="Map"
        message="Navigate to a chapter to see locations on the map."
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center px-4"
        role="alert"
      >
        <div className="rounded-full bg-red-500/10 p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-red-400" aria-hidden="true" />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Try refreshing the page.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12"
        role="status"
        aria-label="Loading map"
      >
        <Loader2
          className="h-6 w-6 text-[var(--accent-gold)] animate-spin"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Loading locations&hellip;
        </p>
      </div>
    );
  }

  // Empty — no locations for this chapter
  if (locations.length === 0) {
    return (
      <MapEmptyState
        title="No Locations"
        message="No geographic locations are referenced in this chapter."
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Map container */}
      <div className={cn("flex-1 min-h-[300px] relative")}>
        <BibleMap locations={locations} />
      </div>

      {/* Location list below map */}
      <div className="border-t border-[var(--border)] max-h-[200px] overflow-y-auto">
        <div className="px-3 py-2">
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1.5">
            {locations.length} Location{locations.length !== 1 ? "s" : ""} in
            this chapter
          </h4>
          <ul className="space-y-1" role="list" aria-label="Locations in this chapter">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors cursor-default"
              >
                <MapPin
                  className="h-3.5 w-3.5 mt-0.5 text-[var(--accent-gold)] shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                    {loc.name}
                  </p>
                  {loc.modernName && (
                    <p className="text-[10px] text-[var(--text-muted)] italic truncate">
                      Modern: {loc.modernName}
                    </p>
                  )}
                </div>
                <span className="ml-auto text-[9px] uppercase tracking-wider text-[var(--text-muted)] shrink-0 mt-0.5">
                  {loc.locationType}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state helper ────────────────────────────────────

function MapEmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="rounded-full bg-[var(--accent-gold)]/10 p-4 mb-4">
        <MapPin className="h-8 w-8 text-[var(--accent-gold)]" aria-hidden="true" />
      </div>
      <h3 className="font-cormorant text-lg font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-[200px]">
        {message}
      </p>
    </div>
  );
}
