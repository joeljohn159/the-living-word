"use client";

import { useRef, useCallback } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface TouchRef {
  startX: number;
  startY: number;
  startTime: number;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 0.3;
const MAX_VERTICAL_RATIO = 0.75;

/**
 * Returns touch event handlers for horizontal swipe detection.
 * Used for chapter navigation on mobile (swipe left/right).
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const touchRef = useRef<TouchRef | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchRef.current.startX;
      const deltaY = touch.clientY - touchRef.current.startY;
      const elapsed = Date.now() - touchRef.current.startTime;
      const velocity = Math.abs(deltaX) / elapsed;

      touchRef.current = null;

      // Ignore vertical-dominant swipes
      if (Math.abs(deltaY) > Math.abs(deltaX) * MAX_VERTICAL_RATIO) return;

      // Check threshold and velocity
      if (Math.abs(deltaX) < SWIPE_THRESHOLD || velocity < SWIPE_VELOCITY) return;

      if (deltaX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    },
    [onSwipeLeft, onSwipeRight],
  );

  return { onTouchStart, onTouchEnd };
}
