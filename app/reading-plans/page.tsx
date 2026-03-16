import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { READING_PLANS } from "@/lib/reading-plans-data";
import { ReadingPlansList } from "./ReadingPlansList";

export const metadata: Metadata = {
  title: "Reading Plans",
  description:
    "Structured Bible reading plans to guide your daily scripture study. Choose from Bible in a Year, New Testament in 90 Days, and more.",
};

export default function ReadingPlansPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-fade-in">
      {/* Page header */}
      <div className="mb-8 sm:mb-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <BookOpen className="h-6 w-6 text-gold" aria-hidden="true" />
          <h1 className="heading text-3xl sm:text-4xl md:text-5xl text-gold">
            Reading Plans
          </h1>
        </div>
        <p className="font-source-sans text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Follow a structured plan to guide your daily Bible reading.
          Track your progress as you journey through Scripture.
        </p>
      </div>

      {/* Plan cards — client component for Zustand access */}
      <ReadingPlansList plans={READING_PLANS} />
    </section>
  );
}
