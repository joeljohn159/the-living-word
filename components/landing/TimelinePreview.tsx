"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  era: string;
  imageUrl?: string;
  imageAlt?: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    date: "c. 2000 BC",
    title: "Call of Abraham",
    description: "God calls Abraham to leave Ur and travel to the Promised Land",
    era: "Patriarchs",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Herrad_von_Landsberg_-_Abrahams_Bosom.jpg/256px-Herrad_von_Landsberg_-_Abrahams_Bosom.jpg",
    imageAlt:
      "Abraham, from Hortus Deliciarum by Herrad of Landsberg (12th century)",
  },
  {
    date: "c. 1446 BC",
    title: "The Exodus",
    description: "Moses leads Israel out of Egyptian bondage",
    era: "Exodus",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Crossing_the_Red_Sea.jpg/256px-Crossing_the_Red_Sea.jpg",
    imageAlt: "Crossing the Red Sea, illustration from a medieval manuscript",
  },
  {
    date: "c. 1400 BC",
    title: "Conquest of Canaan",
    description: "Joshua leads Israel into the Promised Land",
    era: "Conquest",
  },
  {
    date: "c. 1010 BC",
    title: "David Becomes King",
    description: "David unites the twelve tribes of Israel",
    era: "United Kingdom",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/David_SM_Maggiore.jpg/256px-David_SM_Maggiore.jpg",
    imageAlt:
      "King David playing the harp, 13th-century fresco from Santa Maria Maggiore",
  },
  {
    date: "c. 966 BC",
    title: "Solomon's Temple",
    description: "Construction of the First Temple in Jerusalem",
    era: "United Kingdom",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Solomon%27s_Temple.jpg/256px-Solomon%27s_Temple.jpg",
    imageAlt: "Illustration of Solomon's Temple in Jerusalem",
  },
  {
    date: "586 BC",
    title: "Fall of Jerusalem",
    description: "Babylon destroys the Temple and exiles Judah",
    era: "Exile",
  },
  {
    date: "c. 5 BC",
    title: "Birth of Jesus",
    description: "The Messiah is born in Bethlehem of Judea",
    era: "New Testament",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Giotto_-_Scrovegni_-_-17-_-_Nativity%2C_Birth_of_Jesus.jpg/256px-Giotto_-_Scrovegni_-_-17-_-_Nativity%2C_Birth_of_Jesus.jpg",
    imageAlt:
      "Nativity of Jesus by Giotto di Bondone, Scrovegni Chapel (c. 1305)",
  },
  {
    date: "c. AD 30",
    title: "Crucifixion & Resurrection",
    description: "Jesus is crucified and rises from the dead",
    era: "New Testament",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Giotto_-_Scrovegni_-_-35-_-_Crucifixion.jpg/256px-Giotto_-_Scrovegni_-_-35-_-_Crucifixion.jpg",
    imageAlt:
      "Crucifixion of Jesus by Giotto di Bondone, Scrovegni Chapel (c. 1305)",
  },
  {
    date: "c. AD 50",
    title: "Paul's Missionary Journeys",
    description: "The Gospel spreads throughout the Roman Empire",
    era: "Early Church",
  },
  {
    date: "c. AD 95",
    title: "Book of Revelation",
    description: "John receives visions on the isle of Patmos",
    era: "Early Church",
  },
];

/**
 * Horizontal scrollable mini-timeline with era markers and major events.
 */
export function TimelinePreview() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="py-16 sm:py-24 px-4" aria-label="Timeline Preview">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-10"
        >
          <div>
            <p className="font-source-sans text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)] mb-2">
              Biblical History
            </p>
            <h2 className="heading text-3xl sm:text-4xl text-gold">
              Timeline
            </h2>
          </div>

          <div className="hidden sm:flex gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold touch-target"
              aria-label="Scroll timeline left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold touch-target"
              aria-label="Scroll timeline right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Scrollable timeline */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        >
          <div className="relative flex items-start gap-0 min-w-max">
            {/* Horizontal line */}
            <div
              className="absolute top-[38px] left-0 right-0 h-px bg-[var(--border)]"
              aria-hidden="true"
            />

            {TIMELINE_EVENTS.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative flex flex-col items-center w-[140px] sm:w-[180px] flex-shrink-0"
              >
                {/* Date */}
                <span className="font-source-sans text-[11px] text-[var(--text-secondary)] mb-2 whitespace-nowrap font-medium">
                  {event.date}
                </span>

                {/* Dot */}
                <div
                  className="w-3 h-3 rounded-full bg-gold border-2 border-[var(--bg-primary)] z-10 mb-4"
                  aria-hidden="true"
                />

                {/* Card */}
                <div
                  className={cn(
                    "w-full rounded-lg overflow-hidden text-center",
                    "bg-[var(--bg-card)] border border-[var(--border)]",
                    "hover:border-[var(--accent-gold)] transition-colors"
                  )}
                >
                  {/* Thumbnail image */}
                  {event.imageUrl && (
                    <div className="relative w-full h-[60px] sm:h-[80px] overflow-hidden">
                      <Image
                        src={event.imageUrl}
                        alt={event.imageAlt || event.title}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent opacity-40"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <span className="block font-source-sans text-[10px] uppercase tracking-wider text-[var(--accent-gold)] mb-1 font-semibold">
                      {event.era}
                    </span>
                    <h3 className="font-cormorant text-sm font-semibold text-[var(--text-primary)] mb-1">
                      {event.title}
                    </h3>
                    <p className="font-source-sans text-xs text-[var(--text-secondary)] leading-snug">
                      {event.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link
            href="/timeline"
            className="inline-flex items-center gap-2 font-source-sans text-sm text-gold hover:text-gold-light transition-colors"
          >
            Explore Full Timeline &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
