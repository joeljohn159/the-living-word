import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Static sitemap — no database queries at build time.
 * Covers all main pages. Individual resource pages (people, dictionary, etc.)
 * are server-rendered dynamically and discoverable via internal links.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/bible`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/dictionary`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/people`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/evidence`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/timeline`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/reading-plans`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/maps`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return staticPages;
}
