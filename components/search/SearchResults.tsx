"use client";

import Link from "next/link";
import { BookOpen, Users, BookA, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  highlightMatches,
  excerptAround,
  type VerseResult,
  type DictionaryResult,
  type PersonResult,
  type LocationResult,
  type SearchTab,
} from "@/lib/search";

interface SearchResultsProps {
  tab: SearchTab;
  query: string;
  verses: VerseResult[];
  dictionary: DictionaryResult[];
  people: PersonResult[];
  places: LocationResult[];
  loading: boolean;
}

/**
 * Renders search results for the active tab with highlighted matches.
 */
export function SearchResults({
  tab,
  query,
  verses,
  dictionary: dictResults,
  people: peopleResults,
  places: placeResults,
  loading,
}: SearchResultsProps) {
  if (loading) {
    return <LoadingState />;
  }

  const isEmpty =
    (tab === "verses" && verses.length === 0) ||
    (tab === "dictionary" && dictResults.length === 0) ||
    (tab === "people" && peopleResults.length === 0) ||
    (tab === "places" && placeResults.length === 0);

  if (isEmpty && query.length >= 2) {
    return <EmptyState tab={tab} query={query} />;
  }

  if (!query || query.length < 2) {
    return <PromptState />;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tab}`}
      className="animate-fade-in"
    >
      {tab === "verses" && (
        <VerseResultsList verses={verses} query={query} />
      )}
      {tab === "dictionary" && (
        <DictionaryResultsList results={dictResults} query={query} />
      )}
      {tab === "people" && (
        <PeopleResultsList results={peopleResults} query={query} />
      )}
      {tab === "places" && (
        <PlacesResultsList results={placeResults} query={query} />
      )}
    </div>
  );
}

// ─── Verse Results ──────────────────────────────────────────

function VerseResultsList({
  verses,
  query,
}: {
  verses: VerseResult[];
  query: string;
}) {
  return (
    <ul className="space-y-3" role="list" aria-label="Verse results">
      {verses.map((verse) => (
        <li key={verse.id} className="animate-slide-up">
          <Link
            href={`/bible/${verse.bookSlug}/${verse.chapterNumber}#verse-${verse.verseNumber}`}
            className={cn(
              "block rounded-lg border border-border p-4",
              "hover:border-gold/30 hover:bg-gold/5",
              "transition-colors duration-150 group"
            )}
          >
            {/* Reference header */}
            <div className="flex items-center gap-2 mb-2">
              <BookOpen
                className="h-4 w-4 text-gold shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-gold font-source-sans">
                {verse.bookName} {verse.chapterNumber}:{verse.verseNumber}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {verse.testament === "OT" ? "Old Testament" : "New Testament"}
              </span>
            </div>

            {/* Verse text with highlights */}
            <p className="font-cormorant text-scripture text-base leading-relaxed">
              <HighlightedText
                text={excerptAround(verse.text, query)}
                query={query}
              />
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ─── Dictionary Results ─────────────────────────────────────

function DictionaryResultsList({
  results,
  query,
}: {
  results: DictionaryResult[];
  query: string;
}) {
  return (
    <ul className="space-y-3" role="list" aria-label="Dictionary results">
      {results.map((entry) => (
        <li key={entry.id} className="animate-slide-up">
          <Link
            href={`/dictionary/${entry.slug}`}
            className={cn(
              "block rounded-lg border border-border p-4",
              "hover:border-gold/30 hover:bg-gold/5",
              "transition-colors duration-150"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <BookA
                className="h-4 w-4 text-gold shrink-0"
                aria-hidden="true"
              />
              <span className="font-cormorant text-lg font-semibold text-foreground">
                <HighlightedText text={entry.word} query={query} />
              </span>
              {entry.partOfSpeech && (
                <span className="text-xs italic text-muted-foreground">
                  ({entry.partOfSpeech})
                </span>
              )}
            </div>
            <p className="text-sm text-secondary-foreground line-clamp-2">
              <HighlightedText text={entry.definition} query={query} />
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ─── People Results ─────────────────────────────────────────

function PeopleResultsList({
  results,
  query,
}: {
  results: PersonResult[];
  query: string;
}) {
  return (
    <ul className="space-y-3" role="list" aria-label="People results">
      {results.map((person) => (
        <li key={person.id} className="animate-slide-up">
          <Link
            href={`/people/${person.slug}`}
            className={cn(
              "block rounded-lg border border-border p-4",
              "hover:border-gold/30 hover:bg-gold/5",
              "transition-colors duration-150"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Users
                className="h-4 w-4 text-gold shrink-0"
                aria-hidden="true"
              />
              <span className="font-cormorant text-lg font-semibold text-foreground">
                <HighlightedText text={person.name} query={query} />
              </span>
              {person.tribeOrGroup && (
                <span className="text-xs text-muted-foreground">
                  {person.tribeOrGroup}
                </span>
              )}
            </div>
            {person.description && (
              <p className="text-sm text-secondary-foreground line-clamp-2">
                <HighlightedText
                  text={person.description}
                  query={query}
                />
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ─── Places Results ─────────────────────────────────────────

function PlacesResultsList({
  results,
  query,
}: {
  results: LocationResult[];
  query: string;
}) {
  return (
    <ul className="space-y-3" role="list" aria-label="Places results">
      {results.map((place) => (
        <li key={place.id} className="animate-slide-up">
          <Link
            href={`/maps?location=${place.slug}`}
            className={cn(
              "block rounded-lg border border-border p-4",
              "hover:border-gold/30 hover:bg-gold/5",
              "transition-colors duration-150"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin
                className="h-4 w-4 text-gold shrink-0"
                aria-hidden="true"
              />
              <span className="font-cormorant text-lg font-semibold text-foreground">
                <HighlightedText text={place.name} query={query} />
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {place.locationType}
              </span>
            </div>
            {place.description && (
              <p className="text-sm text-secondary-foreground line-clamp-2">
                <HighlightedText
                  text={place.description}
                  query={query}
                />
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// ─── Shared Components ──────────────────────────────────────

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const segments = highlightMatches(text, query);

  return (
    <>
      {segments.map((segment, i) =>
        segment.highlight ? (
          <mark
            key={i}
            className="bg-gold/25 text-inherit rounded-sm px-0.5"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading results">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border p-4 animate-pulse"
        >
          <div className="h-4 w-40 bg-secondary rounded mb-3" />
          <div className="h-3 w-full bg-secondary/60 rounded mb-2" />
          <div className="h-3 w-3/4 bg-secondary/40 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab, query }: { tab: string; query: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground text-lg mb-2">
        No {tab} found for &ldquo;{query}&rdquo;
      </p>
      <p className="text-muted-foreground text-sm">
        Try different keywords or check your spelling.
      </p>
    </div>
  );
}

function PromptState() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground text-lg mb-2">
        Enter a search term to find verses, words, people, and places.
      </p>
      <p className="text-sm text-muted-foreground">
        Try &ldquo;love&rdquo;, &ldquo;David&rdquo;, or &ldquo;Jerusalem&rdquo;
      </p>
    </div>
  );
}
