"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MapPin, BookOpen } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { JourneyWithStops } from "./types";

const JourneyMapInner = dynamic(() => import("./JourneyMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[var(--bg-card)]">
      <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-gold)]" />
        <span className="text-xs">Loading map&hellip;</span>
      </div>
    </div>
  ),
});

interface JourneyViewProps {
  journey: JourneyWithStops;
}

/**
 * Journey detail view with animated route map and stop list.
 */
export function JourneyView({ journey }: JourneyViewProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-8 md:py-12 px-4 border-b border-[var(--border-primary)]">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/maps"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Maps
          </Link>

          <h1 className="heading text-3xl md:text-5xl text-gold mb-2">
            {journey.name}
          </h1>

          {journey.personName && (
            <p className="font-source-sans text-sm md:text-base text-[var(--accent-gold)] mb-2">
              {journey.personName}
            </p>
          )}

          {journey.description && (
            <p className="font-source-sans text-base md:text-lg text-[var(--text-secondary)] max-w-3xl">
              {journey.description}
            </p>
          )}

          <p className="text-sm text-[var(--text-muted)] mt-2">
            {journey.stops.length} stops along the route
          </p>
        </div>
      </section>

      {/* Map */}
      <section className="h-[50vh] md:h-[60vh] w-full">
        <JourneyMapInner journey={journey} />
      </section>

      {/* Stops list */}
      <section className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <h2 className="font-cormorant text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6">
          Journey Stops
        </h2>

        <ol className="relative border-l-2 border-[var(--border-primary)] ml-4 space-y-6">
          {journey.stops.map((stop, index) => (
            <li key={stop.id} className="relative pl-8">
              {/* Timeline dot */}
              <span
                className="absolute -left-[11px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
                style={{
                  backgroundColor:
                    index === 0
                      ? "#4CAF50"
                      : index === journey.stops.length - 1
                        ? "#F44336"
                        : journey.color || "#C4975C",
                  borderColor: "var(--bg-primary)",
                  color: "#1E1E35",
                }}
              >
                {stop.stopOrder}
              </span>

              <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <MapPin
                    className="h-4 w-4 mt-0.5 flex-shrink-0"
                    style={{ color: journey.color || "#C4975C" }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-cormorant text-lg font-bold text-[var(--text-primary)]">
                      {stop.name}
                    </h3>

                    {stop.description && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {stop.description}
                      </p>
                    )}

                    {stop.scriptureRef && (
                      <p className="flex items-center gap-1 text-xs text-[var(--accent-gold)] mt-2 italic">
                        <BookOpen className="h-3 w-3" />
                        {stop.scriptureRef}
                      </p>
                    )}

                    {stop.latitude && stop.longitude && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        {stop.latitude.toFixed(4)}°N, {stop.longitude.toFixed(4)}°E
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
