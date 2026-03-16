"use client";

import { useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchKeyboard } from "@/hooks/use-search-keyboard";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  /** Compact variant for the header */
  compact?: boolean;
  className?: string;
  autoFocus?: boolean;
}

/**
 * Reusable search input with icon, clear button, and keyboard shortcut hint.
 * Used both on the search page and in the header.
 */
export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search the Bible...",
  compact = false,
  className,
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useSearchKeyboard(focusInput);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
    }
    if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  }

  return (
    <div
      className={cn(
        "relative flex items-center",
        compact ? "w-full max-w-xs" : "w-full",
        className
      )}
    >
      <Search
        className={cn(
          "absolute left-3 text-muted-foreground pointer-events-none",
          compact ? "h-4 w-4" : "h-5 w-5"
        )}
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-border bg-secondary/50",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50",
          "transition-colors duration-150",
          compact
            ? "pl-9 pr-8 py-1.5 text-sm"
            : "pl-11 pr-20 py-3 text-base"
        )}
        aria-label="Search"
        role="searchbox"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange("")}
          className={cn(
            "absolute text-muted-foreground hover:text-foreground",
            "transition-colors p-1 rounded",
            compact ? "right-1" : "right-14"
          )}
          aria-label="Clear search"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Keyboard shortcut hint */}
      {!compact && !value && (
        <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground font-source-sans">
            Ctrl+K
          </kbd>
        </div>
      )}
    </div>
  );
}
