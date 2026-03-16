"use client";

import { useEffect } from "react";
import { useCrossRefStore, type ChapterCrossRef } from "@/stores/cross-references";

interface CrossRefProviderProps {
  crossReferences: ChapterCrossRef[];
  bookSlug: string;
  bookName: string;
  chapter: number;
  children: React.ReactNode;
}

/**
 * Hydrates the cross-reference Zustand store with server-fetched data.
 * Wrap around ScriptureDisplay + ContextPanel in the chapter page.
 */
export function CrossRefProvider({
  crossReferences,
  bookSlug,
  bookName,
  chapter,
  children,
}: CrossRefProviderProps) {
  const hydrate = useCrossRefStore((s) => s.hydrate);

  useEffect(() => {
    hydrate({ crossRefs: crossReferences, bookSlug, bookName, chapter });
  }, [crossReferences, bookSlug, bookName, chapter, hydrate]);

  return <>{children}</>;
}
