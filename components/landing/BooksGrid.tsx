"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ALL_BOOKS,
  DISPLAY_CATEGORIES,
  toDisplayCategory,
  type DisplayCategory,
} from "@/lib/data/books";

const MANUSCRIPT_BG_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Codex_Vaticanus_B%2C_2Thess._3%2C11-18%2C_Hebr._1%2C1-2%2C2.jpg/800px-Codex_Vaticanus_B%2C_2Thess._3%2C11-18%2C_Hebr._1%2C1-2%2C2.jpg";

type Testament = "all" | "OT" | "NT";

/**
 * Quick Navigation grid of 66 books organized by category
 * with OT/NT toggle and category filter.
 */
export function BooksGrid() {
  const [testament, setTestament] = useState<Testament>("all");
  const [activeCategory, setActiveCategory] = useState<
    DisplayCategory | "All"
  >("All");

  const filteredBooks = ALL_BOOKS.filter((book) => {
    if (testament !== "all" && book.testament !== testament) return false;
    if (activeCategory !== "All" && toDisplayCategory(book.category) !== activeCategory) return false;
    return true;
  });

  return (
    <section
      className="py-16 sm:py-24 px-4 relative overflow-hidden"
      aria-label="Quick Navigation"
    >
      {/* Subtle manuscript texture background */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={MANUSCRIPT_BG_URL}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "var(--bg-primary)",
            opacity: 0.92,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="heading text-3xl sm:text-4xl text-gold mb-3">
            Explore the Scriptures
          </h2>
          <p className="font-source-sans text-[var(--text-secondary)] max-w-lg mx-auto">
            All 66 books of the King James Bible, organized by category
          </p>
        </motion.div>

        {/* Testament toggle */}
        <div className="flex justify-center gap-2 mb-6" role="tablist" aria-label="Filter by testament">
          {(["all", "OT", "NT"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={testament === t}
              onClick={() => setTestament(t)}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-lg font-source-sans text-xs sm:text-sm font-medium transition-colors touch-target",
                testament === t
                  ? "bg-gold text-[var(--bg-primary)]"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t === "all" ? "All" : t === "OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-8"
          role="tablist"
          aria-label="Filter by category"
        >
          <button
            role="tab"
            aria-selected={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
            className={cn(
              "px-3 py-2 sm:py-1.5 rounded-md font-source-sans text-xs font-medium transition-colors touch-target",
              activeCategory === "All"
                ? "bg-[var(--accent-gold-dark)] text-[var(--bg-primary)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            All
          </button>
          {DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-2 sm:py-1.5 rounded-md font-source-sans text-xs font-medium transition-colors touch-target",
                activeCategory === cat
                  ? "bg-[var(--accent-gold-dark)] text-[var(--bg-primary)]"
                  : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Books grid */}
        <motion.div
          layout
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 sm:gap-2"
        >
          {filteredBooks.map((book, i) => (
            <motion.div
              key={book.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.5) }}
            >
              <Link
                href={`/bible/${book.slug}`}
                className={cn(
                  "block rounded-lg p-2 sm:p-2.5 text-center transition-all duration-200 touch-target",
                  "bg-[var(--bg-card)] border border-[var(--border)]",
                  "hover:border-[var(--accent-gold)] hover:bg-[var(--bg-tertiary)]",
                  "focus:outline-none focus:ring-2 focus:ring-gold",
                  "group"
                )}
                title={book.name}
              >
                <span className="block font-source-sans text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-0.5 group-hover:text-[var(--accent-gold)] transition-colors font-medium">
                  {book.abbreviation}
                </span>
                <span className="block font-cormorant text-xs sm:text-sm text-[var(--text-primary)] truncate group-hover:text-gold transition-colors">
                  {book.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filteredBooks.length === 0 && (
          <p className="text-center text-[var(--text-muted)] font-source-sans mt-8">
            No books match the current filter.
          </p>
        )}
      </div>
    </section>
  );
}
