"use client";

import { useState, useEffect } from "react";

/**
 * Detects whether the current device supports touch input.
 * SSR-safe: defaults to false during server render.
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}
