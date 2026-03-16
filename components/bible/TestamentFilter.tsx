"use client";

import { cn } from "@/lib/utils";

type Testament = "ALL" | "OT" | "NT";

interface TestamentFilterProps {
  value: Testament;
  onChange: (value: Testament) => void;
}

const OPTIONS: { label: string; value: Testament }[] = [
  { label: "All", value: "ALL" },
  { label: "Old Testament", value: "OT" },
  { label: "New Testament", value: "NT" },
];

/**
 * Toggle between All, Old Testament, and New Testament.
 */
export function TestamentFilter({ value, onChange }: TestamentFilterProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-secondary p-1"
      role="radiogroup"
      aria-label="Filter by testament"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-source-sans font-medium",
            "transition-all duration-200",
            value === opt.value
              ? "bg-gold text-[var(--bg-primary)] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
