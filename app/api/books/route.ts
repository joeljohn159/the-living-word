import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { books } from "@/lib/db/schema";

/**
 * GET /api/books — returns all books for filter dropdowns.
 */
export async function GET() {
  try {
    const allBooks = db
      .select({
        name: books.name,
        slug: books.slug,
        testament: books.testament,
      })
      .from(books)
      .orderBy(asc(books.sortOrder))
      .all();

    return NextResponse.json(allBooks);
  } catch (error) {
    console.error("Books API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
