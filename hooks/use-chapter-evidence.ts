"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export interface EvidenceItem {
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

interface UseChapterEvidenceResult {
  evidence: EvidenceItem[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches evidence items linked to the current chapter
 * based on URL params (bookSlug, chapter).
 */
export function useChapterEvidence(): UseChapterEvidenceResult {
  const params = useParams<{ bookSlug: string; chapter: string }>();
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookSlug = params?.bookSlug;
  const chapter = params?.chapter;

  useEffect(() => {
    if (!bookSlug || !chapter) {
      setEvidence([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/evidence?bookSlug=${bookSlug}&chapter=${chapter}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch evidence");
        return res.json();
      })
      .then((data: EvidenceItem[]) => {
        if (!cancelled) {
          setEvidence(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookSlug, chapter]);

  return { evidence, loading, error };
}
