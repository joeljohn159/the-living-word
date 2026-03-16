"use client";

import { ChevronDown } from "lucide-react";

interface MapFiltersProps {
  testament: string;
  onTestamentChange: (value: string) => void;
  locationType: string;
  onLocationTypeChange: (value: string) => void;
  availableTypes: string[];
}

/**
 * Filter controls for testament and location type.
 */
export function MapFilters({
  testament,
  onTestamentChange,
  locationType,
  onLocationTypeChange,
  availableTypes,
}: MapFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Testament filter */}
      <div className="relative">
        <select
          value={testament}
          onChange={(e) => onTestamentChange(e.target.value)}
          aria-label="Filter by testament"
          className="appearance-none pl-3 pr-8 py-2 text-xs bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)] cursor-pointer"
        >
          <option value="all">All Testament</option>
          <option value="OT">Old Testament</option>
          <option value="NT">New Testament</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
      </div>

      {/* Location type filter */}
      <div className="relative">
        <select
          value={locationType}
          onChange={(e) => onLocationTypeChange(e.target.value)}
          aria-label="Filter by location type"
          className="appearance-none pl-3 pr-8 py-2 text-xs bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)] cursor-pointer"
        >
          <option value="all">All Types</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
      </div>
    </div>
  );
}
