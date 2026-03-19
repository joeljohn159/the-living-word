export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getJourneyWithStops } from "@/lib/db/queries";

/**
 * GET /api/journeys/:slug
 * Returns a journey with all its ordered stops.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Journey slug is required" },
        { status: 400 },
      );
    }

    const journey = await getJourneyWithStops(slug);

    if (!journey) {
      return NextResponse.json(
        { error: "Journey not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(journey);
  } catch (error) {
    console.error("Journey API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
