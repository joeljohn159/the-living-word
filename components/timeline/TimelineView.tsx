"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TIMELINE_ERAS,
  TIMELINE_EVENTS,
  type TimelineEvent,
} from "@/data/timeline-events";
import { EraLegend } from "./EraLegend";
import { EraBar } from "./EraBar";
import { ZoomControls } from "./ZoomControls";
import {
  TimelineEventCard,
  TimelineEventCardMobile,
} from "./TimelineEventCard";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

/**
 * Main interactive timeline component.
 * - Desktop: horizontal scrollable with events above/below the axis
 * - Mobile: vertical list layout
 */
export function TimelineView() {
  const [zoom, setZoom] = useState(1);
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handleToggleEvent = useCallback((eventId: string) => {
    setExpandedEvent((prev) => (prev === eventId ? null : eventId));
  }, []);

  const handleEraClick = useCallback(
    (eraId: string | null) => {
      setActiveEra(eraId);
      if (eraId && scrollRef.current) {
        const eraElement = scrollRef.current.querySelector(
          `[data-era="${eraId}"]`
        );
        eraElement?.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    },
    []
  );

  // Filter events by active era
  const filteredEvents = useMemo(
    () =>
      activeEra
        ? TIMELINE_EVENTS.filter((e) => e.eraId === activeEra)
        : TIMELINE_EVENTS,
    [activeEra]
  );

  // Compute total timeline range
  const totalRange = useMemo(
    () => ({
      start: TIMELINE_ERAS[0].startYear,
      end: TIMELINE_ERAS[TIMELINE_ERAS.length - 1].endYear,
    }),
    []
  );

  const totalSpan = totalRange.end - totalRange.start;

  // Compute event positions as percentages
  const getEventPosition = useCallback(
    (event: TimelineEvent) => {
      return ((event.year - totalRange.start) / totalSpan) * 100;
    },
    [totalRange.start, totalSpan]
  );

  // Handle keyboard zoom
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleResetZoom();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <EraLegend
          eras={TIMELINE_ERAS}
          activeEra={activeEra}
          onEraClick={handleEraClick}
        />
        <div className="hidden lg:block">
          <ZoomControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleResetZoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
          />
        </div>
      </div>

      {/* Desktop: horizontal timeline */}
      <div className="hidden lg:block">
        <DesktopTimeline
          events={filteredEvents}
          zoom={zoom}
          scrollRef={scrollRef}
          expandedEvent={expandedEvent}
          onToggleEvent={handleToggleEvent}
          getEventPosition={getEventPosition}
          totalRange={totalRange}
        />
      </div>

      {/* Mobile: vertical timeline */}
      <div className="lg:hidden">
        <MobileTimeline
          events={filteredEvents}
          expandedEvent={expandedEvent}
          onToggleEvent={handleToggleEvent}
        />
      </div>

      {/* Keyboard hints (desktop only) */}
      <p className="hidden lg:block text-xs text-[var(--text-muted)] font-source-sans text-center">
        Use <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono text-[10px]">+</kbd>{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-mono text-[10px]">-</kbd>{" "}
        to zoom &middot; Scroll horizontally to explore &middot; Click events for details
      </p>
    </div>
  );
}

/* ----- Desktop horizontal timeline ----- */

interface DesktopTimelineProps {
  events: TimelineEvent[];
  zoom: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  expandedEvent: string | null;
  onToggleEvent: (id: string) => void;
  getEventPosition: (event: TimelineEvent) => number;
  totalRange: { start: number; end: number };
}

function DesktopTimeline({
  events,
  zoom,
  scrollRef,
  expandedEvent,
  onToggleEvent,
  getEventPosition,
  totalRange,
}: DesktopTimelineProps) {
  const CARD_WIDTH = 200; // px width of each card (w-48 = 192px + margin)
  const baseWidth = Math.max(2400, events.length * CARD_WIDTH * 0.7);
  const timelineWidth = baseWidth * zoom;

  // Compute non-overlapping left positions for event cards
  // Split into top row (even index) and bottom row (odd index)
  const cardPositions = useMemo(() => {
    const positions: number[] = [];
    const topUsed: number[] = []; // right edges of placed top cards
    const bottomUsed: number[] = []; // right edges of placed bottom cards

    for (let i = 0; i < events.length; i++) {
      const naturalLeft =
        (getEventPosition(events[i]) / 100) * timelineWidth;
      const used = i % 2 === 0 ? topUsed : bottomUsed;

      // Find the minimum left that doesn't overlap any card in this row
      let left = naturalLeft;
      for (const rightEdge of used) {
        if (left < rightEdge + 8) {
          // 8px gap between cards
          left = rightEdge + 8;
        }
      }
      positions.push(left);
      used.push(left + CARD_WIDTH);
    }
    return positions;
  }, [events, getEventPosition, timelineWidth]);

  // Ensure timeline is wide enough for all positioned cards
  const maxRight = Math.max(
    timelineWidth,
    ...cardPositions.map((l) => l + CARD_WIDTH + 40)
  );

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto overflow-y-visible pb-4 scrollbar-thin"
      role="region"
      aria-label="Biblical timeline"
      tabIndex={0}
    >
      <motion.div
        layout
        transition={{ duration: 0.3 }}
        style={{ width: `${maxRight}px` }}
        className="relative min-h-[420px]"
      >
        {/* Era bar at the top */}
        <div className="mb-6">
          <EraBar eras={TIMELINE_ERAS} totalRange={totalRange} />
        </div>

        {/* Central timeline axis */}
        <div className="absolute top-[200px] left-0 right-0 h-px bg-[var(--border)]">
          {/* Era labels along the axis */}
          {TIMELINE_ERAS.map((era) => {
            const leftPercent =
              ((era.startYear - totalRange.start) /
                (totalRange.end - totalRange.start)) *
              100;
            const widthPercent =
              ((era.endYear - era.startYear) /
                (totalRange.end - totalRange.start)) *
              100;
            return (
              <div
                key={era.id}
                data-era={era.id}
                className="absolute top-2 text-[10px] font-source-sans text-[var(--text-muted)] truncate"
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
              >
                {era.label}
              </div>
            );
          })}
        </div>

        {/* Event cards */}
        {events.map((event, i) => {
          const era = TIMELINE_ERAS.find((e) => e.id === event.eraId)!;

          return (
            <div
              key={event.id}
              className="absolute"
              style={
                {
                  "--event-left": "0px",
                  left: `${cardPositions[i]}px`,
                  top: i % 2 === 0 ? "40px" : "220px",
                } as React.CSSProperties
              }
            >
              <TimelineEventCard
                event={event}
                era={era}
                index={i}
                isExpanded={expandedEvent === event.id}
                onToggle={() => onToggleEvent(event.id)}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/* ----- Mobile vertical timeline ----- */

interface MobileTimelineProps {
  events: TimelineEvent[];
  expandedEvent: string | null;
  onToggleEvent: (id: string) => void;
}

function MobileTimeline({
  events,
  expandedEvent,
  onToggleEvent,
}: MobileTimelineProps) {
  // Group events by era for section headers
  let currentEraId = "";

  return (
    <div role="list" aria-label="Biblical timeline events">
      {events.map((event, i) => {
        const era = TIMELINE_ERAS.find((e) => e.id === event.eraId)!;
        const showEraHeader = event.eraId !== currentEraId;
        if (showEraHeader) currentEraId = event.eraId;

        return (
          <div key={event.id} role="listitem">
            {showEraHeader && (
              <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
                <span
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0",
                    era.color
                  )}
                  aria-hidden="true"
                />
                <h2 className="heading text-base text-gold">
                  {era.label}
                </h2>
                <div
                  className="flex-1 h-px bg-[var(--border)]"
                  aria-hidden="true"
                />
              </div>
            )}
            <TimelineEventCardMobile
              event={event}
              era={era}
              index={i}
              isExpanded={expandedEvent === event.id}
              onToggle={() => onToggleEvent(event.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
