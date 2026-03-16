"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSwipe } from "@/hooks/use-swipe";
import type { ChapterNavLink } from "@/components/scripture/ChapterNavigation";

interface SwipeableChapterProps {
  prev: ChapterNavLink | null;
  next: ChapterNavLink | null;
  children: React.ReactNode;
}

/**
 * Wraps chapter content with swipe gesture support for mobile.
 * Swipe left → next chapter, swipe right → previous chapter.
 */
export function SwipeableChapter({
  prev,
  next,
  children,
}: SwipeableChapterProps) {
  const router = useRouter();

  const goNext = useCallback(() => {
    if (next) router.push(`/bible/${next.bookSlug}/${next.chapter}`);
  }, [next, router]);

  const goPrev = useCallback(() => {
    if (prev) router.push(`/bible/${prev.bookSlug}/${prev.chapter}`);
  }, [prev, router]);

  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  });

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="min-h-0 flex-1"
    >
      {children}
    </div>
  );
}
