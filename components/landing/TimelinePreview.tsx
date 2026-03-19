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
    date: "c. 4000 BC",
    title: "Creation",
    description: "God creates the heavens and the earth in six days",
    era: "Creation",
    imageUrl: "/images/landing/creation-of-adam.jpg",
    imageAlt: "The Creation of Adam by Michelangelo, Sistine Chapel",
  },
  {
    date: "c. 2350 BC",
    title: "The Great Flood",
    description: "God sends a worldwide flood; Noah and his family are saved in the Ark",
    era: "Patriarchs",
    imageUrl: "/images/landing/el-diluvio.jpg",
    imageAlt: "The Deluge by Michelangelo, Sistine Chapel ceiling",
  },
  {
    date: "c. 2000 BC",
    title: "Call of Abraham",
    description: "God calls Abraham to leave Ur and journey to the Promised Land of Canaan",
    era: "Patriarchs",
  },
  {
    date: "c. 1446 BC",
    title: "The Exodus",
    description: "Moses leads Israel out of Egyptian slavery through the parted Red Sea",
    era: "Exodus",
    imageUrl: "/images/landing/moses-ten-commandments.jpg",
    imageAlt: "Moses with the Ten Commandments by Rembrandt",
  },
  {
    date: "c. 1400 BC",
    title: "Conquest of Canaan",
    description: "Joshua leads Israel into the Promised Land; the walls of Jericho fall",
    era: "Conquest",
    imageUrl: "/images/landing/walls-of-jericho.jpg",
    imageAlt: "The Walls of Jericho Fall Down by Gustave Doré",
  },
  {
    date: "c. 1010 BC",
    title: "David Becomes King",
    description: "David slays Goliath and later unites the twelve tribes of Israel",
    era: "United Kingdom",
    imageUrl: "/images/landing/king-david-harp.jpg",
    imageAlt: "King David Playing the Harp by Gerard van Honthorst",
  },
  {
    date: "c. 966 BC",
    title: "Solomon's Temple",
    description: "King Solomon builds the First Temple in Jerusalem",
    era: "United Kingdom",
  },
  {
    date: "586 BC",
    title: "Fall of Jerusalem",
    description: "Nebuchadnezzar destroys the Temple; Judah is exiled to Babylon",
    era: "Exile",
    imageUrl: "/images/landing/temple-destruction.jpg",
    imageAlt: "The Destruction of the Temple of Jerusalem by Francesco Hayez",
  },
  {
    date: "c. 5 BC",
    title: "Birth of Jesus",
    description: "The Messiah is born in Bethlehem of Judea, fulfilling ancient prophecy",
    era: "New Testament",
    imageUrl: "/images/landing/caravaggio-nativity.jpg",
    imageAlt: "Nativity by Caravaggio",
  },
  {
    date: "c. AD 30",
    title: "Crucifixion & Resurrection",
    description: "Jesus is crucified at Golgotha and rises from the dead on the third day",
    era: "New Testament",
    imageUrl: "/images/landing/crucifixion-raphael.jpg",
    imageAlt: "The Crucifixion by Raphael",
  },
  {
    date: "c. AD 50",
    title: "Paul's Missionary Journeys",
    description: "The Apostle Paul spreads the Gospel across the Roman Empire",
    era: "Early Church",
    imageUrl: "/images/landing/conversion-paul.jpg",
    imageAlt: "The Conversion of Saint Paul by Caravaggio",
  },
  {
    date: "c. AD 95",
    title: "Book of Revelation",
    description: "John receives apocalyptic visions on the isle of Patmos",
    era: "Early Church",
    imageUrl: "/images/landing/four-horsemen.jpg",
    imageAlt: "The Four Horsemen of the Apocalypse by Albrecht Dürer",
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
    <section className="py-16 sm:py-24 px-4 overflow-x-clip" aria-label="Timeline Preview">
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
            {TIMELINE_EVENTS.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative flex flex-col items-center w-[160px] sm:w-[200px] flex-shrink-0"
              >
                {/* Date */}
                <span className="font-source-sans text-[11px] leading-4 text-[var(--text-secondary)] mb-2 whitespace-nowrap font-medium">
                  {event.date}
                </span>

                {/* Dot with horizontal connector line */}
                <div className="relative flex items-center justify-center w-full mb-4">
                  {/* Line segment through each item */}
                  <div
                    className="absolute left-0 right-0 h-px bg-[var(--border)]"
                    aria-hidden="true"
                  />
                  <div
                    className="relative z-10 w-3 h-3 rounded-full bg-gold border-2 border-[var(--bg-primary)]"
                    aria-hidden="true"
                  />
                </div>

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
