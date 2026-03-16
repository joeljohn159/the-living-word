"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface LocationPin {
  name: string;
  lat: number;
  lng: number;
}

const KEY_LOCATIONS: LocationPin[] = [
  { name: "Jerusalem", lat: 31.77, lng: 35.23 },
  { name: "Bethlehem", lat: 31.7, lng: 35.2 },
  { name: "Nazareth", lat: 32.7, lng: 35.3 },
  { name: "Capernaum", lat: 32.88, lng: 35.57 },
  { name: "Mount Sinai", lat: 28.54, lng: 33.97 },
  { name: "Jericho", lat: 31.87, lng: 35.44 },
  { name: "Babylon", lat: 32.54, lng: 44.42 },
  { name: "Damascus", lat: 33.51, lng: 36.29 },
];

/**
 * Stylised map preview with key biblical location pins.
 * Uses a decorative representation (not a real Leaflet map)
 * for the landing page, with a link to the full interactive map.
 */
export function MapPreview() {
  return (
    <section className="py-16 sm:py-24 px-4" aria-label="Map Preview">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="font-source-sans text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)] mb-2">
            Interactive Maps
          </p>
          <h2 className="heading text-3xl sm:text-4xl text-gold">
            The Biblical World
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xl"
        >
          {/* Decorative map background */}
          <div className="relative h-[300px] sm:h-[400px] bg-gradient-to-br from-[#1a1f2e] via-[#1e2438] to-[#151927]">
            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(196,151,92,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(196,151,92,0.3) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
              aria-hidden="true"
            />

            {/* Location pins */}
            {KEY_LOCATIONS.map((loc, i) => {
              // Map lat/lng to percentage positions (approximate visual placement)
              const x = ((loc.lng - 28) / 20) * 100;
              const y = ((35 - loc.lat) / 10) * 100;

              return (
                <motion.div
                  key={loc.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="absolute group"
                  style={{
                    left: `${Math.min(Math.max(x, 5), 90)}%`,
                    top: `${Math.min(Math.max(y, 5), 85)}%`,
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    <MapPin
                      className="w-5 h-5 text-gold drop-shadow-lg group-hover:text-gold-light transition-colors"
                      aria-hidden="true"
                    />
                    <span className="absolute top-6 whitespace-nowrap font-source-sans text-[10px] sm:text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)]/80 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {loc.name}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Center CTA overlay */}
            <div className="absolute inset-0 flex items-end justify-center pb-8">
              <Link
                href="/maps"
                className="inline-flex items-center gap-2 bg-gold/90 hover:bg-gold text-[var(--bg-primary)] px-6 py-3 rounded-lg font-source-sans font-semibold text-sm transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                Explore Biblical World &rarr;
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-t border-[var(--border)]">
            {[
              { label: "Locations", value: "100+" },
              { label: "Journeys", value: "5+" },
              { label: "Regions", value: "12+" },
            ].map((stat) => (
              <div key={stat.label} className="py-4 text-center">
                <p className="font-cormorant text-xl sm:text-2xl font-semibold text-gold">
                  {stat.value}
                </p>
                <p className="font-source-sans text-xs text-[var(--text-muted)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
