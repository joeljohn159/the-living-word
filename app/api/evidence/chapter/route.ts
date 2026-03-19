export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getEvidenceByChapter } from "@/lib/db/queries";

/**
 * GET /api/evidence/chapter?book=genesis&chapter=1
 *
 * Returns archaeological evidence linked to a specific chapter.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const bookSlug = searchParams.get("book");
  const chapterStr = searchParams.get("chapter");

  if (!bookSlug || !chapterStr) {
    return NextResponse.json(
      { error: "Missing book or chapter parameter", evidence: [] },
      { status: 400 },
    );
  }

  const chapterNum = parseInt(chapterStr, 10);
  if (isNaN(chapterNum) || chapterNum < 1) {
    return NextResponse.json(
      { error: "Invalid chapter number", evidence: [] },
      { status: 400 },
    );
  }

  try {
    const items = await getEvidenceByChapter(bookSlug, chapterNum);
    return NextResponse.json({ evidence: items });
  } catch (error) {
    console.error("Evidence chapter API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch evidence", evidence: [] },
      { status: 500 },
    );
  }
}
