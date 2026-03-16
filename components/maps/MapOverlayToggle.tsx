"use client";

import { Layers } from "lucide-react";

export type TileStyle = "terrain" | "toner" | "watercolor";

interface MapOverlayToggleProps {
  tileStyle: TileStyle;
  onTileStyleChange: (style: TileStyle) => void;
}

const TILE_OPTIONS: { value: TileStyle; label: string }[] = [
  { value: "terrain", label: "Terrain" },
  { value: "toner", label: "Modern" },
  { value: "watercolor", label: "Watercolor" },
];

/**
 * Toggle between different map tile styles / overlays.
 */
export function MapOverlayToggle({
  tileStyle,
  onTileStyleChange,
}: MapOverlayToggleProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Layers className="h-4 w-4 text-[var(--text-muted)]" />
      <div className="flex rounded-lg overflow-hidden border border-[var(--border-primary)]">
        {TILE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onTileStyleChange(opt.value)}
            aria-label={`${opt.label} map style`}
            aria-pressed={tileStyle === opt.value}
            className={`px-2.5 py-1.5 text-xs transition-colors ${
              tileStyle === opt.value
                ? "bg-[var(--accent-gold)] text-[var(--bg-primary)] font-semibold"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
