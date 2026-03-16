"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchKeyboard } from "@/hooks/use-search-keyboard";

/**
 * Compact search trigger button for the header.
 * Shows Ctrl+K hint and navigates to /search on click or shortcut.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();

  const openSearch = useCallback(() => {
    router.push("/search");
  }, [router]);

  useSearchKeyboard(openSearch);

  return (
    <button
      onClick={openSearch}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg",
        "border border-border bg-secondary/50 px-3 py-1.5",
        "text-sm text-muted-foreground",
        "hover:text-foreground hover:border-gold/30",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        className
      )}
      aria-label="Open search (Ctrl+K)"
    >
      <Search className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden md:inline">Search...</span>
      <kbd className="hidden lg:inline-flex items-center rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-source-sans">
        Ctrl+K
      </kbd>
    </button>
  );
}
