"use client";

import { useState, useMemo } from "react";
import { LetterNav } from "./LetterNav";
import { DictionarySearch } from "./DictionarySearch";
import { DictionaryWordCard } from "./DictionaryWordCard";

const ITEMS_PER_PAGE = 30;

interface DictionaryEntry {
  id: number;
  word: string;
  slug: string;
  definition: string;
  partOfSpeech: string | null;
  modernEquivalent: string | null;
}

interface DictionaryBrowserProps {
  /** All dictionary words from the database. */
  words: DictionaryEntry[];
  /** Letters that have entries. */
  activeLetters: string[];
}

/**
 * Client-side dictionary browser with letter filtering, search, and pagination.
 * Receives all words server-side and filters client-side for instant response.
 */
export function DictionaryBrowser({
  words,
  activeLetters,
}: DictionaryBrowserProps) {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  /** Filter words by letter and search query. */
  const filteredWords = useMemo(() => {
    let result = words;

    if (selectedLetter) {
      result = result.filter(
        (w) => w.word.charAt(0).toUpperCase() === selectedLetter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q) ||
          (w.modernEquivalent && w.modernEquivalent.toLowerCase().includes(q))
      );
    }

    return result;
  }, [words, selectedLetter, searchQuery]);

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = filteredWords.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /** Reset page when filters change. */
  function handleLetterSelect(letter: string | null) {
    setSelectedLetter(letter);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setSelectedLetter(null);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex justify-center">
        <DictionarySearch value={searchQuery} onChange={handleSearchChange} />
      </div>

      {/* Letter navigation */}
      <LetterNav
        activeLetters={activeLetters}
        selectedLetter={selectedLetter}
        onSelect={handleLetterSelect}
      />

      {/* Results count */}
      <p className="text-sm font-source-sans text-muted-foreground text-center">
        {filteredWords.length} {filteredWords.length === 1 ? "word" : "words"}
        {selectedLetter && ` starting with "${selectedLetter}"`}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Word grid */}
      {paginatedWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {paginatedWords.map((word) => (
            <DictionaryWordCard
              key={word.id}
              word={word.word}
              slug={word.slug}
              definition={word.definition}
              partOfSpeech={word.partOfSpeech}
              modernEquivalent={word.modernEquivalent}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-source-sans">
            No words found. Try a different search or letter.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-2 pt-4"
          aria-label="Pagination"
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md text-sm font-source-sans border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm font-source-sans text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-md text-sm font-source-sans border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
