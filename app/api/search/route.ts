import { NextRequest, NextResponse } from "next/server";
import { eq, and, like, asc } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import {
  books,
  verses,
  dictionary,
  people,
  locations,
} from "@/lib/db/schema";
import { MAX_RESULTS, MAX_SUGGESTIONS } from "@/lib/search";

/**
 * GET /api/search?q=...&tab=verses&testament=all&book=&limit=50
 *
 * Unified search endpoint for verses, dictionary, people, and locations.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";
  const tab = searchParams.get("tab") ?? "verses";
  const testament = searchParams.get("testament") ?? "all";
  const bookSlug = searchParams.get("book") ?? "";
  const limit = Math.min(
    Number(searchParams.get("limit") ?? MAX_RESULTS),
    MAX_RESULTS
  );

  if (query.length < 2) {
    return NextResponse.json({ results: [], total: 0 });
  }

  try {
    switch (tab) {
      case "verses":
        return NextResponse.json(
          await searchVersesHandler(query, testament, bookSlug, limit)
        );
      case "dictionary":
        return NextResponse.json(await searchDictionaryHandler(query, limit));
      case "people":
        return NextResponse.json(await searchPeopleHandler(query, limit));
      case "places":
        return NextResponse.json(await searchPlacesHandler(query, limit));
      default:
        return NextResponse.json({ results: [], total: 0 });
    }
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", results: [], total: 0 },
      { status: 500 }
    );
  }
}

async function searchVersesHandler(
  query: string,
  testament: string,
  bookSlug: string,
  limit: number
) {
  const pattern = `%${query}%`;

  const conditions = [like(verses.text, pattern)];

  if (testament === "OT" || testament === "NT") {
    conditions.push(eq(books.testament, testament));
  }

  if (bookSlug) {
    conditions.push(eq(books.slug, bookSlug));
  }

  const results = await db
    .select({
      id: verses.id,
      bookId: verses.bookId,
      chapterNumber: verses.chapterNumber,
      verseNumber: verses.verseNumber,
      text: verses.text,
      bookName: books.name,
      bookSlug: books.slug,
      testament: books.testament,
    })
    .from(verses)
    .innerJoin(books, eq(verses.bookId, books.id))
    .where(and(...conditions))
    .orderBy(asc(books.sortOrder), asc(verses.chapterNumber), asc(verses.verseNumber))
    .limit(limit)
    .all();

  return { results, total: results.length };
}

async function searchDictionaryHandler(query: string, limit: number) {
  const pattern = `%${query}%`;

  const results = await db
    .select({
      id: dictionary.id,
      word: dictionary.word,
      slug: dictionary.slug,
      definition: dictionary.definition,
      partOfSpeech: dictionary.partOfSpeech,
    })
    .from(dictionary)
    .where(like(dictionary.word, pattern))
    .orderBy(asc(dictionary.word))
    .limit(limit)
    .all();

  // Also search definitions if word search returns few results
  if (results.length < 5) {
    const defResults = await db
      .select({
        id: dictionary.id,
        word: dictionary.word,
        slug: dictionary.slug,
        definition: dictionary.definition,
        partOfSpeech: dictionary.partOfSpeech,
      })
      .from(dictionary)
      .where(like(dictionary.definition, pattern))
      .orderBy(asc(dictionary.word))
      .limit(limit - results.length)
      .all();

    const existingIds = new Set(results.map((r) => r.id));
    for (const r of defResults) {
      if (!existingIds.has(r.id)) results.push(r);
    }
  }

  return { results, total: results.length };
}

async function searchPeopleHandler(query: string, limit: number) {
  const pattern = `%${query}%`;

  const nameResults = await db
    .select({
      id: people.id,
      name: people.name,
      slug: people.slug,
      description: people.description,
      tribeOrGroup: people.tribeOrGroup,
    })
    .from(people)
    .where(like(people.name, pattern))
    .orderBy(asc(people.name))
    .limit(limit)
    .all();

  if (nameResults.length < 5) {
    const descResults = await db
      .select({
        id: people.id,
        name: people.name,
        slug: people.slug,
        description: people.description,
        tribeOrGroup: people.tribeOrGroup,
      })
      .from(people)
      .where(like(people.description, pattern))
      .orderBy(asc(people.name))
      .limit(limit - nameResults.length)
      .all();

    const existingIds = new Set(nameResults.map((r) => r.id));
    for (const r of descResults) {
      if (!existingIds.has(r.id)) nameResults.push(r);
    }
  }

  return { results: nameResults, total: nameResults.length };
}

async function searchPlacesHandler(query: string, limit: number) {
  const pattern = `%${query}%`;

  const results = await db
    .select({
      id: locations.id,
      name: locations.name,
      slug: locations.slug,
      description: locations.description,
      locationType: locations.locationType,
    })
    .from(locations)
    .where(like(locations.name, pattern))
    .orderBy(asc(locations.name))
    .limit(limit)
    .all();

  return { results, total: results.length };
}

// ─── Suggestions endpoint ───────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const pattern = `%${query}%`;
    const limit = MAX_SUGGESTIONS;

    // Get verse suggestions (unique book+chapter combos)
    const verseSuggestions = await db
      .select({
        bookName: books.name,
        bookSlug: books.slug,
        chapterNumber: verses.chapterNumber,
      })
      .from(verses)
      .innerJoin(books, eq(verses.bookId, books.id))
      .where(like(verses.text, pattern))
      .limit(limit)
      .all();

    // Get people suggestions
    const peopleSuggestions = await db
      .select({ name: people.name, slug: people.slug })
      .from(people)
      .where(like(people.name, pattern))
      .limit(4)
      .all();

    // Get dictionary suggestions
    const dictSuggestions = await db
      .select({ word: dictionary.word, slug: dictionary.slug })
      .from(dictionary)
      .where(like(dictionary.word, pattern))
      .limit(4)
      .all();

    return NextResponse.json({
      suggestions: {
        verses: verseSuggestions,
        people: peopleSuggestions,
        dictionary: dictSuggestions,
      },
    });
  } catch (error) {
    console.error("Suggestion error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
