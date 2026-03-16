import type { Metadata } from "next";
import { Suspense } from "react";

import { getAllEvidence, getEvidenceCategoryCounts } from "@/lib/db/queries";
import { EvidenceFilters } from "@/components/evidence/EvidenceFilters";
import { EvidenceGrid } from "@/components/evidence/EvidenceGrid";

export const metadata: Metadata = {
  title: "Archaeological Evidence",
  description:
    "Explore archaeological discoveries, ancient manuscripts, inscriptions, and artifacts that illuminate the historical accuracy of the Bible.",
  openGraph: {
    title: "Archaeological Evidence | The Living Word",
    description:
      "Explore archaeological discoveries, ancient manuscripts, inscriptions, and artifacts that illuminate the historical accuracy of the Bible.",
  },
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function EvidencePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const [items, counts] = await Promise.all([
    getAllEvidence(category),
    getEvidenceCategoryCounts(),
  ]);

  const totalCount = Object.values(counts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="heading text-4xl md:text-6xl text-gold mb-4">
            Archaeological Evidence
          </h1>
          <p className="font-source-sans text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-2">
            Discoveries that illuminate the historical accuracy of Scripture
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {totalCount} artifacts and discoveries
          </p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-24">
        <div className="mb-8">
          <Suspense fallback={<div className="h-10" />}>
            <EvidenceFilters counts={counts} totalCount={totalCount} />
          </Suspense>
        </div>

        <EvidenceGrid items={items} />
      </section>
    </div>
  );
}
