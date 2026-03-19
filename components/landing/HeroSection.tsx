"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface HeroSectionProps {
  verseText: string;
  verseRef: string;
}

/**
 * Full-viewport hero with Bible painting background, theme-aware overlay,
 * parallax scroll effect, featured verse, and CTA.
 */
export function HeroSection({ verseText, verseRef }: HeroSectionProps) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      if (!bgRef.current) return;
      const offset = window.scrollY * 0.35;
      bgRef.current.style.transform = `translateY(${offset}px)`;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="relative h-[calc(100dvh-4rem)] min-h-[500px] sm:min-h-[600px] flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background painting with parallax */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-20 -bottom-20 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage:
            "url('/images/landing/creation-of-adam.jpg')",
        }}
        aria-hidden="true"
      />

      {/* Theme-aware overlay using CSS variables */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--hero-overlay-from), var(--hero-overlay-via), var(--hero-overlay-to))",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-4 sm:px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-source-sans text-xs uppercase tracking-[0.3em] text-[var(--accent-gold)] mb-4"
        >
          King James Version
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="heading text-4xl sm:text-5xl md:text-6xl lg:text-8xl tracking-wide text-gold mb-4 sm:mb-6 leading-[1.1]"
        >
          The Living Word
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-source-sans text-sm sm:text-base md:text-lg lg:text-xl text-[var(--text-secondary)] mb-6 sm:mb-8 max-w-xl mx-auto"
        >
          Illuminated with History, Art, and Archaeological Evidence
        </motion.p>

        {/* Featured verse */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mb-3"
        >
          <p className="scripture text-lg sm:text-xl md:text-2xl lg:text-3xl italic text-scripture leading-relaxed">
            &ldquo;{verseText}&rdquo;
          </p>
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-xs sm:text-sm text-[var(--text-muted)] mb-8 sm:mb-10 font-source-sans"
        >
          {verseRef}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Link
            href="/bible"
            className="inline-flex items-center gap-2 bg-gold text-[var(--primary-foreground)] px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-source-sans font-semibold text-base sm:text-lg hover:bg-gold-light transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] touch-target"
            aria-label="Begin reading the Bible"
          >
            Begin Reading &rarr;
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="w-6 h-10 rounded-full border-2 border-[var(--text-muted)] flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-gold"
          />
        </div>
      </motion.div>
    </section>
  );
}
