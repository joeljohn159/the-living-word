"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000]; // ms between retries

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Fallback label — typically the person/item name. First letter used as initial. */
  fallbackLabel?: string;
  /** Lucide icon to show in fallback. Pass the JSX directly. */
  fallbackIcon?: React.ReactNode;
  /** Additional classes for the fallback container */
  fallbackClassName?: string;
}

/**
 * Image wrapper with:
 * - Shimmer skeleton while loading
 * - Auto-retry on failure (up to 3 attempts with increasing delay)
 * - Graceful fallback with initial + icon after all retries exhausted
 * - Smooth fade-in on load
 */
export function SmartImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
  fallbackLabel,
  fallbackIcon,
  fallbackClassName,
}: SmartImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error"
  );
  const [retryCount, setRetryCount] = useState(0);
  const [imgKey, setImgKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoad = useCallback(() => {
    setStatus("loaded");
    setRetryCount(0);
  }, []);

  // Catch images that loaded before React attached the onLoad handler (e.g. cached)
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0 && status === "loading") {
      setStatus("loaded");
    }
  });

  const handleError = useCallback(() => {
    setRetryCount((prev) => {
      if (prev < MAX_RETRIES) {
        // Schedule a retry
        return prev + 1;
      }
      setStatus("error");
      return prev;
    });
  }, []);

  // Retry effect — when retryCount increments and is within limit, reload after delay
  useEffect(() => {
    if (retryCount === 0 || retryCount > MAX_RETRIES || !src) return;

    const delay = RETRY_DELAYS[retryCount - 1] || 10000;
    timerRef.current = setTimeout(() => {
      setImgKey((k) => k + 1); // force remount of Image to retry
      setStatus("loading");
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [retryCount, src]);

  const initial = fallbackLabel?.trim().charAt(0).toUpperCase() || "?";

  // No src or all retries exhausted — show fallback
  if (!src || (status === "error" && retryCount >= MAX_RETRIES)) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1.5",
          "bg-[var(--bg-tertiary)]",
          fallbackClassName
        )}
        aria-label={alt}
      >
        {fallbackIcon ? (
          <span className="text-[var(--accent-gold)] opacity-50">
            {fallbackIcon}
          </span>
        ) : (
          <span className="font-cormorant text-2xl font-semibold text-[var(--accent-gold)] opacity-40 select-none">
            {initial}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Shimmer skeleton — visible while loading */}
      {status === "loading" && (
        <div
          className={cn(
            "absolute inset-0 z-10",
            "bg-[var(--bg-tertiary)]",
            "overflow-hidden"
          )}
          aria-hidden="true"
        >
          <div className="smart-image-shimmer absolute inset-0" />
        </div>
      )}

      <Image
        ref={imgRef as React.Ref<HTMLImageElement>}
        key={imgKey}
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={cn(
          className,
          "transition-opacity duration-500",
          status === "loaded" ? "opacity-100" : "opacity-0"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}
