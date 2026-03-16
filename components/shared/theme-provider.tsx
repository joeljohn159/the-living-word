"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences";
import { useThemeKeyboard } from "@/hooks/use-theme-keyboard";

/**
 * ThemeProvider syncs the Zustand theme preference to the <html> element.
 * Applies the correct theme-* class and removes stale ones.
 * Must be rendered as a client component within the root layout.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = usePreferencesStore((s) => s.theme);

  // Register 'T' keyboard shortcut to cycle themes
  useThemeKeyboard();

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("theme-dark", "theme-light", "theme-sepia");

    // Apply the active theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return <>{children}</>;
}
