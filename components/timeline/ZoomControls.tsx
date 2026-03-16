"use client";

import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  minZoom: number;
  maxZoom: number;
}

/**
 * Zoom in/out/reset controls for the timeline.
 */
export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  minZoom,
  maxZoom,
}: ZoomControlsProps) {
  return (
    <div
      className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-1"
      role="group"
      aria-label="Timeline zoom controls"
    >
      <button
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        className={cn(
          "p-2 rounded-md transition-colors",
          zoom <= minZoom
            ? "text-[var(--text-muted)] cursor-not-allowed"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        )}
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <span className="text-xs font-source-sans text-[var(--text-muted)] min-w-[3rem] text-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        className={cn(
          "p-2 rounded-md transition-colors",
          zoom >= maxZoom
            ? "text-[var(--text-muted)] cursor-not-allowed"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        )}
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-[var(--border)]" aria-hidden="true" />

      <button
        onClick={onReset}
        className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        aria-label="Reset zoom"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
