"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TestamentFilter } from "@/components/bible/TestamentFilter";
import { CategoryFilter } from "@/components/bible/CategoryFilter";
import { BookCard } from "@/components/bible/BookCard";
import {
  ALL_BOOKS,
  toDisplayCategory,
  type DisplayCategory,
} from "@/lib/data/books";

type Testament = "ALL" | "OT" | "NT";

/**
 * Interactive grid of all 66 Bible books with testament and category filters.
 * Uses Framer Motion for animated transitions between filter states.
 */
export function BookGrid() {
  const [testament, setTestament] = useState<Testament>("ALL");
  const [category, setCategory] = useState<DisplayCategory | "ALL">("ALL");

  const filteredBooks = useMemo(() => {
    return ALL_BOOKS.filter((book) => {
      if (testament !== "ALL" && book.testament !== testament) return false;
      if (category !== "ALL" && toDisplayCategory(book.category) !== category)
        return false;
      return true;
    });
  }, [testament, category]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <TestamentFilter value={testament} onChange={setTestament} />
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      {/* Result count */}
      <p className="mb-4 text-sm font-source-sans text-muted-foreground">
        Showing{" "}
        <span className="text-gold font-semibold">{filteredBooks.length}</span>{" "}
        {filteredBooks.length === 1 ? "book" : "books"}
      </p>

      {/* Grid — single column on small mobile, 2 on tablet, 3 on medium, 4 on desktop */}
      <motion.div
        layout
        className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredBooks.map((book) => (
            <BookCard key={book.sortOrder} book={book} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredBooks.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-cormorant text-xl text-muted-foreground">
            No books match your filters.
          </p>
          <button
            onClick={() => {
              setTestament("ALL");
              setCategory("ALL");
            }}
            className="mt-4 text-sm font-source-sans text-gold hover:text-gold-light transition-colors underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
