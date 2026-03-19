"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, BookOpen, Landmark, ScrollText, Pickaxe, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterEvidence {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  dateDiscovered: string | null;
  locationFound: string | null;
  currentLocation: string | null;
  significance: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
}

type FetchState = "idle" | "loading" | "success" | "error";

function getCategoryIcon(category: string) {
  switch (category) {
    case "manuscript":
      return ScrollText;
    case "archaeology":
      return Pickaxe;
    case "inscription":
      return Landmark;
    case "artifact":
      return Archive;
    default:
      return BookOpen;
  }
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    manuscript: "Manuscript",
    archaeology: "Archaeological Site",
    inscription: "Ancient Inscription",
    artifact: "Historical Artifact",
  };
  return labels[category] || category;
}

/**
 * Study tab content for the context panel.
 * Shows archaeological evidence and artifacts related to the current chapter.
 */
export function StudyTabContent() {
  const pathname = usePathname();
  const [evidence, setEvidence] = useState<ChapterEvidence[]>([]);
  const [state, setState] = useState<FetchState>("idle");

  const segments = pathname?.split("/") ?? [];
  const bookSlug = segments[2] ?? "";
  const chapter = segments[3] ?? "";

  useEffect(() => {
    if (!bookSlug || !chapter) {
      setState("idle");
      setEvidence([]);
      return;
    }

    let cancelled = false;

    async function fetchEvidence() {
      setState("loading");
      try {
        const res = await fetch(
          `/api/evidence/chapter?book=${encodeURIComponent(bookSlug)}&chapter=${encodeURIComponent(chapter)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setEvidence(Array.isArray(data) ? data : data.evidence ?? []);
          setState("success");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }

    fetchEvidence();
    return () => { cancelled = true; };
  }, [bookSlug, chapter]);

  if (state === "idle") {
    return <StudyEmpty />;
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="status">
        <Loader2 className="h-6 w-6 text-[var(--accent-gold)] animate-spin" />
        <p className="mt-3 text-sm text-[var(--text-muted)]">Loading evidence&hellip;</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4" role="alert">
        <p className="text-sm text-red-400">Could not load evidence for this chapter.</p>
      </div>
    );
  }

  if (evidence.length === 0) {
    return <StudyEmpty />;
  }

  return (
    <div className="flex flex-col gap-2 px-1">
      <p className="text-xs text-[var(--text-muted)] px-1 mb-1">
        {evidence.length} archaeological {evidence.length === 1 ? "item" : "items"} related
      </p>
      <ul className="flex flex-col gap-3" role="list" aria-label="Evidence for this chapter">
        {evidence.map((item) => {
          const Icon = getCategoryIcon(item.category);
          return (
            <li key={item.id}>
              <a
                href={`/evidence/${item.slug}`}
                className={cn(
                  "block rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]",
                  "overflow-hidden transition-colors hover:border-[var(--accent-gold)]/40",
                )}
              >
                {/* Image */}
                {item.imageUrl && (
                  <div className="relative h-28 overflow-hidden bg-[var(--bg-tertiary)]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        "bg-black/60 text-white backdrop-blur-sm",
                      )}>
                        <Icon className="w-3 h-3" />
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                    {item.title}
                  </h4>
                  {item.dateDiscovered && (
                    <p className="text-[10px] text-[var(--accent-gold)] mt-0.5">
                      Discovered: {item.dateDiscovered}
                    </p>
                  )}
                  {item.significance && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-3">
                      {item.significance}
                    </p>
                  )}
                  {item.currentLocation && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                      {item.currentLocation}
                    </p>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      <a
        href="/evidence"
        className={cn(
          "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg mt-1",
          "text-xs text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-colors",
        )}
      >
        <Landmark className="w-3.5 h-3.5" />
        Explore all evidence
      </a>
    </div>
  );
}

function StudyEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-3 rounded-full bg-[var(--bg-tertiary)] mb-3">
        <BookOpen className="w-6 h-6 text-[var(--text-muted)]" />
      </div>
      <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
        No Evidence Linked
      </p>
      <p className="text-xs text-[var(--text-muted)] max-w-[200px]">
        No archaeological evidence is linked to this chapter yet.
      </p>
      <a
        href="/evidence"
        className="mt-3 text-xs text-[var(--accent-gold)] hover:underline"
      >
        Browse all evidence
      </a>
    </div>
  );
}
