"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { LocationSearch } from "./LocationSearch";
import { MapFilters } from "./MapFilters";
import { JourneySelector } from "./JourneySelector";
import { MapOverlayToggle } from "./MapOverlayToggle";
import type { TileStyle } from "./MapOverlayToggle";
import type { MapLocation, MapLocationWithRefs, Journey, JourneyWithStops } from "./types";

// Dynamic import for Leaflet (no SSR)
const MapsHubMapInner = dynamic(() => import("./MapsHubMapInner"), {
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

interface MapsHubProps {
  locations: MapLocationWithRefs[];
  journeys: Journey[];
}

/**
 * Main Maps Hub client component.
 * Full-screen interactive map with search, filters, journey selector, and overlay toggles.
 */
export function MapsHub({ locations, journeys }: MapsHubProps) {
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState("all");
  const [locationType, setLocationType] = useState("all");
  const [tileStyle, setTileStyle] = useState<TileStyle>("terrain");
  const [selectedJourneySlug, setSelectedJourneySlug] = useState("");
  const [activeJourney, setActiveJourney] = useState<JourneyWithStops | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingJourney, setLoadingJourney] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  // Unique location types
  const availableTypes = useMemo(() => {
    const types = new Set(locations.map((l) => l.locationType));
    return Array.from(types).sort();
  }, [locations]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (search && !loc.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (testament !== "all" && !loc.testaments.includes(testament)) {
        return false;
      }
      if (locationType !== "all" && loc.locationType !== locationType) {
        return false;
      }
      return true;
    });
  }, [locations, search, testament, locationType]);

  // Fetch journey data when selected
  const handleJourneyChange = useCallback(async (slug: string) => {
    setSelectedJourneySlug(slug);
    if (!slug) {
      setActiveJourney(null);
      return;
    }

    setLoadingJourney(true);
    try {
      const res = await fetch(`/api/journeys/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setActiveJourney(data);
      } else {
        setActiveJourney(null);
      }
    } catch {
      setActiveJourney(null);
    } finally {
      setLoadingJourney(false);
    }
  }, []);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full">
      {/* Sidebar */}
      <aside
        className={`absolute top-0 left-0 z-[1000] h-full transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-80 max-w-[85vw] bg-[var(--bg-primary)]/95 backdrop-blur-md border-r border-[var(--border-primary)] flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-[var(--border-primary)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-cormorant text-lg font-bold text-[var(--text-primary)]">
              <MapPin className="inline h-4 w-4 text-[var(--accent-gold)] mr-1.5" />
              Biblical Locations
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors md:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <LocationSearch value={search} onChange={setSearch} />

          <div className="mt-3">
            <MapFilters
              testament={testament}
              onTestamentChange={setTestament}
              locationType={locationType}
              onLocationTypeChange={setLocationType}
              availableTypes={availableTypes}
            />
          </div>

          <div className="mt-3">
            <JourneySelector
              journeys={journeys}
              selectedSlug={selectedJourneySlug}
              onChange={handleJourneyChange}
            />
          </div>

          <div className="mt-3">
            <MapOverlayToggle
              tileStyle={tileStyle}
              onTileStyleChange={setTileStyle}
            />
          </div>

          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {filteredLocations.length} location{filteredLocations.length !== 1 ? "s" : ""}
            {activeJourney && (
              <span className="ml-1">
                · Showing: <span className="text-[var(--accent-gold)]">{activeJourney.name}</span>
              </span>
            )}
          </p>
        </div>

        {/* Location list */}
        <div className="flex-1 overflow-y-auto">
          {loadingJourney && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-gold)]" />
            </div>
          )}

          {/* Journey stops list */}
          {activeJourney && !loadingJourney && (
            <div className="p-3">
              <h3 className="font-cormorant text-sm font-bold text-[var(--accent-gold)] mb-2">
                {activeJourney.name} — {activeJourney.stops.length} stops
              </h3>
              <ol className="space-y-2">
                {activeJourney.stops.map((stop) => (
                  <li
                    key={stop.id}
                    className="flex gap-2 p-2 rounded-md bg-[var(--bg-card)] border border-[var(--border-primary)]"
                  >
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: activeJourney.color || "#C4975C",
                        color: "#1E1E35",
                      }}
                    >
                      {stop.stopOrder}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {stop.name}
                      </p>
                      {stop.description && (
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                          {stop.description}
                        </p>
                      )}
                      {stop.scriptureRef && (
                        <p className="text-[10px] text-[var(--accent-gold)] mt-0.5 italic">
                          {stop.scriptureRef}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Location list (when no journey active) */}
          {!activeJourney && !loadingJourney && (
            <ul className="divide-y divide-[var(--border-primary)]">
              {filteredLocations.map((loc) => (
                <li
                  key={loc.id}
                  className="px-4 py-2.5 hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedLocation(loc)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedLocation(loc);
                    }
                  }}
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {loc.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {loc.locationType}
                    {loc.modernName && ` · ${loc.modernName}`}
                  </p>
                </li>
              ))}
              {filteredLocations.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                  No locations match your filters.
                </li>
              )}
            </ul>
          )}
        </div>
      </aside>

      {/* Sidebar toggle (when closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className="absolute top-4 left-4 z-[1000] flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-primary)]/90 backdrop-blur-sm border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
          <MapPin className="h-4 w-4 text-[var(--accent-gold)]" />
          <span className="hidden sm:inline">Locations</span>
        </button>
      )}

      {/* Map (full width, behind sidebar) */}
      <div className="flex-1 h-full">
        <MapsHubMapInner
          locations={filteredLocations}
          tileStyle={tileStyle}
          activeJourney={activeJourney}
          selectedLocation={selectedLocation}
        />
      </div>
    </div>
  );
}
