"use client";

import { cn } from "@/lib/utils";
import { DISPLAY_CATEGORIES, type DisplayCategory } from "@/lib/data/books";

interface CategoryFilterProps {
  value: DisplayCategory | "ALL";
  onChange: (value: DisplayCategory | "ALL") => void;
}

/**
 * Horizontal scrolling category filter chips.
 */
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="Filter by category"
    >
      <CategoryChip
        label="All"
        isActive={value === "ALL"}
        onClick={() => onChange("ALL")}
      />
      {DISPLAY_CATEGORIES.map((cat) => (
        <CategoryChip
          key={cat}
          label={cat}
          isActive={value === cat}
          onClick={() => onChange(cat)}
        />
      ))}
    </div>
  );
}

function CategoryChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="radio"
      aria-checked={isActive}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-source-sans font-medium",
        "border transition-all duration-200",
        isActive
          ? "border-gold bg-gold/15 text-gold"
          : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
