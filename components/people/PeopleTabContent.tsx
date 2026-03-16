"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PeopleTabCard, type ChapterPerson } from "./PeopleTabCard";
import { PeopleTabEmpty } from "./PeopleTabEmpty";

type FetchState = "idle" | "loading" | "success" | "error";

/**
 * People tab content for the context panel.
 * Reads the current book/chapter from the URL and fetches referenced people.
 */
export function PeopleTabContent() {
  const pathname = usePathname();
  const [people, setPeople] = useState<ChapterPerson[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Extract bookSlug and chapter from URL: /bible/[bookSlug]/[chapter]
  const segments = pathname?.split("/") ?? [];
  const bookSlug = segments[2] ?? "";
  const chapter = segments[3] ?? "";

  useEffect(() => {
    if (!bookSlug || !chapter) {
      setState("idle");
      setPeople([]);
      return;
    }

    let cancelled = false;

    async function fetchPeople() {
      setState("loading");
      setErrorMessage("");

      try {
        const res = await fetch(
          `/api/people/chapter?book=${encodeURIComponent(bookSlug)}&chapter=${encodeURIComponent(chapter)}`,
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!cancelled) {
          setPeople(data.people ?? []);
          setState("success");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to load people",
          );
          setState("error");
        }
      }
    }

    fetchPeople();

    return () => {
      cancelled = true;
    };
  }, [bookSlug, chapter]);

  if (state === "idle") {
    return <PeopleTabEmpty />;
  }

  if (state === "loading") {
    return (
      <div
        className="flex flex-col items-center justify-center py-12"
        role="status"
        aria-label="Loading people"
      >
        <Loader2
          className="h-6 w-6 text-[var(--accent-gold)] animate-spin"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Loading people&hellip;
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center px-4"
        role="alert"
      >
        <p className="text-sm text-red-400 mb-2">
          Could not load people for this chapter.
        </p>
        <p className="text-xs text-[var(--text-muted)]">{errorMessage}</p>
      </div>
    );
  }

  if (people.length === 0) {
    return <PeopleTabEmpty />;
  }

  return (
    <div className="flex flex-col gap-2 px-1">
      <p className="text-xs text-[var(--text-muted)] px-1 mb-1">
        {people.length} {people.length === 1 ? "person" : "people"} mentioned
      </p>
      <ul className="flex flex-col gap-2" role="list" aria-label="People in this chapter">
        {people.map((person) => (
          <li key={person.id}>
            <PeopleTabCard person={person} />
          </li>
        ))}
      </ul>
    </div>
  );
}
