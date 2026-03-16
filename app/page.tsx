import type { Metadata } from "next";
import {
  HeroSection,
  BooksGrid,
  ArtworkOfDay,
  MapPreview,
  EvidenceSpotlight,
  TimelinePreview,
  SearchSection,
} from "@/components/landing";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "The Living Word — King James Bible with Maps, Art & Evidence",
  description:
    "Experience the King James Bible illuminated with historical art, archaeological evidence, interactive maps, and a built-in archaic word dictionary. A museum-quality Bible reading experience.",
  path: "/",
});

/** Curated featured verses — one is selected daily based on the date. */
const FEATURED_VERSES = [
  { text: "In the beginning God created the heaven and the earth.", ref: "Genesis 1:1 KJV" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1 KJV" },
  { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", ref: "John 3:16 KJV" },
  { text: "I can do all things through Christ which strengtheneth me.", ref: "Philippians 4:13 KJV" },
  { text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", ref: "Proverbs 3:5 KJV" },
  { text: "The Lord is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1 KJV" },
  { text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.", ref: "Joshua 1:9 KJV" },
];

/** Pick a verse based on today's date so it rotates daily. */
function getDailyVerse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return FEATURED_VERSES[dayOfYear % FEATURED_VERSES.length];
}

/**
 * Museum-quality landing page for The Living Word.
 *
 * Sections: Hero, Books Grid, Artwork of the Day, Map Preview,
 * Evidence Spotlight, Timeline Preview, Search, Footer (via layout).
 */
export default function HomePage() {
  const verse = getDailyVerse();

  return (
    <>
      <HeroSection verseText={verse.text} verseRef={verse.ref} />
      <BooksGrid />
      <ArtworkOfDay />
      <MapPreview />
      <EvidenceSpotlight />
      <TimelinePreview />
      <SearchSection />
    </>
  );
}
