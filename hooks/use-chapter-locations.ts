"use client";

import { useState, useEffect } from "react";
import type { MapLocation } from "@/components/maps/types";

/**
 * Fetches locations for a given book chapter via the API.
 * Returns { locations, loading, error }.
 */
export function useChapterLocations(bookSlug: string, chapter: number) {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookSlug || !chapter) {
      setLocations([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/locations?bookSlug=${encodeURIComponent(bookSlug)}&chapter=${chapter}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: MapLocation[]) => {
        if (!cancelled) {
          setLocations(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to fetch locations:", err);
          setError("Could not load locations");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookSlug, chapter]);

  return { locations, loading, error };
}
