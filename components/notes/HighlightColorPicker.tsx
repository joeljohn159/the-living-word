"use client";

import { type HighlightColor } from "@/stores/notes";
import { cn } from "@/lib/utils";

const HIGHLIGHT_COLORS: { value: HighlightColor; label: string; bg: string }[] =
  [
    { value: "gold", label: "Gold", bg: "bg-[#C4975C]" },
    { value: "crimson", label: "Crimson", bg: "bg-[#8B2F3F]" },
    { value: "blue", label: "Blue", bg: "bg-[#3B6FA0]" },
    { value: "green", label: "Green", bg: "bg-[#4A7C59]" },
    { value: "purple", label: "Purple", bg: "bg-[#6B4C8A]" },
  ];

interface HighlightColorPickerProps {
  selected: HighlightColor;
  onSelect: (color: HighlightColor) => void;
}

export function HighlightColorPicker({
  selected,
  onSelect,
}: HighlightColorPickerProps) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Highlight color">
      {HIGHLIGHT_COLORS.map(({ value, label, bg }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={cn(
            "h-6 w-6 rounded-full transition-all duration-150",
            bg,
            selected === value
              ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110"
              : "hover:scale-110 opacity-70 hover:opacity-100"
          )}
          role="radio"
          aria-checked={selected === value}
          aria-label={label}
          title={label}
        />
      ))}
    </div>
  );
}

/** Map highlight color to a Tailwind background class for display. */
export const HIGHLIGHT_BG_MAP: Record<HighlightColor, string> = {
  gold: "bg-[#C4975C]/20",
  crimson: "bg-[#8B2F3F]/20",
  blue: "bg-[#3B6FA0]/20",
  green: "bg-[#4A7C59]/20",
  purple: "bg-[#6B4C8A]/20",
};
