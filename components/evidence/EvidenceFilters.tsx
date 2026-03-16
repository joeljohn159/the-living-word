"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "./CategoryBadge";

interface EvidenceFiltersProps {
  counts: Record<string, number>;
  totalCount: number;
}

export function EvidenceFilters({ counts, totalCount }: EvidenceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const handleFilter = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category === "all") {
        params.delete("category");
      } else {
        params.set("category", category);
      }
      router.push(`/evidence?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
      <FilterButton
        label="All"
        count={totalCount}
        isActive={activeCategory === "all"}
        onClick={() => handleFilter("all")}
      />
      {CATEGORIES.map(({ value, label }) => (
        <FilterButton
          key={value}
          label={label}
          count={counts[value] || 0}
          isActive={activeCategory === value}
          onClick={() => handleFilter(value)}
        />
      ))}
    </nav>
  );
}

interface FilterButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterButton({ label, count, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-source-sans font-medium transition-all",
        "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        isActive
          ? "bg-gold/10 text-gold border-gold/30"
          : "bg-transparent text-[var(--text-secondary)] border-[var(--border)] hover:border-gold/30 hover:text-[var(--foreground)]"
      )}
      aria-pressed={isActive}
    >
      {label}
      <span
        className={cn(
          "text-xs px-1.5 py-0.5 rounded-full",
          isActive ? "bg-gold/20 text-gold" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
        )}
      >
        {count}
      </span>
    </button>
  );
}
