"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export interface ArtworkData {
  title: string;
  artist: string;
  yearCreated: string;
  imageUrl: string;
  description: string;
  attribution: string;
}

const FALLBACK_ARTWORK: ArtworkData = {
  title: "The Creation of Adam",
  artist: "Michelangelo",
  yearCreated: "c. 1508-1512",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
  description:
    "One of the most iconic images in art history, depicting the moment God gives life to Adam. Painted on the ceiling of the Sistine Chapel in Vatican City.",
  attribution: "Wikimedia Commons, Public Domain",
};

interface ArtworkOfDayProps {
  artwork?: ArtworkData;
}

/**
 * Artwork of the Day — rotating painting with context and attribution.
 */
export function ArtworkOfDay({ artwork }: ArtworkOfDayProps) {
  const art = artwork ?? FALLBACK_ARTWORK;

  return (
    <section
      className="py-16 sm:py-24 px-4 bg-[var(--bg-secondary)]"
      aria-label="Artwork of the Day"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="font-source-sans text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)] mb-2">
            Featured Masterpiece
          </p>
          <h2 className="heading text-3xl sm:text-4xl text-gold">
            Artwork of the Day
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[var(--border)] shadow-2xl">
            <Image
              src={art.imageUrl}
              alt={`${art.title} by ${art.artist}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
              {art.title}
            </h3>
            <p className="font-source-sans text-[var(--accent-gold)] text-sm">
              {art.artist} &middot; {art.yearCreated}
            </p>
            <p className="font-source-sans text-[var(--text-secondary)] leading-relaxed">
              {art.description}
            </p>
            <p className="font-source-sans text-xs text-[var(--text-muted)]">
              {art.attribution}
            </p>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 font-source-sans text-sm text-gold hover:text-gold-light transition-colors mt-4"
            >
              Explore Gallery &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
