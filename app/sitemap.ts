import type { MetadataRoute } from "next";
import {
  getBooks,
  getSitemapChapters,
  getAllPeopleSlugs,
  getAllEvidenceSlugs,
  getAllDictionarySlugs,
} from "@/lib/db/queries";
import { SITE_URL } from "@/lib/seo";

/**
 * Generate sitemap index entries. Each ID maps to a group of URLs:
 * 0 = static pages + books
 * 1 = chapters
 * 2 = dictionary + people + evidence
 * 3+ = verse pages (batched by ~5000 per sitemap)
 */
export async function generateSitemaps() {
  const chapters = await getSitemapChapters();
  const totalVerses = chapters.reduce((sum, c) => sum + c.verseCount, 0);
  const verseSitemapCount = Math.ceil(totalVerses / 5000);

  const ids = [
    { id: 0 }, // static + books
    { id: 1 }, // chapters
    { id: 2 }, // dictionary + people + evidence
  ];

  for (let i = 0; i < verseSitemapCount; i++) {
    ids.push({ id: 3 + i });
  }

  return ids;
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  if (id === 0) return staticAndBooksSitemap();
  if (id === 1) return chaptersSitemap();
  if (id === 2) return collectionsSitemap();
  return versesSitemap(id - 3);
}

/** Sitemap 0: static pages + all 66 books. */
async function staticAndBooksSitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getBooks();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    {
      url: `${SITE_URL}/bible`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/dictionary`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/people`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/evidence`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/timeline`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/search`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/reading-plans`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const bookPages: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${SITE_URL}/bible/${book.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...bookPages];
}

/** Sitemap 1: all 1,189 chapters. */
async function chaptersSitemap(): Promise<MetadataRoute.Sitemap> {
  const chapters = await getSitemapChapters();

  return chapters.map((ch) => ({
    url: `${SITE_URL}/bible/${ch.bookSlug}/${ch.chapterNumber}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
}

/** Sitemap 2: dictionary words + people + evidence. */
async function collectionsSitemap(): Promise<MetadataRoute.Sitemap> {
  const [dictSlugs, peopleSlugs, evidenceSlugs] = await Promise.all([
    getAllDictionarySlugs(),
    getAllPeopleSlugs(),
    getAllEvidenceSlugs(),
  ]);

  const dictPages: MetadataRoute.Sitemap = dictSlugs.map((d) => ({
    url: `${SITE_URL}/dictionary/${d.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const peoplePages: MetadataRoute.Sitemap = peopleSlugs.map((p) => ({
    url: `${SITE_URL}/people/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const evidencePages: MetadataRoute.Sitemap = evidenceSlugs.map((e) => ({
    url: `${SITE_URL}/evidence/${e.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...dictPages, ...peoplePages, ...evidencePages];
}

/** Sitemap 3+: verse pages in batches of 5000. */
async function versesSitemap(
  batchIndex: number,
): Promise<MetadataRoute.Sitemap> {
  const chapters = await getSitemapChapters();
  const batchSize = 5000;
  const start = batchIndex * batchSize;

  // Flatten all verse URLs
  const allVerseEntries: MetadataRoute.Sitemap = [];
  for (const ch of chapters) {
    for (let v = 1; v <= ch.verseCount; v++) {
      allVerseEntries.push({
        url: `${SITE_URL}/bible/${ch.bookSlug}/${ch.chapterNumber}/${v}`,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return allVerseEntries.slice(start, start + batchSize);
}
