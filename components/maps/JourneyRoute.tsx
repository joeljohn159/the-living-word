"use client";

import { useEffect, useState } from "react";
import { Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { JourneyStop } from "./types";

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

      {/* Stop markers */}
      {visibleStops.map((stop, index) => (
        <CircleMarker
          key={stop.id}
          center={[stop.latitude!, stop.longitude!]}
          radius={index === 0 || index === validStops.length - 1 ? 8 : 6}
          pathOptions={{
            color: "#1E1E35",
            fillColor: index === 0 ? "#4CAF50" : index === validStops.length - 1 ? "#F44336" : color,
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Tooltip
            direction="top"
            offset={[0, -8]}
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
        </CircleMarker>
      ))}
    </>
  );
}
