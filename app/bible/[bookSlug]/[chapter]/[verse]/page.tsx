import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import {
  getBookBySlug,
  getVerse,
  getSurroundingVerses,
  getCrossReferences,
  getChapterVerseCount,
} from "@/lib/db/queries";
import { getVerseNavLinks } from "@/lib/verse-navigation";
import { truncate } from "@/lib/utils";
import { VerseDisplay } from "@/components/verse/VerseDisplay";
import { SurroundingVerses } from "@/components/verse/SurroundingVerses";
import { CrossReferencesList } from "@/components/verse/CrossReferencesList";
import { ShareButtons } from "@/components/verse/ShareButtons";
import { VerseNavigation } from "@/components/verse/VerseNavigation";

export const dynamic = "force-dynamic";
import {
  SITE_URL,
  generatePageMetadata,
  buildBreadcrumbJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";

// ─── Types ──────────────────────────────────────────────────

interface VersePageProps {
  params: { bookSlug: string; chapter: string; verse: string };
}

// ─── Metadata ───────────────────────────────────────────────

export async function generateMetadata({ params }: VersePageProps): Promise<Metadata> {
  const book = await getBookBySlug(params.bookSlug);
  if (!book) return { title: "Verse Not Found" };

  const chapterNum = parseInt(params.chapter, 10);
  const verseNum = parseInt(params.verse, 10);

  const verse = await getVerse(params.bookSlug, chapterNum, verseNum);
  if (!verse) return { title: "Verse Not Found" };

  const reference = `${book.name} ${chapterNum}:${verseNum}`;
  const preview = truncate(verse.text, 120);
  const title = `${reference} KJV — ${preview}`;
  const description = `${verse.text} — ${reference} (King James Version). Read with cross-references and context.`;

  return generatePageMetadata({
    title,
    description,
    path: `/bible/${params.bookSlug}/${chapterNum}/${verseNum}`,
    ogType: "article",
    twitterCard: "summary_large_image",
  });
}

// ─── Page ───────────────────────────────────────────────────

export default async function VersePage({ params }: VersePageProps) {
  const chapterNum = parseInt(params.chapter, 10);
  const verseNum = parseInt(params.verse, 10);

  // Validate params
  if (isNaN(chapterNum) || chapterNum < 1 || isNaN(verseNum) || verseNum < 1) {
    notFound();
  }

  // Fetch book
  const book = await getBookBySlug(params.bookSlug);
  if (!book) notFound();

  // Validate chapter range
  if (chapterNum > book.chapterCount) notFound();

  // Fetch verse
  const verse = await getVerse(params.bookSlug, chapterNum, verseNum);
  if (!verse) notFound();

  // Fetch related data in parallel
  const [surroundingVerses, crossRefs, verseCount] = await Promise.all([
    getSurroundingVerses(params.bookSlug, chapterNum, verseNum, 3),
    getCrossReferences(verse.id),
    getChapterVerseCount(params.bookSlug, chapterNum),
  ]);

  // Build context list: surrounding + active verse, sorted
  const allContextVerses = [
    ...surroundingVerses,
    { id: verse.id, verseNumber: verse.verseNumber, text: verse.text },
  ].sort((a, b) => a.verseNumber - b.verseNumber);

  // Verse navigation
  const { prev, next } = getVerseNavLinks(
    params.bookSlug,
    chapterNum,
    verseNum,
    verseCount,
  );

  const pageUrl = `${SITE_URL}/bible/${params.bookSlug}/${chapterNum}/${verseNum}`;
  const reference = `${book.name} ${chapterNum}:${verseNum}`;

  // JSON-LD structured data — CreativeWork + Breadcrumb
  const creativeWork = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${reference} (KJV)`,
    text: verse.text,
    inLanguage: "en",
    isPartOf: {
      "@type": "Book",
      name: "King James Version",
      bookEdition: "KJV",
    },
    url: pageUrl,
  };

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Bible", path: "/bible" },
    { name: book.name, path: `/bible/${book.slug}` },
    { name: `Chapter ${chapterNum}`, path: `/bible/${book.slug}/${chapterNum}` },
    { name: `Verse ${verseNum}`, path: `/bible/${book.slug}/${chapterNum}/${verseNum}` },
  ]);

  return (
    <>
      {/* JSON-LD structured data */}
      <script {...jsonLdScriptProps(creativeWork)} />
      <script {...jsonLdScriptProps(breadcrumb)} />

      <div className="min-h-[calc(100vh-4rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
          {/* Breadcrumb navigation */}
          <nav aria-label="Breadcrumb" className="pt-8 mb-6">
            <ol className="flex items-center gap-1.5 text-sm font-source-sans text-[var(--text-muted)]">
              <li>
                <Link href="/bible" className="hover:text-[var(--accent-gold)] transition-colors">
                  Bible
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link
                  href={`/bible/${book.slug}`}
                  className="hover:text-[var(--accent-gold)] transition-colors"
                >
                  {book.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link
                  href={`/bible/${book.slug}/${chapterNum}`}
                  className="hover:text-[var(--accent-gold)] transition-colors"
                >
                  Chapter {chapterNum}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li>
                <span className="text-[var(--text-primary)] font-medium">
                  Verse {verseNum}
                </span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <header className="text-center pb-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
              {book.testament === "OT" ? "Old Testament" : "New Testament"} &middot; {book.category}
            </p>
            <h1 className="heading text-3xl sm:text-4xl lg:text-5xl text-[var(--text-primary)]">
              {book.name} {chapterNum}:{verseNum}
            </h1>
          </header>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="h-px w-12 bg-[var(--accent-gold)] opacity-40" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] opacity-60" />
            <div className="h-px w-12 bg-[var(--accent-gold)] opacity-40" />
          </div>

          {/* Featured verse display */}
          <article aria-label={reference}>
            <VerseDisplay
              bookName={book.name}
              chapter={chapterNum}
              verseNumber={verseNum}
              text={verse.text}
            />
          </article>

          {/* Surrounding verses for context */}
          <SurroundingVerses
            verses={allContextVerses}
            activeVerse={verseNum}
            bookSlug={book.slug}
            bookName={book.name}
            chapter={chapterNum}
          />

          {/* Cross references */}
          <CrossReferencesList references={crossRefs} />

          {/* Share buttons */}
          <ShareButtons
            bookName={book.name}
            chapter={chapterNum}
            verse={verseNum}
            text={verse.text}
            url={pageUrl}
          />

          {/* Verse navigation */}
          <div className="mt-10 pb-12">
            <VerseNavigation prev={prev} next={next} />

            {/* Back to chapter link */}
            <div className="text-center mt-6">
              <Link
                href={`/bible/${book.slug}/${chapterNum}`}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
              >
                ← Read full chapter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
