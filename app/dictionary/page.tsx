import type { Metadata } from "next";
import { BookA } from "lucide-react";
import { getDictionaryWords, getDictionaryLetters } from "@/lib/db/queries";
import { DictionaryBrowser } from "@/components/dictionary/DictionaryBrowser";
import {
  generatePageMetadata,
  SITE_URL,
  jsonLdScriptProps,
} from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "KJV Bible Dictionary — Archaic Words Defined",
  description:
    "Browse over 300 archaic King James Bible words with modern definitions, pronunciations, and example verses. Understand every word of the KJV.",
  path: "/dictionary",
});

/**
 * Dictionary browser page — alphabetical list of all archaic KJV words
 * with letter navigation, search, and paginated results.
 */
export default async function DictionaryPage() {
  const [words, activeLetters] = await Promise.all([
    getDictionaryWords(),
    getDictionaryLetters(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "KJV Bible Dictionary",
    description:
      "A comprehensive dictionary of archaic words found in the King James Version of the Bible.",
    url: `${SITE_URL}/dictionary`,
    hasDefinedTerm: words.slice(0, 50).map((w) => ({
      "@type": "DefinedTerm",
      name: w.word,
      description: w.definition,
      url: `${SITE_URL}/dictionary/${w.slug}`,
    })),
  };

  return (
    <>
      <script {...jsonLdScriptProps(jsonLd)} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page header */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookA
              className="h-8 w-8 text-gold"
              aria-hidden="true"
            />
            <h1 className="heading text-3xl sm:text-4xl lg:text-5xl text-gold">
              KJV Dictionary
            </h1>
          </div>
          <p className="font-source-sans text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Explore the archaic and beautiful language of the King James Bible.
            Every word defined with modern equivalents and scripture examples.
          </p>
        </div>

        {/* Browser component */}
        <DictionaryBrowser
          words={words.map((w) => ({
            id: w.id,
            word: w.word,
            slug: w.slug,
            definition: w.definition,
            partOfSpeech: w.partOfSpeech,
            modernEquivalent: w.modernEquivalent,
          }))}
          activeLetters={activeLetters}
        />
      </div>
    </>
  );
}
