import { NextRequest, NextResponse } from "next/server";
import { getDictionaryWordWithVerse } from "@/lib/db/queries";

/**
 * GET /api/dictionary/:slug
 *
 * Returns a full dictionary entry with pronunciation, usage notes,
 * and example verse for the DictionaryPanel.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const entry = await getDictionaryWordWithVerse(params.slug);

    if (!entry) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      word: entry.word,
      slug: entry.slug,
      definition: entry.definition,
      modernEquivalent: entry.modernEquivalent,
      partOfSpeech: entry.partOfSpeech,
      pronunciation: entry.pronunciation,
      usageNotes: entry.usageNotes,
      exampleVerse: entry.exampleVerse ?? null,
    });
  } catch (error) {
    console.error("Dictionary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dictionary entry" },
      { status: 500 }
    );
  }
}
