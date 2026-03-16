import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBookBySlug, getChapterVerses, getMediaByChapter, getChapterCrossReferences } from "@/lib/db/queries";
import { getChapterNavLinks } from "@/lib/navigation";
import { ReadingProgress } from "@/components/scripture/ReadingProgress";
import { ScriptureDisplay } from "@/components/scripture/ScriptureDisplay";
import { ChapterNavigation } from "@/components/scripture/ChapterNavigation";
import { ChapterKeyboardNav } from "@/components/scripture/ChapterKeyboardNav";
import { SwipeableChapter } from "@/components/scripture/SwipeableChapter";
import { ContextPanel } from "@/components/scripture/ContextPanel";
import { CrossRefProvider } from "@/components/scripture/CrossRefProvider";
import { DictionaryModeProvider } from "@/components/dictionary/DictionaryModeProvider";
import { ChapterToolbar } from "./ChapterToolbar";
import {
  generatePageMetadata,
  buildBreadcrumbJsonLd,
  buildArticleJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";

// ─── Types ──────────────────────────────────────────────────

interface ChapterPageProps {
  params: { bookSlug: string; chapter: string };
}

// ─── Metadata ───────────────────────────────────────────────

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const book = await getBookBySlug(params.bookSlug);
  if (!book) return { title: "Chapter Not Found" };

  const chapterNum = parseInt(params.chapter, 10);
  const title = `${book.name} ${chapterNum} KJV — Read Chapter`;
  const description = `Read ${book.name} chapter ${chapterNum} in the King James Version. Museum-quality scripture presentation with cross-references and context.`;

  return generatePageMetadata({
    title,
    description,
    path: `/bible/${book.slug}/${chapterNum}`,
    ogType: "article",
  });
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

  // Fetch verses, media, and cross-refs in parallel
  const [verses, mediaItems, crossRefs] = await Promise.all([
    getChapterVerses(params.bookSlug, chapterNum),
    getMediaByChapter(params.bookSlug, chapterNum),
    getChapterCrossReferences(params.bookSlug, chapterNum),
  ]);

  // Compute navigation links
  const { prev, next } = getChapterNavLinks(
    params.bookSlug,
    chapterNum,
    book.chapterCount,
  );

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Bible", path: "/bible" },
    { name: book.name, path: `/bible/${book.slug}` },
    { name: `Chapter ${chapterNum}`, path: `/bible/${book.slug}/${chapterNum}` },
  ]);

  const article = buildArticleJsonLd({
    title: `${book.name} Chapter ${chapterNum} (KJV)`,
    description: `Read ${book.name} chapter ${chapterNum} in the King James Version.`,
    path: `/bible/${book.slug}/${chapterNum}`,
  });

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      <script {...jsonLdScriptProps(article)} />
      <ReadingProgress />
      <ChapterKeyboardNav prev={prev} next={next} />

      <CrossRefProvider
        crossReferences={crossRefs}
        bookSlug={params.bookSlug}
        bookName={book.name}
        chapter={chapterNum}
      >
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {/* Main scripture area — single column on mobile */}
          <SwipeableChapter prev={prev} next={next}>
            <main className="flex-1 min-w-0 overflow-hidden">
              {/* Chapter header */}
              <header className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-12 text-center">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1.5 sm:mb-2">
                  {book.testament === "OT" ? "Old Testament" : "New Testament"} &middot; {book.category}
                </p>
                <h1 className="heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)]">
                  {book.name}
                </h1>
                <p className="mt-1.5 sm:mt-2 font-cormorant text-lg sm:text-xl md:text-2xl text-[var(--accent-gold)]">
                  Chapter {chapterNum}
                </p>
                {book.chapterCount > 1 && (
                  <p className="mt-1 text-[10px] sm:text-xs text-[var(--text-muted)]">
                    {chapterNum} of {book.chapterCount} chapters
                  </p>
                )}
              </header>

              {/* Toolbar: reading mode toggle + font size */}
              <ChapterToolbar />

              {/* Scripture content */}
              <article
                className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8"
                aria-label={`${book.name} chapter ${chapterNum}`}
              >
                <ScriptureDisplay verses={verses} />
              </article>

              {/* Swipe hint on mobile */}
              <p className="text-center text-[10px] text-[var(--text-muted)] pb-2 sm:hidden select-none">
                Swipe left/right to navigate chapters
              </p>

              {/* Bottom navigation */}
              <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
                <ChapterNavigation prev={prev} next={next} />
              </div>
            </main>
          </SwipeableChapter>

          {/* Context panel: bottom sheet on mobile, side panel on desktop */}
          <ContextPanel mediaItems={mediaItems} />
        </div>
      </CrossRefProvider>

      {/* Dictionary Mode overlay (badge + panel) */}
      <DictionaryModeProvider />
    </>
  );
}
