"use client";

import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { useChapterEvidence } from "@/hooks/use-chapter-evidence";
import { EvidenceCard } from "@/components/media/EvidenceCard";

/**
 * Evidence tab content for the context panel.
 * Fetches evidence linked to the current chapter and renders
 * a scrollable list of compact evidence cards.
 */
export function EvidenceTabContent() {
  const { evidence, loading, error } = useChapterEvidence();

  if (loading) {
    return <EvidenceLoading />;
  }

  if (error) {
    return <EvidenceError message={error} />;
  }

  if (evidence.length === 0) {
    return <EvidenceEmpty />;
  }

  return (
    <div className="space-y-3" role="list" aria-label="Evidence items">
      {evidence.map((item) => (
        <div key={item.id} role="listitem">
          <EvidenceCard
            title={item.title}
            slug={item.slug}
            description={item.description}
            category={item.category}
            dateDiscovered={item.dateDiscovered}
            currentLocation={item.currentLocation}
            significance={item.significance}
            imageUrl={item.imageUrl}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Loading State ──────────────────────────────────────────── */

function EvidenceLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Loader2
        className="h-6 w-6 text-gold animate-spin mb-3"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">Loading evidence...</p>
    </div>
  );
}

/* ─── Error State ────────────────────────────────────────────── */

function EvidenceError({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      role="alert"
    >
      <div className="rounded-full bg-destructive/10 p-3 mb-3">
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground">
        Unable to load evidence.
      </p>
      <p className="text-xs text-muted-foreground mt-1">{message}</p>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────── */

function EvidenceEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gold/10 p-4 mb-4">
        <ShieldCheck className="h-8 w-8 text-gold" aria-hidden="true" />
      </div>
      <h3 className="font-cormorant text-lg font-semibold text-foreground mb-1">
        No Evidence Found
      </h3>
      <p className="text-sm text-muted-foreground max-w-[220px]">
        No archaeological or historical evidence is linked to this chapter yet.
      </p>
    </div>
  );
}
