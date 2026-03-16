"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

/**
 * Prominent search bar with keyboard shortcut hint.
 */
export function SearchSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [query, router],
  );

  return (
    <section
      className="py-16 sm:py-24 px-4 bg-[var(--bg-secondary)]"
      aria-label="Search the Scriptures"
    >
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading text-3xl sm:text-4xl text-gold mb-3">
            Search the Scriptures
          </h2>
          <p className="font-source-sans text-[var(--text-secondary)] mb-8">
            Search across all 31,102 verses of the King James Bible
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="relative"
        >
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-gold transition-colors"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search verses, books, or topics..."
              className="w-full pl-12 pr-24 py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-source-sans text-base placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
              aria-label="Search the Bible"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-source-sans text-xs border border-[var(--border)]">
                /
              </kbd>
            </div>
          </div>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="font-source-sans text-xs text-[var(--text-muted)] mt-4"
        >
          Try &ldquo;In the beginning&rdquo;, &ldquo;love&rdquo;, or
          &ldquo;Psalm 23&rdquo;
        </motion.p>
      </div>
    </section>
  );
}
