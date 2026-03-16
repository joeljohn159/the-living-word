"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * Listens for the 'T' key press to cycle through themes.
 * Ignores keypresses when the user is typing in an input, textarea, or
 * contentEditable element.
 */
export function useThemeKeyboard() {
  const cycleTheme = usePreferencesStore((s) => s.cycleTheme);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in form fields
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      // Ignore if modifier keys are held
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        cycleTheme();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cycleTheme]);
}
