"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * Keyboard shortcuts for the context panel:
 * - 'F' toggles fullscreen reading (hides/shows context panel)
 * - 'M' jumps to the Map tab (and opens panel if closed)
 *
 * Ignores keypresses when typing in inputs or when modifier keys are held.
 */
export function useContextPanelKeyboard() {
  const toggleSidebar = usePreferencesStore((s) => s.toggleSidebar);
  const setActiveSidebarTab = usePreferencesStore((s) => s.setActiveSidebarTab);
  const sidebarOpen = usePreferencesStore((s) => s.sidebarOpen);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleSidebar();
      }

      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setActiveSidebarTab("map");
        if (!sidebarOpen) {
          toggleSidebar();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, setActiveSidebarTab, sidebarOpen]);
}
