export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getLocationsByChapter } from "@/lib/db/queries";

/**
 * GET /api/locations?bookSlug=genesis&chapter=1
 * Returns locations linked to a specific chapter.
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

    const items = await getLocationsByChapter(bookSlug, chapterNum);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Locations API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
