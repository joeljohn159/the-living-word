import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

/**
 * Pill-shaped badge displaying a book's category (Law, History, Poetry, etc.).
 * Gold-accented to match the museum-quality dark theme.
 */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1",
        "text-xs font-source-sans font-semibold uppercase tracking-wider",
        "border border-gold/30 bg-gold/10 text-gold",
        className,
      )}
    >
      {category}
    </span>
  );
}
