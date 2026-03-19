import { NextRequest, NextResponse } from "next/server";
import {
  getChapterVerseNotes,
  createVerseNote,
  updateVerseNote,
  deleteVerseNote,
} from "@/lib/db/queries";

/** GET /api/notes?book=genesis&chapter=1 */
export async function GET(req: NextRequest) {
  const book = req.nextUrl.searchParams.get("book");
  const chapter = req.nextUrl.searchParams.get("chapter");

  if (!book || !chapter) {
    return NextResponse.json(
      { error: "book and chapter params required" },
      { status: 400 },
    );
  }

  const notes = await getChapterVerseNotes(book, parseInt(chapter, 10));
  return NextResponse.json(notes);
}

/** POST /api/notes  { bookSlug, chapterNumber, verseNumber, content } */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bookSlug, chapterNumber, verseNumber, content } = body;

  if (!bookSlug || !chapterNumber || !verseNumber || !content?.trim()) {
    return NextResponse.json(
      { error: "bookSlug, chapterNumber, verseNumber, and content required" },
      { status: 400 },
    );
  }

  const note = await createVerseNote(
    bookSlug,
    parseInt(chapterNumber, 10),
    parseInt(verseNumber, 10),
    content.trim(),
  );
  return NextResponse.json(note, { status: 201 });
}

/** PUT /api/notes  { id, content } */
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, content } = body;

  if (!id || !content?.trim()) {
    return NextResponse.json({ error: "id and content required" }, { status: 400 });
  }

  const note = await updateVerseNote(parseInt(id, 10), content.trim());
  return NextResponse.json(note);
}

/** DELETE /api/notes?id=123 */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id param required" }, { status: 400 });
  }

  await deleteVerseNote(parseInt(id, 10));
  return NextResponse.json({ ok: true });
}
