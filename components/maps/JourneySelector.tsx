"use client";

import { ChevronDown, Route } from "lucide-react";
import type { Journey } from "./types";

interface JourneySelectorProps {
  journeys: Journey[];
  selectedSlug: string;
  onChange: (slug: string) => void;
}

/**
 * Dropdown to select a biblical journey and display its route on the map.
 */
export function JourneySelector({
  journeys,
  selectedSlug,
  onChange,
}: JourneySelectorProps) {
  return (
    <div className="relative">
      <Route className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--accent-gold)]" />
      <select
        value={selectedSlug}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select a biblical journey"
        className="appearance-none w-full pl-9 pr-8 py-2 text-sm bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)] cursor-pointer"
      >
        <option value="">Select a journey…</option>
        {journeys.map((j) => (
          <option key={j.slug} value={j.slug}>
            {j.name}
            {j.personName ? ` — ${j.personName}` : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
    </div>
  );
}
