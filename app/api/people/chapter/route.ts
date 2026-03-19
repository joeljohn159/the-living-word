export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getPeopleByChapterWithFamily } from "@/lib/db/queries";

/**
 * GET /api/people/chapter?book=genesis&chapter=1
 *
 * Returns people mentioned in a specific chapter with family connections.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const bookSlug = searchParams.get("book");
  const chapterStr = searchParams.get("chapter");

  if (!bookSlug || !chapterStr) {
    return NextResponse.json(
      { error: "Missing book or chapter parameter", people: [] },
      { status: 400 },
    );
  }

  const chapterNum = parseInt(chapterStr, 10);
  if (isNaN(chapterNum) || chapterNum < 1) {
    return NextResponse.json(
      { error: "Invalid chapter number", people: [] },
      { status: 400 },
    );
  }

  try {
    const people = await getPeopleByChapterWithFamily(bookSlug, chapterNum);
    return NextResponse.json({ people });
  } catch (error) {
    console.error("People chapter API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch people", people: [] },
      { status: 500 },
    );
  }
}
