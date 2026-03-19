"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import { LocationPin } from "./LocationPin";
import type { MapLocation } from "./types";

import "leaflet/dist/leaflet.css";

// ─── Bounds fitter ─────────────────────────────────────────

interface FitBoundsProps {
  locations: MapLocation[];
}

function FitBounds({ locations }: FitBoundsProps) {
  const map = useMap();
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (locations.length === 0) return;

    // Only refit when location set changes
    if (locations.length === prevCountRef.current) return;
    prevCountRef.current = locations.length;

    const latLngs = locations.map(
      (loc) => [loc.latitude, loc.longitude] as [number, number],
    );

    if (latLngs.length === 1) {
      map.setView(latLngs[0], 8, { animate: true });
    } else {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10, animate: true });
    }
  }, [locations, map]);

  return null;
}

// ─── Map component ─────────────────────────────────────────

interface BibleMapInnerProps {
  locations: MapLocation[];
}

/** Default center: roughly Holy Land center (Jerusalem area). */
const DEFAULT_CENTER: [number, number] = [31.5, 35.2];
const DEFAULT_ZOOM = 7;

/**
 * Inner Leaflet map component. Must only render on the client.
 * Uses OpenStreetMap tiles with a muted/ancient-feeling style.
 */
export default function BibleMapInner({ locations }: BibleMapInnerProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      ref={mapRef}
      scrollWheelZoom={true}
      zoomControl={false}
      attributionControl={true}
    >
      {/* Zoom control — bottom right */}
      <ZoomControl position="bottomright" />

      {/* Muted antiquity-style tiles — Stamen Toner Lite via Stadia Maps (free, no key) */}
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia</a> &copy; <a href="https://stamen.com/">Stamen</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        maxZoom={18}
      />

      {/* Location markers */}
      {locations.map((loc) => (
        <LocationPin key={loc.id} location={loc} />
      ))}

      {/* Auto-fit bounds to show all pins */}
      <FitBounds locations={locations} />
    </MapContainer>
  );
}
