"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ChapterNavLink } from "./ChapterNavigation";

interface ChapterKeyboardNavProps {
  prev: ChapterNavLink | null;
  next: ChapterNavLink | null;
}

/** Registers ← → keyboard shortcuts for chapter navigation. */
export function ChapterKeyboardNav({ prev, next }: ChapterKeyboardNavProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) {
        return;
      }

      if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        router.push(`/bible/${prev.bookSlug}/${prev.chapter}`);
      }

      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        router.push(`/bible/${next.bookSlug}/${next.chapter}`);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next, router]);

  return null;
}
