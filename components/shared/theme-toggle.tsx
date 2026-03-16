"use client";

import { Moon, Sun, BookOpen } from "lucide-react";
import { usePreferencesStore, type Theme } from "@/stores/preferences";
import { cn } from "@/lib/utils";

const THEME_META: Record<Theme, { label: string; icon: typeof Moon }> = {
  dark: { label: "Dark", icon: Moon },
  light: { label: "Light", icon: Sun },
  sepia: { label: "Sepia", icon: BookOpen },
};

/**
 * A compact toggle button that cycles through dark → light → sepia themes.
 * Shows the current theme icon and label, with a keyboard hint.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycleTheme } = usePreferencesStore();
  const { label, icon: Icon } = THEME_META[theme];

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2",
        "text-sm font-source-sans font-medium",
        "bg-secondary text-secondary-foreground",
        "border border-border",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label={`Current theme: ${label}. Press to switch theme.`}
      title={`Theme: ${label} (T)`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
      <kbd
        className="hidden sm:inline-block ml-1 text-xs text-muted-foreground
                   bg-muted px-1.5 py-0.5 rounded border border-border"
        aria-hidden="true"
      >
        T
      </kbd>
    </button>
  );
}
