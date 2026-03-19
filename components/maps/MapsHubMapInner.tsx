"use client";

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import { LocationPin } from "./LocationPin";
import { JourneyRoute } from "./JourneyRoute";
import type { MapLocation, JourneyWithStops } from "./types";
import type { TileStyle } from "./MapOverlayToggle";

import "leaflet/dist/leaflet.css";

// ─── Tile URLs ──────────────────────────────────────────────

const TILE_URLS: Record<TileStyle, string> = {
  terrain:
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  toner:
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  watercolor:
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

// ─── Tile Layer Switcher ────────────────────────────────────

function TileLayerSwitcher({ tileStyle }: { tileStyle: TileStyle }) {
  const map = useMap();

  useEffect(() => {
    // Remove existing tile layers and add new one
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    L.tileLayer(TILE_URLS[tileStyle], {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 18,
    }).addTo(map);
  }, [tileStyle, map]);

  return null;
}

// ─── Bounds fitter ──────────────────────────────────────────

function FitBounds({ locations }: { locations: MapLocation[] }) {
  const map = useMap();
  const prevKey = useRef("");

  useEffect(() => {
    if (locations.length === 0) return;

    const key = locations.map((l) => l.id).join(",");
    if (key === prevKey.current) return;
    prevKey.current = key;

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

// ─── Fly to selected location ───────────────────────────────

function FlyToSelected({ location }: { location: MapLocation | null }) {
  const map = useMap();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (!location || location.id === prevId.current) return;
    prevId.current = location.id;
    map.flyTo([location.latitude, location.longitude], 10, { duration: 1 });
  }, [location, map]);

  return null;
}

// ─── Main Map ───────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [31.5, 35.2];
const DEFAULT_ZOOM = 7;

interface MapsHubMapInnerProps {
  locations: MapLocation[];
  tileStyle: TileStyle;
  activeJourney: JourneyWithStops | null;
  selectedLocation?: MapLocation | null;
}

/**
 * Full-screen Leaflet map for the Maps Hub.
 * Renders all location pins, optional journey route, and tile style switching.
 */
export default function MapsHubMapInner({
  locations,
  tileStyle,
  activeJourney,
  selectedLocation,
}: MapsHubMapInnerProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Memoize journey color
  const journeyColor = useMemo(
    () => activeJourney?.color || "#C4975C",
    [activeJourney],
  );

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
      {/* Dynamic tile layer */}
      <TileLayerSwitcher tileStyle={tileStyle} />

      {/* Zoom control — bottom right */}
      <ZoomControl position="bottomright" />

      {/* Location markers — hidden when a journey is active */}
      {!activeJourney &&
        locations.map((loc) => (
          <LocationPin key={loc.id} location={loc} />
        ))}

      {/* Journey route overlay */}
      {activeJourney && activeJourney.stops.length > 0 && (
        <JourneyRoute
          stops={activeJourney.stops}
          color={journeyColor}
          animate={true}
        />
      )}

      {/* Auto-fit when no journey is active */}
      {!activeJourney && <FitBounds locations={locations} />}

      {/* Fly to selected sidebar location */}
      <FlyToSelected location={selectedLocation ?? null} />
    </MapContainer>
  );
}
