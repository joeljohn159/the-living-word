"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { MapLocation } from "./types";

/**
 * Leaflet map wrapper — dynamically imported with SSR disabled.
 * Leaflet requires window/document which are unavailable during SSR.
 */
const BibleMapInner = dynamic(() => import("./BibleMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[var(--bg-card)]">
      <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-gold)]" />
        <span className="text-xs">Loading map&hellip;</span>
      </div>
    </div>
  ),
});

interface BibleMapProps {
  locations: MapLocation[];
}

export function BibleMap({ locations }: BibleMapProps) {
  return <BibleMapInner locations={locations} />;
}
