"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import { cn } from "@/lib/utils";

/**
 * Floating badge shown when Dictionary Mode is active.
 * Displays "Dictionary Mode ON" with keyboard hints to exit.
 */
export function DictionaryModeBadge() {
  const dictionaryMode = usePreferencesStore((s) => s.dictionaryMode);

  return (
    <AnimatePresence>
      {dictionaryMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "fixed top-20 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30",
            "backdrop-blur-sm shadow-lg shadow-black/10"
          )}
          role="status"
          aria-live="polite"
        >
          <BookOpen className="w-4 h-4 text-[var(--accent-gold)]" />
          <span className="text-sm font-source-sans text-[var(--accent-gold)] font-medium">
            Dictionary Mode ON
          </span>
          <span className="hidden sm:inline text-xs text-[var(--text-muted)]">
            — press D or Esc to exit
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
