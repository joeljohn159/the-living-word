import type { Metadata } from "next";
import { TimelineView } from "@/components/timeline/TimelineView";

export const metadata: Metadata = {
  title: "Biblical Timeline | The Living Word",
  description:
    "Explore an interactive timeline of major biblical events from Creation to Revelation, spanning over 4,000 years of sacred history.",
};

/**
 * Interactive Biblical Timeline Page
 * Horizontal scrollable timeline (desktop) / vertical layout (mobile)
 * with era markers, major events, scripture references, and zoom controls.
 */
export default function TimelinePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <header className="mb-8">
        <h1 className="heading text-3xl sm:text-4xl text-gold mb-2">
          Biblical Timeline
        </h1>
        <p className="font-source-sans text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
          Journey through over 4,000 years of biblical history — from Creation
          to Revelation. Click any event to explore its scripture.
        </p>
      </header>

      <TimelineView />
    </section>
  );
}
