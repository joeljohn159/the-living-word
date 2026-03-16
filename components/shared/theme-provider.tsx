"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * ThemeProvider syncs the Zustand theme preference to the <html> element.
 * Applies the correct theme-* class and removes stale ones.
 * Must be rendered as a client component within the root layout.
 *
 * Note: Theme keyboard shortcut (T key) is handled by the centralized
 * KeyboardShortcutsProvider — no need to register it here.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = usePreferencesStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("theme-dark", "theme-light", "theme-sepia");

    // Apply the active theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return <>{children}</>;
}
