"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, MapPin, Mountain, Waves, TreePine, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterLocation {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  locationType: string;
  latitude: number;
  longitude: number;
  modernName: string | null;
  imageUrl: string | null;
}

type FetchState = "idle" | "loading" | "success" | "error";

function getLocationIcon(type: string) {
  switch (type) {
    case "mountain":
      return Mountain;
    case "river":
    case "sea":
      return Waves;
    case "desert":
    case "region":
      return TreePine;
    default:
      return MapPin;
  }
}

function getLocationTypeLabel(type: string) {
  const labels: Record<string, string> = {
    city: "City",
    mountain: "Mountain",
    river: "River",
    sea: "Sea",
    region: "Region",
    desert: "Desert",
    valley: "Valley",
    island: "Island",
  };
  return labels[type] || type;
}

/**
 * Places tab content for the context panel.
 * Shows locations mentioned in the current chapter with map links.
 */
export function PlacesTabContent() {
  const pathname = usePathname();
  const [locations, setLocations] = useState<ChapterLocation[]>([]);
  const [state, setState] = useState<FetchState>("idle");

  const segments = pathname?.split("/") ?? [];
  const bookSlug = segments[2] ?? "";
  const chapter = segments[3] ?? "";

  useEffect(() => {
    if (!bookSlug || !chapter) {
      setState("idle");
      setLocations([]);
      return;
    }

    let cancelled = false;

    async function fetchLocations() {
      setState("loading");
      try {
        const res = await fetch(
          `/api/locations?bookSlug=${encodeURIComponent(bookSlug)}&chapter=${encodeURIComponent(chapter)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setLocations(Array.isArray(data) ? data : []);
          setState("success");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }

    fetchLocations();
    return () => { cancelled = true; };
  }, [bookSlug, chapter]);

  if (state === "idle") {
    return <PlacesEmpty />;
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status">
        <Loader2 className="h-6 w-6 text-[var(--accent-gold)] animate-spin" />
        <p className="mt-3 text-sm text-[var(--text-muted)]">Loading places&hellip;</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4" role="alert">
        <p className="text-sm text-red-400">Could not load places for this chapter.</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return <PlacesEmpty />;
  }

  return (
    <div className="flex flex-col gap-2 px-1">
      <p className="text-xs text-[var(--text-muted)] px-1 mb-1">
        {locations.length} {locations.length === 1 ? "place" : "places"} mentioned
      </p>

      {/* Mini map link */}
      <a
        href={`/maps?highlight=${locations.map((l) => l.slug).join(",")}`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg mb-2",
          "bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]",
          "hover:bg-[var(--accent-gold)]/20 transition-colors text-xs font-semibold",
        )}
      >
        <Navigation className="w-3.5 h-3.5" />
        View all on interactive map
      </a>

      <ul className="flex flex-col gap-2" role="list" aria-label="Places in this chapter">
        {locations.map((loc) => {
          const Icon = getLocationIcon(loc.locationType);
          return (
            <li key={loc.id}>
              <div
                className={cn(
                  "rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]",
                  "p-3 transition-colors hover:border-[var(--accent-gold)]/40",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-md bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {loc.name}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] shrink-0">
                        {getLocationTypeLabel(loc.locationType)}
                      </span>
                    </div>
                    {loc.modernName && (
                      <p className="text-[11px] text-[var(--accent-gold)] mt-0.5">
                        Modern: {loc.modernName}
                      </p>
                    )}
                    {loc.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-3">
                        {loc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                      </span>
                      <a
                        href={`/maps?lat=${loc.latitude}&lng=${loc.longitude}&zoom=10`}
                        className="text-[10px] text-[var(--accent-gold)] hover:underline"
                      >
                        View on map
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PlacesEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-3 rounded-full bg-[var(--bg-tertiary)] mb-3">
        <MapPin className="w-6 h-6 text-[var(--text-muted)]" />
      </div>
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
        No Locations Found
      </p>
      <p className="text-xs text-[var(--text-muted)] max-w-[200px]">
        No specific locations are linked to this chapter yet.
      </p>
      <a
        href="/maps"
        className="mt-3 text-xs text-[var(--accent-gold)] hover:underline"
      >
        Explore all biblical locations
      </a>
    </div>
  );
}
