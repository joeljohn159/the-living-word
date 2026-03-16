/**
 * SEO Metadata, Sitemaps & Structured Data
 * =========================================
 *
 * Design specification for search engine optimization across The Living Word.
 *
 * ## Architecture
 *
 * ### lib/seo.ts — Central Helpers
 *
 * All SEO helpers live in `lib/seo.ts`:
 *
 * - `SITE_URL` — canonical base URL from `NEXT_PUBLIC_SITE_URL`
 * - `SITE_NAME` — "The Living Word"
 * - `DEFAULT_OG_IMAGE` — fallback Open Graph image (`/og-image.png`)
 * - `generatePageMetadata()` — builds a complete Next.js `Metadata` object
 * - `buildWebSiteJsonLd()` — WebSite schema with SearchAction
 * - `buildBreadcrumbJsonLd()` — BreadcrumbList schema from path items
 * - `buildArticleJsonLd()` — Article schema for content pages
 * - `jsonLdScriptProps()` — helper to render `<script type="application/ld+json">`
 *
 * ### Title Patterns
 *
 * Root layout uses template: `%s | The Living Word`
 * Default: "The Living Word — King James Bible with Maps, Art & Evidence"
 *
 * | Page                       | Title Pattern                                           |
 * |----------------------------|---------------------------------------------------------|
 * | Home                       | The Living Word — King James Bible with Maps, Art & ... |
 * | Bible Browser              | Browse the Bible                                        |
 * | Book Overview              | {BookName} KJV — Book Overview                          |
 * | Chapter                    | {BookName} {Chapter} KJV — Read Chapter                 |
 * | Verse                      | {BookName} {Ch}:{V} KJV — {preview...}                  |
 * | Dictionary Index           | KJV Bible Dictionary — Archaic Words Defined             |
 * | Dictionary Word            | What does "{word}" mean in the KJV Bible?                |
 * | People Index               | People of the Bible                                     |
 * | Person Profile             | {Name} — Biblical Figure                                |
 * | Evidence Gallery           | Archaeological Evidence                                  |
 * | Evidence Detail            | {Title}                                                 |
 * | Timeline                   | Biblical Timeline                                       |
 * | Search                     | Search the Bible (noindex)                               |
 * | Reading Plans              | Reading Plans                                           |
 * | Reading Plan Detail        | {Plan Name}                                             |
 *
 * ### Meta Descriptions (150-160 chars target)
 *
 * Every page has a unique description. Dynamic pages construct descriptions
 * from entity data (book names, verse text, person descriptions, etc.).
 *
 * ### Canonical URLs
 *
 * Set via `alternates.canonical` in every `generatePageMetadata()` call.
 * Format: `{SITE_URL}{path}` — always absolute.
 *
 * ### Open Graph Tags
 *
 * Every page includes:
 * - `og:title` — "{Page Title} | The Living Word"
 * - `og:description` — same as meta description
 * - `og:image` — default og-image.png or entity-specific image
 * - `og:url` — canonical URL
 * - `og:type` — "website" for index pages, "article" for content pages
 * - `og:site_name` — "The Living Word"
 *
 * ### Twitter Card Tags
 *
 * Every page includes:
 * - `twitter:card` — "summary_large_image"
 * - `twitter:title` — same as og:title
 * - `twitter:description` — same as meta description
 * - `twitter:image` — same as og:image
 *
 * ## Structured Data (JSON-LD)
 *
 * ### WebSite (root layout)
 * ```json
 * {
 *   "@type": "WebSite",
 *   "name": "The Living Word",
 *   "url": "https://thelivingword.app",
 *   "potentialAction": {
 *     "@type": "SearchAction",
 *     "target": "https://thelivingword.app/search?q={search_term_string}"
 *   }
 * }
 * ```
 *
 * ### BreadcrumbList (all navigable pages)
 * ```json
 * {
 *   "@type": "BreadcrumbList",
 *   "itemListElement": [
 *     { "@type": "ListItem", "position": 1, "name": "Home", "item": "..." },
 *     { "@type": "ListItem", "position": 2, "name": "Bible", "item": "..." },
 *     ...
 *   ]
 * }
 * ```
 *
 * ### Article (chapter pages, evidence detail, person profiles)
 * ```json
 * {
 *   "@type": "Article",
 *   "headline": "...",
 *   "description": "...",
 *   "url": "...",
 *   "publisher": { "@type": "Organization", "name": "The Living Word" }
 * }
 * ```
 *
 * ### CreativeWork (individual verse pages)
 * ```json
 * {
 *   "@type": "CreativeWork",
 *   "name": "Genesis 1:1 (KJV)",
 *   "text": "In the beginning God created...",
 *   "isPartOf": { "@type": "Book", "name": "King James Version" }
 * }
 * ```
 *
 * ### DefinedTerm / DefinedTermSet (dictionary pages)
 * ```json
 * {
 *   "@type": "DefinedTerm",
 *   "name": "Verily",
 *   "description": "Truly; certainly; in truth.",
 *   "inDefinedTermSet": { "@type": "DefinedTermSet", "name": "KJV Bible Dictionary" }
 * }
 * ```
 *
 * ## Sitemap (app/sitemap.ts)
 *
 * Dynamic sitemap index with multiple sitemaps:
 *
 * | Sitemap | Contents                                | Approx URLs |
 * |---------|-----------------------------------------|-------------|
 * | 0       | Static pages + 66 books                 | ~74         |
 * | 1       | 1,189 chapters                          | 1,189       |
 * | 2       | Dictionary + People + Evidence           | ~500        |
 * | 3-9     | 31,102 verse pages (batches of 5,000)   | 31,102      |
 *
 * Priority mapping:
 * - Homepage: 1.0
 * - Bible browser: 0.9
 * - Section indexes (dictionary, people, evidence): 0.8
 * - Books: 0.8
 * - Chapters, timeline, reading plans: 0.7
 * - Detail pages (words, people, evidence): 0.6
 * - Search: 0.6
 * - Individual verses: 0.5
 *
 * ## Robots (app/robots.ts)
 *
 * ```
 * User-agent: *
 * Allow: /
 * Disallow: /api/
 * Sitemap: https://thelivingword.app/sitemap.xml
 * ```
 *
 * ## Default OG Image
 *
 * Located at `public/og-image.png` (1200×630).
 * Dark background (#1a1a2e) with gold accent band (#C4975C).
 * Used as fallback for all pages without entity-specific images.
 *
 * ## File Structure
 *
 * ```
 * lib/seo.ts                              ← metadata helpers + JSON-LD builders
 * app/layout.tsx                           ← root metadata + WebSite JSON-LD
 * app/sitemap.ts                           ← dynamic sitemap index
 * app/robots.ts                            ← robots.txt generation
 * app/page.tsx                             ← homepage metadata
 * app/bible/page.tsx                       ← bible index metadata + breadcrumb
 * app/bible/[bookSlug]/page.tsx            ← book metadata + breadcrumb
 * app/bible/[bookSlug]/[chapter]/page.tsx  ← chapter metadata + breadcrumb + article
 * app/bible/.../[verse]/page.tsx           ← verse metadata + CreativeWork + breadcrumb
 * app/dictionary/page.tsx                  ← dictionary metadata + DefinedTermSet
 * app/dictionary/[word]/page.tsx           ← word metadata + DefinedTerm + breadcrumb
 * app/people/page.tsx                      ← people index metadata + breadcrumb
 * app/people/[slug]/page.tsx               ← person metadata + article + breadcrumb
 * app/evidence/page.tsx                    ← evidence index metadata + breadcrumb
 * app/evidence/[slug]/page.tsx             ← evidence metadata + article + breadcrumb
 * app/timeline/page.tsx                    ← timeline metadata + breadcrumb
 * app/search/layout.tsx                    ← search metadata (noindex)
 * app/reading-plans/page.tsx               ← plans metadata + breadcrumb
 * app/reading-plans/[slug]/page.tsx        ← plan metadata + breadcrumb
 * public/og-image.png                      ← default Open Graph image
 * ```
 */

export default {};
