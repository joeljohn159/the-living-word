"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EvidenceItem {
  title: string;
  category: string;
  locationFound: string;
  significance: string;
  imageUrl: string;
  slug: string;
}

const FALLBACK_EVIDENCE: EvidenceItem[] = [
  {
    title: "Dead Sea Scrolls",
    category: "manuscript",
    locationFound: "Qumran, West Bank",
    significance:
      "The oldest known copies of Hebrew Bible texts, dating from the 3rd century BC to the 1st century AD, confirming remarkable textual preservation.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Dead_Sea_Scroll_-_Great_Isaiah_Scroll.jpg/800px-Dead_Sea_Scroll_-_Great_Isaiah_Scroll.jpg",
    slug: "dead-sea-scrolls",
  },
  {
    title: "Tel Dan Stele",
    category: "inscription",
    locationFound: "Tel Dan, Israel",
    significance:
      "A 9th-century BC inscription containing the earliest known reference to the 'House of David' outside the Bible.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Tel_Dan_Stele.jpg/440px-Tel_Dan_Stele.jpg",
    slug: "tel-dan-stele",
  },
  {
    title: "Pilate Stone",
    category: "inscription",
    locationFound: "Caesarea Maritima, Israel",
    significance:
      "A limestone block with a Latin inscription mentioning Pontius Pilate as prefect of Judaea, confirming the historical existence of the Roman governor.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Pontius_Pilate_Inscription.jpg/440px-Pontius_Pilate_Inscription.jpg",
    slug: "pilate-stone",
  },
];

interface EvidenceSpotlightProps {
  items?: EvidenceItem[];
}

/**
 * Evidence Spotlight — 3-card horizontally scrollable carousel
 * of archaeological evidence items.
 */
export function EvidenceSpotlight({ items }: EvidenceSpotlightProps) {
  const evidence = items?.length ? items : FALLBACK_EVIDENCE;
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section
      className="py-16 sm:py-24 px-4 bg-[var(--bg-secondary)] overflow-x-clip"
      aria-label="Evidence Spotlight"
    >
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
              Archaeological Discoveries
            </p>
            <h2 className="heading text-3xl sm:text-4xl text-gold">
              Evidence Spotlight
            </h2>
          </div>

          {/* Scroll controls */}
          <div className="hidden sm:flex gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
          role="list"
        >
          {evidence.map((item, i) => (
            <motion.article
              key={item.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "flex-shrink-0 w-[80vw] sm:w-[340px] snap-start",
                "rounded-xl border border-[var(--border)] bg-[var(--bg-card)]",
                "overflow-hidden hover:border-[var(--accent-gold)] transition-colors",
                "group"
              )}
              role="listitem"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 85vw, 340px"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="font-source-sans text-[11px] uppercase tracking-wider bg-[var(--accent-gold)] text-white px-2 py-1 rounded backdrop-blur-sm font-medium">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <h3 className="font-cormorant text-xl font-semibold text-[var(--text-primary)] group-hover:text-gold transition-colors">
                  {item.title}
                </h3>
                <p className="font-source-sans text-xs text-[var(--accent-gold)]">
                  {item.locationFound}
                </p>
                <p className="font-source-sans text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {item.significance}
                </p>
                <Link
                  href={`/evidence/${item.slug}`}
                  className="inline-block font-source-sans text-sm text-gold hover:text-gold-light transition-colors pt-1"
                >
                  Learn more &rarr;
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
