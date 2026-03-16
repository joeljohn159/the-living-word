"use client";

import { cn } from "@/lib/utils";
import { SEARCH_TABS, type SearchTab } from "@/lib/search";

interface SearchTabsProps {
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  counts: Record<SearchTab, number>;
}

/**
 * Horizontal tab bar for switching between search result types.
 */
export function SearchTabs({ activeTab, onTabChange, counts }: SearchTabsProps) {
  return (
    <div
      className="flex border-b border-border overflow-x-auto"
      role="tablist"
      aria-label="Search result categories"
    >
      {SEARCH_TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-source-sans font-medium",
            "whitespace-nowrap transition-colors duration-150",
            "border-b-2 -mb-px",
            activeTab === key
              ? "border-gold text-gold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
          role="tab"
          aria-selected={activeTab === key}
          aria-controls={`tabpanel-${key}`}
        >
          {label}
          {counts[key] > 0 && (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-2 py-0.5",
                "text-xs font-medium",
                activeTab === key
                  ? "bg-gold/20 text-gold"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {counts[key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
