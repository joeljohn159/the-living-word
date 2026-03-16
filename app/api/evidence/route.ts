import { NextRequest, NextResponse } from "next/server";
import { getEvidenceByChapter } from "@/lib/db/queries";

/**
 * GET /api/evidence?bookSlug=genesis&chapter=1
 * Returns evidence items linked to a specific chapter.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookSlug = searchParams.get("bookSlug");
    const chapter = searchParams.get("chapter");

    if (!bookSlug || !chapter) {
      return NextResponse.json(
        { error: "bookSlug and chapter are required" },
        { status: 400 },
      );
    }

    const chapterNum = parseInt(chapter, 10);
    if (isNaN(chapterNum) || chapterNum < 1) {
      return NextResponse.json(
        { error: "Invalid chapter number" },
        { status: 400 },
      );
    }

    const items = await getEvidenceByChapter(bookSlug, chapterNum);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Evidence API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
