"use client";

import { useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { JourneyRoute } from "./JourneyRoute";
import type { JourneyWithStops } from "./types";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [31.5, 35.2];
const DEFAULT_ZOOM = 7;

interface JourneyMapInnerProps {
  journey: JourneyWithStops;
}

/**
 * Leaflet map for a single journey detail view.
 * Renders the animated route with all stop markers.
 */
export default function JourneyMapInner({ journey }: JourneyMapInnerProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      ref={mapRef}
      scrollWheelZoom={true}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia</a> &copy; <a href="https://stamen.com/">Stamen</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        maxZoom={18}
      />

      {journey.stops.length > 0 && (
        <JourneyRoute
          stops={journey.stops}
          color={journey.color || "#C4975C"}
          animate={true}
        />
      )}
    </MapContainer>
  );
}
