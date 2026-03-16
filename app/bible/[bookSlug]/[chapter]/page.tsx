import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookBySlug, getChapterVerses } from "@/lib/db/queries";
import { getChapterNavLinks } from "@/lib/navigation";
import { ReadingProgress } from "@/components/scripture/ReadingProgress";
import { ScriptureDisplay } from "@/components/scripture/ScriptureDisplay";
import { ChapterNavigation } from "@/components/scripture/ChapterNavigation";
import { ChapterKeyboardNav } from "@/components/scripture/ChapterKeyboardNav";
import { ContextPanel } from "@/components/scripture/ContextPanel";
import { ChapterToolbar } from "./ChapterToolbar";

// ─── Types ──────────────────────────────────────────────────

interface ChapterPageProps {
  params: { bookSlug: string; chapter: string };
}

// ─── Metadata ───────────────────────────────────────────────

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const book = await getBookBySlug(params.bookSlug);
  if (!book) return { title: "Chapter Not Found" };

  const chapterNum = parseInt(params.chapter, 10);
  const title = `${book.name} ${chapterNum} — The Living Word`;
  const description = `Read ${book.name} chapter ${chapterNum} (KJV) with museum-quality presentation.`;

  return { title, description };
}

// ─── Page ───────────────────────────────────────────────────

export default async function ChapterPage({ params }: ChapterPageProps) {
  const chapterNum = parseInt(params.chapter, 10);

  // Validate chapter number
  if (isNaN(chapterNum) || chapterNum < 1) {
    notFound();
  }

  // Fetch book
  const book = await getBookBySlug(params.bookSlug);
  if (!book) notFound();

  // Validate chapter is within range
  if (chapterNum > book.chapterCount) {
    notFound();
  }

  // Fetch verses
  const verses = await getChapterVerses(params.bookSlug, chapterNum);

  // Compute navigation links
  const { prev, next } = getChapterNavLinks(
    params.bookSlug,
    chapterNum,
    book.chapterCount,
  );

  return (
    <>
      <ReadingProgress />
      <ChapterKeyboardNav prev={prev} next={next} />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Main scripture area */}
        <main className="flex-1 min-w-0">
          {/* Chapter header */}
          <header className="pt-8 pb-6 px-4 sm:px-6 lg:px-12 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
              {book.testament === "OT" ? "Old Testament" : "New Testament"} &middot; {book.category}
            </p>
            <h1 className="heading text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)]">
              {book.name}
            </h1>
            <p className="mt-2 font-cormorant text-xl sm:text-2xl text-[var(--accent-gold)]">
              Chapter {chapterNum}
            </p>
            {book.chapterCount > 1 && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {chapterNum} of {book.chapterCount} chapters
              </p>
            )}
          </header>

          {/* Toolbar: reading mode toggle + font size */}
          <ChapterToolbar />

          {/* Scripture content */}
          <article
            className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
            aria-label={`${book.name} chapter ${chapterNum}`}
          >
            <ScriptureDisplay verses={verses} />
          </article>

          {/* Bottom navigation */}
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <ChapterNavigation prev={prev} next={next} />
          </div>
        </main>

        {/* Context panel (desktop only) */}
        <ContextPanel />
      </div>
    </>
  );
}
