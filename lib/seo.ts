import type { Metadata } from "next";

/** Base URL for canonical links and structured data. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingword.app";

export const SITE_NAME = "The Living Word";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

// ─── Metadata Helpers ────────────────────────────────────────

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: "summary" | "summary_large_image";
  noIndex?: boolean;
}

/**
 * Generate a complete Metadata object with OG, Twitter, and canonical URL.
 * Keeps all pages consistent with title template, descriptions, and tags.
 */
export function generatePageMetadata({
  title,
  description,
  path,
  ogType = "website",
  ogImage,
  ogImageAlt,
  twitterCard = "summary_large_image",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      type: ogType,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: ogImageAlt || title,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}

// ─── JSON-LD Structured Data Builders ────────────────────────

/** WebSite schema for the homepage. */
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Experience the King James Bible illuminated with historical art, archaeological evidence, interactive maps, and a built-in archaic word dictionary.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList schema from an array of breadcrumb items. */
export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Article / CreativeWork schema for scripture pages. */
export function buildArticleJsonLd(options: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description,
    url: `${SITE_URL}${options.path}`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(options.datePublished && {
      datePublished: options.datePublished,
    }),
  };
}

/** Render a JSON-LD script tag for embedding in pages. */
export function jsonLdScriptProps(data: Record<string, unknown>) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
