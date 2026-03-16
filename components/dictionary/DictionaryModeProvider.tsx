"use client";

import { useState, useCallback, useEffect } from "react";
import { useDictionaryMode } from "@/hooks/useDictionaryMode";
import { DictionaryModeBadge } from "./DictionaryModeBadge";
import { DictionaryPanel } from "./DictionaryPanel";

interface PanelEntry {
  word: string;
  slug: string;
  definition: string;
  modernEquivalent: string | null;
  partOfSpeech: string | null;
  pronunciation?: string | null;
  usageNotes?: string | null;
  exampleVerse?: {
    text: string;
    bookName: string;
    chapterNumber: number;
    verseNumber: number;
    bookSlug: string;
  } | null;
}

/**
 * Provider component that manages Dictionary Mode state:
 * - Adds/removes `dictionary-mode` class on <html> element
 * - Listens for clicks on dictionary words when mode is active
 * - Renders the floating badge and side panel
 * - Registers keyboard shortcuts via useDictionaryMode hook
 */
export function DictionaryModeProvider() {
  const dictionaryMode = useDictionaryMode();
  const [selectedEntry, setSelectedEntry] = useState<PanelEntry | null>(null);

  // Toggle `dictionary-mode` class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (dictionaryMode) {
      root.classList.add("dictionary-mode");
    } else {
      root.classList.remove("dictionary-mode");
      setSelectedEntry(null);
    }
    return () => root.classList.remove("dictionary-mode");
  }, [dictionaryMode]);

  // Listen for clicks on dictionary words when mode is active
  useEffect(() => {
    if (!dictionaryMode) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const wordEl = target.closest("[data-dictionary-word]") as HTMLElement | null;

      if (!wordEl) return;

      const slug = wordEl.getAttribute("data-dictionary-word");
      if (!slug) return;

      e.preventDefault();
      e.stopPropagation();

      // Fetch the full entry from the API
      fetchDictionaryEntry(slug).then((entry) => {
        if (entry) setSelectedEntry(entry);
      });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [dictionaryMode]);

  const closePanel = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return (
    <>
      <DictionaryModeBadge />
      <DictionaryPanel entry={selectedEntry} onClose={closePanel} />
    </>
  );
}

/**
 * Fetch a full dictionary entry (with pronunciation, usage notes, example verse)
 * from the API endpoint.
 */
async function fetchDictionaryEntry(slug: string): Promise<PanelEntry | null> {
  try {
    const res = await fetch(`/api/dictionary/${slug}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
