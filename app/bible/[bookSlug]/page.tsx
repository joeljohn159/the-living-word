import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Landmark, MapPin, Users } from "lucide-react";
import { getBookBySlug } from "@/lib/db/queries";
import { BookHeader } from "@/components/scripture/BookHeader";
import { ChapterGrid } from "@/components/scripture/ChapterGrid";
import { PlaceholderSection } from "@/components/scripture/PlaceholderSection";

interface BookOverviewPageProps {
  params: { bookSlug: string };
}

/** Dynamic SEO metadata for each book. */
export async function generateMetadata({
  params,
}: BookOverviewPageProps): Promise<Metadata> {
  const book = await getBookBySlug(params.bookSlug);
  if (!book) return {};

  const title = `${book.name} KJV — Book Overview`;
  const description =
    book.description ??
    `Read the Book of ${book.name} in the King James Version. ${book.chapterCount} chapters of scripture with maps, art, and archaeological evidence.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | The Living Word`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${title} | The Living Word`,
      description,
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Bible",
            item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingword.app"}/bible`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: book.name,
            item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingword.app"}/bible/${book.slug}`,
          },
        ],
      }),
    },
  };
}

/**
 * Book Overview Page — server component displaying book metadata,
 * chapter navigation grid, and placeholder sections for related content.
 */
export default async function BookOverviewPage({
  params,
}: BookOverviewPageProps) {
  const book = await getBookBySlug(params.bookSlug);
  if (!book) notFound();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://thelivingword.app";

  return (
    <>
      {/* JSON-LD Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Bible",
                item: `${siteUrl}/bible`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: book.name,
                item: `${siteUrl}/bible/${book.slug}`,
              },
            ],
          }),
        }}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm font-source-sans text-muted-foreground">
            <li>
              <Link
                href="/bible"
                className="hover:text-gold transition-colors"
              >
                Bible
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <span className="text-foreground font-medium">{book.name}</span>
            </li>
          </ol>
        </nav>

        {/* Book heading + metadata */}
        <BookHeader
          name={book.name}
          category={book.category}
          testament={book.testament as "OT" | "NT"}
          author={book.author}
          dateWritten={book.dateWritten}
          keyThemes={book.keyThemes}
          description={book.description}
        />

        {/* Chapter navigation grid */}
        <ChapterGrid bookSlug={book.slug} chapterCount={book.chapterCount} />

        {/* Placeholder sections for future content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PlaceholderSection
            title="Archaeological Evidence"
            description="Discoveries and artifacts related to this book will appear here."
            icon={<Landmark className="h-4 w-4" />}
          />
          <PlaceholderSection
            title="Key People"
            description="Important figures mentioned in this book will appear here."
            icon={<Users className="h-4 w-4" />}
          />
          <PlaceholderSection
            title="Locations Map"
            description="An interactive map of places mentioned in this book will appear here."
            icon={<MapPin className="h-4 w-4" />}
          />
        </div>
      </section>
    </>
  );
}
