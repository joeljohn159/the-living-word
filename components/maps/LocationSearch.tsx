"use client";

import { Search, X } from "lucide-react";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Search input for filtering map locations by name.
 */
export function LocationSearch({ value, onChange }: LocationSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search locations…"
        aria-label="Search biblical locations"
        className="w-full pl-9 pr-8 py-2 text-sm bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
