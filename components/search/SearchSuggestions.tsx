"use client";

import Link from "next/link";
import { BookOpen, Users, BookA } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerseSuggestion {
  bookName: string;
  bookSlug: string;
  chapterNumber: number;
}

interface NameSlugSuggestion {
  name?: string;
  word?: string;
  slug: string;
}

interface SuggestionsData {
  verses: VerseSuggestion[];
  people: NameSlugSuggestion[];
  dictionary: NameSlugSuggestion[];
}

interface SearchSuggestionsProps {
  suggestions: SuggestionsData | null;
  query: string;
  onSelect: (query: string) => void;
  visible: boolean;
}

/**
 * Dropdown autocomplete suggestions shown below the search bar.
 * Groups suggestions by type: verses, people, dictionary.
 */
export function SearchSuggestions({
  suggestions,
  query,
  onSelect,
  visible,
}: SearchSuggestionsProps) {
  if (!visible || !suggestions || !query) return null;

  const hasResults =
    suggestions.verses.length > 0 ||
    suggestions.people.length > 0 ||
    suggestions.dictionary.length > 0;

  if (!hasResults) return null;

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1",
        "rounded-lg border border-border bg-card shadow-lg",
        "animate-fade-in overflow-hidden",
        "max-h-80 overflow-y-auto"
      )}
      role="listbox"
      aria-label="Search suggestions"
    >
      {/* Verse location suggestions */}
      {suggestions.verses.length > 0 && (
        <SuggestionGroup label="Found in" icon={BookOpen}>
          {suggestions.verses.map((v, i) => (
            <SuggestionItem
              key={`verse-${i}`}
              href={`/search?q=${encodeURIComponent(query)}&tab=verses`}
              onClick={() => onSelect(query)}
            >
              {v.bookName} {v.chapterNumber}
            </SuggestionItem>
          ))}
        </SuggestionGroup>
      )}

      {/* People suggestions */}
      {suggestions.people.length > 0 && (
        <SuggestionGroup label="People" icon={Users}>
          {suggestions.people.map((p) => (
            <SuggestionItem
              key={`person-${p.slug}`}
              href={`/people/${p.slug}`}
              onClick={() => onSelect(p.name ?? "")}
            >
              {p.name}
            </SuggestionItem>
          ))}
        </SuggestionGroup>
      )}

      {/* Dictionary suggestions */}
      {suggestions.dictionary.length > 0 && (
        <SuggestionGroup label="Dictionary" icon={BookA}>
          {suggestions.dictionary.map((d) => (
            <SuggestionItem
              key={`dict-${d.slug}`}
              href={`/dictionary/${d.slug}`}
              onClick={() => onSelect(d.word ?? "")}
            >
              {d.word}
            </SuggestionItem>
          ))}
        </SuggestionGroup>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function SuggestionGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof BookOpen;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30">
        <Icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <ul role="group" aria-label={label}>
        {children}
      </ul>
    </div>
  );
}

function SuggestionItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li role="option" aria-selected={false}>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "block px-4 py-2 text-sm text-foreground",
          "hover:bg-gold/10 hover:text-gold",
          "transition-colors duration-100"
        )}
      >
        {children}
      </Link>
    </li>
  );
}
