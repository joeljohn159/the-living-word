"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchSuggestions } from "@/components/search/SearchSuggestions";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchTabs } from "@/components/search/SearchTabs";
import { SearchResults } from "@/components/search/SearchResults";
import {
  DEBOUNCE_MS,
  type SearchTab,
  type VerseResult,
  type DictionaryResult,
  type PersonResult,
  type LocationResult,
} from "@/lib/search";

interface BookOption {
  name: string;
  slug: string;
  testament: string;
}

/**
 * Full-text search page with tabbed results, filters, and autocomplete.
 * URL-synced query params: ?q=...&tab=verses&testament=all&book=
 */
export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ─── State from URL ─────────────────────────────────────
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeTab, setActiveTab] = useState<SearchTab>(
    (searchParams.get("tab") as SearchTab) ?? "verses"
  );
  const [testament, setTestament] = useState<"all" | "OT" | "NT">(
    (searchParams.get("testament") as "all" | "OT" | "NT") ?? "all"
  );
  const [bookSlug, setBookSlug] = useState(searchParams.get("book") ?? "");

  // ─── Results state ──────────────────────────────────────
  const [verses, setVerses] = useState<VerseResult[]>([]);
  const [dictResults, setDictResults] = useState<DictionaryResult[]>([]);
  const [peopleResults, setPeopleResults] = useState<PersonResult[]>([]);
  const [placeResults, setPlaceResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Fetch books for filters ────────────────────────────
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("/api/books");
        if (res.ok) {
          const data = await res.json();
          setBooks(data);
        }
      } catch {
        // Books filter will just be empty
      }
    }
    fetchBooks();
  }, []);

  // ─── Sync URL ───────────────────────────────────────────
  const updateUrl = useCallback(
    (q: string, tab: SearchTab, test: string, book: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tab !== "verses") params.set("tab", tab);
      if (test !== "all") params.set("testament", test);
      if (book) params.set("book", book);
      const qs = params.toString();
      router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  // ─── Search execution ──────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setVerses([]);
      setDictResults([]);
      setPeopleResults([]);
      setPlaceResults([]);
      return;
    }

    const controller = new AbortController();

    async function executeSearch() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          tab: activeTab,
          testament,
          book: bookSlug,
        });

        const res = await fetch(`/api/search?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        switch (activeTab) {
          case "verses":
            setVerses(data.results);
            break;
          case "dictionary":
            setDictResults(data.results);
            break;
          case "people":
            setPeopleResults(data.results);
            break;
          case "places":
            setPlaceResults(data.results);
            break;
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search error:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    executeSearch();
    updateUrl(debouncedQuery, activeTab, testament, bookSlug);

    return () => controller.abort();
  }, [debouncedQuery, activeTab, testament, bookSlug, updateUrl]);

  // ─── Fetch suggestions ─────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions(null);
      return;
    }

    const controller = new AbortController();

    async function fetchSuggestions() {
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: debouncedQuery }),
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions);
        }
      } catch {
        // Suggestions are optional
      }
    }

    fetchSuggestions();
    return () => controller.abort();
  }, [debouncedQuery]);

  // ─── Close suggestions on outside click ─────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ─── Tab change handler ─────────────────────────────────
  function handleTabChange(tab: SearchTab) {
    setActiveTab(tab);
    // Clear results when switching tabs so it re-fetches
    if (debouncedQuery.length >= 2) {
      setLoading(true);
    }
  }

  const counts = {
    verses: verses.length,
    dictionary: dictResults.length,
    people: peopleResults.length,
    places: placeResults.length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1
          className={cn(
            "heading text-3xl sm:text-4xl text-foreground mb-3"
          )}
        >
          Search
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          Search across all 31,102 verses, dictionary words, biblical
          figures, and locations.
        </p>
      </div>

      {/* Search Bar with Suggestions */}
      <div ref={containerRef} className="relative mb-6">
        <SearchBar
          value={query}
          onChange={(val) => {
            setQuery(val);
            setShowSuggestions(true);
          }}
          onSubmit={() => setShowSuggestions(false)}
          autoFocus
        />
        <SearchSuggestions
          suggestions={suggestions}
          query={debouncedQuery}
          onSelect={() => setShowSuggestions(false)}
          visible={showSuggestions}
        />
      </div>

      {/* Filters (only visible when query has content and on verses tab) */}
      {debouncedQuery.length >= 2 && activeTab === "verses" && (
        <div className="mb-4 animate-fade-in">
          <SearchFilters
            testament={testament}
            onTestamentChange={setTestament}
            bookSlug={bookSlug}
            onBookChange={setBookSlug}
            books={books}
          />
        </div>
      )}

      {/* Tabs */}
      {debouncedQuery.length >= 2 && (
        <div className="mb-6">
          <SearchTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={counts}
          />
        </div>
      )}

      {/* Results */}
      <SearchResults
        tab={activeTab}
        query={debouncedQuery}
        verses={verses}
        dictionary={dictResults}
        people={peopleResults}
        places={placeResults}
        loading={loading}
      />
    </div>
  );
}
