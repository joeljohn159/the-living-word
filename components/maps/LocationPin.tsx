"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { MapLocation } from "./types";

// ─── Custom gold marker icon ───────────────────────────────
const ICON_SIZE = 28;

function createLocationIcon(locationType: string) {
  const color = getTypeColor(locationType);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE + 8}" viewBox="0 0 24 32">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"
            fill="${color}" stroke="#1E1E35" stroke-width="1.5"/>
      <circle cx="12" cy="11" r="5" fill="#1E1E35" opacity="0.3"/>
      <circle cx="12" cy="11" r="3" fill="white"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "bible-map-pin",
    iconSize: [ICON_SIZE, ICON_SIZE + 8],
    iconAnchor: [ICON_SIZE / 2, ICON_SIZE + 8],
    popupAnchor: [0, -(ICON_SIZE + 4)],
  });
}

function getTypeColor(locationType: string): string {
  switch (locationType) {
    case "city":
      return "#C4975C";
    case "mountain":
      return "#8B7D6B";
    case "river":
    case "sea":
      return "#5C8FA6";
    case "region":
      return "#9E7A48";
    case "desert":
      return "#D4A96A";
    default:
      return "#C4975C";
  }
}

function getTypeLabel(locationType: string): string {
  return locationType.charAt(0).toUpperCase() + locationType.slice(1);
}

// ─── Component ─────────────────────────────────────────────

interface LocationPinProps {
  location: MapLocation;
}

/**
 * Clickable map marker with a popup card showing location details.
 */
export function LocationPin({ location }: LocationPinProps) {
  const icon = createLocationIcon(location.locationType);

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      aria-label={`${location.name} — ${getTypeLabel(location.locationType)}`}
    >
      <Popup
        className="bible-map-popup"
        maxWidth={260}
        minWidth={200}
        closeButton={true}
      >
        <div className="p-1">
          {/* Header */}
          <h3 className="font-cormorant text-base font-bold text-[var(--text-primary)] leading-tight mb-0.5">
            {location.name}
          </h3>

          {/* Type badge */}
          <span className="inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] font-semibold mb-1.5">
            {getTypeLabel(location.locationType)}
          </span>

          {/* Description */}
          {location.description && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-1.5 line-clamp-3">
              {location.description}
            </p>
          )}

          {/* Modern name */}
          {location.modernName && (
            <p className="text-[10px] text-[var(--text-muted)] italic">
              Modern: {location.modernName}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
