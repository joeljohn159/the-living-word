"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DictionarySearchProps {
  /** Current search query. */
  value: string;
  /** Callback when search input changes. */
  onChange: (value: string) => void;
}

/**
 * Search input for filtering dictionary words.
 * Includes a search icon and clear button.
 */
export function DictionarySearch({ value, onChange }: DictionarySearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder="Search words..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-lg border border-border bg-secondary/50",
          "py-2.5 pl-10 pr-10 text-sm font-source-sans",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold",
          "transition-colors duration-150"
        )}
        aria-label="Search dictionary words"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
