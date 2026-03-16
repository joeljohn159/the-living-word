import type { Metadata } from "next";
import Image from "next/image";
import {
  generatePageMetadata,
  buildBreadcrumbJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";
import { getAllMedia } from "@/lib/db/queries";

export const metadata: Metadata = generatePageMetadata({
  title: "Gallery",
  description:
    "Explore a curated gallery of classical paintings, illustrations, and artwork depicting scenes from the Bible by masters including Michelangelo, Rembrandt, Caravaggio, and Doré.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const artworks = await getAllMedia();

  return (
    <article className="pb-16">
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Gallery", path: "/gallery" },
          ])
        )}
      />

      {/* Hero Banner */}
      <header className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="font-source-sans text-xs uppercase tracking-[0.3em] text-gold mb-3">
            Gallery
          </p>
          <h1 className="heading text-3xl sm:text-4xl md:text-5xl text-gold mb-4">
            Biblical Artwork
          </h1>
          <p className="font-source-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Classical paintings and illustrations depicting scenes from
            Scripture, by the great masters of Western art.
          </p>
          <div
            className="mx-auto mt-6 h-px w-24 bg-gold/40"
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Gallery Grid */}
      <section
        className="py-12 sm:py-16"
        aria-labelledby="gallery-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="gallery-heading" className="sr-only">
            Artworks
          </h2>

          {artworks.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-source-sans text-muted-foreground text-lg">
                No artwork has been added yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((art) => (
                <GalleryCard key={art.id} artwork={art} />
              ))}
            </div>
          )}
        </div>
      </section>
    </article>
  );
}

interface GalleryCardProps {
  artwork: {
    id: number;
    title: string;
    description: string | null;
    artist: string | null;
    yearCreated: string | null;
    imageUrl: string | null;
    attribution: string | null;
    license: string | null;
    mediaType: string;
  };
}

function GalleryCard({ artwork }: GalleryCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-gold/40">
      {/* Image */}
      {artwork.imageUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={artwork.imageUrl}
            alt={`${artwork.title}${artwork.artist ? ` by ${artwork.artist}` : ""}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
          <span className="font-source-sans text-muted-foreground text-sm">
            No image available
          </span>
        </div>
      )}

      {/* Details */}
      <div className="p-4 space-y-2">
        <h3 className="font-cormorant text-lg font-semibold text-foreground leading-snug">
          {artwork.title}
        </h3>

        {(artwork.artist || artwork.yearCreated) && (
          <p className="font-source-sans text-sm text-gold">
            {artwork.artist}
            {artwork.artist && artwork.yearCreated && " \u00B7 "}
            {artwork.yearCreated}
          </p>
        )}

        {artwork.description && (
          <p className="font-source-sans text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {artwork.description}
          </p>
        )}

        {artwork.attribution && (
          <p className="font-source-sans text-xs text-muted-foreground/70">
            {artwork.attribution}
          </p>
        )}
      </div>
    </div>
  );
}
