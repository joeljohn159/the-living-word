"use client";

import { useEffect, useState } from "react";
import { Polyline, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { JourneyStop } from "./types";

// ─── Numbered journey pin icon ──────────────────────────────

const PIN_W = 30;
const PIN_H = 40;

function createJourneyStopIcon(
  index: number,
  total: number,
  color: string,
) {
  const fill =
    index === 0 ? "#4CAF50" : index === total - 1 ? "#F44336" : color;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${PIN_W}" height="${PIN_H}" viewBox="0 0 30 40">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z"
            fill="${fill}" stroke="#1E1E35" stroke-width="1.5"/>
      <circle cx="15" cy="14" r="10" fill="#1E1E35" opacity="0.25"/>
      <text x="15" y="18" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="sans-serif">${index + 1}</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "bible-map-pin",
    iconSize: [PIN_W, PIN_H],
    iconAnchor: [PIN_W / 2, PIN_H],
    popupAnchor: [0, -PIN_H + 4],
  });
}

interface JourneyRouteProps {
  stops: JourneyStop[];
  color: string;
  animate?: boolean;
}

/**
 * Renders a journey route as an animated polyline on the Leaflet map.
 * Shows numbered stop markers and auto-fits the map to the route bounds.
 */
export function JourneyRoute({
  stops,
  color,
  animate = true,
}: JourneyRouteProps) {
  const map = useMap();
  const [visibleCount, setVisibleCount] = useState(animate ? 0 : stops.length);

  const validStops = stops.filter(
    (s) => s.latitude !== null && s.longitude !== null,
  );

  // Animate the route drawing
  useEffect(() => {
    if (!animate || validStops.length === 0) {
      setVisibleCount(validStops.length);
      return;
    }

    setVisibleCount(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVisibleCount(current);
      if (current >= validStops.length) {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [animate, validStops.length]);

  // Fit bounds to route
  useEffect(() => {
    if (validStops.length === 0) return;
    const latLngs = validStops.map(
      (s) => [s.latitude!, s.longitude!] as [number, number],
    );
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 8, { animate: true });
    } else {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 9, animate: true });
    }
  }, [validStops, map]);

  const visibleStops = validStops.slice(0, visibleCount);
  const polylinePoints = visibleStops.map(
    (s) => [s.latitude!, s.longitude!] as [number, number],
  );

  return (
    <>
      {/* Route line */}
      {polylinePoints.length >= 2 && (
        <Polyline
          positions={polylinePoints}
          pathOptions={{
            color,
            weight: 3,
            opacity: 0.8,
            dashArray: "8 4",
          }}
        />
      )}

      {/* Stop pin markers */}
      {visibleStops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={[stop.latitude!, stop.longitude!]}
          icon={createJourneyStopIcon(index, validStops.length, color)}
        >
          <Tooltip
            direction="top"
            offset={[0, -PIN_H + 2]}
            permanent={false}
          >
            <span className="font-cormorant text-sm font-bold">
              {stop.stopOrder}. {stop.name}
            </span>
            {stop.scriptureRef && (
              <span className="block text-xs text-[var(--text-muted)]">
                {stop.scriptureRef}
              </span>
            )}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
