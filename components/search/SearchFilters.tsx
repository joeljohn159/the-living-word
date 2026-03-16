"use client";

import { cn } from "@/lib/utils";

interface BookOption {
  name: string;
  slug: string;
  testament: string;
}

interface SearchFiltersProps {
  testament: "all" | "OT" | "NT";
  onTestamentChange: (value: "all" | "OT" | "NT") => void;
  bookSlug: string;
  onBookChange: (slug: string) => void;
  books: BookOption[];
}

const TESTAMENT_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "OT" as const, label: "Old Testament" },
  { value: "NT" as const, label: "New Testament" },
];

/**
 * Filter controls for testament and book selection.
 */
export function SearchFilters({
  testament,
  onTestamentChange,
  bookSlug,
  onBookChange,
  books,
}: SearchFiltersProps) {
  const filteredBooks =
    testament === "all"
      ? books
      : books.filter((b) => b.testament === testament);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Testament toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden" role="radiogroup" aria-label="Filter by testament">
        {TESTAMENT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              onTestamentChange(value);
              onBookChange("");
            }}
            className={cn(
              "px-3 py-1.5 text-sm font-source-sans font-medium",
              "transition-colors duration-150",
              testament === value
                ? "bg-gold/20 text-gold"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            role="radio"
            aria-checked={testament === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Book selector */}
      <select
        value={bookSlug}
        onChange={(e) => onBookChange(e.target.value)}
        className={cn(
          "rounded-lg border border-border bg-secondary/50 px-3 py-1.5",
          "text-sm text-foreground font-source-sans",
          "focus:outline-none focus:ring-2 focus:ring-gold/50",
          "transition-colors"
        )}
        aria-label="Filter by book"
      >
        <option value="">All Books</option>
        {filteredBooks.map((book) => (
          <option key={book.slug} value={book.slug}>
            {book.name}
          </option>
        ))}
      </select>
    </div>
  );
}
