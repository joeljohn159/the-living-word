import type { Metadata } from "next";
import { BookGrid } from "@/components/bible/BookGrid";

export const metadata: Metadata = {
  title: "Browse the Bible",
  description:
    "Explore all 66 books of the King James Bible. Filter by testament and category to find any book instantly.",
};

/**
 * Book Browser Page — visual grid of all 66 Bible books
 * with OT/NT toggle and category filtering.
 */
export default function BiblePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <header className="mb-10">
        <h1 className="heading text-3xl sm:text-4xl text-gold mb-2">
          The Books of the Bible
        </h1>
        <p className="font-source-sans text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
          Explore all 66 books of the King James Bible. Filter by testament or
          category to find any book.
        </p>
      </header>

      <BookGrid />
    </section>
  );
}
