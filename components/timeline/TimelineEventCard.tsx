"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimelineIcon } from "./TimelineIcon";
import type { TimelineEvent, TimelineEra } from "@/data/timeline-events";

interface TimelineEventCardProps {
  event: TimelineEvent;
  era: TimelineEra;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Individual event card displayed along the timeline.
 * Shows icon, title, date. Expands on click to show description + scripture link.
 */
export function TimelineEventCard({
  event,
  era,
  index,
  isExpanded,
  onToggle,
}: TimelineEventCardProps) {
  const isTop = index % 2 === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: isTop ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.6), duration: 0.3 }}
      className={cn(
        "absolute flex flex-col items-center",
        /* Desktop: alternate above/below the line */
        "lg:absolute",
        isTop ? "lg:-top-4 lg:flex-col-reverse" : "lg:top-10"
      )}
      style={{ left: `var(--event-left)` }}
    >
      {/* Connector dot on the timeline axis */}
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2 border-[var(--bg-primary)] shrink-0 z-10",
          era.color
        )}
        aria-hidden="true"
      />

      {/* Card */}
      <button
        onClick={onToggle}
        className={cn(
          "group relative w-48 text-left rounded-lg p-3 transition-all cursor-pointer",
          "bg-[var(--bg-card)] border border-[var(--border)]",
          "hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5",
          isExpanded && "border-gold/50 shadow-lg shadow-gold/5",
          isTop ? "lg:mb-3" : "lg:mt-3"
        )}
        aria-expanded={isExpanded}
        aria-label={`${event.title}, ${event.yearLabel}`}
      >
        <div className="flex items-start gap-2">
          <span
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-md shrink-0",
              era.color,
              "bg-opacity-20"
            )}
          >
            <TimelineIcon
              name={event.icon}
              className="w-3.5 h-3.5 text-gold"
            />
          </span>
          <div className="min-w-0">
            <h3 className="heading text-sm text-[var(--text-primary)] leading-tight line-clamp-2">
              {event.title}
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-source-sans mt-0.5">
              {event.yearLabel}
            </p>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 pt-2 border-t border-[var(--border)]"
          >
            <p className="text-xs text-[var(--text-secondary)] font-source-sans leading-relaxed mb-2">
              {event.description}
            </p>
            <Link
              href={event.scriptureLink}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors font-source-sans font-medium"
              aria-label={`Read ${event.scriptureRef}`}
            >
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              {event.scriptureRef}
            </Link>
          </motion.div>
        )}
      </button>
    </motion.div>
  );
}

/**
 * Mobile-optimized vertical event card.
 * Always shows inline in the vertical timeline flow.
 */
export function TimelineEventCardMobile({
  event,
  era,
  index,
  isExpanded,
  onToggle,
}: TimelineEventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.8), duration: 0.3 }}
      className="flex gap-3 relative"
    >
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            "w-3 h-3 rounded-full border-2 border-[var(--bg-primary)] z-10",
            era.color
          )}
          aria-hidden="true"
        />
        <div
          className="w-px flex-1 bg-[var(--border)]"
          aria-hidden="true"
        />
      </div>

      {/* Card */}
      <button
        onClick={onToggle}
        className={cn(
          "flex-1 text-left rounded-lg p-3 mb-3 transition-all cursor-pointer",
          "bg-[var(--bg-card)] border border-[var(--border)]",
          "active:border-gold/50",
          isExpanded && "border-gold/50"
        )}
        aria-expanded={isExpanded}
        aria-label={`${event.title}, ${event.yearLabel}`}
      >
        <div className="flex items-start gap-2">
          <span
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-md shrink-0",
              era.color,
              "bg-opacity-20"
            )}
          >
            <TimelineIcon
              name={event.icon}
              className="w-3.5 h-3.5 text-gold"
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="heading text-sm text-[var(--text-primary)] leading-tight">
                {event.title}
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-source-sans whitespace-nowrap">
                {event.yearLabel}
              </span>
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 pt-2 border-t border-[var(--border)]"
              >
                <p className="text-xs text-[var(--text-secondary)] font-source-sans leading-relaxed mb-2">
                  {event.description}
                </p>
                <Link
                  href={event.scriptureLink}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors font-source-sans font-medium"
                  aria-label={`Read ${event.scriptureRef}`}
                >
                  <BookOpen className="w-3 h-3" aria-hidden="true" />
                  {event.scriptureRef}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
