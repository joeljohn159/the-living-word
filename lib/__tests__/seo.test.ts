import { describe, it, expect } from "vitest";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  generatePageMetadata,
  buildWebSiteJsonLd,
  buildBreadcrumbJsonLd,
  buildArticleJsonLd,
  jsonLdScriptProps,
} from "../seo";

describe("SEO constants", () => {
  it("exports a valid SITE_URL", () => {
    expect(SITE_URL).toBeDefined();
    expect(SITE_URL).toMatch(/^https?:\/\//);
  });

  it("exports SITE_NAME as 'The Living Word'", () => {
    expect(SITE_NAME).toBe("The Living Word");
  });

  it("exports DEFAULT_OG_IMAGE that includes SITE_URL", () => {
    expect(DEFAULT_OG_IMAGE).toContain(SITE_URL);
    expect(DEFAULT_OG_IMAGE).toMatch(/\.png$/);
  });
});

describe("generatePageMetadata", () => {
  it("generates correct metadata with required fields", () => {
    const meta = generatePageMetadata({
      title: "Bible Books",
      description: "Browse all 66 books",
      path: "/bible",
    });

    expect(meta.title).toBe("Bible Books");
    expect(meta.description).toBe("Browse all 66 books");
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/bible`);
  });

  it("includes Open Graph metadata with site name appended", () => {
    const meta = generatePageMetadata({
      title: "Genesis",
      description: "The book of Genesis",
      path: "/genesis",
    });

    const og = meta.openGraph as Record<string, unknown>;
    expect(og.title).toBe(`Genesis | ${SITE_NAME}`);
    expect(og.type).toBe("website");
    expect(og.siteName).toBe(SITE_NAME);
  });

  it("includes Twitter card metadata", () => {
    const meta = generatePageMetadata({
      title: "Search",
      description: "Search the Bible",
      path: "/search",
    });

    const twitter = meta.twitter as Record<string, unknown>;
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.title).toBe(`Search | ${SITE_NAME}`);
  });

  it("uses default OG image when none specified", () => {
    const meta = generatePageMetadata({
      title: "Test",
      description: "Test",
      path: "/test",
    });

    const og = meta.openGraph as { images: Array<{ url: string }> };
    expect(og.images[0].url).toBe(DEFAULT_OG_IMAGE);
  });

  it("uses custom OG image when specified", () => {
    const customImage = "https://example.com/image.jpg";
    const meta = generatePageMetadata({
      title: "Test",
      description: "Test",
      path: "/test",
      ogImage: customImage,
    });

    const og = meta.openGraph as { images: Array<{ url: string }> };
    expect(og.images[0].url).toBe(customImage);
  });

  it("sets noIndex robots when requested", () => {
    const meta = generatePageMetadata({
      title: "Private",
      description: "Private page",
      path: "/private",
      noIndex: true,
    });

    const robots = meta.robots as { index: boolean; follow: boolean };
    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(false);
  });

  it("does not include robots when noIndex is false (default)", () => {
    const meta = generatePageMetadata({
      title: "Public",
      description: "Public page",
      path: "/public",
    });

    expect(meta.robots).toBeUndefined();
  });
});

describe("buildWebSiteJsonLd", () => {
  it("returns valid WebSite schema", () => {
    const jsonLd = buildWebSiteJsonLd();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("WebSite");
    expect(jsonLd.name).toBe(SITE_NAME);
    expect(jsonLd.url).toBe(SITE_URL);
  });

  it("includes SearchAction potential action", () => {
    const jsonLd = buildWebSiteJsonLd();
    expect(jsonLd.potentialAction["@type"]).toBe("SearchAction");
    expect(jsonLd.potentialAction.target.urlTemplate).toContain("/search?q=");
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("returns valid BreadcrumbList schema", () => {
    const items = [
      { name: "Home", path: "/" },
      { name: "Bible", path: "/bible" },
      { name: "Genesis", path: "/genesis" },
    ];
    const jsonLd = buildBreadcrumbJsonLd(items);

    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
  });

  it("assigns correct positions starting from 1", () => {
    const items = [
      { name: "Home", path: "/" },
      { name: "Bible", path: "/bible" },
    ];
    const jsonLd = buildBreadcrumbJsonLd(items);

    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[1].position).toBe(2);
  });

  it("prepends SITE_URL to item paths", () => {
    const items = [{ name: "Bible", path: "/bible" }];
    const jsonLd = buildBreadcrumbJsonLd(items);

    expect(jsonLd.itemListElement[0].item).toBe(`${SITE_URL}/bible`);
  });

  it("handles empty breadcrumb list", () => {
    const jsonLd = buildBreadcrumbJsonLd([]);
    expect(jsonLd.itemListElement).toHaveLength(0);
  });
});

describe("buildArticleJsonLd", () => {
  it("returns valid Article schema", () => {
    const jsonLd = buildArticleJsonLd({
      title: "Genesis 1",
      description: "In the beginning...",
      path: "/genesis/1",
    });

    expect(jsonLd["@type"]).toBe("Article");
    expect(jsonLd.headline).toBe("Genesis 1");
    expect(jsonLd.url).toBe(`${SITE_URL}/genesis/1`);
  });

  it("includes publisher info", () => {
    const jsonLd = buildArticleJsonLd({
      title: "Test",
      description: "Test",
      path: "/test",
    });

    expect(jsonLd.publisher.name).toBe(SITE_NAME);
  });

  it("includes datePublished when provided", () => {
    const jsonLd = buildArticleJsonLd({
      title: "Test",
      description: "Test",
      path: "/test",
      datePublished: "2024-01-01",
    });

    expect(jsonLd.datePublished).toBe("2024-01-01");
  });

  it("omits datePublished when not provided", () => {
    const jsonLd = buildArticleJsonLd({
      title: "Test",
      description: "Test",
      path: "/test",
    });

    expect(jsonLd).not.toHaveProperty("datePublished");
  });
});

describe("jsonLdScriptProps", () => {
  it("returns correct script tag props", () => {
    const data = { "@type": "WebSite", name: "Test" };
    const props = jsonLdScriptProps(data);

    expect(props.type).toBe("application/ld+json");
    expect(props.dangerouslySetInnerHTML.__html).toBe(JSON.stringify(data));
  });

  it("serializes nested objects to JSON", () => {
    const data = {
      "@context": "https://schema.org",
      nested: { deep: true },
    };
    const props = jsonLdScriptProps(data);
    const parsed = JSON.parse(props.dangerouslySetInnerHTML.__html);

    expect(parsed.nested.deep).toBe(true);
  });
});
