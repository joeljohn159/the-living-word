"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * Keyboard shortcuts for Dictionary Mode:
 * - 'D' toggles dictionary mode on/off
 * - 'Escape' exits dictionary mode (when active)
 *
 * Ignores keypresses when typing in inputs or when modifier keys are held.
 */
export function useDictionaryMode() {
  const toggleDictionaryMode = usePreferencesStore((s) => s.toggleDictionaryMode);
  const setDictionaryMode = usePreferencesStore((s) => s.setDictionaryMode);
  const dictionaryMode = usePreferencesStore((s) => s.dictionaryMode);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        toggleDictionaryMode();
      }

      if (e.key === "Escape" && dictionaryMode) {
        e.preventDefault();
        setDictionaryMode(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleDictionaryMode, setDictionaryMode, dictionaryMode]);

  return dictionaryMode;
}
