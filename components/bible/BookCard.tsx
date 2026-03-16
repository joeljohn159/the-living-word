"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { toDisplayCategory, type BookWithSlug } from "@/lib/data/books";

interface BookCardProps {
  book: BookWithSlug;
}

/**
 * Museum-quality dark card displaying a Bible book's metadata.
 * Gold accents, category badge, chapter count, author, and key theme.
 */
export function BookCard({ book }: BookCardProps) {
  const displayCategory = toDisplayCategory(book.category);
  const firstTheme = book.keyThemes.split(",")[0]?.trim() ?? "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link
        href={`/bible/${book.slug}`}
        className={cn(
          "group relative block rounded-lg p-4 sm:p-5",
          "bg-card border border-border",
          "hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5",
          "transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          "touch-target",
        )}
        aria-label={`${book.name} — ${book.chapterCount} chapters`}
      >
        {/* Category badge */}
        <span
          className={cn(
            "absolute top-3 right-3",
            "rounded-full px-2 py-0.5 text-[10px] font-source-sans font-semibold uppercase tracking-wider",
            "border border-gold/30 bg-gold/10 text-gold"
          )}
        >
          {displayCategory}
        </span>

        {/* Book icon + name */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              "bg-gold/10 text-gold",
              "group-hover:bg-gold/20 transition-colors"
            )}
            aria-hidden="true"
          >
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-cormorant text-lg font-semibold text-foreground leading-tight group-hover:text-gold transition-colors">
              {book.name}
            </h3>
            <p className="text-xs font-source-sans text-muted-foreground mt-0.5">
              {book.chapterCount} {book.chapterCount === 1 ? "chapter" : "chapters"}
            </p>
          </div>
        </div>

        {/* Author */}
        <p className="text-xs font-source-sans text-muted-foreground mb-2 truncate">
          <span className="text-gold/70">Author:</span>{" "}
          {book.author}
        </p>

        {/* Key theme */}
        {firstTheme && (
          <p className="text-xs font-source-sans text-[var(--text-secondary)] italic truncate">
            {firstTheme}
          </p>
        )}

        {/* Bottom accent line */}
        <div
          className={cn(
            "absolute bottom-0 left-4 right-4 h-px",
            "bg-gradient-to-r from-transparent via-gold/30 to-transparent",
            "group-hover:via-gold/60 transition-all"
          )}
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}
