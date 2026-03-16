import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Volume2 } from "lucide-react";
import {
  getDictionaryWordWithVerse,
  getDictionaryWords,
} from "@/lib/db/queries";

interface DictionaryWordPageProps {
  params: { word: string };
}

/** Generate static params for all dictionary words. */
export async function generateStaticParams() {
  const words = await getDictionaryWords();
  return words.map((w) => ({ word: w.slug }));
}

/** Generate SEO metadata for each word page. */
export async function generateMetadata({
  params,
}: DictionaryWordPageProps): Promise<Metadata> {
  const entry = await getDictionaryWordWithVerse(params.word);
  if (!entry) return { title: "Word Not Found" };

  const title = `What does "${entry.word}" mean in the KJV Bible?`;
  const description = `${entry.word}: ${entry.definition}${
    entry.modernEquivalent ? ` Modern equivalent: ${entry.modernEquivalent}.` : ""
  }`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | The Living Word`,
      description,
      type: "article",
    },
  };
}

/**
 * Individual dictionary word page with definition, pronunciation,
 * part of speech, modern equivalent, usage notes, and example verse.
 */
export default async function DictionaryWordPage({
  params,
}: DictionaryWordPageProps) {
  const entry = await getDictionaryWordWithVerse(params.word);
  if (!entry) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: entry.word,
    description: entry.definition,
    url: `https://thelivingword.app/dictionary/${entry.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "KJV Bible Dictionary",
      url: "https://thelivingword.app/dictionary",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/dictionary"
          className="inline-flex items-center gap-1.5 text-sm font-source-sans text-muted-foreground hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dictionary
        </Link>

        {/* Word header */}
        <article className="animate-fade-in">
          <header className="mb-8">
            <h1 className="heading text-4xl sm:text-5xl text-gold mb-3">
              {entry.word}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {entry.pronunciation && (
                <span className="inline-flex items-center gap-1.5 text-sm font-source-sans text-muted-foreground">
                  <Volume2
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  <span className="italic">{entry.pronunciation}</span>
                </span>
              )}
              {entry.partOfSpeech && (
                <span className="inline-block rounded-full bg-gold/10 border border-gold/20 px-3 py-0.5 text-xs font-source-sans font-medium text-gold">
                  {entry.partOfSpeech}
                </span>
              )}
            </div>
          </header>

          {/* Definition */}
          <section className="mb-8" aria-labelledby="definition-heading">
            <h2
              id="definition-heading"
              className="heading text-xl text-foreground mb-3"
            >
              Definition
            </h2>
            <p className="scripture text-lg leading-relaxed">
              {entry.definition}
            </p>
          </section>

          {/* Modern equivalent */}
          {entry.modernEquivalent && (
            <section
              className="mb-8 rounded-lg border border-border bg-card p-5"
              aria-labelledby="modern-heading"
            >
              <h2
                id="modern-heading"
                className="heading text-lg text-foreground mb-2"
              >
                Modern Equivalent
              </h2>
              <p className="font-source-sans text-gold text-lg">
                {entry.modernEquivalent}
              </p>
            </section>
          )}

          {/* Usage notes */}
          {entry.usageNotes && (
            <section className="mb-8" aria-labelledby="usage-heading">
              <h2
                id="usage-heading"
                className="heading text-xl text-foreground mb-3"
              >
                Usage Notes
              </h2>
              <p className="font-source-sans text-[var(--text-secondary)] leading-relaxed">
                {entry.usageNotes}
              </p>
            </section>
          )}

          {/* Example verse */}
          {entry.exampleVerse && (
            <section
              className="rounded-lg border border-gold/20 bg-gold/5 p-5 sm:p-6"
              aria-labelledby="example-heading"
            >
              <h2
                id="example-heading"
                className="heading text-xl text-foreground mb-4"
              >
                Example Verse
              </h2>
              <blockquote className="scripture text-lg italic leading-relaxed mb-3">
                &ldquo;{entry.exampleVerse.text}&rdquo;
              </blockquote>
              <Link
                href={`/bible/${entry.exampleVerse.bookSlug}/${entry.exampleVerse.chapterNumber}#verse-${entry.exampleVerse.verseNumber}`}
                className="inline-flex items-center gap-1.5 text-sm font-source-sans text-gold hover:text-gold-light transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {entry.exampleVerse.bookName} {entry.exampleVerse.chapterNumber}:
                {entry.exampleVerse.verseNumber}
              </Link>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
