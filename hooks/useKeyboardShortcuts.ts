"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * Returns true if the keyboard event target is a form field or editable element.
 * Used to suppress shortcuts when the user is typing.
 */
function isTyping(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if ((e.target as HTMLElement)?.isContentEditable) return true;
  return false;
}

/**
 * Returns true if a modifier key (Ctrl/Cmd/Alt) is held.
 * Used to avoid intercepting browser-native shortcuts.
 */
function hasModifier(e: KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey || e.altKey;
}

/**
 * Extract book slug and chapter number from a /bible/[bookSlug]/[chapter] path.
 * Returns null if the current path isn't a chapter page.
 */
function parseChapterPath(pathname: string) {
  const match = pathname.match(/^\/bible\/([^/]+)\/(\d+)$/);
  if (!match) return null;
  return { bookSlug: match[1], chapter: parseInt(match[2], 10) };
}

interface UseKeyboardShortcutsOptions {
  /** Callback to toggle the keyboard shortcuts help dialog */
  onToggleHelp: () => void;
}

/**
 * Centralized keyboard shortcut handler for The Living Word.
 *
 * Shortcuts:
 * - D          → Toggle dictionary mode
 * - T          → Cycle theme (dark → light → sepia)
 * - F          → Toggle fullscreen reading (hide/show context panel)
 * - M          → Open map panel
 * - B          → Open book browser (/bible)
 * - +/=        → Increase font size
 * - -          → Decrease font size
 * - ?          → Show keyboard shortcuts help dialog
 * - /          → Focus search (/search)
 * - Ctrl+K     → Focus search (always, even in form fields)
 * - Escape     → Close panels, exit dictionary mode
 * - ← (Left)  → Previous chapter (on chapter pages)
 * - → (Right)  → Next chapter (on chapter pages)
 *
 * All single-key shortcuts are suppressed when typing in inputs/textareas.
 */
export function useKeyboardShortcuts({ onToggleHelp }: UseKeyboardShortcutsOptions) {
  const router = useRouter();
  const pathname = usePathname();

  // Zustand selectors
  const toggleDictionaryMode = usePreferencesStore((s) => s.toggleDictionaryMode);
  const setDictionaryMode = usePreferencesStore((s) => s.setDictionaryMode);
  const dictionaryMode = usePreferencesStore((s) => s.dictionaryMode);
  const cycleTheme = usePreferencesStore((s) => s.cycleTheme);
  const toggleSidebar = usePreferencesStore((s) => s.toggleSidebar);
  const sidebarOpen = usePreferencesStore((s) => s.sidebarOpen);
  const setActiveSidebarTab = usePreferencesStore((s) => s.setActiveSidebarTab);
  const increaseFontSize = usePreferencesStore((s) => s.increaseFontSize);
  const decreaseFontSize = usePreferencesStore((s) => s.decreaseFontSize);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // ── Ctrl+K / Cmd+K — always open search (even in form fields) ──
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
        return;
      }

      // ── All remaining shortcuts require NOT typing in a form field ──
      if (isTyping(e)) return;

      // ── Escape — close panels / exit dictionary mode ──
      if (e.key === "Escape") {
        e.preventDefault();
        if (dictionaryMode) {
          setDictionaryMode(false);
        } else if (sidebarOpen) {
          toggleSidebar();
        }
        return;
      }

      // ── Shortcuts that require no modifier keys ──
      if (hasModifier(e)) return;

      switch (e.key) {
        // D — Dictionary mode
        case "d":
        case "D":
          e.preventDefault();
          toggleDictionaryMode();
          break;

        // T — Cycle theme
        case "t":
        case "T":
          e.preventDefault();
          cycleTheme();
          break;

        // F — Fullscreen reading (toggle context panel)
        case "f":
        case "F":
          e.preventDefault();
          toggleSidebar();
          break;

        // M — Toggle map panel
        case "m":
        case "M":
          e.preventDefault();
          setActiveSidebarTab("map");
          if (!sidebarOpen) {
            toggleSidebar();
          }
          break;

        // B — Open book browser
        case "b":
        case "B":
          e.preventDefault();
          router.push("/bible");
          break;

        // + / = — Increase font size
        case "+":
        case "=":
          e.preventDefault();
          increaseFontSize();
          break;

        // - — Decrease font size
        case "-":
          e.preventDefault();
          decreaseFontSize();
          break;

        // ? — Show keyboard shortcuts help
        case "?":
          e.preventDefault();
          onToggleHelp();
          break;

        // / — Focus search
        case "/":
          e.preventDefault();
          router.push("/search");
          break;

        // ← — Previous chapter
        case "ArrowLeft": {
          const chapter = parseChapterPath(pathname);
          if (chapter && chapter.chapter > 1) {
            e.preventDefault();
            router.push(`/bible/${chapter.bookSlug}/${chapter.chapter - 1}`);
          }
          break;
        }

        // → — Next chapter
        case "ArrowRight": {
          const chapter = parseChapterPath(pathname);
          if (chapter) {
            e.preventDefault();
            router.push(`/bible/${chapter.bookSlug}/${chapter.chapter + 1}`);
          }
          break;
        }

        default:
          break;
      }
    },
    [
      router,
      pathname,
      dictionaryMode,
      sidebarOpen,
      toggleDictionaryMode,
      setDictionaryMode,
      cycleTheme,
      toggleSidebar,
      setActiveSidebarTab,
      increaseFontSize,
      decreaseFontSize,
      onToggleHelp,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
